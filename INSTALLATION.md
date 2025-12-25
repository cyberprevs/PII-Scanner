# 📦 Guide d'Installation - PII Scanner

Guide pas-à-pas pour installer PII Scanner depuis le code source.

## Prérequis

### Logiciels requis

- **.NET 8.0 SDK** : [Télécharger](https://dotnet.microsoft.com/download/dotnet/8.0)
- **Node.js 18+** et **npm** : [Télécharger](https://nodejs.org/)
- **Git** : [Télécharger](https://git-scm.com/)
- **Windows 10/11** ou **Windows Server 2016/2019/2022**

### Vérification des prérequis

```bash
# Vérifier .NET SDK
dotnet --version
# Attendu : 8.0.x ou supérieur

# Vérifier Node.js
node --version
# Attendu : v18.x.x ou supérieur

# Vérifier npm
npm --version
# Attendu : 9.x.x ou supérieur
```

---

## 📥 Installation

### Étape 1 : Cloner le repository

```bash
git clone https://github.com/cyberprevs/pii-scanner.git
cd pii-scanner
```

### Étape 2 : Configurer l'API Backend

```bash
cd PiiScanner.Api

# Copier le fichier de configuration exemple
copy appsettings.example.json appsettings.json

# Générer un secret JWT sécurisé (PowerShell)
powershell -Command "$secret = [Convert]::ToBase64String([System.Security.Cryptography.RandomNumberGenerator]::GetBytes(64)); Write-Host $secret"
```

**Important** : Ouvrez `appsettings.json` et remplacez le secret JWT par celui généré.

### Étape 3 : Installer les dépendances .NET

```bash
dotnet restore
dotnet build
```

### Étape 4 : Créer le certificat HTTPS

```bash
dotnet dev-certs https --trust
```

### Étape 5 : Démarrer l'API

```bash
dotnet run
```

### Étape 6 : Installer l'interface Electron

Nouveau terminal :

```bash
cd pii-scanner-ui
npm install
npm run electron:dev
```

---

**Documentation complète** : [README.md](README.md)
**Sécurité** : [CONFIGURATION.md](CONFIGURATION.md)
