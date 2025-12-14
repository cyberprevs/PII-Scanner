namespace PiiScanner.Models;

public class ScanResult
{
    public required string FilePath { get; init; }
    public required string PiiType { get; init; }
    public required string Match { get; init; }
}
