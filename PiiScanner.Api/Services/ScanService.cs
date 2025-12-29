using System.Collections.Concurrent;
using Microsoft.AspNetCore.SignalR;
using Microsoft.EntityFrameworkCore;
using PiiScanner.Api.Data;
using PiiScanner.Api.DTOs;
using PiiScanner.Api.Hubs;
using PiiScanner.Models;
using PiiScanner.Scanner;
using PiiScanner.Reporting;

namespace PiiScanner.Api.Services;

public class ScanService
{
    private readonly IHubContext<ScanHub> _hubContext;
    private readonly IServiceScopeFactory _serviceScopeFactory;
    private readonly ConcurrentDictionary<string, ScanSession> _activeScans = new();

    public ScanService(IHubContext<ScanHub> hubContext, IServiceScopeFactory serviceScopeFactory)
    {
        _hubContext = hubContext;
        _serviceScopeFactory = serviceScopeFactory;
    }

    public string StartScan(ScanRequest request)
    {
        var scanId = Guid.NewGuid().ToString();
        var session = new ScanSession
        {
            ScanId = scanId,
            DirectoryPath = request.DirectoryPath,
            Status = "processing",
            StartTime = DateTime.UtcNow
        };

        _activeScans[scanId] = session;

        // Démarrer le scan en arrière-plan
        Task.Run(() => ExecuteScan(scanId, request));

        return scanId;
    }

    private async Task ExecuteScan(string scanId, ScanRequest request)
    {
        try
        {
            var session = _activeScans[scanId];
            var scanner = new FileScanner();

            // S'abonner aux événements de progression
            scanner.ProgressUpdated += async (current, total) =>
            {
                session.ProcessedFiles = current;
                session.TotalFiles = total;

                // Envoyer la progression via SignalR
                await _hubContext.Clients.All.SendAsync("ReceiveProgress", scanId, current, total);
            };

            // Exécuter le scan
            var results = scanner.ScanDirectory(request.DirectoryPath);

            // Stocker les résultats
            session.Results = results;
            session.TotalFiles = scanner.TotalFilesScanned;
            session.ProcessedFiles = scanner.TotalFilesScanned;
            session.Status = "completed";
            session.EndTime = DateTime.UtcNow;

            // Générer les rapports
            var reportsDir = Path.Combine(Path.GetTempPath(), "PiiScanner", scanId);
            Directory.CreateDirectory(reportsDir);

            CsvReport.Generate(results, Path.Combine(reportsDir, "rapport.csv"), scanner.TotalFilesScanned);
            JsonReport.Generate(results, Path.Combine(reportsDir, "rapport.json"), scanner.TotalFilesScanned);
            HtmlReport.Generate(results, Path.Combine(reportsDir, "rapport.html"), scanner.TotalFilesScanned);
            ExcelReport.Generate(results, Path.Combine(reportsDir, "rapport.xlsx"), scanner.TotalFilesScanned);

            session.ReportsDirectory = reportsDir;

            // Mettre à jour la base de données
            await UpdateScanInDatabase(scanId, "Completed", scanner.TotalFilesScanned, results.Count);

            // Notifier la completion
            await _hubContext.Clients.All.SendAsync("ScanComplete", scanId);
        }
        catch (Exception ex)
        {
            var session = _activeScans[scanId];
            session.Status = "error";
            session.ErrorMessage = ex.Message;
            session.EndTime = DateTime.UtcNow;

            // Mettre à jour la base de données avec le statut d'erreur
            await UpdateScanInDatabase(scanId, "Failed", session.TotalFiles, 0);

            await _hubContext.Clients.All.SendAsync("ScanError", scanId, ex.Message);
        }
    }

