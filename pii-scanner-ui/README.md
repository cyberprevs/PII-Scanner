# PII Scanner - Interface Web React

Interface web moderne pour l'application PII Scanner, développée avec React 19 et Material-UI v7.

## Technologies

- **React 19** : Bibliothèque UI avec nouvelles fonctionnalités
- **TypeScript 5.9** : Typage statique pour meilleure maintenabilité
- **Material-UI v7** : Composants UI modernes avec thème sombre
- **Vite** : Bundler ultra-rapide pour développement et build
- **Recharts** : Bibliothèque de graphiques interactifs
- **Axios** : Client HTTP avec intercepteurs
- **@microsoft/signalr** : Communication temps réel avec l'API

## Installation

### Prérequis

- Node.js 18+ et npm

### Installation des dépendances

```bash
npm install
```

## Commandes de développement

### Démarrage en mode développement

```bash
# Démarrer Vite dev server (hot reload)
npm run dev
```

Le serveur de développement démarre sur http://localhost:5173 avec hot reload automatique.

> **Note** : L'API doit être démarrée séparément sur http://localhost:5000 (ou https://localhost:5001 si HTTPS activé)

### Build de production

```bash
# Build des assets web
npm run build
```

Le build est généré dans le dossier `dist/`, prêt à être copié vers `PiiScanner.Api/wwwroot/`.

### Autres commandes

```bash
# Linter (ESLint)
npm run lint

# Prévisualiser le build de production
npm run preview
```

## Structure du projet

```
pii-scanner-ui/
├── src/
│   ├── components/           # Composants React
│   │   ├── Layout/          # Layout principal (Sidebar, TopBar)
│   │   ├── pages/           # Pages de l'application
│   │   ├── Login.tsx        # Page de connexion
│   │   ├── InitialSetup.tsx # Configuration initiale
│   │   └── ...
│   ├── contexts/            # React Contexts
│   │   └── AuthContext.tsx  # Gestion authentification JWT
│   ├── services/            # Services API
│   │   ├── apiClient.ts     # Client API + SignalR
│   │   └── axios.ts         # Instance Axios configurée
│   ├── types/               # Types TypeScript
│   ├── App.tsx              # Composant racine
│   └── main.tsx             # Point d'entrée React
├── public/                   # Assets statiques
├── dist/                     # Build output (généré)
├── index.html               # Template HTML
├── vite.config.ts           # Configuration Vite
├── tsconfig.json            # Configuration TypeScript
└── package.json             # Dépendances et scripts
```

## Pages de l'application

### Pages publiques
- **Initial Setup** : Création du premier compte administrateur
- **Login** : Authentification utilisateur

### Pages utilisateur
- **Dashboard** : Vue d'ensemble avec KPIs et graphiques
- **Scanner** : Lancement de scans manuels avec progression temps réel
- **Historique** : Consultation de tous les scans effectués
- **Fichiers à risque** : Top 20 fichiers critiques avec filtrage
- **Données sensibles** : Liste détaillée de toutes les détections PII
- **Ancienneté** : Analyse des fichiers obsolètes (Stale Data)
- **Exposition** : Analyse des fichiers sur-exposés (NTFS ACL)
- **Rapports & Analytics** : Visualisations avancées (3 vues : Overview, Detailed, Comparison)
- **Exports** : Téléchargement des rapports (CSV, JSON, HTML, Excel)
- **Rétention des données** : Gestion des politiques de rétention et suppression
- **Mon Profil** : Gestion du profil et changement de mot de passe
- **Support** : FAQ, formulaire de contact, documentation
- **À propos** : Informations sur l'application

### Pages admin uniquement
- **Utilisateurs** : Gestion CRUD des comptes utilisateurs
- **Base de données** : Sauvegardes, restauration, optimisation
- **Journal d'audit** : Traçabilité complète des opérations

## Authentification

### Système JWT

L'application utilise un système d'authentification JWT avec refresh tokens :

1. **Login** : L'utilisateur saisit username et password
2. **Tokens** : L'API retourne :
   - Access Token (JWT, durée 7 jours)
   - Refresh Token (UUID, durée 30 jours)
3. **Stockage** : Tokens stockés dans `localStorage`
4. **Auto-refresh** : Axios interceptor renouvelle automatiquement l'Access Token à l'expiration
5. **Logout** : Révocation du Refresh Token en base de données

### Protection CSRF

L'application implémente une protection CSRF via headers HTTP :

1. **Initialisation** : Appel GET à `/api/initialization/status` pour obtenir le token CSRF
2. **Stockage** : Token stocké en mémoire (pas de cookies)
3. **Transmission** : Header `X-CSRF-Token` ajouté automatiquement sur POST/PUT/DELETE/PATCH
4. **Validation** : Middleware backend valide le token avant traitement

