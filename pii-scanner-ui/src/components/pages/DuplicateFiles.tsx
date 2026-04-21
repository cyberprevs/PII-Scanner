import { useState, useMemo } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Alert,
  Collapse,
  IconButton,
  Tooltip,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
} from '@mui/material';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import WarningIcon from '@mui/icons-material/Warning';
import type { ScanResultResponse } from '../../types';
import { useTranslation } from 'react-i18next';
import PageHeader from '../common/PageHeader';
import EmptyState from '../common/EmptyState';

interface DuplicateFilesProps {
  results: ScanResultResponse | null;
}

interface DuplicateGroup {
  hash: string;
  files: string[];
  piiCount: number;
  piiTypes: string[];
}

function DuplicateRow({ group }: { group: DuplicateGroup }) {
  const [open, setOpen] = useState(false);
  const { t } = useTranslation();

  return (
    <>
      <TableRow sx={{ '& > *': { borderBottom: 'unset' }, cursor: 'pointer' }} onClick={() => setOpen(!open)}>
        <TableCell>
          <IconButton size="small">
            {open ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
          </IconButton>
        </TableCell>
        <TableCell>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <ContentCopyIcon color="warning" />
            <Typography variant="body2" fontWeight={600}>
              {group.files.length} {t('duplicates.copies')}
            </Typography>
          </Box>
        </TableCell>
        <TableCell>
          <Chip
            label={`${group.piiCount} PII`}
            color={group.piiCount > 10 ? 'error' : group.piiCount > 5 ? 'warning' : 'info'}
            size="small"
          />
        </TableCell>
        <TableCell>
          <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
            {group.piiTypes.slice(0, 3).map((type) => (
              <Chip key={type} label={type} size="small" variant="outlined" />
            ))}
            {group.piiTypes.length > 3 && (
              <Chip label={`+${group.piiTypes.length - 3}`} size="small" variant="outlined" />
            )}
          </Box>
        </TableCell>
        <TableCell>
          <Tooltip title={group.hash}>
            <Typography
              variant="body2"
              sx={{
                fontFamily: 'monospace',
                fontSize: '0.75rem',
                maxWidth: 150,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              }}
            >
              {group.hash}
            </Typography>
          </Tooltip>
        </TableCell>
      </TableRow>
      <TableRow>
        <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={5}>
          <Collapse in={open} timeout="auto" unmountOnExit>
            <Box sx={{ margin: 2 }}>
              <Typography variant="subtitle2" gutterBottom fontWeight={600}>
                {t('duplicates.locations', { count: group.files.length })}
              </Typography>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell width={60}>#</TableCell>
                    <TableCell>{t('duplicates.colPath')}</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {group.files.map((filePath, index) => (
                    <TableRow key={index}>
                      <TableCell>
                        <Chip
                          label={index === 0 ? t('duplicates.original') : t('duplicates.copy', { n: index })}
                          size="small"
                          color={index === 0 ? 'primary' : 'default'}
                        />
                      </TableCell>
                      <TableCell>
                        <Typography
                          variant="body2"
                          sx={{
                            fontFamily: 'monospace',
                            fontSize: '0.8rem',
                            wordBreak: 'break-all',
                          }}
                        >
                          {filePath}
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Box>
          </Collapse>
        </TableCell>
      </TableRow>
    </>
  );
}

export default function DuplicateFiles({ results }: DuplicateFilesProps) {
  const [minCopies, setMinCopies] = useState<number>(2);
  const [sortBy, setSortBy] = useState<string>('copies');
  const { t } = useTranslation();

  const duplicateGroups = useMemo(() => {
    if (!results?.detections) return [];

    const fileMap = new Map<string, { hash: string; piiTypes: Set<string>; count: number }>();

    results.detections.forEach((detection) => {
      if (!detection.filePath || !detection.piiType) return;

      const key = detection.filePath;
      const hash = (detection as { fileHash?: string }).fileHash || '';

      if (!hash) return;

      if (!fileMap.has(key)) {
        fileMap.set(key, { hash, piiTypes: new Set(), count: 0 });
      }

      const fileData = fileMap.get(key)!;
      fileData.piiTypes.add(detection.piiType);
      fileData.count++;
    });

    const hashMap = new Map<string, { files: string[]; piiCount: number; piiTypes: Set<string> }>();

    fileMap.forEach((data, filePath) => {
      if (!hashMap.has(data.hash)) {
        hashMap.set(data.hash, { files: [], piiCount: 0, piiTypes: new Set() });
      }

      const group = hashMap.get(data.hash)!;
      group.files.push(filePath);
      group.piiCount = Math.max(group.piiCount, data.count);
      data.piiTypes.forEach((type) => group.piiTypes.add(type));
    });

    const groups: DuplicateGroup[] = [];
    hashMap.forEach((data, hash) => {
      if (data.files.length >= minCopies) {
        groups.push({
          hash,
          files: data.files,
          piiCount: data.piiCount,
          piiTypes: Array.from(data.piiTypes),
        });
      }
    });

    groups.sort((a, b) => {
      if (sortBy === 'copies') {
        return b.files.length - a.files.length;
      } else if (sortBy === 'pii') {
        return b.piiCount - a.piiCount;
      }
      return 0;
    });

    return groups;
  }, [results, minCopies, sortBy]);

  if (!results) {
    return (
      <Box>
        <PageHeader icon={<ContentCopyIcon />} title={t('duplicates.titleEmpty')} />
        <EmptyState icon={<ContentCopyIcon />} title={t('duplicates.titleEmpty')} description={t('duplicates.noScan')} />
      </Box>
    );
  }

  const totalDuplicates = duplicateGroups.reduce((sum, group) => sum + group.files.length, 0);
  const totalOriginals = duplicateGroups.length;

  return (
    <Box>
      <PageHeader icon={<ContentCopyIcon />} title={t('duplicates.title')} subtitle={t('duplicates.subtitle')} />

      {/* Statistiques */}
      <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap' }}>
        <Card sx={{ flex: 1, minWidth: 200 }}>
          <CardContent>
            <Typography variant="h3" fontWeight={700} color="warning.main">
              {duplicateGroups.length}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {t('duplicates.groups')}
            </Typography>
          </CardContent>
        </Card>
        <Card sx={{ flex: 1, minWidth: 200 }}>
          <CardContent>
            <Typography variant="h3" fontWeight={700} color="error.main">
              {totalDuplicates}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {t('duplicates.totalCopies')}
            </Typography>
          </CardContent>
        </Card>
        <Card sx={{ flex: 1, minWidth: 200 }}>
          <CardContent>
            <Typography variant="h3" fontWeight={700} color="info.main">
              {totalDuplicates - totalOriginals}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {t('duplicates.redundant')}
            </Typography>
          </CardContent>
        </Card>
      </Box>

      {/* Alerte */}
      {duplicateGroups.length > 0 && (
        <Alert severity="warning" icon={<WarningIcon />} sx={{ mb: 3 }}>
          <Typography variant="body2" fontWeight={600}>
            {t('duplicates.riskAlert')}
          </Typography>
          <Typography variant="body2">
            {t('duplicates.riskAlertText')}
          </Typography>
        </Alert>
      )}

      {duplicateGroups.length === 0 && (
        <Alert severity="success" sx={{ mb: 3 }}>
          <Typography variant="body2" fontWeight={600}>
            {t('duplicates.noDuplicates')}
          </Typography>
          <Typography variant="body2">
            {t('duplicates.noDuplicatesText')}
          </Typography>
        </Alert>
      )}

      {/* Filtres */}
      {duplicateGroups.length > 0 && (
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', mb: 2, gap: 2 }}>
          <FormControl size="small" sx={{ minWidth: 180 }}>
            <InputLabel>{t('duplicates.minCopies')}</InputLabel>
            <Select
              value={minCopies}
              label={t('duplicates.minCopies')}
              onChange={(e) => setMinCopies(e.target.value as number)}
            >
              <MenuItem value={2}>{t('duplicates.copiesOrMore', { n: 2 })}</MenuItem>
              <MenuItem value={3}>{t('duplicates.copiesOrMore', { n: 3 })}</MenuItem>
              <MenuItem value={4}>{t('duplicates.copiesOrMore', { n: 4 })}</MenuItem>
              <MenuItem value={5}>{t('duplicates.copiesOrMore', { n: 5 })}</MenuItem>
            </Select>
          </FormControl>

          <FormControl size="small" sx={{ minWidth: 160 }}>
            <InputLabel>{t('duplicates.sortBy')}</InputLabel>
            <Select value={sortBy} label={t('duplicates.sortBy')} onChange={(e) => setSortBy(e.target.value as string)}>
              <MenuItem value="copies">{t('duplicates.sortByCopies')}</MenuItem>
              <MenuItem value="pii">{t('duplicates.sortByPii')}</MenuItem>
            </Select>
          </FormControl>
        </Box>
      )}

      {/* Table des duplicatas */}
      {duplicateGroups.length > 0 && (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell width={60} />
                <TableCell>{t('duplicates.colCopies')}</TableCell>
                <TableCell>{t('duplicates.colPii')}</TableCell>
                <TableCell>{t('duplicates.colPiiTypes')}</TableCell>
                <TableCell>{t('duplicates.colHash')}</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {duplicateGroups.map((group) => (
                <DuplicateRow key={group.hash} group={group} />
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Box>
  );
}
