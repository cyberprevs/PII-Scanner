using System.Security.Cryptography;
using System.Text;

namespace PiiScanner.Api.Middleware;

/// <summary>
/// Middleware de protection CSRF (Cross-Site Request Forgery)
/// Utilise des tokens CSRF personnalisés pour les API JWT
/// </summary>
public class CsrfProtectionMiddleware
{
    private readonly RequestDelegate _next;
    private readonly ILogger<CsrfProtectionMiddleware> _logger;
    private const string CSRF_TOKEN_HEADER = "X-CSRF-Token";
    private const string CSRF_TOKEN_COOKIE = "XSRF-TOKEN";

    // Endpoints qui nécessitent une protection CSRF (opérations de modification)
    private static readonly HashSet<string> ProtectedEndpoints = new(StringComparer.OrdinalIgnoreCase)
    {
        // Authentification (login exempt car pas encore de token)
        "/api/users",                    // Gestion utilisateurs
        "/api/database/backup",          // Création backup
        "/api/database/restore",         // Restauration
        "/api/database/optimize",        // Optimisation
        "/api/database/cleanup",         // Nettoyage
        "/api/dataretention/delete",     // Suppression fichiers
        "/api/auth/change-password",     // Changement mot de passe
    };

    public CsrfProtectionMiddleware(RequestDelegate next, ILogger<CsrfProtectionMiddleware> logger)
    {
        _next = next;
        _logger = logger;
    }

    public async Task InvokeAsync(HttpContext context)
    {
        var path = context.Request.Path.Value ?? "";
        var method = context.Request.Method;

        // Générer et envoyer un nouveau token CSRF pour toutes les requêtes GET
        if (method == "GET")
        {
            var csrfToken = GenerateCsrfToken();

            // Envoyer le token dans un cookie HttpOnly=false pour que JavaScript puisse le lire
            context.Response.Cookies.Append(CSRF_TOKEN_COOKIE, csrfToken, new CookieOptions
            {
                HttpOnly = false,  // JavaScript doit pouvoir lire ce cookie
                SameSite = SameSiteMode.Strict,
                Secure = !context.RequestServices.GetRequiredService<IWebHostEnvironment>().IsDevelopment(),
                MaxAge = TimeSpan.FromHours(1)
            });

            await _next(context);
            return;
        }

        // Vérifier le token CSRF pour les requêtes de modification (POST, PUT, DELETE, PATCH)
        if (IsModifyingRequest(method) && RequiresCsrfProtection(path))
        {
            // Récupérer le token depuis le header
            var headerToken = context.Request.Headers[CSRF_TOKEN_HEADER].FirstOrDefault();

            // Récupérer le token depuis le cookie
            var cookieToken = context.Request.Cookies[CSRF_TOKEN_COOKIE];

            // Les deux tokens doivent être présents et identiques
            if (string.IsNullOrEmpty(headerToken) || string.IsNullOrEmpty(cookieToken))
            {
                _logger.LogWarning(
                    "Tentative CSRF détectée: Token manquant pour {Method} {Path} depuis {IpAddress}",
                    method, path, GetClientIpAddress(context));

                context.Response.StatusCode = 403;
                await context.Response.WriteAsJsonAsync(new
                {
                    error = "Token CSRF manquant",
                    message = "Cette opération nécessite un token CSRF valide. Rechargez la page et réessayez."
                });
                return;
            }

            if (headerToken != cookieToken)
            {
                _logger.LogWarning(
                    "Tentative CSRF détectée: Token invalide pour {Method} {Path} depuis {IpAddress}",
                    method, path, GetClientIpAddress(context));

                context.Response.StatusCode = 403;
                await context.Response.WriteAsJsonAsync(new
                {
                    error = "Token CSRF invalide",
                    message = "Le token CSRF ne correspond pas. Cela peut indiquer une attaque CSRF."
                });
                return;
            }

            // Token valide - continuer
            _logger.LogDebug("Token CSRF validé pour {Method} {Path}", method, path);
        }

        await _next(context);
    }

    /// <summary>
    /// Détermine si la requête est une opération de modification
    /// </summary>
    private bool IsModifyingRequest(string method)
    {
        return method == "POST" || method == "PUT" || method == "DELETE" || method == "PATCH";
    }

    /// <summary>
    /// Détermine si l'endpoint nécessite une protection CSRF
    /// </summary>
    private bool RequiresCsrfProtection(string path)
    {
        // Exclure le login (car l'utilisateur n'a pas encore de session)
        if (path.Contains("/api/auth/login", StringComparison.OrdinalIgnoreCase) ||
            path.Contains("/api/auth/refresh", StringComparison.OrdinalIgnoreCase))
        {
            return false;
        }

        // Vérifier si le chemin correspond à un endpoint protégé
        foreach (var endpoint in ProtectedEndpoints)
        {
            if (path.StartsWith(endpoint, StringComparison.OrdinalIgnoreCase))
            {
                return true;
            }
        }

        return false;
    }

    /// <summary>
    /// Génère un token CSRF cryptographiquement sécurisé
    /// </summary>
    private string GenerateCsrfToken()
    {
        var randomBytes = new byte[32];
        using (var rng = RandomNumberGenerator.Create())
        {
            rng.GetBytes(randomBytes);
        }
        return Convert.ToBase64String(randomBytes);
    }

    /// <summary>
    /// Récupère l'adresse IP réelle du client (supporte les proxies)
    /// </summary>
    private string GetClientIpAddress(HttpContext context)
    {
        var forwardedFor = context.Request.Headers["X-Forwarded-For"].FirstOrDefault();
        if (!string.IsNullOrEmpty(forwardedFor))
        {
            return forwardedFor.Split(',')[0].Trim();
        }

        var realIp = context.Request.Headers["X-Real-IP"].FirstOrDefault();
        if (!string.IsNullOrEmpty(realIp))
        {
            return realIp;
        }

        return context.Connection.RemoteIpAddress?.ToString() ?? "unknown";
    }
}

/// <summary>
/// Extensions pour faciliter l'ajout du middleware
/// </summary>
public static class CsrfProtectionMiddlewareExtensions
{
    public static IApplicationBuilder UseCsrfProtection(this IApplicationBuilder builder)
    {
        return builder.UseMiddleware<CsrfProtectionMiddleware>();
    }
}
