# PII Scanner - Détecteur de Données Personnelles

Application de bureau pour détecter et analyser les données personnelles identifiables (PII) dans vos fichiers, conforme aux exigences RGPD.

## Fonctionnalités

- **Détection complète de PII** : 11 types de données personnelles détectés
  - Emails
  - Téléphones (France et Bénin)
  - Dates de naissance
  - Numéros de Sécurité Sociale
  - Adresses IP
  - IBAN (France et Bénin)
  - Numéros fiscaux (France)
  - IFU (Bénin)
  - Cartes bancaires (avec validation Luhn)
  - Noms complets
  - Adresses postales

- **Performance optimale** : Traitement parallèle des fichiers
- **100% local et sécurisé** : Aucune donnée n'est envoyée en ligne
- **Rapports multiples formats** : CSV, JSON, HTML, Excel
- **Analyse de risque** : Classification automatique des fichiers (Faible/Moyen/Élevé)
- **Interface moderne** : Application Electron avec React et Material-UI
- **Temps réel** : Mise à jour du scan en direct via SignalR

## Installation

### Option 1 : Version portable (recommandé)

1. Téléchargez `PII-Scanner-Portable.zip` depuis le dossier `pii-scanner-ui/release/`
2. Extrayez l'archive dans un dossier de votre choix
3. Lancez `PII Scanner.exe`

Aucune installation requise ! L'application est entièrement autonome.

### Option 2 : Compilation depuis les sources

#### Prérequis

- .NET 8.0 SDK
- Node.js 18+ et npm
- Windows 10/11 (pour la version Electron)

#### Étapes

1. **Cloner le repository**
   ```bash
   git clone <repository-url>
   cd MVP-PII-Scanner
   ```

2. **Compiler l'API .NET**
   ```bash
   cd PiiScanner.Api
   dotnet publish -c Release -o bin/Release/net8.0/publish
   cd ..
   ```

3. **Installer et compiler l'interface Electron**
   ```bash
   cd pii-scanner-ui
   npm install
   npm run build
   npm run electron:build:win
   cd ..
   ```

4. L'application sera disponible dans `pii-scanner-ui/release/win-unpacked/`

## Utilisation

### Avec l'application Electron (interface graphique)

