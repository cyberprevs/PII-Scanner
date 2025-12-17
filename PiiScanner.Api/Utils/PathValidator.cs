using System.Text.RegularExpressions;

namespace PiiScanner.Api.Utils;

/// <summary>
/// Classe utilitaire pour la validation sécurisée des chemins de fichiers et répertoires
/// Protection contre les attaques de type Path Traversal
/// </summary>
public static class PathValidator
{
    // Caractères interdits dans les chemins (path traversal)
    private static readonly char[] InvalidPathChars = new[] { '<', '>', '|', '\0', '\x01', '\x02', '\x03', '\x04', '\x05', '\x06', '\a', '\b', '\t', '\n', '\v', '\f', '\r', '\x0e', '\x0f', '\x10', '\x11', '\x12', '\x13', '\x14', '\x15', '\x16', '\x17', '\x18', '\x19', '\x1a', '\x1b', '\x1c', '\x1d', '\x1e', '\x1f' };

    // Patterns dangereux pour path traversal
    private static readonly string[] DangerousPatterns = new[]
    {
        "..",           // Navigation vers le parent
        "~",            // Dossier home
        "%",            // Encodage URL
        "\\\\",         // Double backslash (UNC paths)
        "//",           // Double forward slash
    };

    // Préfixes de chemins système sensibles à bloquer
    private static readonly string[] SensitiveSystemPaths = new[]
    {
        "C:\\Windows",
        "C:\\Program Files",
        "C:\\Program Files (x86)",
        "C:\\ProgramData",
        "C:\\Users\\All Users",
        "C:\\Users\\Default",
        "C:\\System Volume Information",
        "/etc",
        "/var",
        "/usr",
        "/bin",
        "/sbin",
        "/boot",
        "/sys",
        "/proc"
    };

    /// <summary>
    /// Valide un nom de fichier (sans chemin) pour s'assurer qu'il est sûr
    /// </summary>
    /// <param name="fileName">Nom du fichier à valider</param>
    /// <param name="errorMessage">Message d'erreur si la validation échoue</param>
    /// <returns>True si le nom de fichier est valide, False sinon</returns>
    public static bool ValidateFileName(string fileName, out string errorMessage)
    {
        errorMessage = string.Empty;

        if (string.IsNullOrWhiteSpace(fileName))
        {
            errorMessage = "Le nom de fichier ne peut pas être vide";
            return false;
        }

        // Vérifier les caractères de traversée de répertoire
        if (fileName.Contains("..") || fileName.Contains("/") || fileName.Contains("\\"))
        {
            errorMessage = "Le nom de fichier contient des caractères de navigation de répertoire non autorisés";
            return false;
        }

        // Vérifier les caractères invalides
        if (fileName.IndexOfAny(Path.GetInvalidFileNameChars()) >= 0)
        {
            errorMessage = "Le nom de fichier contient des caractères non autorisés";
            return false;
        }

        // Vérifier la longueur maximale
        if (fileName.Length > 255)
        {
            errorMessage = "Le nom de fichier est trop long (max 255 caractères)";
            return false;
        }

        // Vérifier les noms de fichiers réservés Windows
        var reservedNames = new[] { "CON", "PRN", "AUX", "NUL", "COM1", "COM2", "COM3", "COM4", "COM5", "COM6", "COM7", "COM8", "COM9", "LPT1", "LPT2", "LPT3", "LPT4", "LPT5", "LPT6", "LPT7", "LPT8", "LPT9" };
        var nameWithoutExtension = Path.GetFileNameWithoutExtension(fileName).ToUpperInvariant();
        if (reservedNames.Contains(nameWithoutExtension))
        {
            errorMessage = "Le nom de fichier utilise un nom réservé du système";
            return false;
        }

        return true;
    }

