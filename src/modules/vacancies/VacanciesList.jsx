import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Briefcase, Search, Filter, RefreshCw, Calendar, MapPin,
  Clock, Award, AlertCircle, CheckCircle2, ChevronRight, X
} from 'lucide-react';
import Pagination from '../../components/common/Pagination';
import { getVacancies, getVacancyStats } from '../../redux/slices/vacancies/vacancySlice';

const VacanciesList = () => {
  const dispatch = useDispatch();
  const { vacancies, stats, pagination, loading, statsLoading } = useSelector(
    (state) => state.vacancies
  );

  const [currentPage, setCurrentPage] = useState(1);
  const [filters, setFilters] = useState({
    search: '',
    category: '',
    workMode: '',
    priority: '',
    status: '',
    hiring: '',
  });

  const [selectedVacancy, setSelectedVacancy] = useState(null);

  const fetchData = () => {
    const params = {
      page: currentPage,
      limit: 10,
      ...(filters.search ? { search: filters.search } : {}),
      ...(filters.category ? { category: filters.category } : {}),
      ...(filters.workMode ? { workMode: filters.workMode } : {}),
      ...(filters.priority ? { priority: filters.priority } : {}),
      ...(filters.status ? { status: filters.status } : {}),
      ...(filters.hiring ? { hiring: filters.hiring } : {}),
    };
    dispatch(getVacancies(params));
    dispatch(getVacancyStats());
  };

  useEffect(() => {
    fetchData();
  }, [dispatch, currentPage, filters]);

  const handleFilterChange = (name, value) => {
    setFilters((prev) => ({ ...prev, [name]: value }));
    setCurrentPage(1);
  };

  const clearFilters = () => {
    setFilters({
      search: '',
      category: '',
      workMode: '',
      priority: '',
      status: '',
      hiring: '',
    });
    setCurrentPage(1);
  };

  const hasActiveFilters = Object.values(filters).some((v) => v !== '');

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Current Vacancies</h1>
          <p className="text-sm text-gray-500 mt-1">
            Browse and filter live vacancies across all onboarded companies and staffing partners.
          </p>
        </div>
        <button
          onClick={fetchData}
          className="flex items-center gap-2 px-3.5 py-2 border border-gray-200 bg-white hover:bg-gray-50 text-gray-700 text-sm font-medium rounded-xl transition cursor-pointer"
        >
          <RefreshCw className="w-4 h-4" />
          Refresh
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-500">Total Vacancies</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">
              {stats?.total ?? pagination?.total ?? vacancies.length}
            </p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-purple-50 text-[#8931BA] flex items-center justify-center">
            <Briefcase className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-500">Active / Published</p>
            <p className="text-2xl font-bold text-green-600 mt-1">
              {stats?.active ?? stats?.published ?? vacancies.filter((v) => (v.status || '').toLowerCase() === 'active').length}
            </p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-green-50 text-green-600 flex items-center justify-center">
            <CheckCircle2 className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-500">Pending Review</p>
            <p className="text-2xl font-bold text-amber-600 mt-1">
              {stats?.pending ?? vacancies.filter((v) => (v.status || '').toLowerCase() === 'pending').length}
            </p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
            <AlertCircle className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-500">High Priority</p>
            <p className="text-2xl font-bold text-red-600 mt-1">
              {stats?.highPriority ?? vacancies.filter((v) => (v.priority || '').toLowerCase() === 'high').length}
            </p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-red-50 text-red-600 flex items-center justify-center">
            <Award className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm space-y-3">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search vacancies by designation, keyword..."
              value={filters.search}
              onChange={(e) => handleFilterChange('search', e.target.value)}
              className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#8931BA]/30"
            />
          </div>

          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-red-600 hover:bg-red-50 border border-red-200 rounded-xl transition cursor-pointer"
            >
              <X className="w-3.5 h-3.5" /> Clear Filters
            </button>
          )}
        </div>

        {/* Filter Dropdowns */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 pt-1 border-t border-gray-100">
          <select
            value={filters.category}
            onChange={(e) => handleFilterChange('category', e.target.value)}
            className="px-2.5 py-1.5 border border-gray-200 rounded-xl text-xs focus:outline-none"
          >
            <option value="">All Categories</option>
            <option value="IT">IT</option>
            <option value="Non-IT">Non-IT</option>
          </select>

          <select
            value={filters.workMode}
            onChange={(e) => handleFilterChange('workMode', e.target.value)}
            className="px-2.5 py-1.5 border border-gray-200 rounded-xl text-xs focus:outline-none"
          >
            <option value="">All Work Modes</option>
            <option value="Remote">Remote</option>
            <option value="Hybrid">Hybrid</option>
            <option value="Onsite">Onsite</option>
          </select>

          <select
            value={filters.priority}
            onChange={(e) => handleFilterChange('priority', e.target.value)}
            className="px-2.5 py-1.5 border border-gray-200 rounded-xl text-xs focus:outline-none"
          >
            <option value="">All Priorities</option>
            <option value="High">High</option>
            <option value="Medium">Medium</option>
            <option value="Low">Low</option>
          </select>

          <select
            value={filters.status}
            onChange={(e) => handleFilterChange('status', e.target.value)}
            className="px-2.5 py-1.5 border border-gray-200 rounded-xl text-xs focus:outline-none"
          >
            <option value="">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="active">Active</option>
            <option value="closed">Closed</option>
          </select>

          <select
            value={filters.hiring}
            onChange={(e) => handleFilterChange('hiring', e.target.value)}
            className="px-2.5 py-1.5 border border-gray-200 rounded-xl text-xs focus:outline-none"
          >
            <option value="">All Hiring Types</option>
            <option value="External">External</option>
            <option value="Internal">Internal</option>
          </select>
        </div>
      </div>

      {/* Vacancy Table */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="bg-gray-50/75 border-b border-gray-100 text-gray-600 font-medium">
                <th className="py-3.5 px-4">Vacancy / Designation</th>
                <th className="py-3.5 px-4">Category & Mode</th>
                <th className="py-3.5 px-4">Experience & Salary</th>
                <th className="py-3.5 px-4">Location</th>
                <th className="py-3.5 px-4 text-center">Openings</th>
                <th className="py-3.5 px-4 text-center">Priority</th>
                <th className="py-3.5 px-4 text-center">Status</th>
                <th className="py-3.5 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr>
                  <td colSpan="8" className="py-12 text-center text-gray-500">
                    <div className="flex justify-center items-center gap-2">
                      <div className="w-5 h-5 border-2 border-[#8931BA] border-t-transparent rounded-full animate-spin" />
                      Loading vacancies...
                    </div>
                  </td>
                </tr>
              ) : vacancies.length === 0 ? (
                <tr>
                  <td colSpan="8" className="py-12 text-center text-gray-500">
                    No vacancies found matching your filters.
                  </td>
                </tr>
              ) : (
                vacancies.map((vacancy) => (
                  <tr key={vacancy._id} className="hover:bg-gray-50/50 transition">
                    <td className="py-3.5 px-4">
                      <div>
                        <p className="font-semibold text-gray-900">{vacancy.designation}</p>
                        <span className="text-xs text-purple-600 font-mono font-medium">
                          {vacancy.vacancyId || vacancy._id?.slice(-6)}
                        </span>
                      </div>
                    </td>

                    <td className="py-3.5 px-4 text-gray-600 text-xs">
                      <span className="inline-block px-2 py-0.5 rounded-md bg-gray-100 mr-1.5 font-medium">
                        {vacancy.category || 'IT'}
                      </span>
                      <span>{vacancy.workMode || 'Hybrid'}</span>
                    </td>

                    <td className="py-3.5 px-4 text-xs">
                      <p className="text-gray-900 font-medium">{vacancy.salary || vacancy.budget || 'N/A'}</p>
                      <p className="text-gray-500">{vacancy.experience || 'Not specified'}</p>
                    </td>

                    <td className="py-3.5 px-4 text-xs text-gray-600">
                      <div className="flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-gray-400" />
                        {vacancy.city ? `${vacancy.city}, ${vacancy.state}` : 'Pan India'}
                      </div>
                    </td>

                    <td className="py-3.5 px-4 text-center font-bold text-gray-800">
                      {vacancy.numberOfVacancies ?? 1}
                    </td>

                    <td className="py-3.5 px-4 text-center">
                      <span
                        className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                          (vacancy.priority || '').toLowerCase() === 'high'
                            ? 'bg-red-50 text-red-700 border border-red-200'
                            : (vacancy.priority || '').toLowerCase() === 'medium'
                            ? 'bg-blue-50 text-blue-700 border border-blue-200'
                            : 'bg-gray-50 text-gray-600 border border-gray-200'
                        }`}
                      >
                        {vacancy.priority || 'Medium'}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 text-center">
                      <span
                        className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold capitalize ${
                          (vacancy.status || '').toLowerCase() === 'active' || (vacancy.status || '').toLowerCase() === 'published'
                            ? 'bg-green-50 text-green-700 border border-green-200'
                            : 'bg-amber-50 text-amber-700 border border-amber-200'
                        }`}
                      >
                        {vacancy.status || 'pending'}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => setSelectedVacancy(vacancy)}
                        className="px-3 py-1 bg-purple-50 hover:bg-purple-100 text-[#8931BA] text-xs font-semibold rounded-lg transition cursor-pointer"
                      >
                        View
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {pagination?.totalPages > 1 && (
          <div className="p-4 border-t border-gray-100 flex justify-between items-center">
            <span className="text-xs text-gray-500">
              Showing page {pagination.currentPage || currentPage} of {pagination.totalPages}
            </span>
            <Pagination
              page={pagination.currentPage || currentPage}
              totalPages={pagination.totalPages}
              onPageChange={(page) => setCurrentPage(page)}
            />
          </div>
        )}
      </div>

      {/* Vacancy Detail Modal */}
      {selectedVacancy && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg p-6 relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setSelectedVacancy(null)}
              className="absolute right-4 top-4 text-gray-400 hover:text-gray-600 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="mb-4">
              <span className="text-xs font-mono text-purple-600 bg-purple-50 px-2.5 py-1 rounded-md">
                {selectedVacancy.vacancyId || selectedVacancy._id}
              </span>
              <h2 className="text-xl font-bold text-gray-900 mt-2">{selectedVacancy.designation}</h2>
              <p className="text-xs text-gray-500">
                {selectedVacancy.category} • {selectedVacancy.workMode} • {selectedVacancy.experience}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs bg-gray-50 p-4 rounded-xl mb-4">
              <div>
                <span className="text-gray-500 block">Salary / Budget:</span>
                <span className="font-bold text-gray-900">{selectedVacancy.salary || selectedVacancy.budget || 'N/A'}</span>
              </div>
              <div>
                <span className="text-gray-500 block">Vacancies:</span>
                <span className="font-bold text-gray-900">{selectedVacancy.numberOfVacancies ?? 1}</span>
              </div>
              <div>
                <span className="text-gray-500 block">Notice Period:</span>
                <span className="font-semibold text-gray-900">{selectedVacancy.noticePeriod || 'Standard'}</span>
              </div>
              <div>
                <span className="text-gray-500 block">Location:</span>
                <span className="font-semibold text-gray-900">
                  {selectedVacancy.city ? `${selectedVacancy.city}, ${selectedVacancy.state}` : 'Not specified'}
                </span>
              </div>
            </div>

            {selectedVacancy.technologies?.length > 0 && (
              <div className="mb-4">
                <h4 className="text-xs font-bold text-gray-700 mb-1.5">Required Technologies</h4>
                <div className="flex flex-wrap gap-1.5">
                  {selectedVacancy.technologies.map((t, idx) => (
                    <span key={idx} className="px-2 py-0.5 bg-purple-50 text-[#8931BA] text-xs font-medium rounded-md">
                      {t}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <div className="mb-4">
              <h4 className="text-xs font-bold text-gray-700 mb-1.5">Job Description</h4>
              <div
                className="text-xs text-gray-600 bg-gray-50/50 p-3 rounded-xl border border-gray-100 max-h-48 overflow-y-auto leading-relaxed"
                dangerouslySetInnerHTML={{
                  __html: selectedVacancy.jobDescription || selectedVacancy.description || selectedVacancy.descriptionText || 'No description provided.'
                }}
              />
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setSelectedVacancy(null)}
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-semibold rounded-xl cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default VacanciesList;
