namespace PiiScanner.Api.Models;

public class AuditLog
{
    public int Id { get; set; }
    public int? UserId { get; set; }
    public string Action { get; set; } = string.Empty; // LoginSuccess, LoginFailed, CreateUser, DeleteScan, etc.
    public string EntityType { get; set; } = string.Empty; // User, Scan, Report
    public string EntityId { get; set; } = string.Empty;
    public string IpAddress { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public string? Details { get; set; }
}
