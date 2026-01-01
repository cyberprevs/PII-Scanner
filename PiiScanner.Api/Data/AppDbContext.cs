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
    public DbSet<UserSettings> UserSettings { get; set; }

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

        modelBuilder.Entity<UserSettings>()
            .HasIndex(us => us.UserId)
            .IsUnique();

        // Seed: Créer les paramètres par défaut (pas de compte admin par défaut)
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
