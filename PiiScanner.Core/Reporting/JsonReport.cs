using System.Text;
using System.Text.Json;
using PiiScanner.Models;

namespace PiiScanner.Reporting;

public static class JsonReport
{
    public static void Generate(List<ScanResult> results, string fileName, int totalFilesScanned)
    {
        var stats = ScanStatistics.Calculate(results, totalFilesScanned);

        var report = new
        {
            metadata = new
            {
                scanDate = DateTime.Now,
                version = "1.0",
                totalFilesScanned = stats.TotalFilesScanned,
                filesWithPii = stats.FilesWithPii,
                totalPiiFound = stats.TotalPiiFound
            },
            statistics = new
            {
                piiByType = stats.PiiByType.Select(kvp => new
                {
                    type = kvp.Key,
                    count = kvp.Value,
                    percentage = Math.Round(kvp.Value * 100.0 / stats.TotalPiiFound, 1)
                }).ToList(),
                topRiskyFiles = stats.TopRiskyFiles.Select(f => new
                {
                    filePath = f.FilePath,
                    fileName = Path.GetFileName(f.FilePath),
                    piiCount = f.PiiCount,
                    riskLevel = f.RiskLevel
                }).ToList()
            },
            detections = results.Select(r => new
            {
                filePath = r.FilePath,
                fileName = Path.GetFileName(r.FilePath),
                piiType = r.PiiType,
                match = r.Match
            }).ToList()
        };

        var options = new JsonSerializerOptions
        {
            WriteIndented = true,
            PropertyNamingPolicy = JsonNamingPolicy.CamelCase,
            Encoder = System.Text.Encodings.Web.JavaScriptEncoder.UnsafeRelaxedJsonEscaping
        };

        var json = JsonSerializer.Serialize(report, options);
        File.WriteAllText(fileName, json, Encoding.UTF8);
    }
}
