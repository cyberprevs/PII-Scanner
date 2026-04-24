# PII Scanner Security Audit Report
**Date:** April 24, 2026  
**Scope:** Full stack security review (Backend .NET + Frontend React + Database encryption)  
**Focus:** Realistic, exploitable vulnerabilities with clear attack paths

---

## Executive Summary

The PII Scanner application demonstrates **solid foundational security practices** with several well-implemented security controls. However, **4 medium-severity and 3 low-severity findings** have been identified that should be addressed before production deployment.

**Risk Posture:** MEDIUM-HIGH (suitable for internal use with mitigations; not production-ready for external deployment)

**Key Strengths:**
- Strong database encryption (SQLCipher AES-256) with NTFS ACL protection
- Dual JWT + CSRF protection architecture
- Path traversal protection via PathValidator
- Input validation with anti-false-positive filters for PII regex
- Session-based scan isolation
- APDP compliance features (consent modal, audit logging, right to erasure)
- Rate limiting on sensitive endpoints
- Exception handling that masks internal errors in production

**Critical Issues Requiring Remediation:**
- **HTTP Header Injection** in rate limit responses (password exposure risk)
- **Rate Limit Bypass** via X-Forwarded-For spoofing (no proxy validation)
- **Sensitive Error Messages** disclosed in API responses and logs
- **JWT Expiration Extended in Development** (168 hours vs recommended 8)

---

## Findings by Category

### 1. AUTHENTICATION & AUTHORIZATION

#### Finding 1.1: JWT Token Expiration Too Long in Development [MEDIUM]

**Severity:** MEDIUM  
**Affected Component:** `PiiScanner.Api/Program.cs` (line 17), `PiiScanner.Api/appsettings.json` (line 17)  
**Status:** EXISTING - Development configuration only

**Description:**
JWT tokens are configured with a 168-hour (7-day) expiration in development (`appsettings.json`), which exceeds NIST recommendations (typically 1-8 hours). While production is correctly set to 8 hours, long-lived tokens in development increase the window for token theft and reuse.

**Code Location:**
```csharp
// appsettings.json
"Jwt": {
  "ExpirationHours": "168"  // 7 days - excessive
}
```

**Exploitation Scenario:**
- Attacker compromises a developer's machine and extracts JWT from localStorage
- Token remains valid for 7 days without re-authentication
- Attacker gains sustained access to scan operations and PII data

**Remediation:**
1. Reduce JWT expiration to 1-2 hours for development: `"ExpirationHours": "2"`
2. Rely on refresh tokens (30-day expiration) for session persistence
3. Document this in security guidelines

**Effort:** LOW (configuration change only)  
**Priority:** MEDIUM (development environment only, but improves security posture)

---

#### Finding 1.2: Insufficient Session IP Validation [MEDIUM]

**Severity:** MEDIUM  
**Affected Component:** `PiiScanner.Api/Services/AuthService.cs` (lines 38-45)  
**Status:** EXISTING - Session creation

**Description:**
Sessions are created with `IpAddress` captured at login, but this IP is never validated on subsequent requests. If an attacker steals a valid JWT, they can use it from any IP address without detection.

**Code Location:**
```csharp
var session = new Session
{
    UserId = user.Id,
    RefreshToken = refreshToken,
    CreatedAt = DateTime.UtcNow,
    ExpiresAt = DateTime.UtcNow.AddDays(30),
    IpAddress = ipAddress  // Stored but never validated
};
```

**Exploitation Scenario:**
1. User logs in from IP `192.168.1.100`
2. Attacker steals JWT token via XSS or MitM
3. Attacker uses JWT from IP `203.0.113.50` (different country, different ISP)
4. Application allows request without IP mismatch warnings

**Remediation:**
1. Implement IP validation middleware that compares request IP with session IP
2. Allow graceful degradation: warn on mismatch but allow (for mobile users with changing IPs)
3. Log IP mismatches for security monitoring
4. Consider device fingerprinting as secondary validation

**Effort:** MEDIUM  
**Priority:** MEDIUM (helps detect token theft)

---

