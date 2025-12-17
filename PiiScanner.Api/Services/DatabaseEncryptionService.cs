using System.Security.Cryptography;
using System.Text;
using Microsoft.Data.Sqlite;

namespace PiiScanner.Api.Services;

/// <summary>
/// Service de gestion du chiffrement de la base de données SQLite avec SQLCipher
/// </summary>
public class DatabaseEncryptionService
{
    private readonly ILogger<DatabaseEncryptionService> _logger;
    private readonly IConfiguration _configuration;
    private const string ENCRYPTION_KEY_FILE = "db_encryption.key";

    public DatabaseEncryptionService(
        ILogger<DatabaseEncryptionService> logger,
        IConfiguration configuration)
    {
        _logger = logger;
        _configuration = configuration;
    }

    /// <summary>
    /// Obtient ou génère la clé de chiffrement pour la base de données
    /// </summary>
    public string GetOrCreateEncryptionKey()
    {
        // 1. Vérifier d'abord dans la configuration (pour production)
        var configKey = _configuration["Database:EncryptionKey"];
        if (!string.IsNullOrEmpty(configKey))
        {
            _logger.LogInformation("Utilisation de la clé de chiffrement depuis la configuration");
            return configKey;
        }

        // 2. Vérifier si un fichier de clé existe
        var keyFilePath = Path.Combine(AppDomain.CurrentDomain.BaseDirectory, ENCRYPTION_KEY_FILE);
        if (File.Exists(keyFilePath))
        {
            try
            {
                var existingKey = File.ReadAllText(keyFilePath);
                _logger.LogInformation("Clé de chiffrement chargée depuis le fichier");
                return existingKey.Trim();
            }
            catch (Exception ex)
            {
                _logger.LogWarning(ex, "Impossible de lire la clé de chiffrement existante");
            }
        }

        // 3. Générer une nouvelle clé sécurisée
        var newKey = GenerateSecureKey();

        try
        {
            // Sauvegarder la clé pour une utilisation future
            File.WriteAllText(keyFilePath, newKey);

            // Définir les permissions (Windows)
            if (OperatingSystem.IsWindows())
            {
                var fileInfo = new FileInfo(keyFilePath);
                fileInfo.Attributes = FileAttributes.Hidden | FileAttributes.ReadOnly;
            }

            _logger.LogWarning(
                "Nouvelle clé de chiffrement générée et sauvegardée dans {FilePath}. " +
                "IMPORTANT: Sauvegardez ce fichier de manière sécurisée!",
                keyFilePath);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Impossible de sauvegarder la clé de chiffrement");
        }

        return newKey;
    }

    /// <summary>
    /// Génère une clé de chiffrement cryptographiquement sécurisée
    /// </summary>
    private string GenerateSecureKey()
    {
        // Générer 32 bytes (256 bits) de données aléatoires cryptographiquement sécurisées
        var keyBytes = new byte[32];
        using (var rng = RandomNumberGenerator.Create())
        {
            rng.GetBytes(keyBytes);
        }

        // Convertir en hexadécimal pour faciliter le stockage
        return Convert.ToHexString(keyBytes);
    }

    /// <summary>
    /// Configure une connexion SQLite avec chiffrement SQLCipher
    /// </summary>
    public string GetEncryptedConnectionString(string baseConnectionString)
    {
        var encryptionKey = GetOrCreateEncryptionKey();

        // Créer une SqliteConnectionStringBuilder pour manipuler facilement la chaîne
        var builder = new SqliteConnectionStringBuilder(baseConnectionString);

        // Ajouter la clé de chiffrement comme mot de passe SQLCipher
        builder.Password = encryptionKey;

        // Configuration SQLCipher recommandée pour la sécurité
        // Utiliser PRAGMA key pour définir la clé de chiffrement
        var connectionString = builder.ToString();

        _logger.LogInformation("Connexion à la base de données chiffrée configurée");

        return connectionString;
    }

    /// <summary>
    /// Chiffre une base de données SQLite existante non chiffrée
    /// </summary>
    public async Task<bool> EncryptExistingDatabase(string databasePath)
    {
        if (!File.Exists(databasePath))
        {
            _logger.LogWarning("Base de données inexistante: {Path}", databasePath);
            return false;
        }

        var backupPath = $"{databasePath}.backup_{DateTime.UtcNow:yyyyMMddHHmmss}";
        var tempEncryptedPath = $"{databasePath}.encrypted";

        try
        {
            _logger.LogInformation("Début du chiffrement de la base de données: {Path}", databasePath);

            // 1. Créer une sauvegarde
            File.Copy(databasePath, backupPath, overwrite: false);
            _logger.LogInformation("Sauvegarde créée: {Path}", backupPath);

            var encryptionKey = GetOrCreateEncryptionKey();

            // 2. Ouvrir la base non chiffrée et créer une version chiffrée
            using (var sourceConnection = new SqliteConnection($"Data Source={databasePath}"))
            using (var destConnection = new SqliteConnection($"Data Source={tempEncryptedPath};Password={encryptionKey}"))
            {
                await sourceConnection.OpenAsync();
                await destConnection.OpenAsync();

                // Utiliser SQLCipher pour exporter les données vers la base chiffrée
                using (var exportCommand = sourceConnection.CreateCommand())
                {
                    exportCommand.CommandText = $"ATTACH DATABASE '{tempEncryptedPath}' AS encrypted KEY '{encryptionKey}'; " +
                                               "SELECT sqlcipher_export('encrypted'); " +
                                               "DETACH DATABASE encrypted;";
                    await exportCommand.ExecuteNonQueryAsync();
                }
            }

            // 3. Remplacer l'ancienne base par la version chiffrée
            File.Delete(databasePath);
            File.Move(tempEncryptedPath, databasePath);

            _logger.LogInformation("Base de données chiffrée avec succès. Sauvegarde conservée: {Path}", backupPath);
            return true;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Erreur lors du chiffrement de la base de données");

            // Nettoyer en cas d'erreur
            if (File.Exists(tempEncryptedPath))
            {
                File.Delete(tempEncryptedPath);
            }

            // Restaurer depuis la sauvegarde si nécessaire
            if (File.Exists(backupPath) && !File.Exists(databasePath))
            {
                File.Copy(backupPath, databasePath);
                _logger.LogInformation("Base de données restaurée depuis la sauvegarde");
            }

            return false;
        }
    }

    /// <summary>
    /// Vérifie si une base de données est chiffrée
    /// </summary>
    public bool IsDatabaseEncrypted(string databasePath)
    {
        if (!File.Exists(databasePath))
        {
            return false;
        }

        try
        {
            // Tenter d'ouvrir sans clé
            using var connection = new SqliteConnection($"Data Source={databasePath}");
            connection.Open();

            // Si on peut ouvrir et lire, la base n'est pas chiffrée
            using var command = connection.CreateCommand();
            command.CommandText = "SELECT COUNT(*) FROM sqlite_master";
            command.ExecuteScalar();

            return false; // Pas chiffrée
        }
        catch (SqliteException ex) when (ex.SqliteErrorCode == 26) // SQLITE_NOTADB
        {
            // Erreur "file is not a database" = probablement chiffrée
            return true;
        }
        catch
        {
            // Autre erreur - supposer non chiffrée
            return false;
        }
    }
}
