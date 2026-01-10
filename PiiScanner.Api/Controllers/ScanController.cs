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
    public ActionResult DownloadReport(string scanId, string format)
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

        return PhysicalFile(filePath, contentType, fileName);
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
}
