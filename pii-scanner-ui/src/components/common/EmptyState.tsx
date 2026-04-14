import { Box, Card, CardContent, Typography, Button } from '@mui/material';
import { ReactNode } from 'react';
import { useTheme } from '@mui/material/styles';
import { tokens, gradients } from '../../theme/designSystem';

interface EmptyStateProps {
  icon?: ReactNode;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  actionIcon?: ReactNode;
  hint?: string;
}

export default function EmptyState({
  icon,
  title,
  description,
  actionLabel,
  onAction,
  actionIcon,
  hint,
}: EmptyStateProps) {
  const theme = useTheme();
  const dark = theme.palette.mode === 'dark';
  const c = tokens.colors;

  return (
    <Card
      sx={{
        textAlign: 'center',
        py: 10,
        border: dark ? `1px dashed ${c.borderDefault}` : `1px dashed ${c.light.borderDefault}`,
        bgcolor: 'background.paper',
      }}
    >
      <CardContent>
        {icon && (
          <Box
            sx={{
              mb: 3,
              display: 'flex',
              justifyContent: 'center',
            }}
          >
            <Box
              sx={{
                width: 64,
                height: 64,
                borderRadius: '50%',
                bgcolor: c.accentPrimaryMuted,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: c.accentPrimary,
                '& .MuiSvgIcon-root': { fontSize: 32 },
              }}
            >
              {icon}
            </Box>
          </Box>
        )}
        <Typography variant="h5" gutterBottom fontWeight={600}>
          {title}
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: hint ? 1 : actionLabel ? 4 : 0, maxWidth: 400, mx: 'auto' }}>
          {description}
        </Typography>
        {hint && (
          <Typography variant="caption" color="text.disabled" sx={{ display: 'block', mb: actionLabel ? 4 : 0 }}>
            {hint}
          </Typography>
        )}
        {actionLabel && onAction && (
          <Button
            variant="contained"
            size="large"
            onClick={onAction}
            startIcon={actionIcon}
            sx={{
              background: gradients.primary,
              color: c.accentPrimaryText,
              '&:hover': {
                background: `linear-gradient(135deg, ${c.accentPrimaryHover} 0%, #009960 100%)`,
              },
            }}
          >
            {actionLabel}
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
