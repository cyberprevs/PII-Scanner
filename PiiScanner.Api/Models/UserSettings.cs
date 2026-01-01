namespace PiiScanner.Api.Models;

/// <summary>
/// Paramètres utilisateur personnalisés pour la configuration PII
/// </summary>
public class UserSettings
{
    public int Id { get; set; }
    public int UserId { get; set; }

    // Configuration des types de fichiers à scanner
    public string FileTypesJson { get; set; } = string.Empty;

    // Dossiers à exclure du scan
    public string ExcludedFolders { get; set; } = "Windows, System32, Program Files, AppData";

    // Extensions de fichiers à exclure
    public string ExcludedExtensions { get; set; } = ".exe, .dll, .sys, .tmp";

    // Configuration des types PII et sensibilités (JSON)
    public string PiiTypesJson { get; set; } = string.Empty;

    // Chemins de scan récents (JSON array)
    public string RecentScanPathsJson { get; set; } = "[]";

    // Dernière mise à jour
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

    // Navigation property
    public User? User { get; set; }
}
