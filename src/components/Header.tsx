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
  Download
} from 'lucide-react';
import { PWAInstallModal } from './PWAInstallModal';

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
    financialMetrics
  } = useApp();

  const [notifOpen, setNotifOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [installModalOpen, setInstallModalOpen] = useState(false);
  const [currentTime, setCurrentTime] = useState<string>('');

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
    <header className="sticky top-0 z-40 bg-white border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Lab Branding */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-teal-800 flex items-center justify-center text-white shadow-sm font-bold text-xl tracking-wider">
              RT
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-lg text-slate-900 tracking-tight">
                  {language === 'ar' ? 'معامل RT للتشخيص والتحاليل الطبية' : 'RT Diagnostic Laboratories'}
                </span>
                <span className="hidden sm:inline-block text-xs font-semibold text-teal-800 bg-teal-50 px-2 py-0.5 rounded border border-teal-200">
                  {language === 'ar' ? 'المنظومة المالية والإدارية ERP' : 'Financial & ERP'}
                </span>
              </div>
              <div className="flex items-center gap-3 text-xs text-slate-500">
                <span>{language === 'ar' ? 'تحت إشراف: أ.د. رامي مختار' : 'Director: Prof. Dr. Rami Mokhtar'}</span>
                <span aria-hidden="true">·</span>
                <span className="font-mono text-slate-600">{currentTime}</span>
              </div>
            </div>
          </div>

          {/* Quick Metrics Bar (Desktop) */}
          <div className="hidden lg:flex items-center gap-6 text-xs text-slate-600 border-x border-slate-200 px-6">
            <div>
              <div className="text-slate-500 font-medium">{language === 'ar' ? 'تحصيل اليوم' : "Today's Income"}</div>
              <div className="text-sm font-bold text-emerald-700">
                {financialMetrics.todayIncome.toLocaleString()} {language === 'ar' ? 'ج.م' : 'EGP'}
              </div>
            </div>
            <div className="h-7 w-px bg-slate-200" />
            <div>
              <div className="text-slate-500 font-medium">{language === 'ar' ? 'صافي أرباح الشهر' : 'Net Profit'}</div>
              <div className="text-sm font-bold text-slate-900">
                {financialMetrics.netProfit.toLocaleString()} {language === 'ar' ? 'ج.م' : 'EGP'}
              </div>
            </div>
            <div className="h-7 w-px bg-slate-200" />
            <div>
              <div className="text-slate-500 font-medium">{language === 'ar' ? 'حصة المعمل / CEO' : 'Lab / CEO Split'}</div>
              <div className="text-xs font-semibold text-teal-800">
                {financialMetrics.labShare.toLocaleString()} / {financialMetrics.ceoShare.toLocaleString()}
              </div>
            </div>
          </div>

          {/* Action Tools & User Profile */}
          <div className="flex items-center gap-2 sm:gap-3">
            
            {/* Install PWA App Button */}
            <button
              onClick={() => setInstallModalOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold bg-teal-800 hover:bg-teal-900 text-white rounded-md transition-colors shadow-xs"
              title={language === 'ar' ? 'تنزيل وتثبيت البرنامج على الموبايل واللاب توب' : 'Install App on Mobile & Laptop'}
            >
              <Download className="w-4 h-4 text-teal-300" />
              <span className="hidden sm:inline">{language === 'ar' ? 'تثبيت التطبيق' : 'Install App'}</span>
            </button>

            {/* Quick Barcode Scanner Trigger */}
            <button
              onClick={() => setScannerOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-slate-900 text-white hover:bg-slate-800 rounded-md transition-colors"
              title={language === 'ar' ? 'فتح قارئ الباركود (كاميرا / ليزر)' : 'Open Barcode Scanner'}
            >
              <ScanLine className="w-4 h-4 text-teal-400" />
              <span className="hidden md:inline">{language === 'ar' ? 'قارئ الباركود' : 'Scan Barcode'}</span>
            </button>

            {/* Diagnostic System Live Sync Button */}
            <button
              onClick={async () => {
                await pullCasesFromDiagnostic();
              }}
              disabled={isSyncing}
              className={`p-2 rounded-md border text-xs font-medium flex items-center gap-1.5 transition-colors ${
                githubConfig.status === 'connected'
                  ? 'border-emerald-200 text-emerald-700 hover:bg-emerald-50'
                  : 'border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
              title={language === 'ar' ? 'مزامنة مع منظومة النتائج (GitHub)' : 'Sync with Diagnostic System'}
            >
              <RefreshCw className={`w-4 h-4 ${isSyncing ? 'animate-spin text-teal-600' : ''}`} />
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
                className="relative p-2 rounded-md text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
                title={language === 'ar' ? 'التنبيهات والإشعارات' : 'Notifications'}
              >
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                  <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-rose-600 rounded-full ring-2 ring-white" />
                )}
              </button>

              {notifOpen && (
                <div
                  className={`absolute mt-2 w-80 sm:w-96 bg-white rounded-lg shadow-xl border border-slate-200 py-2 z-50 ${
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
                              <Activity className="w-4 h-4 text-teal-600 shrink-0 mt-0.5" />
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
              className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-100 rounded-md transition-colors"
              title={language === 'ar' ? 'Switch to English' : 'التحويل للعربية'}
            >
              <Globe className="w-4 h-4 text-slate-500" />
              <span>{language === 'ar' ? 'EN' : 'عربي'}</span>
            </button>

            {/* User Profile / Switch Role */}
            <div className="relative">
              <button
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-slate-100 transition-colors border border-slate-200"
              >
                <div className={`w-7 h-7 rounded-md ${currentUser.avatarColor} text-white flex items-center justify-center text-xs font-bold`}>
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
                  className={`absolute mt-2 w-64 bg-white rounded-lg shadow-xl border border-slate-200 py-2 z-50 ${
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
    </header>
  );
};
