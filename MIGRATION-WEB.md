# Migration vers Application Web - Guide Complet

## ✅ Changements effectués

### Architecture

**Avant** : Application Electron avec API séparée
- 2 exécutables : `PiiScanner.Api.exe` + `PII Scanner.exe`
- Problèmes de certificat code signing
- Complexité CORS
- Taille : ~196 MB

**Maintenant** : Application Web unifiée
- 1 seul exécutable : `PiiScanner.Api.exe`
- Aucun certificat requis
- Pas de CORS (même origine)
- Taille : ~124 MB

### Fichiers modifiés

1. **PiiScanner.Api/Program.cs**
   - Ajout : `app.UseDefaultFiles()` et `app.UseStaticFiles()`
   - Ajout : `app.MapFallbackToFile("index.html")` pour SPA routing
   - Suppression : Configuration CORS (plus nécessaire)

2. **pii-scanner-ui/src/services/axios.ts**
   - `baseURL`: `/api` en production, `https://localhost:5001/api` en dev
   - Auto-détection dev vs prod via `import.meta.env.DEV`

3. **pii-scanner-ui/src/services/apiClient.ts**
   - SignalR URL : `/scanhub` en production, `https://localhost:5001/scanhub` en dev

4. **pii-scanner-ui/src/App.tsx**
   - Fix navigation après création compte admin : `window.location.reload()`

5. **CLAUDE.md**
   - Section architecture mise à jour
   - Section build portable remplacée par build web
   - Instructions de développement mises à jour

6. **.gitignore**
   - Ajout : `PiiScanner.Api/wwwroot/` (build React)
   - Ajout : `PII-Scanner-WebApp/` (package final)
   - Suppression : Références Electron

7. **README.md**
   - Mise à jour Quick Start
   - Instructions build web
   - Suppression références SmartScreen

### Nouveaux fichiers

1. **BuildWebApp.ps1**
   - Script automatisé de build complet
   - 4 étapes : Build React → Copie wwwroot → Publish API → Package
   - Crée dossier `PII-Scanner-WebApp/` prêt à distribuer

2. **PiiScanner.Api/wwwroot/** (créé par build)
   - `index.html`
   - `assets/index-[hash].js`
   - `assets/index-[hash].css`
   - `vite.svg`

## 🚀 Utilisation

### Pour développer

```bash
# Terminal 1 : API
cd PiiScanner.Api
dotnet run

# Terminal 2 (optionnel) : Hot reload React
cd pii-scanner-ui
npm run dev
```

Ouvrir : https://localhost:5001

### Pour compiler

```powershell
.\BuildWebApp.ps1
```

Résultat : `PII-Scanner-WebApp/` (~124 MB)

### Pour distribuer

```powershell
# Créer ZIP
Compress-Archive -Path PII-Scanner-WebApp\* -DestinationPath PII-Scanner-WebApp.zip

# Ou copier directement le dossier
```

Les utilisateurs :
1. Extraient le ZIP (ou copient le dossier)
2. Double-cliquent sur `Démarrer PII Scanner.bat`
3. Ouvrent leur navigateur sur https://localhost:5001
4. **C'est tout !** Pas de certificat, pas de problème Windows SmartScreen

## 📊 Comparaison

| Critère | Electron (Ancien) | Web App (Nouveau) |
|---------|-------------------|-------------------|
| **Taille** | 196 MB | 124 MB |
| **Exécutables** | 2 (API + UI) | 1 (API uniquement) |
| **Certificat** | Requis (SmartScreen) | Pas nécessaire |
| **Navigateur** | Chromium intégré | N'importe quel navigateur moderne |
| **CORS** | Configuration complexe | Pas de CORS (même origine) |
| **Updates** | Remplacer 2 .exe | Remplacer 1 .exe |
| **Déploiement** | Installer certificat | Copier et lancer |
| **Complexité** | Élevée | Faible |

## ✨ Avantages

1. **Simplicité** : Un seul exécutable à gérer
2. **Compatibilité** : Fonctionne avec n'importe quel navigateur
3. **Sécurité** : Pas de problème Windows SmartScreen
4. **Légèreté** : 72 MB de moins que Electron
5. **Maintenance** : Plus facile à maintenir et mettre à jour
6. **Déploiement** : Copier/coller, c'est tout

## 🔧 Développement

### Structure

```
PII-Scanner/
├── PiiScanner.Api/
│   ├── wwwroot/          ← Build React (ignoré par Git)
│   ├── Program.cs        ← Serve static files + API
│   └── ...
├── pii-scanner-ui/
│   ├── src/              ← Source React
│   ├── dist/             ← Build output (ignoré)
│   └── package.json
└── BuildWebApp.ps1       ← Script de build
```

### Workflow de développement

1. **Modifier le frontend** :
   ```bash
   cd pii-scanner-ui
   npm run dev    # Hot reload sur http://localhost:5173
   ```

2. **Modifier le backend** :
   ```bash
   cd PiiScanner.Api
   dotnet watch run    # Auto-reload
   ```

3. **Compiler pour production** :
   ```powershell
   .\BuildWebApp.ps1
   ```

### Debugging

- Frontend : DevTools du navigateur (F12)
- Backend : Visual Studio / VS Code / Rider
- SignalR : Onglet Network → WS (WebSocket)

## 📝 Notes importantes

1. **Premier lancement** : Créer compte admin obligatoire
2. **HTTPS** : Certificat auto-signé pour localhost (normal)
3. **Base de données** : Créée automatiquement au premier lancement
4. **Ports** : 5000 (HTTP) et 5001 (HTTPS)

## 🎯 Prochaines étapes possibles

- [ ] Créer une release GitHub avec le ZIP
- [ ] Ajouter un installateur Windows (optionnel)
- [ ] Dockeriser l'application
- [ ] Ajouter support Linux/macOS
- [ ] Créer un service Windows pour auto-démarrage

## ❓ FAQ

**Q : Puis-je encore utiliser Electron ?**
R : Le code Electron existe toujours mais n'est plus maintenu. L'approche web est plus simple.

**Q : L'application nécessite-t-elle Internet ?**
R : Non, 100% local. Seuls les fonts Google sont chargées (optionnel).

**Q : Puis-je accéder à l'app depuis un autre PC ?**
R : Actuellement configuré pour localhost uniquement. Modifier `Program.cs` pour permettre l'accès réseau.

**Q : Quid de la sécurité HTTPS ?**
R : Certificat auto-signé pour localhost. Pour production : utiliser un vrai certificat.

---

**Date de migration** : 27 décembre 2025
**Version** : 2.0 (Web App)
