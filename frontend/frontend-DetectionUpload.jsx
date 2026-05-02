// frontend/src/components/DetectionUpload.jsx - File Upload & Detection Component

import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { FiUploadCloud, FiPlay, FiCheckCircle, FiAlertTriangle } from 'react-icons/fi';
import toast from 'react-hot-toast';
import { useDetectionStore } from '../store/detectionStore';
import axios from 'axios';

const DetectionUpload = () => {
  const [detectionType, setDetectionType] = useState('multimodal'); // video, audio, multimodal
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [results, setResults] = useState(null);
  const { addDetection } = useDetectionStore();

  const onDrop = useCallback(async (acceptedFiles) => {
    if (acceptedFiles.length === 0) {
      toast.error('No valid files selected');
      return;
    }

    const file = acceptedFiles[0];
    const formData = new FormData();
    formData.append('file', file);
    formData.append('type', detectionType);

    setLoading(true);
    setProgress(0);

    try {
      const token = localStorage.getItem('authToken');
      
      const response = await axios.post('/api/detect/multimodal', formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        },
        onUploadProgress: (progressEvent) => {
          const percentComplete = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total
          );
          setProgress(percentComplete);
        }
      });

      setResults(response.data);
      addDetection(response.data);
      
      toast.success('Detection completed successfully!');
    } catch (error) {
      toast.error(error.response?.data?.error || 'Detection failed');
      console.error('Detection error:', error);
    } finally {
      setLoading(false);
    }
  }, [detectionType, addDetection]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'video/*': ['.mp4', '.avi', '.mov', '.mkv'],
      'audio/*': ['.mp3', '.wav', '.ogg', '.m4a']
    },
    disabled: loading
  });

  return (
    <div className="max-w-4xl mx-auto p-6 bg-gray-800 rounded-lg shadow-xl">
      <h2 className="text-3xl font-bold mb-6 text-white">
        🎬 Deepfake Detection System
      </h2>

      {/* Detection Type Selector */}
      <div className="mb-6 grid grid-cols-3 gap-4">
        {['video', 'audio', 'multimodal'].map((type) => (
          <button
            key={type}
            onClick={() => setDetectionType(type)}
            className={`py-3 px-4 rounded-lg font-semibold transition-all ${
              detectionType === type
                ? 'bg-blue-600 text-white shadow-lg'
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            {type.charAt(0).toUpperCase() + type.slice(1)}
          </button>
        ))}
      </div>

      {/* Upload Area */}
      <div
        {...getRootProps()}
        className={`relative border-2 border-dashed rounded-lg p-12 text-center transition-all cursor-pointer ${
          isDragActive
            ? 'border-blue-400 bg-blue-50/10'
            : 'border-gray-600 hover:border-blue-400'
        } ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
      >
        <input {...getInputProps()} />
        <div className="flex flex-col items-center justify-center">
          <FiUploadCloud className="w-16 h-16 text-blue-400 mb-4" />
          <p className="text-xl font-semibold text-white mb-2">
            {isDragActive
              ? 'Drop your file here...'
              : 'Drag & drop your media file'}
          </p>
          <p className="text-gray-400 mb-4">
            or click to select from your computer
          </p>
          <p className="text-sm text-gray-500">
            Supported: Video (MP4, AVI, MOV, MKV) or Audio (MP3, WAV, OGG, M4A)
          </p>
        </div>
      </div>

      {/* Progress Bar */}
      {loading && (
        <div className="mt-6">
          <div className="flex justify-between mb-2">
            <span className="text-sm font-semibold">Analyzing...</span>
            <span className="text-sm font-semibold">{progress}%</span>
          </div>
          <div className="w-full bg-gray-700 rounded-full h-3 overflow-hidden">
            <div
              className="bg-gradient-to-r from-blue-500 to-purple-600 h-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}

      {/* Results Display */}
      {results && (
        <div className="mt-8 p-6 bg-gray-700 rounded-lg">
          <h3 className="text-2xl font-bold mb-4 flex items-center">
            {results.isFake ? (
              <>
                <FiAlertTriangle className="text-red-500 mr-2" />
                <span className="text-red-500">⚠️ LIKELY DEEPFAKE</span>
              </>
            ) : (
              <>
                <FiCheckCircle className="text-green-500 mr-2" />
                <span className="text-green-500">✓ LIKELY AUTHENTIC</span>
              </>
            )}
          </h3>

          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="bg-gray-600 p-4 rounded-lg">
              <p className="text-gray-400 text-sm mb-2">Confidence Score</p>
              <div className="text-3xl font-bold text-blue-400">
                {(results.confidence * 100).toFixed(1)}%
              </div>
              <div className="w-full bg-gray-500 rounded-full h-2 mt-2">
                <div
                  className={`h-full rounded-full transition-all ${
                    results.isFake ? 'bg-red-500' : 'bg-green-500'
                  }`}
                  style={{ width: `${results.confidence * 100}%` }}
                />
              </div>
            </div>

            <div className="bg-gray-600 p-4 rounded-lg">
              <p className="text-gray-400 text-sm mb-2">Detection Type</p>
              <div className="text-2xl font-bold capitalize">
                {results.mediaType}
              </div>
            </div>
          </div>

          {/* Detailed Analysis */}
          {results.details && (
            <div className="bg-gray-800 p-4 rounded-lg mb-4">
              <h4 className="font-semibold mb-3 text-blue-300">Detailed Analysis</h4>
              <div className="space-y-2 text-sm">
                {results.components?.video && (
                  <div className="text-gray-300">
                    <strong>Video Score:</strong> {(results.components.video.confidence * 100).toFixed(1)}%
                  </div>
                )}
                {results.components?.audio && (
                  <div className="text-gray-300">
                    <strong>Audio Score:</strong> {(results.components.audio.confidence * 100).toFixed(1)}%
                  </div>
                )}
                {results.components?.synchronization && (
                  <div className="text-gray-300">
                    <strong>Lip-Sync Consistency:</strong> {(results.components.synchronization.lipSyncConsistency * 100).toFixed(1)}%
                  </div>
                )}
              </div>
            </div>
          )}

          <p className="text-xs text-gray-400 mt-4">
            Timestamp: {new Date(results.timestamp).toLocaleString()}
          </p>
        </div>
      )}

      {/* Help Section */}
      {!results && !loading && (
        <div className="mt-8 p-4 bg-blue-900/30 border border-blue-700 rounded-lg">
          <h4 className="font-semibold mb-2 text-blue-300">💡 How it works</h4>
          <ul className="text-sm text-gray-300 space-y-1">
            <li>✓ Analyzes facial artifacts, lighting inconsistencies, and temporal anomalies</li>
            <li>✓ Detects audio distortions, voice synthesis artifacts, and frequency anomalies</li>
            <li>✓ Performs audio-visual synchronization analysis for multimodal detection</li>
            <li>✓ Provides confidence scores and detailed forensic reports</li>
          </ul>
        </div>
      )}
    </div>
  );
};

export default DetectionUpload;
