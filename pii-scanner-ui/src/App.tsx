import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Alert, Snackbar } from '@mui/material';
import MainLayout from './components/Layout/MainLayout';
import Home from './components/pages/Home';
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
import { scanApi } from './services/apiClient';
import type { ScanResultResponse } from './types';

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
    <Router>
      <Routes>
        <Route path="/" element={<MainLayout />}>
          <Route index element={<Home />} />
          <Route
            path="dashboard"
            element={
              results ? (
                <DashboardPage
                  results={results}
                  onDownloadReport={handleDownloadReport}
                  onNewScan={handleNewScan}
                />
              ) : (
                <Home />
              )
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
          <Route path="settings" element={<Settings />} />
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
  );
}

export default App;
