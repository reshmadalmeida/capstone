import { useEffect, useState } from "react";
import api from "../../services/apiClient";
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Button from '@mui/material/Button';
import Grid from '@mui/material/Grid';
import Checkbox from '@mui/material/Checkbox';
import FormControlLabel from '@mui/material/FormControlLabel';
import FormGroup from '@mui/material/FormGroup';
import FormLabel from '@mui/material/FormLabel';
import Alert from '@mui/material/Alert';
import { TREATY_TYPE_OPTIONS, LOB_OPTIONS } from "../../app/constants";
import { toYYYYMMDD } from "../../common/utils";
import FormTextField from '../../components/common/FormTextField.jsx';

export default function TreatyForm({ onClose, showModal, treatyData = null }) {
  const today = new Date().toISOString().split("T")[0];
  const isEdit = !!treatyData;

  const [alertMessage, setAlertMessage] = useState("");
  const [errors, setErrors] = useState({});

  const emptyForm = {
    treatyName: "",
    treatyType: "",
    reinsurerId: "",
    sharePercentage: "",
    retentionLimit: "",
    treatyLimit: "",
    applicableLOBs: [],
    effectiveFrom: "",
    effectiveTo: "",
  };

  const [form, setForm] = useState(emptyForm);

  useEffect(() => {
    if (treatyData) {
      setForm({
        treatyName: treatyData.treatyName || "",
        treatyType: treatyData.treatyType || "",
        reinsurerId: treatyData.reinsurerId?.code || "",
        sharePercentage: treatyData.sharePercentage || "",
        retentionLimit: treatyData.retentionLimit || "",
        treatyLimit: treatyData.treatyLimit || "",
        applicableLOBs: treatyData.applicableLOBs || [],
        effectiveFrom: toYYYYMMDD(treatyData.effectiveFrom),
        effectiveTo: toYYYYMMDD(treatyData.effectiveTo),
      });
    } else {
      setForm(emptyForm);
    }
    setErrors({});
  }, [treatyData, showModal]);

  if (!showModal) return null;

  const onChangeHandler = (name, value) => {
    setForm({ ...form, [name]: value });
    setErrors({ ...errors, [name]: "" });
  };

  const onLobChange = (lob) => {
    const updated = form.applicableLOBs.includes(lob)
      ? form.applicableLOBs.filter((l) => l !== lob)
      : [...form.applicableLOBs, lob];

    setForm({ ...form, applicableLOBs: updated });
    setErrors({ ...errors, applicableLOBs: "" });
  };

  const validate = () => {
    const e = {};

    if (!form.treatyName.trim()) e.treatyName = "Treaty name is required.";
    if (!form.treatyType) e.treatyType = "Select treaty type.";
    if (!form.reinsurerId.trim()) e.reinsurerId = "Reinsurer ID is required.";
    if (!form.sharePercentage) e.sharePercentage = "Share % is required";

    if (!form.retentionLimit || form.retentionLimit <= 0)
      e.retentionLimit = "Retention limit must be > 0.";

    if (!form.treatyLimit || form.treatyLimit <= 0)
      e.treatyLimit = "Treaty limit must be > 0.";

    if (Number(form.treatyLimit) <= Number(form.retentionLimit))
      e.treatyLimit = "Treaty limit must be greater than retention.";

    if (!form.applicableLOBs.length)
      e.applicableLOBs = "Select at least one LOB.";

    if (!form.effectiveFrom) e.effectiveFrom = "Select start date.";
    if (!form.effectiveTo) e.effectiveTo = "Select end date.";

    if (
      form.effectiveFrom &&
      form.effectiveTo &&
      form.effectiveTo < form.effectiveFrom
    )
      e.effectiveTo = "End date must be after start date.";

    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const onSubmitHandler = async () => {
    setAlertMessage("");
    if (!validate()) return;

    const payload = { ...form, reinsurerId: form.reinsurerId.toUpperCase() };

    try {
      if (isEdit) {
        await api.put(`/treaties/${treatyData._id}`, payload);
      } else {
        await api.post("/treaties/create", payload);
      }
    } catch (error) {
      setAlertMessage(error.message);
      return;
    }

    onClose(true);
  };

  return (
    <Dialog open={showModal} onClose={() => onClose(false)} maxWidth="md" fullWidth>
      <DialogTitle>{isEdit ? "Update Treaty" : "Create Treaty"}</DialogTitle>
      <DialogContent dividers>
        {!!alertMessage && (
          <Alert severity="error" sx={{ mb: 2 }}>{alertMessage}</Alert>
        )}
        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <FormTextField
              label="Treaty Name"
              name="treatyName"
              value={form.treatyName}
              onChange={onChangeHandler}
              required
              error={errors.treatyName}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <FormTextField
              label="Treaty Type"
              name="treatyType"
              value={form.treatyType}
              onChange={onChangeHandler}
              required
              error={errors.treatyType}
              select
              SelectProps={{ native: true }}
            >
              <option value=""></option>
              {TREATY_TYPE_OPTIONS?.map((opt) => (
                <option key={opt} value={opt}>{opt}</option>
              ))}
            </FormTextField>
          </Grid>
          <Grid item xs={12} md={4}>
            <FormTextField
              label="Reinsurer ID"
              name="reinsurerId"
              value={form.reinsurerId}
              onChange={onChangeHandler}
              required
              error={errors.reinsurerId}
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <FormTextField
              label="Share %"
              type="number"
              name="sharePercentage"
              value={form.sharePercentage}
              onChange={onChangeHandler}
              required
              error={errors.sharePercentage}
              inputProps={{ min: 0, max: 100 }}
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <FormTextField
              label="Retention Limit"
              type="number"
              name="retentionLimit"
              value={form.retentionLimit}
              onChange={onChangeHandler}
              required
              error={errors.retentionLimit}
              inputProps={{ min: 0 }}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <FormTextField
              label="Treaty Limit"
              type="number"
              name="treatyLimit"
              value={form.treatyLimit}
              onChange={onChangeHandler}
              required
              error={errors.treatyLimit}
              inputProps={{ min: 0 }}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <FormLabel component="legend" sx={{ mb: 1 }}>
              Applicable LOBs <span style={{ color: '#d32f2f' }}>*</span>
            </FormLabel>
            <FormGroup row>
              {LOB_OPTIONS?.map((lob) => (
                <FormControlLabel
                  key={lob}
                  control={
                    <Checkbox
                      checked={form.applicableLOBs.includes(lob)}
                      onChange={() => onLobChange(lob)}
                      name={lob}
                    />
                  }
                  label={lob}
                />
              ))}
            </FormGroup>
            {errors.applicableLOBs && (
              <div style={{ color: '#d32f2f', fontSize: 13, marginTop: 4 }}>{errors.applicableLOBs}</div>
            )}
          </Grid>
          <Grid item xs={12} md={6}>
            <FormTextField
              type="date"
              label="Effective From"
              name="effectiveFrom"
              value={form.effectiveFrom}
              onChange={onChangeHandler}
              required
              error={errors.effectiveFrom}
              InputLabelProps={{ shrink: true }}
              inputProps={{ min: today }}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <FormTextField
              type="date"
              label="Effective To"
              name="effectiveTo"
              value={form.effectiveTo}
              onChange={onChangeHandler}
              required
              error={errors.effectiveTo}
              InputLabelProps={{ shrink: true }}
              inputProps={{ min: form.effectiveFrom || today }}
            />
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button onClick={() => onClose(false)} color="inherit" variant="outlined">
          Cancel
        </Button>
        <Button onClick={onSubmitHandler} color="success" variant="contained">
          {isEdit ? "Update Treaty" : "Create Treaty"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
