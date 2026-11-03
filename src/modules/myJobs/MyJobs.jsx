import React, { useState, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import {
  ChevronDown, Plus,
  CheckCircle2, XCircle, Users,
  Pencil, Trash2, AlertTriangle,
  Briefcase, Calendar, Award, Filter, Search,
  Eye, RotateCcw, PauseCircle, Loader2
} from 'lucide-react'
import Pagination from '../../components/common/Pagination'
import { getAllJobs, deleteJob, changeJobStatus, getJobStatusCounts } from '../../redux/slices/companyJobs/jobSlice'
import RepublishJobModal from './RepublishJobModal'

// ─── Delete Confirmation Modal ────────────────────────────────────────────────
const DeleteModal = ({ jobTitle, onConfirm, onCancel, isDeleting }) => (
  <div className="fixed inset-0 z-[100] flex items-center justify-center">
    <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onCancel} />
    <div className="relative bg-white rounded-2xl shadow-2xl p-6 w-full max-w-sm mx-4">
      <div className="flex flex-col items-center text-center gap-3">
        <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
          <AlertTriangle className="w-6 h-6 text-red-500" />
        </div>
        <h3 className="text-lg font-semibold text-gray-800">Delete Job Post?</h3>
        <p className="text-sm text-gray-500">
          Are you sure you want to delete{' '}
          <span className="font-semibold text-gray-700">"{jobTitle}"</span>?
        </p>
      </div>
      <div className="flex gap-3 mt-6">
        <button
          onClick={onCancel}
          disabled={isDeleting}
          className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm font-semibold text-gray-600 hover:bg-gray-50"
        >
          Cancel
        </button>
        <button
          onClick={onConfirm}
          disabled={isDeleting}
          className="flex-1 py-2.5 rounded-xl bg-red-500 hover:bg-red-600 text-white text-sm font-semibold flex items-center justify-center gap-2"
        >
          {isDeleting ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Deleting...
            </>
          ) : (
            <><Trash2 className="w-4 h-4" /> Delete</>
          )}
        </button>
      </div>
    </div>
  </div>
)

// ─── Status Selector ─────────────────────────────────────────────────────────
const JobStatusSelector = ({ job, onStatusChange, isUpdating }) => {
  const rawStatus = (job?.status || '').toLowerCase()
  const currentVal = rawStatus === 'paused' ? 'Paused' : (rawStatus === 'closed' || rawStatus === 'expired') ? 'Closed' : 'Active'

  return (
    <div className="relative inline-flex items-center">
      {isUpdating ? (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-purple-50 text-purple-700 border border-purple-200">
          <Loader2 className="w-3 h-3 animate-spin text-purple-600" />
          Updating...
        </span>
      ) : (
        <div className="relative">
          <select
            value={currentVal}
            onChange={(e) => onStatusChange(job._id, e.target.value)}
            className={`text-xs font-semibold pl-2.5 pr-6 py-1 rounded-full capitalize appearance-none cursor-pointer border transition focus:outline-none focus:ring-1 focus:ring-purple-400 ${
              currentVal === 'Active'
                ? 'bg-green-50 text-green-700 border-green-200 hover:bg-green-100'
                : currentVal === 'Paused'
                ? 'bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100'
                : 'bg-red-50 text-red-700 border-red-200 hover:bg-red-100'
            }`}
          >
            <option value="Active">Active</option>
            <option value="Paused">Paused</option>
            <option value="Closed">Closed</option>
          </select>
          <ChevronDown className="w-3 h-3 absolute right-1.5 top-1/2 -translate-y-1/2 pointer-events-none text-gray-500" />
        </div>
      )}
    </div>
  )
}

// ─── Stats Card ───────────────────────────────────────────────────────────────
// const StatsCard = ({ title, value, icon: Icon, color }) => (
//   <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
//     <div className="flex items-start justify-between">
//       <div>
//         <p className="text-sm text-gray-500 font-medium mb-1">{title}</p>
//         <p className="text-2xl font-bold text-gray-900">{value}</p>
//       </div>
//       <div className={`p-3 rounded-xl bg-gradient-to-br ${color}`}>
//         <Icon className="w-5 h-5 text-white" />
//       </div>
//     </div>
//   </div>
// )

