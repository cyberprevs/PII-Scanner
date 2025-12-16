import { useState } from 'react';
import {
  Box,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
  Divider,
  IconButton,
  Switch,
  FormControlLabel,
  Tooltip,
} from '@mui/material';
import { useNavigate, useLocation } from 'react-router-dom';
import HomeIcon from '@mui/icons-material/Home';
import DashboardIcon from '@mui/icons-material/Dashboard';
import SearchIcon from '@mui/icons-material/Search';
import FolderIcon from '@mui/icons-material/Folder';
import SecurityIcon from '@mui/icons-material/Security';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import LockOpenIcon from '@mui/icons-material/LockOpen';
import AssessmentIcon from '@mui/icons-material/Assessment';
import DownloadIcon from '@mui/icons-material/Download';
import SettingsIcon from '@mui/icons-material/Settings';
import DeleteSweepIcon from '@mui/icons-material/DeleteSweep';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import DarkModeIcon from '@mui/icons-material/DarkMode';
import LightModeIcon from '@mui/icons-material/LightMode';

const DRAWER_WIDTH = 240;
const DRAWER_WIDTH_COLLAPSED = 65;

interface SidebarProps {
  darkMode: boolean;
  onToggleDarkMode: () => void;
}

interface MenuItem {
  id: string;
  label: string;
  icon: React.ReactElement;
  path: string;
  divider?: boolean;
}

const menuItems: MenuItem[] = [
  { id: 'home', label: 'Accueil', icon: <HomeIcon />, path: '/' },
  { id: 'dashboard', label: 'Tableau de bord', icon: <DashboardIcon />, path: '/dashboard' },
  { id: 'scanner', label: 'Scanner', icon: <SearchIcon />, path: '/scanner', divider: true },
  { id: 'risky-files', label: 'Fichiers à risque', icon: <FolderIcon />, path: '/risky-files' },
  { id: 'detections', label: 'Données sensibles', icon: <SecurityIcon />, path: '/detections' },
  { id: 'staleness', label: 'Ancienneté', icon: <AccessTimeIcon />, path: '/staleness' },
  { id: 'exposure', label: 'Exposition', icon: <LockOpenIcon />, path: '/exposure', divider: true },
  { id: 'reports', label: 'Rapports & Analytics', icon: <AssessmentIcon />, path: '/reports' },
  { id: 'exports', label: 'Exports', icon: <DownloadIcon />, path: '/exports' },
  { id: 'data-retention', label: 'Rétention des données', icon: <DeleteSweepIcon />, path: '/data-retention', divider: true },
  { id: 'settings', label: 'Paramètres', icon: <SettingsIcon />, path: '/settings' },
];

export default function Sidebar({ darkMode, onToggleDarkMode }: SidebarProps) {
  const [collapsed, setCollapsed] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const drawerWidth = collapsed ? DRAWER_WIDTH_COLLAPSED : DRAWER_WIDTH;

  const handleNavigate = (path: string) => {
    navigate(path);
  };

  return (
    <Drawer
      variant="permanent"
      sx={{
        width: drawerWidth,
        flexShrink: 0,
        transition: 'width 0.3s ease',
        '& .MuiDrawer-paper': {
          width: drawerWidth,
          boxSizing: 'border-box',
          transition: 'width 0.3s ease',
          background: darkMode
            ? 'linear-gradient(180deg, #1a1f37 0%, #2d3561 100%)'
            : 'linear-gradient(180deg, #ffffff 0%, #f5f7fa 100%)',
          borderRight: darkMode ? '1px solid rgba(255,255,255,0.1)' : '1px solid rgba(0,0,0,0.08)',
          overflowX: 'hidden',
        },
      }}
    >
      {/* Header */}
      <Box
        sx={{
          p: 2,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          minHeight: 64,
        }}
      >
        {!collapsed && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <SecurityIcon sx={{ fontSize: 32, color: '#667eea' }} />
            <Typography variant="h6" fontWeight={700} sx={{
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}>
              PII Scanner
            </Typography>
          </Box>
        )}
        <IconButton onClick={() => setCollapsed(!collapsed)} size="small">
          {collapsed ? <ChevronRightIcon /> : <ChevronLeftIcon />}
        </IconButton>
      </Box>

      <Divider />

      {/* Menu Items */}
      <List sx={{ px: 1, py: 2 }}>
        {menuItems.map((item) => (
          <Box key={item.id}>
            <Tooltip title={collapsed ? item.label : ''} placement="right">
              <ListItem disablePadding sx={{ mb: 0.5 }}>
                <ListItemButton
                  selected={location.pathname === item.path}
                  onClick={() => handleNavigate(item.path)}
                  sx={{
                    borderRadius: 2,
                    minHeight: 48,
                    justifyContent: collapsed ? 'center' : 'flex-start',
                    '&.Mui-selected': {
                      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                      color: 'white',
                      '&:hover': {
                        background: 'linear-gradient(135deg, #5a6fd8 0%, #6a4190 100%)',
                      },
                      '& .MuiListItemIcon-root': {
                        color: 'white',
                      },
                    },
                    '&:hover': {
                      backgroundColor: darkMode ? 'rgba(102, 126, 234, 0.1)' : 'rgba(102, 126, 234, 0.08)',
                    },
                  }}
                >
                  <ListItemIcon
                    sx={{
                      minWidth: 0,
                      mr: collapsed ? 0 : 2,
                      justifyContent: 'center',
                      color: location.pathname === item.path ? 'white' : (darkMode ? '#a0a4c1' : '#6b7280'),
                    }}
                  >
                    {item.icon}
                  </ListItemIcon>
                  {!collapsed && <ListItemText primary={item.label} />}
                </ListItemButton>
              </ListItem>
            </Tooltip>
            {item.divider && <Divider sx={{ my: 1, opacity: 0.3 }} />}
          </Box>
        ))}
      </List>

      {/* Footer - Dark Mode Toggle */}
      <Box sx={{ mt: 'auto', p: 2 }}>
        <Divider sx={{ mb: 2, opacity: 0.3 }} />
        {collapsed ? (
          <Tooltip title={darkMode ? 'Mode clair' : 'Mode sombre'} placement="right">
            <IconButton onClick={onToggleDarkMode} sx={{ width: '100%' }}>
              {darkMode ? <LightModeIcon /> : <DarkModeIcon />}
            </IconButton>
          </Tooltip>
        ) : (
          <FormControlLabel
            control={<Switch checked={darkMode} onChange={onToggleDarkMode} />}
            label={
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                {darkMode ? <DarkModeIcon fontSize="small" /> : <LightModeIcon fontSize="small" />}
                <Typography variant="body2">
                  {darkMode ? 'Mode sombre' : 'Mode clair'}
                </Typography>
              </Box>
            }
            sx={{ width: '100%', ml: 0 }}
          />
        )}
      </Box>
    </Drawer>
  );
}
