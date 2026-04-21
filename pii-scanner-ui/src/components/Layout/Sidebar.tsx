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
import KeyIcon from '@mui/icons-material/Key';
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
import { tokens } from '../../theme/designSystem';
import { useTranslation } from 'react-i18next';
import LanguageIcon from '@mui/icons-material/Language';

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

const buildMenuItems = (t: (key: string) => string): MenuItem[] => [
  { id: 'dashboard', label: t('sidebar.dashboard'), icon: <DashboardIcon />, path: '/dashboard' },
  {
    id: 'scans',
    label: t('sidebar.scans'),
    icon: <SearchIcon />,
    divider: true,
    subItems: [
      { id: 'scanner', label: t('sidebar.newScan'), icon: <SearchIcon />, path: '/scanner' },
      { id: 'history', label: t('sidebar.history'), icon: <HistoryIcon />, path: '/history' },
    ],
  },
  {
    id: 'analysis',
    label: t('sidebar.analysis'),
    icon: <AssessmentIcon />,
    divider: true,
    subItems: [
      { id: 'risky-files', label: t('sidebar.riskyFiles'), icon: <FolderIcon />, path: '/risky-files' },
      { id: 'detections', label: t('sidebar.detections'), icon: <SecurityIcon />, path: '/detections' },
      { id: 'pii-category-analysis', label: t('sidebar.categoryAnalysis'), icon: <CategoryIcon />, path: '/pii-category-analysis' },
      { id: 'duplicate-files', label: t('sidebar.duplicateFiles'), icon: <ContentCopyIcon />, path: '/duplicate-files' },
      { id: 'staleness', label: t('sidebar.staleness'), icon: <AccessTimeIcon />, path: '/staleness' },
      { id: 'exposure', label: t('sidebar.exposure'), icon: <LockOpenIcon />, path: '/exposure' },
    ],
  },
  { id: 'reports', label: t('sidebar.reports'), icon: <AssessmentIcon />, path: '/reports' },
  { id: 'exports', label: t('sidebar.exports'), icon: <DownloadIcon />, path: '/exports' },
  { id: 'decrypt', label: t('sidebar.decrypt'), icon: <KeyIcon />, path: '/decrypt' },
  { id: 'data-retention', label: t('sidebar.retention'), icon: <DeleteSweepIcon />, path: '/data-retention', divider: true },
  {
    id: 'maintenance',
    label: t('sidebar.maintenance'),
    icon: <BuildIcon />,
    adminOnly: true,
    divider: true,
    subItems: [
      { id: 'users', label: t('sidebar.users'), icon: <PeopleIcon />, path: '/users', adminOnly: true },
      { id: 'database', label: t('sidebar.database'), icon: <AdminPanelSettingsIcon />, path: '/database', adminOnly: true },
      { id: 'audit-trail', label: t('sidebar.auditTrail'), icon: <HistoryIcon />, path: '/audit-trail', adminOnly: true },
      { id: 'settings', label: t('sidebar.settings'), icon: <SettingsIcon />, path: '/settings' },
    ],
  },
  { id: 'profile', label: t('sidebar.profile'), icon: <AccountCircleIcon />, path: '/profile' },
  { id: 'support', label: t('sidebar.support'), icon: <HelpIcon />, path: '/support' },
  { id: 'about', label: t('sidebar.about'), icon: <InfoIcon />, path: '/about' },
];