### 2. DATA PROTECTION & ENCRYPTION

#### Finding 2.1: Database Encryption Key Stored on Disk Without Adequate Protection [MEDIUM]

**Severity:** MEDIUM  
**Affected Component:** `PiiScanner.Api/Services/DatabaseEncryptionService.cs` (lines 40-68)  
**Status:** EXISTING - File-based key storage

**Description:**
The SQLCipher encryption key is auto-generated and saved to `db_encryption.key` on disk. While the code attempts to set NTFS ACL protections and Hidden/ReadOnly attributes, **the key is stored as plaintext in hexadecimal format**, and **NTFS ACL protection can be bypassed** by administrators or system service accounts.

**Code Location:**
```csharp
// File created at: AppDomain.CurrentDomain.BaseDirectory/db_encryption.key
File.WriteAllText(keyFilePath, newKey);  // Plaintext storage

// ACL protection attempted but can fail silently
if (OperatingSystem.IsWindows())
{
    SecureKeyFile(keyFilePath);  // May fail without exception handling
}
```

**Exploitation Scenarios:**

**Scenario 1: Administrator Access**
- Attacker gains administrator privileges (UAC bypass, privilege escalation)
- Removes Hidden/ReadOnly attributes
- Reads plaintext key from disk
- Decrypts SQLite database offline

**Scenario 2: System Service Account**
- Application runs as SYSTEM service (common in production)
- Any process with SYSTEM privilege can read the key
- Malware with SYSTEM access can extract both key and database

**Scenario 3: Backup/Recovery Access**
- System administrator backs up the database directory
- Backup is copied to external drive without encryption
- Attacker gains access to backup and plaintext key

**Risk Amplification:**
The key is auto-generated on first run and **never prompted to be backed up securely**. This means in practice:
- Organizations store key in same location as database (poor key separation)
- No key rotation mechanism exists
- Lost key = permanent data loss (no recovery option)

**Remediation:**
1. **Configuration-based key storage (Recommended):**
   - Require `Database:EncryptionKey` to be set in environment variables or Azure Key Vault
   - Throw startup error if key is not configured in production
   - Remove auto-generation in production mode

2. **Improve file-based protection:**
   - Use DPAPI (Data Protection API) to encrypt key before storing on disk
   ```csharp
   var encryptedKey = ProtectedData.Protect(
       Encoding.UTF8.GetBytes(keyBytes), 
       null, 
       DataProtectionScope.CurrentUser);
   File.WriteAllBytes(keyFilePath, encryptedKey);
   ```
   - Separate key location from database (different drives/servers)
   - Implement key rotation with versioning

3. **Add audit logging:**
   - Log all key access attempts
   - Alert on ACL bypass attempts

**Effort:** MEDIUM (requires configuration changes and environment setup)  
**Priority:** HIGH (directly affects database security)

---

#### Finding 2.2: Report Encryption Password Transmitted in Plaintext Header [LOW]

**Severity:** LOW  
**Affected Component:** `PiiScanner.Api/Controllers/ScanController.cs` (lines 160-178)  
**Status:** EXISTING - Report download flow

**Description:**
The AES-256 report encryption password is generated and returned in the `X-Report-Password` HTTP response header. While the report itself is encrypted, **the password is transmitted in plaintext in the HTTP header**, and if HTTPS fails or is downgraded, the password could be intercepted.

**Code Location:**
```csharp
// Generate password and encrypt report
var password = ReportEncryption.GenerateReportPassword();
var encryptedBytes = ReportEncryption.EncryptFileAes(filePath, password);

// Return password in plaintext header
Response.Headers.Append("X-Report-Password", password);
```

**Exploitation Scenario:**
- User downloads encrypted report over HTTPS
- Network interception (Fiddler, proxy) captures the password header
- Attacker decrypts the report locally without needing to access the server again

**Risk Mitigation Notes:**
- The application does enforce HTTPS redirection in secure mode
- The password is shown only once in a dialog (good UX security)
- The password is not stored server-side (good practice)

