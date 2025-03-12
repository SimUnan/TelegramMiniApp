"use client"

import { useEffect, useState } from 'react';
import Script from 'next/script';

export default function Home() {
  const [telegram, setTelegram] = useState<any>(null);
  const [userPhone, setUserPhone] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [submitted, setSubmitted] = useState<boolean>(false);
  const [scriptLoaded, setScriptLoaded] = useState<boolean>(false);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    // Wait for the script to load before trying to access Telegram object
    if (!scriptLoaded) return;

    // Check if we're in a browser environment
    if (typeof window !== 'undefined') {
      console.log('Window object exists:', !!window);
      console.log('Telegram object exists:', !!window.Telegram);
      
      if (window.Telegram && window.Telegram.WebApp) {
        console.log('WebApp object exists:', !!window.Telegram.WebApp);
        const tg = window.Telegram.WebApp;
        setTelegram(tg);
        
        try {
          // Expand the WebApp to the full height
          tg.expand();
          console.log('WebApp expanded successfully');
        } catch (err) {
          console.error('Error expanding WebApp:', err);
          setError('Error initializing Telegram WebApp');
        }
      } else {
        setError('This app must be opened from Telegram');
        console.log('Telegram WebApp not available - might not be opened from Telegram');
      }
    }
  }, [scriptLoaded]);

  // Handle manual testing outside Telegram
  const simulatePhoneNumberSuccess = () => {
    if (!window.Telegram || !window.Telegram.WebApp) {
      setUserPhone('+1234567890'); // Simulate a phone number
      setSubmitted(true);
      setIsLoading(false);
    }
  };

  const requestPhoneNumber = () => {
    console.log("CLICKED")
    if (!telegram && !window.Telegram) {
      // For testing outside Telegram
      simulatePhoneNumberSuccess();
      return;
    }
    
    setIsLoading(true);
    setError('');
    
    try {
      // Wrapped in try/catch in case requestContact isn't available
      console.log('Requesting phone number...');
      
      // Check if we're in Telegram
      if (telegram && telegram.requestContact) {
        telegram.requestContact()
          .then((contact: { phone_number: string }) => {
            console.log('Phone received:', contact);
            if (contact && contact.phone_number) {
              setUserPhone(contact.phone_number);
              setSubmitted(true);
            } else {
              setError('No phone number received');
            }
          })
          .catch((err: any) => {
            console.error('Error requesting phone:', err);
            setError('Failed to get phone number. Please try again.');
            
            // For demo purposes - simulate success after error
            simulatePhoneNumberSuccess();
          })
          .finally(() => {
            setIsLoading(false);
          });
      } else {
        // For testing outside Telegram
        console.log('RequestContact method not available - simulating success');
        simulatePhoneNumberSuccess();
      }
    } catch (err) {
      console.error('Exception requesting phone:', err);
      setError('Error requesting phone number');
      setIsLoading(false);
      
      // For demo purposes
      simulatePhoneNumberSuccess();
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 text-center">
      <Script 
        src="https://telegram.org/js/telegram-web-app.js"
        onLoad={() => {
          console.log('Telegram script loaded');
          setScriptLoaded(true);
        }}
        onError={() => {
          console.error('Failed to load Telegram script');
          setError('Failed to load Telegram integration');
        }}
      />
      
      <main className="max-w-lg mx-auto p-4">
        <h1 className="text-2xl font-bold mb-6 text-gray-800">Phone Number Collection</h1>
        
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}
        
        {isLoading ? (
          <div className="py-4">
            <p>Loading...</p>
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
      </main>
    </div>
  );
}