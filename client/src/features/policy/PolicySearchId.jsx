import { useState } from 'react';
import {
  Stack,
  TextField,
  Button,
  IconButton,
  InputAdornment
} from '@mui/material';
import ClearIcon from '@mui/icons-material/Clear';
import SearchIcon from '@mui/icons-material/Search';
import { policyService } from '../../services/policyService';

export default function PolicySearchById({ onResult }) {
  const [id, setId] = useState('');
  const [loading, setLoading] = useState(false);

  const search = async () => {
    if (!id.trim()) return;

    setLoading(true);
    try {
      const policy = await policyService.getById(id.trim());

      // send result to parent
      onResult?.(policy, null);
    } catch (err) {
      console.error('Search failed:', err);

      onResult?.(null, err?.response?.data?.message || 'Policy not found');
    } finally {
      setLoading(false);
    }
  };

  // ✅ Clear input + reset table
  const handleClear = () => {
    setId('');
    onResult?.(null, null); // parent decides to reload or clear
  };

  return (
    <Stack direction="row" spacing={1}>
      <TextField
        fullWidth
        size="small"
        placeholder="Search by policy number"
        value={id}
        onChange={(e) => setId(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            search();
          }
        }}
        InputProps={{
          endAdornment: id && (
            <InputAdornment position="end">
              <IconButton onClick={handleClear} edge="end">
                <ClearIcon />
              </IconButton>
            </InputAdornment>
          )
        }}
      />

      <Button
        variant="contained"
        onClick={search}
        disabled={loading || !id.trim()}
        startIcon={<SearchIcon />}
      >
        {loading ? 'Searching…' : 'Search'}
      </Button>
    </Stack>
  );
}
