import {
  Calendar,
  Users,
  Activity,
  TrendingUp,
  Clock,
  VideoIcon,
  BarChart3,
  Zap,
} from "lucide-react";
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { getPlatforms } from "../services/api";
import { scheduleAPI } from "../services/api";
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";

// Demo data for charts
const occurrenceData = [
  { date: "Jan 1", occurrences: 12, attendance: 45 },
  { date: "Jan 2", occurrences: 19, attendance: 52 },
  { date: "Jan 3", occurrences: 8, attendance: 38 },
  { date: "Jan 4", occurrences: 15, attendance: 61 },
  { date: "Jan 5", occurrences: 22, attendance: 58 },
  { date: "Jan 6", occurrences: 18, attendance: 49 },
  { date: "Jan 7", occurrences: 25, attendance: 67 },
  { date: "Jan 8", occurrences: 16, attendance: 44 },
  { date: "Jan 9", occurrences: 21, attendance: 55 },
  { date: "Jan 10", occurrences: 14, attendance: 41 },
  { date: "Jan 11", occurrences: 28, attendance: 72 },
  { date: "Jan 12", occurrences: 23, attendance: 59 },
  { date: "Jan 13", occurrences: 17, attendance: 47 },
  { date: "Jan 14", occurrences: 20, attendance: 53 },
];

const recurrenceData = [
  { name: "None", value: 45, color: "#8884d8" },
  { name: "Daily", value: 35, color: "#82ca9d" },
  { name: "Custom", value: 20, color: "#ffc658" },
];

const hostData = [
  { host: "John Smith", minutes: 2450 },
  { host: "Sarah Johnson", minutes: 1890 },
  { host: "Mike Davis", minutes: 1650 },
  { host: "Lisa Wilson", minutes: 1420 },
  { host: "David Brown", minutes: 1180 },
];

