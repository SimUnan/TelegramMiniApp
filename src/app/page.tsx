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
      addDebug(`Window object: ${typeof window}`);
      addDebug(`Telegram object: ${typeof window.Telegram}`);
      
      if (window.Telegram && window.Telegram.WebApp) {
        addDebug(`WebApp object: ${typeof window.Telegram.WebApp}`);
        addDebug(`WebApp version: ${window.Telegram.WebApp || 'unknown'}`);
        addDebug(`Platform: ${window.Telegram.WebApp || 'unknown'}`);
        
        const tg = window.Telegram.WebApp;
        setTelegram(tg);
        
        try {
          // Expand the WebApp to the full height
          tg.expand();
          addDebug('WebApp expanded successfully');
          
          // Check if requestContact method exists
          addDebug(`requestContact method: ${typeof tg.requestContact}`);
        } catch (err) {
          addDebug(`Error initializing: ${err instanceof Error ? err.message : String(err)}`);
          setError('Error initializing Telegram WebApp');
        }
      } else {
        addDebug('Telegram WebApp not available');
        setError('This app must be opened from Telegram');
      }
    }
  }, [scriptLoaded]);

  const requestPhoneNumber = async () => {
    addDebug('Phone number requested');
    setIsLoading(true);
    setError('');
    
    try {
      // Make sure we're in Telegram
      if (!telegram) {
        addDebug('Telegram object not available');
        throw new Error('Telegram environment not detected');
      }
      
      if (typeof telegram.requestContact !== 'function') {
        addDebug('requestContact is not a function');
        throw new Error('This Telegram client doesn\'t support phone number requests');
      }
      
      addDebug('Calling telegram.requestContact()');
      
      // Use Promise with timeout to handle potential non-response
      const phonePromise = telegram.requestContact();
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Request timed out')), 10000)
      );
      
      const contact = await Promise.race([phonePromise, timeoutPromise]);
      
      addDebug(`Contact response received: ${JSON.stringify(contact)}`);
      
      if (contact && contact.phone_number) {
        addDebug(`Phone number: ${contact.phone_number}`);
        setUserPhone(contact.phone_number);
        setSubmitted(true);
      } else {
        addDebug('No phone number in response');
        setError('Failed to get phone number from Telegram');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      addDebug(`Error in requestPhoneNumber: ${errorMessage}`);
      setError(`Error: ${errorMessage}`);
      
      // For testing purposes - uncomment to simulate success
      // setUserPhone('+1234567890');
      // setSubmitted(true);
    } finally {
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
        <h1 className="text-2xl font-bold mb-6 text-gray-800">Phone Number Collection</h1>
        
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}
        
        {isLoading ? (
          <div className="py-4">
            <p>Requesting phone number...</p>
            <div className="mt-2 w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          </div>
        ) : submitted ? (
          <div className="py-4">
            <p className="mb-4">Thank you for sharing your phone number!</p>
            <p className="bg-gray-100 rounded-lg py-3 px-4 inline-block text-lg">
              Phone: <strong>{userPhone}</strong>
            </p>
          </div>
        ) : (
          <div className="py-4">
            <p>Please click the button below to share your phone number with us.</p>
            <button
              className="mt-4 bg-blue-500 hover:bg-blue-600 text-white font-medium py-3 px-6 rounded-lg transition-colors"
              onClick={requestPhoneNumber}
            >
              Share Phone Number
            </button>
            <p className="text-sm text-gray-500 mt-6">
              Your privacy is important to us. Your phone number will only be displayed on this screen.
            </p>
          </div>
        )}
        
        {/* Debug panel - can be removed in production */}
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
                  // Force show phone number for testing
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