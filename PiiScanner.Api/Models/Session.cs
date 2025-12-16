namespace PiiScanner.Api.Models;

public class Session
{
    public int Id { get; set; }
    public int UserId { get; set; }
    public string RefreshToken { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime ExpiresAt { get; set; }
    public string IpAddress { get; set; } = string.Empty;
    public bool IsRevoked { get; set; } = false;
}
