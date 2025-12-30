import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  Card,
  CardContent,
  Divider,
  TextField,
  Alert,
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Tooltip,
  Switch,
  FormControlLabel,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Stack,
} from '@mui/material';
import StorageIcon from '@mui/icons-material/Storage';
import CleaningServicesIcon from '@mui/icons-material/CleaningServices';
import OptimizeIcon from '@mui/icons-material/Tune';
import BackupIcon from '@mui/icons-material/Backup';
import DownloadIcon from '@mui/icons-material/Download';
import RefreshIcon from '@mui/icons-material/Refresh';
import SaveIcon from '@mui/icons-material/Save';
import WarningIcon from '@mui/icons-material/Warning';
import DeleteIcon from '@mui/icons-material/Delete';
import RestoreIcon from '@mui/icons-material/Restore';
import axios, { initializeCsrfToken } from '../../services/axios';

interface DatabaseStats {
  databaseSize: number;
  databaseSizeMB: number;
  totalUsers: number;
  activeUsers: number;
  totalScans: number;
  completedScans: number;
  totalAuditLogs: number;
  totalSessions: number;
  activeSessions: number;
  oldestScan: string | null;
  newestScan: string | null;
  databasePath: string;
}

interface AppSettings {
  id: number;
  dataRetentionDays: number;
  auditLogRetentionDays: number;
  sessionRetentionDays: number;
  autoBackupEnabled: boolean;
  autoBackupIntervalHours: number;
  lastAutoBackup: string | null;
}

interface Backup {
  fileName: string;
  size: number;
  sizeMB: number;
  createdAt: string;
}

