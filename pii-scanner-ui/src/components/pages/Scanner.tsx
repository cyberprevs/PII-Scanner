import { useState, useEffect, useRef } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  TextField,
  LinearProgress,
  Alert,
  Paper,
  Chip,
  Stack,
  IconButton,
  Tooltip,
  Divider,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import FolderOpenIcon from '@mui/icons-material/FolderOpen';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import SearchIcon from '@mui/icons-material/Search';
import HistoryIcon from '@mui/icons-material/History';
import DeleteIcon from '@mui/icons-material/Delete';
import SecurityIcon from '@mui/icons-material/Security';
import StopIcon from '@mui/icons-material/Stop';
import FileOpenIcon from '@mui/icons-material/FileOpen';
import LockIcon from '@mui/icons-material/Lock';
import { scanApi } from '../../services/apiClient';
import { useAuth } from '../../contexts/AuthContext';
import type { ScanProgressResponse } from '../../types';
import { useKeyboardShortcut } from '../../hooks/useKeyboardShortcut';
import { useTranslation } from 'react-i18next';
import { glassCardSx, tokens } from '../../theme/designSystem';
import { useNavigate } from 'react-router-dom';
import ConsentModal from '../common/ConsentModal';
import axios from '../../services/axios';

interface ScannerProps {
  scanning: boolean;
  scanId: string | null;
  onStartScan: (directoryPath: string) => void;
  onStopScan: () => void;
  hasResults?: boolean;
}

const PII_TYPES = [
  'Email', 'Date naissance', 'Carte bancaire', 'IFU', 'CNI',
  'Passeport', 'RCCM', 'Acte naissance', 'Téléphone', 'IBAN',
  'MTN MoMo', 'Moov Money', 'CNSS', 'RAMU', 'INE',
  'Matricule', 'Plaque', 'NPI',
];

