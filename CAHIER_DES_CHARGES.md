# CAHIER DES CHARGES - PII SCANNER

**Application de Détection de Données Personnelles pour le Bénin**

---

## 📋 INFORMATIONS GÉNÉRALES

| Champ | Détail |
|-------|--------|
| **Nom du projet** | PII Scanner - Détecteur de Données Personnelles |
| **Version** | 1.0.0 |
| **Date de création** | Décembre 2024 |
| **Dernière mise à jour** | Décembre 2024 |
| **Développeur** | Cyberprevs |
| **Client** | Entreprises et organisations du Bénin |
| **Conformité légale** | Loi N°2017-20 du Bénin (APDP) |
| **Autorité de régulation** | APDP (Autorité de Protection des Données Personnelles) |
| **Licence** | Creative Commons BY-NC 4.0 |

---

## 🎯 OBJECTIFS DU PROJET

### Objectif principal
Développer une application de bureau sécurisée permettant aux entreprises béninoises d'**identifier, analyser et gérer** les données personnelles identifiables (PII) stockées dans leurs fichiers, afin d'assurer la conformité avec la **Loi N°2017-20 du Bénin** sur la protection des données personnelles.

### Objectifs secondaires
1. **Automatisation** : Planifier des scans automatiques pour une surveillance continue
2. **Analyse des risques** : Identifier les fichiers critiques, obsolètes ou sur-exposés
3. **Gestion de la rétention** : Appliquer les politiques de conservation des données selon l'APDP
4. **Reporting** : Générer des rapports détaillés pour audits et conformité
5. **Sécurité** : Protéger les données analysées avec chiffrement et authentification robuste
6. **Confidentialité** : Garantir un traitement 100% local sans transmission externe

---

## 📊 CONTEXTE ET BESOIN

### Contexte législatif
La **Loi N°2017-20 portant Code du Numérique en République du Bénin** impose aux organisations de :
- Identifier et cartographier les données personnelles qu'elles détiennent
- Limiter la collecte au strict nécessaire (principe de minimisation)
- Respecter des durées de conservation maximales selon le type de données
- Sécuriser les données contre les accès non autorisés
- Tenir un registre des traitements de données

### Problématique
Les entreprises béninoises font face à plusieurs défis :
1. **Méconnaissance des données détenues** : Fichiers Excel, PDF, Word contenant des PII non répertoriées
2. **Absence d'outils adaptés** : Pas de solutions locales conformes à l'APDP
3. **Risque de non-conformité** : Sanctions de l'APDP en cas de manquement
4. **Obsolescence des données** : Fichiers conservés au-delà des durées légales
5. **Exposition non contrôlée** : Fichiers sensibles accessibles à tous les utilisateurs

### Solution proposée
**PII Scanner** est une application de bureau **autonome et sécurisée** qui :
- Scanne les répertoires et détecte **19 types de PII spécifiques au Bénin**
- Identifie les fichiers à risque et génère des rapports détaillés
- Applique des politiques de rétention configurables
- Fonctionne **100% localement** sans transmission de données externe
- Offre une interface moderne et intuitive

---

## 👥 UTILISATEURS CIBLES

### Profil 1 : DPO (Délégué à la Protection des Données)
- **Responsabilités** : Conformité APDP, audits, registre des traitements
- **Besoins** : Cartographie complète des PII, rapports d'audit, gestion de la rétention
- **Rôle dans l'app** : Administrateur (accès complet)

### Profil 2 : Responsable IT
- **Responsabilités** : Sécurité des systèmes, sauvegardes, gestion des accès
- **Besoins** : Scans planifiés, analyse des permissions, détection de fuites
- **Rôle dans l'app** : Administrateur ou Utilisateur standard

### Profil 3 : Auditeur de conformité
- **Responsabilités** : Vérification de la conformité légale
- **Besoins** : Rapports détaillés, historique des scans, journal d'audit
- **Rôle dans l'app** : Utilisateur standard (lecture seule)

### Profil 4 : Chef de projet / Manager
- **Responsabilités** : Supervision des projets, gestion des risques
- **Besoins** : Tableaux de bord, statistiques, exports
- **Rôle dans l'app** : Utilisateur standard

---

## 🔍 EXIGENCES FONCTIONNELLES

### 1. DÉTECTION DE PII

#### 1.1 Types de données détectées (19 types)

**Données universelles**
- ✅ Email : Adresses électroniques avec validation RFC
- ✅ DateNaissance : Dates de naissance (JJ/MM/AAAA, 5-120 ans)
- ✅ CarteBancaire : Numéros de carte 16 chiffres (validation Luhn)

**Identité & Documents béninois**
- ✅ IFU : Identifiant Fiscal Unique (13 chiffres, commence par 0-3)
- ✅ CNI_Benin : Carte Nationale d'Identité (2 lettres + 6-10 chiffres)
- ✅ Passeport_Benin : Passeport béninois (BJ + 7 chiffres)
- ✅ RCCM : Registre du Commerce (RB/XXX/YYYY/X/NNNNN)
- ✅ ActeNaissance : Acte de naissance (N°XXX/YYYY/Département)

**Contact Bénin**
- ✅ Telephone : Numéros béninois (+229/00229 + préfixes 40-59, 60-69, 90-99)

**Données bancaires Bénin**
- ✅ IBAN : IBAN béninois (BJ + 2 chiffres + 24 caractères)
- ✅ MobileMoney_MTN : MTN MoMo (96, 97, 66, 67 + 6 chiffres)
- ✅ MobileMoney_Moov : Moov Money (98, 99, 68, 69 + 6 chiffres)

**Santé & Sécurité sociale Bénin**
- ✅ CNSS : Caisse Nationale de Sécurité Sociale (11 chiffres)
- ✅ RAMU : Régime d'Assurance Maladie Universelle (RAMU-XXXXXXXX)

**Éducation Bénin**
- ✅ INE : Identifiant National de l'Élève (INE-XXXXXXXX)
- ✅ Matricule_Fonctionnaire : Matricule fonctionnaire (F/M + 6-10 chiffres)

**Sécurité - Clés & Tokens**
- ✅ MotDePasse : Mots de passe en clair dans le code
- ✅ CleAPI_AWS : Clés API AWS (Access Key ID)
- ✅ Token_JWT : Tokens JWT (format eyJ...)

#### 1.2 Validation et réduction des faux positifs

**Critère de qualité** : Réduction de 85-95% des faux positifs

| Type PII | Méthode de validation | Réduction faux positifs |
|----------|----------------------|-------------------------|
| Telephone | Indicatif +229/00229 obligatoire, préfixes valides | ~95.7% |
| Email | Validation domaine strict, rejet fichiers | ~90% |
| DateNaissance | Âge 5-120 ans, dates passées uniquement | ~85.7% |
| CNSS | Rejet timestamps, exemples OWASP | ~86.7% |
| CarteBancaire | Algorithme de Luhn | ~99% |
| IFU | Premier caractère 0-3 | ~80% |

