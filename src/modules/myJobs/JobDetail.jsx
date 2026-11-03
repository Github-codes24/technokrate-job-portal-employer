import React, { useEffect, useState } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";
import { Country, State, City } from "country-state-city";

import {
  ArrowLeft,
  Pencil,
  Globe,
  Phone,
  Mail,
  Calendar,
  Clock,
  GraduationCap,
  Briefcase,
  MapPin,
  DollarSign,
  Facebook,
  Twitter,
  Instagram,
  Youtube,
  Users,
  Award,
  CheckCircle,
  Building2,
  ExternalLink,
  Share2,
  Copy,
  Check,
  RotateCcw,
  ChevronDown,
  Loader2,
} from "lucide-react";
import {
  getJobDetails,
  clearJobDetail,
  getApplicants,
  changeJobStatus,
} from "../../redux/slices/companyJobs/jobSlice";
import RepublishJobModal from "./RepublishJobModal";
import { getSocialUrl } from "../../utils/socialUrl";

// ─── Robust Location Display Resolver ─────────────────────────────────────
// Checks every possible place the backend might have put workMode / location
// data, so this keeps working regardless of API response shape.
const getLocationInfo = (job) => {
  const rawWorkMode =
    job?.workMode ||
    job?.advanceInformation?.workMode ||
    job?.jobMode ||
    job?.locationType ||
    "";

  const workMode = String(rawWorkMode).trim().toLowerCase().replace(/[\s\-_]/g, "");

  const isRemote =
    workMode.includes("remote") ||
    workMode.includes("workfromhome") ||
    workMode.includes("wfh");

  const isOnsite =
    workMode.includes("onsite") ||
    workMode.includes("office") ||
    workMode.includes("insite");

  const isHybrid = workMode.includes("hybrid");

  const rawLocation = job?.jobLocation || job?.location || job?.advanceInformation?.jobLocation || job?.advanceInformation?.location || {};

  const normalizedLocation = Array.isArray(rawLocation)
    ? rawLocation[0] || {}
    : rawLocation;

  const nestedLocation =
    normalizedLocation.location ||
    normalizedLocation.jobLocation ||
    {};

  const loc = {
    ...normalizedLocation,
    ...nestedLocation,
    ...(job?.location || {}),
    ...(job?.jobLocation || {}),
    ...(job?.advanceInformation?.location || {}),
    ...(job?.advanceInformation?.jobLocation || {}),
  };

  const countryValue = loc.countryCode || loc.country_code || loc.country || "";
  const countryCode = Country.getCountryByCode(countryValue) ? countryValue : "";
  const countryName =
    loc.countryName ||
    (loc.country && !Country.getCountryByCode(loc.country) ? loc.country : "") ||
    (countryCode ? Country.getCountryByCode(countryCode)?.name : null) ||
    "";

  const text = (value) => {
    if (value === null || value === undefined) return "";
    if (typeof value === "object") return value.name || value.cityName || value.city || "";
    return String(value).trim();
  };

  const rawState =
    loc.stateName ||
    loc.state ||
    loc.state_code ||
    loc.stateCode ||
    loc.region ||
    loc.province ||
    loc.state_id ||
    (loc.state && typeof loc.state === "object" ? loc.state.name : null) ||
    null;
  const stateName =
    (loc.stateName && String(loc.stateName).trim()) ||
    (countryCode && rawState
      ? State.getStateByCodeAndCountry(String(rawState).trim(), countryCode)?.name
      : "") ||
    (rawState ? String(rawState).trim() : "");
  const stateCode =
    loc.stateCode ||
    loc.state_code ||
    (countryCode && rawState
      ? State.getStateByCodeAndCountry(String(rawState).trim(), countryCode)?.isoCode
      : "");
  const cityCandidates = [
    loc.cityName,
    loc.city,
    loc.city_name,
    loc.locationName,
    loc.locality,
    loc.town,
    loc.village,
    loc.area,
    loc.suburb,
    loc.neighborhood,
    loc.name,
  ].map(text).filter(Boolean);
  const citiesInState =
    countryCode && stateCode
      ? City.getCitiesOfState(countryCode, stateCode).map((city) => city.name.toLowerCase())
      : [];
  const displayCity =
    cityCandidates.find((name) => name.toLowerCase() !== stateName.toLowerCase()) ||
    cityCandidates.find((name) => citiesInState.includes(name.toLowerCase())) ||
    "";
  const locationParts = [displayCity, stateName || countryName]
    .filter(Boolean)
    .filter((part, index, parts) => parts.findIndex((p) => p.toLowerCase() === part.toLowerCase()) === index);

  // const displayLocation = isRemote
  //   ? countryName || "Remote"
  //   : stateName && displayCity
  //   ? locationParts.join(", ")
  //   : stateName || displayCity || countryName || "—";

  const displayLocation = isRemote
    ? countryName || "Remote"
    : [displayCity, stateName]
      .filter(Boolean)
      .join(", ") || "—";

  return { isRemote, isOnsite, isHybrid, displayLocation };
};

// ─── Overview Item ────────────────────────────────────────────────────────────
const OverviewItem = ({ icon: Icon, label, value }) => (
  <div className="group bg-gradient-to-br from-gray-50 to-white rounded-xl p-3 text-center hover:shadow-md transition-all duration-300">
    <div className="w-10 h-10 rounded-xl bg-purple-100 flex items-center justify-center mx-auto mb-2 group-hover:scale-110 transition-transform">
      <Icon className="w-4 h-4 text-purple-600" strokeWidth={1.8} />
    </div>
    <p className="text-xs text-gray-400 mb-1">{label}</p>
    <p className="text-sm font-semibold text-gray-700 line-clamp-2">
      {value || "—"}
    </p>
  </div>
);

