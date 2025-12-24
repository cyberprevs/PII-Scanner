/**
 * Logger utilitaire pour remplacer console.log
 * Active les logs uniquement en développement
 */

const isDev = import.meta.env.DEV;

export const logger = {
  /**
   * Log informatif (développement uniquement)
   */
  info: (message: string, ...args: any[]) => {
    if (isDev) {
      console.log(`[INFO] ${message}`, ...args);
    }
  },

  /**
   * Log d'avertissement (développement uniquement)
   */
  warn: (message: string, ...args: any[]) => {
    if (isDev) {
      console.warn(`[WARN] ${message}`, ...args);
    }
  },

  /**
   * Log d'erreur (toujours actif, même en production)
   */
  error: (message: string, ...args: any[]) => {
    console.error(`[ERROR] ${message}`, ...args);
  },

  /**
   * Log de debug (développement uniquement)
   */
  debug: (message: string, ...args: any[]) => {
    if (isDev) {
      console.debug(`[DEBUG] ${message}`, ...args);
    }
  },

  /**
   * Log de succès (développement uniquement)
   */
  success: (message: string, ...args: any[]) => {
    if (isDev) {
      console.log(`%c[SUCCESS] ${message}`, 'color: green; font-weight: bold', ...args);
    }
  },
};
