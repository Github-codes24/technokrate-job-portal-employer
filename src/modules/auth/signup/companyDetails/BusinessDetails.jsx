import React from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { useFormik } from "formik";
import * as Yup from "yup";
import { toast } from "react-toastify";
import { ChevronDown } from "lucide-react";
import OnboardingLayout from "../OnboardingLayout";
import Illustration from "../../../../assets/auth/signup/businessdetail.svg";
import { saveBusinessDetail } from "../../../../redux/slices/company/companySlice";

// ─── Options ──────────────────────────────────────────────────────────────────
const YEARS = Array.from({ length: 75 }, (_, i) =>
  String(new Date().getFullYear() - i),
);

// typeOfCompany values sent to API — match what backend stores
const TYPES = [
  { label: "Private Limited", value: "PrivateLimited" },
  { label: "Public Limited", value: "PublicLimited" },
  { label: "Partnership", value: "Partnership" },
  { label: "LLP", value: "LLP" },
  { label: "Sole Proprietorship", value: "SoleProprietorship" },
  { label: "NGO", value: "NGO" },
  { label: "Service Based", value: "ServiceBased" },
  { label: "Product Based", value: "ProductBased" },
];

const SIZES = ["1-10", "11-50", "51-200", "201-500", "501-1000", "1000+"];

// ─── Validation ───────────────────────────────────────────────────────────────
const validationSchema = Yup.object({
  // foundedIn: Yup.string().required("Founded year is required"),
  // type: Yup.string().required("Company type is required"),
  // companySize: Yup.string().required("Company size is required"),
  about: Yup.string()
    .min(20, "At least 20 characters")
    // .required("About is required"),
});

// ─── Component ────────────────────────────────────────────────────────────────
const BusinessDetails = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  // Pre-fill from Redux on back-navigation
  const saved = useSelector((s) => s.company.businessDetail);

  const formik = useFormik({
    initialValues: {
      foundedIn: saved.foundedIn || "",
      type: saved.type || "",
      companySize: saved.companySize || "",
      about: saved.about || "",
    },
    validationSchema,
    onSubmit: (values) => {
      dispatch(saveBusinessDetail(values));
      toast.success("Business details saved!");
      navigate("/onboarding/hiring-preferences");
    },
  });

  const selectCls = (field) =>
    `w-full bg-[#F7F8F9] border p-3 rounded-md outline-none focus:ring-2 focus:ring-violet-400 transition text-sm appearance-none
    ${formik.touched[field] && formik.errors[field] ? "border-red-400" : "border-gray-200"}
    ${!formik.values[field] ? "text-gray-400" : "text-gray-800"}`;

  const inputCls = (field) =>
    `w-full bg-[#F7F8F9] border p-3 rounded-md outline-none focus:ring-2 focus:ring-violet-400 transition text-sm placeholder-gray-400
    ${formik.touched[field] && formik.errors[field] ? "border-red-400" : "border-gray-200"}`;

  return (
    <OnboardingLayout
      illustration={Illustration}
      currentStep={2}
      showBack
      onBack={() => navigate("/onboarding/company-details")}
    >
      <h2 className="text-2xl font-bold text-center text-gray-900 mb-6">
        Business Details
      </h2>

      <form onSubmit={formik.handleSubmit} className="space-y-4">
        {/* ── Row: Founded In + Type ── */}
        <div className="grid grid-cols-2 gap-3">
          {/* Founded In */}
          <div className="relative">
            <select
              name="foundedIn"
              value={formik.values.foundedIn}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              className={selectCls("foundedIn")}
            >
              <option value="" disabled>
                Founded In
              </option>
              {YEARS.map((y) => (
                <option key={y} value={y}>
                  {y}
                </option>
              ))}
            </select>
            <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
            {formik.touched.foundedIn && formik.errors.foundedIn && (
              <p className="text-[10px] text-red-500 mt-0.5">
                {formik.errors.foundedIn}
              </p>
            )}
          </div>

          {/* Type */}
          <div className="relative">
            <select
              name="type"
              value={formik.values.type}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              className={selectCls("type")}
            >
              <option value="" disabled>
                Type
              </option>
              {TYPES.map((t) => (
                <option key={t.value} value={t.value}>
                  {t.label}
                </option>
              ))}
            </select>
            <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
            {formik.touched.type && formik.errors.type && (
              <p className="text-[10px] text-red-500 mt-0.5">
                {formik.errors.type}
              </p>
            )}
          </div>
        </div>

        {/* ── Company Size ── */}
        <div className="relative">
          <select
            name="companySize"
            value={formik.values.companySize}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            className={`${selectCls("companySize")} pr-8`}
          >
            <option value="" disabled>
              Company Size
            </option>
            {SIZES.map((s) => (
              <option key={s} value={s}>
                {s} employees
              </option>
            ))}
          </select>
          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
          {formik.touched.companySize && formik.errors.companySize && (
            <p className="text-xs text-red-500 mt-0.5">
              {formik.errors.companySize}
            </p>
          )}
        </div>

        {/* ── About ── */}
        <div>
          <textarea
            name="about"
            placeholder="About Company"
            rows={4}
            value={formik.values.about}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            className={inputCls("about")}
          />
          {formik.touched.about && formik.errors.about && (
            <p className="text-xs text-red-500 mt-0.5">{formik.errors.about}</p>
          )}
        </div>

        <button
          type="submit"
          className="w-full bg-[#7900BA] hover:bg-[#65009e] active:scale-95 text-white font-semibold py-3 rounded-md shadow-lg transition"
        >
          Save and Continue
        </button>
        {/* Skip Button */}
        <button
          type="button"
          onClick={() => {
            dispatch(
              saveBusinessDetail({
                foundedIn: "",
                type: "",
                companySize: "",
                about: "",
              }),
            );
            toast.info("Skipped hiring preferences");
            navigate("/onboarding/hiring-preferences");
          }}
          className="w-full border border-gray-300 text-gray-600 hover:bg-gray-100 font-medium py-3 rounded-md transition-all"
        >
          Skip this step
        </button>
      </form>
    </OnboardingLayout>
  );
};

export default BusinessDetails;
