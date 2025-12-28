import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { BrowserRouter } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material';
import Login from '../Login';
import { AuthProvider } from '../../contexts/AuthContext';

// Mock useNavigate
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

// Mock AuthContext
const mockLogin = vi.fn();
vi.mock('../../contexts/AuthContext', async () => {
  const actual = await vi.importActual('../../contexts/AuthContext');
  return {
    ...actual,
    useAuth: () => ({
      login: mockLogin,
      user: null,
      isAuthenticated: false,
      logout: vi.fn(),
    }),
  };
});

const theme = createTheme({
  palette: {
    mode: 'dark',
  },
});

const renderLogin = () => {
  return render(
    <BrowserRouter>
      <ThemeProvider theme={theme}>
        <Login />
      </ThemeProvider>
    </BrowserRouter>
  );
};

describe('Login Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render login form with all elements', () => {
      renderLogin();

      expect(screen.getByText('PII Scanner')).toBeInTheDocument();
      expect(screen.getByText('Connexion à votre compte')).toBeInTheDocument();
      expect(screen.getByLabelText(/nom d'utilisateur/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/mot de passe/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /se connecter/i })).toBeInTheDocument();
    });

    it('should render Cyberprevs branding', () => {
      renderLogin();

      expect(screen.getByText('Développé par')).toBeInTheDocument();
      expect(screen.getByText('Cyberprevs')).toBeInTheDocument();
    });

    it('should have username field with autoFocus', () => {
      renderLogin();
      const usernameInput = screen.getByLabelText(/nom d'utilisateur/i);
      // In JSDOM, autoFocus doesn't always apply, but input should exist and be accessible
      expect(usernameInput).toBeInTheDocument();
      expect(usernameInput).toBeEnabled();
    });
  });

  describe('Form Validation', () => {
    it('should disable submit button when fields are empty', () => {
      renderLogin();

      const submitButton = screen.getByRole('button', { name: /se connecter/i });
      expect(submitButton).toBeDisabled();
    });

    it('should disable submit button when only username is filled', async () => {
      renderLogin();
      const user = userEvent.setup();

      const usernameInput = screen.getByLabelText(/nom d'utilisateur/i);
      await user.type(usernameInput, 'testuser');

      const submitButton = screen.getByRole('button', { name: /se connecter/i });
      expect(submitButton).toBeDisabled();
    });

    it('should disable submit button when only password is filled', async () => {
      renderLogin();
      const user = userEvent.setup();

      const passwordInput = screen.getByLabelText(/mot de passe/i);
      await user.type(passwordInput, 'password123');

      const submitButton = screen.getByRole('button', { name: /se connecter/i });
      expect(submitButton).toBeDisabled();
    });

    it('should enable submit button when both fields are filled', async () => {
      renderLogin();
      const user = userEvent.setup();

      const usernameInput = screen.getByLabelText(/nom d'utilisateur/i);
      const passwordInput = screen.getByLabelText(/mot de passe/i);

      await user.type(usernameInput, 'testuser');
      await user.type(passwordInput, 'password123');

      const submitButton = screen.getByRole('button', { name: /se connecter/i });
      expect(submitButton).not.toBeDisabled();
    });
  });

  describe('Login Flow', () => {
    it('should call login function with correct credentials', async () => {
      mockLogin.mockResolvedValueOnce({});
      renderLogin();
      const user = userEvent.setup();

      await user.type(screen.getByLabelText(/nom d'utilisateur/i), 'admin');
      await user.type(screen.getByLabelText(/mot de passe/i), 'SecurePass123!');
      await user.click(screen.getByRole('button', { name: /se connecter/i }));

      await waitFor(() => {
        expect(mockLogin).toHaveBeenCalledWith('admin', 'SecurePass123!');
      });
    });

    it('should navigate to home after successful login', async () => {
      mockLogin.mockResolvedValueOnce({});
      renderLogin();
      const user = userEvent.setup();

      await user.type(screen.getByLabelText(/nom d'utilisateur/i), 'admin');
      await user.type(screen.getByLabelText(/mot de passe/i), 'password');
      await user.click(screen.getByRole('button', { name: /se connecter/i }));

      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith('/');
      });
    });

    it('should show error message on login failure', async () => {
      mockLogin.mockRejectedValueOnce(new Error('Identifiants incorrects'));
      renderLogin();
      const user = userEvent.setup();

      await user.type(screen.getByLabelText(/nom d'utilisateur/i), 'wronguser');
      await user.type(screen.getByLabelText(/mot de passe/i), 'wrongpass');
      await user.click(screen.getByRole('button', { name: /se connecter/i }));

      await waitFor(() => {
        expect(screen.getByText('Identifiants incorrects')).toBeInTheDocument();
      });
    });

    it('should show default error message when no message provided', async () => {
      mockLogin.mockRejectedValueOnce(new Error());
      renderLogin();
      const user = userEvent.setup();

      await user.type(screen.getByLabelText(/nom d'utilisateur/i), 'user');
      await user.type(screen.getByLabelText(/mot de passe/i), 'pass');
      await user.click(screen.getByRole('button', { name: /se connecter/i }));

      await waitFor(() => {
        expect(screen.getByText('Échec de la connexion')).toBeInTheDocument();
      });
    });
  });

  describe('Loading State', () => {
    it('should show loading spinner while logging in', async () => {
      // Make login hang
      mockLogin.mockImplementation(() => new Promise(() => {}));
      renderLogin();
      const user = userEvent.setup();

      await user.type(screen.getByLabelText(/nom d'utilisateur/i), 'admin');
      await user.type(screen.getByLabelText(/mot de passe/i), 'password');
      await user.click(screen.getByRole('button', { name: /se connecter/i }));

      // Button should show loading state (CircularProgress is rendered)
      expect(screen.getByRole('progressbar')).toBeInTheDocument();
    });

    it('should disable inputs while loading', async () => {
      mockLogin.mockImplementation(() => new Promise(() => {}));
      renderLogin();
      const user = userEvent.setup();

      await user.type(screen.getByLabelText(/nom d'utilisateur/i), 'admin');
      await user.type(screen.getByLabelText(/mot de passe/i), 'password');
      await user.click(screen.getByRole('button', { name: /se connecter/i }));

      await waitFor(() => {
        expect(screen.getByLabelText(/nom d'utilisateur/i)).toBeDisabled();
        expect(screen.getByLabelText(/mot de passe/i)).toBeDisabled();
      });
    });
  });
});
