# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

PII Scanner is a full-stack web application for detecting Personally Identifiable Information (PII) in documents to ensure RGPD/GDPR compliance. The solution consists of three .NET 8.0 projects and a React-based web interface.

**Architecture**: Web application with shared core library, REST API with real-time updates, and React SPA served by the API itself.

## Solution Structure

```
PII-Scanner/
├── PiiScanner.Core/          # Shared library - Core PII detection logic
├── PiiScanner.Core.Tests/    # Unit tests for Core library (xUnit + FluentAssertions)
├── PiiScanner.Api/           # ASP.NET Core Web API + SignalR + Static Files
│   └── wwwroot/              # React build output (index.html, assets/)
├── PiiScanner/               # Legacy console application
├── pii-scanner-ui/           # React + TypeScript UI (build to wwwroot)
│   └── src/components/__tests__/  # React component tests (Vitest)
└── BuildWebApp.ps1           # Automated build script
```

## Build and Run Commands

### Quick Start - Production Build (Recommended)

```bash
# Automated build script - Creates complete web application package
.\BuildWebApp.ps1

# Output: PII-Scanner-WebApp/ folder with everything needed
# - Size: ~124 MB (self-contained .NET runtime included)
# - Contains: PiiScanner.Api.exe + wwwroot/ (React build)
# - Launch: Double-click "Demarrer PII Scanner.bat"
# - Access: https://localhost:5001 in your browser
```

### Development Mode

```bash
# Terminal 1: Run API
cd PiiScanner.Api
dotnet run
# API: https://localhost:5001
# Serves both API endpoints AND React static files from wwwroot/

# Terminal 2: Run React dev server (optional, for hot reload)
cd pii-scanner-ui
npm run dev
# Vite dev server: http://localhost:5173
# Auto-proxies API calls to https://localhost:5001
```

### Manual Build Commands

