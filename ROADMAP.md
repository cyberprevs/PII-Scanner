# 🗺️ Roadmap - PII Scanner

Ce document présente la vision et les objectifs à court, moyen et long terme du projet PII Scanner.

---

## ✅ Version 1.0.0 (Décembre 2024) - PUBLIÉ

### Fonctionnalités principales
- [x] Détection de 17 types de PII spécifiques au Bénin
- [x] Interface Electron moderne (React 19 + TypeScript)
- [x] API REST .NET 8.0 avec SignalR
- [x] Authentification JWT + refresh tokens
- [x] Base de données chiffrée SQLCipher (AES-256)
- [x] 11 protections de sécurité actives
- [x] Support Windows Server (chemins UNC, NTFS ACL)
- [x] Exports multi-formats (CSV, JSON, HTML, Excel)
- [x] Gestion de rétention des données (APDP conforme)
- [x] Audit logs complet

---

## 🚀 Version 1.1.0 (Q1 2025) - Améliorations & Stabilité

### Objectifs
- [ ] **Tests automatisés**
  - [ ] Tests unitaires .NET (>80% couverture)
  - [ ] Tests d'intégration API
  - [ ] Tests E2E Electron (Playwright)

- [ ] **Performance**
  - [ ] Scan incrémental (uniquement fichiers modifiés)
  - [ ] Cache des résultats de scan
  - [ ] Optimisation requêtes base de données
  - [ ] Streaming des gros fichiers

- [ ] **UX/UI**
  - [ ] Mode clair/sombre (toggle)
  - [ ] Historique des scans avec recherche
  - [ ] Filtres avancés sur les résultats
  - [ ] Export vers Excel avec graphiques

- [ ] **Documentation**
  - [ ] Vidéos tutoriels YouTube
  - [ ] Guide d'utilisation PDF
  - [ ] Wiki GitHub complet
  - [ ] API documentation (Swagger enrichi)

---

## 🌟 Version 2.0.0 (Q2-Q3 2025) - Extensions majeures

### Objectifs

- [ ] **Multi-langues**
  - [ ] Interface en français (actuel)
  - [ ] Interface en anglais
  - [ ] Détection PII multi-pays (France, Côte d'Ivoire, Sénégal)
  - [ ] Patterns RGPD européens

- [ ] **Nouveaux formats de fichiers**
  - [ ] Support .eml (emails Outlook)
  - [ ] Support .msg (Microsoft Outlook)
  - [ ] Support .pst (archives Outlook)
  - [ ] Support bases de données (MySQL, PostgreSQL, SQL Server)
  - [ ] Support fichiers images avec OCR (tesseract)

- [ ] **API Publique**
  - [ ] API REST publique avec authentification API Key
  - [ ] Rate limiting par utilisateur
  - [ ] Documentation OpenAPI 3.0
  - [ ] SDKs client (.NET, Python, JavaScript)
  - [ ] Webhooks pour notifications

- [ ] **Intégrations**
  - [ ] Plugin Microsoft 365 (SharePoint, OneDrive)
  - [ ] Plugin Google Workspace (Drive)
  - [ ] Intégration Dropbox
  - [ ] Intégration NextCloud

---

## 🎯 Version 3.0.0 (Q4 2025 - Q1 2026) - Entreprise

### Objectifs

- [ ] **Support multi-OS**
  - [ ] Version Linux (Ubuntu, Debian, Red Hat)
  - [ ] Version macOS
  - [ ] Docker containers officiels
  - [ ] Kubernetes Helm charts

- [ ] **Mode SaaS (Cloud)**
  - [ ] Version web (pas d'installation)
  - [ ] Multi-tenancy
  - [ ] Stockage cloud sécurisé (chiffrement client-side)
  - [ ] Facturation abonnement

- [ ] **Machine Learning**
  - [ ] Détection PII par ML (en plus des regex)
  - [ ] Détection d'anomalies
  - [ ] Classification automatique de sensibilité
  - [ ] Suggestions de politiques de rétention

- [ ] **Conformité avancée**
  - [ ] Rapports conformité RGPD automatisés
  - [ ] Intégration avec systèmes DLP (Data Loss Prevention)
  - [ ] Certificat ISO 27001
  - [ ] Audit trail immuable (blockchain)

---

## 💡 Backlog / Idées futures

### Fonctionnalités en réflexion

- [ ] **Pseudonymisation/Anonymisation**
  - Masquage automatique des PII détectées
  - Tokenisation réversible
  - Génération de données fictives pour tests

- [ ] **Monitoring temps réel**
  - Surveillance de dossiers en continu
  - Alertes par email/webhook
  - Dashboard live des détections

- [ ] **Collaboration**
  - Partage de rapports sécurisé
  - Commentaires sur les détections
  - Workflows d'approbation

- [ ] **Mobile**
  - Application mobile iOS/Android
  - Scan de documents photo (OCR)

- [ ] **AI/LLM**
  - Analyse contextuelle avec GPT
  - Génération de politiques de rétention
  - Assistant virtuel pour conformité

---

## 🤝 Comment contribuer à la roadmap

Vous avez des idées ou des besoins spécifiques ?

1. **Ouvrez une issue** : [GitHub Issues](https://github.com/cyberprevs/pii-scanner/issues)
2. **Votez** : Utilisez 👍 sur les issues existantes pour prioriser
3. **Discutez** : Participez aux discussions GitHub
4. **Contribuez** : Soumettez une PR pour implémenter une fonctionnalité

---

## 📊 Critères de priorisation

Les fonctionnalités sont priorisées selon :

1. **Valeur utilisateur** : Impact direct sur les besoins utilisateurs
2. **Conformité** : Respect RGPD/APDP
3. **Sécurité** : Réduction des risques
4. **Demandes communautaires** : Votes et feedback GitHub
5. **Faisabilité technique** : Complexité vs bénéfices

---

## 📅 Release Schedule

- **Versions mineures (x.Y.0)** : Tous les 3 mois
- **Patches de sécurité (x.y.Z)** : Dès que nécessaire
- **Versions majeures (X.0.0)** : Annuel

---

**🌟 Soutenez le développement** : [Ko-fi](https://ko-fi.com/Y8Y31QXZ2Y) | [PayPal](https://www.paypal.com/ncp/payment/G9FTF7NGPN8CG)

**Dernière mise à jour** : Décembre 2024
**Version actuelle** : 1.0.0
