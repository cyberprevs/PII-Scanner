# Guide de Contribution

Merci de votre intérêt pour contribuer au projet **PII Scanner** développé par **Cyberprevs** !

## Avant de commencer

Ce projet est sous licence **Creative Commons Attribution-NonCommercial 4.0 International (CC BY-NC 4.0)**.

### Ce que vous pouvez faire :
- Utiliser le logiciel gratuitement
- Modifier le code source
- Distribuer des copies modifiées ou non
- Contribuer avec des pull requests
- Signaler des bugs et proposer des améliorations

### Ce que vous ne pouvez PAS faire :
- **Vendre ce logiciel** (usage commercial interdit sans autorisation)
- Vendre des copies modifiées
- Offrir ce logiciel comme service commercial payant
- Retirer l'attribution à Cyberprevs

## Comment contribuer

### 1. Signaler un bug

Utilisez les [GitHub Issues](../../issues) avec le template suivant :

```markdown
**Description du bug**
Description claire et concise du problème

**Étapes pour reproduire**
1. Aller à '...'
2. Cliquer sur '...'
3. Faire défiler jusqu'à '...'
4. Voir l'erreur

**Comportement attendu**
Ce qui devrait se passer normalement

**Captures d'écran**
Si applicable, ajoutez des captures d'écran

**Environnement**
- OS: [ex. Windows 11]
- Version: [ex. 1.0.0]
- .NET Version: [ex. 8.0]
```

### 2. Proposer une fonctionnalité

Créez une issue avec le label `enhancement` :

```markdown
**Quelle fonctionnalité proposez-vous ?**
Description claire de la fonctionnalité

**Pourquoi cette fonctionnalité est-elle utile ?**
Expliquez le cas d'usage

**Solution proposée**
Comment voyez-vous l'implémentation ?
```

### 3. Soumettre une Pull Request

1. **Fork** le projet
2. **Créez une branche** pour votre fonctionnalité :
   ```bash
   git checkout -b feature/ma-nouvelle-fonctionnalite
   ```
3. **Committez** vos changements :
   ```bash
   git commit -m "feat: ajout de ma nouvelle fonctionnalité"
   ```
4. **Poussez** vers la branche :
   ```bash
   git push origin feature/ma-nouvelle-fonctionnalite
   ```
5. **Ouvrez une Pull Request** avec une description détaillée

### Convention de commit

Utilisez [Conventional Commits](https://www.conventionalcommits.org/) :

- `feat:` Nouvelle fonctionnalité
- `fix:` Correction de bug
- `docs:` Documentation
- `style:` Formatage, points-virgules manquants, etc.
- `refactor:` Refactorisation du code
- `test:` Ajout de tests
- `chore:` Maintenance

## 📝 Standards de code

### Backend (.NET)
- Suivre les conventions C# de Microsoft
- Commenter le code complexe
- Ajouter des tests unitaires pour les nouvelles fonctionnalités
- Respecter la structure existante

### Frontend (React/TypeScript)
- Utiliser TypeScript strict
- Suivre les conventions React Hooks
- Utiliser Material-UI pour la cohérence visuelle
- Tester les composants

## Sécurité

Si vous découvrez une **vulnérabilité de sécurité**, veuillez :

1. **NE PAS** créer une issue publique
2. Consulter [SECURITY.md](SECURITY.md) pour le processus de signalement
3. Nous contacter directement (voir SECURITY.md)

## Licence et Attribution

En contribuant, vous acceptez que :

1. Vos contributions seront sous **licence CC BY-NC 4.0**
2. Vous conservez vos droits d'auteur
3. Vous garantissez avoir le droit de soumettre le code
4. L'attribution principale reste à **Cyberprevs**

Toute contribution doit maintenir les mentions :
```
Developed by Cyberprevs
© 2025 Cyberprevs
```

## Utilisation Commerciale

Pour toute demande d'**utilisation commerciale** ou de **licence propriétaire**, veuillez contacter **Cyberprevs**.

## Questions

Pour toute question sur les contributions :
- Ouvrez une [Discussion GitHub](../../discussions)
- Consultez la [documentation](README.md)
- Lisez [CLAUDE.md](CLAUDE.md) pour la doc technique

---

Merci de contribuer au projet PII Scanner ! 

**Développé par Cyberprevs** • [Licence CC BY-NC 4.0](LICENSE)