// ─── Main Component ───────────────────────────────────────────────────────────
const MyJobs = () => {
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const {
    jobs, loading, deleteLoading, error,
    totalPages, totalJobs, statusCounts
  } = useSelector(state => state.job)

  const [page, setPage] = useState(1)
  const [limit, setLimit] = useState(10)
  const [filterOpen, setFilterOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [deleteModal, setDeleteModal] = useState(null)
  const [republishModal, setRepublishModal] = useState(null)
  const [updatingJobId, setUpdatingJobId] = useState(null)
  const [filterType, setFilterType] = useState('all')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [sort, setSort] = useState('newest')

  // ── Debounce search input ────────────────────────────────────────────────
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchTerm)
    }, 400)
    return () => clearTimeout(handler)
  }, [searchTerm])

  // ── Fetch jobs and status counts ─────────────────────────────────────────
  useEffect(() => {
    dispatch(getAllJobs({
      page,
      limit,
      status: filterType,
      search: debouncedSearch,
      sort,
    }))
    dispatch(getJobStatusCounts())
  }, [dispatch, page, limit, filterType, debouncedSearch, sort])

  // ── Reset to page 1 on search / filter / limit / sort change ─────────────
  useEffect(() => {
    setPage(1)
  }, [debouncedSearch, filterType, limit, sort])

  useEffect(() => {
    if (error) toast.error(error)
  }, [error])

  // ── Job Status Change Handler ────────────────────────────────────────────
  const handleJobStatusChange = async (jobId, newStatus) => {
    setUpdatingJobId(jobId)
    try {
      const res = await dispatch(changeJobStatus({ jobId, status: newStatus }))
      if (changeJobStatus.fulfilled.match(res)) {
        toast.success(res.payload?.message || `Job status changed to ${newStatus}`)
      } else {
        toast.error(res.payload || 'Failed to update job status')
      }
    } catch (e) {
      toast.error('Failed to change job status')
    } finally {
      setUpdatingJobId(null)
    }
  }

  // ── Delete handlers ──────────────────────────────────────────────────────
  const handleDeleteClick = (jobId, jobTitle) => setDeleteModal({ jobId, jobTitle })

  const handleDeleteConfirm = async () => {
    if (!deleteModal) return
    const result = await dispatch(deleteJob(deleteModal.jobId))
    if (deleteJob.fulfilled.match(result)) {
      toast.success('Job deleted successfully')
      setDeleteModal(null)
      dispatch(getJobStatusCounts())
      const remainingOnPage = (jobs?.length || 0) - 1
      if (remainingOnPage === 0 && page > 1) {
        setPage(p => p - 1)
      } else {
        dispatch(getAllJobs({
          page,
          limit,
          status: filterType,
          search: debouncedSearch,
          sort,
        }))
      }
    } else {
      toast.error(result.payload || 'Failed to delete job')
      setDeleteModal(null)
    }
  }

  // ── Stats ────────────────────────────────────────────────────────────────
  const activeJobs = jobs?.filter(j => j.status === 'active').length || 0
  const totalApplications = jobs?.reduce((sum, j) => sum + (j.applicantCount || 0), 0) || 0
  const totalMatches = jobs?.reduce((sum, j) => sum + (j.dbMatchCount || 0), 0) || 0

  const displayJobs = jobs || []
  const totalEntries = totalJobs || 0
  const effectiveTotalPages = totalPages || 1

  const startEntry = totalEntries > 0 ? (page - 1) * limit + 1 : 0
  const endEntry = Math.min((page - 1) * limit + displayJobs.length, totalEntries)

  const handlePageChange = (newPage) => {
    if (newPage < 1 || newPage > effectiveTotalPages) return
    setPage(newPage)
  }

  const getPageNumbers = () => {
    const pages = []
    const maxVisible = 5
    let start = Math.max(1, page - Math.floor(maxVisible / 2))
    let end = Math.min(effectiveTotalPages, start + maxVisible - 1)
    if (end - start + 1 < maxVisible) start = Math.max(1, end - maxVisible + 1)
    for (let i = start; i <= end; i++) pages.push(i)
    return pages
  }

  // ── Loading skeleton ──────────────────────────────────────────────────────
  if (loading && !jobs?.length) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-purple-600 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700;800&display=swap');
      `}</style>

      {deleteModal && (
        <DeleteModal
          jobTitle={deleteModal.jobTitle}
          onConfirm={handleDeleteConfirm}
          onCancel={() => setDeleteModal(null)}
          isDeleting={deleteLoading}
        />
      )}

      {republishModal && (
        <RepublishJobModal
          job={republishModal}
          onClose={() => setRepublishModal(null)}
          onSuccess={() => {
            dispatch(getAllJobs({
              page,
              limit,
              status: filterType,
              search: debouncedSearch,
              sort,
            }));
            dispatch(getJobStatusCounts());
          }}
        />
      )}

      <div
        className="bg-gradient-to-br from-purple-200/30 via-white to-purple-200/30"
        style={{ fontFamily: "'Poppins', sans-serif" }}
      >
        <div className="max-w-9xl mx-auto p-3 sm:p-5 bg-white rounded-xl">

          {/* Hero Header */}
          <div className="relative mb-6 sm:mb-8 overflow-hidden rounded-2xl bg-gradient-to-r from-purple-700 via-purple-600 to-pink-600 p-4 sm:p-6 md:p-8">
            <div className="relative z-10">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-1 h-6 bg-white rounded-full" />
                <span className="text-white/80 text-sm font-medium">My Jobs</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">My Job Postings</h1>
              <p className="text-white/80 text-sm max-w-md">
                Track and manage all your job listings, view applications, and find the perfect candidates.
              </p>
            </div>
          </div>

          {/* Stats Cards */}
          {/* <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <StatsCard title="Total Jobs"         value={totalJobs}         icon={Briefcase}    color="from-purple-500 to-purple-600" />
            <StatsCard title="Active Jobs"        value={activeJobs}        icon={CheckCircle2} color="from-green-500 to-green-600"   />
            <StatsCard title="Applications"       value={totalApplications} icon={Users}        color="from-blue-500 to-blue-600"     />
            <StatsCard title="Candidates Matched" value={totalMatches}      icon={Award}        color="from-orange-500 to-orange-600" />
          </div> */}

          {/* Actions Bar */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
            <div className="flex items-center gap-3 flex-wrap">

              {/* Filter dropdown */}
              <div className="relative flex-1 sm:flex-initial">
                <button
                  onClick={() => setFilterOpen(!filterOpen)}
                  className="w-full sm:w-auto flex items-center justify-between sm:justify-start gap-2 px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  <Filter className="w-4 h-4 text-gray-400 flex-shrink-0" />
                  <span className="truncate">
                    {filterType === 'all' && `All Jobs (${statusCounts?.all ?? statusCounts?.total ?? totalEntries})`}
                    {filterType === 'Active' && `Active Jobs (${statusCounts?.active ?? statusCounts?.Active ?? totalEntries})`}
                    {filterType === 'Paused' && `Paused Jobs (${statusCounts?.paused ?? statusCounts?.Paused ?? totalEntries})`}
                    {filterType === 'Closed' && `Closed Jobs (${statusCounts?.closed ?? statusCounts?.Closed ?? totalEntries})`}
                  </span>
                  <ChevronDown className="w-4 h-4 text-gray-700 flex-shrink-0 ml-auto sm:ml-0" />
                </button>
                {filterOpen && (
                  <div className="absolute left-0 top-12 z-50 bg-white rounded-xl shadow-lg border border-gray-100 py-2 w-48">
                    {[
                      ['all', 'All Jobs', statusCounts?.all ?? statusCounts?.total ?? totalEntries],
                      ['Active', 'Active Jobs', statusCounts?.active ?? statusCounts?.Active],
                      ['Paused', 'Paused Jobs', statusCounts?.paused ?? statusCounts?.Paused],
                      ['Closed', 'Closed Jobs', statusCounts?.closed ?? statusCounts?.Closed],
                    ].map(([val, label, count]) => (
                      <button
                        key={val}
                        onClick={() => { setFilterType(val); setFilterOpen(false) }}
                        className={`w-full flex items-center justify-between px-4 py-2.5 text-sm hover:bg-purple-50 ${
                          filterType === val ? 'text-purple-600 font-semibold bg-purple-50/50' : 'text-gray-700'
                        }`}
                      >
                        <span>{label}</span>
                        {count !== undefined && count !== null && (
                          <span className={`text-xs px-2 py-0.5 rounded-full ${
                            filterType === val ? 'bg-purple-100 text-purple-700 font-bold' : 'bg-gray-100 text-gray-500'
                          }`}>
                            {count}
                          </span>
                        )}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Search */}
              <div className="relative flex-1 sm:flex-initial min-w-[200px]">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search jobs..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full sm:w-56 pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500"
                />
              </div>

              {/* Sort by */}
              <div className="flex items-center gap-2">
                <span className="text-xs sm:text-sm text-gray-500 whitespace-nowrap">Sort:</span>
                <select
                  value={sort}
                  onChange={(e) => setSort(e.target.value)}
                  className="px-2.5 sm:px-3 py-2 sm:py-2.5 border border-gray-200 rounded-xl text-xs sm:text-sm text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 cursor-pointer"
                >
                  <option value="newest">Newest</option>
                  <option value="oldest">Oldest</option>
                </select>
              </div>

              {/* Rows per page */}
              <div className="flex items-center gap-2">
                <span className="text-xs sm:text-sm text-gray-500 whitespace-nowrap">Rows:</span>
                <select
                  value={limit}
                  onChange={(e) => setLimit(Number(e.target.value))}
                  className="px-2.5 sm:px-3 py-2 sm:py-2.5 border border-gray-200 rounded-xl text-xs sm:text-sm text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 cursor-pointer"
                >
                  {[5, 10, 20, 50].map(n => (
                    <option key={n} value={n}>{n}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Post Job Button */}
            <button
              onClick={() => navigate('/my-job/add')}
              className="w-full sm:w-auto flex items-center justify-center gap-2 bg-purple-600 hover:bg-purple-700 text-white px-5 py-2.5 rounded-xl text-sm font-semibold transition shadow-md whitespace-nowrap"
            >
              <Plus className="w-4 h-4" /> Post a New Job
            </button>
          </div>

          {/* Jobs Table */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            {loading ? (
              <div className="flex justify-center py-20">
                <div className="w-10 h-10 border-4 border-purple-600 border-t-transparent rounded-full animate-spin" />
              </div>
            ) : displayJobs.length === 0 ? (
              <div className="text-center py-16">
                <div className="w-20 h-20 bg-purple-50 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Briefcase className="w-10 h-10 text-purple-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-700 mb-2">No jobs found</h3>
                <button
                  onClick={() => navigate('/my-job/add')}
                  className="mt-4 px-5 py-2.5 bg-purple-600 text-white rounded-xl text-sm font-semibold"
                >
                  Post a Job
                </button>
              </div>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <table className="w-full table-fixed">
                    <colgroup>
                      <col style={{ width: '56px' }} />
                      <col style={{ width: '28%' }} />
                      <col style={{ width: '130px' }} />
                      <col style={{ width: '120px' }} />
                      <col style={{ width: '130px' }} />
                      <col style={{ width: '145px' }} />
                    </colgroup>
                    <thead>
                      <tr className="bg-gray-50 border-b border-gray-100">
                        <th className="text-left px-5 py-4 text-xs font-semibold text-gray-600">Sr No.</th>
                        <th className="text-left px-5 py-4 text-xs font-semibold text-gray-600">Job Details</th>
                        <th className="text-left px-5 py-4 text-xs font-semibold text-gray-600">Status</th>
                        <th className="text-left px-5 py-4 text-xs font-semibold text-gray-600">Applicants</th>
                        <th className="text-left px-5 py-4 text-xs font-semibold text-gray-600">Matches</th>
                        <th className="px-5 py-4 text-xs font-semibold text-gray-600 text-center">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {displayJobs.map((job, index) => (
                        <tr key={job._id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                          <td className="px-5 py-4 text-sm text-gray-400 font-medium whitespace-nowrap">
                            {(page - 1) * limit + index + 1}
                          </td>
                          <td className="px-5 py-4 min-w-0">
                            <p
                              className="text-sm font-semibold text-gray-900 truncate"
                              title={job.jobTitle}
                            >
                              {job.jobTitle}
                            </p>
                            <div className="flex items-center gap-3 mt-1 flex-wrap">
                              <span className="text-xs text-gray-500 flex items-center gap-1 whitespace-nowrap">
                                <Briefcase className="w-3 h-3 flex-shrink-0" />
                                {job.jobType || 'Full-time'}
                              </span>
                              <span className="text-xs text-gray-500 flex items-center gap-1 whitespace-nowrap">
                                <Calendar className="w-3 h-3 flex-shrink-0" />
                                {job.advanceInformation?.expireDate
                                  ? new Date(job.advanceInformation.expireDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
                                  : job.expireDate || 'N/A'
                                }
                              </span>
                            </div>
                          </td>
                          <td className="px-5 py-4">
                            <JobStatusSelector
                              job={job}
                              onStatusChange={handleJobStatusChange}
                              isUpdating={updatingJobId === job._id}
                            />
                          </td>
                          <td className="px-5 py-4">
                            <button
                              onClick={() => navigate(`/my-job/applicant/${job._id}`)}
                              className="flex items-center gap-2 text-sm text-purple-600 hover:text-purple-700 font-medium"
                            >
                              <Users className="w-4 h-4" />
                              {job.applicantCount ?? 0} Applied
                            </button>
                          </td>
                          <td className="px-5 py-4">
                            <button
                              onClick={() => navigate(`/my-job/dbmatch/${job._id}`)}
                              className="flex items-center gap-2 text-sm text-gray-600 hover:text-purple-600"
                            >
                              <Award className="w-4 h-4" />
                              {job.matchedCandidates ?? 0} Candidates
                            </button>
                          </td>
                          <td className="px-5 py-4">
                            <div className="flex items-center justify-center gap-2">
                              <button
                                onClick={() =>
                                  navigate(`/my-job/detail/${job._id}`, {
                                    state: {
                                      applicantCount: job.applicantCount ?? 0,
                                      matchedCount: job.matchedCandidates ?? job.dbMatchCount ?? 0,
                                    },
                                  })
                                }
                                className="px-2 py-1.5 rounded-lg bg-purple-50 text-purple-600 hover:bg-purple-100"
                                title="View"
                              >
                                <Eye className="w-4 h-4 cursor-pointer" />
                              </button>
                              <button
                                onClick={() => navigate(`/my-job/edit/${job._id}`)}
                                className="px-2 py-1.5 rounded-lg bg-purple-50 hover:bg-purple-100"
                                title="Edit"
                              >
                                <Pencil className="w-4 h-4 text-gray-400 cursor-pointer" />
                              </button>
                              <button
                                onClick={() => setRepublishModal(job)}
                                className="px-2 py-1.5 rounded-lg bg-pink-50 text-pink-600 hover:bg-pink-100 transition"
                                title="Republish / Renew Expiration"
                              >
                                <RotateCcw className="w-4 h-4 cursor-pointer" />
                              </button>
                              <button
                                onClick={() => handleDeleteClick(job._id, job.jobTitle)}
                                className="px-2 py-1.5 rounded-lg bg-purple-50 hover:bg-red-50"
                                title="Delete"
                              >
                                <Trash2 className="w-4 h-4 text-red-400 cursor-pointer" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* ── Pagination ── */}
                <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-5 py-4 border-t border-gray-100">
                  {/* Page info & Total Entries */}
                  <p className="text-xs text-gray-500">
                    Showing <span className="font-semibold text-gray-700">{startEntry}</span> to{' '}
                    <span className="font-semibold text-gray-700">{endEntry}</span> of{' '}
                    <span className="font-semibold text-purple-600 font-bold">{totalEntries}</span> total entries
                    <span className="ml-2 text-gray-400 font-normal">
                      (Page <span className="font-semibold text-gray-600">{page}</span> of <span className="font-semibold text-gray-600">{effectiveTotalPages}</span>)
                    </span>
                  </p>

                  {/* Page buttons */}
                  <Pagination page={page} totalPages={effectiveTotalPages} onPageChange={handlePageChange} maxVisible={5} />
                </div>
              </>
            )}
          </div>

          {/* Footer */}
          <div className="text-center pt-8 pb-4 border-t border-gray-100 mt-6">
            <p className="text-xs text-gray-400">© 2025 MyJob – Technokrate Hire. All rights reserved.</p>
          </div>

        </div>
      </div>
    </>
  )
}

export default MyJobs
