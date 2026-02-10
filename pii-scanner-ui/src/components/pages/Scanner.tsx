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
  Paper,
  Chip,
  Stack,
  IconButton,
  Tooltip,
} from '@mui/material';
import FolderOpenIcon from '@mui/icons-material/FolderOpen';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import SearchIcon from '@mui/icons-material/Search';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import HistoryIcon from '@mui/icons-material/History';
import DeleteIcon from '@mui/icons-material/Delete';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import SecurityIcon from '@mui/icons-material/Security';
import StopIcon from '@mui/icons-material/Stop';
import { scanApi } from '../../services/apiClient';
import { useAuth } from '../../contexts/AuthContext';
import type { ScanProgressResponse } from '../../types';
import { useKeyboardShortcut } from '../../hooks/useKeyboardShortcut';

interface ScannerProps {
  scanning: boolean;
  scanId: string | null;
  onStartScan: (directoryPath: string) => void;
  onStopScan: () => void;
}

export default function Scanner({ scanning, scanId, onStartScan, onStopScan }: ScannerProps) {
  const { user } = useAuth();
  const [directoryPath, setDirectoryPath] = useState('');
  const [progress, setProgress] = useState<ScanProgressResponse | null>(null);
  const [recentPaths, setRecentPaths] = useState<string[]>([]);
  const [pathError, setPathError] = useState('');

  // Get user-specific localStorage key
  const getRecentPathsKey = () => {
    return user ? `recentScanPaths_${user.username}` : 'recentScanPaths';
  };

  // Load recent paths from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem(getRecentPathsKey());
    if (stored) {
      try {
        setRecentPaths(JSON.parse(stored));
      } catch (err) {
        console.error('Error loading recent paths:', err);
      }
    }
  }, [user]);

  useEffect(() => {
    if (!scanning || !scanId) return;

    const interval = setInterval(async () => {
      try {
        const progressData = await scanApi.getProgress(scanId);
        setProgress(progressData);
      } catch (err) {
        console.error('Error fetching progress:', err);
      }
    }, 2000);

    return () => clearInterval(interval);
  }, [scanning, scanId]);

  const saveRecentPath = (path: string) => {
    const updated = [path, ...recentPaths.filter(p => p !== path)].slice(0, 5);
    setRecentPaths(updated);
    localStorage.setItem(getRecentPathsKey(), JSON.stringify(updated));
  };

  const removeRecentPath = (path: string) => {
    const updated = recentPaths.filter(p => p !== path);
    setRecentPaths(updated);
    localStorage.setItem(getRecentPathsKey(), JSON.stringify(updated));
  };

  const handleStartScan = () => {
    if (!directoryPath) {
      setPathError('Veuillez saisir un chemin de dossier');
      return;
    }

    setPathError('');
    saveRecentPath(directoryPath);
    onStartScan(directoryPath);
  };

  // Raccourci clavier Ctrl+S pour lancer le scan
  useKeyboardShortcut({
    key: 's',
    ctrlKey: true,
    callback: handleStartScan,
    enabled: !scanning && !!directoryPath,
    preventDefault: true, // Empêche la boîte de dialogue "Enregistrer la page" du navigateur
  });

  const handlePathChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setDirectoryPath(e.target.value);
    if (pathError) setPathError('');
  };

  const percentage = progress
    ? Math.floor((progress.processedFiles / progress.totalFiles) * 100)
    : 0;

  return (
    <Box>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" fontWeight={700} gutterBottom sx={{
          background: 'linear-gradient(135deg, #00E599 0%, #00B876 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
        }}>
          {scanning ? 'Scan en cours' : 'Nouveau Scan'}
        </Typography>
        <Typography variant="body1" color="text.secondary">
          {scanning
            ? 'Analyse de vos documents en cours...'
            : 'Démarrez un scan pour détecter automatiquement les données personnelles (PII)'}
        </Typography>
      </Box>

      {!scanning ? (
        <Grid container spacing={3}>
          {/* Configuration principale */}
          <Grid item xs={12} lg={8}>
            <Card sx={{
              background: 'linear-gradient(135deg, rgba(0, 229, 153, 0.03) 0%, rgba(0, 229, 153, 0.03) 100%)',
              border: '1px solid',
              borderColor: 'divider',
            }}>
              <CardContent sx={{ p: 4 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                  <FolderOpenIcon sx={{ fontSize: 32, mr: 2, color: 'primary.main' }} />
                  <Typography variant="h6" fontWeight={600}>
                    Sélection du dossier
                  </Typography>
                </Box>

                {/* Path input */}
                <TextField
                  fullWidth
                  variant="outlined"
                  value={directoryPath}
                  onChange={handlePathChange}
                  placeholder="Exemple: C:\Documents\MonDossier ou /home/user/documents"
                  disabled={scanning}
                  error={!!pathError}
                  helperText={pathError || 'Saisissez le chemin complet du dossier à analyser'}
                  sx={{ mb: 3 }}
                  InputProps={{
                    startAdornment: <FolderOpenIcon sx={{ mr: 1, color: 'text.secondary' }} />,
                    sx: {
                      fontSize: '0.95rem',
                      bgcolor: 'background.paper',
                    }
                  }}
                />

                {/* Recent paths */}
                {recentPaths.length > 0 && (
                  <Box sx={{ mb: 3 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <HistoryIcon sx={{ fontSize: 20, mr: 1, color: 'text.secondary' }} />
                      <Typography variant="body2" color="text.secondary" fontWeight={600}>
                        Dossiers récents
                      </Typography>
                    </Box>
                    <Stack spacing={1}>
                      {recentPaths.map((path, index) => (
                        <Paper
                          key={index}
                          elevation={0}
                          sx={{
                            p: 2,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            cursor: 'pointer',
                            border: '1px solid',
                            borderColor: directoryPath === path ? 'primary.main' : 'divider',
                            bgcolor: directoryPath === path ? 'rgba(0, 229, 153, 0.08)' : 'background.paper',
                            transition: 'all 0.2s',
                            '&:hover': {
                              borderColor: 'primary.main',
                              bgcolor: 'rgba(0, 229, 153, 0.08)',
                              transform: 'translateX(4px)',
                            },
                          }}
                          onClick={() => setDirectoryPath(path)}
                        >
                          <Box sx={{ display: 'flex', alignItems: 'center', flex: 1, minWidth: 0 }}>
                            <FolderOpenIcon sx={{ fontSize: 20, mr: 2, color: 'primary.main', flexShrink: 0 }} />
                            <Typography
                              variant="body2"
                              fontWeight={500}
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
                              sx={{ ml: 2 }}
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
                      sx={{
                        height: '100%',
                        '& .MuiAlert-message': { width: '100%' }
                      }}
                    >
                      <Typography variant="caption" fontWeight={600} display="block" gutterBottom>
                        Formats supportés
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        .txt, .log, .csv, .json, .docx, .xlsx, .pdf
                      </Typography>
                    </Alert>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Alert
                      severity="success"
                      icon={<CheckCircleIcon />}
                      sx={{
                        height: '100%',
                        '& .MuiAlert-message': { width: '100%' }
                      }}
                    >
                      <Typography variant="caption" fontWeight={600} display="block" gutterBottom>
                        Traitement sécurisé
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        100% local - aucune donnée envoyée en ligne
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
                      ? 'linear-gradient(135deg, #00E599 0%, #00B876 100%)'
                      : undefined,
                    boxShadow: directoryPath ? 3 : 0,
                    '&:hover': {
                      background: directoryPath
                        ? 'linear-gradient(135deg, #00CC88 0%, #00A86B 100%)'
                        : undefined,
                      boxShadow: directoryPath ? 6 : 0,
                      transform: 'translateY(-2px)',
                    },
                    transition: 'all 0.2s',
                  }}
                >
                  Démarrer le scan
                </Button>
              </CardContent>
            </Card>
          </Grid>

          {/* Section droite - Types de PII */}
          <Grid item xs={12} lg={4}>
            <Card sx={{
              height: '100%',
              background: 'linear-gradient(135deg, rgba(0, 229, 153, 0.05) 0%, rgba(0, 229, 153, 0.05) 100%)',
              border: '1px solid',
              borderColor: 'divider',
            }}>
              <CardContent sx={{ p: 4 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                  <SecurityIcon sx={{ fontSize: 28, mr: 1.5, color: 'secondary.main' }} />
                  <Typography variant="h6" fontWeight={600}>
                    17 types de PII
                  </Typography>
                </Box>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                  Données détectées automatiquement :
                </Typography>

                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                  {[
                    'Email', 'Date naissance', 'Carte bancaire', 'IFU', 'CNI',
                    'Passeport', 'RCCM', 'Acte naissance', 'Téléphone', 'IBAN',
                    'MTN MoMo', 'Moov Money', 'CNSS', 'RAMU', 'INE',
                    'Matricule', 'Plaque'
                  ].map((item, index) => (
                    <Chip
                      key={index}
                      label={item}
                      size="small"
                      sx={{
                        bgcolor: 'rgba(0, 229, 153, 0.1)',
                        border: '1px solid',
                        borderColor: 'rgba(0, 229, 153, 0.2)',
                        fontSize: '0.75rem',
                        fontWeight: 500,
                        '&:hover': {
                          bgcolor: 'rgba(0, 229, 153, 0.2)',
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
          {/* Scan en cours */}
          <Grid item xs={12} lg={8}>
            <Card sx={{
              background: 'linear-gradient(135deg, rgba(0, 229, 153, 0.03) 0%, rgba(0, 229, 153, 0.03) 100%)',
              border: '1px solid',
              borderColor: 'divider',
            }}>
              <CardContent sx={{ p: 4 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 4 }}>
                  <SearchIcon sx={{ fontSize: 32, mr: 2, color: 'primary.main' }} />
                  <Typography variant="h6" fontWeight={600}>
                    Analyse en cours...
                  </Typography>
                </Box>

                <Paper elevation={0} sx={{ mb: 4, p: 4, bgcolor: 'background.paper', borderRadius: 3 }}>
                  <Grid container spacing={3} sx={{ mb: 3 }}>
                    <Grid item xs={12} sm={6}>
                      <Box sx={{ textAlign: 'center' }}>
                        <Typography variant="h1" fontWeight={700} sx={{
                          fontSize: '4rem',
                          background: 'linear-gradient(135deg, #00E599 0%, #00B876 100%)',
                          WebkitBackgroundClip: 'text',
                          WebkitTextFillColor: 'transparent',
                        }}>
                          {percentage}%
                        </Typography>
                        <Typography variant="body2" color="text.secondary" fontWeight={500}>
                          Progression globale
                        </Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Stack spacing={2.5}>
                        <Box>
                          <Typography variant="caption" color="text.secondary" fontWeight={600} sx={{ fontSize: '0.7rem', letterSpacing: '0.5px' }}>
                            FICHIERS TRAITÉS
                          </Typography>
                          <Typography variant="h6" fontWeight={700} sx={{ mt: 0.5 }}>
                            {progress
                              ? `${progress.processedFiles.toLocaleString()} / ${progress.totalFiles.toLocaleString()}`
                              : 'Initialisation...'}
                          </Typography>
                        </Box>
                        <Box>
                          <Typography variant="caption" fontWeight={600} sx={{ fontSize: '0.7rem', letterSpacing: '0.5px', color: 'secondary.main' }}>
                            PII DÉTECTÉES
                          </Typography>
                          <Typography variant="h6" fontWeight={700} color="secondary.main" sx={{ mt: 0.5 }}>
                            {progress ? progress.piiFound.toLocaleString() : '0'}
                          </Typography>
                        </Box>
                      </Stack>
                    </Grid>
                  </Grid>

                  <LinearProgress
                    variant="determinate"
                    value={percentage}
                    sx={{
                      height: 16,
                      borderRadius: 8,
                      bgcolor: 'rgba(0, 229, 153, 0.15)',
                      '& .MuiLinearProgress-bar': {
                        borderRadius: 8,
                        background: 'linear-gradient(90deg, #00E599 0%, #00B876 100%)',
                      },
                    }}
                  />
                </Paper>

                {/* Bouton Arrêter le scan */}
                <Box sx={{ mt: 3, mb: 3, display: 'flex', justifyContent: 'center' }}>
                  <Button
                    variant="outlined"
                    color="error"
                    size="large"
                    onClick={onStopScan}
                    startIcon={<StopIcon />}
                    sx={{
                      minWidth: 200,
                      borderWidth: 2,
                      '&:hover': {
                        borderWidth: 2,
                      },
                    }}
                  >
                    Arrêter le scan (Esc)
                  </Button>
                </Box>

                <Alert severity="info" icon={<FolderOpenIcon />} sx={{ mb: 2 }}>
                  <Typography variant="caption" color="text.secondary" fontWeight={600} display="block" gutterBottom>
                    DOSSIER SCANNÉ
                  </Typography>
                  <Typography variant="body2" sx={{ wordBreak: 'break-all', fontWeight: 500 }}>
                    {directoryPath}
                  </Typography>
                </Alert>

                <Alert severity="warning">
                  <Typography variant="body2" fontWeight={500}>
                    Scan en cours - Ne fermez pas cette fenêtre
                  </Typography>
                </Alert>
              </CardContent>
            </Card>
          </Grid>

          {/* Statistiques en temps réel */}
          <Grid item xs={12} lg={4}>
            <Card sx={{
              background: 'linear-gradient(135deg, rgba(0, 229, 153, 0.05) 0%, rgba(0, 229, 153, 0.05) 100%)',
              border: '1px solid',
              borderColor: 'divider',
            }}>
              <CardContent sx={{ p: 3 }}>
                <Typography variant="subtitle1" fontWeight={600} gutterBottom>
                  Statut en temps réel
                </Typography>

                <Stack spacing={2} sx={{ mt: 3 }}>
                  <Paper elevation={0} sx={{ p: 2, bgcolor: 'background.paper', borderRadius: 2 }}>
                    <Typography variant="caption" color="text.secondary" fontWeight={600} sx={{ fontSize: '0.7rem', letterSpacing: '0.5px' }}>
                      FICHIERS TRAITÉS
                    </Typography>
                    <Typography variant="h5" fontWeight={700} sx={{ mt: 1 }}>
                      {progress ? progress.processedFiles.toLocaleString() : '0'}
                    </Typography>
                  </Paper>

                  <Paper elevation={0} sx={{ p: 2, bgcolor: 'background.paper', borderRadius: 2 }}>
                    <Typography variant="caption" color="text.secondary" fontWeight={600} sx={{ fontSize: '0.7rem', letterSpacing: '0.5px' }}>
                      FICHIERS TOTAUX
                    </Typography>
                    <Typography variant="h5" fontWeight={700} sx={{ mt: 1 }}>
                      {progress ? progress.totalFiles.toLocaleString() : '0'}
                    </Typography>
                  </Paper>

                  <Paper elevation={0} sx={{ p: 2, bgcolor: 'rgba(0, 229, 153, 0.1)', borderRadius: 2, border: '1px solid', borderColor: 'rgba(0, 229, 153, 0.3)' }}>
                    <Typography variant="caption" fontWeight={600} sx={{ fontSize: '0.7rem', letterSpacing: '0.5px', color: 'secondary.main' }}>
                      PII DÉTECTÉES
                    </Typography>
                    <Typography variant="h5" fontWeight={700} color="secondary.main" sx={{ mt: 1 }}>
                      {progress ? progress.piiFound.toLocaleString() : '0'}
                    </Typography>
                  </Paper>

                  <Paper elevation={0} sx={{ p: 2, bgcolor: 'rgba(0, 229, 153, 0.1)', borderRadius: 2, border: '1px solid', borderColor: 'rgba(0, 229, 153, 0.3)' }}>
                    <Typography variant="caption" fontWeight={600} sx={{ fontSize: '0.7rem', letterSpacing: '0.5px', color: 'primary.main' }}>
                      PROGRESSION
                    </Typography>
                    <Typography variant="h5" fontWeight={700} color="primary.main" sx={{ mt: 1 }}>
                      {percentage}%
                    </Typography>
                  </Paper>
                </Stack>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}
    </Box>
  );
}
