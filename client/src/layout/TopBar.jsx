import { Toolbar, Typography, Box, Button } from '@mui/material';
import { useAuth } from '../hooks/useAuth';
import { ROLE_NAMES } from '../app/constants';

export default function TopBar() {
  const { user, logout } = useAuth();
  const userRole = user.role?.toLowerCase() || '';
  return (
    <Toolbar>
      <Typography variant="h6" sx={{ flexGrow: 1 }}>Insurance Portal</Typography>
      {user && (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Typography variant="body2">{user.name}  •{ROLE_NAMES[userRole]}</Typography>
          <Button color="secondary" onClick={logout}>Logout</Button>
        </Box>
      )}
    </Toolbar>
  );
}