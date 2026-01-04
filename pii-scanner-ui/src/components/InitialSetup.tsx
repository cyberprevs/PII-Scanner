import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  TextField,
  Button,
  Typography,
  Alert,
  Container,
  LinearProgress,
  InputAdornment,
  IconButton
} from '@mui/material';
import {
  Visibility,
  VisibilityOff,
  Security as SecurityIcon
} from '@mui/icons-material';
import axiosInstance from '../services/axios';

interface FormData {
  username: string;
  email: string;
  fullName: string;
  password: string;
  confirmPassword: string;
}

interface InitialSetupProps {
  onSetupComplete?: () => void;
}

const InitialSetup: React.FC<InitialSetupProps> = ({ onSetupComplete }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    username: '',
    email: '',
    fullName: '',
    password: '',
    confirmPassword: ''
  });

  const validateForm = (): boolean => {
    if (!formData.username || formData.username.length < 3) {
      setError('Le nom d\'utilisateur doit contenir au moins 3 caractères');
      return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email || !emailRegex.test(formData.email)) {
      setError('Veuillez entrer une adresse email valide');
      return false;
    }

    if (!formData.fullName || formData.fullName.length < 2) {
      setError('Le nom complet doit contenir au moins 2 caractères');
      return false;
    }

    if (!formData.password || formData.password.length < 12) {
      setError('Le mot de passe doit contenir au moins 12 caractères');
      return false;
    }

    // Vérifier la complexité du mot de passe
    const hasUpperCase = /[A-Z]/.test(formData.password);
    const hasLowerCase = /[a-z]/.test(formData.password);
    const hasNumber = /[0-9]/.test(formData.password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(formData.password);

    if (!hasUpperCase || !hasLowerCase || !hasNumber || !hasSpecialChar) {
      setError('Le mot de passe doit contenir au moins une majuscule, une minuscule, un chiffre et un caractère spécial');
      return false;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Les mots de passe ne correspondent pas');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!validateForm()) {
      return;
    }

    try {
      setLoading(true);

      const response = await axiosInstance.post('/initialization/setup', {
        username: formData.username,
        email: formData.email,
        fullName: formData.fullName,
        password: formData.password,
        confirmPassword: formData.confirmPassword
      });

      if (response.data.success) {
        // Notifier le parent que le setup est terminé
        if (onSetupComplete) {
          onSetupComplete();
        }

        // Forcer un rechargement complet de la page pour réinitialiser l'état
        // Cela va déclencher la vérification d'initialisation et rediriger vers login
        setTimeout(() => {
          window.location.href = '/login';
        }, 100);
      }
    } catch (err: any) {
      console.error('Setup error:', err);
      setError(err.response?.data?.message || 'Erreur lors de l\'initialisation');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field: keyof FormData) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [field]: e.target.value });
    setError(''); // Clear error when user types
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        p: 2
      }}
    >
      <Container maxWidth="sm">
        <Card elevation={8} sx={{ borderRadius: 3 }}>
          {loading && <LinearProgress />}
          <CardContent sx={{ p: 4 }}>
            <Box sx={{ textAlign: 'center', mb: 4 }}>
              <SecurityIcon sx={{ fontSize: 60, color: 'primary.main', mb: 2 }} />
              <Typography variant="h4" gutterBottom fontWeight="bold">
                Configuration Initiale
              </Typography>
              <Typography variant="body1" color="text.secondary">
                Créez votre compte administrateur pour commencer
              </Typography>
            </Box>

            {error && (
              <Alert severity="error" sx={{ mb: 3 }}>
                {error}
              </Alert>
            )}

            <form onSubmit={handleSubmit}>
              <TextField
                label="Nom d'utilisateur"
                fullWidth
                margin="normal"
                value={formData.username}
                onChange={handleChange('username')}
                required
                disabled={loading}
                helperText="Minimum 3 caractères"
                autoFocus
              />

              <TextField
                label="Email"
                type="email"
                fullWidth
                margin="normal"
                value={formData.email}
                onChange={handleChange('email')}
                required
                disabled={loading}
                helperText="Utilisé pour la récupération de compte"
              />

              <TextField
                label="Nom complet"
                fullWidth
                margin="normal"
                value={formData.fullName}
                onChange={handleChange('fullName')}
                required
                disabled={loading}
                helperText="Votre nom et prénom"
              />

              <TextField
                label="Mot de passe"
                type={showPassword ? 'text' : 'password'}
                fullWidth
                margin="normal"
                value={formData.password}
                onChange={handleChange('password')}
                required
                disabled={loading}
                helperText="Minimum 12 caractères, avec majuscule, minuscule, chiffre et caractère spécial"
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() => setShowPassword(!showPassword)}
                        edge="end"
                      >
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  )
                }}
              />

              <TextField
                label="Confirmer le mot de passe"
                type={showConfirmPassword ? 'text' : 'password'}
                fullWidth
                margin="normal"
                value={formData.confirmPassword}
                onChange={handleChange('confirmPassword')}
                required
                disabled={loading}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        edge="end"
                      >
                        {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  )
                }}
              />

              <Button
                type="submit"
                variant="contained"
                fullWidth
                size="large"
                disabled={loading}
                sx={{ mt: 3, mb: 2, py: 1.5 }}
              >
                {loading ? 'Initialisation en cours...' : 'Créer le compte administrateur'}
              </Button>

              <Alert severity="info" sx={{ mt: 2 }}>
                <Typography variant="body2">
                  <strong>Important :</strong> Ce compte aura tous les privilèges d'administration.
                  Conservez ces identifiants en lieu sûr.
                </Typography>
              </Alert>
            </form>

            {/* Cyberprevs Branding */}
            <Box sx={{ mt: 4, textAlign: 'center' }}>
              <Typography
                variant="caption"
                sx={{
                  color: 'text.secondary',
                  fontSize: '0.75rem',
                  display: 'block',
                  mb: 0.5,
                }}
              >
                Développé par
              </Typography>
              <Typography
                variant="body2"
                sx={{
                  fontWeight: 700,
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  fontSize: '1rem',
                  letterSpacing: '0.5px',
                }}
              >
                Cyberprevs
              </Typography>
              <Typography
                variant="caption"
                sx={{
                  color: 'text.secondary',
                  fontSize: '0.7rem',
                  display: 'block',
                  mt: 0.5,
                }}
              >
                v1.0.0 • © 2025
              </Typography>
            </Box>
          </CardContent>
        </Card>
      </Container>
    </Box>
  );
};

export default InitialSetup;
