import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import { googleSignup } from "./Signupslice";

// ─── Base URL Helper ────────────────────────────────────────────────────────
const getBaseUrl = () => {
  let url = import.meta.env.VITE_API_BASE_URL || "https://new-job-portal-be-dh8v.onrender.com";
  url = url.replace(/\/+$/, "");
  if (url.endsWith("/api")) {
    url = url.slice(0, -4);
  }
  return url;
};

const getApiUrl = (path) => {
  const base = getBaseUrl();
  const cleanPath = path.startsWith("/") ? path : `/${path}`;
  return `${base}${cleanPath}`;
};

// ─── Helpers ────────────────────────────────────────────────────────────────
const getStoredToken = () => {
  try {
    return localStorage.getItem("token") || null;
  } catch {
    return null;
  }
};

const getStoredEmployer = () => {
  try {
    const raw = localStorage.getItem("employer") || localStorage.getItem("user");
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

const getStoredResetEmail = () => {
  try {
    return sessionStorage.getItem("resetPasswordEmail") || "";
  } catch {
    return "";
  }
};

const getStoredOtpVerified = () => {
  try {
    return sessionStorage.getItem("resetPasswordOtpVerified") === "true";
  } catch {
    return false;
  }
};

// ─── Thunks ─────────────────────────────────────────────────────────────────

/**
 * 4.1 EMPLOYER LOGIN (EMAIL + PASSWORD)
 * POST /api/employer/user/login (Alias: /api/employer/login)
 */
export const loginWithPassword = createAsyncThunk(
  "auth/loginWithPassword",
  async ({ email, password }, { rejectWithValue }) => {
    try {
      let res;
      try {
        res = await axios.post(getApiUrl("/api/employer/user/login"), {
          email: email.trim(),
          password,
        });
      } catch (err) {
        if (err.response?.status === 404) {
          res = await axios.post(getApiUrl("/api/employer/login"), {
            email: email.trim(),
            password,
          });
        } else {
          throw err;
        }
      }
      return res.data;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || "Invalid email or password"
      );
    }
  }
);

/**
 * 4.2 EMPLOYER FORGOT PASSWORD - STEP 1 (SEND OTP TO EMAIL)
 * POST /api/employer/user/requestpasswordreset
 * Aliases: /api/employer/requestpasswordreset, /api/employer/forgot-password
 */
export const forgotPasswordMail = createAsyncThunk(
  "auth/forgotPasswordMail",
  async ({ email }, { rejectWithValue }) => {
    try {
      let res;
      try {
        res = await axios.post(getApiUrl("/api/employer/user/requestpasswordreset"), {
          email: email.trim(),
        });
      } catch (err) {
        if (err.response?.status === 404) {
          try {
            res = await axios.post(getApiUrl("/api/employer/requestpasswordreset"), {
              email: email.trim(),
            });
          } catch (err2) {
            if (err2.response?.status === 404) {
              res = await axios.post(getApiUrl("/api/employer/forgot-password"), {
                email: email.trim(),
              });
            } else {
              throw err2;
            }
          }
        } else {
          throw err;
        }
      }
      return res.data;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || "Failed to send reset OTP to email"
      );
    }
  }
);

/**
 * 4.3 EMPLOYER FORGOT PASSWORD - STEP 2 (VERIFY OTP)
 * POST /api/employer/user/verifypassotp
 * Aliases: /api/employer/verifypassotp, /api/employer/verify-pass-otp
 */
export const verifyOtp = createAsyncThunk(
  "auth/verifyOtp",
  async ({ email, otp }, { rejectWithValue }) => {
    try {
      let res;
      try {
        res = await axios.post(getApiUrl("/api/employer/user/verifypassotp"), {
          email: email.trim(),
          otp: String(otp).trim(),
        });
      } catch (err) {
        if (err.response?.status === 404) {
          try {
            res = await axios.post(getApiUrl("/api/employer/verifypassotp"), {
              email: email.trim(),
              otp: String(otp).trim(),
            });
          } catch (err2) {
            if (err2.response?.status === 404) {
              res = await axios.post(getApiUrl("/api/employer/verify-pass-otp"), {
                email: email.trim(),
                otp: String(otp).trim(),
              });
            } else {
              throw err2;
            }
          }
        } else {
          throw err;
        }
      }
      return res.data;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || "Invalid or expired OTP"
      );
    }
  }
);

/**
 * 4.4 EMPLOYER FORGOT PASSWORD - STEP 3 (RESET PASSWORD)
 * POST /api/employer/user/resetpassword
 * Aliases: /api/employer/resetpassword, /api/employer/reset-password
 */
export const resetPassword = createAsyncThunk(
  "auth/resetPassword",
  async ({ email, newPassword }, { rejectWithValue }) => {
    try {
      let res;
      try {
        res = await axios.post(getApiUrl("/api/employer/user/resetpassword"), {
          email: email.trim(),
          newPassword,
        });
      } catch (err) {
        if (err.response?.status === 404) {
          try {
            res = await axios.post(getApiUrl("/api/employer/resetpassword"), {
              email: email.trim(),
              newPassword,
            });
          } catch (err2) {
            if (err2.response?.status === 404) {
              res = await axios.post(getApiUrl("/api/employer/reset-password"), {
                email: email.trim(),
                newPassword,
              });
            } else {
              throw err2;
            }
          }
        } else {
          throw err;
        }
      }
      return res.data;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || "Failed to reset password"
      );
    }
  }
);

