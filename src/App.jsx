import { useState } from 'react';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import MainContent from './components/MainContent';
import LoginDialog from './components/LoginDialog';
import TwoFactorDialog from './components/TwoFactorDialog';
import FolderChatDialog from './components/FolderChatDialog';

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showTwoFactor, setShowTwoFactor] = useState(false);
  const [accessToken, setAccessToken] = useState(null);
  const [showFolderChat, setShowFolderChat] = useState(false);
  const [currentFolder, setCurrentFolder] = useState(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handleLoginSuccess = (token) => {
    setAccessToken(token);
    setIsLoggedIn(true);
    setShowTwoFactor(false);
  };

  const handleTwoFactorRequired = () => {
    setShowTwoFactor(true);
  };

  const handleFolderChatClick = () => {
    if (currentFolder) {
      setShowFolderChat(true);
    }
  };

  const handleFolderChange = (folder) => {
    setCurrentFolder(folder);
  };

  const handleFileUploaded = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  return (
    <div className="h-screen flex flex-col">
      {!isLoggedIn ? (
        <>
          {!showTwoFactor ? (
            <LoginDialog 
              onLoginSuccess={handleLoginSuccess}
              onTwoFactorRequired={handleTwoFactorRequired}
            />
          ) : (
            <TwoFactorDialog onVerifySuccess={handleLoginSuccess} />
          )}
        </>
      ) : (
        <>
          <Header />
          <div className="flex flex-1">
            <Sidebar 
              onFolderChatClick={handleFolderChatClick}
              currentFolder={currentFolder}
              accessToken={accessToken}
              onFileUploaded={handleFileUploaded}
            />
            <MainContent 
              accessToken={accessToken} 
              onFolderChange={handleFolderChange}
              refreshTrigger={refreshTrigger}
            />
          </div>
          {showFolderChat && currentFolder && (
            <FolderChatDialog
              folder={currentFolder}
              accessToken={accessToken}
              onClose={() => setShowFolderChat(false)}
            />
          )}
        </>
      )}
    </div>
  );
}

export default App;
