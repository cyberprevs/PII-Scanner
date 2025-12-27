# 📦 Guide d'Installation - PII Scanner

Guide complet pour installer et utiliser PII Scanner.

---

## 🚀 Option 1 : Version Portable (Recommandée)

**Aucune installation requise** - Téléchargez simplement le fichier ZIP et lancez l'application.

### Téléchargement

1. Téléchargez la dernière version : [Releases](https://github.com/cyberprevs/pii-scanner/releases)
2. Extrayez le fichier `PII-Scanner-Portable-Complete.zip`
3. Lisez le fichier `LISEZMOI.txt` pour les instructions détaillées

### Démarrage Rapide

**Double-cliquez sur** : `Démarrer PII Scanner.bat`

Ce script lance automatiquement l'API et l'interface utilisateur.

### ⚠️ Problème de Blocage Windows SmartScreen

**Symptôme** : Windows affiche "Windows a protégé votre ordinateur" ou "Une stratégie de contrôle d'application a bloqué ce fichier"

**Cause** : L'application n'est pas signée numériquement (le certificat coûte ~300€/an)

**Solutions** (par ordre de recommandation) :

#### Solution 1 : Exclusion Windows Defender (Recommandée)
1. **Clic droit** sur `Ajouter-Exclusion-Windows-Defender.bat`
2. Sélectionnez **"Exécuter en tant qu'administrateur"**
3. Confirmez l'ajout de l'exclusion

Cette méthode est permanente et empêche tout blocage futur.

#### Solution 2 : Script de Déblocage Automatique
1. **Double-cliquez** sur `Débloquer-Fichiers.bat`
2. Attendez que le script termine
3. Relancez l'application

Cette méthode utilise PowerShell `Unblock-File` pour débloquer tous les fichiers.

#### Solution 3 : Déblocage Manuel
1. **Clic droit** sur `UI\PII Scanner.exe`
2. Sélectionnez **"Propriétés"**
3. En bas de l'onglet **"Général"**, cochez **"Débloquer"**
4. Cliquez sur **"OK"**
5. Relancez l'application

### Contenu du Package

```
PII-Scanner-Portable-Complete/
├── Démarrer PII Scanner.bat               ← Lance l'application
├── Débloquer-Fichiers.bat                  ← Débloque tous les fichiers
├── Ajouter-Exclusion-Windows-Defender.bat ← Ajoute une exclusion (Admin requis)
├── LISEZMOI.txt                            ← Instructions détaillées
├── API/
│   └── PiiScanner.Api.exe                  ← Backend .NET (runtime inclus)
└── UI/
    └── PII Scanner.exe                     ← Interface Electron
```

### Première Utilisation

1. Lancez l'application avec `Démarrer PII Scanner.bat`
2. **Si Windows bloque** : Utilisez une des solutions ci-dessus
3. Créez un compte administrateur (première utilisation uniquement)
4. Connectez-vous avec vos identifiants
5. Commencez à scanner vos répertoires

### Notes Importantes

- **Antivirus** : Certains antivirus peuvent marquer l'application comme suspecte car elle n'est pas signée
- **Pare-feu** : Windows peut demander d'autoriser l'API sur le port 5001 (HTTPS)
- **Données locales** : Toutes les données restent sur votre ordinateur (100% local, aucune connexion externe)
- **Ticket Microsoft** : Un ticket a été ouvert avec Microsoft concernant le blocage SmartScreen

---

## 🛠️ Option 2 : Installation depuis les Sources

Pour les développeurs qui souhaitent compiler et modifier l'application.

### Prérequis

#### Logiciels requis

- **.NET 8.0 SDK** : [Télécharger](https://dotnet.microsoft.com/download/dotnet/8.0)
- **Node.js 18+** et **npm** : [Télécharger](https://nodejs.org/)
- **Git** : [Télécharger](https://git-scm.com/)
- **Windows 10/11** ou **Windows Server 2016/2019/2022**

#### Vérification des prérequis

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

### 📥 Installation

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

## 📦 Créer un Package Portable (Développeurs)

Pour créer votre propre package portable, consultez le guide complet dans [CLAUDE.md - Build Portable Package](CLAUDE.md#build-portable-package).

---

## 🔧 Dépannage

### Windows SmartScreen bloque l'application

**Erreur** : "Windows a protégé votre ordinateur" ou "Une stratégie de contrôle d'application a bloqué ce fichier"

**Solutions** :
1. Utilisez le script `Ajouter-Exclusion-Windows-Defender.bat` (Admin requis)
2. Utilisez le script `Débloquer-Fichiers.bat`
3. Déverrouillez manuellement via Propriétés → Débloquer

### Page blanche après création du compte admin

**Solution** : Ce problème a été corrigé dans la version 2.0. Si vous rencontrez toujours le problème :
1. Fermez l'application complètement
2. Relancez `Démarrer PII Scanner.bat`

### L'API ne démarre pas

**Erreur** : Port 5001 déjà utilisé

**Solutions** :
```bash
# Trouver le processus utilisant le port 5001
netstat -ano | findstr :5001

# Terminer le processus (remplacer PID par le numéro obtenu)
taskkill /F /PID <PID>
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

---

## 📚 Documentation

- **Documentation complète** : [README.md](README.md)
- **Sécurité** : [SECURITY.md](SECURITY.md)
- **Configuration** : [CONFIGURATION.md](CONFIGURATION.md)
- **Documentation technique** : [CLAUDE.md](CLAUDE.md)
