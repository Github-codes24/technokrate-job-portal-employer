import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./slices/auth/SigninSlice";
import signupReducer from "./slices/auth/Signupslice";
import companyReducer from "./slices/company/companySlice";
import jobReducer from "./slices/companyJobs/jobSlice";
import categoryReducer from "./slices/category/categorySlice";
import databaseReducer from './slices/database/databaseSlice';
import candidateMatchesReducer from "./slices/companyJobs/getCandidateMatches";
import dashboardReducer from "./slices/dashboard/dashboardSlice";
import planReducer from "./slices/plans/planSlice";
import creditAndTransactionReducer from "./slices/creditTransaction/creditAndTransactionSlice";
import creditDeductionReducer from "./slices/candidateUnlock/creditDeductionSlice";
import contactReducer from "./slices/plans/ContactCustomPlanSlice";
import locationReducer from "./slices/location/locationSlice";
import notificationReducer from "./slices/notification/notificationSlice";
import preferencesReducer from "./slices/settings/preferencesSlice";
import supportReducer from "./slices/settings/supportSlice";
import staffingReducer from "./slices/staffing/staffingSlice";
import vacancyReducer from "./slices/vacancies/vacancySlice";

const store = configureStore({
  reducer: {
    auth: authReducer,
    signup: signupReducer,
    company: companyReducer,
    job: jobReducer,
    candidateMatches: candidateMatchesReducer,
    category: categoryReducer,
    database: databaseReducer,
    dashboard: dashboardReducer,
    plans: planReducer,
    creditAndTransaction: creditAndTransactionReducer,
    creditDeduction: creditDeductionReducer,
    contactCustomPlan: contactReducer,
    location: locationReducer,
    notification: notificationReducer,
    preferences: preferencesReducer,
    support: supportReducer,
    staffing: staffingReducer,
    vacancies: vacancyReducer,
  },
});

export default store;
