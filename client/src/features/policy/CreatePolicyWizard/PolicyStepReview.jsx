import React from 'react';
import { Box, Paper, Typography, Grid, Stack, Chip } from '@mui/material';
import { POLICY_STATUS } from '../../../app/constants';

export default function PolicyStepReview({ values, calculatedValues = {} }) {
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

  return (
    <Stack spacing={3}>
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

      {/* Calculated Values Preview */}
      {Object.keys(calculatedValues).length > 0 && (
        <Paper sx={{ p: 2, backgroundColor: '#f5f5f5' }}>
          <Typography variant="subtitle2" gutterBottom sx={{ fontWeight: 600 }}>System Calculations</Typography>
          <Grid container spacing={2}>
            {calculatedValues.exposure && (
              <Grid item xs={12} sm={6}>
                <Box>
                  <Typography variant="caption" color="textSecondary">Calculated Exposure</Typography>
                  <Typography variant="body1">{formatCurrency(calculatedValues.exposure)}</Typography>
                </Box>
              </Grid>
            )}
            {calculatedValues.reinsuredAmount && (
              <Grid item xs={12} sm={6}>
                <Box>
                  <Typography variant="caption" color="textSecondary">Reinsured Amount</Typography>
                  <Typography variant="body1">{formatCurrency(calculatedValues.reinsuredAmount)}</Typography>
                </Box>
              </Grid>
            )}
          </Grid>
        </Paper>
      )}
    </Stack>
  );
}