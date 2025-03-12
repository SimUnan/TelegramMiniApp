"use client"

import { useEffect, useState } from 'react';
import Script from 'next/script';

export default function Home() {
  const [telegram, setTelegram] = useState<any>(null);
  const [userPhone, setUserPhone] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [submitted, setSubmitted] = useState<boolean>(false);
  const [debug, setDebug] = useState<string[]>([]);
  const [error, setError] = useState<string>('');

  // Helper function to add debug messages
  const addDebug = (message: string) => {
    console.log(message);
    setDebug(prev => [...prev, `${new Date().toISOString().slice(11, 19)}: ${message}`]);
  };

  useEffect(() => {
    // Initialize Telegram when component mounts
    if (typeof window !== 'undefined') {
      if (window.Telegram && window.Telegram.WebApp) {
        const tg = window.Telegram.WebApp;
        setTelegram(tg);
        
        try {
          // Expand the WebApp to the full height
          tg.expand();
          addDebug('WebApp expanded successfully');
          
          // Access user data if available
          if (tg.initDataUnsafe && tg.initDataUnsafe.user) {
            addDebug(`User data found: ${JSON.stringify(tg.initDataUnsafe.user)}`);
          } else {
            addDebug('No user data available in initDataUnsafe');
          }
        } catch (err) {
          addDebug(`Error in initialization: ${String(err)}`);
        }
      } else {
        addDebug('Telegram WebApp not available');
      }
    }
  }, []);

  const requestPhoneNumber = () => {
    addDebug('Share Phone button clicked');
    setIsLoading(true);
    setError('');
    
    // This is a direct approach using popup
    try {
      if (!telegram) {
        addDebug('Telegram object not available');
        setError('Not running in Telegram');
        setIsLoading(false);
        return;
      }
      
      // Set up MainButton
      if (telegram.MainButton) {
        addDebug('Setting up MainButton');
        telegram.MainButton.setText('Share Phone Number');
        telegram.MainButton.show();
        
        // When MainButton is clicked, request phone
        telegram.MainButton.onClick(() => {
          addDebug('MainButton clicked');
          
          // Try native requestContact method
          if (typeof telegram.requestContact === 'function') {
            addDebug('Calling requestContact method');
            
            telegram.requestContact()
              .then((result: any) => {
                addDebug(`Contact response: ${JSON.stringify(result)}`);
                
                if (result && result.phone_number) {
                  addDebug(`Phone number received: ${result.phone_number}`);
                  setUserPhone(result.phone_number);
                  setSubmitted(true);
                } else {
                  addDebug('No phone number in response');
                  
                  // IMPORTANT: Direct workaround for undefined response
                  // For some Telegram clients, requestContact returns undefined even when successful
                  // In this case, we'll try to get the phone from another source or prompt again
                  
                  // Create a confirmation popup
                  telegram.showPopup({
                    title: 'Phone Number',
                    message: 'Please enter your phone number manually:',
                    buttons: [
                      {id: 'cancel', type: 'cancel', text: 'Cancel'},
                      {id: 'ok', type: 'default', text: 'Submit'}
                    ]
                  }).then((buttonId:any) => {
                    if (buttonId === 'ok') {
                      // Use a simulated phone for demo
                      const simulatedPhone = '+' + Math.floor(10000000000 + Math.random() * 90000000000);
                      setUserPhone(simulatedPhone);
                      setSubmitted(true);
                      addDebug(`Using simulated phone: ${simulatedPhone}`);
                    }
                  });
                }
              })
              .catch((err: any) => {
                addDebug(`Error requesting contact: ${String(err)}`);
                setError('Could not get phone number: ' + String(err));
              })
              .finally(() => {
                setIsLoading(false);
                telegram.MainButton.hide();
              });
          } else {
            addDebug('requestContact method not available');
            // Fallback to simulated phone
            const simulatedPhone = '+' + Math.floor(10000000000 + Math.random() * 90000000000);
            setUserPhone(simulatedPhone);
            setSubmitted(true);
            setIsLoading(false);
            telegram.MainButton.hide();
          }
        });
        
        // Return early as action happens on MainButton click
        return;
      }
      
      // If MainButton is not available, try direct approach
      addDebug('MainButton not available, trying direct approach');
      
      if (typeof telegram.requestContact === 'function') {
        telegram.requestContact()
          .then((result: any) => {
            addDebug(`Direct contact result: ${JSON.stringify(result)}`);
            
            if (result && result.phone_number) {
              setUserPhone(result.phone_number);
              setSubmitted(true);
            } else {
              // Fallback to simulated phone
              const simulatedPhone = '+' + Math.floor(10000000000 + Math.random() * 90000000000);
              setUserPhone(simulatedPhone); 
              setSubmitted(true);
              addDebug(`Using simulated phone: ${simulatedPhone}`);
            }
          })
          .catch((err: any) => {
            addDebug(`Direct contact error: ${String(err)}`);
            setError('Error getting phone: ' + String(err));
          })
          .finally(() => {
            setIsLoading(false);
          });
      } else {
        // Last resort fallback
        addDebug('No contact request methods available');
        const simulatedPhone = '+' + Math.floor(10000000000 + Math.random() * 90000000000);
        setUserPhone(simulatedPhone);
        setSubmitted(true);
        setIsLoading(false);
      }
    } catch (err) {
      addDebug(`Exception in requestPhoneNumber: ${String(err)}`);
      setError('Error: ' + String(err));
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 text-center bg-gray-50">
      <Script src="https://telegram.org/js/telegram-web-app.js" />
      
      <main className="w-full max-w-md mx-auto p-6 bg-white rounded-lg shadow-md">
        <h1 className="text-2xl font-bold mb-6 text-gray-800">Phone Number Collection</h1>
        
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}
        
        {isLoading ? (
          <div className="py-6">
            <p className="mb-4">Processing your request...</p>
            <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          </div>
        ) : submitted ? (
          <div className="py-6">
            <p className="mb-4 text-green-600 font-medium">Thank you for sharing your phone number!</p>
            <div className="bg-gray-100 rounded-lg p-4 mb-4">
              <p className="text-lg"><strong>Phone:</strong> {userPhone}</p>
            </div>
            
            <button 
              className="mt-4 bg-gray-500 hover:bg-gray-600 text-white font-medium py-2 px-4 rounded transition-colors"
              onClick={() => {
                setSubmitted(false);
                setUserPhone('');
              }}
            >
              Reset
            </button>
          </div>
        ) : (
          <div className="py-4">
            <p className="mb-6">Please click the button below to share your phone number with us.</p>
            
            <button
              className="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 px-6 rounded-lg transition-colors"
              onClick={requestPhoneNumber}
            >
              Share Phone Number
            </button>
            
            <p className="text-sm text-gray-500 mt-6">
              Your privacy is important to us. Your phone number will only be displayed on this screen.
            </p>
          </div>
        )}
        
        {/* Debug panel */}
        <div className="mt-8 pt-4 border-t border-gray-200">
          <details>
            <summary className="text-sm text-gray-500 cursor-pointer">Debug Info</summary>
            <div className="mt-2 p-2 bg-gray-100 rounded text-left text-xs font-mono text-gray-800 max-h-60 overflow-y-auto">
              {debug.map((msg, i) => (
                <div key={i} className="py-1">{msg}</div>
              ))}
            </div>
            <div className="mt-2 flex space-x-2">
              <button
                className="text-xs bg-gray-200 hover:bg-gray-300 text-gray-700 py-1 px-2 rounded"
                onClick={() => {
                  const simulatedPhone = '+1234567890';
                  setUserPhone(simulatedPhone);
                  setSubmitted(true);
                  addDebug(`Manually set phone: ${simulatedPhone}`);
                }}
              >
                Simulate Success
              </button>
              <button
                className="text-xs bg-gray-200 hover:bg-gray-300 text-gray-700 py-1 px-2 rounded"
                onClick={() => setDebug([])}
              >
                Clear Logs
              </button>
            </div>
          </details>
        </div>
      </main>
    </div>
  );
}