    /// <summary>
    /// Valide un chemin de répertoire complet
    /// </summary>
    /// <param name="directoryPath">Chemin du répertoire à valider</param>
    /// <param name="errorMessage">Message d'erreur si la validation échoue</param>
    /// <param name="mustExist">Si true, vérifie que le répertoire existe</param>
    /// <returns>True si le chemin est valide, False sinon</returns>
    public static bool ValidateDirectoryPath(string directoryPath, out string errorMessage, bool mustExist = true)
    {
        errorMessage = string.Empty;

        if (string.IsNullOrWhiteSpace(directoryPath))
        {
            errorMessage = "Le chemin du répertoire ne peut pas être vide";
            return false;
        }

        // Vérifier les patterns dangereux
        foreach (var pattern in DangerousPatterns)
        {
            if (directoryPath.Contains(pattern))
            {
                errorMessage = $"Le chemin contient un pattern dangereux: {pattern}";
                return false;
            }
        }

        // Vérifier les caractères invalides
        if (directoryPath.IndexOfAny(InvalidPathChars) >= 0)
        {
            errorMessage = "Le chemin contient des caractères non autorisés";
            return false;
        }

        // Normaliser le chemin pour détecter les tentatives d'évasion
        string normalizedPath;
        try
        {
            normalizedPath = Path.GetFullPath(directoryPath);
        }
        catch (Exception ex)
        {
            errorMessage = $"Le chemin n'est pas valide: {ex.Message}";
            return false;
        }

        // Vérifier que le chemin normalisé commence toujours par le chemin original (après normalisation)
        // Cela empêche les tentatives de navigation vers des répertoires parents
        if (!normalizedPath.Equals(directoryPath, StringComparison.OrdinalIgnoreCase))
        {
            // Autoriser si c'est juste une différence de casse ou de trailing slash
            var originalNormalized = directoryPath.TrimEnd('\\', '/');
            var resultNormalized = normalizedPath.TrimEnd('\\', '/');

            if (!resultNormalized.Equals(originalNormalized, StringComparison.OrdinalIgnoreCase))
            {
                errorMessage = "Le chemin contient des références relatives dangereuses";
                return false;
            }
        }

        // Vérifier que le chemin n'est pas dans un répertoire système sensible
        foreach (var sensitivePath in SensitiveSystemPaths)
        {
            if (normalizedPath.StartsWith(sensitivePath, StringComparison.OrdinalIgnoreCase))
            {
                errorMessage = "L'accès aux répertoires système est interdit";
                return false;
            }
        }

        // Vérifier la longueur maximale du chemin (Windows: 260, mais on peut avoir plus avec \\?\)
        if (normalizedPath.Length > 32767) // MAX_PATH étendu
        {
            errorMessage = "Le chemin est trop long";
            return false;
        }

        // Vérifier l'existence si requis
        if (mustExist && !Directory.Exists(normalizedPath))
        {
            errorMessage = "Le répertoire n'existe pas";
            return false;
        }

        return true;
    }

    /// <summary>
    /// Valide un chemin de fichier complet
    /// </summary>
    /// <param name="filePath">Chemin du fichier à valider</param>
    /// <param name="errorMessage">Message d'erreur si la validation échoue</param>
    /// <param name="mustExist">Si true, vérifie que le fichier existe</param>
    /// <returns>True si le chemin est valide, False sinon</returns>
    public static bool ValidateFilePath(string filePath, out string errorMessage, bool mustExist = true)
    {
        errorMessage = string.Empty;

        if (string.IsNullOrWhiteSpace(filePath))
        {
            errorMessage = "Le chemin du fichier ne peut pas être vide";
            return false;
        }

        // Vérifier les patterns dangereux
        foreach (var pattern in DangerousPatterns)
        {
            if (filePath.Contains(pattern))
            {
                errorMessage = $"Le chemin contient un pattern dangereux: {pattern}";
                return false;
            }
        }

        // Normaliser le chemin
        string normalizedPath;
        try
        {
            normalizedPath = Path.GetFullPath(filePath);
        }
        catch (Exception ex)
        {
            errorMessage = $"Le chemin n'est pas valide: {ex.Message}";
            return false;
        }

        // Vérifier le nom de fichier
        var fileName = Path.GetFileName(normalizedPath);
        if (!ValidateFileName(fileName, out var fileNameError))
        {
            errorMessage = fileNameError;
            return false;
        }

        // Vérifier le répertoire parent
        var directory = Path.GetDirectoryName(normalizedPath);
        if (string.IsNullOrEmpty(directory))
        {
            errorMessage = "Impossible de déterminer le répertoire parent";
            return false;
        }

        // Vérifier que le répertoire parent n'est pas dans un répertoire système sensible
        foreach (var sensitivePath in SensitiveSystemPaths)
        {
            if (normalizedPath.StartsWith(sensitivePath, StringComparison.OrdinalIgnoreCase))
            {
                errorMessage = "L'accès aux répertoires système est interdit";
                return false;
            }
        }

        // Vérifier l'existence si requis
        if (mustExist && !File.Exists(normalizedPath))
        {
            errorMessage = "Le fichier n'existe pas";
            return false;
        }

        return true;
    }

