using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using PiiScanner.Api.Data;
using PiiScanner.Api.Models;

namespace PiiScanner.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize(Roles = Roles.Admin)]
public class AuditController : ControllerBase
{
    private readonly AppDbContext _db;

    public AuditController(AppDbContext db)
    {
        _db = db;
    }

    /// <summary>
    /// Récupérer les logs d'audit avec pagination et filtres
    /// </summary>
    [HttpGet]
    public async Task<ActionResult<PagedResult<AuditLogDto>>> GetAuditLogs(
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 50,
        [FromQuery] string? action = null,
        [FromQuery] int? userId = null,
        [FromQuery] string? entityType = null,
        [FromQuery] DateTime? startDate = null,
        [FromQuery] DateTime? endDate = null,
        [FromQuery] string? search = null)
    {
        if (page < 1) page = 1;
        if (pageSize < 1 || pageSize > 200) pageSize = 50;

        var query = _db.AuditLogs.AsQueryable();

        // Appliquer les filtres
        if (!string.IsNullOrWhiteSpace(action))
        {
            query = query.Where(a => a.Action == action);
        }

        if (userId.HasValue)
        {
            query = query.Where(a => a.UserId == userId.Value);
        }

        if (!string.IsNullOrWhiteSpace(entityType))
        {
            query = query.Where(a => a.EntityType == entityType);
        }

        if (startDate.HasValue)
        {
            query = query.Where(a => a.CreatedAt >= startDate.Value);
        }

        if (endDate.HasValue)
        {
            var endOfDay = endDate.Value.Date.AddDays(1).AddTicks(-1);
            query = query.Where(a => a.CreatedAt <= endOfDay);
        }

        // Recherche textuelle
        if (!string.IsNullOrWhiteSpace(search))
        {
            query = query.Where(a =>
                a.Details!.Contains(search) ||
                a.EntityId.Contains(search) ||
                a.IpAddress.Contains(search));
        }

        var totalCount = await query.CountAsync();

        var logs = await query
            .OrderByDescending(a => a.CreatedAt)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .Select(a => new AuditLogDto
            {
                Id = a.Id,
                UserId = a.UserId,
                Username = a.UserId.HasValue
                    ? _db.Users.Where(u => u.Id == a.UserId.Value).Select(u => u.Username).FirstOrDefault()
                    : null,
                Action = a.Action,
                EntityType = a.EntityType,
                EntityId = a.EntityId,
                IpAddress = a.IpAddress,
                CreatedAt = a.CreatedAt,
                Details = a.Details
            })
            .ToListAsync();

        return Ok(new PagedResult<AuditLogDto>
        {
            Items = logs,
            TotalCount = totalCount,
            Page = page,
            PageSize = pageSize,
            TotalPages = (int)Math.Ceiling(totalCount / (double)pageSize)
        });
    }

    /// <summary>
    /// Récupérer un log d'audit par ID
    /// </summary>
    [HttpGet("{id}")]
    public async Task<ActionResult<AuditLogDto>> GetAuditLog(int id)
    {
        var log = await _db.AuditLogs
            .Where(a => a.Id == id)
            .Select(a => new AuditLogDto
            {
                Id = a.Id,
                UserId = a.UserId,
                Username = a.UserId.HasValue
                    ? _db.Users.Where(u => u.Id == a.UserId.Value).Select(u => u.Username).FirstOrDefault()
                    : null,
                Action = a.Action,
                EntityType = a.EntityType,
                EntityId = a.EntityId,
                IpAddress = a.IpAddress,
                CreatedAt = a.CreatedAt,
                Details = a.Details
            })
            .FirstOrDefaultAsync();

        if (log == null)
        {
            return NotFound(new { error = "Log d'audit introuvable" });
        }

        return Ok(log);
    }

