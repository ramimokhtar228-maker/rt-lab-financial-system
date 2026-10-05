import React, { useState } from 'react';
import { LabReport, ReportStatus } from '../types/lab';
import { formatWhatsAppMessage, openWhatsApp } from '../utils/whatsapp';
import { exportReportToPPTX } from '../utils/pptxExport';
import { 
  Archive, 
  Search, 
  Filter, 
  Printer, 
  Share2, 
  FileSpreadsheet, 
  Edit3, 
  Trash2, 
  Copy, 
  User, 
  Calendar, 
  CheckCircle2, 
  Clock, 
  Download, 
  Upload,
  Phone,
  Layers,
  Zap,
  RefreshCw,
  Receipt,
  Sparkles
} from 'lucide-react';

interface ArchiveTableProps {
  reports: LabReport[];
  searchTerm: string;
  setSearchTerm: (s: string) => void;
  onSelectReport: (report: LabReport) => void;
  onPrintReport: (report: LabReport) => void;
  onDeleteReport: (reportId: string) => void;
  onDuplicateReport: (report: LabReport) => void;
  onBackupDatabase: () => void;
  onRestoreDatabase: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSyncClick?: () => void;
  isSyncing?: boolean;
  onNewPatientClick?: () => void;
  onOpenInvoice?: (report: LabReport) => void;
  onClearPatients?: () => void;
  onOpenSmartReport?: (report: LabReport) => void;
  onBulkDeleteReports?: (reportIds: string[]) => void;
  onBulkUpdateStatus?: (reportIds: string[], status: ReportStatus) => void;
}

