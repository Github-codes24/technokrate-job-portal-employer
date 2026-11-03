import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { staffingApi, companyOnboardingApi, companyJobApi } from "../../../api/staffingAndVacancyApi";

// ─── 1. STAFFING THUNKS ───────────────────────────────────────────────────────

export const createStaffing = createAsyncThunk(
  "staffing/createStaffing",
  async (staffingData, { rejectWithValue }) => {
    try {
      const res = await staffingApi.createStaffing(staffingData);
      return res.data;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || "Failed to create staffing member"
      );
    }
  }
);

export const getAllStaffing = createAsyncThunk(
  "staffing/getAllStaffing",
  async (params = {}, { rejectWithValue }) => {
    try {
      const res = await staffingApi.getAllStaffing(params);
      return res.data;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || "Failed to fetch staffing members"
      );
    }
  }
);

export const getStaffingStats = createAsyncThunk(
  "staffing/getStaffingStats",
  async (_, { rejectWithValue }) => {
    try {
      const res = await staffingApi.getStaffingStats();
      return res.data;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || "Failed to fetch staffing stats"
      );
    }
  }
);

export const getSingleStaffing = createAsyncThunk(
  "staffing/getSingleStaffing",
  async (staffingId, { rejectWithValue }) => {
    try {
      const res = await staffingApi.getSingleStaffing(staffingId);
      return res.data;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || "Failed to fetch staffing details"
      );
    }
  }
);

export const updateStaffing = createAsyncThunk(
  "staffing/updateStaffing",
  async ({ staffingId, data }, { rejectWithValue }) => {
    try {
      const res = await staffingApi.updateStaffing(staffingId, data);
      return res.data;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || "Failed to update staffing"
      );
    }
  }
);

export const toggleStaffingStatus = createAsyncThunk(
  "staffing/toggleStaffingStatus",
  async ({ staffingId, data }, { rejectWithValue }) => {
    try {
      const res = await staffingApi.toggleStaffingStatus(staffingId, data);
      return { staffingId, data: res.data?.data || res.data };
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || "Failed to toggle status"
      );
    }
  }
);

export const approveStaffing = createAsyncThunk(
  "staffing/approveStaffing",
  async (staffingId, { rejectWithValue }) => {
    try {
      const res = await staffingApi.approveStaffing(staffingId);
      return { staffingId, data: res.data?.data || res.data };
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || "Failed to approve staffing"
      );
    }
  }
);

export const rejectStaffing = createAsyncThunk(
  "staffing/rejectStaffing",
  async (staffingId, { rejectWithValue }) => {
    try {
      const res = await staffingApi.rejectStaffing(staffingId);
      return { staffingId, data: res.data?.data || res.data };
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || "Failed to reject staffing"
      );
    }
  }
);

export const deleteStaffing = createAsyncThunk(
  "staffing/deleteStaffing",
  async (staffingId, { rejectWithValue }) => {
    try {
      await staffingApi.deleteStaffing(staffingId);
      return staffingId;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || "Failed to delete staffing"
      );
    }
  }
);

// ─── 2. COMPANIES ONBOARDED THUNKS ───────────────────────────────────────────

export const addCompany = createAsyncThunk(
  "staffing/addCompany",
  async ({ staffingId, data }, { rejectWithValue }) => {
    try {
      const res = await companyOnboardingApi.addCompany(staffingId, data);
      return res.data;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || "Failed to add company"
      );
    }
  }
);

export const listCompanies = createAsyncThunk(
  "staffing/listCompanies",
  async ({ staffingId, params = {} }, { rejectWithValue }) => {
    try {
      const res = await companyOnboardingApi.listCompanies(staffingId, params);
      return res.data;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || "Failed to list companies"
      );
    }
  }
);

export const getCompanyStats = createAsyncThunk(
  "staffing/getCompanyStats",
  async (staffingId, { rejectWithValue }) => {
    try {
      const res = await companyOnboardingApi.getCompanyStats(staffingId);
      return res.data;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || "Failed to fetch company stats"
      );
    }
  }
);

export const getSingleCompany = createAsyncThunk(
  "staffing/getSingleCompany",
  async (companyId, { rejectWithValue }) => {
    try {
      const res = await companyOnboardingApi.getSingleCompany(companyId);
      return res.data;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || "Failed to fetch company details"
      );
    }
  }
);

