import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Eye, Calendar, Clock, Users } from "lucide-react";
import { scheduleAPI } from "../services/api";
import { formatDateTime, formatRecurrence } from "../utils/formatters";
import LoadingSpinner from "../components/UI/LoadingSpinner";
import Pagination from "../components/UI/Pagination";
import StatusBadge from "../components/UI/StatusBadge";
import EmptyState from "../components/UI/EmptyState";
import { useParams } from "react-router-dom";

const Schedules = () => {
  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalCount: 0,
    pageSize: 10,
  });
  const { platformId } = useParams();

  const navigate = useNavigate();

  const fetchSchedules = async (page = 1, limit = 10) => {
    try {
      setLoading(true);
      setError(null);
      const response = await scheduleAPI.getSchedules(limit, page, platformId);
      setSchedules(response.data || []);
      setPagination({
        currentPage: response.pagination.currentPage,
        totalPages: response.pagination.totalPages,
        totalCount: response.pagination.totalCount,
        pageSize: response.pagination.pageSize,
      });
    } catch (err) {
      setError("Failed to fetch schedules. Please try again.");
      console.error("Error fetching schedules:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSchedules();
  }, []);

  const handlePageChange = (page) => {
    fetchSchedules(page, pagination.pageSize);
  };

  const handleScheduleClick = (schedule) => {
    navigate(`/schedules/${schedule.platformId}/${schedule.scheduleId}`, { state: { schedule } });
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
    return `${primary} +${additional}`;
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center py-12">
          <LoadingSpinner size="large" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">{error}</p>
          <button
            onClick={() => fetchSchedules()}
            className="mt-2 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Schedules</h1>
          <p className="text-gray-600">
            Manage and view all schedule configurations
          </p>
        </div>
      </div>

      {/* Content */}
      {schedules.length > 0 ? (
        <>
          {/* Mobile list (cards) */}
          <div className="md:hidden space-y-3">
            {schedules.map((schedule) => (
              <div
                key={schedule._id}
                onClick={() => handleScheduleClick(schedule)}
                className="bg-white rounded-lg shadow border border-gray-200 p-4 active:scale-[0.99] transition cursor-pointer"
              >
                <div className="flex items-start justify-between">
                  <div className="min-w-0">
                    <div className="text-base font-semibold text-gray-900 truncate">
                      {schedule.title}
                    </div>
                    <div className="mt-1 text-sm text-gray-500 flex items-center flex-wrap">
                      <span className="flex items-center mr-2">
                        <Users className="w-3 h-3 mr-1" />
                        <span className="truncate">{schedule.group}</span>
                      </span>
                      <span className="text-xs text-gray-400">
                        ID: {schedule.scheduleId}
                      </span>
                    </div>
                  </div>
                  <StatusBadge status={schedule.status} />
                </div>

                <div className="mt-3 space-y-1 text-sm text-gray-700">
                  <div className="flex items-center">
                    <Calendar className="w-3 h-3 mr-2 text-gray-400" />
                    <span>{formatDateTime(schedule.startDate, false)}</span>
                  </div>
                  <div className="flex items-center">
                    <Clock className="w-3 h-3 mr-2 text-gray-400" />
                    <span>
                      {schedule.startTime} - {schedule.endTime}
                    </span>
                  </div>
                  <div className="flex items-center">
                    <span className="mr-2 text-gray-400">↻</span>
                    <span>
                      {formatRecurrence(
                        schedule.recurrence,
                        schedule.daysOfWeek
                      )}
                    </span>
                  </div>
                  <div className="flex items-center">
                    <Users className="w-3 h-3 mr-2 text-gray-400" />
                    <span>{formatHosts(schedule)}</span>
                  </div>
                </div>

                <div className="mt-3">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleScheduleClick(schedule);
                    }}
                    className="inline-flex items-center text-primary-600 hover:text-primary-800"
                  >
                    <Eye className="w-4 h-4 mr-1" />
                    <span>View</span>
                  </button>
                </div>
              </div>
            ))}

            {/* Pagination for mobile */}
            <Pagination
              currentPage={pagination.currentPage}
              totalPages={pagination.totalPages}
              totalCount={pagination.totalCount}
              pageSize={pagination.pageSize}
              onPageChange={handlePageChange}
            />
          </div>

          {/* Desktop table (original, unchanged, just hidden on mobile) */}
          <div className="hidden md:block">
            <div className="bg-white rounded-lg shadow border border-gray-200 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Schedule
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Host(s)
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Time
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Recurrence
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {schedules.map((schedule) => (
                      <tr
                        key={schedule._id}
                        className="hover:bg-gray-50 cursor-pointer"
                      >
                        <td
                          className="px-6 py-4"
                          onClick={() => handleScheduleClick(schedule)}
                        >
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {schedule.title}
                            </div>
                            <div className="text-sm text-gray-500 flex items-center space-x-4">
                              <span className="flex items-center">
                                <Users className="w-3 h-3 mr-1" />
                                {schedule.group}
                              </span>
                              <span className="text-xs text-gray-400">
                                ID: {schedule.scheduleId}
                              </span>
                            </div>
                          </div>
                        </td>
                        <td
                          className="px-6 py-4 text-sm text-gray-900"
                          onClick={() => handleScheduleClick(schedule)}
                        >
                          {formatHosts(schedule)}
                        </td>
                        <td
                          className="px-6 py-4 text-sm text-gray-900"
                          onClick={() => handleScheduleClick(schedule)}
                        >
                          <div>
                            <div className="flex items-center">
                              <Calendar className="w-3 h-3 mr-1 text-gray-400" />
                              {formatDateTime(schedule.startDate, false)}
                            </div>
                            <div className="flex items-center text-gray-500">
                              <Clock className="w-3 h-3 mr-1" />
                              {schedule.startTime} - {schedule.endTime}
                            </div>
                          </div>
                        </td>
                        <td
                          className="px-6 py-4 text-sm text-gray-900"
                          onClick={() => handleScheduleClick(schedule)}
                        >
                          {formatRecurrence(
                            schedule.recurrence,
                            schedule.daysOfWeek
                          )}
                        </td>
                        <td
                          className="px-6 py-4"
                          onClick={() => handleScheduleClick(schedule)}
                        >
                          <StatusBadge status={schedule.status} />
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-500">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleScheduleClick(schedule);
                            }}
                            className="text-primary-600 hover:text-primary-800 flex items-center space-x-1"
                          >
                            <Eye className="w-4 h-4" />
                            <span>View</span>
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
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
        <div className="bg-white rounded-lg shadow border border-gray-200">
          <EmptyState
            title="No schedules found"
            description="There are no schedules to display at this time."
            icon={Calendar}
          />
        </div>
      )}
    </div>
  );
};

export default Schedules;
