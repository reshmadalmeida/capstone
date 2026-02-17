import api from './apiClient';

export const reinsuranceService = {
	// Treaty CRUD
	listTreaties: (params = {}) => api.get('/treaties', { params }).then(r => r.data),
	getTreatyById: (id) => api.get(`/treaties/${id}`).then(r => r.data),
	createTreaty: (payload) => api.post('/treaties/create', payload).then(r => r.data),
	updateTreaty: (id, payload) => api.put(`/treaties/${id}`, payload).then(r => r.data),
	deleteTreaty: (id) => api.delete(`/treaties/${id}`).then(r => r.data),

	// Reinsurer CRUD
	listReinsurers: (params = {}) => api.get('/reinsurers', { params }).then(r => r.data),
	getReinsurerById: (id) => api.get(`/reinsurers/${id}`).then(r => r.data),
	createReinsurer: (payload) => api.post('/reinsurers/create', payload).then(r => r.data),
	updateReinsurer: (id, payload) => api.put(`/reinsurers/${id}`, payload).then(r => r.data),
	deleteReinsurer: (id) => api.delete(`/reinsurers/${id}`).then(r => r.data),

	// Risk Allocations
	getRiskAllocations: (policyNumber) => api.get(`/risk-allocations/${policyNumber}`).then(r => r.data),
	listAllocations: () => api.get('/risk-allocations').then(r => r.data),
	
	// FR-7: Automatic risk allocation using treaty rules
	allocateRisk: (policyNumber) => api.post(`/risk-allocations/allocate/${policyNumber}`).then(r => r.data),
	
	// FR-8 & FR-9: Enforce limits and calculate exposures
	validateAllocation: (allocationData) => api.post('/risk-allocations/validate', allocationData).then(r => r.data),
	calculateExposure: (policyNumber) => api.post(`/risk-allocations/calculate-exposure/${policyNumber}`).then(r => r.data),

	// Treaty Configs
	listTreatyConfigs: () => api.get('/treaties/configs').then(r => r.data),
	updateTreatyConfig: (id, payload) => api.put(`/treaties/configs/${id}`, payload).then(r => r.data),

	// Exposure calculation utilities (client-side)
	calculateRetainedExposure: (sumInsured, cededAmount) => sumInsured - cededAmount,
	calculateCededExposure: (allocations) => allocations.reduce((sum, a) => sum + a.allocatedAmount, 0),
	calculateCededPercentage: (cededAmount, sumInsured) => sumInsured > 0 ? ((cededAmount / sumInsured) * 100).toFixed(2) : 0,
	calculateRetainedPercentage: (retainedAmount, sumInsured) => sumInsured > 0 ? ((retainedAmount / sumInsured) * 100).toFixed(2) : 0,

};

export default reinsuranceService;
