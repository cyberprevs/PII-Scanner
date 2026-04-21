# Prompt — Génération du dossier APDP pour PII Scanner v2.0

Copie tout ce qui suit (à partir de "Tu es expert") et colle-le dans Claude.ai ou ChatGPT.

---

Tu es expert en conformité RGPD/APDP (Autorité de Protection des Données
à caractère Personnel du Bénin, Loi N°2017-20). 

Génère un dossier technique et juridique complet en français, au format
Word (.docx), pour soumettre l'outil "PII Scanner" à l'APDP en vue d'un
partenariat officiel. Le document doit couvrir les articles 424, 425, 426
du Code du Numérique et le référentiel PSSIE.

---

## DESCRIPTION DE L'OUTIL

**Nom** : PII Scanner v2.0  
**Éditeur** : Cyberprevs  
**Contact** : samir49715@gmail.com  
**Type** : Application web locale (100% on-premise, aucune donnée en ligne)  
**Stack** : .NET 9.0 (backend) + React 19 / TypeScript (frontend)  
**Objectif** : Détecter automatiquement les données personnelles (PII) dans
les fichiers d'une organisation, conformément à la Loi N°2017-20 du Bénin.

---

## FONCTIONNALITÉS TECHNIQUES

### Détection de 18 types de PII spécifiques au Bénin

| Catégorie | Types détectés |
|-----------|---------------|
| Identité | IFU, CNI, Passeport BJ, RCCM, Acte de naissance, NPI |
| Contact | Email, Téléphone (+229), MTN MoMo, Moov Money |
| Bancaire | IBAN Bénin, Carte bancaire (Luhn) |
| Santé | CNSS, RAMU |
| Éducation | INE, Matricule fonctionnaire |
| Transport | Plaque d'immatriculation (ancien + nouveau format) |
| Universel | Date de naissance |

Validation avancée : réduction ~87% des faux positifs (algorithme Luhn pour
cartes bancaires, filtres anti-faux-positifs CNSS/email, vérification plage d'âge).

### Formats de fichiers analysés

.txt, .log, .csv, .json, .docx, .xlsx, .pdf

### Analyse des risques

- Fichiers à risque classifiés FAIBLE / MOYEN / ÉLEVÉ
- Ancienneté des fichiers (principe de minimisation des données APDP)
- Sur-exposition NTFS ACL (fichiers accessibles à "Everyone" ou partages réseau)
- Fichiers dupliqués (détection par hash MD5)
- Analyse par catégories : Bancaire, Identité, Santé, Contact, Éducation, Transport

---

## MESURES DE CONFORMITÉ APDP (v2.0)

### 1. Consentement éclairé (Art. 424-426 Code du Numérique)

- Modal obligatoire affiché avant tout traitement de données, impossible à contourner
  (désactivation touche Échap, clic hors modal bloqué)
- Explication claire des 4 modalités de traitement :
  1. Accès aux fichiers du dossier sélectionné
  2. Traitement 100% local — aucune donnée envoyée en ligne
  3. Stockage sécurisé AES-256 (base de données chiffrée)
  4. Droit à l'effacement disponible à tout moment
- Case à cocher requise = consentement actif et explicite (pas passif)
- Enregistrement horodaté dans la table AuditLog avec : userId, IP, timestamp, détails
- Endpoint dédié : POST /api/audit/consent (accessible à tous les utilisateurs authentifiés)

### 2. Droit à l'effacement (Art. 424 Code du Numérique)

- Endpoint : DELETE /api/users/{id}/data
- Suppression en cascade et irréversible :
  sessions → scans → paramètres utilisateur → audit logs → compte utilisateur
- Dernier enregistrement d'audit conservé avec mention explicite :
  "Suppression des données personnelles — droit à l'effacement APDP"
- Accessible uniquement aux administrateurs (RBAC)

### 3. Chiffrement des exports de rapports

- Algorithme : AES-256-CBC
- Dérivation de clé : PBKDF2-SHA256, 100 000 itérations, salt aléatoire 16 bytes
  (conforme NIST SP 800-132)
- Format du fichier chiffré : [salt 16 bytes][IV 16 bytes][données chiffrées]
- Extension des fichiers exportés : .enc
- Mot de passe : 20 caractères aléatoires (entropie ~127 bits)
  Charset : A-Z, a-z, 0-9, !@#$%^&* (caractères ambigus exclus : O, 0, I, l)
- Mot de passe retourné une seule fois via header HTTP X-Report-Password
- Jamais persisté côté serveur — impossible à récupérer après fermeture du dialog
- Déchiffrement intégré dans l'interface via Web Crypto API (100% navigateur,
  aucune donnée envoyée en ligne pendant le déchiffrement)

