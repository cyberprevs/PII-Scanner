# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

PII Scanner is a full-stack application for detecting Personally Identifiable Information (PII) in documents to ensure RGPD/GDPR compliance. The solution consists of three .NET 8.0 projects and an Electron-based desktop UI.

**Architecture**: Three-tier application with shared core library, REST API with real-time updates, and cross-platform desktop UI.

## Solution Structure

```
MVP-PII-Scanner/
├── PiiScanner.Core/          # Shared library - Core PII detection logic
├── PiiScanner.Api/           # ASP.NET Core Web API + SignalR
├── PiiScanner/               # Legacy console application
└── pii-scanner-ui/           # Electron + React + TypeScript UI
```

## Build and Run Commands

### Backend (.NET)

```bash
# Build entire solution
dotnet build PiiScanner.sln

# Build specific projects
dotnet build PiiScanner.Core/PiiScanner.Core.csproj
dotnet build PiiScanner.Api/PiiScanner.Api.csproj
dotnet build PiiScanner/PiiScanner.csproj

# Run API server (port 5000)
cd PiiScanner.Api
dotnet run

# Run console application
cd PiiScanner
dotnet run

# Build for release
dotnet build -c Release PiiScanner.sln

# Publish API for production
cd PiiScanner.Api
dotnet publish -c Release -o bin/Release/net8.0/publish
```

### Frontend (Electron + React)

```bash
cd pii-scanner-ui

# Install dependencies
npm install

# Development mode (Vite dev server)
npm run dev

# Run Electron in development
npm run electron:dev

# Build web assets
npm run build

# Build Electron application for Windows
npm run electron:build:win

# Lint code
npm run lint
```

## Architecture Overview

### 1. PiiScanner.Core (Shared Library)

The core library contains all PII detection logic and is referenced by both the console app and API.

**Key Namespaces:**
- `PiiScanner.Scanner.FileScanner` - Parallel file scanning engine
- `PiiScanner.Analysis.PiiDetector` - Regex-based PII pattern matching with validation
- `PiiScanner.Reader.DocumentReader` - Text extraction from .docx, .xlsx, .pdf, .txt, .log, .csv, .json
- `PiiScanner.Models` - Data models (ScanResult, ScanStatistics)
- `PiiScanner.Reporting` - Report generation (CSV, JSON, HTML, Excel)

**Dependencies:**
- DocumentFormat.OpenXml (v3.3.0) - Word/Excel parsing
- PdfPig (v0.1.12) - PDF text extraction

**Performance Features:**
- Parallel file processing with `Parallel.ForEach`
- Thread-safe `ConcurrentBag<ScanResult>` for results
- Event-based progress tracking with `ProgressUpdated` event
- MaxDegreeOfParallelism set to CPU core count

### 2. PiiScanner.Api (Web API)

ASP.NET Core Web API providing REST endpoints and real-time SignalR updates.

**Endpoints:**
- `POST /api/scan/start` - Initiate a scan job
- `GET /api/scan/{scanId}/progress` - Get scan progress
- `GET /api/scan/{scanId}/results` - Get scan results with statistics
- `GET /api/scan/{scanId}/report/{format}` - Download report (csv, json, html, excel)
- `DELETE /api/scan/{scanId}` - Cleanup scan resources

**SignalR Hub** ([PiiScanner.Api/Hubs/ScanHub.cs](PiiScanner.Api/Hubs/ScanHub.cs)):
- `/scanhub` - Real-time progress updates
- Events: `ReceiveProgress`, `ScanComplete`, `ScanError`

**Key Components:**
- [Controllers/ScanController.cs](PiiScanner.Api/Controllers/ScanController.cs) - REST API endpoints
- [Services/ScanService.cs](PiiScanner.Api/Services/ScanService.cs) - Background scan orchestration
- [Program.cs](PiiScanner.Api/Program.cs) - CORS enabled for Electron, Swagger in dev mode

