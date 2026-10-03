import { RTLogo } from './RTLogo';
import { TestCatalogManagerModal } from './TestCatalogManagerModal';
import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Receipt,
  PieChart,
  Users,
  FlaskConical,
  Network,
  AlertTriangle,
  ArrowUpRight,
  ArrowDownRight,
  Plus,
  Printer,
  Edit2,
  Trash2,
  Calendar,
  Building2,
  CreditCard,
  Wallet,
  ShieldCheck,
  CheckCircle2,
  Clock,
  Sparkles,
  Search,
  Filter,
  RefreshCw
} from 'lucide-react';
import { IncomeRecord, ExpenseRecord } from '../types';

export const DashboardModule: React.FC = () => {
  const {
    incomeRecords,
    expenses,
    inventory,
    employees,
    labToLabOrders,
    setActiveTab,
    currentUser,
    profitConfig,
    language,
    deleteIncomeRecord,
    deleteExpense
  } = useApp();

  const [dateFilter, setDateFilter] = useState<'today' | 'this_month' | 'all'>('this_month');
  const [branchFilter, setBranchFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [catalogModalOpen, setCatalogModalOpen] = useState(false);

  // Today's date string YYYY-MM-DD
  const todayStr = new Date().toISOString().split('T')[0];
  const currentMonthStr = todayStr.substring(0, 7);

  // Filtered income records
  const filteredIncome = useMemo(() => {
    return incomeRecords.filter(rec => {
      const recDate = rec.createdAt.split('T')[0];
      if (dateFilter === 'today' && recDate !== todayStr) return false;
      if (dateFilter === 'this_month' && !recDate.startsWith(currentMonthStr)) return false;
      if (branchFilter !== 'all' && rec.branch !== branchFilter) return false;
      if (searchTerm) {
        const term = searchTerm.toLowerCase();
        return (
          rec.patientName.toLowerCase().includes(term) ||
          rec.invoiceNumber.toLowerCase().includes(term) ||
          rec.labNumber.toLowerCase().includes(term) ||
          rec.patientPhone.includes(term)
        );
      }
      return true;
    });
  }, [incomeRecords, dateFilter, branchFilter, searchTerm, todayStr, currentMonthStr]);

  // Filtered expenses
  const filteredExpenses = useMemo(() => {
    return expenses.filter(exp => {
      if (dateFilter === 'today' && exp.date !== todayStr) return false;
      if (dateFilter === 'this_month' && !exp.date.startsWith(currentMonthStr)) return false;
      return true;
    });
  }, [expenses, dateFilter, todayStr, currentMonthStr]);

  // Financial KPIs
  const totalRevenue = useMemo(() => {
    return filteredIncome.reduce((sum, r) => sum + r.paidAmount, 0);
  }, [filteredIncome]);

  const totalInvoiced = useMemo(() => {
    return filteredIncome.reduce((sum, r) => sum + r.netAmount, 0);
  }, [filteredIncome]);

  const totalPendingDues = useMemo(() => {
    return filteredIncome.reduce((sum, r) => sum + (r.remainingAmount || 0), 0);
  }, [filteredIncome]);

  const totalExpensesAmount = useMemo(() => {
    return filteredExpenses.reduce((sum, e) => sum + e.amount, 0);
  }, [filteredExpenses]);

  const netProfit = totalRevenue - totalExpensesAmount;
  const profitMarginPercent = totalRevenue > 0 ? Math.round((netProfit / totalRevenue) * 100) : 0;

  // Payment Breakdown
  const cashPayments = useMemo(() => {
    return filteredIncome.filter(r => r.paymentMethod === 'cash').reduce((sum, r) => sum + r.paidAmount, 0);
  }, [filteredIncome]);

  const cardPayments = useMemo(() => {
    return filteredIncome.filter(r => r.paymentMethod === 'visa' || r.paymentMethod === 'bank_transfer').reduce((sum, r) => sum + r.paidAmount, 0);
  }, [filteredIncome]);

  // Lab to Lab receivables & payables
  const l2lReceivables = useMemo(() => {
    return labToLabOrders
      .filter(o => o.resultStatus !== 'delivered')
      .reduce((sum, o) => sum + o.patientChargedPrice, 0);
  }, [labToLabOrders]);

  // Inventory Critical Alerts
  const lowStockItems = useMemo(() => {
    return inventory.filter(i => i.currentQuantity <= i.minThreshold);
  }, [inventory]);

  // Top Requested Tests
  const topTests = useMemo(() => {
    const counts: Record<string, { name: string; count: number; revenue: number }> = {};
    filteredIncome.forEach(rec => {
      rec.tests.forEach(t => {
        if (!counts[t.code]) {
          counts[t.code] = { name: t.nameAr, count: 0, revenue: 0 };
        }
        counts[t.code].count += 1;
        counts[t.code].revenue += t.price;
      });
    });
    return Object.values(counts)
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
  }, [filteredIncome]);

  // Branches list
  const branches = useMemo(() => {
    const list = Array.from(new Set(incomeRecords.map(r => r.branch).filter(Boolean)));
    return list.length > 0 ? list : ['فرع قصر العيني الرئيسي', 'فرع الدقي والجيزة', 'فرع سموحة الإسكندرية'];
  }, [incomeRecords]);

  return (
    <div className="space-y-6 pb-12">
      {/* Top Banner & Context */}
      <div className="bg-gradient-to-r from-slate-950 via-[#4c0519] to-[#0f172a] text-white rounded-2xl p-6 shadow-xl border border-slate-700">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-500/20 text-rose-300 border border-rose-500/40 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse"></span>
                الصفحة الرئيسية ولوحة القيادة المالية ERP
              </span>
              <span className="text-xs text-slate-400 hidden sm:inline">|</span>
              <span className="text-xs text-slate-300 hidden sm:inline">أ.د. رامي مختار - رئيس مجلس الإدارة</span>
            </div>
            <div className="flex flex-col sm:flex-row sm:items-center gap-3 pt-1">
              <RTLogo size="md" showSlogan={false} theme="dark" />
              <div className="border-r border-rose-900/80 pr-3 sm:mr-1">
                <h1 className="text-xl sm:text-2xl font-black text-white leading-tight">
                  معامل RT للتحاليل التشخيصية
                </h1>
                <div className="flex flex-wrap items-center gap-2 mt-0.5">
                  <span className="text-sm font-extrabold text-rose-300">معامل رامي مختار</span>
                  <span className="text-rose-500 font-bold">·</span>
                  <span className="text-xs font-bold text-blue-300 bg-blue-950/60 px-2 py-0.5 rounded border border-blue-800/40">
                    أطباء كلية طب قصر العيني
                  </span>
                </div>
                <div className="text-[11px] text-rose-200/70 mt-1 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse"></span>
                  <span>التشخيص الصحيح يبدأ معنا · المنظومة المالية والفوترة ERP والرقابة الإدارية الشاملة</span>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Filters */}
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <div className="bg-slate-800/80 p-1 rounded-xl border border-slate-700 flex items-center gap-1">
              <button
                type="button"
                onClick={() => setDateFilter('today')}
                className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
                  dateFilter === 'today' ? 'bg-rose-900 text-white shadow-xs' : 'text-slate-300 hover:text-white'
                }`}
              >
                اليوم
              </button>
              <button
                type="button"
                onClick={() => setDateFilter('this_month')}
                className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
                  dateFilter === 'this_month' ? 'bg-rose-900 text-white shadow-xs' : 'text-slate-300 hover:text-white'
                }`}
              >
                الشهر الحالي
              </button>
              <button
                type="button"
                onClick={() => setDateFilter('all')}
                className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
                  dateFilter === 'all' ? 'bg-rose-900 text-white shadow-xs' : 'text-slate-300 hover:text-white'
                }`}
              >
                الكل
              </button>
            </div>

            <select
              value={branchFilter}
              onChange={e => setBranchFilter(e.target.value)}
              className="bg-slate-800 text-slate-200 border border-slate-700 rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-rose-600 focus:outline-none"
            >
              <option value="all">كافة الفروع</option>
              {branches.map(b => (
                <option key={b} value={b}>{b}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Quick Actions Shortcuts */}
        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-2.5 mt-5 pt-4 border-t border-slate-700/60">
          <button
            type="button"
            onClick={() => setCatalogModalOpen(true)}
            className="flex items-center gap-2 p-2.5 bg-amber-950/40 hover:bg-amber-900/60 border border-amber-600/40 rounded-xl text-xs font-bold text-amber-200 transition-all active:scale-95 text-center justify-center"
          >
            <FlaskConical className="w-4 h-4 text-amber-400" />
            <span>كتالوج الفحوصات (165+)</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('loyalty')}
            className="flex items-center gap-2 p-2.5 bg-rose-950/60 hover:bg-rose-900/80 border border-rose-500/50 rounded-xl text-xs font-bold text-rose-200 transition-all active:scale-95 text-center justify-center"
          >
            <CreditCard className="w-4 h-4 text-rose-300" />
            <span>كروت ونقاط الولاء</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('income')}
            className="flex items-center gap-2 p-2.5 bg-rose-900/60 hover:bg-rose-800/80 border border-rose-600/60 rounded-xl text-xs font-bold text-rose-100 transition-all active:scale-95 text-center justify-center"
          >
            <Plus className="w-4 h-4 text-rose-300" />
            <span>فاتورة جديدة</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('expenses')}
            className="flex items-center gap-2 p-2.5 bg-rose-950/40 hover:bg-rose-900/60 border border-rose-700/40 rounded-xl text-xs font-bold text-rose-200 transition-all active:scale-95 text-center justify-center"
          >
            <DollarSign className="w-4 h-4 text-rose-400" />
            <span>سند صرف</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('inventory')}
            className="flex items-center gap-2 p-2.5 bg-amber-950/40 hover:bg-amber-900/60 border border-amber-700/40 rounded-xl text-xs font-bold text-amber-200 transition-all active:scale-95 text-center justify-center"
          >
            <FlaskConical className="w-4 h-4 text-amber-300" />
            <span>نواقص الكواشف</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('lab_to_lab')}
            className="flex items-center gap-2 p-2.5 bg-blue-950/40 hover:bg-blue-900/60 border border-blue-700/40 rounded-xl text-xs font-bold text-blue-200 transition-all active:scale-95 text-center justify-center"
          >
            <Network className="w-4 h-4 text-blue-300" />
            <span>Lab-to-Lab</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('hr')}
            className="flex items-center gap-2 p-2.5 bg-purple-950/40 hover:bg-purple-900/60 border border-purple-700/40 rounded-xl text-xs font-bold text-purple-200 transition-all active:scale-95 text-center justify-center"
          >
            <Users className="w-4 h-4 text-purple-300" />
            <span>رواتب الطاقم</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('reports')}
            className="flex items-center gap-2 p-2.5 bg-emerald-950/40 hover:bg-emerald-900/60 border border-emerald-700/40 rounded-xl text-xs font-bold text-emerald-200 transition-all active:scale-95 text-center justify-center"
          >
            <Printer className="w-4 h-4 text-emerald-300" />
            <span>تقفيل الوردية</span>
          </button>
        </div>
      </div>

      {/* 6 Core Financial KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {/* Card 1: Total Revenue Collected */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">الإيراد المحصل</span>
            <div className="w-8 h-8 rounded-xl bg-rose-50 text-rose-900 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-xl sm:text-2xl font-black text-slate-900 font-mono">
              {totalRevenue.toLocaleString()} <span className="text-xs font-normal text-slate-500">ج.م</span>
            </div>
            <div className="text-[11px] text-rose-900 font-semibold mt-1 flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3" />
              <span>{filteredIncome.length} فاتورة مسجلة</span>
            </div>
          </div>
        </div>

        {/* Card 2: Operating Expenses */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">المصروفات والنفقات</span>
            <div className="w-8 h-8 rounded-xl bg-rose-50 text-rose-700 flex items-center justify-center">
              <TrendingDown className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-xl sm:text-2xl font-black text-rose-700 font-mono">
              {totalExpensesAmount.toLocaleString()} <span className="text-xs font-normal text-slate-500">ج.م</span>
            </div>
            <div className="text-[11px] text-rose-600 font-semibold mt-1">
              <span>{filteredExpenses.length} سند صرف معتمد</span>
            </div>
          </div>
        </div>

        {/* Card 3: Net Profit */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">صافي الربح المحقق</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-xl sm:text-2xl font-black text-emerald-800 font-mono">
              {netProfit.toLocaleString()} <span className="text-xs font-normal text-slate-500">ج.م</span>
            </div>
            <div className="text-[11px] text-emerald-700 font-semibold mt-1 flex items-center justify-between">
              <span>هامش الربح:</span>
              <span className="font-bold font-mono">{profitMarginPercent}%</span>
            </div>
          </div>
        </div>

        {/* Card 4: Treasury Cash vs Visa */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">الخزينة والتحصيل</span>
            <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center">
              <Wallet className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 space-y-1">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-600">نقدي بالدرج:</span>
              <span className="font-mono font-bold text-slate-900">{cashPayments.toLocaleString()} ج</span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-600">فيزا / بنكي:</span>
              <span className="font-mono font-bold text-blue-700">{cardPayments.toLocaleString()} ج</span>
            </div>
          </div>
        </div>

        {/* Card 5: Pending Patient & Lab Receivables */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">متبقيات وآجل للتحصيل</span>
            <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-xl sm:text-2xl font-black text-amber-800 font-mono">
              {totalPendingDues.toLocaleString()} <span className="text-xs font-normal text-slate-500">ج.م</span>
            </div>
            <div className="text-[11px] text-amber-700 font-semibold mt-1">
              <span>{filteredIncome.filter(r => r.remainingAmount > 0).length} حالة متبقي عليها مبالغ</span>
            </div>
          </div>
        </div>

        {/* Card 6: Reagents & Low Stock */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">نواقص المخزون</span>
            <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${
              lowStockItems.length > 0 ? 'bg-red-50 text-red-700 animate-pulse' : 'bg-slate-50 text-slate-500'
            }`}>
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-xl sm:text-2xl font-black text-slate-900 font-mono">
              {lowStockItems.length} <span className="text-xs font-normal text-slate-500">أصناف حرجة</span>
            </div>
            <button
              type="button"
              onClick={() => setActiveTab('inventory')}
              className="text-[11px] text-rose-900 font-bold hover:underline mt-1 block"
            >
              عرض سجل الكواشف ←
            </button>
          </div>
        </div>
      </div>

      {/* Middle Section: Test Analytics & Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (2 Cols on lg): Recent Invoices & Quick Actions */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 shadow-sm p-5 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
            <div>
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Receipt className="w-5 h-5 text-rose-900" />
                <span>أحدث فواتير المرضى والمقبوضات المالية</span>
              </h2>
              <p className="text-xs text-slate-500">
                إمكانية التعديل، الحذف، والطباعة الفورية لأي حقل مباشرة
              </p>
            </div>

            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="بحث باسم المريض أو الفاتورة..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="bg-slate-50 border border-slate-200 text-xs rounded-lg pr-8 pl-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-rose-600 w-full sm:w-56"
              />
            </div>
          </div>

          {/* Invoices Table with Horizontal Scroll for Tablet */}
          <div className="overflow-x-auto">
            <table className="w-full text-right text-xs">
              <thead>
                <tr className="bg-slate-50 text-slate-600 border-b border-slate-200 font-bold">
                  <th className="py-2.5 px-3">رقم الفاتورة</th>
                  <th className="py-2.5 px-3">المريض</th>
                  <th className="py-2.5 px-3">الفحوصات المطلوبة</th>
                  <th className="py-2.5 px-3">المسدد</th>
                  <th className="py-2.5 px-3">المتبقي</th>
                  <th className="py-2.5 px-3">طريقة الدفع</th>
                  <th className="py-2.5 px-3 text-center">الإجراءات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredIncome.slice(0, 7).map(record => (
                  <tr key={record.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-2.5 px-3 font-mono font-bold text-slate-800">
                      {record.invoiceNumber}
                      <span className="block text-[10px] text-slate-400 font-normal">{record.branch}</span>
                    </td>
                    <td className="py-2.5 px-3">
                      <div className="font-bold text-slate-900">{record.patientName}</div>
                      <div className="text-[10px] text-slate-500 font-mono">{record.patientPhone}</div>
                    </td>
                    <td className="py-2.5 px-3 max-w-[180px] truncate" title={record.tests.map(t => t.nameAr).join('، ')}>
                      <span className="bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded text-[11px] font-medium">
                        {record.tests.length} تحاليل: {record.tests.slice(0, 2).map(t => t.code).join(', ')}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 font-mono font-bold text-emerald-700">
                      {record.paidAmount.toLocaleString()} ج.م
                    </td>
                    <td className="py-2.5 px-3 font-mono">
                      {record.remainingAmount > 0 ? (
                        <span className="text-amber-700 font-bold">{record.remainingAmount.toLocaleString()} ج.م</span>
                      ) : (
                        <span className="text-slate-400 font-bold">خالص ✓</span>
                      )}
                    </td>
                    <td className="py-2.5 px-3">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        record.paymentMethod === 'cash' ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' :
                        record.paymentMethod === 'visa' ? 'bg-blue-50 text-blue-800 border border-blue-200' :
                        'bg-purple-50 text-purple-800 border border-purple-200'
                      }`}>
                        {record.paymentMethod === 'cash' ? 'خزينة نقدي' : record.paymentMethod === 'visa' ? 'فيزا' : 'تحويل'}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-center">
                      <div className="flex items-center justify-center gap-1">
                        <button
                          type="button"
                          onClick={() => setActiveTab('income')}
                          className="p-1.5 text-rose-900 hover:bg-rose-50 rounded-lg transition-colors"
                          title="عرض وتعديل في شاشة الفواتير"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            if (window.confirm(`هل أنت متأكد من حذف فاتورة المريض ${record.patientName}؟`)) {
                              deleteIncomeRecord(record.id);
                            }
                          }}
                          className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                          title="حذف الفاتورة"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="pt-2 flex justify-between items-center text-xs">
            <span className="text-slate-500">عرض أحدث 7 معاملات من إجمالي {filteredIncome.length}</span>
            <button
              type="button"
              onClick={() => setActiveTab('income')}
              className="text-rose-900 font-bold hover:underline flex items-center gap-1"
            >
              <span>فتح سجل الدخل والفواتير الكامل</span>
              <span>←</span>
            </button>
          </div>
        </div>

        {/* Right Column: Top Tests & Low Stock Alerts */}
        <div className="space-y-6">
          {/* Top Tests Card */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-500" />
                <span>التحاليل الأكثر طلباً وإيراداً</span>
              </h3>
              <span className="text-[10px] text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">إحصائيات حية</span>
            </div>

            <div className="space-y-3">
              {topTests.length === 0 ? (
                <div className="text-center py-4 text-xs text-slate-400">لا توجد بيانات مسجلة في هذه الفترة</div>
              ) : (
                topTests.map((t, idx) => (
                  <div key={t.name} className="flex items-center justify-between text-xs p-2 rounded-xl bg-slate-50 hover:bg-slate-100 transition-colors">
                    <div className="flex items-center gap-2.5">
                      <span className="w-5 h-5 rounded-full bg-rose-100 text-rose-900 font-bold text-[10px] flex items-center justify-center">
                        {idx + 1}
                      </span>
                      <div>
                        <div className="font-bold text-slate-900">{t.name}</div>
                        <div className="text-[10px] text-slate-500">{t.count} فحص تم إجراؤه</div>
                      </div>
                    </div>
                    <span className="font-mono font-bold text-rose-900">
                      {t.revenue.toLocaleString()} ج.م
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Quick Inventory Alert Box */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <FlaskConical className="w-4 h-4 text-rose-600" />
                <span>تنبيهات الكواشف والمستلزمات</span>
              </h3>
              <span className="text-[10px] font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded-full border border-rose-200">
                {lowStockItems.length} كواشف حرجة
              </span>
            </div>

            <div className="space-y-2">
              {lowStockItems.slice(0, 3).map(item => (
                <div key={item.id} className="p-2.5 bg-rose-50/50 rounded-xl border border-rose-100 flex items-center justify-between text-xs">
                  <div>
                    <div className="font-bold text-slate-900">{item.nameAr}</div>
                    <div className="text-[10px] text-rose-700 font-semibold">
                      الرصيد: {item.currentQuantity} {item.unit} (حد الأمان: {item.minThreshold})
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setActiveTab('inventory')}
                    className="px-2 py-1 bg-white hover:bg-rose-100 text-rose-800 text-[11px] font-bold rounded-lg border border-rose-200 shadow-2xs"
                  >
                    توريد
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      <TestCatalogManagerModal isOpen={catalogModalOpen} onClose={() => setCatalogModalOpen(false)} />
    </div>
  );
};
