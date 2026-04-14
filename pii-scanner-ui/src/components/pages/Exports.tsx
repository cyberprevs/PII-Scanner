import { Box, Card, CardContent, Button, Tooltip, Alert } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import DownloadIcon from '@mui/icons-material/Download';
import TableChartIcon from '@mui/icons-material/TableChart';
import DataObjectIcon from '@mui/icons-material/DataObject';
import CodeIcon from '@mui/icons-material/Code';
import DescriptionIcon from '@mui/icons-material/Description';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import Typography from '@mui/material/Typography';
import PageHeader from '../common/PageHeader';
import { tokens } from '../../theme/designSystem';

interface ExportsProps {
  scanId: string | null;
  onDownloadReport: (format: 'csv' | 'json' | 'html' | 'excel') => void;
}

export default function Exports({ scanId, onDownloadReport }: ExportsProps) {
  const theme = useTheme();
  const dark = theme.palette.mode === 'dark';
  const c = tokens.colors;

  const exportFormats = [
    { name: 'CSV', icon: <TableChartIcon sx={{ fontSize: 32 }} />, description: 'Tableau compatible Excel/Calc', color: c.accentPrimary, format: 'csv' as const },
    { name: 'JSON', icon: <DataObjectIcon sx={{ fontSize: 32 }} />, description: 'Données structurées brutes', color: c.info, format: 'json' as const },
    { name: 'HTML', icon: <CodeIcon sx={{ fontSize: 32 }} />, description: 'Rapport interactif web', color: c.warning, format: 'html' as const },
    { name: 'Excel', icon: <DescriptionIcon sx={{ fontSize: 32 }} />, description: 'Fichier .xlsx avec mise en forme', color: '#10b981', format: 'excel' as const },
  ];

  return (
    <Box sx={{ maxWidth: 900, mx: 'auto' }}>
      <PageHeader
        icon={<FileDownloadIcon />}
        title="Exports"
        subtitle="Téléchargez vos rapports de scan dans différents formats"
      />

      {!scanId && (
        <Alert severity="warning" sx={{ mb: 4 }}>
          Aucun scan disponible. Lancez un scan depuis la page Scanner pour pouvoir exporter les rapports.
        </Alert>
      )}

      <Box sx={{ display: 'flex', gap: 3, flexWrap: 'wrap' }}>
        {exportFormats.map((format) => (
          <Box key={format.name} sx={{ flex: '1 1 calc(25% - 18px)', minWidth: 200 }}>
            <Card
              sx={{
                height: '100%',
                border: '1px solid',
                borderColor: scanId ? `${format.color}33` : 'divider',
                transition: 'all 0.2s',
                '&:hover': scanId ? {
                  borderColor: format.color,
                  transform: 'translateY(-2px)',
                  boxShadow: dark ? `0 8px 24px ${format.color}20` : `0 4px 12px ${format.color}18`,
                } : {},
              }}
            >
              <CardContent sx={{ textAlign: 'center', p: 3 }}>
                <Box
                  sx={{
                    width: 56, height: 56, borderRadius: 2,
                    bgcolor: `${format.color}18`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    mx: 'auto', mb: 2,
                    color: format.color,
                  }}
                >
                  {format.icon}
                </Box>
                <Typography variant="h6" fontWeight={700} gutterBottom>
                  {format.name}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 3, minHeight: 40 }}>
                  {format.description}
                </Typography>
                {format.format === 'csv' && (
                  <Typography variant="caption" color="text.disabled" sx={{ display: 'block', mb: 1 }}>
                    Ctrl+E
                  </Typography>
                )}
                <Tooltip title={!scanId ? 'Lancez un scan d\'abord' : ''} placement="top">
                  <span>
                    <Button
                      variant={scanId ? 'contained' : 'outlined'}
                      startIcon={<DownloadIcon />}
                      disabled={!scanId}
                      fullWidth
                      onClick={() => onDownloadReport(format.format)}
                      sx={scanId ? {
                        bgcolor: format.color,
                        '&:hover': { bgcolor: format.color, filter: 'brightness(0.9)' },
                        color: format.color === c.accentPrimary ? c.accentPrimaryText : '#fff',
                      } : {}}
                    >
                      Télécharger
                    </Button>
                  </span>
                </Tooltip>
              </CardContent>
            </Card>
          </Box>
        ))}
      </Box>
    </Box>
  );
}
