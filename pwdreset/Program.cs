using Microsoft.Data.Sqlite;

var dbPath = @"C:\Users\samir\OneDrive\Desktop\PII-Scanner\PiiScanner.Api\bin\Debug\net9.0\piiscanner.db";
var newHash = BCrypt.Net.BCrypt.HashPassword("Azertyuiop^$qsdfghjklmù*@1");

using var conn = new SqliteConnection($"Data Source={dbPath}");
conn.Open();

// Lister les users
using var listCmd = conn.CreateCommand();
listCmd.CommandText = "SELECT Id, Username, Role FROM Users;";
using var reader = listCmd.ExecuteReader();
System.Console.WriteLine("Utilisateurs existants:");
while (reader.Read())
    System.Console.WriteLine($"  Id={reader.GetInt32(0)} Username={reader.GetString(1)} Role={reader.GetString(2)}");
reader.Close();

// Mettre à jour le mot de passe de l'utilisateur 'ale'
using var updateCmd = conn.CreateCommand();
updateCmd.CommandText = "UPDATE Users SET PasswordHash = $hash WHERE Username = 'ale';";
updateCmd.Parameters.AddWithValue("$hash", newHash);
var rows = updateCmd.ExecuteNonQuery();
System.Console.WriteLine($"\nMot de passe mis à jour pour {rows} utilisateur(s).");
System.Console.WriteLine($"Nouveau hash: {newHash}");
