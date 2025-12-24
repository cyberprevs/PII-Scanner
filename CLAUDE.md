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
- [Program.cs](PiiScanner.Api/Program.cs) - CORS enabled for Electron, Swagger in dev mode, DB initialization, HTTPS configuration

**Configuration:**
- Ports:
  - HTTP: 5000 (development)
  - HTTPS: 5001 (development and production)
- CORS: `AllowElectron` policy allows localhost and 127.0.0.1 origins for development:
  - HTTP: ports 3000, 3001, 5173-5175
  - HTTPS: ports 3000, 3001, 5173-5175
  - Both `localhost` and `127.0.0.1` variants supported
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
  - Banking data (IBAN, Mobile Money, CarteBancaire): 5 years default
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
- [src/services/apiClient.ts](pii-scanner-ui/src/services/apiClient.ts) - API client with SignalR hub
- [src/services/axios.ts](pii-scanner-ui/src/services/axios.ts) - Axios instance with JWT interceptors and CSRF token handling
- [src/contexts/AuthContext.tsx](pii-scanner-ui/src/contexts/AuthContext.tsx) - Authentication state management

**UI Pages (15 specialized pages):**
1. [Dashboard.tsx](pii-scanner-ui/src/components/Dashboard.tsx) - Key metrics and statistics
2. [Scanner.tsx](pii-scanner-ui/src/components/Scanner.tsx) - Scan initiation and real-time progress
3. [History.tsx](pii-scanner-ui/src/components/History.tsx) - All past scans
4. [RiskyFiles.tsx](pii-scanner-ui/src/components/RiskyFiles.tsx) - Top 20 high-risk files
5. [SensitiveData.tsx](pii-scanner-ui/src/components/SensitiveData.tsx) - All PII detections
6. [StaleData.tsx](pii-scanner-ui/src/components/StaleData.tsx) - Old/obsolete files analysis
7. [OverExposedData.tsx](pii-scanner-ui/src/components/OverExposedData.tsx) - Over-exposed files (NTFS ACL analysis)
8. [Analytics.tsx](pii-scanner-ui/src/components/Analytics.tsx) - Charts and visualizations
9. [Exports.tsx](pii-scanner-ui/src/components/Exports.tsx) - Download reports (CSV, JSON, HTML, Excel)
10. [DataRetention.tsx](pii-scanner-ui/src/components/DataRetention.tsx) - Retention policy management and file deletion
11. [Users.tsx](pii-scanner-ui/src/components/Users.tsx) - User management (Admin only)
12. [Database.tsx](pii-scanner-ui/src/components/Database.tsx) - Database backup/restore (Admin only)
13. [AuditLogs.tsx](pii-scanner-ui/src/components/AuditLogs.tsx) - Security audit trail (Admin only)
14. [Profile.tsx](pii-scanner-ui/src/components/Profile.tsx) - User profile management
15. [Support.tsx](pii-scanner-ui/src/components/Support.tsx) - Help center, FAQ, contact

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
   - Password validation: 12+ chars with uppercase, lowercase, number, special character
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
- **Telephone**: Bénin phone numbers (+229/00229 required, prefixes 40-59, 60-69, 90-99)

**Bénin Banking Data** (triggers high-risk classification):
- **IBAN**: Bénin IBAN (BJ + 2 digits + 24 characters)
- **MobileMoney_MTN**: MTN MoMo (starts with 96, 97, 66, 67)
- **MobileMoney_Moov**: Moov Money (starts with 98, 99, 68, 69)

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
10. ✅ **Security Headers** - HSTS, X-Frame-Options, X-Content-Type-Options, etc.
11. ✅ **SQL Injection Protection** - Entity Framework parameterized queries only

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

# Terminal 2: Start Electron UI
cd pii-scanner-ui
npm run electron:dev
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

**Electron app can't connect to API:**
- Ensure API is running on port 5000 (or 5001 for HTTPS)
- Check CORS configuration in [Program.cs](PiiScanner.Api/Program.cs)
- Verify firewall isn't blocking connections
- For HTTPS: Trust dev certificate with `dotnet dev-certs https --trust`

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
