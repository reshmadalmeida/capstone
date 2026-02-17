import { useEffect, useMemo, useState } from "react";
import api from "../../services/apiClient";
import ClaimsForm from "./ClaimsForm";

import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  CardHeader,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
  Chip,
} from "@mui/material";

import EditIcon from "@mui/icons-material/Edit";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CancelIcon from "@mui/icons-material/Cancel";
import PaidIcon from "@mui/icons-material/Paid";
import VisibilityIcon from "@mui/icons-material/Visibility";
import AddIcon from "@mui/icons-material/Add";

function formatDate(d) {
  if (!d) return "-";
  const dt = new Date(d);
  if (Number.isNaN(dt.getTime())) return "-";
  return dt.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function money(v) {
  const n = Number(v || 0);
  return `₹${Number.isFinite(n) ? n.toLocaleString("en-IN") : 0}`;
}

function statusColor(status) {
  switch (status) {
    case "IN_REVIEW":
      return "warning";
    case "APPROVED":
      return "success";
    case "REJECTED":
      return "error";
    case "SETTLED":
      return "info";
    default:
      return "default";
  }
}

export default function ClaimsList() {
  const [claims, setClaims] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [showForm, setShowForm] = useState(false);
  const [mode, setMode] = useState("create"); // create | edit | approve
  const [selectedItem, setSelectedItem] = useState(null);

  const [alertMessage, setAlertMessage] = useState("");

  const [showRejectConfirm, setShowRejectConfirm] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [historyText, setHistoryText] = useState("");

  // If you don’t have permissions logic available, keep it simple:
  const isCreateAllowed = true;
  const isEditAllowed = true;
  const isReviewAllowed = true;

  const fetchClaims = async () => {
    try {
      setLoading(true);
      setError("");
      const res = await api.get("/claims");
      setClaims(res.data || []);
    } catch (e) {
      setError(e?.response?.data?.message || "Failed to fetch claims.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClaims();
  }, []);

  const onCreate = () => {
    setMode("create");
    setSelectedItem(null);
    setShowForm(true);
  };

  const onEdit = (claim) => {
    if (!claim?._id) return;
    setMode("edit");
    setSelectedItem(claim);
    setShowForm(true);
  };

  const onApprove = (claim) => {
    if (!claim?._id) return;
    setMode("approve");
    setSelectedItem(claim);
    setShowForm(true);
  };

  // FR-5 lifecycle enforcement: only IN_REVIEW can be rejected
  const onReject = async () => {
    if (!selectedItem?._id) return;

    if (selectedItem.status !== "IN_REVIEW") {
      setAlertMessage("Only IN_REVIEW claims can be rejected.");
      setShowRejectConfirm(false);
      return;
    }

    try {
      setAlertMessage("");
      await api.put(`/claims/${selectedItem._id}`, { status: "REJECTED" });
      setShowRejectConfirm(false);
      setSelectedItem(null);
      fetchClaims();
    } catch (e) {
      setAlertMessage(e?.response?.data?.message || "Failed to reject claim.");
      setShowRejectConfirm(false);
    }
  };

  // FR-5 lifecycle enforcement: only APPROVED can be settled
  const onSettle = async (claim) => {
    if (!claim?._id) return;

    if (claim.status !== "APPROVED") {
      setAlertMessage("Only APPROVED claims can be settled.");
      return;
    }

    try {
      setAlertMessage("");
      await api.put(`/claims/${claim._id}`, { status: "SETTLED" });
      fetchClaims();
    } catch (e) {
      setAlertMessage(e?.response?.data?.message || "Failed to settle claim.");
    }
  };

  const onFormClose = (reload = false) => {
    setShowForm(false);
    setSelectedItem(null);
    if (reload) fetchClaims();
  };

  const tableRows = useMemo(() => claims || [], [claims]);

  return (
    <Box sx={{ maxWidth: 1100, mx: "auto", p: 3 }}>
      <Card>
        <CardHeader
          title="Claims"
          subheader="Manage claim lifecycle and approvals"
          action={
            isCreateAllowed ? (
              <Button variant="contained" startIcon={<AddIcon />} onClick={onCreate}>
                Create Claim
              </Button>
            ) : null
          }
        />

        <CardContent>
          {!!alertMessage && (
            <Alert severity="info" sx={{ mb: 2 }} onClose={() => setAlertMessage("")}>
              {alertMessage}
            </Alert>
          )}

          {loading && (
            <Stack alignItems="center" sx={{ py: 6 }}>
              <CircularProgress />
              <Typography variant="body2" sx={{ mt: 2 }}>
                Loading claims…
              </Typography>
            </Stack>
          )}

          {!loading && !!error && <Alert severity="error">{error}</Alert>}

          {!loading && !error && tableRows.length === 0 && (
            <Alert severity="warning">No claims found. Create one to get started.</Alert>
          )}

          {!loading && !error && tableRows.length > 0 && (
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Claim #</TableCell>
                  <TableCell>Policy #</TableCell>
                  <TableCell>Claim Amount</TableCell>
                  <TableCell>Approved Amount</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Incident</TableCell>
                  <TableCell>Reported</TableCell>
                  <TableCell>Handled By</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>

              <TableBody>
                {tableRows.map((claim) => (
                  <TableRow key={claim._id} hover>
                    <TableCell sx={{ fontWeight: 600 }}>{claim.claimNumber}</TableCell>
                    <TableCell>{claim.policyNumber || "-"}</TableCell>
                    <TableCell>{money(claim.claimAmount)}</TableCell>
                    <TableCell>{money(claim.approvedAmount)}</TableCell>
                    <TableCell>
                      <Chip
                        label={claim.status || "-"}
                        color={statusColor(claim.status)}
                        size="small"
                        variant="outlined"
                      />
                    </TableCell>
                    <TableCell>{formatDate(claim.incidentDate)}</TableCell>
                    <TableCell>{formatDate(claim.reportedDate)}</TableCell>
                    <TableCell>{claim.handledBy?.username || "-"}</TableCell>

                    <TableCell align="right">
                      <Stack direction="row" spacing={1} justifyContent="flex-end">
                        {isEditAllowed && claim.status === "IN_REVIEW" && (
                          <IconButton
                            size="small"
                            onClick={() => onEdit(claim)}
                            title="Edit"
                          >
                            <EditIcon fontSize="small" />
                          </IconButton>
                        )}

                        {isReviewAllowed && claim.status === "IN_REVIEW" && (
                          <>
                            <IconButton
                              size="small"
                              onClick={() => onApprove(claim)}
                              title="Approve"
                            >
                              <CheckCircleIcon fontSize="small" />
                            </IconButton>

                            <IconButton
                              size="small"
                              onClick={() => {
                                setSelectedItem(claim);
                                setShowRejectConfirm(true);
                              }}
                              title="Reject"
                            >
                              <CancelIcon fontSize="small" />
                            </IconButton>
                          </>
                        )}

                        {isReviewAllowed && claim.status === "APPROVED" && (
                          <IconButton
                            size="small"
                            onClick={() => onSettle(claim)}
                            title="Settle"
                          >
                            <PaidIcon fontSize="small" />
                          </IconButton>
                        )}

                        <IconButton
                          size="small"
                          onClick={() => {
                            setHistoryText(claim.remarks || "No history available.");
                            setShowHistory(true);
                          }}
                          title="View history"
                        >
                          <VisibilityIcon fontSize="small" />
                        </IconButton>
                      </Stack>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Claims Form (uses your existing component) */}
      <ClaimsForm
        mode={mode}
        onClose={onFormClose}
        showModal={showForm}
        claimData={selectedItem}
      />

      {/* Reject confirm dialog */}
      <Dialog open={showRejectConfirm} onClose={() => setShowRejectConfirm(false)}>
        <DialogTitle>Confirm Rejection</DialogTitle>
        <DialogContent dividers>
          <Typography>Are you sure you want to reject this claim?</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowRejectConfirm(false)} color="inherit" variant="outlined">
            Cancel
          </Button>
          <Button onClick={onReject} color="error" variant="contained">
            Reject
          </Button>
        </DialogActions>
      </Dialog>

      {/* History dialog */}
      <Dialog open={showHistory} onClose={() => setShowHistory(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Claim History</DialogTitle>
        <DialogContent dividers>
          <Typography variant="body2" sx={{ whiteSpace: "pre-wrap" }}>
            {historyText}
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowHistory(false)} variant="contained">
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
