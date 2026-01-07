# Changelog

Tous les changements notables de ce projet seront documentés dans ce fichier.

Le format est basé sur [Keep a Changelog](https://keepachangelog.com/fr/1.0.0/),
et ce projet adhère au [Semantic Versioning](https://semver.org/lang/fr/).

## [1.0.0] - 2025-01-04

### 🎉 Version Initiale Stable - Production Ready

Première version stable de **PII Scanner** par Cyberprevs, prête pour un usage en production.

#### ✨ Fonctionnalités Principales

**Détection de PII**
- Détection automatique de **17 types de PII** conformes Loi N°2017-20 (APDP Bénin)
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

**Backend (.NET 8.0)**
- ASP.NET Core Web API + SignalR
- Entity Framework Core + SQLite
- 3 projets : Core, Api, Tests
- 88 tests unitaires (xUnit + FluentAssertions)

**Frontend (React 19 + TypeScript)**
- 17 pages spécialisées
- Material-UI v7 + Recharts
- 30 tests (Vitest + Testing Library)
- Bundle optimisé : 1,215 kB (gzip: 359 kB)

**Déploiement**
- Application web auto-hébergée
- Build automatisé (BuildWebApp.ps1)
- Package self-contained (~124 MB)
- Port HTTPS : 5001 (recommandé)

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
- CLAUDE.md pour développeurs
- SECURITY.md avec politique de sécurité
- CONTRIBUTING.md pour contributeurs
- CODE_OF_CONDUCT.md
- FEATURES.md pour fonctionnalités détaillées
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
- CLAUDE.md mis à jour : section Performance, Duplicate File Detection
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

## Types de changements

- `Added` pour les nouvelles fonctionnalités
- `Changed` pour les changements aux fonctionnalités existantes
- `Deprecated` pour les fonctionnalités bientôt supprimées
- `Removed` pour les fonctionnalités supprimées
- `Fixed` pour les corrections de bugs
- `Security` pour les corrections de vulnérabilités

---

**Développé par** : [Cyberprevs](https://cyberprevs.com)
**Licence** : [MIT](https://opensource.org/licenses/MIT)
