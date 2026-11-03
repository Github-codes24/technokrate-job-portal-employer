import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axiosInstance from "../../../api/axiosInstance";

// ─── THUNKS ──────────────────────────────────────────────────────────────────

export const addJob = createAsyncThunk(
  "job/addJob",
  async (jobData, { rejectWithValue }) => {
    try {
      console.log("jobData", jobData);
      const res = await axiosInstance.post(
        "/api/job/addjob",
        jobData,
      );
      return res.data;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || "Failed to add job",
      );
    }
  },
);

export const getAllJobs = createAsyncThunk(
  "job/getAllJobs",
  async ({ page = 1, limit = 10, status, search, sort } = {}, { rejectWithValue }) => {
    try {
      const params = new URLSearchParams();
      if (page) params.append("page", page);
      if (limit) params.append("limit", limit);
      if (status && status !== "all") params.append("status", status.toLowerCase());
      if (search && search.trim()) params.append("search", search.trim());
      if (sort) params.append("sort", sort);

      const queryString = params.toString();
      const res = await axiosInstance.get(
        `/api/employer/jobs/getjob/byemployer${queryString ? `?${queryString}` : ""}`,
      );
      return res.data;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || "Failed to fetch jobs",
      );
    }
  },
);

export const updateJob = createAsyncThunk(
  "job/updateJob",
  async ({ id, jobData }, { rejectWithValue }) => {
    try {
      const res = await axiosInstance.put(
        `/api/employer/jobs/updatejob/${id}`,
        jobData,
      );
      return res.data;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || "Failed to update job",
      );
    }
  },
);

export const deleteJob = createAsyncThunk(
  "job/deleteJob",
  async (id, { rejectWithValue }) => {
    try {
      await axiosInstance.delete(`/api/employer/jobs/deletejob/${id}`);
      return id;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || "Failed to delete job",
      );
    }
  },
);

export const getApplicants = createAsyncThunk(
  "job/getApplicants",
  async ({ jobId, page = 1, limit = 10, filters = {} } = {}, { rejectWithValue }) => {
    try {
      const params = new URLSearchParams({ page, limit })
      // append filters
      Object.keys(filters || {}).forEach((k) => {
        const v = filters[k]
        if (v === undefined || v === null || v === '') return
        if (Array.isArray(v)) {
          v.forEach((val) => params.append(k, val))
        } else {
          params.append(k, v)
        }
      })

      const res = await axiosInstance.get(
        `/api/job/applicants/${jobId}?${params.toString()}`,
      );
      return res.data;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || "Failed to fetch applicants",
      );
    }
  },
);

export const getJobDetails = createAsyncThunk(
  "job/getJobDetails",
  async (id, { rejectWithValue }) => {
    try {
      const res = await axiosInstance.get(
        `/api/employer/jobs/jobdetails/${id}`,
      );
      const payload = res.data;
      const data = payload?.data;

      if (Array.isArray(data)) return data[0] ?? null;
      if (data && typeof data === "object") {
        if (Array.isArray(data.job)) return data.job[0] ?? null;
        if (Array.isArray(data.jobs)) return data.jobs[0] ?? null;
        if (Array.isArray(data.result)) return data.result[0] ?? null;
        return data.job ?? data.jobs ?? data.result ?? data;
      }

      return payload?.job ?? payload?.result ?? null;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || "Failed to fetch job details",
      );
    }
  },
);

export const getApplicantDetail = createAsyncThunk(
  "job/getApplicantDetail",
  async (jobseekerId, { rejectWithValue }) => {
    try {
      const res = await axiosInstance.get(
        `/api/job/getApplicantDetails/${jobseekerId}`,
      );
      return res.data.data ?? null;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || "Failed to fetch applicant details",
      );
    }
  },
);

export const getJobOptions = createAsyncThunk(
  "job/getJobOptions",
  async (_, { rejectWithValue }) => {
    try {
      const res = await axiosInstance.get("/api/employer/jobs/options");
      return res.data?.data || res.data;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || err.message || "Failed to fetch job options",
      );
    }
  },
);

