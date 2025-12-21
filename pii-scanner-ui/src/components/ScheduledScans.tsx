import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Switch,
  FormControlLabel,
  Chip,
  Alert,
  Tooltip
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  PlayArrow as PlayIcon,
  Pause as PauseIcon,
  Folder as FolderIcon
} from '@mui/icons-material';
import axiosInstance from '../services/axios';

interface ScheduledScan {
  id: number;
  name: string;
  directoryPath: string;
  frequency: number; // 0=Daily, 1=Weekly, 2=Monthly, 3=Quarterly
  dayOfWeek?: number; // 0=Sunday, 1=Monday, etc.
  dayOfMonth?: number; // 1-28
  hourOfDay: number; // 0-23
  isActive: boolean;
  createdAt: string;
  lastRunAt?: string;
  nextRunAt?: string;
  lastScanId?: string;
  notifyOnCompletion: boolean;
  notifyOnNewPii: boolean;
  createdByUser?: {
    username: string;
  };
}

interface FormData {
  name: string;
  directoryPath: string;
  frequency: number;
  dayOfWeek?: number;
  dayOfMonth?: number;
  hourOfDay: number;
  isActive: boolean;
  notifyOnCompletion: boolean;
  notifyOnNewPii: boolean;
}

const frequencyLabels: { [key: number]: string } = {
  0: 'Quotidien',
  1: 'Hebdomadaire',
  2: 'Mensuel',
  3: 'Trimestriel'
};

const dayOfWeekLabels: { [key: number]: string } = {
  0: 'Dimanche',
  1: 'Lundi',
  2: 'Mardi',
  3: 'Mercredi',
  4: 'Jeudi',
  5: 'Vendredi',
  6: 'Samedi'
};