**Configuration:**
- Port: 5000 (configured in launchSettings.json)
- CORS: `AllowElectron` policy allows any origin for local development
- Swagger UI: Available in development mode at `/swagger`

**Scan Flow:**
1. Client posts scan request to `/api/scan/start`
2. API generates unique scanId and returns immediately
3. `ScanService` executes scan in background with `Task.Run()`
4. Progress updates sent via SignalR to all connected clients
5. Reports generated in temp directory: `%TEMP%/PiiScanner/{scanId}/`
6. Client polls `/api/scan/{scanId}/results` or receives `ScanComplete` event

### 3. pii-scanner-ui (Electron Desktop App)

Modern desktop application built with React 19, Material-UI, and Electron.

**Tech Stack:**
- React 19 + TypeScript
- Material-UI (MUI) v7 with dark theme
- Recharts for data visualization
- Axios for HTTP requests
- @microsoft/signalr for real-time updates
- Vite for bundling
- Electron for desktop packaging

**Key Files:**
- [src/App.tsx](pii-scanner-ui/src/App.tsx) - Main app component with SignalR connection
- [src/services/apiClient.ts](pii-scanner-ui/src/services/apiClient.ts) - API client with SignalR hub
- [src/components/Dashboard.tsx](pii-scanner-ui/src/components/Dashboard.tsx) - Scan initiation UI
- [src/components/Results.tsx](pii-scanner-ui/src/components/Results.tsx) - Results display

**API Connection:**
- Base URL: `http://localhost:5000/api`
- SignalR Hub: `http://localhost:5000/scanhub`
- Automatic reconnection enabled

**Build Process:**
- `npm run build` - Compiles TypeScript and bundles with Vite
- `npm run electron:build:win` - Creates Windows installer (NSIS)
- Bundles API binaries from `../PiiScanner.Api/bin/Release/net8.0/publish`

### 4. PiiScanner (Console App - Legacy)

Standalone console application with the same PII detection capabilities as the API version. This was the original implementation before the API/UI were created.

**Usage:**
```bash
cd PiiScanner
dotnet run
# Enter directory path when prompted
```

## PII Detection Patterns

The system detects **11 types of PII** with advanced post-validation:

**Identity & Contact:**
- **Email**: RFC-compliant format with additional validation
- **TelephoneFR**: French phone numbers (01-09, +33 formats)
- **TelephoneBJ**: Bénin phone numbers (+229 XX XX XX XX)
- **DateNaissance**: Birth dates (DD/MM/YYYY, validated 1900-today)

**Administrative IDs:**
- **NumeroSecu**: French social security (15 digits, validated format)
- **NumeroFiscalFR**: French tax ID (13 digits)
- **IFU_Benin**: Bénin tax ID (13 digits)

**Banking Data** (triggers high-risk classification):
- **CarteBancaire**: Credit cards (16 digits, Luhn algorithm validated)
- **IBAN_FR**: French IBAN (FR + 2 digits + 23 alphanumeric)
- **IBAN_BJ**: Bénin IBAN (BJ + 2 digits + 24 alphanumeric)

**Technical Data:**
- **AdresseIP**: IPv4 addresses (validated octet ranges)

All patterns are defined in [PiiScanner.Core/Analysis/PiiDetector.cs](PiiScanner.Core/Analysis/PiiDetector.cs) with extensive validation logic to minimize false positives.

## Risk Scoring System

Files are automatically classified based on PII content:

- **ÉLEVÉ (HIGH)**: Banking data detected OR >10 PII instances
- **MOYEN (MEDIUM)**: 3-10 PII instances
- **FAIBLE (LOW)**: 1-2 PII instances

Risk calculation is in [PiiScanner.Core/Models/ScanStatistics.cs](PiiScanner.Core/Models/ScanStatistics.cs).

## Report Generation

Four report formats are generated simultaneously:

