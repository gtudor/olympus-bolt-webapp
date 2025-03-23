import React, { useState, useEffect, useRef } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes, faPaperPlane, faSpinner, faDownload } from '@fortawesome/free-solid-svg-icons';
import { fetchWithAuth } from '../utils/api';
import Markdown from 'react-markdown';
import gfm from 'remark-gfm';

function FolderChatDialog({ folder, accessToken, onClose }) {
  // State declarations
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isThinking, setIsThinking] = useState(false);
  const [isLoadingHistory, setIsLoadingHistory] = useState(true);
  const [isLoadingModels, setIsLoadingModels] = useState(true);
  const [availableModels, setAvailableModels] = useState([]);
  const [selectedModel, setSelectedModel] = useState('');
  const [polling, setPolling] = useState(false);
  const [lastMessageId, setLastMessageId] = useState(null);
  const [retryCount, setRetryCount] = useState(0);
  const chatContainerRef = useRef(null);

  // Constants
  const maxRetries = 20;
  const pollingInterval = 3000;
  const timeout = 60000;

  // Handle Enter key press
  const handleKeyDown = (event) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      sendMessage();
    }
  };

  // Handle file downloads
  const handleFileDownload = async (file) => {
    try {
      const response = await fetch(`/olympus-api/api/v1/file/download?fileId=${file.id}`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        }
      });

      if (!response.ok) throw new Error('Download failed');

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = file.name;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading file:', error);
    }
  };

  // Send message
  const sendMessage = async () => {
    if (!input.trim() || !selectedModel || !folder?.id) return;

    const userMessage = {
      id: `temp-${Date.now()}`,
      text: input,
      sender: 'user',
      timestamp: Date.now()
    };
    
    setMessages(prevMessages => [...prevMessages, userMessage]);
    setInput('');
    setIsThinking(true);
    setRetryCount(0);

    try {
      const response = await fetchWithAuth('/api/v1/genai/chat-on-directory', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          directoryId: folder.id,
          question: input,
          selectedModel: selectedModel
        }),
      });

      const data = await response.json();
      if (data.success && data.data?.createdRecord?.id) {
        setLastMessageId(data.data.createdRecord.id);
        setPolling(true);
      } else {
        const aiMessage = {
          id: `error-${Date.now()}`,
          text: 'Sorry, I could not process your request.',
          sender: 'ai',
          timestamp: Date.now()
        };
        setMessages(prevMessages => [...prevMessages, aiMessage]);
        setIsThinking(false);
      }
    } catch (error) {
      console.error('Error sending message:', error);
      const aiMessage = {
        id: `error-${Date.now()}`,
        text: 'Sorry, I encountered an error.',
        sender: 'ai',
        timestamp: Date.now()
      };
      setMessages(prevMessages => [...prevMessages, aiMessage]);
      setIsThinking(false);
    }
  };

  // Fetch available models
  useEffect(() => {
    const fetchModels = async () => {
      try {
        const response = await fetchWithAuth('/api/v1/genai/get-gen-ai-models-for-query', {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
          }
        });
        
        const data = await response.json();
        if (data.success && data.data?.models) {
          setAvailableModels(data.data.models);
          if (data.data.default_model) {
            setSelectedModel(data.data.default_model);
          } else if (data.data.models.length > 0) {
            setSelectedModel(data.data.models[0]);
          }
        }
      } catch (error) {
        console.error('Error fetching models:', error);
      } finally {
        setIsLoadingModels(false);
      }
    };

    fetchModels();
  }, [accessToken]);

  // Load chat history
  useEffect(() => {
    const fetchChatHistory = async () => {
      if (!folder?.id) return;
      
      setIsLoadingHistory(true);
      try {
        const response = await fetchWithAuth(`/api/v1/genai/get-directory-chats?directoryId=${folder.id}`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
          }
        });
        
        const data = await response.json();
        console.log('Chat history response:', data);
        
        if (data.success && data.data?.chats) {
          const formattedMessages = data.data.chats.flatMap(chat => {
            const messages = [];
            
            messages.push({
              id: `${chat.id}-question`,
              text: chat.userQuestion,
              sender: 'user',
              timestamp: new Date(chat.createdAt).getTime()
            });

            if (chat.genAiServerResponse) {
              messages.push({
                id: `${chat.id}-response`,
                text: `[${chat.selectedModel || 'AI'}] ${chat.genAiServerResponse}`,
                sender: 'ai',
                timestamp: new Date(chat.updatedAt).getTime(),
                usedFiles: chat.usedFiles
              });
            }

            return messages;
          });

          formattedMessages.sort((a, b) => a.timestamp - b.timestamp);
          setMessages(formattedMessages);
        }
      } catch (error) {
        console.error('Error fetching chat history:', error);
      } finally {
        setIsLoadingHistory(false);
      }
    };

    fetchChatHistory();
  }, [folder?.id, accessToken]);

  // Poll for new responses
  useEffect(() => {
    let intervalId;
    let timeoutId;
    
    if (polling && lastMessageId) {
      intervalId = setInterval(async () => {
        try {
          const response = await fetchWithAuth(`/api/v1/genai/get-directory-chats?directoryId=${folder.id}`, {
            method: 'GET',
            headers: {
              'Authorization': `Bearer ${accessToken}`,
            }
          });
          
          const data = await response.json();
          if (data.success && data.data?.chats) {
            const chatRecord = data.data.chats.find(chat => chat.id === lastMessageId);
            if (chatRecord?.genAiServerResponse) {
              const aiMessage = {
                id: `${chatRecord.id}-response`,
                text: `[${chatRecord.selectedModel || selectedModel}] ${chatRecord.genAiServerResponse}`,
                sender: 'ai',
                timestamp: Date.now(),
                usedFiles: chatRecord.usedFiles
              };
              setMessages(prevMessages => [...prevMessages, aiMessage]);
              setPolling(false);
              setIsThinking(false);
              setRetryCount(0);
              clearInterval(intervalId);
              clearTimeout(timeoutId);
              return;
            }
          }
          
          if (retryCount >= maxRetries) {
            setPolling(false);
            setIsThinking(false);
            const aiMessage = {
              id: `timeout-${Date.now()}`,
              text: 'Sorry, it\'s taking longer than expected to generate a response. Please try again.',
              sender: 'ai',
              timestamp: Date.now()
            };
            setMessages(prevMessages => [...prevMessages, aiMessage]);
            setRetryCount(0);
            clearInterval(intervalId);
            return;
          }
          
          setRetryCount(prev => prev + 1);
        } catch (error) {
          console.error('Error polling for response:', error);
        }
      }, pollingInterval);

      timeoutId = setTimeout(() => {
        clearInterval(intervalId);
        if (polling) {
          setPolling(false);
          setIsThinking(false);
          setRetryCount(0);
          const aiMessage = {
            id: `timeout-${Date.now()}`,
            text: 'Sorry, it\'s taking longer than expected to generate a response. Please try again.',
            sender: 'ai',
            timestamp: Date.now()
          };
          setMessages(prevMessages => [...prevMessages, aiMessage]);
        }
      }, timeout);
    }
    
    return () => {
      clearInterval(intervalId);
      clearTimeout(timeoutId);
    };
  }, [polling, lastMessageId, folder?.id, accessToken, retryCount, selectedModel]);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages]);

  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-75 flex items-center justify-center">
      <div className="relative bg-gray-800 rounded-lg shadow-lg w-11/12 max-w-2xl h-5/6 flex flex-col">
        <div className="flex justify-between items-center p-4 border-b border-gray-700 text-white">
          <div className="flex items-center space-x-4 flex-1">
            <h3 className="text-lg font-medium">Chat with Folder: {folder?.name}</h3>
            {isLoadingModels ? (
              <div className="flex items-center text-sm text-gray-400">
                <FontAwesomeIcon icon={faSpinner} className="animate-spin mr-2" />
                Loading models...
              </div>
            ) : (
              <select
                value={selectedModel}
                onChange={(e) => setSelectedModel(e.target.value)}
                className="bg-gray-700 text-sm text-white rounded px-2 py-1 border border-gray-600 focus:outline-none focus:border-blue-500"
              >
                {availableModels.map((model) => (
                  <option key={model} value={model}>
                    {model}
                  </option>
                ))}
              </select>
            )}
          </div>
          <button onClick={onClose} className="text-white hover:text-gray-300 transition-colors">
            <FontAwesomeIcon icon={faTimes} />
          </button>
        </div>

        <div ref={chatContainerRef} className="flex-1 p-4 overflow-y-auto">
          {isLoadingHistory ? (
            <div className="flex items-center justify-center h-full">
              <FontAwesomeIcon icon={faSpinner} className="animate-spin mr-2 text-white" />
              <span className="text-white">Loading chat history...</span>
            </div>
          ) : (
            <>
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`mb-3 p-3 rounded-lg max-w-[80%] ${
                    msg.sender === 'user'
                      ? 'bg-blue-600 text-white ml-auto'
                      : 'bg-gray-700 text-gray-200 mr-auto'
                  }`}
                >
                  {msg.sender === 'user' ? (
                    msg.text
                  ) : (
                    <div>
                      <Markdown 
                        remarkPlugins={[gfm]}
                        className="prose prose-invert max-w-none"
                        components={{
                          code: ({node, inline, className, children, ...props}) => {
                            const match = /language-(\w+)/.exec(className || '');
                            return !inline ? (
                              <pre className="bg-gray-900 p-2 rounded">
                                <code className={className} {...props}>
                                  {children}
                                </code>
                              </pre>
                            ) : (
                              <code className="bg-gray-900 px-1 rounded" {...props}>
                                {children}
                              </code>
                            );
                          }
                        }}
                      >
                        {msg.text}
                      </Markdown>
                      {msg.usedFiles && msg.usedFiles.length > 0 && (
                        <div className="mt-2 space-y-1">
                          <div className="text-xs text-gray-400 font-medium">Referenced Files:</div>
                          <div className="space-y-1 pl-2">
                            {msg.usedFiles.map((file, index) => (
                              <div key={index} className="flex items-center">
                                <button
                                  onClick={() => handleFileDownload(file)}
                                  className="text-sm text-blue-400 hover:text-blue-300 transition-colors flex items-center"
                                >
                                  <FontAwesomeIcon icon={faDownload} className="mr-2 text-xs" />
                                  {file.name}
                                </button>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
              {isThinking && (
                <div className="mb-3 p-3 rounded-lg max-w-[80%] bg-gray-700 text-gray-200 mr-auto flex items-center">
                  <FontAwesomeIcon icon={faSpinner} className="animate-spin mr-2" />
                  Generating response...
                </div>
              )}
            </>
          )}
        </div>

        <div className="p-4 border-t border-gray-700">
          <div className="flex items-center">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Type your message..."
              className="flex-1 bg-gray-700 text-white p-2 rounded-md mr-2 resize-none overflow-hidden focus:outline-none"
              rows={1}
              disabled={isThinking || isLoadingModels || isLoadingHistory}
            />
            <button 
              onClick={sendMessage}
              disabled={isThinking || !input.trim() || isLoadingModels || isLoadingHistory}
              className="bg-blue-500 hover:bg-blue-600 text-white p-2 rounded-md disabled:opacity-50"
            >
              <FontAwesomeIcon icon={faPaperPlane} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default FolderChatDialog;
