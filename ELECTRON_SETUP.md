# 🚀 PII Scanner - Application Electron + React + .NET

## ✅ Ce qui a été créé

### 1. **Backend (API .NET 8)**

#### Structure :
```
PiiScanner.sln
├── PiiScanner.Core/        # Bibliothèque de classes (logique métier)
│   ├── Analysis/           # Détection PII
│   ├── Models/             # Modèles de données
│   ├── Reader/             # Lecture de documents
│   ├── Reporting/          # Génération de rapports
│   └── Scanner/            # Scanner de fichiers
│
├── PiiScanner.Api/         # API REST + SignalR
│   ├── Controllers/
│   │   └── ScanController.cs      # Endpoints REST
│   ├── Hubs/
│   │   └── ScanHub.cs              # SignalR Hub (temps réel)
│   ├── Services/
│   │   └── ScanService.cs          # Logique de scan
│   ├── DTOs/
│   │   └── ScanRequest.cs          # Data Transfer Objects
│   └── Program.cs                  # Configuration API
│
└── PiiScanner/             # Application console (original)
```

#### Endpoints API créés :
- **POST** `/api/scan/start` - Démarrer un scan
- **GET** `/api/scan/{scanId}/progress` - Progression du scan
- **GET** `/api/scan/{scanId}/results` - Résultats du scan
- **GET** `/api/scan/{scanId}/report/{format}` - Télécharger rapport (csv/json/html/excel)
- **DELETE** `/api/scan/{scanId}` - Nettoyer les ressources

#### SignalR Hub :
- `ReceiveProgress` - Mise à jour de progression en temps réel
- `ScanComplete` - Notification de fin de scan
- `ScanError` - Notification d'erreur

---

### 2. **Frontend (React + TypeScript + Electron)**

#### Structure créée :
```
pii-scanner-ui/
├── electron/
│   ├── main.ts              # Process principal Electron
│   ├── preload.ts           # Preload script
│   └── tsconfig.json        # Config TypeScript pour Electron
│
├── src/
│   ├── types/
│   │   └── index.ts         # Types TypeScript
│   ├── services/
│   │   └── apiClient.ts     # Client API + SignalR
│   └── ... (à compléter)
│
└── package.json             # Dépendances + scripts
```

#### Packages installés :
- **React 19** + TypeScript
- **Electron 39** + Electron Builder
- **Material-UI** (composants UI)
- **SignalR Client** (temps réel)
- **Axios** (requêtes HTTP)
- **Recharts** (graphiques)

---

## 🎯 Prochaines étapes

### **Étape 4 : Créer les composants React**

Vous devez créer les composants suivants :

#### 4.1 **Dashboard.tsx** - Page principale
```tsx
// Contient :
// - Sélecteur de dossier
// - Bouton démarrer scan
// - Affichage de la progression
// - Statistiques en temps réel
```

#### 4.2 **ProgressBar.tsx** - Barre de progression
```tsx
// Affiche :
// - % de progression
// - Fichiers traités / total
// - PII trouvées en temps réel
```

#### 4.3 **Results.tsx** - Affichage des résultats
```tsx
// Affiche :
// - Tableau des PII détectées
// - Graphiques (répartition par type)
// - Fichiers à risque
```

#### 4.4 **Reports.tsx** - Téléchargement des rapports
```tsx
// Permet de :
// - Télécharger CSV, JSON, HTML, Excel
// - Prévisualiser le rapport HTML
```

---

## 🔧 Comment exécuter

### **Mode Développement**

#### Terminal 1 - Démarrer l'API :
```bash
cd c:\Users\samir\OneDrive\Desktop\MVP-PII-Scanner\PiiScanner.Api
dotnet run
```

#### Terminal 2 - Démarrer Electron + React :
```bash
cd c:\Users\samir\OneDrive\Desktop\MVP-PII-Scanner\pii-scanner-ui
npm run electron:dev
```

---

### **Mode Production - Générer l'installeur Windows**

#### Étape 1 : Publier l'API
```bash
cd c:\Users\samir\OneDrive\Desktop\MVP-PII-Scanner\PiiScanner.Api
dotnet publish -c Release -r win-x64 --self-contained
```

#### Étape 2 : Compiler Electron
```bash
cd c:\Users\samir\OneDrive\Desktop\MVP-PII-Scanner\pii-scanner-ui
npm run build:electron
```

