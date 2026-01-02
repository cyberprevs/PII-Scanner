using System.ComponentModel.DataAnnotations;
using System.Text.RegularExpressions;

namespace PiiScanner.Api.Attributes;

/// <summary>
/// Attribut de validation pour exiger un mot de passe fort
/// - Minimum 12 caractères
/// - Au moins une majuscule
/// - Au moins une minuscule
/// - Au moins un chiffre
/// - Au moins un caractère spécial
/// </summary>
public class StrongPasswordAttribute : ValidationAttribute
{
    private const int MinLength = 12;

    public StrongPasswordAttribute()
    {
        ErrorMessage = "Le mot de passe doit contenir au moins 12 caractères, " +
                       "avec au moins une majuscule, une minuscule, un chiffre et un caractère spécial";
    }

    protected override ValidationResult? IsValid(object? value, ValidationContext validationContext)
    {
        if (value == null || string.IsNullOrWhiteSpace(value.ToString()))
        {
            return new ValidationResult("Le mot de passe est requis");
        }

        var password = value.ToString()!;

        // Vérifier la longueur minimale
        if (password.Length < MinLength)
        {
            return new ValidationResult($"Le mot de passe doit contenir au moins {MinLength} caractères");
        }

        // Vérifier la présence d'une majuscule
        if (!Regex.IsMatch(password, @"[A-Z]"))
        {
            return new ValidationResult("Le mot de passe doit contenir au moins une lettre majuscule");
        }

        // Vérifier la présence d'une minuscule
        if (!Regex.IsMatch(password, @"[a-z]"))
        {
            return new ValidationResult("Le mot de passe doit contenir au moins une lettre minuscule");
        }

        // Vérifier la présence d'un chiffre
        if (!Regex.IsMatch(password, @"[0-9]"))
        {
            return new ValidationResult("Le mot de passe doit contenir au moins un chiffre");
        }

        // Vérifier la présence d'un caractère spécial
        if (!Regex.IsMatch(password, @"[^a-zA-Z0-9]"))
        {
            return new ValidationResult("Le mot de passe doit contenir au moins un caractère spécial (!@#$%^&*...)");
        }

        // Vérifier qu'il ne contient pas d'espaces
        if (password.Contains(' '))
        {
            return new ValidationResult("Le mot de passe ne doit pas contenir d'espaces");
        }

        return ValidationResult.Success;
    }
}
