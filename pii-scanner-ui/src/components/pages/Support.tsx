import { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  Stack,
  Card,
  CardContent,
  CardActions,
  Button,
  TextField,
  Alert,
  Divider,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Link,
  IconButton,
} from '@mui/material';
import GitHubIcon from '@mui/icons-material/GitHub';
import BugReportIcon from '@mui/icons-material/BugReport';
import VideoLibraryIcon from '@mui/icons-material/VideoLibrary';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import SendIcon from '@mui/icons-material/Send';
import ArticleIcon from '@mui/icons-material/Article';
import ContactSupportIcon from '@mui/icons-material/ContactSupport';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';

interface FAQ {
  question: string;
  answer: string;
}

const faqs: FAQ[] = [
  {
    question: 'Comment démarrer un nouveau scan ?',
    answer: 'Accédez à la page "Nouveau Scan" depuis le menu latéral, sélectionnez le répertoire à analyser, puis cliquez sur "Démarrer le scan". Les résultats apparaîtront automatiquement une fois l\'analyse terminée.'
  },
  {
    question: 'Quels types de fichiers sont analysés ?',
    answer: 'PII Scanner analyse les fichiers .docx, .xlsx, .pdf, .txt, .log, .csv et .json. Les fichiers binaires et exécutables sont ignorés.'
  },
  {
    question: 'Comment interpréter les niveaux de risque ?',
    answer: 'ÉLEVÉ : Données bancaires détectées ou plus de 10 PII. MOYEN : 3 à 10 PII détectés. FAIBLE : 1 à 2 PII détectés.'
  },
  {
    question: 'Mes données sont-elles envoyées à un serveur externe ?',
    answer: 'Non, toutes les analyses sont effectuées localement sur votre machine. Aucune donnée n\'est transmise à l\'extérieur.'
  },
  {
    question: 'Comment exporter les résultats ?',
    answer: 'Rendez-vous sur la page "Exports" et choisissez le format souhaité : CSV, JSON, HTML ou Excel. Le rapport sera téléchargé automatiquement.'
  },
  {
    question: 'Puis-je sauvegarder ma base de données ?',
    answer: 'Oui, si vous êtes administrateur, accédez à "Base de données" et cliquez sur "Créer une sauvegarde". Vous pouvez restaurer ou télécharger les sauvegardes à tout moment.'
  },
  {
    question: 'Comment gérer les utilisateurs ?',
    answer: 'Les administrateurs peuvent créer, modifier ou supprimer des utilisateurs depuis la page "Utilisateurs".'
  },
  {
    question: 'L\'application fonctionne-t-elle hors ligne ?',
    answer: 'Oui, PII Scanner fonctionne entièrement en local. Une connexion Internet n\'est pas nécessaire pour analyser vos fichiers.'
  },
];

