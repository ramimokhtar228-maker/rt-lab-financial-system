import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { IncomeRecord, InvoiceTestItem, PaymentMethod, PaymentStatus } from '../types';
import { TestCatalogManagerModal } from './TestCatalogManagerModal';
import { Award, Sparkles, Gift } from 'lucide-react';
import {
  Plus,
  Search,
  Filter,
  Printer,
  Calendar,
  DollarSign,
  CreditCard,
  Building,
  CheckCircle2,
  Clock,
  AlertCircle,
  ScanLine,
  User,
  Phone,
  Tag,
  Trash2,
  Edit2
} from 'lucide-react';
import { InvoicePrintModal } from './InvoicePrintModal';
import { generateBarcodeSVG, playScanSuccessSound } from '../utils/barcode';

export const IncomeModule: React.FC = () => {
  const {
    incomeRecords,
    addIncomeRecord,
    updateIncomeRecord,
    deleteIncomeRecord,
    currentUser,
    language,
    scannedBarcode,
    setScannedBarcode,
    setScannerOpen,
    githubConfig,
    testCatalog,
    loyaltyProfiles,
    loyaltyConfig,
    redeemLoyaltyPoints,
    calculatePointsForAmount,
    calculateCashForPoints
  } = useApp();
  const [catalogModalOpen, setCatalogModalOpen] = useState(false);

  // Search & Filter State
  const [searchTerm, setSearchTerm] = useState('');
  const [dateFilter, setDateFilter] = useState<'today' | 'yesterday' | 'month' | 'all'>('today');
  const [statusFilter, setStatusFilter] = useState<'all' | 'paid' | 'partial' | 'unpaid'>('all');
  const [methodFilter, setMethodFilter] = useState<'all' | PaymentMethod>('all');

  // Modal States
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editRecord, setEditRecord] = useState<IncomeRecord | null>(null);
  const [editPatientName, setEditPatientName] = useState('');
  const [editPatientPhone, setEditPatientPhone] = useState('');
  const [editDoctor, setEditDoctor] = useState('');
  const [editBranch, setEditBranch] = useState('');
  const [editPaid, setEditPaid] = useState<number>(0);
  const [editDiscount, setEditDiscount] = useState<number>(0);
  const [editMethod, setEditMethod] = useState<PaymentMethod>('cash');
  const [editNotes, setEditNotes] = useState('');
  const [printInvoice, setPrintInvoice] = useState<IncomeRecord | null>(null);

  // New Invoice Form State
  const [patientName, setPatientName] = useState('');
  const [patientPhone, setPatientPhone] = useState('');
  const [patientAge, setPatientAge] = useState<number>(30);
  const [patientGender, setPatientGender] = useState<'male' | 'female'>('male');
  const [referringDoctor, setReferringDoctor] = useState('');
  const [branch, setBranch] = useState('فرع قصر العيني الرئيسي');
  const [selectedTests, setSelectedTests] = useState<InvoiceTestItem[]>([]);
  const [discount, setDiscount] = useState<number>(0);
  const [redeemedPointsAmount, setRedeemedPointsAmount] = useState<number>(0);
  const [paidAmount, setPaidAmount] = useState<number>(0);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('cash');
  const [notes, setNotes] = useState('');
  const [customTestSearch, setCustomTestSearch] = useState('');
  const [catalogCategory, setCatalogCategory] = useState<string>('all');

  // Next auto generated numbers
  const nextLabNumber = useMemo(() => {
    const year = new Date().getFullYear();
    const count = incomeRecords.length + 896;
    return `RT-${year}-${count.toString().padStart(4, '0')}`;
  }, [incomeRecords.length]);

  const nextBarcode = useMemo(() => {
    return `982736${(1834 + incomeRecords.length).toString()}`;
  }, [incomeRecords.length]);

  // Handle barcode scanned from camera/laser
  React.useEffect(() => {
    if (scannedBarcode) {
      setSearchTerm(scannedBarcode);
      setScannedBarcode(null);
    }
  }, [scannedBarcode, setScannedBarcode]);

  // Date Filtering Calculation
  const filteredRecords = useMemo(() => {
    const today = new Date().toISOString().split('T')[0];
    const yesterdayDate = new Date();
    yesterdayDate.setDate(yesterdayDate.getDate() - 1);
    const yesterday = yesterdayDate.toISOString().split('T')[0];
    const currentMonth = today.substring(0, 7);

    return incomeRecords.filter(record => {
      // Date filter
      if (dateFilter === 'today' && !record.createdAt.startsWith(today)) return false;
      if (dateFilter === 'yesterday' && !record.createdAt.startsWith(yesterday)) return false;
      if (dateFilter === 'month' && !record.createdAt.startsWith(currentMonth)) return false;

      // Status filter
      if (statusFilter !== 'all' && record.paymentStatus !== statusFilter) return false;

      // Payment Method filter
      if (methodFilter !== 'all' && record.paymentMethod !== methodFilter) return false;

      // Search term
      if (searchTerm.trim()) {
        const term = searchTerm.toLowerCase();
        const matchesName = record.patientName.toLowerCase().includes(term);
        const matchesPhone = record.patientPhone.includes(term);
        const matchesBarcode = record.barcode.includes(term);
        const matchesLabNo = record.labNumber.toLowerCase().includes(term);
        const matchesInvoice = record.invoiceNumber.toLowerCase().includes(term);
        if (!matchesName && !matchesPhone && !matchesBarcode && !matchesLabNo && !matchesInvoice) {
          return false;
        }
      }

      return true;
    });
  }, [incomeRecords, dateFilter, statusFilter, methodFilter, searchTerm]);

  // Summary Metrics of filtered data
  const summaryMetrics = useMemo(() => {
    const totalGross = filteredRecords.reduce((acc, r) => acc + r.subtotal, 0);
    const totalNet = filteredRecords.reduce((acc, r) => acc + r.netAmount, 0);
    const totalPaid = filteredRecords.reduce((acc, r) => acc + r.paidAmount, 0);
    const totalRemaining = filteredRecords.reduce((acc, r) => acc + r.remainingAmount, 0);

    const cashPaid = filteredRecords
      .filter(r => r.paymentMethod === 'cash')
      .reduce((acc, r) => acc + r.paidAmount, 0);

    const visaPaid = filteredRecords
      .filter(r => r.paymentMethod === 'visa')
      .reduce((acc, r) => acc + r.paidAmount, 0);

    const transferPaid = filteredRecords
      .filter(r => r.paymentMethod === 'bank_transfer')
      .reduce((acc, r) => acc + r.paidAmount, 0);

    return {
      count: filteredRecords.length,
      totalGross,
      totalNet,
      totalPaid,
      totalRemaining,
      cashPaid,
      visaPaid,
      transferPaid
    };
  }, [filteredRecords]);

  // Test catalog search
  const filteredCatalog = useMemo(() => {
    return testCatalog.filter(test => {
      if (catalogCategory !== 'all' && test.category !== catalogCategory) return false;
      if (customTestSearch.trim()) {
        const term = customTestSearch.toLowerCase();
        return (
          test.nameAr.toLowerCase().includes(term) ||
          test.nameEn.toLowerCase().includes(term) ||
          test.code.toLowerCase().includes(term)
        );
      }
      return true;
    });
  }, [catalogCategory, customTestSearch]);

  const subtotalNew = selectedTests.reduce((sum, t) => sum + t.price, 0);
  const netAmountNew = Math.max(0, subtotalNew - discount);
  const remainingNew = Math.max(0, netAmountNew - paidAmount);

  // Auto set paidAmount to netAmount when tests change
  const handleAddTest = (test: InvoiceTestItem) => {
    if (!selectedTests.some(t => t.id === test.id)) {
      const updated = [...selectedTests, test];
      setSelectedTests(updated);
      const newSub = updated.reduce((s, t) => s + t.price, 0);
      const newNet = Math.max(0, newSub - discount);
      setPaidAmount(newNet);
    }
  };

  const handleRemoveTest = (id: string) => {
    const updated = selectedTests.filter(t => t.id !== id);
    setSelectedTests(updated);
    const newSub = updated.reduce((s, t) => s + t.price, 0);
    const newNet = Math.max(0, newSub - discount);
    setPaidAmount(newNet);
  };

  const handleSaveInvoice = (e: React.FormEvent) => {
    e.preventDefault();
    if (!patientName.trim()) {
      alert(language === 'ar' ? 'يرجى إدخال اسم المريض' : 'Please enter patient name');
      return;
    }
    if (selectedTests.length === 0) {
      alert(language === 'ar' ? 'يرجى اختيار تحليل واحد على الأقل' : 'Please select at least one test');
      return;
    }

    let status: PaymentStatus = 'paid';
    if (paidAmount === 0) {
      status = 'unpaid';
    } else if (paidAmount < netAmountNew) {
      status = 'partial';
    }

    const invNum = `INV-${new Date().getFullYear()}-${(incomeRecords.length + 896).toString().padStart(4, '0')}`;
    
    // If patient redeemed points
    if (redeemedPointsAmount > 0 && matchingLoyalty) {
      redeemLoyaltyPoints(matchingLoyalty.patientId, redeemedPointsAmount, invNum);
    }

    const newRecord = addIncomeRecord({
      invoiceNumber: invNum,
      patientName: patientName.trim(),
      patientPhone: patientPhone.trim() || '01000000000',
      patientAge: Number(patientAge) || 30,
      patientGender,
      barcode: nextBarcode,
      labNumber: nextLabNumber,
      referringDoctor: referringDoctor.trim() || (language === 'ar' ? 'فحص ذاتي / كشف معمل' : 'Self Referral'),
      tests: selectedTests,
      subtotal: subtotalNew,
      discount,
      loyaltyPointsRedeemed: redeemedPointsAmount,
      loyaltyPointsEarned: calculatePointsForAmount(paidAmount),
      netAmount: netAmountNew,
      paidAmount,
      remainingAmount: remainingNew,
      paymentMethod,
      paymentStatus: status,
      cashierName: currentUser.nameAr,
      branch,
      notes: redeemedPointsAmount > 0 ? `${notes ? notes + ' | ' : ''}تم استبدال ${redeemedPointsAmount} نقطة ولاء` : notes,
      syncStatus: githubConfig.token ? 'synced' : 'local_only',
      syncDate: new Date().toISOString()
    });

    playScanSuccessSound();
    setIsAddModalOpen(false);

    // Reset fields
    setPatientName('');
    setPatientPhone('');
    setSelectedTests([]);
    setDiscount(0);
    setPaidAmount(0);
    setNotes('');

    // Open print preview immediately
    setPrintInvoice(newRecord);
  };

    const handleOpenEdit = (rec: IncomeRecord) => {
    setEditRecord(rec);
    setEditPatientName(rec.patientName);
    setEditPatientPhone(rec.patientPhone);
    setEditDoctor(rec.referringDoctor || "");
    setEditBranch(rec.branch);
    setEditPaid(rec.paidAmount);
    setEditDiscount(rec.discount || 0);
    setEditMethod(rec.paymentMethod);
    setEditNotes(rec.notes || "");
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editRecord) return;
    const subtotal = editRecord.subtotal || editRecord.netAmount;
    const finalNet = Math.max(0, subtotal - editDiscount);
    const remaining = Math.max(0, finalNet - editPaid);
    const status: PaymentStatus = remaining === 0 ? "paid" : editPaid > 0 ? "partial" : "unpaid";

    updateIncomeRecord(editRecord.id, {
      patientName: editPatientName,
      patientPhone: editPatientPhone,
      referringDoctor: editDoctor,
      branch: editBranch,
      discount: editDiscount,
      netAmount: finalNet,
      paidAmount: editPaid,
      remainingAmount: remaining,
      paymentMethod: editMethod,
      paymentStatus: status,
      notes: editNotes,
      updatedAt: new Date().toISOString()
    });
    setEditRecord(null);
  };

  const handleQuickPayRemainder = (record: IncomeRecord) => {
    if (record.remainingAmount <= 0) return;
    updateIncomeRecord(record.id, {
      paidAmount: record.netAmount,
      remainingAmount: 0,
      paymentStatus: 'paid'
    });
    playScanSuccessSound();
  };

  const matchingLoyalty = useMemo(() => {
    if (!patientPhone && !patientName) return null;
    return loyaltyProfiles.find(p => (patientPhone && p.phone === patientPhone.trim()) || (patientName && p.patientName.trim().toLowerCase() === patientName.trim().toLowerCase()));
  }, [patientPhone, patientName, loyaltyProfiles]);

  const categories = useMemo(() => {
    const set = new Set(testCatalog.map(t => t.category));
    return ['all', ...Array.from(set)];
  }, []);

  return (
    <div className="space-y-6">
      
      {/* Top Controls & Financial Daily Bar */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-black text-slate-900 tracking-tight flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-rose-900" />
              <span>{language === 'ar' ? 'سجل الدخل اليومي وحسابات المرضى' : 'Daily Patient Income & Billing'}</span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              {language === 'ar'
                ? 'تسجيل تحصيل الفواتير، طرق الدفع، العينات، والربط اللحظي مع منظومة النتائج.'
                : 'Manage patient billing, sample barcodes, and payment statuses.'}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setScannerOpen(true)}
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
            >
              <ScanLine className="w-4 h-4 text-rose-900" />
              <span>{language === 'ar' ? 'مسح باركود' : 'Scan'}</span>
            </button>

            <button
              onClick={() => {
                setPaidAmount(0);
                setSelectedTests([]);
                setIsAddModalOpen(true);
              }}
              className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-rose-900 hover:bg-rose-800 rounded-lg transition-colors shadow-sm"
            >
              <Plus className="w-4 h-4" />
              <span>{language === 'ar' ? 'تسجيل كشف / فاتورة جديدة' : 'New Invoice'}</span>
            </button>
          </div>
        </div>

        {/* Financial Highlights */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3 pt-2 border-t border-slate-100">
          <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
            <div className="text-[11px] text-slate-500 font-medium">
              {language === 'ar' ? 'إجمالي المحصل' : 'Total Collected'}
            </div>
            <div className="text-base font-black text-emerald-700 font-mono mt-0.5">
              {summaryMetrics.totalPaid.toLocaleString()} {language === 'ar' ? 'ج.م' : 'EGP'}
            </div>
            <div className="text-[10px] text-slate-400 mt-0.5">{summaryMetrics.count} {language === 'ar' ? 'فاتورة' : 'cases'}</div>
          </div>

          <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
            <div className="text-[11px] text-slate-500 font-medium">
              {language === 'ar' ? 'نقدي (كاش بالخزينة)' : 'Cash in Drawer'}
            </div>
            <div className="text-base font-black text-slate-900 font-mono mt-0.5">
              {summaryMetrics.cashPaid.toLocaleString()} {language === 'ar' ? 'ج.م' : 'EGP'}
            </div>
            <div className="text-[10px] text-rose-900 mt-0.5">جاهز للتقفيل</div>
          </div>

          <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
            <div className="text-[11px] text-slate-500 font-medium">
              {language === 'ar' ? 'فيزا وبطاقات' : 'Visa / Cards'}
            </div>
            <div className="text-base font-black text-blue-700 font-mono mt-0.5">
              {summaryMetrics.visaPaid.toLocaleString()} {language === 'ar' ? 'ج.م' : 'EGP'}
            </div>
            <div className="text-[10px] text-slate-400 mt-0.5">POS محصل إلكترونياً</div>
          </div>

          <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
            <div className="text-[11px] text-slate-500 font-medium">
              {language === 'ar' ? 'إنستاباي / تحويلات' : 'Bank / InstaPay'}
            </div>
            <div className="text-base font-black text-purple-700 font-mono mt-0.5">
              {summaryMetrics.transferPaid.toLocaleString()} {language === 'ar' ? 'ج.م' : 'EGP'}
            </div>
            <div className="text-[10px] text-slate-400 mt-0.5">تحويلات الحساب</div>
          </div>

          <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
            <div className="text-[11px] text-slate-500 font-medium">
              {language === 'ar' ? 'متبقيات آجلة على المرضى' : 'Deferred Balances'}
            </div>
            <div className={`text-base font-black font-mono mt-0.5 ${summaryMetrics.totalRemaining > 0 ? 'text-rose-600' : 'text-slate-900'}`}>
              {summaryMetrics.totalRemaining.toLocaleString()} {language === 'ar' ? 'ج.م' : 'EGP'}
            </div>
            <div className="text-[10px] text-slate-400 mt-0.5">عند استلام النتائج</div>
          </div>

          <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
            <div className="text-[11px] text-slate-500 font-medium">
              {language === 'ar' ? 'إجمالي القيمة قبل الخصم' : 'Gross Value'}
            </div>
            <div className="text-base font-bold text-slate-700 font-mono mt-0.5">
              {summaryMetrics.totalGross.toLocaleString()} {language === 'ar' ? 'ج.م' : 'EGP'}
            </div>
            <div className="text-[10px] text-slate-400 mt-0.5">
              خصومات: {(summaryMetrics.totalGross - summaryMetrics.totalNet).toLocaleString()} ج.م
            </div>
          </div>
        </div>

        {/* Filter & Search Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
          {/* Search Input */}
          <div className="relative flex-1 min-w-[240px] max-w-md">
            <input
              type="text"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              placeholder={language === 'ar' ? 'ابحث باسم المريض، رقم الهاتف، الباركود، كود المعمل...' : 'Search by name, phone, barcode...'}
              className="w-full text-xs pr-8 pl-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-rose-700"
            />
            <Search className="w-4 h-4 text-slate-400 absolute right-2.5 top-2.5 pointer-events-none" />
          </div>

          {/* Quick Date Tabs */}
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg text-xs">
            <button
              onClick={() => setDateFilter('today')}
              className={`px-3 py-1.5 rounded-md font-semibold transition-colors ${
                dateFilter === 'today' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {language === 'ar' ? 'اليوم' : 'Today'}
            </button>
            <button
              onClick={() => setDateFilter('yesterday')}
              className={`px-3 py-1.5 rounded-md font-semibold transition-colors ${
                dateFilter === 'yesterday' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {language === 'ar' ? 'أمس' : 'Yesterday'}
            </button>
            <button
              onClick={() => setDateFilter('month')}
              className={`px-3 py-1.5 rounded-md font-semibold transition-colors ${
                dateFilter === 'month' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {language === 'ar' ? 'هذا الشهر' : 'This Month'}
            </button>
            <button
              onClick={() => setDateFilter('all')}
              className={`px-3 py-1.5 rounded-md font-semibold transition-colors ${
                dateFilter === 'all' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {language === 'ar' ? 'كل السجلات' : 'All'}
            </button>
          </div>

          {/* Status Dropdown */}
          <div className="flex items-center gap-2">
            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value as 'all' | 'paid' | 'partial' | 'unpaid')}
              className="text-xs py-2 px-3 rounded-lg border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-rose-700 font-medium"
            >
              <option value="all">{language === 'ar' ? 'جميع حالات السداد' : 'All Payment Statuses'}</option>
              <option value="paid">{language === 'ar' ? 'مسدد بالكامل' : 'Fully Paid'}</option>
              <option value="partial">{language === 'ar' ? 'مسدد جزئياً (متبقي)' : 'Partial / Balance Due'}</option>
              <option value="unpaid">{language === 'ar' ? 'غير مسدد (آجل)' : 'Unpaid'}</option>
            </select>

            <select
              value={methodFilter}
              onChange={e => setMethodFilter(e.target.value as 'all' | PaymentMethod)}
              className="text-xs py-2 px-3 rounded-lg border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-rose-700 font-medium"
            >
              <option value="all">{language === 'ar' ? 'جميع طرق الدفع' : 'All Methods'}</option>
              <option value="cash">{language === 'ar' ? 'نقدي (كاش)' : 'Cash'}</option>
              <option value="visa">{language === 'ar' ? 'فيزا / ماستركارد' : 'Visa'}</option>
              <option value="bank_transfer">{language === 'ar' ? 'إنستاباي / تحويل' : 'InstaPay / Transfer'}</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main Invoices Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-right">
            <thead>
              <tr className="bg-slate-100/75 text-slate-700 font-bold border-b border-slate-200">
                <th className="py-3 px-4">رقم الفاتورة / العينة</th>
                <th className="py-3 px-4">الباركود</th>
                <th className="py-3 px-4">بيانات المريض</th>
                <th className="py-3 px-4">التحاليل والفحوصات</th>
                <th className="py-3 px-4">الطبيب المحول</th>
                <th className="py-3 px-4">الإجمالي والخصم</th>
                <th className="py-3 px-4">المدفوع / المتبقي</th>
                <th className="py-3 px-4">طريقة الدفع</th>
                <th className="py-3 px-4">حالة السداد</th>
                <th className="py-3 px-4 text-center">إجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredRecords.length === 0 ? (
                <tr>
                  <td colSpan={10} className="py-12 text-center text-slate-400">
                    <p className="text-sm font-semibold">
                      {language === 'ar' ? 'لا توجد فواتير مطابقة للشروط المحددة' : 'No matching invoice records found'}
                    </p>
                    <p className="text-xs mt-1">
                      {language === 'ar' ? 'اضغط على "تسجيل كشف / فاتورة جديدة" لإضافة أول مريض اليوم' : 'Click "New Invoice" to bill a patient.'}
                    </p>
                  </td>
                </tr>
              ) : (
                filteredRecords.map(record => {
                  return (
                    <tr key={record.id} className="hover:bg-slate-50/80 transition-colors">
                      {/* Invoice & Lab No */}
                      <td className="py-3 px-4">
                        <div className="font-mono font-bold text-slate-900">{record.invoiceNumber}</div>
                        <div className="text-[11px] font-mono text-rose-950">{record.labNumber}</div>
                        <div className="text-[10px] text-slate-400 mt-0.5">
                          {new Date(record.createdAt).toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </td>

                      {/* Barcode visual preview */}
                      <td className="py-3 px-4">
                        <div className="font-mono font-bold text-slate-800">{record.barcode}</div>
                        <div className="text-[10px] text-slate-500">{record.branch.replace('فرع ', '')}</div>
                      </td>

                      {/* Patient Details */}
                      <td className="py-3 px-4">
                        <div className="font-bold text-slate-900 text-sm">{record.patientName}</div>
                        <div className="text-[11px] text-slate-500 mt-0.5">
                          <span>{record.patientAge} سنة</span>
                          <span className="mx-1">·</span>
                          <span>{record.patientGender === 'male' ? 'ذكر' : 'أنثى'}</span>
                          <span className="mx-1">·</span>
                          <span className="font-mono">{record.patientPhone}</span>
                        </div>
                      </td>

                      {/* Tests List */}
                      <td className="py-3 px-4">
                        <div className="font-semibold text-slate-800 max-w-[220px] truncate" title={record.tests.map(t => t.nameAr).join(' + ')}>
                          {record.tests.map(t => t.code).join(' · ')}
                        </div>
                        <div className="text-[11px] text-slate-500">
                          {record.tests.length} {record.tests.length === 1 ? 'تحليل' : 'تحاليل'}
                        </div>
                      </td>

                      {/* Referring Doctor */}
                      <td className="py-3 px-4">
                        <div className="text-slate-800 font-medium truncate max-w-[150px]" title={record.referringDoctor}>
                          {record.referringDoctor || 'فحص ذاتي'}
                        </div>
                      </td>

                      {/* Subtotal & Discount */}
                      <td className="py-3 px-4">
                        <div className="font-mono font-bold text-slate-900">
                          {record.netAmount.toFixed(2)} ج.م
                        </div>
                        {record.discount > 0 && (
                          <div className="text-[10px] text-rose-600 font-mono">
                            خصم: -{record.discount} ج
                          </div>
                        )}
                      </td>

                      {/* Paid & Remaining */}
                      <td className="py-3 px-4">
                        <div className="font-mono font-bold text-emerald-700">
                          {record.paidAmount.toFixed(2)} ج.م
                        </div>
                        {record.remainingAmount > 0 ? (
                          <div className="text-[11px] text-rose-600 font-bold font-mono">
                            متبقي: {record.remainingAmount.toFixed(2)} ج
                          </div>
                        ) : (
                          <div className="text-[10px] text-slate-400">خالص</div>
                        )}
                      </td>

                      {/* Method */}
                      <td className="py-3 px-4">
                        <span className="font-medium text-slate-700">
                          {record.paymentMethod === 'cash' ? 'نقدي (خزينة)' :
                           record.paymentMethod === 'visa' ? 'فيزا إلكتروني' :
                           record.paymentMethod === 'bank_transfer' ? 'إنستاباي' : 'آجل'}
                        </span>
                      </td>

                      {/* Status */}
                      <td className="py-3 px-4">
                        {record.paymentStatus === 'paid' ? (
                          <span className="inline-flex items-center gap-1 font-bold text-emerald-700">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>مسدد</span>
                          </span>
                        ) : record.paymentStatus === 'partial' ? (
                          <span className="inline-flex items-center gap-1 font-bold text-amber-700">
                            <Clock className="w-3.5 h-3.5" />
                            <span>جزئي</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 font-bold text-rose-600">
                            <AlertCircle className="w-3.5 h-3.5" />
                            <span>آجل</span>
                          </span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-4 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          {/* Quick Pay Remainder */}
                          {record.remainingAmount > 0 && (
                            <button
                              onClick={() => handleQuickPayRemainder(record)}
                              className="px-2 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-[11px] font-bold rounded border border-emerald-200 transition-colors"
                              title="تحصيل المتبقي نقداً"
                            >
                              سداد
                            </button>
                          )}

                          {/* Edit Invoice Button */}
                          <button
                            type="button"
                            onClick={() => handleOpenEdit(record)}
                            className="p-1.5 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded transition-colors"
                            title="تعديل بيانات الفاتورة والحالة"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          {/* Print Invoice */}
                          <button
                            onClick={() => setPrintInvoice(record)}
                            className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded transition-colors"
                            title="طباعة الفاتورة والباركود"
                          >
                            <Printer className="w-4 h-4" />
                          </button>

                          {/* Delete (CEO only) */}
                          {currentUser.role === 'admin_ceo' && (
                            <button
                              onClick={() => {
                                if (confirm(`هل أنت متأكد من حذف فاتورة المريض ${record.patientName}؟`)) {
                                  deleteIncomeRecord(record.id);
                                }
                              }}
                              className="p-1.5 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded transition-colors"
                              title="حذف الفاتورة (صلاحية الإدارة)"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL: NEW INTAKE & INVOICE REGISTRATION */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-200 max-w-4xl w-full my-auto overflow-hidden">
            
            {/* Modal Header */}
            <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
              <div>
                <h3 className="font-bold text-base flex items-center gap-2">
                  <Plus className="w-5 h-5 text-rose-400" />
                  <span>{language === 'ar' ? 'تسجيل حالة ومريض جديد وإصدار فاتورة' : 'New Patient Intake & Billing'}</span>
                </h3>
                <div className="text-xs text-slate-400 mt-0.5">
                  معامل RT للتشخيص · كود التحليل التلقائي: <span className="font-mono text-rose-300 font-bold">{nextLabNumber}</span> · باركود: <span className="font-mono text-rose-300 font-bold">{nextBarcode}</span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="text-slate-400 hover:text-white transition-colors"
              >
                ✕
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSaveInvoice} className="p-6 space-y-6">
              
              {/* Row 1: Patient Information */}
              <div>
                <h4 className="text-xs font-bold text-slate-900 border-b border-slate-200 pb-1.5 mb-3 flex items-center gap-1.5">
                  <User className="w-4 h-4 text-rose-900" />
                  <span>بيانات المريض الأساسية:</span>
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
                  <div>
                    <label className="block text-slate-700 font-bold mb-1">اسم المريض ثلاثي / رباعي *</label>
                    <input
                      type="text"
                      required
                      value={patientName}
                      onChange={e => setPatientName(e.target.value)}
                      placeholder="مثال: أحمد عبد الله حسين"
                      className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-rose-700 font-medium"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-700 font-bold mb-1">رقم الهاتف (واتساب) *</label>
                    <input
                      type="text"
                      value={patientPhone}
                      onChange={e => setPatientPhone(e.target.value)}
                      placeholder="01012345678"
                      className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-rose-700 font-mono"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-slate-700 font-bold mb-1">السن (بالسنوات)</label>
                      <input
                        type="number"
                        min={0}
                        max={120}
                        value={patientAge}
                        onChange={e => setPatientAge(Number(e.target.value))}
                        className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-rose-700 font-mono"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-700 font-bold mb-1">النوع</label>
                      <select
                        value={patientGender}
                        onChange={e => setPatientGender(e.target.value as 'male' | 'female')}
                        className="w-full px-2 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-rose-700 bg-white"
                      >
                        <option value="male">ذكر</option>
                        <option value="female">أنثى</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-slate-700 font-bold mb-1">الطبيب المحول / العيادة</label>
                    <input
                      type="text"
                      value={referringDoctor}
                      onChange={e => setReferringDoctor(e.target.value)}
                      placeholder="د. استشاري الباطنة أو فحص ذاتي"
                      className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-rose-700"
                    />
                  </div>
                </div>
              </div>

              {/* Row 2: Test Catalog Multi-Selector */}
              <div>
                <h4 className="text-xs font-bold text-slate-900 border-b border-slate-200 pb-1.5 mb-3 flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <Tag className="w-4 h-4 text-rose-900" />
                    <span>اختيار التحاليل والفحوصات المطلوبة:</span>
                  </span>
                  <span className="text-slate-500 font-normal">
                    تم اختيار {selectedTests.length} تحليل
                  </span>
                </h4>

                {/* Selected Tests Tags */}
                <div className="min-h-12 p-2.5 rounded-lg border border-slate-200 bg-slate-50/70 mb-3 flex flex-wrap items-center gap-1.5">
                  {selectedTests.length === 0 ? (
                    <span className="text-xs text-slate-400">
                      اختر التحاليل من القائمة أدناه أو ابحث بالاسم أو الكود...
                    </span>
                  ) : (
                    selectedTests.map(t => (
                      <span
                        key={t.id}
                        className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-rose-100 text-rose-950 rounded-md text-xs font-bold border border-rose-200"
                      >
                        <span>{t.nameAr}</span>
                        <span className="font-mono text-rose-900">({t.price} ج)</span>
                        <button
                          type="button"
                          onClick={() => handleRemoveTest(t.id)}
                          className="text-rose-900 hover:text-rose-600 font-bold mr-1"
                        >
                          ✕
                        </button>
                      </span>
                    ))
                  )}
                </div>

                {/* Search & Filter in Catalog */}
                <div className="flex gap-2 mb-2">
                  <div className="relative flex-1">
                    <input
                      type="text"
                      value={customTestSearch}
                      onChange={e => setCustomTestSearch(e.target.value)}
                      placeholder="ابحث في التحاليل بالاسم أو الكود (مثل: FBS, CBC, TSH, سكر, كلى)..."
                      className="w-full text-xs pr-8 pl-3 py-1.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-rose-700"
                    />
                    <Search className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-2.5 pointer-events-none" />
                  </div>
                  <select
                    value={catalogCategory}
                    onChange={e => setCatalogCategory(e.target.value)}
                    className="text-xs px-2.5 py-1.5 rounded-lg border border-slate-300 bg-white"
                  >
                    {categories.map(cat => (
                      <option key={cat} value={cat}>
                        {cat === 'all' ? 'جميع الأقسام' : cat}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Catalog Quick Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-1.5 max-h-48 overflow-y-auto p-1 border border-slate-200 rounded-lg">
                  {filteredCatalog.map(test => {
                    const isSelected = selectedTests.some(t => t.id === test.id);
                    return (
                      <button
                        key={test.id}
                        type="button"
                        onClick={() => {
                          if (isSelected) {
                            handleRemoveTest(test.id);
                          } else {
                            handleAddTest(test);
                          }
                        }}
                        className={`p-2 text-right rounded-md border text-xs transition-colors flex items-center justify-between ${
                          isSelected
                            ? 'bg-rose-900 text-white border-rose-950'
                            : 'bg-white hover:bg-slate-50 text-slate-800 border-slate-200'
                        }`}
                      >
                        <div className="truncate">
                          <div className="font-bold truncate">{test.nameAr}</div>
                          <div className={`text-[10px] font-mono ${isSelected ? 'text-rose-200' : 'text-slate-400'}`}>
                            {test.code}
                          </div>
                        </div>
                        <div className={`font-mono font-bold mr-1 shrink-0 ${isSelected ? 'text-white' : 'text-rose-950'}`}>
                          {test.price} ج
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Row 3: Financial Calculations & Payment */}
              <div>
                <h4 className="text-xs font-bold text-slate-900 border-b border-slate-200 pb-1.5 mb-3 flex items-center gap-1.5">
                  <CreditCard className="w-4 h-4 text-rose-900" />
                  <span>الحساب المالي والتحصيل:</span>
                </h4>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 text-xs bg-slate-50 p-4 rounded-lg border border-slate-200">
                  <div>
                    <label className="block text-slate-500 font-bold mb-1">المجموع الكلي:</label>
                    <div className="text-lg font-black font-mono text-slate-900 py-1">
                      {subtotalNew.toFixed(2)} ج.م
                    </div>
                  </div>

                  <div>
                    <label className="block text-slate-700 font-bold mb-1">الخصم المطبق (ج.م):</label>
                    <input
                      type="number"
                      min={0}
                      max={subtotalNew}
                      value={discount}
                      onChange={e => {
                        const val = Number(e.target.value) || 0;
                        setDiscount(val);
                        setPaidAmount(Math.max(0, subtotalNew - val));
                      }}
                      className="w-full px-3 py-1.5 rounded-lg border border-slate-300 font-mono text-xs focus:ring-2 focus:ring-rose-700"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-500 font-bold mb-1">الصافي المطلوب:</label>
                    <div className="text-lg font-black font-mono text-rose-950 py-1">
                      {netAmountNew.toFixed(2)} ج.م
                    </div>
                  </div>

                  <div>
                    <label className="block text-emerald-800 font-bold mb-1">المدفوع الآن (ج.م) *:</label>
                    <input
                      type="number"
                      min={0}
                      max={netAmountNew}
                      value={paidAmount}
                      onChange={e => setPaidAmount(Number(e.target.value) || 0)}
                      className="w-full px-3 py-1.5 rounded-lg border border-emerald-400 font-mono text-xs font-bold text-emerald-900 focus:ring-2 focus:ring-emerald-700"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-500 font-bold mb-1">المتبقي الآجل:</label>
                    <div className={`text-lg font-black font-mono py-1 ${remainingNew > 0 ? 'text-rose-600' : 'text-slate-500'}`}>
                      {remainingNew.toFixed(2)} ج.م
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-3 text-xs">
                  <div>
                    <label className="block text-slate-700 font-bold mb-1">طريقة السداد:</label>
                    <select
                      value={paymentMethod}
                      onChange={e => setPaymentMethod(e.target.value as PaymentMethod)}
                      className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white"
                    >
                      <option value="cash">نقدي (كاش بالخزينة)</option>
                      <option value="visa">فيزا / ماستركارد (POS)</option>
                      <option value="bank_transfer">إنستاباي / تحويل بنكي</option>
                      <option value="deferred">آجل بالكامل</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-slate-700 font-bold mb-1">الفرع التابع له:</label>
                    <input
                      type="text"
                      value={branch}
                      onChange={e => setBranch(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-slate-50"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-700 font-bold mb-1">ملاحظات الفاتورة أو العينة:</label>
                    <input
                      type="text"
                      value={notes}
                      onChange={e => setNotes(e.target.value)}
                      placeholder="عينة صائم 10 ساعات، كولكشن عاجل..."
                      className="w-full px-3 py-2 rounded-lg border border-slate-300"
                    />
                  </div>
                </div>
              </div>

              {/* Form Buttons */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-lg transition-colors"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-rose-900 hover:bg-rose-800 text-white font-bold text-xs rounded-lg transition-colors shadow-md flex items-center gap-2"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>حفظ الفاتورة وإصدار الباركود والطباعة</span>
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* Printable Invoice Modal */}
      {printInvoice && (
        <InvoicePrintModal
          invoice={printInvoice}
          onClose={() => setPrintInvoice(null)}
        />
      )}

      {/* MODAL: EDIT INVOICE */}
      {editRecord && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-lg w-full p-6 space-y-4">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center font-bold">
                  <Edit2 className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-sm">تعديل بيانات الفاتورة</h3>
                  <p className="text-[11px] text-slate-500 font-mono">{editRecord.invoiceNumber} | {editRecord.labNumber}</p>
                </div>
              </div>
              <button type="button" onClick={() => setEditRecord(null)} className="text-slate-400 hover:text-slate-700 text-sm">✕</button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-3 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">اسم المريض *</label>
                  <input
                    type="text"
                    required
                    value={editPatientName}
                    onChange={e => setEditPatientName(e.target.value)}
                    className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg font-semibold"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-bold mb-1">رقم الهاتف</label>
                  <input
                    type="text"
                    value={editPatientPhone}
                    onChange={e => setEditPatientPhone(e.target.value)}
                    className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">الطبيب المعالج</label>
                  <input
                    type="text"
                    value={editDoctor}
                    onChange={e => setEditDoctor(e.target.value)}
                    className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-bold mb-1">الفرع</label>
                  <input
                    type="text"
                    value={editBranch}
                    onChange={e => setEditBranch(e.target.value)}
                    className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg"
                  />
                </div>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                <div className="text-[11px] font-bold text-slate-700">الفحوصات المقيدة:</div>
                <div className="text-slate-600 font-medium truncate">
                  {editRecord.tests.map(t => t.nameAr).join(' · ')}
                </div>
                <div className="text-[11px] text-slate-500 font-mono">
                  إجمالي قيمة الفحوصات: {editRecord.subtotal || editRecord.netAmount} ج.م
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">قيمة الخصم (ج.م)</label>
                  <input
                    type="number"
                    min="0"
                    value={editDiscount}
                    onChange={e => setEditDiscount(Number(e.target.value))}
                    className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg font-mono font-bold text-rose-700"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-bold mb-1">المسدد نقداً (ج.م) *</label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={editPaid}
                    onChange={e => setEditPaid(Number(e.target.value))}
                    className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg font-mono font-bold text-emerald-700"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-bold mb-1">طريقة الدفع</label>
                  <select
                    value={editMethod}
                    onChange={e => setEditMethod(e.target.value as PaymentMethod)}
                    className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg font-semibold"
                  >
                    <option value="cash">خزينة نقدي</option>
                    <option value="visa">فيزا / بطاقة</option>
                    <option value="bank">تحويل بنكي</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">ملاحظات إضافية</label>
                <input
                  type="text"
                  value={editNotes}
                  onChange={e => setEditNotes(e.target.value)}
                  placeholder="أي ملاحظات على الدفع أو العينة..."
                  className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setEditRecord(null)}
                  className="px-4 py-2 border border-slate-300 text-slate-700 rounded-xl hover:bg-slate-100 font-bold transition-all"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-700 hover:bg-blue-800 text-white rounded-xl font-bold shadow-md transition-all"
                >
                  حفظ تعديل الفاتورة
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <TestCatalogManagerModal isOpen={catalogModalOpen} onClose={() => setCatalogModalOpen(false)} />
    </div>
  );
};
