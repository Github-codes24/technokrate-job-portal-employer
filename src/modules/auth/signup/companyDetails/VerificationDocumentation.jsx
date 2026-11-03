import React from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { useFormik } from "formik";
import * as Yup from "yup";
import { toast } from "react-toastify";
import { Loader2 } from "lucide-react";

import OnboardingLayout from "../OnboardingLayout";
import Illustration from "../../../../assets/auth/signup/verification.svg";
import {
  saveVerification,
  submitCompanyProfile,
  clearCompanyError,
} from "../../../../redux/slices/company/companySlice";

// ─── Validation ───────────────────────────────────────────────────────────────
const validationSchema = Yup.object({
  legalName: Yup.string().required("Legal name is required"),
  regNumber: Yup.string().required("Registration number is required"),
  gstNumber: Yup.string().required("GST number is required"),
  cinNumber: Yup.string().required("CIN number is required"),
  authorized: Yup.boolean().oneOf([true], "You must confirm authorization"),
});

// ─── Component ────────────────────────────────────────────────────────────────
const VerificationDocumentation = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { loading, error } = useSelector((s) => s.company);
  const saved = useSelector((s) => s.company.verificationAndDocumentation);

  const formik = useFormik({
    initialValues: {
      legalName: saved.legalName || "",
      regNumber: saved.regNumber || "",
      gstNumber: saved.gstNumber || "",
      cinNumber: saved.cinNumber || "",
      authorized: saved.authorized || false,
    },
    validationSchema,
    onSubmit: async (values) => {
      // 1. Persist step 4 data into Redux synchronously
      dispatch(saveVerification(values));

      // 2. Fire the combined API — thunk reads all 4 steps from Redux state
      const result = await dispatch(submitCompanyProfile());

      if (submitCompanyProfile.fulfilled.match(result)) {
        toast.success("Company profile created successfully! 🎉");
        navigate("/onboarding/all-set");
      } else {
        // error is already in Redux state; toast for visibility
        toast.error(result.payload || "Submission failed. Please try again.");
      }
    },
  });

  const inputCls = (field) =>
    `w-full bg-[#F7F8F9] border p-3 rounded-md outline-none focus:ring-2 focus:ring-violet-400 transition text-sm placeholder-gray-400
    ${formik.touched[field] && formik.errors[field] ? "border-red-400" : "border-gray-200"}`;

  return (
    <OnboardingLayout
      illustration={Illustration}
      currentStep={4}
      showBack
      onBack={() => {
        dispatch(clearCompanyError());
        navigate("/onboarding/hiring-preferences");
      }}
    >
      <h2 className="text-xl font-bold text-center text-gray-900 mb-5">
        Verification &amp; Documentation
      </h2>

      <form onSubmit={formik.handleSubmit} className="space-y-3">
        {/* ── Company Legal Name ── */}
        <div>
          <input
            name="legalName"
            placeholder="Company Legal Name"
            value={formik.values.legalName}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            className={inputCls("legalName")}
          />
          {formik.touched.legalName && formik.errors.legalName && (
            <p className="text-xs text-red-500 mt-0.5">
              {formik.errors.legalName}
            </p>
          )}
        </div>

        {/* ── Registration Number ── */}
        <div>
          <input
            name="regNumber"
            placeholder="Company Registration Number"
            value={formik.values.regNumber}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            className={inputCls("regNumber")}
          />
          {formik.touched.regNumber && formik.errors.regNumber && (
            <p className="text-xs text-red-500 mt-0.5">
              {formik.errors.regNumber}
            </p>
          )}
        </div>

        {/* ── GST Number ── */}
        <div>
          <input
            name="gstNumber"
            placeholder="GST Number"
            value={formik.values.gstNumber}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            className={inputCls("gstNumber")}
          />
          {formik.touched.gstNumber && formik.errors.gstNumber && (
            <p className="text-xs text-red-500 mt-0.5">
              {formik.errors.gstNumber}
            </p>
          )}
        </div>

        {/* ── CIN Number ── */}
        <div>
          <input
            name="cinNumber"
            placeholder="CIN Number"
            value={formik.values.cinNumber}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            className={inputCls("cinNumber")}
          />
          {formik.touched.cinNumber && formik.errors.cinNumber && (
            <p className="text-xs text-red-500 mt-0.5">
              {formik.errors.cinNumber}
            </p>
          )}
        </div>

        {/* ── Authorization Checkbox ── */}
        <div>
          <label className="flex items-start gap-2.5 cursor-pointer select-none">
            <div
              role="checkbox"
              aria-checked={formik.values.authorized}
              tabIndex={0}
              onKeyDown={(e) =>
                e.key === " " &&
                formik.setFieldValue("authorized", !formik.values.authorized)
              }
              onClick={() =>
                formik.setFieldValue("authorized", !formik.values.authorized)
              }
              className={`w-4 h-4 rounded border-2 flex-shrink-0 mt-0.5 flex items-center justify-center transition cursor-pointer
                ${formik.values.authorized ? "bg-[#7900BA] border-[#7900BA]" : "border-gray-300"}`}
            >
              {formik.values.authorized && (
                <svg
                  className="w-2.5 h-2.5 text-white"
                  viewBox="0 0 12 12"
                  fill="none"
                >
                  <path
                    d="M2 6l3 3 5-5"
                    stroke="white"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              )}
            </div>
            <span className="text-xs text-gray-600 leading-relaxed">
              I confirm that I am authorized to represent this company and all
              details provided are accurate.
            </span>
          </label>
          {formik.touched.authorized && formik.errors.authorized && (
            <p className="text-xs text-red-500 mt-0.5">
              {formik.errors.authorized}
            </p>
          )}
        </div>

        {/* ── API Error Banner ── */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-md px-3 py-2">
            <p className="text-xs text-red-600">{error}</p>
          </div>
        )}

        {/* ── Submit Button ── */}
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-[#7900BA] hover:bg-[#65009e] active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-md shadow-lg transition mt-2 flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Submitting…
            </>
          ) : (
            "Save and Continue"
          )}
        </button>
        <button
          type="button"
          onClick={async () => {
            // 1. Save empty/default verification data
            dispatch(
              saveVerification({
                legalName: "",
                regNumber: "",
                gstNumber: "",
                cinNumber: "",
                authorized: true, // important to pass validation
              }),
            );

            // 2. Call API
            const result = await dispatch(submitCompanyProfile());

            if (submitCompanyProfile.fulfilled.match(result)) {
              toast.success("Profile created successfully! 🎉");
              navigate("/onboarding/all-set");
            } else {
              toast.error(result.payload || "Submission failed");
            }
          }}
          className="w-full mt-3 border border-gray-300 text-gray-600 hover:bg-gray-100 font-medium py-3 rounded-md transition-all"
        >
          Skip this step
        </button>
      </form>
    </OnboardingLayout>
  );
};

export default VerificationDocumentation;
