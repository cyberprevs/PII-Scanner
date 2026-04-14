import { useState } from 'react';
import {
  Box,
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
  IconButton,
  Tooltip,
  TextField,
  InputAdornment,
  Typography,
} from '@mui/material';
import FolderIcon from '@mui/icons-material/Folder';
import FolderOpenIcon from '@mui/icons-material/FolderOpen';
import FilterListIcon from '@mui/icons-material/FilterList';
import SearchIcon from '@mui/icons-material/Search';
import RestartAltIcon from '@mui/icons-material/RestartAlt';
import StatCard from '../common/StatCard';
import EmptyState from '../common/EmptyState';
import PageHeader from '../common/PageHeader';
import type { ScanResultResponse } from '../../types';
import { scanApi } from '../../services/apiClient';
import { tokens } from '../../theme/designSystem';
import { useTranslation } from 'react-i18next';

interface RiskyFilesProps {
  results: ScanResultResponse | null;
}

const getRiskColor = (riskLevel: string) => {
  switch (riskLevel) {
    case 'ÉLEVÉ': return 'error';
    case 'MOYEN': return 'warning';
    case 'FAIBLE': return 'success';
    default: return 'default';
  }
};

const getExposureColor = (exposureLevel?: string) => {
  switch (exposureLevel) {
    case 'Critique': return 'error';
    case 'Élevé': return 'warning';
    case 'Moyen': return 'warning';
    case 'Faible': return 'success';
    default: return 'default';
  }
};

