import { useState } from 'react';
import { Box, CssBaseline, ThemeProvider } from '@mui/material';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import { createAppTheme, tokens } from '../../theme/designSystem';


export default function MainLayout() {
  const [darkMode, setDarkMode] = useState(true);

  const theme = createAppTheme(darkMode);

  const handleToggleDarkMode = () => {
    setDarkMode(!darkMode);
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box sx={{ display: 'flex', minHeight: '100vh' }}>
        <Sidebar darkMode={darkMode} onToggleDarkMode={handleToggleDarkMode} />
        <Box
          component="main"
          sx={{
            flexGrow: 1,
            p: tokens.spacing.page,
            marginLeft: 0,
            transition: 'margin-left 0.3s ease',
            backgroundColor: 'background.default',
            minHeight: '100vh',
          }}
        >
          <Outlet />
        </Box>
      </Box>
    </ThemeProvider>
  );
}
