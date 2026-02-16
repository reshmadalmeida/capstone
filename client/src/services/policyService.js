import api from './apiClient';

export const policyService = {
  // GET endpoints
  list: (params = {}) => api.get('/policies', { params }).then(r => r.data),
  getById: (id) => api.get(`/policies/${id}`).then(r => r.data),
  getAuditLog: (id) => api.get(`/policies/${id}/audit-log`).then(r => r.data),
  
  // POST endpoints
  create: (payload) => api.post('/policies', payload).then(r => r.data),
  
  // PUT endpoints (policy actions)
  saveDraft: (id, payload) => api.put(`/policies/${id}`, { ...payload, status: 'DRAFT' }).then(r => r.data),
  submit: (id, payload) => api.put(`/policies/${id}/submit`, payload).then(r => r.data),
  approve: (id, approvalNotes) => api.put(`/policies/${id}/approve`, { approvalNotes }).then(r => r.data),
  reject: (id, rejectionReason) => api.put(`/policies/${id}/reject`, { rejectionReason }).then(r => r.data),
  
  // Calculate exposure and retention
  calculateExposure: (payload) => api.post('/policies/calculate-exposure', payload).then(r => r.data),
};