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
  Avatar,
  Button,
  Chip,
  Collapse,
} from '@mui/material';
import { useNavigate, useLocation } from 'react-router-dom';
import DashboardIcon from '@mui/icons-material/Dashboard';
import SearchIcon from '@mui/icons-material/Search';
import FolderIcon from '@mui/icons-material/Folder';
import SecurityIcon from '@mui/icons-material/Security';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import LockOpenIcon from '@mui/icons-material/LockOpen';
import AssessmentIcon from '@mui/icons-material/Assessment';
import DownloadIcon from '@mui/icons-material/Download';
import CategoryIcon from '@mui/icons-material/Category';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import SettingsIcon from '@mui/icons-material/Settings';
import DeleteSweepIcon from '@mui/icons-material/DeleteSweep';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import DarkModeIcon from '@mui/icons-material/DarkMode';
import LightModeIcon from '@mui/icons-material/LightMode';
import PeopleIcon from '@mui/icons-material/People';
import LogoutIcon from '@mui/icons-material/Logout';
import PersonIcon from '@mui/icons-material/Person';
import HistoryIcon from '@mui/icons-material/History';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import HelpIcon from '@mui/icons-material/Help';
import InfoIcon from '@mui/icons-material/Info';
import BuildIcon from '@mui/icons-material/Build';
import ExpandLess from '@mui/icons-material/ExpandLess';
import ExpandMore from '@mui/icons-material/ExpandMore';
import { useAuth } from '../../contexts/AuthContext';

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
  path?: string;
  divider?: boolean;
  subItems?: MenuItem[];
  adminOnly?: boolean;
}

const menuItems: MenuItem[] = [
  // Section Scan
  { id: 'dashboard', label: 'Tableau de bord', icon: <DashboardIcon />, path: '/dashboard' },

  // Section Scans (avec sous-menu)
  {
    id: 'scans',
    label: 'Scans',
    icon: <SearchIcon />,
    divider: true,
    subItems: [
      { id: 'scanner', label: 'Nouveau Scan', icon: <SearchIcon />, path: '/scanner' },
      { id: 'history', label: 'Historique', icon: <HistoryIcon />, path: '/history' },
    ],
  },

  // Section Analyse des résultats (avec sous-menu)
  {
    id: 'analysis',
    label: 'Analyse des résultats',
    icon: <AssessmentIcon />,
    divider: true,
    subItems: [
      { id: 'risky-files', label: 'Fichiers à risque', icon: <FolderIcon />, path: '/risky-files' },
      { id: 'detections', label: 'Données sensibles', icon: <SecurityIcon />, path: '/detections' },
      { id: 'pii-category-analysis', label: 'Analyse par Catégories', icon: <CategoryIcon />, path: '/pii-category-analysis' },
      { id: 'duplicate-files', label: 'Fichiers dupliqués', icon: <ContentCopyIcon />, path: '/duplicate-files' },
      { id: 'staleness', label: 'Ancienneté', icon: <AccessTimeIcon />, path: '/staleness' },
      { id: 'exposure', label: 'Exposition', icon: <LockOpenIcon />, path: '/exposure' },
    ],
  },

  // Section Rapports & Exports
  { id: 'reports', label: 'Rapports & Analytics', icon: <AssessmentIcon />, path: '/reports' },
  { id: 'exports', label: 'Exports', icon: <DownloadIcon />, path: '/exports' },
  { id: 'data-retention', label: 'Rétention', icon: <DeleteSweepIcon />, path: '/data-retention', divider: true },

  // Section Maintenance (avec sous-menu)
  {
    id: 'maintenance',
    label: 'Maintenance',
    icon: <BuildIcon />,
    adminOnly: true,
    divider: true,
    subItems: [
      { id: 'users', label: 'Utilisateurs', icon: <PeopleIcon />, path: '/users', adminOnly: true },
      { id: 'database', label: 'Base de données', icon: <AdminPanelSettingsIcon />, path: '/database', adminOnly: true },
      { id: 'audit-trail', label: 'Audit Trail', icon: <HistoryIcon />, path: '/audit-trail', adminOnly: true },
      { id: 'settings', label: 'Paramètres', icon: <SettingsIcon />, path: '/settings' },
    ],
  },

  // Section Profil
  { id: 'profile', label: 'Mon Profil', icon: <AccountCircleIcon />, path: '/profile' },
  { id: 'support', label: 'Support', icon: <HelpIcon />, path: '/support' },
  { id: 'about', label: 'À propos', icon: <InfoIcon />, path: '/about' },
];

