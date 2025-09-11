// src/pages/SummaryPage.jsx
import React, { useEffect, useRef, useState } from "react";
import { Calendar, Users } from "lucide-react";
import { fetchJSON, formatDateTime } from "../utils";
import { Pill } from "../components/Pill";
import { Spinner } from "../components/Spinner";
import { ErrorBanner } from "../components/ErrorBanner";

const PAGE_SIZE = 25;

export function SummaryPage({ baseUrl = "http://localhost:3000" }) {
  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const abortRef = useRef();

  useEffect(() => {
    loadSchedules();
    return () => abortRef.current?.abort();
  }, []);

  function loadSchedules() {
    setLoading(true);
    setError(null);
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    fetchJSON(`${baseUrl}/schedule/all?limit=${PAGE_SIZE}&page=1`, controller.signal)
      .then((json) => setSchedules(json.data || []))
      .catch((err) => {
        if (!controller.signal.aborted) setError(err.message || "Failed to load schedules");
      })
      .finally(() => { if (!controller.signal.aborted) setLoading(false); });
  }

  return (
    <div>
      <h1 className="mb-6 text-2xl font-semibold text-gray-800">Schedules Summary</h1>

      {loading && (
        <div className="flex items-center gap-2 text-gray-500 mb-4">
          <Spinner /> Loading…
        </div>
      )}

      {error && <ErrorBanner message={error} onRetry={loadSchedules} />}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {!loading && !error && schedules.map((s) => (
          <div key={s.scheduleId} className="p-5 bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-lg font-medium text-gray-800 truncate">{s.title}</h2>
              <Pill tone={s.status === "live" ? "live" : s.status === "ended" ? "ended" : "scheduled"}>
                {s.status}
              </Pill>
            </div>
            <div className="flex flex-wrap items-center text-sm text-gray-600 gap-3 mb-2">
              <span className="flex items-center gap-1"><Calendar size={14} /> {formatDateTime(s.startDate, s.timeZone)}</span>
              <span className="flex items-center gap-1"><Users size={14} /> {s.hosts.length} Host{s.hosts.length > 1 && "s"}</span>
            </div>
            <div className="text-sm text-gray-600 mb-2">
              <strong>Platform:</strong> {s.platformId}
            </div>
            <div className="text-sm text-gray-600 mb-2">
              <strong>Group:</strong> {s.group || "—"}
            </div>
            <div className="text-xs text-gray-500">
              <strong>Days:</strong>{" "}
              {Array.isArray(s.daysOfWeek) && s.daysOfWeek.length > 0
                ? s.daysOfWeek.map(d => ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"][d]).join(", ")
                : "None"}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
