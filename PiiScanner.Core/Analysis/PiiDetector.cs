
using System.Text.RegularExpressions;
using PiiScanner.Models;
using PiiScanner.Utils;

namespace PiiScanner.Analysis;

public static class PiiDetector
{
    // ========== CONFIGURATION BÉNIN ==========
    // Détection des données personnelles selon la Loi N°2017-20 du Bénin
    // Autorité: APDP (Autorité de Protection des Données Personnelles)

    private static readonly Dictionary<string, string> PatternStrings = new()
    {
        // ========== DONNÉES UNIVERSELLES ==========

        // Email avec validation stricte
        { "Email", @"\b[a-zA-Z][a-zA-Z0-9._%+-]*@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}\b" },

        // Date de naissance au format JJ/MM/AAAA
        { "DateNaissance", @"\b(?:0[1-9]|[12][0-9]|3[01])/(?:0[1-9]|1[0-2])/(?:19|20)\d{2}\b" },

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

        // Téléphone Bénin: +229 ou 00229 (optionnel) + numéro avec préfixe "01" (nouveau) ou sans (ancien)
        // Nouveau format (10 chiffres): 01 + 8 chiffres (ex: 0167809906)
        // Ancien format (8 chiffres): sans 01 (ex: 67809906)
        // Préfixes valides: 4x (fixe), 5x (fixe), 6x (mobile), 9x (mobile + mobile money)
        { "Telephone", @"\b(?:(?:\+229|00229)\s?)?(?:01)?(?:4[0-9]|5[0-9]|6[0-9]|9[0-9])\s?\d{2}\s?\d{2}\s?\d{2}\b" },

        // ========== DONNÉES BANCAIRES BÉNIN ==========

        // IBAN Bénin (BJ + 2 chiffres + 24 caractères)
        { "IBAN", @"\bBJ\s?\d{2}\s?[A-Z0-9\s]{24,28}\b" },

        // ========== SANTÉ & SÉCURITÉ SOCIALE BÉNIN ==========

        // Numéro CNSS - Caisse Nationale de Sécurité Sociale (11 chiffres exactement, commence par 0-9)
        { "CNSS", @"\b[0-9]\d{10}\b" },

        // Carte RAMU - Régime d'Assurance Maladie Universelle
        { "RAMU", @"\bRAMU[\s-]?\d{8,10}\b" },

        // ========== ÉDUCATION BÉNIN ==========

        // INE - Identifiant National de l'Élève (format variable selon année)
        { "INE", @"\bINE[\s-]?\d{8,12}\b" },

        // Matricule fonctionnaire (commence par F ou M)
        { "Matricule_Fonctionnaire", @"\b[FM]\d{6,10}\b" },

        // ========== TRANSPORT BÉNIN ==========

        // Plaque d'immatriculation - Nouveau format (AB 1234 CD) ou ancien (1234 AB)
        { "Plaque_Immatriculation", @"\b(?:[A-Z]{2}\s?\d{4}\s?[A-Z]{2}|\d{4}\s?[A-Z]{2})\b" }
    };

    // Regex compilées une seule fois au démarrage pour améliorer les performances
    private static readonly Dictionary<string, Regex> CompiledPatterns = PatternStrings.ToDictionary(
        kvp => kvp.Key,
        kvp => new Regex(kvp.Value, RegexOptions.Compiled)
    );

    public static List<ScanResult> Detect(string content, string filePath, DateTime? lastAccessedDate = null, FilePermissionAnalyzer.PermissionInfo? permissionInfo = null, string? fileHash = null)
    {
        var results = new List<ScanResult>();

        foreach (var pattern in CompiledPatterns)
        {
            foreach (Match match in pattern.Value.Matches(content))
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
                        FileHash = fileHash,
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
            _ => true
        };
    }