// ─── Company Info Row ─────────────────────────────────────────────────────────
const InfoRow = ({ label, value }) => (
  <div className="flex items-center justify-between py-2.5 border-b border-gray-100 last:border-0">
    <span className="text-sm text-gray-500">{label}</span>
    <span className="text-sm font-semibold text-gray-800 text-right max-w-[60%] truncate">
      {value || "—"}
    </span>
  </div>
);

// ─── Social Button ────────────────────────────────────────────────────────────
const SocialBtn = ({ icon: Icon, color, link, defaultUrl, label }) => {
  const targetUrl = getSocialUrl(link, defaultUrl);

  return (
    <a
      href={targetUrl}
      target="_blank"
      rel="noopener noreferrer"
      title={label}
      aria-label={label}
      className={`w-9 h-9 rounded-lg flex items-center justify-center text-white transition-all hover:scale-110 hover:shadow-lg ${color}`}
    >
      <Icon className="w-4 h-4" strokeWidth={2} />
    </a>
  );
};

// ─── Skill Badge ──────────────────────────────────────────────────────────────
const SkillBadge = ({ skill }) => (
  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium bg-gradient-to-r from-purple-50 to-purple-100 text-purple-700 border border-purple-200 hover:shadow-sm transition-all">
    <CheckCircle className="w-3 h-3 text-purple-500" />
    {skill}
  </span>
);

// ─── Skeleton loader ──────────────────────────────────────────────────────────
const Skeleton = ({ className }) => (
  <div
    className={`animate-pulse bg-gradient-to-r from-gray-100 to-gray-200 rounded-xl ${className}`}
  />
);

