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

*Scan Operations:*
- `POST /api/scan/start` - Initiate a scan job
- `GET /api/scan/{scanId}/progress` - Get scan progress
- `GET /api/scan/{scanId}/results` - Get scan results with statistics
- `GET /api/scan/{scanId}/report/{format}` - Download report (csv, json, html, excel)
- `DELETE /api/scan/{scanId}` - Cleanup scan resources

*Scheduled Scans:*
- `GET /api/scheduledscans` - Get all scheduled scans for current user
- `POST /api/scheduledscans` - Create a new scheduled scan
- `PUT /api/scheduledscans/{id}` - Update a scheduled scan
- `DELETE /api/scheduledscans/{id}` - Delete a scheduled scan
- `PATCH /api/scheduledscans/{id}/toggle` - Toggle active/inactive status

*Authentication:*
- `POST /api/auth/login` - User login (returns JWT + refresh token)
- `POST /api/auth/refresh` - Refresh access token
- `POST /api/auth/logout` - Logout and revoke refresh token

*Initialization:*
- `GET /api/initialization/status` - Check if app is initialized (user exists)
- `POST /api/initialization/setup` - Create first admin account

**SignalR Hub** ([PiiScanner.Api/Hubs/ScanHub.cs](PiiScanner.Api/Hubs/ScanHub.cs)):
- `/scanhub` - Real-time progress updates
- Events: `ReceiveProgress`, `ScanComplete`, `ScanError`

**Key Components:**
- [Controllers/ScanController.cs](PiiScanner.Api/Controllers/ScanController.cs) - Scan REST API endpoints
- [Controllers/ScheduledScansController.cs](PiiScanner.Api/Controllers/ScheduledScansController.cs) - Scheduled scans CRUD
- [Controllers/InitializationController.cs](PiiScanner.Api/Controllers/InitializationController.cs) - First-run setup
- [Controllers/AuthController.cs](PiiScanner.Api/Controllers/AuthController.cs) - Authentication endpoints
- [Services/ScanService.cs](PiiScanner.Api/Services/ScanService.cs) - Background scan orchestration
- [Services/SchedulerService.cs](PiiScanner.Api/Services/SchedulerService.cs) - Schedule calculation logic
- [Services/BackgroundSchedulerService.cs](PiiScanner.Api/Services/BackgroundSchedulerService.cs) - Background service (checks every minute)
- [Services/AuthService.cs](PiiScanner.Api/Services/AuthService.cs) - JWT token generation and validation
- [Data/AppDbContext.cs](PiiScanner.Api/Data/AppDbContext.cs) - EF Core DbContext with SQLite + SQLCipher
- [Models/ScheduledScan.cs](PiiScanner.Api/Models/ScheduledScan.cs) - Scheduled scan entity
- [Middleware/CsrfProtectionMiddleware.cs](PiiScanner.Api/Middleware/CsrfProtectionMiddleware.cs) - CSRF protection
- [Middleware/RateLimitingMiddleware.cs](PiiScanner.Api/Middleware/RateLimitingMiddleware.cs) - Rate limiting
- [Program.cs](PiiScanner.Api/Program.cs) - CORS enabled for Electron, Swagger in dev mode, DB initialization

**Configuration:**
- Port: 5000 (configured in launchSettings.json)
- CORS: `AllowElectron` policy allows any origin for local development
- Swagger UI: Available in development mode at `/swagger`

**Manual Scan Flow:**
1. Client posts scan request to `/api/scan/start`
2. API generates unique scanId and returns immediately
3. `ScanService` executes scan in background with `Task.Run()`
4. Progress updates sent via SignalR to all connected clients
5. Reports generated in temp directory: `%TEMP%/PiiScanner/{scanId}/`
6. Client polls `/api/scan/{scanId}/results` or receives `ScanComplete` event

**Scheduled Scans System:**

The application includes a complete scheduled scans feature for automated periodic scanning:

*Data Model* ([Models/ScheduledScan.cs](PiiScanner.Api/Models/ScheduledScan.cs)):
- **Frequency**: Daily, Weekly, Monthly, Quarterly (enum)
- **DayOfWeek**: 0-6 (Sunday-Saturday) for weekly scans
- **DayOfMonth**: 1-28 for monthly/quarterly scans
- **HourOfDay**: 0-23 for execution time
- **IsActive**: Enable/disable without deleting
- **NextRunAt**: Calculated next execution timestamp
- **LastRunAt**: Timestamp of last execution
- **LastScanId**: Reference to last scan result
- **NotifyOnCompletion**: Flag for completion notifications
- **NotifyOnNewPii**: Flag for new PII detection notifications

*Schedule Calculation* ([Services/SchedulerService.cs](PiiScanner.Api/Services/SchedulerService.cs)):
- `CalculateNextRunAt(schedule, fromDate)`: Calculates next execution time based on frequency
- `InitializeNextRunAt(schedule)`: Sets initial NextRunAt when creating schedule
- `UpdateAfterExecution(schedule, scanId)`: Updates LastRunAt, LastScanId, recalculates NextRunAt
- Handles edge cases: month-end dates (limited to day 28), daylight saving time, timezone

*Background Execution* ([Services/BackgroundSchedulerService.cs](PiiScanner.Api/Services/BackgroundSchedulerService.cs)):
- Runs as `IHostedService` (starts with API)
- Checks database every 1 minute for due scans (`NextRunAt <= now`)
- Validates directory exists before executing
- Launches scan via `ScanService.StartScan()`
- Updates schedule after execution
- Deactivates schedule if directory validation fails
- Creates audit log for each automatic execution
- Error handling: continues checking even if individual scan fails

*API Endpoints* ([Controllers/ScheduledScansController.cs](PiiScanner.Api/Controllers/ScheduledScansController.cs)):
- All endpoints require JWT authentication
- Users can only modify their own schedules (except Admin)
- Path validation prevents traversal attacks
- Directory existence validation before creating/updating
- Full CRUD operations with audit logging

*Security & Validation:*
- Path traversal protection via `PathValidator.ValidateDirectoryPath()`
- RBAC: Users see only their schedules, Admin sees all
- Audit logs for Create, Update, Delete, Toggle operations
- Directory existence check to prevent invalid scans

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
- [src/App.tsx](pii-scanner-ui/src/App.tsx) - Main app component with initialization check and SignalR connection
- [src/components/InitialSetup.tsx](pii-scanner-ui/src/components/InitialSetup.tsx) - First-run admin account creation
- [src/components/Login.tsx](pii-scanner-ui/src/components/Login.tsx) - User authentication page
- [src/components/ScheduledScans.tsx](pii-scanner-ui/src/components/ScheduledScans.tsx) - Scheduled scans management UI
- [src/services/apiClient.ts](pii-scanner-ui/src/services/apiClient.ts) - API client with SignalR hub
- [src/services/axios.ts](pii-scanner-ui/src/services/axios.ts) - Axios instance with JWT interceptors
- [src/contexts/AuthContext.tsx](pii-scanner-ui/src/contexts/AuthContext.tsx) - Authentication state management
- [src/components/Dashboard.tsx](pii-scanner-ui/src/components/Dashboard.tsx) - Scan initiation UI
- [src/components/Results.tsx](pii-scanner-ui/src/components/Results.tsx) - Results display

**API Connection:**
- Base URL: `http://localhost:5000/api`
- SignalR Hub: `http://localhost:5000/scanhub`
- Automatic reconnection enabled

**Application Initialization Flow:**

The app has NO default credentials for security. First-run setup is required:

1. **App Startup** ([App.tsx](pii-scanner-ui/src/App.tsx)):
   - Calls `/api/initialization/status` to check if any users exist
   - Shows loading spinner during check
   - Routes to InitialSetup if `isInitialized === false`
   - Routes to Login if `isInitialized === true`

2. **Initial Setup** ([InitialSetup.tsx](pii-scanner-ui/src/components/InitialSetup.tsx)):
   - Form fields: username (3+ chars), email, fullName, password, confirmPassword
   - Password validation: 8+ chars with uppercase, lowercase, number, special character
   - Calls `POST /api/initialization/setup` with credentials
   - Backend creates first admin user with BCrypt password hash
   - Redirects to `/login` after successful creation