    /// <summary>
    /// Valide que le fichier se trouve dans un répertoire autorisé spécifique
    /// </summary>
    /// <param name="filePath">Chemin du fichier à valider</param>
    /// <param name="allowedDirectory">Répertoire de base autorisé</param>
    /// <param name="errorMessage">Message d'erreur si la validation échoue</param>
    /// <returns>True si le fichier est dans le répertoire autorisé, False sinon</returns>
    public static bool ValidateFileInDirectory(string filePath, string allowedDirectory, out string errorMessage)
    {
        errorMessage = string.Empty;

        // Valider d'abord le chemin du fichier
        if (!ValidateFilePath(filePath, out errorMessage, mustExist: false))
        {
            return false;
        }

        // Valider le répertoire autorisé
        if (!ValidateDirectoryPath(allowedDirectory, out errorMessage, mustExist: false))
        {
            return false;
        }

        // Normaliser les deux chemins
        var normalizedFilePath = Path.GetFullPath(filePath);
        var normalizedAllowedDir = Path.GetFullPath(allowedDirectory);

        // Vérifier que le fichier est dans le répertoire autorisé ou un sous-répertoire
        if (!normalizedFilePath.StartsWith(normalizedAllowedDir, StringComparison.OrdinalIgnoreCase))
        {
            errorMessage = "Le fichier n'est pas dans le répertoire autorisé";
            return false;
        }

        return true;
    }

    /// <summary>
    /// Nettoie et sécurise un chemin de fichier
    /// </summary>
    /// <param name="path">Chemin à nettoyer</param>
    /// <returns>Chemin nettoyé et sécurisé</returns>
    public static string SanitizePath(string path)
    {
        if (string.IsNullOrWhiteSpace(path))
            return string.Empty;

        // Supprimer les espaces en début et fin
        path = path.Trim();

        // Remplacer les doubles slashes
        path = Regex.Replace(path, @"[/\\]{2,}", Path.DirectorySeparatorChar.ToString());

        // Supprimer les références relatives
        path = path.Replace("..", "");

        return path;
    }

    /// <summary>
    /// Obtient un chemin absolu sécurisé à partir d'un chemin relatif
    /// </summary>
    /// <param name="relativePath">Chemin relatif</param>
    /// <param name="basePath">Chemin de base</param>
    /// <param name="errorMessage">Message d'erreur si la validation échoue</param>
    /// <returns>Chemin absolu sécurisé, ou null si invalide</returns>
    public static string? GetSafeAbsolutePath(string relativePath, string basePath, out string errorMessage)
    {
        errorMessage = string.Empty;

        try
        {
            // Combiner les chemins
            var combined = Path.Combine(basePath, relativePath);

            // Normaliser
            var normalized = Path.GetFullPath(combined);

            // Vérifier que le résultat est toujours dans le basePath
            var normalizedBase = Path.GetFullPath(basePath);

            if (!normalized.StartsWith(normalizedBase, StringComparison.OrdinalIgnoreCase))
            {
                errorMessage = "Le chemin sort du répertoire de base autorisé";
                return null;
            }

            return normalized;
        }
        catch (Exception ex)
        {
            errorMessage = $"Erreur lors de la résolution du chemin: {ex.Message}";
            return null;
        }
    }
}
