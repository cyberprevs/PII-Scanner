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
  Paper,
  Chip,
  FormControl,
  Select,
  MenuItem,
  Alert,
  Divider,
  LinearProgress,
  Button,
  ButtonGroup,
  Container,
} from '@mui/material';
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
  Legend,
  ResponsiveContainer,
} from 'recharts';
import CategoryIcon from '@mui/icons-material/Category';
import SecurityIcon from '@mui/icons-material/Security';
import BarChartIcon from '@mui/icons-material/BarChart';
import FilterListIcon from '@mui/icons-material/FilterList';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import { ScanResultResponse } from '../../types';
import StatCard from '../common/StatCard';

interface Props {
  results: ScanResultResponse | null;
}

// Définition des catégories de PII avec leurs types et niveaux de sensibilité
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
    icon: '•',
    severity: 'Moyen',
    color: '#ffc107',
  },
  Éducation: {
    types: ['INE', 'Matricule_Fonctionnaire'],
    icon: '•',
    severity: 'Élevé',
    color: '#ff9800',
  },
  Transport: {
    types: ['Plaque_Immatriculation'],
    icon: '•',
    severity: 'Faible',
    color: '#4caf50',
  },
  Universelle: {
    types: ['DateNaissance'],
    icon: '•',
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

const PiiCategoryAnalysis: React.FC<Props> = ({ results }) => {
  const { t } = useTranslation();
  const [selectedCategory, setSelectedCategory] = useState<string>('Toutes');
  const [selectedSeverity, setSelectedSeverity] = useState<string>('Toutes');
  const [selectedPiiType, setSelectedPiiType] = useState<string>('Tous');

  // Fonction pour exporter en CSV
  const exportToCSV = () => {
    if (groupedFiles.length === 0) {
      alert(t('categoryAnalysis.noData'));
      return;
    }

    const headers = ['Fichier', 'Types PII', 'Nombre de détections'];
    const rows = groupedFiles.map((file) => [
      file.filePath,
      file.piiTypes.join(', '),
      file.detectionCount.toString(),
    ]);

    const csvContent = [
      headers.join(';'),
      ...rows.map((row) => row.join(';')),
    ].join('\n');

    const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `analyse_pii_categories_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  // Fonction pour exporter en Excel (format CSV avec extension .xlsx simulée)
  const exportToExcel = () => {
    if (groupedFiles.length === 0) {
      alert(t('categoryAnalysis.noData'));
      return;
    }

    // Créer un contenu CSV enrichi pour Excel
    const headers = ['Fichier', 'Types PII', 'Nombre de détections', 'Catégories', 'Niveau de sensibilité'];
    const rows = groupedFiles.map((file) => {
      // Déterminer les catégories et sensibilités
      const categories = new Set<string>();
      const severities = new Set<string>();

      file.piiTypes.forEach((type) => {
        Object.entries(PII_CATEGORIES).forEach(([catName, catData]) => {
          if (catData.types.includes(type)) {
            categories.add(catName);
            severities.add(catData.severity);
          }
        });
      });

      return [
        file.filePath,
        file.piiTypes.join(', '),
        file.detectionCount.toString(),
        Array.from(categories).join(', '),
        Array.from(severities).join(', '),
      ];
    });

    const csvContent = [
      headers.join(';'),
      ...rows.map((row) => row.join(';')),
    ].join('\n');

    const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `analyse_pii_categories_${new Date().toISOString().split('T')[0]}.xlsx`;
    link.click();
    URL.revokeObjectURL(url);
  };

  // Calcul des statistiques par catégorie
  const categoryStats = useMemo(() => {
    if (!results?.statistics?.piiByType) return [];

    const stats = Object.entries(PII_CATEGORIES).map(([categoryName, categoryData]) => {
      const detectionCount = categoryData.types.reduce((sum, type) => {
        return sum + (results.statistics.piiByType[type] || 0);
      }, 0);

      const filesWithCategory = results.detections
        .filter((d) => categoryData.types.includes(d.piiType))
        .map((d) => d.filePath)
        .filter((value, index, self) => self.indexOf(value) === index).length;

      return {
        category: categoryName,
        detections: detectionCount,
        files: filesWithCategory,
        icon: categoryData.icon,
        severity: categoryData.severity,
        color: categoryData.color,
        types: categoryData.types,
      };
    });

    return stats.filter((s) => s.detections > 0).sort((a, b) => b.detections - a.detections);
  }, [results]);

  // Calcul des statistiques par niveau de sensibilité
  const severityStats = useMemo(() => {
    if (!results?.detections) return [];

    const stats = {
      Critique: 0,
      Élevé: 0,
      Moyen: 0,
      Faible: 0,
    };

    // Compter les fichiers par niveau de sensibilité des PII détectés
    results.detections.forEach((detection) => {
      const category = Object.values(PII_CATEGORIES).find((cat) =>
        cat.types.includes(detection.piiType)
      );
      if (category) {
        stats[category.severity as keyof typeof stats]++;
      }
    });

    return Object.entries(stats)
      .map(([severity, count]) => ({
        severity,
        count,
        color: SEVERITY_COLORS[severity as keyof typeof SEVERITY_COLORS],
      }))
      .filter((s) => s.count > 0);
  }, [results]);

  // Calcul des types PII disponibles
  const availablePiiTypes = useMemo(() => {
    if (!results?.statistics?.piiByType) return [];
    return Object.keys(results.statistics.piiByType).filter(
      (type) => results.statistics.piiByType[type] > 0
    );
  }, [results]);

  // Filtrage des fichiers
  const filteredFiles = useMemo(() => {
    if (!results?.detections) return [];

    let filtered = results.detections;

    // Filtre par catégorie
    if (selectedCategory !== 'Toutes') {
      const categoryTypes = PII_CATEGORIES[selectedCategory as keyof typeof PII_CATEGORIES].types;
      filtered = filtered.filter((d) => categoryTypes.includes(d.piiType));
    }

    // Filtre par sensibilité
    if (selectedSeverity !== 'Toutes') {
      filtered = filtered.filter((d) => {
        const category = Object.values(PII_CATEGORIES).find((cat) =>
          cat.types.includes(d.piiType)
        );
        return category?.severity === selectedSeverity;
      });
    }

    // Filtre par type PII spécifique
    if (selectedPiiType !== 'Tous') {
      filtered = filtered.filter((d) => d.piiType === selectedPiiType);
    }

    return filtered;
  }, [results, selectedCategory, selectedSeverity, selectedPiiType]);

  // Regroupement des fichiers filtrés
  const groupedFiles = useMemo(() => {
    const grouped = new Map<string, { piiTypes: Set<string>; count: number }>();

    filteredFiles.forEach((detection) => {
      if (!grouped.has(detection.filePath)) {
        grouped.set(detection.filePath, { piiTypes: new Set(), count: 0 });
      }
      const fileData = grouped.get(detection.filePath)!;
      fileData.piiTypes.add(detection.piiType);
      fileData.count++;
    });

    return Array.from(grouped.entries())
      .map(([filePath, data]) => ({
        filePath,
        piiTypes: Array.from(data.piiTypes),
        detectionCount: data.count,
      }))
      .sort((a, b) => b.detectionCount - a.detectionCount)
      .slice(0, 100); // Limite à 100 fichiers pour la performance
  }, [filteredFiles]);

  if (!results) {
    return (
      <Box sx={{ p: 3 }}>
        <Card>
          <CardContent sx={{ textAlign: 'center', py: 8 }}>
            <CategoryIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
            <Typography variant="h6" gutterBottom>
              {t('categoryAnalysis.noScan')}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {t('categoryAnalysis.noScanSubtitle')}
            </Typography>
          </CardContent>
        </Card>
      </Box>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      {/* En-tête */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" fontWeight={700} gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <CategoryIcon sx={{ fontSize: 32 }} />
          {t('categoryAnalysis.title')}
        </Typography>
        <Typography variant="body1" color="text.secondary">
          {t('categoryAnalysis.subtitle')}
        </Typography>
      </Box>

      {/* Indicateurs clés */}
      <Box sx={{ display: 'flex', gap: 3, mb: 4, flexWrap: 'wrap' }}>
        <StatCard value={severityStats.find((s) => s.severity === 'Critique')?.count || 0} label={t('categoryAnalysis.criticalDetections')} gradient="linear-gradient(135deg, #F45252 0%, #D93636 100%)" />
        <StatCard value={severityStats.find((s) => s.severity === 'Élevé')?.count || 0} label={t('categoryAnalysis.highDetections')} gradient="linear-gradient(135deg, #F0A000 0%, #D48800 100%)" />
        <StatCard value={severityStats.find((s) => s.severity === 'Moyen')?.count || 0} label={t('categoryAnalysis.mediumDetections')} gradient="linear-gradient(135deg, #F0A000 0%, #FF9800 100%)" />
        <StatCard value={severityStats.find((s) => s.severity === 'Faible')?.count || 0} label={t('categoryAnalysis.lowDetections')} gradient="linear-gradient(135deg, #00E599 0%, #00B876 100%)" />
      </Box>

      {/* Graphiques - Pleine largeur */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {/* Graphique par catégorie - Moitié gauche */}
        <Grid item xs={12} lg={6}>
          <Card sx={{ height: '100%' }}>
            <CardContent sx={{ p: 4 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                <BarChartIcon sx={{ mr: 1.5, fontSize: 28, color: 'primary.main' }} />
                <Typography variant="h5" fontWeight={700}>
                  {t('categoryAnalysis.byCategory')}
                </Typography>
              </Box>
              <Box sx={{ width: '100%', height: 450 }}>
                <ResponsiveContainer>
                  <BarChart
                    data={categoryStats}
                    layout="vertical"
                    margin={{ top: 20, right: 30, bottom: 20, left: 120 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} />
                    <XAxis type="number" tick={{ fontSize: 12 }} />
                    <YAxis
                      type="category"
                      dataKey="category"
                      tick={{ fontSize: 14 }}
                      width={110}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'rgba(255, 255, 255, 0.95)',
                        borderRadius: 8,
                        border: '1px solid #ddd'
                      }}
                    />
                    <Legend
                      wrapperStyle={{ paddingTop: '15px' }}
                      iconType="rect"
                    />
                    <Bar
                      dataKey="detections"
                      fill="#00E599"
                      name={t('categoryAnalysis.colDetections')}
                      radius={[0, 8, 8, 0]}
                      barSize={40}
                    />
                    <Bar
                      dataKey="files"
                      fill="#00B876"
                      name={t('categoryAnalysis.colFiles')}
                      radius={[0, 8, 8, 0]}
                      barSize={40}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Graphique par sensibilité - Moitié droite */}
        <Grid item xs={12} lg={6}>
          <Card sx={{ height: '100%' }}>
            <CardContent sx={{ p: 4 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                <SecurityIcon sx={{ mr: 1.5, fontSize: 28, color: 'secondary.main' }} />
                <Typography variant="h5" fontWeight={700}>
                  {t('categoryAnalysis.bySeverity')}
                </Typography>
              </Box>
              <Box sx={{ width: '100%', height: 450, display: 'flex', flexDirection: 'column', gap: 2 }}>
                {/* Graphique en haut (60% de la hauteur) */}
                <Box sx={{ flex: '0 0 60%' }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={severityStats}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={false}
                        outerRadius={100}
                        innerRadius={60}
                        fill="#8884d8"
                        dataKey="count"
                        paddingAngle={3}
                      >
                        {severityStats.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{
                          backgroundColor: 'rgba(255, 255, 255, 0.95)',
                          borderRadius: 8,
                          border: '1px solid #ddd'
                        }}
                      formatter={(value: number, name: string, props: any) => [
                        `${value} détections`,
                        props.payload.severity
                      ]}
                    />
                  </PieChart>
                </ResponsiveContainer>
                </Box>
                {/* Légende en grille en bas (40% de la hauteur) */}
                <Box sx={{ flex: '0 0 40%' }}>
                  <Grid container spacing={1.5}>
                    {severityStats.map((stat, index) => (
                      <Grid item xs={6} key={index}>
                        <Box
                          sx={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            p: 1.5,
                            borderRadius: 2,
                            bgcolor: 'background.default',
                            border: '1px solid',
                            borderColor: 'divider',
                          }}
                        >
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Box
                              sx={{
                                width: 16,
                                height: 16,
                                borderRadius: '4px',
                                backgroundColor: stat.color,
                                flexShrink: 0
                              }}
                            />
                            <Typography variant="body2" fontSize={13} fontWeight={600}>
                              {stat.severity}
                            </Typography>
                          </Box>
                          <Chip
                            label={stat.count}
                            size="small"
                            sx={{
                              bgcolor: stat.color,
                              color: 'white',
                              fontWeight: 700,
                              minWidth: 45,
                              fontSize: '0.8rem'
                            }}
                          />
                        </Box>
                      </Grid>
                    ))}
                  </Grid>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Tableau des catégories */}
      <Card sx={{ mb: 4 }}>
        <CardContent>
          <Typography variant="h6" fontWeight={600} gutterBottom>
            {t('categoryAnalysis.categoryDetails')}
          </Typography>
          <TableContainer>
            <Table>
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
                        <Typography variant="h6">{cat.icon}</Typography>
                        <Typography fontWeight={600}>{cat.category}</Typography>
                      </Box>
                    </TableCell>
                    <TableCell align="center">
                      <Chip
                        label={cat.severity}
                        size="small"
                        sx={{
                          bgcolor: cat.color,
                          color: 'white',
                          fontWeight: 600,
                        }}
                      />
                    </TableCell>
                    <TableCell align="right">
                      <Typography fontWeight={600}>{cat.detections}</Typography>
                    </TableCell>
                    <TableCell align="right">
                      <Typography fontWeight={600}>{cat.files}</Typography>
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                        {cat.types.map((type) => (
                          <Chip
                            key={type}
                            label={type}
                            size="small"
                            variant="outlined"
                            sx={{ fontSize: '0.75rem' }}
                          />
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

      {/* Filtres */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <FilterListIcon sx={{ mr: 1, color: 'primary.main' }} />
            <Typography variant="h6" fontWeight={600}>
              {t('categoryAnalysis.filters')}
            </Typography>
          </Box>

          <Grid container spacing={2}>
            <Grid item xs={12} md={4}>
              <FormControl fullWidth>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                  {t('categoryAnalysis.filterCategory')}
                </Typography>
                <Select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  size="small"
                >
                  <MenuItem value="Toutes">{t('categoryAnalysis.allCategories')}</MenuItem>
                  {Object.keys(PII_CATEGORIES).map((cat) => (
                    <MenuItem key={cat} value={cat}>
                      {PII_CATEGORIES[cat as keyof typeof PII_CATEGORIES].icon} {cat}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} md={4}>
              <FormControl fullWidth>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                  {t('categoryAnalysis.filterSeverity')}
                </Typography>
                <Select
                  value={selectedSeverity}
                  onChange={(e) => setSelectedSeverity(e.target.value)}
                  size="small"
                >
                  <MenuItem value="Toutes">{t('categoryAnalysis.allLevels')}</MenuItem>
                  <MenuItem value="Critique">🔴 Critique</MenuItem>
                  <MenuItem value="Moyen">🟡 Moyen</MenuItem>
                  <MenuItem value="Faible">🟢 Faible</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} md={4}>
              <FormControl fullWidth>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                  {t('categoryAnalysis.filterType')}
                </Typography>
                <Select
                  value={selectedPiiType}
                  onChange={(e) => setSelectedPiiType(e.target.value)}
                  size="small"
                >
                  <MenuItem value="Tous">{t('categoryAnalysis.allTypes')}</MenuItem>
                  {availablePiiTypes.map((type) => (
                    <MenuItem key={type} value={type}>
                      {type}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
          </Grid>

          <Alert severity="info" sx={{ mt: 2 }}>
            {t('categoryAnalysis.resultsInfo', { detections: filteredFiles.length, files: groupedFiles.length })}
          </Alert>

          {groupedFiles.length > 0 && (
            <Box sx={{ mt: 3, display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
              <ButtonGroup variant="contained">
                <Button
                  startIcon={<FileDownloadIcon />}
                  onClick={exportToCSV}
                  sx={{
                    background: 'linear-gradient(135deg, #00E599 0%, #00B876 100%)',
                    '&:hover': {
                      background: 'linear-gradient(135deg, #00CC88 0%, #00A86B 100%)',
                    },
                  }}
                >
                  {t('categoryAnalysis.exportCsv')}
                </Button>
                <Button
                  startIcon={<FileDownloadIcon />}
                  onClick={exportToExcel}
                  sx={{
                    background: 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)',
                    '&:hover': {
                      background: 'linear-gradient(135deg, #0e8070 0%, #2dd167 100%)',
                    },
                  }}
                >
                  {t('categoryAnalysis.exportExcel')}
                </Button>
              </ButtonGroup>
            </Box>
          )}
        </CardContent>
      </Card>

      {/* Tableau des fichiers filtrés */}
      <Card>
        <CardContent>
          <Typography variant="h6" fontWeight={600} gutterBottom>
            {t('categoryAnalysis.detectedFiles', { count: groupedFiles.length })}
          </Typography>

          {groupedFiles.length === 0 ? (
            <Alert severity="warning" sx={{ mt: 2 }}>
              {t('categoryAnalysis.noFiles')}
            </Alert>
          ) : (
            <TableContainer sx={{ maxHeight: 600 }}>
              <Table stickyHeader>
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 600 }}>{t('categoryAnalysis.colFile')}</TableCell>
                    <TableCell align="center" sx={{ fontWeight: 600 }}>
                      {t('categoryAnalysis.colPiiTypes')}
                    </TableCell>
                    <TableCell align="right" sx={{ fontWeight: 600 }}>
                      {t('categoryAnalysis.colDetections')}
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {groupedFiles.map((file, index) => (
                    <TableRow key={index} hover>
                      <TableCell sx={{ fontFamily: 'monospace', fontSize: '0.85rem' }}>
                        {file.filePath}
                      </TableCell>
                      <TableCell align="center">
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, justifyContent: 'center' }}>
                          {file.piiTypes.map((type) => {
                            const category = Object.values(PII_CATEGORIES).find((cat) =>
                              cat.types.includes(type)
                            );
                            return (
                              <Chip
                                key={type}
                                label={type}
                                size="small"
                                sx={{
                                  bgcolor: category?.color || '#9e9e9e',
                                  color: 'white',
                                  fontSize: '0.7rem',
                                  fontWeight: 600,
                                }}
                              />
                            );
                          })}
                        </Box>
                      </TableCell>
                      <TableCell align="right">
                        <Chip
                          label={file.detectionCount}
                          size="small"
                          color="primary"
                          sx={{ fontWeight: 600 }}
                        />
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
