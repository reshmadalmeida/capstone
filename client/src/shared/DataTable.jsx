import React, { useMemo } from 'react';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import StatusBadge from '../features/policy/PolicyStatusBadge';
import { usePermissions } from '../hooks/usePermissions';
import { IconButton, Stack } from '@mui/material';

// small date formatter (keeps it framework-agnostic)
const fmtDate = (iso) => {
  if (!iso) return '—';
  try {
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return '—';
    return d.toLocaleDateString(undefined, { day: '2-digit', month: 'short', year: 'numeric' });
  } catch {
    return '—';
  }
};

export default function DataTable({ values }) {
  const { user } = usePermissions();

  /**
   * Columns are defined explicitly so we control order and format.
   * You can add/remove columns easily here.
   */
  const userRole = (user?.role || '').toLowerCase();

  const canApprove = (role, status) =>
    ['ADMIN', 'UNDERWRITER'].includes(String(role || '').toUpperCase()) &&
    String(status || '').toUpperCase() === 'DRAFT';

  // Keep your date formatter
  const fmtDate = (iso) => {
    if (!iso) return '—';
    const d = new Date(iso);
    return Number.isNaN(d.getTime())
      ? '—'
      : d.toLocaleDateString(undefined, { day: '2-digit', month: 'short', year: 'numeric' });
  };

  const columns = [
    {
      header: 'Insured Name',
      accessor: (row) => row?.insuredName,
      align: 'left',
    },
    {
      header: 'Policy Number',
      accessor: (row) => row?.policyNumber,
    },
    {
      header: 'Insured Type',
      accessor: (row) => row?.insuredType,
    },
    {
      header: 'Line of Business',
      accessor: (row) => row?.lineOfBusiness,
    },
    {
      header: 'Effective From',
      accessor: (row) => fmtDate(row?.effectiveFrom),
    },
    {
      header: 'Effective To',
      accessor: (row) => fmtDate(row?.effectiveTo),
    },
    {
      header: 'Sum Insured',
      accessor: (row) =>
        row?.sumInsured != null ? Intl.NumberFormat().format(Number(row.sumInsured)) : '—',
    },
    {
      header: 'Premium',
      accessor: (row) =>
        row?.premium != null ? Intl.NumberFormat().format(Number(row.premium)) : '—',
    },
    {
      header: 'Retention Limit',
      accessor: (row) =>
        row?.retentionLimit != null ? Intl.NumberFormat().format(Number(row.retentionLimit)) : '—',
    },
    {
      header: 'Current status',
      accessor: (row) => (
        <StatusBadge
          status={row?.status}
          canApprove={canApprove(userRole, row?.status)}
          onApprove={() => onApprove?.(row)}
        />
      ),
    },

    {
      header: 'Created By',
      accessor: (row) => row?.createdBy?.username || '—',
    },
    {
      header: 'Actions',
      align: 'right',
      render: (row) => (
        <Stack direction="row" spacing={1} justifyContent="flex-end">
          {canApprove(userRole, row?.status) && (
            <IconButton
              color="success"
              size="small"
              aria-label="Approve"
            >Approve
            </IconButton>
          )}
          <IconButton
            size="small"
            aria-label="reject"
          >Reject
          </IconButton>
        </Stack>
      ),
    },

  ];

  // Normalize to an array so the table is reusable for one row or many
  const rows = useMemo(() => (Array.isArray(values) ? values : values ? [values] : []), [values]);

  return (
    <TableContainer component={Paper}>
      <Table sx={{ minWidth: 650 }} aria-label="policy data table">
        <TableHead>
          <TableRow>
            {columns.map((col, i) => (
              <TableCell
                key={col.header}
                align={col.align || (i === 0 ? 'left' : 'right')}
                sx={{ fontWeight: 'bold' }}
              >
                {col.header}
              </TableCell>
            ))}
          </TableRow>
        </TableHead>

        <TableBody>
          {rows.length === 0 ? (
            <TableRow>
              <TableCell colSpan={columns.length} align="center">
                No data
              </TableCell>
            </TableRow>
          ) : (
            rows.map((row, rIdx) => (
              <TableRow
                key={row._id || rIdx}
                sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
              >
                {columns.map((col, cIdx) => {
                  // Prefer a custom renderer when provided
                  const content = col.render ? col.render(row) : (col.accessor ? col.accessor(row) : '—');

                  const renderCellContent = (value) => {
                    if (value == null || value === '') return '—';

                    // If it's a valid React element (from col.render), render as-is
                    if (React.isValidElement(value)) return value;

                    // For primitives, just print them
                    const t = typeof value;
                    if (t === 'string' || t === 'number' || t === 'boolean') return String(value);

                    // Anything else (objects, functions, symbols) – avoid JSON.stringify to prevent circular errors
                    return '—'; // or provide a very small/custom summary if you need
                  };

                  return (
                    <TableCell
                      key={`${rIdx}-${cIdx}`}
                      align={col.align || (cIdx === 0 ? 'left' : 'right')}
                    >
                      {renderCellContent(content)}
                    </TableCell>
                  );
                })}
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </TableContainer>
  );
}