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
} from '@mui/material';
import PersonIcon from '@mui/icons-material/Person';
import SaveIcon from '@mui/icons-material/Save';
import LockIcon from '@mui/icons-material/Lock';
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

  const handleUpdateProfile = async () => {
    try {
      setError('');
      setSuccess('');

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
    }
  };

  const handleChangePassword = async () => {
    try {
      setPasswordError('');
      setPasswordSuccess('');

      // Validation
      if (!passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmPassword) {
        setPasswordError('Tous les champs sont requis');
        return;
      }

      if (passwordData.newPassword !== passwordData.confirmPassword) {
        setPasswordError('Les nouveaux mots de passe ne correspondent pas');
        return;
      }

      if (passwordData.newPassword.length < 6) {
        setPasswordError('Le nouveau mot de passe doit contenir au moins 6 caractères');
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
    }
  };

  if (!user) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">Utilisateur non connecté</Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom sx={{ mb: 3 }}>
        Mon Profil
      </Typography>

      <Stack direction="row" spacing={3} sx={{flexWrap: 'wrap'}}>
        {/* Informations du profil */}
        <Box sx={{flex: '1 1 400px'}}>
          <Paper sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
              <Avatar
                sx={{
                  width: 80,
                  height: 80,
                  bgcolor: 'primary.main',
                  mr: 2,
                }}
              >
                <PersonIcon sx={{ fontSize: 40 }} />
              </Avatar>
              <Box>
                <Typography variant="h6">{user.fullName}</Typography>
                <Typography variant="body2" color="text.secondary">
                  @{user.username}
                </Typography>
                <Chip
                  label={user.role}
                  color={user.role === 'Admin' ? 'secondary' : 'primary'}
                  size="small"
                  sx={{ mt: 1 }}
                />
              </Box>
            </Box>

            <Divider sx={{ mb: 3 }} />

            <Typography variant="h6" gutterBottom>
              Informations personnelles
            </Typography>

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
            />

            <TextField
              fullWidth
              label="Nom complet"
              value={profileData.fullName}
              onChange={(e) =>
                setProfileData({ ...profileData, fullName: e.target.value })
              }
              margin="normal"
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
            />

            <Button
              fullWidth
              variant="contained"
              startIcon={<SaveIcon />}
              onClick={handleUpdateProfile}
              sx={{ mt: 2 }}
            >
              Enregistrer les modifications
            </Button>
          </Paper>
        </Box>

        {/* Changement de mot de passe */}
        <Box sx={{flex: '1 1 400px'}}>
          <Paper sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
              <LockIcon sx={{ mr: 1, color: 'primary.main' }} />
              <Typography variant="h6">Changer le mot de passe</Typography>
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
              type="password"
              value={passwordData.currentPassword}
              onChange={(e) =>
                setPasswordData({ ...passwordData, currentPassword: e.target.value })
              }
              margin="normal"
              autoComplete="current-password"
            />

            <TextField
              fullWidth
              label="Nouveau mot de passe"
              type="password"
              value={passwordData.newPassword}
              onChange={(e) =>
                setPasswordData({ ...passwordData, newPassword: e.target.value })
              }
              margin="normal"
              autoComplete="new-password"
              helperText="Minimum 6 caractères"
            />

            <TextField
              fullWidth
              label="Confirmer le nouveau mot de passe"
              type="password"
              value={passwordData.confirmPassword}
              onChange={(e) =>
                setPasswordData({ ...passwordData, confirmPassword: e.target.value })
              }
              margin="normal"
              autoComplete="new-password"
            />

            <Button
              fullWidth
              variant="contained"
              color="secondary"
              startIcon={<LockIcon />}
              onClick={handleChangePassword}
              sx={{ mt: 2 }}
            >
              Modifier le mot de passe
            </Button>
          </Paper>
        </Box>
      </Stack>
    </Box>
  );
};

export default Profile;