export default function Support() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  });
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // Validation
    if (!formData.name || !formData.email || !formData.subject || !formData.message) {
      setError('Veuillez remplir tous les champs');
      setTimeout(() => setError(''), 3000);
      return;
    }

    // Validation email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError('Adresse email invalide');
      setTimeout(() => setError(''), 3000);
      return;
    }

    // Ouvrir le client email par défaut avec les données pré-remplies
    const mailtoLink = `mailto:support@piiscanner.com?subject=${encodeURIComponent(formData.subject)}&body=${encodeURIComponent(
      `Nom: ${formData.name}\nEmail: ${formData.email}\n\n${formData.message}`
    )}`;

    window.open(mailtoLink, '_blank');

    setSuccess('Votre client email a été ouvert. Veuillez envoyer le message.');
    setTimeout(() => setSuccess(''), 5000);

    // Reset form
    setFormData({ name: '', email: '', subject: '', message: '' });
  };

  const openExternalLink = (url: string) => {
    // Utilise window.location.href pour Electron qui gère automatiquement les liens externes
    const link = document.createElement('a');
    link.href = url;
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    link.click();
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom fontWeight={700} sx={{
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
      }}>
        Centre d'aide et Support
      </Typography>
      <Typography variant="body1" color="text.secondary" paragraph>
        Trouvez de l'aide, consultez la documentation ou contactez-nous
      </Typography>

      {/* Section Soutenir le projet */}
      <Alert severity="info" sx={{ mb: 3 }}>
        <Typography variant="body2">
          <strong>PII Scanner est gratuit et open-source.</strong> Soutenez le projet avec une contribution à prix libre. Chaque don, quelle que soit sa taille, aide à maintenir et améliorer l'outil pour toute la communauté.
        </Typography>
      </Alert>

      <Typography variant="h5" fontWeight={700} gutterBottom sx={{ mt: 4, mb: 2 }}>
        ❤️ Soutenir le projet
      </Typography>

      <Stack direction={{ xs: 'column', md: 'row' }} spacing={3} sx={{ mb: 4 }}>
        {/* Ko-fi */}
        <Card sx={{ flex: 1, display: 'flex', flexDirection: 'column', border: '2px solid #FF5E5B' }}>
          <CardContent sx={{ flexGrow: 1 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <Typography sx={{ fontSize: 40, mr: 2 }}>☕</Typography>
              <Typography variant="h6" fontWeight={600}>
                Ko-fi
              </Typography>
            </Box>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
              Faites un don via Ko-fi. Montant libre à partir de 3€.
            </Typography>
            <Typography variant="body2" sx={{ fontWeight: 500, color: '#FF5E5B' }}>
              ✨ Votre prix, votre contribution
            </Typography>
          </CardContent>
          <CardActions sx={{ p: 2, pt: 0 }}>
            <Button
              fullWidth
              variant="contained"
              sx={{
                bgcolor: '#FF5E5B',
                '&:hover': { bgcolor: '#E54E4B' }
              }}
              endIcon={<OpenInNewIcon />}
              onClick={() => openExternalLink('https://ko-fi.com/Y8Y31QXZ2Y')}
            >
              Faire un don Ko-fi
            </Button>
          </CardActions>
        </Card>

        {/* PayPal */}
        <Card sx={{ flex: 1, display: 'flex', flexDirection: 'column', border: '2px solid #0070BA' }}>
          <CardContent sx={{ flexGrow: 1 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <Typography sx={{ fontSize: 40, mr: 2 }}>💳</Typography>
              <Typography variant="h6" fontWeight={600}>
                PayPal
              </Typography>
            </Box>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
              Faites un don via PayPal. Montant totalement libre.
            </Typography>
            <Typography variant="body2" sx={{ fontWeight: 500, color: '#0070BA' }}>
              💰 Sécurisé et flexible
            </Typography>
          </CardContent>
          <CardActions sx={{ p: 2, pt: 0 }}>
            <Button
              fullWidth
              variant="contained"
              sx={{
                bgcolor: '#0070BA',
                '&:hover': { bgcolor: '#005EA6' }
              }}
              endIcon={<OpenInNewIcon />}
              onClick={() => openExternalLink('https://www.paypal.com/donate/?hosted_button_id=VOTRE_ID')}
            >
              Faire un don PayPal
            </Button>
          </CardActions>
        </Card>
      </Stack>

      <Typography variant="h5" fontWeight={700} gutterBottom sx={{ mt: 4, mb: 2 }}>
        📚 Ressources
      </Typography>

      <Stack direction={{ xs: 'column', md: 'row' }} spacing={3} sx={{ mb: 4 }}>
        {/* Ressources principales */}
        <Card sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
          <CardContent sx={{ flexGrow: 1 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <GitHubIcon sx={{ fontSize: 40, color: '#667eea', mr: 2 }} />
              <Typography variant="h6" fontWeight={600}>
                Documentation GitHub
              </Typography>
            </Box>
            <Typography variant="body2" color="text.secondary">
              Consultez la documentation complète, les guides d'installation et les exemples de code sur notre dépôt GitHub.
            </Typography>
          </CardContent>
          <CardActions sx={{ p: 2, pt: 0 }}>
            <Button
              fullWidth
              variant="outlined"
              endIcon={<OpenInNewIcon />}
              onClick={() => openExternalLink('https://github.com/cyberprevs/pii-scanner')}
            >
              Voir sur GitHub
            </Button>
          </CardActions>
        </Card>

        <Card sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
          <CardContent sx={{ flexGrow: 1 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <BugReportIcon sx={{ fontSize: 40, color: '#e74c3c', mr: 2 }} />
              <Typography variant="h6" fontWeight={600}>
                Signaler un bug
              </Typography>
            </Box>
            <Typography variant="body2" color="text.secondary">
              Vous avez rencontré un problème ? Signalez-le sur GitHub Issues pour que nous puissions le corriger rapidement.
            </Typography>
          </CardContent>
          <CardActions sx={{ p: 2, pt: 0 }}>
            <Button
              fullWidth
              variant="outlined"
              color="error"
              endIcon={<OpenInNewIcon />}
              onClick={() => openExternalLink('https://github.com/cyberprevs/pii-scanner/issues/new')}
            >
              Créer un ticket
            </Button>
          </CardActions>
        </Card>

        <Card sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
          <CardContent sx={{ flexGrow: 1 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <VideoLibraryIcon sx={{ fontSize: 40, color: '#f39c12', mr: 2 }} />
              <Typography variant="h6" fontWeight={600}>
                Tutoriels vidéo
              </Typography>
            </Box>
            <Typography variant="body2" color="text.secondary">
              Apprenez à utiliser PII Scanner avec nos tutoriels vidéo détaillés et nos démonstrations pratiques.
            </Typography>
          </CardContent>
          <CardActions sx={{ p: 2, pt: 0 }}>
            <Button
              fullWidth
              variant="outlined"
              endIcon={<OpenInNewIcon />}
              onClick={() => openExternalLink('https://www.youtube.com/@piiscanner')}
            >
              Voir les vidéos
            </Button>
          </CardActions>
        </Card>

        <Card sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
          <CardContent sx={{ flexGrow: 1 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <AddCircleOutlineIcon sx={{ fontSize: 40, color: '#27ae60', mr: 2 }} />
              <Typography variant="h6" fontWeight={600}>
                Suggérer un pattern
              </Typography>
            </Box>
            <Typography variant="body2" color="text.secondary">
              Vous connaissez un type de donnée personnelle non détecté ? Proposez un nouveau pattern de détection.
            </Typography>
          </CardContent>
          <CardActions sx={{ p: 2, pt: 0 }}>
            <Button
              fullWidth
              variant="outlined"
              color="success"
              endIcon={<OpenInNewIcon />}
              onClick={() => openExternalLink('https://github.com/cyberprevs/pii-scanner/issues/new?labels=enhancement,pattern&template=suggest_pattern.md&title=[Pattern]%20')}
            >
              Proposer un pattern
            </Button>
          </CardActions>
        </Card>
      </Stack>

      <Stack direction={{ xs: 'column', lg: 'row' }} spacing={3}>
        {/* Formulaire de contact */}
        <Box sx={{ flex: 1 }}>
          <Paper sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
              <ContactSupportIcon sx={{ fontSize: 32, color: '#667eea', mr: 2 }} />
              <Typography variant="h6" fontWeight={600}>
                Contactez-nous
              </Typography>
            </Box>

            {success && (
              <Alert severity="success" sx={{ mb: 2 }}>
                {success}
              </Alert>
            )}
            {error && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {error}
              </Alert>
            )}

            <form onSubmit={handleSubmit}>
              <TextField
                fullWidth
                label="Nom complet"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                margin="normal"
                required
              />
              <TextField
                fullWidth
                label="Email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleInputChange}
                margin="normal"
                required
              />
              <TextField
                fullWidth
                label="Sujet"
                name="subject"
                value={formData.subject}
                onChange={handleInputChange}
                margin="normal"
                required
              />
              <TextField
                fullWidth
                label="Message"
                name="message"
                value={formData.message}
                onChange={handleInputChange}
                margin="normal"
                multiline
                rows={6}
                required
              />
              <Button
                type="submit"
                variant="contained"
                fullWidth
                size="large"
                endIcon={<SendIcon />}
                sx={{ mt: 2 }}
              >
                Envoyer le message
              </Button>
            </form>

            <Divider sx={{ my: 3 }} />

            <Typography variant="body2" color="text.secondary" align="center">
              Ou écrivez-nous directement à{' '}
              <Link href="mailto:contact@cyberpervs.fr" underline="hover">
                support@piiscanner.com
              </Link>
            </Typography>
          </Paper>
        </Box>

        {/* FAQ */}
        <Box sx={{ flex: 1 }}>
          <Paper sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
              <HelpOutlineIcon sx={{ fontSize: 32, color: '#667eea', mr: 2 }} />
              <Typography variant="h6" fontWeight={600}>
                Questions fréquentes (FAQ)
              </Typography>
            </Box>

            {faqs.map((faq, index) => (
              <Accordion key={index} sx={{ mb: 1 }}>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Typography fontWeight={500}>{faq.question}</Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <Typography variant="body2" color="text.secondary">
                    {faq.answer}
                  </Typography>
                </AccordionDetails>
              </Accordion>
            ))}
          </Paper>
        </Box>
      </Stack>

      {/* Ressources supplémentaires */}
      <Box sx={{ mt: 3 }}>
          <Paper sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
              <ArticleIcon sx={{ fontSize: 32, color: '#667eea', mr: 2 }} />
              <Typography variant="h6" fontWeight={600}>
                Ressources supplémentaires
              </Typography>
            </Box>

            <List>
              <ListItem>
                <ListItemIcon>
                  <ArticleIcon color="primary" />
                </ListItemIcon>
                <ListItemText
                  primary="Guide de démarrage rapide"
                  secondary="Apprenez les bases de PII Scanner en 5 minutes"
                />
                <IconButton onClick={() => openExternalLink('https://github.com/cyberprevs/pii-scanner/wiki/Quick-Start')}>
                  <OpenInNewIcon />
                </IconButton>
              </ListItem>
              <Divider component="li" />
              <ListItem>
                <ListItemIcon>
                  <ArticleIcon color="primary" />
                </ListItemIcon>
                <ListItemText
                  primary="Architecture technique"
                  secondary="Découvrez comment fonctionne PII Scanner en interne"
                />
                <IconButton onClick={() => openExternalLink('https://github.com/cyberprevs/pii-scanner/wiki/Architecture')}>
                  <OpenInNewIcon />
                </IconButton>
              </ListItem>
              <Divider component="li" />
              <ListItem>
                <ListItemIcon>
                  <ArticleIcon color="primary" />
                </ListItemIcon>
                <ListItemText
                  primary="Guide de conformité RGPD"
                  secondary="Utilisez PII Scanner pour votre mise en conformité RGPD"
                />
                <IconButton onClick={() => openExternalLink('https://github.com/cyberprevs/pii-scanner/wiki/GDPR-Compliance')}>
                  <OpenInNewIcon />
                </IconButton>
              </ListItem>
              <Divider component="li" />
              <ListItem>
                <ListItemIcon>
                  <ArticleIcon color="primary" />
                </ListItemIcon>
                <ListItemText
                  primary="API Reference"
                  secondary="Documentation complète de l'API pour les développeurs"
                />
                <IconButton onClick={() => openExternalLink('https://localhost:5001/swagger')}>
                  <OpenInNewIcon />
                </IconButton>
              </ListItem>
            </List>
          </Paper>
        </Box>
    </Box>
  );
}
