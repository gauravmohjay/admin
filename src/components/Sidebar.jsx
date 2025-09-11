// src/components/Sidebar.jsx
import React from "react";
import { Link, useLocation } from "react-router-dom";

import {Clipboard,TableOfContents} from "lucide-react"
const navItems = [
  { to: "/", label: "Full Panel", icon: Clipboard },
  { to: "/summary", label: "Summary View", icon: TableOfContents }
];

export function Sidebar() {
  const { pathname } = useLocation();
  return (
    <aside className="w-60 h-screen bg-white border-r border-gray-200">
      <nav className="flex flex-col p-6 space-y-4">
        {navItems.map(({ to, label, icon: Icon }) => {
          const active = pathname === to;
          return (
            <Link
              key={to}
              to={to}
              className={`flex items-center gap-3 px-4 py-2 rounded-md text-sm font-medium
                ${active
                  ? "bg-blue-100 text-blue-700"
                  : "text-gray-700 hover:bg-gray-100"}
              `}
            >
              <Icon className="w-5 h-5" />
              {label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
