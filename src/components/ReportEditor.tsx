import React, { useState } from 'react';
import { LabReport, TestProfile, TestParameter, LabStaffSignatures, ReportStatus } from '../types/lab';
import { calculateFlag, formatReferenceDisplay, runAutomaticCalculations } from '../utils/calculator';
import { COMMON_INTERPRETATIONS, STAFF_OPTIONS } from '../data/labCatalog';
import { suggestHematologicalIllustration } from '../data/diseaseIllustrations';
import { ColouredRangeChart } from './ColouredRangeChart';
import { FlagBadge } from './FlagBadge';
import { QuickResultPicker } from './QuickResultPicker';
import { ParameterEditModal } from './ParameterEditModal';
import { AddParameterModal } from './AddParameterModal';
import { 
  Plus, 
  Trash2, 
  ArrowUp, 
  ArrowDown, 
  BookOpen, 
  Edit2, 
  Printer, 
  Share2, 
  FileSpreadsheet, 
  Save, 
  CheckCircle2, 
  MessageSquare, 
  Layers,
  ChevronDown,
  Sparkles,
  UserCheck,
  Calculator,
  AlertCircle,
  Receipt,
  Microscope
} from 'lucide-react';

interface ReportEditorProps {
  report: LabReport;
  onUpdateReport: (updated: LabReport) => void;
  onSaveToArchive: () => void;
  onPrintPreview: () => void;
  onSendWhatsApp: () => void;
  onExportPPTX: () => void;
  onOpenCatalog: () => void;
  onOpenManualTest: () => void;
  onOpenInvoice?: () => void;
  onOpenIllustrationsModal?: (profileId: string) => void;
  onOpenSmartReport?: () => void;
}