// ─── Main ─────────────────────────────────────────────────────────────────────
const JobDetail = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { id } = useParams();
  const locationState = useLocation();

  const [copied, setCopied] = useState(false);
  const [republishModal, setRepublishModal] = useState(false);
  const [statusUpdating, setStatusUpdating] = useState(false);

  const { jobDetail: job, jobDetailLoading, totalApplicants, error } = useSelector((s) => s.job);

  useEffect(() => {
    if (id) {
      dispatch(getJobDetails(id));
      // Fetch live applicant count — same source as the Applicants page
      dispatch(getApplicants({ jobId: id, page: 1, limit: 1 }));
    }
    return () => dispatch(clearJobDetail());
  }, [dispatch, id]);

  useEffect(() => {
    if (error) toast.error(error);
  }, [error]);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast.success("Link copied to clipboard!");
  };

  const handleStatusChange = async (newStatus) => {
    const jobId = job?._id || id;
    if (!jobId || statusUpdating) return;
    setStatusUpdating(true);
    try {
      const res = await dispatch(changeJobStatus({ jobId, status: newStatus }));
      if (changeJobStatus.fulfilled.match(res)) {
        toast.success(res.payload?.message || `Job status changed to ${newStatus}`);
      } else {
        toast.error(res.payload || "Failed to update job status");
      }
    } catch (e) {
      toast.error("Failed to change job status");
    } finally {
      setStatusUpdating(false);
    }
  };

  // ── Derived values from API response ──────────────────────────────────────
  const employer = job?.employer || {};
  const company = employer.companyDetail || {};
  const business = employer.businessDetail || {};
  const adv = job?.advanceInformation || {};

  // Social links resolver: try multiple possible field names used by backend
  const socialSource = company.social || company.socialLinks || employer.socialLinks || business.social || {};
  const fbLink = socialSource.facebook || socialSource.facebookUrl || company.facebook || company.facebookUrl || employer.facebook || employer.facebookUrl || '';
  const twitterLink = socialSource.twitter || socialSource.twitterUrl || company.twitter || company.twitterUrl || employer.twitter || employer.twitterUrl || '';
  const instaLink = socialSource.instagram || socialSource.instagramUrl || company.instagram || company.instagramUrl || employer.instagram || employer.instagramUrl || '';
  const ytLink = socialSource.youtube || socialSource.youtubeUrl || company.youtube || company.youtubeUrl || employer.youtube || employer.youtubeUrl || '';

  const { displayLocation } = getLocationInfo(job);

  const postedDate = job?.createdAt
    ? new Date(job.createdAt).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    })
    : "—";
  const expireDate = adv.expireDate
    ? new Date(adv.expireDate).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    })
    : "—";
  const salaryLabel = job?.salaryRange
    ? `₹${(job.salaryRange.minSalary / 1000).toFixed(0)}k – ₹${(job.salaryRange.maxSalary / 1000).toFixed(0)}k/${job.salaryType?.toLowerCase() || "month"}`
    : "—";
  const companyLogo = company.companyLogo?.[0] || null;
  const daysRemaining = adv.expireDate
    ? Math.ceil((new Date(adv.expireDate) - new Date()) / (1000 * 60 * 60 * 24))
    : null;

  const isExpiringSoon = daysRemaining > 0 && daysRemaining <= 7;

  const applicantCount =
    job?.applicantCount ??
    totalApplicants ??
    locationState.state?.applicantCount ??
    0;

  const matchedCount =
    job?.matchedCandidates ??
    job?.dbMatchCount ??
    locationState.state?.matchedCount ??
    0;

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700;800&display=swap');
        .line-clamp-2 {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
        .line-clamp-3 {
          display: -webkit-box;
          -webkit-line-clamp: 3;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
        .prose-content {
          overflow-wrap: break-word;
          word-break: break-word;
        }
        .prose-content * {
          max-width: 100%;
        }
      `}</style>

      <div
        className="bg-gradient-to-br from-purple-200/30 via-white to-purple-200/30"
        style={{ fontFamily: "'Poppins', sans-serif" }}
      >
        <div className="max-w-7xl mx-auto p-5 bg-white rounded-xl">
          {/* ── Back Button ── */}
          <button
            onClick={() => navigate(-1)}
            className="group flex items-center gap-2 text-gray-500 hover:text-purple-600 transition-all mb-6"
          >
            <ArrowLeft
              className="w-4 h-4 group-hover:-translate-x-1 transition-transform"
              strokeWidth={2}
            />
            <span className="text-sm font-medium">Back to Jobs</span>
          </button>

          {/* ── Loading state ── */}
          {jobDetailLoading && (
            <div className="space-y-4">
              <Skeleton className="h-32 w-full" />
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <Skeleton className="lg:col-span-2 h-96" />
                <Skeleton className="h-96" />
              </div>
            </div>
          )}

          {/* ── Error / empty ── */}
          {!jobDetailLoading && !job && (
            <div className="text-center py-20">
              <div className="w-24 h-24 bg-purple-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <Briefcase
                  className="w-12 h-12 text-purple-400"
                  strokeWidth={1.4}
                />
              </div>
              <p className="text-gray-500 font-medium">
                Job not found or failed to load.
              </p>
              <button
                onClick={() => navigate("/my-job")}
                className="mt-4 px-6 py-2 bg-purple-600 text-white rounded-xl text-sm font-semibold hover:bg-purple-700 transition"
              >
                Back to Jobs
              </button>
            </div>
          )}

          {/* ── Content ── */}
          {!jobDetailLoading && job && (
            <>
              {/* Hero Header */}
              <div className="relative mb-8 overflow-hidden rounded-2xl bg-gradient-to-r from-purple-700 via-purple-600 to-pink-600 p-6 sm:p-8">
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/3" />
                <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/4" />
                <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-white shadow-lg flex items-center justify-center flex-shrink-0 overflow-hidden">
                      {companyLogo ? (
                        <img
                          src={companyLogo}
                          alt="logo"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <Building2 className="w-10 h-10 text-purple-600" />
                      )}
                    </div>
                    <div>
                      <div className="flex flex-wrap items-center gap-2 mb-2">
                        <h1 className="text-xl sm:text-2xl font-bold text-white break-words max-w-full">
                          {job.jobTitle}
                        </h1>
                        <span className="text-xs font-semibold bg-white/20 text-white px-3 py-1 rounded-full backdrop-blur-sm whitespace-nowrap">
                          {adv.jobType || "Full Time"}
                        </span>

                        {/* Interactive Status Selector */}
                        {(() => {
                          const rawStatus = (job.status || '').toLowerCase();
                          const currentStatusVal = rawStatus === 'paused' ? 'Paused' : (rawStatus === 'closed' || rawStatus === 'expired') ? 'Closed' : 'Active';
                          return (
                            <div className="relative inline-flex items-center">
                              {statusUpdating ? (
                                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-white/20 text-white border border-white/30 backdrop-blur-md">
                                  <Loader2 className="w-3 h-3 animate-spin text-white" />
                                  Updating...
                                </span>
                              ) : (
                                <div className="relative">
                                  <select
                                    value={currentStatusVal}
                                    onChange={(e) => handleStatusChange(e.target.value)}
                                    disabled={statusUpdating}
                                    className={`text-xs font-semibold pl-3 pr-7 py-1 rounded-full capitalize appearance-none cursor-pointer border backdrop-blur-md transition focus:outline-none ${
                                      currentStatusVal === 'Active'
                                        ? 'bg-green-500/30 text-green-100 border-green-300/40 hover:bg-green-500/40'
                                        : currentStatusVal === 'Paused'
                                        ? 'bg-amber-500/30 text-amber-100 border-amber-300/40 hover:bg-amber-500/40'
                                        : 'bg-red-500/30 text-red-100 border-red-300/40 hover:bg-red-500/40'
                                    }`}
                                  >
                                    <option value="Active" className="text-gray-800 bg-white">● Active</option>
                                    <option value="Paused" className="text-gray-800 bg-white">● Paused</option>
                                    <option value="Closed" className="text-gray-800 bg-white">● Closed</option>
                                  </select>
                                  <ChevronDown className="w-3.5 h-3.5 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-white/80" />
                                </div>
                              )}
                            </div>
                          );
                        })()}
                      </div>
                      <p className="text-white/80 text-sm">
                        {company.companyName || employer.name}
                      </p>
                      {displayLocation && (
                        <p className="text-white/70 text-xs flex items-center gap-1 mt-1">
                          <MapPin className="w-3 h-3 flex-shrink-0" />
                          {displayLocation}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-3">
                    <button
                      onClick={() => navigate(`/my-job/edit/${job._id}`)}
                      className="flex items-center gap-2 bg-white text-purple-700 px-4 py-2 rounded-xl text-sm font-semibold hover:bg-purple-50 transition shadow-md"
                    >
                      <Pencil className="w-4 h-4" /> Edit Job
                    </button>
                    <button
                      onClick={() => setRepublishModal(true)}
                      className="flex items-center gap-2 bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white px-4 py-2 rounded-xl text-sm font-semibold transition shadow-md whitespace-nowrap"
                    >
                      <RotateCcw className="w-4 h-4" /> Republish Job
                    </button>
                  </div>
                </div>
              </div>

              {/* Stats Bar */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
                <div className="bg-white rounded-xl p-3 text-center border border-gray-100 shadow-sm">
                  <Calendar className="w-4 h-4 text-purple-500 mx-auto mb-1" />
                  <p className="text-xs text-gray-500">Posted</p>
                  <p className="text-xs font-semibold text-gray-700">
                    {postedDate}
                  </p>
                </div>
                <div className="bg-white rounded-xl p-3 text-center border border-gray-100 shadow-sm">
                  <Clock className="w-4 h-4 text-purple-500 mx-auto mb-1" />
                  <p className="text-xs text-gray-500">Expires</p>
                  <p
                    className={`text-xs font-semibold ${isExpiringSoon ? "text-red-500" : "text-gray-700"}`}
                  >
                    {expireDate}
                    {isExpiringSoon && (
                      <span className="block text-[10px] text-red-400">
                        ({daysRemaining} days left)
                      </span>
                    )}
                  </p>
                </div>
                <div
                  className="bg-white rounded-xl p-3 text-center border border-gray-100 shadow-sm cursor-pointer hover:border-purple-300 transition"
                  onClick={() => navigate(`/my-job/applicant/${job._id}`)}
                  title="View Applicants"
                >
                  <Users className="w-4 h-4 text-purple-500 mx-auto mb-1" />
                  <p className="text-xs text-gray-500">Applicants</p>
                  <p className="text-xs font-semibold text-gray-700">
                    {applicantCount}
                  </p>
                </div>
                <div className="bg-white rounded-xl p-3 text-center border border-gray-100 shadow-sm">
                  <Award className="w-4 h-4 text-purple-500 mx-auto mb-1" />
                  <p className="text-xs text-gray-500">Matches</p>
                  <p className="text-xs font-semibold text-gray-700">
                    {matchedCount}
                  </p>
                </div>
              </div>

              {/* Main Content */}
              <div className="flex flex-col lg:flex-row gap-6 items-start">
                {/* Left Column - Main Content */}
                <div className="flex-1 min-w-0 space-y-6">
                  {/* Job Description */}
                  <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 hover:shadow-md transition-all">
                    <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                      <Briefcase className="w-5 h-5 text-purple-600" />
                      Job Description
                    </h2>
                    <div
                      className="prose-content text-sm text-gray-600 leading-relaxed"
                      dangerouslySetInnerHTML={{ __html: job.jobDescription }}
                    />
                  </div>

                  {/* Responsibilities */}
                  <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 hover:shadow-md transition-all">
                    <h2 className=" text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                      <CheckCircle className="w-5 h-5 text-purple-600" />
                      Key Responsibilities
                    </h2>
                    <div
                      className="prose-content text-sm text-gray-600 leading-relaxed"
                      dangerouslySetInnerHTML={{
                        __html: job.jobResponsibilities,
                      }}
                    />
                  </div>

                  {/* Skills Required */}
                  {job.skillsRequired?.length > 0 && (
                    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 hover:shadow-md transition-all">
                      <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                        <GraduationCap className="w-5 h-5 text-purple-600" />
                        Skills Required
                      </h2>
                      <div className="flex flex-wrap gap-2">
                        {job.skillsRequired.map((skill, i) => (
                          <SkillBadge key={i} skill={skill} />
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Salary Range */}
                  <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl p-6 border border-purple-100">
                    <h2 className="text-lg font-bold text-gray-900 mb-2 flex items-center gap-2">
                      <DollarSign className="w-5 h-5 text-purple-600" />
                      Salary Range
                    </h2>
                    <p className="text-2xl font-bold text-purple-700">
                      {salaryLabel}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      Based on experience and qualifications
                    </p>
                  </div>
                </div>

                {/* Right Column - Sidebar */}
                <div className="lg:w-80 flex-shrink-0 space-y-5">
                  {/* Job Overview */}
                  <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                    <h3 className="text-sm font-bold text-gray-900 mb-4 flex items-center gap-2">
                      <Briefcase className="w-4 h-4 text-purple-600" />
                      Job Overview
                    </h3>
                    <div className="grid grid-cols-2 gap-3">
                      <OverviewItem
                        icon={Calendar}
                        label="Job Posted"
                        value={postedDate}
                      />
                      <OverviewItem
                        icon={Clock}
                        label="Job Expire"
                        value={expireDate}
                      />
                      <OverviewItem
                        icon={GraduationCap}
                        label="Education"
                        value={adv.education || "Any Graduate"}
                      />
                      <OverviewItem
                        icon={DollarSign}
                        label="Salary"
                        value={salaryLabel}
                      />
                      <OverviewItem
                        icon={MapPin}
                        label="Location"
                        value={displayLocation}
                      />
                      <OverviewItem
                        icon={Briefcase}
                        label="Job Type"
                        value={adv.jobType || "Full Time"}
                      />
                      <OverviewItem
                        icon={Briefcase}
                        label="Experience"
                        value={adv.experience || "Fresher"}
                      />
                      <OverviewItem
                        icon={Briefcase}
                        label="Job Level"
                        value={adv.jobLevel || "Entry Level"}
                      />
                    </div>
                  </div>

                  {/* Company Info */}
                  <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                    <div className="flex items-center gap-3 mb-4 pb-3 border-b border-gray-100">
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-100 to-purple-200 flex items-center justify-center flex-shrink-0 overflow-hidden">
                        {companyLogo ? (
                          <img
                            src={companyLogo}
                            alt="logo"
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <Building2 className="w-6 h-6 text-purple-600" />
                        )}
                      </div>
                      <div>
                        <p className="text-base font-bold text-gray-900">
                          {employer.name || company.companyName || "Company"}
                        </p>
                        <p className="text-xs text-gray-500">
                          {company.companyTagline || "Great place to work"}
                        </p>
                      </div>
                    </div>

                    <InfoRow label="Founded" value={business.fundedIn} />
                    <InfoRow
                      label="Organization Type"
                      value={business.typeOfCompany}
                    />
                    <InfoRow
                      label="Company Size"
                      value={business.companySize}
                    />
                    <InfoRow label="Phone" value={employer.mobileNumber} />
                    <InfoRow label="Email" value={employer.email} />
                    {company.companyWebsite && (
                      <div className="flex items-center justify-between py-2.5">
                        <span className="text-sm text-gray-500">Website</span>
                        <a
                          href={`https://${company.companyWebsite}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm font-semibold text-purple-600 hover:text-purple-700 flex items-center gap-1"
                        >
                          {company.companyWebsite}
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      </div>
                    )}

                    {business.aboutCompany && (
                      <div className="mt-3 pt-3 border-t border-gray-100">
                        <p className="text-xs text-gray-500 leading-relaxed line-clamp-3">
                          {business.aboutCompany}
                        </p>
                      </div>
                    )}

                    {/* Social Icons */}
                    <div className="flex gap-2 mt-4 pt-2">
                      <SocialBtn icon={Facebook} color="bg-blue-600" link={fbLink} defaultUrl="https://www.facebook.com" label="Facebook" />
                      <SocialBtn icon={Twitter} color="bg-sky-500" link={twitterLink} defaultUrl="https://x.com" label="Twitter / X" />
                      <SocialBtn icon={Instagram} color="bg-pink-500" link={instaLink} defaultUrl="https://www.instagram.com" label="Instagram" />
                      <SocialBtn icon={Youtube} color="bg-red-500" link={ytLink} defaultUrl="https://www.youtube.com" label="YouTube" />
                    </div>
                  </div>

                  {/* Quick Actions */}
                  <div className="bg-gradient-to-r from-purple-600 to-purple-700 rounded-2xl p-5 text-center">
                    <h4 className="text-white font-semibold mb-2">
                      Need to make changes?
                    </h4>
                    <p className="text-purple-100 text-xs mb-4">
                      You can edit this job posting anytime
                    </p>
                    <button
                      onClick={() => navigate(`/my-job/edit/${job._id}`)}
                      className="w-full bg-white text-purple-700 px-4 py-2 rounded-xl text-sm font-semibold hover:bg-purple-50 transition shadow-md"
                    >
                      Edit Job Details
                    </button>
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="text-center pt-8 pb-4 border-t border-gray-100 mt-8">
                <p className="text-xs text-gray-400">
                  © 2025 MyJob – Technokrate Hire. All rights reserved.
                </p>
              </div>
            </>
          )}
        </div>
      </div>

      {republishModal && (
        <RepublishJobModal
          job={job}
          onClose={() => setRepublishModal(false)}
          onSuccess={() => dispatch(getJobDetails(id))}
        />
      )}
    </>
  );
};

