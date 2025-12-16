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
        .container { max-width: 1400px; margin: 0 auto; background: white; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; border-radius: 10px 10px 0 0; }
        .header h1 { margin-bottom: 10px; }
        .header p { opacity: 0.9; }
        .stats { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; padding: 30px; }
        .stat-card { background: #f8f9fa; padding: 20px; border-radius: 8px; border-left: 4px solid #667eea; }
        .stat-card h3 { color: #667eea; font-size: 2em; margin-bottom: 5px; }
        .stat-card p { color: #666; }
        .section { padding: 30px; border-top: 1px solid #eee; }
        .section h2 { margin-bottom: 20px; color: #333; }
        .legend { background: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 30px; border-left: 4px solid #667eea; }
        .legend h3 { color: #333; margin-bottom: 15px; font-size: 1.2em; }
        .legend-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 20px; }
        .legend-category { margin-bottom: 10px; }
        .legend-category h4 { font-size: 0.95em; color: #555; margin-bottom: 8px; }
        .legend-item { display: flex; align-items: center; gap: 8px; margin: 5px 0; font-size: 0.9em; }
        .chart { margin: 20px 0; }
        .charts-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(350px, 1fr)); gap: 30px; margin: 30px 0; }
        .chart-container { background: #f9f9f9; padding: 20px; border-radius: 8px; }
        .chart-container h3 { margin-bottom: 15px; font-size: 1.1em; color: #333; }
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
        .warning-row { background: rgba(255, 152, 0, 0.08); }
        .warning-row td { padding: 8px 12px; }
        .alert { padding: 10px 15px; border-radius: 5px; margin: 5px 0; font-size: 0.9em; }
        .alert-warning { background: #fff3cd; border-left: 4px solid #ffc107; color: #856404; }
        .alert-error { background: #f8d7da; border-left: 4px solid #dc3545; color: #721c24; }
        .badge { display: inline-block; padding: 4px 8px; border-radius: 4px; font-size: 0.85em; font-weight: bold; margin: 2px; }
        .badge-email { background: #e3f2fd; color: #1976d2; }
        .badge-phone { background: #f3e5f5; color: #7b1fa2; }
        .badge-date { background: #fff3e0; color: #f57c00; }
        .badge-bank { background: #ffebee; color: #c62828; }
        .badge-id { background: #e8f5e9; color: #388e3c; }
        .badge-ip { background: #fce4ec; color: #c2185b; }
        .badge-success { background: #4caf50; color: white; }
        .badge-warning { background: #ff9800; color: white; }
        .badge-error { background: #f44336; color: white; }
        .badge-info { background: #2196f3; color: white; }
        .badge-outline { background: white; border: 1px solid #ddd; color: #666; }
        .file-path { font-family: 'Courier New', monospace; font-size: 0.9em; color: #666; }
        .badges-group { display: flex; flex-wrap: wrap; gap: 5px; align-items: center; }
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
        html.AppendLine($"            <div class='stat-card'><h3>{stats.PiiByType.Count}</h3><p>Types de PII</p></div>");
        html.AppendLine("        </div>");

        // Légende des indicateurs
        html.AppendLine("        <div class='section'>");
        html.AppendLine("            <div class='legend'>");
        html.AppendLine("                <h3>📖 Légende des indicateurs</h3>");
        html.AppendLine("                <div class='legend-grid'>");

        // Niveau de risque
        html.AppendLine("                    <div class='legend-category'>");
        html.AppendLine("                        <h4>🎯 Niveau de risque (basé sur le nombre de PII)</h4>");
        html.AppendLine("                        <div class='legend-item'><span class='badge badge-success'>FAIBLE</span> 1-5 PII détectées</div>");
        html.AppendLine("                        <div class='legend-item'><span class='badge badge-warning'>MOYEN</span> 6-15 PII détectées</div>");
        html.AppendLine("                        <div class='legend-item'><span class='badge badge-error'>ÉLEVÉ</span> 16+ PII détectées</div>");
        html.AppendLine("                    </div>");

        // Ancienneté
        html.AppendLine("                    <div class='legend-category'>");
        html.AppendLine("                        <h4>⏰ Ancienneté (dernier accès au fichier)</h4>");
        html.AppendLine("                        <div class='legend-item'><span class='badge' style='background: #4caf50; color: white;'>Récent</span> Moins de 6 mois</div>");
        html.AppendLine("                        <div class='legend-item'><span class='badge' style='background: #8bc34a; color: white;'>6 mois</span> 6 mois - 1 an</div>");
        html.AppendLine("                        <div class='legend-item'><span class='badge' style='background: #ff9800; color: white;'>1 an</span> 1 an - 3 ans</div>");
        html.AppendLine("                        <div class='legend-item'><span class='badge' style='background: #ff5722; color: white;'>3 ans</span> 3 ans - 5 ans</div>");
        html.AppendLine("                        <div class='legend-item'><span class='badge' style='background: #f44336; color: white;'>+5 ans</span> Plus de 5 ans</div>");
        html.AppendLine("                    </div>");

        // Exposition
        html.AppendLine("                    <div class='legend-category'>");
        html.AppendLine("                        <h4>🔓 Exposition (permissions d'accès Windows)</h4>");
        html.AppendLine("                        <div class='legend-item'><span class='badge badge-success'>Faible</span> Moins de 5 groupes</div>");
        html.AppendLine("                        <div class='legend-item'><span class='badge badge-warning'>Moyen</span> 5-10 groupes</div>");
        html.AppendLine("                        <div class='legend-item'><span class='badge badge-warning'>Élevé</span> 10+ groupes ou Authenticated Users</div>");
        html.AppendLine("                        <div class='legend-item'><span class='badge badge-error'>Critique</span> Everyone ou partage réseau public</div>");
        html.AppendLine("                    </div>");

        html.AppendLine("                </div>");
        html.AppendLine("            </div>");
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

        // Graphiques Niveau de Risque, Ancienneté et Exposition
        html.AppendLine("        <div class='section'>");
        html.AppendLine("            <h2>📊 Analyse des fichiers</h2>");
        html.AppendLine("            <div class='charts-grid'>");

        // Graphique Niveau de Risque
        var riskStats = new Dictionary<string, int>
        {
            { "FAIBLE", stats.TopRiskyFiles.Count(f => f.RiskLevel == "FAIBLE") },
            { "MOYEN", stats.TopRiskyFiles.Count(f => f.RiskLevel == "MOYEN") },
            { "ÉLEVÉ", stats.TopRiskyFiles.Count(f => f.RiskLevel == "ÉLEVÉ") }
        };

        if (riskStats.Values.Sum() > 0)
        {
            html.AppendLine("                <div class='chart-container'>");
            html.AppendLine("                    <h3>🎯 Niveau de risque des fichiers</h3>");
            var maxRisk = riskStats.Values.Max();
            foreach (var (level, count) in riskStats)
            {
                if (count > 0)
                {
                    var width = maxRisk > 0 ? (count * 100.0 / maxRisk) : 0;
                    var color = level switch
                    {
                        "ÉLEVÉ" => "#f44336",
                        "MOYEN" => "#ff9800",
                        _ => "#4caf50"
                    };
                    html.AppendLine($"                    <div class='bar' style='width: {width}%; background: {color};'>");
                    html.AppendLine($"                        <span class='bar-label'>{level}</span>");
                    html.AppendLine($"                    </div>");
                    html.AppendLine($"                    <div class='bar-value'>{count} fichier(s)</div>");
                }
            }
            html.AppendLine("                </div>");
        }

        // Graphique Ancienneté (Stale Data)
        var stalenessStats = new Dictionary<string, int>
        {
            { "Récent", stats.TopRiskyFiles.Count(f => f.StalenessLevel == "Récent") },
            { "6 mois", stats.TopRiskyFiles.Count(f => f.StalenessLevel == "6 mois") },
            { "1 an", stats.TopRiskyFiles.Count(f => f.StalenessLevel == "1 an") },
            { "3 ans", stats.TopRiskyFiles.Count(f => f.StalenessLevel == "3 ans") },
            { "+5 ans", stats.TopRiskyFiles.Count(f => f.StalenessLevel == "+5 ans") }
        };

        if (stalenessStats.Values.Sum() > 0)
        {
            html.AppendLine("                <div class='chart-container'>");
            html.AppendLine("                    <h3>⏰ Ancienneté des fichiers (Stale Data)</h3>");
            var maxStaleness = stalenessStats.Values.Max();
            foreach (var (level, count) in stalenessStats)
            {
                if (count > 0)
                {
                    var width = maxStaleness > 0 ? (count * 100.0 / maxStaleness) : 0;
                    var color = level switch
                    {
                        "+5 ans" => "#f44336",
                        "3 ans" => "#ff5722",
                        "1 an" => "#ff9800",
                        "6 mois" => "#8bc34a",
                        _ => "#4caf50"
                    };
                    html.AppendLine($"                    <div class='bar' style='width: {width}%; background: {color};'>");
                    html.AppendLine($"                        <span class='bar-label'>{level}</span>");
                    html.AppendLine($"                    </div>");
                    html.AppendLine($"                    <div class='bar-value'>{count} fichier(s)</div>");
                }
            }
            html.AppendLine("                </div>");
        }

        // Graphique Exposition (Over-Exposed Data)
        var exposureStats = new Dictionary<string, int>
        {
            { "Faible", stats.TopRiskyFiles.Count(f => f.ExposureLevel == "Faible") },
            { "Moyen", stats.TopRiskyFiles.Count(f => f.ExposureLevel == "Moyen") },
            { "Élevé", stats.TopRiskyFiles.Count(f => f.ExposureLevel == "Élevé") },
            { "Critique", stats.TopRiskyFiles.Count(f => f.ExposureLevel == "Critique") }
        };

        if (exposureStats.Values.Sum() > 0)
        {
            html.AppendLine("                <div class='chart-container'>");
            html.AppendLine("                    <h3>🔓 Niveau d'exposition (Over-Exposed Data)</h3>");
            var maxExposure = exposureStats.Values.Max();
            foreach (var (level, count) in exposureStats)
            {
                if (count > 0)
                {
                    var width = maxExposure > 0 ? (count * 100.0 / maxExposure) : 0;
                    var color = level switch
                    {
                        "Critique" => "#f44336",
                        "Élevé" => "#ff5722",
                        "Moyen" => "#ff9800",
                        _ => "#4caf50"
                    };
                    html.AppendLine($"                    <div class='bar' style='width: {width}%; background: {color};'>");
                    html.AppendLine($"                        <span class='bar-label'>{level}</span>");
                    html.AppendLine($"                    </div>");
                    html.AppendLine($"                    <div class='bar-value'>{count} fichier(s)</div>");
                }
            }
            html.AppendLine("                </div>");
        }

        html.AppendLine("            </div>");
        html.AppendLine("        </div>");

        // Top Risky Files
        if (stats.TopRiskyFiles.Any())
        {
            html.AppendLine("        <div class='section'>");
            html.AppendLine("            <h2>⚠️ Fichiers à risque</h2>");
            html.AppendLine("            <table>");
            html.AppendLine("                <tr><th>Niveau de risque</th><th>Fichier</th><th>Nombre de PII</th><th>Ancienneté</th><th>Exposition</th></tr>");

            foreach (var file in stats.TopRiskyFiles)
            {
                var riskClass = file.RiskLevel switch
                {
                    "ÉLEVÉ" => "risk-high",
                    "MOYEN" => "risk-medium",
                    _ => "risk-low"
                };
                var shortFileName = Path.GetFileName(file.FilePath);

                html.AppendLine("                <tr>");
                html.AppendLine($"                    <td><span class='badge {GetRiskBadgeClass(file.RiskLevel)}'>{file.RiskLevel}</span></td>");
                html.AppendLine($"                    <td class='file-path' title='{System.Web.HttpUtility.HtmlEncode(file.FilePath)}'>{System.Web.HttpUtility.HtmlEncode(shortFileName)}</td>");
                html.AppendLine($"                    <td><span class='badge badge-info'>{file.PiiCount}</span></td>");
                html.AppendLine($"                    <td>");
                if (!string.IsNullOrEmpty(file.StalenessLevel))
                {
                    html.AppendLine($"                        <span class='badge' style='background: {GetStalenessColor(file.StalenessLevel)}; color: white;'>{file.StalenessLevel}</span>");
                }
                html.AppendLine($"                    </td>");
                html.AppendLine($"                    <td>");
                if (!string.IsNullOrEmpty(file.ExposureLevel))
                {
                    var badges = new List<string>();
                    badges.Add($"<span class='badge {GetExposureBadgeClass(file.ExposureLevel)}'>{file.ExposureLevel}</span>");
                    if (file.AccessibleToEveryone == true)
                    {
                        badges.Add("<span class='badge badge-error' style='font-size: 0.75em;'>Everyone</span>");
                    }
                    if (file.IsNetworkShare == true)
                    {
                        badges.Add("<span class='badge badge-warning' style='font-size: 0.75em;'>Réseau</span>");
                    }
                    html.AppendLine($"                        <div class='badges-group'>{string.Join(" ", badges)}</div>");
                }
                html.AppendLine($"                    </td>");
                html.AppendLine("                </tr>");

                // Warning rows
                if (!string.IsNullOrEmpty(file.StaleDataWarning))
                {
                    html.AppendLine("                <tr class='warning-row'>");
                    html.AppendLine($"                    <td colspan='5'><div class='alert alert-warning'>{System.Web.HttpUtility.HtmlEncode(file.StaleDataWarning)}</div></td>");
                    html.AppendLine("                </tr>");
                }
                if (!string.IsNullOrEmpty(file.ExposureWarning))
                {
                    var alertClass = file.ExposureLevel == "Critique" ? "alert-error" : "alert-warning";
                    html.AppendLine("                <tr class='warning-row'>");
                    html.AppendLine($"                    <td colspan='5'><div class='alert {alertClass}'>{System.Web.HttpUtility.HtmlEncode(file.ExposureWarning)}</div></td>");
                    html.AppendLine("                </tr>");
                }
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
            "Telephone" or "MobileMoney_MTN" or "MobileMoney_Moov" => "badge-phone",
            "DateNaissance" => "badge-date",
            "IBAN" or "CarteBancaire" => "badge-bank",
            "CNSS" or "RAMU" or "IFU" or "CNI_Benin" or "Passeport_Benin" or "RCCM" or "ActeNaissance" or "INE" or "Matricule_Fonctionnaire" => "badge-id",
            "MotDePasse" or "CleAPI_AWS" or "Token_JWT" => "badge-ip",
            _ => "badge-email"
        };
    }

    private static string GetRiskBadgeClass(string riskLevel)
    {
        return riskLevel switch
        {
            "ÉLEVÉ" => "badge-error",
            "MOYEN" => "badge-warning",
            _ => "badge-success"
        };
    }

    private static string GetStalenessColor(string stalenessLevel)
    {
        return stalenessLevel switch
        {
            "+5 ans" => "#f44336",
            "3 ans" => "#ff5722",
            "1 an" => "#ff9800",
            "6 mois" => "#8bc34a",
            _ => "#4caf50"
        };
    }

    private static string GetExposureBadgeClass(string exposureLevel)
    {
        return exposureLevel switch
        {
            "Critique" => "badge-error",
            "Élevé" => "badge-warning",
            "Moyen" => "badge-warning",
            _ => "badge-success"
        };
    }
}
