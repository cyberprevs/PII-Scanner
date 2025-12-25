# 🔐 Guide de Configuration Sécurisée - PII Scanner

Ce document explique comment configurer correctement PII Scanner pour un environnement de production sécurisé.

## ⚠️ Avant de déployer en production

### 1. Configuration JWT (OBLIGATOIRE)

Le fichier `appsettings.json` contient un secret JWT qui **DOIT être modifié** avant le déploiement.

**Étape 1 : Générer un secret sécurisé**

```powershell
# PowerShell - Générer un secret aléatoire de 256 bits
$secret = [Convert]::ToBase64String([System.Security.Cryptography.RandomNumberGenerator]::GetBytes(64))
Write-Host "Nouveau secret JWT : $secret"
```

Ou en ligne de commande :

```bash
# Linux/macOS
openssl rand -base64 64
```

**Étape 2 : Remplacer le secret dans appsettings.json**

Ouvrez `PiiScanner.Api/appsettings.json` et remplacez :

```json
"Jwt": {
  "Secret": "CHANGE_THIS_SECRET_TO_A_SECURE_RANDOM_STRING_MINIMUM_64_CHARACTERS_LONG",
  ...
}
```

Par votre nouveau secret généré :

```json
"Jwt": {
  "Secret": "VOTRE_SECRET_GENERE_ICI_64_CARACTERES_MINIMUM",
  ...
}
```

**⚠️ IMPORTANT** :
- Ne partagez JAMAIS ce secret
- Ne le commitez JAMAIS sur Git
- Changez-le tous les 90 jours en production
- Utilisez des secrets différents pour dev/staging/production

---

### 2. Base de données chiffrée (Automatique)

PII Scanner utilise SQLCipher pour chiffrer la base de données SQLite.

**Au premier démarrage** :
- Une clé de chiffrement AES-256 (256 bits) est automatiquement générée
- Stockée dans `db_encryption.key` avec protection NTFS ACL (Windows)
- Ou via variable d'environnement : `Database:EncryptionKey`

**Pour production** :
```powershell
# Option 1 : Variable d'environnement (recommandé)
$env:Database__EncryptionKey = "VOTRE_CLE_256_BITS_EN_BASE64"

# Option 2 : Azure Key Vault / AWS Secrets Manager
# Configurez votre service de gestion de secrets
```

**⚠️ Sauvegarde de la clé** :
- Sauvegardez `db_encryption.key` dans un coffre-fort sécurisé
- Sans cette clé, la base de données est irrécupérable
- Ne la commitez JAMAIS sur Git

---

### 3. HTTPS/TLS (Production)

#### Développement (Certificat auto-signé)

```bash
dotnet dev-certs https --trust
```

#### Production (Let's Encrypt ou certificat commercial)

Éditez `appsettings.Production.json` :

```json
{
  "Kestrel": {
    "Endpoints": {
      "Https": {
        "Url": "https://0.0.0.0:5001",
        "Certificate": {
          "Path": "C:\\Certificates\\piiscanner.pfx",
          "Password": "VOTRE_MOT_DE_PASSE_CERTIFICAT"
        }
      }
    }
  }
}
```

**Obtenir un certificat Let's Encrypt** :

```bash
# Avec Certbot (Windows)
certbot certonly --standalone -d piiscanner.votredomaine.com

# Convertir en .pfx
openssl pkcs12 -export -out piiscanner.pfx -inkey privkey.pem -in cert.pem
```

---

### 4. CORS (Origines autorisées)

En production, limitez les origines CORS :

```json
"Cors": {
  "AllowedOrigins": [
    "https://piiscanner.votredomaine.com",
    "https://app.votredomaine.com"
  ]
}
```

**⚠️ Ne jamais utiliser** :
- `"*"` (wildcard) en production
- `http://` en production (utilisez uniquement HTTPS)

---

### 5. Variables d'environnement (Recommandé pour production)

Au lieu de modifier `appsettings.json`, utilisez des variables d'environnement :

```powershell
# Windows - Variables d'environnement
$env:Jwt__Secret = "VOTRE_SECRET_JWT"
$env:Database__EncryptionKey = "VOTRE_CLE_CHIFFREMENT"
$env:ConnectionStrings__DefaultConnection = "Data Source=C:\\ProgramData\\PiiScanner\\piiscanner.db"

# Linux/macOS
export Jwt__Secret="VOTRE_SECRET_JWT"
export Database__EncryptionKey="VOTRE_CLE_CHIFFREMENT"
```

---

### 6. Permissions fichiers (Windows Server)

```powershell
# Protéger la base de données
icacls "C:\ProgramData\PiiScanner\piiscanner.db" /inheritance:r
icacls "C:\ProgramData\PiiScanner\piiscanner.db" /grant:r "svc_piiscanner:(R,W)"

# Protéger la clé de chiffrement
icacls "C:\ProgramData\PiiScanner\db_encryption.key" /inheritance:r
icacls "C:\ProgramData\PiiScanner\db_encryption.key" /grant:r "svc_piiscanner:(R)"
```

---

## 📋 Checklist avant déploiement

- [ ] Secret JWT changé et sécurisé (64+ caractères aléatoires)
- [ ] Clé de chiffrement sauvegardée dans un coffre-fort
- [ ] Certificat HTTPS/TLS configuré (Let's Encrypt ou commercial)
- [ ] CORS limité aux origines de production uniquement
- [ ] Variables d'environnement configurées (pas de secrets en clair dans les fichiers)
- [ ] Permissions NTFS configurées pour `piiscanner.db` et `db_encryption.key`
- [ ] Sauvegardes automatiques de la base de données activées
- [ ] Compte de service dédié créé (pas d'administrateur)
- [ ] Audit logs activés dans Windows Event Viewer
- [ ] Pare-feu configuré (port 5001 HTTPS uniquement)

---

## 🔍 Vérification de sécurité

```powershell
# Vérifier que la base de données est chiffrée
sqlite3 piiscanner.db ".tables"
# Si erreur "file is not a database" = chiffré ✅

# Vérifier les permissions
icacls piiscanner.db
icacls db_encryption.key

# Tester HTTPS
curl https://localhost:5001/api/initialization/status -k
```

---

## 📞 Support

Pour toute question de sécurité :
- Email : contact@cyberprevs.fr
- GitHub Issues : https://github.com/cyberprevs/pii-scanner/issues
- Documentation : https://github.com/cyberprevs/pii-scanner/wiki/Security

---

**Dernière mise à jour** : Décembre 2024
**Développé par** : [Cyberprevs](https://cyberprevs.com)
