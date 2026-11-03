import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axiosInstance from "../../../api/axiosInstance";
import { syncCompanyClassification } from "../../../utils/subscriptionPolicy";

// ─── GET company profile ───────────────────────────────────────────────────────
export const getCompanyProfile = createAsyncThunk(
  "company/getProfile",
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await axiosInstance.get(
        "/api/employer/combine/getdetail",
      );
      syncCompanyClassification(data?.user ?? data);
      return data;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || "Failed to load company profile."
      );
    }
  }
);

// ─── PUT — update company profile ─────────────────────────────────────────────
export const updateCompanyProfile = createAsyncThunk(
  "company/updateProfile",
  async (formValues, { rejectWithValue }) => {
    try {
      const fd = new FormData();

      if (formValues.logoFile) fd.append("companyLogo", formValues.logoFile);
      if (formValues.bannerFile) fd.append("companyBanner", formValues.bannerFile);

      fd.append("companyDetail", JSON.stringify({
        companyName: formValues.companyName || "",
        companyTagline: formValues.tagline || "",
        companyWebsite: formValues.website || "",
        location: {
          countryCode: formValues.locationCountryCode || "IN",
          stateCode: formValues.locationStateCode || "MH",
          name: formValues.locationCityName || "",
          cityName: formValues.locationCityName || "",
        },
      }));

      fd.append("businessDetail", JSON.stringify({
        fundedIn: formValues.foundedIn || "",
        typeOfCompany: formValues.type || "",
        companySize: formValues.companySize || "",
        aboutCompany: formValues.about || "",
      }));

      const hiringPreferencePayload = {
        hiringFor: formValues.hiringFor || "",
        topHiringSkill: formValues.topSkills || "",
        averageHiringPerMonth: String(formValues.avgHiringPerMonth || ""),
      };

      if (
        formValues.jobLocationCountryCode &&
        formValues.jobLocationStateCode &&
        formValues.jobLocationCityName
      ) {
        hiringPreferencePayload.jobLocation = {
          countryCode: formValues.jobLocationCountryCode,
          stateCode: formValues.jobLocationStateCode,
          name: formValues.jobLocationCityName,
          cityName: formValues.jobLocationCityName,
        };
      }

      fd.append("hiringPreference", JSON.stringify(hiringPreferencePayload));

      fd.append("verificationAndDocumentation", JSON.stringify({
        companyLegalName: formValues.companyLegalName || "",
        companyRegisterNumber: formValues.regNumber || "",
        GSTNumber: formValues.gstNumber || "",
        CINNumber: formValues.cinNumber || "",
      }));

      const { data } = await axiosInstance.put(
        `/api/employer/combine/updatedetail`,
        fd,
      );

      return data;
    } catch (err) {
      console.error("updateCompanyProfile - Error details:", {
        status: err.response?.status,
        data: err.response?.data,
        headers: err.response?.headers,
        message: err.message,
        payload: formValues
      });
      return rejectWithValue(
        err.response?.data?.message || "Failed to update company profile."
      );
    }
  }
);

