"use client"

// pages/index.tsx
import { useEffect, useState } from 'react';
import Head from 'next/head';

export default function Home() {
  const [telegram, setTelegram] = useState<any>(null);
  const [userPhone, setUserPhone] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [submitted, setSubmitted] = useState<boolean>(false);

  useEffect(() => {
    // Initialize Telegram WebApp
    if (window.Telegram && window.Telegram.WebApp) {
      const tg = window.Telegram.WebApp;
      setTelegram(tg);
      
      // Expand the WebApp to the full height
      tg.expand();
    }
  }, []);

  const requestPhoneNumber = () => {
    if (!telegram) return;
    
    setIsLoading(true);
    
    // Request phone number through Telegram API
    telegram.requestContact()
      .then((contact: { phone_number: string }) => {
        if (contact && contact.phone_number) {
          setUserPhone(contact.phone_number);
          setSubmitted(true);
        }
      })
      .catch((error: any) => {
        console.error('Error requesting phone number:', error);
        alert('Failed to get phone number. Please try again.');
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  return (
    <div className="container">
      <Head>
        <title>Telegram Phone Number Mini-App</title>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
        <script src="https://telegram.org/js/telegram-web-app.js"></script>
      </Head>

      <main>
        <h1>Phone Number Collection</h1>
        
        {isLoading ? (
          <p>Loading...</p>
        ) : submitted ? (
          <div>
            <p>Thank you for sharing your phone number!</p>
            <p className="phone-display">Phone: <strong>{userPhone}</strong></p>
          </div>
        ) : (
          <div>
            <p>Please click the button below to share your phone number with us.</p>
            <button 
              className="share-button" 
              onClick={requestPhoneNumber}
            >
              Share Phone Number
            </button>
            <p className="privacy-note">
              Your privacy is important to us. Your phone number will only be displayed on this screen.
            </p>
          </div>
        )}
      </main>

      <style jsx>{`
        .container {
          min-height: 100vh;
          padding: 1rem;
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          text-align: center;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
        }
        
        main {
          padding: 1rem;
          max-width: 800px;
        }
        
        h1 {
          margin-bottom: 2rem;
          font-size: 1.5rem;
          color: #333;
        }
        
        .privacy-note {
          font-size: 0.8rem;
          opacity: 0.8;
          margin-top: 2rem;
        }

        .share-button {
          background-color: #0088cc;
          color: white;
          border: none;
          border-radius: 8px;
          padding: 12px 24px;
          font-size: 16px;
          cursor: pointer;
          margin-top: 20px;
          transition: background-color 0.3s;
        }

        .share-button:hover {
          background-color: #006699;
        }

        .phone-display {
          font-size: 18px;
          margin-top: 20px;
          padding: 15px;
          background-color: #f0f0f0;
          border-radius: 8px;
          display: inline-block;
        }
      `}</style>
    </div>
  );
}