using System.Security.AccessControl;
using System.Security.Principal;

namespace PiiScanner.Utils;

public static class FilePermissionAnalyzer
{
    public enum ExposureLevel
    {
        Faible,      // Accès restreint, peu de groupes
        Moyen,       // Accès à plusieurs groupes (5-10)
        Élevé,       // Accès à beaucoup de groupes (10+) ou Authenticated Users
        Critique     // Accès à Everyone ou partage réseau public
    }

    public class PermissionInfo
    {
        public ExposureLevel ExposureLevel { get; set; }
        public bool AccessibleToEveryone { get; set; }
        public bool AccessibleToAuthenticatedUsers { get; set; }
        public bool IsNetworkShare { get; set; }
        public int UserGroupCount { get; set; }
        public string ExposureWarning { get; set; } = string.Empty;
    }

    public static PermissionInfo AnalyzeFilePermissions(string filePath)
    {
        var info = new PermissionInfo();

        try
        {
            // Vérifier si c'est un partage réseau
            info.IsNetworkShare = IsNetworkPath(filePath);

            // Analyser les permissions NTFS
            var fileInfo = new FileInfo(filePath);
            var fileSecurity = fileInfo.GetAccessControl();
            var accessRules = fileSecurity.GetAccessRules(true, true, typeof(NTAccount));

            var groups = new HashSet<string>();

            foreach (FileSystemAccessRule rule in accessRules)
            {
                if (rule.AccessControlType == AccessControlType.Allow)
                {
                    string identity = rule.IdentityReference.Value;
                    groups.Add(identity);

                    // Détecter "Everyone" (Tout le monde)
                    if (identity.Contains("Everyone", StringComparison.OrdinalIgnoreCase) ||
                        identity.Contains("Tout le monde", StringComparison.OrdinalIgnoreCase))
                    {
                        info.AccessibleToEveryone = true;
                    }

                    // Détecter "Authenticated Users" (Utilisateurs authentifiés)
                    if (identity.Contains("Authenticated Users", StringComparison.OrdinalIgnoreCase) ||
                        identity.Contains("Utilisateurs authentifiés", StringComparison.OrdinalIgnoreCase))
                    {
                        info.AccessibleToAuthenticatedUsers = true;
                    }
                }
            }

            info.UserGroupCount = groups.Count;

            // Calculer le niveau d'exposition
            info.ExposureLevel = CalculateExposureLevel(info);
        }
        catch
        {
            // Si impossible d'analyser les permissions, niveau faible par défaut
            info.ExposureLevel = ExposureLevel.Faible;
        }

        return info;
    }

    private static ExposureLevel CalculateExposureLevel(PermissionInfo info)
    {
        // CRITIQUE: Accessible à tout le monde
        if (info.AccessibleToEveryone)
            return ExposureLevel.Critique;

        // CRITIQUE: Partage réseau + beaucoup de groupes
        if (info.IsNetworkShare && info.UserGroupCount > 10)
            return ExposureLevel.Critique;

        // ÉLEVÉ: Authenticated Users ou beaucoup de groupes
        if (info.AccessibleToAuthenticatedUsers || info.UserGroupCount > 10)
            return ExposureLevel.Élevé;

        // MOYEN: Plusieurs groupes (5-10)
        if (info.UserGroupCount >= 5)
            return ExposureLevel.Moyen;

        // FAIBLE: Peu de groupes
        return ExposureLevel.Faible;
    }

    public static string GetExposureWarning(int piiCount, PermissionInfo permInfo, string language = "fr")
    {
        if (permInfo.ExposureLevel == ExposureLevel.Faible)
            return "";

        if (language == "fr")
        {
            if (permInfo.AccessibleToEveryone)
                return $"🔴 CRITIQUE: Ce fichier contient {piiCount} PII et est accessible à TOUS les utilisateurs (Everyone)";

            if (permInfo.IsNetworkShare && permInfo.ExposureLevel == ExposureLevel.Critique)
                return $"🔴 CRITIQUE: Ce fichier contient {piiCount} PII et est accessible sur un partage réseau à {permInfo.UserGroupCount} groupes";

            if (permInfo.AccessibleToAuthenticatedUsers)
                return $"🟠 ÉLEVÉ: Ce fichier contient {piiCount} PII et est accessible à tous les utilisateurs authentifiés";

            if (permInfo.ExposureLevel == ExposureLevel.Élevé)
                return $"🟠 ÉLEVÉ: Ce fichier contient {piiCount} PII et est accessible à {permInfo.UserGroupCount} groupes d'utilisateurs";

            if (permInfo.ExposureLevel == ExposureLevel.Moyen)
                return $"🟡 MOYEN: Ce fichier contient {piiCount} PII et est accessible à {permInfo.UserGroupCount} groupes d'utilisateurs";
        }

        return "";
    }

    public static string GetExposureLevelLabel(ExposureLevel level, string language = "fr")
    {
        if (language == "fr")
        {
            return level switch
            {
                ExposureLevel.Critique => "Critique",
                ExposureLevel.Élevé => "Élevé",
                ExposureLevel.Moyen => "Moyen",
                ExposureLevel.Faible => "Faible",
                _ => "Inconnu"
            };
        }

        return level.ToString();
    }

    private static bool IsNetworkPath(string path)
    {
        try
        {
            var uri = new Uri(path);
            return uri.IsUnc;
        }
        catch
        {
            // Vérification alternative
            return path.StartsWith(@"\\") || path.StartsWith("//");
        }
    }
}
