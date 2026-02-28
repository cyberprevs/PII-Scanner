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
import FolderIcon from '@mui/icons-material/Folder';
import FolderOpenIcon from '@mui/icons-material/FolderOpen';
import FilterListIcon from '@mui/icons-material/FilterList';
import StatCard from '../common/StatCard';
import RestartAltIcon from '@mui/icons-material/RestartAlt';
import type { ScanResultResponse } from '../../types';
import { scanApi } from '../../services/apiClient';

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
      <Container maxWidth="xl" sx={{ py: 4 }}>
        <Box sx={{ mb: 4 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
            <FolderIcon sx={{ fontSize: 40, mr: 2, color: 'primary.main' }} />
            <Typography variant="h4" fontWeight={700}>
              Fichiers à risque
            </Typography>
          </Box>
          <Typography variant="body1" color="text.secondary">
            Liste des fichiers contenant le plus de données personnelles identifiables
          </Typography>
        </Box>
        <Card sx={{ mt: 3 }}>
          <CardContent>
            <Typography variant="body1" color="text.secondary">
              Aucun scan disponible. Lancez un scan depuis la page Scanner pour voir les fichiers à risque.
            </Typography>
          </CardContent>
        </Card>
      </Container>
    );
  }

  const { statistics } = results;

  // Filtrer les fichiers par ancienneté et exposition
  const filteredRiskyFiles = statistics.topRiskyFiles.filter(file => {
    const matchesStaleness = stalenessFilter === 'all' || file.stalenessLevel === stalenessFilter;
    const matchesExposure = exposureFilter === 'all' || file.exposureLevel === exposureFilter;
    return matchesStaleness && matchesExposure;
  });

  // Calculer les statistiques pour les KPI
  const highRiskFiles = statistics.topRiskyFiles.filter(f => f.riskLevel === 'ÉLEVÉ').length;
  const criticalExposureFiles = statistics.topRiskyFiles.filter(f => f.exposureLevel === 'Critique').length;
  const oldFiles = statistics.topRiskyFiles.filter(f => f.stalenessLevel === '+5 ans' || f.stalenessLevel === '3 ans').length;

  const resetFilters = () => {
    setStalenessFilter('all');
    setExposureFilter('all');
  };

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
          <FolderIcon sx={{ fontSize: 40, mr: 2, color: 'primary.main' }} />
          <Typography variant="h4" fontWeight={700}>
            Fichiers à risque (Top 20)
          </Typography>
        </Box>
        <Typography variant="body1" color="text.secondary">
          Les {statistics.topRiskyFiles.length} fichiers contenant le plus de données personnelles identifiables
        </Typography>
      </Box>

      {/* KPI Cards */}
      <Box sx={{ display: 'flex', gap: 3, mb: 4, flexWrap: 'wrap' }}>
        <StatCard value={statistics.topRiskyFiles.length} label="Total fichiers" gradient="linear-gradient(135deg, #00E599 0%, #3B82F6 100%)" />
        <StatCard value={highRiskFiles} label="Risque élevé" gradient="linear-gradient(135deg, #F45252 0%, #D93636 100%)" />
        <StatCard value={criticalExposureFiles} label="Exposition critique" gradient="linear-gradient(135deg, #F0A000 0%, #D48800 100%)" />
        <StatCard value={oldFiles} label="Fichiers obsolètes" gradient="linear-gradient(135deg, #A78BFA 0%, #7C3AED 100%)" />
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
            {(stalenessFilter !== 'all' || exposureFilter !== 'all') && (
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

          {/* Compteur de résultats filtrés */}
          {(stalenessFilter !== 'all' || exposureFilter !== 'all') && (
            <Alert severity="info" sx={{ mt: 2 }}>
              {filteredRiskyFiles.length} fichier(s) correspondent aux filtres sélectionnés
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Table */}
      {filteredRiskyFiles.length > 0 ? (
        <TableContainer component={Paper} sx={{ maxHeight: 600 }}>
          <Table stickyHeader>
            <TableHead>
              <TableRow>
                <TableCell><strong>Niveau de risque</strong></TableCell>
                <TableCell><strong>Fichier</strong></TableCell>
                <TableCell align="right"><strong>Nombre de PII</strong></TableCell>
                <TableCell><strong>Ancienneté</strong></TableCell>
                <TableCell><strong>Exposition</strong></TableCell>
                <TableCell align="center"><strong>Dossier</strong></TableCell>
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
                    <TableCell align="center">
                      <Tooltip title="Ouvrir le dossier dans l'explorateur">
                        <IconButton
                          size="small"
                          onClick={() => scanApi.openFolder(file.filePath)}
                          sx={{ color: 'primary.main' }}
                        >
                          <FolderOpenIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>

                  {/* Alerte ancienneté */}
                  {file.staleDataWarning && (
                    <TableRow key={`${index}-staleness-warning`}>
                      <TableCell colSpan={6} sx={{ py: 0.5, backgroundColor: 'rgba(255, 152, 0, 0.08)' }}>
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
                      <TableCell colSpan={6} sx={{ py: 0.5, backgroundColor: 'rgba(244, 67, 54, 0.08)' }}>
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
        <Card>
          <CardContent>
            <Typography variant="body2" color="text.secondary" align="center">
              Aucun fichier ne correspond aux filtres sélectionnés
            </Typography>
          </CardContent>
        </Card>
      )}
    </Container>
  );
}
