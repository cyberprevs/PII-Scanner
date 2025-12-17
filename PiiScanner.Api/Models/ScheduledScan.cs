namespace PiiScanner.Api.Models;

public class ScheduledScan
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty; // Nom descriptif du scan planifié
    public string DirectoryPath { get; set; } = string.Empty;
    public int CreatedBy { get; set; }
    public User? CreatedByUser { get; set; }

    // Fréquence: Daily, Weekly, Monthly, Quarterly
    public ScanFrequency Frequency { get; set; }

    // Pour Weekly: jour de la semaine (0=Dimanche, 1=Lundi, etc.)
    public int? DayOfWeek { get; set; }

    // Pour Monthly: jour du mois (1-28 pour éviter les problèmes de février)
    public int? DayOfMonth { get; set; }

    // Heure d'exécution (format 24h: 0-23)
    public int HourOfDay { get; set; }

    public bool IsActive { get; set; } = true;

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? LastRunAt { get; set; }
    public DateTime? NextRunAt { get; set; }

    // ID du dernier scan exécuté
    public string? LastScanId { get; set; }

    // Notifications
    public bool NotifyOnCompletion { get; set; } = true;
    public bool NotifyOnNewPii { get; set; } = true;
}

public enum ScanFrequency
{
    Daily = 0,
    Weekly = 1,
    Monthly = 2,
    Quarterly = 3
}
