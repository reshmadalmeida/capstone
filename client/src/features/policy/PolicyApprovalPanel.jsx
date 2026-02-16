import React, { useState } from 'react';
import {
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Stack,
  Box,
  Typography,
  Alert,
  CircularProgress,
  Chip,
  Paper,
} from '@mui/material';
import { policyService } from '../../services/policyService';
import { POLICY_STATUS } from '../../app/constants';

export default function PolicyApprovalPanel({ policy, onStatusChange, isAdmin = false }) {
  const [notes, setNotes] = useState('');
  const [openApprove, setOpenApprove] = useState(false);
  const [openReject, setOpenReject] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState(null);

  const canApprove = isAdmin && [POLICY_STATUS.SUBMITTED, POLICY_STATUS.UNDERWRITING_REVIEW].includes(policy?.status);
  const canReject = isAdmin && [POLICY_STATUS.SUBMITTED, POLICY_STATUS.UNDERWRITING_REVIEW].includes(policy?.status);
  const canActivate = isAdmin && policy?.status === POLICY_STATUS.APPROVED;

  const handleApprove = async () => {
    try {
      setIsLoading(true);
      const response = await policyService.approve(policy.id, notes || 'Approved by admin');
      onStatusChange?.(response);
      setOpenApprove(false);
      setNotes('');
      setMessage({ type: 'success', text: 'Policy approved successfully' });
    } catch (error) {
      setMessage({ type: 'error', text: error?.response?.data?.message || 'Failed to approve policy' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleReject = async () => {
    try {
      setIsLoading(true);
      const response = await policyService.reject(policy.id, notes || 'Rejected by admin');
      onStatusChange?.(response);
      setOpenReject(false);
      setNotes('');
      setMessage({ type: 'success', text: 'Policy rejected' });
    } catch (error) {
      setMessage({ type: 'error', text: error?.response?.data?.message || 'Failed to reject policy' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleActivate = async () => {
    try {
      setIsLoading(true);
      const response = await policyService.approve(policy.id, 'Policy activated');
      onStatusChange?.(response);
      setMessage({ type: 'success', text: 'Policy activated and is now ACTIVE' });
    } catch (error) {
      setMessage({ type: 'error', text: error?.response?.data?.message || 'Failed to activate policy' });
    } finally {
      setIsLoading(false);
    }
  };

  if (!policy) return null;

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

  return (
    <Paper sx={{ p: 3 }}>
      {message && (
        <Alert
          severity={message.type}
          onClose={() => setMessage(null)}
          sx={{ mb: 2 }}
        >
          {message.text}
        </Alert>
      )}

      <Box sx={{ mb: 2 }}>
        <Typography variant="h6" gutterBottom>Policy Status & Actions</Typography>
        <Chip
          label={`Status: ${policy.status}`}
          color={getStatusColor(policy.status)}
          variant="outlined"
          size="medium"
        />
      </Box>

      {/* Audit Trail */}
      {policy.auditLog && (
        <Box sx={{ mb: 3, p: 2, backgroundColor: '#f5f5f5', borderRadius: 1 }}>
          <Typography variant="subtitle2" gutterBottom>Recent Activity</Typography>
          <Stack spacing={1}>
            {policy.auditLog.slice(0, 3).map((log, idx) => (
              <Typography key={idx} variant="caption" sx={{ color: 'text.secondary' }}>
                {log.action} - {new Date(log.timestamp).toLocaleString()} by {log.performedBy}
              </Typography>
            ))}
          </Stack>
        </Box>
      )}

      {/* Action Buttons */}
      <Stack direction="row" spacing={2}>
        {canApprove && (
          <Button
            variant="contained"
            color="success"
            onClick={() => setOpenApprove(true)}
            disabled={isLoading}
          >
            ✓ Approve Policy
          </Button>
        )}

        {canReject && (
          <Button
            variant="contained"
            color="error"
            onClick={() => setOpenReject(true)}
            disabled={isLoading}
          >
            ✗ Reject Policy
          </Button>
        )}

        {canActivate && (
          <Button
            variant="contained"
            color="primary"
            onClick={handleActivate}
            disabled={isLoading}
          >
            {isLoading && <CircularProgress size={20} sx={{ mr: 1 }} />}
            → Activate Policy
          </Button>
        )}

        {!canApprove && !canReject && !canActivate && (
          <Typography variant="body2" color="textSecondary">
            No actions available for this policy status
          </Typography>
        )}
      </Stack>

      {/* Approve Dialog */}
      <Dialog open={openApprove} onClose={() => setOpenApprove(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Approve Policy</DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          <Typography variant="body2" sx={{ mb: 2 }}>
            Policy ID: <strong>{policy.id}</strong>
          </Typography>
          <Typography variant="body2" sx={{ mb: 2 }}>
            Are you sure you want to approve this policy? It will transition to APPROVED status and can then be activated.
          </Typography>
          <TextField
            fullWidth
            label="Approval Notes"
            multiline
            rows={3}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Enter approval notes (optional)"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenApprove(false)}>Cancel</Button>
          <Button
            onClick={handleApprove}
            variant="contained"
            color="success"
            disabled={isLoading}
          >
            {isLoading && <CircularProgress size={20} sx={{ mr: 1 }} />}
            Approve
          </Button>
        </DialogActions>
      </Dialog>

      {/* Reject Dialog */}
      <Dialog open={openReject} onClose={() => setOpenReject(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Reject Policy</DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          <Typography variant="body2" sx={{ mb: 2 }}>
            Policy ID: <strong>{policy.id}</strong>
          </Typography>
          <Typography variant="body2" sx={{ mb: 2, color: 'error.main' }}>
            Are you sure you want to reject this policy? Please provide a detailed reason.
          </Typography>
          <TextField
            fullWidth
            label="Rejection Reason"
            multiline
            rows={3}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Enter rejection reason"
            required
            error={!notes && openReject}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenReject(false)}>Cancel</Button>
          <Button
            onClick={handleReject}
            variant="contained"
            color="error"
            disabled={isLoading || !notes}
          >
            {isLoading && <CircularProgress size={20} sx={{ mr: 1 }} />}
            Reject
          </Button>
        </DialogActions>
      </Dialog>
    </Paper>
  );
}
