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
  Building2
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

  const lowStockCount = inventory.filter(i => i.currentQuantity <= i.minThreshold).length;
  const pendingL2LCount = labToLabOrders.filter(o => o.resultStatus === 'sent' || o.resultStatus === 'processing').length;
  const pendingBillsCount = incomeRecords.filter(r => r.paymentStatus !== 'paid').length;

  const navItems = [
    {
      id: 'dashboard',
      labelAr: 'الرئيسية (لوحة القيادة)',
      labelEn: 'Executive Dashboard',
      icon: LayoutDashboard,
      permission: 'dashboard'
    },
    {
      id: 'lab_management',
      labelAr: 'إدارة المعامل والفروع',
      labelEn: 'Labs & Branches',
      icon: Building2,
      permission: 'income'
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
      id: 'loyalty',
      labelAr: 'كروت ونقاط الولاء',
      labelEn: 'Loyalty & Patient Cards',
      icon: CreditCard,
      badge: loyaltyProfiles.length > 0 ? loyaltyProfiles.length : null,
      permission: 'loyalty'
    },
    {
      id: 'expenses',
      labelAr: 'المصروفات والأرباح',
      labelEn: 'Expenses & Profit Share',
      icon: PieChart,
      permission: 'expenses'
    },
    {
      id: 'inventory',
      labelAr: 'المستلزمات والكيماويات',
      labelEn: 'Reagents & Inventory',
      icon: FlaskConical,
      badge: lowStockCount > 0 ? lowStockCount : null,
      badgeColor: 'text-amber-300 bg-amber-950',
      permission: 'inventory'
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
      id: 'reports',
      labelAr: 'التقارير والتقفيل',
      labelEn: 'Reports & Closeout',
      icon: BarChart3,
      permission: 'reports'
    },
    {
      id: 'sync',
      labelAr: 'ربط منظومة النتائج',
      labelEn: 'RT Diagnostic Sync',
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
      labelEn: 'Backup & Settings',
      icon: Settings,
      permission: 'income'
    }
  ];

  return (
    <nav className="bg-slate-950 text-slate-300 border-b border-slate-800 shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex space-x-1 sm:space-x-1.5 overflow-x-auto py-2.5 scrollbar-none">
          {navItems.map(item => {
            const allowed = hasPermission(item.permission);
            const isActive = activeTab === item.id;
            const Icon = item.icon;

            return (
              <button
                key={item.id}
                onClick={() => {
                  if (allowed) {
                    setActiveTab(item.id);
                  }
                }}
                disabled={!allowed}
                className={`flex items-center gap-2 px-3 py-2 text-xs font-bold rounded-xl whitespace-nowrap transition-all ${
                  isActive
                    ? 'bg-gradient-to-r from-rose-900 to-rose-800 text-white shadow-md shadow-rose-950/40 border border-rose-600/50 scale-[1.02]'
                    : allowed
                    ? 'text-slate-300 hover:text-white hover:bg-slate-900/90 hover:border-slate-700 border border-transparent'
                    : 'text-slate-600 cursor-not-allowed opacity-50'
                }`}
                title={!allowed ? (language === 'ar' ? 'غير مسموح لهذه الصلاحية' : 'Restricted for your role') : undefined}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-amber-300' : 'text-slate-400'}`} />
                <span>{language === 'ar' ? item.labelAr : item.labelEn}</span>
                {item.badge !== null && item.badge !== undefined && (
                  <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-black font-mono ${
                    isActive ? 'bg-amber-400 text-rose-950' : 'bg-slate-800 text-slate-300'
                  }`}>
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </nav>
  );
};
