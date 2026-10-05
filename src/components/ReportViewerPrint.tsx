import React, { useState } from 'react';
import { LabReport, TestProfile } from '../types/lab';
import { formatReferenceDisplay } from '../utils/calculator';
import { ColouredRangeChart } from './ColouredRangeChart';
import { FlagBadge } from './FlagBadge';
import { exportReportToPPTX } from '../utils/pptxExport';
import { formatWhatsAppMessage, openWhatsApp } from '../utils/whatsapp';
import { downloadReportPDF, triggerPrintDialog } from '../utils/pdfExport';
import { openPrintReportWindow } from '../utils/printReportWindow';
import { 
  Printer, 
  Share2, 
  FileSpreadsheet, 
  ArrowRight, 
  ShieldCheck, 
  QrCode, 
  Award,
  PhoneCall,
  MapPin,
  Download,
  Loader2,
  Receipt,
  Settings,
  Microscope,
  Sparkles
} from 'lucide-react';

interface ReportViewerPrintProps {
  report: LabReport;
  onBackToEdit: () => void;
  onOpenInvoice?: () => void;
  onOpenLabInfoModal?: () => void;
  onOpenIllustrationsModal?: (profileId: string) => void;
  onOpenSmartReport?: () => void;
}

export const ReportViewerPrint: React.FC<ReportViewerPrintProps> = ({
  report,
  onBackToEdit,
  onOpenInvoice,
  onOpenLabInfoModal,
  onOpenIllustrationsModal,
  onOpenSmartReport
}) => {
  const p = report.patient;
  const totalPages = report.profiles.length;
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);

  const handleDownloadPDF = async () => {
    try {
      setIsGeneratingPDF(true);
      await downloadReportPDF(report);
    } catch (err) {
      console.error('Failed to generate PDF:', err);
      openPrintReportWindow(report);
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  const handlePrint = () => {
    openPrintReportWindow(report);
  };

  const handleWhatsApp = () => {
    const msg = formatWhatsAppMessage(report);
    openWhatsApp(p.phone, msg);
  };

  const handlePPTX = async () => {
    await exportReportToPPTX(report);
  };

  const formatDoctorDisplay = () => {
    if (p.referringDoctorTitle === 'Herself' || p.referringDoctorTitle === 'Himself') {
      return 'Self-Request (طلب فحص ذاتي)';
    }
    return `${p.referringDoctorTitle} ${p.referringDoctorName}`.trim() || 'General Medical Request';
  };

  return (
    <div className="space-y-6">
      {/* Top Floating Control Bar (Hidden when printing) */}
      <div className="bg-slate-900 text-white rounded-xl p-4 shadow-xl flex flex-wrap items-center justify-between gap-3 no-print sticky top-28 z-40 border border-slate-700">
        <div className="flex items-center gap-3">
          <button
            onClick={onBackToEdit}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-lg transition-colors border border-slate-700"
          >
            <ArrowRight className="w-4 h-4" />
            <span>العودة لشاشة التعديل</span>
          </button>

          <span className="text-slate-600">|</span>
          <span className="text-xs text-rose-300 font-semibold">
            معاينة التقرير (A4): <strong className="text-white">{totalPages} صفحة</strong> (كل بروفايل في صفحة مستقلة)
          </span>
        </div>

        <div className="flex items-center gap-2">
          {/* WhatsApp Direct Send */}
          <button
            onClick={handleWhatsApp}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-emerald-700 hover:bg-emerald-600 text-white text-xs font-bold rounded-lg shadow-sm transition-all"
            title="إرسال تنبيه واتساب مباشر للمريض"
          >
            <Share2 className="w-3.5 h-3.5" />
            <span>تنبيه واتساب</span>
          </button>

          {/* PowerPoint (.pptx) Export */}
          <button
            onClick={handlePPTX}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold rounded-lg shadow-sm transition-all"
            title="تصدير عرض تقديمي بوربوينت"
          >
            <FileSpreadsheet className="w-3.5 h-3.5" />
            <span>تصدير PowerPoint</span>
          </button>

          {/* Lab Info & Signatures Edit */}
          {onOpenLabInfoModal && (
            <button
              onClick={onOpenLabInfoModal}
              className="flex items-center gap-1.5 px-3 py-2 bg-slate-800 hover:bg-slate-700 text-rose-300 border border-slate-700 text-xs font-bold rounded-lg shadow-sm transition-all"
              title="تعديل بيانات المعمل والإمضاءات والهواتف والعنوان"
            >
              <Settings className="w-3.5 h-3.5 text-rose-400" />
              <span>بيانات المعمل والإمضاءات</span>
            </button>
          )}

          {/* Invoice Button */}
          {onOpenInvoice && (
            <button
              onClick={onOpenInvoice}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-amber-300 border border-slate-700 text-xs font-bold rounded-lg shadow-sm transition-all"
              title="عرض وطباعة فاتورة الفحص وإيصال السداد المالي"
            >
              <Receipt className="w-3.5 h-3.5 text-amber-400" />
              <span>الفاتورة المالية</span>
            </button>
          )}

          {/* Paper Print */}
          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold rounded-lg border border-slate-600 shadow-sm transition-all"
            title="طباعة على طابعة ورقية"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>طباعة ورقية</span>
          </button>

          {/* Direct PDF File Download */}
          <button
            onClick={handleDownloadPDF}
            disabled={isGeneratingPDF}
            className="flex items-center gap-2 px-5 py-2 bg-gradient-to-r from-red-800 to-rose-700 hover:from-red-700 hover:to-rose-600 text-white text-xs font-black rounded-lg shadow-lg shadow-red-950/40 transition-all active:scale-98 disabled:opacity-50"
          >
            {isGeneratingPDF ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-white" />
                <span>جاري إنشاء وتنزيل الـ PDF...</span>
              </>
            ) : (
              <>
                <Download className="w-4 h-4" />
                <span>تحميل ملف PDF (مباشر)</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Pages Container:
          As requested by user: "كل بروفايل فى صفحه"
          Each profile is rendered as an independent A4 styled page with page-break-after-profile in CSS print!
      */}
      <div className="space-y-8 print:space-y-0">
        {report.profiles.map((profile, pageIdx) => {
          const currentPageNum = pageIdx + 1;

          return (
            <div
              key={profile.id}
              style={{ backgroundColor: '#ffffff' }}
              className="report-page-container bg-white text-slate-900 border border-slate-300 shadow-md rounded-xl max-w-4xl mx-auto p-8 relative print:border-none print:shadow-none print:rounded-none print:p-0 page-break-after-profile min-h-[297mm] flex flex-col justify-between"
            >
              {/* Top Section: Header & Patient Info */}
              <div>
                {/* Official RT LAB Kasr Al Ainy Header */}
                <div className="border-b-2 border-red-950 pb-4 mb-4">
                  <div className="flex items-center justify-between gap-4">
                    {/* Arabic credentials */}
                    <div className="text-right flex-1 space-y-0.5">
                      <h2 className="text-xl font-black text-rose-950 tracking-tight">
                        معامل RT للتحاليل التشخيصية
                      </h2>
                      <h3 className="text-sm font-bold text-slate-800">
                        معامل رامي مختار
                      </h3>
                      <p className="text-xs font-semibold text-rose-900">
                        أطباء الباثولوجيا الإكلينيكية والكيميائية
                      </p>
                      <p className="text-xs text-slate-600 font-medium">
                        كلية طب قصر العيني - جامعة القاهرة
                      </p>
                      <p className="text-[10px] text-slate-500 font-bold mt-1">
                        📍 المقر الرئيسي: ميدان بهتيم برج صيدلية العزبي الدور الثالث شبرا الخيمة | هاتف: 01012345678
                      </p>
                    </div>

                    {/* Laboratory Central 3D Logo matching uploaded brand images */}
                    <div className="flex flex-col items-center justify-center px-4">
                      <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#800000] via-[#991b1b] to-[#0f172a] p-1 shadow-md flex items-center justify-center border border-red-300">
                        <div className="w-full h-full rounded-xl bg-slate-950 flex flex-col items-center justify-center relative overflow-hidden text-center">
                          <div className="flex items-center justify-center leading-none">
                            <span className="font-black text-2xl text-rose-500">R</span>
                            <span className="text-rose-400 text-lg -mx-0.5">💧</span>
                            <span className="font-black text-2xl text-slate-200">T</span>
                          </div>
                          <span className="text-[8px] font-extrabold tracking-widest text-slate-300 -mt-0.5">
                            LABS
                          </span>
                        </div>
                      </div>
                      <span className="text-[9px] font-black text-rose-950 tracking-widest mt-1 uppercase">
                        Kasr Al Ainy
                      </span>
                      <span className="text-[10px] font-black text-rose-900 tracking-wide mt-0.5 whitespace-nowrap">
                        التشخيص الصحيح يبدأ معنا
                      </span>
                    </div>

                    {/* English credentials */}
                    <div className="text-left flex-1 space-y-0.5" dir="ltr">
                      <h2 className="text-xl font-black text-rose-950 tracking-tight">
                        RT LAB LABORATORIES
                      </h2>
                      <h3 className="text-sm font-bold text-slate-800">
                        Rami Mokhtar Laboratories
                      </h3>
                      <p className="text-xs font-semibold text-rose-900">
                        Clinical & Chemical Pathologists
                      </p>
                      <p className="text-xs text-slate-600 font-medium">
                        Kasr Al Ainy Faculty of Medicine
                      </p>
                    </div>
                  </div>

                  {/* Red & Navy dual accent line */}
                  <div className="mt-3 flex h-1 w-full rounded-full overflow-hidden">
                    <div className="w-3/4 bg-red-900"></div>
                    <div className="w-1/4 bg-slate-900"></div>
                  </div>
                </div>

                {/* Patient Demographics Card */}
                <div className="bg-slate-50 border border-slate-200 rounded-lg p-3.5 mb-5 text-xs text-slate-800">
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-y-2 gap-x-4">
                    {/* Patient Name */}
                    <div className="col-span-2">
                      <span className="text-slate-500 font-medium ml-1">اسم المريض:</span>
                      <strong className="text-slate-950 font-bold text-sm">{p.fullName}</strong>
                    </div>

                    {/* Lab Number & Barcode */}
                    <div className="text-left sm:text-right" dir="ltr">
                      <span className="text-slate-500 font-medium mr-1">Lab No:</span>
                      <strong className="text-rose-950 font-mono-numbers font-bold text-sm">{p.labNumber}</strong>
                    </div>

                    {/* Barcode representation */}
                    <div className="text-left" dir="ltr">
                      <div className="font-mono text-[10px] tracking-widest bg-white border border-slate-300 px-2 py-0.5 rounded text-center inline-block">
                        ||| | |||| | ||| {p.barcode}
                      </div>
                    </div>

                    {/* Age & Gender */}
                    <div>
                      <span className="text-slate-500 font-medium ml-1">السن / النوع:</span>
                      <strong className="text-slate-900 font-semibold font-mono-numbers">
                        {p.age} {p.ageUnit === 'years' ? 'سنة' : p.ageUnit === 'months' ? 'شهر' : 'يوم'}
                      </strong>
                      <span className="mx-1">/</span>
                      <strong className="text-slate-900 font-semibold">
                        {p.gender === 'male' ? 'ذكر (Male)' : 'أنثى (Female)'}
                      </strong>
                    </div>

                    {/* Referring Doctor */}
                    <div className="col-span-2">
                      <span className="text-slate-500 font-medium ml-1">الطبيب المعالج:</span>
                      <strong className="text-slate-900 font-semibold">{formatDoctorDisplay()}</strong>
                    </div>

                    {/* WhatsApp */}
                    <div dir="ltr" className="text-left sm:text-right">
                      <span className="text-slate-500 font-medium mr-1">Tel / WA:</span>
                      <span className="font-mono-numbers font-semibold text-slate-800">{p.phone}</span>
                    </div>

                    {/* Sample Date */}
                    <div>
                      <span className="text-slate-500 font-medium ml-1">تاريخ السحب:</span>
                      <span className="font-mono-numbers text-slate-800">
                        {new Date(p.sampleDate).toLocaleDateString('en-GB')}
                      </span>
                    </div>

                    {/* Reporting Date */}
                    <div>
                      <span className="text-slate-500 font-medium ml-1">تاريخ الإصدار:</span>
                      <span className="font-mono-numbers text-slate-800">
                        {new Date(p.reportingDate).toLocaleDateString('en-GB')}
                      </span>
                    </div>

                    {/* Fasting hours / Notes */}
                    <div className="col-span-2 text-slate-600">
                      {p.fastingHours ? (
                        <span className="ml-3">الصيام: <strong className="text-slate-800">{p.fastingHours} ساعة</strong></span>
                      ) : null}
                      {p.clinicalHistory ? (
                        <span>تشخيص: <span className="text-slate-800">{p.clinicalHistory}</span></span>
                      ) : null}
                    </div>
                  </div>
                </div>

                {/* Profile Title Banner */}
                <div className="bg-gradient-to-r from-red-950 via-slate-900 to-slate-900 text-white px-4 py-2 rounded-lg flex items-center justify-between mb-3 shadow-xs">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-rose-500"></span>
                    <h3 className="text-sm font-black tracking-wide uppercase">
                      {profile.titleEn}
                    </h3>
                    <span className="text-rose-300 text-xs">·</span>
                    <h4 className="text-xs font-bold text-rose-100">
                      {profile.titleAr}
                    </h4>
                  </div>

                  <div className="text-xs text-rose-200 font-mono flex items-center gap-2">
                    <span className="hidden sm:inline">Sample: {profile.sampleType}</span>
                    <span className="bg-rose-950 px-2 py-0.5 rounded text-[10px] border border-rose-800 text-white font-bold">
                      Page {currentPageNum} of {totalPages}
                    </span>
                  </div>
                </div>

                {/* Results Table:
                    USER SPECIFIED ORDER FROM LEFT TO RIGHT:
                    Investigations / results / coloured chart / flags / references
                */}
                <div className="overflow-hidden border border-slate-300 rounded-lg mb-4">
                  <table className="w-full text-left border-collapse" dir="ltr">
                    <thead>
                      <tr className="bg-slate-100 text-slate-800 text-[11px] font-black uppercase tracking-wider border-b border-slate-300">
                        <th className="py-2 px-3 text-left w-2/6">Investigations</th>
                        <th className="py-2 px-3 text-center w-1/6">Results</th>
                        <th className="py-2 px-2 text-center w-1/6">Coloured Chart</th>
                        <th className="py-2 px-2 text-center w-1/6">Flags</th>
                        <th className="py-2 px-3 text-left w-2/6">References</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 text-xs bg-white">
                      {profile.parameters.map((param, idx) => {
                        const isHigh = param.flag === 'HIGH' || param.flag === 'PANIC_HIGH';
                        const isLow = param.flag === 'LOW' || param.flag === 'PANIC_LOW';
                        const isAbnormal = isHigh || isLow || param.flag === 'ABNORMAL';

                        return (
                          <tr
                            key={param.id}
                            className={`transition-colors ${
                              isAbnormal ? 'bg-rose-50/25 font-medium' : idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/40'
                            }`}
                          >
                            {/* 1. Investigations */}
                            <td className="py-2 px-3 text-left">
                              <span className="font-bold text-slate-900 block text-xs">
                                {param.name}
                              </span>
                              {param.method && (
                                <span className="text-[9px] text-slate-400 block font-mono">
                                  {param.method}
                                </span>
                              )}
                            </td>

                            {/* 2. Results */}
                            <td className="py-2 px-3 text-center">
                              <span
                                className={`font-mono-numbers text-sm font-black ${
                                  isHigh
                                    ? 'text-rose-900 font-extrabold'
                                    : isLow
                                    ? 'text-amber-800 font-extrabold'
                                    : 'text-slate-900'
                                }`}
                              >
                                {param.result || '—'}
                              </span>
                              {param.unit && (
                                <span className="text-[10px] text-slate-500 ml-1">
                                  {param.unit}
                                </span>
                              )}
                            </td>

                            {/* 3. Coloured chart */}
                            <td className="py-1 px-1 text-center align-middle">
                              <ColouredRangeChart
                                resultStr={param.result}
                                minNormal={param.minNormal}
                                maxNormal={param.maxNormal}
                                flag={param.flag}
                                textReference={param.textReference}
                              />
                            </td>

                            {/* 4. Flags */}
                            <td className="py-2 px-2 text-center align-middle">
                              <FlagBadge flag={param.flag} />
                            </td>

                            {/* 5. References */}
                            <td className="py-2 px-3 text-left">
                              <span className="font-mono-numbers text-xs text-slate-700 font-medium">
                                {formatReferenceDisplay(param)}
                              </span>
                              {param.notes && (
                                <span className="text-[10px] text-slate-400 block italic">
                                  {param.notes}
                                </span>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                {/* Profile Interpretation & Comments (Interpretation and comment) */}
                {(profile.interpretation || profile.comment) && (
                  <div className="bg-slate-50/80 border border-slate-200 rounded-lg p-3 mb-3 space-y-1 text-xs">
                    {profile.interpretation && (
                      <div>
                        <span className="font-bold text-rose-950 ml-1">Interpretation:</span>
                        <span className="text-slate-800 leading-relaxed">{profile.interpretation}</span>
                      </div>
                    )}
                    {profile.comment && (
                      <div className="text-slate-600 text-[11px] pt-0.5">
                        <span className="font-semibold text-slate-700 ml-1">Comments:</span>
                        <span>{profile.comment}</span>
                      </div>
                    )}
                  </div>
                )}

                {/* CBC Peripheral Blood Film Findings Card */}
                {profile.bloodFilmFindings && (
                  <div className="bg-rose-50/40 border border-rose-200/90 rounded-lg p-2.5 mb-3 text-xs avoid-break-inside">
                    <div className="flex items-center justify-between pb-1 border-b border-rose-200/70 mb-1.5">
                      <span className="font-bold text-rose-950 flex items-center gap-1.5">
                        <Microscope className="w-3.5 h-3.5 text-rose-800" />
                        <span>فحص فيلم وشريحة الدم المجهري (Peripheral Blood Film & Morphology)</span>
                      </span>
                      {profile.bloodFilmFindings.reticulocytesPercent && (
                        <span className="text-[10px] font-bold text-rose-900 bg-white px-2 py-0.5 rounded border border-rose-200">
                          الخلايا الشبكية (Reticulocytes): {profile.bloodFilmFindings.reticulocytesPercent}
                        </span>
                      )}
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-[10.5px]">
                      <div className="bg-white/90 p-1.5 rounded border border-rose-100">
                        <span className="font-bold text-rose-900 block">RBCs Morphology:</span>
                        <span className="text-slate-700">{profile.bloodFilmFindings.rbcMorphology || 'Normocytic normochromic'}</span>
                      </div>
                      <div className="bg-white/90 p-1.5 rounded border border-rose-100">
                        <span className="font-bold text-rose-900 block">WBCs Morphology:</span>
                        <span className="text-slate-700">{profile.bloodFilmFindings.wbcMorphology || 'Normal mature cells'}</span>
                      </div>
                      <div className="bg-white/90 p-1.5 rounded border border-rose-100">
                        <span className="font-bold text-rose-900 block">Platelets Morphology:</span>
                        <span className="text-slate-700">{profile.bloodFilmFindings.plateletMorphology || 'Adequate, normal distribution'}</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Attached Disease Illustration or Pathological Infogram */}
                {profile.attachedIllustration ? (
                  <div className="bg-white border-2 border-slate-200 rounded-lg p-2.5 mb-3 text-xs avoid-break-inside shadow-xs">
                    <div className="flex items-start gap-3">
                      {profile.attachedIllustration.imageUrl ? (
                        <div className="w-36 h-22 shrink-0 rounded-lg overflow-hidden border-2 border-rose-900/60 bg-slate-950 shadow-md relative flex items-center justify-center">
                          <img
                            src={profile.attachedIllustration.imageUrl}
                            alt={profile.attachedIllustration.titleEn}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      ) : (
                        <div className="w-32 h-20 shrink-0 rounded-lg overflow-hidden border-2 border-rose-400/60 bg-gradient-to-br from-slate-950 via-rose-950 to-slate-900 flex flex-col justify-between p-2 text-white shadow-md relative">
                          <div className="flex justify-between items-center">
                            <span className="text-[8px] font-mono bg-black/60 text-amber-300 px-1.5 py-0.2 rounded">1000X Oil Immersion</span>
                            <span className="text-[8px] font-bold text-rose-300">Leishman</span>
                          </div>
                          <div>
                            <div className="text-[9.5px] font-black text-white truncate drop-shadow">
                              {profile.attachedIllustration.titleAr}
                            </div>
                            <div className="text-[8px] text-slate-300 font-mono truncate">
                              {profile.attachedIllustration.titleEn}
                            </div>
                          </div>
                        </div>
                      )}
                      <div className="flex-1 space-y-0.5">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-rose-950 text-xs">
                              {profile.attachedIllustration.titleAr}
                            </span>
                            <span className="text-[10px] text-slate-500 font-serif italic">
                              ({profile.attachedIllustration.titleEn})
                            </span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <span className="text-[9.5px] px-2 py-0.5 rounded bg-rose-100 text-rose-900 font-bold">
                              {profile.attachedIllustration.category}
                            </span>
                            {onOpenIllustrationsModal && (
                              <button
                                onClick={() => onOpenIllustrationsModal(profile.id)}
                                className="no-print text-[10px] text-rose-700 hover:text-rose-900 font-bold underline px-1"
                              >
                                تغيير الرسم
                              </button>
                            )}
                          </div>
                        </div>
                        <p className="text-[10.5px] text-slate-700 leading-snug">
                          {profile.attachedIllustration.descriptionAr}
                        </p>
                        {profile.attachedIllustration.diagnosticCriteria && profile.attachedIllustration.diagnosticCriteria.length > 0 && (
                          <div className="flex flex-wrap gap-1 pt-0.5">
                            {profile.attachedIllustration.diagnosticCriteria.slice(0, 3).map((crit: string, cIdx: number) => (
                              <span key={cIdx} className="text-[9px] bg-slate-100 text-slate-700 px-1 py-0.5 rounded border border-slate-200">
                                ✓ {crit}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ) : (
                  onOpenIllustrationsModal && (
                    <div className="no-print mb-3 text-center">
                      <button
                        onClick={() => onOpenIllustrationsModal(profile.id)}
                        className="inline-flex items-center gap-1.5 text-xs font-bold text-rose-700 bg-rose-50 hover:bg-rose-100 px-3 py-1.5 rounded-lg border border-rose-200 transition"
                      >
                        <Sparkles className="w-3.5 h-3.5 text-rose-600" />
                        <span>إرفاق رسم مرضي / شريحة مجهرية لهذا البروفايل</span>
                      </button>
                    </div>
                  )
                )}
              </div>

              {/* Bottom Section: Official Signatures, Watermark, and Footer */}
              <div className="pt-4 border-t-2 border-slate-200 mt-auto avoid-break-inside">
                {/* 3-Column Signatures:
                    User requested:
                    امضاءات
                    اختبار من قائمه
                    Lab CHEMIST
                    Verify by
                    Pathologist
                */}
                <div className="grid grid-cols-3 gap-4 text-center mb-4">
                  {/* Lab CHEMIST */}
                  <div className="space-y-1">
                    <p className="text-[11px] font-bold uppercase text-slate-500 tracking-wide">
                      Lab CHEMIST
                    </p>
                    <div className="h-9 flex items-center justify-center">
                      <span className="font-serif italic text-xs text-slate-500 font-bold tracking-wider">
                        Approved / Chemist
                      </span>
                    </div>
                    <p className="text-xs font-semibold text-slate-800">
                      {report.staff.labChemist}
                    </p>
                  </div>

                  {/* Verify by */}
                  <div className="space-y-1">
                    <p className="text-[11px] font-bold uppercase text-slate-500 tracking-wide">
                      Verify by
                    </p>
                    <div className="h-9 flex items-center justify-center">
                      <span className="font-serif italic text-xs text-slate-500 font-bold tracking-wider">
                        Quality Audit Verified
                      </span>
                    </div>
                    <p className="text-xs font-semibold text-slate-800">
                      {report.staff.verifiedBy}
                    </p>
                  </div>

                  {/* Pathologist */}
                  <div className="space-y-1 border-r border-slate-200 pr-2">
                    <p className="text-[11px] font-bold uppercase text-rose-950 tracking-wide">
                      Consultant Pathologist
                    </p>
                    <div className="h-9 flex items-center justify-center">
                      {/* Realistic signature stamp representation */}
                      <div className="inline-block px-2 py-0.5 border border-dashed border-rose-800 rounded bg-rose-50/50">
                        <span className="font-serif italic text-xs text-rose-900 font-black">
                          Dr. Rami Mokhtar
                        </span>
                      </div>
                    </div>
                    <p className="text-xs font-bold text-rose-950">
                      {report.staff.pathologist}
                    </p>
                  </div>
                </div>

                {/* Footer Credentials & Page Number */}
                <div className="flex items-center justify-between text-[10px] text-slate-500 pt-2 border-t border-slate-100">
                  <div className="flex items-center gap-3">
                    <span className="flex items-center gap-1 font-semibold text-rose-950">
                      <ShieldCheck className="w-3.5 h-3.5 text-rose-800" />
                      RT LAB Diagnostic System
                    </span>
                    <span>·</span>
                    <span>Kasr Al Ainy Faculty of Medicine</span>
                    <span>·</span>
                    <span>المقر: ميدان بهتيم برج العزبي</span>
                    <span>·</span>
                    <span>Tel: 01012345678 / 0244667788</span>
                  </div>

                  <div className="font-mono font-bold text-slate-600">
                    Report ID: {report.reportNumber} | Page {currentPageNum} of {totalPages}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
