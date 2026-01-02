using Microsoft.EntityFrameworkCore;
using PiiScanner.Api.Data;

namespace PiiScanner.Api.Services;

/// <summary>
/// Service en arrière-plan pour nettoyer automatiquement les sessions expirées et révoquées
/// </summary>
public class SessionCleanupService : BackgroundService
{
    private readonly IServiceProvider _serviceProvider;
    private readonly ILogger<SessionCleanupService> _logger;
    private readonly TimeSpan _cleanupInterval = TimeSpan.FromHours(1); // Nettoyer toutes les heures

    public SessionCleanupService(IServiceProvider serviceProvider, ILogger<SessionCleanupService> logger)
    {
        _serviceProvider = serviceProvider;
        _logger = logger;
    }

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        _logger.LogInformation("Session Cleanup Service démarré");

        while (!stoppingToken.IsCancellationRequested)
        {
            try
            {
                await CleanupExpiredSessions(stoppingToken);
                await Task.Delay(_cleanupInterval, stoppingToken);
            }
            catch (OperationCanceledException)
            {
                // Service arrêté normalement
                break;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erreur lors du nettoyage des sessions");
                await Task.Delay(TimeSpan.FromMinutes(5), stoppingToken); // Réessayer après 5 minutes
            }
        }

        _logger.LogInformation("Session Cleanup Service arrêté");
    }

    private async Task CleanupExpiredSessions(CancellationToken stoppingToken)
    {
        using var scope = _serviceProvider.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();

        var cutoffDate = DateTime.UtcNow;

        // Supprimer les sessions expirées ou révoquées
        var expiredSessions = await db.Sessions
            .Where(s => s.ExpiresAt < cutoffDate || s.IsRevoked)
            .ToListAsync(stoppingToken);

        if (expiredSessions.Any())
        {
            db.Sessions.RemoveRange(expiredSessions);
            await db.SaveChangesAsync(stoppingToken);

            _logger.LogInformation(
                "Nettoyage: {Count} session(s) expirée(s) ou révoquée(s) supprimée(s)",
                expiredSessions.Count);
        }

        // Nettoyer aussi les vieux logs d'audit si nécessaire
        var settings = await db.AppSettings.FirstOrDefaultAsync(stoppingToken);
        if (settings != null && settings.AuditLogRetentionDays > 0)
        {
            var auditCutoffDate = DateTime.UtcNow.AddDays(-settings.AuditLogRetentionDays);
            var oldAuditLogs = await db.AuditLogs
                .Where(a => a.CreatedAt < auditCutoffDate)
                .ToListAsync(stoppingToken);

            if (oldAuditLogs.Any())
            {
                db.AuditLogs.RemoveRange(oldAuditLogs);
                await db.SaveChangesAsync(stoppingToken);

                _logger.LogInformation(
                    "Nettoyage: {Count} log(s) d'audit ancien(s) supprimé(s)",
                    oldAuditLogs.Count);
            }
        }
    }
}
