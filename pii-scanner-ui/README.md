# PII Scanner - Interface Utilisateur Electron

Interface de bureau moderne pour l'application PII Scanner, développée avec Electron, React 19 et Material-UI v7.

## 🚀 Technologies

- **Electron 39** : Framework de bureau cross-platform
- **React 19** : Bibliothèque UI avec nouvelles fonctionnalités
- **TypeScript 5.9** : Typage statique pour meilleure maintenabilité
- **Material-UI v7** : Composants UI modernes avec thème sombre
- **Vite** : Bundler ultra-rapide pour développement et build
- **Recharts** : Bibliothèque de graphiques interactifs
- **Axios** : Client HTTP avec intercepteurs
- **@microsoft/signalr** : Communication temps réel avec l'API

## 📦 Installation

### Prérequis

- Node.js 18+ et npm
- .NET 8.0 Runtime (pour l'API bundlée)

### Installation des dépendances

```bash
npm install
```

## 🛠️ Commandes de développement

### Démarrage en mode développement

```bash
# Démarrer Vite dev server + Electron
npm run electron:dev
```

Cette commande lance :
1. Le serveur de développement Vite (port 5173 par défaut)
2. L'application Electron qui se connecte au serveur Vite
3. Le hot-reload automatique lors des modifications de code

### Build de production

```bash
# Build des assets web
npm run build

# Build de l'application Electron pour Windows
npm run electron:build:win
```

L'installateur sera généré dans le dossier `release/`.

### Autres commandes

```bash
# Linter (ESLint)
npm run lint

# Vite dev server uniquement (sans Electron)
npm run dev

# Prévisualiser le build de production
npm run preview
```

## 📁 Structure du projet

```
pii-scanner-ui/
├── electron/                  # Code Electron
│   ├── main.ts               # Processus principal Electron
│   └── preload.js            # Script de préchargement
├── src/
│   ├── components/           # Composants React
│   │   ├── Layout/          # Layout principal (Sidebar, TopBar)
│   │   ├── pages/           # Pages de l'application
│   │   ├── Login.tsx        # Page de connexion
│   │   ├── InitialSetup.tsx # Configuration initiale
│   │   ├── ScheduledScans.tsx # Gestion scans planifiés
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
├── index.html               # Template HTML
├── vite.config.ts           # Configuration Vite
├── electron.vite.config.ts  # Configuration Electron Builder
├── tsconfig.json            # Configuration TypeScript
└── package.json             # Dépendances et scripts
```

## 🎨 Pages de l'application

### Pages publiques
- **Initial Setup** : Création du premier compte administrateur
- **Login** : Authentification utilisateur

### Pages utilisateur
- **Dashboard** : Vue d'ensemble avec KPIs et graphiques
- **Scanner** : Lancement de scans manuels avec progression temps réel
- **Historique** : Consultation de tous les scans effectués
- **Scans planifiés** : Gestion des scans automatiques (quotidien, hebdomadaire, mensuel, trimestriel)
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

## 🔐 Authentification

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

## 🌐 Configuration API

### Connexion à l'API

Par défaut, l'application se connecte à :
- **API REST** : `https://localhost:5001/api`
- **SignalR Hub** : `https://localhost:5001/scanhub`

**Configuration** : [src/services/axios.ts](src/services/axios.ts) et [src/services/apiClient.ts](src/services/apiClient.ts)

### CORS

L'API est configurée pour accepter les requêtes depuis :
- `http://localhost:3000`, `http://localhost:3001`
- `http://localhost:5173`, `http://localhost:5174`, `http://localhost:5175`
- Versions HTTPS de toutes les origines ci-dessus

## 🎨 Thème et Design

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

## 📊 Graphiques et Visualisations

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

### Configuration Electron Builder

**Fichier** : `electron.vite.config.ts`

**Paramètres clés** :
- **Plateforme** : Windows (NSIS installer)
- **Ressources extra** : API .NET bundlée (optionnel)
- **Auto-update** : Désactivé (à configurer pour production)
- **Icône** : `public/icon.ico`

### Build de production

```bash
# 1. Build des assets web
npm run build

# 2. Build de l'application Electron
npm run electron:build:win
```

**Artefacts** :
- Installateur : `release/PII Scanner Setup 1.0.0.exe`
- Archives : `release/win-unpacked/`

### Distribution

L'installateur NSIS généré permet :
- Installation dans `C:\Program Files\PII Scanner`
- Création d'un raccourci bureau
- Désinstallation via le Panneau de configuration

## 🐛 Dépannage

### Problèmes courants

**1. Erreur `'concurrently' n'est pas reconnu`**
```bash
npm install
```
Les dépendances npm n'étaient pas installées.

**2. L'API ne se connecte pas**
- Vérifiez que l'API .NET est démarrée sur le port 5001
- Consultez la console du navigateur pour les erreurs CORS
- Faites confiance au certificat dev : `dotnet dev-certs https --trust`

**3. SignalR ne se connecte pas**
- Vérifiez que WebSockets n'est pas bloqué par un pare-feu
- Consultez la console pour les erreurs SignalR
- Essayez HTTP au lieu de HTTPS pour le développement

**4. Erreurs CSRF (403 Forbidden)**
- Vérifiez que le token CSRF est bien initialisé (console logs)
- Assurez-vous que CORS expose le header `X-CSRF-Token`
- Faites un hard reload (Ctrl+Shift+R) pour vider le cache

**5. Build échoue**
```bash
# Nettoyer et réinstaller
rm -rf node_modules
npm install
npm run build
```

## 🚀 Optimisations de performance

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

### Axios caching

Requêtes GET cachées pour réduire les appels API répétés.

## 📚 Ressources

### Documentation

- [CLAUDE.md](../CLAUDE.md) - Guide complet pour développeurs
- [CAHIER_DES_CHARGES.md](../CAHIER_DES_CHARGES.md) - Spécifications détaillées
- [SECURITY.md](../SECURITY.md) - Documentation de sécurité

### Liens externes

- [Electron Documentation](https://electronjs.org/docs)
- [React Documentation](https://react.dev)
- [Material-UI Documentation](https://mui.com)
- [Vite Documentation](https://vitejs.dev)
- [Recharts Documentation](https://recharts.org)

## 📄 Licence

Ce projet est sous licence **Creative Commons Attribution-NonCommercial 4.0 International (CC BY-NC 4.0)**.

Voir [LICENSE](../LICENSE) pour les détails.

---

**Développé par** : [Cyberprevs](https://cyberprevs.com)
**Version** : 1.0.0
**Dernière mise à jour** : Décembre 2024
