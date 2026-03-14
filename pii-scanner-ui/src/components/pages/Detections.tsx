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
  TextField,
  InputAdornment,
} from '@mui/material';
import SecurityIcon from '@mui/icons-material/Security';
import FilterListIcon from '@mui/icons-material/FilterList';
import FolderOpenIcon from '@mui/icons-material/FolderOpen';
import SearchIcon from '@mui/icons-material/Search';
import StatCard from '../common/StatCard';
import RestartAltIcon from '@mui/icons-material/RestartAlt';
import type { ScanResultResponse } from '../../types';
import { scanApi } from '../../services/apiClient';
import { useTranslation } from 'react-i18next';

interface DetectionsProps {
  results: ScanResultResponse | null;
}

export default function Detections({ results }: DetectionsProps) {
  const [stalenessFilter, setStalenessFilter] = useState<string>('all');
  const [piiTypeFilter, setPiiTypeFilter] = useState<string>('all');
  const [riskFilter, setRiskFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const { t } = useTranslation();

  if (!results) {
    return (
      <Container maxWidth="xl" sx={{ py: 4 }}>
        <Box sx={{ mb: 4 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
            <SecurityIcon sx={{ fontSize: 40, mr: 2, color: 'primary.main' }} />
            <Typography variant="h4" fontWeight={700}>
              {t('detections.title')}
            </Typography>
          </Box>
          <Typography variant="body1" color="text.secondary">
            {t('detections.noScan')}
          </Typography>
        </Box>
        <Card sx={{ mt: 3 }}>
          <CardContent>
            <Typography variant="body1" color="text.secondary">
              {t('detections.noScan')}
            </Typography>
          </CardContent>
        </Card>
      </Container>
    );
  }

  const { statistics, detections } = results;

  // Filtrer les détections par ancienneté, type de PII, risque et recherche
  const filteredDetections = detections.filter(detection => {
    // Filtre par ancienneté
    if (stalenessFilter !== 'all') {
      const file = statistics.topRiskyFiles.find(f => f.filePath === detection.filePath);
      if (!file || file.stalenessLevel !== stalenessFilter) return false;
    }

    // Filtre par niveau de risque (via le fichier associé)
    if (riskFilter !== 'all') {
      const file = statistics.topRiskyFiles.find(f => f.filePath === detection.filePath);
      if (!file || file.riskLevel !== riskFilter) return false;
    }

    // Filtre par type de PII
    if (piiTypeFilter !== 'all' && detection.piiType !== piiTypeFilter) return false;

    // Recherche textuelle sur le chemin du fichier ou la valeur détectée
    if (searchQuery !== '') {
      const q = searchQuery.toLowerCase();
      const matchesPath = detection.filePath.toLowerCase().includes(q);
      const matchesValue = detection.match.toLowerCase().includes(q);
      if (!matchesPath && !matchesValue) return false;
    }

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
    setRiskFilter('all');
    setSearchQuery('');
  };

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
          <SecurityIcon sx={{ fontSize: 40, mr: 2, color: 'primary.main' }} />
          <Typography variant="h4" fontWeight={700}>
            {t('detections.title')}
          </Typography>
        </Box>
        <Typography variant="body1" color="text.secondary">
          {t('detections.subtitle', { count: detections.length })}
        </Typography>
      </Box>

      {/* KPI Cards */}
      <Box sx={{ display: 'flex', gap: 3, mb: 4, flexWrap: 'wrap' }}>
        <StatCard value={detections.length} label={t('detections.totalDetections')} gradient="linear-gradient(135deg, #00E599 0%, #3B82F6 100%)" />
        <StatCard value={uniqueTypesCount} label={t('detections.piiTypes')} gradient="linear-gradient(135deg, #A78BFA 0%, #7C3AED 100%)" />
        <StatCard value={uniqueFilesCount} label={t('detections.affectedFiles')} gradient="linear-gradient(135deg, #F0A000 0%, #D48800 100%)" />
      </Box>

      {/* Filtres */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <FilterListIcon sx={{ mr: 1, color: 'primary.main' }} />
            <Typography variant="h6" fontWeight={600}>
              {t('detections.filters')}
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
            <TextField
              size="small"
              placeholder={t('detections.searchPlaceholder')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              sx={{ minWidth: 280 }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon sx={{ color: 'text.secondary' }} />
                  </InputAdornment>
                ),
              }}
            />
            <FormControl size="small" sx={{ minWidth: 180 }}>
              <InputLabel>{t('detections.piiType')}</InputLabel>
              <Select
                value={piiTypeFilter}
                label={t('detections.piiType')}
                onChange={(e) => setPiiTypeFilter(e.target.value)}
              >
                <MenuItem value="all">{t('detections.allTypes')}</MenuItem>
                {uniquePiiTypes.map(type => (
                  <MenuItem key={type} value={type}>{type}</MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControl size="small" sx={{ minWidth: 180 }}>
              <InputLabel>{t('detections.riskLevel')}</InputLabel>
              <Select
                value={riskFilter}
                label={t('detections.riskLevel')}
                onChange={(e) => setRiskFilter(e.target.value)}
              >
                <MenuItem value="all">{t('detections.allLevels')}</MenuItem>
                <MenuItem value="ÉLEVÉ">🔴 ÉLEVÉ</MenuItem>
                <MenuItem value="MOYEN">🟡 MOYEN</MenuItem>
                <MenuItem value="FAIBLE">🟢 FAIBLE</MenuItem>
              </Select>
            </FormControl>
            <FormControl size="small" sx={{ minWidth: 180 }}>
              <InputLabel>{t('detections.staleness')}</InputLabel>
              <Select
                value={stalenessFilter}
                label={t('detections.staleness')}
                onChange={(e) => setStalenessFilter(e.target.value)}
              >
                <MenuItem value="all">{t('detections.allFiles')}</MenuItem>
                <MenuItem value="Récent">{t('common.recent')}</MenuItem>
                <MenuItem value="6 mois">{t('common.sixMonths')}</MenuItem>
                <MenuItem value="1 an">{t('common.oneYear')}</MenuItem>
                <MenuItem value="3 ans">{t('common.threeYears')}</MenuItem>
                <MenuItem value="+5 ans">{t('common.fiveYears')}</MenuItem>
              </Select>
            </FormControl>
            {(stalenessFilter !== 'all' || piiTypeFilter !== 'all' || riskFilter !== 'all' || searchQuery !== '') && (
              <Button
                variant="outlined"
                size="small"
                startIcon={<RestartAltIcon />}
                onClick={resetFilters}
              >
                {t('detections.reset')}
              </Button>
            )}
          </Box>

          {/* Alertes de filtrage */}
          {filteredDetections.length > 500 && (
            <Alert severity="info" sx={{ mt: 2 }}>
              {t('detections.limitAlert', { total: filteredDetections.length })}
              {' '}{t('common.downloadReports')}
            </Alert>
          )}
          {(stalenessFilter !== 'all' || piiTypeFilter !== 'all' || riskFilter !== 'all' || searchQuery !== '') && filteredDetections.length <= 500 && filteredDetections.length > 0 && (
            <Alert severity="info" sx={{ mt: 2 }}>
              {t('detections.resultsCount', { count: filteredDetections.length })}
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
                <TableCell><strong>{t('detections.colType')}</strong></TableCell>
                <TableCell><strong>{t('detections.colValue')}</strong></TableCell>
                <TableCell><strong>{t('detections.colFile')}</strong></TableCell>
                <TableCell align="center"><strong>{t('detections.colFolder')}</strong></TableCell>
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
                    <Tooltip title={t('detections.openFolder')}>
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
              {t('detections.noResults')}
            </Typography>
          </CardContent>
        </Card>
      )}
    </Container>
  );
}
