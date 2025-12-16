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

interface DetectionsProps {
  results: ScanResultResponse | null;
}

export default function Detections({ results }: DetectionsProps) {
  const [stalenessFilter, setStalenessFilter] = useState<string>('all');
  const [piiTypeFilter, setPiiTypeFilter] = useState<string>('all');

  if (!results) {
    return (
      <Box>
        <Typography variant="h4" fontWeight={700} gutterBottom>
          🔐 Données sensibles
        </Typography>
        <Card sx={{ mt: 3 }}>
          <CardContent>
            <Typography variant="body1" color="text.secondary">
              Aucun scan disponible. Lancez un scan depuis la page Scanner pour voir les détections de PII.
            </Typography>
          </CardContent>
        </Card>
      </Box>
    );
  }

  const { statistics, detections } = results;

  // Filtrer les détections par ancienneté et type de PII
  const filteredDetections = detections.filter(detection => {
    // Filtre par ancienneté
    if (stalenessFilter !== 'all') {
      const file = statistics.topRiskyFiles.find(f => f.filePath === detection.filePath);
      if (!file || file.stalenessLevel !== stalenessFilter) return false;
    }

    // Filtre par type de PII
    if (piiTypeFilter !== 'all' && detection.piiType !== piiTypeFilter) return false;

    return true;
  });

  // Limiter les détections affichées pour les performances
  const displayedDetections = filteredDetections.slice(0, 500);

  // Obtenir la liste unique des types de PII pour le filtre
  const uniquePiiTypes = Array.from(new Set(detections.map(d => d.piiType))).sort();

  return (
    <Box>
      <Typography variant="h4" fontWeight={700} gutterBottom>
        🔐 Données sensibles
      </Typography>
      <Typography variant="body1" color="text.secondary" paragraph>
        {detections.length} détections de PII trouvées au total
      </Typography>

      {/* Filtres */}
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', mb: 2, gap: 2, flexWrap: 'wrap' }}>
        <FormControl size="small" sx={{ minWidth: 200 }}>
          <InputLabel>Filtrer par type de PII</InputLabel>
          <Select
            value={piiTypeFilter}
            label="Filtrer par type de PII"
            onChange={(e) => setPiiTypeFilter(e.target.value)}
          >
            <MenuItem value="all">Tous les types</MenuItem>
            {uniquePiiTypes.map(type => (
              <MenuItem key={type} value={type}>{type}</MenuItem>
            ))}
          </Select>
        </FormControl>
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
      </Box>

      {/* Alertes de filtrage */}
      {filteredDetections.length > 500 && (
        <Alert severity="info" sx={{ mb: 2 }}>
          Affichage des 500 premières détections sur {filteredDetections.length} au total
          {stalenessFilter !== 'all' && ` (filtrées par ancienneté: ${stalenessFilter})`}
          {piiTypeFilter !== 'all' && ` (filtrées par type: ${piiTypeFilter})`}.
          Téléchargez les rapports pour voir toutes les détections.
        </Alert>
      )}
      {(stalenessFilter !== 'all' || piiTypeFilter !== 'all') && filteredDetections.length <= 500 && filteredDetections.length > 0 && (
        <Alert severity="info" sx={{ mb: 2 }}>
          {filteredDetections.length} détection(s) correspondent aux filtres sélectionnés
        </Alert>
      )}

      {/* Table */}
      {filteredDetections.length > 0 ? (
        <TableContainer component={Paper} sx={{ mt: 2, maxHeight: 600 }}>
          <Table stickyHeader size="small">
            <TableHead>
              <TableRow>
                <TableCell><strong>Type PII</strong></TableCell>
                <TableCell><strong>Valeur détectée</strong></TableCell>
                <TableCell><strong>Fichier</strong></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {displayedDetections.map((detection, index) => (
                <TableRow key={index} hover>
                  <TableCell>
                    <Chip label={detection.piiType} size="small" color="secondary" variant="outlined" />
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" fontFamily="monospace">
                      {detection.match}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" fontSize="0.75rem" color="text.secondary" fontFamily="monospace">
                      {detection.filePath.length > 60
                        ? '...' + detection.filePath.slice(-60)
                        : detection.filePath}
                    </Typography>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      ) : (
        <Card sx={{ mt: 2 }}>
          <CardContent>
            <Typography variant="body2" color="text.secondary" align="center">
              Aucune détection ne correspond aux filtres sélectionnés
            </Typography>
          </CardContent>
        </Card>
      )}
    </Box>
  );
}
