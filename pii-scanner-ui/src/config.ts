// ─── App Configuration ──────────────────────────────────────────────────────
// Source unique pour le mode mock/live.
// Contrôlé par la variable d'environnement VITE_MOCK.
//
// Usage :
//   npm run dev:mock   → données fictives (pas besoin du backend)
//   npm run dev:live   → connecté au backend
//   npm run dev        → utilise la valeur dans .env

/** true quand l'app tourne en mode données fictives */
export const IS_MOCK = import.meta.env.VITE_MOCK === 'true';
