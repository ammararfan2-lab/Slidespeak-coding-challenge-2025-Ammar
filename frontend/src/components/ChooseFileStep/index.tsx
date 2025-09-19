"use client";

import type { FC, MutableRefObject } from "react";
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
    <div className="flex items-center justify-center min-h-screen bg-gray-50 px-4">
      <div className="w-full max-w-sm">
        <div
          {...getRootProps()}
          className={`
            group cursor-pointer rounded-xl border-2 border-dashed px-8 py-12 
            bg-white hover:border-blue-400 transition-colors shadow-sm
            ${isDragActive ? "border-blue-600 bg-blue-50" : "border-gray-300"}
          `}
        >
          <div className="flex flex-col items-center text-center space-y-4">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-gray-50">
              <div className="w-5 h-5 text-gray-400">
                <UploadIcon />
              </div>
            </div>

            <div className="space-y-1">
              <p className="text-xs text-gray-600">
                {isDragActive
                  ? "Drop your PowerPoint file here..."
                  : "Drag and drop a PowerPoint file to convert to PDF."}
              </p>
            </div>

            {/* Hidden input */}
            <input {...getInputProps()} ref={inputRef} />

            {/* <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                inputRef?.current?.click();
              }}
              className="mt-2 px-4 py-2 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 transition-colors"
            >
              Choose file
            </button> */}

            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                inputRef?.current?.click();
              }}
              className="mt-2 px-4 py-2 rounded-lg bg-blue-50 text-blue-700 text-sm font-medium hover:bg-blue-100 transition-colors"
            >
              Choose file
            </button>
          </div>
        </div>
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
//  * Props for ChooseFileStep
//  */
// export type ChooseFileStepProps = {
//   onSelect: (file: File | null) => void;
//   inputRef?: MutableRefObject<HTMLInputElement | null>;
// };

// /**
//  * ChooseFileStep
//  *
//  * Provides a drag-and-drop zone and file picker button for PowerPoint files (.pptx)
//  */
// export const ChooseFileStep: FC<ChooseFileStepProps> = ({
//   onSelect,
//   inputRef,
// }) => {
//   const { getRootProps, getInputProps, isDragActive } = useDropzone({
//     accept: {
//       "application/vnd.openxmlformats-officedocument.presentationml.presentation":
//         [".pptx"],
//     },
//     multiple: false,
//     onDrop: (acceptedFiles) => {
//       const file =
//         acceptedFiles && acceptedFiles.length > 0 ? acceptedFiles[0] : null;
//       onSelect(file);
//     },
//   });

//   return (
//     <div className="flex items-center justify-center min-h-screen bg-gray-50 px-4">
//       <div className="w-full max-w-sm">
//         <div
//           {...getRootProps()}
//           className={`
//             group cursor-pointer rounded-2xl border-2 border-dashed px-6 py-16 shadow-md
//             bg-white hover:border-blue-400 transition-colors mx-auto max-w-xs
//             ${isDragActive ? "border-blue-600 bg-blue-50" : "border-gray-300"}
//           `}
//         >
//           <div className="flex flex-col items-center text-center space-y-4">
//             {/* Icon */}
//             <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-blue-50">
//               <div className="w-10 h-10 text-blue-600">
//                 <UploadIcon />
//               </div>
//             </div>

//             {/* Instructions */}
//             <p className="text-base font-medium text-gray-700">
//               {isDragActive
//                 ? "Drop your PowerPoint file here..."
//                 : "Drag and drop a PowerPoint file to convert to PDF"}
//             </p>
//             <p className="text-sm text-gray-500">or click the button below</p>

//             {/* Hidden input */}
//             <input {...getInputProps()} ref={inputRef} />

//             {/* CTA Button */}
//             <button
//               type="button"
//               onClick={() => inputRef?.current?.click()}
//               className="mt-2 px-6 py-2 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 transition-colors"
//             >
//               Choose file
//             </button>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default ChooseFileStep;
