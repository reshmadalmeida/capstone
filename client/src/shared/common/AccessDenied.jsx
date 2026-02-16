
import React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Stack,
} from "@mui/material";


const AccessDeniedModal = ({
  open,
  onClose,
  onRequestAccess,
  onGoBack,
  onSignOut,
  title = "Access Denied",
  message = "You don’t have permission to view this page.",
  reason,
}) => {
  const hasRequest = typeof onRequestAccess === "function";
  const hasGoBack = typeof onGoBack === "function";
  const hasSignOut = typeof onSignOut === "function";

  return (
    <Dialog
      open={open}
      onClose={onClose}
      aria-labelledby="access-denied-dialog-title"
      aria-describedby="access-denied-dialog-description"
      fullWidth
      maxWidth="sm"
    >
      <DialogTitle id="access-denied-dialog-title" sx={{ display: "flex", alignItems: "center", gap: 1 }}>
        {title}
      </DialogTitle>

      <DialogContent>
        <Stack spacing={1}>
          <Typography id="access-denied-dialog-description">
            {message}
          </Typography>

          {reason && (
            <Typography variant="body2" color="text.secondary">
              Reason: {reason}
            </Typography>
          )}

          <Typography variant="body2" color="text.secondary">
            If you believe this is an error, you can request access or return to a safe page.
          </Typography>
        </Stack>
      </DialogContent>

      <DialogActions sx={{ flexWrap: "wrap", gap: 1 }}>
        {hasSignOut && (
          <Button onClick={onSignOut} color="secondary" variant="outlined">
            Sign Out
          </Button>
        )}
        {hasGoBack && (
          <Button onClick={onGoBack} color="inherit" variant="outlined">
            Go Back
          </Button>
        )}
        {hasRequest && (
          <Button onClick={onRequestAccess} color="primary" variant="contained" autoFocus>
            Request Access
          </Button>
        )}
        {!hasRequest && !hasGoBack && !hasSignOut && (
          <Button onClick={onClose} color="primary" variant="contained" autoFocus>
            Close
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
};

export default AccessDeniedModal;