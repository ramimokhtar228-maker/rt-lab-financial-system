import React from 'react';
import { useApp } from '../context/AppContext';
import {
  LayoutDashboard,
  Receipt,
  PieChart,
  FlaskConical,
  Users,
  Network,
  BarChart3,
  GitBranch,
  ShieldCheck,
  Settings,
  CreditCard,
  Building2,
  ChevronDown
} from 'lucide-react';

export const Navigation: React.FC = () => {
  const {
    activeTab,
    setActiveTab,
    language,
    hasPermission,
    inventory,
    labToLabOrders,
    incomeRecords,
    loyaltyProfiles
  } = useApp();

  const [isMoreOpen, setIsMoreOpen] = React.useState(false);

  const lowStockCount = inventory.filter(i => i.currentQuantity <= i.minThreshold).length;
  const pendingL2LCount = labToLabOrders.filter(o => o.resultStatus === 'sent' || o.resultStatus === 'processing').length;
  const pendingBillsCount = incomeRecords.filter(r => r.paymentStatus !== 'paid').length;

  const primaryItems = [
    {
      id: 'dashboard',
      labelAr: 'الرئيسية (لوحة القيادة)',
      labelEn: 'Executive Dashboard',
      icon: LayoutDashboard,
      permission: 'dashboard'
    },
    {
      id: 'income',
      labelAr: 'سجل الدخل والفواتير',
      labelEn: 'Daily Income & Billing',
      icon: Receipt,
      badge: pendingBillsCount > 0 ? pendingBillsCount : null,
      permission: 'income'
    },
    {
      id: 'expenses',
      labelAr: 'المصروفات والأرباح',
      labelEn: 'Expenses & Profit Share',
      icon: PieChart,
      permission: 'expenses'
    },
    {
      id: 'reports',
      labelAr: 'التقارير والتقفيل',
      labelEn: 'Reports & Closeout',
      icon: BarChart3,
      permission: 'reports'
    }
  ];

  const secondaryItems = [
    {
      id: 'lab_management',
      labelAr: 'إدارة المعامل والفروع',
      icon: Building2,
      permission: 'income'
    },
    {
      id: 'inventory',
      labelAr: 'المستلزمات والكيماويات',
      icon: FlaskConical,
      badge: lowStockCount > 0 ? lowStockCount : null,
      permission: 'inventory'
    },
    {
      id: 'loyalty',
      labelAr: 'كروت ونقاط الولاء',
      icon: CreditCard,
      badge: loyaltyProfiles.length > 0 ? loyaltyProfiles.length : null,
      permission: 'loyalty'
    },
    {
      id: 'hr',
      labelAr: 'الموارد البشرية والرواتب',
      icon: Users,
      permission: 'hr'
    },
    {
      id: 'lab_to_lab',
      labelAr: 'اللاب تو لاب (خارجي)',
      icon: Network,
      badge: pendingL2LCount > 0 ? pendingL2LCount : null,
      permission: 'lab_to_lab'
    },
    {
      id: 'sync',
      labelAr: 'ربط منظومة النتائج',
      icon: GitBranch,
      permission: 'income'
    },
    {
      id: 'audit',
      labelAr: 'سجل الحركات والرقابة',
      icon: ShieldCheck,
      permission: 'income'
    },
    {
      id: 'settings',
      labelAr: 'النسخ السحابي والإعدادات',
      icon: Settings,
      permission: 'income'
    }
  ];

  const isSecondaryActive = secondaryItems.some(i => i.id === activeTab);

  return (
    <nav className="bg-slate-950 text-slate-300 border-b border-slate-800 shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-2 overflow-x-auto py-2 scrollbar-none">
          <div className="flex items-center gap-1.5">
            {primaryItems.map(item => {
              const allowed = hasPermission(item.permission);
              const isActive = activeTab === item.id;
              const Icon = item.icon;

              return (
                <button
                  key={item.id}
                  onClick={() => allowed && setActiveTab(item.id)}
                  disabled={!allowed}
                  className={
                    'flex items-center gap-2 px-3 py-1.5 text-xs font-bold rounded-xl whitespace-nowrap transition-all ' +
                    (isActive
                      ? 'bg-gradient-to-r from-rose-900 to-rose-800 text-white shadow-md shadow-rose-950/40 border border-rose-600/50 scale-[1.02]'
                      : allowed
                      ? 'text-slate-300 hover:text-white hover:bg-slate-900/90 hover:border-slate-700 border border-transparent'
                      : 'text-slate-600 cursor-not-allowed opacity-50')
                  }
                >
                  <Icon className={'w-4 h-4 ' + (isActive ? 'text-amber-300' : 'text-slate-400')} />
                  <span>{language === 'ar' ? item.labelAr : item.labelEn}</span>
                  {item.badge !== null && item.badge !== undefined && (
                    <span className="text-[10px] px-1.5 py-0.2 rounded-full font-black font-mono bg-rose-600 text-white">
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}

            {/* Collapsible secondary dropdown to eliminate clutter */}
            <div className="relative group inline-block text-right">
              <button
                type="button"
                className={
                  'flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-xl whitespace-nowrap transition-all border ' +
                  (isSecondaryActive
                    ? 'bg-slate-800 border-rose-600/50 text-rose-300'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/80 border-slate-800')
                }
              >
                <Settings className="w-3.5 h-3.5 text-rose-400" />
                <span>الأقسام الإدارية والعمليات (مجمعة) ▾</span>
              </button>

              <div className="hidden group-hover:block absolute right-0 top-full pt-1 z-50 w-56 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl py-1 text-xs">
                {secondaryItems.map(item => {
                  const allowed = hasPermission(item.permission);
                  const isActive = activeTab === item.id;
                  const Icon = item.icon;

                  return (
                    <button
                      key={item.id}
                      onClick={() => allowed && setActiveTab(item.id)}
                      disabled={!allowed}
                      className={
                        'w-full text-right px-3 py-2 flex items-center justify-between hover:bg-slate-800 transition-colors ' +
                        (isActive ? 'text-rose-400 font-bold bg-slate-800/60' : 'text-slate-300')
                      }
                    >
                      <div className="flex items-center gap-2">
                        <Icon className="w-3.5 h-3.5 text-rose-400" />
                        <span>{item.labelAr}</span>
                      </div>
                      {item.badge !== null && item.badge !== undefined && (
                        <span className="text-[9px] px-1.5 py-0.2 rounded-full font-mono bg-amber-500/20 text-amber-300 border border-amber-500/40">
                          {item.badge}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Quick link to diagnostic system */}
          <div className="flex items-center gap-2 shrink-0">
            <a
              href="https://ramimokhtar228-maker.github.io/rt-lab-diagnostic-system/?v=clean_rev"
              target="_blank"
              rel="noopener noreferrer"
              className="px-3 py-1.5 rounded-lg bg-sky-950/70 border border-sky-700/60 hover:bg-sky-900 text-sky-200 text-xs font-bold flex items-center gap-1.5 transition-all shadow-xs"
              title="الانتقال لبرنامج النتائج والتشخيص"
            >
              <span>برنامج النتائج 🔬</span>
              <span className="text-[10px] text-sky-400 font-mono">↗</span>
            </a>
          </div>
        </div>
      </div>
    </nav>
  );
};
