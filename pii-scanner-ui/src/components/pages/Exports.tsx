import { Box, Typography, Card, CardContent, Button } from '@mui/material';
import DownloadIcon from '@mui/icons-material/Download';
import TableChartIcon from '@mui/icons-material/TableChart';
import DataObjectIcon from '@mui/icons-material/DataObject';
import CodeIcon from '@mui/icons-material/Code';
import DescriptionIcon from '@mui/icons-material/Description';

interface ExportsProps {
  scanId: string | null;
  onDownloadReport: (format: 'csv' | 'json' | 'html' | 'excel') => void;
}

export default function Exports({ scanId, onDownloadReport }: ExportsProps) {
  const exportFormats = [
    { name: 'CSV', icon: <TableChartIcon />, description: 'Tableau compatible Excel', color: '#4caf50', format: 'csv' as const },
    { name: 'JSON', icon: <DataObjectIcon />, description: 'Données structurées', color: '#2196f3', format: 'json' as const },
    { name: 'HTML', icon: <CodeIcon />, description: 'Rapport interactif', color: '#ff9800', format: 'html' as const },
    { name: 'Excel', icon: <DescriptionIcon />, description: 'Fichier .xlsx complet', color: '#4caf50', format: 'excel' as const },
  ];

  return (
    <Box>
      <Typography variant="h4" fontWeight={700} gutterBottom>
        📄 Exports
      </Typography>
      <Typography variant="body1" color="text.secondary" paragraph>
        Téléchargez vos rapports dans différents formats
      </Typography>

      {!scanId && (
        <Card sx={{ mt: 3, mb: 3, backgroundColor: 'rgba(255, 152, 0, 0.1)' }}>
          <CardContent>
            <Typography variant="body1" color="text.secondary">
              Aucun scan disponible. Lancez un scan depuis la page Scanner pour pouvoir exporter les rapports.
            </Typography>
          </CardContent>
        </Card>
      )}

      <Box sx={{ display: 'flex', gap: 3, flexWrap: 'wrap', mt: 3 }}>
        {exportFormats.map((format) => (
          <Box key={format.name} sx={{ flex: '1 1 calc(25% - 18px)', minWidth: 220 }}>
            <Card>
              <CardContent sx={{ textAlign: 'center' }}>
                <Box sx={{ color: format.color, mb: 2 }}>
                  {format.icon}
                </Box>
                <Typography variant="h6" gutterBottom>
                  {format.name}
                </Typography>
                <Typography variant="body2" color="text.secondary" paragraph>
                  {format.description}
                </Typography>
                <Button
                  variant="outlined"
                  startIcon={<DownloadIcon />}
                  disabled={!scanId}
                  fullWidth
                  onClick={() => onDownloadReport(format.format)}
                >
                  Télécharger
                </Button>
              </CardContent>
            </Card>
          </Box>
        ))}
      </Box>
    </Box>
  );
}
