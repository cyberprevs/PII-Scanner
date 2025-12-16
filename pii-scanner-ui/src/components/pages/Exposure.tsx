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
  if (!results) {
    return (
      <Box>
        <Typography variant="h4" fontWeight={700} gutterBottom>
          🔓 Exposition des fichiers (Over-Exposed Data)
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

  // Calculer les statistiques d'exposition
  const exposureData = [
    { level: 'Faible', count: 0, color: '#4caf50', description: 'Moins de 5 groupes' },
    { level: 'Moyen', count: 0, color: '#ff9800', description: '5-10 groupes' },
    { level: 'Élevé', count: 0, color: '#ff5722', description: '10+ groupes ou Authenticated Users' },
    { level: 'Critique', count: 0, color: '#f44336', description: 'Everyone ou partage réseau public' },
  ];

  let totalPiiInExposedFiles = 0;
  let filesWithEveryone = 0;
  let filesOnNetworkShare = 0;

  const exposedFiles = statistics.topRiskyFiles.filter(file => {
    if (file.exposureLevel) {
      const item = exposureData.find(d => d.level === file.exposureLevel);
      if (item) item.count++;

      // Compter les PII dans les fichiers exposés (Moyen+)
      if (['Moyen', 'Élevé', 'Critique'].includes(file.exposureLevel)) {
        totalPiiInExposedFiles += file.piiCount;
      }

      if (file.accessibleToEveryone) filesWithEveryone++;
      if (file.isNetworkShare) filesOnNetworkShare++;
    }
    return file.exposureLevel && file.exposureLevel !== 'Faible';
  });

  const totalExposedFiles = exposedFiles.length;
  const criticalExposedFiles = exposedFiles.filter(f => f.exposureLevel === 'Critique').length;

  return (
    <Box>
      <Typography variant="h4" fontWeight={700} gutterBottom>
        🔓 Exposition des fichiers (Over-Exposed Data)
      </Typography>
      <Typography variant="body1" color="text.secondary" paragraph>
        Analyse des permissions Windows et détection des fichiers sur-exposés - Risque d'accès non autorisé
      </Typography>

      {/* Statistiques clés */}
      <Box sx={{ display: 'flex', gap: 3, mb: 4, flexWrap: 'wrap' }}>
        <Box sx={{ flex: '1 1 200px' }}>
          <Card sx={{ background: 'linear-gradient(135deg, #ff9800 0%, #ff5722 100%)' }}>
            <CardContent>
              <Typography variant="h3" fontWeight={700} color="white">
                {totalExposedFiles}
              </Typography>
              <Typography variant="body2" color="rgba(255,255,255,0.9)">
                Fichiers sur-exposés (Moyen+)
              </Typography>
            </CardContent>
          </Card>
        </Box>
        <Box sx={{ flex: '1 1 200px' }}>
          <Card sx={{ background: 'linear-gradient(135deg, #f44336 0%, #e91e63 100%)' }}>
            <CardContent>
              <Typography variant="h3" fontWeight={700} color="white">
                {criticalExposedFiles}
              </Typography>
              <Typography variant="body2" color="rgba(255,255,255,0.9)">
                Fichiers critiques (Everyone)
              </Typography>
            </CardContent>
          </Card>
        </Box>
        <Box sx={{ flex: '1 1 200px' }}>
          <Card sx={{ background: 'linear-gradient(135deg, #9c27b0 0%, #673ab7 100%)' }}>
            <CardContent>
              <Typography variant="h3" fontWeight={700} color="white">
                {totalPiiInExposedFiles}
              </Typography>
              <Typography variant="body2" color="rgba(255,255,255,0.9)">
                PII dans fichiers exposés
              </Typography>
            </CardContent>
          </Card>
        </Box>
        <Box sx={{ flex: '1 1 200px' }}>
          <Card sx={{ background: 'linear-gradient(135deg, #00bcd4 0%, #3f51b5 100%)' }}>
            <CardContent>
              <Typography variant="h3" fontWeight={700} color="white">
                {filesOnNetworkShare}
              </Typography>
              <Typography variant="body2" color="rgba(255,255,255,0.9)">
                Fichiers sur partage réseau
              </Typography>
            </CardContent>
          </Card>
        </Box>
      </Box>

      {/* Légende */}
      <Card sx={{ mb: 3, backgroundColor: '#f5f5f5' }}>
        <CardContent>
          <Typography variant="h6" gutterBottom fontWeight={600} sx={{ mb: 2 }}>
            📖 Légende de l'exposition
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
            Les fichiers accessibles à "Everyone" représentent un risque critique de violation de données.
            Révisez immédiatement les permissions de ces fichiers.
          </Alert>
        </CardContent>
      </Card>

      {/* Graphique */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom fontWeight={600}>
            📊 Distribution par niveau d'exposition
          </Typography>
          <ResponsiveContainer width="100%" height={350}>
            <BarChart data={exposureData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="level" />
              <YAxis />
              <RechartsTooltip />
              <Legend />
              <Bar dataKey="count" name="Nombre de fichiers" radius={[8, 8, 0, 0]}>
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
            📋 Fichiers sur-exposés nécessitant une action
          </Typography>
          {exposedFiles.length > 0 ? (
            <TableContainer component={Paper} sx={{ mt: 2, maxHeight: 600 }}>
              <Table stickyHeader>
                <TableHead>
                  <TableRow>
                    <TableCell><strong>Exposition</strong></TableCell>
                    <TableCell><strong>Fichier</strong></TableCell>
                    <TableCell align="right"><strong>Nombre de PII</strong></TableCell>
                    <TableCell><strong>Niveau de risque</strong></TableCell>
                    <TableCell><strong>Indicateurs</strong></TableCell>
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
              Aucun fichier sur-exposé détecté. Tous les fichiers avec PII ont des permissions appropriées (Faible).
            </Alert>
          )}
        </CardContent>
      </Card>
    </Box>
  );
}
