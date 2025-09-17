import axios from 'axios';

const API_BASE_URL = 'http://localhost:3000';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
});

// API response interceptor for consistent error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error);
    return Promise.reject(error);
  }
);

export const scheduleAPI = {
  // Get all schedules with pagination
  getSchedules: async (limit = 5, page = 1) => {
    const response = await api.get(`/schedule/all?limit=${limit}&page=${page}`);
    return response.data;
  },

  // Search schedules
  searchSchedules: async (searchParam) => {
    if (!searchParam.trim()) return { count: 0, schedules: [] };
    const response = await api.get(`/schedule/search?searchParam=${encodeURIComponent(searchParam)}`);
    return response.data;
  },

  // Get occurrences for a schedule
  getOccurrences: async (platformId, hostId, scheduleId, limit = 5, page = 1) => {
    const response = await api.get(`/schedule/occurrence/all?platformId=${platformId}&hostId=${hostId}&scheduleId=${scheduleId}&limit=${limit}&page=${page}`);
    return response.data;
  },

  // Get participant logs for an occurrence
  getParticipantLogs: async (scheduleId, platformId, occurrenceId, limit = 10, page = 1) => {
    const response = await api.get(`/logs/participantLog?scheduleId=${scheduleId}&platformId=${platformId}&occurrenceId=${occurrenceId}&limit=${limit}&page=${page}`);
    return response.data;
  }
};

export default api;