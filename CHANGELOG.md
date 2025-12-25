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

**Problème de Navigation (Page Blanche)**
- **Symptôme** : Page blanche après création du compte admin
- **Cause** : React Router ne re-rendait pas correctement quand `isInitialized` changeait
- **Fix** : `App.tsx:179-192` - Ajout d'un état intermédiaire + re-vérification API
- **Résultat** : Navigation fluide vers l'écran de connexion après setup

**Problème de Conflit API**
- **Symptôme** : Erreur "Impossible de démarrer l'API: spawn ... ENOENT"
- **Cause** : Electron tentait de démarrer l'API alors que le batch script le fait déjà
- **Fix** : `electron/main.ts` - API auto-start complètement désactivé
- **Résultat** : Plus de conflit, démarrage contrôlé par batch script uniquement

#### 📚 Documentation

**Ajouts**
- Guide complet de création de package portable (INSTALLATION.md)
- 4 solutions pour Windows SmartScreen dans chaque fichier doc
- Section troubleshooting étendue avec cas portable
- Références croisées vers les correctifs de code

**Améliorations**
- README.md : Version portable comme Option 1 (recommandée)
- INSTALLATION.md : Sections démarrage rapide + dépannage complet
- CLAUDE.md : Architecture portable + problèmes connus + solutions
- LISEZMOI-PORTABLE.txt : Documentation utilisateur exhaustive en français

#### 🔧 Infrastructure

**Build Process**
- Commandes de build portable documentées
- Structure de package standardisée
- Scripts batch Windows optimisés
- Compression ZIP automatisée (~196 MB)

#### ⚠️ Problèmes Connus

**Windows SmartScreen**
- Application non signée car certificat coûte ~300€/an
- Peut afficher "Windows a protégé votre ordinateur"
- **Solutions fournies** : Exclusion Defender, déblocage PowerShell, déblocage manuel
- **Note** : Ticket ouvert avec Microsoft concernant ce problème

#### 🔒 Sécurité

Aucun changement aux fonctionnalités de sécurité (identiques à v1.0.0).

Note : JWT secret par défaut inclus pour faciliter les tests.
Pour production : Régénérer le secret avec commande PowerShell fournie.

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
