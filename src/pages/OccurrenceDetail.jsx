import { useState, useEffect } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Calendar, 
  Clock, 
  Users, 
  ChevronDown, 
  ChevronRight,
  User
} from 'lucide-react';
import { scheduleAPI } from '../services/api';
import { formatDateTime, formatDuration } from '../utils/formatters';
import LoadingSpinner from '../components/UI/LoadingSpinner';
import Pagination from '../components/UI/Pagination';
import StatusBadge from '../components/UI/StatusBadge';
import EmptyState from '../components/UI/EmptyState';

const OccurrenceDetail = () => {
  const { scheduleId, occurrenceId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  
  const [schedule] = useState(location.state?.schedule);
  const [occurrence] = useState(location.state?.occurrence);
  const [participants, setParticipants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedParticipants, setExpandedParticipants] = useState(new Set());
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalCount: 0,
    pageSize: 10,
  });

  const fetchParticipants = async (page = 1, limit = 10) => {
    if (!schedule || !occurrence) return;
    
    try {
      setLoading(true);
      setError(null);
      const response = await scheduleAPI.getParticipantLogs(
        schedule.scheduleId,
        schedule.platformId,
        occurrence._id,
        limit,
        page
      );
      setParticipants(response.data || []);
      setPagination({
        currentPage: response.pagination.page,
        totalPages: response.pagination.totalPages,
        totalCount: response.pagination.total,
        pageSize: response.pagination.limit,
      });
    } catch (err) {
      setError('Failed to fetch participant logs. Please try again.');
      console.error('Error fetching participant logs:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (schedule && occurrence) {
      fetchParticipants();
    } else {
      // If no schedule or occurrence in state, redirect back
      navigate(`/schedules/${scheduleId}`);
    }
  }, [schedule, occurrence, scheduleId, navigate]);

  const handlePageChange = (page) => {
    fetchParticipants(page, pagination.pageSize);
  };

  const toggleParticipantExpanded = (participantId) => {
    const newExpanded = new Set(expandedParticipants);
    if (newExpanded.has(participantId)) {
      newExpanded.delete(participantId);
    } else {
      newExpanded.add(participantId);
    }
    setExpandedParticipants(newExpanded);
  };

  const getRoleColor = (role) => {
    const colors = {
      host: 'bg-purple-100 text-purple-800',
      participant: 'bg-blue-100 text-blue-800',
      moderator: 'bg-green-100 text-green-800',
    };
    return colors[role] || 'bg-gray-100 text-gray-800';
  };

  const SessionTimeline = ({ participant }) => {
    if (!participant.sessions || participant.sessions.length === 0) {
      return <p className="text-sm text-gray-500">No session data available</p>;
    }

    const totalDuration = formatDuration(participant.totalDuration);
    
    return (
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h4 className="font-medium text-gray-900">Session Timeline</h4>
          <span className="text-sm text-gray-600">Total: {totalDuration}</span>
        </div>
        
        <div className="space-y-2">
          {participant.sessions.map((session, index) => (
            <div key={index} className="bg-gray-50 rounded-lg p-3">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-900">Session {index + 1}</span>
                <span className="text-sm text-gray-600">{formatDuration(session.duration)}</span>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
                <div>
                  <span className="text-gray-500">Joined:</span>
                  <span className="ml-2 text-gray-900">{formatDateTime(session.joinTime)}</span>
                </div>
                <div>
                  <span className="text-gray-500">Left:</span>
                  <span className="ml-2 text-gray-900">{formatDateTime(session.leaveTime)}</span>
                </div>
              </div>
              
              {/* Simple timeline bar */}
              <div className="mt-2">
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-primary-500 h-2 rounded-full" 
                    style={{ width: `${Math.min(100, (session.duration / participant.totalDuration) * 100)}%` }}
                  ></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  if (!schedule || !occurrence) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center py-12">
          <LoadingSpinner size="large" />
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-4">
        <button
          onClick={() => navigate(`/schedules/${scheduleId}`)}
          className="flex items-center text-gray-600 hover:text-gray-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4 mr-1" />
          Back to Schedule
        </button>
        <div className="h-6 w-px bg-gray-300" />
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Occurrence Participants</h1>
          <p className="text-gray-600">{occurrence.title}</p>
        </div>
      </div>

      {/* Occurrence Details */}
      <div className="bg-white rounded-lg shadow border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">Occurrence Information</h2>
            <StatusBadge status={occurrence.status} />
          </div>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="flex items-start space-x-2">
              <Calendar className="w-4 h-4 text-gray-400 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-gray-900">Start Time</p>
                <p className="text-sm text-gray-600">{formatDateTime(occurrence.startDateTime)}</p>
              </div>
            </div>
            <div className="flex items-start space-x-2">
              <Clock className="w-4 h-4 text-gray-400 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-gray-900">End Time</p>
                <p className="text-sm text-gray-600">{formatDateTime(occurrence.endDateTime)}</p>
              </div>
            </div>
            <div className="flex items-start space-x-2">
              <Users className="w-4 h-4 text-gray-400 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-gray-900">Host</p>
                <p className="text-sm text-gray-600">{occurrence.hostName}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Participants */}
      <div className="bg-white rounded-lg shadow border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Participants</h2>
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
                onClick={() => fetchParticipants()}
                className="mt-2 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
              >
                Retry
              </button>
            </div>
          </div>
        ) : participants.length > 0 ? (
          <>
            <div className="divide-y divide-gray-200">
              {participants.map((participant) => {
                const isExpanded = expandedParticipants.has(participant._id);
                return (
                  <div key={participant._id}>
                    <div className="px-6 py-4 hover:bg-gray-50">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                            <User className="w-5 h-5 text-gray-600" />
                          </div>
                          <div>
                            <h3 className="font-medium text-gray-900">{participant.participantName}</h3>
                            <div className="flex items-center space-x-2 mt-1">
                              <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${getRoleColor(participant.role)}`}>
                                {participant.role}
                              </span>
                              <span className="text-sm text-gray-600">
                                Total: {formatDuration(participant.totalDuration)}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className="text-sm text-gray-500">
                            {participant.sessions?.length || 0} session{participant.sessions?.length !== 1 ? 's' : ''}
                          </span>
                          <button
                            onClick={() => toggleParticipantExpanded(participant._id)}
                            className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
                          >
                            {isExpanded ? (
                              <ChevronDown className="w-5 h-5" />
                            ) : (
                              <ChevronRight className="w-5 h-5" />
                            )}
                          </button>
                        </div>
                      </div>
                    </div>

                    {isExpanded && (
                      <div className="px-6 pb-4 border-l-2 border-primary-200 ml-11">
                        <SessionTimeline participant={participant} />
                      </div>
                    )}
                  </div>
                );
              })}
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
            title="No participants found"
            description="This occurrence has no recorded participants yet."
            icon={Users}
          />
        )}
      </div>
    </div>
  );
};

export default OccurrenceDetail;