const DatabaseManagement: React.FC = () => {
  const [stats, setStats] = useState<DatabaseStats | null>(null);
  const [settings, setSettings] = useState<AppSettings | null>(null);
  const [backups, setBackups] = useState<Backup[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [confirmDialog, setConfirmDialog] = useState<{
    open: boolean;
    title: string;
    message: string;
    action: () => void;
  }>({ open: false, title: '', message: '', action: () => {} });
  const [resetDialog, setResetDialog] = useState(false);
  const [resetPassword, setResetPassword] = useState('');

  useEffect(() => {
    const init = async () => {
      // Initialiser le token CSRF avant de charger les données
      await initializeCsrfToken();
      await loadData();
    };
    init();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [statsRes, settingsRes, backupsRes] = await Promise.all([
        axios.get('/database/stats'),
        axios.get('/database/settings'),
        axios.get('/database/backups'),
      ]);

      setStats(statsRes.data);
      setSettings(settingsRes.data);
      setBackups(backupsRes.data);
    } catch (err: any) {
      console.error('Error loading data:', err);
      setError(err.response?.data?.error || 'Erreur lors du chargement des données');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateSettings = async () => {
    if (!settings) return;

    try {
      await axios.put('/database/settings', {
        dataRetentionDays: settings.dataRetentionDays,
        auditLogRetentionDays: settings.auditLogRetentionDays,
        sessionRetentionDays: settings.sessionRetentionDays,
        autoBackupEnabled: settings.autoBackupEnabled,
        autoBackupIntervalHours: settings.autoBackupIntervalHours,
      });

      setSuccess('Paramètres mis à jour avec succès');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Erreur lors de la mise à jour des paramètres');
      setTimeout(() => setError(''), 3000);
    }
  };

  const handleCleanup = async () => {
    try {
      const response = await axios.post('/database/cleanup');
      setSuccess(`Nettoyage effectué: ${response.data.deleted.Scans} scans, ${response.data.deleted.AuditLogs} logs, ${response.data.deleted.Sessions} sessions supprimés`);
      setTimeout(() => setSuccess(''), 5000);
      loadData();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Erreur lors du nettoyage');
      setTimeout(() => setError(''), 3000);
    }
  };

  const handleOptimize = async () => {
    try {
      await axios.post('/database/optimize');
      setSuccess('Base de données optimisée avec succès');
      setTimeout(() => setSuccess(''), 3000);
      loadData();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Erreur lors de l\'optimisation');
      setTimeout(() => setError(''), 3000);
    }
  };

  const handleBackup = async () => {
    try {
      const response = await axios.post('/database/backup');
      setSuccess(`Sauvegarde créée: ${response.data.backupFile}`);
      setTimeout(() => setSuccess(''), 3000);
      loadData();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Erreur lors de la sauvegarde');
      setTimeout(() => setError(''), 3000);
    }
  };

  const handleDownloadBackup = async (fileName: string) => {
    try {
      const response = await axios.get(
        `/database/backup/download/${encodeURIComponent(fileName)}`,
        { responseType: 'blob' }
      );

      const url = window.URL.createObjectURL(response.data);
      const a = document.createElement('a');
      a.href = url;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err: any) {
      setError('Erreur lors du téléchargement de la sauvegarde');
      setTimeout(() => setError(''), 3000);
    }
  };

  const handleDeleteBackup = async (fileName: string) => {
    try {
      console.log('Deleting backup:', fileName);
      const response = await axios.delete(`/database/backup/${encodeURIComponent(fileName)}`);
      console.log('Delete response:', response);
      setSuccess(`Sauvegarde supprimée: ${fileName}`);
      setTimeout(() => setSuccess(''), 3000);
      loadData();
    } catch (err: any) {
      console.error('Delete backup error:', err);
      console.error('Error response:', err.response);
      setError(err.response?.data?.error || err.response?.data?.message || 'Erreur lors de la suppression de la sauvegarde');
      setTimeout(() => setError(''), 3000);
    }
  };

  const handleRestoreBackup = async (fileName: string) => {
    try {
      const response = await axios.post(`/database/backup/restore/${encodeURIComponent(fileName)}`);
      setSuccess(`${response.data.message} Une sauvegarde de sécurité a été créée: ${response.data.preRestoreBackup}`);
      // Déconnecter l'utilisateur car la base de données a été remplacée
      setTimeout(() => {
        localStorage.removeItem('token');
        localStorage.removeItem('refreshToken');
        window.location.href = '/login';
      }, 3000);
    } catch (err: any) {
      console.error('Restore backup error:', err);
      setError(err.response?.data?.error || 'Erreur lors de la restauration de la sauvegarde');
      setTimeout(() => setError(''), 5000);
    }
  };

  const showConfirmDialog = (title: string, message: string, action: () => void) => {
    setConfirmDialog({ open: true, title, message, action });
  };

  const handleConfirmAction = () => {
    confirmDialog.action();
    setConfirmDialog({ ...confirmDialog, open: false });
  };

  const handleResetDatabase = async () => {
    if (!resetPassword) {
      setError('Mot de passe requis');
      return;
    }

    try {
      const response = await axios.post('/database/reset', {
        adminPassword: resetPassword,
      });

      setSuccess(`Base de données réinitialisée ! Sauvegarde: ${response.data.backupFile}`);
      setResetDialog(false);
      setResetPassword('');
      setTimeout(() => {
        loadData();
      }, 2000);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Erreur lors de la réinitialisation');
      setTimeout(() => setError(''), 3000);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 1 }}>
        <StorageIcon fontSize="large" />
        Gestion de la base de données
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      {success && (
        <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess('')}>
          {success}
        </Alert>
      )}

      <Stack spacing={3}>
        {/* Statistiques */}
        <Box>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Statistiques de la base de données
            </Typography>
            <Divider sx={{ mb: 2 }} />

            {stats && (
              <Stack direction="row" spacing={2} sx={{flexWrap: 'wrap'}}>
                <Box sx={{flex: '1 1 300px'}}>
                  <Card variant="outlined">
                    <CardContent>
                      <Typography color="text.secondary" gutterBottom>
                        Taille de la base
                      </Typography>
                      <Typography variant="h4">{stats.databaseSizeMB} MB</Typography>
                      <Typography variant="caption" color="text.secondary">
                        {stats.databasePath}
                      </Typography>
                    </CardContent>
                  </Card>
                </Box>

                <Box sx={{flex: '1 1 300px'}}>
                  <Card variant="outlined">
                    <CardContent>
                      <Typography color="text.secondary" gutterBottom>
                        Utilisateurs
                      </Typography>
                      <Typography variant="h4">{stats.totalUsers}</Typography>
                      <Typography variant="caption" color="text.secondary">
                        {stats.activeUsers} actifs
                      </Typography>
                    </CardContent>
                  </Card>
                </Box>

                <Box sx={{flex: '1 1 300px'}}>
                  <Card variant="outlined">
                    <CardContent>
                      <Typography color="text.secondary" gutterBottom>
                        Scans
                      </Typography>
                      <Typography variant="h4">{stats.totalScans}</Typography>
                      <Typography variant="caption" color="text.secondary">
                        {stats.completedScans} terminés
                      </Typography>
                    </CardContent>
                  </Card>
                </Box>

                <Box sx={{flex: '1 1 300px'}}>
                  <Card variant="outlined">
                    <CardContent>
                      <Typography color="text.secondary" gutterBottom>
                        Logs d'audit
                      </Typography>
                      <Typography variant="h4">{stats.totalAuditLogs}</Typography>
                    </CardContent>
                  </Card>
                </Box>

                <Box sx={{flex: '1 1 300px'}}>
                  <Card variant="outlined">
                    <CardContent>
                      <Typography color="text.secondary" gutterBottom>
                        Sessions
                      </Typography>
                      <Typography variant="h4">{stats.totalSessions}</Typography>
                      <Typography variant="caption" color="text.secondary">
                        {stats.activeSessions} actives
                      </Typography>
                    </CardContent>
                  </Card>
                </Box>

                <Box sx={{flex: '1 1 300px'}}>
                  <Card variant="outlined">
                    <CardContent>
                      <Button
                        fullWidth
                        variant="outlined"
                        startIcon={<RefreshIcon />}
                        onClick={loadData}
                      >
                        Actualiser
                      </Button>
                    </CardContent>
                  </Card>
                </Box>
              </Stack>
            )}
          </Paper>
        </Box>

        {/* Paramètres de rétention */}
        <Box sx={{flex: '1 1 500px'}}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Politique de rétention des données
            </Typography>
            <Divider sx={{ mb: 2 }} />

            {settings && (
              <Box>
                <TextField
                  fullWidth
                  label="Durée de conservation des scans (jours)"
                  type="number"
                  value={settings.dataRetentionDays}
                  onChange={(e) => {
                    const value = Math.max(1, parseInt(e.target.value) || 1);
                    setSettings({ ...settings, dataRetentionDays: value });
                  }}
                  margin="normal"
                  helperText="Les scans plus anciens seront supprimés lors du nettoyage (min: 1 jour)"
                  inputProps={{ min: 1, max: 3650 }}
                />

                <TextField
                  fullWidth
                  label="Durée de conservation des logs d'audit (jours)"
                  type="number"
                  value={settings.auditLogRetentionDays}
                  onChange={(e) => {
                    const value = Math.max(1, parseInt(e.target.value) || 1);
                    setSettings({ ...settings, auditLogRetentionDays: value });
                  }}
                  margin="normal"
                  helperText="Min: 1 jour, Max: 10 ans"
                  inputProps={{ min: 1, max: 3650 }}
                />

                <TextField
                  fullWidth
                  label="Durée de conservation des sessions (jours)"
                  type="number"
                  value={settings.sessionRetentionDays}
                  onChange={(e) => {
                    const value = Math.max(1, parseInt(e.target.value) || 1);
                    setSettings({ ...settings, sessionRetentionDays: value });
                  }}
                  margin="normal"
                  helperText="Min: 1 jour, Max: 365 jours"
                  inputProps={{ min: 1, max: 365 }}
                />

                <Box sx={{ mt: 2 }}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={settings.autoBackupEnabled}
                        onChange={(e) =>
                          setSettings({ ...settings, autoBackupEnabled: e.target.checked })
                        }
                      />
                    }
                    label="Sauvegardes automatiques"
                  />
                </Box>

                {settings.autoBackupEnabled && (
                  <TextField
                    fullWidth
                    label="Intervalle des sauvegardes (heures)"
                    type="number"
                    value={settings.autoBackupIntervalHours}
                    onChange={(e) => {
                      const value = Math.max(1, parseInt(e.target.value) || 1);
                      setSettings({
                        ...settings,
                        autoBackupIntervalHours: value,
                      });
                    }}
                    margin="normal"
                    helperText="Min: 1 heure, Max: 168 heures (1 semaine)"
                    inputProps={{ min: 1, max: 168 }}
                  />
                )}

                <Button
                  fullWidth
                  variant="contained"
                  startIcon={<SaveIcon />}
                  onClick={handleUpdateSettings}
                  sx={{ mt: 2 }}
                >
                  Enregistrer les paramètres
                </Button>
              </Box>
            )}
          </Paper>
        </Box>

        {/* Actions de maintenance */}
        <Box sx={{flex: '1 1 500px'}}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Actions de maintenance
            </Typography>
            <Divider sx={{ mb: 2 }} />

            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Button
                fullWidth
                variant="outlined"
                color="warning"
                startIcon={<CleaningServicesIcon />}
                onClick={() =>
                  showConfirmDialog(
                    'Confirmer le nettoyage',
                    'Cette action supprimera les données anciennes selon la politique de rétention. Continuer ?',
                    handleCleanup
                  )
                }
              >
                Nettoyer les données anciennes
              </Button>

              <Button
                fullWidth
                variant="outlined"
                color="info"
                startIcon={<OptimizeIcon />}
                onClick={() =>
                  showConfirmDialog(
                    'Confirmer l\'optimisation',
                    'Cette action optimisera la base de données (VACUUM). Cela peut prendre quelques minutes. Continuer ?',
                    handleOptimize
                  )
                }
              >
                Optimiser la base de données
              </Button>

              <Button
                fullWidth
                variant="contained"
                color="primary"
                startIcon={<BackupIcon />}
                onClick={handleBackup}
              >
                Créer une sauvegarde maintenant
              </Button>

              <Divider sx={{ my: 2 }} />

              <Button
                fullWidth
                variant="outlined"
                color="error"
                startIcon={<WarningIcon />}
                onClick={() => setResetDialog(true)}
              >
                RESET COMPLET de la base
              </Button>
            </Box>
          </Paper>
        </Box>

        {/* Liste des sauvegardes */}
        <Box>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Sauvegardes disponibles
            </Typography>
            <Divider sx={{ mb: 2 }} />

            {backups.length === 0 ? (
              <Alert severity="info">Aucune sauvegarde disponible</Alert>
            ) : (
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Nom du fichier</TableCell>
                      <TableCell align="right">Taille</TableCell>
                      <TableCell align="right">Date de création</TableCell>
                      <TableCell align="center">Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {backups.map((backup) => (
                      <TableRow key={backup.fileName} hover>
                        <TableCell>{backup.fileName}</TableCell>
                        <TableCell align="right">{backup.sizeMB} MB</TableCell>
                        <TableCell align="right">
                          {new Date(backup.createdAt).toLocaleString('fr-FR')}
                        </TableCell>
                        <TableCell align="center">
                          <Tooltip title="Restaurer cette sauvegarde">
                            <IconButton
                              color="success"
                              onClick={() =>
                                showConfirmDialog(
                                  'Restaurer la sauvegarde',
                                  `⚠️ ATTENTION: Cette action va remplacer la base de données actuelle par la sauvegarde "${backup.fileName}". Une sauvegarde de sécurité sera créée automatiquement. Vous serez déconnecté après la restauration. Continuer ?`,
                                  () => handleRestoreBackup(backup.fileName)
                                )
                              }
                            >
                              <RestoreIcon />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Télécharger">
                            <IconButton
                              color="primary"
                              onClick={() => handleDownloadBackup(backup.fileName)}
                            >
                              <DownloadIcon />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Supprimer">
                            <IconButton
                              color="error"
                              onClick={() =>
                                showConfirmDialog(
                                  'Supprimer la sauvegarde',
                                  `Êtes-vous sûr de vouloir supprimer la sauvegarde "${backup.fileName}" ?`,
                                  () => handleDeleteBackup(backup.fileName)
                                )
                              }
                            >
                              <DeleteIcon />
                            </IconButton>
                          </Tooltip>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </Paper>
        </Box>
      </Stack>

      {/* Dialog de confirmation */}
      <Dialog
        open={confirmDialog.open}
        onClose={() => setConfirmDialog({ ...confirmDialog, open: false })}
      >
        <DialogTitle>{confirmDialog.title}</DialogTitle>
        <DialogContent>
          <DialogContentText>{confirmDialog.message}</DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmDialog({ ...confirmDialog, open: false })}>
            Annuler
          </Button>
          <Button onClick={handleConfirmAction} variant="contained" autoFocus>
            Confirmer
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialog de RESET COMPLET */}
      <Dialog
        open={resetDialog}
        onClose={() => {
          setResetDialog(false);
          setResetPassword('');
        }}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ bgcolor: 'error.main', color: 'white' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <WarningIcon />
            ATTENTION - RESET COMPLET
          </Box>
        </DialogTitle>
        <DialogContent sx={{ mt: 2 }}>
          <Alert severity="error" sx={{ mb: 2 }}>
            <strong>⚠️ OPÉRATION IRRÉVERSIBLE ⚠️</strong>
            <br />
            Cette action va :
            <ul>
              <li>Supprimer TOUS les scans</li>
              <li>Supprimer TOUS les utilisateurs (sauf admin)</li>
              <li>Supprimer TOUS les logs d'audit</li>
              <li>Supprimer TOUTES les sessions</li>
              <li>Réinitialiser les paramètres par défaut</li>
            </ul>
            Une sauvegarde automatique sera créée avant le reset.
          </Alert>

          <DialogContentText sx={{ mb: 2 }}>
            Pour confirmer, entrez votre mot de passe administrateur :
          </DialogContentText>

          <TextField
            fullWidth
            type="password"
            label="Mot de passe administrateur"
            value={resetPassword}
            onChange={(e) => setResetPassword(e.target.value)}
            autoFocus
            helperText="Votre mot de passe actuel est requis pour cette action"
          />
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => {
              setResetDialog(false);
              setResetPassword('');
            }}
          >
            Annuler
          </Button>
          <Button
            onClick={handleResetDatabase}
            variant="contained"
            color="error"
            disabled={!resetPassword}
          >
            RÉINITIALISER LA BASE
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default DatabaseManagement;