### 4. Audit trail complet

Actions tracées : login, logout, démarrage scan, téléchargement rapport,
acceptation consentement, effacement de données.

Chaque entrée contient : userId, action, adresse IP, timestamp UTC, détails.

Consultation réservée aux administrateurs.

---

## SÉCURITÉ TECHNIQUE — 13 MÉCANISMES

| # | Mécanisme | Implémentation | Niveau |
|---|-----------|---------------|--------|
| 1 | HTTPS/TLS 1.2+ | ASP.NET Core HTTPS middleware | Transport |
| 2 | Base de données chiffrée | SQLCipher AES-256 (SQLite chiffré) | Repos |
| 3 | Exports chiffrés | AES-256-CBC + PBKDF2-SHA256 100k itérations | Fichiers |
| 4 | Authentification | JWT (7j) + Refresh Tokens (30j) | Accès |
| 5 | Contrôle d'accès | RBAC Admin/Operator | Autorisation |
| 6 | Protection CSRF | Double-Submit Cookie, tokens 32 bytes | Requêtes |
| 7 | Rate Limiting | 5 req/15min (login), 20 req/5min (sensible), 100 req/min (général) | Anti-brute force |
| 8 | Path Traversal | PathValidator bloque .., ~, %, UNC, chemins système | Injection |
| 9 | SQL Injection | Entity Framework Core — requêtes paramétrées | Injection |
| 10 | Hachage mots de passe | BCrypt avec salt automatique | Stockage |
| 11 | Audit Logging | Table AuditLog — toutes actions sensibles | Traçabilité |
| 12 | Security Headers | HSTS, X-Frame-Options, CSP, X-Content-Type-Options | Headers |
| 13 | Consentement tracé | Modal + log horodaté + endpoint dédié | Conformité |

---

## SCANS DE SÉCURITÉ

L'outil fait l'objet d'analyses de sécurité régulières avec :
- **Snyk** — analyse statique (SAST) et scan des dépendances (SCA)
- **OWASP ZAP** — tests de pénétration dynamiques (DAST)
- **Burp Suite** — analyse des vulnérabilités OWASP Top 10

---

## ARCHITECTURE DE TRAITEMENT DES DONNÉES

### Flux de données

```
Utilisateur → Interface Web (React) → API REST (ASP.NET Core)
                                          ↓
                                   FileScanner (local)
                                          ↓
                              Lecture fichiers du dossier
                                          ↓
                              Détection PII (regex + validation)
                                          ↓
                              Résultats en mémoire (RAM uniquement)
                                          ↓
                              Export chiffré AES-256 → Fichier .enc
```

### Garanties de localisation

- Traitement 100% local : aucune donnée personnelle ne quitte le poste ou le serveur
- Résultats de scan stockés uniquement en mémoire RAM (non persistés en base)
- Base de données locale SQLite chiffrée (SQLCipher) — ne contient que métadonnées
  (chemins, statistiques, logs) — jamais le contenu des fichiers analysés
- Pas de télémétrie, pas de cloud, pas de service tiers
- Déploiement on-premise (Windows Server ou poste Windows 10/11)

---

## POLITIQUE DE CONSERVATION DES DONNÉES

| Catégorie PII | Durée recommandée | Base légale |
|---------------|-------------------|-------------|
| Données bancaires (IFU, IBAN, carte) | 5 ans | Obligations comptables |
| Données d'identité (CNI, Passeport, RCCM) | 3 ans | Art. 424 Loi N°2017-20 |
| Données de santé (CNSS, RAMU) | 5 ans | Code de la santé publique |
| Données éducation (INE, Matricule) | 2 ans | Règlement interne |
| Données de contact (Email, Téléphone) | 1 an | Principe de minimisation |
| Données transport (Plaque) | 3 ans | Règlement interne |

