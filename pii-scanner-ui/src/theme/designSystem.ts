import { createTheme } from '@mui/material';

// ─── Design Tokens ──────────────────────────────────────────────────────────
// Neon-inspired design system for PII Scanner.
// Edit these tokens to change the look of the entire app.

export const tokens = {
  colors: {
    // Backgrounds
    bgPrimary: '#07090D',
    bgSurface: '#0D1117',
    bgSurfaceRaised: '#111827',
    bgInput: '#111827',

    // Borders
    borderDefault: 'rgba(255, 255, 255, 0.07)',
    borderMuted: 'rgba(255, 255, 255, 0.04)',
    borderFocus: '#00D4FF',

    // Accent
    accentPrimary: '#00D4FF',
    accentPrimaryHover: '#33DDFF',
    accentPrimaryMuted: 'rgba(0, 212, 255, 0.12)',
    accentPrimaryText: '#07090D', // text on accent buttons

    // Text
    textPrimary: '#E2E8F0',
    textSecondary: '#94A3B8',
    textTertiary: '#64748B',

    // Semantic
    danger: '#FF3366',
    dangerMuted: 'rgba(255, 51, 102, 0.12)',
    warning: '#FB923C',
    warningMuted: 'rgba(251, 146, 60, 0.12)',
    success: '#00FF87',
    successMuted: 'rgba(0, 255, 135, 0.12)',
    info: '#A78BFA',
    infoMuted: 'rgba(167, 139, 250, 0.12)',

    // Light mode overrides
    light: {
      bgPrimary: '#F4F6FA',
      bgSurface: '#FFFFFF',
      bgSurfaceRaised: '#F8FAFC',
      bgInput: '#F4F6FA',
      borderDefault: '#E2E8F0',
      borderMuted: '#EEF2F6',
      textPrimary: '#0F172A',
      textSecondary: '#64748B',
      textTertiary: '#94A3B8',
      accentPrimary: '#0092B8',
      accentPrimaryText: '#FFFFFF',
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
  primary: `linear-gradient(135deg, ${tokens.colors.accentPrimary} 0%, ${tokens.colors.accentPrimaryHover} 100%)`,
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
  '#00D4FF', '#3B82F6', '#FB923C', '#FF3366',
  '#A78BFA', '#EC4899', '#00FF87', '#84CC16',
];

// ─── Glassmorphism helper ────────────────────────────────────────────────────
export function glassCardSx(darkMode: boolean): Record<string, unknown> {
  return {
    backgroundColor: darkMode ? tokens.colors.bgSurface : tokens.colors.light.bgSurface,
    border: `1px solid ${darkMode ? tokens.colors.borderDefault : tokens.colors.light.borderDefault}`,
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
        main: darkMode ? c.accentPrimary : light.accentPrimary,
        contrastText: darkMode ? c.accentPrimaryText : light.accentPrimaryText,
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
            backgroundColor: darkMode ? c.accentPrimary : light.accentPrimary,
            color: darkMode ? c.accentPrimaryText : light.accentPrimaryText,
            '&:hover': {
              backgroundColor: darkMode ? c.accentPrimaryHover : light.accentPrimary,
            },
          },
          outlined: {
            borderColor: darkMode ? c.borderDefault : light.borderDefault,
            color: darkMode ? c.textPrimary : light.textPrimary,
            '&:hover': {
              borderColor: darkMode ? c.accentPrimary : light.accentPrimary,
              backgroundColor: darkMode ? c.accentPrimaryMuted : 'rgba(0, 146, 184, 0.12)',
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
                borderColor: darkMode ? c.accentPrimary : light.accentPrimary,
                borderWidth: '1px',
              },
            },
            '& .MuiInputLabel-root': {
              color: darkMode ? c.textSecondary : light.textSecondary,
              '&.Mui-focused': {
                color: darkMode ? c.accentPrimary : light.accentPrimary,
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
              backgroundColor: darkMode ? c.accentPrimary : light.accentPrimary,
            },
          },
        },
      },

      MuiCircularProgress: {
        styleOverrides: {
          root: {
            color: darkMode ? c.accentPrimary : light.accentPrimary,
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
              color: darkMode ? c.accentPrimary : light.accentPrimary,
              '& + .MuiSwitch-track': {
                backgroundColor: darkMode ? c.accentPrimary : light.accentPrimary,
              },
            },
          },
        },
      },
    },
  });
}
