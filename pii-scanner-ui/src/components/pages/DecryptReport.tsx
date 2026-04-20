import { useState, useRef, useCallback } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Alert,
  InputAdornment,
  IconButton,
  LinearProgress,
  Chip,
} from '@mui/material';
import LockOpenIcon from '@mui/icons-material/LockOpen';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import DownloadIcon from '@mui/icons-material/Download';
import PageHeader from '../common/PageHeader';
import { useTranslation } from 'react-i18next';

const DecryptReport: React.FC = () => {
  const { t } = useTranslation();
  const [file, setFile] = useState<File | null>(null);
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [decrypting, setDecrypting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (selected: File) => {
    if (!selected.name.endsWith('.enc')) {
      setError(t('decrypt.errorNotEnc'));
      return;
    }
    setFile(selected);
    setError('');
    setSuccess('');
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const dropped = e.dataTransfer.files[0];
    if (dropped) handleFileSelect(dropped);
  }, []);

  const handleDecrypt = async () => {
    if (!file || !password) return;
    setDecrypting(true);
    setError('');
    setSuccess('');

    try {
      const arrayBuffer = await file.arrayBuffer();
      const data = new Uint8Array(arrayBuffer);

      // Format: [salt 16B][IV 16B][encrypted data]
      if (data.length < 33) throw new Error('invalid');
      const salt = data.slice(0, 16);
      const iv = data.slice(16, 32);
      const encrypted = data.slice(32);

      // Dériver la clé avec PBKDF2-SHA256, 100 000 itérations
      const enc = new TextEncoder();
      const keyMaterial = await crypto.subtle.importKey(
        'raw',
        enc.encode(password),
        'PBKDF2',
        false,
        ['deriveKey']
      );

      const aesKey = await crypto.subtle.deriveKey(
        { name: 'PBKDF2', salt, iterations: 100000, hash: 'SHA-256' },
        keyMaterial,
        { name: 'AES-CBC', length: 256 },
        false,
        ['decrypt']
      );

      // Déchiffrer
      const decrypted = await crypto.subtle.decrypt(
        { name: 'AES-CBC', iv },
        aesKey,
        encrypted
      );

      // Télécharger le fichier déchiffré (retirer l'extension .enc)
      const outputName = file.name.replace(/\.enc$/, '');
      const mimeType = outputName.endsWith('.csv') ? 'text/csv'
        : outputName.endsWith('.json') ? 'application/json'
        : outputName.endsWith('.html') ? 'text/html'
        : outputName.endsWith('.xlsx') ? 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        : 'application/octet-stream';

      const blob = new Blob([decrypted], { type: mimeType });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = outputName;
      document.body.appendChild(a);
      a.click();
      URL.revokeObjectURL(url);
      document.body.removeChild(a);

      setSuccess(t('decrypt.success', { name: outputName }));
      setPassword('');
    } catch {
      setError(t('decrypt.errorWrongPassword'));
    } finally {
      setDecrypting(false);
    }
  };

  return (
    <Box>
      <PageHeader
        icon={<LockOpenIcon />}
        title={t('decrypt.title')}
        subtitle={t('decrypt.subtitle')}
      />

      <Box sx={{ maxWidth: 600, mx: 'auto' }}>
        {/* Zone de dépôt du fichier */}
        <Card
          sx={{
            mb: 3,
            border: '2px dashed',
            borderColor: dragOver ? 'primary.main' : file ? 'success.main' : 'divider',
            bgcolor: dragOver ? 'rgba(0,229,153,0.04)' : 'background.paper',
            cursor: 'pointer',
            transition: 'all 0.2s',
          }}
          onDrop={handleDrop}
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onClick={() => fileInputRef.current?.click()}
        >
          <CardContent sx={{ textAlign: 'center', py: 5 }}>
            <input
              ref={fileInputRef}
              type="file"
              accept=".enc"
              style={{ display: 'none' }}
              onChange={(e) => { if (e.target.files?.[0]) handleFileSelect(e.target.files[0]); }}
            />
            <UploadFileIcon sx={{ fontSize: 48, color: file ? 'success.main' : 'text.secondary', mb: 1 }} />
            {file ? (
              <>
                <Typography variant="body1" fontWeight={600} color="success.main">
                  {file.name}
                </Typography>
                <Chip
                  label={`${(file.size / 1024).toFixed(1)} KB`}
                  size="small"
                  sx={{ mt: 1 }}
                />
              </>
            ) : (
              <>
                <Typography variant="body1" fontWeight={500} gutterBottom>
                  {t('decrypt.dropZone')}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {t('decrypt.dropZoneHint')}
                </Typography>
              </>
            )}
          </CardContent>
        </Card>

        {/* Champ mot de passe + bouton */}
        <Card>
          <CardContent sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField
              fullWidth
              label={t('decrypt.passwordLabel')}
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter' && file && password) handleDecrypt(); }}
              disabled={decrypting}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton onClick={() => setShowPassword(v => !v)} edge="end">
                      {showPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />

            {decrypting && <LinearProgress />}

            {error && <Alert severity="error" onClose={() => setError('')}>{error}</Alert>}
            {success && <Alert severity="success" onClose={() => setSuccess('')}>{success}</Alert>}

            <Button
              variant="contained"
              size="large"
              startIcon={<DownloadIcon />}
              onClick={handleDecrypt}
              disabled={!file || !password || decrypting}
              sx={{
                background: 'linear-gradient(135deg, #00E599 0%, #00B876 100%)',
                fontWeight: 600,
                '&:disabled': { opacity: 0.5 },
              }}
            >
              {decrypting ? t('decrypt.decrypting') : t('decrypt.decrypt')}
            </Button>
          </CardContent>
        </Card>

        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', textAlign: 'center', mt: 2 }}>
          {t('decrypt.localNote')}
        </Typography>
      </Box>
    </Box>
  );
};

export default DecryptReport;
