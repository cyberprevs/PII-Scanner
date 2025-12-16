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
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import DownloadIcon from '@mui/icons-material/Download';
import FolderIcon from '@mui/icons-material/Folder';
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
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom sx={{ mb: 3 }}>
        Historique des scans
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}

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
          }}
        />
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Date</TableCell>
              <TableCell>Utilisateur</TableCell>
              <TableCell>Répertoire</TableCell>
              <TableCell align="center">Statut</TableCell>
              <TableCell align="center">Fichiers</TableCell>
              <TableCell align="center">PII détectés</TableCell>
              <TableCell align="center">Durée</TableCell>
              <TableCell align="center">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredScans.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} align="center">
                  <Typography variant="body2" color="text.secondary" sx={{ py: 3 }}>
                    Aucun scan trouvé
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              filteredScans.map((scan) => (
                <TableRow key={scan.id} hover>
                  <TableCell>{formatDate(scan.createdAt)}</TableCell>
                  <TableCell>{scan.userName}</TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <FolderIcon fontSize="small" color="action" />
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
                    />
                  </TableCell>
                  <TableCell align="center">
                    {scan.filesScanned !== null ? scan.filesScanned : '-'}
                  </TableCell>
                  <TableCell align="center">
                    {scan.piiDetected !== null ? (
                      <Chip
                        label={scan.piiDetected}
                        color={scan.piiDetected > 0 ? 'warning' : 'default'}
                        size="small"
                      />
                    ) : (
                      '-'
                    )}
                  </TableCell>
                  <TableCell align="center">
                    {getDuration(scan.createdAt, scan.completedAt)}
                  </TableCell>
                  <TableCell align="center">
                    {scan.status.toLowerCase() === 'completed' && (
                      <Box sx={{ display: 'flex', justifyContent: 'center', gap: 0.5 }}>
                        <Tooltip title="Télécharger CSV">
                          <IconButton
                            size="small"
                            onClick={() => downloadReport(scan.scanId, 'csv')}
                          >
                            <DownloadIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Télécharger Excel">
                          <IconButton
                            size="small"
                            onClick={() => downloadReport(scan.scanId, 'excel')}
                            sx={{ color: '#10b981' }}
                          >
                            <DownloadIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    )}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <Box sx={{ mt: 2, textAlign: 'center' }}>
        <Typography variant="body2" color="text.secondary">
          Total: {filteredScans.length} scan(s)
        </Typography>
      </Box>
    </Box>
  );
};

export default ScanHistory;