/**
 * Google Sign-In
 * POST /api/employer/google-login
 */
export const googleLogin = createAsyncThunk(
  "auth/googleLogin",
  async ({ idToken }, { rejectWithValue }) => {
    try {
      const res = await axios.post(getApiUrl("/api/employer/google-login"), { idToken });
      return res.data;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || "No account is associated with this Google account. Please register first."
      );
    }
  }
);

// ─── Initial State ──────────────────────────────────────────────────────────
const initialState = {
  token: getStoredToken(),
  employer: getStoredEmployer(),
  user: getStoredEmployer(),
  resetEmail: getStoredResetEmail(),
  otpVerified: getStoredOtpVerified(),
  loading: false,
  error: null,
};

// ─── Slice ──────────────────────────────────────────────────────────────────
const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    logout: (state) => {
      state.token = null;
      state.employer = null;
      state.user = null;
      state.resetEmail = "";
      state.otpVerified = false;
      state.error = null;
      state.loading = false;
      try {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        localStorage.removeItem("employer");
        sessionStorage.removeItem("resetPasswordEmail");
        sessionStorage.removeItem("resetPasswordOtpVerified");
      } catch {}
    },
    setResetEmail: (state, action) => {
      state.resetEmail = action.payload;
      try {
        sessionStorage.setItem("resetPasswordEmail", action.payload);
      } catch {}
    },
    clearError: (state) => {
      state.error = null;
    },
    resetForgotPasswordFlow: (state) => {
      state.otpVerified = false;
      state.resetEmail = "";
      try {
        sessionStorage.removeItem("resetPasswordEmail");
        sessionStorage.removeItem("resetPasswordOtpVerified");
      } catch {}
    },
  },

  extraReducers: (builder) => {
    builder
      // 4.1 LOGIN WITH EMAIL & PASSWORD
      .addCase(loginWithPassword.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginWithPassword.fulfilled, (state, action) => {
        state.loading = false;
        state.error = null;
        let token = action.payload?.token || action.payload?.data?.token || action.payload?.accessToken || action.payload?.data?.accessToken || action.payload?.jwt || action.payload?.data?.jwt;
        if (token && typeof token === "string") { token = token.replace(/^Bearer\s+/i, "").trim(); }
        const employerData = action.payload?.employer || action.payload?.user || action.payload?.data;

        if (token) {
          state.token = token;
          try {
            localStorage.setItem("token", token);
          } catch {}
        }
        if (employerData) {
          state.employer = employerData;
          state.user = employerData;
          try {
            localStorage.setItem("employer", JSON.stringify(employerData));
            localStorage.setItem("user", JSON.stringify(employerData));
          } catch {}
        }
      })
      .addCase(loginWithPassword.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // 4.2 FORGOT PASSWORD - STEP 1 (REQUEST RESET OTP)
      .addCase(forgotPasswordMail.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(forgotPasswordMail.fulfilled, (state, action) => {
        state.loading = false;
        state.error = null;
      })
      .addCase(forgotPasswordMail.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // 4.3 FORGOT PASSWORD - STEP 2 (VERIFY OTP)
      .addCase(verifyOtp.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(verifyOtp.fulfilled, (state) => {
        state.loading = false;
        state.error = null;
        state.otpVerified = true;
        try {
          sessionStorage.setItem("resetPasswordOtpVerified", "true");
        } catch {}
      })
      .addCase(verifyOtp.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // 4.4 FORGOT PASSWORD - STEP 3 (RESET PASSWORD)
      .addCase(resetPassword.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(resetPassword.fulfilled, (state) => {
        state.loading = false;
        state.error = null;
        state.resetEmail = "";
        state.otpVerified = false;
        try {
          sessionStorage.removeItem("resetPasswordEmail");
          sessionStorage.removeItem("resetPasswordOtpVerified");
        } catch {}
      })
      .addCase(resetPassword.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // GOOGLE LOGIN
      .addCase(googleLogin.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(googleLogin.fulfilled, (state, action) => {
        state.loading = false;
        state.error = null;
        let token = action.payload?.token || action.payload?.data?.token || action.payload?.accessToken || action.payload?.data?.accessToken || action.payload?.jwt || action.payload?.data?.jwt;
        if (token && typeof token === "string") { token = token.replace(/^Bearer\s+/i, "").trim(); }
        const employerData = action.payload?.employer || action.payload?.user || action.payload?.data;

        if (token) {
          state.token = token;
          try {
            localStorage.setItem("token", token);
          } catch {}
        }
        if (employerData) {
          state.employer = employerData;
          state.user = employerData;
          try {
            localStorage.setItem("employer", JSON.stringify(employerData));
            localStorage.setItem("user", JSON.stringify(employerData));
          } catch {}
        }
      })
      .addCase(googleLogin.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // GOOGLE SIGNUP
      .addCase(googleSignup.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(googleSignup.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(googleSignup.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const {
  logout,
  setResetEmail,
  clearError,
  resetForgotPasswordFlow,
} = authSlice.actions;

export default authSlice.reducer;
