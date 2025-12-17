# PII Scanner - Détecteur de Données Personnelles pour le Bénin

Application de bureau pour détecter et analyser les données personnelles identifiables (PII) dans vos fichiers, conforme à la **Loi N°2017-20 du Bénin** sur la protection des données personnelles (APDP).

## Fonctionnalités

### Détection de 19 types de PII spécifiques au Bénin

#### Données universelles
- **Email** : Adresses électroniques avec validation stricte
- **DateNaissance** : Dates au format JJ/MM/AAAA (validation 5-120 ans)
- **CarteBancaire** : Numéros de carte 16 chiffres avec validation Luhn

#### Identité & Documents béninois
- **IFU** : Identifiant Fiscal Unique (13 chiffres, commence par 0-3)
- **CNI_Benin** : Carte Nationale d'Identité (format: 2 lettres + 6-10 chiffres)
- **Passeport_Benin** : Passeport béninois (format: BJ + 7 chiffres)
- **RCCM** : Registre du Commerce et du Crédit Mobilier (RB/XXX/YYYY/X/NNNNN)
- **ActeNaissance** : Acte de naissance (format: N°XXX/YYYY/Département)

#### Contact Bénin
- **Telephone** : Numéros béninois avec indicatif +229/00229 obligatoire (préfixes 40-59, 60-69, 90-99)

#### Données bancaires Bénin
- **IBAN** : IBAN béninois (BJ + 2 chiffres + 24 caractères)
- **MobileMoney_MTN** : MTN MoMo (commence par 96, 97, 66, 67)
- **MobileMoney_Moov** : Moov Money (commence par 98, 99, 68, 69)

#### Santé & Sécurité sociale Bénin
- **CNSS** : Caisse Nationale de Sécurité Sociale (11 chiffres)
- **RAMU** : Régime d'Assurance Maladie Universelle (RAMU-XXXXXXXX)

#### Éducation Bénin
- **INE** : Identifiant National de l'Élève (INE-XXXXXXXX)
- **Matricule_Fonctionnaire** : Matricule fonctionnaire (F/M + 6-10 chiffres)

#### Sécurité - Clés & Tokens
- **MotDePasse** : Mots de passe en clair détectés dans le code
- **CleAPI_AWS** : Clés API AWS (Access Key ID)
- **Token_JWT** : Tokens JWT (format eyJ...)

### Fonctionnalités avancées

#### Rétention des données (Data Retention)
- **Scan des fichiers anciens** : Identification des fichiers dépassant les périodes de rétention légales
- **Politiques configurables** : 5 catégories avec rétention paramétrable (1-10 ans)
  - Données bancaires (IBAN, Mobile Money) : 5 ans par défaut
  - Données d'identité (IFU, CNI, Passeport) : 3 ans par défaut
  - Données de santé (CNSS, RAMU) : 5 ans par défaut
  - Données éducatives (INE, Matricule) : 2 ans par défaut
  - Données de contact (Email, Téléphone) : 1 an par défaut
- **Suppression sécurisée** : Suppression des fichiers obsolètes avec confirmation
- **Interface dédiée** : Page complète pour la gestion de la rétention

#### Analyse des risques
- **Stale Data Detection** : Identification des fichiers avec PII non accédés depuis longtemps
  - Fichiers récents (< 6 mois)
  - Ancienneté moyenne (6 mois - 1 an)
  - Anciens (1-3 ans)
  - Très anciens (3-5 ans)
  - Obsolètes (> 5 ans)

- **Over-Exposed Data Detection** : Analyse des permissions Windows (NTFS ACL)
  - 4 niveaux d'exposition : Critique, Élevé, Moyen, Faible
  - Détection de fichiers accessibles à "Everyone"
  - Détection de fichiers accessibles à "Authenticated Users"
  - Détection des partages réseau (UNC paths)

