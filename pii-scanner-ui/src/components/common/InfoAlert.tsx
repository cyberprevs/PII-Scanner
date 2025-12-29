import { Alert } from '@mui/material';
import { ReactNode } from 'react';

interface InfoAlertProps {
  severity?: 'error' | 'warning' | 'info' | 'success';
  children: ReactNode;
  sx?: object;
}

/**
 * Composant réutilisable pour afficher des alertes informatives
 * Utilisé dans : DashboardPage, Scanner, RiskyFiles, DataRetention, et autres pages
 */
export default function InfoAlert({ severity = 'info', children, sx }: InfoAlertProps) {
  return (
    <Alert severity={severity} sx={{ mb: 2, ...sx }}>
      {children}
    </Alert>
  );
}
