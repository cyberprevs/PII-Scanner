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

// Add Session support (required for CSRF protection)
builder.Services.AddDistributedMemoryCache(); // Required for session
builder.Services.AddSession(options =>
{
    options.IdleTimeout = TimeSpan.FromMinutes(30); // Session timeout
    options.Cookie.HttpOnly = true; // Security: JavaScript cannot access session cookie
    options.Cookie.IsEssential = true; // Required for GDPR compliance
    options.Cookie.SecurePolicy = CookieSecurePolicy.Always; // HTTPS only
});

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

// SÉCURITÉ CRITIQUE: Vérifier que le secret JWT par défaut n'est pas utilisé en production
const string DEFAULT_SECRET = "DEFAULT_DEV_SECRET_DO_NOT_USE_IN_PRODUCTION_CHANGE_THIS_FOR_PRODUCTION_USE_ONLY";
if (jwtSecret == DEFAULT_SECRET && !builder.Environment.IsDevelopment())
{
    throw new InvalidOperationException(
        "ERREUR DE SÉCURITÉ CRITIQUE: Le secret JWT par défaut est utilisé en production! " +
        "Vous DEVEZ configurer un secret JWT unique dans appsettings.Production.json ou via variable d'environnement 'Jwt__Secret'. " +
        "Générez un secret sécurisé avec: openssl rand -base64 64");
}

if (jwtSecret == DEFAULT_SECRET && builder.Environment.IsDevelopment())
{
    logger.LogWarning(
        "⚠️  AVERTISSEMENT: Utilisation du secret JWT par défaut en mode développement. " +
        "Ceci est INTERDIT en production. Changez le secret avant le déploiement!");
}

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

// Add CORS - Actif en développement pour Vite dev server (port 3000)
// En production, React est servi depuis wwwroot/ donc CORS n'est pas nécessaire
if (builder.Environment.IsDevelopment())
{
    builder.Services.AddCors(options =>
    {
        options.AddPolicy("DevCorsPolicy", policy =>
        {
            policy.WithOrigins(
                "http://localhost:3000",
                "http://127.0.0.1:3000",
                "https://localhost:5173",
                "http://localhost:5173"
            )
            .AllowAnyHeader()
            .AllowAnyMethod()
            .AllowCredentials();
        });
    });
}

// Add custom services
builder.Services.AddSingleton<ScanService>();
builder.Services.AddScoped<AuthService>();

// Add background services
builder.Services.AddHostedService<SessionCleanupService>();

// Add Health Checks
builder.Services.AddHealthChecks()
    .AddCheck("api", () => Microsoft.Extensions.Diagnostics.HealthChecks.HealthCheckResult.Healthy("API is running"));

var app = builder.Build();

// Créer la base de données automatiquement au démarrage
using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
    db.Database.EnsureCreated();
}

// Configure the HTTP request pipeline

// SÉCURITÉ: Exception handling - Premier middleware pour capter toutes les exceptions
app.UseExceptionHandling();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

// SÉCURITÉ: HTTPS Redirection - Forcer HTTPS pour toutes les requêtes
app.UseHttpsRedirection();

// CORS en développement uniquement (pour Vite dev server)
if (app.Environment.IsDevelopment())
{
    app.UseCors("DevCorsPolicy");
}

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

    // Content Security Policy: Protection contre XSS et injection de contenu
    // Adapté pour React SPA avec Material-UI inline styles
    var cspPolicy = "default-src 'self'; " +
                    "script-src 'self'; " +
                    "style-src 'self' 'unsafe-inline'; " +  // Material-UI nécessite inline styles
                    "img-src 'self' data: https:; " +       // Images locales + data URIs + HTTPS externe
                    "font-src 'self' data:; " +              // Fonts locales + data URIs
                    "connect-src 'self' https://localhost:5001 wss://localhost:5001 ws://localhost:5001; " +  // API + SignalR WebSocket
                    "frame-ancestors 'none'; " +             // Équivalent moderne de X-Frame-Options DENY
                    "base-uri 'self'; " +                    // Empêche modification de <base>
                    "form-action 'self'; " +                 // Soumission formulaires seulement vers origin
                    "upgrade-insecure-requests;";            // Force HTTPS pour toutes les ressources

    context.Response.Headers["Content-Security-Policy"] = cspPolicy;

    // HSTS: Force HTTPS pendant 1 an (seulement en production)
    if (context.Request.IsHttps || !app.Environment.IsDevelopment())
    {
        context.Response.Headers["Strict-Transport-Security"] = "max-age=31536000; includeSubDomains";
    }

    await next();
});

// Servir les fichiers statiques React (dist folder)
app.UseDefaultFiles(); // Sert index.html automatiquement
app.UseStaticFiles();  // Sert tous les fichiers statiques

// Plus besoin de CORS
// app.UseCors("AllowElectron");

// IMPORTANT: Session doit être activée AVANT CSRF (CSRF utilise les sessions)
app.UseSession();

// SÉCURITÉ: Rate Limiting - Doit être avant l'authentification
app.UseRateLimiting();

// SÉCURITÉ: Protection CSRF - Après Session, avant authentification
app.UseCsrfProtection();

app.UseAuthentication();
app.UseAuthorization();

// SÉCURITÉ: Validation de session - Après authentification, avant contrôleurs
app.UseSessionValidation();

app.MapControllers();

// Map SignalR Hub
app.MapHub<ScanHub>("/scanhub");

// Map Health Checks
app.MapHealthChecks("/health");
app.MapHealthChecks("/health/ready");

// Fallback pour React Router - Toutes les routes non-API redirigent vers index.html
app.MapFallbackToFile("index.html");

app.Run();
