import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  CircularProgress,
  Alert,
  Typography,
  Stack,
} from '@mui/material';

import userService from '../../services/userService';

const ROLES = [
  { value: 'ADMIN', label: 'Administrator' },
  { value: 'UNDERWRITER', label: 'Underwriter' },
  { value: 'CLAIMS_ADJUSTER', label: 'Claims Adjuster' },
  { value: 'REINSURANCE_ANALYST', label: 'Reinsurance Analyst' },
];

const ROLE_DISPLAY_NAMES = {
  'ADMIN': 'Administrator',
  'UNDERWRITER': 'Underwriter',
  'CLAIMS_ADJUSTER': 'Claims Adjuster',
  'REINSURANCE_ANALYST': 'Reinsurance Analyst',
};

export default function UserList() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [openForm, setOpenForm] = useState(false);
  const [openDeleteConfirm, setOpenDeleteConfirm] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    role: 'UNDERWRITER',
  });
  const [formErrors, setFormErrors] = useState({});

  // Fetch users on mount
  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await userService.list();
      setUsers(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const validateForm = () => {
    const errors = {};
    if (!formData.username.trim()) errors.username = 'Username is required';
    if (!formData.email.trim()) errors.email = 'Email is required';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) errors.email = 'Invalid email';
    if (!selectedUser && !formData.password) errors.password = 'Password is required for new users';
    if (!formData.role) errors.role = 'Role is required';
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleOpenForm = (user = null) => {
    if (user) {
      setSelectedUser(user);
      setFormData({
        username: user.username,
        email: user.email,
        password: '',
        role: user.role,
      });
    } else {
      setSelectedUser(null);
      setFormData({
        username: '',
        email: '',
        password: '',
        role: 'UNDERWRITER',
      });
    }
    setFormErrors({});
    setOpenForm(true);
  };

  const handleCloseForm = () => {
    setOpenForm(false);
    setSelectedUser(null);
    setFormData({ username: '', email: '', password: '', role: 'UNDERWRITER' });
    setFormErrors({});
  };

  const handleSaveUser = async () => {
    if (!validateForm()) return;

    try {
      setLoading(true);
      setError('');
      const payload = {
        username: formData.username,
        email: formData.email,
        role: formData.role,
      };

      // Only include password if provided (for create or password change)
      if (formData.password) {
        payload.password = formData.password;
      }

      if (selectedUser) {
        // Update existing user
        await userService.update(selectedUser._id, payload);
        setSuccess('User updated successfully');
      } else {
        // Create new user
        await userService.create(payload);
        setSuccess('User created successfully');
      }

      handleCloseForm();
      await fetchUsers();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to save user');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteClick = (user) => {
    setSelectedUser(user);
    setOpenDeleteConfirm(true);
  };

  const handleConfirmDelete = async () => {
    try {
      setLoading(true);
      setError('');
      // console.log("Deleting user id:", selectedUser?._id, selectedUser?.id);
      await userService.delete(selectedUser._id);
      setSuccess('User deleted successfully');
      setOpenDeleteConfirm(false);
      setSelectedUser(null);
      await fetchUsers();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to delete user');
    } finally {
      setLoading(false);
    }
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Clear error for this field when user starts typing
    if (formErrors[name]) {
      setFormErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
        <Typography variant="h5" sx={{ fontWeight: 600 }}>
          User Management
        </Typography>
        <Button
          variant="contained"
          color="primary"
          onClick={() => handleOpenForm()}
          disabled={loading}
        >
          + Create User
        </Button>
      </Stack>

      {/* Alerts */}
      {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>{error}</Alert>}
      {success && <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess('')}>{success}</Alert>}

      {/* Loading */}
      {loading && !openForm ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
          <CircularProgress />
        </Box>
      ) : (
        /* Users Table */
        <TableContainer component={Paper}>
          <Table>
            <TableHead sx={{ backgroundColor: '#f5f5f5' }}>
              <TableRow>
                <TableCell sx={{ fontWeight: 600 }}>Username</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Email</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Role</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {users.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} align="center" sx={{ py: 4, color: '#999' }}>
                    No users found
                  </TableCell>
                </TableRow>
              ) : (
                users.map(user => (
                  <TableRow key={user.id} hover>
                    <TableCell>{user.username}</TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>{ROLE_DISPLAY_NAMES[user.role] || user.role}</TableCell>
                    <TableCell>
                      <Stack direction="row" spacing={1}>
                        <Button size="small" color="primary" onClick={() => handleOpenForm(user)}>Edit</Button>
                        <Button size="small"
                          color="error"
                          onClick={() => handleDeleteClick(user)}>Delete</Button>

                      </Stack>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Create/Edit User Form Dialog */}
      <Dialog open={openForm} onClose={handleCloseForm} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 600 }}>
          {selectedUser ? 'Edit User' : 'Create New User'}
        </DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          <Stack spacing={2}>
            <TextField
              label="Username"
              name="username"
              value={formData.username}
              onChange={handleFormChange}
              error={Boolean(formErrors.username)}
              helperText={formErrors.username}
              fullWidth
              disabled={loading}
            />
            <TextField
              label="Email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleFormChange}
              error={Boolean(formErrors.email)}
              helperText={formErrors.email}
              fullWidth
              disabled={loading}
            />
            {!selectedUser && (
              <TextField
                label="Password"
                name="password"
                type="password"
                value={formData.password}
                onChange={handleFormChange}
                error={Boolean(formErrors.password)}
                helperText={formErrors.password || 'Required for new users'}
                fullWidth
                disabled={loading}
              />
            )}
            {selectedUser && (
              <TextField
                label="New Password (optional)"
                name="password"
                type="password"
                value={formData.password}
                onChange={handleFormChange}
                placeholder="Leave blank to keep current password"
                fullWidth
                disabled={loading}
              />
            )}
            <TextField
              select
              label="Role"
              name="role"
              value={formData.role}
              onChange={handleFormChange}
              error={Boolean(formErrors.role)}
              helperText={formErrors.role}
              fullWidth
              disabled={loading}
            >
              {ROLES.map(role => (
                <MenuItem key={role.value} value={role.value}>
                  {role.label}
                </MenuItem>
              ))}
            </TextField>
          </Stack>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={handleCloseForm} disabled={loading}>
            Cancel
          </Button>
          <Button
            onClick={handleSaveUser}
            variant="contained"
            disabled={loading}
          >
            {loading ? <CircularProgress size={24} /> : (selectedUser ? 'Update' : 'Create')}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={openDeleteConfirm} onClose={() => setOpenDeleteConfirm(false)}>
        <DialogTitle sx={{ fontWeight: 600 }}>Delete User?</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete <strong>{selectedUser?.username}</strong>? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setOpenDeleteConfirm(false)} disabled={loading}>
            Cancel
          </Button>
          <Button
            onClick={handleConfirmDelete}
            variant="contained"
            color="error"
            disabled={loading}
          >
            {loading ? <CircularProgress size={24} /> : 'Delete'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
