import { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import {
  DocumentIcon,
  XMarkIcon,
  ArrowUpTrayIcon,
} from '@heroicons/react/24/outline';

export default function FileUpload({ onFilesChange, maxFiles = 5 }) {
  const [files, setFiles] = useState([]);

  const onDrop = useCallback(
    (acceptedFiles) => {
      // Limit the number of files
      const newFiles = [...files];
      acceptedFiles.forEach((file) => {
        if (newFiles.length < maxFiles) {
          // Add preview URL for images
          if (file.type.startsWith('image/')) {
            Object.assign(file, {
              preview: URL.createObjectURL(file),
            });
          }
          newFiles.push(file);
        }
      });
      setFiles(newFiles);
      onFilesChange(newFiles);
    },
    [files, maxFiles, onFilesChange]
  );

  const removeFile = (index) => {
    const newFiles = [...files];
    // Revoke preview URL to avoid memory leaks
    if (newFiles[index].preview) {
      URL.revokeObjectURL(newFiles[index].preview);
    }
    newFiles.splice(index, 1);
    setFiles(newFiles);
    onFilesChange(newFiles);
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg', '.gif'],
      'application/pdf': ['.pdf'],
      'application/msword': ['.doc'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': [
        '.docx',
      ],
    },
  });

  return (
    <div className="space-y-4">
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
          isDragActive
            ? 'border-primary-500 bg-primary-50'
            : 'border-gray-300 hover:border-primary-400'
        }`}
      >
        <input {...getInputProps()} />
        <ArrowUpTrayIcon className="mx-auto h-12 w-12 text-gray-400" />
        <p className="mt-2 text-sm text-gray-600">
          {isDragActive
            ? 'Drop the files here...'
            : 'Drag and drop files here, or click to select files'}
        </p>
        <p className="mt-1 text-xs text-gray-500">
          Supports: Images, PDF, DOC, DOCX (Max {maxFiles} files)
        </p>
      </div>

      {/* File list */}
      {files.length > 0 && (
        <ul className="divide-y divide-gray-200 border rounded-lg">
          {files.map((file, index) => (
            <li
              key={index}
              className="flex items-center justify-between p-4 hover:bg-gray-50"
            >
              <div className="flex items-center space-x-4">
                {file.preview ? (
                  <img
                    src={file.preview}
                    alt="Preview"
                    className="h-10 w-10 object-cover rounded"
                  />
                ) : (
                  <DocumentIcon className="h-10 w-10 text-gray-400" />
                )}
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    {file.name}
                  </p>
                  <p className="text-sm text-gray-500">
                    {(file.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => removeFile(index)}
                className="text-gray-400 hover:text-gray-500"
              >
                <XMarkIcon className="h-5 w-5" />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
