# Tests de Sécurité - PII Scanner

Ce document contient des tests à effectuer pour vérifier la robustesse des protections de sécurité.

## Prérequis

- API en cours d'exécution sur `http://localhost:5000`
- Token JWT valide (obtenu via `/api/auth/login`)
- Outil de test : `curl`, Postman, ou Bruno

## 1. Tests de Protection Path Traversal

### Test 1.1 : Scan avec path traversal (Navigation parent)

**Tentative d'attaque :**
```bash
curl -X POST http://localhost:5000/api/scan/start \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{"directoryPath":"C:\\Users\\..\\..\\Windows"}'
```

**Résultat attendu :**
```json
{
  "scanId": "",
  "status": "error",
  "message": "Chemin de répertoire invalide: Le chemin contient un pattern dangereux: .."
}
```

**Code HTTP :** `400 Bad Request`

### Test 1.2 : Scan de répertoire système interdit

**Tentative d'attaque :**
```bash
curl -X POST http://localhost:5000/api/scan/start \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{"directoryPath":"C:\\Windows\\System32"}'
```

**Résultat attendu :**
```json
{
  "scanId": "",
  "status": "error",
  "message": "Chemin de répertoire invalide: L'accès aux répertoires système est interdit"
}
```

**Code HTTP :** `400 Bad Request`

### Test 1.3 : Téléchargement de fichier hors du répertoire de sauvegarde

**Tentative d'attaque :**
```bash
curl -X GET "http://localhost:5000/api/database/backup/download/..%2F..%2Fpiiscanner.db" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

**Résultat attendu :**
```json
{
  "error": "Nom de fichier invalide: Le nom de fichier contient des caractères de navigation de répertoire non autorisés"
}
```

**Code HTTP :** `400 Bad Request`

### Test 1.4 : Suppression de fichier système via nom encodé

**Tentative d'attaque :**
```bash
curl -X DELETE "http://localhost:5000/api/database/backup/..%5C..%5CWindows%5CSystem32%5Cconfig%5CSAM" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

**Résultat attendu :**
```json
{
  "error": "Nom de fichier invalide: Le nom de fichier contient des caractères de navigation de répertoire non autorisés"
}
```

**Code HTTP :** `400 Bad Request`

### Test 1.5 : Fichier avec nom réservé Windows

**Tentative d'attaque :**
```bash
curl -X GET "http://localhost:5000/api/database/backup/download/CON" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

**Résultat attendu :**
```json
{
  "error": "Nom de fichier invalide: Le nom de fichier utilise un nom réservé du système"
}
```

**Code HTTP :** `400 Bad Request`

### Test 1.6 : Chemin UNC (réseau)

**Tentative d'attaque :**
```bash
curl -X POST http://localhost:5000/api/scan/start \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{"directoryPath":"\\\\192.168.1.100\\share\\data"}'
```

**Résultat attendu :**
```json
{
  "scanId": "",
  "status": "error",
  "message": "Chemin de répertoire invalide: Le chemin contient un pattern dangereux: \\\\"
}
```

**Code HTTP :** `400 Bad Request`

## 2. Tests d'Authentification

### Test 2.1 : Accès sans token

**Tentative d'accès :**
```bash
curl -X GET http://localhost:5000/api/users
```

**Résultat attendu :**
```json
{
  "type": "https://tools.ietf.org/html/rfc7235#section-3.1",
  "title": "Unauthorized",
  "status": 401
}
```

**Code HTTP :** `401 Unauthorized`

### Test 2.2 : Token expiré

**Tentative d'accès :**
```bash
curl -X GET http://localhost:5000/api/users \
  -H "Authorization: Bearer EXPIRED_TOKEN_HERE"
```

**Résultat attendu :**
```json
{
  "type": "https://tools.ietf.org/html/rfc7235#section-3.1",
  "title": "Unauthorized",
  "status": 401
}
```

**Code HTTP :** `401 Unauthorized`

### Test 2.3 : Token invalide (malformé)

**Tentative d'accès :**
```bash
curl -X GET http://localhost:5000/api/users \
  -H "Authorization: Bearer invalid.token.format"
