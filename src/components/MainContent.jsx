import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft, faFolder } from '@fortawesome/free-solid-svg-icons';
import FileCard from './FileCard';
import FileViewer from './FileViewer';

function MainContent({ accessToken, onFolderChange, refreshTrigger }) {
  const [currentFolder, setCurrentFolder] = useState(null);
  const [parentFolderStack, setParentFolderStack] = useState([]);
  const [files, setFiles] = useState([]);
  const [folders, setFolders] = useState([]);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedFile, setSelectedFile] = useState(null);

  const API_BASE = import.meta.env.PROD ? 'https://gcp.olympus.io' : '/olympus-api';

  useEffect(() => {
    if (currentFolder) {
      onFolderChange(currentFolder);
    }
  }, [currentFolder, onFolderChange]);

  useEffect(() => {
    if (accessToken) {
      fetchRootFolder();
    }
  }, [accessToken]);

  // Refresh content when refreshTrigger changes
  useEffect(() => {
    if (currentFolder) {
      fetchFolderContents(currentFolder.id);
    }
  }, [refreshTrigger]);

  const fetchRootFolder = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(
        `${API_BASE}/api/v1/share/listing/get-root-shared-directories?page=1&limit=10`,
        {
          headers: {
            "Authorization": `Bearer ${accessToken}`,
            "Content-Type": "application/json"
          }
        }
      );
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('Root folder response:', data);

      if (data.data?.directories?.length > 0) {
        const rootFolder = data.data.directories[0];
        console.log('Root folder:', rootFolder);
        setCurrentFolder(rootFolder);
        setParentFolderStack([rootFolder]);
        await fetchFolderContents(rootFolder.id);
      } else {
        throw new Error('No root directory found in response');
      }
    } catch (error) {
      console.error('Failed to fetch root folder:', error);
      setError('Failed to load root folder. ' + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchFolderContents = async (folderId) => {
    setIsLoading(true);
    try {
      const [foldersResponse, filesResponse] = await Promise.all([
        fetch(`${API_BASE}/api/v1/directory/get-child-directories?directoryId=${folderId}`, {
          headers: {
            "Authorization": `Bearer ${accessToken}`,
            "Content-Type": "application/json"
          }
        }),
        fetch(`${API_BASE}/api/v1/directory/get-files?directoryId=${folderId}`, {
          headers: {
            "Authorization": `Bearer ${accessToken}`,
            "Content-Type": "application/json"
          }
        })
      ]);

      if (!foldersResponse.ok || !filesResponse.ok) {
        throw new Error('Failed to fetch folder contents');
      }

      const foldersData = await foldersResponse.json();
      const filesData = await filesResponse.json();

      console.log('Folders data:', foldersData);
      console.log('Files data:', filesData);

      setFolders(foldersData.data?.directories || []);
      setFiles(filesData.data?.files || []);
    } catch (error) {
      console.error('Failed to fetch folder contents:', error);
      setError('Failed to load folder contents');
    } finally {
      setIsLoading(false);
    }
  };

  const handleFolderClick = async (folder) => {
    setCurrentFolder(folder);
    setParentFolderStack(prev => [...prev, folder]);
    await fetchFolderContents(folder.id);
  };

  const handleBack = async () => {
    if (parentFolderStack.length > 1) {
      const newStack = [...parentFolderStack];
      newStack.pop(); // Remove current folder
      const parentFolder = newStack[newStack.length - 1];
      setParentFolderStack(newStack);
      setCurrentFolder(parentFolder);
      await fetchFolderContents(parentFolder.id);
    }
  };

  const handleFileView = (file) => {
    console.log('Opening file:', file);
    setSelectedFile(file);
  };

  if (error) {
    return (
      <div className="flex-1 p-5">
        <div className="text-red-500">{error}</div>
        <button 
          onClick={fetchRootFolder}
          className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="flex-1 p-5">
      <div className="flex items-center mb-5">
        {parentFolderStack.length > 1 && (
          <FontAwesomeIcon 
            icon={faArrowLeft} 
            className="mr-4 cursor-pointer text-gray-600"
            onClick={handleBack}
          />
        )}
        <div className="text-sm text-gray-600">
          {parentFolderStack.map((folder, index) => (
            <span key={folder.id}>
              {index > 0 && <span className="mx-2">›</span>}
              <span 
                className={`${
                  index === parentFolderStack.length - 1 
                    ? 'font-medium' 
                    : 'cursor-pointer hover:underline'
                }`}
                onClick={() => {
                  if (index < parentFolderStack.length - 1) {
                    const newStack = parentFolderStack.slice(0, index + 1);
                    setParentFolderStack(newStack);
                    setCurrentFolder(newStack[newStack.length - 1]);
                    fetchFolderContents(newStack[newStack.length - 1].id);
                  }
                }}
              >
                {folder.name}
              </span>
            </span>
          ))}
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-10">
          <div className="text-gray-500">Loading contents...</div>
        </div>
      ) : (
        <div className="grid grid-cols-fill-120 gap-5">
          {folders.map(folder => (
            <div 
              key={folder.id} 
              className="group relative bg-white p-5 rounded-lg shadow-sm cursor-pointer hover:shadow-md transition-all duration-200 hover:-translate-y-1"
              onClick={() => handleFolderClick(folder)}
            >
              <FontAwesomeIcon icon={faFolder} className="text-4xl text-blue-400 mb-2" />
              <div className="text-sm truncate">{folder.name}</div>
              
              <div className="invisible group-hover:visible opacity-0 group-hover:opacity-100 transition-opacity duration-200 absolute z-10 bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-800 text-white text-xs rounded whitespace-nowrap">
                <div className="font-medium">{folder.name}</div>
                <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-1 w-2 h-2 bg-gray-800 rotate-45"></div>
              </div>
            </div>
          ))}
          
          {files.map(file => (
            <FileCard 
              key={file.id}
              file={file}
              onClick={() => console.log('File double-clicked:', file)}
              onView={handleFileView}
              accessToken={accessToken}
            />
          ))}

          {!isLoading && folders.length === 0 && files.length === 0 && (
            <div className="col-span-full text-center text-gray-500 py-10">
              This folder is empty
            </div>
          )}
        </div>
      )}

      {selectedFile && (
        <FileViewer
          file={selectedFile}
          accessToken={accessToken}
          onClose={() => setSelectedFile(null)}
        />
      )}
    </div>
  );
}

export default MainContent;
