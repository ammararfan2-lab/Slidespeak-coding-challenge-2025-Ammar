"use client";
import React, { useState, useRef } from "react";
import { ChooseFileStep } from "@/components/ChooseFileStep";
import { LoadingIndicatorIcon } from "@/icons/LoadingIndicatorIcon";
import { PdfIcon } from "@/icons/PdfIcon";

/**
 * Status type representing the different stages of the conversion
 */
type Status =
  | "idle"
  | "selected"
  | "uploading"
  | "converting"
  | "done"
  | "error";

/**
 * PowerPointToPdfConverter
 *
 * Handles the entire flow:
 * - File selection
 * - Confirming conversion
 * - Fake uploading progress
 * - Conversion spinner
 * - Download link
 * - Error handling
 */
export default function PowerPointToPdfConverter() {
  const [status, setStatus] = useState<Status>("idle"); // Current status
  const [file, setFile] = useState<File | null>(null); // Selected file
  const [progress, setProgress] = useState<number>(0); // Upload progress
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null); // Download URL
  const [errorMessage, setErrorMessage] = useState<string | null>(null); // Error message

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  /**
   * Handles file selection from ChooseFileStep
   */
  const handleFileSelect = (selectedFile: File | null) => {
    if (selectedFile) {
      setFile(selectedFile);
      setStatus("selected");
      setProgress(0);
      setDownloadUrl(null);
      setErrorMessage(null);
    }
  };

  /**
   * Resets component to initial state
   */
  const reset = () => {
    setFile(null);
    setStatus("idle");
    setProgress(0);
    setDownloadUrl(null);
    setErrorMessage(null);
  };

  /**
   * Uploads the file to backend with **fake smooth progress**
   * and then shows conversion spinner while waiting for backend
   */
  const handleUpload = () => {
    if (!file) return;

    setStatus("uploading");
    setProgress(0);
    setErrorMessage(null);

    let fakeProgress = 0;

    // Smooth fake progress interval (0 → 95%)
    const interval = setInterval(() => {
      fakeProgress += Math.floor(Math.random() * 10) + 5; // increase 5–15%
      if (fakeProgress > 95) fakeProgress = 95;
      setProgress(fakeProgress);
    }, 200);

    const formData = new FormData();
    formData.append("file", file);

    const xhr = new XMLHttpRequest();
    xhr.open("POST", "http://localhost:8000/convert/");

    xhr.onload = () => {
      clearInterval(interval); // stop fake progress
      setProgress(100); // full progress
      if (xhr.status >= 200 && xhr.status < 300) {
        const contentType = xhr.getResponseHeader("content-type") || "";
        if (contentType.includes("application/json")) {
          const data = JSON.parse(xhr.responseText);
          setDownloadUrl(data.download_url);
        } else {
          const blob = new Blob([xhr.response]);
          const url = URL.createObjectURL(blob);
          setDownloadUrl(url);
        }
        setStatus("done");
      } else {
        setErrorMessage("Upload or conversion failed. Please try again.");
        setStatus("error");
      }
    };

    xhr.onerror = () => {
      clearInterval(interval);
      setErrorMessage("Upload failed. Please try again.");
      setStatus("error");
    };

    // Start upload
    xhr.send(formData);
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50 px-4">
      <div className="w-full max-w-md">
        {/* Step 1: File selection */}
        {status === "idle" && (
          <ChooseFileStep onSelect={handleFileSelect} inputRef={fileInputRef} />
        )}

        {/* Step 2: File selected, confirm conversion */}
        {status === "selected" && file && (
          <div className="bg-white shadow-lg rounded-2xl p-6">
            <p className="text-lg font-semibold truncate">{file.name}</p>
            <p className="text-sm text-gray-500 mb-4">
              {(file.size / 1024 / 1024).toFixed(2)} MB
            </p>
            <div className="flex justify-between">
              <button
                onClick={reset}
                className="px-4 py-2 rounded-lg border text-gray-600 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleUpload}
                className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700"
              >
                Convert
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Uploading progress */}
        {status === "uploading" && file && (
          <div className="bg-white shadow-lg rounded-2xl p-6 text-center">
            <p className="text-lg font-semibold">{file.name}</p>
            <p className="text-sm text-gray-500 mb-4">
              {(file.size / 1024 / 1024).toFixed(2)} MB
            </p>
            <p className="text-sm font-medium mb-2">Uploading: {progress}%</p>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-blue-600 h-2 rounded-full transition-all"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        )}

        {/* Step 4: Done, show download */}
        {status === "done" && downloadUrl && (
          <div className="bg-white shadow-lg rounded-2xl p-6 text-center">
            <div className="flex justify-center mb-3">
              <div className="w-12 h-12 text-red-500">
                <PdfIcon />
              </div>
            </div>
            <p className="text-lg font-semibold">
              File converted successfully!
            </p>
            <div className="flex justify-between mt-4">
              <button
                onClick={reset}
                className="px-4 py-2 rounded-lg border text-gray-600 hover:bg-gray-50"
              >
                Convert another
              </button>
              <a
                href={downloadUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700"
              >
                Download file
              </a>
            </div>
          </div>
        )}

        {/* Step 5: Error */}
        {status === "error" && errorMessage && (
          <div className="bg-red-50 border border-red-200 rounded-2xl p-6 text-center">
            <p className="text-red-600 font-semibold mb-4">{errorMessage}</p>
            <button
              onClick={reset}
              className="px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700"
            >
              Try Again
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// "use client";
// import React, { useState, useRef } from "react";
// import { ChooseFileStep } from "@/components/ChooseFileStep";
// import { LoadingIndicatorIcon } from "@/icons/LoadingIndicatorIcon";
// import { PdfIcon } from "@/icons/PdfIcon";

// /**
//  * Conversion status types for UX state handling
//  */
// type Status =
//   | "idle"
//   | "selected"
//   | "uploading"
//   | "converting"
//   | "done"
//   | "error";

// /**
//  * PowerPointToPdfConverter
//  *
//  * Handles file upload, conversion flow, and rendering
//  * different UI states (idle, uploading, converting, done).
//  */
// export default function PowerPointToPdfConverter() {
//   const [status, setStatus] = useState<Status>("idle");
//   const [file, setFile] = useState<File | null>(null);
//   const [progress, setProgress] = useState<number>(0);
//   const [downloadUrl, setDownloadUrl] = useState<string | null>(null);

//   const fileInputRef = useRef<HTMLInputElement | null>(null);

//   /**
//    * Handle file selection from ChooseFileStep
//    */
//   const handleFileSelect = (newFile: File | null) => {
//     if (newFile) {
//       setFile(newFile);
//       setStatus("selected");
//     }
//   };

//   /**
//    * Simulates file upload and conversion process
//    * TODO: Replace with backend API integration
//    */
//   //   const handleUpload = async () => {
//   //     if (!file) return;
//   //     setStatus("uploading");

//   //     // Simulate upload progress
//   //     for (let i = 0; i <= 100; i += 10) {
//   //       setTimeout(() => setProgress(i), i * 20);
//   //     }

//   //     // Fake conversion flow
//   //     setTimeout(() => {
//   //       setStatus("converting");
//   //       setTimeout(() => {
//   //         setStatus("done");
//   //         setDownloadUrl("/dummy.pdf"); // TODO: replace with API response
//   //       }, 2000);
//   //     }, 2000);
//   //   };

//   const handleUpload = async () => {
//     if (!file) return;

//     setStatus("uploading");

//     const formData = new FormData();
//     formData.append("file", file);

//     try {
//       setStatus("converting"); // 🔹 Show spinner immediately after starting request

//       const response = await fetch("http://localhost:8000/convert/", {
//         method: "POST",
//         body: formData,
//       });

//       if (!response.ok) {
//         throw new Error("Upload failed");
//       }

//       // If backend returned JSON with S3 link
//       if (response.headers.get("content-type")?.includes("application/json")) {
//         const data = await response.json();
//         setDownloadUrl(data.download_url);
//       } else {
//         // If backend returned FileResponse (raw PDF)
//         const blob = await response.blob();
//         const url = URL.createObjectURL(blob);
//         setDownloadUrl(url);
//       }

//       setStatus("done");
//     } catch (error) {
//       console.error(error);
//       setStatus("error");
//     }
//   };

//   return (
//     <div className="flex items-center justify-center min-h-screen bg-gray-50 px-4">
//       <div className="w-full max-w-md">
//         {/* Idle: Upload step */}
//         {status === "idle" && (
//           <ChooseFileStep onSelect={handleFileSelect} inputRef={fileInputRef} />
//         )}

//         {/* File selected: Show file card and Convert button */}
//         {status === "selected" && file && (
//           <div className="bg-white shadow-lg rounded-2xl p-6">
//             <p className="text-lg font-semibold truncate">{file.name}</p>
//             <p className="text-sm text-gray-500 mb-4">
//               {(file.size / 1024 / 1024).toFixed(2)} MB
//             </p>

//             <div className="border rounded-lg p-3 mb-4 bg-gray-50">
//               <p className="text-sm font-medium">Convert to PDF</p>
//               <p className="text-xs text-gray-500">
//                 Best quality, retains images and other assets.
//               </p>
//             </div>

//             <div className="flex justify-between">
//               <button
//                 onClick={() => {
//                   setFile(null);
//                   setStatus("idle");
//                 }}
//                 className="px-4 py-2 rounded-lg border text-gray-600 hover:bg-gray-50"
//               >
//                 Cancel
//               </button>
//               <button
//                 onClick={handleUpload}
//                 className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700"
//               >
//                 Convert
//               </button>
//             </div>
//           </div>
//         )}

//         {/* Uploading progress */}
//         {status === "uploading" && (
//           <div className="bg-white shadow-lg rounded-2xl p-6">
//             <p className="text-lg font-semibold">{file?.name}</p>
//             <p className="text-sm text-gray-500 mb-4">
//               {(file?.size ?? 0 / 1024 / 1024).toFixed(2)} MB
//             </p>

//             <p className="text-sm font-medium mb-2">Uploading: {progress}%</p>
//             <div className="w-full bg-gray-200 rounded-full h-2">
//               <div
//                 className="bg-blue-600 h-2 rounded-full transition-all"
//                 style={{ width: `${progress}%` }}
//               />
//             </div>
//           </div>
//         )}

//         {/* Converting spinner */}
//         {status === "converting" && (
//           <div className="bg-white shadow-lg rounded-2xl p-6 text-center">
//             <p className="text-lg font-semibold">{file?.name}</p>
//             <p className="text-sm text-gray-500 mb-4">
//               {(file?.size ?? 0 / 1024 / 1024).toFixed(2)} MB
//             </p>

//             <div className="flex items-center justify-center space-x-3">
//               {/* Wrap spinner to apply styling */}
//               <div className="w-6 h-6 text-blue-600 animate-spin">
//                 <LoadingIndicatorIcon />
//               </div>
//               <span className="text-sm">Converting your file</span>
//             </div>
//           </div>
//         )}

//         {/* Done: Show download link */}
//         {status === "done" && downloadUrl && (
//           <div className="bg-white shadow-lg rounded-2xl p-6 text-center">
//             <div className="flex justify-center mb-3">
//               <div className="w-12 h-12 text-red-500">
//                 <PdfIcon />
//               </div>
//             </div>
//             <p className="text-lg font-semibold">
//               File converted successfully!
//             </p>

//             <div className="flex justify-between mt-4">
//               <button
//                 onClick={() => {
//                   setFile(null);
//                   setStatus("idle");
//                 }}
//                 className="px-4 py-2 rounded-lg border text-gray-600 hover:bg-gray-50"
//               >
//                 Convert another
//               </button>
//               <a
//                 href={downloadUrl}
//                 download
//                 className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700"
//               >
//                 Download file
//               </a>
//             </div>
//           </div>
//         )}
//       </div>
//     </div>
//   );
// }