```bash
# Build React UI
cd pii-scanner-ui
npm run build
# Output: pii-scanner-ui/dist/

# Copy React build to API wwwroot
# Windows:
xcopy /E /I pii-scanner-ui\dist PiiScanner.Api\wwwroot
# Linux/Mac:
cp -r pii-scanner-ui/dist/* PiiScanner.Api/wwwroot/

# Run unified web app
cd PiiScanner.Api
dotnet run
# Open browser: https://localhost:5001

# Publish for production (self-contained)
cd PiiScanner.Api
dotnet publish -c Release -r win-x64 --self-contained true
# Output: bin/Release/net8.0/win-x64/publish/
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
- **Optimized MD5 Hash Calculation**: Hash computed only for files containing PII (10-50x faster for directories with few sensitive files)

**Duplicate File Detection:**
- MD5 hash-based duplicate detection for files containing PII
- Hash calculated **only after PII detection** to optimize performance
- Identifies identical files regardless of file name, location, or modification date
- Groups duplicates by content hash with expandable file lists
- Detects redundant copies that increase PII exposure risk
- Implementation: [FileScanner.cs:81-95](PiiScanner.Core/Scanner/FileScanner.cs#L81-L95)
- Hash security: MD5 hash displayed in UI is safe (one-way function, cannot reverse to file content)

### 2. PiiScanner.Api (Web Application)

ASP.NET Core Web Application serving:
- **REST API** endpoints (`/api/*`)
- **SignalR** real-time updates (`/scanhub`)
- **React SPA** static files (from `wwwroot/`)
- **Static file serving** for HTML, CSS, JS, images

**No CORS needed** - Frontend and backend on same origin.

**Endpoints:**

*Scan Operations:*
- `POST /api/scan/start` - Initiate a scan job
- `GET /api/scan/{scanId}/progress` - Get scan progress
- `GET /api/scan/{scanId}/results` - Get scan results with statistics
- `GET /api/scan/{scanId}/report/{format}` - Download report (csv, json, html, excel)
- `DELETE /api/scan/{scanId}` - Cleanup scan resources

*Authentication:*
- `POST /api/auth/login` - User login (returns JWT + refresh token)
- `POST /api/auth/refresh` - Refresh access token
- `POST /api/auth/logout` - Logout and revoke refresh token
- `GET /api/auth/me` - Get current user profile
- `PUT /api/auth/change-password` - Change user password

*User Management (Admin only):*
- `GET /api/users` - Get all users
- `GET /api/users/{id}` - Get user by ID
- `POST /api/users` - Create new user
- `PUT /api/users/{id}` - Update user
- `DELETE /api/users/{id}` - Delete user
- `PATCH /api/users/{id}/toggle` - Toggle user active status

*Database Management (Admin only):*
- `GET /api/database/info` - Get database information
- `POST /api/database/backup` - Create database backup
- `GET /api/database/backup` - List all backups
- `GET /api/database/backup/download/{fileName}` - Download backup file
- `POST /api/database/restore` - Restore from backup
- `DELETE /api/database/backup/{fileName}` - Delete backup file
- `POST /api/database/optimize` - Optimize database (VACUUM)
- `POST /api/database/cleanup` - Clean expired sessions and old audit logs

*Data Retention:*
- `POST /api/dataretention/scan` - Scan directory for files violating retention policies
- `POST /api/dataretention/delete` - Delete files based on retention policy
- `GET /api/dataretention/policies` - Get current retention policies
- `PUT /api/dataretention/policies` - Update retention policies

*Audit Logs (Admin only):*
- `GET /api/audit` - Get audit logs with filtering and pagination

*Initialization:*
- `GET /api/initialization/status` - Check if app is initialized (user exists)
- `POST /api/initialization/setup` - Create first admin account

**SignalR Hub** ([PiiScanner.Api/Hubs/ScanHub.cs](PiiScanner.Api/Hubs/ScanHub.cs)):
- `/scanhub` - Real-time progress updates
- Events: `ReceiveProgress`, `ScanComplete`, `ScanError`

**Key Components:**
- [Controllers/ScanController.cs](PiiScanner.Api/Controllers/ScanController.cs) - Scan REST API endpoints
- [Controllers/InitializationController.cs](PiiScanner.Api/Controllers/InitializationController.cs) - First-run setup
- [Controllers/AuthController.cs](PiiScanner.Api/Controllers/AuthController.cs) - Authentication endpoints
- [Controllers/UsersController.cs](PiiScanner.Api/Controllers/UsersController.cs) - User management (Admin only)
- [Controllers/DatabaseController.cs](PiiScanner.Api/Controllers/DatabaseController.cs) - Database backup/restore/optimize (Admin only)
- [Controllers/DataRetentionController.cs](PiiScanner.Api/Controllers/DataRetentionController.cs) - Data retention policy management
- [Controllers/AuditController.cs](PiiScanner.Api/Controllers/AuditController.cs) - Audit log viewing (Admin only)
- [Services/ScanService.cs](PiiScanner.Api/Services/ScanService.cs) - Background scan orchestration
- [Services/AuthService.cs](PiiScanner.Api/Services/AuthService.cs) - JWT token generation and validation
- [Services/DatabaseEncryptionService.cs](PiiScanner.Api/Services/DatabaseEncryptionService.cs) - SQLCipher encryption key management
- [Data/AppDbContext.cs](PiiScanner.Api/Data/AppDbContext.cs) - EF Core DbContext with SQLite + SQLCipher encryption
- [Models/User.cs](PiiScanner.Api/Models/User.cs) - User entity with BCrypt password hashing
- [Models/AuditLog.cs](PiiScanner.Api/Models/AuditLog.cs) - Audit log entity for security tracking
- [Middleware/CsrfProtectionMiddleware.cs](PiiScanner.Api/Middleware/CsrfProtectionMiddleware.cs) - CSRF protection
- [Middleware/RateLimitingMiddleware.cs](PiiScanner.Api/Middleware/RateLimitingMiddleware.cs) - Rate limiting
- [Utils/PathValidator.cs](PiiScanner.Api/Utils/PathValidator.cs) - Path traversal protection
- [Program.cs](PiiScanner.Api/Program.cs) - Static files, Swagger in dev mode, DB initialization, HTTPS configuration, SPA fallback routing
- [wwwroot/](PiiScanner.Api/wwwroot/) - React build output (created by BuildWebApp.ps1)

**Configuration:**
- Ports:
  - HTTP: 5000
  - HTTPS: 5001 (primary, recommended)
- CORS: **Not needed** - React served from same origin as API
- Static Files: Served from `wwwroot/` folder
  - `app.UseDefaultFiles()` - Serves `index.html` for `/`
  - `app.UseStaticFiles()` - Serves JS, CSS, images
  - `app.MapFallbackToFile("index.html")` - SPA routing support
- Swagger UI: Available in development mode at `/swagger`
- Database: SQLite with SQLCipher encryption (AES-256)
  - Database file: `piiscanner.db` (encrypted)
  - Encryption key: Auto-generated 256-bit key stored in `db_encryption.key` with NTFS ACL protection
  - Or via environment variable `Database:EncryptionKey`

**Scan Flow:**
1. Client posts scan request to `/api/scan/start`
2. API generates unique scanId and returns immediately
3. `ScanService` executes scan in background with `Task.Run()`
4. Progress updates sent via SignalR to all connected clients
5. Reports generated in temp directory: `%TEMP%/PiiScanner/{scanId}/`
6. Client polls `/api/scan/{scanId}/results` or receives `ScanComplete` event

**Data Retention System:**

The application includes a comprehensive data retention management system compliant with Loi N°2017-20 (APDP):

*Retention Policies* ([Models/RetentionPolicy.cs](PiiScanner.Api/Models/RetentionPolicy.cs)):
- **5 categories** of PII data with configurable retention periods (1-10 years):
  - Banking data (IBAN, CarteBancaire): 5 years default
  - Identity data (IFU, CNI, Passeport, RCCM, ActeNaissance): 3 years default
  - Health data (CNSS, RAMU): 5 years default
  - Education data (INE, Matricule_Fonctionnaire): 2 years default
  - Contact data (Email, Telephone): 1 year default

*Retention Scanning*:
- Identifies files containing PII that exceed retention periods
- Based on file last modified date
- Categorizes violations by data type
- Provides detailed reports of violating files

*Secure Deletion*:
- Multi-step confirmation process
- Validation of file paths (PathValidator)
- Audit logging of all deletions
- Tracks success/failure for each file
- Returns detailed results (deleted count, failed files)

*API Endpoints*:
- `POST /api/dataretention/scan` - Scan directory for retention violations
- `POST /api/dataretention/delete` - Delete files violating retention policies
- `GET /api/dataretention/policies` - Get current retention policies
- `PUT /api/dataretention/policies` - Update retention periods

### 3. pii-scanner-ui (React Web Interface)

Modern web interface built with React 19 and Material-UI, served as a Single Page Application (SPA) by the API.

**Tech Stack:**
- React 19 + TypeScript
- Material-UI (MUI) v7 with dark theme
- Recharts for data visualization
- Axios for HTTP requests
- @microsoft/signalr for real-time updates
- Vite for bundling
- **No Electron** - Runs in browser

**Build Output:**
- Development: `npm run dev` → Vite dev server on port 5173 (optional, for hot reload)
- Production: `npm run build` → `dist/` folder → copied to `PiiScanner.Api/wwwroot/`

**Key Files:**
- [src/App.tsx](pii-scanner-ui/src/App.tsx) - Main app with initialization check, SignalR, and reload fix after setup
- [src/components/InitialSetup.tsx](pii-scanner-ui/src/components/InitialSetup.tsx) - First-run admin account creation
- [src/components/Login.tsx](pii-scanner-ui/src/components/Login.tsx) - User authentication page
- [src/services/apiClient.ts](pii-scanner-ui/src/services/apiClient.ts) - API client with SignalR hub (auto-detects dev vs prod)
- [src/services/axios.ts](pii-scanner-ui/src/services/axios.ts) - Axios with JWT, CSRF, auto base URL (`/api` in prod)
- [src/contexts/AuthContext.tsx](pii-scanner-ui/src/contexts/AuthContext.tsx) - Authentication state management

**UI Pages (17 specialized pages):**
1. [DashboardPage.tsx](pii-scanner-ui/src/components/pages/DashboardPage.tsx) - Scan results with charts and statistics (Route: `/dashboard`)
2. [Scanner.tsx](pii-scanner-ui/src/components/pages/Scanner.tsx) - Scan initiation and real-time progress (Route: `/scanner`)
3. [ScanHistory.tsx](pii-scanner-ui/src/components/pages/ScanHistory.tsx) - All past scans
4. [RiskyFiles.tsx](pii-scanner-ui/src/components/pages/RiskyFiles.tsx) - Top 20 high-risk files
5. [Detections.tsx](pii-scanner-ui/src/components/pages/Detections.tsx) - All PII detections
6. [PiiCategoryAnalysis.tsx](pii-scanner-ui/src/components/pages/PiiCategoryAnalysis.tsx) - PII analysis by category (Banking, Identity, Health, Contact, Education, Transport) with export to CSV/Excel
7. [DuplicateFiles.tsx](pii-scanner-ui/src/components/pages/DuplicateFiles.tsx) - Duplicate file detection using MD5 hash (identifies identical files regardless of name)
8. [Staleness.tsx](pii-scanner-ui/src/components/pages/Staleness.tsx) - Old/obsolete files analysis
9. [Exposure.tsx](pii-scanner-ui/src/components/pages/Exposure.tsx) - Over-exposed files (NTFS ACL analysis)
10. [Reports.tsx](pii-scanner-ui/src/components/pages/Reports.tsx) - Report viewing and analysis
11. [Exports.tsx](pii-scanner-ui/src/components/pages/Exports.tsx) - Download reports (CSV, JSON, HTML, Excel)
12. [DataRetention.tsx](pii-scanner-ui/src/components/pages/DataRetention.tsx) - Retention policy management and file deletion
13. [UserManagement.tsx](pii-scanner-ui/src/components/UserManagement.tsx) - User management (Admin only)
14. [DatabaseManagement.tsx](pii-scanner-ui/src/components/pages/DatabaseManagement.tsx) - Database backup/restore (Admin only)
15. [AuditTrail.tsx](pii-scanner-ui/src/components/pages/AuditTrail.tsx) - Security audit trail (Admin only)
16. [Profile.tsx](pii-scanner-ui/src/components/pages/Profile.tsx) - User profile management
17. [Support.tsx](pii-scanner-ui/src/components/pages/Support.tsx) - Help center, FAQ, contact
18. [About.tsx](pii-scanner-ui/src/components/pages/About.tsx) - Application information and licensing

**API Connection:**
- Development: `https://localhost:5001/api` (Vite dev server proxies to API)
- Production: `/api` (served from same origin, no CORS needed)
- SignalR Hub: `/scanhub` (same origin)
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
   - Password validation: 12+ chars with uppercase, lowercase, number, special character
   - Calls `POST /api/initialization/setup` with credentials
   - Backend creates first admin user with BCrypt password hash
   - **Navigation fix** ([App.tsx:179-192](pii-scanner-ui/src/App.tsx#L179-L192)): After account creation, triggers state update + API re-check to properly re-render with login Router instead of blank page

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
- `npm run build` - Compiles TypeScript and bundles with Vite to `dist/`
- Output copied to `PiiScanner.Api/wwwroot/` for production deployment
- No Electron packaging needed - runs in any modern browser

---

## Building a Web Application Package

Creating a distributable web application package (no installation required, runs in browser):

**Automated Build Script**: [BuildWebApp.ps1](BuildWebApp.ps1)

```powershell
# One command builds everything
.\BuildWebApp.ps1

# Creates PII-Scanner-WebApp/ folder with:
# - PiiScanner.Api.exe (self-contained .NET runtime)
# - wwwroot/ (React build)
# - Demarrer PII Scanner.bat (launcher)
# - Database files will be created on first run
```

*Package Structure:*
```
PII-Scanner-WebApp/
├── Demarrer PII Scanner.bat    ← One-click launcher
├── PiiScanner.Api.exe           ← Self-contained web server (~124 MB)
├── wwwroot/                     ← React SPA
│   ├── index.html
│   └── assets/
│       ├── index-[hash].js
│       └── index-[hash].css
├── appsettings.json
├── piiscanner.db                ← Created on first run
└── db_encryption.key            ← Created on first run
```

### Build Steps (Manual)

```bash
# 1. Build React UI
cd pii-scanner-ui
npm run build
# Output: dist/ folder

# 2. Copy to API wwwroot
xcopy /E /I dist ..\PiiScanner.Api\wwwroot
# Or: cp -r dist/* ../PiiScanner.Api/wwwroot/

# 3. Publish API (self-contained)
cd ../PiiScanner.Api
dotnet publish -c Release -r win-x64 --self-contained true

# Output: bin/Release/net8.0/win-x64/publish/
```

**Package Size**: ~124 MB (self-contained .NET runtime included)

### Deployment

**Option 1: ZIP Distribution**
```powershell
# Compress the publish folder
Compress-Archive -Path PII-Scanner-WebApp\* -DestinationPath PII-Scanner-WebApp.zip

# Users:
# 1. Extract ZIP
# 2. Double-click "Demarrer PII Scanner.bat"
# 3. Open browser: https://localhost:5001
```

**Option 2: Direct Copy**
```bash
# Copy PII-Scanner-WebApp/ folder to target machine
# No installation needed, no dependencies, no certificate required
```

### Advantages Over Electron Package

| Feature | Web App | Electron (Old) |
|---------|---------|----------------|
| Package Size | 124 MB | 196 MB |
| Executables | 1 (API only) | 2 (API + UI) |
| Code Signing | Not required | Required for SmartScreen |
| Deployment | Copy folder | Install certificate |
| Browser Support | Any modern browser | Chromium only |
| Updates | Replace exe | Replace both exe |
| CORS Issues | None | Complex setup |

---

### 4. PiiScanner (Console App - Legacy)

Standalone console application with the same PII detection capabilities as the API version. This was the original implementation before the API/UI were created.

**Usage:**
```bash
cd PiiScanner
dotnet run
# Enter directory path when prompted
```

## PII Detection Patterns

The system detects **17 types of PII** with advanced post-validation, specifically adapted for Bénin compliance (Loi N°2017-20):

**Universal Data:**
- **Email**: RFC-compliant format with strict domain validation
- **DateNaissance**: Birth dates (DD/MM/YYYY, age 5-120 years)
- **CarteBancaire**: Credit cards (16 digits, Luhn algorithm validated)

**Bénin Identity & Documents:**
- **IFU**: Identifiant Fiscal Unique (13 digits, starts with 0-3)
- **CNI_Benin**: Carte Nationale d'Identité (2 letters + 6-10 digits)
- **Passeport_Benin**: Bénin passport (BJ + 7 digits)
- **RCCM**: Registre du Commerce (RB/XXX/YYYY/X/NNNNN)
- **ActeNaissance**: Birth certificate (N°XXX/YYYY/Département)

**Bénin Contact:**
- **Telephone**: Bénin phone numbers (all types: fixed, mobile, mobile money)
  - +229 or 00229 prefix (optional)
  - Valid prefixes: 40-59 (fixed), 60-69 (mobile), 90-99 (mobile)
  - Includes MTN MoMo (96, 97, 66, 67) and Moov Money (98, 99, 68, 69)

**Bénin Banking Data** (triggers high-risk classification):
- **IBAN**: Bénin IBAN (BJ + 2 digits + 24 characters)
- **CarteBancaire**: Credit cards (16 digits, Luhn algorithm validated)

**Bénin Health & Social Security:**
- **CNSS**: Caisse Nationale de Sécurité Sociale (11 digits)
- **RAMU**: Régime d'Assurance Maladie Universelle (RAMU-XXXXXXXX)

**Bénin Education:**
- **INE**: Identifiant National de l'Élève (INE-XXXXXXXX)
- **Matricule_Fonctionnaire**: Civil servant ID (F/M + 6-10 digits)

**Bénin Transport:**
- **Plaque_Immatriculation**: License plate (new format: AB 1234 CD, old format: 1234 AB)

All patterns are defined in [PiiScanner.Core/Analysis/PiiDetector.cs](PiiScanner.Core/Analysis/PiiDetector.cs) with extensive validation logic to minimize false positives (~87% reduction).

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
- Build output copied to `PiiScanner.Api/wwwroot/` for production

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

### Testing the Web Application

**Production Mode** (recommended):
```bash
# Build and run complete web app
.\BuildWebApp.ps1

# OR manually:
cd PiiScanner.Api
dotnet run

# Open browser: https://localhost:5001
# - Web UI served from wwwroot/
# - API endpoints at /api/*
# - SignalR at /scanhub
# - Swagger at /swagger (dev mode only)
```

**Development Mode** (with hot reload):
```bash
# Terminal 1: API + Static Files
cd PiiScanner.Api
dotnet run
# Serves at https://localhost:5001

# Terminal 2 (optional): Vite dev server for hot reload
cd pii-scanner-ui
npm run dev
# Dev server at http://localhost:5173
# Auto-proxies API calls to https://localhost:5001
```

**First Run:**
1. Open https://localhost:5001 in browser
2. Create admin account via InitialSetup page
3. **App automatically reloads** to login page (fix applied in [App.tsx:179](pii-scanner-ui/src/App.tsx#L179))
4. Login with username (not email or full name)
5. Start using the application

### Database Migrations

The application uses Entity Framework Core with SQLite + SQLCipher. Migrations are automatically applied on startup.

**Creating new migrations:**
```bash
cd PiiScanner.Api
dotnet ef migrations add MigrationName
dotnet ef database update
```

**Reverting a migration:**
```bash
dotnet ef migrations remove
```

**Note:** The database is encrypted with SQLCipher. The encryption key is automatically generated and stored securely.

### Testing Data Retention

1. **Configure retention policies** via UI (Rétention des données page) or API
2. **Scan for violations:**
   ```bash
   curl -X POST http://localhost:5000/api/dataretention/scan \
     -H "Authorization: Bearer $TOKEN" \
     -d '{"directoryPath":"C:\\Test"}'
   ```
3. **Review results** - Files violating retention policies will be flagged
4. **Delete violating files** - Use UI or API to delete files after confirmation

### Testing Database Operations

**Create backup (Admin only):**
```bash
curl -X POST https://localhost:5001/api/database/backup \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "X-CSRF-Token: $CSRF_TOKEN"
```

**Restore from backup (Admin only):**
```bash
curl -X POST https://localhost:5001/api/database/restore \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "X-CSRF-Token: $CSRF_TOKEN" \
  -d '{"fileName":"backup_20241217.db"}'
```

### Debugging SignalR Connection Issues

- Check that API is running on port 5000 (or 5001 for HTTPS)
- Verify CORS policy allows connections
- Check browser/Electron console for SignalR connection errors
- SignalR uses WebSockets - ensure no firewall blocking
- For HTTPS: Ensure certificate is trusted (dev certificate may require acceptance)

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
- **MD5 Hash Optimization**: Hash computation is deferred until PII is detected, reducing I/O operations by 10-50x for directories with low PII density
  - Before optimization: Hash calculated for ALL files
  - After optimization: Hash calculated ONLY for files containing PII
  - Example: 1000 files with 50 PII files → 950 hash calculations saved

## Tests

Le projet dispose d'une suite de tests complète couvrant le backend .NET et le frontend React.

### Vue d'ensemble

| Composant | Framework | Tests | Fichiers |
|-----------|-----------|-------|----------|
| Backend (.NET) | xUnit + FluentAssertions | 88 | PiiScanner.Core.Tests/ |
| Frontend (React) | Vitest + Testing Library | 30 | pii-scanner-ui/src/components/__tests__/ |
| **Total** | | **118** | |

### Exécuter les Tests

**Tests .NET (Backend):**
```bash
# Exécuter tous les tests .NET
dotnet test PiiScanner.Core.Tests

# Avec détails verbeux
dotnet test PiiScanner.Core.Tests --verbosity normal

# Filtrer par nom de test
dotnet test PiiScanner.Core.Tests --filter "PiiDetector"
```

**Tests React (Frontend):**
```bash
cd pii-scanner-ui

# Exécuter une fois (CI/CD)
npm run test:run

# Mode watch (développement)
npm run test

# Avec couverture de code
npm run test:coverage
```

**Tous les tests (PowerShell):**
```powershell
# Note: Utiliser ; au lieu de && en PowerShell
dotnet test PiiScanner.Core.Tests ; cd pii-scanner-ui ; npm run test:run ; cd ..
```

### Structure des Tests

**PiiScanner.Core.Tests/** - Tests unitaires .NET:
- [Analysis/PiiDetectorTests.cs](PiiScanner.Core.Tests/Analysis/PiiDetectorTests.cs) - 80+ tests pour la détection PII
  - Tests de validation pour chaque type de PII (Email, IFU, CNI, IBAN, etc.)
  - Tests des faux positifs à rejeter
  - Tests de validation Luhn pour cartes bancaires
  - Tests multi-PII dans un même document
- [Utils/PathValidatorTests.cs](PiiScanner.Core.Tests/Utils/PathValidatorTests.cs) - Tests de sécurité
  - Validation des chemins de fichiers
  - Protection contre path traversal (../, etc.)
  - Blocage des répertoires système

**pii-scanner-ui/src/components/__tests__/** - Tests React:
- [Login.test.tsx](pii-scanner-ui/src/components/__tests__/Login.test.tsx) - 15 tests
  - Rendu du formulaire
  - Validation des champs
  - Flux de connexion
  - États de chargement
- [InitialSetup.test.tsx](pii-scanner-ui/src/components/__tests__/InitialSetup.test.tsx) - 15 tests
  - Validation du nom d'utilisateur (3+ caractères)
  - Validation du mot de passe (12+ chars, complexité)
  - Correspondance des mots de passe
  - Gestion des erreurs API

### Écrire un Nouveau Test

**Pattern ARRANGE / ACT / ASSERT:**

```csharp
// Exemple test .NET (xUnit + FluentAssertions)
[Fact]
public void Detect_Email_ShouldDetectValidEmail()
{
    // ARRANGE - Préparer les données de test
    var content = "Contact: jean.dupont@example.com";
    var filePath = "/test/file.txt";

    // ACT - Exécuter le code à tester
    var results = PiiDetector.Detect(content, filePath);

    // ASSERT - Vérifier le résultat
    results.Should().ContainSingle(r => r.PiiType == "Email");
    results.First().Match.Should().Be("jean.dupont@example.com");
}
```

```typescript
// Exemple test React (Vitest + Testing Library)
it('should call login with correct credentials', async () => {
  // ARRANGE
  mockLogin.mockResolvedValueOnce({});
  renderLogin();
  const user = userEvent.setup();

  // ACT
  await user.type(screen.getByLabelText(/nom d'utilisateur/i), 'admin');
  await user.type(screen.getByLabelText(/mot de passe/i), 'password');
  await user.click(screen.getByRole('button', { name: /se connecter/i }));

  // ASSERT
  await waitFor(() => {
    expect(mockLogin).toHaveBeenCalledWith('admin', 'password');
  });
});
```

### CI/CD Integration

Les tests sont automatiquement exécutés via GitHub Actions à chaque push/PR:
- Voir [.github/workflows/ci.yml](.github/workflows/ci.yml)
- Job `test-backend`: Exécute `dotnet test`
- Job `test-frontend`: Exécute `npm run test:run`
- Job `build`: S'exécute seulement si les tests passent

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
- User management (create, update, delete, role changes)
- Database operations (backup, restore, delete, optimize)
- Scan operations (start, complete, fail)

**Log fields:** UserId, Action, EntityType, EntityId, IpAddress, Details, CreatedAt

#### SQL Injection Protection
- Entity Framework Core with parameterized queries
- No string concatenation in SQL
- LINQ-based queries only

#### CORS Configuration
- Configured in [Program.cs](PiiScanner.Api/Program.cs) lines 71-91
- Development: Allows both `localhost` and `127.0.0.1` origins
  - HTTP ports: 3000, 3001, 5173, 5174, 5175
  - HTTPS ports: 3000, 3001, 5173, 5174, 5175
- **Production**: Replace with specific allowed origins

#### Security Features Summary

**Implemented (Production-Ready):**
1. ✅ **HTTPS/TLS 1.2+** - Encrypted communication with security headers
2. ✅ **Rate Limiting** - Login (5/15min), Sensitive ops (20/5min), General (100/min)
3. ✅ **Database Encryption** - SQLCipher with AES-256, 256-bit key, NTFS ACL protection
4. ✅ **CSRF Protection** - Double-Submit Cookie Pattern with cryptographic tokens
5. ✅ **Path Traversal Protection** - PathValidator blocks directory traversal attacks
6. ✅ **Audit Logging** - Complete trail of all sensitive operations
7. ✅ **Password Security** - BCrypt hashing with automatic salt
8. ✅ **JWT Authentication** - 7-day access tokens + 30-day refresh tokens
9. ✅ **Role-Based Access Control (RBAC)** - Admin vs User separation
10. ✅ **Security Headers** - HSTS, X-Frame-Options, X-Content-Type-Options, CSP, etc.
11. ✅ **SQL Injection Protection** - Entity Framework parameterized queries only
12. ✅ **Content Security Policy (CSP)** - XSS protection with strict resource loading policy

**Recommended for Production:**
1. Rotate JWT secret periodically (every 90 days)
2. Set up automated database backups
3. Configure monitoring and alerting for security events
4. Regular security audits (OWASP ZAP, Burp Suite)
5. Dependency vulnerability scanning (Snyk, npm audit, dotnet list package --vulnerable)
6. Update CORS to specific production origins
7. Consider Azure Key Vault or AWS Secrets Manager for encryption key storage

## Quick Reference

### Common Build Commands

```bash
# Build entire solution
dotnet build PiiScanner.sln

# Build for release
dotnet build -c Release PiiScanner.sln

# Publish API for production
cd PiiScanner.Api
dotnet publish -c Release -o bin/Release/net8.0/publish

# Frontend build
cd pii-scanner-ui
npm install
npm run build
npm run electron:build:win
```

### Development Workflow

```bash
# Terminal 1: Start API
cd PiiScanner.Api
dotnet run

# Terminal 2 (optionnel): Start Vite dev server for hot reload
cd pii-scanner-ui
npm run dev
```

### Database Commands

```bash
# Create migration
cd PiiScanner.Api
dotnet ef migrations add MigrationName

# Apply migrations
dotnet ef database update

# Remove last migration
dotnet ef migrations remove
```

### Troubleshooting

**API won't start:**
- Check if port 5000/5001 is already in use
- Verify .NET 8.0 SDK is installed: `dotnet --version`
- Check database encryption key permissions
- Review logs in console output

**Web app can't connect to API:**
- Ensure API is running on `https://localhost:5001`
- For production: Check that React build is in `wwwroot/`
- For dev mode: Verify Vite proxy configuration in `vite.config.ts`
- For HTTPS: Trust dev certificate with `dotnet dev-certs https --trust`
- Check browser console for CORS or network errors

**SignalR connection fails:**
- Verify WebSocket support (not blocked by firewall/proxy)
- Check browser console for connection errors
- Ensure CORS allows the origin
- Try HTTP instead of HTTPS for local testing

**Database locked errors:**
- Only one instance of the API can access the encrypted database at a time
- Close other instances or use different database files for testing
- Check for zombie processes: `tasklist | findstr PiiScanner`

**Frontend build fails:**
- Clear node_modules and reinstall: `rm -rf node_modules && npm install`
- Check Node.js version: `node --version` (requires 18+)
- Clear Vite cache: `rm -rf node_modules/.vite`

**Windows SmartScreen blocks portable app:**
- **Cause**: Application signed with self-signed certificate (instead of commercial ~300€/year)
- **Solution 1 (Recommended)**: Install certificate with `InstallCertificate.bat` (Admin)
- **Solution 2**: Add Defender exclusion with `Ajouter-Exclusion-Windows-Defender.bat` (Admin)
- **Solution 3**: Unblock files with `Débloquer-Fichiers.bat`
- **Complete guide**: See [INSTALLATION.md - Windows SmartScreen](INSTALLATION.md#windows-smartscreen)

**Portable app shows blank page after admin creation:**
- **Fix**: Implemented in [App.tsx:179-192](pii-scanner-ui/src/App.tsx#L179-L192)
- **Workaround**: Restart the application

### Useful Endpoints for Testing

```bash
# Check initialization status
curl http://localhost:5000/api/initialization/status

# Login (get JWT token)
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"yourpassword"}'

# Start a scan (requires auth)
curl -X POST http://localhost:5000/api/scan/start \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"directoryPath":"C:\\Test"}'

# Get scan results
curl http://localhost:5000/api/scan/{scanId}/results \
  -H "Authorization: Bearer YOUR_TOKEN"
```
