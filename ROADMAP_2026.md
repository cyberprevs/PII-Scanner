# Roadmap PII Scanner — 2026

**Cyberprevs** | Février 2026

---

## Notre vision

Faire de PII Scanner **l'outil de référence pour la protection des données personnelles en Afrique de l'Ouest**, en commençant par le Bénin. Un projet open source porté par Cyberprevs, enrichi par une communauté de contributeurs (développeurs, étudiants, professionnels de la sécurité).

---

## Ce qui existe aujourd'hui — v1.0.0 (Janvier 2026)

- Détection de **18 types de données personnelles** adaptés au Bénin
- Analyse de **7 formats de fichiers** (PDF, Word, Excel, CSV, JSON, TXT, LOG)
- Analyse des **permissions NTFS** (qui a accès aux fichiers sensibles)
- Analyse de **l'ancienneté** des fichiers (données oubliées depuis des années)
- Détection des **fichiers dupliqués** contenant des PII
- **4 formats de rapports** (CSV, Excel, JSON, HTML interactif)
- Interface web moderne (React 19 + Material-UI v7)
- Progression en temps réel (WebSocket)
- **8 couches de sécurité** (JWT, CSRF, chiffrement AES-256, rate limiting...)
- 100% local — aucune donnée ne quitte l'entreprise
- Déploiement en **1 clic** (exécutable standalone, 73 MB)

---

## Q1 — Janvier → Mars 2026 : Consolidation

### v1.1.0 — Qualité et ouverture aux contributeurs

| Fonctionnalité | Description |
|----------------|-------------|
| Tests automatisés | Couverture backend et frontend pour garantir la fiabilité |
| CI/CD GitHub Actions | Build et tests automatiques à chaque contribution |
| Raccourcis clavier | Ctrl+S (scanner), Ctrl+E (exporter), Escape (annuler) |
| Documentation contributeur | Guide complet pour intégrer facilement de nouveaux développeurs |
| Audit de sécurité v1.1 | Pentest OWASP avant chaque release |

**Objectif** : Un projet solide, testé, prêt à accueillir des contributeurs externes.

---

## Q2 — Avril → Juin 2026 : Expérience utilisateur

### v1.2.0 — Interface enrichie

| Fonctionnalité | Description |
|----------------|-------------|
| Annulation de scan | Pouvoir stopper un scan en cours |
| Recherche et filtres avancés | Rechercher dans les résultats par type, fichier, risque |
| Internationalisation (i18n) | Interface disponible en Français et Anglais |
| Notifications améliorées | Retours visuels clairs sur chaque action |
| Audit de sécurité v1.2 | Pentest OWASP avant release |

### v1.3.0 — Scan plus puissant

| Fonctionnalité | Description |
|----------------|-------------|
| Scan incrémental | Ne rescanner que les fichiers modifiés (gain de temps majeur) |
| Support PowerPoint (.pptx) | Nouveau format de fichier supporté |
| Support LibreOffice (.odt/.ods) | Compatibilité avec la suite libre |
| Export PDF | Rapport PDF professionnel pour les audits |
| Tableau de tendances | Évolution des résultats dans le temps |
| Audit de sécurité v1.3 | Pentest OWASP avant release |

**Objectif** : Une application plus rapide, plus complète, utilisable au quotidien.

---

## Q3 — Juillet → Septembre 2026 : Entreprise

### v1.4.0 — Persistance et planification

| Fonctionnalité | Description |
|----------------|-------------|
| Historique persistant | Les résultats de scan sont conservés en base de données |
| Comparaison de scans | Comparer deux scans pour voir l'évolution |
| Scan planifié | Programmer des scans automatiques (quotidien, hebdomadaire) |
| Notifications in-app | Alertes sur les scans terminés et les risques détectés |
| Audit de sécurité v1.4 | Pentest OWASP avant release |

### v1.5.0 — API et intégrations

| Fonctionnalité | Description |
|----------------|-------------|
| API publique documentée | Intégrer PII Scanner dans des outils tiers via API REST |
| Webhooks | Notification automatique vers des services externes à la fin d'un scan |
| Mode CLI | Lancer des scans en ligne de commande (scripts, automatisation) |
| Audit de sécurité v1.5 | Pentest OWASP avant release |

**Objectif** : PII Scanner s'intègre dans l'écosystème IT des entreprises.

---

## Q4 — Octobre → Décembre 2026 : Version majeure

### v2.0.0 — Nouvelle génération

| Fonctionnalité | Description |
|----------------|-------------|
| Support Linux | Déploiement sur serveurs Linux (Ubuntu, Debian) |
| Patterns PII personnalisables | Chaque organisation peut définir ses propres types de données à détecter |
| Multi-langues complet | Interface entièrement traduite (FR, EN, et base pour d'autres langues) |
| Tableau de bord exécutif | Vue résumée pour les directions et les décideurs |
| OCR basique | Détection de PII dans les images et documents scannés |
| Audit de sécurité v2.0 | Pentest externe complet avant release majeure |

**Objectif** : Un produit mature, multi-plateforme, adaptable à toute organisation.

---

## Calendrier des releases

```
Jan       Mars       Mai       Juin       Août       Sept       Déc
 │         │          │         │          │          │          │
v1.0      v1.1       v1.2     v1.3       v1.4       v1.5      v2.0
 ✅        🔒         🔒       🔒         🔒         🔒        🔒

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
| Formats de fichiers supportés | 10 | 10+ images |
| Types de PII détectés | 18 | 20+ (patterns custom) |
| Plateformes | Windows | Windows + Linux |
| Langues de l'interface | 2 (FR/EN) | 3+ |
| Audits de sécurité réalisés | 3 | 6 |
| Contributeurs actifs | 10+ | 20+ |

---

**Cyberprevs** | [cyberprevs.fr](https://cyberprevs.fr) | Open Source — Licence MIT
