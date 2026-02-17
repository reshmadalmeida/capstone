import { useState } from "react";
import Loader from "../../shared/Loader";
import AppShell from "../../layout/AppShell";
import { Box, Button, Paper, Grid, Typography, Alert, Card, CardContent, Chip, TableContainer, Table, TableHead, TableBody, TableRow, TableCell } from '@mui/material';
import FormTextField from '../../components/common/FormTextField.jsx';
import { REINSURER_ANALYST_LINKS } from "../../app/constants";
import { convertToCurrency } from "../../common/utils";
import reinsuranceService from "../../services/reinsuranceService";
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import CalculateIcon from '@mui/icons-material/Calculate';

export default function RiskAllocationView() {
  const [policyId, setPolicyId] = useState("");
  const [allocations, setAllocations] = useState([]);
  const [exposureData, setExposureData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const handleCheck = async () => {
    if (!policyId.trim()) return;

    setLoading(true);
    setMessage("");
    setError("");
    setSuccessMessage("");
    setAllocations([]);
    setExposureData(null);

    try {
      const data = await reinsuranceService.getRiskAllocations(policyId);
      if (Array.isArray(data) && data.length > 0) {
        setAllocations(data);
        // Calculate exposures for the retrieved allocations
        calculateExposures(data);
      } else {
        setMessage(data?.message || "No risk allocation found for this policy. Use 'Auto Allocate' to create one.");
      }
    } catch (err) {
      setError("Failed to fetch allocations. Policy may not exist or has no allocations.");
    } finally {
      setLoading(false);
    }
  };

  // FR-7: Auto-allocate risk using treaty rules
  const handleAutoAllocate = async () => {
    if (!policyId.trim()) return;

    setLoading(true);
    setMessage("");
    setError("");
    setSuccessMessage("");
    setAllocations([]);
    setExposureData(null);

    try {
      const data = await reinsuranceService.allocateRisk(policyId);
      if (data && data._id) {
        setAllocations([data]);
        setSuccessMessage("Risk automatically allocated using active treaty rules!");
        calculateExposures([data]);
      } else {
        setMessage(data?.message || "No applicable treaty found for automatic allocation.");
      }
    } catch (err) {
      setError(err.message || "Failed to auto-allocate risk. Check policy and treaty configuration.");
    } finally {
      setLoading(false);
    }
  };

  // FR-9: Calculate retained and ceded exposures
  const calculateExposures = (allocationList) => {
    if (!allocationList || allocationList.length === 0) return;

    try {
      const allocation = allocationList[0];
      const policyAllocs = allocation.allocations || [];
      
      // Calculate totals
      const totalCededAmount = policyAllocs.reduce((sum, a) => sum + (a.allocatedAmount || 0), 0);
      const retainedAmount = allocation.retainedAmount || 0;
      const totalExposure = totalCededAmount + retainedAmount;

      // Calculate percentages
      const cededPercentage = totalExposure > 0 ? ((totalCededAmount / totalExposure) * 100).toFixed(2) : 0;
      const retainedPercentage = totalExposure > 0 ? ((retainedAmount / totalExposure) * 100).toFixed(2) : 0;

      setExposureData({
        totalExposure,
        retainedAmount,
        retainedPercentage,
        cededAmount: totalCededAmount,
        cededPercentage,
        treatyCount: policyAllocs.length,
      });
    } catch (err) {
      console.error("Error calculating exposures:", err);
    }
  };

  // FR-8: Validate allocation against limits
  const validateAllocation = async () => {
    if (!policyId.trim() || allocations.length === 0) return;

    setLoading(true);
    setError("");
    setSuccessMessage("");

    try {
      const allocationData = allocations[0];
      const result = await reinsuranceService.validateAllocation({
        policyId,
        allocations: allocationData.allocations,
      });

      if (result.valid) {
        setSuccessMessage("✓ All allocations comply with treaty and retention limits!");
      } else {
        setError(`Validation failed: ${result.violations?.join(", ") || "Unknown violation"}`);
      }
    } catch (err) {
      setError("Failed to validate allocations.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AppShell links={REINSURER_ANALYST_LINKS}>
      <Box sx={{ p: 4, maxWidth: 1200, mx: 'auto' }}>
        <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
          <Typography variant="h5" fontWeight={600} gutterBottom>Risk Allocation & Exposure Analysis</Typography>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            Automatically allocate risk, enforce limits, and calculate retained/ceded exposures
          </Typography>
          
          <Grid container spacing={2} alignItems="flex-end" sx={{ mt: 1 }}>
            <Grid item xs={12} md={6}>
              <FormTextField
                label="Policy ID"
                name="policyId"
                value={policyId}
                onChange={(_, v) => setPolicyId((v || '').toUpperCase())}
                inputProps={{ style: { textTransform: 'uppercase' } }}
                autoComplete="off"
                fullWidth
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <Grid container spacing={1}>
                <Grid item xs={6} sm={4}>
                  <Button
                    fullWidth
                    variant="contained"
                    color="success"
                    onClick={handleCheck}
                    disabled={!policyId || loading}
                    sx={{ height: 40 }}
                  >
                    {loading ? 'Loading...' : 'View'}
                  </Button>
                </Grid>
                <Grid item xs={6} sm={4}>
                  <Button
                    fullWidth
                    variant="contained"
                    color="primary"
                    startIcon={<AutoAwesomeIcon />}
                    onClick={handleAutoAllocate}
                    disabled={!policyId || loading}
                    sx={{ height: 40 }}
                    title="FR-7: Auto-allocate risk using treaty rules"
                  >
                    Auto
                  </Button>
                </Grid>
                <Grid item xs={12} sm={4}>
                  <Button
                    fullWidth
                    variant="outlined"
                    color="warning"
                    startIcon={<CalculateIcon />}
                    onClick={validateAllocation}
                    disabled={!policyId || allocations.length === 0 || loading}
                    sx={{ height: 40 }}
                    title="FR-8: Validate allocation against limits"
                  >
                    Validate
                  </Button>
                </Grid>
              </Grid>
            </Grid>
          </Grid>

          {loading && (
            <Box textAlign="center" mt={3}><Loader /></Box>
          )}
          
          {!!successMessage && !loading && (
            <Alert severity="success" sx={{ mt: 3 }}>{successMessage}</Alert>
          )}
          
          {!!message && !loading && (
            <Alert severity="info" sx={{ mt: 3 }}>{message}</Alert>
          )}
          
          {!!error && !loading && (
            <Alert severity="error" sx={{ mt: 3 }}>{error}</Alert>
          )}

          {/* FR-9: Display Exposure Data */}
          {exposureData && !loading && (
            <Grid container spacing={2} sx={{ mt: 2 }}>
              <Grid item xs={12} sm={6} md={3}>
                <Card sx={{ backgroundColor: '#f0f7ff' }}>
                  <CardContent>
                    <Typography color="textSecondary" gutterBottom>
                      Total Exposure
                    </Typography>
                    <Typography variant="h6" fontWeight={700}>
                      {convertToCurrency(exposureData.totalExposure)}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Card sx={{ backgroundColor: '#e8f5e9' }}>
                  <CardContent>
                    <Typography color="textSecondary" gutterBottom>
                      Retained (Insurer)
                    </Typography>
                    <Typography variant="h6" fontWeight={700}>
                      {convertToCurrency(exposureData.retainedAmount)}
                    </Typography>
                    <Chip label={`${exposureData.retainedPercentage}%`} size="small" color="success" sx={{ mt: 1 }} />
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Card sx={{ backgroundColor: '#fff3e0' }}>
                  <CardContent>
                    <Typography color="textSecondary" gutterBottom>
                      Ceded (Reinsurer)
                    </Typography>
                    <Typography variant="h6" fontWeight={700}>
                      {convertToCurrency(exposureData.cededAmount)}
                    </Typography>
                    <Chip label={`${exposureData.cededPercentage}%`} size="small" color="warning" sx={{ mt: 1 }} />
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Card sx={{ backgroundColor: '#f3e5f5' }}>
                  <CardContent>
                    <Typography color="textSecondary" gutterBottom>
                      Treaties Applied
                    </Typography>
                    <Typography variant="h6" fontWeight={700}>
                      {exposureData.treatyCount}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          )}

          {!loading && allocations.length > 0 && (
            <Box mt={4}>
              <Typography variant="h6" fontWeight={600} gutterBottom>Allocation Details</Typography>
              <TableContainer>
                <Table aria-label="allocations table">
                  <TableHead>
                    <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                      <TableCell sx={{ fontWeight: 'bold' }}>Reinsurer</TableCell>
                      <TableCell sx={{ fontWeight: 'bold' }}>Treaty</TableCell>
                      <TableCell sx={{ fontWeight: 'bold' }}>Retention Limit (FR-8)</TableCell>
                      <TableCell sx={{ fontWeight: 'bold' }}>Treaty Limit (FR-8)</TableCell>
                      <TableCell sx={{ fontWeight: 'bold' }}>Allocated Amount</TableCell>
                      <TableCell sx={{ fontWeight: 'bold' }}>Allocated %</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {allocations.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} align="center" sx={{ py: 3 }}>
                          <Typography color="textSecondary">No allocations found</Typography>
                        </TableCell>
                      </TableRow>
                    ) : (
                      allocations.map((allocation) => {
                        const a = allocation.allocations[0];
                        return (
                          <TableRow key={allocation._id} sx={{ '&:hover': { backgroundColor: '#fafafa' } }}>
                            <TableCell>{a.reinsurerId.name} ({a.reinsurerId.code})</TableCell>
                            <TableCell>{a.treatyId.treatyName}</TableCell>
                            <TableCell>{convertToCurrency(a.treatyId.retentionLimit)}</TableCell>
                            <TableCell>{convertToCurrency(a.treatyId.treatyLimit)}</TableCell>
                            <TableCell>{convertToCurrency(a.allocatedAmount)}</TableCell>
                            <TableCell>{a.allocatedPercentage}%</TableCell>
                          </TableRow>
                        );
                      })
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            </Box>
          )}
        </Paper>
      </Box>
    </AppShell>
  );
}
