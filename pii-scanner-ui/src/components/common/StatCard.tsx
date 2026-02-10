import { Box, Card, CardContent, Typography } from '@mui/material';
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

  return (
    <Box sx={{ flex: '1 1 200px' }}>
      <Card
        sx={{
          background: gradient || c.bgSurface,
          border: gradient ? 'none' : `1px solid ${c.borderDefault}`,
          color: gradient ? 'white' : c.textPrimary,
          height: '100%',
        }}
      >
        <CardContent>
          {icon && (
            <Box sx={{ mb: 2, color: gradient ? 'white' : c.accentPrimary }}>
              {icon}
            </Box>
          )}
          <Typography
            variant="h3"
            fontWeight={700}
            sx={{ color: gradient ? 'white' : c.accentPrimary }}
          >
            {value}
          </Typography>
          <Typography
            variant="body2"
            sx={{ color: gradient ? 'rgba(255,255,255,0.9)' : c.textSecondary }}
          >
            {label}
          </Typography>
          {subtext && (
            <Typography
              variant="caption"
              sx={{
                mt: 1,
                display: 'block',
                color: gradient ? 'rgba(255,255,255,0.7)' : c.textTertiary,
              }}
            >
              {subtext}
            </Typography>
          )}
        </CardContent>
      </Card>
    </Box>
  );
}
