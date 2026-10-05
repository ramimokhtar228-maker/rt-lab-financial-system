import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import {
  Wallet,
  Search,
  Filter,
  Printer,
  Calendar,
  CreditCard,
  Building,
  CheckCircle2,
  Clock,
  AlertCircle,
  PlusCircle,
  Trash2,
  Edit2,
  Eye,
  FileText,
  DollarSign,
  ArrowRight,
  TrendingUp,
  Receipt
} from 'lucide-react';
import { IncomeRecord, PaymentStatus, PaymentMethod } from '../types';
import { InvoicePrintModal } from './InvoicePrintModal';

export const IncomeModule: React.FC = () => {
  const {
    incomeRecords,
    addIncomeRecord,
    updateIncomeRecord,
    deleteIncomeRecord,
    currentUser,
    setIsPatientFormOpen,
    setActiveTab,
    setSelectedReportId,
    reports
  } = useApp();

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'paid' | 'partial' | 'unpaid'>('all');
  const [methodFilter, setMethodFilter] = useState<string>('all');
  const [selectedInvoiceForPrint, setSelectedInvoiceForPrint] = useState<IncomeRecord | null>(null);

  // Filtered Invoices
  const filteredInvoices = useMemo(() => {
    return incomeRecords.filter(inv => {
      const matchesSearch =
        inv.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        inv.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        inv.barcode.toLowerCase().includes(searchTerm.toLowerCase()) ||
        inv.patientPhone.includes(searchTerm) ||
        inv.labNumber.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesStatus = statusFilter === 'all' ? true : inv.paymentStatus === statusFilter;
      const matchesMethod = methodFilter === 'all' ? true : inv.paymentMethod === methodFilter;

      return matchesSearch && matchesStatus && matchesMethod;
    });
  }, [incomeRecords, searchTerm, statusFilter, methodFilter]);

  // Aggregate Metrics
  const totalBilled = filteredInvoices.reduce((sum, i) => sum + i.netAmount, 0);
  const totalCollected = filteredInvoices.reduce((sum, i) => sum + i.paidAmount, 0);
  const totalRemaining = filteredInvoices.reduce((sum, i) => sum + i.remainingAmount, 0);

  const handleMarkAsPaid = (inv: IncomeRecord) => {
    updateIncomeRecord(inv.id, {
      paidAmount: inv.netAmount,
      remainingAmount: 0,
      paymentStatus: 'paid'
    });
  };

  const handleOpenDiagnosticReport = (labNumber: string) => {
    const report = reports.find(r => r.reportNumber === labNumber || r.patient.barcode === labNumber);
    if (report) {
      setSelectedReportId(report.id);
      setActiveTab('diagnostic_editor');
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-rose-950 to-slate-900 text-white rounded-2xl p-6 shadow-xl border border-rose-900/40">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-rose-600/30 rounded-xl border border-rose-500/40 text-rose-300">
                <Wallet className="w-7 h-7" />
              </div>
              <div>
                <h1 className="text-2xl font-black tracking-tight">إدارة الخزينة والفوترة والتحصيل (Treasury & Income)</h1>
                <p className="text-slate-300 text-xs sm:text-sm font-medium">
                  سجل فواتير المرضى، التحصيلات النقدية والإلكترونية، ومتابعة المديونيات المعلقة
                </p>
              </div>
            </div>
          </div>

          <button
            onClick={() => setIsPatientFormOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-rose-700 hover:bg-rose-600 text-white font-bold text-xs shadow-md transition-all cursor-pointer"
          >
            <PlusCircle className="w-4 h-4" />
            <span>تسجيل مريض وفاتورة جديدة</span>
          </button>
        </div>
      </div>

      {/* Aggregate Financial Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm space-y-1">
          <span className="text-xs font-bold text-slate-500">إجمالي الفواتير الصادرة</span>
          <div className="text-2xl font-black text-slate-900 font-mono">
            {totalBilled.toLocaleString('ar-EG')} <span className="text-xs font-normal">ج.م</span>
          </div>
          <span className="text-[11px] text-slate-400 block">{filteredInvoices.length} فاتورة مسجلة</span>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm space-y-1">
          <span className="text-xs font-bold text-emerald-700">المحصل فعلياً بالخزينة</span>
          <div className="text-2xl font-black text-emerald-700 font-mono">
            {totalCollected.toLocaleString('ar-EG')} <span className="text-xs font-normal">ج.م</span>
          </div>
          <span className="text-[11px] text-slate-400 block">نسبة التحصيل: {totalBilled > 0 ? Math.round((totalCollected / totalBilled) * 100) : 100}%</span>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm space-y-1">
          <span className="text-xs font-bold text-amber-700">المديونيات والمتبقي المعلق</span>
          <div className="text-2xl font-black text-amber-700 font-mono">
            {totalRemaining.toLocaleString('ar-EG')} <span className="text-xs font-normal">ج.م</span>
          </div>
          <span className="text-[11px] text-slate-400 block">{filteredInvoices.filter(i => i.remainingAmount > 0).length} فاتورة غير مكتملة السداد</span>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute right-3 top-3" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="بحث برقم الفاتورة، اسم المريض، رقم المعمل، أو الباركود..."
            className="w-full text-xs pr-9 pl-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-500"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Status Filter */}
          <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs">
            <button
              onClick={() => setStatusFilter('all')}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                statusFilter === 'all' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              الكل
            </button>
            <button
              onClick={() => setStatusFilter('paid')}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                statusFilter === 'paid' ? 'bg-white text-emerald-900 shadow-sm' : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              مسدد بالكامل
            </button>
            <button
              onClick={() => setStatusFilter('unpaid')}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                statusFilter === 'unpaid' ? 'bg-white text-amber-900 shadow-sm' : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              متبقي مديونية
            </button>
          </div>

          {/* Payment Method Filter */}
          <select
            value={methodFilter}
            onChange={(e) => setMethodFilter(e.target.value)}
            className="text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-medium focus:outline-none focus:ring-2 focus:ring-rose-500"
          >
            <option value="all">كل طرق الدفع</option>
            <option value="cash">نقداً (Cash)</option>
            <option value="visa">فيزا (Visa)</option>
            <option value="instapay">إنستاباي (InstaPay)</option>
            <option value="vodafone_cash">فودافون كاش / محافظ</option>
            <option value="deferred">آجل / غير مسدد</option>
          </select>
        </div>
      </div>

      {/* Invoices Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-right text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold">
              <tr>
                <th className="p-3.5">رقم الفاتورة والمعمل</th>
                <th className="p-3.5">اسم المريض</th>
                <th className="p-3.5">التحاليل المسجلة</th>
                <th className="p-3.5">الإجمالي والخصم</th>
                <th className="p-3.5">الصافي والمدفوع</th>
                <th className="p-3.5">طريقة الدفع</th>
                <th className="p-3.5">الحالة</th>
                <th className="p-3.5 text-center">إجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredInvoices.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-slate-400">
                    لا توجد فواتير مطابقة لمعايير البحث.
                  </td>
                </tr>
              ) : (
                filteredInvoices.map(inv => {
                  const isFullyPaid = inv.paymentStatus === 'paid' && inv.remainingAmount === 0;

                  return (
                    <tr key={inv.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="p-3.5">
                        <div className="font-mono font-bold text-slate-900">{inv.invoiceNumber}</div>
                        <div className="font-mono text-[10px] text-rose-900 font-bold">{inv.labNumber}</div>
                        <div className="font-mono text-[10px] text-slate-400">{inv.barcode}</div>
                      </td>

                      <td className="p-3.5">
                        <div className="font-bold text-slate-900">{inv.patientName}</div>
                        <div className="text-[11px] text-slate-500 font-mono">{inv.patientPhone || 'بدون هاتف'}</div>
                        <div className="text-[10px] text-slate-400">{inv.patientAge} سنة · {inv.patientGender === 'male' ? 'ذكر' : 'أنثى'}</div>
                      </td>

                      <td className="p-3.5 max-w-[200px]">
                        <div className="truncate font-semibold text-slate-700">
                          {inv.tests.map(t => t.nameAr).join('، ')}
                        </div>
                        <div className="text-[10px] text-slate-400">
                          {inv.tests.length} تحاليل مسجلة
                        </div>
                      </td>

                      <td className="p-3.5 font-mono">
                        <div className="text-slate-500 line-through text-[11px]">
                          {inv.subtotal} ج.م
                        </div>
                        {inv.discount > 0 && (
                          <div className="text-rose-700 font-bold text-[11px]">
                            خصم: -{inv.discount} ج.م
                          </div>
                        )}
                        {inv.visitFee && inv.visitFee > 0 ? (
                          <div className="text-blue-700 text-[10px]">زيارة: +{inv.visitFee} ج.م</div>
                        ) : null}
                      </td>

                      <td className="p-3.5 font-mono">
                        <div className="font-black text-slate-900 text-sm">
                          {inv.netAmount} ج.م
                        </div>
                        <div className="text-[11px] text-emerald-700 font-bold">
                          مدفوع: {inv.paidAmount} ج.م
                        </div>
                        {inv.remainingAmount > 0 && (
                          <div className="text-[11px] text-red-600 font-bold">
                            متبقي: {inv.remainingAmount} ج.م
                          </div>
                        )}
                      </td>

                      <td className="p-3.5">
                        <span className="font-bold text-slate-700 text-xs block">
                          {inv.paymentMethod === 'cash' ? 'نقداً (Cash)' :
                           inv.paymentMethod === 'visa' ? 'فيزا (Visa)' :
                           inv.paymentMethod === 'instapay' ? 'إنستاباي' :
                           inv.paymentMethod === 'vodafone_cash' ? 'فودافون كاش' :
                           inv.paymentMethod === 'bank_transfer' ? 'تحويل بنكي' : 'آجل'}
                        </span>
                        <span className="text-[10px] text-slate-400 font-mono">
                          {inv.createdAt.split('T')[0]}
                        </span>
                      </td>

                      <td className="p-3.5">
                        <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                          isFullyPaid
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}>
                          {isFullyPaid ? 'مسدد بالكامل' : `متبقي ${inv.remainingAmount} ج.م`}
                        </span>
                      </td>

                      <td className="p-3.5">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => setSelectedInvoiceForPrint(inv)}
                            title="طباعة الفاتورة أو إيصال السداد"
                            className="p-1.5 rounded-lg bg-rose-50 text-rose-900 hover:bg-rose-100 transition-colors cursor-pointer"
                          >
                            <Printer className="w-4 h-4" />
                          </button>

                          <button
                            type="button"
                            onClick={() => handleOpenDiagnosticReport(inv.labNumber)}
                            title="فتح التقرير الطبي المخبري"
                            className="p-1.5 rounded-lg bg-slate-100 text-slate-700 hover:bg-slate-200 transition-colors cursor-pointer"
                          >
                            <FileText className="w-4 h-4" />
                          </button>

                          {!isFullyPaid && (
                            <button
                              type="button"
                              onClick={() => handleMarkAsPaid(inv)}
                              title="تسوية وسداد المتبقي"
                              className="px-2 py-1 rounded-lg bg-emerald-600 text-white font-bold text-[10px] hover:bg-emerald-700 transition-colors cursor-pointer"
                            >
                              سداد
                            </button>
                          )}

                          <button
                            type="button"
                            onClick={() => {
                              if (confirm(`هل أنت متأكد من حذف فاتورة المريض ${inv.patientName}؟`)) {
                                deleteIncomeRecord(inv.id);
                              }
                            }}
                            title="حذف الفاتورة"
                            className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
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

      {/* Invoice Print Modal */}
      {selectedInvoiceForPrint && (
        <InvoicePrintModal
          invoice={selectedInvoiceForPrint}
          onClose={() => setSelectedInvoiceForPrint(null)}
        />
      )}
    </div>
  );
};
