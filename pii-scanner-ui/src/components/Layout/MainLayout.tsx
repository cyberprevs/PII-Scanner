import { useState } from 'react';
import { Box, CssBaseline, ThemeProvider, createTheme } from '@mui/material';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';


export default function MainLayout() {
  const [darkMode, setDarkMode] = useState(false);

  const theme = createTheme({
    palette: {
      mode: darkMode ? 'dark' : 'light',
      primary: {
        main: '#667eea',
      },
      secondary: {
        main: '#764ba2',
      },
      background: {
        default: darkMode ? '#0f1419' : '#f5f7fa',
        paper: darkMode ? '#1a1f37' : '#ffffff',
      },
    },
    typography: {
      fontFamily: '"Plus Jakarta Sans", "Inter", system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
      h1: {
        fontWeight: 800,
        letterSpacing: '-0.02em',
        lineHeight: 1.2,
      },
      h2: {
        fontWeight: 700,
        letterSpacing: '-0.01em',
        lineHeight: 1.25,
      },
      h3: {
        fontWeight: 700,
        letterSpacing: '-0.01em',
        lineHeight: 1.3,
      },
      h4: {
        fontWeight: 700,
        letterSpacing: '-0.005em',
        lineHeight: 1.35,
      },
      h5: {
        fontWeight: 600,
        letterSpacing: '0em',
        lineHeight: 1.4,
      },
      h6: {
        fontWeight: 600,
        letterSpacing: '0em',
        lineHeight: 1.4,
      },
      subtitle1: {
        fontWeight: 600,
        letterSpacing: '0.005em',
        lineHeight: 1.5,
      },
      subtitle2: {
        fontWeight: 600,
        letterSpacing: '0.005em',
        lineHeight: 1.5,
      },
      body1: {
        fontWeight: 400,
        letterSpacing: '0.01em',
        lineHeight: 1.6,
      },
      body2: {
        fontWeight: 400,
        letterSpacing: '0.01em',
        lineHeight: 1.5,
      },
      button: {
        fontWeight: 600,
        letterSpacing: '0.02em',
        textTransform: 'none',
      },
      caption: {
        fontWeight: 400,
        letterSpacing: '0.02em',
        lineHeight: 1.4,
      },
      overline: {
        fontWeight: 600,
        letterSpacing: '0.08em',
        lineHeight: 1.5,
      },
    },
    components: {
      MuiButton: {
        styleOverrides: {
          root: {
            borderRadius: 8,
            textTransform: 'none',
            fontWeight: 600,
            letterSpacing: '0.02em',
            padding: '8px 16px',
          },
          sizeLarge: {
            padding: '12px 24px',
            fontSize: '1rem',
          },
          sizeMedium: {
            padding: '8px 16px',
            fontSize: '0.9375rem',
          },
          sizeSmall: {
            padding: '6px 12px',
            fontSize: '0.875rem',
          },
        },
      },
      MuiCard: {
        styleOverrides: {
          root: {
            borderRadius: 12,
            boxShadow: darkMode
              ? '0 4px 6px rgba(0, 0, 0, 0.3)'
              : '0 4px 6px rgba(0, 0, 0, 0.07)',
          },
        },
      },
      MuiChip: {
        styleOverrides: {
          root: {
            fontWeight: 500,
            letterSpacing: '0.01em',
          },
        },
      },
      MuiTypography: {
        styleOverrides: {
          root: {
            // Améliore le rendu des polices
            WebkitFontSmoothing: 'antialiased',
            MozOsxFontSmoothing: 'grayscale',
          },
        },
      },
    },
  });

  const handleToggleDarkMode = () => {
    setDarkMode(!darkMode);
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box sx={{ display: 'flex', minHeight: '100vh' }}>
        <Sidebar darkMode={darkMode} onToggleDarkMode={handleToggleDarkMode} />
        <Box
          component="main"
          sx={{
            flexGrow: 1,
            p: 3,
            marginLeft: 0,
            transition: 'margin-left 0.3s ease',
            backgroundColor: 'background.default',
            minHeight: '100vh',
          }}
        >
          <Outlet />
        </Box>
      </Box>
    </ThemeProvider>
  );
}