export default JobDetail;



// import React, { useEffect, useState } from "react";
// import { useNavigate, useParams, useLocation } from "react-router-dom";
// import { useDispatch, useSelector } from "react-redux";
// import { toast } from "react-toastify";
// import { Country } from "country-state-city";

// import {
//   ArrowLeft,
//   Pencil,
//   Globe,
//   Phone,
//   Mail,
//   Calendar,
//   Clock,
//   GraduationCap,
//   Briefcase,
//   MapPin,
//   DollarSign,
//   Facebook,
//   Twitter,
//   Instagram,
//   Youtube,
//   Users,
//   Award,
//   CheckCircle,
//   Building2,
//   ExternalLink,
//   Share2,
//   Copy,
//   Check,
// } from "lucide-react";
// import {
//   getJobDetails,
//   clearJobDetail,
//   getApplicants,
// } from "../../redux/slices/companyJobs/jobSlice";

// // ─── Overview Item ────────────────────────────────────────────────────────────
// const OverviewItem = ({ icon: Icon, label, value }) => (
//   <div className="group bg-gradient-to-br from-gray-50 to-white rounded-xl p-3 text-center hover:shadow-md transition-all duration-300">
//     <div className="w-10 h-10 rounded-xl bg-purple-100 flex items-center justify-center mx-auto mb-2 group-hover:scale-110 transition-transform">
//       <Icon className="w-4 h-4 text-purple-600" strokeWidth={1.8} />
//     </div>
//     <p className="text-xs text-gray-400 mb-1">{label}</p>
//     <p className="text-sm font-semibold text-gray-700 line-clamp-2">
//       {value || "—"}
//     </p>
//   </div>
// );

