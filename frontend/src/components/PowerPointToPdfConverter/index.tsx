"use client";
import React, { useState, useEffect } from 'react';
import FileDropzone from '../FileDropzone';
const PowerPointToPdfConverter: React.FC = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isConverting, setIsConverting] = useState(false);
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [jobId, setJobId] = useState<string | null>(null);

  const handleFileSelected = (file: File) => {
    setSelectedFile(file);
    setDownloadUrl(null);
    setError(null);
    setJobId(null);
  };

  const handleConfirm = async () => {
    if (!selectedFile) return;
    setIsUploading(true);
    setError(null);
    try {
      const formData = new FormData();
      formData.append('file', selectedFile);

      const response = await fetch('http://localhost:8000/convert/', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.detail || 'Upload failed');
      }

      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        const data = await response.json();
        if (data.download_url) {
          setDownloadUrl(data.download_url);
        } else if (data.job_id) {
          setJobId(data.job_id);
          setIsConverting(true);
        }
      } else {
        // PDF file response
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        setDownloadUrl(url);
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred');
    } finally {
      setIsUploading(false);
    }
  };

  // Polling for conversion status
  React.useEffect(() => {
    let interval: NodeJS.Timeout | undefined;
    if (isConverting && jobId) {
      interval = setInterval(async () => {
        try {
          const res = await fetch(`http://localhost:8000/status/${jobId}`);
          if (!res.ok) throw new Error('Failed to get status');
          const data = await res.json();
          if (data.status === 'finished' && data.download_url) {
            setDownloadUrl(data.download_url);
            setIsConverting(false);
            setJobId(null);
          } else if (data.status === 'error') {
            setError(data.detail || 'Conversion failed');
            setIsConverting(false);
            setJobId(null);
          }
        } catch (err: any) {
          setError(err.message || 'Status polling error');
          setIsConverting(false);
          setJobId(null);
        }
      }, 2000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isConverting, jobId]);

  return (
    <div className="flex flex-col gap-4 items-center">
      <FileDropzone onFileSelected={handleFileSelected} disabled={isUploading || isConverting} />
      {selectedFile && (
        <div className="text-sm text-gray-600">Selected file: {selectedFile.name}</div>
      )}
      <button
        className="bg-blue-600 text-white px-4 py-2 rounded disabled:opacity-50"
        onClick={handleConfirm}
        disabled={!selectedFile || isUploading || isConverting}
      >
        Confirm & Convert
      </button>
      {(isUploading || isConverting) && (
        <div className="flex items-center gap-2 mt-2">
          <span className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-blue-600"></span>
          <span className="text-blue-600">{isUploading ? 'Uploading...' : 'Converting...'}</span>
        </div>
      )}
      {downloadUrl && (
        <a
          href={downloadUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="bg-green-600 text-white px-4 py-2 rounded mt-2"
        >
          Download PDF
        </a>
      )}
      {error && (
        <div className="text-red-600 mt-2">{error}</div>
      )}
    </div>
  );
};

export default PowerPointToPdfConverter;
