using System.Text;
using PiiScanner.Models;

namespace PiiScanner.Reporting;

public static class CsvReport
{
    public static void Generate(List<ScanResult> results, string fileName, int totalFilesScanned)
    {
        var sb = new StringBuilder();

        // Calculer les statistiques
        var stats = ScanStatistics.Calculate(results, totalFilesScanned);

        // Ajouter les statistiques en en-tête (commentées avec #)
        sb.AppendLine("# === RAPPORT DE SCAN PII ===");
        sb.AppendLine($"# Date: {DateTime.Now:yyyy-MM-dd HH:mm:ss}");
        sb.AppendLine("#");
        sb.AppendLine($"# Fichiers scannés: {stats.TotalFilesScanned}");
        sb.AppendLine($"# Fichiers avec PII: {stats.FilesWithPii}");
        sb.AppendLine($"# Total PII détectées: {stats.TotalPiiFound}");
        sb.AppendLine("#");

        // Répartition par type
        if (stats.PiiByType.Any())
        {
            sb.AppendLine("# Répartition par type:");
            foreach (var (type, count) in stats.PiiByType)
            {
                var percentage = (count * 100.0 / stats.TotalPiiFound).ToString("F1");
                sb.AppendLine($"#   - {type}: {count} ({percentage}%)");
            }
            sb.AppendLine("#");
        }

        // Top fichiers à risque
        if (stats.TopRiskyFiles.Any())
        {
            sb.AppendLine("# Top fichiers à risque:");
            foreach (var file in stats.TopRiskyFiles.Take(5))
            {
                var shortName = Path.GetFileName(file.FilePath);
                sb.AppendLine($"#   [{file.RiskLevel}] {shortName} - {file.PiiCount} PII");
            }
            sb.AppendLine("#");
        }

        sb.AppendLine("# === DÉTAILS DES DÉTECTIONS ===");
        sb.AppendLine("Fichier;Type;Valeur");

        // Ajouter les résultats
        foreach (var r in results)
        {
            sb.AppendLine($"{r.FilePath};{r.PiiType};{r.Match}");
        }

        File.WriteAllText(fileName, sb.ToString(), Encoding.UTF8);
    }

    // Méthode pour compatibilité avec l'ancien code
    public static void Generate(List<ScanResult> results, string fileName)
    {
        Generate(results, fileName, 0);
    }
}

