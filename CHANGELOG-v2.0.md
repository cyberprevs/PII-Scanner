# Changelog - Version 2.0 (Application Web)

## 🎉 Version 2.0.0 - 27 Décembre 2025

### 🔄 Changement Majeur : Migration Electron → Application Web

L'application PII Scanner a été complètement refactorisée pour passer d'une application Electron à une application web pure.

---

## ✨ Nouvelles Fonctionnalités

### Architecture

- ✅ **Application web unifiée** : Un seul exécutable sert à la fois l'API et l'interface React
- ✅ **Pas de CORS** : Frontend et backend sur la même origine
- ✅ **SPA Routing** : Support complet de React Router côté serveur
- ✅ **Auto-détection env** : URLs relatives en production, absolues en développement

### Build & Déploiement

- ✅ **BuildWebApp.ps1** : Script automatisé complet (build React + publish .NET)
- ✅ **Package simplifié** : ~124 MB (vs 196 MB avant)
- ✅ **Déploiement facile** : Copier un dossier, lancer un .bat, c'est tout
- ✅ **Pas de certificat requis** : Fini les problèmes Windows SmartScreen

### Développement

- ✅ **Hot reload** : Support Vite dev server optionnel pour développement
- ✅ **Debugging simplifié** : DevTools navigateur + debugger .NET
- ✅ **Build rapide** : Compilation plus rapide qu'Electron Builder

---

## 🗑️ Suppressions

### Fichiers supprimés

```
❌ pii-scanner-ui/electron/          (dossier complet)
❌ pii-scanner-ui/electron-builder.yml
❌ pii-scanner-ui/dist-electron/
❌ pii-scanner-ui/release/
❌ LISEZMOI-PORTABLE.txt
```

### Fichiers archivés → `_archived/`

```
📦 Scripts/ → _archived/Scripts-Electron-CodeSigning/
   ├── CreateCertificate.ps1
   ├── SignExecutables.ps1
   ├── BuildAndSignPortable.ps1
   ├── InstallCertificate.bat
   └── README.md
```

### Dépendances npm supprimées

```json
❌ "electron": "^39.2.7"
❌ "electron-builder": "^26.0.12"
❌ "concurrently": "^9.2.1"
❌ "cross-env": "^10.1.0"
❌ "wait-on": "^9.0.3"
```

### Scripts npm supprimés

```json
❌ "electron:dev"
❌ "electron:build"
❌ "electron:build:win"
❌ "build:electron"
```

---

## 📝 Fichiers Modifiés

### Code Source

| Fichier | Changements |
|---------|-------------|
| `PiiScanner.Api/Program.cs` | + Static files serving<br>+ SPA fallback routing<br>- CORS configuration |
| `pii-scanner-ui/src/services/axios.ts` | + Auto-détection dev/prod pour baseURL |
| `pii-scanner-ui/src/services/apiClient.ts` | + Auto-détection dev/prod pour SignalR |
| `pii-scanner-ui/src/App.tsx` | + Fix reload après setup (window.location.reload) |
| `pii-scanner-ui/package.json` | - Dépendances Electron<br>- Scripts Electron<br>+ Version 2.0.0 |

### Documentation

| Fichier | Changements |
|---------|-------------|
| `CLAUDE.md` | Refonte complète architecture web |
| `README.md` | Mise à jour Quick Start + build instructions |
| `.gitignore` | + wwwroot/<br>+ PII-Scanner-WebApp/<br>+ _archived/<br>- Références Electron |
| **NOUVEAU** `BuildWebApp.ps1` | Script de build automatisé |
| **NOUVEAU** `MIGRATION-WEB.md` | Guide de migration |
| **NOUVEAU** `CHANGELOG-v2.0.md` | Ce fichier |

---

## 🔧 Modifications Techniques

### Backend (.NET)

**PiiScanner.Api/Program.cs**

```csharp
// AJOUTÉ
app.UseDefaultFiles();           // Sert index.html pour /
app.UseStaticFiles();            // Sert wwwroot/*
app.MapFallbackToFile("index.html"); // SPA routing

// SUPPRIMÉ
// app.UseCors("AllowElectron");
```

### Frontend (React)

**axios.ts & apiClient.ts**

```typescript
// AVANT
baseURL: 'https://localhost:5001/api'

// MAINTENANT
baseURL: import.meta.env.DEV ? 'https://localhost:5001/api' : '/api'
```

**App.tsx - Fix setup**

```typescript
// AVANT
onSetupComplete={() => {
  setIsInitialized(true);
  // ... code complexe de re-render
}}

// MAINTENANT
onSetupComplete={() => {
  window.location.reload(); // Simple et efficace
}}
```

---

## 📊 Comparaison Avant/Après

