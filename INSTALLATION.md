# Guide d'Installation - PII Scanner

Ce guide vous explique comment installer et configurer **PII Scanner** sur votre machine Windows.

## 📋 Table des matières

- [Installation Rapide (Utilisateurs)](#-installation-rapide-utilisateurs)
- [Installation depuis le Code Source (Développeurs)](#-installation-depuis-le-code-source-développeurs)
- [Première Utilisation](#-première-utilisation)
- [Résolution des Problèmes](#-résolution-des-problèmes)
- [Configuration Avancée](#-configuration-avancée)
- [Mise à Jour](#-mise-à-jour)

---

## 🚀 Installation Rapide (Utilisateurs)

**Pour les utilisateurs finaux qui veulent simplement utiliser l'application.**

### Prérequis

Aucun ! L'installateur inclut tout le nécessaire.

### Étapes d'installation

1. **Télécharger l'installateur**
   - Rendez-vous sur la page [Releases](https://github.com/cyberprevs/pii-scanner/releases)
   - Téléchargez le fichier `PII-Scanner-Setup-1.0.0.exe`

2. **Exécuter l'installateur**
   - Double-cliquez sur le fichier `.exe` téléchargé
   - Suivez les instructions à l'écran
   - Acceptez les permissions Windows si demandées

3. **Lancer l'application**
   - L'application se lancera automatiquement après l'installation
   - Ou trouvez "PII Scanner" dans le menu Démarrer

4. **Configuration initiale**
   - Voir la section [Première Utilisation](#-première-utilisation)

---

## 💻 Installation depuis le Code Source (Développeurs)

**Pour les développeurs qui veulent modifier le code ou contribuer au projet.**

### Prérequis

Avant de commencer, installez les logiciels suivants :

| Logiciel | Version minimum | Lien de téléchargement |
|----------|----------------|------------------------|
| **.NET SDK** | 8.0 | https://dotnet.microsoft.com/download/dotnet/8.0 |
| **Node.js** | 18.x LTS | https://nodejs.org/ |
| **Git** | 2.x | https://git-scm.com/downloads |

**Vérifier les installations :**

```bash
# Vérifier .NET
dotnet --version
# Devrait afficher : 8.0.x

# Vérifier Node.js
node --version
# Devrait afficher : v18.x.x ou supérieur

# Vérifier npm
npm --version
# Devrait afficher : 9.x.x ou supérieur

# Vérifier Git
git --version
# Devrait afficher : git version 2.x.x
```

### Étape 1 : Cloner le dépôt

```bash
# Cloner le projet depuis GitHub
git clone https://github.com/cyberprevs/pii-scanner.git

# Naviguer dans le dossier
cd pii-scanner
```

**Explication :** Cette commande télécharge tout le code source du projet sur votre machine.

### Étape 2 : Configuration du Backend (.NET API)

#### 2.1 Restaurer les dépendances

```bash
# Naviguer vers le dossier de l'API
cd PiiScanner.Api

# Restaurer les packages NuGet (bibliothèques .NET)
dotnet restore
```

**Explication :** `dotnet restore` télécharge toutes les bibliothèques externes nécessaires au projet (comme Entity Framework, SignalR, etc.).

#### 2.2 Créer la base de données

```bash
# Appliquer les migrations Entity Framework
dotnet ef database update
```

**Explication :** Cette commande crée la base de données SQLite `piiscanner.db` avec toutes les tables nécessaires (Users, ScheduledScans, AuditLogs, etc.).

**Note :** Si vous obtenez une erreur "dotnet ef not found", installez l'outil :
```bash
dotnet tool install --global dotnet-ef
```

#### 2.3 Compiler le projet

```bash
# Compiler en mode Debug (développement)
dotnet build

# OU compiler en mode Release (production)
dotnet build -c Release
```

**Explication :** `dotnet build` compile le code C# en assemblies .NET exécutables.

#### 2.4 Lancer l'API

```bash
# Lancer le serveur API
dotnet run
```

**Explication :** L'API sera accessible sur **http://localhost:5000**. Vous verrez dans la console :
```
info: Microsoft.Hosting.Lifetime[0]
      Now listening on: http://localhost:5000
```

**Important :** Laissez ce terminal ouvert ! L'API doit rester en cours d'exécution.

### Étape 3 : Configuration du Frontend (React/Electron)

**Ouvrez un NOUVEAU terminal** (l'API doit toujours tourner dans l'autre terminal).

#### 3.1 Installer les dépendances

```bash
# Depuis la racine du projet, naviguer vers le dossier UI
cd pii-scanner-ui

# Installer les packages npm
npm install
```

**Explication :** `npm install` télécharge toutes les bibliothèques JavaScript nécessaires (React, Material-UI, Electron, etc.). Cela peut prendre quelques minutes.

**Note :** Si vous voyez des avertissements (warnings) pendant l'installation, c'est normal. Seules les erreurs (errors) sont problématiques.

#### 3.2 Lancer l'application en mode développement

```bash
# Lancer Electron en mode développement
npm run electron:dev
```

**Explication :** Cette commande :
1. Lance le serveur de développement Vite (hot reload)
2. Compile le code TypeScript/React
3. Ouvre l'application Electron

**L'application s'ouvrira automatiquement** dans une fenêtre Electron.

### Étape 4 : Build pour production

#### 4.1 Compiler l'API pour production

```bash
# Depuis PiiScanner.Api/
dotnet publish -c Release -o bin/Release/net8.0/publish
```

**Explication :** Cette commande crée une version optimisée de l'API prête pour la distribution.

#### 4.2 Builder l'application Electron

```bash
# Depuis pii-scanner-ui/
npm run build
npm run electron:build:win
```

**Explication :**
- `npm run build` : Compile le code React/TypeScript en bundle optimisé
- `npm run electron:build:win` : Crée l'installateur Windows (.exe)

**Résultat :** L'installateur sera dans `pii-scanner-ui/release/PII-Scanner-Setup-1.0.0.exe`

---

## 🎯 Première Utilisation

### 1. Écran de Configuration Initiale

Lors du premier lancement, vous verrez la page "Configuration Initiale" :

![Configuration Initiale](docs/screenshots/initial-setup.png)

**Créer le compte administrateur :**

```
Nom d'utilisateur : admin (ou votre choix)
Email           : admin@example.com
Nom complet     : Administrateur PII Scanner
Mot de passe    : ********** (minimum 8 caractères)
Confirmer       : **********
```

**Exigences du mot de passe :**
- ✅ Minimum 8 caractères
- ✅ Au moins une majuscule (A-Z)
- ✅ Au moins une minuscule (a-z)
- ✅ Au moins un chiffre (0-9)
- ✅ Au moins un caractère spécial (!@#$%^&*)

Cliquez sur **"Créer le compte administrateur"**.

### 2. Connexion

Vous serez redirigé vers la page de connexion :

```
Nom d'utilisateur : admin
Mot de passe      : **********
```

**Important :** Utilisez le **nom d'utilisateur**, pas l'email ou le nom complet.

### 3. Premier scan

1. Cliquez sur **"Nouveau Scan"** dans le menu
2. Cliquez sur **"Parcourir"** pour sélectionner un dossier
3. Cliquez sur **"Démarrer le scan"**
4. Attendez la fin du traitement
5. Consultez les résultats et téléchargez les rapports

---

## 🔧 Résolution des Problèmes

### Problème 1 : "L'API ne démarre pas"

**Symptôme :** Erreur lors de `dotnet run` ou `dotnet ef database update`

**Solutions :**

1. **Vérifier que .NET 8.0 est installé :**
   ```bash
   dotnet --version
   ```
   Si la version est inférieure à 8.0, téléchargez .NET 8.0 SDK.

2. **Vérifier les ports :**
   ```bash
   # Windows : vérifier si le port 5000 est occupé
   netstat -ano | findstr :5000
   ```
   Si le port est occupé, modifiez le port dans `PiiScanner.Api/Properties/launchSettings.json`.

3. **Réinstaller les packages :**
   ```bash
   cd PiiScanner.Api
   dotnet clean
   dotnet restore
   dotnet build
   ```

### Problème 2 : "L'application Electron ne s'ouvre pas"

**Symptôme :** `npm run electron:dev` échoue ou l'application ne s'affiche pas

**Solutions :**

1. **Vérifier que l'API est en cours d'exécution :**
   - L'API doit tourner sur http://localhost:5000
   - Ouvrez http://localhost:5000/swagger dans un navigateur pour vérifier

2. **Réinstaller les dépendances npm :**
   ```bash
   cd pii-scanner-ui
   rm -rf node_modules
   npm install
   ```

3. **Vider le cache :**
   ```bash
   npm cache clean --force
   rm -rf dist dist-electron
   npm install
   ```

### Problème 3 : "Erreur lors de la création du compte admin"

**Symptôme :** Message d'erreur lors du setup initial

**Solutions :**

1. **Vérifier que la base de données existe :**
   ```bash
   cd PiiScanner.Api
   ls piiscanner.db
   ```
   Si le fichier n'existe pas :
   ```bash
   dotnet ef database update
   ```

2. **Supprimer la base de données et recréer :**
   ```bash
   rm piiscanner.db*
   dotnet ef database update
   ```

### Problème 4 : "Connection refused" dans l'application

**Symptôme :** L'application affiche "Impossible de se connecter au serveur"

**Solutions :**

1. **Vérifier que l'API est démarrée :**
   - Dans le terminal où vous avez lancé `dotnet run`, vous devez voir :
     ```
     Now listening on: http://localhost:5000
     ```

2. **Vérifier la configuration de l'URL de l'API :**
   - Fichier : `pii-scanner-ui/src/services/axios.ts`
   - Ligne : `baseURL: 'http://localhost:5000/api'`
   - Assurez-vous que l'URL correspond à celle de votre API

3. **Désactiver temporairement le pare-feu Windows :**
   - Le pare-feu peut bloquer les connexions locales

### Problème 5 : "Erreur lors du scan de fichiers"

**Symptôme :** Le scan échoue avec une erreur

**Solutions :**

1. **Vérifier les permissions du dossier :**
   - Assurez-vous que vous avez les droits de lecture sur le dossier à scanner

2. **Éviter les dossiers système :**
   - Ne scannez pas `C:\Windows`, `C:\Program Files`, etc.
   - Utilisez plutôt vos dossiers personnels

3. **Vérifier l'espace disque :**
   - Les rapports nécessitent de l'espace dans `%TEMP%/PiiScanner/`

---

## ⚙️ Configuration Avancée

### Changer le port de l'API

**Fichier :** `PiiScanner.Api/Properties/launchSettings.json`

```json
{
  "profiles": {
    "PiiScanner.Api": {
      "commandName": "Project",
      "launchBrowser": false,
      "applicationUrl": "http://localhost:5000",  // ← Modifier ici
      "environmentVariables": {
        "ASPNETCORE_ENVIRONMENT": "Development"
      }
    }
  }
}
```

**Puis mettre à jour le frontend :**

`pii-scanner-ui/src/services/axios.ts`
```typescript
baseURL: 'http://localhost:VOTRE_PORT/api'
```

### Configurer la clé de chiffrement SQLCipher

**Fichier :** `PiiScanner.Api/appsettings.json`

```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Data Source=piiscanner.db;Password=VOTRE_CLE_SECRETE"
  }
}
```

**Important :** Ne committez JAMAIS cette clé sur Git !

### Configurer les CORS pour une URL personnalisée

**Fichier :** `PiiScanner.Api/Program.cs`

```csharp
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowElectron", policy =>
    {
        policy.WithOrigins(
            "http://localhost:5173",  // Vite dev server
            "http://localhost:3000",
            "http://VOTRE_URL_ICI"    // ← Ajouter votre URL
        )
        .AllowAnyHeader()
        .AllowAnyMethod()
        .AllowCredentials();
    });
});
```

### Activer les logs détaillés

**Fichier :** `PiiScanner.Api/appsettings.json`

```json
{
  "Logging": {
    "LogLevel": {
      "Default": "Information",
      "Microsoft.AspNetCore": "Warning",
      "PiiScanner": "Debug"  // ← Activer le debug
    }
  }
}
```

---

## 🔄 Mise à Jour

### Mettre à jour depuis le code source

```bash
# 1. Sauvegarder la base de données
cp PiiScanner.Api/piiscanner.db PiiScanner.Api/piiscanner.db.backup

# 2. Récupérer les dernières modifications
git pull origin main

# 3. Mettre à jour le backend
cd PiiScanner.Api
dotnet restore
dotnet ef database update  # Applique les nouvelles migrations
dotnet build

# 4. Mettre à jour le frontend
cd ../pii-scanner-ui
npm install  # Met à jour les dépendances
npm run build
```

### Mettre à jour depuis l'installateur

1. **Sauvegarder vos données** (voir section suivante)
2. Télécharger la nouvelle version depuis [Releases](https://github.com/cyberprevs/pii-scanner/releases)
3. Exécuter le nouvel installateur
4. Vos données seront automatiquement préservées

### Sauvegarder vos données avant mise à jour

**Via l'application :**
1. Menu **Maintenance** → **Base de données**
2. Cliquer sur **"Créer une sauvegarde"**
3. La sauvegarde sera dans `PiiScanner.Api/backups/`

**Manuellement :**
```bash
# Sauvegarder la base de données
cp PiiScanner.Api/piiscanner.db backup_piiscanner_$(date +%Y%m%d).db

# Sauvegarder la clé de chiffrement
cp PiiScanner.Api/encryption.key backup_encryption_$(date +%Y%m%d).key
```

---

## 📊 Vérification de l'installation

Pour vérifier que tout fonctionne correctement :

### 1. Vérifier l'API

```bash
# Test de l'endpoint de santé
curl http://localhost:5000/api/initialization/status
```

**Réponse attendue :**
```json
{
  "isInitialized": false
}
```

### 2. Vérifier la base de données

```bash
cd PiiScanner.Api

# Lister les tables
dotnet ef dbcontext info
```

**Tables attendues :**
- Users
- ScheduledScans
- AuditLogs
- RefreshTokens

### 3. Vérifier l'application Electron

- L'application doit s'ouvrir sans erreur
- La page de configuration initiale ou de connexion doit s'afficher
- Le menu latéral doit être fonctionnel

---

## 📞 Support

Si vous rencontrez des problèmes non couverts par ce guide :

1. **Consultez la documentation** : [README.md](README.md) et [CLAUDE.md](CLAUDE.md)
2. **Vérifiez les issues existantes** : [GitHub Issues](https://github.com/cyberprevs/pii-scanner/issues)
3. **Créez une nouvelle issue** : [Signaler un bug](https://github.com/cyberprevs/pii-scanner/issues/new?template=bug_report.md)

---

## 🎓 Commandes de Base - Récapitulatif

### Commandes Backend (.NET)

```bash
# Restaurer les packages
dotnet restore

# Compiler
dotnet build

# Compiler en Release
dotnet build -c Release

# Lancer l'API
dotnet run

# Créer/mettre à jour la base de données
dotnet ef database update

# Créer une nouvelle migration
dotnet ef migrations add NomDeLaMigration

# Publier pour production
dotnet publish -c Release -o bin/Release/net8.0/publish

# Nettoyer les builds
dotnet clean
```

### Commandes Frontend (Node.js/npm)

```bash
# Installer les dépendances
npm install

# Lancer en mode développement
npm run dev

# Lancer Electron en dev
npm run electron:dev

# Compiler pour production
npm run build

# Builder l'installateur Windows
npm run electron:build:win

# Linter (vérifier le code)
npm run lint

# Nettoyer le cache
npm cache clean --force
```

### Commandes Git

```bash
# Cloner le dépôt
git clone https://github.com/cyberprevs/pii-scanner.git

# Vérifier le statut
git status

# Récupérer les mises à jour
git pull origin main

# Voir l'historique des commits
git log --oneline

# Voir les branches
git branch -a
```

---

## 📝 Notes Importantes

### ⚠️ Données Sensibles

- **JAMAIS** committer les fichiers suivants sur Git :
  - `piiscanner.db` (base de données)
  - `encryption.key` (clé de chiffrement)
  - Fichiers dans `reports/` (rapports PII)
  - Fichiers `.env` (variables d'environnement)

Ces fichiers sont déjà dans `.gitignore`, mais vérifiez toujours avant un commit.

### 🔒 Sécurité

- Changez le mot de passe admin par défaut immédiatement
- Gardez vos clés de chiffrement en sécurité
- Faites des sauvegardes régulières de la base de données
- Ne partagez jamais vos credentials

### 📦 Structure des Dossiers

```
pii-scanner/
├── PiiScanner.Core/         # Bibliothèque partagée (détection PII)
├── PiiScanner.Api/          # API Backend (.NET)
│   ├── piiscanner.db        # Base de données (ignoré par Git)
│   ├── encryption.key       # Clé SQLCipher (ignoré par Git)
│   └── backups/             # Sauvegardes DB (ignoré par Git)
├── pii-scanner-ui/          # Application Electron (Frontend)
│   ├── node_modules/        # Dépendances npm (ignoré par Git)
│   ├── dist/                # Build production (ignoré par Git)
│   └── release/             # Installateurs (ignoré par Git)
├── PiiScanner/              # Application console (legacy)
├── LICENSE                  # Licence CC BY-NC 4.0
├── README.md                # Documentation principale
├── INSTALLATION.md          # Ce fichier
└── .gitignore               # Fichiers à ignorer
```

---

**Développé par Cyberprevs** • © 2025 • [Licence CC BY-NC 4.0](LICENSE)

Pour toute question commerciale, contactez Cyberprevs.
