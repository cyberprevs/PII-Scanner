using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using PiiScanner.Api.Data;
using PiiScanner.Api.Models;

namespace PiiScanner.Api.Services;

public class AuthService
{
    private readonly AppDbContext _db;
    private readonly IConfiguration _config;

    public AuthService(AppDbContext db, IConfiguration config)
    {
        _db = db;
        _config = config;
    }

    public async Task<AuthResult> Login(string username, string password, string ipAddress)
    {
        // Trouver l'utilisateur
        var user = await _db.Users.FirstOrDefaultAsync(u =>
            u.Username == username && u.IsActive);

        if (user == null || !BCrypt.Net.BCrypt.Verify(password, user.PasswordHash))
        {
            await LogAudit(null, "LoginFailed", "Auth", username, ipAddress);
            return new AuthResult { Success = false, Error = "Identifiants incorrects" };
        }

        // Générer les tokens
        var token = GenerateJwtToken(user);
        var refreshToken = GenerateRefreshToken();

        // Stocker le refresh token
        await _db.Sessions.AddAsync(new Session
        {
            UserId = user.Id,
            RefreshToken = refreshToken,
            CreatedAt = DateTime.UtcNow,
            ExpiresAt = DateTime.UtcNow.AddDays(7),
            IpAddress = ipAddress
        });

        // Mettre à jour last login
        user.LastLoginAt = DateTime.UtcNow;
        await _db.SaveChangesAsync();

        await LogAudit(user.Id, "LoginSuccess", "Auth", user.Username, ipAddress);

        return new AuthResult
        {
            Success = true,
            Token = token,
            RefreshToken = refreshToken,
            User = new UserDto
            {
                Id = user.Id,
                Username = user.Username,
                Email = user.Email,
                FullName = user.FullName,
                Role = user.Role
            }
        };
    }

    public async Task<bool> Logout(string refreshToken)
    {
        var session = await _db.Sessions.FirstOrDefaultAsync(s => s.RefreshToken == refreshToken);
        if (session != null)
        {
            session.IsRevoked = true;
            await _db.SaveChangesAsync();
            return true;
        }
        return false;
    }

    public async Task<AuthResult> RefreshToken(string refreshToken, string ipAddress)
    {
        var session = await _db.Sessions
            .FirstOrDefaultAsync(s => s.RefreshToken == refreshToken && !s.IsRevoked);

        if (session == null || session.ExpiresAt < DateTime.UtcNow)
        {
            return new AuthResult { Success = false, Error = "Token invalide ou expiré" };
        }

        var user = await _db.Users.FindAsync(session.UserId);
        if (user == null || !user.IsActive)
        {
            return new AuthResult { Success = false, Error = "Utilisateur introuvable" };
        }

        // Générer nouveaux tokens
        var newToken = GenerateJwtToken(user);
        var newRefreshToken = GenerateRefreshToken();

        // Révoquer l'ancien et créer le nouveau
        session.IsRevoked = true;
        await _db.Sessions.AddAsync(new Session
        {
            UserId = user.Id,
            RefreshToken = newRefreshToken,
            CreatedAt = DateTime.UtcNow,
            ExpiresAt = DateTime.UtcNow.AddDays(7),
            IpAddress = ipAddress
        });

        await _db.SaveChangesAsync();

        return new AuthResult
        {
            Success = true,
            Token = newToken,
            RefreshToken = newRefreshToken,
            User = new UserDto
            {
                Id = user.Id,
                Username = user.Username,
                Email = user.Email,
                FullName = user.FullName,
                Role = user.Role
            }
        };
    }

    private string GenerateJwtToken(User user)
    {
        var jwtSecret = _config["Jwt:Secret"] ?? throw new InvalidOperationException("JWT Secret not configured");
        var jwtIssuer = _config["Jwt:Issuer"] ?? "PiiScanner";
        var jwtAudience = _config["Jwt:Audience"] ?? "PiiScannerUsers";
        var jwtExpiration = int.Parse(_config["Jwt:ExpirationHours"] ?? "8");

        var claims = new[]
        {
            new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),
            new Claim(ClaimTypes.Name, user.Username),
            new Claim(ClaimTypes.Email, user.Email),
            new Claim(ClaimTypes.Role, user.Role),
            new Claim("FullName", user.FullName)
        };

        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtSecret));
        var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

        var token = new JwtSecurityToken(
            issuer: jwtIssuer,
            audience: jwtAudience,
            claims: claims,
            expires: DateTime.UtcNow.AddHours(jwtExpiration),
            signingCredentials: creds
        );

        return new JwtSecurityTokenHandler().WriteToken(token);
    }

    private string GenerateRefreshToken()
    {
        var randomNumber = new byte[32];
        using var rng = RandomNumberGenerator.Create();
        rng.GetBytes(randomNumber);
        return Convert.ToBase64String(randomNumber);
    }

    private async Task LogAudit(int? userId, string action, string entityType, string entityId, string ipAddress, string? details = null)
    {
        await _db.AuditLogs.AddAsync(new AuditLog
        {
            UserId = userId,
            Action = action,
            EntityType = entityType,
            EntityId = entityId,
            IpAddress = ipAddress,
            Details = details,
            CreatedAt = DateTime.UtcNow
        });

        await _db.SaveChangesAsync();
    }
}

public class AuthResult
{
    public bool Success { get; set; }
    public string? Token { get; set; }
    public string? RefreshToken { get; set; }
    public UserDto? User { get; set; }
    public string? Error { get; set; }
}

public class UserDto
{
    public int Id { get; set; }
    public string Username { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string FullName { get; set; } = string.Empty;
    public string Role { get; set; } = string.Empty;
}
