// src/features/policies/create/PolicyStepCoverage.jsx
import React from 'react';
import { Stack } from '@mui/material';
import FormTextField from '../../../components/common/FormTextField';

export default function PolicyStepCoverage({ values, errors, onChange }) {
  return (
    <Stack spacing={2}>
      <FormTextField
        label="Sum Insured"
        type="number"
        name="sumInsured"
        value={values.sumInsured}
        onChange={onChange}
        error={errors.sumInsured}
      />
      <FormTextField
        label="Premium"
        type="number"
        name="premium"
        value={values.premium}
        onChange={onChange}
        error={errors.premium}
      />
      <FormTextField
        label="Retention Limit"
        type="number"
        name="retentionLimit"
        value={values.retentionLimit}
        onChange={onChange}
        error={errors.retentionLimit}
      />
    </Stack>
  );
}