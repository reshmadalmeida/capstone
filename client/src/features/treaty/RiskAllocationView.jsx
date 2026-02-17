import { useMemo, useState } from "react";
import api from "../../services/apiClient";
import { convertToCurrency } from "../../common/utils";

import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  CardHeader,
  CircularProgress,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from "@mui/material";

export default function RiskAllocationView() {
  const [policyId, setPolicyId] = useState("");
  const [rows, setRows] = useState([]); // flattened rows
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const canCheck = policyId.trim().length > 0 && !loading;

  const handleCheck = async () => {
    const id = policyId.trim();
    if (!id) return;

    setLoading(true);
    setMessage("");
    setError("");
    setRows([]);

    try {
      const { data } = await api.get(`/risk-allocations/${id}`);

      const doc = Array.isArray(data) ? data[0] : data;

      if (!doc) {
        setMessage("No allocation found.");
        return;
      }

      if (doc.message) {
        setMessage(doc.message);
        return;
      }

      const lines = Array.isArray(doc.allocations) ? doc.allocations : [];
      if (lines.length === 0) {
        setMessage("No allocation lines found for this policy.");
        return;
      }

      const flattened = lines.map((a, idx) => ({
        _rowId: `${doc._id}-${idx}`,
        reinsurerName: a?.reinsurerId?.name || "-",
        reinsurerCode: a?.reinsurerId?.code || "-",
        treatyName: a?.treatyId?.treatyName || "-",
        retentionLimit: a?.treatyId?.retentionLimit ?? 0,
        treatyLimit: a?.treatyId?.treatyLimit ?? 0,
        allocatedAmount: a?.allocatedAmount ?? 0,
        allocatedPercentage: a?.allocatedPercentage ?? 0,
      }));

      setRows(flattened);
    } catch (e) {
      setError(
        e?.response?.data?.message ||
          "Something went wrong. Please try again later."
      );
    } finally {
      setLoading(false);
    }
  };

  const totals = useMemo(() => {
    const ceded = rows.reduce(
      (sum, r) => sum + Number(r.allocatedAmount || 0),
      0
    );
    return { ceded };
  }, [rows]);

  return (
    <Box sx={{ maxWidth: 980, mx: "auto", p: 3 }}>
      <Card>
        <CardHeader
          title="Risk Allocation View"
          subheader="Enter a Policy ID to view allocation details"
        />
        <CardContent>
          <Stack
            direction={{ xs: "column", sm: "row" }}
            spacing={2}
            alignItems="center"
          >
            <TextField
              fullWidth
              label="Policy ID"
              value={policyId}
              onChange={(e) => setPolicyId(e.target.value.toUpperCase())}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleCheck();
              }}
            />
            <Button
              variant="contained"
              onClick={handleCheck}
              disabled={!canCheck}
              sx={{ minWidth: 140 }}
            >
              {loading ? "Checking..." : "Check"}
            </Button>
          </Stack>

          {loading && (
            <Stack alignItems="center" sx={{ mt: 3 }}>
              <CircularProgress />
            </Stack>
          )}

          {!!message && (
            <Alert severity="info" sx={{ mt: 3 }}>
              {message}
            </Alert>
          )}
          {!!error && (
            <Alert severity="error" sx={{ mt: 3 }}>
              {error}
            </Alert>
          )}

          {!loading && rows.length > 0 && (
            <Box sx={{ mt: 3 }}>
              <Typography variant="body2" sx={{ mb: 1 }}>
                Total Ceded: <strong>{convertToCurrency(totals.ceded)}</strong>
              </Typography>

              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Reinsurer</TableCell>
                    <TableCell>Treaty</TableCell>
                    <TableCell>Retention</TableCell>
                    <TableCell>Treaty Limit</TableCell>
                    <TableCell>Allocated</TableCell>
                    <TableCell>%</TableCell>
                  </TableRow>
                </TableHead>

                <TableBody>
                  {rows.map((r) => (
                    <TableRow key={r._rowId}>
                      <TableCell>{`${r.reinsurerName} (${r.reinsurerCode})`}</TableCell>
                      <TableCell>{r.treatyName}</TableCell>
                      <TableCell>{convertToCurrency(r.retentionLimit)}</TableCell>
                      <TableCell>{convertToCurrency(r.treatyLimit)}</TableCell>
                      <TableCell>{convertToCurrency(r.allocatedAmount)}</TableCell>
                      <TableCell>{r.allocatedPercentage}%</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Box>
          )}
        </CardContent>
      </Card>
    </Box>
  );
}
