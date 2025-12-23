import { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Paper,
  Chip,
  LinearProgress,
  Button,
  Divider,
  Stack,
  IconButton,
  Tooltip,
} from '@mui/material';
import {
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  FolderOpen as FolderOpenIcon,
  Security as SecurityIcon,
  Warning as WarningIcon,
  CheckCircle as CheckCircleIcon,
  Schedule as ScheduleIcon,
  Assessment as AssessmentIcon,
  Refresh as RefreshIcon,
  ArrowForward as ArrowForwardIcon,
} from '@mui/icons-material';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  Legend,
} from 'recharts';
import { useNavigate } from 'react-router-dom';
import { scanApi } from '../../services/apiClient';
import type { ScanResultResponse } from '../../types';

interface DashboardProps {
  results: ScanResultResponse | null;
}

const COLORS = {
  primary: '#667eea',
  secondary: '#764ba2',
  success: '#4caf50',
  warning: '#ff9800',
  error: '#f44336',
  info: '#2196f3',
};

const DONUT_COLORS = ['#667eea', '#764ba2', '#f093fb', '#4facfe', '#00f2fe', '#43e97b', '#fa709a', '#fee140'];

export default function Dashboard({ results }: DashboardProps) {
  const navigate = useNavigate();
  const [latestScans, setLatestScans] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Simuler le chargement des derniers scans (à implémenter avec votre API)
    const mockScans = [
      { id: '1', date: new Date(Date.now() - 1000 * 60 * 30).toISOString(), filesScanned: 1543, piiFound: 287, status: 'completed' },
      { id: '2', date: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(), filesScanned: 892, piiFound: 156, status: 'completed' },
      { id: '3', date: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(), filesScanned: 2341, piiFound: 432, status: 'completed' },
    ];
    setLatestScans(mockScans);
  }, []);

  if (!results) {
    return (
      <Box>
        {/* Header */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="h4" fontWeight={700} gutterBottom sx={{
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}>
            Tableau de bord
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Vue d'ensemble de la sécurité de vos données personnelles
          </Typography>
        </Box>

        {/* Empty State */}
        <Card sx={{
          textAlign: 'center',
          py: 8,
          background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.05) 0%, rgba(118, 75, 162, 0.05) 100%)',
        }}>
          <CardContent>
            <Box sx={{ mb: 3 }}>
              <SecurityIcon sx={{ fontSize: 80, color: 'primary.main', opacity: 0.5 }} />
            </Box>
            <Typography variant="h5" fontWeight={600} gutterBottom>
              Aucun scan disponible
            </Typography>
            <Typography variant="body1" color="text.secondary" paragraph sx={{ maxWidth: 500, mx: 'auto', mb: 4 }}>
              Lancez votre premier scan pour détecter les données personnelles (PII) dans vos fichiers et obtenir une vue d'ensemble complète.
            </Typography>
            <Button
              variant="contained"
              size="large"
              startIcon={<FolderOpenIcon />}
              onClick={() => navigate('/scanner')}
              sx={{
                px: 4,
                py: 1.5,
                fontSize: '1rem',
                fontWeight: 600,
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                '&:hover': {
                  background: 'linear-gradient(135deg, #5568d3 0%, #653a8b 100%)',
                },
              }}
            >
              Démarrer un nouveau scan
            </Button>
          </CardContent>
        </Card>
      </Box>
    );
  }

  const { statistics } = results;

  // Préparer les données pour le donut chart
  const donutData = Object.entries(statistics.piiByType)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 8);

  // Calculer le total de PII
  const totalPii = Object.values(statistics.piiByType).reduce((sum, count) => sum + count, 0);

  // Données pour le graphique de tendance (simulé)
  const trendData = [
    { name: 'Scan 1', pii: 156 },
    { name: 'Scan 2', pii: 243 },
    { name: 'Scan 3', pii: 198 },
    { name: 'Scan 4', pii: 287 },
    { name: 'Actuel', pii: totalPii },
  ];

  // Calculer les statistiques de risque
  const highRiskFiles = statistics.topRiskyFiles.filter(f => f.riskLevel === 'ÉLEVÉ').length;
  const mediumRiskFiles = statistics.topRiskyFiles.filter(f => f.riskLevel === 'MOYEN').length;
  const lowRiskFiles = statistics.topRiskyFiles.filter(f => f.riskLevel === 'FAIBLE').length;

  return (
    <Box>
      {/* Header */}
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box>
          <Typography variant="h4" fontWeight={700} gutterBottom sx={{
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}>
            Tableau de bord
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Vue d'ensemble de la sécurité de vos données
          </Typography>
        </Box>
        <Stack direction="row" spacing={2}>
          <Tooltip title="Actualiser">
            <IconButton
              onClick={() => window.location.reload()}
              sx={{
                bgcolor: 'rgba(102, 126, 234, 0.1)',
                '&:hover': { bgcolor: 'rgba(102, 126, 234, 0.2)' },
              }}
            >
              <RefreshIcon />
            </IconButton>
          </Tooltip>
          <Button
            variant="contained"
            startIcon={<FolderOpenIcon />}
            onClick={() => navigate('/scanner')}
            sx={{
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              '&:hover': {
                background: 'linear-gradient(135deg, #5568d3 0%, #653a8b 100%)',
              },
            }}
          >
            Nouveau scan
          </Button>
        </Stack>
      </Box>

      {/* KPI Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {/* Total PII détectées */}
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{
            height: '100%',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: 'white',
            position: 'relative',
            overflow: 'hidden',
            '&::before': {
              content: '""',
              position: 'absolute',
              top: 0,
              right: 0,
              width: '150px',
              height: '150px',
              background: 'rgba(255, 255, 255, 0.1)',
              borderRadius: '50%',
              transform: 'translate(50%, -50%)',
            },
          }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <SecurityIcon sx={{ fontSize: 40, mr: 1.5, opacity: 0.9 }} />
                <Typography variant="body2" fontWeight={500} sx={{ opacity: 0.9 }}>
                  Total PII
                </Typography>
              </Box>
              <Typography variant="h3" fontWeight={700} gutterBottom>
                {totalPii.toLocaleString()}
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <TrendingUpIcon sx={{ fontSize: 20 }} />
                <Typography variant="body2" sx={{ opacity: 0.9 }}>
                  +12% vs dernier scan
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Fichiers scannés */}
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <FolderOpenIcon sx={{ fontSize: 40, mr: 1.5, color: 'info.main' }} />
                <Typography variant="body2" fontWeight={500} color="text.secondary">
                  Fichiers scannés
                </Typography>
              </Box>
              <Typography variant="h3" fontWeight={700} gutterBottom>
                {statistics.totalFilesScanned.toLocaleString()}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {statistics.filesWithPii.toLocaleString()} contiennent des PII
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* Fichiers à risque élevé */}
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <WarningIcon sx={{ fontSize: 40, mr: 1.5, color: 'error.main' }} />
                <Typography variant="body2" fontWeight={500} color="text.secondary">
                  Risque élevé
                </Typography>
              </Box>
              <Typography variant="h3" fontWeight={700} gutterBottom color="error.main">
                {highRiskFiles}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Nécessitent une attention immédiate
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* Taux de conformité */}
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <CheckCircleIcon sx={{ fontSize: 40, mr: 1.5, color: 'success.main' }} />
                <Typography variant="body2" fontWeight={500} color="text.secondary">
                  Conformité
                </Typography>
              </Box>
              <Typography variant="h3" fontWeight={700} gutterBottom color="success.main">
                {Math.round((1 - highRiskFiles / statistics.totalFilesScanned) * 100)}%
              </Typography>
              <LinearProgress
                variant="determinate"
                value={Math.round((1 - highRiskFiles / statistics.totalFilesScanned) * 100)}
                sx={{
                  height: 8,
                  borderRadius: 4,
                  bgcolor: 'rgba(76, 175, 80, 0.1)',
                  '& .MuiLinearProgress-bar': {
                    borderRadius: 4,
                    bgcolor: 'success.main',
                  },
                }}
              />
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Charts Row */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {/* Distribution des PII (Donut Chart) */}
        <Grid item xs={12} md={6}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h6" fontWeight={600}>
                  Distribution des PII
                </Typography>
                <Chip
                  label={`${Object.keys(statistics.piiByType).length} types`}
                  size="small"
                  sx={{ bgcolor: 'rgba(102, 126, 234, 0.1)', color: 'primary.main', fontWeight: 600 }}
                />
              </Box>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={donutData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={2}
                    dataKey="value"
                  >
                    {donutData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={DONUT_COLORS[index % DONUT_COLORS.length]} />
                    ))}
                  </Pie>
                  <RechartsTooltip
                    contentStyle={{
                      backgroundColor: 'rgba(255, 255, 255, 0.95)',
                      border: '1px solid #e0e0e0',
                      borderRadius: '8px',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                    }}
                  />
                  <Legend
                    verticalAlign="bottom"
                    height={36}
                    iconType="circle"
                    formatter={(value) => value.length > 20 ? value.substring(0, 20) + '...' : value}
                  />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>

        {/* Tendance des détections (Area Chart) */}
        <Grid item xs={12} md={6}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h6" fontWeight={600}>
                  Évolution des détections
                </Typography>
                <Chip
                  icon={<TrendingUpIcon />}
                  label="+12%"
                  size="small"
                  color="success"
                  sx={{ fontWeight: 600 }}
                />
              </Box>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={trendData}>
                  <defs>
                    <linearGradient id="colorPii" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#667eea" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#667eea" stopOpacity={0.1}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis
                    dataKey="name"
                    tick={{ fontSize: 12 }}
                    stroke="#999"
                  />
                  <YAxis
                    tick={{ fontSize: 12 }}
                    stroke="#999"
                  />
                  <RechartsTooltip
                    contentStyle={{
                      backgroundColor: 'rgba(255, 255, 255, 0.95)',
                      border: '1px solid #e0e0e0',
                      borderRadius: '8px',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="pii"
                    stroke="#667eea"
                    strokeWidth={3}
                    fillOpacity={1}
                    fill="url(#colorPii)"
                    name="PII détectées"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Risk Distribution & Top Files */}
      <Grid container spacing={3}>
        {/* Répartition des risques */}
        <Grid item xs={12} md={4}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Typography variant="h6" fontWeight={600} gutterBottom>
                Répartition des risques
              </Typography>
              <Stack spacing={2} sx={{ mt: 3 }}>
                <Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="body2" fontWeight={500}>Risque élevé</Typography>
                    <Typography variant="body2" fontWeight={700} color="error.main">
                      {highRiskFiles}
                    </Typography>
                  </Box>
                  <LinearProgress
                    variant="determinate"
                    value={(highRiskFiles / statistics.topRiskyFiles.length) * 100}
                    sx={{
                      height: 8,
                      borderRadius: 4,
                      bgcolor: 'rgba(244, 67, 54, 0.1)',
                      '& .MuiLinearProgress-bar': {
                        borderRadius: 4,
                        background: 'linear-gradient(90deg, #f44336 0%, #e53935 100%)',
                      },
                    }}
                  />
                </Box>

                <Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="body2" fontWeight={500}>Risque moyen</Typography>
                    <Typography variant="body2" fontWeight={700} color="warning.main">
                      {mediumRiskFiles}
                    </Typography>
                  </Box>
                  <LinearProgress
                    variant="determinate"
                    value={(mediumRiskFiles / statistics.topRiskyFiles.length) * 100}
                    sx={{
                      height: 8,
                      borderRadius: 4,
                      bgcolor: 'rgba(255, 152, 0, 0.1)',
                      '& .MuiLinearProgress-bar': {
                        borderRadius: 4,
                        background: 'linear-gradient(90deg, #ff9800 0%, #fb8c00 100%)',
                      },
                    }}
                  />
                </Box>

                <Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="body2" fontWeight={500}>Risque faible</Typography>
                    <Typography variant="body2" fontWeight={700} color="success.main">
                      {lowRiskFiles}
                    </Typography>
                  </Box>
                  <LinearProgress
                    variant="determinate"
                    value={(lowRiskFiles / statistics.topRiskyFiles.length) * 100}
                    sx={{
                      height: 8,
                      borderRadius: 4,
                      bgcolor: 'rgba(76, 175, 80, 0.1)',
                      '& .MuiLinearProgress-bar': {
                        borderRadius: 4,
                        background: 'linear-gradient(90deg, #4caf50 0%, #43a047 100%)',
                      },
                    }}
                  />
                </Box>
              </Stack>

              <Divider sx={{ my: 3 }} />

              <Button
                fullWidth
                variant="outlined"
                endIcon={<ArrowForwardIcon />}
                onClick={() => navigate('/risky-files')}
                sx={{ fontWeight: 600 }}
              >
                Voir tous les fichiers à risque
              </Button>
            </CardContent>
          </Card>
        </Grid>

        {/* Fichiers critiques */}
        <Grid item xs={12} md={8}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h6" fontWeight={600}>
                  Fichiers critiques
                </Typography>
                <Chip
                  label={`Top ${Math.min(5, statistics.topRiskyFiles.length)}`}
                  size="small"
                  sx={{ bgcolor: 'rgba(244, 67, 54, 0.1)', color: 'error.main', fontWeight: 600 }}
                />
              </Box>

              <Stack spacing={2}>
                {statistics.topRiskyFiles
                  .filter(f => f.riskLevel === 'ÉLEVÉ')
                  .slice(0, 5)
                  .map((file, index) => (
                    <Paper
                      key={index}
                      sx={{
                        p: 2,
                        border: '1px solid',
                        borderColor: 'error.main',
                        borderRadius: 2,
                        bgcolor: 'rgba(244, 67, 54, 0.05)',
                        transition: 'all 0.2s',
                        '&:hover': {
                          bgcolor: 'rgba(244, 67, 54, 0.1)',
                          boxShadow: 2,
                        },
                      }}
                    >
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <Box sx={{ flex: 1, minWidth: 0, mr: 2 }}>
                          <Typography
                            variant="body2"
                            fontWeight={600}
                            sx={{
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap',
                              mb: 0.5,
                            }}
                          >
                            {file.fileName.split('\\').pop() || file.fileName}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {file.piiCount} PII détectées
                          </Typography>
                        </Box>
                        <Stack direction="row" spacing={1}>
                          <Chip
                            label={file.riskLevel}
                            size="small"
                            color="error"
                            sx={{ fontWeight: 600 }}
                          />
                          {file.stalenessLevel && (
                            <Chip
                              label={file.stalenessLevel}
                              size="small"
                              sx={{
                                bgcolor: 'rgba(255, 152, 0, 0.1)',
                                color: 'warning.main',
                                fontWeight: 600,
                              }}
                            />
                          )}
                        </Stack>
                      </Box>
                    </Paper>
                  ))}

                {statistics.topRiskyFiles.filter(f => f.riskLevel === 'ÉLEVÉ').length === 0 && (
                  <Box sx={{ textAlign: 'center', py: 4 }}>
                    <CheckCircleIcon sx={{ fontSize: 48, color: 'success.main', mb: 2 }} />
                    <Typography variant="body2" color="text.secondary">
                      Aucun fichier à risque élevé détecté
                    </Typography>
                  </Box>
                )}
              </Stack>

              <Divider sx={{ my: 3 }} />

              <Box sx={{ display: 'flex', gap: 2 }}>
                <Button
                  variant="outlined"
                  endIcon={<ArrowForwardIcon />}
                  onClick={() => navigate('/detections')}
                  sx={{ flex: 1, fontWeight: 600 }}
                >
                  Voir les détections
                </Button>
                <Button
                  variant="contained"
                  endIcon={<AssessmentIcon />}
                  onClick={() => navigate('/reports')}
                  sx={{
                    flex: 1,
                    fontWeight: 600,
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    '&:hover': {
                      background: 'linear-gradient(135deg, #5568d3 0%, #653a8b 100%)',
                    },
                  }}
                >
                  Rapports détaillés
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}
