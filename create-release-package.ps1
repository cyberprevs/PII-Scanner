# Script de création du package de release PII Scanner v1.0.0
# Génère un ZIP prêt à l'emploi avec backend compilé et frontend buildé

param(
    [string]$Version = "1.0.0",
    [string]$OutputDir = "releases"
)

Write-Host "🚀 Création du package PII Scanner v$Version" -ForegroundColor Cyan
Write-Host ""

# Créer le dossier de sortie
$releaseFolder = "$OutputDir\PII-Scanner-v$Version"
$zipFile = "$OutputDir\PII-Scanner-v$Version.zip"

if (Test-Path $releaseFolder) {
    Write-Host "🗑️  Nettoyage de l'ancien package..." -ForegroundColor Yellow
    Remove-Item -Recurse -Force $releaseFolder
}

if (Test-Path $zipFile) {
    Remove-Item -Force $zipFile
}

New-Item -ItemType Directory -Force -Path $releaseFolder | Out-Null
New-Item -ItemType Directory -Force -Path $OutputDir | Out-Null

Write-Host "✅ Dossier de sortie créé : $releaseFolder" -ForegroundColor Green
Write-Host ""

# 1. Compiler le backend
Write-Host "🔨 Compilation du backend .NET..." -ForegroundColor Cyan
Push-Location PiiScanner.Api
dotnet publish -c Release -o "../$releaseFolder/backend" --self-contained false
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Erreur lors de la compilation du backend" -ForegroundColor Red
    Pop-Location
    exit 1
}
Pop-Location
Write-Host "✅ Backend compilé avec succès" -ForegroundColor Green
Write-Host ""

# 2. Builder le frontend
Write-Host "🔨 Build du frontend React..." -ForegroundColor Cyan
Push-Location pii-scanner-ui
npm run build
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Erreur lors du build du frontend" -ForegroundColor Red
    Pop-Location
    exit 1
}

# Copier le frontend buildé dans le backend
Copy-Item -Path "dist\*" -Destination "../$releaseFolder/backend/wwwroot/" -Recurse -Force
Pop-Location
Write-Host "✅ Frontend buildé avec succès" -ForegroundColor Green
Write-Host ""

# 3. Copier les fichiers de configuration
Write-Host "📄 Copie des fichiers de configuration..." -ForegroundColor Cyan
Copy-Item "PiiScanner.Api/appsettings.json" "$releaseFolder/backend/" -Force
Copy-Item "PiiScanner.Api/appsettings.Production.json" "$releaseFolder/backend/" -Force -ErrorAction SilentlyContinue
Write-Host "✅ Fichiers de configuration copiés" -ForegroundColor Green
Write-Host ""

# 4. Copier la documentation
Write-Host "📚 Copie de la documentation..." -ForegroundColor Cyan
$docs = @(
    "README.md",
    "INSTALLATION.md",
    "SECURITY.md",
    "FEATURES.md",
    "CHANGELOG.md",
    "LICENSE",
    "RELEASE_V1.0.0.md"
)

foreach ($doc in $docs) {
    if (Test-Path $doc) {
        Copy-Item $doc "$releaseFolder/" -Force
    }
}
Write-Host "✅ Documentation copiée" -ForegroundColor Green
Write-Host ""

# 5. Créer un fichier de démarrage rapide
Write-Host "📝 Création du guide de démarrage rapide..." -ForegroundColor Cyan
$quickStart = @"
# PII Scanner v$Version - Guide de démarrage rapide

## Prérequis
- .NET 9.0 Runtime (pas besoin du SDK)
- Windows 10/11 ou Windows Server 2016+

## Installation

### 1. Installer .NET 9.0 Runtime
Téléchargez et installez : https://dotnet.microsoft.com/download/dotnet/9.0

### 2. Lancer l'application

**Windows :**
```
cd backend
PiiScanner.Api.exe
```

**Linux/Mac :**
```
cd backend
dotnet PiiScanner.Api.dll
```

L'application sera accessible sur : https://localhost:5001

### 3. Première connexion

- URL : https://localhost:5001
- Utilisateur : admin
- Mot de passe : Admin@123456

⚠️ **IMPORTANT** : Changez le mot de passe admin dès la première connexion !

## Configuration

Éditez le fichier ``appsettings.json`` pour :
- Changer le secret JWT (obligatoire en production)
- Configurer le port d'écoute
- Modifier les paramètres de rétention des données

## Documentation complète

Consultez README.md et INSTALLATION.md pour plus de détails.

## Support

- Documentation : https://github.com/cyberprevs/PII-Scanner
- Issues : https://github.com/cyberprevs/PII-Scanner/issues
- Sécurité : https://github.com/cyberprevs/PII-Scanner/security

---
Version : $Version
Date : $(Get-Date -Format "dd/MM/yyyy")
Développé par Cyberprevs
"@

Set-Content -Path "$releaseFolder/QUICKSTART.md" -Value $quickStart -Encoding UTF8
Write-Host "✅ Guide de démarrage rapide créé" -ForegroundColor Green
Write-Host ""

# 6. Créer l'archive ZIP
Write-Host "📦 Création de l'archive ZIP..." -ForegroundColor Cyan
Compress-Archive -Path "$releaseFolder\*" -DestinationPath $zipFile -Force
Write-Host "✅ Archive créée : $zipFile" -ForegroundColor Green
Write-Host ""

# 7. Calculer les checksums
Write-Host "🔐 Calcul des checksums..." -ForegroundColor Cyan
$sha256 = Get-FileHash -Path $zipFile -Algorithm SHA256
$md5 = Get-FileHash -Path $zipFile -Algorithm MD5

$checksums = @"
# PII Scanner v$Version - Checksums

## Fichier : $(Split-Path -Leaf $zipFile)

**SHA256:**
``````
$($sha256.Hash)
``````

**MD5:**
``````
$($md5.Hash)
``````

**Taille:** $([math]::Round((Get-Item $zipFile).Length / 1MB, 2)) MB

---
Généré le : $(Get-Date -Format "dd/MM/yyyy HH:mm:ss")
"@

Set-Content -Path "$OutputDir/CHECKSUMS.txt" -Value $checksums -Encoding UTF8
Write-Host "✅ Checksums calculés et sauvegardés" -ForegroundColor Green
Write-Host ""

# Résumé
Write-Host "════════════════════════════════════════════════════════" -ForegroundColor Green
Write-Host "✅ Package de release créé avec succès !" -ForegroundColor Green
Write-Host "════════════════════════════════════════════════════════" -ForegroundColor Green
Write-Host ""
Write-Host "📦 Archive : $zipFile" -ForegroundColor Cyan
Write-Host "📏 Taille : $([math]::Round((Get-Item $zipFile).Length / 1MB, 2)) MB" -ForegroundColor Cyan
Write-Host "🔐 Checksums : $OutputDir/CHECKSUMS.txt" -ForegroundColor Cyan
Write-Host ""
Write-Host "Prochaines etapes :" -ForegroundColor Yellow
Write-Host "  1. Testez le package" -ForegroundColor White
Write-Host "  2. Uploadez le ZIP sur GitHub Release" -ForegroundColor White
Write-Host "  3. Copiez les checksums dans la description" -ForegroundColor White
Write-Host ""
