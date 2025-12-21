using PiiScanner.Api.Models;

namespace PiiScanner.Api.Services;

public class SchedulerService
{
    /// <summary>
    /// Calcule la prochaine date d'exécution d'un scan planifié
    /// </summary>
    public DateTime CalculateNextRunAt(ScheduledScan schedule, DateTime fromDate)
    {
        var nextRun = fromDate;

        switch (schedule.Frequency)
        {
            case ScanFrequency.Daily:
                nextRun = GetNextDailyRun(fromDate, schedule.HourOfDay);
                break;

            case ScanFrequency.Weekly:
                if (schedule.DayOfWeek.HasValue)
                {
                    nextRun = GetNextWeeklyRun(fromDate, schedule.DayOfWeek.Value, schedule.HourOfDay);
                }
                break;

            case ScanFrequency.Monthly:
                if (schedule.DayOfMonth.HasValue)
                {
                    nextRun = GetNextMonthlyRun(fromDate, schedule.DayOfMonth.Value, schedule.HourOfDay);
                }
                break;

            case ScanFrequency.Quarterly:
                if (schedule.DayOfMonth.HasValue)
                {
                    nextRun = GetNextQuarterlyRun(fromDate, schedule.DayOfMonth.Value, schedule.HourOfDay);
                }
                break;
        }

        return nextRun;
    }

    /// <summary>
    /// Vérifie si un scan planifié doit être exécuté maintenant
    /// </summary>
    public bool ShouldRunNow(ScheduledScan schedule, DateTime currentTime)
    {
        if (!schedule.IsActive)
            return false;

        if (!schedule.NextRunAt.HasValue)
            return false;

        // Le scan doit être exécuté si NextRunAt est dans le passé ou maintenant
        return schedule.NextRunAt.Value <= currentTime;
    }

    /// <summary>
    /// Calcule la prochaine exécution quotidienne
    /// </summary>
    private DateTime GetNextDailyRun(DateTime fromDate, int hourOfDay)
    {
        var nextRun = new DateTime(fromDate.Year, fromDate.Month, fromDate.Day, hourOfDay, 0, 0, DateTimeKind.Utc);

        // Si l'heure est déjà passée aujourd'hui, prendre demain
        if (nextRun <= fromDate)
        {
            nextRun = nextRun.AddDays(1);
        }

        return nextRun;
    }

    /// <summary>
    /// Calcule la prochaine exécution hebdomadaire
    /// </summary>
    private DateTime GetNextWeeklyRun(DateTime fromDate, int dayOfWeek, int hourOfDay)
    {
        var targetDayOfWeek = (DayOfWeek)dayOfWeek;
        var daysUntilTarget = ((int)targetDayOfWeek - (int)fromDate.DayOfWeek + 7) % 7;

        var nextRun = fromDate.Date.AddDays(daysUntilTarget);
        nextRun = new DateTime(nextRun.Year, nextRun.Month, nextRun.Day, hourOfDay, 0, 0, DateTimeKind.Utc);

        // Si c'est aujourd'hui mais l'heure est passée, prendre la semaine prochaine
        if (nextRun <= fromDate)
        {
            nextRun = nextRun.AddDays(7);
        }

        return nextRun;
    }

    /// <summary>
    /// Calcule la prochaine exécution mensuelle
    /// </summary>
    private DateTime GetNextMonthlyRun(DateTime fromDate, int dayOfMonth, int hourOfDay)
    {
        // Limiter le jour du mois à 28 pour éviter les problèmes avec février
        dayOfMonth = Math.Min(dayOfMonth, 28);

        var year = fromDate.Year;
        var month = fromDate.Month;

        var nextRun = new DateTime(year, month, dayOfMonth, hourOfDay, 0, 0, DateTimeKind.Utc);

        // Si la date est déjà passée ce mois-ci, prendre le mois prochain
        if (nextRun <= fromDate)
        {
            month++;
            if (month > 12)
            {
                month = 1;
                year++;
            }
            nextRun = new DateTime(year, month, dayOfMonth, hourOfDay, 0, 0, DateTimeKind.Utc);
        }

        return nextRun;
    }

    /// <summary>
    /// Calcule la prochaine exécution trimestrielle (tous les 3 mois)
    /// </summary>
    private DateTime GetNextQuarterlyRun(DateTime fromDate, int dayOfMonth, int hourOfDay)
    {
        // Limiter le jour du mois à 28
        dayOfMonth = Math.Min(dayOfMonth, 28);

        var year = fromDate.Year;
        var month = fromDate.Month;

        var nextRun = new DateTime(year, month, dayOfMonth, hourOfDay, 0, 0, DateTimeKind.Utc);

        // Si la date est déjà passée, passer au prochain trimestre
        if (nextRun <= fromDate)
        {
            month += 3;
            while (month > 12)
            {
                month -= 12;
                year++;
            }
            nextRun = new DateTime(year, month, dayOfMonth, hourOfDay, 0, 0, DateTimeKind.Utc);
        }

        return nextRun;
    }

    /// <summary>
    /// Initialise NextRunAt pour un nouveau scan planifié
    /// </summary>
    public void InitializeNextRunAt(ScheduledScan schedule)
    {
        schedule.NextRunAt = CalculateNextRunAt(schedule, DateTime.UtcNow);
    }

    /// <summary>
    /// Met à jour les dates après l'exécution d'un scan
    /// </summary>
    public void UpdateAfterExecution(ScheduledScan schedule, string scanId)
    {
        schedule.LastRunAt = DateTime.UtcNow;
        schedule.LastScanId = scanId;
        schedule.NextRunAt = CalculateNextRunAt(schedule, DateTime.UtcNow);
    }
}
