"use client";

import { useEffect, useState } from "react";

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

export default function PWAInstall() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [installed, setInstalled] = useState(false);

  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setShowPrompt(true);
    };

    window.addEventListener("beforeinstallprompt", handler);

    if (window.matchMedia("(display-mode: standalone)").matches) {
      setInstalled(true);
    }

    window.addEventListener("appinstalled", () => {
      setInstalled(true);
      setShowPrompt(false);
    });

    return () => {
      window.removeEventListener("beforeinstallprompt", handler);
    };
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === "accepted") {
      setShowPrompt(false);
      setDeferredPrompt(null);
    }
  };

  const handleDismiss = () => {
    setShowPrompt(false);
  };

  if (!showPrompt || installed) return null;

  return (
    <div className="fixed bottom-24 left-4 right-4 z-40 max-w-lg mx-auto">
      <div className="bg-emerald-600 text-white rounded-2xl p-4 shadow-lg animate-in slide-in-from-bottom-4 duration-300">
        <div className="flex items-start gap-3">
          <div className="text-2xl">📲</div>
          <div className="flex-1">
            <p className="font-semibold text-sm mb-1">Install Grocery Tracker</p>
            <p className="text-xs opacity-90 mb-3">Access offline & add to home screen</p>
            <div className="flex gap-2">
              <button
                onClick={handleInstall}
                className="bg-white text-emerald-600 px-3 py-1.5 rounded-lg text-xs font-semibold active:scale-95"
              >
                Install
              </button>
              <button
                onClick={handleDismiss}
                className="text-white border border-white px-3 py-1.5 rounded-lg text-xs font-semibold active:scale-95"
              >
                Not now
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
