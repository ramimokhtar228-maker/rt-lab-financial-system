import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Receipt,
  Users,
  FlaskConical,
  AlertTriangle,
  ArrowUpRight,
  PlusCircle,
  Printer,
  Calendar,
  CreditCard,
  Wallet,
  ShieldCheck,
  CheckCircle2,
  Clock,
  Sparkles,
  Search,
  Filter,
  Cpu,
  FileText,
  Activity,
  ArrowRight,
  Package,
  AlertCircle
} from 'lucide-react';
import { RTLogo } from './RTLogo';

export const DashboardModule: React.FC = () => {
  const {
    incomeRecords,
    expenses,
    reports,
    inventory,
    instruments,
    loyaltyProfiles,
    setActiveTab,
    setSelectedReportId,
    setIsPatientFormOpen,
    currentUser,
    profitConfig
  } = useApp();

  const [timeRange, setTimeRange] = useState<'today' | 'month' | 'all'>('today');

  const todayStr = new Date().toISOString().split('T')[0];
  const currentMonthStr = todayStr.substring(0, 7);

  // Filtered Income & Expenses
  const filteredIncome = useMemo(() => {
    return incomeRecords.filter(r => {
      if (timeRange === 'today') return r.createdAt.startsWith(todayStr);
      if (timeRange === 'month') return r.createdAt.startsWith(currentMonthStr);
      return true;
    });
  }, [incomeRecords, timeRange, todayStr, currentMonthStr]);

  const filteredExpenses = useMemo(() => {
    return expenses.filter(e => {
      if (timeRange === 'today') return e.date === todayStr;
      if (timeRange === 'month') return e.date.startsWith(currentMonthStr);
      return true;
    });
  }, [expenses, timeRange, todayStr, currentMonthStr]);

  const filteredReports = useMemo(() => {
    return reports.filter(r => {
      if (timeRange === 'today') return r.createdAt.startsWith(todayStr);
      if (timeRange === 'month') return r.createdAt.startsWith(currentMonthStr);
      return true;
    });
  }, [reports, timeRange, todayStr, currentMonthStr]);

  // Financial Metrics
  const totalGrossIncome = filteredIncome.reduce((sum, r) => sum + r.netAmount, 0);
  const totalPaidCash = filteredIncome.filter(r => r.paymentMethod === 'cash').reduce((sum, r) => sum + r.paidAmount, 0);
  const totalPaidVisa = filteredIncome.filter(r => r.paymentMethod === 'visa').reduce((sum, r) => sum + r.paidAmount, 0);
  const totalPaidElectronic = filteredIncome.filter(r => ['bank_transfer', 'instapay', 'vodafone_cash'].includes(r.paymentMethod)).reduce((sum, r) => sum + r.paidAmount, 0);
  const totalRemainingDebt = filteredIncome.reduce((sum, r) => sum + r.remainingAmount, 0);
  const totalExpensesAmount = filteredExpenses.reduce((sum, e) => sum + e.amount, 0);
  const netOperatingProfit = totalGrossIncome - totalExpensesAmount;

  // Diagnostic Metrics
  const totalTestsConducted = filteredReports.reduce((sum, r) => sum + r.profiles.reduce((pSum, p) => pSum + p.parameters.length, 0), 0);
  const verifiedReportsCount = filteredReports.filter(r => r.status === 'verified' || r.status === 'released').length;
  const pendingReportsCount = filteredReports.filter(r => r.status === 'draft' || r.status === 'in_progress').length;

  // Critical / Panic Values Search
  const panicAlerts = useMemo(() => {
    const list: { reportId: string; patientName: string; labNumber: string; paramName: string; result: string; unit: string; flag: string }[] = [];
    reports.forEach(rep => {
      rep.profiles.forEach(prof => {
        prof.parameters.forEach(p => {
          if (p.flag === 'PANIC_HIGH' || p.flag === 'PANIC_LOW') {
            list.push({
              reportId: rep.id,
              patientName: rep.patient.fullName,
              labNumber: rep.reportNumber,
              paramName: p.name,
              result: p.result,
              unit: p.unit,
              flag: p.flag
            });
          }
        });
      });
    });
    return list;
  }, [reports]);

  // Low Stock Items
  const lowStockItems = inventory.filter(i => i.currentQuantity <= i.minThreshold);

  return (
    <div className="space-y-6">
      {/* Executive Welcome & Time Range Filter */}
      <div className="bg-gradient-to-r from-slate-900 via-rose-950 to-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl border border-rose-900/50">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-900/80 text-rose-200 border border-rose-700/60 text-xs font-bold font-mono">
              <ShieldCheck className="w-3.5 h-3.5 text-rose-400" />
              <span>لوحة التحكم الإدارية والتشخيصية الموحدة</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
              أهلاً بك، {currentUser.nameAr}
            </h1>
            <p className="text-slate-300 text-xs sm:text-sm font-medium max-w-2xl leading-relaxed">
              متابعة حية ولحظية لحركة المرضى، إيرادات الخزينة والتحصيل، حالة أجهزة المعمل، واكتمال التقارير الطبية المعتمدة.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 bg-slate-800/80 p-1.5 rounded-2xl border border-slate-700">
            <button
              onClick={() => setTimeRange('today')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                timeRange === 'today' ? 'bg-rose-700 text-white shadow-md' : 'text-slate-400 hover:text-white'
              }`}
            >
              اليوم
            </button>
            <button
              onClick={() => setTimeRange('month')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                timeRange === 'month' ? 'bg-rose-700 text-white shadow-md' : 'text-slate-400 hover:text-white'
              }`}
            >
              هذا الشهر
            </button>
            <button
              onClick={() => setTimeRange('all')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                timeRange === 'all' ? 'bg-rose-700 text-white shadow-md' : 'text-slate-400 hover:text-white'
              }`}
            >
              كل السجلات
            </button>
          </div>
        </div>
      </div>

      {/* Critical Panic Value Alert Banner (if any) */}
      {panicAlerts.length > 0 && (
        <div className="bg-red-950/40 border border-red-800/80 rounded-2xl p-4 shadow-lg flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-red-600 text-white rounded-xl shadow-md animate-bounce">
              <AlertCircle className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-black text-red-200 text-sm">تنبيه قيم حرجة (Panic / Critical Values Alert)</span>
                <span className="bg-red-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full font-mono">
                  {panicAlerts.length} حالة تستوجب إبلاغ الطبيب فوراً
                </span>
              </div>
              <p className="text-red-300/90 text-xs mt-0.5">
                آخر حالة: {panicAlerts[0].patientName} - {panicAlerts[0].paramName}: <strong className="font-mono text-white text-sm">{panicAlerts[0].result} {panicAlerts[0].unit}</strong> ({panicAlerts[0].flag})
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              setSelectedReportId(panicAlerts[0].reportId);
              setActiveTab('diagnostic_editor');
            }}
            className="px-4 py-2 rounded-xl bg-red-700 hover:bg-red-600 text-white text-xs font-bold transition-all cursor-pointer shadow-md"
          >
            فتح تقرير الحالة
          </button>
        </div>
      )}

      {/* Primary KPI Grid (8 Cards) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Total Revenue */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm space-y-2 hover:border-emerald-300 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">إجمالي الإيرادات (Net Income)</span>
            <div className="p-2 rounded-xl bg-emerald-50 text-emerald-700">
              <Wallet className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-slate-900 font-mono">
              {totalGrossIncome.toLocaleString('ar-EG')}
            </span>
            <span className="text-xs font-bold text-slate-500">ج.م</span>
          </div>
          <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1 border-t border-slate-100">
            <span>نقدي: <strong className="text-slate-800 font-mono">{totalPaidCash}</strong></span>
            <span>فيزا/إلكتروني: <strong className="text-slate-800 font-mono">{totalPaidVisa + totalPaidElectronic}</strong></span>
          </div>
        </div>

        {/* Card 2: Net Operating Profit */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm space-y-2 hover:border-blue-300 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">صافي أرباح التشغيل (P&L)</span>
            <div className="p-2 rounded-xl bg-blue-50 text-blue-700">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className={`text-2xl font-black font-mono ${netOperatingProfit >= 0 ? 'text-blue-900' : 'text-red-700'}`}>
              {netOperatingProfit.toLocaleString('ar-EG')}
            </span>
            <span className="text-xs font-bold text-slate-500">ج.م</span>
          </div>
          <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1 border-t border-slate-100">
            <span>مصروفات: <strong className="text-red-700 font-mono">{totalExpensesAmount} ج.م</strong></span>
            <span>هامش ربح: <strong className="text-emerald-700 font-mono">{totalGrossIncome > 0 ? Math.round((netOperatingProfit / totalGrossIncome) * 100) : 0}%</strong></span>
          </div>
        </div>

        {/* Card 3: Patients & Samples */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm space-y-2 hover:border-rose-300 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">عينات وتحاليل المرضى</span>
            <div className="p-2 rounded-xl bg-rose-50 text-rose-700">
              <FlaskConical className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-slate-900 font-mono">
              {filteredReports.length}
            </span>
            <span className="text-xs font-bold text-slate-500">عينة ({totalTestsConducted} بارامتر)</span>
          </div>
          <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1 border-t border-slate-100">
            <span>معتمدة: <strong className="text-emerald-700 font-mono">{verifiedReportsCount}</strong></span>
            <span>قيد العمل: <strong className="text-amber-700 font-mono">{pendingReportsCount}</strong></span>
          </div>
        </div>

        {/* Card 4: Analyzers & Hardware LIS */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm space-y-2 hover:border-purple-300 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">أجهزة المعمل المتصلة</span>
            <div className="p-2 rounded-xl bg-purple-50 text-purple-700">
              <Cpu className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-slate-900 font-mono">
              {instruments.filter(i => i.status === 'online').length} / {instruments.length}
            </span>
            <span className="text-xs font-bold text-slate-500">جهاز نشط</span>
          </div>
          <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1 border-t border-slate-100">
            <span>Mindray, Roche, Sysmex</span>
            <button
              onClick={() => setActiveTab('instruments')}
              className="text-purple-700 font-bold hover:underline"
            >
              إدارة الربط
            </button>
          </div>
        </div>
      </div>

      {/* Secondary Operational Dashboard (Quick Actions & Workflow) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Quick Workflow Hub (Col 5) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm space-y-4">
            <h2 className="font-black text-slate-800 text-sm flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-rose-700" />
              <span>إجراءات التشغيل السريع للمعمل</span>
            </h2>

            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setIsPatientFormOpen(true)}
                className="p-3.5 rounded-xl bg-gradient-to-br from-rose-900 to-rose-950 text-white text-right space-y-1 shadow-md hover:scale-[1.02] transition-transform cursor-pointer"
              >
                <div className="p-2 rounded-lg bg-white/10 w-fit">
                  <PlusCircle className="w-4 h-4 text-rose-200" />
                </div>
                <div className="font-black text-xs">تسجيل مريض جديد</div>
                <div className="text-[10px] text-rose-200">حجز تحاليل وفوترة فورية</div>
              </button>

              <button
                onClick={() => setActiveTab('worklist')}
                className="p-3.5 rounded-xl bg-slate-900 text-white text-right space-y-1 shadow-md hover:scale-[1.02] transition-transform cursor-pointer"
              >
                <div className="p-2 rounded-lg bg-white/10 w-fit">
                  <FlaskConical className="w-4 h-4 text-amber-300" />
                </div>
                <div className="font-black text-xs">قائمة عمل المعمل</div>
                <div className="text-[10px] text-slate-300">{pendingReportsCount} عينة بانتظار الفحص</div>
              </button>

              <button
                onClick={() => setActiveTab('instruments')}
                className="p-3.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-right space-y-1 border border-slate-200 transition-colors cursor-pointer"
              >
                <div className="p-2 rounded-lg bg-purple-100 text-purple-700 w-fit">
                  <Cpu className="w-4 h-4" />
                </div>
                <div className="font-black text-xs">سحب نتائج الأجهزة</div>
                <div className="text-[10px] text-slate-500">قراءة تلقائية بدون إدخال يدوي</div>
              </button>

              <button
                onClick={() => setActiveTab('loyalty')}
                className="p-3.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-right space-y-1 border border-slate-200 transition-colors cursor-pointer"
              >
                <div className="p-2 rounded-lg bg-amber-100 text-amber-700 w-fit">
                  <CreditCard className="w-4 h-4" />
                </div>
                <div className="font-black text-xs">كروت ونقاط الولاء</div>
                <div className="text-[10px] text-slate-500">{loyaltyProfiles.length} مريض مشترك</div>
              </button>
            </div>

            {/* Low stock notice */}
            {lowStockItems.length > 0 && (
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs space-y-1.5">
                <div className="flex items-center justify-between font-bold text-amber-900">
                  <span className="flex items-center gap-1.5">
                    <Package className="w-3.5 h-3.5 text-amber-700" />
                    <span>تنبيه نواقص المحاليل والمستلزمات:</span>
                  </span>
                  <span className="font-mono">{lowStockItems.length} صنف</span>
                </div>
                <p className="text-[11px] text-amber-800 leading-snug">
                  {lowStockItems.slice(0, 2).map(i => i.nameAr).join('، ')} قارب على النفاد.
                </p>
                <button
                  onClick={() => setActiveTab('inventory')}
                  className="text-[11px] font-bold text-amber-900 underline block"
                >
                  فتح إدارة المخزون
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Recent Activity Feed (Col 7) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h2 className="font-black text-slate-800 text-sm flex items-center gap-2">
                <Clock className="w-4 h-4 text-slate-500" />
                <span>آخر تقارير وفواتير المرضى المسجلة</span>
              </h2>

              <button
                onClick={() => setActiveTab('reports_archive')}
                className="text-xs font-bold text-rose-800 hover:underline flex items-center gap-1"
              >
                <span>عرض الأرشيف الكامل</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="divide-y divide-slate-100">
              {reports.slice(0, 5).map(rep => {
                const isVerified = rep.status === 'verified';
                const matchingInv = incomeRecords.find(i => i.labNumber === rep.reportNumber);

                return (
                  <div key={rep.id} className="py-3 flex items-center justify-between gap-3 text-right">
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-xs text-slate-900">{rep.patient.fullName}</span>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 font-bold">
                          {rep.reportNumber}
                        </span>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          isVerified ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                        }`}>
                          {isVerified ? 'معتمد رسمياً' : 'قيد العمل'}
                        </span>
                      </div>

                      <div className="text-[11px] text-slate-500 flex items-center gap-2">
                        <span>{rep.patient.age} سنة ({rep.patient.gender === 'male' ? 'ذكر' : 'أنثى'})</span>
                        <span>·</span>
                        <span>{rep.profiles.map(p => p.profileCode).join(' + ')}</span>
                        {matchingInv && (
                          <>
                            <span>·</span>
                            <span className="font-bold text-slate-700 font-mono">{matchingInv.paidAmount} ج.م</span>
                          </>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          setSelectedReportId(rep.id);
                          setActiveTab('diagnostic_editor');
                        }}
                        className="px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors cursor-pointer"
                      >
                        عرض
                      </button>

                      <button
                        onClick={() => {
                          setSelectedReportId(rep.id);
                          setActiveTab('reports_archive');
                        }}
                        className="px-2.5 py-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-800 text-xs font-bold transition-colors cursor-pointer"
                      >
                        طباعة
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
