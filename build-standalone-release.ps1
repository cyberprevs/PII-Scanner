# Script pour creer un package standalone Windows (self-contained)
# Inclut le runtime .NET - aucune installation necessaire

param(
    [string]$Version = "1.0.0",
    [string]$OutputDir = "releases"
)

Write-Host "Creation du package standalone PII Scanner v$Version" -ForegroundColor Cyan
Write-Host "Ce package inclut le runtime .NET - aucune installation requise !" -ForegroundColor Green
Write-Host ""

# Creer le dossier de sortie
$releaseFolder = "$OutputDir\PII-Scanner-v$Version-Windows-Standalone"
$zipFile = "$OutputDir\PII-Scanner-v$Version-Windows-Standalone.zip"

if (Test-Path $releaseFolder) {
    Remove-Item -Recurse -Force $releaseFolder
}
if (Test-Path $zipFile) {
    Remove-Item -Force $zipFile
}

New-Item -ItemType Directory -Force -Path $releaseFolder | Out-Null
New-Item -ItemType Directory -Force -Path $OutputDir | Out-Null

Write-Host "Dossier cree : $releaseFolder" -ForegroundColor Green
Write-Host ""

# 1. Compiler le backend en SELF-CONTAINED (inclut le runtime .NET)
Write-Host "Compilation du backend .NET en mode self-contained..." -ForegroundColor Cyan
Write-Host "(Cela prend quelques minutes car le runtime .NET est inclus)" -ForegroundColor Yellow
Push-Location PiiScanner.Api

dotnet publish -c Release -o "../$releaseFolder" `
    --self-contained true `
    -r win-x64 `
    -p:PublishSingleFile=false `
    -p:PublishReadyToRun=true

if ($LASTEXITCODE -ne 0) {
    Write-Host "Erreur lors de la compilation du backend" -ForegroundColor Red
    Pop-Location
    exit 1
}
Pop-Location
Write-Host "Backend compile avec runtime inclus" -ForegroundColor Green
Write-Host ""

# 2. Builder le frontend
Write-Host "Build du frontend React..." -ForegroundColor Cyan
Push-Location pii-scanner-ui
npm run build
if ($LASTEXITCODE -ne 0) {
    Write-Host "Erreur lors du build du frontend" -ForegroundColor Red
    Pop-Location
    exit 1
}

# Copier le frontend
Copy-Item -Path "dist\*" -Destination "../$releaseFolder/wwwroot/" -Recurse -Force
Pop-Location
Write-Host "Frontend build et copie" -ForegroundColor Green
Write-Host ""

# 3. Copier la documentation
Write-Host "Copie de la documentation..." -ForegroundColor Cyan
$docs = @("README.md", "INSTALLATION.md", "SECURITY.md", "FEATURES.md", "CHANGELOG.md", "LICENSE", "RELEASE_V1.0.0.md")
foreach ($doc in $docs) {
    if (Test-Path $doc) {
        Copy-Item $doc "$releaseFolder/" -Force
    }
}
Write-Host "Documentation copiee" -ForegroundColor Green
Write-Host ""

# 4. Creer les fichiers de lancement
Write-Host "Creation des fichiers de lancement..." -ForegroundColor Cyan

# Creer START.bat
$startBat = @"
@echo off
set ASPNETCORE_ENVIRONMENT=Production
start http://localhost:5000
PiiScanner.Api.exe
"@
Set-Content -Path "$releaseFolder/START.bat" -Value $startBat -Encoding ASCII

# Creer aussi START.cmd (alternative)
Set-Content -Path "$releaseFolder/START.cmd" -Value $startBat -Encoding ASCII

Write-Host "Fichiers START.bat et START.cmd crees" -ForegroundColor Green
Write-Host ""

# 5. Creer un README simplifie
$readmeQuick = @"
# PII Scanner v$Version - Version Standalone Windows

## Demarrage rapide

### 1. Extraire le ZIP
Extraire tous les fichiers dans un dossier de votre choix

### 2. Lancer l'application
Double-cliquer sur : PiiScanner.Api.exe

Alternative : START.bat ou START.cmd

### 3. Ouvrir le navigateur
Ouvrir : http://localhost:5000

Au premier lancement, vous devez CREER un compte administrateur :
- Cliquez sur "S'inscrire"
- Remplissez le formulaire d'inscription
- Le premier compte cree devient automatiquement administrateur

IMPORTANT : Notez bien vos identifiants !

## Mode HTTP vs HTTPS

