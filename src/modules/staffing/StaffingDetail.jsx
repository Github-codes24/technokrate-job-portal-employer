import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import {
  ArrowLeft, Building2, Plus, Briefcase, Search, Filter, Trash2,
  Edit3, ChevronDown, ChevronUp, MapPin, Calendar, DollarSign,
  Clock, ShieldAlert, CheckCircle2, AlertCircle, X
} from 'lucide-react';
import Pagination from '../../components/common/Pagination';
import {
  getSingleStaffing,
  listCompanies,
  getCompanyStats,
  addCompany,
  updateCompanyStatus,
  updateCompany,
  deleteCompany,
  getCompanyJobs,
  addCompanyJob,
  updateCompanyJob,
  deleteCompanyJob,
} from '../../redux/slices/staffing/staffingSlice';

const StaffingDetail = () => {
  const { staffingId } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const {
    selectedStaffing,
    companies,
    companyStats,
    companyPagination,
    companyJobs,
    loading,
  } = useSelector((state) => state.staffing);

  // Search & Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  // Modals
  const [showAddCompanyModal, setShowAddCompanyModal] = useState(false);
  const [editingCompany, setEditingCompany] = useState(null);
  const [deletingCompanyId, setDeletingCompanyId] = useState(null);

  // Expanded Company for Jobs
  const [expandedCompanyId, setExpandedCompanyId] = useState(null);
  const [showAddJobModal, setShowAddJobModal] = useState(false);
  const [editingJob, setEditingJob] = useState(null);
  const [deletingJobId, setDeletingJobId] = useState(null);

  // Forms
  const [companyForm, setCompanyForm] = useState({
    companyName: '',
    employerName: '',
    email: '',
    mobile: '',
    state: '',
    city: '',
    budget: '',
    paymentTimeline: '10 Days',
    status: 'Pending',
    sector: 'Information Technology',
  });

  const [jobForm, setJobForm] = useState({
    designation: '',
    category: 'IT',
    numberOfVacancies: 1,
    technologies: '',
    workMode: 'Hybrid',
    experience: '1-3 Years',
    salary: '10 LPA',
    state: '',
    city: '',
    noticePeriod: '30 Days',
    deadline: '',
    earningDeadline: '',
    jobDescription: '',
    workLocationAddress: '',
    status: 'Pending',
  });

  const fetchStaffingAndCompanies = () => {
    if (!staffingId) return;
    dispatch(getSingleStaffing(staffingId));
    dispatch(getCompanyStats(staffingId));
    dispatch(
      listCompanies({
        staffingId,
        params: {
          page: currentPage,
          limit: 10,
          search: searchTerm,
          status: statusFilter,
        },
      })
    );
  };

  useEffect(() => {
    fetchStaffingAndCompanies();
  }, [dispatch, staffingId, currentPage, searchTerm, statusFilter]);

  // Load jobs when expanding a company
  const toggleExpandCompany = (companyId) => {
    if (expandedCompanyId === companyId) {
      setExpandedCompanyId(null);
    } else {
      setExpandedCompanyId(companyId);
      dispatch(getCompanyJobs(companyId));
    }
  };

  // Company CRUD Handlers
  const handleAddCompanySubmit = async (e) => {
    e.preventDefault();
    const res = await dispatch(addCompany({ staffingId, data: companyForm }));
    if (!res.error) {
      toast.success('Company onboarded successfully');
      setShowAddCompanyModal(false);
      setCompanyForm({
        companyName: '',
        employerName: '',
        email: '',
        mobile: '',
        state: '',
        city: '',
        budget: '',
        paymentTimeline: '10 Days',
        status: 'Pending',
        sector: 'Information Technology',
      });
      fetchStaffingAndCompanies();
    } else {
      toast.error(res.payload || 'Failed to onboard company');
    }
  };

  const handleEditCompanySubmit = async (e) => {
    e.preventDefault();
    if (!editingCompany) return;
    const res = await dispatch(
      updateCompany({ companyId: editingCompany._id, data: { companyName: companyForm.companyName } })
    );
    if (!res.error) {
      toast.success('Company updated successfully');
      setEditingCompany(null);
      fetchStaffingAndCompanies();
    } else {
      toast.error(res.payload || 'Failed to update company');
    }
  };

  const handleStatusChange = async (companyId, newStatus) => {
    const res = await dispatch(updateCompanyStatus({ companyId, status: newStatus }));
    if (!res.error) {
      toast.success('Company status updated');
    } else {
      toast.error(res.payload || 'Failed to update status');
    }
  };

  const handleDeleteCompany = async (companyId) => {
    const res = await dispatch(deleteCompany(companyId));
    if (!res.error) {
      toast.success('Company deleted successfully');
      setDeletingCompanyId(null);
      fetchStaffingAndCompanies();
    } else {
      toast.error(res.payload || 'Failed to delete company');
    }
  };

  // Job CRUD Handlers
  const handleAddJobSubmit = async (e) => {
    e.preventDefault();
    if (!expandedCompanyId) return;
    const payload = {
      ...jobForm,
      numberOfVacancies: Number(jobForm.numberOfVacancies),
      technologies: typeof jobForm.technologies === 'string'
        ? jobForm.technologies.split(',').map((t) => t.trim()).filter(Boolean)
        : jobForm.technologies,
    };
    const res = await dispatch(addCompanyJob({ companyId: expandedCompanyId, data: payload }));
    if (!res.error) {
      toast.success('Job added successfully');
      setShowAddJobModal(false);
      dispatch(getCompanyJobs(expandedCompanyId));
    } else {
      toast.error(res.payload || 'Failed to add job');
    }
  };

  const handleEditJobSubmit = async (e) => {
    e.preventDefault();
    if (!editingJob) return;
    const payload = {
      numberOfVacancies: Number(jobForm.numberOfVacancies),
      salary: jobForm.salary,
      jobDescription: jobForm.jobDescription,
    };
    const res = await dispatch(updateCompanyJob({ jobId: editingJob._id, data: payload }));
    if (!res.error) {
      toast.success('Job updated successfully');
      setEditingJob(null);
      if (expandedCompanyId) dispatch(getCompanyJobs(expandedCompanyId));
    } else {
      toast.error(res.payload || 'Failed to update job');
    }
  };

  const handleDeleteJob = async (jobId) => {
    const res = await dispatch(deleteCompanyJob(jobId));
    if (!res.error) {
      toast.success('Job deleted successfully');
      setDeletingJobId(null);
      if (expandedCompanyId) dispatch(getCompanyJobs(expandedCompanyId));
    } else {
      toast.error(res.payload || 'Failed to delete job');
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Back button & Member Header */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => navigate('/staffing')}
          className="p-2 border border-gray-200 rounded-xl hover:bg-gray-100 transition cursor-pointer"
        >
          <ArrowLeft className="w-5 h-5 text-gray-700" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {selectedStaffing?.staffingName || 'Staffing Member Profile'}
          </h1>
          <p className="text-xs text-gray-500">
            {selectedStaffing?.designation || 'Sales Member'} • {selectedStaffing?.email} • {selectedStaffing?.mobileNumber}
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-500">Total Companies</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">
              {companyStats?.totalCompanies ?? companyPagination?.total ?? companies.length}
            </p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-purple-50 text-[#8931BA] flex items-center justify-center">
            <Building2 className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-500">In Progress Companies</p>
            <p className="text-2xl font-bold text-amber-600 mt-1">
              {companyStats?.inProgress ?? companies.filter((c) => c.status === 'In Progress').length}
            </p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
            <AlertCircle className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-500">Completed Companies</p>
            <p className="text-2xl font-bold text-green-600 mt-1">
              {companyStats?.completed ?? companies.filter((c) => c.status === 'Completed').length}
            </p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-green-50 text-green-600 flex items-center justify-center">
            <CheckCircle2 className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Filter and Add Company */}
      <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex flex-col sm:flex-row gap-3 justify-between items-center">
        <div className="flex flex-1 flex-col sm:flex-row gap-3 w-full">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search companies by name..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#8931BA]/30"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#8931BA]/30"
          >
            <option value="">All Statuses</option>
            <option value="Pending">Pending</option>
            <option value="In Progress">In Progress</option>
            <option value="Completed">Completed</option>
          </select>
        </div>

        <button
          onClick={() => {
            setCompanyForm({
              companyName: '',
              employerName: '',
              email: '',
              mobile: '',
              state: '',
              city: '',
              budget: '',
              paymentTimeline: '10 Days',
              status: 'Pending',
              sector: 'Information Technology',
            });
            setShowAddCompanyModal(true);
          }}
          className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-[#8931BA] to-fuchsia-600 text-white font-medium rounded-xl shadow-sm hover:opacity-90 transition cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          Onboard Company
        </button>
      </div>

      {/* Companies List */}
      <div className="space-y-4">
        {loading ? (
          <div className="bg-white p-12 text-center text-gray-500 rounded-2xl border border-gray-100">
            <div className="flex justify-center items-center gap-2">
              <div className="w-5 h-5 border-2 border-[#8931BA] border-t-transparent rounded-full animate-spin" />
              Loading onboarded companies...
            </div>
          </div>
        ) : companies.length === 0 ? (
          <div className="bg-white p-12 text-center text-gray-500 rounded-2xl border border-gray-100">
            No companies onboarded yet. Click "Onboard Company" to register one.
          </div>
        ) : (
          companies.map((company) => {
            const isExpanded = expandedCompanyId === company._id;
            return (
              <div
                key={company._id}
                className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden transition"
              >
                <div className="p-5 flex flex-col lg:flex-row justify-between lg:items-center gap-4">
                  {/* Left Info */}
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h3 className="text-lg font-bold text-gray-900">{company.companyName}</h3>
                      <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-purple-50 text-[#8931BA]">
                        {company.sector || 'General'}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500">
                      Contact: <span className="font-semibold text-gray-700">{company.employerName}</span> ({company.email} • {company.mobile})
                    </p>
                    <div className="flex flex-wrap items-center gap-3 text-xs text-gray-500 pt-1">
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-gray-400" />
                        {company.city}, {company.state}
                      </span>
                      <span className="flex items-center gap-1">
                        <DollarSign className="w-3.5 h-3.5 text-gray-400" />
                        Budget: ₹{company.budget}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-gray-400" />
                        Timeline: {company.paymentTimeline}
                      </span>
                    </div>
                  </div>

                  {/* Right Actions */}
                  <div className="flex flex-wrap items-center gap-3">
                    {/* Status Dropdown */}
                    <select
                      value={company.status || 'Pending'}
                      onChange={(e) => handleStatusChange(company._id, e.target.value)}
                      className={`text-xs font-semibold px-3 py-1.5 rounded-xl border transition cursor-pointer ${
                        company.status === 'Completed'
                          ? 'bg-green-50 text-green-700 border-green-200'
                          : company.status === 'In Progress'
                          ? 'bg-blue-50 text-blue-700 border-blue-200'
                          : 'bg-amber-50 text-amber-700 border-amber-200'
                      }`}
                    >
                      <option value="Pending">Pending</option>
                      <option value="In Progress">In Progress</option>
                      <option value="Completed">Completed</option>
                    </select>

                    {/* Edit Company */}
                    <button
                      onClick={() => {
                        setEditingCompany(company);
                        setCompanyForm({ ...companyForm, companyName: company.companyName });
                      }}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-xl transition cursor-pointer"
                      title="Edit Company Name"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>

                    {/* Delete Company */}
                    <button
                      onClick={() => setDeletingCompanyId(company._id)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-xl transition cursor-pointer"
                      title="Delete Company"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>

                    {/* Expand Jobs button */}
                    <button
                      onClick={() => toggleExpandCompany(company._id)}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-xs font-semibold transition cursor-pointer"
                    >
                      <Briefcase className="w-3.5 h-3.5 text-[#8931BA]" />
                      Jobs ({company.totalJobs ?? 0})
                      {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>

                {/* Expanded Jobs Section */}
                {isExpanded && (
                  <div className="bg-gray-50/75 p-5 border-t border-gray-100 space-y-4">
                    <div className="flex justify-between items-center">
                      <h4 className="text-sm font-bold text-gray-800 flex items-center gap-2">
                        <Briefcase className="w-4 h-4 text-[#8931BA]" />
                        Jobs for {company.companyName}
                      </h4>
                      <button
                        onClick={() => {
                          setJobForm({
                            designation: '',
                            category: 'IT',
                            numberOfVacancies: 1,
                            technologies: '',
                            workMode: 'Hybrid',
                            experience: '1-3 Years',
                            salary: '10 LPA',
                            state: company.state || '',
                            city: company.city || '',
                            noticePeriod: '30 Days',
                            deadline: '',
                            earningDeadline: '',
                            jobDescription: '',
                            workLocationAddress: '',
                            status: 'Pending',
                          });
                          setShowAddJobModal(true);
                        }}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-[#8931BA] hover:bg-purple-700 text-white text-xs font-semibold rounded-xl transition cursor-pointer"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        Add Job Under Company
                      </button>
                    </div>

                    {companyJobs.length === 0 ? (
                      <p className="text-xs text-gray-500 py-3 text-center">
                        No jobs created for this company yet. Click "Add Job Under Company" to add one.
                      </p>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {companyJobs.map((job) => (
                          <div
                            key={job._id}
                            className="bg-white p-4 rounded-xl border border-gray-200 shadow-2xs space-y-2"
                          >
                            <div className="flex justify-between items-start">
                              <div>
                                <h5 className="font-bold text-sm text-gray-900">{job.designation}</h5>
                                <p className="text-xs text-gray-500">
                                  {job.category} • {job.workMode} • {job.experience}
                                </p>
                              </div>
                              <span className="text-xs font-bold text-[#8931BA]">{job.salary}</span>
                            </div>

                            <p className="text-xs text-gray-600 line-clamp-2">
                              {job.descriptionText || job.jobDescription?.replace(/<[^>]*>?/gm, '')}
                            </p>

                            <div className="flex items-center justify-between pt-2 border-t border-gray-100 text-xs text-gray-500">
                              <span>Vacancies: <strong>{job.numberOfVacancies}</strong></span>
                              <div className="flex gap-2">
                                <button
                                  onClick={() => {
                                    setEditingJob(job);
                                    setJobForm({
                                      ...jobForm,
                                      numberOfVacancies: job.numberOfVacancies,
                                      salary: job.salary,
                                      jobDescription: job.jobDescription || job.descriptionText || '',
                                    });
                                  }}
                                  className="text-blue-600 hover:text-blue-700 font-medium cursor-pointer"
                                >
                                  Edit
                                </button>
                                <button
                                  onClick={() => setDeletingJobId(job._id)}
                                  className="text-red-600 hover:text-red-700 font-medium cursor-pointer"
                                >
                                  Delete
                                </button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Pagination */}
      {companyPagination?.totalPages > 1 && (
        <div className="p-4 bg-white rounded-2xl border border-gray-100 flex justify-between items-center">
          <span className="text-xs text-gray-500">
            Page {companyPagination.currentPage || currentPage} of {companyPagination.totalPages}
          </span>
          <Pagination
            page={companyPagination.currentPage || currentPage}
            totalPages={companyPagination.totalPages}
            onPageChange={(page) => setCurrentPage(page)}
          />
        </div>
      )}

      {/* Add Company Modal */}
      {showAddCompanyModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg p-6 relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setShowAddCompanyModal(false)}
              className="absolute right-4 top-4 text-gray-400 hover:text-gray-600 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
            <h2 className="text-xl font-bold text-gray-900 mb-4">Onboard New Company</h2>

            <form onSubmit={handleAddCompanySubmit} className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Company Name *</label>
                  <input
                    type="text"
                    required
                    value={companyForm.companyName}
                    onChange={(e) => setCompanyForm({ ...companyForm, companyName: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Employer / HR Name *</label>
                  <input
                    type="text"
                    required
                    value={companyForm.employerName}
                    onChange={(e) => setCompanyForm({ ...companyForm, employerName: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Email *</label>
                  <input
                    type="email"
                    required
                    value={companyForm.email}
                    onChange={(e) => setCompanyForm({ ...companyForm, email: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Mobile *</label>
                  <input
                    type="tel"
                    required
                    value={companyForm.mobile}
                    onChange={(e) => setCompanyForm({ ...companyForm, mobile: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">City</label>
                  <input
                    type="text"
                    value={companyForm.city}
                    onChange={(e) => setCompanyForm({ ...companyForm, city: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">State</label>
                  <input
                    type="text"
                    value={companyForm.state}
                    onChange={(e) => setCompanyForm({ ...companyForm, state: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Budget (₹)</label>
                  <input
                    type="text"
                    value={companyForm.budget}
                    onChange={(e) => setCompanyForm({ ...companyForm, budget: e.target.value })}
                    placeholder="e.g. 85555"
                    className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Payment Timeline</label>
                  <input
                    type="text"
                    value={companyForm.paymentTimeline}
                    onChange={(e) => setCompanyForm({ ...companyForm, paymentTimeline: e.target.value })}
                    placeholder="e.g. 10 Days"
                    className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Sector</label>
                  <input
                    type="text"
                    value={companyForm.sector}
                    onChange={(e) => setCompanyForm({ ...companyForm, sector: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Initial Status</label>
                  <select
                    value={companyForm.status}
                    onChange={(e) => setCompanyForm({ ...companyForm, status: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm"
                  >
                    <option value="Pending">Pending</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Completed">Completed</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setShowAddCompanyModal(false)}
                  className="px-4 py-2 border border-gray-200 rounded-xl text-sm text-gray-600 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#8931BA] text-white text-sm font-semibold rounded-xl hover:opacity-90"
                >
                  Save & Onboard
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Company Modal */}
      {editingCompany && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6 relative">
            <button
              onClick={() => setEditingCompany(null)}
              className="absolute right-4 top-4 text-gray-400 hover:text-gray-600"
            >
              <X className="w-5 h-5" />
            </button>
            <h2 className="text-lg font-bold text-gray-900 mb-4">Update Company Name</h2>
            <form onSubmit={handleEditCompanySubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Company Name</label>
                <input
                  type="text"
                  required
                  value={companyForm.companyName}
                  onChange={(e) => setCompanyForm({ ...companyForm, companyName: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm"
                />
              </div>
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setEditingCompany(null)}
                  className="px-4 py-2 border border-gray-200 rounded-xl text-sm text-gray-600"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#8931BA] text-white text-sm font-semibold rounded-xl"
                >
                  Update
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Job Modal */}
      {showAddJobModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg p-6 relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setShowAddJobModal(false)}
              className="absolute right-4 top-4 text-gray-400 hover:text-gray-600"
            >
              <X className="w-5 h-5" />
            </button>
            <h2 className="text-xl font-bold text-gray-900 mb-4">Add Job Under Company</h2>

            <form onSubmit={handleAddJobSubmit} className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Designation *</label>
                  <input
                    type="text"
                    required
                    value={jobForm.designation}
                    onChange={(e) => setJobForm({ ...jobForm, designation: e.target.value })}
                    placeholder="e.g. Senior Full Stack Developer"
                    className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Category</label>
                  <input
                    type="text"
                    value={jobForm.category}
                    onChange={(e) => setJobForm({ ...jobForm, category: e.target.value })}
                    placeholder="e.g. IT"
                    className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Vacancies *</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={jobForm.numberOfVacancies}
                    onChange={(e) => setJobForm({ ...jobForm, numberOfVacancies: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Technologies (comma separated)</label>
                  <input
                    type="text"
                    value={jobForm.technologies}
                    onChange={(e) => setJobForm({ ...jobForm, technologies: e.target.value })}
                    placeholder="Node.js, React, MongoDB"
                    className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Work Mode</label>
                  <select
                    value={jobForm.workMode}
                    onChange={(e) => setJobForm({ ...jobForm, workMode: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm"
                  >
                    <option value="Remote">Remote</option>
                    <option value="Hybrid">Hybrid</option>
                    <option value="Onsite">Onsite</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Experience</label>
                  <input
                    type="text"
                    value={jobForm.experience}
                    onChange={(e) => setJobForm({ ...jobForm, experience: e.target.value })}
                    placeholder="4-6 Years"
                    className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Salary</label>
                  <input
                    type="text"
                    value={jobForm.salary}
                    onChange={(e) => setJobForm({ ...jobForm, salary: e.target.value })}
                    placeholder="15 LPA"
                    className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Job Description</label>
                <textarea
                  rows="3"
                  value={jobForm.jobDescription}
                  onChange={(e) => setJobForm({ ...jobForm, jobDescription: e.target.value })}
                  placeholder="Summary of responsibilities..."
                  className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setShowAddJobModal(false)}
                  className="px-4 py-2 border border-gray-200 rounded-xl text-sm text-gray-600 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#8931BA] text-white text-sm font-semibold rounded-xl hover:opacity-90"
                >
                  Publish Job
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Job Modal */}
      {editingJob && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6 relative">
            <button
              onClick={() => setEditingJob(null)}
              className="absolute right-4 top-4 text-gray-400 hover:text-gray-600"
            >
              <X className="w-5 h-5" />
            </button>
            <h2 className="text-lg font-bold text-gray-900 mb-4">Edit Job</h2>
            <form onSubmit={handleEditJobSubmit} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Vacancies</label>
                <input
                  type="number"
                  required
                  value={jobForm.numberOfVacancies}
                  onChange={(e) => setJobForm({ ...jobForm, numberOfVacancies: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Salary</label>
                <input
                  type="text"
                  required
                  value={jobForm.salary}
                  onChange={(e) => setJobForm({ ...jobForm, salary: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Description</label>
                <textarea
                  rows="3"
                  value={jobForm.jobDescription}
                  onChange={(e) => setJobForm({ ...jobForm, jobDescription: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingJob(null)}
                  className="px-4 py-2 border border-gray-200 rounded-xl text-sm text-gray-600"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#8931BA] text-white text-sm font-semibold rounded-xl"
                >
                  Update Job
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Company Modal */}
      {deletingCompanyId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6 text-center">
            <div className="w-12 h-12 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-3">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-1">Delete Company?</h3>
            <p className="text-xs text-gray-500 mb-5">
              This will delete this company and all its associated jobs.
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setDeletingCompanyId(null)}
                className="flex-1 py-2 border border-gray-200 text-sm font-semibold text-gray-600 rounded-xl"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDeleteCompany(deletingCompanyId)}
                className="flex-1 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-semibold rounded-xl"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Job Modal */}
      {deletingJobId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6 text-center">
            <div className="w-12 h-12 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-3">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-1">Delete Job?</h3>
            <p className="text-xs text-gray-500 mb-5">
              Are you sure you want to delete this job posting?
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setDeletingJobId(null)}
                className="flex-1 py-2 border border-gray-200 text-sm font-semibold text-gray-600 rounded-xl"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDeleteJob(deletingJobId)}
                className="flex-1 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-semibold rounded-xl"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StaffingDetail;
