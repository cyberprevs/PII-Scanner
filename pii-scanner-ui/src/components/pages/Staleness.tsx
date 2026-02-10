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
  if (!results) {
    return (
      <Box>
        <Typography variant="h4" fontWeight={700} gutterBottom>
          ⏰ Ancienneté des fichiers (Stale Data)
        </Typography>
        <Card sx={{ mt: 3 }}>
          <CardContent>
            <Typography variant="body1" color="text.secondary">
              Aucun scan disponible. Lancez un scan depuis la page Scanner.
            </Typography>
          </CardContent>
        </Card>
      </Box>
    );
  }

  const { statistics } = results;

  // Calculer les statistiques d'ancienneté
  const stalenessData = [
    { level: 'Récent', count: 0, color: '#4caf50', description: '< 6 mois' },
    { level: '6 mois', count: 0, color: '#8bc34a', description: '6 mois - 1 an' },
    { level: '1 an', count: 0, color: '#ff9800', description: '1 an - 3 ans' },
    { level: '3 ans', count: 0, color: '#ff5722', description: '3 ans - 5 ans' },
    { level: '+5 ans', count: 0, color: '#f44336', description: 'Plus de 5 ans' },
  ];

  let totalPiiInStaleFiles = 0;
  const staleFiles = statistics.topRiskyFiles.filter(file => {
    if (file.stalenessLevel) {
      const item = stalenessData.find(d => d.level === file.stalenessLevel);
      if (item) item.count++;

      // Compter les PII dans les fichiers anciens (1 an+)
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
        ⏰ Ancienneté des fichiers (Stale Data)
      </Typography>
      <Typography variant="body1" color="text.secondary" paragraph>
        Analyse des fichiers PII non accédés depuis longtemps - Risque de conservation excessive
      </Typography>

      {/* Statistiques clés */}
      <Box sx={{ display: 'flex', gap: 3, mb: 4, flexWrap: 'wrap' }}>
        <StatCard value={totalStaleFiles} label="Fichiers anciens (6 mois+)" gradient="linear-gradient(135deg, #F0A000 0%, #D48800 100%)" />
        <StatCard value={criticalStaleFiles} label="Fichiers critiques (3 ans+)" gradient="linear-gradient(135deg, #F45252 0%, #D93636 100%)" />
        <StatCard value={totalPiiInStaleFiles} label="PII dans fichiers anciens" gradient="linear-gradient(135deg, #A78BFA 0%, #7C3AED 100%)" />
      </Box>

      {/* Légende */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom fontWeight={600} sx={{ mb: 2 }}>
            📖 Légende de l'ancienneté
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
            Les fichiers de plus de 1 an contenant des PII doivent être examinés pour conformité avec la Loi N°2017-20 du Bénin (APDP - principe de minimisation des données).
          </Alert>
        </CardContent>
      </Card>

      {/* Graphique */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom fontWeight={600}>
            📊 Distribution par ancienneté
          </Typography>
          <ResponsiveContainer width="100%" height={350}>
            <BarChart data={stalenessData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="level" />
              <YAxis />
              <RechartsTooltip />
              <Legend />
              <Bar dataKey="count" name="Nombre de fichiers" radius={[8, 8, 0, 0]}>
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
            📋 Fichiers anciens nécessitant une révision
          </Typography>
          {staleFiles.length > 0 ? (
            <TableContainer component={Paper} sx={{ mt: 2, maxHeight: 600 }}>
              <Table stickyHeader>
                <TableHead>
                  <TableRow>
                    <TableCell><strong>Ancienneté</strong></TableCell>
                    <TableCell><strong>Fichier</strong></TableCell>
                    <TableCell align="right"><strong>Nombre de PII</strong></TableCell>
                    <TableCell><strong>Niveau de risque</strong></TableCell>
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
              Aucun fichier ancien détecté. Tous les fichiers avec PII sont récents (moins de 6 mois).
            </Alert>
          )}
        </CardContent>
      </Card>
    </Box>
  );
}
