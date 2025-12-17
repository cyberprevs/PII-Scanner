# Script pour installer un alias permanent pour démarrer l'API
Write-Host "Installation de l'alias 'start-pii-api'..." -ForegroundColor Cyan

$profilePath = $PROFILE
$apiPath = "$PSScriptRoot\start-api-clean.ps1"

# Créer le profil PowerShell s'il n'existe pas
if (!(Test-Path -Path $profilePath)) {
    New-Item -ItemType File -Path $profilePath -Force | Out-Null
    Write-Host "Profil PowerShell cree: $profilePath" -ForegroundColor Green
}

# Ajouter la fonction au profil
$functionDefinition = @"

# Fonction pour démarrer PII Scanner API
function Start-PiiApi {
    & "$apiPath"
}
Set-Alias -Name start-pii-api -Value Start-PiiApi
"@

# Vérifier si la fonction existe déjà
$profileContent = Get-Content -Path $profilePath -Raw -ErrorAction SilentlyContinue
if ($profileContent -notlike "*Start-PiiApi*") {
    Add-Content -Path $profilePath -Value $functionDefinition
    Write-Host "Alias 'start-pii-api' ajoute au profil PowerShell!" -ForegroundColor Green
} else {
    Write-Host "Alias 'start-pii-api' existe deja!" -ForegroundColor Yellow
}

Write-Host "`nPour utiliser l'alias:" -ForegroundColor Cyan
Write-Host "  1. Fermez et rouvrez PowerShell" -ForegroundColor White
Write-Host "  2. Tapez: start-pii-api" -ForegroundColor White
Write-Host "`nOu rechargez le profil immediatement avec:" -ForegroundColor Cyan
Write-Host "  . `$PROFILE" -ForegroundColor White
