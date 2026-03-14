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
import FolderIcon from '@mui/icons-material/Folder';
import FolderOpenIcon from '@mui/icons-material/FolderOpen';
import FilterListIcon from '@mui/icons-material/FilterList';
import SearchIcon from '@mui/icons-material/Search';
import StatCard from '../common/StatCard';
import RestartAltIcon from '@mui/icons-material/RestartAlt';
import type { ScanResultResponse } from '../../types';
import { scanApi } from '../../services/apiClient';
import { useTranslation } from 'react-i18next';

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
  const [riskFilter, setRiskFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const { t } = useTranslation();

  if (!results) {
    return (
      <Container maxWidth="xl" sx={{ py: 4 }}>
        <Box sx={{ mb: 4 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
            <FolderIcon sx={{ fontSize: 40, mr: 2, color: 'primary.main' }} />
            <Typography variant="h4" fontWeight={700}>
              {t('riskyFiles.title')}
            </Typography>
          </Box>
          <Typography variant="body1" color="text.secondary">
            {t('riskyFiles.noScan')}
          </Typography>
        </Box>
        <Card sx={{ mt: 3 }}>
          <CardContent>
            <Typography variant="body1" color="text.secondary">
              {t('riskyFiles.noScan')}
            </Typography>
          </CardContent>
        </Card>
      </Container>
    );
  }

  const { statistics } = results;

  // Filtrer les fichiers par ancienneté, exposition, risque et recherche
  const filteredRiskyFiles = statistics.topRiskyFiles.filter(file => {
    const matchesStaleness = stalenessFilter === 'all' || file.stalenessLevel === stalenessFilter;
    const matchesExposure = exposureFilter === 'all' || file.exposureLevel === exposureFilter;
    const matchesRisk = riskFilter === 'all' || file.riskLevel === riskFilter;
    const matchesSearch = searchQuery === '' || file.filePath.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStaleness && matchesExposure && matchesRisk && matchesSearch;
  });

  // Calculer les statistiques pour les KPI
  const highRiskFiles = statistics.topRiskyFiles.filter(f => f.riskLevel === 'ÉLEVÉ').length;
  const criticalExposureFiles = statistics.topRiskyFiles.filter(f => f.exposureLevel === 'Critique').length;
  const oldFiles = statistics.topRiskyFiles.filter(f => f.stalenessLevel === '+5 ans' || f.stalenessLevel === '3 ans').length;

  const resetFilters = () => {
    setStalenessFilter('all');
    setExposureFilter('all');
    setRiskFilter('all');
    setSearchQuery('');
  };

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
          <FolderIcon sx={{ fontSize: 40, mr: 2, color: 'primary.main' }} />
          <Typography variant="h4" fontWeight={700}>
            {t('riskyFiles.title')}
          </Typography>
        </Box>
        <Typography variant="body1" color="text.secondary">
          {t('riskyFiles.subtitle', { count: statistics.topRiskyFiles.length })}
        </Typography>
      </Box>

      {/* KPI Cards */}
      <Box sx={{ display: 'flex', gap: 3, mb: 4, flexWrap: 'wrap' }}>
        <StatCard value={statistics.topRiskyFiles.length} label={t('riskyFiles.totalFiles')} gradient="linear-gradient(135deg, #00E599 0%, #3B82F6 100%)" />
        <StatCard value={highRiskFiles} label={t('riskyFiles.highRisk')} gradient="linear-gradient(135deg, #F45252 0%, #D93636 100%)" />
        <StatCard value={criticalExposureFiles} label={t('riskyFiles.criticalExposure')} gradient="linear-gradient(135deg, #F0A000 0%, #D48800 100%)" />
        <StatCard value={oldFiles} label={t('riskyFiles.oldFiles')} gradient="linear-gradient(135deg, #A78BFA 0%, #7C3AED 100%)" />
      </Box>

      {/* Filtres */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <FilterListIcon sx={{ mr: 1, color: 'primary.main' }} />
            <Typography variant="h6" fontWeight={600}>
              {t('riskyFiles.filters')}
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
            <TextField
              size="small"
              placeholder={t('riskyFiles.searchPlaceholder')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              sx={{ minWidth: 250 }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon sx={{ color: 'text.secondary' }} />
                  </InputAdornment>
                ),
              }}
            />
            <FormControl size="small" sx={{ minWidth: 180 }}>
              <InputLabel>{t('riskyFiles.riskLevel')}</InputLabel>
              <Select
                value={riskFilter}
                label={t('riskyFiles.riskLevel')}
                onChange={(e) => setRiskFilter(e.target.value)}
              >
                <MenuItem value="all">{t('riskyFiles.allLevels')}</MenuItem>
                <MenuItem value="ÉLEVÉ">🔴 ÉLEVÉ</MenuItem>
                <MenuItem value="MOYEN">🟡 MOYEN</MenuItem>
                <MenuItem value="FAIBLE">🟢 FAIBLE</MenuItem>
              </Select>
            </FormControl>
            <FormControl size="small" sx={{ minWidth: 180 }}>
              <InputLabel>{t('riskyFiles.staleness')}</InputLabel>
              <Select
                value={stalenessFilter}
                label={t('riskyFiles.staleness')}
                onChange={(e) => setStalenessFilter(e.target.value)}
              >
                <MenuItem value="all">{t('riskyFiles.allFiles')}</MenuItem>
                <MenuItem value="Récent">{t('common.recent')}</MenuItem>
                <MenuItem value="6 mois">{t('common.sixMonths')}</MenuItem>
                <MenuItem value="1 an">{t('common.oneYear')}</MenuItem>
                <MenuItem value="3 ans">{t('common.threeYears')}</MenuItem>
                <MenuItem value="+5 ans">{t('common.fiveYears')}</MenuItem>
              </Select>
            </FormControl>
            <FormControl size="small" sx={{ minWidth: 180 }}>
              <InputLabel>{t('riskyFiles.exposure')}</InputLabel>
              <Select
                value={exposureFilter}
                label={t('riskyFiles.exposure')}
                onChange={(e) => setExposureFilter(e.target.value)}
              >
                <MenuItem value="all">{t('riskyFiles.allLevels')}</MenuItem>
                <MenuItem value="Critique">🔴 Critique</MenuItem>
                <MenuItem value="Moyen">🟡 Moyen</MenuItem>
                <MenuItem value="Faible">✅ Faible</MenuItem>
              </Select>
            </FormControl>
            {(stalenessFilter !== 'all' || exposureFilter !== 'all' || riskFilter !== 'all' || searchQuery !== '') && (
              <Button
                variant="outlined"
                size="small"
                startIcon={<RestartAltIcon />}
                onClick={resetFilters}
              >
                {t('riskyFiles.reset')}
              </Button>
            )}
          </Box>

          {/* Compteur de résultats filtrés */}
          {(stalenessFilter !== 'all' || exposureFilter !== 'all' || riskFilter !== 'all' || searchQuery !== '') && (
            <Alert severity="info" sx={{ mt: 2 }}>
              {t('riskyFiles.resultsCount', { count: filteredRiskyFiles.length })}
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
                <TableCell><strong>{t('riskyFiles.colRisk')}</strong></TableCell>
                <TableCell><strong>{t('riskyFiles.colFile')}</strong></TableCell>
                <TableCell align="right"><strong>{t('riskyFiles.colPiiCount')}</strong></TableCell>
                <TableCell><strong>{t('riskyFiles.colStaleness')}</strong></TableCell>
                <TableCell><strong>{t('riskyFiles.colExposure')}</strong></TableCell>
                <TableCell align="center"><strong>{t('riskyFiles.colFolder')}</strong></TableCell>
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
                      <Tooltip title={t('riskyFiles.openFolder')}>
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
              {t('riskyFiles.noResults')}
            </Typography>
          </CardContent>
        </Card>
      )}
    </Container>
  );
}
