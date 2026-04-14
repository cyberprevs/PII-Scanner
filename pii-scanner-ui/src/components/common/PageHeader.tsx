import { Box, Stack, Typography } from '@mui/material';
import { ReactNode } from 'react';
import { tokens, gradients } from '../../theme/designSystem';

interface PageHeaderProps {
  icon?: ReactNode;
  title: string;
  subtitle?: string;
  actions?: ReactNode;
  breadcrumb?: string;
  titleGradient?: boolean;
}

export default function PageHeader({
  icon,
  title,
  subtitle,
  actions,
  breadcrumb,
  titleGradient = false,
}: PageHeaderProps) {
  const c = tokens.colors;

  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        mb: 4,
      }}
    >
      {/* Left side */}
      <Box>
        {breadcrumb && (
          <Typography
            variant="caption"
            sx={{ color: 'text.disabled', display: 'block', mb: 0.5, letterSpacing: '0.02em' }}
          >
            {breadcrumb}
          </Typography>
        )}
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          {icon && (
            <Box
              sx={{
                mr: 1.5,
                color: c.accentPrimary,
                display: 'flex',
                alignItems: 'center',
                '& .MuiSvgIcon-root': { fontSize: 28 },
              }}
            >
              {icon}
            </Box>
          )}
          <Typography
            variant="h4"
            fontWeight={700}
            sx={
              titleGradient
                ? {
                    background: gradients.primary,
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text',
                  }
                : { color: 'text.primary' }
            }
          >
            {title}
          </Typography>
        </Box>
        {subtitle && (
          <Typography variant="body1" color="text.secondary" sx={{ mt: 0.5 }}>
            {subtitle}
          </Typography>
        )}
      </Box>

      {/* Right side — actions */}
      {actions && (
        <Stack direction="row" spacing={2} alignItems="center" sx={{ flexShrink: 0, ml: 2 }}>
          {actions}
        </Stack>
      )}
    </Box>
  );
}