    private static bool IsValidDate(string date)
    {
        // Vérifier que la date n'est pas dans le futur et pas trop ancienne
        if (DateTime.TryParseExact(date, "dd/MM/yyyy", null, System.Globalization.DateTimeStyles.None, out DateTime parsedDate))
        {
            // Une date de naissance doit être au minimum 5 ans dans le passé (enfants)
            // et au maximum 120 ans (personnes très âgées)
            var minDate = DateTime.Now.AddYears(-120); // Personnes de 120 ans max
            var maxDate = DateTime.Now.AddYears(-5);   // Enfants de minimum 5 ans

            return parsedDate >= minDate && parsedDate <= maxDate;
        }
        return false;
    }

    private static bool IsValidEmail(string email)
    {
        // Vérifier que l'email ne se termine pas par des caractères étranges
        if (email.EndsWith("PARIS", StringComparison.OrdinalIgnoreCase) || Regex.IsMatch(email, @"[A-Z]{2,}$"))
            return false;

        // Rejeter les noms de fichiers (extensions d'image/fichier)
        string[] fileExtensions = { ".png", ".jpg", ".jpeg", ".gif", ".svg", ".ico", ".art", ".json", ".js", ".ts", ".tsx", ".jsx", ".pdf", ".docx" };
        foreach (var ext in fileExtensions)
        {
            if (email.EndsWith(ext, StringComparison.OrdinalIgnoreCase))
                return false;
        }

        // Rejeter les patterns de noms de fichiers iOS/Android (Icon-App-*, ItunesArtwork@*, framework@*)
        if (Regex.IsMatch(email, @"^(Icon-|iTunes|Itunes|framework).*@.*\.(png|json|art)", RegexOptions.IgnoreCase))
            return false;

        // Rejeter les emails malformés (domaine invalide)
        if (!email.Contains("@") || !email.Contains("."))
            return false;

        // Vérifier que le domaine est valide (après @)
        var parts = email.Split('@');
        if (parts.Length != 2)
            return false;

        var domain = parts[1];

        // Rejeter si le domaine contient des mots français/texte (pas un vrai domaine)
        if (Regex.IsMatch(domain, @"[A-Z][a-z]+[A-Z]") || domain.Contains("http"))
            return false;

        // Rejeter si le domaine se termine par des chiffres + extension de fichier
        if (Regex.IsMatch(domain, @"\d+\.(png|jpg|json|art|com[A-Z])"))
            return false;

        // Rejeter emails factices dans exemples (t@tedt.com, user@test.com)
        if (Regex.IsMatch(email, @"^[a-z]@[a-z]{3,5}\.(com|org|net)$", RegexOptions.IgnoreCase))
            return false;

        return true;
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
        // Numéro CNSS: exactement 11 chiffres
        if (cnss.Length != 11)
            return false;

        // Ne doit pas être une suite répétitive simple
        if (cnss.All(c => c == cnss[0]))
            return false;

        // Rejeter les numéros factices (99999, 12345, etc.)
        if (cnss == "95999999996" || cnss == "12345678901" || cnss == "01234567890")
            return false;

        // Rejeter les numéros d'exemple dans documentation (07123456789, 00001760268, etc.)
        if (cnss == "07123456789" || cnss == "00001760268" || cnss == "35492213230")
            return false;

        // Rejeter les timestamps Unix (commence par 1 ou 2 suivi de 9 chiffres)
        if ((cnss[0] == '1' || cnss[0] == '2') && long.TryParse(cnss, out long val) && val > 1000000000 && val < 9999999999)
            return false;

        // Rejeter INT32_MAX et valeurs système connues
        if (cnss == "21474836470" || cnss == "21474836480" || cnss == "21474836471")
            return false;

        // Rejeter les patterns de dates (YYYYMMDDXXX)
        if (cnss.StartsWith("20") && cnss.Substring(0, 4).All(char.IsDigit))
        {
            int year = int.Parse(cnss.Substring(0, 4));
            int month = int.Parse(cnss.Substring(4, 2));
            if (year >= 1900 && year <= 2100 && month >= 1 && month <= 12)
                return false; // Probablement un timestamp YYYYMMDD
        }

        // Rejeter les numéros commençant par 00000 ou 99999
        if (cnss.StartsWith("00000") || cnss.StartsWith("99999"))
            return false;

        return true;
    }
}
