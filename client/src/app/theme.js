import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    mode: 'light',
    primary: { main: '#1e88e5' },
    secondary: { main: '#6d4c41' },
    success: { main: '#2e7d32' },
    warning: { main: '#ed6c02' },
    error: { main: '#d32f2f' }
  },
  shape: { borderRadius: 8 },
  components: {
    MuiButton: { defaultProps: { variant: 'contained', size: 'medium' } },
    MuiTextField: { defaultProps: { size: 'small', fullWidth: true } }
  }
});

export default theme;