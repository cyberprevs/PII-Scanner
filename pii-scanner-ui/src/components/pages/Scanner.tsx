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
import { useAuth } from '../../contexts/AuthContext';
import type { ScanProgressResponse } from '../../types';

interface ScannerProps {
  scanning: boolean;
  scanId: string | null;
  onStartScan: (directoryPath: string) => void;
}

export default function Scanner({ scanning, scanId, onStartScan }: ScannerProps) {
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
    }, 2000); // 2 secondes - Compatible avec rate limiting (100 req/min = 30 req/min max)

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

  const handleSelectDirectory = async () => {
    try {
      // Vérifier si l'API File System Access est supportée (Chrome, Edge modernes)
      if ('showDirectoryPicker' in window) {
        const directoryHandle = await (window as any).showDirectoryPicker();
        // On ne peut pas obtenir le chemin complet pour des raisons de sécurité
        // On affiche le nom du dossier et on demande à l'utilisateur de saisir le chemin complet
        alert(`Dossier sélectionné : ${directoryHandle.name}\n\nPour des raisons de sécurité navigateur, veuillez saisir le chemin complet du dossier dans le champ ci-dessous.\n\nExemple Windows : C:\\Users\\Votre Nom\\Documents\\${directoryHandle.name}\nExemple Linux/Mac : /home/votre-nom/documents/${directoryHandle.name}`);
      } else {
        // Navigateur non supporté
        alert('Sélection de dossier non supportée dans ce navigateur.\n\nVeuillez saisir le chemin complet du dossier manuellement dans le champ ci-dessous.\n\nExemples :\n• Windows : C:\\Users\\Votre Nom\\Documents\\MonDossier\n• Linux/Mac : /home/votre-nom/documents/mon-dossier');
      }
    } catch (err: any) {
      if (err.name !== 'AbortError') {
        console.error('Erreur lors de la sélection du dossier:', err);
        alert('Erreur lors de la sélection du dossier.\n\nVeuillez saisir le chemin complet manuellement dans le champ ci-dessous.');
      }
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
          {/* Configuration principale - Pleine largeur */}
          <Grid item xs={12}>
            <Card>
              <CardContent sx={{ p: 4 }}>
                <Grid container spacing={4}>
                  {/* Section gauche - Configuration */}
                  <Grid item xs={12} md={8}>
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
                  </Grid>

                  {/* Section droite - Types de PII (compacte) */}
                  <Grid item xs={12} md={4}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <SecurityIcon sx={{ fontSize: 24, mr: 1, color: 'secondary.main' }} />
                      <Typography variant="h6" fontWeight={600} fontSize="1.1rem">
                        17 types de PII
                      </Typography>
                    </Box>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                      Données détectées automatiquement :
                    </Typography>

                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75 }}>
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
                            bgcolor: 'rgba(103, 126, 234, 0.08)',
                            border: '1px solid',
                            borderColor: 'rgba(103, 126, 234, 0.2)',
                            fontSize: '0.75rem',
                            height: 24,
                            '&:hover': {
                              bgcolor: 'rgba(103, 126, 234, 0.15)',
                            },
                          }}
                        />
                      ))}
                    </Box>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      ) : (
        <Grid container spacing={3}>
          {/* Scan en cours - Pleine largeur */}
          <Grid item xs={12}>
            <Card>
              <CardContent sx={{ p: 4 }}>
                <Grid container spacing={3}>
                  {/* Section gauche - Progression principale */}
                  <Grid item xs={12} md={8}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                      <SearchIcon sx={{ fontSize: 28, mr: 1.5, color: 'primary.main' }} />
                      <Typography variant="h6" fontWeight={600}>
                        Scan en cours...
                      </Typography>
                    </Box>

                    <Box sx={{ mb: 3, p: 3, bgcolor: 'background.default', borderRadius: 2 }}>
                      <Grid container spacing={3}>
                        <Grid item xs={12} sm={6}>
                          <Box sx={{ textAlign: 'center' }}>
                            <Typography variant="h1" fontWeight={700} color="primary" sx={{ fontSize: '3.5rem' }}>
                              {percentage}%
                            </Typography>
                            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                              Progression globale
                            </Typography>
                          </Box>
                        </Grid>
                        <Grid item xs={12} sm={6}>
                          <Stack spacing={1.5}>
                            <Box>
                              <Typography variant="caption" color="text.secondary" fontWeight={500}>
                                FICHIERS TRAITÉS
                              </Typography>
                              <Typography variant="h6" fontWeight={700}>
                                {progress
                                  ? `${progress.processedFiles.toLocaleString()} / ${progress.totalFiles.toLocaleString()}`
                                  : 'Initialisation...'}
                              </Typography>
                            </Box>
                            <Box>
                              <Typography variant="caption" color="text.secondary" fontWeight={500}>
                                PII DÉTECTÉES
                              </Typography>
                              <Typography variant="h6" fontWeight={700} color="secondary">
                                {progress ? progress.piiFound.toLocaleString() : '0'}
                              </Typography>
                            </Box>
                          </Stack>
                        </Grid>
                      </Grid>

                      <Box sx={{ mt: 2.5 }}>
                        <LinearProgress
                          variant="determinate"
                          value={percentage}
                          sx={{
                            height: 14,
                            borderRadius: 7,
                            bgcolor: 'rgba(103, 126, 234, 0.1)',
                            '& .MuiLinearProgress-bar': {
                              borderRadius: 7,
                              background: 'linear-gradient(90deg, #667eea 0%, #764ba2 100%)',
                            },
                          }}
                        />
                      </Box>
                    </Box>

                    <Box sx={{ p: 2, bgcolor: 'rgba(102, 126, 234, 0.05)', borderRadius: 2, border: '1px solid', borderColor: 'rgba(102, 126, 234, 0.15)', mb: 2 }}>
                      <Typography variant="caption" color="text.secondary" fontWeight={600}>
                        DOSSIER SCANNÉ
                      </Typography>
                      <Typography variant="body2" sx={{ mt: 0.5, wordBreak: 'break-all', fontWeight: 500 }}>
                        {directoryPath}
                      </Typography>
                    </Box>

                    <Alert severity="warning">
                      <Typography variant="body2" fontWeight={500}>
                        Scan en cours : Veuillez patienter pendant l'analyse. Ne fermez pas cette fenêtre.
                      </Typography>
                    </Alert>
                  </Grid>

                  {/* Section droite - Statut en temps réel (compacte) */}
                  <Grid item xs={12} md={4}>
                    <Typography variant="subtitle1" fontWeight={600} gutterBottom sx={{ fontSize: '1rem' }}>
                      Statut en temps réel
                    </Typography>

                    <Stack spacing={1.5} sx={{ mt: 2 }}>
                      <Box sx={{ p: 1.5, bgcolor: 'background.default', borderRadius: 1.5 }}>
                        <Typography variant="caption" color="text.secondary" fontWeight={600} sx={{ fontSize: '0.7rem' }}>
                          FICHIERS TRAITÉS
                        </Typography>
                        <Typography variant="h6" fontWeight={700} sx={{ mt: 0.5, fontSize: '1.1rem' }}>
                          {progress ? progress.processedFiles.toLocaleString() : '0'}
                        </Typography>
                      </Box>

                      <Box sx={{ p: 1.5, bgcolor: 'background.default', borderRadius: 1.5 }}>
                        <Typography variant="caption" color="text.secondary" fontWeight={600} sx={{ fontSize: '0.7rem' }}>
                          FICHIERS TOTAUX
                        </Typography>
                        <Typography variant="h6" fontWeight={700} sx={{ mt: 0.5, fontSize: '1.1rem' }}>
                          {progress ? progress.totalFiles.toLocaleString() : '0'}
                        </Typography>
                      </Box>

                      <Box sx={{ p: 1.5, bgcolor: 'rgba(118, 75, 162, 0.1)', borderRadius: 1.5, border: '1px solid', borderColor: 'rgba(118, 75, 162, 0.2)' }}>
                        <Typography variant="caption" color="secondary.main" fontWeight={600} sx={{ fontSize: '0.7rem' }}>
                          PII DÉTECTÉES
                        </Typography>
                        <Typography variant="h6" fontWeight={700} color="secondary.main" sx={{ mt: 0.5, fontSize: '1.1rem' }}>
                          {progress ? progress.piiFound.toLocaleString() : '0'}
                        </Typography>
                      </Box>

                      <Box sx={{ p: 1.5, bgcolor: 'rgba(102, 126, 234, 0.1)', borderRadius: 1.5, border: '1px solid', borderColor: 'rgba(102, 126, 234, 0.2)' }}>
                        <Typography variant="caption" color="primary.main" fontWeight={600} sx={{ fontSize: '0.7rem' }}>
                          PROGRESSION
                        </Typography>
                        <Typography variant="h6" fontWeight={700} color="primary.main" sx={{ mt: 0.5, fontSize: '1.1rem' }}>
                          {percentage}%
                        </Typography>
                      </Box>
                    </Stack>

                    <Divider sx={{ my: 2 }} />

                    <Alert severity="info" icon={<InfoOutlinedIcon />} sx={{ py: 1 }}>
                      <Typography variant="caption" sx={{ fontSize: '0.7rem' }}>
                        Les résultats complets seront disponibles sur le tableau de bord une fois le scan terminé.
                      </Typography>
                    </Alert>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}
    </Box>
  );
}
