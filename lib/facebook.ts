// lib/facebook.ts
export function initFacebookSDK() {
  return new Promise<void>((resolve, reject) => {
    if (typeof window === 'undefined') {
      reject(new Error('Facebook SDK can only be initialized in browser'));
      return;
    }

    // Check if SDK is already loaded and initialized
    if (window.FB) {
      resolve();
      return;
    }

    const appId = process.env.NEXT_PUBLIC_FACEBOOK_APP_ID;
    if (!appId) {
      reject(new Error('Facebook App ID is not configured'));
      return;
    }

    // Check if script is already being loaded
    const existingScript = document.querySelector('script[src*="connect.facebook.net"]');
    if (existingScript) {
      // Wait for FB to be available
      let timeoutId: NodeJS.Timeout;
      const checkInterval = setInterval(() => {
        if (window.FB) {
          clearInterval(checkInterval);
          clearTimeout(timeoutId);
          resolve();
        }
      }, 100);

      timeoutId = setTimeout(() => {
        clearInterval(checkInterval);
        reject(new Error('Timeout waiting for Facebook SDK to load'));
      }, 10000);

      return;
    }

    // Load Facebook SDK script
    const script = document.createElement('script');
    script.src = 'https://connect.facebook.net/en_US/sdk.js';
    script.async = true;
    script.defer = true;
    script.crossOrigin = 'anonymous';
    script.id = 'facebook-jssdk';
    
    let timeoutId: NodeJS.Timeout;
    let checkInterval: NodeJS.Timeout;
    
    script.onload = () => {
      // Wait for window.FB to be available (sometimes it takes a moment)
      checkInterval = setInterval(() => {
        if (window.FB) {
          try {
      window.FB.init({
        appId: appId,
        cookie: true,
        xfbml: true,
        version: 'v18.0',
      });
            clearInterval(checkInterval);
            clearTimeout(timeoutId);
      resolve();
          } catch (error) {
            clearInterval(checkInterval);
            clearTimeout(timeoutId);
            reject(new Error(`Failed to initialize Facebook SDK: ${error}`));
          }
        }
      }, 50);

      // Timeout after 10 seconds
      timeoutId = setTimeout(() => {
        clearInterval(checkInterval);
        reject(new Error('Timeout waiting for Facebook SDK to initialize'));
      }, 10000);
    };

    script.onerror = () => {
      clearTimeout(timeoutId);
      if (checkInterval) clearInterval(checkInterval);
      reject(new Error('Failed to load Facebook SDK script'));
    };

    // Append to head instead of body for better reliability
    const firstScript = document.getElementsByTagName('script')[0];
    if (firstScript && firstScript.parentNode) {
      firstScript.parentNode.insertBefore(script, firstScript);
    } else {
      document.head.appendChild(script);
    }
  });
}

// Extend Window interface
declare global {
  interface Window {
    FB: {
      init: (config: { appId: string; cookie: boolean; xfbml: boolean; version: string }) => void;
      login: (
        callback: (response: FacebookLoginResponse) => void,
        options?: { scope?: string }
      ) => void;
      getLoginStatus: (callback: (response: FacebookLoginStatusResponse) => void) => void;
      logout: (callback: () => void) => void;
      api: (path: string, callback: (response: any) => void) => void;
    };
  }
}

interface FacebookLoginResponse {
  authResponse?: {
    accessToken: string;
    expiresIn: number;
    userID: string;
  };
  status: 'connected' | 'not_authorized' | 'unknown';
}

interface FacebookLoginStatusResponse {
  status: 'connected' | 'not_authorized' | 'unknown';
  authResponse?: {
    accessToken: string;
    expiresIn: number;
    userID: string;
  };
}

