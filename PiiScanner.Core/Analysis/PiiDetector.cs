
using System.Text.RegularExpressions;
using PiiScanner.Models;
using PiiScanner.Utils;

namespace PiiScanner.Analysis;

public static class PiiDetector
{
    private static readonly Dictionary<string, string> Patterns = new()
    {
        // Email avec validation stricte (pas de chiffres avant @)
        { "Email", @"\b[a-zA-Z][a-zA-Z0-9._%+-]*@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}\b" },

        // Téléphone France: 01-05 + 8 chiffres, ou 06-07 (mobile), ou +33
        { "TelephoneFR", @"\b(?:\+33|0)[1-9](?:[\s.-]?\d{2}){4}\b" },

        // Téléphone Bénin: +229 suivi de 8 chiffres
        { "TelephoneBJ", @"\b\+229[\s.-]?\d{2}[\s.-]?\d{2}[\s.-]?\d{2}[\s.-]?\d{2}\b" },

        // Date de naissance au format JJ/MM/AAAA avec validation
        { "DateNaissance", @"\b(?:0[1-9]|[12][0-9]|3[01])/(?:0[1-9]|1[0-2])/(?:19|20)\d{2}\b" },

        // Numéro de sécurité sociale français (15 chiffres)
        { "NumeroSecu", @"\b[1-478]\s?\d{2}\s?\d{2}\s?\d{2}\s?\d{3}\s?\d{3}\s?\d{2}\b" },

        // Numéro fiscal français (13 chiffres)
        { "NumeroFiscalFR", @"\b\d{13}\b" },

        // IFU Bénin (Identifiant Fiscal Unique - 13 chiffres commençant par 0, 1, 2, 3)
        { "IFU_Benin", @"\b[0-3]\d{12}\b" },

        // IBAN France (FR + 2 chiffres + 23 caractères alphanumériques)
        { "IBAN_FR", @"\bFR\s?\d{2}\s?(?:\d{4}\s?){5}\d{3}\b" },

        // IBAN Bénin (BJ + 2 chiffres + 24 caractères alphanumériques)
        { "IBAN_BJ", @"\bBJ\s?\d{2}\s?[A-Z0-9\s]{24,28}\b" },

        // Carte bancaire (16 chiffres avec espaces optionnels)
        { "CarteBancaire", @"\b(?:\d{4}[\s-]?){3}\d{4}\b" },

        // Adresse IP valide (chaque octet entre 0-255)
        { "AdresseIP", @"\b(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\b" },

        // ========== NOUVEAUX DÉTECTEURS CRITIQUES ==========

        // Numéro de Passeport (format international: 2 lettres + 6-9 chiffres)
        { "Passeport", @"\b[A-Z]{2}[0-9]{6,9}\b" },

        // Mots de passe en clair dans les fichiers de configuration
        { "MotDePasse", @"(?i)\b(password|pwd|passwd|secret|api[_-]?key|access[_-]?token|auth[_-]?token|private[_-]?key)\s*[:=]\s*[^\s;,""')\]]{4,}\b" },

        // Clés API AWS
        { "CleAPI_AWS", @"\bAKIA[0-9A-Z]{16}\b" },

        // Clés API Google
        { "CleAPI_Google", @"\bAIza[0-9A-Za-z\-_]{35}\b" },

        // Token GitHub
        { "Token_GitHub", @"\bghp_[0-9a-zA-Z]{36}\b" },

        // Clé Stripe
        { "CleAPI_Stripe", @"\bsk_live_[0-9a-zA-Z]{24,}\b" },

        // Token JWT (JSON Web Token)
        { "Token_JWT", @"\beyJ[A-Za-z0-9-_]+\.eyJ[A-Za-z0-9-_]+\.[A-Za-z0-9-_.+/=]*\b" }
    };

    public static List<ScanResult> Detect(string content, string filePath, DateTime? lastAccessedDate = null, FilePermissionAnalyzer.PermissionInfo? permissionInfo = null)
    {
        var results = new List<ScanResult>();

        foreach (var pattern in Patterns)
        {
            foreach (Match match in Regex.Matches(content, pattern.Value))
            {
                // Validation supplémentaire pour éviter les faux positifs
                if (IsValidPii(pattern.Key, match.Value))
                {
                    results.Add(new ScanResult
                    {
                        FilePath = filePath,
                        PiiType = pattern.Key,
                        Match = match.Value,
                        LastAccessedDate = lastAccessedDate,
                        ExposureLevel = permissionInfo != null ? FilePermissionAnalyzer.GetExposureLevelLabel(permissionInfo.ExposureLevel) : null,
                        AccessibleToEveryone = permissionInfo?.AccessibleToEveryone,
                        IsNetworkShare = permissionInfo?.IsNetworkShare,
                        UserGroupCount = permissionInfo?.UserGroupCount
                    });
                }
            }
        }

        return results;
    }