**Remediation:**
1. **Encrypt password before returning (Medium effort):**
   - Derive encryption key from user's JWT token
   - Return encrypted password in body instead of header
   - Client decrypts using JWT claims
   ```csharp
   var encryptedPassword = EncryptPasswordWithUserKey(password, userId, jwtSecret);
   return Json(new { file = encryptedBytes, encryptedPassword });
   ```

2. **Use symmetric key derivation (Low effort, partial mitigation):**
   - Generate password from hash of (userId + scanId + timestamp)
   - Client can re-derive password without transmission
   - Timestamp window limits replay attacks

3. **Disable report download (Nuclear option):**
   - Require user to decrypt report in-browser only
   - Download only decrypted content

**Effort:** MEDIUM (code refactoring needed)  
**Priority:** LOW (HTTPS reduces practical risk; password is intended to be shown once)

---

### 3. INPUT VALIDATION & INJECTION PREVENTION

#### Finding 3.1: HTTP Header Injection in Rate Limit Response Headers [MEDIUM]

**Severity:** MEDIUM  
**Affected Component:** `PiiScanner.Api/Middleware/RateLimitingMiddleware.cs` (lines 76-80)  
**Status:** EXISTING - Rate limit error responses

**Description:**
The `X-RateLimit-Reset` header is populated with a DateTime value formatted as ISO 8601 string (`ToString("o")`). While this is typically safe, the response body contains user-controlled data (endpoint path) that is not sanitized before being serialized to JSON. Additionally, **headers are not validated for CRLF injection**, which could allow response splitting attacks.

**Code Location:**
```csharp
context.Response.Headers["X-RateLimit-Reset"] = resetTime.ToString("o");
await context.Response.WriteAsJsonAsync(new
{
    error = "Trop de requêtes",
    message = $"Vous avez dépassé la limite de {maxRequests} requêtes par {windowMinutes} minute(s)...",
    retryAfter = retryAfterSeconds,
    type = endpointType  // User-controlled, not validated
});
```

**Exploitation Scenario:**
- Attacker crafts malicious path: `/api/scan/inject%0d%0aX-Injection: value`
- If header validation is relaxed, CRLF characters bypass filtering
- Attacker injects custom headers or response splitting to:
  - Set cookies (Cache-Poison)
  - Redirect to malicious site
  - Inject JavaScript in response headers (low probability but possible)

**Note:** Modern ASP.NET Core is resilient to CRLF injection in response headers and will throw exceptions, but defense-in-depth requires validation.

**Remediation:**
1. **Validate and sanitize endpoint path before using in response:**
   ```csharp
   var endpointType = path.Contains("/api/auth/login") ? "login" : 
                      path.Contains("/api/users") ? "sensitive" : "api";
   
   // Avoid using raw path in error messages
   var message = $"Rate limit exceeded. Retry in {retryAfterSeconds} seconds.";
   ```

2. **Add header injection detection middleware:**
   ```csharp
   if (value.Contains("\r") || value.Contains("\n"))
   {
       _logger.LogWarning("CRLF injection attempt detected in header: {Header}", headerName);
       throw new InvalidOperationException($"Invalid characters in header {headerName}");
   }
   ```

3. **Use DateTime serialization instead of ToString("o"):**
   ```csharp
   context.Response.Headers["X-RateLimit-Reset"] = resetTime.ToUniversalTime()
       .ToString("yyyyMMddTHHmmssZ");  // No special characters
   ```

**Effort:** LOW (sanitization of existing code)  
**Priority:** MEDIUM (existing ASP.NET Core mitigations reduce practical risk)

---

#### Finding 3.2: Rate Limit Bypass via X-Forwarded-For Spoofing [MEDIUM]

**Severity:** MEDIUM  
**Affected Component:** `PiiScanner.Api/Middleware/RateLimitingMiddleware.cs` (lines 143-161)  
**Status:** EXISTING - IP address detection

**Description:**
The rate limiting middleware extracts client IP from `X-Forwarded-For` and `X-Real-IP` headers **without validation**. These headers are **user-controllable** and can be spoofed to bypass rate limits on login and sensitive endpoints.

