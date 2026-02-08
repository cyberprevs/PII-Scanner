# Guide de Développement - PII Scanner

Ce guide contient toutes les informations nécessaires pour développer et déboguer l'application PII Scanner.

## Table des matières

- [Configuration de l'environnement](#configuration-de-lenvironnement)
- [Commandes de développement](#commandes-de-développement)
- [Architecture technique](#architecture-technique)
- [Problèmes courants et solutions](#problèmes-courants-et-solutions)
- [Checklist de dépannage](#checklist-de-dépannage)

## Configuration de l'environnement

### Prérequis

- **.NET 9.0 SDK** : https://dotnet.microsoft.com/download/dotnet/9.0
- **Node.js 18+** : https://nodejs.org/
- **Git** : https://git-scm.com/

### Installation

```bash
# Cloner le repository
git clone https://github.com/cyberprevs/pii-scanner.git
cd pii-scanner

# Installer les dépendances frontend
cd pii-scanner-ui
npm install
cd ..

# Configurer le certificat HTTPS (obligatoire)
dotnet dev-certs https --trust
```

## Commandes de développement

### Backend (.NET API)

```bash
# Démarrer l'API en mode développement
cd PiiScanner.Api
dotnet run
# → API disponible sur https://localhost:5001

# Sur Windows si dotnet pas dans le PATH:
"C:\Program Files\dotnet\dotnet.exe" run

# Lancer les tests
dotnet test                              # Tous les tests
dotnet test PiiScanner.Core.Tests        # Tests Core uniquement
dotnet test PiiScanner.Api.Tests         # Tests API uniquement

# Build release
dotnet publish -c Release -r win-x64 --self-contained true -o output/
```

### Frontend (React + Vite)

```bash
# Démarrer le serveur de développement
cd pii-scanner-ui
npm run dev
# → Frontend disponible sur http://127.0.0.1:3000 (ou 3001, 3002 si occupé)

# Lancer les tests
npm run test:run                # Tests unitaires
npm run test:coverage           # Tests avec couverture

# Build de production
npm run build                   # → Génère dist/

# Linter
npm run lint
```

### Build complet (Frontend + Backend)

```powershell
# Windows PowerShell - Build standalone complet
.\build-standalone-release.ps1

# Ou manuellement:
cd pii-scanner-ui
npm install && npm run build
xcopy /E /I dist ..\PiiScanner.Api\wwwroot
cd ..\PiiScanner.Api
dotnet run
```

## Architecture technique

### Backend (.NET 9.0)

```
PiiScanner.Api/
├── Controllers/        # Endpoints REST (8 controllers)
├── Hubs/              # SignalR pour temps réel
├── Services/          # Logique métier
├── Data/              # Entity Framework DbContext
├── Models/            # Entités de base de données
├── DTOs/              # Data Transfer Objects
├── Middleware/        # CSRF, Auth, etc.
└── wwwroot/           # Build React (en production)
```

**Technologies clés** :
- ASP.NET Core Web API
- Entity Framework Core
- SQLite + SQLCipher (AES-256)
- JWT Authentication
- SignalR WebSocket

### Frontend (React 19 + TypeScript)

```
pii-scanner-ui/src/
├── components/
│   ├── Layout/        # Sidebar, TopBar
│   └── pages/         # 17 pages de l'application
├── contexts/          # React Context (Auth)
├── services/          # API client + SignalR
└── types/             # Définitions TypeScript
```

**Technologies clés** :
- React 19
- TypeScript 5.9
- Material-UI v7
- Vite (build tool)
- Recharts (graphiques)

### Configuration TypeScript importante

Le projet utilise `verbatimModuleSyntax: false` dans `tsconfig.app.json`. **Ne pas changer cette valeur** car elle est nécessaire pour les imports de modules.

### Configuration CORS en développement

L'API doit autoriser les requêtes depuis le frontend Vite. Configuration dans `PiiScanner.Api/Program.cs` :

```csharp
// Autour de la ligne 127-141
builder.Services.AddCors(options =>
{
    options.AddPolicy("DevCorsPolicy", policy =>
    {
        policy.WithOrigins(
            "http://localhost:3000",
            "http://127.0.0.1:3000",
            "http://localhost:3001",     // Ajouté si Vite utilise 3001
            "http://127.0.0.1:3001",
            "https://localhost:5173",
            "http://localhost:5173"
        )
        .AllowAnyHeader()
        .AllowAnyMethod()
        .AllowCredentials();
    });
});
```

## Problèmes courants et solutions

### 1. Erreurs CORS

**Symptôme** :
```
Access to XMLHttpRequest at 'https://localhost:5001/api/...' from origin 'http://127.0.0.1:3001'
has been blocked by CORS policy: No 'Access-Control-Allow-Origin' header is present
```

**Cause** : Le port utilisé par Vite n'est pas autorisé dans la configuration CORS de l'API.

**Solution** :
1. Vérifiez le port utilisé par Vite (affiché dans le terminal)
2. Ajoutez ce port dans `PiiScanner.Api/Program.cs` (section DevCorsPolicy)
3. Redémarrez l'API : `dotnet run`

### 2. Erreurs d'import TypeScript

**Symptôme** :
```
The requested module '/src/types/index.ts' does not provide an export named 'ScanResultResponse'
```

**Causes possibles** :
- `verbatimModuleSyntax` configuré à `true`
- Cache Vite corrompu
- Problème de syntaxe dans le fichier types

**Solution** :
```bash
# 1. Vérifier tsconfig.app.json
cat pii-scanner-ui/tsconfig.app.json | grep verbatimModuleSyntax
# Doit afficher: "verbatimModuleSyntax": false

# 2. Nettoyer le cache Vite
cd pii-scanner-ui
rm -rf node_modules/.vite dist
npm run dev

# 3. Hard refresh navigateur: Ctrl+Shift+R
```

### 3. Certificat HTTPS non approuvé

**Symptôme** :
- Le navigateur affiche "Your connection is not private"
- Erreurs de connexion SignalR
- Échecs des requêtes API

**Solution** :
```bash
# Faire confiance au certificat de développement .NET
dotnet dev-certs https --trust

# Si ça ne fonctionne pas, régénérer :
dotnet dev-certs https --clean
dotnet dev-certs https --trust
```

### 4. Version .NET incorrecte

**Symptôme** :
```
You must install or update .NET to run this application.
Framework: 'Microsoft.NETCore.App', version '8.0.0' not found
```

**Cause** : Le projet a été mis à jour vers .NET 9.0 mais .NET 8.0 est référencé quelque part.

**Solution** :
```bash
# 1. Installer .NET 9.0 SDK
# Télécharger: https://dotnet.microsoft.com/download/dotnet/9.0

# 2. Vérifier l'installation
dotnet --version
# Doit afficher: 9.0.xxx

# 3. Vérifier tous les .csproj
grep -r "TargetFramework" --include="*.csproj"
# Tous doivent avoir: <TargetFramework>net9.0</TargetFramework>

# 4. Nettoyer et rebuild
dotnet clean
dotnet build
```

### 5. Page blanche / écran blanc

**Causes possibles** :
- Erreur TypeScript empêchant le chargement
- API inaccessible
- Problème de routage React

**Solution - Diagnostic** :
1. **Ouvrir DevTools** (F12) → onglet Console
2. **Vérifier les erreurs** JavaScript/TypeScript
3. **Onglet Network** → Vérifier les requêtes API
4. **Vérifier que l'API tourne** : accéder à https://localhost:5001/swagger

**Solution - Actions** :
```bash
# Si erreurs TypeScript:
cd pii-scanner-ui
rm -rf node_modules/.vite dist
npm run dev

# Si API inaccessible:
cd PiiScanner.Api
dotnet run

# Vérifier CORS si API démarre mais requêtes échouent
```

### 6. Port Vite déjà utilisé

**Symptôme** :
```
Port 3000 is in use, trying another one...
✓ ready in 563 ms
➜ Local: http://127.0.0.1:3001/
```

**Solution** : C'est un comportement normal. Vite essaie automatiquement les ports 3001, 3002, etc.

**Action requise** :
1. Noter le port affiché (ex: 3001)
2. Ajouter ce port dans CORS (voir section CORS ci-dessus)
3. Redémarrer l'API

**Alternative** - Libérer le port 3000 :
```bash
# Windows - Trouver le processus
netstat -ano | findstr :3000
# Noter le PID puis:
taskkill /F /PID <PID>

# Linux/Mac
lsof -ti:3000 | xargs kill -9
```

### 7. Hot Module Replacement (HMR) ne fonctionne pas

**Symptômes** :
- Les modifications ne sont pas reflétées automatiquement
- Besoin de rafraîchir manuellement

**Solutions** :
1. Utiliser l'URL exacte affichée par Vite (127.0.0.1 et non localhost)
2. Vérifier que le pare-feu ne bloque pas le port
3. Hard refresh : Ctrl+Shift+R
4. Redémarrer Vite

### 8. Erreur "dotnet: command not found"

**Symptôme** :
```bash
dotnet run
# bash: dotnet: command not found
```

**Cause** : .NET SDK pas installé ou pas dans le PATH.

**Solution Windows** :
```bash
# Utiliser le chemin complet
"C:\Program Files\dotnet\dotnet.exe" run

# Ou ajouter au PATH système:
# Paramètres → Système → Paramètres avancés → Variables d'environnement
# Ajouter: C:\Program Files\dotnet
```

**Solution Linux/Mac** :
```bash
# Installer .NET SDK via package manager
# Ubuntu/Debian:
sudo apt-get install -y dotnet-sdk-9.0

# macOS:
brew install dotnet
```

### 9. Base de données corrompue

**Symptôme** :
```
SQLite Error: database disk image is malformed
```

**Solution** :
```bash
cd PiiScanner.Api

# Supprimer la base de données (ATTENTION: perte de données!)
rm piiscanner.db piiscanner.db-shm piiscanner.db-wal

# Supprimer la clé de chiffrement (elle sera régénérée)
rm db_encryption.key

# Redémarrer l'API
dotnet run
```

**Note** : Vous devrez recréer le compte administrateur.

### 10. Erreurs de build npm

**Symptôme** :
```
npm ERR! code ELIFECYCLE
npm ERR! errno 1
```

**Solution** :
```bash
cd pii-scanner-ui

# Nettoyer complètement
rm -rf node_modules package-lock.json

# Réinstaller
npm install

# Si l'erreur persiste, vérifier Node.js
node --version  # Doit être 18+
npm --version
```

## Checklist de dépannage

Avant de chercher de l'aide, vérifiez :

### Environnement
- [ ] .NET 9.0 SDK installé : `dotnet --version` → 9.0.xxx
- [ ] Node.js 18+ installé : `node --version` → v18+
- [ ] Git installé : `git --version`

### Dépendances
- [ ] Dépendances npm installées : `cd pii-scanner-ui && npm install`
- [ ] Pas d'erreurs lors de `npm install`

### Configuration
- [ ] Certificat HTTPS approuvé : `dotnet dev-certs https --trust`
- [ ] `tsconfig.app.json` a `verbatimModuleSyntax: false`
- [ ] CORS inclut le bon port dans `Program.cs`

### Serveurs
- [ ] API démarrée : `cd PiiScanner.Api && dotnet run`
- [ ] API accessible : https://localhost:5001/swagger
- [ ] Frontend démarré : `cd pii-scanner-ui && npm run dev`
- [ ] Frontend accessible : http://127.0.0.1:3000 (ou port affiché)

### Navigateur
- [ ] DevTools ouvert (F12)
- [ ] Aucune erreur dans Console
- [ ] Requêtes API réussissent (onglet Network)
- [ ] Hard refresh effectué (Ctrl+Shift+R)

## Tests

### Tests Backend

```bash
# Tous les tests
dotnet test

# Tests avec couverture
dotnet test /p:CollectCoverage=true /p:CoverageReportFormat=html

# Tests d'un projet spécifique
dotnet test PiiScanner.Core.Tests
```

### Tests Frontend

```bash
cd pii-scanner-ui

# Tests unitaires
npm run test:run

# Tests avec watch mode
npm run test

# Tests avec couverture
npm run test:coverage
```

## Swagger UI

En mode développement, Swagger UI est disponible pour tester l'API :
- **URL** : https://localhost:5001/swagger
- **Note** : Disponible uniquement en développement

## Logging et Debugging

### Backend
```bash
# Logs détaillés
$env:ASPNETCORE_ENVIRONMENT="Development"  # Windows
export ASPNETCORE_ENVIRONMENT=Development   # Linux/Mac

dotnet run --verbosity detailed
```

### Frontend
```bash
# Mode debug Vite
npm run dev -- --debug

# Logs SignalR
# Dans services/apiClient.ts, décommenter:
# .configureLogging(LogLevel.Debug)
```

## Ressources

### Documentation
- [README.md](README.md) - Aperçu du projet
- [INSTALLATION.md](INSTALLATION.md) - Guide d'installation
- [SECURITY.md](SECURITY.md) - Sécurité et conformité
- [CONTRIBUTING.md](CONTRIBUTING.md) - Guide de contribution

### Liens externes
- [Documentation .NET](https://docs.microsoft.com/dotnet/)
- [Documentation React](https://react.dev/)
- [Documentation Vite](https://vitejs.dev/)
- [Documentation Material-UI](https://mui.com/)

## Support

Si vous rencontrez un problème non documenté ici :
1. Consultez les [Issues GitHub](https://github.com/cyberprevs/pii-scanner/issues)
2. Créez une nouvelle issue avec :
   - Description du problème
   - Steps to reproduce
   - Logs d'erreur
   - Environnement (OS, versions)

---

**Développé par** [Cyberprevs](https://cyberprevs.fr)
**Dernière mise à jour** : Février 2026
