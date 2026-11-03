import React, { useState, useEffect, useMemo } from "react";
import {
  Briefcase,
  Download,
  Users,
  CheckCircle2,
  XCircle,
  ChevronLeft,
  ChevronRight,
  Calendar,
  Clock,
} from "lucide-react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
  createColumnHelper,
} from "@tanstack/react-table";
import { fetchRecentJobs } from "../../redux/slices/dashboard/dashboardSlice";
import JobDetailModal from "./JobDetailModal";
import Pagination from "../../components/common/Pagination";

// ─── Status Badge Component ──────────────────────────────────────────────────
const StatusBadge = ({ status }) => {
  const normalizedStatus = status?.toLowerCase();
  const isActive = normalizedStatus === "active";

  return (
    <span
      className={`inline-flex items-center gap-1.5 text-sm font-semibold ${isActive ? "text-green-600" : "text-red-500"
        }`}
    >
      {isActive ? (
        <CheckCircle2 className="w-4 h-4" strokeWidth={2} />
      ) : (
        <XCircle className="w-4 h-4" strokeWidth={2} />
      )}
      {status ? status.charAt(0).toUpperCase() + status.slice(1) : "N/A"}
    </span>
  );
};

// ─── Stat Card Component ──────────────────────────────────────────────────────
const StatCard = ({ stat, onClick }) => {
  const Icon = stat.icon;
  return (
    <div
      onClick={onClick}
      className={`flex items-center justify-between rounded-2xl px-6 py-5 flex-1 ${stat.bg} cursor-pointer transition-all duration-200 hover:shadow-lg hover:scale-105`}
    >
      <div>
        <p className={`text-3xl font-bold ${stat.valueColor}`}>{stat.value}</p>
        <p className="text-sm text-gray-500 mt-1">{stat.label}</p>
      </div>
      <div className={`w-14 h-14 rounded-xl flex items-center justify-center ${stat.iconBg}`}>
        <Icon className={`w-7 h-7 ${stat.iconColor}`} strokeWidth={1.6} />
      </div>
    </div>
  );
};

// ─── Main Dashboard ───────────────────────────────────────────────────────────

const DashboardDateTime = React.memo(() => {
  const [dateTime, setDateTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setDateTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <>
      <div className="flex items-center gap-1.5">
        <Calendar className="w-4 h-4 text-purple-500" strokeWidth={1.8} />
        <span>{dateTime.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</span>
      </div>
      <div className="flex items-center gap-1.5">
        <Clock className="w-4 h-4 text-purple-500" strokeWidth={1.8} />
        <span>{dateTime.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: true })}</span>
      </div>
    </>
  );
});

