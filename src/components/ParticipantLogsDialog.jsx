// src/components/ParticipantLogsDialog.jsx
import React, { useEffect } from "react";
import { XCircle } from "lucide-react";
import { Spinner } from "./Spinner";
import { ErrorBanner } from "./ErrorBanner";
import { Pill } from "./Pill";
import { User, Crown } from "lucide-react";
import { formatDuration } from "../utils";
import { Pagination } from "./Pagination";

export function ParticipantLogsDialog({
  isOpen,
  onClose,
  logsState = {},
  onRetry,
  onPageChange
}) {
  const { loading, error, data = [], page = 1, totalPages = 1 } = logsState;

  // Close on Escape
  useEffect(() => {
    function onKey(e) { if (e.key === "Escape") onClose(); }
    if (isOpen) window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const totalDurationSec = data.reduce((sum, p) => sum + (p.totalDuration || 0), 0);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* backdrop */}
      <div
        className="absolute inset-0 bg-black opacity-30"
        onClick={onClose}
      />
      {/* modal */}
      <div className="relative w-full max-w-xl max-h-[90vh] overflow-auto p-6 bg-white rounded-lg shadow-lg">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
        >
          <XCircle size={24} />
        </button>

        <h3 className="text-lg font-semibold text-gray-800 mb-2">
          Participant Logs
        </h3>

        {loading && <Spinner />}

        {error && <ErrorBanner message={error} onRetry={onRetry} />}

        {!loading && !error && data.length === 0 && (
          <p className="text-sm text-gray-500">No participants have joined.</p>
        )}

        {!loading && !error && data.length > 0 && (
          <>
            <div className="mb-4 text-sm text-gray-700">
              Total Duration: <strong>{formatDuration(0, totalDurationSec)}</strong>
            </div>

            <ul className="space-y-4 mb-4">
              {data.map((p) => (
                <li
                  key={p._id}
                  className="p-4 bg-gray-50 border border-gray-200 rounded-lg"
                >
                  <div className="flex items-center justify-between mb-2">
                    <Pill
                      tone={p.role === "host" ? "live" : "scheduled"}
                      icon={p.role === "host" ? Crown : User}
                    >
                      {p.participantName}
                    </Pill>
                    <span className="text-sm text-gray-600">
                      Duration: <strong>{formatDuration(0, p.totalDuration)}</strong>
                    </span>
                  </div>
                  <div className="text-xs text-gray-500">
                    Sessions:
                    <ul className="list-disc list-inside mt-1 space-y-1">
                      {p.sessions.map((sesh, i) => (
                        <li key={i}>
                          Join: {new Date(sesh.joinTime).toLocaleTimeString("en-IN")} — Leave:{" "}
                          {new Date(sesh.leaveTime).toLocaleTimeString("en-IN")} — Duration:{" "}
                          {formatDuration(0, sesh.duration)}
                        </li>
                      ))}
                    </ul>
                  </div>
                </li>
              ))}
            </ul>

            <Pagination
              page={page}
              totalPages={totalPages}
              onPageChange={onPageChange}
              disabled={loading}
            />
          </>
        )}
      </div>
    </div>
  );
}
