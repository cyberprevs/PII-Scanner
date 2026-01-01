import {
  Box,
  Paper,
  Typography,
  Grid,
  Card,
  CardContent,
  CardActions,
  Button,
  Link,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from '@mui/material';
import BugReportIcon from '@mui/icons-material/BugReport';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ArticleIcon from '@mui/icons-material/Article';
import EmailIcon from '@mui/icons-material/Email';
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
  const openExternalLink = (url: string) => {
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

      <Typography variant="h5" fontWeight={700} gutterBottom sx={{ mb: 2 }}>
        📚 Ressources
      </Typography>

      <Grid container spacing={3} sx={{ mb: 4 }}>
        {/* Actions rapides */}
        <Grid item xs={12} md={3}>
          <Card sx={{
            height: 220,
            display: 'flex',
            flexDirection: 'column',
            transition: 'transform 0.2s, box-shadow 0.2s',
            '&:hover': {
              transform: 'translateY(-4px)',
              boxShadow: 4
            }
          }}>
            <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <BugReportIcon sx={{ fontSize: 32, color: '#e74c3c', mr: 1.5 }} />
                <Typography variant="h6" fontWeight={600} fontSize="1.1rem">
                  Signaler un bug
                </Typography>
              </Box>
              <Typography variant="body2" color="text.secondary" sx={{ flexGrow: 1 }}>
                Vous avez rencontré un problème ? Signalez-le rapidement.
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
        </Grid>

        <Grid item xs={12} md={3}>
          <Card sx={{
            height: 220,
            display: 'flex',
            flexDirection: 'column',
            transition: 'transform 0.2s, box-shadow 0.2s',
            '&:hover': {
              transform: 'translateY(-4px)',
              boxShadow: 4
            }
          }}>
            <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <AddCircleOutlineIcon sx={{ fontSize: 32, color: '#27ae60', mr: 1.5 }} />
                <Typography variant="h6" fontWeight={600} fontSize="1.1rem">
                  Suggérer un pattern
                </Typography>
              </Box>
              <Typography variant="body2" color="text.secondary" sx={{ flexGrow: 1 }}>
                Proposez un nouveau pattern de détection PII.
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
        </Grid>

        <Grid item xs={12} md={3}>
          <Card sx={{
            height: 220,
            display: 'flex',
            flexDirection: 'column',
            transition: 'transform 0.2s, box-shadow 0.2s',
            '&:hover': {
              transform: 'translateY(-4px)',
              boxShadow: 4
            }
          }}>
            <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <ArticleIcon sx={{ fontSize: 32, color: '#667eea', mr: 1.5 }} />
                <Typography variant="h6" fontWeight={600} fontSize="1.1rem">
                  Documentation
                </Typography>
              </Box>
              <Typography variant="body2" color="text.secondary" sx={{ flexGrow: 1 }}>
                Guides complets et informations techniques.
              </Typography>
            </CardContent>
            <CardActions sx={{ p: 2, pt: 0 }}>
              <Button
                fullWidth
                variant="outlined"
                onClick={() => window.location.href = '/about'}
              >
                Voir À propos
              </Button>
            </CardActions>
          </Card>
        </Grid>

        <Grid item xs={12} md={3}>
          <Card sx={{
            height: 220,
            display: 'flex',
            flexDirection: 'column',
            transition: 'transform 0.2s, box-shadow 0.2s',
            '&:hover': {
              transform: 'translateY(-4px)',
              boxShadow: 4
            }
          }}>
            <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <EmailIcon sx={{ fontSize: 32, color: '#667eea', mr: 1.5 }} />
                <Typography variant="h6" fontWeight={600} fontSize="1.1rem">
                  Contactez-nous
                </Typography>
              </Box>
              <Typography variant="body2" color="text.secondary" sx={{ flexGrow: 1 }}>
                Écrivez-nous directement par email.
              </Typography>
            </CardContent>
            <CardActions sx={{ p: 2, pt: 0 }}>
              <Button
                fullWidth
                variant="outlined"
                component={Link}
                href="mailto:contact@cyberpervs.fr"
                sx={{ textDecoration: 'none' }}
              >
                Envoyer un email
              </Button>
            </CardActions>
          </Card>
        </Grid>
      </Grid>

      {/* FAQ */}
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
  );
}