    private async Task UpdateScanInDatabase(string scanId, string status, int filesScanned, int piiDetected)
    {
        try
        {
            using var scope = _serviceScopeFactory.CreateScope();
            var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();

            var scan = await db.Scans.FirstOrDefaultAsync(s => s.ScanId == scanId);
            if (scan != null)
            {
                scan.Status = status;
                scan.FilesScanned = filesScanned;
                scan.PiiDetected = piiDetected;

                if (status == "Completed" || status == "Failed")
                {
                    scan.CompletedAt = DateTime.UtcNow;
                }

                await db.SaveChangesAsync();
            }
        }
        catch (Exception ex)
        {
            // Log mais ne pas faire échouer le scan
            Console.WriteLine($"Erreur lors de la mise à jour de la BDD pour le scan {scanId}: {ex.Message}");
        }
    }

    public ScanProgressResponse? GetProgress(string scanId)
    {
        if (!_activeScans.TryGetValue(scanId, out var session))
            return null;

        return new ScanProgressResponse
        {
            ScanId = scanId,
            Status = session.Status,
            ProcessedFiles = session.ProcessedFiles,
            TotalFiles = session.TotalFiles,
            PiiFound = session.Results?.Count ?? 0
        };
    }

    public ScanResultResponse? GetResults(string scanId)
    {
        if (!_activeScans.TryGetValue(scanId, out var session) || session.Results == null)
            return null;

        var stats = ScanStatistics.Calculate(session.Results, session.TotalFiles);

        return new ScanResultResponse
        {
            ScanId = scanId,
            Statistics = new ScanStatisticsDto
            {
                TotalFilesScanned = stats.TotalFilesScanned,
                FilesWithPii = stats.FilesWithPii,
                TotalPiiFound = stats.TotalPiiFound,
                PiiByType = stats.PiiByType,
                TopRiskyFiles = stats.TopRiskyFiles.Select(f => new RiskyFileDto
                {
                    FilePath = f.FilePath,
                    PiiCount = f.PiiCount,
                    RiskLevel = f.RiskLevel,
                    LastAccessedDate = f.LastAccessedDate,
                    StalenessLevel = f.StalenessLevel,
                    StaleDataWarning = f.StaleDataWarning,
                    ExposureLevel = f.ExposureLevel,
                    AccessibleToEveryone = f.AccessibleToEveryone,
                    IsNetworkShare = f.IsNetworkShare,
                    UserGroupCount = f.UserGroupCount,
                    ExposureWarning = f.ExposureWarning
                }).ToList()
            },
            Detections = session.Results.Select(r => new ScanDetectionDto
            {
                FilePath = r.FilePath,
                PiiType = r.PiiType,
                Match = r.Match,
                LastAccessedDate = r.LastAccessedDate,
                FileHash = r.FileHash,
                ExposureLevel = r.ExposureLevel,
                AccessibleToEveryone = r.AccessibleToEveryone
            }).ToList()
        };
    }

    public string? GetReportPath(string scanId, string format)
    {
        if (!_activeScans.TryGetValue(scanId, out var session) || session.ReportsDirectory == null)
            return null;

        var fileName = format.ToLower() switch
        {
            "csv" => "rapport.csv",
            "json" => "rapport.json",
            "html" => "rapport.html",
            "excel" => "rapport.xlsx",
            _ => null
        };

        if (fileName == null)
            return null;

        var filePath = Path.Combine(session.ReportsDirectory, fileName);
        return File.Exists(filePath) ? filePath : null;
    }

    public void CleanupScan(string scanId)
    {
        if (_activeScans.TryRemove(scanId, out var session) && session.ReportsDirectory != null)
        {
            try
            {
                Directory.Delete(session.ReportsDirectory, true);
            }
            catch
            {
                // Ignore cleanup errors
            }
        }
    }
}

public class ScanSession
{
    public required string ScanId { get; set; }
    public required string DirectoryPath { get; set; }
    public required string Status { get; set; }
    public int ProcessedFiles { get; set; }
    public int TotalFiles { get; set; }
    public List<ScanResult>? Results { get; set; }
    public DateTime StartTime { get; set; }
    public DateTime? EndTime { get; set; }
    public string? ErrorMessage { get; set; }
    public string? ReportsDirectory { get; set; }
}
