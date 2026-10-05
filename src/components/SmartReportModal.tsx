import React, { useMemo } from 'react';
import { LabReport } from '../types/lab';
import { generateSmartClinicalAnalysis } from '../utils/smartReportEngine';
import { 
  Sparkles, 
  X, 
  Printer, 
  ShieldAlert, 
  Activity, 
  Heart, 
  Brain, 
  CheckCircle2, 
  AlertTriangle, 
  Stethoscope, 
  FileText,
  TrendingUp,
  Download
} from 'lucide-react';

interface SmartReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  report: LabReport | null;
  onAttachToReport?: (summaryAr: string) => void;
}

export const SmartReportModal: React.FC<SmartReportModalProps> = ({
  isOpen,
  onClose,
  report,
  onAttachToReport
}) => {
  if (!isOpen || !report) return null;

  const analysis = useMemo(() => generateSmartClinicalAnalysis(report), [report]);

  const handlePrintSmart = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white border border-slate-200 w-full max-w-4xl rounded-2xl shadow-2xl flex flex-col max-h-[92vh] overflow-hidden text-slate-800" dir="rtl">
        {/* Header */}
        <div className="p-4 bg-gradient-to-r from-red-950 via-rose-900 to-slate-900 text-white flex items-center justify-between border-b border-rose-950/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/10 border border-white/20 flex items-center justify-center text-amber-300">
              <Sparkles className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-black tracking-wide">التقرير الإكلينيكي الذكي والتحليل الاستشاري</h2>
                <span className="bg-rose-600/80 text-white text-[10px] font-bold px-2 py-0.5 rounded-full font-mono">
                  RT AI Studio v3.0
                </span>
              </div>
              <p className="text-xs text-rose-200">
                تقييم فوري لمؤشرات الأعضاء الحيوية، وحساب المؤشرات السريرية (منتزر، الفلترة الكبيبية، وتصلب الشرايين)
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrintSmart}
              className="px-3 py-1.5 bg-rose-800 hover:bg-rose-700 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors"
            >
              <Printer className="w-4 h-4" />
              <span>طباعة</span>
            </button>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5 bg-slate-50/50">
          {/* Patient Quick Strip */}
          <div className="bg-white rounded-xl p-3.5 border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-3 text-xs">
            <div>
              <span className="text-slate-400">المريض: </span>
              <strong className="text-slate-900 text-sm font-bold">{analysis.patientName}</strong>
              <span className="text-slate-400 mx-2">|</span>
              <span className="text-slate-600">{analysis.age} سنة - {analysis.gender === 'male' ? 'ذكر' : 'أنثى'}</span>
            </div>
            <div className="flex items-center gap-2 font-mono text-[11px] text-slate-500">
              <span>كود التحليل: {report.patient.labNumber}</span>
              <span>• باركود: {report.patient.barcode}</span>
            </div>
          </div>

          {/* Critical Alerts Banner (if any) */}
          {analysis.criticalAlerts.length > 0 && (
            <div className="space-y-2">
              <h3 className="text-xs font-black text-rose-900 flex items-center gap-1.5">
                <ShieldAlert className="w-4 h-4 text-rose-600" />
                <span>تنبيهات القيم الحرجة والاستدعاء السريري السريع:</span>
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {analysis.criticalAlerts.map((alert, i) => (
                  <div key={i} className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs space-y-1">
                    <div className="flex items-center justify-between">
                      <strong className="text-rose-900 font-bold">{alert.titleAr}</strong>
                      <span className="px-1.5 py-0.2 rounded bg-rose-200 text-rose-900 text-[10px] font-bold">
                        {alert.severity.toUpperCase()}
                      </span>
                    </div>
                    <p className="text-rose-800 text-[11px] leading-relaxed">{alert.detail}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Organ Function Health Scores */}
          <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-xs space-y-3">
            <h3 className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
              <Activity className="w-4 h-4 text-rose-600" />
              <span>مؤشرات كفاءة وسلامة الأعضاء الحيوية (Vital Organ Health Scores):</span>
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
              {[
                { label: 'وظائف الكلى', data: analysis.organScores.renal },
                { label: 'وظائف الكبد', data: analysis.organScores.hepatic },
                { label: 'الأيض والسكر', data: analysis.organScores.metabolic },
                { label: 'مؤشرات الدم', data: analysis.organScores.hematologic },
                { label: 'صحة القلب والدهون', data: analysis.organScores.cardiac },
              ].map((org, idx) => {
                const colors = {
                  optimal: 'bg-emerald-50 border-emerald-200 text-emerald-800 progress-emerald',
                  mild: 'bg-amber-50 border-amber-200 text-amber-800',
                  moderate: 'bg-orange-50 border-orange-200 text-orange-800',
                  critical: 'bg-rose-50 border-rose-200 text-rose-800'
                };
                return (
                  <div key={idx} className={`p-2.5 rounded-xl border text-center space-y-1.5 ${colors[org.data.status]}`}>
                    <div className="text-[11px] font-bold text-slate-700">{org.label}</div>
                    <div className="text-xl font-black font-mono">{org.data.score}%</div>
                    <div className="text-[10px] font-semibold">{org.data.labelAr}</div>
                    <div className="w-full bg-slate-200 rounded-full h-1.5 overflow-hidden">
                      <div 
                        className={`h-full ${org.data.status === 'optimal' ? 'bg-emerald-500' : org.data.status === 'critical' ? 'bg-rose-600' : 'bg-amber-500'}`}
                        style={{ width: `${org.data.score}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Calculated Clinical Indices */}
          {analysis.calculatedIndices.length > 0 && (
            <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-xs space-y-2.5">
              <h3 className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                <Brain className="w-4 h-4 text-indigo-600" />
                <span>المعادلات والمؤشرات الإكلينيكية المحسوبة تلقائياً:</span>
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                {analysis.calculatedIndices.map((idx, i) => (
                  <div key={i} className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-1">
                    <div className="font-bold text-slate-900">{idx.nameAr}</div>
                    <div className="text-lg font-mono font-black text-rose-900">{idx.value}</div>
                    <div className="text-[10px] text-slate-500">المرجع: {idx.reference}</div>
                    <p className="text-[11px] text-slate-700 font-medium pt-1 border-t border-slate-200/60 leading-snug">
                      {idx.interpretationAr}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Automated Differential Diagnoses */}
          {analysis.differentialDiagnoses.length > 0 && (
            <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-xs space-y-2.5">
              <h3 className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                <Stethoscope className="w-4 h-4 text-emerald-600" />
                <span>التشخيص التفريقي التلقائي المقترح (Clinical Differential Diagnosis):</span>
              </h3>
              <div className="space-y-2">
                {analysis.differentialDiagnoses.map((diag, i) => (
                  <div key={i} className="p-3 rounded-xl bg-emerald-50/50 border border-emerald-200/80 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <strong className="text-emerald-950 font-bold text-sm">{diag.diseaseAr}</strong>
                      <span className="text-[11px] text-emerald-700 mr-1.5" dir="ltr">({diag.diseaseEn})</span>
                      <p className="text-slate-600 text-[11px] mt-0.5">{diag.rationaleAr}</p>
                    </div>
                    <span className="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-900 text-[10px] font-bold shrink-0 self-start sm:self-auto">
                      احتمالية {diag.likelihood === 'high' ? 'عالية' : 'متوسطة'}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Consultant Recommendations */}
          <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-xs space-y-2.5">
            <h3 className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-rose-600" />
              <span>توصيات الاستشاري والخطوات الإكلينيكية التالية:</span>
            </h3>
            <ul className="space-y-1.5 text-xs text-slate-700">
              {analysis.consultantRecommendations.map((rec, i) => (
                <li key={i} className="flex items-start gap-2 bg-slate-50 p-2 rounded-lg border border-slate-200/70">
                  <span className="w-4 h-4 rounded-full bg-rose-100 text-rose-900 font-bold flex items-center justify-center text-[10px] shrink-0 mt-0.5">
                    {i + 1}
                  </span>
                  <span className="leading-relaxed">{rec}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-3.5 bg-slate-100 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="text-[11px] text-slate-500">
            أ.د. رامي مختار - استشاري الباثولوجيا الإكلينيكية والكيميائية - كلية طب قصر العيني
          </div>
          <div className="flex items-center gap-2">
            {onAttachToReport && (
              <button
                onClick={() => {
                  onAttachToReport(analysis.executiveSummaryAr);
                  onClose();
                }}
                className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl font-bold flex items-center gap-1.5 transition-colors shadow-xs"
              >
                <FileText className="w-4 h-4" />
                <span>إدراج التقرير الذكي كتعليق رسمي بالتقرير</span>
              </button>
            )}
            <button
              onClick={onClose}
              className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-xl font-semibold transition-colors"
            >
              إغلاق
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
