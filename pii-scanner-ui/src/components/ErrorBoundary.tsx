import { Component, type ReactNode } from 'react';
import { Alert, Box, Button, Typography, Paper } from '@mui/material';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: any;
}

/**
 * Error Boundary pour capturer les erreurs React non gérées
 * Empêche l'application entière de crasher
 */
export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: any) {
    // Log l'erreur pour debugging
    console.error('Error caught by boundary:', error);
    console.error('Error info:', errorInfo);

    // Vous pouvez envoyer l'erreur à un service de monitoring (Sentry, LogRocket, etc.)
    // Example: logErrorToService(error, errorInfo);

    this.setState({ errorInfo });
  }

  handleReload = () => {
    window.location.reload();
  };

  handleGoHome = () => {
    window.location.href = '/dashboard';
  };

  render() {
    if (this.state.hasError) {
      return (
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            minHeight: '100vh',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            p: 3,
          }}
        >
          <Paper
            elevation={10}
            sx={{
              maxWidth: 600,
              p: 4,
              borderRadius: 2,
              textAlign: 'center',
            }}
          >
            <ErrorOutlineIcon sx={{ fontSize: 80, color: 'error.main', mb: 2 }} />

            <Typography variant="h4" gutterBottom fontWeight={700}>
              Une erreur inattendue s'est produite
            </Typography>

            <Typography variant="body1" color="text.secondary" paragraph>
              Nous sommes désolés, mais quelque chose s'est mal passé. Veuillez essayer de recharger la page.
            </Typography>

            {this.state.error && (
              <Alert severity="error" sx={{ mt: 3, mb: 3, textAlign: 'left' }}>
                <Typography variant="body2" fontWeight={600} gutterBottom>
                  Détails techniques :
                </Typography>
                <Typography variant="caption" component="pre" sx={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
                  {this.state.error.toString()}
                </Typography>
              </Alert>
            )}

            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', mt: 3 }}>
              <Button
                variant="contained"
                onClick={this.handleReload}
                size="large"
              >
                Recharger la page
              </Button>
              <Button
                variant="outlined"
                onClick={this.handleGoHome}
                size="large"
              >
                Retour à l'accueil
              </Button>
            </Box>

            {import.meta.env.DEV && this.state.errorInfo && (
              <Box sx={{ mt: 4, textAlign: 'left' }}>
                <Typography variant="body2" fontWeight={600} gutterBottom>
                  Stack trace (dev uniquement) :
                </Typography>
                <Typography
                  variant="caption"
                  component="pre"
                  sx={{
                    whiteSpace: 'pre-wrap',
                    wordBreak: 'break-word',
                    backgroundColor: '#f5f5f5',
                    p: 2,
                    borderRadius: 1,
                    fontSize: '0.7rem',
                    maxHeight: 300,
                    overflow: 'auto',
                  }}
                >
                  {this.state.errorInfo.componentStack}
                </Typography>
              </Box>
            )}
          </Paper>
        </Box>
      );
    }

    return this.props.children;
  }
}
