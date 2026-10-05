import React from 'react';
import { useOnlineStatus } from '../hooks/usePWAInstall';
import { WifiOff } from 'lucide-react';

export const OfflineIndicator: React.FC = () => {
  const isOnline = useOnlineStatus();

  if (isOnline) return null;

  return (
    <div className="fixed bottom-4 left-4 z-50 flex items-center gap-2 rounded-xl bg-amber-600 px-3.5 py-2 text-xs font-bold text-white shadow-xl border border-amber-400/40 animate-pulse">
      <WifiOff className="w-4 h-4" />
      <span>وضع عدم الاتصال — التطبيق يعمل محلياً من الذاكرة المؤقتة.</span>
    </div>
  );
};
