import api from './apiClient';

export const treatyService = {
  // Treaty CRUD
  list: (params = {}) => api.get('/treaties', { params }).then(r => r.data),
  getById: (id) => api.get(`/treaties/${id}`).then(r => r.data),
  create: (payload) => api.post('/treaties/create', payload).then(r => r.data),
  update: (id, payload) => api.put(`/treaties/${id}`, payload).then(r => r.data),
  delete: (id) => api.delete(`/treaties/${id}`).then(r => r.data),

  // Risk Allocations
  getRiskAllocations: (policyId) => api.get(`/risk-allocations/${policyId}`).then(r => r.data),
  listAllocations: () => api.get('/risk-allocations').then(r => r.data),

  // Treaty Configs
  listConfigs: () => api.get('/treaties/configs').then(r => r.data),
  updateConfig: (id, payload) => api.put(`/treaties/configs/${id}`, payload).then(r => r.data),
};
