# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

PII Scanner is a .NET 8.0 console application that scans directories for Personally Identifiable Information (PII) in text files. It uses regex-based pattern matching to detect PII types and generates CSV reports.

## Build and Run Commands

```bash
# Build the project
dotnet build

# Run the application
dotnet run

# Build for release
dotnet build -c Release

# Run without building
dotnet run --no-build
```

## Architecture

### Core Components

The application follows a clean separation of concerns across five main namespaces:

1. **Scanner** ([Scanner/FileScanner.cs](Scanner/FileScanner.cs))
   - Entry point for directory scanning
   - Filters files by allowed extensions: `.txt`, `.log`, `.csv`, `.json`, `.docx`, `.xlsx`, `.pdf`
   - Recursively traverses directories with error handling for inaccessible files
   - **Parallel processing** using Parallel.ForEach for improved performance
   - Uses ConcurrentBag for thread-safe result collection
   - Progress tracking with event-based notifications
   - MaxDegreeOfParallelism set to CPU core count

2. **Reader** ([Reader/DocumentReader.cs](Reader/DocumentReader.cs))
   - Static class for extracting text from various document formats
   - Uses DocumentFormat.OpenXml for Word (.docx) and Excel (.xlsx) files
   - Uses PdfPig for PDF (.pdf) files
   - Handles text extraction from different formats into unified string output

3. **Analysis** ([Analysis/PiiDetector.cs](Analysis/PiiDetector.cs))
   - Static class containing PII detection logic
   - Maintains dictionary of PII patterns with strict validation
   - Detects 11 types of PII: Email, TelephoneFR, TelephoneBJ, DateNaissance, NumeroSecu, NumeroFiscalFR, IFU_Benin, IBAN_FR, IBAN_BJ, CarteBancaire, AdresseIP
   - Uses System.Text.RegularExpressions for pattern matching
   - Includes advanced post-validation logic (Luhn algorithm for cards, date validation, etc.)
   - Returns list of ScanResult objects for each match found

4. **Models** ([Models/ScanResult.cs](Models/ScanResult.cs))
   - Data transfer object with required init-only properties
   - Represents a single PII detection: FilePath, PiiType, Match

5. **Reporting** - Multiple export formats available:

   **CsvReport** ([Reporting/CsvReport.cs](Reporting/CsvReport.cs))
   - CSV format with statistics in header (# prefix comments)
   - Semicolon-delimited format with UTF-8 encoding
   - Header: "Fichier;Type;Valeur"
   - Best for: Excel import, data processing

   **JsonReport** ([Reporting/JsonReport.cs](Reporting/JsonReport.cs))
   - Structured JSON with metadata, statistics, and detections
   - Includes percentages and file names
   - Best for: API integration, programmatic access

   **HtmlReport** ([Reporting/HtmlReport.cs](Reporting/HtmlReport.cs))
   - Visual HTML report with modern design
   - Interactive tables, color-coded risk levels
   - Statistical charts and graphs
   - Best for: Presentation, management reporting

   **ExcelReport** ([Reporting/ExcelReport.cs](Reporting/ExcelReport.cs))
   - Multi-sheet Excel workbook (.xlsx)
   - Sheet 1: Statistics, Sheet 2: Risky files, Sheet 3: Detections
   - Auto-filters enabled on detections sheet
   - Best for: Data analysis, filtering, sharing

**Statistics** ([Models/ScanStatistics.cs](Models/ScanStatistics.cs))
   - Calculates comprehensive scan statistics
   - Tracks total files scanned, files with PII, and total PII found
   - Provides PII distribution by type with percentages
   - Identifies top risky files with risk level scoring (ÉLEVÉ/MOYEN/FAIBLE)
   - Risk calculation: ÉLEVÉ if banking data or >10 PII, MOYEN if 3-10 PII, FAIBLE otherwise

### Application Flow

[Program.cs](Program.cs) orchestrates the workflow:
1. Prompts user for directory path
2. Validates directory exists
3. Displays real-time progress bar during scan (█░ format with percentage)
4. Invokes FileScanner.ScanDirectory() with parallel processing
5. Calculates and displays statistics in console
6. Shows top 5 risky files with risk levels (🔴 ÉLEVÉ, 🟡 MOYEN, 🟢 FAIBLE)
7. Generates 4 report formats:
   - rapport_pii.csv (CSV with statistics)
   - rapport_pii.json (JSON structured data)
   - rapport_pii.html (Visual HTML report)
   - rapport_pii.xlsx (Excel workbook with 3 sheets)
8. Console output in French

## Performance Optimizations

- **Parallel File Processing**: Uses `Parallel.ForEach` to process multiple files simultaneously
- **Thread-Safe Collections**: `ConcurrentBag<ScanResult>` for safe multi-threaded access
- **CPU Utilization**: Automatically uses all available CPU cores
- **Progress Tracking**: Real-time progress bar with file count and percentage
- **Expected Performance**: 2-4x faster on multi-core systems compared to sequential processing

## Modifying PII Detection Patterns

To add or modify PII patterns, edit the `Patterns` dictionary in [Analysis/PiiDetector.cs](Analysis/PiiDetector.cs):

```csharp
private static readonly Dictionary<string, string> Patterns = new()
{
    { "PatternName", @"regex_pattern" }
};
```

### Current PII Detection Patterns

**Identité et Contact:**
- **Email**: Validates proper email format, filters out malformed emails (e.g., ending with uppercase text)
- **TelephoneFR**: French phone numbers (01-09, +33 format, with optional separators)
- **TelephoneBJ**: Bénin phone numbers (+229 followed by 8 digits)
- **DateNaissance**: Birth dates (DD/MM/YYYY), validates dates between 1900 and today

**Identifiants Administratifs:**
- **NumeroSecu**: French social security numbers (15 digits starting with 1, 2, 4, 7, or 8)
- **NumeroFiscalFR**: French tax identification numbers (13 digits starting with 0, 1, 2, or 3)
- **IFU_Benin**: Bénin tax identification (Identifiant Fiscal Unique - 13 digits starting with 0-3)

**Données Bancaires:**
- **IBAN_FR**: French bank account numbers (FR + 2 digits + 23 alphanumeric characters)
- **IBAN_BJ**: Bénin bank account numbers (BJ + 2 digits + 24 alphanumeric characters)
- **CarteBancaire**: Credit/debit card numbers (16 digits, validated with Luhn algorithm)

**Données Techniques:**
- **AdresseIP**: Valid IPv4 addresses (each octet 0-255)

The detector includes extensive post-validation logic (`IsValidPii`, `IsValidDate`, `IsValidEmail`, `IsValidCreditCard`, `IsValidNumeroFiscal`, `IsValidIbanFR`) to reduce false positives.

## Supported File Types

The scanner supports the following file formats:
- **Text files**: `.txt`, `.log`, `.csv`, `.json`
- **Microsoft Word**: `.docx` (via DocumentFormat.OpenXml)
- **Microsoft Excel**: `.xlsx` (via DocumentFormat.OpenXml)
- **PDF**: `.pdf` (via PdfPig library)

File extension filtering is configured in [Scanner/FileScanner.cs](Scanner/FileScanner.cs) via the `allowedExtensions` array. To scan additional file types:
1. Add the extension to the `allowedExtensions` array
2. Update [Reader/DocumentReader.cs](Reader/DocumentReader.cs) to handle text extraction for the new format

## Language Note

User-facing messages and report headers are in French. Console prompts and CSV headers should maintain this language consistency when making changes.
