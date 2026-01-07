import { useState } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Paper,
  Stack,
  Button,
  Divider,
  Chip,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Alert,
  Container,
} from '@mui/material';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';
import {
  Download as DownloadIcon,
  Description as DescriptionIcon,
  TableChart as TableChartIcon,
  DataObject as DataObjectIcon,
  Code as CodeIcon,
  Assessment as AssessmentIcon,
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon,
  Error as ErrorIcon,
  TrendingUp as TrendingUpIcon,
  Security as SecurityIcon,
} from '@mui/icons-material';
import type { ScanResultResponse } from '../../types';
import EmptyState from '../common/EmptyState';
import StatCard from '../common/StatCard';

interface ReportsProps {
  results: ScanResultResponse | null;
  onDownloadReport: (format: 'csv' | 'json' | 'html' | 'excel') => void;
}

const COLORS = {
  risk: {
    FAIBLE: '#4caf50',
    MOYEN: '#ff9800',
    ÉLEVÉ: '#f44336',
  },
};

export default function Reports({ results, onDownloadReport }: ReportsProps) {
  const [downloadingFormat, setDownloadingFormat] = useState<string | null>(null);

  const handleDownload = async (format: 'csv' | 'json' | 'html' | 'excel') => {
    setDownloadingFormat(format);
    try {
      await onDownloadReport(format);
    } finally {
      setTimeout(() => setDownloadingFormat(null), 1000);
    }
  };

  if (!results) {
    return (
      <EmptyState
        icon={<AssessmentIcon sx={{ fontSize: 80, color: 'primary.main', opacity: 0.5 }} />}
        title="Aucun rapport disponible"
        description="Lancez un scan depuis la page Scanner pour générer des rapports détaillés."
      />
    );
  }

  const { statistics } = results;

  // Préparation des données pour les graphiques
  const piiTypeData = Object.entries(statistics.piiByType)
    .map(([type, count]) => ({
      type: type.length > 20 ? type.substring(0, 20) + '...' : type,
      fullType: type,
      count,
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10); // Top 10 seulement

  const riskData = [
    {
      level: 'FAIBLE',
      count: statistics.topRiskyFiles.filter(f => f.riskLevel === 'FAIBLE').length,
      color: COLORS.risk.FAIBLE,
      description: '1-2 PII détectées',
    },
    {
      level: 'MOYEN',
      count: statistics.topRiskyFiles.filter(f => f.riskLevel === 'MOYEN').length,
      color: COLORS.risk.MOYEN,
      description: '3-10 PII détectées',
    },
    {
      level: 'ÉLEVÉ',
      count: statistics.topRiskyFiles.filter(f => f.riskLevel === 'ÉLEVÉ').length,
      color: COLORS.risk.ÉLEVÉ,
      description: '10+ PII ou données bancaires',
    },
  ];

  // Calcul des recommandations
  const highRiskCount = riskData.find(r => r.level === 'ÉLEVÉ')?.count || 0;
  const mediumRiskCount = riskData.find(r => r.level === 'MOYEN')?.count || 0;
  const totalPii = Object.values(statistics.piiByType).reduce((a, b) => a + b, 0);
  const uniquePiiTypes = Object.keys(statistics.piiByType).length;

  const recommendations = [];
  if (highRiskCount > 0) {
    recommendations.push({
      severity: 'error' as const,
      icon: <ErrorIcon />,
      title: 'Fichiers à risque élevé détectés',
      description: `${highRiskCount} fichier(s) contiennent des données sensibles. Sécurisez-les immédiatement.`,
    });
  }
  if (mediumRiskCount > 5) {
    recommendations.push({
      severity: 'warning' as const,
      icon: <WarningIcon />,
      title: 'Plusieurs fichiers à risque moyen',
      description: `${mediumRiskCount} fichier(s) nécessitent une révision des permissions d'accès.`,
    });
  }
  if (uniquePiiTypes >= 10) {
    recommendations.push({
      severity: 'warning' as const,
      icon: <SecurityIcon />,
      title: 'Grande diversité de PII',
      description: `${uniquePiiTypes} types de données personnelles différents détectés. Vérifiez la nécessité de conservation.`,
    });
  }
  if (recommendations.length === 0) {
    recommendations.push({
      severity: 'success' as const,
      icon: <CheckCircleIcon />,
      title: 'Bonne conformité globale',
      description: 'Aucun problème critique détecté. Continuez à surveiller régulièrement.',
    });
  }

  const exportFormats = [
    {
      format: 'csv' as const,
      icon: <TableChartIcon sx={{ fontSize: 40, color: '#4caf50' }} />,
      title: 'CSV (Excel)',
      description: 'Fichier tableur avec toutes les détections',
      details: 'Format universel compatible Excel, LibreOffice, Google Sheets',
      size: '~50 KB',
    },
    {
      format: 'excel' as const,
      icon: <DescriptionIcon sx={{ fontSize: 40, color: '#217346' }} />,
      title: 'Excel (.xlsx)',
      description: 'Classeur Excel avec statistiques et graphiques',
      details: 'Multi-feuilles avec filtres automatiques et mise en forme',
      size: '~80 KB',
    },
    {
      format: 'json' as const,
      icon: <DataObjectIcon sx={{ fontSize: 40, color: '#667eea' }} />,
      title: 'JSON',
      description: 'Données brutes structurées',
      details: 'Format pour intégration API ou traitement automatisé',
      size: '~40 KB',
    },
    {
      format: 'html' as const,
      icon: <CodeIcon sx={{ fontSize: 40, color: '#f44336' }} />,
      title: 'HTML',
      description: 'Rapport web interactif',
      details: 'Page HTML autonome avec styles et tableaux interactifs',
      size: '~120 KB',
    },
  ];

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
          <AssessmentIcon sx={{ fontSize: 40, mr: 2, color: 'primary.main' }} />
          <Typography variant="h4" fontWeight={700}>
            Rapports et Exports
          </Typography>
        </Box>
        <Typography variant="body1" color="text.secondary">
          Résumé exécutif, analyses visuelles et exports de données
        </Typography>
      </Box>

      {/* Section 1: Résumé Exécutif */}
      <Card sx={{ mb: 4 }}>
        <CardContent>
          <Typography variant="h6" fontWeight={600} gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <TrendingUpIcon color="primary" />
            Résumé Exécutif
          </Typography>
          <Divider sx={{ mb: 3 }} />

          <Grid container spacing={3}>
            <Grid item xs={12} sm={6} md={3}>
              <StatCard
                value={statistics.totalFilesScanned.toLocaleString()}
                label="Fichiers analysés"
                gradient="linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <StatCard
                value={totalPii.toLocaleString()}
                label="PII détectées"
                gradient="linear-gradient(135deg, #f093fb 0%, #f5576c 100%)"
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <StatCard
                value={statistics.filesWithPii.toLocaleString()}
                label="Fichiers avec PII"
                gradient="linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)"
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <StatCard
                value={uniquePiiTypes}
                label="Types de PII"
                gradient="linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)"
              />
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Section 2: Visualisations Essentielles */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {/* Top 10 Types de PII - Moitié gauche */}
        <Grid item xs={12} lg={6}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Typography variant="h6" fontWeight={600} gutterBottom>
                Top 10 des types de PII détectés
              </Typography>
              <Typography variant="body2" color="text.secondary" paragraph>
                Distribution des données personnelles par catégorie
              </Typography>
              <Box sx={{ width: '100%', height: 450 }}>
                <ResponsiveContainer>
                  <BarChart data={piiTypeData} layout="vertical">
                    <defs>
                      <linearGradient id="barGradient" x1="0" y1="0" x2="1" y2="0">
                        <stop offset="0%" stopColor="#667eea" />
                        <stop offset="100%" stopColor="#764ba2" />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis type="number" tick={{ fontSize: 12 }} />
                    <YAxis dataKey="type" type="category" width={150} tick={{ fontSize: 11 }} />
                    <RechartsTooltip
                      content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                          return (
                            <Paper sx={{ p: 2, border: '1px solid #e0e0e0' }}>
                              <Typography variant="body2" fontWeight={600}>
                                {payload[0].payload.fullType}
                              </Typography>
                              <Typography variant="body2" color="primary">
                                {payload[0].value} détection(s)
                              </Typography>
                            </Paper>
                          );
                        }
                        return null;
                      }}
                    />
                    <Bar dataKey="count" fill="url(#barGradient)" radius={[0, 8, 8, 0]} barSize={35} />
                  </BarChart>
                </ResponsiveContainer>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Distribution des Risques - Moitié droite */}
        <Grid item xs={12} lg={6}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Typography variant="h6" fontWeight={600} gutterBottom>
                Distribution des risques
              </Typography>
              <Typography variant="body2" color="text.secondary" paragraph>
                Classification par niveau de risque
              </Typography>
              <Box sx={{ width: '100%', height: 450, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                <Box sx={{ width: '100%', height: '60%', display: 'flex', justifyContent: 'center' }}>
                  <ResponsiveContainer>
                    <PieChart>
                      <Pie
                        data={riskData}
                        cx="50%"
                        cy="50%"
                        innerRadius={70}
                        outerRadius={110}
                        paddingAngle={3}
                        dataKey="count"
                        label={(entry) => `${entry.level}: ${entry.count}`}
                      >
                        {riskData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <RechartsTooltip
                        contentStyle={{
                          backgroundColor: 'rgba(255, 255, 255, 0.95)',
                          border: '1px solid #e0e0e0',
                          borderRadius: '8px',
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </Box>
                <Box sx={{ width: '100%', mt: 2 }}>
                  <Grid container spacing={2}>
                    {riskData.map((item, index) => (
                      <Grid item xs={4} key={index}>
                        <Card sx={{ p: 2, bgcolor: `${item.color}15`, border: `1px solid ${item.color}40`, textAlign: 'center' }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1, mb: 1 }}>
                            <Box sx={{ width: 12, height: 12, borderRadius: '50%', bgcolor: item.color }} />
                            <Typography variant="caption" fontWeight={700} sx={{ color: item.color, fontSize: '0.75rem' }}>
                              {item.level}
                            </Typography>
                          </Box>
                          <Typography variant="h4" fontWeight={700} color={item.color} gutterBottom sx={{ fontSize: '2rem' }}>
                            {item.count}
                          </Typography>
                          <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem' }}>
                            {item.description}
                          </Typography>
                        </Card>
                      </Grid>
                    ))}
                  </Grid>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Section 3: Exports et Téléchargements */}
      <Card sx={{ mb: 4 }}>
        <CardContent>
          <Typography variant="h6" fontWeight={600} gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <DownloadIcon color="primary" />
            Télécharger les rapports
          </Typography>
          <Divider sx={{ mb: 3 }} />

          <Grid container spacing={2}>
            {exportFormats.map((format) => (
              <Grid item xs={12} sm={6} md={3} key={format.format}>
                <Card sx={{
                  height: '100%',
                  transition: 'transform 0.2s, box-shadow 0.2s',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: 6,
                  },
                }}>
                  <CardContent sx={{ textAlign: 'center', pt: 2, pb: 2 }}>
                    <Box sx={{ mb: 1.5 }}>
                      {format.icon}
                    </Box>
                    <Typography variant="h6" fontWeight={600} gutterBottom sx={{ fontSize: '1rem' }}>
                      {format.title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 1, minHeight: 36, fontSize: '0.85rem' }}>
                      {format.description}
                    </Typography>
                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1.5, fontSize: '0.7rem', minHeight: 28 }}>
                      {format.details}
                    </Typography>
                    <Chip label={format.size} size="small" sx={{ mb: 1.5, fontSize: '0.7rem', height: 20 }} />
                    <Button
                      fullWidth
                      variant="contained"
                      size="small"
                      startIcon={<DownloadIcon sx={{ fontSize: 16 }} />}
                      onClick={() => handleDownload(format.format)}
                      disabled={downloadingFormat === format.format}
                      sx={{
                        fontSize: '0.8rem',
                        py: 0.75,
                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                        '&:hover': {
                          background: 'linear-gradient(135deg, #5568d3 0%, #6a3f91 100%)',
                        },
                      }}
                    >
                      {downloadingFormat === format.format ? 'Téléchargement...' : 'Télécharger'}
                    </Button>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </CardContent>
      </Card>

      {/* Section 4: Recommandations */}
      <Card>
        <CardContent>
          <Typography variant="h6" fontWeight={600} gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <SecurityIcon color="primary" />
            Recommandations
          </Typography>
          <Divider sx={{ mb: 3 }} />

          <Stack spacing={2}>
            {recommendations.map((rec, index) => (
              <Alert
                key={index}
                severity={rec.severity}
                icon={rec.icon}
                sx={{ alignItems: 'center' }}
              >
                <Typography variant="body2" fontWeight={600}>
                  {rec.title}
                </Typography>
                <Typography variant="body2">
                  {rec.description}
                </Typography>
              </Alert>
            ))}

            <Paper sx={{ p: 3, bgcolor: 'rgba(102, 126, 234, 0.05)', border: '1px solid rgba(102, 126, 234, 0.2)' }}>
              <Typography variant="subtitle2" fontWeight={600} gutterBottom>
                Actions suggérées :
              </Typography>
              <List dense>
                <ListItem>
                  <ListItemIcon sx={{ minWidth: 36 }}>
                    <CheckCircleIcon color="primary" fontSize="small" />
                  </ListItemIcon>
                  <ListItemText
                    primary="Examinez les fichiers à risque élevé dans l'onglet 'Fichiers à risque'"
                    primaryTypographyProps={{ variant: 'body2' }}
                  />
                </ListItem>
                <ListItem>
                  <ListItemIcon sx={{ minWidth: 36 }}>
                    <CheckCircleIcon color="primary" fontSize="small" />
                  </ListItemIcon>
                  <ListItemText
                    primary="Vérifiez les permissions d'accès des fichiers contenant des PII sensibles"
                    primaryTypographyProps={{ variant: 'body2' }}
                  />
                </ListItem>
                <ListItem>
                  <ListItemIcon sx={{ minWidth: 36 }}>
                    <CheckCircleIcon color="primary" fontSize="small" />
                  </ListItemIcon>
                  <ListItemText
                    primary="Consultez la page 'Rétention des données' pour gérer les fichiers obsolètes"
                    primaryTypographyProps={{ variant: 'body2' }}
                  />
                </ListItem>
                <ListItem>
                  <ListItemIcon sx={{ minWidth: 36 }}>
                    <CheckCircleIcon color="primary" fontSize="small" />
                  </ListItemIcon>
                  <ListItemText
                    primary="Téléchargez le rapport Excel pour une analyse détaillée hors-ligne"
                    primaryTypographyProps={{ variant: 'body2' }}
                  />
                </ListItem>
              </List>
            </Paper>
          </Stack>
        </CardContent>
      </Card>
    </Container>
  );
}
