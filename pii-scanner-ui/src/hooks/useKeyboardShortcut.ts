import { useEffect } from 'react';

export interface KeyboardShortcutConfig {
  key: string;                    // ex: 's', 'e', 'Escape'
  ctrlKey?: boolean;              // true pour Ctrl+Key
  shiftKey?: boolean;             // true pour Shift+Key
  altKey?: boolean;               // true pour Alt+Key
  callback: () => void;           // Fonction à appeler
  enabled?: boolean;              // Activer/désactiver (défaut: true)
  preventDefault?: boolean;       // Empêcher défaut navigateur (défaut: true)
}

/**
 * Hook personnalisé pour gérer les raccourcis clavier
 *
 * @param config Configuration du raccourci clavier
 *
 * @example
 * ```typescript
 * useKeyboardShortcut({
 *   key: 's',
 *   ctrlKey: true,
 *   callback: () => handleSave(),
 *   enabled: canSave,
 *   preventDefault: true
 * });
 * ```
 */
export function useKeyboardShortcut(config: KeyboardShortcutConfig): void {
  const {
    key,
    ctrlKey = false,
    shiftKey = false,
    altKey = false,
    callback,
    enabled = true,
    preventDefault = true,
  } = config;

  useEffect(() => {
    // Ne pas enregistrer le listener si désactivé
    if (!enabled) {
      return;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      // Vérifier si l'utilisateur tape dans un champ de saisie
      const target = event.target as HTMLElement;
      const isTypingInInput =
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.isContentEditable;

      // Exception: Escape doit toujours fonctionner, même dans les champs de saisie
      if (isTypingInInput && key.toLowerCase() !== 'escape') {
        return;
      }

      // Vérifier si la combinaison de touches correspond
      const keyMatches = event.key.toLowerCase() === key.toLowerCase();
      const ctrlMatches = ctrlKey ? event.ctrlKey : !event.ctrlKey;
      const shiftMatches = shiftKey ? event.shiftKey : !event.shiftKey;
      const altMatches = altKey ? event.altKey : !event.altKey;

      if (keyMatches && ctrlMatches && shiftMatches && altMatches) {
        // Empêcher le comportement par défaut du navigateur (ex: Ctrl+S = Enregistrer la page)
        if (preventDefault) {
          event.preventDefault();
        }

        // Appeler le callback
        callback();
      }
    };

    // Enregistrer l'event listener
    document.addEventListener('keydown', handleKeyDown);

    // Cleanup: retirer l'event listener au démontage
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [key, ctrlKey, shiftKey, altKey, callback, enabled, preventDefault]);
}
