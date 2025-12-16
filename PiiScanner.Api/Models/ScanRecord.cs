namespace PiiScanner.Api.Models;

public class ScanRecord
{
    public int Id { get; set; }
    public string ScanId { get; set; } = string.Empty;
    public int UserId { get; set; }
    public User? User { get; set; } // Navigation property
    public string DirectoryPath { get; set; } = string.Empty;
    public int? FilesScanned { get; set; } // Nullable pour permettre null en cours de scan
    public int? PiiDetected { get; set; } // Nullable pour permettre null en cours de scan
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? CompletedAt { get; set; }
    public string Status { get; set; } = "Running"; // Running, Completed, Failed
}
