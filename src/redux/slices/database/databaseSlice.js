import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axiosInstance from "../../../api/axiosInstance";

// Helper to build query params
const buildParams = (filters) => {
  const {
    searchingFor,
    state,
    city,
    minExperience,
    maxExperience,
    education,
    currentCTC,
    expectedCTC,
    category,
    subCategory,
    designation,
    page,
    limit,
  } = filters;
  const params = {};
  if (searchingFor) params.searchingFor = searchingFor;
  if (state) params.state = state;
  if (city) params.city = city;
  if (education) params.education = education;
  if (category) params.category = category;
  if (subCategory) params.subCategory = subCategory;
  if (designation) params.designation = designation;
  if (page) params.page = page;
  if (limit) params.limit = limit;

  if (searchingFor !== "fresher") {
    if (minExperience) params.minExperience = minExperience;
    if (maxExperience) params.maxExperience = maxExperience;
  }

  if (searchingFor === "fresher") {
    if (expectedCTC) params.expectedCTC = expectedCTC;
  } else {
    if (currentCTC) params.currentCTC = currentCTC;
  }
  return params;
};

export const searchCandidates = createAsyncThunk(
  "database/searchCandidates",
  async (filters, { rejectWithValue }) => {
    try {
      const params = buildParams(filters);
      const response = await axiosInstance.get("/api/employer/candidates/search", {
        params,
      });
      return response.data;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || "Something went wrong",
      );
    }
  },
);
// get candidate by ID (for details page)
export const getCandidateById = createAsyncThunk(
  "database/getCandidateById",
  async (id, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get(`/api/employer/candidates/details/${id}`);
      return response.data.data;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || "Something went wrong",
      );
    }
  },
);
// get all unlocked candidates (for unlocked tab)
export const getAllUnlockedCandidates = createAsyncThunk(
  "database/getAllUnlockedCandidates",
  async ({ page, limit }, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get("/api/employer/candidates/unlocked", {
        params: { page, limit },
      });
      return response.data; // Return full response to get pagination metadata
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Something went wrong");
    }
  }
);
// API 1: Get Education Options
export const fetchEducationOptions = createAsyncThunk(
  "database/fetchEducationOptions",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get("/api/employer/candidates/filters/education");
      return response.data?.data || [];
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Failed to fetch education options");
    }
  }
);

// API 2: Get CTC Options
export const fetchCtcOptions = createAsyncThunk(
  "database/fetchCtcOptions",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get("/api/employer/candidates/filters/ctc");
      return response.data?.data || [];
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Failed to fetch CTC options");
    }
  }
);

// API 3: Get Experience Options
export const fetchExperienceOptions = createAsyncThunk(
  "database/fetchExperienceOptions",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get("/api/employer/candidates/filters/experience");
      return response.data?.data || [];
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Failed to fetch experience options");
    }
  }
);

// Unified: Fetch all candidate filter options in parallel
export const fetchCandidateFilters = createAsyncThunk(
  "database/fetchCandidateFilters",
  async (_, { rejectWithValue }) => {
    try {
      const [eduRes, ctcRes, expRes] = await Promise.allSettled([
        axiosInstance.get("/api/employer/candidates/filters/education"),
        axiosInstance.get("/api/employer/candidates/filters/ctc"),
        axiosInstance.get("/api/employer/candidates/filters/experience"),
      ]);

      return {
        education: eduRes.status === "fulfilled" && eduRes.value.data?.success ? eduRes.value.data.data : null,
        ctc: ctcRes.status === "fulfilled" && ctcRes.value.data?.success ? ctcRes.value.data.data : null,
        experience: expRes.status === "fulfilled" && expRes.value.data?.success ? expRes.value.data.data : null,
      };
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Failed to fetch candidate filters");
    }
  }
);

// LOAD FILTERS FROM LOCALSTORAGE ON INIT
const savedFilters = localStorage.getItem("lastSearchFilters")
  ? JSON.parse(localStorage.getItem("lastSearchFilters"))
  : null;

