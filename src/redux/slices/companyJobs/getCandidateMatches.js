import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axiosInstance from '../../../api/axiosInstance';

export const fetchMatchedCandidates = createAsyncThunk(
  'candidates/fetchMatches',
  async ({ jobId, page = 1, limit = 10, filters = {} } = {}, { rejectWithValue }) => {
    try {
      const params = new URLSearchParams({ page, limit })
      Object.keys(filters || {}).forEach((k) => {
        const v = filters[k]
        if (v === undefined || v === null || v === '') return
        if (Array.isArray(v)) {
          v.forEach((val) => params.append(k, val))
        } else {
          params.append(k, v)
        }
      })

      const response = await axiosInstance.get(
        `/api/job/matches/${jobId}?${params.toString()}`,
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Something went wrong');
    }
  }
);

const candidateMatchSlice = createSlice({
  name: 'candidateMatches',
  initialState: {
    matches: [],
    loading: false,
    error: null,
    jobTitle: '',
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchMatchedCandidates.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchMatchedCandidates.fulfilled, (state, action) => {
        state.loading = false;
        state.matches = action.payload.data;
        state.jobTitle = action.payload.jobTitle;
      })
      .addCase(fetchMatchedCandidates.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export default candidateMatchSlice.reducer;