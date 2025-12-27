import axios from 'axios';
import { logger } from '../utils/logger';

// Instance axios configurée avec le token JWT
// En production, l'API et le frontend sont sur le même domaine, donc baseURL = '/api'
const axiosInstance = axios.create({
  baseURL: import.meta.env.DEV ? 'https://localhost:5001/api' : '/api',
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // Nécessaire pour recevoir et envoyer les cookies CSRF
});

// Stocker le token CSRF en mémoire (reçu des headers de réponse)
let csrfToken: string | null = null;
let csrfInitialized = false;

// Fonction pour récupérer le token CSRF (depuis la mémoire uniquement)
const getCsrfToken = (): string | null => {
  return csrfToken;
};

// Fonction pour initialiser le token CSRF (appel GET initial)
export const initializeCsrfToken = async (): Promise<void> => {
  if (csrfInitialized) return;

  try {
    // Faire un appel GET simple pour obtenir le token CSRF
    // On utilise l'endpoint initialization/status car il est public
    await axiosInstance.get('/initialization/status');
    csrfInitialized = true;
    logger.info('CSRF token initialized');
  } catch (error) {
    logger.error('Failed to initialize CSRF token:', error);
  }
};

// Intercepteur pour ajouter le token JWT et le token CSRF à toutes les requêtes
axiosInstance.interceptors.request.use(
  async (config) => {
    // Ajouter le token JWT
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Ajouter le token CSRF pour les requêtes de modification
    if (config.method && ['post', 'put', 'delete', 'patch'].includes(config.method.toLowerCase())) {
      // S'assurer que le CSRF token est initialisé
      if (!csrfInitialized) {
        await initializeCsrfToken();
      }

      const csrfToken = getCsrfToken();
      if (csrfToken) {
        config.headers['X-CSRF-Token'] = csrfToken;
        logger.debug('CSRF Token added to request:', csrfToken);
      } else {
        logger.warn('No CSRF token found - initialization may have failed');
      }
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Intercepteur pour gérer les erreurs 401 (non autorisé) et capturer le token CSRF
axiosInstance.interceptors.response.use(
  (response) => {
    // Capturer le token CSRF depuis le header de réponse
    // Axios normalise les headers en minuscules
    const csrfHeader = response.headers['x-csrf-token'] || response.headers['X-CSRF-Token'];
    if (csrfHeader) {
      csrfToken = csrfHeader;
      csrfInitialized = true;
      logger.debug('CSRF token updated from response header:', csrfToken);
    } else {
      logger.debug('Response headers:', Object.keys(response.headers));
    }
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      // Token expiré ou invalide - rediriger vers login
      localStorage.removeItem('token');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;
