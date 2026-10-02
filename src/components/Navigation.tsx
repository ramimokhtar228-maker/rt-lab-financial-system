import React from 'react';
import { useApp } from '../context/AppContext';
import {
  Receipt,
  PieChart,
  FlaskConical,
  Users,
  Network,
  BarChart3,
  GitBranch,
  ShieldCheck,
  Settings
} from 'lucide-react';

export const Navigation: React.FC = () => {
  const {
    activeTab,
    setActiveTab,
    language,
    hasPermission,
    inventory,
    labToLabOrders,
    incomeRecords
  } = useApp();

  const lowStockCount = inventory.filter(i => i.currentQuantity <= i.minThreshold).length;
  const pendingL2LCount = labToLabOrders.filter(o => o.resultStatus === 'sent' || o.resultStatus === 'processing').length;
  const pendingBillsCount = incomeRecords.filter(r => r.paymentStatus !== 'paid').length;

  const navItems = [
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
      labelAr: 'المصروفات وتوزيع الأرباح',
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
      badgeColor: 'text-amber-700 bg-amber-50',
      permission: 'inventory'
    },
    {
      id: 'hr',
      labelAr: 'الموارد البشرية والرواتب',
      labelEn: 'HR, Attendance & Payroll',
      icon: Users,
      permission: 'hr'
    },
    {
      id: 'lab_to_lab',
      labelAr: 'اللاب تو لاب (معامل خارجية)',
      labelEn: 'Lab-to-Lab Referrals',
      icon: Network,
      badge: pendingL2LCount > 0 ? pendingL2LCount : null,
      permission: 'lab_to_lab'
    },
    {
      id: 'reports',
      labelAr: 'التقارير المالية والتقفيل',
      labelEn: 'Reports & Closeout',
      icon: BarChart3,
      permission: 'reports'
    },
    {
      id: 'sync',
      labelAr: 'ربط منظومة النتائج',
      labelEn: 'RT Diagnostic Sync Hub',
      icon: GitBranch,
      permission: 'sync'
    },
    {
      id: 'audit',
      labelAr: 'سجل الحركات والرقابة',
      labelEn: 'Audit Trail',
      icon: ShieldCheck,
      permission: 'security'
    },
    {
      id: 'settings',
      labelAr: 'النسخ السحابي والإعدادات',
      labelEn: 'Backup & Settings',
      icon: Settings,
      permission: 'settings'
    }
  ];

  return (
    <nav className="bg-slate-900 text-slate-300 border-b border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex space-x-1 sm:space-x-2 overflow-x-auto py-2 scrollbar-none">
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
                className={`flex items-center gap-2 px-3 py-2 text-xs font-semibold rounded-md whitespace-nowrap transition-colors ${
                  isActive
                    ? 'bg-teal-700 text-white shadow-sm'
                    : allowed
                    ? 'text-slate-300 hover:text-white hover:bg-slate-800'
                    : 'text-slate-600 cursor-not-allowed opacity-50'
                }`}
                title={!allowed ? (language === 'ar' ? 'غير مسموح لهذه الصلاحية' : 'Restricted for your role') : undefined}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                <span>{language === 'ar' ? item.labelAr : item.labelEn}</span>
                {item.badge !== null && item.badge !== undefined && (
                  <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                    isActive ? 'bg-white text-teal-900' : 'bg-slate-800 text-slate-300'
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