```

**Résultat attendu :**
**Code HTTP :** `401 Unauthorized`

## 3. Tests d'Autorisation (RBAC)

### Test 3.1 : Utilisateur standard accédant à endpoint Admin

**Tentative d'accès (avec token User) :**
```bash
curl -X GET http://localhost:5000/api/users \
  -H "Authorization: Bearer USER_TOKEN_HERE"
```

**Résultat attendu :**
```json
{
  "type": "https://tools.ietf.org/html/rfc7231#section-6.5.3",
  "title": "Forbidden",
  "status": 403
}
```

**Code HTTP :** `403 Forbidden`

### Test 3.2 : Utilisateur standard créant un backup

**Tentative d'accès (avec token User) :**
```bash
curl -X POST http://localhost:5000/api/database/backup \
  -H "Authorization: Bearer USER_TOKEN_HERE"
```

**Résultat attendu :**
**Code HTTP :** `403 Forbidden`

## 4. Tests de Validation des Entrées

### Test 4.1 : Username trop long

**Tentative de création d'utilisateur :**
```bash
curl -X POST http://localhost:5000/api/users \
  -H "Authorization: Bearer ADMIN_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{
    "username": "abcdefghijklmnopqrstuvwxyzabcdefghijklmnopqrstuvwxyzabcdefghijklmnopqrstuvwxyzabcdefghijklmnopqrstuvwxyz",
    "password": "Test123!",
    "fullName": "Test User",
    "email": "test@example.com",
    "role": "User"
  }'
```

**Résultat attendu :**
**Code HTTP :** `400 Bad Request`

### Test 4.2 : Email invalide

**Tentative de création d'utilisateur :**
```bash
curl -X POST http://localhost:5000/api/users \
  -H "Authorization: Bearer ADMIN_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "password": "Test123!",
    "fullName": "Test User",
    "email": "not-an-email",
    "role": "User"
  }'
```

**Résultat attendu :**
**Code HTTP :** `400 Bad Request`

### Test 4.3 : Mot de passe trop court

**Tentative de création d'utilisateur :**
```bash
curl -X POST http://localhost:5000/api/users \
  -H "Authorization: Bearer ADMIN_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "password": "123",
    "fullName": "Test User",
    "email": "test@example.com",
    "role": "User"
  }'
```

**Résultat attendu :**
**Code HTTP :** `400 Bad Request`

## 5. Tests de Protection SQL Injection

### Test 5.1 : SQL Injection dans le login

**Tentative d'injection :**
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "admin'\'';-- ",
    "password": "anything"
  }'
```

**Résultat attendu :**
```json
{
  "error": "Identifiants invalides"
}
```

**Code HTTP :** `401 Unauthorized`

**Pas d'erreur SQL exposée, pas de connexion réussie.**

### Test 5.2 : SQL Injection avec UNION

**Tentative d'injection :**
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "admin'\'' UNION SELECT * FROM Users-- ",
    "password": "anything"
  }'
```

**Résultat attendu :**
```json
{
  "error": "Identifiants invalides"
}
```

**Code HTTP :** `401 Unauthorized`

## 6. Tests de Logging d'Audit

### Test 6.1 : Vérifier qu'une tentative de path traversal est loggée

**Action :**
1. Exécuter le Test 1.1 (scan avec path traversal)
2. Vérifier les logs de l'API

**Résultat attendu dans les logs :**
```
warn: PiiScanner.Api.Controllers.ScanController[0]
      Tentative de scan avec un chemin invalide: C:\Users\..\..\Windows - Erreur: Le chemin contient un pattern dangereux: ..
