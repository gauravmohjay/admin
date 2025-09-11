import { AlertCircle, RefreshCw } from "lucide-react";

export function ErrorBanner({ message, onRetry }) {
  return (
    <div
      role="alert"
      className="flex items-center justify-between gap-4 p-4 mb-4 text-sm text-red-600 bg-red-50 border border-red-200 rounded"
    >
      <div className="flex items-center gap-2">
        <AlertCircle size={16} />
        <span>{message}</span>
      </div>
      {onRetry && (
        <button
          onClick={onRetry}
          className="flex items-center gap-1 px-2 py-1 text-sm font-medium text-red-600 border border-red-600 rounded hover:bg-red-600 hover:text-white transition"
        >
          <RefreshCw size={12} />
          Retry
        </button>
      )}
    </div>
  );
}
