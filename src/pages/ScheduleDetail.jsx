import { useState, useEffect } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Calendar,
  Clock,
  Users,
  MapPin,
  FileText,
  Repeat2,
  ExternalLink,
  ChevronDown,
} from "lucide-react";
import { scheduleAPI } from "../services/api";
import { formatDateTime, formatRecurrence } from "../utils/formatters";
import LoadingSpinner from "../components/UI/LoadingSpinner";
import Pagination from "../components/UI/Pagination";
import StatusBadge from "../components/UI/StatusBadge";
import EmptyState from "../components/UI/EmptyState";

// Define available page size options
const PAGE_SIZE_OPTIONS = [5, 10, 20];

const ScheduleDetail = () => {
  const { platformId, scheduleId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();

  const [schedule] = useState(location.state?.schedule);
  console.log("location.state.schedule", location.state?.schedule);
  const [occurrences, setOccurrences] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalCount: 0,
    pageSize: 5,
  });

  const fetchOccurrences = async (page = 1, limit = pagination.pageSize) => {
    if (!schedule) return;

    try {
      setLoading(true);
      setError(null);
      const response = await scheduleAPI.getOccurrences(
        schedule.platformId,
        schedule.hostId,
        schedule.scheduleId,
        limit,
        page
      );

      setOccurrences(response.data || []);
      setPagination({
        currentPage: response.pagination.currentPage,
        totalPages: response.pagination.totalPages,
        totalCount: response.pagination.totalCount,
        pageSize: response.pagination.pageSize || limit,
      });
    } catch (err) {
      setError("Failed to fetch Meetings. Please check network and try again.");
      console.error("Error fetching Meetings:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (schedule) {
      fetchOccurrences(1, pagination.pageSize);
    } else {
      navigate(`/schedules/${platformId}`);
    }
  }, [schedule, navigate, platformId]);

  const handlePageChange = (page) => {
    fetchOccurrences(page, pagination.pageSize);
  };

  const handlePageSizeChange = (e) => {
    const newPageSize = Number(e.target.value);
    setPagination((prev) => ({
      ...prev,
      pageSize: newPageSize,
    }));
    fetchOccurrences(1, newPageSize);
  };

  const handleOccurrenceClick = (occurrence) => {
    navigate(
      `/schedules/${platformId}/${scheduleId}/occurrences/${occurrence._id}`,
      {
        state: { schedule, occurrence },
      }
    );
  };

  const formatHosts = () => {
    let primaryHost = null;
    let coHosts = [];

    if (schedule.hosts && schedule.hosts.length > 0) {
      primaryHost = schedule.hosts.find((h) => h.role === "host");
      coHosts = schedule.hosts.filter((h) => h.role === "coHost");

      if (!primaryHost) {
        primaryHost = schedule.hosts[0];
        coHosts = schedule.hosts.slice(1).filter((h) => h.role === "coHost");
        if (!primaryHost.role) {
          coHosts = schedule.hosts
            .slice(1)
            .filter((h) => h.hostId !== primaryHost.hostId);
        }
      }
    } else if (schedule.hostName || schedule.hostId) {
      primaryHost = {
        hostName: schedule.hostName || "N/A",
        hostId: schedule.hostId || "N/A",
        role: "host",
      };
    }

    return {
      primaryHost,
      coHosts: coHosts.filter((h) => h.hostId !== primaryHost?.hostId), // Ensure primary host isn't duplicated here
    };
  };

  if (!schedule) {
    return (
      <div className="p-8 min-h-[500px] flex items-center justify-center">
        <LoadingSpinner size="large" />
      </div>
    );
  }

  const { primaryHost, coHosts } = formatHosts();
  const startRange = (pagination.currentPage - 1) * pagination.pageSize + 1;
  const endRange = Math.min(
      pagination.currentPage * pagination.pageSize,
      pagination.totalCount
  );

  return (
    <div className="p-4 sm:p-6 md:p-8 bg-gray-50 min-h-screen space-y-6 sm:space-y-8">
      {/* Header and Title */}
      <div className="flex flex-col md:flex-row md:items-center md:space-x-6 border-b border-gray-200 pb-3 sm:pb-4">
        <button
          onClick={() => navigate(`/schedules/${platformId}`)}
          className="flex items-center text-red-700 hover:text-red-800 transition-colors mb-3 md:mb-0 text-sm font-semibold p-2 rounded-lg hover:bg-red-50"
        >
          <ArrowLeft className="w-4 h-4 mr-1.5" />
          Back to Schedules List
        </button>

        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 truncate pr-4">
              {schedule.title}
            </h1>
            <StatusBadge status={schedule.status} />
          </div>
          <p className="text-gray-500 text-xs sm:text-sm mt-1">
            Platform ID:{" "}
            <span className="font-mono text-gray-700">
              {schedule.platformId}
            </span>{" "}
            | Schedule ID:{" "}
            <span className="font-mono text-gray-700">
              {schedule.scheduleId}
            </span>
          </p>
        </div>
      </div>

      {/* Schedule Details Card */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
        <div className="p-4 sm:p-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4 border-b border-gray-100 pb-3">
            Configuration Details
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-y-6 sm:gap-y-8 gap-x-8">
            {/* Column 1: Basic Info */}
            <div className="space-y-4 border-l border-gray-200 pl-4">
              <h3 className="text-sm font-semibold text-gray-600 uppercase">
                General
              </h3>
              <DetailItem icon={Users} label="Group" value={schedule.group} />
              <DetailItem
                icon={MapPin}
                label="Timezone"
                value={schedule.timeZone}
              />
              <DetailItem
                icon={FileText}
                label="Description"
                value={schedule.description || "N/A"}
                isMultiLine={true}
              />
            </div>

            {/* Column 2: Timing */}
            <div className="space-y-4 border-l border-gray-200 pl-4">
              <h3 className="text-sm font-semibold text-gray-600 uppercase">
                Timing & Recurrence
              </h3>
              <DetailItem
                icon={Calendar}
                label="Date Range"
                value={`${formatDateTime(
                    schedule.startDate,
                    false
                )} to ${formatDateTime(schedule.endDate, false)}`}
              />
              <DetailItem
                icon={Clock}
                label="Daily Time"
                value={`${schedule.startTime} - ${schedule.endTime}`}
              />
              <DetailItem
                icon={Repeat2}
                label="Recurrence"
                value={formatRecurrence(
                    schedule.recurrence,
                    schedule.daysOfWeek
                )}
              />
            </div>

            {/* Column 3: Hosts - UPDATED */}
            <div className="space-y-4 border-l border-gray-200 pl-4">
              <h3 className="text-sm font-semibold text-gray-600 uppercase">
                Hosts
              </h3>
              <div className="space-y-4 pt-1">
                {/* Primary Host */}
                {primaryHost && (
                    <HostCard
                        host={primaryHost}
                        role="Host"
                        colorClass="bg-red-700"
                        bgColorClass="bg-red-100"
                    />
                )}

                {/* Co-Hosts */}
                {coHosts.length > 0 && (
                    <div className="space-y-2 mt-4 pt-3 border-t border-gray-100">
                      <p className="text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Co-Host{coHosts.length > 1 ? "s" : ""}
                      </p>
                      {coHosts.map((host, index) => (
                          <HostCard
                              key={index}
                              host={host}
                              role="Co-Host"
                              colorClass="bg-gray-600"
                              bgColorClass="bg-gray-50"
                          />
                      ))}
                    </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Occurrences Table (Meetings) */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-100">
        <div className="px-4 sm:px-6 py-4 border-b border-gray-100">
          <h2 className="text-xl font-bold text-gray-800">
            Scheduled Meetings
          </h2>
          <p className="text-sm text-gray-500">
            A list of all generated instances (occurrences) of this schedule.
          </p>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <LoadingSpinner size="large" />
          </div>
        ) : error ? (
          <div className="p-4 sm:p-6">
            <div className="bg-red-50 border border-red-300 rounded-lg p-4">
              <p className="text-red-800 font-medium">{error}</p>
              <button
                onClick={() => fetchOccurrences()}
                className="mt-3 px-4 py-2 text-sm bg-red-700 text-white rounded-lg hover:bg-red-800 transition-colors shadow-sm"
              >
                Retry Fetch
              </button>
            </div>
          </div>
        ) : occurrences.length > 0 ? (
          <>
          <div className="overflow-hidden">

      
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-100">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 sm:px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Meeting
                    </th>
                    <th className="px-4 sm:px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Date & Time
                    </th>
                    <th className="px-4 sm:px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-4 sm:px-6 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider w-28">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-100">
                  {occurrences.map((occurrence) => (
                    <tr
                      key={occurrence._id}
                      className="transition-colors hover:bg-red-50/50"
                    >
                      <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                        <p className="text-sm sm:text-base font-medium text-gray-900">
                          {occurrence.title}
                        </p>
                        <p className="text-xs text-gray-500 mt-0.5">
                          Group:{" "}
                          <span className="font-medium text-gray-700">
                            {occurrence.group}
                          </span>
                          <span className="ml-2 text-gray-400">|</span>
                          Host: {occurrence.hostName}
                        </p>
                      </td>
                      <td className="px-4 sm:px-6 py-4 text-sm text-gray-700 whitespace-nowrap">
                        <p className="font-medium">
                          {formatDateTime(occurrence.startDateTime)}
                        </p>
                        <p className="text-xs text-gray-500">
                          to {formatDateTime(occurrence.endDateTime)}
                        </p>
                      </td>
                      <td className="px-4 sm:px-6 py-4">
                        <StatusBadge status={occurrence.status} />
                      </td>
                      <td className="px-4 sm:px-6 py-4 text-right">
                        <button
                          onClick={() => handleOccurrenceClick(occurrence)}
                          className="text-red-700 cursor-pointer hover:text-red-900 flex items-center justify-end space-x-1 p-2 rounded-lg hover:bg-red-100 transition-colors"
                          title="View Meeting Details"
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
                </div>

            {/* Pagination Footer with Page Size Selector */}
            <div className="p-4 border-t border-gray-200 flex flex-col md:flex-row items-center justify-between space-y-3 md:space-y-0">
              <div className="flex items-center space-x-3 text-sm text-gray-600">
                <label
                  htmlFor="pageSizeSelect"
                  className="font-medium whitespace-nowrap"
                >
                  Meetings per page:
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
                  <ChevronDown className="pointer-events-none absolute right-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                </div>
              </div>

              <div className="flex items-center space-x-6">
                <div className="text-sm text-gray-600 font-medium whitespace-nowrap">
                  Showing <span className="font-bold">{startRange}</span> to{" "}
                  <span className="font-bold">{endRange}</span> of{" "}
                  <span className="font-bold">{pagination.totalCount}</span>{" "}
                  meetings
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
          </>
        ) : (
          <EmptyState
            title="No Scheduled Meetings Found"
            description="The system has not yet generated any future or past occurrences for this schedule."
            icon={Calendar}
          />
        )}
      </div>
    </div>
  );
};

// Helper component for cleaner detail rendering
const DetailItem = ({ icon: Icon, label, value, isMultiLine = false }) => (
  <div className="flex flex-col">
    <div className="flex items-center space-x-2 mb-1">
      <Icon className="w-4 h-4 text-red-700 flex-shrink-0" />
      <p className="text-xs font-semibold text-gray-600 uppercase tracking-wider">
        {label}
      </p>
    </div>
    {isMultiLine ? (
      <p className="text-sm text-gray-700 break-words pl-6">{value}</p>
    ) : (
      <p className="text-sm font-medium text-gray-900 pl-6">{value}</p>
    )}
  </div>
);

// Helper component for rendering a Host/Co-Host with custom styling
const HostCard = ({ host, role, colorClass, bgColorClass }) => (
  <div
    className={`flex items-center space-x-3 p-3 rounded-lg ${bgColorClass} border border-gray-200`}
  >
    <div
      className={`w-10 h-10 ${colorClass} rounded-full flex items-center justify-center flex-shrink-0`}
    >
      <span className="text-base font-bold text-white">
        {host.hostName ? host.hostName.charAt(0).toUpperCase() : "U"}
      </span>
    </div>
    <div className="min-w-0">
      <p className="text-sm font-semibold text-gray-900 truncate">
        {host.hostName || "Unknown Host"}
      </p>
      <div className="flex items-center space-x-2 mt-0.5">
        <span
          className={`text-xs font-medium text-white px-2 py-0.5 rounded-full ${colorClass}`}
        >
          {role}
        </span>
        <p className="text-xs text-gray-500 font-mono truncate">
          ID: {host.hostId || "N/A"}
        </p>
      </div>
    </div>
  </div>
);

export default ScheduleDetail;
