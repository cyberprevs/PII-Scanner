@echo off
REM Script pour démarrer l'API PII Scanner avec HTTPS
echo Demarrage de l'API PII Scanner...

cd /d "%~dp0\PiiScanner.Api"

REM Vérifier le certificat
echo Verification du certificat HTTPS...
dotnet dev-certs https --check --quiet
if errorlevel 1 (
    echo Installation du certificat HTTPS de developpement...
    dotnet dev-certs https --trust
)

REM Démarrer l'API
echo Lancement de l'API sur https://localhost:5001...
dotnet run --launch-profile https

pause
