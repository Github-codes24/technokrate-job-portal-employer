import React, { useRef, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { useFormik } from "formik";
import * as Yup from "yup";
import { toast } from "react-toastify";
import {
  Upload,
  Pencil,
  Search,
  ChevronDown,
  X,
  MapPin,
  Globe,
  Building2,
} from "lucide-react";
import { Country, State, City } from "country-state-city";

import OnboardingLayout from "../OnboardingLayout";
import Illustration from "../../../../assets/auth/signup/CompanyDetail.svg";
import { saveCompanyDetail } from "../../../../redux/slices/company/companySlice";

// ─── Validation ───────────────────────────────────────────────────────────────
const validationSchema = Yup.object({
  // tagline:     Yup.string().required("Company tagline is required"),
  website: Yup.string().url("Enter a valid URL e.g. https://example.com"),
  // .required("Website is required"),
  // countryCode: Yup.string().required("Country is required"),
  // stateCode:   Yup.string().required("State is required"),
  // cityName:    Yup.string().required("City is required"),
});

// ─── Searchable Location Dropdown ────────────────────────────────────────────
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

  // Close on outside click
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

  // Focus search input when opened
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
      {/* Trigger Button */}
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
        {/* Left icon */}
        <Icon className="w-4 h-4 shrink-0 text-gray-400" />

        {/* Selected value or placeholder */}
        <span className="flex-1 text-left truncate">
          {displayValue || placeholder}
        </span>

        {/* Clear btn (only when value set) */}
        {value && !disabled && (
          <span
            role="button"
            onClick={handleClear}
            className="p-0.5 rounded-full hover:bg-gray-200 transition shrink-0"
          >
            <X className="w-3.5 h-3.5 text-gray-400" />
          </span>
        )}

        {/* Chevron */}
        <ChevronDown
          className={`w-4 h-4 text-gray-400 shrink-0 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
        />
      </button>

      {/* Error */}
      {touched && error && (
        <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
          <span className="w-1 h-1 rounded-full bg-red-500 inline-block" />
          {error}
        </p>
      )}

      {/* Dropdown panel */}
      {open && (
        <div className="absolute z-50 mt-1.5 w-full bg-white border border-gray-200 rounded-xl shadow-xl overflow-hidden animate-in fade-in slide-in-from-top-1 duration-150">
          {/* Search box */}
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

          {/* Options list */}
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
                    {/* Flag (for countries) */}
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

// ─── Component ────────────────────────────────────────────────────────────────
const CompanyDetails = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const logoRef = useRef();
  const bannerRef = useRef();

  const saved = useSelector((s) => s.company.companyDetail);

  const [states, setStates] = useState([]);
  const [cities, setCities] = useState([]);

  // Build display labels for pre-filled values
  const [countryLabel, setCountryLabel] = useState("");
  const [stateLabel, setStateLabel] = useState("");

  const formik = useFormik({
    initialValues: {
      tagline: saved.tagline || "",
      website: saved.website || "",
      countryCode: saved.location?.countryCode || "",
      stateCode: saved.location?.stateCode || "",
      cityName: saved.location?.cityName || "",
      logo: saved.logo || null,
      banner: saved.banner || null,
    },
    validationSchema,
    onSubmit: (values) => {
      dispatch(
        saveCompanyDetail({
          tagline: values.tagline,
          website: values.website,
          location: {
            countryCode: values.countryCode,
            stateCode: values.stateCode,
            cityName: values.cityName,
          },
          logo: values.logo,
          banner: values.banner,
        }),
      );
      toast.success("Company details saved!");
      navigate("/onboarding/business-details");
    },
  });

  // Load states when country changes
  useEffect(() => {
    if (formik.values.countryCode) {
      const s = State.getStatesOfCountry(formik.values.countryCode);
      setStates(s);
      if (formik.values.countryCode !== saved.location?.countryCode) {
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
      const c = City.getCitiesOfState(
        formik.values.countryCode,
        formik.values.stateCode,
      );
      setCities(c);
      if (formik.values.stateCode !== saved.location?.stateCode) {
        formik.setFieldValue("cityName", "");
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formik.values.stateCode]);

  // Seed on mount from saved Redux data
  useEffect(() => {
    if (saved.location?.countryCode) {
      const allCountries = Country.getAllCountries();
      const c = allCountries.find(
        (c) => c.isoCode === saved.location.countryCode,
      );
      if (c) setCountryLabel(`${c.flag} ${c.name}`);
      const s = State.getStatesOfCountry(saved.location.countryCode);
      setStates(s);
      if (saved.location?.stateCode) {
        const st = s.find((s) => s.isoCode === saved.location.stateCode);
        if (st) setStateLabel(st.name);
        const cities = City.getCitiesOfState(
          saved.location.countryCode,
          saved.location.stateCode,
        );
        setCities(cities);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Build option arrays
  const countryOptions = Country.getAllCountries().map((c) => ({
    value: c.isoCode,
    label: c.name,
    flag: c.flag,
  }));
  const stateOptions = states.map((s) => ({ value: s.isoCode, label: s.name }));
  const cityOptions = cities.map((c) => ({ value: c.name, label: c.name }));

  const inputCls = (field) =>
    `w-full bg-[#F7F8F9] border p-3 rounded-md outline-none focus:ring-2 focus:ring-violet-400 transition text-sm placeholder-gray-400
    ${formik.touched[field] && formik.errors[field] ? "border-red-400" : "border-gray-200"}`;

  return (
    <OnboardingLayout illustration={Illustration} currentStep={1}>
      <h2 className="text-2xl font-bold text-center text-gray-900 mb-1">
        Company Details
      </h2>
      <p className="text-sm text-center text-gray-500 mb-5">
        Let's start with the basics
      </p>

      <form onSubmit={formik.handleSubmit} className="space-y-4">
        {/* ── LOGO ── */}
        <div className="flex justify-center mb-2">
          <button
            type="button"
            onClick={() => logoRef.current.click()}
            className="w-20 h-20 rounded-full bg-purple-100 border-2 border-dashed border-purple-300 flex flex-col items-center justify-center gap-1 hover:bg-purple-50 overflow-hidden"
          >
            {formik.values.logo ? (
              <img
                src={URL.createObjectURL(formik.values.logo)}
                alt="logo preview"
                className="w-full h-full object-cover rounded-full"
              />
            ) : (
              <>
                <Upload className="w-5 h-5 text-[#7900BA]" />
                <span className="text-[10px] text-[#7900BA]">Upload Logo</span>
              </>
            )}
          </button>
          <input
            ref={logoRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => formik.setFieldValue("logo", e.target.files[0])}
          />
        </div>

        {/* ── BANNER ── */}
        <div
          className="relative border border-gray-200 rounded-lg bg-[#F7F8F9] h-20 flex items-center justify-center cursor-pointer overflow-hidden"
          onClick={() => bannerRef.current.click()}
        >
          {formik.values.banner ? (
            <img
              src={URL.createObjectURL(formik.values.banner)}
              alt="banner preview"
              className="w-full h-full object-cover"
            />
          ) : (
            <span className="text-xs text-gray-400">Upload Company Banner</span>
          )}
          <button
            type="button"
            className="absolute top-2 right-2 text-gray-400 hover:text-[#7900BA] z-10"
            onClick={(e) => {
              e.stopPropagation();
              bannerRef.current.click();
            }}
          >
            <Pencil className="w-3.5 h-3.5" />
          </button>
          <input
            ref={bannerRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => formik.setFieldValue("banner", e.target.files[0])}
          />
        </div>

        {/* ── TAGLINE ── */}
        <div>
          <input
            name="tagline"
            placeholder="Company Tagline"
            value={formik.values.tagline}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            className={inputCls("tagline")}
          />
          {formik.touched.tagline && formik.errors.tagline && (
            <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
              <span className="w-1 h-1 rounded-full bg-red-500 inline-block" />
              {formik.errors.tagline}
            </p>
          )}
        </div>

        {/* ── WEBSITE ── */}
        <div>
          <input
            name="website"
            placeholder="Company Website (https://...)"
            value={formik.values.website}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            className={inputCls("website")}
          />
          {formik.touched.website && formik.errors.website && (
            <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
              <span className="w-1 h-1 rounded-full bg-red-500 inline-block" />
              {formik.errors.website}
            </p>
          )}
        </div>

        {/* ── LOCATION GROUP ── */}
        <div className="rounded-xl border border-gray-200 bg-gray-50/50 p-3 space-y-3">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
            <MapPin className="w-3.5 h-3.5" /> Company Location
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
              if (!opt) {
                formik.setFieldValue("countryCode", "");
                setCountryLabel("");
              } else {
                formik.setFieldValue("countryCode", opt.value);
                setCountryLabel(`${opt.flag} ${opt.label}`);
              }
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
              if (!opt) {
                formik.setFieldValue("stateCode", "");
                setStateLabel("");
              } else {
                formik.setFieldValue("stateCode", opt.value);
                setStateLabel(opt.label);
              }
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

        <button
          type="submit"
          className="w-full bg-[#7900BA] hover:bg-[#65009e] active:scale-95 text-white py-3 rounded-md font-semibold shadow-lg transition"
        >
          Save and Continue
        </button>
        {/* Skip Button */}
        <button
          type="button"
          onClick={() => {
            dispatch(
              saveCompanyDetail({
                tagline: "",
                website: "",
                location: {
                  countryCode: "",
                  stateCode: "",
                  cityName: "",
                },
                logo: null,
                banner: null,
              }),
            );
            toast.info("Skipped hiring preferences");
            navigate("/onboarding/business-details");
          }}
          className="w-full border border-gray-300 text-gray-600 hover:bg-gray-100 font-medium py-3 rounded-md transition-all"
        >
          Skip this step
        </button>
      </form>
    </OnboardingLayout>
  );
};

export default CompanyDetails;
