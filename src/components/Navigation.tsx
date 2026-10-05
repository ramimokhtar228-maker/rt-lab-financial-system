import React from 'react';
import { useApp } from '../context/AppContext';
import { 
  LayoutDashboard, 
  Receipt, 
  PieChart, 
  BarChart3, 
  Building2, 
  FlaskConical, 
  CreditCard, 
  Users, 
  Network, 
  GitBranch, 
  ShieldCheck, 
  Settings 
} from 'lucide-react';

export const Navigation: React.FC = () => {
  const { 
    activeTab, 
    setActiveTab, 
    inventory, 
    labToLabOrders, 
    incomeRecords, 
    loyaltyProfiles,
    hasPermission,
    language 
  } = useApp();

  const lowStockCount = inventory.filter(i => i.currentQuantity <= i.minThreshold).length;
  const pendingL2LCount = labToLabOrders.filter(o => o.resultStatus === 'sent' || o.resultStatus === 'processing').length;
  const pendingBillsCount = incomeRecords.filter(r => r.paymentStatus !== 'paid').length;

  const allNavItems = [
    {
      id: 'dashboard',
      labelAr: 'الرئيسية (لوحة القيادة)',
      labelEn: 'Dashboard',
      icon: LayoutDashboard,
      permission: 'dashboard'
    },
    {
      id: 'income',
      labelAr: 'سجل الدخل والفواتير',
      labelEn: 'Income & Billing',
      icon: Receipt,
      badge: pendingBillsCount > 0 ? pendingBillsCount : null,
      permission: 'income'
    },
    {
      id: 'expenses',
      labelAr: 'المصروفات والأرباح',
      labelEn: 'Expenses',
      icon: PieChart,
      permission: 'expenses'
    },
    {
      id: 'reports',
      labelAr: 'التقارير والتقفيل',
      labelEn: 'Reports',
      icon: BarChart3,
      permission: 'reports'
    },
    {
      id: 'lab_management',
      labelAr: 'إدارة المعامل والفروع',
      labelEn: 'Lab Management',
      icon: Building2,
      permission: 'income'
    },
    {
      id: 'inventory',
      labelAr: 'المستلزمات والكيماويات',
      labelEn: 'Inventory',
      icon: FlaskConical,
      badge: lowStockCount > 0 ? lowStockCount : null,
      permission: 'inventory'
    },
    {
      id: 'loyalty',
      labelAr: 'كروت ونقاط الولاء',
      labelEn: 'Loyalty Cards',
      icon: CreditCard,
      badge: loyaltyProfiles.length > 0 ? loyaltyProfiles.length : null,
      permission: 'loyalty'
    },
    {
      id: 'hr',
      labelAr: 'الموارد البشرية والرواتب',
      labelEn: 'HR & Payroll',
      icon: Users,
      permission: 'hr'
    },
    {
      id: 'lab_to_lab',
      labelAr: 'اللاب تو لاب (خارجي)',
      labelEn: 'Lab-to-Lab',
      icon: Network,
      badge: pendingL2LCount > 0 ? pendingL2LCount : null,
      permission: 'lab_to_lab'
    },
    {
      id: 'sync',
      labelAr: 'ربط منظومة النتائج',
      labelEn: 'Results Sync',
      icon: GitBranch,
      permission: 'income'
    },
    {
      id: 'audit',
      labelAr: 'سجل الحركات والرقابة',
      labelEn: 'Audit Trail',
      icon: ShieldCheck,
      permission: 'income'
    },
    {
      id: 'settings',
      labelAr: 'النسخ السحابي والإعدادات',
      labelEn: 'Settings & Cloud',
      icon: Settings,
      permission: 'income'
    }
  ];

  return (
    <nav className="bg-slate-950 text-slate-300 border-b border-slate-800 shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-2 overflow-x-auto py-2 scrollbar-thin scrollbar-thumb-rose-900">
          <div className="flex items-center gap-1.5 flex-nowrap">
            {allNavItems.map(item => {
              const allowed = hasPermission(item.permission);
              const isActive = activeTab === item.id;
              const Icon = item.icon;

              return (
                <button
                  key={item.id}
                  onClick={() => allowed && setActiveTab(item.id)}
                  disabled={!allowed}
                  className={
                    'flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-xl whitespace-nowrap transition-all ' +
                    (isActive
                      ? 'bg-gradient-to-r from-rose-900 to-rose-800 text-white shadow-md shadow-rose-950/40 border border-rose-600/50 scale-[1.02]'
                      : allowed
                      ? 'text-slate-300 hover:text-white hover:bg-slate-900/90 hover:border-slate-700 border border-transparent cursor-pointer'
                      : 'text-slate-600 cursor-not-allowed opacity-50')
                  }
                  title={!allowed ? 'غير مسموح لهذه الصلاحية' : undefined}
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
          </div>

          {/* Quick link to diagnostic system */}
          <div className="flex items-center gap-2 shrink-0">
            <a
              href="https://ramimokhtar228-maker.github.io/rt-lab-diagnostic-system/"
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
