import React, { useState } from 'react';
import { usePWAInstall } from '../hooks/usePWAInstall';
import { Download, Smartphone, Laptop, Check, X, Share } from 'lucide-react';

export const PWAInstallButton: React.FC = () => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showGuide, setShowGuide] = useState(false);

  // If already running as an installed standalone PWA app, hide button
  if (isInstalled) {
    return (
      <div className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-950/40 border border-emerald-500/30 rounded-lg text-emerald-400 text-xs font-semibold">
        <Check className="w-3.5 h-3.5" />
        <span>تطبيق مثبت</span>
      </div>
    );
  }

  const handleInstallClick = async () => {
    if (isInstallable) {
      await install();
    } else {
      setShowGuide(true);
    }
  };

  return (
    <>
      <button
        onClick={handleInstallClick}
        className="flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-rose-800 to-red-700 hover:from-rose-700 hover:to-red-600 text-white rounded-lg text-xs font-bold shadow-md hover:shadow-lg transition-all active:scale-95 border border-rose-600/40"
        title="تثبيت RT LAB كتطبيق على الموبايل أو اللابتوب"
      >
        <Download className="w-3.5 h-3.5 animate-bounce" />
        <span>تثبيت التطبيق (موبايل / لابتوب)</span>
      </button>

      {/* Installation Guide Modal (for iOS or manual browser install) */}
      {showGuide && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4">
          <div className="w-full max-w-md rounded-2xl bg-slate-900 border border-slate-700 p-6 shadow-2xl text-right text-white">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-rose-900 flex items-center justify-center">
                  <Download className="w-4 h-4 text-white" />
                </div>
                <h3 className="text-base font-bold text-white">تثبيت تطبيق معامل RT</h3>
              </div>
              <button
                onClick={() => setShowGuide(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 text-xs text-slate-300">
              {/* Mobile (Android & iPhone) */}
              <div className="bg-slate-800/80 p-3.5 rounded-xl border border-slate-700/60">
                <div className="flex items-center gap-2 font-bold text-rose-300 mb-2">
                  <Smartphone className="w-4 h-4" />
                  <span>على الموبايل (أندرويد وآيفون):</span>
                </div>
                {isIOS ? (
                  <ol className="list-decimal list-inside space-y-1.5 text-slate-300">
                    <li>اضغط على زر <strong>المشاركة (Share <Share className="w-3 h-3 inline text-blue-400" />)</strong> أسفل متصفح Safari.</li>
                    <li>مرر للأسفل واختر <strong>"إضافة إلى الشاشة الرئيسية" (Add to Home Screen)</strong>.</li>
                    <li>اضغط على <strong>"إضافة" (Add)</strong> بالأعلى ليظهر التطبيق في شاشة تطبيقاتك.</li>
                  </ol>
                ) : (
                  <ol className="list-decimal list-inside space-y-1.5 text-slate-300">
                    <li>اضغط على قائمة الثلاث نقاط <strong>(⋮)</strong> بأعلى يمين متصفح Chrome.</li>
                    <li>اختر <strong>"تثبيت التطبيق" (Install App)</strong> أو <strong>"إضافة للشاشة الرئيسية"</strong>.</li>
                    <li>سيتم تثبيت أيقونة التطبيق على هاتفك ويعمل بدون شريط المتصفح مثل أي تطبيق أصلي!</li>
                  </ol>
                )}
              </div>

              {/* Laptop & PC */}
              <div className="bg-slate-800/80 p-3.5 rounded-xl border border-slate-700/60">
                <div className="flex items-center gap-2 font-bold text-blue-300 mb-2">
                  <Laptop className="w-4 h-4" />
                  <span>على اللابتوب والكمبيوتر (Windows / Mac):</span>
                </div>
                <ol className="list-decimal list-inside space-y-1.5 text-slate-300">
                  <li>في متصفح Chrome أو Edge، ستجد أيقونة تثبيت صغيرة <strong>(⤓)</strong> بجانب شريط الرابط بالأعلى.</li>
                  <li>اضغط عليها ثم اختر <strong>"تثبيت" (Install)</strong>.</li>
                  <li>سيفتح البرنامج في نافذة مستقلة ويُضاف اختصار له على سطح المكتب وشريط المهام Taskbar.</li>
                </ol>
              </div>

              <div className="bg-emerald-950/40 border border-emerald-500/30 p-2.5 rounded-lg text-emerald-300 text-center text-[11px]">
                ⚡ بعد التثبيت، يفتح التطبيق مباشرة بملء الشاشة بدون شريط المتصفح وبأعلى سرعة ممكنة.
              </div>
            </div>

            <button
              onClick={() => setShowGuide(false)}
              className="mt-5 w-full rounded-xl bg-slate-800 hover:bg-slate-700 py-2.5 text-xs font-bold text-white transition-colors"
            >
              فهمت، حسناً
            </button>
          </div>
        </div>
      )}
    </>
  );
};
