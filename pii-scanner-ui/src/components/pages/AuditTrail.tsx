import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Button,
  Chip,
  Card,
  CardContent,
  Alert,
  IconButton,
  Tooltip,
  Stack,
} from '@mui/material';
import {
  Search as SearchIcon,
  Download as DownloadIcon,
  Refresh as RefreshIcon,
  Info as InfoIcon,
  Delete as DeleteIcon,
} from '@mui/icons-material';
import axios from '../../services/axios';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';

interface AuditLog {
  id: number;
  userId?: number;
  username?: string;
  action: string;
  entityType: string;
  entityId: string;
  ipAddress: string;
  createdAt: string;
  details?: string;
}

interface PagedResult {
  items: AuditLog[];
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

interface AuditStats {
  totalLogs: number;
  actionCounts: { action: string; count: number }[];
  entityTypeCounts: { entityType: string; count: number }[];
  userActivityCounts: { userId: number; username: string; count: number }[];
  dailyActivity: { date: string; count: number }[];
}

const COLORS = ['#667eea', '#764ba2', '#f093fb', '#4facfe', '#43e97b', '#fa709a'];

const AuditTrail: React.FC = () => {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [stats, setStats] = useState<AuditStats | null>(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(50);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Filters
  const [search, setSearch] = useState('');
  const [actionFilter, setActionFilter] = useState('');
  const [entityTypeFilter, setEntityTypeFilter] = useState('');
  const [userIdFilter, setUserIdFilter] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [availableActions, setAvailableActions] = useState<string[]>([]);
  const [availableEntityTypes, setAvailableEntityTypes] = useState<string[]>([]);

  useEffect(() => {
    loadAuditLogs();
    loadStats();
    loadFilters();
  }, [page, rowsPerPage, actionFilter, entityTypeFilter, userIdFilter, startDate, endDate]);

  const loadAuditLogs = async () => {
    setLoading(true);
    setError('');
    try {
      const params: any = {
        page: page + 1,
        pageSize: rowsPerPage,
      };
      if (search) params.search = search;
      if (actionFilter) params.action = actionFilter;
      if (entityTypeFilter) params.entityType = entityTypeFilter;
      if (userIdFilter) params.userId = userIdFilter;
      if (startDate) params.startDate = startDate;
      if (endDate) params.endDate = endDate;

      const response = await axios.get<PagedResult>('/audit', { params });
      setLogs(response.data.items);
      setTotalCount(response.data.totalCount);
    } catch (error: any) {
      console.error('Error loading audit logs:', error);
      setError('Erreur lors du chargement des logs d\'audit');
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const params: any = {};
      if (startDate) params.startDate = startDate;
      if (endDate) params.endDate = endDate;

      const response = await axios.get<AuditStats>('/audit/stats', { params });
      setStats(response.data);
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  const loadFilters = async () => {
    try {
      const [actionsRes, entityTypesRes] = await Promise.all([
        axios.get<string[]>('/audit/actions'),
        axios.get<string[]>('/audit/entity-types'),
      ]);
      setAvailableActions(actionsRes.data);
      setAvailableEntityTypes(entityTypesRes.data);
    } catch (error) {
      console.error('Error loading filters:', error);
    }
  };

  const handleSearch = () => {
    setPage(0);
    loadAuditLogs();
  };

  const handleReset = () => {
    setSearch('');
    setActionFilter('');
    setEntityTypeFilter('');
    setUserIdFilter('');
    setStartDate('');
    setEndDate('');
    setPage(0);
    loadAuditLogs();
  };

  const handleExportCsv = async () => {
    try {
      const params: any = {};
      if (actionFilter) params.action = actionFilter;
      if (entityTypeFilter) params.entityType = entityTypeFilter;
      if (userIdFilter) params.userId = userIdFilter;
      if (startDate) params.startDate = startDate;
      if (endDate) params.endDate = endDate;

      const response = await axios.get('/audit/export/csv', {
        params,
        responseType: 'blob',
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `audit_logs_${new Date().toISOString()}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      setSuccess('Export CSV réussi');
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      setError('Erreur lors de l\'export CSV');
      setTimeout(() => setError(''), 3000);
    }
  };

  const handleCleanup = async () => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer les anciens logs selon la politique de rétention ?')) {
      return;
    }

    try {
      const response = await axios.delete('/audit/cleanup');
      setSuccess(response.data.message);
      loadAuditLogs();
      loadStats();
      setTimeout(() => setSuccess(''), 5000);
    } catch (error: any) {
      setError(error.response?.data?.error || 'Erreur lors du nettoyage');
      setTimeout(() => setError(''), 3000);
    }
  };

  const getActionColor = (action: string) => {
    if (action.includes('Delete') || action.includes('Failed')) return 'error';
    if (action.includes('Create') || action.includes('Success')) return 'success';
    if (action.includes('Update') || action.includes('Change')) return 'warning';
    return 'info';
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('fr-FR');
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: 600 }}>
          Audit Trail
        </Typography>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={() => {
              loadAuditLogs();
              loadStats();
            }}
          >
            Actualiser
          </Button>
          <Button
            variant="contained"
            startIcon={<DownloadIcon />}
            onClick={handleExportCsv}
          >
            Exporter CSV
          </Button>
          <Button
            variant="outlined"
            color="error"
            startIcon={<DeleteIcon />}
            onClick={handleCleanup}
          >
            Nettoyer
          </Button>
        </Box>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}

      {/* Statistics Cards */}
      {stats && (
        <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 3, mb: 3 }}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Total Logs
              </Typography>
              <Typography variant="h4">{stats.totalLogs.toLocaleString()}</Typography>
            </CardContent>
          </Card>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Actions Uniques
              </Typography>
              <Typography variant="h4">{stats.actionCounts.length}</Typography>
            </CardContent>
          </Card>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Types d'Entités
              </Typography>
              <Typography variant="h4">{stats.entityTypeCounts.length}</Typography>
            </CardContent>
          </Card>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Utilisateurs Actifs
              </Typography>
              <Typography variant="h4">{stats.userActivityCounts.length}</Typography>
            </CardContent>
          </Card>
        </Box>
      )}

      {/* Charts */}
      {stats && (
        <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: 3, mb: 3 }}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Actions
            </Typography>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={stats.actionCounts.slice(0, 6)}
                  dataKey="count"
                  nameKey="action"
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  label
                >
                  {stats.actionCounts.slice(0, 6).map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <RechartsTooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </Paper>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Activité par Utilisateur (Top 10)
            </Typography>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={stats.userActivityCounts}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="username" />
                <YAxis />
                <RechartsTooltip />
                <Bar dataKey="count" fill="#667eea" />
              </BarChart>
            </ResponsiveContainer>
          </Paper>
        </Box>
      )}

      {/* Filters */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Filtres
        </Typography>
        <Stack spacing={2}>
          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
            <TextField
              sx={{ flex: '1 1 300px' }}
              label="Recherche"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Détails, IP, EntityId..."
            />
            <FormControl sx={{ flex: '1 1 200px' }}>
              <InputLabel>Action</InputLabel>
              <Select
                value={actionFilter}
                label="Action"
                onChange={(e) => setActionFilter(e.target.value)}
              >
                <MenuItem value="">Toutes</MenuItem>
                {availableActions.map((action) => (
                  <MenuItem key={action} value={action}>
                    {action}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControl sx={{ flex: '1 1 200px' }}>
              <InputLabel>Type d'Entité</InputLabel>
              <Select
                value={entityTypeFilter}
                label="Type d'Entité"
                onChange={(e) => setEntityTypeFilter(e.target.value)}
              >
                <MenuItem value="">Tous</MenuItem>
                {availableEntityTypes.map((type) => (
                  <MenuItem key={type} value={type}>
                    {type}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>
          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'flex-start' }}>
            <TextField
              sx={{ flex: '1 1 120px' }}
              label="User ID"
              type="number"
              value={userIdFilter}
              onChange={(e) => setUserIdFilter(e.target.value)}
            />
            <TextField
              sx={{ flex: '1 1 150px' }}
              label="Date début"
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              InputLabelProps={{ shrink: true }}
            />
            <TextField
              sx={{ flex: '1 1 150px' }}
              label="Date fin"
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              InputLabelProps={{ shrink: true }}
            />
            <Button variant="contained" onClick={handleSearch} startIcon={<SearchIcon />}>
              Rechercher
            </Button>
            <Button onClick={handleReset}>Réinitialiser</Button>
          </Box>
        </Stack>
      </Paper>

      {/* Audit Logs Table */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>ID</TableCell>
              <TableCell>Date/Heure</TableCell>
              <TableCell>Utilisateur</TableCell>
              <TableCell>Action</TableCell>
              <TableCell>Type</TableCell>
              <TableCell>Entity ID</TableCell>
              <TableCell>IP</TableCell>
              <TableCell>Détails</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={8} align="center">
                  Chargement...
                </TableCell>
              </TableRow>
            ) : logs.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} align="center">
                  Aucun log d'audit trouvé
                </TableCell>
              </TableRow>
            ) : (
              logs.map((log) => (
                <TableRow key={log.id} hover>
                  <TableCell>{log.id}</TableCell>
                  <TableCell>{formatDate(log.createdAt)}</TableCell>
                  <TableCell>
                    {log.username || log.userId || 'Système'}
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={log.action}
                      color={getActionColor(log.action)}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>{log.entityType}</TableCell>
                  <TableCell>{log.entityId}</TableCell>
                  <TableCell>
                    <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
                      {log.ipAddress}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    {log.details && (
                      <Tooltip title={log.details}>
                        <IconButton size="small">
                          <InfoIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    )}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
        <TablePagination
          component="div"
          count={totalCount}
          page={page}
          onPageChange={(_, newPage) => setPage(newPage)}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={(e) => {
            setRowsPerPage(parseInt(e.target.value, 10));
            setPage(0);
          }}
          rowsPerPageOptions={[25, 50, 100, 200]}
          labelRowsPerPage="Lignes par page"
          labelDisplayedRows={({ from, to, count }) => `${from}-${to} sur ${count}`}
        />
      </TableContainer>
    </Box>
  );
};

export default AuditTrail;