const Dashboard = () => {
  const [platforms, setPlatforms] = useState([]);
  const [scheduleStat, setScheduleStat] = useState([]);
  const [occurrenceStats, setOccurrenceStats] = useState([]);

  useEffect(() => {
    const fetchPlatforms = async () => {
      try {
        const data = await getPlatforms();
        setPlatforms(data);
      } catch (error) {
        console.error("Error fetching platforms:", error);
      }
    };

    const fetchScheduleStats = async () => {
      try {
        const data = await scheduleAPI.getScheduleStats();
        setScheduleStat(data);
      } catch (error) {
        console.error("Error fetching stats ");
      }
    };
    const fetchOccurrenceStats = async () => {
      try {
        const data = await scheduleAPI.getOccurrencesStats();
        setOccurrenceStats(data);
        console.log(data);
      } catch (error) {
        console.error("Error fetching stats ");
      }
    };

    fetchPlatforms();
    fetchScheduleStats();
    fetchOccurrenceStats();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header Section */}
      <div className="bg-white border-b border-gray-200">
        <div className="px-6 py-8">
          <div className="max-w-7xl mx-auto">
            <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
            <p className="text-gray-600 mt-2">
              overview of your platform schedules and analytics
            </p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-8 space-y-8">
        {/* Platform Cards */}
        <div>
          <div className="flex items-center gap-2 mb-6">
            <BarChart3 className="w-5 h-5 text-indigo-600" />
            <h2 className="text-xl font-semibold text-gray-900">Platforms</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6 gap-4">
            {platforms.length === 0 ? (
              <div className="col-span-full">
                <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
                  <Zap className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                  <p className="text-gray-500 font-medium">
                    No platforms available
                  </p>
                  <p className="text-sm text-gray-400 mt-1">
                    Add a platform to get started
                  </p>
                </div>
              </div>
            ) : (
              platforms?.map((platform) => (
                <Link key={platform.name} to={"/schedules/" + platform.name}>
                  <div className="group bg-white rounded-xl border border-gray-200 p-6 hover:border-indigo-300 hover:shadow-lg transition-all duration-200 cursor-pointer">
                    <div className="flex items-center justify-center w-12 h-12 bg-indigo-100 rounded-lg mb-4 group-hover:bg-indigo-200 transition-colors">
                      <Activity className="w-6 h-6 text-indigo-600" />
                    </div>
                    <h3 className="font-semibold text-gray-900 group-hover:text-indigo-600 transition-colors">
                      {platform.name}
                    </h3>
                  </div>
                </Link>
              ))
            )}
          </div>
        </div>

        {/* Statistics Cards */}
        <div>
          <div className="flex items-center gap-2 mb-6">
            <TrendingUp className="w-5 h-5 text-indigo-600" />
            <h2 className="text-xl font-semibold text-gray-900">Statistics</h2>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Total Schedules */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <Calendar className="w-5 h-5 text-blue-900" />
                  </div>
                  <h3 className="font-semibold text-gray-900">
                    Total Schedules
                  </h3>
                </div>
              </div>
              <div className="space-y-2">
                <p className="text-3xl font-bold text-blue-900">
                  {scheduleStat?.totalSchedules || 0}
                </p>
                <p className="text-sm text-gray-500">
                  Active scheduling sessions
                </p>
              </div>
            </div>

            {/* By Platform */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-green-100 rounded-lg">
                  <Activity className="w-5 h-5 text-green-600" />
                </div>
                <h3 className="font-semibold text-gray-900">Platform</h3>
              </div>
              <div className="space-y-3">
                {scheduleStat?.byPlatform?.length > 0 ? (
                  scheduleStat.byPlatform.map((item) => (
                    <div
                      key={item.platform}
                      className="flex items-center justify-between py-2 border-b border-gray-100 last:border-none"
                    >
                      <span className="text-gray-700 font-medium">
                        {item.platform}
                      </span>
                      <span className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm font-semibold">
                        {item.count}
                      </span>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-400 text-sm">
                    No platform data available
                  </p>
                )}
              </div>
            </div>

            {/* By Recurrence */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <Clock className="w-5 h-5 text-purple-600" />
                </div>
                <h3 className="font-semibold text-gray-900">Recurrence</h3>
              </div>
              <div className="space-y-3">
                {scheduleStat?.byRecurrence?.length > 0 ? (
                  scheduleStat.byRecurrence.map((item) => (
                    <div
                      key={item.recurrence}
                      className="flex items-center justify-between py-2 border-b border-gray-100 last:border-none"
                    >
                      {item.recurrence == "none" ? (
                        <span className="text-gray-700 font-medium capitalize">
                          Live
                        </span>
                      ) : (
                        <span className="text-gray-700 font-medium capitalize">
                          {item.recurrence}
                        </span>
                      )}

                      <span className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm font-semibold">
                        {item.count}
                      </span>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-400 text-sm">
                    No recurrence data available
                  </p>
                )}
              </div>
            </div>
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-orange-100 rounded-lg">
                    <Clock className="w-5 h-5 text-orange-600" />
                  </div>
                  <h3 className="font-semibold text-gray-900">Meetings</h3>
                </div>
              </div>
              <div className="space-y-2">
                <p className="text-3xl font-bold text-orange-600">
                  {occurrenceStats?.totalOccurrences || 0}
                </p>
                <p className="text-sm text-gray-500">
                  Total meetings across schedules
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Charts Grid */}
        {/* <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

          <div className="bg-white rounded-lg shadow border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Occurrences Over Time</h3>
              <Clock className="w-5 h-5 text-gray-400" />
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={occurrenceData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Area
                  type="monotone"
                  dataKey="occurrences"
                  stroke="#3B82F6"
                  fill="#3B82F6"
                  fillOpacity={0.1}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>

    
          <div className="bg-white rounded-lg shadow border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Recurrence Distribution</h3>
              <TrendingUp className="w-5 h-5 text-gray-400" />
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={recurrenceData}
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {recurrenceData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>

        
          <div className="bg-white rounded-lg shadow border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Top Hosts by Minutes</h3>
              <Users className="w-5 h-5 text-gray-400" />
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={hostData} layout="horizontal">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis type="category" dataKey="host" width={80} />
                <Tooltip />
                <Bar dataKey="minutes" fill="#10B981" />
              </BarChart>
            </ResponsiveContainer>
          </div>

      
          <div className="bg-white rounded-lg shadow border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Average Attendance Trend</h3>
              <Activity className="w-5 h-5 text-gray-400" />
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={occurrenceData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="attendance"
                  stroke="#F59E0B"
                  strokeWidth={3}
                  dot={{ r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div> */}

        {/* Recent Activity */}
        <div>
          <div className="flex items-center gap-2 mb-6">
            <Users className="w-5 h-5 text-indigo-600" />
            <h2 className="text-xl font-semibold text-gray-900">
              Recent Activity
            </h2>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div className="p-6">
              <div className="space-y-4">
                {[
                  {
                    action: "New schedule created",
                    schedule: "Team Meeting - DIT1",
                    time: "2 hours ago",
                    type: "success",
                  },
                  {
                    action: "Occurrence completed",
                    schedule: "Daily Standup - DEV",
                    time: "4 hours ago",
                    type: "info",
                  },
                  {
                    action: "Schedule updated",
                    schedule: "Weekly Review - QA",
                    time: "6 hours ago",
                    type: "warning",
                  },
                  {
                    action: "New participant joined",
                    schedule: "Training Session - UX",
                    time: "8 hours ago",
                    type: "success",
                  },
                ].map((activity, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-4 py-3 border-b border-gray-100 last:border-none"
                  >
                    <div
                      className={`w-2 h-2 rounded-full ${
                        activity.type === "success"
                          ? "bg-green-500"
                          : activity.type === "warning"
                          ? "bg-yellow-500"
                          : "bg-blue-500"
                      }`}
                    />
                    <div className="flex-1">
                      <p className="font-semibold text-gray-900">
                        {activity.action}
                      </p>
                      <p className="text-sm text-gray-600">
                        {activity.schedule}
                      </p>
                    </div>
                    <span className="text-sm text-gray-500 bg-gray-50 px-3 py-1 rounded-full">
                      {activity.time}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
