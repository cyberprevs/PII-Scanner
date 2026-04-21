import { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Divider,
  FormGroup,
  FormControlLabel,
  Checkbox,
  TextField,
  Alert,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  Button,
  Snackbar,
  Select,
  MenuItem,
  FormControl,
} from '@mui/material';
import SaveIcon from '@mui/icons-material/Save';
import RestoreIcon from '@mui/icons-material/Restore';
import axios from '../../services/axios';

interface PiiTypeConfig {
  id: string;
  label: string;
  description: string;
  enabled: boolean;
  sensitivity: 'Critique' | 'Élevé' | 'Moyen' | 'Faible';
  category: 'Identité' | 'Contact' | 'Bancaire' | 'Santé' | 'Éducation' | 'Transport' | 'Universel';
}

const DEFAULT_FILE_TYPES = {
  docx: true,
  xlsx: true,
  pdf: true,
  txt: true,
  csv: true,
  log: true,
  json: true,
};

const DEFAULT_EXCLUDED_FOLDERS = 'Windows, System32, Program Files, AppData';
const DEFAULT_EXCLUDED_EXTENSIONS = '.exe, .dll, .sys, .tmp';

const DEFAULT_PII_TYPES: PiiTypeConfig[] = [
  { id: 'IFU', label: 'IFU', description: 'Identifiant Fiscal Unique (13 chiffres)', enabled: true, sensitivity: 'Critique' as const, category: 'Identité' as const },
  { id: 'CNI_Benin', label: 'CNI Bénin', description: 'Carte Nationale d\'Identité béninoise', enabled: true, sensitivity: 'Critique' as const, category: 'Identité' as const },
  { id: 'Passeport_Benin', label: 'Passeport Bénin', description: 'Passeport béninois (BJ + 7 chiffres)', enabled: true, sensitivity: 'Critique' as const, category: 'Identité' as const },
  { id: 'RCCM', label: 'RCCM', description: 'Registre du Commerce et du Crédit Mobilier', enabled: true, sensitivity: 'Moyen' as const, category: 'Identité' as const },
  { id: 'ActeNaissance', label: 'Acte de naissance', description: 'Numéro d\'acte de naissance', enabled: true, sensitivity: 'Critique' as const, category: 'Identité' as const },
  { id: 'Telephone', label: 'Téléphone', description: 'Numéro de téléphone béninois (fixe, mobile, mobile money)', enabled: true, sensitivity: 'Moyen' as const, category: 'Contact' as const },
  { id: 'Email', label: 'Email', description: 'Adresse email', enabled: true, sensitivity: 'Moyen' as const, category: 'Contact' as const },
  { id: 'IBAN', label: 'IBAN Bénin', description: 'IBAN béninois (BJ + 26 caractères)', enabled: true, sensitivity: 'Critique' as const, category: 'Bancaire' as const },
  { id: 'CarteBancaire', label: 'Carte bancaire', description: 'Numéro de carte bancaire (validation Luhn)', enabled: true, sensitivity: 'Critique' as const, category: 'Bancaire' as const },
  { id: 'CNSS', label: 'CNSS', description: 'Caisse Nationale de Sécurité Sociale', enabled: true, sensitivity: 'Moyen' as const, category: 'Santé' as const },
  { id: 'RAMU', label: 'RAMU', description: 'Régime d\'Assurance Maladie Universelle', enabled: true, sensitivity: 'Moyen' as const, category: 'Santé' as const },
  { id: 'INE', label: 'INE', description: 'Identifiant National de l\'Élève', enabled: true, sensitivity: 'Moyen' as const, category: 'Éducation' as const },
  { id: 'Matricule_Fonctionnaire', label: 'Matricule fonctionnaire', description: 'Matricule de fonctionnaire (F/M + chiffres)', enabled: true, sensitivity: 'Moyen' as const, category: 'Éducation' as const },
  { id: 'Plaque_Immatriculation', label: 'Plaque d\'immatriculation', description: 'Plaque véhicule (nouveau: AB 1234 CD, ancien: 1234 AB)', enabled: true, sensitivity: 'Moyen' as const, category: 'Transport' as const },
  { id: 'DateNaissance', label: 'Date de naissance', description: 'Date de naissance (JJ/MM/AAAA)', enabled: true, sensitivity: 'Critique' as const, category: 'Universel' as const },
];

