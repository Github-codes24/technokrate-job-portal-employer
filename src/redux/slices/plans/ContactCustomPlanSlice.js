import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axiosInstance from "../../../api/axiosInstance";

export const submitContactCustomPlan = createAsyncThunk(
  "contactCustomPlan/submit",
  async (formData, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post("/api/employer/plan-query", formData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed to submit request");
    }
  }
);

const contactCustomPlanSlice = createSlice({
  name: "contactCustomPlan",
  initialState: { loading: false, success: false, error: null },
  reducers: {
    resetContactCustomPlan: (state) => {
      state.loading = false;
      state.success = false;
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(submitContactCustomPlan.pending, (state) => {
        state.loading = true;
        state.success = false;
        state.error = null;
      })
      .addCase(submitContactCustomPlan.fulfilled, (state) => {
        state.loading = false;
        state.success = true;
      })
      .addCase(submitContactCustomPlan.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "An error occurred";
      });
  }
});

export const { resetContactCustomPlan } = contactCustomPlanSlice.actions;
export default contactCustomPlanSlice.reducer;