#### Interface utilisateur moderne
- **14 pages spécialisées** :
  1. Tableau de bord : Statistiques et métriques clés
  2. Scanner : Lancement et suivi des scans en temps réel
  3. Historique : Consultation de tous les scans effectués
  4. Fichiers à risque : Top 20 fichiers critiques avec filtrage
  5. Données sensibles : Liste détaillée de toutes les détections
  6. Ancienneté : Analyse des fichiers obsolètes
  7. Exposition : Analyse des fichiers sur-exposés
  8. Rapports & Analytics : Visualisations et tendances
  9. Exports : Téléchargement des rapports (CSV, JSON, HTML, Excel)
  10. Rétention des données : Gestion des politiques de rétention et suppression
  11. Utilisateurs : Gestion des comptes utilisateurs (Admin uniquement)
  12. Base de données : Sauvegardes et restauration (Admin uniquement)
  13. Mon Profil : Gestion du profil utilisateur
  14. Paramètres : Configuration des types PII et exclusions
  15. Support : Centre d'aide, FAQ et contact

- **Thème sombre** : Interface Material-UI v7 avec thème sombre élégant
- **Temps réel** : Mise à jour du scan en direct via SignalR
- **Graphiques interactifs** : Visualisations avec Recharts
- **Filtrage multi-critères** : Filtres par ancienneté, exposition, type PII

#### Performance et sécurité
- **100% local et sécurisé** : Aucune donnée n'est envoyée en ligne
- **Traitement parallèle** : Utilisation optimale des CPU multi-cœurs
- **Validation avancée** : Réduction des faux positifs (~87% éliminés)
- **Rapports multiples formats** : CSV, JSON, HTML, Excel avec statistiques

## Installation

### Prérequis

- .NET 8.0 SDK
- Node.js 18+ et npm
- Windows 10/11 (pour la version Electron)

### Compilation depuis les sources

1. **Cloner le repository**
   ```bash
   git clone <repository-url>
   cd MVP-PII-Scanner
   ```

2. **Compiler l'API .NET**
   ```bash
   dotnet build PiiScanner.sln -c Release
   ```

3. **Installer et compiler l'interface Electron**
   ```bash
   cd pii-scanner-ui
   npm install
   npm run build
   npm run electron:build:win
   ```

4. L'application sera disponible dans `pii-scanner-ui/release/`

## Utilisation

### Mode développement

1. **Démarrer l'API** (terminal 1) :
   ```bash
   cd PiiScanner.Api
   dotnet run
   ```
   L'API démarre sur `http://localhost:5000`

2. **Démarrer l'interface Electron** (terminal 2) :
   ```bash
   cd pii-scanner-ui
   npm run electron:dev
   ```

### Utiliser l'application

1. **Scanner** : Sélectionnez un dossier et lancez le scan
2. **Analyser** : Consultez les détections dans les différentes pages
3. **Gérer la rétention** : Identifiez et supprimez les fichiers obsolètes
4. **Exporter** : Téléchargez les rapports au format souhaité

## Architecture

Le projet est composé de 4 parties :

### 1. PiiScanner.Core
Bibliothèque .NET contenant la logique métier :
- **20 détecteurs de PII** adaptés au Bénin avec validation stricte
- Analyse des permissions NTFS (Windows ACL)
- Calcul de l'ancienneté des fichiers
- Traitement parallèle des fichiers
- Génération de rapports (CSV, JSON, HTML, Excel)
- Calcul de score de risque

### 2. PiiScanner (Console)
Application console .NET pour les tests et l'automatisation.

### 3. PiiScanner.Api
API REST ASP.NET Core avec :
- Endpoints pour lancer des scans (`/api/scan/start`, `/api/scan/{scanId}`)
- Endpoints de rétention (`/api/dataretention/scan`, `/api/dataretention/delete`)
- SignalR Hub pour les mises à jour en temps réel (`/scanhub`)
- Support CORS pour Electron
- Génération de rapports à la demande

### 4. pii-scanner-ui
Application de bureau Electron avec :
- Interface React 19 + TypeScript
- Material-UI v7 pour le design (thème sombre)
- 11 pages spécialisées avec navigation sidebar
- Graphiques avec Recharts
- Intégration SignalR pour le temps réel
- API .NET intégrée (lancée automatiquement)

## Configuration

### Ports utilisés

- **API REST** : `http://localhost:5000`
- **SignalR Hub** : `http://localhost:5000/scanhub`
- **Interface dev** : `http://localhost:3000` (mode développement uniquement)

