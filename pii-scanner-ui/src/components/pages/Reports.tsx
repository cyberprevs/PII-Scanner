import { useState } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Chip,
  Grid,
  ToggleButtonGroup,
  ToggleButton,
  Paper,
  Stack,
  Divider,
  IconButton,
  Tooltip,
  Button,
} from '@mui/material';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  Treemap,
  AreaChart,
  Area,
  LineChart,
  Line,
} from 'recharts';
import {
  FilterList as FilterListIcon,
  Download as DownloadIcon,
  ShowChart as ShowChartIcon,
  DonutLarge as DonutLargeIcon,
  Insights as InsightsIcon,
  CompareArrows as CompareArrowsIcon,
} from '@mui/icons-material';
import type { ScanResultResponse } from '../../types';

interface ReportsProps {
  results: ScanResultResponse | null;
}

const COLORS = {
  primary: '#667eea',
  secondary: '#764ba2',
  gradient: ['#667eea', '#764ba2', '#f093fb', '#4facfe', '#00f2fe', '#43e97b', '#fa709a', '#fee140', '#30cfd0', '#a8edea'],
  risk: {
    FAIBLE: '#4caf50',
    MOYEN: '#ff9800',
    ÉLEVÉ: '#f44336',
  },
  staleness: {
    'Récent': '#4caf50',
    '6 mois': '#8bc34a',
    '1 an': '#ff9800',
    '3 ans': '#ff5722',
    '+5 ans': '#f44336',
  },
  exposure: {
    'Faible': '#4caf50',
    'Moyen': '#ff9800',
    'Élevé': '#ff5722',
    'Critique': '#f44336',
  },
};

