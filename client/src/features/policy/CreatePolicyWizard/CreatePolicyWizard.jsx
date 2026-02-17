
import { useState } from 'react';
import { Button, Stack, Step, StepLabel, Stepper, Typography, Alert, CircularProgress, Box } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import useForm from '../../../hooks/useForm';
import { policyService } from '../../../services/policyService';
import { STEPS, POLICY_STATUS } from '../../../app/constants';


import PolicyStepGeneral from './PolicyStepGeneral';
import PolicyStepCoverage from './PolicyStepCoverage';
import PolicyStepReview from './PolicyStepReview';
import api from '../../../services/apiClient';

export default function CreatePolicyWizard({
  initialValues = {
    insuredName: '',
    insuredType: 'INDIVIDUAL',
    lineOfBusiness: 'HEALTH',
    sumInsured: 0,
    premium: 0,
    retentionLimit: 0,
    effectiveFrom: '',
    effectiveTo: '',
  },
  onSubmitSuccess, // optional (payload) => void
  onCancel,        // optional () => void
}) {
  const { values, errors, onChange, setError, clearErrors } = useForm(initialValues);
  const [active, setActive] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);
  const [policyId, setPolicyId] = useState(null);
  const [calculatedValues, setCalculatedValues] = useState({});
  const navigate = useNavigate();

  // ---------- Validation ----------
  const validateGeneral = () => {
    clearErrors();
    let ok = true;
    if (!values.insuredName) { setError('insuredName', 'Required'); ok = false; }
    if (!values.effectiveFrom) { setError('effectiveFrom', 'Required'); ok = false; }
    if (!values.effectiveTo) { setError('effectiveTo', 'Required'); ok = false; }
    if (values.effectiveFrom && values.effectiveTo) {
      const start = new Date(values.effectiveFrom);
      const end = new Date(values.effectiveTo);
      if (start > end) { setError('effectiveTo', 'Must be after Effective From'); ok = false; }
    }
    return ok;
  };

  const validateCoverage = () => {
    clearErrors();
    let ok = true;
    const sumInsured = Number(values.sumInsured ?? 0);
    const premium = Number(values.premium ?? 0);
    const retentionLimit = Number(values.retentionLimit ?? 0);

    if (sumInsured <= 0) { setError('sumInsured', 'Must be > 0'); ok = false; }
    if (premium < 0) { setError('premium', 'Cannot be negative'); ok = false; }
    if (retentionLimit < 0) { setError('retentionLimit', 'Cannot be negative'); ok = false; }
    if (retentionLimit > sumInsured) { setError('retentionLimit', 'Cannot exceed Sum Insured'); ok = false; }
    return ok;
  };

  // ---------- Navigation ----------
  const next = () => {
    if (active === 0 && !validateGeneral()) return;
    if (active === 1 && !validateCoverage()) return;
    setActive((s) => s + 1);
  };

  const back = () => setActive((s) => Math.max(s - 1, 0));

  // ---------- Calculate Exposure ----------
//  const calculateExposure = async () => {
//   try {
//     const sumInsured = Number(values.sumInsured || 0);
//     const retentionLimit = Number(values.retentionLimit || 0);

//     const cededAmount = Math.max(0, sumInsured - retentionLimit);
//     const retainedAmount = Math.min(sumInsured, retentionLimit);

