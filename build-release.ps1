# Script de creation du package de release PII Scanner v1.0.0
param(
    [string]$Version = "1.0.0",
    [string]$OutputDir = "releases"
)

Write-Host "Creation du package PII Scanner v$Version" -ForegroundColor Cyan

# Creer le dossier de sortie
$releaseFolder = "$OutputDir\PII-Scanner-v$Version"
$zipFile = "$OutputDir\PII-Scanner-v$Version.zip"

if (Test-Path $releaseFolder) {
    Remove-Item -Recurse -Force $releaseFolder
}
if (Test-Path $zipFile) {
    Remove-Item -Force $zipFile
}

New-Item -ItemType Directory -Force -Path $releaseFolder | Out-Null
New-Item -ItemType Directory -Force -Path $OutputDir | Out-Null

Write-Host "Dossier cree : $releaseFolder" -ForegroundColor Green

# 1. Compiler le backend
Write-Host "Compilation du backend .NET..." -ForegroundColor Cyan
Push-Location PiiScanner.Api
dotnet publish -c Release -o "../$releaseFolder/backend" --self-contained false
if ($LASTEXITCODE -ne 0) {
    Write-Host "Erreur lors de la compilation du backend" -ForegroundColor Red
    Pop-Location
    exit 1
}
Pop-Location
Write-Host "Backend compile" -ForegroundColor Green

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
Copy-Item -Path "dist\*" -Destination "../$releaseFolder/backend/wwwroot/" -Recurse -Force
Pop-Location
Write-Host "Frontend build" -ForegroundColor Green

# 3. Copier les fichiers de configuration
Write-Host "Copie des fichiers de configuration..." -ForegroundColor Cyan
Copy-Item "PiiScanner.Api/appsettings.json" "$releaseFolder/backend/" -Force
Copy-Item "PiiScanner.Api/appsettings.Production.json" "$releaseFolder/backend/" -Force -ErrorAction SilentlyContinue

# 4. Copier la documentation
Write-Host "Copie de la documentation..." -ForegroundColor Cyan
$docs = @("README.md", "INSTALLATION.md", "SECURITY.md", "FEATURES.md", "CHANGELOG.md", "LICENSE", "RELEASE_V1.0.0.md")
foreach ($doc in $docs) {
    if (Test-Path $doc) {
        Copy-Item $doc "$releaseFolder/" -Force
    }
}

# 5. Creer un fichier de demarrage rapide
$quickStart = @"
# PII Scanner v$Version - Guide de demarrage rapide

## Prerequis
- .NET 9.0 Runtime
- Windows 10/11 ou Windows Server 2016+

## Installation

### 1. Installer .NET 9.0 Runtime
Telechargez : https://dotnet.microsoft.com/download/dotnet/9.0

### 2. Lancer l'application

Windows :
  cd backend
  PiiScanner.Api.exe

Linux/Mac :
  cd backend
  dotnet PiiScanner.Api.dll

L'application sera accessible sur : https://localhost:5001

### 3. Premiere connexion

- URL : https://localhost:5001
- Utilisateur : admin
- Mot de passe : Admin@123456

IMPORTANT : Changez le mot de passe admin !

## Documentation

Consultez README.md et INSTALLATION.md

## Support

- Documentation : https://github.com/cyberprevs/PII-Scanner
- Issues : https://github.com/cyberprevs/PII-Scanner/issues

Version : $Version
Date : $(Get-Date -Format "dd/MM/yyyy")
Developpe par Cyberprevs
"@

Set-Content -Path "$releaseFolder/QUICKSTART.md" -Value $quickStart -Encoding UTF8

# 6. Creer l'archive ZIP
Write-Host "Creation de l'archive ZIP..." -ForegroundColor Cyan
Compress-Archive -Path "$releaseFolder\*" -DestinationPath $zipFile -Force
Write-Host "Archive creee : $zipFile" -ForegroundColor Green

# 7. Calculer les checksums
Write-Host "Calcul des checksums..." -ForegroundColor Cyan
$sha256 = Get-FileHash -Path $zipFile -Algorithm SHA256
$md5 = Get-FileHash -Path $zipFile -Algorithm MD5

$checksums = @"
# PII Scanner v$Version - Checksums

Fichier : $(Split-Path -Leaf $zipFile)

SHA256:
$($sha256.Hash)

MD5:
$($md5.Hash)

Taille: $([math]::Round((Get-Item $zipFile).Length / 1MB, 2)) MB

Genere le : $(Get-Date -Format "dd/MM/yyyy HH:mm:ss")
"@

Set-Content -Path "$OutputDir/CHECKSUMS.txt" -Value $checksums -Encoding UTF8

# Resume
Write-Host ""
Write-Host "================================================" -ForegroundColor Green
Write-Host "Package de release cree avec succes !" -ForegroundColor Green
Write-Host "================================================" -ForegroundColor Green
Write-Host ""
Write-Host "Archive : $zipFile" -ForegroundColor Cyan
Write-Host "Taille : $([math]::Round((Get-Item $zipFile).Length / 1MB, 2)) MB" -ForegroundColor Cyan
Write-Host "Checksums : $OutputDir/CHECKSUMS.txt" -ForegroundColor Cyan
Write-Host ""
Write-Host "Prochaines etapes :" -ForegroundColor Yellow
Write-Host "  1. Testez le package" -ForegroundColor White
Write-Host "  2. Uploadez le ZIP sur GitHub Release" -ForegroundColor White
Write-Host "  3. Copiez les checksums dans la description" -ForegroundColor White
Write-Host ""
