import { useState } from 'react';
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
  Tabs,
  Tab,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
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
import DescriptionIcon from '@mui/icons-material/Description';
import DataObjectIcon from '@mui/icons-material/DataObject';
import CodeIcon from '@mui/icons-material/Code';
import TableChartIcon from '@mui/icons-material/TableChart';
import type { ScanResultResponse } from '../../types';

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
  const [activeTab, setActiveTab] = useState(0);
  const [stalenessFilter, setStalenessFilter] = useState<string>('all');
  const [exposureFilter, setExposureFilter] = useState<string>('all');

  // Si aucun résultat, afficher un message d'accueil
  if (!results) {
    return (
      <Box sx={{ p: 3 }}>
        <Card sx={{ textAlign: 'center', py: 8 }}>
          <CardContent>
            <Typography variant="h4" gutterBottom fontWeight={600}>
              Bienvenue dans PII Scanner
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
              Aucun scan récent disponible. Lancez un nouveau scan pour commencer.
            </Typography>
            <Button
              variant="contained"
              size="large"
              onClick={() => navigate('/scanner')}
              startIcon={<RefreshIcon />}
            >
              Nouveau Scan
            </Button>
          </CardContent>
        </Card>
      </Box>
    );
  }

  const { statistics, detections } = results;

  // Filtrer les fichiers par ancienneté et exposition
  const filteredRiskyFiles = statistics.topRiskyFiles.filter(file => {
    const matchesStaleness = stalenessFilter === 'all' || file.stalenessLevel === stalenessFilter;
    const matchesExposure = exposureFilter === 'all' || file.exposureLevel === exposureFilter;
    return matchesStaleness && matchesExposure;
  });

  // Filtrer les détections par ancienneté
  const filteredDetections = detections.filter(detection => {
    if (stalenessFilter === 'all') return true;

    // Trouver le niveau d'ancienneté pour ce fichier
    const file = statistics.topRiskyFiles.find(f => f.filePath === detection.filePath);
    if (!file) return stalenessFilter === 'all';

    return file.stalenessLevel === stalenessFilter;
  });

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

  // Limiter les détections affichées pour les performances
  const displayedDetections = filteredDetections.slice(0, 500);

  return (
    <Box>
      {/* En-tête avec statistiques principales */}
      <Box sx={{ display: 'flex', gap: 3, mb: 4, flexWrap: 'wrap' }}>
        <Box sx={{ flex: '1 1 200px' }}>
          <Card sx={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
            <CardContent>
              <Typography variant="h3" fontWeight={700} color="white">
                {statistics.totalFilesScanned}
              </Typography>
              <Typography variant="body2" color="rgba(255,255,255,0.9)">
                Fichiers scannés
              </Typography>
            </CardContent>
          </Card>
        </Box>
        <Box sx={{ flex: '1 1 200px' }}>
          <Card sx={{ background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)' }}>
            <CardContent>
              <Typography variant="h3" fontWeight={700} color="white">
                {statistics.filesWithPii}
              </Typography>
              <Typography variant="body2" color="rgba(255,255,255,0.9)">
                Fichiers avec PII
              </Typography>
            </CardContent>
          </Card>
        </Box>
        <Box sx={{ flex: '1 1 200px' }}>
          <Card sx={{ background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)' }}>
            <CardContent>
              <Typography variant="h3" fontWeight={700} color="white">
                {statistics.totalPiiFound}
              </Typography>
              <Typography variant="body2" color="rgba(255,255,255,0.9)">
                PII détectées
              </Typography>
            </CardContent>
          </Card>
        </Box>
        <Box sx={{ flex: '1 1 200px' }}>
          <Card sx={{ background: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)' }}>
            <CardContent>
              <Typography variant="h3" fontWeight={700} color="white">
                {Object.keys(statistics.piiByType).length}
              </Typography>
              <Typography variant="body2" color="rgba(255,255,255,0.9)">
                Types de PII
              </Typography>
            </CardContent>
          </Card>
        </Box>
      </Box>

      {/* Boutons d'action */}
      <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap' }}>
        <Button
          variant="outlined"
          onClick={onNewScan}
          startIcon={<RefreshIcon />}
          sx={{ flex: '1 1 auto' }}
        >
          Nouveau Scan
        </Button>
        <Button
          variant="contained"
          onClick={() => onDownloadReport('csv')}
          startIcon={<TableChartIcon />}
          sx={{ flex: '1 1 auto' }}
        >
          CSV
        </Button>
        <Button
          variant="contained"
          onClick={() => onDownloadReport('json')}
          startIcon={<DataObjectIcon />}
          sx={{ flex: '1 1 auto' }}
        >
          JSON
        </Button>
        <Button
          variant="contained"
          onClick={() => onDownloadReport('html')}
          startIcon={<CodeIcon />}
          sx={{ flex: '1 1 auto' }}
        >
          HTML
        </Button>
        <Button
          variant="contained"
          onClick={() => onDownloadReport('excel')}
          startIcon={<DescriptionIcon />}
          sx={{ flex: '1 1 auto' }}
        >
          Excel
        </Button>
      </Box>

      {/* Onglets */}
      <Card>
        <Tabs value={activeTab} onChange={(_, newValue) => setActiveTab(newValue)} sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tab label="📊 Graphiques" />
          <Tab label="⚠️ Fichiers à risque" />
          <Tab label="🔍 Détections" />
        </Tabs>

        <CardContent sx={{ p: 3 }}>
          {/* Tab 1: Graphiques */}
          {activeTab === 0 && (
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
          )}

          {/* Tab 2: Fichiers à risque */}
          {activeTab === 1 && (
            <Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2, flexWrap: 'wrap', gap: 2 }}>
                <Typography variant="h6" fontWeight={600}>
                  Top {statistics.topRiskyFiles.length} fichiers à risque
                </Typography>
                <Box sx={{ display: 'flex', gap: 2 }}>
                  <FormControl size="small" sx={{ minWidth: 200 }}>
                    <InputLabel>Filtrer par ancienneté</InputLabel>
                    <Select
                      value={stalenessFilter}
                      label="Filtrer par ancienneté"
                      onChange={(e) => setStalenessFilter(e.target.value)}
                    >
                      <MenuItem value="all">Tous les fichiers</MenuItem>
                      <MenuItem value="Récent">Récent (&lt; 6 mois)</MenuItem>
                      <MenuItem value="6 mois">6 mois - 1 an</MenuItem>
                      <MenuItem value="1 an">1 an - 3 ans</MenuItem>
                      <MenuItem value="3 ans">3 ans - 5 ans</MenuItem>
                      <MenuItem value="+5 ans">Plus de 5 ans</MenuItem>
                    </Select>
                  </FormControl>
                  <FormControl size="small" sx={{ minWidth: 200 }}>
                    <InputLabel>Filtrer par exposition</InputLabel>
                    <Select
                      value={exposureFilter}
                      label="Filtrer par exposition"
                      onChange={(e) => setExposureFilter(e.target.value)}
                    >
                      <MenuItem value="all">Tous les niveaux</MenuItem>
                      <MenuItem value="Critique">🔴 Critique</MenuItem>
                      <MenuItem value="Élevé">🟠 Élevé</MenuItem>
                      <MenuItem value="Moyen">🟡 Moyen</MenuItem>
                      <MenuItem value="Faible">✅ Faible</MenuItem>
                    </Select>
                  </FormControl>
                </Box>
              </Box>
              {filteredRiskyFiles.length > 0 ? (
                <TableContainer component={Paper} sx={{ mt: 2, maxHeight: 600 }}>
                  <Table stickyHeader>
                    <TableHead>
                      <TableRow>
                        <TableCell><strong>Niveau de risque</strong></TableCell>
                        <TableCell><strong>Fichier</strong></TableCell>
                        <TableCell align="right"><strong>Nombre de PII</strong></TableCell>
                        <TableCell><strong>Ancienneté</strong></TableCell>
                        <TableCell><strong>Exposition</strong></TableCell>
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
                                    'default'
                                  }
                                  variant="outlined"
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
                                    <Chip
                                      label="Everyone"
                                      size="small"
                                      color="error"
                                      variant="outlined"
                                      sx={{ fontSize: '0.7rem' }}
                                    />
                                  )}
                                  {file.isNetworkShare && (
                                    <Chip
                                      label="Réseau"
                                      size="small"
                                      color="warning"
                                      variant="outlined"
                                      sx={{ fontSize: '0.7rem' }}
                                    />
                                  )}
                                </Box>
                              )}
                            </TableCell>
                          </TableRow>
                          {file.staleDataWarning && (
                            <TableRow key={`${index}-stale-warning`}>
                              <TableCell colSpan={5} sx={{ py: 0.5, backgroundColor: 'rgba(255, 152, 0, 0.08)' }}>
                                <Alert
                                  severity="warning"
                                  sx={{
                                    py: 0,
                                    '& .MuiAlert-message': { fontSize: '0.875rem' }
                                  }}
                                >
                                  {file.staleDataWarning}
                                </Alert>
                              </TableCell>
                            </TableRow>
                          )}
                          {file.exposureWarning && (
                            <TableRow key={`${index}-exposure-warning`}>
                              <TableCell colSpan={5} sx={{ py: 0.5, backgroundColor: 'rgba(244, 67, 54, 0.08)' }}>
                                <Alert
                                  severity={file.exposureLevel === 'Critique' ? 'error' : 'warning'}
                                  sx={{
                                    py: 0,
                                    '& .MuiAlert-message': { fontSize: '0.875rem' }
                                  }}
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
                <Alert severity="success" sx={{ mt: 2 }}>
                  Aucun fichier à risque détecté
                </Alert>
              )}
            </Box>
          )}

          {/* Tab 3: Détections */}
          {activeTab === 2 && (
            <Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6" fontWeight={600}>
                  Détails des détections
                </Typography>
                <FormControl size="small" sx={{ minWidth: 200 }}>
                  <InputLabel>Filtrer par ancienneté</InputLabel>
                  <Select
                    value={stalenessFilter}
                    label="Filtrer par ancienneté"
                    onChange={(e) => setStalenessFilter(e.target.value)}
                  >
                    <MenuItem value="all">Tous les fichiers</MenuItem>
                    <MenuItem value="Récent">Récent (&lt; 6 mois)</MenuItem>
                    <MenuItem value="6 mois">6 mois - 1 an</MenuItem>
                    <MenuItem value="1 an">1 an - 3 ans</MenuItem>
                    <MenuItem value="3 ans">3 ans - 5 ans</MenuItem>
                    <MenuItem value="+5 ans">Plus de 5 ans</MenuItem>
                  </Select>
                </FormControl>
              </Box>
              {filteredDetections.length > 500 && (
                <Alert severity="info" sx={{ mb: 2 }}>
                  Affichage des 500 premières détections sur {filteredDetections.length} au total
                  {stalenessFilter !== 'all' && ` (filtrées par: ${stalenessFilter})`}.
                  Téléchargez les rapports pour voir toutes les détections.
                </Alert>
              )}
              {stalenessFilter !== 'all' && filteredDetections.length <= 500 && filteredDetections.length > 0 && (
                <Alert severity="info" sx={{ mb: 2 }}>
                  {filteredDetections.length} détection(s) trouvée(s) pour les fichiers de {stalenessFilter}.
                </Alert>
              )}
              <TableContainer component={Paper} sx={{ mt: 2, maxHeight: 600 }}>
                <Table stickyHeader size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell><strong>Type PII</strong></TableCell>
                      <TableCell><strong>Valeur</strong></TableCell>
                      <TableCell><strong>Fichier</strong></TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {displayedDetections.map((detection, index) => (
                      <TableRow key={index} hover>
                        <TableCell>
                          <Chip label={detection.piiType} size="small" color="secondary" variant="outlined" />
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" fontFamily="monospace">
                            {detection.match}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" fontSize="0.75rem" color="text.secondary">
                            {detection.filePath.split('\\').pop() || detection.filePath}
                          </Typography>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Box>
          )}
        </CardContent>
      </Card>
    </Box>
  );
}