const ScheduledScans: React.FC = () => {
  const [scans, setScans] = useState<ScheduledScan[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');
  const [openDialog, setOpenDialog] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState<FormData>({
    name: '',
    directoryPath: '',
    frequency: 1, // Weekly par défaut
    dayOfWeek: 1, // Lundi par défaut
    dayOfMonth: 1,
    hourOfDay: 2, // 2h du matin par défaut
    isActive: true,
    notifyOnCompletion: true,
    notifyOnNewPii: true
  });

  useEffect(() => {
    loadScheduledScans();
  }, []);

  const loadScheduledScans = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get('/scheduledscans');
      setScans(response.data);
      setError('');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erreur lors du chargement des scans planifiés');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (scan?: ScheduledScan) => {
    if (scan) {
      setEditingId(scan.id);
      setFormData({
        name: scan.name,
        directoryPath: scan.directoryPath,
        frequency: scan.frequency,
        dayOfWeek: scan.dayOfWeek,
        dayOfMonth: scan.dayOfMonth,
        hourOfDay: scan.hourOfDay,
        isActive: scan.isActive,
        notifyOnCompletion: scan.notifyOnCompletion,
        notifyOnNewPii: scan.notifyOnNewPii
      });
    } else {
      setEditingId(null);
      setFormData({
        name: '',
        directoryPath: '',
        frequency: 1,
        dayOfWeek: 1,
        dayOfMonth: 1,
        hourOfDay: 2,
        isActive: true,
        notifyOnCompletion: true,
        notifyOnNewPii: true
      });
    }
    setOpenDialog(true);
    setError('');
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingId(null);
  };

  const handleSubmit = async () => {
    try {
      // Validation
      if (!formData.name || !formData.directoryPath) {
        setError('Le nom et le chemin sont requis');
        return;
      }

      if (formData.frequency === 1 && formData.dayOfWeek === undefined) {
        setError('Veuillez sélectionner un jour de la semaine');
        return;
      }

      if ((formData.frequency === 2 || formData.frequency === 3) && !formData.dayOfMonth) {
        setError('Veuillez sélectionner un jour du mois');
        return;
      }

      setLoading(true);

      if (editingId) {
        await axiosInstance.put(`/scheduledscans/${editingId}`, formData);
        setSuccess('Scan planifié modifié avec succès');
      } else {
        await axiosInstance.post('/scheduledscans', formData);
        setSuccess('Scan planifié créé avec succès');
      }

      handleCloseDialog();
      loadScheduledScans();
      setError('');

      setTimeout(() => setSuccess(''), 3000);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erreur lors de l\'enregistrement');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number, name: string) => {
    if (!window.confirm(`Êtes-vous sûr de vouloir supprimer le scan planifié "${name}" ?`)) {
      return;
    }

    try {
      setLoading(true);
      await axiosInstance.delete(`/scheduledscans/${id}`);
      setSuccess('Scan planifié supprimé avec succès');
      loadScheduledScans();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erreur lors de la suppression');
    } finally {
      setLoading(false);
    }
  };

  const handleToggle = async (id: number) => {
    try {
      setLoading(true);
      await axiosInstance.patch(`/scheduledscans/${id}/toggle`);
      loadScheduledScans();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erreur lors du changement de statut');
    } finally {
      setLoading(false);
    }
  };

  const formatDateTime = (dateStr?: string) => {
    if (!dateStr) return 'Jamais';
    const date = new Date(dateStr);
    return date.toLocaleString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getScheduleDescription = (scan: ScheduledScan): string => {
    const freq = frequencyLabels[scan.frequency];
    const hour = `${scan.hourOfDay.toString().padStart(2, '0')}:00`;

    if (scan.frequency === 0) {
      // Quotidien
      return `${freq} à ${hour}`;
    } else if (scan.frequency === 1 && scan.dayOfWeek !== undefined) {
      // Hebdomadaire
      return `${freq} le ${dayOfWeekLabels[scan.dayOfWeek]} à ${hour}`;
    } else if ((scan.frequency === 2 || scan.frequency === 3) && scan.dayOfMonth) {
      // Mensuel ou Trimestriel
      return `${freq} le ${scan.dayOfMonth} du mois à ${hour}`;
    }
    return freq;
  };

  const selectDirectory = async () => {
    try {
      // Utiliser l'API Electron pour ouvrir un sélecteur de dossier
      const result = await (window as any).electronAPI?.selectDirectory();
      if (result) {
        setFormData({ ...formData, directoryPath: result });
      }
    } catch (err) {
      console.error('Erreur lors de la sélection du dossier:', err);
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">Scans Planifiés</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpenDialog()}
          disabled={loading}
        >
          Nouveau Scan Planifié
        </Button>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}

      <Card>
        <CardContent>
          {scans.length === 0 ? (
            <Typography color="text.secondary" textAlign="center" py={4}>
              Aucun scan planifié configuré
            </Typography>
          ) : (
            <TableContainer component={Paper} variant="outlined">
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Nom</TableCell>
                    <TableCell>Répertoire</TableCell>
                    <TableCell>Planification</TableCell>
                    <TableCell>Prochaine exécution</TableCell>
                    <TableCell>Dernière exécution</TableCell>
                    <TableCell>Statut</TableCell>
                    <TableCell align="right">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {scans.map((scan) => (
                    <TableRow key={scan.id}>
                      <TableCell>
                        <Typography variant="body2" fontWeight="bold">
                          {scan.name}
                        </Typography>
                        {scan.createdByUser && (
                          <Typography variant="caption" color="text.secondary">
                            par {scan.createdByUser.username}
                          </Typography>
                        )}
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" sx={{ maxWidth: 300, overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {scan.directoryPath}
                        </Typography>
                      </TableCell>
                      <TableCell>{getScheduleDescription(scan)}</TableCell>
                      <TableCell>{formatDateTime(scan.nextRunAt)}</TableCell>
                      <TableCell>{formatDateTime(scan.lastRunAt)}</TableCell>
                      <TableCell>
                        <Chip
                          label={scan.isActive ? 'Actif' : 'Inactif'}
                          color={scan.isActive ? 'success' : 'default'}
                          size="small"
                        />
                      </TableCell>
                      <TableCell align="right">
                        <Tooltip title={scan.isActive ? 'Désactiver' : 'Activer'}>
                          <IconButton onClick={() => handleToggle(scan.id)} size="small">
                            {scan.isActive ? <PauseIcon /> : <PlayIcon />}
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Modifier">
                          <IconButton onClick={() => handleOpenDialog(scan)} size="small">
                            <EditIcon />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Supprimer">
                          <IconButton onClick={() => handleDelete(scan.id, scan.name)} size="small" color="error">
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
        </CardContent>
      </Card>

      {/* Dialog pour créer/modifier */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>{editingId ? 'Modifier' : 'Nouveau'} Scan Planifié</DialogTitle>
        <DialogContent>
          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

          <TextField
            label="Nom"
            fullWidth
            margin="normal"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
          />

          <Box sx={{ display: 'flex', gap: 1, mt: 2 }}>
            <TextField
              label="Répertoire"
              fullWidth
              value={formData.directoryPath}
              onChange={(e) => setFormData({ ...formData, directoryPath: e.target.value })}
              required
            />
            <IconButton onClick={selectDirectory} color="primary">
              <FolderIcon />
            </IconButton>
          </Box>

          <FormControl fullWidth margin="normal">
            <InputLabel>Fréquence</InputLabel>
            <Select
              value={formData.frequency}
              onChange={(e) => setFormData({ ...formData, frequency: Number(e.target.value) })}
              label="Fréquence"
            >
              <MenuItem value={0}>Quotidien</MenuItem>
              <MenuItem value={1}>Hebdomadaire</MenuItem>
              <MenuItem value={2}>Mensuel</MenuItem>
              <MenuItem value={3}>Trimestriel (tous les 3 mois)</MenuItem>
            </Select>
          </FormControl>

          {formData.frequency === 1 && (
            <FormControl fullWidth margin="normal">
              <InputLabel>Jour de la semaine</InputLabel>
              <Select
                value={formData.dayOfWeek ?? 1}
                onChange={(e) => setFormData({ ...formData, dayOfWeek: Number(e.target.value) })}
                label="Jour de la semaine"
              >
                {Object.entries(dayOfWeekLabels).map(([value, label]) => (
                  <MenuItem key={value} value={Number(value)}>{label}</MenuItem>
                ))}
              </Select>
            </FormControl>
          )}

          {(formData.frequency === 2 || formData.frequency === 3) && (
            <FormControl fullWidth margin="normal">
              <InputLabel>Jour du mois</InputLabel>
              <Select
                value={formData.dayOfMonth ?? 1}
                onChange={(e) => setFormData({ ...formData, dayOfMonth: Number(e.target.value) })}
                label="Jour du mois"
              >
                {Array.from({ length: 28 }, (_, i) => i + 1).map((day) => (
                  <MenuItem key={day} value={day}>{day}</MenuItem>
                ))}
              </Select>
            </FormControl>
          )}

          <FormControl fullWidth margin="normal">
            <InputLabel>Heure d'exécution</InputLabel>
            <Select
              value={formData.hourOfDay}
              onChange={(e) => setFormData({ ...formData, hourOfDay: Number(e.target.value) })}
              label="Heure d'exécution"
            >
              {Array.from({ length: 24 }, (_, i) => i).map((hour) => (
                <MenuItem key={hour} value={hour}>
                  {hour.toString().padStart(2, '0')}:00
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControlLabel
            control={
              <Switch
                checked={formData.isActive}
                onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
              />
            }
            label="Activer immédiatement"
            sx={{ mt: 2 }}
          />

          <FormControlLabel
            control={
              <Switch
                checked={formData.notifyOnCompletion}
                onChange={(e) => setFormData({ ...formData, notifyOnCompletion: e.target.checked })}
              />
            }
            label="Notifier à la fin du scan"
            sx={{ mt: 1 }}
          />

          <FormControlLabel
            control={
              <Switch
                checked={formData.notifyOnNewPii}
                onChange={(e) => setFormData({ ...formData, notifyOnNewPii: e.target.checked })}
              />
            }
            label="Notifier si nouveau PII détecté"
            sx={{ mt: 1 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Annuler</Button>
          <Button onClick={handleSubmit} variant="contained" disabled={loading}>
            {editingId ? 'Modifier' : 'Créer'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ScheduledScans;