const initialState = {
  candidates: [],
  selectedCandidate: null,
  total: 0,
  page: 1,
  totalPages: 0,
  count: 0,
  filterOptions: {
    education: ['10th Pass', '12th Pass', 'ITI', 'Diploma', 'Graduate', 'Post Graduate'],
    ctc: ['0-2 LPA', '2-5 LPA', '5-10 LPA', '10-15 LPA', '15+ LPA'],
    experience: ['0-1 Years', '1-3 Years', '3-5 Years', '5-8 Years', '8+ Years'],
    loading: false,
    error: null,
  },
  filters: savedFilters || {
    searchingFor: "any",
    state: "",
    city: "",
    minExperience: "",
    maxExperience: "",
    education: "",
    currentCTC: "",
    expectedCTC: "",
    category: "",
    subCategory: "",
    designation: "",
    page: 1,
    limit: 10,
  },
  loading: false,
  error: null,
  searched: false,
};

const databaseSlice = createSlice({
  name: "database",
  initialState,
  reducers: {
    setFilters(state, action) {
      state.filters = { ...state.filters, ...action.payload, page: 1 };
      // Persist to localStorage
      localStorage.setItem("lastSearchFilters", JSON.stringify(state.filters));
    },
    setPage(state, action) {
      state.filters.page = action.payload;
      state.page = action.payload;
      localStorage.setItem("lastSearchFilters", JSON.stringify(state.filters));
    },
    updateCandidateStatus(state, action) {
      const { id, isLocked, ...rest } = action.payload;
      const index = state.candidates.findIndex((c) => c._id === id);
      if (index !== -1) {
        state.candidates[index] = {
          ...state.candidates[index],
          isLocked,
          ...rest,
        };
      }
    },
    resetFilters(state) {
      localStorage.removeItem("lastSearchFilters");
      return initialState;
    },
    // reducers in databaseSlice.js
    clearSelectedCandidate(state) {
      state.selectedCandidate = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(searchCandidates.pending, (state) => {
        state.loading = true;
      })
      .addCase(searchCandidates.fulfilled, (state, action) => {
        state.loading = false;
        state.searched = true;
        state.candidates = action.payload.data ?? [];
        state.total = action.payload.total ?? 0;
        state.page = action.payload.page ?? 1;
        state.totalPages = action.payload.totalPages ?? 0;
      })
      .addCase(searchCandidates.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Get Candidate By ID
      .addCase(getCandidateById.pending, (state) => {
        state.loading = true;
      })
      .addCase(getCandidateById.fulfilled, (state, action) => {
        state.loading = false;
        // Store the detailed data separately
        state.selectedCandidate = action.payload;

        // Update the item in the list if it exists, but DON'T unshift a detailed object
        // into a list of summary objects if they have different structures.
        const index = state.candidates.findIndex(
          (c) => c._id === action.payload._id,
        );
        if (index !== -1) {
          state.candidates[index] = {
            ...state.candidates[index],
            ...action.payload,
          };
        }
      })
      .addCase(getCandidateById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(getAllUnlockedCandidates.pending, (state) => {
    state.loading = true;
  })
  .addCase(getAllUnlockedCandidates.fulfilled, (state, action) => {
    state.loading = false;
    state.candidates = action.payload.data ?? [];
    state.total = action.payload.total ?? 0;
    state.page = action.payload.page ?? 1;
    state.totalPages = action.payload.totalPages ?? 0;
    state.count = action.payload.count ?? 0;
  })
      .addCase(getAllUnlockedCandidates.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Candidate Filter Options
      .addCase(fetchCandidateFilters.pending, (state) => {
        state.filterOptions.loading = true;
      })
      .addCase(fetchCandidateFilters.fulfilled, (state, action) => {
        state.filterOptions.loading = false;
        if (action.payload.education) state.filterOptions.education = action.payload.education;
        if (action.payload.ctc) state.filterOptions.ctc = action.payload.ctc;
        if (action.payload.experience) state.filterOptions.experience = action.payload.experience;
      })
      .addCase(fetchCandidateFilters.rejected, (state, action) => {
        state.filterOptions.loading = false;
        state.filterOptions.error = action.payload;
      })
      .addCase(fetchEducationOptions.fulfilled, (state, action) => {
        if (action.payload?.length) state.filterOptions.education = action.payload;
      })
      .addCase(fetchCtcOptions.fulfilled, (state, action) => {
        if (action.payload?.length) state.filterOptions.ctc = action.payload;
      })
      .addCase(fetchExperienceOptions.fulfilled, (state, action) => {
        if (action.payload?.length) state.filterOptions.experience = action.payload;
      });
  },
});

export const { setFilters, setPage, updateCandidateStatus, resetFilters , clearSelectedCandidate} =
  databaseSlice.actions;
export default databaseSlice.reducer;
