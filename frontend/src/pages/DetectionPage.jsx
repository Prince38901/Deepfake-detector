// frontend/src/pages/DetectionPage.jsx - Detection Page
import React from 'react';

function DetectionPage() {
  return (
    <div className="p-8">
      <h1 className="text-4xl font-bold mb-8">Deepfake Detection</h1>
      <div className="bg-gray-800 p-8 rounded-lg text-center">
        <p className="text-gray-400">Upload a video or audio file to analyze</p>
      </div>
    </div>
  );
}

export default DetectionPage;
