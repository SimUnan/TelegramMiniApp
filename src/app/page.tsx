"use client"

import { useEffect, useState } from 'react';
import Script from 'next/script';

export default function Home() {
  const [telegram, setTelegram] = useState<any>(null);
  const [userPhone, setUserPhone] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [submitted, setSubmitted] = useState<boolean>(false);
  const [scriptLoaded, setScriptLoaded] = useState<boolean>(false);
  const [debug, setDebug] = useState<string[]>([]);
  const [error, setError] = useState<string>('');
  const [userData, setUserData] = useState<any>(null);

  // Helper function to add debug messages
  const addDebug = (message: string) => {
    console.log(message);
    setDebug(prev => [...prev, `${new Date().toISOString().slice(11, 19)}: ${message}`]);
  };

  useEffect(() => {
    // Wait for the script to load before trying to access Telegram object
    if (!scriptLoaded) return;

    // Check if we're in a browser environment
    if (typeof window !== 'undefined') {
      addDebug('Checking Telegram environment...');
      
      if (window.Telegram && window.Telegram.WebApp) {
        const tg = window.Telegram.WebApp;
        setTelegram(tg);
        
        try {
          // Expand the WebApp to the full height
          tg.expand();
          addDebug('WebApp expanded successfully');
          
          // Log Telegram environment info
          addDebug(`WebApp version: ${tg.version || 'unknown'}`);
          addDebug(`Platform: ${tg.platform || 'unknown'}`);
          
          // Try to get user data from initDataUnsafe
          if (tg.initDataUnsafe && tg.initDataUnsafe.user) {
            const user = tg.initDataUnsafe.user;
            setUserData(user);
            addDebug(`User data available: ${JSON.stringify(user)}`);
          } else {
            addDebug('No user data available in initDataUnsafe');
          }
        } catch (err) {
          addDebug(`Error initializing: ${err instanceof Error ? err.message : String(err)}`);
        }
      } else {
        addDebug('Telegram WebApp not available');
        setError('This app must be opened from Telegram');
      }
    }
  }, [scriptLoaded]);

  const requestUserInfo = async () => {
    addDebug('User info requested');
    setIsLoading(true);
    setError('');
    
    try {
      if (!telegram) {
        throw new Error('Telegram environment not detected');
      }
      
      // Method 1: Try using the backend approach with getContactInfo API
      addDebug('Attempting to get user phone via mainButton integration');
      
      // Enable main button and set event handlers
      if (telegram.MainButton) {
        telegram.MainButton.setText('Share Contact Info');
        telegram.MainButton.show();
        
        // Set up a one-time event handler for the main button
        const handleMainButtonClick = () => {
          addDebug('Main button clicked');
          
          // Use native UI to request phone sharing
          if (typeof telegram.requestContact === 'function') {
            addDebug('Calling requestContact');
            
            telegram.requestContact()
              .then((result: any) => {
                addDebug(`Contact result: ${JSON.stringify(result)}`);
                
                if (result && result.phone_number) {
                  setUserPhone(result.phone_number);
                  setSubmitted(true);
                } else {
                  // If we have userData but no phone, show user info
                  if (userData) {
                    setSubmitted(true);
                    addDebug('Showing user data without phone number');
                  } else {
                    setError('Could not get phone number');
                  }
                }
              })
              .catch((err: any) => {
                addDebug(`Contact request error: ${err.message || String(err)}`);
                setError('Error requesting contact information');
              })
              .finally(() => {
                setIsLoading(false);
              });
          } else {
            addDebug('requestContact not available - showing user info');
            // If we have userData, show user info instead
            if (userData) {
              setSubmitted(true);
            } else {
              setError('Contact request method not available');
            }
            setIsLoading(false);
          }
        };
        
        // Add the event handler
        telegram.MainButton.onClick(handleMainButtonClick);
        
        // Return early as the actual action happens on MainButton click
        setIsLoading(false);
        return;
      }
      
      // Fallback for when MainButton isn't available
      if (typeof telegram.requestContact === 'function') {
        addDebug('MainButton not available, calling requestContact directly');
        
        telegram.requestContact()
          .then((result: any) => {
            addDebug(`Direct contact result: ${JSON.stringify(result)}`);
            
            if (result && result.phone_number) {
              setUserPhone(result.phone_number);
              setSubmitted(true);
            } else {
              // Fallback to just showing user data
              if (userData) {
                setSubmitted(true);
              } else {
                setError('Could not get phone number');
              }
            }
          })
          .catch((err: any) => {
            addDebug(`Direct contact error: ${err.message || String(err)}`);
            setError('Error requesting contact directly');
          })
          .finally(() => {
            setIsLoading(false);
          });
      } else {
        // If neither approach works, just show user data if available
        addDebug('No contact request methods available');
        
        if (userData) {
          setSubmitted(true);
        } else {
          setError('This Telegram client does not support phone number sharing');
        }
        setIsLoading(false);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      addDebug(`Error in requestUserInfo: ${errorMessage}`);
      setError(`Error: ${errorMessage}`);
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 text-center bg-gray-50">
      <Script 
        src="https://telegram.org/js/telegram-web-app.js"
        onLoad={() => {
          addDebug('Telegram script loaded');
          setScriptLoaded(true);
        }}
        onError={() => {
          addDebug('Failed to load Telegram script');
          setError('Failed to load Telegram integration');
        }}
        strategy="afterInteractive"
      />
      
      <main className="max-w-lg w-full mx-auto p-4 bg-white rounded-lg shadow-md">
        <h1 className="text-2xl font-bold mb-6 text-gray-800">Telegram Auth</h1>
        
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}
        
        {isLoading ? (
          <div className="py-4">
            <p>Processing request...</p>
            <div className="mt-2 w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          </div>
        ) : submitted ? (
          <div className="py-4">
            <p className="mb-4">Authentication successful!</p>
            
            {userPhone ? (
              <div className="bg-gray-100 rounded-lg py-3 px-4 mb-4 text-left">
                <p className="mb-2"><strong>Phone:</strong> {userPhone}</p>
              </div>
            ) : null}
            
            {userData ? (
              <div className="bg-gray-100 rounded-lg py-3 px-4 text-left">
                <p className="mb-2"><strong>User ID:</strong> {userData.id}</p>
                <p className="mb-2"><strong>First Name:</strong> {userData.first_name}</p>
                {userData.last_name && (
                  <p className="mb-2"><strong>Last Name:</strong> {userData.last_name}</p>
                )}
                {userData.username && (
                  <p className="mb-2"><strong>Username:</strong> @{userData.username}</p>
                )}
                {userData.language_code && (
                  <p><strong>Language:</strong> {userData.language_code}</p>
                )}
              </div>
            ) : null}
          </div>
        ) : (
          <div className="py-4">
            <p>Please click the button below to authenticate with Telegram.</p>
            <button
              className="mt-4 bg-blue-500 hover:bg-blue-600 text-white font-medium py-3 px-6 rounded-lg transition-colors"
              onClick={requestUserInfo}
            >
              Authenticate with Telegram
            </button>
            <p className="text-sm text-gray-500 mt-6">
              Your privacy is important to us. Your information will only be displayed on this screen.
            </p>
          </div>
        )}
        
        {/* Debug panel */}
        <div className="mt-8 pt-4 border-t border-gray-200">
          <details>
            <summary className="text-sm text-gray-500 cursor-pointer">Debug Info</summary>
            <div className="mt-2 p-2 bg-gray-100 rounded text-left text-xs font-mono text-gray-800 max-h-40 overflow-y-auto">
              {debug.map((msg, i) => (
                <div key={i} className="py-1">{msg}</div>
              ))}
            </div>
            <div className="mt-2">
              <button
                className="text-xs bg-gray-200 hover:bg-gray-300 text-gray-700 py-1 px-2 rounded"
                onClick={() => {
                  // Force show user data for testing
                  setUserData({
                    id: 12345678,
                    first_name: "Test",
                    last_name: "User",
                    username: "testuser",
                    language_code: "en"
                  });
                  setUserPhone('+1234567890');
                  setSubmitted(true);
                }}
              >
                Simulate Success
              </button>
            </div>
          </details>
        </div>
      </main>
    </div>
  );
}