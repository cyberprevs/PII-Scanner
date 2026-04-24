namespace PiiScanner.Api.Utils;

/// <summary>
/// Prevents log injection by stripping control characters from user-supplied values
/// before they are included in log messages.
/// </summary>
public static class LogSanitizer
{
    public static string Sanitize(string? value)
    {
        if (string.IsNullOrEmpty(value)) return string.Empty;
        return value.Replace("\r", "\\r").Replace("\n", "\\n").Replace("\0", "\\0");
    }
}
