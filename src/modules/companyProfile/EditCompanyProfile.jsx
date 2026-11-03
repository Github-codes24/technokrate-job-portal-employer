import React, { useEffect, useRef, useState } from "react";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import {
  Pencil,
  ChevronLeft,
  ChevronRight,
  Building2,
  Globe,
  Phone,
  Mail,
  MapPin,
  Calendar,
  Users,
  Briefcase,
  FileText,
  Image,
  X,
  CheckCircle,
  AlertCircle,
  Save,
  Loader2,
} from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { Country, State, City } from "country-state-city";
import {
  getCompanyProfile,
  updateCompanyProfile,
  clearCompanyError,
  resetSuccess,
} from "../../redux/slices/company/companySlice";

// ─── Normalizers ──────────────────────────────────────────────────────────────
const normalizeWebsite = (value) => {
  if (!value) return "";
  const v = String(value).trim();
  if (!v) return "";
  if (v.startsWith("http://") || v.startsWith("https://")) return v;
  return `https://${v}`;
};

const normalizeYear = (value) => {
  if (value === null || value === undefined) return "";
  return String(value).trim();
};

const getImageUrl = (val) => {
  if (!val) return null;
  if (Array.isArray(val)) return val[0] || null;
  return val;
};

// ─── Year dropdown (newest first) ────────────────────────────────────────────
const currentYear = new Date().getFullYear();
const yearOptions = Array.from({ length: currentYear - 1799 }, (_, i) => {
  const y = currentYear - i;
  return { value: String(y), label: String(y) };
});

// ─── Per-tab Yup schemas ──────────────────────────────────────────────────────
const basicSchema = Yup.object().shape({
  companyName: Yup.string()
    .required("Company name is required")
    .min(2, "Min 2 characters")
    .max(100, "Too long")
    // This regex allows letters, numbers, spaces, and common punctuation like & or -
    .matches(
      /^[a-zA-Z0-9\s&-.]+$/,
      "Special characters like $, %, ^ are not allowed in company names",
    ),

  tagline: Yup.string().max(100, "Tagline is too long"),

  website: Yup.string()
    .nullable()
    .max(200, "Website URL is too long")
    .test(
      "is-valid-url",
      "Enter a valid URL (e.g., technokrate.com)",
      (value) => {
        if (!value || value.trim() === "") return true;
        // This ensures the website isn't just a number and has a TLD (like .com)
        const urlPattern =
          /^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([/\w .-]*)*\/?$/;
        return urlPattern.test(normalizeWebsite(value));
      },
    ),

  phoneNumber: Yup.string()
    .required("Phone number is required")
    .length(10, "Must be exactly 10 digits")
    .matches(/^[0-9]+$/, "Only numbers are allowed"),

  email: Yup.string()
    .required("Email is required")
    .max(100, "Email address is too long")
    .email("Enter a valid email address"),
});

const businessSchema = Yup.object().shape({
  about: Yup.string().max(1000, "Maximum 1000 characters allowed"),
  avgHiringPerMonth: Yup.string()
    .nullable()
    .max(5, "Hires per month is too long")
    .test("is-number", "Average hires must be a valid number", (val) => {
      if (!val || val.trim() === "") return true;
      return !isNaN(Number(val)) && Number(val) >= 0;
    }),
  jobLocationCountryCode: Yup.string().nullable(),
  jobLocationStateCode: Yup.string().nullable(),
  jobLocationCityName: Yup.string().nullable().test(
    "job-location-validation",
    "Please provide valid country, state and city for job location",
    function (value) {
      const { jobLocationCountryCode, jobLocationStateCode } = this.parent;
      const hasAnyLocation =
        Boolean(jobLocationCountryCode) || Boolean(jobLocationStateCode) || Boolean(value);
      const hasAllLocation =
        Boolean(jobLocationCountryCode) &&
        Boolean(jobLocationStateCode) &&
        Boolean(value);
      return !hasAnyLocation || hasAllLocation;
    },
  ),
});

