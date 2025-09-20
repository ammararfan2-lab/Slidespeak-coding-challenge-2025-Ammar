"use client";

import { useRef, useState } from "react";
import { ChooseFileStep } from "@/components/ChooseFileStep";
import { LoadingIndicatorIcon } from "@/icons/LoadingIndicatorIcon";
import { PdfIcon } from "@/icons/PdfIcon";
import { useConversionStore } from "@/stores/conversionStore";

/**
 * PowerPointToPdfConverter
 *
 * Handles file selection, fake upload progress, conversion spinner,
 * download link, and error handling.
 */
export default function PowerPointToPdfConverter() {
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // ✅ Track whether user has selected "Convert to PDF"
  const [convertOptionSelected, setConvertOptionSelected] = useState(false);

  const {
    status,
    file,
    progress,
    downloadUrl,
    errorMessage,
    setStatus,
    setFile,
    setProgress,
    setDownloadUrl,
    setErrorMessage,
    reset,
  } = useConversionStore();

  /** Handle file selection */
  const handleFileSelect = (selectedFile: File | null) => {
    if (!selectedFile) return;
    setFile(selectedFile);
    setStatus("selected");
    setProgress(0);
    setDownloadUrl(null);
    setErrorMessage(null);
    setConvertOptionSelected(false); // reset selection when new file chosen
  };

  /** Fake upload progress */
  const simulateUpload = (): Promise<void> => {
    return new Promise((resolve) => {
      setStatus("uploading");
      let percent = 0;
      const interval = setInterval(() => {
        percent += Math.floor(Math.random() * 10) + 5; // Increment randomly
        if (percent >= 100) {
          percent = 100;
          setProgress(percent);
          clearInterval(interval);
          resolve(); // upload complete
        } else {
          setProgress(percent);
        }
      }, 100);
    });
  };

  /** Handle conversion process */
  const handleConvert = async () => {
    if (!file) return;

    try {
      // Step 1: Fake upload
      await simulateUpload();

      // Step 2: Show conversion spinner
      setStatus("converting");

      // First upload
      const formData = new FormData();
      formData.append("file", file);

      const uploadRes = await fetch("http://localhost:8000/upload/", {
        method: "POST",
        body: formData,
      });

      if (!uploadRes.ok) throw new Error("Upload failed");
      const uploadData = await uploadRes.json();
      const fileId = uploadData.file_id;

      // Then convert
      const convertForm = new FormData();
      convertForm.append("file_id", fileId);

      const convertRes = await fetch("http://localhost:8000/convert/", {
        method: "POST",
        body: convertForm,
      });

      if (!convertRes.ok) throw new Error("Conversion failed");

      const data = await convertRes.json();
      if (!data.download_url) throw new Error("No download URL returned");
      setDownloadUrl(data.download_url);

      setStatus("done");
    } catch (err: any) {
      console.error(err);
      setErrorMessage(err.message || "Something went wrong");
      setStatus("error");
    }
  };

  /** Open PDF in new tab + trigger download */
  const handleDownloadAndOpen = async () => {
    if (!downloadUrl) return;

    // Fetch the file as blob
    const response = await fetch(downloadUrl);
    const blob = await response.blob();

    // Create an object URL
    const blobUrl = URL.createObjectURL(blob);

    // Open in new tab
    window.open(blobUrl, "_blank");

    // Trigger download
    const link = document.createElement("a");
    link.href = blobUrl;
    link.download = downloadUrl.split("/").pop() || "converted.pdf";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    // Cleanup
    URL.revokeObjectURL(blobUrl);
  };

  return (
    <>
      {/* Step 1: File selection */}
      {status === "idle" && (
        <ChooseFileStep onSelect={handleFileSelect} inputRef={fileInputRef} />
      )}

      {/* Step 2: File selected */}
      {status === "selected" && file && (
        <div className="flex items-center justify-center min-h-screen bg-gray-50 px-4">
          <div className="w-full max-w-sm">
            <div className="bg-white shadow-sm rounded-xl p-6 border border-gray-200">
              <div className="text-center space-y-4">
                {/* File info box */}
                <div className="space-y-1 border border-gray-300 rounded-lg shadow-md p-3 bg-white">
                  <p className="text-base font-medium text-gray-900 truncate">
                    {file.name}
                  </p>
                  <p className="text-sm text-gray-500">
                    {(file.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>

                {/* ✅ Convert option (clickable like checkbox) */}
                <button
                  type="button"
                  onClick={() =>
                    setConvertOptionSelected(!convertOptionSelected)
                  }
                  className={`w-full text-left rounded-lg p-3 border transition 
                    ${
                      convertOptionSelected
                        ? "bg-blue-100 border-blue-600"
                        : "bg-blue-50 border-blue-200"
                    }`}
                >
                  <div className="flex items-center space-x-3">
                    <div
                      className={`w-4 h-4 rounded-full border-2 flex items-center justify-center flex-shrink-0
                      ${
                        convertOptionSelected
                          ? "border-blue-600"
                          : "border-gray-300"
                      }`}
                    >
                      {convertOptionSelected && (
                        <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                      )}
                    </div>
                    <div className="text-left">
                      <p className="text-sm font-medium text-blue-900">
                        Convert to PDF
                      </p>
                      <p className="text-xs text-blue-700">
                        Best quality, retains images and other assets.
                      </p>
                    </div>
                  </div>
                </button>

                {/* Buttons */}
                <div className="flex space-x-3 pt-2">
                  <button
                    onClick={reset}
                    className="flex-1 px-4 py-2 rounded-lg border border-gray-300 text-gray-700 text-sm font-medium hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleConvert}
                    disabled={!convertOptionSelected}
                    className={`flex-1 px-4 py-2 rounded-lg text-sm font-medium transition-colors
                      ${
                        convertOptionSelected
                          ? "bg-blue-600 text-white hover:bg-blue-700"
                          : "bg-gray-200 text-gray-400 cursor-not-allowed"
                      }`}
                  >
                    Convert
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Step 3: Uploading progress */}
      {status === "uploading" && file && (
        <div className="flex items-center justify-center min-h-screen bg-gray-50 px-4">
          <div className="w-full max-w-sm">
            <div className="bg-white shadow-sm rounded-xl p-6 border border-gray-200">
              <div className="text-center space-y-4">
                <div className="space-y-1 border border-gray-300 rounded-lg shadow-md p-3 bg-white">
                  <p className="text-base font-medium text-gray-900 truncate">
                    {file.name}
                  </p>
                  <p className="text-sm text-gray-500">
                    {(file.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-center space-x-2">
                    <div className="w-4 h-4 bg-blue-600 rounded-full animate-pulse"></div>
                    <span className="text-sm font-medium text-gray-900">
                      Uploading your file
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>

                <button
                  onClick={reset}
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 text-gray-700 text-sm font-medium hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Step 4: Converting */}
      {status === "converting" && file && (
        <div className="flex items-center justify-center min-h-screen bg-gray-50 px-4">
          <div className="w-full max-w-sm">
            <div className="bg-white shadow-sm rounded-xl p-6 border border-gray-200">
              <div className="text-center space-y-4">
                <div className="space-y-1 border border-gray-300 rounded-lg shadow-md p-3 bg-white">
                  <p className="text-base font-medium text-gray-900 truncate">
                    {file.name}
                  </p>
                  <p className="text-sm text-gray-500">
                    {(file.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>

                <div className="flex flex-col items-center space-y-3">
                  <div className="w-5 h-5 text-blue-600 animate-spin">
                    <LoadingIndicatorIcon />
                  </div>
                  <span className="text-sm font-medium text-gray-900">
                    Converting your file
                  </span>
                </div>

                <button
                  onClick={reset}
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 text-gray-700 text-sm font-medium hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Step 5: Done */}
      {status === "done" && downloadUrl && (
        <div className="flex items-center justify-center min-h-screen bg-gray-50 px-4">
          <div className="w-full max-w-sm">
            <div className="bg-white shadow-sm rounded-xl p-6 border border-gray-200">
              <div className="text-center space-y-4">
                <div className="flex justify-center">
                  <div className="w-full max-w-sm bg-white border border-gray-300 rounded-lg shadow-md p-6 flex flex-col items-center space-y-4">
                    {/* PDF Icon */}
                    <div className="w-18 h-18 flex items-center justify-center">
                      <PdfIcon />
                    </div>

                    {/* Success text */}
                    <p className="text-base font-medium text-gray-900 text-center">
                      File converted successfully!
                    </p>
                  </div>
                </div>

                <div className="flex space-x-3 pt-2">
                  <button
                    onClick={reset}
                    className="flex-1 px-4 py-2 rounded-lg border border-gray-300 text-gray-700 text-sm font-medium hover:bg-gray-50 transition-colors"
                  >
                    Convert another
                  </button>
                  <button
                    onClick={handleDownloadAndOpen}
                    className="flex-1 px-4 py-2 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 transition-colors"
                  >
                    Download file
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Step 6: Error */}
      {status === "error" && errorMessage && (
        <div className="flex items-center justify-center min-h-screen bg-gray-50 px-4">
          <div className="w-full max-w-sm">
            <div className="bg-red-50 border border-red-200 rounded-xl p-6">
              <div className="text-center space-y-4">
                <p className="text-red-600 font-medium text-sm">
                  {errorMessage}
                </p>
                <button
                  onClick={reset}
                  className="w-full px-4 py-2 rounded-lg bg-red-600 text-white text-sm font-medium hover:bg-red-700 transition-colors"
                >
                  Try Again
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
