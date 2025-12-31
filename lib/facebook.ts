// lib/facebook.ts
export function initFacebookSDK() {
  return new Promise<void>((resolve, reject) => {
    if (typeof window === 'undefined') {
      reject(new Error('Facebook SDK can only be initialized in browser'));
      return;
    }

    // Check if SDK is already loaded
    if (window.FB) {
      resolve();
      return;
    }

    const appId = process.env.NEXT_PUBLIC_FACEBOOK_APP_ID;
    if (!appId) {
      reject(new Error('Facebook App ID is not configured'));
      return;
    }

    // Load Facebook SDK script
    const script = document.createElement('script');
    script.src = 'https://connect.facebook.net/en_US/sdk.js';
    script.async = true;
    script.defer = true;
    script.crossOrigin = 'anonymous';
    
    script.onload = () => {
      window.FB.init({
        appId: appId,
        cookie: true,
        xfbml: true,
        version: 'v18.0',
      });
      resolve();
    };

    script.onerror = () => {
      reject(new Error('Failed to load Facebook SDK'));
    };

    document.body.appendChild(script);
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