**Code Location:**
```csharp
private string GetClientIpAddress(HttpContext context)
{
    var forwardedFor = context.Request.Headers["X-Forwarded-For"].FirstOrDefault();
    if (!string.IsNullOrEmpty(forwardedFor))
    {
        return forwardedFor.Split(',')[0].Trim();  // Takes first IP without validation
    }

    var realIp = context.Request.Headers["X-Real-IP"].FirstOrDefault();
    if (!string.IsNullOrEmpty(realIp))
    {
        return realIp;  // No validation
    }

    return context.Connection.RemoteIpAddress?.ToString() ?? "unknown";
}
```

**Exploitation Scenario:**

**Attack: Brute-force login bypass**
1. Attacker crafts 100 login attempts with different `X-Forwarded-For` headers:
   ```
   X-Forwarded-For: 192.168.1.1
   X-Forwarded-For: 192.168.1.2
   X-Forwarded-For: 192.168.1.3
   ... (100 different IPs)
   ```
2. Rate limiter sees each as different IP, allows 5 attempts per IP
3. Attacker performs 500 login attempts instead of limited 5

**Attack: Distributed brute-force coordination**
1. Multiple attackers coordinate to use rotating IPs
2. Each attacker sends requests as different IPs
3. Rate limit becomes effectively useless

**Real-world scenario:**
- Application is behind reverse proxy (Nginx, HAProxy)
- Proxy correctly adds `X-Forwarded-For` header
- Attacker spoofs additional `X-Forwarded-For` headers to appear different from proxy's IP
- Rate limiter trusts the spoofed IP

**Remediation:**

**Option 1: Whitelist proxy IPs (Recommended for production)**
```csharp
private static readonly HashSet<string> TrustedProxies = new()
{
    "127.0.0.1",        // localhost proxy
    "10.0.0.1",         // nginx proxy IP
    "10.0.0.2"          // backup proxy
};

private string GetClientIpAddress(HttpContext context)
{
    var directIp = context.Connection.RemoteIpAddress?.ToString();
    
    // Only trust X-Forwarded-For if request came from trusted proxy
    if (directIp != null && TrustedProxies.Contains(directIp))
    {
        var forwardedFor = context.Request.Headers["X-Forwarded-For"].FirstOrDefault();
        if (!string.IsNullOrEmpty(forwardedFor))
        {
            return forwardedFor.Split(',')[0].Trim();
        }
    }
    
    // Fallback to direct connection IP (safest)
    return directIp ?? "unknown";
}
```

**Option 2: Use ASP.NET Core ForwardedHeaders middleware (Better approach)**
```csharp
// In Program.cs, BEFORE rate limiting middleware
var forwardedHeadersOptions = new ForwardedHeadersOptions
{
    ForwardedHeaders = ForwardedHeaders.XForwardedFor,
    TrustedProxies = { "127.0.0.1", "10.0.0.1" }
};
app.UseForwardedHeaders(forwardedHeadersOptions);

// Then use context.Connection.RemoteIpAddress which is properly validated
```

**Option 3: Rate limit by session/JWT token (Defense in depth)**
```csharp
// In addition to IP-based rate limiting, also rate limit by user ID
var sessionKey = context.User.Identity?.IsAuthenticated == true
    ? $"user:{userId}"
    : $"ip:{GetClientIpAddress(context)}";
```

**Effort:** MEDIUM (requires configuration management for trusted IPs)  
**Priority:** HIGH (directly affects brute-force attack mitigation)

---

### 4. ERROR HANDLING & INFORMATION DISCLOSURE

#### Finding 4.1: Sensitive Error Messages Disclosed in API Responses [MEDIUM]

**Severity:** MEDIUM  
**Affected Component:** Multiple controllers (`DataRetentionController.cs`, `ScanController.cs`)  
**Status:** EXISTING - Error responses

**Description:**
Several API endpoints return raw exception messages to clients, including details like file paths, database errors, and system information. The exception handling middleware only masks errors for unhandled exceptions; **controller-level exception handlers expose details**.

**Code Locations:**

