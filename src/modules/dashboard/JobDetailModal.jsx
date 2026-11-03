import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Country, State } from "country-state-city";
import {
  X,
  Calendar,
  Clock,
  GraduationCap,
  Briefcase,
  MapPin,
  DollarSign,
  Users,
  Award,
  CheckCircle,
  Building2,
  ExternalLink,
  Facebook,
  Twitter,
  Instagram,
  Youtube,
} from "lucide-react";
import {
  getJobDetails,
  clearJobDetail,
  getApplicants,
} from "../../redux/slices/companyJobs/jobSlice";
import { getSocialUrl } from "../../utils/socialUrl";

// ─── Robust Location Display Resolver ─────────────────────────────────────
// Checks every possible place the backend might have put workMode / location
// data, so this keeps working regardless of API response shape.
const getLocationInfo = (job) => {
  const adv = job?.advanceInformation || {};

  const getNestedValue = (source, path) => {
    if (!source || !path) return undefined;
    return path.split(".").reduce((acc, key) => {
      if (acc && typeof acc === "object" && key in acc) {
        return acc[key];
      }
      return undefined;
    }, source);
  };

  const searchValue = (source, keys) => {
    for (const key of keys) {
      const value = getNestedValue(source, key);
      if (value !== undefined && value !== null && String(value).trim() !== "") {
        return String(value).trim();
      }
    }
    return "";
  };

  const rawLocation =
    job?.jobLocation || job?.location || adv?.jobLocation || adv?.location || {};

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
    ...(adv?.location || {}),
    ...(adv?.jobLocation || {}),
  };

  // work mode har possible jagah se nikaalo
  const rawWorkMode =
    job?.workMode ||
    adv?.workMode ||
    job?.jobMode ||
    job?.locationType ||
    job?.jobLocationType ||
    adv?.jobLocationType ||
    "";

  const workMode = String(rawWorkMode).toLowerCase().replace(/[\s\-_]/g, "");

  const isRemote =
    workMode.includes("remote") ||
    workMode.includes("workfromhome") ||
    workMode.includes("wfh");

  const isOnsite =
    workMode.includes("onsite") ||
    workMode.includes("office") ||
    workMode.includes("insite");

  const isHybrid = workMode.includes("hybrid");

  const countryCode = searchValue(loc, [
    "countryCode",
    "country_code",
    "country",
    "location.countryCode",
    "location.country_code",
    "location.country",
    "jobLocation.countryCode",
    "jobLocation.country_code",
    "jobLocation.country",
  ]);
  const resolvedCountryCode = Country.getCountryByCode(countryCode) ? countryCode : "";
  const rawCountryName = searchValue(loc, [
    "countryName",
    "country",
    "location.countryName",
    "location.country",
    "jobLocation.countryName",
    "jobLocation.country",
  ]);
  const countryName =
    (rawCountryName && !Country.getCountryByCode(rawCountryName)
      ? rawCountryName
      : "") ||
    (resolvedCountryCode ? Country.getCountryByCode(resolvedCountryCode)?.name : "") ||
    "";

  const cityName = searchValue(loc, [
    "cityName",
    "city",
    "city_name",
    "locationName",
    "locality",
    "district",
    "town",
    "village",
    "area",
    "suburb",
    "neighborhood",
    "location.cityName",
    "location.city",
    "location.locationName",
    "location.locality",
    "jobLocation.cityName",
    "jobLocation.city",
    "jobLocation.locationName",
    "jobLocation.locality",
  ]);
  const rawState = searchValue(loc, [
    "stateName",
    "state",
    "state_code",
    "stateCode",
    "region",
    "province",
    "state_id",
    "location.stateName",
    "location.state",
    "location.stateCode",
    "location.region",
    "jobLocation.stateName",
    "jobLocation.state",
    "jobLocation.stateCode",
    "jobLocation.region",
  ]);
  const stateName =
    searchValue(loc, ["stateName", "location.stateName", "jobLocation.stateName"]) ||
    (resolvedCountryCode && rawState
      ? State.getStateByCodeAndCountry(rawState, resolvedCountryCode)?.name
      : "") ||
    rawState;
  const fallbackName = searchValue(loc, [
    "name",
    "location.name",
    "jobLocation.name",
  ]);
  const displayCity =
    fallbackName && fallbackName !== stateName ? cityName || fallbackName : cityName;

  const locationValue =
    stateName && displayCity
      ? `${stateName}, ${displayCity}`
      : stateName || displayCity || countryName || "—";

  const displayLocation = isRemote
    ? countryName || "Remote"
    : locationValue;

  return {
    isRemote,
    isHybrid,
    isOnsite,
    displayLocation,
  };
};

