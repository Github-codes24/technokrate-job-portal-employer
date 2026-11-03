import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axiosInstance from "../../../api/axiosInstance";

// GET /api/employer/category/categories
export const getAllCategories = createAsyncThunk(
  "category/getAllCategories",
  async (_, { rejectWithValue }) => {
    try {
      const res = await axiosInstance.get("/api/employer/category/categories");
      return res.data.data; // [{ _id, name, image, status }]
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Failed to fetch categories");
    }
  }
);

// GET /api/employer/category/subcategories/:categoryId
// Fetched on demand when a category is selected
export const getSubCategoriesByCategoryId = createAsyncThunk(
  "category/getSubCategoriesByCategoryId",
  async (categoryId, { rejectWithValue }) => {
    try {
      const res = await axiosInstance.get(
        `/api/employer/category/subcategories/${categoryId}`
      );
      return res.data.data; // [{ _id, name, categoryId }]
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Failed to fetch sub-categories");
    }
  }
);

// GET /api/employer/category/designations/:subCategoryId
// Fetched on demand when a sub-category is selected
export const getDesignationsBySubCategoryId = createAsyncThunk(
  "category/getDesignationsBySubCategoryId",
  async (subCategoryId, { rejectWithValue }) => {
    try {
      const res = await axiosInstance.get(
        `/api/employer/category/designations/${subCategoryId}`
      );
      return res.data.data; // [{ _id, name, subCategoryId }]
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Failed to fetch designations");
    }
  }
);

const categorySlice = createSlice({
  name: "category",
  initialState: {
    categories:    [],
    subCategories: [],
    designations:  [],
    loading:       false,
    subLoading:    false,
    desigLoading:  false,
    error:         null,
  },
  reducers: {
    clearCategoryError(state) { state.error = null; },
    // Reset dependent dropdowns when parent changes
    clearSubCategories(state) { state.subCategories = []; state.designations = []; },
    clearDesignations(state)  { state.designations  = []; },
  },
  extraReducers: (builder) => {
    // getAllCategories
    builder
      .addCase(getAllCategories.pending,   (s) => { s.loading = true;  s.error = null; })
      .addCase(getAllCategories.fulfilled, (s, a) => { s.loading = false; s.categories = a.payload; })
      .addCase(getAllCategories.rejected,  (s, a) => { s.loading = false; s.error = a.payload; });

    // getSubCategoriesByCategoryId
    builder
      .addCase(getSubCategoriesByCategoryId.pending,   (s) => { s.subLoading = true;  s.error = null; s.subCategories = []; s.designations = []; })
      .addCase(getSubCategoriesByCategoryId.fulfilled, (s, a) => { s.subLoading = false; s.subCategories = a.payload; })
      .addCase(getSubCategoriesByCategoryId.rejected,  (s, a) => { s.subLoading = false; s.error = a.payload; });

    // getDesignationsBySubCategoryId
    builder
      .addCase(getDesignationsBySubCategoryId.pending,   (s) => { s.desigLoading = true;  s.error = null; s.designations = []; })
      .addCase(getDesignationsBySubCategoryId.fulfilled, (s, a) => { s.desigLoading = false; s.designations = a.payload; })
      .addCase(getDesignationsBySubCategoryId.rejected,  (s, a) => { s.desigLoading = false; s.error = a.payload; });
  },
});

export const { clearCategoryError, clearSubCategories, clearDesignations } = categorySlice.actions;
export default categorySlice.reducer;