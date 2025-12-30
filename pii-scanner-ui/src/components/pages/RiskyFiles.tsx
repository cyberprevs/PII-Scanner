import { useState } from 'react';
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
  Select,
  MenuItem,
  FormControl,
  InputLabel,
} from '@mui/material';
import type { ScanResultResponse } from '../../types';

interface RiskyFilesProps {
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

export default function RiskyFiles({ results }: RiskyFilesProps) {
  const [stalenessFilter, setStalenessFilter] = useState<string>('all');
  const [exposureFilter, setExposureFilter] = useState<string>('all');

  if (!results) {
    return (
      <Box>
        <Typography variant="h4" fontWeight={700} gutterBottom>
          📁 Fichiers à risque
        </Typography>
        <Card sx={{ mt: 3 }}>
          <CardContent>
            <Typography variant="body1" color="text.secondary">
              Aucun scan disponible. Lancez un scan depuis la page Scanner pour voir les fichiers à risque.
            </Typography>
          </CardContent>
        </Card>
      </Box>
    );
  }

  const { statistics } = results;

  // Filtrer les fichiers par ancienneté et exposition
  const filteredRiskyFiles = statistics.topRiskyFiles.filter(file => {
    const matchesStaleness = stalenessFilter === 'all' || file.stalenessLevel === stalenessFilter;
    const matchesExposure = exposureFilter === 'all' || file.exposureLevel === exposureFilter;
    return matchesStaleness && matchesExposure;
  });

  return (
    <Box>
      <Typography variant="h4" fontWeight={700} gutterBottom>
        📁 Fichiers à risque (Top 20)
      </Typography>
      <Typography variant="body1" color="text.secondary" paragraph>
        Les {statistics.topRiskyFiles.length} fichiers contenant le plus de données personnelles identifiables
      </Typography>

      {/* Filtres */}
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', mb: 2, gap: 2, flexWrap: 'wrap' }}>
        <FormControl size="small" sx={{ minWidth: 200 }}>
          <InputLabel>Filtrer par ancienneté</InputLabel>
          <Select
            value={stalenessFilter}
            label="Filtrer par ancienneté"
            onChange={(e) => setStalenessFilter(e.target.value)}
          >
            <MenuItem value="all">Tous les fichiers</MenuItem>
            <MenuItem value="Récent">Récent (&lt; 6 mois)</MenuItem>
            <MenuItem value="6 mois">6 mois - 1 an</MenuItem>
            <MenuItem value="1 an">1 an - 3 ans</MenuItem>
            <MenuItem value="3 ans">3 ans - 5 ans</MenuItem>
            <MenuItem value="+5 ans">Plus de 5 ans</MenuItem>
          </Select>
        </FormControl>
        <FormControl size="small" sx={{ minWidth: 200 }}>
          <InputLabel>Filtrer par exposition</InputLabel>
          <Select
            value={exposureFilter}
            label="Filtrer par exposition"
            onChange={(e) => setExposureFilter(e.target.value)}
          >
            <MenuItem value="all">Tous les niveaux</MenuItem>
            <MenuItem value="Critique">🔴 Critique</MenuItem>
            <MenuItem value="Moyen">🟡 Moyen</MenuItem>
            <MenuItem value="Faible">✅ Faible</MenuItem>
          </Select>
        </FormControl>
      </Box>

      {/* Compteur de résultats filtrés */}
      {(stalenessFilter !== 'all' || exposureFilter !== 'all') && (
        <Alert severity="info" sx={{ mb: 2 }}>
          {filteredRiskyFiles.length} fichier(s) correspondent aux filtres sélectionnés
        </Alert>
      )}

      {/* Table */}
      {filteredRiskyFiles.length > 0 ? (
        <TableContainer component={Paper} sx={{ mt: 2, maxHeight: 600 }}>
          <Table stickyHeader>
            <TableHead>
              <TableRow>
                <TableCell><strong>Niveau de risque</strong></TableCell>
                <TableCell><strong>Fichier</strong></TableCell>
                <TableCell align="right"><strong>Nombre de PII</strong></TableCell>
                <TableCell><strong>Ancienneté</strong></TableCell>
                <TableCell><strong>Exposition</strong></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredRiskyFiles.map((file, index) => (
                <>
                  <TableRow key={index} hover>
                    <TableCell>
                      <Chip
                        label={file.riskLevel}
                        color={getRiskColor(file.riskLevel)}
                        size="small"
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
                      {file.stalenessLevel && (
                        <Chip
                          label={file.stalenessLevel}
                          size="small"
                          color={
                            file.stalenessLevel === '+5 ans' ? 'error' :
                            file.stalenessLevel === '3 ans' ? 'warning' :
                            file.stalenessLevel === '1 an' ? 'warning' :
                            'success'
                          }
                        />
                      )}
                    </TableCell>
                    <TableCell>
                      {file.exposureLevel && (
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                          <Chip
                            label={file.exposureLevel}
                            size="small"
                            color={getExposureColor(file.exposureLevel)}
                            variant="filled"
                          />
                          {file.accessibleToEveryone && (
                            <Chip label="Everyone" size="small" color="error" variant="outlined" />
                          )}
                          {file.isNetworkShare && (
                            <Chip label="Réseau" size="small" color="warning" variant="outlined" />
                          )}
                        </Box>
                      )}
                    </TableCell>
                  </TableRow>

                  {/* Alerte ancienneté */}
                  {file.staleDataWarning && (
                    <TableRow key={`${index}-staleness-warning`}>
                      <TableCell colSpan={5} sx={{ py: 0.5, backgroundColor: 'rgba(255, 152, 0, 0.08)' }}>
                        <Alert
                          severity="warning"
                          sx={{ py: 0, '& .MuiAlert-message': { fontSize: '0.875rem' } }}
                        >
                          {file.staleDataWarning}
                        </Alert>
                      </TableCell>
                    </TableRow>
                  )}

                  {/* Alerte exposition */}
                  {file.exposureWarning && (
                    <TableRow key={`${index}-exposure-warning`}>
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
        <Card sx={{ mt: 2 }}>
          <CardContent>
            <Typography variant="body2" color="text.secondary" align="center">
              Aucun fichier ne correspond aux filtres sélectionnés
            </Typography>
          </CardContent>
        </Card>
      )}
    </Box>
  );
}
