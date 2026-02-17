
import api from './apiClient';

export const policyService = {
  // GET endpoints
  list: (params = {}) => api.get('/policies', { params }).then(r => r.data),
  getById: (id) => api.get(`/policies/${id}`).then(r => r.data),
  getAuditLog: (id) => api.get(`/policies/${id}/audit-log`).then(r => r.data),

  // POST endpoints
  create: (payload) => api.post('/policies', payload).then(r => r.data),
  approve: (id) => api.post(`/policies/${id}/approve`).then(r => r.data),

  // PUT endpoints
  update: (id, payload) => api.put(`/policies/${id}`, payload).then(r => r.data),
  // calculateExposure: (payload) =>
  //   api.post("/policies/exposure", payload).then((r) => r.data),
  // Calculate exposure and retention (if needed)
  calculateExposure: (payload) => api.post('/policies/calculate-exposure', payload).then(r => r.data),
};