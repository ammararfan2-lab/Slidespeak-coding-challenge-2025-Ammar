"use client";

import React, { useRef } from "react";
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
  //   const handleConvert = async () => {
  //     if (!file) return;

  //     try {
  //       // Step 1: Fake upload
  //       await simulateUpload();

  //       // Step 2: Show conversion spinner
  //       setStatus("converting");

  //       const formData = new FormData();
  //       formData.append("file", file);

  //       const res = await fetch("http://localhost:8000/convert/", {
  //         method: "POST",
  //         body: formData,
  //       });

  //       if (!res.ok) throw new Error("Conversion failed");

  //       // Handle JSON response (S3 or local)
  //       const data = await res.json();
  //       if (!data.download_url) throw new Error("No download URL returned");
  //       setDownloadUrl(data.download_url);

  //       setStatus("done");
  //     } catch (err: any) {
  //       console.error(err);
  //       setErrorMessage(err.message || "Something went wrong");
  //       setStatus("error");
  //     }
  //   };
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
    <div className="flex items-center justify-center min-h-screen bg-gray-50 px-4">
      <div className="w-full max-w-md">
        {/* Step 1: File selection */}
        {status === "idle" && (
          <ChooseFileStep onSelect={handleFileSelect} inputRef={fileInputRef} />
        )}

        {/* Step 2: File selected */}
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
                onClick={handleConvert}
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

        {/* Step 4: Converting */}
        {status === "converting" && file && (
          <div className="bg-white shadow-lg rounded-2xl p-6 text-center">
            <p className="text-lg font-semibold">{file.name}</p>
            <p className="text-sm text-gray-500 mb-4">
              {(file.size / 1024 / 1024).toFixed(2)} MB
            </p>
            <div className="flex flex-col items-center space-y-3">
              <div className="w-8 h-8 text-blue-600 animate-spin">
                <LoadingIndicatorIcon />
              </div>
              <span className="text-sm">Converting your file...</span>
            </div>
          </div>
        )}

        {/* Step 5: Done */}
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
              {/* <button
                onClick={async () => {
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
                  link.download =
                    downloadUrl.split("/").pop() || "converted.pdf";
                  document.body.appendChild(link);
                  link.click();
                  document.body.removeChild(link);

                  // Cleanup
                  URL.revokeObjectURL(blobUrl);
                }}
                className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700"
              >
                Open & Download
              </button> */}
              <button
                onClick={handleDownloadAndOpen}
                className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700"
              >
                Download
              </button>
            </div>
          </div>
        )}

        {/* Step 6: Error */}
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

// import React, { useRef } from "react";
// import { ChooseFileStep } from "@/components/ChooseFileStep";
// import { LoadingIndicatorIcon } from "@/icons/LoadingIndicatorIcon";
// import { PdfIcon } from "@/icons/PdfIcon";
// import { useConversionStore } from "@/stores/conversionStore";

// /**
//  * PowerPointToPdfConverter
//  *
//  * Handles file selection, fake upload progress, conversion spinner,
//  * download link, and error handling.
//  */
// export default function PowerPointToPdfConverter() {
//   const fileInputRef = useRef<HTMLInputElement | null>(null);

//   const {
//     status,
//     file,
//     progress,
//     downloadUrl,
//     errorMessage,
//     setStatus,
//     setFile,
//     setProgress,
//     setDownloadUrl,
//     setErrorMessage,
//     reset,
//   } = useConversionStore();

//   /** Handle file selection */
//   const handleFileSelect = (selectedFile: File | null) => {
//     if (!selectedFile) return;
//     setFile(selectedFile);
//     setStatus("selected");
//     setProgress(0);
//     setDownloadUrl(null);
//     setErrorMessage(null);
//   };

//   /** Fake upload progress */
//   const simulateUpload = (): Promise<void> => {
//     return new Promise((resolve) => {
//       setStatus("uploading");
//       let percent = 0;
//       const interval = setInterval(() => {
//         percent += Math.floor(Math.random() * 10) + 5; // Increment randomly
//         if (percent >= 100) {
//           percent = 100;
//           setProgress(percent);
//           clearInterval(interval);
//           resolve(); // upload complete
//         } else {
//           setProgress(percent);
//         }
//       }, 100);
//     });
//   };

