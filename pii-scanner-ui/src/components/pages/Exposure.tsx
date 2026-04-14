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
  Cell,
} from 'recharts';
import LockOpenIcon from '@mui/icons-material/LockOpen';
import type { ScanResultResponse } from '../../types';
import StatCard from '../common/StatCard';
import EmptyState from '../common/EmptyState';
import PageHeader from '../common/PageHeader';
import { glassCardSx, getRechartsTooltipStyle, tokens } from '../../theme/designSystem';
import { useTranslation } from 'react-i18next';

interface ExposureProps {
  results: ScanResultResponse | null;
}

const getRiskColor = (riskLevel: string) => {
  switch (riskLevel) {
    case 'ÉLEVÉ': return 'error';
    case 'MOYEN': return 'warning';
    case 'FAIBLE': return 'success';
    default: return 'default';
  }
};

const getExposureColor = (exposureLevel?: string) => {
  switch (exposureLevel) {
    case 'Critique': return 'error';
    case 'Élevé': return 'warning';
    case 'Moyen': return 'warning';
    case 'Faible': return 'success';
    default: return 'default';
  }
};

export default function Exposure({ results }: ExposureProps) {
  const { t } = useTranslation();
  const theme = useTheme();
  const dark = theme.palette.mode === 'dark';
  const c = tokens.colors;
  const axisStyle = { fontSize: 12, fill: dark ? c.textTertiary : c.light.textTertiary };

  if (!results) {
    return (
      <Box>
        <PageHeader icon={<LockOpenIcon />} title={t('exposure.title')} subtitle={t('exposure.subtitle')} />
        <EmptyState title={t('exposure.noScan')} description={t('exposure.noScanSubtitle', { defaultValue: '' })} />
      </Box>
    );
  }

  const { statistics } = results;

  const exposureData = [
    { level: 'Faible', count: 0, color: '#4caf50', description: 'Moins de 5 groupes' },
    { level: 'Moyen', count: 0, color: '#ff9800', description: '5-10 groupes' },
    { level: 'Élevé', count: 0, color: '#ff5722', description: '10+ groupes ou Authenticated Users' },
    { level: 'Critique', count: 0, color: '#f44336', description: 'Everyone ou partage réseau public' },
  ];

  let totalPiiInExposedFiles = 0;
  let filesOnNetworkShare = 0;

  const exposedFiles = statistics.topRiskyFiles.filter(file => {
    if (file.exposureLevel) {
      const item = exposureData.find(d => d.level === file.exposureLevel);
      if (item) item.count++;
      if (['Moyen', 'Élevé', 'Critique'].includes(file.exposureLevel)) totalPiiInExposedFiles += file.piiCount;
      if (file.isNetworkShare) filesOnNetworkShare++;
    }
    return file.exposureLevel && file.exposureLevel !== 'Faible';
  });

  const totalExposedFiles = exposedFiles.length;
  const criticalExposedFiles = exposedFiles.filter(f => f.exposureLevel === 'Critique').length;

  return (
    <Box>
      <PageHeader icon={<LockOpenIcon />} title={t('exposure.title')} subtitle={t('exposure.subtitle')} />

      {/* KPI Cards */}
      <Box sx={{ display: 'flex', gap: 3, mb: 4, flexWrap: 'wrap' }}>
        <StatCard topBorderOnly accentColor={c.warning} value={totalExposedFiles} label={t('exposure.overExposed')} />
        <StatCard topBorderOnly accentColor={c.danger} value={criticalExposedFiles} label={t('exposure.critical')} />
        <StatCard topBorderOnly accentColor="#A78BFA" value={totalPiiInExposedFiles} label={t('exposure.piiInExposed')} />
        <StatCard topBorderOnly accentColor={c.info} value={filesOnNetworkShare} label={t('exposure.networkShare')} />
      </Box>

      {/* Legend — compact horizontal chips */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Stack direction="row" alignItems="center" flexWrap="wrap" sx={{ gap: 1, mb: 1.5 }}>
            {exposureData.map(item => (
              <Chip
                key={item.level}
                label={`${item.level} — ${item.description}`}
                size="small"
                color={getExposureColor(item.level) as 'error' | 'warning' | 'success' | 'default'}
                sx={{ fontWeight: 500 }}
              />
            ))}
          </Stack>
          <Alert severity="error" sx={{ mt: 0 }}>
            {t('exposure.criticalWarning')}
          </Alert>
        </CardContent>
      </Card>

      {/* Chart */}
      <Card sx={{ mb: 3, ...glassCardSx(dark) }}>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={exposureData}>
              <CartesianGrid horizontal={true} vertical={false} stroke={dark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.04)'} />
              <XAxis dataKey="level" tick={axisStyle} axisLine={false} tickLine={false} />
              <YAxis tick={axisStyle} axisLine={false} tickLine={false} />
              <RechartsTooltip contentStyle={getRechartsTooltipStyle(dark)} />
              <Bar dataKey="count" name={t('exposure.fileCount')} radius={[6, 6, 0, 0]}>
                {exposureData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Table */}
      <Card>
        <CardContent>
          {exposedFiles.length > 0 ? (
            <TableContainer
              component={Paper}
              sx={{ mt: 2, maxHeight: 600, border: '1px solid', borderColor: 'divider', borderRadius: `${tokens.radii.lg}px` }}
            >
              <Table stickyHeader>
                <TableHead>
                  <TableRow>
                    <TableCell><strong>{t('exposure.colExposure')}</strong></TableCell>
                    <TableCell><strong>{t('exposure.colFile')}</strong></TableCell>
                    <TableCell align="right"><strong>{t('exposure.colPiiCount')}</strong></TableCell>
                    <TableCell><strong>{t('exposure.colRisk')}</strong></TableCell>
                    <TableCell><strong>{t('exposure.colIndicators')}</strong></TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {exposedFiles.map((file, index) => (
                    <>
                      <TableRow key={index} hover>
                        <TableCell>
                          <Chip label={file.exposureLevel} size="small" color={getExposureColor(file.exposureLevel) as 'error' | 'warning' | 'success' | 'default'} />
                        </TableCell>
                        <TableCell>
                          <Box component="span" sx={{ fontFamily: 'monospace', fontSize: '0.85rem' }}>
                            {file.filePath.length > 80 ? '...' + file.filePath.slice(-80) : file.filePath}
                          </Box>
                        </TableCell>
                        <TableCell align="right">
                          <Chip label={file.piiCount} color="primary" size="small" />
                        </TableCell>
                        <TableCell>
                          <Chip label={file.riskLevel} color={getRiskColor(file.riskLevel) as 'error' | 'warning' | 'success' | 'default'} size="small" />
                        </TableCell>
                        <TableCell>
                          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                            {file.accessibleToEveryone && <Chip label="Everyone" size="small" color="error" variant="outlined" />}
                            {file.isNetworkShare && <Chip label="Réseau" size="small" color="warning" variant="outlined" />}
                          </Box>
                        </TableCell>
                      </TableRow>
                      {file.exposureWarning && (
                        <TableRow key={`${index}-warning`}>
                          <TableCell colSpan={5} sx={{ py: 0.5, bgcolor: 'rgba(244, 67, 54, 0.08)' }}>
                            <Alert severity={file.exposureLevel === 'Critique' ? 'error' : 'warning'} sx={{ py: 0, '& .MuiAlert-message': { fontSize: '0.875rem' } }}>
                              {file.exposureWarning}
                            </Alert>
                          </TableCell>
                        </TableRow>
                      )}
                    </>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          ) : (
            <Alert severity="success" sx={{ mt: 2 }}>{t('exposure.noExposed')}</Alert>
          )}
        </CardContent>
      </Card>
    </Box>
  );
}