export default function Sidebar({ darkMode, onToggleDarkMode }: SidebarProps) {
  const [collapsed, setCollapsed] = useState(false);
  const [scansOpen, setScansOpen] = useState(false);
  const [maintenanceOpen, setMaintenanceOpen] = useState(false);
  const [analysisOpen, setAnalysisOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { user, isAdmin, logout } = useAuth();

  const drawerWidth = collapsed ? DRAWER_WIDTH_COLLAPSED : DRAWER_WIDTH;

  const handleNavigate = (path: string) => {
    navigate(path);
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  // Filter menu items based on user role
  const filteredMenuItems = menuItems.filter(item => {
    // Admin-only menu items
    if (item.adminOnly && !isAdmin) {
      return false;
    }
    return true;
  });

  // Check if current path is under scans
  const isScansPath = ['/scanner', '/history'].includes(location.pathname);

  // Check if current path is under maintenance
  const isMaintenancePath = ['/users', '/database', '/audit-trail', '/settings'].includes(location.pathname);

  // Check if current path is under analysis
  const isAnalysisPath = ['/risky-files', '/detections', '/pii-category-analysis', '/duplicate-files', '/staleness', '/exposure'].includes(location.pathname);

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
        {filteredMenuItems.map((item) => (
          <Box key={item.id}>
            {item.subItems ? (
              // Menu avec sous-items (Scans, Analyse, ou Maintenance)
              <>
                <Tooltip title={collapsed ? item.label : ''} placement="right">
                  <ListItem disablePadding sx={{ mb: 0.5 }}>
                    <ListItemButton
                      selected={
                        item.id === 'scans' ? isScansPath :
                        item.id === 'analysis' ? isAnalysisPath :
                        item.id === 'maintenance' ? isMaintenancePath : false
                      }
                      onClick={() => !collapsed && (
                        item.id === 'scans' ? setScansOpen(!scansOpen) :
                        item.id === 'analysis' ? setAnalysisOpen(!analysisOpen) :
                        setMaintenanceOpen(!maintenanceOpen)
                      )}
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
                          color: (
                            item.id === 'scans' ? isScansPath :
                            item.id === 'analysis' ? isAnalysisPath :
                            item.id === 'maintenance' ? isMaintenancePath : false
                          ) ? 'white' : (darkMode ? '#a0a4c1' : '#6b7280'),
                        }}
                      >
                        {item.icon}
                      </ListItemIcon>
                      {!collapsed && (
                        <>
                          <ListItemText primary={item.label} />
                          {(
                            item.id === 'scans' ? scansOpen :
                            item.id === 'analysis' ? analysisOpen :
                            maintenanceOpen
                          ) ? <ExpandLess /> : <ExpandMore />}
                        </>
                      )}
                    </ListItemButton>
                  </ListItem>
                </Tooltip>

                {/* Sous-menu */}
                {!collapsed && (
                  <Collapse in={
                    item.id === 'scans' ? scansOpen :
                    item.id === 'analysis' ? analysisOpen :
                    maintenanceOpen
                  } timeout="auto" unmountOnExit>
                    <List component="div" disablePadding>
                      {item.subItems
                        .filter(subItem => !subItem.adminOnly || isAdmin)
                        .map((subItem) => (
                          <Tooltip key={subItem.id} title={''} placement="right">
                            <ListItem disablePadding sx={{ mb: 0.5 }}>
                              <ListItemButton
                                selected={location.pathname === subItem.path}
                                onClick={() => subItem.path && handleNavigate(subItem.path)}
                                sx={{
                                  borderRadius: 2,
                                  minHeight: 40,
                                  pl: 4,
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
                                    mr: 2,
                                    justifyContent: 'center',
                                    color: location.pathname === subItem.path ? 'white' : (darkMode ? '#a0a4c1' : '#6b7280'),
                                  }}
                                >
                                  {subItem.icon}
                                </ListItemIcon>
                                <ListItemText
                                  primary={subItem.label}
                                  primaryTypographyProps={{ fontSize: '0.9rem' }}
                                />
                              </ListItemButton>
                            </ListItem>
                          </Tooltip>
                        ))}
                    </List>
                  </Collapse>
                )}
              </>
            ) : (
              // Menu item normal (sans sous-items)
              <Tooltip title={collapsed ? item.label : ''} placement="right">
                <ListItem disablePadding sx={{ mb: 0.5 }}>
                  <ListItemButton
                    selected={location.pathname === item.path}
                    onClick={() => item.path && handleNavigate(item.path)}
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
            )}
            {item.divider && <Divider sx={{ my: 1, opacity: 0.3 }} />}
          </Box>
        ))}
      </List>

      {/* Footer - User Info & Actions */}
      <Box sx={{ mt: 'auto', p: 2 }}>
        <Divider sx={{ mb: 2, opacity: 0.3 }} />

        {/* User Info */}
        {user && (
          <Box sx={{ mb: 2 }}>
            {collapsed ? (
              <Tooltip title={`${user.fullName} (${user.role})`} placement="right">
                <Avatar
                  sx={{
                    width: 40,
                    height: 40,
                    mx: 'auto',
                    bgcolor: 'primary.main',
                    cursor: 'default',
                  }}
                >
                  <PersonIcon />
                </Avatar>
              </Tooltip>
            ) : (
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1.5,
                  p: 1.5,
                  borderRadius: 2,
                  bgcolor: darkMode ? 'rgba(102, 126, 234, 0.1)' : 'rgba(102, 126, 234, 0.08)',
                }}
              >
                <Avatar
                  sx={{
                    width: 40,
                    height: 40,
                    bgcolor: 'primary.main',
                  }}
                >
                  <PersonIcon />
                </Avatar>
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Typography
                    variant="body2"
                    fontWeight={600}
                    noWrap
                    sx={{ lineHeight: 1.2 }}
                  >
                    {user.fullName}
                  </Typography>
                  <Chip
                    label={user.role}
                    size="small"
                    color={user.role === 'Admin' ? 'secondary' : 'primary'}
                    sx={{ mt: 0.5, height: 20, fontSize: '0.7rem' }}
                  />
                </Box>
              </Box>
            )}
          </Box>
        )}

        {/* Logout Button */}
        <Box sx={{ mb: 2 }}>
          {collapsed ? (
            <Tooltip title="Déconnexion" placement="right">
              <IconButton
                onClick={handleLogout}
                sx={{
                  width: '100%',
                  color: darkMode ? '#ff6b6b' : '#dc2626',
                  '&:hover': {
                    bgcolor: darkMode ? 'rgba(255, 107, 107, 0.1)' : 'rgba(220, 38, 38, 0.1)',
                  },
                }}
              >
                <LogoutIcon />
              </IconButton>
            </Tooltip>
          ) : (
            <Button
              fullWidth
              variant="outlined"
              startIcon={<LogoutIcon />}
              onClick={handleLogout}
              sx={{
                borderColor: darkMode ? '#ff6b6b' : '#dc2626',
                color: darkMode ? '#ff6b6b' : '#dc2626',
                '&:hover': {
                  borderColor: darkMode ? '#ff5252' : '#b91c1c',
                  bgcolor: darkMode ? 'rgba(255, 107, 107, 0.1)' : 'rgba(220, 38, 38, 0.1)',
                },
              }}
            >
              Déconnexion
            </Button>
          )}
        </Box>

        {/* Dark Mode Toggle */}
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

        {/* Cyberprevs Branding */}
        {!collapsed && (
          <Box
            sx={{
              mt: 2,
              pt: 2,
              borderTop: '1px solid',
              borderColor: 'divider',
              textAlign: 'center',
            }}
          >
            <Typography
              variant="caption"
              sx={{
                color: 'text.secondary',
                fontSize: '0.7rem',
                display: 'block',
                mb: 0.5,
              }}
            >
              Développé par
            </Typography>
            <Typography
              variant="body2"
              sx={{
                fontWeight: 700,
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                fontSize: '0.95rem',
                letterSpacing: '0.5px',
              }}
            >
              Cyberprevs
            </Typography>
            <Typography
              variant="caption"
              sx={{
                color: 'text.secondary',
                fontSize: '0.65rem',
                display: 'block',
                mt: 0.5,
              }}
            >
              v1.0.0 • © 2025
            </Typography>
          </Box>
        )}
      </Box>
    </Drawer>
  );
}
