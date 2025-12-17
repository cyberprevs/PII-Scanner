using Microsoft.EntityFrameworkCore;
using PiiScanner.Api.Models;

namespace PiiScanner.Api.Data;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options)
    {
    }

    public DbSet<User> Users { get; set; }
    public DbSet<Session> Sessions { get; set; }
    public DbSet<ScanRecord> Scans { get; set; }
    public DbSet<AuditLog> AuditLogs { get; set; }
    public DbSet<AppSettings> AppSettings { get; set; }
    public DbSet<ScheduledScan> ScheduledScans { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // Configuration des index
        modelBuilder.Entity<User>()
            .HasIndex(u => u.Username)
            .IsUnique();

        modelBuilder.Entity<User>()
            .HasIndex(u => u.Email)
            .IsUnique();

        modelBuilder.Entity<Session>()
            .HasIndex(s => s.RefreshToken);

        modelBuilder.Entity<ScanRecord>()
            .HasIndex(s => s.ScanId)
            .IsUnique();

        modelBuilder.Entity<ScanRecord>()
            .HasIndex(s => s.UserId);

        modelBuilder.Entity<AuditLog>()
            .HasIndex(a => a.UserId);

        modelBuilder.Entity<AuditLog>()
            .HasIndex(a => a.CreatedAt);

        // Seed: Créer un compte admin par défaut
        modelBuilder.Entity<User>().HasData(new User
        {
            Id = 1,
            Username = "admin",
            Email = "admin@piiscanner.local",
            PasswordHash = BCrypt.Net.BCrypt.HashPassword("Admin@123"), // Mot de passe par défaut
            FullName = "Administrateur Système",
            Role = Roles.Admin,
            IsActive = true,
            CreatedAt = DateTime.UtcNow
        });

        // Seed: Créer les paramètres par défaut
        modelBuilder.Entity<AppSettings>().HasData(new AppSettings
        {
            Id = 1,
            DataRetentionDays = 90,
            AuditLogRetentionDays = 365,
            SessionRetentionDays = 7,
            AutoBackupEnabled = false,
            AutoBackupIntervalHours = 24,
            UpdatedAt = DateTime.UtcNow
        });
    }
}
