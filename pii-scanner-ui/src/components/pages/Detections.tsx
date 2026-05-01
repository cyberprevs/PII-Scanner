import { useState, useRef } from 'react';
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
import SecurityIcon from '@mui/icons-material/Security';
import FilterListIcon from '@mui/icons-material/FilterList';
import FolderOpenIcon from '@mui/icons-material/FolderOpen';
import SearchIcon from '@mui/icons-material/Search';
import RestartAltIcon from '@mui/icons-material/RestartAlt';
import StatCard from '../common/StatCard';
import EmptyState from '../common/EmptyState';
import PageHeader from '../common/PageHeader';
import type { ScanResultResponse } from '../../types';
import { scanApi } from '../../services/apiClient';
import { tokens } from '../../theme/designSystem';
import { useTranslation } from 'react-i18next';
import { useVirtualizer } from '@tanstack/react-virtual';

interface DetectionsProps {
  results: ScanResultResponse | null;
}

const ROW_HEIGHT = 45;

export default function Detections({ results }: DetectionsProps) {
  const [stalenessFilter, setStalenessFilter] = useState<string>('all');
  const [piiTypeFilter, setPiiTypeFilter] = useState<string>('all');
  const [riskFilter, setRiskFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const { t } = useTranslation();
  const c = tokens.colors;
  const tableContainerRef = useRef<HTMLDivElement>(null);

  const isFiltered = stalenessFilter !== 'all' || piiTypeFilter !== 'all' || riskFilter !== 'all' || searchQuery !== '';

  const resetFilters = () => {
    setStalenessFilter('all');
    setPiiTypeFilter('all');
    setRiskFilter('all');
    setSearchQuery('');
  };

  if (!results) {
    return (
      <Container maxWidth="xl" sx={{ py: 4 }}>
        <PageHeader icon={<SecurityIcon />} title={t('detections.title')} subtitle={t('detections.noScan')} />
        <EmptyState icon={<SecurityIcon />} title={t('detections.title')} description={t('detections.noScan')} />
      </Container>
    );
  }

  const { statistics, detections } = results;

  const filteredDetections = detections.filter(detection => {
    if (stalenessFilter !== 'all') {
      const file = statistics.topRiskyFiles.find(f => f.filePath === detection.filePath);
      if (!file || file.stalenessLevel !== stalenessFilter) return false;
    }
    if (riskFilter !== 'all') {
      const file = statistics.topRiskyFiles.find(f => f.filePath === detection.filePath);
      if (!file || file.riskLevel !== riskFilter) return false;
    }
    if (piiTypeFilter !== 'all' && detection.piiType !== piiTypeFilter) return false;
    if (searchQuery !== '') {
      const q = searchQuery.toLowerCase();
      if (!detection.filePath.toLowerCase().includes(q) && !detection.match.toLowerCase().includes(q)) return false;
    }
    return true;
  });

  const uniquePiiTypes = Array.from(new Set(detections.map(d => d.piiType))).sort();
  const uniqueFilesCount = new Set(detections.map(d => d.filePath)).size;
  const uniqueTypesCount = uniquePiiTypes.length;

  const activeFilterCount = [stalenessFilter !== 'all', piiTypeFilter !== 'all', riskFilter !== 'all', searchQuery !== ''].filter(Boolean).length;

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <PageHeader
        icon={<SecurityIcon />}
        title={t('detections.title')}
        subtitle={t('detections.subtitle', { count: detections.length })}
        breadcrumb="Analyse / Détections"
      />

      {/* KPI Cards */}
      <Box sx={{ display: 'flex', gap: 3, mb: 4, flexWrap: 'wrap' }}>
        <StatCard topBorderOnly accentColor={c.accentPrimary} value={detections.length} label={t('detections.totalDetections')} />
        <StatCard topBorderOnly accentColor="#A78BFA" value={uniqueTypesCount} label={t('detections.piiTypes')} />
        <StatCard topBorderOnly accentColor={c.warning} value={uniqueFilesCount} label={t('detections.affectedFiles')} />
      </Box>

      {/* Filter bar */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2, gap: 1 }}>
            <FilterListIcon sx={{ color: 'primary.main', fontSize: 20 }} />
            <Typography variant="h6" fontWeight={600} sx={{ flex: 1 }}>
              {t('detections.filters')}
            </Typography>
            {activeFilterCount > 0 && (
              <Chip label={activeFilterCount} size="small" color="primary" sx={{ fontWeight: 700 }} />
            )}
            {isFiltered && (
              <Tooltip title={t('detections.reset')}>
                <IconButton size="small" onClick={resetFilters} sx={{ color: 'text.secondary' }}>
                  <RestartAltIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            )}
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
            <FormControl size="small" sx={{ minWidth: 160 }}>
              <InputLabel>{t('detections.piiType')}</InputLabel>
              <Select value={piiTypeFilter} label={t('detections.piiType')} onChange={(e) => setPiiTypeFilter(e.target.value)}>
                <MenuItem value="all">{t('detections.allTypes')}</MenuItem>
                {uniquePiiTypes.map(type => (
                  <MenuItem key={type} value={type}>{type}</MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControl size="small" sx={{ minWidth: 160 }}>
              <InputLabel>{t('detections.riskLevel')}</InputLabel>
              <Select value={riskFilter} label={t('detections.riskLevel')} onChange={(e) => setRiskFilter(e.target.value)}>
                <MenuItem value="all">{t('detections.allLevels')}</MenuItem>
                <MenuItem value="ÉLEVÉ">🔴 ÉLEVÉ</MenuItem>
                <MenuItem value="MOYEN">🟡 MOYEN</MenuItem>
                <MenuItem value="FAIBLE">🟢 FAIBLE</MenuItem>
              </Select>
            </FormControl>
            <FormControl size="small" sx={{ minWidth: 160 }}>
              <InputLabel>{t('detections.staleness')}</InputLabel>
              <Select value={stalenessFilter} label={t('detections.staleness')} onChange={(e) => setStalenessFilter(e.target.value)}>
                <MenuItem value="all">{t('detections.allFiles')}</MenuItem>
                <MenuItem value="Récent">{t('common.recent')}</MenuItem>
                <MenuItem value="6 mois">{t('common.sixMonths')}</MenuItem>
                <MenuItem value="1 an">{t('common.oneYear')}</MenuItem>
                <MenuItem value="3 ans">{t('common.threeYears')}</MenuItem>
                <MenuItem value="+5 ans">{t('common.fiveYears')}</MenuItem>
              </Select>
            </FormControl>
          </Box>
          {isFiltered && (
            <Alert severity="info" sx={{ mt: 2 }}>
              {t('detections.resultsCount', { count: filteredDetections.length })}
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Virtualized table */}
      {filteredDetections.length > 0 ? (
        <VirtualizedDetectionsTable
          detections={filteredDetections}
          tableContainerRef={tableContainerRef}
          t={t}
          c={c}
        />
      ) : (
        <EmptyState icon={<SecurityIcon />} title={t('detections.noResults')} description={t('detections.noResultsSubtitle', { defaultValue: '' })} />
      )}
    </Container>
  );
}

interface Detection {
  filePath: string;
  piiType: string;
  match: string;
}

interface VirtualizedTableProps {
  detections: Detection[];
  tableContainerRef: React.RefObject<HTMLDivElement | null>;
  t: (key: string, opts?: Record<string, unknown>) => string;
  c: { accentPrimaryMuted: string };
}

function VirtualizedDetectionsTable({ detections, tableContainerRef, t, c }: VirtualizedTableProps) {
  const rowVirtualizer = useVirtualizer({
    count: detections.length,
    getScrollElement: () => tableContainerRef.current,
    estimateSize: () => ROW_HEIGHT,
    overscan: 10,
  });

  const totalHeight = rowVirtualizer.getTotalSize();
  const virtualItems = rowVirtualizer.getVirtualItems();
  const paddingTop = virtualItems.length > 0 ? virtualItems[0].start : 0;
  const paddingBottom = virtualItems.length > 0 ? totalHeight - virtualItems[virtualItems.length - 1].end : 0;

  return (
    <TableContainer
      ref={tableContainerRef}
      component={Paper}
      sx={{ maxHeight: 600, border: '1px solid', borderColor: 'divider', borderRadius: `${tokens.radii.lg}px`, overflow: 'auto' }}
    >
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
          {paddingTop > 0 && (
            <TableRow>
              <TableCell colSpan={4} sx={{ height: paddingTop, p: 0, border: 0 }} />
            </TableRow>
          )}
          {virtualItems.map(virtualRow => {
            const detection = detections[virtualRow.index];
            return (
              <TableRow key={virtualRow.key} hover sx={{ height: ROW_HEIGHT }}>
                <TableCell>
                  <Chip label={detection.piiType} size="small" color="secondary" variant="outlined" />
                </TableCell>
                <TableCell>
                  <Box component="span" sx={{ fontFamily: 'monospace', fontSize: '0.875rem' }}>
                    {detection.match}
                  </Box>
                </TableCell>
                <TableCell>
                  <Box component="span" sx={{ fontSize: '0.75rem', color: 'text.secondary', fontFamily: 'monospace' }}>
                    {detection.filePath.length > 60 ? '...' + detection.filePath.slice(-60) : detection.filePath}
                  </Box>
                </TableCell>
                <TableCell align="center">
                  <Tooltip title={t('detections.openFolder')}>
                    <IconButton
                      size="small"
                      onClick={() => scanApi.openFolder(detection.filePath)}
                      sx={{ color: 'primary.main', '&:hover': { bgcolor: c.accentPrimaryMuted } }}
                    >
                      <FolderOpenIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </TableCell>
              </TableRow>
            );
          })}
          {paddingBottom > 0 && (
            <TableRow>
              <TableCell colSpan={4} sx={{ height: paddingBottom, p: 0, border: 0 }} />
            </TableRow>
          )}
        </TableBody>
      </Table>
    </TableContainer>
  );
}
