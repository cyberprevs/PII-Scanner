# Script pour démarrer l'API avec nettoyage automatique des processus
Write-Host "=== PII Scanner API - Demarrage ===" -ForegroundColor Cyan

# Fonction pour libérer les ports
function Stop-ProcessOnPort {
    param([int]$Port)

    try {
        $connections = Get-NetTCPConnection -LocalPort $Port -ErrorAction SilentlyContinue
        if ($connections) {
            Write-Host "Port $Port occupe - Liberation en cours..." -ForegroundColor Yellow
            $connections | ForEach-Object {
                $processId = $_.OwningProcess
                $process = Get-Process -Id $processId -ErrorAction SilentlyContinue
                if ($process) {
                    Write-Host "  - Arret du processus: $($process.ProcessName) (PID: $processId)" -ForegroundColor Yellow
                    Stop-Process -Id $processId -Force -ErrorAction SilentlyContinue
                }
            }
            Start-Sleep -Seconds 1
            Write-Host "Port $Port libere!" -ForegroundColor Green
        }
    } catch {
        Write-Host "Impossible de verifier le port $Port" -ForegroundColor Gray
    }
}

# Nettoyer les ports 5000 et 5001
Write-Host "`nVerification des ports..." -ForegroundColor Cyan
Stop-ProcessOnPort -Port 5001
Stop-ProcessOnPort -Port 5000

# Nettoyer tous les processus dotnet orphelins de PiiScanner.Api
Write-Host "`nNettoyage des processus orphelins..." -ForegroundColor Cyan
Get-Process -Name "dotnet" -ErrorAction SilentlyContinue | Where-Object {
    $_.Path -like "*PiiScanner.Api*"
} | ForEach-Object {
    Write-Host "  - Arret du processus orphelin (PID: $($_.Id))" -ForegroundColor Yellow
    Stop-Process -Id $_.Id -Force -ErrorAction SilentlyContinue
}

# Vérifier le certificat HTTPS
Write-Host "`nVerification du certificat HTTPS..." -ForegroundColor Cyan
$certCheck = & dotnet dev-certs https --check --quiet 2>&1
if ($LASTEXITCODE -ne 0) {
    Write-Host "Installation du certificat HTTPS..." -ForegroundColor Yellow
    & dotnet dev-certs https --trust
}

# Aller dans le répertoire de l'API
Set-Location "$PSScriptRoot\PiiScanner.Api"

# Démarrer l'API
Write-Host "`n=== Demarrage de l'API ===" -ForegroundColor Green
Write-Host "URL: https://localhost:5001" -ForegroundColor Cyan
Write-Host "Swagger: https://localhost:5001/swagger" -ForegroundColor Cyan
Write-Host "`nAppuyez sur Ctrl+C pour arreter l'API`n" -ForegroundColor Gray

dotnet run
