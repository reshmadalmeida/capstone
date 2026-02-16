import { TextField } from '@mui/material';

export default function FormTextField({
  label, value, onChange, name, type='text', required, error, helperText, ...rest
}) {
  return (
    <TextField
      label={label}
      name={name}
      type={type}
      required={required}
      value={value ?? ''}
      onChange={(e) => onChange?.(name, e.target.value)}
      error={!!error}
      helperText={error || helperText}
      {...rest}
    />
  );
}