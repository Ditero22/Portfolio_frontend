export type GoogleCredentialResponse = {
  credential: string;
};

type GoogleButtonOptions = {
  theme?: "outline" | "filled_blue" | "filled_black";
  size?: "large" | "medium" | "small";
  shape?: "rectangular" | "pill" | "circle" | "square";
  text?: "signin_with" | "signup_with" | "continue_with" | "signin";
  width?: string | number;
};

export type GoogleIdentityApi = {
  initialize: (options: {
    client_id: string;
    nonce: string;
    callback: (response: GoogleCredentialResponse) => void;
    auto_select?: boolean;
    cancel_on_tap_outside?: boolean;
  }) => void;
  renderButton: (element: HTMLElement, options: GoogleButtonOptions) => void;
};

declare global {
  interface Window {
    google?: {
      accounts: {
        id: GoogleIdentityApi;
      };
    };
  }
}

let googleScriptPromise: Promise<GoogleIdentityApi> | null = null;

export function loadGoogleIdentity() {
  if (window.google?.accounts.id) {
    return Promise.resolve(window.google.accounts.id);
  }

  if (googleScriptPromise) return googleScriptPromise;

  googleScriptPromise = new Promise<GoogleIdentityApi>((resolve, reject) => {
    const script = document.createElement("script");
    script.src = "https://accounts.google.com/gsi/client";
    script.async = true;
    script.defer = true;
    script.onload = () => {
      if (window.google?.accounts.id) {
        resolve(window.google.accounts.id);
      } else {
        googleScriptPromise = null;
        reject(new Error("Google verification could not be loaded."));
      }
    };
    script.onerror = () => {
      googleScriptPromise = null;
      reject(new Error("Google verification could not be loaded."));
    };
    document.head.append(script);
  });

  return googleScriptPromise;
}
