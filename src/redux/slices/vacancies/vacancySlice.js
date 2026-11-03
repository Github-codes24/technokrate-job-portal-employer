import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { vacancyApi } from "../../../api/staffingAndVacancyApi";

// ─── THUNKS ──────────────────────────────────────────────────────────────────

export const getVacancies = createAsyncThunk(
  "vacancies/getVacancies",
  async (params = {}, { rejectWithValue }) => {
    try {
      const res = await vacancyApi.getVacancies(params);
      return res.data;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || "Failed to fetch vacancies"
      );
    }
  }
);

export const getVacancyStats = createAsyncThunk(
  "vacancies/getVacancyStats",
  async (_, { rejectWithValue }) => {
    try {
      const res = await vacancyApi.getVacancyStats();
      return res.data;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || "Failed to fetch vacancy stats"
      );
    }
  }
);

// ─── SLICE ───────────────────────────────────────────────────────────────────

const vacancySlice = createSlice({
  name: "vacancies",
  initialState: {
    vacancies: [],
    stats: null,
    pagination: {
      currentPage: 1,
      totalPages: 1,
      total: 0,
      limit: 10,
    },
    loading: false,
    statsLoading: false,
    error: null,
  },
  reducers: {
    clearVacancyError(state) {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // getVacancies
      .addCase(getVacancies.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getVacancies.fulfilled, (state, action) => {
        state.loading = false;
        state.vacancies = action.payload?.data || [];
        if (action.payload?.pagination) {
          state.pagination = action.payload.pagination;
        } else {
          state.pagination = {
            total: action.payload?.total || 0,
            currentPage: action.payload?.page || 1,
            limit: action.payload?.limit || 10,
            totalPages: Math.ceil((action.payload?.total || 0) / (action.payload?.limit || 10)) || 1,
          };
        }
      })
      .addCase(getVacancies.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // getVacancyStats
      .addCase(getVacancyStats.pending, (state) => {
        state.statsLoading = true;
      })
      .addCase(getVacancyStats.fulfilled, (state, action) => {
        state.statsLoading = false;
        state.stats = action.payload?.data || action.payload;
      })
      .addCase(getVacancyStats.rejected, (state, action) => {
        state.statsLoading = false;
      });
  },
});

export const { clearVacancyError } = vacancySlice.actions;
export default vacancySlice.reducer;