//   /** Handle conversion process */
//   const handleConvert = async () => {
//     if (!file) return;

//     try {
//       // Step 1: Fake upload
//       await simulateUpload();

//       // Step 2: Show conversion spinner
//       setStatus("converting");

//       const formData = new FormData();
//       formData.append("file", file);

//       const res = await fetch("http://localhost:8000/convert/", {
//         method: "POST",
//         body: formData,
//       });

//       if (!res.ok) throw new Error("Conversion failed");

//       // Handle JSON response (S3 or local)
//       const data = await res.json();
//       if (!data.download_url) throw new Error("No download URL returned");
//       setDownloadUrl(data.download_url);

//       setStatus("done");
//     } catch (err: any) {
//       console.error(err);
//       setErrorMessage(err.message || "Something went wrong");
//       setStatus("error");
//     }
//   };

//   return (
//     <div className="flex items-center justify-center min-h-screen bg-gray-50 px-4">
//       <div className="w-full max-w-md">
//         {/* Step 1: File selection */}
//         {status === "idle" && (
//           <ChooseFileStep onSelect={handleFileSelect} inputRef={fileInputRef} />
//         )}

//         {/* Step 2: File selected */}
//         {status === "selected" && file && (
//           <div className="bg-white shadow-lg rounded-2xl p-6">
//             <p className="text-lg font-semibold truncate">{file.name}</p>
//             <p className="text-sm text-gray-500 mb-4">
//               {(file.size / 1024 / 1024).toFixed(2)} MB
//             </p>
//             <div className="flex justify-between">
//               <button
//                 onClick={reset}
//                 className="px-4 py-2 rounded-lg border text-gray-600 hover:bg-gray-50"
//               >
//                 Cancel
//               </button>
//               <button
//                 onClick={handleConvert}
//                 className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700"
//               >
//                 Convert
//               </button>
//             </div>
//           </div>
//         )}

//         {/* Step 3: Uploading progress */}
//         {status === "uploading" && file && (
//           <div className="bg-white shadow-lg rounded-2xl p-6 text-center">
//             <p className="text-lg font-semibold">{file.name}</p>
//             <p className="text-sm text-gray-500 mb-4">
//               {(file.size / 1024 / 1024).toFixed(2)} MB
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

//         {/* Step 4: Converting */}
//         {status === "converting" && file && (
//           <div className="bg-white shadow-lg rounded-2xl p-6 text-center">
//             <p className="text-lg font-semibold">{file.name}</p>
//             <p className="text-sm text-gray-500 mb-4">
//               {(file.size / 1024 / 1024).toFixed(2)} MB
//             </p>
//             <div className="flex flex-col items-center space-y-3">
//               <div className="w-8 h-8 text-blue-600 animate-spin">
//                 <LoadingIndicatorIcon />
//               </div>
//               <span className="text-sm">Converting your file...</span>
//             </div>
//           </div>
//         )}

//         {/* Step 5: Done */}
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
//                 onClick={reset}
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

//               {/* <a
//                 href={downloadUrl}
//                 target="_blank"
//                 rel="noopener noreferrer"
//                 className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700"
//               >
//                 Download file
//               </a> */}
//             </div>
//           </div>
//         )}

//         {/* Step 6: Error */}
//         {status === "error" && errorMessage && (
//           <div className="bg-red-50 border border-red-200 rounded-2xl p-6 text-center">
//             <p className="text-red-600 font-semibold mb-4">{errorMessage}</p>
//             <button
//               onClick={reset}
//               className="px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700"
//             >
//               Try Again
//             </button>
//           </div>
//         )}
//       </div>
//     </div>
//   );
// }

// "use client";

// import React, { useRef } from "react";
// import { ChooseFileStep } from "@/components/ChooseFileStep";
// import { LoadingIndicatorIcon } from "@/icons/LoadingIndicatorIcon";
// import { PdfIcon } from "@/icons/PdfIcon";
// import { useConversionStore } from "@/stores/conversionStore";

// /**
//  * PowerPointToPdfConverter
//  *
//  * Handles file selection, fake upload progress, conversion spinner,
//  * download link, and error handling.
//  */
// export default function PowerPointToPdfConverter() {
//   const fileInputRef = useRef<HTMLInputElement | null>(null);

