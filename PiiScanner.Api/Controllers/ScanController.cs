using System.Security.Cryptography;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using PiiScanner.Api.Data;
using PiiScanner.Api.DTOs;
using PiiScanner.Api.Models;
using PiiScanner.Api.Services;
using PiiScanner.Api.Utils;

namespace PiiScanner.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize] // Protéger tous les endpoints du scan
public class ScanController : ControllerBase
{
    private readonly ScanService _scanService;
    private readonly ILogger<ScanController> _logger;
    private readonly AppDbContext _db;

    public ScanController(ScanService scanService, ILogger<ScanController> logger, AppDbContext db)
    {
        _scanService = scanService;
        _logger = logger;
        _db = db;
    }

    /// <summary>
    /// Démarrer un nouveau scan
    /// </summary>
    [HttpPost("start")]
    public ActionResult<ScanResponse> StartScan([FromBody] ScanRequest request)
    {
        try
        {
            if (string.IsNullOrWhiteSpace(request.DirectoryPath))
            {
                return BadRequest(new ScanResponse
                {
                    ScanId = string.Empty,
                    Status = "error",
                    Message = "Le chemin du dossier est requis"
                });
            }

            // SÉCURITÉ: Valider le chemin pour prévenir les attaques de type Path Traversal
            if (!PathValidator.ValidateDirectoryPath(request.DirectoryPath, out var validationError, mustExist: true))
            {
                _logger.LogWarning("Tentative de scan avec un chemin invalide: {Path} - Erreur: {Error}",
                    request.DirectoryPath, validationError);

                return BadRequest(new ScanResponse
                {
                    ScanId = string.Empty,
                    Status = "error",
                    Message = $"Chemin de répertoire invalide: {validationError}"
                });
            }

            var scanId = _scanService.StartScan(request);

            // Enregistrer le scan dans la base de données
            var userId = int.Parse(User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value ?? "0");
            _db.Scans.Add(new ScanRecord
            {
                ScanId = scanId,
                UserId = userId,
                DirectoryPath = request.DirectoryPath,
                Status = "Running",
                CreatedAt = DateTime.UtcNow
            });
            _db.SaveChanges();

            _logger.LogInformation("Scan démarré: {ScanId} pour le dossier {Path} par utilisateur {UserId}", scanId, request.DirectoryPath, userId);

            return Ok(new ScanResponse
            {
                ScanId = scanId,
                Status = "started",
                Message = "Scan démarré avec succès"
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Erreur lors du démarrage du scan");
            return StatusCode(500, new ScanResponse
            {
                ScanId = string.Empty,
                Status = "error",
                Message = $"Erreur interne: {ex.Message}"
            });
        }
    }

    /// <summary>
    /// Obtenir la progression d'un scan
    /// </summary>
    [HttpGet("{scanId}/progress")]
    public ActionResult<ScanProgressResponse> GetProgress(string scanId)
    {
        var progress = _scanService.GetProgress(scanId);
        if (progress == null)
        {
            return NotFound(new { message = "Scan non trouvé" });
        }

        return Ok(progress);
    }

    /// <summary>
    /// Obtenir les résultats d'un scan complété
    /// </summary>
    [HttpGet("{scanId}/results")]
    public ActionResult<ScanResultResponse> GetResults(string scanId)
    {
        var results = _scanService.GetResults(scanId);
        if (results == null)
        {
            return NotFound(new { message = "Résultats non disponibles" });
        }

        return Ok(results);
    }

    /// <summary>
    /// Télécharger un rapport
    /// </summary>
    [HttpGet("{scanId}/report/{format}")]
    public async Task<ActionResult> DownloadReport(string scanId, string format)
    {
        var filePath = _scanService.GetReportPath(scanId, format);
        if (filePath == null)
        {
            return NotFound(new { message = "Rapport non trouvé" });
        }

        var contentType = format.ToLower() switch
        {
            "csv" => "text/csv",
            "json" => "application/json",
            "html" => "text/html",
            "excel" => "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            _ => "application/octet-stream"
        };

        var fileName = format.ToLower() switch
        {
            "csv" => "rapport_pii.csv",
            "json" => "rapport_pii.json",
            "html" => "rapport_pii.html",
            "excel" => "rapport_pii.xlsx",
            _ => "rapport"
        };

        var userId = int.Parse(User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value ?? "0");

        // Chiffrement AES-256-CBC du rapport avant envoi
        // Le mot de passe est généré aléatoirement et retourné une seule fois dans X-Report-Password
        var password = ReportEncryption.GenerateReportPassword();
        var encryptedBytes = ReportEncryption.EncryptFileAes(filePath, password);

        // Audit: tracer tous les téléchargements de rapports contenant des données PII
        await _db.AuditLogs.AddAsync(new AuditLog
        {
            UserId = userId,
            Action = "DownloadReport",
            EntityType = "Report",
            EntityId = scanId,
            IpAddress = HttpContext.Connection.RemoteIpAddress?.ToString() ?? "unknown",
            Details = $"Rapport chiffré téléchargé au format {format.ToUpper()} pour le scan {scanId}"
        });
        await _db.SaveChangesAsync();

        _logger.LogInformation("Rapport {Format} chiffré téléchargé pour le scan {ScanId} par l'utilisateur {UserId}", format, scanId, userId);

        // Exposer le mot de passe dans un header CORS-accessible (affiché une seule fois dans l'UI)
        Response.Headers.Append("X-Report-Password", password);
        Response.Headers.Append("Access-Control-Expose-Headers", "X-Report-Password");

        return File(encryptedBytes, "application/octet-stream", fileName + ".enc");
    }

    /// <summary>
    /// Obtenir l'historique des scans
    /// </summary>
    [HttpGet("history")]
    public async Task<ActionResult<IEnumerable<ScanHistoryDto>>> GetScanHistory()
    {
        var userId = int.Parse(User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value ?? "0");
        var isAdmin = User.IsInRole(Roles.Admin);

        IQueryable<ScanRecord> query = _db.Scans.Include(s => s.User);

        // Les opérateurs ne voient que leurs propres scans
        if (!isAdmin)
        {
            query = query.Where(s => s.UserId == userId);
        }

        var scans = await query
            .OrderByDescending(s => s.CreatedAt)
            .Select(s => new ScanHistoryDto
            {
                Id = s.Id,
                ScanId = s.ScanId,
                DirectoryPath = s.DirectoryPath,
                Status = s.Status,
                FilesScanned = s.FilesScanned,
                PiiDetected = s.PiiDetected,
                CreatedAt = s.CreatedAt,
                CompletedAt = s.CompletedAt,
                UserName = s.User != null ? s.User.FullName : "Unknown"
            })
            .ToListAsync();

        return Ok(scans);
    }

    /// <summary>
    /// Supprimer un scan de l'historique
    /// </summary>
    [HttpDelete("history/{scanId}")]
    public async Task<ActionResult> DeleteScanHistory(string scanId)
    {
        var userId = int.Parse(User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value ?? "0");
        var isAdmin = User.IsInRole(Roles.Admin);

        var scan = await _db.Scans.FirstOrDefaultAsync(s => s.ScanId == scanId);
        if (scan == null)
        {
            return NotFound(new { message = "Scan non trouvé" });
        }

        // Vérifier que l'utilisateur a le droit de supprimer ce scan
        if (!isAdmin && scan.UserId != userId)
        {
            return Forbid();
        }

        // Nettoyer les ressources du scan (fichiers temporaires, rapports, etc.)
        _scanService.CleanupScan(scanId);

        // Supprimer l'enregistrement de la base de données
        _db.Scans.Remove(scan);
        await _db.SaveChangesAsync();

        _logger.LogInformation("Scan {ScanId} supprimé par l'utilisateur {UserId}", scanId, userId);

        return NoContent();
    }

    /// <summary>
    /// Mettre à jour le statut d'un scan
    /// </summary>
    [HttpPut("{scanId}/status")]
    public async Task<ActionResult> UpdateScanStatus(string scanId, [FromBody] UpdateScanStatusDto dto)
    {
        var scan = await _db.Scans.FirstOrDefaultAsync(s => s.ScanId == scanId);
        if (scan == null)
        {
            return NotFound(new { message = "Scan non trouvé" });
        }

        scan.Status = dto.Status;
        scan.FilesScanned = dto.FilesScanned;
        scan.PiiDetected = dto.PiiDetected;

        if (dto.Status == "Completed" && scan.CompletedAt == null)
        {
            scan.CompletedAt = DateTime.UtcNow;
        }

        await _db.SaveChangesAsync();

        return NoContent();
    }

    /// <summary>
    /// Nettoyer les ressources d'un scan
    /// </summary>
    [HttpDelete("{scanId}")]
    public ActionResult CleanupScan(string scanId)
    {
        _scanService.CleanupScan(scanId);
        return NoContent();
    }

    /// <summary>
    /// Ouvre le dossier contenant un fichier dans l'explorateur Windows
    /// </summary>
    [HttpPost("open-folder")]
    public ActionResult OpenFolder([FromBody] OpenFolderRequest request)
    {
        if (string.IsNullOrWhiteSpace(request.FilePath))
            return BadRequest("Chemin de fichier requis.");

        if (!PathValidator.ValidateDirectoryPath(
                Path.GetDirectoryName(request.FilePath) ?? request.FilePath,
                out var error))
            return BadRequest(error);

        var folderPath = System.IO.File.Exists(request.FilePath)
            ? Path.GetDirectoryName(request.FilePath)!
            : request.FilePath;

        if (!Directory.Exists(folderPath))
            return NotFound("Dossier introuvable.");

        try
        {
            if (System.IO.File.Exists(request.FilePath))
                System.Diagnostics.Process.Start("explorer.exe", $"/select,\"{request.FilePath}\"");
            else
                System.Diagnostics.Process.Start("explorer.exe", $"\"{folderPath}\"");

            return Ok();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Erreur lors de l'ouverture du dossier {Path}", folderPath);
            return StatusCode(500, "Impossible d'ouvrir le dossier.");
        }
    }
}

public record OpenFolderRequest(string FilePath);

public static partial class ReportEncryption
{
    /// <summary>
    /// Génère un mot de passe aléatoire de 16 caractères (alphanumérique + symboles).
    /// </summary>
    public static string GenerateReportPassword()
    {
        const string chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789!@#$";
        var bytes = RandomNumberGenerator.GetBytes(16);
        return new string(bytes.Select(b => chars[b % chars.Length]).ToArray());
    }

    /// <summary>
    /// Chiffre un fichier avec AES-256-CBC.
    /// Format du fichier chiffré : [salt 16B][IV 16B][données chiffrées]
    /// Clé dérivée via PBKDF2-SHA256 (100 000 itérations).
    /// </summary>
    public static byte[] EncryptFileAes(string filePath, string password)
    {
        var plainBytes = File.ReadAllBytes(filePath);
        var salt = RandomNumberGenerator.GetBytes(16);

        using var deriveBytes = new Rfc2898DeriveBytes(password, salt, 100_000, HashAlgorithmName.SHA256);
        var key = deriveBytes.GetBytes(32); // AES-256
        var iv = deriveBytes.GetBytes(16);  // AES block size

        using var aes = Aes.Create();
        aes.Key = key;
        aes.IV = iv;
        aes.Mode = CipherMode.CBC;
        aes.Padding = PaddingMode.PKCS7;

        using var encryptor = aes.CreateEncryptor();
        var encrypted = encryptor.TransformFinalBlock(plainBytes, 0, plainBytes.Length);

        // Préfixer salt + IV pour permettre le déchiffrement ultérieur
        var result = new byte[salt.Length + iv.Length + encrypted.Length];
        Buffer.BlockCopy(salt, 0, result, 0, salt.Length);
        Buffer.BlockCopy(iv, 0, result, salt.Length, iv.Length);
        Buffer.BlockCopy(encrypted, 0, result, salt.Length + iv.Length, encrypted.Length);

        return result;
    }
}