```

### Test 6.2 : Vérifier qu'un login réussi est audité

**Action :**
1. Se connecter avec succès
2. Vérifier la table `AuditLogs` de la base de données

**Requête SQL :**
```sql
SELECT * FROM AuditLogs
WHERE Action = 'Login'
ORDER BY CreatedAt DESC
LIMIT 5;
```

**Résultat attendu :**
- Une ligne avec `Action = 'Login'`
- `UserId` correspondant
- `IpAddress` du client
- `Details` contenant des informations sur la connexion

## 7. Tests de Protection CORS

### Test 7.1 : Requête depuis une origine non autorisée

**Tentative depuis un navigateur (console) :**
```javascript
fetch('http://localhost:5000/api/users', {
  method: 'GET',
  headers: {
    'Authorization': 'Bearer YOUR_TOKEN_HERE'
  }
})
.then(r => r.json())
.then(console.log)
.catch(console.error);
```

**Origine :** Exécuter depuis un site web externe (pas localhost)

**Résultat attendu :**
```
Access to fetch at 'http://localhost:5000/api/users' from origin 'https://example.com' has been blocked by CORS policy
```

## 8. Tests de Sécurité des Fichiers

### Test 8.1 : Suppression de fichiers en masse avec chemins invalides

**Tentative :**
```bash
curl -X POST http://localhost:5000/api/dataretention/delete \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{
    "filePaths": [
      "C:\\Users\\Documents\\file1.txt",
      "..\\..\\Windows\\System32\\important.dll",
      "C:\\Users\\Documents\\file2.txt"
    ]
  }'
```

**Résultat attendu :**
- `file1.txt` et `file2.txt` validés (mais suppression échouera si inexistants)
- `important.dll` rejeté et ajouté à `failedFiles`
- Log warning pour le chemin invalide

```json
{
  "success": true,
  "deletedCount": 0,
  "failedCount": 3,
  "deletedFiles": [],
  "failedFiles": [
    "C:\\Users\\Documents\\file1.txt",
    "..\\..\\Windows\\System32\\important.dll",
    "C:\\Users\\Documents\\file2.txt"
  ]
}
```

## 9. Tests de Performance et DoS

### Test 9.1 : Requêtes répétées (Rate Limiting - à implémenter)

**Tentative :**
```bash
for i in {1..100}; do
  curl -X POST http://localhost:5000/api/auth/login \
    -H "Content-Type: application/json" \
    -d '{"username":"admin","password":"wrongpassword"}' &
done
wait
```

**Résultat actuel :**
- Toutes les requêtes sont traitées
- **VULNÉRABILITÉ** : Pas de rate limiting implémenté

**Résultat attendu (après implémentation) :**
- Après 5 tentatives, retourner `429 Too Many Requests`

### Test 9.2 : Scan de très gros répertoire

**Tentative :**
```bash
curl -X POST http://localhost:5000/api/scan/start \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{"directoryPath":"C:\\Users"}'
```

**Résultat attendu :**
- Scan démarre (si autorisé)
- Progresse normalement via SignalR
- N'affecte pas les autres requêtes API

## 10. Checklist de Sécurité Générale

- [ ] Tous les tests de Path Traversal échouent comme attendu
- [ ] Authentification JWT fonctionne (401 sans token)
- [ ] Autorisation RBAC fonctionne (403 pour User→Admin)
- [ ] SQL Injection est bloquée (pas de connexion réussie)
- [ ] Les logs d'audit enregistrent les actions sensibles
- [ ] CORS bloque les origines non autorisées
- [ ] Les mots de passe sont hashés (pas de texte clair en base)
- [ ] Les tokens expirés sont rejetés
- [ ] Les fichiers système sont inaccessibles
- [ ] Les noms de fichiers réservés sont rejetés

## Rapport de Test

Utilisez ce template pour documenter vos tests :

```markdown
### Rapport de Test de Sécurité
**Date :** YYYY-MM-DD
**Testeur :** [Nom]
**Version :** 1.0.0

#### Tests Réussis
- [ ] Path Traversal Protection (6/6 tests)
- [ ] Authentication (3/3 tests)
- [ ] Authorization (2/2 tests)
- [ ] Input Validation (3/3 tests)
- [ ] SQL Injection Protection (2/2 tests)
- [ ] Audit Logging (2/2 tests)
- [ ] CORS (1/1 test)
- [ ] File Security (1/1 test)

#### Vulnérabilités Identifiées
1. **Rate Limiting manquant** : Possibilité de brute force sur le login
2. [Autre vulnérabilité]

#### Recommandations
1. Implémenter rate limiting sur `/api/auth/login`
2. [Autres recommandations]
```

---

**Note Importante** : Ces tests sont conçus pour échouer de manière sécurisée. Si un test réussit à contourner les protections, c'est une vulnérabilité à corriger immédiatement.
