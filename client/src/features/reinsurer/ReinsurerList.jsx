

import { useEffect, useState } from "react";
import Loader from "../../shared/Loader";
import ReinsurerForm from "./ReinsurerForm";
import { useAuth } from "../../hooks/useAuth";
// Ensure the correct import path for isAllowed utility
import { isAllowed } from "../../common/utils";
import AppShell from "../../layout/AppShell";
import { Box, Button, Typography, Paper, IconButton, Chip, TableContainer, Table, TableHead, TableBody, TableRow, TableCell } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import ConfirmDialog from "../../shared/ConfirmDialog";
import reinsuranceService from "../../services/reinsuranceService";
import { REINSURER_ANALYST_LINKS } from "../../app/constants";


export default function ReinsurerList() {
  const [reinsurers, setReinsurers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [showDeleteConfirmModal, setShowDeleteConfirmModal] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);

  const { loggedInUser } = useAuth();
  const isCreateAllowed = isAllowed(loggedInUser?.user?.permissions, "CREATE");
  const isEditAllowed = isAllowed(loggedInUser?.user?.permissions, "UPDATE");
  const isDeleteAllowed = isAllowed(loggedInUser?.user?.permissions, "DELETE");

  const fetchReinsurers = async () => {
    try {
      setLoading(true);
      const res = await reinsuranceService.getReinsurers();
      setReinsurers(res);
    } catch {
      setError("Failed to fetch reinsurers.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReinsurers();
  }, []);

  const onCreate = () => {
    setSelectedItem(null);
    setShowModal(true);
  };

  const onEdit = (item) => {
    setSelectedItem(item);
    setShowModal(true);
  };

  const onDeleteClick = (item) => {
    setItemToDelete(item);
    setShowDeleteConfirmModal(true);
  };

  const confirmDelete = async () => {
    try {
      await reinsuranceService.deleteReinsurer(itemToDelete._id);
      fetchReinsurers();
    } catch (error) {
      setError(error.message || "Failed to delete reinsurer.");
    } finally {
      setShowDeleteConfirmModal(false);
      setItemToDelete(null);
    }
  };

  const cancelDelete = () => {
    setShowDeleteConfirmModal(false);
    setItemToDelete(null);
  };

  const onModalClose = (reload = false) => {
    setShowModal(false);
    setSelectedItem(null);
    if (reload) fetchReinsurers();
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
              <Typography variant="h5" fontWeight={600} gutterBottom>Reinsurers</Typography>
              <Typography variant="body2" color="text.secondary">
                Manage reinsurer profiles and ratings
              </Typography>
            </Box>
            {isCreateAllowed && (
              <Button variant="contained" color="success" startIcon={<AddIcon />} onClick={onCreate}>
                Create Reinsurer
              </Button>
            )}
          </Box>
        </Paper>
        <Paper elevation={1} sx={{ p: 2 }}>
          <TableContainer>
            <Table aria-label="reinsurers table">
              <TableHead>
                <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                  <TableCell sx={{ fontWeight: 'bold' }}>Code</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Name</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Country</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Rating</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Status</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 'bold' }}>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {reinsurers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} align="center" sx={{ py: 3 }}>
                      <Typography color="textSecondary">No reinsurers found</Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  reinsurers.map((reinsurer) => (
                    <TableRow key={reinsurer._id} sx={{ '&:hover': { backgroundColor: '#fafafa' } }}>
                      <TableCell>{reinsurer.code}</TableCell>
                      <TableCell>{reinsurer.name}</TableCell>
                      <TableCell>{reinsurer.country}</TableCell>
                      <TableCell>
                        <Chip label={reinsurer.rating} color="default" size="small" />
                      </TableCell>
                      <TableCell>
                        <Chip 
                          label={reinsurer.status} 
                          color={reinsurer.status === 'ACTIVE' ? 'success' : reinsurer.status === 'INACTIVE' ? 'default' : 'warning'} 
                          size="small" 
                        />
                      </TableCell>
                      <TableCell align="right">
                        {isEditAllowed && (
                          <IconButton 
                            color="success" 
                            onClick={() => onEdit(reinsurer)} 
                            title="Edit"
                            size="small"
                          >
                            <EditIcon />
                          </IconButton>
                        )}
                        {isDeleteAllowed && (
                          <IconButton 
                            color="error" 
                            onClick={() => onDeleteClick(reinsurer)} 
                            title="Delete"
                            size="small"
                          >
                            <DeleteIcon />
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
      <ReinsurerForm
        onClose={onModalClose}
        showModal={showModal}
        reinsurerData={selectedItem}
      />
      <ConfirmDialog
        showModal={showDeleteConfirmModal}
        title="Delete Reinsurer"
        message={`Are you sure you want to delete this reinsurer?`}
        onConfirm={confirmDelete}
        onCancel={cancelDelete}
      />
    </AppShell>
  );
}
