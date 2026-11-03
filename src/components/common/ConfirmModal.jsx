import { createPortal } from "react-dom";
import { Loader2 } from "lucide-react";

const ConfirmModal = ({
  isOpen,
  title = "Confirm",
  message = "Are you sure?",
  confirmLabel = "Confirm",   // matches parent's prop name
  confirmText,                // fallback alias so old usage doesn't break
  cancelText = "Cancel",
  isLoading = false,
  onConfirm,
  onCancel,
}) => {
  if (!isOpen) return null;

  // support both confirmLabel and confirmText
  const btnLabel = confirmLabel || confirmText || "Confirm";

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/30 backdrop-blur-md">
      <div className="relative bg-white w-[360px] rounded-2xl shadow-2xl px-8 py-10 text-center">

        {/* Close — disabled while loading */}
        <button
          onClick={onCancel}
          disabled={isLoading}
          className="absolute top-3 right-3 w-7 h-7 rounded-full border-2 border-purple-400 flex items-center justify-center text-purple-500 hover:bg-purple-50 transition text-sm font-bold disabled:opacity-30 disabled:cursor-not-allowed"
        >
          ✕
        </button>

        <h2 className="text-2xl font-bold text-gray-800 mb-3">{title}</h2>
        <p className="text-gray-500 text-sm mb-8">{message}</p>

        <div className="flex justify-center gap-4">
          <button
            onClick={onCancel}
            disabled={isLoading}
            className="px-8 py-2.5 rounded-full border-2 border-purple-600 text-purple-600 font-semibold hover:bg-purple-50 transition text-sm disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {cancelText}
          </button>

          <button
            onClick={onConfirm}
            disabled={isLoading}
            className="min-w-[110px] px-8 py-2.5 rounded-full bg-purple-600 hover:bg-purple-700 text-white font-semibold transition text-sm flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Processing...
              </>
            ) : (
              btnLabel
            )}
          </button>
        </div>

      </div>
    </div>,
    document.body
  );
};

export default ConfirmModal;