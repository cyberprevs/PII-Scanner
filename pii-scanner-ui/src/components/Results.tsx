import { useNavigate } from 'react-router-dom';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Alert,
  Stack,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import RefreshIcon from '@mui/icons-material/Refresh';
import TableChartIcon from '@mui/icons-material/TableChart';
import DataObjectIcon from '@mui/icons-material/DataObject';
import CodeIcon from '@mui/icons-material/Code';
import DescriptionIcon from '@mui/icons-material/Description';
import type { ScanResultResponse } from '../types';
import EmptyState from './common/EmptyState';
import StatCard from './common/StatCard';
import { getRechartsTooltipStyle, tokens } from '../theme/designSystem';

interface ResultsProps {
  results: ScanResultResponse | null;
  onDownloadReport: (format: 'csv' | 'json' | 'html' | 'excel') => void;
  onNewScan: () => void;
}

const COLORS = ['#00E599', '#3B82F6', '#F0A000', '#F45252', '#A78BFA', '#EC4899', '#06B6D4', '#84CC16'];

const getRiskColor = (riskLevel: string) => {
  switch (riskLevel) {
    case 'ÉLEVÉ': return 'error';
    case 'MOYEN': return 'warning';
    case 'FAIBLE': return 'success';
    default: return 'default';
  }
};

