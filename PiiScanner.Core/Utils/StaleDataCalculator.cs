namespace PiiScanner.Utils;

public static class StaleDataCalculator
{
    public enum StalenessLevel
    {
        Recent,          // < 6 mois
        SixMonths,       // 6 mois - 1 an
        OneYear,         // 1 an - 3 ans
        ThreeYears,      // 3 ans - 5 ans
        FiveYears        // > 5 ans
    }

    public static StalenessLevel GetStalenessLevel(DateTime? lastAccessedDate)
    {
        if (lastAccessedDate == null)
            return StalenessLevel.Recent;

        var daysSinceAccess = (DateTime.Now - lastAccessedDate.Value).TotalDays;

        if (daysSinceAccess < 180) // 6 mois
            return StalenessLevel.Recent;
        else if (daysSinceAccess < 365) // 1 an
            return StalenessLevel.SixMonths;
        else if (daysSinceAccess < 1095) // 3 ans
            return StalenessLevel.OneYear;
        else if (daysSinceAccess < 1825) // 5 ans
            return StalenessLevel.ThreeYears;
        else
            return StalenessLevel.FiveYears;
    }

    public static string GetStaleDataMessage(int piiCount, DateTime? lastAccessedDate, string language = "fr")
    {
        if (lastAccessedDate == null)
            return "";

        var level = GetStalenessLevel(lastAccessedDate);
        if (level == StalenessLevel.Recent)
            return "";

        var timeSinceAccess = DateTime.Now - lastAccessedDate.Value;
        var years = (int)(timeSinceAccess.TotalDays / 365);
        var months = (int)(timeSinceAccess.TotalDays / 30);

        if (language == "fr")
        {
            if (years >= 5)
                return $"⚠️ Ce fichier contient {piiCount} PII mais n'a pas été ouvert depuis plus de 5 ans";
            else if (years >= 3)
                return $"⚠️ Ce fichier contient {piiCount} PII mais n'a pas été ouvert depuis {years} ans";
            else if (years >= 1)
                return $"⚠️ Ce fichier contient {piiCount} PII mais n'a pas été ouvert depuis {years} an{(years > 1 ? "s" : "")}";
            else if (months >= 6)
                return $"⚠️ Ce fichier contient {piiCount} PII mais n'a pas été ouvert depuis {months} mois";
        }

        return "";
    }

    public static string GetStalenessLevelLabel(StalenessLevel level, string language = "fr")
    {
        if (language == "fr")
        {
            return level switch
            {
                StalenessLevel.Recent => "Récent",
                StalenessLevel.SixMonths => "6 mois",
                StalenessLevel.OneYear => "1 an",
                StalenessLevel.ThreeYears => "3 ans",
                StalenessLevel.FiveYears => "+5 ans",
                _ => "Inconnu"
            };
        }

        return level.ToString();
    }
}
