import axios from 'axios';

// Instance axios configurée avec le token JWT
const axiosInstance = axios.create({
  baseURL: 'https://localhost:5001/api',
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // Nécessaire pour recevoir et envoyer les cookies CSRF
});

// Stocker le token CSRF en mémoire (reçu des headers de réponse)
let csrfToken: string | null = null;

// Fonction pour récupérer le token CSRF depuis les cookies (fallback)
const getCsrfTokenFromCookie = (): string | null => {
  const cookies = document.cookie.split(';');
  for (const cookie of cookies) {
    const [name, value] = cookie.trim().split('=');
    if (name === 'XSRF-TOKEN') {
      // Décoder l'URL encoding (%3D -> =, etc.)
      return decodeURIComponent(value);
    }
  }
  return null;
};

// Fonction pour récupérer le token CSRF (depuis la mémoire ou le cookie)
const getCsrfToken = (): string | null => {
  return csrfToken || getCsrfTokenFromCookie();
};

// Intercepteur pour ajouter le token JWT et le token CSRF à toutes les requêtes
axiosInstance.interceptors.request.use(
  (config) => {
    // Ajouter le token JWT
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Ajouter le token CSRF pour les requêtes de modification
    if (config.method && ['post', 'put', 'delete', 'patch'].includes(config.method.toLowerCase())) {
      const csrfToken = getCsrfToken();
      if (csrfToken) {
        config.headers['X-CSRF-Token'] = csrfToken;
        console.log('CSRF Token from cookie:', csrfToken);
        console.log('All cookies:', document.cookie);
      } else {
        console.warn('No CSRF token found in cookies');
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
    const csrfHeader = response.headers['x-csrf-token'];
    if (csrfHeader) {
      csrfToken = csrfHeader;
      console.log('CSRF token updated from response header:', csrfToken);
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
