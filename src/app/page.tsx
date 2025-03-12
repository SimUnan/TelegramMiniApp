"use client"
// pages/index.js (or .tsx)
import { useEffect, useState } from 'react';

export default function Home() {
  const [logs, setLogs] = useState<any>([]);
  const [telegramAvailable, setTelegramAvailable] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState('');

  // Logger function
  const addLog = (message:any) => {
    console.log(message);
    setLogs((prevLogs:any) => [...prevLogs, `${new Date().toISOString().split('T')[1].split('.')[0]}: ${message}`]);
  };

  // Check Telegram availability on load
  useEffect(() => {
    addLog('Page loaded');
    
    // Check if window is defined (client-side)
    if (typeof window !== 'undefined') {
      addLog('Window is defined (client-side render)');
      
      // Check if Telegram script exists
      const telegramScriptExists = !!document.querySelector('script[src*="telegram-web-app.js"]');
      addLog(`Telegram script tag exists: ${telegramScriptExists}`);
      
      // Check if Telegram object exists
      setTimeout(() => {
        const telegramExists = !!window.Telegram;
        addLog(`window.Telegram exists: ${telegramExists}`);
        
        if (telegramExists) {
          const webAppExists = !!window.Telegram.WebApp;
          addLog(`window.Telegram.WebApp exists: ${webAppExists}`);
          
          if (webAppExists) {
            try {
              addLog(`Telegram platform: ${window.Telegram.WebApp || 'unknown'}`);
              addLog(`Telegram version: ${window.Telegram.WebApp || 'unknown'}`);
              
              // Try to expand WebApp
              window.Telegram.WebApp.expand();
              addLog('WebApp.expand() called successfully');
              
              // Check if requestContact exists
              const requestContactExists = typeof window.Telegram.WebApp.requestContact === 'function';
              addLog(`requestContact method exists: ${requestContactExists}`);
              
              setTelegramAvailable(true);
            } catch (error) {
              addLog(`Error during Telegram initialization: ${error}`);
            }
          }
        }
      }, 500); // Small delay to ensure script has loaded
    } else {
      addLog('Window is undefined (server-side render)');
    }
  }, []);

  const requestPhone = () => {
    addLog('Request phone button clicked');
    
    if (!telegramAvailable) {
      addLog('Telegram not available, cannot request phone');
      return;
    }
    
    try {
      addLog('Calling window.Telegram.WebApp.requestContact()');
      
      window.Telegram.WebApp.requestContact()
        .then(result => {
          addLog(`RequestContact promise resolved with result: ${JSON.stringify(result)}`);
          
          if (result && result.phone_number) {
            addLog(`Phone number received: ${result.phone_number}`);
            setPhoneNumber(result.phone_number);
          } else {
            addLog('No phone number in response (undefined or null)');
            setPhoneNumber('Not provided');
          }
        })
        .catch(error => {
          addLog(`RequestContact promise rejected with error: ${error.message || JSON.stringify(error)}`);
          setPhoneNumber('Error getting phone');
        });
    } catch (error) {
      addLog(`Exception thrown when calling requestContact: ${error}`);
      setPhoneNumber('Exception occurred');
    }
  };

  return (
    <div style={{ 
      display: 'flex', 
      flexDirection: 'column', 
      alignItems: 'center', 
      padding: '1rem',
      fontFamily: 'Arial, sans-serif',
      maxWidth: '100%',
      boxSizing: 'border-box'
    }}>
      <script src="https://telegram.org/js/telegram-web-app.js"></script>
      
      <h1 style={{ marginBottom: '1.5rem' }}>Telegram Phone Request</h1>
      
      {phoneNumber ? (
        <div style={{ 
          padding: '1rem',
          backgroundColor: '#f0f0f0',
          borderRadius: '8px',
          marginBottom: '1.5rem',
          width: '100%',
          maxWidth: '400px',
          textAlign: 'center'
        }}>
          <p><strong>Phone Number:</strong> {phoneNumber}</p>
          <button 
            onClick={() => setPhoneNumber('')}
            style={{
              marginTop: '1rem',
              padding: '0.5rem 1rem',
              backgroundColor: '#6c757d',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            Reset
          </button>
        </div>
      ) : (
        <button 
          onClick={requestPhone}
          style={{
            backgroundColor: '#0088cc',
            color: 'white',
            border: 'none',
            padding: '12px 24px',
            borderRadius: '8px',
            fontSize: '16px',
            cursor: 'pointer',
            marginBottom: '1.5rem'
          }}
        >
          Request Phone Number
        </button>
      )}
      
      <div style={{
        width: '100%',
        maxWidth: '600px',
        marginTop: '1rem',
        border: '1px solid #ddd',
        borderRadius: '8px',
        overflow: 'hidden'
      }}>
        <div style={{
          padding: '0.5rem 1rem',
          backgroundColor: '#f5f5f5',
          borderBottom: '1px solid #ddd',
          fontWeight: 'bold',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <span>Debug Logs</span>
          <button 
            onClick={() => setLogs([])}
            style={{
              padding: '0.25rem 0.5rem',
              backgroundColor: '#6c757d',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              fontSize: '12px',
              cursor: 'pointer'
            }}
          >
            Clear
          </button>
        </div>
        <div style={{
          padding: '0.5rem',
          backgroundColor: '#fff',
          maxHeight: '300px',
          overflowY: 'auto',
          fontSize: '12px',
          fontFamily: 'monospace'
        }}>
          {logs.length === 0 ? (
            <div style={{ padding: '0.5rem', color: '#999' }}>No logs yet</div>
          ) : (
            logs.map((log:any, index:any) => (
              <div key={index} style={{ 
                padding: '0.25rem 0.5rem',
                borderBottom: index < logs.length - 1 ? '1px solid #f0f0f0' : 'none'
              }}>
                {log}
              </div>
            ))
          )}
        </div>
      </div>
      
      <div style={{
        marginTop: '1rem',
        textAlign: 'center',
        padding: '0.5rem',
        fontSize: '12px',
        color: '#666'
      }}>
        <p>This app requires Telegram. Check logs for details.</p>
        <p style={{ marginTop: '0.5rem' }}>
          <button
            onClick={() => {
              setPhoneNumber('+1234567890');
              addLog('Manually set phone number for testing');
            }}
            style={{
              padding: '0.25rem 0.5rem',
              backgroundColor: '#f0f0f0',
              border: '1px solid #ddd',
              borderRadius: '4px',
              fontSize: '12px',
              cursor: 'pointer'
            }}
          >
            Simulate Phone Number
          </button>
        </p>
      </div>
    </div>
  );
}