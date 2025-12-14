using DocumentFormat.OpenXml;
using DocumentFormat.OpenXml.Packaging;
using DocumentFormat.OpenXml.Spreadsheet;
using PiiScanner.Models;

namespace PiiScanner.Reporting;

public static class ExcelReport
{
    public static void Generate(List<ScanResult> results, string fileName, int totalFilesScanned)
    {
        var stats = ScanStatistics.Calculate(results, totalFilesScanned);

        using var document = SpreadsheetDocument.Create(fileName, SpreadsheetDocumentType.Workbook);
        var workbookPart = document.AddWorkbookPart();
        workbookPart.Workbook = new Workbook();

        var sheets = workbookPart.Workbook.AppendChild(new Sheets());

        // Feuille 1: Statistiques
        CreateStatisticsSheet(workbookPart, sheets, stats, 1);

        // Feuille 2: Fichiers à risque
        CreateRiskyFilesSheet(workbookPart, sheets, stats, 2);

        // Feuille 3: Détails des détections
        CreateDetectionsSheet(workbookPart, sheets, results, 3);

        workbookPart.Workbook.Save();
    }

    private static void CreateStatisticsSheet(WorkbookPart workbookPart, Sheets sheets, ScanStatistics stats, uint sheetId)
    {
        var worksheetPart = workbookPart.AddNewPart<WorksheetPart>();
        worksheetPart.Worksheet = new Worksheet(new SheetData());

        var sheet = new Sheet
        {
            Id = workbookPart.GetIdOfPart(worksheetPart),
            SheetId = sheetId,
            Name = "Statistiques"
        };
        sheets.Append(sheet);

        var sheetData = worksheetPart.Worksheet.GetFirstChild<SheetData>()!;

        // En-tête
        AppendRow(sheetData, "RAPPORT DE SCAN PII", $"Date: {DateTime.Now:yyyy-MM-dd HH:mm:ss}");
        AppendRow(sheetData);

        // Statistiques générales
        AppendRow(sheetData, "Statistiques générales");
        AppendRow(sheetData, "Fichiers scannés:", stats.TotalFilesScanned.ToString());
        AppendRow(sheetData, "Fichiers avec PII:", stats.FilesWithPii.ToString());
        AppendRow(sheetData, "Total PII détectées:", stats.TotalPiiFound.ToString());
        AppendRow(sheetData);

        // Répartition par type
        AppendRow(sheetData, "Répartition par type de PII");
        AppendRow(sheetData, "Type", "Nombre", "Pourcentage");

        foreach (var (type, count) in stats.PiiByType)
        {
            var percentage = (count * 100.0 / stats.TotalPiiFound).ToString("F1") + "%";
            AppendRow(sheetData, type, count.ToString(), percentage);
        }
    }

    private static void CreateRiskyFilesSheet(WorkbookPart workbookPart, Sheets sheets, ScanStatistics stats, uint sheetId)
    {
        var worksheetPart = workbookPart.AddNewPart<WorksheetPart>();
        worksheetPart.Worksheet = new Worksheet(new SheetData());

        var sheet = new Sheet
        {
            Id = workbookPart.GetIdOfPart(worksheetPart),
            SheetId = sheetId,
            Name = "Fichiers à risque"
        };
        sheets.Append(sheet);

        var sheetData = worksheetPart.Worksheet.GetFirstChild<SheetData>()!;

        // En-tête
        AppendRow(sheetData, "Niveau de risque", "Fichier", "Nombre de PII", "Chemin complet");

        foreach (var file in stats.TopRiskyFiles)
        {
            var fileName = Path.GetFileName(file.FilePath);
            AppendRow(sheetData, file.RiskLevel, fileName, file.PiiCount.ToString(), file.FilePath);
        }
    }

    private static void CreateDetectionsSheet(WorkbookPart workbookPart, Sheets sheets, List<ScanResult> results, uint sheetId)
    {
        var worksheetPart = workbookPart.AddNewPart<WorksheetPart>();
        worksheetPart.Worksheet = new Worksheet(new SheetData());

        var sheet = new Sheet
        {
            Id = workbookPart.GetIdOfPart(worksheetPart),
            SheetId = sheetId,
            Name = "Détections"
        };
        sheets.Append(sheet);

        var sheetData = worksheetPart.Worksheet.GetFirstChild<SheetData>()!;

        // En-tête avec filtres
        AppendRow(sheetData, "Type PII", "Valeur", "Fichier", "Chemin complet");

        foreach (var result in results)
        {
            var fileName = Path.GetFileName(result.FilePath);
            AppendRow(sheetData, result.PiiType, result.Match, fileName, result.FilePath);
        }

        // Ajouter l'auto-filtre sur la première ligne
        var autoFilter = new AutoFilter
        {
            Reference = $"A1:D{results.Count + 1}"
        };
        worksheetPart.Worksheet.Append(autoFilter);
    }

    private static void AppendRow(SheetData sheetData, params string[] values)
    {
        var row = new Row();

        foreach (var value in values)
        {
            var cell = new Cell
            {
                DataType = CellValues.String,
                CellValue = new CellValue(value)
            };
            row.Append(cell);
        }

        sheetData.Append(row);
    }
}
