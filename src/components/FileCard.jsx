import { useState, useEffect } from 'react';
    import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
    import { getFileIcon, getFileColor } from '../utils/fileIcons';
    import { faRobot } from '@fortawesome/free-solid-svg-icons';
    import { fetchWithAuth } from '../utils/api';

    function FileCard({ file, onClick, onView, accessToken }) {
      const [isReadyForAiChat, setIsReadyForAiChat] = useState(false);
      const [loadingAiCheck, setLoadingAiCheck] = useState(true);

      const formatFileSize = (bytes) => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
      };

      const formattedDate = new Date(file.updatedAt).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });

      const handleClick = (e) => {
        e.preventDefault();
        if (e.detail === 1) { // Single click
          onView(file);
        } else if (e.detail === 2) { // Double click
          onClick(file);
        }
      };

      useEffect(() => {
        const checkAiChatReadiness = async () => {
          setLoadingAiCheck(true);
          try {
            const response = await fetchWithAuth(`/api/v1/genai/check-file-ready-for-chat?fileId=${file.id}`, {
              headers: {
                "Authorization": `Bearer ${accessToken}`
              }
            });
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

        if (accessToken) {
          checkAiChatReadiness();
        }
      }, [file.id, accessToken]);

      return (
        <div 
          className="group relative bg-white p-5 rounded-lg shadow-sm cursor-pointer hover:shadow-md transition-all duration-200 hover:-translate-y-1"
          onClick={handleClick}
        >
          <div className="relative">
            <FontAwesomeIcon 
              icon={getFileIcon(file.name)} 
              className={`text-4xl mb-2 ${getFileColor(file.name)}`}
            />
            {isReadyForAiChat && (
              <FontAwesomeIcon
                icon={faRobot}
                className="absolute top-0 right-0 text-xl text-blue-500 transform translate-x-2 -translate-y-1"
              />
            )}
          </div>
          <div className="text-sm truncate">{file.name}</div>
          
          {/* Tooltip */}
          <div className="invisible group-hover:visible opacity-0 group-hover:opacity-100 transition-opacity duration-200 absolute z-10 bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-800 text-white text-xs rounded whitespace-nowrap">
            <div className="font-medium">{file.name}</div>
            <div className="text-gray-300">{formatFileSize(file.size)}</div>
            <div className="text-gray-300">Modified: {formattedDate}</div>
            <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-1 w-2 h-2 bg-gray-800 rotate-45"></div>
          </div>
        </div>
      );
    }

    export default FileCard;
