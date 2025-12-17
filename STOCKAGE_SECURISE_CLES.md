# Stockage Sécurisé des Clés de Chiffrement

**Date** : 17 décembre 2025
**Version** : 1.1.1
**Amélioration** : Protection ACL NTFS pour le fichier de clé

---

## Vue d'ensemble

Le fichier `db_encryption.key` contenant la clé de chiffrement de 256 bits pour SQLCipher est maintenant protégé par des **Access Control Lists (ACL) NTFS restrictives** sur Windows.

---

## Protection Implémentée

### 1. Permissions NTFS (Windows)

Le fichier de clé est maintenant protégé avec des ACL qui :

✅ **Retirent TOUS les accès par défaut** (héritage désactivé)
✅ **Autorisent uniquement** :
  - L'utilisateur Windows qui exécute l'API
  - Le compte SYSTEM (requis pour certaines opérations système)

✅ **Bloquent** :
  - Tous les autres utilisateurs Windows
  - Le groupe "Everyone"
  - Le groupe "Utilisateurs"
  - Le groupe "Authenticated Users"
  - Administrateurs (sauf s'ils sont le propriétaire)

### 2. Attributs de Fichier

En plus des ACL, le fichier possède :
- ✅ **Hidden** : Caché de l'explorateur Windows
- ✅ **ReadOnly** : Protection contre suppression accidentelle

---

## Comment ça Fonctionne

### Code de Sécurisation (DatabaseEncryptionService.cs)

```csharp
private void SecureKeyFile(string keyFilePath)
{
    var fileInfo = new FileInfo(keyFilePath);

    // 1. Obtenir l'identité de l'utilisateur actuel
    var currentUser = WindowsIdentity.GetCurrent();
    var currentUserSid = currentUser.User;

    // 2. Créer une nouvelle ACL vide (supprime tous les accès existants)
    var fileSecurity = new FileSecurity();

    // 3. Désactiver l'héritage des permissions
    fileSecurity.SetAccessRuleProtection(isProtected: true, preserveInheritance: false);

    // 4. Ajouter l'accès complet uniquement pour l'utilisateur actuel
    var currentUserRule = new FileSystemAccessRule(
        currentUserSid,
        FileSystemRights.FullControl,
        AccessControlType.Allow);
    fileSecurity.AddAccessRule(currentUserRule);

    // 5. Ajouter l'accès pour SYSTEM
    var systemSid = new SecurityIdentifier(WellKnownSidType.LocalSystemSid, null);
    var systemRule = new FileSystemAccessRule(
        systemSid,
        FileSystemRights.FullControl,
        AccessControlType.Allow);
    fileSecurity.AddAccessRule(systemRule);

    // 6. Appliquer les ACL
    fileInfo.SetAccessControl(fileSecurity);

    // 7. Attributs cachés et lecture seule
    fileInfo.Attributes = FileAttributes.Hidden | FileAttributes.ReadOnly;
}
```

### Logs de Sécurité

Au démarrage, vous verrez :

```
info: PiiScanner.Api.Services.DatabaseEncryptionService[0]
      Fichier de clé sécurisé avec ACL restrictives. Accès limité à: GRILLON\samir
```

---

## Vérification des Permissions

### PowerShell

Pour vérifier les permissions ACL :

```powershell
Get-Acl "PiiScanner.Api\bin\Debug\net8.0\db_encryption.key" | Format-List
```

**Sortie attendue** :

```
Path   : C:\...\db_encryption.key
Owner  : GRILLON\samir
Group  : GRILLON\samir
Access : AUTORITÉ NT\Système Allow  FullControl
         GRILLON\samir Allow  FullControl
```

✅ **Seulement 2 entrées** : SYSTEM + utilisateur actuel

### Explorateur Windows

1. Faites un clic droit sur le fichier → **Propriétés**
2. Onglet **Sécurité**
3. Vérifiez que seuls **SYSTEM** et **votre utilisateur** apparaissent

---

## Scénarios de Sécurité

### ✅ Scénario 1 : Utilisateur malveillant sur le même serveur

**Attaque** : Un autre utilisateur Windows essaie de lire `db_encryption.key`

**Protection** :
- Les ACL bloquent l'accès
- L'utilisateur reçoit une erreur "Accès refusé"
- La base de données reste inaccessible

**Résultat** : ✅ **BLOQUÉ**

### ✅ Scénario 2 : Programme malveillant s'exécutant sous un autre compte

**Attaque** : Un malware essaie de voler la clé depuis un autre compte utilisateur

**Protection** :
- Les ACL empêchent la lecture du fichier
- Le malware ne peut pas ouvrir ou copier la clé

**Résultat** : ✅ **BLOQUÉ**

### ⚠️ Scénario 3 : Administrateur local

**Attaque** : Un administrateur Windows essaie d'accéder à la clé

**Protection** :
- Les administrateurs peuvent prendre possession du fichier (par conception Windows)
- Mais l'action est visible dans les logs d'audit Windows

**Résultat** : ⚠️ **DÉTECTABLE** (avec audit Windows activé)

### ❌ Scénario 4 : Accès physique au disque

**Attaque** : L'attaquant démonte le disque et le lit sur un autre système

**Protection actuelle** :
- Les ACL NTFS ne protègent PAS contre l'accès physique
- La clé est stockée en clair sur le disque

**Résultat** : ❌ **NON PROTÉGÉ**

**Mitigation recommandée** :
- Chiffrement BitLocker du disque entier
- Ou stockage de la clé dans un HSM (Hardware Security Module)

---

## Comparaison Avant/Après

| Aspect | Avant | Après |
|--------|-------|-------|
| **Permissions** | Héritage activé (Everyone peut lire) | ACL restrictives (2 utilisateurs seulement) |
| **Visibilité** | Visible | Caché (attribut Hidden) |
| **Modification** | Modifiable | Lecture seule (attribut ReadOnly) |
| **Audit** | Aucun log | Log au démarrage + logs Windows |
| **Accès autre utilisateur** | ❌ POSSIBLE | ✅ BLOQUÉ |
| **Accès administrateur** | ❌ POSSIBLE | ⚠️ DÉTECTABLE |
| **Accès physique disque** | ❌ POSSIBLE | ❌ POSSIBLE (inchangé) |

---

## Configuration de Production

### Option 1 : Variable d'Environnement (Recommandé)

Au lieu du fichier, utilisez une variable d'environnement :

```json
// appsettings.Production.json
{
  "Database": {
    "EncryptionKey": "VOTRE_CLE_256_BITS_HEX"
  }
}
```

**Avantages** :
- Pas de fichier sur le disque
- Peut être injecté depuis un gestionnaire de secrets
- Rotation plus facile

### Option 2 : Azure Key Vault

```csharp
// Dans Program.cs
builder.Configuration.AddAzureKeyVault(
    new Uri("https://votre-vault.vault.azure.net/"),
    new DefaultAzureCredential());
```

**Avantages** :
- Stockage cloud hautement sécurisé
- Rotation automatique des clés
- Audit logging complet
- Accès via identité managée

### Option 3 : DPAPI (Windows uniquement)

Chiffrer la clé elle-même avec Data Protection API :

```csharp
// Chiffrer
byte[] encrypted = ProtectedData.Protect(keyBytes, null, DataProtectionScope.LocalMachine);

// Déchiffrer
byte[] decrypted = ProtectedData.Unprotect(encrypted, null, DataProtectionScope.LocalMachine);
```

**Avantages** :
- Chiffrement lié au système Windows
- Gratuit et intégré
- Protection supplémentaire même si ACL contournées

---

## Hiérarchie de Chargement de la Clé

L'application charge la clé selon cet ordre de priorité :

1. **Variable d'environnement** `Database:EncryptionKey` (recommandé production)
2. **Fichier** `db_encryption.key` (développement, maintenant sécurisé avec ACL)
3. **Génération automatique** si aucune source disponible

```csharp
public string GetOrCreateEncryptionKey()
{
    // 1. Vérifier configuration (production)
    var configKey = _configuration["Database:EncryptionKey"];
    if (!string.IsNullOrEmpty(configKey))
        return configKey;

    // 2. Vérifier fichier (développement)
    if (File.Exists(keyFilePath))
        return File.ReadAllText(keyFilePath).Trim();

    // 3. Générer nouvelle clé (premier démarrage)
    var newKey = GenerateSecureKey();
    File.WriteAllText(keyFilePath, newKey);
    SecureKeyFile(keyFilePath); // ← Nouvelle sécurisation ACL
    return newKey;
}
```

---

## Checklist de Déploiement

### Développement

- [x] Clé générée automatiquement
- [x] Fichier caché et lecture seule
- [x] ACL restrictives (utilisateur + SYSTEM)
- [x] Logs de sécurité activés

### Production

- [ ] Variable d'environnement `Database:EncryptionKey` configurée
- [ ] Ou Azure Key Vault / AWS Secrets Manager configuré
- [ ] Fichier `db_encryption.key` sauvegardé hors serveur (backup)
- [ ] BitLocker activé sur le disque (protection physique)
- [ ] Audit Windows activé pour tracer les accès au fichier
- [ ] Monitoring des logs de sécurité

---

## Audit et Monitoring

### Activer l'Audit Windows (Recommandé Production)

```powershell
# Activer l'audit des accès aux fichiers
auditpol /set /subcategory:"File System" /success:enable /failure:enable

# Configurer l'audit sur le fichier de clé
$acl = Get-Acl "db_encryption.key"
$auditRule = New-Object System.Security.AccessControl.FileSystemAuditRule(
    "Everyone",
    "Read",
    "Success,Failure")
$acl.AddAuditRule($auditRule)
Set-Acl "db_encryption.key" $acl
```

Ensuite, surveillez les événements dans l'Event Viewer Windows :
- Event ID 4663 : Tentative d'accès à un objet
- Event ID 4656 : Demande d'accès à un handle d'objet

---

## Limitations et Considérations

### ✅ Ce qui EST protégé

- ✅ Accès par d'autres utilisateurs Windows
- ✅ Accès par programmes s'exécutant sous d'autres comptes
- ✅ Lecture accidentelle par un administrateur non autorisé
- ✅ Modification ou suppression accidentelle

### ⚠️ Ce qui N'EST PAS complètement protégé

- ⚠️ Administrateur Windows déterminé (peut prendre possession)
- ⚠️ Accès physique au disque (démonter et lire ailleurs)
- ⚠️ Sauvegarde du système (la clé sera dans la backup)
- ⚠️ Attaque mémoire (clé en RAM pendant l'exécution)

### Mitigations Recommandées

1. **BitLocker** : Chiffrer tout le disque
2. **Azure Key Vault** : Stocker la clé hors du serveur
3. **DPAPI** : Double chiffrement de la clé
4. **Audit logging** : Détecter les accès suspects
5. **Rotation régulière** : Changer la clé périodiquement

---

## Dépannage

### Problème : "Accès refusé" au démarrage de l'API

**Cause** : L'utilisateur exécutant l'API n'est pas le propriétaire du fichier

**Solution** :
1. Vérifier l'utilisateur actuel : `whoami`
2. Comparer avec le propriétaire : `Get-Acl db_encryption.key`
3. Si différent, supprimer le fichier et le régénérer

### Problème : Le fichier n'est pas caché

**Cause** : Échec de la modification des attributs (permissions insuffisantes)

**Solution** :
```powershell
attrib +h +r "db_encryption.key"
```

### Problème : Autres utilisateurs peuvent toujours lire le fichier

**Cause** : Les ACL n'ont pas été appliquées correctement

**Solution** :
1. Vérifier les ACL : `Get-Acl db_encryption.key | Format-List`
2. Si héritage activé, désactiver manuellement :
```powershell
$acl = Get-Acl "db_encryption.key"
$acl.SetAccessRuleProtection($true, $false)
Set-Acl "db_encryption.key" $acl
```

---

## Tests de Validation

### Test 1 : Vérifier les ACL

```powershell
$acl = Get-Acl "PiiScanner.Api\bin\Debug\net8.0\db_encryption.key"
$acl.Access | Format-Table IdentityReference, FileSystemRights, AccessControlType
```

**Attendu** : Seulement 2 lignes (SYSTEM + utilisateur actuel)

### Test 2 : Tenter l'accès depuis un autre compte

```powershell
# En tant qu'autre utilisateur
Get-Content "db_encryption.key"
```

**Attendu** : Erreur "Accès refusé"

### Test 3 : Vérifier les attributs

```powershell
Get-ItemProperty "db_encryption.key" | Select-Object Attributes
```

**Attendu** : `ReadOnly, Hidden`

---

## Conclusion

La clé de chiffrement de votre base de données est maintenant **significativement mieux protégée** avec :

1. ✅ ACL NTFS restrictives (2 utilisateurs seulement)
2. ✅ Attributs Hidden + ReadOnly
3. ✅ Logs de sécurité au démarrage
4. ✅ Fallback gracieux si ACL échouent

Pour une **sécurité maximale en production**, combinez avec :
- Azure Key Vault / AWS Secrets Manager
- BitLocker pour le chiffrement du disque
- Audit logging Windows

---

**Version** : 1.1.1
**Dernière mise à jour** : 17 décembre 2025
**Conformité** : OWASP Security Best Practices
