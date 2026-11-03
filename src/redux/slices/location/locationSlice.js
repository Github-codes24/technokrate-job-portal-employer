import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axiosInstance from "../../../api/axiosInstance";

// ─── Async Thunks ────────────────────────────────────────────────────────────

// 0. Get All Countries
export const fetchCountries = createAsyncThunk(
  "location/fetchCountries",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get("/api/location/countries");
      const list = response.data?.data;
      return Array.isArray(list) ? list : [];
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || "Failed to fetch countries"
      );
    }
  }
);

// 1. Get All States (/api/location/states?countryCode=IN)
export const fetchStates = createAsyncThunk(
  "location/fetchStates",
  async (countryCode = "IN", { rejectWithValue }) => {
    try {
      const code = typeof countryCode === "string" ? countryCode : (countryCode?.countryCode || "IN");
      const response = await axiosInstance.get(
        `/api/location/states?countryCode=${encodeURIComponent(code)}`
      );
      const list = response.data?.data;
      return Array.isArray(list) ? list : [];
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || "Failed to fetch states"
      );
    }
  }
);

// 2. Get Cities by Country & State (/api/location/cities?countryCode=IN&stateCode=MH)
export const fetchCitiesByState = createAsyncThunk(
  "location/fetchCitiesByState",
  async (params, { rejectWithValue }) => {
    let countryCode = "IN";
    let stateCode = "";
    let stateKey = "";

    if (typeof params === "string") {
      stateCode = params.trim();
      stateKey = params.trim();
    } else if (params && typeof params === "object") {
      countryCode = params.countryCode || "IN";
      stateCode = params.stateCode || params.isoCode || params.stateName || "";
      stateKey = params.stateName || params.stateCode || params.isoCode || "";
    }

    if (!stateCode) {
      return { stateName: stateKey || "", cities: [] };
    }

    try {
      const query = new URLSearchParams();
      if (countryCode) query.append("countryCode", countryCode);
      if (stateCode) query.append("stateCode", stateCode);

      const response = await axiosInstance.get(
        `/api/location/cities?${query.toString()}`
      );
      const list = response.data?.data;
      return {
        stateName: stateKey || stateCode,
        cities: Array.isArray(list) ? list : [],
      };
    } catch (err) {
      // Fallback: try path param if backend supports /api/location/cities/:stateName
      try {
        const response = await axiosInstance.get(
          `/api/location/cities/${encodeURIComponent(stateCode)}`
        );
        const list = response.data?.data;
        return {
          stateName: stateKey || stateCode,
          cities: Array.isArray(list) ? list : [],
        };
      } catch (fallbackErr) {
        return rejectWithValue(
          err.response?.data?.message || `Failed to fetch cities for ${stateCode}`
        );
      }
    }
  }
);

// ─── Slice ───────────────────────────────────────────────────────────────────

const initialState = {
  countries: [],
  countriesLoading: false,
  countriesError: null,

  states: [],
  statesLoading: false,
  statesError: null,

  // Cache: { [stateName]: ["City1", "City2", ...] }
  citiesByState: {},
  citiesLoading: false,
  citiesError: null,
};

const locationSlice = createSlice({
  name: "location",
  initialState,
  reducers: {
    clearCitiesCache(state) {
      state.citiesByState = {};
    },
  },
  extraReducers: (builder) => {
    // fetchCountries
    builder
      .addCase(fetchCountries.pending, (state) => {
        state.countriesLoading = true;
        state.countriesError = null;
      })
      .addCase(fetchCountries.fulfilled, (state, action) => {
        state.countriesLoading = false;
        state.countries = action.payload;
      })
      .addCase(fetchCountries.rejected, (state, action) => {
        state.countriesLoading = false;
        state.countriesError = action.payload;
      });

    // fetchStates
    builder
      .addCase(fetchStates.pending, (state) => {
        state.statesLoading = true;
        state.statesError = null;
      })
      .addCase(fetchStates.fulfilled, (state, action) => {
        state.statesLoading = false;
        state.states = action.payload;
      })
      .addCase(fetchStates.rejected, (state, action) => {
        state.statesLoading = false;
        state.statesError = action.payload;
      });

    // fetchCitiesByState
    builder
      .addCase(fetchCitiesByState.pending, (state) => {
        state.citiesLoading = true;
        state.citiesError = null;
      })
      .addCase(fetchCitiesByState.fulfilled, (state, action) => {
        state.citiesLoading = false;
        const { stateName, cities } = action.payload;
        if (stateName) {
          state.citiesByState[stateName] = cities;
        }
      })
      .addCase(fetchCitiesByState.rejected, (state, action) => {
        state.citiesLoading = false;
        state.citiesError = action.payload;
      });
  },
});

export const { clearCitiesCache } = locationSlice.actions;
export default locationSlice.reducer;
