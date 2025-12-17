# Documentation de Sécurité - PII Scanner

## Vue d'ensemble

PII Scanner implémente plusieurs couches de sécurité pour protéger les données sensibles et prévenir les attaques courantes.

## 1. Protection contre le Path Traversal

### Qu'est-ce que le Path Traversal ?

Le Path Traversal (aussi appelé Directory Traversal) est une vulnérabilité qui permet à un attaquant d'accéder à des fichiers ou répertoires en dehors du répertoire autorisé en utilisant des séquences spéciales comme `..`, `/`, `\`.

**Exemple d'attaque** :
```
Entrée normale : "backup_20241217.db"
Attaque        : "../../Windows/System32/config/SAM"
```

### Notre Protection

Nous avons implémenté la classe `PathValidator` dans `PiiScanner.Api/Utils/PathValidator.cs` qui fournit une validation complète des chemins.

#### Caractéristiques de sécurité :

1. **Validation des noms de fichiers** (`ValidateFileName`)
   - Rejet des caractères `.` `.`, `/`, `\`
   - Vérification des caractères invalides Windows
   - Rejet des noms réservés (CON, PRN, AUX, etc.)
   - Limite de longueur (255 caractères)

2. **Validation des chemins de répertoires** (`ValidateDirectoryPath`)
   - Détection des patterns dangereux (`.., ~, %, \\\\, //`)
   - Normalisation avec `Path.GetFullPath()`
   - Blocage des répertoires système sensibles :
     - `C:\Windows`
     - `C:\Program Files`
     - `C:\ProgramData`
     - `/etc`, `/var`, `/usr`, `/bin` (Linux)
   - Vérification d'existence optionnelle
   - Limite de longueur (32767 caractères)

3. **Validation des chemins de fichiers** (`ValidateFilePath`)
   - Combine validation du nom de fichier + validation du répertoire parent
   - Empêche l'accès aux fichiers système

4. **Validation de confinement** (`ValidateFileInDirectory`)
   - Vérifie qu'un fichier est bien dans un répertoire autorisé spécifique
   - Empêche l'évasion vers des répertoires parents

### Endpoints protégés :

#### ScanController.cs
- **POST /api/scan/start** : Validation du répertoire à scanner
  ```csharp
  PathValidator.ValidateDirectoryPath(request.DirectoryPath, out var validationError, mustExist: true)
  ```
  - Empêche le scan de répertoires système
  - Log les tentatives d'accès invalides

#### DataRetentionController.cs
- **POST /api/dataretention/scan** : Validation du répertoire à analyser
  ```csharp
  PathValidator.ValidateDirectoryPath(request.DirectoryPath, out var validationError, mustExist: true)
  ```

- **POST /api/dataretention/delete** : Validation de chaque fichier avant suppression
  ```csharp
  PathValidator.ValidateFilePath(filePath, out var validationError, mustExist: false)
  ```
  - Chaque fichier est validé individuellement
  - Les fichiers invalides sont ajoutés à `failedFiles`

#### DatabaseController.cs
- **GET /api/database/backup/download/{fileName}** : Double validation
  ```csharp
  // 1. Validation du nom de fichier
  PathValidator.ValidateFileName(fileName, out var validationError)

  // 2. Vérification de confinement
  PathValidator.ValidateFileInDirectory(backupPath, backupDir, out validationError)
  ```
  - Empêche le téléchargement de fichiers en dehors du dossier `backups/`
  - Log les tentatives d'accès non autorisé

- **DELETE /api/database/backup/{fileName}** : Même double validation
  - Protection identique au téléchargement
  - Audit logging de toutes les suppressions

### Logs de sécurité

Toutes les tentatives d'accès invalide sont loggées avec le niveau `Warning` :

```csharp
_logger.LogWarning("Tentative de scan avec un chemin invalide: {Path} - Erreur: {Error}",
    request.DirectoryPath, validationError);
```

Ces logs permettent :
- Détecter les tentatives d'attaque
- Tracer les accès suspects
- Auditer les opérations sensibles

## 2. Authentification JWT

### Token-based Authentication

- **Endpoint de connexion** : `POST /api/auth/login`
- **Token d'expiration** : 7 jours (configurable)
- **Refresh Token** : 30 jours
- **Stockage sécurisé** : Base de données SQLite avec hash

### Gestion des sessions

- Stockage en base de données (`Sessions` table)
- Révocation possible (`IsRevoked` flag)
- Expiration automatique
- Suivi de l'adresse IP
- Nettoyage périodique des sessions expirées

