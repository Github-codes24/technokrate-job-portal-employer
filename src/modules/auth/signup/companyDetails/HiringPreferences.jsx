import React, { useRef, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { useFormik } from "formik";
import * as Yup from "yup";
import { toast } from "react-toastify";
import { ChevronDown, Search, X, MapPin, Globe, Building2 } from "lucide-react";
import { Country, State, City } from "country-state-city";

import OnboardingLayout from "../OnboardingLayout";
import Illustration from "../../../../assets/auth/signup/hiringpreference.svg";
import { saveHiringPreference } from "../../../../redux/slices/company/companySlice";

const HIRING_FOR = [
  { value: "Full Time", label: "Full Time" },
  { value: "Part Time", label: "Part Time" },
  { value: "Internship", label: "Internship" },
  { value: "Freelance", label: "Freelance" },
  { value: "Contract", label: "Contract" },
];

const SKILLS = [
  "React",
  "Node.js",
  "Python",
  "Java",
  "UI/UX Design",
  "Sales",
  "Marketing",
  "HR",
  "JavaScript",
  "TypeScript",
  "DevOps",
  "Data Science",
  "Machine Learning",
].map((s) => ({ value: s, label: s }));

const validationSchema = Yup.object({
  // hiringFor: Yup.string().required("Required"),
  // countryCode: Yup.string().required("Country is required"),
  // stateCode: Yup.string().required("State is required"),
  // cityName: Yup.string().required("City is required"),
  // skills: Yup.string().required("Required"),
  avgPerMonth: Yup.number()
    .typeError("Must be a number")
    .min(1, "Must be at least 1")
    // .required("Required"),
});

// ─── Plain Select (for non-location fields) ───────────────────────────────────
const SelectField = ({
  label,
  name,
  value,
  onChange,
  onBlur,
  options,
  error,
  touched,
  disabled,
}) => (
  <div className="w-full">
    <div className="relative">
      <select
        name={name}
        value={value}
        onChange={onChange}
        onBlur={onBlur}
        disabled={disabled}
        className={`w-full bg-[#F7F8F9] border p-3 rounded-md outline-none focus:ring-2 focus:ring-violet-400 transition text-sm appearance-none pr-10 disabled:opacity-50 disabled:cursor-not-allowed
          ${touched && error ? "border-red-400" : "border-gray-200"}
          ${!value ? "text-gray-400" : "text-gray-800"}`}
      >
        <option value="" disabled>
          {label}
        </option>
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
      <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
    </div>
    {touched && error && (
      <p className="text-xs text-red-500 mt-1 ml-1">{error}</p>
    )}
  </div>
);

// ─── Searchable Location Dropdown ─────────────────────────────────────────────
const LocationSelect = ({
  label,
  icon: Icon,
  value,
  displayValue,
  options,
  onSelect,
  onBlur,
  error,
  touched,
  disabled,
  placeholder,
}) => {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const containerRef = useRef();
  const searchRef = useRef();

  const filtered = options.filter((o) =>
    o.label.toLowerCase().includes(search.toLowerCase()),
  );

  useEffect(() => {
    const handler = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setOpen(false);
        setSearch("");
        onBlur?.();
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [onBlur]);

  useEffect(() => {
    if (open) setTimeout(() => searchRef.current?.focus(), 50);
  }, [open]);

  const handleSelect = (option) => {
    onSelect(option);
    setOpen(false);
    setSearch("");
  };

  const handleClear = (e) => {
    e.stopPropagation();
    onSelect(null);
    setOpen(false);
    setSearch("");
  };

  return (
    <div ref={containerRef} className="relative">
      {/* Trigger */}
      <button
        type="button"
        disabled={disabled}
        onClick={() => !disabled && setOpen((p) => !p)}
        className={`
          w-full flex items-center gap-2.5 bg-[#F7F8F9] border px-3 py-3 rounded-md text-sm transition-all
          focus:outline-none focus:ring-2 focus:ring-violet-400
          disabled:opacity-40 disabled:cursor-not-allowed
          ${open ? "border-violet-400 ring-2 ring-violet-400 bg-white" : ""}
          ${touched && error ? "border-red-400" : "border-gray-200"}
          ${!value ? "text-gray-400" : "text-gray-800"}
        `}
      >
        <Icon className="w-4 h-4 shrink-0 text-gray-400" />
        <span className="flex-1 text-left truncate">
          {displayValue || placeholder}
        </span>

        {value && !disabled && (
          <span
            role="button"
            onClick={handleClear}
            className="p-0.5 rounded-full hover:bg-gray-200 transition shrink-0"
          >
            <X className="w-3.5 h-3.5 text-gray-400" />
          </span>
        )}

        <ChevronDown
          className={`w-4 h-4 text-gray-400 shrink-0 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
        />
      </button>

      {touched && error && (
        <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
          <span className="w-1 h-1 rounded-full bg-red-500 inline-block" />
          {error}
        </p>
      )}

      {/* Dropdown */}
      {open && (
        <div className="absolute z-50 mt-1.5 w-full bg-white border border-gray-200 rounded-xl shadow-xl overflow-hidden">
          <div className="p-2 border-b border-gray-100">
            <div className="flex items-center gap-2 bg-gray-50 rounded-lg px-3 py-2">
              <Search className="w-3.5 h-3.5 text-gray-400 shrink-0" />
              <input
                ref={searchRef}
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder={`Search ${label.toLowerCase()}...`}
                className="flex-1 bg-transparent text-sm outline-none text-gray-700 placeholder-gray-400"
              />
              {search && (
                <button
                  onClick={() => setSearch("")}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          <ul className="max-h-52 overflow-y-auto">
            {filtered.length === 0 ? (
              <li className="px-4 py-6 text-center text-sm text-gray-400">
                No results found
              </li>
            ) : (
              filtered.map((option) => (
                <li key={option.value}>
                  <button
                    type="button"
                    onClick={() => handleSelect(option)}
                    className={`
                      w-full text-left px-4 py-2.5 text-sm flex items-center gap-2.5 transition-colors
                      hover:bg-violet-50 hover:text-violet-700
                      ${value === option.value ? "bg-violet-50 text-violet-700 font-medium" : "text-gray-700"}
                    `}
                  >
                    {option.flag && (
                      <span className="text-base leading-none">
                        {option.flag}
                      </span>
                    )}
                    <span className="truncate">{option.label}</span>
                    {value === option.value && (
                      <span className="ml-auto w-1.5 h-1.5 rounded-full bg-violet-500 shrink-0" />
                    )}
                  </button>
                </li>
              ))
            )}
          </ul>
        </div>
      )}
    </div>
  );
};

// ─── Main Component ───────────────────────────────────────────────────────────
const HiringPreferences = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const saved = useSelector((s) => s.company.hiringPreference);

  const [states, setStates] = useState([]);
  const [cities, setCities] = useState([]);

  const [countryLabel, setCountryLabel] = useState("");
  const [stateLabel, setStateLabel] = useState("");

  const formik = useFormik({
    initialValues: {
      hiringFor: saved.hiringFor || "",
      countryCode: saved.jobLocation?.countryCode || "",
      stateCode: saved.jobLocation?.stateCode || "",
      cityName: saved.jobLocation?.cityName || "",
      skills: saved.skills || "",
      avgPerMonth: saved.avgPerMonth || "",
    },
    validationSchema,
    onSubmit: (values) => {
      dispatch(
        saveHiringPreference({
          hiringFor: values.hiringFor,
          jobLocation: {
            countryCode: values.countryCode,
            stateCode: values.stateCode,
            cityName: values.cityName,
          },
          skills: values.skills,
          avgPerMonth: values.avgPerMonth,
        }),
      );
      toast.success("Hiring preferences saved!");
      navigate("/onboarding/verification");
    },
  });

  // Load states when country changes
  useEffect(() => {
    if (formik.values.countryCode) {
      setStates(State.getStatesOfCountry(formik.values.countryCode));
      if (formik.values.countryCode !== saved.jobLocation?.countryCode) {
        formik.setFieldValue("stateCode", "");
        formik.setFieldValue("cityName", "");
        setStateLabel("");
        setCities([]);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formik.values.countryCode]);

  // Load cities when state changes
  useEffect(() => {
    if (formik.values.countryCode && formik.values.stateCode) {
      setCities(
        City.getCitiesOfState(
          formik.values.countryCode,
          formik.values.stateCode,
        ),
      );
      if (formik.values.stateCode !== saved.jobLocation?.stateCode) {
        formik.setFieldValue("cityName", "");
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formik.values.stateCode]);

  // Seed from Redux on mount
  useEffect(() => {
    if (saved.jobLocation?.countryCode) {
      const c = Country.getAllCountries().find(
        (c) => c.isoCode === saved.jobLocation.countryCode,
      );
      if (c) setCountryLabel(`${c.flag} ${c.name}`);
      const s = State.getStatesOfCountry(saved.jobLocation.countryCode);
      setStates(s);
      if (saved.jobLocation?.stateCode) {
        const st = s.find((s) => s.isoCode === saved.jobLocation.stateCode);
        if (st) setStateLabel(st.name);
        setCities(
          City.getCitiesOfState(
            saved.jobLocation.countryCode,
            saved.jobLocation.stateCode,
          ),
        );
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const countryOptions = Country.getAllCountries().map((c) => ({
    value: c.isoCode,
    label: c.name,
    flag: c.flag,
  }));
  const stateOptions = states.map((s) => ({ value: s.isoCode, label: s.name }));
  const cityOptions = cities.map((c) => ({ value: c.name, label: c.name }));

  return (
    <OnboardingLayout
      illustration={Illustration}
      currentStep={3}
      showBack
      onBack={() => navigate("/onboarding/business-details")}
    >
      <div className="max-w-md mx-auto">
        <h2 className="text-2xl font-bold text-center text-gray-900 mb-8">
          Hiring Preferences
        </h2>

        <form onSubmit={formik.handleSubmit} className="space-y-5">
          {/* Hiring For */}
          <SelectField
            label="Hiring For"
            name="hiringFor"
            value={formik.values.hiringFor}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            options={HIRING_FOR}
            error={formik.errors.hiringFor}
            touched={formik.touched.hiringFor}
          />

          {/* ── Job Location group ── */}
          <div className="rounded-xl border border-gray-200 bg-gray-50/50 p-3 space-y-3">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5" /> Job Location
            </p>

            {/* Country */}
            <LocationSelect
              label="Country"
              icon={Globe}
              placeholder="Select Country"
              value={formik.values.countryCode}
              displayValue={countryLabel}
              options={countryOptions}
              onSelect={(opt) => {
                formik.setFieldValue("countryCode", opt ? opt.value : "");
                setCountryLabel(opt ? `${opt.flag} ${opt.label}` : "");
                formik.setFieldTouched("countryCode", true);
              }}
              onBlur={() => formik.setFieldTouched("countryCode", true)}
              error={formik.errors.countryCode}
              touched={formik.touched.countryCode}
            />

            {/* State */}
            <LocationSelect
              label="State"
              icon={MapPin}
              placeholder="Select State"
              value={formik.values.stateCode}
              displayValue={stateLabel}
              options={stateOptions}
              onSelect={(opt) => {
                formik.setFieldValue("stateCode", opt ? opt.value : "");
                setStateLabel(opt ? opt.label : "");
                formik.setFieldTouched("stateCode", true);
              }}
              onBlur={() => formik.setFieldTouched("stateCode", true)}
              error={formik.errors.stateCode}
              touched={formik.touched.stateCode}
              disabled={!formik.values.countryCode}
            />

            {/* City */}
            <LocationSelect
              label="City"
              icon={Building2}
              placeholder="Select City"
              value={formik.values.cityName}
              displayValue={formik.values.cityName}
              options={cityOptions}
              onSelect={(opt) => {
                formik.setFieldValue("cityName", opt ? opt.value : "");
                formik.setFieldTouched("cityName", true);
              }}
              onBlur={() => formik.setFieldTouched("cityName", true)}
              error={formik.errors.cityName}
              touched={formik.touched.cityName}
              disabled={!formik.values.stateCode}
            />
          </div>

          {/* Top Hiring Skill */}
          <SelectField
            label="Top Hiring Skill"
            name="skills"
            value={formik.values.skills}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            options={SKILLS}
            error={formik.errors.skills}
            touched={formik.touched.skills}
          />

          {/* Avg per month */}
          <div>
            <input
              name="avgPerMonth"
              type="number"
              placeholder="Average Hiring Per Month"
              value={formik.values.avgPerMonth}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              className={`w-full bg-[#F7F8F9] border p-3 rounded-md outline-none focus:ring-2 focus:ring-violet-400 transition text-sm placeholder-gray-400
                ${formik.touched.avgPerMonth && formik.errors.avgPerMonth ? "border-red-400" : "border-gray-200"}`}
            />
            {formik.touched.avgPerMonth && formik.errors.avgPerMonth && (
              <p className="text-xs text-red-500 mt-1 ml-1">
                {formik.errors.avgPerMonth}
              </p>
            )}
          </div>

          <button
            type="submit"
            className="w-full bg-[#7900BA] hover:bg-[#65009e] active:scale-[0.98] text-white font-semibold py-3.5 rounded-md shadow-md transition-all mt-4"
          >
            Save and Continue
          </button>

          {/* Skip Button */}
          <button
            type="button"
            onClick={() => {
              dispatch(
                saveHiringPreference({
                  hiringFor: "",
                  jobLocation: {
                    countryCode: "",
                    stateCode: "",
                    cityName: "",
                  },
                  skills: "",
                  avgPerMonth: 0,
                }),
              );
              toast.info("Skipped hiring preferences");
              navigate("/onboarding/verification");
            }}
            className="w-full mt-3 border border-gray-300 text-gray-600 hover:bg-gray-100 font-medium py-3 rounded-md transition-all"
          >
            Skip this step
          </button>
        </form>
      </div>
    </OnboardingLayout>
  );
};

export default HiringPreferences;
