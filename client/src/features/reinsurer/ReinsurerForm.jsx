import { useEffect, useState } from "react";
import reinsuranceService from "../../services/reinsuranceService";
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Button from '@mui/material/Button';
import Grid from '@mui/material/Grid';
import Switch from '@mui/material/Switch';
import FormControlLabel from '@mui/material/FormControlLabel';
import FormLabel from '@mui/material/FormLabel';
import Alert from '@mui/material/Alert';
import { REINSURER_RATING_OPTIONS } from "../../app/constants";
import FormTextField from '../../components/common/FormTextField.jsx';

export default function ReinsurerForm({
  onClose,
  showModal,
  reinsurerData = null,
}) {
  const isEdit = !!reinsurerData;

  const [alertMessage, setAlertMessage] = useState("");
  const [errors, setErrors] = useState({});

  const emptyForm = {
    name: "",
    country: "",
    rating: "",
    contactEmail: "",
    status: true,
  };

  const [form, setForm] = useState(emptyForm);

  useEffect(() => {
    if (reinsurerData) {
      setForm({
        name: reinsurerData.name || "",
        country: reinsurerData.country || "",
        rating: reinsurerData.rating || "",
        contactEmail: reinsurerData.contactEmail || "",
        status: reinsurerData.status === "ACTIVE",
      });
    } else {
      setForm(emptyForm);
    }
    setErrors({});
  }, [reinsurerData, showModal]);

  if (!showModal) return null;

  const onChangeHandler = (name, value) => {
    setForm({ ...form, [name]: value });
    setErrors({ ...errors, [name]: "" });
  };

  const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const validate = () => {
    const e = {};

    if (!form.name.trim()) {
      e.name = "Name is required.";
    } else if (form.name.trim().length < 2) {
      e.name = "Name must be at least 2 characters.";
    }

    if (!form.country.trim()) {
      e.country = "Country is required.";
    }

    if (!form.rating) {
      e.rating = "Select a rating.";
    }

    if (!form.contactEmail.trim()) {
      e.contactEmail = "Email is required.";
    } else if (!validateEmail(form.contactEmail)) {
      e.contactEmail = "Enter a valid email address.";
    }

    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const onSubmitHandler = async () => {
    setAlertMessage("");
    if (!validate()) return;

    const payload = {
      name: form.name.trim(),
      country: form.country.trim(),
      rating: form.rating,
      contactEmail: form.contactEmail.trim(),
      status: form.status ? "ACTIVE" : "INACTIVE",
    };


    try {
      if (isEdit) {
        await reinsuranceService.updateReinsurer(reinsurerData._id, payload);
      } else {
        await reinsuranceService.createReinsurer(payload);
      }
    } catch (error) {
      setAlertMessage(error.message);
      return;
    }
    onClose(true);
  };

  return (
    <Dialog open={showModal} onClose={() => onClose(false)} maxWidth="sm" fullWidth>
      <DialogTitle>{isEdit ? "Update Reinsurer" : "Create Reinsurer"}</DialogTitle>
      <DialogContent dividers>
        {!!alertMessage && (
          <Alert severity="error" sx={{ mb: 2 }}>{alertMessage}</Alert>
        )}
        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <FormTextField
              label="Name"
              name="name"
              value={form.name}
              onChange={onChangeHandler}
              required
              error={errors.name}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <FormTextField
              label="Country"
              name="country"
              value={form.country}
              onChange={onChangeHandler}
              required
              error={errors.country}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <FormTextField
              label="Rating"
              name="rating"
              value={form.rating}
              onChange={onChangeHandler}
              required
              error={errors.rating}
              select
              SelectProps={{ native: true }}
            >
              <option value="">Select Rating</option>
              {REINSURER_RATING_OPTIONS?.map((r) => (
                <option key={r} value={r}>{r}</option>
              ))}
            </FormTextField>
          </Grid>
          <Grid item xs={12} md={6}>
            <FormTextField
              label="Contact Email"
              type="email"
              name="contactEmail"
              value={form.contactEmail}
              onChange={onChangeHandler}
              required
              error={errors.contactEmail}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <FormLabel component="legend" sx={{ mb: 1 }}>Status</FormLabel>
            <FormControlLabel
              control={
                <Switch
                  checked={form.status}
                  onChange={() => setForm({ ...form, status: !form.status })}
                  color="primary"
                />
              }
              label={form.status ? "ACTIVE" : "INACTIVE"}
            />
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button onClick={() => onClose(false)} color="inherit" variant="outlined">
          Cancel
        </Button>
        <Button onClick={onSubmitHandler} color="success" variant="contained">
          {isEdit ? "Update Reinsurer" : "Create Reinsurer"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