### Protection des endpoints

Tous les endpoints sensibles requièrent l'authentification :

```csharp
[Authorize]  // Tous les utilisateurs authentifiés
[Authorize(Roles = Roles.Admin)]  // Admin uniquement
```

## 3. Gestion des rôles (RBAC)

### Rôles disponibles

1. **Admin**
   - Accès complet à toutes les fonctionnalités
   - Gestion des utilisateurs
   - Gestion de la base de données (sauvegardes, restauration)
   - Accès aux logs d'audit

2. **User** (Utilisateur standard)
   - Scans PII
   - Consultation des résultats
   - Exports de rapports
   - Gestion de rétention des données
   - Profil utilisateur

### Endpoints protégés par rôle

**Admin uniquement** :
- `/api/users` - Gestion des utilisateurs
- `/api/database` - Gestion de la base de données

**Tous utilisateurs authentifiés** :
- `/api/scan` - Scans PII
- `/api/dataretention` - Rétention des données
- `/api/auth/me` - Profil utilisateur

## 4. Validation des entrées

### Validation côté serveur

Toutes les entrées utilisateur sont validées :

1. **Chemins de fichiers/répertoires**
   - Classe `PathValidator` (voir section 1)

2. **Noms d'utilisateur**
   - Longueur minimale/maximale
   - Caractères autorisés
   - Unicité dans la base de données

3. **Emails**
   - Format RFC compliant
   - Unicité

4. **Mots de passe**
   - Longueur minimale : 8 caractères
   - Hash avec BCrypt (salt automatique)

5. **Noms de fichiers de sauvegarde**
   - Format validé
   - Pas de caractères spéciaux dangereux

### Sanitization

- Les chemins sont nettoyés avec `PathValidator.SanitizePath()`
- Suppression des doubles slashes
- Suppression des références relatives (`..`)

## 5. Protection contre les injections

### SQL Injection

- **ORM Entity Framework Core** : Requêtes paramétrées par défaut
- Aucune concaténation de requêtes SQL
- Utilisation systématique de LINQ

Exemple sécurisé :
```csharp
var user = await _db.Users
    .Where(u => u.Username == username && u.IsActive)
    .FirstOrDefaultAsync();
```

### Command Injection

- Aucun appel direct à `Process.Start()` avec entrées utilisateur
- Pas d'exécution de commandes shell avec données non validées

## 6. Audit Logging

### Événements tracés

Tous les événements critiques sont enregistrés dans la table `AuditLogs` :

1. **Authentification**
   - Login réussi/échoué
   - Logout
   - Changement de mot de passe

2. **Gestion utilisateurs**
   - Création d'utilisateur
   - Modification de profil
   - Suppression d'utilisateur
   - Changement de rôle

3. **Opérations base de données**
   - Création de sauvegarde
   - Restauration
   - Suppression de sauvegarde
   - Optimisation
   - Nettoyage

4. **Scans PII**
   - Démarrage de scan
   - Complétion
   - Échec

### Informations enregistrées

Chaque log contient :
- **UserId** : Qui a fait l'action
- **Action** : Type d'opération (Login, CreateBackup, etc.)
- **EntityType** : Type d'entité affectée (User, Database, Scan)
- **EntityId** : ID de l'entité
- **IpAddress** : Adresse IP du client
- **Details** : Détails supplémentaires
- **CreatedAt** : Timestamp UTC

### Consultation des logs

Les admins peuvent consulter les logs via :
- La base de données directement
- Future API endpoint (à implémenter)

## 7. Protection des données sensibles

### Hashage des mots de passe

- **Algorithme** : BCrypt
- **Work Factor** : 12 (configurable)
- **Salt** : Généré automatiquement par BCrypt
- Jamais de stockage en clair

```csharp
var passwordHash = BCrypt.Net.BCrypt.HashPassword(password, workFactor: 12);
```

### Tokens JWT

- **Secret** : Généré aléatoirement ou configuré via appsettings
- **Signing Algorithm** : HMACSHA256
- **Claims** : UserId, Username, Role
- **Expiration** : Courte durée (7 jours)

### Refresh Tokens

- Stockés en base de données (pas dans le JWT)
- Génération aléatoire sécurisée (44 caractères)
- Révocables individuellement
- Durée limitée (30 jours)

## 8. Protection CORS

### Configuration

CORS configuré dans `Program.cs` :