export default function RiskyFiles({ results }: RiskyFilesProps) {
  const [stalenessFilter, setStalenessFilter] = useState<string>('all');
  const [exposureFilter, setExposureFilter] = useState<string>('all');
  const [riskFilter, setRiskFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const { t } = useTranslation();
  const c = tokens.colors;

  const isFiltered = stalenessFilter !== 'all' || exposureFilter !== 'all' || riskFilter !== 'all' || searchQuery !== '';

  const resetFilters = () => {
    setStalenessFilter('all');
    setExposureFilter('all');
    setRiskFilter('all');
    setSearchQuery('');
  };

  if (!results) {
    return (
      <Container maxWidth="xl" sx={{ py: 4 }}>
        <PageHeader icon={<FolderIcon />} title={t('riskyFiles.title')} subtitle={t('riskyFiles.noScan')} />
        <EmptyState icon={<FolderIcon />} title={t('riskyFiles.title')} description={t('riskyFiles.noScan')} />
      </Container>
    );
  }

  const { statistics } = results;

  const filteredRiskyFiles = statistics.topRiskyFiles.filter(file => {
    const matchesStaleness = stalenessFilter === 'all' || file.stalenessLevel === stalenessFilter;
    const matchesExposure = exposureFilter === 'all' || file.exposureLevel === exposureFilter;
    const matchesRisk = riskFilter === 'all' || file.riskLevel === riskFilter;
    const matchesSearch = searchQuery === '' || file.filePath.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStaleness && matchesExposure && matchesRisk && matchesSearch;
  });

  const highRiskFiles = statistics.topRiskyFiles.filter(f => f.riskLevel === 'ÉLEVÉ').length;
  const criticalExposureFiles = statistics.topRiskyFiles.filter(f => f.exposureLevel === 'Critique').length;
  const oldFiles = statistics.topRiskyFiles.filter(f => f.stalenessLevel === '+5 ans' || f.stalenessLevel === '3 ans').length;

  const activeFilterCount = [stalenessFilter !== 'all', exposureFilter !== 'all', riskFilter !== 'all', searchQuery !== ''].filter(Boolean).length;

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <PageHeader
        icon={<FolderIcon />}
        title={t('riskyFiles.title')}
        subtitle={t('riskyFiles.subtitle', { count: statistics.topRiskyFiles.length })}
        breadcrumb="Analyse / Fichiers à risque"
      />

      {/* KPI Cards */}
      <Box sx={{ display: 'flex', gap: 3, mb: 4, flexWrap: 'wrap' }}>
        <StatCard topBorderOnly accentColor={c.accentPrimary} value={statistics.topRiskyFiles.length} label={t('riskyFiles.totalFiles')} />
        <StatCard topBorderOnly accentColor={c.danger} value={highRiskFiles} label={t('riskyFiles.highRisk')} />
        <StatCard topBorderOnly accentColor={c.warning} value={criticalExposureFiles} label={t('riskyFiles.criticalExposure')} />
        <StatCard topBorderOnly accentColor="#A78BFA" value={oldFiles} label={t('riskyFiles.oldFiles')} />
      </Box>

      {/* Filter bar */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2, gap: 1 }}>
            <FilterListIcon sx={{ color: 'primary.main', fontSize: 20 }} />
            <Typography variant="h6" fontWeight={600} sx={{ flex: 1 }}>
              {t('riskyFiles.filters')}
            </Typography>
            {activeFilterCount > 0 && (
              <Chip label={activeFilterCount} size="small" color="primary" sx={{ fontWeight: 700 }} />
            )}
            {isFiltered && (
              <Tooltip title={t('riskyFiles.reset')}>
                <IconButton size="small" onClick={resetFilters} sx={{ color: 'text.secondary' }}>
                  <RestartAltIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            )}
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
            <FormControl size="small" sx={{ minWidth: 160 }}>
              <InputLabel>{t('riskyFiles.riskLevel')}</InputLabel>
              <Select value={riskFilter} label={t('riskyFiles.riskLevel')} onChange={(e) => setRiskFilter(e.target.value)}>
                <MenuItem value="all">{t('riskyFiles.allLevels')}</MenuItem>
                <MenuItem value="ÉLEVÉ">🔴 ÉLEVÉ</MenuItem>
                <MenuItem value="MOYEN">🟡 MOYEN</MenuItem>
                <MenuItem value="FAIBLE">🟢 FAIBLE</MenuItem>
              </Select>
            </FormControl>
            <FormControl size="small" sx={{ minWidth: 160 }}>
              <InputLabel>{t('riskyFiles.staleness')}</InputLabel>
              <Select value={stalenessFilter} label={t('riskyFiles.staleness')} onChange={(e) => setStalenessFilter(e.target.value)}>
                <MenuItem value="all">{t('riskyFiles.allFiles')}</MenuItem>
                <MenuItem value="Récent">{t('common.recent')}</MenuItem>
                <MenuItem value="6 mois">{t('common.sixMonths')}</MenuItem>
                <MenuItem value="1 an">{t('common.oneYear')}</MenuItem>
                <MenuItem value="3 ans">{t('common.threeYears')}</MenuItem>
                <MenuItem value="+5 ans">{t('common.fiveYears')}</MenuItem>
              </Select>
            </FormControl>
            <FormControl size="small" sx={{ minWidth: 160 }}>
              <InputLabel>{t('riskyFiles.exposure')}</InputLabel>
              <Select value={exposureFilter} label={t('riskyFiles.exposure')} onChange={(e) => setExposureFilter(e.target.value)}>
                <MenuItem value="all">{t('riskyFiles.allLevels')}</MenuItem>
                <MenuItem value="Critique">🔴 Critique</MenuItem>
                <MenuItem value="Moyen">🟡 Moyen</MenuItem>
                <MenuItem value="Faible">✅ Faible</MenuItem>
              </Select>
            </FormControl>
          </Box>
          {isFiltered && (
            <Alert severity="info" sx={{ mt: 2 }}>
              {t('riskyFiles.resultsCount', { count: filteredRiskyFiles.length })}
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Table */}
      {filteredRiskyFiles.length > 0 ? (
        <TableContainer
          component={Paper}
          sx={{ maxHeight: 600, border: '1px solid', borderColor: 'divider', borderRadius: `${tokens.radii.lg}px` }}
        >
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
                      <Chip label={file.riskLevel} color={getRiskColor(file.riskLevel) as 'error' | 'warning' | 'success' | 'default'} size="small" />
                    </TableCell>
                    <TableCell>
                      <Box component="span" sx={{ fontFamily: 'monospace', fontSize: '0.85rem' }}>
                        {file.filePath.length > 80 ? '...' + file.filePath.slice(-80) : file.filePath}
                      </Box>
                    </TableCell>
                    <TableCell align="right">
                      <Chip label={file.piiCount} color="primary" size="small" />
                    </TableCell>
                    <TableCell>
                      {file.stalenessLevel && (
                        <Chip
                          label={file.stalenessLevel}
                          size="small"
                          color={file.stalenessLevel === '+5 ans' ? 'error' : file.stalenessLevel === '3 ans' || file.stalenessLevel === '1 an' ? 'warning' : 'success'}
                        />
                      )}
                    </TableCell>
                    <TableCell>
                      {file.exposureLevel && (
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                          <Chip label={file.exposureLevel} size="small" color={getExposureColor(file.exposureLevel) as 'error' | 'warning' | 'success' | 'default'} variant="filled" />
                          {file.accessibleToEveryone && <Chip label="Everyone" size="small" color="error" variant="outlined" />}
                          {file.isNetworkShare && <Chip label="Réseau" size="small" color="warning" variant="outlined" />}
                        </Box>
                      )}
                    </TableCell>
                    <TableCell align="center">
                      <Tooltip title={t('riskyFiles.openFolder')}>
                        <IconButton
                          size="small"
                          onClick={() => scanApi.openFolder(file.filePath)}
                          sx={{ color: 'primary.main', '&:hover': { bgcolor: c.accentPrimaryMuted } }}
                        >
                          <FolderOpenIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                  {file.staleDataWarning && (
                    <TableRow key={`${index}-staleness-warning`}>
                      <TableCell colSpan={6} sx={{ py: 0.5, bgcolor: 'rgba(255, 152, 0, 0.08)' }}>
                        <Alert severity="warning" sx={{ py: 0, '& .MuiAlert-message': { fontSize: '0.875rem' } }}>
                          {file.staleDataWarning}
                        </Alert>
                      </TableCell>
                    </TableRow>
                  )}
                  {file.exposureWarning && (
                    <TableRow key={`${index}-exposure-warning`}>
                      <TableCell colSpan={6} sx={{ py: 0.5, bgcolor: 'rgba(244, 67, 54, 0.08)' }}>
                        <Alert severity={file.exposureLevel === 'Critique' ? 'error' : 'warning'} sx={{ py: 0, '& .MuiAlert-message': { fontSize: '0.875rem' } }}>
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
        <EmptyState icon={<FolderIcon />} title={t('riskyFiles.noResults')} description={t('riskyFiles.noResultsSubtitle', { defaultValue: '' })} />
      )}
    </Container>
  );
}
