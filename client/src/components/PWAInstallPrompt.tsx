import React, { useEffect, useState } from 'react';
import { X, Download, Smartphone } from 'lucide-react';
import { MobileButton } from './ui/mobile-button';
import { cn } from '../lib/utils';

export function PWAInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);

  useEffect(() => {
    const checkIOS = () => {
      const userAgent = window.navigator.userAgent.toLowerCase();
      const isIOSDevice = /iphone|ipad|ipod/.test(userAgent);
      const isSafari = /safari/.test(userAgent) && !/chrome/.test(userAgent);
      const isInStandaloneMode = ('standalone' in window.navigator) && 
        (window.navigator as any).standalone;
      
      setIsIOS(isIOSDevice && isSafari);
      setIsStandalone(
        window.matchMedia('(display-mode: standalone)').matches || 
        isInStandaloneMode
      );
    };

    checkIOS();

    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      
      const hasDeclinedInstall = localStorage.getItem('pwa-install-declined');
      const lastPromptTime = localStorage.getItem('pwa-install-prompt-time');
      const now = Date.now();
      
      if (!hasDeclinedInstall || 
          (lastPromptTime && now - parseInt(lastPromptTime) > 7 * 24 * 60 * 60 * 1000)) {
        setTimeout(() => setShowPrompt(true), 3000);
      }
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    
    const handleAppInstalled = () => {
      setDeferredPrompt(null);
      setShowPrompt(false);
    };
    
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    
    if (outcome === 'accepted') {
      console.log('User accepted the install prompt');
    } else {
      localStorage.setItem('pwa-install-declined', 'true');
      localStorage.setItem('pwa-install-prompt-time', Date.now().toString());
    }
    
    setDeferredPrompt(null);
    setShowPrompt(false);
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    localStorage.setItem('pwa-install-declined', 'true');
    localStorage.setItem('pwa-install-prompt-time', Date.now().toString());
  };

  if (isStandalone || (!showPrompt && !isIOS)) {
    return null;
  }

  if (isIOS && !isStandalone) {
    return (
      <div className={cn(
        "fixed bottom-4 left-4 right-4 z-50",
        "bg-white dark:bg-gray-800 rounded-lg shadow-xl",
        "p-4 border border-gray-200 dark:border-gray-700",
        "animate-in slide-in-from-bottom-5 duration-300",
        "sm:max-w-md sm:mx-auto"
      )}>
        <button
          onClick={() => setShowPrompt(false)}
          className="absolute top-2 right-2 p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
          aria-label="Close"
        >
          <X className="w-4 h-4 text-gray-500" />
        </button>
        
        <div className="flex items-start space-x-3">
          <div className="flex-shrink-0">
            <Smartphone className="w-8 h-8 text-blue-500" />
          </div>
          <div className="flex-1">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-1">
              Install EvoFit App
            </h3>
            <p className="text-xs text-gray-600 dark:text-gray-400 mb-3">
              To install: tap the share button <span className="inline-block w-4 h-4 align-middle">⬆️</span> and 
              select "Add to Home Screen"
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={cn(
      "fixed bottom-4 left-4 right-4 z-50",
      "bg-white dark:bg-gray-800 rounded-lg shadow-xl",
      "p-4 border border-gray-200 dark:border-gray-700",
      "animate-in slide-in-from-bottom-5 duration-300",
      "sm:max-w-md sm:mx-auto"
    )}>
      <button
        onClick={handleDismiss}
        className="absolute top-2 right-2 p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
        aria-label="Close"
      >
        <X className="w-4 h-4 text-gray-500" />
      </button>
      
      <div className="flex items-start space-x-3 mb-4">
        <div className="flex-shrink-0">
          <Download className="w-8 h-8 text-blue-500" />
        </div>
        <div className="flex-1">
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-1">
            Install EvoFit App
          </h3>
          <p className="text-xs text-gray-600 dark:text-gray-400">
            Install our app for a better experience with offline access and faster loading
          </p>
        </div>
      </div>
      
      <div className="flex space-x-2">
        <MobileButton
          onClick={handleInstall}
          size="sm"
          className="flex-1"
        >
          Install Now
        </MobileButton>
        <MobileButton
          onClick={handleDismiss}
          variant="outline"
          size="sm"
          className="flex-1"
        >
          Maybe Later
        </MobileButton>
      </div>
    </div>
  );
}