export const updateCompanyStatus = createAsyncThunk(
  "staffing/updateCompanyStatus",
  async ({ companyId, status }, { rejectWithValue }) => {
    try {
      const res = await companyOnboardingApi.updateCompanyStatus(companyId, { status });
      return { companyId, status, data: res.data?.data || res.data };
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || "Failed to update company status"
      );
    }
  }
);

export const updateCompany = createAsyncThunk(
  "staffing/updateCompany",
  async ({ companyId, data }, { rejectWithValue }) => {
    try {
      const res = await companyOnboardingApi.updateCompany(companyId, data);
      return { companyId, data: res.data?.data || res.data };
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || "Failed to update company"
      );
    }
  }
);

export const deleteCompany = createAsyncThunk(
  "staffing/deleteCompany",
  async (companyId, { rejectWithValue }) => {
    try {
      await companyOnboardingApi.deleteCompany(companyId);
      return companyId;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || "Failed to delete company"
      );
    }
  }
);

// ─── 3. JOBS UNDER COMPANY THUNKS ───────────────────────────────────────────

export const addCompanyJob = createAsyncThunk(
  "staffing/addCompanyJob",
  async ({ companyId, data }, { rejectWithValue }) => {
    try {
      const res = await companyJobApi.addJob(companyId, data);
      return res.data;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || "Failed to add job to company"
      );
    }
  }
);

export const getCompanyJobs = createAsyncThunk(
  "staffing/getCompanyJobs",
  async (companyId, { rejectWithValue }) => {
    try {
      const res = await companyJobApi.getCompanyJobs(companyId);
      return { companyId, jobs: res.data?.data || res.data };
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || "Failed to fetch company jobs"
      );
    }
  }
);

export const getSingleCompanyJob = createAsyncThunk(
  "staffing/getSingleCompanyJob",
  async (jobId, { rejectWithValue }) => {
    try {
      const res = await companyJobApi.getSingleJob(jobId);
      return res.data;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || "Failed to fetch job details"
      );
    }
  }
);

export const updateCompanyJob = createAsyncThunk(
  "staffing/updateCompanyJob",
  async ({ jobId, data }, { rejectWithValue }) => {
    try {
      const res = await companyJobApi.updateJob(jobId, data);
      return { jobId, data: res.data?.data || res.data };
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || "Failed to update job"
      );
    }
  }
);

export const deleteCompanyJob = createAsyncThunk(
  "staffing/deleteCompanyJob",
  async (jobId, { rejectWithValue }) => {
    try {
      await companyJobApi.deleteJob(jobId);
      return jobId;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || "Failed to delete job"
      );
    }
  }
);

// ─── INITIAL STATE ──────────────────────────────────────────────────────────

const initialState = {
  // Staffing List & Details
  staffingList: [],
  selectedStaffing: null,
  staffingStats: null,
  staffingPagination: {
    total: 0,
    page: 1,
    limit: 10,
    currentPage: 1,
    totalPages: 1,
    hasNextPage: false,
    hasPrevPage: false,
  },

  // Companies List & Details
  companies: [],
  selectedCompany: null,
  companyStats: null,
  companyPagination: {
    total: 0,
    currentPage: 1,
    limit: 10,
    totalPages: 1,
    hasNextPage: false,
    hasPrevPage: false,
  },

  // Jobs under Company
  companyJobs: [],
  selectedJob: null,

  // Async States
  loading: false,
  actionLoading: false,
  error: null,
};

// ─── SLICE ───────────────────────────────────────────────────────────────────

