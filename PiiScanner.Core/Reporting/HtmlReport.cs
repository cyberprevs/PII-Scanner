using System.Text;
using PiiScanner.Models;

namespace PiiScanner.Reporting;

public static class HtmlReport
{
    public static void Generate(List<ScanResult> results, string outputPath, int totalFilesScanned)
    {
        var stats = ScanStatistics.Calculate(results, totalFilesScanned);
        var html = new StringBuilder();

        html.AppendLine("<!DOCTYPE html>");
        html.AppendLine("<html lang='fr'>");
        html.AppendLine("<head>");
        html.AppendLine("    <meta charset='UTF-8'>");
        html.AppendLine("    <meta name='viewport' content='width=device-width, initial-scale=1.0'>");
        html.AppendLine("    <title>Rapport PII Scanner</title>");
        html.AppendLine("    <style>");
        html.AppendLine(@"
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background: #f5f5f5; padding: 20px; }
        .container { max-width: 1200px; margin: 0 auto; background: white; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; border-radius: 10px 10px 0 0; }
        .header h1 { margin-bottom: 10px; }
        .header p { opacity: 0.9; }
        .stats { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; padding: 30px; }
        .stat-card { background: #f8f9fa; padding: 20px; border-radius: 8px; border-left: 4px solid #667eea; }
        .stat-card h3 { color: #667eea; font-size: 2em; margin-bottom: 5px; }
        .stat-card p { color: #666; }
        .section { padding: 30px; border-top: 1px solid #eee; }
        .section h2 { margin-bottom: 20px; color: #333; }
        .chart { margin: 20px 0; }
        .bar { background: #667eea; height: 30px; border-radius: 5px; margin: 10px 0; position: relative; }
        .bar-label { position: absolute; left: 10px; top: 50%; transform: translateY(-50%); color: white; font-weight: bold; }
        .bar-value { margin-left: 10px; color: #666; }
        .risk-high { color: #dc3545; font-weight: bold; }
        .risk-medium { color: #ffc107; font-weight: bold; }
        .risk-low { color: #28a745; font-weight: bold; }
        table { width: 100%; border-collapse: collapse; margin-top: 20px; }
        th, td { padding: 12px; text-align: left; border-bottom: 1px solid #ddd; }
        th { background: #f8f9fa; font-weight: 600; color: #333; position: sticky; top: 0; }
        tr:hover { background: #f8f9fa; }
        .badge { display: inline-block; padding: 4px 8px; border-radius: 4px; font-size: 0.85em; font-weight: bold; }
        .badge-email { background: #e3f2fd; color: #1976d2; }
        .badge-phone { background: #f3e5f5; color: #7b1fa2; }
        .badge-date { background: #fff3e0; color: #f57c00; }
        .badge-bank { background: #ffebee; color: #c62828; }
        .badge-id { background: #e8f5e9; color: #388e3c; }
        .badge-ip { background: #fce4ec; color: #c2185b; }
        .file-path { font-family: 'Courier New', monospace; font-size: 0.9em; color: #666; }
    </style>");
        html.AppendLine("</head>");
        html.AppendLine("<body>");
        html.AppendLine("    <div class='container'>");

        // Header
        html.AppendLine("        <div class='header'>");
        html.AppendLine("            <h1>📊 Rapport de Scan PII</h1>");
        html.AppendLine($"            <p>Généré le {DateTime.Now:dd/MM/yyyy à HH:mm:ss}</p>");
        html.AppendLine("        </div>");

        // Statistics Cards
        html.AppendLine("        <div class='stats'>");
        html.AppendLine($"            <div class='stat-card'><h3>{stats.TotalFilesScanned}</h3><p>Fichiers scannés</p></div>");
        html.AppendLine($"            <div class='stat-card'><h3>{stats.FilesWithPii}</h3><p>Fichiers avec PII</p></div>");
        html.AppendLine($"            <div class='stat-card'><h3>{stats.TotalPiiFound}</h3><p>PII détectées</p></div>");
        html.AppendLine("        </div>");

        // PII Distribution Chart
        if (stats.PiiByType.Any())
        {
            html.AppendLine("        <div class='section'>");
            html.AppendLine("            <h2>📈 Répartition par type de PII</h2>");
            html.AppendLine("            <div class='chart'>");

            var maxCount = stats.PiiByType.Values.Max();
            foreach (var (type, count) in stats.PiiByType)
            {
                var percentage = (count * 100.0 / stats.TotalPiiFound);
                var width = (count * 100.0 / maxCount);
                html.AppendLine($"                <div class='bar' style='width: {width}%'>");
                html.AppendLine($"                    <span class='bar-label'>{type}</span>");
                html.AppendLine($"                </div>");
                html.AppendLine($"                <div class='bar-value'>{count} ({percentage:F1}%)</div>");
            }

            html.AppendLine("            </div>");
            html.AppendLine("        </div>");
        }

        // Top Risky Files
        if (stats.TopRiskyFiles.Any())
        {
            html.AppendLine("        <div class='section'>");
            html.AppendLine("            <h2>⚠️ Fichiers à risque</h2>");
            html.AppendLine("            <table>");
            html.AppendLine("                <tr><th>Niveau</th><th>Fichier</th><th>Nombre de PII</th></tr>");

            foreach (var file in stats.TopRiskyFiles.Take(10))
            {
                var riskClass = file.RiskLevel switch
                {
                    "ÉLEVÉ" => "risk-high",
                    "MOYEN" => "risk-medium",
                    _ => "risk-low"
                };
                var shortFileName = Path.GetFileName(file.FilePath);

                html.AppendLine("                <tr>");
                html.AppendLine($"                    <td class='{riskClass}'>{file.RiskLevel}</td>");
                html.AppendLine($"                    <td class='file-path'>{shortFileName}</td>");
                html.AppendLine($"                    <td>{file.PiiCount}</td>");
                html.AppendLine("                </tr>");
            }

            html.AppendLine("            </table>");
            html.AppendLine("        </div>");
        }

        // Detections Table
        html.AppendLine("        <div class='section'>");
        html.AppendLine("            <h2>🔍 Détails des détections</h2>");
        html.AppendLine("            <table>");
        html.AppendLine("                <tr><th>Type</th><th>Valeur</th><th>Fichier</th></tr>");

        foreach (var result in results.Take(500)) // Limit to first 500 for performance
        {
            var badgeClass = GetBadgeClass(result.PiiType);
            var fileName = Path.GetFileName(result.FilePath);

            html.AppendLine("                <tr>");
            html.AppendLine($"                    <td><span class='badge {badgeClass}'>{result.PiiType}</span></td>");
            html.AppendLine($"                    <td>{System.Web.HttpUtility.HtmlEncode(result.Match)}</td>");
            html.AppendLine($"                    <td class='file-path'>{System.Web.HttpUtility.HtmlEncode(fileName)}</td>");
            html.AppendLine("                </tr>");
        }

        if (results.Count > 500)
        {
            html.AppendLine($"                <tr><td colspan='3' style='text-align: center; color: #999;'>... et {results.Count - 500} autres détections</td></tr>");
        }

        html.AppendLine("            </table>");
        html.AppendLine("        </div>");

        html.AppendLine("    </div>");
        html.AppendLine("</body>");
        html.AppendLine("</html>");

        File.WriteAllText(outputPath, html.ToString(), Encoding.UTF8);
    }

    private static string GetBadgeClass(string piiType)
    {
        return piiType switch
        {
            "Email" => "badge-email",
            "TelephoneFR" or "TelephoneBJ" => "badge-phone",
            "DateNaissance" => "badge-date",
            "IBAN_FR" or "IBAN_BJ" or "CarteBancaire" => "badge-bank",
            "NumeroSecu" or "NumeroFiscalFR" or "IFU_Benin" => "badge-id",
            "AdresseIP" => "badge-ip",
            _ => "badge-email"
        };
    }
}
