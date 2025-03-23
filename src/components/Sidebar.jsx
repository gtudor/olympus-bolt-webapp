import { useState, useRef, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faPlus,
  faHdd,
  faRobot,
  faFolderOpen,
  faFolder,
  faUpload
} from '@fortawesome/free-solid-svg-icons';
import FileUploadDialog from './FileUploadDialog';

function Sidebar({ onFolderChatClick, currentFolder, accessToken, onFileUploaded }) {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [showUploadDialog, setShowUploadDialog] = useState(false);
  const dropdownRef = useRef(null);

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  const handleNewFolder = () => {
    console.log('New Folder clicked');
    setIsDropdownOpen(false);
  };

  const handleFileUpload = () => {
    setShowUploadDialog(true);
    setIsDropdownOpen(false);
  };

  const handleUploadComplete = (success) => {
    setShowUploadDialog(false);
    if (success && onFileUploaded) {
      onFileUploaded();
    }
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <div className="w-60 p-5 border-r border-gray-200">
      <div ref={dropdownRef} className="relative">
        <button
          onClick={toggleDropdown}
          className="bg-white text-gray-700 px-5 py-2.5 rounded-full shadow mb-5 w-full flex items-center"
        >
          <FontAwesomeIcon icon={faPlus} className="mr-4 text-lg" />
          <span>New</span>
        </button>
        {isDropdownOpen && (
          <div className="absolute left-0 mt-1 w-48 bg-white rounded-md shadow-lg z-10">
            <button
              onClick={handleNewFolder}
              className="block w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100 flex items-center"
            >
              <FontAwesomeIcon icon={faFolder} className="mr-2" />
              New Folder
            </button>
            <button
              onClick={handleFileUpload}
              className="block w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100 flex items-center"
            >
              <FontAwesomeIcon icon={faUpload} className="mr-2" />
              File Upload
            </button>
          </div>
        )}
      </div>
      <ul className="space-y-0.5">
        <li>
          <a
            href="#"
            className="flex items-center px-5 py-2.5 rounded-r-full hover:bg-blue-50 text-gray-700 hover:text-blue-600"
          >
            <FontAwesomeIcon icon={faHdd} className="mr-5" />
            <span>My Drive</span>
          </a>
        </li>
        <li>
          <button
            onClick={onFolderChatClick}
            className="w-full flex items-center px-5 py-2.5 rounded-r-full hover:bg-blue-50 text-gray-700 hover:text-blue-600"
          >
            <FontAwesomeIcon icon={faFolderOpen} className="mr-5" />
            <span>Folder Chat</span>
            <FontAwesomeIcon icon={faRobot} className="ml-auto text-blue-500" />
          </button>
        </li>
      </ul>

      {showUploadDialog && (
        <FileUploadDialog
          onClose={handleUploadComplete}
          currentFolder={currentFolder}
          accessToken={accessToken}
        />
      )}
    </div>
  );
}

export default Sidebar;
