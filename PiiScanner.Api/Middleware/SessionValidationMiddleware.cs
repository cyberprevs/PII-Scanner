using Microsoft.EntityFrameworkCore;
using PiiScanner.Api.Data;
using System.Security.Claims;

namespace PiiScanner.Api.Middleware;

/// <summary>
/// Middleware pour valider que la session JWT n'est pas révoquée ou expirée en base de données
/// </summary>
public class SessionValidationMiddleware
{
    private readonly RequestDelegate _next;
    private readonly ILogger<SessionValidationMiddleware> _logger;

    public SessionValidationMiddleware(RequestDelegate next, ILogger<SessionValidationMiddleware> logger)
    {
        _next = next;
        _logger = logger;
    }

    public async Task InvokeAsync(HttpContext context, AppDbContext db)
    {
        // Vérifier seulement pour les requêtes authentifiées
        if (context.User.Identity?.IsAuthenticated == true)
        {
            var userIdClaim = context.User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            var sessionIdClaim = context.User.FindFirst("SessionId")?.Value;

            if (!string.IsNullOrEmpty(userIdClaim) && int.TryParse(userIdClaim, out var userId))
            {
                // Si pas de SessionId dans le token, continuer (ancien token sans SessionId)
                if (string.IsNullOrEmpty(sessionIdClaim))
                {
                    await _next(context);
                    return;
                }

                // Vérifier que la session existe et n'est pas révoquée
                var session = await db.Sessions
                    .Where(s => s.Id.ToString() == sessionIdClaim && s.UserId == userId)
                    .FirstOrDefaultAsync();

                if (session == null)
                {
                    _logger.LogWarning(
                        "Session introuvable pour UserId={UserId}, SessionId={SessionId}",
                        userId, sessionIdClaim);

                    context.Response.StatusCode = 401;
                    await context.Response.WriteAsJsonAsync(new
                    {
                        error = "Session invalide",
                        message = "Votre session n'est plus valide. Veuillez vous reconnecter."
                    });
                    return;
                }

                if (session.IsRevoked)
                {
                    _logger.LogWarning(
                        "Tentative d'utilisation d'une session révoquée: UserId={UserId}, SessionId={SessionId}",
                        userId, sessionIdClaim);

                    context.Response.StatusCode = 401;
                    await context.Response.WriteAsJsonAsync(new
                    {
                        error = "Session révoquée",
                        message = "Votre session a été révoquée. Veuillez vous reconnecter."
                    });
                    return;
                }

                if (session.ExpiresAt < DateTime.UtcNow)
                {
                    _logger.LogWarning(
                        "Tentative d'utilisation d'une session expirée: UserId={UserId}, SessionId={SessionId}",
                        userId, sessionIdClaim);

                    context.Response.StatusCode = 401;
                    await context.Response.WriteAsJsonAsync(new
                    {
                        error = "Session expirée",
                        message = "Votre session a expiré. Veuillez vous reconnecter."
                    });
                    return;
                }
            }
        }

        await _next(context);
    }
}

/// <summary>
/// Extensions pour faciliter l'ajout du middleware
/// </summary>
public static class SessionValidationMiddlewareExtensions
{
    public static IApplicationBuilder UseSessionValidation(this IApplicationBuilder builder)
    {
        return builder.UseMiddleware<SessionValidationMiddleware>();
    }
}
