import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axiosInstance from '../../../api/axiosInstance';

// ── API 4: Get Employer Credits Balance ──────────────────────────────────────
export const fetchRemainingCredits = createAsyncThunk(
  'creditDeduction/fetchRemaining',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get('/api/employer/credits/balance');
      const credits = response.data?.data?.credits ?? response.data?.credits ?? 0;
      localStorage.setItem('databaseCredits', String(credits));
      window.dispatchEvent(new Event('creditsUpdated'));
      return credits;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch credits');
    }
  }
);

// ── API 5: Unlock Candidate Profile (costs 1 credit) ─────────────────────────
export const unlockCandidateProfile = createAsyncThunk(
  'creditDeduction/unlockProfile',
  async (candidateId, { rejectWithValue, dispatch }) => {
    try {
      const response = await axiosInstance.post(
        `/api/employer/candidates/${candidateId}/unlock`
      );
      if (response.data?.remainingCredits !== undefined) {
        localStorage.setItem('databaseCredits', String(response.data.remainingCredits));
        window.dispatchEvent(new Event('creditsUpdated'));
      }
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to unlock profile');
    }
  }
);

// ── API 6: Download Candidates Excel (costs 2 credits per candidate) ──────────
export const exportCandidatesExcel = createAsyncThunk(
  'creditDeduction/exportCandidatesExcel',
  async (candidateIds, { rejectWithValue, dispatch }) => {
    try {
      const payload = Array.isArray(candidateIds) && candidateIds.length > 0
        ? { candidateIds }
        : {};

      const response = await axiosInstance.post(
        '/api/employer/candidates/export-excel',
        payload,
        { responseType: 'blob' }
      );

      const blob = new Blob([response.data], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      });
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = `Candidates_Export_${new Date().toISOString().split('T')[0]}.xlsx`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(downloadUrl);

      // Re-fetch remaining credits balance after deduction
      dispatch(fetchRemainingCredits());

      return { success: true };
    } catch (error) {
      let message = 'Failed to export candidates excel';
      if (error.response?.data instanceof Blob) {
        try {
          const text = await error.response.data.text();
          const parsed = JSON.parse(text);
          message = parsed.message || message;
        } catch {
          // ignore parsing error
        }
      } else if (error.response?.data?.message) {
        message = error.response.data.message;
      }
      return rejectWithValue(message);
    }
  }
);

// Backward-compatible alias for existing code
export const deductBulkCredits = exportCandidatesExcel;

// ── API 7A: Create Razorpay Order ────────────────────────────────────────────
export const createCreditOrder = createAsyncThunk(
  'creditDeduction/createCreditOrder',
  async (packageId, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post('/api/employer/credits/buy', {
        packageId,
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to create order');
    }
  }
);

// ── API 7B: Verify Payment & Add Credits ─────────────────────────────────────
export const verifyCreditPayment = createAsyncThunk(
  'creditDeduction/verifyCreditPayment',
  async (paymentData, { rejectWithValue, dispatch }) => {
    try {
      const response = await axiosInstance.post(
        '/api/employer/credits/verify',
        paymentData
      );
      const newCredits = response.data?.data?.credits;
      if (newCredits !== undefined) {
        localStorage.setItem('databaseCredits', String(newCredits));
        window.dispatchEvent(new Event('creditsUpdated'));
      }
      dispatch(fetchRemainingCredits());
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to verify payment');
    }
  }
);

// ─── Slice ────────────────────────────────────────────────────────────────────
const creditDeductionSlice = createSlice({
  name: 'creditDeduction',
  initialState: {
    remainingCredits: Number(localStorage.getItem('databaseCredits') || 0),
    loading: false,
    exportLoading: false,
    orderLoading: false,
    verifyLoading: false,
    orderData: null,
    error: null,
    success: false,
  },
  reducers: {
    resetStatus: (state) => {
      state.loading = false;
      state.exportLoading = false;
      state.orderLoading = false;
      state.verifyLoading = false;
      state.error = null;
      state.success = false;
      state.orderData = null;
    },
    setRemainingCredits: (state, action) => {
      state.remainingCredits = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      // ── fetchRemainingCredits ──
      .addCase(fetchRemainingCredits.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchRemainingCredits.fulfilled, (state, action) => {
        state.loading = false;
        state.remainingCredits = action.payload;
      })
      .addCase(fetchRemainingCredits.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // ── unlockCandidateProfile ──
      .addCase(unlockCandidateProfile.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(unlockCandidateProfile.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        if (action.payload?.remainingCredits !== undefined) {
          state.remainingCredits = action.payload.remainingCredits;
        }
      })
      .addCase(unlockCandidateProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // ── exportCandidatesExcel ──
      .addCase(exportCandidatesExcel.pending, (state) => {
        state.exportLoading = true;
        state.error = null;
      })
      .addCase(exportCandidatesExcel.fulfilled, (state) => {
        state.exportLoading = false;
        state.success = true;
      })
      .addCase(exportCandidatesExcel.rejected, (state, action) => {
        state.exportLoading = false;
        state.error = action.payload;
      })

      // ── createCreditOrder ──
      .addCase(createCreditOrder.pending, (state) => {
        state.orderLoading = true;
        state.error = null;
      })
      .addCase(createCreditOrder.fulfilled, (state, action) => {
        state.orderLoading = false;
        state.orderData = action.payload?.data;
      })
      .addCase(createCreditOrder.rejected, (state, action) => {
        state.orderLoading = false;
        state.error = action.payload;
      })

      // ── verifyCreditPayment ──
      .addCase(verifyCreditPayment.pending, (state) => {
        state.verifyLoading = true;
        state.error = null;
      })
      .addCase(verifyCreditPayment.fulfilled, (state, action) => {
        state.verifyLoading = false;
        state.success = true;
        if (action.payload?.data?.credits !== undefined) {
          state.remainingCredits = action.payload.data.credits;
        }
      })
      .addCase(verifyCreditPayment.rejected, (state, action) => {
        state.verifyLoading = false;
        state.error = action.payload;
      });
  },
});

export const { resetStatus, setRemainingCredits } = creditDeductionSlice.actions;
export default creditDeductionSlice.reducer;