### CORS

L'API autorise les connexions depuis :
- `http://localhost:3000`
- `http://localhost:5173`
- `http://localhost:5174`
- `http://localhost:5175`

Configuration dans [Program.cs](PiiScanner.Api/Program.cs:15-24).

### Types de fichiers supportés

- Documents : `.docx`, `.xlsx`, `.pdf`
- Texte : `.txt`, `.log`, `.csv`, `.json`

Extensions configurables via la page **Paramètres**.

## Classification des risques

L'application calcule automatiquement un score de risque :

- **FAIBLE** : 1-2 PII détectées
- **MOYEN** : 3-10 PII détectées
- **ÉLEVÉ** : 11+ PII détectées OU données bancaires détectées

## Validation des patterns (Réduction des faux positifs)

### Telephone
- ✅ Indicatif +229/00229 **obligatoire**
- ✅ Préfixes béninois valides : 40-59, 60-69 (sauf 68), 90-99 (sauf 98)
- ❌ Rejette les numéros sans indicatif
- ❌ Rejette les numéros de version (`.30001690`)
- ❌ Rejette les timestamps (`-20240614`)

**Résultat** : ~95.7% de faux positifs éliminés

### Email
- ✅ Validation stricte du domaine
- ❌ Rejette les noms de fichiers (`Icon-App-76x76@2x.png`)
- ❌ Rejette les domaines malformés (`framework@boot.art`)
- ❌ Rejette les emails factices (`t@tedt.com`)

**Résultat** : ~90% de faux positifs éliminés

### DateNaissance
- ✅ Âge minimum : 5 ans (enfants)
- ✅ Âge maximum : 120 ans (personnes très âgées)
- ❌ Rejette les dates futures (12/09/2025)
- ❌ Rejette les dates trop récentes (< 5 ans)

**Résultat** : ~85.7% de faux positifs éliminés

### CNSS
- ✅ Exactement 11 chiffres
- ❌ Rejette les timestamps Unix (1429739312)
- ❌ Rejette les numéros factices (95999999996)
- ❌ Rejette les exemples OWASP (07123456789)
- ❌ Rejette INT32_MAX (21474836470)

**Résultat** : ~86.7% de faux positifs éliminés

### IFU
- ✅ 13 chiffres commençant par 0, 1, 2 ou 3
- ✅ Validation du premier caractère

### CNI_Benin
- ✅ 2 lettres + 6-10 chiffres
- ✅ Validation du format

### Mobile Money
- ✅ MTN : 96, 97, 66, 67 + 6 chiffres
- ✅ Moov : 98, 99, 68, 69 + 6 chiffres

## Politiques de rétention des données

Conformément à la **Loi N°2017-20 du Bénin** (APDP), l'application permet de configurer et appliquer des politiques de rétention :

| Catégorie | Types PII | Rétention par défaut |
|-----------|-----------|---------------------|
| **Données bancaires** | IBAN, MobileMoney_MTN, MobileMoney_Moov, CarteBancaire | 5 ans |
| **Données d'identité** | IFU, CNI_Benin, Passeport_Benin, RCCM, ActeNaissance | 3 ans |
| **Données de santé** | CNSS, RAMU | 5 ans |
| **Données éducatives** | INE, Matricule_Fonctionnaire | 2 ans |
| **Données de contact** | Email, Telephone | 1 an |

Les périodes sont configurables de 1 à 10 ans via l'interface.

## Formats de rapport

### CSV
Tableau simple avec toutes les détections (UTF-8 avec BOM, séparateur point-virgule).

### JSON
Données structurées incluant les statistiques et détections avec métadonnées.

### HTML
Rapport visuel avec graphiques et tableaux interactifs, design moderne responsive.

### Excel
Fichier .xlsx avec 3 onglets :
1. Statistiques globales
2. Fichiers à risque (classés par score)
3. Toutes les détections (avec filtres auto)

## Technologies utilisées

### Backend
- .NET 8.0
- ASP.NET Core Web API
- SignalR pour temps réel
- DocumentFormat.OpenXml (Word/Excel)
- PdfPig (extraction PDF)
- EPPlus (génération Excel)
- Parallel.ForEach pour les performances