3. **Authentication** ([Login.tsx](pii-scanner-ui/src/components/Login.tsx)):
   - User enters **username** (not email or full name) and password
   - Calls `POST /api/auth/login`
   - Receives JWT access token (7-day expiry) and refresh token (30-day expiry)
   - Tokens stored in AuthContext and localStorage
   - Axios interceptor auto-adds Bearer token to all requests

4. **Token Refresh** ([axios.ts](pii-scanner-ui/src/services/axios.ts)):
   - Intercepts 401 responses
   - Automatically calls `/api/auth/refresh` with refresh token
   - Updates access token and retries failed request
   - Logs out if refresh fails

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
3. On first run, create admin account via InitialSetup page
4. Login with your username (not email or full name)
5. API will be available at `http://localhost:5000`
6. Swagger UI at `http://localhost:5000/swagger`
7. Electron app will connect automatically

### Testing Scheduled Scans

1. **Create a scheduled scan** via UI (Scans planifiés page) or API
2. **Set NextRunAt to near future** for immediate testing:
   - Option A: Directly modify database `NextRunAt` to `DateTime.UtcNow.AddMinutes(2)`
   - Option B: Use Swagger to POST with calculated time
3. **Watch API logs** - BackgroundSchedulerService logs every check (every minute)
4. **Verify execution** - Check logs for "Scan planifié démarré avec succès"
5. **Check updates** - `LastRunAt`, `LastScanId`, `NextRunAt` should update after execution

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

### Data Protection
- **100% local processing** : No data sent to external services
- **Reports contain sensitive PII** : Handle with care, secure storage required
- **In-memory processing** : Files analyzed without modification

### Application Security
For comprehensive security documentation, see [SECURITY.md](SECURITY.md).

#### Path Traversal Protection
All file/directory paths are validated using the `PathValidator` utility class ([PiiScanner.Api/Utils/PathValidator.cs](PiiScanner.Api/Utils/PathValidator.cs)):

**Protected endpoints:**
- `POST /api/scan/start` - Validates scan directory path
- `POST /api/scheduledscans` - Validates scheduled scan directory path
- `PUT /api/scheduledscans/{id}` - Validates directory path when updating
- `POST /api/dataretention/scan` - Validates retention scan directory
- `POST /api/dataretention/delete` - Validates each file path
- `GET /api/database/backup/download/{fileName}` - Validates backup filename and confinement
- `DELETE /api/database/backup/{fileName}` - Validates backup filename and confinement

**Validation features:**
- Rejects path traversal sequences (`.., /, \`)
- Blocks system directory access (`C:\Windows`, `/etc`, etc.)
- Validates file names against reserved names (CON, PRN, AUX, etc.)
- Ensures files stay within authorized directories
- Logs all invalid access attempts

#### Authentication & Authorization
- **JWT tokens** : Secure authentication with 7-day expiration
- **Refresh tokens** : 30-day validity, stored in database, revocable
- **Role-Based Access Control (RBAC)** :
  - Admin: Full access (users, database, scans)
  - User: Scans, reports, data retention, profile
- **Password security** : BCrypt hashing with automatic salt

#### Audit Logging
All sensitive operations are logged to `AuditLogs` table:
- User authentication (login, logout, password changes)
- Scheduled scans operations (create, update, delete, toggle, automatic execution)
- User management (create, update, delete, role changes)
- Database operations (backup, restore, delete, optimize)
- Scan operations (start, complete, fail)

**Log fields:** UserId, Action, EntityType, EntityId, IpAddress, Details, CreatedAt

#### SQL Injection Protection
- Entity Framework Core with parameterized queries
- No string concatenation in SQL
- LINQ-based queries only

#### CORS Configuration
- Configured in [Program.cs](PiiScanner.Api/Program.cs)
- Development: Allows localhost origins (3000, 5173-5175)
- **Production**: Replace with specific allowed origins

#### Recommendations for Production
1. Enable HTTPS only
2. Implement rate limiting (login attempts)
3. Add security headers (X-Frame-Options, CSP, etc.)
4. Rotate JWT secret periodically
5. Enable database encryption (SQLCipher)
6. Regular security audits (OWASP ZAP, Burp Suite)
7. Dependency vulnerability scanning (Snyk, npm audit)
