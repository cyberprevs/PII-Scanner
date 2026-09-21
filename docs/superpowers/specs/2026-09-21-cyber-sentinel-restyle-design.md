# Restylage visuel "SentinelOS" — Design

## Contexte

L'utilisateur a trouvé un template Figma Community, "Cyber Security Web App UI",
téléchargé sous forme de projet React/Vite (shadcn/ui + Tailwind), et veut que
PII Scanner reprenne son identité visuelle (couleurs, typographie, style des
composants) sans copier sa structure de menus (le template est un dashboard SOC
générique — Threat Intel, Vulnerabilities, Network Monitor — qui n'a pas de
rapport avec les pages réelles de PII Scanner).

PII Scanner utilise déjà un design system centralisé dans
`pii-scanner-ui/src/theme/designSystem.ts` (tokens → `createAppTheme(darkMode)`
→ thème Material-UI v7), avec un helper `glassCardSx(dark)` pour l'effet verre
dépoli. C'est la même architecture "tokens → thème" que le template (CSS custom
properties → Tailwind theme), ce qui rend la transposition directe : on ne
change pas de stack (on reste MUI v7, pas de migration vers shadcn/Tailwind),
seulement les valeurs de tokens et quelques styles de composants.

## Objectif

Faire que PII Scanner ait le look "console SOC" du template — fond quasi-noir,
accent cyan néon, badges/texte technique en police monospace — en préservant :
- toutes les pages et menus existants de PII Scanner (aucune page ajoutée/retirée)
- le toggle clair/sombre déjà en place (le template n'a qu'un mode sombre — on
  dérive un mode clair cohérent)
- la stack technique actuelle (MUI v7, pas de shadcn/Tailwind)

## Ce qui a été validé avec l'utilisateur

1. **Couleur d'accent** : cyan exact du template (`#00D4FF`), remplace le vert
   néon actuel (`#00E599`) comme accent principal.
