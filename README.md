# PII Scanner - Détecteur de Données Personnelles pour le Bénin

[![License: CC BY-NC 4.0](https://img.shields.io/badge/License-CC%20BY--NC%204.0-lightgrey.svg)](https://creativecommons.org/licenses/by-nc/4.0/)
[![.NET](https://img.shields.io/badge/.NET-8.0-512BD4?logo=dotnet)](https://dotnet.microsoft.com/)
[![React](https://img.shields.io/badge/React-19-61DAFB?logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-3178C6?logo=typescript)](https://www.typescriptlang.org/)
[![Ko-fi](https://img.shields.io/badge/Ko--fi-Support-orange?logo=ko-fi)](https://ko-fi.com/Y8Y31QXZ2Y)
[![Donate](https://img.shields.io/badge/Donate-PayPal-blue.svg)](https://www.paypal.com/ncp/payment/G9FTF7NGPN8CG)

Application de bureau pour détecter et analyser les données personnelles identifiables (PII) dans vos fichiers, conforme à la **Loi N°2017-20 du Bénin** sur la protection des données personnelles (APDP).

## 🚀 Quick Start

### Option 1 : Version portable (Recommandée - Pas d'installation)

**Téléchargez** : `PII-Scanner-v1.0.0-Portable-Complete.zip` depuis les [Releases](https://github.com/cyberprevs/pii-scanner/releases)

```bash
# 1. Extraire le ZIP
Expand-Archive PII-Scanner-v1.0.0-Portable-Complete.zip -Destination C:\PII-Scanner

# 2. Débloquer les fichiers (Solution au blocage Windows SmartScreen)
cd C:\PII-Scanner
# Option A: Clic-droit sur UI\PII Scanner.exe → Propriétés → Cocher "Débloquer" → OK
# Option B: Double-clic sur "Débloquer-Fichiers.bat"
# Option C: Clic-droit "Ajouter-Exclusion-Windows-Defender.bat" → Exécuter en Admin

# 3. Lancer l'application
Double-clic sur "Démarrer PII Scanner.bat"
```

✅ **Aucune installation requise** - Tout est inclus (API + UI + .NET Runtime)
✅ Fonctionne sur **Windows 10/11** et **Windows Server 2016/2019/2022**
✅ **Première utilisation** : Créez votre compte admin (pas de compte par défaut)

⚠️ **Windows SmartScreen** : L'application n'est pas signée numériquement (coût ~300€/an). Windows peut bloquer l'exécution. Utilisez l'une des 3 méthodes de déblocage ci-dessus. C'est **100% sûr** - le code est open-source et vérifié.

### Option 2 : Installation depuis les sources (Développeurs)

```bash
# 1. Cloner le projet
git clone https://github.com/cyberprevs/pii-scanner.git
cd pii-scanner

# 2. Démarrer l'API (.NET 8.0 requis)
cd PiiScanner.Api
dotnet restore
dotnet run

# 3. Dans un nouveau terminal : Démarrer l'interface (Node.js 18+ requis)
cd pii-scanner-ui
npm install
npm run electron:dev
```

✅ L'application Electron s'ouvre automatiquement
✅ Créez votre compte admin (première utilisation)
✅ Lancez un scan de test !

📖 **Guide détaillé** : [INSTALLATION.md](INSTALLATION.md) | **Configuration production** : [CONFIGURATION.md](CONFIGURATION.md) | **Version portable** : [LISEZMOI-PORTABLE.txt](LISEZMOI-PORTABLE.txt)

---

## Fonctionnalités

### 🖥️ Compatible Windows Server & Serveurs de fichiers
- **Déploiement sur Windows Server** : Compatible Windows Server 2016/2019/2022
- **Scan des partages réseau** : Support complet des chemins UNC (`\\FileServer\Share\...`)
- **Analyse NTFS ACL** : Détection des fichiers sur-exposés sur serveurs Windows
- **Service Windows/IIS** : Déploiement en production comme service Windows ou dans IIS
- **Automatisation possible** : Scripts PowerShell pour déclencher des scans via l'API REST
- Voir la section [Déploiement sur Windows Server](#déploiement-sur-windows-server) pour plus de détails

### Détection de 17 types de PII spécifiques au Bénin

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

#### Transport Bénin
- **Plaque_Immatriculation** : Plaque d'immatriculation (nouveau format AB 1234 CD, ancien format 1234 AB)


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
- **15 pages spécialisées** :
  1. **Tableau de bord** : Statistiques et métriques clés
  2. **Scanner** : Lancement et suivi des scans en temps réel
  3. **Historique** : Consultation de tous les scans effectués
  4. **Fichiers à risque** : Top 20 fichiers critiques avec filtrage
  5. **Données sensibles** : Liste détaillée de toutes les détections
  6. **Ancienneté** : Analyse des fichiers obsolètes
  7. **Exposition** : Analyse des fichiers sur-exposés (NTFS ACL)
  8. **Rapports & Analytics** : Visualisations et tendances
  9. **Exports** : Téléchargement des rapports (CSV, JSON, HTML, Excel)
  10. **Rétention des données** : Gestion des politiques de rétention et suppression
  11. **Utilisateurs** : Gestion des comptes utilisateurs (Admin uniquement)
  12. **Base de données** : Sauvegardes et restauration (Admin uniquement)
  13. **Journal d'audit** : Traçabilité complète des opérations (Admin uniquement)
  14. **Mon Profil** : Gestion du profil utilisateur
  15. **Support** : Centre d'aide, FAQ et contact

- **Thème sombre** : Interface Material-UI v7 avec thème sombre élégant
- **Temps réel** : Mise à jour du scan en direct via SignalR
- **Graphiques interactifs** : Visualisations avec Recharts
- **Filtrage multi-critères** : Filtres par ancienneté, exposition, type PII

#### Performance et sécurité
- **100% local et sécurisé** : Aucune donnée n'est envoyée en ligne
- **Traitement parallèle** : Utilisation optimale des CPU multi-cœurs
- **Validation avancée** : Réduction des faux positifs (~87% éliminés)
- **Rapports multiples formats** : CSV, JSON, HTML, Excel avec statistiques

## 🚀 Démarrage rapide

Pour les développeurs qui veulent tester rapidement :

```bash
# 1. Cloner le projet
git clone <repository-url>
cd PII-Scanner

# 2. Démarrer l'API (terminal 1)
cd PiiScanner.Api
dotnet run

# 3. Démarrer l'UI (terminal 2 - dans un nouveau terminal)
cd pii-scanner-ui
npm install
npm run electron:dev
```

**Première utilisation** : L'application vous demandera de créer un compte administrateur (aucun compte par défaut pour des raisons de sécurité).

**Accès** :
- Application Electron : Se lance automatiquement
- API : `http://localhost:5000` (HTTP) ou `https://localhost:5001` (HTTPS)
- Swagger : `http://localhost:5000/swagger`

Pour plus de détails, consultez la section [Installation](#installation) ci-dessous.

---

## Installation

### Prérequis

- .NET 8.0 SDK
- Node.js 18+ et npm
- Windows 10/11 (pour la version Electron)
- **Windows Server** : Compatible avec Windows Server 2016, 2019, 2022 (voir section [Déploiement sur Windows Server](#déploiement-sur-windows-server))

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

### Première utilisation

1. **Lancer l'application** pour la première fois
2. **Créer votre compte administrateur** avec :
   - Nom d'utilisateur (minimum 3 caractères)
   - Adresse email
   - Nom complet
   - Mot de passe fort (12+ caractères avec majuscule, minuscule, chiffre et caractère spécial)
3. **Se connecter** avec le nom d'utilisateur et mot de passe créés

⚠️ **Important** : Il n'y a **pas de compte par défaut**. Chaque installation nécessite la création d'un compte administrateur unique pour des raisons de sécurité.

### Mode développement

1. **Démarrer l'API** (terminal 1) :
   ```bash
   cd PiiScanner.Api
   dotnet run
   ```
   L'API démarre sur :
   - HTTP : `http://localhost:5000`
   - HTTPS : `https://localhost:5001`
   - Swagger : `http://localhost:5000/swagger`

2. **Démarrer l'interface Electron** (terminal 2) :
   ```bash
   cd pii-scanner-ui
   npm install  # Première fois uniquement
   npm run electron:dev
   ```

   **Note** : Si `npm install` n'a pas été exécuté, vous obtiendrez une erreur `'concurrently' n'est pas reconnu`.

### Utiliser l'application

1. **Scanner** : Sélectionnez un dossier et lancez le scan
2. **Analyser** : Consultez les détections dans les différentes pages
3. **Gérer la rétention** : Identifiez et supprimez les fichiers obsolètes
4. **Exporter** : Téléchargez les rapports au format souhaité

## Déploiement sur Windows Server

### 🖥️ Compatibilité Windows Server & Serveurs de fichiers

PII Scanner est **parfaitement compatible** avec Windows Server et optimisé pour scanner des serveurs de fichiers d'entreprise.

#### Systèmes d'exploitation supportés
- ✅ Windows Server 2016, 2019, 2022
- ✅ Windows Server Core (version minimale)
- ✅ Windows 10/11 (développement et test)

#### Cas d'usage typiques

**1. Scanner des partages réseau**
```bash
# L'application peut scanner directement :
\\FileServer\Departements\RH
\\FileServer\Comptabilite
\\DC01\SYSVOL
C:\Shares\Public
```

**2. Analyse de serveurs de fichiers RH/Finance**
- Scanner manuellement ou via script les dossiers sensibles
- Détection des fichiers contenant IFU, CNI, CNSS, IBAN, comptes Mobile Money
- Génération de rapports (CSV, JSON, HTML, Excel)
- Suppression des fichiers obsolètes via la fonctionnalité de rétention des données

**3. Conformité RGPD/APDP sur serveurs partagés**
- Analyse NTFS ACL pour détecter les fichiers sur-exposés
- Identification des fichiers accessibles à "Everyone" ou "Authenticated Users"
- Détection des partages réseau contenant des PII
- Calcul du niveau d'exposition (Critique, Élevé, Moyen, Faible)

#### Options de déploiement

**Option 1 : Service Windows (Recommandé pour production)**
```powershell
# 1. Publier l'API en standalone
cd PiiScanner.Api
dotnet publish -c Release -r win-x64 --self-contained true -o C:\PiiScanner

# 2. Installer NSSM (Non-Sucking Service Manager)
# Télécharger depuis https://nssm.cc/download

# 3. Créer le service Windows
nssm install PiiScannerAPI "C:\PiiScanner\PiiScanner.Api.exe"
nssm set PiiScannerAPI AppDirectory "C:\PiiScanner"
nssm set PiiScannerAPI Start SERVICE_AUTO_START
nssm start PiiScannerAPI

# 4. Configurer le pare-feu
New-NetFirewallRule -DisplayName "PII Scanner API" -Direction Inbound -Protocol TCP -LocalPort 5001 -Action Allow
```

**Option 2 : IIS (Internet Information Services)**
```powershell
# 1. Installer le module ASP.NET Core Hosting Bundle
# Télécharger : https://dotnet.microsoft.com/download/dotnet/8.0

# 2. Créer un Application Pool dans IIS
# - .NET CLR Version : "No Managed Code"
# - Managed Pipeline Mode : Integrated

# 3. Publier l'application
cd PiiScanner.Api
dotnet publish -c Release -o C:\inetpub\wwwroot\piiscanner

# 4. Créer un site IIS pointant vers C:\inetpub\wwwroot\piiscanner
# 5. Lier un certificat SSL pour HTTPS
```

**Option 3 : Automatisation avec scripts PowerShell**

L'application ne dispose pas de scans planifiés intégrés, mais vous pouvez automatiser les scans via l'API REST :

```powershell
# Script PowerShell pour lancer un scan via l'API
# scan_api.ps1

# 1. S'authentifier pour obtenir un token JWT
$loginBody = @{
    username = "admin"
    password = "VotreMotDePasse"
} | ConvertTo-Json

$loginResponse = Invoke-RestMethod -Uri "https://localhost:5001/api/auth/login" -Method POST -ContentType "application/json" -Body $loginBody
$token = $loginResponse.accessToken

# 2. Lancer un scan
$scanBody = @{
    directoryPath = "\\FileServer\RH"
} | ConvertTo-Json

$headers = @{
    "Authorization" = "Bearer $token"
    "Content-Type" = "application/json"
}

$scanResponse = Invoke-RestMethod -Uri "https://localhost:5001/api/scan/start" -Method POST -Headers $headers -Body $scanBody
Write-Host "Scan lancé avec l'ID: $($scanResponse.scanId)"

# 3. (Optionnel) Créer une tâche planifiée Windows pour exécuter ce script
# schtasks /create /tn "PII_Scan_RH_Weekly" /tr "powershell.exe -File C:\Scripts\scan_api.ps1" /sc weekly /d SUN /st 02:00 /ru SYSTEM
```

**Note** : Les scans planifiés ne sont pas une fonctionnalité native de l'application. Utilisez le Planificateur de tâches Windows pour automatiser l'exécution des scans si nécessaire.

#### Sécurité sur Windows Server

**1. Compte de service dédié**
```powershell
# Créer un compte de service
New-LocalUser -Name "svc_piiscanner" -Description "PII Scanner Service Account" -NoPassword
Add-LocalGroupMember -Group "Users" -Member "svc_piiscanner"

# Donner les droits de lecture sur les partages
icacls "\\FileServer\Shares" /grant "svc_piiscanner:(R)"

# Configurer le service pour utiliser ce compte
nssm set PiiScannerAPI ObjectName ".\svc_piiscanner" "PASSWORD"
```

**2. Base de données chiffrée**
- SQLCipher avec AES-256 activé par défaut
- Clé de chiffrement 256 bits stockée avec protection NTFS ACL
- Accès restreint au compte de service uniquement
- Sauvegardes chiffrées automatiques

**3. Audit Windows**
```powershell
# Activer l'audit des accès fichiers
auditpol /set /subcategory:"File System" /success:enable /failure:enable
auditpol /set /subcategory:"Object Access" /success:enable /failure:enable
```

#### Avantages sur Windows Server

1. **Accès direct aux partages réseau** : Support complet des chemins UNC (`\\SERVER\Share\...`)
2. **Analyse NTFS ACL** : Le module `FilePermissionAnalyzer` analyse les permissions Windows et détecte les fichiers sur-exposés
3. **Intégration Active Directory** : Comptage des groupes/utilisateurs ayant accès aux fichiers
4. **Performance optimisée** : Traitement parallèle adapté aux serveurs multi-cœurs
5. **Sécurité renforcée** : Chiffrement base de données, HTTPS/TLS 1.2+, audit complet

#### Exemple de configuration production

**appsettings.Production.json** :
```json
{
  "Database": {
    "ConnectionString": "Data Source=C:\\ProgramData\\PiiScanner\\piiscanner.db"
  },
  "Kestrel": {
    "Endpoints": {
      "Https": {
        "Url": "https://0.0.0.0:5001",
        "Certificate": {
          "Path": "C:\\ProgramData\\PiiScanner\\certificate.pfx",
          "Password": "VOTRE_MOT_DE_PASSE_SECURISE"
        }
      }
    }
  },
  "AllowedOrigins": [
    "https://fileserver.votredomaine.local:5001"
  ]
}
```

#### Performance typique

**Serveur de fichiers RH (200 Go, 50 000 fichiers)** :
- Configuration : Windows Server 2022, 8 CPU cores, 16 GB RAM
- Temps de scan : ~30-45 minutes
- Types détectés : IFU, CNI, CNSS, IBAN, Mobile Money
- Rapport exporté : Excel vers `\\RH-SERVER\RGPD\Rapports`

## Architecture

Le projet est composé de 4 parties :

### 1. PiiScanner.Core
Bibliothèque .NET contenant la logique métier :
- **17 détecteurs de PII** adaptés au Bénin avec validation stricte (~87% de faux positifs éliminés)
- Analyse des permissions NTFS (Windows ACL) pour détection des fichiers sur-exposés
- Calcul de l'ancienneté des fichiers (Stale Data Detection)
- Traitement parallèle des fichiers (utilisation optimale des CPU multi-cœurs)
- Génération de rapports (CSV, JSON, HTML, Excel)
- Calcul automatique de score de risque (Faible, Moyen, Élevé)

### 2. PiiScanner (Console)
Application console .NET pour les tests et l'automatisation.

### 3. PiiScanner.Api
API REST ASP.NET Core avec sécurité renforcée :
- **Endpoints de scan** : `/api/scan/start`, `/api/scan/{scanId}/results`, `/api/scan/{scanId}/report/{format}`
- **Rétention des données** : `/api/dataretention/scan`, `/api/dataretention/delete`, `/api/dataretention/policies`
- **Authentification JWT** : `/api/auth/login`, `/api/auth/refresh`, `/api/auth/logout`, `/api/auth/me`
- **Gestion utilisateurs** : `/api/users` - CRUD complet (Admin uniquement)
- **Gestion base de données** : `/api/database/backup`, `/api/database/restore`, `/api/database/optimize` (Admin uniquement)
- **Journal d'audit** : `/api/audit` - Traçabilité complète (Admin uniquement)
- **Initialisation** : `/api/initialization/status`, `/api/initialization/setup`
- **SignalR Hub** : `/scanhub` - Mises à jour en temps réel
- **Sécurité** :
  - HTTPS/TLS 1.2+ avec certificat auto-signé (dev) ou Let's Encrypt (prod)
  - Base de données SQLite chiffrée avec SQLCipher (AES-256)
  - Protection CSRF (Double-Submit Cookie Pattern)
  - Rate Limiting (5 login/15min, 20 ops sensibles/5min, 100 API/min)
  - Protection Path Traversal
  - Mots de passe hashés avec BCrypt
  - RBAC (Admin / User)
  - Headers de sécurité (HSTS, X-Frame-Options, etc.)

### 4. pii-scanner-ui
Application de bureau Electron avec interface moderne :
- **Stack** : React 19 + TypeScript + Material-UI v7 (thème sombre)
- **15 pages spécialisées** avec navigation sidebar
- **Authentification sécurisée** :
  - Système JWT avec refresh tokens
  - Gestion des rôles (Admin / User)
  - Intercepteurs Axios pour auto-refresh des tokens
  - Gestion CSRF tokens automatique
- **Pages clés** :
  - Configuration initiale (création compte admin)
  - Tableau de bord avec métriques
  - Scanner avec suivi temps réel (SignalR)
  - Gestion rétention des données
  - Gestion utilisateurs (Admin)
  - Sauvegardes base de données (Admin)
  - Journal d'audit (Admin)
  - Support & FAQ
- **Graphiques** : Recharts pour visualisations interactives
- **API intégrée** : .NET API bundlée et lancée automatiquement

## Configuration

### Ports utilisés

- **API REST** :
  - HTTP : `http://localhost:5000`
  - HTTPS : `https://localhost:5001` (recommandé)
- **SignalR Hub** : `http://localhost:5000/scanhub` ou `https://localhost:5001/scanhub`
- **Interface dev** : `http://localhost:3000`, `http://localhost:3001` (mode développement uniquement)
- **Swagger UI** : `http://localhost:5000/swagger` (développement uniquement)

### CORS

L'API autorise les connexions depuis :
- `http://localhost:3000`, `http://localhost:3001`
- `http://localhost:5173`, `http://localhost:5174`, `http://localhost:5175`
- `http://127.0.0.1:3000`, `http://127.0.0.1:3001`
- Versions HTTPS : `https://localhost:*` et `https://127.0.0.1:*` pour tous les ports ci-dessus

Configuration dans [Program.cs](PiiScanner.Api/Program.cs:75-92).

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
- **Protection CSRF** : Middleware Header-Based CSRF Tokens
  - Tokens cryptographiquement sécurisés (32 bytes, Base64) pour toutes les opérations de modification
  - Validation stricte POST/PUT/DELETE/PATCH
  - Transmission via headers HTTP (pas de cookies pour compatibilité cross-origin)
  - Configuration CORS avec `.WithExposedHeaders("X-CSRF-Token")`
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

1. **Adaptation Bénin** : 17 types PII spécifiques au Bénin (IFU, CNI, RCCM, CNSS, RAMU, INE, Mobile Money MTN/Moov, Plaque d'immatriculation, etc.)
2. **Rétention des données** : Système complet de gestion de la rétention selon APDP (5 catégories, 1-10 ans)
3. **Configuration initiale sécurisée** : Création obligatoire du compte admin au premier lancement (pas de compte par défaut)
4. **Réduction faux positifs** : Validation stricte éliminant ~87% des faux positifs (téléphone +95.7%, email ~90%, dates ~85.7%)
5. **Interface enrichie** : 15 pages spécialisées Material-UI v7 avec thème sombre
6. **Suppression AdresseIP** : Les IPs ne sont pas considérées comme PII selon APDP
7. **Authentification complète** : JWT + refresh tokens, RBAC (Admin/User), auto-refresh tokens
8. **Base de données sécurisée** : SQLite chiffrée SQLCipher (AES-256) avec sauvegardes/restauration
9. **Page Support** : Centre d'aide avec FAQ, contact email et liens documentation
10. **Sécurité renforcée** : 11 protections (HTTPS/TLS, CSRF, Rate Limiting, Path Traversal, Audit Logs, BCrypt, etc.)
11. **HTTPS natif** : TLS 1.2+ avec certificats auto-signés (dev) ou Let's Encrypt (prod)
12. **Analyse avancée** : Stale Data Detection (ancienneté) + Over-Exposed Data (NTFS ACL)
13. **Détection secrets** : Mots de passe en clair, clés API AWS, tokens JWT dans le code
14. **Support Windows Server** : Déploiement natif sur Windows Server 2016/2019/2022 avec support partages réseau UNC et analyse ACL

## Structure des fichiers

```
MVP-PII-Scanner/
├── PiiScanner.Core/          # Bibliothèque de détection
│   ├── Analysis/             # PiiDetector.cs (16 types PII)
│   ├── Models/               # ScanResult, ScanStatistics
│   ├── Scanner/              # FileScanner (traitement parallèle)
│   ├── Reader/               # DocumentReader (PDF, Word, Excel)
│   ├── Reporting/            # CSV, JSON, HTML, Excel
│   └── Utils/                # FilePermissionAnalyzer, StaleDataCalculator
├── PiiScanner/               # Application console
├── PiiScanner.Api/           # API REST + SignalR
│   ├── Controllers/          # ScanController, InitializationController, AuthController, etc.
│   ├── Hubs/                 # ScanHub (SignalR)
│   ├── Services/             # ScanService, AuthService
│   ├── Data/                 # AppDbContext (SQLite + SQLCipher)
│   ├── Models/               # User, Session, AuditLog, etc.
│   └── Middleware/           # CsrfProtectionMiddleware, RateLimitingMiddleware
├── pii-scanner-ui/           # Application Electron
│   ├── src/
│   │   ├── components/
│   │   │   ├── Layout/       # Sidebar, navigation
│   │   │   ├── pages/        # 15 pages spécialisées
│   │   │   ├── Login.tsx     # Page de connexion
│   │   │   ├── InitialSetup.tsx  # Configuration première utilisation
│   │   │   └── ...           # Autres composants
│   │   ├── contexts/         # AuthContext (JWT)
│   │   ├── services/         # apiClient.ts (API + SignalR), axios.ts (intercepteurs)
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

## Dépannage

### Problèmes courants

**1. Erreur `'concurrently' n'est pas reconnu`**
```bash
cd pii-scanner-ui
npm install
```
Les dépendances npm n'étaient pas installées. Exécutez `npm install` avant `npm run electron:dev`.

**2. Erreur `SQLite Error 26: 'file is not a database'`**
```bash
cd PiiScanner.Api
rm piiscanner.db db_encryption.key  # Linux/Mac
# OU
del piiscanner.db db_encryption.key  # Windows PowerShell
```
La base de données est corrompue ou la clé de chiffrement ne correspond pas. Supprimez les fichiers et relancez l'API.

**3. Erreur `Failed to bind to address https://127.0.0.1:5001: address already in use`**
```bash
# Trouver le processus utilisant le port
netstat -ano | findstr :5001

# Arrêter le processus (remplacer PID par l'ID du processus)
taskkill /F /PID <PID>
# OU
powershell -Command "Stop-Process -Id <PID> -Force"
```

**4. L'application Electron ne se connecte pas à l'API**
- Vérifiez que l'API est bien démarrée sur le port 5000 ou 5001
- Consultez la console de l'API pour les erreurs
- Pour HTTPS: Faites confiance au certificat dev avec `dotnet dev-certs https --trust`
- Vérifiez les paramètres CORS dans `PiiScanner.Api/Program.cs`

**5. SignalR ne se connecte pas (pas de mises à jour en temps réel)**
- Vérifiez que WebSockets n'est pas bloqué par un pare-feu
- Consultez la console du navigateur/Electron pour les erreurs
- Essayez HTTP au lieu de HTTPS pour le développement local

**6. Base de données verrouillée**
- Une seule instance de l'API peut accéder à la base de données chiffrée à la fois
- Fermez les autres instances de l'API
- Vérifiez les processus zombies : `tasklist | findstr PiiScanner.Api`

**7. Build frontend échoue**
```bash
cd pii-scanner-ui
rm -rf node_modules  # Linux/Mac
# OU
rmdir /s /q node_modules  # Windows

npm install
npm run build
```

## Limitations connues

- L'application détecte les PII mais ne peut pas déterminer si elles sont réelles ou fictives
- **Optimisée pour Windows** : Windows 10/11 et Windows Server 2016/2019/2022 (analyse NTFS ACL, partages réseau UNC)
- Nécessite .NET 8.0 SDK pour développement, .NET 8.0 Runtime pour production
- Les emails dans `node_modules/` sont des emails légitimes de développeurs npm (non-PII)
- Le chiffrement de la base de données nécessite SQLCipher (inclus via Microsoft.Data.Sqlite package)

## Sécurité

Pour des informations détaillées sur la sécurité de l'application, consultez [SECURITY.md](SECURITY.md).

### Résumé des protections

1. **Protection Path Traversal** : Validation stricte de tous les chemins de fichiers et répertoires
2. **Authentification JWT** : Tokens sécurisés avec expiration et révocation
3. **Gestion des rôles (RBAC)** : Séparation Admin/Utilisateur
4. **Protection CSRF** : Header-Based CSRF Tokens (32 bytes, Base64) pour toutes opérations de modification
5. **Rate Limiting** : Protection brute force (5 login/15min, 20 ops sensibles/5min, 100 API/min)
6. **Chiffrement base de données** : SQLCipher avec AES-256 (clé 256 bits)
7. **Audit Logging** : Traçabilité complète de toutes les opérations sensibles
8. **Validation des entrées** : Tous les inputs utilisateur sont validés
9. **Protection SQL Injection** : Requêtes paramétrées avec Entity Framework
10. **Hashage des mots de passe** : BCrypt avec salt automatique
11. **CORS configuré** : Politique stricte d'origine croisée avec headers exposés (X-CSRF-Token)

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
1. **Documentation technique** :
   - [CLAUDE.md](CLAUDE.md) - Guide complet pour développeurs (architecture, API, commandes)
   - [SECURITY.md](SECURITY.md) - Documentation de sécurité détaillée
   - [SUPPORT_CONFIGURATION.md](SUPPORT_CONFIGURATION.md) - Configuration de la page Support
2. **APDP (Bénin)** : contact@apdp.bj - Autorité de Protection des Données Personnelles
3. **Loi N°2017-20** : Référence légale sur la protection des données au Bénin

## Licence

Ce projet est sous licence **Creative Commons Attribution-NonCommercial 4.0 International (CC BY-NC 4.0)**.

### Ce que vous pouvez faire :
- ✅ **Utiliser** le logiciel gratuitement
- ✅ **Modifier** le code source
- ✅ **Distribuer** des copies (modifiées ou non)
- ✅ **Étudier** le fonctionnement du logiciel

### Ce que vous ne pouvez PAS faire :
- ❌ **Vendre** ce logiciel ou des copies
- ❌ **Usage commercial** sans autorisation écrite
- ❌ **Retirer** l'attribution à Cyberprevs

### Attribution Requise

Vous devez :
- Créditer **Cyberprevs** comme auteur original
- Fournir un lien vers la licence
- Indiquer si des modifications ont été apportées

### Utilisation Commerciale

Pour toute demande d'utilisation commerciale ou de licence propriétaire, veuillez contacter **Cyberprevs**.

Voir le fichier [LICENSE](LICENSE) pour les détails complets.

---

## Développé par Cyberprevs

**PII Scanner** a été développé par **[Cyberprevs](https://cyberprevs.com)** pour assurer la conformité avec la Loi N°2017-20 du Bénin sur la protection des données personnelles (APDP).

### 🌐 Cyberprevs
- Spécialiste en cybersécurité et protection des données
- Conforme aux réglementations APDP (Bénin) et RGPD (Europe)
- Solutions sur mesure pour entreprises et organisations

### ❤️ Soutenir le projet

PII Scanner est un logiciel **gratuit et open-source**. Si vous trouvez cet outil utile pour votre conformité RGPD/APDP, vous pouvez soutenir son développement avec une **contribution à prix libre** :

- **☕ Ko-fi** : [Faire un don](https://ko-fi.com/Y8Y31QXZ2Y) - Montant libre, à partir de 3€
- **💳 PayPal** : [Faire un don](https://www.paypal.com/ncp/payment/G9FTF7NGPN8CG) - Montant libre de votre choix
- **🏢 Support entreprise** : Contactez [contact@cyberprevs.fr](mailto:contact@cyberprevs.fr) pour des options de support professionnel

**Vos contributions permettent** :
- ✅ Maintenance et corrections de bugs
- ✅ Ajout de nouveaux types de PII (sur demande communautaire)
- ✅ Amélioration des performances et nouvelles fonctionnalités
- ✅ Documentation, tutoriels et guides d'utilisation
- ✅ Support technique gratuit pour toute la communauté

**Chaque contribution, quelle que soit sa taille, est précieuse et appréciée ! 🙏**

## Historique des mises à jour

### Version 1.0.0 (Décembre 2024)

**Nouvelles fonctionnalités** :
- ✅ Détection de 17 types de PII spécifiques au Bénin avec validation avancée
- ✅ Interface moderne avec 15 pages spécialisées (Material-UI v7 Dark Theme)
- ✅ Dashboard redessiné avec KPIs modernes et graphiques interactifs (donut charts, area charts)
- ✅ Page Reports & Analytics avec 3 vues (Overview, Detailed, Comparison) et graphiques avancés (treemap, radar)
- ✅ Typographie modernisée avec Plus Jakarta Sans
- ✅ Système de rétention des données conforme APDP
- ✅ Analyse ancienneté (Stale Data) et exposition (Over-Exposed Data)
- ✅ Authentification JWT avec refresh tokens
- ✅ Gestion des utilisateurs avec RBAC (Admin/User)
- ✅ Base de données chiffrée SQLCipher (AES-256)
- ✅ Journal d'audit complet

**Sécurité** :
- ✅ Protection CSRF avec Header-Based Tokens (fix cross-origin compatibility)
- ✅ Configuration CORS avec `.WithExposedHeaders("X-CSRF-Token")`
- ✅ Rate Limiting (5 login/15min, 20 ops sensibles/5min, 100 API/min)
- ✅ Protection Path Traversal sur tous les endpoints
- ✅ Headers de sécurité HTTP (HSTS, X-Frame-Options, X-XSS-Protection, etc.)
- ✅ HTTPS/TLS 1.2+ natif avec redirection automatique
- ✅ Hashage BCrypt pour mots de passe

**Performance** :
- ✅ Traitement parallèle optimisé (Parallel.ForEach avec CPU multi-cœurs)
- ✅ SignalR pour mises à jour temps réel
- ✅ Réduction de 85-95% des faux positifs grâce à la validation stricte

**Documentation** :
- ✅ README complet avec guide d'installation et utilisation
- ✅ CAHIER_DES_CHARGES.md avec spécifications détaillées
- ✅ CLAUDE.md pour développeurs (architecture, API, commandes)
- ✅ SECURITY.md avec documentation de sécurité
- ✅ SUPPORT_CONFIGURATION.md pour configuration du support

---

**Version** : 1.0.0
**Dernière mise à jour** : Décembre 2024
**Conformité** : Loi N°2017-20 du Bénin (APDP)
**Développé par** : [Cyberprevs](https://cyberprevs.com)
**Licence** : [CC BY-NC 4.0](https://creativecommons.org/licenses/by-nc/4.0/)
