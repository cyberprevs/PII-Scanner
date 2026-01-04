import { useNavigate } from 'react-router-dom';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Alert,
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
} from 'recharts';
import RefreshIcon from '@mui/icons-material/Refresh';
import type { ScanResultResponse } from '../../types';
import EmptyState from '../common/EmptyState';
import StatCard from '../common/StatCard';

interface ResultsProps {
  results: ScanResultResponse | null;
  onDownloadReport: (format: 'csv' | 'json' | 'html' | 'excel') => void;
  onNewScan: () => void;
}

const COLORS = ['#667eea', '#764ba2', '#f093fb', '#4facfe', '#00f2fe', '#43e97b', '#fa709a', '#fee140'];

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

export default function Results({ results, onDownloadReport, onNewScan }: ResultsProps) {
  const navigate = useNavigate();

  // Si aucun résultat, afficher un message d'accueil
  if (!results) {
    return (
      <EmptyState
        title="Bienvenue dans PII Scanner"
        description="Aucun scan récent disponible. Lancez un nouveau scan pour commencer."
        actionLabel="Nouveau Scan"
        onAction={() => navigate('/scanner')}
        actionIcon={<RefreshIcon />}
      />
    );
  }

  const { statistics, detections } = results;

  // Préparer les données pour les graphiques
  const chartData = Object.entries(statistics.piiByType).map(([type, count]) => ({
    type,
    count,
  }));

  const pieData = Object.entries(statistics.piiByType).map(([type, count]) => ({
    name: type,
    value: count,
  }));

  // Statistiques d'ancienneté (Stale Data)
  const stalenessData = [
    { level: 'Récent', count: 0, color: '#4caf50' },
    { level: '6 mois', count: 0, color: '#8bc34a' },
    { level: '1 an', count: 0, color: '#ff9800' },
    { level: '3 ans', count: 0, color: '#ff5722' },
    { level: '+5 ans', count: 0, color: '#f44336' },
  ];

  statistics.topRiskyFiles.forEach(file => {
    if (file.stalenessLevel) {
      const item = stalenessData.find(d => d.level === file.stalenessLevel);
      if (item) item.count++;
    }
  });

  // Statistiques d'exposition (Over-Exposed Data)
  const exposureData = [
    { level: 'Faible', count: 0, color: '#4caf50' },
    { level: 'Moyen', count: 0, color: '#ff9800' },
    { level: 'Élevé', count: 0, color: '#ff5722' },
    { level: 'Critique', count: 0, color: '#f44336' },
  ];

  statistics.topRiskyFiles.forEach(file => {
    if (file.exposureLevel) {
      const item = exposureData.find(d => d.level === file.exposureLevel);
      if (item) item.count++;
    }
  });

  // Statistiques de niveau de risque
  const riskData = [
    { level: 'FAIBLE', count: 0, color: '#4caf50' },
    { level: 'MOYEN', count: 0, color: '#ff9800' },
    { level: 'ÉLEVÉ', count: 0, color: '#f44336' },
  ];

  statistics.topRiskyFiles.forEach(file => {
    const item = riskData.find(d => d.level === file.riskLevel);
    if (item) item.count++;
  });

  return (
    <Box>
      {/* En-tête avec statistiques principales */}
      <Box sx={{ display: 'flex', gap: 3, mb: 4, flexWrap: 'wrap' }}>
        <StatCard
          value={statistics.totalFilesScanned}
          label="Fichiers scannés"
          gradient="linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
        />
        <StatCard
          value={statistics.filesWithPii}
          label="Fichiers avec PII"
          gradient="linear-gradient(135deg, #f093fb 0%, #f5576c 100%)"
        />
        <StatCard
          value={statistics.totalPiiFound}
          label="PII détectées"
          gradient="linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)"
        />
        <StatCard
          value={Object.keys(statistics.piiByType).length}
          label="Types de PII"
          gradient="linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)"
        />
      </Box>

      {/* Bouton d'action */}
      <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
        <Button
          variant="outlined"
          onClick={onNewScan}
          startIcon={<RefreshIcon />}
        >
          Nouveau Scan
        </Button>
      </Box>

      {/* Graphiques */}
      <Card>
        <CardContent sx={{ p: 3 }}>
            <Box>
              {/* Légende des indicateurs */}
              <Card sx={{ mb: 3, backgroundColor: '#f5f5f5' }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom fontWeight={600} sx={{ mb: 2 }}>
                    📖 Légende des indicateurs
                  </Typography>

                  <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 3 }}>
                    {/* Niveau de risque */}
                    <Box>
                      <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 1 }}>
                        🎯 Niveau de risque (basé sur le nombre de PII)
                      </Typography>
                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Chip label="FAIBLE" color="success" size="small" />
                          <Typography variant="body2">1-5 PII détectées</Typography>
                        </Box>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Chip label="MOYEN" color="warning" size="small" />
                          <Typography variant="body2">6-15 PII détectées</Typography>
                        </Box>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Chip label="ÉLEVÉ" color="error" size="small" />
                          <Typography variant="body2">16+ PII détectées</Typography>
                        </Box>
                      </Box>
                    </Box>

                    {/* Ancienneté */}
                    <Box>
                      <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 1 }}>
                        ⏰ Ancienneté (dernier accès au fichier)
                      </Typography>
                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Chip label="Récent" size="small" sx={{ backgroundColor: '#4caf50', color: 'white' }} />
                          <Typography variant="body2">Moins de 6 mois</Typography>
                        </Box>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Chip label="6 mois" size="small" sx={{ backgroundColor: '#8bc34a', color: 'white' }} />
                          <Typography variant="body2">6 mois - 1 an</Typography>
                        </Box>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Chip label="1 an" size="small" sx={{ backgroundColor: '#ff9800', color: 'white' }} />
                          <Typography variant="body2">1 an - 3 ans</Typography>
                        </Box>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Chip label="3 ans" size="small" sx={{ backgroundColor: '#ff5722', color: 'white' }} />
                          <Typography variant="body2">3 ans - 5 ans</Typography>
                        </Box>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Chip label="+5 ans" size="small" sx={{ backgroundColor: '#f44336', color: 'white' }} />
                          <Typography variant="body2">Plus de 5 ans</Typography>
                        </Box>
                      </Box>
                    </Box>

                    {/* Exposition */}
                    <Box>
                      <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 1 }}>
                        🔓 Exposition (permissions d'accès Windows)
                      </Typography>
                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Chip label="Faible" color="success" size="small" />
                          <Typography variant="body2">Moins de 5 groupes</Typography>
                        </Box>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Chip label="Moyen" color="warning" size="small" />
                          <Typography variant="body2">5-10 groupes</Typography>
                        </Box>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Chip label="Élevé" color="warning" size="small" />
                          <Typography variant="body2">10+ groupes ou Authenticated Users</Typography>
                        </Box>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Chip label="Critique" color="error" size="small" />
                          <Typography variant="body2">Everyone ou partage réseau public</Typography>
                        </Box>
                      </Box>
                    </Box>
                  </Box>
                </CardContent>
              </Card>

              {/* Graphiques */}
              <Box sx={{ display: 'flex', gap: 3, flexWrap: 'wrap' }}>
                <Box sx={{ flex: '2 1 500px', minWidth: 0 }}>
                  <Typography variant="h6" gutterBottom fontWeight={600}>
                    Répartition par type de PII
                  </Typography>
                  <ResponsiveContainer width="100%" height={350}>
                    <BarChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="type" angle={-45} textAnchor="end" height={100} />
                      <YAxis />
                      <RechartsTooltip />
                      <Legend />
                      <Bar dataKey="count" fill="#667eea" name="Nombre de PII" />
                    </BarChart>
                  </ResponsiveContainer>
                </Box>
                <Box sx={{ flex: '1 1 300px', minWidth: 0 }}>
                  <Typography variant="h6" gutterBottom fontWeight={600}>
                    Distribution
                  </Typography>
                  <ResponsiveContainer width="100%" height={350}>
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={(entry) => entry.name}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {pieData.map((_entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <RechartsTooltip />
                  </PieChart>
                </ResponsiveContainer>
              </Box>
            </Box>

              {/* Nouveaux graphiques : Ancienneté et Exposition */}
              <Box sx={{ display: 'flex', gap: 3, flexWrap: 'wrap', mt: 3 }}>
                {/* Graphique Niveau de Risque */}
                <Box sx={{ flex: '1 1 400px', minWidth: 0 }}>
                  <Typography variant="h6" gutterBottom fontWeight={600}>
                    🎯 Niveau de risque des fichiers
                  </Typography>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={riskData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="level" />
                      <YAxis />
                      <RechartsTooltip />
                      <Legend />
                      <Bar dataKey="count" name="Nombre de fichiers" radius={[8, 8, 0, 0]}>
                        {riskData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </Box>

                {/* Graphique Ancienneté (Stale Data) */}
                <Box sx={{ flex: '1 1 400px', minWidth: 0 }}>
                  <Typography variant="h6" gutterBottom fontWeight={600}>
                    ⏰ Ancienneté des fichiers (Stale Data)
                  </Typography>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={stalenessData.filter(d => d.count > 0)}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="level" />
                      <YAxis />
                      <RechartsTooltip />
                      <Legend />
                      <Bar dataKey="count" name="Nombre de fichiers" radius={[8, 8, 0, 0]}>
                        {stalenessData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </Box>

                {/* Graphique Exposition (Over-Exposed Data) */}
                <Box sx={{ flex: '1 1 400px', minWidth: 0 }}>
                  <Typography variant="h6" gutterBottom fontWeight={600}>
                    🔓 Niveau d'exposition (Over-Exposed Data)
                  </Typography>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={exposureData.filter(d => d.count > 0)}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="level" />
                      <YAxis />
                      <RechartsTooltip />
                      <Legend />
                      <Bar dataKey="count" name="Nombre de fichiers" radius={[8, 8, 0, 0]}>
                        {exposureData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </Box>
              </Box>
            </Box>
        </CardContent>
      </Card>
    </Box>
  );
}
