import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Paper,
  Chip,
  Button,
  Divider,
  Stack,
  IconButton,
  Tooltip,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import {
  FolderOpen as FolderOpenIcon,
  Security as SecurityIcon,
  Warning as WarningIcon,
  CheckCircle as CheckCircleIcon,
  Refresh as RefreshIcon,
  ArrowForward as ArrowForwardIcon,
  TrendingUp as TrendingUpIcon,
  LockOpen as LockOpenIcon,
  Category as CategoryIcon,
  Analytics as AnalyticsIcon,
  Assessment as AssessmentIcon,
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
} from 'recharts';
import { useNavigate } from 'react-router-dom';
import type { ScanResultResponse } from '../../types';
import StatCard from '../common/StatCard';
import EmptyState from '../common/EmptyState';
import PageHeader from '../common/PageHeader';
import { glassCardSx, getRechartsTooltipStyle, tokens } from '../../theme/designSystem';

interface DashboardProps {
  results: ScanResultResponse | null;
}

const DONUT_COLORS = ['#00E599', '#3B82F6', '#F0A000', '#F45252', '#A78BFA', '#EC4899', '#06B6D4', '#84CC16'];

function RiskBar({
  label,
  count,
  total,
  color,
  mutedColor,
}: {
  label: string;
  count: number;
  total: number;
  color: string;
  mutedColor: string;
}) {
  const pct = total > 0 ? Math.round((count / total) * 100) : 0;
  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.75 }}>
        <Typography variant="body2" fontWeight={500}>
          {label}
        </Typography>
        <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
          <Typography variant="body2" fontWeight={700} sx={{ color }}>
            {count}
          </Typography>
          <Typography variant="caption" color="text.disabled">
            {pct}%
          </Typography>
        </Box>
      </Box>
      <Box
        sx={{
          height: 6,
          borderRadius: 3,
          bgcolor: mutedColor,
          overflow: 'hidden',
        }}
      >
        <Box
          sx={{
            height: '100%',
            width: `${pct}%`,
            background: `linear-gradient(90deg, ${color}, ${color}cc)`,
            borderRadius: 3,
            transition: 'width 0.6s ease',
          }}
        />
      </Box>
    </Box>
  );
}

