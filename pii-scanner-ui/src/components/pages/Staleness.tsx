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
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import type { ScanResultResponse } from '../../types';
import StatCard from '../common/StatCard';
import EmptyState from '../common/EmptyState';
import PageHeader from '../common/PageHeader';
import { glassCardSx, getRechartsTooltipStyle, tokens } from '../../theme/designSystem';
import { useTranslation } from 'react-i18next';

interface StalenessProps {
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

export default function Staleness({ results }: StalenessProps) {
  const { t } = useTranslation();
  const theme = useTheme();
  const dark = theme.palette.mode === 'dark';
  const c = tokens.colors;
  const axisStyle = { fontSize: 12, fill: dark ? c.textTertiary : c.light.textTertiary };

  if (!results) {
    return (
      <Box>
        <PageHeader icon={<AccessTimeIcon />} title={t('staleness.title')} subtitle={t('staleness.subtitle')} />
        <EmptyState title={t('staleness.noScan')} description={t('staleness.noScanSubtitle', { defaultValue: '' })} />
      </Box>
    );
  }

  const { statistics } = results;

  const stalenessMeta = [
    { level: 'Récent', color: '#4caf50', description: t('common.recent') },
    { level: '6 mois', color: '#8bc34a', description: t('common.sixMonths') },
    { level: '1 an', color: '#ff9800', description: t('common.oneYear') },
    { level: '3 ans', color: '#ff5722', description: t('common.threeYears') },
    { level: '+5 ans', color: '#f44336', description: t('common.fiveYears') },
  ];

  const staleFiles = statistics.topRiskyFiles.filter(
    file => file.stalenessLevel && file.stalenessLevel !== 'Récent'
  );

  const stalenessData = stalenessMeta.map(meta => ({
    ...meta,
    count: statistics.topRiskyFiles.filter(f => f.stalenessLevel === meta.level).length,
  }));

  const totalStaleFiles = staleFiles.length;
  const criticalStaleFiles = staleFiles.filter(f => ['3 ans', '+5 ans'].includes(f.stalenessLevel || '')).length;
  const totalPiiInStaleFiles = staleFiles
    .filter(f => f.stalenessLevel && ['1 an', '3 ans', '+5 ans'].includes(f.stalenessLevel))
    .reduce((sum, f) => sum + f.piiCount, 0);

  return (
    <Box>
      <PageHeader icon={<AccessTimeIcon />} title={t('staleness.title')} subtitle={t('staleness.subtitle')} />

      {/* KPI Cards */}
      <Box sx={{ display: 'flex', gap: 3, mb: 4, flexWrap: 'wrap' }}>
        <StatCard topBorderOnly accentColor={c.warning} value={totalStaleFiles} label={t('staleness.oldFiles')} />
        <StatCard topBorderOnly accentColor={c.danger} value={criticalStaleFiles} label={t('staleness.criticalFiles')} />
        <StatCard topBorderOnly accentColor="#A78BFA" value={totalPiiInStaleFiles} label={t('staleness.piiInOldFiles')} />
      </Box>

      {/* Legend — compact horizontal chips */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Stack direction="row" alignItems="center" flexWrap="wrap" sx={{ gap: 1, mb: 1.5 }}>
            {stalenessData.map(item => (
              <Chip key={item.level} label={`${item.level} — ${item.description}`} size="small" sx={{ backgroundColor: item.color, color: 'white', fontWeight: 500 }} />
            ))}
          </Stack>
          <Alert severity="warning" sx={{ mt: 0 }}>
            {t('staleness.legalWarning')}
          </Alert>
        </CardContent>
      </Card>

      {/* Chart */}
      <Card sx={{ mb: 3, ...glassCardSx(dark) }}>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={stalenessData}>
              <CartesianGrid horizontal={true} vertical={false} stroke={dark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.04)'} />
              <XAxis dataKey="level" tick={axisStyle} axisLine={false} tickLine={false} />
              <YAxis tick={axisStyle} axisLine={false} tickLine={false} />
              <RechartsTooltip contentStyle={getRechartsTooltipStyle(dark)} />
              <Bar dataKey="count" name={t('staleness.fileCount')} radius={[6, 6, 0, 0]}>
                {stalenessData.map((entry, index) => (
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
          {staleFiles.length > 0 ? (
            <TableContainer
              component={Paper}
              sx={{ mt: 2, maxHeight: 600, border: '1px solid', borderColor: 'divider', borderRadius: `${tokens.radii.lg}px` }}
            >
              <Table stickyHeader>
                <TableHead>
                  <TableRow>
                    <TableCell><strong>{t('staleness.colStaleness')}</strong></TableCell>
                    <TableCell><strong>{t('staleness.colFile')}</strong></TableCell>
                    <TableCell align="right"><strong>{t('staleness.colPiiCount')}</strong></TableCell>
                    <TableCell><strong>{t('staleness.colRisk')}</strong></TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {staleFiles.map((file, index) => (
                    <>
                      <TableRow key={index} hover>
                        <TableCell>
                          <Chip
                            label={file.stalenessLevel}
                            size="small"
                            sx={{ backgroundColor: stalenessData.find(d => d.level === file.stalenessLevel)?.color, color: 'white' }}
                          />
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
                      </TableRow>
                      {file.staleDataWarning && (
                        <TableRow key={`${index}-warning`}>
                          <TableCell colSpan={4} sx={{ py: 0.5, bgcolor: 'rgba(255, 152, 0, 0.08)' }}>
                            <Alert severity="warning" sx={{ py: 0, '& .MuiAlert-message': { fontSize: '0.875rem' } }}>
                              {file.staleDataWarning}
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
            <Alert severity="success" sx={{ mt: 2 }}>{t('staleness.noOldFiles')}</Alert>
          )}
        </CardContent>
      </Card>
    </Box>
  );
}
