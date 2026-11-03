import React, { useState, useEffect, useMemo, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchBillingTransactions,
  fetchTransactionById,
  resetSelectedTransaction,
} from "../../redux/slices/creditTransaction/creditAndTransactionSlice";
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
} from "@tanstack/react-table";
import {
  Search,
  Eye,
  X,
  Receipt,
  Loader2,
  Building2,
  Download,
} from 'lucide-react';
import Pagination from '../../components/common/Pagination';

const BillingDetail = () => {
  const dispatch = useDispatch();
  const { transactions, billingProfile, transactionPagination, tableLoading } =
    useSelector((state) => state.creditAndTransaction);

  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(1);

  useEffect(() => {
    dispatch(fetchBillingTransactions({ page, limit: 10, search: searchTerm }));
  }, [dispatch, page, searchTerm]);

  const handleViewClick = useCallback(
    (id) => {
      dispatch(resetSelectedTransaction());
      setIsDetailModalOpen(true);
      dispatch(fetchTransactionById(id));
    },
    [dispatch],
  );

  const columns = useMemo(
    () => [
      {
        header: "Order ID",
        accessorKey: "transactionId",
        cell: ({ getValue }) => (
          <span className="font-mono text-xs font-bold text-slate-900">
            #{getValue()}
          </span>
        ),
      },
      {
        header: "Method",
        accessorKey: "paymentMethod",
        cell: ({ getValue }) => (
          <span className="rounded-md bg-violet-100 px-2 py-1 text-[10px] font-medium   text-violet-600">
            {getValue()}
          </span>
        ),
      },
      {
        header: "Amount",
        accessorKey: "amount",
        cell: ({ getValue }) => (
          <span className="text-sm font-medium  text-slate-900">
            ₹{getValue()}
          </span>
        ),
      },
      {
        header: "Date",
        accessorKey: "date",
        cell: ({ getValue }) => (
          <span className="text-xs font-medium text-slate-500">
            {new Date(getValue()).toLocaleDateString("en-IN", {
              day: "2-digit",
              month: "short",
              year: "numeric",
            })}
          </span>
        ),
      },
      {
        header: "Status",
        accessorKey: "status",
        cell: ({ getValue }) => <StatusBadge status={getValue()} />,
      },
      {
        header: "Actions",
        id: "action",
        cell: ({ row }) => (
          <button
            onClick={() => handleViewClick(row.original._id)}
            className="flex items-center gap-1.5 rounded-lg border border-violet-100 bg-white px-3 py-1.5 text-xs font-bold text-violet-600 transition-all hover:bg-violet-50 hover:border-violet-300"
          >
            <Eye size={14} /> View
          </button>
        ),
      },
    ],
    [handleViewClick],
  );

  const table = useReactTable({
    data: transactions || [],
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <div className="min-h-screen bg-white px-4 py-2 font-sans">
      <div className="mx-auto max-w-9xl">
        {/* Header */}
        <div className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-center animate-in fade-in slide-in-from-bottom-3">
          <div>
            {/* <p className="text-[10px] font-medium   text-violet-600">Finance</p> */}
            <h1 className="text-2xl font-medium  text-slate-900">
              Billing History
            </h1>
          </div>

          {/* <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-violet-400" size={16} />
            <input
              type="text"
              placeholder="Search invoice..."
              className="w-full rounded-xl border border-violet-100 bg-white py-2.5 pl-10 pr-4 text-sm outline-none transition-all focus:border-violet-500 md:w-64"
              value={searchTerm}
              onChange={(e) => { setSearchTerm(e.target.value); setPage(1); }}
            />
          </div> */}
        </div>

        {/* Profile Card */}
        <div className="relative mb-6 flex items-center justify-between overflow-hidden rounded-2xl border border-violet-100 bg-white p-6 shadow-sm animate-in fade-in slide-in-from-bottom-4">
          <div className="absolute inset-y-0 left-0 w-1 bg-gradient-to-b from-violet-600 to-violet-400" />
          <div className="flex items-center gap-4 pl-2">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-violet-50 text-violet-600">
              <Building2 size={24} />
            </div>
            <div>
              <p className="text-[10px] font-medium   text-gray-700">
                Company Details
              </p>
              <p className="text-lg font-medium text-slate-900">
                {billingProfile?.companyName || "—"}
              </p>
              <p className="text-sm font-medium text-slate-500">
                GSTIN: {billingProfile?.GSTNumber || "N/A"}
              </p>
            </div>
          </div>
          {/* <button className="hidden rounded-xl border border-violet-200 px-5 py-2 text-xs font-bold text-violet-600 transition-all hover:bg-violet-50 sm:block">
            Edit Profile
          </button> */}
        </div>

        {/* Table Container */}
        <div className="relative overflow-hidden rounded-2xl border border-violet-100 bg-white shadow-sm animate-in fade-in slide-in-from-bottom-5">
          {tableLoading && (
            <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-white/60 backdrop-blur-[2px]">
              <Loader2 className="animate-spin text-violet-600" size={24} />
              <span className="mt-2 text-[10px] font-bold text-gray-700  er">
                Loading Transactions
              </span>
            </div>
          )}

          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-purple-50">
                {table.getHeaderGroups().map((hg) => (
                  <tr key={hg.id} className="border-b border-violet-50">
                    {hg.headers.map((h) => (
                      <th
                        key={h.id}
                        className="px-6 py-4 text-md font-bold  text-gray-900"
                      >
                        {flexRender(h.column.columnDef.header, h.getContext())}
                      </th>
                    ))}
                  </tr>
                ))}
              </thead>
              <tbody className="divide-y divide-violet-50">
                {table.getRowModel().rows.length > 0 ? (
                  table.getRowModel().rows.map((row) => (
                    <tr
                      key={row.id}
                      className="group transition-colors hover:bg-violet-50/50"
                    >
                      {row.getVisibleCells().map((cell) => (
                        <td key={cell.id} className="px-6 py-4">
                          <div className="max-w-[250px] truncate">
                            {flexRender(
                              cell.column.columnDef.cell,
                              cell.getContext(),
                            )}
                          </div>
                        </td>
                      ))}
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan={columns.length}
                      className="px-6 py-6 text-center text-gray-500"
                    >
                      No transactions found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between border-t border-violet-50 p-5">
            <span className="text-xs font-semibold text-slate-500">Page <span className="text-slate-900">{page}</span> of <span className="text-slate-900">{transactionPagination?.totalPages || 1}</span></span>
              <div className="flex gap-2">
                <Pagination
                  page={page}
                  totalPages={transactionPagination?.totalPages || 1}
                  onPageChange={(p) => setPage(p)}
                  maxVisible={5}
                />
              </div>
          </div>
        </div>
      </div>

      {isDetailModalOpen && (
        <TransactionDetailsModal onClose={() => setIsDetailModalOpen(false)} />
      )}
    </div>
  );
};

const StatusBadge = ({ status }) => {
  const isSuccess = status === "success";
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[10px] font-medium   ${
        isSuccess
          ? "border-emerald-200 bg-emerald-50 text-emerald-600"
          : "border-red-200 bg-red-50 text-red-600"
      }`}
    >
      <span
        className={`h-1.5 w-1.5 rounded-full ${isSuccess ? "bg-emerald-500" : "bg-red-500"}`}
      />
      {status}
    </span>
  );
};

const TransactionDetailsModal = ({ onClose }) => {
  const { selectedTransaction, loading } = useSelector(
    (state) => state.creditAndTransaction,
  );
  const isLoading = !selectedTransaction || loading;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="w-full max-w-md overflow-hidden rounded-[2rem] bg-white shadow-2xl animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="relative bg-gradient-to-br from-violet-800 to-violet-600 p-8 text-center text-white">
          <button
            onClick={onClose}
            className="absolute right-4 top-4 rounded-xl bg-white/10 p-2 transition-colors hover:bg-white/20"
          >
            <X size={18} />
          </button>
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full border border-white/20 bg-white/10 shadow-inner">
            <Receipt size={32} />
          </div>
          <p className="text-[10px] font-medium   text-white/60">
            Payment Receipt
          </p>
          <h3 className="text-3xl font-medium er">
            {isLoading ? "—" : `₹${selectedTransaction.amount}`}
          </h3>
        </div>

        {/* Body */}
        <div className="p-8">
          <div className="space-y-4">
            {isLoading ? (
              [1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className="h-4 w-full animate-pulse rounded bg-slate-100"
                />
              ))
            ) : (
              <>
                <div className="flex justify-between border-b border-slate-50 pb-3">
                  <span className="text-[10px] font-bold   text-gray-700">
                    Order ID
                  </span>
                  <span className="font-mono text-sm font-bold text-slate-900">
                    #{selectedTransaction.transactionId}
                  </span>
                </div>
                <div className="flex justify-between border-b border-slate-50 pb-3">
                  <span className="text-[10px] font-bold   text-gray-700">
                    Date
                  </span>
                  <span className="text-sm font-bold text-slate-900">
                    {new Date(selectedTransaction.date).toLocaleDateString(
                      "en-IN",
                      { day: "2-digit", month: "long", year: "numeric" },
                    )}
                  </span>
                </div>
                <div className="flex justify-between border-b border-slate-50 pb-3">
                  <span className="text-[10px] font-bold   text-gray-700">
                    Status
                  </span>
                  <StatusBadge status={selectedTransaction.status} />
                </div>
              </>
            )}
          </div>

          <div className="mt-8 flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 rounded-xl border border-slate-200 py-3 text-sm font-bold text-slate-500 transition-colors hover:border-violet-300 hover:text-violet-600"
            >
              Close
            </button>
            {/* <button disabled={isLoading} className="flex flex-[2] items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-violet-700 to-violet-600 py-3 text-sm font-bold text-white shadow-lg shadow-violet-200 transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50">
              <Download size={16} /> Download PDF
            </button> */}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BillingDetail;
