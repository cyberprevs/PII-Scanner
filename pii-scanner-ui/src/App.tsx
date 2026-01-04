import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Alert, Snackbar, CircularProgress, Box } from '@mui/material';
import { AuthProvider } from './contexts/AuthContext';
import { ErrorBoundary } from './components/ErrorBoundary';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './components/Login';
import InitialSetup from './components/InitialSetup';
import UserManagement from './components/UserManagement';
import MainLayout from './components/Layout/MainLayout';
import DashboardPage from './components/pages/DashboardPage';
import Scanner from './components/pages/Scanner';
import RiskyFiles from './components/pages/RiskyFiles';
import Detections from './components/pages/Detections';
import Staleness from './components/pages/Staleness';
import Exposure from './components/pages/Exposure';
import Reports from './components/pages/Reports';
import Exports from './components/pages/Exports';
import Settings from './components/pages/Settings';
import DataRetention from './components/pages/DataRetention';
import ScanHistory from './components/pages/ScanHistory';
import Profile from './components/pages/Profile';
import DatabaseManagement from './components/pages/DatabaseManagement';
import AuditTrail from './components/pages/AuditTrail';
import Support from './components/pages/Support';
import About from './components/pages/About';
import PiiCategoryAnalysis from './components/pages/PiiCategoryAnalysis';
import DuplicateFiles from './components/pages/DuplicateFiles';
import { scanApi } from './services/apiClient';
import type { ScanResultResponse } from './types';
import axiosInstance, { initializeCsrfToken } from './services/axios';

