import { useEffect, useMemo, useState } from 'react';
import {
  Grid,
  Paper,
  Typography,
  Box,
  Stack,
  Button,
  Card,
  CardContent,
  Skeleton,
} from '@mui/material';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';
import { useNavigate } from 'react-router-dom';
import api from '../../services/apiClient';
import { usePermissions } from '../../hooks/usePermissions';
import { ROLE_NAMES } from '../../app/constants';

const COLORS = ['#1e88e5', '#43a047', '#fb8c00', '#8e24aa', '#00acc1', '#ef5350'];

export default function Dashboard() {
  const { user } = usePermissions();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [exposureByLOB, setExposure] = useState([]);
  const [split, setSplit] = useState([]);
  const [claimsRatio, setClaimsRatio] = useState(null);

  // keep your lowercased role; guard undefined
  const userRole = (user?.role || '').toLowerCase();

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const [lob, rs, cr] = await Promise.all([
          api.get('/metrics/exposure').then(r => r.data),
          api.get('/metrics/reinsurer-split').then(r => r.data),
          api.get('/metrics/claims-ratio').then(r => r.data),
        ]);
        if (!mounted) return;

        // Normalize shapes defensively
        setExposure(Array.isArray(lob) ? lob : []);
        setSplit(
          Array.isArray(rs)
            ? rs.map(d => ({
              name: String(d?.name ?? 'Unknown'),
              value: Number(d?.value ?? 0),
            }))
            : []
        );
        setClaimsRatio(typeof cr?.value === 'number' ? cr.value : null);
      } catch {
        // fallback mock if backend not ready
        if (!mounted) return;
        setExposure([
          { lob: 'HEALTH', exposure: 120 },
          { lob: 'MOTOR', exposure: 80 },
          { lob: 'LIFE', exposure: 50 },
          { lob: 'PROPERTY', exposure: 60 },
        ]);
        setSplit([
          { name: 'Retained', value: 55 },
          { name: 'Reinsurer A', value: 25 },
          { name: 'Reinsurer B', value: 20 },
        ]);
        setClaimsRatio(0.42);
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  // Role-specific welcome message
  const getRoleWelcome = () => {
    const welcomeMessages = {
      underwriter: 'Welcome, Underwriter! Manage policies and review submissions.',
      admin: 'Welcome, Administrator! System overview and management.',
      claims_adjuster: 'Welcome, Claims Adjuster! Review and settle claims.',
      reinsurance_manager: 'Welcome, Reinsurance Manager! Manage treaties and allocations.',
    };
    return welcomeMessages[userRole] || 'Welcome!';
  };

  // Quick action buttons based on role
  const quickActions = useMemo(() => {
    const actions = {
      underwriter: [
        { label: 'Create Policy', action: () => navigate('/policies/new'), variant: 'contained' },
        { label: 'View Policies', action: () => navigate('/policies'), variant: 'outlined' },
      ],
      admin: [
        { label: 'Manage Users', action: () => navigate('/admin/users'), variant: 'contained' },
        // { label: 'System Config', action: () => navigate('/admin'), variant: 'outlined' },
      ],
      claims_adjuster: [{ label: 'View Claims', action: () => navigate('/claims'), variant: 'contained' }],
      reinsurance_manager: [
        { label: 'View Treaties', action: () => navigate('/reinsurance/treaties'), variant: 'contained' },
        { label: 'Reinsurance', action: () => navigate('/reinsurance'), variant: 'outlined' },
      ],
    };
    return actions[userRole] || [];
  }, [userRole, navigate]);

  // Formatters for charts
  const percentFormatter = (v) => (typeof v === 'number' ? `${(v * 100).toFixed(1)}%` : '—');
  const numberFormatter = (v) => (v == null ? '—' : Intl.NumberFormat().format(v));

  // Derived: safe exposure data keys
  const exposureData = useMemo(
    () =>
      (exposureByLOB || []).map(d => ({
        lob: String(d?.lob ?? d?.name ?? 'N/A'),
        exposure: Number(d?.exposure ?? d?.value ?? 0),
      })),
    [exposureByLOB]
  );

  // Helper: NoData content
  const NoData = ({ text = 'No data available' }) => (
    <Box sx={{ py: 4, textAlign: 'center', color: 'text.secondary' }}>
      <Typography variant="body2">{text}</Typography>
    </Box>
  );

  // Role label (using provided ROLE_NAMES but guarding lowercased key)
  const roleLabel = ROLE_NAMES?.[userRole] || 'User';

  return (
    <Stack spacing={2}>
      {/* Welcome Header */}
      <Paper
        sx={{
          p: 3,
          background: theme =>
            `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
          color: 'white',
          borderRadius: 2,
          // width:"75%"
        }}
      >
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
          <Box>
            <Typography variant="h5" gutterBottom>
              {getRoleWelcome()}
            </Typography>
            <Typography variant="body2" sx={{ opacity: 0.9 }}>
              {roleLabel}
            </Typography>
          </Box>
        </Box>
      </Paper>

      {/* Quick Actions */}
      {quickActions.length > 0 && (
        <Stack direction="row" spacing={2} flexWrap="wrap" useFlexGap>
          {quickActions.map((action, idx) => (
            <Button key={idx} variant={action.variant} onClick={action.action} size="large">
              {action.label}
            </Button>
          ))}
        </Stack>
      )}

      {/* Loading skeletons */}
      {loading && (
        <Grid container spacing={2}>
          {[360, 360, 120].map((h, i) => (
            <Grid key={i} item xs={12} md={i < 2 ? 6 : 12}>
              <Paper sx={{ p: 2 }}>
                <Skeleton variant="text" width={200} height={28} />
                <Skeleton variant="rectangular" height={h} />
              </Paper>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Main Dashboard - admin & underwriter */}
      {!loading && ['admin', 'underwriter'].includes(userRole) && (
        <Grid container spacing={2}>
          <Grid item xs={12} md={8}>
            <Paper sx={{ p: 2, height: 420, display: 'flex', flexDirection: 'column' }}>
              <Typography variant="subtitle1" gutterBottom>
                Total Exposure by LOB
              </Typography>
              <Box sx={{ flex: 1, minHeight: 0 }}>
                {exposureData.length ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={exposureData} barSize={32}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="lob" tickFormatter={(v) => String(v)} />
                      <YAxis tickFormatter={numberFormatter} />
                      <Tooltip
                        formatter={(val) => numberFormatter(val)}
                        labelFormatter={(label) => `LOB: ${label}`}
                      />
                      <Bar dataKey="exposure" fill="#1e88e5" name="Exposure" />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <NoData />
                )}
              </Box>
            </Paper>
          </Grid>

          <Grid item xs={12} md={4}>
            <Paper sx={{ p: 2, height: 420, display: 'flex', flexDirection: 'column' }}>
              <Typography variant="subtitle1" gutterBottom>
                Reinsurer Split
              </Typography>
              <Box sx={{ flex: 1, minHeight: 0 }}>
                {split.length ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={split}
                        dataKey="value"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        outerRadius="75%"
                        labelLine
                        label={(entry) => `${entry.name}: ${entry.value}%`}
                        isAnimationActive={false}
                      >
                        {split.map((entry, i) => (
                          <Cell key={`cell-${i}`} fill={COLORS[i % COLORS.length]} />
                        ))}
                      </Pie>
                      <Legend />
                      <Tooltip formatter={(val, name) => [`${val}%`, name]} />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <NoData />
                )}
              </Box>
            </Paper>
          </Grid>

          {/* <Grid item xs={12}>
            <Paper
              sx={{
                p: 2,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                borderRadius: 2,
              }}
            >
              <Typography variant="subtitle1">Claims Ratio</Typography>
              <Typography variant="h4">{claimsRatio != null ? percentFormatter(claimsRatio) : '—'}</Typography>
            </Paper>
          </Grid> */}
        </Grid>
      )}

      {/* Role-specific: Claims Adjuster */}
      {!loading && userRole === 'claims_adjuster' && (
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Typography variant="h6" color="text.secondary">
                  Pending Claims
                </Typography>
                <Typography variant="h4">12</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Typography variant="h6" color="text.secondary">
                  Approved
                </Typography>
                <Typography variant="h4">8</Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {/* Role-specific: Reinsurance Manager */}
      {!loading && userRole === 'reinsurance_manager' && (
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Typography variant="h6" color="text.secondary">
                  Active Treaties
                </Typography>
                <Typography variant="h4">5</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Typography variant="h6" color="text.secondary">
                  Allocations
                </Typography>
                <Typography variant="h4">23</Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}
    </Stack>
  );
}