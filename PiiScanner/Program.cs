using PiiScanner.Scanner;
using PiiScanner.Reporting;
using PiiScanner.Models;

Console.WriteLine("=== PII SCANNER MVP ===");
Console.Write("Chemin du dossier à scanner : ");

string? path = Console.ReadLine();

if (string.IsNullOrWhiteSpace(path) || !Directory.Exists(path))
{
    Console.WriteLine("Chemin invalide.");
    return;
}

Console.WriteLine("\nScan en cours...\n");

var scanner = new FileScanner();

// Abonner à l'événement de progression
scanner.ProgressUpdated += (current, total) =>
{
    var percentage = (current * 100) / total;
    var barLength = 50;
    var filledLength = (barLength * current) / total;

    var bar = new string('█', filledLength) + new string('░', barLength - filledLength);

    Console.Write($"\r[{bar}] {percentage}% ({current}/{total} fichiers)");
};

var results = scanner.ScanDirectory(path);

// Effacer la ligne de progression et afficher "Terminé"
Console.Write("\r" + new string(' ', 100) + "\r");
Console.WriteLine("✓ Scan terminé");

// Calculer et afficher les statistiques
var stats = ScanStatistics.Calculate(results, scanner.TotalFilesScanned);

Console.WriteLine("\n" + stats.GetSummary());

// Afficher le top 5 des fichiers à risque
if (stats.TopRiskyFiles.Any())
{
    Console.WriteLine("Top 5 fichiers à risque :");
    foreach (var file in stats.TopRiskyFiles.Take(5))
    {
        var fileName = Path.GetFileName(file.FilePath);
        var riskColor = file.RiskLevel switch
        {
            "ÉLEVÉ" => "🔴",
            "MOYEN" => "🟡",
            _ => "🟢"
        };
        Console.WriteLine($"  {riskColor} [{file.RiskLevel}] {fileName} - {file.PiiCount} PII");
    }
    Console.WriteLine();
}

// Générer les rapports dans tous les formats
Console.WriteLine("\nGénération des rapports...");

CsvReport.Generate(results, "rapport_pii.csv", scanner.TotalFilesScanned);
Console.WriteLine("✓ CSV généré : rapport_pii.csv");

JsonReport.Generate(results, "rapport_pii.json", scanner.TotalFilesScanned);
Console.WriteLine("✓ JSON généré : rapport_pii.json");

HtmlReport.Generate(results, "rapport_pii.html", scanner.TotalFilesScanned);
Console.WriteLine("✓ HTML généré : rapport_pii.html");

ExcelReport.Generate(results, "rapport_pii.xlsx", scanner.TotalFilesScanned);
Console.WriteLine("✓ Excel généré : rapport_pii.xlsx");

Console.WriteLine("\nScan terminé. 4 rapports générés avec succès !");