```csharp
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowElectron", policy =>
    {
        policy.WithOrigins(
            "http://localhost:3000",
            "http://localhost:5173",
            "http://localhost:5174",
            "http://localhost:5175"
        )
        .AllowAnyMethod()
        .AllowAnyHeader()
        .AllowCredentials();
    });
});
```

**En production** : Remplacer `AllowAnyOrigin()` par la liste blanche des domaines autorisés.

## 9. Sécurité de la base de données

### SQLite

- **Fichier** : `piiscanner.db`
- **Permissions** : Lecture/Écriture pour l'application uniquement
- **Chiffrement** : Non implémenté (fichier local)

### Sauvegardes

- Stockées dans `backups/` (répertoire dédié)
- Accès restreint aux administrateurs
- Validation stricte des noms de fichiers
- Confinement dans le répertoire `backups/`

### Nettoyage automatique

- Sessions expirées : Supprimées automatiquement
- Logs d'audit : Rétention configurable (90 jours par défaut)
- Sauvegardes : Gestion manuelle par l'admin

## 10. Sécurité du frontend

### Protection XSS

- React échappe automatiquement les données
- Pas de `dangerouslySetInnerHTML`
- Validation des entrées côté client

### Protection CSRF

- Tokens JWT dans les headers (pas de cookies)
- Pas de formulaires traditionnels susceptibles au CSRF

### URL Encoding

Les noms de fichiers sont encodés avec `encodeURIComponent()` :

```typescript
await axios.delete(`/database/backup/${encodeURIComponent(fileName)}`);
```

## 11. Mesures de sécurité supplémentaires recommandées

### Pour la production

1. **HTTPS obligatoire**
   - Certificat SSL/TLS valide
   - Redirection HTTP → HTTPS

2. **Rate Limiting**
   - Limiter les tentatives de login
   - Protéger contre le brute force

3. **Rotation des secrets**
   - Changer périodiquement le secret JWT
   - Révoquer tous les tokens existants

4. **Monitoring**
   - Alertes sur tentatives d'attaque
   - Dashboard des logs de sécurité

5. **Backup automatique**
   - Sauvegardes régulières chiffrées
   - Stockage hors site

6. **Chiffrement de la base de données**
   - SQLCipher pour chiffrer piiscanner.db
   - Protection des sauvegardes

7. **En-têtes de sécurité HTTP**
   ```csharp
   app.Use(async (context, next) =>
   {
       context.Response.Headers.Add("X-Content-Type-Options", "nosniff");
       context.Response.Headers.Add("X-Frame-Options", "DENY");
       context.Response.Headers.Add("X-XSS-Protection", "1; mode=block");
       context.Response.Headers.Add("Strict-Transport-Security", "max-age=31536000");
       await next();
   });
   ```

8. **Validation des uploads** (si ajouté plus tard)
   - Taille maximale
   - Types MIME autorisés
   - Scan antivirus

## 12. Tests de sécurité

### Tests à effectuer régulièrement

1. **Path Traversal**
   ```bash
   curl -X POST http://localhost:5000/api/scan/start \
     -H "Authorization: Bearer $TOKEN" \
     -d '{"directoryPath":"../../../Windows"}'
   # Devrait retourner 400 Bad Request
   ```

2. **SQL Injection**
   ```bash
   curl -X POST http://localhost:5000/api/auth/login \
     -d '{"username":"admin' OR '1'='1","password":"test"}'
   # Devrait échouer sans injecter de SQL
   ```

3. **Unauthorized Access**
   ```bash
   curl -X GET http://localhost:5000/api/users
   # Devrait retourner 401 Unauthorized
   ```

4. **Role Escalation**
   - Tentative d'accès admin avec token User
   - Devrait retourner 403 Forbidden

### Outils recommandés

- **OWASP ZAP** : Scan automatique de vulnérabilités
- **Burp Suite** : Tests manuels approfondis
- **SonarQube** : Analyse statique du code
- **Snyk** : Scan des dépendances vulnérables

## 13. Contact et Signalement

Pour signaler une vulnérabilité de sécurité :

1. **GitHub Issues** : https://github.com/your-org/pii-scanner/security/advisories
2. **Email** : security@piiscanner.com
3. **PGP Key** : (à fournir)

**Délai de réponse** : 48 heures maximum

---

**Dernière mise à jour** : 17 décembre 2025
**Version** : 1.0.0
**Responsable sécurité** : Équipe PII Scanner
