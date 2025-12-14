# 🚀 PII Scanner - Guide d'Utilisation Complet

## ✅ Application Terminée !

Votre application **PII Scanner** avec interface Electron + React + .NET est **100% fonctionnelle** ! 🎉

---

## 📦 Ce qui a été créé

### **Architecture complète**

```
MVP-PII-Scanner/
├── PiiScanner.Core/          # Bibliothèque de logique métier
├── PiiScanner.Api/           # API REST + SignalR
├── PiiScanner/               # Application console (original)
├── pii-scanner-ui/           # Interface Electron + React
│   ├── electron/
│   │   ├── main.ts          # Process principal Electron
│   │   └── preload.ts       # Preload script
│   ├── src/
│   │   ├── components/
│   │   │   ├── Dashboard.tsx    # Page principale
│   │   │   └── Results.tsx      # Résultats avec graphiques
│   │   ├── services/
│   │   │   └── apiClient.ts     # Client API + SignalR
│   │   ├── types/
│   │   │   └── index.ts         # Types TypeScript
│   │   ├── App.tsx              # Application React
│   │   └── main.tsx             # Entry point
│   └── package.json
└── PiiScanner.sln
```

### **Fonctionnalités implémentées**

✅ **Backend (.NET 8)**
- API REST avec 5 endpoints
- SignalR pour temps réel
- Scan parallèle multi-thread
- 4 formats de rapports (CSV, JSON, HTML, Excel)
- Détection de 11 types de PII

✅ **Frontend (React + Material-UI)**
- Interface moderne en mode sombre
- Sélection de dossier
- Barre de progression temps réel
- Graphiques interactifs (barres + camembert)
- Tableau des détections
- Téléchargement des rapports

✅ **Electron**
- Démarrage automatique de l'API
- Dialogue de sélection de dossier natif
- Packaging Windows avec installeur

---

## 🎮 Comment utiliser l'application

### **Mode Développement**

#### **Terminal 1 - Démarrer l'API** :
```bash
cd c:\Users\samir\OneDrive\Desktop\MVP-PII-Scanner\PiiScanner.Api
dotnet run
```

Vous devriez voir :
```
info: Microsoft.Hosting.Lifetime[14]
      Now listening on: http://localhost:5000
```

#### **Terminal 2 - Démarrer l'interface** :
```bash
cd c:\Users\samir\OneDrive\Desktop\MVP-PII-Scanner\pii-scanner-ui
npm run electron:dev
```

L'application s'ouvrira automatiquement !

---

### **Utilisation de l'application**

#### **1. Page d'accueil (Dashboard)**
```
┌─────────────────────────────────────────┐
│  Scanner de Données Personnelles (PII) │
│                                         │
│  Dossier: [________________] [Browse]  │
│                                         │
│  [▶ Démarrer le Scan]                  │
└─────────────────────────────────────────┘
```

**Actions:**
1. Cliquez sur **"Parcourir"** pour sélectionner un dossier
2. Ou collez directement le chemin dans le champ
3. Cliquez sur **"Démarrer le Scan"**

#### **2. Pendant le scan**
```
┌─────────────────────────────────────────┐
│  Scan en cours...                       │
│                                         │
│  67%                   3420 PII         │
│  1245/1850 fichiers    détectées        │
│  ━━━━━━━━━━━━━━━━━━━━                  │
└─────────────────────────────────────────┘
```

**Informations affichées:**
- Pourcentage de progression
- Fichiers traités / Total
- Nombre de PII détectées en temps réel
- Barre de progression animée

#### **3. Résultats**
```
┌─────────────────────────────────────────┐
│  1338         445        4563      7    │
│  Fichiers    Avec PII   Détectées Types │
│─────────────────────────────────────────│
│  [Nouveau] [CSV] [JSON] [HTML] [Excel] │
│─────────────────────────────────────────│
│  📊 Graphiques                          │
│  [Graphique en barres]                  │
│  [Camembert]                            │
│─────────────────────────────────────────│
│  ⚠️ Fichiers à risque                   │
│  🔴 ÉLEVÉ  file1.pdf  45 PII           │
│─────────────────────────────────────────│
│  🔍 Détections (tableau)                │
└─────────────────────────────────────────┘
```

**Actions disponibles:**
- **Nouveau Scan** : Recommencer un nouveau scan
- **CSV / JSON / HTML / Excel** : Télécharger les rapports
- **Onglets** : Visualiser graphiques, fichiers à risque, détections

---

## 📊 Types de PII détectés

| Icône | Type | Exemples |
|-------|------|----------|
| ✉️ | Email | user@example.com |
| 📞 | Téléphone FR | +33 6 12 34 56 78 |
| 📞 | Téléphone BJ | +229 97 12 34 56 |
| 💳 | Carte bancaire | 4532 1234 5678 9012 |
| 🏦 | IBAN France | FR76 1234 5678 9012 3456 7890 123 |
| 🏦 | IBAN Bénin | BJ66 12345678901234567890 |
| 🆔 | Numéro Sécu | 1 89 05 49 588 157 80 |
| 🏛️ | Numéro Fiscal FR | 1234567891234 |
| 🏛️ | IFU Bénin | 0123456789123 |
| 📅 | Date naissance | 15/03/1985 |
| 🌐 | Adresse IP | 192.168.1.1 |

---

## 📥 Formats de rapports

### **1. CSV** - Pour Excel/Google Sheets
```csv
Fichier;Type;Valeur
C:\docs\file.pdf;Email;user@example.com
```

