import axios from "axios";

const API_BASE_URL = "http://localhost:3000";

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
});

api.interceptors.request.use(
  (config) => {
    const token =
      "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0eXBlIjoiZGV2ZWxvcGVyIiwiZ2VuZXJhdGVkIjoiMjAyNS0wOC0yMVQxMTo0NjozMy41NDBaIiwidGltZXN0YW1wIjoxNzU1Nzc2NzkzNTQwLCJpYXQiOjE3NTU3NzY3OTMsImV4cCI6MTc4NzMxMjc5M30.ryYJdQysqHDBnDrFjBABz6vNYhHuipcD8zDkDng-U9I";

    if (token) {
      config.headers["Authorization"] = `Bearer ${token}`;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// API response interceptor for consistent error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error("API Error:", error);
    return Promise.reject(error);
  }
);

export const scheduleAPI = {
  // Get all schedules with pagination
  getSchedules: async (limit = 5, page = 1, platformId) => {
    const response = await api.get(
      `/schedule/all?limit=${limit}&page=${page}&platformId=${platformId}`
    );
    return response.data;
  },
  getScheduleStats: async () => {
    const response = await api.get("/schedule/stats");
    return response.data.data;
  },
  getOccurrencesStats: async () => {
    const response = await api.get(`/schedule/occurrence/stats`);
    return response.data.data;
  },

  // Search schedules
  searchSchedules: async (searchParam) => {
    if (!searchParam.trim()) return { count: 0, schedules: [] };
    const response = await api.get(
      `/schedule/search?searchParam=${encodeURIComponent(searchParam)}`
    );
    return response.data;
  },

  // Get occurrences for a schedule
  getOccurrences: async (
    platformId,
    hostId,
    scheduleId,
    limit = 5,
    page = 1
  ) => {
    const response = await api.get(
      `/schedule/occurrence/all?platformId=${platformId}&hostId=${hostId}&scheduleId=${scheduleId}&limit=${limit}&page=${page}`
    );
    return response.data;
  },

  // Get participant logs for an occurrence
  getParticipantLogs: async (
    scheduleId,
    platformId,
    occurrenceId,
    limit = 10,
    page = 1
  ) => {
    const response = await api.get(
      `/logs/participantLog?scheduleId=${scheduleId}&platformId=${platformId}&occurrenceId=${occurrenceId}&limit=${limit}&page=${page}`
    );
    return response.data;
  },
};

export const getPlatforms = async () => {
  const response = await api.get("/platform");
  return response.data;
};

export const recordingAPI = {
  // Get all recordings with pagination
  getRecordings: async (limit = 5, page = 1) => {
    const response = await api.get(
      `/recording/all?limit=${limit}&page=${page}`
    );
    return response.data;
  },
  getRecordingsBySchedule: async (platformId) => {
    const response = await api.get(`/recordings?&platformId=${platformId}`);
    return response.data;
  },
};

export default api;
