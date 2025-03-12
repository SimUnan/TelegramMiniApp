// types/telegram-web-app.d.ts
interface TelegramWebApp {
    WebApp: {
      ready(): void;
      expand(): void;
      close(): void;
      showAlert(message: string): void;
      requestContact(): Promise<{ phone_number: string }>;
      version: any;
      platform:any;
      initDataUnsafe: any;
      MainButton: {
        text: string;
        setText(text: string): void;
        show(): void;
        hide(): void;
        enable(): void;
        disable(): void;
        onClick(callback: () => void): void;
      };
    };
  }
  
  // Extend the Window interface
  interface Window {
    Telegram: TelegramWebApp;
  }