//   const {
//     status,
//     file,
//     progress,
//     downloadUrl,
//     errorMessage,
//     setStatus,
//     setFile,
//     setProgress,
//     setDownloadUrl,
//     setErrorMessage,
//     reset,
//   } = useConversionStore();

//   /** Handle file selection from ChooseFileStep */
//   const handleFileSelect = (selectedFile: File | null) => {
//     if (selectedFile) {
//       setFile(selectedFile);
//       setStatus("selected");
//       setProgress(0);
//       setDownloadUrl(null);
//       setErrorMessage(null);
//     }
//   };

//   /** Fake upload progress to simulate uploading */
//   const simulateUpload = (): Promise<void> => {
//     return new Promise((resolve) => {
//       setStatus("uploading");
//       let percent = 0;
//       const interval = setInterval(() => {
//         percent += Math.floor(Math.random() * 10) + 5; // Increment randomly 5-15%
//         if (percent >= 100) {
//           percent = 100;
//           setProgress(percent);
//           clearInterval(interval);
//           resolve();
//         } else {
//           setProgress(percent);
//         }
//       }, 100);
//     });
//   };

//   /** Handle the full conversion process */
//   const handleConvert = async () => {
//     if (!file) return;

//     try {
//       // Step 1: Fake upload
//       await simulateUpload();

//       // Step 2: Call backend /convert/ endpoint
//       setStatus("converting");

//       const formData = new FormData();
//       formData.append("file", file);

//       const res = await fetch("http://localhost:8000/convert/", {
//         method: "POST",
//         body: formData,
//       });

//       if (!res.ok) throw new Error("Conversion failed");

//       // Handle JSON or FileResponse
//       const contentType = res.headers.get("content-type") || "";
//       if (contentType.includes("application/json")) {
//         const data = await res.json();
//         setDownloadUrl(data.download_url);
//       } else {
//         const blob = await res.blob();
//         setDownloadUrl(URL.createObjectURL(blob));
//       }

//       setStatus("done");
//     } catch (err: any) {
//       console.error(err);
//       setErrorMessage(err.message || "Something went wrong");
//       setStatus("error");
//     }
//   };

//   return (
//     <div className="flex items-center justify-center min-h-screen bg-gray-50 px-4">
//       <div className="w-full max-w-md">
//         {/* Step 1: File selection */}
//         {status === "idle" && (
//           <ChooseFileStep onSelect={handleFileSelect} inputRef={fileInputRef} />
//         )}

//         {/* Step 2: File selected, confirm conversion */}
//         {status === "selected" && file && (
//           <div className="bg-white shadow-lg rounded-2xl p-6">
//             <p className="text-lg font-semibold truncate">{file.name}</p>
//             <p className="text-sm text-gray-500 mb-4">
//               {(file.size / 1024 / 1024).toFixed(2)} MB
//             </p>
//             <div className="flex justify-between">
//               <button
//                 onClick={reset}
//                 className="px-4 py-2 rounded-lg border text-gray-600 hover:bg-gray-50"
//               >
//                 Cancel
//               </button>
//               <button
//                 onClick={handleConvert}
//                 className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700"
//               >
//                 Convert
//               </button>
//             </div>
//           </div>
//         )}

//         {/* Step 3: Uploading progress */}
//         {status === "uploading" && (
//           <div className="bg-white shadow-lg rounded-2xl p-6 text-center">
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

//         {/* Step 4: Converting spinner */}
//         {status === "converting" && (
//           <div className="bg-white shadow-lg rounded-2xl p-6 text-center">
//             <p className="text-lg font-semibold">{file?.name}</p>
//             <p className="text-sm text-gray-500 mb-4">
//               {(file?.size ?? 0 / 1024 / 1024).toFixed(2)} MB
//             </p>
//             <div className="flex flex-col items-center space-y-3">
//               <div className="w-8 h-8 text-blue-600 animate-spin">
//                 <LoadingIndicatorIcon />
//               </div>
//               <span className="text-sm">Converting your file...</span>
//             </div>
//           </div>
//         )}

