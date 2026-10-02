import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import {
  BarChart3,
  Calendar,
  Printer,
  Download,
  DollarSign,
  TrendingUp,
  PieChart,
  Layers,
  CheckCircle2,
  FileSpreadsheet,
  Building,
  ShieldAlert
} from 'lucide-react';

export const ReportsModule: React.FC = () => {
  const {
    incomeRecords,
    expenses,
    profitConfig,
    closeouts,
    saveCloseout,
    currentUser,
    financialMetrics,
    language
  } = useApp();

  const [reportPeriod, setReportPeriod] = useState<string>(new Date().toISOString().substring(0, 7)); // YYYY-MM
  const [activeReportTab, setActiveReportTab] = useState<'financial_statement' | 'departments' | 'closeout'>('financial_statement');

  // Daily Closeout State
  const [closeoutDate, setCloseoutDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [actualCashInput, setActualCashInput] = useState<number>(0);
  const [closeoutNotes, setCloseoutNotes] = useState<string>('');
  const [closeoutDoneAlert, setCloseoutDoneAlert] = useState(false);

  // Filter records for selected month
  const monthIncomes = useMemo(() => {
    return incomeRecords.filter(r => r.createdAt.startsWith(reportPeriod));
  }, [incomeRecords, reportPeriod]);

  const monthExpenses = useMemo(() => {
    return expenses.filter(e => e.date.startsWith(reportPeriod));
  }, [expenses, reportPeriod]);

  // Financial aggregates for month
  const monthStats = useMemo(() => {
    const totalGross = monthIncomes.reduce((acc, r) => acc + r.subtotal, 0);
    const totalDiscounts = monthIncomes.reduce((acc, r) => acc + r.discount, 0);
    const totalPaid = monthIncomes.reduce((acc, r) => acc + r.paidAmount, 0);
    const totalDeferred = monthIncomes.reduce((acc, r) => acc + r.remainingAmount, 0);

    const cashPaid = monthIncomes.filter(r => r.paymentMethod === 'cash').reduce((acc, r) => acc + r.paidAmount, 0);
    const visaPaid = monthIncomes.filter(r => r.paymentMethod === 'visa').reduce((acc, r) => acc + r.paidAmount, 0);
    const transferPaid = monthIncomes.filter(r => r.paymentMethod === 'bank_transfer').reduce((acc, r) => acc + r.paidAmount, 0);

    const totalExp = monthExpenses.reduce((acc, e) => acc + e.amount, 0);
    const netOperatingProfit = totalPaid - totalExp;

    const baseAmount = profitConfig.calculationBase === 'gross_income'
      ? totalPaid
      : Math.max(0, netOperatingProfit);

    const ceoShare = (baseAmount * profitConfig.ceoPercentage) / 100;
    const labShare = (baseAmount * profitConfig.labPercentage) / 100;
    const emergencyShare = (baseAmount * profitConfig.emergencyFundPercentage) / 100;

    return {
      casesCount: monthIncomes.length,
      totalGross,
      totalDiscounts,
      totalPaid,
      totalDeferred,
      cashPaid,
      visaPaid,
      transferPaid,
      totalExp,
      netOperatingProfit,
      ceoShare,
      labShare,
      emergencyShare
    };
  }, [monthIncomes, monthExpenses, profitConfig]);

  // Departmental Breakdown
  const departmentStats = useMemo(() => {
    const map: Record<string, { count: number; revenue: number }> = {};

    monthIncomes.forEach(inc => {
      inc.tests.forEach(test => {
        const cat = test.category || 'عام';
        if (!map[cat]) {
          map[cat] = { count: 0, revenue: 0 };
        }
        map[cat].count += 1;
        map[cat].revenue += test.price;
      });
    });

    return Object.entries(map).map(([name, data]) => ({
      name,
      count: data.count,
      revenue: data.revenue,
      percentage: monthStats.totalGross > 0 ? (data.revenue / monthStats.totalGross) * 100 : 0
    })).sort((a, b) => b.revenue - a.revenue);
  }, [monthIncomes, monthStats.totalGross]);

  // Cash Drawer Closeout computation for the selected date
  const selectedDateIncome = useMemo(() => {
    return incomeRecords.filter(r => r.createdAt.startsWith(closeoutDate));
  }, [incomeRecords, closeoutDate]);

  const selectedDateExpenses = useMemo(() => {
    return expenses.filter(e => e.date === closeoutDate);
  }, [expenses, closeoutDate]);

  const cashExpected = useMemo(() => {
    const cashIn = selectedDateIncome
      .filter(r => r.paymentMethod === 'cash')
      .reduce((sum, r) => sum + r.paidAmount, 0);
    const cashOut = selectedDateExpenses
      .filter(e => e.paymentMethod === 'cash')
      .reduce((sum, e) => sum + e.amount, 0);
    return Math.max(0, cashIn - cashOut);
  }, [selectedDateIncome, selectedDateExpenses]);

  const handleRunCloseout = (e: React.FormEvent) => {
    e.preventDefault();
    const discrepancy = actualCashInput - cashExpected;

    saveCloseout({
      date: closeoutDate,
      totalIncomeCash: selectedDateIncome.filter(r => r.paymentMethod === 'cash').reduce((s, r) => s + r.paidAmount, 0),
      totalIncomeVisa: selectedDateIncome.filter(r => r.paymentMethod === 'visa').reduce((s, r) => s + r.paidAmount, 0),
      totalIncomeTransfer: selectedDateIncome.filter(r => r.paymentMethod === 'bank_transfer').reduce((s, r) => s + r.paidAmount, 0),
      totalIncomeDeferred: selectedDateIncome.reduce((s, r) => s + r.remainingAmount, 0),
      totalExpenses: selectedDateExpenses.reduce((s, e) => s + e.amount, 0),
      expectedCashInDrawer: cashExpected,
      actualCashInDrawer: actualCashInput,
      discrepancy,
      closedBy: currentUser.nameAr,
      notes: closeoutNotes
    });

    setCloseoutDoneAlert(true);
    setTimeout(() => setCloseoutDoneAlert(false), 4000);
  };

  const handleExportCSV = () => {
    const headers = ['Invoice No', 'Lab No', 'Patient Name', 'Phone', 'Date', 'Subtotal', 'Discount', 'Net Amount', 'Paid Amount', 'Remaining', 'Method', 'Status'];
    const rows = monthIncomes.map(r => [
      r.invoiceNumber,
      r.labNumber,
      `"${r.patientName}"`,
      r.patientPhone,
      r.createdAt.split('T')[0],
      r.subtotal,
      r.discount,
      r.netAmount,
      r.paidAmount,
      r.remainingAmount,
      r.paymentMethod,
      r.paymentStatus
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `RT_Lab_Financial_Report_${reportPeriod}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      
      {/* Subheader */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm print:hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-black text-slate-900 tracking-tight flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-teal-700" />
              <span>{language === 'ar' ? 'التقارير المالية الشهرية التفصيلية وتقفيل الخزينة' : 'Detailed Monthly Financial Reports & Closeout'}</span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              {language === 'ar'
                ? 'استخراج القوائم المالية المعتمدة، تصنيف الإيرادات حسب الأقسام التشخيصية، وتقفيل الوردية اليومية.'
                : 'Generate financial statements, departmental revenue analytics, and daily shift cash count.'}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex bg-slate-100 p-1 rounded-lg text-xs font-semibold">
              <button
                type="button"
                onClick={() => setActiveReportTab('financial_statement')}
                className={`px-3 py-1.5 rounded-md transition-colors ${
                  activeReportTab === 'financial_statement' ? 'bg-white text-teal-900 shadow-sm font-bold' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                القائمة المالية المعتمدة
              </button>
              <button
                type="button"
                onClick={() => setActiveReportTab('departments')}
                className={`px-3 py-1.5 rounded-md transition-colors ${
                  activeReportTab === 'departments' ? 'bg-white text-slate-900 shadow-sm font-bold' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                تحليل الأقسام التشخيصية
              </button>
              <button
                type="button"
                onClick={() => setActiveReportTab('closeout')}
                className={`px-3 py-1.5 rounded-md transition-colors ${
                  activeReportTab === 'closeout' ? 'bg-white text-slate-900 shadow-sm font-bold' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                تقفيل الوردية والخزينة
              </button>
            </div>

            <button
              onClick={() => window.print()}
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
            >
              <Printer className="w-4 h-4 text-teal-700" />
              <span>طباعة</span>
            </button>

            <button
              onClick={handleExportCSV}
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors"
            >
              <Download className="w-4 h-4" />
              <span>تصدير Excel (CSV)</span>
            </button>
          </div>
        </div>
      </div>

      {/* VIEW 1: OFFICIAL MONTHLY FINANCIAL STATEMENT */}
      {activeReportTab === 'financial_statement' && (
        <div className="space-y-6">
          
          {/* Month Selector Bar (hidden in print) */}
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between gap-4 print:hidden">
            <div className="flex items-center gap-3">
              <label className="text-xs font-bold text-slate-700">تقرير شهر:</label>
              <input
                type="month"
                value={reportPeriod}
                onChange={e => setReportPeriod(e.target.value)}
                className="text-xs px-3 py-1.5 rounded-lg border border-slate-300 font-mono font-bold"
              />
            </div>
            <div className="text-xs text-slate-500">
              عدد الحالات المسجلة بالشهر: <strong className="font-mono text-slate-900">{monthStats.casesCount} حالة</strong>
            </div>
          </div>

          {/* Printable Official Financial Document */}
          <div className="printable-content bg-white p-8 rounded-xl border border-slate-200 shadow-sm space-y-6 print:border-none print:p-0">
            {/* Document Header */}
            <div className="border-b-2 border-slate-900 pb-4 flex items-center justify-between">
              <div>
                <h1 className="text-xl font-black text-slate-900">
                  معامل RT للتشخيص والتحاليل الطبية
                </h1>
                <p className="text-xs text-slate-600 font-semibold mt-0.5">
                  القائمة المالية والحسابية الختامية المعتمدة (Financial Closeout Statement)
                </p>
                <p className="text-xs text-slate-500">
                  الفترة المالية: شهر {reportPeriod} · فرع قصر العيني الرئيسي وكافة الفروع
                </p>
              </div>
              <div className="text-left font-mono">
                <div className="w-12 h-12 bg-teal-800 text-white font-black text-2xl flex items-center justify-center rounded-lg">
                  RT
                </div>
                <div className="text-[10px] text-slate-500 mt-1">مدير المعمل: أ.د. رامي مختار</div>
              </div>
            </div>

            {/* Income Breakdown Grid */}
            <div>
              <h3 className="text-xs font-black text-slate-900 bg-slate-100 p-2 rounded mb-3">
                أولاً: بيان الإيرادات والتحصيلات المحققة
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                <div className="p-3 bg-slate-50 rounded border border-slate-200">
                  <span className="text-slate-500 block">إجمالي القيمة الاسمية:</span>
                  <span className="text-base font-bold font-mono text-slate-900">
                    {monthStats.totalGross.toLocaleString()} ج.م
                  </span>
                </div>
                <div className="p-3 bg-slate-50 rounded border border-slate-200">
                  <span className="text-slate-500 block">الخصومات الممنوحة:</span>
                  <span className="text-base font-bold font-mono text-rose-600">
                    -{monthStats.totalDiscounts.toLocaleString()} ج.م
                  </span>
                </div>
                <div className="p-3 bg-emerald-50 rounded border border-emerald-200">
                  <span className="text-emerald-800 font-bold block">إجمالي الدخل المحصل فعلياً:</span>
                  <span className="text-base font-black font-mono text-emerald-900">
                    {monthStats.totalPaid.toLocaleString()} ج.م
                  </span>
                </div>
                <div className="p-3 bg-slate-50 rounded border border-slate-200">
                  <span className="text-slate-500 block">متبقيات آجلة قيد التحصيل:</span>
                  <span className="text-base font-bold font-mono text-slate-700">
                    {monthStats.totalDeferred.toLocaleString()} ج.م
                  </span>
                </div>
              </div>

              {/* Payment Methods split */}
              <div className="grid grid-cols-3 gap-3 text-xs mt-2 text-slate-600">
                <div className="p-2 border rounded text-center">
                  <span>نقدي (خزينة): </span>
                  <strong className="font-mono text-slate-900">{monthStats.cashPaid.toLocaleString()} ج.م</strong>
                </div>
                <div className="p-2 border rounded text-center">
                  <span>فيزا وبطاقات: </span>
                  <strong className="font-mono text-slate-900">{monthStats.visaPaid.toLocaleString()} ج.م</strong>
                </div>
                <div className="p-2 border rounded text-center">
                  <span>إنستاباي / تحويلات: </span>
                  <strong className="font-mono text-slate-900">{monthStats.transferPaid.toLocaleString()} ج.م</strong>
                </div>
              </div>
            </div>

            {/* Operating Expenses Breakdown */}
            <div>
              <h3 className="text-xs font-black text-slate-900 bg-slate-100 p-2 rounded mb-3">
                ثانياً: بيان المصروفات التشغيلية للمعمل
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs mb-3">
                <div className="p-3 bg-rose-50 rounded border border-rose-200">
                  <span className="text-rose-800 font-bold block">إجمالي المصروفات المنصرفة:</span>
                  <span className="text-base font-black font-mono text-rose-900">
                    -{monthStats.totalExp.toLocaleString()} ج.م
                  </span>
                </div>
                <div className="p-3 bg-slate-50 rounded border border-slate-200">
                  <span className="text-slate-500 block">نسبة المصروفات من الإيراد:</span>
                  <span className="text-base font-bold font-mono text-slate-800">
                    {monthStats.totalPaid > 0 ? ((monthStats.totalExp / monthStats.totalPaid) * 100).toFixed(1) : 0}%
                  </span>
                </div>
                <div className="p-3 bg-slate-50 rounded border border-slate-200">
                  <span className="text-slate-500 block">عدد بنود الصرف المسجلة:</span>
                  <span className="text-base font-bold font-mono text-slate-800">
                    {monthExpenses.length} سند صرف
                  </span>
                </div>
              </div>
            </div>

            {/* Net Operating Surplus and Profit Shares */}
            <div>
              <h3 className="text-xs font-black text-slate-900 bg-teal-50 text-teal-900 p-2 rounded mb-3 border border-teal-200">
                ثالثاً: صافي الأرباح واعتماد توزيع نسب المعمل والـ CEO
              </h3>

              <div className="bg-slate-50 p-4 rounded-lg border border-slate-300 space-y-3 text-xs">
                <div className="flex justify-between items-center text-sm font-bold text-slate-900 pb-2 border-b border-slate-200">
                  <span>صافي الفائض التشغيلي (الإيراد المحصل - المصروفات):</span>
                  <span className="text-base font-mono font-black text-teal-950">
                    {monthStats.netOperatingProfit.toLocaleString()} ج.م
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
                  <div className="p-3 bg-white rounded border border-emerald-200">
                    <div className="flex justify-between text-slate-600 font-semibold">
                      <span>حصة المدير التنفيذي (CEO):</span>
                      <span className="font-mono text-emerald-800 font-bold">{profitConfig.ceoPercentage}%</span>
                    </div>
                    <div className="text-lg font-black font-mono text-emerald-900 mt-1">
                      {monthStats.ceoShare.toLocaleString()} ج.م
                    </div>
                    <div className="text-[10px] text-slate-500 mt-0.5">{profitConfig.ceoNameAr}</div>
                  </div>

                  <div className="p-3 bg-white rounded border border-teal-200">
                    <div className="flex justify-between text-slate-600 font-semibold">
                      <span>حصة المعمل وتطوير الأجهزة:</span>
                      <span className="font-mono text-teal-800 font-bold">{profitConfig.labPercentage}%</span>
                    </div>
                    <div className="text-lg font-black font-mono text-teal-900 mt-1">
                      {monthStats.labShare.toLocaleString()} ج.م
                    </div>
                    <div className="text-[10px] text-slate-500 mt-0.5">مخصص إعادة الاستثمار والتوسعات</div>
                  </div>

                  <div className="p-3 bg-white rounded border border-amber-200">
                    <div className="flex justify-between text-slate-600 font-semibold">
                      <span>احتياطي الطوارئ والتقلبات:</span>
                      <span className="font-mono text-amber-800 font-bold">{profitConfig.emergencyFundPercentage}%</span>
                    </div>
                    <div className="text-lg font-black font-mono text-amber-900 mt-1">
                      {monthStats.emergencyShare.toLocaleString()} ج.م
                    </div>
                    <div className="text-[10px] text-slate-500 mt-0.5">مخصص الأمان المالي لمعامل RT</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Official Signatures Bar */}
            <div className="pt-8 border-t-2 border-slate-200 flex justify-between text-xs text-slate-700">
              <div className="text-center">
                <div>إعداد ومراجعة الحسابات والخزينة</div>
                <div className="font-bold text-slate-900 mt-4">أ / حازم الشريف</div>
                <div className="text-[10px] text-slate-400">مدير الإدارة المالية</div>
              </div>

              <div className="text-center">
                <div>مراجعة وتدقيق الجودة الطبية</div>
                <div className="font-bold text-slate-900 mt-4">د. مروة عبد الرحمن</div>
                <div className="text-[10px] text-slate-400">استشاري مشارك الحوكمة</div>
              </div>

              <div className="text-center">
                <div>اعتماد رئيس مجلس الإدارة والمدير التنفيذي (CEO)</div>
                <div className="font-bold text-slate-900 mt-4">أ.د. رامي مختار</div>
                <div className="text-[10px] text-slate-400">استشاري الباثولوجيا الإكلينيكية والكيميائية</div>
              </div>
            </div>

          </div>

        </div>
      )}

      {/* VIEW 2: DEPARTMENTAL REVENUE BREAKDOWN */}
      {activeReportTab === 'departments' && (
        <div className="space-y-6">
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-4">
            <h3 className="font-bold text-sm text-slate-900">
              تحليل مساهمة الأقسام التشخيصية في دخل المعمل (شهر {reportPeriod})
            </h3>

            <div className="space-y-3">
              {departmentStats.map((dept, idx) => (
                <div key={idx} className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-xs">
                  <div className="flex justify-between items-center mb-1.5">
                    <span className="font-bold text-slate-900">{dept.name}</span>
                    <div className="flex items-center gap-3">
                      <span className="text-slate-500 font-mono">{dept.count} فحص تم إجراؤه</span>
                      <span className="font-mono font-bold text-emerald-800">{dept.revenue.toLocaleString()} ج.م</span>
                      <span className="font-mono font-bold text-slate-700 w-12 text-left">
                        {dept.percentage.toFixed(1)}%
                      </span>
                    </div>
                  </div>
                  {/* Progress bar */}
                  <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                    <div
                      className="bg-teal-700 h-2 rounded-full transition-all duration-500"
                      style={{ width: `${dept.percentage}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* VIEW 3: DAILY SHIFT CLOSEOUT */}
      {activeReportTab === 'closeout' && (
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-5">
            <div className="border-b pb-3">
              <h3 className="font-bold text-base text-slate-900 flex items-center gap-2">
                <ShieldAlert className="w-5 h-5 text-teal-700" />
                <span>تقفيل الخزينة اليومية ومطابقة النقدية الفعلية (Daily Cash Drawer Reconciliation)</span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                تصفية عهدة الخزينة نهاية الوردية، مقارنة النقدية المحصلة فعلياً بالسيستم وحساب العجز أو الزيادة.
              </p>
            </div>

            <form onSubmit={handleRunCloseout} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">تاريخ تقفيل الوردية:</label>
                  <input
                    type="date"
                    value={closeoutDate}
                    onChange={e => setCloseoutDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 font-mono font-bold"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-bold mb-1">المحاسب المسؤول عن التقفيل:</label>
                  <input
                    type="text"
                    disabled
                    value={currentUser.nameAr}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-slate-100 font-medium"
                  />
                </div>
              </div>

              {/* Day Calculated Stats */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50 p-4 rounded-lg border border-slate-200">
                <div>
                  <span className="text-slate-500 block">كاش محصل بالفواتير:</span>
                  <span className="font-mono font-bold text-slate-900 text-sm">
                    {selectedDateIncome.filter(r => r.paymentMethod === 'cash').reduce((s, r) => s + r.paidAmount, 0).toLocaleString()} ج
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 block">مصروفات نقدية خرجت:</span>
                  <span className="font-mono font-bold text-rose-600 text-sm">
                    -{selectedDateExpenses.filter(e => e.paymentMethod === 'cash').reduce((s, e) => s + e.amount, 0).toLocaleString()} ج
                  </span>
                </div>
                <div>
                  <span className="text-emerald-800 font-bold block">النقدية المتوقعة بالدرج:</span>
                  <span className="font-mono font-black text-emerald-900 text-base">
                    {cashExpected.toLocaleString()} ج.م
                  </span>
                </div>
                <div>
                  <span className="text-blue-800 font-bold block">متحصلات الفيزا والتحويلات:</span>
                  <span className="font-mono font-bold text-blue-900 text-sm">
                    {selectedDateIncome.filter(r => r.paymentMethod !== 'cash').reduce((s, r) => s + r.paidAmount, 0).toLocaleString()} ج
                  </span>
                </div>
              </div>

              {/* Actual Cash Input */}
              <div className="bg-teal-50 p-4 rounded-lg border border-teal-200 space-y-3">
                <label className="block text-teal-950 font-black text-sm">
                  العد الفعلي للنقدية الموجودة بالدرج الآن (ج.م) *:
                </label>
                <div className="flex gap-4 items-center">
                  <input
                    type="number"
                    min={0}
                    value={actualCashInput}
                    onChange={e => setActualCashInput(Number(e.target.value))}
                    className="w-48 px-4 py-2.5 rounded-lg border border-teal-400 font-mono text-lg font-black text-teal-950 bg-white"
                  />
                  <div className="text-xs">
                    {actualCashInput === cashExpected ? (
                      <span className="text-emerald-800 font-bold flex items-center gap-1">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        الخزينة مطابقة تماماً (0 عجز / 0 زيادة)
                      </span>
                    ) : actualCashInput > cashExpected ? (
                      <span className="text-blue-700 font-bold">
                        يوجد زيادة نقدية بالدرج بقيمة: +{(actualCashInput - cashExpected).toLocaleString()} ج.م
                      </span>
                    ) : (
                      <span className="text-rose-600 font-bold">
                        يوجد عجز نقدي بالدرج بقيمة: {(actualCashInput - cashExpected).toLocaleString()} ج.م
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">ملاحظات تقفيل الوردية:</label>
                <input
                  type="text"
                  value={closeoutNotes}
                  onChange={e => setCloseoutNotes(e.target.value)}
                  placeholder="ملاحظات تسليم الوردية للمحاسب القادم أو إيداع البنك..."
                  className="w-full px-3 py-2 rounded-lg border border-slate-300"
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-teal-800 hover:bg-teal-900 text-white font-bold rounded-lg shadow-sm"
                >
                  اعتماد وحفظ تقفيل الخزينة
                </button>
              </div>

              {closeoutDoneAlert && (
                <div className="p-3 bg-emerald-50 text-emerald-800 text-xs font-bold rounded-lg text-center">
                  تم حفظ واعتماد تقفيل الخزينة لتاريخ {closeoutDate} بنجاح وتسجيل العملية في سجل الرقابة.
                </div>
              )}
            </form>

            {/* Saved Closeouts List */}
            {closeouts.length > 0 && (
              <div className="pt-4 border-t space-y-3">
                <h4 className="font-bold text-xs text-slate-900">سجل التقفيلات السابقة المعتمدة:</h4>
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {closeouts.map(c => (
                    <div key={c.id} className="p-3 bg-slate-50 rounded border text-xs flex justify-between items-center">
                      <div>
                        <span className="font-bold text-slate-900">تقفيل تاريخ: {c.date}</span>
                        <span className="mx-2">·</span>
                        <span className="text-slate-500">بواسطة: {c.closedBy}</span>
                      </div>
                      <div className="flex gap-4 font-mono">
                        <span>متوقع: {c.expectedCashInDrawer} ج</span>
                        <span className="font-bold">فعلي: {c.actualCashInDrawer} ج</span>
                        <span className={`font-bold ${c.discrepancy === 0 ? 'text-emerald-700' : 'text-rose-600'}`}>
                          فارق: {c.discrepancy} ج
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

    </div>
  );
};
