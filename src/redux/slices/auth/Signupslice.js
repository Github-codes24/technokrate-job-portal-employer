import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axiosInstance from "../../../api/axiosInstance";

// ─── Thunks ───────────────────────────────────────────────────────────────────

export const registerEmployer = createAsyncThunk(
  "signup/registerEmployer",
  async ({ name, mobileNumber, email, password }, { rejectWithValue }) => {
    try {
      const payload = {
        name,
        mobileNumber,
        companyApprovalStatus: "pending",
      };
      if (email) payload.email = email;
      if (password) payload.password = password;
      const res = await axiosInstance.post("/api/employer/user/signup", payload);
      return res.data; 
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Registration failed");
    }
  }
);

export const verifyMobileOtp = createAsyncThunk(
  "signup/verifyMobileOtp",
  async ({ mobileNumber, clientOTP }, { rejectWithValue }) => {
    try {
      const res = await axiosInstance.post(
        "/api/employer/verify-signup-otp",
        { mobileNumber, otp: clientOTP }
      );
      // Automatically save the token and employer data returned upon signup verification
      if (res.data?.token) {
        localStorage.setItem("token", res.data.token);
      }
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Mobile OTP verification failed");
    }
  }
);

/**
 * Google Sign-Up Thunk
 * POST employer/google-signup
 */
export const googleSignup = createAsyncThunk(
  "signup/googleSignup",
  async ({ idToken }, { rejectWithValue }) => {
    try {
      const res = await axiosInstance.post("/api/employer/google-signup", {
        idToken,
        companyApprovalStatus: "pending",
      });
      return res.data;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || "Google registration failed"
      );
    }
  }
);


// ─── Slice ────────────────────────────────────────────────────────────────────
const signupSlice = createSlice({
  name: "signup",
  initialState: {
    mobileOtpSent: false,
    mobileVerified: false,
    loading: false,
    error: null,
  },
  reducers: {
    clearSignupError(state) {
      state.error = null;
    },
    resetSignupState(state) {
      state.mobileOtpSent = false;
      state.mobileVerified = false;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(registerEmployer.pending, (state) => {
        state.loading = true; state.error = null;
      })
      .addCase(registerEmployer.fulfilled, (state, action) => {
        state.loading = false;
        if (action.payload.token) {
          localStorage.setItem("token", action.payload.token);
        }
      })
      .addCase(registerEmployer.rejected, (state, action) => {
        state.loading = false; state.error = action.payload;
      })
      .addCase(verifyMobileOtp.pending, (state) => {
        state.loading = true; state.error = null;
      })
      .addCase(verifyMobileOtp.fulfilled, (state, action) => {
        state.loading = false;
        state.mobileVerified = true;
        if (action.payload.token) {
          localStorage.setItem("token", action.payload.token);
        }
      })
      .addCase(verifyMobileOtp.rejected, (state, action) => {
        state.loading = false; state.error = action.payload;
      })
      .addCase(googleSignup.pending, (state) => {
        state.loading = true; state.error = null;
      })
      .addCase(googleSignup.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(googleSignup.rejected, (state, action) => {
        state.loading = false; state.error = action.payload;
      });
  },
});

export const { clearSignupError, resetSignupState } = signupSlice.actions;
export default signupSlice.reducer;
