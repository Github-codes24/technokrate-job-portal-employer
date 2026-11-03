import axiosInstance from './axiosInstance';

/**
 * Staffing (Sales Member) API Services
 */
export const staffingApi = {
  // 1.1 Create Staffing
  createStaffing: (data) => axiosInstance.post('/api/admin/staffing/create', data),

  // 1.2 Get All Staffing
  getAllStaffing: (params = {}) => axiosInstance.get('/api/admin/staffing', { params }),

  // 1.3 Staffing Stats
  getStaffingStats: () => axiosInstance.get('/api/admin/staffing/stats'),

  // 1.4 Get Single Staffing
  getSingleStaffing: (staffingId) => axiosInstance.get(`/api/admin/staffing/${staffingId}`),

  // 1.5 Update Staffing
  updateStaffing: (staffingId, data) => axiosInstance.put(`/api/admin/staffing/${staffingId}`, data),

  // 1.6 Toggle Active/Inactive
  toggleStaffingStatus: (staffingId, data) => axiosInstance.patch(`/api/admin/staffing/${staffingId}/status`, data),

  // 1.7 Approve Staffing
  approveStaffing: (staffingId) => axiosInstance.put(`/api/admin/staffing/${staffingId}/approve`),

  // 1.8 Reject Staffing
  rejectStaffing: (staffingId) => axiosInstance.put(`/api/admin/staffing/${staffingId}/reject`),

  // 1.9 Delete Staffing (soft delete + cascade)
  deleteStaffing: (staffingId) => axiosInstance.delete(`/api/admin/staffing/${staffingId}`),
};

/**
 * Companies Onboarded API Services
 */
export const companyOnboardingApi = {
  // 2.1 Add Company under Staffing
  addCompany: (staffingId, data) => axiosInstance.post(`/api/admin/staffing/${staffingId}/companies`, data),

  // 2.2 List Companies under Staffing
  listCompanies: (staffingId, params = {}) => axiosInstance.get(`/api/admin/staffing/${staffingId}/companies`, { params }),

  // 2.3 Company Stats
  getCompanyStats: (staffingId) => axiosInstance.get(`/api/admin/staffing/${staffingId}/companies/stats`),

  // 2.4 Get Single Company
  getSingleCompany: (companyId) => axiosInstance.get(`/api/admin/staffing/companies/${companyId}`),

  // 2.5 Update Company Status
  updateCompanyStatus: (companyId, data) => axiosInstance.patch(`/api/admin/staffing/companies/${companyId}/status`, data),

  // 2.6 Update Company
  updateCompany: (companyId, data) => axiosInstance.put(`/api/admin/staffing/companies/${companyId}`, data),

  // 2.7 Delete Company
  deleteCompany: (companyId) => axiosInstance.delete(`/api/admin/staffing/companies/${companyId}`),
};

/**
 * Jobs Under Company API Services
 */
export const companyJobApi = {
  // 3.1 Add Job under Company
  addJob: (companyId, data) => axiosInstance.post(`/api/admin/staffing/companies/${companyId}/jobs`, data),

  // 3.2 Get Company Jobs
  getCompanyJobs: (companyId) => axiosInstance.get(`/api/admin/staffing/companies/${companyId}/jobs`),

  // 3.3 Get Single Job
  getSingleJob: (jobId) => axiosInstance.get(`/api/admin/staffing/jobs/${jobId}`),

  // 3.4 Update Job
  updateJob: (jobId, data) => axiosInstance.put(`/api/admin/staffing/jobs/${jobId}`, data),

  // 3.5 Delete Job
  deleteJob: (jobId) => axiosInstance.delete(`/api/admin/staffing/jobs/${jobId}`),
};

/**
 * Current Vacancies API Services
 */
export const vacancyApi = {
  // 4.1 Vacancy List
  getVacancies: (params = {}) => axiosInstance.get('/api/admin/vacancies', { params }),

  // 4.2 Vacancy Stats
  getVacancyStats: () => axiosInstance.get('/api/admin/vacancies/stats'),
};
