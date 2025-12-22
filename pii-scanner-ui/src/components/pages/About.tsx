import React from 'react';
import {
  Box,
  Container,
  Typography,
  Paper,
  Grid,
  Divider,
  Card,
  CardContent,
  Chip,
  Link,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
} from '@mui/material';
import InfoIcon from '@mui/icons-material/Info';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import SecurityIcon from '@mui/icons-material/Security';
import GavelIcon from '@mui/icons-material/Gavel';
import CodeIcon from '@mui/icons-material/Code';
import BusinessIcon from '@mui/icons-material/Business';
import GitHubIcon from '@mui/icons-material/GitHub';

const About: React.FC = () => {
  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
          <InfoIcon sx={{ fontSize: 40, mr: 2, color: 'primary.main' }} />
          <Typography variant="h4" fontWeight={700}>
            À propos de PII Scanner
          </Typography>
        </Box>
        <Typography variant="body1" color="text.secondary">
          Détecteur de Données Personnelles pour la conformité RGPD et APDP
        </Typography>
      </Box>

      <Divider sx={{ mb: 4 }} />

      {/* Version & Developer Info */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={6}>
          <Card
            sx={{
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              color: 'white',
            }}
          >
            <CardContent>
              <SecurityIcon sx={{ fontSize: 48, mb: 2 }} />
              <Typography variant="h5" fontWeight={700} gutterBottom>
                PII Scanner
              </Typography>
              <Typography variant="body2" sx={{ mb: 2, opacity: 0.9 }}>
                Détection automatisée de données personnelles (PII) dans vos fichiers
              </Typography>
              <Chip
                label="Version 1.0.0"
                sx={{
                  bgcolor: 'rgba(255,255,255,0.2)',
                  color: 'white',
                  fontWeight: 600,
                }}
              />
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <BusinessIcon sx={{ fontSize: 48, mb: 2, color: 'primary.main' }} />
              <Typography variant="h6" fontWeight={700} gutterBottom>
                Développé par
              </Typography>
              <Typography
                variant="h5"
                sx={{
                  fontWeight: 700,
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  mb: 2,
                }}
              >
                Cyberprevs
              </Typography>
              <Typography variant="body2" color="text.secondary">
                © 2025 Cyberprevs. Tous droits réservés.
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* License Section */}
      <Paper sx={{ p: 3, mb: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
          <GavelIcon sx={{ fontSize: 32, mr: 2, color: 'primary.main' }} />
          <Typography variant="h5" fontWeight={700}>
            Licence
          </Typography>
        </Box>

        <Typography variant="body1" color="text.secondary" paragraph>
          Ce projet est distribué sous la licence{' '}
          <strong>Creative Commons Attribution-NonCommercial 4.0 International (CC BY-NC 4.0)</strong>.
        </Typography>

        <Grid container spacing={3} sx={{ mt: 2 }}>
          {/* What you CAN do */}
          <Grid item xs={12} md={6}>
            <Box
              sx={{
                p: 2,
                borderRadius: 2,
                bgcolor: 'rgba(76, 175, 80, 0.1)',
                border: '1px solid rgba(76, 175, 80, 0.3)',
              }}
            >
              <Typography variant="h6" fontWeight={700} sx={{ mb: 2, color: 'success.main' }}>
                ✅ Ce que vous pouvez faire
              </Typography>
              <List dense>
                <ListItem>
                  <ListItemIcon sx={{ minWidth: 36 }}>
                    <CheckCircleIcon sx={{ color: 'success.main' }} />
                  </ListItemIcon>
                  <ListItemText
                    primary="Utiliser gratuitement"
                    secondary="Le logiciel est gratuit pour tous les usages non-commerciaux"
                  />
                </ListItem>
                <ListItem>
                  <ListItemIcon sx={{ minWidth: 36 }}>
                    <CheckCircleIcon sx={{ color: 'success.main' }} />
                  </ListItemIcon>
                  <ListItemText
                    primary="Modifier le code"
                    secondary="Vous pouvez adapter le code source à vos besoins"
                  />
                </ListItem>
                <ListItem>
                  <ListItemIcon sx={{ minWidth: 36 }}>
                    <CheckCircleIcon sx={{ color: 'success.main' }} />
                  </ListItemIcon>
                  <ListItemText
                    primary="Distribuer"
                    secondary="Partagez le logiciel avec d'autres utilisateurs"
                  />
                </ListItem>
                <ListItem>
                  <ListItemIcon sx={{ minWidth: 36 }}>
                    <CheckCircleIcon sx={{ color: 'success.main' }} />
                  </ListItemIcon>
                  <ListItemText
                    primary="Étudier"
                    secondary="Analysez le fonctionnement du logiciel"
                  />
                </ListItem>
              </List>
            </Box>
          </Grid>

          {/* What you CANNOT do */}
          <Grid item xs={12} md={6}>
            <Box
              sx={{
                p: 2,
                borderRadius: 2,
                bgcolor: 'rgba(244, 67, 54, 0.1)',
                border: '1px solid rgba(244, 67, 54, 0.3)',
              }}
            >
              <Typography variant="h6" fontWeight={700} sx={{ mb: 2, color: 'error.main' }}>
                ❌ Ce que vous ne pouvez PAS faire
              </Typography>
              <List dense>
                <ListItem>
                  <ListItemIcon sx={{ minWidth: 36 }}>
                    <CancelIcon sx={{ color: 'error.main' }} />
                  </ListItemIcon>
                  <ListItemText
                    primary="Vendre le logiciel"
                    secondary="Interdiction de vendre des copies du logiciel"
                  />
                </ListItem>
                <ListItem>
                  <ListItemIcon sx={{ minWidth: 36 }}>
                    <CancelIcon sx={{ color: 'error.main' }} />
                  </ListItemIcon>
                  <ListItemText
                    primary="Usage commercial"
                    secondary="Pas d'utilisation commerciale sans autorisation écrite"
                  />
                </ListItem>
                <ListItem>
                  <ListItemIcon sx={{ minWidth: 36 }}>
                    <CancelIcon sx={{ color: 'error.main' }} />
                  </ListItemIcon>
                  <ListItemText
                    primary="Retirer l'attribution"
                    secondary="Vous devez toujours mentionner Cyberprevs"
                  />
                </ListItem>
                <ListItem>
                  <ListItemIcon sx={{ minWidth: 36 }}>
                    <CancelIcon sx={{ color: 'error.main' }} />
                  </ListItemIcon>
                  <ListItemText
                    primary="Service payant"
                    secondary="Interdiction d'offrir comme service commercial"
                  />
                </ListItem>
              </List>
            </Box>
          </Grid>
        </Grid>

        <Box
          sx={{
            mt: 3,
            p: 2,
            borderRadius: 2,
            bgcolor: 'rgba(102, 126, 234, 0.1)',
            border: '1px solid rgba(102, 126, 234, 0.3)',
          }}
        >
          <Typography variant="body2" color="text.secondary" paragraph>
            <strong>Usage commercial :</strong> Pour toute demande d'utilisation commerciale ou de licence
            propriétaire, veuillez contacter Cyberprevs.
          </Typography>
          <Typography variant="body2" color="text.secondary">
            <strong>Attribution requise :</strong> Vous devez donner le crédit approprié à Cyberprevs, fournir
            un lien vers la licence, et indiquer si des modifications ont été apportées.
          </Typography>
        </Box>
      </Paper>

      {/* Technical Information */}
      <Paper sx={{ p: 3, mb: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
          <CodeIcon sx={{ fontSize: 32, mr: 2, color: 'primary.main' }} />
          <Typography variant="h5" fontWeight={700}>
            Informations Techniques
          </Typography>
        </Box>

        <Grid container spacing={2}>
          <Grid item xs={12} sm={6} md={3}>
            <Box sx={{ textAlign: 'center', p: 2 }}>
              <Typography variant="h6" fontWeight={700} color="primary.main">
                20+
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Types de PII détectés
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Box sx={{ textAlign: 'center', p: 2 }}>
              <Typography variant="h6" fontWeight={700} color="primary.main">
                7
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Formats de fichiers
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Box sx={{ textAlign: 'center', p: 2 }}>
              <Typography variant="h6" fontWeight={700} color="primary.main">
                4
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Formats de rapports
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Box sx={{ textAlign: 'center', p: 2 }}>
              <Typography variant="h6" fontWeight={700} color="primary.main">
                100%
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Traitement local
              </Typography>
            </Box>
          </Grid>
        </Grid>

        <Divider sx={{ my: 3 }} />

        <Typography variant="body2" color="text.secondary" paragraph>
          <strong>Technologies utilisées :</strong>
        </Typography>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
          <Chip label=".NET 8.0" size="small" variant="outlined" />
          <Chip label="React 19" size="small" variant="outlined" />
          <Chip label="TypeScript" size="small" variant="outlined" />
          <Chip label="Electron" size="small" variant="outlined" />
          <Chip label="Material-UI" size="small" variant="outlined" />
          <Chip label="SignalR" size="small" variant="outlined" />
          <Chip label="SQLite" size="small" variant="outlined" />
          <Chip label="SQLCipher" size="small" variant="outlined" />
        </Box>

        <Typography variant="body2" color="text.secondary" paragraph>
          <strong>Conformité :</strong>
        </Typography>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
          <Chip label="RGPD (EU)" size="small" color="primary" />
          <Chip label="APDP (Bénin)" size="small" color="primary" />
          <Chip label="Loi N°2017-20" size="small" color="primary" />
        </Box>
      </Paper>

      {/* Links */}
      <Paper sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
          <GitHubIcon sx={{ fontSize: 32, mr: 2, color: 'primary.main' }} />
          <Typography variant="h5" fontWeight={700}>
            Liens Utiles
          </Typography>
        </Box>

        <List>
          <ListItem>
            <ListItemText
              primary={
                <Link
                  href="https://creativecommons.org/licenses/by-nc/4.0/"
                  target="_blank"
                  rel="noopener noreferrer"
                  sx={{ textDecoration: 'none', fontWeight: 600 }}
                >
                  📄 Texte complet de la licence CC BY-NC 4.0
                </Link>
              }
              secondary="Consultez les termes complets de la licence"
            />
          </ListItem>
          <ListItem>
            <ListItemText
              primary={
                <Link
                  href="https://github.com/cyberprevs/pii-scanner"
                  target="_blank"
                  rel="noopener noreferrer"
                  sx={{ textDecoration: 'none', fontWeight: 600 }}
                >
                  💻 Code source sur GitHub
                </Link>
              }
              secondary="Accédez au dépôt GitHub du projet"
            />
          </ListItem>
          <ListItem>
            <ListItemText
              primary={
                <Link
                  href="https://github.com/cyberprevs/pii-scanner/blob/main/CONTRIBUTING.md"
                  target="_blank"
                  rel="noopener noreferrer"
                  sx={{ textDecoration: 'none', fontWeight: 600 }}
                >
                  🤝 Guide de contribution
                </Link>
              }
              secondary="Comment contribuer au projet"
            />
          </ListItem>
          <ListItem>
            <ListItemText
              primary={
                <Link
                  href="https://github.com/cyberprevs/pii-scanner/issues"
                  target="_blank"
                  rel="noopener noreferrer"
                  sx={{ textDecoration: 'none', fontWeight: 600 }}
                >
                  🐛 Signaler un bug
                </Link>
              }
              secondary="Signalez des bugs ou proposez des améliorations"
            />
          </ListItem>
        </List>
      </Paper>

      {/* Disclaimer */}
      <Box
        sx={{
          mt: 4,
          p: 2,
          borderRadius: 2,
          bgcolor: 'rgba(255, 152, 0, 0.1)',
          border: '1px solid rgba(255, 152, 0, 0.3)',
        }}
      >
        <Typography variant="body2" color="text.secondary" paragraph>
          <strong>⚠️ Avertissement :</strong> Ce logiciel est fourni "tel quel", sans garantie d'aucune sorte,
          expresse ou implicite. En aucun cas, les auteurs ou les détenteurs des droits d'auteur ne seront tenus
          responsables de toute réclamation, dommage ou autre responsabilité.
        </Typography>
        <Typography variant="body2" color="text.secondary">
          L'utilisation de ce logiciel implique l'acceptation des termes de la licence CC BY-NC 4.0 et l'engagement
          à respecter les lois applicables en matière de protection des données personnelles.
        </Typography>
      </Box>
    </Container>
  );
};

export default About;
