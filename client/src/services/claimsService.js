import api from './apiClient';

export default {
  // Get all claims
  list: () => api.get('/claims').then(r => r.data),

  // Get single claim by ID
  getById: (id) => api.get(`/claims/${id}`).then(r => r.data),

  // Create new claim
  create: (data) => api.post('/claims', data).then(r => r.data),

  // Update claim
  update: (id, data) => api.put(`/claims/${id}`, data).then(r => r.data),

  // Delete claim
  delete: (id) => api.delete(`/claims/${id}`).then(r => r.data),

  // Get claim documents
  getDocuments: (claimId) => api.get(`/claims/${claimId}/documents`).then(r => r.data),

  // Upload claim document
  uploadDocument: (claimId, formData) => 
    api.post(`/claims/${claimId}/documents`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    }).then(r => r.data),

  // Add claim note
  addNote: (claimId, noteText) => 
    api.post(`/claims/${claimId}/notes`, { text: noteText }).then(r => r.data),

  // Update claim status
  updateStatus: (id, status) => 
    api.put(`/claims/${id}/status`, { status }).then(r => r.data),
};
