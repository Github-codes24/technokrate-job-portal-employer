import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate, useParams } from 'react-router-dom'
import { toast } from 'react-toastify'
import {
  ArrowLeft, Download, Phone, Mail, MapPin,
  Briefcase, GraduationCap, ChevronDown, ChevronUp,
  ChevronLeft, ChevronRight, Users, Clock, Search, Filter,
} from 'lucide-react'
import {
  getApplicants,
  clearApplicants,
  updateApplicantStatusAsync,
} from '../../redux/slices/companyJobs/jobSlice'

const downloadCSV = (filename, rows) => {
  const csv = rows.map(row =>
    row.map(value => `"${String(value ?? '').replace(/"/g, '""')}"`).join(',')
  ).join('\n')

  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)

  const link = document.createElement('a')
  link.href = url
  link.download = filename
  link.click()

  URL.revokeObjectURL(url)
}

// ─── Safe string helper ───────────────────────────────────────────────────────
const str = (val) => {
  if (val === null || val === undefined) return 'N/A'
  if (typeof val === 'object') return Object.values(val).filter(Boolean).join(', ') || 'N/A'
  return String(val) || 'N/A'
}

const FILTER_SECTIONS = [
  'Must-Have Keywords', 'Current City / Area', 'Exclude Keywords',
  'Experience', 'Industries', 'Gender', 'Age', 'Language', 'Skills', 'Documents',
]

const AVATAR_COLORS = [
  { bg: 'bg-amber-200', text: 'text-amber-800' },
  { bg: 'bg-green-200', text: 'text-green-700' },
  { bg: 'bg-purple-200', text: 'text-purple-700' },
  { bg: 'bg-blue-200', text: 'text-blue-700' },
  { bg: 'bg-pink-200', text: 'text-pink-700' },
]

