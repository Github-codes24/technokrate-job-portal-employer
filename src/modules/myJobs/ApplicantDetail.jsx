import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { toast } from 'react-toastify'
import {
  getApplicantDetail,
  getApplicantStatusHistory,
  clearApplicantStatusHistory,
  updateApplicantStatusAsync,
} from '../../redux/slices/companyJobs/jobSlice'
import {
  ArrowLeft, Mail, Phone, MapPin, Briefcase, GraduationCap,
  Calendar, Clock, DollarSign, User, Code2, Building2,
  CheckCircle2, AlertCircle, Loader2, Award, BookOpen,
  Download, Star, Heart, TrendingUp, Users, FileText, History, X
} from 'lucide-react'

// ─── Sub-Components ──────────────────────────────────────────
const normalizeStage = (status) =>
  String(status || '')
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '_')
    .replace(/-/g, '_')

const StatusBadge = ({ status }) => {
  const map = {
    applied: { label: 'Applied', cls: 'bg-blue-500/10 text-blue-600 border-blue-200', icon: Clock },
    interview: { label: 'Interview', cls: 'bg-sky-500/10 text-sky-600 border-sky-200', icon: Calendar },
    accepted: { label: 'Accepted', cls: 'bg-green-500/10 text-green-600 border-green-200', icon: CheckCircle2 },
    rejected: { label: 'Rejected', cls: 'bg-red-500/10 text-red-600 border-red-200', icon: AlertCircle },
  }
  const key = normalizeStage(status)
  const s = map[key] ?? {
    label: status ? String(status).charAt(0).toUpperCase() + String(status).slice(1) : 'Unknown',
    cls: 'bg-gray-500/10 text-gray-600 border-gray-200',
    icon: FileText,
  }
  const Icon = s.icon

  return (
    <span className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold border backdrop-blur-sm ${s.cls}`}>
      <Icon className="w-3 h-3" /> {s.label}
    </span>
  )
}

const InfoRow = ({ icon: Icon, label, value, highlight }) => (
  value ? (
    <div className={`flex items-start gap-3 py-3 border-b border-gray-100 last:border-0 group hover:bg-gray-50/50 transition-all duration-200 rounded-lg px-2 -mx-2 ${highlight ? 'bg-purple-50/30' : ''}`}>
      <div className="mt-0.5 p-2 bg-gradient-to-br from-purple-100 to-indigo-100 rounded-xl group-hover:scale-110 transition-transform">
        <Icon className="w-4 h-4 text-purple-600" />
      </div>
      <div className="flex-1">
        <p className="text-xs text-gray-400 uppercase tracking-wider">{label}</p>
        <p className="text-sm text-gray-800 font-semibold mt-0.5">{value}</p>
      </div>
    </div>
  ) : null
)

const Card = ({ title, icon: Icon, children, badge }) => (
  <div className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden">
    <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between bg-gradient-to-r from-gray-50 to-white">
      <div className="flex items-center gap-2">
        <div className="p-1.5 bg-purple-100 rounded-lg"><Icon className="w-4 h-4 text-purple-600" /></div>
        <h3 className="text-sm font-bold text-gray-900">{title}</h3>
      </div>
      {badge && <span className="text-xs font-semibold text-purple-600 bg-purple-50 px-2 py-1 rounded-full">{badge}</span>}
    </div>
    <div className="p-5">{children}</div>
  </div>
)

const StatsCard = ({ icon: Icon, label, value, color }) => (
  <div className="bg-white rounded-2xl border border-gray-100 p-4 text-center shadow-sm hover:shadow-md transition-all">
    <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center mx-auto mb-2`}><Icon className="w-5 h-5 text-white" /></div>
    <p className="text-xl font-bold text-gray-900">{value || 'N/A'}</p>
    <p className="text-xs text-gray-500">{label}</p>
  </div>
)

const fmtDate = (iso) => iso ? new Date(iso).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : null