//         {/* Step 5: Done */}
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
//                 onClick={reset}
//                 className="px-4 py-2 rounded-lg border text-gray-600 hover:bg-gray-50"
//               >
//                 Convert another
//               </button>
//               <a
//                 href={downloadUrl}
//                 target="_blank"
//                 rel="noopener noreferrer"
//                 className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700"
//               >
//                 Download file
//               </a>
//             </div>
//           </div>
//         )}

//         {/* Step 6: Error */}
//         {status === "error" && errorMessage && (
//           <div className="bg-red-50 border border-red-200 rounded-2xl p-6 text-center">
//             <p className="text-red-600 font-semibold mb-4">{errorMessage}</p>
//             <button
//               onClick={reset}
//               className="px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700"
//             >
//               Try Again
//             </button>
//           </div>
//         )}
//       </div>
//     </div>
//   );
// }

// "use client";

// import React, { useState, useRef } from "react";
// import { ChooseFileStep } from "@/components/ChooseFileStep";
// import { LoadingIndicatorIcon } from "@/icons/LoadingIndicatorIcon";
// import { PdfIcon } from "@/icons/PdfIcon";

// /**
//  * Status type representing the different stages of the conversion
//  */
// type Status =
//   | "idle"
//   | "selected"
//   | "uploading"
//   | "converting"
//   | "done"
//   | "error";

// /**
//  * PowerPointToPdfConverter Component
//  *
//  * Handles the full workflow:
//  * 1. File selection
//  * 2. Fake upload progress bar
//  * 3. Conversion spinner
//  * 4. Download link
//  * 5. Error handling
//  */
// export default function PowerPointToPdfConverter() {
//   const [status, setStatus] = useState<Status>("idle"); // Current status
//   const [file, setFile] = useState<File | null>(null); // Selected file
//   const [progress, setProgress] = useState<number>(0); // Upload progress
//   const [downloadUrl, setDownloadUrl] = useState<string | null>(null); // PDF download URL
//   const [errorMessage, setErrorMessage] = useState<string | null>(null); // Error messages

//   const fileInputRef = useRef<HTMLInputElement | null>(null);

//   /**
//    * Handles file selection from ChooseFileStep
//    */
//   const handleFileSelect = (selectedFile: File | null) => {
//     if (selectedFile) {
//       setFile(selectedFile);
//       setStatus("selected");
//       setProgress(0);
//       setDownloadUrl(null);
//       setErrorMessage(null);
//     }
//   };

//   /**
//    * Resets the component to its initial state
//    */
//   const reset = () => {
//     setFile(null);
//     setStatus("idle");
//     setProgress(0);
//     setDownloadUrl(null);
//     setErrorMessage(null);
//   };

//   /**
//    * Fake upload progress
//    * Simulates uploading the file from 0% → 100%
//    */
//   const fakeUpload = (): Promise<void> => {
//     return new Promise((resolve) => {
//       setStatus("uploading");
//       let percent = 0;
//       const interval = setInterval(() => {
//         percent += Math.floor(Math.random() * 10) + 5; // random increment for realism
//         if (percent >= 100) {
//           percent = 100;
//           setProgress(percent);
//           clearInterval(interval);
//           resolve();
//         } else {
//           setProgress(percent);
//         }
//       }, 100); // every 100ms
//     });
//   };

//   /**
//    * Upload file to backend (/upload/) and return file ID
//    */
//   const uploadFile = async (): Promise<string> => {
//     if (!file) throw new Error("No file selected");

//     const formData = new FormData();
//     formData.append("file", file);

//     const response = await fetch("http://localhost:8000/upload/", {
//       method: "POST",
//       body: formData,
//     });

//     if (!response.ok) throw new Error("Upload failed");

//     const data = await response.json();
//     return data.file_id; // backend returns file_id
//   };

//   /**
//    * Convert file by calling backend (/convert/) with file ID
//    */
//   const convertFile = async (fileId: string) => {
//     setStatus("converting"); // show conversion spinner
//     try {
//       const response = await fetch(`http://localhost:8000/convert/`, {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({ file_id: fileId }),
//       });

//       if (!response.ok) throw new Error("Conversion failed");

//       const contentType = response.headers.get("content-type") || "";

