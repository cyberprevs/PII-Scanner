namespace PiiScanner.Api.Models;

public class AppSettings
{
    public int Id { get; set; }
    public int DataRetentionDays { get; set; } = 90; // Durée de conservation des scans
    public int AuditLogRetentionDays { get; set; } = 365; // Durée de conservation des logs
    public int SessionRetentionDays { get; set; } = 7; // Durée de conservation des sessions
    public bool AutoBackupEnabled { get; set; } = false;
    public int AutoBackupIntervalHours { get; set; } = 24;
    public DateTime? LastAutoBackup { get; set; }
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
    public int? UpdatedBy { get; set; }
}
