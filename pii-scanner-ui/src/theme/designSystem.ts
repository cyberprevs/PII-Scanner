import { createTheme } from '@mui/material';

// ─── Design Tokens ──────────────────────────────────────────────────────────
// Neon-inspired design system for PII Scanner.
// Edit these tokens to change the look of the entire app.

export const tokens = {
  colors: {
    // Backgrounds
    bgPrimary: '#0A0A0A',
    bgSurface: '#141414',
    bgSurfaceRaised: '#1A1A1A',
    bgInput: '#0A0A0A',

    // Borders
    borderDefault: '#262626',
    borderMuted: '#1F1F1F',
    borderFocus: '#00E599',

    // Accent
    accentPrimary: '#00E599',
    accentPrimaryHover: '#00CC88',
    accentPrimaryMuted: 'rgba(0, 229, 153, 0.12)',
    accentPrimaryText: '#0A0A0A', // text on accent buttons

    // Text
    textPrimary: '#FAFAFA',
    textSecondary: '#A0A0A0',
    textTertiary: '#6B6B6B',

    // Semantic
    danger: '#F45252',
    dangerMuted: 'rgba(244, 82, 82, 0.12)',
    warning: '#F0A000',
    warningMuted: 'rgba(240, 160, 0, 0.12)',
    success: '#00E599',
    successMuted: 'rgba(0, 229, 153, 0.12)',
    info: '#3B82F6',
    infoMuted: 'rgba(59, 130, 246, 0.12)',

    // Light mode overrides
    light: {
      bgPrimary: '#F4F6F8',
      bgSurface: '#FFFFFF',
      bgSurfaceRaised: '#FAFAFA',
      bgInput: '#F4F6F8',
      borderDefault: '#E5E7EB',
      borderMuted: '#F0F0F0',
      textPrimary: '#111111',
      textSecondary: '#6B6B6B',
      textTertiary: '#A0A0A0',
    },
  },

  radii: {
    sm: 6,
    md: 8,
    lg: 12,
    xl: 16,
  },

  spacing: {
    page: 3, // MUI spacing units (24px)
  },

  shadows: {
    card: '0 1px 3px rgba(0,0,0,0.08), 0 1px 2px rgba(0,0,0,0.04)',
    cardHover: '0 4px 12px rgba(0,0,0,0.12), 0 2px 6px rgba(0,0,0,0.06)',
  },
} as const;

// ─── Gradient helpers (for stat cards, charts, etc.) ────────────────────────
export const gradients = {
  primary: `linear-gradient(135deg, ${tokens.colors.accentPrimary} 0%, #00B876 100%)`,
  danger: `linear-gradient(135deg, ${tokens.colors.danger} 0%, #D93636 100%)`,
  info: `linear-gradient(135deg, ${tokens.colors.info} 0%, #2563EB 100%)`,
  warning: `linear-gradient(135deg, ${tokens.colors.warning} 0%, #D48800 100%)`,
  surface: (dark: boolean) =>
    dark
      ? `linear-gradient(180deg, ${tokens.colors.bgSurface} 0%, ${tokens.colors.bgSurfaceRaised} 100%)`
      : `linear-gradient(180deg, ${tokens.colors.light.bgSurface} 0%, ${tokens.colors.light.bgPrimary} 100%)`,
};

// ─── Chart colors ───────────────────────────────────────────────────────────
export const chartColors = [
  '#00E599', '#3B82F6', '#F0A000', '#F45252',
  '#A78BFA', '#EC4899', '#06B6D4', '#84CC16',
];

// ─── Glassmorphism helper ────────────────────────────────────────────────────
export function glassCardSx(darkMode: boolean): Record<string, unknown> {
  if (!darkMode) return {};
  return {
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    backdropFilter: 'blur(12px)',
    WebkitBackdropFilter: 'blur(12px)',
    border: '1px solid rgba(255, 255, 255, 0.08)',
  };
}

// ─── Recharts tooltip style ──────────────────────────────────────────────────
export function getRechartsTooltipStyle(darkMode: boolean): Record<string, unknown> {
  return {
    backgroundColor: darkMode ? '#1E1E1E' : '#FFFFFF',
    border: `1px solid ${darkMode ? '#2A2A2A' : '#E5E7EB'}`,
    borderRadius: 8,
    boxShadow: darkMode
      ? '0 4px 16px rgba(0,0,0,0.4)'
      : '0 4px 12px rgba(0,0,0,0.08)',
    color: darkMode ? '#FAFAFA' : '#111111',
  };
}

