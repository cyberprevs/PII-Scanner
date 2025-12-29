using Microsoft.AspNetCore.Mvc;
using PiiScanner.Scanner;
using PiiScanner.Analysis;
using PiiScanner.Reader;
using PiiScanner.Api.Utils;

namespace PiiScanner.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class DataRetentionController : ControllerBase
{
    private readonly ILogger<DataRetentionController> _logger;

    public DataRetentionController(ILogger<DataRetentionController> logger)
    {
        _logger = logger;
    }

    /// <summary>
    /// Analyse un répertoire pour identifier les fichiers dépassant les politiques de rétention
    /// </summary>
    [HttpPost("scan")]
    public IActionResult ScanForOldFiles([FromBody] RetentionScanRequest request)
    {
        try
        {
            // SÉCURITÉ: Valider le chemin pour prévenir les attaques de type Path Traversal
            if (!PathValidator.ValidateDirectoryPath(request.DirectoryPath, out var validationError, mustExist: true))
            {
                _logger.LogWarning("Tentative de scan de rétention avec un chemin invalide: {Path} - Erreur: {Error}",
                    request.DirectoryPath, validationError);

                return BadRequest(new { error = $"Répertoire invalide: {validationError}" });
            }

            var filesToDelete = new List<OldFileInfo>();
            var scanner = new FileScanner();

            // Scanner le répertoire
            var scanResults = scanner.ScanDirectory(request.DirectoryPath);

            // Regrouper les résultats par fichier
            var fileGroups = scanResults.GroupBy(r => r.FilePath);

            foreach (var fileGroup in fileGroups)
            {
                try
                {
                    var filePath = fileGroup.Key;
                    var fileInfo = new FileInfo(filePath);
                    var fileAge = (DateTime.Now - fileInfo.LastWriteTime).TotalDays / 365.25; // Âge en années

                    var detections = fileGroup.Select(r => (Type: r.PiiType, Value: r.Match)).ToList();

                    if (detections.Count == 0) continue; // Ignorer les fichiers sans PII

                    // Vérifier si le fichier dépasse une politique de rétention
                    var categoryViolated = GetViolatedRetentionPolicy(detections, fileAge, request.RetentionPolicies);

                    if (!string.IsNullOrEmpty(categoryViolated))
                    {
                        filesToDelete.Add(new OldFileInfo
                        {
                            Path = filePath,
                            Age = Math.Round(fileAge, 1),
                            LastModified = fileInfo.LastWriteTime.ToString("yyyy-MM-dd"),
                            PiiCount = detections.Count,
                            Reason = categoryViolated,
                            SizeBytes = fileInfo.Length
                        });
                    }
                }
                catch (Exception ex)
                {
                    _logger.LogWarning($"Erreur lors de l'analyse du fichier {fileGroup.Key}: {ex.Message}");
                    // Continuer avec le fichier suivant
                }
            }

            return Ok(new
            {
                success = true,
                filesFound = filesToDelete.Count,
                totalPii = filesToDelete.Sum(f => f.PiiCount),
                files = filesToDelete
            });
        }
        catch (Exception ex)
        {
            _logger.LogError($"Erreur lors du scan de rétention: {ex.Message}");
            return StatusCode(500, new { error = ex.Message });
        }
    }

    /// <summary>
    /// Supprime les fichiers spécifiés
    /// </summary>
    [HttpPost("delete")]
    public IActionResult DeleteFiles([FromBody] DeleteFilesRequest request)
    {
        try
        {
            var deletedFiles = new List<string>();
            var failedFiles = new List<string>();

            foreach (var filePath in request.FilePaths)
            {
                try
                {
                    // SÉCURITÉ: Valider le chemin du fichier pour prévenir les attaques de type Path Traversal
                    if (!PathValidator.ValidateFilePath(filePath, out var validationError, mustExist: false))
                    {
                        _logger.LogWarning("Tentative de suppression d'un fichier avec un chemin invalide: {Path} - Erreur: {Error}",
                            filePath, validationError);
                        failedFiles.Add(filePath);
                        continue;
                    }

                    if (System.IO.File.Exists(filePath))
                    {
                        System.IO.File.Delete(filePath);
                        deletedFiles.Add(filePath);
                        _logger.LogInformation($"Fichier supprimé: {filePath}");
                    }
                    else
                    {
                        failedFiles.Add(filePath);
                    }
                }
                catch (Exception ex)
                {
                    _logger.LogError($"Erreur lors de la suppression de {filePath}: {ex.Message}");
                    failedFiles.Add(filePath);
                }
            }

            return Ok(new
            {
                success = true,
                deletedCount = deletedFiles.Count,
                failedCount = failedFiles.Count,
                deletedFiles,
                failedFiles
            });
        }
        catch (Exception ex)
        {
            _logger.LogError($"Erreur lors de la suppression: {ex.Message}");
            return StatusCode(500, new { error = ex.Message });
        }
    }

    /// <summary>
    /// Détermine si un fichier viole une politique de rétention
    /// </summary>
    private string GetViolatedRetentionPolicy(List<(string Type, string Value)> detections, double fileAge, Dictionary<string, int> policies)
    {
        // Données bancaires (IBAN, CarteBancaire)
        if (detections.Any(d => d.Type == "IBAN" || d.Type == "CarteBancaire"))
        {
            var retentionYears = policies.GetValueOrDefault("banking", 5);
            if (fileAge > retentionYears)
                return $"Données bancaires > {retentionYears} ans";
        }

        // Données d'identité (IFU, CNI, Passeport)
        if (detections.Any(d => d.Type == "IFU" || d.Type == "CNI_Benin" ||
                                d.Type == "Passeport_Benin" || d.Type == "RCCM" || d.Type == "ActeNaissance"))
        {
            var retentionYears = policies.GetValueOrDefault("identity", 3);
            if (fileAge > retentionYears)
                return $"Données identité > {retentionYears} ans";
        }

        // Données santé (CNSS, RAMU)
        if (detections.Any(d => d.Type == "CNSS" || d.Type == "RAMU"))
        {
            var retentionYears = policies.GetValueOrDefault("health", 5);
            if (fileAge > retentionYears)
                return $"Données santé > {retentionYears} ans";
        }

        // Données éducation (INE, Matricule)
        if (detections.Any(d => d.Type == "INE" || d.Type == "Matricule_Fonctionnaire"))
        {
            var retentionYears = policies.GetValueOrDefault("education", 2);
            if (fileAge > retentionYears)
                return $"Données éducation > {retentionYears} ans";
        }

        // Données contact (Email, Telephone)
        if (detections.Any(d => d.Type == "Email" || d.Type == "Telephone"))
        {
            var retentionYears = policies.GetValueOrDefault("contact", 1);
            if (fileAge > retentionYears)
                return $"Données contact > {retentionYears} an";
        }

        return string.Empty; // Pas de violation
    }
}

// ===== Modèles de requête =====

public class RetentionScanRequest
{
    public string DirectoryPath { get; set; } = string.Empty;
    public Dictionary<string, int> RetentionPolicies { get; set; } = new()
    {
        { "banking", 5 },
        { "identity", 3 },
        { "health", 5 },
        { "education", 2 },
        { "contact", 1 }
    };
}

public class DeleteFilesRequest
{
    public List<string> FilePaths { get; set; } = new();
}

public class OldFileInfo
{
    public string Path { get; set; } = string.Empty;
    public double Age { get; set; }
    public string LastModified { get; set; } = string.Empty;
    public int PiiCount { get; set; }
    public string Reason { get; set; } = string.Empty;
    public long SizeBytes { get; set; }
}
