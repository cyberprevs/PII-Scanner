using System.Collections.Concurrent;
using System.Net;

namespace PiiScanner.Api.Middleware;

/// <summary>
/// Middleware de limitation du nombre de requêtes (Rate Limiting)
/// Protège contre les attaques par force brute et les abus d'API
/// </summary>
public class RateLimitingMiddleware
{
    private readonly RequestDelegate _next;
    private readonly ILogger<RateLimitingMiddleware> _logger;

    // Stockage des tentatives par IP et endpoint
    private static readonly ConcurrentDictionary<string, RequestCounter> _requestCounts = new();

    // Configuration par défaut
    private readonly RateLimitConfig _config = new()
    {
        // Login : 5 tentatives par 15 minutes
        LoginMaxRequests = 5,
        LoginWindowMinutes = 15,

        // API générale : 100 requêtes par minute
        ApiMaxRequests = 100,
        ApiWindowMinutes = 1,

        // Endpoints sensibles : 20 requêtes par 5 minutes
        SensitiveMaxRequests = 20,
        SensitiveWindowMinutes = 5
    };

    public RateLimitingMiddleware(RequestDelegate next, ILogger<RateLimitingMiddleware> logger)
    {
        _next = next;
        _logger = logger;
    }

    public async Task InvokeAsync(HttpContext context)
    {
        var endpoint = context.Request.Path.Value?.ToLowerInvariant() ?? "";
        var ipAddress = GetClientIpAddress(context);
        var key = $"{ipAddress}:{endpoint}";

        // Déterminer les limites selon l'endpoint
        var (maxRequests, windowMinutes, endpointType) = GetRateLimitForEndpoint(endpoint);

        // Nettoyer les anciens compteurs (pour éviter les fuites mémoire)
        CleanupOldCounters();

        // Obtenir ou créer le compteur pour cette IP/endpoint
        var counter = _requestCounts.GetOrAdd(key, _ => new RequestCounter());

        await counter.Semaphore.WaitAsync();
        try
        {
            var now = DateTime.UtcNow;
            var windowStart = now.AddMinutes(-windowMinutes);

            // Supprimer les requêtes hors de la fenêtre de temps
            counter.Requests.RemoveAll(r => r < windowStart);

            // Vérifier si la limite est dépassée
            if (counter.Requests.Count >= maxRequests)
            {
                // Calculer le temps d'attente
                var oldestRequest = counter.Requests.Min();
                var resetTime = oldestRequest.AddMinutes(windowMinutes);
                var retryAfterSeconds = (int)(resetTime - now).TotalSeconds;

                _logger.LogWarning(
                    "Rate limit dépassé pour {IpAddress} sur {Endpoint} - Type: {Type} - Tentatives: {Count}/{Max}",
                    ipAddress, endpoint, endpointType, counter.Requests.Count, maxRequests);

                context.Response.StatusCode = (int)HttpStatusCode.TooManyRequests;
                context.Response.Headers["Retry-After"] = retryAfterSeconds.ToString();
                context.Response.Headers["X-RateLimit-Limit"] = maxRequests.ToString();
                context.Response.Headers["X-RateLimit-Remaining"] = "0";
                context.Response.Headers["X-RateLimit-Reset"] = resetTime.ToString("o");

                await context.Response.WriteAsJsonAsync(new
                {
                    error = "Trop de requêtes",
                    message = $"Vous avez dépassé la limite de {maxRequests} requêtes par {windowMinutes} minute(s). Veuillez réessayer dans {retryAfterSeconds} secondes.",
                    retryAfter = retryAfterSeconds,
                    type = endpointType
                });

                return;
            }

            // Ajouter la requête actuelle
            counter.Requests.Add(now);

            // Ajouter les en-têtes de rate limiting
            var remaining = maxRequests - counter.Requests.Count;
            var limitResetTime = now.AddMinutes(windowMinutes);

            context.Response.OnStarting(() =>
            {
                context.Response.Headers["X-RateLimit-Limit"] = maxRequests.ToString();
                context.Response.Headers["X-RateLimit-Remaining"] = remaining.ToString();
                context.Response.Headers["X-RateLimit-Reset"] = limitResetTime.ToString("o");
                return Task.CompletedTask;
            });
        }
        finally
        {
            counter.Semaphore.Release();
        }

        await _next(context);
    }

