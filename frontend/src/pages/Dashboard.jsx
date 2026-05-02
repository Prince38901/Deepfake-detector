// frontend/src/pages/Dashboard.jsx - Dashboard Page
import React from 'react';

function Dashboard() {
  return (
    <div className="p-8">
      <h1 className="text-4xl font-bold mb-8">Deepfake Detection Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-gray-800 p-6 rounded-lg">
          <h3 className="text-gray-400 text-sm">Total Detections</h3>
          <p className="text-3xl font-bold text-white">0</p>
        </div>
        <div className="bg-gray-800 p-6 rounded-lg">
          <h3 className="text-gray-400 text-sm">Fake Detected</h3>
          <p className="text-3xl font-bold text-red-500">0</p>
        </div>
        <div className="bg-gray-800 p-6 rounded-lg">
          <h3 className="text-gray-400 text-sm">Real Detected</h3>
          <p className="text-3xl font-bold text-green-500">0</p>
        </div>
        <div className="bg-gray-800 p-6 rounded-lg">
          <h3 className="text-gray-400 text-sm">Accuracy Rate</h3>
          <p className="text-3xl font-bold text-blue-500">0%</p>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
