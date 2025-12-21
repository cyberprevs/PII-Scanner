using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using PiiScanner.Api.Data;
using PiiScanner.Api.Models;
using PiiScanner.Api.Services;
using PiiScanner.Api.Utils;
using System.Security.Claims;

namespace PiiScanner.Api.Controllers;

[Authorize]
[ApiController]
[Route("api/[controller]")]
public class ScheduledScansController : ControllerBase
{
    private readonly AppDbContext _context;
    private readonly SchedulerService _schedulerService;
    private readonly ILogger<ScheduledScansController> _logger;

    public ScheduledScansController(
        AppDbContext context,
        SchedulerService schedulerService,
        ILogger<ScheduledScansController> logger)
    {
        _context = context;
        _schedulerService = schedulerService;
        _logger = logger;
    }

    /// <summary>
    /// Récupère tous les scans planifiés de l'utilisateur connecté
    /// </summary>
    [HttpGet]
    public async Task<ActionResult<IEnumerable<ScheduledScan>>> GetScheduledScans()
    {
        var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "0");
        var userRole = User.FindFirst(ClaimTypes.Role)?.Value;

        IQueryable<ScheduledScan> query = _context.ScheduledScans.Include(s => s.CreatedByUser);

        // Les admins voient tous les scans, les users seulement les leurs
        if (userRole != "Admin")
        {
            query = query.Where(s => s.CreatedBy == userId);
        }

