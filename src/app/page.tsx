"use client"

import { useEffect, useState } from 'react';
import Head from 'next/head';

export default function Home() {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [status, setStatus] = useState('idle'); // idle, loading, success, error
  const [logs, setLogs] = useState<any>([]);

  const addLog = (message:any) => {
    console.log(message);
    setLogs((prev:any) => [...prev, message]);
  };

  useEffect(() => {
    // Initialize Telegram when available
    if (typeof window !== 'undefined') {
      if (window.Telegram && window.Telegram.WebApp) {
        try {
          window.Telegram.WebApp.expand();
          addLog("Telegram WebApp expanded");
        } catch (err:any) {
          addLog(`Error in WebApp: ${err.message}`);
        }
      } else {
        addLog("Telegram WebApp not available");
      }
    }
  }, []);

  const handleTelegramPhoneRequest = () => {
    setStatus('loading');
    addLog("Requesting phone number...");
    
    if (typeof window !== 'undefined' && window.Telegram && window.Telegram.WebApp) {
      try {
        // Try to use Telegram's method first
        if (typeof window.Telegram.WebApp.requestContact === 'function') {
          addLog("Using Telegram's requestContact method");
          
          window.Telegram.WebApp.requestContact()
            .then(result => {
              if (result && result.phone_number) {
                setPhoneNumber(result.phone_number);
                setStatus('success');
                addLog(`Phone number received: ${result.phone_number}`);
              } else {
                throw new Error("No phone number returned");
              }
            })
            .catch(err => {
              addLog(`Error getting phone: ${err.message}`);
              // Fall back to a sample number
              simulatePhoneRequest();
            });
        } else {
          addLog("requestContact method not available");
          simulatePhoneRequest();
        }
      } catch (err:any) {
        addLog(`Exception: ${err.message}`);
        simulatePhoneRequest();
      }
    } else {
      addLog("Telegram not available, simulating request");
      simulatePhoneRequest();
    }
  };
  
  const simulatePhoneRequest = () => {
    // For demonstration, use a simulated phone number
    addLog("Using simulated phone number");
    setTimeout(() => {
      const simulatedPhone = "+1234567890";
      setPhoneNumber(simulatedPhone);
      setStatus('success');
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white p-4 flex flex-col items-center justify-center">
      <Head>
        <title>Telegram Phone Collector</title>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <script src="https://telegram.org/js/telegram-web-app.js"></script>
      </Head>
      
      <div className="w-full max-w-md bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="bg-blue-600 py-6 px-4 text-white text-center">
          <h1 className="text-xl font-bold">Phone Number Collection</h1>
          <p className="text-blue-100 text-sm mt-1">Securely share your phone number</p>
        </div>
        
        <div className="p-6">
          {status === 'success' ? (
            <div className="text-center">
              <div className="mb-4">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 text-green-500 mb-4">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h2 className="text-xl font-semibold text-gray-800">Thank You!</h2>
                <p className="text-gray-600 mt-1">Your phone number has been received</p>
              </div>
              
              <div className="bg-gray-50 rounded-lg p-4 mb-6 inline-block">
                <p className="font-mono text-lg">{phoneNumber}</p>
              </div>
              
              <button 
                onClick={() => setStatus('idle')}
                className="px-4 py-2 bg-gray-200 rounded-lg text-gray-700 hover:bg-gray-300 transition-colors"
              >
                Reset
              </button>
            </div>
          ) : (
            <div className="text-center">
              <p className="text-gray-600 mb-6">
                Click the button below to securely share your phone number with our service.
              </p>
              
              <button
                onClick={handleTelegramPhoneRequest}
                disabled={status === 'loading'}
                className={`w-full py-3 px-4 rounded-lg text-white font-medium ${
                  status === 'loading' 
                    ? 'bg-blue-400 cursor-not-allowed' 
                    : 'bg-blue-600 hover:bg-blue-700'
                } transition-colors`}
              >
                {status === 'loading' ? (
                  <div className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Processing...
                  </div>
                ) : (
                  'Share Phone Number'
                )}
              </button>
              
              <p className="text-xs text-gray-500 mt-4">
                Your privacy is important to us. Your phone number will only be used for authentication.
              </p>
            </div>
          )}
        </div>
      </div>
      
      {/* Debug section - can be removed in production */}
      <div className="w-full max-w-md mt-6 bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="bg-gray-100 py-2 px-4 flex justify-between items-center">
          <h3 className="text-sm font-medium text-gray-700">Debug Logs</h3>
          <button 
            onClick={() => setLogs([])}
            className="text-xs px-2 py-1 bg-gray-200 rounded text-gray-700 hover:bg-gray-300"
          >
            Clear
          </button>
        </div>
        <div className="max-h-40 overflow-y-auto p-2">
          {logs.length === 0 ? (
            <p className="text-gray-800 text-xs p-2">No logs yet</p>
          ) : (
            <div className="text-xs font-mono">
              {logs.map((log:any, index:any) => (
                <div key={index} className="p-1 border-b border-gray-100 ">
                  {log}
                </div>
              ))}
            </div>
          )}
        </div>
        <div className="p-2 bg-gray-50">
          <button
            onClick={simulatePhoneRequest}
            className="w-full text-xs px-2 py-1 bg-gray-200 rounded text-gray-700 hover:bg-gray-300"
          >
            Simulate Phone Request
          </button>
        </div>
      </div>
    </div>
  );
}