L'outil intègre un module "Rétention" qui signale automatiquement les fichiers
dépassant les durées configurées, permettant à l'organisation de prendre
les mesures correctives (archivage, suppression).

---

## DROITS DES PERSONNES CONCERNÉES

| Droit | Disponibilité | Implémentation |
|-------|--------------|----------------|
| Droit d'accès | ✅ | Consultation des scans via interface Admin |
| Droit à l'effacement | ✅ | DELETE /api/users/{id}/data — suppression en cascade |
| Droit à la limitation | ✅ | Désactivation du compte sans suppression |
| Droit d'opposition | ✅ | Refus du consentement = aucun scan possible |
| Droit à la portabilité | ✅ | Export CSV/JSON des données |
| Droit à l'information | ✅ | Modal de consentement détaillé avant traitement |

---

## STRUCTURE DU DOCUMENT À GÉNÉRER

Génère un document Word (.docx) professionnel avec la structure suivante :

1. **Page de garde**
   - Titre : "Dossier de Conformité APDP — PII Scanner v2.0"
   - Sous-titre : "Demande de partenariat officiel"
   - Destinataire : APDP Bénin — contact@apdp.bj
   - Éditeur : Cyberprevs — samir49715@gmail.com
   - Date : Avril 2026
   - Version : 2.0.0
   - Mention : CONFIDENTIEL

2. **Sommaire numéroté**

3. **Résumé exécutif** (1 page)
   - Présentation rapide, intérêt pour l'APDP, points forts conformité

4. **Présentation de l'outil**
   - Objectif et contexte
   - Utilisateurs cibles (organisations béninoises, administrations, entreprises)
   - Problème résolu (PII non détectées = risque APDP)

5. **Cadre légal et référentiels applicables**
   - Loi N°2017-20 articles 424, 425, 426 (citer les articles complets)
   - PSSIE (Politique de Sécurité des Systèmes d'Information de l'État)
   - Principes RGPD applicables : minimisation, finalité, exactitude, limitation conservation
   - Tableau de correspondance : fonctionnalité PII Scanner ↔ article de loi

6. **Architecture technique détaillée**
   - Description du flux de données (schéma textuel)
   - Composants et interactions
   - Garanties de localisation des données
   - Ce qui est stocké vs ce qui ne l'est pas

7. **Mesures de conformité APDP — détail complet**
   - Consentement éclairé (avec captures d'écran décrites)
   - Droit à l'effacement
   - Chiffrement AES-256 des exports
   - Audit trail

8. **Mesures de sécurité technique**
   - Tableau des 13 mécanismes
   - Résultats des scans Snyk / OWASP ZAP / Burp Suite

9. **Gestion des droits des personnes concernées**
   - Tableau des 6 droits avec implémentation

10. **Politique de conservation des données**
    - Tableau par catégorie avec durées et bases légales

11. **Procédures d'audit et de traçabilité**
    - Description de la table AuditLog
    - Actions tracées
    - Accès et consultation

12. **Analyse de risques**
    Tableau avec colonnes : Menace | Probabilité | Impact | Mesure mise en place

    Inclure au minimum :
    - Accès non autorisé aux fichiers PII
    - Fuite de données lors de l'export
    - Brute force sur l'authentification
    - Injection SQL / Path traversal
    - Conservation excessive de données PII

13. **Déclaration de conformité article par article**
    Tableau : Article | Exigence | Implémentation PII Scanner | Statut (✅/⚠️/❌)

14. **Conclusion et demande de partenariat**
    - Valeur ajoutée pour l'APDP
    - Proposition de collaboration (certification, recommandation officielle)
    - Coordonnées

15. **Annexes**
    - Glossaire (APDP, PII, AES, PBKDF2, RBAC, JWT, CSRF...)
    - Références légales complètes
    - Liste des 18 types de PII détectés avec description

---

**Format requis** : Document Word (.docx) structuré et professionnel.
Utilise des tableaux pour toutes les matrices.
Numérotation légale des sections.
Longueur cible : 25-35 pages.
Langue : Français juridique et technique.