export default function Reports({ results }: ReportsProps) {
  const [chartView, setChartView] = useState<'overview' | 'detailed' | 'comparison'>('overview');

  if (!results) {
    return (
      <Box>
        <Typography variant="h4" fontWeight={700} gutterBottom sx={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
        }}>
          📊 Rapports & Analytics
        </Typography>
        <Card sx={{ mt: 3 }}>
          <CardContent sx={{ textAlign: 'center', py: 8 }}>
            <InsightsIcon sx={{ fontSize: 80, color: 'primary.main', opacity: 0.5, mb: 3 }} />
            <Typography variant="h6" fontWeight={600} gutterBottom>
              Aucun scan disponible
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Lancez un scan depuis la page Scanner pour voir les rapports analytiques détaillés.
            </Typography>
          </CardContent>
        </Card>
      </Box>
    );
  }

  const { statistics } = results;

  // Préparer les données pour les graphiques
  const piiTypeData = Object.entries(statistics.piiByType)
    .map(([type, count]) => ({
      type: type.length > 15 ? type.substring(0, 15) + '...' : type,
      fullType: type,
      count,
      percentage: ((count / Object.values(statistics.piiByType).reduce((a, b) => a + b, 0)) * 100).toFixed(1),
    }))
    .sort((a, b) => b.count - a.count);

  // Données pour le Treemap
  const treemapData = Object.entries(statistics.piiByType)
    .map(([name, size]) => ({ name, size }))
    .sort((a, b) => b.size - a.size);

  // Statistiques de risque
  const riskData = [
    {
      level: 'FAIBLE',
      count: statistics.topRiskyFiles.filter(f => f.riskLevel === 'FAIBLE').length,
      color: COLORS.risk.FAIBLE,
      description: '1-5 PII',
    },
    {
      level: 'MOYEN',
      count: statistics.topRiskyFiles.filter(f => f.riskLevel === 'MOYEN').length,
      color: COLORS.risk.MOYEN,
      description: '6-15 PII',
    },
    {
      level: 'ÉLEVÉ',
      count: statistics.topRiskyFiles.filter(f => f.riskLevel === 'ÉLEVÉ').length,
      color: COLORS.risk.ÉLEVÉ,
      description: '16+ PII',
    },
  ];

  // Statistiques d'ancienneté
  const stalenessData = [
    { level: 'Récent', count: 0, color: COLORS.staleness['Récent'], description: '< 6 mois' },
    { level: '6 mois', count: 0, color: COLORS.staleness['6 mois'], description: '6m - 1 an' },
    { level: '1 an', count: 0, color: COLORS.staleness['1 an'], description: '1 - 3 ans' },
    { level: '3 ans', count: 0, color: COLORS.staleness['3 ans'], description: '3 - 5 ans' },
    { level: '+5 ans', count: 0, color: COLORS.staleness['+5 ans'], description: '> 5 ans' },
  ];

  statistics.topRiskyFiles.forEach(file => {
    if (file.stalenessLevel) {
      const item = stalenessData.find(d => d.level === file.stalenessLevel);
      if (item) item.count++;
    }
  });

  // Statistiques d'exposition
  const exposureData = [
    { level: 'Faible', count: 0, color: COLORS.exposure.Faible, description: '< 5 groupes' },
    { level: 'Moyen', count: 0, color: COLORS.exposure.Moyen, description: '5-10 groupes' },
    { level: 'Élevé', count: 0, color: COLORS.exposure.Élevé, description: '10+ groupes' },
    { level: 'Critique', count: 0, color: COLORS.exposure.Critique, description: 'Everyone/Public' },
  ];

  statistics.topRiskyFiles.forEach(file => {
    if (file.exposureLevel) {
      const item = exposureData.find(d => d.level === file.exposureLevel);
      if (item) item.count++;
    }
  });

  // Données pour le Radar Chart (Score de sécurité multi-dimensionnel)
  const radarData = [
    {
      category: 'Confidentialité',
      score: Math.max(0, 100 - (riskData.find(r => r.level === 'ÉLEVÉ')?.count || 0) * 10),
    },
    {
      category: 'Ancienneté',
      score: Math.max(0, 100 - (stalenessData.find(s => s.level === '+5 ans')?.count || 0) * 15),
    },
    {
      category: 'Exposition',
      score: Math.max(0, 100 - (exposureData.find(e => e.level === 'Critique')?.count || 0) * 20),
    },
    {
      category: 'Volume PII',
      score: Math.max(0, 100 - Math.min(100, Object.values(statistics.piiByType).reduce((a, b) => a + b, 0) / 10)),
    },
    {
      category: 'Diversité',
      score: Math.max(0, 100 - Object.keys(statistics.piiByType).length * 5),
    },
  ];

  // Tendances simulées (à remplacer par des vraies données historiques)
  const trendData = [
    { scan: 'Scan 1', pii: 156, filesScanned: 842, highRisk: 12 },
    { scan: 'Scan 2', pii: 243, filesScanned: 1024, highRisk: 18 },
    { scan: 'Scan 3', pii: 198, filesScanned: 956, highRisk: 15 },
    { scan: 'Scan 4', pii: 287, filesScanned: 1345, highRisk: 23 },
    {
      scan: 'Actuel',
      pii: Object.values(statistics.piiByType).reduce((a, b) => a + b, 0),
      filesScanned: statistics.totalFilesScanned,
      highRisk: riskData.find(r => r.level === 'ÉLEVÉ')?.count || 0,
    },
  ];

  const CustomTreemapContent = (props: any) => {
    const { x, y, width, height, name, size } = props;
    return (
      <g>
        <rect
          x={x}
          y={y}
          width={width}
          height={height}
          style={{
            fill: COLORS.gradient[Math.floor(Math.random() * COLORS.gradient.length)],
            stroke: '#fff',
            strokeWidth: 2,
            opacity: 0.9,
          }}
        />
        {width > 60 && height > 40 && (
          <>
            <text
              x={x + width / 2}
              y={y + height / 2 - 8}
              textAnchor="middle"
              fill="#fff"
              fontSize={width > 100 ? 14 : 12}
              fontWeight={600}
            >
              {name.length > 12 ? name.substring(0, 12) + '...' : name}
            </text>
            <text
              x={x + width / 2}
              y={y + height / 2 + 10}
              textAnchor="middle"
              fill="#fff"
              fontSize={width > 100 ? 16 : 14}
              fontWeight={700}
            >
              {size}
            </text>
          </>
        )}
      </g>
    );
  };

  return (
    <Box>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
          <Box>
            <Typography variant="h4" fontWeight={700} gutterBottom sx={{
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}>
              📊 Rapports & Analytics
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Analyses visuelles avancées et insights sur vos données
            </Typography>
          </Box>
          <Stack direction="row" spacing={1}>
            <Tooltip title="Filtres">
              <IconButton sx={{ bgcolor: 'rgba(102, 126, 234, 0.1)' }}>
                <FilterListIcon />
              </IconButton>
            </Tooltip>
            <Tooltip title="Exporter">
              <IconButton sx={{ bgcolor: 'rgba(102, 126, 234, 0.1)' }}>
                <DownloadIcon />
              </IconButton>
            </Tooltip>
          </Stack>
        </Box>

        {/* View Toggle */}
        <ToggleButtonGroup
          value={chartView}
          exclusive
          onChange={(_, newView) => newView && setChartView(newView)}
          size="small"
          sx={{ bgcolor: 'background.paper', borderRadius: 2 }}
        >
          <ToggleButton value="overview" sx={{ px: 3 }}>
            <ShowChartIcon sx={{ mr: 1, fontSize: 20 }} />
            Vue d'ensemble
          </ToggleButton>
          <ToggleButton value="detailed" sx={{ px: 3 }}>
            <DonutLargeIcon sx={{ mr: 1, fontSize: 20 }} />
            Détails
          </ToggleButton>
          <ToggleButton value="comparison" sx={{ px: 3 }}>
            <CompareArrowsIcon sx={{ mr: 1, fontSize: 20 }} />
            Comparaison
          </ToggleButton>
        </ToggleButtonGroup>
      </Box>

      {/* Overview View */}
      {chartView === 'overview' && (
        <Grid container spacing={3}>
          {/* Distribution PII - Treemap */}
          <Grid item xs={12} lg={8}>
            <Card>
              <CardContent>
                <Typography variant="h6" fontWeight={600} gutterBottom>
                  Distribution hiérarchique des PII (Treemap)
                </Typography>
                <Typography variant="body2" color="text.secondary" paragraph>
                  Visualisation proportionnelle des types de données personnelles détectées
                </Typography>
                <ResponsiveContainer width="100%" height={400}>
                  <Treemap
                    data={treemapData}
                    dataKey="size"
                    aspectRatio={4 / 3}
                    stroke="#fff"
                    fill="#667eea"
                    content={<CustomTreemapContent />}
                  />
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </Grid>

          {/* Score de sécurité - Radar Chart */}
          <Grid item xs={12} lg={4}>
            <Card sx={{ height: '100%' }}>
              <CardContent>
                <Typography variant="h6" fontWeight={600} gutterBottom>
                  Score de sécurité global
                </Typography>
                <Typography variant="body2" color="text.secondary" paragraph>
                  Évaluation multi-dimensionnelle
                </Typography>
                <ResponsiveContainer width="100%" height={350}>
                  <RadarChart data={radarData}>
                    <PolarGrid stroke="#e0e0e0" />
                    <PolarAngleAxis dataKey="category" tick={{ fontSize: 12 }} />
                    <PolarRadiusAxis angle={90} domain={[0, 100]} tick={{ fontSize: 10 }} />
                    <Radar
                      name="Score"
                      dataKey="score"
                      stroke="#667eea"
                      fill="#667eea"
                      fillOpacity={0.6}
                      strokeWidth={2}
                    />
                    <RechartsTooltip
                      contentStyle={{
                        backgroundColor: 'rgba(255, 255, 255, 0.95)',
                        border: '1px solid #e0e0e0',
                        borderRadius: '8px',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                      }}
                    />
                  </RadarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </Grid>

          {/* Tendances temporelles - Area Chart */}
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Typography variant="h6" fontWeight={600} gutterBottom>
                  Évolution des détections dans le temps
                </Typography>
                <Typography variant="body2" color="text.secondary" paragraph>
                  Comparaison historique des scans effectués
                </Typography>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={trendData}>
                    <defs>
                      <linearGradient id="colorPii" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#667eea" stopOpacity={0.8}/>
                        <stop offset="95%" stopColor="#667eea" stopOpacity={0.1}/>
                      </linearGradient>
                      <linearGradient id="colorRisk" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#f44336" stopOpacity={0.8}/>
                        <stop offset="95%" stopColor="#f44336" stopOpacity={0.1}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="scan" tick={{ fontSize: 12 }} />
                    <YAxis yAxisId="left" tick={{ fontSize: 12 }} />
                    <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 12 }} />
                    <RechartsTooltip
                      contentStyle={{
                        backgroundColor: 'rgba(255, 255, 255, 0.95)',
                        border: '1px solid #e0e0e0',
                        borderRadius: '8px',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                      }}
                    />
                    <Legend />
                    <Area
                      yAxisId="left"
                      type="monotone"
                      dataKey="pii"
                      stroke="#667eea"
                      strokeWidth={3}
                      fillOpacity={1}
                      fill="url(#colorPii)"
                      name="PII détectées"
                    />
                    <Area
                      yAxisId="right"
                      type="monotone"
                      dataKey="highRisk"
                      stroke="#f44336"
                      strokeWidth={3}
                      fillOpacity={1}
                      fill="url(#colorRisk)"
                      name="Fichiers à risque élevé"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {/* Detailed View */}
      {chartView === 'detailed' && (
        <Grid container spacing={3}>
          {/* Types de PII - Bar Chart horizontal */}
          <Grid item xs={12} lg={8}>
            <Card>
              <CardContent>
                <Typography variant="h6" fontWeight={600} gutterBottom>
                  Répartition détaillée par type de PII
                </Typography>
                <ResponsiveContainer width="100%" height={500}>
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
                                {payload[0].value} détections ({payload[0].payload.percentage}%)
                              </Typography>
                            </Paper>
                          );
                        }
                        return null;
                      }}
                    />
                    <Bar dataKey="count" fill="url(#barGradient)" radius={[0, 8, 8, 0]} name="Nombre de détections" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </Grid>

          {/* Statistiques multi-dimensionnelles */}
          <Grid item xs={12} lg={4}>
            <Stack spacing={3}>
              {/* Risque */}
              <Card>
                <CardContent>
                  <Typography variant="h6" fontWeight={600} gutterBottom>
                    🎯 Niveau de risque
                  </Typography>
                  <ResponsiveContainer width="100%" height={200}>
                    <PieChart>
                      <Pie
                        data={riskData}
                        cx="50%"
                        cy="50%"
                        innerRadius={50}
                        outerRadius={80}
                        paddingAngle={2}
                        dataKey="count"
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
                  <Stack spacing={1}>
                    {riskData.map((item, index) => (
                      <Box key={index} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Box sx={{ width: 12, height: 12, borderRadius: '50%', bgcolor: item.color }} />
                          <Typography variant="body2">{item.level}</Typography>
                        </Box>
                        <Chip label={item.count} size="small" sx={{ fontWeight: 600 }} />
                      </Box>
                    ))}
                  </Stack>
                </CardContent>
              </Card>

              {/* Ancienneté */}
              <Card>
                <CardContent>
                  <Typography variant="h6" fontWeight={600} gutterBottom>
                    ⏰ Ancienneté
                  </Typography>
                  <ResponsiveContainer width="100%" height={200}>
                    <BarChart data={stalenessData.filter(d => d.count > 0)}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="level" tick={{ fontSize: 11 }} />
                      <YAxis tick={{ fontSize: 11 }} />
                      <RechartsTooltip />
                      <Bar dataKey="count" radius={[8, 8, 0, 0]}>
                        {stalenessData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </Stack>
          </Grid>

          {/* Exposition */}
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Typography variant="h6" fontWeight={600} gutterBottom>
                  🔓 Niveau d'exposition des fichiers
                </Typography>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={exposureData.filter(d => d.count > 0)}>
                    <defs>
                      {exposureData.map((entry, index) => (
                        <linearGradient key={index} id={`exposureGradient${index}`} x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor={entry.color} stopOpacity={0.8} />
                          <stop offset="100%" stopColor={entry.color} stopOpacity={0.4} />
                        </linearGradient>
                      ))}
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="level" tick={{ fontSize: 12 }} />
                    <YAxis tick={{ fontSize: 12 }} />
                    <RechartsTooltip
                      contentStyle={{
                        backgroundColor: 'rgba(255, 255, 255, 0.95)',
                        border: '1px solid #e0e0e0',
                        borderRadius: '8px',
                      }}
                    />
                    <Legend />
                    <Bar dataKey="count" radius={[8, 8, 0, 0]} name="Nombre de fichiers">
                      {exposureData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={`url(#exposureGradient${index})`} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {/* Comparison View */}
      {chartView === 'comparison' && (
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Typography variant="h6" fontWeight={600} gutterBottom>
                  Comparaison multi-scans
                </Typography>
                <Typography variant="body2" color="text.secondary" paragraph>
                  Évolution comparative des métriques clés
                </Typography>
                <ResponsiveContainer width="100%" height={400}>
                  <LineChart data={trendData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="scan" tick={{ fontSize: 12 }} />
                    <YAxis yAxisId="left" tick={{ fontSize: 12 }} />
                    <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 12 }} />
                    <RechartsTooltip
                      contentStyle={{
                        backgroundColor: 'rgba(255, 255, 255, 0.95)',
                        border: '1px solid #e0e0e0',
                        borderRadius: '8px',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                      }}
                    />
                    <Legend />
                    <Line
                      yAxisId="left"
                      type="monotone"
                      dataKey="pii"
                      stroke="#667eea"
                      strokeWidth={3}
                      dot={{ r: 6 }}
                      name="PII détectées"
                    />
                    <Line
                      yAxisId="left"
                      type="monotone"
                      dataKey="filesScanned"
                      stroke="#4facfe"
                      strokeWidth={3}
                      dot={{ r: 6 }}
                      name="Fichiers scannés"
                    />
                    <Line
                      yAxisId="right"
                      type="monotone"
                      dataKey="highRisk"
                      stroke="#f44336"
                      strokeWidth={3}
                      dot={{ r: 6 }}
                      name="Fichiers à risque élevé"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </Grid>

          {/* Cartes de comparaison */}
          <Grid item xs={12} md={4}>
            <Paper sx={{ p: 3, textAlign: 'center', border: '2px solid', borderColor: 'primary.main' }}>
              <Typography variant="h3" fontWeight={700} color="primary">
                +12%
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                Augmentation des PII détectées vs scan précédent
              </Typography>
            </Paper>
          </Grid>

          <Grid item xs={12} md={4}>
            <Paper sx={{ p: 3, textAlign: 'center', border: '2px solid', borderColor: 'error.main' }}>
              <Typography variant="h3" fontWeight={700} color="error">
                +5
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                Nouveaux fichiers à risque élevé identifiés
              </Typography>
            </Paper>
          </Grid>

          <Grid item xs={12} md={4}>
            <Paper sx={{ p: 3, textAlign: 'center', border: '2px solid', borderColor: 'success.main' }}>
              <Typography variant="h3" fontWeight={700} color="success">
                87%
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                Score de conformité global
              </Typography>
            </Paper>
          </Grid>
        </Grid>
      )}
    </Box>
  );
}
