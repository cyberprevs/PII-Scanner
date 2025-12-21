using Microsoft.EntityFrameworkCore;
using PiiScanner.Api.Data;
using PiiScanner.Api.Models;
using PiiScanner.Api.DTOs;

namespace PiiScanner.Api.Services;

/// <summary>
/// Service d'arrière-plan qui vérifie et exécute les scans planifiés
/// </summary>
public class BackgroundSchedulerService : BackgroundService
{
    private readonly IServiceScopeFactory _serviceScopeFactory;
    private readonly ILogger<BackgroundSchedulerService> _logger;
    private const int CHECK_INTERVAL_MINUTES = 1; // Vérifier toutes les minutes

    public BackgroundSchedulerService(
        IServiceScopeFactory serviceScopeFactory,
        ILogger<BackgroundSchedulerService> logger)
    {
        _serviceScopeFactory = serviceScopeFactory;
        _logger = logger;
    }

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        _logger.LogInformation("BackgroundSchedulerService démarré");

        while (!stoppingToken.IsCancellationRequested)
        {
            try
            {
                await CheckAndExecuteScheduledScans();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erreur lors de la vérification des scans planifiés");
            }

            // Attendre avant la prochaine vérification
            await Task.Delay(TimeSpan.FromMinutes(CHECK_INTERVAL_MINUTES), stoppingToken);
        }

        _logger.LogInformation("BackgroundSchedulerService arrêté");
    }

    private async Task CheckAndExecuteScheduledScans()
    {
        using var scope = _serviceScopeFactory.CreateScope();
        var context = scope.ServiceProvider.GetRequiredService<AppDbContext>();
        var schedulerService = scope.ServiceProvider.GetRequiredService<SchedulerService>();
        var scanService = scope.ServiceProvider.GetRequiredService<ScanService>();

        var now = DateTime.UtcNow;

        // Récupérer tous les scans actifs qui doivent être exécutés
        var scansToRun = await context.ScheduledScans
            .Where(s => s.IsActive && s.NextRunAt.HasValue && s.NextRunAt.Value <= now)
            .ToListAsync();

        if (scansToRun.Any())
        {
            _logger.LogInformation($"Trouvé {scansToRun.Count} scan(s) planifié(s) à exécuter");
        }

        foreach (var scheduledScan in scansToRun)
        {
            try
            {
                await ExecuteScheduledScan(scheduledScan, scanService, schedulerService, context);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Erreur lors de l'exécution du scan planifié '{scheduledScan.Name}' (ID: {scheduledScan.Id})");
            }
        }
    }

    private async Task ExecuteScheduledScan(
        ScheduledScan scheduledScan,
        ScanService scanService,
        SchedulerService schedulerService,
        AppDbContext context)
    {
        _logger.LogInformation($"Démarrage du scan planifié '{scheduledScan.Name}' (ID: {scheduledScan.Id})");

        // Vérifier que le répertoire existe toujours
        if (!Directory.Exists(scheduledScan.DirectoryPath))
        {
            _logger.LogWarning($"Le répertoire '{scheduledScan.DirectoryPath}' n'existe plus pour le scan '{scheduledScan.Name}'");

            // Désactiver le scan si le répertoire n'existe plus
            scheduledScan.IsActive = false;
            await context.SaveChangesAsync();
            return;
        }

        try
        {
            // Lancer le scan
            var request = new ScanRequest
            {
                DirectoryPath = scheduledScan.DirectoryPath
            };
            var scanId = scanService.StartScan(request);

            // Mettre à jour les informations du scan planifié
            schedulerService.UpdateAfterExecution(scheduledScan, scanId);
            await context.SaveChangesAsync();

            _logger.LogInformation($"Scan planifié '{scheduledScan.Name}' démarré avec succès (ScanId: {scanId}). Prochaine exécution: {scheduledScan.NextRunAt}");

            // Audit log
            await context.AuditLogs.AddAsync(new AuditLog
            {
                UserId = scheduledScan.CreatedBy,
                Action = "Execute",
                EntityType = "ScheduledScan",
                EntityId = scheduledScan.Id.ToString(),
                IpAddress = null,
                Details = $"Scan planifié exécuté automatiquement: {scheduledScan.Name} -> ScanId: {scanId}",
                CreatedAt = DateTime.UtcNow
            });
            await context.SaveChangesAsync();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, $"Erreur lors du démarrage du scan planifié '{scheduledScan.Name}'");

            // Mettre à jour NextRunAt même en cas d'échec pour éviter les boucles
            schedulerService.UpdateAfterExecution(scheduledScan, "ERROR");
            await context.SaveChangesAsync();
        }
    }
}
