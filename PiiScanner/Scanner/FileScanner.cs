using PiiScanner.Analysis;
using PiiScanner.Models;
using PiiScanner.Reader;
using System.Collections.Concurrent;

namespace PiiScanner.Scanner;

public class FileScanner
{
    private readonly string[] allowedExtensions = { ".txt", ".log", ".csv", ".json", ".docx", ".xlsx", ".pdf" };
    private int processedFiles = 0;

    public int TotalFilesScanned { get; private set; }
    public int ProcessedFiles => processedFiles;

    public event Action<int, int>? ProgressUpdated; // (current, total)

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
                    var detections = PiiDetector.Detect(content, file);
                    foreach (var detection in detections)
                    {
                        results.Add(detection);
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
