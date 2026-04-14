import { Box, Card, CardContent, Typography } from '@mui/material';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import { ReactNode } from 'react';
import { useTheme } from '@mui/material/styles';
import { tokens } from '../../theme/designSystem';

interface StatCardProps {
  value: string | number;
  label: string;
  gradient?: string;
  icon?: ReactNode;
  subtext?: string;
  // New props
  trend?: { direction: 'up' | 'down'; value: string };
  sparkline?: number[];
  topBorderOnly?: boolean;
  accentColor?: string;
}

function SparklineSvg({ data, color }: { data: number[]; color: string }) {
  if (data.length < 2) return null;
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const points = data
    .map((v, i) => {
      const x = (i / (data.length - 1)) * 60;
      const y = 24 - ((v - min) / range) * 20;
      return `${x},${y}`;
    })
    .join(' ');
  return (
    <svg width="60" height="24" style={{ display: 'block' }}>
      <polyline
        points={points}
        fill="none"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity={0.6}
      />
    </svg>
  );
}

export default function StatCard({
  value,
  label,
  gradient,
  icon,
  subtext,
  trend,
  sparkline,
  topBorderOnly = false,
  accentColor,
}: StatCardProps) {
  const theme = useTheme();
  const dark = theme.palette.mode === 'dark';
  const c = tokens.colors;
  const borderGradient = gradient || `linear-gradient(135deg, ${c.accentPrimary} 0%, ${c.info} 100%)`;
  const resolvedAccent = accentColor || c.accentPrimary;

  if (topBorderOnly) {
    return (
      <Box sx={{ flex: '1 1 200px' }}>
        <Card
          sx={{
            height: '100%',
            borderTop: `3px solid ${resolvedAccent}`,
            borderRadius: `${tokens.radii.lg}px`,
            boxShadow: dark ? 'none' : tokens.shadows.card,
            bgcolor: 'background.paper',
            border: `1px solid ${dark ? c.borderDefault : c.light.borderDefault}`,
            borderTopColor: resolvedAccent,
          }}
        >
          <CardContent>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <Box sx={{ flex: 1 }}>
                {icon && (
                  <Box sx={{ mb: 1, color: 'text.secondary' }}>
                    {icon}
                  </Box>
                )}
                <Typography variant="h3" fontWeight={700} sx={{ color: 'text.primary', lineHeight: 1.1 }}>
                  {value}
                </Typography>
                <Typography variant="body2" sx={{ color: 'text.secondary', mt: 0.5 }}>
                  {label}
                </Typography>
                {subtext && (
                  <Typography variant="caption" sx={{ mt: 0.5, display: 'block', color: 'text.disabled' }}>
                    {subtext}
                  </Typography>
                )}
                {trend && (
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 1 }}>
                    {trend.direction === 'up' ? (
                      <TrendingUpIcon sx={{ fontSize: 16, color: 'success.main' }} />
                    ) : (
                      <TrendingDownIcon sx={{ fontSize: 16, color: 'error.main' }} />
                    )}
                    <Typography
                      variant="caption"
                      fontWeight={600}
                      sx={{ color: trend.direction === 'up' ? 'success.main' : 'error.main' }}
                    >
                      {trend.value}
                    </Typography>
                  </Box>
                )}
              </Box>
              {sparkline && sparkline.length >= 2 && (
                <Box sx={{ ml: 1, alignSelf: 'flex-end', pb: 0.5 }}>
                  <SparklineSvg data={sparkline} color={resolvedAccent} />
                </Box>
              )}
            </Box>
          </CardContent>
        </Card>
      </Box>
    );
  }

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
            <Typography variant="h3" fontWeight={700} sx={{ color: 'text.primary' }}>
              {value}
            </Typography>
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
              {label}
            </Typography>
            {subtext && (
              <Typography variant="caption" sx={{ mt: 1, display: 'block', color: 'text.disabled' }}>
                {subtext}
              </Typography>
            )}
            {trend && (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 1 }}>
                {trend.direction === 'up' ? (
                  <TrendingUpIcon sx={{ fontSize: 16, color: 'success.main' }} />
                ) : (
                  <TrendingDownIcon sx={{ fontSize: 16, color: 'error.main' }} />
                )}
                <Typography
                  variant="caption"
                  fontWeight={600}
                  sx={{ color: trend.direction === 'up' ? 'success.main' : 'error.main' }}
                >
                  {trend.value}
                </Typography>
              </Box>
            )}
          </CardContent>
        </Box>
      </Box>
    </Box>
  );
}