export const getJobPostType = createAsyncThunk(
  "job/getJobPostType",
  async (_, { dispatch, rejectWithValue }) => {
    try {
      // Keep in sync with /api/employer/jobs/options
      dispatch(getJobOptions());

      let data = null;
      try {
        const res = await axiosInstance.get("/api/employer/jobs/jobPostTypes");
        data = res.data?.data?.jobPostTypes || res.data?.jobPostTypes || res.data?.data || res.data;
      } catch (e) {
        // Fallback to options if specific endpoint is nested
        const res = await axiosInstance.get("/api/employer/jobs/options");
        data = res.data?.data?.jobPostTypes || res.data?.jobPostTypes;
      }

      if (!Array.isArray(data)) {
        data = [];
      }

      const normalized = data.map((item) => ({
        value: item.value || item._id || item.id || '',
        label: item.label || item.name || 'Unknown',
        credit: Number(item.credit ?? item.credits ?? 0),
        ...item,
      }));

      return normalized;
    } catch (err) {
      // Fallback attempt
      try {
        const fallbackRes = await axiosInstance.get("/api/job/jobPostTypes");
        let data = fallbackRes.data?.data || fallbackRes.data?.jobPostTypes || fallbackRes.data;
        if (!Array.isArray(data)) data = [];
        return data.map((item) => ({
          value: item.value || item._id || item.id || '',
          label: item.label || item.name || 'Unknown',
          credit: Number(item.credit ?? item.credits ?? 0),
          ...item,
        }));
      } catch (fallbackErr) {
        return rejectWithValue(
          err.response?.data?.message || err.message || "Failed to fetch job post type",
        );
      }
    }
  },
);

export const updateApplicantStatusAsync = createAsyncThunk(
  "job/updateApplicantStatusAsync",
  async ({ applicantId, status, note }, { rejectWithValue }) => {
    try {
      const payload = { status }
      if (note !== undefined && note !== null && String(note).trim()) {
        payload.note = String(note).trim()
      }
      const res = await axiosInstance.put(
        `/api/job/applicant/updateStatus/${applicantId}`,
        payload
      );
      return { applicantId, status, note, data: res.data?.data, message: res.data?.message };
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || "Failed to update applicant status"
      );
    }
  }
);

export const getApplicantStatusHistory = createAsyncThunk(
  "job/getApplicantStatusHistory",
  async (applicationId, { rejectWithValue }) => {
    try {
      const res = await axiosInstance.get(
        `/api/job/applicants/${applicationId}/history`
      );
      return res.data?.data ?? res.data ?? [];
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || "Failed to fetch status history"
      );
    }
  }
);

export const getJobStatusCounts = createAsyncThunk(
  "job/getJobStatusCounts",
  async (_, { rejectWithValue }) => {
    try {
      const res = await axiosInstance.get("/api/employer/jobs/status-counts");
      return res.data?.data || res.data;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || "Failed to fetch job status counts",
      );
    }
  },
);

export const changeJobStatus = createAsyncThunk(
  "job/changeJobStatus",
  async ({ jobId, status }, { dispatch, rejectWithValue }) => {
    try {
      const res = await axiosInstance.put(
        `/api/employer/jobs/updateJobStatus/${jobId}`,
        { status }
      );
      dispatch(getJobStatusCounts());
      return { jobId, status, data: res.data?.data, message: res.data?.message };
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || "Failed to change job status"
      );
    }
  }
);

export const republishJob = createAsyncThunk(
  "job/republishJob",
  async ({ jobId, newExpireDate }, { rejectWithValue }) => {
    try {
      const res = await axiosInstance.put(
        `/api/employer/jobs/republishJob/${jobId}`,
        { newExpireDate }
      );
      return { jobId, newExpireDate, data: res.data?.data, message: res.data?.message };
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || "Failed to republish job"
      );
    }
  }
);

// ─── SLICE ───────────────────────────────────────────────────────────────────