const legalSchema = Yup.object().shape({
  companyLegalName: Yup.string()
    .nullable()
    .max(120, "Legal company name is too long")
    .transform((curr, orig) => (orig === "" ? null : curr))
    .matches(/^[a-zA-Z\s.]+$/, "Company name should only contain alphabets")
    .min(3, "Too short"),

  regNumber: Yup.string()
    .nullable()
    .max(30, "Registration number is too long")
    .transform((curr, orig) => (orig === "" ? null : curr))
    .matches(/^[a-zA-Z0-9]+$/, "Registration number should be alphanumeric"),

  gstNumber: Yup.string()
    .nullable()
    .max(15, "GST number must be 15 characters")
    .transform((curr, orig) => (orig === "" ? null : curr))
    .matches(
      /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/,
      "Invalid GST format (e.g., 27AAAAA0000A1Z5)",
    ),

  cinNumber: Yup.string()
    .nullable()
    .max(21, "CIN number must be 21 characters")
    .transform((curr, orig) => (orig === "" ? null : curr))
    .matches(
      /^([LUu]{1})([0-9]{5})([A-Za-z]{2})([0-9]{4})([A-Za-z]{3})([0-9]{6})$/,
      "Invalid CIN format (e.g., U12345MH2020PTC123456)",
    ),
});

const schemaByTab = {
  basic: basicSchema,
  business: businessSchema,
  legal: legalSchema,
};

// ─── Tabs config ──────────────────────────────────────────────────────────────
const TABS = [
  { id: "basic", label: "Basic Info", icon: Building2 },
  { id: "business", label: "Business Details", icon: Briefcase },
  { id: "legal", label: "Legal Info", icon: FileText },
];
const TAB_IDS = TABS.map((t) => t.id);

// ─── FormSection ──────────────────────────────────────────────────────────────
const FormSection = ({ title, icon: Icon, children, description }) => (
  <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden transition-all duration-300 hover:shadow-md">
    <div className="px-6 py-4 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white">
      <div className="flex items-center gap-2">
        <div className="p-1.5 bg-purple-100 rounded-lg">
          <Icon className="w-4 h-4 text-purple-600" />
        </div>
        <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
      </div>
      {description && (
        <p className="text-xs text-gray-500 mt-1 ml-8">{description}</p>
      )}
    </div>
    <div className="p-6">{children}</div>
  </div>
);

// ─── FormField ────────────────────────────────────────────────────────────────
const FormField = ({
  label,
  name,
  type = "text",
  placeholder,
  icon: Icon,
  as,
  options,
  children,
  required = false,
  ...rest
}) => (
  <div className="space-y-1.5">
    <label className="flex items-center gap-1.5 text-sm font-medium text-gray-700">
      {Icon && <Icon className="w-4 h-4 text-gray-400" />}
      {label}
      {required && <span className="text-red-500 ml-0.5">*</span>}
    </label>
    {children ? (
      children
    ) : as === "textarea" ? (
      <Field
        as="textarea"
        rows={4}
        name={name}
        placeholder={placeholder}
        className="w-full border border-purple-500/40 rounded-xl p-3 outline-none transition-all duration-200 focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 bg-gray-50/50 hover:bg-white resize-none"
        {...rest}
      />
    ) : as === "select" ? (
      <Field
        as="select"
        name={name}
        className="w-full border border-purple-500/40 rounded-xl p-3 outline-none transition-all duration-200 focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 bg-gray-50/50 hover:bg-white"
        {...rest}
      >
        <option value="">Select {label.toLowerCase()}</option>
        {options?.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </Field>
    ) : (
      <Field
        type={type}
        name={name}
        placeholder={placeholder}
        className="w-full border border-purple-500/40 rounded-xl p-3 outline-none transition-all duration-200 focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 bg-gray-50/50 hover:bg-white"
        {...rest}
      />
    )}
    <ErrorMessage name={name}>
      {(msg) => (
        <p className="text-red-500 text-xs flex items-center gap-1 mt-1">
          <AlertCircle className="w-3 h-3" /> {msg}
        </p>
      )}
    </ErrorMessage>
  </div>
);

// ─── Skills Tag Input ─────────────────────────────────────────────────────────
const SkillsInput = ({ skills, setSkills }) => {
  const [inputValue, setInputValue] = useState("");
  const inputRef = useRef();

  const addSkill = (raw) => {
    const skill = raw.trim();
    if (!skill || skills.includes(skill)) {
      setInputValue("");
      return;
    }
    setSkills([...skills, skill]);
    setInputValue("");
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      addSkill(inputValue);
    } else if (e.key === "Backspace" && inputValue === "" && skills.length > 0)
      setSkills(skills.slice(0, -1));
  };

  return (
    <div className="space-y-1.5">
      <label className="flex items-center gap-1.5 text-sm font-medium text-gray-700">
        <Briefcase className="w-4 h-4 text-gray-400" /> Top Hiring Skills
      </label>
      <div
        className="min-h-[48px] flex flex-wrap gap-2 border border-purple-500/40 rounded-xl p-2.5 bg-gray-50/50 hover:bg-white focus-within:ring-2 focus-within:ring-purple-500/20 focus-within:border-purple-500 transition-all duration-200 cursor-text"
        onClick={() => inputRef.current?.focus()}
      >
        {skills.map((skill, idx) => (
          <span
            key={idx}
            className="inline-flex items-center gap-1 px-2.5 py-1 bg-purple-100 text-purple-700 rounded-lg text-sm font-medium"
          >
            {skill}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setSkills(skills.filter((_, i) => i !== idx));
              }}
              className="ml-0.5 hover:text-purple-900 hover:bg-purple-200 rounded-full p-0.5 transition-colors"
            >
              <X className="w-3 h-3" />
            </button>
          </span>
        ))}
        <input
          ref={inputRef}
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          onBlur={() => addSkill(inputValue)}
          placeholder={
            skills.length === 0
              ? "Type a skill and press Enter or comma..."
              : "Add more..."
          }
          className="flex-1 min-w-[160px] bg-transparent outline-none text-sm text-gray-700 placeholder:text-gray-400"
        />
      </div>
      <p className="text-xs text-gray-400">
        Press{" "}
        <kbd className="px-1 py-0.5 bg-gray-100 rounded text-xs font-mono">
          Enter
        </kbd>{" "}
        or{" "}
        <kbd className="px-1 py-0.5 bg-gray-100 rounded text-xs font-mono">
          ,
        </kbd>{" "}
        to add ·{" "}
        <kbd className="px-1 py-0.5 bg-gray-100 rounded text-xs font-mono">
          Backspace
        </kbd>{" "}
        to remove last
      </p>
    </div>
  );
};

