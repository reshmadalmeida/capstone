import React, { useEffect, useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  Grid,
  Stack,
  CircularProgress,
  Alert,
  Divider,
  Card,
  CardContent,
  Chip,
} from '@mui/material';
import { useParams, useNavigate } from 'react-router-dom';
import { policyService } from '../../services/policyService';
import { usePermissions } from '../../hooks/usePermissions';
import PolicyApprovalPanel from './PolicyApprovalPanel';
import { Button } from '@mui/material';
import { POLICY_STATUS } from '../../app/constants';

export default function PolicyDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, can } = usePermissions();
  const [policy, setPolicy] = useState(null);
  const [auditLog, setAuditLog] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPolicy = async () => {
      try {
        setIsLoading(true);
        const [policyData, auditData] = await Promise.all([
          policyService.getById(id),
          policyService.getAuditLog(id),
        ]);
        setPolicy({ ...policyData, auditLog: auditData });
        setAuditLog(auditData || []);
      } catch (err) {
        console.error('Error fetching policy:', err);
        setError(err?.response?.data?.message || 'Failed to load policy');
      } finally {
        setIsLoading(false);
      }
    };

    if (id) {
      fetchPolicy();
    }
  }, [id]);

  const handleStatusChange = (updatedPolicy) => {
    setPolicy(updatedPolicy);
    // Refresh audit log
    policyService.getAuditLog(id).then(data => {
      setAuditLog(data || []);
    });
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value || 0);
  };

  const formatDate = (date) => {
    if (!date) return '—';
    return new Date(date).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case POLICY_STATUS.DRAFT:
        return 'default';
      case POLICY_STATUS.SUBMITTED:
        return 'warning';
      case POLICY_STATUS.UNDERWRITING_REVIEW:
        return 'info';
      case POLICY_STATUS.APPROVED:
        return 'primary';
      case POLICY_STATUS.ACTIVE:
        return 'success';
      case POLICY_STATUS.REJECTED:
        return 'error';
      default:
        return 'default';
    }
  };

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return <Alert severity="error">{error}</Alert>;
  }

  if (!policy) {
    return <Alert severity="warning">Policy not found</Alert>;
  }

  const isAdmin = can('admin');
  const isUnderwriter = can('underwriter');

  // Approve handler for underwriter
  const [approveLoading, setApproveLoading] = useState(false);
  const [approveMsg, setApproveMsg] = useState(null);
  const [exposure, setExposure] = useState(null);

  const handleUnderwriterApprove = async () => {
    setApproveLoading(true);
    setApproveMsg(null);
    try {
      const response = await policyService.approve(policy.id);
      setPolicy({ ...policy, ...response });
      setExposure(response.allocation || null);
      setApproveMsg({ type: 'success', text: 'Policy approved and risk calculated.' });
      // Refresh audit log
      policyService.getAuditLog(id).then(data => setAuditLog(data || []));
    } catch (e) {
      setApproveMsg({ type: 'error', text: e?.response?.data?.message || 'Approval failed' });
    } finally {
      setApproveLoading(false);
    }
  };

  return (
    <Stack spacing={3}>
      {/* Header */}
      <Paper sx={{ p: 3, background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white' }}>
        <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
          <Box>
            <Typography variant="h5" gutterBottom>
              Policy: {policy.policyNumber || policy.id}
            </Typography>
            <Typography variant="body2" sx={{ opacity: 0.9 }}>
              {policy.insuredName} • {policy.lineOfBusiness}
            </Typography>
          </Box>
          <Chip
            label={policy.status}
            color={getStatusColor(policy.status)}
            sx={{ color: 'white' }}
          />
        </Stack>
      </Paper>

      {/* Policy Summary */}
      <Grid container spacing={2}>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="subtitle2" gutterBottom sx={{ fontWeight: 600, color: 'primary.main' }}>
                POLICYHOLDER INFORMATION
              </Typography>
              <Stack spacing={1.5}>
                <Box>
                  <Typography variant="caption" color="textSecondary">Insured Name</Typography>
                  <Typography variant="body2">{policy.insuredName}</Typography>
                </Box>
                <Box>
                  <Typography variant="caption" color="textSecondary">Insured Type</Typography>
                  <Typography variant="body2">{policy.insuredType}</Typography>
                </Box>
                <Box>
                  <Typography variant="caption" color="textSecondary">Line of Business</Typography>
                  <Chip label={policy.lineOfBusiness} size="small" color="primary" variant="outlined" />
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="subtitle2" gutterBottom sx={{ fontWeight: 600, color: 'primary.main' }}>
                COVERAGE DETAILS
              </Typography>
              <Stack spacing={1.5}>
                <Box>
                  <Typography variant="caption" color="textSecondary">Sum Insured</Typography>
                  <Typography variant="body2">{formatCurrency(policy.sumInsured)}</Typography>
                </Box>
                <Box>
                  <Typography variant="caption" color="textSecondary">Premium</Typography>
                  <Typography variant="body2">{formatCurrency(policy.premium)}</Typography>
                </Box>
                <Box>
                  <Typography variant="caption" color="textSecondary">Retention Limit</Typography>
                  <Typography variant="body2">{formatCurrency(policy.retentionLimit)}</Typography>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="subtitle2" gutterBottom sx={{ fontWeight: 600, color: 'primary.main' }}>
                EFFECTIVE DATES
              </Typography>
              <Stack spacing={1.5}>
                <Box>
                  <Typography variant="caption" color="textSecondary">Effective From</Typography>
                  <Typography variant="body2">{formatDate(policy.effectiveFrom)}</Typography>
                </Box>
                <Box>
                  <Typography variant="caption" color="textSecondary">Effective To</Typography>
                  <Typography variant="body2">{formatDate(policy.effectiveTo)}</Typography>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="subtitle2" gutterBottom sx={{ fontWeight: 600, color: 'primary.main' }}>
                SYSTEM CALCULATIONS
              </Typography>
              <Stack spacing={1.5}>
                <Box>
                  <Typography variant="caption" color="textSecondary">Calculated Exposure</Typography>
                  <Typography variant="body2">{formatCurrency(policy.calculatedExposure)}</Typography>
                </Box>
                <Box>
                  <Typography variant="caption" color="textSecondary">Reinsured Amount</Typography>
                  <Typography variant="body2">{formatCurrency(policy.reinsuredAmount)}</Typography>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Approval Panel for Admins */}
      {isAdmin && (
        <PolicyApprovalPanel
          policy={policy}
          onStatusChange={handleStatusChange}
          isAdmin={isAdmin}
        />
      )}

      {/* Approve button for Underwriter if policy is DRAFT */}
      {isUnderwriter && policy.status === 'DRAFT' && (
        <Box>
          <Button
            variant="contained"
            color="success"
            onClick={handleUnderwriterApprove}
            disabled={approveLoading}
            sx={{ mb: 2 }}
          >
            {approveLoading ? <CircularProgress size={18} sx={{ mr: 1 }} /> : null}
            Approve & Calculate Risk
          </Button>
          {approveMsg && (
            <Alert severity={approveMsg.type} sx={{ mt: 1 }}>{approveMsg.text}</Alert>
          )}
        </Box>
      )}

      {/* Show exposure/retention after approval */}
      {exposure && (
        <Paper sx={{ p: 3, backgroundColor: '#f5f5f5' }}>
          <Typography variant="h6" gutterBottom>Exposure & Retention</Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}><Typography>Retained Amount: {formatCurrency(exposure.retainedAmount)}</Typography></Grid>
            <Grid item xs={12} sm={6}><Typography>Ceded Amount: {formatCurrency(exposure.cededAmount)}</Typography></Grid>
            <Grid item xs={12} sm={6}><Typography>Retained %: {exposure.retainedPercentage}%</Typography></Grid>
            <Grid item xs={12} sm={6}><Typography>Ceded %: {exposure.cededPercentage}%</Typography></Grid>
          </Grid>
          {Array.isArray(exposure.allocations) && exposure.allocations.length > 0 && (
            <Box sx={{ mt: 2 }}>
              <Typography variant="subtitle2">Allocations</Typography>
              <ul style={{ margin: 0, paddingLeft: 20 }}>
                {exposure.allocations.map((a, idx) => (
                  <li key={idx}>
                    {a.reinsurer} ({a.treaty}): {formatCurrency(a.allocatedAmount)} ({a.allocatedPercentage}%)
                  </li>
                ))}
              </ul>
            </Box>
          )}
        </Paper>
      )}

      {/* Audit Log */}
      {auditLog.length > 0 && (
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>Audit Log</Typography>
          <Divider sx={{ mb: 2 }} />
          <Stack spacing={2}>
            {auditLog.map((log, idx) => (
              <Box key={idx} sx={{ pb: 2, borderBottom: idx < auditLog.length - 1 ? '1px solid #eee' : 'none' }}>
                <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
                  <Box>
                    <Typography variant="subtitle2">
                      {log.action}
                    </Typography>
                    {log.details && (
                      <Typography variant="body2" color="textSecondary">
                        {log.details}
                      </Typography>
                    )}
                  </Box>
                  <Stack alignItems="flex-end">
                    <Typography variant="caption" color="textSecondary">
                      {new Date(log.timestamp).toLocaleString('en-IN')}
                    </Typography>
                    <Typography variant="caption" sx={{ mt: 0.5 }}>
                      by <strong>{log.performedBy}</strong>
                    </Typography>
                  </Stack>
                </Stack>
              </Box>
            ))}
          </Stack>
        </Paper>
      )}
    </Stack>
  );
}