        var scans = await query.OrderByDescending(s => s.CreatedAt).ToListAsync();
        return Ok(scans);
    }

    /// <summary>
    /// Récupère un scan planifié par ID
    /// </summary>
    [HttpGet("{id}")]
    public async Task<ActionResult<ScheduledScan>> GetScheduledScan(int id)
    {
        var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "0");
        var userRole = User.FindFirst(ClaimTypes.Role)?.Value;

        var scan = await _context.ScheduledScans
            .Include(s => s.CreatedByUser)
            .FirstOrDefaultAsync(s => s.Id == id);

        if (scan == null)
        {
            return NotFound(new { message = "Scan planifié introuvable" });
        }

        // Vérifier les permissions
        if (userRole != "Admin" && scan.CreatedBy != userId)
        {
            return Forbid();
        }

        return Ok(scan);
    }

    /// <summary>
    /// Crée un nouveau scan planifié
    /// </summary>
    [HttpPost]
    public async Task<ActionResult<ScheduledScan>> CreateScheduledScan([FromBody] CreateScheduledScanRequest request)
    {
        // Validation du chemin
        if (!PathValidator.ValidateDirectoryPath(request.DirectoryPath, out var errorMessage, mustExist: false))
        {
            return BadRequest(new { message = errorMessage });
        }

        // Vérifier que le répertoire existe
        if (!Directory.Exists(request.DirectoryPath))
        {
            return BadRequest(new { message = "Le répertoire spécifié n'existe pas" });
        }

        // Validation des paramètres de planification
        if (request.Frequency == ScanFrequency.Weekly && !request.DayOfWeek.HasValue)
        {
            return BadRequest(new { message = "Le jour de la semaine est requis pour une planification hebdomadaire" });
        }

        if ((request.Frequency == ScanFrequency.Monthly || request.Frequency == ScanFrequency.Quarterly)
            && !request.DayOfMonth.HasValue)
        {
            return BadRequest(new { message = "Le jour du mois est requis pour une planification mensuelle ou trimestrielle" });
        }

        if (request.DayOfWeek.HasValue && (request.DayOfWeek < 0 || request.DayOfWeek > 6))
        {
            return BadRequest(new { message = "Le jour de la semaine doit être entre 0 (Dimanche) et 6 (Samedi)" });
        }

        if (request.DayOfMonth.HasValue && (request.DayOfMonth < 1 || request.DayOfMonth > 28))
        {
            return BadRequest(new { message = "Le jour du mois doit être entre 1 et 28" });
        }

        if (request.HourOfDay < 0 || request.HourOfDay > 23)
        {
            return BadRequest(new { message = "L'heure doit être entre 0 et 23" });
        }

        var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "0");

        var scheduledScan = new ScheduledScan
        {
            Name = request.Name,
            DirectoryPath = request.DirectoryPath,
            CreatedBy = userId,
            Frequency = request.Frequency,
            DayOfWeek = request.DayOfWeek,
            DayOfMonth = request.DayOfMonth,
            HourOfDay = request.HourOfDay,
            IsActive = request.IsActive,
            NotifyOnCompletion = request.NotifyOnCompletion,
            NotifyOnNewPii = request.NotifyOnNewPii,
            CreatedAt = DateTime.UtcNow
        };

        // Calculer la prochaine exécution
        _schedulerService.InitializeNextRunAt(scheduledScan);

        _context.ScheduledScans.Add(scheduledScan);
        await _context.SaveChangesAsync();

        // Audit log
        await _context.AuditLogs.AddAsync(new AuditLog
        {
            UserId = userId,
            Action = "Create",
            EntityType = "ScheduledScan",
            EntityId = scheduledScan.Id.ToString(),
            IpAddress = Request.HttpContext.Connection.RemoteIpAddress?.ToString(),
            Details = $"Scan planifié créé: {scheduledScan.Name}",
            CreatedAt = DateTime.UtcNow
        });
        await _context.SaveChangesAsync();

        return CreatedAtAction(nameof(GetScheduledScan), new { id = scheduledScan.Id }, scheduledScan);
    }

    /// <summary>
    /// Met à jour un scan planifié
    /// </summary>
    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateScheduledScan(int id, [FromBody] UpdateScheduledScanRequest request)
    {
        var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "0");
        var userRole = User.FindFirst(ClaimTypes.Role)?.Value;

        var scan = await _context.ScheduledScans.FindAsync(id);
        if (scan == null)
        {
            return NotFound(new { message = "Scan planifié introuvable" });
        }

        // Vérifier les permissions
        if (userRole != "Admin" && scan.CreatedBy != userId)
        {
            return Forbid();
        }

        // Validation du chemin si modifié
        if (request.DirectoryPath != null && request.DirectoryPath != scan.DirectoryPath)
        {
            if (!PathValidator.ValidateDirectoryPath(request.DirectoryPath, out var pathError, mustExist: false))
            {
                return BadRequest(new { message = pathError });
            }

            if (!Directory.Exists(request.DirectoryPath))
            {
                return BadRequest(new { message = "Le répertoire spécifié n'existe pas" });
            }

            scan.DirectoryPath = request.DirectoryPath;
        }

        // Mettre à jour les champs
        if (request.Name != null) scan.Name = request.Name;
        if (request.Frequency.HasValue) scan.Frequency = request.Frequency.Value;
        if (request.DayOfWeek.HasValue) scan.DayOfWeek = request.DayOfWeek;
        if (request.DayOfMonth.HasValue) scan.DayOfMonth = request.DayOfMonth;
        if (request.HourOfDay.HasValue) scan.HourOfDay = request.HourOfDay.Value;
        if (request.IsActive.HasValue) scan.IsActive = request.IsActive.Value;
        if (request.NotifyOnCompletion.HasValue) scan.NotifyOnCompletion = request.NotifyOnCompletion.Value;
        if (request.NotifyOnNewPii.HasValue) scan.NotifyOnNewPii = request.NotifyOnNewPii.Value;

        // Recalculer NextRunAt si les paramètres de planification ont changé
        if (request.Frequency.HasValue || request.DayOfWeek.HasValue ||
            request.DayOfMonth.HasValue || request.HourOfDay.HasValue)
        {
            _schedulerService.InitializeNextRunAt(scan);
        }

        await _context.SaveChangesAsync();

        // Audit log
        await _context.AuditLogs.AddAsync(new AuditLog
        {
            UserId = userId,
            Action = "Update",
            EntityType = "ScheduledScan",
            EntityId = scan.Id.ToString(),
            IpAddress = Request.HttpContext.Connection.RemoteIpAddress?.ToString(),
            Details = $"Scan planifié modifié: {scan.Name}",
            CreatedAt = DateTime.UtcNow
        });
        await _context.SaveChangesAsync();

        return Ok(scan);
    }

    /// <summary>
    /// Supprime un scan planifié
    /// </summary>
    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteScheduledScan(int id)
    {
        var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "0");
        var userRole = User.FindFirst(ClaimTypes.Role)?.Value;

        var scan = await _context.ScheduledScans.FindAsync(id);
        if (scan == null)
        {
            return NotFound(new { message = "Scan planifié introuvable" });
        }

        // Vérifier les permissions
        if (userRole != "Admin" && scan.CreatedBy != userId)
        {
            return Forbid();
        }

        var scanName = scan.Name;
        _context.ScheduledScans.Remove(scan);
        await _context.SaveChangesAsync();

        // Audit log
        await _context.AuditLogs.AddAsync(new AuditLog
        {
            UserId = userId,
            Action = "Delete",
            EntityType = "ScheduledScan",
            EntityId = id.ToString(),
            IpAddress = Request.HttpContext.Connection.RemoteIpAddress?.ToString(),
            Details = $"Scan planifié supprimé: {scanName}",
            CreatedAt = DateTime.UtcNow
        });
        await _context.SaveChangesAsync();

        return Ok(new { message = "Scan planifié supprimé avec succès" });
    }

    /// <summary>
    /// Active ou désactive un scan planifié
    /// </summary>
    [HttpPatch("{id}/toggle")]
    public async Task<IActionResult> ToggleScheduledScan(int id)
    {
        var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "0");
        var userRole = User.FindFirst(ClaimTypes.Role)?.Value;

        var scan = await _context.ScheduledScans.FindAsync(id);
        if (scan == null)
        {
            return NotFound(new { message = "Scan planifié introuvable" });
        }

        // Vérifier les permissions
        if (userRole != "Admin" && scan.CreatedBy != userId)
        {
            return Forbid();
        }

        scan.IsActive = !scan.IsActive;
        await _context.SaveChangesAsync();

        // Audit log
        await _context.AuditLogs.AddAsync(new AuditLog
        {
            UserId = userId,
            Action = "Update",
            EntityType = "ScheduledScan",
            EntityId = scan.Id.ToString(),
            IpAddress = Request.HttpContext.Connection.RemoteIpAddress?.ToString(),
            Details = $"Scan planifié {(scan.IsActive ? "activé" : "désactivé")}: {scan.Name}",
            CreatedAt = DateTime.UtcNow
        });
        await _context.SaveChangesAsync();

        return Ok(new { isActive = scan.IsActive, message = $"Scan {(scan.IsActive ? "activé" : "désactivé")} avec succès" });
    }
}

// DTOs
public class CreateScheduledScanRequest
{
    public string Name { get; set; } = string.Empty;
    public string DirectoryPath { get; set; } = string.Empty;
    public ScanFrequency Frequency { get; set; }
    public int? DayOfWeek { get; set; }
    public int? DayOfMonth { get; set; }
    public int HourOfDay { get; set; } = 2; // Par défaut 2h du matin
    public bool IsActive { get; set; } = true;
    public bool NotifyOnCompletion { get; set; } = true;
    public bool NotifyOnNewPii { get; set; } = true;
}

public class UpdateScheduledScanRequest
{
    public string? Name { get; set; }
    public string? DirectoryPath { get; set; }
    public ScanFrequency? Frequency { get; set; }
    public int? DayOfWeek { get; set; }
    public int? DayOfMonth { get; set; }
    public int? HourOfDay { get; set; }
    public bool? IsActive { get; set; }
    public bool? NotifyOnCompletion { get; set; }
    public bool? NotifyOnNewPii { get; set; }
}
