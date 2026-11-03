import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axiosInstance from "../../../api/axiosInstance";

// ─── THUNKS ──────────────────────────────────────────────────────────────────

// 16. Get FAQs (public)
// GET /api/employer/faqs?page=1&limit=20&category=General&search=job
export const fetchFaqs = createAsyncThunk(
  "support/fetchFaqs",
  async ({ page = 1, limit = 20, category, search } = {}, { rejectWithValue }) => {
    try {
      const params = new URLSearchParams();
      if (page) params.append("page", page);
      if (limit) params.append("limit", limit);
      if (category && category !== "All") params.append("category", category);
      if (search && search.trim()) params.append("search", search.trim());

      const res = await axiosInstance.get(
        `/api/employer/faqs${params.toString() ? `?${params.toString()}` : ""}`
      );
      return res.data;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || "Failed to fetch FAQs"
      );
    }
  }
);

// 17. Get FAQ Categories (public)
// GET /api/employer/faqs/categories
export const fetchFaqCategories = createAsyncThunk(
  "support/fetchFaqCategories",
  async (_, { rejectWithValue }) => {
    try {
      const res = await axiosInstance.get("/api/employer/faqs/categories");
      return res.data?.data || res.data;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || "Failed to fetch FAQ categories"
      );
    }
  }
);

// 18. Get Support Contact Info (public)
// GET /api/employer/support/contact-info
export const fetchSupportContactInfo = createAsyncThunk(
  "support/fetchSupportContactInfo",
  async (_, { rejectWithValue }) => {
    try {
      const res = await axiosInstance.get("/api/employer/support/contact-info");
      return res.data?.data || res.data;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || "Failed to fetch contact info"
      );
    }
  }
);

// 19. Create Support Ticket (token)
// POST /api/employer/support/tickets
export const createSupportTicket = createAsyncThunk(
  "support/createSupportTicket",
  async (ticketData, { rejectWithValue }) => {
    try {
      const res = await axiosInstance.post(
        "/api/employer/support/tickets",
        ticketData
      );
      return res.data;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || "Failed to create support ticket"
      );
    }
  }
);

// 20. Get My Support Tickets (token)
// GET /api/employer/support/tickets?page=1&limit=10&status=open
export const fetchMyTickets = createAsyncThunk(
  "support/fetchMyTickets",
  async ({ page = 1, limit = 10, status } = {}, { rejectWithValue }) => {
    try {
      const params = new URLSearchParams();
      if (page) params.append("page", page);
      if (limit) params.append("limit", limit);
      if (status && status !== "all") params.append("status", status);

      const res = await axiosInstance.get(
        `/api/employer/support/tickets${params.toString() ? `?${params.toString()}` : ""}`
      );
      return res.data;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || "Failed to fetch support tickets"
      );
    }
  }
);

// 21. Get Support Ticket By ID (token)
// GET /api/employer/support/tickets/:id
export const fetchTicketById = createAsyncThunk(
  "support/fetchTicketById",
  async (id, { rejectWithValue }) => {
    try {
      const res = await axiosInstance.get(`/api/employer/support/tickets/${id}`);
      return res.data?.data || res.data;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || "Failed to fetch ticket details"
      );
    }
  }
);

// 22. Get Employer Terms (public)
// GET /api/employer/termsandconditions
export const fetchEmployerTerms = createAsyncThunk(
  "support/fetchEmployerTerms",
  async (_, { rejectWithValue }) => {
    try {
      const res = await axiosInstance.get("/api/employer/termsandconditions");
      return res.data?.data || res.data;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || "Failed to fetch terms and conditions"
      );
    }
  }
);

// ─── SLICE ───────────────────────────────────────────────────────────────────

const supportSlice = createSlice({
  name: "support",
  initialState: {
    // FAQs
    faqs: [],
    faqCategories: [],
    faqLoading: false,

    // Support Contact Info
    contactInfo: null,
    contactInfoLoading: false,

    // Tickets
    tickets: [],
    currentTicket: null,
    ticketLoading: false,
    createTicketLoading: false,
    totalTickets: 0,
    ticketPage: 1,
    ticketTotalPages: 1,

    // Terms
    terms: null,
    termsLoading: false,

    error: null,
  },
  reducers: {
    clearSupportError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // 16. fetchFaqs
      .addCase(fetchFaqs.pending, (state) => {
        state.faqLoading = true;
        state.error = null;
      })
      .addCase(fetchFaqs.fulfilled, (state, action) => {
        state.faqLoading = false;
        const payload = action.payload;
        state.faqs = Array.isArray(payload?.data)
          ? payload.data
          : Array.isArray(payload?.faqs)
          ? payload.faqs
          : Array.isArray(payload)
          ? payload
          : [];
      })
      .addCase(fetchFaqs.rejected, (state, action) => {
        state.faqLoading = false;
        state.error = action.payload;
      })

      // 17. fetchFaqCategories
      .addCase(fetchFaqCategories.fulfilled, (state, action) => {
        state.faqCategories = Array.isArray(action.payload) ? action.payload : [];
      })

      // 18. fetchSupportContactInfo
      .addCase(fetchSupportContactInfo.pending, (state) => {
        state.contactInfoLoading = true;
      })
      .addCase(fetchSupportContactInfo.fulfilled, (state, action) => {
        state.contactInfoLoading = false;
        state.contactInfo = action.payload;
      })
      .addCase(fetchSupportContactInfo.rejected, (state) => {
        state.contactInfoLoading = false;
      })

      // 19. createSupportTicket
      .addCase(createSupportTicket.pending, (state) => {
        state.createTicketLoading = true;
      })
      .addCase(createSupportTicket.fulfilled, (state) => {
        state.createTicketLoading = false;
      })
      .addCase(createSupportTicket.rejected, (state, action) => {
        state.createTicketLoading = false;
        state.error = action.payload;
      })

      // 20. fetchMyTickets
      .addCase(fetchMyTickets.pending, (state) => {
        state.ticketLoading = true;
      })
      .addCase(fetchMyTickets.fulfilled, (state, action) => {
        state.ticketLoading = false;
        const payload = action.payload;
        state.tickets = Array.isArray(payload?.data)
          ? payload.data
          : Array.isArray(payload?.tickets)
          ? payload.tickets
          : Array.isArray(payload)
          ? payload
          : [];
        state.totalTickets = payload?.totalTickets ?? payload?.total ?? state.tickets.length;
        state.ticketPage = payload?.currentPage ?? 1;
        state.ticketTotalPages = payload?.totalPages ?? 1;
      })
      .addCase(fetchMyTickets.rejected, (state, action) => {
        state.ticketLoading = false;
        state.error = action.payload;
      })

      // 21. fetchTicketById
      .addCase(fetchTicketById.fulfilled, (state, action) => {
        state.currentTicket = action.payload;
      })

      // 22. fetchEmployerTerms
      .addCase(fetchEmployerTerms.pending, (state) => {
        state.termsLoading = true;
      })
      .addCase(fetchEmployerTerms.fulfilled, (state, action) => {
        state.termsLoading = false;
        state.terms = action.payload;
      })
      .addCase(fetchEmployerTerms.rejected, (state) => {
        state.termsLoading = false;
      });
  },
});

export const { clearSupportError } = supportSlice.actions;

export default supportSlice.reducer;
