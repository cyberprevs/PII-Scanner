namespace PiiScanner.Models;

public class ScanResult
{
    public required string FilePath { get; init; }
    public required string PiiType { get; init; }
    public required string Match { get; init; }
    public DateTime? LastAccessedDate { get; init; }

    // Informations d'exposition (permissions)
    public string? ExposureLevel { get; init; }
    public bool? AccessibleToEveryone { get; init; }
    public bool? IsNetworkShare { get; init; }
    public int? UserGroupCount { get; init; }
}
