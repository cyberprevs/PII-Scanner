# Script pour démarrer l'API PII Scanner avec HTTPS
Write-Host "Démarrage de l'API PII Scanner..." -ForegroundColor Green

# Aller dans le répertoire de l'API
Set-Location "$PSScriptRoot\PiiScanner.Api"

# Vérifier que le certificat de développement est installé
Write-Host "Vérification du certificat HTTPS..." -ForegroundColor Yellow
dotnet dev-certs https --check --quiet
if ($LASTEXITCODE -ne 0) {
    Write-Host "Installation du certificat HTTPS de développement..." -ForegroundColor Yellow
    dotnet dev-certs https --trust
}

# Démarrer l'API
Write-Host "Lancement de l'API sur https://localhost:5001..." -ForegroundColor Green
dotnet run --launch-profile https
