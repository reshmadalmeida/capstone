import { useEffect, useState } from 'react';
import { Box, Button, Stack, TextField, Typography } from '@mui/material';
import { Link } from 'react-router-dom';
import { policyService } from '../../services/policyService';
import { usePermissions } from '../../hooks/usePermissions';
import DataTable from '../../shared/DataTable';
import AccessDeniedModal from '../../shared/common/AccessDenied';
import PolicySearchById from './PolicySearchId';


export default function PoliciesList() {
  const [rows, setRows] = useState([]);
  const [q, setQ] = useState('');
  const [error, setError] = useState(null);

  const { can } = usePermissions();

  // Check if user has admin or underwriter role
  const isAuthorized = can(['admin', 'underwriter']);

  useEffect(() => {
    if (!isAuthorized) return;
    (async () => {
      try {
        const data = await policyService.list(q ? { q } : undefined);
        console.log(data,"data")
        setRows(data);
      } catch (e) { console.error(e)
        setError(e?.response?.data?.message || 'Failed to load policies');
       }
    })();
  }, [q, isAuthorized]);

  if (!isAuthorized) {
    return <AccessDeniedModal reason="Only Underwriters and Administrators can view policies." />;
  }
  

  const handleResult = (policy, err) => {
    setError(err || null);
    setRows(policy || null);
  };


  return (
    <Stack spacing={2}>
      <Stack direction="row" alignItems="center" justifyContent="space-between">
        <Typography variant="h6">Policies</Typography>
        <Button component={Link} to="/policies/new" variant="contained">Create Policy</Button>
      </Stack>
 
    {error && <p style={{ color: '#b00020' }}>
        {error?.response?.data?.error ?? 'No policy found or invalid _id'}
      </p>}

     <PolicySearchById onResult={handleResult} />
      
      {rows && <DataTable values={rows} />}
    </Stack>
  );
}
