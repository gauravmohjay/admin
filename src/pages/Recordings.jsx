// src/pages/Recordings.jsx
import React, { useEffect, useState } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import { recordingAPI } from "../services/api";
import LoadingSpinner from "../components/UI/LoadingSpinner";
import EmptyState from "../components/UI/EmptyState";
import { Calendar, ExternalLink, Copy, Link as LinkIcon } from "lucide-react";
import { formatDateTime } from "../utils/formatters";

const Recordings = () => {
  const { platformId } = useParams();
  const [searchParams] = useSearchParams();
  const scheduleId = searchParams.get("scheduleId") || "";

  const [items, setItems] = useState([]);
  const [count, setCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchRecordings = async () => {
    if (!platformId ) {
      setItems([]);
      setCount(0);
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      setError(null);
      const res = await recordingAPI.getRecordingsBySchedule(platformId);
      // Expected shape: { status, count, data: [...] }
      setItems(res?.data || []);
      setCount(res?.count || 0);
    } catch (err) {
      console.error("Error fetching recordings:", err);
      setError("Failed to fetch recordings. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecordings();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [platformId, scheduleId]);

  const handleCopy = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
    } catch (e) {
      console.error("Copy failed:", e);
    }
  };

  return (
    <div className="p-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Recordings</h2>
          <p className="text-gray-600">
            {platformId ? `Platform: ${platformId}` : "Platform not set"}
            {scheduleId ? ` • Schedule: ${scheduleId} • Total: ${count}` : " • Add ?scheduleId=... in the URL"}
          </p>
        </div>
      </div>

      {/* Loading */}
      {loading && (
        <div className="flex items-center justify-center py-12">
          <LoadingSpinner size="large" />
        </div>
      )}

      {/* Missing scheduleId */}
      {!loading && (
        <div className="bg-white rounded-lg shadow border border-gray-200 p-6">
          <p className="text-gray-700">
            Provide a scheduleId in the URL, for example: ?scheduleId=AKo8SwUz65
          </p>
        </div>
      )}

      {/* Error */}
      {!loading && error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">{error}</p>
          <button
            onClick={fetchRecordings}
            className="mt-2 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
          >
            Retry
          </button>
        </div>
      )}

      {/* Empty */}
      {!loading && !error && scheduleId && items.length === 0 && (
        <div className="bg-white rounded-lg shadow border border-gray-200">
          <EmptyState
            title="No recordings found"
            description="There are no recordings to display for this schedule."
            icon={Calendar}
          />
        </div>
      )}

      {/* List */}
      {!loading && !error && items.length > 0 && (
        <div className="bg-white rounded-lg shadow border border-gray-200 p-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {items.map((rec) => {
              const viewUrl = rec?.meta?.webViewLink || rec?.url;
              return (
                <div key={rec._id} className="rounded-lg border border-gray-200 p-4 hover:shadow transition">
                  <div className="min-w-0">
                    <div className="text-sm text-gray-500">
                      {rec.hostId ? `Host: ${rec.hostId}` : "Recording"}
                    </div>
                    <div className="text-base font-medium text-gray-900 truncate">
                      {rec.occurrenceId ? `Meeting ${rec.occurrenceId.slice(-6)}` : rec._id}
                    </div>
                    {rec.createdAt && (
                      <div className="mt-1 text-sm text-gray-600 flex items-center">
                        <Calendar className="w-3 h-3 mr-1 text-gray-400" />
                        {formatDateTime(rec.createdAt, false)}
                      </div>
                    )}
                  </div>

                  <div className="mt-3 flex items-center flex-wrap gap-2">
                    <a
                      href={viewUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center px-3 py-2 text-sm rounded bg-primary-600 text-white hover:bg-primary-700"
                    >
                      <ExternalLink className="w-4 h-4 mr-1" />
                      Open
                    </a>
                    <button
                      onClick={() => handleCopy(viewUrl)}
                      className="inline-flex items-center px-3 py-2 text-sm rounded border border-gray-300 text-gray-700 hover:bg-gray-50"
                    >
                      <Copy className="w-4 h-4 mr-1" />
                      Copy link
                    </button>
                    <a
                      href={rec.url}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center px-3 py-2 text-sm rounded border border-gray-300 text-gray-700 hover:bg-gray-50"
                    >
                      <LinkIcon className="w-4 h-4 mr-1" />
                      Source
                    </a>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default Recordings;
