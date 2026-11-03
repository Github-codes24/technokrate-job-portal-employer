import React, { useState, useEffect, useCallback } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import * as XLSX from 'xlsx'
import {
  Download, Phone, Mail, MapPin, Briefcase,
  GraduationCap, Users, Lock,
  ChevronDown, ArrowRight, Loader2,
  ChevronLeft, ChevronRight, UserCheck,
  FileSpreadsheet, FileText, AlertCircle,
  MousePointer2, CheckCircle2
} from 'lucide-react'
import { getAllUnlockedCandidates } from '../../redux/slices/database/databaseSlice'
import {
  exportCandidatesExcel,
  deductBulkCredits,
  fetchRemainingCredits
} from '../../redux/slices/candidateUnlock/creditDeductionSlice'
import { fetchCreditStats } from '../../redux/slices/creditTransaction/creditAndTransactionSlice'
import ConfirmModal from '../../components/common/ConfirmModal'
import BuyCreditsModal from '../../components/common/BuyCreditsModal'
import { toast, ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import moment from 'moment'
import Pagination from '../../components/common/Pagination'

// ─── Helper ───────────────────────────────────────────────────────────────────
const formatLocation = (loc) => {
  if (!loc) return 'Pan India'
  if (typeof loc === 'string') return loc
  return [loc.city, loc.state].filter(Boolean).join(', ')
}

// ─── Excel Export Utility ─────────────────────────────────────────────────────
const exportToExcel = (candidates) => {
  const rows = candidates.map((c, idx) => ({
    '#': idx + 1,
    'Name': c.name || '',
    'Email': c.email || 'N/A',
    'Mobile': c.mobile || '',
    'Category': c.category || '',
    'Sub Category': c.subCategory || '',
    'Designation': typeof c.designation === 'string' ? c.designation : c.designation?.name || '',
    'Experience': c.experience || 'Fresher',
    'Education': c.education || '',
    'Skills': c.skills || '',
    'Current CTC': c.currentCTC || '',
    'Expected CTC': c.expectedCTC || '',
    'Location': formatLocation(c.location),
    'Resume Link': c.resume || 'Not Available',
    'Unlocked On': c.unlockDate ? moment(c.unlockDate).format('DD MMM YYYY, hh:mm A') : '',
  }))

  const ws = XLSX.utils.json_to_sheet(rows)
  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, 'Unlocked Candidates')
  XLSX.writeFile(wb, `Exported_Candidates_${moment().format('DDMMMYYYY')}.xlsx`)
}

