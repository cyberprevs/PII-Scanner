import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Checkbox,
  FormControlLabel,
  Divider,
} from '@mui/material';
import GavelIcon from '@mui/icons-material/Gavel';
import LockIcon from '@mui/icons-material/Lock';
import StorageIcon from '@mui/icons-material/Storage';
import DeleteForeverIcon from '@mui/icons-material/DeleteForever';
import VisibilityIcon from '@mui/icons-material/Visibility';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { tokens } from '../../theme/designSystem';

interface ConsentModalProps {
  open: boolean;
  onAccept: () => void;
  onDecline: () => void;
}

export default function ConsentModal({ open, onAccept, onDecline }: ConsentModalProps) {
  const { t } = useTranslation();
  const c = tokens.colors;
  const [checked, setChecked] = useState(false);

  return (
    <Dialog
      open={open}
      maxWidth="sm"
      fullWidth
      disableEscapeKeyDown
      PaperProps={{ sx: { borderRadius: 3, border: `1px solid ${c.accentPrimary}33` } }}
    >
      <DialogTitle sx={{ pb: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Box sx={{
            width: 40, height: 40, borderRadius: '50%',
            bgcolor: c.accentPrimaryMuted,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <GavelIcon sx={{ color: c.accentPrimary, fontSize: 22 }} />
          </Box>
          <Typography variant="h6" fontWeight={700}>
            {t('consent.title')}
          </Typography>
        </Box>
      </DialogTitle>

      <Divider />

      <DialogContent sx={{ pt: 2.5 }}>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          {t('consent.intro')}
        </Typography>

        <List dense disablePadding>
          <ListItem disableGutters sx={{ alignItems: 'flex-start', mb: 0.5 }}>
            <ListItemIcon sx={{ minWidth: 36, mt: 0.3 }}>
              <VisibilityIcon sx={{ fontSize: 18, color: c.accentPrimary }} />
            </ListItemIcon>
            <ListItemText
              primary={<Typography variant="body2" fontWeight={600}>{t('consent.point1Title')}</Typography>}
              secondary={<Typography variant="caption" color="text.secondary">{t('consent.point1Desc')}</Typography>}
            />
          </ListItem>

          <ListItem disableGutters sx={{ alignItems: 'flex-start', mb: 0.5 }}>
            <ListItemIcon sx={{ minWidth: 36, mt: 0.3 }}>
              <LockIcon sx={{ fontSize: 18, color: c.accentPrimary }} />
            </ListItemIcon>
            <ListItemText
              primary={<Typography variant="body2" fontWeight={600}>{t('consent.point2Title')}</Typography>}
              secondary={<Typography variant="caption" color="text.secondary">{t('consent.point2Desc')}</Typography>}
            />
          </ListItem>

          <ListItem disableGutters sx={{ alignItems: 'flex-start', mb: 0.5 }}>
            <ListItemIcon sx={{ minWidth: 36, mt: 0.3 }}>
              <StorageIcon sx={{ fontSize: 18, color: c.accentPrimary }} />
            </ListItemIcon>
            <ListItemText
              primary={<Typography variant="body2" fontWeight={600}>{t('consent.point3Title')}</Typography>}
              secondary={<Typography variant="caption" color="text.secondary">{t('consent.point3Desc')}</Typography>}
            />
          </ListItem>

          <ListItem disableGutters sx={{ alignItems: 'flex-start' }}>
            <ListItemIcon sx={{ minWidth: 36, mt: 0.3 }}>
              <DeleteForeverIcon sx={{ fontSize: 18, color: c.accentPrimary }} />
            </ListItemIcon>
            <ListItemText
              primary={<Typography variant="body2" fontWeight={600}>{t('consent.point4Title')}</Typography>}
              secondary={<Typography variant="caption" color="text.secondary">{t('consent.point4Desc')}</Typography>}
            />
          </ListItem>
        </List>

        <Box sx={{
          mt: 2.5, p: 1.5, borderRadius: 2,
          bgcolor: `${c.accentPrimary}0D`,
          border: `1px solid ${c.accentPrimary}33`,
        }}>
          <Typography variant="caption" color="text.secondary">
            {t('consent.legalNote')}
          </Typography>
        </Box>

        <FormControlLabel
          sx={{ mt: 2, alignItems: 'flex-start' }}
          control={
            <Checkbox
              checked={checked}
              onChange={(e) => setChecked(e.target.checked)}
              size="small"
              sx={{ mt: -0.5, color: c.accentPrimary, '&.Mui-checked': { color: c.accentPrimary } }}
            />
          }
          label={
            <Typography variant="body2" sx={{ mt: 0.3 }}>
              {t('consent.checkboxLabel')}
            </Typography>
          }
        />
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 2.5, gap: 1 }}>
        <Button
          variant="outlined"
          color="inherit"
          onClick={onDecline}
          sx={{ color: 'text.secondary', borderColor: 'divider' }}
        >
          {t('consent.decline')}
        </Button>
        <Button
          variant="contained"
          disabled={!checked}
          onClick={onAccept}
          sx={{
            background: checked
              ? 'linear-gradient(135deg, #00E599 0%, #00B876 100%)'
              : undefined,
            fontWeight: 600,
          }}
        >
          {t('consent.accept')}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
