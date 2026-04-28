import { useEffect, useMemo, useState } from 'react';
import { Download, X } from 'lucide-react';

type InstallOutcome = 'accepted' | 'dismissed';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: InstallOutcome; platform: string }>;
}

const DISMISS_KEY = 'ops-deck-pwa-dismissed-until';
const DISMISS_FOR_MS = 7 * 24 * 60 * 60 * 1000;

function isStandaloneMode() {
  return window.matchMedia('(display-mode: standalone)').matches || (window.navigator as Navigator & { standalone?: boolean }).standalone === true;
}

export default function PWAInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [hidden, setHidden] = useState(false);

  const canShow = useMemo(() => {
    if (hidden || isStandaloneMode()) return false;

    const dismissedUntil = Number(localStorage.getItem(DISMISS_KEY) || 0);
    return Date.now() > dismissedUntil;
  }, [hidden]);

  useEffect(() => {
    const handleBeforeInstallPrompt = (event: Event) => {
      event.preventDefault();
      setDeferredPrompt(event as BeforeInstallPromptEvent);
    };

    const handleAppInstalled = () => {
      setDeferredPrompt(null);
      setHidden(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const dismiss = () => {
    localStorage.setItem(DISMISS_KEY, String(Date.now() + DISMISS_FOR_MS));
    setHidden(true);
  };

  const install = async () => {
    if (!deferredPrompt) return;

    await deferredPrompt.prompt();
    const result = await deferredPrompt.userChoice;

    if (result.outcome === 'accepted') {
      setHidden(true);
      localStorage.removeItem(DISMISS_KEY);
    }

    setDeferredPrompt(null);
  };

  if (!deferredPrompt || !canShow) return null;

  return (
    <section className="mb-4 rounded-xl border border-dashed border-[#7c5cfc]/45 bg-[#0a0a14]/70 px-4 py-3 shadow-[inset_0_0_0_1px_rgba(124,92,252,0.08)]">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-semibold text-white">Install Ops Deck</p>
          <p className="text-xs text-gray-400">Pin this dashboard to your home screen for a faster, app-like experience.</p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={dismiss}
            className="inline-flex items-center gap-1 rounded-lg border border-white/10 px-3 py-1.5 text-xs text-gray-300 transition hover:bg-white/5 hover:text-white"
          >
            <X size={14} />
            Dismiss
          </button>
          <button
            type="button"
            onClick={install}
            className="inline-flex items-center gap-1 rounded-lg border border-[#7c5cfc]/50 bg-[#7c5cfc]/20 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-[#7c5cfc]/30"
          >
            <Download size={14} />
            Install
          </button>
        </div>
      </div>
    </section>
  );
}