// ─── Main Component ──────────────────────────────────────────
const ApplicantDetail = () => {
  const { jobseekerId } = useParams()
  const navigate = useNavigate()
  const dispatch = useDispatch()

  const {
    applicantDetail,
    applicantDetailLoading,
    applicantStatusLoading,
    applicantStatusHistory,
    applicantStatusHistoryLoading,
    error,
  } = useSelector(s => s.job)

  const [statusModal, setStatusModal] = useState({ open: false, stage: null, note: '' })

  useEffect(() => {
    if (jobseekerId) dispatch(getApplicantDetail(jobseekerId))
  }, [dispatch, jobseekerId])

  // Extract application id and fetch status history
  const app = applicantDetail?.data || applicantDetail;
  const applicationId = app?._id || app?.applicationId || app?.id

  useEffect(() => {
    if (applicationId) {
      dispatch(getApplicantStatusHistory(applicationId))
    }
    return () => {
      dispatch(clearApplicantStatusHistory())
    }
  }, [dispatch, applicationId])

  // 1. Loading State
  if (applicantDetailLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex justify-center items-center">
        <div className="text-center">
          <Loader2 className="animate-spin w-10 h-10 text-purple-600 mx-auto mb-3" />
          <p className="text-gray-500 text-sm font-medium">Fetching applicant profile...</p>
        </div>
      </div>
    )
  }

  // 2. Data Extraction (Safe Check)
  const seeker = app?.jobseekerId;

  // 3. Error / Empty State Check
  if (!app || !seeker) {
    return (
      <div className="min-h-screen bg-gray-50 flex justify-center items-center p-6">
        <div className="text-center bg-white p-8 rounded-2xl shadow-sm border border-gray-100 max-w-sm">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-gray-900 font-bold text-lg">Profile Not Found</h3>
          <p className="text-gray-500 text-sm mt-2">{error || "The applicant details could not be retrieved at this time."}</p>
          <button onClick={() => navigate(-1)} className="mt-6 w-full py-2 bg-purple-600 text-white rounded-xl text-sm font-semibold hover:bg-purple-700 transition">
            Go Back
          </button>
        </div>
      </div>
    )
  }

  // 4. Mapping fields from your specific JSON
  const loc = seeker.basicDetails?.location;
  const displayLocation = loc ? `${loc.city}, ${loc.state}` : "Not Specified";
  const experienceLabel = app.experience || (seeker.workExperience?.isFresher ? "Fresher" : "Experienced");
  const workHistory = seeker.workExperience?.experiences?.[0] || {};
  const edu = seeker.educationDetails?.[0] || {};

  const resumeUrl = app?.resume || seeker?.resume;
  
  const handleDownloadResume = async () => {
    const url = resumeUrl
    if (!url) {
      alert('No resume available to download')
      return
    }

    try {
      const resp = await fetch(url)
      if (!resp.ok) throw new Error('Network response not ok')
      const blob = await resp.blob()
      const contentType = resp.headers.get('content-type') || ''
      const ext = contentType.includes('pdf') ? 'pdf' : contentType.includes('word') || contentType.includes('msword') ? 'doc' : url.split('.').pop().split('?')[0] || 'pdf'
      const filenameBase = (seeker.fullName || 'resume').replace(/[^a-z0-9\-\_ ]+/ig, '') || 'resume'
      const filename = `${filenameBase}-resume.${ext}`

      const objectUrl = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = objectUrl
      link.download = filename
      document.body.appendChild(link)
      link.click()
      link.remove()
      window.URL.revokeObjectURL(objectUrl)
    } catch (err) {
      // fallback: open in new tab
      try { window.open(url, '_blank', 'noopener,noreferrer') } catch (e) { alert('Unable to download or open resume') }
    }
  }

  // Allowed values per backend API: "applied", "interview", "accepted", "rejected"
  const STAGES = [
    { value: 'applied', label: 'Applied', cls: 'bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100' },
    { value: 'interview', label: 'Interview', cls: 'bg-sky-50 text-sky-700 border-sky-200 hover:bg-sky-100' },
    { value: 'accepted', label: 'Accepted', cls: 'bg-green-50 text-green-700 border-green-200 hover:bg-green-100' },
    { value: 'rejected', label: 'Rejected', cls: 'bg-red-50 text-red-700 border-red-200 hover:bg-red-100' },
  ]

  const openStatusPrompt = (stageValue) => {
    setStatusModal({ open: true, stage: stageValue, note: '' })
  }

  const handleConfirmStatusChange = async (e) => {
    e?.preventDefault?.()
    const id = applicationId
    if (!id) {
      toast.error('Application ID not found')
      return
    }
    const { stage, note } = statusModal
    if (note.length > 500) {
      toast.error('Note cannot exceed 500 characters')
      return
    }

    const res = await dispatch(updateApplicantStatusAsync({ applicantId: id, status: stage, note }))
    if (updateApplicantStatusAsync.fulfilled.match(res)) {
      toast.success(res.payload?.message || `Status updated to ${stage}`)
      setStatusModal({ open: false, stage: null, note: '' })
      dispatch(getApplicantStatusHistory(id))
    } else {
      toast.error(res.payload || 'Failed to update applicant status')
    }
  }

  const currentStage = normalizeStage(app.status)

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-indigo-50/30 pb-12">
      <div className="max-w-7xl mx-auto px-6 py-4 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-2">
          <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-gray-600 hover:text-purple-600 transition-all group">
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            <span className="text-sm font-medium">Back</span>
          </button>
          <StatusBadge status={app.status} />
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-semibold text-gray-500 mr-1">Update Status:</span>
          {STAGES.map((stage) => {
            const isActive = currentStage === stage.value
            return (
              <button
                key={stage.value}
                type="button"
                disabled={applicantStatusLoading}
                onClick={() => openStatusPrompt(stage.value)}
                className={`rounded-full border px-4 py-2 text-xs font-semibold transition flex items-center gap-1.5 ${stage.cls} ${isActive ? 'ring-2 ring-purple-600 font-bold shadow-sm' : ''} ${applicantStatusLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                {isActive && <CheckCircle2 className="w-3.5 h-3.5" />}
                {stage.label}
              </button>
            )
          })}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 space-y-6">
        {/* Hero */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <div className="flex flex-col md:flex-row gap-6 items-center">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-purple-600 to-indigo-600 flex items-center justify-center text-white text-2xl font-bold shadow-lg">
              {seeker.fullName?.charAt(0) || "?"}
            </div>
            <div className="flex-1 text-center md:text-left">
              <h2 className="text-2xl font-bold text-gray-900">{seeker.fullName}</h2>
              <div className="flex flex-wrap justify-center md:justify-start gap-4 text-sm mt-2 text-gray-600">
                <span className="flex items-center gap-1"><Mail className="w-4 h-4" /> {seeker.email}</span>
                <span className="flex items-center gap-1"><Phone className="w-4 h-4" /> {seeker.mobileNumber}</span>
                <span className="flex items-center gap-1"><MapPin className="w-4 h-4" /> {displayLocation}</span>
              </div>
            </div>
            <div className="flex gap-2">
              <button onClick={handleDownloadResume} className="p-3 bg-gray-100 hover:bg-purple-100 rounded-xl transition text-purple-600">
                <Download className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatsCard icon={Award} label="Experience" value={experienceLabel} color="from-purple-500 to-indigo-500" />
          <StatsCard icon={DollarSign} label="Current CTC" value={app.currentCTC ? `${app.currentCTC} LPA` : 'N/A'} color="from-green-500 to-emerald-500" />
          <StatsCard icon={TrendingUp} label="Expected CTC" value={app.expectedCTC ? `${app.expectedCTC} LPA` : 'N/A'} color="from-blue-500 to-cyan-500" />
          <StatsCard icon={Clock} label="Notice Period" value={app.noticePeriod} color="from-orange-500 to-red-500" />
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          <div className="space-y-6">
            <Card title="Work Experience" icon={Briefcase}>
              {workHistory.jobTitle ? (
                <>
                  <InfoRow icon={Briefcase} label="Current/Last Role" value={workHistory.jobTitle} highlight />
                  <InfoRow icon={Building2} label="Company" value={workHistory.companyName} />
                  <InfoRow icon={Calendar} label="Duration" value={`${fmtDate(workHistory.startDate)} - ${workHistory.currentlyWorking ? 'Present' : fmtDate(workHistory.endDate)}`} />
                  <div className="mt-4 p-3 bg-gray-50 rounded-xl text-xs text-gray-600 leading-relaxed italic">
                    "{workHistory.responsibilities}"
                  </div>
                </>
              ) : <p className="text-gray-400 text-sm italic text-center py-4">No specific work history details provided.</p>}
            </Card>

            <Card title="Personal Details" icon={User}>
              <InfoRow icon={User} label="Gender" value={seeker.basicDetails?.gender} />
              <InfoRow icon={Calendar} label="Date of Birth" value={fmtDate(seeker.basicDetails?.dateOfBirth)} />
            </Card>
          </div>

          <div className="space-y-6">
            <Card title="Education" icon={GraduationCap}>
              {edu.highestDegree ? (
                <>
                  <InfoRow icon={BookOpen} label="Highest Degree" value={edu.highestDegree} highlight />
                  <InfoRow icon={Building2} label="Institution" value={edu.institutionName} />
                  <InfoRow icon={Calendar} label="Passing Year" value={edu.yearOfGraduation} />
                </>
              ) : <p className="text-gray-400 text-sm italic text-center py-4">No education details added.</p>}
            </Card>

            <Card title="Skills" icon={Code2}>
              <div className="flex flex-wrap gap-2">
                {seeker.skillsAndPreference?.skills?.length > 0 ? (
                  seeker.skillsAndPreference.skills.map((s, i) => (
                    <span key={i} className="px-3 py-1 bg-purple-50 text-purple-700 border border-purple-100 rounded-lg text-xs font-medium">
                      {s}
                    </span>
                  ))
                ) : <p className="text-gray-400 text-sm italic">No skills listed.</p>}
              </div>
            </Card>

            {/* Application Status History Timeline */}
            <Card title="Status History" icon={History} badge={applicantStatusHistory?.length ? `${applicantStatusHistory.length} logs` : null}>
              {applicantStatusHistoryLoading ? (
                <div className="flex items-center justify-center py-6 text-gray-500 gap-2 text-xs">
                  <Loader2 className="w-4 h-4 animate-spin text-purple-600" />
                  Loading history...
                </div>
              ) : applicantStatusHistory?.length > 0 ? (
                <div className="relative pl-6 space-y-4 before:content-[''] before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-purple-100">
                  {applicantStatusHistory.map((item, idx) => (
                    <div key={item._id || idx} className="relative group">
                      <div className="absolute -left-6 top-1 w-2.5 h-2.5 rounded-full bg-purple-600 ring-4 ring-purple-100 group-hover:scale-125 transition-transform" />
                      <div className="flex items-center justify-between gap-2 flex-wrap">
                        <StatusBadge status={item.status} />
                        <span className="text-[11px] text-gray-400 font-medium">
                          {fmtDate(item.createdAt || item.date || item.updatedAt) || 'Recent'}
                        </span>
                      </div>
                      {item.note && (
                        <p className="mt-1.5 text-xs text-gray-600 bg-gray-50 p-2.5 rounded-lg border border-gray-100 italic">
                          "{item.note}"
                        </p>
                      )}
                      {item.updatedBy && (
                        <p className="mt-1 text-[11px] text-gray-400">
                          By: {item.updatedBy?.name || item.updatedBy?.email || 'Employer'}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-400 text-xs italic text-center py-4">No status change history recorded yet.</p>
              )}
            </Card>
          </div>
        </div>
      </div>

      {/* Note and Status Change Modal */}
      {statusModal.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-gray-100 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gradient-to-r from-gray-50 to-white">
              <h3 className="text-base font-bold text-gray-900">
                Change Status to <span className="text-purple-600 capitalize">{statusModal.stage}</span>
              </h3>
              <button
                type="button"
                onClick={() => setStatusModal({ open: false, stage: null, note: '' })}
                className="text-gray-400 hover:text-gray-600 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleConfirmStatusChange} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                  Add Note <span className="text-gray-400 font-normal">(optional, max 500 characters)</span>
                </label>
                <textarea
                  rows={3}
                  maxLength={500}
                  value={statusModal.note}
                  onChange={(e) => setStatusModal(prev => ({ ...prev, note: e.target.value }))}
                  placeholder="e.g. Scheduled technical round for Monday 11:00 AM..."
                  className="w-full text-xs p-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-transparent transition"
                />
                <div className="text-right text-[11px] text-gray-400 mt-1">
                  {statusModal.note.length}/500
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setStatusModal({ open: false, stage: null, note: '' })}
                  className="px-4 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-100 rounded-xl transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={applicantStatusLoading}
                  className="px-5 py-2 text-xs font-semibold bg-purple-600 hover:bg-purple-700 text-white rounded-xl shadow-sm transition disabled:opacity-50 flex items-center gap-1.5"
                >
                  {applicantStatusLoading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  Confirm Update
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default ApplicantDetail;