export default function Results({ results, onDownloadReport, onNewScan }: ResultsProps) {
  const navigate = useNavigate();
  const theme = useTheme();
  const dark = theme.palette.mode === 'dark';
  const c = tokens.colors;
  const axisStyle = { fontSize: 12, fill: dark ? c.textTertiary : c.light.textTertiary };

  if (!results) {
    return (
      <EmptyState
        title="Bienvenue dans PII Scanner"
        description="Aucun scan récent disponible. Lancez un nouveau scan pour commencer."
        actionLabel="Nouveau Scan"
        onAction={() => navigate('/scanner')}
        actionIcon={<RefreshIcon />}
      />
    );
  }

  const { statistics, detections } = results;

  const chartData = Object.entries(statistics.piiByType).map(([type, count]) => ({ type, count }));
  const pieData = Object.entries(statistics.piiByType).map(([name, value]) => ({ name, value }));

  const stalenessData = [
    { level: 'Récent', count: 0, color: '#4caf50' },
    { level: '6 mois', count: 0, color: '#8bc34a' },
    { level: '1 an', count: 0, color: '#ff9800' },
    { level: '3 ans', count: 0, color: '#ff5722' },
    { level: '+5 ans', count: 0, color: '#f44336' },
  ];
  const exposureData = [
    { level: 'Faible', count: 0, color: '#4caf50' },
    { level: 'Moyen', count: 0, color: '#ff9800' },
    { level: 'Élevé', count: 0, color: '#ff5722' },
    { level: 'Critique', count: 0, color: '#f44336' },
  ];
  const riskData = [
    { level: 'FAIBLE', count: 0, color: '#4caf50' },
    { level: 'MOYEN', count: 0, color: '#ff9800' },
    { level: 'ÉLEVÉ', count: 0, color: '#f44336' },
  ];

  statistics.topRiskyFiles.forEach(file => {
    if (file.stalenessLevel) {
      const item = stalenessData.find(d => d.level === file.stalenessLevel);
      if (item) item.count++;
    }
    if (file.exposureLevel) {
      const item = exposureData.find(d => d.level === file.exposureLevel);
      if (item) item.count++;
    }
    const riskItem = riskData.find(d => d.level === file.riskLevel);
    if (riskItem) riskItem.count++;
  });

  return (
    <Box>
      {/* KPI Cards */}
      <Box sx={{ display: 'flex', gap: 3, mb: 4, flexWrap: 'wrap' }}>
        <StatCard topBorderOnly accentColor={c.accentPrimary} value={statistics.totalFilesScanned} label="Fichiers scannés" />
        <StatCard topBorderOnly accentColor={c.danger} value={statistics.filesWithPii} label="Fichiers avec PII" />
        <StatCard topBorderOnly accentColor={c.info} value={statistics.totalPiiFound} label="PII détectées" />
        <StatCard topBorderOnly accentColor="#A78BFA" value={Object.keys(statistics.piiByType).length} label="Types de PII" />
      </Box>

      {/* Action buttons */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Button variant="outlined" onClick={onNewScan} startIcon={<RefreshIcon />}>
          Nouveau Scan
        </Button>
        <Stack direction="row" spacing={1}>
          <Button variant="outlined" size="small" onClick={() => onDownloadReport('csv')} startIcon={<TableChartIcon />}>CSV</Button>
          <Button variant="outlined" size="small" onClick={() => onDownloadReport('json')} startIcon={<DataObjectIcon />}>JSON</Button>
          <Button variant="outlined" size="small" onClick={() => onDownloadReport('html')} startIcon={<CodeIcon />}>HTML</Button>
          <Button variant="contained" size="small" onClick={() => onDownloadReport('excel')} startIcon={<DescriptionIcon />}>Excel</Button>
        </Stack>
      </Box>

      {/* Charts */}
      <Card>
        <CardContent sx={{ p: 3 }}>
          {/* Compact legend banner */}
          <Alert severity="info" variant="outlined" icon={false} sx={{ mb: 3 }}>
            <Typography variant="caption" color="text.secondary">
              <strong>Risque :</strong> FAIBLE (1-5 PII), MOYEN (6-15), ÉLEVÉ (16+) —{' '}
              <strong>Ancienneté :</strong> basé sur la dernière modification —{' '}
              <strong>Exposition :</strong> basé sur les permissions Windows NTFS
            </Typography>
          </Alert>

          {/* PII by type + pie */}
          <Box sx={{ display: 'flex', gap: 3, flexWrap: 'wrap' }}>
            <Box sx={{ flex: '2 1 500px', minWidth: 0 }}>
              <Typography variant="h6" gutterBottom fontWeight={600}>
                Répartition par type de PII
              </Typography>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={chartData}>
                  <CartesianGrid horizontal={true} vertical={false} stroke={dark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.04)'} />
                  <XAxis dataKey="type" tick={axisStyle} angle={-45} textAnchor="end" height={80} axisLine={false} tickLine={false} />
                  <YAxis tick={axisStyle} axisLine={false} tickLine={false} />
                  <RechartsTooltip contentStyle={getRechartsTooltipStyle(dark)} />
                  <Bar dataKey="count" fill="#00E599" name="Nombre de PII" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </Box>
            <Box sx={{ flex: '1 1 280px', minWidth: 0 }}>
              <Typography variant="h6" gutterBottom fontWeight={600}>
                Distribution
              </Typography>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={90}
                    paddingAngle={2}
                    dataKey="value"
                    label={(entry) => entry.name.length > 12 ? entry.name.substring(0, 12) + '…' : entry.name}
                    labelLine={false}
                  >
                    {pieData.map((_entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <RechartsTooltip contentStyle={getRechartsTooltipStyle(dark)} />
                </PieChart>
              </ResponsiveContainer>
            </Box>
          </Box>

          {/* Risk / Staleness / Exposure charts */}
          <Box sx={{ display: 'flex', gap: 3, flexWrap: 'wrap', mt: 3 }}>
            <Box sx={{ flex: '1 1 350px', minWidth: 0 }}>
              <Typography variant="h6" gutterBottom fontWeight={600}>Niveau de risque</Typography>
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={riskData}>
                  <CartesianGrid horizontal={true} vertical={false} stroke={dark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.04)'} />
                  <XAxis dataKey="level" tick={axisStyle} axisLine={false} tickLine={false} />
                  <YAxis tick={axisStyle} axisLine={false} tickLine={false} />
                  <RechartsTooltip contentStyle={getRechartsTooltipStyle(dark)} />
                  <Bar dataKey="count" name="Nombre de fichiers" radius={[6, 6, 0, 0]}>
                    {riskData.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </Box>

            <Box sx={{ flex: '1 1 350px', minWidth: 0 }}>
              <Typography variant="h6" gutterBottom fontWeight={600}>Ancienneté (Stale Data)</Typography>
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={stalenessData.filter(d => d.count > 0)}>
                  <CartesianGrid horizontal={true} vertical={false} stroke={dark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.04)'} />
                  <XAxis dataKey="level" tick={axisStyle} axisLine={false} tickLine={false} />
                  <YAxis tick={axisStyle} axisLine={false} tickLine={false} />
                  <RechartsTooltip contentStyle={getRechartsTooltipStyle(dark)} />
                  <Bar dataKey="count" name="Nombre de fichiers" radius={[6, 6, 0, 0]}>
                    {stalenessData.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </Box>

            <Box sx={{ flex: '1 1 350px', minWidth: 0 }}>
              <Typography variant="h6" gutterBottom fontWeight={600}>Exposition (Over-Exposed)</Typography>
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={exposureData.filter(d => d.count > 0)}>
                  <CartesianGrid horizontal={true} vertical={false} stroke={dark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.04)'} />
                  <XAxis dataKey="level" tick={axisStyle} axisLine={false} tickLine={false} />
                  <YAxis tick={axisStyle} axisLine={false} tickLine={false} />
                  <RechartsTooltip contentStyle={getRechartsTooltipStyle(dark)} />
                  <Bar dataKey="count" name="Nombre de fichiers" radius={[6, 6, 0, 0]}>
                    {exposureData.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </Box>
          </Box>
        </CardContent>
      </Card>

      {/* Risky files table */}
      {statistics.topRiskyFiles.length > 0 && (
        <Box sx={{ mt: 4 }}>
          <Typography variant="h6" gutterBottom fontWeight={600}>
            Fichiers à risque ({statistics.topRiskyFiles.length})
          </Typography>
          <TableContainer
            component={Paper}
            sx={{ maxHeight: 500, border: '1px solid', borderColor: 'divider', borderRadius: `${tokens.radii.lg}px` }}
          >
            <Table stickyHeader size="small">
              <TableHead>
                <TableRow>
                  <TableCell><strong>Risque</strong></TableCell>
                  <TableCell><strong>Fichier</strong></TableCell>
                  <TableCell align="right"><strong>PII</strong></TableCell>
                  <TableCell><strong>Ancienneté</strong></TableCell>
                  <TableCell><strong>Exposition</strong></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {statistics.topRiskyFiles.map((file, index) => (
                  <TableRow key={index} hover>
                    <TableCell>
                      <Chip label={file.riskLevel} color={getRiskColor(file.riskLevel) as 'error' | 'warning' | 'success' | 'default'} size="small" />
                    </TableCell>
                    <TableCell>
                      <Box component="span" sx={{ fontFamily: 'monospace', fontSize: '0.8rem' }}>
                        {file.filePath.length > 70 ? '...' + file.filePath.slice(-70) : file.filePath}
                      </Box>
                    </TableCell>
                    <TableCell align="right">
                      <Chip label={file.piiCount} size="small" color="primary" />
                    </TableCell>
                    <TableCell>
                      {file.stalenessLevel && (
                        <Chip
                          label={file.stalenessLevel}
                          size="small"
                          color={file.stalenessLevel === '+5 ans' ? 'error' : file.stalenessLevel === '3 ans' || file.stalenessLevel === '1 an' ? 'warning' : 'success'}
                        />
                      )}
                    </TableCell>
                    <TableCell>
                      {file.exposureLevel && (
                        <Chip
                          label={file.exposureLevel}
                          size="small"
                          color={file.exposureLevel === 'Critique' ? 'error' : file.exposureLevel === 'Élevé' || file.exposureLevel === 'Moyen' ? 'warning' : 'success'}
                        />
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
      )}

      {/* Detections table */}
      {detections.length > 0 && (
        <Box sx={{ mt: 4 }}>
          <Typography variant="h6" gutterBottom fontWeight={600}>
            Détections ({Math.min(detections.length, 100)} / {detections.length})
          </Typography>
          <TableContainer
            component={Paper}
            sx={{ maxHeight: 500, border: '1px solid', borderColor: 'divider', borderRadius: `${tokens.radii.lg}px` }}
          >
            <Table stickyHeader size="small">
              <TableHead>
                <TableRow>
                  <TableCell><strong>Type PII</strong></TableCell>
                  <TableCell><strong>Valeur détectée</strong></TableCell>
                  <TableCell><strong>Fichier</strong></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {detections.slice(0, 100).map((detection, index) => (
                  <TableRow key={index} hover>
                    <TableCell>
                      <Chip label={detection.piiType} size="small" color="secondary" variant="outlined" />
                    </TableCell>
                    <TableCell>
                      <Box component="span" sx={{ fontFamily: 'monospace', fontSize: '0.875rem' }}>{detection.match}</Box>
                    </TableCell>
                    <TableCell>
                      <Box component="span" sx={{ fontFamily: 'monospace', fontSize: '0.75rem', color: 'text.secondary' }}>
                        {detection.filePath.length > 70 ? '...' + detection.filePath.slice(-70) : detection.filePath}
                      </Box>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
      )}
    </Box>
  );
}
