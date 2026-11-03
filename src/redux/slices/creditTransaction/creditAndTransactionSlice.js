import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axiosInstance from '../../../api/axiosInstance';

/* ─────────────────────────────────────────────
   Async Thunks
───────────────────────────────────────────── */
export const fetchCreditStats = createAsyncThunk(
  'creditTransaction/fetchStats',
  async (_, { rejectWithValue }) => {
    try {
      const res = await axiosInstance.get(
        '/api/employer/credit-usage/stats'
      );
      return res.data.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to fetch stats');
    }
  }
);

export const fetchCreditHistory = createAsyncThunk(
  'creditTransaction/fetchHistory',
  async (params, { rejectWithValue }) => {
    try {
      const res = await axiosInstance.get('/api/employer/credit-usage/history', {
        params,
      });
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to fetch history');
    }
  }
);

export const fetchBillingTransactions = createAsyncThunk(
  'creditTransaction/fetchBilling',
  async (params, { rejectWithValue }) => {
    try {
      const res = await axiosInstance.get('/api/employer/billing-transactions', {
        params,
      });
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to fetch transactions');
    }
  }
);

export const fetchTransactionById = createAsyncThunk(
  'creditTransaction/fetchById',
  async (id, { rejectWithValue }) => {
    try {
      const res = await axiosInstance.get(
        `/api/employer/billing-transactions/${id}`
      );
      return res.data.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to fetch details');
    }
  }
);

/* ─────────────────────────────────────────────
   Initial State
───────────────────────────────────────────── */
const initialState = {
  stats: null,
  history: [],
  historyPagination: { totalPages: 1, currentPage: 1, totalResults: 0 },
  transactions: [],
  billingProfile: null,
  transactionPagination: { totalPages: 1, currentPage: 1, totalResults: 0 },
  selectedTransaction: null,
  loading: false,
  tableLoading: false,
  error: null,
};

/* ─────────────────────────────────────────────
   Slice
───────────────────────────────────────────── */
const creditAndTransactionSlice = createSlice({
  name: 'creditAndTransaction',
  initialState,
  reducers: {
    resetSelectedTransaction: (state) => {
      state.selectedTransaction = null;
    },
  },
  extraReducers: (builder) => {
    builder
      /* ── Credit Stats ── */
      .addCase(fetchCreditStats.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchCreditStats.fulfilled, (state, action) => {
        state.loading = false;
        state.stats = action.payload;
      })
      .addCase(fetchCreditStats.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      /* ── Credit History ── */
      .addCase(fetchCreditHistory.pending, (state) => {
        state.tableLoading = true;
      })
      .addCase(fetchCreditHistory.fulfilled, (state, action) => {
        state.tableLoading = false;
        state.history = action.payload.data;
        state.historyPagination = action.payload.pagination;
      })
      .addCase(fetchCreditHistory.rejected, (state, action) => {
        state.tableLoading = false;
        state.error = action.payload;
      })

      /* ── Billing Transactions ── */
      .addCase(fetchBillingTransactions.pending, (state) => {
        state.tableLoading = true;
      })
      .addCase(fetchBillingTransactions.fulfilled, (state, action) => {
        state.tableLoading = false;
        state.transactions = action.payload.data;
        state.billingProfile = action.payload.billingProfile;
        state.transactionPagination = action.payload.pagination;
      })
      .addCase(fetchBillingTransactions.rejected, (state, action) => {
        state.tableLoading = false;
        state.error = action.payload;
      })

      /* ── Transaction by ID (modal) ── */
      // Use loading flag so modal skeleton shows while fetching
      .addCase(fetchTransactionById.pending, (state) => {
        state.loading = true;
        state.selectedTransaction = null; // clear stale data → skeleton shows
      })
      .addCase(fetchTransactionById.fulfilled, (state, action) => {
        state.loading = false;
        state.selectedTransaction = action.payload;
      })
      .addCase(fetchTransactionById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { resetSelectedTransaction } = creditAndTransactionSlice.actions;
export default creditAndTransactionSlice.reducer;