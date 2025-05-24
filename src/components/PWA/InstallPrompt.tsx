
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { X, Download } from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
    platform: string;
  }>;
  prompt(): Promise<void>;
}

export const InstallPrompt = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showPrompt, setShowPrompt] = useState(false);

  useEffect(() => {
    const handler = (e: BeforeInstallPromptEvent) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowPrompt(true);
    };

    window.addEventListener('beforeinstallprompt', handler as EventListener);

    return () => {
      window.removeEventListener('beforeinstallprompt', handler as EventListener);
    };
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    
    if (outcome === 'accepted') {
      setDeferredPrompt(null);
      setShowPrompt(false);
    }
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    setDeferredPrompt(null);
  };

  if (!showPrompt || !deferredPrompt) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 bg-white border border-gray-200 rounded-lg shadow-lg p-4 z-50 md:hidden">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <h3 className="font-medium text-sm text-gray-900 mb-1">
            安裝 LURE CRM
          </h3>
          <p className="text-xs text-gray-600 mb-3">
            安裝到主畫面，享受更好的使用體驗
          </p>
          <div className="flex space-x-2">
            <Button size="sm" onClick={handleInstall} className="bg-indigo-600 hover:bg-indigo-700">
              <Download className="w-4 h-4 mr-1" />
              安裝
            </Button>
            <Button variant="outline" size="sm" onClick={handleDismiss}>
              稍後
            </Button>
          </div>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleDismiss}
          className="p-1 h-auto ml-2"
        >
          <X className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
};