// // ─── Company Info Row ─────────────────────────────────────────────────────────
// const InfoRow = ({ label, value }) => (
//   <div className="flex items-center justify-between py-2.5 border-b border-gray-100 last:border-0">
//     <span className="text-sm text-gray-500">{label}</span>
//     <span className="text-sm font-semibold text-gray-800 text-right max-w-[60%] truncate">
//       {value || "—"}
//     </span>
//   </div>
// );

// // ─── Social Button ────────────────────────────────────────────────────────────
// const SocialBtn = ({ icon: Icon, color, link }) => (
//   <a
//     href={link || "#"}
//     target="_blank"
//     rel="noopener noreferrer"
//     className={`w-9 h-9 rounded-lg flex items-center justify-center text-white transition-all hover:scale-110 hover:shadow-lg ${color}`}
//   >
//     <Icon className="w-4 h-4" strokeWidth={2} />
//   </a>
// );

// // ─── Skill Badge ──────────────────────────────────────────────────────────────
// const SkillBadge = ({ skill }) => (
//   <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium bg-gradient-to-r from-purple-50 to-purple-100 text-purple-700 border border-purple-200 hover:shadow-sm transition-all">
//     <CheckCircle className="w-3 h-3 text-purple-500" />
//     {skill}
//   </span>
// );

// // ─── Skeleton loader ──────────────────────────────────────────────────────────
// const Skeleton = ({ className }) => (
//   <div
//     className={`animate-pulse bg-gradient-to-r from-gray-100 to-gray-200 rounded-xl ${className}`}
//   />
// );

// // ─── Main ─────────────────────────────────────────────────────────────────────
// const JobDetail = () => {
//   const navigate = useNavigate();
//   const dispatch = useDispatch();
//   const { id } = useParams();
//   const locationState = useLocation();

//   const [copied, setCopied] = useState(false);

//   const { jobDetail: job, jobDetailLoading, totalApplicants, error } = useSelector((s) => s.job);

//   useEffect(() => {
//     if (id) {
//       dispatch(getJobDetails(id));
//       // Fetch live applicant count — same source as the Applicants page
//       dispatch(getApplicants({ jobId: id, page: 1, limit: 1 }));
//     }
//     return () => dispatch(clearJobDetail());
//   }, [dispatch, id]);