#### Étape 3 : Générer l'installeur
```bash
npm run electron:build:win
```

L'installeur `.exe` sera généré dans `pii-scanner-ui/release/`

---

## 📁 Fichiers importants

### **Electron Main Process** (`electron/main.ts`)
- Démarre l'API .NET automatiquement
- Crée la fenêtre Electron
- Gère le dialogue de sélection de dossier
- Ferme proprement l'API à la sortie

### **API Client** (`src/services/apiClient.ts`)
- Connexion SignalR pour temps réel
- Méthodes pour appeler l'API
- Gestion des téléchargements de rapports

### **Types TypeScript** (`src/types/index.ts`)
- Interfaces pour toutes les données
- Types pour l'API Electron

---

## 🎨 Design de l'interface proposé

L'interface utilise **Material-UI** avec ce layout :

```
┌─────────────────────────────────────────────────┐
│  🔍 PII Scanner                    [_] [□] [×]  │
├─────────────────────────────────────────────────┤
│                                                 │
│  📁 Dossier : C:\Users\samir\Documents          │
│  [Browse...]                                    │
│                                                 │
│  ⚙️ Types de PII à détecter :                   │
│  ☑ Email  ☑ Téléphone  ☑ IBAN  ☑ Carte bancaire│
│                                                 │
│                 [▶ Démarrer le scan]            │
│                                                 │
│  ━━━━━━━━━━━━━━━━ 67% ━━━━━━━━━━━━━━━━━        │
│  1245/1850 fichiers • 3420 PII détectées       │
│                                                 │
├─────────────────────────────────────────────────┤
│  📊 Statistiques                   📄 Rapports  │
│  ┌────────────┐ ┌────────────┐                 │
│  │ Type  | #  │ │  [CSV]     │                 │
│  │ Email |638 │ │  [JSON]    │                 │
│  │ IP    |3750│ │  [HTML]    │                 │
│  │ ...        │ │  [Excel]   │                 │
│  └────────────┘ └────────────┘                 │
│                                                 │
│  [Graphique en barres - répartition des PII]   │
│                                                 │
└─────────────────────────────────────────────────┘
```

---

## 🐛 Débogage

### **Problèmes courants :**

#### 1. **L'API ne démarre pas**
- Vérifiez que le port 5000 est libre
- Vérifiez que .NET 8 SDK est installé

#### 2. **SignalR ne se connecte pas**
- Vérifiez les logs de la console
- Vérifiez que CORS est activé dans l'API

#### 3. **Electron ne trouve pas l'API**
- Vérifiez le chemin dans `electron/main.ts`
- En dev: `../../PiiScanner.Api/bin/Debug/net8.0/PiiScanner.Api.exe`

---

## 📝 Scripts npm disponibles

```bash
# Développement
npm run dev                 # Vite dev server uniquement
npm run electron:dev        # Electron + Vite en dev mode

# Build
npm run build               # Build React
npm run build:electron      # Compile TypeScript Electron
npm run electron:build      # Build complet + installeur
npm run electron:build:win  # Build Windows uniquement
```

---

## 🔐 Sécurité

- ✅ API locale uniquement (pas exposée sur internet)
- ✅ CORS configuré pour Electron uniquement
- ✅ Toutes les données traitées localement
- ✅ Rapports stockés temporairement puis nettoyés

---

## 📦 Distribution

L'installeur Windows généré :
- Taille : ~200-300 MB (inclut .NET runtime)
- Format : NSIS installer
- Options : Installation personnalisée, raccourcis Bureau/Menu Démarrer
- L'API est embarquée dans l'application

---

## 🎯 TODO avant la release

- [ ] Créer les composants React (Dashboard, Results, etc.)
- [ ] Ajouter une icône d'application (icon.ico)
- [ ] Tester le scan sur différents types de fichiers
- [ ] Optimiser la taille de l'installeur
- [ ] Ajouter des screenshots au README
- [ ] Créer un guide utilisateur

---

## 📞 Support

Pour toute question :
1. Vérifier les logs dans la console DevTools (F12)
2. Vérifier les logs de l'API dans le terminal
3. Consulter la documentation de Electron/SignalR

---

**Développé avec ❤️ pour la conformité RGPD**
