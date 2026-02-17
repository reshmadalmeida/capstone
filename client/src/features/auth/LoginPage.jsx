import { Box, Paper, TextField, Button, Typography, Alert } from '@mui/material';
import { useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { useLocation, useNavigate } from 'react-router-dom';

export default function LoginPage() {
  const { login } = useAuth();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const submit = async (e) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      if (!form.email || !form.password) {
        setError('Please enter both email and password');
        return;
      }

      await login(form);

      // Redirect to intended location or dashboard
      const from = location.state?.from?.pathname || '/dashboard';
      navigate(from, { replace: true });
    } catch (err) {
      console.error('Login error:', err);
      setError(err?.response?.data?.message || 'Invalid credentials. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Box sx={{ display: 'grid', placeItems: 'center', height: '100dvh' }}>
      <Paper sx={{ p: 4, width: 360 }} component="form" onSubmit={submit}>
        <Typography variant="h5" gutterBottom sx={{ mb: 3, fontWeight: 600 }}>
          Capstone-Insurance Portal
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <TextField
          label="Email"
          type="email"
          value={form.email}
          onChange={(e) => setForm(f => ({ ...f, email: e.target.value }))}
          margin="normal"
          fullWidth
          disabled={isLoading}
          autoComplete="email"
        />

        <TextField
          label="Password"
          type="password"
          value={form.password}
          onChange={(e) => setForm(f => ({ ...f, password: e.target.value }))}
          margin="normal"
          fullWidth
          disabled={isLoading}
          autoComplete="current-password"
        />

        <Button
          type="submit"
          variant="contained"
          fullWidth
          disabled={isLoading || !form.email || !form.password}
          sx={{ mt: 3 }}
        >
          {isLoading ? 'Signing in...' : 'Sign In'}
        </Button>

        <Typography variant="caption" sx={{ mt: 2, display: 'block', textAlign: 'center', color: 'text.secondary' }}>
          Please use valid credentials for your role
        claimadjuster_1@capstone.com | 12345
        admin@capstone.com | 12345
        rm@capstone.com | 12345
        underwriter1212@capstone.com | Ul12345
        </Typography>
      </Paper>
    </Box>
  );
}
