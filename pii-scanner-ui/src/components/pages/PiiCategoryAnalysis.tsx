import React, { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  FormControl,
  Select,
  MenuItem,
  Alert,
  Button,
  ButtonGroup,
  Container,
  Stack,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import CategoryIcon from '@mui/icons-material/Category';
import SecurityIcon from '@mui/icons-material/Security';
import BarChartIcon from '@mui/icons-material/BarChart';
import FilterListIcon from '@mui/icons-material/FilterList';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import { ScanResultResponse } from '../../types';
import StatCard from '../common/StatCard';
import EmptyState from '../common/EmptyState';
import PageHeader from '../common/PageHeader';
import { glassCardSx, getRechartsTooltipStyle, tokens } from '../../theme/designSystem';

interface Props {
  results: ScanResultResponse | null;
  onDownloadReport: (format: 'csv' | 'json' | 'html' | 'excel') => void;
}

const PII_CATEGORIES = {
  Bancaire: {
    types: ['IBAN', 'CarteBancaire'],
    icon: '🏦',
    severity: 'Critique',
    color: '#f44336',
  },
  Identité: {
    types: ['IFU', 'CNI_Benin', 'Passeport_Benin', 'RCCM', 'ActeNaissance'],
    icon: '🆔',
    severity: 'Élevé',
    color: '#ff9800',
  },
  Santé: {
    types: ['CNSS', 'RAMU'],
    icon: '🏥',
    severity: 'Élevé',
    color: '#ff9800',
  },
  Contact: {
    types: ['Email', 'Telephone'],
    icon: '📞',
    severity: 'Moyen',
    color: '#ffc107',
  },
  Éducation: {
    types: ['INE', 'Matricule_Fonctionnaire'],
    icon: '🎓',
    severity: 'Élevé',
    color: '#ff9800',
  },
  Transport: {
    types: ['Plaque_Immatriculation'],
    icon: '🚗',
    severity: 'Faible',
    color: '#4caf50',
  },
  Universelle: {
    types: ['DateNaissance'],
    icon: '📅',
    severity: 'Moyen',
    color: '#ffc107',
  },
};

const SEVERITY_COLORS = {
  Critique: '#f44336',
  Élevé: '#ff9800',
  Moyen: '#ffc107',
  Faible: '#4caf50',
};

const PiiCategoryAnalysis: React.FC<Props> = ({ results, onDownloadReport }) => {
  const { t } = useTranslation();
  const theme = useTheme();
  const dark = theme.palette.mode === 'dark';
  const c = tokens.colors;

  const [selectedCategory, setSelectedCategory] = useState<string>('Toutes');
  const [selectedSeverity, setSelectedSeverity] = useState<string>('Toutes');
  const [selectedPiiType, setSelectedPiiType] = useState<string>('Tous');

  const exportToCSV = () => {
    if (groupedFiles.length === 0) { alert(t('categoryAnalysis.noData')); return; }
    onDownloadReport('csv');
  };

  const exportToExcel = () => {
    if (groupedFiles.length === 0) { alert(t('categoryAnalysis.noData')); return; }
    onDownloadReport('excel');
  };

  const categoryStats = useMemo(() => {
    if (!results?.statistics?.piiByType) return [];
    const stats = Object.entries(PII_CATEGORIES).map(([categoryName, categoryData]) => {
      const detectionCount = categoryData.types.reduce((sum, type) => sum + (results.statistics.piiByType[type] || 0), 0);
      const filesWithCategory = results.detections.filter((d) => categoryData.types.includes(d.piiType)).map((d) => d.filePath).filter((value, index, self) => self.indexOf(value) === index).length;
      return { category: categoryName, detections: detectionCount, files: filesWithCategory, icon: categoryData.icon, severity: categoryData.severity, color: categoryData.color, types: categoryData.types };
    });
    return stats.filter((s) => s.detections > 0).sort((a, b) => b.detections - a.detections);
  }, [results]);

  const severityStats = useMemo(() => {
    if (!results?.detections) return [];
    const stats = { Critique: 0, Élevé: 0, Moyen: 0, Faible: 0 };
    results.detections.forEach((detection) => {
      const category = Object.values(PII_CATEGORIES).find((cat) => cat.types.includes(detection.piiType));
      if (category) stats[category.severity as keyof typeof stats]++;
    });
    return Object.entries(stats).map(([severity, count]) => ({ severity, count, color: SEVERITY_COLORS[severity as keyof typeof SEVERITY_COLORS] })).filter((s) => s.count > 0);
  }, [results]);

  const availablePiiTypes = useMemo(() => {
    if (!results?.statistics?.piiByType) return [];
    return Object.keys(results.statistics.piiByType).filter((type) => results.statistics.piiByType[type] > 0);
  }, [results]);

  const { filteredFiles, groupedFiles } = useMemo(() => {
    if (!results?.detections) return { filteredFiles: [], groupedFiles: [] };
    let filtered = results.detections;
    if (selectedCategory !== 'Toutes') {
      const categoryTypes = PII_CATEGORIES[selectedCategory as keyof typeof PII_CATEGORIES].types;
      filtered = filtered.filter((d) => categoryTypes.includes(d.piiType));
    }
    if (selectedSeverity !== 'Toutes') {
      filtered = filtered.filter((d) => {
        const category = Object.values(PII_CATEGORIES).find((cat) => cat.types.includes(d.piiType));
        return category?.severity === selectedSeverity;
      });
    }
    if (selectedPiiType !== 'Tous') filtered = filtered.filter((d) => d.piiType === selectedPiiType);

    const grouped = new Map<string, { piiTypes: Set<string>; count: number }>();
    filtered.forEach((detection) => {
      if (!grouped.has(detection.filePath)) grouped.set(detection.filePath, { piiTypes: new Set(), count: 0 });
      const fileData = grouped.get(detection.filePath)!;
      fileData.piiTypes.add(detection.piiType);
      fileData.count++;
    });
    const files = Array.from(grouped.entries())
      .map(([filePath, data]) => ({ filePath, piiTypes: Array.from(data.piiTypes), detectionCount: data.count }))
      .sort((a, b) => b.detectionCount - a.detectionCount)
      .slice(0, 100);
    return { filteredFiles: filtered, groupedFiles: files };
  }, [results, selectedCategory, selectedSeverity, selectedPiiType]);

  const axisStyle = { fontSize: 12, fill: dark ? c.textTertiary : c.light.textTertiary };

  if (!results) {
    return (
      <Container maxWidth="xl" sx={{ py: 4 }}>
        <PageHeader icon={<CategoryIcon />} title={t('categoryAnalysis.title')} subtitle={t('categoryAnalysis.subtitle')} />
        <EmptyState
          icon={<CategoryIcon />}
          title={t('categoryAnalysis.noScan')}
          description={t('categoryAnalysis.noScanSubtitle')}
        />
      </Container>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <PageHeader
        icon={<CategoryIcon />}
        title={t('categoryAnalysis.title')}
        subtitle={t('categoryAnalysis.subtitle')}
        breadcrumb="Analyse / Catégories PII"
        actions={
          groupedFiles.length > 0 ? (
            <ButtonGroup variant="outlined" size="small">
              <Button startIcon={<FileDownloadIcon />} onClick={exportToCSV}>
                {t('categoryAnalysis.exportCsv')}
              </Button>
              <Button startIcon={<FileDownloadIcon />} onClick={exportToExcel}>
                {t('categoryAnalysis.exportExcel')}
              </Button>
            </ButtonGroup>
          ) : undefined
        }
      />

      {/* KPI Cards */}
      <Box sx={{ display: 'flex', gap: 3, mb: 4, flexWrap: 'wrap' }}>
        <StatCard topBorderOnly accentColor={c.danger} value={severityStats.find((s) => s.severity === 'Critique')?.count || 0} label={t('categoryAnalysis.criticalDetections')} />
        <StatCard topBorderOnly accentColor={c.warning} value={severityStats.find((s) => s.severity === 'Élevé')?.count || 0} label={t('categoryAnalysis.highDetections')} />
        <StatCard topBorderOnly accentColor={c.warning} value={severityStats.find((s) => s.severity === 'Moyen')?.count || 0} label={t('categoryAnalysis.mediumDetections')} />
        <StatCard topBorderOnly accentColor={c.accentPrimary} value={severityStats.find((s) => s.severity === 'Faible')?.count || 0} label={t('categoryAnalysis.lowDetections')} />
      </Box>

      {/* Charts */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {/* Bar Chart by category */}
        <Grid size={{ xs: 12, lg: 6 }}>
          <Card sx={{ height: '100%', ...glassCardSx(dark) }}>
            <CardContent sx={{ p: 4 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                <BarChartIcon sx={{ mr: 1.5, fontSize: 24, color: 'primary.main' }} />
                <Typography variant="h6" fontWeight={600}>
                  {t('categoryAnalysis.byCategory')}
                </Typography>
              </Box>
              <Box sx={{ width: '100%', height: 360 }}>
                <ResponsiveContainer width="100%" height="100%" minWidth={0}>
                  <BarChart data={categoryStats} layout="vertical" margin={{ top: 8, right: 24, bottom: 8, left: 110 }}>
                    <defs>
                      <linearGradient id="barGrad1" x1="0" y1="0" x2="1" y2="0">
                        <stop offset="0%" stopColor="#00E599" stopOpacity={0.9} />
                        <stop offset="100%" stopColor="#00B876" stopOpacity={0.7} />
                      </linearGradient>
                      <linearGradient id="barGrad2" x1="0" y1="0" x2="1" y2="0">
                        <stop offset="0%" stopColor="#3B82F6" stopOpacity={0.9} />
                        <stop offset="100%" stopColor="#2563EB" stopOpacity={0.7} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid horizontal={false} vertical={true} stroke={dark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.04)'} />
                    <XAxis type="number" tick={axisStyle} axisLine={false} tickLine={false} />
                    <YAxis type="category" dataKey="category" tick={{ ...axisStyle, fontSize: 13 }} width={100} axisLine={false} tickLine={false} />
                    <Tooltip contentStyle={getRechartsTooltipStyle(dark)} />
                    <Bar dataKey="detections" fill="url(#barGrad1)" name={t('categoryAnalysis.colDetections')} radius={[0, 6, 6, 0]} barSize={28} />
                    <Bar dataKey="files" fill="url(#barGrad2)" name={t('categoryAnalysis.colFiles')} radius={[0, 6, 6, 0]} barSize={28} />
                  </BarChart>
                </ResponsiveContainer>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Donut by severity */}
        <Grid size={{ xs: 12, lg: 6 }}>
          <Card sx={{ height: '100%', ...glassCardSx(dark) }}>
            <CardContent sx={{ p: 4 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                <SecurityIcon sx={{ mr: 1.5, fontSize: 24, color: 'secondary.main' }} />
                <Typography variant="h6" fontWeight={600}>
                  {t('categoryAnalysis.bySeverity')}
                </Typography>
              </Box>
              <ResponsiveContainer width="100%" height={280} minWidth={0}>
                <PieChart>
                  <Pie
                    data={severityStats}
                    cx="50%"
                    cy="50%"
                    outerRadius={110}
                    innerRadius={60}
                    dataKey="count"
                    paddingAngle={3}
                    animationBegin={0}
                    animationDuration={800}
                    isAnimationActive
                  >
                    {severityStats.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={getRechartsTooltipStyle(dark)}
                    formatter={(value: number, _name: string, props: { payload: { severity: string } }) => [`${value} détections`, props.payload.severity]}
                  />
                </PieChart>
              </ResponsiveContainer>
              {/* Chip legend */}
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, justifyContent: 'center', mt: 1 }}>
                {severityStats.map((stat) => (
                  <Chip
                    key={stat.severity}
                    label={`${stat.severity} (${stat.count})`}
                    size="small"
                    sx={{ bgcolor: stat.color, color: 'white', fontWeight: 600, fontSize: '0.75rem' }}
                  />
                ))}
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Category details table */}
      <Card sx={{ mb: 4 }}>
        <CardContent>
          <Typography variant="h6" fontWeight={600} gutterBottom>
            {t('categoryAnalysis.categoryDetails')}
          </Typography>
          <TableContainer>
            <Table stickyHeader>
              <TableHead>
                <TableRow>
                  <TableCell>{t('categoryAnalysis.colCategory')}</TableCell>
                  <TableCell align="center">{t('categoryAnalysis.colSeverity')}</TableCell>
                  <TableCell align="right">{t('categoryAnalysis.colDetections')}</TableCell>
                  <TableCell align="right">{t('categoryAnalysis.colFiles')}</TableCell>
                  <TableCell>{t('categoryAnalysis.colPiiTypes')}</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {categoryStats.map((cat) => (
                  <TableRow key={cat.category} hover>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Typography variant="body1">{cat.icon}</Typography>
                        <Typography fontWeight={600}>{cat.category}</Typography>
                      </Box>
                    </TableCell>
                    <TableCell align="center">
                      <Chip label={cat.severity} size="small" sx={{ bgcolor: cat.color, color: 'white', fontWeight: 600 }} />
                    </TableCell>
                    <TableCell align="right"><Typography fontWeight={600}>{cat.detections}</Typography></TableCell>
                    <TableCell align="right"><Typography fontWeight={600}>{cat.files}</Typography></TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                        {cat.types.map((type) => (
                          <Chip key={type} label={type} size="small" variant="outlined" sx={{ fontSize: '0.75rem' }} />
                        ))}
                      </Box>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>

      {/* Filters — chip-based */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <FilterListIcon sx={{ mr: 1, color: 'primary.main', fontSize: 20 }} />
            <Typography variant="h6" fontWeight={600}>
              {t('categoryAnalysis.filters')}
            </Typography>
          </Box>

          {/* Category chips */}
          <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap" sx={{ gap: 1, mb: 1.5 }}>
            <Typography variant="body2" fontWeight={600} color="text.secondary" sx={{ minWidth: 100 }}>
              {t('categoryAnalysis.filterCategory')}:
            </Typography>
            {['Toutes', ...Object.keys(PII_CATEGORIES)].map((cat) => (
              <Chip
                key={cat}
                label={cat === 'Toutes' ? t('categoryAnalysis.allCategories') : `${PII_CATEGORIES[cat as keyof typeof PII_CATEGORIES]?.icon || ''} ${cat}`}
                size="small"
                clickable
                onClick={() => setSelectedCategory(cat)}
                color={selectedCategory === cat ? 'primary' : 'default'}
                variant={selectedCategory === cat ? 'filled' : 'outlined'}
                sx={{ fontWeight: selectedCategory === cat ? 600 : 400 }}
              />
            ))}
          </Stack>

          {/* Severity chips */}
          <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap" sx={{ gap: 1, mb: 1.5 }}>
            <Typography variant="body2" fontWeight={600} color="text.secondary" sx={{ minWidth: 100 }}>
              {t('categoryAnalysis.filterSeverity')}:
            </Typography>
            {[
              { value: 'Toutes', label: t('categoryAnalysis.allLevels') },
              { value: 'Critique', label: 'Critique' },
              { value: 'Élevé', label: 'Élevé' },
              { value: 'Moyen', label: 'Moyen' },
              { value: 'Faible', label: 'Faible' },
            ].map(({ value, label }) => (
              <Chip
                key={value}
                label={label}
                size="small"
                clickable
                onClick={() => setSelectedSeverity(value)}
                color={selectedSeverity === value ? 'primary' : 'default'}
                variant={selectedSeverity === value ? 'filled' : 'outlined'}
                sx={{ fontWeight: selectedSeverity === value ? 600 : 400 }}
              />
            ))}
          </Stack>

          {/* PII type — keep Select (too many options) */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Typography variant="body2" fontWeight={600} color="text.secondary" sx={{ minWidth: 100 }}>
              {t('categoryAnalysis.filterType')}:
            </Typography>
            <FormControl size="small" sx={{ minWidth: 200 }}>
              <Select value={selectedPiiType} onChange={(e) => setSelectedPiiType(e.target.value)}>
                <MenuItem value="Tous">{t('categoryAnalysis.allTypes')}</MenuItem>
                {availablePiiTypes.map((type) => (
                  <MenuItem key={type} value={type}>{type}</MenuItem>
                ))}
              </Select>
            </FormControl>
            <Typography variant="caption" color="text.secondary">
              {t('categoryAnalysis.resultsInfo', { detections: filteredFiles.length, files: groupedFiles.length })}
            </Typography>
          </Box>
        </CardContent>
      </Card>

      {/* Files table */}
      <Card>
        <CardContent>
          <Typography variant="h6" fontWeight={600} gutterBottom>
            {t('categoryAnalysis.detectedFiles', { count: groupedFiles.length })}
          </Typography>

          {groupedFiles.length === 0 ? (
            <Alert severity="warning" sx={{ mt: 2 }}>{t('categoryAnalysis.noFiles')}</Alert>
          ) : (
            <TableContainer
              sx={{
                maxHeight: 600,
                border: '1px solid',
                borderColor: 'divider',
                borderRadius: `${tokens.radii.lg}px`,
              }}
            >
              <Table stickyHeader>
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 600 }}>{t('categoryAnalysis.colFile')}</TableCell>
                    <TableCell align="center" sx={{ fontWeight: 600 }}>{t('categoryAnalysis.colPiiTypes')}</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 600 }}>{t('categoryAnalysis.colDetections')}</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {groupedFiles.map((file, index) => (
                    <TableRow key={index} hover>
                      <TableCell sx={{ fontFamily: 'monospace', fontSize: '0.85rem' }}>{file.filePath}</TableCell>
                      <TableCell align="center">
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, justifyContent: 'center' }}>
                          {file.piiTypes.map((type) => {
                            const category = Object.values(PII_CATEGORIES).find((cat) => cat.types.includes(type));
                            return (
                              <Chip
                                key={type}
                                label={type}
                                size="small"
                                sx={{ bgcolor: category?.color || '#9e9e9e', color: 'white', fontSize: '0.7rem', fontWeight: 600 }}
                              />
                            );
                          })}
                        </Box>
                      </TableCell>
                      <TableCell align="right">
                        <Chip label={file.detectionCount} size="small" color="primary" sx={{ fontWeight: 600 }} />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </CardContent>
      </Card>
    </Container>
  );
};

export default PiiCategoryAnalysis;
