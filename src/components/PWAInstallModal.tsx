import React, { useState } from 'react';
import { usePWAInstall } from '../hooks/usePWAInstall';
import { useApp } from '../context/AppContext';
import {
  Download,
  Smartphone,
  Laptop,
  Share2,
  PlusSquare,
  CheckCircle2,
  X,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  HardDrive
} from 'lucide-react';

interface PWAInstallModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PWAInstallModal: React.FC<PWAInstallModalProps> = ({ isOpen, onClose }) => {
  const { isInstalled, isIOS, hasNativePrompt, install } = usePWAInstall();
  const { language } = useApp();
  const [activeDeviceTab, setActiveDeviceTab] = useState<'laptop' | 'android' | 'ios'>('laptop');
  const [installSuccess, setInstallSuccess] = useState(false);

  if (!isOpen) return null;

  const handleInstallClick = async () => {
    const success = await install();
    if (success) {
      setInstallSuccess(true);
      setTimeout(() => {
        setInstallSuccess(false);
        onClose();
      }, 2500);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-lg w-full my-auto overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-slate-950 via-[#4c0519] to-[#0f172a] text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/10 backdrop-blur-xs flex items-center justify-center text-amber-400 font-bold border border-white/20">
              <Download className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <h3 className="font-extrabold text-base leading-tight">
                {language === 'ar' ? 'تنزيل برنامج معمل RT كتطبيق' : 'Install RT Lab App'}
              </h3>
              <p className="text-xs text-rose-200/90 mt-0.5">
                {language === 'ar' ? 'يعمل كتطبيق أصلي على الكمبيوتر والموبايل' : 'Install on Laptop, Android & iPhone'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-white/70 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5">
          
                    {/* Differentiated Icon Notice */}
          <div className="flex items-center gap-3 p-3 bg-gradient-to-r from-rose-50 to-amber-50 border border-rose-200 rounded-xl">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#881337] to-[#0f172a] p-1 border-2 border-amber-400 shadow-md shrink-0 flex items-center justify-center text-white font-black text-xs font-mono">
              <span className="text-amber-300">RT</span> <span className="text-[9px] text-white">ERP</span>
            </div>
            <div>
              <div className="text-xs font-extrabold text-slate-900 flex items-center gap-1.5">
                <span>أيقونة المنظومة المالية والخزينة (RT Financial)</span>
                <span className="px-1.5 py-0.2 bg-amber-400 text-rose-950 text-[9px] font-black rounded">حسابات</span>
              </div>
              <p className="text-[11px] text-slate-600 mt-0.5 leading-tight">
                تم تمييز الأيقونة باللون الأحمر الداكن والدرع الذهبي (🪙) للتفرقة التامة عند التثبيت عن منظومة النتائج الطبية.
              </p>
            </div>
          </div>

          {/* Device Type Segmented Tabs */}
          <div className="flex bg-slate-100 p-1 rounded-xl text-xs font-bold">
            <button
              type="button"
              onClick={() => setActiveDeviceTab('laptop')}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg transition-colors ${
                activeDeviceTab === 'laptop'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Laptop className="w-4 h-4 text-rose-900" />
              <span>{language === 'ar' ? 'اللاب توب / الكمبيوتر' : 'Laptop / PC'}</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveDeviceTab('android')}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg transition-colors ${
                activeDeviceTab === 'android'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Smartphone className="w-4 h-4 text-emerald-700" />
              <span>{language === 'ar' ? 'أندرويد (Android)' : 'Android'}</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveDeviceTab('ios')}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg transition-colors ${
                activeDeviceTab === 'ios'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Smartphone className="w-4 h-4 text-blue-700" />
              <span>{language === 'ar' ? 'آيفون (iPhone)' : 'iPhone (iOS)'}</span>
            </button>
          </div>

          {/* TAB 1: LAPTOP / PC INSTRUCTIONS */}
          {activeDeviceTab === 'laptop' && (
            <div className="space-y-4">
              <div className="bg-rose-50 border border-rose-200 rounded-xl p-4 text-xs text-rose-950 space-y-2">
                <div className="font-bold flex items-center gap-2 text-sm text-slate-950">
                  <Laptop className="w-4 h-4 text-rose-900" />
                  <span>تثبيت البرنامج على نظام ويندوز أو ماك (Windows / macOS):</span>
                </div>
                <p className="text-slate-600 leading-relaxed text-xs">
                  يتم تثبيت المنظومة كنافذة تطبيق مستقلة بدون شريط أدوات المتصفح، مع وضع أيقونة رسمية على سطح المكتب وقائمة Start لسهولة الفتح اليومي بالمعمل.
                </p>
              </div>

              {hasNativePrompt ? (
                <button
                  type="button"
                  onClick={handleInstallClick}
                  className="w-full py-3 px-4 bg-rose-900 hover:bg-rose-800 text-white font-black text-sm rounded-xl transition-all shadow-md flex items-center justify-center gap-2 hover:shadow-lg"
                >
                  <Download className="w-5 h-5 text-amber-400" />
                  <span>تثبيت التطبيق على جهاز الكمبيوتر الآن بنقرة واحدة</span>
                </button>
              ) : (
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-xs space-y-2.5">
                  <div className="font-bold text-slate-900">طريقة التثبيت المباشرة من المتصفح (Chrome / Edge / Brave):</div>
                  <ol className="list-decimal list-inside space-y-2 text-slate-600 leading-relaxed pr-1">
                    <li>
                      انظر إلى <strong>شريط عنوان المتصفح في الأعلى</strong> (Address Bar بجانب رابط الموقع).
                    </li>
                    <li>
                      ستجد أيقونة صغيرة على شكل <strong>كمبيوتر مع سهم لأسفل</strong> أو علامة <strong>(Install App / تثبيت)</strong>.
                    </li>
                    <li>
                      اضغط عليها ثم اختر <strong>تثبيت (Install)</strong> وسيتم تثبيت البرنامج على اللاب توب فوراً.
                    </li>
                  </ol>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: ANDROID MOBILE INSTRUCTIONS */}
          {activeDeviceTab === 'android' && (
            <div className="space-y-4">
              <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 text-xs text-emerald-950 space-y-2">
                <div className="font-bold flex items-center gap-2 text-sm text-emerald-900">
                  <Smartphone className="w-4 h-4 text-emerald-700" />
                  <span>تثبيت التطبيق على هواتف سامسونج، شاومي، وأندرويد:</span>
                </div>
                <p className="text-slate-600 leading-relaxed text-xs">
                  يعمل البرنامج كتطبيق APK / WebApp مثبت على شاشة الموبايل الرئيسية وشاشة التطبيقات، مع فتح الشاشة بالكامل بدون متصفح.
                </p>
              </div>

              {hasNativePrompt ? (
                <button
                  type="button"
                  onClick={handleInstallClick}
                  className="w-full py-3 px-4 bg-emerald-700 hover:bg-emerald-800 text-white font-black text-sm rounded-xl transition-all shadow-md flex items-center justify-center gap-2"
                >
                  <Download className="w-5 h-5" />
                  <span>تنزيل وإضافة التطبيق للشاشة الرئيسية</span>
                </button>
              ) : (
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-xs space-y-2.5">
                  <div className="font-bold text-slate-900">خطوات التثبيت عبر متصفح Chrome في الموبايل:</div>
                  <ol className="list-decimal list-inside space-y-2 text-slate-600 leading-relaxed pr-1">
                    <li>افتح القائمة الرئيسية للمتصفح بالضغط على <strong>الثلاث نقاط (⋮)</strong> في أعلى الزاوية.</li>
                    <li>اضغط على خيار <strong>"تثبيت التطبيق" (Install app)</strong> أو <strong>"الإضافة إلى الشاشة الرئيسية" (Add to Home screen)</strong>.</li>
                    <li>اضغط <strong>"تثبيت" (Install)</strong>، وستجد أيقونة معمل RT ظهرت فوراً بين تطبيقات هاتفك.</li>
                  </ol>
                </div>
              )}
            </div>
          )}

          {/* TAB 3: IPHONE / IPAD INSTRUCTIONS */}
          {activeDeviceTab === 'ios' && (
            <div className="space-y-4">
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-xs text-blue-950 space-y-2">
                <div className="font-bold flex items-center gap-2 text-sm text-blue-900">
                  <Smartphone className="w-4 h-4 text-blue-700" />
                  <span>تثبيت التطبيق على أجهزة آيفون وآيباد (iOS Safari):</span>
                </div>
                <p className="text-slate-600 leading-relaxed text-xs">
                  نظام أبل iOS يدعم تثبيت التطبيق مباشرة عبر متصفح Safari بدون الحاجة إلى متجر App Store.
                </p>
              </div>

              <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-xs space-y-3">
                <div className="font-bold text-slate-900">اتبع الخطوات البسيطة التالية في متصفح Safari:</div>
                <div className="space-y-2.5 text-slate-700">
                  <div className="flex items-start gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-800 font-bold flex items-center justify-center shrink-0 text-xs">1</span>
                    <div>اضغط على زر <strong>المشاركة (Share)</strong> في أسفل شاشة المتصفح (أيقونة المربع الذي يخرج منه سهم للأعلى <Share2 className="w-3.5 h-3.5 inline mx-1 text-blue-600" />).</div>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-800 font-bold flex items-center justify-center shrink-0 text-xs">2</span>
                    <div>مرر القائمة لأسفل ثم اضغط على <strong>"إضافة إلى الصفحة الرئيسية" (Add to Home Screen <PlusSquare className="w-3.5 h-3.5 inline mx-1 text-slate-800" />)</strong>.</div>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-800 font-bold flex items-center justify-center shrink-0 text-xs">3</span>
                    <div>اضغط على زر <strong>"إضافة" (Add)</strong> في أعلى الزاوية. سيظهر تطبيق معمل RT فوراً على شاشة هاتفك الرئيسية.</div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Advantages of Installing */}
          <div className="pt-2 border-t border-slate-100 grid grid-cols-3 gap-2 text-center text-[11px] text-slate-500">
            <div className="p-2 bg-slate-50 rounded-lg">
              <Sparkles className="w-4 h-4 mx-auto text-rose-900 mb-1" />
              <div className="font-bold text-slate-800">شاشة كاملة</div>
              <div>بدون شريط المتصفح</div>
            </div>
            <div className="p-2 bg-slate-50 rounded-lg">
              <HardDrive className="w-4 h-4 mx-auto text-rose-900 mb-1" />
              <div className="font-bold text-slate-800">سرعة فائقة</div>
              <div>تخزين محلي فوري</div>
            </div>
            <div className="p-2 bg-slate-50 rounded-lg">
              <ShieldCheck className="w-4 h-4 mx-auto text-rose-900 mb-1" />
              <div className="font-bold text-slate-800">حفظ تلقائي</div>
              <div>تشفير ومزامنة سحابية</div>
            </div>
          </div>

          {installSuccess && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold rounded-xl text-center flex items-center justify-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>تم تثبيت التطبيق بنجاح! يمكنك الآن فتحه مباشرة من الشاشة الرئيسية.</span>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};
