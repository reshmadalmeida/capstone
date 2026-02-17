import { useEffect, useState } from "react";
import api from "../../services/apiClient";
import Loader from "../../shared/Loader";
import TreatyForm from "./TreatyForm";
import { useAuth } from "../../hooks/useAuth";
import { isAllowed, toDDMMMYYYY, convertToCurrency } from "../../common/utils";
import AppShell from "../../layout/AppShell";
import { REINSURER_ANALYST_LINKS } from "../../app/constants";
import { Box, Button, Typography, Paper, IconButton, Chip, TableContainer, Table, TableHead, TableBody, TableRow, TableCell } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';

export default function TreatyList() {
  const [treaties, setTreaties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);

  const { loggedInUser } = useAuth();

  const isCreateAllowed = isAllowed(loggedInUser?.user?.permissions, "CREATE");
  const isEditAllowed = isAllowed(loggedInUser?.user?.permissions, "UPDATE");

  const fetchTreaties = async () => {
    try {
      setLoading(true);
      const res = await api.get("/treaties");
      setTreaties(res.data);
    } catch {
      setError("Failed to fetch treaties.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTreaties();
  }, []);

  const onCreate = () => {
    setSelectedItem(null);
    setShowModal(true);
  };

  const onEdit = (item) => {
    setSelectedItem(item);
    setShowModal(true);
  };

  if (loading) return <Loader />;
  if (error) return (
    <Box p={4} textAlign="center">
      <Typography color="error">{error}</Typography>
    </Box>
  );

  return (
    <AppShell links={REINSURER_ANALYST_LINKS}>
      <Box sx={{ p: 4 }}>
        <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Box>
              <Typography variant="h5" fontWeight={600} gutterBottom>Treaties</Typography>
              <Typography variant="body2" color="text.secondary">
                Manage reinsurance treaty configurations
              </Typography>
            </Box>
            {isCreateAllowed && (
              <Button variant="contained" color="success" startIcon={<AddIcon />} onClick={onCreate}>
                Create Treaty
              </Button>
            )}
          </Box>
        </Paper>
        <Paper elevation={1} sx={{ p: 2 }}>
          <TableContainer>
            <Table aria-label="treaties table">
              <TableHead>
                <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                  <TableCell sx={{ fontWeight: 'bold' }}>Treaty Name</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Type</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Reinsurer</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Share %</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Retention Limit</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Treaty Limit</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Effective From</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Effective To</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Status</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 'bold' }}>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {treaties.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={10} align="center" sx={{ py: 3 }}>
                      <Typography color="textSecondary">No treaties found</Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  treaties.map((treaty) => (
                    <TableRow key={treaty._id} sx={{ '&:hover': { backgroundColor: '#fafafa' } }}>
                      <TableCell>{treaty.treatyName}</TableCell>
                      <TableCell>{treaty.treatyType}</TableCell>
                      <TableCell>{treaty.reinsurerId?.code}</TableCell>
                      <TableCell>{treaty.sharePercentage || '—'}%</TableCell>
                      <TableCell>{convertToCurrency(treaty.retentionLimit)}</TableCell>
                      <TableCell>{convertToCurrency(treaty.treatyLimit)}</TableCell>
                      <TableCell>{toDDMMMYYYY(treaty.effectiveFrom)}</TableCell>
                      <TableCell>{toDDMMMYYYY(treaty.effectiveTo)}</TableCell>
                      <TableCell>
                        <Chip 
                          label={treaty.status} 
                          color={treaty.status === 'ACTIVE' ? 'success' : treaty.status === 'EXPIRED' ? 'default' : 'warning'} 
                          size="small" 
                        />
                      </TableCell>
                      <TableCell align="right">
                        {isEditAllowed && treaty.status !== 'EXPIRED' && (
                          <IconButton 
                            color="success" 
                            onClick={() => onEdit(treaty)} 
                            title="Edit"
                            size="small"
                          >
                            <EditIcon />
                          </IconButton>
                        )}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      </Box>
      <TreatyForm
        onClose={(reload) => {
          setShowModal(false);
          if (reload) fetchTreaties();
        }}
        showModal={showModal}
        treatyData={selectedItem}
      />
    </AppShell>
  );
}