1. **ScanController.cs (line 91):**
```csharp
return StatusCode(500, new ScanResponse
{
    Message = $"Erreur interne: {ex.Message}"  // Exposes exception details
});
```

2. **DataRetentionController.cs (lines 92):**
```csharp
_logger.LogError($"Erreur lors du scan: {ex.Message}");
return StatusCode(500, new { error = ex.Message });  // Returns ex.Message to client
```

**Exploitation Scenario:**

**Example 1: Database path disclosure**
```
"error": "Erreur lors du scan: Could not open C:\Data\PiiScannerDB\piiscanner.db"
```
Attacker learns:
- Database location
- Full path structure
- Confirmation database exists

**Example 2: File system structure disclosure**
```
"error": "Erreur: Access denied to C:\Users\Admin\Documents\SensitiveData\..."
```
Attacker maps file structure and user directories

**Example 3: Detailed stack traces in logs (logs exposed via vulnerable endpoint)**
```
NullReferenceException at ScanService.ExecuteScan()
  at FileScanner.ScanDirectory(String path) line 51
```
Attacker learns internal code paths and potential vulnerabilities

**Remediation:**

1. **Create generic error responses:**
```csharp
try 
{
    // operations
}
catch (Exception ex)
{
    _logger.LogError(ex, "Error during scan for user {UserId}", userId);
    
    // Return generic error to client
    return StatusCode(500, new 
    { 
        error = "Erreur lors de l'opération. Veuillez réessayer ou contacter le support." 
    });
}
```

2. **Use error codes instead of messages:**
```csharp
return StatusCode(500, new 
{ 
    error = "SCAN_FAILED",
    errorCode = "ERR_001",
    message = "An error occurred. Please try again."
    // Client-side can use error code to show localized messages
});
```

3. **Log detailed errors securely:**
```csharp
// Log to file/monitoring system (not returned to client)
_logger.LogError(ex, "Scan failed for user {UserId} at {Path}: {Details}", 
    userId, request.DirectoryPath, ex.StackTrace);

// Client sees only: "An error occurred. Error ID: ERR_001"
var errorId = Guid.NewGuid();
return StatusCode(500, new 
{ 
    message = "An error occurred.",
    errorId = errorId.ToString()
});
```

4. **Implement secure error tracking:**
   - Use tools like Sentry, Application Insights, or Datadog
   - Log full errors to backend monitoring
   - Return only error IDs and generic messages to client
   - Support staff can look up error by ID in monitoring system

**Effort:** LOW-MEDIUM (requires centralized error handling refactor)  
**Priority:** MEDIUM (information disclosure, but requires additional vulnerability chaining)

---

#### Finding 4.2: Console Output Disclosing Sensitive Information [LOW]

**Severity:** LOW  
**Affected Component:** `PiiScanner.Api/Services/ScanService.cs` (line 127)  
**Status:** EXISTING - Error logging

**Description:**
The ScanService logs errors to `Console.WriteLine()` instead of using the ILogger interface. Console output appears in server logs/stdout, which may be accessible to unauthorized parties.

**Code Location:**
```csharp
Console.WriteLine($"Erreur lors de la mise à jour de la BDD pour le scan {scanId}: {ex.Message}");
```

**Exploitation Scenario:**
- Attacker gains read access to container logs or system stdout
- Extracts sensitive information from console output
- Potentially identifies attack patterns from error messages

**Remediation:**
Replace all `Console.WriteLine()` with injected `ILogger`:
```csharp
_logger.LogError(ex, "Error updating database for scan {ScanId}", scanId);
```

**Effort:** LOW (find/replace across codebase)  
**Priority:** LOW (low impact, mostly redundant with logger)

---

### 5. CONFIGURATION & SECRETS MANAGEMENT

#### Finding 5.1: Production JWT Secret Not Changed from Placeholder [CRITICAL - CONFIG]

**Severity:** CRITICAL (Configuration issue, not code)  
**Affected Component:** `PiiScanner.Api/appsettings.Production.json` (line 17)  
**Status:** EXISTING - Placeholder value