1. **CSV** ([Reporting/CsvReport.cs](PiiScanner.Core/Reporting/CsvReport.cs))
   - UTF-8 with BOM, semicolon-delimited
   - Statistics in header comments (# prefix)
   - Format: `Fichier;Type;Valeur`

2. **JSON** ([Reporting/JsonReport.cs](PiiScanner.Core/Reporting/JsonReport.cs))
   - Structured data with metadata, statistics, detections
   - Includes percentages and file names

3. **HTML** ([Reporting/HtmlReport.cs](PiiScanner.Core/Reporting/HtmlReport.cs))
   - Modern responsive design with inline CSS
   - Color-coded risk levels, interactive tables
   - Statistical charts

4. **Excel** ([Reporting/ExcelReport.cs](PiiScanner.Core/Reporting/ExcelReport.cs))
   - Multi-sheet workbook (.xlsx)
   - Sheet 1: Statistics overview
   - Sheet 2: Risky files ranking
   - Sheet 3: All detections with auto-filters

## Project References & Dependencies

**PiiScanner.Core** (library):
- No project dependencies
- NuGet: DocumentFormat.OpenXml, PdfPig

**PiiScanner.Api** (API):
- References: PiiScanner.Core
- NuGet: Microsoft.AspNetCore.SignalR, Swashbuckle.AspNetCore

**PiiScanner** (console):
- Originally standalone, now references PiiScanner.Core (or duplicates code)
- Same NuGet packages as Core

**pii-scanner-ui**:
- No .NET dependencies
- Packages API binaries as `extraResources` during Electron build

## Common Development Tasks

### Adding a New PII Pattern

1. Edit [PiiScanner.Core/Analysis/PiiDetector.cs](PiiScanner.Core/Analysis/PiiDetector.cs)
2. Add pattern to `Patterns` dictionary:
   ```csharp
   { "PatternName", @"regex_pattern" }
   ```
3. Add validation logic in `IsValidPii()` method if needed
4. Rebuild PiiScanner.Core and dependent projects

### Adding a New File Format

1. Update `allowedExtensions` in [PiiScanner.Core/Scanner/FileScanner.cs](PiiScanner.Core/Scanner/FileScanner.cs)
2. Add extraction logic in [PiiScanner.Core/Reader/DocumentReader.cs](PiiScanner.Core/Reader/DocumentReader.cs)
3. Add case to `ReadFile()` switch expression
4. Install any required NuGet packages for the format

### Testing the Full Stack

1. Start the API server:
   ```bash
   cd PiiScanner.Api
   dotnet run
   ```
2. In a new terminal, start the UI:
   ```bash
   cd pii-scanner-ui
   npm run electron:dev
   ```
3. API will be available at `http://localhost:5000`
4. Swagger UI at `http://localhost:5000/swagger`
5. Electron app will connect automatically

### Debugging SignalR Connection Issues

- Check that API is running on port 5000
- Verify CORS policy allows connections
- Check browser/Electron console for SignalR connection errors
- SignalR uses WebSockets - ensure no firewall blocking

## Language & Localization

- **User-facing text**: French (console prompts, API responses, reports)
- **Code**: English (variable names, comments)
- **Documentation**: Mixed French/English

The French language is used for end-user facing elements to comply with RGPD terminology and French regulatory requirements.

## Performance Considerations

- **Parallel Processing**: FileScanner uses all CPU cores by default
- **Memory**: Results stored in-memory during scan - large directories may require optimization
- **Regex Compilation**: Patterns are not pre-compiled - consider using RegexOptions.Compiled for frequently scanned large files
- **SignalR Overhead**: Real-time updates add minimal overhead (~100ms per file)

## Security Notes

- All scanning is local - no data sent to external services
- Reports contain sensitive PII - handle with care
- CORS policy in API is permissive (`AllowAnyOrigin`) - tighten for production deployment
- Temp directory cleanup is automatic but may fail - consider adding periodic cleanup task
