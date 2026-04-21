# Roadmap PII Scanner — 2026

**Cyberprevs** | Avril 2026

---

## Notre vision

Faire de PII Scanner **l'outil de référence pour la protection des données personnelles en Afrique de l'Ouest**, en commençant par le Bénin. Un projet open source porté par Cyberprevs, enrichi par une communauté de contributeurs (développeurs, étudiants, professionnels de la sécurité).

---

## Ce qui existe aujourd'hui — v2.0.0 (Avril 2026)

- Détection de **18 types de données personnelles** adaptés au Bénin
- Analyse de **7 formats de fichiers** (PDF, Word, Excel, CSV, JSON, TXT, LOG)
- Analyse des **permissions NTFS** (qui a accès aux fichiers sensibles)
- Analyse de **l'ancienneté** des fichiers (données oubliées depuis des années)
- Détection des **fichiers dupliqués** contenant des PII
- **4 formats de rapports chiffrés** (CSV, Excel, JSON, HTML — tous en `.enc` AES-256-CBC)
- Interface web moderne (React 19 + Material-UI v7) — **bilingue FR/EN**
- Progression en temps réel (WebSocket SignalR)
- **10 couches de sécurité** (JWT, CSRF, AES-256 exports, consentement tracé, rate limiting...)
- 100% local — aucune donnée ne quitte l'entreprise
- Déploiement en **1 clic** (exécutable standalone, ~73 MB)
- **Consentement éclairé APDP** — modal obligatoire, horodaté en audit log (Art. 424-426)
- **Exports chiffrés AES-256-CBC** — mot de passe unique par téléchargement, jamais persisté
- **Déchiffrement intégré** — page `/decrypt`, Web Crypto API, 100% navigateur
- **Droit à l'effacement** — `DELETE /api/users/{id}/data`, suppression en cascade
- **Raccourcis clavier** — `Ctrl+E` (export CSV), `Escape` (arrêt scan)

---

## Q2 — Avril → Juin 2026 : Scan et performance

### v2.1.0 — Scan plus puissant

| Fonctionnalité | Description |
|----------------|-------------|
| Scan incrémental | Ne rescanner que les fichiers modifiés depuis le dernier scan |
| Support PowerPoint (.pptx) | Nouveau format de fichier supporté |
| Support LibreOffice (.odt/.ods) | Compatibilité avec la suite libre |
| Notifications email | Alertes automatiques sur les scans terminés ou anomalies détectées |
| Audit de sécurité v2.1 | Pentest OWASP avant release |

**Objectif** : Un scan plus rapide et des formats de fichiers supplémentaires.

---

## Q3 — Juillet → Septembre 2026 : Entreprise

### v2.2.0 — Planification et intégrations

| Fonctionnalité | Description |
|----------------|-------------|
| Scan planifié | Programmer des scans automatiques (quotidien, hebdomadaire) |
| Comparaison de scans | Comparer deux scans dans le temps pour voir l'évolution |
| API publique documentée | Intégrer PII Scanner dans des outils tiers via API REST |
| Webhooks | Notification automatique vers des services externes à la fin d'un scan |
| Mode CLI | Lancer des scans en ligne de commande (scripts, automatisation) |
| Audit de sécurité v2.2 | Pentest OWASP avant release |

**Objectif** : PII Scanner s'intègre dans l'écosystème IT des entreprises.

---

## Q4 — Octobre → Décembre 2026 : Nouvelles plateformes

### v2.3.0 — Multi-plateforme et IA

| Fonctionnalité | Description |
|----------------|-------------|
| Support Linux | Déploiement sur serveurs Linux (Ubuntu, Debian) |
| Patterns PII personnalisables | Chaque organisation peut définir ses propres types à détecter |
| OCR basique | Détection de PII dans les images et documents scannés (Tesseract) |
| Tableau de bord exécutif | Vue résumée pour les directions et les décideurs |
| Audit de sécurité v2.3 | Pentest externe complet avant release |

**Objectif** : Un produit mature, multi-plateforme, adaptable à toute organisation.

---

## Calendrier des releases

```
Jan 2026   Avril 2026   Juin       Sept       Déc
 │              │          │          │          │
v1.0           v2.0       v2.1       v2.2      v2.3
 ✅             ✅          🔒         🔒        🔒

✅ Publiée    🔒 Audit de sécurité avant chaque release
```

---

## Sécurité : un engagement à chaque version

Avant chaque release, un audit de sécurité est réalisé :

- Scan automatisé OWASP ZAP sur tous les endpoints
- Tests manuels : injection SQL, XSS, CSRF, path traversal
- Test de brute force et d'escalade de privilèges
- Vérification des dépendances vulnérables
- Rapport de sécurité publié avec la release

---

## Contribuer au projet

PII Scanner est **open source (licence MIT)**. Nous accueillons tous les profils :

| Profil | Comment contribuer |
|--------|-------------------|
| Développeurs | Nouvelles fonctionnalités, corrections de bugs, revue de code |
| Étudiants | Issues étiquetées par niveau de difficulté, encadrement par l'équipe |
| Testeurs / Pentesters | Tests de sécurité, tests fonctionnels, rapports de bugs |
| Traducteurs | Internationalisation de l'interface |
| Rédacteurs | Documentation, tutoriels, articles |

### Partenariat écoles (à partir de mars 2026)

Les étudiants peuvent contribuer dans le cadre de :
- Stages de fin d'études
- Projets tutorés
- Contributions open source encadrées

Un kanban GitHub Projects organise les tâches avec des issues adaptées à chaque niveau.

---

## Métriques de succès

| Métrique | Mi-2026 | Fin 2026 |
|----------|---------|----------|
| Formats de fichiers supportés | 7 | 10+ (pptx, odt, images) |
| Types de PII détectés | 18 | 20+ (patterns custom) |
| Plateformes | Windows | Windows + Linux |
| Langues de l'interface | 2 (FR/EN) | 3+ |
| Audits de sécurité réalisés | 2 (v2.0 livré) | 5+ |
| Contributeurs actifs | 5+ | 20+ |

---

**Cyberprevs** | [cyberprevs.fr](https://cyberprevs.fr) | Open Source — Licence MIT