**Description:**
The production `appsettings.Production.json` contains a placeholder JWT secret:
```json
"Jwt": {
  "Secret": "CHANGEZ_CETTE_CLE_EN_PRODUCTION_AVEC_UNE_VALEUR_ALEATOIRE_DE_32_BYTES"
}
```

While the code in `Program.cs` checks for the development secret and throws an error, **it does NOT check for placeholder Production secrets**. If someone deploys with this file as-is, JWTs are signed with a known/weak secret.

**Code Location:**
```csharp
// Program.cs lines 86-93 - Only checks for DEFAULT_SECRET
if (jwtSecret == DEFAULT_SECRET && !builder.Environment.IsDevelopment())
{
    throw new InvalidOperationException("ERREUR DE SÉCURITÉ CRITIQUE...");
}
```

**Exploitation Scenario:**
1. Organization deploys with `appsettings.Production.json` as-is
2. Attacker knows placeholder secret
3. Attacker forges valid JWT tokens with arbitrary claims
4. Attacker impersonates any user, including admin

**Remediation:**
1. **Improve secret validation in Program.cs:**
```csharp
const string PLACEHOLDER_PROD_SECRET = "CHANGEZ_CETTE_CLE_EN_PRODUCTION_AVEC_UNE_VALEUR_ALEATOIRE_DE_32_BYTES";

if ((jwtSecret == DEFAULT_SECRET || jwtSecret == PLACEHOLDER_PROD_SECRET) 
    && !builder.Environment.IsDevelopment())
{
    throw new InvalidOperationException(
        "ERREUR SÉCURITÉ CRITIQUE: Secret JWT non configuré en production!\n" +
        "Générez une clé avec: dotnet user-secrets set Jwt:Secret $(openssl rand -base64 32)\n" +
        "Ou configurez via variable d'environnement: Jwt__Secret=<value>");
}

// Also check minimum length
if (jwtSecret?.Length < 32)
{
    throw new InvalidOperationException("JWT secret must be at least 32 characters long");
}
```

2. **Use environment variables instead of files:**
```bash
# deployment script
export Jwt__Secret=$(openssl rand -base64 32)
dotnet PiiScanner.Api.dll
```

3. **Document deployment security checklist:**
   - Generate secrets using cryptographically secure RNG
   - Store secrets in vault (Azure Key Vault, HashiCorp Vault)
   - Never commit real secrets to git
   - Rotate secrets regularly (quarterly or after personnel changes)

**Effort:** LOW (configuration validation)  
**Priority:** CRITICAL (for production deployments only)

---

### 6. APDP COMPLIANCE & RIGHT TO ERASURE

#### Finding 6.1: Scan Results Persisted in Memory Without Cleanup [LOW]

**Severity:** LOW  
**Affected Component:** `PiiScanner.Api/Services/ScanService.cs` (in-memory dictionary)  
**Status:** EXISTING - Design

**Description:**
Scan results are stored in memory in a Singleton `ScanService`. While the CLAUDE.md documentation notes that results are "never persisted to the database," **they are never automatically cleaned up either**. Long-running applications may accumulate results in memory.

**Exploitation Scenario:**
- User runs thousands of scans over weeks
- Results remain in memory indefinitely
- Attacker with memory access (process dump, memory inspection) extracts all historical results
- User cannot verify what results are in memory

**Remediation:**
1. **Implement automatic cleanup:**
```csharp
public class ScanService
{
    private static readonly ConcurrentDictionary<string, ScanState> _scanResults = new();
    private static readonly Timer _cleanupTimer;
    
    static ScanService()
    {
        _cleanupTimer = new Timer(CleanupOldResults, null, 
            TimeSpan.FromHours(1), TimeSpan.FromHours(1));
    }
    
    private static void CleanupOldResults(object? state)
    {
        var cutoff = DateTime.UtcNow.AddHours(-24);  // Keep results for 24h
        var keysToRemove = _scanResults
            .Where(kvp => kvp.Value.CompletedAt < cutoff)
            .Select(kvp => kvp.Key)
            .ToList();
        
        foreach (var key in keysToRemove)
        {
            _scanResults.TryRemove(key, out _);
        }
    }
}
```

