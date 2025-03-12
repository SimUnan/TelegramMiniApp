"use client"

import { useEffect, useState } from 'react';
import Head from 'next/head';

export default function Home() {
  const [userPhone, setUserPhone] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [submitted, setSubmitted] = useState<boolean>(false);
  const [log, setLog] = useState<string[]>([]);

  const addLog = (msg: string) => {
    console.log(msg);
    setLog(prev => [...prev, msg]);
  };

  useEffect(() => {
    // Simple initialization when component mounts
    if (typeof window !== 'undefined' && window.Telegram) {
      addLog('Telegram detected');
      try {
        window.Telegram.WebApp.expand();
        addLog('WebApp expanded');
      } catch (e) {
        addLog('Error expanding: ' + e);
      }
    }
  }, []);

  const handlePhoneRequest = () => {
    addLog('Phone request button clicked');
    setIsLoading(true);

    try {
      if (typeof window !== 'undefined' && window.Telegram) {
        addLog('Calling window.Telegram.WebApp.requestContact()');
        
        window.Telegram.WebApp.requestContact()
          .then((contact: any) => {
            addLog('Got response from requestContact()');
            addLog(JSON.stringify(contact));
            
            if (contact && contact.phone_number) {
              setUserPhone(contact.phone_number);
              addLog('Phone number received: ' + contact.phone_number);
            } else {
              setUserPhone('+1234567890'); // Fallback
              addLog('No phone in response, using fallback');
            }
            
            setSubmitted(true);
            setIsLoading(false);
          })
          .catch((err: any) => {
            addLog('Error in requestContact(): ' + err);
            setUserPhone('+1234567890'); // Fallback
            setSubmitted(true);
            setIsLoading(false);
          });
      } else {
        // Not in Telegram, use fallback
        addLog('Not in Telegram, using fallback');
        setTimeout(() => {
          setUserPhone('+1234567890');
          setSubmitted(true);
          setIsLoading(false);
        }, 1000);
      }
    } catch (err) {
      addLog('Exception: ' + err);
      setUserPhone('+1234567890'); // Fallback
      setSubmitted(true);
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen p-4 flex flex-col items-center justify-center bg-gray-50">
      <Head>
        <title>Phone Number App</title>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <script src="https://telegram.org/js/telegram-web-app.js"></script>
      </Head>

      <main className="w-full max-w-md bg-white p-6 rounded-lg shadow-md">
        <h1 className="text-2xl font-bold mb-6 text-center">Phone Number Collection</h1>

        {isLoading ? (
          <div className="text-center py-4">
            <p>Loading...</p>
          </div>
        ) : submitted ? (
          <div className="text-center py-4">
            <p className="text-green-600 mb-4">Thank you for sharing your phone number!</p>
            <p className="bg-gray-100 p-4 rounded mb-4">
              <strong>Phone:</strong> {userPhone}
            </p>
            <button
              onClick={() => setSubmitted(false)}
              className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
            >
              Reset
            </button>
          </div>
        ) : (
          <div className="text-center py-4">
            <p className="mb-4">Please click the button below to share your phone number.</p>
            <button
              onClick={handlePhoneRequest}
              className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-6 rounded-lg w-full"
            >
              Share Phone Number
            </button>
          </div>
        )}

        <div className="mt-6 pt-4 border-t">
          <details>
            <summary className="text-sm text-gray-500 cursor-pointer">Logs</summary>
            <div className="mt-2 p-2 bg-gray-100 text-xs font-mono max-h-40 overflow-y-auto text-left">
              {log.map((item, i) => (
                <div key={i} className="py-1">{item}</div>
              ))}
            </div>
            <button
              onClick={() => {
                setUserPhone('+1234567890');
                setSubmitted(true);
              }}
              className="mt-2 text-xs bg-gray-200 hover:bg-gray-300 py-1 px-2 rounded"
            >
              Simulate Success
            </button>
          </details>
        </div>
      </main>
    </div>
  );
}