// ─── POST — submit all 4 steps in one multipart request (onboarding) ──────────
export const submitCompanyProfile = createAsyncThunk(
  "company/submitProfile",
  async (_, { getState, rejectWithValue }) => {
    try {
      const {
        companyDetail,
        businessDetail,
        hiringPreference,
        verificationAndDocumentation,
      } = getState().company;

      const formData = new FormData();

      if (companyDetail.logo) formData.append("companyLogo", companyDetail.logo);
      if (companyDetail.banner) formData.append("companyBanner", companyDetail.banner);

      formData.append("companyDetail", JSON.stringify({
        companyTagline: companyDetail.tagline,
        companyWebsite: companyDetail.website,
        location: {
          countryCode: companyDetail.location.countryCode,
          stateCode: companyDetail.location.stateCode,
          // Send both keys for backend compatibility.
          name: companyDetail.location.cityName,
          cityName: companyDetail.location.cityName,
        },
      }));

      formData.append("businessDetail", JSON.stringify({
        fundedIn: businessDetail.foundedIn,
        typeOfCompany: businessDetail.type,
        companySize: businessDetail.companySize,
        aboutCompany: businessDetail.about,
      }));

      formData.append("hiringPreference", JSON.stringify({
        hiringFor: hiringPreference.hiringFor,
        jobLocation: {
          countryCode: hiringPreference.jobLocation.countryCode,
          stateCode: hiringPreference.jobLocation.stateCode,
          // Send both keys for backend compatibility.
          name: hiringPreference.jobLocation.cityName,
          cityName: hiringPreference.jobLocation.cityName,
        },
        topHiringSkill: hiringPreference.skills,
        averageHiringPerMonth: String(hiringPreference.avgPerMonth),
      }));

      formData.append("verificationAndDocumentation", JSON.stringify({
        companyLegalName: verificationAndDocumentation.legalName,
        companyRegisterNumber: verificationAndDocumentation.regNumber,
        GSTNumber: verificationAndDocumentation.gstNumber,
        CINNumber: verificationAndDocumentation.cinNumber,
      }));

      const { data } = await axiosInstance.post(
        `/api/employer/combine/createdetail`,
        formData,
      );

      return data;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || "Something went wrong. Please try again."
      );
    }
  }
);

// ─── Slice ────────────────────────────────────────────────────────────────────
const initialState = {
  companyDetail: { tagline: "", website: "", location: null, logo: null, banner: null },
  businessDetail: { foundedIn: "", type: "", companySize: "", about: "" },
  hiringPreference: { hiringFor: "", jobLocation: null, skills: "", avgPerMonth: "" },
  verificationAndDocumentation: { legalName: "", regNumber: "", gstNumber: "", cinNumber: "", authorized: false },

  profileData: null,
  profileLoading: false,
  profileError: null,

  loading: false,
  updateLoading: false,
  error: null,
  success: false,
};

const companySlice = createSlice({
  name: "company",
  initialState,
  reducers: {
    saveCompanyDetail(state, { payload }) { state.companyDetail = { ...state.companyDetail, ...payload }; },
    saveBusinessDetail(state, { payload }) { state.businessDetail = { ...state.businessDetail, ...payload }; },
    saveHiringPreference(state, { payload }) { state.hiringPreference = { ...state.hiringPreference, ...payload }; },
    saveVerification(state, { payload }) { state.verificationAndDocumentation = { ...state.verificationAndDocumentation, ...payload }; },
    clearCompanyError(state) { state.error = null; state.profileError = null; },
    resetSuccess(state) { state.success = false; },  // ✅ added
    resetCompany: () => initialState,
  },
  extraReducers: (builder) => {

    // GET profile
    builder
      .addCase(getCompanyProfile.pending, (s) => { s.profileLoading = true; s.profileError = null; })
      .addCase(getCompanyProfile.fulfilled, (s, { payload }) => { s.profileLoading = false; s.profileData = payload.user; })
      .addCase(getCompanyProfile.rejected, (s, { payload }) => { s.profileLoading = false; s.profileError = payload; });

    // UPDATE profile
    builder
      .addCase(updateCompanyProfile.pending, (s) => { s.updateLoading = true; s.error = null; s.success = false; })
      .addCase(updateCompanyProfile.fulfilled, (s, { payload }) => {
        s.updateLoading = false;
        s.success = true;
        s.profileData = payload.user;
      })
      .addCase(updateCompanyProfile.rejected, (s, { payload }) => { s.updateLoading = false; s.error = payload; });

    // POST / onboarding submit
    builder
      .addCase(submitCompanyProfile.pending, (s) => { s.loading = true; s.error = null; s.success = false; })
      .addCase(submitCompanyProfile.fulfilled, (s, { payload }) => { s.loading = false; s.success = true; s.profileData = payload.user; })
      .addCase(submitCompanyProfile.rejected, (s, { payload }) => { s.loading = false; s.error = payload; });
  },
});

export const {
  saveCompanyDetail, saveBusinessDetail, saveHiringPreference,
  saveVerification, clearCompanyError, resetSuccess, resetCompany,
} = companySlice.actions;

export default companySlice.reducer;
