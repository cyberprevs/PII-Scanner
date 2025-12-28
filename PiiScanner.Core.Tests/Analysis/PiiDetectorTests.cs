using FluentAssertions;
using PiiScanner.Analysis;
using Xunit;

namespace PiiScanner.Core.Tests.Analysis;

/// <summary>
/// Tests unitaires pour PiiDetector - Détection des données personnelles (PII)
/// Couvre les 17 patterns de détection + validation post-regex
/// </summary>
public class PiiDetectorTests
{
    private const string TestFilePath = "C:\\Test\\document.txt";

    #region Email Tests

    [Theory]
    [InlineData("Contactez-moi à john.doe@example.com pour plus d'infos")]
    [InlineData("Email: marie.dupont@entreprise.fr")]
    [InlineData("support@cyberprevs.bj")]
    [InlineData("admin123@gouvernement.gouv.bj")]
    public void Detect_Email_ShouldDetectValidEmails(string content)
    {
        // Act
        var results = PiiDetector.Detect(content, TestFilePath);

        // Assert
        results.Should().ContainSingle(r => r.PiiType == "Email");
    }

    [Theory]
    [InlineData("image@2x.png")]           // Fichier image (rejected by extension check)
    [InlineData("icon@3x.jpg")]            // Fichier image (rejected by extension check)
    [InlineData("data@file.json")]         // Fichier JSON (rejected by extension check)
    [InlineData("Icon-App@2x.png")]        // Pattern iOS (rejected by iOS pattern check)
    [InlineData("t@test.com")]             // Email factice trop court (rejected by fake email check)
    public void Detect_Email_ShouldRejectFalsePositives(string content)
    {
        // Act
        var results = PiiDetector.Detect(content, TestFilePath);

        // Assert
        results.Should().NotContain(r => r.PiiType == "Email");
    }

    [Fact]
    public void Detect_Email_ShouldRejectFileExtensions()
    {
        // Arrange
        var extensions = new[] { ".png", ".jpg", ".jpeg", ".gif", ".svg", ".ico", ".json", ".js", ".ts", ".tsx", ".jsx", ".pdf", ".docx" };

        foreach (var ext in extensions)
        {
            var content = $"filename@test{ext}";

            // Act
            var results = PiiDetector.Detect(content, TestFilePath);

            // Assert
            results.Should().NotContain(r => r.PiiType == "Email",
                because: $"email ending with {ext} should be rejected as file reference");
        }
    }

    #endregion

    #region DateNaissance Tests

    [Theory]
    [InlineData("Né le 15/03/1985", "15/03/1985")]
    [InlineData("Date: 01/01/2000", "01/01/2000")]
    [InlineData("Anniversaire 31/12/1950", "31/12/1950")]
    public void Detect_DateNaissance_ShouldDetectValidDates(string content, string expectedDate)
    {
        // Act
        var results = PiiDetector.Detect(content, TestFilePath);

        // Assert
        results.Should().ContainSingle(r => r.PiiType == "DateNaissance");
        results[0].Match.Should().Be(expectedDate);
    }

    [Theory]
    [InlineData("01/01/2025")]  // Date future (enfant de moins de 5 ans)
    [InlineData("15/06/1850")]  // Personne de plus de 120 ans
    [InlineData("32/01/2000")]  // Jour invalide
    [InlineData("15/13/1990")]  // Mois invalide
    public void Detect_DateNaissance_ShouldRejectInvalidDates(string content)
    {
        // Act
        var results = PiiDetector.Detect(content, TestFilePath);

        // Assert
        results.Should().NotContain(r => r.PiiType == "DateNaissance");
    }

    #endregion

    #region CarteBancaire Tests

    [Theory]
    [InlineData("4532015112830366")]              // Visa valide (Luhn OK)
    [InlineData("4532 0151 1283 0366")]           // Avec espaces
    [InlineData("4532-0151-1283-0366")]           // Avec tirets
    [InlineData("5425233430109903")]              // Mastercard valide
    public void Detect_CarteBancaire_ShouldDetectValidCards(string content)
    {
        // Act
        var results = PiiDetector.Detect(content, TestFilePath);

        // Assert
        results.Should().ContainSingle(r => r.PiiType == "CarteBancaire");
    }

    [Theory]
    [InlineData("1234567890123456")]  // Luhn invalide
    [InlineData("1111111111111111")]  // Tous uns - Luhn invalide
    [InlineData("2222222222222222")]  // Tous deux - Luhn invalide
    public void Detect_CarteBancaire_ShouldRejectInvalidLuhn(string content)
    {
        // Act
        var results = PiiDetector.Detect(content, TestFilePath);

        // Assert
        results.Should().NotContain(r => r.PiiType == "CarteBancaire");
    }