1. Lancez `PII Scanner.exe`
2. Cliquez sur "Sélectionner un dossier" pour choisir le répertoire à scanner
3. Cliquez sur "Démarrer le scan"
4. Attendez la fin du scan (la progression s'affiche en temps réel)
5. Consultez les résultats :
   - Graphiques de répartition par type de PII
   - Liste des fichiers à risque
   - Détails de chaque détection
6. Exportez les rapports dans le format de votre choix (CSV, JSON, HTML, Excel)

### Avec l'application console

Pour les tests ou l'automatisation :

```bash
cd PiiScanner
dotnet run -- "C:\chemin\vers\dossier"
```

### Avec l'API REST

1. Lancez l'API :
   ```bash
   cd PiiScanner.Api
   dotnet run
   ```

2. Accédez à Swagger : `http://localhost:5169/swagger`

3. Utilisez les endpoints :
   - `POST /api/scan/start` : Démarrer un scan
   - `GET /api/scan/{scanId}` : Récupérer les résultats
   - `GET /api/scan/{scanId}/download/{format}` : Télécharger un rapport

## Architecture

Le projet est composé de 4 parties :

### 1. PiiScanner.Core
Bibliothèque .NET contenant la logique métier :
- Détecteurs de PII avec validation (Luhn, dates, formats)
- Traitement parallèle des fichiers
- Génération de rapports (CSV, JSON, HTML, Excel)
- Calcul de score de risque

### 2. PiiScanner (Console)
Application console .NET pour les tests et l'automatisation.

### 3. PiiScanner.Api
API REST ASP.NET Core avec :
- Endpoints pour lancer des scans
- SignalR Hub pour les mises à jour en temps réel
- Support CORS pour Electron
- Génération de rapports à la demande

### 4. pii-scanner-ui
Application de bureau Electron avec :
- Interface React 19 + TypeScript
- Material-UI v7 pour le design
- Graphiques avec Recharts
- Intégration SignalR pour le temps réel
- API .NET intégrée (lancée automatiquement)

## Configuration

### Ports utilisés

- **API REST** : `http://localhost:5169`
- **SignalR Hub** : `http://localhost:5169/scanhub`
- **Interface dev** : `http://localhost:5173` (mode développement uniquement)

### CORS

En développement, l'API autorise les connexions depuis :
- `http://localhost:5173`
- `http://localhost:5174`
- `http://localhost:5175`

Pour la production, ces paramètres sont dans [PiiScanner.Api/Program.cs](PiiScanner.Api/Program.cs:15-24).

## Classification des risques

L'application calcule automatiquement un score de risque pour chaque fichier :

- **FAIBLE** : 1-5 PII détectées
- **MOYEN** : 6-15 PII détectées
- **ÉLEVÉ** : 16+ PII détectées

## Formats de rapport

### CSV
Tableau simple avec toutes les détections.

### JSON
Données structurées incluant les statistiques et détections.

### HTML
Rapport visuel avec graphiques et tableaux interactifs.

### Excel
Fichier .xlsx avec onglets séparés pour statistiques et détections.

## Développement

### Lancer en mode développement

1. **API** (terminal 1) :
   ```bash
   cd PiiScanner.Api
   dotnet run
   ```

2. **Interface Electron** (terminal 2) :
   ```bash
   cd pii-scanner-ui
   npm run electron:dev
   ```

### Tests

Des fichiers de test sont disponibles dans le dossier `PiiScanner/` :
- `test_data.txt` : Emails, téléphones, dates de naissance, adresses IP
- `test_banking_fiscal.txt` : IBAN, cartes bancaires, numéros fiscaux

```bash
cd PiiScanner
dotnet run -- test_data.txt
```

## Technologies utilisées

### Backend
- .NET 8.0
- ASP.NET Core Web API
- SignalR
- EPPlus (génération Excel)
- Parallel.ForEach pour les performances

### Frontend
- Electron 39
- React 19
- TypeScript
- Material-UI v7
- Recharts (graphiques)
- Axios (HTTP client)
- @microsoft/signalr

## Sécurité et confidentialité

- **100% local** : Aucune donnée n'est envoyée sur Internet
- **Pas de stockage** : Les données scannées ne sont jamais sauvegardées
- **Traitement en mémoire** : Analyse sans modification des fichiers
- **RGPD compliant** : Détection conforme aux exigences européennes

## Limitations connues

- L'application détecte les PII mais ne peut pas déterminer si elles sont réelles ou fictives
- Les faux positifs sont possibles (ex: numéros de téléphone dans des données techniques)
- Optimisée pour les fichiers texte (TXT, CSV, JSON, etc.)
- L'interface affiche maximum 500 détections (toutes sont dans les rapports)

## Structure des fichiers

```
MVP-PII-Scanner/
├── PiiScanner.Core/          # Bibliothèque de détection
│   ├── Detectors/            # Détecteurs de PII
│   ├── Models/               # Modèles de données
│   └── Services/             # Services (scan, rapports)
├── PiiScanner/               # Application console
├── PiiScanner.Api/           # API REST + SignalR
│   ├── Controllers/          # Endpoints REST
│   ├── Hubs/                 # SignalR Hub
│   └── Services/             # Services API
├── pii-scanner-ui/           # Application Electron
│   ├── src/                  # Code source React
│   ├── electron/             # Code Electron
│   ├── dist/                 # Build Vite
│   ├── dist-electron/        # Build Electron
│   └── release/              # Builds de distribution
│       ├── win-unpacked/     # Application portable
│       └── PII-Scanner-Portable.zip
└── CLAUDE.md                 # Documentation pour Claude Code

```

## Licence

Ce projet est fourni à des fins éducatives et de conformité RGPD.

## Support

Pour toute question ou problème, consultez le fichier [CLAUDE.md](CLAUDE.md) qui contient des informations détaillées sur l'architecture et les patterns de code utilisés.
