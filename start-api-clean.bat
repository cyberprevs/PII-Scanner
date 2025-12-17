@echo off
echo === PII Scanner API - Demarrage ===
echo.

REM Tuer tous les processus dotnet
echo Nettoyage des processus dotnet...
taskkill /F /IM dotnet.exe >nul 2>&1
timeout /t 2 /nobreak >nul

REM Verifier le certificat
echo Verification du certificat HTTPS...
cd /d "%~dp0\PiiScanner.Api"
dotnet dev-certs https --check --quiet
if errorlevel 1 (
    echo Installation du certificat...
    dotnet dev-certs https --trust
)

REM Demarrer l'API
echo.
echo === Demarrage de l'API ===
echo URL: https://localhost:5001
echo Swagger: https://localhost:5001/swagger
echo.
echo Appuyez sur Ctrl+C pour arreter l'API
echo.

dotnet run
pause