export const ReportEditor: React.FC<ReportEditorProps> = ({
  report,
  onUpdateReport,
  onSaveToArchive,
  onPrintPreview,
  onSendWhatsApp,
  onExportPPTX,
  onOpenCatalog,
  onOpenManualTest,
  onOpenInvoice,
  onOpenIllustrationsModal,
  onOpenSmartReport
}) => {
  const [activeProfileTab, setActiveProfileTab] = useState<string>(report.profiles[0]?.id || '');
  const [modalParamToEdit, setModalParamToEdit] = useState<TestParameter | null>(null);
  const [isAddParamModalOpen, setIsAddParamModalOpen] = useState(false);
  const [lastCalculatedInfo, setLastCalculatedInfo] = useState<string[]>([]);

  // Update profile field
  const handleUpdateProfile = (profileId: string, updates: Partial<TestProfile>) => {
    const updatedProfiles = report.profiles.map(p => {
      if (p.id === profileId) {
        return { ...p, ...updates };
      }
      return p;
    });
    onUpdateReport({ ...report, profiles: updatedProfiles, updatedAt: new Date().toISOString() });
  };

  // Move profile up / down
  const handleMoveProfile = (index: number, direction: 'up' | 'down') => {
    const newProfiles = [...report.profiles];
    const targetIdx = direction === 'up' ? index - 1 : index + 1;
    if (targetIdx < 0 || targetIdx >= newProfiles.length) return;

    const temp = newProfiles[index];
    newProfiles[index] = newProfiles[targetIdx];
    newProfiles[targetIdx] = temp;

    onUpdateReport({ ...report, profiles: newProfiles, updatedAt: new Date().toISOString() });
  };

  // Delete profile
  const handleDeleteProfile = (profileId: string) => {
    if (report.profiles.length <= 1) {
      alert('يجب أن يحتوي التقرير على فحص واحد على الأقل.');
      return;
    }
    if (confirm('هل أنت متأكد من حذف هذا البروفايل بالكامل من التقرير؟')) {
      const filtered = report.profiles.filter(p => p.id !== profileId);
      onUpdateReport({ ...report, profiles: filtered, updatedAt: new Date().toISOString() });
      if (activeProfileTab === profileId) {
        setActiveProfileTab(filtered[0]?.id || '');
      }
    }
  };

  // Trigger Automatic Calculations on active profile or across report
  const handleRunAutoCalc = (profileId: string) => {
    const currentProf = report.profiles.find(p => p.id === profileId);
    if (!currentProf) return;

    const { updatedParams, calculationsApplied } = runAutomaticCalculations(
      currentProf.parameters,
      { age: report.patient.age, gender: report.patient.gender }
    );

    if (calculationsApplied.length > 0) {
      const updatedProfiles = report.profiles.map(p => {
        if (p.id === profileId) {
          return { ...p, parameters: updatedParams };
        }
        return p;
      });
      onUpdateReport({ ...report, profiles: updatedProfiles, updatedAt: new Date().toISOString() });
      setLastCalculatedInfo(calculationsApplied);
    } else {
      alert('تم فحص البارامترات: لم يتم العثور على قيم جديدة بحاجة لحساب أو أن القيم المدخلة غير كافية لحساب المعادلات (مثل RBC مع HCT/HGB، أو Glucose مع Fasting Insulin).');
    }
  };

  // Update single parameter
  const handleUpdateParameter = (profileId: string, paramId: string, updates: Partial<TestParameter>) => {
    const updatedProfiles = report.profiles.map(prof => {
      if (prof.id === profileId) {
        let updatedParams = prof.parameters.map(param => {
          if (param.id === paramId) {
            const merged = { ...param, ...updates };
            // Recalculate flag if result or ranges changed
            if (updates.result !== undefined || updates.minNormal !== undefined || updates.maxNormal !== undefined) {
              merged.flag = calculateFlag(merged.result, merged.minNormal, merged.maxNormal, merged.panicLow, merged.panicHigh);
            }
            return merged;
          }
          return param;
        });

        // If a result was entered/changed, automatically evaluate dependent clinical calculations!
        if (updates.result !== undefined && updates.result.trim() !== '') {
          const autoRes = runAutomaticCalculations(updatedParams, { age: report.patient.age, gender: report.patient.gender });
          if (autoRes.calculationsApplied.length > 0) {
            updatedParams = autoRes.updatedParams;
            setLastCalculatedInfo(autoRes.calculationsApplied);
          }
        }

        return { ...prof, parameters: updatedParams };
      }
      return prof;
    });

    onUpdateReport({ ...report, profiles: updatedProfiles, updatedAt: new Date().toISOString() });
  };

  // Add new parameter to current profile
  const handleAddParameterToCurrentProfile = (newParam: Omit<TestParameter, 'id' | 'result' | 'flag'>) => {
    const paramWithId: TestParameter = {
      ...newParam,
      id: `param-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      result: '',
      flag: ''
    };

    const updatedProfiles = report.profiles.map(prof => {
      if (prof.id === activeProfileTab) {
        return {
          ...prof,
          parameters: [...prof.parameters, paramWithId]
        };
      }
      return prof;
    });

    onUpdateReport({ ...report, profiles: updatedProfiles, updatedAt: new Date().toISOString() });
  };

  // Move parameter up / down inside profile
  const handleMoveParameter = (profileId: string, paramIndex: number, direction: 'up' | 'down') => {
    const updatedProfiles = report.profiles.map(prof => {
      if (prof.id === profileId) {
        const params = [...prof.parameters];
        const targetIdx = direction === 'up' ? paramIndex - 1 : paramIndex + 1;
        if (targetIdx < 0 || targetIdx >= params.length) return prof;
        const temp = params[paramIndex];
        params[paramIndex] = params[targetIdx];
        params[targetIdx] = temp;
        return { ...prof, parameters: params };
      }
      return prof;
    });
    onUpdateReport({ ...report, profiles: updatedProfiles, updatedAt: new Date().toISOString() });
  };

  // Delete single parameter
  const handleDeleteParameter = (profileId: string, paramId: string) => {
    if (confirm('هل أنت متأكد من حذف هذا التحليل من التقرير؟')) {
      const updatedProfiles = report.profiles.map(prof => {
        if (prof.id === profileId) {
          return {
            ...prof,
            parameters: prof.parameters.filter(p => p.id !== paramId)
          };
        }
        return prof;
      });
      onUpdateReport({ ...report, profiles: updatedProfiles, updatedAt: new Date().toISOString() });
    }
  };

  // Staff updates
  const handleStaffChange = <K extends keyof LabStaffSignatures>(key: K, val: string) => {
    onUpdateReport({
      ...report,
      staff: {
        ...report.staff,
        [key]: val
      },
      updatedAt: new Date().toISOString()
    });
  };

  const currentProfile = report.profiles.find(p => p.id === activeProfileTab) || report.profiles[0];
  const currentProfileIdx = report.profiles.findIndex(p => p.id === (currentProfile?.id || ''));

  return (
    <div className="space-y-6">
      {/* Top Action Ribbon */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs flex flex-wrap items-center justify-between gap-3 sticky top-28 z-30">
        <div className="flex items-center gap-3">
          <span className="text-xs font-bold text-slate-500">حالة التقرير:</span>
          <select
            value={report.status}
            onChange={(e) => onUpdateReport({ ...report, status: e.target.value as ReportStatus })}
            className={`text-xs font-bold px-3 py-1.5 rounded-lg border focus:outline-none ${
              report.status === 'released'
                ? 'bg-emerald-50 text-emerald-900 border-emerald-300'
                : report.status === 'verified'
                ? 'bg-blue-50 text-blue-900 border-blue-300'
                : 'bg-amber-50 text-amber-900 border-amber-300'
            }`}
          >
            <option value="draft">مسودة (Draft)</option>
            <option value="in_progress">قيد الفحص (In Progress)</option>
            <option value="verified">تمت المراجعة والاعتماد (Verified)</option>
            <option value="released">تم الإصدار النهائي للمريض (Released)</option>
          </select>

          <span className="text-slate-300">|</span>

          <button
            type="button"
            onClick={onSaveToArchive}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-rose-900 hover:bg-rose-800 text-white rounded-lg text-xs font-bold shadow-xs transition-all active:scale-95"
          >
            <Save className="w-3.5 h-3.5" />
            <span>حفظ بالأرشيف</span>
          </button>
        </div>

        <div className="flex items-center gap-2">
          {/* WhatsApp Alert */}
          <button
            type="button"
            onClick={onSendWhatsApp}
            className="flex items-center gap-1 px-3 py-1.5 bg-emerald-700 hover:bg-emerald-600 text-white text-xs font-bold rounded-lg transition-all"
            title="إرسال تنبيه واتساب مباشر للمريض"
          >
            <Share2 className="w-3.5 h-3.5" />
            <span>واتساب</span>
          </button>

          {/* Export PPTX */}
          <button
            type="button"
            onClick={onExportPPTX}
            className="flex items-center gap-1 px-3 py-1.5 bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold rounded-lg transition-all"
            title="تصدير عرض تقديمي بوربوينت"
          >
            <FileSpreadsheet className="w-3.5 h-3.5" />
            <span>PowerPoint</span>
          </button>

          {/* Invoice & Receipt Button */}
          {onOpenInvoice && (
            <button
              type="button"
              onClick={onOpenInvoice}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-amber-300 border border-slate-700 text-xs font-bold rounded-lg transition-all shadow-xs"
              title="طباعة وتحميل فاتورة الفحص وإيصال السداد المالي"
            >
              <Receipt className="w-3.5 h-3.5 text-amber-400" />
              <span>فاتورة وإيصال مالي</span>
            </button>
          )}

          {/* Print Preview */}
          <button
            type="button"
            onClick={onPrintPreview}
            className="flex items-center gap-1.5 px-4 py-1.5 bg-gradient-to-r from-red-800 to-rose-700 hover:from-red-700 hover:to-rose-600 text-white text-xs font-black rounded-lg shadow-sm transition-all"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>معاينة وطباعة التقرير (A4)</span>
          </button>
        </div>
      </div>

      {/* Profiles Tabs & Switcher */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="bg-slate-50 border-b border-slate-200 p-2 flex items-center justify-between gap-2 overflow-x-auto">
          <div className="flex items-center gap-1.5">
            {report.profiles.map((profile, idx) => (
              <button
                key={profile.id}
                onClick={() => setActiveProfileTab(profile.id)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
                  (currentProfile?.id === profile.id)
                    ? 'bg-rose-900 text-white shadow-xs'
                    : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
                }`}
              >
                <span className="w-4 h-4 rounded-full bg-black/20 flex items-center justify-center text-[10px]">
                  {idx + 1}
                </span>
                <span>{profile.titleEn}</span>
                <span className="text-[10px] opacity-75">({profile.parameters.length})</span>
              </button>
            ))}
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={onOpenCatalog}
              className="flex items-center gap-1 px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-900 rounded-lg text-xs font-bold border border-rose-200"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>إضافة بروفايل من الكتالوج</span>
            </button>
          </div>
        </div>

        {/* Current Active Profile Editor */}
        {currentProfile && (
          <div className="p-5 space-y-5">
            {/* Profile Header Controls: Title, category, auto-calculate & delete */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-3 border-b border-slate-100">
              <div className="space-y-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-mono-numbers font-semibold">
                    {currentProfile.profileCode || 'CUSTOM'}
                  </span>
                  <input
                    type="text"
                    value={currentProfile.titleEn}
                    onChange={(e) => handleUpdateProfile(currentProfile.id, { titleEn: e.target.value })}
                    className="text-base font-black text-slate-900 border-b border-dashed border-slate-300 hover:border-rose-600 focus:border-rose-600 focus:outline-none px-1"
                    placeholder="Profile Name (English)"
                  />
                  <span className="text-slate-400">/</span>
                  <input
                    type="text"
                    value={currentProfile.titleAr}
                    onChange={(e) => handleUpdateProfile(currentProfile.id, { titleAr: e.target.value })}
                    className="text-sm font-bold text-slate-700 border-b border-dashed border-slate-300 hover:border-rose-600 focus:border-rose-600 focus:outline-none px-1"
                    placeholder="اسم البروفايل (عربي)"
                  />
                </div>
                <div className="flex items-center gap-3 text-xs text-slate-500">
                  <span>نوع العينة (Sample):</span>
                  <input
                    type="text"
                    value={currentProfile.sampleType}
                    onChange={(e) => handleUpdateProfile(currentProfile.id, { sampleType: e.target.value })}
                    className="border-b border-slate-200 text-slate-700 px-1 py-0.5 font-medium"
                    placeholder="e.g. EDTA Whole Blood, Serum, Urine"
                  />
                </div>
              </div>

              {/* Action Buttons: Auto-Calculate, Add Parameter, Profile Reordering & Delete */}
              <div className="flex items-center gap-2 flex-wrap text-xs">
                {/* Auto Calculate Button */}
                <button
                  type="button"
                  onClick={() => handleRunAutoCalc(currentProfile.id)}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-blue-700 to-indigo-700 hover:from-blue-600 hover:to-indigo-600 text-white rounded-lg font-bold shadow-xs active:scale-95 transition-all"
                  title="حساب المعادلات تلقائياً (CBC Indices, HOMA-IR, eAG, VLDL, LDL, ACR, Corrected Ca...)"
                >
                  <Calculator className="w-3.5 h-3.5 text-blue-200" />
                  <span>⚡ حساب المعادلات تلقائياً</span>
                </button>

                {/* Add Parameter to Profile */}
                <button
                  type="button"
                  onClick={() => setIsAddParamModalOpen(true)}
                  className="flex items-center gap-1 px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-900 border border-rose-200 rounded-lg font-bold transition-all"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>إضافة تحليل هنا</span>
                </button>

                {/* Attach Disease Illustration Button */}
                {onOpenIllustrationsModal && (
                  <button
                    type="button"
                    onClick={() => onOpenIllustrationsModal(currentProfile.id)}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-amber-600 to-rose-600 hover:from-amber-500 hover:to-rose-500 text-white rounded-lg font-bold shadow-xs active:scale-95 transition-all"
                    title="إرفاق رسم توضيحي لأمراض الدم أو إنفوجرام للأعضاء والتحاليل"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-amber-200" />
                    <span>🎨 أطلس الرسومات المرضية</span>
                  </button>
                )}

                {/* Auto Suggest Hematology Illustration for CBC */}
                {(currentProfile.profileCode === 'CBC' || currentProfile.titleEn.toLowerCase().includes('blood')) && (
                  <button
                    type="button"
                    onClick={() => {
                      const { updatedParams } = runAutomaticCalculations(currentProfile.parameters, {
                        age: report.patient.age,
                        gender: report.patient.gender
                      });
                      const suggested = suggestHematologicalIllustration(updatedParams);
                      handleUpdateProfile(currentProfile.id, {
                        attachedIllustration: suggested,
                        parameters: updatedParams
                      });
                      alert(`تم اقتراح وربط شريحة مرضية تلقائياً: ${suggested.titleAr} (${suggested.titleEn})`);
                    }}
                    className="flex items-center gap-1.5 px-2.5 py-1.5 bg-emerald-700 hover:bg-emerald-600 text-white rounded-lg font-bold shadow-xs transition-all text-xs"
                    title="فحص مؤشرات الدم واقتراح شريحة مجهرية مطابقة لنتائج المريض آلياً"
                  >
                    <span>💡 اقتراح شريحة آلية</span>
                  </button>
                )}

                {/* Smart Clinical Report Button */}
                {onOpenSmartReport && (
                  <button
                    type="button"
                    onClick={onOpenSmartReport}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-amber-600 via-orange-600 to-rose-700 hover:from-amber-500 hover:to-rose-600 text-white rounded-lg font-bold shadow-xs active:scale-95 transition-all text-xs"
                    title="فتح التقرير الإكلينيكي الذكي وتحليل مؤشرات الأعضاء والمؤشرات السريرية"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-amber-200 animate-pulse" />
                    <span>⚡ التقرير الذكي والاستشاري</span>
                  </button>
                )}

                {/* Move Profile Up/Down */}
                <div className="flex items-center gap-1 bg-slate-100 p-0.5 rounded-lg border border-slate-200">
                  <button
                    type="button"
                    disabled={currentProfileIdx === 0}
                    onClick={() => handleMoveProfile(currentProfileIdx, 'up')}
                    className="p-1 rounded text-slate-600 hover:bg-white disabled:opacity-30 disabled:pointer-events-none"
                    title="تحريك البروفايل لأعلى"
                  >
                    <ArrowUp className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    disabled={currentProfileIdx === report.profiles.length - 1}
                    onClick={() => handleMoveProfile(currentProfileIdx, 'down')}
                    className="p-1 rounded text-slate-600 hover:bg-white disabled:opacity-30 disabled:pointer-events-none"
                    title="تحريك البروفايل لأسفل"
                  >
                    <ArrowDown className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Delete Profile */}
                <button
                  type="button"
                  onClick={() => handleDeleteProfile(currentProfile.id)}
                  className="p-1.5 rounded-lg bg-red-50 hover:bg-red-100 text-red-700 border border-red-200"
                  title="حذف هذا البروفايل بالكامل"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Auto Calculations Banner if any occurred */}
            {lastCalculatedInfo.length > 0 && (
              <div className="bg-blue-50 border border-blue-200 text-blue-900 px-3.5 py-2 rounded-xl text-xs flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-blue-600" />
                  <span>تم حساب وتحديث المعادلات بنجاح: <strong>{lastCalculatedInfo.join('، ')}</strong></span>
                </div>
                <button onClick={() => setLastCalculatedInfo([])} className="text-blue-500 hover:text-blue-800 text-[11px]">✕</button>
              </div>
            )}

            {/* Attached Disease Illustration / Infogram Banner */}
            {currentProfile.attachedIllustration && (
              <div className="bg-amber-50/70 border border-amber-200 rounded-xl p-3 flex items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-3">
                  {currentProfile.attachedIllustration.imageUrl && (
                    <img
                      src={currentProfile.attachedIllustration.imageUrl}
                      alt={currentProfile.attachedIllustration.titleEn}
                      className="w-16 h-12 rounded object-cover border border-amber-300 shadow-2xs"
                    />
                  )}
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-amber-950 text-sm">
                        {currentProfile.attachedIllustration.titleAr}
                      </span>
                      <span className="text-slate-500 font-serif italic text-xs">
                        ({currentProfile.attachedIllustration.titleEn})
                      </span>
                      <span className="text-[10px] bg-amber-200 text-amber-900 px-2 py-0.5 rounded-full font-bold">
                        {currentProfile.attachedIllustration.category}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-700 mt-0.5">
                      {currentProfile.attachedIllustration.descriptionAr}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {onOpenIllustrationsModal && (
                    <button
                      type="button"
                      onClick={() => onOpenIllustrationsModal(currentProfile.id)}
                      className="px-2.5 py-1 bg-white hover:bg-amber-100 text-amber-900 border border-amber-300 rounded-lg text-xs font-bold transition"
                    >
                      تغيير الرسم
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => handleUpdateProfile(currentProfile.id, { attachedIllustration: undefined })}
                    className="p-1 text-red-600 hover:text-red-800 text-xs font-bold"
                    title="إزالة الرسم من التقرير"
                  >
                    ✕
                  </button>
                </div>
              </div>
            )}

            {/* CBC Peripheral Blood Film Findings Editor */}
            {(currentProfile.profileCode === 'CBC' || currentProfile.titleEn.toLowerCase().includes('blood')) && (
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 space-y-2 text-xs">
                <div className="flex items-center justify-between pb-1.5 border-b border-slate-200">
                  <span className="font-bold text-slate-800 flex items-center gap-1.5">
                    <Microscope className="w-4 h-4 text-rose-700" />
                    <span>فحص شريحة وفيلم الدم المجهري (Peripheral Blood Film & Morphology)</span>
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="text-slate-500 text-[11px]">الخلايا الشبكية (Reticulocytes %):</span>
                    <input
                      type="text"
                      value={currentProfile.bloodFilmFindings?.reticulocytesPercent || ''}
                      onChange={(e) => {
                        const cur = currentProfile.bloodFilmFindings || { rbcMorphology: '', wbcMorphology: '', plateletMorphology: '' };
                        handleUpdateProfile(currentProfile.id, {
                          bloodFilmFindings: { ...cur, reticulocytesPercent: e.target.value }
                        });
                      }}
                      placeholder="e.g. 0.5 - 2.0 %"
                      className="px-2 py-0.5 text-xs bg-white border border-slate-300 rounded font-semibold w-24 text-center"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">فحص كرات الدم الحمراء (RBCs Morphology):</label>
                    <input
                      type="text"
                      value={currentProfile.bloodFilmFindings?.rbcMorphology || ''}
                      onChange={(e) => {
                        const cur = currentProfile.bloodFilmFindings || { rbcMorphology: '', wbcMorphology: '', plateletMorphology: '' };
                        handleUpdateProfile(currentProfile.id, {
                          bloodFilmFindings: { ...cur, rbcMorphology: e.target.value }
                        });
                      }}
                      placeholder="Normocytic normochromic, no anisocytosis"
                      className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-xs"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">فحص كرات الدم البيضاء (WBCs Morphology):</label>
                    <input
                      type="text"
                      value={currentProfile.bloodFilmFindings?.wbcMorphology || ''}
                      onChange={(e) => {
                        const cur = currentProfile.bloodFilmFindings || { rbcMorphology: '', wbcMorphology: '', plateletMorphology: '' };
                        handleUpdateProfile(currentProfile.id, {
                          bloodFilmFindings: { ...cur, wbcMorphology: e.target.value }
                        });
                      }}
                      placeholder="Normal differential, mature cells"
                      className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-xs"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">فحص الصفائح (Platelets Morphology):</label>
                    <input
                      type="text"
                      value={currentProfile.bloodFilmFindings?.plateletMorphology || ''}
                      onChange={(e) => {
                        const cur = currentProfile.bloodFilmFindings || { rbcMorphology: '', wbcMorphology: '', plateletMorphology: '' };
                        handleUpdateProfile(currentProfile.id, {
                          bloodFilmFindings: { ...cur, plateletMorphology: e.target.value }
                        });
                      }}
                      placeholder="Adequate in number, normal morphology"
                      className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-xs"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Test Parameters Table:
                User requested exact order from left to right:
                Investigations / results / coloured chart / flags / references
            */}
            <div className="overflow-x-auto rounded-xl border border-slate-200 shadow-2xs">
              <table className="w-full text-right border-collapse" dir="ltr">
                <thead>
                  <tr className="bg-gradient-to-r from-red-950 via-slate-900 to-slate-900 text-white text-xs font-bold uppercase tracking-wider">
                    <th className="py-2.5 px-3 text-left w-10">#</th>
                    <th className="py-2.5 px-3 text-left">Investigations</th>
                    <th className="py-2.5 px-3 text-center w-48">Results & Options</th>
                    <th className="py-2.5 px-3 text-center w-36">Coloured Chart</th>
                    <th className="py-2.5 px-3 text-center w-28">Flags</th>
                    <th className="py-2.5 px-3 text-left w-48">References</th>
                    <th className="py-2.5 px-2 text-center w-28">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 bg-white text-sm">
                  {currentProfile.parameters.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="text-center py-8 text-slate-400 text-xs">
                        لا توجد تحاليل في هذا البروفايل حالياً. اضغط "إضافة تحليل هنا" للبدء.
                      </td>
                    </tr>
                  ) : (
                    currentProfile.parameters.map((param, pIdx) => {
                      const isAbnormal = param.flag && param.flag !== 'NORMAL';
                      return (
                        <tr
                          key={param.id}
                          className={`hover:bg-rose-50/20 transition-colors ${
                            isAbnormal ? 'bg-rose-50/10' : ''
                          }`}
                        >
                          {/* Row Index */}
                          <td className="py-2.5 px-3 text-xs text-slate-400 font-mono-numbers text-left">
                            {pIdx + 1}
                          </td>

                          {/* 1. Investigations */}
                          <td className="py-2.5 px-3 text-left">
                            <div>
                              <input
                                type="text"
                                value={param.name}
                                onChange={(e) => handleUpdateParameter(currentProfile.id, param.id, { name: e.target.value })}
                                className="w-full font-bold text-slate-900 bg-transparent hover:bg-slate-50 focus:bg-white rounded px-1.5 py-1 focus:outline-none focus:ring-1 focus:ring-rose-500 border border-transparent focus:border-rose-400 text-sm"
                              />
                              <div className="flex items-center gap-2 text-[10px] text-slate-400 px-1 font-mono">
                                {param.method && <span>Method: {param.method}</span>}
                                {param.notes && <span className="text-rose-700 font-semibold">• {param.notes}</span>}
                              </div>
                            </div>
                          </td>

                          {/* 2. Results & Clinical Prefill Picker */}
                          <td className="py-2.5 px-3 text-center">
                            <div className="flex items-center justify-center gap-1.5">
                              {/* Quick clinical pre-fill options (Colors, Transparency, Nil, +, etc.) */}
                              <QuickResultPicker
                                paramName={param.name}
                                currentValue={param.result}
                                onSelect={(val) => handleUpdateParameter(currentProfile.id, param.id, { result: val })}
                              />

                              <input
                                type="text"
                                placeholder="النتيجة"
                                value={param.result}
                                onChange={(e) => handleUpdateParameter(currentProfile.id, param.id, { result: e.target.value })}
                                className={`w-28 text-center font-black font-mono-numbers text-sm rounded-md px-2 py-1 border transition-all ${
                                  param.flag === 'HIGH' || param.flag === 'PANIC_HIGH'
                                    ? 'bg-rose-50 text-rose-900 border-rose-400 font-extrabold'
                                    : param.flag === 'LOW' || param.flag === 'PANIC_LOW'
                                    ? 'bg-amber-50 text-amber-900 border-amber-400 font-extrabold'
                                    : 'bg-slate-50 text-slate-900 border-slate-300 focus:bg-white focus:border-rose-600'
                                } focus:outline-none focus:ring-2 focus:ring-rose-500/20`}
                              />

                              {param.unit && (
                                <span className="text-xs text-slate-500 font-medium">
                                  {param.unit}
                                </span>
                              )}
                            </div>
                          </td>

                          {/* 3. Coloured chart */}
                          <td className="py-2 px-2 text-center">
                            <ColouredRangeChart
                              resultStr={param.result}
                              minNormal={param.minNormal}
                              maxNormal={param.maxNormal}
                              flag={param.flag}
                              textReference={param.textReference}
                            />
                          </td>

                          {/* 4. Flags */}
                          <td className="py-2.5 px-3 text-center">
                            <FlagBadge flag={param.flag} />
                          </td>

                          {/* 5. References */}
                          <td className="py-2.5 px-3 text-left">
                            <span className="text-xs text-slate-700 font-mono-numbers block font-medium">
                              {formatReferenceDisplay(param)}
                            </span>
                          </td>

                          {/* 6. Actions: Edit, Up, Down, Delete */}
                          <td className="py-2 px-2 text-center">
                            <div className="flex items-center justify-center gap-1">
                              {/* Edit Modal Button */}
                              <button
                                type="button"
                                onClick={() => setModalParamToEdit(param)}
                                className="p-1.5 text-slate-500 hover:text-rose-900 hover:bg-rose-50 rounded-md transition-colors"
                                title="تعديل اسم التحليل والمعدل الطبيعي ووحدة القياس"
                              >
                                <Edit2 className="w-3.5 h-3.5" />
                              </button>

                              {/* Move Up */}
                              <button
                                type="button"
                                disabled={pIdx === 0}
                                onClick={() => handleMoveParameter(currentProfile.id, pIdx, 'up')}
                                className="p-1 text-slate-400 hover:text-slate-700 disabled:opacity-20"
                                title="تحريك لأعلى"
                              >
                                <ArrowUp className="w-3 h-3" />
                              </button>

                              {/* Move Down */}
                              <button
                                type="button"
                                disabled={pIdx === currentProfile.parameters.length - 1}
                                onClick={() => handleMoveParameter(currentProfile.id, pIdx, 'down')}
                                className="p-1 text-slate-400 hover:text-slate-700 disabled:opacity-20"
                                title="تحريك لأسفل"
                              >
                                <ArrowDown className="w-3 h-3" />
                              </button>

                              {/* Delete Parameter */}
                              <button
                                type="button"
                                onClick={() => handleDeleteParameter(currentProfile.id, param.id)}
                                className="p-1.5 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-md transition-colors"
                                title="حذف هذا التحليل"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
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

            {/* Bottom Add Parameter Bar */}
            <div className="flex items-center justify-between pt-1">
              <button
                type="button"
                onClick={() => setIsAddParamModalOpen(true)}
                className="flex items-center gap-1.5 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold rounded-lg border border-slate-300 transition-colors"
              >
                <Plus className="w-4 h-4 text-rose-700" />
                <span>+ إضافة سطر تحليل جديد لهذا الفحص</span>
              </button>

              <button
                type="button"
                onClick={() => handleRunAutoCalc(currentProfile.id)}
                className="flex items-center gap-1 text-xs font-bold text-blue-700 hover:text-blue-900"
              >
                <Calculator className="w-3.5 h-3.5" />
                <span>إعادة تشغيل الحسابات الآلية (Auto Calc)</span>
              </button>
            </div>

            {/* Clinical Interpretation & Comments */}
            <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 space-y-4">
              <div className="flex items-center gap-2 text-rose-950 font-bold text-xs">
                <MessageSquare className="w-4 h-4 text-rose-700" />
                <span>التشخيص والتعليق الإكلينيكي المعتمد (Clinical Interpretation):</span>
              </div>

              <div>
                <textarea
                  rows={2}
                  value={currentProfile.interpretation || ''}
                  onChange={(e) => handleUpdateProfile(currentProfile.id, { interpretation: e.target.value })}
                  placeholder="اكتب التفسير التشخيصي للنتائج (يظهر في تقرير المريض المطبوع)..."
                  className="w-full text-xs p-3 rounded-lg border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-600"
                />
              </div>

              {/* Quick Interpretation Snippets */}
              {COMMON_INTERPRETATIONS[currentProfile.profileCode] && (
                <div className="space-y-1.5">
                  <div className="text-[11px] font-semibold text-slate-500">
                    عبارات تشخيصية استرشادية جاهزة للاختيار:
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {COMMON_INTERPRETATIONS[currentProfile.profileCode].map((text, i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => handleUpdateProfile(currentProfile.id, { interpretation: text })}
                        className="text-[11px] bg-white hover:bg-rose-50 text-slate-700 hover:text-rose-900 border border-slate-200 px-2.5 py-1 rounded-md text-right transition-colors"
                      >
                        • {text.slice(0, 60)}...
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Staff Signatures Box */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <UserCheck className="w-4 h-4 text-rose-800" />
            <h3 className="font-bold text-sm text-slate-900">طاقم الفحص والاعتماد (يظهر أسفل كل صفحة بالتقرير)</h3>
          </div>
          <span className="text-xs text-slate-500">معامل رامي مختار - قصر العيني</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Lab Chemist */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Lab CHEMIST (الكيميائي المسؤول):
            </label>
            <input
              type="text"
              value={report.staff.labChemist}
              onChange={(e) => handleStaffChange('labChemist', e.target.value)}
              className="w-full text-xs p-2.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-1 focus:ring-rose-500"
            />
          </div>

          {/* Verifier */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Verify by (المراجعة الإكلينيكية):
            </label>
            <input
              type="text"
              value={report.staff.verifiedBy}
              onChange={(e) => handleStaffChange('verifiedBy', e.target.value)}
              className="w-full text-xs p-2.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-1 focus:ring-rose-500"
            />
          </div>

          {/* Pathologist */}
          <div>
            <label className="block text-xs font-bold text-rose-900 mb-1">
              Consultant Pathologist (استشاري الباثولوجيا):
            </label>
            <input
              type="text"
              value={report.staff.pathologist}
              onChange={(e) => handleStaffChange('pathologist', e.target.value)}
              className="w-full text-xs p-2.5 rounded-lg border border-rose-300 bg-rose-50/40 text-rose-950 font-bold focus:outline-none focus:ring-1 focus:ring-rose-500"
            />
          </div>
        </div>
      </div>

      {/* Parameter Edit Modal */}
      <ParameterEditModal
        isOpen={!!modalParamToEdit}
        onClose={() => setModalParamToEdit(null)}
        parameter={modalParamToEdit}
        onSave={(updated) => {
          if (modalParamToEdit && currentProfile) {
            handleUpdateParameter(currentProfile.id, modalParamToEdit.id, updated);
          }
        }}
      />

      {/* Add Parameter Modal */}
      <AddParameterModal
        isOpen={isAddParamModalOpen}
        onClose={() => setIsAddParamModalOpen(false)}
        onAdd={handleAddParameterToCurrentProfile}
      />
    </div>
  );
};
