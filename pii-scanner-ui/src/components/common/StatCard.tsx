import { Box, Card, CardContent, Typography } from '@mui/material';
import { ReactNode } from 'react';

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
  const defaultGradient = 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';

  return (
    <Box sx={{ flex: '1 1 200px' }}>
      <Card
        sx={{
          background: gradient || defaultGradient,
          color: 'white',
          height: '100%',
        }}
      >
        <CardContent>
          {icon && (
            <Box sx={{ mb: 2 }}>
              {icon}
            </Box>
          )}
          <Typography variant="h3" fontWeight={700} color="white">
            {value}
          </Typography>
          <Typography variant="body2" color="rgba(255,255,255,0.9)">
            {label}
          </Typography>
          {subtext && (
            <Typography variant="caption" color="rgba(255,255,255,0.7)" sx={{ mt: 1, display: 'block' }}>
              {subtext}
            </Typography>
          )}
        </CardContent>
      </Card>
    </Box>
  );
}
