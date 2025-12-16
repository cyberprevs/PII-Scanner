import { Box, Typography, Card, CardContent, Button } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import SearchIcon from '@mui/icons-material/Search';
import DashboardIcon from '@mui/icons-material/Dashboard';
import AssessmentIcon from '@mui/icons-material/Assessment';
import SecurityIcon from '@mui/icons-material/Security';

export default function Home() {
  const navigate = useNavigate();

  const features = [
    {
      title: 'Scanner',
      description: 'Lancer un nouveau scan de fichiers pour détecter les PII',
      icon: <SearchIcon sx={{ fontSize: 48, color: '#667eea' }} />,
      path: '/scanner',
      color: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    },
    {
      title: 'Tableau de bord',
      description: 'Vue d\'ensemble et graphiques des données scannées',
      icon: <DashboardIcon sx={{ fontSize: 48, color: '#4facfe' }} />,
      path: '/dashboard',
      color: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
    },
    {
      title: 'Rapports',
      description: 'Analytics détaillés et visualisations avancées',
      icon: <AssessmentIcon sx={{ fontSize: 48, color: '#43e97b' }} />,
      path: '/reports',
      color: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
    },
  ];

  return (
    <Box>
      {/* Hero Section */}
      <Box
        sx={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          borderRadius: 4,
          p: 6,
          color: 'white',
          mb: 4,
          textAlign: 'center',
        }}
      >
        <SecurityIcon sx={{ fontSize: 72, mb: 2 }} />
        <Typography variant="h3" fontWeight={700} gutterBottom>
          PII Scanner
        </Typography>
        <Typography variant="h6" sx={{ opacity: 0.9, maxWidth: 600, mx: 'auto' }}>
          Détection intelligente de données personnelles identifiables (PII) conforme à la Loi N°2017-20 du Bénin
        </Typography>
        <Button
          variant="contained"
          size="large"
          onClick={() => navigate('/scanner')}
          sx={{
            mt: 3,
            backgroundColor: 'white',
            color: '#667eea',
            px: 4,
            py: 1.5,
            fontSize: '1.1rem',
            '&:hover': {
              backgroundColor: 'rgba(255,255,255,0.9)',
            },
          }}
          startIcon={<SearchIcon />}
        >
          Lancer un scan
        </Button>
      </Box>

      {/* Features Grid */}
      <Box sx={{ display: 'flex', gap: 3, flexWrap: 'wrap', mb: 6 }}>
        {features.map((feature) => (
          <Box key={feature.title} sx={{ flex: '1 1 calc(33.333% - 16px)', minWidth: 280 }}>
            <Card
              sx={{
                height: '100%',
                cursor: 'pointer',
                transition: 'transform 0.2s, box-shadow 0.2s',
                '&:hover': {
                  transform: 'translateY(-8px)',
                  boxShadow: '0 12px 24px rgba(0,0,0,0.15)',
                },
              }}
              onClick={() => navigate(feature.path)}
            >
              <CardContent sx={{ textAlign: 'center', p: 4 }}>
                <Box
                  sx={{
                    width: 80,
                    height: 80,
                    borderRadius: '50%',
                    background: feature.color,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    mx: 'auto',
                    mb: 2,
                  }}
                >
                  {feature.icon}
                </Box>
                <Typography variant="h5" fontWeight={600} gutterBottom>
                  {feature.title}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {feature.description}
                </Typography>
              </CardContent>
            </Card>
          </Box>
        ))}
      </Box>

      {/* Stats Section */}
      <Box>
        <Typography variant="h5" fontWeight={600} gutterBottom>
          Fonctionnalités clés
        </Typography>
        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', mt: 2 }}>
          <Box sx={{ flex: '1 1 calc(25% - 12px)', minWidth: 200 }}>
            <Card sx={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
              <CardContent>
                <Typography variant="h4" fontWeight={700} color="white">
                  20
                </Typography>
                <Typography variant="body2" color="rgba(255,255,255,0.9)">
                  Types de PII béninois
                </Typography>
              </CardContent>
            </Card>
          </Box>
          <Box sx={{ flex: '1 1 calc(25% - 12px)', minWidth: 200 }}>
            <Card sx={{ background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)' }}>
              <CardContent>
                <Typography variant="h4" fontWeight={700} color="white">
                  100%
                </Typography>
                <Typography variant="body2" color="rgba(255,255,255,0.9)">
                  Local et sécurisé
                </Typography>
              </CardContent>
            </Card>
          </Box>
          <Box sx={{ flex: '1 1 calc(25% - 12px)', minWidth: 200 }}>
            <Card sx={{ background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)' }}>
              <CardContent>
                <Typography variant="h4" fontWeight={700} color="white">
                  4
                </Typography>
                <Typography variant="body2" color="rgba(255,255,255,0.9)">
                  Formats de rapports
                </Typography>
              </CardContent>
            </Card>
          </Box>
          <Box sx={{ flex: '1 1 calc(25% - 12px)', minWidth: 200 }}>
            <Card sx={{ background: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)' }}>
              <CardContent>
                <Typography variant="h4" fontWeight={700} color="white">
                  ⚡
                </Typography>
                <Typography variant="body2" color="rgba(255,255,255,0.9)">
                  Traitement parallèle
                </Typography>
              </CardContent>
            </Card>
          </Box>
        </Box>
      </Box>
    </Box>
  );
}
