import React, { useState } from 'react'
import {
  Filter, ChevronDown, ChevronUp,
  Download, Phone, Mail, MapPin, Briefcase,
  GraduationCap, Lock, Users, Clock
} from 'lucide-react'

// ─── Data ─────────────────────────────────────────────────────────────────────
const CANDIDATES = [
  {
    id: 1, name: 'Aman Kumar', initial: 'A', color: 'bg-amber-200', textColor: 'text-amber-800',
    experience: '6 months', salary: 'Not Disclosed', location: 'Nagpur',
    current: 'Sales Executive', education: 'B.Sc', locationDetail: 'Nagpur Region',
    skills: 'Event Planning | Event Management', languages: 'English | Hindi | marathi',
    selected: false,
  },
  {
    id: 2, name: 'Das Kumar', initial: 'D', color: 'bg-green-200', textColor: 'text-green-800',
    experience: '6 months', salary: 'Not Disclosed', location: 'Nagpur',
    current: 'Marketing', education: 'B.TECH', locationDetail: 'Nagpur Region',
    skills: 'Product Sales', languages: 'English | Hindi | marathi',
    selected: true,
  },
]

const FILTER_SECTIONS = [
  'Must-Have Keywords', 'Current City / Area', 'Exclude Keywords',
  'Experience', 'Industries', 'Gender', 'Age', 'Language', 'Skills', 'Documents'
]

