import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import {
  FlaskConical,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  AlertTriangle,
  FileCheck2,
  Printer,
  Cpu,
  ArrowRight,
  Barcode,
  Calendar,
  Layers,
  Sparkles,
  CheckCheck
} from 'lucide-react';
import { LabReport } from '../types';

export const WorklistModule: React.FC = () => {
  const {
    reports,
    selectedReportId,
    setSelectedReportId,
    setActiveTab,
    verifyReport,
    setIsBarcodeScannerOpen,
    instruments,
    simulateInstrumentRun
  } = useApp();

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'verified'>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');

  const filteredReports = useMemo(() => {
    return reports.filter(r => {
      const matchesSearch =
        r.patient.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.reportNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.patient.barcode.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.patient.phone.includes(searchTerm);

      const matchesStatus =
        statusFilter === 'all'
          ? true
          : statusFilter === 'pending'
          ? r.status === 'draft' || r.status === 'in_progress'
          : r.status === 'verified';

      const matchesCategory =
        categoryFilter === 'all'
          ? true
          : r.profiles.some(p => p.category.toLowerCase().includes(categoryFilter.toLowerCase()));

      return matchesSearch && matchesStatus && matchesCategory;
    });
  }, [reports, searchTerm, statusFilter, categoryFilter]);

  const handleOpenEditor = (reportId: string) => {
    setSelectedReportId(reportId);
    setActiveTab('diagnostic_editor');
  };

  const handleQuickInstrumentPull = (report: LabReport) => {
    // Find matching instrument
    const isCBC = report.profiles.some(p => p.profileCode === 'CBC');
    const targetInst = instruments.find(i => isCBC ? i.category === 'hematology' : i.category === 'biochemistry') || instruments[0];

    simulateInstrumentRun(targetInst.id, report.patient.barcode, report.patient.fullName, report.reportNumber);
    setSelectedReportId(report.id);
    setActiveTab('instruments');
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-rose-950 to-slate-900 text-white rounded-2xl p-6 shadow-xl border border-rose-900/40">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-rose-600/30 rounded-xl border border-rose-500/40 text-rose-300">
                <FlaskConical className="w-7 h-7" />
              </div>
              <div>
                <h1 className="text-2xl font-black tracking-tight">قائمة عمل المعمل والمطابقة الفنية (Lab Worklist)</h1>
                <p className="text-slate-300 text-xs sm:text-sm font-medium">
                  جدول عينات اليوم قيد الفحص والتحليل، الربط بالأجهزة، وتدقيق البارامترات والنتائج
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsBarcodeScannerOpen(true)}
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-bold cursor-pointer transition-colors"
            >
              <Barcode className="w-4 h-4 text-rose-400" />
              <span>مسح باركود عينة</span>
            </button>
            <div className="bg-slate-800/80 px-3.5 py-2 rounded-xl border border-slate-700 text-xs font-mono font-bold text-rose-300">
              {filteredReports.length} عينة
            </div>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute right-3 top-3" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="بحث باسم المريض، رقم المعمل، الباركود أو رقم الهاتف..."
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
              الكل ({reports.length})
            </button>
            <button
              onClick={() => setStatusFilter('pending')}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                statusFilter === 'pending' ? 'bg-white text-amber-900 shadow-sm' : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              قيد العمل ({reports.filter(r => r.status !== 'verified').length})
            </button>
            <button
              onClick={() => setStatusFilter('verified')}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                statusFilter === 'verified' ? 'bg-white text-emerald-900 shadow-sm' : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              معتمدة ({reports.filter(r => r.status === 'verified').length})
            </button>
          </div>

          {/* Category Filter */}
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-medium focus:outline-none focus:ring-2 focus:ring-rose-500"
          >
            <option value="all">كل الأقسام المخبرية</option>
            <option value="hematology">أمراض الدم (Hematology / CBC)</option>
            <option value="biochemistry">الكيمياء الإكلينيكية (Biochemistry)</option>
            <option value="urinalysis">فحص البول وسوائل الجسم</option>
            <option value="coagulation">السيولة والتخثر (Coagulation)</option>
          </select>
        </div>
      </div>

      {/* Worklist Cards / Table */}
      <div className="space-y-3">
        {filteredReports.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 border border-slate-200 text-center text-slate-400 space-y-2">
            <FlaskConical className="w-10 h-10 mx-auto text-slate-300" />
            <p className="text-sm font-bold text-slate-600">لا توجد عينات مطابقة لبحثك في قائمة العمل</p>
            <p className="text-xs">اضغط "+ تسجيل مريض وحجز" لإضافة عينة جديدة.</p>
          </div>
        ) : (
          filteredReports.map(rep => {
            const isVerified = rep.status === 'verified';
            const totalParams = rep.profiles.reduce((sum, p) => sum + p.parameters.length, 0);
            const filledParams = rep.profiles.reduce((sum, p) => sum + p.parameters.filter(param => param.result && param.result.trim() !== '').length, 0);
            const progressPercent = totalParams > 0 ? Math.round((filledParams / totalParams) * 100) : 0;

            const hasPanic = rep.profiles.some(p => p.parameters.some(param => param.flag === 'PANIC_HIGH' || param.flag === 'PANIC_LOW'));

            return (
              <div
                key={rep.id}
                className={`bg-white rounded-2xl p-5 border transition-all shadow-sm hover:shadow-md flex flex-col md:flex-row md:items-center justify-between gap-4 ${
                  hasPanic ? 'border-red-400 bg-red-50/20' : isVerified ? 'border-emerald-200' : 'border-slate-200'
                }`}
              >
                {/* Left/Middle: Patient & Sample Details */}
                <div className="space-y-2 flex-1">
                  <div className="flex flex-wrap items-center gap-2.5">
                    <span className="font-black text-sm text-slate-900">{rep.patient.fullName}</span>
                    <span className="font-mono font-bold text-xs bg-slate-800 text-white px-2.5 py-0.5 rounded-lg">
                      {rep.reportNumber}
                    </span>
                    <span className="font-mono text-xs bg-slate-100 text-slate-700 px-2 py-0.5 rounded-md border border-slate-200">
                      {rep.patient.barcode}
                    </span>

                    <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
                      isVerified ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' : 'bg-amber-100 text-amber-800 border border-amber-300'
                    }`}>
                      {isVerified ? 'معتمد وموقع طبياً' : 'قيد الفحص والمطابقة'}
                    </span>

                    {hasPanic && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-red-600 text-white animate-pulse">
                        قيمة حرجة (Panic Value)
                      </span>
                    )}
                  </div>

                  <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500">
                    <span>{rep.patient.age} {rep.patient.ageUnit === 'years' ? 'سنة' : 'شهر'} ({rep.patient.gender === 'male' ? 'ذكر' : 'أنثى'})</span>
                    <span>·</span>
                    <span>الهاتف: <strong className="font-mono text-slate-700">{rep.patient.phone || 'غير مسجل'}</strong></span>
                    <span>·</span>
                    <span>الطبيب: {rep.patient.referringDoctorName || 'أطباء قصر العيني'}</span>
                    <span>·</span>
                    <span>تاريخ السحب: {rep.patient.sampleDate}</span>
                  </div>

                  {/* Tests Badges */}
                  <div className="flex flex-wrap items-center gap-1.5 pt-1">
                    {rep.profiles.map(prof => (
                      <span
                        key={prof.id}
                        className="text-[11px] font-bold bg-slate-100 text-slate-700 px-2.5 py-1 rounded-lg border border-slate-200"
                      >
                        {prof.titleAr || prof.titleEn} ({prof.parameters.length} بارامتر)
                      </span>
                    ))}
                  </div>

                  {/* Progress bar */}
                  <div className="flex items-center gap-3 pt-1">
                    <div className="w-36 h-2 bg-slate-100 rounded-full overflow-hidden border border-slate-200">
                      <div
                        className={`h-full transition-all duration-300 ${
                          progressPercent === 100 ? 'bg-emerald-500' : 'bg-rose-600'
                        }`}
                        style={{ width: `${progressPercent}%` }}
                      />
                    </div>
                    <span className="text-[11px] font-mono text-slate-500">
                      {filledParams} من {totalParams} تم تسجيله ({progressPercent}%)
                    </span>
                  </div>
                </div>

                {/* Right: Actions */}
                <div className="flex flex-wrap md:flex-col items-center md:items-end gap-2 shrink-0">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleQuickInstrumentPull(rep)}
                      title="سحب نتائج من أجهزة المعمل"
                      className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-800 border border-purple-200 text-xs font-bold transition-colors cursor-pointer"
                    >
                      <Cpu className="w-4 h-4" />
                      <span>قراءة الجهاز</span>
                    </button>

                    <button
                      onClick={() => handleOpenEditor(rep.id)}
                      className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-rose-900 hover:bg-rose-800 text-white text-xs font-bold shadow-sm transition-colors cursor-pointer"
                    >
                      <FileCheck2 className="w-4 h-4" />
                      <span>إدخال النتائج</span>
                    </button>
                  </div>

                  <div className="flex items-center gap-2">
                    {!isVerified ? (
                      <button
                        onClick={() => verifyReport(rep.id)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-colors cursor-pointer shadow-sm"
                      >
                        <CheckCheck className="w-3.5 h-3.5" />
                        <span>اعتماد طبي</span>
                      </button>
                    ) : (
                      <button
                        onClick={() => {
                          setSelectedReportId(rep.id);
                          setActiveTab('reports_archive');
                        }}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors cursor-pointer"
                      >
                        <Printer className="w-3.5 h-3.5" />
                        <span>طباعة التقرير</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
