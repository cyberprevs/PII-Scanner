
using System.Text.RegularExpressions;
using PiiScanner.Models;
using PiiScanner.Utils;

namespace PiiScanner.Analysis;

public static class PiiDetector
{
    // ========== CONFIGURATION BÉNIN ==========
    // Détection des données personnelles selon la Loi N°2017-20 du Bénin
    // Autorité: APDP (Autorité de Protection des Données Personnelles)

    private static readonly Dictionary<string, string> Patterns = new()
    {
        // ========== DONNÉES UNIVERSELLES ==========

        // Email avec validation stricte
        { "Email", @"\b[a-zA-Z][a-zA-Z0-9._%+-]*@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}\b" },

        // Date de naissance au format JJ/MM/AAAA
        { "DateNaissance", @"\b(?:0[1-9]|[12][0-9]|3[01])/(?:0[1-9]|1[0-2])/(?:19|20)\d{2}\b" },

        // Adresse IP
        { "AdresseIP", @"\b(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\b" },

        // Carte bancaire (16 chiffres avec validation Luhn)
        { "CarteBancaire", @"\b(?:\d{4}[\s-]?){3}\d{4}\b" },

        // ========== IDENTITÉ & DOCUMENTS BÉNINOIS ==========

        // IFU - Identifiant Fiscal Unique (13 chiffres commençant par 0, 1, 2, 3)
        { "IFU", @"\b[0-3]\d{12}\b" },

        // CNI - Carte Nationale d'Identité béninoise (format: lettres + chiffres)
        { "CNI_Benin", @"\b[A-Z]{2}\d{6,10}\b" },

        // Passeport béninois (BJ suivi de 7 chiffres)
        { "Passeport_Benin", @"\bBJ\d{7}\b" },

        // RCCM - Registre du Commerce et du Crédit Mobilier (RB/XXX/YYYY/X/X)
        { "RCCM", @"\bRB/[A-Z]{3}/\d{4}/[A-Z]/\d{1,5}\b" },

        // Acte de naissance (numéro avec format N° XXX/YYYY ou XXX/AAAA/Département)
        { "ActeNaissance", @"\b(?:N°\s?)?\d{1,5}/\d{4}/[A-Z]{2,}\b" },

        // ========== CONTACT BÉNIN ==========

        // Téléphone Bénin: +229 ou 00229 suivi de 8 chiffres
        { "Telephone", @"\b(?:\+229|00229|229)?[\s.-]?(?:0[1-9]|[2-9]\d)[\s.-]?\d{2}[\s.-]?\d{2}[\s.-]?\d{2}\b" },

        // ========== DONNÉES BANCAIRES BÉNIN ==========

        // IBAN Bénin (BJ + 2 chiffres + 24 caractères)
        { "IBAN", @"\bBJ\s?\d{2}\s?[A-Z0-9\s]{24,28}\b" },

        // Mobile Money - MTN MoMo (commence par 96, 97, 66, 67)
        { "MobileMoney_MTN", @"\b(?:96|97|66|67)\s?\d{2}\s?\d{2}\s?\d{2}\b" },

        // Mobile Money - Moov Money (commence par 98, 99, 68, 69)
        { "MobileMoney_Moov", @"\b(?:98|99|68|69)\s?\d{2}\s?\d{2}\s?\d{2}\b" },

        // ========== SANTÉ & SÉCURITÉ SOCIALE BÉNIN ==========

        // Numéro CNSS - Caisse Nationale de Sécurité Sociale (10-12 chiffres)
        { "CNSS", @"\b\d{10,12}\b" },

        // Carte RAMU - Régime d'Assurance Maladie Universelle
        { "RAMU", @"\bRAMU[\s-]?\d{8,10}\b" },

        // ========== ÉDUCATION BÉNIN ==========

        // INE - Identifiant National de l'Élève (format variable selon année)
        { "INE", @"\bINE[\s-]?\d{8,12}\b" },

        // Matricule fonctionnaire (commence par F ou M)
        { "Matricule_Fonctionnaire", @"\b[FM]\d{6,10}\b" },

        // ========== SÉCURITÉ - CLÉS & TOKENS ==========

        // Mots de passe en clair
        { "MotDePasse", @"(?i)\b(password|pwd|passwd|secret|api[_-]?key|access[_-]?token|auth[_-]?token|private[_-]?key)\s*[:=]\s*[^\s;,""')\]]{4,}\b" },

        // Clés API AWS
        { "CleAPI_AWS", @"\bAKIA[0-9A-Z]{16}\b" },

        // Token JWT
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
            "IFU" => IsValidIFU(value),
            "IBAN" => IsValidIbanBenin(value),
            "CNI_Benin" => IsValidCNI(value),
            "CNSS" => IsValidCNSS(value),
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

    private static bool IsValidIFU(string ifu)
    {
        // IFU béninois: 13 chiffres commençant par 0, 1, 2, ou 3
        // Éviter les faux positifs
        if (ifu.Length != 13)
            return false;

        return ifu[0] == '0' || ifu[0] == '1' || ifu[0] == '2' || ifu[0] == '3';
    }

    private static bool IsValidIbanBenin(string iban)
    {
        // Enlever les espaces
        string cleaned = iban.Replace(" ", "");

        // IBAN béninois doit avoir BJ + 2 chiffres + 24 caractères (26 caractères minimum)
        return cleaned.Length >= 26 && cleaned.StartsWith("BJ");
    }

    private static bool IsValidCNI(string cni)
    {
        // CNI béninoise: 2 lettres majuscules suivies de chiffres
        if (cni.Length < 8)
            return false;

        // Les deux premiers caractères doivent être des lettres
        if (!char.IsLetter(cni[0]) || !char.IsLetter(cni[1]))
            return false;

        // Le reste doit être des chiffres
        for (int i = 2; i < cni.Length; i++)
        {
            if (!char.IsDigit(cni[i]))
                return false;
        }

        return true;
    }

    private static bool IsValidCNSS(string cnss)
    {
        // Numéro CNSS: 10-12 chiffres
        // Éviter les numéros trop génériques (dates, etc.)
        if (cnss.Length < 10 || cnss.Length > 12)
            return false;

        // Ne doit pas être une suite répétitive simple
        if (cnss.All(c => c == cnss[0]))
            return false;

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
