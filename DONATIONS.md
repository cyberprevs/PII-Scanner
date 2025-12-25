# 💝 Guide de configuration des dons

Ce document explique comment configurer les plateformes de dons pour PII Scanner avec des **contributions à prix libre**.

## 🎯 Philosophie : Dons à prix libre

PII Scanner adopte le modèle **"Pay What You Want"** (Payez ce que vous voulez) :
- ✨ **Aucun montant minimum imposé** (sauf minimum technique de la plateforme)
- 💰 **Chaque contribution compte**, quelle que soit sa taille
- 🤝 **Pas de paliers obligatoires** ni de récompenses exclusives
- ❤️ **Le don est un geste de soutien**, pas une transaction commerciale

## 🎯 Plateformes utilisées

### 1. Ko-fi (Recommandé)

**Avantages** :
- Configuration rapide et simple
- Dons ponctuels sans engagement
- Interface intuitive pour les donateurs
- Montant libre à partir de 3€
- Pas de frais pour le donateur

**Configuration** :
1. Créez un compte sur [ko-fi.com](https://ko-fi.com)
2. Personnalisez votre page Ko-fi
3. Récupérez votre identifiant (ex: `Y8Y31QXZ2Y`)
4. Mettez à jour les fichiers :
   - `.github/FUNDING.yml` : `ko_fi: Y8Y31QXZ2Y`
   - `README.md` : Badge et lien de donation
   - `pii-scanner-ui/src/components/pages/Support.tsx` : Bouton Ko-fi

---

### 2. PayPal

**Avantages** :
- Accepté mondialement
- Sécurisé et reconnu
- Montant totalement libre (pas de minimum)
- Pas besoin de compte pour le donateur

**Configuration** :
1. Créez un bouton de don sur [PayPal Donations](https://www.paypal.com/donate/buttons)
2. Configurez le bouton en **montant libre** (pas de montant fixe)
3. Récupérez votre `hosted_button_id`
4. Remplacez `VOTRE_ID` dans les fichiers :
   - `.github/FUNDING.yml` : `custom: ['https://www.paypal.com/donate/?hosted_button_id=VOTRE_ID']`
   - `README.md` : Badge et lien de donation
   - `pii-scanner-ui/src/components/pages/Support.tsx` : Bouton PayPal

**Exemple d'URL** :
```
https://www.paypal.com/donate/?hosted_button_id=ABCD1234EFGH
```

---

## 📋 Checklist de mise en place

- [x] Créer compte Ko-fi (ID: Y8Y31QXZ2Y)
- [ ] Configurer bouton PayPal avec montant libre
- [x] Mettre à jour `.github/FUNDING.yml`
- [x] Mettre à jour `README.md` (badges + section donations)
- [x] Mettre à jour `pii-scanner-ui/src/components/pages/Support.tsx`
- [ ] Tester tous les liens de donation
- [ ] Partager l'info sur les réseaux sociaux

---

## 💡 Conseils

### Communication transparente
- **Expliquez l'utilisation des dons** : Maintenance, nouvelles fonctionnalités, support communautaire
- **Pas de promesses excessives** : Les dons sont des contributions volontaires, pas des achats
- **Remerciements publics** : Mentionnez les contributeurs réguliers (avec leur permission)
- **Rapports d'activité** : Partagez périodiquement les améliorations financées par les dons

### Montants suggérés (optionnel)
Vous pouvez suggérer des montants sans les imposer :
- **3-5€** : Un café virtuel ☕
- **10-15€** : Soutien apprécié 💚
- **25-50€** : Contribution généreuse 🌟
- **100€+** : Sponsor du projet 🏆

**Important** : Ces montants sont purement indicatifs. L'utilisateur choisit librement.

---

## 📧 Support entreprise

Pour les entreprises souhaitant un **support professionnel payant** (différent des dons) :
- Email : contact@cyberprevs.fr
- Services proposés :
  - 🎓 Formation sur site
  - 🔧 Intégration personnalisée
  - 📞 Support dédié avec SLA
  - ⚙️ Développement de fonctionnalités spécifiques
  - 📊 Audit de conformité RGPD/APDP

---

## 🙏 Remerciements aux contributeurs

Créez une section dans le README pour remercier les donateurs réguliers (avec leur consentement) :

```markdown
## 💝 Contributeurs

Un grand merci à toutes les personnes qui soutiennent le projet !

### Contributeurs réguliers
<!-- Liste des noms (avec permission) -->

*Votre nom ici ? Faites un don et contactez-nous pour être mentionné !*
```

**Note** : Pas de hiérarchie par montant. Tous les contributeurs sont égaux.

---

**Dernière mise à jour** : Décembre 2024