//   useEffect(() => {
//     if (error) toast.error(error);
//   }, [error]);

//   const handleCopyLink = () => {
//     navigator.clipboard.writeText(window.location.href);
//     setCopied(true);
//     setTimeout(() => setCopied(false), 2000);
//     toast.success("Link copied to clipboard!");
//   };

//   // ── Derived values from API response ──────────────────────────────────────
//   const employer = job?.employer || {};
//   const company = employer.companyDetail || {};
//   const business = employer.businessDetail || {};
//   const adv = job?.advanceInformation || {};
//   const location = job?.jobLocation || {};

//   // const displayLocation =
//   // job?.workMode?.toLowerCase() === "remote"
//   //   ? location.countryName ||
//   //     Country.getCountryByCode(location.countryCode || "")?.name ||
//   //     "Remote"
//   //   : location.cityName ||
//   //     location.city ||
//   //     location.name ||
//   //     "—";

//   const workMode = String(job?.workMode || "").toLowerCase();

//   const isRemote =
//     workMode.includes("remote") ||
//     workMode.includes("work from home") ||
//     workMode.includes("wfh");

//   const displayLocation = isRemote
//     ? Country.getCountryByCode(location?.countryCode || "IN")?.name || "Remote"
//     : location?.cityName || "—";



//   const postedDate = job?.createdAt
//     ? new Date(job.createdAt).toLocaleDateString("en-IN", {
//       day: "numeric",
//       month: "short",
//       year: "numeric",
//     })
//     : "—";
//   const expireDate = adv.expireDate
//     ? new Date(adv.expireDate).toLocaleDateString("en-IN", {
//       day: "numeric",
//       month: "short",
//       year: "numeric",
//     })
//     : "—";
//   const salaryLabel = job?.salaryRange
//     ? `₹${(job.salaryRange.minSalary / 1000).toFixed(0)}k – ₹${(job.salaryRange.maxSalary / 1000).toFixed(0)}k/${job.salaryType?.toLowerCase() || "month"}`
//     : "—";
//   const companyLogo = company.companyLogo?.[0] || null;
//   const daysRemaining = adv.expireDate
//     ? Math.ceil((new Date(adv.expireDate) - new Date()) / (1000 * 60 * 60 * 24))
//     : null;

//   const isExpiringSoon = daysRemaining > 0 && daysRemaining <= 7;

//   const applicantCount =
//     job?.applicantCount ??
//     totalApplicants ??
//     locationState.state?.applicantCount ??
//     0;

//   const matchedCount =
//     job?.matchedCandidates ??
//     job?.dbMatchCount ??
//     locationState.state?.matchedCount ??
//     0;

//   return (
//     <>
//       <style>{`
//         @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700;800&display=swap');
//         .line-clamp-2 {
//           display: -webkit-box;
//           -webkit-line-clamp: 2;
//           -webkit-box-orient: vertical;
//           overflow: hidden;
//         }
//         .line-clamp-3 {
//           display: -webkit-box;
//           -webkit-line-clamp: 3;
//           -webkit-box-orient: vertical;
//           overflow: hidden;
//         }
//         .prose-content {
//           overflow-wrap: break-word;
//           word-break: break-word;
//         }
//         .prose-content * {
//           max-width: 100%;
//         }
//       `}</style>

//       <div
//         className="bg-gradient-to-br from-purple-200/30 via-white to-purple-200/30"
//         style={{ fontFamily: "'Poppins', sans-serif" }}
//       >
//         <div className="max-w-7xl mx-auto p-5 bg-white rounded-xl">
//           {/* ── Back Button ── */}
//           <button
//             onClick={() => navigate(-1)}
//             className="group flex items-center gap-2 text-gray-500 hover:text-purple-600 transition-all mb-6"
//           >
//             <ArrowLeft
//               className="w-4 h-4 group-hover:-translate-x-1 transition-transform"
//               strokeWidth={2}
//             />
//             <span className="text-sm font-medium">Back to Jobs</span>
//           </button>

//           {/* ── Loading state ── */}
//           {jobDetailLoading && (
//             <div className="space-y-4">
//               <Skeleton className="h-32 w-full" />
//               <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
//                 <Skeleton className="lg:col-span-2 h-96" />
//                 <Skeleton className="h-96" />
//               </div>
//             </div>
//           )}

//           {/* ── Error / empty ── */}
//           {!jobDetailLoading && !job && (
//             <div className="text-center py-20">
//               <div className="w-24 h-24 bg-purple-50 rounded-full flex items-center justify-center mx-auto mb-4">
//                 <Briefcase
//                   className="w-12 h-12 text-purple-400"
//                   strokeWidth={1.4}
//                 />
//               </div>
//               <p className="text-gray-500 font-medium">
//                 Job not found or failed to load.
//               </p>
//               <button
//                 onClick={() => navigate("/my-jobs")}
//                 className="mt-4 px-6 py-2 bg-purple-600 text-white rounded-xl text-sm font-semibold hover:bg-purple-700 transition"
//               >
//                 Back to Jobs
//               </button>
//             </div>
//           )}

