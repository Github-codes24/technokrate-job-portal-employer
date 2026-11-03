import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axiosInstance from "../../../api/axiosInstance";

// ─── THUNKS ──────────────────────────────────────────────────────────────────

// 1. Get Employer Preferences
// GET /api/employer/settings/preferences
export const fetchPreferences = createAsyncThunk(
  "preferences/fetchPreferences",
  async (_, { rejectWithValue }) => {
    try {
      const res = await axiosInstance.get("/api/employer/settings/preferences");
      return res.data?.data || res.data;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || "Failed to fetch preferences"
      );
    }
  }
);

// 13. Get Preference Options (token)
// GET /api/employer/settings/preferences/options
export const fetchPreferenceOptions = createAsyncThunk(
  "preferences/fetchPreferenceOptions",
  async (_, { rejectWithValue }) => {
    try {
      const res = await axiosInstance.get("/api/employer/settings/preferences/options");
      return res.data?.data || res.data;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || "Failed to fetch preference options"
      );
    }
  }
);

// 12. Update Employer Preferences
// PUT /api/employer/settings/preferences
export const updatePreferences = createAsyncThunk(
  "preferences/updatePreferences",
  async (preferencesData, { rejectWithValue }) => {
    try {
      let res;
      try {
        res = await axiosInstance.put(
          "/api/employer/settings/preferences",
          preferencesData
        );
      } catch (e) {
        if (e.response?.status === 405) {
          res = await axiosInstance.patch(
            "/api/employer/settings/preferences",
            preferencesData
          );
        } else {
          throw e;
        }
      }
      return res.data?.data || res.data;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || "Failed to update preferences"
      );
    }
  }
);

// 14. Change Password (token)
// PUT /api/employer/settings/account/change-password
export const changePassword = createAsyncThunk(
  "preferences/changePassword",
  async ({ oldPassword, newPassword, confirmPassword }, { rejectWithValue }) => {
    try {
      const res = await axiosInstance.put(
        "/api/employer/settings/account/change-password",
        { oldPassword, newPassword, confirmPassword }
      );
      return res.data;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || "Failed to change password"
      );
    }
  }
);

// 15. Change Email (token)
// PUT /api/employer/settings/account/change-email
export const changeEmail = createAsyncThunk(
  "preferences/changeEmail",
  async ({ newEmail, password }, { rejectWithValue }) => {
    try {
      const res = await axiosInstance.put(
        "/api/employer/settings/account/change-email",
        { newEmail, password }
      );
      return res.data;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || "Failed to change email"
      );
    }
  }
);

// ─── SLICE ───────────────────────────────────────────────────────────────────

const preferencesSlice = createSlice({
  name: "preferences",
  initialState: {
    preferences: null,
    options: null,
    optionsLoading: false,
    loading: false,
    updateLoading: false,
    passwordLoading: false,
    emailLoading: false,
    error: null,
  },
  reducers: {
    clearPreferencesError: (state) => {
      state.error = null;
    },
    setLocalPreferences: (state, action) => {
      state.preferences = {
        ...state.preferences,
        ...action.payload,
      };
    },
  },
  extraReducers: (builder) => {
    builder
      // fetchPreferences
      .addCase(fetchPreferences.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPreferences.fulfilled, (state, action) => {
        state.loading = false;
        state.preferences = action.payload;
      })
      .addCase(fetchPreferences.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // fetchPreferenceOptions
      .addCase(fetchPreferenceOptions.pending, (state) => {
        state.optionsLoading = true;
      })
      .addCase(fetchPreferenceOptions.fulfilled, (state, action) => {
        state.optionsLoading = false;
        state.options = action.payload;
      })
      .addCase(fetchPreferenceOptions.rejected, (state, action) => {
        state.optionsLoading = false;
      })

      // updatePreferences
      .addCase(updatePreferences.pending, (state) => {
        state.updateLoading = true;
        state.error = null;
      })
      .addCase(updatePreferences.fulfilled, (state, action) => {
        state.updateLoading = false;
        state.preferences = {
          ...state.preferences,
          ...action.payload,
        };
      })
      .addCase(updatePreferences.rejected, (state, action) => {
        state.updateLoading = false;
        state.error = action.payload;
      })

      // changePassword
      .addCase(changePassword.pending, (state) => {
        state.passwordLoading = true;
        state.error = null;
      })
      .addCase(changePassword.fulfilled, (state) => {
        state.passwordLoading = false;
      })
      .addCase(changePassword.rejected, (state, action) => {
        state.passwordLoading = false;
        state.error = action.payload;
      })

      // changeEmail
      .addCase(changeEmail.pending, (state) => {
        state.emailLoading = true;
        state.error = null;
      })
      .addCase(changeEmail.fulfilled, (state) => {
        state.emailLoading = false;
      })
      .addCase(changeEmail.rejected, (state, action) => {
        state.emailLoading = false;
        state.error = action.payload;
      });
  },
});

export const { clearPreferencesError, setLocalPreferences } =
  preferencesSlice.actions;

export default preferencesSlice.reducer;
