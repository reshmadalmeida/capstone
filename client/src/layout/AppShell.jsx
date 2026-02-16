import { Outlet } from 'react-router-dom';
import { Box, CssBaseline, AppBar, Toolbar } from '@mui/material';
import TopBar from './TopBar';
import Sidebar from './Sidebar';
import { MAIN_WIDTH } from '../app/constants';

export default function AppShell() {
  return (
    <Box sx={{ display: 'flex' }}>
      <CssBaseline />
      
      <AppBar position="fixed" sx={{ zIndex: (t) => t.zIndex.drawer + 1 }}>
        <TopBar />
      </AppBar>

      <Sidebar />

      <Box component="main" sx={{ flexGrow: 1, p: 3, ml: `${MAIN_WIDTH}px` }}>
        <Toolbar />
        <Outlet />
      </Box>
    </Box>
  );
}