    /// <summary>
    /// Obtenir les statistiques des logs d'audit
    /// </summary>
    [HttpGet("stats")]
    public async Task<ActionResult<AuditStats>> GetStats(
        [FromQuery] DateTime? startDate = null,
        [FromQuery] DateTime? endDate = null)
    {
        var query = _db.AuditLogs.AsQueryable();

        if (startDate.HasValue)
        {
            query = query.Where(a => a.CreatedAt >= startDate.Value);
        }

        if (endDate.HasValue)
        {
            var endOfDay = endDate.Value.Date.AddDays(1).AddTicks(-1);
            query = query.Where(a => a.CreatedAt <= endOfDay);
        }

        var totalLogs = await query.CountAsync();
        var actionCounts = await query
            .GroupBy(a => a.Action)
            .Select(g => new ActionCount { Action = g.Key, Count = g.Count() })
            .OrderByDescending(ac => ac.Count)
            .ToListAsync();

        var entityTypeCounts = await query
            .GroupBy(a => a.EntityType)
            .Select(g => new EntityTypeCount { EntityType = g.Key, Count = g.Count() })
            .OrderByDescending(etc => etc.Count)
            .ToListAsync();

        var userActivityCounts = await query
            .Where(a => a.UserId.HasValue)
            .GroupBy(a => a.UserId)
            .Select(g => new UserActivityCount
            {
                UserId = g.Key!.Value,
                Username = _db.Users.Where(u => u.Id == g.Key!.Value).Select(u => u.Username).FirstOrDefault() ?? "Unknown",
                Count = g.Count()
            })
            .OrderByDescending(uac => uac.Count)
            .Take(10)
            .ToListAsync();

        // Activité par jour (30 derniers jours)
        var thirtyDaysAgo = DateTime.UtcNow.AddDays(-30);
        var dailyActivity = await query
            .Where(a => a.CreatedAt >= thirtyDaysAgo)
            .GroupBy(a => a.CreatedAt.Date)
            .Select(g => new DailyActivity
            {
                Date = g.Key,
                Count = g.Count()
            })
            .OrderBy(da => da.Date)
            .ToListAsync();

        return Ok(new AuditStats
        {
            TotalLogs = totalLogs,
            ActionCounts = actionCounts,
            EntityTypeCounts = entityTypeCounts,
            UserActivityCounts = userActivityCounts,
            DailyActivity = dailyActivity
        });
    }

    /// <summary>
    /// Obtenir la liste des actions uniques
    /// </summary>
    [HttpGet("actions")]
    public async Task<ActionResult<List<string>>> GetActions()
    {
        var actions = await _db.AuditLogs
            .Select(a => a.Action)
            .Distinct()
            .OrderBy(a => a)
            .ToListAsync();

        return Ok(actions);
    }

    /// <summary>
    /// Obtenir la liste des types d'entité uniques
    /// </summary>
    [HttpGet("entity-types")]
    public async Task<ActionResult<List<string>>> GetEntityTypes()
    {
        var entityTypes = await _db.AuditLogs
            .Select(a => a.EntityType)
            .Distinct()
            .OrderBy(et => et)
            .ToListAsync();

        return Ok(entityTypes);
    }

    /// <summary>
    /// Exporter les logs d'audit en CSV
    /// </summary>
    [HttpGet("export/csv")]
    public async Task<IActionResult> ExportCsv(
        [FromQuery] string? action = null,
        [FromQuery] int? userId = null,
        [FromQuery] string? entityType = null,
        [FromQuery] DateTime? startDate = null,
        [FromQuery] DateTime? endDate = null)
    {
        var query = _db.AuditLogs.AsQueryable();

        // Appliquer les mêmes filtres
        if (!string.IsNullOrWhiteSpace(action))
            query = query.Where(a => a.Action == action);
        if (userId.HasValue)
            query = query.Where(a => a.UserId == userId.Value);
        if (!string.IsNullOrWhiteSpace(entityType))
            query = query.Where(a => a.EntityType == entityType);
        if (startDate.HasValue)
            query = query.Where(a => a.CreatedAt >= startDate.Value);
        if (endDate.HasValue)
        {
            var endOfDay = endDate.Value.Date.AddDays(1).AddTicks(-1);
            query = query.Where(a => a.CreatedAt <= endOfDay);
        }

        var logs = await query
            .OrderByDescending(a => a.CreatedAt)
            .ToListAsync();

        // Créer le CSV
        var csv = new System.Text.StringBuilder();
        csv.AppendLine("ID;UserId;Username;Action;EntityType;EntityId;IpAddress;CreatedAt;Details");

        foreach (var log in logs)
        {
            var username = log.UserId.HasValue
                ? await _db.Users.Where(u => u.Id == log.UserId.Value).Select(u => u.Username).FirstOrDefaultAsync()
                : "";

            csv.AppendLine($"{log.Id};{log.UserId};{username};{log.Action};{log.EntityType};{log.EntityId};{log.IpAddress};{log.CreatedAt:yyyy-MM-dd HH:mm:ss};{log.Details?.Replace(";", ",")}");
        }

        var bytes = System.Text.Encoding.UTF8.GetBytes(csv.ToString());
        var fileName = $"audit_logs_{DateTime.Now:yyyyMMdd_HHmmss}.csv";

        return File(bytes, "text/csv", fileName);
    }