### **2. JSON** - Pour intégration API
```json
{
  "metadata": {
    "scanDate": "2025-12-14T16:30:00",
    "totalFilesScanned": 1338
  },
  "statistics": {...},
  "detections": [...]
}
```

### **3. HTML** - Rapport visuel interactif
- Graphiques colorés
- Tableaux filtrables
- Design moderne

### **4. Excel** - Analyse avancée
- **Feuille 1** : Statistiques
- **Feuille 2** : Fichiers à risque
- **Feuille 3** : Détections (avec filtres Excel)

---

## 🏗️ Mode Production - Créer l'installeur Windows

### **Étape 1 : Compiler l'API en Release**
```bash
cd c:\Users\samir\OneDrive\Desktop\MVP-PII-Scanner\PiiScanner.Api
dotnet publish -c Release -r win-x64 --self-contained -o bin/Release/net8.0/publish
```

### **Étape 2 : Compiler l'interface React**
```bash
cd c:\Users\samir\OneDrive\Desktop\MVP-PII-Scanner\pii-scanner-ui
npm run build
```

### **Étape 3 : Compiler Electron TypeScript**
```bash
npm run build:electron
```

### **Étape 4 : Générer l'installeur Windows**
```bash
npm run electron:build:win
```

**Résultat** : L'installeur sera dans `pii-scanner-ui/release/`

Fichier généré : `PII Scanner Setup 1.0.0.exe` (~200-300 MB)

---

## 🎨 Captures d'écran de l'interface

### Dashboard
- En-tête avec gradient violet
- Card de présentation avec badges PII
- Sélecteur de dossier
- Bouton "Démarrer le Scan" avec gradient
- Features : Parallèle / Local / 4 formats

### Scan en cours
- Carte avec progression
- Pourcentage géant
- Barre de progression animée
- Compteurs temps réel

### Résultats
- 4 cartes de statistiques colorées
- Boutons de téléchargement des rapports
- 3 onglets :
  - Graphiques (barres + camembert)
  - Fichiers à risque (tableau avec chips)
  - Détections (tableau détaillé)

---

## 🐛 Résolution de problèmes

### **L'API ne démarre pas**
```bash
# Vérifier que le port 5000 est libre
netstat -ano | findstr :5000

# Tuer le processus si nécessaire
taskkill /PID <PID> /F
```

### **Electron ne se connecte pas à l'API**
1. Vérifier que l'API tourne sur `http://localhost:5000`
2. Ouvrir DevTools (F12) et vérifier la console
3. Vérifier les logs SignalR

### **Erreur lors de la compilation**
```bash
# Nettoyer et réinstaller
cd pii-scanner-ui
rm -rf node_modules package-lock.json
npm install
```

### **L'installeur ne se génère pas**
1. Vérifier que l'API est bien publiée dans `PiiScanner.Api/bin/Release/net8.0/publish`
2. Vérifier le fichier `package.json` section `"build"`
3. Installer Windows SDK si nécessaire

---

## 📝 Scripts npm disponibles

| Script | Description |
|--------|-------------|
| `npm run dev` | Vite dev server seul |
| `npm run electron:dev` | Electron + Vite en dev |
| `npm run build` | Build React uniquement |
| `npm run build:electron` | Compile TypeScript Electron |
| `npm run electron:build` | Build complet + installeur |
| `npm run electron:build:win` | Build Windows uniquement |

---

## 🔐 Sécurité et confidentialité

✅ **100% Local**
- Aucune donnée envoyée sur internet
- Traitement entièrement local
- API locale uniquement (localhost:5000)

✅ **Données sécurisées**
- Rapports stockés temporairement
- Nettoyage automatique après consultation
- Pas de logs des PII détectées

✅ **CORS restreint**
- API accessible uniquement depuis Electron
- Protection contre les accès externes

---

## 🎯 Cas d'usage

### **1. Audit RGPD**
```bash
# Scanner avant mise en conformité
1. Sélectionner le dossier des documents
2. Lancer le scan
3. Télécharger le rapport Excel
4. Analyser les fichiers à risque ÉLEVÉ
```

### **2. Migration de données**
```bash
# Vérifier les données avant migration
1. Scanner le dossier source
2. Identifier les PII
3. Planifier l'anonymisation
```

### **3. Archivage sécurisé**
```bash
# Classifier les documents sensibles
1. Scanner les archives
2. Télécharger le rapport HTML
3. Trier par niveau de risque
```

---

## 📞 Support et maintenance

### **Logs**
- **API** : Console du terminal 1
- **Frontend** : DevTools (F12) → Console
- **Electron** : Fichiers de log dans `%APPDATA%\pii-scanner-ui\logs\`

### **Mise à jour de l'application**
1. Modifier le code source
2. Recompiler : `dotnet build` et `npm run build`
3. Regénérer l'installeur : `npm run electron:build:win`
4. Incrémenter la version dans `package.json`

---

## 🎉 Félicitations !

Votre application **PII Scanner** est **100% opérationnelle** avec :

✅ Interface graphique moderne (React + Material-UI)
✅ Backend performant (.NET 8 + SignalR)
✅ Application installable sur Windows (Electron)
✅ 11 types de PII détectés
✅ 4 formats de rapports
✅ Temps réel avec SignalR
✅ Graphiques interactifs
✅ 100% local et sécurisé

**Prêt à utiliser pour la conformité RGPD !** 🔒

---

**Développé avec ❤️ pour la protection des données personnelles**
