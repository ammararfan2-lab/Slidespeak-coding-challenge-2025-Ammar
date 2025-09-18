import React, { useRef } from 'react';

interface FileDropzoneProps {
  onFileSelected: (file: File) => void;
  disabled?: boolean;
}

// FileDropzone component for uploading a single .pptx file
// Handles drag-and-drop and click-to-select functionality
const FileDropzone: React.FC<FileDropzoneProps> = ({ onFileSelected, disabled }) => {
  const inputRef = useRef<HTMLInputElement>(null);

  // Handle file drop event
  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (disabled) return;
    const file = e.dataTransfer.files[0];
    if (file && file.name.endsWith('.pptx')) {
      onFileSelected(file);
    }
  };

  // Handle click to open file dialog
  const handleClick = () => {
    if (!disabled && inputRef.current) {
      inputRef.current.click();
    }
  };

  // Handle file selection from dialog
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.name.endsWith('.pptx')) {
      onFileSelected(file);
    }
  };

  // Renders the dropzone UI
  return (
    <div
      className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors duration-200 ${disabled ? 'bg-gray-100 cursor-not-allowed' : 'hover:border-blue-500'}`}
      onDrop={handleDrop}
      onDragOver={e => e.preventDefault()}
      onClick={handleClick}
      aria-disabled={disabled}
    >
      {/* Hidden file input for click-to-select */}
      <input
        ref={inputRef}
        type="file"
        accept=".pptx"
        style={{ display: 'none' }}
        onChange={handleChange}
        disabled={disabled}
      />
      {/* Dropzone instructions */}
      <span className="block text-gray-700">Drag & drop your PowerPoint (.pptx) file here, or click to select</span>
    </div>
  );
};

export default FileDropzone;
