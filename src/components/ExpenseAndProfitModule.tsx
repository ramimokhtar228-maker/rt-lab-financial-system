import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { ExpenseCategory, ExpenseRecord, PaymentMethod, ProfitShareConfig } from '../types';
import {
  PieChart,
  Plus,
  Trash2,
  Edit2,
  DollarSign,
  TrendingDown,
  Percent,
  CheckCircle2,
  Shield,
  Layers,
  Calendar,
  Building,
  AlertCircle
} from 'lucide-react';

export const ExpenseAndProfitModule: React.FC = () => {
  const {
    expenses,
    addExpense,
    updateExpense,
    deleteExpense,
    profitConfig,
    updateProfitConfig,
    currentUser,
    financialMetrics,
    language
  } = useApp();

  const [activeSubTab, setActiveSubTab] = useState<'expenses' | 'profit_split'>('expenses');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editExpense, setEditExpense] = useState<ExpenseRecord | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editAmount, setEditAmount] = useState<number>(0);
  const [editDept, setEditDept] = useState("");
  const [editPaidTo, setEditPaidTo] = useState("");
  const [editPaymentMethod, setEditPaymentMethod] = useState<PaymentMethod>("cash");
  const [editNotes, setEditNotes] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<'all' | ExpenseCategory>('all');
  const [searchTerm, setSearchTerm] = useState('');

  // Add Expense Form State
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<ExpenseCategory>('reagents_chemicals');
  const [amount, setAmount] = useState<number>(0);
  const [paidTo, setPaidTo] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('cash');
  const [date, setDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [department, setDepartment] = useState('قسم الكيمياء الطبية');
  const [notes, setNotes] = useState('');

  // Profit Config Form State
  const [ceoPercent, setCeoPercent] = useState<number>(profitConfig.ceoPercentage);
  const [labPercent, setLabPercent] = useState<number>(profitConfig.labPercentage);
  const [emergencyPercent, setEmergencyPercent] = useState<number>(profitConfig.emergencyFundPercentage);
  const [calcBase, setCalcBase] = useState<'net_profit' | 'gross_income'>(profitConfig.calculationBase);
  const [configSavedNotice, setConfigSavedNotice] = useState(false);

  // Filtered Expenses
  const filteredExpenses = useMemo(() => {
    return expenses.filter(e => {
      if (categoryFilter !== 'all' && e.category !== categoryFilter) return false;
      if (searchTerm.trim()) {
        const term = searchTerm.toLowerCase();
        const matchesTitle = e.title.toLowerCase().includes(term);
        const matchesPaidTo = e.paidTo.toLowerCase().includes(term);
        const matchesDept = e.department.toLowerCase().includes(term);
        const matchesNo = e.expenseNumber.toLowerCase().includes(term);
        if (!matchesTitle && !matchesPaidTo && !matchesDept && !matchesNo) return false;
      }
      return true;
    });
  }, [expenses, categoryFilter, searchTerm]);

  // Expenses Category Aggregation
  const categoryStats = useMemo(() => {
    const map: Record<ExpenseCategory, number> = {
      reagents_chemicals: 0,
      rent_utilities: 0,
      salaries_wages: 0,
      equipment_maintenance: 0,
      lab_to_lab: 0,
      waste_disposal: 0,
      marketing_stationery: 0,
      other: 0
    };

    expenses.forEach(e => {
      map[e.category] = (map[e.category] || 0) + e.amount;
    });

    return map;
  }, [expenses]);

    const handleOpenEditExpense = (exp: ExpenseRecord) => {
    setEditExpense(exp);
    setEditTitle(exp.title);
    setEditAmount(exp.amount);
    setEditDept(exp.department);
    setEditPaidTo(exp.paidTo);
    setEditPaymentMethod(exp.paymentMethod);
    setEditNotes(exp.notes || '');
  };

  const handleSaveEditExpense = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editExpense) return;
    updateExpense(editExpense.id, {
      title: editTitle,
      amount: editAmount,
      department: editDept,
      paidTo: editPaidTo,
      paymentMethod: editPaymentMethod,
      notes: editNotes
    });
    setEditExpense(null);
  };

  const handleSaveExpense = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || amount <= 0) {
      alert('يرجى كتابة بيان المصروف والمبلغ بشكل صحيح.');
      return;
    }

    addExpense({
      expenseNumber: `EXP-${new Date().getFullYear()}-${(expenses.length + 47).toString().padStart(4, '0')}`,
      title: title.trim(),
      category,
      amount,
      paidTo: paidTo.trim() || 'جهة التوريد',
      paymentMethod,
      date,
      approvedBy: currentUser.nameAr,
      department,
      notes
    });

    setIsAddModalOpen(false);
    setTitle('');
    setAmount(0);
    setPaidTo('');
    setNotes('');
  };

  const handleSaveProfitConfig = (e: React.FormEvent) => {
    e.preventDefault();
    const sum = ceoPercent + labPercent + emergencyPercent;
    if (sum !== 100) {
      alert(language === 'ar' ? 'مجموع النسب المئوية يجب أن يساوي 100% تماماً.' : 'Total percentages must equal 100%');
      return;
    }

    updateProfitConfig({
      ...profitConfig,
      ceoPercentage: ceoPercent,
      labPercentage: labPercent,
      emergencyFundPercentage: emergencyPercent,
      calculationBase: calcBase
    });

    setConfigSavedNotice(true);
    setTimeout(() => setConfigSavedNotice(false), 3000);
  };

  const categoryNames: Record<ExpenseCategory, string> = {
    reagents_chemicals: 'كواشف ومستلزمات المعمل',
    rent_utilities: 'إيجار ومرافق وفواتير',
    salaries_wages: 'مرتبات وأجور إضافية',
    equipment_maintenance: 'صيانة ومعايرة الأجهزة',
    lab_to_lab: 'تحاليل محولة (Lab-to-Lab)',
    waste_disposal: 'تخلص ونفايات طبية',
    marketing_stationery: 'مطبوعات وتسويق',
    other: 'مصروفات تشغيلية أخرى'
  };

  return (
    <div className="space-y-6">
      
      {/* Sub Header Navigation */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-black text-slate-900 tracking-tight flex items-center gap-2">
              <PieChart className="w-5 h-5 text-rose-800" />
              <span>{language === 'ar' ? 'المصروفات وتوزيع نسب الأرباح للمعمل والـ CEO' : 'Expenses & Profit Share Distribution'}</span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              {language === 'ar'
                ? 'متابعة بنود الصرف، حساب صافي الفائض التشغيلي، واحتساب وتوزيع نسب أرباح معمل RT ونسبة رئيس مجلس الإدارة (أ.د. رامي مختار).'
                : 'Track operational expenditures, net lab profit, and CEO / Lab split allocation.'}
            </p>
          </div>

          {/* Subtabs switch */}
          <div className="flex items-center gap-2">
            <div className="flex bg-slate-100 p-1 rounded-lg text-xs font-semibold">
              <button
                type="button"
                onClick={() => setActiveSubTab('expenses')}
                className={`px-3 py-1.5 rounded-md transition-colors ${
                  activeSubTab === 'expenses'
                    ? 'bg-white text-slate-900 shadow-sm font-bold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {language === 'ar' ? 'سجل المصروفات التشغيلية' : 'Operating Expenses'}
              </button>
              <button
                type="button"
                onClick={() => setActiveSubTab('profit_split')}
                className={`px-3 py-1.5 rounded-md transition-colors ${
                  activeSubTab === 'profit_split'
                    ? 'bg-white text-rose-950 shadow-sm font-bold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {language === 'ar' ? 'نسب المعمل ونسبة CEO' : 'Profit Split & CEO Share'}
              </button>
            </div>

            {activeSubTab === 'expenses' && (
              <button
                onClick={() => setIsAddModalOpen(true)}
                className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors shadow-sm"
              >
                <Plus className="w-4 h-4" />
                <span>{language === 'ar' ? 'إضافة سند صرف جديد' : 'New Expense'}</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* VIEW 1: EXPENSES REGISTER */}
      {activeSubTab === 'expenses' && (
        <div className="space-y-6">
          
          {/* Category Breakdown Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3.5 bg-white rounded-xl border border-slate-200 shadow-sm">
              <div className="text-[11px] font-bold text-slate-500">إجمالي المصروفات</div>
              <div className="text-lg font-black font-mono text-rose-600 mt-1">
                {financialMetrics.totalExpenses.toLocaleString()} ج.م
              </div>
              <div className="text-[10px] text-slate-400 mt-0.5">{expenses.length} بند صرف مسجل</div>
            </div>

            <div className="p-3.5 bg-white rounded-xl border border-slate-200 shadow-sm">
              <div className="text-[11px] font-bold text-slate-500">كواشف وكيماويات المعمل</div>
              <div className="text-lg font-black font-mono text-amber-700 mt-1">
                {categoryStats.reagents_chemicals.toLocaleString()} ج.م
              </div>
              <div className="text-[10px] text-slate-400 mt-0.5">
                {((categoryStats.reagents_chemicals / (financialMetrics.totalExpenses || 1)) * 100).toFixed(1)}% من المصروفات
              </div>
            </div>

            <div className="p-3.5 bg-white rounded-xl border border-slate-200 shadow-sm">
              <div className="text-[11px] font-bold text-slate-500">إيجار ومقرات ومرافق</div>
              <div className="text-lg font-black font-mono text-slate-900 mt-1">
                {categoryStats.rent_utilities.toLocaleString()} ج.م
              </div>
              <div className="text-[10px] text-slate-400 mt-0.5">ثابت شهرياً</div>
            </div>

            <div className="p-3.5 bg-white rounded-xl border border-slate-200 shadow-sm">
              <div className="text-[11px] font-bold text-slate-500">صيانة ومعايرة وتحاليل L2L</div>
              <div className="text-lg font-black font-mono text-rose-900 mt-1">
                {(categoryStats.equipment_maintenance + categoryStats.lab_to_lab).toLocaleString()} ج.م
              </div>
              <div className="text-[10px] text-slate-400 mt-0.5">أجهزة وإحالات خارجية</div>
            </div>
          </div>

          {/* Filter Bar */}
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-wrap items-center justify-between gap-3">
            <div className="flex-1 min-w-[240px] max-w-sm">
              <input
                type="text"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                placeholder="ابحث ببيان الصرف، الجهة المدفوع لها، القسم..."
                className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-rose-800"
              />
            </div>

            <div className="flex items-center gap-2">
              <select
                value={categoryFilter}
                onChange={e => setCategoryFilter(e.target.value as 'all' | ExpenseCategory)}
                className="text-xs py-2 px-3 rounded-lg border border-slate-300 bg-white font-medium"
              >
                <option value="all">جميع تصنيفات المصروفات</option>
                {Object.entries(categoryNames).map(([key, name]) => (
                  <option key={key} value={key}>{name}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Expenses Table */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-right">
                <thead>
                  <tr className="bg-slate-100/75 text-slate-700 font-bold border-b border-slate-200">
                    <th className="py-3 px-4">رقم الإذن</th>
                    <th className="py-3 px-4">التاريخ</th>
                    <th className="py-3 px-4">بيان وبند المصروف</th>
                    <th className="py-3 px-4">التصنيف</th>
                    <th className="py-3 px-4">القسم المعني</th>
                    <th className="py-3 px-4">المستفيد / جهة الصرف</th>
                    <th className="py-3 px-4">طريقة الدفع</th>
                    <th className="py-3 px-4">المبلغ</th>
                    <th className="py-3 px-4">المعتمد</th>
                    <th className="py-3 px-4 text-center">إجراءات</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredExpenses.length === 0 ? (
                    <tr>
                      <td colSpan={10} className="py-10 text-center text-slate-400">
                        لا توجد مصروفات مسجلة مطابقة للبحث
                      </td>
                    </tr>
                  ) : (
                    filteredExpenses.map(exp => (
                      <tr key={exp.id} className="hover:bg-slate-50 transition-colors">
                        <td className="py-3 px-4 font-mono font-bold text-slate-800">{exp.expenseNumber}</td>
                        <td className="py-3 px-4 font-mono text-slate-600">{exp.date}</td>
                        <td className="py-3 px-4">
                          <div className="font-bold text-slate-900">{exp.title}</div>
                          {exp.notes && <div className="text-[10px] text-slate-500 mt-0.5">{exp.notes}</div>}
                        </td>
                        <td className="py-3 px-4">
                          <span className="font-medium text-slate-700">
                            {categoryNames[exp.category]}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-slate-600">{exp.department}</td>
                        <td className="py-3 px-4 font-semibold text-slate-800">{exp.paidTo}</td>
                        <td className="py-3 px-4">
                          <span className="text-slate-600">
                            {exp.paymentMethod === 'cash' ? 'خزينة نقدي' :
                             exp.paymentMethod === 'bank_transfer' ? 'تحويل بنكي' : 'فيزا'}
                          </span>
                        </td>
                        <td className="py-3 px-4 font-mono font-bold text-rose-700 text-sm">
                          {exp.amount.toLocaleString()} ج.م
                        </td>
                        <td className="py-3 px-4 text-slate-600">{exp.approvedBy}</td>
                        <td className="py-3 px-4 text-center">
                          <div className="flex items-center justify-center gap-1.5">
                            <button
                              type="button"
                              onClick={() => handleOpenEditExpense(exp)}
                              className="p-1 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded transition-colors ml-1"
                              title="تعديل سند الصرف"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => {
                                if (confirm(`هل تريد بالتأكيد حذف سند الصرف: ${exp.title}؟`)) {
                                  deleteExpense(exp.id);
                                }
                              }}
                              className="p-1 text-rose-500 hover:text-rose-700 rounded transition-colors"
                              title="حذف"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      )}

      {/* VIEW 2: PROFIT SHARE & CEO PERCENTAGE CALCULATION */}
      {activeSubTab === 'profit_split' && (
        <div className="space-y-6">
          
          {/* Strategic Profit Distribution Dashboard Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            
            {/* CEO Share Card */}
            <div className="p-6 bg-gradient-to-br from-emerald-900 to-slate-950 text-white rounded-xl shadow-lg border border-rose-900 space-y-3 relative overflow-hidden">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-rose-200 tracking-wider">
                  حصة المدير التنفيذي (CEO Share)
                </span>
                <span className="text-xs font-mono font-bold bg-rose-900/80 px-2 py-0.5 rounded text-white border border-rose-700">
                  {profitConfig.ceoPercentage}%
                </span>
              </div>
              <div className="text-2xl sm:text-3xl font-black font-mono tracking-tight text-white">
                {financialMetrics.ceoShare.toLocaleString()} <span className="text-base font-normal">ج.م</span>
              </div>
              <div className="text-xs text-rose-100 font-medium">
                المستحق: {profitConfig.ceoNameAr}
              </div>
              <div className="pt-2 border-t border-rose-900/60 text-[11px] text-rose-200 flex justify-between">
                <span>أساس الاحتساب:</span>
                <span className="font-bold">
                  {profitConfig.calculationBase === 'net_profit' ? 'صافي الأرباح (بعد المصروفات)' : 'إجمالي الإيرادات المحصلة'}
                </span>
              </div>
            </div>

            {/* Lab Reinvestment & Operating Share */}
            <div className="p-6 bg-gradient-to-br from-slate-900 to-slate-800 text-white rounded-xl shadow-lg border border-slate-700 space-y-3 relative overflow-hidden">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-300 tracking-wider">
                  حصة المعمل وتطوير الأجهزة (Lab Share)
                </span>
                <span className="text-xs font-mono font-bold bg-slate-700 px-2 py-0.5 rounded text-white border border-slate-600">
                  {profitConfig.labPercentage}%
                </span>
              </div>
              <div className="text-2xl sm:text-3xl font-black font-mono tracking-tight text-rose-400">
                {financialMetrics.labShare.toLocaleString()} <span className="text-base font-normal">ج.م</span>
              </div>
              <div className="text-xs text-slate-300 font-medium">
                مخصص لتحديث الكواشف، صيانة أجهزة التحاليل، وتوسعات الفروع
              </div>
              <div className="pt-2 border-t border-slate-700 text-[11px] text-slate-300 flex justify-between">
                <span>إعادة الاستثمار المعملي:</span>
                <span className="font-bold text-amber-400">نشط ومعتمد</span>
              </div>
            </div>

            {/* Emergency & Reserve Fund */}
            <div className="p-6 bg-gradient-to-br from-amber-950 to-slate-900 text-white rounded-xl shadow-lg border border-amber-900/60 space-y-3 relative overflow-hidden">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-amber-200 tracking-wider">
                  احتياطي الطوارئ والتقلبات
                </span>
                <span className="text-xs font-mono font-bold bg-amber-900 px-2 py-0.5 rounded text-amber-100 border border-amber-700">
                  {profitConfig.emergencyFundPercentage}%
                </span>
              </div>
              <div className="text-2xl sm:text-3xl font-black font-mono tracking-tight text-amber-300">
                {financialMetrics.emergencyShare.toLocaleString()} <span className="text-base font-normal">ج.م</span>
              </div>
              <div className="text-xs text-amber-100 font-medium">
                صندوق الحالات الطارئة، الأعطال المفاجئة، ومخزون الأزمات
              </div>
              <div className="pt-2 border-t border-amber-900/60 text-[11px] text-amber-200 flex justify-between">
                <span>الرصيد التراكمي:</span>
                <span className="font-bold">مؤمن</span>
              </div>
            </div>

          </div>

          {/* Mathematical Proof / Ledger Statement */}
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
            <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-2">
              <Percent className="w-4 h-4 text-rose-800" />
              <span>ميزان الإيرادات والمصروفات والتوزيع الربحي المعتمد:</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 text-xs">
              <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
                <span className="text-slate-500 block">إجمالي الدخل المحصل:</span>
                <span className="text-base font-bold font-mono text-slate-900">
                  {financialMetrics.totalPaidIncome.toLocaleString()} ج.م
                </span>
              </div>

              <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
                <span className="text-slate-500 block">إجمالي المصروفات التشغيلية:</span>
                <span className="text-base font-bold font-mono text-rose-600">
                  -{financialMetrics.totalExpenses.toLocaleString()} ج.م
                </span>
              </div>

              <div className="bg-emerald-50 p-3 rounded-lg border border-emerald-200">
                <span className="text-emerald-800 font-semibold block">صافي الفائض التشغيلي (الأرباح):</span>
                <span className="text-base font-black font-mono text-emerald-900">
                  {financialMetrics.netProfit.toLocaleString()} ج.م
                </span>
              </div>

              <div className="bg-rose-50 p-3 rounded-lg border border-rose-200">
                <span className="text-rose-900 font-semibold block">مجموع التوزيعات (100%):</span>
                <span className="text-base font-black font-mono text-rose-950">
                  {(financialMetrics.ceoShare + financialMetrics.labShare + financialMetrics.emergencyShare).toLocaleString()} ج.م
                </span>
              </div>
            </div>
          </div>

          {/* Configuration Form (Protected for CEO) */}
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                  <Shield className="w-4 h-4 text-rose-800" />
                  <span>تعديل وضبط نسب الأرباح للمعمل والـ CEO:</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  صلاحية حصرية لرئيس مجلس الإدارة (أ.د. رامي مختار). يتم تطبيق النسب فوراً على كل التقارير المالية.
                </p>
              </div>

              {currentUser.role !== 'admin_ceo' && (
                <div className="text-xs text-rose-600 font-semibold bg-rose-50 px-2 py-1 rounded border border-rose-200">
                  يتطلب صلاحية المدير التنفيذي (CEO) لتعديل النسب
                </div>
              )}
            </div>

            <form onSubmit={handleSaveProfitConfig} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">
                    نسبة المدير التنفيذي CEO (%):
                  </label>
                  <input
                    type="number"
                    min={0}
                    max={100}
                    disabled={currentUser.role !== 'admin_ceo'}
                    value={ceoPercent}
                    onChange={e => setCeoPercent(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 font-mono text-sm font-bold text-slate-900 focus:ring-2 focus:ring-rose-800 disabled:bg-slate-100"
                  />
                  <span className="text-[11px] text-slate-400 mt-0.5 block">
                    المستحق: {profitConfig.ceoNameAr}
                  </span>
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1">
                    نسبة المعمل والتطوير (%):
                  </label>
                  <input
                    type="number"
                    min={0}
                    max={100}
                    disabled={currentUser.role !== 'admin_ceo'}
                    value={labPercent}
                    onChange={e => setLabPercent(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 font-mono text-sm font-bold text-slate-900 focus:ring-2 focus:ring-rose-800 disabled:bg-slate-100"
                  />
                  <span className="text-[11px] text-slate-400 mt-0.5 block">
                    مخصص لتطوير أجهزة معمل RT
                  </span>
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1">
                    نسبة صندوق الطوارئ والاحتياطي (%):
                  </label>
                  <input
                    type="number"
                    min={0}
                    max={100}
                    disabled={currentUser.role !== 'admin_ceo'}
                    value={emergencyPercent}
                    onChange={e => setEmergencyPercent(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 font-mono text-sm font-bold text-slate-900 focus:ring-2 focus:ring-rose-800 disabled:bg-slate-100"
                  />
                  <span className="text-[11px] text-slate-400 mt-0.5 block">
                    رصيد أمان للمعامل
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs pt-2">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">
                    طريقة وأساس احتساب النسب:
                  </label>
                  <select
                    disabled={currentUser.role !== 'admin_ceo'}
                    value={calcBase}
                    onChange={e => setCalcBase(e.target.value as 'net_profit' | 'gross_income')}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white font-medium disabled:bg-slate-100"
                  >
                    <option value="net_profit">صافي الأرباح (الإيراد المحصل ناقص المصروفات التشغيلية) - الموصى به</option>
                    <option value="gross_income">إجمالي الإيرادات المحصلة مباشرة (Revenue Sharing)</option>
                  </select>
                </div>

                <div className="flex items-end justify-between">
                  <div className="text-xs text-slate-600">
                    مجموع النسب: <span className={`font-mono font-bold ${ceoPercent + labPercent + emergencyPercent === 100 ? 'text-emerald-700' : 'text-rose-600'}`}>
                      {ceoPercent + labPercent + emergencyPercent}%
                    </span> {ceoPercent + labPercent + emergencyPercent === 100 ? '✓ صحيح' : '(يجب أن يساوي 100%)'}
                  </div>

                  {currentUser.role === 'admin_ceo' && (
                    <button
                      type="submit"
                      className="px-5 py-2 bg-rose-900 hover:bg-rose-950 text-white font-bold text-xs rounded-lg transition-colors shadow-sm flex items-center gap-1.5"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>حفظ واعتماد النسب الجديدة</span>
                    </button>
                  )}
                </div>
              </div>

              {configSavedNotice && (
                <div className="p-2.5 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold rounded-lg text-center animate-fade-in">
                  تم حفظ واعتماد نسب الأرباح الجديدة بنجاح، وجرى تحديث جميع القوائم والتقارير المالية.
                </div>
              )}
            </form>
          </div>

        </div>
      )}

      {/* MODAL: ADD EXPENSE */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-200 max-w-lg w-full my-auto overflow-hidden">
            <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
              <h3 className="font-bold text-sm flex items-center gap-2">
                <Plus className="w-4 h-4 text-rose-400" />
                <span>تسجيل إذن صرف ومصروف جديد</span>
              </h3>
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveExpense} className="p-6 space-y-4 text-xs">
              <div>
                <label className="block text-slate-700 font-bold mb-1">بيان المصروف بالتفصيل *</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  placeholder="مثال: شراء كيتس كيمياء أو إيجار مقر أو صيانة جهاز"
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 font-medium"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">المبلغ (ج.م) *</label>
                  <input
                    type="number"
                    min={1}
                    required
                    value={amount}
                    onChange={e => setAmount(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 font-mono text-sm font-bold text-slate-900"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-bold mb-1">التصنيف المحاسبي</label>
                  <select
                    value={category}
                    onChange={e => setCategory(e.target.value as ExpenseCategory)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white"
                  >
                    {Object.entries(categoryNames).map(([key, name]) => (
                      <option key={key} value={key}>{name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">الجهة المستفيدة / المدفوع له</label>
                  <input
                    type="text"
                    value={paidTo}
                    onChange={e => setPaidTo(e.target.value)}
                    placeholder="اسم الشركة أو التوكيل أو المورد"
                    className="w-full px-3 py-2 rounded-lg border border-slate-300"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-bold mb-1">القسم المستفيد</label>
                  <input
                    type="text"
                    value={department}
                    onChange={e => setDepartment(e.target.value)}
                    placeholder="قسم الكيمياء أو المناعة أو الإدارة"
                    className="w-full px-3 py-2 rounded-lg border border-slate-300"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">طريقة الصرف</label>
                  <select
                    value={paymentMethod}
                    onChange={e => setPaymentMethod(e.target.value as PaymentMethod)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white"
                  >
                    <option value="cash">نقداً من الخزينة اليومية</option>
                    <option value="bank_transfer">تحويل بنكي / إنستاباي</option>
                    <option value="visa">بطاقة المعمل البنكية</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-700 font-bold mb-1">تاريخ الصرف</label>
                  <input
                    type="date"
                    value={date}
                    onChange={e => setDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">ملاحظات / رقم الفاتورة الورقية</label>
                <input
                  type="text"
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                  placeholder="رقم الفاتورة الضريبية، تفاصيل التوريد..."
                  className="w-full px-3 py-2 rounded-lg border border-slate-300"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-lg"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-lg shadow-sm"
                >
                  حفظ إذن الصرف
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: EDIT EXPENSE */}
      {editExpense && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-md w-full p-6 space-y-4">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center font-bold">
                  <Edit2 className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-sm">تعديل سند الصرف</h3>
                  <p className="text-[11px] text-slate-500 font-mono">رقم السند: {editExpense.expenseNumber}</p>
                </div>
              </div>
              <button type="button" onClick={() => setEditExpense(null)} className="text-slate-400 hover:text-slate-700 text-sm">✕</button>
            </div>

            <form onSubmit={handleSaveEditExpense} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-700 font-bold mb-1">بيان المصروف *</label>
                <input
                  type="text"
                  required
                  value={editTitle}
                  onChange={e => setEditTitle(e.target.value)}
                  className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg font-semibold"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">المبلغ (ج.م) *</label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={editAmount}
                    onChange={e => setEditAmount(Number(e.target.value))}
                    className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg font-mono font-bold text-rose-700"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-bold mb-1">طريقة السداد</label>
                  <select
                    value={editPaymentMethod}
                    onChange={e => setEditPaymentMethod(e.target.value as any)}
                    className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg"
                  >
                    <option value="cash">خزينة نقدي</option>
                    <option value="bank_transfer">تحويل بنكي</option>
                    <option value="visa">فيزا / بطاقة</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">القسم / البند</label>
                  <input
                    type="text"
                    value={editDept}
                    onChange={e => setEditDept(e.target.value)}
                    className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-bold mb-1">الجهة المستلمة</label>
                  <input
                    type="text"
                    value={editPaidTo}
                    onChange={e => setEditPaidTo(e.target.value)}
                    className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">ملاحظات إضافية</label>
                <input
                  type="text"
                  value={editNotes}
                  onChange={e => setEditNotes(e.target.value)}
                  placeholder="ملاحظات الفاتورة أو الإذن..."
                  className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setEditExpense(null)}
                  className="px-4 py-2 border border-slate-300 text-slate-700 rounded-xl hover:bg-slate-100 font-bold transition-all"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-700 hover:bg-blue-800 text-white rounded-xl font-bold shadow-md transition-all"
                >
                  حفظ تعديل المصروف
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
