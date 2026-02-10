import React, { useState } from 'react';
import {
  Box,
  TextField,
  Button,
  Typography,
  Alert,
  CircularProgress,
  ThemeProvider,
  CssBaseline,
} from '@mui/material';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { createAppTheme, tokens } from '../theme/designSystem';

const Login: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const theme = createAppTheme(true); // Login is always dark

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      await login(username, password);
      navigate('/');
    } catch (err: any) {
      setError(err.message || 'Échec de la connexion');
    } finally {
      setIsLoading(false);
    }
  };

  const c = tokens.colors;

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
        }}
      >
        {/* Subtle background glow */}
        <Box
          sx={{
            position: 'absolute',
            top: '20%',
            left: '50%',
            transform: 'translateX(-50%)',
            width: 600,
            height: 600,
            borderRadius: '50%',
            background: `radial-gradient(circle, ${c.accentPrimaryMuted} 0%, transparent 70%)`,
            pointerEvents: 'none',
          }}
        />

        <Box
          sx={{
            width: '100%',
            maxWidth: 420,
            mx: 2,
            position: 'relative',
            zIndex: 1,
          }}
        >
          {/* Logo & Title */}
          <Box sx={{ textAlign: 'center', mb: 5 }}>
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
              sx={{
                fontWeight: 700,
                color: c.textPrimary,
                mb: 1,
                letterSpacing: '-0.02em',
              }}
            >
              PII Scanner
            </Typography>
            <Typography
              variant="body2"
              sx={{ color: c.textSecondary }}
            >
              Connexion à votre compte
            </Typography>
          </Box>

          {/* Card */}
          <Box
            sx={{
              backgroundColor: c.bgSurface,
              border: `1px solid ${c.borderDefault}`,
              borderRadius: `${tokens.radii.xl}px`,
              p: 4,
            }}
          >
            {error && (
              <Alert
                severity="error"
                sx={{
                  mb: 3,
                  backgroundColor: c.dangerMuted,
                  color: c.danger,
                  border: `1px solid rgba(244, 82, 82, 0.2)`,
                  '& .MuiAlert-icon': { color: c.danger },
                }}
              >
                {error}
              </Alert>
            )}

            <form onSubmit={handleSubmit}>
              <Box sx={{ mb: 2.5 }}>
                <Typography
                  component="label"
                  variant="body2"
                  sx={{
                    display: 'block',
                    mb: 1,
                    color: c.textSecondary,
                    fontWeight: 500,
                    fontSize: '0.8125rem',
                  }}
                >
                  Nom d'utilisateur
                </Typography>
                <TextField
                  fullWidth
                  placeholder="Entrez votre identifiant"
                  variant="outlined"
                  size="small"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  disabled={isLoading}
                  autoComplete="username"
                  autoFocus
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      backgroundColor: c.bgInput,
                      '& fieldset': { borderColor: c.borderDefault },
                      '&:hover fieldset': { borderColor: '#3A3A3A' },
                      '&.Mui-focused fieldset': {
                        borderColor: c.accentPrimary,
                        borderWidth: '1px',
                      },
                    },
                    '& .MuiOutlinedInput-input': {
                      color: c.textPrimary,
                      '&::placeholder': { color: c.textTertiary, opacity: 1 },
                    },
                  }}
                />
              </Box>

              <Box sx={{ mb: 3 }}>
                <Typography
                  component="label"
                  variant="body2"
                  sx={{
                    display: 'block',
                    mb: 1,
                    color: c.textSecondary,
                    fontWeight: 500,
                    fontSize: '0.8125rem',
                  }}
                >
                  Mot de passe
                </Typography>
                <TextField
                  fullWidth
                  placeholder="Entrez votre mot de passe"
                  type="password"
                  variant="outlined"
                  size="small"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={isLoading}
                  autoComplete="current-password"
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      backgroundColor: c.bgInput,
                      '& fieldset': { borderColor: c.borderDefault },
                      '&:hover fieldset': { borderColor: '#3A3A3A' },
                      '&.Mui-focused fieldset': {
                        borderColor: c.accentPrimary,
                        borderWidth: '1px',
                      },
                    },
                    '& .MuiOutlinedInput-input': {
                      color: c.textPrimary,
                      '&::placeholder': { color: c.textTertiary, opacity: 1 },
                    },
                  }}
                />
              </Box>

              <Button
                fullWidth
                variant="contained"
                size="large"
                type="submit"
                disabled={isLoading || !username || !password}
                sx={{
                  backgroundColor: c.accentPrimary,
                  color: c.accentPrimaryText,
                  fontWeight: 600,
                  py: 1.4,
                  fontSize: '0.9rem',
                  borderRadius: `${tokens.radii.md}px`,
                  '&:hover': {
                    backgroundColor: c.accentPrimaryHover,
                  },
                  '&.Mui-disabled': {
                    backgroundColor: 'rgba(0, 229, 153, 0.3)',
                    color: 'rgba(10, 10, 10, 0.5)',
                  },
                }}
              >
                {isLoading ? (
                  <CircularProgress size={22} sx={{ color: c.accentPrimaryText }} />
                ) : (
                  'Se connecter'
                )}
              </Button>
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
              sx={{
                fontWeight: 700,
                color: c.accentPrimary,
                fontSize: '0.95rem',
                letterSpacing: '0.5px',
              }}
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

export default Login;
