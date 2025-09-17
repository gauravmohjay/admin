import { 
  Calendar, 
  Users, 
  Activity, 
  TrendingUp,
  Clock,
  VideoIcon
} from 'lucide-react';
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
  ResponsiveContainer
} from 'recharts';

// Demo data for charts
const occurrenceData = [
  { date: 'Jan 1', occurrences: 12, attendance: 45 },
  { date: 'Jan 2', occurrences: 19, attendance: 52 },
  { date: 'Jan 3', occurrences: 8, attendance: 38 },
  { date: 'Jan 4', occurrences: 15, attendance: 61 },
  { date: 'Jan 5', occurrences: 22, attendance: 58 },
  { date: 'Jan 6', occurrences: 18, attendance: 49 },
  { date: 'Jan 7', occurrences: 25, attendance: 67 },
  { date: 'Jan 8', occurrences: 16, attendance: 44 },
  { date: 'Jan 9', occurrences: 21, attendance: 55 },
  { date: 'Jan 10', occurrences: 14, attendance: 41 },
  { date: 'Jan 11', occurrences: 28, attendance: 72 },
  { date: 'Jan 12', occurrences: 23, attendance: 59 },
  { date: 'Jan 13', occurrences: 17, attendance: 47 },
  { date: 'Jan 14', occurrences: 20, attendance: 53 },
];

const recurrenceData = [
  { name: 'None', value: 45, color: '#8884d8' },
  { name: 'Daily', value: 35, color: '#82ca9d' },
  { name: 'Custom', value: 20, color: '#ffc658' },
];

const hostData = [
  { host: 'John Smith', minutes: 2450 },
  { host: 'Sarah Johnson', minutes: 1890 },
  { host: 'Mike Davis', minutes: 1650 },
  { host: 'Lisa Wilson', minutes: 1420 },
  { host: 'David Brown', minutes: 1180 },
];

const Dashboard = () => {
  const kpiCards = [
    {
      title: 'Total Schedules',
      value: '247',
      change: '+12.5%',
      changeType: 'positive',
      icon: Calendar,
      color: 'bg-blue-500',
    },
    {
      title: 'Active Schedules',
      value: '189',
      change: '+8.2%',
      changeType: 'positive',
      icon: Activity,
      color: 'bg-green-500',
    },
    {
      title: 'Live Occurrences',
      value: '23',
      change: '+15.3%',
      changeType: 'positive',
      icon: VideoIcon,
      color: 'bg-red-500',
    },
    {
      title: 'Avg. Attendance',
      value: '54.2%',
      change: '-2.1%',
      changeType: 'negative',
      icon: Users,
      color: 'bg-purple-500',
    },
  ];

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600">Overview of your schedule management system</p>
        </div>
        <div className="text-sm text-amber-600 bg-amber-50 px-3 py-1 rounded-lg border border-amber-200">
          Demo data — will be replaced by API
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {kpiCards.map((card, index) => {
          const Icon = card.icon;
          return (
            <div key={index} className="bg-white rounded-lg shadow border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{card.title}</p>
                  <p className="text-3xl font-bold text-gray-900">{card.value}</p>
                  <div className="flex items-center mt-2">
                    <span
                      className={`text-sm font-medium ${
                        card.changeType === 'positive'
                          ? 'text-green-600'
                          : 'text-red-600'
                      }`}
                    >
                      {card.change}
                    </span>
                    <span className="text-sm text-gray-500 ml-1">vs last period</span>
                  </div>
                </div>
                <div className={`w-12 h-12 ${card.color} rounded-lg flex items-center justify-center`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Occurrences Over Time */}
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

        {/* Recurrence Distribution */}
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

        {/* Top Hosts by Minutes */}
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

        {/* Attendance Trends */}
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
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-lg shadow border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Recent Activity</h3>
        </div>
        <div className="p-6">
          <div className="space-y-4">
            {[
              { action: 'New schedule created', schedule: 'Team Meeting - DIT1', time: '2 hours ago' },
              { action: 'Occurrence completed', schedule: 'Daily Standup - DEV', time: '4 hours ago' },
              { action: 'Schedule updated', schedule: 'Weekly Review - QA', time: '6 hours ago' },
              { action: 'New participant joined', schedule: 'Training Session - UX', time: '8 hours ago' },
            ].map((activity, index) => (
              <div key={index} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-b-0">
                <div>
                  <p className="font-medium text-gray-900">{activity.action}</p>
                  <p className="text-sm text-gray-600">{activity.schedule}</p>
                </div>
                <span className="text-sm text-gray-500">{activity.time}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;