# Guide d'Installation - PII Scanner

Guide complet pour installer et utiliser PII Scanner en tant qu'application web.

---

## Option 1 : Version Standalone Windows (Recommandée)

**Aucune installation requise** - Téléchargez le fichier ZIP et lancez l'application.

### Téléchargement

1. Téléchargez la dernière version : [Releases](https://github.com/cyberprevs/pii-scanner/releases)
2. Extrayez le fichier `PII-Scanner-v1.0.0-Windows-Standalone.zip`

### Démarrage Rapide

**Double-cliquez sur** : `PiiScanner.Api.exe`

Le navigateur s'ouvre automatiquement sur **http://localhost:5000**

### Contenu du Package

```
PII-Scanner-v1.0.0-Windows-Standalone/
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

## Créer un Package Web App (Développeurs)

Pour créer votre propre package distributable :

```powershell
# Script automatisé (Recommandé)
.\BuildWebApp.ps1

# OU manuellement :

# 1. Build React
cd pii-scanner-ui
npm run build

# 2. Copier vers wwwroot
xcopy /E /I dist ..\PiiScanner.Api\wwwroot

# 3. Publish API (self-contained)
cd ..\PiiScanner.Api
dotnet publish -c Release -r win-x64 --self-contained true -o ..\PII-Scanner-WebApp

# 4. Créer le fichier batch de lancement
# (voir BuildWebApp.ps1 pour le contenu)
```

Le package sera créé dans `PII-Scanner-WebApp/` (~124 MB).

Pour distribuer :
```powershell
Compress-Archive -Path PII-Scanner-WebApp\* -DestinationPath PII-Scanner-WebApp.zip
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
- **Guide de démarrage** : [DEMARRAGE.md](DEMARRAGE.md)
- **Sécurité** : [SECURITY.md](SECURITY.md)
- **Changelog** : [CHANGELOG.md](CHANGELOG.md)

---

**Version** : 1.0.0
**Date** : 14 janvier 2026
**Développé par** : [Cyberprevs](https://cyberprevs.fr)
