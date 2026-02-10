import { Box, CardContent, Typography } from '@mui/material';
import { ReactNode } from 'react';
import { tokens } from '../../theme/designSystem';

interface StatCardProps {
  value: string | number;
  label: string;
  gradient?: string;
  icon?: ReactNode;
  subtext?: string;
}

/**
 * Composant réutilisable pour afficher une carte de statistique KPI
 * Utilisé dans : DashboardPage, Scanner, RiskyFiles, PiiCategoryAnalysis, et autres pages de statistiques
 */
export default function StatCard({ value, label, gradient, icon, subtext }: StatCardProps) {
  const c = tokens.colors;
  const borderGradient = gradient || `linear-gradient(135deg, ${c.accentPrimary} 0%, ${c.info} 100%)`;

  return (
    <Box sx={{ flex: '1 1 200px' }}>
      {/* Outer box acts as gradient border via background + padding trick */}
      <Box
        sx={{
          borderRadius: `${tokens.radii.lg}px`,
          padding: '1px',
          background: borderGradient,
          height: '100%',
        }}
      >
        <Box
          sx={{
            borderRadius: `${tokens.radii.lg - 1}px`,
            backgroundColor: 'background.default',
            height: '100%',
          }}
        >
          <CardContent>
            {icon && (
              <Box sx={{ mb: 2, color: 'text.secondary' }}>
                {icon}
              </Box>
            )}
            <Typography
              variant="h3"
              fontWeight={700}
              sx={{ color: 'text.primary' }}
            >
              {value}
            </Typography>
            <Typography
              variant="body2"
              sx={{ color: 'text.secondary' }}
            >
              {label}
            </Typography>
            {subtext && (
              <Typography
                variant="caption"
                sx={{ mt: 1, display: 'block', color: 'text.disabled' }}
              >
                {subtext}
              </Typography>
            )}
          </CardContent>
        </Box>
      </Box>
    </Box>
  );
}
