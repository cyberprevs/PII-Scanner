using DocumentFormat.OpenXml.Packaging;
using WordprocessingText = DocumentFormat.OpenXml.Wordprocessing.Text;
using DocumentFormat.OpenXml.Spreadsheet;
using UglyToad.PdfPig;
using System.Text;

namespace PiiScanner.Reader;

public static class DocumentReader
{
    public static string ReadFile(string filePath)
    {
        string extension = Path.GetExtension(filePath).ToLower();

        return extension switch
        {
            ".docx" => ReadWordDocument(filePath),
            ".xlsx" => ReadExcelDocument(filePath),
            ".pdf" => ReadPdfDocument(filePath),
            ".txt" or ".log" or ".csv" or ".json" => File.ReadAllText(filePath),
            _ => string.Empty
        };
    }

    private static string ReadWordDocument(string filePath)
    {
        try
        {
            using var doc = WordprocessingDocument.Open(filePath, false);
            var body = doc.MainDocumentPart?.Document?.Body;

            if (body == null)
                return string.Empty;

            var sb = new StringBuilder();
            foreach (var text in body.Descendants<WordprocessingText>())
            {
                sb.Append(text.Text);
            }

            return sb.ToString();
        }
        catch
        {
            return string.Empty;
        }
    }

    private static string ReadExcelDocument(string filePath)
    {
        try
        {
            using var doc = SpreadsheetDocument.Open(filePath, false);
            var workbookPart = doc.WorkbookPart;

            if (workbookPart == null)
                return string.Empty;

            var sb = new StringBuilder();
            var sheets = workbookPart.Workbook.Descendants<Sheet>();

            foreach (var sheet in sheets)
            {
                var worksheetPart = (WorksheetPart)workbookPart.GetPartById(sheet.Id!);
                var sheetData = worksheetPart.Worksheet.Elements<SheetData>().First();

                foreach (var row in sheetData.Elements<Row>())
                {
                    foreach (var cell in row.Elements<Cell>())
                    {
                        string cellValue = GetCellValue(cell, workbookPart);
                        if (!string.IsNullOrEmpty(cellValue))
                        {
                            sb.Append(cellValue);
                            sb.Append(' ');
                        }
                    }
                    sb.AppendLine();
                }
            }

            return sb.ToString();
        }
        catch
        {
            return string.Empty;
        }
    }

    private static string GetCellValue(Cell cell, WorkbookPart workbookPart)
    {
        if (cell.CellValue == null)
            return string.Empty;

        string value = cell.CellValue.Text;

        if (cell.DataType != null && cell.DataType.Value == CellValues.SharedString)
        {
            var stringTable = workbookPart.SharedStringTablePart?.SharedStringTable;
            if (stringTable != null)
            {
                return stringTable.ElementAt(int.Parse(value)).InnerText;
            }
        }

        return value;
    }

    private static string ReadPdfDocument(string filePath)
    {
        try
        {
            var sb = new StringBuilder();

            using var document = PdfDocument.Open(filePath);
            foreach (var page in document.GetPages())
            {
                string text = page.Text;
                sb.Append(text);
                sb.Append(' ');
            }

            return sb.ToString();
        }
        catch
        {
            return string.Empty;
        }
    }
}
