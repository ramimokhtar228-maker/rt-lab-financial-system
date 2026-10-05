import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { AuditLog } from '../types';
import { ShieldCheck, Search, Filter, Clock, User, Shield } from 'lucide-react';

export const AuditLogModule: React.FC = () => {
  const { auditLogs, language } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [moduleFilter, setModuleFilter] = useState<'all' | AuditLog['module']>('all');
  const [actionFilter, setActionFilter] = useState<'all' | AuditLog['action']>('all');

  const filteredLogs = useMemo(() => {
    return auditLogs.filter(log => {
      if (moduleFilter !== 'all' && log.module !== moduleFilter) return false;
      if (actionFilter !== 'all' && log.action !== actionFilter) return false;
      if (searchTerm.trim()) {
        const term = searchTerm.toLowerCase();
        const matchesDesc = log.description.toLowerCase().includes(term);
        const matchesUser = log.userName.toLowerCase().includes(term);
        if (!matchesDesc && !matchesUser) return false;
      }
      return true;
    });
  }, [auditLogs, moduleFilter, actionFilter, searchTerm]);

  const moduleNames: Record<AuditLog['module'], string> = {
    INCOME: 'الدخل والفواتير',
    EXPENSES: 'المصروفات والأرباح',
    INVENTORY: 'المستلزمات والكيماويات',
    HR: 'الموارد البشرية والرواتب',
    LAB_TO_LAB: 'اللاب تو لاب',
    SETTINGS: 'الإعدادات والربط',
    SECURITY: 'الأمان والدخول',
    CATALOG: 'الكتالوج والأسعار',
    LOYALTY: 'كروت الولاء',
    DIAGNOSTIC: 'التقارير الطبية والمخبرية',
    DEVICE: 'ربط أجهزة المعمل LIS'
  };

  return (
    <div className="space-y-6">
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-black text-slate-900 tracking-tight flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-rose-800" />
              <span>{language === 'ar' ? 'سجل الحركات الشامل ومراقبة العمليات (Audit Trail)' : 'Activity & Audit Trail Log'}</span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              {language === 'ar'
                ? 'توثيق كامل لكافة الحركات المالية والإدارية والمخزنية لضمان الشفافية ومراقبة الصلاحيات.'
                : 'Full immutable activity history tracking every system change and user action.'}
            </p>
          </div>

          <div className="text-xs text-slate-500 font-mono">
            إجمالي العمليات المسجلة: <strong className="text-slate-900">{auditLogs.length}</strong> حركة
          </div>
        </div>

        {/* Filter Controls */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-100">
          <div className="relative flex-1 min-w-[240px] max-w-md">
            <input
              type="text"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              placeholder="ابحث في سجل العمليات أو اسم المستخدم..."
              className="w-full text-xs pr-8 pl-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-rose-800"
            />
            <Search className="w-4 h-4 text-slate-400 absolute right-2.5 top-2.5 pointer-events-none" />
          </div>

          <div className="flex items-center gap-2">
            <select
              value={moduleFilter}
              onChange={e => setModuleFilter(e.target.value as 'all' | AuditLog['module'])}
              className="text-xs py-2 px-3 rounded-lg border border-slate-300 bg-white font-medium"
            >
              <option value="all">جميع الأقسام والوحدات</option>
              {Object.entries(moduleNames).map(([key, label]) => (
                <option key={key} value={key}>{label}</option>
              ))}
            </select>

            <select
              value={actionFilter}
              onChange={e => setActionFilter(e.target.value as 'all' | AuditLog['action'])}
              className="text-xs py-2 px-3 rounded-lg border border-slate-300 bg-white font-medium"
            >
              <option value="all">جميع أنواع الإجراءات</option>
              <option value="CREATE">إنشاء وإضافة (CREATE)</option>
              <option value="UPDATE">تعديل وتحديث (UPDATE)</option>
              <option value="DELETE">حذف (DELETE)</option>
              <option value="SYNC">مزامنة سحابية (SYNC)</option>
              <option value="CLOSEOUT">تقفيل خزينة (CLOSEOUT)</option>
              <option value="LOGIN">تسجيل دخول (LOGIN)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Logs Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-right">
            <thead>
              <tr className="bg-slate-100/75 text-slate-700 font-bold border-b border-slate-200">
                <th className="py-3 px-4">التاريخ والوقت</th>
                <th className="py-3 px-4">المستخدم والمنصب</th>
                <th className="py-3 px-4">نوع الإجراء</th>
                <th className="py-3 px-4">القسم المعني</th>
                <th className="py-3 px-4">تفاصيل وبيان العملية</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-mono">
              {filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-slate-400 font-sans">
                    لا توجد سجلات مطابقة للبحث
                  </td>
                </tr>
              ) : (
                filteredLogs.map(log => (
                  <tr key={log.id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-3 px-4 text-slate-600 whitespace-nowrap">
                      {new Date(log.timestamp).toLocaleDateString('ar-EG')} - {new Date(log.timestamp).toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                    </td>
                    <td className="py-3 px-4 font-sans font-bold text-slate-900">
                      <div>{log.userName}</div>
                      <div className="text-[10px] text-slate-400 font-normal">{log.userRole}</div>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        log.action === 'CREATE' ? 'bg-emerald-100 text-emerald-800' :
                        log.action === 'UPDATE' ? 'bg-blue-100 text-blue-800' :
                        log.action === 'DELETE' ? 'bg-rose-100 text-rose-800' :
                        log.action === 'SYNC' ? 'bg-purple-100 text-purple-800' :
                        'bg-slate-100 text-slate-800'
                      }`}>
                        {log.action}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-sans font-medium text-slate-700">
                      {moduleNames[log.module]}
                    </td>
                    <td className="py-3 px-4 font-sans text-slate-800 max-w-xl">
                      {log.description}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
