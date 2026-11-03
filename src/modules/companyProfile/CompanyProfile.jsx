import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { getCompanyProfile } from '../../redux/slices/company/companySlice';
import {
  Globe,
  Phone,
  MapPin,
  Building2,
  Users,
  Calendar,
  Briefcase,
  Award,
  FileText,
  Mail,
  ExternalLink,
  CheckCircle,
  UserCircle,
} from 'lucide-react';

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** companyLogo / companyBanner come back as [url, publicId] arrays */
const getImageUrl = (arr) => (Array.isArray(arr) && arr.length > 0 ? arr[0] : null);

/** Skeleton block for loading state */
const Skeleton = ({ className = '' }) => (
  <div className={`animate-pulse bg-gradient-to-r from-gray-100 to-gray-200 rounded-xl ${className}`} />
);

/** Section heading with accent bar */
const SectionHeading = ({ children, icon: Icon }) => (
  <div className="flex items-center gap-2 mb-4">
    {Icon && <Icon className="w-5 h-5 text-purple-600" />}
    <h3 className="text-lg font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
      {children}
    </h3>
    <div className="flex-1 h-px bg-gradient-to-r from-purple-200 to-transparent ml-2" />
  </div>
);

/** Info row with label and value */
const InfoRow = ({ label, value, icon: Icon, href, className = '' }) => {
  const content = (
    <div className={`flex items-start gap-3 py-2 group ${className}`}>
      {Icon && <Icon className="w-4 h-4 text-purple-400 mt-0.5 flex-shrink-0" />}
      <div className="flex-1">
        <span className="text-xs font-medium text-gray-400  tracking-wider block mb-0.5">
          {label}
        </span>
        {href ? (
          <a
            href={href}
            target="_blank"
            rel="noreferrer"
            className="text-gray-700 hover:text-purple-600 transition-colors duration-200 flex items-center gap-1 text-sm font-medium"
          >
            {value}
            <ExternalLink className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
          </a>
        ) : (
          <p className="text-gray-700 text-sm font-medium break-all">{value || 'N/A'}</p>
        )}
      </div>
    </div>
  );
  return content;
};

/** Stat card for metrics */
const StatCard = ({ label, value, icon: Icon }) => (
  <div className="bg-gradient-to-br from-gray-50 to-white rounded-2xl p-4 border border-gray-100 shadow-sm hover:shadow-md transition-all duration-300">
    <div className="flex items-center gap-3">
      <div className="p-2 bg-purple-50 rounded-xl">
        <Icon className="w-5 h-5 text-purple-600" />
      </div>
      <div>
        <p className="text-2xl font-bold text-gray-900">{value || 'N/A'}</p>
        <p className="text-xs text-gray-500">{label}</p>
      </div>
    </div>
  </div>
);

