// Recordings.tsx or .jsx
import React from "react";
import { useParams } from "react-router-dom";

const Recordings = () => {
  const { platformId } = useParams();

  // Implement recordings fetch/render using platformId if needed.
  return (
    <div className="bg-white rounded-lg shadow border border-gray-200 p-6">
      <h2 className="text-xl font-semibold text-gray-900 mb-2">Recordings</h2>
      <p className="text-gray-600">
        Platform: {platformId}
      </p>
      {/* TODO: List recordings here */}
    </div>
  );
};

export default Recordings;