| Critère | v1.x (Electron) | v2.0 (Web) |
|---------|----------------|------------|
| **Taille** | 196 MB | 124 MB (-37%) |
| **Exécutables** | 2 | 1 |
| **Certificat** | Requis | ❌ Non |
| **CORS** | Configuré | ❌ Non nécessaire |
| **Build time** | ~2-3 min | ~1 min |
| **Navigateurs** | Chromium | Tous |
| **Déploiement** | Certificat + 2 exe | Copier dossier |
| **Hot Reload** | Limité | ✅ Complet |
| **Debugging** | Complexe | ✅ Simple |

---

## 🚀 Migration pour Développeurs

### Ancien workflow (Electron)

```bash
# Build
npm run electron:build:win

# Problèmes fréquents
- Certificat code signing requis
- Windows SmartScreen bloque
- 2 exécutables à gérer
- CORS à configurer
```

### Nouveau workflow (Web)

```bash
# Build
.\BuildWebApp.ps1

# Avantages
✅ Aucun certificat
✅ Pas de SmartScreen
✅ 1 seul exécutable
✅ Pas de CORS
```

---

## 📦 Structure du Package

### Avant (Electron)

```
PII-Scanner-Portable-Complete/
├── API/
│   └── PiiScanner.Api.exe          (80 MB)
├── UI/
│   └── PII Scanner.exe              (116 MB)
├── InstallCertificate.bat
├── PiiScannerCodeSigning.cer
└── Demarrer PII Scanner.bat
Total: ~196 MB
```

### Maintenant (Web)

```
PII-Scanner-WebApp/
├── PiiScanner.Api.exe               (124 MB, tout-en-un)
├── wwwroot/
│   ├── index.html
│   └── assets/
├── appsettings.json
├── piiscanner.db (créé au démarrage)
└── Demarrer PII Scanner.bat
Total: ~124 MB
```

---

## ⚡ Performance

### Amélioration du temps de build

| Étape | v1.x (Electron) | v2.0 (Web) |
|-------|----------------|------------|
| Build React | 10s | 10s |
| Build Electron | 45s | - |
| Publish .NET | 30s | 30s |
| Sign executables | 15s | - |
| Package ZIP | 10s | 5s |
| **TOTAL** | **~110s** | **~45s** |

### Amélioration du temps de démarrage

| Action | v1.x | v2.0 |
|--------|------|------|
| Start API | 3s | 3s |
| Start UI (Electron) | 5s | - |
| Open browser | - | 1s |
| **TOTAL** | **8s** | **4s** |

---

## 🐛 Bugs Corrigés

### v2.0.0

1. ✅ **Page blanche après création compte admin**
   - **Avant** : Page blanche, nécessitait redémarrage manuel
   - **Fix** : `window.location.reload()` dans `onSetupComplete`
   - **Fichier** : `pii-scanner-ui/src/App.tsx:179`

2. ✅ **Problèmes CORS en production**
   - **Avant** : Configuration CORS complexe, erreurs fréquentes
   - **Fix** : Plus de CORS nécessaire (même origine)
   - **Fichier** : `PiiScanner.Api/Program.cs`

3. ✅ **Windows SmartScreen bloque l'application**
   - **Avant** : Utilisateurs bloqués, nécessite installation certificat
   - **Fix** : Application web, pas de certificat requis
   - **Impact** : Plus aucun problème SmartScreen

---

## 🔮 Prochaines Étapes Possibles

### Court terme
- [ ] Créer release GitHub avec ZIP web app
- [ ] Tester sur Windows Server
- [ ] Ajouter script d'installation service Windows

### Moyen terme
- [ ] Support multi-langues (EN/FR)
- [ ] Mode offline complet (service worker)
- [ ] Thème clair en plus du thème sombre

### Long terme
- [ ] Dockerisation
- [ ] Support Linux/macOS
- [ ] API publique pour intégrations tierces

---

## 📚 Documentation Mise à Jour

Tous les documents suivants ont été mis à jour pour v2.0 :

- ✅ `CLAUDE.md` - Architecture technique complète
- ✅ `README.md` - Guide utilisateur
- ✅ `.gitignore` - Règles d'exclusion
- ✅ `MIGRATION-WEB.md` - Guide de migration
- ✅ `CHANGELOG-v2.0.md` - Ce fichier

---

## 🙏 Remerciements

Merci d'avoir suivi cette migration vers une architecture plus simple et plus maintenable !

**Questions ?** Consultez `MIGRATION-WEB.md` pour plus de détails.

---

**Version** : 2.0.0
**Date** : 27 Décembre 2025
**Type** : Major Release (Breaking Changes)
**Auteur** : Cyberprevs