**Résultat global** : ~87% de faux positifs éliminés

#### 1.3 Formats de fichiers supportés

| Catégorie | Extensions | Méthode d'extraction |
|-----------|-----------|---------------------|
| Documents Office | .docx, .xlsx | DocumentFormat.OpenXml |
| Documents PDF | .pdf | PdfPig |
| Fichiers texte | .txt, .log, .csv, .json | Lecture directe UTF-8 |

**Note** : Extensions configurables via l'interface (page Paramètres)

### 2. SYSTÈME DE SCANS

#### 2.1 Scan manuel

**Fonctionnalité** : Lancer un scan immédiat sur un répertoire

**Entrées** :
- Chemin du répertoire à scanner (sélection via explorateur ou saisie manuelle)
- Extensions de fichiers à inclure/exclure (optionnel)

**Processus** :
1. Validation du chemin (protection Path Traversal)
2. Génération d'un `scanId` unique (GUID)
3. Scan en arrière-plan avec `Task.Run()`
4. Traitement parallèle des fichiers (`Parallel.ForEach`)
5. Mises à jour temps réel via SignalR (`ReceiveProgress`)
6. Génération automatique des rapports (CSV, JSON, HTML, Excel)

**Sorties** :
- Statistiques globales (nombre de fichiers, PII détectées, fichiers à risque)
- Liste des détections avec type PII, valeur, fichier, ligne
- Score de risque par fichier (Faible, Moyen, Élevé)
- Rapports téléchargeables

**Performance** :
- Utilisation optimale des CPU multi-cœurs
- Barre de progression en temps réel (X/Y fichiers)
- Temps estimé basé sur vitesse de traitement

#### 2.2 Scans planifiés

**Fonctionnalité** : Automatiser des scans périodiques

**Paramètres de planification** :
- **Nom** : Nom descriptif du scan (ex: "Scan Comptabilité")
- **Répertoire** : Chemin du répertoire à scanner
- **Fréquence** : Quotidien, Hebdomadaire, Mensuel, Trimestriel
- **Heure** : Heure d'exécution (0-23)
- **Jour de la semaine** : Lundi-Dimanche (pour scans hebdomadaires)
- **Jour du mois** : 1-28 (pour scans mensuels/trimestriels)
- **Notifications** : Activer/désactiver les notifications de fin de scan
- **Statut** : Actif/Inactif (permet de suspendre sans supprimer)

**Service d'arrière-plan** :
- Vérification toutes les 1 minute
- Exécution automatique si `NextRunAt <= DateTime.UtcNow`
- Validation de l'existence du répertoire avant exécution
- Mise à jour automatique de `NextRunAt` après exécution
- Création d'un log d'audit pour chaque exécution automatique

**Notifications** :
- Notification en cas de réussite (si activé)
- Notification en cas d'erreur (toujours)
- Alerte si répertoire introuvable (désactivation automatique du scan)

**Gestion** :
- CRUD complet via interface web
- Historique des exécutions (`LastRunAt`, `LastScanId`)
- Activation/désactivation rapide (toggle)
- Suppression avec confirmation

#### 2.3 Historique des scans

**Fonctionnalité** : Consultation de tous les scans effectués

**Informations affichées** :
- Date et heure du scan
- Répertoire scanné
- Nombre de fichiers analysés
- Nombre de PII détectées
- Nombre de fichiers à risque
- Durée du scan
- Statut (Réussi, Échoué, En cours)
- Lien vers les résultats détaillés

**Filtres** :
- Date (plage personnalisée)
- Répertoire
- Statut
- Type de scan (Manuel, Planifié)

**Actions** :
- Consulter les résultats
- Télécharger les rapports
- Comparer deux scans
- Supprimer (avec confirmation)

### 3. ANALYSE DES RISQUES

#### 3.1 Classification des risques

**Méthode de calcul** : Score automatique basé sur le nombre et le type de PII

| Niveau | Critères | Couleur UI |
|--------|----------|-----------|
| **FAIBLE** | 1-2 PII détectées | 🟢 Vert |
| **MOYEN** | 3-10 PII détectées | 🟡 Jaune |
| **ÉLEVÉ** | 11+ PII OU données bancaires | 🔴 Rouge |

**Données bancaires = risque ÉLEVÉ automatique** :
- CarteBancaire
- IBAN
- MobileMoney_MTN
- MobileMoney_Moov

#### 3.2 Stale Data Detection (Ancienneté)

**Objectif** : Identifier les fichiers contenant des PII non accédées depuis longtemps

**Catégories d'ancienneté** :

| Catégorie | Délai depuis dernier accès | Action recommandée |
|-----------|---------------------------|-------------------|
| **Récent** | < 6 mois | Aucune action |
| **Ancienneté moyenne** | 6 mois - 1 an | Vérifier la nécessité |
| **Ancien** | 1-3 ans | Révision recommandée |
| **Très ancien** | 3-5 ans | Suppression ou archivage |
| **Obsolète** | > 5 ans | **Suppression fortement recommandée** |

**Métrique** : Basée sur `File.GetLastAccessTime()`

**Affichage** :
- Liste des fichiers avec PII par catégorie d'ancienneté
- Graphique de répartition (donut chart)
- Total de fichiers obsolètes
- Bouton d'action rapide "Voir les fichiers obsolètes"

#### 3.3 Over-Exposed Data Detection (Exposition)

**Objectif** : Détecter les fichiers sensibles avec des permissions trop permissives (Windows NTFS)

**Niveaux d'exposition** :

| Niveau | Critères | Description |
|--------|----------|-------------|
| **CRITIQUE** | Accessible à "Everyone" | Fichier accessible à tous les utilisateurs du système |
| **ÉLEVÉ** | Accessible à "Authenticated Users" | Fichier accessible à tous les utilisateurs authentifiés |
| **MOYEN** | Partage réseau (UNC path) | Fichier sur un partage réseau (\\serveur\partage) |
| **FAIBLE** | Permissions normales | Accès restreint aux utilisateurs autorisés |

**Analyse** :
- Lecture des ACL (Access Control Lists) Windows
- Détection des groupes "Everyone" et "Authenticated Users"
- Identification des chemins UNC (`\\serveur\partage`)
- Vérification des permissions d'écriture/modification

**Affichage** :
- Top 20 fichiers les plus exposés
- Graphique de répartition par niveau d'exposition
- Recommandations de sécurisation
- Export de la liste pour action corrective

### 4. GESTION DE LA RÉTENTION DES DONNÉES

#### 4.1 Politiques de rétention configurables

**Conformité** : Loi N°2017-20 du Bénin (APDP)

**Catégories de données** :

| Catégorie | Types PII inclus | Rétention par défaut | Rétention min/max |
|-----------|------------------|---------------------|-------------------|
| **Données bancaires** | IBAN, MobileMoney_MTN, MobileMoney_Moov, CarteBancaire | 5 ans | 1-10 ans |
| **Données d'identité** | IFU, CNI_Benin, Passeport_Benin, RCCM, ActeNaissance | 3 ans | 1-10 ans |
| **Données de santé** | CNSS, RAMU | 5 ans | 1-10 ans |
| **Données éducatives** | INE, Matricule_Fonctionnaire | 2 ans | 1-10 ans |
| **Données de contact** | Email, Telephone | 1 an | 1-10 ans |

