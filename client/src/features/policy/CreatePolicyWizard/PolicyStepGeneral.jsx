// src/features/policies/create/PolicyStepGeneral.jsx
import React from 'react';
import { Stack, MenuItem } from '@mui/material';
import FormTextField from '../../../components/common/FormTextField';
import { INSURANCE_TYPE } from '../../../app/constants';

export default function PolicyStepGeneral({ values, errors, onChange }) {
  return (
    <Stack spacing={2}>
      <FormTextField
        label="Insured Name"
        name="insuredName"
        value={values.insuredName}
        onChange={onChange}
        error={errors.insuredName}
      />

      <FormTextField
        select
        label="Insured Type"
        name="insuredType"
        value={values.insuredType}
        onChange={onChange}
        error={errors.insuredType}
      >
        <MenuItem value="INDIVIDUAL">INDIVIDUAL</MenuItem>
        <MenuItem value="CORPORATE">CORPORATE</MenuItem>
      </FormTextField>

      <FormTextField
        select
        label="Line of Business"
        name="lineOfBusiness"
        value={values.lineOfBusiness}
        onChange={onChange}
        error={errors.lineOfBusiness}
      >
        {INSURANCE_TYPE?.map((type) => (
          <MenuItem key={type} value={type}>{type}</MenuItem>
        ))}
      </FormTextField>

      <FormTextField
        type="date"
        label="Effective From"
        name="effectiveFrom"
        value={values.effectiveFrom}
        onChange={onChange}
        InputLabelProps={{ shrink: true }}
        error={errors.effectiveFrom}
      />

      <FormTextField
        type="date"
        label="Effective To"
        name="effectiveTo"
        value={values.effectiveTo}
        onChange={onChange}
        InputLabelProps={{ shrink: true }}
        error={errors.effectiveTo}
      />
    </Stack>
  );
}