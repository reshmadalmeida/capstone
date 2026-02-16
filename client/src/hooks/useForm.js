import { useState } from 'react';

export default function useForm(initial = {}) {
  const [values, setValues] = useState(initial);
  const [errors, setErrors] = useState({});
  const onChange = (name, value) => setValues(v => ({ ...v, [name]: value }));
  const setError = (name, message) => setErrors(e => ({ ...e, [name]: message }));
  const clearErrors = () => setErrors({});
  return { values, errors, onChange, setError, clearErrors, setValues };
}