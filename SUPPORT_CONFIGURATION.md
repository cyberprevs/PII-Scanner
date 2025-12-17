# Configuration de la page Support

La page Support de PII Scanner a été mise en place pour permettre aux utilisateurs de :
- Contacter l'équipe de support
- Accéder à la documentation
- Signaler des bugs
- Consulter la FAQ

## Configuration requise

### 1. Modifier les URLs GitHub

Avant de déployer l'application, vous devez remplacer les URLs de substitution par vos vraies URLs GitHub :

**Fichier** : `pii-scanner-ui/src/components/pages/Support.tsx`

Recherchez et remplacez les URLs suivantes :

```typescript
// Ligne ~159 - Documentation GitHub
'https://github.com/your-org/pii-scanner'
// Remplacer par votre URL de dépôt, exemple :
'https://github.com/votre-organisation/pii-scanner'

// Ligne ~184 - Signalement de bugs
'https://github.com/your-org/pii-scanner/issues/new'
// Remplacer par :
'https://github.com/votre-organisation/pii-scanner/issues/new'

// Ligne ~359 - Guide de démarrage
'https://github.com/your-org/pii-scanner/wiki/Quick-Start'
// Remplacer par :
'https://github.com/votre-organisation/pii-scanner/wiki/Quick-Start'

// Ligne ~369 - Architecture technique
'https://github.com/your-org/pii-scanner/wiki/Architecture'
// Remplacer par :
'https://github.com/votre-organisation/pii-scanner/wiki/Architecture'

// Ligne ~379 - Guide RGPD
'https://github.com/your-org/pii-scanner/wiki/GDPR-Compliance'
// Remplacer par :
'https://github.com/votre-organisation/pii-scanner/wiki/GDPR-Compliance'
```

### 2. Modifier l'adresse email de support

**Fichier** : `pii-scanner-ui/src/components/pages/Support.tsx`

Recherchez et remplacez :

```typescript
// Ligne ~122 - Email de support dans le formulaire
const mailtoLink = `mailto:support@piiscanner.com?subject=...`;
// Remplacer par votre vraie adresse :
const mailtoLink = `mailto:support@votre-domaine.com?subject=...`;

// Ligne ~294 - Email affiché en bas du formulaire
<Link href="mailto:support@piiscanner.com" underline="hover">
  support@piiscanner.com
</Link>
// Remplacer par :
<Link href="mailto:support@votre-domaine.com" underline="hover">
  support@votre-domaine.com
</Link>
```

### 3. Configurer les tutoriels vidéo (optionnel)

Si vous avez une chaîne YouTube avec des tutoriels :

```typescript
// Ligne ~208
'https://www.youtube.com/@piiscanner'
// Remplacer par :
'https://www.youtube.com/@votre-chaine'
```

Si vous n'avez pas de tutoriels vidéo, vous pouvez :
- Supprimer cette carte complètement
- La remplacer par un autre lien (ex: vers un blog, un forum, etc.)

### 4. Personnaliser la FAQ (recommandé)

La FAQ peut être personnalisée selon vos besoins. Modifiez le tableau `faqs` aux lignes 23-69 :

```typescript
const faqs: FAQ[] = [
  {
    question: 'Votre question',
    answer: 'Votre réponse'
  },
  // Ajoutez d'autres questions...
];
```

### 5. Modifier les ressources supplémentaires

Vous pouvez ajouter ou supprimer des ressources dans la section "Ressources supplémentaires" :

```typescript
<ListItem>
  <ListItemIcon>
    <ArticleIcon color="primary" />
  </ListItemIcon>
  <ListItemText
    primary="Titre de la ressource"
    secondary="Description de la ressource"
  />
  <IconButton onClick={() => openExternalLink('URL_DE_LA_RESSOURCE')}>
    <OpenInNewIcon />
  </IconButton>
</ListItem>
```

## Après configuration

Une fois que vous avez modifié les URLs et l'email :

1. Recompilez le frontend :
```bash
cd pii-scanner-ui
npm run build
```

2. Construisez l'application Electron :
```bash
npm run electron:build:win
```

3. Le nouvel exécutable sera dans `pii-scanner-ui/release/`

## Fonctionnement de la page Support

### Formulaire de contact
- Lorsque l'utilisateur remplit le formulaire et clique sur "Envoyer", cela ouvre son client email par défaut (Outlook, Thunderbird, etc.)
- Le sujet et le corps du message sont pré-remplis avec les informations du formulaire
- L'utilisateur doit ensuite envoyer l'email manuellement

### Liens externes
- Tous les liens s'ouvrent dans le navigateur par défaut de l'utilisateur
- Les liens GitHub nécessitent une connexion Internet
- L'API Reference (Swagger) fonctionne uniquement si l'API est en cours d'exécution sur localhost:5000

## Accès à la page Support

Les utilisateurs peuvent accéder à la page Support via :
1. Le menu latéral → Section "Support" (icône point d'interrogation)
2. L'URL directe : `/support`

## Sécurité

- Aucune donnée n'est envoyée automatiquement depuis le formulaire de contact
- Tous les liens externes sont ouverts avec `window.open(..., '_blank')` pour la sécurité
- Aucune donnée sensible n'est partagée via la page Support

## Support multilingue (futur)

Pour ajouter une autre langue :
1. Extraire toutes les chaînes de texte dans un fichier de traduction
2. Utiliser un système i18n comme `react-i18next`
3. Créer des fichiers de traduction pour chaque langue

## Personnalisation du design

Tous les styles utilisent Material-UI et peuvent être personnalisés via :
- Le thème principal dans `MainLayout.tsx`
- Les props `sx` directement dans le composant Support
- Les couleurs des icônes (actuellement : `#667eea`, `#e74c3c`, `#f39c12`)
