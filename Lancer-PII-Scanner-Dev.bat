@echo off
chcp 65001 > nul
title PII Scanner - Lancement développement
color 0A

echo.
echo ╔══════════════════════════════════════════════════════════════════════╗
echo ║                    PII SCANNER v1.0.0                                ║
echo ║              Détecteur de Données Personnelles                       ║
echo ║                  Conforme Loi APDP Bénin                             ║
echo ╚══════════════════════════════════════════════════════════════════════╝
echo.
echo [1/2] Démarrage de l'API Backend...
echo.

REM Démarrer l'API en arrière-plan
cd /d "%~dp0PiiScanner.Api"
start "PII Scanner API" /MIN cmd /c "dotnet run"

echo ✓ API en cours de démarrage sur https://localhost:5001
echo.
echo [2/2] Attente du démarrage de l'API (10 secondes)...
timeout /t 10 /nobreak > nul

echo.
echo Lancement de l'interface utilisateur...
echo.

REM Lancer l'interface Electron en mode développement
cd /d "%~dp0pii-scanner-ui"
start "PII Scanner UI" cmd /c "npm run electron:dev"

echo.
echo ╔══════════════════════════════════════════════════════════════════════╗
echo ║                      ✓ APPLICATION EN COURS DE LANCEMENT !           ║
echo ╚══════════════════════════════════════════════════════════════════════╝
echo.
echo L'interface va s'ouvrir dans quelques secondes...
echo.
echo ⚠️  NE FERMEZ PAS cette fenêtre ! L'API doit rester active.
echo.
echo Pour arrêter l'application, fermez toutes les fenêtres.
echo.
echo ════════════════════════════════════════════════════════════════════════
echo.

pause