    /// <summary>
    /// Nettoyer les anciens logs selon la politique de rétention
    /// </summary>
    [HttpDelete("cleanup")]
    public async Task<IActionResult> Cleanup()
    {
        var settings = await _db.AppSettings.FirstOrDefaultAsync();
        if (settings == null)
        {
            return BadRequest(new { error = "Paramètres introuvables" });
        }

        var cutoffDate = DateTime.UtcNow.AddDays(-settings.AuditLogRetentionDays);
        var logsToDelete = await _db.AuditLogs
            .Where(a => a.CreatedAt < cutoffDate)
            .ToListAsync();

        if (logsToDelete.Count == 0)
        {
            return Ok(new { message = "Aucun log à supprimer", deletedCount = 0 });
        }

        _db.AuditLogs.RemoveRange(logsToDelete);
        await _db.SaveChangesAsync();

        // Log l'action de nettoyage
        var currentUserId = int.Parse(User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value ?? "0");
        await _db.AuditLogs.AddAsync(new AuditLog
        {
            UserId = currentUserId,
            Action = "CleanupAuditLogs",
            EntityType = "AuditLog",
            EntityId = logsToDelete.Count.ToString(),
            IpAddress = HttpContext.Connection.RemoteIpAddress?.ToString() ?? "unknown",
            Details = $"Supprimé {logsToDelete.Count} logs antérieurs au {cutoffDate:yyyy-MM-dd}"
        });
        await _db.SaveChangesAsync();

        return Ok(new { message = $"Nettoyage effectué avec succès", deletedCount = logsToDelete.Count });
    }
}

// DTOs
public class AuditLogDto
{
    public int Id { get; set; }
    public int? UserId { get; set; }
    public string? Username { get; set; }
    public string Action { get; set; } = string.Empty;
    public string EntityType { get; set; } = string.Empty;
    public string EntityId { get; set; } = string.Empty;
    public string IpAddress { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; }
    public string? Details { get; set; }
}

public class PagedResult<T>
{
    public List<T> Items { get; set; } = new();
    public int TotalCount { get; set; }
    public int Page { get; set; }
    public int PageSize { get; set; }
    public int TotalPages { get; set; }
}

public class AuditStats
{
    public int TotalLogs { get; set; }
    public List<ActionCount> ActionCounts { get; set; } = new();
    public List<EntityTypeCount> EntityTypeCounts { get; set; } = new();
    public List<UserActivityCount> UserActivityCounts { get; set; } = new();
    public List<DailyActivity> DailyActivity { get; set; } = new();
}

public class ActionCount
{
    public string Action { get; set; } = string.Empty;
    public int Count { get; set; }
}

public class EntityTypeCount
{
    public string EntityType { get; set; } = string.Empty;
    public int Count { get; set; }
}

public class UserActivityCount
{
    public int UserId { get; set; }
    public string Username { get; set; } = string.Empty;
    public int Count { get; set; }
}

public class DailyActivity
{
    public DateTime Date { get; set; }
    public int Count { get; set; }
}
