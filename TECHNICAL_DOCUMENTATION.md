# Documentation Technique Complète - PII Scanner v2.0.0

**Développé par Cyberprevs** | Licence MIT | Avril 2026

---

## Table des matières

1. [Vue d'ensemble du projet](#1-vue-densemble-du-projet)
2. [Architecture globale](#2-architecture-globale)
3. [Stack technologique et justifications](#3-stack-technologique-et-justifications)
4. [Backend .NET - Architecture détaillée](#4-backend-net---architecture-détaillée)
5. [Moteur de détection PII](#5-moteur-de-détection-pii)
6. [Analyse des permissions NTFS (Exposition)](#6-analyse-des-permissions-ntfs-exposition)
7. [Analyse de l'ancienneté (Stale Data)](#7-analyse-de-lancienneté-stale-data)
8. [Lecture de documents multi-formats](#8-lecture-de-documents-multi-formats)
9. [Sécurité](#9-sécurité)
10. [API REST - Endpoints](#10-api-rest---endpoints)
11. [Communication temps réel (SignalR)](#11-communication-temps-réel-signalr)
12. [Base de données SQLCipher](#12-base-de-données-sqlcipher)
13. [Système de rapports](#13-système-de-rapports)
14. [Frontend React - Architecture détaillée](#14-frontend-react---architecture-détaillée)
15. [Authentification et gestion des sessions](#15-authentification-et-gestion-des-sessions)
16. [Performances et optimisations](#16-performances-et-optimisations)
17. [Déploiement et packaging](#17-déploiement-et-packaging)
18. [Modèle de données](#18-modèle-de-données)
19. [Journal d'audit](#19-journal-daudit)
20. [Limitations connues et roadmap](#20-limitations-connues-et-roadmap)
21. [Conformité APDP (v2.0)](#21-conformité-apdp-v20)

---

## 1. Vue d'ensemble du projet

### Qu'est-ce que PII Scanner ?

PII Scanner est une application de sécurité des données qui **détecte automatiquement les informations personnelles identifiables (PII)** dans les fichiers d'un système de fichiers. L'application scanne récursivement les répertoires, analyse le contenu de 7 types de fichiers différents, et identifie **18 types de données sensibles** spécifiques au contexte béninois et international.

### Problème résolu

Les organisations manipulent quotidiennement des fichiers contenant des données personnelles (noms, emails, numéros de carte bancaire, CNI, etc.) sans toujours savoir :
- **Où** se trouvent ces données sensibles
- **Qui** y a accès (permissions NTFS)
- **Depuis quand** ces fichiers n'ont pas été consultés (données obsolètes)
- **Combien** de données sensibles sont exposées

PII Scanner répond à ces questions en fournissant un **audit complet et automatisé** avec des rapports exportables.

### Cas d'usage

- **Conformité réglementaire** : Loi N°2017-20 (Bénin), RGPD (Europe)
- **Audit de sécurité** : Identifier les fichiers sur-exposés contenant des PII
- **Gouvernance des données** : Politique de rétention, nettoyage des données obsolètes
- **Réponse aux incidents** : Localiser rapidement où se trouvent des données sensibles

### Caractéristiques principales

| Fonctionnalité | Description |
|----------------|-------------|
| Scan récursif | Analyse complète d'arborescences de fichiers |
| 18 types de PII | Détection spécialisée avec validation (Luhn, checksums) |
| 7 formats de fichiers | TXT, LOG, CSV, JSON, DOCX, XLSX, PDF |
| Analyse des permissions | Audit NTFS (Everyone, groupes, partages réseau) |
| Analyse d'ancienneté | Détection des fichiers obsolètes (6 mois → +5 ans) |
| Détection de doublons | Identification des fichiers dupliqués via hash MD5 |
| 4 formats de rapports | CSV, JSON, HTML interactif, Excel multi-feuilles (chiffrés AES-256) |
| Interface web moderne | React 19 + Material-UI v7 — 18 pages, thème sombre/clair, bilingue FR/EN |
| Temps réel | Progression du scan via WebSocket (SignalR) |
| Sécurité renforcée | 13 mécanismes : JWT, CSRF, Rate Limiting, SQLCipher AES-256, Path Traversal... |
| 100% local | Aucune donnée envoyée sur Internet |
| **Consentement éclairé** | **Modal obligatoire avant tout scan — tracé en audit log (v2.0)** |
| **Exports chiffrés AES-256** | **Tous les rapports chiffrés, mot de passe unique par téléchargement (v2.0)** |
| **Déchiffrement intégré** | **Page /decrypt — ouvre les .enc dans le navigateur sans serveur (v2.0)** |
| **Droit à l'effacement** | **DELETE /api/users/{id}/data — suppression en cascade conforme APDP (v2.0)** |

---

## 2. Architecture globale

### Architecture monolithique modulaire

```
┌─────────────────────────────────────────────────────────┐
│                    Navigateur Web                        │
│              (React 19 + Material-UI v7)                │
└──────────────────────┬──────────────────────────────────┘
                       │ HTTP/HTTPS + WebSocket (SignalR)
                       ▼
┌─────────────────────────────────────────────────────────┐
│                  PiiScanner.Api                          │
│              (ASP.NET Core - Kestrel)                   │
│                                                         │
│  ┌─────────────┐  ┌──────────────┐  ┌───────────────┐ │
│  │ Controllers  │  │  Middleware   │  │    SignalR     │ │
│  │  (REST API)  │  │ (Sécurité)   │  │   (ScanHub)   │ │
│  └──────┬───────┘  └──────────────┘  └───────────────┘ │
│         │                                               │
│  ┌──────▼───────────────────────────────────────────┐  │
│  │              Services                             │  │
│  │  AuthService │ ScanService │ DatabaseEncryption   │  │
│  └──────┬───────────────────────────────────────────┘  │
│         │                                               │
│  ┌──────▼───────────────────────────────────────────┐  │
│  │        Entity Framework Core + SQLCipher          │  │
│  │              (piiscanner.db - AES-256)            │  │
│  └──────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────┐
│                  PiiScanner.Core                        │
│              (Bibliothèque de classes)                  │
│                                                         │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐ │
│  │ FileScanner   │  │ PiiDetector  │  │ DocumentReader│ │
│  │(Orchestration)│  │  (18 regex)  │  │ (7 formats)  │ │
│  └──────────────┘  └──────────────┘  └──────────────┘ │
│                                                         │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐ │
│  │ Permission    │  │  Reporting   │  │ PathValidator │ │
│  │  Analyzer     │  │ (4 formats)  │  │ (Sécurité)   │ │
│  └──────────────┘  └──────────────┘  └──────────────┘ │
└─────────────────────────────────────────────────────────┘
```

### Pourquoi une architecture monolithique ?

- **Simplicité de déploiement** : Un seul exécutable, pas de Docker, pas de microservices
- **Performance** : Pas de latence réseau inter-services
- **Autonomie** : Fonctionne sans connexion Internet
- **Sécurité** : Moins de surface d'attaque qu'une architecture distribuée
- **Public cible** : PME et organisations qui n'ont pas d'équipe DevOps dédiée

### Séparation des responsabilités

| Projet | Responsabilité | Dépendances |
|--------|----------------|-------------|
| `PiiScanner.Api` | API REST, middleware, DI, configuration | ASP.NET Core, EF Core, SignalR |
| `PiiScanner.Core` | Logique métier pure (scan, détection, rapports) | OpenXML, PdfPig, ClosedXML |

Cette séparation permet de :
- Tester la logique métier indépendamment de l'API
- Réutiliser `PiiScanner.Core` dans d'autres contextes (CLI, service Windows)
- Maintenir une frontière claire entre infrastructure et domaine

---

## 3. Stack technologique et justifications

### Backend

| Technologie | Version | Pourquoi ce choix |
|-------------|---------|-------------------|
| **.NET 9.0** | 9.0 | Performance native, cross-platform, self-contained deployment. Le runtime est embarqué dans l'exécutable → aucune installation requise |
| **ASP.NET Core Kestrel** | 9.0 | Serveur web intégré haute performance (pas besoin d'IIS ou Nginx). Supporte HTTP/HTTPS, WebSocket natif |
| **Entity Framework Core** | 9.0 | ORM mature avec migrations, LINQ, et support SQLite/SQLCipher. Simplifie les requêtes DB sans SQL brut |
| **SQLCipher** | via SQLitePCL | Chiffrement AES-256 transparent de la base de données. Protège les données au repos sans infrastructure supplémentaire |
| **SignalR** | 9.0 | Communication bidirectionnelle temps réel (WebSocket avec fallback). Progression du scan en temps réel sans polling |
| **BCrypt.Net** | 4.x | Hachage de mots de passe avec salt automatique. Standard de l'industrie, résistant aux attaques par force brute |
| **DocumentFormat.OpenXml** | 3.x | Lecture native de fichiers Word (.docx) et Excel (.xlsx) sans Microsoft Office installé |
| **UglyToad.PdfPig** | 0.x | Extraction de texte PDF pure .NET, pas de dépendance native, cross-platform |
| **ClosedXML** | 0.x | Génération de rapports Excel (.xlsx) avec formatage, styles, multi-feuilles |

### Frontend

| Technologie | Version | Pourquoi ce choix |
|-------------|---------|-------------------|
| **React 19** | 19.2.0 | Dernière version stable avec Server Components et amélioration des performances. Écosystème mature, vaste communauté |
| **TypeScript 5.9** | 5.9.3 | Typage statique pour la maintenabilité. Détection d'erreurs à la compilation, meilleur refactoring, auto-complétion IDE |
| **Material-UI v7** | 7.3.6 | Bibliothèque de composants UI la plus populaire pour React. Design system cohérent, thème personnalisable, accessibilité intégrée |
| **Vite 7** | 7.2.4 | Bundler ultra-rapide basé sur ESBuild. Hot Module Replacement (HMR) instantané en développement, build optimisé en production |
| **Recharts 3** | 3.5.1 | Bibliothèque de graphiques basée sur D3.js + React. Composants déclaratifs, responsive, tooltips interactifs |
| **Axios** | 1.13.2 | Client HTTP avec intercepteurs (JWT auto-refresh, CSRF injection). Meilleur que fetch() pour la gestion d'erreurs et les intercepteurs |
| **SignalR Client** | 10.0.0 | Client WebSocket officiel Microsoft. Auto-reconnexion, négociation de transport, compatible avec le hub backend |
| **React Router** | 7.12.0 | Routage SPA avec routes protégées, layout imbriqué, navigation programmatique |

### Pourquoi pas d'autres technologies ?

| Alternative rejetée | Raison |
|---------------------|--------|
| **Electron** | Trop lourd (~150MB+), PII Scanner utilise un navigateur web standard |
| **PostgreSQL/MySQL** | Nécessite une installation séparée. SQLCipher est embarqué et chiffré |
| **Docker** | Le public cible (PME) n'a pas toujours Docker. L'exécutable standalone est plus simple |
| **Next.js/SSR** | Pas nécessaire car l'API .NET sert déjà les fichiers statiques React |
| **Redux** | Surdimensionné pour cette application. React Context + useState suffisent |
| **Tailwind CSS** | Material-UI fournit déjà un design system complet avec thème |

---

## 4. Backend .NET - Architecture détaillée

### 4.1 Point d'entrée (Program.cs)

Le fichier `Program.cs` configure l'ensemble du pipeline de l'application :

#### Initialisation SQLCipher
```csharp
SQLitePCL.Batteries_V2.Init();
SQLitePCL.raw.SetProvider(new SQLitePCL.SQLite3Provider_e_sqlcipher());
```
SQLCipher remplace le moteur SQLite standard par une version chiffrée AES-256. Cette initialisation doit être la **première instruction** du programme.

#### Configuration Kestrel (HTTP/HTTPS)
```csharp
builder.WebHost.ConfigureKestrel(options =>
{
    if (httpsEnabled)
    {
        options.ListenLocalhost(5001, listenOptions =>
            listenOptions.UseHttps());  // HTTPS sur port 5001
    }
    options.ListenLocalhost(5000);      // HTTP sur port 5000
});
```

**Mode dual HTTP/HTTPS** : L'application écoute sur les deux ports simultanément. En production, HTTPS est recommandé mais HTTP reste disponible pour les environnements sans certificat.

#### Injection de dépendances (DI)

| Service | Lifetime | Rôle |
|---------|----------|------|
| `DatabaseEncryptionService` | Singleton | Gestion de la clé de chiffrement SQLCipher |
| `ScanService` | Singleton | Orchestration des scans en background |
| `AuthService` | Scoped | Authentification JWT (1 instance par requête) |
| `SessionCleanupService` | HostedService | Nettoyage automatique des sessions expirées |

#### Pipeline de middleware (ordre critique)

L'ordre des middleware est **déterminant** pour la sécurité :

```
1. Exception Handling      → Capture toutes les erreurs non gérées
2. Swagger                 → Documentation API (dev uniquement)
3. HTTPS Redirection       → Force HTTPS si activé
4. CORS                    → Autorise localhost:5173 (dev uniquement)
5. Static Files            → Sert les fichiers React depuis wwwroot/
6. Session                 → REQUIS avant CSRF (stockage du token)
7. Rate Limiting           → Limite les requêtes AVANT l'auth
8. CSRF Protection         → Valide les tokens AVANT l'auth
9. Authentication          → Valide le JWT
10. Authorization          → Vérifie les rôles
11. Session Validation     → Vérifie que la session JWT est active
12. Controllers            → Traitement des requêtes
```

#### En-têtes de sécurité HTTP

Ajoutés automatiquement à **chaque réponse** :

```
X-Content-Type-Options: nosniff          → Empêche le MIME-sniffing
X-Frame-Options: DENY                    → Empêche le clickjacking (iframe)
X-XSS-Protection: 1; mode=block         → Protection XSS legacy
Permissions-Policy: geolocation=()...    → Désactive les API sensibles
Content-Security-Policy: default-src ... → Politique de sécurité du contenu
Strict-Transport-Security: max-age=...   → Force HTTPS (si activé)
```

#### Ouverture automatique du navigateur

```csharp
if (!app.Environment.IsDevelopment())
{
    var url = httpsEnabled ? "https://localhost:5001" : "http://localhost:5000";
    var psi = new ProcessStartInfo { FileName = url, UseShellExecute = true };
    Process.Start(psi);
}
```

En mode Production, l'application ouvre automatiquement le navigateur par défaut au lancement.

### 4.2 ScanService (Orchestration)

Le `ScanService` est un service **Singleton** qui gère le cycle de vie complet des scans :

```
Requête POST /api/scan/start
    │
    ▼
ScanService.StartScanAsync()
    │
    ├── 1. Validation du chemin (PathValidator)
    ├── 2. Création du ScanRecord en base (Status: "Running")
    ├── 3. Lancement en background (Task.Run)
    │       │
    │       ├── FileScanner.ScanDirectory()
    │       │       ├── Énumération récursive des fichiers
    │       │       ├── Filtrage par extension
    │       │       ├── Parallel.ForEach sur tous les fichiers
    │       │       │       ├── DocumentReader.ReadFile()
    │       │       │       ├── PiiDetector.Detect()
    │       │       │       ├── FilePermissionAnalyzer.Analyze()
    │       │       │       └── CalculateFileHash() (si PII trouvé)
    │       │       └── Événement ProgressUpdated → SignalR
    │       │
    │       ├── Stockage des résultats en mémoire
    │       ├── Mise à jour ScanRecord (Status: "Completed")
    │       └── SignalR: ScanComplete
    │
    └── Réponse immédiate: { scanId, status: "started" }
```

Le scan est **asynchrone** : l'API retourne immédiatement le `scanId`, et le client suit la progression via SignalR (WebSocket) ou polling HTTP.

---

## 5. Moteur de détection PII

### 5.1 Architecture du détecteur

**Fichier** : `PiiScanner.Core/Analysis/PiiDetector.cs`

Le détecteur utilise une approche en **deux phases** :

1. **Phase 1 - Détection par regex** : Chaque type de PII a un pattern regex compilé
2. **Phase 2 - Validation contextuelle** : Chaque match est validé par une méthode spécifique (Luhn, format, anti-faux-positifs)

```csharp
// Patterns compilés au démarrage (RegexOptions.Compiled = JIT)
private static readonly Dictionary<string, Regex> CompiledPatterns =
    PatternStrings.ToDictionary(
        kvp => kvp.Key,
        kvp => new Regex(kvp.Value, RegexOptions.Compiled)
    );
```

`RegexOptions.Compiled` transforme les expressions régulières en code IL natif au démarrage, ce qui **multiplie par 2-3x la vitesse** de matching par rapport aux regex interprétées.

### 5.2 Les 18 types de PII détectés

#### 1. Email
```
Pattern : \b[a-zA-Z][a-zA-Z0-9._%+-]*@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}\b
```
**Validation anti-faux-positifs** :
- Rejette les extensions de fichiers (.png, .jpg, .pdf, .json, .tsx, .dll, etc.)
- Rejette les artefacts iOS/Android (Icon-App-*, iTunesArtwork@*)
- Rejette les domaines invalides (contient "http", MixedCase anormal)
- Rejette les emails de test (user@test.com, a@b.com)
- Vérifie la structure du domaine (au moins un point)

#### 2. Date de naissance
```
Pattern : \b(?:0[1-9]|[12][0-9]|3[01])/(?:0[1-9]|1[0-2])/(?:19|20)\d{2}\b
```
**Validation** : La date doit correspondre à un âge entre 5 et 120 ans. Cela élimine les dates de documents, factures, etc.

#### 3. Carte bancaire
```
Pattern : \b(?:\d{4}[\s-]?){3}\d{4}\b
```
**Validation par algorithme de Luhn** :
```
Algorithme de Luhn (ISO/IEC 7812-1) :
1. Prendre les 16 chiffres de droite à gauche
2. Doubler un chiffre sur deux (position paire depuis la droite)
3. Si le double > 9, soustraire 9
4. Sommer tous les chiffres
5. Si la somme est divisible par 10 → numéro valide
```
Cet algorithme élimine ~90% des faux positifs (numéros aléatoires de 16 chiffres).

#### 4. IFU (Identifiant Fiscal Unique - Bénin)
```
Pattern : \b[0-3]\d{12}\b
```
**Validation** : 13 chiffres commençant par 0, 1, 2 ou 3. Format spécifique au registre fiscal béninois.

#### 5. CNI Bénin (Carte Nationale d'Identité)
```
Pattern : \b[A-Z]{2}\d{6,10}\b
```
**Validation** : 2 lettres majuscules suivies de 6 à 10 chiffres.

#### 6. Passeport Bénin
```
Pattern : \bBJ\d{7}\b
```
**Validation** : Préfixe "BJ" (code pays) suivi de 7 chiffres.

#### 7. RCCM (Registre du Commerce)
```
Pattern : \bRB/[A-Z]{3}/\d{4}/[A-Z]/\d{1,5}\b
```
Format : `RB/COT/2024/A/12345` (Registre, ville, année, catégorie, numéro).

#### 8. Acte de naissance
```
Pattern : \b(?:N°\s?)?\d{1,5}/\d{4}/[A-Z]{2,}\b
```
Format : `N° 123/2024/EC` ou `45/2023/MAN`.

#### 9. Téléphone (Bénin)
```
Pattern : \b(?:(?:\+229|00229)\s?)?(?:01)?(?:4[0-9]|5[0-9]|6[0-9]|9[0-9])\s?\d{2}\s?\d{2}\s?\d{2}\b
```
Supporte les formats :
- Nouveau format : `+229 01 67 80 99 06` (avec préfixe 01)
- Ancien format : `67 80 99 06` (8 chiffres)
- Avec indicatif : `+229` ou `00229`

#### 10. IBAN (Bénin)
```
Pattern : \bBJ\s?\d{2}\s?[A-Z0-9\s]{24,28}\b
```
Format : `BJ` + 2 chiffres de contrôle + 24-28 caractères alphanumériques.

#### 11. CNSS (Caisse Nationale de Sécurité Sociale)
```
Pattern : \b[0-9]\d{10}\b
```
**Validation anti-faux-positifs avancée** :
- Rejette les patterns répétitifs (11111111111)
- Rejette les numéros de test connus (95999999996, 12345678901)
- Rejette les timestamps Unix (commencent par 1 ou 2, > 1 milliard)
- Rejette les constantes système (INT32_MAX variants)
- Rejette les dates probables (format YYYYMMDDXXX)
- Rejette les suites de zéros ou de neuf

#### 12. RAMU (Régime d'Assurance Maladie Universelle)
```
Pattern : \bRAMU[\s-]?\d{8,10}\b
```
Format : `RAMU-12345678` ou `RAMU 1234567890`.

#### 13. INE (Identifiant National Étudiant)
```
Pattern : \bINE[\s-]?\d{8,12}\b
```
Format : `INE-12345678` ou `INE 123456789012`.

#### 14. Matricule fonctionnaire
```
Pattern : \b[FM]\d{6,10}\b
```
Format : `F123456` ou `M1234567890` (F = Féminin, M = Masculin).

#### 15. Plaque d'immatriculation
```
Pattern : \b(?:[A-Z]{2}\s?\d{4}\s?[A-Z]{2}|\d{4}\s?[A-Z]{2})\b
```
Supporte :
- Nouveau format : `AA 1234 BB`
- Ancien format : `1234 AB`

#### 16. Date de naissance
```
Pattern : \b(?:0[1-9]|[12][0-9]|3[01])/(?:0[1-9]|1[0-2])/(?:19|20)\d{2}\b
```
**Validation** : La date doit correspondre à un âge entre 5 et 120 ans.

#### 17. RAMU (Régime d'Assurance Maladie Universelle)
```
Pattern : \bRAMU[\s-]?\d{8,10}\b
```
Format : `RAMU-12345678` ou `RAMU 1234567890`.

#### 18. NPI (Numéro Personnel d'Identification)
```
Pattern : \b\d{10}\b
```
**Validation par algorithme de Luhn** : 10 chiffres dont 1 chiffre de contrôle. Anti-faux-positifs : rejette les suites répétitives (`1111111111`), les suites connues (`0123456789`, `1234567890`), et les valeurs nulles.

### 5.3 Processus de détection complet

```
Contenu du fichier (string)
    │
    ▼
Pour chaque type de PII (18 types) :
    │
    ├── 1. Regex.Matches(content) → Liste de matches
    │
    ├── 2. Pour chaque match :
    │       ├── Extraire la valeur brute
    │       ├── Appeler la méthode de validation spécifique
    │       │       ├── IsValidEmail()
    │       │       ├── IsValidCreditCard() → Luhn
    │       │       ├── IsValidDate() → Plage d'âge
    │       │       ├── IsValidCNSS() → Anti-patterns
    │       │       └── etc.
    │       │
    │       └── Si valide → Créer ScanResult
    │               ├── FilePath
    │               ├── PiiType
    │               ├── Match (valeur détectée)
    │               ├── LastAccessedDate
    │               ├── FileHash (MD5)
    │               ├── ExposureLevel
    │               ├── AccessibleToEveryone
    │               ├── IsNetworkShare
    │               └── UserGroupCount
    │
    └── Retourner List<ScanResult>
```

---

## 6. Analyse des permissions NTFS (Exposition)

### 6.1 Fonctionnement

**Fichier** : `PiiScanner.Core/Utils/FilePermissionAnalyzer.cs`

Pour chaque fichier contenant des PII, l'analyseur de permissions vérifie les ACL (Access Control Lists) NTFS Windows :

```csharp
var fileSecurity = fileInfo.GetAccessControl();
var accessRules = fileSecurity.GetAccessRules(true, true, typeof(NTAccount));
```

L'analyse identifie :
- **Qui a accès** : Énumération de tous les groupes/utilisateurs avec permissions Allow
- **Everyone** : Détection du groupe "Everyone" / "Tout le monde" (FR/EN)
- **Authenticated Users** : Détection du groupe "Utilisateurs authentifiés"
- **Partage réseau** : Détection des chemins UNC (`\\server\share`)
- **Nombre de groupes** : Comptage des identités distinctes avec accès

### 6.2 Niveaux d'exposition

| Niveau | Condition | Signification |
|--------|-----------|---------------|
| **Critique** | `AccessibleToEveryone = true` | N'importe qui sur la machine peut lire le fichier |
| **Critique** | Partage réseau + >10 groupes | Fichier sur le réseau accessible à de nombreux groupes |
| **Moyen** | Authenticated Users ou >10 groupes | Tous les utilisateurs authentifiés ou beaucoup de groupes |
| **Moyen** | 5-10 groupes | Plusieurs groupes ont accès |
| **Faible** | <5 groupes | Accès restreint |

### 6.3 Messages d'avertissement

Lorsqu'un fichier contenant des PII a un niveau d'exposition élevé, un message contextuel est généré :

```
🔴 CRITIQUE: Ce fichier contient 45 PII et est accessible à TOUS les utilisateurs (Everyone)
🔴 CRITIQUE: Ce fichier contient 28 PII et est accessible sur un partage réseau à 15 groupes
🟡 MOYEN: Ce fichier contient 12 PII et est accessible à tous les utilisateurs authentifiés
```

---

## 7. Analyse de l'ancienneté (Stale Data)

### Fonctionnement

L'ancienneté est calculée à partir de la date de dernier accès du fichier (`File.GetLastAccessTime()`).

| Catégorie | Condition | Couleur UI |
|-----------|-----------|------------|
| **Récent** | Accès < 6 mois | Vert |
| **6 mois** | 6 mois ≤ accès < 1 an | Vert clair |
| **1 an** | 1 an ≤ accès < 3 ans | Orange |
| **3 ans** | 3 ans ≤ accès < 5 ans | Orange-rouge |
| **+5 ans** | Accès ≥ 5 ans | Rouge |

### Intérêt pour la conformité

Les données personnelles non consultées depuis longtemps sont un risque :
- **Données obsolètes** : Pourraient ne plus être nécessaires
- **Non-conformité** : Le RGPD exige de ne pas conserver les données au-delà de leur finalité
- **Surface d'attaque** : Des fichiers oubliés contenant des PII sont une cible facile

---

## 8. Lecture de documents multi-formats

**Fichier** : `PiiScanner.Core/Reader/DocumentReader.cs`

### Formats supportés et méthodes d'extraction

| Format | Extension | Bibliothèque | Méthode d'extraction |
|--------|-----------|--------------|----------------------|
| Texte brut | .txt, .log | Natif .NET | `File.ReadAllText()` |
| CSV | .csv | Natif .NET | `File.ReadAllText()` |
| JSON | .json | Natif .NET | `File.ReadAllText()` |
| Word | .docx | DocumentFormat.OpenXml | Parcours DOM → `Text` elements |
| Excel | .xlsx | DocumentFormat.OpenXml | Parcours Workbook → Sheets → Rows → Cells |
| PDF | .pdf | UglyToad.PdfPig | `page.Text` pour chaque page |

### Détails d'implémentation

#### Word (.docx)
```
1. Ouvrir le document en lecture seule
2. Accéder au Body du MainDocumentPart
3. Parcourir tous les Descendants<Text>()
4. Concaténer avec des espaces
```

#### Excel (.xlsx)
```
1. Ouvrir le classeur en lecture seule
2. Pour chaque feuille (Sheet) :
   3. Pour chaque ligne (Row) :
      4. Pour chaque cellule (Cell) :
         5. Résoudre la valeur (SharedStringTable si formule)
         6. Ajouter au StringBuilder
```

La gestion des **SharedStrings** est importante : Excel stocke les chaînes de caractères dans une table séparée pour éviter la duplication. Le code résout les références pour obtenir la valeur réelle.

#### PDF
```
1. Ouvrir le document avec PdfPig
2. Pour chaque page :
   3. Extraire page.Text (OCR-like text extraction)
   4. Concaténer
```

### Gestion des erreurs

Tous les lecteurs sont encapsulés dans des blocs try-catch qui retournent `string.Empty` en cas d'erreur (fichier corrompu, protégé par mot de passe, etc.). Le scan continue avec les autres fichiers.

---

## 9. Sécurité

### 9.1 Vue d'ensemble des couches de sécurité

```
┌─────────────────────────────────────────┐
│         Couche 1 : Transport            │
│    HTTPS (TLS 1.2+) + HSTS Header      │
├─────────────────────────────────────────┤
│         Couche 2 : Rate Limiting        │
│  Login: 5/15min | API: 100/min          │
│  Sensitive: 20/5min                     │
├─────────────────────────────────────────┤
│         Couche 3 : CSRF Protection      │
│  Token 32 bytes random, session-based   │
├─────────────────────────────────────────┤
│         Couche 4 : Authentification     │
│  JWT (HS256) + Refresh Token (30 jours) │
├─────────────────────────────────────────┤
│         Couche 5 : Autorisation         │
│  Rôles: Admin / Operator               │
├─────────────────────────────────────────┤
│         Couche 6 : Validation           │
│  Path Traversal, Input Sanitization     │
├─────────────────────────────────────────┤
│         Couche 7 : Stockage             │
│  SQLCipher AES-256, BCrypt passwords    │
├─────────────────────────────────────────┤
│         Couche 8 : Audit               │
│  Journal complet de toutes les actions  │
├─────────────────────────────────────────┤
│  Couche 9 : Chiffrement des exports     │
│  AES-256-CBC + PBKDF2-SHA256 (100k it.) │
│  Mot de passe unique, jamais persisté   │
├─────────────────────────────────────────┤
│  Couche 10 : Consentement éclairé       │
│  Modal obligatoire, case à cocher,      │
│  horodaté en AuditLog (APDP Art. 424)  │
└─────────────────────────────────────────┘
```

### 9.7 Chiffrement des exports (v2.0)

**Fichier** : `PiiScanner.Api/Controllers/ScanController.cs` → classe `ReportEncryption`

Tous les rapports téléchargés sont **chiffrés automatiquement** avant envoi au client. Aucun rapport en clair n'est jamais transmis.

**Algorithme** :
```
AES-256-CBC + PBKDF2-SHA256
  ├── Salt : 16 bytes aléatoires (RandomNumberGenerator)
  ├── Dérivation de clé : PBKDF2-SHA256, 100 000 itérations (NIST SP 800-132)
  ├── Clé AES : 256 bits (32 bytes)
  ├── IV : 16 bytes (dérivé du PBKDF2)
  └── Padding : PKCS7
```

**Format du fichier `.enc`** :
```
┌────────────────────────────────────────┐
│  Bytes 0-15    │  Salt (16 bytes)      │
│  Bytes 16-31   │  IV (16 bytes)        │
│  Bytes 32-N    │  Données chiffrées    │
└────────────────────────────────────────┘
```

**Génération du mot de passe** :
```csharp
// Charset : A-Z, a-z, 0-9, !@#$%^&* (caractères ambigus exclus : O, 0, I, l)
const string chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789!@#$%^&*";
var bytes = RandomNumberGenerator.GetBytes(20);   // 20 caractères = ~127 bits d'entropie
```

**Transmission** :
- Le mot de passe est retourné **une seule fois** dans le header HTTP `X-Report-Password`
- Il n'est **jamais stocké** côté serveur
- Une fois le dialog fermé dans l'UI, le mot de passe est perdu définitivement

### 9.8 Scans de sécurité

L'application fait l'objet d'analyses de sécurité régulières :

| Outil | Type | Couverture |
|-------|------|-----------|
| **Snyk** | SAST + SCA | Analyse statique du code + vulnérabilités des dépendances |
| **OWASP ZAP** | DAST | Tests de pénétration dynamiques sur l'API REST |
| **Burp Suite** | DAST | Analyse des vulnérabilités OWASP Top 10 |

### 9.2 Protection CSRF

**Fichier** : `PiiScanner.Api/Middleware/CsrfProtectionMiddleware.cs`

**Principe** : Empêcher les attaques Cross-Site Request Forgery où un site malveillant envoie des requêtes au nom de l'utilisateur authentifié.

**Implémentation** :
1. **Génération** : Token de 32 bytes aléatoires (cryptographiquement sûr) encodé en Base64
2. **Stockage** : En session côté serveur (pas de cookie)
3. **Transmission** : Header HTTP `X-CSRF-Token` dans chaque réponse GET
4. **Validation** : Comparaison du token envoyé par le client avec celui en session pour POST/PUT/DELETE/PATCH

**Endpoints protégés** :
- `/api/users` - Gestion des utilisateurs
- `/api/database/*` - Opérations de base de données
- `/api/dataretention/delete` - Suppression de fichiers
- `/api/auth/change-password` - Changement de mot de passe

**Endpoints exemptés** :
- `/api/auth/login` - Connexion (pas encore de session)
- `/api/auth/refresh` - Renouvellement de token
- `/api/initialization` - Configuration initiale

### 9.3 Rate Limiting

**Fichier** : `PiiScanner.Api/Middleware/RateLimitingMiddleware.cs`

| Catégorie | Endpoints | Limite | Fenêtre |
|-----------|-----------|--------|---------|
| **Login** | `/api/auth/login` | 5 requêtes | 15 minutes |
| **Sensible** | `/api/users`, `/api/database/*`, `/api/dataretention/delete` | 20 requêtes | 5 minutes |
| **API générale** | Tous les autres endpoints | 100 requêtes | 1 minute |

**Implémentation** :
- **Identification** : Par adresse IP du client
- **Algorithme** : Fenêtre glissante (sliding window) basée sur les timestamps
- **Thread-safety** : Sémaphore par compteur pour éviter les race conditions
- **Nettoyage** : Auto-nettoyage des compteurs obsolètes (probabilité 1% par requête)

**Headers de réponse** :
```
X-RateLimit-Limit: 100          → Limite maximale
X-RateLimit-Remaining: 95       → Requêtes restantes
X-RateLimit-Reset: 2026-...     → Date de réinitialisation
Retry-After: 45                 → Secondes avant réessai (si limité)
```

### 9.4 Protection Path Traversal

**Fichier** : `PiiScanner.Api/Utils/PathValidator.cs`

Empêche les attaques de type `../../etc/passwd` ou `..\..\Windows\System32`.

**Patterns dangereux bloqués** :
- `..` (navigation parent)
- `~` (répertoire home)
- `%` (encodage URL)
- `\\` (chemins UNC)
- `//` (double slash)

**Chemins système bloqués** :
- Windows : `C:\Windows`, `C:\Program Files`, `C:\System Volume Information`
- Linux : `/etc`, `/var`, `/usr`, `/bin`, `/boot`, `/sys`, `/proc`

**Noms réservés Windows bloqués** :
- `CON`, `PRN`, `AUX`, `NUL`, `COM1`-`COM9`, `LPT1`-`LPT9`

**Validations** :
1. `ValidateDirectoryPath()` : Vérifie que le chemin est sûr et existe
2. `ValidateFileName()` : Vérifie qu'un nom de fichier ne contient pas de traversal
3. `ValidateFileInDirectory()` : Vérifie qu'un fichier reste dans son répertoire autorisé
4. `GetSafeAbsolutePath()` : Normalise un chemin et vérifie qu'il reste dans le répertoire de base

### 9.5 Sécurité JWT

**Génération du token** :
```
Algorithme : HS256 (HMAC-SHA256)
Durée : Configurable (défaut: 8 heures)
Claims : UserId, Username, Email, Role, FullName, SessionId

Validation :
- ValidateIssuer: true
- ValidateAudience: true
- ValidateLifetime: true
- ValidateIssuerSigningKey: true
```

**Protection en production** :
```csharp
// Le secret par défaut est INTERDIT en production
if (env.IsProduction() && jwtSecret.Contains("DEFAULT_DEV_SECRET"))
    throw new InvalidOperationException("...");
```

### 9.6 Hachage des mots de passe

BCrypt avec salt automatique :
```csharp
// Hachage
var hash = BCrypt.Net.BCrypt.HashPassword(password);
// Vérification
var isValid = BCrypt.Net.BCrypt.Verify(password, hash);
```

BCrypt est résistant aux attaques par force brute grâce à son coût adaptatif (work factor). Chaque vérification prend ~100ms, ce qui rend les attaques par dictionnaire impraticables.

---

## 10. API REST - Endpoints

### 10.1 Authentification (`/api/auth`)

| Méthode | Endpoint | Auth | Description |
|---------|----------|------|-------------|
| POST | `/login` | Non | Connexion (username + password) |
| POST | `/refresh` | Non | Renouveler le JWT avec le refresh token |
| POST | `/logout` | JWT | Révoquer le refresh token |
| GET | `/me` | JWT | Obtenir les infos de l'utilisateur connecté |

### 10.2 Scan (`/api/scan`)

| Méthode | Endpoint | Auth | Description |
|---------|----------|------|-------------|
| POST | `/start` | JWT | Démarrer un scan (retourne scanId) |
| GET | `/{scanId}/progress` | JWT | Obtenir la progression (0-100%) |
| GET | `/{scanId}/results` | JWT | Obtenir les résultats complets |
| GET | `/{scanId}/report/{format}` | JWT | Télécharger un rapport (csv/json/html/excel) |
| GET | `/history` | JWT | Historique des scans (paginé) |
| DELETE | `/history/{scanId}` | JWT | Supprimer un scan de l'historique |
| PUT | `/{scanId}/status` | JWT | Mettre à jour le statut d'un scan |
| DELETE | `/{scanId}` | JWT | Nettoyer les ressources d'un scan |

### 10.3 Utilisateurs (`/api/users`) - Admin uniquement

| Méthode | Endpoint | Auth | Description |
|---------|----------|------|-------------|
| GET | `/` | Admin | Lister tous les utilisateurs |
| GET | `/{id}` | Admin | Détails d'un utilisateur |
| POST | `/` | Admin | Créer un utilisateur |
| PUT | `/{id}` | Admin | Modifier un utilisateur |
| DELETE | `/{id}` | Admin | Supprimer un utilisateur |
| PUT | `/change-password` | JWT | Changer son propre mot de passe |
| PUT | `/profile` | JWT | Modifier son propre profil |
| **DELETE** | **`/{id}/data`** | **Admin** | **Droit à l'effacement APDP — suppression en cascade (v2.0)** |

**Protections** :
- Impossible de modifier/supprimer l'admin par défaut (Id=1)
- Impossible de se supprimer soi-même
- Unicité username et email vérifiée

### 10.4 Base de données (`/api/database`) - Admin uniquement

| Méthode | Endpoint | Auth | Description |
|---------|----------|------|-------------|
| GET | `/stats` | Admin | Statistiques (taille, nombre d'enregistrements) |
| GET | `/settings` | Admin | Paramètres de rétention et backup |
| PUT | `/settings` | Admin | Modifier les paramètres |
| POST | `/cleanup` | Admin | Supprimer les données anciennes |
| POST | `/optimize` | Admin | VACUUM SQLite (défragmentation) |
| POST | `/backup` | Admin | Créer une sauvegarde |
| GET | `/backups` | Admin | Lister les sauvegardes |
| GET | `/backup/download/{fileName}` | Admin | Télécharger une sauvegarde |
| DELETE | `/backup/{fileName}` | Admin | Supprimer une sauvegarde |
| POST | `/backup/restore/{fileName}` | Admin | Restaurer depuis une sauvegarde |
| POST | `/reset` | Admin | Réinitialisation complète (mot de passe requis) |

### 10.5 Audit (`/api/audit`)

| Méthode | Endpoint | Auth | Description |
|---------|----------|------|-------------|
| GET | `/` | Admin | Lister les logs (paginé, filtrable) |
| GET | `/{id}` | Admin | Détail d'un log |
| GET | `/stats` | Admin | Statistiques d'audit |
| GET | `/actions` | Admin | Liste des types d'actions |
| GET | `/entity-types` | Admin | Liste des types d'entités |
| GET | `/export/csv` | Admin | Exporter les logs en CSV |
| DELETE | `/cleanup` | Admin | Supprimer les anciens logs |
| **POST** | **`/consent`** | **JWT** | **Enregistrer l'acceptation du consentement APDP (v2.0)** |

**Filtres disponibles** : `action`, `userId`, `entityType`, `startDate`, `endDate`, `search` (full-text)

L'endpoint `POST /api/audit/consent` est accessible à **tous les utilisateurs authentifiés** (pas uniquement les admins). Il enregistre dans la table `AuditLog` :
- Action : `ConsentAccepted`
- UserId, IP, timestamp UTC
- Détails : version du consentement, texte accepté

### 10.6 Paramètres utilisateur (`/api/usersettings`)

| Méthode | Endpoint | Auth | Description |
|---------|----------|------|-------------|
| GET | `/` | JWT | Obtenir ses paramètres |
| PUT | `/` | JWT | Modifier ses paramètres |

**Paramètres stockés en JSON** :
- Types de fichiers à scanner
- Dossiers exclus (défaut : Windows, System32, Program Files, AppData)
- Extensions exclues (défaut : .exe, .dll, .sys, .tmp)
- Types de PII à détecter
- Chemins de scan récents

### 10.7 Initialisation (`/api/initialization`)

| Méthode | Endpoint | Auth | Description |
|---------|----------|------|-------------|
| GET | `/status` | Non | Vérifier si l'application est initialisée |
| POST | `/setup` | Non | Créer le premier compte admin |

---

## 11. Communication temps réel (SignalR)

### Architecture

```
Frontend (React)                          Backend (.NET)
    │                                          │
    ├── HubConnection.start() ──────────►  ScanHub
    │                                          │
    │   ◄──── ReceiveProgress(scanId,     ────┤
    │         current, total)                  │
    │                                          │
    │   ◄──── ScanComplete(scanId) ────────────┤
    │                                          │
    │   ◄──── ScanError(scanId, error) ────────┤
    │                                          │
    └── HubConnection.stop() ──────────►  Disconnect
```

### Hub SignalR

**Endpoint** : `/scanhub`

**Événements** :

| Événement | Paramètres | Fréquence | Description |
|-----------|------------|-----------|-------------|
| `ReceiveProgress` | scanId, current, total | Chaque fichier traité | Progression en temps réel |
| `ScanComplete` | scanId | 1 fois par scan | Scan terminé avec succès |
| `ScanError` | scanId, errorMessage | En cas d'erreur | Erreur pendant le scan |

### Côté client (React)

```typescript
// Connexion avec authentification JWT
const connection = new HubConnectionBuilder()
    .withUrl(hubUrl, {
        accessTokenFactory: () => localStorage.getItem('token')
    })
    .withAutomaticReconnect()
    .build();

// Écoute des événements
connection.on('ReceiveProgress', (scanId, current, total) => { ... });
connection.on('ScanComplete', (scanId) => { ... });
connection.on('ScanError', (scanId, error) => { ... });
```

### Fallback HTTP (Polling)

En complément de SignalR, un polling HTTP toutes les 2 secondes est utilisé comme fallback :
```typescript
const interval = setInterval(() => {
    scanApi.getProgress(scanId);
}, 2000);
```

Cela garantit que la progression est visible même si WebSocket est bloqué par un pare-feu.

---

## 12. Base de données SQLCipher

### 12.1 Pourquoi SQLCipher ?

| Critère | SQLite standard | SQLCipher |
|---------|----------------|-----------|
| Chiffrement | Aucun | AES-256 (CBC/HMAC-SHA512) |
| Protection au repos | Non | Oui - fichier .db illisible sans clé |
| Performance | Référence | ~5-15% overhead (négligeable) |
| Taille | Référence | Identique |
| Compatibilité | Totale | Nécessite SQLitePCL provider |

SQLCipher est choisi car :
- **Pas d'infrastructure** : Pas besoin de PostgreSQL/MySQL séparés
- **Portable** : Un seul fichier .db embarqué
- **Chiffrement transparent** : EF Core fonctionne normalement
- **Zéro configuration** : La clé est générée automatiquement

### 12.2 Gestion de la clé de chiffrement

```
Priorité de recherche de la clé :
1. Configuration (appsettings.json → Database:EncryptionKey)  ← Production
2. Fichier db_encryption.key sur le disque                    ← Développement
3. Génération automatique (32 bytes random → hex 64 chars)    ← Premier lancement
```

Le fichier `db_encryption.key` est protégé par :
- **ACL Windows** : Seul l'utilisateur courant et SYSTEM ont accès (FullControl)
- **Attributs** : Hidden + ReadOnly
- **Héritage désactivé** : Pas de permissions héritées du dossier parent

### 12.3 Schéma de la base de données

```sql
┌──────────────────┐     ┌──────────────────┐
│      Users       │     │    Sessions      │
├──────────────────┤     ├──────────────────┤
│ Id (PK)          │◄────│ UserId (FK)      │
│ Username (UQ)    │     │ RefreshToken     │
│ Email (UQ)       │     │ CreatedAt        │
│ PasswordHash     │     │ ExpiresAt        │
│ FullName         │     │ IpAddress        │
│ Role             │     │ IsRevoked        │
│ IsActive         │     └──────────────────┘
│ CreatedAt        │
│ CreatedBy        │     ┌──────────────────┐
│ LastLoginAt      │◄────│   AuditLogs      │
└──────────────────┘     ├──────────────────┤
        │                │ UserId (FK, NULL)│
        │                │ Action           │
        ▼                │ EntityType       │
┌──────────────────┐     │ EntityId         │
│     Scans        │     │ IpAddress        │
├──────────────────┤     │ CreatedAt (IDX)  │
│ ScanId (UQ)      │     │ Details          │
│ UserId (FK)      │     └──────────────────┘
│ DirectoryPath    │
│ FilesScanned     │     ┌──────────────────┐
│ PiiDetected      │     │  UserSettings    │
│ CreatedAt        │     ├──────────────────┤
│ CompletedAt      │     │ UserId (FK, UQ)  │
│ Status           │     │ FileTypesJson    │
└──────────────────┘     │ ExcludedFolders  │
                         │ ExcludedExtensions│
┌──────────────────┐     │ PiiTypesJson     │
│   AppSettings    │     │ RecentScanPaths  │
├──────────────────┤     │ UpdatedAt        │
│ DataRetentionDays│     └──────────────────┘
│ AuditLogRetention│
│ SessionRetention │
│ AutoBackupEnabled│
│ AutoBackupInterval│
│ LastAutoBackup   │
│ UpdatedAt        │
│ UpdatedBy        │
└──────────────────┘
```

### 12.4 Index de performance

```sql
CREATE INDEX IX_Users_Username ON Users(Username);
CREATE INDEX IX_Users_Email ON Users(Email);
CREATE INDEX IX_Sessions_RefreshToken ON Sessions(RefreshToken);
CREATE INDEX IX_Sessions_UserId ON Sessions(UserId);
CREATE UNIQUE INDEX IX_Scans_ScanId ON Scans(ScanId);
CREATE INDEX IX_Scans_UserId ON Scans(UserId);
CREATE INDEX IX_AuditLogs_UserId ON AuditLogs(UserId);
CREATE INDEX IX_AuditLogs_CreatedAt ON AuditLogs(CreatedAt);
CREATE UNIQUE INDEX IX_UserSettings_UserId ON UserSettings(UserId);
```

---

## 13. Système de rapports

### 13.1 Formats disponibles

| Format | Extension chiffrée | Taille typique | Usage recommandé |
|--------|-------------------|----------------|------------------|
| **CSV** | .csv.enc | ~50 KB | Import dans Excel, traitement automatisé |
| **JSON** | .json.enc | ~80 KB | Intégration API, pipelines de données |
| **HTML** | .html.enc | ~120 KB | Rapport visuel interactif, présentation |
| **Excel** | .xlsx.enc | ~100 KB | Analyse approfondie, filtrage, multi-feuilles |

> **v2.0** : Tous les rapports sont chiffrés AES-256-CBC avant d'être envoyés au client. L'extension `.enc` indique un fichier chiffré.

### 13.2 Chiffrement des rapports (v2.0)

**Fichier** : `PiiScanner.Api/Controllers/ScanController.cs` → `DownloadReport()`

Lors de chaque téléchargement de rapport, le serveur :

1. Génère un mot de passe aléatoire de **20 caractères** (~127 bits d'entropie)
2. Chiffre le rapport avec **AES-256-CBC + PBKDF2-SHA256** (100 000 itérations)
3. Retourne le fichier chiffré `.enc`
4. Expose le mot de passe **une seule fois** dans le header `X-Report-Password`
5. Ne stocke jamais le mot de passe côté serveur

```
Format du fichier .enc :
  [0-15]   Salt 16 bytes (aléatoire)
  [16-31]  IV 16 bytes (dérivé du PBKDF2)
  [32-N]   Données chiffrées (AES-256-CBC, padding PKCS7)
```

**Le mot de passe est affiché dans un dialog une seule fois.** Une fois fermé, il est définitivement inaccessible — même pour l'administrateur.

### 13.3 Déchiffrement (v2.0)

**Option 1 — Page /decrypt (recommandée)** :
L'application intègre une page de déchiffrement à `/decrypt`. Le déchiffrement s'effectue **100% dans le navigateur** via la Web Crypto API — aucune donnée n'est envoyée en ligne.

```
Processus de déchiffrement dans le navigateur :
  1. Glisser-déposer le fichier .enc
  2. Saisir le mot de passe
  3. Web Crypto API :
     - Lecture des 16 premiers bytes → salt
     - Bytes 16-31 → IV
     - PBKDF2-SHA256 (100 000 it.) → clé AES-256
     - AES-CBC.decrypt() → données en clair
  4. Téléchargement automatique du fichier déchiffré
```

**Option 2 — OpenSSL (ligne de commande)** :
```bash
# Extraction manuelle du salt et IV requis
# → Utiliser la page /decrypt qui gère automatiquement le format
```

### 13.4 Contenu des rapports

Chaque rapport contient :

**Section 1 - Métadonnées** :
- Date du scan
- Version de l'application
- Nombre total de fichiers scannés
- Nombre de fichiers avec PII
- Total de PII détectées

**Section 2 - Statistiques** :
- Répartition par type de PII (nombre + pourcentage)
- Top fichiers à risque avec niveaux de risque

**Section 3 - Fichiers à risque** :
- Niveau de risque (ÉLEVÉ/MOYEN/FAIBLE)
- Chemin du fichier
- Nombre de PII
- Ancienneté (Stale Data)
- Niveau d'exposition
- Accès Everyone (OUI/NON)
- Partage réseau (OUI/NON)
- Nombre de groupes d'accès

**Section 4 - Détails des détections** :
- Chemin du fichier
- Type de PII
- Valeur détectée

### 13.5 Classification des risques

| Niveau | Condition | Couleur |
|--------|-----------|---------|
| **FAIBLE** | 1-5 PII dans le fichier | Vert (#4caf50) |
| **MOYEN** | 6-15 PII dans le fichier | Orange (#ff9800) |
| **ÉLEVÉ** | 16+ PII dans le fichier | Rouge (#f44336) |

### 13.6 Rapport HTML

Le rapport HTML est un fichier autonome (pas de dépendances externes) contenant :
- CSS Grid responsive intégré
- Tableaux interactifs avec tri
- Badges colorés pour les niveaux de risque
- Barres de progression CSS pour les statistiques
- Hover pour afficher les chemins complets

---

## 14. Frontend React - Architecture détaillée

### 14.1 Structure du projet

```
pii-scanner-ui/
├── src/
│   ├── components/
│   │   ├── Layout/
│   │   │   ├── MainLayout.tsx      # Layout principal + thème
│   │   │   └── Sidebar.tsx         # Navigation latérale
│   │   ├── pages/
│   │   │   ├── DashboardPage.tsx   # KPIs + graphiques
│   │   │   ├── Scanner.tsx         # Interface de scan
│   │   │   ├── RiskyFiles.tsx      # Fichiers à risque
│   │   │   ├── Detections.tsx      # Détections détaillées
│   │   │   ├── PiiCategoryAnalysis.tsx  # Analyse par catégorie
│   │   │   ├── DuplicateFiles.tsx  # Fichiers dupliqués
│   │   │   ├── Staleness.tsx       # Ancienneté
│   │   │   ├── Exposure.tsx        # Exposition
│   │   │   ├── Reports.tsx         # Rapports & analytics
│   │   │   ├── Exports.tsx         # Téléchargement rapports
│   │   │   ├── DataRetention.tsx   # Rétention des données
│   │   │   ├── ScanHistory.tsx     # Historique des scans
│   │   │   ├── Profile.tsx         # Profil utilisateur
│   │   │   ├── Settings.tsx        # Paramètres
│   │   │   ├── DatabaseManagement.tsx  # Admin : BDD
│   │   │   ├── UserManagement.tsx  # Admin : utilisateurs
│   │   │   ├── AuditTrail.tsx      # Admin : audit
│   │   │   ├── Support.tsx         # FAQ et contact
│   │   │   ├── About.tsx           # À propos
│   │   │   └── DecryptReport.tsx   # Déchiffrement .enc — Web Crypto API (v2.0)
│   │   ├── Login.tsx               # Page de connexion
│   │   ├── InitialSetup.tsx        # Setup initial
│   │   ├── ProtectedRoute.tsx      # Guard de route
│   │   ├── ErrorBoundary.tsx       # Gestion d'erreurs
│   │   └── common/
│   │       └── ConsentModal.tsx    # Modal APDP (v2.0)
│   ├── contexts/
│   │   └── AuthContext.tsx         # État d'authentification
│   ├── services/
│   │   ├── axios.ts                # Instance Axios + CSRF
│   │   └── apiClient.ts           # Client API + SignalR
│   ├── types/
│   │   └── index.ts               # Interfaces TypeScript
│   ├── App.tsx                     # Routes + état global
│   └── main.tsx                    # Point d'entrée
├── vite.config.ts                  # Configuration Vite
├── tsconfig.json                   # Configuration TypeScript
└── package.json                    # Dépendances
```

### 14.2 Gestion de l'état

L'application utilise **React Context + useState** (pas de Redux) :

| État | Scope | Stockage | Description |
|------|-------|----------|-------------|
| `user`, `token` | Global (AuthContext) | localStorage | Authentification |
| `scanning`, `scanId`, `results` | App.tsx | localStorage (persistance) | Scan en cours et résultats |
| `error`, `successMessage` | App.tsx | Mémoire | Notifications |
| `darkMode` | MainLayout | Mémoire | Thème clair/sombre |
| Filtres, pagination | Chaque page | Mémoire | Filtrage local |

### 14.3 Flux de navigation

```
Démarrage
    │
    ├── GET /api/initialization/status
    │
    ├── isInitialized = false ──► InitialSetup (création admin)
    │                                    │
    │                              window.location.reload()
    │                                    │
    └── isInitialized = true ───► Login
                                     │
                                POST /api/auth/login
                                     │
                                AuthContext.login()
                                     │
                                 MainLayout
                                     │
                              ┌──────┴──────┐
                              │   Sidebar   │
                              │    (nav)    │
                              └──────┬──────┘
                                     │
                              <Outlet /> (routes)
```

### 14.4 Thème Material-UI

```typescript
Palette Light:
  primary: #667eea (violet-bleu)
  secondary: #764ba2 (violet)
  background.default: #f5f7fa
  background.paper: #ffffff

Palette Dark:
  primary: #667eea
  secondary: #764ba2
  background.default: #0f1419
  background.paper: #1a1f37

Typography:
  fontFamily: 'Plus Jakarta Sans', 'Inter', system-fonts
  Headings: weight 600-800, letter-spacing optimisé

Components:
  MuiButton: borderRadius 8px, no text-transform
  MuiCard: borderRadius 12px
  MuiChip: custom font weight
```

### 14.5 Sidebar (Navigation)

Structure du menu avec contrôle d'accès par rôle :

```
Menu (tous les utilisateurs) :
├── Dashboard
├── Scans ▼
│   ├── Nouveau Scan
│   └── Historique
├── Analyse des résultats ▼
│   ├── Fichiers à risque
│   ├── Données sensibles
│   ├── Analyse par Catégories
│   ├── Fichiers dupliqués
│   ├── Ancienneté
│   └── Exposition
├── Rapports & Analytics
├── Exports
├── Déchiffrer un rapport  ← (v2.0)
├── Rétention
├── Mon Profil
├── Support
└── À propos

Menu Admin uniquement :
├── Maintenance ▼
│   ├── Utilisateurs
│   ├── Base de données
│   ├── Audit Trail
│   └── Paramètres
```

La sidebar est **rétractable** (240px → 65px) avec des sous-menus dépliables (Collapse).

### 14.6 Internationalisation (i18n) (v2.0)

L'interface est disponible en **français et en anglais**. La langue est auto-détectée via `i18next-browser-languagedetector` et stockée dans `localStorage` sous la clé `pii-scanner-language`.

Les fichiers de traduction se trouvent dans `pii-scanner-ui/src/i18n/` :
- `fr.json` — Français (langue par défaut)
- `en.json` — Anglais

Toutes les chaînes de l'interface utilisent le hook `useTranslation()` — aucune chaîne n'est codée en dur dans les composants.

### 14.7 ConsentModal (v2.0)

**Fichier** : `pii-scanner-ui/src/components/common/ConsentModal.tsx`

Modal APDP affiché avant le premier scan de chaque utilisateur. Caractéristiques :
- Impossible à contourner : touche Échap désactivée, clic hors modal bloqué
- Case à cocher obligatoire (consentement actif, pas passif)
- Explique les 4 modalités : accès fichiers, traitement local, stockage chiffré, droit à l'effacement
- Lors de la validation : appel `POST /api/audit/consent`, stockage dans `localStorage` sous `scanConsent_<username>`

### 14.6 Dashboard (KPIs et graphiques)

4 cartes KPI avec gradients distincts :

| KPI | Gradient | Données |
|-----|----------|---------|
| Fichiers scannés | #667eea → #764ba2 | statistics.totalFilesScanned |
| Fichiers avec PII | #f093fb → #f5576c | statistics.filesWithPii |
| PII détectées | #4facfe → #00f2fe | statistics.totalPiiFound |
| Types de PII | #43e97b → #38f9d7 | Object.keys(statistics.piiByType).length |

Graphiques Recharts :
- **Bar Chart horizontal** : Distribution des types de PII
- **Pie Chart** : Répartition proportionnelle
- **Bar Chart** : Niveaux de risque (FAIBLE/MOYEN/ÉLEVÉ)
- **Bar Chart** : Ancienneté (Récent → +5 ans)
- **Bar Chart** : Exposition (Faible → Critique)

### 14.7 Page Scanner

**Avant le scan** :
- Champ de saisie du chemin (TextField + icône dossier)
- Section "Chemins récents" (localStorage, max 5)
- Alerte : formats supportés
- Alerte : "100% local - aucune donnée envoyée"
- Liste des 18 types de PII (Chips)
- Bouton "Lancer le scan" (gradient)

**Pendant le scan** :
- Pourcentage en grand format (4rem)
- Barre de progression (LinearProgress, 16px, gradient)
- Statistiques en temps réel : fichiers traités, PII trouvés
- Chemin en cours d'analyse
- Avertissement : "Ne fermez pas cette fenêtre"

### 14.8 Axios et CSRF

```typescript
// Intercepteur de requête
axiosInstance.interceptors.request.use(config => {
    // 1. Ajouter le JWT
    const token = localStorage.getItem('token');
    if (token) config.headers.Authorization = `Bearer ${token}`;

    // 2. Pour les requêtes d'écriture, ajouter le CSRF
    if (['post', 'put', 'delete', 'patch'].includes(config.method)) {
        await initializeCsrfToken();
        config.headers['X-CSRF-Token'] = csrfToken;
    }

    return config;
});

// Intercepteur de réponse
axiosInstance.interceptors.response.use(
    response => {
        // Capturer le nouveau token CSRF
        const newToken = response.headers['x-csrf-token'];
        if (newToken) csrfToken = newToken;
        return response;
    },
    error => {
        // 401 → Redirection vers /login
        if (error.response?.status === 401) {
            localStorage.clear();
            window.location.href = '/login';
        }
    }
);
```

---

## 15. Authentification et gestion des sessions

### Flux complet d'authentification

```
┌──────────────┐         ┌──────────────┐         ┌──────────────┐
│   Frontend   │         │   Backend    │         │   Database   │
│   (React)    │         │   (.NET)     │         │  (SQLCipher) │
└──────┬───────┘         └──────┬───────┘         └──────┬───────┘
       │                        │                        │
       │ POST /auth/login       │                        │
       │ {username, password}   │                        │
       │───────────────────────►│                        │
       │                        │ SELECT * FROM Users    │
       │                        │ WHERE Username=...     │
       │                        │───────────────────────►│
       │                        │◄───────────────────────│
       │                        │                        │
       │                        │ BCrypt.Verify()        │
       │                        │                        │
       │                        │ GenerateRefreshToken() │
       │                        │ (32 bytes random)      │
       │                        │                        │
       │                        │ INSERT Session         │
       │                        │───────────────────────►│
       │                        │◄───────────────────────│
       │                        │                        │
       │                        │ GenerateJwtToken()     │
       │                        │ (HS256, claims, 8h)    │
       │                        │                        │
       │ {token, refreshToken,  │                        │
       │  user, expiresAt}      │                        │
       │◄───────────────────────│                        │
       │                        │                        │
       │ localStorage.setItem() │                        │
       │                        │                        │
```

### Refresh Token Flow

```
JWT expiré (8h)
    │
    ├── Intercepteur Axios détecte 401
    │
    ├── POST /auth/refresh
    │   {refreshToken: "..."}
    │
    ├── Backend :
    │   ├── Lookup session par refreshToken
    │   ├── Vérifier : non révoquée ET non expirée
    │   ├── Vérifier : utilisateur existe ET actif
    │   ├── Révoquer l'ancienne session
    │   ├── Créer nouvelle session (30 jours)
    │   └── Générer nouveau JWT
    │
    └── Client : mettre à jour localStorage
```

### Claims JWT

```json
{
  "sub": "1",                    // UserId
  "unique_name": "admin",       // Username
  "email": "admin@company.com", // Email
  "role": "Admin",              // Rôle
  "FullName": "Administrateur", // Nom complet
  "SessionId": "42",            // ID de session (pour validation)
  "exp": 1738012800,            // Expiration
  "iss": "PiiScanner",          // Émetteur
  "aud": "PiiScannerApp"        // Audience
}
```

### Rôles et permissions

| Action | Admin | Operator |
|--------|-------|----------|
| Scanner des fichiers | Oui | Oui |
| Voir les résultats | Oui | Oui |
| Télécharger des rapports | Oui | Oui |
| Gérer son profil | Oui | Oui |
| Changer son mot de passe | Oui | Oui |
| Gérer les utilisateurs | Oui | Non |
| Gérer la base de données | Oui | Non |
| Voir le journal d'audit | Oui | Non |
| Réinitialiser la base | Oui | Non |

---

## 16. Performances et optimisations

### Backend

| Optimisation | Impact | Détail |
|-------------|--------|--------|
| **Regex compilées** | 2-3x plus rapide | `RegexOptions.Compiled` : compilation JIT au démarrage |
| **Scan parallèle** | Utilisation CPU maximale | `Parallel.ForEach` avec `MaxDegreeOfParallelism = ProcessorCount` |
| **Hash MD5 conditionnel** | Économie I/O | Calculé uniquement si des PII sont détectées dans le fichier |
| **Énumération lazy** | Mémoire constante | `Directory.EnumerateFiles` (pas `GetFiles`) |
| **Index BDD** | Requêtes rapides | Index sur les colonnes fréquemment filtrées |
| **Connection pooling** | Moins d'overhead | Géré automatiquement par EF Core |
| **IgnoreInaccessible** | Pas de crashs | Les fichiers sans permissions sont ignorés silencieusement |

### Frontend

| Optimisation | Impact | Détail |
|-------------|--------|--------|
| **Vite build** | Bundle optimisé | Tree-shaking, minification, code-splitting automatique |
| **localStorage cache** | Restauration instantanée | Résultats du dernier scan sauvegardés localement |
| **Polling adaptatif** | Bande passante | 2 secondes entre les requêtes de progression |
| **React.memo** | Moins de re-renders | Composants statistiques mémorisés |
| **Recharts responsive** | Performance graphiques | ResponsiveContainer adapte le canvas |

### Benchmarks typiques

| Scénario | Fichiers | Durée estimée | PII détectées |
|----------|----------|---------------|---------------|
| Petit dossier | ~100 fichiers | 2-5 secondes | Variable |
| Dossier moyen | ~1 000 fichiers | 10-30 secondes | Variable |
| Grand dossier | ~10 000 fichiers | 1-5 minutes | Variable |
| Très grand | ~50 000+ fichiers | 5-15 minutes | Variable |

*Les durées dépendent du type de fichiers (PDF = plus lent que TXT), de la taille des fichiers, et du matériel.*

---

## 17. Déploiement et packaging

### 17.1 Architecture de déploiement

```
PII-Scanner-v2.0.0-Windows-Standalone.zip (~73 MB)
│
├── PiiScanner.Api.exe          # Exécutable principal (double-cliquer)
├── PiiScanner.Api.dll          # Bibliothèque principale
├── PiiScanner.Core.dll         # Logique métier
├── appsettings.json            # Configuration
├── appsettings.Production.json # Configuration production
├── wwwroot/                    # Frontend React compilé
│   ├── index.html
│   └── assets/
│       ├── index-xxxxx.js      # Bundle JS minifié
│       └── index-xxxxx.css     # Styles minifiés
├── *.dll                       # Dépendances .NET
├── START.bat                   # Lanceur alternatif
├── LISEZMOI.txt                # Instructions
└── db_encryption.key           # Clé SQLCipher (créée au 1er lancement)
```

### 17.2 Self-contained deployment

L'exécutable est **self-contained** : le runtime .NET 9.0 est embarqué dans le package. Aucune installation de .NET n'est requise sur la machine cible.

### 17.3 Script de build

```powershell
# build-standalone-release.ps1
#
# 1. Build du frontend React
cd pii-scanner-ui
npm run build
xcopy /E /I dist ..\PiiScanner.Api\wwwroot

# 2. Publish .NET self-contained
dotnet publish PiiScanner.Api -c Release -r win-x64 --self-contained
#    -c Release     → Optimisations de compilation
#    -r win-x64     → Cible Windows 64-bit
#    --self-contained → Runtime inclus

# 3. Création du ZIP avec fichiers bonus
Compress-Archive -Path publish/* -DestinationPath release.zip
```

### 17.4 Premier lancement

```
1. Extraire le ZIP
2. Double-cliquer sur PiiScanner.Api.exe
3. Le navigateur s'ouvre automatiquement (http://localhost:5000)
4. Page InitialSetup : créer le compte administrateur
5. Se connecter et commencer à scanner
```

---

## 18. Modèle de données

### 18.1 Entités principales

#### User
| Champ | Type | Contrainte | Description |
|-------|------|------------|-------------|
| Id | int | PK, auto-increment | Identifiant unique |
| Username | string | UNIQUE, NOT NULL | Nom d'utilisateur |
| Email | string | UNIQUE, NOT NULL | Email |
| PasswordHash | string | NOT NULL | Hash BCrypt du mot de passe |
| FullName | string | NOT NULL | Nom complet |
| Role | string | NOT NULL, default "Operator" | "Admin" ou "Operator" |
| IsActive | bool | default true | Compte actif/désactivé |
| CreatedAt | DateTime | NOT NULL | Date de création (UTC) |
| CreatedBy | int? | FK → Users.Id | Admin qui a créé le compte |
| LastLoginAt | DateTime? | | Dernière connexion |

#### Session
| Champ | Type | Contrainte | Description |
|-------|------|------------|-------------|
| Id | int | PK | Identifiant |
| UserId | int | FK → Users.Id | Utilisateur associé |
| RefreshToken | string | NOT NULL | Token 32 bytes random (Base64) |
| CreatedAt | DateTime | NOT NULL | Date de création |
| ExpiresAt | DateTime | NOT NULL | Expiration (30 jours) |
| IpAddress | string | NOT NULL | IP du client |
| IsRevoked | bool | default false | Révoqué lors du logout |

#### ScanRecord
| Champ | Type | Contrainte | Description |
|-------|------|------------|-------------|
| Id | int | PK | Identifiant |
| ScanId | string | UNIQUE | UUID du scan |
| UserId | int | FK → Users.Id | Utilisateur qui a lancé le scan |
| DirectoryPath | string | NOT NULL | Chemin scanné |
| FilesScanned | int? | | Nombre de fichiers (null pendant le scan) |
| PiiDetected | int? | | Nombre de PII (null pendant le scan) |
| CreatedAt | DateTime | NOT NULL | Début du scan |
| CompletedAt | DateTime? | | Fin du scan |
| Status | string | NOT NULL, default "Running" | "Running", "Completed", "Failed" |

#### AuditLog
| Champ | Type | Contrainte | Description |
|-------|------|------------|-------------|
| Id | int | PK | Identifiant |
| UserId | int? | FK → Users.Id | Utilisateur (null = système) |
| Action | string | NOT NULL | Type d'action |
| EntityType | string | NOT NULL | Type d'entité affectée |
| EntityId | string | NOT NULL | ID de l'entité |
| IpAddress | string | NOT NULL | IP du client |
| CreatedAt | DateTime | NOT NULL, INDEX | Horodatage (UTC) |
| Details | string? | | Informations détaillées |

### 18.2 Résultats de scan (en mémoire)

Les résultats de scan ne sont **pas persistés en base de données**. Ils sont stockés en mémoire dans le `ScanService` et peuvent être exportés en rapports.

```typescript
interface ScanResult {
    FilePath: string          // Chemin complet du fichier
    PiiType: string           // Type de PII détecté
    Match: string             // Valeur détectée
    LastAccessedDate?: Date   // Dernier accès au fichier
    FileHash?: string         // Hash MD5 (pour détection doublons)
    ExposureLevel?: string    // Faible / Moyen / Critique
    AccessibleToEveryone?: bool
    IsNetworkShare?: bool
    UserGroupCount?: int
}
```

---

## 19. Journal d'audit

### Actions auditées

| Action | Entité | Déclencheur | Détails logués |
|--------|--------|-------------|----------------|
| `LoginSuccess` | Auth | Connexion réussie | Username, IP |
| `LoginFailed` | Auth | Échec de connexion | Username tenté, IP |
| `CreateUser` | User | Création d'utilisateur | Nouveau username, rôle |
| `UpdateUser` | User | Modification | Champs modifiés |
| `DeleteUser` | User | Suppression | Username supprimé |
| `ChangePassword` | User | Changement de mot de passe | User ID, IP |
| `UpdateProfile` | User | Modification du profil | Champs modifiés |
| `CreateBackup` | Database | Sauvegarde | Nom du fichier |
| `DeleteBackup` | Database | Suppression de sauvegarde | Nom du fichier |
| `RestoreBackup` | Database | Restauration | Nom du fichier source |
| `OptimizeDatabase` | Database | VACUUM | Exécution |
| `CleanupDatabase` | Database | Nettoyage | Nombre d'enregistrements supprimés |
| `ResetDatabase` | Database | Réinitialisation complète | Backup de sécurité créé |
| `UpdateDatabaseSettings` | AppSettings | Modification paramètres | Nouveaux paramètres |
| `UpdateUserSettings` | UserSettings | Modification préférences | User ID |
| `CleanupAuditLogs` | AuditLog | Nettoyage des logs | Nombre de logs supprimés |
| **`ConsentAccepted`** | **Consent** | **Acceptation du modal APDP avant scan** | **Version consentement, timestamp (v2.0)** |
| **`DownloadReport`** | **Report** | **Téléchargement d'un rapport chiffré** | **Format, ScanId, "Rapport chiffré" (v2.0)** |
| **`DataErasure`** | **User** | **Droit à l'effacement APDP** | **"Suppression des données personnelles — droit à l'effacement APDP" (v2.0)** |

### Informations capturées

Chaque entrée du journal contient :
- **Qui** : UserId (null pour les actions système)
- **Quoi** : Action + EntityType + EntityId
- **Quand** : Horodatage UTC (indexé pour recherche rapide)
- **Où** : Adresse IP du client
- **Comment** : Détails textuels supplémentaires

### Rétention et export

- **Rétention configurable** : Par défaut 365 jours (modifiable dans AppSettings)
- **Export CSV** : Téléchargement complet avec filtres
- **Nettoyage automatique** : Suppression des logs au-delà de la période de rétention

---

## 20. Limitations connues et roadmap

### Limitations actuelles

| Limitation | Impact | Contournement |
|-----------|--------|---------------|
| Windows uniquement (standalone) | Pas de support Linux/macOS natif | Exécuter en dev mode avec `dotnet run` |
| Résultats en mémoire | Perdus si l'application redémarre | Exporter les rapports dès la fin du scan |
| Pas de scan planifié | Scans manuels uniquement | Automatisation via l'API REST + PowerShell |
| 7 formats de fichiers | Pas de support .pptx, .odt, .rtf | Convertir en format supporté |
| Scan non interruptible une fois lancé | Impossible d'annuler proprement | Attendre la fin ou redémarrer l'application |

**Fonctionnalités ajoutées en v2.0 (limitations résolues)** :
- ~~Pas d'i18n~~ → Interface bilingue FR/EN (i18next)
- ~~Pas de mode sombre persistant~~ → Persisté dans localStorage via le thème MUI
- ~~Pas de raccourcis clavier~~ → `Ctrl+E` (export CSV), `Escape` (arrêt scan)
- ~~Exports en clair~~ → Exports chiffrés AES-256-CBC

### Pistes d'évolution

- **Scan planifié** : Tâches CRON intégrées pour les scans automatiques
- **Notifications email** : Alertes sur les scans terminés ou les anomalies détectées
- **Support Linux** : Package pour distributions Linux (Ubuntu, Debian)
- **OCR** : Détection de PII dans les images (Tesseract)
- **Scan incrémental** : Ne rescanner que les fichiers modifiés depuis le dernier scan
- **Tableau de bord multi-scan** : Comparaison de scans dans le temps
- **Support .pptx / .odt / .rtf** : Formats bureautiques supplémentaires

---

## 21. Conformité APDP (v2.0)

PII Scanner v2.0 implémente quatre mesures de conformité spécifiques à la **Loi N°2017-20 portant Code du Numérique en République du Bénin** (articles 424, 425, 426) et au référentiel **PSSIE**.

---

### 21.1 Consentement éclairé (Art. 424-426)

**Fichier** : `pii-scanner-ui/src/components/common/ConsentModal.tsx`

Avant tout traitement de données personnelles, un modal de consentement est affiché. Ce modal est **impossible à contourner** :

- La touche `Échap` est désactivée
- Cliquer en dehors du modal ne le ferme pas
- Une case à cocher doit être cochée explicitement (consentement actif)
- Le bouton de confirmation est désactivé tant que la case n'est pas cochée

**Contenu du modal** :

Le modal explique en langage clair les 4 modalités de traitement :
1. Accès aux fichiers du dossier sélectionné (lecture seule)
2. Traitement 100% local — aucune donnée envoyée en ligne
3. Stockage sécurisé AES-256 (base de données chiffrée)
4. Droit à l'effacement disponible à tout moment

**Traçabilité** :

Lors de la validation, l'application :
1. Stocke le consentement dans `localStorage` sous `scanConsent_<username>`
2. Appelle `POST /api/audit/consent` pour enregistrer en base de données

L'entrée AuditLog contient :
- `Action` : `ConsentAccepted`
- `UserId`, `IpAddress`, `CreatedAt` (UTC)
- `Details` : texte horodaté avec version du consentement

**Conformité** : Art. 424 (licéité du traitement), Art. 425 (information préalable), Art. 426 (consentement explicite).

---

### 21.2 Droit à l'effacement (Art. 424)

**Endpoint** : `DELETE /api/users/{id}/data`  
**Accès** : Administrateurs uniquement (RBAC)

Lors de l'appel à cet endpoint, la suppression s'effectue en **cascade complète et irréversible** dans cet ordre :

```
1. Sessions (refresh tokens actifs)
2. ScanRecords (historique des scans)
3. UserSettings (préférences)
4. AuditLogs (sauf le dernier — voir ci-dessous)
5. User (compte)
```

**Dernier enregistrement d'audit conservé** :

Conformément aux bonnes pratiques d'auditabilité, un dernier enregistrement est conservé après la suppression :
```
Action  : DataErasure
Details : "Suppression des données personnelles — droit à l'effacement APDP"
UserId  : null (l'utilisateur n'existe plus)
```

**Conformité** : Art. 424 al. 5 (droit à l'effacement), principe de traçabilité PSSIE.

---

### 21.3 Chiffrement des exports (PSSIE — Confidentialité)

**Fichier** : `PiiScanner.Api/Controllers/ScanController.cs` → `ReportEncryption`

Tous les rapports exportés contiennent des données personnelles identifiables. Ils sont chiffrés **avant transmission** via AES-256-CBC.

**Paramètres cryptographiques** :

| Paramètre | Valeur | Référence |
|-----------|--------|-----------|
| Algorithme | AES-256-CBC | NIST FIPS 197 |
| Dérivation de clé | PBKDF2-SHA256 | NIST SP 800-132 |
| Itérations PBKDF2 | 100 000 | Recommandation OWASP 2024 |
| Salt | 16 bytes aléatoires (CSPRNG) | — |
| IV | 16 bytes (dérivé PBKDF2) | — |
| Entropie du mot de passe | ~127 bits (20 chars) | — |

**Garanties** :
- Le mot de passe est généré par `RandomNumberGenerator` (CSPRNG) — pas de `Random()`
- Il est transmis **une seule fois** via le header `X-Report-Password`
- Il n'est **jamais stocké** côté serveur (ni en base, ni en logs)
- Une fois le dialog fermé dans l'UI, la récupération est impossible

**Conformité** : PSSIE §4.3 (chiffrement des données sensibles en transit et au repos), Art. 424 (intégrité et confidentialité).

---

### 21.4 Déchiffrement intégré — Web Crypto API (v2.0)

**Fichier** : `pii-scanner-ui/src/components/pages/DecryptReport.tsx`  
**Route** : `/decrypt`

Page dédiée au déchiffrement des fichiers `.enc`. Le déchiffrement s'effectue **intégralement dans le navigateur** — aucune donnée ne quitte le poste de travail pendant cette opération.

**Implémentation** :
```typescript
// 1. Lecture du fichier .enc
const data = await file.arrayBuffer();
const salt = data.slice(0, 16);
const iv   = data.slice(16, 32);
const enc  = data.slice(32);

// 2. Dérivation de la clé (PBKDF2)
const keyMaterial = await crypto.subtle.importKey('raw', passwordBytes, 'PBKDF2', false, ['deriveKey']);
const aesKey = await crypto.subtle.deriveKey(
  { name: 'PBKDF2', salt, iterations: 100000, hash: 'SHA-256' },
  keyMaterial,
  { name: 'AES-CBC', length: 256 },
  false, ['decrypt']
);

// 3. Déchiffrement AES-CBC
const decrypted = await crypto.subtle.decrypt({ name: 'AES-CBC', iv }, aesKey, enc);
```

**Fonctionnalités UX** :
- Zone de glisser-déposer (drag & drop) acceptant uniquement les fichiers `.enc`
- Champ mot de passe avec affichage/masquage
- Téléchargement automatique du fichier déchiffré avec le bon type MIME
- Messages d'erreur clairs (mot de passe incorrect, format invalide)

**Conformité** : Principe de minimisation (aucune donnée exposée en transit), PSSIE §4.3.

---

### 21.5 Tableau de conformité — Articles 424-426

| Article | Exigence | Implémentation PII Scanner | Statut |
|---------|----------|---------------------------|--------|
| Art. 424 al. 1 | Licéité du traitement | Modal de consentement obligatoire avant tout scan | ✅ |
| Art. 424 al. 2 | Finalité déterminée | Finalité expliquée dans le modal : audit de conformité PII | ✅ |
| Art. 424 al. 3 | Minimisation des données | Résultats en RAM uniquement, non persistés en base | ✅ |
| Art. 424 al. 4 | Exactitude | Validation avancée (Luhn, anti-faux positifs) — ~87% moins de FP | ✅ |
| Art. 424 al. 5 | Droit à l'effacement | `DELETE /api/users/{id}/data` — suppression en cascade | ✅ |
| Art. 424 al. 6 | Intégrité et confidentialité | AES-256 (SQLCipher + exports), BCrypt, JWT, HTTPS/TLS | ✅ |
| Art. 425 | Information préalable | Modal détaillé avec les 4 modalités de traitement | ✅ |
| Art. 426 | Consentement explicite | Case à cocher obligatoire, horodaté en AuditLog | ✅ |
| PSSIE §4.3 | Chiffrement données sensibles | AES-256-CBC exports + AES-256 base de données (SQLCipher) | ✅ |
| PSSIE §5.1 | Traçabilité | AuditLog complet : login, scan, rapport, consentement, effacement | ✅ |
| PSSIE §6.2 | Contrôle d'accès | RBAC Admin/Operator, JWT, sessions révocables | ✅ |

---

## Annexe A : Dépendances NuGet (.NET)

| Package | Version | Usage |
|---------|---------|-------|
| Microsoft.AspNetCore.Authentication.JwtBearer | 9.0.x | Authentification JWT |
| Microsoft.EntityFrameworkCore.Sqlite | 9.0.x | ORM + SQLite |
| SQLitePCL.raw | bundle_e_sqlcipher | Chiffrement SQLCipher |
| Microsoft.AspNetCore.SignalR | 9.0.x | WebSocket temps réel |
| BCrypt.Net-Next | 4.x | Hachage mots de passe |
| DocumentFormat.OpenXml | 3.x | Lecture DOCX/XLSX |
| UglyToad.PdfPig | 0.x | Extraction texte PDF |
| ClosedXML | 0.x | Génération rapports Excel |
| Swashbuckle.AspNetCore | 7.x | Documentation Swagger (dev) |

## Annexe B : Dépendances npm (React)

| Package | Version | Usage |
|---------|---------|-------|
| react | ^19.2.0 | Bibliothèque UI |
| react-dom | ^19.2.0 | Rendu DOM |
| react-router-dom | ^7.12.0 | Routage SPA |
| @mui/material | ^7.3.6 | Composants UI Material Design |
| @mui/icons-material | ^7.3.6 | Icônes Material |
| @emotion/react | ^11.14.0 | CSS-in-JS |
| @emotion/styled | ^11.14.1 | Styled components |
| axios | ^1.13.2 | Client HTTP |
| @microsoft/signalr | ^10.0.0 | Client WebSocket |
| recharts | ^3.5.1 | Graphiques interactifs |
| typescript | ~5.9.3 | Typage statique |
| vite | ^7.2.4 | Bundler / dev server |
| vitest | ^4.0.16 | Tests unitaires |

## Annexe C : Variables de configuration

### appsettings.json

```json
{
  "Jwt": {
    "Secret": "VOTRE_SECRET_JWT_256_BITS_MINIMUM",
    "Issuer": "PiiScanner",
    "Audience": "PiiScannerApp",
    "ExpirationHours": 8
  },
  "Database": {
    "EncryptionKey": null
  },
  "Security": {
    "UseHttpsOnly": true
  },
  "ConnectionStrings": {
    "DefaultConnection": "Data Source=piiscanner.db"
  }
}
```

---

**Développé par Cyberprevs** | [cyberprevs.fr](https://cyberprevs.fr) | Licence MIT | v2.0.0 | Avril 2026
