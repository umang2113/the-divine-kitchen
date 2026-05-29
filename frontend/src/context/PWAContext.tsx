"use client";

import React, { createContext, useContext, useEffect, useState, ReactNode } from "react";

interface PWAContextType {
  isInstallable: boolean;
  installApp: () => Promise<void>;
}

const PWAContext = createContext<PWAContextType>({
  isInstallable: false,
  installApp: async () => {},
});

export const usePWA = () => useContext(PWAContext);

export const PWAProvider = ({ children }: { children: ReactNode }) => {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isInstallable, setIsInstallable] = useState(false);

  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      // Prevent the mini-infobar from appearing on mobile for everyone!
      e.preventDefault();
      // Stash the event so it can be triggered later.
      setDeferredPrompt(e);
      // Update UI to show that the app can be installed
      setIsInstallable(true);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    };
  }, []);

  const installApp = async () => {
    if (!deferredPrompt) return;

    // Show the install prompt
    deferredPrompt.prompt();

    // Wait for the user to respond to the prompt
    const { outcome } = await deferredPrompt.userChoice;
    
    if (outcome === "accepted") {
      console.log("User accepted the install prompt");
    } else {
      console.log("User dismissed the install prompt");
    }

    // We've used the prompt, and can't use it again, throw it away
    setDeferredPrompt(null);
    setIsInstallable(false);
  };

  return (
    <PWAContext.Provider value={{ isInstallable, installApp }}>
      {children}
    </PWAContext.Provider>
  );
};
