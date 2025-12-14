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
            .Select(g => new FileRiskInfo
            {
                FilePath = g.Key,
                PiiCount = g.Count(),
                RiskLevel = CalculateRiskLevel(g.Count(), g.Select(r => r.PiiType).Distinct().ToList())
            })
            .OrderByDescending(f => f.PiiCount)
            .Take(10)
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
}
