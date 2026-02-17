import { useEffect, useState } from "react";
import api from "../../services/apiClient";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import Button from "@mui/material/Button";
import Grid from "@mui/material/Grid";
import Alert from "@mui/material/Alert";
import { toYYYYMMDD } from "../../common/utils";
import FormTextField from "../../components/common/FormTextField.jsx";
import { convertToCurrency } from "../../common/utils";

export default function ClaimsForm({ mode, onClose, showModal, claimData = null }) {
  const isEdit = !!claimData;
  const today = new Date().toISOString().split("T")[0];

  const [alertMessage, setAlertMessage] = useState("");
  const [errors, setErrors] = useState({});
  const [policyInfo, setPolicyInfo] = useState(null);
  const [policyLoading, setPolicyLoading] = useState(false);

  const emptyForm = {
    policyNumber: "",
    claimAmount: "",
    approvedAmount: "",
    incidentDate: "",
    remarks: "",
  };

  const [form, setForm] = useState(emptyForm);

  useEffect(() => {
    if (claimData) {
      setForm({
        policyNumber: claimData.policyNumber || "",
        claimAmount: claimData.claimAmount || "",
        approvedAmount: claimData.approvedAmount || "",
        incidentDate: toYYYYMMDD(claimData.incidentDate),
        remarks: claimData.remarks || "",
      });
    } else {
      setForm(emptyForm);
    }
    setErrors({});
    setAlertMessage("");
    setPolicyInfo(null);
  }, [claimData, showModal]);

  if (!showModal) return null;

  const onChangeHandler = (name, value) => {
    setForm((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  // ---- FR-6: fetch policy coverage (sumInsured) by policy number ----
  const fetchPolicy = async (policyNumber) => {
    const pn = (policyNumber || "").trim().toUpperCase();
    if (!pn) return;

    setPolicyLoading(true);
    setPolicyInfo(null);

    try {
      // Try common REST style: /policies/:policyNumber
      let res;
      try {
        res = await api.get(`/policies/${pn}`);
        console.log(res,"res")
      } catch (e) {
        // Fallback: /policies?q=policyNumber
        const r2 = await api.get(`/policies`, { params: { q: pn } });
        res = r2;
      }

      const data = res?.data;
      const policy = Array.isArray(data) ? data[0] : data;

      if (!policy) {
        setPolicyInfo(null);
        setErrors((prev) => ({ ...prev, policyNumber: "Policy not found." }));
        return;
      }

      setPolicyInfo(policy);
      setErrors((prev) => ({ ...prev, policyNumber: "" }));
    } catch {
      setPolicyInfo(null);
      // setErrors((prev) => ({ ...prev, policyNumber: "Unable to fetch policy coverage." }));
    } finally {
      setPolicyLoading(false);
    }
  };

  const validate = () => {
    const e = {};
    const pn = form.policyNumber.trim();

    if (!pn) e.policyNumber = "Policy ID is required.";

    const claimAmt = Number(form.claimAmount || 0);
    if (!form.claimAmount || claimAmt <= 0) {
      e.claimAmount = "Claim amount must be greater than 0.";
    }

    if (!form.incidentDate) e.incidentDate = "Incident date is required.";
    if (form.incidentDate && form.incidentDate > today) {
      e.incidentDate = "Incident date cannot be in the future.";
    }

    // FR-6: validate claim amount vs coverage (sumInsured)
    const sumInsured = Number(policyInfo?.sumInsured || 0);
    if (sumInsured > 0 && claimAmt > sumInsured) {
      e.claimAmount = `Claim amount cannot exceed policy coverage (${convertToCurrency(sumInsured)}).`;
    }

    if (mode === "approve") {
      const approvedAmt = Number(form.approvedAmount || 0);

      if (!form.approvedAmount || approvedAmt <= 0) {
        e.approvedAmount = "Approved amount must be greater than 0.";
      } else {
        if (approvedAmt > claimAmt) {
          e.approvedAmount = "Approved amount cannot exceed claim amount.";
        }
        if (sumInsured > 0 && approvedAmt > sumInsured) {
          e.approvedAmount = `Approved amount cannot exceed policy coverage (${convertToCurrency(sumInsured)}).`;
        }
      }
    }

    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const onSubmitHandler = async () => {
    setAlertMessage("");
    if (!validate()) return;

    const payload = {
      policyNumber: form.policyNumber.trim().toUpperCase(),
      claimAmount: Number(form.claimAmount),
      incidentDate: form.incidentDate,
      remarks: isEdit && form.remarks,
    };

    if (mode === "approve") payload.approvedAmount = Number(form.approvedAmount);

    try {
      if (isEdit) {
        // FR-5 lifecycle: edit -> IN_REVIEW, approve -> APPROVED
        await api.put(`/claims/${claimData._id}`, {
          ...payload,
          status: mode === "approve" ? "APPROVED" : "IN_REVIEW",
        });
      } else {
        await api.post("/claims", payload);
      }
    } catch (error) {
      setAlertMessage(error?.response?.data?.message || error.message || "Failed to save claim.");
      return;
    }

    onClose(true);
  };

  return (
    <Dialog open={showModal} onClose={() => onClose(false)} maxWidth="sm" fullWidth>
      <DialogTitle>
        {isEdit ? (mode === "approve" ? "Approve Claim" : "Update Claim") : "Create Claim"}
      </DialogTitle>

      <DialogContent dividers>
        {!!alertMessage && <Alert severity="error" sx={{ mb: 2 }}>{alertMessage}</Alert>}

        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <FormTextField
              label="Policy Number"
              name="policyNumber"
              value={form.policyNumber}
              disabled={mode === "approve"}
              onChange={onChangeHandler}
              onBlur={() => fetchPolicy(form.policyNumber)}
              required
              error={errors.policyNumber}
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

          {/* Remarks field only on edit */}
          {isEdit && (
            <Grid item xs={12} md={12}>
              <FormTextField
                type="text"
                label="Remarks"
                name="remarks"
                value={form.remarks}
                disabled={mode === "approve"}
                onChange={onChangeHandler}
                required={false}
                error={errors.remarks}
                multiline
                minRows={2}
              />
            </Grid>
          )}
        </Grid>

        {/* Policy coverage hint */}
        {policyLoading && <Alert severity="info" sx={{ mt: 2 }}>Fetching policy coverage…</Alert>}
        {!!policyInfo?.sumInsured && (
          <Alert severity="success" sx={{ mt: 2 }}>
            Policy Coverage (Sum Insured): <strong>{convertToCurrency(policyInfo.sumInsured)}</strong>
          </Alert>
        )}
      </DialogContent>

      <DialogActions>
        <Button onClick={() => onClose(false)} color="inherit" variant="outlined">
          Cancel
        </Button>
        <Button onClick={onSubmitHandler} color="success" variant="contained">
          {isEdit ? (mode === "approve" ? "Approve Claim" : "Re-submit") : "Submit Claim"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
