import React, { useRef } from 'react';

interface FileDropzoneProps {
  onFileSelected: (file: File) => void;
  disabled?: boolean;
}

const FileDropzone: React.FC<FileDropzoneProps> = ({ onFileSelected, disabled }) => {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (disabled) return;
    const file = e.dataTransfer.files[0];
    if (file && file.name.endsWith('.pptx')) {
      onFileSelected(file);
    }
  };

  const handleClick = () => {
    if (!disabled && inputRef.current) {
      inputRef.current.click();
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.name.endsWith('.pptx')) {
      onFileSelected(file);
    }
  };

  return (
    <div
      className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors duration-200 ${disabled ? 'bg-gray-100 cursor-not-allowed' : 'hover:border-blue-500'}`}
      onDrop={handleDrop}
      onDragOver={e => e.preventDefault()}
      onClick={handleClick}
      aria-disabled={disabled}
    >
      <input
        ref={inputRef}
        type="file"
        accept=".pptx"
        style={{ display: 'none' }}
        onChange={handleChange}
        disabled={disabled}
      />
      <span className="block text-gray-700">Drag & drop your PowerPoint (.pptx) file here, or click to select</span>
    </div>
  );
};

export default FileDropzone;
