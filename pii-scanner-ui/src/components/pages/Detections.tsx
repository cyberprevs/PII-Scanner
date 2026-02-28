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
  Container,
  Button,
  IconButton,
  Tooltip,
} from '@mui/material';
import SecurityIcon from '@mui/icons-material/Security';
import FilterListIcon from '@mui/icons-material/FilterList';
import FolderOpenIcon from '@mui/icons-material/FolderOpen';
import StatCard from '../common/StatCard';
import RestartAltIcon from '@mui/icons-material/RestartAlt';
import type { ScanResultResponse } from '../../types';
import { scanApi } from '../../services/apiClient';

interface DetectionsProps {
  results: ScanResultResponse | null;
}

export default function Detections({ results }: DetectionsProps) {
  const [stalenessFilter, setStalenessFilter] = useState<string>('all');
  const [piiTypeFilter, setPiiTypeFilter] = useState<string>('all');

  if (!results) {
    return (
      <Container maxWidth="xl" sx={{ py: 4 }}>
        <Box sx={{ mb: 4 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
            <SecurityIcon sx={{ fontSize: 40, mr: 2, color: 'primary.main' }} />
            <Typography variant="h4" fontWeight={700}>
              Données sensibles
            </Typography>
          </Box>
          <Typography variant="body1" color="text.secondary">
            Liste complète des détections de données personnelles identifiables
          </Typography>
        </Box>
        <Card sx={{ mt: 3 }}>
          <CardContent>
            <Typography variant="body1" color="text.secondary">
              Aucun scan disponible. Lancez un scan depuis la page Scanner pour voir les détections de PII.
            </Typography>
          </CardContent>
        </Card>
      </Container>
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

  // Calculer statistiques pour KPI
  const uniqueFilesCount = new Set(detections.map(d => d.filePath)).size;
  const uniqueTypesCount = uniquePiiTypes.length;

  const resetFilters = () => {
    setStalenessFilter('all');
    setPiiTypeFilter('all');
  };

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
          <SecurityIcon sx={{ fontSize: 40, mr: 2, color: 'primary.main' }} />
          <Typography variant="h4" fontWeight={700}>
            Données sensibles
          </Typography>
        </Box>
        <Typography variant="body1" color="text.secondary">
          {detections.length} détections de PII trouvées au total
        </Typography>
      </Box>

      {/* KPI Cards */}
      <Box sx={{ display: 'flex', gap: 3, mb: 4, flexWrap: 'wrap' }}>
        <StatCard value={detections.length} label="Total détections" gradient="linear-gradient(135deg, #00E599 0%, #3B82F6 100%)" />
        <StatCard value={uniqueTypesCount} label="Types de PII" gradient="linear-gradient(135deg, #A78BFA 0%, #7C3AED 100%)" />
        <StatCard value={uniqueFilesCount} label="Fichiers affectés" gradient="linear-gradient(135deg, #F0A000 0%, #D48800 100%)" />
      </Box>

      {/* Filtres */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <FilterListIcon sx={{ mr: 1, color: 'primary.main' }} />
            <Typography variant="h6" fontWeight={600}>
              Filtres
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
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
            {(stalenessFilter !== 'all' || piiTypeFilter !== 'all') && (
              <Button
                variant="outlined"
                size="small"
                startIcon={<RestartAltIcon />}
                onClick={resetFilters}
              >
                Réinitialiser
              </Button>
            )}
          </Box>

          {/* Alertes de filtrage */}
          {filteredDetections.length > 500 && (
            <Alert severity="info" sx={{ mt: 2 }}>
              Affichage des 500 premières détections sur {filteredDetections.length} au total
              {stalenessFilter !== 'all' && ` (filtrées par ancienneté: ${stalenessFilter})`}
              {piiTypeFilter !== 'all' && ` (filtrées par type: ${piiTypeFilter})`}.
              Téléchargez les rapports pour voir toutes les détections.
            </Alert>
          )}
          {(stalenessFilter !== 'all' || piiTypeFilter !== 'all') && filteredDetections.length <= 500 && filteredDetections.length > 0 && (
            <Alert severity="info" sx={{ mt: 2 }}>
              {filteredDetections.length} détection(s) correspondent aux filtres sélectionnés
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Table */}
      {filteredDetections.length > 0 ? (
        <TableContainer component={Paper} sx={{ maxHeight: 600 }}>
          <Table stickyHeader size="small">
            <TableHead>
              <TableRow>
                <TableCell><strong>Type PII</strong></TableCell>
                <TableCell><strong>Valeur détectée</strong></TableCell>
                <TableCell><strong>Fichier</strong></TableCell>
                <TableCell align="center"><strong>Dossier</strong></TableCell>
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
                  <TableCell align="center">
                    <Tooltip title="Ouvrir le dossier dans l'explorateur">
                      <IconButton
                        size="small"
                        onClick={() => scanApi.openFolder(detection.filePath)}
                        sx={{ color: 'primary.main' }}
                      >
                        <FolderOpenIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      ) : (
        <Card>
          <CardContent>
            <Typography variant="body2" color="text.secondary" align="center">
              Aucune détection ne correspond aux filtres sélectionnés
            </Typography>
          </CardContent>
        </Card>
      )}
    </Container>
  );
}