// ─── Resume Download Button ───────────────────────────────────────────────────
const ResumeButton = ({ resume, name }) => {
  const [status, setStatus] = useState('idle')

  const handleDownload = async () => {
    if (!resume) return
    setStatus('downloading')
    try {
      const response = await fetch(resume)
      if (!response.ok) throw new Error('Failed to fetch')
      const blob = await response.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${name?.replace(/\s+/g, '_')}_Resume.pdf`
      document.body.appendChild(a)
      a.click()
      a.remove()
      URL.revokeObjectURL(url)
      setStatus('idle')
    } catch {
      window.open(resume, '_blank')
      setStatus('idle')
    }
  }

  if (!resume) return (
    <button disabled className="flex items-center gap-2 bg-gray-100 text-gray-400 text-xs font-semibold px-4 py-2.5 rounded-xl cursor-not-allowed w-full justify-center">
      <AlertCircle className="w-3.5 h-3.5" /> No Resume
    </button>
  )

  return (
    <button onClick={handleDownload} disabled={status === 'downloading'} className="flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white text-xs font-semibold px-4 py-2.5 rounded-xl transition shadow-sm w-full justify-center">
      {status === 'downloading' ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <FileText className="w-3.5 h-3.5" />}
      Download Resume
    </button>
  )
}

// ─── Candidate Card ───────────────────────────────────────────────────────────
const CandidateCard = ({ candidate, isSelectionMode, isSelected, onSelect }) => {
  const navigate = useNavigate()
  const avatarColors = ['bg-blue-100 text-blue-700', 'bg-purple-100 text-purple-700', 'bg-pink-100 text-pink-700', 'bg-green-100 text-green-700']
  const color = avatarColors[candidate.name?.length % avatarColors.length || 0]

  return (
    <div 
      onClick={() => isSelectionMode && onSelect(candidate._id)}
      className={`bg-white rounded-xl border p-5 mb-4 transition-all relative ${isSelectionMode ? 'cursor-pointer' : ''} ${isSelected ? 'border-purple-500 bg-purple-50/30 shadow-md' : 'border-gray-100 shadow-sm hover:border-purple-200'}`}
    >
      {isSelectionMode && (
        <div className="absolute top-2.5 right-2.5 sm:top-3 sm:right-3 z-10">
          <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${isSelected ? 'bg-purple-600 border-purple-600' : 'border-gray-300 bg-white'}`}>
            {isSelected && <CheckCircle2 className="w-3.5 h-3.5 text-white" />}
          </div>
        </div>
      )}

      <div className="flex flex-col sm:flex-row items-start justify-between gap-3.5">
        {/* Left: Avatar + Candidate Details */}
        <div className="flex items-start gap-3 flex-1 min-w-0">
          <div className={`w-11 h-11 sm:w-12 sm:h-12 rounded-full ${color} flex items-center justify-center text-lg sm:text-xl font-bold flex-shrink-0 uppercase`}>
            {candidate.name?.charAt(0)}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 sm:gap-2.5 mb-1 flex-wrap">
              <span className="font-bold text-gray-800 text-sm sm:text-base">{candidate.name}</span>
              {!isSelectionMode && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation()
                    navigate(`/database/search/filtered/${candidate._id}`)
                  }}
                  className="text-xs font-semibold text-purple-600 hover:underline flex items-center gap-1"
                >
                  View Profile <ArrowRight className="w-3 h-3" />
                </button>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-2.5 sm:gap-3 text-xs text-gray-500 mb-2.5">
              <span className="flex items-center gap-1"><Briefcase className="w-3 h-3 text-gray-400" /> {candidate.experience || 'Fresher'}</span>
              <span className="flex items-center gap-1"><MapPin className="w-3 h-3 text-gray-400" /> {formatLocation(candidate.location)}</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1 text-xs mb-3">
              <div className="flex items-center gap-1.5 min-w-0">
                <UserCheck className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
                <span className="text-gray-700 font-medium truncate">
                  {typeof candidate.designation === 'string' ? candidate.designation : candidate.designation?.name || 'N/A'}
                </span>
              </div>
              <div className="flex items-center gap-1.5 min-w-0">
                <GraduationCap className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
                <span className="text-gray-700 font-medium truncate">{candidate.education || 'N/A'}</span>
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              <div className="flex items-center gap-1.5 bg-purple-600 text-white text-xs font-semibold px-3 py-1.5 rounded-lg">
                <Phone className="w-3 h-3" /> {candidate.mobile}
              </div>
              <div className="flex items-center gap-1.5 bg-gray-100 text-gray-700 text-xs font-semibold px-3 py-1.5 rounded-lg max-w-full truncate">
                <Mail className="w-3 h-3 flex-shrink-0" /> <span className="truncate">{candidate?.email || 'N/A'}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Unlock Info + Download Resume */}
        <div className="flex flex-col sm:items-end gap-2 flex-shrink-0 w-full sm:w-auto min-w-[130px] pt-0.5">
          <div className="flex items-center gap-1.5 text-[10px] text-gray-400 font-semibold sm:pr-1">
            <Lock className="w-3 h-3" /> Unlocked {moment(candidate.unlockDate).fromNow()}
          </div>
          <ResumeButton resume={candidate.resume} name={candidate.name} />
        </div>
      </div>
    </div>
  )
}

