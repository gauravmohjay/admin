// SchedulesTabs.tsx or .jsx
import React from "react";
import { NavLink, Outlet, useParams } from "react-router-dom";

export default function SchedulesTabs() {
  const { platformId } = useParams();

  const baseClasses =
    "px-4 py-2 text-sm font-medium border-b-2 -mb-px transition-colors";
  const inactive =
    "text-gray-500 border-transparent hover:text-gray-700 hover:border-gray-300";
  const active = "text-primary-600 border-primary-600";

  return (
    <div className="p-6 md:w-10/12 mx-auto ">
      {/* Top Tabs */}
      <div className="border-b border-gray-200 mb-4">
        <nav className="-mb-px flex justify-center space-x-6" aria-label="Tabs">
          {/* Schedules tab (index route) */}
          <NavLink
            to="."
            end
            className={({ isActive }) =>
              `${baseClasses} ${isActive ? active : inactive}`
            }
          >
            Schedules
          </NavLink>

          {/* Recordings tab */}
          <NavLink
            to="recordings"
            className={({ isActive }) =>
              `${baseClasses} ${isActive ? active : inactive}`
            }
          >
            Recordings
          </NavLink>
        </nav>
      </div>


      <Outlet />
    </div>
  );
}
