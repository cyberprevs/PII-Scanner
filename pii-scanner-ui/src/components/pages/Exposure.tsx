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

interface ExposureProps {
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

const getExposureColor = (exposureLevel?: string) => {
  switch (exposureLevel) {
    case 'Critique':
      return 'error';
    case 'Élevé':
      return 'warning';
    case 'Moyen':
      return 'warning';
    case 'Faible':
      return 'success';
    default:
      return 'default';
  }
};

export default function Exposure({ results }: ExposureProps) {
  const { t } = useTranslation();

  if (!results) {
    return (
      <Box>
        <Typography variant="h4" fontWeight={700} gutterBottom>
          {t('exposure.title')}
        </Typography>
        <Card sx={{ mt: 3 }}>
          <CardContent>
            <Typography variant="body1" color="text.secondary">
              {t('exposure.noScan')}
            </Typography>
          </CardContent>
        </Card>
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

      if (['Moyen', 'Élevé', 'Critique'].includes(file.exposureLevel)) {
        totalPiiInExposedFiles += file.piiCount;
      }

      if (file.isNetworkShare) filesOnNetworkShare++;
    }
    return file.exposureLevel && file.exposureLevel !== 'Faible';
  });

  const totalExposedFiles = exposedFiles.length;
  const criticalExposedFiles = exposedFiles.filter(f => f.exposureLevel === 'Critique').length;

  return (
    <Box>
      <Typography variant="h4" fontWeight={700} gutterBottom>
        {t('exposure.title')}
      </Typography>
      <Typography variant="body1" color="text.secondary" paragraph>
        {t('exposure.subtitle')}
      </Typography>

      {/* Statistiques clés */}
      <Box sx={{ display: 'flex', gap: 3, mb: 4, flexWrap: 'wrap' }}>
        <StatCard value={totalExposedFiles} label={t('exposure.overExposed')} gradient="linear-gradient(135deg, #F0A000 0%, #D48800 100%)" />
        <StatCard value={criticalExposedFiles} label={t('exposure.critical')} gradient="linear-gradient(135deg, #F45252 0%, #D93636 100%)" />
        <StatCard value={totalPiiInExposedFiles} label={t('exposure.piiInExposed')} gradient="linear-gradient(135deg, #A78BFA 0%, #7C3AED 100%)" />
        <StatCard value={filesOnNetworkShare} label={t('exposure.networkShare')} gradient="linear-gradient(135deg, #3B82F6 0%, #2563EB 100%)" />
      </Box>

      {/* Légende */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom fontWeight={600} sx={{ mb: 2 }}>
            {t('exposure.legend')}
          </Typography>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
            {exposureData.map(item => (
              <Box key={item.level} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Chip label={item.level} size="small" color={getExposureColor(item.level)} />
                <Typography variant="body2">{item.description}</Typography>
              </Box>
            ))}
          </Box>
          <Alert severity="error" sx={{ mt: 2 }}>
            {t('exposure.criticalWarning')}
          </Alert>
        </CardContent>
      </Card>

      {/* Graphique */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom fontWeight={600}>
            {t('exposure.distribution')}
          </Typography>
          <ResponsiveContainer width="100%" height={350}>
            <BarChart data={exposureData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="level" />
              <YAxis />
              <RechartsTooltip />
              <Legend />
              <Bar dataKey="count" name={t('exposure.fileCount')} radius={[8, 8, 0, 0]}>
                {exposureData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Table des fichiers exposés */}
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom fontWeight={600}>
            {t('exposure.tableTitle')}
          </Typography>
          {exposedFiles.length > 0 ? (
            <TableContainer component={Paper} sx={{ mt: 2, maxHeight: 600 }}>
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
                          <Chip
                            label={file.exposureLevel}
                            size="small"
                            color={getExposureColor(file.exposureLevel)}
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
                        <TableCell>
                          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                            {file.accessibleToEveryone && (
                              <Chip label="Everyone" size="small" color="error" variant="outlined" />
                            )}
                            {file.isNetworkShare && (
                              <Chip label="Réseau" size="small" color="warning" variant="outlined" />
                            )}
                          </Box>
                        </TableCell>
                      </TableRow>
                      {file.exposureWarning && (
                        <TableRow key={`${index}-warning`}>
                          <TableCell colSpan={5} sx={{ py: 0.5, backgroundColor: 'rgba(244, 67, 54, 0.08)' }}>
                            <Alert
                              severity={file.exposureLevel === 'Critique' ? 'error' : 'warning'}
                              sx={{ py: 0, '& .MuiAlert-message': { fontSize: '0.875rem' } }}
                            >
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
            <Alert severity="success" sx={{ mt: 2 }}>
              {t('exposure.noExposed')}
            </Alert>
          )}
        </CardContent>
      </Card>
    </Box>
  );
}
