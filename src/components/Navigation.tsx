import React from 'react';
import { useApp } from '../context/AppContext';
import {
  LayoutDashboard,
  UserPlus,
  FlaskConical,
  Cpu,
  FileCheck2,
  FolderArchive,
  Wallet,
  Receipt,
  CreditCard,
  Network,
  Package,
  Users2,
  BookOpen,
  ShieldCheck
} from 'lucide-react';

interface NavItem {
  id: string;
  labelAr: string;
  icon: React.ElementType;
  badge?: number | string;
  badgeColor?: string;
  group: 'core' | 'medical' | 'financial' | 'admin';
}

export const Navigation: React.FC = () => {
  const {
    activeTab,
    setActiveTab,
    hasPermission,
    reports,
    incomeRecords,
    inventory,
    instruments
  } = useApp();

  const pendingReportsCount = reports.filter(r => r.status === 'draft' || r.status === 'in_progress').length;
  const unpaidInvoicesCount = incomeRecords.filter(i => i.paymentStatus !== 'paid').length;
  const lowStockCount = inventory.filter(i => i.currentQuantity <= i.minThreshold).length;

  const navItems: NavItem[] = [
    {
      id: 'dashboard',
      labelAr: 'لوحة التحكم المركزية',
      icon: LayoutDashboard,
      group: 'core'
    },
    {
      id: 'admission',
      labelAr: 'تسجيل المرضى وحجز التحاليل',
      icon: UserPlus,
      group: 'core'
    },
    {
      id: 'worklist',
      labelAr: 'قائمة عمل المعمل',
      icon: FlaskConical,
      badge: pendingReportsCount > 0 ? pendingReportsCount : undefined,
      badgeColor: 'bg-rose-600',
      group: 'medical'
    },
    {
      id: 'instruments',
      labelAr: 'الربط مع الأجهزة (LIS)',
      icon: Cpu,
      badge: instruments.filter(i => i.status === 'online').length + ' متصل',
      badgeColor: 'bg-emerald-600',
      group: 'medical'
    },
    {
      id: 'diagnostic_editor',
      labelAr: 'إدخال النتائج والتشخيص',
      icon: FileCheck2,
      group: 'medical'
    },
    {
      id: 'reports_archive',
      labelAr: 'أرشيف التقارير والطباعة',
      icon: FolderArchive,
      badge: reports.length,
      badgeColor: 'bg-slate-700',
      group: 'medical'
    },
    {
      id: 'financial_income',
      labelAr: 'الخزينة والفوترة (Income)',
      icon: Wallet,
      badge: unpaidInvoicesCount > 0 ? `${unpaidInvoicesCount} معلق` : undefined,
      badgeColor: 'bg-amber-600',
      group: 'financial'
    },
    {
      id: 'expenses_profit',
      labelAr: 'المصروفات والأرباح (P&L)',
      icon: Receipt,
      group: 'financial'
    },
    {
      id: 'loyalty',
      labelAr: 'كروت ونقاط الولاء',
      icon: CreditCard,
      group: 'financial'
    },
    {
      id: 'lab_to_lab',
      labelAr: 'معامل الإحالة الخارجية',
      icon: Network,
      group: 'financial'
    },
    {
      id: 'inventory',
      labelAr: 'المخزون والمحاليل',
      icon: Package,
      badge: lowStockCount > 0 ? `نواقص ${lowStockCount}` : undefined,
      badgeColor: 'bg-red-600',
      group: 'admin'
    },
    {
      id: 'hr',
      labelAr: 'شؤون الموظفين والورديات',
      icon: Users2,
      group: 'admin'
    },
    {
      id: 'catalog',
      labelAr: 'دليل التحاليل والباقات',
      icon: BookOpen,
      group: 'admin'
    },
    {
      id: 'audit_settings',
      labelAr: 'الأمان والتدقيق والإعدادات',
      icon: ShieldCheck,
      group: 'admin'
    }
  ];

  return (
    <nav className="bg-white border-b border-slate-200 shadow-sm sticky top-[65px] z-20 print:hidden overflow-x-auto no-scrollbar">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-1.5 py-2 min-w-max">
          {navItems.map(item => {
            const allowed = hasPermission(item.id);
            if (!allowed) return null;
            const isActive = activeTab === item.id;
            const Icon = item.icon;

            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`relative px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer select-none ${
                  isActive
                    ? 'bg-rose-900 text-white shadow-md shadow-rose-900/20 ring-1 ring-rose-800'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-rose-200' : 'text-slate-500'}`} />
                <span>{item.labelAr}</span>

                {item.badge !== undefined && (
                  <span
                    className={`text-[10px] font-mono px-1.5 py-0.5 rounded-full text-white font-bold leading-none ${
                      isActive ? 'bg-white/20' : item.badgeColor || 'bg-slate-600'
                    }`}
                  >
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
