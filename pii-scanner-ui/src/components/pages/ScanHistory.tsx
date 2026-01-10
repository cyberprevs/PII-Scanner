import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  Chip,
  IconButton,
  Tooltip,
  TextField,
  InputAdornment,
  CircularProgress,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import DownloadIcon from '@mui/icons-material/Download';
import FolderIcon from '@mui/icons-material/Folder';
import DeleteIcon from '@mui/icons-material/Delete';
import axios from '../../services/axios';

interface ScanHistoryItem {
  id: number;
  scanId: string;
  directoryPath: string;
  status: string;
  filesScanned: number | null;
  piiDetected: number | null;
  createdAt: string;
  completedAt: string | null;
  userName: string;
}

const ScanHistory: React.FC = () => {
  const [scans, setScans] = useState<ScanHistoryItem[]>([]);
  const [filteredScans, setFilteredScans] = useState<ScanHistoryItem[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [scanToDelete, setScanToDelete] = useState<ScanHistoryItem | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    loadHistory();
  }, []);

  useEffect(() => {
    if (searchTerm) {
      const filtered = scans.filter(
        (scan) =>
          scan.directoryPath.toLowerCase().includes(searchTerm.toLowerCase()) ||
          scan.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          scan.scanId.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredScans(filtered);
    } else {
      setFilteredScans(scans);
    }
  }, [searchTerm, scans]);

  const loadHistory = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/scan/history');
      setScans(response.data);
      setFilteredScans(response.data);
    } catch (err: any) {
      console.error('Error loading history:', err);
      setError(err.response?.data?.message || 'Erreur lors du chargement de l\'historique');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteClick = (scan: ScanHistoryItem) => {
    setScanToDelete(scan);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!scanToDelete) return;

    try {
      setDeleting(true);
      await axios.delete(`/scan/history/${scanToDelete.scanId}`);

      // Mettre à jour la liste localement
      const updatedScans = scans.filter(s => s.scanId !== scanToDelete.scanId);
      setScans(updatedScans);
      setFilteredScans(updatedScans);

      setDeleteDialogOpen(false);
      setScanToDelete(null);
    } catch (err: any) {
      console.error('Delete error:', err);
      setError(err.response?.data?.message || 'Erreur lors de la suppression du scan');
      setTimeout(() => setError(''), 3000);
    } finally {
      setDeleting(false);
    }
  };

  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false);
    setScanToDelete(null);
  };

  const downloadReport = async (scanId: string, format: 'csv' | 'json' | 'html' | 'excel') => {
    try {
      const response = await axios.get(
        `/scan/${scanId}/report/${format}`,
        { responseType: 'blob' }
      );

      const url = window.URL.createObjectURL(response.data);
      const a = document.createElement('a');
      a.href = url;
      a.download = `rapport_${scanId}.${format === 'excel' ? 'xlsx' : format}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      console.error('Download error:', err);
      setError(`Erreur lors du téléchargement du rapport`);
      setTimeout(() => setError(''), 3000);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed':
        return 'success';
      case 'running':
        return 'info';
      case 'error':
        return 'error';
      default:
        return 'default';
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleString('fr-FR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getDuration = (createdAt: string, completedAt: string | null) => {
    if (!completedAt) return '-';
    const start = new Date(createdAt);
    const end = new Date(completedAt);
    const durationMs = end.getTime() - start.getTime();
    const minutes = Math.floor(durationMs / 60000);
    const seconds = Math.floor((durationMs % 60000) / 1000);
    return `${minutes}m ${seconds}s`;
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" fontWeight={700} gutterBottom sx={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
        }}>
          Historique des scans
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Consultez l'historique complet de vos scans et téléchargez les rapports
        </Typography>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      {/* Search */}
      <Box sx={{ mb: 3 }}>
        <TextField
          fullWidth
          variant="outlined"
          placeholder="Rechercher par répertoire, utilisateur ou ID de scan..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
            sx: {
              bgcolor: 'background.paper',
            }
          }}
        />
      </Box>

      {/* Table */}
      <TableContainer component={Paper} sx={{
        background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.02) 0%, rgba(118, 75, 162, 0.02) 100%)',
        border: '1px solid',
        borderColor: 'divider',
      }}>
        <Table>
          <TableHead sx={{ bgcolor: 'rgba(102, 126, 234, 0.05)' }}>
            <TableRow>
              <TableCell sx={{ fontWeight: 600 }}>Date</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Utilisateur</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Répertoire</TableCell>
              <TableCell align="center" sx={{ fontWeight: 600 }}>Statut</TableCell>
              <TableCell align="center" sx={{ fontWeight: 600 }}>Fichiers</TableCell>
              <TableCell align="center" sx={{ fontWeight: 600 }}>PII détectés</TableCell>
              <TableCell align="center" sx={{ fontWeight: 600 }}>Durée</TableCell>
              <TableCell align="center" sx={{ fontWeight: 600 }}>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredScans.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} align="center">
                  <Box sx={{ py: 6 }}>
                    <Typography variant="body1" color="text.secondary" fontWeight={500} gutterBottom>
                      Aucun scan trouvé
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {searchTerm ? 'Aucun résultat ne correspond à votre recherche' : 'Démarrez un scan pour voir l\'historique'}
                    </Typography>
                  </Box>
                </TableCell>
              </TableRow>
            ) : (
              filteredScans.map((scan) => (
                <TableRow
                  key={scan.id}
                  hover
                  sx={{
                    '&:hover': {
                      bgcolor: 'rgba(102, 126, 234, 0.03)',
                    },
                  }}
                >
                  <TableCell>{formatDate(scan.createdAt)}</TableCell>
                  <TableCell>
                    <Typography variant="body2" fontWeight={500}>
                      {scan.userName}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <FolderIcon fontSize="small" sx={{ color: 'primary.main' }} />
                      <Typography variant="body2" noWrap sx={{ maxWidth: 300 }}>
                        {scan.directoryPath}
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell align="center">
                    <Chip
                      label={scan.status}
                      color={getStatusColor(scan.status) as any}
                      size="small"
                      sx={{ fontWeight: 600 }}
                    />
                  </TableCell>
                  <TableCell align="center">
                    <Typography variant="body2" fontWeight={500}>
                      {scan.filesScanned !== null ? scan.filesScanned.toLocaleString() : '-'}
                    </Typography>
                  </TableCell>
                  <TableCell align="center">
                    {scan.piiDetected !== null ? (
                      <Chip
                        label={scan.piiDetected}
                        color={scan.piiDetected > 0 ? 'warning' : 'default'}
                        size="small"
                        sx={{ fontWeight: 600 }}
                      />
                    ) : (
                      '-'
                    )}
                  </TableCell>
                  <TableCell align="center">
                    <Typography variant="body2" fontWeight={500}>
                      {getDuration(scan.createdAt, scan.completedAt)}
                    </Typography>
                  </TableCell>
                  <TableCell align="center">
                    <Box sx={{ display: 'flex', justifyContent: 'center', gap: 0.5 }}>
                      {scan.status.toLowerCase() === 'completed' && (
                        <>
                          <Tooltip title="Télécharger CSV">
                            <IconButton
                              size="small"
                              onClick={() => downloadReport(scan.scanId, 'csv')}
                              sx={{
                                '&:hover': {
                                  bgcolor: 'rgba(102, 126, 234, 0.1)',
                                },
                              }}
                            >
                              <DownloadIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Télécharger Excel">
                            <IconButton
                              size="small"
                              onClick={() => downloadReport(scan.scanId, 'excel')}
                              sx={{
                                color: '#10b981',
                                '&:hover': {
                                  bgcolor: 'rgba(16, 185, 129, 0.1)',
                                },
                              }}
                            >
                              <DownloadIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        </>
                      )}
                      <Tooltip title="Supprimer le scan">
                        <IconButton
                          size="small"
                          onClick={() => handleDeleteClick(scan)}
                          sx={{
                            color: 'error.main',
                            '&:hover': {
                              bgcolor: 'rgba(244, 67, 54, 0.1)',
                            },
                          }}
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <Box sx={{ mt: 3, textAlign: 'center' }}>
        <Typography variant="body2" color="text.secondary" fontWeight={500}>
          Total: {filteredScans.length} scan(s) • {scans.filter(s => s.status.toLowerCase() === 'completed').length} complété(s)
        </Typography>
      </Box>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={handleDeleteCancel}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle sx={{ fontWeight: 600 }}>
          Confirmer la suppression
        </DialogTitle>
        <DialogContent>
          <DialogContentText>
            Êtes-vous sûr de vouloir supprimer ce scan ?
            <Box sx={{ mt: 2, p: 2, bgcolor: 'rgba(244, 67, 54, 0.05)', borderRadius: 1, border: '1px solid', borderColor: 'rgba(244, 67, 54, 0.2)' }}>
              <Typography variant="body2" fontWeight={500} gutterBottom>
                ID: {scanToDelete?.scanId}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Dossier: {scanToDelete?.directoryPath}
              </Typography>
            </Box>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
              Cette action est irréversible. Le scan et tous ses rapports seront supprimés définitivement.
            </Typography>
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ p: 2, pt: 0 }}>
          <Button
            onClick={handleDeleteCancel}
            disabled={deleting}
            sx={{ fontWeight: 600 }}
          >
            Annuler
          </Button>
          <Button
            onClick={handleDeleteConfirm}
            variant="contained"
            color="error"
            disabled={deleting}
            startIcon={deleting ? <CircularProgress size={16} color="inherit" /> : <DeleteIcon />}
            sx={{ fontWeight: 600 }}
          >
            {deleting ? 'Suppression...' : 'Supprimer'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ScanHistory;
