using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using PiiScanner.Api.Services;

namespace PiiScanner.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly AuthService _authService;

    public AuthController(AuthService authService)
    {
        _authService = authService;
    }

    [HttpPost("login")]
    public async Task<IActionResult> Login([FromBody] LoginRequest request)
    {
        var ipAddress = HttpContext.Connection.RemoteIpAddress?.ToString() ?? "unknown";
        var result = await _authService.Login(request.Username, request.Password, ipAddress);

        if (!result.Success)
        {
            return Unauthorized(new { error = result.Error });
        }

        return Ok(new
        {
            token = result.Token,
            refreshToken = result.RefreshToken,
            user = result.User
        });
    }

    [HttpPost("logout")]
    [Authorize]
    public async Task<IActionResult> Logout([FromBody] LogoutRequest request)
    {
        await _authService.Logout(request.RefreshToken);
        return Ok(new { message = "Déconnexion réussie" });
    }

    [HttpPost("refresh")]
    public async Task<IActionResult> RefreshToken([FromBody] RefreshTokenRequest request)
    {
        var ipAddress = HttpContext.Connection.RemoteIpAddress?.ToString() ?? "unknown";
        var result = await _authService.RefreshToken(request.RefreshToken, ipAddress);

        if (!result.Success)
        {
            return Unauthorized(new { error = result.Error });
        }

        return Ok(new
        {
            token = result.Token,
            refreshToken = result.RefreshToken,
            user = result.User
        });
    }

    [HttpGet("me")]
    [Authorize]
    public IActionResult GetCurrentUser()
    {
        var userId = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
        var username = User.FindFirst(System.Security.Claims.ClaimTypes.Name)?.Value;
        var email = User.FindFirst(System.Security.Claims.ClaimTypes.Email)?.Value;
        var role = User.FindFirst(System.Security.Claims.ClaimTypes.Role)?.Value;
        var fullName = User.FindFirst("FullName")?.Value;

        return Ok(new
        {
            id = userId,
            username,
            email,
            fullName,
            role
        });
    }
}

public class LoginRequest
{
    public string Username { get; set; } = string.Empty;
    public string Password { get; set; } = string.Empty;
}

public class LogoutRequest
{
    public string RefreshToken { get; set; } = string.Empty;
}

public class RefreshTokenRequest
{
    public string RefreshToken { get; set; } = string.Empty;
}
