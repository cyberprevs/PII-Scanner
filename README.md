# PII Scanner - Détecteur de Données Personnelles pour le Bénin

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![.NET](https://img.shields.io/badge/.NET-9.0-512BD4?logo=dotnet)](https://dotnet.microsoft.com/)
[![React](https://img.shields.io/badge/React-19-61DAFB?logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-3178C6?logo=typescript)](https://www.typescriptlang.org/)

Application web pour détecter et analyser les données personnelles identifiables (PII) dans vos fichiers, conforme à la **Loi N°2017-20 du Bénin** (APDP).

## Quick Start

### Version portable (Recommandée)

1. Téléchargez `PII-Scanner-v1.0.0-Windows-Standalone.zip` : [Releases](https://github.com/cyberprevs/pii-scanner/releases)
2. Extrayez le ZIP
3. Lancez `START.bat`
4. Ouvrez votre navigateur : **http://localhost:5000**
5. Créez votre compte administrateur (premier compte = admin)

**Avantages** :
- Aucune installation requise - Application standalone (~73 MB, .NET 9.0 Runtime inclus)
- Compatible Windows 10/11 et Windows Server 2016+
- Mode HTTP par défaut (compatible tous environnements)
- N'importe quel navigateur - Chrome, Edge, Firefox, etc.

### Mode HTTP vs HTTPS

| Mode | Port | Usage |
|------|------|-------|
| **HTTP** (défaut) | 5000 | Windows Server, intranet |
| **HTTPS** | 5001 | Windows 10/11 avec certificat |

**Pour activer HTTPS**, voir [INSTALLATION.md](INSTALLATION.md#mode-http-vs-https)

**Guide complet** : [INSTALLATION.md](INSTALLATION.md)

### Installation depuis sources (Développeurs)

```bash
# Build automatique (recommandé)
git clone https://github.com/cyberprevs/pii-scanner.git
cd pii-scanner
.\build-standalone-release.ps1

# OU build manuel:
# 1. Build React UI
cd pii-scanner-ui
npm install && npm run build

# 2. Copier dans wwwroot
xcopy /E /I dist ..\PiiScanner.Api\wwwroot

# 3. Lancer l'application web
cd ../PiiScanner.Api
dotnet run
# Ouvrir: http://localhost:5000 (ou https://localhost:5001 si HTTPS activé)
```

**Note** : Créez votre compte admin au premier lancement (pas de compte par défaut)

---

## Fonctionnalités principales

### Détection de 17 types de PII spécifiques au Bénin

**Identité** : IFU, CNI, Passeport, RCCM, Acte de naissance
**Contact** : Email, Téléphone (+229), MTN MoMo, Moov Money
**Bancaire** : IBAN Bénin, Carte bancaire
**Santé** : CNSS, RAMU
**Éducation** : INE, Matricule fonctionnaire
**Transport** : Plaque d'immatriculation (ancien + nouveau format)
**Universel** : Date de naissance

**Validation avancée** : ~87% de réduction des faux positifs grâce à la validation post-détection

### Analyse des risques

- **Rétention des données** : Gestion automatique des fichiers obsolètes (1-10 ans)
- **Fichiers obsolètes** : Détection de PII dans des fichiers non accédés depuis longtemps
- **Sur-exposition** : Analyse NTFS ACL pour fichiers accessibles à "Everyone"
- **Fichiers dupliqués** : Détection MD5 des copies redondantes (même contenu = même risque multiplié)
- **Analyse par catégories** : Regroupement par type (Bancaire, Identité, Santé, Contact, Éducation, Transport)
- **Classification automatique** : Risque FAIBLE/MOYEN/ÉLEVÉ

### Interface web moderne

- 17 pages spécialisées : Dashboard, Scanner, Historique, Analyse par catégories, Fichiers dupliqués, Analytics, Exports, etc.
- Thème sombre Material-UI v7 avec graphiques interactifs (Recharts)
- Mise à jour en temps réel via SignalR WebSocket
- Exports avancés : CSV et Excel pour analyses par catégorie
- Gestion complète : Utilisateurs, base de données, audit logs (Admin)
- Interface responsive pour desktop et tablette

### Sécurité

- 100% local : Aucune donnée envoyée en ligne
- Base de données chiffrée avec SQLCipher (AES-256)
- Authentification JWT avec refresh tokens (7 jours + 30 jours)
- Contrôle d'accès basé sur les rôles (Admin/User)
- Protection CSRF, Rate Limiting, Path Traversal, HTTPS/TLS 1.2+
- Traçabilité complète via audit logs

### Rapports et exports

- **CSV** : Tableau simple (UTF-8, point-virgule)
- **JSON** : Données structurées avec statistiques
- **HTML** : Rapport visuel avec graphiques
- **Excel** : Fichier .xlsx (3 onglets: Stats, Fichiers à risque, Détections)

---

## Windows Server & Serveurs de fichiers

**Déploiement production** : Compatible Windows Server 2016/2019/2022

Fonctionnalités :
- Support complet des chemins UNC pour scan des partages réseau (`\\FileServer\Share\...`)
- Analyse NTFS ACL pour détection des fichiers sur-exposés
- Déploiement en tant que service Windows ou via IIS
- Automatisation via scripts PowerShell + API REST

**Guide détaillé** : Voir [Architecture > Déploiement sur Windows Server](#déploiement-sur-windows-server)

---

## Documentation

| Document | Description |
|----------|-------------|
| [INSTALLATION.md](INSTALLATION.md) | Guide d'installation complet (portable + sources) |
| [SECURITY.md](SECURITY.md) | Documentation de sécurité détaillée |
| [FEATURES.md](FEATURES.md) | Liste complète des fonctionnalités |
| [CHANGELOG.md](CHANGELOG.md) | Historique des versions |
| [CONTRIBUTING.md](CONTRIBUTING.md) | Guide de contribution |

### Tests

118 tests automatisés (88 .NET + 30 React) :

```bash
# Tests .NET
dotnet test PiiScanner.Core.Tests

# Tests React
cd pii-scanner-ui && npm run test:run
```

**Documentation complète des tests** : Voir les dossiers `PiiScanner.Core.Tests/` et `pii-scanner-ui/src/__tests__/`

---

## Architecture

### Stack technique

**Backend** : .NET 9.0, ASP.NET Core Web API, SignalR, SQLite + SQLCipher
**Frontend** : React 19, TypeScript 5.9, Material-UI v7, Recharts, Vite

### Projets

```
PII-Scanner/
├── PiiScanner.Core/          # Bibliothèque de détection PII (17 types)
├── PiiScanner.Core.Tests/    # Tests unitaires (xUnit + FluentAssertions)
├── PiiScanner.Api/           # API REST + SignalR + Authentification
├── PiiScanner/               # Application console (legacy)
└── pii-scanner-ui/           # Interface React (15 pages) + Tests Vitest
```

### API REST

**Endpoints principaux** :
- `/api/scan/*` - Scan, progression, résultats, rapports
- `/api/auth/*` - Login, refresh token, logout
- `/api/dataretention/*` - Gestion rétention des données
- `/api/users/*` - CRUD utilisateurs (Admin)
- `/api/database/*` - Backup/restore (Admin)
- `/api/audit` - Logs d'audit (Admin)

**SignalR** : `/scanhub` - Mises à jour temps réel

**Swagger UI** : `https://localhost:5001/swagger` (mode développement uniquement)

**Documentation API** : Swagger UI disponible en mode développement

---

## Déploiement sur Windows Server

### Systèmes supportés

- Windows Server 2016, 2019, 2022
- Windows Server Core
- Windows 10/11 (développement/test)

### Options de déploiement

**1. Service Windows (Recommandé)**
```powershell
# Publier l'API standalone
dotnet publish -c Release -r win-x64 --self-contained true -o C:\PiiScanner

# Installer comme service (avec NSSM)
nssm install PiiScannerAPI "C:\PiiScanner\PiiScanner.Api.exe"
nssm start PiiScannerAPI
```

**2. IIS (Internet Information Services)**
```powershell
# Publier pour IIS
dotnet publish -c Release -o C:\inetpub\wwwroot\piiscanner
# Créer site IIS + Application Pool + Certificat SSL
```

**3. Automatisation PowerShell**
```powershell
# Script pour déclencher scans via API REST
Invoke-RestMethod -Uri "http://localhost:5000/api/scan/start" -Method POST -Body $scanBody
```

**Guide complet** : [INSTALLATION.md](INSTALLATION.md)

### Cas d'usage typiques

- Scanner des partages réseau RH/Finance
- Détection PII dans `\\FileServer\Departements\`
- Analyse NTFS ACL pour conformité APDP
- Génération de rapports automatisés

---

## Dépannage rapide

| Problème | Solution |
|----------|----------|
| Windows bloque l'application | Voir [INSTALLATION.md - Windows SmartScreen](INSTALLATION.md#windows-smartscreen) |
| Port 5001 déjà utilisé | `taskkill /F /PID <PID>` |
| Base de données corrompue | Supprimer `piiscanner.db` et `db_encryption.key` |
| SignalR ne se connecte pas | Vérifier pare-feu, utiliser HTTP au lieu de HTTPS |
| Frontend build échoue | `rm -rf node_modules && npm install` |

**Dépannage complet** : [INSTALLATION.md - Dépannage](INSTALLATION.md#dépannage)

---

## Sécurité

### Protections implémentées (11 mécanismes)

1. HTTPS/TLS 1.2+ - Communication chiffrée
2. SQLCipher AES-256 - Base de données chiffrée
3. JWT + Refresh Tokens - Authentification sécurisée (7 jours + 30 jours)
4. RBAC - Séparation Admin/User
5. CSRF Protection - Header-Based Tokens (32 bytes)
6. Rate Limiting - Anti-brute force (5 tentatives/15min)
7. Path Traversal Protection - Validation stricte des chemins
8. SQL Injection Protection - Entity Framework paramétré
9. BCrypt Password Hashing - Salt automatique
10. Audit Logging - Traçabilité complète
11. Security Headers - HSTS, X-Frame-Options, CSP

### Signaler une vulnérabilité

Voir [SECURITY.md](SECURITY.md) pour les instructions de signalement responsable.

---

## Référence légale

Conforme à la **Loi N°2017-20 portant Code du Numérique en République du Bénin** :
- Titre IV : Protection des données à caractère personnel
- Autorité : APDP (Autorité de Protection des Données Personnelles)
- Contact APDP : contact@apdp.bj

---

## Licence

**MIT License**

Ce projet est distribué sous licence MIT - l'une des licences open source les plus permissives.

Permissions :
- Usage commercial autorisé - Utilisez-le librement dans vos projets commerciaux
- Modification autorisée - Adaptez le code à vos besoins
- Distribution autorisée - Partagez ou vendez le logiciel
- Usage privé autorisé - Aucune restriction

**Seule obligation** : Conserver la notice de copyright et la licence MIT dans vos copies.

Pour du support commercial, formation ou consulting, contactez [Cyberprevs](https://cyberprevs.fr).

Voir [LICENSE](LICENSE) pour le texte complet de la licence.

---

## Support

### Centre d'aide intégré

L'application dispose d'une page Support complète avec :
- Formulaire de contact
- FAQ interactive (8 questions)
- Liens documentation
- Signalement de bugs

### Ressources

- Documentation : [SECURITY.md](SECURITY.md), [INSTALLATION.md](INSTALLATION.md), [FEATURES.md](FEATURES.md)
- APDP Bénin : contact@apdp.bj
- Loi N°2017-20 : Référence légale sur la protection des données

---

**Développé par [Cyberprevs](https://cyberprevs.fr)**

**Version** : 1.0.0 | **Dernière mise à jour** : 14 Janvier 2026

**Conformité** : Loi N°2017-20 du Bénin (APDP)