export const ArchiveTable: React.FC<ArchiveTableProps> = ({
  reports,
  searchTerm,
  setSearchTerm,
  onSelectReport,
  onPrintReport,
  onDeleteReport,
  onDuplicateReport,
  onBackupDatabase,
  onRestoreDatabase,
  onSyncClick,
  isSyncing,
  onNewPatientClick,
  onOpenInvoice,
  onClearPatients,
  onOpenSmartReport,
  onBulkDeleteReports,
  onBulkUpdateStatus
}) => {
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedReportIds, setSelectedReportIds] = useState<string[]>([]);

  const handleToggleSelectOne = (id: string) => {
    setSelectedReportIds(prev => 
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const handleToggleSelectAll = () => {
    if (selectedReportIds.length === filteredReports.length) {
      setSelectedReportIds([]);
    } else {
      setSelectedReportIds(filteredReports.map(r => r.id));
    }
  };

  const handleBulkDelete = () => {
    if (selectedReportIds.length === 0) return;
    if (window.confirm(`هل أنت متأكد من حذف ${selectedReportIds.length} تقرير محدد نهائياً؟`)) {
      if (onBulkDeleteReports) {
        onBulkDeleteReports(selectedReportIds);
      } else {
        selectedReportIds.forEach(id => onDeleteReport(id));
      }
      setSelectedReportIds([]);
    }
  };

  const handleBulkChangeStatus = (status: ReportStatus) => {
    if (selectedReportIds.length === 0) return;
    if (onBulkUpdateStatus) {
      onBulkUpdateStatus(selectedReportIds, status);
    }
    setSelectedReportIds([]);
  };

  const handleBulkPrint = () => {
    const selectedReports = reports.filter(r => selectedReportIds.includes(r.id));
    if (selectedReports.length === 0) return;
    selectedReports.forEach((r, idx) => {
      setTimeout(() => onPrintReport(r), idx * 400);
    });
  };

  const handleBulkExportJson = () => {
    const selectedReports = reports.filter(r => selectedReportIds.includes(r.id));
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(selectedReports, null, 2));
    const a = document.createElement("a");
    a.setAttribute("href", dataStr);
    a.setAttribute("download", `rt-lab-selected-reports-${Date.now()}.json`);
    document.body.appendChild(a);
    a.click();
    a.remove();
  };


  const filteredReports = reports.filter(r => {
    if (!r || !r.patient) return false;
    const term = (searchTerm || "").toLowerCase().trim();
    const p = r.patient;
    const fullName = (p.fullName || "").toLowerCase();
    const labNum = (p.labNumber || "").toLowerCase();
    const phone = p.phone || "";
    const barcode = p.barcode || "";
    const doctor = (p.referringDoctorName || (p as any).referringDoctor || "").toLowerCase();
    const profiles = Array.isArray(r.profiles) ? r.profiles : [];

    const matchesSearch =
      !term ||
      fullName.includes(term) ||
      labNum.includes(term) ||
      phone.includes(term) ||
      barcode.includes(term) ||
      doctor.includes(term) ||
      profiles.some(pr => (pr?.titleEn && pr.titleEn.toLowerCase().includes(term)) || (pr?.titleAr && pr.titleAr.includes(term)));
    const matchesStatus = statusFilter === "all" || r.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleWhatsAppClick = (report: LabReport) => {
    const msg = formatWhatsAppMessage(report);
    openWhatsApp(report.patient.phone, msg);
  };

  const handlePPTXClick = async (report: LabReport) => {
    await exportReportToPPTX(report);
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-6">
      {/* Archive Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-slate-900 to-rose-950 text-white flex items-center justify-center shadow-md">
            <Archive className="w-5 h-5 text-rose-400" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900">
              الأرشيف الإلكتروني وسجل تقارير المرضى
            </h2>
            <p className="text-xs text-slate-500">
              إدارة وبحث واسترجاع نتائج التحاليل، والطباعة الآلية، والتنبيه الفوري عبر واتساب
            </p>
          </div>
        </div>

        {/* Database Backup & Restore & Sync with Accounts */}
        <div className="flex flex-wrap items-center gap-2">
          {onSyncClick && (
            <button
              onClick={onSyncClick}
              disabled={isSyncing}
              className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg shadow-sm transition-all"
              title="تسميع واستيراد طلبات الفحص الواردة من الحسابات والمالية فوراً"
            >
              <Zap className={`w-3.5 h-3.5 ${isSyncing ? 'animate-bounce text-amber-300' : 'text-emerald-300'}`} />
              <span>{isSyncing ? 'جاري التسميع...' : 'تسميع طلبات الحسابات ⚡'}</span>
            </button>
          )}

          <button
            onClick={onBackupDatabase}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition-colors border border-slate-200"
            title="تصدير نسخة احتياطية من كافة السجلات والتحاليل"
          >
            <Download className="w-3.5 h-3.5 text-slate-500" />
            <span>نسخ احتياطي (JSON)</span>
          </button>
          
          <label className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition-colors border border-slate-200 cursor-pointer">
            <Upload className="w-3.5 h-3.5 text-slate-500" />
            <span>استعادة نسخة</span>
            <input type="file" accept=".json" onChange={onRestoreDatabase} className="hidden" />
          </label>
          {onClearPatients && reports.length > 0 && (
            <button
              onClick={onClearPatients}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-lg transition-colors border border-rose-200"
              title="تصفير سجل المرضى والبدء بسجل نظيف مع الحفاظ على الكتالوج والفروع"
            >
              <Trash2 className="w-3.5 h-3.5 text-rose-600" />
              <span>تصفير سجل المرضى</span>
            </button>
          )}
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* Search */}
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="بحث برقم التحليل، المريض، الهاتف، الفحص..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full text-xs bg-white border border-slate-300 rounded-lg pl-9 pr-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-600 transition-all"
          />
        </div>

        {/* Status Filter Tabs */}
        <div className="flex items-center gap-1 overflow-x-auto w-full sm:w-auto text-xs">
          {[
            { id: 'all', label: 'الكل' },
            { id: 'released', label: 'معتمد (Released)' },
            { id: 'verified', label: 'مُدقق (Verified)' },
            { id: 'in_progress', label: 'قيد الفحص' },
            { id: 'draft', label: 'مسودة' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setStatusFilter(tab.id)}
              className={`px-3 py-1.5 rounded-lg font-medium whitespace-nowrap transition-all ${
                statusFilter === tab.id
                  ? 'bg-rose-900 text-white shadow-xs font-bold'
                  : 'bg-white text-slate-600 hover:bg-slate-200/60 border border-slate-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Reports Table */}
      <div className="overflow-x-auto border border-slate-200 rounded-xl">
        <table className="w-full text-right border-collapse text-xs" dir="rtl">
          <thead>
            <tr className="bg-slate-100 text-slate-700 font-bold uppercase tracking-wider border-b border-slate-200">
              <th className="py-3 px-3 text-center w-10">
                <input
                  type="checkbox"
                  checked={filteredReports.length > 0 && selectedReportIds.length === filteredReports.length}
                  onChange={handleToggleSelectAll}
                  className="w-4 h-4 rounded text-rose-600 focus:ring-rose-500 cursor-pointer"
                  title="تحديد الكل للعمليات المجمعة"
                />
              </th>
              <th className="py-3 px-4 text-right">رقم التحليل</th>
              <th className="py-3 px-4 text-right">اسم المريض</th>
              <th className="py-3 px-4 text-center">السن / النوع</th>
              <th className="py-3 px-4 text-right">الفحوصات الطبية</th>
              <th className="py-3 px-4 text-center">تاريخ السحب</th>
              <th className="py-3 px-4 text-center">الحالة</th>
              <th className="py-3 px-4 text-center">إجراءات سريعة</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 bg-white">
            {filteredReports.length === 0 ? (
              <tr>
                <td colSpan={8} className="text-center py-16 text-slate-500">
                  <div className="max-w-md mx-auto space-y-4">
                    <div className="w-16 h-16 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center mx-auto border border-rose-100 shadow-sm">
                      <Archive className="w-8 h-8" />
                    </div>
                    <div>
                      <h4 className="font-bold text-base text-slate-800">
                        {reports.length === 0 ? 'سجل المرضى والتقارير فارغ حالياً' : 'لم يتم العثور على تقارير مطابقة للبحث'}
                      </h4>
                      <p className="text-xs text-slate-500 mt-1">
                        {reports.length === 0 
                          ? 'يمكنك البدء مباشرة بتسجيل مريض وفحص جديد، أو استيراد الطلبات الفورية من منظومة الحسابات.' 
                          : 'جرّب كتابة كلمة بحث مختلفة، أو تغيير تصنيف الفلترة أعلاه.'}
                      </p>
                    </div>
                    {reports.length === 0 && (
                      <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                        {onNewPatientClick && (
                          <button
                            type="button"
                            onClick={onNewPatientClick}
                            className="inline-flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-red-900 to-rose-700 hover:from-red-950 hover:to-rose-800 text-white rounded-xl text-xs font-bold shadow-md hover:shadow-lg transition-all"
                          >
                            <User className="w-4 h-4" />
                            <span>➕ تسجيل مريض وفحص جديد الآن</span>
                          </button>
                        )}
                        {onSyncClick && (
                          <button
                            type="button"
                            onClick={onSyncClick}
                            disabled={isSyncing}
                            className="inline-flex items-center gap-2 px-4 py-2.5 bg-slate-800 hover:bg-slate-900 text-slate-200 rounded-xl text-xs font-bold shadow-sm transition-all"
                          >
                            <Zap className="w-4 h-4 text-amber-400" />
                            <span>{isSyncing ? 'جارٍ التسميع...' : '⚡ استيراد طلبات الفحص من الحسابات'}</span>
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                </td>
              </tr>
            ) : (
              filteredReports.map(report => {
                const p = report?.patient || {} as any;
                const statusStyles = {
                  released: 'bg-emerald-50 text-emerald-800 border-emerald-300',
                  verified: 'bg-blue-50 text-blue-800 border-blue-300',
                  in_progress: 'bg-amber-50 text-amber-800 border-amber-300',
                  draft: 'bg-slate-100 text-slate-700 border-slate-300'
                };
                const statusLabels = {
                  released: 'معتمد وخالص',
                  verified: 'مُراجع ومعتمد',
                  in_progress: 'قيد الفحص',
                  draft: 'مسودة / انتظار'
                };

                const isFinancialSync = p.clinicalHistory?.includes('فاتورة') || report.generalComment?.includes('فاتورة');

                return (
                  <tr key={report.id} className={`hover:bg-rose-50/20 transition-colors ${selectedReportIds.includes(report.id) ? "bg-rose-50/40" : ""}`}>
                    {/* Row Checkbox */}
                    <td className="py-3 px-3 text-center">
                      <input
                        type="checkbox"
                        checked={selectedReportIds.includes(report.id)}
                        onChange={() => handleToggleSelectOne(report.id)}
                        className="w-4 h-4 rounded text-rose-600 focus:ring-rose-500 cursor-pointer"
                      />
                    </td>
                    {/* Lab Number & Barcode */}
                    <td className="py-3 px-4">
                      <div className="font-mono-numbers font-bold text-rose-950 text-sm">
                        {p.labNumber}
                      </div>
                      <div className="text-[10px] text-slate-400 font-mono">
                        {p.barcode}
                      </div>
                    </td>

                    {/* Patient Name & Phone */}
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-slate-900 text-sm">
                          {p.fullName}
                        </span>
                        {isFinancialSync && (
                          <span className="px-1.5 py-0.5 bg-emerald-50 text-emerald-800 border border-emerald-300 text-[10px] font-bold rounded flex items-center gap-0.5">
                            <Zap className="w-2.5 h-2.5 text-emerald-600" />
                            <span>مسمّع مالي</span>
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-1 text-[11px] text-slate-500 font-mono-numbers">
                        <Phone className="w-3 h-3 text-emerald-600" />
                        <span dir="ltr">{p.phone}</span>
                        {p.referringDoctorName && (
                          <span className="text-slate-400 mr-2">| د. {p.referringDoctorName}</span>
                        )}
                      </div>
                    </td>

                    {/* Age / Gender */}
                    <td className="py-3 px-4 text-center font-mono-numbers text-slate-700">
                      <div>
                        {p.age} {p.ageUnit === 'years' ? 'سنة' : p.ageUnit === 'months' ? 'شهر' : 'يوم'}
                      </div>
                      <div className="text-[10px] text-slate-400">
                        {p.gender === 'male' ? 'ذكر' : 'أنثى'}
                      </div>
                    </td>

                    {/* Medical Profiles list */}
                    <td className="py-3 px-4">
                      <div className="flex flex-wrap gap-1 max-w-xs">
                        {report.profiles.map(pr => (
                          <span
                            key={pr.id}
                            className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-semibold bg-slate-100 text-slate-800 border border-slate-200"
                          >
                            {pr.titleAr || pr.titleEn}
                          </span>
                        ))}
                      </div>
                    </td>

                    {/* Sample Date */}
                    <td className="py-3 px-4 text-center text-slate-600 font-mono-numbers text-[11px]">
                      <div>{p.sampleDate?.substring(0, 10)}</div>
                      <div className="text-[10px] text-slate-400">{p.sampleDate?.substring(11, 16)}</div>
                    </td>

                    {/* Status Badge */}
                    <td className="py-3 px-4 text-center">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                          statusStyles[report.status]
                        }`}
                      >
                        {statusLabels[report.status]}
                      </span>
                    </td>

                    {/* Quick Actions */}
                    <td className="py-3 px-4 text-center">
                      <div className="flex items-center justify-center gap-1">
                        {/* Edit Button */}
                        <button
                          onClick={() => onSelectReport(report)}
                          className="p-1.5 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition-colors"
                          title="تعديل التقرير والنتائج"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>

                        {/* Print Button */}
                        <button
                          onClick={() => onPrintReport(report)}
                          className="p-1.5 text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors"
                          title="طباعة التقرير الطبي A4"
                        >
                          <Printer className="w-4 h-4" />
                        </button>

                        {/* Invoice & Receipt Button */}
                        {onOpenInvoice && (
                          <button
                            onClick={() => onOpenInvoice(report)}
                            className="p-1.5 text-amber-700 hover:text-amber-900 hover:bg-amber-50 rounded-lg transition-colors"
                            title="عرض وطباعة الفاتورة المالية وإيصال السداد"
                          >
                            <Receipt className="w-4 h-4" />
                          </button>
                        )}

                        {/* WhatsApp Button */}
                        <button
                          onClick={() => handleWhatsAppClick(report)}
                          className="p-1.5 text-emerald-600 hover:text-emerald-800 hover:bg-emerald-50 rounded-lg transition-colors"
                          title="إرسال عبر واتساب"
                        >
                          <Share2 className="w-4 h-4" />
                        </button>

                        {/* Duplicate Button */}
                        <button
                          onClick={() => onDuplicateReport(report)}
                          className="p-1.5 text-purple-600 hover:text-purple-800 hover:bg-purple-50 rounded-lg transition-colors"
                          title="تكرار الحالة لمريض جديد"
                        >
                          <Copy className="w-4 h-4" />
                        </button>

                        {/* Delete Button */}
                        <button
                          onClick={() => onDeleteReport(report.id)}
                          className="p-1.5 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition-colors"
                          title="حذف التقرير"
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

      {/* Floating Sticky Batch Operations Bar (العمليات المجمعة) */}
      {selectedReportIds.length > 0 && (
        <div className="sticky bottom-4 z-40 bg-slate-900/95 backdrop-blur-md text-white p-3.5 rounded-2xl shadow-2xl border-2 border-rose-600 flex flex-wrap items-center justify-between gap-3 animate-in slide-in-from-bottom-3 duration-200">
          <div className="flex items-center gap-2.5">
            <span className="w-7 h-7 rounded-full bg-rose-600 text-white flex items-center justify-center font-bold font-mono text-xs shadow-md">
              {selectedReportIds.length}
            </span>
            <div className="text-right">
              <div className="text-xs font-bold text-white flex items-center gap-1.5">
                <span>العمليات المجمعة مفعلة</span>
                <span className="text-[10px] text-rose-300 bg-rose-950 px-2 py-0.2 rounded border border-rose-800">
                  تم تحديد {selectedReportIds.length} تقرير
                </span>
              </div>
              <div className="text-[10px] text-slate-400">تنفيذ إجراء جماعي فوري على كافة السجلات المحددة</div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 text-xs">
            <button
              onClick={handleBulkPrint}
              className="px-3.5 py-2 bg-gradient-to-r from-red-800 to-rose-700 hover:from-red-900 hover:to-rose-800 text-white rounded-xl font-bold flex items-center gap-1.5 transition-all shadow-md"
              title="طباعة جماعية لكافة التقارير المحددة"
            >
              <Printer className="w-4 h-4" />
              <span>طباعة مجمعة ({selectedReportIds.length})</span>
            </button>
            <button
              onClick={() => handleBulkChangeStatus('released')}
              className="px-3 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl font-bold flex items-center gap-1.5 transition-colors shadow-sm"
              title="اعتماد وتوثيق نهائي لكافة التقارير المحددة"
            >
              <CheckCircle2 className="w-4 h-4 text-emerald-300" />
              <span>اعتماد مجمع</span>
            </button>
            <button
              onClick={handleBulkExportJson}
              className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl font-semibold flex items-center gap-1.5 transition-colors border border-slate-700"
              title="تصدير السجلات المحددة إلى ملف JSON"
            >
              <Download className="w-4 h-4 text-slate-400" />
              <span>تصدير JSON</span>
            </button>
            <button
              onClick={handleBulkDelete}
              className="px-3 py-2 bg-rose-950 hover:bg-rose-900 text-rose-200 rounded-xl font-semibold flex items-center gap-1.5 transition-colors border border-rose-800"
              title="حذف كافة التقارير المحددة نهائياً"
            >
              <Trash2 className="w-4 h-4 text-rose-400" />
              <span>حذف مجمع</span>
            </button>
            <button
              onClick={() => setSelectedReportIds([])}
              className="px-3 py-2 text-slate-400 hover:text-white text-xs transition-colors"
            >
              إلغاء التحديد
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
