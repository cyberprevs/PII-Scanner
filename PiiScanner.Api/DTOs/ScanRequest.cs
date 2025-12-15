namespace PiiScanner.Api.DTOs;

public class ScanRequest
{
    public required string DirectoryPath { get; set; }
    public string[]? PiiTypes { get; set; } // Types de PII à détecter (null = tous)
}

public class ScanResponse
{
    public required string ScanId { get; set; }
    public required string Status { get; set; } // "started", "processing", "completed", "error"
    public string? Message { get; set; }
}

public class ScanProgressResponse
{
    public required string ScanId { get; set; }
    public required string Status { get; set; }
    public int ProcessedFiles { get; set; }
    public int TotalFiles { get; set; }
    public int PiiFound { get; set; }
}

public class ScanResultResponse
{
    public required string ScanId { get; set; }
    public required ScanStatisticsDto Statistics { get; set; }
    public List<ScanDetectionDto> Detections { get; set; } = new();
}

public class ScanStatisticsDto
{
    public int TotalFilesScanned { get; set; }
    public int FilesWithPii { get; set; }
    public int TotalPiiFound { get; set; }
    public Dictionary<string, int> PiiByType { get; set; } = new();
    public List<RiskyFileDto> TopRiskyFiles { get; set; } = new();
}

public class RiskyFileDto
{
    public required string FilePath { get; set; }
    public int PiiCount { get; set; }
    public required string RiskLevel { get; set; }
    public DateTime? LastAccessedDate { get; set; }
    public string? StalenessLevel { get; set; }
    public string? StaleDataWarning { get; set; }

    // Informations d'exposition
    public string? ExposureLevel { get; set; }
    public bool? AccessibleToEveryone { get; set; }
    public bool? IsNetworkShare { get; set; }
    public int? UserGroupCount { get; set; }
    public string? ExposureWarning { get; set; }
}

public class ScanDetectionDto
{
    public required string FilePath { get; set; }
    public required string PiiType { get; set; }
    public required string Match { get; set; }
    public DateTime? LastAccessedDate { get; set; }

    // Informations d'exposition
    public string? ExposureLevel { get; set; }
    public bool? AccessibleToEveryone { get; set; }
}