// Overview Item component
const OverviewItem = ({ icon: Icon, label, value }) => (
  <div className="group bg-gradient-to-br from-gray-50 to-white rounded-xl p-3 text-center border border-gray-100 hover:shadow-md transition-all duration-300">
    <div className="w-9 h-9 rounded-xl bg-purple-100 flex items-center justify-center mx-auto mb-2 group-hover:scale-110 transition-transform">
      <Icon className="w-4 h-4 text-purple-600" strokeWidth={1.8} />
    </div>
    <p className="text-[10px] text-gray-400 mb-0.5">{label}</p>
    <p className="text-xs font-semibold text-gray-700 line-clamp-2">
      {value || "—"}
    </p>
  </div>
);

// Company Info Row component
const InfoRow = ({ label, value }) => (
  <div className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
    <span className="text-xs text-gray-500">{label}</span>
    <span className="text-xs font-semibold text-gray-800 text-right max-w-[60%] truncate">
      {value || "—"}
    </span>
  </div>
);

// Social Button component
const SocialBtn = ({ icon: Icon, color, link, defaultUrl, label }) => {
  const targetUrl = getSocialUrl(link, defaultUrl);

  return (
    <a
      href={targetUrl}
      target="_blank"
      rel="noopener noreferrer"
      title={label}
      aria-label={label}
      className={`w-8 h-8 rounded-lg flex items-center justify-center text-white transition-all hover:scale-110 hover:shadow-md ${color}`}
    >
      <Icon className="w-3.5 h-3.5" strokeWidth={2} />
    </a>
  );
};

// Skill Badge component
const SkillBadge = ({ skill }) => (
  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-medium bg-gradient-to-r from-purple-50 to-purple-100 text-purple-700 border border-purple-200 hover:shadow-sm transition-all">
    <CheckCircle className="w-3 h-3 text-purple-500" />
    {skill}
  </span>
);