**Implémentation** : [src/services/axios.ts](src/services/axios.ts)

## Configuration API

### Connexion à l'API

L'application détecte automatiquement l'environnement :

**Développement** (Vite dev server) :
- **API REST** : `https://localhost:5001/api`
- **SignalR Hub** : `https://localhost:5001/scanhub`

**Production** (servi par l'API) :
- **API REST** : `/api` (même origine)
- **SignalR Hub** : `/scanhub` (même origine)

**Configuration** : [src/services/axios.ts](src/services/axios.ts) et [src/services/apiClient.ts](src/services/apiClient.ts)

### Architecture Web

En production, l'application React est servie directement par l'API .NET :

```
PiiScanner.Api/
├── wwwroot/           ← Build React copié ici
│   ├── index.html
│   └── assets/
├── Controllers/       ← API REST
└── Program.cs         ← Sert React + API
```

**Avantages** :
- Pas de configuration CORS nécessaire
- Un seul processus à lancer
- Même origine pour toutes les requêtes

## Thème et Design

### Material-UI v7 Dark Theme

L'application utilise un thème sombre personnalisé :

```typescript
const theme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#667eea',  // Violet
    },
    secondary: {
      main: '#764ba2',  // Violet foncé
    },
    background: {
      default: '#0a0e27',
      paper: '#151a30',
    },
  },
  typography: {
    fontFamily: '"Plus Jakarta Sans", "Roboto", "Helvetica", "Arial", sans-serif',
  },
});
```

### Typographie

Police : **Plus Jakarta Sans** (Google Fonts)
- Importée dans [index.html](index.html)
- Appliquée via Material-UI theme

## Graphiques et Visualisations

### Recharts

Bibliothèque utilisée pour les graphiques interactifs :

**Dashboard** :
- Donut charts pour répartition des PII et fichiers à risque
- Area charts pour tendances temporelles

**Reports & Analytics** :
- Treemap pour visualisation hiérarchique
- Radar chart pour profil de risque multidimensionnel
- Bar charts pour top 10

**Configuration** : Tooltips personnalisés, couleurs adaptées au thème sombre

## 🔧 Build et déploiement

### Build de production

```bash
# 1. Build des assets web
npm run build

# 2. Copier vers l'API
# Windows
xcopy /E /I dist ..\PiiScanner.Api\wwwroot

# Linux/Mac
cp -r dist/* ../PiiScanner.Api/wwwroot/

# 3. L'API sert maintenant React + API
cd ..\PiiScanner.Api
dotnet run
```

### Script automatisé

Utilisez le script à la racine du projet :

```powershell
# Build complet (React + API + Package)
.\build-standalone-release.ps1
```

## Dépannage

### Problèmes courants

**1. L'API ne se connecte pas**
- Vérifiez que l'API .NET est démarrée sur le port 5001
- Faites confiance au certificat dev : `dotnet dev-certs https --trust`

**2. SignalR ne se connecte pas**
- Vérifiez que WebSockets n'est pas bloqué par un pare-feu
- Consultez la console pour les erreurs SignalR

**3. Erreurs CSRF (403 Forbidden)**
- Vérifiez que le token CSRF est bien initialisé (console logs)
- Faites un hard reload (Ctrl+Shift+R) pour vider le cache

**4. Build échoue**
```bash
# Nettoyer et réinstaller
rm -rf node_modules
npm install
npm run build
```

**5. Page blanche en production**
- Vérifiez que le build a été copié vers `PiiScanner.Api/wwwroot/`
- Vérifiez que `Program.cs` contient `UseDefaultFiles()` et `UseStaticFiles()`

## Optimisations de performance

### Code splitting

Routes chargées à la demande avec `React.lazy()` :

```typescript
const Dashboard = React.lazy(() => import('./components/pages/DashboardPage'));
const Scanner = React.lazy(() => import('./components/pages/Scanner'));
// ...
```

### Memoization

Composants mémorisés pour éviter les re-renders :

```typescript
const StatCard = React.memo(({ title, value, icon }) => {
  // ...
});
```

## Ressources

### Documentation

- [README.md](../README.md) - Documentation principale
- [INSTALLATION.md](../INSTALLATION.md) - Guide d'installation
- [FEATURES.md](../FEATURES.md) - Fonctionnalités détaillées
- [SECURITY.md](../SECURITY.md) - Documentation de sécurité

### Liens externes

- [React Documentation](https://react.dev)
- [Material-UI Documentation](https://mui.com)
- [Vite Documentation](https://vitejs.dev)
- [Recharts Documentation](https://recharts.org)

## Licence

Ce projet est sous licence **MIT**.

Voir [LICENSE](../LICENSE) pour les détails.

---

**Développé par** : [Cyberprevs](https://cyberprevs.fr)
**Version** : 1.0.0
**Dernière mise à jour** : 18 Janvier 2026
