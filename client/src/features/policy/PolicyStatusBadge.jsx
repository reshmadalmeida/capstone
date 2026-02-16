import React from 'react';
import { Chip, Tooltip } from '@mui/material';


export default function StatusBadge({ status, canApprove = false, onApprove }) {
  const s = String(status || '').toUpperCase();

  // Map status to MUI Chip color
  const colorMap = {
    DRAFT: 'default',
    APPROVED: 'success',
    REJECTED: 'error',
    PENDING: 'warning',
    SUBMITTED: 'info',
  };

  const chip = (
    <Chip
      size="small"
      variant="outlined"
      label={s || '—'}
      color={colorMap[s] || 'default'}
      clickable={Boolean(canApprove && s === 'DRAFT')}
      onClick={canApprove && s === 'DRAFT' ? onApprove : undefined}
      sx={{ fontWeight: 500 }}
    />
  );

  if (canApprove && s === 'DRAFT') {
    return <Tooltip title="Click to approve">{chip}</Tooltip>;
  }
  return chip;
}