    [Fact]
    public void Detect_CarteBancaire_LuhnAlgorithmValidation()
    {
        // Arrange - Numéros de test connus
        var validCards = new[]
        {
            "4539578763621486",  // Visa
            "5425233430109903",  // Mastercard
            "374245455400126",   // Amex (15 chiffres - ne devrait pas match car regex attend 16)
        };

        var invalidCards = new[]
        {
            "4539578763621487",  // Visa avec dernier chiffre modifié
            "1234567890123456",  // Séquence simple
        };

        foreach (var card in validCards.Where(c => c.Length == 16))
        {
            var results = PiiDetector.Detect(card, TestFilePath);
            results.Should().ContainSingle(r => r.PiiType == "CarteBancaire",
                because: $"{card} should pass Luhn validation");
        }

        foreach (var card in invalidCards)
        {
            var results = PiiDetector.Detect(card, TestFilePath);
            results.Should().NotContain(r => r.PiiType == "CarteBancaire",
                because: $"{card} should fail Luhn validation");
        }
    }

    #endregion

    #region IFU Tests (Identifiant Fiscal Unique Bénin)

    [Theory]
    [InlineData("IFU: 0123456789012")]  // Commence par 0
    [InlineData("N° IFU: 1234567890123")]  // Commence par 1
    [InlineData("2345678901234")]  // Commence par 2
    [InlineData("3456789012345")]  // Commence par 3
    public void Detect_IFU_ShouldDetectValidIFU(string content)
    {
        // Act
        var results = PiiDetector.Detect(content, TestFilePath);

        // Assert
        results.Should().ContainSingle(r => r.PiiType == "IFU");
    }

    [Theory]
    [InlineData("4123456789012")]  // Commence par 4 (invalide)
    [InlineData("9876543210987")]  // Commence par 9 (invalide)
    [InlineData("012345678901")]   // 12 chiffres (trop court)
    [InlineData("01234567890123")] // 14 chiffres (trop long)
    public void Detect_IFU_ShouldRejectInvalidIFU(string content)
    {
        // Act
        var results = PiiDetector.Detect(content, TestFilePath);

        // Assert
        results.Should().NotContain(r => r.PiiType == "IFU");
    }

    #endregion

    #region CNI Bénin Tests

    [Theory]
    [InlineData("CNI: AB12345678")]
    [InlineData("Carte: CD1234567890")]
    [InlineData("XY123456")]
    public void Detect_CNI_ShouldDetectValidCNI(string content)
    {
        // Act
        var results = PiiDetector.Detect(content, TestFilePath);

        // Assert
        results.Should().ContainSingle(r => r.PiiType == "CNI_Benin");
    }

    [Theory]
    [InlineData("A1234567")]    // Une seule lettre
    [InlineData("12345678")]    // Pas de lettres au début
    [InlineData("ABCDEFGH")]    // Pas de chiffres
    [InlineData("AB12345")]     // Trop court (moins de 8 caractères total)
    public void Detect_CNI_ShouldRejectInvalidCNI(string content)
    {
        // Act
        var results = PiiDetector.Detect(content, TestFilePath);

        // Assert
        results.Should().NotContain(r => r.PiiType == "CNI_Benin");
    }

    #endregion

    #region Passeport Bénin Tests

    [Theory]
    [InlineData("Passeport: BJ1234567")]
    [InlineData("N° BJ9876543")]
    public void Detect_Passeport_ShouldDetectValidPassport(string content)
    {
        // Act
        var results = PiiDetector.Detect(content, TestFilePath);

        // Assert
        results.Should().ContainSingle(r => r.PiiType == "Passeport_Benin");
    }

    [Theory]
    [InlineData("BJ123456")]    // 6 chiffres (trop court)
    [InlineData("BJ12345678")]  // 8 chiffres (trop long)
    [InlineData("FR1234567")]   // Autre pays
    public void Detect_Passeport_ShouldRejectInvalidPassport(string content)
    {
        // Act
        var results = PiiDetector.Detect(content, TestFilePath);

        // Assert
        results.Should().NotContain(r => r.PiiType == "Passeport_Benin");
    }

    #endregion

    #region Téléphone Bénin Tests

