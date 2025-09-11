import { ArrowLeft, ArrowRight } from "lucide-react";

export function Pagination({ page, totalPages, onPageChange, disabled }) {
  const canPrev = page > 1;
  const canNext = page < totalPages;
  return (
    <nav className="flex items-center justify-between p-4 border-t border-gray-200">
      <p className="text-sm text-gray-500">Showing page {page} of {totalPages || 1}</p>
      <div className="flex items-center gap-2">
        <button
          onClick={() => onPageChange(page - 1)}
          disabled={!canPrev || disabled}
          className={`flex items-center gap-1 px-3 py-1 text-sm border rounded ${canPrev && !disabled ? "hover:bg-gray-100" : "cursor-not-allowed text-gray-400 bg-gray-50 border-gray-200"}`}
        >
          <ArrowLeft size={14} />
          Previous
        </button>
        <span className="px-3 py-1 text-sm text-gray-800 bg-gray-50 border border-gray-200 rounded">{page}</span>
        <button
          onClick={() => onPageChange(page + 1)}
          disabled={!canNext || disabled}
          className={`flex items-center gap-1 px-3 py-1 text-sm border rounded ${canNext && !disabled ? "hover:bg-gray-100" : "cursor-not-allowed text-gray-400 bg-gray-50 border-gray-200"}`}
        >
          Next
          <ArrowRight size={14} />
        </button>
      </div>
    </nav>
  );
}