export default function Scanner({ scanning, scanId, onStartScan, onStopScan, hasResults }: ScannerProps) {
  const { user } = useAuth();
  const { t } = useTranslation();
  const theme = useTheme();
  const dark = theme.palette.mode === 'dark';
  const c = tokens.colors;
  const navigate = useNavigate();

  const [directoryPath, setDirectoryPath] = useState('');
  const [progress, setProgress] = useState<ScanProgressResponse | null>(null);
  const [pathError, setPathError] = useState('');

  const getRecentPathsKey = () => user ? `recentScanPaths_${user.username}` : 'recentScanPaths';

  const [recentPaths, setRecentPaths] = useState<string[]>(() => {
    const key = user ? `recentScanPaths_${user.username}` : 'recentScanPaths';
    try { return JSON.parse(localStorage.getItem(key) ?? '[]'); } catch { return []; }
  });

  const wasScanning = useRef(false);

  const getConsentKey = () => user ? `scanConsent_${user.username}` : 'scanConsent';
  const [consentOpen, setConsentOpen] = useState(false);
  const [pendingPath, setPendingPath] = useState<string | null>(null);

  // Navigate to dashboard when scan completes (only if we were actually scanning)
  useEffect(() => {
    if (scanning) {
      wasScanning.current = true;
    } else if (wasScanning.current && hasResults) {
      wasScanning.current = false;
      navigate('/dashboard');
    }
  }, [scanning, hasResults, navigate]);


  useEffect(() => {
    if (!scanning || !scanId) return;
    const interval = setInterval(async () => {
      try {
        const progressData = await scanApi.getProgress(scanId);
        setProgress(progressData);
      } catch { /* ignore */ }
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
    if (!directoryPath) { setPathError(t('scanner.pathError')); return; }
    setPathError('');

    // Vérifier si le consentement a déjà été donné pour cet utilisateur
    const alreadyConsented = localStorage.getItem(getConsentKey()) === 'true';
    if (!alreadyConsented) {
      setPendingPath(directoryPath);
      setConsentOpen(true);
      return;
    }

    saveRecentPath(directoryPath);
    onStartScan(directoryPath);
  };

  const handleConsentAccept = async () => {
    localStorage.setItem(getConsentKey(), 'true');
    setConsentOpen(false);

    // Tracer l'acceptation du consentement dans l'audit trail
    try {
      await axios.post('/audit/consent', {
        action: 'ConsentAccepted',
        details: `Consentement au traitement des données accepté pour le scan du dossier: ${pendingPath}`,
      });
    } catch {
      // Ne pas bloquer le scan si le log échoue
    }

    if (pendingPath) {
      saveRecentPath(pendingPath);
      onStartScan(pendingPath);
      setPendingPath(null);
    }
  };

  const handleConsentDecline = () => {
    setConsentOpen(false);
    setPendingPath(null);
  };

  useKeyboardShortcut({
    key: 's', ctrlKey: true,
    callback: handleStartScan,
    enabled: !scanning && !!directoryPath,
    preventDefault: true,
  });

  const handlePathChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setDirectoryPath(e.target.value);
    if (pathError) setPathError('');
  };

  const percentage = progress ? Math.floor((progress.processedFiles / progress.totalFiles) * 100) : 0;

  // ─── Scanning state ────────────────────────────────────────────────────────
  if (scanning) {
    return (
      <Box sx={{ maxWidth: 720, mx: 'auto', px: 2 }}>
        {/* Header */}
        <Box sx={{ textAlign: 'center', mb: 5 }}>
          <Box
            sx={{
              width: 56, height: 56, borderRadius: '50%',
              bgcolor: c.accentPrimaryMuted, mx: 'auto', mb: 2,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              animation: 'pulse 2s infinite',
              '@keyframes pulse': {
                '0%': { boxShadow: `0 0 0 0 ${c.accentPrimary}40` },
                '70%': { boxShadow: `0 0 0 12px ${c.accentPrimary}00` },
                '100%': { boxShadow: `0 0 0 0 ${c.accentPrimary}00` },
              },
            }}
          >
            <SearchIcon sx={{ color: c.accentPrimary, fontSize: 28 }} />
          </Box>
          <Typography variant="h5" fontWeight={700} sx={{
            background: 'linear-gradient(135deg, #00E599 0%, #00B876 100%)',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
          }}>
            {t('scanner.titleScanning')}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            {directoryPath}
          </Typography>
        </Box>

        {/* Progress card */}
        <Card sx={{ mb: 3, ...glassCardSx(dark) }}>
          <CardContent sx={{ p: 4 }}>
            {/* Big percentage */}
            <Box sx={{ textAlign: 'center', mb: 4 }}>
              <Typography
                variant="h1"
                fontWeight={800}
                sx={{
                  fontSize: '5rem', lineHeight: 1,
                  background: 'linear-gradient(135deg, #00E599 0%, #00B876 100%)',
                  WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
                }}
              >
                {percentage}%
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                Progression globale
              </Typography>
            </Box>

            {/* Progress bar */}
            <LinearProgress
              variant="determinate"
              value={percentage}
              sx={{
                height: 8, borderRadius: 4, mb: 4,
                bgcolor: c.accentPrimaryMuted,
                '& .MuiLinearProgress-bar': {
                  borderRadius: 4,
                  background: 'linear-gradient(90deg, #00E599 0%, #00B876 100%)',
                },
              }}
            />

            {/* Stats row */}
            <Box sx={{ display: 'flex', gap: 2 }}>
              <Box sx={{
                flex: 1, p: 2.5, borderRadius: 2,
                bgcolor: dark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.03)',
                border: '1px solid', borderColor: 'divider',
                textAlign: 'center',
              }}>
                <Typography variant="h5" fontWeight={700}>
                  {progress ? progress.processedFiles.toLocaleString() : '0'}
                </Typography>
                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
                  Fichiers traités
                </Typography>
              </Box>
              <Box sx={{
                flex: 1, p: 2.5, borderRadius: 2,
                bgcolor: dark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.03)',
                border: '1px solid', borderColor: 'divider',
                textAlign: 'center',
              }}>
                <Typography variant="h5" fontWeight={700}>
                  {progress ? progress.totalFiles.toLocaleString() : '—'}
                </Typography>
                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
                  Total fichiers
                </Typography>
              </Box>
              <Box sx={{
                flex: 1, p: 2.5, borderRadius: 2,
                bgcolor: c.accentPrimaryMuted,
                border: `1px solid ${c.accentPrimary}33`,
                textAlign: 'center',
              }}>
                <Typography variant="h5" fontWeight={700} sx={{ color: c.accentPrimary }}>
                  {progress ? progress.piiFound.toLocaleString() : '0'}
                </Typography>
                <Typography variant="caption" sx={{ color: c.accentPrimary, opacity: 0.8, display: 'block', mt: 0.5 }}>
                  PII détectées
                </Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>

        {/* Stop button */}
        <Box sx={{ textAlign: 'center', mb: 3 }}>
          <Button
            variant="outlined"
            color="error"
            size="large"
            onClick={onStopScan}
            startIcon={<StopIcon />}
            sx={{ px: 5, py: 1.5, fontWeight: 600, borderWidth: 1.5 }}
          >
            {t('scanner.stopButton')} (Esc)
          </Button>
        </Box>

        <Alert severity="warning" sx={{ borderRadius: 2 }}>
          <Typography variant="body2" fontWeight={500}>Scan en cours — Ne fermez pas cette fenêtre</Typography>
        </Alert>
      </Box>
    );
  }

  // ─── Idle state ─────────────────────────────────────────────────────────────
  return (
    <Box sx={{ maxWidth: 760, mx: 'auto', px: 2 }}>
      {/* Page header — centered */}
      <Box sx={{ textAlign: 'center', mb: 5 }}>
        <Box
          sx={{
            width: 56, height: 56, borderRadius: '50%',
            bgcolor: c.accentPrimaryMuted, mx: 'auto', mb: 2,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}
        >
          <SecurityIcon sx={{ color: c.accentPrimary, fontSize: 28 }} />
        </Box>
        <Typography variant="h4" fontWeight={700} sx={{
          background: 'linear-gradient(135deg, #00E599 0%, #00B876 100%)',
          WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
        }}>
          {t('scanner.title')}
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mt: 1 }}>
          {t('scanner.subtitle')}
        </Typography>
      </Box>

      {/* Main card */}
      <Card sx={{ mb: 3, ...glassCardSx(dark) }}>
        <CardContent sx={{ p: 4 }}>
          {/* Path input */}
          <Typography variant="body2" fontWeight={600} sx={{ mb: 1 }}>
            {t('scanner.folderLabel')}
          </Typography>
          <TextField
            fullWidth
            variant="outlined"
            value={directoryPath}
            onChange={handlePathChange}
            placeholder={t('scanner.placeholder')}
            disabled={scanning}
            error={!!pathError}
            helperText={pathError || t('scanner.helperText')}
            sx={{ mb: 3 }}
            InputProps={{
              startAdornment: (
                <FolderOpenIcon sx={{ mr: 1.5, color: directoryPath ? c.accentPrimary : 'text.secondary', fontSize: 22 }} />
              ),
            }}
          />

          {/* Start button */}
          <Button
            variant="contained"
            size="large"
            fullWidth
            onClick={handleStartScan}
            disabled={!directoryPath}
            startIcon={<PlayArrowIcon />}
            sx={{
              py: 1.75,
              fontSize: '1rem',
              fontWeight: 700,
              background: directoryPath
                ? 'linear-gradient(135deg, #00E599 0%, #00B876 100%)'
                : undefined,
              boxShadow: directoryPath ? '0 4px 14px rgba(0,229,153,0.3)' : 0,
              '&:hover': {
                background: directoryPath
                  ? 'linear-gradient(135deg, #00CC88 0%, #00A86B 100%)'
                  : undefined,
                boxShadow: directoryPath ? '0 6px 20px rgba(0,229,153,0.4)' : 0,
                transform: 'translateY(-1px)',
              },
              '&:active': { transform: 'scale(0.99)' },
              transition: 'all 0.2s',
              mb: pathError ? 0 : 1,
            }}
          >
            {t('scanner.startButton')}
          </Button>

          <Typography variant="caption" color="text.disabled" sx={{ display: 'block', textAlign: 'center', mt: 1 }}>
            Ou appuyez sur <strong>Ctrl+S</strong> pour démarrer rapidement
          </Typography>
        </CardContent>
      </Card>

      {/* Recent paths */}
      {recentPaths.length > 0 && (
        <Card sx={{ mb: 3 }}>
          <CardContent sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <HistoryIcon sx={{ fontSize: 18, mr: 1, color: 'text.secondary' }} />
              <Typography variant="body2" fontWeight={600} color="text.secondary">
                {t('scanner.recentFolders')}
              </Typography>
            </Box>
            <Stack spacing={1}>
              {recentPaths.map((path, index) => (
                <Paper
                  key={index}
                  elevation={0}
                  sx={{
                    px: 2, py: 1.5,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    cursor: 'pointer',
                    border: '1px solid',
                    borderColor: directoryPath === path ? c.accentPrimary : 'divider',
                    bgcolor: directoryPath === path ? c.accentPrimaryMuted : 'transparent',
                    borderRadius: 2,
                    transition: 'all 0.15s',
                    '&:hover': {
                      borderColor: c.accentPrimary,
                      bgcolor: c.accentPrimaryMuted,
                    },
                  }}
                  onClick={() => setDirectoryPath(path)}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', flex: 1, minWidth: 0 }}>
                    <FolderOpenIcon sx={{ fontSize: 18, mr: 1.5, color: c.accentPrimary, flexShrink: 0 }} />
                    <Typography variant="body2" fontWeight={500} noWrap>
                      {path}
                    </Typography>
                  </Box>
                  <Tooltip title={t('scanner.removeHistory')}>
                    <IconButton
                      size="small"
                      onClick={(e) => { e.stopPropagation(); removeRecentPath(path); }}
                      sx={{ ml: 1, color: 'text.disabled', '&:hover': { color: 'error.main' } }}
                    >
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </Paper>
              ))}
            </Stack>
          </CardContent>
        </Card>
      )}

      {/* Info pills */}
      <Box sx={{ display: 'flex', gap: 2, mb: 4 }}>
        <Box sx={{
          flex: 1, display: 'flex', alignItems: 'center', gap: 1.5,
          p: 2, borderRadius: 2,
          border: '1px solid', borderColor: 'divider',
          bgcolor: dark ? 'rgba(59,130,246,0.06)' : 'rgba(59,130,246,0.04)',
        }}>
          <FileOpenIcon sx={{ color: '#3B82F6', fontSize: 20, flexShrink: 0 }} />
          <Box>
            <Typography variant="caption" fontWeight={600} sx={{ color: '#3B82F6', display: 'block' }}>
              {t('scanner.formatsLabel')}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              .txt, .log, .csv, .json, .docx, .xlsx, .pdf
            </Typography>
          </Box>
        </Box>
        <Box sx={{
          flex: 1, display: 'flex', alignItems: 'center', gap: 1.5,
          p: 2, borderRadius: 2,
          border: '1px solid', borderColor: 'divider',
          bgcolor: dark ? 'rgba(0,229,153,0.06)' : 'rgba(0,229,153,0.04)',
        }}>
          <LockIcon sx={{ color: c.accentPrimary, fontSize: 20, flexShrink: 0 }} />
          <Box>
            <Typography variant="caption" fontWeight={600} sx={{ color: c.accentPrimary, display: 'block' }}>
              {t('scanner.secureLabel')}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {t('scanner.secureText')}
            </Typography>
          </Box>
        </Box>
      </Box>

      {/* PII types */}
      <Card>
        <CardContent sx={{ p: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <SecurityIcon sx={{ fontSize: 18, color: 'text.secondary' }} />
              <Typography variant="body2" fontWeight={600} color="text.secondary">
                {t('scanner.piiTypes')}
              </Typography>
            </Box>
            <Chip
              label={`${PII_TYPES.length} types`}
              size="small"
              sx={{ bgcolor: c.accentPrimaryMuted, color: c.accentPrimary, fontWeight: 600 }}
            />
          </Box>
          <Divider sx={{ mb: 2 }} />
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75 }}>
            {PII_TYPES.map((item, index) => (
              <Chip
                key={index}
                label={item}
                size="small"
                sx={{
                  bgcolor: dark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.04)',
                  border: '1px solid',
                  borderColor: 'divider',
                  fontSize: '0.75rem',
                  fontWeight: 500,
                  '&:hover': { bgcolor: c.accentPrimaryMuted, borderColor: c.accentPrimary },
                  transition: 'all 0.15s',
                }}
              />
            ))}
          </Box>
        </CardContent>
      </Card>

      <ConsentModal
        open={consentOpen}
        onAccept={handleConsentAccept}
        onDecline={handleConsentDecline}
      />
    </Box>
  );
}
