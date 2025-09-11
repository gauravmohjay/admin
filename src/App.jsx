// src/App.jsx
import React from "react";
import { Routes, Route } from "react-router-dom";
import { Sidebar } from "./components/Sidebar";
import { SchedulesPanel } from "./components/SchedulesPanel";
import { SummaryPage } from "./components/SummaryPage";

export default function App() {
  return (
    <div className="flex">
      <Sidebar />
      <main className="flex-1 p-8 bg-gray-50 min-h-screen overflow-auto">
        <Routes>
          <Route path="/" element={<SchedulesPanel />} />
          <Route path="/summary" element={<SummaryPage />} />
        </Routes>
      </main>
    </div>
  );
}