    private static bool IsValidPii(string piiType, string value)
    {
        return piiType switch
        {
            "DateNaissance" => IsValidDate(value),
            "Email" => IsValidEmail(value),
            "CarteBancaire" => IsValidCreditCard(value),
            "NumeroFiscalFR" => IsValidNumeroFiscal(value),
            "IBAN_FR" => IsValidIbanFR(value),
            "Passeport" => IsValidPassport(value),
            "MotDePasse" => IsValidPassword(value),
            "CleAPI_AWS" => IsValidAwsKey(value),
            _ => true
        };
    }

    private static bool IsValidDate(string date)
    {
        // Vérifier que la date n'est pas dans le futur et pas trop ancienne
        if (DateTime.TryParseExact(date, "dd/MM/yyyy", null, System.Globalization.DateTimeStyles.None, out DateTime parsedDate))
        {
            return parsedDate >= new DateTime(1900, 1, 1) && parsedDate <= DateTime.Now;
        }
        return false;
    }

    private static bool IsValidEmail(string email)
    {
        // Vérifier que l'email ne se termine pas par des caractères étranges
        return !email.EndsWith("PARIS", StringComparison.OrdinalIgnoreCase)
            && !Regex.IsMatch(email, @"[A-Z]{2,}$");
    }

    private static bool IsValidCreditCard(string cardNumber)
    {
        // Enlever les espaces et tirets
        string cleaned = cardNumber.Replace(" ", "").Replace("-", "");

        // Doit avoir exactement 16 chiffres
        if (cleaned.Length != 16 || !cleaned.All(char.IsDigit))
            return false;

        // Algorithme de Luhn pour validation
        int sum = 0;
        bool alternate = false;

        for (int i = cleaned.Length - 1; i >= 0; i--)
        {
            int digit = cleaned[i] - '0';

            if (alternate)
            {
                digit *= 2;
                if (digit > 9)
                    digit -= 9;
            }

            sum += digit;
            alternate = !alternate;
        }

        return sum % 10 == 0;
    }

    private static bool IsValidNumeroFiscal(string numero)
    {
        // Éviter les numéros qui sont probablement autre chose (numéro de téléphone, etc.)
        // Un numéro fiscal français commence généralement par 0, 1, 2, ou 3
        return numero.Length == 13 && (numero[0] == '0' || numero[0] == '1' || numero[0] == '2' || numero[0] == '3');
    }

    private static bool IsValidIbanFR(string iban)
    {
        // Enlever les espaces
        string cleaned = iban.Replace(" ", "");

        // IBAN français doit avoir exactement 27 caractères (FR + 2 chiffres + 23 caractères)
        return cleaned.Length == 27 && cleaned.StartsWith("FR");
    }

    private static bool IsValidPassport(string value)
    {
        // Éviter les faux positifs comme "AB123456" qui pourrait être autre chose
        // Vérifier que c'est bien 2 lettres majuscules suivies de 6-9 chiffres
        if (value.Length < 8 || value.Length > 11)
            return false;

        // Les deux premiers caractères doivent être des lettres
        if (!char.IsLetter(value[0]) || !char.IsLetter(value[1]))
            return false;

        // Le reste doit être des chiffres
        for (int i = 2; i < value.Length; i++)
        {
            if (!char.IsDigit(value[i]))
                return false;
        }

        return true;
    }

    private static bool IsValidPassword(string value)
    {
        // Éviter les faux positifs où le mot clé est détecté mais pas vraiment un mot de passe
        // Par exemple: "password: " sans valeur, ou "password_reset" (fonction)

        // Extraire la partie après le séparateur
        var match = Regex.Match(value, @"[:=]\s*(.+)$");
        if (!match.Success)
            return false;

        string passwordPart = match.Groups[1].Value.Trim();

        // Doit avoir au moins 4 caractères pour être considéré comme un mot de passe
        if (passwordPart.Length < 4)
            return false;

        // Éviter les valeurs placeholder courantes
        string[] placeholders = { "****", "xxxx", "your_password", "changeme", "example", "null", "none", "false", "true" };
        if (placeholders.Any(p => passwordPart.Equals(p, StringComparison.OrdinalIgnoreCase)))
            return false;

        return true;
    }

    private static bool IsValidAwsKey(string value)
    {
        // Les clés AWS commencent toujours par AKIA
        if (!value.StartsWith("AKIA"))
            return false;

        // Doivent avoir exactement 20 caractères (AKIA + 16 caractères)
        if (value.Length != 20)
            return false;

        // Tous les caractères après AKIA doivent être alphanumériques majuscules
        for (int i = 4; i < value.Length; i++)
        {
            if (!char.IsLetterOrDigit(value[i]) || char.IsLower(value[i]))
                return false;
        }

        return true;
    }
}
