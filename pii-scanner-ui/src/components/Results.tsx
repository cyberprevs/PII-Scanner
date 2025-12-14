import { useState } from 'react';
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
import type { ScanResultResponse } from '../types';

interface ResultsProps {
  results: ScanResultResponse;
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

export default function Results({ results, onDownloadReport, onNewScan }: ResultsProps) {
  const [activeTab, setActiveTab] = useState(0);
  const [stalenessFilter, setStalenessFilter] = useState<string>('all');

  const { statistics, detections } = results;

  // Filtrer les fichiers par ancienneté
  const filteredRiskyFiles = statistics.topRiskyFiles.filter(file => {
    if (stalenessFilter === 'all') return true;
    return file.stalenessLevel === stalenessFilter;
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
          )}

          {/* Tab 2: Fichiers à risque */}
          {activeTab === 1 && (
            <Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6" fontWeight={600}>
                  Top {statistics.topRiskyFiles.length} fichiers à risque
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
              {filteredRiskyFiles.length > 0 ? (
                <TableContainer component={Paper} sx={{ mt: 2, maxHeight: 600 }}>
                  <Table stickyHeader>
                    <TableHead>
                      <TableRow>
                        <TableCell><strong>Niveau de risque</strong></TableCell>
                        <TableCell><strong>Fichier</strong></TableCell>
                        <TableCell align="right"><strong>Nombre de PII</strong></TableCell>
                        <TableCell><strong>Ancienneté</strong></TableCell>
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
                          </TableRow>
                          {file.staleDataWarning && (
                            <TableRow key={`${index}-warning`}>
                              <TableCell colSpan={4} sx={{ py: 0.5, backgroundColor: 'rgba(255, 152, 0, 0.08)' }}>
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