// ─── Cascading Location Selector ──────────────────────────────────────────────
const LocationSelector = ({
  countryField,
  stateField,
  cityField,
  setFieldValue,
  values,
}) => {
  const countries = Country.getAllCountries();
  const states = values[countryField]
    ? State.getStatesOfCountry(values[countryField])
    : [];
  const cities = values[stateField]
    ? City.getCitiesOfState(values[countryField], values[stateField])
    : [];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div className="space-y-1.5">
        <label className="flex items-center gap-1.5 text-sm font-medium text-gray-700">
          <Globe className="w-4 h-4 text-gray-400" /> Country
        </label>
        <select
          value={values[countryField] || ""}
          onChange={(e) => {
            setFieldValue(countryField, e.target.value);
            setFieldValue(stateField, "");
            setFieldValue(cityField, "");
          }}
          className="w-full border border-purple-500/40 rounded-xl p-3 outline-none transition-all duration-200 focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 bg-gray-50/50 hover:bg-white"
        >
          <option value="">Select country</option>
          {countries.map((c) => (
            <option key={c.isoCode} value={c.isoCode}>
              {c.name}
            </option>
          ))}
        </select>
      </div>

      <div className="space-y-1.5">
        <label className="flex items-center gap-1.5 text-sm font-medium text-gray-700">
          <MapPin className="w-4 h-4 text-gray-400" /> State
        </label>
        <select
          value={values[stateField] || ""}
          onChange={(e) => {
            setFieldValue(stateField, e.target.value);
            setFieldValue(cityField, "");
          }}
          disabled={!values[countryField]}
          className="w-full border border-purple-500/40 rounded-xl p-3 outline-none transition-all duration-200 focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 bg-gray-50/50 hover:bg-white disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <option value="">Select state</option>
          {states.map((s) => (
            <option key={s.isoCode} value={s.isoCode}>
              {s.name}
            </option>
          ))}
        </select>
      </div>

      <div className="space-y-1.5">
        <label className="flex items-center gap-1.5 text-sm font-medium text-gray-700">
          <MapPin className="w-4 h-4 text-gray-400" /> City
        </label>
        <select
          value={values[cityField] || ""}
          onChange={(e) => setFieldValue(cityField, e.target.value)}
          disabled={!values[stateField]}
          className="w-full border border-purple-500/40 rounded-xl p-3 outline-none transition-all duration-200 focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 bg-gray-50/50 hover:bg-white disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <option value="">Select city</option>
          {cities.map((c) => (
            <option key={c.name} value={c.name}>
              {c.name}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
};

// ─── Main Component ───────────────────────────────────────────────────────────
const EditCompanyProfile = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // ⚠️ Do NOT destructure `success` from the store — we handle outcomes
  // directly in handleSubmit via .unwrap() so there's no race with useEffect.
  const { profileData, profileLoading, updateLoading, error } = useSelector(
    (s) => s.company,
  );

  const [logoPreview, setLogoPreview] = useState(null);
  const [bannerPreview, setBannerPreview] = useState(null);
  const [logoFile, setLogoFile] = useState(null);
  const [bannerFile, setBannerFile] = useState(null);
  const [activeTab, setActiveTab] = useState("basic");
  const [skills, setSkills] = useState([]);
  const [completedTabs, setCompletedTabs] = useState([]);

  const logoInputRef = useRef();
  const bannerInputRef = useRef();

  const isLastTab = activeTab === TAB_IDS[TAB_IDS.length - 1];

  // ── Fetch on mount ─────────────────────────────────────────────────────────
  useEffect(() => {
    dispatch(resetSuccess());
    dispatch(getCompanyProfile());
    return () => {
      dispatch(resetSuccess());
    };
  }, [dispatch]);

  // ── API errors → toast only (no navigation side-effects here) ─────────────
  useEffect(() => {
    if (error) {
      toast.error(`❌ ${error}`);
      dispatch(clearCompanyError());
    }
  }, [error, dispatch]);

  // ── Populate state when profile loads ─────────────────────────────────────
  useEffect(() => {
    if (!profileData) return;
    setLogoPreview(getImageUrl(profileData.companyDetail?.companyLogo));
    setBannerPreview(getImageUrl(profileData.companyDetail?.companyBanner));
    const apiSkills = profileData.hiringPreference?.topHiringSkill;
    if (apiSkills) {
      if (Array.isArray(apiSkills)) setSkills(apiSkills);
      else if (typeof apiSkills === "string")
        setSkills(
          apiSkills
            .split(",")
            .map((s) => s.trim())
            .filter(Boolean),
        );
    }
  }, [profileData]);

  // ── Cleanup blob URLs on unmount ───────────────────────────────────────────
  useEffect(() => {
    return () => {
      if (logoPreview?.startsWith("blob:")) URL.revokeObjectURL(logoPreview);
      if (bannerPreview?.startsWith("blob:"))
        URL.revokeObjectURL(bannerPreview);
    };
  }, []);

  // ── Map API response to form values ───────────────────────────────────────
  const p = profileData?.user || profileData;
  const cd = p?.companyDetail ?? {};
  const bd = p?.businessDetail ?? {};
  const hp = p?.hiringPreference ?? {};
  const vd = p?.verificationAndDocumentation ?? {};

  const initialValues = {
    companyName: cd.companyName || p?.name || "",
    tagline: cd.companyTagline || "",
    website: normalizeWebsite(cd.companyWebsite || ""),
    phoneNumber: p?.mobileNumber
      ? String(p.mobileNumber).replace(/^\+91/, "").trim()
      : "",
    email: p?.email || "",
    locationCityName: cd.location?.name || "",
    locationCountryCode: cd.location?.countryCode || "IN",
    locationStateCode: cd.location?.stateCode || "MH",
    foundedIn: normalizeYear(bd.fundedIn || ""),
    type: bd.typeOfCompany || "",
    companySize: bd.companySize || "",
    about: bd.aboutCompany || "",
    hiringFor: hp.hiringFor || "",
    avgHiringPerMonth: hp.averageHiringPerMonth || "",
    jobLocationCountryCode: hp.jobLocation?.countryCode || "",
    jobLocationStateCode: hp.jobLocation?.stateCode || "",
    jobLocationCityName: hp.jobLocation?.name || "",
    companyLegalName: vd.companyLegalName || "",
    regNumber: vd.companyRegisterNumber || "",
    gstNumber: vd.GSTNumber || "",
    cinNumber: vd.CINNumber || "",
  };

  // ── Image handlers ─────────────────────────────────────────────────────────
  const handleLogoChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Logo must be less than 5MB");
      return;
    }
    setLogoFile(file);
    if (logoPreview?.startsWith("blob:")) URL.revokeObjectURL(logoPreview);
    setLogoPreview(URL.createObjectURL(file));
  };

  const handleBannerChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) {
      toast.error("Banner must be less than 10MB");
      return;
    }
    setBannerFile(file);
    if (bannerPreview?.startsWith("blob:")) URL.revokeObjectURL(bannerPreview);
    setBannerPreview(URL.createObjectURL(file));
  };

  const clearLogoPreview = () => {
    if (logoPreview?.startsWith("blob:")) URL.revokeObjectURL(logoPreview);
    setLogoPreview(null);
    setLogoFile(null);
    if (logoInputRef.current) logoInputRef.current.value = "";
  };

  const clearBannerPreview = () => {
    if (bannerPreview?.startsWith("blob:")) URL.revokeObjectURL(bannerPreview);
    setBannerPreview(null);
    setBannerFile(null);
    if (bannerInputRef.current) bannerInputRef.current.value = "";
  };

  // ── Dropdown options ───────────────────────────────────────────────────────
  const companyTypeOptions = [
    { value: "IT", label: "Information Technology" },
    { value: "ServiceBased", label: "Service Based" },
    { value: "ProductBased", label: "Product Based" },
    { value: "Startup", label: "Startup" },
    { value: "MNC", label: "MNC" },
    { value: "PrivateLimited", label: "Private Limited" },
    { value: "Government", label: "Government" },
  ];
  const companySizeOptions = [
    { value: "1-10", label: "1–10 employees" },
    { value: "11-50", label: "11–50 employees" },
    { value: "50-100", label: "50–100 employees" },
    { value: "100-500", label: "100–500 employees" },
    { value: "500-1000", label: "500-1000 employees" },
    { value: "1000+", label: "1000+ employees" },
  ];
  const hiringOptions = [
    { value: "Full Time", label: "Full-time" },
    { value: "Part Time", label: "Part-time" },
    { value: "Contract", label: "Contract" },
    { value: "Internship", label: "Internship" },
    { value: "Remote", label: "Remote" },
    { value: "Hybrid", label: "Hybrid" },
  ];

  const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

  const handleSubmit = async (values, { setSubmitting, setTouched }) => {
    const tabSchema = schemaByTab[activeTab];
    try {
      await tabSchema.validate(values, { abortEarly: false });
    } catch (yupErr) {
      const touched = {};
      yupErr.inner.forEach((e) => {
        if (e.path) touched[e.path] = true;
      });
      setTouched(touched, false);
      toast.error("Please fill all required fields");
      setSubmitting(false);
      return;
    }

    const payload = {
      ...values,

      phoneNumber: values.phoneNumber ? `+91${values.phoneNumber}` : "",

      location: {
        name: values.locationCityName || "",
        cityName: values.locationCityName || "",
        stateCode: values.locationStateCode || "",
        countryCode: values.locationCountryCode || "",
      },

      jobLocation: {
        name: values.jobLocationCityName || "",
        cityName: values.jobLocationCityName || "",
        stateCode: values.jobLocationStateCode || "",
        countryCode: values.jobLocationCountryCode || "",
      },

      topSkills: skills.join(", "),
      logoFile,
      bannerFile,
    };

    try {
      await dispatch(updateCompanyProfile(payload)).unwrap();

      const currentIndex = TAB_IDS.indexOf(activeTab);
      const isLast = currentIndex === TAB_IDS.length - 1;

      if (!isLast) {
        toast.success(`✅ ${TABS[currentIndex].label} saved!`, {
          autoClose: 1800,
        });
        setCompletedTabs((prev) => [...new Set([...prev, activeTab])]);
        setActiveTab(TAB_IDS[currentIndex + 1]);
        window.scrollTo({ top: 0, behavior: "smooth" });
      } else {
        toast.success("🎉 Profile updated successfully!", {
          autoClose: 3000,
        });
        await wait(2800);
        navigate("/company-profile");
      }
    } catch (apiError) {
      toast.error(apiError || "Something went wrong");
    } finally {
      setSubmitting(false);
    }
  };

  // ─── Loading skeleton ──────────────────────────────────────────────────────
  if (profileLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-purple-50/20 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-gray-500 font-medium">Loading your profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-purple-50/30">
      <div className="max-w-9xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <button
            type="button"
            onClick={() => navigate("/company-profile")}
            className="p-2 hover:bg-gray-100 rounded-xl transition-colors group"
          >
            <ChevronLeft className="w-5 h-5 text-gray-500 group-hover:text-purple-600 transition-colors" />
          </button>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
              Edit Company Profile
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              Update your company information and branding
            </p>
          </div>
        </div>

        {/* Tabs — all freely clickable, no locks */}
        <div className="flex gap-1 mb-6 border-b border-gray-200">
          {TABS.map((tab) => {
            const isActive = activeTab === tab.id;
            const isDone = completedTabs.includes(tab.id);
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center cursor-pointer gap-2 px-5 py-2.5 text-sm font-medium rounded-t-xl transition-all ${isActive
                    ? "text-purple-700 border-b-2 border-purple-600 bg-purple-50/50"
                    : "text-gray-500 hover:text-gray-700 hover:bg-gray-100"
                  }`}
              >
                {isDone && !isActive ? (
                  <CheckCircle className="w-4 h-4 text-green-500" />
                ) : (
                  <tab.icon className="w-4 h-4" />
                )}
                {tab.label}
              </button>
            );
          })}
        </div>

        <Formik
          enableReinitialize
          initialValues={initialValues}
          validationSchema={schemaByTab[activeTab]}
          validateOnChange={false}
          validateOnBlur={true}
          onSubmit={handleSubmit}
        >
          {({ isSubmitting, values, setFieldValue }) => (
            <Form className="space-y-6">
              {/* ── Media — always visible ── */}
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="relative">
                  {/* Banner */}
                  <div
                    className="h-48 sm:h-56 bg-gradient-to-r from-purple-100 to-pink-100 relative overflow-hidden cursor-pointer group"
                    onClick={() => bannerInputRef.current?.click()}
                  >
                    {bannerPreview ? (
                      <>
                        <img
                          src={bannerPreview}
                          alt="Banner"
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <div className="bg-white/90 rounded-full p-2">
                            <Image className="w-5 h-5 text-purple-600" />
                          </div>
                        </div>
                      </>
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center gap-2">
                        <div className="p-3 bg-white/80 rounded-full">
                          <Image className="w-6 h-6 text-purple-500" />
                        </div>
                        <p className="text-sm text-gray-600 font-medium">
                          Click to upload banner image
                        </p>
                        <p className="text-xs text-gray-500">
                          Recommended: 1200 x 300px
                        </p>
                      </div>
                    )}
                    {bannerPreview && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          clearBannerPreview();
                        }}
                        className="absolute cursor-pointer top-3 right-3 p-1.5 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors z-10"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    )}
                    <input
                      ref={bannerInputRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleBannerChange}
                    />
                  </div>

                  {/* Logo */}
                  <div className="absolute -bottom-12 left-6">
                    <div className="relative">
                      <div
                        className="w-24 h-24 bg-white rounded-2xl shadow-lg border-4 border-white flex items-center justify-center overflow-hidden cursor-pointer group"
                        onClick={() => logoInputRef.current?.click()}
                      >
                        {logoPreview ? (
                          <img
                            src={logoPreview}
                            alt="Logo"
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full bg-gradient-to-br from-purple-100 to-purple-200 flex items-center justify-center">
                            <Building2 className="w-10 h-10 text-purple-500" />
                          </div>
                        )}
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <Pencil className="w-5 h-5 text-white" />
                        </div>
                      </div>
                      {logoPreview && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            clearLogoPreview();
                          }}
                          className="absolute cursor-pointer -top-2 -right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors shadow-md"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      )}
                      <input
                        ref={logoInputRef}
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleLogoChange}
                      />
                    </div>
                  </div>
                </div>
                <div className="pt-14 pb-4 px-6 border-t border-gray-100">
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <CheckCircle className="w-3.5 h-3.5 text-green-500" />
                    <span>
                      Logo and banner images help your company stand out
                    </span>
                  </div>
                </div>
              </div>

              {/* ── BASIC INFO ── */}
              {activeTab === "basic" && (
                <FormSection
                  title="Basic Information"
                  icon={Building2}
                  description="Core details about your company"
                >
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <FormField
                      label="Company Name"
                      name="companyName"
                      maxLength={100}
                      icon={Building2}
                      placeholder="e.g., Acme Inc."
                      required
                      onChange={(e) => {
                        const val = e.target.value.replace(
                          /[^a-zA-Z0-9\s&-.]/g,
                          "",
                        );
                        setFieldValue("companyName", val);
                      }}
                    />
                    <FormField
                      label="Tagline"
                      name="tagline"
                      maxLength={100}
                      icon={Pencil}
                      placeholder="e.g., Building the future"
                    />
                    <FormField
                      label="Website"
                      name="website"
                      maxLength={200}
                      icon={Globe}
                      placeholder="https://example.com"
                    />

                    {/* Phone Number with Fixed Prefix */}
                    <div className="space-y-1.5">
                      <label className="flex items-center gap-1.5 text-sm font-medium text-gray-700">
                        <Phone className="w-4 h-4 text-gray-400" /> Phone Number
                        <span className="text-red-500 ml-0.5">*</span>
                      </label>

                      <div className="relative flex items-center">
                        {/* Fixed UI Prefix */}
                        <span className="absolute left-4 text-gray-500 font-medium pointer-events-none border-r border-gray-300 pr-2">
                          +91
                        </span>

                        <Field
                          type="tel"
                          name="phoneNumber"
                          maxLength={10}
                          placeholder="98232 08312"
                          className="w-full border border-purple-500/40 rounded-xl p-3 pl-14 outline-none transition-all duration-200 focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 bg-gray-50/50 hover:bg-white"
                          onChange={(e) => {
                            // Only allow digits and max 10 characters
                            const val = e.target.value
                              .replace(/\D/g, "")
                              .slice(0, 10);
                            setFieldValue("phoneNumber", val);
                          }}
                        />
                      </div>

                      <p className="text-xs text-gray-400">
                        Enter 10-digit mobile number
                      </p>

                      <ErrorMessage name="phoneNumber">
                        {(msg) => (
                          <p className="text-red-500 text-xs flex items-center gap-1 mt-1">
                            <AlertCircle className="w-3 h-3" /> {msg}
                          </p>
                        )}
                      </ErrorMessage>
                    </div>

                    {/* Email */}
                    <div className="space-y-1.5">
                      <label className="flex items-center gap-1.5 text-sm font-medium text-gray-700">
                        <Mail className="w-4 h-4 text-gray-400" /> Email Address
                        <span className="text-red-500 ml-0.5">*</span>
                      </label>
                      <Field
                        type="email"
                        name="email"
                        maxLength={100}
                        placeholder="contact@company.com"
                        className="w-full border border-purple-500/40 rounded-xl p-3 outline-none transition-all duration-200 focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 bg-gray-50/50 hover:bg-white"
                      />
                      <ErrorMessage name="email">
                        {(msg) => (
                          <p className="text-red-500 text-xs flex items-center gap-1">
                            <AlertCircle className="w-3 h-3" /> {msg}
                          </p>
                        )}
                      </ErrorMessage>
                    </div>
                  </div>

                  {/* Headquarters location */}
                  <div className="mt-5">
                    <p className="flex items-center gap-1.5 text-sm font-medium text-gray-700 mb-3">
                      <MapPin className="w-4 h-4 text-gray-400" /> Headquarters
                      Location
                    </p>
                    <LocationSelector
                      countryField="locationCountryCode"
                      stateField="locationStateCode"
                      cityField="locationCityName"
                      setFieldValue={setFieldValue}
                      values={values}
                    />
                  </div>
                </FormSection>
              )}

              {/* ── BUSINESS DETAILS ── */}
              {activeTab === "business" && (
                <>
                  <FormSection
                    title="About Company"
                    icon={Briefcase}
                    description="Information about your business operations"
                  >
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      <FormField
                        label="Founded Year"
                        name="foundedIn"
                        as="select"
                        icon={Calendar}
                        options={yearOptions}
                      />
                      <FormField
                        label="Company Type"
                        name="type"
                        as="select"
                        icon={Building2}
                        options={companyTypeOptions}
                      />
                      <FormField
                        label="Company Size"
                        name="companySize"
                        as="select"
                        icon={Users}
                        options={companySizeOptions}
                      />
                    </div>
                    <div className="mt-5">
                      <SkillsInput skills={skills} setSkills={setSkills} />
                    </div>
                  </FormSection>

                  <FormSection
                    title="About the Company"
                    icon={FileText}
                    description="Tell candidates about your mission and culture"
                  >
                    <FormField
                      label="About Company"
                      name="about"
                      as="textarea"
                      maxLength={1000}
                      placeholder="Describe your company's mission, values, and what makes it a great place to work..."
                    />
                  </FormSection>

                  <FormSection
                    title="Hiring Preferences"
                    icon={Users}
                    description="Define your recruitment needs"
                  >
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      <FormField
                        label="Hiring For"
                        name="hiringFor"
                        as="select"
                        icon={Briefcase}
                        options={hiringOptions}
                      />
                      <FormField
                        label="Average Hires/Month"
                        name="avgHiringPerMonth"
                        maxLength={5}
                        icon={Users}
                        placeholder="e.g., 5"
                      />
                    </div>
                    <div className="mt-5">
                      <p className="flex items-center gap-1.5 text-sm font-medium text-gray-700 mb-3">
                        <MapPin className="w-4 h-4 text-gray-400" /> Job
                        Location
                      </p>
                      <LocationSelector
                        countryField="jobLocationCountryCode"
                        stateField="jobLocationStateCode"
                        cityField="jobLocationCityName"
                        setFieldValue={setFieldValue}
                        values={values}
                      />
                    </div>
                  </FormSection>
                </>
              )}

              {/* ── LEGAL INFO ── */}
              {activeTab === "legal" && (
                <FormSection
                  title="Legal Information"
                  icon={FileText}
                  description="Verification details for your company"
                >
                  <div className="space-y-5">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      <FormField
                        label="Legal Company Name"
                        name="companyLegalName"
                        maxLength={120}
                        icon={Building2}
                        placeholder="Registered legal name"
                      />
                      <FormField
                        label="Registration Number"
                        name="regNumber"
                        maxLength={30}
                        icon={FileText}
                        placeholder="e.g., U12345MH2020PTC123456"
                      />
                      <FormField
                        label="GST Number"
                        name="gstNumber"
                        maxLength={15}
                        icon={FileText}
                        placeholder="e.g., 27AAAAA0000A1Z5"
                      />
                      <FormField
                        label="CIN Number"
                        name="cinNumber"
                        maxLength={21}
                        icon={FileText}
                        placeholder="e.g., U12345MH2020PTC123456"
                      />
                    </div>
                    <div className="bg-blue-50 rounded-xl p-4 flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
                      <p className="text-xs text-blue-700">
                        Please ensure these details match your official
                        documents exactly for verification.
                      </p>
                    </div>
                  </div>
                </FormSection>
              )}

              {/* ── Action Buttons ── */}
              <div className="flex items-center justify-between pt-4 pb-8 border-t border-gray-200">
                {/* Step pill indicator */}
                <div className="flex items-center gap-2">
                  {TABS.map((tab) => (
                    <div key={tab.id} className="flex items-center gap-1.5">
                      <div
                        className={`h-2 rounded-full transition-all duration-300 ${activeTab === tab.id
                            ? "w-6 bg-purple-600"
                            : completedTabs.includes(tab.id)
                              ? "w-2 bg-green-400"
                              : "w-2 bg-gray-200"
                          }`}
                      />
                    </div>
                  ))}
                  <span className="text-xs text-gray-400 ml-1">
                    Step {TAB_IDS.indexOf(activeTab) + 1} of {TABS.length}
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => navigate("/company-profile")}
                    className="px-6 py-2.5 text-gray-600 font-medium rounded-xl hover:bg-gray-100 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={updateLoading || isSubmitting}
                    className="bg-gradient-to-r from-purple-600 to-purple-700 text-white px-8 py-2.5 rounded-xl font-semibold hover:from-purple-700 hover:to-purple-800 transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-70 flex items-center gap-2"
                  >
                    {updateLoading || isSubmitting ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" /> Saving...
                      </>
                    ) : isLastTab ? (
                      <>
                        <Save className="w-4 h-4" /> Save Changes
                      </>
                    ) : (
                      <>
                        Save &amp; Next <ChevronRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </div>
              </div>
            </Form>
          )}
        </Formik>

        <div className="text-center py-6">
          <p className="text-xs text-gray-400">
            © 2025 MyJob – Technokrate Hire. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  );
};

export default EditCompanyProfile;
