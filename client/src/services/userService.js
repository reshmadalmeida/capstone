import api from './apiClient';

export default {
  // Get all users
  list: () => api.get('/users').then(r => r.data),

  // Create new user
  create: (data) => api.post('/users/create', data).then(r => r.data),

  // Update user
  update: (id, data) => api.put(`/users/${id}`, data).then(r => r.data),

  // Delete user
  delete: (id) => api.delete(`/users/${id}`).then(r => r.data),
};
