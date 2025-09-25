import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  Calendar,
  Clock,
  Users,
  ExternalLink,
  ChevronDown,
} from "lucide-react";
import { scheduleAPI } from "../services/api";
import {
  formatDateTime,
  formatRecurrence,
  to12HourFormat,
} from "../utils/formatters";
import LoadingSpinner from "../components/UI/LoadingSpinner";
import Pagination from "../components/UI/Pagination";
import StatusBadge from "../components/UI/StatusBadge";
import EmptyState from "../components/UI/EmptyState";

// Define available page size options
const PAGE_SIZE_OPTIONS = [10, 20, 30, 50];

const Schedules = () => {
  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalCount: 0,
    // Initialize with a default page size (e.g., 10)
    pageSize: 10,
  });
  const { platformId } = useParams();

  const navigate = useNavigate();

  // Unified fetch function
  const fetchSchedules = async (page = 1, limit = pagination.pageSize) => {
    try {
      setLoading(true);
      setError(null);
      // Use the provided limit parameter
      const response = await scheduleAPI.getSchedules(limit, page, platformId);
      setSchedules(response.data || []);
      setPagination({
        currentPage: response.pagination.currentPage,
        totalPages: response.pagination.totalPages,
        totalCount: response.pagination.totalCount,
        pageSize: response.pagination.pageSize || limit,
      });
    } catch (err) {
      setError(
        "Failed to fetch schedules. Please check your connection and try again."
      );
      console.error("Error fetching schedules:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSchedules(1, pagination.pageSize);
  }, [platformId]);

  const handlePageChange = (page) => {
    fetchSchedules(page, pagination.pageSize);
  };

  const handlePageSizeChange = (e) => {
    const newPageSize = Number(e.target.value);
    setPagination((prev) => ({
      ...prev,
      pageSize: newPageSize,
    }));
    fetchSchedules(1, newPageSize);
  };

  const handleScheduleClick = (schedule) => {
    navigate(`/schedules/${schedule.platformId}/${schedule.scheduleId}`, {
      state: { schedule },
    });
  };

  const formatHosts = (schedule) => {
    if (!schedule.hosts || schedule.hosts.length === 0) {
      return schedule.hostName || "N/A";
    }

    if (schedule.hosts.length === 1) {
      return schedule.hosts[0].hostName;
    }

    const primary = schedule.hosts[0].hostName;
    const additional = schedule.hosts.length - 1;
    return `${primary} +${additional} more`;
  };

  // --- Loading, Error, and Empty States (Unchanged) ---
  if (loading) {
    return (
      <div className="p-8 min-h-[500px] flex items-center justify-center">
        <LoadingSpinner size="large" />
      </div>
    );
  }

  if (error) {
    // ... (Error UI remains the same)
    return (
      <div className="p-8">
        <div className="bg-red-50 border border-red-300 rounded-lg p-4 max-w-xl mx-auto">
          <p className="text-red-800 font-medium">{error}</p>
          <button
            onClick={() => fetchSchedules()}
            className="mt-3 px-4 py-2 text-sm bg-red-700 text-white rounded-lg hover:bg-red-800 transition-colors shadow-sm"
          >
            Retry Fetch
          </button>
        </div>
      </div>
    );
  }

  // Calculate the result range for display
  const startRange = (pagination.currentPage - 1) * pagination.pageSize + 1;
  const endRange = Math.min(
    pagination.currentPage * pagination.pageSize,
    pagination.totalCount
  );

  // --- Main Render ---
  return (
    <div className="p-6 md:p-8 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Schedules</h1>
          <p className="text-gray-500 mt-1">
            {platformId
              ? `Schedules for Platform ID: ${platformId}`
              : "Manage and view all schedule configurations"}
          </p>
        </div>
      </div>

      {/* Content */}
      {schedules.length > 0 ? (
        <>
          {/* Mobile list (cards) - Pagination updated for mobile */}
          <div className="md:hidden space-y-4">
            {schedules.map((schedule) => (
              // ... (Mobile card rendering remains the same)
              <div
                key={schedule._id}
                className="bg-white rounded-xl shadow-lg border border-gray-100 p-4 transition hover:shadow-xl"
              >
                {/* ... (Card content) ... */}
                <div className="flex items-start justify-between">
                  <div className="min-w-0">
                    <div className="text-lg font-semibold text-gray-900 truncate">
                      {schedule.title}
                    </div>
                    <div className="mt-1 text-xs font-medium text-gray-500 flex items-center">
                      <Users className="w-3 h-3 mr-1.5 text-gray-400" />
                      {schedule.group}
                      <span className="ml-3 px-2 py-0.5 bg-gray-100 rounded text-gray-600 text-[10px] font-mono">
                        ID: {schedule.scheduleId}
                      </span>
                    </div>
                  </div>
                  <StatusBadge status={schedule.status} />
                </div>

                <div className="mt-4 border-t border-gray-100 pt-3 space-y-2 text-sm text-gray-700">
                  <div className="flex justify-between items-center">
                    <span className="flex items-center text-gray-500">
                      <Clock className="w-4 h-4 mr-2" />
                      Time
                    </span>
                    <span className="font-medium text-gray-900">
                      {schedule.startTime} - {schedule.endTime}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="flex items-center text-gray-500">
                      <Calendar className="w-4 h-4 mr-2" />
                      Starts
                    </span>
                    <span className="font-medium text-gray-900">
                      {formatDateTime(schedule.startDate, false)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="flex items-center text-gray-500">
                      <ExternalLink className="w-4 h-4 mr-2 rotate-90" />
                      Recurrence
                    </span>
                    <span className="font-medium text-gray-900 truncate max-w-[60%] text-right">
                      {formatRecurrence(
                        schedule.recurrence,
                        schedule.daysOfWeek
                      )}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="flex items-center text-gray-500">
                      <Users className="w-4 h-4 mr-2" />
                      Host(s)
                    </span>
                    <span className="font-medium text-gray-900">
                      {formatHosts(schedule)}
                    </span>
                  </div>
                </div>

                <div className="mt-4 border-t border-gray-100 pt-3 flex justify-end">
                  <button
                    onClick={() => handleScheduleClick(schedule)}
                    className="inline-flex items-center text-sm font-medium text-red-700 hover:text-red-900 transition-colors p-2 rounded-lg hover:bg-red-50"
                  >
                    <ExternalLink className="w-4 h-4 mr-1.5" />
                    <span>View Details</span>
                  </button>
                </div>
              </div>
            ))}

            {/* Mobile Pagination Footer */}
            <div className="pt-4 flex flex-col items-center sm:flex-row sm:justify-between space-y-4 sm:space-y-0">
              <div className="text-sm text-gray-600 font-medium">
                Showing <span className="font-bold">{startRange}</span> to{" "}
                <span className="font-bold">{endRange}</span> of{" "}
                <span className="font-bold">{pagination.totalCount}</span>{" "}
                results
              </div>
              <Pagination
                currentPage={pagination.currentPage}
                totalPages={pagination.totalPages}
                totalCount={pagination.totalCount}
                pageSize={pagination.pageSize}
                onPageChange={handlePageChange}
              />
            </div>
          </div>

          {/* Desktop Table - Added pagination controls below the table */}
          <div className="hidden md:block bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Schedule & Group
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Host(s)
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Date & Time
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Recurrence
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider w-32">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-100">
                  {schedules.map((schedule) => (
                    // ... (Table rows remain the same)
                    <tr
                      key={schedule._id}
                      className="transition-colors hover:bg-gray-50"
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-lg font-medium text-gray-900">
                          {schedule.title}
                        </div>
                        <div className="text-sm text-gray-500 mt-1">
                          <span className="font-medium text-gray-700">
                            {schedule.group}
                          </span>
                          <span className="ml-3 text-gray-400">|</span>
                          <span className="ml-3 font-mono">
                            ID: {schedule.scheduleId}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                        <span className="font-medium">
                          {formatHosts(schedule)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                        <div className="flex items-center text-gray-900">
                          <Calendar className="w-3 h-3 mr-2 text-red-700" />
                          {formatDateTime(schedule.startDate, false)}
                        </div>
                        <div className="flex items-center text-gray-500 mt-1">
                          <Clock className="w-3 h-3 mr-2" />
                          {to12HourFormat(schedule.startTime)} -{" "}
                          {to12HourFormat(schedule.endTime)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                        {formatRecurrence(
                          schedule.recurrence,
                          schedule.daysOfWeek
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <StatusBadge status={schedule.status} />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button
                          onClick={() => handleScheduleClick(schedule)}
                          className="text-red-700 cursor-pointer hover:text-red-900 flex items-center justify-end space-x-1 p-2 rounded-lg hover:bg-red-50 transition-colors"
                          title="View Schedule Details"
                        >
                          <ExternalLink className="w-4 h-4" />
                          <span>View</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination Footer with Page Size Selector */}
            <div className="p-4 border-t border-gray-200 flex items-center justify-between">
              <div className="flex items-center space-x-3 text-sm text-gray-600">
                <label
                  htmlFor="pageSizeSelect"
                  className="font-medium whitespace-nowrap"
                >
                  Results per page:
                </label>
                <div className="relative">
                  <select
                    id="pageSizeSelect"
                    value={pagination.pageSize}
                    onChange={handlePageSizeChange}
                    className="appearance-none bg-white border border-gray-300 rounded-lg py-2 pl-3 pr-8 text-sm focus:ring-red-700 focus:border-red-700 cursor-pointer"
                  >
                    {PAGE_SIZE_OPTIONS.map((size) => (
                      <option key={size} value={size}>
                        {size}
                      </option>
                    ))}
                  </select>
                  {/* Custom arrow icon for professional look */}
                  <ChevronDown className="pointer-events-none absolute right-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                </div>
              </div>

              <div className="flex-1">
                <Pagination
                  currentPage={pagination.currentPage}
                  totalPages={pagination.totalPages}
                  totalCount={pagination.totalCount}
                  pageSize={pagination.pageSize}
                  onPageChange={handlePageChange}
                />
              </div>
            </div>
          </div>
        </>
      ) : (
        // ... (Empty State remains the same)
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-12">
          <EmptyState
            title="No Schedules Found"
            description={
              platformId
                ? `There are no schedules defined for Platform ID: ${platformId}.`
                : "There are no schedules to display at this time. Start by creating a new schedule."
            }
            icon={Calendar}
          />
        </div>
      )}
    </div>
  );
};

export default Schedules;
