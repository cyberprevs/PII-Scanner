# =========================================================================
# Script: BuildWebApp.ps1
# Description: Build et package de l'application web PII Scanner
# =========================================================================

Write-Host "===============================================================================" -ForegroundColor Cyan
Write-Host "           Build Application Web - PII Scanner" -ForegroundColor Cyan
Write-Host "===============================================================================" -ForegroundColor Cyan
Write-Host ""

$RootDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$UIDir = Join-Path $RootDir "pii-scanner-ui"
$APIDir = Join-Path $RootDir "PiiScanner.Api"
$WWWRootDir = Join-Path $APIDir "wwwroot"
$PublishDir = Join-Path $APIDir "bin\Release\net8.0\win-x64\publish"
$OutputDir = Join-Path $RootDir "PII-Scanner-WebApp"

Write-Host "[INFO] Repertoire racine: $RootDir" -ForegroundColor Gray
Write-Host ""

# =========================================================================
# ETAPE 1: Build React
# =========================================================================
Write-Host "===============================================================================" -ForegroundColor Cyan
Write-Host "ETAPE 1/4 : Build de l'interface React" -ForegroundColor Cyan
Write-Host "===============================================================================" -ForegroundColor Cyan
Write-Host ""

Set-Location $UIDir

Write-Host "-> npm run build" -ForegroundColor Yellow
$buildOutput = npm run build 2>&1
if ($LASTEXITCODE -ne 0) {
    Write-Host "[ERREUR] Echec du build React" -ForegroundColor Red
    Write-Host $buildOutput -ForegroundColor Red
    exit 1
}

Write-Host "[OK] Build React termine" -ForegroundColor Green
Write-Host ""

# =========================================================================
# ETAPE 2: Copier le build dans wwwroot
# =========================================================================
Write-Host "===============================================================================" -ForegroundColor Cyan
Write-Host "ETAPE 2/4 : Copie du build React dans wwwroot" -ForegroundColor Cyan
Write-Host "===============================================================================" -ForegroundColor Cyan
Write-Host ""

# Créer le dossier wwwroot s'il n'existe pas
if (-not (Test-Path $WWWRootDir)) {
    New-Item -ItemType Directory -Path $WWWRootDir | Out-Null
}

# Supprimer l'ancien contenu
Write-Host "-> Nettoyage de wwwroot..." -ForegroundColor Yellow
Remove-Item -Path "$WWWRootDir\*" -Recurse -Force -ErrorAction SilentlyContinue

# Copier le nouveau build
Write-Host "-> Copie des fichiers..." -ForegroundColor Yellow
$DistDir = Join-Path $UIDir "dist"
Copy-Item -Path "$DistDir\*" -Destination $WWWRootDir -Recurse -Force

Write-Host "[OK] Fichiers copies dans wwwroot" -ForegroundColor Green
Write-Host ""

# =========================================================================
# ETAPE 3: Publier l'API .NET (self-contained)
# =========================================================================
Write-Host "===============================================================================" -ForegroundColor Cyan
Write-Host "ETAPE 3/4 : Publication de l'API .NET" -ForegroundColor Cyan
Write-Host "===============================================================================" -ForegroundColor Cyan
Write-Host ""

Set-Location $APIDir

Write-Host "-> dotnet publish -c Release -r win-x64 --self-contained true" -ForegroundColor Yellow
dotnet publish -c Release -r win-x64 --self-contained true

if ($LASTEXITCODE -ne 0) {
    Write-Host "[ERREUR] Echec de la publication" -ForegroundColor Red
    exit 1
}

Write-Host "[OK] Publication terminee" -ForegroundColor Green
Write-Host ""

# =========================================================================
# ETAPE 4: Créer le package final
# =========================================================================
Write-Host "===============================================================================" -ForegroundColor Cyan
Write-Host "ETAPE 4/4 : Creation du package final" -ForegroundColor Cyan
Write-Host "===============================================================================" -ForegroundColor Cyan
Write-Host ""

# Supprimer l'ancien package s'il existe
if (Test-Path $OutputDir) {
    Write-Host "-> Suppression de l'ancien package..." -ForegroundColor Yellow
    Remove-Item -Path $OutputDir -Recurse -Force
}

# Créer le nouveau dossier
New-Item -ItemType Directory -Path $OutputDir | Out-Null

# Copier les fichiers publiés
Write-Host "-> Copie de l'application publiee..." -ForegroundColor Yellow
Copy-Item -Path "$PublishDir\*" -Destination $OutputDir -Recurse -Force

Write-Host "[OK] Package cree: $OutputDir" -ForegroundColor Green
Write-Host ""

# =========================================================================
# Créer un script de démarrage
# =========================================================================
$StartScript = @"
@echo off
chcp 65001 >nul
title PII Scanner - Application Web

echo ===============================================================================
echo                  PII SCANNER - Application Web
echo ===============================================================================
echo.
echo [INFO] Demarrage de l'application...
echo.
echo L'application sera accessible sur:
echo   - HTTPS: https://localhost:5001
echo   - HTTP:  http://localhost:5000
echo.
echo Ouvrez votre navigateur et allez sur: https://localhost:5001
echo.
echo ===============================================================================
echo.

REM Démarrer l'application
PiiScanner.Api.exe

pause
"@

$StartScriptPath = Join-Path $OutputDir "Demarrer PII Scanner.bat"
Set-Content -Path $StartScriptPath -Value $StartScript -Encoding UTF8

Write-Host "[OK] Script de demarrage cree: Demarrer PII Scanner.bat" -ForegroundColor Green
Write-Host ""

# =========================================================================
# Résumé
# =========================================================================
Write-Host "===============================================================================" -ForegroundColor Green
Write-Host "                    BUILD TERMINE AVEC SUCCES!" -ForegroundColor Green
Write-Host "===============================================================================" -ForegroundColor Green
Write-Host ""
Write-Host "Package cree:" -ForegroundColor Cyan
Write-Host "   $OutputDir" -ForegroundColor White
Write-Host ""
Write-Host "Pour tester l'application:" -ForegroundColor Cyan
Write-Host "   1. Allez dans: $OutputDir" -ForegroundColor White
Write-Host "   2. Double-clic sur: Demarrer PII Scanner.bat" -ForegroundColor White
Write-Host "   3. Ouvrez votre navigateur: https://localhost:5001" -ForegroundColor White
Write-Host ""
Write-Host "Taille totale:" -ForegroundColor Cyan
$Size = (Get-ChildItem $OutputDir -Recurse | Measure-Object -Property Length -Sum).Sum / 1MB
Write-Host "   $([math]::Round($Size, 2)) MB" -ForegroundColor White
Write-Host ""
Write-Host "===============================================================================" -ForegroundColor Green
Write-Host ""

# Retour au dossier racine
Set-Location $RootDir

Write-Host "Appuyez sur Entree pour quitter..." -ForegroundColor Gray
Read-Host
