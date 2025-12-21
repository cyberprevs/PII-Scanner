using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using PiiScanner.Api.Data;
using PiiScanner.Api.Models;
using System.ComponentModel.DataAnnotations;

namespace PiiScanner.Api.Controllers;

/// <summary>
/// Controller pour gérer l'initialisation de l'application au premier démarrage
/// </summary>
[ApiController]
[Route("api/[controller]")]
public class InitializationController : ControllerBase
{
    private readonly AppDbContext _context;
    private readonly ILogger<InitializationController> _logger;

    public InitializationController(AppDbContext context, ILogger<InitializationController> logger)
    {
        _context = context;
        _logger = logger;
    }

    /// <summary>
    /// Vérifie si l'application a été initialisée (si un compte admin existe)
    /// </summary>
    [HttpGet("status")]
    public async Task<ActionResult<InitializationStatusResponse>> GetInitializationStatus()
    {
        try
        {
            // Vérifier si au moins un utilisateur existe
            var hasUsers = await _context.Users.AnyAsync();

            return Ok(new InitializationStatusResponse
            {
                IsInitialized = hasUsers,
                Message = hasUsers
                    ? "L'application est déjà initialisée"
                    : "L'application n'est pas encore initialisée"
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Erreur lors de la vérification du statut d'initialisation");
            return StatusCode(500, new { message = "Erreur lors de la vérification du statut" });
        }
    }

    /// <summary>
    /// Initialise l'application en créant le premier compte administrateur
    /// </summary>
    [HttpPost("setup")]
    public async Task<ActionResult<InitializationResponse>> InitializeApplication([FromBody] InitializationRequest request)
    {
        try
        {
            // Vérifier si l'application est déjà initialisée
            var hasUsers = await _context.Users.AnyAsync();
            if (hasUsers)
            {
                return BadRequest(new { message = "L'application est déjà initialisée" });
            }

            // Créer le compte administrateur
            var adminUser = new User
            {
                Username = request.Username,
                Email = request.Email,
                PasswordHash = BCrypt.Net.BCrypt.HashPassword(request.Password),
                FullName = request.FullName,
                Role = Roles.Admin,
                IsActive = true,
                CreatedAt = DateTime.UtcNow,
                CreatedBy = null // Premier utilisateur
            };

            _context.Users.Add(adminUser);
            await _context.SaveChangesAsync();

            _logger.LogInformation($"Application initialisée avec le compte administrateur: {adminUser.Username}");

            return Ok(new InitializationResponse
            {
                Success = true,
                Message = "Application initialisée avec succès",
                AdminUsername = adminUser.Username
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Erreur lors de l'initialisation de l'application");
            return StatusCode(500, new { message = "Erreur lors de l'initialisation de l'application" });
        }
    }
}

// DTOs
public class InitializationStatusResponse
{
    public bool IsInitialized { get; set; }
    public string Message { get; set; } = string.Empty;
}

public class InitializationRequest
{
    [Required(ErrorMessage = "Le nom d'utilisateur est requis")]
    [StringLength(50, MinimumLength = 3, ErrorMessage = "Le nom d'utilisateur doit contenir entre 3 et 50 caractères")]
    public string Username { get; set; } = string.Empty;

    [Required(ErrorMessage = "L'email est requis")]
    [EmailAddress(ErrorMessage = "Format d'email invalide")]
    public string Email { get; set; } = string.Empty;

    [Required(ErrorMessage = "Le nom complet est requis")]
    [StringLength(100, ErrorMessage = "Le nom complet ne peut pas dépasser 100 caractères")]
    public string FullName { get; set; } = string.Empty;

    [Required(ErrorMessage = "Le mot de passe est requis")]
    [StringLength(100, MinimumLength = 8, ErrorMessage = "Le mot de passe doit contenir au moins 8 caractères")]
    public string Password { get; set; } = string.Empty;

    [Required(ErrorMessage = "La confirmation du mot de passe est requise")]
    [Compare("Password", ErrorMessage = "Les mots de passe ne correspondent pas")]
    public string ConfirmPassword { get; set; } = string.Empty;
}

public class InitializationResponse
{
    public bool Success { get; set; }
    public string Message { get; set; } = string.Empty;
    public string AdminUsername { get; set; } = string.Empty;
}
