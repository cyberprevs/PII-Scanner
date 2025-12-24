using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using PiiScanner.Api.Data;
using PiiScanner.Api.Models;
using PiiScanner.Api.Utils;
using System.IO;

namespace PiiScanner.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize(Roles = Roles.Admin)]
public class DatabaseController : ControllerBase
{
    private readonly AppDbContext _db;
    private readonly ILogger<DatabaseController> _logger;
    private readonly IConfiguration _configuration;

    public DatabaseController(AppDbContext db, ILogger<DatabaseController> logger, IConfiguration configuration)
    {
        _db = db;
        _logger = logger;
        _configuration = configuration;
    }

    /// <summary>
    /// Obtenir les statistiques de la base de données
    /// </summary>
    [HttpGet("stats")]
    public async Task<ActionResult> GetDatabaseStats()
    {
        try
        {
            var dbPath = GetDatabasePath();
            var dbFileInfo = new FileInfo(dbPath);

            var stats = new
            {
                DatabaseSize = dbFileInfo.Exists ? dbFileInfo.Length : 0,
                DatabaseSizeMB = dbFileInfo.Exists ? Math.Round(dbFileInfo.Length / 1024.0 / 1024.0, 2) : 0,
                TotalUsers = await _db.Users.CountAsync(),
                ActiveUsers = await _db.Users.CountAsync(u => u.IsActive),
                TotalScans = await _db.Scans.CountAsync(),
                CompletedScans = await _db.Scans.CountAsync(s => s.Status == "Completed"),
                TotalAuditLogs = await _db.AuditLogs.CountAsync(),
                TotalSessions = await _db.Sessions.CountAsync(),
                ActiveSessions = await _db.Sessions.CountAsync(s => !s.IsRevoked && s.ExpiresAt > DateTime.UtcNow),
                OldestScan = await _db.Scans.OrderBy(s => s.CreatedAt).Select(s => s.CreatedAt).FirstOrDefaultAsync(),
                NewestScan = await _db.Scans.OrderByDescending(s => s.CreatedAt).Select(s => s.CreatedAt).FirstOrDefaultAsync(),
                DatabasePath = dbPath
            };

            return Ok(stats);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting database stats");
            return StatusCode(500, new { error = "Erreur lors de la récupération des statistiques" });
        }
    }

    /// <summary>
    /// Obtenir les paramètres de l'application
    /// </summary>
    [HttpGet("settings")]
    public async Task<ActionResult<AppSettings>> GetSettings()
    {
        var settings = await _db.AppSettings.FirstOrDefaultAsync();
        if (settings == null)
        {
            // Créer les paramètres par défaut s'ils n'existent pas
            settings = new AppSettings
            {
                DataRetentionDays = 90,
                AuditLogRetentionDays = 365,
                SessionRetentionDays = 7,
                AutoBackupEnabled = false,
                AutoBackupIntervalHours = 24
            };
            _db.AppSettings.Add(settings);
            await _db.SaveChangesAsync();
        }
        return Ok(settings);
    }

    /// <summary>
    /// Mettre à jour les paramètres de l'application
    /// </summary>
    [HttpPut("settings")]
    public async Task<ActionResult<AppSettings>> UpdateSettings([FromBody] UpdateSettingsRequest request)
    {
        var settings = await _db.AppSettings.FirstOrDefaultAsync();
        if (settings == null)
        {
            return NotFound(new { error = "Paramètres non trouvés" });
        }

        settings.DataRetentionDays = request.DataRetentionDays;
        settings.AuditLogRetentionDays = request.AuditLogRetentionDays;
        settings.SessionRetentionDays = request.SessionRetentionDays;
        settings.AutoBackupEnabled = request.AutoBackupEnabled;
        settings.AutoBackupIntervalHours = request.AutoBackupIntervalHours;
        settings.UpdatedAt = DateTime.UtcNow;
        settings.UpdatedBy = int.Parse(User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value ?? "0");

        await _db.SaveChangesAsync();

        // Log audit
        var userId = int.Parse(User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value ?? "0");
        await _db.AuditLogs.AddAsync(new AuditLog
        {
            UserId = userId,
            Action = "UpdateDatabaseSettings",
            EntityType = "AppSettings",
            EntityId = settings.Id.ToString(),
            IpAddress = HttpContext.Connection.RemoteIpAddress?.ToString() ?? "unknown",
            Details = "Paramètres de la base de données mis à jour"
        });
        await _db.SaveChangesAsync();

        return Ok(settings);
    }

