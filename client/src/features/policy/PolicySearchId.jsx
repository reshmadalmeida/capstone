import { useState } from 'react';
import { Stack, TextField, Button } from '@mui/material';
import { policyService } from '../../services/policyService';

export default function PolicySearchById({ onResult }) {
  const [id, setId] = useState('');
  const [loading, setLoading] = useState(false);

  const search = async () => {
    if (!id.trim()) return;
    setLoading(true);
    try {
      const policy = await policyService.getById(id.trim());
      // send the policy back to parent OR handle it here
      onResult?.(policy);
      // Or: console.log('Policy:', policy);
    } catch (err) {
      console.error('Search failed:', err);
      onResult?.(null, err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Stack direction="row" spacing={1}>
      <TextField
        fullWidth
        size="small"
        placeholder="Search by _id (Mongo ObjectId)"
        value={id}
        onChange={(e) => setId(e.target.value)}
      />
      <Button
        variant="contained"
        onClick={search}
        disabled={loading || !id.trim()}
      >
        {loading ? 'Searching…' : 'Search'}
      </Button>
    </Stack>
  );
}