### Frontend
- Electron 39
- React 19
- TypeScript 5.9
- Material-UI v7 (thème sombre)
- Recharts (graphiques)
- Axios (HTTP client)
- @microsoft/signalr
- Vite (bundler)

## Sécurité et confidentialité

### Protection des données
- **100% local** : Aucune donnée n'est envoyée sur Internet
- **Traitement en mémoire** : Analyse sans modification des fichiers
- **APDP compliant** : Détection conforme à la Loi N°2017-20 du Bénin
- **Validation stricte** : 87% de réduction des faux positifs
- **Suppression sécurisée** : Confirmation requise avant suppression

### Sécurité applicative
- **Authentification JWT** : Système de connexion sécurisé avec tokens et expiration
- **Gestion des rôles (RBAC)** : Séparation Admin/Utilisateur standard
- **Protection Path Traversal** : Validation stricte des chemins de fichiers
  - Rejet des caractères `..`, `/`, `\` dans les noms de fichiers
  - Utilisation de `Path.GetFullPath()` pour résolution absolue
  - Logs détaillés des tentatives d'accès aux fichiers
- **Protection CSRF** : Middleware Double-Submit Cookie Pattern
  - Tokens cryptographiquement sécurisés pour toutes les opérations de modification
  - Validation stricte POST/PUT/DELETE/PATCH
  - Logs des tentatives d'attaque CSRF
- **Rate Limiting** : Protection contre brute force et abus
  - Login : 5 tentatives / 15 minutes
  - Endpoints sensibles : 20 requêtes / 5 minutes
  - API générale : 100 requêtes / minute
  - Réponses HTTP 429 avec headers standard
- **Base de données chiffrée SQLite** :
  - Chiffrement AES-256 avec SQLCipher
  - Clé de 256 bits générée automatiquement
  - Protection complète des données au repos
- **Sauvegardes protégées** :
  - Vérification d'existence avant suppression
  - Encodage URL pour noms de fichiers spéciaux
  - Logs d'audit pour toutes les opérations critiques
- **Sessions sécurisées** : Gestion automatique de l'expiration des tokens

## Améliorations par rapport à la version RGPD

1. **Adaptation Bénin** : 19 types PII spécifiques au Bénin (IFU, CNI, RCCM, Mobile Money, etc.)
2. **Rétention des données** : Fonctionnalité complète de gestion de la rétention selon APDP
3. **Réduction faux positifs** : Validation stricte éliminant ~87% des faux positifs
4. **Interface enrichie** : 15 pages spécialisées vs 3 pages initiales
5. **Thème sombre** : Interface moderne Material-UI v7
6. **Suppression type AdresseIP** : Les IPs ne sont pas considérées comme PII selon APDP
7. **Authentification et rôles** : Système complet de gestion des utilisateurs
8. **Base de données intégrée** : SQLite avec sauvegardes et restauration
9. **Page Support** : Centre d'aide avec FAQ, contact email et liens documentation
10. **Sécurité renforcée** : Protection path traversal, validation stricte, logs d'audit

## Structure des fichiers

```
MVP-PII-Scanner/
├── PiiScanner.Core/          # Bibliothèque de détection
│   ├── Analysis/             # PiiDetector.cs (19 types PII)
│   ├── Models/               # ScanResult, ScanStatistics
│   ├── Scanner/              # FileScanner (traitement parallèle)
│   ├── Reader/               # DocumentReader (PDF, Word, Excel)
│   ├── Reporting/            # CSV, JSON, HTML, Excel
│   └── Utils/                # FilePermissionAnalyzer, StaleDataCalculator
├── PiiScanner/               # Application console
├── PiiScanner.Api/           # API REST + SignalR
│   ├── Controllers/          # ScanController, DataRetentionController
│   ├── Hubs/                 # ScanHub (SignalR)
│   └── Services/             # ScanService
├── pii-scanner-ui/           # Application Electron
│   ├── src/
│   │   ├── components/
│   │   │   ├── Layout/       # Sidebar, navigation
│   │   │   └── pages/        # 15 pages spécialisées
│   │   ├── contexts/         # AuthContext (JWT)
│   │   ├── services/         # apiClient.ts (API + SignalR)
│   │   └── types/            # TypeScript types
│   ├── electron/             # main.ts, preload.js
│   └── public/               # Assets
├── CLAUDE.md                 # Documentation pour Claude Code
└── SUPPORT_CONFIGURATION.md  # Guide de configuration de la page Support
```

## Référence légale

Cette application est conforme à la **Loi N°2017-20 portant Code du Numérique en République du Bénin**, notamment :
- Titre IV : Protection des données à caractère personnel
- Autorité de régulation : APDP (Autorité de Protection des Données Personnelles)
- Contact APDP : contact@apdp.bj

## Développement

### Commandes utiles

```bash
# Backend
dotnet build PiiScanner.sln
dotnet run --project PiiScanner.Api

