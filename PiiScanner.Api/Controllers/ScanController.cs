using Microsoft.AspNetCore.Mvc;
using PiiScanner.Api.DTOs;
using PiiScanner.Api.Services;

namespace PiiScanner.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ScanController : ControllerBase
{
    private readonly ScanService _scanService;
    private readonly ILogger<ScanController> _logger;

    public ScanController(ScanService scanService, ILogger<ScanController> logger)
    {
        _scanService = scanService;
        _logger = logger;
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

            if (!Directory.Exists(request.DirectoryPath))
            {
                return BadRequest(new ScanResponse
                {
                    ScanId = string.Empty,
                    Status = "error",
                    Message = "Le dossier spécifié n'existe pas"
                });
            }

            var scanId = _scanService.StartScan(request);

            _logger.LogInformation("Scan démarré: {ScanId} pour le dossier {Path}", scanId, request.DirectoryPath);

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
    /// Nettoyer les ressources d'un scan
    /// </summary>
    [HttpDelete("{scanId}")]
    public ActionResult CleanupScan(string scanId)
    {
        _scanService.CleanupScan(scanId);
        return NoContent();
    }
}
