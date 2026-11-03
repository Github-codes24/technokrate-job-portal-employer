import React, { useState, useEffect } from 'react'
import * as XLSX from "xlsx";
import { toast } from 'react-toastify'
import {
  ArrowLeft, Download, Phone, Mail, MapPin,
  Briefcase, GraduationCap, Lock, Users,
  Clock, ChevronDown, ChevronUp,
} from 'lucide-react'
import { useNavigate, useParams } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { fetchMatchedCandidates } from '../../redux/slices/companyJobs/getCandidateMatches'

// ─── Filter Sections ──────────────────────────────────────────────────────────
const FILTER_SECTIONS = [
  'Must-Have Keywords', 'Current City / Area', 'Exclude Keywords',
  'Experience', 'Industries', 'Gender', 'Age', 'Language', 'Skills', 'Documents',
]

// ─── Candidate Card ───────────────────────────────────────────────────────────
// const CandidateCard = ({ candidate, selected, onSelect }) => {
//   const isLocked = candidate.isLocked 
const CandidateCard = ({ candidate, selected, onSelect, onUnlock }) => {
  const isLocked = candidate.isLocked;

  // FIX: Handle location if it's an object {city, state} or a string
  const displayLocation = typeof candidate.location === 'object'
    ? `${candidate.location.city}${candidate.location.state ? `, ${candidate.location.state}` : ''}`
    : candidate.location || 'Not Specified';



  const handleDownloadResume = async () => {
    if (!candidate.resume) {
      toast.info("No resume available");
      return;
    }

    try {
      const response = await fetch(candidate.resume);
      const blob = await response.blob();

      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");

      link.href = url;
      link.download = `${candidate.name || "candidate"}-resume.pdf`;

      document.body.appendChild(link);
      link.click();

      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      window.open(candidate.resume, "_blank", "noopener,noreferrer");
    }
  };



  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 mb-3">
      <div className="flex items-start gap-4">

        {/* Checkbox */}
        <button onClick={onSelect} className="mt-1 flex-shrink-0">
          <div className={`w-4 h-4 rounded border-2 flex items-center justify-center transition
            ${selected ? 'bg-purple-600 border-purple-600' : 'border-gray-300'}`}>
            {selected && (
              <svg className="w-2.5 h-2.5 text-white" viewBox="0 0 12 12" fill="none">
                <path d="M2 6l3 3 5-5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            )}
          </div>
        </button>

        {/* Avatar */}
        <div className={`w-11 h-11 rounded-full bg-purple-100 text-purple-700 flex items-center justify-center text-lg font-bold flex-shrink-0`}>
          {candidate.name?.charAt(0) || 'C'}
        </div>

        {/* Details */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 mb-1 flex-wrap">
            <span className={`font-bold text-sm ${isLocked ? 'text-gray-400' : 'text-gray-800'}`}>
              {candidate.name}
            </span>
            <button
              onClick={() => isLocked && onUnlock(candidate._id)}
              className="text-xs font-semibold text-purple-600 hover:underline whitespace-nowrap"
            >
              {isLocked
                ? 'Unlock Profile for Free »'
                : 'Unlocked & View Full Profile »'}
            </button>
          </div>

          <div className="flex items-center gap-4 text-xs text-gray-400 mb-3 flex-wrap">
            <span className="flex items-center gap-1">
              <Briefcase className="w-3 h-3" strokeWidth={1.6} /> {candidate.experience || 'Fresher'}
            </span>
            <span className="flex items-center gap-1">
              <span className="font-medium">₹</span> {candidate.expectedCTC || 'Not Disclosed'}
            </span>
            <span className="flex items-center gap-1">
              <MapPin className="w-3 h-3" strokeWidth={1.6} /> {displayLocation}
            </span>
          </div>

          {/* Detail grid */}
          <div className={`grid grid-cols-2 gap-x-4 gap-y-1 text-xs mb-4 ${isLocked ? 'blur-[3px] select-none pointer-events-none' : ''}`}>
            {[
              [Briefcase, 'Current/Latest', candidate.designation || 'Not Specified'],
              [GraduationCap, 'Education', candidate.education || 'Not Specified'],
              [MapPin, 'Location', displayLocation],
              [Users, 'Skills', candidate.skills || 'Not Specified'],
              [Clock, 'Category', candidate.category || 'Not Specified'],
            ].map(([Icon, label, value]) => (
              <div key={label} className="flex items-start gap-2">
                <Icon className="w-3.5 h-3.5 text-gray-400 mt-0.5 flex-shrink-0" strokeWidth={1.6} />
                <span className="text-gray-400 w-20 flex-shrink-0">{label}</span>
                <span className="text-gray-700 truncate">{value}</span>
              </div>
            ))}
          </div>

          <div className="flex gap-3">
            <button className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white text-xs font-semibold px-4 py-2 rounded-lg transition">
              <Phone className="w-3.5 h-3.5" strokeWidth={2} /> {isLocked ? 'Unlock to View' : candidate.mobile}
            </button>
            <button className="flex items-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-semibold px-4 py-2 rounded-lg transition">
              <Mail className="w-3.5 h-3.5" strokeWidth={2} /> {isLocked ? 'Unlock to View' : candidate.email}
            </button>
          </div>
        </div>

        {/* Right: badge + download */}
        <div className="flex flex-col items-end gap-3 flex-shrink-0">
          {isLocked ? (
            <button
              onClick={() => onUnlock(candidate._id)}
              className="flex items-center gap-1.5 bg-purple-600 hover:bg-purple-700 text-white text-xs font-semibold px-4 py-2 rounded-xl transition"
            >
              <Lock className="w-3 h-3" strokeWidth={2} />
              Unlock Profile
            </button>
          ) : (
            <span className="flex items-center gap-1.5 bg-purple-100 text-purple-700 text-xs font-semibold px-3 py-1.5 rounded-full">
              <Lock className="w-3 h-3" strokeWidth={2} />
              Unlocked
            </span>
          )}
          <button
            onClick={handleDownloadResume}
            disabled={isLocked}
            className={`flex items-center gap-2 text-white text-xs font-semibold px-4 py-2 rounded-xl transition shadow-sm whitespace-nowrap
    ${isLocked ? 'bg-green-400 opacity-60 cursor-not-allowed' : 'bg-green-500 hover:bg-green-600'}`}
          >
            <Download className="w-3.5 h-3.5" strokeWidth={2} />
            Download Resume
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

  useEffect(()=>setLocalFilters(filters || {}),[filters])

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
    const mapped = {}
    Object.keys(localFilters || {}).forEach(k => {
      const mk = keyMap[k] || k
      mapped[mk] = localFilters[k]
    })
    if (haveCv) mapped.haveCv = true
    if (hideChecks[0]) mapped.alreadyUnlocked = true
    if (hideChecks[1]) mapped.alreadyLocked = true
    setFilters(mapped)
    if (onApply) onApply(mapped)
  }

  return (
    <div className="w-64 flex-shrink-0 bg-white rounded-2xl border border-gray-100 shadow-sm p-4 self-start">
      <div className="pb-3">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-semibold text-gray-700">Hide Candidates that are</span>
          <ChevronUp className="w-4 h-4 text-gray-400" />
        </div>
        {['Already Unlocked', 'Already locked'].map((label, i) => (
          <label key={i} className="flex items-center gap-2.5 py-1.5 cursor-pointer">
            <button
              onClick={() => setHideChecks(h => h.map((v, idx) => idx === i ? !v : v))}
              className={`w-4 h-4 rounded border-2 flex items-center justify-center transition flex-shrink-0
                ${hideChecks[i] ? 'bg-purple-600 border-purple-600' : 'border-gray-300'}`}
            >
              {hideChecks[i] && <div className="w-2 h-2 bg-white rounded-sm" />}
            </button>
            <span className="text-sm text-gray-600">{label}</span>
          </label>
        ))}
      </div>

      <div className="border-t border-gray-100 pt-3 pb-3">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-semibold text-gray-700">Show only Candidates who</span>
          <ChevronUp className="w-4 h-4 text-gray-400" />
        </div>
        <label className="flex items-center gap-2.5 py-1.5 cursor-pointer">
          <button
            onClick={() => setHaveCv(v => !v)}
            className={`w-4 h-4 rounded border-2 flex items-center justify-center transition flex-shrink-0
              ${haveCv ? 'bg-purple-600 border-purple-600' : 'border-gray-300'}`}
          >
            {haveCv && <div className="w-2 h-2 bg-white rounded-sm" />}
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
                      <input type="radio" name="gender-filter-db" checked={localFilters.gender===g} onChange={()=>setLocalFilters(l=>({ ...l, gender: g }))} className="w-4 h-4" />
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
const DatabaseMatches = () => {
  const { id } = useParams()
  const dispatch = useDispatch()
  const navigate = useNavigate()

  const { matches, loading, jobTitle } = useSelector((state) => state.candidateMatches)

  const [selectedIds, setSelectedIds] = useState([])
  const [selectAll, setSelectAll] = useState(false)
  const [localMatches, setLocalMatches] = useState([])
  const [filters, setFilters] = useState({})

  useEffect(() => {
    if (id) {
      dispatch(fetchMatchedCandidates({ jobId: id, filters }))
    }
  }, [dispatch, id, filters])


  useEffect(() => {
    const storageKey = `unlocked_profiles_${id}`
    const unlockedIds = JSON.parse(localStorage.getItem(storageKey) || '[]')

    const updatedMatches = (matches || []).map(candidate => ({
      ...candidate,
      isLocked: unlockedIds.includes(candidate._id)
        ? false
        : candidate.isLocked,
    }))

    setLocalMatches(updatedMatches)
  }, [matches, id])



  const handleUnlockProfile = (candidateId) => {
    const storageKey = `unlocked_profiles_${id}`
    const oldIds = JSON.parse(localStorage.getItem(storageKey) || '[]')

    if (!oldIds.includes(candidateId)) {
      localStorage.setItem(storageKey, JSON.stringify([...oldIds, candidateId]))
    }

    setLocalMatches(prev =>
      prev.map(candidate =>
        candidate._id === candidateId
          ? { ...candidate, isLocked: false }
          : candidate
      )
    )

    toast.success('Profile unlocked successfully')
  }


  const toggleSelect = (candId) => {
    setSelectedIds(prev => prev.includes(candId) ? prev.filter(i => i !== candId) : [...prev, candId])
  }

  const toggleAll = () => {
    if (selectAll) {
      setSelectedIds([])
    } else {
      setSelectedIds(localMatches.map(m => m._id))
    }
    setSelectAll(!selectAll)
  }

  const handleDownloadExcel = () => {
    if (!localMatches || localMatches.length === 0) {
      toast.info("No candidates to export");
      return;
    }

    const excelData = localMatches.map((candidate, index) => ({
      "Sr No": index + 1,
      Name: candidate.name || "",
      Experience: candidate.experience || "Fresher",
      Email: candidate.email || "",
      Mobile: candidate.mobile || "",
      "Expected CTC": candidate.expectedCTC || "Not Disclosed",
      Location:
        typeof candidate.location === "object"
          ? `${candidate.location?.city || ""}, ${candidate.location?.state || ""}`
          : candidate.location || "",
      Designation: candidate.designation || "",
      Education: candidate.education || "",
      Skills: Array.isArray(candidate.skills)
        ? candidate.skills.join(", ")
        : candidate.skills || "",
      Category: candidate.category || "",
    }));

    const worksheet = XLSX.utils.json_to_sheet(excelData);
    const workbook = XLSX.utils.book_new();

    XLSX.utils.book_append_sheet(workbook, worksheet, "Database Matches");
    XLSX.writeFile(workbook, `database-matches-${jobTitle || "candidates"}.xlsx`);
  };

  return (
    <>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700&display=swap');`}</style>

      <div className="min-h-screen bg-white p-5 rounded-xl" style={{ fontFamily: "'Poppins', sans-serif" }}>
        <div className="max-w-9xl mx-auto">

          {/* Title Section */}
          <div className="flex items-center gap-3 mb-5">
            <button onClick={() => navigate(-1)} className="text-gray-700 hover:text-purple-600 transition">
              <ArrowLeft className="w-5 h-5" strokeWidth={2} />
            </button>
            <h1 className="text-xl font-bold text-gray-900">
              Database Matches {jobTitle && <span className="text-purple-600">- {jobTitle}</span>}
            </h1>
          </div>

          <div className="flex gap-5 items-start">
            <div className="flex-1">
              {loading ? (
                <div className="p-20 text-center animate-pulse text-gray-400">Fetching best matches...</div>
              ) : (
                <>
                  <div className="flex items-center justify-between bg-white rounded-xl border border-gray-100 shadow-sm px-4 py-3 mb-4">
                    <label className="flex items-center gap-2.5 cursor-pointer" onClick={toggleAll}>
                      <div className={`w-4 h-4 rounded border-2 flex items-center justify-center transition
                        ${selectAll ? 'bg-purple-600 border-purple-600' : 'border-gray-300'}`}>
                        {selectAll && <div className="w-2 h-2 bg-white rounded-sm" />}
                      </div>
                      <span className="text-sm font-semibold text-gray-700">Select All ({localMatches?.length || 0})</span>
                    </label>
                    <button
                      onClick={handleDownloadExcel}
                      className="flex items-center gap-2 text-green-600 text-sm font-semibold hover:text-green-700 transition"
                    >
                      <Download className="w-4 h-4" strokeWidth={2} /> Download Excel
                    </button>
                  </div>

                  {localMatches && localMatches.length > 0 ? (
                    localMatches.map(candidate => (
                      <CandidateCard
                        key={candidate._id}
                        candidate={candidate}
                        selected={selectedIds.includes(candidate._id)}
                        onSelect={() => toggleSelect(candidate._id)}
                        onUnlock={handleUnlockProfile}
                      />
                    ))
                  ) : (
                    <div className="p-10 text-center text-gray-500 bg-gray-50 rounded-2xl border border-dashed">
                      No matching candidates found for this job.
                    </div>
                  )}
                </>
              )}
            </div>

            <FilterPanel filters={filters} setFilters={setFilters} onApply={(f)=>{ setSelectedIds([]); setSelectAll(false); }} />
          </div>

          <p className="text-center text-xs text-gray-400 mt-8">
            © 2026 Technokrate – Job Portal. All rights Reserved
          </p>
        </div>
      </div>
    </>
  )
}

export default DatabaseMatches