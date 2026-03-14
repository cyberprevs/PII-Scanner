import {
  Box,
  Typography,
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
} from '@mui/material';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  Legend,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import type { ScanResultResponse } from '../../types';
import StatCard from '../common/StatCard';
import { useTranslation } from 'react-i18next';

interface StalenessProps {
  results: ScanResultResponse | null;
}

const getRiskColor = (riskLevel: string) => {
  switch (riskLevel) {
    case 'ÉLEVÉ':
      return 'error';
    case 'MOYEN':
      return 'warning';
    case 'FAIBLE':
      return 'success';
    default:
      return 'default';
  }
};

export default function Staleness({ results }: StalenessProps) {
  const { t } = useTranslation();

  if (!results) {
    return (
      <Box>
        <Typography variant="h4" fontWeight={700} gutterBottom>
          {t('staleness.title')}
        </Typography>
        <Card sx={{ mt: 3 }}>
          <CardContent>
            <Typography variant="body1" color="text.secondary">
              {t('staleness.noScan')}
            </Typography>
          </CardContent>
        </Card>
      </Box>
    );
  }

  const { statistics } = results;

  const stalenessData = [
    { level: 'Récent', count: 0, color: '#4caf50', description: t('common.recent') },
    { level: '6 mois', count: 0, color: '#8bc34a', description: t('common.sixMonths') },
    { level: '1 an', count: 0, color: '#ff9800', description: t('common.oneYear') },
    { level: '3 ans', count: 0, color: '#ff5722', description: t('common.threeYears') },
    { level: '+5 ans', count: 0, color: '#f44336', description: t('common.fiveYears') },
  ];

  let totalPiiInStaleFiles = 0;
  const staleFiles = statistics.topRiskyFiles.filter(file => {
    if (file.stalenessLevel) {
      const item = stalenessData.find(d => d.level === file.stalenessLevel);
      if (item) item.count++;

      if (['1 an', '3 ans', '+5 ans'].includes(file.stalenessLevel)) {
        totalPiiInStaleFiles += file.piiCount;
      }
    }
    return file.stalenessLevel && file.stalenessLevel !== 'Récent';
  });

  const totalStaleFiles = staleFiles.length;
  const criticalStaleFiles = staleFiles.filter(f => ['3 ans', '+5 ans'].includes(f.stalenessLevel || '')).length;

  return (
    <Box>
      <Typography variant="h4" fontWeight={700} gutterBottom>
        {t('staleness.title')}
      </Typography>
      <Typography variant="body1" color="text.secondary" paragraph>
        {t('staleness.subtitle')}
      </Typography>

      {/* Statistiques clés */}
      <Box sx={{ display: 'flex', gap: 3, mb: 4, flexWrap: 'wrap' }}>
        <StatCard value={totalStaleFiles} label={t('staleness.oldFiles')} gradient="linear-gradient(135deg, #F0A000 0%, #D48800 100%)" />
        <StatCard value={criticalStaleFiles} label={t('staleness.criticalFiles')} gradient="linear-gradient(135deg, #F45252 0%, #D93636 100%)" />
        <StatCard value={totalPiiInStaleFiles} label={t('staleness.piiInOldFiles')} gradient="linear-gradient(135deg, #A78BFA 0%, #7C3AED 100%)" />
      </Box>

      {/* Légende */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom fontWeight={600} sx={{ mb: 2 }}>
            {t('staleness.legend')}
          </Typography>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
            {stalenessData.map(item => (
              <Box key={item.level} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Chip label={item.level} size="small" sx={{ backgroundColor: item.color, color: 'white' }} />
                <Typography variant="body2">{item.description}</Typography>
              </Box>
            ))}
          </Box>
          <Alert severity="warning" sx={{ mt: 2 }}>
            {t('staleness.legalWarning')}
          </Alert>
        </CardContent>
      </Card>

      {/* Graphique */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom fontWeight={600}>
            {t('staleness.distribution')}
          </Typography>
          <ResponsiveContainer width="100%" height={350}>
            <BarChart data={stalenessData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="level" />
              <YAxis />
              <RechartsTooltip />
              <Legend />
              <Bar dataKey="count" name={t('staleness.fileCount')} radius={[8, 8, 0, 0]}>
                {stalenessData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Table des fichiers anciens */}
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom fontWeight={600}>
            {t('staleness.tableTitle')}
          </Typography>
          {staleFiles.length > 0 ? (
            <TableContainer component={Paper} sx={{ mt: 2, maxHeight: 600 }}>
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
                            sx={{
                              backgroundColor: stalenessData.find(d => d.level === file.stalenessLevel)?.color,
                              color: 'white'
                            }}
                          />
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" fontFamily="monospace">
                            {file.filePath.length > 80
                              ? '...' + file.filePath.slice(-80)
                              : file.filePath}
                          </Typography>
                        </TableCell>
                        <TableCell align="right">
                          <Chip label={file.piiCount} color="primary" size="small" />
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={file.riskLevel}
                            color={getRiskColor(file.riskLevel)}
                            size="small"
                          />
                        </TableCell>
                      </TableRow>
                      {file.staleDataWarning && (
                        <TableRow key={`${index}-warning`}>
                          <TableCell colSpan={4} sx={{ py: 0.5, backgroundColor: 'rgba(255, 152, 0, 0.08)' }}>
                            <Alert
                              severity="warning"
                              sx={{ py: 0, '& .MuiAlert-message': { fontSize: '0.875rem' } }}
                            >
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
            <Alert severity="success" sx={{ mt: 2 }}>
              {t('staleness.noOldFiles')}
            </Alert>
          )}
        </CardContent>
      </Card>
    </Box>
  );
}
