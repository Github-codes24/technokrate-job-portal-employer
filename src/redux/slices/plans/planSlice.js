import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axiosInstance from '../../../api/axiosInstance';

export const fetchPlanTypes = createAsyncThunk(
  'plans/fetchPlanTypes',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get('/api/employer/plans/get-plan-types-tabs');
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch types');
    }
  }
);

export const fetchAllPlans = createAsyncThunk(
  'plans/fetchAllPlans',
  async (params, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get('/api/employer/plans', { params });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch plans');
    }
  }
);

export const createPaymentLink = createAsyncThunk(
  'plans/createPaymentLink',
  async (employerPlanId, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post('/api/employer/plans/create-payment-link', { employerPlanId });
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to create payment link');
    }
  }
);

const planSlice = createSlice({
  name: 'plans',
  initialState: { planTypes: [], plans: [], pagination: {}, activePayment: null, loading: false, error: null },
  reducers: {
    resetPaymentLink: (state) => { state.activePayment = null; }
  },
  extraReducers: (builder) => {
    builder
      // FETCH ACTIONS: Trigger Skeleton
      .addCase(fetchPlanTypes.pending, (state) => { state.loading = true; })
      .addCase(fetchPlanTypes.fulfilled, (state, action) => { state.loading = false; state.planTypes = action.payload; })
      .addCase(fetchAllPlans.pending, (state) => { state.loading = true; })
      .addCase(fetchAllPlans.fulfilled, (state, action) => {
        state.loading = false;
        state.plans = action.payload.data;
        state.pagination = action.payload.pagination;
      })
      .addCase(fetchAllPlans.rejected, (state) => { state.loading = false; })
      
      // PAYMENT ACTION: Does NOT trigger Skeleton (Button spinner only)
      .addCase(createPaymentLink.fulfilled, (state, action) => { state.activePayment = action.payload; })
      .addCase(createPaymentLink.rejected, (state, action) => { state.error = action.payload; });
  },
});

export const { resetPaymentLink } = planSlice.actions;
export default planSlice.reducer;