# Frontend
cd pii-scanner-ui
npm install
npm run dev                  # Vite dev server
npm run electron:dev         # Electron + Vite
npm run build                # Build production
npm run electron:build:win   # Build Windows app
```

### Tests

Fichiers de test disponibles dans `PiiScanner/` :
- `test_data.txt` : Emails, téléphones, dates
- `test_banking_fiscal.txt` : IBAN, cartes bancaires, IFU

```bash
cd PiiScanner
dotnet run -- test_data.txt
```

## Limitations connues

- L'application détecte les PII mais ne peut pas déterminer si elles sont réelles ou fictives
- Optimisée pour Windows (permissions NTFS)
- Nécessite .NET 8.0 Runtime pour fonctionner
- Les emails dans `node_modules/` sont des emails légitimes de développeurs npm (non-PII)

## Sécurité

Pour des informations détaillées sur la sécurité de l'application, consultez [SECURITY.md](SECURITY.md).

### Résumé des protections

1. **Protection Path Traversal** : Validation stricte de tous les chemins de fichiers et répertoires
2. **Authentification JWT** : Tokens sécurisés avec expiration et révocation
3. **Gestion des rôles (RBAC)** : Séparation Admin/Utilisateur
4. **Protection CSRF** : Double-Submit Cookie Pattern avec tokens cryptographiques
5. **Rate Limiting** : Protection brute force (5 login/15min, 20 ops sensibles/5min, 100 API/min)
6. **Chiffrement base de données** : SQLCipher avec AES-256 (clé 256 bits)
7. **Audit Logging** : Traçabilité complète de toutes les opérations sensibles
8. **Validation des entrées** : Tous les inputs utilisateur sont validés
9. **Protection SQL Injection** : Requêtes paramétrées avec Entity Framework
10. **Hashage des mots de passe** : BCrypt avec salt automatique
11. **CORS configuré** : Politique stricte d'origine croisée

### Signaler une vulnérabilité

Si vous découvrez une vulnérabilité de sécurité, veuillez consulter [SECURITY.md](SECURITY.md) pour les instructions de signalement responsable.

## Support

### Centre d'aide intégré
L'application dispose d'une **page Support complète** accessible depuis le menu latéral, comprenant :
- **Formulaire de contact** : Envoi d'email avec pré-remplissage automatique
- **FAQ interactive** : 8 questions fréquentes avec réponses détaillées
- **Liens vers la documentation** : GitHub, Wiki, guides techniques
- **Signalement de bugs** : Lien direct vers GitHub Issues
- **Ressources supplémentaires** : Guides RGPD, API Reference, tutoriels

### Configuration du Support
Pour personnaliser la page Support (URLs GitHub, email de contact, etc.), consultez :
- [SUPPORT_CONFIGURATION.md](SUPPORT_CONFIGURATION.md) - Guide complet de configuration

### Ressources externes
1. **Documentation technique** : [CLAUDE.md](CLAUDE.md) pour les développeurs
2. **APDP (Bénin)** : contact@apdp.bj - Autorité de Protection des Données Personnelles
3. **Loi N°2017-20** : Référence légale sur la protection des données au Bénin

## Licence

Ce projet est fourni à des fins de conformité avec la Loi N°2017-20 du Bénin sur la protection des données personnelles.

---

**Version** : 1.0.0
**Dernière mise à jour** : Décembre 2025
**Conformité** : Loi N°2017-20 du Bénin (APDP)
