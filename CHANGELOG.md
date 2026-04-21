# Changelog

Tous les changements notables de ce projet seront documentés dans ce fichier.

Le format est basé sur [Keep a Changelog](https://keepachangelog.com/fr/1.0.0/),
et ce projet adhère au [Semantic Versioning](https://semver.org/lang/fr/).

## [2.0.0] - 2026-04-21

### 🎉 Version Majeure — Conformité APDP, Sécurité des Exports & Modernisation UI

Cette version introduit 4 nouvelles fonctionnalités de conformité **APDP** (Loi N°2017-20 du Bénin) et une modernisation complète de l'interface utilisateur (style Stripe/Datadog).

#### ✨ Ajouté — Conformité APDP

**Consentement éclairé (Art. 424-426 Code du Numérique)**
- Modal de consentement obligatoire avant le premier scan par utilisateur
- Explication des 4 modalités de traitement : accès fichiers, traitement local, stockage sécurisé, droit à l'effacement
- Case à cocher requise — bypass impossible (touche Échap désactivée, clic extérieur bloqué)
- Consentement enregistré par utilisateur dans localStorage (`scanConsent_<username>`)
- Log d'audit automatique `POST /api/audit/consent` — userId, IP, timestamp UTC

**Chiffrement AES-256-CBC des rapports exportés**
- Tous les rapports (CSV, JSON, HTML, Excel) chiffrés avec AES-256-CBC
- Dérivation PBKDF2-SHA256 : 100 000 itérations, salt aléatoire 16 bytes (NIST SP 800-132)
- Format fichier : `[salt 16B][IV 16B][données chiffrées]`, extension `.enc`
- Mot de passe **20 caractères** (~127 bits entropie) — affiché une seule fois via header `X-Report-Password`
- Dialog UI avec bouton "Copier" — mot de passe jamais persisté côté serveur

**Déchiffrement intégré (Web Crypto API)**
- Nouvelle page `/decrypt` accessible depuis la sidebar ("Déchiffrer un rapport")
- Glisser-déposer du fichier `.enc` + saisie du mot de passe
- Déchiffrement 100% navigateur (Web Crypto API) — aucune donnée envoyée en ligne
- Téléchargement automatique du fichier original déchiffré avec le bon type MIME

**Droit à l'effacement (APDP Art. 424)**
- Nouvel endpoint `DELETE /api/users/{id}/data`
- Suppression en cascade irréversible : sessions → scans → paramètres → audit logs → compte
- Dernier log conservé avec mention "Suppression des données personnelles — droit à l'effacement APDP"

**Backend**
- Nouvel endpoint `POST /api/audit/consent` (tous utilisateurs authentifiés)

#### ✨ Ajouté — Interface utilisateur

**Nouveaux composants partagés**
- `PageHeader.tsx` — en-tête standardisé pour toutes les pages : breadcrumb, icône 28px, titre (gradient optionnel), actions à droite
- `StatCard.tsx` — nouveau variant `topBorderOnly` avec `accentColor`, `trend` (↑↓ avec icône + couleur sémantique), `sparkline` (mini graphique SVG 60×24 inline)

**`designSystem.ts` enrichi**
- `glassCardSx(dark)` — helper glassmorphisme exporté (backdrop-filter blur 12px, border rgba)
- `getRechartsTooltipStyle(dark)` — tooltips Recharts thème-aware (fond, bordure, ombre selon dark/light)
- `tokens.shadows` — tokens `card` et `cardHover` pour ombres cohérentes
- `MuiTableRow` override — lignes paires alternées + hover vert doux `rgba(0,229,153,0.04)`
- Tokens light mode affinés : `bgPrimary: #F4F6F8`, `borderDefault: #E5E7EB`

**Pages modernisées (26 fichiers)**
- Dashboard, Scanner, RiskyFiles, Detections, PiiCategoryAnalysis, Staleness, Exposure, ScanHistory, Results, Exports, DuplicateFiles, DataRetention, Profile, About, Support, AuditTrail
- Migration vers `PageHeader` et `StatCard topBorderOnly` sur toutes les pages
- Recharts : CartesianGrid horizontal uniquement, tooltips thémés, animations (`animationBegin=0`)
- Charts Dashboard/PiiCategoryAnalysis : gradients `<defs>` + `linearGradient`, donut agrandi, légende personnalisée MUI
- Sidebar : indicateur de page active (barre verte 3px à gauche), user info avec `glassCardSx`

**Internationalisation**
- Interface bilingue FR/EN — détection automatique de la langue navigateur
- Clé `sidebar.decrypt` ajoutée dans `fr.json` et `en.json`
- Namespace `decrypt` complet (titre, zone drop, erreurs, note locale)

#### 🐛 Corrigé

- **ScanHistory mode mock** : appel API 401 → intercepteur axios → reload → perte session. Fix : guard `IS_MOCK` en début de `loadHistory()`
- **Reports.tsx warnings Recharts** : `ResponsiveContainer height="100%"` dans `Card height="100%"` → dimensions `-1×-1` au premier render React 18 concurrent. Fix : hauteurs fixes en pixels (`height={450}`, `height={270}`)
- **Scanner.tsx setState dans useEffect** : `wasScanning` migré vers `useRef`, `recentPaths` vers initialiseur lazy `useState`
- **Password dialog mock** : `handleDownloadReport` sans guard `IS_MOCK` → appel API silencieux. Fix : bloc `IS_MOCK` complet avec faux blob `.enc` et mot de passe mock 20 chars

#### 🔒 Sécurité

- Mot de passe exports passé de 16 à **20 caractères** (~127 bits d'entropie)
- Chiffrement systématique de tous les exports — aucun rapport en clair transmis
- Consentement traçable et auditable conforme APDP
- Droit à l'effacement opérationnel avec traçabilité finale

---

## [1.0.1] - 2026-02-28

### ✨ Ajouté

- **Ouverture du dossier depuis l'interface** : Bouton "Dossier" sur les pages *Fichiers à risque* et *Détections PII* — ouvre Windows Explorer directement sur le fichier détecté (`explorer.exe /select`)
- Nouvel endpoint backend `POST /api/scan/open-folder` avec validation du chemin (PathValidator)

### 🐛 Corrigé

- Conflit `File` / `System.IO.File` dans `ScanController.cs` (ambiguïté avec `ControllerBase.File()`)

---

## [1.0.0] - 2026-01-18

### 🎉 Version Initiale Stable - Production Ready

Première version stable de **PII Scanner** par Cyberprevs, prête pour un usage en production.

#### ✨ Fonctionnalités Principales

**Détection de PII**
- Détection automatique de **18 types de PII** conformes Loi N°2017-20 (APDP Bénin)
- Validation avancée avec réduction de ~87% des faux positifs
- Support de 7 formats : .txt, .log, .csv, .json, .docx, .xlsx, .pdf
- Traitement parallèle avec performance optimale (tous les cœurs CPU)

**Interface Web Moderne**
- Application web complète avec **17 pages spécialisées**
- Design Material-UI v7 avec thème sombre
- Graphiques interactifs (Recharts) - **layout horizontal optimisé**
- Dashboard avec statistiques en temps réel
- Navigation intuitive avec sidebar

**Sécurité & Conformité**
- ✅ Authentification JWT avec refresh tokens (7j/30j)
- ✅ Base de données SQLite chiffrée (SQLCipher AES-256)
- ✅ RBAC (Admin/User) avec audit logging complet
- ✅ Protection CSRF (Double-Submit Cookie Pattern)
- ✅ Rate limiting (100 req/min API générale, 5 req/15min login)
- ✅ Path traversal protection (PathValidator)
- ✅ Headers de sécurité (HSTS, CSP, X-Frame-Options)
- ✅ Hachage BCrypt pour les mots de passe
- ✅ 100% local - aucune donnée envoyée en ligne

**Analyse Avancée**
- **Analyse par catégories** : 6 catégories (Bancaire, Identité, Santé, Contact, Éducation, Transport)
- **Fichiers dupliqués** : Détection MD5 hash-based avec optimisation (hash uniquement si PII)
- **Graphiques optimisés** : BarChart horizontal + PieChart donut avec légende personnalisée
- Filtres multi-critères (catégorie, sensibilité, type PII)
- Export CSV/Excel enrichi

**Gestion des Données**
- Rétention des données avec 5 politiques configurables (1-10 ans)
- Scan et suppression des fichiers violant les politiques
- 4 niveaux de sensibilité : Critique, Élevé, Moyen, Faible
- Historique des scans avec persistance localStorage

**Rapports**
- 4 formats : CSV, JSON, HTML, Excel
- Rapports téléchargeables avec statistiques complètes
- Visualisations graphiques intégrées

**Administration**
- Gestion des utilisateurs (Admin only)
- Backup/Restore de base de données
- Optimisation DB (VACUUM)
- Trail d'audit complet
- Profils utilisateurs avec changement de mot de passe

#### 🔧 Architecture

**Backend (.NET 9.0)**
- ASP.NET Core Web API + SignalR
- Entity Framework Core + SQLite + SQLCipher
- 3 projets : Core, Api, Tests
- 88 tests unitaires (xUnit + FluentAssertions)

**Frontend (React 19 + TypeScript)**
- 17 pages spécialisées
- Material-UI v7 + Recharts
- 30 tests (Vitest + Testing Library)
- Bundle optimisé : 1,215 kB (gzip: 359 kB)

**Déploiement**
- Application web auto-hébergée
- Build automatisé (`build-standalone-release.ps1`)
- Package self-contained (~73 MB)
- Mode HTTP par défaut (port 5000) - compatible Windows Server
- Mode HTTPS optionnel (port 5001) - voir INSTALLATION.md

#### 🎨 Interface Utilisateur

**Pages Principales** (17 au total) :
1. Dashboard - Résultats avec graphiques
2. Scanner - Lancement de scans en temps réel
3. Historique des scans
4. Fichiers à risque (Top 20)
5. Détections PII
6. **Analyse par catégories** (avec graphiques horizontaux optimisés)
7. **Fichiers dupliqués** (MD5 hash-based)
8. Fichiers obsolètes (Staleness)
9. Fichiers surexposés (NTFS ACL)
10. Rapports
11. Exports (4 formats)
12. Rétention des données
13. Gestion des utilisateurs (Admin)
14. Base de données (Admin)
15. Trail d'audit (Admin)
16. Profil utilisateur
17. Support & À propos

**Améliorations UX**
- ✅ Persistance des résultats (localStorage + API fallback)
- ✅ Rate limiting optimisé (polling 2s au lieu de 500ms)
- ✅ Graphiques pleine largeur avec layout 70/30
- ✅ BarChart horizontal pour meilleure lisibilité
- ✅ PieChart donut avec légende personnalisée
- ✅ Pas de coupure des graphiques
- ✅ Reload automatique après création compte admin

#### 📊 Performances

- **MD5 Hash optimisé** : 10-50x plus rapide (hash uniquement si PII détecté)
- **Polling optimisé** : 2s (30 req/min) vs 500ms (120 req/min)
- **Scan parallèle** : Utilise tous les cœurs CPU disponibles
- **Bundle réduit** : Composants réutilisables (-144 lignes)

#### 🐛 Correctifs Majeurs

- ✅ Erreur 429 (Rate limiting) - Polling réduit de 500ms à 2s
- ✅ Perte des résultats après refresh - Persistance localStorage + API
- ✅ Graphiques coupés - Refonte complète avec marges et layout optimisé
- ✅ Page blanche après création compte - Reload automatique implémenté
- ✅ 500 erreur settings - Logique création/update séparée avec valeurs par défaut
- ✅ Case sensitivity URLs - Routes corrigées (/UserSettings au lieu de /usersettings)

#### 📝 Documentation

- README.md complet avec guide d'installation
- SECURITY.md avec politique de sécurité
- CONTRIBUTING.md pour contributeurs
- CODE_OF_CONDUCT.md
- FEATURES.md pour fonctionnalités détaillées
- INSTALLATION.md pour guide d'installation détaillé
- RELEASE_V1.0.0.md pour documentation de release

#### 📜 Licence

- **Migration vers licence MIT** (depuis CC BY-NC 4.0)
- Usage commercial autorisé sans restriction
- Modification et distribution autorisées
- Seule obligation : Conservation de la notice de copyright

#### ✨ Améliorations UX Récentes

- **Chemins récents séparés par utilisateur** : Chaque utilisateur a maintenant sa propre liste de dossiers récents dans localStorage (recentScanPaths_{username})
- Fix de partage des chemins entre admin et utilisateurs standards

#### 🔐 Sécurité

**Niveau Production** :
- 12 mesures de sécurité implémentées
- Conformité RGPD/APDP
- Encryption AES-256 de la base de données
- Protection multi-couches (CSRF, Path Traversal, SQL Injection, XSS)
- Audit logging complet

#### 💡 Notes

Cette version V1.0.0 marque la stabilité du produit et son aptitude à être utilisé en production. Toutes les fonctionnalités principales sont implémentées, testées et documentées.

**Recommandations pour la production** :
- Rotation JWT secret tous les 90 jours
- Backups automatisés de la base de données
- Monitoring et alertes sur événements de sécurité
- Audits de sécurité réguliers (OWASP ZAP, Burp Suite)
- Mise à jour CORS avec origines de production spécifiques

---

## Versions précédentes (développement)

Les versions 2.x.x étaient des versions de développement internes qui ont été consolidées dans la v1.0.0.

### [2.1.0] - 2024-12-29 (Développement)

### 🎯 Analyse Avancée

Cette version de développement a introduit deux fonctionnalités majeures d'analyse qui sont maintenant intégrées dans v1.0.0 : détection des fichiers dupliqués et analyse par catégories de PII.

#### ✨ Ajouté

**Détection des Fichiers Dupliqués**
- Nouvelle page "Fichiers dupliqués" avec détection MD5 hash-based
- Identification des copies redondantes de fichiers contenant des PII
- Détection basée sur le **contenu** (pas sur le nom de fichier)
- Groupement par hash MD5 avec liste expandable des emplacements
- Statistiques : groupes de duplicatas, total de copies, copies redondantes à supprimer
- Filtres : nombre minimum de copies (2+, 3+, 4+, 5+), tri par copies ou PII
- Affichage sécurisé du hash MD5 dans l'interface (hash unidirectionnel, pas de risque)
- Composant React : `pii-scanner-ui/src/components/pages/DuplicateFiles.tsx`

**Analyse par Catégories de PII**
- Nouvelle page "Analyse par Catégories" avec regroupement intelligent
- 6 catégories définies : Bancaire (Critique), Identité (Élevé), Santé (Élevé), Contact (Moyen), Éducation (Moyen), Transport (Faible)
- Graphiques Recharts : Pie Chart (distribution), Bar Chart (détections par catégorie)
- Filtres multi-critères : par catégorie, par niveau de sensibilité, par type de PII
- **Export enrichi CSV** : Fichier, Types PII, Nombre de détections
- **Export enrichi Excel** : Colonnes additionnelles (Catégories, Niveau de sensibilité)
- Téléchargement avec nom `analyse_pii_categories_YYYY-MM-DD.csv/.xlsx`
- Composant React : `pii-scanner-ui/src/components/pages/PiiCategoryAnalysis.tsx`

**Optimisation de Performance**
- ⚡ **Calcul MD5 conditionnel** : Hash calculé **uniquement** pour fichiers contenant des PII
- Performance : **10-50x plus rapide** selon ratio PII/total
- Exemple : 1000 fichiers, 50 avec PII → 950 calculs MD5 évités
- Implémentation : `PiiScanner.Core/Scanner/FileScanner.cs` (lignes 81-95)

**Modèle de Données**
- Nouveau champ `FileHash` (nullable) ajouté à `ScanResult`
- Backend : `PiiScanner.Core/Models/ScanResult.cs`
- API DTO : `PiiScanner.Api/DTOs/ScanRequest.cs`
- Frontend : `pii-scanner-ui/src/types/index.ts`
- Mapping : `PiiScanner.Api/Services/ScanService.cs` (ligne 183)

**Interface Utilisateur**
- 2 nouvelles pages (15 → **17 pages** au total)
- Nouveaux items dans la sidebar (section "Analyse des résultats")
- Routes ajoutées : `/pii-category-analysis`, `/duplicate-files`
- Icônes Material-UI : `CategoryIcon`, `ContentCopyIcon`

**Documentation**
- **FEATURES.md** : Documentation complète des nouvelles fonctionnalités
- README.md mis à jour : 17 pages, analyse par catégories, fichiers dupliqués
- FEATURES.md mis à jour : section Performance, Duplicate File Detection
- Exemples de code et cas d'usage ajoutés

#### 🔧 Modifié

**Architecture**
- `FileScanner.cs` : Logique de calcul MD5 optimisée (détecter PII d'abord, puis calculer hash)
- `ScanService.cs` : Ajout du mapping `FileHash` dans les résultats
- `App.tsx` : Routes pour les nouvelles pages d'analyse
- `Sidebar.tsx` : Items de menu pour Analyse par Catégories et Fichiers dupliqués

**Performance**
- Scan plus rapide pour répertoires avec faible densité de PII
- Réduction significative des I/O disque (lecture fichier pour MD5)

#### 🐛 Corrigé

- Performance des scans sur grandes structures de fichiers
- Transmission du hash MD5 du backend au frontend (3 couches corrigées)

#### 📝 Notes de Migration

**Rétrocompatibilité :**
- ✅ Compatible avec bases de données v2.0.0
- ✅ Pas de migration requise
- ✅ Anciens scans sans `FileHash` : affichés avec `FileHash = null`
- ✅ Nouveaux scans : `FileHash` calculé automatiquement si PII détecté

**Pour développeurs :**
- Aucune action requise pour la mise à jour
- Le champ `FileHash` est nullable et optionnel
- Consulter `FEATURES.md` pour détails techniques

---

### [2.0.0] - 2024-12-25 (Développement)

### 🎁 Version Portable

Cette version de développement a introduit le package portable qui est maintenant la méthode de distribution principale de v1.0.0.

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
- FEATURES.md étendu avec section "Portable Deployment"
- LISEZMOI-PORTABLE.txt créé avec guide utilisateur complet
- Dépannage Windows SmartScreen dans toute la documentation

#### 🐛 Corrigé

- **Page blanche après création admin** : Fix dans App.tsx avec state update + API re-check
- **Conflit démarrage API** : Auto-start Electron désactivé, batch script contrôle le démarrage

#### 📚 Documentation

- README.md réduit de 70% avec liens vers docs spécialisées
- INSTALLATION.md restructuré (Option 1: Portable, Option 2: Sources)
- FEATURES.md avec section build portable pour développeurs
- LISEZMOI-PORTABLE.txt avec guide utilisateur complet
- Solutions Windows SmartScreen documentées partout

#### 🔧 Infrastructure

- Build portable documenté dans FEATURES.md
- Scripts batch Windows (Démarrer, Débloquer, Exclusion Defender)
- Package ZIP ~196 MB (API + UI + .NET Runtime)

#### ⚠️ Problèmes Connus

- **Windows SmartScreen** : Application non signée (~300€/an). Solutions fournies. Ticket Microsoft ouvert.

#### 🔒 Sécurité

Aucun changement (identique à v1.0.0). JWT secret par défaut pour tests (régénérer pour production).


---

## Types de changements

- `Added` pour les nouvelles fonctionnalités
- `Changed` pour les changements aux fonctionnalités existantes
- `Deprecated` pour les fonctionnalités bientôt supprimées
- `Removed` pour les fonctionnalités supprimées
- `Fixed` pour les corrections de bugs
- `Security` pour les corrections de vulnérabilités

---

**Développé par** : [Cyberprevs](https://cyberprevs.fr)
**Licence** : [MIT](https://opensource.org/licenses/MIT)