const staffingSlice = createSlice({
  name: "staffing",
  initialState,
  reducers: {
    clearStaffingError(state) {
      state.error = null;
    },
    clearSelectedStaffing(state) {
      state.selectedStaffing = null;
    },
    clearSelectedCompany(state) {
      state.selectedCompany = null;
    },
    clearSelectedJob(state) {
      state.selectedJob = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // 1. Staffing CRUD
      .addCase(getAllStaffing.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getAllStaffing.fulfilled, (state, action) => {
        state.loading = false;
        state.staffingList = action.payload?.data || [];
        if (action.payload?.pagination) {
          state.staffingPagination = action.payload.pagination;
        }
      })
      .addCase(getAllStaffing.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      .addCase(getStaffingStats.fulfilled, (state, action) => {
        state.staffingStats = action.payload?.data || action.payload;
      })

      .addCase(getSingleStaffing.fulfilled, (state, action) => {
        state.selectedStaffing = action.payload?.data || action.payload;
      })

      .addCase(createStaffing.pending, (state) => {
        state.actionLoading = true;
      })
      .addCase(createStaffing.fulfilled, (state, action) => {
        state.actionLoading = false;
        const newMember = action.payload?.data || action.payload;
        if (newMember) {
          state.staffingList = [newMember, ...state.staffingList];
          state.staffingPagination.total += 1;
        }
      })
      .addCase(createStaffing.rejected, (state, action) => {
        state.actionLoading = false;
        state.error = action.payload;
      })

      .addCase(updateStaffing.fulfilled, (state, action) => {
        state.actionLoading = false;
        const updated = action.payload?.data || action.payload;
        if (updated && updated._id) {
          state.staffingList = state.staffingList.map((item) =>
            item._id === updated._id ? { ...item, ...updated } : item
          );
        }
      })

      .addCase(toggleStaffingStatus.fulfilled, (state, action) => {
        const { staffingId, data } = action.payload;
        state.staffingList = state.staffingList.map((item) =>
          item._id === staffingId ? { ...item, ...data, isActive: data.isActive ?? !item.isActive } : item
        );
      })

      .addCase(approveStaffing.fulfilled, (state, action) => {
        const { staffingId, data } = action.payload;
        state.staffingList = state.staffingList.map((item) =>
          item._id === staffingId ? { ...item, status: "approved", ...data } : item
        );
      })

      .addCase(rejectStaffing.fulfilled, (state, action) => {
        const { staffingId, data } = action.payload;
        state.staffingList = state.staffingList.map((item) =>
          item._id === staffingId ? { ...item, status: "rejected", ...data } : item
        );
      })

      .addCase(deleteStaffing.fulfilled, (state, action) => {
        const id = action.payload;
        state.staffingList = state.staffingList.filter((item) => item._id !== id);
        state.staffingPagination.total = Math.max(0, state.staffingPagination.total - 1);
      })

      // 2. Companies CRUD
      .addCase(listCompanies.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(listCompanies.fulfilled, (state, action) => {
        state.loading = false;
        state.companies = action.payload?.data || [];
        if (action.payload?.pagination) {
          state.companyPagination = action.payload.pagination;
        }
      })
      .addCase(listCompanies.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      .addCase(addCompany.fulfilled, (state, action) => {
        const newCompany = action.payload?.data || action.payload;
        if (newCompany) {
          state.companies = [newCompany, ...state.companies];
          state.companyPagination.total += 1;
        }
      })

      .addCase(getCompanyStats.fulfilled, (state, action) => {
        state.companyStats = action.payload?.data || action.payload;
      })

      .addCase(getSingleCompany.fulfilled, (state, action) => {
        state.selectedCompany = action.payload?.data || action.payload;
      })

      .addCase(updateCompanyStatus.fulfilled, (state, action) => {
        const { companyId, status, data } = action.payload;
        state.companies = state.companies.map((comp) =>
          comp._id === companyId ? { ...comp, ...data, status } : comp
        );
      })

      .addCase(updateCompany.fulfilled, (state, action) => {
        const { companyId, data } = action.payload;
        state.companies = state.companies.map((comp) =>
          comp._id === companyId ? { ...comp, ...data } : comp
        );
      })

      .addCase(deleteCompany.fulfilled, (state, action) => {
        const id = action.payload;
        state.companies = state.companies.filter((c) => c._id !== id);
        state.companyPagination.total = Math.max(0, state.companyPagination.total - 1);
      })

      // 3. Jobs under Company
      .addCase(getCompanyJobs.fulfilled, (state, action) => {
        state.companyJobs = action.payload?.jobs || [];
      })

      .addCase(addCompanyJob.fulfilled, (state, action) => {
        const newJob = action.payload?.data || action.payload;
        if (newJob) {
          state.companyJobs = [newJob, ...state.companyJobs];
        }
      })

      .addCase(getSingleCompanyJob.fulfilled, (state, action) => {
        state.selectedJob = action.payload?.data || action.payload;
      })

      .addCase(updateCompanyJob.fulfilled, (state, action) => {
        const { jobId, data } = action.payload;
        state.companyJobs = state.companyJobs.map((j) =>
          j._id === jobId ? { ...j, ...data } : j
        );
      })

      .addCase(deleteCompanyJob.fulfilled, (state, action) => {
        const jobId = action.payload;
        state.companyJobs = state.companyJobs.filter((j) => j._id !== jobId);
      });
  },
});

export const {
  clearStaffingError,
  clearSelectedStaffing,
  clearSelectedCompany,
  clearSelectedJob,
} = staffingSlice.actions;

export default staffingSlice.reducer;
