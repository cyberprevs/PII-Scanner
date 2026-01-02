using System.ComponentModel.DataAnnotations;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using PiiScanner.Api.Data;
using PiiScanner.Api.Models;
using PiiScanner.Api.Attributes;

namespace PiiScanner.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize(Roles = Roles.Admin)]
public class UsersController : ControllerBase
{
    private readonly AppDbContext _db;

    public UsersController(AppDbContext db)
    {
        _db = db;
    }

    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var users = await _db.Users
            .OrderBy(u => u.Id)
            .Select(u => new
            {
                u.Id,
                u.Username,
                u.Email,
                u.FullName,
                u.Role,
                u.IsActive,
                u.CreatedAt,
                u.LastLoginAt
            })
            .ToListAsync();

        return Ok(users);
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetById(int id)
    {
        var user = await _db.Users.FindAsync(id);
        if (user == null)
        {
            return NotFound(new { error = "Utilisateur introuvable" });
        }

        return Ok(new
        {
            user.Id,
            user.Username,
            user.Email,
            user.FullName,
            user.Role,
            user.IsActive,
            user.CreatedAt,
            user.LastLoginAt
        });
    }

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreateUserRequest request)
    {
        // Vérifier si l'username ou l'email existe déjà
        if (await _db.Users.AnyAsync(u => u.Username == request.Username))
        {
            return BadRequest(new { error = "Ce nom d'utilisateur existe déjà" });
        }

        if (await _db.Users.AnyAsync(u => u.Email == request.Email))
        {
            return BadRequest(new { error = "Cet email existe déjà" });
        }

        // Valider le rôle
        if (request.Role != Roles.Admin && request.Role != Roles.Operator)
        {
            return BadRequest(new { error = "Rôle invalide. Doit être Admin ou Operator" });
        }

        var currentUserId = int.Parse(User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value ?? "0");

        var user = new User
        {
            Username = request.Username,
            Email = request.Email,
            PasswordHash = BCrypt.Net.BCrypt.HashPassword(request.Password),
            FullName = request.FullName,
            Role = request.Role,
            IsActive = true,
            CreatedAt = DateTime.UtcNow,
            CreatedBy = currentUserId
        };

        await _db.Users.AddAsync(user);
        await _db.SaveChangesAsync();

        // Log audit
        await _db.AuditLogs.AddAsync(new AuditLog
        {
            UserId = currentUserId,
            Action = "CreateUser",
            EntityType = "User",
            EntityId = user.Id.ToString(),
            IpAddress = HttpContext.Connection.RemoteIpAddress?.ToString() ?? "unknown",
            Details = $"Créé utilisateur: {user.Username} ({user.Role})"
        });
        await _db.SaveChangesAsync();

        return CreatedAtAction(nameof(GetById), new { id = user.Id }, new
        {
            user.Id,
            user.Username,
            user.Email,
            user.FullName,
            user.Role,
            user.IsActive
        });
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> Update(int id, [FromBody] UpdateUserRequest request)
    {
        var user = await _db.Users.FindAsync(id);
        if (user == null)
        {
            return NotFound(new { error = "Utilisateur introuvable" });
        }

        // Empêcher la modification du compte admin par défaut
        if (user.Id == 1)
        {
            return BadRequest(new { error = "Le compte admin par défaut ne peut pas être modifié" });
        }

        // Vérifier les doublons si username/email changent
        if (request.Username != user.Username && await _db.Users.AnyAsync(u => u.Username == request.Username))
        {
            return BadRequest(new { error = "Ce nom d'utilisateur existe déjà" });
        }

        if (request.Email != user.Email && await _db.Users.AnyAsync(u => u.Email == request.Email))
        {
            return BadRequest(new { error = "Cet email existe déjà" });
        }

        // Valider le rôle
        if (request.Role != Roles.Admin && request.Role != Roles.Operator)
        {
            return BadRequest(new { error = "Rôle invalide. Doit être Admin ou Operator" });
        }

        user.Username = request.Username;
        user.Email = request.Email;
        user.FullName = request.FullName;
        user.Role = request.Role;
        user.IsActive = request.IsActive;

        if (!string.IsNullOrEmpty(request.Password))
        {
            user.PasswordHash = BCrypt.Net.BCrypt.HashPassword(request.Password);
        }

        await _db.SaveChangesAsync();

        var currentUserId = int.Parse(User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value ?? "0");
        await _db.AuditLogs.AddAsync(new AuditLog
        {
            UserId = currentUserId,
            Action = "UpdateUser",
            EntityType = "User",
            EntityId = user.Id.ToString(),
            IpAddress = HttpContext.Connection.RemoteIpAddress?.ToString() ?? "unknown",
            Details = $"Modifié utilisateur: {user.Username}"
        });
        await _db.SaveChangesAsync();

        return Ok(new
        {
            user.Id,
            user.Username,
            user.Email,
            user.FullName,
            user.Role,
            user.IsActive
        });
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(int id)
    {
        var user = await _db.Users.FindAsync(id);
        if (user == null)
        {
            return NotFound(new { error = "Utilisateur introuvable" });
        }

        // Empêcher la suppression du compte admin par défaut
        if (user.Id == 1)
        {
            return BadRequest(new { error = "Le compte admin par défaut ne peut pas être supprimé" });
        }

        // Empêcher l'auto-suppression
        var currentUserId = int.Parse(User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value ?? "0");
        if (user.Id == currentUserId)
        {
            return BadRequest(new { error = "Vous ne pouvez pas supprimer votre propre compte" });
        }

        _db.Users.Remove(user);
        await _db.SaveChangesAsync();

        await _db.AuditLogs.AddAsync(new AuditLog
        {
            UserId = currentUserId,
            Action = "DeleteUser",
            EntityType = "User",
            EntityId = user.Id.ToString(),
            IpAddress = HttpContext.Connection.RemoteIpAddress?.ToString() ?? "unknown",
            Details = $"Supprimé utilisateur: {user.Username}"
        });
        await _db.SaveChangesAsync();

        return Ok(new { message = "Utilisateur supprimé avec succès" });
    }

    /// <summary>
    /// Changer le mot de passe (accessible à tous les utilisateurs authentifiés)
    /// </summary>
    [HttpPut("change-password")]
    [Authorize] // Tout utilisateur authentifié peut changer son propre mot de passe
    public async Task<IActionResult> ChangePassword([FromBody] ChangePasswordRequest request)
    {
        var userId = int.Parse(User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value ?? "0");
        var user = await _db.Users.FindAsync(userId);

        if (user == null)
        {
            return NotFound(new { error = "Utilisateur introuvable" });
        }

        // Vérifier l'ancien mot de passe
        if (!BCrypt.Net.BCrypt.Verify(request.CurrentPassword, user.PasswordHash))
        {
            return BadRequest(new { error = "Mot de passe actuel incorrect" });
        }

        // Mettre à jour le mot de passe
        user.PasswordHash = BCrypt.Net.BCrypt.HashPassword(request.NewPassword);
        await _db.SaveChangesAsync();

        // Log audit
        await _db.AuditLogs.AddAsync(new AuditLog
        {
            UserId = userId,
            Action = "ChangePassword",
            EntityType = "User",
            EntityId = userId.ToString(),
            IpAddress = HttpContext.Connection.RemoteIpAddress?.ToString() ?? "unknown",
            Details = "Mot de passe modifié"
        });
        await _db.SaveChangesAsync();

        return Ok(new { message = "Mot de passe modifié avec succès" });
    }

    /// <summary>
    /// Mettre à jour le profil utilisateur (email, nom complet)
    /// </summary>
    [HttpPut("profile")]
    [Authorize]
    public async Task<IActionResult> UpdateProfile([FromBody] UpdateProfileRequest request)
    {
        var userId = int.Parse(User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value ?? "0");
        var user = await _db.Users.FindAsync(userId);

        if (user == null)
        {
            return NotFound(new { error = "Utilisateur introuvable" });
        }

        // Vérifier les doublons d'email
        if (request.Email != user.Email && await _db.Users.AnyAsync(u => u.Email == request.Email))
        {
            return BadRequest(new { error = "Cet email existe déjà" });
        }

        user.Email = request.Email;
        user.FullName = request.FullName;
        await _db.SaveChangesAsync();

        // Log audit
        await _db.AuditLogs.AddAsync(new AuditLog
        {
            UserId = userId,
            Action = "UpdateProfile",
            EntityType = "User",
            EntityId = userId.ToString(),
            IpAddress = HttpContext.Connection.RemoteIpAddress?.ToString() ?? "unknown",
            Details = "Profil mis à jour"
        });
        await _db.SaveChangesAsync();

        return Ok(new
        {
            user.Id,
            user.Username,
            user.Email,
            user.FullName,
            user.Role
        });
    }
}

public class CreateUserRequest
{
    [Required(ErrorMessage = "Le nom d'utilisateur est requis")]
    [StringLength(50, MinimumLength = 3, ErrorMessage = "Le nom d'utilisateur doit contenir entre 3 et 50 caractères")]
    public string Username { get; set; } = string.Empty;

    [Required(ErrorMessage = "L'email est requis")]
    [EmailAddress(ErrorMessage = "Format d'email invalide")]
    public string Email { get; set; } = string.Empty;

    [Required(ErrorMessage = "Le mot de passe est requis")]
    [StrongPassword]
    public string Password { get; set; } = string.Empty;

    [Required(ErrorMessage = "Le nom complet est requis")]
    [StringLength(100, MinimumLength = 2, ErrorMessage = "Le nom complet doit contenir entre 2 et 100 caractères")]
    public string FullName { get; set; } = string.Empty;

    [Required(ErrorMessage = "Le rôle est requis")]
    public string Role { get; set; } = Roles.Operator;
}

public class UpdateUserRequest
{
    [Required(ErrorMessage = "Le nom d'utilisateur est requis")]
    [StringLength(50, MinimumLength = 3, ErrorMessage = "Le nom d'utilisateur doit contenir entre 3 et 50 caractères")]
    public string Username { get; set; } = string.Empty;

    [Required(ErrorMessage = "L'email est requis")]
    [EmailAddress(ErrorMessage = "Format d'email invalide")]
    public string Email { get; set; } = string.Empty;

    [StrongPassword]
    public string? Password { get; set; }

    [Required(ErrorMessage = "Le nom complet est requis")]
    [StringLength(100, MinimumLength = 2, ErrorMessage = "Le nom complet doit contenir entre 2 et 100 caractères")]
    public string FullName { get; set; } = string.Empty;

    [Required(ErrorMessage = "Le rôle est requis")]
    public string Role { get; set; } = Roles.Operator;

    public bool IsActive { get; set; } = true;
}

public class ChangePasswordRequest
{
    [Required(ErrorMessage = "Le mot de passe actuel est requis")]
    public string CurrentPassword { get; set; } = string.Empty;

    [Required(ErrorMessage = "Le nouveau mot de passe est requis")]
    [StrongPassword]
    public string NewPassword { get; set; } = string.Empty;
}

public class UpdateProfileRequest
{
    [Required(ErrorMessage = "L'email est requis")]
    [EmailAddress(ErrorMessage = "Format d'email invalide")]
    public string Email { get; set; } = string.Empty;

    [Required(ErrorMessage = "Le nom complet est requis")]
    [StringLength(100, MinimumLength = 2, ErrorMessage = "Le nom complet doit contenir entre 2 et 100 caractères")]
    public string FullName { get; set; } = string.Empty;
}