//       if (contentType.includes("application/json")) {
//         const data = await response.json();
//         setDownloadUrl(data.download_url);
//       } else {
//         // local FileResponse fallback
//         const blob = await response.blob();
//         const url = URL.createObjectURL(blob);
//         setDownloadUrl(url);
//       }

//       setStatus("done");
//     } catch (error) {
//       console.error(error);
//       setErrorMessage("Conversion failed. Please try again.");
//       setStatus("error");
//     }
//   };

//   /**
//    * Handles the full upload + conversion workflow
//    */
//   const handleConvert = async () => {
//     try {
//       await fakeUpload(); // simulate upload progress
//       const fileId = await uploadFile(); // upload file to backend
//       await convertFile(fileId); // perform conversion
//     } catch (error) {
//       console.error(error);
//       setErrorMessage("Upload failed. Please try again.");
//       setStatus("error");
//     }
//   };

//   return (
//     <div className="flex items-center justify-center h-screen bg-gray-50 px-4">
//       <div className="w-full max-w-md">
//         {/* Step 1: File selection */}
//         {status === "idle" && (
//           <ChooseFileStep onSelect={handleFileSelect} inputRef={fileInputRef} />
//         )}

//         {/* Step 2: File selected → confirm conversion */}
//         {status === "selected" && file && (
//           <div className="bg-white shadow-lg rounded-2xl p-6">
//             <p className="text-lg font-semibold truncate">{file.name}</p>
//             <p className="text-sm text-gray-500 mb-4">
//               {(file.size / 1024 / 1024).toFixed(2)} MB
//             </p>

//             <div className="flex justify-between">
//               <button
//                 onClick={reset}
//                 className="px-4 py-2 rounded-lg border text-gray-600 hover:bg-gray-50"
//               >
//                 Cancel
//               </button>
//               <button
//                 onClick={handleConvert}
//                 className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700"
//               >
//                 Convert
//               </button>
//             </div>
//           </div>
//         )}

//         {/* Step 3: Fake Uploading */}
//         {status === "uploading" && (
//           <div className="bg-white shadow-lg rounded-2xl p-6 text-center">
//             <p className="text-lg font-semibold">{file?.name}</p>
//             <p className="text-sm text-gray-500 mb-4">
//               {(file?.size ?? 0 / 1024 / 1024).toFixed(2)} MB
//             </p>

//             <p className="text-sm font-medium mb-2">Uploading...</p>
//             <div className="w-full bg-gray-200 rounded-full h-2">
//               <div
//                 className="bg-blue-600 h-2 rounded-full transition-all"
//                 style={{ width: `${progress}%` }}
//               />
//             </div>
//           </div>
//         )}

//         {/* Step 4: Converting */}
//         {status === "converting" && (
//           <div className="bg-white shadow-lg rounded-2xl p-6 text-center">
//             <p className="text-lg font-semibold">{file?.name}</p>
//             <p className="text-sm text-gray-500 mb-4">
//               {(file?.size ?? 0 / 1024 / 1024).toFixed(2)} MB
//             </p>

//             <div className="flex flex-col items-center space-y-3">
//               <div className="w-8 h-8 text-blue-600 animate-spin">
//                 <LoadingIndicatorIcon />
//               </div>
//               <span className="text-sm">Converting your file...</span>
//             </div>
//           </div>
//         )}

//         {/* Step 5: Done */}
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
//                 onClick={reset}
//                 className="px-4 py-2 rounded-lg border text-gray-600 hover:bg-gray-50"
//               >
//                 Convert another
//               </button>
//               <a
//                 href={downloadUrl}
//                 target="_blank"
//                 rel="noopener noreferrer"
//                 className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700"
//               >
//                 Download file
//               </a>
//             </div>
//           </div>
//         )}

//         {/* Step 6: Error */}
//         {status === "error" && errorMessage && (
//           <div className="bg-red-50 border border-red-200 rounded-2xl p-6 text-center">
//             <p className="text-red-600 font-semibold mb-4">{errorMessage}</p>
//             <button
//               onClick={reset}
//               className="px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700"
//             >
//               Try Again
//             </button>
//           </div>
//         )}
//       </div>
//     </div>
//   );
// }

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