    /// <summary>
    /// Détermine les limites de rate limiting selon l'endpoint
    /// </summary>
    private (int maxRequests, int windowMinutes, string type) GetRateLimitForEndpoint(string endpoint)
    {
        // Login endpoint - très restrictif
        if (endpoint.Contains("/api/auth/login"))
        {
            return (_config.LoginMaxRequests, _config.LoginWindowMinutes, "login");
        }

        // Endpoints sensibles - restrictif
        if (endpoint.Contains("/api/users") ||
            endpoint.Contains("/api/database/backup") ||
            endpoint.Contains("/api/database/restore") ||
            endpoint.Contains("/api/dataretention/delete"))
        {
            return (_config.SensitiveMaxRequests, _config.SensitiveWindowMinutes, "sensitive");
        }

        // API générale - normal
        return (_config.ApiMaxRequests, _config.ApiWindowMinutes, "api");
    }

    /// <summary>
    /// Récupère l'adresse IP réelle du client (supporte les proxies)
    /// </summary>
    private string GetClientIpAddress(HttpContext context)
    {
        // Vérifier les en-têtes de proxy
        var forwardedFor = context.Request.Headers["X-Forwarded-For"].FirstOrDefault();
        if (!string.IsNullOrEmpty(forwardedFor))
        {
            // Prendre la première IP (client réel)
            return forwardedFor.Split(',')[0].Trim();
        }

        var realIp = context.Request.Headers["X-Real-IP"].FirstOrDefault();
        if (!string.IsNullOrEmpty(realIp))
        {
            return realIp;
        }

        // Fallback sur l'IP de connexion
        return context.Connection.RemoteIpAddress?.ToString() ?? "unknown";
    }

    /// <summary>
    /// Nettoie les compteurs obsolètes pour éviter les fuites mémoire
    /// </summary>
    private void CleanupOldCounters()
    {
        // Exécuter le nettoyage seulement 1% du temps (performance)
        if (Random.Shared.Next(100) != 0) return;

        var now = DateTime.UtcNow;
        var maxWindowMinutes = Math.Max(_config.LoginWindowMinutes,
            Math.Max(_config.ApiWindowMinutes, _config.SensitiveWindowMinutes));
        var cutoff = now.AddMinutes(-maxWindowMinutes * 2); // Double de la fenêtre max

        var keysToRemove = new List<string>();

        foreach (var kvp in _requestCounts)
        {
            lock (kvp.Value)
            {
                // Si toutes les requêtes sont anciennes, marquer pour suppression
                if (kvp.Value.Requests.Count == 0 || kvp.Value.Requests.Max() < cutoff)
                {
                    keysToRemove.Add(kvp.Key);
                }
            }
        }

        foreach (var key in keysToRemove)
        {
            _requestCounts.TryRemove(key, out _);
        }

        if (keysToRemove.Count > 0)
        {
            _logger.LogInformation("Nettoyage du rate limiting: {Count} entrées supprimées", keysToRemove.Count);
        }
    }

    /// <summary>
    /// Compteur de requêtes pour une IP/endpoint
    /// </summary>
    private class RequestCounter
    {
        public List<DateTime> Requests { get; } = new();
        public SemaphoreSlim Semaphore { get; } = new(1, 1);
    }

    /// <summary>
    /// Configuration du rate limiting
    /// </summary>
    private class RateLimitConfig
    {
        public int LoginMaxRequests { get; set; }
        public int LoginWindowMinutes { get; set; }
        public int ApiMaxRequests { get; set; }
        public int ApiWindowMinutes { get; set; }
        public int SensitiveMaxRequests { get; set; }
        public int SensitiveWindowMinutes { get; set; }
    }
}

/// <summary>
/// Extensions pour faciliter l'ajout du middleware
/// </summary>
public static class RateLimitingMiddlewareExtensions
{
    public static IApplicationBuilder UseRateLimiting(this IApplicationBuilder builder)
    {
        return builder.UseMiddleware<RateLimitingMiddleware>();
    }
}