//     const result = { sumInsured, retentionLimit, cededAmount, retainedAmount };
//     setCalculatedValues(result);
//     return result;
//   } catch (e) {
//     console.error("Exposure calculation error:", e);
//     return {};
//   }
// };
const calculateExposure = async (policyNumber) => {
  try {
    const payload = {
      sumInsured: Number(values.sumInsured),
      retentionLimit: Number(values.retentionLimit),
      lineOfBusiness: values.lineOfBusiness,
      premium: Number(values.premium),
    };

    const { data } = await api.post(
      `/risk-allocations/calculate-exposure/${policyNumber}`,
      payload
    );

    setCalculatedValues(data);
    return data;
  } catch (e) {
    console.error("Exposure calculation error:", e);
    return {};
  }
};


  // ---------- Save Draft ----------
  const saveDraft = async () => {
    try {
      setIsLoading(true);
      setErrorMessage(null);
      
      const payload = {
        insuredName: values.insuredName,
        insuredType: values.insuredType,
        lineOfBusiness: values.lineOfBusiness,
        sumInsured: Number(values.sumInsured),
        premium: Number(values.premium),
        retentionLimit: Number(values.retentionLimit),
        effectiveFrom: values.effectiveFrom,
        effectiveTo: values.effectiveTo,
        status: POLICY_STATUS.DRAFT,
      };
      
      const response = await policyService.create(payload);
      setPolicyId(response.id);
      setSuccessMessage(`Policy saved as DRAFT. Policy ID: ${response.id}`);
      
      // Calculate exposure after creating policy
      await calculateExposure(response.policyNumber);
      
      return response;
    } catch (e) {
      console.error('Save draft error:', e);
      setErrorMessage(e?.response?.data?.message || 'Failed to save policy as draft');
    } finally {
      setIsLoading(false);
    }
  };

  // ---------- Submit for Approval ----------
  const submitForApproval = async () => {
    try {
      setIsLoading(true);
      setErrorMessage(null);
      if (!policyId) {
        setErrorMessage('Policy ID not found. Please save as draft first.');
        return;
      }
      // Call backend approve endpoint (transitions to ACTIVE, calculates exposure/retention)
      const response = await policyService.approve(policyId);
      setSuccessMessage(`Policy approved and activated. Status: ${response?.allocation ? 'ACTIVE' : 'DRAFT'}`);
      if (response?.allocation) {
        setCalculatedValues(response.allocation);
      }
      // Redirect to policy details
      setTimeout(() => {
        navigate(`/policies/${policyId}`, { state: { message: 'Policy approved successfully' } });
      }, 2000);
    } catch (e) {
      console.error('Submit error:', e);
      setErrorMessage(e?.response?.data?.message || 'Failed to approve policy');
    } finally {
      setIsLoading(false);
    }
  };

  // ---------- Submit (Create & Save) ----------
  const submit = async () => {
    try {
      setIsLoading(true);
      setErrorMessage(null);
      
      if (!policyId) {
        // Create new policy
        const newPolicy = await saveDraft();
        if (!newPolicy) return;
      }
      
      // For now, just show success and redirect
      setSuccessMessage('Policy created successfully!');
      onSubmitSuccess?.(values);
      
      setTimeout(() => {
        navigate('/policies');
      }, 1500);
    } catch (e) {
      console.error('Submit error:', e);
      setErrorMessage(e?.response?.data?.message || 'Failed to create policy');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Stack spacing={3}>
      {successMessage && (
        <Alert severity="success" onClose={() => setSuccessMessage(null)}>{successMessage}</Alert>
      )}
      {errorMessage && (
        <Alert severity="error" onClose={() => setErrorMessage(null)}>{errorMessage}</Alert>
      )}
      
      {policyId && (
        <Alert severity="info">Policy ID: <strong>{policyId}</strong> • Status: <strong>DRAFT</strong></Alert>
      )}
      
      <Stepper activeStep={active}>
        {STEPS.map((label) => (
          <Step key={label}><StepLabel>{label}</StepLabel></Step>
        ))}
      </Stepper>

      {active === 0 && (
        <PolicyStepGeneral values={values} errors={errors} onChange={onChange} />
      )}
      {active === 1 && (
        <PolicyStepCoverage values={values} errors={errors} onChange={onChange} />
      )}
      {active === 2 && (
        <PolicyStepReview values={values} calculatedValues={calculatedValues} />
      )}

      <Stack direction="row" justifyContent="space-between" sx={{ mt: 4 }}>
        <Button 
          disabled={active === 0 || isLoading} 
          onClick={back} 
          color="secondary"
        >
          Back
        </Button>
        
        <Stack direction="row" spacing={2}>
          {active === STEPS.length - 1 && policyId && (
            <Button 
              onClick={submitForApproval} 
              variant="contained"
              disabled={isLoading}
            >
              {isLoading ? <CircularProgress size={20} sx={{ mr: 1 }} /> : null}
              Submit for Approval
            </Button>
          )}
          
          {active < STEPS.length - 1 ? (
            <Button 
              onClick={next} 
              variant="contained"
              disabled={isLoading}
            >
              Next
            </Button>
          ) : (
            <Button 
              onClick={submit} 
              variant="contained"
              disabled={isLoading}
            >
              {isLoading ? <CircularProgress size={20} sx={{ mr: 1 }} /> : null}
              {policyId ? 'Update & Continue' : 'Create Policy'}
            </Button>
          )}
        </Stack>
      </Stack>

      {onCancel && active === 0 && (
        <Button onClick={onCancel} color="inherit">Cancel</Button>
      )}
    </Stack>
  );
}