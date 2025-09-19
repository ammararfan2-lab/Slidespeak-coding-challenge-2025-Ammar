"use client";

import { FC, MutableRefObject } from "react";
import { useDropzone } from "react-dropzone";
import UploadIcon from "@/icons/UploadIcon";

/**
 * Props for ChooseFileStep
 */
export type ChooseFileStepProps = {
  onSelect: (file: File | null) => void;
  inputRef?: MutableRefObject<HTMLInputElement | null>;
};

/**
 * ChooseFileStep
 *
 * Provides a drag-and-drop zone and file picker button for PowerPoint files (.pptx)
 */
export const ChooseFileStep: FC<ChooseFileStepProps> = ({
  onSelect,
  inputRef,
}) => {
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: {
      "application/vnd.openxmlformats-officedocument.presentationml.presentation":
        [".pptx"],
    },
    multiple: false,
    onDrop: (acceptedFiles) => {
      const file =
        acceptedFiles && acceptedFiles.length > 0 ? acceptedFiles[0] : null;
      onSelect(file);
    },
  });

  return (
    <div
      {...getRootProps()}
      className={`
        group cursor-pointer rounded-2xl border-2 border-dashed px-6 py-16 shadow-md
        bg-white hover:border-blue-400 transition-colors mx-auto max-w-xs
        ${isDragActive ? "border-blue-600 bg-blue-50" : "border-gray-300"}
      `}
    >
      <div className="flex flex-col items-center text-center space-y-4">
        {/* Icon */}
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-blue-50">
          <div className="w-10 h-10 text-blue-600">
            <UploadIcon />
          </div>
        </div>

        {/* Instructions */}
        <p className="text-base font-medium text-gray-700">
          {isDragActive
            ? "Drop your PowerPoint file here..."
            : "Drag and drop a PowerPoint file to convert to PDF"}
        </p>
        <p className="text-sm text-gray-500">or click the button below</p>

        {/* Hidden input */}
        <input {...getInputProps()} ref={inputRef} />

        {/* CTA Button */}
        <button
          type="button"
          onClick={() => inputRef?.current?.click()}
          className="mt-2 px-6 py-2 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 transition-colors"
        >
          Choose file
        </button>
      </div>
    </div>
  );
};

export default ChooseFileStep;

// "use client";
// import { FC, MutableRefObject } from "react";
// import { useDropzone } from "react-dropzone";
// import UploadIcon from "@/icons/UploadIcon";

// /**
//  * Props for ChooseFileStep component
//  */
// export type ChooseFileStepProps = {
//   onSelect: (file: File | null) => void;
//   inputRef?: MutableRefObject<HTMLInputElement | null>;
// };

// /**
//  * ChooseFileStep
//  *
//  * Provides drag & drop + file picker UI for uploading PowerPoint files
//  */
// export const ChooseFileStep: FC<ChooseFileStepProps> = ({
//   onSelect,
//   inputRef,
// }) => {
//   const { getRootProps, getInputProps } = useDropzone({
//     accept: {
//       "application/vnd.openxmlformats-officedocument.presentationml.presentation":
//         [".pptx"],
//     },
//     multiple: false,
//     onDrop: (acceptedFiles) => {
//       const f = acceptedFiles && acceptedFiles.length ? acceptedFiles[0] : null;
//       onSelect(f);
//     },
//   });

//   return (
//     <div
//       className="group cursor-pointer rounded-2xl border border-dashed border-gray-300 bg-white px-6 py-16 shadow-md hover:border-blue-400 transition-colors mx-auto"
//       {...getRootProps()}
//     >
//       <div className="mx-auto max-w-xs text-center">
//         <div className="inline-flex items-center justify-center rounded-full bg-blue-50 w-20 h-20">
//           {/* Wrapped UploadIcon to apply styling externally */}
//           <div className="w-10 h-10 text-blue-600">
//             <UploadIcon />
//           </div>
//         </div>
//         <p className="text-base font-medium text-gray-700">
//           Drag and drop a PowerPoint file to convert to PDF.
//         </p>
//         {/* <p className="text-sm text-gray-500">or click below to browse</p> */}

//         {/* Hidden input */}
//         <input ref={inputRef} {...getInputProps()} />

//         {/* CTA button */}
//         <button
//           type="button"
//           className="rounded-lg bg-blue-600 px-4 py-2.5 text-sm text-white mt-4 hover:bg-blue-700 transition-colors"
//         >
//           Choose file
//         </button>
//       </div>
//     </div>
//   );
// };

// export default ChooseFileStep;
