import { useState, useEffect } from 'react';
import {
  ThemeProvider,
  createTheme,
  CssBaseline,
  Container,
  Box,
  AppBar,
  Toolbar,
  Typography,
  Alert,
  Snackbar,
  Chip,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import Dashboard from './components/Dashboard';
import Results from './components/Results';
import { scanApi } from './services/apiClient';
import type { ScanResultResponse } from './types';

const darkTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#667eea',
      light: '#8b9ef5',
      dark: '#4c5fd4',
    },
    secondary: {
      main: '#764ba2',
      light: '#9b6ac9',
      dark: '#5a3880',
    },
    background: {
      default: '#0f0f23',
      paper: '#1a1a2e',
    },
    text: {
      primary: '#e8e8f0',
      secondary: '#b0b0c8',
    },
    success: {
      main: '#43e97b',
    },
    warning: {
      main: '#ffa726',
    },
    error: {
      main: '#f5576c',
    },
  },
  typography: {
    fontFamily: '"Inter", "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
    h5: {
      fontWeight: 700,
      letterSpacing: '-0.02em',
    },
    h6: {
      fontWeight: 600,
      letterSpacing: '-0.01em',
    },
  },
  shape: {
    borderRadius: 12,
  },
  components: {
    MuiCard: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(255, 255, 255, 0.05)',
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          '&:hover': {
            transform: 'translateY(-2px)',
            boxShadow: '0 12px 40px rgba(102, 126, 234, 0.15)',
            borderColor: 'rgba(102, 126, 234, 0.2)',
          },
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 10,
          textTransform: 'none',
          fontWeight: 600,
          padding: '10px 24px',
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          '&:hover': {
            transform: 'translateY(-2px)',
            boxShadow: '0 8px 24px rgba(102, 126, 234, 0.3)',
          },
        },
        contained: {
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          '&:hover': {
            background: 'linear-gradient(135deg, #7b8ff0 0%, #8b5fb8 100%)',
          },
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          fontWeight: 500,
          borderRadius: 8,
        },
      },
    },
    MuiLinearProgress: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          height: 8,
          backgroundColor: 'rgba(102, 126, 234, 0.1)',
        },
        bar: {
          borderRadius: 8,
          background: 'linear-gradient(90deg, #667eea 0%, #764ba2 100%)',
        },
      },
    },
  },
});

function App() {
  const [scanning, setScanning] = useState(false);
  const [scanId, setScanId] = useState<string | null>(null);
  const [results, setResults] = useState<ScanResultResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    // Connecter SignalR au démarrage
    const connectSignalR = async () => {
      try {
        await scanApi.connectSignalR(
          (_sid, current, total) => {
            console.log(`Progress: ${current}/${total}`);
          },
          async (sid) => {
            console.log('Scan completed:', sid);
            if (sid === scanId) {
              try {
                const scanResults = await scanApi.getResults(sid);
                setResults(scanResults);
                setScanning(false);
                setSuccessMessage('Scan terminé avec succès !');
              } catch (err) {
                console.error('Error fetching results:', err);
                setError('Erreur lors de la récupération des résultats');
                setScanning(false);
              }
            }
          },
          (sid, errorMsg) => {
            console.error('Scan error:', sid, errorMsg);
            if (sid === scanId) {
              setError(`Erreur: ${errorMsg}`);
              setScanning(false);
            }
          }
        );
      } catch (err) {
        console.error('SignalR connection failed:', err);
        setError('Impossible de se connecter au serveur en temps réel');
      }
    };

    connectSignalR();

    return () => {
      scanApi.disconnectSignalR();
    };
  }, [scanId]);

  const handleStartScan = async (directoryPath: string) => {
    try {
      setScanning(true);
      setResults(null);
      setError(null);

      const response = await scanApi.startScan({ directoryPath });

      if (response.status === 'started') {
        setScanId(response.scanId);
      } else {
        throw new Error(response.message || 'Échec du démarrage du scan');
      }
    } catch (err: any) {
      console.error('Start scan error:', err);
      setError(err.message || 'Erreur lors du démarrage du scan');
      setScanning(false);
    }
  };

  const handleDownloadReport = async (format: 'csv' | 'json' | 'html' | 'excel') => {
    if (!scanId) return;

    try {
      const blob = await scanApi.downloadReport(scanId, format);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `rapport_pii.${format === 'excel' ? 'xlsx' : format}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      setSuccessMessage(`Rapport ${format.toUpperCase()} téléchargé !`);
    } catch (err) {
      console.error('Download error:', err);
      setError(`Erreur lors du téléchargement du rapport ${format}`);
    }
  };

  const handleNewScan = () => {
    setResults(null);
    setScanId(null);
    setScanning(false);
  };

  return (
    <ThemeProvider theme={darkTheme}>
      <CssBaseline />
      <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
        <AppBar
          position="static"
          elevation={0}
          sx={{
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            backdropFilter: 'blur(20px)',
            borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
          }}
        >
          <Toolbar sx={{ py: 1 }}>
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 2,
                animation: 'fadeInLeft 0.6s ease-out',
                '@keyframes fadeInLeft': {
                  from: {
                    opacity: 0,
                    transform: 'translateX(-20px)',
                  },
                  to: {
                    opacity: 1,
                    transform: 'translateX(0)',
                  },
                },
              }}
            >
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: 48,
                  height: 48,
                  borderRadius: '12px',
                  background: 'rgba(255, 255, 255, 0.1)',
                  backdropFilter: 'blur(10px)',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                }}
              >
                <SearchIcon sx={{ fontSize: 28 }} />
              </Box>
              <Typography variant="h5" component="div" sx={{ fontWeight: 700, letterSpacing: '-0.02em' }}>
                PII Scanner
              </Typography>
            </Box>
            <Box sx={{ flexGrow: 1 }} />
            <Chip
              label="v1.0.0"
              size="small"
              sx={{
                background: 'rgba(255, 255, 255, 0.15)',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                color: 'white',
                fontWeight: 600,
              }}
            />
          </Toolbar>
        </AppBar>

        <Container maxWidth="xl" sx={{ mt: 4, mb: 4, flex: 1 }}>
          {!results ? (
            <Dashboard
              scanning={scanning}
              scanId={scanId}
              onStartScan={handleStartScan}
            />
          ) : (
            <Results
              results={results}
              onDownloadReport={handleDownloadReport}
              onNewScan={handleNewScan}
            />
          )}
        </Container>

        <Box
          component="footer"
          sx={{
            py: 2,
            px: 2,
            mt: 'auto',
            backgroundColor: 'background.paper',
            textAlign: 'center',
          }}
        >
          <Typography variant="body2" color="text.secondary">
            🔒 PII Scanner - Conformité RGPD • Toutes les données restent locales
          </Typography>
        </Box>

        {/* Notifications */}
        <Snackbar
          open={!!error}
          autoHideDuration={6000}
          onClose={() => setError(null)}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        >
          <Alert onClose={() => setError(null)} severity="error" sx={{ width: '100%' }}>
            {error}
          </Alert>
        </Snackbar>

        <Snackbar
          open={!!successMessage}
          autoHideDuration={3000}
          onClose={() => setSuccessMessage(null)}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        >
          <Alert onClose={() => setSuccessMessage(null)} severity="success" sx={{ width: '100%' }}>
            {successMessage}
          </Alert>
        </Snackbar>
      </Box>
    </ThemeProvider>
  );
}

export default App;
