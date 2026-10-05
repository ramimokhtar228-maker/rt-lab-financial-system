import React, { useState } from 'react';
import { DiseaseIllustration } from '../types';
import { DISEASE_ILLUSTRATIONS } from '../data/diseaseIllustrations';
import { X, Search, Check, Sparkles, Microscope, BookOpen, Layers, ShieldCheck, HeartPulse, Activity } from 'lucide-react';

interface DiseaseIllustrationsModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedIllustrationId?: string;
  onSelectIllustration: (illustration: DiseaseIllustration) => void;
  suggestedCode?: string;
}

export const DiseaseIllustrationsModal: React.FC<DiseaseIllustrationsModalProps> = ({
  isOpen,
  onClose,
  selectedIllustrationId,
  onSelectIllustration,
  suggestedCode
}) => {
  const [activeTab, setActiveTab] = useState<'all' | 'hematology' | 'biochemistry' | 'microscopy' | 'cardiac'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [previewItem, setPreviewItem] = useState<DiseaseIllustration>(
    DISEASE_ILLUSTRATIONS.find(d => d.id === selectedIllustrationId) || DISEASE_ILLUSTRATIONS[0]
  );

  if (!isOpen) return null;

  const filtered = DISEASE_ILLUSTRATIONS.filter(item => {
    const matchesTab = activeTab === 'all' || item.category === activeTab;
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      item.titleAr.toLowerCase().includes(q) ||
      item.titleEn.toLowerCase().includes(q) ||
      item.pathologySummaryAr.toLowerCase().includes(q) ||
      item.keyDiagnosticPoints.some(p => p.toLowerCase().includes(q));
    return matchesTab && matchesSearch;
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-700 w-full max-w-5xl rounded-2xl shadow-2xl flex flex-col max-h-[92vh] overflow-hidden text-slate-100">
        
        {/* Header */}
        <div className="p-4 bg-gradient-to-r from-rose-950 via-slate-900 to-slate-900 border-b border-rose-900/40 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-rose-600/20 text-rose-400 rounded-xl border border-rose-500/30">
              <Microscope className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg font-black text-white flex items-center gap-2">
                <span>أطلس الرسومات التوضيحية والشرائح المرضية للتحاليل</span>
                <span className="text-xs bg-rose-900/60 text-rose-300 px-2 py-0.5 rounded-full border border-rose-700/50">
                  RT Pathological Atlas
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                رسومات مجهرية ملونة وإنفوجرامات تفصيلية لأمراض الدم وصورة الدم (CBC) وكافة التحاليل الطبية
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Filter bar & Search */}
        <div className="p-3 bg-slate-950/60 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-1.5 overflow-x-auto text-xs">
            <button
              onClick={() => setActiveTab('all')}
              className={`px-3 py-1.5 rounded-lg font-bold transition flex items-center gap-1.5 ${
                activeTab === 'all'
                  ? 'bg-rose-700 text-white shadow-md'
                  : 'bg-slate-800/80 text-slate-300 hover:bg-slate-700'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>الكل ({DISEASE_ILLUSTRATIONS.length})</span>
            </button>
            <button
              onClick={() => setActiveTab('hematology')}
              className={`px-3 py-1.5 rounded-lg font-bold transition flex items-center gap-1.5 ${
                activeTab === 'hematology'
                  ? 'bg-rose-700 text-white shadow-md'
                  : 'bg-slate-800/80 text-slate-300 hover:bg-slate-700'
              }`}
            >
              <Microscope className="w-3.5 h-3.5" />
              <span>أمراض الدم وCBC ({DISEASE_ILLUSTRATIONS.filter(i => i.category === 'hematology').length})</span>
            </button>
            <button
              onClick={() => setActiveTab('biochemistry')}
              className={`px-3 py-1.5 rounded-lg font-bold transition flex items-center gap-1.5 ${
                activeTab === 'biochemistry'
                  ? 'bg-rose-700 text-white shadow-md'
                  : 'bg-slate-800/80 text-slate-300 hover:bg-slate-700'
              }`}
            >
              <Activity className="w-3.5 h-3.5" />
              <span>الكيمياء الحيوية والوظائف</span>
            </button>
            <button
              onClick={() => setActiveTab('microscopy')}
              className={`px-3 py-1.5 rounded-lg font-bold transition flex items-center gap-1.5 ${
                activeTab === 'microscopy'
                  ? 'bg-rose-700 text-white shadow-md'
                  : 'bg-slate-800/80 text-slate-300 hover:bg-slate-700'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>البول والبراز المجهري</span>
            </button>
            <button
              onClick={() => setActiveTab('cardiac')}
              className={`px-3 py-1.5 rounded-lg font-bold transition flex items-center gap-1.5 ${
                activeTab === 'cardiac'
                  ? 'bg-rose-700 text-white shadow-md'
                  : 'bg-slate-800/80 text-slate-300 hover:bg-slate-700'
              }`}
            >
              <HeartPulse className="w-3.5 h-3.5" />
              <span>القلب والسيولة</span>
            </button>
          </div>

          <div className="relative min-w-[240px]">
            <Search className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="بحث باسم المرض أو التشخيص..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg pr-9 pl-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-rose-500"
            />
          </div>
        </div>

        {/* Content Body: Split view (List on right, Preview on left) */}
        <div className="flex-1 grid grid-cols-1 md:grid-cols-12 overflow-hidden">
          
          {/* List of illustrations (5 cols) */}
          <div className="md:col-span-5 border-l border-slate-800 overflow-y-auto p-3 space-y-2 max-h-[60vh] md:max-h-[68vh]">
            {filtered.map(item => {
              const isSelected = selectedIllustrationId === item.id || selectedIllustrationId === item.code;
              const isPreview = previewItem?.id === item.id;
              const isSuggested = suggestedCode && item.code.toLowerCase().includes(suggestedCode.toLowerCase());

              return (
                <div
                  key={item.id}
                  onClick={() => setPreviewItem(item)}
                  className={`p-3 rounded-xl border cursor-pointer transition relative text-right ${
                    isPreview
                      ? 'bg-rose-950/40 border-rose-500/80 ring-1 ring-rose-500/50'
                      : 'bg-slate-800/50 border-slate-700/60 hover:bg-slate-800 hover:border-slate-600'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-slate-700/80 text-rose-300">
                      {item.code}
                    </span>
                    {isSuggested && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 flex items-center gap-1">
                        <Sparkles className="w-2.5 h-2.5" /> مقترح من التحليل
                      </span>
                    )}
                    {isSelected && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                        <Check className="w-2.5 h-2.5" /> مضاف للتقرير
                      </span>
                    )}
                  </div>
                  <h4 className="font-bold text-sm text-white mb-0.5">{item.titleAr}</h4>
                  <div className="text-xs text-slate-400 font-sans" dir="ltr">{item.titleEn}</div>
                  <p className="text-[11px] text-slate-400 line-clamp-2 mt-1.5 leading-relaxed">
                    {item.pathologySummaryAr}
                  </p>
                </div>
              );
            })}
          </div>

          {/* Detailed Preview Panel (7 cols) */}
          <div className="md:col-span-7 p-5 overflow-y-auto max-h-[60vh] md:max-h-[68vh] flex flex-col justify-between bg-slate-900/60">
            {previewItem ? (
              <div className="space-y-4">
                
                {/* Visual Card / Illustration simulation */}
                <div className="p-4 rounded-xl bg-gradient-to-br from-slate-950 via-rose-950/30 to-slate-950 border border-rose-900/40 relative overflow-hidden">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-rose-500 animate-pulse"></div>
                      <span className="text-xs font-mono font-bold text-rose-400">
                        HIGH RESOLUTION PATHOLOGICAL INFOGRAM
                      </span>
                    </div>
                    <span className="text-xs bg-slate-800 text-slate-300 px-2.5 py-1 rounded-md border border-slate-700 font-mono">
                      Category: {previewItem.category.toUpperCase()}
                    </span>
                  </div>

                  <h3 className="text-lg font-black text-white">{previewItem.titleAr}</h3>
                  <div className="text-sm font-semibold text-rose-300 mb-3" dir="ltr">{previewItem.titleEn}</div>

                  {/* Actual High-Resolution Microscopic / Biochemical Vector Illustration */}
                  {previewItem.imageUrl && (
                    <div className="w-full h-48 rounded-xl overflow-hidden border-2 border-rose-800/60 bg-slate-950 flex items-center justify-center my-3 shadow-lg group relative">
                      <img src={previewItem.imageUrl} alt={previewItem.titleEn} className="w-full h-full object-contain" />
                      <span className="absolute top-2 left-2 bg-black/70 text-rose-300 text-[10px] font-mono px-2 py-0.5 rounded border border-rose-500/30">
                        RT Optical Zoom Atlas
                      </span>
                    </div>
                  )}

                  {/* Microscopic Field Simulation Graphic */}
                  <div className="my-3 p-3.5 rounded-lg bg-slate-900/90 border border-rose-800/30 flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-rose-900/40 border-2 border-rose-500/60 flex flex-col items-center justify-center text-center p-1 text-rose-200 shrink-0">
                      <Microscope className="w-5 h-5 text-rose-400" />
                      <span className="text-[7.5px] font-bold">1000X</span>
                    </div>
                    <div className="text-xs text-slate-300 leading-relaxed">
                      <div className="font-bold text-rose-200 mb-0.5">المظهر المجهري والباثولوجي الدقيق:</div>
                      {previewItem.pathologySummaryAr}
                    </div>
                  </div>

                  <div className="text-xs text-slate-400 font-mono" dir="ltr">
                    {previewItem.pathologySummaryEn}
                  </div>
                </div>

                {/* Key Diagnostic Points */}
                <div className="bg-slate-800/40 border border-slate-700/60 rounded-xl p-3.5 space-y-2">
                  <h4 className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-emerald-400" />
                    <span>المعايير التشخيصية المخبرية الدقيقة (Diagnostic Criteria):</span>
                  </h4>
                  <ul className="space-y-1.5 text-xs text-slate-300">
                    {previewItem.keyDiagnosticPoints.map((pt, idx) => (
                      <li key={idx} className="flex items-start gap-2 bg-slate-900/50 p-2 rounded-lg border border-slate-800">
                        <span className="w-4 h-4 rounded-full bg-rose-900/50 text-rose-300 flex items-center justify-center text-[10px] shrink-0 font-bold">
                          {idx + 1}
                        </span>
                        <span className="font-mono text-[11.5px]">{pt}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Associated Conditions & Differential */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                  <div className="bg-slate-800/40 border border-slate-700/50 rounded-xl p-3">
                    <span className="font-bold text-slate-400 block mb-1">الحالات الإكلينيكية المصاحبة:</span>
                    <div className="flex flex-wrap gap-1">
                      {previewItem.associatedConditions.map((cond, i) => (
                        <span key={i} className="bg-slate-900 px-2 py-0.5 rounded text-[11px] text-slate-300 border border-slate-700">
                          {cond}
                        </span>
                      ))}
                    </div>
                  </div>
                  {previewItem.differentialDiagnosis && (
                    <div className="bg-slate-800/40 border border-slate-700/50 rounded-xl p-3">
                      <span className="font-bold text-amber-400 block mb-1">التشخيص التفريقي المخبري:</span>
                      <p className="text-[11px] text-slate-300 leading-snug">
                        {previewItem.differentialDiagnosis}
                      </p>
                    </div>
                  )}
                </div>

              </div>
            ) : null}

            {/* Bottom action button */}
            <div className="pt-4 border-t border-slate-800 flex items-center justify-between mt-4">
              <span className="text-xs text-slate-400">
                يمكن إرفاق هذا الإنفوجرام وطباعته مباشرة ضمن تقرير المريض الرسمي (A4).
              </span>
              <button
                onClick={() => {
                  onSelectIllustration(previewItem);
                  onClose();
                }}
                className="px-5 py-2.5 bg-rose-700 hover:bg-rose-600 text-white font-bold text-xs rounded-xl shadow-lg transition flex items-center gap-2"
              >
                <Check className="w-4 h-4" />
                <span>إرفاق هذا الرسم بالتقرير الحالي</span>
              </button>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
};
