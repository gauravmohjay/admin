import { useState, useEffect } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Calendar, 
  Clock, 
  Users, 
  MapPin, 
  FileText,
  PlayCircle,
  Eye
} from 'lucide-react';
import { scheduleAPI } from '../services/api';
import { formatDateTime, formatRecurrence } from '../utils/formatters';
import LoadingSpinner from '../components/UI/LoadingSpinner';
import Pagination from '../components/UI/Pagination';
import StatusBadge from '../components/UI/StatusBadge';
import EmptyState from '../components/UI/EmptyState';

const ScheduleDetail = () => {
  const {platformId, scheduleId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  
  const [schedule] = useState(location.state?.schedule);
  const [occurrences, setOccurrences] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalCount: 0,
    pageSize: 10,
  });

  const fetchOccurrences = async (page = 1, limit = 10) => {
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
        pageSize: response.pagination.pageSize,
      });
    } catch (err) {
      setError('Failed to fetch Meetings. Please try again.');
      console.error('Error fetching Meetings:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (schedule) {
      fetchOccurrences();
    } else {
      // If no schedule in state, redirect back to schedules list
      navigate(`/schedules/${platformId}`);
    }
  }, [schedule, navigate]);

  const handlePageChange = (page) => {
    fetchOccurrences(page, pagination.pageSize);
  };

  const handleOccurrenceClick = (occurrence) => {
    navigate(`/schedules/${platformId}/${scheduleId}/occurrences/${occurrence._id}`, {
      state: { schedule, occurrence }
    });
  };

  if (!schedule) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center py-12">
          <LoadingSpinner size="large" />
        </div>
      </div>
    );
  }

  const formatHosts = () => {
    if (!schedule.hosts || schedule.hosts.length === 0) {
      return [{ name: schedule.hostName || 'N/A', id: schedule.hostId }];
    }
    return schedule.hosts.map(host => ({ name: host.hostName, id: host.hostId }));
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-4">
        <button
          onClick={() => navigate(`/schedules/${platformId}`)}
          className="flex items-center text-gray-600 hover:text-gray-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4 mr-1" />
          Back to Schedules
        </button>
        <div className="h-6 w-px bg-gray-300" />
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{schedule.title}</h1>
          <p className="text-gray-600">Schedule ID: {schedule.scheduleId}</p>
        </div>
      </div>

      {/* Schedule Details */}
      <div className="bg-white rounded-lg shadow border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">Schedule Information</h2>
            <StatusBadge status={schedule.status} />
          </div>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Basic Info */}
            <div className="space-y-4">
              <h3 className="font-medium text-gray-900">Basic Information</h3>
              <div className="space-y-3">
                <div className="flex items-start space-x-2">
                  <Users className="w-4 h-4 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">Group</p>
                    <p className="text-sm text-gray-600">{schedule.group}</p>
                  </div>
                </div>
                <div className="flex items-start space-x-2">
                  <FileText className="w-4 h-4 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">Description</p>
                    <p className="text-sm text-gray-600">{schedule.description || 'No description'}</p>
                  </div>
                </div>
                <div className="flex items-start space-x-2">
                  <MapPin className="w-4 h-4 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">Timezone</p>
                    <p className="text-sm text-gray-600">{schedule.timeZone}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Timing */}
            <div className="space-y-4">
              <h3 className="font-medium text-gray-900">Schedule Timing</h3>
              <div className="space-y-3">
                <div className="flex items-start space-x-2">
                  <Calendar className="w-4 h-4 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">Date Range</p>
                    <p className="text-sm text-gray-600">
                      {formatDateTime(schedule.startDate, false)} - {formatDateTime(schedule.endDate, false)}
                    </p>
                  </div>
                </div>
                <div className="flex items-start space-x-2">
                  <Clock className="w-4 h-4 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">Time</p>
                    <p className="text-sm text-gray-600">{schedule.startTime} - {schedule.endTime}</p>
                  </div>
                </div>
                <div className="flex items-start space-x-2">
                  <PlayCircle className="w-4 h-4 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">Recurrence</p>
                    <p className="text-sm text-gray-600">{formatRecurrence(schedule.recurrence, schedule.daysOfWeek)}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Hosts */}
            <div className="space-y-4">
              <h3 className="font-medium text-gray-900">Hosts</h3>
              <div className="space-y-2">
                {formatHosts().map((host, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
                      <span className="text-xs font-medium text-primary-700">
                        {host.name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">{host.name}</p>
                      <p className="text-xs text-gray-500">ID: {host.id}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Occurrences */}
      <div className="bg-white rounded-lg shadow border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Meetings</h2>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <LoadingSpinner size="large" />
          </div>
        ) : error ? (
          <div className="p-6">
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-red-800">{error}</p>
              <button
                onClick={() => fetchOccurrences()}
                className="mt-2 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
              >
                Retry
              </button>
            </div>
          </div>
        ) : occurrences.length > 0 ? (
          <>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Meetings
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date & Time
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
                  {occurrences.map((occurrence) => (
                    <tr key={occurrence._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div>
                          <p className="text-sm font-medium text-gray-900">{occurrence.title}</p>
                          <p className="text-sm text-gray-500">
                            Group: {occurrence.group} • Host: {occurrence.hostName}
                          </p>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        <div>
                          <p>{formatDateTime(occurrence.startDateTime)}</p>
                          <p className="text-gray-500">to {formatDateTime(occurrence.endDateTime)}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <StatusBadge status={occurrence.status} />
                      </td>
                      <td className="px-6 py-4">
                        <button
                          onClick={() => handleOccurrenceClick(occurrence)}
                          className="text-primary-600 hover:text-primary-800 flex items-center space-x-1"
                        >
                          <Eye className="w-4 h-4" />
                          <span>View Detail</span>
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
          </>
        ) : (
          <EmptyState
            title="No occurrences found"
            description="This schedule has no recorded occurrences yet."
            icon={Calendar}
          />
        )}
      </div>
    </div>
  );
};

export default ScheduleDetail;