// ─── MUI Theme Factory ─────────────────────────────────────────────────────
export function createAppTheme(darkMode: boolean) {
  const c = tokens.colors;
  const light = c.light;

  return createTheme({
    palette: {
      mode: darkMode ? 'dark' : 'light',
      primary: {
        main: c.accentPrimary,
        contrastText: c.accentPrimaryText,
      },
      secondary: {
        main: c.info,
      },
      error: {
        main: c.danger,
      },
      warning: {
        main: c.warning,
      },
      success: {
        main: c.success,
      },
      info: {
        main: c.info,
      },
      background: {
        default: darkMode ? c.bgPrimary : light.bgPrimary,
        paper: darkMode ? c.bgSurface : light.bgSurface,
      },
      text: {
        primary: darkMode ? c.textPrimary : light.textPrimary,
        secondary: darkMode ? c.textSecondary : light.textSecondary,
        disabled: darkMode ? c.textTertiary : light.textTertiary,
      },
      divider: darkMode ? c.borderDefault : light.borderDefault,
    },

    typography: {
      fontFamily: '"Inter", "Plus Jakarta Sans", system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
      h1: { fontWeight: 700, letterSpacing: '-0.025em', lineHeight: 1.2 },
      h2: { fontWeight: 700, letterSpacing: '-0.02em', lineHeight: 1.25 },
      h3: { fontWeight: 600, letterSpacing: '-0.015em', lineHeight: 1.3 },
      h4: { fontWeight: 600, letterSpacing: '-0.01em', lineHeight: 1.35 },
      h5: { fontWeight: 600, letterSpacing: '0em', lineHeight: 1.4 },
      h6: { fontWeight: 600, letterSpacing: '0em', lineHeight: 1.4 },
      subtitle1: { fontWeight: 500, letterSpacing: '0em', lineHeight: 1.5 },
      subtitle2: { fontWeight: 500, letterSpacing: '0em', lineHeight: 1.5 },
      body1: { fontWeight: 400, letterSpacing: '0em', lineHeight: 1.6 },
      body2: { fontWeight: 400, letterSpacing: '0em', lineHeight: 1.5 },
      button: { fontWeight: 500, letterSpacing: '0.01em', textTransform: 'none' as const },
      caption: { fontWeight: 400, letterSpacing: '0.01em', lineHeight: 1.4 },
      overline: { fontWeight: 600, letterSpacing: '0.06em', lineHeight: 1.5 },
    },

    shape: {
      borderRadius: tokens.radii.md,
    },

    components: {
      MuiCssBaseline: {
        styleOverrides: {
          body: {
            backgroundColor: darkMode ? c.bgPrimary : light.bgPrimary,
          },
        },
      },

      MuiButton: {
        styleOverrides: {
          root: {
            borderRadius: tokens.radii.md,
            textTransform: 'none' as const,
            fontWeight: 500,
            padding: '8px 16px',
            boxShadow: 'none',
            '&:hover': { boxShadow: 'none' },
          },
          contained: {
            backgroundColor: c.accentPrimary,
            color: c.accentPrimaryText,
            '&:hover': {
              backgroundColor: c.accentPrimaryHover,
            },
          },
          outlined: {
            borderColor: darkMode ? c.borderDefault : light.borderDefault,
            color: darkMode ? c.textPrimary : light.textPrimary,
            '&:hover': {
              borderColor: c.accentPrimary,
              backgroundColor: c.accentPrimaryMuted,
            },
          },
          sizeLarge: { padding: '12px 24px', fontSize: '0.95rem' },
          sizeMedium: { padding: '8px 16px', fontSize: '0.875rem' },
          sizeSmall: { padding: '6px 12px', fontSize: '0.8125rem' },
        },
      },

      MuiCard: {
        styleOverrides: {
          root: {
            borderRadius: tokens.radii.lg,
            backgroundImage: 'none',
            border: `1px solid ${darkMode ? c.borderDefault : light.borderDefault}`,
            boxShadow: 'none',
          },
        },
      },

      MuiPaper: {
        styleOverrides: {
          root: {
            backgroundImage: 'none',
          },
        },
      },

      MuiTextField: {
        styleOverrides: {
          root: {
            '& .MuiOutlinedInput-root': {
              backgroundColor: darkMode ? c.bgInput : light.bgInput,
              borderRadius: tokens.radii.md,
              '& fieldset': {
                borderColor: darkMode ? c.borderDefault : light.borderDefault,
              },
              '&:hover fieldset': {
                borderColor: darkMode ? '#3A3A3A' : '#CCCCCC',
              },
              '&.Mui-focused fieldset': {
                borderColor: c.accentPrimary,
                borderWidth: '1px',
              },
            },
            '& .MuiInputLabel-root': {
              color: darkMode ? c.textSecondary : light.textSecondary,
              '&.Mui-focused': {
                color: c.accentPrimary,
              },
            },
            '& .MuiOutlinedInput-input': {
              color: darkMode ? c.textPrimary : light.textPrimary,
            },
          },
        },
      },

      MuiChip: {
        styleOverrides: {
          root: {
            fontWeight: 500,
            borderRadius: tokens.radii.sm,
          },
        },
      },

      MuiAlert: {
        styleOverrides: {
          root: {
            borderRadius: tokens.radii.md,
          },
          standardError: {
            backgroundColor: c.dangerMuted,
            color: c.danger,
            '& .MuiAlert-icon': { color: c.danger },
          },
          standardWarning: {
            backgroundColor: c.warningMuted,
            color: c.warning,
            '& .MuiAlert-icon': { color: c.warning },
          },
          standardSuccess: {
            backgroundColor: c.successMuted,
            color: c.success,
            '& .MuiAlert-icon': { color: c.success },
          },
          standardInfo: {
            backgroundColor: c.infoMuted,
            color: c.info,
            '& .MuiAlert-icon': { color: c.info },
          },
        },
      },

      MuiTableHead: {
        styleOverrides: {
          root: {
            '& .MuiTableCell-head': {
              fontWeight: 600,
              backgroundColor: darkMode ? c.bgSurfaceRaised : light.bgPrimary,
              borderBottom: `1px solid ${darkMode ? c.borderDefault : light.borderDefault}`,
            },
          },
        },
      },

      MuiTableCell: {
        styleOverrides: {
          root: {
            borderBottom: `1px solid ${darkMode ? c.borderMuted : light.borderMuted}`,
          },
        },
      },

      MuiTableRow: {
        styleOverrides: {
          root: {
            '&:nth-of-type(even):not(.MuiTableRow-head)': {
              backgroundColor: darkMode
                ? 'rgba(255, 255, 255, 0.015)'
                : 'rgba(0, 0, 0, 0.015)',
            },
            '&:hover:not(.MuiTableRow-head)': {
              backgroundColor: darkMode
                ? 'rgba(0, 229, 153, 0.04) !important'
                : 'rgba(0, 229, 153, 0.03) !important',
              cursor: 'pointer',
            },
          },
        },
      },

      MuiDivider: {
        styleOverrides: {
          root: {
            borderColor: darkMode ? c.borderMuted : light.borderMuted,
          },
        },
      },

      MuiTypography: {
        styleOverrides: {
          root: {
            WebkitFontSmoothing: 'antialiased',
            MozOsxFontSmoothing: 'grayscale',
          },
        },
      },

      MuiLinearProgress: {
        styleOverrides: {
          root: {
            backgroundColor: c.accentPrimaryMuted,
            '& .MuiLinearProgress-bar': {
              backgroundColor: c.accentPrimary,
            },
          },
        },
      },

      MuiCircularProgress: {
        styleOverrides: {
          root: {
            color: c.accentPrimary,
          },
        },
      },

      MuiDialog: {
        defaultProps: {
          // Blur the focused trigger before the Dialog applies aria-hidden to #root.
          // Prevents the "aria-hidden on focused element" accessibility warning.
          TransitionProps: {
            onEnter: () => (document.activeElement as HTMLElement)?.blur?.(),
          },
        },
      },

      MuiSwitch: {
        styleOverrides: {
          switchBase: {
            '&.Mui-checked': {
              color: c.accentPrimary,
              '& + .MuiSwitch-track': {
                backgroundColor: c.accentPrimary,
              },
            },
          },
        },
      },
    },
  });
}
