import React from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Typography } from '@mui/material';

const SessionTimeoutModal = ({ open, countdown, onContinue, onLogout }) => {
  return (
    <Dialog open={open} onClose={onContinue} aria-labelledby="session-timeout-dialog-title" aria-describedby="session-timeout-dialog-description">
      <DialogTitle id="session-timeout-dialog-title">Session About to Expire</DialogTitle>
      <DialogContent>
        <Typography id="session-timeout-dialog-description">
          You have been inactive for a while. You will be logged out in {countdown} seconds.
        </Typography>
        <Typography variant="body2" color="textSecondary" style={{ marginTop: 10 }}>
          Do you want to continue your session?
        </Typography>
      </DialogContent>
      <DialogActions>
        <Button onClick={onLogout} color="secondary" variant="outlined">
          Logout Now
        </Button>
        <Button onClick={onContinue} color="primary" variant="contained" autoFocus>
          Continue Session
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default SessionTimeoutModal;