//           {/* ── Content ── */}
//           {!jobDetailLoading && job && (
//             <>
//               {/* Hero Header */}
//               <div className="relative mb-8 overflow-hidden rounded-2xl bg-gradient-to-r from-purple-700 via-purple-600 to-pink-600 p-6 sm:p-8">
//                 <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/3" />
//                 <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/4" />
//                 <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
//                   <div className="flex items-center gap-4">
//                     <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-white shadow-lg flex items-center justify-center flex-shrink-0 overflow-hidden">
//                       {companyLogo ? (
//                         <img
//                           src={companyLogo}
//                           alt="logo"
//                           className="w-full h-full object-cover"
//                         />
//                       ) : (
//                         <Building2 className="w-10 h-10 text-purple-600" />
//                       )}
//                     </div>
//                     <div>
//                       <div className="flex flex-wrap items-center gap-2 mb-2">
//                         <h1 className="text-xl sm:text-2xl font-bold text-white break-words max-w-full">
//                           {job.jobTitle}
//                         </h1>
//                         <span className="text-xs font-semibold bg-white/20 text-white px-3 py-1 rounded-full backdrop-blur-sm whitespace-nowrap">
//                           {adv.jobType || "Full Time"}
//                         </span>
//                         <span
//                           className={`text-xs font-semibold px-3 py-1 rounded-full backdrop-blur-sm whitespace-nowrap
//                           ${job.status === "active" ? "bg-green-500/20 text-green-100" : "bg-gray-500/20 text-gray-100"}`}
//                         >
//                           {job.status === "active" ? "● Active" : "● Closed"}
//                         </span>
//                       </div>
//                       <p className="text-white/80 text-sm">
//                         {company.companyName || employer.name}
//                       </p>
//                       {displayLocation && (
//                         <p className="text-white/70 text-xs flex items-center gap-1 mt-1">
//                           <MapPin className="w-3 h-3 flex-shrink-0" />
//                           {displayLocation}
//                         </p>
//                       )}
//                     </div>
//                   </div>
//                   <div className="flex gap-3">
//                     <button
//                       onClick={() => navigate(`/my-job/edit/${job._id}`)}
//                       className="flex items-center gap-2 bg-white text-purple-700 px-4 py-2 rounded-xl text-sm font-semibold hover:bg-purple-50 transition shadow-md"
//                     >
//                       <Pencil className="w-4 h-4" /> Edit Job
//                     </button>
//                     {/* <button
//                       onClick={handleCopyLink}
//                       className="flex items-center gap-2 bg-white/20 text-white px-4 py-2 rounded-xl text-sm font-semibold hover:bg-white/30 transition backdrop-blur-sm"
//                     >
//                       {copied ? <Check className="w-4 h-4" /> : <Share2 className="w-4 h-4" />}
//                       {copied ? 'Copied!' : 'Share'}
//                     </button> */}
//                   </div>
//                 </div>
//               </div>

//               {/* Stats Bar */}
//               <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
//                 <div className="bg-white rounded-xl p-3 text-center border border-gray-100 shadow-sm">
//                   <Calendar className="w-4 h-4 text-purple-500 mx-auto mb-1" />
//                   <p className="text-xs text-gray-500">Posted</p>
//                   <p className="text-xs font-semibold text-gray-700">
//                     {postedDate}
//                   </p>
//                 </div>
//                 <div className="bg-white rounded-xl p-3 text-center border border-gray-100 shadow-sm">
//                   <Clock className="w-4 h-4 text-purple-500 mx-auto mb-1" />
//                   <p className="text-xs text-gray-500">Expires</p>
//                   <p
//                     className={`text-xs font-semibold ${isExpiringSoon ? "text-red-500" : "text-gray-700"}`}
//                   >
//                     {expireDate}
//                     {isExpiringSoon && (
//                       <span className="block text-[10px] text-red-400">
//                         ({daysRemaining} days left)
//                       </span>
//                     )}
//                   </p>
//                 </div>
//                 <div
//                   className="bg-white rounded-xl p-3 text-center border border-gray-100 shadow-sm cursor-pointer hover:border-purple-300 transition"
//                   onClick={() => navigate(`/my-job/applicant/${job._id}`)}
//                   title="View Applicants"
//                 >
//                   <Users className="w-4 h-4 text-purple-500 mx-auto mb-1" />
//                   <p className="text-xs text-gray-500">Applicants</p>
//                   <p className="text-xs font-semibold text-gray-700">
//                     {/* {totalApplicants ?? 0} */}{applicantCount}
//                   </p>
//                 </div>
//                 <div className="bg-white rounded-xl p-3 text-center border border-gray-100 shadow-sm">
//                   <Award className="w-4 h-4 text-purple-500 mx-auto mb-1" />
//                   <p className="text-xs text-gray-500">Matches</p>
//                   <p className="text-xs font-semibold text-gray-700">
//                     {/* {job.dbMatchCount || 0} */}{matchedCount}
//                   </p>
//                 </div>
//               </div>

//               {/* Main Content */}
//               <div className="flex flex-col lg:flex-row gap-6 items-start">
//                 {/* Left Column - Main Content */}
//                 <div className="flex-1 min-w-0 space-y-6">
//                   {/* Job Description */}
//                   <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 hover:shadow-md transition-all">
//                     <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
//                       <Briefcase className="w-5 h-5 text-purple-600" />
//                       Job Description
//                     </h2>
//                     <div
//                       className="prose-content text-sm text-gray-600 leading-relaxed"
//                       dangerouslySetInnerHTML={{ __html: job.jobDescription }}
//                     />
//                   </div>

//                   {/* Responsibilities */}
//                   <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 hover:shadow-md transition-all">
//                     <h2 className=" text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
//                       <CheckCircle className="w-5 h-5 text-purple-600" />
//                       Key Responsibilities
//                     </h2>
//                     <div
//                       className="prose-content text-sm text-gray-600 leading-relaxed"
//                       dangerouslySetInnerHTML={{
//                         __html: job.jobResponsibilities,
//                       }}
//                     />
//                   </div>

//                   {/* Skills Required */}
//                   {job.skillsRequired?.length > 0 && (
//                     <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 hover:shadow-md transition-all">
//                       <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
//                         <GraduationCap className="w-5 h-5 text-purple-600" />
//                         Skills Required
//                       </h2>
//                       <div className="flex flex-wrap gap-2">
//                         {job.skillsRequired.map((skill, i) => (
//                           <SkillBadge key={i} skill={skill} />
//                         ))}
//                       </div>
//                     </div>
//                   )}