Par defaut, l'application fonctionne en HTTP (port 5000).
Compatible Windows Server et Windows 10/11.

### Activer HTTPS (optionnel)

1. Ouvrir PowerShell en ADMINISTRATEUR et executer :

`$cert = New-SelfSignedCertificate -DnsName "localhost" -CertStoreLocation "cert:\LocalMachine\My" -NotAfter (Get-Date).AddYears(5)
`$store = New-Object System.Security.Cryptography.X509Certificates.X509Store "Root", "LocalMachine"
`$store.Open("ReadWrite")
`$store.Add(`$cert)
`$store.Close()

2. Modifier appsettings.Production.json :
   "Security": { "UseHttpsOnly": true }

3. Relancer START.bat -> https://localhost:5001

## Caracteristiques

- Version standalone : Aucune installation requise !
- Runtime .NET 9.0 inclus
- Pret a l'emploi
- Taille : ~73 MB (avec runtime)

## Configuration

Editer le fichier appsettings.Production.json pour :
- Activer/desactiver HTTPS
- Modifier le secret JWT (OBLIGATOIRE en production)

## Documentation complete

Consultez README.md et INSTALLATION.md pour la documentation complete

## Support

- GitHub : https://github.com/cyberprevs/PII-Scanner
- Issues : https://github.com/cyberprevs/PII-Scanner/issues

Version : $Version
Date : $(Get-Date -Format "dd/MM/yyyy")
Developpe par Cyberprevs
"@

Set-Content -Path "$releaseFolder/LISEZMOI-DEMARRAGE-RAPIDE.txt" -Value $readmeQuick -Encoding UTF8
Write-Host "Guide de demarrage rapide cree" -ForegroundColor Green
Write-Host ""

# 6. Creer l'archive ZIP
Write-Host "Creation de l'archive ZIP..." -ForegroundColor Cyan
Write-Host "(Cela peut prendre quelques minutes car le fichier est volumineux)" -ForegroundColor Yellow
Compress-Archive -Path "$releaseFolder\*" -DestinationPath $zipFile -Force
Write-Host "Archive creee : $zipFile" -ForegroundColor Green
Write-Host ""

# 7. Calculer les checksums
Write-Host "Calcul des checksums..." -ForegroundColor Cyan
$sha256 = Get-FileHash -Path $zipFile -Algorithm SHA256
$md5 = Get-FileHash -Path $zipFile -Algorithm MD5

$checksums = @"
# PII Scanner v$Version - Checksums (Standalone Windows)

Fichier : $(Split-Path -Leaf $zipFile)

SHA256:
$($sha256.Hash)

MD5:
$($md5.Hash)

Taille: $([math]::Round((Get-Item $zipFile).Length / 1MB, 2)) MB

Caracteristiques:
- Version standalone (self-contained)
- Runtime .NET 9.0 inclus
- Aucune installation requise
- Compatible Windows 10/11 et Windows Server 2016+

Genere le : $(Get-Date -Format "dd/MM/yyyy HH:mm:ss")
"@

Set-Content -Path "$OutputDir/CHECKSUMS-STANDALONE.txt" -Value $checksums -Encoding UTF8
Write-Host "Checksums calcules" -ForegroundColor Green
Write-Host ""

# Resume
Write-Host "================================================" -ForegroundColor Green
Write-Host "Package STANDALONE cree avec succes !" -ForegroundColor Green
Write-Host "================================================" -ForegroundColor Green
Write-Host ""
Write-Host "Archive : $zipFile" -ForegroundColor Cyan
Write-Host "Taille : $([math]::Round((Get-Item $zipFile).Length / 1MB, 2)) MB" -ForegroundColor Cyan
Write-Host "Checksums : $OutputDir/CHECKSUMS-STANDALONE.txt" -ForegroundColor Cyan
Write-Host ""
Write-Host "Type de package : STANDALONE (self-contained)" -ForegroundColor Yellow
Write-Host "- Runtime .NET inclus" -ForegroundColor White
Write-Host "- Aucune installation requise" -ForegroundColor White
Write-Host "- Double-clic sur START.bat pour lancer" -ForegroundColor White
Write-Host ""
Write-Host "Prochaines etapes :" -ForegroundColor Yellow
Write-Host "  1. Testez : Extraire le ZIP et lancer START.bat" -ForegroundColor White
Write-Host "  2. Uploadez sur GitHub Release" -ForegroundColor White
Write-Host "  3. Ajoutez les checksums a la description" -ForegroundColor White
Write-Host ""
