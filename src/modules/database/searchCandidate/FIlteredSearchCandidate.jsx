import React, { useState, useCallback, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import * as XLSX from 'xlsx'
import {
  ArrowLeft, Phone, MapPin, Briefcase,
  Lock, Loader2, ChevronLeft, ChevronRight,
  CheckCircle2, FileSpreadsheet, MousePointer2,
  Info, Download, Unlock,
  Mail,
  Eye,
  BookOpenText
} from 'lucide-react'

import { ToastContainer, toast } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import Pagination from '../../../components/common/Pagination'

import { searchCandidates, setPage, updateCandidateStatus } from '../../../redux/slices/database/databaseSlice'
import {
  unlockCandidateProfile,
  exportCandidatesExcel,
  deductBulkCredits,
  fetchRemainingCredits
} from '../../../redux/slices/candidateUnlock/creditDeductionSlice'
import ConfirmModal from '../../../components/common/ConfirmModal'
import BuyCreditsModal from '../../../components/common/BuyCreditsModal'
import { fetchCreditStats } from '../../../redux/slices/creditTransaction/creditAndTransactionSlice'
import { getActiveSubscription, getCompanyClassification, getFreeUnlocksRemaining } from '../../../utils/subscriptionPolicy'

// ─── Helper: safely format location object to string ──────────────────────────
const formatLocation = (loc) => {
  if (!loc) return 'N/A';
  if (typeof loc === 'string') return loc;

  // If it's the object with city/state
  if (typeof loc === 'object' && (loc.city || loc.state)) {
    const parts = [loc.city, loc.state].filter(Boolean);
    return parts.length > 0 ? parts.join(', ') : 'N/A';
  }

  // Fallback for unexpected objects (prevents white screen)
  return 'N/A';
};

// ─── Helper: build & trigger Excel download from candidate array ──────────────
const downloadExcel = (candidateList, filename = 'candidates_export.xlsx') => {
  if (!candidateList || candidateList.length === 0) {
    toast.warn('No candidate data to export.')
    return false
  }

  const rows = candidateList.map((c, idx) => ({
    'S.No': idx + 1,
    'Name': c.name || '',
    'Designation': c.designation || '',
    'Location': formatLocation(c.location), // Fixed for Excel
    'Phone': c.phone || '',
    'Email': c.email || '',
    'Experience': c.experience || '',
    'Skills': Array.isArray(c.skills) ? c.skills.join(', ') : (c.skills || ''),
    'Current CTC': c.currentCtc || '',
    'Expected CTC': c.expectedCtc || '',
    'Notice Period': c.noticePeriod || '',
  }))

  const worksheet = XLSX.utils.json_to_sheet(rows)
  const workbook = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Candidates')

  const colWidths = Object.keys(rows[0] || {}).map(key => ({
    wch: Math.max(key.length, ...rows.map(r => String(r[key] || '').length)) + 2
  }))
  worksheet['!cols'] = colWidths

  XLSX.writeFile(workbook, filename)
  return true
}

// ─── Candidate Card ───────────────────────────────────────────────────────────
const CandidateCard = ({ candidate, onUnlockClick, isSelectionMode, isSelected, onSelect }) => {
  const isLocked = candidate.isLocked
  const initial = candidate.name?.trim()?.[0]?.toUpperCase() || '?'
  const navigate = useNavigate()

  return (
    <div
      onClick={() => isSelectionMode && !isLocked && onSelect(candidate._id)}
      className={`relative bg-white rounded-2xl border transition-all duration-200 p-5
        ${isSelected ? 'border-purple-500 bg-purple-50/30' : 'border-gray-100 shadow-sm hover:border-purple-200'}
        ${isLocked ? 'bg-gray-50/40' : 'bg-white'}
        ${isSelectionMode && !isLocked ? 'cursor-pointer' : ''}
      `}
    >
      {/* Checkbox */}
      {isSelectionMode && !isLocked && (
        <div className="absolute top-5 right-5 z-10">
          <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all
            ${isSelected ? 'bg-purple-600 border-purple-600' : 'border-gray-300 bg-white'}`}>
            {isSelected && <CheckCircle2 className="w-3.5 h-3.5 text-white" />}
          </div>
        </div>
      )}

      <div className="flex items-center gap-4">
        {/* Avatar */}
        <div className={`w-14 h-14 rounded-xl flex items-center justify-center text-lg font-bold flex-shrink-0
          ${isLocked ? 'bg-gray-200 text-gray-400' : 'bg-purple-100 text-purple-700'}`}>
          {isLocked ? <Lock className="w-5 h-5" /> : initial}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 flex-wrap">
            <h3 className={`font-bold text-base ${isLocked ? 'blur-md select-none text-gray-400' : 'text-gray-800'}`}>
              {candidate.name}
            </h3>
            {isLocked && (
              <button
                onClick={(e) => { e.stopPropagation(); onUnlockClick(candidate) }}
                className="text-[10px] font-bold bg-purple-600 text-white px-3 py-1 rounded-lg hover:bg-purple-700 transition-colors flex items-center gap-1"
              >
                <Unlock className="w-3 h-3" /> Unlock Profile
              </button>
            )}
          </div>

          <div className={`flex flex-wrap gap-4 mt-1 text-xs text-gray-500 ${isLocked ? 'blur-[4px] opacity-40' : ''}`}>
            <span className="flex items-center gap-1"><Briefcase className="w-3 h-3" />{typeof candidate.designation === 'string' ? candidate.designation : candidate.designation?.name || 'N/A'}</span>
            <span className="flex items-center gap-1">
              <MapPin className="w-3 h-3" />
              {formatLocation(candidate.location)} {/* Fixed: Rendering string instead of object */}
            </span>
          </div>
          <div className={`flex flex-wrap gap-4 mt-1 text-xs text-gray-500 ${isLocked ? 'blur-[4px] opacity-40' : ''}`}>
            <span className="flex items-center gap-1"><Mail className="w-3 h-3" />{candidate.email || 'N/A'}</span>
            <span className="flex items-center gap-1"><BookOpenText className="w-3 h-3" />{candidate.education || 'N/A'}</span>
          </div>

          {!isLocked && candidate.mobile && (
            <div className="mt-2 text-xs text-purple-600 font-semibold flex items-center gap-1">
              <Phone className="w-3 h-3" /> {candidate.mobile}
            </div>
          )}
        </div>

        {/* View Contact */}
        {!isSelectionMode && (
          <button
            disabled={isLocked}
            onClick={() => navigate(`/database/search/filtered/${candidate._id}`)}
            className={`flex items-center cursor-pointer gap-2 px-4 py-2 text-xs font-bold rounded-xl transition-all flex-shrink-0
              ${isLocked ? 'bg-gray-100 text-gray-300 cursor-not-allowed' : 'bg-gray-900 text-white hover:bg-purple-600'}`}
          >
            <Eye className="w-3.5 h-3.5" /> {isLocked ? 'Locked' : 'View full profile'}
          </button>
        )}
      </div>
    </div>
  )
}

// ─── Main Component ───────────────────────────────────────────────────────────
const FilteredSearchCandidate = () => {
  const dispatch = useDispatch()
  const navigate = useNavigate()

  const { candidates, total, page, totalPages, loading, filters } = useSelector(s => s.database)
  const { remainingCredits, loading: creditLoading } = useSelector(s => s.creditDeduction)

  const [activeFilter, setActiveFilter] = useState('all')
  const [isSelectionMode, setIsSelectionMode] = useState(false)
  const [selectedIds, setSelectedIds] = useState([])
  const [modal, setModal] = useState({ isOpen: false, type: '', data: null })
  const [isActionLoading, setIsActionLoading] = useState(false)
  const [isBuyCreditsOpen, setIsBuyCreditsOpen] = useState(false)

  useEffect(() => {
    dispatch(fetchRemainingCredits());
    dispatch(fetchCreditStats());
    if (candidates.length === 0 && filters) {
      if (filters.category || filters.designation) {
        dispatch(searchCandidates(filters));
      }
    }
  }, [dispatch, candidates.length, filters]);

  // const displayed = candidates.filter(c => {
  //   if (activeFilter === 'unlocked') return !c.isLocked
  //   if (activeFilter === 'locked')   return  c.isLocked
  //   return true
  // })

  const displayed = candidates.filter(c => {
    if (activeFilter === 'unlocked') return !c.isLocked
    if (activeFilter === 'locked') return c.isLocked

    const type = filters?.searchTypeUI || 'any'

    if (type === 'fresher') {
      return !c.experience || c.experience === '' || c.experience === '0' || c.experience === 0 || c.experience === 'Fresher'
    }

    if (type === 'experienced') {
      return c.experience && c.experience !== '' && c.experience !== '0' && c.experience !== 0 && c.experience !== 'Fresher'
    }

    return true
  })

  const unlockedCandidates = candidates.filter(c => !c.isLocked)

  const toggleSelect = useCallback((id) => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id])
  }, [])

  const selectAllUnlocked = () =>
    setSelectedIds(displayed.filter(c => !c.isLocked).map(c => c._id))

  const exitSelectionMode = () => {
    setIsSelectionMode(false)
    setSelectedIds([])
  }

  const handlePageChange = (p) => {
    if (p < 1 || p > totalPages) return
    dispatch(setPage(p))
    dispatch(searchCandidates({ ...filters, page: p }))
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

 const handleUnlockConfirm = async () => {
    const candidate = modal.data
    setIsActionLoading(true)
    try {
      const companyClassification = getCompanyClassification()
      const isInternalCompany = companyClassification === 'internal'
      const isExternalCompany = companyClassification === 'external'
      const isPendingCompany = companyClassification === 'pending'
      const freeUnlocks = getFreeUnlocksRemaining()

      if (isPendingCompany) {
        toast.info('Your company is awaiting admin verification. Profile unlocks will be available after classification.')
        return
      }

      // Internal companies can unlock profiles without consuming database
      // credits. Keep the same UI state update as the free-unlock flow.
      if (isInternalCompany) {
        dispatch(updateCandidateStatus({ id: candidate._id, isLocked: false }))
        toast.success(`${candidate.name} unlocked successfully at no cost.`)
        return
      }

      if (isExternalCompany && freeUnlocks > 0) {
        localStorage.setItem('freeProfileUnlocksRemaining', String(freeUnlocks - 1))
        dispatch(updateCandidateStatus({ id: candidate._id, isLocked: false }))
        window.dispatchEvent(new Event('subscriptionPolicyUpdated'))
        toast.success(`${candidate.name} unlocked using a complimentary profile unlock. ${freeUnlocks - 1} remaining.`)
        return
      }

      if (isExternalCompany && !getActiveSubscription()) {
        toast.info('Your 3 complimentary profile unlocks have been used. Please choose a subscription plan to continue.')
        navigate('/plan/subscription')
        return
      }

      const result = await dispatch(unlockCandidateProfile(candidate._id)).unwrap();
      if(result){
        await dispatch(fetchCreditStats());
      }
      dispatch(updateCandidateStatus({
        id: candidate._id,
        isLocked: false,
        ...(result.candidate || result.candidateData || {}),
      }))
      toast.success(`✅ ${candidate.name} unlocked! Balance: ${result.remainingCredits} credit(s).`)
    } catch (err) {
      toast.error(`❌ ${typeof err === 'string' ? err : 'Failed to unlock profile.'}`)
    } finally {
      setIsActionLoading(false)
      setModal({ isOpen: false, type: '', data: null })
    }
  }


  const handleExportConfirm = async () => {
    const ids = modal.data?.ids || selectedIds
    if (!ids.length) { toast.warn('No candidates selected.'); return }

    setIsActionLoading(true)
    try {
      await dispatch(exportCandidatesExcel(ids)).unwrap()
      dispatch(fetchCreditStats())
      toast.success('✅ Export successful! Candidates Excel downloaded.')
      exitSelectionMode()
    } catch (err) {
      toast.error(`❌ ${typeof err === 'string' ? err : 'Export failed.'}`)
    } finally {
      setIsActionLoading(false)
      setModal({ isOpen: false, type: '', data: null })
    }
  }

  const handleExportAll = () => {
    if (unlockedCandidates.length === 0) {
      toast.warn('No unlocked candidates to export. Unlock profiles first.')
      return
    }
    setModal({
      isOpen: true,
      type: 'export',
      data: { ids: unlockedCandidates.map(c => c._id), count: unlockedCandidates.length },
    })
  }

  const handleExportSelected = () => {
    if (!selectedIds.length) {
      toast.warn('Select at least one unlocked candidate first.')
      return
    }
    setModal({
      isOpen: true,
      type: 'export',
      data: { ids: selectedIds, count: selectedIds.length },
    })
  }

  const handleModalConfirm = () => {
    if (modal.type === 'single') handleUnlockConfirm()
    else if (modal.type === 'export') handleExportConfirm()
  }

  const isInternalCompany = getCompanyClassification() === 'internal'

  const getModalConfig = () => {
    if (modal.type === 'single') return {
      title: 'Unlock Profile',
      message: isInternalCompany
        ? `Unlock ${modal.data?.name}'s full profile? Internal companies can unlock profiles at no cost.`
        : `Unlock ${modal.data?.name}'s full profile? Costs 1 credit. Current balance: ${remainingCredits} credit(s).`,
    }
    if (modal.type === 'export') {
      const cost = (modal.data?.count || 0) * 2
      return {
        title: 'Export Candidates',
        message: `Export ${modal.data?.count} candidate(s) to Excel? Costs ${cost} credits. Current balance: ${remainingCredits} credit(s).`,
      }
    }
    return { title: '', message: '' }
  }

  const modalConfig = getModalConfig()
  const isLowBalance = remainingCredits < 5

  return (
    <div className="min-h-screen bg-white rounded-xl overflow-hidden font-sans">
      <ToastContainer position="top-right" theme="colored" autoClose={4000} />

      <ConfirmModal
        isOpen={modal.isOpen}
        title={modalConfig.title}
        message={modalConfig.message}
        confirmLabel={isActionLoading ? 'Processing...' : 'Confirm'}
        isLoading={isActionLoading}
        onConfirm={handleModalConfirm}
        onCancel={() => !isActionLoading && setModal({ isOpen: false, type: '', data: null })}
      />

      <div className="bg-purple-600 p-8 relative overflow-hidden m-4 rounded-2xl">
        <div className="flex items-center gap-2 text-purple-200 text-[10px] font-bold mb-1">
          <button onClick={() => navigate(-1)} className="hover:text-white transition-colors">
            <ArrowLeft className="w-4 h-4" />
          </button>
          <span className="w-0.5 h-3 bg-pink-400 rounded-full" />
          Back
        </div>
        <h1 className="text-white text-2xl font-extrabold">Search Results</h1>
        <p className="text-purple-100/80 text-xs mt-0.5">
          {total > 0 ? `${total} verified professionals found` : 'Find the right talent from our database'}
        </p>
        <div className="absolute -right-4 -top-4 w-32 h-32 rounded-full bg-white/5" />
      </div>

      <div className="p-6 max-w-9xl mx-auto">
        <div className="flex flex-col lg:flex-row gap-6">
          <div className="flex-1">
            <div className="flex items-center justify-between mb-6 bg-gray-50 p-2 rounded-2xl border border-gray-100">
              <div className="flex gap-1">
                {['all', 'unlocked', 'locked'].map(btn => (
                  <button
                    key={btn}
                    onClick={() => setActiveFilter(btn)}
                    className={`px-5 py-2 rounded-xl text-xs font-bold capitalize transition-all
                      ${activeFilter === btn ? 'bg-white text-purple-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                  >
                    {btn}
                  </button>
                ))}
              </div>

              <div className="flex gap-2 flex-wrap">
                <button
                  onClick={() => isSelectionMode ? exitSelectionMode() : setIsSelectionMode(true)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-[11px] transition-all border
                    ${isSelectionMode
                      ? 'bg-purple-50 border-purple-200 text-purple-600'
                      : 'bg-white border-gray-200 text-gray-600'}`}
                >
                  <MousePointer2 className="w-3.5 h-3.5" />
                  {isSelectionMode ? `Cancel (${selectedIds.length})` : 'Select Mode'}
                </button>

                {isSelectionMode ? (
                  <button
                    onClick={handleExportSelected}
                    disabled={selectedIds.length === 0 || isActionLoading}
                    className="flex items-center gap-2 bg-purple-600 text-white px-4 py-2 rounded-xl font-bold text-[11px] hover:bg-purple-700 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    <Download className="w-3.5 h-3.5" /> Export ({selectedIds.length})
                  </button>
                ) : (
                  <button
                    onClick={handleExportAll}
                    disabled={isActionLoading}
                    className="flex items-center gap-2 bg-gray-900 text-white px-4 py-2 rounded-xl font-bold text-[11px] hover:bg-purple-600 transition-all disabled:opacity-40"
                  >
                    <FileSpreadsheet className="w-3.5 h-3.5" /> Export All
                  </button>
                )}
              </div>
            </div>

            {loading ? (
              <div className="py-20 text-center">
                <Loader2 className="w-8 h-8 animate-spin mx-auto text-purple-500 mb-2" />
                <p className="text-gray-400 text-xs font-bold">Loading Results...</p>
              </div>
            ) : displayed.length === 0 ? (
              <div className="py-20 text-center">
                <p className="text-gray-400 text-sm font-semibold">No candidates found.</p>
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between mb-4 px-2">
                  <p className="text-xs font-bold text-gray-500 tracking-wider">
                    Showing {displayed.length} of {total} candidates
                  </p>
                  {isSelectionMode && (
                    <button onClick={selectAllUnlocked} className="text-xs font-bold text-purple-600 hover:underline">
                      Select All Unlocked ({displayed.filter(c => !c.isLocked).length})
                    </button>
                  )}
                </div>

                <div className="space-y-4">
                  {displayed.map(c => (
                    <CandidateCard
                      key={c._id}
                      candidate={c}
                      isSelectionMode={isSelectionMode}
                      isSelected={selectedIds.includes(c._id)}
                      onSelect={toggleSelect}
                      onUnlockClick={cand => setModal({ isOpen: true, type: 'single', data: cand })}
                    />
                  ))}
                </div>

                {totalPages > 1 && (
                  <div className="flex justify-between items-center gap-3 mt-8">
                    <p className="text-center text-[10px] text-gray-400 font-bold mt-3">Page {page} of {totalPages}</p>
                    <Pagination page={page} totalPages={totalPages} onPageChange={handlePageChange} />
                  </div>
                )}
              </>
            )}
          </div>

          <div className="w-full lg:w-72 space-y-4">
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="px-4 py-3 border-b border-gray-50 flex items-center gap-2">
                <span className="w-6 h-6 rounded-lg bg-purple-100 flex items-center justify-center">
                  <Lock className="w-3.5 h-3.5 text-purple-600" />
                </span>
                <h3 className="text-xs font-bold text-gray-700">Database Credits</h3>
              </div>

              <div className="p-4">
                <div className="bg-gray-50 rounded-xl p-3 mb-4">
                  <p className="text-[10px] text-gray-400 font-bold tracking-wider mb-1">Available Credits</p>
                  {creditLoading ? (
                    <div className="h-8 w-16 bg-gray-200 animate-pulse rounded-lg mt-1" />
                  ) : (
                    <>
                      <p className={`text-2xl font-black ${isLowBalance ? 'text-red-500' : 'text-gray-800'}`}>
                        {remainingCredits}
                      </p>
                      {isLowBalance && (
                        <p className="text-[9px] text-red-400 font-bold mt-1">⚠ Low balance</p>
                      )}
                    </>
                  )}
                </div>

                <div className="space-y-2 mb-4">
                  <div className="flex justify-between text-[11px] text-gray-500 bg-gray-50/50 p-2 rounded-lg">
                    <span>1 Profile Unlock</span>
                    <span className="font-bold text-gray-700">1 Credit</span>
                  </div>
                  <div className="flex justify-between text-[11px] text-gray-500 bg-gray-50/50 p-2 rounded-lg">
                    <span>1 Excel Download</span>
                    <span className="font-bold text-gray-700">2 Credits</span>
                  </div>
                </div>

                {isSelectionMode && selectedIds.length > 0 && (
                  <div className="mb-4 bg-purple-50 border border-purple-100 rounded-xl p-3">
                    <p className="text-[10px] text-purple-600 font-bold mb-1">Export Preview</p>
                    <p className="text-xs text-gray-700">
                      <span className="font-black">{selectedIds.length}</span> selected ·{' '}
                      <span className="font-black text-purple-600">{selectedIds.length * 2}</span> credits
                    </p>
                    {remainingCredits < selectedIds.length * 2 && (
                      <p className="text-[9px] text-red-400 font-bold mt-1">
                        ⚠ Insufficient credits for this export
                      </p>
                    )}
                  </div>
                )}

                <button
                  type="button"
                  onClick={() => setIsBuyCreditsOpen(true)}
                  className="w-full cursor-pointer bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white py-2.5 rounded-xl font-bold text-xs transition-all shadow-sm"
                >
                  Buy Credits
                </button>
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-gray-100 p-4">
              <div className="flex items-center gap-2 mb-3">
                <Info className="w-4 h-4 text-purple-400" />
                <h4 className="text-xs font-bold text-gray-700">Usage Info</h4>
              </div>
              <p className="text-[10px] text-gray-400 leading-relaxed">
                Unlocked profiles reveal full contact details permanently. Excel exports cost 2 credits per candidate selected.
              </p>
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

export default FilteredSearchCandidate
