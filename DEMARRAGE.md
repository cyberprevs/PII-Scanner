# Guide de Démarrage - PII Scanner

## 🚀 Méthodes pour démarrer l'API

### Méthode 1: Script Automatique avec Nettoyage (Recommandé)

Double-cliquez sur l'un de ces fichiers à la racine du projet:

- **`start-api-clean.bat`** - Pour Windows (simple double-clic)
- **`start-api-clean.ps1`** - Pour PowerShell (clic droit → Exécuter avec PowerShell)

**Ce que fait le script:**
✅ Tue automatiquement les processus dotnet existants
✅ Libère les ports 5000 et 5001
✅ Vérifie et installe le certificat HTTPS si nécessaire
✅ Démarre l'API sur https://localhost:5001

### Méthode 2: Depuis VS Code

1. Ouvrez le projet dans VS Code
2. Appuyez sur **Ctrl+Shift+B** (ou Terminal → Run Build Task)
3. Sélectionnez **"Clean & Start API"**

Ou utilisez la palette de commandes:
- **Ctrl+Shift+P** → "Tasks: Run Task" → "Clean & Start API"

Pour tuer l'API rapidement:
- **Ctrl+Shift+P** → "Tasks: Run Task" → "Kill API Processes"

### Méthode 3: Alias PowerShell (Après installation)

```powershell
# Installation unique (une seule fois)
.\install-alias.ps1

# Ensuite, depuis n'importe où dans PowerShell:
start-pii-api
```

### Méthode 4: Manuelle

```powershell
# Si le port est occupé, tuer les processus d'abord
taskkill /F /IM dotnet.exe

# Attendre 2 secondes
timeout /t 2

# Démarrer l'API
cd PiiScanner.Api
dotnet run
```

## 🔧 Résolution des Problèmes

### Erreur: "Address already in use" (Port 5001 occupé)

**Solution rapide:**
```powershell
# Tuer tous les processus dotnet
taskkill /F /IM dotnet.exe

# Ou trouver le processus sur le port spécifique
Get-NetTCPConnection -LocalPort 5001 | Select-Object -ExpandProperty OwningProcess | ForEach-Object { Stop-Process -Id $_ -Force }
```

### Erreur: "Certificat SSL invalide"

**Solution:**
```bash
dotnet dev-certs https --clean
dotnet dev-certs https --trust
```

### Le frontend ne se connecte pas

**Vérifications:**
1. L'API écoute sur **https://localhost:5001** (pas http://localhost:5000)
2. Le certificat HTTPS est installé et approuvé
3. Le frontend utilise la bonne URL dans `axios.ts` et `AuthContext.tsx`

## 📝 URLs Importantes

- **API (HTTPS):** https://localhost:5001
- **API (HTTP):** http://localhost:5000 (redirige vers HTTPS)
- **Swagger UI:** https://localhost:5001/swagger
- **Frontend (dev):** http://localhost:5173 (avec `npm run dev`)

## 🔐 Identifiants par Défaut

- **Username:** admin
- **Password:** Admin@123

## 💡 Conseils

- **Toujours utiliser le script de nettoyage** pour éviter les conflits de ports
- **Vérifier les logs** dans la console pour voir si l'API démarre correctement
- **Utiliser VS Code Tasks** pour un workflow plus rapide
- **Installer l'alias PowerShell** si vous démarrez souvent l'API

## 🛠️ Développement

### Démarrer le Frontend

```bash
cd pii-scanner-ui
npm run dev
```

### Builder le Frontend

```bash
cd pii-scanner-ui
npm run build
```

### Builder l'API pour Production

```bash
cd PiiScanner.Api
dotnet publish -c Release
```

## 📚 Documentation

- [CLAUDE.md](CLAUDE.md) - Architecture du projet
- [SECURITE_COMPLETE.md](SECURITE_COMPLETE.md) - Mesures de sécurité
- [CONFIGURATION_HTTPS.md](CONFIGURATION_HTTPS.md) - Configuration HTTPS détaillée
