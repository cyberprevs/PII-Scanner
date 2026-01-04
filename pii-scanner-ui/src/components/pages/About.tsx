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
  Alert,
} from '@mui/material';
import InfoIcon from '@mui/icons-material/Info';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import SecurityIcon from '@mui/icons-material/Security';
import GavelIcon from '@mui/icons-material/Gavel';
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
          Ce projet est distribué sous la <strong>licence MIT</strong>, une licence open source permissive
          qui autorise l'usage commercial, la modification et la distribution libre du code.
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
                    primary="Utiliser commercialement"
                    secondary="Usage commercial autorisé sans restriction"
                  />
                </ListItem>
                <ListItem>
                  <ListItemIcon sx={{ minWidth: 36 }}>
                    <CheckCircleIcon sx={{ color: 'success.main' }} />
                  </ListItemIcon>
                  <ListItemText
                    primary="Modifier le code"
                    secondary="Adaptez le code source à vos besoins"
                  />
                </ListItem>
                <ListItem>
                  <ListItemIcon sx={{ minWidth: 36 }}>
                    <CheckCircleIcon sx={{ color: 'success.main' }} />
                  </ListItemIcon>
                  <ListItemText
                    primary="Distribuer et vendre"
                    secondary="Partagez ou vendez le logiciel librement"
                  />
                </ListItem>
                <ListItem>
                  <ListItemIcon sx={{ minWidth: 36 }}>
                    <CheckCircleIcon sx={{ color: 'success.main' }} />
                  </ListItemIcon>
                  <ListItemText
                    primary="Usage privé"
                    secondary="Utilisez pour vos projets personnels ou professionnels"
                  />
                </ListItem>
              </List>
            </Box>
          </Grid>

          {/* Obligations */}
          <Grid item xs={12} md={6}>
            <Box
              sx={{
                p: 2,
                borderRadius: 2,
                bgcolor: 'rgba(255, 152, 0, 0.1)',
                border: '1px solid rgba(255, 152, 0, 0.3)',
              }}
            >
              <Typography variant="h6" fontWeight={700} sx={{ mb: 2, color: 'warning.main' }}>
                📋 Vos seules obligations
              </Typography>
              <List dense>
                <ListItem>
                  <ListItemIcon sx={{ minWidth: 36 }}>
                    <CheckCircleIcon sx={{ color: 'warning.main' }} />
                  </ListItemIcon>
                  <ListItemText
                    primary="Conserver le copyright"
                    secondary="Incluez la notice de copyright dans vos copies"
                  />
                </ListItem>
                <ListItem>
                  <ListItemIcon sx={{ minWidth: 36 }}>
                    <CheckCircleIcon sx={{ color: 'warning.main' }} />
                  </ListItemIcon>
                  <ListItemText
                    primary="Inclure la licence"
                    secondary="Distribuez le fichier LICENSE avec le logiciel"
                  />
                </ListItem>
                <ListItem>
                  <ListItemIcon sx={{ minWidth: 36 }}>
                    <CheckCircleIcon sx={{ color: 'warning.main' }} />
                  </ListItemIcon>
                  <ListItemText
                    primary="Pas de garantie"
                    secondary="Le logiciel est fourni 'tel quel' sans garantie"
                  />
                </ListItem>
                <ListItem>
                  <ListItemIcon sx={{ minWidth: 36 }}>
                    <CheckCircleIcon sx={{ color: 'warning.main' }} />
                  </ListItemIcon>
                  <ListItemText
                    primary="Responsabilité limitée"
                    secondary="Les auteurs ne sont pas responsables des dommages"
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
            <strong>📜 Licence MIT :</strong> Cette licence est l'une des plus permissives. Vous êtes libre d'utiliser,
            modifier, distribuer et vendre ce logiciel. La seule exigence est de conserver la notice de copyright.
          </Typography>
          <Typography variant="body2" color="text.secondary">
            <strong>💼 Support commercial :</strong> Bien que la licence permette l'usage commercial, Cyberprevs propose
            des services de support, formation et consulting personnalisés. Contactez-nous pour plus d'informations.
          </Typography>
        </Box>
      </Paper>

      {/* Links */}
      <Paper sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
          <GitHubIcon sx={{ fontSize: 32, mr: 2, color: 'primary.main' }} />
          <Typography variant="h5" fontWeight={700}>
            Liens et Documentation
          </Typography>
        </Box>

        <Alert severity="info" sx={{ mb: 3 }}>
          💡 Pour les <strong>guides pratiques, FAQ et support</strong>, consultez la page{' '}
          <Link href="/support" underline="hover" sx={{ fontWeight: 600 }}>
            Support
          </Link>
        </Alert>

        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
            <Link
              href="https://github.com/cyberprevs/pii-scanner"
              target="_blank"
              rel="noopener noreferrer"
              sx={{ textDecoration: 'none' }}
            >
              <Card sx={{ p: 2, '&:hover': { bgcolor: 'action.hover' } }}>
                <Typography variant="subtitle1" fontWeight={600} gutterBottom>
                  💻 Code source GitHub
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Dépôt du projet et documentation
                </Typography>
              </Card>
            </Link>
          </Grid>

          <Grid item xs={12} sm={6}>
            <Link
              href="https://github.com/cyberprevs/pii-scanner/blob/main/SECURITY.md"
              target="_blank"
              rel="noopener noreferrer"
              sx={{ textDecoration: 'none' }}
            >
              <Card sx={{ p: 2, '&:hover': { bgcolor: 'action.hover' } }}>
                <Typography variant="subtitle1" fontWeight={600} gutterBottom>
                  🔒 Documentation sécurité
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  13 protections : HTTPS, SQLCipher, JWT, CSRF, CSP
                </Typography>
              </Card>
            </Link>
          </Grid>

          <Grid item xs={12} sm={6}>
            <Link
              href="https://opensource.org/licenses/MIT"
              target="_blank"
              rel="noopener noreferrer"
              sx={{ textDecoration: 'none' }}
            >
              <Card sx={{ p: 2, '&:hover': { bgcolor: 'action.hover' } }}>
                <Typography variant="subtitle1" fontWeight={600} gutterBottom>
                  📄 Licence MIT
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Texte complet de la licence open source
                </Typography>
              </Card>
            </Link>
          </Grid>

          <Grid item xs={12} sm={6}>
            <Link
              href="https://cyberprevs.com"
              target="_blank"
              rel="noopener noreferrer"
              sx={{ textDecoration: 'none' }}
            >
              <Card sx={{ p: 2, '&:hover': { bgcolor: 'action.hover' } }}>
                <Typography variant="subtitle1" fontWeight={600} gutterBottom>
                  🏢 Site Cyberprevs
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Nos autres projets et services
                </Typography>
              </Card>
            </Link>
          </Grid>
        </Grid>
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
          L'utilisation de ce logiciel implique l'acceptation des termes de la licence MIT et l'engagement
          à respecter les lois applicables en matière de protection des données personnelles.
        </Typography>
      </Box>
    </Container>
  );
};

export default About;
