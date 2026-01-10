import React, { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Alert,
  InputAdornment,
  CircularProgress,
  Grid,
  IconButton,
} from '@mui/material';
import PersonIcon from '@mui/icons-material/Person';
import SaveIcon from '@mui/icons-material/Save';
import LockIcon from '@mui/icons-material/Lock';
import EmailIcon from '@mui/icons-material/Email';
import BadgeIcon from '@mui/icons-material/Badge';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import { useAuth } from '../../contexts/AuthContext';
import axios from '../../services/axios';

const Profile: React.FC = () => {
  const { user } = useAuth();
  const [profileData, setProfileData] = useState({
    email: user?.email || '',
    fullName: user?.fullName || '',
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleUpdateProfile = async () => {
    try {
      setError('');
      setSuccess('');
      setLoading(true);

      await axios.put('/users/profile', {
        email: profileData.email,
        fullName: profileData.fullName,
      });

      setSuccess('Profil mis à jour avec succès');
      setTimeout(() => setSuccess(''), 3000);

      // Mettre à jour le localStorage
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        const userObj = JSON.parse(storedUser);
        userObj.email = profileData.email;
        userObj.fullName = profileData.fullName;
        localStorage.setItem('user', JSON.stringify(userObj));
      }
    } catch (err: any) {
      setError(err.response?.data?.error || 'Erreur lors de la mise à jour du profil');
    } finally {
      setLoading(false);
    }
  };

  const validatePassword = (password: string): string | null => {
    if (password.length < 12) {
      return 'Le mot de passe doit contenir au moins 12 caractères';
    }
    if (!/[A-Z]/.test(password)) {
      return 'Le mot de passe doit contenir au moins une majuscule';
    }
    if (!/[a-z]/.test(password)) {
      return 'Le mot de passe doit contenir au moins une minuscule';
    }
    if (!/[0-9]/.test(password)) {
      return 'Le mot de passe doit contenir au moins un chiffre';
    }
    if (!/[^A-Za-z0-9]/.test(password)) {
      return 'Le mot de passe doit contenir au moins un caractère spécial';
    }
    return null;
  };

  const handleChangePassword = async () => {
    try {
      setPasswordError('');
      setPasswordSuccess('');
      setPasswordLoading(true);

      if (!passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmPassword) {
        setPasswordError('Tous les champs sont requis');
        setPasswordLoading(false);
        return;
      }

      if (passwordData.newPassword !== passwordData.confirmPassword) {
        setPasswordError('Les nouveaux mots de passe ne correspondent pas');
        setPasswordLoading(false);
        return;
      }

      const passwordValidation = validatePassword(passwordData.newPassword);
      if (passwordValidation) {
        setPasswordError(passwordValidation);
        setPasswordLoading(false);
        return;
      }

      await axios.put('/users/change-password', {
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword,
      });

      setPasswordSuccess('Mot de passe modifié avec succès');
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });

      setTimeout(() => setPasswordSuccess(''), 3000);
    } catch (err: any) {
      setPasswordError(err.response?.data?.error || 'Erreur lors du changement de mot de passe');
    } finally {
      setPasswordLoading(false);
    }
  };

  if (!user) {
    return (
      <Box>
        <Alert severity="error">Utilisateur non connecté</Alert>
      </Box>
    );
  }

  const formatDate = (dateString: string | undefined) => {
    if (!dateString) return 'Non disponible';
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <Box>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" fontWeight={700} gutterBottom sx={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
        }}>
          Mon Profil
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Gérez vos informations personnelles et paramètres de sécurité
        </Typography>
      </Box>

      {/* User Info Card */}
      <Paper sx={{
        p: 3,
        mb: 3,
        background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%)',
        border: '1px solid',
        borderColor: 'divider',
      }}>
        <Grid container spacing={3} alignItems="center">
          <Grid item>
            <Box sx={{
              width: 80,
              height: 80,
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <PersonIcon sx={{ fontSize: 40, color: 'white' }} />
            </Box>
          </Grid>
          <Grid item xs>
            <Typography variant="h5" fontWeight={700} gutterBottom>
              {user.fullName}
            </Typography>
            <Typography variant="body1" color="text.secondary" gutterBottom>
              @{user.username} • {user.role}
            </Typography>
            <Box sx={{ display: 'flex', gap: 3, mt: 1 }}>
              <Typography variant="body2" color="text.secondary">
                <strong>Membre depuis:</strong> {formatDate(user.createdAt)}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                <strong>Dernière connexion:</strong> {formatDate(user.lastLoginAt)}
              </Typography>
            </Box>
          </Grid>
        </Grid>
      </Paper>

      <Grid container spacing={3}>
        {/* Informations personnelles */}
        <Grid item xs={12} md={6}>
          <Paper sx={{
            p: 3,
            background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.02) 0%, rgba(118, 75, 162, 0.02) 100%)',
            border: '1px solid',
            borderColor: 'divider',
            height: '100%',
          }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
              <BadgeIcon sx={{ fontSize: 24, mr: 1.5, color: 'primary.main' }} />
              <Typography variant="h6" fontWeight={600}>
                Informations personnelles
              </Typography>
            </Box>

            {error && (
              <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
                {error}
              </Alert>
            )}

            {success && (
              <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess('')}>
                {success}
              </Alert>
            )}

            <TextField
              fullWidth
              label="Nom d'utilisateur"
              value={user.username}
              disabled
              margin="normal"
              helperText="Le nom d'utilisateur ne peut pas être modifié"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <PersonIcon />
                  </InputAdornment>
                ),
                sx: { bgcolor: 'action.disabledBackground' }
              }}
            />

            <TextField
              fullWidth
              label="Nom complet"
              value={profileData.fullName}
              onChange={(e) => setProfileData({ ...profileData, fullName: e.target.value })}
              margin="normal"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <BadgeIcon />
                  </InputAdornment>
                ),
                sx: { bgcolor: 'background.paper' }
              }}
            />

            <TextField
              fullWidth
              label="Email"
              type="email"
              value={profileData.email}
              onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
              margin="normal"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <EmailIcon />
                  </InputAdornment>
                ),
                sx: { bgcolor: 'background.paper' }
              }}
            />

            <Button
              fullWidth
              variant="contained"
              startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <SaveIcon />}
              onClick={handleUpdateProfile}
              disabled={loading}
              sx={{
                mt: 3,
                py: 1.5,
                fontWeight: 600,
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                '&:hover': {
                  background: 'linear-gradient(135deg, #5568d3 0%, #6a3f8f 100%)',
                },
              }}
            >
              {loading ? 'Enregistrement...' : 'Enregistrer les modifications'}
            </Button>
          </Paper>
        </Grid>

        {/* Changement de mot de passe */}
        <Grid item xs={12} md={6}>
          <Paper sx={{
            p: 3,
            background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.02) 0%, rgba(118, 75, 162, 0.02) 100%)',
            border: '1px solid',
            borderColor: 'divider',
            height: '100%',
          }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
              <LockIcon sx={{ fontSize: 24, mr: 1.5, color: 'primary.main' }} />
              <Typography variant="h6" fontWeight={600}>
                Changer le mot de passe
              </Typography>
            </Box>

            {passwordError && (
              <Alert severity="error" sx={{ mb: 2 }} onClose={() => setPasswordError('')}>
                {passwordError}
              </Alert>
            )}

            {passwordSuccess && (
              <Alert severity="success" sx={{ mb: 2 }} onClose={() => setPasswordSuccess('')}>
                {passwordSuccess}
              </Alert>
            )}

            <TextField
              fullWidth
              label="Mot de passe actuel"
              type={showCurrentPassword ? 'text' : 'password'}
              value={passwordData.currentPassword}
              onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
              margin="normal"
              autoComplete="current-password"
              InputProps={{
                sx: { bgcolor: 'background.paper' },
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                      edge="end"
                    >
                      {showCurrentPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />

            <TextField
              fullWidth
              label="Nouveau mot de passe"
              type={showNewPassword ? 'text' : 'password'}
              value={passwordData.newPassword}
              onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
              margin="normal"
              autoComplete="new-password"
              helperText="Minimum 12 caractères avec majuscules, minuscules, chiffres et caractères spéciaux"
              InputProps={{
                sx: { bgcolor: 'background.paper' },
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      edge="end"
                    >
                      {showNewPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />

            <TextField
              fullWidth
              label="Confirmer le nouveau mot de passe"
              type={showConfirmPassword ? 'text' : 'password'}
              value={passwordData.confirmPassword}
              onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
              margin="normal"
              autoComplete="new-password"
              InputProps={{
                sx: { bgcolor: 'background.paper' },
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      edge="end"
                    >
                      {showConfirmPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />

            <Button
              fullWidth
              variant="contained"
              startIcon={passwordLoading ? <CircularProgress size={20} color="inherit" /> : <LockIcon />}
              onClick={handleChangePassword}
              disabled={passwordLoading}
              sx={{
                mt: 3,
                py: 1.5,
                fontWeight: 600,
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                '&:hover': {
                  background: 'linear-gradient(135deg, #5568d3 0%, #6a3f8f 100%)',
                },
              }}
            >
              {passwordLoading ? 'Modification...' : 'Modifier le mot de passe'}
            </Button>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Profile;