// ─── Candidate Card ───────────────────────────────────────────────────────────
const CandidateCard = ({ applicant, idx, selected, onSelect }) => {
  const dispatch = useDispatch()
  const [updatingStatus, setUpdatingStatus] = useState(false)
  const details = applicant.jobseekerDetails?.[0] ?? {}
  const edu = details.education ?? {}
  const jobTitle = details.jobTitle ?? {}
  const color = AVATAR_COLORS[idx % AVATAR_COLORS.length]
  const initial = (details.fullName || 'A').charAt(0).toUpperCase()
  const navigate = useNavigate()

  const locationStr = (() => {
    const loc = details.location
    if (!loc) return 'N/A'
    if (typeof loc === 'object') {
      return [loc.city, loc.state].filter(Boolean).join(', ') || 'N/A'
    }
    return String(loc)
  })()

  const handleDownload = () => {
    if (applicant?.resume) {
      window.open(applicant.resume, '_blank', 'noopener,noreferrer')
    } else {
      toast.info('No resume available for this applicant')
    }
  }

  const handleStatusChange = async (e) => {
    const newStatus = e.target.value
    if (!newStatus || newStatus === applicant.status || updatingStatus) return
    setUpdatingStatus(true)
    try {
      const res = await dispatch(updateApplicantStatusAsync({ applicantId: applicant._id, status: newStatus }))
      if (updateApplicantStatusAsync.fulfilled.match(res)) {
        toast.success(res.payload?.message || `Status updated to ${newStatus}`)
      } else {
        toast.error(res.payload || 'Failed to update status')
      }
    } catch (err) {
      toast.error('Failed to update status')
    } finally {
      setUpdatingStatus(false)
    }
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 sm:p-5 mb-3">
      <div className="flex flex-col sm:flex-row items-start gap-4">
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <button onClick={onSelect} className="flex-shrink-0">
            <div className={`w-4 h-4 rounded border-2 flex items-center justify-center transition
              ${selected ? 'bg-purple-600 border-purple-600' : 'border-gray-300'}`}>
              {selected && (
                <svg className="w-2.5 h-2.5 text-white" viewBox="0 0 12 12" fill="none">
                  <path d="M2 6l3 3 5-5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              )}
            </div>
          </button>

          <div className={`w-11 h-11 rounded-full ${color.bg} ${color.text} flex items-center justify-center text-lg font-bold flex-shrink-0`}>
            {initial}
          </div>

          <div className="sm:hidden flex-1 min-w-0">
            <span className="font-bold text-sm text-gray-800 block truncate">
              {str(details.fullName) === 'N/A' ? 'Unknown' : str(details.fullName)}
            </span>
          </div>

          <div className="sm:hidden ml-auto">
            <button
              onClick={handleDownload}
              title="Download Resume"
              className="p-2 bg-green-500 hover:bg-green-600 text-white rounded-lg transition"
            >
              <Download className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="flex-1 min-w-0 w-full">
          <div className="flex items-center gap-3 mb-1 flex-wrap">
            <span className="hidden sm:inline font-bold text-sm text-gray-800">
              {str(details.fullName) === 'N/A' ? 'Unknown' : str(details.fullName)}
            </span>

            {/* Quick Status Updater */}
            <div className="relative inline-flex items-center">
              <select
                value={applicant.status || 'applied'}
                onChange={handleStatusChange}
                disabled={updatingStatus}
                title="Change applicant status"
                className={`text-[11px] font-semibold pl-2.5 pr-6 py-0.5 rounded-full capitalize appearance-none cursor-pointer border transition focus:outline-none focus:ring-1 focus:ring-purple-400
                  ${applicant.status === 'applied' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                    applicant.status === 'interview' ? 'bg-sky-50 text-sky-700 border-sky-200' :
                    applicant.status === 'accepted' ? 'bg-green-50 text-green-700 border-green-200' :
                    applicant.status === 'rejected' ? 'bg-red-50 text-red-600 border-red-200' :
                        'bg-gray-100 text-gray-700 border-gray-200'}`}
              >
                <option value="applied">Applied</option>
                <option value="interview">Interview</option>
                <option value="accepted">Accepted</option>
                <option value="rejected">Rejected</option>
              </select>
              <ChevronDown className="w-3 h-3 absolute right-1.5 pointer-events-none text-gray-400" />
            </div>

            <button
              onClick={() => navigate(`/my-job/applicant-detail/${applicant.jobseekerId?._id ?? applicant.jobseekerId}`)}
              className="text-xs font-semibold text-purple-600 hover:underline whitespace-nowrap ml-auto"
            >
              View Full profile for free »
            </button>
          </div>

          <div className="flex items-center gap-3 sm:gap-4 text-xs text-gray-400 mb-3 flex-wrap">
            <span className="flex items-center gap-1">
              <Briefcase className="w-3 h-3" strokeWidth={1.6} />
              {str(applicant.experience)}
            </span>
            <span className="flex items-center gap-1">
              <span className="font-medium">₹</span>
              {str(applicant.currentCTC)}
            </span>
            <span className="flex items-center gap-1">
              <MapPin className="w-3 h-3" strokeWidth={1.6} />
              {locationStr}
            </span>
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3" strokeWidth={1.6} />
              Notice: {str(applicant.noticePeriod)}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1.5 text-xs mb-4">
            {[
              [Briefcase, 'Current Role', str(jobTitle.jobTitle)],
              [Briefcase, 'Company', str(jobTitle.companyName)],
              [GraduationCap, 'Education', str(edu.highestDegree)],
              [GraduationCap, 'Institution', str(edu.institutionName)],
              [Users, 'Skills', Array.isArray(details.skills) && details.skills.length ? details.skills.join(', ') : 'N/A'],
              [Mail, 'Email', str(details.email)],
            ].map(([Icon, label, value]) => (
              <div key={label} className="flex items-start gap-2">
                <Icon className="w-3.5 h-3.5 text-gray-400 mt-0.5 flex-shrink-0" strokeWidth={1.6} />
                <span className="text-gray-400 w-20 flex-shrink-0">{label}</span>
                <span className="text-gray-700 truncate">{value}</span>
              </div>
            ))}
          </div>

          <div className="flex flex-wrap gap-2.5 sm:gap-3">
            <button className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white text-xs font-semibold px-3 sm:px-4 py-2 rounded-lg transition">
              <Phone className="w-3.5 h-3.5" strokeWidth={2} />
              {str(details.mobileNumber) === 'N/A' ? 'View Phone' : str(details.mobileNumber)}
            </button>
            <button className="flex items-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-semibold px-3 sm:px-4 py-2 rounded-lg transition">
              <Mail className="w-3.5 h-3.5" strokeWidth={2} />
              {str(details.email) === 'N/A' ? 'View Email' : 'Email Applicant'}
            </button>
          </div>
        </div>

        <div className="hidden sm:flex flex-col items-end gap-3 flex-shrink-0">
          <button
            onClick={handleDownload}
            className="flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white text-xs font-semibold px-4 py-2 rounded-xl transition shadow-sm whitespace-nowrap"
          >
            <Download className="w-3.5 h-3.5" strokeWidth={2} /> Download Resume
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Filter Panel ─────────────────────────────────────────────────────────────
const FilterPanel = ({ filters, setFilters, onApply }) => {
  const [hideChecks, setHideChecks] = useState([false, false])
  const [haveCv, setHaveCv] = useState(false)
  const [filterOpen, setFilterOpen] = useState({})
  const [showMore, setShowMore] = useState(false)
  const [localFilters, setLocalFilters] = useState(filters || {})

  useEffect(() => setLocalFilters(filters || {}), [filters])

  const toggle = (key) => setFilterOpen(f => ({ ...f, [key]: !f[key] }))

  const apply = () => {
    const keyMap = {
      'Must-Have Keywords': 'keywords',
      'Current City / Area': 'location',
      'Exclude Keywords': 'exclude',
      'Experience': 'experience',
      'Industries': 'industries',
      'Gender': 'gender',
      'Age': 'age',
      'Language': 'language',
      'Skills': 'skills',
      'Documents': 'documents',
    }

    const merged = {}
    Object.keys(localFilters || {}).forEach(k => {
      const mapped = keyMap[k] || k
      merged[mapped] = localFilters[k]
    })
    if (haveCv) merged.haveCv = true
    if (hideChecks[0]) merged.alreadyUnlocked = true
    if (hideChecks[1]) merged.alreadyLocked = true
    setFilters(merged)
    if (onApply) onApply(merged)
  }

  return (
    <div className="w-full lg:w-64 flex-shrink-0 bg-white rounded-2xl border border-gray-100 shadow-sm p-4 self-start sticky top-4">
      <div className="pb-3">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-semibold text-gray-700">Hide Candidates</span>
          <ChevronUp className="w-4 h-4 text-gray-400" />
        </div>
        {['Already Unlocked', 'Already locked'].map((label, i) => (
          <label key={i} className="flex items-center gap-2.5 py-1.5 cursor-pointer">
            <button
              onClick={() => setHideChecks(h => h.map((v, idx) => idx === i ? !v : v))}
              className={`w-4 h-4 rounded border-2 flex items-center justify-center transition flex-shrink-0
                ${hideChecks[i] ? 'bg-purple-600 border-purple-600' : 'border-gray-300'}`}
            >
              {hideChecks[i] && (
                <svg className="w-2.5 h-2.5 text-white" viewBox="0 0 12 12" fill="none">
                  <path d="M2 6l3 3 5-5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              )}
            </button>
            <span className="text-sm text-gray-600">{label}</span>
          </label>
        ))}
      </div>

      <div className="border-t border-gray-100 pt-3 pb-3">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-semibold text-gray-700">Show only</span>
          <ChevronUp className="w-4 h-4 text-gray-400" />
        </div>
        <label className="flex items-center gap-2.5 py-1.5 cursor-pointer">
          <button
            onClick={() => setHaveCv(v => !v)}
            className={`w-4 h-4 rounded border-2 flex items-center justify-center transition flex-shrink-0
              ${haveCv ? 'bg-purple-600 border-purple-600' : 'border-gray-300'}`}
          >
            {haveCv && (
              <svg className="w-2.5 h-2.5 text-white" viewBox="0 0 12 12" fill="none">
                <path d="M2 6l3 3 5-5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            )}
          </button>
          <span className="text-sm text-gray-600">Have CV Attached</span>
        </label>
      </div>

      {FILTER_SECTIONS.map(section => (
        <div key={section} className="border-t border-gray-100">
          <button
            onClick={() => toggle(section)}
            className="w-full flex items-center justify-between py-2.5 text-sm font-semibold text-gray-700 hover:text-purple-600 transition"
          >
            {section}
            {filterOpen[section] ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
          </button>

          {filterOpen[section] && (
            <div className="p-3 bg-gray-50">
              {section.includes('Keyword') || section.includes('Area') || section.includes('Exclude') || section === 'Industries' ? (
                <input
                  type="text"
                  value={localFilters[section] || ''}
                  onChange={(e) => setLocalFilters(l => ({ ...l, [section]: e.target.value }))}
                  placeholder={`Search ${section}`}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm"
                />
              ) : null}

              {section === 'Experience' && (
                <div className="flex flex-col gap-2 mt-2 text-sm">
                  {['Fresher', '0-1 years', '1-3 years', '3-5 years', '5+ years'].map(opt => (
                    <label key={opt} className="flex items-center gap-2">
                      <input type="checkbox" checked={(localFilters.experience || []).includes(opt)} onChange={(e)=>{
                        setLocalFilters(l=>{
                          const arr = Array.isArray(l.experience)? [...l.experience] : []
                          if (e.target.checked) arr.push(opt); else {
                            const i = arr.indexOf(opt); if (i>-1) arr.splice(i,1)
                          }
                          return { ...l, experience: arr }
                        })
                      }} className="w-4 h-4" />
                      <span className="text-gray-700">{opt}</span>
                    </label>
                  ))}
                </div>
              )}

              {section === 'Gender' && (
                <div className="flex items-center gap-3 mt-2 text-sm">
                  {['Male', 'Female', 'Other'].map(g => (
                    <label key={g} className="flex items-center gap-2">
                      <input type="radio" name="gender-filter" checked={localFilters.gender===g} onChange={()=>setLocalFilters(l=>({ ...l, gender: g }))} className="w-4 h-4" />
                      <span className="text-gray-700">{g}</span>
                    </label>
                  ))}
                </div>
              )}

              {section === 'Age' && (
                <div className="flex gap-2 mt-2">
                  <input type="number" value={localFilters.ageMin || ''} onChange={(e)=>setLocalFilters(l=>({...l, ageMin: e.target.value}))} placeholder="Min age" className="w-1/2 px-3 py-2 border border-gray-200 rounded-lg text-sm" />
                  <input type="number" value={localFilters.ageMax || ''} onChange={(e)=>setLocalFilters(l=>({...l, ageMax: e.target.value}))} placeholder="Max age" className="w-1/2 px-3 py-2 border border-gray-200 rounded-lg text-sm" />
                </div>
              )}
            </div>
          )}
        </div>
      ))}

      <div className="border-t border-gray-100 pt-3 mt-3">
        <button onClick={apply} className="w-full py-2 bg-purple-600 text-white rounded-lg text-sm font-semibold">Apply Filters</button>
      </div>
    </div>
  )
}

// ─── Main Component ───────────────────────────────────────────────────────────
const LIMIT = 10

const Applicants = () => {
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const params = useParams()
  const jobId = params.jobId ?? params.id

  const {
    applicants,
    applicantJobTitle,
    totalApplicants,
    applicantsTotalPages: totalPages,
    loading,
    error
  } = useSelector(s => s.job)

  const [page, setPage] = useState(1)
  const [selected, setSelected] = useState({})
  const [selectAll, setSelectAll] = useState(false)
  const [filters, setFilters] = useState({})
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [sortOption, setSortOption] = useState('newest')

  useEffect(() => {
    if (jobId) {
      const activeFilters = { ...filters }
      if (statusFilter && statusFilter !== 'all') {
        activeFilters.status = statusFilter
      }
      if (searchTerm.trim()) {
        activeFilters.search = searchTerm.trim()
      }
      if (sortOption) {
        activeFilters.sort = sortOption
      }
      dispatch(getApplicants({ jobId, page, limit: LIMIT, filters: activeFilters }))
      window.scrollTo(0, 0)
    }
  }, [dispatch, jobId, page, filters, statusFilter, searchTerm, sortOption])

  useEffect(() => {
    return () => { dispatch(clearApplicants()) }
  }, [dispatch])

  useEffect(() => {
    if (error) toast.error(error)
  }, [error])

  const toggleSelect = (id) => setSelected(prev => ({ ...prev, [id]: !prev[id] }))

  const toggleAll = () => {
    const next = !selectAll
    setSelectAll(next)
    const newSel = {}
    applicants.forEach(a => { newSel[a._id] = next })
    setSelected(newSel)
  }

  const handleDownloadExcel = () => {
    if (!applicants?.length) {
      toast.info('No applicants available to download')
      return
    }

    const selectedIds = Object.keys(selected).filter(id => selected[id])
    const dataToDownload = selectedIds.length
      ? applicants.filter(a => selectedIds.includes(a._id))
      : applicants

    const rows = [
      ['Name', 'Email', 'Phone', 'Status', 'Experience', 'Current CTC', 'Notice Period', 'Location', 'Current Role', 'Company', 'Education', 'Institution', 'Skills'],
      ...dataToDownload.map(applicant => {
        const details = applicant.jobseekerDetails?.[0] ?? {}
        const edu = details.education ?? {}
        const jobTitle = details.jobTitle ?? {}
        const loc = details.location
        const locationStr = typeof loc === 'object'
          ? [loc.city, loc.state].filter(Boolean).join(', ')
          : str(loc)

        return [
          str(details.fullName),
          str(details.email),
          str(details.mobileNumber),
          str(applicant.status),
          str(applicant.experience),
          str(applicant.currentCTC),
          str(applicant.noticePeriod),
          locationStr || 'N/A',
          str(jobTitle.jobTitle),
          str(jobTitle.companyName),
          str(edu.highestDegree),
          str(edu.institutionName),
          Array.isArray(details.skills) ? details.skills.join(', ') : 'N/A',
        ]
      }),
    ]

    downloadCSV(`applicants-${jobId}.csv`, rows)
    toast.success('Excel downloaded successfully')
  }

  // ── Pagination Logic ────────────────────────────────
  const effectiveTotalPages = Math.max(1, totalPages || Math.ceil((totalApplicants || 0) / LIMIT) || 1);

  const getPageNumbers = () => {
    const total = effectiveTotalPages;
    const current = page;
    const delta = 1; // pages around current

    const range = [];
    for (let i = Math.max(2, current - delta); i <= Math.min(total - 1, current + delta); i++) {
      range.push(i);
    }

    if (current - delta > 2) {
      range.unshift('...');
    }
    if (current + delta < total - 1) {
      range.push('...');
    }

    range.unshift(1);
    if (total > 1) {
      range.push(total);
    }

    return range;
  };

  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  return (
    <>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700&display=swap');`}</style>

      <div className="min-h-screen bg-gradient-to-br from-purple-200/30 via-white to-purple-200/30 p-2 sm:p-4" style={{ fontFamily: "'Poppins', sans-serif" }}>
        <div className="max-w-9xl mx-auto">

          <div className="flex items-center justify-between gap-3 mb-2 flex-wrap">
            <div className="flex items-center gap-3">
              <button onClick={() => navigate(-1)} className="text-gray-700 hover:text-purple-600 transition">
                <ArrowLeft className="w-5 h-5" strokeWidth={2} />
              </button>
              <div>
                <h1 className="text-lg sm:text-xl font-bold text-gray-900">Applicants</h1>
                {applicantJobTitle && (
                  <p className="text-xs text-gray-400 mt-0.5">
                    for: <span className="font-semibold text-purple-600">{applicantJobTitle}</span>
                  </p>
                )}
              </div>
            </div>

            <button
              onClick={() => setMobileFilterOpen(o => !o)}
              className="lg:hidden flex items-center gap-2 px-3 py-1.5 bg-white border border-gray-200 text-gray-700 rounded-xl text-xs font-semibold shadow-sm"
            >
              Filters {Object.keys(filters).length > 0 && `(${Object.keys(filters).length})`}
            </button>
          </div>

          <div className="flex flex-col lg:flex-row gap-5 items-start mt-4">
            <div className="flex-1 w-full min-w-0">
              <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-3 mb-4 space-y-3">
                <div className="flex flex-col sm:flex-row gap-2.5 items-stretch sm:items-center">
                  <div className="relative flex-1">
                    <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={searchTerm}
                      onChange={(e) => { setSearchTerm(e.target.value); setPage(1); }}
                      placeholder="Search applicant name, email, or keywords..."
                      className="w-full text-xs pl-9 pr-3 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-transparent transition"
                    />
                  </div>

                  <div className="flex items-center gap-2 flex-wrap">
                    <select
                      value={statusFilter}
                      onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
                      className="text-xs px-3 py-2 rounded-lg border border-gray-200 bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-600"
                    >
                      <option value="all">All Statuses</option>
                      <option value="applied">Applied</option>
                      <option value="interview">Interview</option>
                      <option value="accepted">Accepted</option>
                      <option value="rejected">Rejected</option>
                    </select>

                    <select
                      value={sortOption}
                      onChange={(e) => { setSortOption(e.target.value); setPage(1); }}
                      className="text-xs px-3 py-2 rounded-lg border border-gray-200 bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-600"
                    >
                      <option value="newest">Newest First</option>
                      <option value="oldest">Oldest First</option>
                      <option value="experience">Experience</option>
                    </select>
                  </div>
                </div>

                <div className="flex items-center justify-between border-t border-gray-100 pt-2.5 flex-wrap gap-2">
                  <label className="flex items-center gap-2.5 cursor-pointer" onClick={toggleAll}>
                    <div className={`w-4 h-4 rounded border-2 flex items-center justify-center transition
                      ${selectAll ? 'bg-purple-600 border-purple-600' : 'border-gray-300'}`}>
                      {selectAll && (
                        <svg className="w-2.5 h-2.5 text-white" viewBox="0 0 12 12" fill="none">
                          <path d="M2 6l3 3 5-5" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      )}
                    </div>
                    <span className="text-xs sm:text-sm font-semibold text-gray-700">Select All</span>
                  </label>
                  <div className="flex items-center gap-3">
                    <button onClick={handleDownloadExcel} className="flex items-center gap-1.5 sm:gap-2 text-green-600 text-xs sm:text-sm font-semibold hover:text-green-700 transition">
                      <Download className="w-4 h-4" strokeWidth={2} /> Download Excel
                    </button>
                    <button
                      onClick={() => {
                        setFilters({});
                        setSearchTerm('');
                        setStatusFilter('all');
                        setSortOption('newest');
                        setPage(1);
                      }}
                      className="text-xs sm:text-sm text-gray-500 hover:underline"
                    >
                      Reset All
                    </button>
                  </div>
                </div>
              </div>

              {loading ? (
                <div className="flex items-center justify-center py-24">
                  <div className="w-8 h-8 border-4 border-purple-600 border-t-transparent rounded-full animate-spin" />
                </div>
              ) : applicants.length === 0 ? (
                <div className="text-center py-24 bg-white rounded-2xl border border-dashed border-gray-200">
                  <Users className="w-12 h-12 mx-auto mb-3 text-gray-300" strokeWidth={1} />
                  <p className="text-gray-500 font-medium">No applicants found.</p>
                </div>
              ) : (
                <>
                  {applicants.map((applicant, idx) => (
                    <CandidateCard
                      key={applicant._id}
                      applicant={applicant}
                      idx={idx}
                      selected={!!selected[applicant._id]}
                      onSelect={() => toggleSelect(applicant._id)}
                    />
                  ))}

                  {/* Pagination Section */}
                  {effectiveTotalPages > 1 && (
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-1 pt-6 pb-10">
                      <p className="text-xs font-semibold text-purple-600">
                        Showing {(page - 1) * LIMIT + 1}–{Math.min(page * LIMIT, totalApplicants || applicants.length)} of {totalApplicants || applicants.length} applicants
                      </p>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setPage(p => Math.max(1, p - 1))}
                          disabled={page <= 1}
                          className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-purple-200 text-xs font-semibold text-purple-700 hover:bg-purple-50 disabled:opacity-40 disabled:hover:bg-transparent disabled:cursor-not-allowed transition"
                        >
                          <ChevronLeft className="w-4 h-4" />
                          <span>Previous</span>
                        </button>

                        <span className="text-xs font-semibold text-gray-700 px-3 py-1.5 bg-purple-50 border border-purple-100 rounded-lg">
                          Page {page} of {effectiveTotalPages}
                        </span>

                        <button
                          onClick={() => setPage(p => Math.min(effectiveTotalPages, p + 1))}
                          disabled={page >= effectiveTotalPages}
                          className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-purple-200 text-xs font-semibold text-purple-700 hover:bg-purple-50 disabled:opacity-40 disabled:hover:bg-transparent disabled:cursor-not-allowed transition"
                        >
                          <span>Next</span>
                          <ChevronRight className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>

            <div className={`w-full lg:w-64 flex-shrink-0 ${mobileFilterOpen ? 'block' : 'hidden lg:block'}`}>
              <FilterPanel
                filters={filters}
                setFilters={setFilters}
                onApply={(f)=>{
                  setSelected({});
                  setSelectAll(false);
                  setPage(1);
                  setMobileFilterOpen(false);
                }}
              />
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default Applicants