export default function Sidebar({ darkMode, onToggleDarkMode }: SidebarProps) {
  const [collapsed, setCollapsed] = useState(false);
  const [scansOpen, setScansOpen] = useState(false);
  const [maintenanceOpen, setMaintenanceOpen] = useState(false);
  const [analysisOpen, setAnalysisOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { user, isAdmin, logout } = useAuth();
  const { t, i18n } = useTranslation();

  const menuItems = buildMenuItems(t);

  const toggleLanguage = () => {
    i18n.changeLanguage(i18n.language === 'fr' ? 'en' : 'fr');
  };

  const c = tokens.colors;
  const drawerWidth = collapsed ? DRAWER_WIDTH_COLLAPSED : DRAWER_WIDTH;

  const handleNavigate = (path: string) => {
    navigate(path);
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const filteredMenuItems = menuItems.filter(item => {
    if (item.adminOnly && !isAdmin) {
      return false;
    }
    return true;
  });

  const isScansPath = ['/scanner', '/history'].includes(location.pathname);
  const isMaintenancePath = ['/users', '/database', '/audit-trail', '/settings'].includes(location.pathname);
  const isAnalysisPath = ['/risky-files', '/detections', '/pii-category-analysis', '/duplicate-files', '/staleness', '/exposure'].includes(location.pathname);

  const isSelected = (item: MenuItem) =>
    item.id === 'scans' ? isScansPath :
    item.id === 'analysis' ? isAnalysisPath :
    item.id === 'maintenance' ? isMaintenancePath : false;

  const getOpenState = (item: MenuItem) =>
    item.id === 'scans' ? scansOpen :
    item.id === 'analysis' ? analysisOpen :
    maintenanceOpen;

  const toggleOpen = (item: MenuItem) => {
    if (item.id === 'scans') setScansOpen(!scansOpen);
    else if (item.id === 'analysis') setAnalysisOpen(!analysisOpen);
    else setMaintenanceOpen(!maintenanceOpen);
  };

  // Colors for sidebar depending on mode
  const sidebarBg = darkMode ? c.bgSurface : c.light.bgSurface;
  const sidebarBorder = darkMode ? c.borderDefault : c.light.borderDefault;
  const iconInactive = darkMode ? c.textTertiary : c.light.textTertiary;
  const hoverBg = darkMode ? c.accentPrimaryMuted : 'rgba(0, 229, 153, 0.06)';

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
          backgroundColor: sidebarBg,
          borderRight: `1px solid ${sidebarBorder}`,
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
            <Box
              component="svg"
              viewBox="0 0 24 24"
              sx={{ width: 28, height: 28, fill: c.accentPrimary }}
            >
              <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm0 2.18l7 3.12v4.7c0 4.83-3.23 9.36-7 10.57-3.77-1.21-7-5.74-7-10.57V6.3l7-3.12z" />
            </Box>
            <Typography variant="h6" fontWeight={700} sx={{ color: c.accentPrimary }}>
              PII Scanner
            </Typography>
          </Box>
        )}
        <IconButton onClick={() => setCollapsed(!collapsed)} size="small" sx={{ color: iconInactive }}>
          {collapsed ? <ChevronRightIcon /> : <ChevronLeftIcon />}
        </IconButton>
      </Box>

      <Divider />

      {/* Menu Items */}
      <List sx={{ px: 1, py: 2 }}>
        {filteredMenuItems.map((item) => (
          <Box key={item.id}>
            {item.subItems ? (
              <>
                <Tooltip title={collapsed ? item.label : ''} placement="right">
                  <ListItem disablePadding sx={{ mb: 0.5 }}>
                    <ListItemButton
                      selected={isSelected(item)}
                      onClick={() => !collapsed && toggleOpen(item)}
                      sx={{
                        borderRadius: 2,
                        minHeight: 44,
                        justifyContent: collapsed ? 'center' : 'flex-start',
                        '&.Mui-selected': {
                          backgroundColor: c.accentPrimaryMuted,
                          color: c.accentPrimary,
                          '&:hover': { backgroundColor: c.accentPrimaryMuted },
                          '& .MuiListItemIcon-root': { color: c.accentPrimary },
                          '&::before': {
                            content: '""',
                            position: 'absolute',
                            left: 0,
                            top: 6,
                            bottom: 6,
                            width: 3,
                            bgcolor: c.accentPrimary,
                            borderRadius: '0 2px 2px 0',
                            background: c.accentPrimary,
                          },
                        },
                        '&:hover': { backgroundColor: hoverBg },
                        position: 'relative',
                      }}
                    >
                      <ListItemIcon
                        sx={{
                          minWidth: 0,
                          mr: collapsed ? 0 : 2,
                          justifyContent: 'center',
                          color: isSelected(item) ? c.accentPrimary : iconInactive,
                        }}
                      >
                        {item.icon}
                      </ListItemIcon>
                      {!collapsed && (
                        <>
                          <ListItemText primary={item.label} />
                          {getOpenState(item) ? <ExpandLess /> : <ExpandMore />}
                        </>
                      )}
                    </ListItemButton>
                  </ListItem>
                </Tooltip>

                {!collapsed && (
                  <Collapse in={getOpenState(item)} timeout="auto" unmountOnExit>
                    <List component="div" disablePadding>
                      {item.subItems
                        .filter(subItem => !subItem.adminOnly || isAdmin)
                        .map((subItem) => (
                          <ListItem key={subItem.id} disablePadding sx={{ mb: 0.5 }}>
                            <ListItemButton
                              selected={location.pathname === subItem.path}
                              onClick={() => subItem.path && handleNavigate(subItem.path)}
                              sx={{
                                borderRadius: 2,
                                minHeight: 38,
                                pl: 4,
                                '&.Mui-selected': {
                                  backgroundColor: c.accentPrimaryMuted,
                                  color: c.accentPrimary,
                                  '&:hover': { backgroundColor: c.accentPrimaryMuted },
                                  '& .MuiListItemIcon-root': { color: c.accentPrimary },
                                },
                                '&:hover': { backgroundColor: hoverBg },
                              }}
                            >
                              <ListItemIcon
                                sx={{
                                  minWidth: 0,
                                  mr: 2,
                                  justifyContent: 'center',
                                  color: location.pathname === subItem.path ? c.accentPrimary : iconInactive,
                                }}
                              >
                                {subItem.icon}
                              </ListItemIcon>
                              <ListItemText
                                primary={subItem.label}
                                primaryTypographyProps={{ fontSize: '0.875rem' }}
                              />
                            </ListItemButton>
                          </ListItem>
                        ))}
                    </List>
                  </Collapse>
                )}
              </>
            ) : (
              <Tooltip title={collapsed ? item.label : ''} placement="right">
                <ListItem disablePadding sx={{ mb: 0.5 }}>
                  <ListItemButton
                    selected={location.pathname === item.path}
                    onClick={() => item.path && handleNavigate(item.path)}
                    sx={{
                      borderRadius: 2,
                      minHeight: 44,
                      justifyContent: collapsed ? 'center' : 'flex-start',
                      '&.Mui-selected': {
                        backgroundColor: c.accentPrimaryMuted,
                        color: c.accentPrimary,
                        '&:hover': { backgroundColor: c.accentPrimaryMuted },
                        '& .MuiListItemIcon-root': { color: c.accentPrimary },
                      },
                      '&:hover': { backgroundColor: hoverBg },
                    }}
                  >
                    <ListItemIcon
                      sx={{
                        minWidth: 0,
                        mr: collapsed ? 0 : 2,
                        justifyContent: 'center',
                        color: location.pathname === item.path ? c.accentPrimary : iconInactive,
                      }}
                    >
                      {item.icon}
                    </ListItemIcon>
                    {!collapsed && <ListItemText primary={item.label} />}
                  </ListItemButton>
                </ListItem>
              </Tooltip>
            )}
            {item.divider && <Divider sx={{ my: 1 }} />}
          </Box>
        ))}
      </List>

      {/* Footer */}
      <Box sx={{ mt: 'auto', p: 2 }}>
        <Divider sx={{ mb: 2 }} />

        {/* User Info */}
        {user && (
          <Box sx={{ mb: 2 }}>
            {collapsed ? (
              <Tooltip title={`${user.fullName} (${user.role})`} placement="right">
                <Avatar
                  sx={{
                    width: 36,
                    height: 36,
                    mx: 'auto',
                    bgcolor: c.accentPrimaryMuted,
                    color: c.accentPrimary,
                  }}
                >
                  <PersonIcon fontSize="small" />
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
                  ...(darkMode ? {
                    backgroundColor: 'rgba(255,255,255,0.03)',
                    backdropFilter: 'blur(8px)',
                    WebkitBackdropFilter: 'blur(8px)',
                    border: '1px solid rgba(255,255,255,0.08)',
                  } : {
                    bgcolor: 'rgba(0, 229, 153, 0.06)',
                    border: '1px solid rgba(0, 229, 153, 0.1)',
                  }),
                }}
              >
                <Avatar
                  sx={{
                    width: 36,
                    height: 36,
                    bgcolor: c.accentPrimaryMuted,
                    color: c.accentPrimary,
                  }}
                >
                  <PersonIcon fontSize="small" />
                </Avatar>
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Typography variant="body2" fontWeight={600} noWrap sx={{ lineHeight: 1.2 }}>
                    {user.fullName}
                  </Typography>
                  <Chip
                    label={user.role}
                    size="small"
                    sx={{
                      mt: 0.5,
                      height: 20,
                      fontSize: '0.7rem',
                      backgroundColor: user.role === 'Admin' ? c.accentPrimaryMuted : c.infoMuted,
                      color: user.role === 'Admin' ? c.accentPrimary : c.info,
                      border: `1px solid ${user.role === 'Admin' ? 'rgba(0, 229, 153, 0.2)' : 'rgba(59, 130, 246, 0.2)'}`,
                    }}
                  />
                </Box>
              </Box>
            )}
          </Box>
        )}

        {/* Logout */}
        <Box sx={{ mb: 2 }}>
          {collapsed ? (
            <Tooltip title={t('sidebar.logout')} placement="right">
              <IconButton
                onClick={handleLogout}
                sx={{
                  width: '100%',
                  color: c.danger,
                  '&:hover': { bgcolor: c.dangerMuted },
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
                borderColor: 'rgba(244, 82, 82, 0.3)',
                color: c.danger,
                '&:hover': {
                  borderColor: c.danger,
                  bgcolor: c.dangerMuted,
                },
              }}
            >
              {t('sidebar.logout')}
            </Button>
          )}
        </Box>

        {/* Language Toggle */}
        {collapsed ? (
          <Tooltip title={i18n.language === 'fr' ? 'Switch to English' : 'Passer en Français'} placement="right">
            <IconButton onClick={toggleLanguage} sx={{ width: '100%', color: iconInactive, mb: 1 }}>
              <LanguageIcon />
            </IconButton>
          </Tooltip>
        ) : (
          <Button
            fullWidth
            variant="outlined"
            size="small"
            startIcon={<LanguageIcon />}
            onClick={toggleLanguage}
            sx={{
              mb: 1,
              borderColor: 'divider',
              color: 'text.secondary',
              '&:hover': { borderColor: 'primary.main', color: 'primary.main' },
            }}
          >
            {i18n.language === 'fr' ? 'English' : 'Français'}
          </Button>
        )}

        {/* Dark Mode */}
        {collapsed ? (
          <Tooltip title={darkMode ? t('sidebar.lightMode') : t('sidebar.darkMode')} placement="right">
            <IconButton onClick={onToggleDarkMode} sx={{ width: '100%', color: iconInactive }}>
              {darkMode ? <LightModeIcon /> : <DarkModeIcon />}
            </IconButton>
          </Tooltip>
        ) : (
          <FormControlLabel
            control={
              <Switch
                checked={darkMode}
                onChange={onToggleDarkMode}
                sx={{
                  '& .Mui-checked': { color: c.accentPrimary },
                  '& .Mui-checked + .MuiSwitch-track': { backgroundColor: c.accentPrimary },
                }}
              />
            }
            label={
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                {darkMode ? <DarkModeIcon fontSize="small" /> : <LightModeIcon fontSize="small" />}
                <Typography variant="body2">
                  {darkMode ? t('sidebar.darkMode') : t('sidebar.lightMode')}
                </Typography>
              </Box>
            }
            sx={{ width: '100%', ml: 0 }}
          />
        )}

        {/* Branding */}
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
              sx={{ color: c.textTertiary, fontSize: '0.65rem', display: 'block', mb: 0.5 }}
            >
              {t('sidebar.developedBy')}
            </Typography>
            <Typography
              variant="body2"
              sx={{ fontWeight: 700, color: c.accentPrimary, fontSize: '0.9rem', letterSpacing: '0.5px' }}
            >
              Cyberprevs
            </Typography>
            <Typography
              variant="caption"
              sx={{ color: c.textTertiary, fontSize: '0.6rem', display: 'block', mt: 0.5 }}
            >
              v2.0.0
            </Typography>
          </Box>
        )}
      </Box>
    </Drawer>
  );
}