2. **Mode clair** : conservé. Une variante claire cohérente avec le cyan est
   dérivée (le template n'en fournit pas).
3. **Typographie** : ajout de JetBrains Mono (Google Fonts) en plus d'Inter,
   utilisée pour les éléments techniques (badges, IDs, timestamps, valeurs de
   stats) — c'est ce qui donne l'essentiel du look "console" du template.
4. **Portée** : restylage du design system global (tokens centraux + layout
   partagé), pas juste une page de preuve de concept. Toutes les pages héritent
   du nouveau look via les composants partagés qu'elles consomment déjà.

## Tokens extraits du template (source de vérité)

Fichier source : `theme.css` du template, mode `.dark` (seul mode fourni).

| Rôle | Valeur |
|---|---|
| Fond page | `#07090D` |
| Fond carte / surface | `#0D1117` |
| Fond surface secondaire (inputs, sidebar accent) | `#111827` |
| Bordure par défaut | `rgba(255,255,255,0.07)` |
| Accent principal (primary) | `#00D4FF` |
| Texte sur accent | `#07090D` |
| Texte primaire | `#E2E8F0` |
| Texte secondaire / muted | `#64748B` |
| Danger / critique | `#FF3366` |
| Warning / élevé | `#FB923C` (accent secondaire warning : `#FBBF24`) |
| Succès | `#00FF87` |
| Violet secondaire (charts, infos) | `#A78BFA` |
| Radius de base | `0.375rem` (6px) |
| Police texte | Inter (300–700) |
| Police technique | JetBrains Mono (400–600) |

Style de composants observés dans `App.tsx` du template, à reproduire :
- Cartes : fond `bg-card`, bordure `1px solid border-border`, radius `md`
  (6px), padding généreux (`p-5`), pas d'ombre — le contraste vient de la
  bordure et du fond légèrement plus clair que la page, pas d'un drop-shadow.
- Sidebar : largeur fixe étroite (~224px), fond identique aux cartes, item actif
  = fond accent à 10% d'opacité + texte accent + bordure accent à 20%.
- Badges de sévérité : fond couleur sémantique à 10% d'opacité, texte plein,
  bordure à 30% d'opacité, pastille (dot) de 4px, tout en police mono, texte en
  minuscule/petite taille avec tracking large.
- Barres de recherche / inputs : fond `#111827`, bordure `rgba(255,255,255,.07)`
  au repos, bordure accent à 50% au focus.
- Tableaux : en-têtes en mono, majuscules, tracking large, texte muted ; lignes
  avec bordure basse à faible opacité, hover = fond blanc à ~2%.
- Indicateurs "live" : petit point coloré avec `animate-pulse` (ex. statut
  système, alerte active).

## Mode clair dérivé (nouveau, pas dans le template)

Le template ne fournissant qu'un mode sombre, le mode clair est construit par
analogie avec la structure `tokens.colors.light` déjà présente dans
`designSystem.ts`, en réutilisant le même cyan comme accent :

| Rôle | Valeur proposée |
|---|---|
| Fond page | `#F4F6FA` (légèrement bleuté, cohérent avec l'esprit "tech") |
| Fond carte | `#FFFFFF` |
| Bordure par défaut | `#E2E8F0` |
| Accent principal | `#0092B8` (cyan assombri pour contraste AA sur fond blanc — `#00D4FF` pur échoue au contraste texte-sur-blanc) |
| Texte sur accent | `#FFFFFF` |
| Texte primaire | `#0F172A` |
| Texte secondaire | `#64748B` (inchangé, fonctionne sur les deux fonds) |

Les couleurs sémantiques (danger/warning/succès/violet) restent les mêmes
valeurs en clair, avec ajustement d'opacité des fonds "muted" (10% → reste
lisible sur blanc) — pas de changement de teinte, seulement les fonds
neutres et l'accent qui s'adaptent.

## Fichiers impactés

**Cœur du design system (change les valeurs, pas la structure) :**
- `pii-scanner-ui/src/theme/designSystem.ts` — tokens, `createAppTheme`,
  `glassCardSx`, `getRechartsTooltipStyle`, `chartColors`
- `pii-scanner-ui/index.html` — ajout de l'import Google Fonts JetBrains Mono
  (à côté de l'import Plus Jakarta Sans existant)

**Layout partagé (styles de composants à ajuster pour matcher le template) :**
- `pii-scanner-ui/src/components/Layout/MainLayout.tsx`
- `pii-scanner-ui/src/components/Layout/Sidebar.tsx`

**Couleurs hardcodées à migrer vers les tokens** (trouvées par grep, `#00E599`
en dur au lieu de passer par le thème — 49 occurrences dans 15 fichiers) :
`App.tsx`, `components/common/ConsentModal.tsx`, `components/Results.tsx`, et
les pages `About`, `AuditTrail`, `Dashboard`, `DataRetention`, `DecryptReport`,
`Home`, `PiiCategoryAnalysis`, `Profile`, `Reports`, `ScanHistory`, `Scanner`,
`Settings`, `Support`. Chaque occurrence sera remplacée par une référence au
token (`tokens.colors.accentPrimary` ou la couleur MUI `theme.palette.primary.main`
selon le contexte), pas par la valeur cyan en dur — pour que le thème reste la
seule source de vérité et que light/dark continuent de fonctionner partout.

**Non touché :**
- Aucune page n'est renommée, déplacée ou restructurée en menus
- Aucune dépendance ajoutée (JetBrains Mono chargée en CSS, pas de nouveau
  package npm)
- La stack reste MUI v7 — pas de composants shadcn/Tailwind importés

## Risques et points d'attention

1. **Contraste du cyan en mode clair** : `#00D4FF` pur ne passe pas le ratio de
   contraste AA pour du texte sur fond blanc. D'où la version assombrie
   `#0092B8` en mode clair uniquement (le mode sombre garde le cyan pur, comme
   dans le template, car il contraste bien sur `#07090D`).
2. **JetBrains Mono partout ou seulement sur le "technique" ?** — Si appliquée
   à tout le corps de texte, l'app devient difficile à lire pour du texte long
   (descriptions, aide). Limiter JetBrains Mono aux badges, IDs, timestamps,
   valeurs numériques de stats, comme dans le template — jamais aux paragraphes
   ou labels de formulaire.
3. **Glassmorphism existant** (`glassCardSx`) vs. style "flat" du template — le
   template n'utilise pas de flou d'arrière-plan (`backdrop-filter`), juste des
   bordures nettes. On remplace l'effet verre dépoli par le style plus sobre du
   template (fond `card` + bordure `border`) pour rester fidèle, plutôt que de
   superposer les deux esthétiques.

## Plan de test

- Vérification visuelle manuelle (pas de test automatisé pour du style) :
  lancer `npm run dev`, parcourir au moins Dashboard, Scanner, Détections,
  Paramètres en mode sombre puis clair, vérifier qu'aucune couleur verte
  résiduelle n'apparaît (grep de contrôle post-implémentation)
- `npm run lint` et `npm run test:run` doivent rester verts (aucun changement
  de logique, seulement de style)
- `npm run build` doit rester propre (pas de nouveau warning)