const Dashboard = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { profileData } = useSelector((state) => state.company);
  const { jobs, pagination, loading } = useSelector((state) => state.dashboard); // Added loading

  const employerName = profileData?.name || ".....";
  const [selectedJob, setSelectedJob] = useState(null);

  useEffect(() => {
    dispatch(fetchRecentJobs({ page: pagination?.currentPage || 1, limit: 5 }));
  }, [dispatch, pagination?.currentPage]);

  const handlePageChange = (page) => {
    dispatch(fetchRecentJobs({ page: page, limit: 5 }));
  };

  const columnHelper = createColumnHelper();

  const columns = useMemo(() => [
    columnHelper.accessor("jobTitle", {
      header: "Jobs",
      cell: (info) => (
        <div>
          <p className="text-sm font-semibold text-gray-800">{info.getValue()}</p>
          <p className="text-xs text-gray-400 mt-0.5">
            {info.row.original.jobType} &bull; {info.row.original.expireDate}
          </p>
        </div>
      ),
    }),
    columnHelper.accessor("status", {
      header: "Status",
      cell: (info) => <StatusBadge status={info.getValue()} />,
    }),
    // FIX 1: Changed "applications" to "applicantCount" to match API payload
    columnHelper.accessor("applicantCount", {
      header: "Applicants",
      cell: (info) => (
        <div
          onClick={() => navigate(`/my-job/applicant/${info.row.original._id}`)}
          className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer hover:text-purple-600"
        >
          <Users className="w-4 h-4 text-gray-400" strokeWidth={1.6} />
          {info.getValue() || 0} Applicants
        </div>
      ),
    }),
    columnHelper.accessor("databaseMatches", {
      header: "Database Matches",
      cell: (info) => (
        <div
          onClick={() => navigate(`/my-job/dbmatch/${info.row.original._id}`)}
          className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer hover:text-purple-600"
        >
          <Briefcase className="w-4 h-4 text-gray-400" />
          {info.getValue() || 0} Matches
        </div>
      ),
    }),
    columnHelper.display({
      id: "actions",
      header: "Action",
      cell: (info) => (
        <button
          onClick={() => setSelectedJob(info.row.original)}
          className="px-4 py-2 rounded-lg text-sm font-semibold transition border border-purple-500 text-purple-600 hover:bg-purple-600 hover:text-white"
        >
          View Post Job
        </button>
      ),
    }),
  ], [setSelectedJob, columnHelper]);

  const table = useReactTable({
    data: jobs || [],
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  // Dynamic stats from API
  const STATS = [
    {
      value: (pagination?.totalJobs ?? 0).toString(),
      label: "Total Posts Jobs",
      icon: Briefcase,
      bg: "bg-purple-50",
      iconBg: "bg-purple-100",
      iconColor: "text-purple-600",
      valueColor: "text-purple-800",
      onClick: () => navigate("/my-job"),
    },
    {
      value: "0",
      label: "Total Candidates Unlocked",
      icon: Users,
      bg: "bg-yellow-50",
      iconBg: "bg-yellow-100",
      iconColor: "text-yellow-600",
      valueColor: "text-yellow-800",
      onClick: () => navigate("/database/unlocked"),
    },
    {
      value: "0",
      label: "Total Excel Downloads",
      icon: Download,
      bg: "bg-green-50",
      iconBg: "bg-green-100",
      iconColor: "text-green-600",
      valueColor: "text-green-800",
      onClick: () => navigate("/my-job"),
    },
  ];

  return (
    <>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700;800&display=swap');`}</style>
      <div className="min-h-screen bg-white p-5 rounded-xl" style={{ fontFamily: "'Poppins', sans-serif" }}>
        <div className="max-w-9xl mx-auto">
          {/* Header */}
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-900">
              Hello, <span className="bg-gradient-to-r from-purple-600 to-pink-500 bg-clip-text text-transparent ml-1">{employerName}</span>
            </h1>
            <p className="text-sm text-gray-400 mt-0.5">Here is your daily activities and applications</p>
          </div>

          {/* Info Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
            <h2 className="text-base font-bold text-gray-800">Dashboard</h2>
            <div className="flex items-center gap-3 sm:gap-4 text-xs sm:text-sm text-gray-500">
              <DashboardDateTime />
            </div>
          </div>

          {/* Stat Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 mb-6">
            {STATS.map((stat, i) => (
              <StatCard key={i} stat={stat} onClick={stat.onClick} />
            ))}
          </div>

          {/* Table Container */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100">
              <h3 className="text-base font-bold text-gray-800">Recent Post Job</h3>
            </div>

            <div className="overflow-x-auto">
              <div className="min-w-[800px]">
                {/* Table Header */}
                <div className="grid grid-cols-[2fr_1fr_1.5fr_1.5fr_1.5fr] px-6 py-3 bg-gray-50 border-b border-gray-100">
                  {table.getHeaderGroups().map(headerGroup => (
                    headerGroup.headers.map(header => (
                      <span key={header.id} className="text-sm font-semibold text-gray-600  ">
                        {flexRender(header.column.columnDef.header, header.getContext())}
                      </span>
                    ))
                  ))}
                </div>

                {/* Table Body */}
                {loading ? (
                  <div className="flex items-center justify-center py-10">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
                  </div>
                ) : table.getRowModel().rows.length > 0 ? (
                  table.getRowModel().rows.map((row, idx) => (
                    <div
                      key={row.id}
                      className={`grid grid-cols-[2fr_1fr_1.5fr_1.5fr_1.5fr] px-6 py-4 items-center hover:bg-gray-50 transition ${idx < jobs.length - 1 ? "border-b border-gray-100" : ""
                        }`}
                    >
                      {row.getVisibleCells().map(cell => (
                        <div key={cell.id}>
                          {flexRender(cell.column.columnDef.cell, cell.getContext())}
                        </div>
                      ))}
                    </div>
                  ))
                ) : (
                  <div className="flex flex-col items-center justify-center py-12">
                    <p className="text-sm text-gray-500 font-medium">No Jobs Posted Yet</p>
                  </div>
                )}
              </div>
            </div>

            {/* Pagination */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-6 py-4 border-t border-gray-100 bg-white">
              <p className="text-xs text-gray-500">
                Showing <span className="font-semibold text-gray-700">{jobs?.length > 0 ? (((pagination?.currentPage ?? 1) - 1) * 5) + 1 : 0}</span> to{' '}
                <span className="font-semibold text-gray-700">{Math.min((pagination?.currentPage ?? 1) * 5, pagination?.totalJobs ?? 0)}</span> of{' '}
                <span className="font-semibold text-purple-600 font-bold">{pagination?.totalJobs ?? 0}</span> total entries
                <span className="ml-2 text-gray-400 font-normal">
                  (Page <span className="font-semibold text-gray-600">{pagination?.currentPage ?? 1}</span> of <span className="font-semibold text-gray-600">{pagination?.totalPages ?? 1}</span>)
                </span>
              </p>
              <Pagination
                page={pagination?.currentPage ?? 1}
                totalPages={pagination?.totalPages ?? 1}
                onPageChange={handlePageChange}
                maxVisible={5}
              />
            </div>
          </div>
        </div>
      </div>
      {selectedJob && (
        <JobDetailModal
          jobId={selectedJob._id}
          listJob={selectedJob}
          onClose={() => setSelectedJob(null)}
        />
      )}
    </>
  );
};

export default Dashboard;