const JobDetailModal = ({ jobId, listJob, onClose }) => {
  const dispatch = useDispatch();
  const { jobDetail: job, jobDetailLoading, totalApplicants, error } = useSelector((s) => s.job);

  useEffect(() => {
    if (jobId) {
      dispatch(getJobDetails(jobId));
      // Fetch live applicant count — same source as the Applicants page
      dispatch(getApplicants({ jobId, page: 1, limit: 1 }));
    }
    return () => {
      dispatch(clearJobDetail());
    };
  }, [dispatch, jobId]);

  // 🔍 TEMP DEBUG — remove after confirming field names in console.
  useEffect(() => {
    if (job) {
      console.log("JOB DATA (modal) →", JSON.stringify(job, null, 2));
    }
  }, [job]);

  if (!jobId) return null;

  const employer = job?.employer || {};
  const company = employer.companyDetail || {};
  const business = employer.businessDetail || {};
  const adv = job?.advanceInformation || {};

  const socialSource = company.social || company.socialLinks || employer.socialLinks || business.social || {};
  const fbLink = socialSource.facebook || socialSource.facebookUrl || company.facebook || company.facebookUrl || employer.facebook || employer.facebookUrl || '';
  const twitterLink = socialSource.twitter || socialSource.twitterUrl || company.twitter || company.twitterUrl || employer.twitter || employer.twitterUrl || '';
  const instaLink = socialSource.instagram || socialSource.instagramUrl || company.instagram || company.instagramUrl || employer.instagram || employer.instagramUrl || '';
  const ytLink = socialSource.youtube || socialSource.youtubeUrl || company.youtube || company.youtubeUrl || employer.youtube || employer.youtubeUrl || '';

  const { displayLocation } = getLocationInfo(job);

  // Count resolver: dashboard list + job details + applicants API sabka fallback
  const applicantCount =
    listJob?.applicantCount ??
    job?.applicantCount ??
    job?.totalApplicants ??
    totalApplicants ??
    0;

  const matchedCount =
    listJob?.databaseMatches ??
    job?.databaseMatches ??
    job?.dbMatchCount ??
    job?.matchedCount ??
    0;

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

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="w-full max-w-5xl h-[85vh] flex flex-col overflow-hidden rounded-3xl bg-white shadow-2xl animate-in zoom-in-95 duration-200">

        {/* Header Bar */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 flex-shrink-0">
          <h2 className="text-base font-bold text-gray-800">Job Details</h2>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl bg-gray-50 hover:bg-gray-100 text-gray-500 hover:text-gray-700 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Container */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">

          {jobDetailLoading ? (
            <div className="flex flex-col items-center justify-center py-20">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-purple-600 mb-4"></div>
              <p className="text-sm text-gray-500 font-medium">Loading job details...</p>
            </div>
          ) : error ? (
            <div className="text-center py-10">
              <p className="text-red-500 font-semibold">{error}</p>
            </div>
          ) : !job ? (
            <div className="text-center py-10 text-gray-500 font-medium">
              Job details not found.
            </div>
          ) : (
            <>
              {/* Hero Header */}
              <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-purple-700 via-purple-600 to-pink-600 p-6">
                <div className="absolute top-0 right-0 w-48 h-48 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/3" />
                <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-xl bg-white shadow-md flex items-center justify-center flex-shrink-0 overflow-hidden">
                      {companyLogo ? (
                        <img
                          src={companyLogo}
                          alt="logo"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <Building2 className="w-8 h-8 text-purple-600" />
                      )}
                    </div>
                    <div>
                      <div className="flex flex-wrap items-center gap-2 mb-1">
                        <h1 className="text-lg sm:text-xl font-bold text-white">
                          {job.jobTitle}
                        </h1>
                        <span className="text-[10px] font-semibold bg-white/20 text-white px-2 py-0.5 rounded-full backdrop-blur-sm">
                          {adv.jobType || "Full Time"}
                        </span>
                        {(() => {
                          const rawStatus = (job.status || '').toLowerCase();
                          const currentStatusVal = rawStatus === 'paused' ? 'Paused' : (rawStatus === 'closed' || rawStatus === 'expired') ? 'Closed' : 'Active';
                          return (
                            <span
                              className={`text-[10px] font-semibold px-2 py-0.5 rounded-full backdrop-blur-sm ${
                                currentStatusVal === 'Active'
                                  ? 'bg-green-500/20 text-green-100'
                                  : currentStatusVal === 'Paused'
                                  ? 'bg-amber-500/20 text-amber-100'
                                  : 'bg-red-500/20 text-red-100'
                              }`}
                            >
                              ● {currentStatusVal}
                            </span>
                          );
                        })()}
                      </div>
                      <p className="text-white/80 text-xs">
                        {company.companyName || employer.name}
                      </p>
                      {displayLocation && (
                        <p className="text-white/70 text-[11px] flex items-center gap-1 mt-0.5">
                          <MapPin className="w-3 h-3" />
                          {displayLocation}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Stats Bar */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="bg-white rounded-xl p-3 text-center border border-gray-100 shadow-sm">
                  <Calendar className="w-4 h-4 text-purple-500 mx-auto mb-1" />
                  <p className="text-[10px] text-gray-500">Posted</p>
                  <p className="text-xs font-semibold text-gray-700">{postedDate}</p>
                </div>
                <div className="bg-white rounded-xl p-3 text-center border border-gray-100 shadow-sm">
                  <Clock className="w-4 h-4 text-purple-500 mx-auto mb-1" />
                  <p className="text-[10px] text-gray-500">Expires</p>
                  <p className="text-xs font-semibold text-gray-700">{expireDate}</p>
                </div>
                <div className="bg-white rounded-xl p-3 text-center border border-gray-100 shadow-sm">
                  <Users className="w-4 h-4 text-purple-500 mx-auto mb-1" />
                  <p className="text-[10px] text-gray-500">Applicants</p>
                  <p className="text-xs font-semibold text-gray-700">{applicantCount}</p>
                </div>
                <div className="bg-white rounded-xl p-3 text-center border border-gray-100 shadow-sm">
                  <Award className="w-4 h-4 text-purple-500 mx-auto mb-1" />
                  <p className="text-[10px] text-gray-500">Matches</p>
                  <p className="text-xs font-semibold text-gray-700">{matchedCount}</p>
                </div>
              </div>

              {/* Content Columns */}
              <div className="flex flex-col lg:flex-row gap-6">

                {/* Left - Main Content */}
                <div className="flex-1 space-y-6">
                  {/* Job Description */}
                  <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                    <h3 className="text-sm font-bold text-gray-950 mb-3 flex items-center gap-2">
                      <Briefcase className="w-4 h-4 text-purple-600" />
                      Job Description
                    </h3>
                    <div
                      className="prose-content text-xs text-gray-600 leading-relaxed"
                      dangerouslySetInnerHTML={{ __html: job.jobDescription }}
                    />
                  </div>

                  {/* Responsibilities */}
                  <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                    <h3 className="text-sm font-bold text-gray-950 mb-3 flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-purple-600" />
                      Key Responsibilities
                    </h3>
                    <div
                      className="prose-content text-xs text-gray-600 leading-relaxed"
                      dangerouslySetInnerHTML={{ __html: job.jobResponsibilities }}
                    />
                  </div>

                  {/* Skills */}
                  {job.skillsRequired?.length > 0 && (
                    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                      <h3 className="text-sm font-bold text-gray-950 mb-3 flex items-center gap-2">
                        <GraduationCap className="w-4 h-4 text-purple-600" />
                        Skills Required
                      </h3>
                      <div className="flex flex-wrap gap-1.5">
                        {job.skillsRequired.map((skill, i) => (
                          <SkillBadge key={i} skill={skill} />
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Salary Range */}
                  <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl p-5 border border-purple-100">
                    <h3 className="text-sm font-bold text-gray-950 mb-1 flex items-center gap-2">
                      <DollarSign className="w-4 h-4 text-purple-600" />
                      Salary Range
                    </h3>
                    <p className="text-xl font-bold text-purple-700">{salaryLabel}</p>
                    <p className="text-[10px] text-gray-500">
                      Based on experience and qualifications
                    </p>
                  </div>
                </div>

                {/* Right - Sidebar */}
                <div className="lg:w-72 flex-shrink-0 space-y-5">
                  {/* Job Overview */}
                  <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
                    <h3 className="text-xs font-bold text-gray-950 mb-3 flex items-center gap-2">
                      <Briefcase className="w-3.5 h-3.5 text-purple-600" />
                      Job Overview
                    </h3>
                    <div className="grid grid-cols-2 gap-2">
                      <OverviewItem icon={Calendar} label="Job Posted" value={postedDate} />
                      <OverviewItem icon={Clock} label="Job Expire" value={expireDate} />
                      <OverviewItem icon={GraduationCap} label="Education" value={adv.education || "Any Graduate"} />
                      <OverviewItem icon={DollarSign} label="Salary" value={salaryLabel} />
                      <OverviewItem icon={MapPin} label="Location" value={displayLocation} />
                      <OverviewItem icon={Briefcase} label="Job Type" value={adv.jobType || "Full Time"} />
                      <OverviewItem icon={Briefcase} label="Experience" value={adv.experience || "Fresher"} />
                      <OverviewItem icon={Briefcase} label="Job Level" value={adv.jobLevel || "Entry Level"} />
                    </div>
                  </div>

                  {/* Company Info */}
                  <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
                    <div className="flex items-center gap-2.5 mb-3 pb-3 border-b border-gray-100">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-100 to-purple-200 flex items-center justify-center flex-shrink-0 overflow-hidden">
                        {companyLogo ? (
                          <img
                            src={companyLogo}
                            alt="logo"
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <Building2 className="w-5 h-5 text-purple-600" />
                        )}
                      </div>
                      <div>
                        <p className="text-xs font-bold text-gray-950 truncate max-w-[150px]">
                          {employer.name || company.companyName || "Company"}
                        </p>
                        <p className="text-[10px] text-gray-500 truncate max-w-[150px]">
                          {company.companyTagline || "Great place to work"}
                        </p>
                      </div>
                    </div>

                    <InfoRow label="Founded" value={business.fundedIn} />
                    <InfoRow label="Org Type" value={business.typeOfCompany} />
                    <InfoRow label="Company Size" value={business.companySize} />
                    <InfoRow label="Phone" value={employer.mobileNumber} />
                    <InfoRow label="Email" value={employer.email} />

                    {company.companyWebsite && (
                      <div className="flex items-center justify-between py-2">
                        <span className="text-xs text-gray-500">Website</span>
                        <a
                          href={`https://${company.companyWebsite}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs font-semibold text-purple-600 hover:text-purple-700 flex items-center gap-0.5 truncate max-w-[60%]"
                        >
                          {company.companyWebsite}
                          <ExternalLink className="w-2.5 h-2.5" />
                        </a>
                      </div>
                    )}

                    {business.aboutCompany && (
                      <div className="mt-2 pt-2 border-t border-gray-100">
                        <p className="text-[10px] text-gray-500 leading-relaxed line-clamp-3">
                          {business.aboutCompany}
                        </p>
                      </div>
                    )}

                    {/* Social Buttons */}
                    <div className="flex gap-1.5 mt-3 pt-2">
                      <SocialBtn icon={Facebook} color="bg-blue-600" link={fbLink} defaultUrl="https://www.facebook.com" label="Facebook" />
                      <SocialBtn icon={Twitter} color="bg-sky-500" link={twitterLink} defaultUrl="https://x.com" label="Twitter / X" />
                      <SocialBtn icon={Instagram} color="bg-pink-500" link={instaLink} defaultUrl="https://www.instagram.com" label="Instagram" />
                      <SocialBtn icon={Youtube} color="bg-red-500" link={ytLink} defaultUrl="https://www.youtube.com" label="YouTube" />
                    </div>
                  </div>
                </div>

              </div>
            </>
          )}

        </div>

      </div>
    </div>
  );
};

export default JobDetailModal;





// import React, { useEffect } from "react";
// import { useDispatch, useSelector } from "react-redux";
// import { Country } from "country-state-city";
// import {
//   X,
//   Calendar,
//   Clock,
//   GraduationCap,
//   Briefcase,
//   MapPin,
//   DollarSign,
//   Users,
//   Award,
//   CheckCircle,
//   Building2,
//   ExternalLink,
//   Facebook,
//   Twitter,
//   Instagram,
//   Youtube,
// } from "lucide-react";
// import {
//   getJobDetails,
//   clearJobDetail,
//   getApplicants,
// } from "../../redux/slices/companyJobs/jobSlice";

// // Overview Item component
// const OverviewItem = ({ icon: Icon, label, value }) => (
//   <div className="group bg-gradient-to-br from-gray-50 to-white rounded-xl p-3 text-center border border-gray-100 hover:shadow-md transition-all duration-300">
//     <div className="w-9 h-9 rounded-xl bg-purple-100 flex items-center justify-center mx-auto mb-2 group-hover:scale-110 transition-transform">
//       <Icon className="w-4 h-4 text-purple-600" strokeWidth={1.8} />
//     </div>
//     <p className="text-[10px] text-gray-400 mb-0.5">{label}</p>
//     <p className="text-xs font-semibold text-gray-700 line-clamp-2">
//       {value || "—"}
//     </p>
//   </div>
// );

// // Company Info Row component
// const InfoRow = ({ label, value }) => (
//   <div className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
//     <span className="text-xs text-gray-500">{label}</span>
//     <span className="text-xs font-semibold text-gray-800 text-right max-w-[60%] truncate">
//       {value || "—"}
//     </span>
//   </div>
// );

// // Social Button component
// const SocialBtn = ({ icon: Icon, color, link }) => (
//   <a
//     href={link || "#"}
//     target="_blank"
//     rel="noopener noreferrer"
//     className={`w-8 h-8 rounded-lg flex items-center justify-center text-white transition-all hover:scale-110 hover:shadow-md ${color}`}
//   >
//     <Icon className="w-3.5 h-3.5" strokeWidth={2} />
//   </a>
// );

// // Skill Badge component
// const SkillBadge = ({ skill }) => (
//   <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-medium bg-gradient-to-r from-purple-50 to-purple-100 text-purple-700 border border-purple-200 hover:shadow-sm transition-all">
//     <CheckCircle className="w-3 h-3 text-purple-500" />
//     {skill}
//   </span>
// );

// const JobDetailModal = ({ jobId, onClose }) => {
//   const dispatch = useDispatch();
//   const { jobDetail: job, jobDetailLoading, totalApplicants, error } = useSelector((s) => s.job);

//   useEffect(() => {
//     if (jobId) {
//       dispatch(getJobDetails(jobId));
//       // Fetch live applicant count — same source as the Applicants page
//       dispatch(getApplicants({ jobId, page: 1, limit: 1 }));
//     }
//     return () => {
//       dispatch(clearJobDetail());
//     };
//   }, [dispatch, jobId]);

//   if (!jobId) return null;

//   const employer = job?.employer || {};
//   const company = employer.companyDetail || {};
//   const business = employer.businessDetail || {};
//   const adv = job?.advanceInformation || {};
//   const location = job?.jobLocation || {};

//   const workMode = String(
//     job?.workMode ||
//     job?.advanceInformation?.workMode ||
//     job?.jobMode ||
//     job?.locationType ||
//     ""
//   ).toLowerCase();

//   const normalizedWorkMode = workMode.replace(/[\s-_]/g, "");

//   const isRemote =
//     normalizedWorkMode.includes("remote") ||
//     normalizedWorkMode.includes("workfromhome") ||
//     normalizedWorkMode.includes("wfh");

//   const isOnsite =
//     normalizedWorkMode.includes("onsite") ||
//     normalizedWorkMode.includes("office");

//   const displayLocation = isRemote
//     ? location?.countryName ||
//     Country.getCountryByCode(location?.countryCode || "IN")?.name ||
//     "India"
//     : isOnsite
//       ? location?.cityName || "—"
//       : location?.cityName ||
//       location?.countryName ||
//       Country.getCountryByCode(location?.countryCode || "IN")?.name ||
//       "—";

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

//   return (
//     <div
//       className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-sm animate-in fade-in duration-200"
//       onClick={(e) => e.target === e.currentTarget && onClose()}
//     >
//       <div className="w-full max-w-5xl h-[85vh] flex flex-col overflow-hidden rounded-3xl bg-white shadow-2xl animate-in zoom-in-95 duration-200">

//         {/* Header Bar */}
//         <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 flex-shrink-0">
//           <h2 className="text-base font-bold text-gray-800">Job Details</h2>
//           <button
//             onClick={onClose}
//             className="p-1.5 rounded-xl bg-gray-50 hover:bg-gray-100 text-gray-500 hover:text-gray-700 transition"
//           >
//             <X className="w-5 h-5" />
//           </button>
//         </div>

//         {/* Scrollable Container */}
//         <div className="flex-1 overflow-y-auto p-6 space-y-6">

//           {jobDetailLoading ? (
//             <div className="flex flex-col items-center justify-center py-20">
//               <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-purple-600 mb-4"></div>
//               <p className="text-sm text-gray-500 font-medium">Loading job details...</p>
//             </div>
//           ) : error ? (
//             <div className="text-center py-10">
//               <p className="text-red-500 font-semibold">{error}</p>
//             </div>
//           ) : !job ? (
//             <div className="text-center py-10 text-gray-500 font-medium">
//               Job details not found.
//             </div>
//           ) : (
//             <>
//               {/* Hero Header */}
//               <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-purple-700 via-purple-600 to-pink-600 p-6">
//                 <div className="absolute top-0 right-0 w-48 h-48 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/3" />
//                 <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
//                   <div className="flex items-center gap-4">
//                     <div className="w-16 h-16 rounded-xl bg-white shadow-md flex items-center justify-center flex-shrink-0 overflow-hidden">
//                       {companyLogo ? (
//                         <img
//                           src={companyLogo}
//                           alt="logo"
//                           className="w-full h-full object-cover"
//                         />
//                       ) : (
//                         <Building2 className="w-8 h-8 text-purple-600" />
//                       )}
//                     </div>
//                     <div>
//                       <div className="flex flex-wrap items-center gap-2 mb-1">
//                         <h1 className="text-lg sm:text-xl font-bold text-white">
//                           {job.jobTitle}
//                         </h1>
//                         <span className="text-[10px] font-semibold bg-white/20 text-white px-2 py-0.5 rounded-full backdrop-blur-sm">
//                           {adv.jobType || "Full Time"}
//                         </span>
//                         <span
//                           className={`text-[10px] font-semibold px-2 py-0.5 rounded-full backdrop-blur-sm
//                           ${job.status === "active" ? "bg-green-500/20 text-green-100" : "bg-gray-500/20 text-gray-100"}`}
//                         >
//                           {job.status === "active" ? "● Active" : "● Closed"}
//                         </span>
//                       </div>
//                       <p className="text-white/80 text-xs">
//                         {company.companyName || employer.name}
//                       </p>
//                       {displayLocation && (
//                         <p className="text-white/70 text-[11px] flex items-center gap-1 mt-0.5">
//                           <MapPin className="w-3 h-3" />
//                           {displayLocation}
//                         </p>
//                       )}
//                     </div>
//                   </div>
//                 </div>
//               </div>

//               {/* Stats Bar */}
//               <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
//                 <div className="bg-white rounded-xl p-3 text-center border border-gray-100 shadow-sm">
//                   <Calendar className="w-4 h-4 text-purple-500 mx-auto mb-1" />
//                   <p className="text-[10px] text-gray-500">Posted</p>
//                   <p className="text-xs font-semibold text-gray-700">{postedDate}</p>
//                 </div>
//                 <div className="bg-white rounded-xl p-3 text-center border border-gray-100 shadow-sm">
//                   <Clock className="w-4 h-4 text-purple-500 mx-auto mb-1" />
//                   <p className="text-[10px] text-gray-500">Expires</p>
//                   <p className="text-xs font-semibold text-gray-700">{expireDate}</p>
//                 </div>
//                 <div className="bg-white rounded-xl p-3 text-center border border-gray-100 shadow-sm">
//                   <Users className="w-4 h-4 text-purple-500 mx-auto mb-1" />
//                   <p className="text-[10px] text-gray-500">Applicants</p>
//                   <p className="text-xs font-semibold text-gray-700">{totalApplicants ?? 0}</p>
//                 </div>
//                 <div className="bg-white rounded-xl p-3 text-center border border-gray-100 shadow-sm">
//                   <Award className="w-4 h-4 text-purple-500 mx-auto mb-1" />
//                   <p className="text-[10px] text-gray-500">Matches</p>
//                   <p className="text-xs font-semibold text-gray-700">{job.dbMatchCount || 0}</p>
//                 </div>
//               </div>

//               {/* Content Columns */}
//               <div className="flex flex-col lg:flex-row gap-6">

//                 {/* Left - Main Content */}
//                 <div className="flex-1 space-y-6">
//                   {/* Job Description */}
//                   <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
//                     <h3 className="text-sm font-bold text-gray-950 mb-3 flex items-center gap-2">
//                       <Briefcase className="w-4 h-4 text-purple-600" />
//                       Job Description
//                     </h3>
//                     <div
//                       className="prose-content text-xs text-gray-600 leading-relaxed"
//                       dangerouslySetInnerHTML={{ __html: job.jobDescription }}
//                     />
//                   </div>

//                   {/* Responsibilities */}
//                   <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
//                     <h3 className="text-sm font-bold text-gray-950 mb-3 flex items-center gap-2">
//                       <CheckCircle className="w-4 h-4 text-purple-600" />
//                       Key Responsibilities
//                     </h3>
//                     <div
//                       className="prose-content text-xs text-gray-600 leading-relaxed"
//                       dangerouslySetInnerHTML={{ __html: job.jobResponsibilities }}
//                     />
//                   </div>

//                   {/* Skills */}
//                   {job.skillsRequired?.length > 0 && (
//                     <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
//                       <h3 className="text-sm font-bold text-gray-950 mb-3 flex items-center gap-2">
//                         <GraduationCap className="w-4 h-4 text-purple-600" />
//                         Skills Required
//                       </h3>
//                       <div className="flex flex-wrap gap-1.5">
//                         {job.skillsRequired.map((skill, i) => (
//                           <SkillBadge key={i} skill={skill} />
//                         ))}
//                       </div>
//                     </div>
//                   )}

//                   {/* Salary Range */}
//                   <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl p-5 border border-purple-100">
//                     <h3 className="text-sm font-bold text-gray-950 mb-1 flex items-center gap-2">
//                       <DollarSign className="w-4 h-4 text-purple-600" />
//                       Salary Range
//                     </h3>
//                     <p className="text-xl font-bold text-purple-700">{salaryLabel}</p>
//                     <p className="text-[10px] text-gray-500">
//                       Based on experience and qualifications
//                     </p>
//                   </div>
//                 </div>

//                 {/* Right - Sidebar */}
//                 <div className="lg:w-72 flex-shrink-0 space-y-5">
//                   {/* Job Overview */}
//                   <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
//                     <h3 className="text-xs font-bold text-gray-950 mb-3 flex items-center gap-2">
//                       <Briefcase className="w-3.5 h-3.5 text-purple-600" />
//                       Job Overview
//                     </h3>
//                     <div className="grid grid-cols-2 gap-2">
//                       <OverviewItem icon={Calendar} label="Job Posted" value={postedDate} />
//                       <OverviewItem icon={Clock} label="Job Expire" value={expireDate} />
//                       <OverviewItem icon={GraduationCap} label="Education" value={adv.education || "Any Graduate"} />
//                       <OverviewItem icon={DollarSign} label="Salary" value={salaryLabel} />
//                       <OverviewItem icon={MapPin} label="Location" value={displayLocation} />
//                       <OverviewItem icon={Briefcase} label="Job Type" value={adv.jobType || "Full Time"} />
//                       <OverviewItem icon={Briefcase} label="Experience" value={adv.experience || "Fresher"} />
//                       <OverviewItem icon={Briefcase} label="Job Level" value={adv.jobLevel || "Entry Level"} />
//                     </div>
//                   </div>

//                   {/* Company Info */}
//                   <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
//                     <div className="flex items-center gap-2.5 mb-3 pb-3 border-b border-gray-100">
//                       <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-100 to-purple-200 flex items-center justify-center flex-shrink-0 overflow-hidden">
//                         {companyLogo ? (
//                           <img
//                             src={companyLogo}
//                             alt="logo"
//                             className="w-full h-full object-cover"
//                           />
//                         ) : (
//                           <Building2 className="w-5 h-5 text-purple-600" />
//                         )}
//                       </div>
//                       <div>
//                         <p className="text-xs font-bold text-gray-950 truncate max-w-[150px]">
//                           {employer.name || company.companyName || "Company"}
//                         </p>
//                         <p className="text-[10px] text-gray-500 truncate max-w-[150px]">
//                           {company.companyTagline || "Great place to work"}
//                         </p>
//                       </div>
//                     </div>

//                     <InfoRow label="Founded" value={business.fundedIn} />
//                     <InfoRow label="Org Type" value={business.typeOfCompany} />
//                     <InfoRow label="Company Size" value={business.companySize} />
//                     <InfoRow label="Phone" value={employer.mobileNumber} />
//                     <InfoRow label="Email" value={employer.email} />

//                     {company.companyWebsite && (
//                       <div className="flex items-center justify-between py-2">
//                         <span className="text-xs text-gray-500">Website</span>
//                         <a
//                           href={`https://${company.companyWebsite}`}
//                           target="_blank"
//                           rel="noopener noreferrer"
//                           className="text-xs font-semibold text-purple-600 hover:text-purple-700 flex items-center gap-0.5 truncate max-w-[60%]"
//                         >
//                           {company.companyWebsite}
//                           <ExternalLink className="w-2.5 h-2.5" />
//                         </a>
//                       </div>
//                     )}

//                     {business.aboutCompany && (
//                       <div className="mt-2 pt-2 border-t border-gray-100">
//                         <p className="text-[10px] text-gray-500 leading-relaxed line-clamp-3">
//                           {business.aboutCompany}
//                         </p>
//                       </div>
//                     )}

//                     {/* Social Buttons */}
//                     <div className="flex gap-1.5 mt-3 pt-2">
//                       <SocialBtn icon={Facebook} color="bg-blue-600" />
//                       <SocialBtn icon={Twitter} color="bg-sky-500" />
//                       <SocialBtn icon={Instagram} color="bg-pink-500" />
//                       <SocialBtn icon={Youtube} color="bg-red-500" />
//                     </div>
//                   </div>
//                 </div>

//               </div>
//             </>
//           )}

//         </div>

//       </div>
//     </div>
//   );
// };

// export default JobDetailModal;