const jobSlice = createSlice({
  name: "job",
  initialState: {
    // Employer Dashboard Jobs
    jobs: [],
    currentPage: 1,
    totalPages: 1,
    totalJobs: 0,

    // Job Post Types
    jobPostTypes: [],
    jobPostTypesLoading: false,
    jobPostTypeError: null, // ✅ FIX: Track job post type errors separately

    // Job Status Counts (/api/employer/jobs/status-counts)
    statusCounts: null,
    statusCountsLoading: false,
    statusCountsError: null,

    // Dynamic Job Options (/api/employer/jobs/options)
    jobOptions: {
      jobTypes: [],
      workModes: [],
      salaryTypes: [],
      jobLevels: [],
      educationLevels: [],
      experienceRanges: [],
      jobPostTypes: [],
    },
    jobOptionsLoading: false,
    jobOptionsError: null,

    // Single Job Detail
    jobDetail: null,
    jobDetailLoading: false,

    // Applicants Management
    applicants: [],
    applicantJobTitle: "",
    totalApplicants: 0,
    applicantsCurrentPage: 1,
    applicantsTotalPages: 1,

    // Applicant Specific Detail
    applicantDetail: null,
    applicantDetailLoading: false,
    applicantStatusHistory: [],
    applicantStatusHistoryLoading: false,

    // Global UI State
    loading: false,
    deleteLoading: false,
    statusUpdating: false,
    republishLoading: false,
    applicantStatusLoading: false,
    error: null,
  },
  reducers: {
    clearJobError(state) {
      state.error = null;
    },
    clearJobDetail(state) {
      state.jobDetail = null;
    },
    clearApplicants(state) {
      state.applicants = [];
      state.applicantJobTitle = "";
      state.totalApplicants = 0;
      state.applicantsCurrentPage = 1;
      state.applicantsTotalPages = 1;
    },
    clearApplicantStatusHistory(state) {
      state.applicantStatusHistory = [];
      state.applicantStatusHistoryLoading = false;
    },
    clearApplicantDetail(state) {
      state.applicantDetail = null;
      state.applicantDetailLoading = false;
    },
    updateApplicantStatus(state, action) {
      const { id, status } = action.payload;
      if (state.applicantDetail && (state.applicantDetail._id === id || state.applicantDetail.jobseekerId?._id === id)) {
        state.applicantDetail.status = status;
      }
      state.applicants = state.applicants.map((applicant) => {
        if (applicant._id === id || applicant.jobseekerId?._id === id) {
          return { ...applicant, status };
        }
        return applicant;
      });
    },
  },
  extraReducers: (builder) => {

    // ── addJob ──────────────────────────────────────────────────────────────
    builder
      .addCase(addJob.pending, (s) => {
        s.loading = true;
        s.error = null;
      })
      .addCase(addJob.fulfilled, (s, a) => {
        s.loading = false;

        if (a.payload.data?.length) {
          s.jobs = [a.payload.data[0], ...s.jobs];
          s.totalJobs += 1;
        }

        // Notification Add
        const oldNotifications = JSON.parse(
          localStorage.getItem("employerNotifications") || "[]"
        );

        const newNotification = {
          id: Date.now(),
          title: "Job Posted Successfully",
          desc: "Your job has been posted successfully.",
          time: new Date().toLocaleString(),
          type: "success",
          read: false,
        };

        localStorage.setItem(
          "employerNotifications",
          JSON.stringify([newNotification, ...oldNotifications])
        );

        window.dispatchEvent(new Event("notificationUpdated"));
      })
      .addCase(addJob.rejected, (s, a) => {
        s.loading = false;
        s.error = a.payload;
      });

    // ── getAllJobs ───────────────────────────────────────────────────────────
    builder
      .addCase(getAllJobs.pending, (s) => {
        s.loading = true;
        s.error = null;
      })
      .addCase(getAllJobs.fulfilled, (s, a) => {
        s.loading = false;
        s.jobs = a.payload.data ?? [];
        s.currentPage = a.payload.currentPage ?? 1;
        s.totalPages = a.payload.totalPages ?? 1;
        s.totalJobs = a.payload.totalJobs ?? 0;
      })
      .addCase(getAllJobs.rejected, (s, a) => {
        s.loading = false;
        s.error = a.payload;
      });

    // ── updateJob ────────────────────────────────────────────────────────────
    builder
      .addCase(updateJob.pending, (s) => {
        s.loading = true;
        s.error = null;
      })
      .addCase(updateJob.fulfilled, (s, a) => {
        s.loading = false;
        const u = Array.isArray(a.payload?.data) ? a.payload.data[0] : (a.payload?.data || a.payload?.job || a.payload);
        if (u && (u._id || u.id)) {
          const targetId = u._id || u.id;
          s.jobs = s.jobs.map((j) => ((j._id === targetId || j.id === targetId) ? u : j));
          if (s.jobDetail && (s.jobDetail._id === targetId || s.jobDetail.id === targetId)) {
            s.jobDetail = u;
          }
        }
      })
      .addCase(updateJob.rejected, (s, a) => {
        s.loading = false;
        s.error = a.payload;
      });

    // ── deleteJob ────────────────────────────────────────────────────────────
    builder
      .addCase(deleteJob.pending, (s) => {
        s.deleteLoading = true;
        s.error = null;
      })
      .addCase(deleteJob.fulfilled, (s, a) => {
        s.deleteLoading = false;
        s.jobs = s.jobs.filter((j) => j._id !== a.payload);
        s.totalJobs = Math.max(0, s.totalJobs - 1);
      })
      .addCase(deleteJob.rejected, (s, a) => {
        s.deleteLoading = false;
        s.error = a.payload;
      });

    // ── getApplicants ────────────────────────────────────────────────────────
    builder
      .addCase(getApplicants.pending, (s) => {
        s.loading = true;
        s.error = null;
      })
      .addCase(getApplicants.fulfilled, (s, a) => {
        s.loading = false;
        const payload = a.payload || {};
        s.applicants = payload.data ?? payload.applicants ?? [];
        s.applicantJobTitle = payload.jobTitle ?? "";
        const total = payload.totalApplicants ?? payload.total ?? payload.count ?? (Array.isArray(s.applicants) ? s.applicants.length : 0);
        const limit = payload.limit ?? 10;
        const calcTotalPages = Math.ceil(total / limit) || 1;
        s.totalApplicants = total;
        s.applicantsCurrentPage = payload.currentPage ?? payload.page ?? 1;
        s.applicantsTotalPages = payload.totalPages ?? calcTotalPages;
      })
      .addCase(getApplicants.rejected, (s, a) => {
        s.loading = false;
        s.error = a.payload;
      });

    // ── getJobDetails ────────────────────────────────────────────────────────
    builder
      .addCase(getJobDetails.pending, (s) => {
        s.jobDetailLoading = true;
        s.error = null;
      })
      .addCase(getJobDetails.fulfilled, (s, a) => {
        s.jobDetailLoading = false;
        s.jobDetail = a.payload;
      })
      .addCase(getJobDetails.rejected, (s, a) => {
        s.jobDetailLoading = false;
        s.error = a.payload;
      });

    // ── getApplicantDetail ───────────────────────────────────────────────────
    builder
      .addCase(getApplicantDetail.pending, (s) => {
        s.applicantDetailLoading = true;
        s.error = null;
        s.applicantDetail = null;
      })
      .addCase(getApplicantDetail.fulfilled, (s, a) => {
        s.applicantDetailLoading = false;
        s.applicantDetail = a.payload;
      })
      .addCase(getApplicantDetail.rejected, (s, a) => {
        s.applicantDetailLoading = false;
        s.error = a.payload;
      });

    // ── getJobOptions ────────────────────────────────────────────────────────
    builder
      .addCase(getJobOptions.pending, (s) => {
        s.jobOptionsLoading = true;
        s.jobOptionsError = null;
      })
      .addCase(getJobOptions.fulfilled, (s, a) => {
        s.jobOptionsLoading = false;
        const data = a.payload || {};
        s.jobOptions = {
          jobTypes: data.jobTypes || [],
          workModes: data.workModes || [],
          salaryTypes: data.salaryTypes || [],
          jobLevels: data.jobLevels || [],
          educationLevels: data.educationLevels || [],
          experienceRanges: data.experienceRanges || [],
          jobPostTypes: data.jobPostTypes || [],
        };
        // Also populate jobPostTypes if not already set
        if (data.jobPostTypes && Array.isArray(data.jobPostTypes) && data.jobPostTypes.length > 0) {
          s.jobPostTypes = data.jobPostTypes.map((item) => ({
            value: item.value || item._id || item.id || '',
            label: item.label || item.name || 'Unknown',
            credit: Number(item.credit ?? item.credits ?? 0),
            ...item,
          }));
        }
        s.jobOptionsError = null;
      })
      .addCase(getJobOptions.rejected, (s, a) => {
        s.jobOptionsLoading = false;
        s.jobOptionsError = a.payload;
      });

    // ── getJobStatusCounts ──────────────────────────────────────────────────
    builder
      .addCase(getJobStatusCounts.pending, (s) => {
        s.statusCountsLoading = true;
        s.statusCountsError = null;
      })
      .addCase(getJobStatusCounts.fulfilled, (s, a) => {
        s.statusCountsLoading = false;
        s.statusCounts = a.payload;
        s.statusCountsError = null;
      })
      .addCase(getJobStatusCounts.rejected, (s, a) => {
        s.statusCountsLoading = false;
        s.statusCountsError = a.payload;
      });

    // ── getJobPostType ───────────────────────────────────────────────────────
    builder
      .addCase(getJobPostType.pending, (s) => {
        s.jobPostTypesLoading = true;
        s.jobPostTypeError = null;
      })
      .addCase(getJobPostType.fulfilled, (s, a) => {
        s.jobPostTypesLoading = false;
        s.jobPostTypes = a.payload || [];
        s.jobPostTypeError = null;
      })
      .addCase(getJobPostType.rejected, (s, a) => {
        s.jobPostTypesLoading = false;
        s.jobPostTypeError = a.payload;
      });

    // ── updateApplicantStatusAsync ───────────────────────────────────────────
    builder
      .addCase(updateApplicantStatusAsync.pending, (s) => {
        s.applicantStatusLoading = true;
        s.error = null;
      })
      .addCase(updateApplicantStatusAsync.fulfilled, (s, a) => {
        s.applicantStatusLoading = false;
        const { applicantId, status, data } = a.payload;
        const updatedStatus = data?.status || status;

        if (
          s.applicantDetail &&
          (s.applicantDetail._id === applicantId ||
            s.applicantDetail.jobseekerId?._id === applicantId ||
            s.applicantDetail.id === applicantId)
        ) {
          s.applicantDetail = {
            ...s.applicantDetail,
            ...(data || {}),
            status: updatedStatus,
          };
        }

        s.applicants = s.applicants.map((app) => {
          if (
            app._id === applicantId ||
            app.jobseekerId?._id === applicantId ||
            app.id === applicantId
          ) {
            return {
              ...app,
              ...(data || {}),
              status: updatedStatus,
            };
          }
          return app;
        });
      })
      .addCase(updateApplicantStatusAsync.rejected, (s, a) => {
        s.applicantStatusLoading = false;
        s.error = a.payload;
      });

    // ── getApplicantStatusHistory ──────────────────────────────────────────
    builder
      .addCase(getApplicantStatusHistory.pending, (s) => {
        s.applicantStatusHistoryLoading = true;
      })
      .addCase(getApplicantStatusHistory.fulfilled, (s, a) => {
        s.applicantStatusHistoryLoading = false;
        s.applicantStatusHistory = Array.isArray(a.payload) ? a.payload : (a.payload?.history || a.payload?.data || []);
      })
      .addCase(getApplicantStatusHistory.rejected, (s, a) => {
        s.applicantStatusHistoryLoading = false;
      });

    // ── changeJobStatus ──────────────────────────────────────────────────────
    builder
      .addCase(changeJobStatus.pending, (s) => {
        s.statusUpdating = true;
        s.error = null;
      })
      .addCase(changeJobStatus.fulfilled, (s, a) => {
        s.statusUpdating = false;
        const { jobId, status, data } = a.payload;
        const updatedJob = data || {};
        const newStatus = updatedJob.status || status;

        s.jobs = s.jobs.map((j) => {
          if (j._id === jobId || j.id === jobId) {
            return {
              ...j,
              ...updatedJob,
              status: newStatus,
            };
          }
          return j;
        });

        if (s.jobDetail && (s.jobDetail._id === jobId || s.jobDetail.id === jobId)) {
          s.jobDetail = {
            ...s.jobDetail,
            ...updatedJob,
            status: newStatus,
          };
        }
      })
      .addCase(changeJobStatus.rejected, (s, a) => {
        s.statusUpdating = false;
        s.error = a.payload;
      });

    // ── republishJob ─────────────────────────────────────────────────────────
    builder
      .addCase(republishJob.pending, (s) => {
        s.republishLoading = true;
        s.error = null;
      })
      .addCase(republishJob.fulfilled, (s, a) => {
        s.republishLoading = false;
        const { jobId, newExpireDate, data } = a.payload;
        const updatedJob = data || {};

        s.jobs = s.jobs.map((j) => {
          if (j._id === jobId || j.id === jobId) {
            return {
              ...j,
              ...updatedJob,
              status: updatedJob.status || "Active",
              advanceInformation: {
                ...(j.advanceInformation || {}),
                ...(updatedJob.advanceInformation || {}),
                expireDate:
                  newExpireDate || updatedJob.advanceInformation?.expireDate,
              },
            };
          }
          return j;
        });

        if (s.jobDetail && (s.jobDetail._id === jobId || s.jobDetail.id === jobId)) {
          s.jobDetail = {
            ...s.jobDetail,
            ...updatedJob,
            status: updatedJob.status || "Active",
            advanceInformation: {
              ...(s.jobDetail.advanceInformation || {}),
              ...(updatedJob.advanceInformation || {}),
              expireDate:
                newExpireDate || updatedJob.advanceInformation?.expireDate,
            },
          };
        }
      })
      .addCase(republishJob.rejected, (s, a) => {
        s.republishLoading = false;
        s.error = a.payload;
      });
  },
});

export const {
  clearJobError,
  clearJobDetail,
  clearApplicants,
  clearApplicantDetail,
  clearApplicantStatusHistory,
  updateApplicantStatus,
} = jobSlice.actions;

export default jobSlice.reducer;