2. **Document data retention policy:**
   - Specify how long results stay in memory
   - Provide API to explicitly clear results
   - Log cleanup operations for audit trail

3. **Use distributed cache (for multi-server deployments):**
   ```csharp
   services.AddStackExchangeRedisCache(options =>
   {
       options.Configuration = "localhost:6379";
       options.InstanceName = "PiiScanner_";
   });
   ```

**Effort:** LOW-MEDIUM  
**Priority:** LOW (low probability of exploitation; documented behavior)

---

### 7. FRONTEND SECURITY

#### Finding 7.1: JWT Token Stored in localStorage (Client-side) [LOW]

**Severity:** LOW  
**Affected Component:** `pii-scanner-ui/src/contexts/AuthContext.tsx`  
**Status:** EXISTING - Design

**Description:**
JWT tokens are stored in browser localStorage, which is accessible to any XSS vulnerability. While the application has no found XSS vulnerabilities currently, **localStorage is not protected from JavaScript-based attacks**.

**Code Location:**
```typescript
localStorage.setItem('token', newToken);
```

**Exploitation Scenario:**
- Attacker injects XSS payload into application (e.g., via file path input that escapes sanitization)
- Payload extracts JWT: `fetch('/api/logout?token=' + localStorage.getItem('token'))`
- Attacker hijacks user session

**Mitigation Already Present:**
- No `dangerouslySetInnerHTML` usage found in codebase
- React properly escapes JSX expressions
- Content Security Policy (`script-src 'self'`) restricts script injection

**Remediation:**
1. **Use HTTP-only cookies instead (if backend refactored):**
```typescript
// Backend returns token in HTTP-only cookie
// Frontend doesn't need to manage token storage
// Automatically sent with requests via withCredentials: true
```

2. **Use memory-only storage (current best practice):**
```typescript
let token: string | null = null;  // In-memory, cleared on page reload

export function setToken(newToken: string) {
    token = newToken;
    sessionStorage.setItem('token', newToken);  // Backup to sessionStorage
}

export function getToken(): string | null {
    return token || sessionStorage.getItem('token');
}
```

3. **Implement token refresh on tab focus:**
```typescript
window.addEventListener('focus', async () => {
    // Refresh token periodically even if user is inactive
    if (shouldRefreshToken()) {
        await refreshToken();
    }
});
```

**Effort:** MEDIUM (requires architectural change)  
**Priority:** LOW (XSS mitigations already in place; low practical risk)

---

## OWASP Top 10 Mapping

| OWASP Top 10 | Finding | Status |
|---|---|---|
| A01:2021 Broken Access Control | Session IP validation missing | MEDIUM |
| A02:2021 Cryptographic Failures | Database key stored on disk plaintext | MEDIUM |
| A03:2021 Injection | Rate limit bypass via X-Forwarded-For | MEDIUM |
| A04:2021 Insecure Design | Scan results in-memory without cleanup | LOW |
| A05:2021 Security Misconfiguration | Production JWT secret placeholder | CRITICAL |
| A06:2021 Vulnerable Components | N/A - Dependencies scanned separately | PASS |
| A07:2021 Identification & Authentication | JWT expiration too long | MEDIUM |
| A08:2021 Software & Data Integrity | N/A | PASS |
| A09:2021 Logging & Monitoring | Sensitive errors in responses | MEDIUM |
| A10:2021 SSRF | N/A - No external API calls | PASS |

---

## APDP Compliance Status

**Benin Data Protection Law (Loi N°2017-20) Compliance:**

| Requirement | Status | Notes |
|---|---|---|
| Consent collection | PASS | ConsentModal shown before first scan |
| Consent logging | PASS | Audit logging implemented |
| Purpose limitation | PASS | Data used only for PII detection |
| Data minimization | PASS | Only processes files specified by user |
| Storage limitation | PASS | Results not persisted to database |
| Right to erasure | PASS | Cascading delete in UserController |
| Audit logging | PASS | All actions logged to audit trail |
| Data encryption | PASS | SQLCipher AES-256 + Report encryption |
| Access control | PASS | Role-based access (Admin/Operator) |
| Breach notification | PARTIAL | No automatic breach alerting system |

