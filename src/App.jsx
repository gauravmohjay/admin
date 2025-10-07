import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Topbar from "./components/Layout/Topbar";
import Dashboard from "./pages/Dashboard";
import Schedules from "./pages/Schedules";
import ScheduleDetail from "./pages/ScheduleDetail";
import OccurrenceDetail from "./pages/OccurrenceDetail";
import Recordings from "./pages/Recordings";
import SchedulesTabs from "./components/Layout/SchedulesTabs";
import Login from "./pages/Login";
import ProtectedRoute from "./components/Layout/ProtectedRoute";
import { useEffect, useState } from "react";
import Room from "./pages/Room";

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem("token"));

  useEffect(() => {
    const handleStorageChange = () => {
      setIsLoggedIn(!!localStorage.getItem("token"));
    };

    // listen to storage changes (like login/logout in another tab)
    window.addEventListener("storage", handleStorageChange);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
    };
  }, []);

  return (
    <Router>
      <div className="  min-h-screen bg-gray-50">
        <div className="">
          {isLoggedIn && <Topbar />} {/* consistent Topbar */}
          <main className=" ">
            <Routes>
              {/* Public route */}
              <Route path="/" element={<Login />} />

              {/* Protected routes */}
              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute>
                    <Dashboard />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/schedules/:platformId"
                element={
                  <ProtectedRoute>
                    <Schedules />
                  </ProtectedRoute>
                }
              >
                {/* <Route index element={<Schedules />} />
                <Route path="recordings" element={<Recordings />} /> */}
              </Route>

              <Route
                path="/schedules/:platformId/:scheduleId"
                element={
                  <ProtectedRoute>
                    <ScheduleDetail />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/schedules/:platformId/:scheduleId/occurrences/:occurrenceId"
                element={
                  <ProtectedRoute>
                    <OccurrenceDetail />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/room"
                element={
                  <ProtectedRoute>
                    <Room />
                  </ProtectedRoute>
                }
              />
            </Routes>
          </main>
        </div>
      </div>
    </Router>
  );
}

export default App;
