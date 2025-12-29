using PiiScanner.Analysis;
using PiiScanner.Models;
using PiiScanner.Reader;
using PiiScanner.Utils;
using System.Collections.Concurrent;
using System.Security.Cryptography;

namespace PiiScanner.Scanner;

public class FileScanner
{
    private readonly string[] allowedExtensions = { ".txt", ".log", ".csv", ".json", ".docx", ".xlsx", ".pdf" };
    private int processedFiles = 0;

    public int TotalFilesScanned { get; private set; }
    public int ProcessedFiles => processedFiles;

    public event Action<int, int>? ProgressUpdated; // (current, total)

    private static string CalculateFileHash(string filePath)
    {
        try
        {
            using var md5 = MD5.Create();
            using var stream = File.OpenRead(filePath);
            var hashBytes = md5.ComputeHash(stream);
            return BitConverter.ToString(hashBytes).Replace("-", "").ToLowerInvariant();
        }
        catch
        {
            return string.Empty;
        }
    }

    public List<ScanResult> ScanDirectory(string path)
    {
        var results = new ConcurrentBag<ScanResult>();
        processedFiles = 0;
        TotalFilesScanned = 0;

        var options = new EnumerationOptions
        {
            RecurseSubdirectories = true,
            IgnoreInaccessible = true
        };

        List<string> files;

        try
        {
            files = Directory.EnumerateFiles(path, "*.*", options)
                .Where(f => allowedExtensions.Contains(Path.GetExtension(f).ToLower()))
                .ToList();
        }
        catch
        {
            return results.ToList();
        }

        TotalFilesScanned = files.Count;

        // Traitement parallèle des fichiers
        var parallelOptions = new ParallelOptions
        {
            MaxDegreeOfParallelism = Environment.ProcessorCount
        };

        Parallel.ForEach(files, parallelOptions, file =>
        {
            try
            {
                string content = DocumentReader.ReadFile(file);
                if (!string.IsNullOrEmpty(content))
                {
                    // Récupérer la date du dernier accès
                    DateTime? lastAccessedDate = null;
                    try
                    {
                        lastAccessedDate = File.GetLastAccessTime(file);
                    }
                    catch
                    {
                        // Si impossible d'obtenir la date, continuer sans
                    }

                    // Analyser les permissions du fichier
                    FilePermissionAnalyzer.PermissionInfo? permissionInfo = null;
                    try
                    {
                        permissionInfo = FilePermissionAnalyzer.AnalyzeFilePermissions(file);
                    }
                    catch
                    {
                        // Si impossible d'analyser les permissions, continuer sans
                    }

                    // Détecter les PII sans hash d'abord
                    var detections = PiiDetector.Detect(content, file, lastAccessedDate, permissionInfo, null);

                    // Si des PII sont détectés, calculer le hash et mettre à jour les détections
                    if (detections.Count > 0)
                    {
                        string? fileHash = CalculateFileHash(file);

                        // Recréer les détections avec le hash
                        var detectionsWithHash = PiiDetector.Detect(content, file, lastAccessedDate, permissionInfo, fileHash);
                        foreach (var detection in detectionsWithHash)
                        {
                            results.Add(detection);
                        }
                    }
                }
            }
            catch
            {
                // fichier verrouillé ou non lisible
            }
            finally
            {
                Interlocked.Increment(ref processedFiles);
                ProgressUpdated?.Invoke(processedFiles, TotalFilesScanned);
            }
        });

        return results.ToList();
    }
}