**Gaps:**
1. Add automated breach detection alerting
2. Implement data export feature (GDPR-style)
3. Document DPA/Privacy Impact Assessment

---

## Remediation Priority & Effort Matrix

| Priority | Finding | Effort | Timeline |
|----------|---------|--------|----------|
| CRITICAL | Production JWT secret validation | LOW | Immediate |
| HIGH | Rate limit bypass (X-Forwarded-For) | MEDIUM | Sprint 1 |
| HIGH | Database encryption key handling | MEDIUM | Sprint 1 |
| MEDIUM | Session IP validation | MEDIUM | Sprint 2 |
| MEDIUM | Sensitive error messages | MEDIUM | Sprint 2 |
| MEDIUM | JWT expiration in dev | LOW | Sprint 1 |
| MEDIUM | HTTP header injection prevention | LOW | Sprint 1 |
| LOW | Report password transmission | MEDIUM | Sprint 3 |
| LOW | Console output cleanup | LOW | Sprint 1 |
| LOW | In-memory result cleanup | MEDIUM | Sprint 3 |
| LOW | Frontend localStorage token | MEDIUM | Sprint 3 |

---

## Security Recommendations Summary

### Immediate Actions (Before Production)
1. **Change production JWT secret** from placeholder
2. **Add X-Forwarded-For proxy validation** using WhitelistedProxies
3. **Remove sensitive error details** from API responses (use error codes)
4. **Reduce JWT expiration** in development to 2 hours

### Short-term (Sprint 1-2)
1. **Implement session IP validation** with mismatch alerting
2. **Improve database encryption key handling** via configuration
3. **Add CRLF injection detection** in middleware
4. **Audit all console.WriteLine() calls** and replace with ILogger

### Medium-term (Sprint 3)
1. **Implement automatic scan result cleanup** (24-hour TTL)
2. **Add token refresh on page focus** for frontend security
3. **Encrypt report password before transmission** (if budget allows)
4. **Implement breach detection alerting** (APDP compliance)

### Infrastructure
1. Use reverse proxy with ForwardedHeaders middleware
2. Configure trusted proxy IP whitelist
3. Monitor JWT usage patterns for suspicious activity
4. Regular security scanning (dependency updates, SAST)

---

## Testing Recommendations

### Penetration Testing Checklist
- [ ] Attempt rate limit bypass with rotating `X-Forwarded-For` headers
- [ ] Test JWT token theft and reuse from different IPs
- [ ] Attempt SQL injection in file paths (should be blocked by PathValidator)
- [ ] Brute-force login endpoint (should be rate-limited)
- [ ] Attempt CSRF attacks (should be blocked by CSRF middleware)
- [ ] Check for XSS in file paths and PII results display
- [ ] Verify database encryption with proper key protection
- [ ] Test right-to-erasure API for complete data deletion
- [ ] Check audit log completeness for all sensitive operations

### Automated Testing
```bash
# SAST (Static Analysis)
dotnet format --verify-no-changes
dotnet clean
dotnet build

# DAST (Dynamic Analysis)
zaproxy start -config api.disablekey=true
zaproxy spider https://localhost:5001
zaproxy scan -url https://localhost:5001

# Dependency scanning
dotnet list package --vulnerable
npm audit
```

---

## Conclusion

The PII Scanner application demonstrates **solid foundational security practices** with well-implemented encryption, access control, and audit logging. However, **4 medium-severity findings** related to authentication, rate limiting, and configuration management should be addressed before production deployment.

**Estimated remediation effort:** 3-4 sprints (2-3 weeks for critical fixes, full remediation within 1 month)

**Overall assessment:** MEDIUM security posture suitable for internal/departmental use with mitigations; ready for production with completion of remediation items marked CRITICAL and HIGH.

---

**Audit Completed By:** Claude Code Security Analyzer  
**Audit Date:** April 24, 2026  
**Next Review:** After major releases or when significant architectural changes are made
