import { useState } from 'react';
import { scanApi, type OldFileInfo } from '../../services/apiClient';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Alert,
  Button,
  FormControl,
  Select,
  MenuItem,
  TextField,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  LinearProgress,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
} from '@mui/material';
import DeleteSweepIcon from '@mui/icons-material/DeleteSweep';
import WarningIcon from '@mui/icons-material/Warning';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import FolderIcon from '@mui/icons-material/Folder';
import ScheduleIcon from '@mui/icons-material/Schedule';

interface RetentionPolicy {
  category: string;
  description: string;
  defaultPeriod: number; // en années
  currentPeriod: number;
  color: string;
  icon: string;
}

export default function DataRetention() {
  const [retentionPolicies, setRetentionPolicies] = useState<RetentionPolicy[]>([
    { category: 'Données bancaires (IBAN, Carte, Mobile Money)', description: 'Transactions et informations bancaires', defaultPeriod: 5, currentPeriod: 5, color: '#f44336', icon: '•' },
    { category: 'Données d\'identité (IFU, CNI, Passeport, RCCM)', description: 'Documents d\'identité et fiscaux', defaultPeriod: 3, currentPeriod: 3, color: '#00E599', icon: '•' },
    { category: 'Données santé (CNSS, RAMU)', description: 'Dossiers médicaux et assurance', defaultPeriod: 5, currentPeriod: 5, color: '#43e97b', icon: '•' },
    { category: 'Données éducation (INE, Matricule)', description: 'Dossiers scolaires et administratifs', defaultPeriod: 2, currentPeriod: 2, color: '#ff9800', icon: '•' },
    { category: 'Données contact (Email, Téléphone)', description: 'Coordonnées personnelles', defaultPeriod: 1, currentPeriod: 1, color: '#3B82F6', icon: '•' },
    { category: 'Données transport (Plaque d\'immatriculation)', description: 'Informations véhicules', defaultPeriod: 3, currentPeriod: 3, color: '#795548', icon: '•' },
  ]);

  const [directoryPath, setDirectoryPath] = useState('C:\\Users');
  const [scanning, setScanning] = useState(false);
  const [scanProgress, setScanProgress] = useState(0);
  const [filesToDelete, setFilesToDelete] = useState<OldFileInfo[]>([]);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deletionInProgress, setDeletionInProgress] = useState(false);
  const [deletionComplete, setDeletionComplete] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handlePolicyChange = (category: string, newPeriod: number) => {
    setRetentionPolicies(prev =>
      prev.map(policy =>
        policy.category === category
          ? { ...policy, currentPeriod: newPeriod }
          : policy
      )
    );
  };

  const handleScanOldFiles = async () => {
    setScanning(true);
    setScanProgress(0);
    setFilesToDelete([]);
    setError(null);

    try {
      // Simuler la progression
      const progressInterval = setInterval(() => {
        setScanProgress(prev => Math.min(prev + 5, 90));
      }, 200);

      // Convertir les politiques de rétention au format API
      const policies: Record<string, number> = {
        banking: retentionPolicies[0].currentPeriod,
        identity: retentionPolicies[1].currentPeriod,
        health: retentionPolicies[2].currentPeriod,
        education: retentionPolicies[3].currentPeriod,
        contact: retentionPolicies[4].currentPeriod,
        transport: retentionPolicies[5].currentPeriod,
      };

      // Appel API réel
      const response = await scanApi.scanForOldFiles(directoryPath, policies);

      clearInterval(progressInterval);
      setScanProgress(100);

      if (response.success) {
        setFilesToDelete(response.files);
      } else {
        setError('Erreur lors du scan des fichiers');
      }
    } catch (err: any) {
      setError(err.message || 'Erreur de connexion à l\'API');
      console.error('Scan error:', err);
    } finally {
      setScanning(false);
    }
  };

  const handleDeleteConfirm = async () => {
    setDeletionInProgress(true);
    setError(null);

    try {
      const filePaths = filesToDelete.map(f => f.path);
      const response = await scanApi.deleteOldFiles(filePaths);

      setDeletionInProgress(false);

      if (response.success) {
        setDeletionComplete(true);

        setTimeout(() => {
          setDeleteDialogOpen(false);
          setDeletionComplete(false);
          setFilesToDelete([]);
        }, 2000);
      } else {
        setError(`Suppression partielle : ${response.deletedCount} réussis, ${response.failedCount} échecs`);
        setDeletionInProgress(false);
      }
    } catch (err: any) {
      setError(err.message || 'Erreur lors de la suppression');
      setDeletionInProgress(false);
    }
  };

  const totalFilesToDelete = filesToDelete.length;
  const totalPiiToDelete = filesToDelete.reduce((sum, f) => sum + f.piiCount, 0);

  return (
    <Box>
      <Typography variant="h4" fontWeight={700} gutterBottom>
        Rétention et suppression des données
      </Typography>
      <Typography variant="body1" color="text.secondary" paragraph>
        Gérer la rétention des données personnelles conformément à la Loi N°2017-20 du Bénin (APDP)
      </Typography>

      <Alert severity="info" icon={<ScheduleIcon />} sx={{ mb: 3 }}>
        <strong>Principe de minimisation des données (Art. 6 APDP)</strong> : Les données personnelles ne doivent pas être conservées
        plus longtemps que nécessaire. Configurez les périodes de rétention selon les besoins de votre entreprise.
      </Alert>

      {/* Section 1: Configuration des politiques de rétention */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h5" fontWeight={600} gutterBottom>
            Politiques de rétention par catégorie
          </Typography>
          <Typography variant="body2" color="text.secondary" paragraph>
            Définissez la durée maximale de conservation pour chaque type de données
          </Typography>

          <TableContainer component={Paper} sx={{ mt: 2 }}>
            <Table>
              <TableHead>
                <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                  <TableCell><strong>Catégorie de données</strong></TableCell>
                  <TableCell><strong>Description</strong></TableCell>
                  <TableCell><strong>Période par défaut</strong></TableCell>
                  <TableCell><strong>Période configurée</strong></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {retentionPolicies.map((policy) => (
                  <TableRow key={policy.category} hover>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <span style={{ fontSize: '1.5rem' }}>{policy.icon}</span>
                        <Typography variant="body2" fontWeight={600}>
                          {policy.category}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" color="text.secondary" fontSize="0.85rem">
                        {policy.description}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={`${policy.defaultPeriod} an${policy.defaultPeriod > 1 ? 's' : ''}`}
                        size="small"
                        sx={{ backgroundColor: policy.color, color: 'white' }}
                      />
                    </TableCell>
                    <TableCell>
                      <FormControl size="small" sx={{ minWidth: 150 }}>
                        <Select
                          value={policy.currentPeriod}
                          onChange={(e) => handlePolicyChange(policy.category, e.target.value as number)}
                        >
                          <MenuItem value={1}>1 an</MenuItem>
                          <MenuItem value={2}>2 ans</MenuItem>
                          <MenuItem value={3}>3 ans</MenuItem>
                          <MenuItem value={5}>5 ans</MenuItem>
                          <MenuItem value={7}>7 ans</MenuItem>
                          <MenuItem value={10}>10 ans</MenuItem>
                        </Select>
                      </FormControl>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>

          <Alert severity="warning" sx={{ mt: 2 }}>
            <strong>Recommandations légales Bénin</strong> : Données bancaires (5 ans), Données fiscales (10 ans),
            Données santé (5 ans minimum selon le Code de la Santé).
          </Alert>
        </CardContent>
      </Card>

      {/* Section 2: Scan et suppression */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h5" fontWeight={600} gutterBottom>
            Détection des fichiers à supprimer
          </Typography>
          <Typography variant="body2" color="text.secondary" paragraph>
            Analyser le système pour identifier les fichiers dépassant les périodes de rétention
          </Typography>

          <TextField
            fullWidth
            label="Répertoire à scanner"
            value={directoryPath}
            onChange={(e) => setDirectoryPath(e.target.value)}
            placeholder="C:\Users\Documents"
            sx={{ mt: 2, mb: 2 }}
            helperText="Chemin complet du dossier à analyser (ex: C:\Users\Documents)"
          />

          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          <Button
            variant="contained"
            size="large"
            startIcon={scanning ? <LinearProgress sx={{ width: 24 }} /> : <DeleteSweepIcon />}
            onClick={handleScanOldFiles}
            disabled={scanning}
            sx={{
              mt: 2,
              background: 'linear-gradient(135deg, #00E599 0%, #00B876 100%)',
              '&:hover': {
                background: 'linear-gradient(135deg, #00CC88 0%, #00A86B 100%)',
              },
            }}
          >
            {scanning ? 'Analyse en cours...' : 'Lancer l\'analyse'}
          </Button>

          {scanning && (
            <Box sx={{ mt: 3 }}>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Progression: {scanProgress}%
              </Typography>
              <LinearProgress variant="determinate" value={scanProgress} />
            </Box>
          )}

          {filesToDelete.length > 0 && !scanning && (
            <Box sx={{ mt: 3 }}>
              <Alert severity="warning" icon={<WarningIcon />} sx={{ mb: 2 }}>
                <strong>{totalFilesToDelete} fichier(s) trouvé(s)</strong> dépassant les périodes de rétention,
                contenant <strong>{totalPiiToDelete} données PII</strong> au total.
              </Alert>

              <TableContainer component={Paper}>
                <Table size="small">
                  <TableHead>
                    <TableRow sx={{ backgroundColor: '#fff3e0' }}>
                      <TableCell><strong>Fichier</strong></TableCell>
                      <TableCell><strong>Âge</strong></TableCell>
                      <TableCell><strong>Dernière modification</strong></TableCell>
                      <TableCell><strong>PII détectées</strong></TableCell>
                      <TableCell><strong>Raison</strong></TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {filesToDelete.map((file, index) => (
                      <TableRow key={index} hover>
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <FolderIcon fontSize="small" color="action" />
                            <Typography variant="body2" fontSize="0.8rem" fontFamily="monospace">
                              {file.path}
                            </Typography>
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={`${file.age.toFixed(1)} ans`}
                            size="small"
                            color="error"
                          />
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" fontSize="0.85rem">
                            {new Date(file.lastModified).toLocaleDateString('fr-FR')}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={file.piiCount}
                            size="small"
                            color="warning"
                          />
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" color="text.secondary" fontSize="0.85rem">
                            {file.reason}
                          </Typography>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>

              <Box sx={{ mt: 3, display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
                <Button
                  variant="outlined"
                  onClick={() => setFilesToDelete([])}
                >
                  Annuler
                </Button>
                <Button
                  variant="contained"
                  color="error"
                  startIcon={<DeleteSweepIcon />}
                  onClick={() => setDeleteDialogOpen(true)}
                  sx={{ fontWeight: 600 }}
                >
                  Supprimer {totalFilesToDelete} fichier(s)
                </Button>
              </Box>
            </Box>
          )}
        </CardContent>
      </Card>

      {/* Section 3: Recommandations APDP */}
      <Card>
        <CardContent>
          <Typography variant="h6" fontWeight={600} gutterBottom>
            Conformité APDP - Loi N°2017-20 du Bénin
          </Typography>
          <List>
            <ListItem>
              <ListItemIcon>
                <CheckCircleIcon color="success" />
              </ListItemIcon>
              <ListItemText
                primary="Principe de minimisation"
                secondary="Les données ne doivent pas être conservées au-delà de la durée nécessaire (Art. 6)"
              />
            </ListItem>
            <Divider />
            <ListItem>
              <ListItemIcon>
                <CheckCircleIcon color="success" />
              </ListItemIcon>
              <ListItemText
                primary="Obligation de suppression"
                secondary="Les entreprises doivent supprimer les données personnelles obsolètes (Art. 14)"
              />
            </ListItem>
            <Divider />
            <ListItem>
              <ListItemIcon>
                <CheckCircleIcon color="success" />
              </ListItemIcon>
              <ListItemText
                primary="Registre des traitements"
                secondary="Documenter les politiques de rétention et suppressions effectuées (Art. 30)"
              />
            </ListItem>
            <Divider />
            <ListItem>
              <ListItemIcon>
                <CheckCircleIcon color="success" />
              </ListItemIcon>
              <ListItemText
                primary="Sanctions"
                secondary="Non-conformité peut entraîner des amendes jusqu'à 100 millions FCFA (Art. 101)"
              />
            </ListItem>
          </List>
        </CardContent>
      </Card>

      {/* Dialog de confirmation de suppression */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => !deletionInProgress && setDeleteDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ color: 'error.main', fontWeight: 700 }}>
          Confirmation de suppression
        </DialogTitle>
        <DialogContent>
          {!deletionComplete ? (
            <>
              <DialogContentText sx={{ mb: 2 }}>
                Vous êtes sur le point de supprimer <strong>{totalFilesToDelete} fichier(s)</strong> contenant
                au total <strong>{totalPiiToDelete} données PII</strong>.
              </DialogContentText>
              <Alert severity="error" sx={{ mb: 2 }}>
                <strong>ATTENTION :</strong> Cette action est <strong>irréversible</strong>.
                Les fichiers seront définitivement supprimés du système.
              </Alert>
              <DialogContentText>
                Assurez-vous d'avoir une sauvegarde si nécessaire avant de continuer.
              </DialogContentText>
              {deletionInProgress && (
                <Box sx={{ mt: 3 }}>
                  <Typography variant="body2" gutterBottom>
                    Suppression en cours...
                  </Typography>
                  <LinearProgress />
                </Box>
              )}
            </>
          ) : (
            <Alert severity="success" icon={<CheckCircleIcon />}>
              <strong>Suppression terminée avec succès!</strong><br />
              {totalFilesToDelete} fichier(s) supprimé(s), {totalPiiToDelete} données PII effacées.
            </Alert>
          )}
        </DialogContent>
        {!deletionComplete && (
          <DialogActions>
            <Button onClick={() => setDeleteDialogOpen(false)} disabled={deletionInProgress}>
              Annuler
            </Button>
            <Button
              onClick={handleDeleteConfirm}
              color="error"
              variant="contained"
              disabled={deletionInProgress}
              autoFocus
            >
              Confirmer la suppression
            </Button>
          </DialogActions>
        )}
      </Dialog>
    </Box>
  );
}
