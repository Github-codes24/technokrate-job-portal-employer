import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import {
  ArrowLeft, Mail, Phone, MapPin, Briefcase,
  GraduationCap, DollarSign, Lock, ShieldCheck,
  Calendar, User, Layers, Award, Loader2, ChevronRight,
  Banknote, Star, BadgeCheck, Unlock, Sparkles
} from 'lucide-react'
import { getCandidateById, clearSelectedCandidate, updateCandidateStatus } from '../../../redux/slices/database/databaseSlice'
import { unlockCandidateProfile, fetchRemainingCredits } from '../../../redux/slices/candidateUnlock/creditDeductionSlice'
import ConfirmModal from '../../../components/common/ConfirmModal'
import BuyCreditsModal from '../../../components/common/BuyCreditsModal'
import { toast, ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'

const CandidateDetail = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const dispatch = useDispatch()

  const { selectedCandidate, loading, error } = useSelector((state) => state.database);
  const { remainingCredits } = useSelector((state) => state.creditDeduction);
  const candidate = selectedCandidate;

  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [isActionLoading, setIsActionLoading] = useState(false);
  const [isBuyCreditsOpen, setIsBuyCreditsOpen] = useState(false);

  useEffect(() => {
    dispatch(getCandidateById(id));
    dispatch(fetchRemainingCredits());
    return () => dispatch(clearSelectedCandidate()); // Clear when leaving the page
  }, [id, dispatch]);

  const handleUnlockConfirm = async () => {
    setIsActionLoading(true);
    try {
      if (remainingCredits < 1) {
        toast.warn('Insufficient credits. Please buy credits to unlock.');
        setIsBuyCreditsOpen(true);
        setIsConfirmOpen(false);
        return;
      }
      const result = await dispatch(unlockCandidateProfile(id)).unwrap();
      dispatch(updateCandidateStatus({ id, isLocked: false, ...(result.candidate || {}) }));
      await dispatch(getCandidateById(id));
      toast.success(`🎉 ${candidate.name} unlocked successfully! Balance: ${result.remainingCredits} credit(s).`);
    } catch (err) {
      toast.error(typeof err === 'string' ? err : 'Failed to unlock profile.');
    } finally {
      setIsActionLoading(false);
      setIsConfirmOpen(false);
    }
  };

  if (loading || !candidate) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] bg-gray-50">
        <Loader2 className="w-10 h-10 text-purple-600 animate-spin mb-4" />
        <p className="text-gray-500 font-medium">Fetching candidate details...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-8 text-center bg-gray-50 min-h-screen">
        <div className="bg-red-50 text-red-600 p-4 rounded-xl inline-block border border-red-100">
          {error}
        </div>
        <button
          onClick={() => navigate(-1)}
          className="block mx-auto mt-4 text-purple-600 font-bold hover:underline"
        >
          Go Back
        </button>
      </div>
    )
  }

  const isLocked = candidate.isLocked

  return (
    <div className="min-h-screen bg-white font-sans p-4">
      <ToastContainer position="top-right" theme="colored" autoClose={3000} />

      <ConfirmModal
        isOpen={isConfirmOpen}
        title="Unlock Candidate Profile"
        message={`Unlock ${candidate.name}'s profile? Costs 1 credit. Current balance: ${remainingCredits} credits.`}
        confirmLabel={isActionLoading ? "Unlocking..." : "Unlock Profile (1 Credit)"}
        isLoading={isActionLoading}
        onConfirm={handleUnlockConfirm}
        onCancel={() => !isActionLoading && setIsConfirmOpen(false)}
      />

      {/* ── Hero Banner (matches the purple gradient header in the reference) ── */}
      <div
        className="relative overflow-hidden px-6 pt-6 pb-10  rounded-2xl mb-8"
        style={{
          background: 'linear-gradient(135deg, #7c3aed 0%, #a855f7 50%, #ec4899 100%)',
        }}
      >
        {/* Decorative circles */}
        <div className="absolute -top-10 -right-10 w-48 h-48 rounded-full bg-white/10" />
        <div className="absolute top-4 right-20 w-24 h-24 rounded-full bg-white/10" />
        <div className="absolute -bottom-6 left-1/3 w-32 h-32 rounded-full bg-white/10" />

        {/* Breadcrumb */}
        <nav className="relative flex items-center gap-1.5 text-purple-200 text-sm mb-4">
          <button
            onClick={() => navigate(-1)}
            className="hover:text-white transition-colors flex items-center gap-1"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Database
          </button>
          <ChevronRight className="w-3.5 h-3.5" />
          <span className="text-white font-medium">Candidate Profile</span>
        </nav>

        {/* Candidate name + tag */}
        <div className="relative flex flex-col sm:flex-row sm:items-center gap-3">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white leading-tight">
              {candidate.name}
            </h1>
            <p className="text-purple-200 text-sm mt-1">
              {candidate.designation?.name || 'N/A'} &nbsp;·&nbsp; {typeof candidate.location === 'string' ? candidate.location : `${candidate.location?.city || ''}, ${candidate.location?.state || ''}`.trim() || 'India'}
            </p>
          </div>
          {isLocked && (
            <div className="sm:ml-auto flex items-center gap-2 flex-wrap">
              <span className="flex items-center gap-1.5 bg-white/20 backdrop-blur-sm text-white text-xs font-bold px-3 py-1.5 rounded-full border border-white/30">
                <Lock className="w-3.5 h-3.5" /> Profile Locked
              </span>
              <button
                type="button"
                onClick={() => setIsConfirmOpen(true)}
                className="flex items-center gap-1.5 bg-white hover:bg-purple-50 text-purple-700 font-extrabold text-xs px-4 py-1.5 rounded-full transition shadow-md cursor-pointer active:scale-95"
              >
                <Unlock className="w-3.5 h-3.5" /> Unlock Profile (1 Credit)
              </button>
            </div>
          )}
          {!isLocked && (
            <span className="sm:ml-auto flex items-center gap-1.5 bg-green-400/20 backdrop-blur-sm text-green-100 text-xs font-bold px-4 py-1.5 rounded-full border border-green-300/30">
              <BadgeCheck className="w-3.5 h-3.5" /> Unlocked
            </span>
          )}
        </div>
      </div>

      {/* ── Content Area ── */}
      <div className="max-w-9xl mx-auto  -mt-4 pb-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

          {/* ══ LEFT COLUMN ══ */}
          <div className="lg:col-span-1 space-y-4">

            {/* Avatar + basic info card */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex flex-col items-center text-center">
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-purple-600 to-purple-400 flex items-center justify-center text-white text-3xl font-black shadow-lg shadow-purple-100 mb-3">
                {candidate.name?.charAt(0)}
              </div>
              <h2 className="text-lg font-extrabold text-gray-900">{candidate.name}</h2>
              <p className="text-sm text-gray-500 mt-0.5">{candidate.designation?.name || 'N/A'}</p>
              <div className="flex items-center gap-1.5 mt-2 text-xs text-gray-400">
                <MapPin className="w-3.5 h-3.5 text-purple-400" />
                {typeof candidate?.location === 'string' ? candidate.location : `${candidate.location?.city  || 'N/A'} ${candidate.location?.state || ''}`.trim() || 'India'}
              </div>
              <div className="mt-3 flex items-center gap-1.5 bg-green-50 text-green-700 text-xs font-bold px-3 py-1 rounded-full">
                <ShieldCheck className="w-3 h-3" /> Verified Candidate
              </div>
            </div>

            {/* Contact Details card */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
              <h3 className="text-sm font-bold text-gray-800 mb-4  ">Contact Details</h3>
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-purple-50 flex items-center justify-center text-purple-500 flex-shrink-0">
                    <Mail className="w-4 h-4" />
                  </div>
                  <div className={isLocked ? 'blur-sm select-none pointer-events-none' : ''}>
                    <p className="text-xs text-gray-400 font-semibold">Email</p>
                    <p className="text-sm font-bold text-gray-700">{candidate.mailId || 'N/A'}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-purple-50 flex items-center justify-center text-purple-500 flex-shrink-0">
                    <Phone className="w-4 h-4" />
                  </div>
                  <div className={isLocked ? 'blur-sm select-none pointer-events-none' : ''}>
                    <p className="text-xs text-gray-400 font-semibold">Phone</p>
                    <p className="text-sm font-bold text-gray-700">{candidate.mobileNo || 'N/A'}</p>
                  </div>
                </div>
              </div>
              {isLocked && (
                <button
                  type="button"
                  onClick={() => setIsConfirmOpen(true)}
                  className="w-full mt-4 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white py-2.5 rounded-xl font-bold text-xs shadow-md shadow-purple-200 transition-all flex items-center justify-center gap-1.5 cursor-pointer active:scale-95"
                >
                  <Unlock className="w-3.5 h-3.5" /> Unlock Contact Info (1 Credit)
                </button>
              )}
            </div>

            {/* Quick Stats card — styled like the "Database Credits" sidebar card in the reference */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
              <h3 className="text-sm font-bold text-gray-800 mb-4  ">Quick Stats</h3>
              <div className="space-y-3">
                {[
                  { label: 'Experience', value: candidate.experience || 'Fresher', icon: <Briefcase className="w-4 h-4" /> },
                  { label: 'Current CTC', value: candidate.currentCTC ? `₹${candidate.currentCTC}` : 'N/A', icon: <Banknote className="w-4 h-4" /> },
                  { label: 'Expected CTC', value: candidate.expectedCTC ? `₹${candidate.expectedCTC}` : 'Not Disclosed', icon: <DollarSign className="w-4 h-4" /> },
                  { label: 'Education', value: candidate.education || 'N/A', icon: <GraduationCap className="w-4 h-4" /> },
                ].map((stat, i) => (
                  <div key={i} className="flex items-center gap-3 py-2.5 border-b border-gray-50 last:border-0">
                    <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-500 flex items-center justify-center flex-shrink-0">
                      {stat.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-gray-400 font-semibold">{stat.label}</p>
                      <p className="text-sm font-bold text-gray-800 truncate">{stat.value}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* ══ RIGHT COLUMN ══ */}
          <div className="lg:col-span-2 space-y-4">

            {/* Professional Summary card */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              {/* Card header — mirrors section headers in the reference */}
              <div className="flex items-center gap-2 mb-6 pb-4 border-b border-gray-50">
                <div className="w-8 h-8 rounded-lg bg-purple-100 text-purple-600 flex items-center justify-center">
                  <Award className="w-4 h-4" />
                </div>
                <h3 className="text-base font-extrabold text-gray-800">Professional Summary</h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-6">
                {[
                  { label: 'Category', value: candidate.category?.name, icon: <Layers className="w-4 h-4" /> },
                  { label: 'Sub Category', value: candidate.subCategory?.name, icon: <Layers className="w-4 h-4" /> },
                  { label: 'Designation', value: candidate.designation?.name, icon: <User className="w-4 h-4" /> },
                  { label: 'Education', value: candidate.education, icon: <GraduationCap className="w-4 h-4" /> },
                  { label: 'Current CTC', value: candidate.currentCTC ? `₹${candidate.currentCTC}` : null, icon: <Banknote className="w-4 h-4" /> },
                  { label: 'Expected CTC', value: candidate.expectedCTC ? `₹${candidate.expectedCTC}` : null, icon: <DollarSign className="w-4 h-4" /> },
                ].map((item, i) => (
                  <div key={i}>
                    <div className="flex items-center gap-1.5 text-gray-400 mb-1">
                      {item.icon}
                      <span className="text-xs font-bold  ">{item.label}</span>
                    </div>
                    <p className="font-bold text-gray-800">{item.value || 'N/A'}</p>
                  </div>
                ))}
              </div>

              {/* Skills section — uses chip style matching the education chips in reference */}
              <div className="mt-6 pt-6 border-t border-gray-50">
                <div className="flex items-center gap-2 mb-3">
                  <Star className="w-4 h-4 text-purple-500" />
                  <span className="text-xs font-bold   text-gray-500">Key Skills</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {candidate.skills && candidate.skills.trim() !== '' ? (
                    candidate.skills.split(',').map((skill, index) => (
                      <span
                        key={index}
                        className="bg-purple-50 text-purple-700 border border-purple-100 px-3.5 py-1.5 rounded-full text-sm font-semibold"
                      >
                        {skill.trim()}
                      </span>
                    ))
                  ) : (
                    <span className="text-gray-400 text-sm italic">No skills listed</span>
                  )}
                </div>
              </div>
            </div>

            {/* About Candidate card */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <div className="flex items-center gap-2 mb-4 pb-4 border-b border-gray-50">
                <div className="w-8 h-8 rounded-lg bg-purple-100 text-purple-600 flex items-center justify-center">
                  <User className="w-4 h-4" />
                </div>
                <h3 className="text-base font-extrabold text-gray-800">About Candidate</h3>
              </div>
              <p className="text-gray-500 leading-relaxed text-sm">
                This candidate is specialized in{' '}
                <span className="font-semibold text-gray-700">{candidate.subCategory?.name || 'N/A'}</span>{' '}
                under the{' '}
                <span className="font-semibold text-gray-700">{candidate.category?.name || 'N/A'}</span>{' '}
                category. They have expressed proficiency in{' '}
                <span className="font-semibold text-gray-700">{candidate.designation?.name || 'N/A'}</span>{' '}
                roles.{' '}
                {isLocked
                  ? "Unlock the full profile to view the candidate's detailed resume and full experience history."
                  : 'You now have full access to this candidate\'s information.'}
              </p>

              {isLocked && (
                <div className="mt-5 p-4 bg-amber-50 rounded-xl border border-amber-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <Lock className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-bold text-amber-800">Profile is locked</p>
                      <p className="text-xs text-amber-600 mt-0.5">Unlock this profile to view full contact details and resume. Uses 1 credit.</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsConfirmOpen(true)}
                    className="self-start sm:self-auto flex items-center gap-1.5 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold px-4 py-2 rounded-xl transition shadow-sm cursor-pointer active:scale-95"
                  >
                    <Unlock className="w-3.5 h-3.5" /> Unlock Profile
                  </button>
                </div>
              )}
            </div>

          </div>
        </div>
      </div>

      <BuyCreditsModal
        isOpen={isBuyCreditsOpen}
        onClose={() => setIsBuyCreditsOpen(false)}
      />
    </div>
  )
}

export default CandidateDetail