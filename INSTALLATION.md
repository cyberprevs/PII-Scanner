# Guide d'Installation - PII Scanner

Guide complet pour installer et utiliser PII Scanner en tant qu'application web.

---

## Option 1 : Version Standalone Windows (Recommandée)

**Aucune installation requise** - Téléchargez le fichier ZIP et lancez l'application.

### Téléchargement

1. Téléchargez la dernière version : [Releases](https://github.com/cyberprevs/pii-scanner/releases)
2. Extrayez le fichier `PII-Scanner-v2.0.0-Windows-Standalone.zip`

### Démarrage Rapide

**Double-cliquez sur** : `PiiScanner.Api.exe`

Le navigateur s'ouvre automatiquement sur **http://localhost:5000**

### Contenu du Package

```
PII-Scanner-v2.0.0-Windows-Standalone/
├── PiiScanner.Api.exe           ← Lance l'application (ouvre le navigateur)
├── START.bat                    ← Alternative de lancement
├── wwwroot/                     ← Interface React
│   ├── index.html
│   └── assets/
├── appsettings.json             ← Configuration générale
├── appsettings.Production.json  ← Configuration production (HTTP)
├── piiscanner.db                ← Base de données (créée au démarrage)
├── db_encryption.key            ← Clé de chiffrement (créée au démarrage)
├── LISEZMOI-DEMARRAGE-RAPIDE.txt
└── README.md
```

**Taille** : ~73 MB (self-contained, .NET 9.0 runtime inclus)

### Première Utilisation

1. Double-cliquez sur `PiiScanner.Api.exe`
2. Le navigateur s'ouvre automatiquement sur **http://localhost:5000**
3. Cliquez sur **"S'inscrire"** pour créer votre compte
4. **Le premier compte créé devient automatiquement administrateur**
5. Connectez-vous avec vos identifiants
6. Commencez à scanner vos répertoires

### Mode HTTP vs HTTPS

| Mode | Port | Usage | Configuration |
|------|------|-------|---------------|
| **HTTP** (défaut) | 5000 | Windows Server, intranet | `"UseHttpsOnly": false` |
| **HTTPS** | 5001 | Windows 10/11 avec certificat | `"UseHttpsOnly": true` |

**Pour activer HTTPS** (Windows 10/11 uniquement) :

1. Créez le certificat - Exécutez PowerShell **en administrateur** :
```powershell
# Créer un certificat auto-signé pour localhost
$cert = New-SelfSignedCertificate -DnsName "localhost" -CertStoreLocation "cert:\LocalMachine\My" -NotAfter (Get-Date).AddYears(5)

# Faire confiance au certificat
$store = New-Object System.Security.Cryptography.X509Certificates.X509Store "Root", "LocalMachine"
$store.Open("ReadWrite")
$store.Add($cert)
$store.Close()

Write-Host "Certificat installé !" -ForegroundColor Green
```

2. Modifiez `appsettings.Production.json` :
```json
{
  "Security": {
    "UseHttpsOnly": true
  }
}
```

3. Relancez `PiiScanner.Api.exe` → l'application sera sur **https://localhost:5001**

### Notes Importantes

- **100% local** : Aucune connexion externe, toutes les données restent sur votre ordinateur
- **Navigateur** : Fonctionne avec Chrome, Firefox, Edge, ou tout navigateur moderne
- **HTTP par défaut** : Compatible Windows Server sans certificat
- **Pare-feu** : Windows peut demander d'autoriser l'API sur le port 5000/5001
- **Code open-source** : Le code source est vérifiable sur GitHub

---

## Mise à Jour vers une Nouvelle Version

Cette section explique comment passer d'une version existante de PII Scanner à une version plus récente **sans perdre vos données**.

### Ce qui est conservé lors d'une mise à jour

| Données | Conservées ? |
|---------|-------------|
| Comptes utilisateurs et mots de passe | ✅ Oui |
| Historique des scans | ✅ Oui |
| Paramètres de l'application | ✅ Oui |
| Journal d'audit | ✅ Oui |
| Résultats de scan en mémoire (scan en cours) | ❌ Non — exportez avant de fermer |

### Étapes de mise à jour (Version Standalone)

> ⚠️ **Avant de commencer** : si un scan est en cours, exportez les résultats. Les données en mémoire sont perdues à la fermeture de l'application.

**Étape 1 — Arrêtez l'ancienne version**

Fermez `PiiScanner.Api.exe` (ou la fenêtre du terminal).

**Étape 2 — Téléchargez la nouvelle version**

Téléchargez et extrayez le nouveau ZIP dans un **nouveau dossier séparé** :

```
C:\PII-Scanner-v1.x\   ← ancien dossier (ne pas supprimer tout de suite)
C:\PII-Scanner-v2.0\   ← nouveau dossier (ZIP extrait ici)
```

**Étape 3 — Copiez vos deux fichiers de données**

Copiez ces deux fichiers depuis l'**ancien dossier** vers le **nouveau dossier** :

```
piiscanner.db        ← Base de données (utilisateurs, historique, paramètres)
db_encryption.key    ← Clé de chiffrement (OBLIGATOIRE — sans elle, la base est illisible)
```

> ⚠️ **Ces deux fichiers vont toujours ensemble.** Ne copiez jamais l'un sans l'autre.

**Étape 4 — Lancez la nouvelle version**

Double-cliquez sur `PiiScanner.Api.exe` dans le nouveau dossier.

L'application détecte automatiquement la version de la base de données et applique les mises à jour de schéma si nécessaire. Vos données sont immédiatement disponibles.

**Étape 5 — Vérifiez que tout fonctionne**

Connectez-vous avec vos identifiants habituels et vérifiez votre historique de scans. Une fois validé, vous pouvez supprimer l'ancien dossier.

### Résumé visuel

```
Ancien dossier                    Nouveau dossier
─────────────────                 ─────────────────
PiiScanner.Api.exe (v1.x)         PiiScanner.Api.exe (v2.0)  ← nouveau
piiscanner.db          ──────────→ piiscanner.db              ← copier
db_encryption.key      ──────────→ db_encryption.key          ← copier
appsettings.json                  appsettings.json            ← nouveau
```

### En cas de problème

**"La base de données ne s'ouvre pas" ou "Invalid password"**

→ La clé `db_encryption.key` est manquante ou ne correspond pas à la base. Vérifiez que vous avez bien copié les deux fichiers depuis le **même** ancien dossier.

**"Mes utilisateurs ont disparu"**

→ L'application a créé une nouvelle base vide. Copiez à nouveau `piiscanner.db` et `db_encryption.key` depuis l'ancien dossier et relancez.

**"Je n'ai plus le fichier db_encryption.key"**

→ Si le fichier a été perdu, la base de données chiffrée est irrécupérable. Cette clé doit être sauvegardée avec la base. Pour repartir, supprimez `piiscanner.db` et laissez l'application créer une nouvelle base au démarrage.

---

## Option 2 : Installation depuis les Sources

Pour les développeurs qui souhaitent compiler et modifier l'application.

### Prérequis

#### Logiciels requis

- **.NET 9.0 SDK** : [Télécharger](https://dotnet.microsoft.com/download/dotnet/9.0)
- **Node.js 18+** et **npm** : [Télécharger](https://nodejs.org/)
- **Git** : [Télécharger](https://git-scm.com/)
- **Windows 10/11** ou **Windows Server 2016/2019/2022**

#### Vérification des prérequis

```bash
# Vérifier .NET SDK
dotnet --version
# Attendu : 9.0.x ou supérieur

# Vérifier Node.js
node --version
# Attendu : v18.x.x ou supérieur

# Vérifier npm
npm --version
# Attendu : 9.x.x ou supérieur
```

---

### Installation

### Étape 1 : Cloner le repository

```bash
git clone https://github.com/cyberprevs/pii-scanner.git
cd pii-scanner
```

### Étape 2 : Configurer l'API Backend

```bash
cd PiiScanner.Api

# Copier le fichier de configuration exemple (si existe)
copy appsettings.example.json appsettings.json

# Générer un secret JWT sécurisé (PowerShell)
powershell -Command "$secret = [Convert]::ToBase64String([System.Security.Cryptography.RandomNumberGenerator]::GetBytes(64)); Write-Host $secret"
```

**Important** : Ouvrez `appsettings.json` et remplacez le secret JWT par celui généré si nécessaire.

### Étape 3 : Installer les dépendances .NET

```bash
dotnet restore
dotnet build
```

### Étape 4 : Créer le certificat HTTPS

```bash
dotnet dev-certs https --trust
```

### Étape 5 : Installer l'interface React

```bash
cd pii-scanner-ui
npm install
```

### Étape 6 : Démarrer l'application

**Option A : Production-like (Recommandé)**
```bash
# Build React
npm run build

# Copier vers wwwroot
# Windows
xcopy /E /I dist ..\PiiScanner.Api\wwwroot

# Linux/Mac
cp -r dist/* ../PiiScanner.Api/wwwroot/

# Lancer API (sert React + API)
cd ..\PiiScanner.Api
dotnet run
```

Ouvrir : https://localhost:5001

**Option B : Développement avec Hot Reload**

Terminal 1 - API :
```bash
cd PiiScanner.Api
dotnet run
```

Terminal 2 - React Dev Server (optionnel) :
```bash
cd pii-scanner-ui
npm run dev
```

- Application complète : https://localhost:5001
- Dev server avec hot reload : http://localhost:5173

---

## Créer un Package Standalone (Développeurs)

Pour créer votre propre package distributable :

```powershell
# Script automatisé (Recommandé)
.\build-standalone-release.ps1

# Le package sera créé dans releases/PII-Scanner-v2.0.0-Windows-Standalone.zip (~73 MB)
```

---

## Dépannage

### L'API ne démarre pas

**Erreur** : Port 5001 déjà utilisé

**Solutions** :
```bash
# Trouver le processus utilisant le port 5001
netstat -ano | findstr :5001

# Terminer le processus (remplacer PID par le numéro obtenu)
taskkill /F /PID <PID>

# OU tuer tous les processus dotnet
taskkill /F /IM dotnet.exe
```

### Erreur de certificat HTTPS

**Symptôme** : Erreur SSL/TLS lors de la connexion

**Solution** :
```bash
dotnet dev-certs https --clean
dotnet dev-certs https --trust
```

### Base de données verrouillée

**Symptôme** : "Database is locked" lors du démarrage

**Cause** : Une autre instance de l'API est déjà en cours d'exécution

**Solution** :
```bash
tasklist | findstr PiiScanner
taskkill /F /IM PiiScanner.Api.exe
```

### Page blanche dans le navigateur

**Problème** : wwwroot/ vide ou manquant

**Solution** :
```bash
# Build et copier React
cd pii-scanner-ui
npm run build
xcopy /E /I dist ..\PiiScanner.Api\wwwroot
```

### Le navigateur affiche "Cannot GET /"

**Problème** : Fichiers statiques non servis

**Solution** : Vérifier que `Program.cs` contient :
```csharp
app.UseDefaultFiles();
app.UseStaticFiles();
app.MapFallbackToFile("index.html");
```

### Certificat HTTPS non approuvé dans le navigateur

**Symptôme** : "Votre connexion n'est pas privée" sur https://localhost:5001

**Cause** : Certificat auto-signé pour localhost

**Solutions** :
1. **Recommandé** : Cliquez sur "Avancé" → "Continuer vers localhost (dangereux)" - c'est sécurisé pour localhost
2. **Ou** : Approuvez le certificat de développement :
```bash
dotnet dev-certs https --trust
```

---

## Documentation

- **Documentation complète** : [README.md](README.md)
- **Fonctionnalités** : [FEATURES.md](FEATURES.md)
- **Sécurité** : [SECURITY.md](SECURITY.md)
- **Changelog** : [CHANGELOG.md](CHANGELOG.md)

---

**Version** : 2.0.0
**Date** : 21 avril 2026
**Développé par** : [Cyberprevs](https://cyberprevs.fr)