// ─── Candidate Card ───────────────────────────────────────────────────────────
const CandidateCard = ({ candidate, onSelect }) => (
  <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 mb-4">
    <div className="flex items-start gap-4">

      {/* Checkbox */}
      <button onClick={onSelect} className="mt-1 flex-shrink-0">
        <div className={`w-5 h-5 rounded border-2 flex items-center justify-center transition
          ${candidate.selected ? 'bg-purple-600 border-purple-600' : 'border-gray-300'}`}>
          {candidate.selected && (
            <svg className="w-3 h-3 text-white" viewBox="0 0 12 12" fill="none">
              <path d="M2 6l3 3 5-5" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          )}
        </div>
      </button>

      {/* Avatar */}
      <div className={`w-12 h-12 rounded-full ${candidate.color} ${candidate.textColor} flex items-center justify-center text-lg font-bold flex-shrink-0`}>
        {candidate.initial}
      </div>

      {/* Details */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-3 mb-1 flex-wrap">
          <span className="font-bold text-gray-800">{candidate.name}</span>
          <button className="text-xs font-semibold text-purple-600 hover:underline whitespace-nowrap">
            View Full profile for free »
          </button>
        </div>

        <div className="flex items-center gap-4 text-xs text-gray-500 mb-3 flex-wrap">
          <span className="flex items-center gap-1">
            <Briefcase className="w-3 h-3" strokeWidth={1.6}/> {candidate.experience}
          </span>
          <span className="flex items-center gap-1">
            <span className="text-gray-400 font-medium">₹</span> {candidate.salary}
          </span>
          <span className="flex items-center gap-1">
            <MapPin className="w-3 h-3" strokeWidth={1.6}/> {candidate.location}
          </span>
        </div>

        <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-xs mb-4">
          {[
            [Briefcase,     'Current/Latest', candidate.current],
            [GraduationCap, 'Education',      candidate.education],
            [MapPin,        'Location',       candidate.locationDetail],
            [Users,         'Skills',         candidate.skills],
            [Clock,         'Languages',      candidate.languages],
          ].map(([Icon, label, value]) => (
            <div key={label} className="flex items-start gap-2">
              <Icon className="w-3.5 h-3.5 text-gray-400 mt-0.5 flex-shrink-0" strokeWidth={1.6}/>
              <span className="text-gray-400 w-20 flex-shrink-0">{label}</span>
              <span className="text-gray-700">{value}</span>
            </div>
          ))}
        </div>

        <div className="flex gap-3">
          <button className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white text-xs font-semibold px-4 py-2 rounded-lg transition">
            <Phone className="w-3.5 h-3.5" strokeWidth={2}/> View Phone Number
          </button>
          <button className="flex items-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-semibold px-4 py-2 rounded-lg transition">
            <Mail className="w-3.5 h-3.5" strokeWidth={2}/> View Email Address
          </button>
        </div>
      </div>

      {/* Right: badge + download */}
      <div className="flex flex-col items-end gap-3 flex-shrink-0">
        <span className="flex items-center gap-1.5 bg-purple-100 text-purple-700 text-xs font-semibold px-3 py-1.5 rounded-full">
          <Lock className="w-3 h-3" strokeWidth={2}/> Un-locked
        </span>
        <button className="flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white text-xs font-semibold px-4 py-2.5 rounded-xl transition shadow-sm whitespace-nowrap">
          <Download className="w-3.5 h-3.5" strokeWidth={2}/> Download Resume
        </button>
      </div>

    </div>
  </div>
)

// ─── Main ─────────────────────────────────────────────────────────────────────
const SavedSearch = () => {
  const [candidates, setCandidates] = useState(CANDIDATES)
  const [selectAll, setSelectAll]   = useState(false)
  const [filterOpen, setFilterOpen] = useState({})
  const [hideAlready, setHideAlready] = useState([false, true])
  const [haveCv, setHaveCv]           = useState(true)

  const toggleSelect = (id) =>
    setCandidates(c => c.map(x => x.id === id ? { ...x, selected: !x.selected } : x))

  const toggleSelectAll = () => {
    const next = !selectAll
    setSelectAll(next)
    setCandidates(c => c.map(x => ({ ...x, selected: next })))
  }

  const toggleFilter = (key) =>
    setFilterOpen(f => ({ ...f, [key]: !f[key] }))

  return (
    <>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700&display=swap');`}</style>

      <div className="min-h-screen bg-white p-5 rounded-xl" style={{ fontFamily: "'Poppins', sans-serif" }}>
        <div className="max-w-9xl mx-auto">

          {/* Filter heading */}
          <div className="flex items-center gap-2 mb-4">
            <Filter className="w-4 h-4 text-gray-700" strokeWidth={1.8}/>
            <span className="text-base font-bold text-gray-800">Filter (0)</span>
          </div>

          <div className="flex gap-5">

            {/* ── Left Filter Panel ── */}
            <div className="w-72 flex-shrink-0 bg-white rounded-2xl border border-gray-100 shadow-sm p-4 self-start">

              {/* Hide Candidates that are */}
              <div className="pb-3">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-semibold text-gray-700">Hide Candidates that are</span>
                  <ChevronUp className="w-4 h-4 text-gray-400"/>
                </div>
                {['Already Unlocked', 'Already Unlocked'].map((label, i) => (
                  <label key={i} className="flex items-center gap-2.5 py-1.5 cursor-pointer">
                    <button
                      onClick={() => setHideAlready(h => h.map((v, idx) => idx === i ? !v : v))}
                      className={`w-4 h-4 rounded border-2 flex items-center justify-center transition flex-shrink-0
                        ${hideAlready[i] ? 'bg-purple-600 border-purple-600' : 'border-gray-300'}`}
                    >
                      {hideAlready[i] && (
                        <svg className="w-2.5 h-2.5 text-white" viewBox="0 0 12 12" fill="none">
                          <path d="M2 6l3 3 5-5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      )}
                    </button>
                    <span className="text-sm text-gray-600">{label}</span>
                  </label>
                ))}
              </div>

              {/* Show only Candidates who */}
              <div className="border-t border-gray-100 pt-3 pb-3">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-semibold text-gray-700">Show only Candidates who</span>
                  <ChevronUp className="w-4 h-4 text-gray-400"/>
                </div>
                <label className="flex items-center gap-2.5 py-1.5 cursor-pointer">
                  <button
                    onClick={() => setHaveCv(v => !v)}
                    className={`w-4 h-4 rounded border-2 flex items-center justify-center transition flex-shrink-0
                      ${haveCv ? 'bg-purple-600 border-purple-600' : 'border-gray-300'}`}
                  >
                    {haveCv && (
                      <svg className="w-2.5 h-2.5 text-white" viewBox="0 0 12 12" fill="none">
                        <path d="M2 6l3 3 5-5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    )}
                  </button>
                  <span className="text-sm text-gray-600">Have CV Attached</span>
                </label>
              </div>

              {/* Collapsible sections */}
              {FILTER_SECTIONS.map(section => (
                <div key={section} className="border-t border-gray-100">
                  <button
                    onClick={() => toggleFilter(section)}
                    className="w-full flex items-center justify-between py-3 text-sm font-semibold text-gray-700 hover:text-purple-600 transition"
                  >
                    {section}
                    {filterOpen[section]
                      ? <ChevronUp   className="w-4 h-4 text-gray-400"/>
                      : <ChevronDown className="w-4 h-4 text-gray-400"/>
                    }
                  </button>
                </div>
              ))}
            </div>

            {/* ── Right: Candidates ── */}
            <div className="flex-1">

              {/* Select All bar */}
              <div className="flex items-center justify-between bg-white rounded-xl border border-gray-100 shadow-sm px-4 py-3 mb-4">
                <label className="flex items-center gap-2.5 cursor-pointer" onClick={toggleSelectAll}>
                  <div className={`w-5 h-5 rounded border-2 flex items-center justify-center transition
                    ${selectAll ? 'bg-purple-600 border-purple-600' : 'border-gray-300'}`}>
                    {selectAll && (
                      <svg className="w-3 h-3 text-white" viewBox="0 0 12 12" fill="none">
                        <path d="M2 6l3 3 5-5" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    )}
                  </div>
                  <span className="text-sm font-semibold text-gray-700">Select All</span>
                </label>
                <button className="flex items-center gap-2 text-green-600 text-sm font-semibold hover:text-green-700 transition">
                  <Download className="w-4 h-4" strokeWidth={2}/> Download Excel
                </button>
              </div>

              {/* Candidate cards */}
              {candidates.map(c => (
                <CandidateCard key={c.id} candidate={c} onSelect={() => toggleSelect(c.id)}/>
              ))}

            </div>
          </div>

          <p className="text-center text-xs text-gray-400 mt-8">
            @ 2024 MyJob – Job Portal. All rights Rserved
          </p>
        </div>
      </div>
    </>
  )
}

export default SavedSearch