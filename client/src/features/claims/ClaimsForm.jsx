import { useEffect, useState } from "react";
import api from "../../services/apiClient";
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Button from '@mui/material/Button';
import Grid from '@mui/material/Grid';
import Alert from '@mui/material/Alert';
import { toYYYYMMDD } from "../../common/utils";
import FormTextField from '../../components/common/FormTextField.jsx';

export default function ClaimsForm({
  mode,
  onClose,
  showModal,
  claimData = null,
}) {
  const isEdit = !!claimData;
  const today = new Date().toISOString().split("T")[0];

  const [alertMessage, setAlertMessage] = useState("");
  const [errors, setErrors] = useState({});

  const emptyForm = {
    policyId: "",
    claimAmount: "",
    approvedAmount: "",
    incidentDate: "",
  };

  const [form, setForm] = useState(emptyForm);

  useEffect(() => {
    if (claimData) {
      setForm({
        policyId: claimData.policyId?.policyNumber || "",
        claimAmount: claimData.claimAmount || "",
        approvedAmount: claimData.approvedAmount || "",
        incidentDate: toYYYYMMDD(claimData.incidentDate),
      });
    } else {
      setForm(emptyForm);
    }
    setErrors({});
  }, [claimData, showModal]);

  if (!showModal) return null;

  const onChangeHandler = (name, value) => {
    setForm({ ...form, [name]: value });
    setErrors({ ...errors, [name]: "" });
  };

  const validate = () => {
    const e = {};

    if (!form.policyId.trim()) e.policyId = "Policy ID is required.";

    if (!form.claimAmount || Number(form.claimAmount) <= 0)
      e.claimAmount = "Claim amount must be greater than 0.";

    if (!form.incidentDate) e.incidentDate = "Incident date is required.";

    if (form.incidentDate && form.incidentDate > today)
      e.incidentDate = "Incident date cannot be in the future.";

    if (mode === "approve") {
      if (!form.approvedAmount || Number(form.approvedAmount) <= 0)
        e.approvedAmount = "Approved amount must be greater than 0.";

      if (Number(form.approvedAmount) > Number(form.claimAmount))
        e.approvedAmount = "Approved amount cannot exceed claim amount.";
    }

    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const onSubmitHandler = async () => {
    setAlertMessage("");
    if (!validate()) return;

    const payload = {
      policyId: form.policyId.trim().toUpperCase(),
      claimAmount: Number(form.claimAmount),
      incidentDate: form.incidentDate,
    };

    if (mode === "approve") {
      payload.approvedAmount = Number(form.approvedAmount);
    }

    try {
      if (isEdit) {
        await api.put(`/claims/${claimData._id}`, {
          ...payload,
          status: mode === "approve" ? "APPROVED" : "IN_REVIEW",
        });
      } else {
        await api.post("/claims", payload);
      }
    } catch (error) {
      setAlertMessage(error.message || "Failed to save claim.");
      return;
    }

    onClose(true);
  };

  return (
    <Dialog open={showModal} onClose={() => onClose(false)} maxWidth="sm" fullWidth>
      <DialogTitle>
        {isEdit
          ? mode === "approve"
            ? "Approve Claim"
            : "Update Claim"
          : "Create Claim"}
      </DialogTitle>
      <DialogContent dividers>
        {!!alertMessage && (
          <Alert severity="error" sx={{ mb: 2 }}>{alertMessage}</Alert>
        )}
        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <FormTextField
              label="Policy ID"
              name="policyId"
              value={form.policyId}
              disabled={mode === "approve"}
              onChange={onChangeHandler}
              required
              error={errors.policyId}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <FormTextField
              type="number"
              label="Claim Amount"
              name="claimAmount"
              value={form.claimAmount}
              disabled={mode === "approve"}
              onChange={onChangeHandler}
              required
              error={errors.claimAmount}
              inputProps={{ min: 0 }}
            />
          </Grid>
          {mode === "approve" && (
            <Grid item xs={12} md={6}>
              <FormTextField
                type="number"
                label="Approved Amount"
                name="approvedAmount"
                value={form.approvedAmount}
                onChange={onChangeHandler}
                required
                error={errors.approvedAmount}
                inputProps={{ min: 0 }}
              />
            </Grid>
          )}
          <Grid item xs={12} md={6}>
            <FormTextField
              type="date"
              label="Incident Date"
              name="incidentDate"
              value={form.incidentDate}
              disabled={mode === "approve"}
              onChange={onChangeHandler}
              required
              error={errors.incidentDate}
              InputLabelProps={{ shrink: true }}
              inputProps={{ max: today }}
            />
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button onClick={() => onClose(false)} color="inherit" variant="outlined">
          Cancel
        </Button>
        <Button onClick={onSubmitHandler} color="success" variant="contained">
          {isEdit
            ? mode === "approve"
              ? "Approve Claim"
              : "Re-submit"
            : "Submit Claim"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