// ─── Main Component ────────────────────────────────────────────────────────────
const UnlockedCandidate = () => {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { candidates, loading, total, totalPages, page } = useSelector(s => s.database)
  const { remainingCredits } = useSelector(s => s.creditDeduction)

  const [currentPage, setCurrentPage] = useState(1)
  const [isSelectionMode, setIsSelectionMode] = useState(false)
  const [selectedIds, setSelectedIds] = useState([])
  const [isExportLoading, setIsExportLoading] = useState(false)
  const [showConfirmModal, setShowConfirmModal] = useState(false)
  const [exportMode, setExportMode] = useState('selected')
  const [isBuyCreditsOpen, setIsBuyCreditsOpen] = useState(false)

  useEffect(() => {
    dispatch(getAllUnlockedCandidates({ page: currentPage, limit: 10 }))
    dispatch(fetchRemainingCredits())
    dispatch(fetchCreditStats())
  }, [dispatch, currentPage])

  const toggleSelect = useCallback((id) => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id])
  }, [])

  const handleExportClick = () => {
    if (selectedIds.length === 0) {
      toast.warn('Select at least one candidate to export.')
      return
    }
    setExportMode('selected')
    setShowConfirmModal(true)
  }

  const handleExportAll = () => {
    if (candidates.length === 0) {
      toast.warn('No candidates available to export.')
      return
    }
    setExportMode('all')
    setShowConfirmModal(true)
  }

  const handleConfirmExport = async () => {
    setIsExportLoading(true)
    setShowConfirmModal(false)
    try {
      const idsToExport = exportMode === 'all' ? [] : selectedIds
      await dispatch(exportCandidatesExcel(idsToExport)).unwrap()
      
      toast.success('🎉 Export successful! Candidates Excel downloaded.')
      setIsSelectionMode(false)
      setSelectedIds([])
      
      dispatch(fetchRemainingCredits())
      dispatch(fetchCreditStats())
    } catch (err) {
      toast.error(typeof err === 'string' ? err : 'Failed to export candidates.')
    } finally {
      setIsExportLoading(false)
    }
  }

  return (
    <div className="bg-gray-50 font-sans p-4">
      <ToastContainer position="top-right" theme="colored" autoClose={3000} />
      
      <ConfirmModal
        isOpen={showConfirmModal}
        title="Confirm Excel Export"
        message={
          exportMode === 'all'
            ? `Export all unlocked candidates to Excel? Costs 2 credits per candidate. Current balance: ${remainingCredits} credits.`
            : `Exporting ${selectedIds.length} candidate(s) will cost ${selectedIds.length * 2} credits. Current balance: ${remainingCredits} credits. Do you want to proceed?`
        }
        confirmLabel={isExportLoading ? "Processing..." : "Deduct & Download"}
        onConfirm={handleConfirmExport}
        onCancel={() => setShowConfirmModal(false)}
        isLoading={isExportLoading}
      />

      <div className="relative overflow-hidden px-6 pt-6 pb-10 rounded-2xl mb-8 text-white shadow-sm" style={{ background: 'linear-gradient(135deg, #7c3aed 0%, #a855f7 50%, #ec4899 100%)' }}>
        <div className="absolute -top-10 -right-10 w-48 h-48 rounded-full bg-white/10" />
        <div className="relative z-10">
          <p className="text-purple-200 text-sm mb-1">Database &rsaquo; Unlocked Candidates</p>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white">Unlocked Talent</h1>
              <p className="text-purple-200 text-sm mt-1">{total} candidates permanently accessible</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto pb-4">
        <div className="flex flex-col min-[900px]:flex-row gap-6 items-start">
          <div className="flex-1 min-w-0 max-w-full min-[900px]:max-w-2xl xl:max-w-3xl">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-20 bg-white rounded-2xl border border-gray-100">
                <Loader2 className="w-10 h-10 text-purple-600 animate-spin mb-4" />
                <p className="text-gray-400 font-medium text-xs font-bold uppercase tracking-widest">Fetching Pool...</p>
              </div>
            ) : candidates.length > 0 ? (
              <>
                {isSelectionMode && (
                  <div className="mb-4 flex justify-between items-center px-2">
                    <p className="text-xs font-bold text-gray-500 tracking-wider">SELECT CANDIDATES TO EXPORT</p>
                    <button onClick={() => setSelectedIds(candidates.map(c => c._id))} className="text-xs font-bold text-purple-600 hover:underline">
                      Select all on page
                    </button>
                  </div>
                )}
                {candidates.map(c => (
                  <CandidateCard 
                    key={c._id} 
                    candidate={c} 
                    isSelectionMode={isSelectionMode}
                    isSelected={selectedIds.includes(c._id)}
                    onSelect={toggleSelect}
                  />
                ))}

                {totalPages > 1 && (
                  <div className="flex items-center justify-between mt-6 bg-white rounded-xl border border-gray-100 shadow-sm px-5 py-4">
                    <p className="text-sm text-gray-500">
                      Showing <span className="font-bold text-gray-800">{(currentPage - 1) * 10 + 1}–{Math.min(currentPage * 10, total)}</span> of {total}
                    </p>
                    <Pagination
                      page={currentPage}
                      totalPages={totalPages}
                      onPageChange={(p) => { setCurrentPage(p); window.scrollTo({ top: 0, behavior: 'smooth' }) }}
                    />
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-gray-200">
                <Lock className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-bold text-gray-700">No unlocked candidates yet</h3>
              </div>
            )}
          </div>

          {/* Export & Credits Sidebar - Always visible, wider and properly proportioned */}
          <div className="w-full min-[900px]:w-80 lg:w-[330px] xl:w-[350px] flex-shrink-0 order-first min-[900px]:order-none">
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 sm:p-5 sticky top-4 space-y-4">
              
              {/* Select Candidate & Export Buttons - Side by Side in One Row */}
              <div className="space-y-2">
                <div className="flex gap-2">
                  <button 
                    type="button"
                    onClick={() => { setIsSelectionMode(!isSelectionMode); setSelectedIds([]); }}
                    className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl font-bold text-xs transition-all border ${isSelectionMode ? 'bg-purple-100 text-purple-700 border-purple-300 shadow-sm' : 'bg-white text-purple-600 border-purple-200 hover:bg-purple-50 hover:border-purple-300 shadow-sm'}`}
                  >
                    <MousePointer2 className="w-3.5 h-3.5 flex-shrink-0" />
                    <span className="truncate">{isSelectionMode ? `Cancel (${selectedIds.length})` : 'Select Candidate'}</span>
                  </button>
                  
                  {isSelectionMode ? (
                    <button
                      type="button"
                      onClick={handleExportClick}
                      disabled={selectedIds.length === 0 || isExportLoading}
                      className="flex-1 flex items-center justify-center gap-1.5 bg-gray-900 text-white px-3 py-2.5 rounded-xl font-bold text-xs hover:bg-black transition-all disabled:opacity-50 shadow-sm"
                    >
                      {isExportLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin flex-shrink-0" /> : <FileSpreadsheet className="w-3.5 h-3.5 flex-shrink-0" />}
                      <span className="truncate">Export Excel {selectedIds.length > 0 ? `(${selectedIds.length})` : ''}</span>
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={handleExportAll}
                      disabled={isExportLoading || candidates.length === 0}
                      className="flex-1 flex items-center justify-center gap-1.5 bg-gradient-to-r from-purple-600 to-pink-500 text-white px-3 py-2.5 rounded-xl font-bold text-xs hover:from-purple-700 hover:to-pink-600 transition-all disabled:opacity-50 shadow-sm"
                    >
                      {isExportLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin flex-shrink-0" /> : <Download className="w-3.5 h-3.5 flex-shrink-0" />}
                      <span className="truncate">Export ({candidates.length})</span>
                    </button>
                  )}
                </div>

                {isSelectionMode && (
                  <button
                    type="button"
                    onClick={handleExportAll}
                    disabled={isExportLoading || candidates.length === 0}
                    className="w-full flex items-center justify-center gap-1.5 text-purple-600 hover:text-purple-700 font-bold text-[11px] py-1 transition"
                  >
                    <Download className="w-3 h-3 flex-shrink-0" /> Or Export All ({candidates.length}) Candidates
                  </button>
                )}
              </div>

              {/* Database Credits Card & Cost Breakdown - Directly Below */}
              <div className="space-y-3">
                <div className="bg-purple-50 rounded-xl p-4 border border-purple-100">
                  <p className="text-xs font-bold text-purple-800 mb-1 flex items-center gap-1.5">
                    <FileSpreadsheet className="w-3.5 h-3.5" /> Database Credits
                  </p>
                  <div className="mt-2 flex items-baseline justify-between sm:block">
                    <p className="text-2xl font-black text-purple-700">{remainingCredits}</p>
                    <p className="text-[10px] text-purple-400 font-bold uppercase tracking-wider">Available Balance</p>
                  </div>
                  <button 
                    type="button"
                    onClick={() => setIsBuyCreditsOpen(true)}
                    className="w-full mt-3 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white py-2 rounded-lg text-xs font-bold transition shadow-sm"
                  >
                    Buy Credits
                  </button>
                </div>

                <div className="p-2 space-y-2">
                  <div className="flex justify-between text-[11px] font-bold text-gray-600">
                    <span>1 Profile Unlock</span>
                    <span className="text-gray-900">1 Credit</span>
                  </div>
                  <div className="flex justify-between text-[11px] font-bold text-gray-600">
                    <span>1 Excel Download</span>
                    <span className="text-gray-900">2 Credits</span>
                  </div>
                  <p className="text-[10px] text-gray-400 italic pt-2 border-t border-gray-100 leading-relaxed">
                    Excel exports cost 2 credits per candidate selected.
                  </p>
                </div>
              </div>
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

export default UnlockedCandidate