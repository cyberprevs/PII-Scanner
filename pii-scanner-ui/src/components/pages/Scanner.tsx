import { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  TextField,
  LinearProgress,
  Grid,
  Alert,
  Divider,
  Paper,
  Chip,
  Stack,
  IconButton,
  Tooltip,
  Stepper,
  Step,
  StepLabel,
} from '@mui/material';
import FolderOpenIcon from '@mui/icons-material/FolderOpen';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import SearchIcon from '@mui/icons-material/Search';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import HistoryIcon from '@mui/icons-material/History';
import DeleteIcon from '@mui/icons-material/Delete';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import SecurityIcon from '@mui/icons-material/Security';
import { scanApi } from '../../services/apiClient';
import type { ScanProgressResponse } from '../../types';

interface ScannerProps {
  scanning: boolean;
  scanId: string | null;
  onStartScan: (directoryPath: string) => void;
}

export default function Scanner({ scanning, scanId, onStartScan }: ScannerProps) {
  const [directoryPath, setDirectoryPath] = useState('');
  const [progress, setProgress] = useState<ScanProgressResponse | null>(null);
  const [recentPaths, setRecentPaths] = useState<string[]>([]);
  const [pathError, setPathError] = useState('');

  // Load recent paths from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem('recentScanPaths');
    if (stored) {
      try {
        setRecentPaths(JSON.parse(stored));
      } catch (err) {
        console.error('Error loading recent paths:', err);
      }
    }
  }, []);

  useEffect(() => {
    if (!scanning || !scanId) return;

    const interval = setInterval(async () => {
      try {
        const progressData = await scanApi.getProgress(scanId);
        setProgress(progressData);
      } catch (err) {
        console.error('Error fetching progress:', err);
      }
    }, 500);

    return () => clearInterval(interval);
  }, [scanning, scanId]);

  const saveRecentPath = (path: string) => {
    const updated = [path, ...recentPaths.filter(p => p !== path)].slice(0, 5);
    setRecentPaths(updated);
    localStorage.setItem('recentScanPaths', JSON.stringify(updated));
  };

  const removeRecentPath = (path: string) => {
    const updated = recentPaths.filter(p => p !== path);
    setRecentPaths(updated);
    localStorage.setItem('recentScanPaths', JSON.stringify(updated));
  };

  const handleSelectDirectory = async () => {
    if (window.electronAPI) {
      const path = await window.electronAPI.selectDirectory();
      if (path) {
        setDirectoryPath(path);
        setPathError('');
      }
    } else {
      console.log('Electron API non disponible, entrez le chemin manuellement');
    }
  };

  const handleStartScan = () => {
    if (!directoryPath) {
      setPathError('Veuillez sélectionner un dossier à scanner');
      return;
    }

    setPathError('');
    saveRecentPath(directoryPath);
    onStartScan(directoryPath);
  };

  const handlePathChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setDirectoryPath(e.target.value);
    if (pathError) setPathError('');
  };

  const percentage = progress
    ? Math.floor((progress.processedFiles / progress.totalFiles) * 100)
    : 0;

  const activeStep = scanning ? 1 : 0;

  return (
    <Box>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
          <SearchIcon sx={{ fontSize: 40, mr: 2, color: 'primary.main' }} />
          <Typography variant="h4" fontWeight={700}>
            Nouveau Scan
          </Typography>
        </Box>
        <Typography variant="body1" color="text.secondary">
          Démarrez un scan pour détecter automatiquement les données personnelles (PII) dans vos documents
        </Typography>
      </Box>

      {/* Stepper */}
      <Paper sx={{ p: 3, mb: 4 }}>
        <Stepper activeStep={activeStep} alternativeLabel>
          <Step completed={activeStep > 0}>
            <StepLabel>Configuration</StepLabel>
          </Step>
          <Step completed={activeStep > 1}>
            <StepLabel>Analyse en cours</StepLabel>
          </Step>
          <Step>
            <StepLabel>Résultats</StepLabel>
          </Step>
        </Stepper>
      </Paper>

      <Divider sx={{ mb: 4 }} />

      {!scanning ? (
        <Grid container spacing={3}>
          {/* Configuration principale */}
          <Grid item xs={12} lg={8}>
            <Card sx={{ mb: 3 }}>
              <CardContent sx={{ p: 4 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                  <FolderOpenIcon sx={{ fontSize: 28, mr: 1.5, color: 'primary.main' }} />
                  <Typography variant="h6" fontWeight={600}>
                    Sélection du dossier
                  </Typography>
                </Box>

                {/* Path input */}
                <Box sx={{ mb: 3 }}>
                  <Box sx={{ display: 'flex', gap: 2 }}>
                    <TextField
                      fullWidth
                      variant="outlined"
                      value={directoryPath}
                      onChange={handlePathChange}
                      placeholder="C:\Documents\MonDossier ou /home/user/documents"
                      disabled={scanning}
                      error={!!pathError}
                      helperText={pathError || 'Sélectionnez ou saisissez le chemin complet du dossier à analyser'}
                      sx={{ flex: 1 }}
                      InputProps={{
                        sx: { fontSize: '0.95rem' }
                      }}
                    />
                    <Button
                      variant="outlined"
                      onClick={handleSelectDirectory}
                      startIcon={<FolderOpenIcon />}
                      disabled={scanning}
                      sx={{
                        minWidth: 160,
                        height: 56,
                        fontWeight: 600,
                      }}
                    >
                      Parcourir
                    </Button>
                  </Box>
                </Box>

                {/* Recent paths */}
                {recentPaths.length > 0 && (
                  <Box sx={{ mb: 3 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1.5 }}>
                      <HistoryIcon sx={{ fontSize: 20, mr: 1, color: 'text.secondary' }} />
                      <Typography variant="body2" color="text.secondary" fontWeight={500}>
                        Dossiers récents
                      </Typography>
                    </Box>
                    <Stack spacing={1}>
                      {recentPaths.map((path, index) => (
                        <Paper
                          key={index}
                          sx={{
                            p: 1.5,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            cursor: 'pointer',
                            border: '1px solid',
                            borderColor: directoryPath === path ? 'primary.main' : 'divider',
                            bgcolor: directoryPath === path ? 'rgba(102, 126, 234, 0.05)' : 'background.paper',
                            transition: 'all 0.2s',
                            '&:hover': {
                              borderColor: 'primary.main',
                              bgcolor: 'rgba(102, 126, 234, 0.05)',
                            },
                          }}
                          onClick={() => setDirectoryPath(path)}
                        >
                          <Box sx={{ display: 'flex', alignItems: 'center', flex: 1, minWidth: 0 }}>
                            <FolderOpenIcon sx={{ fontSize: 20, mr: 1.5, color: 'primary.main' }} />
                            <Typography
                              variant="body2"
                              sx={{
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                whiteSpace: 'nowrap',
                              }}
                            >
                              {path}
                            </Typography>
                          </Box>
                          <Tooltip title="Supprimer de l'historique">
                            <IconButton
                              size="small"
                              onClick={(e) => {
                                e.stopPropagation();
                                removeRecentPath(path);
                              }}
                              sx={{ ml: 1 }}
                            >
                              <DeleteIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        </Paper>
                      ))}
                    </Stack>
                  </Box>
                )}

                {/* Info boxes */}
                <Grid container spacing={2} sx={{ mb: 3 }}>
                  <Grid item xs={12} sm={6}>
                    <Alert
                      severity="info"
                      icon={<InfoOutlinedIcon />}
                      sx={{ height: '100%' }}
                    >
                      <Typography variant="caption" fontWeight={600} display="block" gutterBottom>
                        Formats supportés
                      </Typography>
                      <Typography variant="caption">
                        .txt, .log, .csv, .json, .docx, .xlsx, .pdf
                      </Typography>
                    </Alert>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Alert
                      severity="success"
                      icon={<CheckCircleIcon />}
                      sx={{ height: '100%' }}
                    >
                      <Typography variant="caption" fontWeight={600} display="block" gutterBottom>
                        Traitement sécurisé
                      </Typography>
                      <Typography variant="caption">
                        100% local - aucune donnée n'est envoyée en ligne
                      </Typography>
                    </Alert>
                  </Grid>
                </Grid>

                {/* Start button */}
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
                    fontWeight: 700,
                    background: directoryPath
                      ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
                      : 'rgba(0, 0, 0, 0.12)',
                    boxShadow: directoryPath ? 3 : 0,
                    '&:hover': {
                      background: directoryPath
                        ? 'linear-gradient(135deg, #5568d3 0%, #653a8b 100%)'
                        : 'rgba(0, 0, 0, 0.12)',
                      boxShadow: directoryPath ? 4 : 0,
                    },
                    '&:disabled': {
                      background: 'rgba(0, 0, 0, 0.12)',
                    },
                  }}
                >
                  Démarrer le scan
                </Button>
              </CardContent>
            </Card>

            {/* Caractéristiques */}
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6} md={3}>
                <Card sx={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
                  <CardContent sx={{ textAlign: 'center', py: 3 }}>
                    <Typography variant="h3" fontWeight={700} color="white">
                      ⚡
                    </Typography>
                    <Typography variant="body2" color="rgba(255,255,255,0.95)" fontWeight={500}>
                      Traitement parallèle
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Card sx={{ background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)' }}>
                  <CardContent sx={{ textAlign: 'center', py: 3 }}>
                    <Typography variant="h3" fontWeight={700} color="white">
                      🔒
                    </Typography>
                    <Typography variant="body2" color="rgba(255,255,255,0.95)" fontWeight={500}>
                      100% local et sécurisé
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Card sx={{ background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)' }}>
                  <CardContent sx={{ textAlign: 'center', py: 3 }}>
                    <Typography variant="h3" fontWeight={700} color="white">
                      📊
                    </Typography>
                    <Typography variant="body2" color="rgba(255,255,255,0.95)" fontWeight={500}>
                      4 formats de rapport
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Card sx={{ background: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)' }}>
                  <CardContent sx={{ textAlign: 'center', py: 3 }}>
                    <Typography variant="h3" fontWeight={700} color="white">
                      🇧🇯
                    </Typography>
                    <Typography variant="body2" color="rgba(255,255,255,0.95)" fontWeight={500}>
                      Conforme APDP Bénin
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </Grid>

          {/* Types de PII - Sidebar */}
          <Grid item xs={12} lg={4}>
            <Card>
              <CardContent sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <SecurityIcon sx={{ fontSize: 28, mr: 1.5, color: 'secondary.main' }} />
                  <Typography variant="h6" fontWeight={600}>
                    20 types de PII détectés
                  </Typography>
                </Box>
                <Typography variant="body2" color="text.secondary" paragraph>
                  Données personnelles détectées automatiquement :
                </Typography>

                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.75, mt: 2 }}>
                  {[
                    { label: 'Adresses email', icon: '📧' },
                    { label: 'Téléphones (+229)', icon: '📞' },
                    { label: 'Cartes bancaires', icon: '💳' },
                    { label: 'IBAN (BJ)', icon: '🏦' },
                    { label: 'Mobile Money', icon: '💰' },
                    { label: 'IFU (13 chiffres)', icon: '🆔' },
                    { label: 'CNI Bénin', icon: '📇' },
                    { label: 'Passeport béninois', icon: '🛂' },
                    { label: 'RCCM', icon: '🏢' },
                    { label: 'Acte de naissance', icon: '📜' },
                    { label: 'CNSS (11 chiffres)', icon: '🏥' },
                    { label: 'RAMU', icon: '💊' },
                    { label: 'INE', icon: '🎓' },
                    { label: 'Matricule fonctionnaire', icon: '👨‍💼' },
                    { label: 'Plaque d\'immatriculation', icon: '🚗' },
                    { label: 'Dates de naissance', icon: '📅' },
                  ].map((item, index) => (
                    <Chip
                      key={index}
                      label={`${item.icon} ${item.label}`}
                      size="small"
                      sx={{
                        justifyContent: 'flex-start',
                        py: 1.5,
                        px: 1.5,
                        bgcolor: 'rgba(103, 126, 234, 0.05)',
                        border: '1px solid',
                        borderColor: 'rgba(103, 126, 234, 0.15)',
                        fontSize: '0.85rem',
                        '&:hover': {
                          bgcolor: 'rgba(103, 126, 234, 0.1)',
                        },
                      }}
                    />
                  ))}
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      ) : (
        <Grid container spacing={3}>
          <Grid item xs={12} lg={8}>
            <Card>
              <CardContent sx={{ p: 4 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                  <SearchIcon sx={{ fontSize: 28, mr: 1.5, color: 'primary.main' }} />
                  <Typography variant="h6" fontWeight={600}>
                    Scan en cours...
                  </Typography>
                </Box>

                <Box sx={{ mb: 4, p: 4, bgcolor: 'background.default', borderRadius: 2 }}>
                  <Grid container spacing={4}>
                    <Grid item xs={12} md={6}>
                      <Box sx={{ textAlign: 'center' }}>
                        <Typography variant="h1" fontWeight={700} color="primary" sx={{ fontSize: '4rem' }}>
                          {percentage}%
                        </Typography>
                        <Typography variant="body1" color="text.secondary" sx={{ mt: 1 }}>
                          Progression globale
                        </Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <Stack spacing={2}>
                        <Box>
                          <Typography variant="caption" color="text.secondary" fontWeight={500}>
                            FICHIERS TRAITÉS
                          </Typography>
                          <Typography variant="h5" fontWeight={700}>
                            {progress
                              ? `${progress.processedFiles.toLocaleString()} / ${progress.totalFiles.toLocaleString()}`
                              : 'Initialisation...'}
                          </Typography>
                        </Box>
                        <Box>
                          <Typography variant="caption" color="text.secondary" fontWeight={500}>
                            PII DÉTECTÉES
                          </Typography>
                          <Typography variant="h5" fontWeight={700} color="secondary">
                            {progress ? progress.piiFound.toLocaleString() : '0'}
                          </Typography>
                        </Box>
                      </Stack>
                    </Grid>
                  </Grid>

                  <Box sx={{ mt: 3 }}>
                    <LinearProgress
                      variant="determinate"
                      value={percentage}
                      sx={{
                        height: 16,
                        borderRadius: 8,
                        bgcolor: 'rgba(103, 126, 234, 0.1)',
                        '& .MuiLinearProgress-bar': {
                          borderRadius: 8,
                          background: 'linear-gradient(90deg, #667eea 0%, #764ba2 100%)',
                        },
                      }}
                    />
                  </Box>
                </Box>

                <Box sx={{ p: 2.5, bgcolor: 'rgba(102, 126, 234, 0.05)', borderRadius: 2, border: '1px solid', borderColor: 'rgba(102, 126, 234, 0.15)' }}>
                  <Typography variant="caption" color="text.secondary" fontWeight={600}>
                    DOSSIER SCANNÉ
                  </Typography>
                  <Typography variant="body2" sx={{ mt: 0.5, wordBreak: 'break-all', fontWeight: 500 }}>
                    📁 {directoryPath}
                  </Typography>
                </Box>

                <Alert severity="warning" sx={{ mt: 3 }}>
                  <Typography variant="body2" fontWeight={500}>
                    Scan en cours : Veuillez patienter pendant l'analyse. Ne fermez pas cette fenêtre.
                  </Typography>
                </Alert>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} lg={4}>
            <Card>
              <CardContent sx={{ p: 3 }}>
                <Typography variant="h6" fontWeight={600} gutterBottom>
                  Statut en temps réel
                </Typography>

                <Box sx={{ mt: 3 }}>
                  <Stack spacing={2.5}>
                    <Box sx={{ p: 2, bgcolor: 'background.default', borderRadius: 2 }}>
                      <Typography variant="caption" color="text.secondary" fontWeight={600}>
                        FICHIERS TRAITÉS
                      </Typography>
                      <Typography variant="h6" fontWeight={700} sx={{ mt: 0.5 }}>
                        {progress ? progress.processedFiles.toLocaleString() : '0'}
                      </Typography>
                    </Box>

                    <Box sx={{ p: 2, bgcolor: 'background.default', borderRadius: 2 }}>
                      <Typography variant="caption" color="text.secondary" fontWeight={600}>
                        FICHIERS TOTAUX
                      </Typography>
                      <Typography variant="h6" fontWeight={700} sx={{ mt: 0.5 }}>
                        {progress ? progress.totalFiles.toLocaleString() : '0'}
                      </Typography>
                    </Box>

                    <Box sx={{ p: 2, bgcolor: 'rgba(118, 75, 162, 0.1)', borderRadius: 2, border: '1px solid', borderColor: 'rgba(118, 75, 162, 0.2)' }}>
                      <Typography variant="caption" color="secondary.main" fontWeight={600}>
                        PII DÉTECTÉES
                      </Typography>
                      <Typography variant="h6" fontWeight={700} color="secondary.main" sx={{ mt: 0.5 }}>
                        {progress ? progress.piiFound.toLocaleString() : '0'}
                      </Typography>
                    </Box>

                    <Box sx={{ p: 2, bgcolor: 'rgba(102, 126, 234, 0.1)', borderRadius: 2, border: '1px solid', borderColor: 'rgba(102, 126, 234, 0.2)' }}>
                      <Typography variant="caption" color="primary.main" fontWeight={600}>
                        PROGRESSION
                      </Typography>
                      <Typography variant="h6" fontWeight={700} color="primary.main" sx={{ mt: 0.5 }}>
                        {percentage}%
                      </Typography>
                    </Box>
                  </Stack>

                  <Divider sx={{ my: 3 }} />

                  <Alert severity="info" icon={<InfoOutlinedIcon />}>
                    <Typography variant="caption">
                      Les résultats complets seront disponibles sur le tableau de bord une fois le scan terminé.
                    </Typography>
                  </Alert>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}
    </Box>
  );
}
