import { useState, useEffect, useRef } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faTimes,
  faExpand,
  faCompress,
  faDownload,
  faExclamationTriangle,
  faRedoAlt,
  faSpinner,
  faVideo,
  faRobot
} from '@fortawesome/free-solid-svg-icons';
import AIChatDialog from './AIChatDialog';
import PDFViewer from './PDFViewer';
import { fetchWithAuth } from '../utils/api';

const FileViewer = ({ file, accessToken, onClose }) => {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [mediaUrl, setMediaUrl] = useState(null);
  const [error, setError] = useState(null);
  const [objectUrl, setObjectUrl] = useState(null);
  const viewerRef = useRef(null);
  const mediaRef = useRef(null);
  const [isAIChatOpen, setIsAIChatOpen] = useState(false);
  const [isReadyForAiChat, setIsReadyForAiChat] = useState(false);
  const [loadingAiCheck, setLoadingAiCheck] = useState(true);

  const extension = file.name.split('.').pop().toLowerCase();
  const isImage = /\.(jpg|jpeg|png|gif|heic|webp)$/i.test(file.name);
  const isVideo = /\.(mp4|webm|mov|avi)$/i.test(file.name);
  const isAudio = /\.(mp3|wav|ogg)$/i.test(file.name);
  const isPdf = /\.pdf$/i.test(file.name);

  const API_BASE = import.meta.env.PROD ? 'https://gcp.olympus.io' : '/olympus-api';
  const fileUrl = `/api/v1/file/download?fileId=${file.id}`;

  useEffect(() => {
    const fetchFile = async () => {
      try {
        const response = await fetch(`${API_BASE}${fileUrl}`, {
          headers: {
            "Authorization": `Bearer ${accessToken}`,
          }
        });

        if (!response.ok) {
          throw new Error(`API call failed: ${response.status}`);
        }

        const blob = await response.blob();
        const url = URL.createObjectURL(blob);
        setMediaUrl(url);
        setObjectUrl(url);
        setIsLoading(false);
      } catch (err) {
        console.error('File fetch error:', err);
        setError(err.message);
        setIsLoading(false);
      }
    };

    fetchFile();

    return () => {
      if (objectUrl) {
        URL.revokeObjectURL(objectUrl);
      }
    };
  }, [fileUrl, accessToken]);

  useEffect(() => {
    const checkAiChatReadiness = async () => {
      try {
        const response = await fetch(`${API_BASE}/api/v1/genai/check-file-ready-for-chat?fileId=${file.id}`, {
          headers: {
            "Authorization": `Bearer ${accessToken}`,
          }
        });
        
        if (!response.ok) {
          throw new Error(`API call failed: ${response.status}`);
        }

        const data = await response.json();
        if (data.success && data.data?.jobRecords?.length > 0) {
          setIsReadyForAiChat(data.data.jobRecords[0].isReadyForAiChat);
        }
      } catch (error) {
        console.error('Error checking AI chat readiness:', error);
      } finally {
        setLoadingAiCheck(false);
      }
    };

    checkAiChatReadiness();
  }, [file.id, accessToken]);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      viewerRef.current.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  const handleDownload = async () => {
    try {
      const response = await fetch(`${API_BASE}${fileUrl}`, {
        headers: {
          "Authorization": `Bearer ${accessToken}`,
        }
      });

      if (!response.ok) {
        throw new Error(`Download failed: ${response.status}`);
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = file.name;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      console.error('Download failed:', err);
    }
  };

  const handleAIChatOpen = () => {
    setIsAIChatOpen(true);
  };

  const handleAIChatClose = () => {
    setIsAIChatOpen(false);
  };

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="text-white flex items-center">
          <FontAwesomeIcon icon={faSpinner} spin className="mr-2" />
          Loading...
        </div>
      );
    }

    if (error) {
      return (
        <div className="text-red-500 flex items-center">
          <FontAwesomeIcon icon={faExclamationTriangle} className="mr-2" />
          {error}
        </div>
      );
    }

    if (isPdf) {
      return <PDFViewer url={mediaUrl} />;
    }

    if (isImage) {
      return (
        <img
          src={mediaUrl}
          alt={file.name}
          className="max-w-full max-h-full object-contain"
        />
      );
    }

    if (isVideo) {
      return (
        <video
          ref={mediaRef}
          controls
          className="max-w-full max-h-full"
          src={mediaUrl}
        />
      );
    }

    if (isAudio) {
      return (
        <audio
          ref={mediaRef}
          controls
          className="w-full"
          src={mediaUrl}
        />
      );
    }

    return (
      <div className="text-white">
        Unsupported file type
      </div>
    );
  };

  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-75 flex items-center justify-center">
      <div
        ref={viewerRef}
        className={`relative bg-black ${
          isFullscreen ? 'w-screen h-screen' : 'w-11/12 h-5/6'
        } rounded-lg overflow-hidden flex flex-col`}
      >
        {/* Header */}
        <div className="flex justify-between items-center p-4 bg-gray-800 text-white">
          <h3 className="text-lg font-medium truncate flex-1">
            {file.name}
          </h3>
          <div className="flex items-center space-x-4 ml-4">
            {isReadyForAiChat && (
              <div className="flex items-center">
                <button
                  onClick={handleAIChatOpen}
                  className="text-white hover:text-gray-300 transition-colors flex items-center"
                  title="Open AI Chat"
                >
                  <span className="mr-2 text-sm">Chat with this file</span>
                  <FontAwesomeIcon icon={faRobot} size="lg" />
                </button>
              </div>
            )}
            {!isPdf && !isLoading && !error && (
              <button
                onClick={handleDownload}
                className="text-white hover:text-gray-300 transition-colors"
                title="Download file"
              >
                <FontAwesomeIcon icon={faDownload} />
              </button>
            )}
            <button
              onClick={toggleFullscreen}
              className="text-white hover:text-gray-300 transition-colors"
              title="Toggle fullscreen"
            >
              <FontAwesomeIcon icon={isFullscreen ? faCompress : faExpand} />
            </button>
            <button
              onClick={onClose}
              className="text-white hover:text-gray-300 transition-colors"
              title="Close"
            >
              <FontAwesomeIcon icon={faTimes} />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 flex items-center justify-center p-4 relative bg-gray-900 overflow-auto">
          {renderContent()}
        </div>
      </div>
      {isAIChatOpen && (
        <AIChatDialog
          file={file}
          accessToken={accessToken}
          onClose={handleAIChatClose}
        />
      )}
    </div>
  );
};

export default FileViewer;