export default function Settings() {
  const [fileTypes, setFileTypes] = useState(DEFAULT_FILE_TYPES);
  const [excludedFolders, setExcludedFolders] = useState(DEFAULT_EXCLUDED_FOLDERS);
  const [excludedExtensions, setExcludedExtensions] = useState(DEFAULT_EXCLUDED_EXTENSIONS);
  const [piiTypes, setPiiTypes] = useState<PiiTypeConfig[]>(DEFAULT_PII_TYPES);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  // Charger la configuration depuis l'API au montage du composant
  useEffect(() => {
    const loadSettings = async () => {
      try {
        const response = await axios.get('/UserSettings');
        const settings = response.data;

        // Parser FileTypesJson
        if (settings.fileTypesJson) {
          try {
            const parsedFileTypes = JSON.parse(settings.fileTypesJson);
            setFileTypes(parsedFileTypes);
          } catch {
            console.warn('Invalid FileTypesJson, using defaults');
            setFileTypes(DEFAULT_FILE_TYPES);
          }
        } else {
          setFileTypes(DEFAULT_FILE_TYPES);
        }

        // Charger les champs texte
        setExcludedFolders(settings.excludedFolders || DEFAULT_EXCLUDED_FOLDERS);
        setExcludedExtensions(settings.excludedExtensions || DEFAULT_EXCLUDED_EXTENSIONS);

        // Parser PiiTypesJson
        if (settings.piiTypesJson) {
          try {
            const parsedPiiTypes = JSON.parse(settings.piiTypesJson);
            if (Array.isArray(parsedPiiTypes) && parsedPiiTypes.length > 0) {
              const validSensitivities: Array<'Critique' | 'Élevé' | 'Moyen' | 'Faible'> = ['Critique', 'Élevé', 'Moyen', 'Faible'];

              const validatedPiiTypes = DEFAULT_PII_TYPES.map(defaultPii => {
                const savedPii = parsedPiiTypes.find((p: { id?: string; sensitivity?: string }) => p && p.id === defaultPii.id);
                if (savedPii && typeof savedPii === 'object') {
                  const sensitivity = validSensitivities.includes(savedPii.sensitivity)
                    ? savedPii.sensitivity
                    : defaultPii.sensitivity;

                  return {
                    ...defaultPii,
                    enabled: typeof savedPii.enabled === 'boolean' ? savedPii.enabled : defaultPii.enabled,
                    sensitivity
                  };
                }
                return defaultPii;
              });
              setPiiTypes(validatedPiiTypes);
            } else {
              setPiiTypes(DEFAULT_PII_TYPES);
            }
          } catch {
            console.warn('Invalid PiiTypesJson, using defaults');
            setPiiTypes(DEFAULT_PII_TYPES);
          }
        } else {
          setPiiTypes(DEFAULT_PII_TYPES);
        }
      } catch (error) {
        console.error('Erreur lors du chargement des paramètres depuis l\'API:', error);
        // Utiliser les valeurs par défaut en cas d'erreur
        setFileTypes(DEFAULT_FILE_TYPES);
        setExcludedFolders(DEFAULT_EXCLUDED_FOLDERS);
        setExcludedExtensions(DEFAULT_EXCLUDED_EXTENSIONS);
        setPiiTypes(DEFAULT_PII_TYPES);
      } finally {
        setIsLoading(false);
      }
    };

    loadSettings();
  }, []);

  const handleFileTypeChange = (type: keyof typeof fileTypes) => {
    setFileTypes(prev => ({ ...prev, [type]: !prev[type] }));
  };

  const handlePiiTypeToggle = (id: string) => {
    setPiiTypes(prev => prev.map(pii =>
      pii.id === id ? { ...pii, enabled: !pii.enabled } : pii
    ));
  };

  const handleSensitivityChange = (id: string, sensitivity: 'Critique' | 'Élevé' | 'Moyen' | 'Faible') => {
    setPiiTypes(prev => prev.map(pii =>
      pii.id === id ? { ...pii, sensitivity } : pii
    ));
  };

  const handleSave = async () => {
    try {
      const settingsToSave = {
        fileTypesJson: JSON.stringify(fileTypes),
        excludedFolders,
        excludedExtensions,
        piiTypesJson: JSON.stringify(piiTypes),
      };

      await axios.put('/UserSettings', settingsToSave);
      setSnackbarMessage('Configuration sauvegardée avec succès!');
      setSnackbarOpen(true);
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
      setSnackbarMessage('Erreur lors de la sauvegarde de la configuration');
      setSnackbarOpen(true);
    }
  };

  const handleReset = async () => {
    try {
      // Réinitialiser les valeurs dans l'état local
      setFileTypes(DEFAULT_FILE_TYPES);
      setExcludedFolders(DEFAULT_EXCLUDED_FOLDERS);
      setExcludedExtensions(DEFAULT_EXCLUDED_EXTENSIONS);
      setPiiTypes(DEFAULT_PII_TYPES);

      // Sauvegarder les valeurs par défaut dans la base de données
      const defaultSettings = {
        fileTypesJson: JSON.stringify(DEFAULT_FILE_TYPES),
        excludedFolders: DEFAULT_EXCLUDED_FOLDERS,
        excludedExtensions: DEFAULT_EXCLUDED_EXTENSIONS,
        piiTypesJson: JSON.stringify(DEFAULT_PII_TYPES),
      };

      await axios.put('/UserSettings', defaultSettings);
      setSnackbarMessage('Configuration réinitialisée aux valeurs par défaut');
      setSnackbarOpen(true);
    } catch (error) {
      console.error('Erreur lors de la réinitialisation:', error);
      setSnackbarMessage('Erreur lors de la réinitialisation');
      setSnackbarOpen(true);
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'Identité': return '#00E599';
      case 'Contact': return '#3B82F6';
      case 'Bancaire': return '#f44336';
      case 'Santé': return '#43e97b';
      case 'Éducation': return '#ff9800';
      case 'Transport': return '#795548';
      case 'Universel': return '#607d8b';
      default: return '#757575';
    }
  };

  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <Typography>Chargement des paramètres...</Typography>
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h4" fontWeight={700} gutterBottom>
        ⚙️ Paramètres
      </Typography>
      <Typography variant="body1" color="text.secondary" paragraph>
        Configuration de l'application et des types de PII béninois
      </Typography>

      <Alert severity="info" sx={{ mb: 3 }}>
        Les modifications seront appliquées au prochain scan. Conforme à la Loi N°2017-20 du Bénin (APDP).
      </Alert>

      {/* Section 1: Types de fichiers et exclusions */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h5" fontWeight={600} gutterBottom>
            📁 Types de fichiers à scanner
          </Typography>
          <Typography variant="body2" color="text.secondary" paragraph>
            Sélectionnez les types de fichiers à analyser lors du scan
          </Typography>

          <FormGroup row sx={{ mb: 3 }}>
            <FormControlLabel
              control={<Checkbox checked={fileTypes.docx} onChange={() => handleFileTypeChange('docx')} />}
              label="Documents Word (.docx)"
            />
            <FormControlLabel
              control={<Checkbox checked={fileTypes.xlsx} onChange={() => handleFileTypeChange('xlsx')} />}
              label="Feuilles Excel (.xlsx)"
            />
            <FormControlLabel
              control={<Checkbox checked={fileTypes.pdf} onChange={() => handleFileTypeChange('pdf')} />}
              label="PDF (.pdf)"
            />
            <FormControlLabel
              control={<Checkbox checked={fileTypes.txt} onChange={() => handleFileTypeChange('txt')} />}
              label="Texte (.txt)"
            />
            <FormControlLabel
              control={<Checkbox checked={fileTypes.csv} onChange={() => handleFileTypeChange('csv')} />}
              label="CSV (.csv)"
            />
            <FormControlLabel
              control={<Checkbox checked={fileTypes.log} onChange={() => handleFileTypeChange('log')} />}
              label="Logs (.log)"
            />
            <FormControlLabel
              control={<Checkbox checked={fileTypes.json} onChange={() => handleFileTypeChange('json')} />}
              label="JSON (.json)"
            />
          </FormGroup>

          <Divider sx={{ my: 3 }} />

          <Typography variant="h6" fontWeight={600} gutterBottom>
            🚫 Exclusions
          </Typography>
          <Typography variant="body2" color="text.secondary" paragraph>
            Dossiers et extensions à ignorer lors du scan
          </Typography>

          <TextField
            fullWidth
            label="Dossiers système à ignorer"
            placeholder="Windows, System32, Program Files"
            value={excludedFolders}
            onChange={(e) => setExcludedFolders(e.target.value)}
            sx={{ mb: 2 }}
            helperText="Séparez les dossiers par des virgules"
          />

          <TextField
            fullWidth
            label="Extensions de fichiers à ignorer"
            placeholder=".exe, .dll, .sys"
            value={excludedExtensions}
            onChange={(e) => setExcludedExtensions(e.target.value)}
            helperText="Séparez les extensions par des virgules"
          />
        </CardContent>
      </Card>

      {/* Section 2: Configuration des types PII béninois */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h5" fontWeight={600} gutterBottom>
            🇧🇯 Configuration des types PII béninois
          </Typography>
          <Typography variant="body2" color="text.secondary" paragraph>
            Activez/désactivez les types de données personnelles à détecter et définissez leur niveau de sensibilité
          </Typography>

          <Alert severity="warning" sx={{ mb: 2 }}>
            Les types marqués comme "Critique" déclencheront des alertes immédiates et classeront les fichiers comme à risque élevé.
          </Alert>

          <TableContainer component={Paper} sx={{ mt: 2 }}>
            <Table size="small">
              <TableHead>
                <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                  <TableCell><strong>Actif</strong></TableCell>
                  <TableCell><strong>Catégorie</strong></TableCell>
                  <TableCell><strong>Type PII</strong></TableCell>
                  <TableCell><strong>Description</strong></TableCell>
                  <TableCell><strong>Niveau de sensibilité</strong></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {piiTypes.map((pii) => (
                  <TableRow
                    key={pii.id}
                    hover
                    sx={{
                      opacity: pii.enabled ? 1 : 0.5,
                      backgroundColor: pii.enabled ? 'inherit' : 'rgba(0,0,0,0.02)',
                    }}
                  >
                    <TableCell>
                      <Checkbox
                        checked={pii.enabled}
                        onChange={() => handlePiiTypeToggle(pii.id)}
                        color="primary"
                      />
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={pii.category}
                        size="small"
                        sx={{
                          backgroundColor: getCategoryColor(pii.category),
                          color: 'white',
                          fontWeight: 500,
                        }}
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" fontWeight={600}>
                        {pii.label}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" color="text.secondary" fontSize="0.85rem">
                        {pii.description}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <FormControl size="small" sx={{ minWidth: 120 }}>
                        <Select
                          value={pii.sensitivity}
                          onChange={(e) => handleSensitivityChange(pii.id, e.target.value as 'Critique' | 'Élevé' | 'Moyen' | 'Faible')}
                          sx={{
                            '& .MuiSelect-select': {
                              py: 0.5,
                              display: 'flex',
                              alignItems: 'center',
                            }
                          }}
                        >
                          <MenuItem value="Critique">
                            <Chip
                              label="🔴 Critique"
                              size="small"
                              sx={{
                                backgroundColor: '#d32f2f',
                                color: 'white',
                                fontWeight: 500,
                              }}
                            />
                          </MenuItem>
                          <MenuItem value="Élevé">
                            <Chip
                              label="🟠 Élevé"
                              size="small"
                              sx={{
                                backgroundColor: '#f57c00',
                                color: 'white',
                                fontWeight: 500,
                              }}
                            />
                          </MenuItem>
                          <MenuItem value="Moyen">
                            <Chip
                              label="🟡 Moyen"
                              size="small"
                              sx={{
                                backgroundColor: '#ffa726',
                                color: 'white',
                                fontWeight: 500,
                              }}
                            />
                          </MenuItem>
                          <MenuItem value="Faible">
                            <Chip
                              label="🟢 Faible"
                              size="small"
                              sx={{
                                backgroundColor: '#66bb6a',
                                color: 'white',
                                fontWeight: 500,
                              }}
                            />
                          </MenuItem>
                        </Select>
                      </FormControl>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>

          <Box sx={{ mt: 2, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
            <Typography variant="body2" color="text.secondary">
              {piiTypes.filter(p => p.enabled).length} types actifs sur {piiTypes.length}
            </Typography>
            <Typography variant="body2" color="text.secondary">•</Typography>
            <Typography variant="body2" sx={{ color: '#d32f2f' }}>
              {piiTypes.filter(p => p.enabled && p.sensitivity === 'Critique').length} Critiques
            </Typography>
            <Typography variant="body2" sx={{ color: '#f57c00' }}>
              {piiTypes.filter(p => p.enabled && p.sensitivity === 'Élevé').length} Élevés
            </Typography>
            <Typography variant="body2" sx={{ color: '#ffa726' }}>
              {piiTypes.filter(p => p.enabled && p.sensitivity === 'Moyen').length} Moyens
            </Typography>
            <Typography variant="body2" sx={{ color: '#66bb6a' }}>
              {piiTypes.filter(p => p.enabled && p.sensitivity === 'Faible').length} Faibles
            </Typography>
          </Box>
        </CardContent>
      </Card>

      {/* Actions */}
      <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
        <Button
          variant="outlined"
          startIcon={<RestoreIcon />}
          onClick={handleReset}
        >
          Réinitialiser
        </Button>
        <Button
          variant="contained"
          startIcon={<SaveIcon />}
          onClick={handleSave}
          sx={{
            backgroundColor: '#00E599',
            color: '#0A0A0A',
            '&:hover': {
              backgroundColor: '#00CC88',
            },
          }}
        >
          Sauvegarder
        </Button>
      </Box>

      {/* Snackbar pour les notifications */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={3000}
        onClose={() => setSnackbarOpen(false)}
        message={snackbarMessage}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      />
    </Box>
  );
}
