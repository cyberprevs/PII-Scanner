using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using PiiScanner.Api.Data;
using PiiScanner.Api.Models;

namespace PiiScanner.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class UserSettingsController : ControllerBase
{
    private readonly AppDbContext _db;
    private readonly ILogger<UserSettingsController> _logger;

    public UserSettingsController(AppDbContext db, ILogger<UserSettingsController> logger)
    {
        _db = db;
        _logger = logger;
    }

    /// <summary>
    /// Obtenir les paramètres de l'utilisateur connecté
    /// </summary>
    [HttpGet]
    public async Task<ActionResult<UserSettings>> GetSettings()
    {
        var userId = int.Parse(User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value ?? "0");

        var settings = await _db.UserSettings.FirstOrDefaultAsync(s => s.UserId == userId);

        if (settings == null)
        {
            // Créer des paramètres par défaut pour cet utilisateur
            settings = new UserSettings
            {
                UserId = userId,
                FileTypesJson = "{\"docx\":true,\"xlsx\":true,\"pdf\":true,\"txt\":true,\"csv\":true,\"log\":true,\"json\":true}",
                ExcludedFolders = "Windows, System32, Program Files, AppData",
                ExcludedExtensions = ".exe, .dll, .sys, .tmp",
                PiiTypesJson = "[]", // Les valeurs par défaut seront gérées côté frontend
                RecentScanPathsJson = "[]",
                UpdatedAt = DateTime.UtcNow
            };

            _db.UserSettings.Add(settings);
            await _db.SaveChangesAsync();

            _logger.LogInformation("Created default settings for user {UserId}", userId);
        }

        return Ok(settings);
    }

    /// <summary>
    /// Mettre à jour les paramètres de l'utilisateur
    /// </summary>
    [HttpPut]
    public async Task<ActionResult<UserSettings>> UpdateSettings([FromBody] UpdateUserSettingsRequest request)
    {
        var userId = int.Parse(User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value ?? "0");

        var settings = await _db.UserSettings.FirstOrDefaultAsync(s => s.UserId == userId);

        if (settings == null)
        {
            // Créer si n'existe pas
            settings = new UserSettings
            {
                UserId = userId
            };
            _db.UserSettings.Add(settings);
        }

        // Mettre à jour les champs
        settings.FileTypesJson = request.FileTypesJson ?? settings.FileTypesJson;
        settings.ExcludedFolders = request.ExcludedFolders ?? settings.ExcludedFolders;
        settings.ExcludedExtensions = request.ExcludedExtensions ?? settings.ExcludedExtensions;
        settings.PiiTypesJson = request.PiiTypesJson ?? settings.PiiTypesJson;
        settings.RecentScanPathsJson = request.RecentScanPathsJson ?? settings.RecentScanPathsJson;
        settings.UpdatedAt = DateTime.UtcNow;

        await _db.SaveChangesAsync();

        // Log audit
        await _db.AuditLogs.AddAsync(new AuditLog
        {
            UserId = userId,
            Action = "UpdateUserSettings",
            EntityType = "UserSettings",
            EntityId = settings.Id.ToString(),
            IpAddress = HttpContext.Connection.RemoteIpAddress?.ToString() ?? "unknown",
            Details = "Paramètres utilisateur mis à jour"
        });
        await _db.SaveChangesAsync();

        _logger.LogInformation("User {UserId} updated their settings", userId);

        return Ok(settings);
    }
}

public class UpdateUserSettingsRequest
{
    public string? FileTypesJson { get; set; }
    public string? ExcludedFolders { get; set; }
    public string? ExcludedExtensions { get; set; }
    public string? PiiTypesJson { get; set; }
    public string? RecentScanPathsJson { get; set; }
}
