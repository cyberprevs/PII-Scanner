import React, { useState } from 'react';
import {
  Box,
  TextField,
  Button,
  Typography,
  Alert,
  LinearProgress,
  InputAdornment,
  IconButton,
  ThemeProvider,
  CssBaseline,
} from '@mui/material';
import {
  Visibility,
  VisibilityOff,
} from '@mui/icons-material';
import axiosInstance from '../services/axios';
import { createAppTheme, tokens } from '../theme/designSystem';

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

  const theme = createAppTheme(true); // Always dark
  const c = tokens.colors;

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
        if (onSetupComplete) {
          onSetupComplete();
        }

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
    setError('');
  };

  const inputSx = {
    '& .MuiOutlinedInput-root': {
      backgroundColor: c.bgInput,
      '& fieldset': { borderColor: c.borderDefault },
      '&:hover fieldset': { borderColor: '#3A3A3A' },
      '&.Mui-focused fieldset': { borderColor: c.accentPrimary, borderWidth: '1px' },
    },
    '& .MuiOutlinedInput-input': {
      color: c.textPrimary,
      '&::placeholder': { color: c.textTertiary, opacity: 1 },
    },
    '& .MuiInputLabel-root': { color: c.textSecondary, '&.Mui-focused': { color: c.accentPrimary } },
    '& .MuiFormHelperText-root': { color: c.textTertiary },
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: c.bgPrimary,
          position: 'relative',
          overflow: 'hidden',
          p: 2,
        }}
      >
        {/* Subtle background glow */}
        <Box
          sx={{
            position: 'absolute',
            top: '15%',
            left: '50%',
            transform: 'translateX(-50%)',
            width: 700,
            height: 700,
            borderRadius: '50%',
            background: `radial-gradient(circle, ${c.accentPrimaryMuted} 0%, transparent 70%)`,
            pointerEvents: 'none',
          }}
        />

        <Box
          sx={{
            width: '100%',
            maxWidth: 480,
            position: 'relative',
            zIndex: 1,
          }}
        >
          {/* Header */}
          <Box sx={{ textAlign: 'center', mb: 4 }}>
            <Box
              sx={{
                width: 48,
                height: 48,
                borderRadius: tokens.radii.md,
                backgroundColor: c.accentPrimaryMuted,
                border: `1px solid ${c.accentPrimary}`,
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                mb: 3,
              }}
            >
              <Box
                component="svg"
                viewBox="0 0 24 24"
                sx={{ width: 24, height: 24, fill: c.accentPrimary }}
              >
                <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm0 2.18l7 3.12v4.7c0 4.83-3.23 9.36-7 10.57-3.77-1.21-7-5.74-7-10.57V6.3l7-3.12z" />
              </Box>
            </Box>
            <Typography
              variant="h4"
              sx={{ fontWeight: 700, color: c.textPrimary, mb: 1, letterSpacing: '-0.02em' }}
            >
              Configuration Initiale
            </Typography>
            <Typography variant="body2" sx={{ color: c.textSecondary }}>
              Créez votre compte administrateur pour commencer
            </Typography>
          </Box>

          {/* Card */}
          <Box
            sx={{
              backgroundColor: c.bgSurface,
              border: `1px solid ${c.borderDefault}`,
              borderRadius: `${tokens.radii.xl}px`,
              p: 4,
              position: 'relative',
              overflow: 'hidden',
            }}
          >
            {loading && (
              <LinearProgress
                sx={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  backgroundColor: c.accentPrimaryMuted,
                  '& .MuiLinearProgress-bar': { backgroundColor: c.accentPrimary },
                }}
              />
            )}

            {error && (
              <Alert
                severity="error"
                sx={{
                  mb: 3,
                  backgroundColor: c.dangerMuted,
                  color: c.danger,
                  border: '1px solid rgba(244, 82, 82, 0.2)',
                  '& .MuiAlert-icon': { color: c.danger },
                }}
              >
                {error}
              </Alert>
            )}

            <form onSubmit={handleSubmit}>
              <TextField
                label="Nom d'utilisateur"
                fullWidth
                margin="normal"
                size="small"
                value={formData.username}
                onChange={handleChange('username')}
                required
                disabled={loading}
                helperText="Minimum 3 caractères"
                autoFocus
                sx={inputSx}
              />

              <TextField
                label="Email"
                type="email"
                fullWidth
                margin="normal"
                size="small"
                value={formData.email}
                onChange={handleChange('email')}
                required
                disabled={loading}
                helperText="Utilisé pour la récupération de compte"
                sx={inputSx}
              />

              <TextField
                label="Nom complet"
                fullWidth
                margin="normal"
                size="small"
                value={formData.fullName}
                onChange={handleChange('fullName')}
                required
                disabled={loading}
                helperText="Votre nom et prénom"
                sx={inputSx}
              />

              <TextField
                label="Mot de passe"
                type={showPassword ? 'text' : 'password'}
                fullWidth
                margin="normal"
                size="small"
                value={formData.password}
                onChange={handleChange('password')}
                required
                disabled={loading}
                helperText="Min. 12 caractères, majuscule, minuscule, chiffre, caractère spécial"
                sx={inputSx}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() => setShowPassword(!showPassword)}
                        edge="end"
                        sx={{ color: c.textTertiary }}
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
                size="small"
                value={formData.confirmPassword}
                onChange={handleChange('confirmPassword')}
                required
                disabled={loading}
                sx={inputSx}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        edge="end"
                        sx={{ color: c.textTertiary }}
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
                sx={{
                  mt: 3,
                  mb: 2,
                  py: 1.4,
                  backgroundColor: c.accentPrimary,
                  color: c.accentPrimaryText,
                  fontWeight: 600,
                  fontSize: '0.9rem',
                  '&:hover': { backgroundColor: c.accentPrimaryHover },
                  '&.Mui-disabled': {
                    backgroundColor: 'rgba(0, 229, 153, 0.3)',
                    color: 'rgba(10, 10, 10, 0.5)',
                  },
                }}
              >
                {loading ? 'Initialisation en cours...' : 'Créer le compte administrateur'}
              </Button>

              <Alert
                severity="info"
                sx={{
                  mt: 2,
                  backgroundColor: c.infoMuted,
                  color: c.info,
                  border: '1px solid rgba(59, 130, 246, 0.2)',
                  '& .MuiAlert-icon': { color: c.info },
                }}
              >
                <Typography variant="body2" sx={{ color: c.info }}>
                  <strong>Important :</strong> Ce compte aura tous les privilèges d'administration.
                  Conservez ces identifiants en lieu sûr.
                </Typography>
              </Alert>
            </form>
          </Box>

          {/* Branding */}
          <Box sx={{ mt: 4, textAlign: 'center' }}>
            <Typography
              variant="caption"
              sx={{ color: c.textTertiary, fontSize: '0.7rem', display: 'block', mb: 0.5 }}
            >
              Développé par
            </Typography>
            <Typography
              variant="body2"
              sx={{ fontWeight: 700, color: c.accentPrimary, fontSize: '0.95rem', letterSpacing: '0.5px' }}
            >
              Cyberprevs
            </Typography>
            <Typography
              variant="caption"
              sx={{ color: c.textTertiary, fontSize: '0.65rem', display: 'block', mt: 0.5 }}
            >
              v1.0.0
            </Typography>
          </Box>
        </Box>
      </Box>
    </ThemeProvider>
  );
};

export default InitialSetup;
