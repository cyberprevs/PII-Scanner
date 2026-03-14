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
import { useTranslation } from 'react-i18next';

export default function Support() {
  const { t } = useTranslation();

  const openExternalLink = (url: string) => {
    const link = document.createElement('a');
    link.href = url;
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    link.click();
  };

  const faqs = [
    { question: t('support.faq.q1'), answer: t('support.faq.a1') },
    { question: t('support.faq.q2'), answer: t('support.faq.a2') },
    { question: t('support.faq.q3'), answer: t('support.faq.a3') },
    { question: t('support.faq.q4'), answer: t('support.faq.a4') },
    { question: t('support.faq.q5'), answer: t('support.faq.a5') },
    { question: t('support.faq.q6'), answer: t('support.faq.a6') },
    { question: t('support.faq.q7'), answer: t('support.faq.a7') },
    { question: t('support.faq.q8'), answer: t('support.faq.a8') },
  ];

  return (
    <Box>
      <Typography variant="h4" gutterBottom fontWeight={700} sx={{
        background: 'linear-gradient(135deg, #00E599 0%, #00B876 100%)',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
      }}>
        {t('support.title')}
      </Typography>
      <Typography variant="body1" color="text.secondary" paragraph>
        {t('support.subtitle')}
      </Typography>

      <Typography variant="h5" fontWeight={700} gutterBottom sx={{ mb: 2 }}>
        {t('support.resources')}
      </Typography>

      <Grid container spacing={3} sx={{ mb: 4 }}>
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
                  {t('support.reportBug')}
                </Typography>
              </Box>
              <Typography variant="body2" color="text.secondary" sx={{ flexGrow: 1 }}>
                {t('support.reportBugDesc')}
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
                {t('support.createTicket')}
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
                  {t('support.suggestPattern')}
                </Typography>
              </Box>
              <Typography variant="body2" color="text.secondary" sx={{ flexGrow: 1 }}>
                {t('support.suggestPatternDesc')}
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
                {t('support.proposePattern')}
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
                <ArticleIcon sx={{ fontSize: 32, color: '#00E599', mr: 1.5 }} />
                <Typography variant="h6" fontWeight={600} fontSize="1.1rem">
                  {t('support.documentation')}
                </Typography>
              </Box>
              <Typography variant="body2" color="text.secondary" sx={{ flexGrow: 1 }}>
                {t('support.documentationDesc')}
              </Typography>
            </CardContent>
            <CardActions sx={{ p: 2, pt: 0 }}>
              <Button
                fullWidth
                variant="outlined"
                onClick={() => window.location.href = '/about'}
              >
                {t('support.viewAbout')}
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
                <EmailIcon sx={{ fontSize: 32, color: '#00E599', mr: 1.5 }} />
                <Typography variant="h6" fontWeight={600} fontSize="1.1rem">
                  {t('support.contact')}
                </Typography>
              </Box>
              <Typography variant="body2" color="text.secondary" sx={{ flexGrow: 1 }}>
                {t('support.contactDesc')}
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
                {t('support.sendEmail')}
              </Button>
            </CardActions>
          </Card>
        </Grid>
      </Grid>

      {/* FAQ */}
      <Paper sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
          <HelpOutlineIcon sx={{ fontSize: 32, color: '#00E599', mr: 2 }} />
          <Typography variant="h6" fontWeight={600}>
            {t('support.faqTitle')}
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
