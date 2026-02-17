import React, { useState } from 'react';
import { Box, Paper, Typography, Grid, Stack, Chip } from '@mui/material';
import { POLICY_STATUS } from '../../../app/constants';

import { Button, Alert, CircularProgress } from '@mui/material';
import { policyService } from '../../../services/policyService';

export default function PolicyStepReview({ values, calculatedValues = {}, policyId, onApproved }) {
  const [isApproving, setIsApproving] = useState(false);
  const [approveMsg, setApproveMsg] = useState(null);
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
    return new Date(date).toLocaleDateString('en-IN');
  };

  // Approve handler
  const handleApprove = async () => {
    setIsApproving(true);
    setApproveMsg(null);
    try {
      const response = await policyService.approve(policyId);
      setApproveMsg({ type: 'success', text: 'Policy approved and exposure/retention calculated.' });
      onApproved?.(response);
    } catch (e) {
      setApproveMsg({ type: 'error', text: e?.response?.data?.message || 'Approval failed' });
    } finally {
      setIsApproving(false);
    }
  };

  return (
    <Stack spacing={3}>
            {/* Approve Button and Feedback */}
            {policyId && (
              <Box>
                <Button
                  variant="contained"
                  color="success"
                  onClick={handleApprove}
                  disabled={isApproving}
                  sx={{ mb: 2 }}
                >
                  {isApproving ? <CircularProgress size={18} sx={{ mr: 1 }} /> : null}
                  Approve Policy
                </Button>
                {approveMsg && (
                  <Alert severity={approveMsg.type} sx={{ mt: 1 }}>{approveMsg.text}</Alert>
                )}
              </Box>
            )}
      {/* Header */}
      <Box>
        <Typography variant="h6" gutterBottom>Policy Summary</Typography>
        <Typography variant="body2" color="textSecondary">
          Review and confirm your policy details before submission
        </Typography>
      </Box>

      {/* General Information */}
      <Paper sx={{ p: 2 }}>
        <Typography variant="subtitle2" gutterBottom sx={{ fontWeight: 600 }}>General Information</Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
            <Box>
              <Typography variant="caption" color="textSecondary">Insured Name</Typography>
              <Typography variant="body1">{values.insuredName || '—'}</Typography>
            </Box>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Box>
              <Typography variant="caption" color="textSecondary">Insured Type</Typography>
              <Typography variant="body1">{values.insuredType || '—'}</Typography>
            </Box>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Box>
              <Typography variant="caption" color="textSecondary">Line of Business</Typography>
              <Chip label={values.lineOfBusiness} size="small" color="primary" />
            </Box>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Box>
              <Typography variant="caption" color="textSecondary">Status</Typography>
              <Chip label="DRAFT" size="small" variant="outlined" />
            </Box>
          </Grid>
        </Grid>
      </Paper>

      {/* Coverage Details */}
      <Paper sx={{ p: 2 }}>
        <Typography variant="subtitle2" gutterBottom sx={{ fontWeight: 600 }}>Coverage Details</Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
            <Box>
              <Typography variant="caption" color="textSecondary">Sum Insured</Typography>
              <Typography variant="body1">{formatCurrency(values.sumInsured)}</Typography>
            </Box>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Box>
              <Typography variant="caption" color="textSecondary">Premium</Typography>
              <Typography variant="body1">{formatCurrency(values.premium)}</Typography>
            </Box>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Box>
              <Typography variant="caption" color="textSecondary">Retention Limit</Typography>
              <Typography variant="body1">{formatCurrency(values.retentionLimit)}</Typography>
            </Box>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Box>
              <Typography variant="caption" color="textSecondary">Loss Ratio</Typography>
              <Typography variant="body1">
                {values.premium > 0 ? `${(((values.sumInsured - values.retentionLimit) / values.sumInsured) * 100).toFixed(1)}%` : '—'}
              </Typography>
            </Box>
          </Grid>
        </Grid>
      </Paper>

      {/* Effective Dates */}
      <Paper sx={{ p: 2 }}>
        <Typography variant="subtitle2" gutterBottom sx={{ fontWeight: 600 }}>Effective Dates</Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
            <Box>
              <Typography variant="caption" color="textSecondary">Effective From</Typography>
              <Typography variant="body1">{formatDate(values.effectiveFrom)}</Typography>
            </Box>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Box>
              <Typography variant="caption" color="textSecondary">Effective To</Typography>
              <Typography variant="body1">{formatDate(values.effectiveTo)}</Typography>
            </Box>
          </Grid>
        </Grid>
      </Paper>

      {/* Calculated Values Preview (Exposure/Retention) */}
      {Object.keys(calculatedValues).length > 0 && (
        <Paper sx={{ p: 2, backgroundColor: '#f5f5f5' }}>
          <Typography variant="subtitle2" gutterBottom sx={{ fontWeight: 600 }}>System Calculations</Typography>
          <Grid container spacing={2}>
            {calculatedValues.retainedAmount !== undefined && (
              <Grid item xs={12} sm={6}>
                <Box>
                  <Typography variant="caption" color="textSecondary">Retained Amount</Typography>
                  <Typography variant="body1">{formatCurrency(calculatedValues.retainedAmount)}</Typography>
                </Box>
              </Grid>
            )}
            {calculatedValues.cededAmount !== undefined && (
              <Grid item xs={12} sm={6}>
                <Box>
                  <Typography variant="caption" color="textSecondary">Ceded Amount</Typography>
                  <Typography variant="body1">{formatCurrency(calculatedValues.cededAmount)}</Typography>
                </Box>
              </Grid>
            )}
            {calculatedValues.retainedPercentage !== undefined && (
              <Grid item xs={12} sm={6}>
                <Box>
                  <Typography variant="caption" color="textSecondary">Retained %</Typography>
                  <Typography variant="body1">{calculatedValues.retainedPercentage}%</Typography>
                </Box>
              </Grid>
            )}
            {calculatedValues.cededPercentage !== undefined && (
              <Grid item xs={12} sm={6}>
                <Box>
                  <Typography variant="caption" color="textSecondary">Ceded %</Typography>
                  <Typography variant="body1">{calculatedValues.cededPercentage}%</Typography>
                </Box>
              </Grid>
            )}
          </Grid>
          {Array.isArray(calculatedValues.allocations) && calculatedValues.allocations.length > 0 && (
            <Box sx={{ mt: 2 }}>
              <Typography variant="subtitle2">Allocations</Typography>
              <ul style={{ margin: 0, paddingLeft: 20 }}>
                {calculatedValues.allocations.map((a, idx) => (
                  <li key={idx}>
                    {a.reinsurer} ({a.treaty}): {formatCurrency(a.allocatedAmount)} ({a.allocatedPercentage}%)
                  </li>
                ))}
              </ul>
            </Box>
          )}
        </Paper>
      )}
      {/* Audit Log Feedback (optional) */}
      {/* You can add a section here to show audit log entries if passed as a prop */}
    </Stack>
  );
}