import React, { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Divider,
  Alert,
  Avatar,
  Chip,
  Stack,
  Container,
  Grid,
  Card,
  CardContent,
  IconButton,
  InputAdornment,
  CircularProgress,
} from '@mui/material';
import PersonIcon from '@mui/icons-material/Person';
import SaveIcon from '@mui/icons-material/Save';
import LockIcon from '@mui/icons-material/Lock';
import EmailIcon from '@mui/icons-material/Email';
import BadgeIcon from '@mui/icons-material/Badge';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
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

      setSuccess('Profil mis à jour avec succès !');
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

      // Validation
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

      setPasswordSuccess('Mot de passe modifié avec succès !');
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
      <Container maxWidth="xl" sx={{ py: 4 }}>
        <Alert severity="error">Utilisateur non connecté</Alert>
      </Container>
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
    <Container maxWidth="xl" sx={{ py: 4 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
          <PersonIcon sx={{ fontSize: 40, mr: 2, color: 'primary.main' }} />
          <Typography variant="h4" fontWeight={700}>
            Mon Profil
          </Typography>
        </Box>
        <Typography variant="body1" color="text.secondary">
          Gérez vos informations personnelles et paramètres de sécurité
        </Typography>
      </Box>

      <Grid container spacing={3}>
        {/* Carte d'informations du compte */}
        <Grid item xs={12}>
          <Card sx={{
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: 'white',
            mb: 3
          }}>
            <CardContent sx={{ p: 4 }}>
              <Grid container spacing={3} alignItems="center">
                <Grid item>
                  <Avatar
                    sx={{
                      width: 100,
                      height: 100,
                      bgcolor: 'rgba(255,255,255,0.2)',
                      border: '4px solid rgba(255,255,255,0.3)',
                    }}
                  >
                    <PersonIcon sx={{ fontSize: 50 }} />
                  </Avatar>
                </Grid>
                <Grid item xs>
                  <Typography variant="h4" fontWeight={700} gutterBottom>
                    {user.fullName}
                  </Typography>
                  <Typography variant="h6" sx={{ opacity: 0.9, mb: 1 }}>
                    @{user.username}
                  </Typography>
                  <Chip
                    label={user.role}
                    sx={{
                      bgcolor: 'rgba(255,255,255,0.2)',
                      color: 'white',
                      fontWeight: 600,
                      border: '1px solid rgba(255,255,255,0.3)',
                    }}
                  />
                </Grid>
                <Grid item xs={12} md="auto">
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6} md={12}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <CalendarTodayIcon sx={{ fontSize: 20, opacity: 0.8 }} />
                        <Box>
                          <Typography variant="caption" sx={{ opacity: 0.8, display: 'block' }}>
                            Membre depuis
                          </Typography>
                          <Typography variant="body2" fontWeight={600}>
                            {formatDate(user.createdAt)}
                          </Typography>
                        </Box>
                      </Box>
                    </Grid>
                    <Grid item xs={12} sm={6} md={12}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <AccessTimeIcon sx={{ fontSize: 20, opacity: 0.8 }} />
                        <Box>
                          <Typography variant="caption" sx={{ opacity: 0.8, display: 'block' }}>
                            Dernière connexion
                          </Typography>
                          <Typography variant="body2" fontWeight={600}>
                            {formatDate(user.lastLoginAt)}
                          </Typography>
                        </Box>
                      </Box>
                    </Grid>
                  </Grid>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* Informations du profil */}
        <Grid item xs={12} lg={6}>
          <Paper sx={{ p: 3, height: '100%' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
              <BadgeIcon sx={{ fontSize: 28, mr: 1.5, color: 'primary.main' }} />
              <Typography variant="h6" fontWeight={600}>
                Informations personnelles
              </Typography>
            </Box>

            <Divider sx={{ mb: 3 }} />

            {error && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {error}
              </Alert>
            )}

            {success && (
              <Alert severity="success" sx={{ mb: 2 }}>
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
              }}
            />

            <TextField
              fullWidth
              label="Nom complet"
              value={profileData.fullName}
              onChange={(e) =>
                setProfileData({ ...profileData, fullName: e.target.value })
              }
              margin="normal"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <BadgeIcon />
                  </InputAdornment>
                ),
              }}
            />

            <TextField
              fullWidth
              label="Email"
              type="email"
              value={profileData.email}
              onChange={(e) =>
                setProfileData({ ...profileData, email: e.target.value })
              }
              margin="normal"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <EmailIcon />
                  </InputAdornment>
                ),
              }}
            />

            <Button
              fullWidth
              variant="contained"
              startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <SaveIcon />}
              onClick={handleUpdateProfile}
              disabled={loading}
              sx={{ mt: 2 }}
            >
              {loading ? 'Enregistrement...' : 'Enregistrer les modifications'}
            </Button>
          </Paper>
        </Grid>

        {/* Changement de mot de passe */}
        <Grid item xs={12} lg={6}>
          <Paper sx={{ p: 3, height: '100%' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
              <LockIcon sx={{ fontSize: 28, mr: 1.5, color: 'secondary.main' }} />
              <Typography variant="h6" fontWeight={600}>
                Changer le mot de passe
              </Typography>
            </Box>

            <Divider sx={{ mb: 3 }} />

            {passwordError && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {passwordError}
              </Alert>
            )}

            {passwordSuccess && (
              <Alert severity="success" sx={{ mb: 2 }}>
                {passwordSuccess}
              </Alert>
            )}

            <TextField
              fullWidth
              label="Mot de passe actuel"
              type={showCurrentPassword ? 'text' : 'password'}
              value={passwordData.currentPassword}
              onChange={(e) =>
                setPasswordData({ ...passwordData, currentPassword: e.target.value })
              }
              margin="normal"
              autoComplete="current-password"
              InputProps={{
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
              onChange={(e) =>
                setPasswordData({ ...passwordData, newPassword: e.target.value })
              }
              margin="normal"
              autoComplete="new-password"
              helperText="Minimum 12 caractères avec majuscules, minuscules, chiffres et caractères spéciaux"
              InputProps={{
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
              onChange={(e) =>
                setPasswordData({ ...passwordData, confirmPassword: e.target.value })
              }
              margin="normal"
              autoComplete="new-password"
              InputProps={{
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
              color="secondary"
              startIcon={passwordLoading ? <CircularProgress size={20} color="inherit" /> : <LockIcon />}
              onClick={handleChangePassword}
              disabled={passwordLoading}
              sx={{ mt: 2 }}
            >
              {passwordLoading ? 'Modification...' : 'Modifier le mot de passe'}
            </Button>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

export default Profile;