//                   {/* Salary Range */}
//                   <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl p-6 border border-purple-100">
//                     <h2 className="text-lg font-bold text-gray-900 mb-2 flex items-center gap-2">
//                       <DollarSign className="w-5 h-5 text-purple-600" />
//                       Salary Range
//                     </h2>
//                     <p className="text-2xl font-bold text-purple-700">
//                       {salaryLabel}
//                     </p>
//                     <p className="text-xs text-gray-500 mt-1">
//                       Based on experience and qualifications
//                     </p>
//                   </div>
//                 </div>

//                 {/* Right Column - Sidebar */}
//                 <div className="lg:w-80 flex-shrink-0 space-y-5">
//                   {/* Job Overview */}
//                   <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
//                     <h3 className="text-sm font-bold text-gray-900 mb-4 flex items-center gap-2">
//                       <Briefcase className="w-4 h-4 text-purple-600" />
//                       Job Overview
//                     </h3>
//                     <div className="grid grid-cols-2 gap-3">
//                       <OverviewItem
//                         icon={Calendar}
//                         label="Job Posted"
//                         value={postedDate}
//                       />
//                       <OverviewItem
//                         icon={Clock}
//                         label="Job Expire"
//                         value={expireDate}
//                       />
//                       <OverviewItem
//                         icon={GraduationCap}
//                         label="Education"
//                         value={adv.education || "Any Graduate"}
//                       />
//                       <OverviewItem
//                         icon={DollarSign}
//                         label="Salary"
//                         value={salaryLabel}
//                       />
//                       <OverviewItem
//                         icon={MapPin}
//                         label="Location"
//                         value={displayLocation}
//                       />
//                       <OverviewItem
//                         icon={Briefcase}
//                         label="Job Type"
//                         value={adv.jobType || "Full Time"}
//                       />
//                       <OverviewItem
//                         icon={Briefcase}
//                         label="Experience"
//                         value={adv.experience || "Fresher"}
//                       />
//                       <OverviewItem
//                         icon={Briefcase}
//                         label="Job Level"
//                         value={adv.jobLevel || "Entry Level"}
//                       />
//                     </div>
//                   </div>

//                   {/* Company Info */}
//                   <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
//                     <div className="flex items-center gap-3 mb-4 pb-3 border-b border-gray-100">
//                       <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-100 to-purple-200 flex items-center justify-center flex-shrink-0 overflow-hidden">
//                         {companyLogo ? (
//                           <img
//                             src={companyLogo}
//                             alt="logo"
//                             className="w-full h-full object-cover"
//                           />
//                         ) : (
//                           <Building2 className="w-6 h-6 text-purple-600" />
//                         )}
//                       </div>
//                       <div>
//                         <p className="text-base font-bold text-gray-900">
//                           {employer.name || company.companyName || "Company"}
//                         </p>
//                         <p className="text-xs text-gray-500">
//                           {company.companyTagline || "Great place to work"}
//                         </p>
//                       </div>
//                     </div>

//                     <InfoRow label="Founded" value={business.fundedIn} />
//                     <InfoRow
//                       label="Organization Type"
//                       value={business.typeOfCompany}
//                     />
//                     <InfoRow
//                       label="Company Size"
//                       value={business.companySize}
//                     />
//                     <InfoRow label="Phone" value={employer.mobileNumber} />
//                     <InfoRow label="Email" value={employer.email} />
//                     {company.companyWebsite && (
//                       <div className="flex items-center justify-between py-2.5">
//                         <span className="text-sm text-gray-500">Website</span>
//                         <a
//                           href={`https://${company.companyWebsite}`}
//                           target="_blank"
//                           rel="noopener noreferrer"
//                           className="text-sm font-semibold text-purple-600 hover:text-purple-700 flex items-center gap-1"
//                         >
//                           {company.companyWebsite}
//                           <ExternalLink className="w-3 h-3" />
//                         </a>
//                       </div>
//                     )}

//                     {business.aboutCompany && (
//                       <div className="mt-3 pt-3 border-t border-gray-100">
//                         <p className="text-xs text-gray-500 leading-relaxed line-clamp-3">
//                           {business.aboutCompany}
//                         </p>
//                       </div>
//                     )}

//                     {/* Social Icons */}
//                     <div className="flex gap-2 mt-4 pt-2">
//                       <SocialBtn icon={Facebook} color="bg-blue-600" />
//                       <SocialBtn icon={Twitter} color="bg-sky-500" />
//                       <SocialBtn icon={Instagram} color="bg-pink-500" />
//                       <SocialBtn icon={Youtube} color="bg-red-500" />
//                     </div>
//                   </div>

//                   {/* Quick Actions */}
//                   <div className="bg-gradient-to-r from-purple-600 to-purple-700 rounded-2xl p-5 text-center">
//                     <h4 className="text-white font-semibold mb-2">
//                       Need to make changes?
//                     </h4>
//                     <p className="text-purple-100 text-xs mb-4">
//                       You can edit this job posting anytime
//                     </p>
//                     <button
//                       onClick={() => navigate(`/my-job/edit/${job._id}`)}
//                       className="w-full bg-white text-purple-700 px-4 py-2 rounded-xl text-sm font-semibold hover:bg-purple-50 transition shadow-md"
//                     >
//                       Edit Job Details
//                     </button>
//                   </div>
//                 </div>
//               </div>

//               {/* Footer */}
//               <div className="text-center pt-8 pb-4 border-t border-gray-100 mt-8">
//                 <p className="text-xs text-gray-400">
//                   © 2025 MyJob – Technokrate Hire. All rights reserved.
//                 </p>
//               </div>
//             </>
//           )}
//         </div>
//       </div>
//     </>
//   );
// };

// export default JobDetail;

