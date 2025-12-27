# Changelog

Tous les changements notables de ce projet seront documentés dans ce fichier.

Le format est basé sur [Keep a Changelog](https://keepachangelog.com/fr/1.0.0/),
et ce projet adhère au [Semantic Versioning](https://semver.org/lang/fr/).

## [Non publié]

### À venir
- Scan incrémental (scan uniquement des fichiers modifiés)
- Support multi-langues (anglais, français)
- Export PDF des rapports
- API REST publique avec authentification API key
- Support Linux/macOS (analyse NTFS ACL désactivée)
- Signature de code pour éliminer les avertissements Windows SmartScreen

---

## [2.0.0] - 2024-12-25

### 🎁 Version Portable

Cette version introduit un package portable complet ne nécessitant aucune installation.

#### ✨ Ajouté

**Déploiement Portable**
- Package ZIP complet (~196 MB) avec API et interface intégrées
- Script de lancement automatique (`Démarrer PII Scanner.bat`)
- API self-contained avec .NET Runtime inclus (pas d'installation .NET requise)
- Scripts de déblocage Windows SmartScreen inclus :
  - `Débloquer-Fichiers.bat` (déblocage PowerShell automatique)
  - `Ajouter-Exclusion-Windows-Defender.bat` (exclusion permanente)
- Documentation portable complète (`LISEZMOI-PORTABLE.txt`)

**Améliorations d'Architecture**
- API auto-start désactivé dans Electron pour éviter les conflits
- Batch script gère le démarrage séquentiel (API → UI)
- Délai de 8 secondes pour garantir que l'API est prête

**Documentation**
- Section "Version Portable" ajoutée à README.md
- INSTALLATION.md restructuré avec Option 1 (Portable) et Option 2 (Sources)
- CLAUDE.md étendu avec section "Portable Deployment"
- LISEZMOI-PORTABLE.txt créé avec guide utilisateur complet
- Dépannage Windows SmartScreen dans toute la documentation

#### 🐛 Corrigé

- **Page blanche après création admin** : Fix dans App.tsx avec state update + API re-check
- **Conflit démarrage API** : Auto-start Electron désactivé, batch script contrôle le démarrage

#### 📚 Documentation

- README.md réduit de 70% avec liens vers docs spécialisées
- INSTALLATION.md restructuré (Option 1: Portable, Option 2: Sources)
- CLAUDE.md avec section build portable pour développeurs
- LISEZMOI-PORTABLE.txt avec guide utilisateur complet
- Solutions Windows SmartScreen documentées partout

#### 🔧 Infrastructure

- Build portable documenté dans CLAUDE.md
- Scripts batch Windows (Démarrer, Débloquer, Exclusion Defender)
- Package ZIP ~196 MB (API + UI + .NET Runtime)

#### ⚠️ Problèmes Connus

- **Windows SmartScreen** : Application non signée (~300€/an). Solutions fournies. Ticket Microsoft ouvert.

#### 🔒 Sécurité

Aucun changement (identique à v1.0.0). JWT secret par défaut pour tests (régénérer pour production).

---

## [1.0.0] - 2024-12-25

### 🎉 Version initiale

#### ✨ Fonctionnalités principales

**Détection PII**
- Détection de 17 types de PII spécifiques au Bénin (Loi N°2017-20 APDP)
- Validation avancée des patterns (réduction ~87% des faux positifs)
- Support 7 formats de fichiers : .docx, .xlsx, .pdf, .txt, .log, .csv, .json
- Traitement parallèle optimisé (utilise tous les cœurs CPU)

**Types de PII détectés** :
- Identité : IFU, CNI Bénin, Passeport Bénin, RCCM, Acte de naissance
- Contact : Email (validation stricte), Téléphone Bénin (+229)
- Bancaire : IBAN Bénin, MTN MoMo, Moov Money, Carte bancaire (Luhn)
- Santé : CNSS, RAMU
- Éducation : INE, Matricule fonctionnaire
- Transport : Plaque d'immatriculation (formats ancien/nouveau)
- Universel : Date de naissance (validation 5-120 ans)

**Interface utilisateur**
- Application Electron avec React 19 + TypeScript
- Material-UI v7 avec thème sombre
- 15 pages spécialisées (Dashboard, Scanner, Historique, Analytics, etc.)
- Graphiques interactifs (Recharts) : donut charts, area charts, bar charts
- Mise à jour en temps réel via SignalR

**Analyse avancée**
- Classification automatique par niveau de risque (ÉLEVÉ/MOYEN/FAIBLE)
- Analyse d'obsolescence (Stale Data Detection)
- Détection des fichiers sur-exposés (NTFS ACL sur Windows)
- Calcul de score d'exposition (Critique/Élevé/Moyen/Faible)

**Gestion des données**
- Rétention des données conforme APDP (5 catégories, périodes configurables)
- Scan et suppression sécurisée des fichiers obsolètes
- Audit trail complet de toutes les suppressions

**Exports & Rapports**
- 4 formats d'export : CSV, JSON, HTML, Excel
- Rapports détaillés avec statistiques et visualisations
- Téléchargement direct depuis l'interface

**Sécurité**
- 🔐 Authentification JWT + refresh tokens (7 jours + 30 jours)
- 🛡️ RBAC avec 2 rôles (Admin, User)
- 🔒 Base de données chiffrée SQLCipher (AES-256)
- 🚀 HTTPS/TLS 1.2+ natif
- 🔑 CSRF protection (Double-Submit Cookie Pattern)
- ⏱️ Rate limiting (login 5/15min, opérations 20/5min)
- 🚫 Path traversal protection (PathValidator)
- 📝 Audit logs complet
- 🔐 Mots de passe BCrypt avec salt automatique
- 📊 11 protections de sécurité actives

**Administration**
- Gestion des utilisateurs (CRUD complet)
- Sauvegarde/restauration de base de données
- Optimisation base de données (VACUUM)
- Consultation des logs d'audit
- Gestion du profil utilisateur

**Support Windows Server**
- Compatible Windows Server 2016/2019/2022
- Support chemins UNC (`\\FileServer\Share\...`)
- Analyse NTFS ACL native
- Déploiement service Windows ou IIS
- Automatisation via PowerShell + API REST

#### 📚 Documentation

- README.md complet avec Quick Start
- INSTALLATION.md (guide pas-à-pas)
- CONFIGURATION.md (sécurité production)
- SECURITY.md (politique de sécurité)
- CLAUDE.md (documentation technique)
- CONTRIBUTING.md (guide de contribution)
- CODE_OF_CONDUCT.md (code de conduite)
- DONATIONS.md (guide dons)

#### 🔧 Infrastructure

- .NET 8.0 (backend ASP.NET Core)
- React 19 + TypeScript (frontend)
- SQLite + SQLCipher (base de données chiffrée)
- SignalR (temps réel)
- Electron (application desktop)
- GitHub Actions ready (CI/CD)

#### 🌍 Open Source

- Licence : CC BY-NC 4.0
- Dons : Ko-fi et PayPal (contribution à prix libre)
- Issues templates pour bug reports et feature requests
- Pull request template
- Code de conduite Contributor Covenant 2.1

---

## Types de changements

- `Added` pour les nouvelles fonctionnalités
- `Changed` pour les changements aux fonctionnalités existantes
- `Deprecated` pour les fonctionnalités bientôt supprimées
- `Removed` pour les fonctionnalités supprimées
- `Fixed` pour les corrections de bugs
- `Security` pour les corrections de vulnérabilités

---

**Développé par** : [Cyberprevs](https://cyberprevs.com)
**Licence** : [CC BY-NC 4.0](https://creativecommons.org/licenses/by-nc/4.0/)
