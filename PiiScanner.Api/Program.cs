using System.Text;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using PiiScanner.Api.Data;
using PiiScanner.Api.Hubs;
using PiiScanner.Api.Services;
using PiiScanner.Api.Middleware;

// SÉCURITÉ: Initialiser SQLCipher pour le chiffrement de la base de données
SQLitePCL.Batteries_V2.Init();
SQLitePCL.raw.SetProvider(new SQLitePCL.SQLite3Provider_e_sqlcipher());

var builder = WebApplication.CreateBuilder(args);

// Configure Kestrel to use HTTPS by default
builder.WebHost.ConfigureKestrel(serverOptions =>
{
    serverOptions.ListenLocalhost(5001, listenOptions =>
    {
        listenOptions.UseHttps();
    });
    serverOptions.ListenLocalhost(5000);
});

// Add services to the container
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// Add Database Encryption Service
builder.Services.AddSingleton<DatabaseEncryptionService>();

// Add Database avec chiffrement SQLCipher
var baseConnectionString = builder.Configuration.GetConnectionString("DefaultConnection")
    ?? throw new InvalidOperationException("Connection string not configured");

// Créer un logger temporaire pour l'initialisation
using var loggerFactory = LoggerFactory.Create(logging => logging.AddConsole());
var logger = loggerFactory.CreateLogger<DatabaseEncryptionService>();
var encryptionService = new DatabaseEncryptionService(logger, builder.Configuration);
var encryptedConnectionString = encryptionService.GetEncryptedConnectionString(baseConnectionString);

builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseSqlite(encryptedConnectionString));

// Add JWT Authentication
var jwtSecret = builder.Configuration["Jwt:Secret"] ?? throw new InvalidOperationException("JWT Secret not configured");
var jwtIssuer = builder.Configuration["Jwt:Issuer"];
var jwtAudience = builder.Configuration["Jwt:Audience"];

builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,
            ValidIssuer = jwtIssuer,
            ValidAudience = jwtAudience,
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtSecret))
        };
    });

// Add SignalR
builder.Services.AddSignalR();

// Add CORS pour permettre Electron de se connecter (HTTP et HTTPS)
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowElectron", policy =>
    {
        policy.WithOrigins(
                // Origines HTTP (développement)
                "http://localhost:3000",
                "http://localhost:5173",
                "http://localhost:5174",
                "http://localhost:5175",
                // Origines HTTPS (sécurisé)
                "https://localhost:3000",
                "https://localhost:5173",
                "https://localhost:5174",
                "https://localhost:5175"
              )
              .AllowAnyMethod()
              .AllowAnyHeader()
              .AllowCredentials();
    });
});

// Add custom services
builder.Services.AddSingleton<ScanService>();
builder.Services.AddScoped<AuthService>();

var app = builder.Build();

// Créer la base de données automatiquement au démarrage
using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
    db.Database.EnsureCreated();
}

// Configure the HTTP request pipeline
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

// SÉCURITÉ: HTTPS Redirection - Forcer HTTPS pour toutes les requêtes
app.UseHttpsRedirection();

// SÉCURITÉ: Headers de sécurité HTTP
app.Use(async (context, next) =>
{
    // Empêche l'interprétation MIME incorrecte
    context.Response.Headers["X-Content-Type-Options"] = "nosniff";

    // Empêche l'affichage dans une iframe (protection clickjacking)
    context.Response.Headers["X-Frame-Options"] = "DENY";

    // Active la protection XSS du navigateur
    context.Response.Headers["X-XSS-Protection"] = "1; mode=block";

    // Désactive les fonctionnalités dangereuses
    context.Response.Headers["Permissions-Policy"] = "geolocation=(), microphone=(), camera=()";

    // HSTS: Force HTTPS pendant 1 an (seulement en production)
    if (context.Request.IsHttps || !app.Environment.IsDevelopment())
    {
        context.Response.Headers["Strict-Transport-Security"] = "max-age=31536000; includeSubDomains";
    }

    await next();
});

app.UseCors("AllowElectron");

// SÉCURITÉ: Rate Limiting - Doit être avant l'authentification
app.UseRateLimiting();

// SÉCURITÉ: Protection CSRF - Après CORS, avant authentification
app.UseCsrfProtection();

app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

// Map SignalR Hub
app.MapHub<ScanHub>("/scanhub").RequireCors("AllowElectron");

app.Run();
