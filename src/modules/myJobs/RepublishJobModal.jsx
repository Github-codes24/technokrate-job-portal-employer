import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import {
  RotateCcw,
  Calendar,
  X,
  CheckCircle2,
  AlertCircle,
  Clock,
  Sparkles,
  Loader2,
} from 'lucide-react';
import { republishJob } from '../../redux/slices/companyJobs/jobSlice';

const formatDate = (date) => {
  if (!date) return 'N/A';
  return new Date(date).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
};

const getFutureDateISO = (daysAhead) => {
  const d = new Date();
  d.setDate(d.getDate() + daysAhead);
  d.setHours(23, 59, 59, 999);
  return d.toISOString();
};

const getFutureDateInputFormat = (daysAhead) => {
  const d = new Date();
  d.setDate(d.getDate() + daysAhead);
  return d.toISOString().split('T')[0];
};

const RepublishJobModal = ({ job, onClose, onSuccess }) => {
  const dispatch = useDispatch();
  const { republishLoading } = useSelector((state) => state.job);

  // Default to 30 days in future
  const [selectedDate, setSelectedDate] = useState(() => getFutureDateInputFormat(30));
  const [presetDays, setPresetDays] = useState(30);

  const jobId = job?._id || job?.id;
  const currentExpireDate = job?.advanceInformation?.expireDate || job?.expireDate;

  const handlePresetClick = (days) => {
    setPresetDays(days);
    setSelectedDate(getFutureDateInputFormat(days));
  };

  const handleDateChange = (e) => {
    setSelectedDate(e.target.value);
    setPresetDays(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!jobId) {
      toast.error('Job ID is missing');
      return;
    }

    if (!selectedDate) {
      toast.warn('Please select a valid expiration date');
      return;
    }

    // Convert date string YYYY-MM-DD to full ISO format at end of that day
    const chosenDate = new Date(`${selectedDate}T23:59:59.000Z`);
    if (isNaN(chosenDate.getTime())) {
      toast.error('Invalid date format');
      return;
    }

    if (chosenDate <= new Date()) {
      toast.warn('Expiration date must be in the future');
      return;
    }

    const isoString = chosenDate.toISOString();

    const result = await dispatch(republishJob({ jobId, newExpireDate: isoString }));
    if (republishJob.fulfilled.match(result)) {
      toast.success(result.payload?.message || 'Job republished successfully!');
      if (onSuccess) onSuccess(result.payload?.data);
      onClose();
    } else {
      toast.error(result.payload || 'Failed to republish job');
    }
  };

  const minDate = getFutureDateInputFormat(1);

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Modal Dialog */}
      <div className="relative bg-white rounded-3xl shadow-2xl border border-gray-100 w-full max-w-md overflow-hidden transform transition-all animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-700 via-purple-600 to-pink-600 p-6 text-white relative">
          <button
            onClick={onClose}
            className="absolute top-5 right-5 w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition"
          >
            <X className="w-4 h-4" />
          </button>
          <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center mb-3">
            <RotateCcw className="w-6 h-6 text-white" />
          </div>
          <h3 className="text-xl font-bold">Republish / Renew Job</h3>
          <p className="text-white/80 text-xs mt-1">
            Make this job live again with a new expiration date
          </p>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Job summary info */}
          <div className="bg-purple-50/60 border border-purple-100 rounded-2xl p-4">
            <p className="text-[11px] font-bold text-purple-600 uppercase tracking-wider">
              Selected Job
            </p>
            <p className="text-sm font-bold text-gray-900 mt-0.5 truncate">
              {job?.jobTitle || 'Job Post'}
            </p>
            <div className="flex items-center gap-2 mt-2 text-xs text-gray-500">
              <Clock className="w-3.5 h-3.5 text-gray-400" />
              <span>Current Expiry: </span>
              <span className="font-semibold text-gray-700">
                {formatDate(currentExpireDate)}
              </span>
            </div>
          </div>

          {/* Quick preset buttons */}
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-2">
              Select Expiration Extension
            </label>
            <div className="grid grid-cols-4 gap-2">
              {[
                { days: 15, label: '+15 Days' },
                { days: 30, label: '+30 Days' },
                { days: 60, label: '+60 Days' },
                { days: 90, label: '+90 Days' },
              ].map((p) => (
                <button
                  key={p.days}
                  type="button"
                  onClick={() => handlePresetClick(p.days)}
                  className={`py-2 px-2 rounded-xl text-xs font-semibold border transition ${
                    presetDays === p.days
                      ? 'bg-purple-600 text-white border-purple-600 shadow-sm shadow-purple-200'
                      : 'bg-gray-50 hover:bg-gray-100 text-gray-600 border-gray-200'
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          {/* Custom Date Input */}
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1.5 flex items-center justify-between">
              <span>Custom Expiration Date</span>
              <span className="text-[10px] text-gray-400 font-normal">YYYY-MM-DD</span>
            </label>
            <div className="relative">
              <input
                type="date"
                min={minDate}
                value={selectedDate}
                onChange={handleDateChange}
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium text-gray-800 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500"
              />
            </div>
            <p className="text-[11px] text-gray-400 mt-1.5 flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-purple-500" />
              The job status will automatically be set to{' '}
              <strong className="text-green-600">Active</strong>.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={republishLoading}
              className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm font-semibold text-gray-600 hover:bg-gray-50 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={republishLoading}
              className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white text-sm font-bold shadow-md shadow-purple-200 flex items-center justify-center gap-2 transition disabled:opacity-50"
            >
              {republishLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Republishing...
                </>
              ) : (
                <>
                  <RotateCcw className="w-4 h-4" />
                  Republish Job
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RepublishJobModal;
