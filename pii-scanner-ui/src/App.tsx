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
    },
    secondary: {
      main: '#764ba2',
    },
    background: {
      default: '#0a0a0a',
      paper: '#1a1a1a',
    },
  },
  typography: {
    fontFamily: '"Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
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
        <AppBar position="static" sx={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
          <Toolbar>
            <SearchIcon sx={{ mr: 2, fontSize: 32 }} />
            <Typography variant="h5" component="div" sx={{ flexGrow: 1, fontWeight: 700 }}>
              PII Scanner
            </Typography>
            <Typography variant="body2" sx={{ opacity: 0.9 }}>
              v1.0.0
            </Typography>
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