    /// <summary>
    /// Nettoyer les anciennes données selon la politique de rétention
    /// </summary>
    [HttpPost("cleanup")]
    public async Task<ActionResult> CleanupOldData()
    {
        try
        {
            var settings = await _db.AppSettings.FirstOrDefaultAsync();
            if (settings == null)
            {
                return BadRequest(new { error = "Paramètres non trouvés" });
            }

            var now = DateTime.UtcNow;

            // Supprimer les anciens scans
            var scanCutoff = now.AddDays(-settings.DataRetentionDays);
            var oldScans = await _db.Scans.Where(s => s.CreatedAt < scanCutoff).ToListAsync();
            _db.Scans.RemoveRange(oldScans);
            var scansDeleted = oldScans.Count;

            // Supprimer les anciens logs d'audit
            var auditCutoff = now.AddDays(-settings.AuditLogRetentionDays);
            var oldLogs = await _db.AuditLogs.Where(a => a.CreatedAt < auditCutoff).ToListAsync();
            _db.AuditLogs.RemoveRange(oldLogs);
            var logsDeleted = oldLogs.Count;

            // Supprimer les sessions expirées ou anciennes
            var sessionCutoff = now.AddDays(-settings.SessionRetentionDays);
            var oldSessions = await _db.Sessions
                .Where(s => s.ExpiresAt < now || s.CreatedAt < sessionCutoff || s.IsRevoked)
                .ToListAsync();
            _db.Sessions.RemoveRange(oldSessions);
            var sessionsDeleted = oldSessions.Count;

            await _db.SaveChangesAsync();

            var deletedCounts = new
            {
                Scans = scansDeleted,
                AuditLogs = logsDeleted,
                Sessions = sessionsDeleted
            };

            // Log audit
            var userId = int.Parse(User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value ?? "0");
            await _db.AuditLogs.AddAsync(new AuditLog
            {
                UserId = userId,
                Action = "CleanupDatabase",
                EntityType = "Database",
                EntityId = "cleanup",
                IpAddress = HttpContext.Connection.RemoteIpAddress?.ToString() ?? "unknown",
                Details = $"Nettoyage: {deletedCounts.Scans} scans, {deletedCounts.AuditLogs} logs, {deletedCounts.Sessions} sessions"
            });
            await _db.SaveChangesAsync();

            _logger.LogInformation("Database cleanup completed: {Counts}", deletedCounts);

            return Ok(new
            {
                message = "Nettoyage effectué avec succès",
                deleted = deletedCounts
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error during database cleanup");
            return StatusCode(500, new { error = "Erreur lors du nettoyage de la base de données" });
        }
    }

    /// <summary>
    /// Optimiser la base de données (VACUUM pour SQLite)
    /// </summary>
    [HttpPost("optimize")]
    public async Task<ActionResult> OptimizeDatabase()
    {
        try
        {
            // Exécuter VACUUM pour SQLite
            await _db.Database.ExecuteSqlRawAsync("VACUUM;");

            // Log audit
            var userId = int.Parse(User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value ?? "0");
            await _db.AuditLogs.AddAsync(new AuditLog
            {
                UserId = userId,
                Action = "OptimizeDatabase",
                EntityType = "Database",
                EntityId = "optimize",
                IpAddress = HttpContext.Connection.RemoteIpAddress?.ToString() ?? "unknown",
                Details = "Optimisation de la base de données (VACUUM)"
            });
            await _db.SaveChangesAsync();

            _logger.LogInformation("Database optimized successfully");

            return Ok(new { message = "Base de données optimisée avec succès" });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error optimizing database");
            return StatusCode(500, new { error = "Erreur lors de l'optimisation de la base de données" });
        }
    }

    /// <summary>
    /// Créer une sauvegarde de la base de données
    /// </summary>
    [HttpPost("backup")]
    public async Task<ActionResult> CreateBackup()
    {
        try
        {
            var dbPath = GetDatabasePath();
            var backupDir = Path.Combine(Path.GetDirectoryName(dbPath) ?? "", "backups");
            Directory.CreateDirectory(backupDir);

            var timestamp = DateTime.Now.ToString("yyyyMMdd_HHmmss");
            var backupFileName = $"piiscanner_backup_{timestamp}.db";
            var backupPath = Path.Combine(backupDir, backupFileName);

            // Copier le fichier de base de données
            System.IO.File.Copy(dbPath, backupPath, true);

            // Mettre à jour la date de dernière sauvegarde
            var settings = await _db.AppSettings.FirstOrDefaultAsync();
            if (settings != null)
            {
                settings.LastAutoBackup = DateTime.UtcNow;
                await _db.SaveChangesAsync();
            }

            // Log audit
            var userId = int.Parse(User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value ?? "0");
            await _db.AuditLogs.AddAsync(new AuditLog
            {
                UserId = userId,
                Action = "CreateBackup",
                EntityType = "Database",
                EntityId = "backup",
                IpAddress = HttpContext.Connection.RemoteIpAddress?.ToString() ?? "unknown",
                Details = $"Sauvegarde créée: {backupFileName}"
            });
            await _db.SaveChangesAsync();

            _logger.LogInformation("Database backup created: {BackupPath}", backupPath);

            return Ok(new
            {
                message = "Sauvegarde créée avec succès",
                backupFile = backupFileName,
                backupPath = backupPath,
                size = new FileInfo(backupPath).Length
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error creating database backup");
            return StatusCode(500, new { error = "Erreur lors de la création de la sauvegarde" });
        }
    }

    /// <summary>
    /// Lister les sauvegardes disponibles
    /// </summary>
    [HttpGet("backups")]
    public ActionResult GetBackups()
    {
        try
        {
            var dbPath = GetDatabasePath();
            var backupDir = Path.Combine(Path.GetDirectoryName(dbPath) ?? "", "backups");

            if (!Directory.Exists(backupDir))
            {
                return Ok(new List<object>());
            }

            var backups = Directory.GetFiles(backupDir, "*.db")
                .Select(f => new FileInfo(f))
                .OrderByDescending(f => f.CreationTime)
                .Select(f => new
                {
                    fileName = f.Name,
                    size = f.Length,
                    sizeMB = Math.Round(f.Length / 1024.0 / 1024.0, 2),
                    createdAt = f.CreationTime,
                    fullPath = f.FullName
                })
                .ToList();

            return Ok(backups);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error listing backups");
            return StatusCode(500, new { error = "Erreur lors de la récupération des sauvegardes" });
        }
    }

    /// <summary>
    /// Télécharger une sauvegarde
    /// </summary>
    [HttpGet("backup/download/{fileName}")]
    public ActionResult DownloadBackup(string fileName)
    {
        try
        {
            // SÉCURITÉ: Valider le nom de fichier pour prévenir les attaques de type Path Traversal
            if (!PathValidator.ValidateFileName(fileName, out var validationError))
            {
                _logger.LogWarning("Tentative de téléchargement avec un nom de fichier invalide: {FileName} - Erreur: {Error}",
                    fileName, validationError);
                return BadRequest(new { error = $"Nom de fichier invalide: {validationError}" });
            }

            var dbPath = GetDatabasePath();
            var backupDir = Path.Combine(Path.GetDirectoryName(dbPath) ?? "", "backups");
            var backupPath = Path.GetFullPath(Path.Combine(backupDir, fileName));

            // SÉCURITÉ: Vérifier que le fichier est bien dans le répertoire de sauvegarde
            if (!PathValidator.ValidateFileInDirectory(backupPath, backupDir, out validationError))
            {
                _logger.LogWarning("Tentative d'accès à un fichier hors du répertoire de sauvegarde: {Path}",
                    backupPath);
                return BadRequest(new { error = "Accès non autorisé au fichier" });
            }

            if (!System.IO.File.Exists(backupPath))
            {
                return NotFound(new { error = "Sauvegarde non trouvée" });
            }

            var bytes = System.IO.File.ReadAllBytes(backupPath);
            return File(bytes, "application/octet-stream", fileName);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error downloading backup");
            return StatusCode(500, new { error = "Erreur lors du téléchargement de la sauvegarde" });
        }
    }

    /// <summary>
    /// Supprimer une sauvegarde
    /// </summary>
    [HttpDelete("backup/{fileName}")]
    public async Task<ActionResult> DeleteBackup(string fileName)
    {
        try
        {
            // SÉCURITÉ: Valider le nom de fichier pour prévenir les attaques de type Path Traversal
            if (!PathValidator.ValidateFileName(fileName, out var validationError))
            {
                _logger.LogWarning("Tentative de suppression avec un nom de fichier invalide: {FileName} - Erreur: {Error}",
                    fileName, validationError);
                return BadRequest(new { error = $"Nom de fichier invalide: {validationError}" });
            }

            var dbPath = GetDatabasePath();
            var backupDir = Path.Combine(Path.GetDirectoryName(dbPath) ?? "", "backups");
            var backupPath = Path.GetFullPath(Path.Combine(backupDir, fileName));

            // SÉCURITÉ: Vérifier que le fichier est bien dans le répertoire de sauvegarde
            if (!PathValidator.ValidateFileInDirectory(backupPath, backupDir, out validationError))
            {
                _logger.LogWarning("Tentative de suppression d'un fichier hors du répertoire de sauvegarde: {Path}",
                    backupPath);
                return BadRequest(new { error = "Accès non autorisé au fichier" });
            }

            _logger.LogInformation("Attempting to delete backup: {BackupPath}", backupPath);

            if (!System.IO.File.Exists(backupPath))
            {
                _logger.LogWarning("Backup file not found: {BackupPath}", backupPath);
                return NotFound(new { error = "Sauvegarde non trouvée" });
            }

            System.IO.File.Delete(backupPath);

            // Log audit
            var userId = int.Parse(User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value ?? "0");
            await _db.AuditLogs.AddAsync(new AuditLog
            {
                UserId = userId,
                Action = "DeleteBackup",
                EntityType = "Database",
                EntityId = "backup",
                IpAddress = HttpContext.Connection.RemoteIpAddress?.ToString() ?? "unknown",
                Details = $"Sauvegarde supprimée: {fileName}"
            });
            await _db.SaveChangesAsync();

            _logger.LogInformation("Database backup deleted: {FileName} by user {UserId}", fileName, userId);

            return Ok(new { message = "Sauvegarde supprimée avec succès" });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error deleting backup");
            return StatusCode(500, new { error = "Erreur lors de la suppression de la sauvegarde" });
        }
    }

    /// <summary>
    /// RESET COMPLET de la base de données (DANGEREUX!)
    /// Supprime TOUTES les données sauf le compte admin par défaut
    /// </summary>
    [HttpPost("reset")]
    public async Task<ActionResult> ResetDatabase([FromBody] ResetDatabaseRequest request)
    {
        try
        {
            // Vérification de sécurité : mot de passe requis
            var userId = int.Parse(User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value ?? "0");
            var user = await _db.Users.FindAsync(userId);

            if (user == null || !BCrypt.Net.BCrypt.Verify(request.AdminPassword, user.PasswordHash))
            {
                return BadRequest(new { error = "Mot de passe administrateur incorrect" });
            }

            // Créer une sauvegarde avant le reset
            var dbPath = GetDatabasePath();
            var backupDir = Path.Combine(Path.GetDirectoryName(dbPath) ?? "", "backups");
            Directory.CreateDirectory(backupDir);
            var timestamp = DateTime.Now.ToString("yyyyMMdd_HHmmss");
            var backupFileName = $"piiscanner_BEFORE_RESET_{timestamp}.db";
            var backupPath = Path.Combine(backupDir, backupFileName);
            System.IO.File.Copy(dbPath, backupPath, true);

            // Supprimer TOUTES les données et compter
            var scans = await _db.Scans.ToListAsync();
            var auditLogs = await _db.AuditLogs.ToListAsync();
            var sessions = await _db.Sessions.ToListAsync();

            _db.Scans.RemoveRange(scans);
            _db.AuditLogs.RemoveRange(auditLogs);
            _db.Sessions.RemoveRange(sessions);

            // Supprimer tous les utilisateurs SAUF l'utilisateur actuel qui fait le reset
            var usersToDelete = await _db.Users.Where(u => u.Id != userId).ToListAsync();
            _db.Users.RemoveRange(usersToDelete);

            // Réinitialiser les paramètres aux valeurs par défaut
            var settings = await _db.AppSettings.FirstOrDefaultAsync();
            if (settings != null)
            {
                settings.DataRetentionDays = 90;
                settings.AuditLogRetentionDays = 365;
                settings.SessionRetentionDays = 7;
                settings.AutoBackupEnabled = false;
                settings.AutoBackupIntervalHours = 24;
                settings.UpdatedAt = DateTime.UtcNow;
                settings.UpdatedBy = userId;
            }

            await _db.SaveChangesAsync();

            // Log audit dans une nouvelle entrée
            await _db.AuditLogs.AddAsync(new AuditLog
            {
                UserId = userId,
                Action = "ResetDatabase",
                EntityType = "Database",
                EntityId = "reset",
                IpAddress = HttpContext.Connection.RemoteIpAddress?.ToString() ?? "unknown",
                Details = $"RESET COMPLET de la base de données - Sauvegarde: {backupFileName}"
            });
            await _db.SaveChangesAsync();

            _logger.LogWarning("Database RESET completed by user {UserId}. Backup: {BackupFile}", userId, backupFileName);

            return Ok(new
            {
                message = "Base de données réinitialisée avec succès",
                backupFile = backupFileName,
                details = new
                {
                    scansDeleted = scans.Count,
                    auditLogsDeleted = auditLogs.Count,
                    sessionsDeleted = sessions.Count,
                    usersDeleted = usersToDelete.Count,
                    backupPath = backupPath
                }
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error during database reset");
            return StatusCode(500, new { error = "Erreur lors de la réinitialisation de la base de données" });
        }
    }

    private string GetDatabasePath()
    {
        var connectionString = _configuration.GetConnectionString("DefaultConnection");
        // Extraire le chemin du fichier de la chaîne de connexion SQLite
        var dataSourcePrefix = "Data Source=";
        var startIndex = connectionString?.IndexOf(dataSourcePrefix) ?? -1;
        if (startIndex >= 0)
        {
            var path = connectionString?.Substring(startIndex + dataSourcePrefix.Length).Split(';')[0];
            return Path.GetFullPath(path ?? "piiscanner.db");
        }
        return Path.GetFullPath("piiscanner.db");
    }
}

public class ResetDatabaseRequest
{
    public string AdminPassword { get; set; } = string.Empty;
}

public class UpdateSettingsRequest
{
    public int DataRetentionDays { get; set; }
    public int AuditLogRetentionDays { get; set; }
    public int SessionRetentionDays { get; set; }
    public bool AutoBackupEnabled { get; set; }
    public int AutoBackupIntervalHours { get; set; }
}
