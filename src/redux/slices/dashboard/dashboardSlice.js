import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axiosInstance from '../../../api/axiosInstance';

export const fetchRecentJobs = createAsyncThunk(
  'dashboard/fetchRecentJobs',
  async ({ page, limit }, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get(
        '/api/employer/dashboard/recent-jobs',
        {
          params: { page, limit },
        }
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch jobs');
    }
  }
);

export const fetchDashboardChartData = createAsyncThunk(
  'dashboard/fetchDashboardChartData',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get('/api/employer/dashboard/chart-data');
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch chart data');
    }
  }
);

const dashboardSlice = createSlice({
  name: 'dashboard',
  initialState: {
    jobs: [],
    loading: false,
    error: null,
    pagination: {
      currentPage: 1,
      totalPages: 1,
      totalJobs: 0,
    },
    chartData: {
      jobsChart: [],
      applicantsChart: [],
    },
    chartLoading: false,
    chartError: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      // fetchRecentJobs
      .addCase(fetchRecentJobs.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchRecentJobs.fulfilled, (state, action) => {
        state.loading = false;
        state.jobs = action.payload?.data ?? [];
        state.pagination.currentPage = action.payload?.currentPage ?? 1;
        state.pagination.totalPages = action.payload?.totalPages ?? 1;
        state.pagination.totalJobs = action.payload?.totalJobs ?? 0;
      })
      .addCase(fetchRecentJobs.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // fetchDashboardChartData
      .addCase(fetchDashboardChartData.pending, (state) => {
        state.chartLoading = true;
        state.chartError = null;
      })
      .addCase(fetchDashboardChartData.fulfilled, (state, action) => {
        state.chartLoading = false;
        state.chartData = action.payload?.data || { jobsChart: [], applicantsChart: [] };
      })
      .addCase(fetchDashboardChartData.rejected, (state, action) => {
        state.chartLoading = false;
        state.chartError = action.payload;
      });
  },
});

export default dashboardSlice.reducer;