// ─── Main ─────────────────────────────────────────────────────────────────────
const CompanyProfile = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { profileData, profileLoading, profileError } = useSelector((s) => s.company);

  // Fetch on mount
  useEffect(() => {
    dispatch(getCompanyProfile());
  }, [dispatch]);

  // ── Loading state ──
  if (profileLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 py-8 px-4">
        <div className="max-w-9xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-10 w-28 rounded-full" />
          </div>
          <Skeleton className="h-56 w-full rounded-2xl" />
          <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-32 rounded-xl" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  // ── Error state ──
  if (profileError) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white flex items-center justify-center px-4">
        <div className="text-center space-y-4 max-w-md">
          <div className="bg-red-50 rounded-full w-16 h-16 flex items-center justify-center mx-auto">
            <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <p className="text-red-500 font-medium">{profileError}</p>
          <button
            onClick={() => dispatch(getCompanyProfile())}
            className="px-6 py-2 cursor-pointer bg-purple-600 text-white rounded-full text-sm font-semibold hover:bg-purple-700 transition-all shadow-md hover:shadow-lg"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!profileData) return null;

  // ── Destructure API response ──
  // API shape: { message, user: { name, email, mobileNumber, companyDetail, businessDetail, hiringPreference, verificationAndDocumentation } }
  const user = profileData?.user ?? profileData; // support both { user: {...} } and flat shapes

  const {
    name,
    email,
    mobileNumber,
    companyDetail = {},
    businessDetail = {},
    hiringPreference = {},
    verificationAndDocumentation = {},
  } = user;


  const logoUrl   = getImageUrl(companyDetail?.companyLogo);
  const bannerUrl = getImageUrl(companyDetail?.companyBanner);

  const tagline  = companyDetail?.companyTagline || '';
  const website  = companyDetail?.companyWebsite || null;
  const location = companyDetail?.location || null;

  const foundedIn    = businessDetail?.fundedIn        || 'N/A';
  const companyType  = businessDetail?.typeOfCompany   || 'N/A';
  const companySize  = businessDetail?.companySize     || 'N/A';
  const aboutText    = businessDetail?.aboutCompany    || null;

  const hiringFor    = hiringPreference?.hiringFor             || 'N/A';
  const jobLocation  = hiringPreference?.jobLocation           || null;
  const topSkill     = hiringPreference?.topHiringSkill        || 'N/A';
  const hiringCount  = hiringPreference?.averageHiringPerMonth || 'N/A';

  const legalName  = verificationAndDocumentation?.companyLegalName       || 'N/A';
  const regNumber  = verificationAndDocumentation?.companyRegisterNumber  || 'N/A';
  const gstNumber  = verificationAndDocumentation?.GSTNumber              || 'N/A';
  const cinNumber  = verificationAndDocumentation?.CINNumber              || 'N/A';

  // Display name: prefer company name, then legal name, then account name
  const displayName =
    companyDetail?.companyName ||
    (legalName !== 'N/A' && legalName) ||
    name ||
    'N/A';

  return (
    <>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap');`}</style>

      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-purple-50/30" style={{ fontFamily: "'Inter', sans-serif" }}>
        <div className="max-w-9xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

          {/* ── Header with Edit Button ── */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <UserCircle className="w-5 h-5 text-purple-600" />
                <span className="text-xs font-semibold text-purple-600 tracking-wider">Profile</span>
              </div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                Company Profile
              </h1>
            </div>
            <button
              type="button"
              onClick={() => navigate('/company-profile/edit')}
              className="group cursor-pointer relative px-6 py-2.5 bg-white border-2 border-purple-200 text-purple-700 rounded-full text-sm font-semibold hover:bg-purple-600 hover:text-white hover:border-purple-600 transition-all duration-300 shadow-sm hover:shadow-lg flex items-center gap-2"
            >
              <svg className="w-4 h-4 group-hover:rotate-12 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
              </svg>
              Edit Profile
            </button>
          </div>

          {/* ── Hero Banner with Overlap ── */}
          <div className="relative mb-16">
            <div className="w-full h-56 sm:h-64 rounded-2xl overflow-hidden shadow-lg">
              {bannerUrl ? (
                <img src={bannerUrl} alt="Company Banner" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full bg-gradient-to-r from-purple-700 via-purple-500 to-pink-500 relative overflow-hidden">
                  <div className="absolute inset-0 bg-black/20" />
                  <div className="absolute top-[50%] left-[50%] transform -translate-x-1/2 -translate-y-1/2 p-8">
                    <div className="flex items-center gap-2 text-white/90">
                      <Building2 className="w-5 h-5" />
                      <p className="text-white/80 text-sm mt-1">Grow your business with us – Upload Banner</p>
                    </div>
                  </div>
                  <div className="absolute top-0 right-0 -mt-10 -mr-10 w-40 h-40 bg-white/10 rounded-full blur-3xl" />
                  <div className="absolute bottom-0 left-0 -mb-10 -ml-10 w-40 h-40 bg-purple-300/20 rounded-full blur-2xl" />
                </div>
              )}
            </div>

            {/* Logo overlapping banner */}
            <div className="absolute -bottom-12 left-6 sm:left-8">
              <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-2xl bg-white shadow-xl border-4 border-white flex items-center justify-center overflow-hidden transition-transform hover:scale-105 duration-300">
                {logoUrl ? (
                  <img src={logoUrl} alt="Company Logo" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-purple-100 to-pink-100 flex items-center justify-center">
                    <Building2 className="w-12 h-12 text-purple-500" />
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* ── Company Info Header after overlap ── */}
          <div className="mt-12 mb-8">
            <h2 className="text-2xl font-bold text-gray-900">{displayName}</h2>
            <p className="text-gray-500 mt-1 flex items-center gap-2 flex-wrap">
              {tagline && <span>{tagline}</span>}
              {tagline && <span className="w-1 h-1 bg-gray-300 rounded-full" />}
              <span className="flex items-center gap-1">
                <CheckCircle className="w-3.5 h-3.5 text-green-500" />
                Verified Company
              </span>
            </p>
          </div>

          {/* ── Stats Row ── */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
            <StatCard label="Company Type"  value={companyType}  icon={Building2} />
            <StatCard label="Employees"     value={companySize}  icon={Users}     />
            <StatCard label="Founded"       value={foundedIn}    icon={Calendar}  />
            <StatCard label="Hires/Month"   value={hiringCount}  icon={Briefcase} />
          </div>

          {/* ── About Us Section (Card) ── */}
          {aboutText && (
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 mb-8 hover:shadow-md transition-shadow">
              <SectionHeading icon={FileText}>About Us</SectionHeading>
              <p className="text-gray-600 leading-relaxed whitespace-pre-line">{aboutText}</p>
            </div>
          )}

          {/* ── Two Column Layout for Preferences & Contact ── */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            {/* Hiring Preferences */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <SectionHeading icon={Briefcase}>Hiring Preferences</SectionHeading>
              <div className="space-y-4">
                <InfoRow label="Hiring For" value={hiringFor}  icon={Users} />
                <InfoRow label="Top Skill"  value={topSkill}   icon={Award} />
                {jobLocation?.name && (
                  <InfoRow
                    label="Job Location"
                    value={`${jobLocation.name}, ${jobLocation.stateCode}, ${jobLocation.countryCode}`}
                    icon={MapPin}
                  />
                )}
              </div>
            </div>

            {/* Contact & Website */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <SectionHeading icon={Mail}>Contact & Online</SectionHeading>
              <div className="space-y-4">
                <InfoRow label="Mobile Number" value={mobileNumber || 'N/A'} icon={Phone} href={mobileNumber ? `tel:${mobileNumber}` : undefined} />
                <InfoRow label="Email"         value={email || 'N/A'}        icon={Mail}  />
                {website && (
                  <InfoRow
                    label="Website"
                    value={website}
                    icon={Globe}
                    href={website.startsWith('http') ? website : `https://${website}`}
                  />
                )}
                {location?.name && (
                  <InfoRow
                    label="Office Location"
                    value={`${location.name}, ${location.stateCode}, ${location.countryCode}`}
                    icon={MapPin}
                  />
                )}
              </div>
            </div>
          </div>

          {/* ── Legal Information (Card) ── */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 mb-8">
            <SectionHeading icon={FileText}>Legal Information</SectionHeading>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <InfoRow label="Legal Name"            value={legalName}  />
              <InfoRow label="Registration Number"   value={regNumber}  />
              <InfoRow label="GST Number"            value={gstNumber}  />
              <InfoRow label="CIN Number"            value={cinNumber}  />
            </div>
          </div>

          {/* ── Footer ── */}
          <div className="text-center pt-8 pb-4 border-t border-gray-100">
            <p className="text-xs text-gray-400">
              © 2025 MyJob – Technokrate Hire. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </>
  );
};

export default CompanyProfile;