export default function Dashboard({ results }: DashboardProps) {
  const navigate = useNavigate();
  const theme = useTheme();
  const dark = theme.palette.mode === 'dark';
  const c = tokens.colors;

  if (!results) {
    return (
      <Box>
        <PageHeader
          title="Tableau de bord"
          subtitle="Vue d'ensemble de la sécurité de vos données personnelles"
          titleGradient
          actions={
            <Button
              variant="contained"
              startIcon={<FolderOpenIcon />}
              onClick={() => navigate('/scanner')}
              sx={{
                background: 'linear-gradient(135deg, #00E599 0%, #00B876 100%)',
                '&:hover': { background: 'linear-gradient(135deg, #00CC88 0%, #00A86B 100%)' },
              }}
            >
              Nouveau scan
            </Button>
          }
        />
        <EmptyState
          icon={<SecurityIcon />}
          title="Aucun scan disponible"
          description="Lancez votre premier scan pour détecter les données personnelles (PII) dans vos fichiers."
          hint="Appuyez sur Ctrl+S depuis la page Scanner pour démarrer rapidement"
          actionLabel="Démarrer un nouveau scan"
          onAction={() => navigate('/scanner')}
          actionIcon={<FolderOpenIcon />}
        />
      </Box>
    );
  }

  const { statistics } = results;

  const donutData = Object.entries(statistics.piiByType)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 8);

  const totalPii = Object.values(statistics.piiByType).reduce((sum, count) => sum + count, 0);

  const trendData = [
    { name: 'Scan 1', pii: 156 },
    { name: 'Scan 2', pii: 243 },
    { name: 'Scan 3', pii: 198 },
    { name: 'Scan 4', pii: 287 },
    { name: 'Actuel', pii: totalPii },
  ];
  const sparklinePii = [156, 243, 198, 287, totalPii];

  const highRiskFiles = statistics.topRiskyFiles.filter(f => f.riskLevel === 'ÉLEVÉ').length;
  const mediumRiskFiles = statistics.topRiskyFiles.filter(f => f.riskLevel === 'MOYEN').length;
  const lowRiskFiles = statistics.topRiskyFiles.filter(f => f.riskLevel === 'FAIBLE').length;
  const totalRiskFiles = statistics.topRiskyFiles.length || 1;

  // KPI 1 — Fichiers exposés : PII accessibles à tous (Everyone / partage réseau)
  const exposedFiles = results.detections
    .filter(d => d.accessibleToEveryone || d.exposureLevel === 'PUBLIC')
    .map(d => d.filePath)
    .filter((v, i, a) => a.indexOf(v) === i).length;

  // KPI 2 — % fichiers sans PII (taux de fichiers "propres")
  const cleanFilesPct = statistics.totalFilesScanned > 0
    ? Math.round(((statistics.totalFilesScanned - statistics.filesWithPii) / statistics.totalFilesScanned) * 100)
    : 100;

  // KPI 3 — Types de PII distincts détectés (surface d'exposition)
  const piiTypeCount = Object.keys(statistics.piiByType).length;

  // KPI 4 — Densité PII : moyenne par fichier contaminé
  const piiDensity = statistics.filesWithPii > 0
    ? Math.round((statistics.totalPiiFound / statistics.filesWithPii) * 10) / 10
    : 0;

  const axisStyle = { fontSize: 12, fill: dark ? c.textTertiary : c.light.textTertiary };

  return (
    <Box>
      <PageHeader
        title="Tableau de bord"
        subtitle="Vue d'ensemble de la sécurité de vos données"
        titleGradient
        actions={
          <>
            <Tooltip title="Actualiser">
              <IconButton
                onClick={() => window.location.reload()}
                sx={{ bgcolor: c.accentPrimaryMuted, '&:hover': { bgcolor: 'rgba(0,229,153,0.2)' } }}
              >
                <RefreshIcon />
              </IconButton>
            </Tooltip>
            <Button
              variant="contained"
              startIcon={<FolderOpenIcon />}
              onClick={() => navigate('/scanner')}
              sx={{
                background: 'linear-gradient(135deg, #00E599 0%, #00B876 100%)',
                '&:hover': { background: 'linear-gradient(135deg, #00CC88 0%, #00A86B 100%)' },
              }}
            >
              Nouveau scan
            </Button>
          </>
        }
      />

      {/* KPI Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {/* KPI 1 — Total PII */}
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard
            topBorderOnly
            accentColor={c.danger}
            value={totalPii.toLocaleString()}
            label="PII détectées"
            icon={<SecurityIcon />}
            subtext={`dans ${statistics.filesWithPii} fichier(s)`}
            sparkline={sparklinePii}
          />
        </Grid>

        {/* KPI 2 — Fichiers exposés publiquement */}
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard
            topBorderOnly
            accentColor={exposedFiles > 0 ? c.danger : c.accentPrimary}
            value={exposedFiles}
            label="Fichiers exposés"
            icon={<LockOpenIcon />}
            subtext={exposedFiles > 0 ? 'PII accessibles à tous — action requise' : 'Aucune exposition publique détectée'}
            trend={exposedFiles > 0 ? { direction: 'up', value: `${exposedFiles} exposition(s)` } : undefined}
          />
        </Grid>

        {/* KPI 3 — Types PII distincts */}
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard
            topBorderOnly
            accentColor={c.warning}
            value={piiTypeCount}
            label="Types de PII distincts"
            icon={<CategoryIcon />}
            subtext="Catégories de données personnelles exposées"
          />
        </Grid>

        {/* KPI 4 — Fichiers sans PII */}
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard
            topBorderOnly
            accentColor={cleanFilesPct >= 80 ? c.accentPrimary : c.warning}
            value={`${cleanFilesPct}%`}
            label="Fichiers sans PII"
            icon={<CheckCircleIcon />}
            subtext={`${statistics.totalFilesScanned - statistics.filesWithPii} fichier(s) propres sur ${statistics.totalFilesScanned}`}
          />
        </Grid>
      </Grid>

      {/* KPI Row 2 — Densité & Risques */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {/* KPI 5 — Densité PII */}
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard
            topBorderOnly
            accentColor={piiDensity > 10 ? c.danger : piiDensity > 5 ? c.warning : c.accentPrimary}
            value={piiDensity.toLocaleString()}
            label="Densité PII moy."
            icon={<AnalyticsIcon />}
            subtext="PII par fichier contaminé"
          />
        </Grid>

        {/* KPI 6 — Fichiers à risque élevé */}
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard
            topBorderOnly
            accentColor={highRiskFiles > 0 ? c.danger : c.accentPrimary}
            value={highRiskFiles}
            label="Risque élevé"
            icon={<WarningIcon />}
            subtext="Nécessitent une action immédiate"
            trend={highRiskFiles > 0 ? { direction: 'up', value: `${highRiskFiles} fichier(s)` } : undefined}
          />
        </Grid>

        {/* KPI 7 — Risque moyen */}
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard
            topBorderOnly
            accentColor={mediumRiskFiles > 0 ? c.warning : c.accentPrimary}
            value={mediumRiskFiles}
            label="Risque moyen"
            icon={<WarningIcon />}
            subtext="À traiter sous 30 jours"
          />
        </Grid>

        {/* KPI 8 — Fichiers scannés */}
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard
            topBorderOnly
            accentColor={c.info}
            value={statistics.totalFilesScanned.toLocaleString()}
            label="Fichiers analysés"
            icon={<FolderOpenIcon />}
            subtext={`Périmètre du scan`}
          />
        </Grid>
      </Grid>

      {/* Charts Row */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {/* Donut Chart */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Card sx={{ height: '100%', ...glassCardSx(dark) }}>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h6" fontWeight={600}>
                  Distribution des PII
                </Typography>
                <Chip
                  label={`${Object.keys(statistics.piiByType).length} types`}
                  size="small"
                  sx={{ bgcolor: c.accentPrimaryMuted, color: c.accentPrimary, fontWeight: 600 }}
                />
              </Box>

              <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                <Box sx={{ flex: '0 0 200px' }}>
                  <ResponsiveContainer width="100%" height={200}>
                    <PieChart>
                      <Pie
                        data={donutData}
                        cx="50%"
                        cy="50%"
                        innerRadius={70}
                        outerRadius={95}
                        paddingAngle={2}
                        dataKey="value"
                        animationBegin={0}
                        animationDuration={800}
                        isAnimationActive
                      >
                        {donutData.map((_, index) => (
                          <Cell key={`cell-${index}`} fill={DONUT_COLORS[index % DONUT_COLORS.length]} />
                        ))}
                      </Pie>
                      <RechartsTooltip contentStyle={getRechartsTooltipStyle(dark)} />
                    </PieChart>
                  </ResponsiveContainer>
                </Box>

                {/* Custom floating legend */}
                <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 0.75 }}>
                  {donutData.slice(0, 6).map((entry, index) => (
                    <Box key={entry.name} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Box
                        sx={{
                          width: 8,
                          height: 8,
                          borderRadius: '50%',
                          bgcolor: DONUT_COLORS[index % DONUT_COLORS.length],
                          flexShrink: 0,
                        }}
                      />
                      <Typography
                        variant="caption"
                        sx={{
                          color: 'text.secondary',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                          flex: 1,
                        }}
                      >
                        {entry.name.length > 18 ? entry.name.substring(0, 18) + '…' : entry.name}
                      </Typography>
                      <Typography variant="caption" fontWeight={600} color="text.primary">
                        {entry.value}
                      </Typography>
                    </Box>
                  ))}
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Area Chart */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Card sx={{ height: '100%', ...glassCardSx(dark) }}>
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
              <ResponsiveContainer width="100%" height={220}>
                <AreaChart data={trendData}>
                  <defs>
                    <linearGradient id="colorPii" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#00E599" stopOpacity={0.8} />
                      <stop offset="95%" stopColor="#00E599" stopOpacity={0.05} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid
                    horizontal={true}
                    vertical={false}
                    stroke={dark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.04)'}
                  />
                  <XAxis dataKey="name" tick={axisStyle} axisLine={false} tickLine={false} />
                  <YAxis tick={axisStyle} axisLine={false} tickLine={false} />
                  <RechartsTooltip contentStyle={getRechartsTooltipStyle(dark)} />
                  <Area
                    type="monotone"
                    dataKey="pii"
                    stroke="#00E599"
                    strokeWidth={2.5}
                    fillOpacity={1}
                    fill="url(#colorPii)"
                    name="PII détectées"
                    animationBegin={0}
                    animationDuration={1200}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Risk Distribution & Top Files */}
      <Grid container spacing={3}>
        {/* Risk bars */}
        <Grid size={{ xs: 12, md: 4 }}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Typography variant="h6" fontWeight={600} gutterBottom>
                Répartition des risques
              </Typography>
              <Stack spacing={2.5} sx={{ mt: 3 }}>
                <RiskBar
                  label="Risque élevé"
                  count={highRiskFiles}
                  total={totalRiskFiles}
                  color={c.danger}
                  mutedColor={c.dangerMuted}
                />
                <RiskBar
                  label="Risque moyen"
                  count={mediumRiskFiles}
                  total={totalRiskFiles}
                  color={c.warning}
                  mutedColor={c.warningMuted}
                />
                <RiskBar
                  label="Risque faible"
                  count={lowRiskFiles}
                  total={totalRiskFiles}
                  color={c.success}
                  mutedColor={c.successMuted}
                />
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

        {/* Critical files */}
        <Grid size={{ xs: 12, md: 8 }}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h6" fontWeight={600}>
                  Fichiers critiques
                </Typography>
                <Chip
                  label={`Top ${Math.min(5, statistics.topRiskyFiles.length)}`}
                  size="small"
                  sx={{ bgcolor: c.dangerMuted, color: c.danger, fontWeight: 600 }}
                />
              </Box>

              <Stack spacing={1.5}>
                {statistics.topRiskyFiles
                  .filter(f => f.riskLevel === 'ÉLEVÉ')
                  .slice(0, 5)
                  .map((file, index) => (
                    <Paper
                      key={index}
                      sx={{
                        p: 2,
                        border: '1px solid',
                        borderColor: 'rgba(244, 82, 82, 0.25)',
                        borderRadius: 2,
                        bgcolor: c.dangerMuted,
                        transition: 'all 0.2s',
                        position: 'relative',
                        overflow: 'hidden',
                        '&:hover': {
                          borderColor: c.danger,
                          transform: 'translateY(-1px)',
                        },
                      }}
                    >
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <Box sx={{ flex: 1, minWidth: 0, mr: 2 }}>
                          <Typography
                            variant="body2"
                            fontWeight={600}
                            sx={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', mb: 0.5 }}
                          >
                            {file.filePath.split('\\').pop() || file.filePath.split('/').pop() || file.filePath}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {file.piiCount} PII détectées
                          </Typography>
                        </Box>
                        <Stack direction="row" spacing={1}>
                          <Chip label={file.riskLevel} size="small" color="error" sx={{ fontWeight: 600 }} />
                          {file.stalenessLevel && (
                            <Chip
                              label={file.stalenessLevel}
                              size="small"
                              sx={{ bgcolor: c.warningMuted, color: c.warning, fontWeight: 600 }}
                            />
                          )}
                        </Stack>
                      </Box>
                      {/* micro bar at bottom */}
                      <Box
                        sx={{
                          position: 'absolute',
                          bottom: 0,
                          left: 0,
                          height: 2,
                          width: `${Math.min((file.piiCount / 50) * 100, 100)}%`,
                          bgcolor: c.danger,
                          opacity: 0.35,
                        }}
                      />
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
                    background: 'linear-gradient(135deg, #00E599 0%, #00B876 100%)',
                    '&:hover': { background: 'linear-gradient(135deg, #00CC88 0%, #00A86B 100%)' },
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
