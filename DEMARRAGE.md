# Guide de Démarrage - PII Scanner v2.0 (Application Web)

## 🚀 Démarrage Rapide

### Mode Production (Recommandé)

**Lancer l'application web complète :**

```powershell
# Build complet automatisé (React + API)
.\BuildWebApp.ps1

# Lancer l'application
cd PII-Scanner-WebApp
.\Demarrer PII Scanner.bat

# Ou directement
cd PII-Scanner-WebApp
.\PiiScanner.Api.exe
```

Ensuite, ouvrez votre navigateur sur : **https://localhost:5001**

---

### Mode Développement

#### Développement avec Hot Reload (Méthode 1 - Recommandée)

**Terminal 1 : API Backend**
```bash
cd PiiScanner.Api
dotnet run
```

**Terminal 2 : React avec Vite (optionnel, pour hot reload)**
```bash
cd pii-scanner-ui
npm run dev
```

- **API + React statique** : https://localhost:5001 (production-like)
- **Vite dev server** : http://localhost:5173 (avec hot reload)

#### Développement Production-Like (Méthode 2)

**Build React une fois, puis lancer l'API :**
```bash
# Build React
cd pii-scanner-ui
npm run build

# Copier vers wwwroot
xcopy /E /I dist ..\PiiScanner.Api\wwwroot

# Lancer API (sert React + API)
cd ..\PiiScanner.Api
dotnet run
```

Ouvrir : https://localhost:5001

---

## 🔧 Résolution des Problèmes

### Erreur: "Address already in use" (Port 5001 occupé)

**Solution rapide :**
```powershell
# Tuer tous les processus dotnet
taskkill /F /IM dotnet.exe

# Attendre 2 secondes
timeout /t 2

# Relancer l'API
cd PiiScanner.Api
dotnet run
```

### Erreur: "Certificat SSL invalide"

**Solution :**
```bash
dotnet dev-certs https --clean
dotnet dev-certs https --trust
```

### wwwroot/ vide ou manquant

**Problème** : L'API ne trouve pas les fichiers React

**Solution** :
```bash
# Build React
cd pii-scanner-ui
npm run build

# Copier vers wwwroot
# Windows
xcopy /E /I dist ..\PiiScanner.Api\wwwroot

# Linux/Mac
cp -r dist/* ../PiiScanner.Api/wwwroot/
```

### Le navigateur affiche "Cannot GET /"

**Problème** : Fichiers statiques non servis

**Solution** : Vérifier que `Program.cs` contient :
```csharp
app.UseDefaultFiles();
app.UseStaticFiles();
app.MapFallbackToFile("index.html");
```

---

## 📝 URLs Importantes

- **Application Web (HTTPS)** : https://localhost:5001
- **Application Web (HTTP)** : http://localhost:5000 (redirige vers HTTPS)
- **Swagger UI (dev uniquement)** : https://localhost:5001/swagger
- **Vite Dev Server (dev uniquement)** : http://localhost:5173

---

## 🔐 Premier Démarrage

**Aucun identifiant par défaut** - Pour des raisons de sécurité, vous devez créer le compte administrateur au premier lancement :

1. Ouvrez https://localhost:5001
2. Remplissez le formulaire de configuration initiale
3. Créez votre compte administrateur
4. L'application se recharge automatiquement
5. Connectez-vous avec vos identifiants

---

## 💡 Conseils

- **Production** : Utilisez `BuildWebApp.ps1` pour créer un package complet
- **Développement** : Utilisez `npm run dev` pour le hot reload React
- **Vérifier les logs** : Regardez la console pour voir si l'API démarre correctement
- **HTTPS obligatoire** : L'API redirige automatiquement HTTP → HTTPS

---

## 🛠️ Commandes Utiles

### Build & Deploy

```bash
# Build complet automatisé
.\BuildWebApp.ps1

# Build manuel React
cd pii-scanner-ui
npm run build

# Publish API (self-contained)
cd ..\PiiScanner.Api
dotnet publish -c Release -r win-x64 --self-contained true
```

### Développement

```bash
# Lancer API en mode watch (auto-reload)
cd PiiScanner.Api
dotnet watch run

# Lancer React dev server
cd pii-scanner-ui
npm run dev
```

### Nettoyage

```bash
# Nettoyer build React
cd pii-scanner-ui
rm -rf dist node_modules
npm install

# Nettoyer build .NET
cd PiiScanner.Api
dotnet clean
rm -rf wwwroot bin obj
```

---

## 📊 Structure de l'Application Web

```
PII-Scanner/
├── PiiScanner.Api/              # Backend + Serveur web
│   ├── wwwroot/                 # ← React build (index.html, assets/)
│   ├── Controllers/
│   ├── Services/
│   └── Program.cs               # Configuration serveur
├── pii-scanner-ui/              # Frontend React
│   ├── src/                     # Code source React
│   ├── dist/                    # Build output (copié vers wwwroot/)
│   └── package.json
└── BuildWebApp.ps1              # Script de build automatisé
```

---

## 📚 Documentation Complémentaire

- [CLAUDE.md](CLAUDE.md) - Architecture technique complète
- [INSTALLATION.md](INSTALLATION.md) - Guide d'installation détaillé
- [MIGRATION-WEB.md](MIGRATION-WEB.md) - Guide de migration Electron → Web
- [CHANGELOG-v2.0.md](CHANGELOG-v2.0.md) - Changelog de la version 2.0
- [SECURITY.md](SECURITY.md) - Mesures de sécurité
- [CONFIGURATION.md](CONFIGURATION.md) - Configuration avancée

---

## 🎯 Différences avec Electron (v1.x)

| Aspect | v1.x (Electron) | v2.0 (Web) |
|--------|-----------------|------------|
| **Démarrage** | 2 exe (API + UI) | 1 exe (API + navigateur) |
| **Build** | `npm run electron:build:win` | `.\BuildWebApp.ps1` |
| **Dev mode** | `npm run electron:dev` | `dotnet run` + `npm run dev` |
| **Hot reload** | Limité | ✅ Complet (Vite) |
| **Taille** | 196 MB | 124 MB |
| **Certificat** | Requis (SmartScreen) | ❌ Pas nécessaire |
| **CORS** | Configuré | ❌ Pas nécessaire |

---

**Version** : 2.0.0
**Date** : 27 décembre 2025
**Développé par** : [Cyberprevs](https://cyberprevs.com)