**Configuration** :
- Interface de gestion des politiques
- Modification des durées de rétention par catégorie
- Sauvegarde automatique dans la base de données
- Historique des modifications (journal d'audit)

#### 4.2 Scan de rétention

**Fonctionnalité** : Identifier les fichiers dépassant les durées de rétention

**Processus** :
1. Sélection d'un répertoire à scanner
2. Application des politiques de rétention configurées
3. Calcul de la date d'expiration par fichier (date de création + durée de rétention)
4. Identification des fichiers obsolètes (`dateExpiration < dateActuelle`)
5. Génération d'une liste avec :
   - Nom du fichier
   - Chemin complet
   - Type(s) de PII détecté(s)
   - Date de création
   - Date d'expiration
   - Nombre de jours de dépassement

**Résultat** :
- Tableau interactif avec tri et filtres
- Total de fichiers obsolètes
- Espace disque libérable (estimation)
- Bouton de suppression sécurisée

#### 4.3 Suppression sécurisée

**Fonctionnalité** : Supprimer les fichiers obsolètes après confirmation

**Mécanisme** :
1. Sélection des fichiers à supprimer (cases à cocher)
2. Confirmation explicite avec :
   - Nombre de fichiers sélectionnés
   - Espace disque à libérer
   - Avertissement de non-réversibilité
3. Suppression via `File.Delete()` (Windows)
4. Création d'un log d'audit pour chaque fichier supprimé
5. Rapport de suppression (fichiers supprimés, erreurs)

**Sécurité** :
- Protection Path Traversal (validation des chemins)
- Validation de l'existence du fichier avant suppression
- Log d'audit avec :
  - Utilisateur ayant effectué la suppression
  - Date et heure
  - Chemin du fichier
  - Raison de suppression (rétention expirée)

**Note** : Pas de corbeille - suppression définitive

### 5. RAPPORTS ET EXPORTS

#### 5.1 Formats de rapport

**CSV (Comma-Separated Values)**
- **Usage** : Import dans Excel, traitement automatisé
- **Contenu** :
  - En-tête : Statistiques globales (commentaires #)
  - Corps : Fichier, Type PII, Valeur, Ligne
- **Encodage** : UTF-8 avec BOM
- **Séparateur** : Point-virgule (;) - compatible Excel français

**JSON (JavaScript Object Notation)**
- **Usage** : Intégration API, traitement programmatique
- **Structure** :
  ```json
  {
    "metadata": { "scanId", "directory", "scanDate", "totalFiles" },
    "statistics": { "totalPiiDetected", "riskyFilesCount", "percentages" },
    "detections": [
      { "file", "piiType", "value", "lineNumber", "riskLevel" }
    ]
  }
  ```
- **Encodage** : UTF-8
- **Indentation** : 2 espaces

**HTML (Responsive Report)**
- **Usage** : Consultation visuelle, partage avec non-techniciens
- **Contenu** :
  - En-tête avec logo et titre
  - Statistiques en blocs colorés
  - Graphiques (Chart.js embarqué)
  - Tableau interactif des détections
  - Footer avec date de génération
- **Style** : CSS inline (autonome)
- **Compatibilité** : Tous navigateurs modernes

**Excel (.xlsx)**
- **Usage** : Analyse avancée, présentation professionnelle
- **Structure** : 3 onglets
  1. **Statistiques** : Vue d'ensemble avec métriques
  2. **Fichiers à risque** : Top fichiers classés par score
  3. **Détections** : Liste complète avec auto-filtres
- **Formatage** :
  - En-têtes en gras
  - Couleurs par niveau de risque
  - Largeur de colonnes auto-ajustée
  - Filtres activés
- **Bibliothèque** : EPPlus

#### 5.2 Tableau de bord analytique

**Page Reports & Analytics** : Visualisations interactives

**Vues disponibles** :

**1. Vue d'ensemble (Overview)**
- Donut chart : Répartition des PII par type
- Donut chart : Répartition des fichiers par niveau de risque
- KPIs : Total fichiers, PII détectées, fichiers à risque, taux de risque

**2. Vue détaillée (Detailed)**
- Treemap : Visualisation hiérarchique des fichiers à risque
- Graphique à barres : Top 10 types PII les plus fréquents
- Graphique à barres : Top 10 fichiers avec le plus de PII

**3. Vue comparative (Comparison)**
- Radar chart : Profil de risque multidimensionnel
- Liste des fichiers critiques avec détails

**Interactivité** :
- Tooltips au survol
- Filtres par type PII, niveau de risque, ancienneté
- Export des graphiques en PNG
- Actualisation en temps réel pendant le scan

### 6. AUTHENTIFICATION ET AUTORISATION

#### 6.1 Système d'authentification JWT

**Méthode** : JSON Web Tokens (JWT) avec refresh tokens

**Processus de connexion** :
1. Utilisateur saisit **username** et **password**
2. API valide les credentials (hash BCrypt)
3. Génération de 2 tokens :
   - **Access Token** : JWT signé, durée 7 jours
   - **Refresh Token** : UUID v4, durée 30 jours
4. Stockage :
   - Access Token : `localStorage` + Axios interceptor
   - Refresh Token : Base de données + `localStorage`
   - User data : `localStorage` (nom, rôle)

**Contenu du JWT (Access Token)** :
```json
{
  "sub": "userId",
  "unique_name": "username",
  "email": "user@example.com",
  "role": "Admin" | "User",
  "iat": 1234567890,
  "exp": 1234567890
}
```

**Refresh Token Flow** :
1. Access Token expire (7 jours)
2. Axios interceptor détecte erreur 401
3. Appel automatique à `/api/auth/refresh` avec Refresh Token
4. Validation du Refresh Token en base
5. Génération d'un nouveau Access Token
6. Retry de la requête originale

**Révocation** :
- Logout : Suppression du Refresh Token en base
- Changement de mot de passe : Révocation de tous les Refresh Tokens de l'utilisateur

#### 6.2 Rôles et permissions (RBAC)

**Rôles** : 2 niveaux hiérarchiques

**1. Administrateur (Admin)**
- **Permissions** :
  - ✅ Toutes les fonctionnalités Utilisateur standard
  - ✅ Gestion des utilisateurs (CRUD)
  - ✅ Gestion de la base de données (backup, restore, optimize)
  - ✅ Consultation du journal d'audit complet
  - ✅ Configuration globale de l'application
  - ✅ Voir les scans de tous les utilisateurs
  - ✅ Modifier/supprimer les scans de tous les utilisateurs

**2. Utilisateur standard (User)**
- **Permissions** :
  - ✅ Lancer des scans manuels
  - ✅ Créer/modifier/supprimer ses propres scans planifiés
  - ✅ Consulter l'historique de ses propres scans
  - ✅ Télécharger les rapports de ses scans
  - ✅ Gérer la rétention des données (scan et suppression)
  - ✅ Consulter son profil utilisateur
  - ✅ Modifier son mot de passe
  - ❌ Voir les scans des autres utilisateurs
  - ❌ Accéder à la gestion utilisateurs
  - ❌ Accéder à la gestion base de données
  - ❌ Voir le journal d'audit complet

**Matrice de permissions** :

| Fonctionnalité | Admin | User |
|---------------|-------|------|
| Scanner un répertoire | ✅ | ✅ |
| Scans planifiés (CRUD) | ✅ (tous) | ✅ (siens uniquement) |
| Historique des scans | ✅ (tous) | ✅ (siens uniquement) |
| Télécharger rapports | ✅ | ✅ |
| Rétention des données | ✅ | ✅ |
| Gestion utilisateurs | ✅ | ❌ |
| Backup/Restore BDD | ✅ | ❌ |
| Journal d'audit | ✅ (complet) | ❌ |
| Mon profil | ✅ | ✅ |
| Support & FAQ | ✅ | ✅ |

**Implémentation** :
- Attribut `[Authorize(Roles = "Admin")]` sur les controllers .NET
- Composant `<ProtectedRoute requireAdmin>` en React
- Vérification côté serveur (sécurité) ET côté client (UX)

#### 6.3 Configuration initiale (First-Run Setup)

**Objectif** : Créer le premier compte administrateur de manière sécurisée

**Processus** :
1. Au premier lancement, l'application vérifie si un utilisateur existe
2. Si aucun utilisateur : affichage de la page **InitialSetup**
3. L'utilisateur crée le compte admin avec :
   - **Username** : Nom d'utilisateur (min 3 caractères)
   - **Email** : Adresse email valide
   - **FullName** : Nom complet
   - **Password** : Mot de passe fort (8+ caractères)
     - Au moins 1 majuscule
     - Au moins 1 minuscule
     - Au moins 1 chiffre
     - Au moins 1 caractère spécial
   - **Confirm Password** : Confirmation du mot de passe
4. Validation côté client et serveur
5. Création du compte avec :
   - Rôle : Admin (automatique)
   - PasswordHash : BCrypt avec salt automatique
   - CreatedAt : Date de création
6. Redirection vers la page de login

**Sécurité** :
- ❌ **Pas de compte par défaut** (admin/admin, etc.)
- ✅ Mot de passe fort obligatoire
- ✅ Hash BCrypt avec salt (pas de stockage en clair)
- ✅ Validation des entrées (protection XSS)
- ✅ Endpoint `/api/initialization/setup` appelable une seule fois (si aucun user existe)

### 7. SÉCURITÉ

#### 7.1 Protection CSRF (Cross-Site Request Forgery)

**Méthode** : Header-based CSRF tokens

**Mécanisme** :
1. **Backend** : Génération d'un token cryptographique (32 bytes, Base64) sur chaque requête GET
2. **Transmission** : Token envoyé dans le header `X-CSRF-Token` de la réponse
3. **Frontend** : Capture du token et stockage en mémoire (pas de cookies)
4. **Validation** : Ajout du token dans le header `X-CSRF-Token` pour POST/PUT/DELETE/PATCH
5. **Vérification** : Middleware valide la présence et le format du token (longueur >= 40)

**Configuration CORS** :
- `.WithExposedHeaders("X-CSRF-Token")` pour permettre la lecture JavaScript

**Endpoints protégés** :
- `/api/users` (création, modification, suppression utilisateurs)
- `/api/scheduledscans` (CRUD scans planifiés)
- `/api/database/backup`, `/api/database/restore`, `/api/database/optimize`
- `/api/dataretention/delete` (suppression fichiers)
- `/api/auth/change-password` (changement mot de passe)

**Endpoints exclus** (pas de CSRF) :
- `/api/auth/login` (pas encore de token)
- `/api/auth/refresh` (utilise refresh token)
- `/api/initialization/*` (première configuration)

**Logs** :
- Tentatives CSRF détectées loguées avec IP et chemin
- Réponse HTTP 403 avec message explicite

#### 7.2 Rate Limiting

**Objectif** : Prévenir les attaques brute force et les abus

**Limites configurées** :

| Endpoint | Limite | Fenêtre | Identifiant |
|----------|--------|---------|-------------|
| `/api/auth/login` | 5 tentatives | 15 minutes | IP + Username |
| Endpoints sensibles | 20 requêtes | 5 minutes | IP |
| API générale | 100 requêtes | 1 minute | IP |

**Endpoints sensibles** :
- `/api/users/*` (CRUD utilisateurs)
- `/api/database/*` (backup, restore, optimize)
- `/api/dataretention/delete` (suppression fichiers)
- `/api/scheduledscans` (POST/PUT/DELETE)

**Réponse en cas de dépassement** :
- HTTP 429 Too Many Requests
- Headers :
  - `X-RateLimit-Limit` : Limite maximale
  - `X-RateLimit-Remaining` : Tentatives restantes
  - `X-RateLimit-Reset` : Timestamp de réinitialisation
  - `Retry-After` : Secondes avant retry autorisé
- Body JSON :
  ```json
  {
    "error": "Trop de tentatives",
    "message": "Vous avez dépassé la limite de requêtes. Réessayez dans X secondes.",
    "retryAfter": 900
  }
  ```

**Implémentation** :
- Middleware custom `RateLimitingMiddleware`
- Stockage en mémoire avec `ConcurrentDictionary`
- Nettoyage automatique des entrées expirées

#### 7.3 Protection Path Traversal

**Objectif** : Empêcher l'accès aux fichiers système via des chemins malveillants

**Méthode** : Classe utilitaire `PathValidator`

**Validations** :
1. **Rejet des séquences de traversal** :
   - `..` (remontée de répertoire)
   - `/` (séparateur Unix)
   - `\` (séparateur Windows)
2. **Rejet des noms réservés Windows** :
   - CON, PRN, AUX, NUL
   - COM1-COM9, LPT1-LPT9
3. **Rejet des chemins système** :
   - `C:\Windows`, `C:\Program Files`, `C:\System`
   - `/etc`, `/usr`, `/var`, `/bin` (Linux)
4. **Résolution absolue** : Utilisation de `Path.GetFullPath()`
5. **Vérification de confinement** : Le chemin résolu doit rester dans le répertoire autorisé

**Endpoints protégés** :
- `POST /api/scan/start` (répertoire de scan)
- `POST /api/scheduledscans` (répertoire de scan planifié)
- `PUT /api/scheduledscans/{id}` (modification répertoire)
- `POST /api/dataretention/scan` (répertoire de rétention)
- `POST /api/dataretention/delete` (chemins de fichiers à supprimer)
- `GET /api/database/backup/download/{fileName}` (nom de fichier de backup)
- `DELETE /api/database/backup/{fileName}` (suppression backup)

**Exemple de code** :
```csharp
public static bool ValidateDirectoryPath(string path, out string sanitizedPath)
{
    if (path.Contains("..") || path.Contains("/") || path.Contains("\\"))
    {
        sanitizedPath = null;
        return false;
    }

    sanitizedPath = Path.GetFullPath(path);
    return !IsSystemDirectory(sanitizedPath);
}
```

**Logs** :
- Toute tentative de Path Traversal est loguée avec :
  - IP source
  - Chemin malveillant tenté
  - Endpoint ciblé
  - Date et heure

#### 7.4 Chiffrement de la base de données

**Technologie** : SQLCipher (extension de SQLite)

**Configuration** :
- Algorithme : AES-256
- Clé : 256 bits générée aléatoirement
- Stockage de la clé : Fichier `db_encryption.key` (permissions restrictives)
- Base de données : `piiscanner.db` (chiffrée au repos)

**Implémentation** :
```csharp
// Initialisation SQLCipher
SQLitePCL.Batteries_V2.Init();
SQLitePCL.raw.SetProvider(new SQLitePCL.SQLite3Provider_e_sqlcipher());

// Connection string avec clé de chiffrement
var connectionString = $"Data Source=piiscanner.db;Password={encryptionKey}";
```

**Service de chiffrement** : `DatabaseEncryptionService`
- Génération de la clé si inexistante
- Lecture sécurisée de la clé
- Ajout du mot de passe à la connection string
- Logs de chiffrement (sans exposer la clé)

**Sécurité** :
- Clé jamais exposée dans les logs
- Fichier `db_encryption.key` exclu du contrôle de version (.gitignore)
- Permissions Windows restrictives sur le fichier de clé
- Base de données chiffrée même si le disque est volé

#### 7.5 Autres protections

**Headers de sécurité HTTP** :
- `X-Content-Type-Options: nosniff` : Empêche le MIME sniffing
- `X-Frame-Options: DENY` : Protection clickjacking
- `X-XSS-Protection: 1; mode=block` : Activation protection XSS navigateur
- `Permissions-Policy: geolocation=(), microphone=(), camera=()` : Désactivation fonctionnalités dangereuses
- `Strict-Transport-Security: max-age=31536000; includeSubDomains` : Force HTTPS (HSTS)

**Protection SQL Injection** :
- Entity Framework Core avec requêtes paramétrées
- Pas de concaténation de strings SQL
- LINQ uniquement

**Hashage des mots de passe** :
- Algorithme : BCrypt
- Salt : Généré automatiquement par BCrypt
- Work factor : 12 rounds (compromis sécurité/performance)
- Pas de stockage en clair, jamais

**HTTPS/TLS** :
- TLS 1.2+ uniquement
- Certificat auto-signé en développement (`dotnet dev-certs https --trust`)
- Let's Encrypt recommandé en production
- Redirection automatique HTTP → HTTPS

**Journal d'audit** :
- Toutes les opérations sensibles loguées dans `AuditLogs`
- Champs : UserId, Action, EntityType, EntityId, IpAddress, Details, CreatedAt
- Consultation réservée aux Admins
- Rétention illimitée (pas de suppression automatique)

### 8. ARCHITECTURE TECHNIQUE

#### 8.1 Stack technologique

**Backend (.NET)**
- Framework : .NET 8.0
- API : ASP.NET Core Web API
- Temps réel : SignalR
- ORM : Entity Framework Core
- Base de données : SQLite + SQLCipher (chiffrement AES-256)
- Documentation API : Swagger/OpenAPI (développement uniquement)

**Frontend (Electron + React)**
- Runtime : Electron 39
- Framework UI : React 19
- Langage : TypeScript 5.9
- Bibliothèque UI : Material-UI (MUI) v7
- Graphiques : Recharts
- HTTP Client : Axios
- Bundler : Vite
- Routing : React Router v6

**Bibliothèques clés**
- DocumentFormat.OpenXml : Lecture Word/Excel
- PdfPig : Extraction de texte PDF
- EPPlus : Génération de fichiers Excel
- BCrypt.Net : Hashage de mots de passe
- System.IdentityModel.Tokens.Jwt : Génération JWT

#### 8.2 Architecture logicielle

**Pattern** : Architecture en couches (N-Tier)

```
┌─────────────────────────────────────┐
│   Presentation Layer (UI)           │
│   - React Components                │
│   - Material-UI                     │
│   - Electron Window                 │
└────────────┬────────────────────────┘
             │ HTTPS / WebSocket (SignalR)
┌────────────▼────────────────────────┐
│   API Layer (Controllers)           │
│   - ScanController                  │
│   - AuthController                  │
│   - UsersController                 │
│   - ScheduledScansController        │
└────────────┬────────────────────────┘
             │
┌────────────▼────────────────────────┐
│   Business Logic Layer (Services)   │
│   - ScanService                     │
│   - AuthService                     │
│   - SchedulerService                │
│   - BackgroundSchedulerService      │
└────────────┬────────────────────────┘
             │
┌────────────▼────────────────────────┐
│   Data Access Layer (Repositories)  │
│   - AppDbContext (EF Core)          │
│   - Entities: User, Session, etc.   │
└────────────┬────────────────────────┘
             │
┌────────────▼────────────────────────┐
│   Database (SQLite + SQLCipher)     │
│   - Tables: Users, Sessions,        │
│     ScheduledScans, AuditLogs, etc. │
└─────────────────────────────────────┘

┌─────────────────────────────────────┐
│   Core Library (PiiScanner.Core)   │
│   - PiiDetector (19 types)          │
│   - FileScanner (parallel)          │
│   - DocumentReader (PDF, Word, etc.)│
│   - ReportGenerator (CSV, JSON...)  │
└─────────────────────────────────────┘
```

**Séparation des responsabilités** :

**PiiScanner.Core** : Logique métier pure
- Détection de PII (regex + validation)
- Lecture de documents
- Génération de rapports
- Aucune dépendance sur l'API ou l'UI

**PiiScanner.Api** : Couche service REST
- Exposition des endpoints HTTP
- Authentification et autorisation
- Gestion des scans en arrière-plan
- SignalR pour temps réel
- Middleware de sécurité (CSRF, Rate Limiting)

**pii-scanner-ui** : Interface utilisateur
- Composants React réutilisables
- Gestion de l'état (Context API)
- Appels API via Axios
- Affichage des résultats avec graphiques
- Intégration Electron (desktop)

#### 8.3 Base de données

**Modèle relationnel** : SQLite chiffré

**Tables** :

**Users**
- Id : int (PK, auto-increment)
- Username : nvarchar(50) (unique)
- Email : nvarchar(100)
- FullName : nvarchar(100)
- PasswordHash : nvarchar(255)
- Role : nvarchar(20) - "Admin" ou "User"
- CreatedAt : datetime
- LastLogin : datetime (nullable)

**Sessions** (Refresh Tokens)
- Id : int (PK, auto-increment)
- UserId : int (FK → Users)
- RefreshToken : nvarchar(255) (unique)
- ExpiresAt : datetime
- CreatedAt : datetime
- IsRevoked : bit (0 ou 1)

**ScheduledScans**
- Id : int (PK, auto-increment)
- UserId : int (FK → Users)
- Name : nvarchar(100)
- DirectoryPath : nvarchar(500)
- Frequency : nvarchar(20) - "Daily", "Weekly", "Monthly", "Quarterly"
- DayOfWeek : int (0-6, nullable)
- DayOfMonth : int (1-28, nullable)
- HourOfDay : int (0-23)
- IsActive : bit (0 ou 1)
- NextRunAt : datetime
- LastRunAt : datetime (nullable)
- LastScanId : nvarchar(50) (nullable)
- NotifyOnCompletion : bit (0 ou 1)
- NotifyOnNewPii : bit (0 ou 1)
- CreatedAt : datetime
- UpdatedAt : datetime

**AuditLogs**
- Id : int (PK, auto-increment)
- UserId : int (FK → Users, nullable)
- Action : nvarchar(50) - "Login", "Logout", "CreateUser", "DeleteUser", etc.
- EntityType : nvarchar(50) - "User", "ScheduledScan", "Database", etc.
- EntityId : nvarchar(50) (nullable)
- IpAddress : nvarchar(45)
- Details : nvarchar(500) (nullable)
- CreatedAt : datetime

**DataRetentionPolicies**
- Id : int (PK, auto-increment)
- Category : nvarchar(50) - "Banking", "Identity", "Health", "Education", "Contact"
- RetentionYears : int (1-10)
- UpdatedAt : datetime

**Indexes** :
- Users(Username) - unique
- Sessions(RefreshToken) - unique
- Sessions(UserId, IsRevoked) - performance
- ScheduledScans(UserId) - performance
- ScheduledScans(NextRunAt, IsActive) - scheduler
- AuditLogs(UserId, CreatedAt) - consultation
- AuditLogs(Action, CreatedAt) - recherche

#### 8.4 API REST

**Base URL** :
- HTTP : `http://localhost:5000/api`
- HTTPS : `https://localhost:5001/api`

**Endpoints** :

**Authentification**
- `POST /auth/login` - Connexion (retourne JWT + Refresh Token)
- `POST /auth/refresh` - Renouveler l'Access Token
- `POST /auth/logout` - Déconnexion (révoque Refresh Token)
- `GET /auth/me` - Informations utilisateur connecté
- `POST /auth/change-password` - Changer son mot de passe

**Initialisation**
- `GET /initialization/status` - Vérifier si l'app est initialisée
- `POST /initialization/setup` - Créer le premier compte admin

**Scans**
- `POST /scan/start` - Lancer un scan manuel
- `GET /scan/{scanId}/progress` - Obtenir la progression
- `GET /scan/{scanId}/results` - Obtenir les résultats
- `GET /scan/{scanId}/report/{format}` - Télécharger un rapport (csv, json, html, excel)
- `DELETE /scan/{scanId}` - Nettoyer les ressources d'un scan

**Scans planifiés**
- `GET /scheduledscans` - Liste des scans planifiés (filtrés par utilisateur)
- `POST /scheduledscans` - Créer un scan planifié
- `GET /scheduledscans/{id}` - Détails d'un scan planifié
- `PUT /scheduledscans/{id}` - Modifier un scan planifié
- `DELETE /scheduledscans/{id}` - Supprimer un scan planifié
- `PATCH /scheduledscans/{id}/toggle` - Activer/désactiver

**Rétention des données**
- `GET /dataretention/policies` - Liste des politiques de rétention
- `PUT /dataretention/policies` - Modifier les politiques
- `POST /dataretention/scan` - Scanner pour fichiers obsolètes
- `POST /dataretention/delete` - Supprimer des fichiers

**Utilisateurs** (Admin uniquement)
- `GET /users` - Liste des utilisateurs
- `POST /users` - Créer un utilisateur
- `GET /users/{id}` - Détails d'un utilisateur
- `PUT /users/{id}` - Modifier un utilisateur
- `DELETE /users/{id}` - Supprimer un utilisateur

**Base de données** (Admin uniquement)
- `POST /database/backup` - Créer une sauvegarde
- `GET /database/backups` - Liste des sauvegardes
- `POST /database/restore` - Restaurer une sauvegarde
- `DELETE /database/backup/{fileName}` - Supprimer une sauvegarde
- `POST /database/optimize` - Optimiser la base de données (VACUUM)
- `POST /database/cleanup` - Nettoyer les anciennes données

**Journal d'audit** (Admin uniquement)
- `GET /audit` - Liste des logs d'audit (pagination, filtres)
- `GET /audit/{id}` - Détails d'un log d'audit

**SignalR Hub** :
- `/scanhub` - Hub SignalR pour mises à jour temps réel
- Événements :
  - `ReceiveProgress` : Progression du scan (scanId, current, total)
  - `ScanComplete` : Scan terminé (scanId)
  - `ScanError` : Erreur de scan (scanId, errorMessage)

**Authentification des endpoints** :
- Publics (aucune auth) : `/initialization/*`, `POST /auth/login`, `POST /auth/refresh`
- Authentifiés : Tous les autres endpoints (JWT requis)
- Admin uniquement : `/users/*`, `/database/*`, `/audit/*`

**CORS** :
- Origines autorisées : `http://localhost:*`, `https://localhost:*`
- Méthodes : GET, POST, PUT, DELETE, PATCH
- Headers : Authorization, Content-Type, X-CSRF-Token
- Credentials : Autorisés

#### 8.5 Interface utilisateur

**Structure de navigation** : Sidebar + Router

**Pages** : 16 pages spécialisées

**Pages publiques** (sans authentification) :
1. **Initial Setup** : Création du compte admin
2. **Login** : Connexion utilisateur

**Pages authentifiées** (User + Admin) :
3. **Dashboard** : Vue d'ensemble avec KPIs et graphiques
4. **Scanner** : Lancement de scan manuel
5. **Historique** : Liste des scans effectués
6. **Scans planifiés** : Gestion des scans automatiques
7. **Fichiers à risque** : Top 20 fichiers critiques
8. **Données sensibles** : Liste détaillée des PII détectées
9. **Ancienneté** : Analyse Stale Data
10. **Exposition** : Analyse Over-Exposed Data
11. **Rapports & Analytics** : Visualisations avancées (3 vues)
12. **Exports** : Téléchargement des rapports
13. **Rétention des données** : Gestion des politiques et suppression
14. **Mon Profil** : Informations personnelles et changement de mot de passe
15. **Support** : FAQ, contact, documentation
16. **À propos** : Informations sur l'application

**Pages Admin uniquement** :
17. **Utilisateurs** : Gestion des comptes utilisateurs
18. **Base de données** : Sauvegardes et restauration
19. **Journal d'audit** : Traçabilité des opérations

**Thème** : Material-UI v7 Dark Theme
- Couleur primaire : #667eea (violet)
- Couleur secondaire : #764ba2 (violet foncé)
- Typographie : Plus Jakarta Sans
- Mode : Dark (fond sombre)

**Composants réutilisables** :
- `ProtectedRoute` : Restriction d'accès par rôle
- `MainLayout` : Structure avec sidebar et topbar
- `Sidebar` : Navigation principale avec icônes
- `StatCard` : Carte de statistique avec icône
- `RiskBadge` : Badge coloré pour niveau de risque
- `FileTable` : Tableau de fichiers avec tri et filtres

### 9. PERFORMANCE

#### 9.1 Optimisations backend

**Traitement parallèle** :
- `Parallel.ForEach` pour le scan de fichiers
- `MaxDegreeOfParallelism` : Nombre de cœurs CPU
- Thread-safe avec `ConcurrentBag<ScanResult>`

**Gestion mémoire** :
- Traitement par fichier (pas de chargement complet en mémoire)
- Libération immédiate après analyse
- Pas de cache des résultats (génération à la demande)

**Temps réel** :
- SignalR pour mises à jour sans polling
- WebSocket pour performances optimales
- Événements uniquement quand nécessaire (pas de flood)

**Base de données** :
- Indexes sur les colonnes de recherche
- Requêtes paramétrées (pas de compilation répétée)
- Connection pooling automatique (EF Core)
- VACUUM périodique pour optimisation

#### 9.2 Optimisations frontend

**Code splitting** :
- Lazy loading des pages avec `React.lazy()`
- Routes chargées à la demande
- Réduction du bundle initial

**Memoization** :
- `React.memo()` pour composants purs
- `useMemo()` pour calculs coûteux
- `useCallback()` pour callbacks

**Virtualisation** :
- Listes longues avec `react-window` (si > 1000 items)
- Rendu uniquement des éléments visibles

**Caching** :
- Cache Axios pour requêtes GET répétées
- LocalStorage pour token et user data
- Pas de re-fetch inutile

---

## 📝 SPÉCIFICATIONS NON FONCTIONNELLES

### 1. Performance

| Critère | Objectif |
|---------|----------|
| **Temps de scan** | < 5 secondes pour 1000 fichiers (moyenne) |
| **Utilisation CPU** | 80-100% pendant le scan (max performance) |
| **Utilisation RAM** | < 500 MB pour 10 000 fichiers |
| **Temps de démarrage** | < 5 secondes (Electron + API) |
| **Latence SignalR** | < 100 ms (mise à jour temps réel) |
| **Génération rapport** | < 3 secondes pour 10 000 détections |

### 2. Sécurité

| Critère | Exigence |
|---------|----------|
| **Chiffrement DB** | AES-256 (SQLCipher) |
| **Hash mot de passe** | BCrypt (12 rounds) |
| **TLS** | TLS 1.2+ uniquement |
| **JWT** | Signature HMAC-SHA256 |
| **Logs sensibles** | Jamais de mots de passe ou clés |
| **Protection CSRF** | Header-based tokens |
| **Rate Limiting** | 5 login/15min, 20 ops sensibles/5min |

### 3. Disponibilité

| Critère | Objectif |
|---------|----------|
| **Disponibilité API** | 99.9% (en production) |
| **Temps de récupération** | < 1 minute (redémarrage API) |
| **Sauvegarde auto** | Base de données non sauvegardée auto (manuel) |
| **Durée de session** | 7 jours (Access Token), 30 jours (Refresh Token) |

### 4. Compatibilité

| Critère | Exigence |
|---------|----------|
| **OS** | Windows 10/11 (64-bit) |
| **Navigateurs** | Chrome 100+, Edge 100+ (pour UI web) |
| **.NET Runtime** | .NET 8.0+ requis |
| **Node.js** | 18+ (développement uniquement) |
| **Formats fichiers** | .docx, .xlsx, .pdf, .txt, .log, .csv, .json |

### 5. Maintenabilité

| Critère | Exigence |
|---------|----------|
| **Code** | TypeScript strict, C# 12 |
| **Documentation** | Commentaires XML C#, JSDoc TypeScript |
| **Tests** | Couverture 80%+ (à implémenter) |
| **Logs** | Niveaux Debug, Info, Warning, Error |
| **Versioning** | Semantic Versioning (SemVer) |

### 6. Scalabilité

| Critère | Limite |
|---------|--------|
| **Fichiers par scan** | 100 000 max recommandé |
| **Utilisateurs** | 50 max (base de données SQLite) |
| **Scans planifiés** | 100 max par utilisateur |
| **Taille fichier** | 100 MB max par fichier |
| **Taille base de données** | 10 GB max (SQLite) |

---

## 🚀 DÉPLOIEMENT

### 1. Environnement de développement

**Prérequis** :
- Visual Studio 2022 ou VS Code
- .NET 8.0 SDK
- Node.js 18+ et npm
- Git

**Installation** :
```bash
# 1. Cloner le projet
git clone <repository-url>
cd PII-Scanner

# 2. Restaurer les dépendances .NET
dotnet restore PiiScanner.sln

# 3. Compiler le backend
dotnet build PiiScanner.sln -c Debug

# 4. Installer les dépendances npm
cd pii-scanner-ui
npm install

# 5. Lancer l'API (terminal 1)
cd ../PiiScanner.Api
dotnet run

# 6. Lancer l'UI (terminal 2)
cd ../pii-scanner-ui
npm run electron:dev
```

**Configuration** :
- Base de données : Créée automatiquement au premier lancement
- Certificat HTTPS : `dotnet dev-certs https --trust`
- Variables d'environnement : Configurées dans `appsettings.Development.json`

### 2. Environnement de production

**Build backend** :
```bash
cd PiiScanner.Api
dotnet publish -c Release -o bin/Release/net8.0/publish
```

**Build frontend** :
```bash
cd pii-scanner-ui
npm run build
npm run electron:build:win
```

**Artefacts** :
- API : `PiiScanner.Api/bin/Release/net8.0/publish/`
- Electron : `pii-scanner-ui/release/` (installateur NSIS)

**Configuration production** :
- `appsettings.Production.json` :
  - Modifier `Jwt:Secret` (256 bits aléatoires)
  - Configurer `Jwt:Issuer` et `Jwt:Audience`
  - Activer HTTPS uniquement
- Certificat TLS : Let's Encrypt ou certificat d'entreprise
- CORS : Restreindre aux origines de production

**Déploiement** :
1. Installer .NET 8.0 Runtime sur le serveur
2. Copier les fichiers publiés
3. Configurer un service Windows (nssm ou sc.exe)
4. Configurer le pare-feu (ports 5000/5001)
5. Distribuer l'installateur Electron aux utilisateurs

### 3. Environnement de test

**Tests unitaires** (à implémenter) :
```bash
dotnet test PiiScanner.Tests
```

**Tests d'intégration** :
- Postman collection pour API
- Selenium pour UI (à implémenter)

**Tests de sécurité** :
- OWASP ZAP pour scan de vulnérabilités
- Burp Suite pour tests manuels
- Snyk pour dépendances

---

## 📅 PLANNING ET PHASES

### Phase 1 : MVP (Terminée)
- ✅ Détection de 19 types de PII
- ✅ Scan manuel avec rapports (CSV, JSON, HTML, Excel)
- ✅ Interface Electron avec 16 pages
- ✅ Authentification JWT
- ✅ Scans planifiés
- ✅ Rétention des données
- ✅ Analyse ancienneté et exposition
- ✅ Sécurité (CSRF, Rate Limiting, Path Traversal, etc.)

### Phase 2 : Améliorations (En cours)
- 🔄 Tests unitaires et d'intégration
- 🔄 Documentation utilisateur complète
- 🔄 Tutoriels vidéo
- 🔄 Mode multi-tenancy (plusieurs organisations)
- 🔄 Notifications par email (SMTP)
- 🔄 Export PDF des rapports

### Phase 3 : Évolutions (À planifier)
- 📋 Support Linux et macOS
- 📋 API publique pour intégrations tierces
- 📋 Détection de PII supplémentaires (autres pays africains)
- 📋 Machine Learning pour réduction des faux positifs
- 📋 Anonymisation automatique des données
- 📋 Intégration avec outils DLP (Data Loss Prevention)

---

## 📞 SUPPORT ET MAINTENANCE

### 1. Support utilisateur

**Canaux** :
- Page Support intégrée (formulaire de contact)
- Email : support@cyberprevs.com
- FAQ interactive dans l'application
- Documentation en ligne (GitHub Wiki)

**Niveaux de support** :
- **Tier 1** : FAQ et documentation
- **Tier 2** : Email (réponse sous 48h)
- **Tier 3** : Support technique (entreprises)

### 2. Maintenance

**Maintenance corrective** :
- Correction de bugs : Délai 1 semaine (selon gravité)
- Mise à jour de sécurité : Délai 24h (critique)

**Maintenance évolutive** :
- Nouvelles fonctionnalités : Roadmap trimestrielle
- Amélioration UX : Feedback utilisateurs

**Maintenance préventive** :
- Monitoring des logs d'erreur
- Vérification des sauvegardes
- Mise à jour des dépendances (mensuel)

### 3. Mises à jour

**Versioning** : Semantic Versioning (SemVer)
- MAJOR : Changements incompatibles (ex: 1.0.0 → 2.0.0)
- MINOR : Nouvelles fonctionnalités compatibles (ex: 1.0.0 → 1.1.0)
- PATCH : Corrections de bugs (ex: 1.0.0 → 1.0.1)

**Distribution** :
- Auto-update Electron (à implémenter)
- Téléchargement manuel sur GitHub Releases
- Notification dans l'application (nouvelle version disponible)

---

## 📊 MÉTRIQUES DE SUCCÈS

### 1. Adoption

| Métrique | Objectif (6 mois) |
|----------|-------------------|
| Nombre d'utilisateurs | 100+ |
| Nombre d'organisations | 20+ |
| Scans effectués | 1000+ |
| Fichiers analysés | 1 000 000+ |

### 2. Qualité

| Métrique | Objectif |
|----------|----------|
| Taux de faux positifs | < 5% |
| Satisfaction utilisateur | 4.5/5 |
| Bugs critiques | 0 |
| Temps de réponse support | < 48h |

### 3. Conformité

| Métrique | Objectif |
|----------|----------|
| Organisations conformes APDP | 80%+ (grâce à l'app) |
| Audits réussis | 95%+ |
| Pénalités évitées | 100% |

---

## 🔗 RÉFÉRENCES

### 1. Légales

- **Loi N°2017-20** : Code du Numérique en République du Bénin
- **APDP** : Autorité de Protection des Données Personnelles du Bénin
  - Site web : https://apdp.bj
  - Email : contact@apdp.bj

### 2. Techniques

- **ASP.NET Core** : https://learn.microsoft.com/aspnet/core
- **Entity Framework Core** : https://learn.microsoft.com/ef/core
- **React** : https://react.dev
- **Material-UI** : https://mui.com
- **Electron** : https://electronjs.org
- **SQLCipher** : https://www.zetetic.net/sqlcipher

### 3. Sécurité

- **OWASP Top 10** : https://owasp.org/Top10
- **OWASP ASVS** : https://owasp.org/www-project-application-security-verification-standard
- **NIST Cybersecurity Framework** : https://www.nist.gov/cyberframework

---

## 📄 ANNEXES

### Annexe A : Glossaire

| Terme | Définition |
|-------|------------|
| **PII** | Personally Identifiable Information (Données Personnelles Identifiables) |
| **APDP** | Autorité de Protection des Données Personnelles (Bénin) |
| **RGPD** | Règlement Général sur la Protection des Données (Europe) |
| **DPO** | Data Protection Officer (Délégué à la Protection des Données) |
| **CSRF** | Cross-Site Request Forgery (Falsification de requête inter-sites) |
| **JWT** | JSON Web Token (Token d'authentification) |
| **RBAC** | Role-Based Access Control (Contrôle d'accès basé sur les rôles) |
| **NTFS** | New Technology File System (Système de fichiers Windows) |
| **ACL** | Access Control List (Liste de contrôle d'accès) |
| **SQLCipher** | Extension de SQLite avec chiffrement AES-256 |

### Annexe B : Mapping APDP

| Obligation APDP | Fonctionnalité PII Scanner |
|----------------|---------------------------|
| Identifier les données personnelles | Scan de répertoires et détection de 19 types PII |
| Limiter la collecte | Pas de collecte - analyse uniquement |
| Durées de conservation | Politiques de rétention configurables (5 catégories) |
| Sécurité des données | Chiffrement AES-256, authentification JWT, CSRF, Rate Limiting |
| Registre des traitements | Journal d'audit complet avec traçabilité |
| Droits des personnes | Suppression sécurisée des fichiers obsolètes |
| Notification violations | Détection des fichiers sur-exposés (analyse ACL) |

### Annexe C : Checklist de conformité

**Pour les organisations utilisant PII Scanner** :

- [x] Identifier toutes les données personnelles détenues
- [x] Documenter les types de PII (19 types détectés)
- [x] Vérifier les durées de conservation (politiques configurables)
- [x] Supprimer les données obsolètes (fonction de suppression sécurisée)
- [x] Sécuriser les accès aux données (analyse des permissions NTFS)
- [x] Tracer les opérations sensibles (journal d'audit)
- [x] Limiter l'accès aux données (RBAC Admin/User)
- [x] Protéger contre les fuites (détection fichiers sur-exposés)
- [x] Auditer régulièrement (scans planifiés automatiques)
- [x] Générer des rapports de conformité (4 formats de rapport)

---

**FIN DU CAHIER DES CHARGES**

---

**Date de rédaction** : Décembre 2024
**Version** : 1.0
**Auteur** : Cyberprevs
**Statut** : Validé
