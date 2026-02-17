import { useEffect, useState } from 'react';
import { Stack, Typography, Button, Snackbar, Alert } from '@mui/material';
import { Link } from 'react-router-dom';
import { policyService } from '../../services/policyService';
import api from '../../services/apiClient';
import { usePermissions } from '../../hooks/usePermissions';
import DataTable from '../../shared/DataTable';
import AccessDeniedModal from '../../shared/common/AccessDenied';
import PolicySearchById from './PolicySearchId';

// ✅ Update these two routes to match your backend
const ALLOCATE_RISK_URL = (policyNumber) => `/risk-allocations/allocate/${policyNumber}`; // FR-7
const VALIDATE_ALLOC_URL = `/risk-allocations/validate`; // FR-8

export default function PoliciesList() {
  const [rows, setRows] = useState([]);
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState('');

  const { can } = usePermissions();
  const isAuthorized = can(['admin', 'underwriter']);

  useEffect(() => {
    if (!isAuthorized) return;

    (async () => {
      try {
        const data = await policyService.list();
        setRows(Array.isArray(data) ? data : data ? [data] : []);
        setError(null);
      } catch (e) {
        setError(e?.response?.data?.message || 'Failed to load policies');
      }
    })();
  }, [isAuthorized]);

  if (!isAuthorized) {
    return (
      <AccessDeniedModal reason="Only Underwriters and Administrators can view policies." />
    );
  }

  const reloadPolicies = async () => {
    const data = await policyService.list();
    setRows(Array.isArray(data) ? data : data ? [data] : []);
  };

  const handleResult = (policy, err) => {
    setError(err || null);

    if (!policy) {
      reloadPolicies();
      return;
    }

    setRows(Array.isArray(policy) ? policy : [policy]);
  };

const handleApprove = async (row) => {
  try {
    setError(null);

    const id = row._id ?? row.id;
    const policyNumber = row.policyNumber;

    const sumInsured = Number(row.sumInsured || 0);
    const retentionLimit = Number(row.retentionLimit || 0);

    // ✅ Approve first (so policy becomes ACTIVE if your backend requires ACTIVE)
    const approveRes = await policyService.approve(id);

    // Update status immediately
    setRows((prev) =>
      (Array.isArray(prev) ? prev : []).map((p) =>
        (p._id ?? p.id) === id
          ? { ...p, ...approveRes?.allocation, status: "ACTIVE" }
          : p
      )
    );

    // If exceeds retention => allocate + validate
    if (sumInsured > retentionLimit && policyNumber) {
      // FR-7: allocate (POST)
      const allocRes = await api.post(`/risk-allocations/allocate/${policyNumber}`);
      const allocationDoc = allocRes.data;

      if (allocationDoc?.message && !allocationDoc?.allocations) {
        setError(allocationDoc.message);
        setSuccessMsg("Policy approved (allocation not created).");
        return;
      }

      const allocations = Array.isArray(allocationDoc?.allocations)
        ? allocationDoc.allocations
        : [];

      // FR-8: validate (POST)
      const validateRes = await api.post(`/risk-allocations/validate`, {
        policyId: policyNumber, // controller expects policyId in body
        allocations,
      });

      if (validateRes?.data?.valid === false) {
        const msg =
          (validateRes.data.violations || []).join(", ") ||
          "Allocation violates treaty/retention limits";
        setError(msg);
        setSuccessMsg("Policy approved (allocation failed validation).");
        return;
      }

      // FR-9: totals returned from validate
      const totals = validateRes?.data?.totals || {};
      const cededAmount = Number(totals.cededAmount || 0);
      const retainedAmount = Number(totals.retainedAmount || 0);
      const cedableCapacity = Number(totals.cedableCapacity || 0);

      // Update row with FR-9 fields + allocation lines
      setRows((prev) =>
        (Array.isArray(prev) ? prev : []).map((p) =>
          (p._id ?? p.id) === id
            ? {
                ...p,
                status: "ACTIVE",
                cededAmount,
                retainedAmount,
                cedableCapacity,
                allocations: allocationDoc?.allocations || p.allocations,
              }
            : p
        )
      );

      setSuccessMsg("Policy approved + risk allocated successfully");
      return;
    }

    setSuccessMsg("Policy approved successfully");
  } catch (e) {
    setError(e?.response?.data?.message || e?.message || "Approval failed");
  }
};


  const handleRemove = async (row) => {
    try {
      await policyService.delete(row._id ?? row.id);
      setRows((prev) =>
        (Array.isArray(prev) ? prev : []).filter(
          (p) => (p._id ?? p.id) !== (row._id ?? row.id)
        )
      );
      setError(null);
    } catch (e) {
      setError(e?.response?.data?.message || 'Remove failed');
    }
  };

  const safeRows = Array.isArray(rows) ? rows : rows ? [rows] : [];
  const tableRows = safeRows.map((row) => ({
    ...row,
    onApprove: () => handleApprove(row),
    onRemove: () => handleRemove(row),
  }));

  return (
    <Stack spacing={2}>
      <Stack direction="row" alignItems="center" justifyContent="space-between">
        <Typography variant="h6">Policies</Typography>
        <Button component={Link} to="/policies/new" variant="contained">
          Create Policy
        </Button>
      </Stack>

      {error && (
        <Typography variant="body2" color="error">
          {error}
        </Typography>
      )}

      <PolicySearchById onResult={handleResult} />

      {successMsg && (
        <Snackbar
          open
          autoHideDuration={3000}
          onClose={() => setSuccessMsg('')}
          anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
        >
          <Alert onClose={() => setSuccessMsg('')} severity="success" sx={{ width: '100%' }}>
            {successMsg}
          </Alert>
        </Snackbar>
      )}

      {/* Your DataTable should render these extra fields if columns are set to show them */}
      <DataTable values={tableRows} />
    </Stack>
  );
}