function App() {
  const [scanning, setScanning] = useState(false);
  const [scanId, setScanId] = useState<string | null>(null);
  const [results, setResults] = useState<ScanResultResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isInitialized, setIsInitialized] = useState<boolean | null>(null);
  const [checkingInit, setCheckingInit] = useState(true);

  // Vérifier si l'application est initialisée et initialiser le token CSRF
  useEffect(() => {
    const checkInitialization = async () => {
      try {
        // Initialiser le token CSRF en premier
        await initializeCsrfToken();

        const response = await axiosInstance.get('/initialization/status');
        setIsInitialized(response.data.isInitialized);
      } catch (err) {
        console.error('Erreur lors de la vérification de l\'initialisation:', err);
        // En cas d'erreur, on assume que l'app n'est pas initialisée
        setIsInitialized(false);
      } finally {
        setCheckingInit(false);
      }
    };

    checkInitialization();
  }, []);

  // Restaurer les résultats du dernier scan depuis localStorage
  useEffect(() => {
    const restoreLastScan = async () => {
      try {
        const savedScanId = localStorage.getItem('lastScanId');
        const savedResults = localStorage.getItem('lastScanResults');

        if (savedScanId && savedResults && !results) {
          // Restaurer depuis localStorage en priorité (plus rapide)
          try {
            const parsedResults = JSON.parse(savedResults);
            setResults(parsedResults);
            setScanId(savedScanId);
            console.log('Résultats du scan restaurés depuis localStorage');
          } catch (parseErr) {
            console.error('Erreur lors du parsing des résultats sauvegardés:', parseErr);
            // Si le parsing échoue, essayer de récupérer depuis l'API
            await fetchResultsFromApi(savedScanId);
          }
        } else if (savedScanId && !savedResults && !results) {
          // Si on a seulement le scanId, récupérer depuis l'API
          await fetchResultsFromApi(savedScanId);
        }
      } catch (err) {
        console.error('Erreur lors de la restauration du scan:', err);
      }
    };

    const fetchResultsFromApi = async (scanId: string) => {
      try {
        const scanResults = await scanApi.getResults(scanId);
        setResults(scanResults);
        setScanId(scanId);
        // Sauvegarder dans localStorage pour la prochaine fois
        localStorage.setItem('lastScanResults', JSON.stringify(scanResults));
        console.log('Résultats du scan récupérés depuis l\'API');
      } catch (apiErr) {
        console.error('Erreur lors de la récupération des résultats depuis l\'API:', apiErr);
        // Nettoyer localStorage si le scan n'est plus disponible
        localStorage.removeItem('lastScanId');
        localStorage.removeItem('lastScanResults');
      }
    };

    // Attendre que l'authentification soit vérifiée avant de restaurer
    if (isInitialized === true && !checkingInit) {
      restoreLastScan();
    }
  }, [isInitialized, checkingInit]);

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

                // Sauvegarder dans localStorage pour persistance
                localStorage.setItem('lastScanId', sid);
                localStorage.setItem('lastScanResults', JSON.stringify(scanResults));
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
        // Sauvegarder le nouveau scanId immédiatement
        localStorage.setItem('lastScanId', response.scanId);
        // Supprimer les anciens résultats (nouveaux résultats seront sauvegardés à la fin du scan)
        localStorage.removeItem('lastScanResults');
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

    // Nettoyer localStorage lors d'un nouveau scan
    localStorage.removeItem('lastScanId');
    localStorage.removeItem('lastScanResults');
  };

  // Afficher un loader pendant la vérification
  if (checkingInit) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '100vh',
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
        }}
      >
        <CircularProgress size={60} sx={{ color: 'white' }} />
      </Box>
    );
  }

  // Si l'app n'est pas initialisée, rediriger vers le setup
  if (isInitialized === false) {
    return (
      <Router>
        <Routes>
          <Route
            path="*"
            element={
              <InitialSetup
                onSetupComplete={() => {
                  // Recharger complètement l'application pour afficher la page de login
                  window.location.reload();
                }}
              />
            }
          />
        </Routes>
      </Router>
    );
  }

  return (
    <ErrorBoundary>
      <AuthProvider>
        <Router>
        <Routes>
          {/* Route publique : Login */}
          <Route path="/login" element={<Login />} />

          {/* Routes protégées */}
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <MainLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route
              path="dashboard"
              element={
                <DashboardPage
                  results={results}
                  onDownloadReport={handleDownloadReport}
                  onNewScan={handleNewScan}
                />
              }
            />
            <Route
              path="scanner"
              element={
                <Scanner
                  scanning={scanning}
                  scanId={scanId}
                  onStartScan={handleStartScan}
                />
              }
            />
            <Route path="risky-files" element={<RiskyFiles results={results} />} />
            <Route path="detections" element={<Detections results={results} />} />
            <Route path="pii-category-analysis" element={<PiiCategoryAnalysis results={results} />} />
            <Route path="duplicate-files" element={<DuplicateFiles results={results} />} />
            <Route path="staleness" element={<Staleness results={results} />} />
            <Route path="exposure" element={<Exposure results={results} />} />
            <Route path="reports" element={<Reports results={results} />} />
            <Route
              path="exports"
              element={
                <Exports
                  scanId={scanId}
                  onDownloadReport={handleDownloadReport}
                />
              }
            />
            <Route path="data-retention" element={<DataRetention />} />
            <Route path="history" element={<ScanHistory />} />
            <Route path="profile" element={<Profile />} />
            <Route path="settings" element={<Settings />} />
            <Route path="support" element={<Support />} />
            <Route path="about" element={<About />} />

            {/* Routes Admin uniquement */}
            <Route
              path="users"
              element={
                <ProtectedRoute requireAdmin>
                  <UserManagement />
                </ProtectedRoute>
              }
            />
            <Route
              path="database"
              element={
                <ProtectedRoute requireAdmin>
                  <DatabaseManagement />
                </ProtectedRoute>
              }
            />
            <Route
              path="audit-trail"
              element={
                <ProtectedRoute requireAdmin>
                  <AuditTrail />
                </ProtectedRoute>
              }
            />
          </Route>
        </Routes>

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
        </Router>
      </AuthProvider>
    </ErrorBoundary>
  );
}

export default App;
