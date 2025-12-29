import { Box, Card, CardContent, Typography, Button } from '@mui/material';
import { ReactNode } from 'react';

interface EmptyStateProps {
  icon?: ReactNode;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  actionIcon?: ReactNode;
}

/**
 * Composant réutilisable pour afficher un état vide
 * Utilisé dans : Scanner, RiskyFiles, Detections, PiiCategoryAnalysis, DuplicateFiles, Staleness, Exposure, Reports
 */
export default function EmptyState({
  icon,
  title,
  description,
  actionLabel,
  onAction,
  actionIcon,
}: EmptyStateProps) {
  return (
    <Box sx={{ p: 3 }}>
      <Card sx={{ textAlign: 'center', py: 8 }}>
        <CardContent>
          {icon && (
            <Box sx={{ mb: 2, display: 'flex', justifyContent: 'center' }}>
              {icon}
            </Box>
          )}
          <Typography variant="h4" gutterBottom fontWeight={600}>
            {title}
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: actionLabel ? 4 : 0 }}>
            {description}
          </Typography>
          {actionLabel && onAction && (
            <Button
              variant="contained"
              size="large"
              onClick={onAction}
              startIcon={actionIcon}
            >
              {actionLabel}
            </Button>
          )}
        </CardContent>
      </Card>
    </Box>
  );
}
