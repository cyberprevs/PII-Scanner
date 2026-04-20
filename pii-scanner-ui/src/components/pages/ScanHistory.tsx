import React, { useState, useEffect } from 'react';
import { IS_MOCK } from '../../config';
import {
  Box,
  Card,
  CardContent,
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
import TableChartIcon from '@mui/icons-material/TableChart';
import DescriptionIcon from '@mui/icons-material/Description';
import FolderIcon from '@mui/icons-material/Folder';
import DeleteIcon from '@mui/icons-material/Delete';
import HistoryIcon from '@mui/icons-material/History';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import LockIcon from '@mui/icons-material/Lock';
import axios from '../../services/axios';
import PageHeader from '../common/PageHeader';
import { tokens } from '../../theme/designSystem';
import { useTranslation } from 'react-i18next';

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
  const { t, i18n } = useTranslation();
  const c = tokens.colors;
  const [scans, setScans] = useState<ScanHistoryItem[]>([]);
  const [filteredScans, setFilteredScans] = useState<ScanHistoryItem[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [reportPassword, setReportPassword] = useState<{ password: string; format: string } | null>(null);
  const [scanToDelete, setScanToDelete] = useState<ScanHistoryItem | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => { loadHistory(); }, []);

  useEffect(() => {
    if (searchTerm) {
      setFilteredScans(scans.filter(scan =>
        scan.directoryPath.toLowerCase().includes(searchTerm.toLowerCase()) ||
        scan.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        scan.scanId.toLowerCase().includes(searchTerm.toLowerCase())
      ));
    } else {
      setFilteredScans(scans);
    }
  }, [searchTerm, scans]);

  const loadHistory = async () => {
    if (IS_MOCK) { setLoading(false); return; }
    try {
      setLoading(true);
      const response = await axios.get('/scan/history');
      setScans(response.data);
      setFilteredScans(response.data);
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string } } };
      setError(e.response?.data?.message || t('history.errorLoad'));
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteClick = (scan: ScanHistoryItem) => { setScanToDelete(scan); setDeleteDialogOpen(true); };

  const handleDeleteConfirm = async () => {
    if (!scanToDelete) return;
    try {
      setDeleting(true);
      await axios.delete(`/scan/history/${scanToDelete.scanId}`);
      const updatedScans = scans.filter(s => s.scanId !== scanToDelete.scanId);
      setScans(updatedScans);
      setFilteredScans(updatedScans);
      setDeleteDialogOpen(false);
      setScanToDelete(null);
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string } } };
      setError(e.response?.data?.message || t('history.errorDelete'));
      setTimeout(() => setError(''), 3000);
    } finally {
      setDeleting(false);
    }
  };

  const handleDeleteCancel = () => { setDeleteDialogOpen(false); setScanToDelete(null); };

  const downloadReport = async (scanId: string, format: 'csv' | 'json' | 'html' | 'excel') => {
    try {
      const response = await axios.get(`/scan/${scanId}/report/${format}`, { responseType: 'blob' });
      const ext = format === 'excel' ? 'xlsx' : format;
      const url = window.URL.createObjectURL(response.data);
      const a = document.createElement('a');
      a.href = url;
      a.download = `rapport_${scanId}.${ext}.enc`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      const password = response.headers['x-report-password'] ?? null;
      if (password) {
        setReportPassword({ password, format: format.toUpperCase() });
      }
    } catch {
      setError(t('history.errorDownload'));
      setTimeout(() => setError(''), 3000);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed': return 'success';
      case 'running': return 'info';
      case 'error': return 'error';
      default: return 'default';
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleString(i18n.language === 'fr' ? 'fr-FR' : 'en-US', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' });
  };

  const getDuration = (createdAt: string, completedAt: string | null) => {
    if (!completedAt) return '-';
    const durationMs = new Date(completedAt).getTime() - new Date(createdAt).getTime();
    return `${Math.floor(durationMs / 60000)}m ${Math.floor((durationMs % 60000) / 1000)}s`;
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
      <PageHeader
        icon={<HistoryIcon />}
        title={t('history.title')}
        subtitle={t('history.subtitle')}
        actions={
          <Typography variant="body2" color="text.secondary">
            {t('history.total', { total: filteredScans.length, completed: scans.filter(s => s.status.toLowerCase() === 'completed').length })}
          </Typography>
        }
      />

      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      {/* Search bar */}
      <Card sx={{ mb: 3 }}>
        <CardContent sx={{ pb: '12px !important', pt: '12px !important' }}>
          <TextField
            fullWidth
            size="small"
            variant="outlined"
            placeholder={t('history.searchPlaceholder')}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon sx={{ color: 'text.secondary' }} />
                </InputAdornment>
              ),
            }}
          />
        </CardContent>
      </Card>

      {/* Table */}
      <TableContainer
        component={Paper}
        sx={{ border: '1px solid', borderColor: 'divider', borderRadius: `${tokens.radii.lg}px` }}
      >
        <Table>
          <TableHead>
            <TableRow>
              <TableCell sx={{ fontWeight: 600 }}>{t('history.colDate')}</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>{t('history.colUser')}</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>{t('history.colDirectory')}</TableCell>
              <TableCell align="center" sx={{ fontWeight: 600 }}>{t('history.colStatus')}</TableCell>
              <TableCell align="center" sx={{ fontWeight: 600 }}>{t('history.colFiles')}</TableCell>
              <TableCell align="center" sx={{ fontWeight: 600 }}>{t('history.colPii')}</TableCell>
              <TableCell align="center" sx={{ fontWeight: 600 }}>{t('history.colDuration')}</TableCell>
              <TableCell align="center" sx={{ fontWeight: 600 }}>{t('history.colActions')}</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredScans.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} align="center">
                  <Box sx={{ py: 6 }}>
                    <Typography variant="body1" color="text.secondary" fontWeight={500} gutterBottom>
                      {t('history.noScans')}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {searchTerm ? t('history.noResults') : t('history.startScan')}
                    </Typography>
                  </Box>
                </TableCell>
              </TableRow>
            ) : (
              filteredScans.map((scan) => (
                <TableRow key={scan.id} hover>
                  <TableCell>{formatDate(scan.createdAt)}</TableCell>
                  <TableCell>
                    <Typography variant="body2" fontWeight={500}>{scan.userName}</Typography>
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <FolderIcon fontSize="small" sx={{ color: 'primary.main' }} />
                      <Typography variant="body2" noWrap sx={{ maxWidth: 300 }}>{scan.directoryPath}</Typography>
                    </Box>
                  </TableCell>
                  <TableCell align="center">
                    <Chip label={scan.status} color={getStatusColor(scan.status) as 'success' | 'info' | 'error' | 'default'} size="small" sx={{ fontWeight: 600 }} />
                  </TableCell>
                  <TableCell align="center">
                    <Typography variant="body2" fontWeight={500}>
                      {scan.filesScanned !== null ? scan.filesScanned.toLocaleString() : '-'}
                    </Typography>
                  </TableCell>
                  <TableCell align="center">
                    {scan.piiDetected !== null ? (
                      <Chip label={scan.piiDetected} color={scan.piiDetected > 0 ? 'warning' : 'default'} size="small" sx={{ fontWeight: 600 }} />
                    ) : '-'}
                  </TableCell>
                  <TableCell align="center">
                    <Typography variant="body2" fontWeight={500}>{getDuration(scan.createdAt, scan.completedAt)}</Typography>
                  </TableCell>
                  <TableCell align="center">
                    <Box sx={{ display: 'flex', justifyContent: 'center', gap: 0.5 }}>
                      {scan.status.toLowerCase() === 'completed' && (
                        <>
                          <Tooltip title={t('history.downloadCsv')}>
                            <IconButton size="small" onClick={() => downloadReport(scan.scanId, 'csv')} sx={{ '&:hover': { bgcolor: c.accentPrimaryMuted } }}>
                              <TableChartIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title={t('history.downloadExcel')}>
                            <IconButton size="small" onClick={() => downloadReport(scan.scanId, 'excel')} sx={{ color: '#10b981', '&:hover': { bgcolor: 'rgba(16,185,129,0.1)' } }}>
                              <DescriptionIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        </>
                      )}
                      <Tooltip title={t('history.deleteScan')}>
                        <IconButton size="small" onClick={() => handleDeleteClick(scan)} sx={{ color: 'error.main', '&:hover': { bgcolor: c.dangerMuted } }}>
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

      {/* Delete dialog */}
      <Dialog open={deleteDialogOpen} onClose={handleDeleteCancel} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ fontWeight: 600 }}>{t('history.confirmDelete')}</DialogTitle>
        <DialogContent>
          <DialogContentText>
            {t('history.confirmDeleteMsg')}
            <Box sx={{ mt: 2, p: 2, bgcolor: c.dangerMuted, borderRadius: 1, border: '1px solid', borderColor: 'rgba(244, 82, 82, 0.2)' }}>
              <Typography variant="body2" fontWeight={500} gutterBottom>{t('history.scanId', { id: scanToDelete?.scanId })}</Typography>
              <Typography variant="body2" color="text.secondary">{t('history.scanFolder', { path: scanToDelete?.directoryPath })}</Typography>
            </Box>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>{t('history.deleteWarning')}</Typography>
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ p: 2, pt: 0 }}>
          <Button onClick={handleDeleteCancel} disabled={deleting} sx={{ fontWeight: 600 }}>{t('history.cancel')}</Button>
          <Button onClick={handleDeleteConfirm} variant="contained" color="error" disabled={deleting} startIcon={deleting ? <CircularProgress size={16} color="inherit" /> : <DeleteIcon />} sx={{ fontWeight: 600 }}>
            {deleting ? t('history.deleting') : t('history.delete')}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialog mot de passe rapport chiffré */}
      <Dialog open={!!reportPassword} maxWidth="xs" fullWidth PaperProps={{ sx: { borderRadius: 3 } }}>
        <DialogTitle sx={{ pb: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <LockIcon sx={{ color: '#00E599' }} />
            <Typography variant="h6" fontWeight={700}>Rapport chiffré téléchargé</Typography>
          </Box>
        </DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Votre rapport <strong>{reportPassword?.format}</strong> a été chiffré (AES-256). Notez ce mot de passe — il ne sera plus affiché.
          </Typography>
          <Box sx={{
            display: 'flex', alignItems: 'center', gap: 1,
            p: 1.5, borderRadius: 2,
            bgcolor: 'rgba(0,229,153,0.08)',
            border: '1px solid rgba(0,229,153,0.3)',
          }}>
            <Typography variant="h6" fontWeight={700} sx={{ flex: 1, fontFamily: 'monospace', letterSpacing: 2, color: '#00E599' }}>
              {reportPassword?.password}
            </Typography>
            <IconButton size="small" onClick={() => { if (reportPassword) navigator.clipboard.writeText(reportPassword.password); }} title="Copier">
              <ContentCopyIcon fontSize="small" />
            </IconButton>
          </Box>
          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1.5 }}>
            Le fichier porte l'extension <code>.enc</code>. Déchiffrez-le avec PII Scanner ou OpenSSL (AES-256-CBC).
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button variant="contained" onClick={() => setReportPassword(null)} sx={{ background: 'linear-gradient(135deg, #00E599 0%, #00B876 100%)', fontWeight: 600 }}>
            J'ai noté le mot de passe
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ScanHistory;
