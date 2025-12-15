using PiiScanner.Utils;

namespace PiiScanner.Models;

public class ScanStatistics
{
    public int TotalFilesScanned { get; set; }
    public int FilesWithPii { get; set; }
    public int TotalPiiFound { get; set; }
    public Dictionary<string, int> PiiByType { get; set; } = new();
    public List<FileRiskInfo> TopRiskyFiles { get; set; } = new();

    public static ScanStatistics Calculate(List<ScanResult> results, int totalFilesScanned)
    {
        var stats = new ScanStatistics
        {
            TotalFilesScanned = totalFilesScanned,
            TotalPiiFound = results.Count
        };

        // Compter les fichiers uniques contenant des PII
        var filesWithPii = results.Select(r => r.FilePath).Distinct().ToList();
        stats.FilesWithPii = filesWithPii.Count;

        // Répartition par type de PII
        stats.PiiByType = results
            .GroupBy(r => r.PiiType)
            .OrderByDescending(g => g.Count())
            .ToDictionary(g => g.Key, g => g.Count());

        // Top fichiers avec le plus de PII
        stats.TopRiskyFiles = results
            .GroupBy(r => r.FilePath)
            .Select(g =>
            {
                var firstResult = g.FirstOrDefault();
                var lastAccessedDate = firstResult?.LastAccessedDate;
                var piiCount = g.Count();
                var stalenessLevel = StaleDataCalculator.GetStalenessLevel(lastAccessedDate);
                var staleDataWarning = StaleDataCalculator.GetStaleDataMessage(piiCount, lastAccessedDate);

                // Informations d'exposition
                var exposureLevel = firstResult?.ExposureLevel ?? "Faible";
                var accessibleToEveryone = firstResult?.AccessibleToEveryone ?? false;
                var isNetworkShare = firstResult?.IsNetworkShare ?? false;
                var userGroupCount = firstResult?.UserGroupCount ?? 0;

                // Créer PermissionInfo pour générer le message d'exposition
                var permInfo = new FilePermissionAnalyzer.PermissionInfo
                {
                    ExposureLevel = ParseExposureLevel(exposureLevel),
                    AccessibleToEveryone = accessibleToEveryone,
                    IsNetworkShare = isNetworkShare,
                    UserGroupCount = userGroupCount
                };
                var exposureWarning = FilePermissionAnalyzer.GetExposureWarning(piiCount, permInfo);

                return new FileRiskInfo
                {
                    FilePath = g.Key,
                    PiiCount = piiCount,
                    RiskLevel = CalculateRiskLevel(piiCount, g.Select(r => r.PiiType).Distinct().ToList()),
                    LastAccessedDate = lastAccessedDate,
                    StalenessLevel = StaleDataCalculator.GetStalenessLevelLabel(stalenessLevel),
                    StaleDataWarning = staleDataWarning,
                    ExposureLevel = exposureLevel,
                    AccessibleToEveryone = accessibleToEveryone,
                    IsNetworkShare = isNetworkShare,
                    UserGroupCount = userGroupCount,
                    ExposureWarning = exposureWarning
                };
            })
            .OrderByDescending(f => f.PiiCount)
            .Take(20)
            .ToList();

        return stats;
    }

    private static string CalculateRiskLevel(int piiCount, List<string> piiTypes)
    {
        // Risque élevé si données bancaires ou > 10 PII
        if (piiTypes.Any(t => t.Contains("IBAN") || t.Contains("CarteBancaire")) || piiCount > 10)
            return "ÉLEVÉ";

        // Risque moyen si 3-10 PII
        if (piiCount >= 3)
            return "MOYEN";

        return "FAIBLE";
    }

    private static FilePermissionAnalyzer.ExposureLevel ParseExposureLevel(string level)
    {
        return level switch
        {
            "Critique" => FilePermissionAnalyzer.ExposureLevel.Critique,
            "Élevé" => FilePermissionAnalyzer.ExposureLevel.Élevé,
            "Moyen" => FilePermissionAnalyzer.ExposureLevel.Moyen,
            _ => FilePermissionAnalyzer.ExposureLevel.Faible
        };
    }

    public string GetSummary()
    {
        var summary = new System.Text.StringBuilder();
        summary.AppendLine("=== STATISTIQUES DU SCAN ===");
        summary.AppendLine($"Fichiers scannés : {TotalFilesScanned}");
        summary.AppendLine($"Fichiers contenant des PII : {FilesWithPii}");
        summary.AppendLine($"Total de PII détectées : {TotalPiiFound}");
        summary.AppendLine();

        if (PiiByType.Any())
        {
            summary.AppendLine("Répartition par type :");
            foreach (var (type, count) in PiiByType)
            {
                var percentage = (count * 100.0 / TotalPiiFound).ToString("F1");
                summary.AppendLine($"  - {type}: {count} ({percentage}%)");
            }
        }

        return summary.ToString();
    }
}

public class FileRiskInfo
{
    public required string FilePath { get; init; }
    public int PiiCount { get; init; }
    public required string RiskLevel { get; init; }
    public DateTime? LastAccessedDate { get; init; }
    public string? StalenessLevel { get; init; }
    public string? StaleDataWarning { get; init; }

    // Informations d'exposition
    public string? ExposureLevel { get; init; }
    public bool? AccessibleToEveryone { get; init; }
    public bool? IsNetworkShare { get; init; }
    public int? UserGroupCount { get; init; }
    public string? ExposureWarning { get; init; }
}