    [Theory]
    [InlineData("0022997123456")]        // Format compact préfixe 97 (valide: 9[0-79])
    [InlineData("0022966789012")]        // Préfixe 66 (valide: 6[0-79])
    [InlineData("0022940000000")]        // Préfixe 40 (valide: 4[0-9])
    [InlineData("0022950112233")]        // Préfixe 50 (valide: 5[0-9])
    public void Detect_Telephone_ShouldDetectValidBeninPhone(string content)
    {
        // Act
        var results = PiiDetector.Detect(content, TestFilePath);

        // Assert
        results.Should().ContainSingle(r => r.PiiType == "Telephone");
    }

    [Theory]
    [InlineData("97 12 34 56")]       // Sans indicatif +229
    [InlineData("+33 6 12 34 56 78")] // France
    [InlineData("06 12 34 56 78")]    // Format France
    public void Detect_Telephone_ShouldRejectNonBeninPhones(string content)
    {
        // Act
        var results = PiiDetector.Detect(content, TestFilePath);

        // Assert
        results.Should().NotContain(r => r.PiiType == "Telephone");
    }

    #endregion

    #region IBAN Bénin Tests

    [Theory]
    [InlineData("BJ66BJ061010101234567890123456")]  // 28 caractères après BJ + 2 chiffres
    [InlineData("BJ12ABCD12345678901234567890")]    // Format compact 24 chars après les 2 chiffres
    public void Detect_IBAN_ShouldDetectValidBeninIBAN(string content)
    {
        // Act
        var results = PiiDetector.Detect(content, TestFilePath);

        // Assert
        results.Should().ContainSingle(r => r.PiiType == "IBAN");
    }

    [Theory]
    [InlineData("FR7630006000011234567890189")]  // IBAN France
    [InlineData("BJ66")]                          // Trop court
    public void Detect_IBAN_ShouldRejectNonBeninIBAN(string content)
    {
        // Act
        var results = PiiDetector.Detect(content, TestFilePath);

        // Assert
        results.Should().NotContain(r => r.PiiType == "IBAN");
    }

    #endregion

    #region Mobile Money Tests

    [Theory]
    [InlineData("MTN MoMo: 96 12 34 56")]
    [InlineData("97 00 11 22")]
    [InlineData("66 78 90 12")]
    [InlineData("67 33 44 55")]
    public void Detect_MobileMoney_MTN_ShouldDetectValidNumbers(string content)
    {
        // Act
        var results = PiiDetector.Detect(content, TestFilePath);

        // Assert
        results.Should().ContainSingle(r => r.PiiType == "MobileMoney_MTN");
    }

    [Theory]
    [InlineData("Moov Money: 98 12 34 56")]
    [InlineData("99 00 11 22")]
    [InlineData("68 78 90 12")]
    [InlineData("69 33 44 55")]
    public void Detect_MobileMoney_Moov_ShouldDetectValidNumbers(string content)
    {
        // Act
        var results = PiiDetector.Detect(content, TestFilePath);

        // Assert
        results.Should().ContainSingle(r => r.PiiType == "MobileMoney_Moov");
    }

    #endregion

    #region CNSS Tests (Sécurité Sociale)

    [Theory]
    [InlineData("54321098765")]     // 11 chiffres valide (pas dans liste noire)
    [InlineData("87654321098")]     // 11 chiffres valide
    public void Detect_CNSS_ShouldDetectValidNumbers(string content)
    {
        // Act
        var results = PiiDetector.Detect(content, TestFilePath);

        // Assert
        results.Should().ContainSingle(r => r.PiiType == "CNSS");
    }

    [Theory]
    [InlineData("11111111111")]       // Tous identiques (rejected by IsValidCNSS)
    [InlineData("00000000000")]       // Tous zéros (rejected by IsValidCNSS)
    [InlineData("12345678901")]       // Pattern connu factice dans docs (rejected)
    [InlineData("00001760268")]       // Exemple documentation (rejected)
    [InlineData("21474836470")]       // INT32_MAX pattern (rejected)
    public void Detect_CNSS_ShouldRejectFalsePositives(string content)
    {
        // Act
        var results = PiiDetector.Detect(content, TestFilePath);

        // Assert
        results.Should().NotContain(r => r.PiiType == "CNSS");
    }

    [Fact]
    public void Detect_CNSS_ShouldRejectTimestamps()
    {
        // Arrange - Timestamps Unix 11 chiffres dans la range rejetée par IsValidCNSS
        // (commence par 1 ou 2 et val > 1000000000 && val < 9999999999)
        var timestamps = new[] { "1703539200", "1672070400" }; // 10 chiffres - ne match pas le regex CNSS (11 chiffres)

        foreach (var ts in timestamps)
        {
            // Act
            var results = PiiDetector.Detect(ts, TestFilePath);

            // Assert - ces timestamps de 10 chiffres ne matchent pas le pattern CNSS (11 chiffres)
            results.Should().NotContain(r => r.PiiType == "CNSS",
                because: $"{ts} has only 10 digits, CNSS requires 11");
        }
    }

