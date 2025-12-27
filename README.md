# PII Scanner - Détecteur de Données Personnelles pour le Bénin

[![License: CC BY-NC 4.0](https://img.shields.io/badge/License-CC%20BY--NC%204.0-lightgrey.svg)](https://creativecommons.org/licenses/by-nc/4.0/)
[![.NET](https://img.shields.io/badge/.NET-8.0-512BD4?logo=dotnet)](https://dotnet.microsoft.com/)
[![React](https://img.shields.io/badge/React-19-61DAFB?logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-3178C6?logo=typescript)](https://www.typescriptlang.org/)
[![Ko-fi](https://img.shields.io/badge/Ko--fi-Support-orange?logo=ko-fi)](https://ko-fi.com/Y8Y31QXZ2Y)
[![Donate](https://img.shields.io/badge/Donate-PayPal-blue.svg)](https://www.paypal.com/ncp/payment/G9FTF7NGPN8CG)

Application web pour détecter et analyser les données personnelles identifiables (PII) dans vos fichiers, conforme à la **Loi N°2017-20 du Bénin** (APDP).

## 🚀 Quick Start

### Version portable (Recommandée)

1. Téléchargez `PII-Scanner-WebApp.zip` : [Releases](https://github.com/cyberprevs/pii-scanner/releases)
2. Extrayez le ZIP
3. Lancez `Démarrer PII Scanner.bat`
4. Ouvrez votre navigateur : **https://localhost:5001**

✅ **Aucune installation requise** - Application web tout-en-un (~124 MB, .NET Runtime inclus)
✅ **Pas de certificat** - Fonctionne directement sans problème Windows SmartScreen
✅ **N'importe quel navigateur** - Chrome, Edge, Firefox, etc.

📖 **Guide complet** : [INSTALLATION.md](INSTALLATION.md)

### Installation depuis sources (Développeurs)

```bash
# Build automatique (recommandé)
git clone https://github.com/cyberprevs/pii-scanner.git
cd pii-scanner
.\BuildWebApp.ps1

# OU build manuel:
# 1. Build React UI
cd pii-scanner-ui
npm install && npm run build

# 2. Copier dans wwwroot
xcopy /E /I dist ..\PiiScanner.Api\wwwroot

# 3. Lancer l'application web
cd ../PiiScanner.Api
dotnet run
# Ouvrir: https://localhost:5001
```

✅ Créez votre compte admin au premier lancement (pas de compte par défaut)

---

## ✨ Fonctionnalités principales

### 🔍 Détection de 17 types de PII spécifiques au Bénin

**Identité** : IFU, CNI, Passeport, RCCM, Acte de naissance
**Contact** : Email, Téléphone (+229)
**Bancaire** : IBAN, Mobile Money (MTN/Moov), Carte bancaire
**Santé** : CNSS, RAMU
**Éducation** : INE, Matricule fonctionnaire
**Transport** : Plaque d'immatriculation
**Universel** : Date de naissance

→ **Validation avancée** : ~87% de réduction des faux positifs

### 🎯 Analyse des risques

- **Rétention des données** : Gestion automatique des fichiers obsolètes (1-10 ans)
- **Fichiers obsolètes** : Détection de PII dans des fichiers non accédés depuis longtemps
- **Sur-exposition** : Analyse NTFS ACL pour fichiers accessibles à "Everyone"
- **Classification automatique** : Risque FAIBLE/MOYEN/ÉLEVÉ

### 🖥️ Interface web moderne

- **15 pages spécialisées** : Dashboard, Scanner, Historique, Analytics, Exports, etc.
- **Thème sombre** : Material-UI v7 avec graphiques interactifs (Recharts)
- **Temps réel** : Mise à jour du scan via SignalR WebSocket
- **Gestion complète** : Utilisateurs, base de données, audit logs (Admin)
- **Responsive** : Fonctionne sur desktop et tablette

### 🔒 Sécurité renforcée

- **100% local** : Aucune donnée envoyée en ligne
- **Base de données chiffrée** : SQLCipher (AES-256)
- **Authentification JWT** : Tokens + refresh (7j + 30j)
- **RBAC** : Rôles Admin/User
- **Protection** : CSRF, Rate Limiting, Path Traversal, HTTPS/TLS 1.2+
- **Audit** : Traçabilité complète de toutes les opérations

### 📊 Rapports multiples formats

- **CSV** : Tableau simple (UTF-8, point-virgule)
- **JSON** : Données structurées avec statistiques
- **HTML** : Rapport visuel avec graphiques
- **Excel** : Fichier .xlsx (3 onglets: Stats, Fichiers à risque, Détections)

---

## 🖥️ Windows Server & Serveurs de fichiers

**Déploiement production** : Compatible Windows Server 2016/2019/2022

✅ **Scan des partages réseau** : Support complet des chemins UNC (`\\FileServer\Share\...`)
✅ **Analyse NTFS ACL** : Détection des fichiers sur-exposés
✅ **Service Windows/IIS** : Déploiement en production
✅ **Automatisation** : Scripts PowerShell + API REST

→ **Guide détaillé** : Voir [Architecture > Déploiement sur Windows Server](#déploiement-sur-windows-server)

---

## 📚 Documentation

| Document | Description |
|----------|-------------|
| [INSTALLATION.md](INSTALLATION.md) | Guide d'installation complet (portable + sources) |
| [CONFIGURATION.md](CONFIGURATION.md) | Configuration pour la production |
| [SECURITY.md](SECURITY.md) | Documentation de sécurité détaillée |
| [CLAUDE.md](CLAUDE.md) | Guide technique développeurs (architecture, API, build) |
| [LISEZMOI-PORTABLE.txt](LISEZMOI-PORTABLE.txt) | Guide utilisateur final (version portable) |
| [CHANGELOG.md](CHANGELOG.md) | Historique des versions |

---

## 🏗️ Architecture

### Stack technique

**Backend** : .NET 8.0, ASP.NET Core Web API, SignalR, SQLite + SQLCipher
**Frontend** : Electron 39, React 19, TypeScript 5.9, Material-UI v7, Recharts

### Projets

```
PII-Scanner/
├── PiiScanner.Core/      # Bibliothèque de détection PII (17 types)
├── PiiScanner.Api/       # API REST + SignalR + Authentification
├── PiiScanner/           # Application console (legacy)
└── pii-scanner-ui/       # Application Electron (15 pages)
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

→ **Swagger UI** : `http://localhost:5000/swagger` (mode dev)

→ **Documentation complète** : [CLAUDE.md](CLAUDE.md)

---

## 🖥️ Déploiement sur Windows Server

### Systèmes supportés

✅ Windows Server 2016, 2019, 2022
✅ Windows Server Core
✅ Windows 10/11 (dev/test)

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
# Voir exemple complet dans CLAUDE.md
Invoke-RestMethod -Uri "https://localhost:5001/api/scan/start" -Method POST -Body $scanBody
```

→ **Guide complet** : [CLAUDE.md - Déploiement sur Windows Server](CLAUDE.md#déploiement-sur-windows-server)

### Cas d'usage typiques

- Scanner des partages réseau RH/Finance
- Détection PII dans `\\FileServer\Departements\`
- Analyse NTFS ACL pour conformité APDP
- Génération de rapports automatisés

---

## 🔧 Dépannage rapide

| Problème | Solution |
|----------|----------|
| Windows bloque l'application | Voir [INSTALLATION.md - Windows SmartScreen](INSTALLATION.md#windows-smartscreen) |
| Port 5001 déjà utilisé | `taskkill /F /PID <PID>` |
| Base de données corrompue | Supprimer `piiscanner.db` et `db_encryption.key` |
| SignalR ne se connecte pas | Vérifier pare-feu, utiliser HTTP au lieu de HTTPS |
| Frontend build échoue | `rm -rf node_modules && npm install` |

→ **Dépannage complet** : [INSTALLATION.md - Dépannage](INSTALLATION.md#dépannage)

---

## 🔒 Sécurité

### Protections implémentées (11 mécanismes)

1. ✅ **HTTPS/TLS 1.2+** - Communication chiffrée
2. ✅ **SQLCipher AES-256** - Base de données chiffrée
3. ✅ **JWT + Refresh Tokens** - Authentification sécurisée (7j + 30j)
4. ✅ **RBAC** - Séparation Admin/User
5. ✅ **CSRF Protection** - Header-Based Tokens (32 bytes)
6. ✅ **Rate Limiting** - Anti-brute force (5 login/15min)
7. ✅ **Path Traversal Protection** - Validation stricte des chemins
8. ✅ **SQL Injection Protection** - Entity Framework paramétré
9. ✅ **BCrypt Password Hashing** - Salt automatique
10. ✅ **Audit Logging** - Traçabilité complète
11. ✅ **Security Headers** - HSTS, X-Frame-Options, etc.

### Signaler une vulnérabilité

Voir [SECURITY.md](SECURITY.md) pour les instructions de signalement responsable.

---

## 📖 Référence légale

Conforme à la **Loi N°2017-20 portant Code du Numérique en République du Bénin** :
- Titre IV : Protection des données à caractère personnel
- Autorité : APDP (Autorité de Protection des Données Personnelles)
- Contact APDP : contact@apdp.bj

---

## 📄 Licence

**Creative Commons Attribution-NonCommercial 4.0 International (CC BY-NC 4.0)**

✅ **Utiliser, Modifier, Distribuer** gratuitement
❌ **Usage commercial** sans autorisation écrite

Pour toute demande commerciale, contactez **[Cyberprevs](https://cyberprevs.com)**.

Voir [LICENSE](LICENSE) pour les détails complets.

---

## ❤️ Soutenir le projet

PII Scanner est **gratuit et open-source**. Soutenez son développement :

- ☕ **Ko-fi** : [Faire un don](https://ko-fi.com/Y8Y31QXZ2Y) (à partir de 3€)
- 💳 **PayPal** : [Faire un don](https://www.paypal.com/ncp/payment/G9FTF7NGPN8CG) (montant libre)
- 🏢 **Support entreprise** : [contact@cyberprevs.fr](mailto:contact@cyberprevs.fr)

**Vos contributions permettent** :
✅ Maintenance et corrections de bugs
✅ Nouvelles fonctionnalités et types de PII
✅ Documentation et support gratuit

**Chaque contribution compte ! 🙏**

---

## 📞 Support

### Centre d'aide intégré

L'application dispose d'une **page Support complète** avec :
- Formulaire de contact
- FAQ interactive (8 questions)
- Liens documentation
- Signalement de bugs

### Ressources

- **Documentation** : [CLAUDE.md](CLAUDE.md), [SECURITY.md](SECURITY.md), [INSTALLATION.md](INSTALLATION.md)
- **APDP Bénin** : contact@apdp.bj
- **Loi N°2017-20** : Référence légale sur la protection des données

---

**Développé par [Cyberprevs](https://cyberprevs.com)**
**Version** : 2.0.0 | **Dernière mise à jour** : Décembre 2024
**Conformité** : Loi N°2017-20 du Bénin (APDP)
