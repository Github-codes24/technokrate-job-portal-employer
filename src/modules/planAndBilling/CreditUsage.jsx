import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchCreditStats, fetchCreditHistory } from '../../redux/slices/creditTransaction/creditAndTransactionSlice';
import { fetchRemainingCredits } from '../../redux/slices/candidateUnlock/creditDeductionSlice';
import { Briefcase, Database, AlertTriangle, ChevronDown, ChevronLeft, ChevronRight, Loader2, TrendingUp, TrendingDown } from 'lucide-react';

const CreditUsage = () => {
  const dispatch = useDispatch();
  const { stats, history, historyPagination, tableLoading, loading } = useSelector((state) => state.creditAndTransaction);
  const { remainingCredits } = useSelector((state) => state.creditDeduction);

  const [filter, setFilter] = useState('All');
  const [currentPage, setCurrentPage] = useState(1);
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  useEffect(() => {
    dispatch(fetchCreditStats());
    dispatch(fetchRemainingCredits());
  }, [dispatch]);

  useEffect(() => {
    const tag = filter === 'All' ? '' : filter === 'Added' ? 'Credit_Added' : 'Credit_Spent';
    dispatch(fetchCreditHistory({ page: currentPage, limit: 10, tag }));
  }, [dispatch, filter, currentPage]);

  return (
    <div className="min-h-screen bg-white px-4 py-2 font-sans">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-8 flex items-end justify-between animate-in fade-in slide-in-from-bottom-3">
          <div>
            {/* <p className="text-md font-medium tracking-[0.2em] text-violet-600">Dashboard</p> */}
            <h1 className="text-2xl font-medium tracking-tight text-slate-900">Credit Usage</h1>
            <p className="mt-1 text-sm font-medium text-slate-500">Manage your job and candidate search credits</p>
          </div>
          {loading && (
            <div className="flex items-center gap-2 text-xs font-bold text-gray-900">
              <Loader2 className="animate-spin text-violet-600" size={16} /> Syncing...
            </div>
          )}
        </div>

        {/* Stats Grid */}
        <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-2 animate-in fade-in slide-in-from-bottom-4">
          <CreditStatCard
            title="Job Credits"
            value={stats?.jobCredits}
            Icon={Briefcase}
            expiry={stats?.expiresOn}
            color="violet"
          />
          <CreditStatCard
            title="Database Credits"
            value={remainingCredits ?? stats?.databaseCredits}
            Icon={Database}
            color="indigo"
          />
        </div>

        {/* History Table Container */}
        <div className="overflow-hidden rounded-2xl border border-violet-100 bg-white shadow-sm animate-in fade-in slide-in-from-bottom-5">
          <div className="flex items-center justify-between border-b border-violet-50 p-6">
            <div>
              <h2 className="text-lg font-medium tracking-tight text-slate-900">History Log</h2>
              {/* <p className="text-md font-bold text-gray-900 ">{historyPagination.totalResults ?? 0} Transactions</p> */}
            </div>

            {/* Filter Dropdown */}
            {/* <div className="relative">
              <button
                onClick={() => setIsFilterOpen(!isFilterOpen)}
                className={`flex items-center gap-2 rounded-xl border px-4 py-2 text-xs font-bold transition-all ${
                  isFilterOpen ? 'border-violet-300 bg-violet-50 text-violet-600' : 'border-slate-200 bg-white text-slate-700'
                }`}
              >
                {filter} <ChevronDown size={14} className={`transition-transform ${isFilterOpen ? 'rotate-180' : ''}`} />
              </button>
              
              {isFilterOpen && (
                <div className="absolute right-0 top-full z-20 mt-2 w-32 origin-top-right rounded-xl border border-violet-100 bg-white p-1.5 shadow-xl animate-in zoom-in-95 duration-100">
                  {['All', 'Added', 'Spent'].map(opt => (
                    <button
                      key={opt}
                      onClick={() => { setFilter(opt); setCurrentPage(1); setIsFilterOpen(false); }}
                      className={`w-full rounded-lg px-3 py-2 text-left text-xs font-bold transition-colors ${
                        filter === opt ? 'bg-violet-50 text-violet-600' : 'text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              )}
            </div> */}
          </div>

          <div className="relative p-4">
            {tableLoading && (
              <div className="absolute inset-0 z-10 flex items-center justify-center bg-white/60 backdrop-blur-[1px]">
                <Loader2 className="animate-spin text-violet-600" size={20} />
              </div>
            )}
            <table className="w-full text-left ">
              <thead className="bg-purple-50">
                <tr className="border-b border-violet-50">
                  <th className="px-6 py-4 text-md font-medium  text-gray-900">Transaction ID</th>
                  <th className="px-6 py-4 text-md font-medium  text-gray-900">Details</th>
                  <th className="px-6 py-4 text-right text-md font-medium  text-gray-900">Date & Time</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-violet-50">
                {history.length > 0 ? (
                  history.map((t) => (
                    <tr key={t.transactionId} className="hover:bg-violet-50/30 transition-colors">
                      <td className="px-6 py-4">
                        <p className="font-mono text-md font-bold text-slate-900">#{t.transactionId}</p>
                        <CreditTag tag={t.tag} />
                      </td>
                      <td className="px-6 py-4 text-md font-medium text-slate-500">{t.reason}</td>
                      <td className="px-6 py-4 text-right">
                        <span className="font-mono text-md font-bold text-slate-600">
                          {new Date(t.date).toLocaleString('en-IN', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="3" className="px-6 py-4 text-center text-md font-medium text-slate-500">
                      No transactions found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between border-t border-violet-50 p-5">
            <span className="text-xs font-semibold text-slate-500">
              Page <span className="text-slate-900">{currentPage}</span> of {historyPagination.totalPages || 1}
            </span>
            <div className="flex gap-2">
              <button disabled={currentPage === 1} onClick={() => setCurrentPage(p => p - 1)} className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-gray-900 disabled:opacity-25 hover:border-violet-300 hover:text-violet-600">
                <ChevronLeft size={18} />
              </button>
              <button disabled={currentPage === historyPagination.totalPages} onClick={() => setCurrentPage(p => p + 1)} className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-gray-900 disabled:opacity-25 hover:border-violet-300 hover:text-violet-600">
                <ChevronRight size={18} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const CreditStatCard = ({ title, value, Icon, expiry, color }) => {
  const isViolet = color === 'violet';
  const accent = isViolet
    ? { bg: 'bg-violet-600', light: 'bg-violet-50', text: 'text-violet-600', border: 'border-violet-200', shadow: 'shadow-violet-100' }
    : { bg: 'bg-indigo-600', light: 'bg-indigo-50', text: 'text-indigo-600', border: 'border-indigo-200', shadow: 'shadow-indigo-100' };

  return (
    <div className={`group relative overflow-hidden rounded-3xl border bg-white p-8 shadow-sm transition-all hover:shadow-xl ${accent.border} ${accent.shadow}`}>
      {/* Decorative corner accent — contained and non-overlapping */}
      <div className={`pointer-events-none absolute right-0 top-0 h-32 w-32 rounded-bl-[4rem] ${accent.bg} opacity-[0.06]`} />

      <div className="flex items-start justify-between gap-4">
        {/* Left: title + value + expiry */}
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2.5 mb-3">
            {/* Icon badge — clearly separated, no overlap */}
            <div className={`flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-2xl ${accent.light} ${accent.text}`}>
              <Icon size={22} strokeWidth={1.8} />
            </div>
            <p className={`text-sm font-semibold tracking-wide ${accent.text}`}>{title}</p>
          </div>
          <h3 className="text-5xl font-semibold tracking-tighter text-slate-900">{value ?? 0}</h3>
          {expiry && (
            <div className="mt-4 inline-flex items-center gap-1.5 rounded-lg border border-amber-100 bg-amber-50 px-3 py-1 text-xs font-bold text-amber-700">
              <AlertTriangle size={12} />
              Expires {new Date(expiry).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
            </div>
          )}
        </div>

        {/* Right: large decorative icon (purely decorative, no background circle overlap) */}
        <div className={`flex-shrink-0 flex h-16 w-16 items-center justify-center rounded-2xl ${accent.light}`}>
          <Icon size={32} className={`${accent.text} opacity-60`} strokeWidth={1.4} />
        </div>
      </div>
    </div>
  );
};

const CreditTag = ({ tag }) => {
  const isAdded = tag?.includes('Added');
  return (
    <span className={`mt-1 inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[9px] font-medium  ${isAdded ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'
      }`}>
      {isAdded ? <TrendingUp size={10} /> : <TrendingDown size={10} />}
      {tag?.replace(/_/g, ' ')}
    </span>
  );
};

export default CreditUsage;