import { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  TextField,
  LinearProgress,
  Paper,
  Chip,
  Alert,
} from '@mui/material';
import FolderOpenIcon from '@mui/icons-material/FolderOpen';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import { scanApi } from '../services/apiClient';
import type { ScanProgressResponse } from '../types';

interface DashboardProps {
  scanning: boolean;
  scanId: string | null;
  onStartScan: (directoryPath: string) => void;
}

export default function Dashboard({ scanning, scanId, onStartScan }: DashboardProps) {
  const [directoryPath, setDirectoryPath] = useState('');
  const [progress, setProgress] = useState<ScanProgressResponse | null>(null);

  useEffect(() => {
    if (!scanning || !scanId) return;

    const interval = setInterval(async () => {
      try {
        const progressData = await scanApi.getProgress(scanId);
        setProgress(progressData);
      } catch (err) {
        console.error('Error fetching progress:', err);
      }
    }, 500); // Poll every 500ms

    return () => clearInterval(interval);
  }, [scanning, scanId]);

  const handleSelectDirectory = async () => {
    if (window.electronAPI) {
      const path = await window.electronAPI.selectDirectory();
      if (path) {
        setDirectoryPath(path);
      }
    } else {
      // Fallback pour le dev web sans Electron
      // Utiliser le TextField manuellement
      console.log('Electron API non disponible, entrez le chemin manuellement dans le champ de texte');
    }
  };

  const handleStartScan = () => {
    if (directoryPath) {
      onStartScan(directoryPath);
    }
  };

  const percentage = progress
    ? Math.floor((progress.processedFiles / progress.totalFiles) * 100)
    : 0;

  return (
    <Box sx={{ maxWidth: 900, mx: 'auto' }}>
      <Card sx={{ mb: 4, background: 'linear-gradient(135deg, #667eea22 0%, #764ba222 100%)' }}>
        <CardContent sx={{ p: 4 }}>
          <Typography variant="h4" component="h1" gutterBottom fontWeight={700}>
            Scanner de Données Personnelles (PII)
          </Typography>
          <Typography variant="body1" color="text.secondary" paragraph>
            Détectez automatiquement les informations sensibles dans vos fichiers pour assurer votre
            conformité RGPD/DPA.
          </Typography>

          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', mt: 2 }}>
            <Chip label="📧 Email" size="small" />
            <Chip label="📞 Téléphones" size="small" />
            <Chip label="💳 Cartes bancaires" size="small" />
            <Chip label="🏦 IBAN" size="small" />
            <Chip label="🆔 Numéro Sécu" size="small" />
            <Chip label="📅 Dates de naissance" size="small" />
            <Chip label="🌐 Adresses IP" size="small" />
          </Box>
        </CardContent>
      </Card>

      {!scanning ? (
        <Card>
          <CardContent sx={{ p: 4 }}>
            <Typography variant="h6" gutterBottom fontWeight={600}>
              Configuration du Scan
            </Typography>

            <Box sx={{ mt: 3 }}>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Dossier à scanner
              </Typography>
              <Box sx={{ display: 'flex', gap: 2, mt: 1 }}>
                <TextField
                  fullWidth
                  variant="outlined"
                  value={directoryPath}
                  onChange={(e) => setDirectoryPath(e.target.value)}
                  placeholder="Sélectionnez un dossier..."
                  disabled={scanning}
                  sx={{ flex: 1 }}
                />
                <Button
                  variant="outlined"
                  onClick={handleSelectDirectory}
                  startIcon={<FolderOpenIcon />}
                  disabled={scanning}
                  sx={{ minWidth: 150 }}
                >
                  Parcourir
                </Button>
              </Box>
            </Box>

            <Box sx={{ mt: 4 }}>
              <Button
                variant="contained"
                size="large"
                fullWidth
                onClick={handleStartScan}
                disabled={!directoryPath || scanning}
                startIcon={<PlayArrowIcon />}
                sx={{
                  py: 2,
                  fontSize: '1.1rem',
                  fontWeight: 600,
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  '&:hover': {
                    background: 'linear-gradient(135deg, #5568d3 0%, #653a8b 100%)',
                  },
                }}
              >
                Démarrer le Scan
              </Button>
            </Box>

            <Alert severity="info" sx={{ mt: 3 }}>
              <strong>Formats supportés :</strong> .txt, .log, .csv, .json, .docx, .xlsx, .pdf
            </Alert>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent sx={{ p: 4 }}>
            <Typography variant="h6" gutterBottom fontWeight={600}>
              Scan en cours...
            </Typography>

            <Paper sx={{ p: 3, mt: 2, bgcolor: 'background.default' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Box sx={{ flex: 1 }}>
                  <Typography variant="h3" fontWeight={700} color="primary">
                    {percentage}%
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {progress
                      ? `${progress.processedFiles} / ${progress.totalFiles} fichiers`
                      : 'Initialisation...'}
                  </Typography>
                </Box>
                {progress && (
                  <Box sx={{ textAlign: 'right' }}>
                    <Typography variant="h4" fontWeight={700} color="secondary">
                      {progress.piiFound}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      PII détectées
                    </Typography>
                  </Box>
                )}
              </Box>

              <LinearProgress
                variant="determinate"
                value={percentage}
                sx={{
                  height: 10,
                  borderRadius: 5,
                  bgcolor: 'rgba(103, 126, 234, 0.1)',
                  '& .MuiLinearProgress-bar': {
                    borderRadius: 5,
                    background: 'linear-gradient(90deg, #667eea 0%, #764ba2 100%)',
                  },
                }}
              />

              <Box sx={{ mt: 2 }}>
                <Typography variant="body2" color="text.secondary">
                  📁 {directoryPath}
                </Typography>
              </Box>
            </Paper>

            <Alert severity="warning" sx={{ mt: 3 }}>
              Veuillez patienter pendant le scan. Ne fermez pas cette fenêtre.
            </Alert>
          </CardContent>
        </Card>
      )}

      <Card sx={{ mt: 3 }}>
        <CardContent>
          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
            <Box sx={{ flex: '1 1 250px' }}>
              <Paper sx={{ p: 2, textAlign: 'center', bgcolor: 'background.default' }}>
                <Typography variant="h6" color="primary" fontWeight={600}>
                  ⚡
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Traitement parallèle
                </Typography>
              </Paper>
            </Box>
            <Box sx={{ flex: '1 1 250px' }}>
              <Paper sx={{ p: 2, textAlign: 'center', bgcolor: 'background.default' }}>
                <Typography variant="h6" color="primary" fontWeight={600}>
                  🔒
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  100% local et sécurisé
                </Typography>
              </Paper>
            </Box>
            <Box sx={{ flex: '1 1 250px' }}>
              <Paper sx={{ p: 2, textAlign: 'center', bgcolor: 'background.default' }}>
                <Typography variant="h6" color="primary" fontWeight={600}>
                  📊
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  4 formats de rapport
                </Typography>
              </Paper>
            </Box>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
}
