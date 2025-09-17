import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Sidebar from './components/Layout/Sidebar';
import Topbar from './components/Layout/Topbar';
import Dashboard from './pages/Dashboard';
import Schedules from './pages/Schedules';
import ScheduleDetail from './pages/ScheduleDetail';
import OccurrenceDetail from './pages/OccurrenceDetail';
import Recordings from './pages/Recordings';

function App() {
  return (
    <Router>
      <div className="flex min-h-screen bg-gray-50">
        {/* <Sidebar /> */}
        <div className="flex-1 ">
          <Topbar />
          <main className="flex-1">
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/schedules/:platformId" element={<Schedules />} />
              <Route path="/schedules/:platformId/:scheduleId" element={<ScheduleDetail />} />
              <Route path="/schedules/:platformId/:scheduleId/occurrences/:occurrenceId" element={<OccurrenceDetail />} />
              <Route path="/recordings" element={<Recordings />} />
            </Routes>
          </main>
        </div>
      </div>
    </Router>
  );
}

export default App;