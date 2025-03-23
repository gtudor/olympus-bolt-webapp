import { useState, useRef } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faTimes, 
  faCloudUpload, 
  faSpinner,
  faCheckCircle,
  faExclamationCircle
} from '@fortawesome/free-solid-svg-icons';

function FileUploadDialog({ onClose, currentFolder, accessToken }) {
  const [isDragging, setIsDragging] = useState(false);
  const [uploadStatus, setUploadStatus] = useState('idle'); // idle, uploading, success, error
  const [uploadProgress, setUploadProgress] = useState(0);
  const [errorMessage, setErrorMessage] = useState('');
  const fileInputRef = useRef(null);

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFileUpload(files[0]);
    }
  };

  const handleFileSelect = (e) => {
    const files = e.target.files;
    if (files.length > 0) {
      handleFileUpload(files[0]);
    }
  };

  const handleFileUpload = async (file) => {
    setUploadStatus('uploading');
    setUploadProgress(0);
    setErrorMessage('');

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch(`/olympus-api/api/v1/file/upload?directoryId=${currentFolder.id}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
        body: formData
      });

      if (!response.ok) {
        throw new Error(`Upload failed: ${response.statusText}`);
      }

      const data = await response.json();
      if (data.success) {
        setUploadStatus('success');
        setTimeout(() => {
          onClose(true); // Pass true to indicate successful upload
        }, 1500);
      } else {
        throw new Error(data.message || 'Upload failed');
      }
    } catch (error) {
      console.error('Upload error:', error);
      setErrorMessage(error.message || 'Failed to upload file');
      setUploadStatus('error');
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-75 flex items-center justify-center">
      <div className="bg-white rounded-lg shadow-lg w-96">
        {/* Header */}
        <div className="flex justify-between items-center p-4 border-b">
          <h3 className="text-lg font-medium">Upload File</h3>
          <button 
            onClick={() => onClose(false)}
            className="text-gray-400 hover:text-gray-500 transition-colors"
          >
            <FontAwesomeIcon icon={faTimes} />
          </button>
        </div>

        {/* Upload Area */}
        <div 
          className={`p-8 ${isDragging ? 'bg-blue-50' : 'bg-gray-50'}`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <div 
            className={`border-2 border-dashed rounded-lg p-6 text-center
              ${isDragging ? 'border-blue-500 bg-blue-50' : 'border-gray-300'}
              ${uploadStatus === 'uploading' ? 'border-blue-500 bg-blue-50' : ''}
              ${uploadStatus === 'success' ? 'border-green-500 bg-green-50' : ''}
              ${uploadStatus === 'error' ? 'border-red-500 bg-red-50' : ''}
            `}
          >
            {uploadStatus === 'idle' && (
              <>
                <FontAwesomeIcon 
                  icon={faCloudUpload} 
                  className="text-4xl text-gray-400 mb-4" 
                />
                <div className="text-sm text-gray-600 mb-2">
                  Drag and drop your file here, or
                </div>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="text-blue-500 hover:text-blue-600 font-medium"
                >
                  browse to choose a file
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  className="hidden"
                  onChange={handleFileSelect}
                />
              </>
            )}

            {uploadStatus === 'uploading' && (
              <div className="text-center">
                <FontAwesomeIcon 
                  icon={faSpinner} 
                  className="text-4xl text-blue-500 mb-4 animate-spin" 
                />
                <div className="text-sm text-gray-600">
                  Uploading file...
                </div>
              </div>
            )}

            {uploadStatus === 'success' && (
              <div className="text-center">
                <FontAwesomeIcon 
                  icon={faCheckCircle} 
                  className="text-4xl text-green-500 mb-4" 
                />
                <div className="text-sm text-gray-600">
                  File uploaded successfully!
                </div>
              </div>
            )}

            {uploadStatus === 'error' && (
              <div className="text-center">
                <FontAwesomeIcon 
                  icon={faExclamationCircle} 
                  className="text-4xl text-red-500 mb-4" 
                />
                <div className="text-sm text-red-600 mb-2">
                  {errorMessage}
                </div>
                <button
                  onClick={() => setUploadStatus('idle')}
                  className="text-blue-500 hover:text-blue-600 font-medium"
                >
                  Try again
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t flex justify-end">
          <button
            onClick={() => onClose(false)}
            className="px-4 py-2 text-gray-600 hover:text-gray-700"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

export default FileUploadDialog;
