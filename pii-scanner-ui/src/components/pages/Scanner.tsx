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
} from '@mui/material';
import FolderOpenIcon from '@mui/icons-material/FolderOpen';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import SearchIcon from '@mui/icons-material/Search';
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

  const handleSelectDirectory = async () => {
    if (window.electronAPI) {
      const path = await window.electronAPI.selectDirectory();
      if (path) {
        setDirectoryPath(path);
      }
    } else {
      console.log('Electron API non disponible, entrez le chemin manuellement');
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
    <Box>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
          <SearchIcon sx={{ fontSize: 40, mr: 2, color: 'primary.main' }} />
          <Typography variant="h4" fontWeight={700}>
            Scanner de Fichiers
          </Typography>
        </Box>
        <Typography variant="body1" color="text.secondary">
          Lancez un nouveau scan pour détecter les données personnelles (PII) dans vos fichiers
        </Typography>
      </Box>

      <Divider sx={{ mb: 4 }} />

      {!scanning ? (
        <Grid container spacing={3}>
          {/* Configuration */}
          <Grid item xs={12} md={8}>
            <Card>
              <CardContent sx={{ p: 3 }}>
                <Typography variant="h6" fontWeight={600} gutterBottom>
                  Configuration du scan
                </Typography>

                <Box sx={{ mt: 3 }}>
                  <Typography variant="body2" color="text.secondary" gutterBottom fontWeight={500}>
                    Dossier à scanner *
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 2, mt: 1 }}>
                    <TextField
                      fullWidth
                      variant="outlined"
                      value={directoryPath}
                      onChange={(e) => setDirectoryPath(e.target.value)}
                      placeholder="Sélectionnez un dossier à scanner..."
                      disabled={scanning}
                      sx={{ flex: 1 }}
                    />
                    <Button
                      variant="outlined"
                      onClick={handleSelectDirectory}
                      startIcon={<FolderOpenIcon />}
                      disabled={scanning}
                      sx={{ minWidth: 140 }}
                    >
                      Parcourir
                    </Button>
                  </Box>
                </Box>

                <Alert severity="info" sx={{ mt: 3 }}>
                  <strong>Formats supportés :</strong> .txt, .log, .csv, .json, .docx, .xlsx, .pdf
                </Alert>

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
                      '&:disabled': {
                        background: 'rgba(0, 0, 0, 0.12)',
                      },
                    }}
                  >
                    Démarrer le scan
                  </Button>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          {/* Types de PII détectés */}
          <Grid item xs={12} md={4}>
            <Card>
              <CardContent sx={{ p: 3 }}>
                <Typography variant="h6" fontWeight={600} gutterBottom>
                  Types de PII détectés
                </Typography>
                <Typography variant="body2" color="text.secondary" paragraph>
                  Le scanner détecte 20 types de données personnelles spécifiques au Bénin :
                </Typography>

                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, mt: 2 }}>
                  {[
                    '📧 Adresses email',
                    '📞 Téléphones (+229)',
                    '💳 Cartes bancaires',
                    '🏦 IBAN (BJ)',
                    '💰 Mobile Money (MTN/Moov)',
                    '🆔 IFU (13 chiffres)',
                    '📇 CNI Bénin',
                    '🛂 Passeport béninois',
                    '🏢 RCCM',
                    '📜 Acte de naissance',
                    '🏥 CNSS (11 chiffres)',
                    '💊 RAMU',
                    '🎓 INE',
                    '👨‍💼 Matricule fonctionnaire',
                    '📅 Dates de naissance',
                    '🔑 Mots de passe',
                    '🔐 Clés API AWS',
                    '🎫 Tokens JWT',
                  ].map((item, index) => (
                    <Typography
                      key={index}
                      variant="body2"
                      sx={{
                        py: 0.5,
                        px: 1.5,
                        borderRadius: 1,
                        bgcolor: 'rgba(103, 126, 234, 0.05)',
                        border: '1px solid',
                        borderColor: 'rgba(103, 126, 234, 0.1)',
                      }}
                    >
                      {item}
                    </Typography>
                  ))}
                </Box>
              </CardContent>
            </Card>
          </Grid>

          {/* Caractéristiques */}
          <Grid item xs={12}>
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
        </Grid>
      ) : (
        <Grid container spacing={3}>
          <Grid item xs={12} md={8}>
            <Card>
              <CardContent sx={{ p: 3 }}>
                <Typography variant="h6" fontWeight={600} gutterBottom>
                  Scan en cours...
                </Typography>

                <Box sx={{ mt: 3, p: 3, bgcolor: 'background.default', borderRadius: 2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="h2" fontWeight={700} color="primary">
                        {percentage}%
                      </Typography>
                      <Typography variant="body1" color="text.secondary" sx={{ mt: 1 }}>
                        {progress
                          ? `${progress.processedFiles.toLocaleString()} / ${progress.totalFiles.toLocaleString()} fichiers traités`
                          : 'Initialisation du scan...'}
                      </Typography>
                    </Box>
                    {progress && (
                      <Box sx={{ textAlign: 'right' }}>
                        <Typography variant="h2" fontWeight={700} color="secondary">
                          {progress.piiFound.toLocaleString()}
                        </Typography>
                        <Typography variant="body1" color="text.secondary" sx={{ mt: 1 }}>
                          PII détectées
                        </Typography>
                      </Box>
                    )}
                  </Box>

                  <LinearProgress
                    variant="determinate"
                    value={percentage}
                    sx={{
                      height: 12,
                      borderRadius: 6,
                      bgcolor: 'rgba(103, 126, 234, 0.1)',
                      '& .MuiLinearProgress-bar': {
                        borderRadius: 6,
                        background: 'linear-gradient(90deg, #667eea 0%, #764ba2 100%)',
                      },
                    }}
                  />

                  <Box sx={{ mt: 3, p: 2, bgcolor: 'background.paper', borderRadius: 1 }}>
                    <Typography variant="caption" color="text.secondary" fontWeight={500}>
                      DOSSIER SCANNÉ
                    </Typography>
                    <Typography variant="body2" sx={{ mt: 0.5, wordBreak: 'break-all' }}>
                      📁 {directoryPath}
                    </Typography>
                  </Box>
                </Box>

                <Alert severity="warning" sx={{ mt: 3 }}>
                  <strong>Scan en cours :</strong> Veuillez patienter pendant l'analyse. Ne fermez pas cette fenêtre.
                </Alert>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={4}>
            <Card>
              <CardContent sx={{ p: 3 }}>
                <Typography variant="h6" fontWeight={600} gutterBottom>
                  Statut du scan
                </Typography>

                <Box sx={{ mt: 3 }}>
                  <Box sx={{ mb: 3 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                      <Typography variant="body2" color="text.secondary">
                        Fichiers traités
                      </Typography>
                      <Typography variant="body1" fontWeight={600}>
                        {progress ? progress.processedFiles.toLocaleString() : '0'}
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                      <Typography variant="body2" color="text.secondary">
                        Fichiers totaux
                      </Typography>
                      <Typography variant="body1" fontWeight={600}>
                        {progress ? progress.totalFiles.toLocaleString() : '0'}
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                      <Typography variant="body2" color="text.secondary">
                        PII détectées
                      </Typography>
                      <Typography variant="body1" fontWeight={600} color="secondary.main">
                        {progress ? progress.piiFound.toLocaleString() : '0'}
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <Typography variant="body2" color="text.secondary">
                        Progression
                      </Typography>
                      <Typography variant="body1" fontWeight={600} color="primary.main">
                        {percentage}%
                      </Typography>
                    </Box>
                  </Box>

                  <Divider sx={{ my: 2 }} />

                  <Alert severity="info" icon={false}>
                    <Typography variant="caption" color="text.secondary">
                      Les résultats seront disponibles sur la page "Tableau de bord" une fois le scan terminé.
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
