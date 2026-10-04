import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import {
  Activity,
  ScanLine,
  Bell,
  Globe,
  User,
  LogOut,
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
  Lock,
  ChevronDown,
  Download,
  CreditCard,
  FlaskConical,
  PhoneCall,
  MapPin,
  Building2,
  X
} from 'lucide-react';
import { RTLogo } from './RTLogo';
import { PWAInstallModal } from './PWAInstallModal';
import { TestCatalogManagerModal } from './TestCatalogManagerModal';

export const Header: React.FC = () => {
  const {
    language,
    setLanguage,
    currentUser,
    setLoginModalOpen,
    logout,
    notifications,
    markNotificationRead,
    clearAllNotifications,
    setScannerOpen,
    setActiveTab,
    githubConfig,
    pullCasesFromDiagnostic,
    isSyncing,
    financialMetrics,
    labInfo,
    updateLabInfo
  } = useApp();

  const [notifOpen, setNotifOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [installModalOpen, setInstallModalOpen] = useState(false);
  const [catalogModalOpen, setCatalogModalOpen] = useState(false);
  const [currentTime, setCurrentTime] = useState<string>('');
  const [isContactModalOpen, setIsContactModalOpen] = useState(false);
  const [contactForm, setContactForm] = useState({
    labNameAr: labInfo?.labNameAr || "معامل RT للتحاليل الطبية والتشخيصية",
    hotline: labInfo?.hotline || "01012345678",
    phone: labInfo?.phone || "0244667788",
    whatsapp: labInfo?.whatsapp || "01012345678",
    mainAddress: labInfo?.mainAddress || "ميدان بهتيم برج صيدليه العزبى الدور الثالث امام الأسانسير شبرا الخيمه",
    vodafoneCash: labInfo?.vodafoneCash || "01098765432",
    instapay: labInfo?.instapay || "ramirtlab@instapay"
  });

  const handleSaveLabContactInfo = (e: React.FormEvent) => {
    e.preventDefault();
    updateLabInfo(contactForm);
    setIsContactModalOpen(false);
    alert('✅ تم حفظ وتحديث أرقام التواصل وعنوان المعمل بنجاح في جميع الفواتير والكروت!');
  };


  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(
        now.toLocaleTimeString(language === 'ar' ? 'ar-EG' : 'en-US', {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hour12: true
        })
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, [language]);

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-slate-200 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-18">
          {/* RT Lab Branding with Official RTLogo */}
          <div className="flex items-center gap-3">
            <RTLogo size="sm" showSlogan={false} theme="light" />
            <div className="hidden md:block">
              <span className="text-[10px] font-extrabold text-rose-900 bg-rose-50 px-2 py-0.5 rounded-md border border-rose-200">
                المنظومة المالية والفوترة ERP
              </span>
              <div className="text-[11px] text-slate-500 font-mono mt-0.5">{currentTime}</div>
            </div>
          </div>

          {/* Quick Metrics Bar (Desktop) */}
          <div className="hidden xl:flex items-center gap-6 text-xs text-slate-600 border-x border-slate-200 px-6">
            <div>
              <div className="text-slate-500 font-medium">{language === 'ar' ? 'تحصيل اليوم' : "Today's Income"}</div>
              <div className="text-sm font-black text-rose-900 font-mono">
                {financialMetrics.todayIncome.toLocaleString()} {language === 'ar' ? 'ج.م' : 'EGP'}
              </div>
            </div>
            <div className="h-7 w-px bg-slate-200" />
            <div>
              <div className="text-slate-500 font-medium">{language === 'ar' ? 'صافي أرباح الشهر' : 'Net Profit'}</div>
              <div className="text-sm font-black text-blue-900 font-mono">
                {financialMetrics.netProfit.toLocaleString()} {language === 'ar' ? 'ج.م' : 'EGP'}
              </div>
            </div>
            <div className="h-7 w-px bg-slate-200" />
            <div>
              <div className="text-slate-500 font-medium">{language === 'ar' ? 'حصة المعمل / CEO' : 'Lab / CEO Split'}</div>
              <div className="text-xs font-black text-slate-900 font-mono">
                {financialMetrics.labShare.toLocaleString()} / {financialMetrics.ceoShare.toLocaleString()}
              </div>
            </div>
          </div>

          {/* Action Tools & User Profile */}
          <div className="flex items-center gap-2 sm:gap-2.5">
                        {/* Lab Contact & Address Quick Editor */}
            <button
              onClick={() => {
                setContactForm({
                  labNameAr: labInfo?.labNameAr || "معامل RT للتحاليل الطبية والتشخيصية",
                  hotline: labInfo?.hotline || "01012345678",
                  phone: labInfo?.phone || "0244667788",
                  whatsapp: labInfo?.whatsapp || "01012345678",
                  mainAddress: labInfo?.mainAddress || "ميدان بهتيم برج صيدليه العزبى الدور الثالث امام الأسانسير شبرا الخيمه",
                  vodafoneCash: labInfo?.vodafoneCash || "01098765432",
                  instapay: labInfo?.instapay || "ramirtlab@instapay"
                });
                setIsContactModalOpen(true);
              }}
              className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-bold bg-amber-50 hover:bg-amber-100 text-amber-900 rounded-lg transition-colors border border-amber-200 cursor-pointer"
              title="تعديل أرقام التواصل وعنوان المعمل الرسمي"
            >
              <PhoneCall className="w-3.5 h-3.5 text-amber-700" />
              <span className="hidden lg:inline">بيانات التواصل والعنوان</span>
            </button>
            {/* Catalog Manager Quick Trigger */}
            <button
              onClick={() => setCatalogModalOpen(true)}
              className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg transition-colors border border-slate-200"
              title="كتالوج الفحوصات والأسعار"
            >
              <FlaskConical className="w-3.5 h-3.5 text-rose-700" />
              <span className="hidden lg:inline">الكتالوج (165+)</span>
            </button>

            {/* Install PWA App Button */}
            <button
              onClick={() => setInstallModalOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-extrabold bg-gradient-to-r from-rose-900 to-rose-800 hover:from-rose-800 hover:to-rose-700 text-white rounded-lg transition-all shadow-sm active:scale-95"
              title={language === 'ar' ? 'تنزيل وتثبيت منظومة RT Financial على جهازك' : 'Install RT Financial App'}
            >
              <Download className="w-3.5 h-3.5 text-amber-300" />
              <span className="hidden sm:inline">{language === 'ar' ? 'تثبيت البرنامج' : 'Install App'}</span>
            </button>

            {/* Quick Barcode Scanner Trigger */}
            <button
              onClick={() => setScannerOpen(true)}
              className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold bg-slate-900 text-white hover:bg-slate-800 rounded-lg transition-colors"
              title={language === 'ar' ? 'فتح قارئ الباركود (كاميرا / ليزر)' : 'Open Barcode Scanner'}
            >
              <ScanLine className="w-3.5 h-3.5 text-rose-400" />
              <span className="hidden sm:inline">{language === 'ar' ? 'الباركود' : 'Scan'}</span>
            </button>

            {/* GitHub Sync Quick Button */}
            <button
              onClick={() => pullCasesFromDiagnostic()}
              disabled={isSyncing}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold rounded-lg border transition-colors ${
                githubConfig.status === 'connected'
                  ? 'border-blue-200 text-blue-900 bg-blue-50 hover:bg-blue-100'
                  : 'border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
              title={language === 'ar' ? 'مزامنة مع منظومة النتائج (GitHub)' : 'Sync with Diagnostic System'}
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin text-rose-600' : 'text-blue-700'}`} />
              <span className="hidden xl:inline">
                {isSyncing
                  ? (language === 'ar' ? 'جارِ المزامنة...' : 'Syncing...')
                  : (language === 'ar' ? 'تسميع النتائج' : 'Sync Diag')}
              </span>
            </button>

            {/* Notifications Popover */}
            <div className="relative">
              <button
                onClick={() => setNotifOpen(!notifOpen)}
                className="relative p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
                title={language === 'ar' ? 'التنبيهات والإشعارات' : 'Notifications'}
              >
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                  <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-rose-600 rounded-full ring-2 ring-white" />
                )}
              </button>

              {notifOpen && (
                <div
                  className={`absolute mt-2 w-80 sm:w-96 bg-white rounded-xl shadow-xl border border-slate-200 py-2 z-50 ${
                    language === 'ar' ? 'left-0 sm:left-auto sm:right-0' : 'right-0 sm:right-auto sm:left-0'
                  }`}
                >
                  <div className="flex items-center justify-between px-4 py-2 border-b border-slate-100">
                    <span className="font-bold text-sm text-slate-900">
                      {language === 'ar' ? 'التنبيهات الآلية' : 'System Alerts'} ({notifications.length})
                    </span>
                    {notifications.length > 0 && (
                      <button
                        onClick={clearAllNotifications}
                        className="text-xs text-slate-400 hover:text-slate-600 font-medium"
                      >
                        {language === 'ar' ? 'مسح الكل' : 'Clear All'}
                      </button>
                    )}
                  </div>
                  <div className="max-h-80 overflow-y-auto divide-y divide-slate-100">
                    {notifications.length === 0 ? (
                      <div className="py-8 text-center text-xs text-slate-400">
                        {language === 'ar' ? 'لا توجد تنبيهات حالية' : 'No active notifications'}
                      </div>
                    ) : (
                      notifications.map(n => (
                        <div
                          key={n.id}
                          onClick={() => {
                            markNotificationRead(n.id);
                            if (n.targetTab) {
                              setActiveTab(n.targetTab);
                              setNotifOpen(false);
                            }
                          }}
                          className={`p-3 text-xs cursor-pointer hover:bg-slate-50 transition-colors ${
                            n.read ? 'opacity-75' : 'bg-slate-50/50'
                          }`}
                        >
                          <div className="flex items-start gap-2">
                            {n.type === 'danger' ? (
                              <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                            ) : n.type === 'warning' ? (
                              <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                            ) : (
                              <Activity className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                            )}
                            <div className="flex-1">
                              <div className="font-semibold text-slate-900">{n.title}</div>
                              <p className="text-slate-600 mt-0.5 leading-relaxed">{n.message}</p>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Language Switcher */}
            <button
              onClick={() => setLanguage(language === 'ar' ? 'en' : 'ar')}
              className="flex items-center gap-1 px-2 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
              title={language === 'ar' ? 'Switch to English' : 'التحويل للعربية'}
            >
              <Globe className="w-4 h-4 text-slate-500" />
              <span>{language === 'ar' ? 'EN' : 'عربي'}</span>
            </button>

            {/* User Profile / Switch Role */}
            <div className="relative">
              <button
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className="flex items-center gap-2 p-1.5 rounded-xl hover:bg-slate-100 transition-colors border border-slate-200"
              >
                <div className={`w-7 h-7 rounded-lg ${currentUser.avatarColor} text-white flex items-center justify-center text-xs font-bold shadow-xs`}>
                  {currentUser.nameAr.charAt(0)}
                </div>
                <div className="hidden sm:block text-right">
                  <div className="text-xs font-bold text-slate-900 leading-tight">
                    {language === 'ar' ? currentUser.nameAr : currentUser.nameEn}
                  </div>
                  <div className="text-[10px] text-slate-500">
                    {currentUser.role === 'admin_ceo' ? (language === 'ar' ? 'المدير التنفيذي (CEO)' : 'CEO / Director') : 
                     currentUser.role === 'accountant' ? (language === 'ar' ? 'محاسب / خزينة' : 'Accountant') : 
                     currentUser.role === 'lab_tech' ? (language === 'ar' ? 'فني معمل ومخزن' : 'Lab Chemist') : 
                     (language === 'ar' ? 'شؤون موظفين' : 'HR Officer')}
                  </div>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </button>

              {userMenuOpen && (
                <div
                  className={`absolute mt-2 w-64 bg-white rounded-xl shadow-xl border border-slate-200 py-2 z-50 ${
                    language === 'ar' ? 'left-0' : 'right-0'
                  }`}
                >
                  <div className="px-4 py-2 border-b border-slate-100">
                    <div className="text-xs font-bold text-slate-900">{language === 'ar' ? currentUser.nameAr : currentUser.nameEn}</div>
                    <div className="text-xs text-slate-500">{language === 'ar' ? currentUser.titleAr : currentUser.titleEn}</div>
                  </div>
                  <button
                    onClick={() => {
                      setUserMenuOpen(false);
                      setLoginModalOpen(true);
                    }}
                    className="w-full flex items-center gap-2.5 px-4 py-2 text-xs text-slate-700 hover:bg-slate-50 text-right"
                  >
                    <Lock className="w-4 h-4 text-slate-400" />
                    <span>{language === 'ar' ? 'تبديل المستخدم أو تسجيل الدخول بالـ PIN' : 'Switch User / Enter PIN'}</span>
                  </button>
                  <button
                    onClick={() => {
                      setUserMenuOpen(false);
                      logout();
                    }}
                    className="w-full flex items-center gap-2.5 px-4 py-2 text-xs text-rose-600 hover:bg-rose-50 text-right"
                  >
                    <LogOut className="w-4 h-4 text-rose-500" />
                    <span>{language === 'ar' ? 'تسجيل الخروج والتحويل للخزينة' : 'Logout to Cashier'}</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* PWA Install Modal */}
      <PWAInstallModal
        isOpen={installModalOpen}
        onClose={() => setInstallModalOpen(false)}
      />

      {/* Test Catalog Manager Modal */}
      <TestCatalogManagerModal
        isOpen={catalogModalOpen}
        onClose={() => setCatalogModalOpen(false)}
      />
      {/* Contact & Address Modal */}
      {isContactModalOpen && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl text-right animate-in fade-in zoom-in-95 duration-200 border border-slate-200 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 mb-4">
              <div className="flex items-center gap-2">
                <Building2 className="w-5 h-5 text-rose-800" />
                <h3 className="font-bold text-slate-800 text-sm sm:text-base">تعديل أرقام التواصل وعنوان المعمل</h3>
              </div>
              <button onClick={() => setIsContactModalOpen(false)} className="text-slate-400 hover:text-slate-600 p-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveLabContactInfo} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-slate-700 font-bold mb-1">اسم المعمل الرسمي:</label>
                <input
                  type="text"
                  value={contactForm.labNameAr}
                  onChange={e => setContactForm({ ...contactForm, labNameAr: e.target.value })}
                  className="w-full p-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-rose-500 font-bold"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">الخط الساخن (Hotline):</label>
                  <input
                    type="text"
                    value={contactForm.hotline}
                    onChange={e => setContactForm({ ...contactForm, hotline: e.target.value })}
                    className="w-full p-2.5 border border-slate-300 rounded-xl font-mono text-rose-900 font-bold"
                    placeholder="01012345678"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-bold mb-1">هاتف الطوارئ والواتساب:</label>
                  <input
                    type="text"
                    value={contactForm.whatsapp}
                    onChange={e => setContactForm({ ...contactForm, whatsapp: e.target.value })}
                    className="w-full p-2.5 border border-slate-300 rounded-xl font-mono font-bold"
                    placeholder="01012345678"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">الهاتف الأرضي / الاستقبال:</label>
                <input
                  type="text"
                  value={contactForm.phone}
                  onChange={e => setContactForm({ ...contactForm, phone: e.target.value })}
                  className="w-full p-2.5 border border-slate-300 rounded-xl font-mono"
                  placeholder="0244667788"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">العنوان والمقر الرئيسي للمعمل:</label>
                <textarea
                  rows={2}
                  value={contactForm.mainAddress}
                  onChange={e => setContactForm({ ...contactForm, mainAddress: e.target.value })}
                  className="w-full p-2.5 border border-slate-300 rounded-xl text-slate-800"
                  placeholder="ميدان بهتيم برج صيدلية العزبي الدور الثالث شبرا الخيمة"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">فودافون كاش للمعمل:</label>
                  <input
                    type="text"
                    value={contactForm.vodafoneCash}
                    onChange={e => setContactForm({ ...contactForm, vodafoneCash: e.target.value })}
                    className="w-full p-2.5 border border-slate-300 rounded-xl font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-bold mb-1">حساب إنستاباي InstaPay:</label>
                  <input
                    type="text"
                    value={contactForm.instapay}
                    onChange={e => setContactForm({ ...contactForm, instapay: e.target.value })}
                    className="w-full p-2.5 border border-slate-300 rounded-xl font-mono"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsContactModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-rose-900 hover:bg-rose-800 text-white font-bold rounded-xl shadow-sm"
                >
                  حفظ وتطبيق التعديلات ✓
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </header>
  );
};
