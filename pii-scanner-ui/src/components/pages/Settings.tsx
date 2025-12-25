import { useState } from 'react';
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
  Select,
  MenuItem,
  FormControl,
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
} from '@mui/material';
import SaveIcon from '@mui/icons-material/Save';
import RestoreIcon from '@mui/icons-material/Restore';

interface PiiTypeConfig {
  id: string;
  label: string;
  description: string;
  enabled: boolean;
  sensitivity: 'Critique' | 'Élevé' | 'Moyen' | 'Faible';
  category: 'Identité' | 'Contact' | 'Bancaire' | 'Santé' | 'Éducation' | 'Transport' | 'Universel';
}

export default function Settings() {
  // Section 1: Configuration des types de fichiers
  const [fileTypes, setFileTypes] = useState({
    docx: true,
    xlsx: true,
    pdf: true,
    txt: true,
    csv: true,
    log: true,
    json: true,
  });

  const [excludedFolders, setExcludedFolders] = useState('Windows, System32, Program Files, AppData');
  const [excludedExtensions, setExcludedExtensions] = useState('.exe, .dll, .sys, .tmp');

  // Section 2: Configuration des types PII béninois
  const [piiTypes, setPiiTypes] = useState<PiiTypeConfig[]>([
    // Identité & Documents
    { id: 'IFU', label: 'IFU', description: 'Identifiant Fiscal Unique (13 chiffres)', enabled: true, sensitivity: 'Critique', category: 'Identité' },
    { id: 'CNI_Benin', label: 'CNI Bénin', description: 'Carte Nationale d\'Identité béninoise', enabled: true, sensitivity: 'Critique', category: 'Identité' },
    { id: 'Passeport_Benin', label: 'Passeport Bénin', description: 'Passeport béninois (BJ + 7 chiffres)', enabled: true, sensitivity: 'Critique', category: 'Identité' },
    { id: 'RCCM', label: 'RCCM', description: 'Registre du Commerce et du Crédit Mobilier', enabled: true, sensitivity: 'Élevé', category: 'Identité' },
    { id: 'ActeNaissance', label: 'Acte de naissance', description: 'Numéro d\'acte de naissance', enabled: true, sensitivity: 'Critique', category: 'Identité' },

    // Contact
    { id: 'Telephone', label: 'Téléphone', description: 'Numéro de téléphone béninois (+229)', enabled: true, sensitivity: 'Moyen', category: 'Contact' },
    { id: 'Email', label: 'Email', description: 'Adresse email', enabled: true, sensitivity: 'Moyen', category: 'Contact' },

    // Bancaire
    { id: 'IBAN', label: 'IBAN Bénin', description: 'IBAN béninois (BJ + 26 caractères)', enabled: true, sensitivity: 'Critique', category: 'Bancaire' },
    { id: 'CarteBancaire', label: 'Carte bancaire', description: 'Numéro de carte bancaire (validation Luhn)', enabled: true, sensitivity: 'Critique', category: 'Bancaire' },
    { id: 'MobileMoney_MTN', label: 'MTN MoMo', description: 'Mobile Money MTN (96, 97, 66, 67)', enabled: true, sensitivity: 'Critique', category: 'Bancaire' },
    { id: 'MobileMoney_Moov', label: 'Moov Money', description: 'Mobile Money Moov (98, 99, 68, 69)', enabled: true, sensitivity: 'Critique', category: 'Bancaire' },

    // Santé & Sécurité Sociale
    { id: 'CNSS', label: 'CNSS', description: 'Caisse Nationale de Sécurité Sociale', enabled: true, sensitivity: 'Élevé', category: 'Santé' },
    { id: 'RAMU', label: 'RAMU', description: 'Régime d\'Assurance Maladie Universelle', enabled: true, sensitivity: 'Élevé', category: 'Santé' },

    // Éducation
    { id: 'INE', label: 'INE', description: 'Identifiant National de l\'Élève', enabled: true, sensitivity: 'Moyen', category: 'Éducation' },
    { id: 'Matricule_Fonctionnaire', label: 'Matricule fonctionnaire', description: 'Matricule de fonctionnaire (F/M + chiffres)', enabled: true, sensitivity: 'Élevé', category: 'Éducation' },

    // Transport
    { id: 'Plaque_Immatriculation', label: 'Plaque d\'immatriculation', description: 'Plaque véhicule (nouveau: AB 1234 CD, ancien: 1234 AB)', enabled: true, sensitivity: 'Moyen', category: 'Transport' },

    // Données universelles
    { id: 'DateNaissance', label: 'Date de naissance', description: 'Date de naissance (JJ/MM/AAAA)', enabled: true, sensitivity: 'Critique', category: 'Universel' },
  ]);

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

  const handleSave = () => {
    // TODO: Sauvegarder la configuration dans localStorage ou backend
    console.log('Configuration sauvegardée:', { fileTypes, excludedFolders, excludedExtensions, piiTypes });
    alert('Configuration sauvegardée avec succès!');
  };

  const handleReset = () => {
    // TODO: Restaurer la configuration par défaut
    alert('Configuration réinitialisée aux valeurs par défaut');
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'Identité': return '#667eea';
      case 'Contact': return '#4facfe';
      case 'Bancaire': return '#f44336';
      case 'Santé': return '#43e97b';
      case 'Éducation': return '#ff9800';
      case 'Transport': return '#795548';
      case 'Universel': return '#607d8b';
      default: return '#757575';
    }
  };

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
                      <FormControl size="small" sx={{ minWidth: 120 }} disabled={!pii.enabled}>
                        <Select
                          value={pii.sensitivity}
                          onChange={(e) => handleSensitivityChange(pii.id, e.target.value as any)}
                        >
                          <MenuItem value="Critique">
                            <Chip label="Critique" color="error" size="small" />
                          </MenuItem>
                          <MenuItem value="Élevé">
                            <Chip label="Élevé" color="warning" size="small" />
                          </MenuItem>
                          <MenuItem value="Moyen">
                            <Chip label="Moyen" color="info" size="small" />
                          </MenuItem>
                          <MenuItem value="Faible">
                            <Chip label="Faible" color="success" size="small" />
                          </MenuItem>
                        </Select>
                      </FormControl>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>

          <Box sx={{ mt: 2, display: 'flex', gap: 1 }}>
            <Typography variant="body2" color="text.secondary">
              {piiTypes.filter(p => p.enabled).length} types actifs sur {piiTypes.length}
            </Typography>
            <Typography variant="body2" color="text.secondary">•</Typography>
            <Typography variant="body2" color="error.main">
              {piiTypes.filter(p => p.enabled && p.sensitivity === 'Critique').length} Critiques
            </Typography>
            <Typography variant="body2" color="warning.main">
              {piiTypes.filter(p => p.enabled && p.sensitivity === 'Élevé').length} Élevés
            </Typography>
            <Typography variant="body2" color="info.main">
              {piiTypes.filter(p => p.enabled && p.sensitivity === 'Moyen').length} Moyens
            </Typography>
            <Typography variant="body2" color="success.main">
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
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            '&:hover': {
              background: 'linear-gradient(135deg, #5568d3 0%, #65408b 100%)',
            },
          }}
        >
          Sauvegarder
        </Button>
      </Box>
    </Box>
  );
}
