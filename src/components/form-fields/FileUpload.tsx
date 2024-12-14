import React, { useRef, useState } from 'react';
import BaseField, { BaseFieldProps } from './BaseField';

interface FileUploadProps extends Omit<BaseFieldProps, 'children'> {
  accept?: string;
  maxSize?: number; // in bytes
  multiple?: boolean;
  onFileSelect?: (files: File[]) => void;
}

const FileUpload: React.FC<FileUploadProps> = ({
  accept,
  maxSize,
  multiple,
  onFileSelect,
  ...baseProps
}) => {
  const [dragActive, setDragActive] = useState(false);
  const [files, setFiles] = useState<File[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFiles(Array.from(e.dataTransfer.files));
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFiles(Array.from(e.target.files));
    }
  };

  const handleFiles = (newFiles: File[]) => {
    const validFiles = newFiles.filter(file => {
      if (maxSize && file.size > maxSize) return false;
      if (accept) {
        const acceptedTypes = accept.split(',').map(type => type.trim());
        return acceptedTypes.some(type => {
          if (type.startsWith('.')) {
            return file.name.toLowerCase().endsWith(type.toLowerCase());
          }
          return file.type.match(new RegExp(type.replace('*', '.*')));
        });
      }
      return true;
    });

    setFiles(validFiles);
    onFileSelect?.(validFiles);
  };

  return (
    <BaseField {...baseProps}>
      <div
        className={`
          relative border-2 border-dashed rounded-lg p-6 text-center
          ${dragActive ? 'border-blue-400 bg-blue-50' : 'border-gray-300'}
          ${baseProps.error ? 'border-red-300' : ''}
        `}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <input
          ref={inputRef}
          type="file"
          multiple={multiple}
          accept={accept}
          onChange={handleChange}
          className="hidden"
          disabled={baseProps.isPreview}
        />
        
        <div className="space-y-2">
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="text-blue-600 hover:text-blue-700"
            disabled={baseProps.isPreview}
          >
            Choose files
          </button>
          <p className="text-sm text-gray-500">
            or drag and drop here
          </p>
          {maxSize && (
            <p className="text-xs text-gray-400">
              Max file size: {(maxSize / (1024 * 1024)).toFixed(1)}MB
            </p>
          )}
        </div>

        {files.length > 0 && (
          <div className="mt-4 space-y-2">
            {files.map((file, index) => (
              <div
                key={index}
                className="flex items-center justify-between text-sm text-gray-600 bg-gray-50 p-2 rounded"
              >
                <span>{file.name}</span>
                <span>{(file.size / 1024).toFixed(1)}KB</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </BaseField>
  );
};

export default FileUpload;
