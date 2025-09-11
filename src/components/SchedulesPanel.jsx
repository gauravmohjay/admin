import React, { useEffect, useRef, useState } from "react";
import { Calendar, ChevronDown, ChevronRight, User, Crown } from "lucide-react";
import { fetchJSON } from "../utils";
import { Spinner } from "./Spinner";
import { ErrorBanner } from "./ErrorBanner";
import { Pill } from "./Pill";
import { Pagination } from "./Pagination";
import { ParticipantLogsDialog } from "./ParticipantLogsDialog";

const PAGE_SIZE = 5;
const OCC_PAGE_SIZE = 5;
const LOGS_PAGE_SIZE = 10;

export function SchedulesPanel({ baseUrl = "http://localhost:3000" }) {
  const [page, setPage] = useState(1);
  const [schedules, setSchedules] = useState([]);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const abortRef = useRef();

  const [expandedScheduleId, setExpandedScheduleId] = useState(null);
  const [occurrencesBySchedule, setOccurrencesBySchedule] = useState({});
  const [logsByOccurrence, setLogsByOccurrence] = useState({});

  const [dialogState, setDialogState] = useState({
    isOpen: false,
    scheduleId: null,
    platformId: null,
    occurrenceId: null,
  });

  // Load schedules
  useEffect(() => {
    loadSchedules(page);
    return () => abortRef.current?.abort();
  }, [page]);
  useEffect(() => {
    if (dialogState.isOpen) {
      const { scheduleId, platformId, occurrenceId } = dialogState;
      loadLogs(scheduleId, platformId, occurrenceId, 1);
    }
  }, [dialogState.isOpen]);

  function loadSchedules(pageNum) {
    setLoading(true);
    setError(null);
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    fetchJSON(
      `${baseUrl}/schedule/all?limit=${PAGE_SIZE}&page=${pageNum}`,
      controller.signal
    )
      .then((json) => {
        setSchedules(json.data || []);
        setTotalPages(json.pagination?.totalPages || 1);
      })
      .catch((err) => {
        if (!controller.signal.aborted) {
          setError(err.message || "Failed to load schedules");
        }
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });
  }

  // Load occurrences for a schedule
  function loadOccurrences(scheduleId, platformId, hostId, pageNum = 1) {
    setOccurrencesBySchedule((prev) => ({
      ...prev,
      [scheduleId]: {
        ...(prev[scheduleId] || {}),
        loading: true,
        error: null,
        page: pageNum,
      },
    }));

    fetchJSON(
      `${baseUrl}/schedule/occurrence/all?platformId=${platformId}` +
        `&hostId=${hostId}` +
        `&scheduleId=${scheduleId}` +
        `&limit=${OCC_PAGE_SIZE}` +
        `&page=${pageNum}`,
      abortRef.current.signal
    )
      .then((json) => {
        setOccurrencesBySchedule((prev) => ({
          ...prev,
          [scheduleId]: {
            ...prev[scheduleId],
            loading: false,
            data: json.data || [],
            totalPages: json.pagination?.totalPages || 1,
            page: json.pagination?.currentPage || pageNum,
          },
        }));
      })
      .catch((err) => {
        setOccurrencesBySchedule((prev) => ({
          ...prev,
          [scheduleId]: {
            ...prev[scheduleId],
            loading: false,
            error: err.message || "Failed to load occurrences",
            data: [],
          },
        }));
      });
  }

  // Load logs for an occurrence
  function loadLogs(scheduleId, platformId, occurrenceId, pageNum = 1) {
    setLogsByOccurrence((prev) => ({
      ...prev,
      [occurrenceId]: {
        ...(prev[occurrenceId] || {}),
        loading: true,
        error: null,
        page: pageNum,
      },
    }));

    fetchJSON(
      `${baseUrl}/logs/participantLog?scheduleId=${scheduleId}` +
        `&platformId=${platformId}` +
        `&occurrenceId=${occurrenceId}` +
        `&limit=${LOGS_PAGE_SIZE}` +
        `&page=${pageNum}`,
      abortRef.current.signal
    )
      .then((json) => {
        setLogsByOccurrence((prev) => ({
          ...prev,
          [occurrenceId]: {
            ...prev[occurrenceId],
            loading: false,
            data: json.data || [],
            totalPages: json.pagination?.totalPages || 1,
            page: json.pagination?.page || pageNum,
          },
        }));
      })
      .catch((err) => {
        setLogsByOccurrence((prev) => ({
          ...prev,
          [occurrenceId]: {
            ...prev[occurrenceId],
            loading: false,
            error: err.message || "Failed to load logs",
            data: [],
          },
        }));
      });
  }

  // Toggle schedule expansion
  function onToggleSchedule(s) {
    const isOpening = expandedScheduleId !== s.scheduleId;
    setExpandedScheduleId(isOpening ? s.scheduleId : null);
    if (isOpening) {
      loadOccurrences(s.scheduleId, s.platformId, s.hostId, 1);
    }
  }

  return (
    <>
      <div className="p-6 bg-white border border-gray-200 rounded-lg shadow">
        <div className="flex items-center justify-between mb-4">
          <h2 className="flex items-center gap-2 text-xl font-semibold text-gray-800">
            <Calendar size={24} /> Schedules
          </h2>
          {loading && (
            <div className="flex items-center gap-2 text-gray-500">
              <Spinner /> Loading...
            </div>
          )}
        </div>

        {error && (
          <ErrorBanner message={error} onRetry={() => loadSchedules(page)} />
        )}

        {!loading && !error && schedules.length === 0 && (
          <div className="flex flex-col items-center justify-center p-8 text-gray-500">
            <Calendar size={48} className="opacity-30" />
            <h3 className="mt-4 text-lg font-medium">No Schedules Found</h3>
            <p className="text-sm">
              There are no scheduled meetings to display.
            </p>
          </div>
        )}

        <ul className="space-y-4">
          {schedules.map((s) => {
            const occState = occurrencesBySchedule[s.scheduleId] || {};
            return (
              <li
                key={s.scheduleId}
                className="p-4 bg-gray-50 border border-gray-200 rounded-lg"
              >
                {/* Summary Row */}
                <div className="flex items-start justify-between">
                  <button
                    onClick={() => onToggleSchedule(s)}
                    className="p-2 mr-4 text-gray-500 rounded hover:bg-gray-100"
                  >
                    {expandedScheduleId === s.scheduleId ? (
                      <ChevronDown size={20} />
                    ) : (
                      <ChevronRight size={20} />
                    )}
                  </button>

                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-800">
                      {s.title}
                    </h3>
                    <div className="flex flex-wrap items-center gap-2 mt-1">
                      <Pill tone={s.status === "live" ? "live" : "scheduled"}>
                        {s.status}
                      </Pill>
                      {s.group && <Pill tone="neutral">{s.group}</Pill>}
                      {s.recurrence && (
                        <Pill tone="neutral">{s.recurrence}</Pill>
                      )}
                      {s.daysOfWeek?.length > 0 && (
                        <Pill tone="neutral">
                          {s.daysOfWeek
                            .map(
                              (d) =>
                                [
                                  "Sun",
                                  "Mon",
                                  "Tue",
                                  "Wed",
                                  "Thu",
                                  "Fri",
                                  "Sat",
                                ][d]
                            )
                            .join(", ")}
                        </Pill>
                      )}
                    </div>
                    <div className="flex flex-wrap items-center gap-4 mt-2 text-sm text-gray-500">
                      <span className="flex items-center gap-1">
                        <Calendar size={14} />{" "}
                        {new Date(s.startDate).toLocaleDateString("en-IN")}
                      </span>
                      <span className="flex items-center gap-1">
                        <span className="font-mono">{s.startTime}</span>–
                        <span className="font-mono">{s.endTime}</span>
                      </span>
                      <span>🌍 {s.timeZone}</span>
                    </div>
                    {s.description && (
                      <p className="mt-2 text-sm text-gray-700">
                        {s.description}
                      </p>
                    )}
                  </div>

                  <div>
                    <Pill tone="neutral">
                      {s.hosts.length} Host{s.hosts.length > 1 && "s"}
                    </Pill>
                  </div>
                </div>

                {/* Occurrences List */}
                {expandedScheduleId === s.scheduleId && (
                  <div className="mt-4 p-4 bg-gray-100 border border-gray-200 rounded-lg">
                    {occState.loading && <Spinner />}
                    {occState.error && (
                      <ErrorBanner
                        message={occState.error}
                        onRetry={() =>
                          loadOccurrences(
                            s.scheduleId,
                            s.platformId,
                            s.hostId,
                            occState.page
                          )
                        }
                      />
                    )}
                    {!occState.loading &&
                      !occState.error &&
                      occState.data?.length === 0 && (
                        <p className="text-sm text-gray-500">
                          No occurrences found.
                        </p>
                      )}
                    <ul className="space-y-2">
                      {occState.data?.map((o) => (
                        <li
                          key={o._id}
                          className="p-2 bg-white border border-gray-200 rounded-lg"
                        >
                          <div className="flex items-center justify-between">
                            <button
                              onClick={() => {
                                setDialogState({
                                  isOpen: true,
                                  scheduleId: s.scheduleId,
                                  platformId: s.platformId,
                                  occurrenceId: o._id,
                                });
                              }}
                              className="text-sm text-blue-600 hover:underline"
                            >
                              View Logs
                            </button>

                            <div className="text-sm text-gray-700">
                              {new Date(o.startDateTime).toLocaleString(
                                "en-IN"
                              )}{" "}
                              — {o.status}
                            </div>
                          </div>
                        </li>
                      ))}
                    </ul>
                    <Pagination
                      page={occState.page || 1}
                      totalPages={occState.totalPages || 1}
                      onPageChange={(p) =>
                        loadOccurrences(s.scheduleId, s.platformId, s.hostId, p)
                      }
                      disabled={occState.loading}
                    />
                  </div>
                )}
              </li>
            );
          })}
        </ul>

        <Pagination
          page={page}
          totalPages={totalPages}
          onPageChange={setPage}
          disabled={loading}
        />
      </div>

      {/* Participant Logs Modal */}
      <ParticipantLogsDialog
        isOpen={dialogState.isOpen}
        onClose={() =>
          setDialogState({
            isOpen: false,
            scheduleId: null,
            platformId: null,
            occurrenceId: null,
          })
        }
        logsState={logsByOccurrence[dialogState.occurrenceId] || {}}
        onRetry={() =>
          loadLogs(
            dialogState.scheduleId,
            dialogState.platformId,
            dialogState.occurrenceId,
            logsByOccurrence[dialogState.occurrenceId]?.page || 1
          )
        }
        onPageChange={(p) =>
          loadLogs(
            dialogState.scheduleId,
            dialogState.platformId,
            dialogState.occurrenceId,
            p
          )
        }
      />
    </>
  );
}
