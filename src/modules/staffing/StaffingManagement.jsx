import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import {
  Users, UserPlus, Search, CheckCircle, XCircle, Trash2, Edit3,
  Eye, RefreshCw, Briefcase, Check, X, ShieldAlert, AlertCircle
} from 'lucide-react';
import Pagination from '../../components/common/Pagination';
import {
  getAllStaffing,
  getStaffingStats,
  createStaffing,
  updateStaffing,
  toggleStaffingStatus,
  approveStaffing,
  rejectStaffing,
  deleteStaffing,
} from '../../redux/slices/staffing/staffingSlice';

const StaffingManagement = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { staffingList, staffingStats, staffingPagination, loading, actionLoading } = useSelector(
    (state) => state.staffing
  );

  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingStaffing, setEditingStaffing] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  // Form state
  const [formData, setFormData] = useState({
    staffingName: '',
    designation: '',
    email: '',
    password: '',
    mobileNumber: '',
  });

  const fetchData = () => {
    dispatch(getAllStaffing({ page: currentPage, limit: 10, search: searchTerm }));
    dispatch(getStaffingStats());
  };

  useEffect(() => {
    fetchData();
  }, [dispatch, currentPage, searchTerm]);

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleAddSubmit = async (e) => {
    e.preventDefault();
    if (!formData.staffingName || !formData.email || !formData.password) {
      toast.error('Please fill in required fields');
      return;
    }
    const res = await dispatch(createStaffing(formData));
    if (!res.error) {
      toast.success('Staffing member created successfully');
      setShowAddModal(false);
      setFormData({ staffingName: '', designation: '', email: '', password: '', mobileNumber: '' });
      fetchData();
    } else {
      toast.error(res.payload || 'Failed to create staffing');
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!editingStaffing) return;
    const payload = {
      staffingName: formData.staffingName,
      designation: formData.designation,
      ...(formData.password ? { password: formData.password } : {}),
    };
    const res = await dispatch(updateStaffing({ staffingId: editingStaffing._id, data: payload }));
    if (!res.error) {
      toast.success('Staffing updated successfully');
      setEditingStaffing(null);
      fetchData();
    } else {
      toast.error(res.payload || 'Failed to update staffing');
    }
  };

  const handleToggleStatus = async (staffingId, currentActive) => {
    const res = await dispatch(toggleStaffingStatus({ staffingId, data: { isActive: !currentActive } }));
    if (!res.error) {
      toast.success('Status toggled successfully');
    } else {
      toast.error(res.payload || 'Failed to toggle status');
    }
  };

  const handleApprove = async (staffingId) => {
    const res = await dispatch(approveStaffing(staffingId));
    if (!res.error) {
      toast.success('Staffing approved successfully');
    } else {
      toast.error(res.payload || 'Failed to approve staffing');
    }
  };

  const handleReject = async (staffingId) => {
    const res = await dispatch(rejectStaffing(staffingId));
    if (!res.error) {
      toast.success('Staffing rejected');
    } else {
      toast.error(res.payload || 'Failed to reject staffing');
    }
  };

  const handleDelete = async (staffingId) => {
    const res = await dispatch(deleteStaffing(staffingId));
    if (!res.error) {
      toast.success('Staffing deleted successfully');
      setDeletingId(null);
      fetchData();
    } else {
      toast.error(res.payload || 'Failed to delete staffing');
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Staffing (Sales Members)</h1>
          <p className="text-sm text-gray-500 mt-1">
            Manage your sales & staffing team, track onboarded companies, and review performance.
          </p>
        </div>
        <button
          onClick={() => {
            setFormData({ staffingName: '', designation: '', email: '', password: '', mobileNumber: '' });
            setShowAddModal(true);
          }}
          className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-[#8931BA] to-fuchsia-600 text-white font-medium rounded-xl shadow-sm hover:opacity-90 transition cursor-pointer"
        >
          <UserPlus className="w-4 h-4" />
          Add Staffing Member
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-500">Total Staffing</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">
              {staffingStats?.total ?? staffingPagination?.total ?? staffingList.length}
            </p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-purple-50 text-[#8931BA] flex items-center justify-center">
            <Users className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-500">Active Members</p>
            <p className="text-2xl font-bold text-green-600 mt-1">
              {staffingStats?.active ?? staffingList.filter((m) => m.isActive).length}
            </p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-green-50 text-green-600 flex items-center justify-center">
            <CheckCircle className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-500">Pending Approval</p>
            <p className="text-2xl font-bold text-amber-600 mt-1">
              {staffingStats?.pending ?? staffingList.filter((m) => m.status === 'pending').length}
            </p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
            <AlertCircle className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-500">Total Jobs Posted</p>
            <p className="text-2xl font-bold text-blue-600 mt-1">
              {staffingStats?.totalJobsPosted ?? 0}
            </p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
            <Briefcase className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex flex-col sm:flex-row gap-3 justify-between items-center">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search by name, email, designation..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#8931BA]/30 focus:border-[#8931BA]"
          />
        </div>

        <button
          onClick={fetchData}
          className="flex items-center gap-1.5 px-3 py-2 text-sm text-gray-600 hover:text-gray-900 border border-gray-200 rounded-xl hover:bg-gray-50 transition cursor-pointer"
        >
          <RefreshCw className="w-4 h-4" /> Refresh
        </button>
      </div>

      {/* Staffing Members Table */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="bg-gray-50/75 border-b border-gray-100 text-gray-600 font-medium">
                <th className="py-3.5 px-4">Member</th>
                <th className="py-3.5 px-4">Designation</th>
                <th className="py-3.5 px-4">Contact</th>
                <th className="py-3.5 px-4 text-center">Jobs Posted</th>
                <th className="py-3.5 px-4 text-center">Active Status</th>
                <th className="py-3.5 px-4 text-center">Approval</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr>
                  <td colSpan="7" className="py-12 text-center text-gray-500">
                    <div className="flex justify-center items-center gap-2">
                      <div className="w-5 h-5 border-2 border-[#8931BA] border-t-transparent rounded-full animate-spin" />
                      Loading staffing members...
                    </div>
                  </td>
                </tr>
              ) : staffingList.length === 0 ? (
                <tr>
                  <td colSpan="7" className="py-12 text-center text-gray-500">
                    No staffing members found. Click "Add Staffing Member" to create one.
                  </td>
                </tr>
              ) : (
                staffingList.map((member) => (
                  <tr key={member._id} className="hover:bg-gray-50/50 transition">
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-purple-100 text-[#8931BA] font-bold flex items-center justify-center">
                          {member.staffingName?.charAt(0)?.toUpperCase() || 'S'}
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900">{member.staffingName}</p>
                          <p className="text-xs text-gray-400">ID: {member._id.slice(-6)}</p>
                        </div>
                      </div>
                    </td>

                    <td className="py-3.5 px-4 text-gray-700">
                      <span className="px-2.5 py-1 bg-gray-100 text-gray-700 rounded-lg text-xs font-medium">
                        {member.designation || 'N/A'}
                      </span>
                    </td>

                    <td className="py-3.5 px-4">
                      <p className="text-gray-900">{member.email}</p>
                      <p className="text-xs text-gray-500">{member.mobileNumber}</p>
                    </td>

                    <td className="py-3.5 px-4 text-center font-semibold text-gray-700">
                      {member.totalJobsPosted ?? member.postedJobs ?? 0}
                    </td>

                    <td className="py-3.5 px-4 text-center">
                      <button
                        onClick={() => handleToggleStatus(member._id, member.isActive)}
                        className={`px-3 py-1 rounded-full text-xs font-semibold cursor-pointer transition ${
                          member.isActive
                            ? 'bg-green-100 text-green-700 hover:bg-green-200'
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                      >
                        {member.isActive ? 'Active' : 'Inactive'}
                      </button>
                    </td>

                    <td className="py-3.5 px-4 text-center">
                      <span
                        className={`inline-flex px-2.5 py-1 rounded-full text-xs font-semibold capitalize ${
                          member.status === 'approved'
                            ? 'bg-green-50 text-green-700 border border-green-200'
                            : member.status === 'rejected'
                            ? 'bg-red-50 text-red-700 border border-red-200'
                            : 'bg-amber-50 text-amber-700 border border-amber-200'
                        }`}
                      >
                        {member.status || 'Pending'}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {/* View Companies */}
                        <button
                          onClick={() => navigate(`/staffing/${member._id}`)}
                          title="View Companies Onboarded"
                          className="p-1.5 text-purple-600 hover:bg-purple-50 rounded-lg transition cursor-pointer"
                        >
                          <Eye className="w-4 h-4" />
                        </button>

                        {/* Approve */}
                        {member.status !== 'approved' && (
                          <button
                            onClick={() => handleApprove(member._id)}
                            title="Approve Member"
                            className="p-1.5 text-green-600 hover:bg-green-50 rounded-lg transition cursor-pointer"
                          >
                            <Check className="w-4 h-4" />
                          </button>
                        )}

                        {/* Reject */}
                        {member.status !== 'rejected' && (
                          <button
                            onClick={() => handleReject(member._id)}
                            title="Reject Member"
                            className="p-1.5 text-amber-600 hover:bg-amber-50 rounded-lg transition cursor-pointer"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        )}

                        {/* Edit */}
                        <button
                          onClick={() => {
                            setEditingStaffing(member);
                            setFormData({
                              staffingName: member.staffingName || '',
                              designation: member.designation || '',
                              email: member.email || '',
                              password: '',
                              mobileNumber: member.mobileNumber || '',
                            });
                          }}
                          title="Edit"
                          className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition cursor-pointer"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>

                        {/* Delete */}
                        <button
                          onClick={() => setDeletingId(member._id)}
                          title="Delete"
                          className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {staffingPagination?.totalPages > 1 && (
          <div className="p-4 border-t border-gray-100 flex justify-between items-center">
            <span className="text-xs text-gray-500">
              Showing page {staffingPagination.currentPage || currentPage} of {staffingPagination.totalPages}
            </span>
            <Pagination
              page={staffingPagination.currentPage || currentPage}
              totalPages={staffingPagination.totalPages}
              onPageChange={(page) => setCurrentPage(page)}
            />
          </div>
        )}
      </div>

      {/* Add / Edit Staffing Modal */}
      {(showAddModal || editingStaffing) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 relative">
            <button
              onClick={() => {
                setShowAddModal(false);
                setEditingStaffing(null);
              }}
              className="absolute right-4 top-4 text-gray-400 hover:text-gray-600 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <h2 className="text-xl font-bold text-gray-900 mb-4">
              {editingStaffing ? 'Edit Staffing Member' : 'Add Staffing Member'}
            </h2>

            <form onSubmit={editingStaffing ? handleEditSubmit : handleAddSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Staffing Name *
                </label>
                <input
                  type="text"
                  name="staffingName"
                  required
                  value={formData.staffingName}
                  onChange={handleInputChange}
                  placeholder="e.g. Rahul Sharma"
                  className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#8931BA]/30"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Designation *
                </label>
                <input
                  type="text"
                  name="designation"
                  required
                  value={formData.designation}
                  onChange={handleInputChange}
                  placeholder="e.g. IT Sales Executive"
                  className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#8931BA]/30"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Email *
                </label>
                <input
                  type="email"
                  name="email"
                  required
                  disabled={!!editingStaffing}
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="name@company.com"
                  className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#8931BA]/30 disabled:bg-gray-100"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Password {editingStaffing ? '(Leave blank to keep unchanged)' : '*'}
                </label>
                <input
                  type="password"
                  name="password"
                  required={!editingStaffing}
                  value={formData.password}
                  onChange={handleInputChange}
                  placeholder="••••••••"
                  className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#8931BA]/30"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Mobile Number
                </label>
                <input
                  type="tel"
                  name="mobileNumber"
                  disabled={!!editingStaffing}
                  value={formData.mobileNumber}
                  onChange={handleInputChange}
                  placeholder="e.g. 9876543210"
                  className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#8931BA]/30 disabled:bg-gray-100"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddModal(false);
                    setEditingStaffing(null);
                  }}
                  className="px-4 py-2 border border-gray-200 rounded-xl text-sm text-gray-600 hover:bg-gray-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="px-5 py-2 bg-gradient-to-r from-[#8931BA] to-fuchsia-600 text-white text-sm font-semibold rounded-xl hover:opacity-90 transition cursor-pointer flex items-center gap-1.5"
                >
                  {actionLoading ? 'Saving...' : editingStaffing ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deletingId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6 text-center">
            <div className="w-12 h-12 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-3">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-1">Delete Staffing Member?</h3>
            <p className="text-xs text-gray-500 mb-5">
              This action will soft-delete the member and cascade-delete associated companies and jobs.
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setDeletingId(null)}
                className="flex-1 py-2 border border-gray-200 text-sm font-semibold text-gray-600 rounded-xl hover:bg-gray-50 cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(deletingId)}
                className="flex-1 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-semibold rounded-xl cursor-pointer"
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

export default StaffingManagement;
