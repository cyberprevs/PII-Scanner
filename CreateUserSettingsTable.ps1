# Script PowerShell pour créer la table UserSettings dans la base de données
# À exécuter AVEC L'API ARRÊTÉE

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Création de la table UserSettings" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Créer un projet temporaire
Write-Host "1. Création d'un projet temporaire..." -ForegroundColor Yellow
dotnet new console -n TempMigration -f net8.0 -o TempMigration --force | Out-Null

# Ajouter les packages
Write-Host "2. Ajout des packages SQLite..." -ForegroundColor Yellow
Set-Location TempMigration
dotnet add package Microsoft.Data.Sqlite.Core | Out-Null
dotnet add package SQLitePCLRaw.bundle_e_sqlcipher | Out-Null

# Créer le code
Write-Host "3. Génération du code de migration..." -ForegroundColor Yellow
$code = @'
using Microsoft.Data.Sqlite;
using SQLitePCL;

Batteries_V2.Init();

var dbPath = Path.Combine(Directory.GetCurrentDirectory(), "..", "PiiScanner.Api", "bin", "Debug", "net8.0", "piiscanner.db");
var keyPath = Path.Combine(Directory.GetCurrentDirectory(), "..", "PiiScanner.Api", "bin", "Debug", "net8.0", "db_encryption.key");

if (!File.Exists(keyPath))
{
    Console.WriteLine("❌ Clé de chiffrement introuvable!");
    return;
}

var encryptionKey = File.ReadAllText(keyPath).Trim();
var connectionString = $"Data Source={dbPath};Password={encryptionKey}";

using var connection = new SqliteConnection(connectionString);
connection.Open();

Console.WriteLine("✅ Connexion réussie\n");

var sql = @"
CREATE TABLE IF NOT EXISTS ""UserSettings"" (
    ""Id"" INTEGER NOT NULL CONSTRAINT ""PK_UserSettings"" PRIMARY KEY AUTOINCREMENT,
    ""UserId"" INTEGER NOT NULL,
    ""FileTypesJson"" TEXT NOT NULL,
    ""ExcludedFolders"" TEXT NOT NULL,
    ""ExcludedExtensions"" TEXT NOT NULL,
    ""PiiTypesJson"" TEXT NOT NULL,
    ""RecentScanPathsJson"" TEXT NOT NULL,
    ""UpdatedAt"" TEXT NOT NULL,
    CONSTRAINT ""FK_UserSettings_Users_UserId"" FOREIGN KEY (""UserId"") REFERENCES ""Users"" (""Id"") ON DELETE CASCADE
);

CREATE UNIQUE INDEX IF NOT EXISTS ""IX_UserSettings_UserId"" ON ""UserSettings"" (""UserId"");
CREATE INDEX IF NOT EXISTS ""IX_Session_UserId"" ON ""Sessions"" (""UserId"");
";

using var command = connection.CreateCommand();
command.CommandText = sql;
command.ExecuteNonQuery();

Console.WriteLine("✅ Table UserSettings créée!");
Console.WriteLine("✅ Index IX_UserSettings_UserId créé!");
Console.WriteLine("✅ Index IX_Session_UserId créé!");

connection.Close();
'@

Set-Content -Path "Program.cs" -Value $code

# Compiler et exécuter
Write-Host "4. Exécution de la migration..." -ForegroundColor Yellow
Write-Host ""
dotnet run

# Nettoyer
Write-Host ""
Write-Host "5. Nettoyage..." -ForegroundColor Yellow
Set-Location ..
Remove-Item -Recurse -Force TempMigration

Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "Migration terminée!" -ForegroundColor Green
Write-Host "Vous pouvez maintenant redémarrer l'API" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
