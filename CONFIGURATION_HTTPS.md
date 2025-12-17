# Configuration HTTPS - PII Scanner

**Date** : 17 décembre 2025
**Version** : 1.2.0
**Implémenté par** : Claude Code

---

## Résumé

Cette documentation explique comment configurer et utiliser HTTPS (TLS) pour sécuriser les communications entre le frontend Electron et l'API ASP.NET Core.

**Protection implémentée** : Chiffrement des données en transit avec TLS 1.2+

---

## Table des Matières

1. [Vue d'ensemble](#vue-densemble)
2. [Configuration de Développement](#configuration-de-développement)
3. [Vérification de la Configuration](#vérification-de-la-configuration)
4. [Headers de Sécurité HTTP](#headers-de-sécurité-http)
5. [Configuration de Production](#configuration-de-production)
6. [Dépannage](#dépannage)
7. [Tests de Sécurité](#tests-de-sécurité)

---

## Vue d'ensemble

### Pourquoi HTTPS ?

Sans HTTPS, toutes les communications entre le frontend et l'API sont transmises en clair sur le réseau :
- **Tokens JWT** : Interceptables par un attaquant (session hijacking)
- **Tokens CSRF** : Volés par un man-in-the-middle
- **Données PII** : Résultats de scans visibles en clair
- **Mots de passe** : Credentials transmis sans chiffrement lors de l'authentification

Avec HTTPS, toutes ces données sont chiffrées avec **TLS 1.2+** (AES-256).

### Architecture Actuelle

```
┌─────────────────────┐         HTTPS (TLS 1.2+)         ┌─────────────────────┐
│                     │ ────────────────────────────────> │                     │
│  Electron Frontend  │   https://localhost:5001/api     │   ASP.NET Core API  │
│   (React + MUI)     │ <──────────────────────────────── │   (Port 5001)       │
│                     │      Encrypted JSON + SignalR     │                     │
└─────────────────────┘                                   └─────────────────────┘
```

**URLs configurées** :
- API Base URL : `https://localhost:5001/api`
- SignalR Hub : `https://localhost:5001/scanhub`
- Swagger UI : `https://localhost:5001/swagger` (développement uniquement)

---

## Configuration de Développement

### 1. Certificat Auto-Signé

Le certificat de développement .NET est déjà installé et approuvé sur votre système.

**Vérifier le certificat** :

```powershell
# Vérifier que le certificat est approuvé
dotnet dev-certs https --check --trust
```

**Si le certificat n'est pas approuvé** :

```powershell
# Générer et approuver un nouveau certificat
dotnet dev-certs https --clean
dotnet dev-certs https --trust
```

Lors de l'approbation, Windows affichera une fenêtre de confirmation. Cliquez sur **Oui**.

### 2. Configuration de l'API

Le fichier [PiiScanner.Api/Properties/launchSettings.json](PiiScanner.Api/Properties/launchSettings.json:27) contient le profil HTTPS :

```json
{
  "https": {
    "commandName": "Project",
    "dotnetRunMessages": true,
    "launchBrowser": true,
    "launchUrl": "swagger",
    "applicationUrl": "https://localhost:5001;http://localhost:5000",
    "environmentVariables": {
      "ASPNETCORE_ENVIRONMENT": "Development"
    }
  }
}
```

**Ports** :
- **5001** : HTTPS (prioritaire)
- **5000** : HTTP (redirigé automatiquement vers HTTPS)

### 3. Démarrer l'API avec HTTPS

```bash
cd PiiScanner.Api
dotnet run --launch-profile https
```

**Sortie attendue** :

```
info: Microsoft.Hosting.Lifetime[14]
      Now listening on: https://localhost:5001
info: Microsoft.Hosting.Lifetime[14]
      Now listening on: http://localhost:5000
info: Microsoft.Hosting.Lifetime[0]
      Application started. Press Ctrl+C to shut down.
```

### 4. Configuration Frontend

Le fichier [pii-scanner-ui/src/services/apiClient.ts](pii-scanner-ui/src/services/apiClient.ts:11) utilise automatiquement HTTPS :

```typescript
const API_BASE_URL = 'https://localhost:5001/api';
const SIGNALR_URL = 'https://localhost:5001/scanhub';
```

**IMPORTANT** : Le frontend ajoute automatiquement :
- Header `Authorization: Bearer <JWT_TOKEN>`
- Header `X-CSRF-Token: <CSRF_TOKEN>` (pour POST/PUT/DELETE/PATCH)

---

## Vérification de la Configuration

### 1. Tester HTTPS avec curl

```powershell
# Requête GET sur l'API (doit retourner un cookie CSRF)
curl -k -v https://localhost:5001/api/auth/me

# Vérifier les headers de sécurité
curl -k -I https://localhost:5001/api/auth/me
```

**Headers attendus** :

```http
HTTP/1.1 401 Unauthorized
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
X-XSS-Protection: 1; mode=block
Permissions-Policy: geolocation=(), microphone=(), camera=()
Strict-Transport-Security: max-age=31536000; includeSubDomains
Set-Cookie: XSRF-TOKEN=...; path=/; samesite=strict; secure
```

### 2. Tester Redirection HTTP → HTTPS

```powershell
# Requête HTTP (doit rediriger vers HTTPS)
curl -L http://localhost:5000/api/auth/me
```

**Comportement attendu** :
- Statut : `307 Temporary Redirect`
- Header : `Location: https://localhost:5000/api/auth/me`

### 3. Vérifier dans le Navigateur

1. Ouvrir Swagger UI : `https://localhost:5001/swagger`
2. Vérifier l'icône de cadenas 🔒 dans la barre d'adresse
3. Cliquer sur le cadenas → **Détails du certificat**
   - Émis à : `localhost`
   - Émis par : `localhost` (auto-signé)
   - Valide : Oui (si approuvé)

### 4. Tester avec Postman

Importez cette collection Postman pour tester tous les endpoints :

```json
{
  "info": {
    "name": "PII Scanner HTTPS API",
    "schema": "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
  },
  "item": [
    {
      "name": "Login",
      "request": {
        "method": "POST",
        "header": [{"key": "Content-Type", "value": "application/json"}],
        "body": {
          "mode": "raw",
          "raw": "{\"username\":\"admin\",\"password\":\"Admin123!\"}"
        },
        "url": "https://localhost:5001/api/auth/login"
      }
    },
    {
      "name": "Get User Info (with JWT)",
      "request": {
        "method": "GET",
        "header": [
          {"key": "Authorization", "value": "Bearer {{jwt_token}}"}
        ],
        "url": "https://localhost:5001/api/auth/me"
      }
    }
  ]
}
```

**Étapes Postman** :
1. Settings → Disable SSL certificate verification (développement uniquement)
2. Envoyer `POST /api/auth/login` → Copier le token JWT
3. Définir variable `jwt_token` avec le token
4. Envoyer `GET /api/auth/me` → Devrait retourner les infos utilisateur

---

## Headers de Sécurité HTTP

Les headers de sécurité sont configurés dans [PiiScanner.Api/Program.cs](PiiScanner.Api/Program.cs:107) :

### 1. X-Content-Type-Options: nosniff

**Protection** : Empêche le navigateur de deviner le type MIME des fichiers.

**Attaque bloquée** : Un attaquant upload un fichier `.txt` contenant du JavaScript. Sans ce header, le navigateur pourrait l'interpréter comme du JS et l'exécuter.

```csharp
context.Response.Headers["X-Content-Type-Options"] = "nosniff";
```

### 2. X-Frame-Options: DENY

**Protection** : Empêche l'affichage de l'application dans une iframe.

**Attaque bloquée** : Clickjacking - Un site malveillant intègre votre app dans une iframe invisible et incite l'utilisateur à cliquer sur des boutons cachés.

```csharp
context.Response.Headers["X-Frame-Options"] = "DENY";
```

### 3. X-XSS-Protection: 1; mode=block

**Protection** : Active le filtre XSS du navigateur.

**Attaque bloquée** : Cross-Site Scripting (XSS) - Injection de scripts malveillants dans les pages web.

```csharp
context.Response.Headers["X-XSS-Protection"] = "1; mode=block";
```

### 4. Permissions-Policy

**Protection** : Désactive les fonctionnalités dangereuses du navigateur.

**Fonctionnalités bloquées** :
- Géolocalisation (pas besoin pour un scanner PII)
- Microphone (pas besoin)
- Caméra (pas besoin)

```csharp
context.Response.Headers["Permissions-Policy"] = "geolocation=(), microphone=(), camera=()";
```

### 5. Strict-Transport-Security (HSTS)

**Protection** : Force l'utilisation de HTTPS pendant 1 an.

**Attaque bloquée** : SSL Stripping - Un attaquant man-in-the-middle force la connexion HTTP au lieu de HTTPS.

```csharp
if (context.Request.IsHttps || !app.Environment.IsDevelopment())
{
    context.Response.Headers["Strict-Transport-Security"] = "max-age=31536000; includeSubDomains";
}
```

**Paramètres** :
- `max-age=31536000` : 1 an en secondes
- `includeSubDomains` : Applique aussi aux sous-domaines

**IMPORTANT** : HSTS est **désactivé en développement HTTP** pour éviter de bloquer l'accès HTTP pendant les tests.

---

## Configuration de Production

### Option 1 : Certificat Let's Encrypt (Gratuit, Recommandé)

Let's Encrypt fournit des certificats SSL gratuits, renouvelables automatiquement.

#### Étape 1 : Installer Certbot

```powershell
# Windows : Télécharger Certbot depuis https://certbot.eff.org/
# Ou utiliser Chocolatey
choco install certbot
```

#### Étape 2 : Obtenir un Certificat

```powershell
# Remplacer piiscanner.votredomaine.com par votre domaine
certbot certonly --standalone -d piiscanner.votredomaine.com
```

**Fichiers générés** :
- Certificat : `C:\Certbot\live\piiscanner.votredomaine.com\fullchain.pem`
- Clé privée : `C:\Certbot\live\piiscanner.votredomaine.com\privkey.pem`

#### Étape 3 : Convertir en .pfx (Format .NET)

```powershell
# Convertir PEM en PFX
openssl pkcs12 -export -out certificate.pfx `
  -inkey C:\Certbot\live\piiscanner.votredomaine.com\privkey.pem `
  -in C:\Certbot\live\piiscanner.votredomaine.com\fullchain.pem `
  -password pass:VotreMotDePasseSecurise
```

#### Étape 4 : Configurer Kestrel

Dans `appsettings.Production.json` :

```json
{
  "Kestrel": {
    "Endpoints": {
      "Https": {
        "Url": "https://*:443",
        "Certificate": {
          "Path": "C:\\Certbot\\live\\piiscanner.votredomaine.com\\certificate.pfx",
          "Password": "VotreMotDePasseSecurise"
        }
      },
      "Http": {
        "Url": "http://*:80"
      }
    }
  }
}
```

#### Étape 5 : Renouvellement Automatique

Créer une tâche planifiée Windows :

```powershell
# Renouveler tous les 60 jours
certbot renew --quiet --post-hook "Restart-Service PiiScannerApi"
```

**Tâche Planifiée Windows** :
1. Ouvrir `Planificateur de tâches`
2. Créer une tâche de base
3. Déclencheur : Tous les 60 jours
4. Action : Exécuter `certbot renew --quiet`
5. Redémarrer le service API après renouvellement

---

### Option 2 : Certificat Commercial (Payant)

Acheter un certificat SSL auprès de :
- DigiCert
- GlobalSign
- Sectigo (anciennement Comodo)

**Coût** : 50-300€/an selon le type (DV, OV, EV)

**Étapes** :
1. Acheter le certificat
2. Générer une CSR (Certificate Signing Request)
3. Télécharger le certificat .pfx
4. Configurer Kestrel (même config que Let's Encrypt)

---

### Option 3 : Reverse Proxy (Nginx ou IIS)

Utiliser un reverse proxy pour gérer HTTPS au lieu de Kestrel.

#### Exemple avec Nginx

```nginx
server {
    listen 443 ssl http2;
    server_name piiscanner.votredomaine.com;

    ssl_certificate /etc/letsencrypt/live/piiscanner.votredomaine.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/piiscanner.votredomaine.com/privkey.pem;

    # Headers de sécurité (si pas déjà dans l'API)
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    add_header X-Frame-Options "DENY" always;
    add_header X-Content-Type-Options "nosniff" always;

    location / {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}

# Redirection HTTP → HTTPS
server {
    listen 80;
    server_name piiscanner.votredomaine.com;
    return 301 https://$host$request_uri;
}
```

**Avantages** :
- Nginx gère TLS de manière très performante
- Permet le load balancing si plusieurs instances API
- Gestion centralisée des certificats

---

### Configuration CORS en Production

⚠️ **IMPORTANT** : La configuration CORS actuelle accepte tous les `localhost` (développement).

En production, modifiez [PiiScanner.Api/Program.cs](PiiScanner.Api/Program.cs:63) :

```csharp
// Développement (actuel)
policy.WithOrigins(
    "http://localhost:3000", "http://localhost:5173",
    "https://localhost:3000", "https://localhost:5173"
);

// Production (restreindre aux origines réelles)
policy.WithOrigins(
    "https://piiscanner.votredomaine.com",
    "https://app.votredomaine.com"
);
```

---

## Dépannage

### Problème 1 : "Certificat non approuvé" dans le navigateur

**Erreur** : `NET::ERR_CERT_AUTHORITY_INVALID`

**Cause** : Le certificat auto-signé n'est pas dans le magasin de certificats Windows.

**Solution** :

```powershell
# Réinstaller le certificat de développement
dotnet dev-certs https --clean
dotnet dev-certs https --trust
```

Redémarrer le navigateur après l'installation.

---

### Problème 2 : "Unable to configure HTTPS endpoint"

**Erreur** :

```
System.InvalidOperationException: Unable to configure HTTPS endpoint. No server certificate was specified
```

**Cause** : Kestrel ne trouve pas le certificat.

**Solution** :

1. Vérifier que le certificat existe :

```powershell
dotnet dev-certs https --check
```

2. Si absent, générer :

```powershell
dotnet dev-certs https --trust
```

---

### Problème 3 : CORS bloque les requêtes HTTPS

**Erreur dans la console frontend** :

```
Access to XMLHttpRequest at 'https://localhost:5001/api/auth/login' from origin 'https://localhost:5173'
has been blocked by CORS policy
```

**Cause** : L'origine HTTPS n'est pas dans la liste autorisée.

**Solution** : Vérifier que [PiiScanner.Api/Program.cs](PiiScanner.Api/Program.cs:65) contient :

```csharp
policy.WithOrigins(
    "https://localhost:5173",  // Ajouter cette ligne si manquante
    "https://localhost:5174",
    "https://localhost:5175"
);
```

---

### Problème 4 : SignalR ne se connecte pas en HTTPS

**Erreur** :

```
Error: Failed to complete negotiation with the server: Error:
WebSocket failed to connect. The connection could not be found on the server
```

**Cause** : Le SignalR Hub n'est pas configuré pour HTTPS.

**Solution** : Vérifier [pii-scanner-ui/src/services/apiClient.ts](pii-scanner-ui/src/services/apiClient.ts:12) :

```typescript
const SIGNALR_URL = 'https://localhost:5001/scanhub'; // Doit être HTTPS
```

---

### Problème 5 : HSTS bloque l'accès HTTP en développement

**Symptôme** : Le navigateur refuse de se connecter en HTTP même après avoir changé l'URL.

**Cause** : Le header HSTS a été envoyé et le navigateur cache cette directive.

**Solution** :

1. Ouvrir Chrome → `chrome://net-internals/#hsts`
2. Dans "Delete domain security policies"
3. Entrer `localhost`
4. Cliquer "Delete"

Ou utiliser un navigateur en mode privé pour tester.

---

## Tests de Sécurité

### Test 1 : Vérifier le Chiffrement TLS

```powershell
# Vérifier la version TLS utilisée
openssl s_client -connect localhost:5001 -tls1_2
```

**Résultat attendu** :

```
Protocol  : TLSv1.2
Cipher    : ECDHE-RSA-AES256-GCM-SHA384
```

**Versions TLS supportées** : TLS 1.2 et TLS 1.3 uniquement (TLS 1.0/1.1 désactivés par .NET 8)

---

### Test 2 : Vérifier les Headers de Sécurité

```powershell
# Analyser tous les headers
curl -k -I https://localhost:5001/api/auth/me
```

**Checklist** :

- ✅ `Strict-Transport-Security: max-age=31536000; includeSubDomains`
- ✅ `X-Content-Type-Options: nosniff`
- ✅ `X-Frame-Options: DENY`
- ✅ `X-XSS-Protection: 1; mode=block`
- ✅ `Permissions-Policy: geolocation=(), microphone=(), camera=()`

---

### Test 3 : Vérifier la Redirection HTTP → HTTPS

```powershell
# Suivre les redirections (-L)
curl -L -I http://localhost:5000/api/auth/me
```

**Résultat attendu** :

```http
HTTP/1.1 307 Temporary Redirect
Location: https://localhost:5000/api/auth/me

HTTP/1.1 401 Unauthorized
```

---

### Test 4 : Scanner SSL/TLS avec SSL Labs (Production)

Une fois déployé en production, testez avec **SSL Labs** :

1. Aller sur : https://www.ssllabs.com/ssltest/
2. Entrer votre domaine : `piiscanner.votredomaine.com`
3. Attendre l'analyse (2-3 minutes)

**Note souhaitée** : **A ou A+**

**Critères pour A+** :
- TLS 1.2+ uniquement
- Certificat valide (Let's Encrypt ou commercial)
- Perfect Forward Secrecy (PFS)
- Header HSTS avec `includeSubDomains`

---

## Checklist de Déploiement HTTPS

### Développement

- [x] Certificat auto-signé approuvé (`dotnet dev-certs https --trust`)
- [x] API écoute sur `https://localhost:5001`
- [x] Frontend utilise `https://localhost:5001/api`
- [x] Headers de sécurité configurés dans Program.cs
- [x] CORS autorise HTTPS origins
- [x] Redirection HTTP → HTTPS active

### Production

- [ ] Certificat SSL obtenu (Let's Encrypt ou commercial)
- [ ] Certificat .pfx généré avec mot de passe sécurisé
- [ ] Configuration Kestrel avec certificat dans `appsettings.Production.json`
- [ ] CORS restreint aux origines de production uniquement
- [ ] Tâche planifiée de renouvellement certificat (Let's Encrypt)
- [ ] HSTS activé avec `max-age` >= 1 an
- [ ] Test SSL Labs : Note A ou A+
- [ ] Monitoring des expirations de certificat

---

## Résumé des Bénéfices

| Protection | Menace Bloquée | Niveau de Risque Éliminé |
|------------|----------------|---------------------------|
| **TLS 1.2+** | Man-in-the-Middle, Sniffing réseau | ⚠️ CRITIQUE |
| **HSTS** | SSL Stripping, Downgrade attacks | ⚠️ ÉLEVÉ |
| **X-Frame-Options** | Clickjacking | ⚠️ MOYEN |
| **X-Content-Type-Options** | MIME sniffing attacks | ⚠️ MOYEN |
| **X-XSS-Protection** | Cross-Site Scripting (XSS) | ⚠️ ÉLEVÉ |
| **Permissions-Policy** | Accès non autorisé aux fonctionnalités du navigateur | ⚠️ FAIBLE |

**Conformité** :
- ✅ OWASP Top 10 2021 - A02:2021 (Cryptographic Failures)
- ✅ RGPD Article 32 (Sécurité du traitement)
- ✅ Loi N°2017-20 du Bénin (APDP) - Article 56 (Mesures de sécurité)

---

## Ressources Supplémentaires

### Documentation Officielle

- [ASP.NET Core HTTPS](https://learn.microsoft.com/en-us/aspnet/core/security/enforcing-ssl)
- [Kestrel HTTPS Configuration](https://learn.microsoft.com/en-us/aspnet/core/fundamentals/servers/kestrel/endpoints)
- [Let's Encrypt Documentation](https://letsencrypt.org/docs/)

### Outils de Test

- [SSL Labs Server Test](https://www.ssllabs.com/ssltest/) - Analyse SSL/TLS
- [Security Headers](https://securityheaders.com/) - Vérifier les headers HTTP
- [Mozilla Observatory](https://observatory.mozilla.org/) - Audit de sécurité complet

### Standards de Sécurité

- [OWASP Transport Layer Protection Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Transport_Layer_Protection_Cheat_Sheet.html)
- [Mozilla SSL Configuration Generator](https://ssl-config.mozilla.org/) - Générer configs SSL/TLS

---

**Version** : 1.2.0
**Dernière mise à jour** : 17 décembre 2025
**Auteur** : Claude Code
**Conformité** : OWASP Top 10 2021 + RGPD + Loi N°2017-20 du Bénin (APDP)