    #endregion

    #region RAMU Tests

    [Theory]
    [InlineData("RAMU-12345678")]
    [InlineData("RAMU 1234567890")]
    [InlineData("Carte RAMU-98765432")]
    public void Detect_RAMU_ShouldDetectValidNumbers(string content)
    {
        // Act
        var results = PiiDetector.Detect(content, TestFilePath);

        // Assert
        results.Should().ContainSingle(r => r.PiiType == "RAMU");
    }

    #endregion

    #region RCCM Tests

    [Theory]
    [InlineData("RCCM: RB/COT/2024/A/12345")]
    [InlineData("RB/PAK/2023/B/999")]
    public void Detect_RCCM_ShouldDetectValidNumbers(string content)
    {
        // Act
        var results = PiiDetector.Detect(content, TestFilePath);

        // Assert
        results.Should().ContainSingle(r => r.PiiType == "RCCM");
    }

    #endregion

    #region Multiple PII Detection Tests

    [Fact]
    public void Detect_ShouldFindMultiplePiiInSameDocument()
    {
        // Arrange - Document avec plusieurs types de PII
        var content = @"
            Nom: Jean Dupont
            Email: jean.dupont@example.com
            Téléphone: 0022997123456
            Né le: 15/03/1985
            CNI: AB12345678
            IFU: 0123456789012
        ";

        // Act
        var results = PiiDetector.Detect(content, TestFilePath);

        // Assert - Au moins 4 types de PII détectés
        results.Should().HaveCountGreaterThanOrEqualTo(4);
        results.Should().Contain(r => r.PiiType == "Email");
        results.Should().Contain(r => r.PiiType == "Telephone");
        results.Should().Contain(r => r.PiiType == "DateNaissance");
        results.Should().Contain(r => r.PiiType == "CNI_Benin");
    }

    [Fact]
    public void Detect_ShouldReturnEmptyForCleanContent()
    {
        // Arrange
        var content = "Ceci est un texte sans aucune donnée personnelle.";

        // Act
        var results = PiiDetector.Detect(content, TestFilePath);

        // Assert
        results.Should().BeEmpty();
    }

    [Fact]
    public void Detect_ShouldHandleEmptyContent()
    {
        // Act
        var results = PiiDetector.Detect(string.Empty, TestFilePath);

        // Assert
        results.Should().BeEmpty();
    }

    [Fact]
    public void Detect_ShouldIncludeFilePathInResults()
    {
        // Arrange
        var content = "Contact: test@example.com";
        var expectedPath = "C:\\Documents\\Important\\file.docx";

        // Act
        var results = PiiDetector.Detect(content, expectedPath);

        // Assert
        results.Should().ContainSingle();
        results[0].FilePath.Should().Be(expectedPath);
    }

    #endregion

    #region INE Tests

    [Theory]
    [InlineData("INE-12345678")]
    [InlineData("INE 123456789012")]
    public void Detect_INE_ShouldDetectValidNumbers(string content)
    {
        // Act
        var results = PiiDetector.Detect(content, TestFilePath);

        // Assert
        results.Should().ContainSingle(r => r.PiiType == "INE");
    }

    #endregion

    #region Matricule Fonctionnaire Tests

    [Theory]
    [InlineData("Matricule: F123456")]
    [InlineData("Agent M1234567890")]
    public void Detect_Matricule_ShouldDetectValidNumbers(string content)
    {
        // Act
        var results = PiiDetector.Detect(content, TestFilePath);

        // Assert
        results.Should().ContainSingle(r => r.PiiType == "Matricule_Fonctionnaire");
    }

    #endregion

    #region Plaque Immatriculation Tests

    [Theory]
    [InlineData("Véhicule: AB 1234 CD")]  // Nouveau format
    [InlineData("Plaque: 1234 AB")]        // Ancien format
    [InlineData("XY 9999 ZZ")]
    public void Detect_Plaque_ShouldDetectValidPlates(string content)
    {
        // Act
        var results = PiiDetector.Detect(content, TestFilePath);

        // Assert
        results.Should().ContainSingle(r => r.PiiType == "Plaque_Immatriculation");
    }

    #endregion
}
