import React, { useState } from 'react';
import { TestParameter, TestProfile } from '../types/lab';
import { calculateFlag } from '../utils/calculator';
import { Plus, X, FlaskConical, Edit3 } from 'lucide-react';

interface ManualTestModalProps {
  isOpen: boolean;
  onClose: () => void;
  profiles: TestProfile[];
  onAddManualTest: (targetProfileId: string | 'new', testParam: TestParameter, newProfileInfo?: { titleEn: string; titleAr: string; category: string }) => void;
}

export const ManualTestModal: React.FC<ManualTestModalProps> = ({
  isOpen,
  onClose,
  profiles,
  onAddManualTest
}) => {
  const [targetMode, setTargetMode] = useState<'existing' | 'new'>('new');
  const [selectedProfileId, setSelectedProfileId] = useState<string>(profiles[0]?.id || 'new');

  // New profile fields if creating brand new profile
  const [newProfileTitleEn, setNewProfileTitleEn] = useState('Special Investigations');
  const [newProfileTitleAr, setNewProfileTitleAr] = useState('فحوصات وتحاليل خاصة');
  const [newProfileCategory, setNewProfileCategory] = useState('Special Chemistry');

  // Test Parameter fields
  const [paramName, setParamName] = useState('');
  const [result, setResult] = useState('');
  const [unit, setUnit] = useState('');
  const [isQuantitative, setIsQuantitative] = useState(true);
  const [minNormal, setMinNormal] = useState<string>('');
  const [maxNormal, setMaxNormal] = useState<string>('');
  const [panicLow, setPanicLow] = useState<string>('');
  const [panicHigh, setPanicHigh] = useState<string>('');
  const [textReference, setTextReference] = useState('');
  const [method, setMethod] = useState('');
  const [notes, setNotes] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!paramName.trim()) return;

    const minNum = minNormal !== '' ? parseFloat(minNormal) : undefined;
    const maxNum = maxNormal !== '' ? parseFloat(maxNormal) : undefined;
    const pLowNum = panicLow !== '' ? parseFloat(panicLow) : undefined;
    const pHighNum = panicHigh !== '' ? parseFloat(panicHigh) : undefined;

    const flag = calculateFlag(result, minNum, maxNum, pLowNum, pHighNum);

    const newParam: TestParameter = {
      id: `custom-param-${Date.now()}`,
      name: paramName.trim(),
      result: result.trim(),
      unit: unit.trim(),
      minNormal: isQuantitative ? minNum : undefined,
      maxNormal: isQuantitative ? maxNum : undefined,
      panicLow: isQuantitative ? pLowNum : undefined,
      panicHigh: isQuantitative ? pHighNum : undefined,
      textReference: isQuantitative ? undefined : textReference.trim(),
      flag,
      method: method.trim() || undefined,
      notes: notes.trim() || undefined
    };

    if (targetMode === 'new' || profiles.length === 0) {
      onAddManualTest('new', newParam, {
        titleEn: newProfileTitleEn.trim() || 'Custom Diagnostic Profile',
        titleAr: newProfileTitleAr.trim() || 'فحوصات مخصصة',
        category: newProfileCategory.trim() || 'Custom'
      });
    } else {
      onAddManualTest(selectedProfileId, newParam);
    }

    // Reset fields
    setParamName('');
    setResult('');
    setMinNormal('');
    setMaxNormal('');
    setTextReference('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full border border-slate-200 overflow-hidden animate-in fade-in duration-200">
        <div className="bg-gradient-to-r from-red-950 via-slate-900 to-slate-900 text-white px-6 py-4 flex items-center justify-between border-b border-rose-900/40">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-rose-900/60 border border-rose-700/50 flex items-center justify-center text-rose-300">
              <FlaskConical className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">إضافة فحص أو تحليل يدوي مخصص</h3>
              <p className="text-xs text-rose-200">أدخل أي تحليل يدوي غير مدرج بالكتالوج مع معدلاته المرجعية</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center justify-center transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
          {/* Target: Add to existing profile or create new */}
          {profiles.length > 0 && (
            <div className="space-y-2 pb-3 border-b border-slate-100">
              <label className="block text-xs font-bold text-slate-700">مكان إضافة الفحص:</label>
              <div className="flex gap-3">
                <label className="flex items-center gap-2 text-xs font-semibold text-slate-800 cursor-pointer">
                  <input
                    type="radio"
                    checked={targetMode === 'existing'}
                    onChange={() => setTargetMode('existing')}
                    className="accent-rose-800"
                  />
                  <span>إضافة لبروفايل حالي بالتقرير</span>
                </label>
                <label className="flex items-center gap-2 text-xs font-semibold text-slate-800 cursor-pointer">
                  <input
                    type="radio"
                    checked={targetMode === 'new'}
                    onChange={() => setTargetMode('new')}
                    className="accent-rose-800"
                  />
                  <span>إنشاء بروفايل أو صفحة فحص جديدة</span>
                </label>
              </div>

              {targetMode === 'existing' ? (
                <select
                  value={selectedProfileId}
                  onChange={(e) => setSelectedProfileId(e.target.value)}
                  className="w-full text-xs font-semibold bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-slate-900 mt-2 focus:ring-2 focus:ring-rose-500/20"
                >
                  {profiles.map(p => (
                    <option key={p.id} value={p.id}>
                      {p.titleEn} - {p.titleAr} ({p.parameters.length} تحاليل)
                    </option>
                  ))}
                </select>
              ) : null}
            </div>
          )}

          {/* New Profile details if target is new */}
          {(targetMode === 'new' || profiles.length === 0) && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3 bg-rose-50/50 rounded-xl border border-rose-100">
              <div>
                <label className="block text-[11px] font-bold text-rose-950 mb-1">اسم البروفايل (English)</label>
                <input
                  type="text"
                  value={newProfileTitleEn}
                  onChange={(e) => setNewProfileTitleEn(e.target.value)}
                  placeholder="e.g. Immunological Assay"
                  className="w-full text-xs bg-white border border-rose-200 rounded-lg p-2 text-slate-900 focus:outline-none focus:ring-1 focus:ring-rose-600"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-rose-950 mb-1">اسم البروفايل (عربي)</label>
                <input
                  type="text"
                  value={newProfileTitleAr}
                  onChange={(e) => setNewProfileTitleAr(e.target.value)}
                  placeholder="مثال: تحاليل مناعية خاصة"
                  className="w-full text-xs bg-white border border-rose-200 rounded-lg p-2 text-slate-900 focus:outline-none focus:ring-1 focus:ring-rose-600"
                />
              </div>
            </div>
          )}

          {/* Test Name & Result */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-slate-700 mb-1">
                اسم الفحص / التحليل (Investigation Name) <span className="text-rose-600">*</span>
              </label>
              <input
                type="text"
                required
                value={paramName}
                onChange={(e) => setParamName(e.target.value)}
                placeholder="مثال: Serum Lipase, Calcitonin, Anti-CCP..."
                className="w-full text-sm font-semibold bg-white border border-slate-300 rounded-lg p-2.5 text-slate-900 focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-600"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">وحدة القياس (Unit)</label>
              <input
                type="text"
                value={unit}
                onChange={(e) => setUnit(e.target.value)}
                placeholder="mg/dL, U/L, %"
                className="w-full text-sm bg-white border border-slate-300 rounded-lg p-2.5 text-slate-900 focus:outline-none focus:ring-2 focus:ring-rose-500/20"
              />
            </div>
          </div>

          {/* Result value */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              النتيجة الحالية (Result)
            </label>
            <input
              type="text"
              value={result}
              onChange={(e) => setResult(e.target.value)}
              placeholder="مثال: 45.2 أو Negative أو Non-reactive"
              className="w-full text-sm font-bold font-mono-numbers bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-slate-900 focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-600"
            />
          </div>

          {/* Reference type toggle: Quantitative vs Qualitative */}
          <div className="space-y-2 pt-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-700">نوع المعدل المرجعي (Reference Range):</span>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setIsQuantitative(true)}
                  className={`px-3 py-1 text-xs font-semibold rounded-md transition-all ${
                    isQuantitative ? 'bg-rose-900 text-white shadow-xs' : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  رقمي كمي (Min - Max)
                </button>
                <button
                  type="button"
                  onClick={() => setIsQuantitative(false)}
                  className={`px-3 py-1 text-xs font-semibold rounded-md transition-all ${
                    !isQuantitative ? 'bg-rose-900 text-white shadow-xs' : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  وصفي نوعي (Text / Negative)
                </button>
              </div>
            </div>

            {isQuantitative ? (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-3 bg-slate-50 rounded-xl border border-slate-200">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">أدنى طبيعي (Min Normal)</label>
                  <input
                    type="number"
                    step="any"
                    value={minNormal}
                    onChange={(e) => setMinNormal(e.target.value)}
                    placeholder="0.0"
                    className="w-full text-xs font-mono-numbers bg-white border border-slate-300 rounded p-2"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">أعلى طبيعي (Max Normal)</label>
                  <input
                    type="number"
                    step="any"
                    value={maxNormal}
                    onChange={(e) => setMaxNormal(e.target.value)}
                    placeholder="100.0"
                    className="w-full text-xs font-mono-numbers bg-white border border-slate-300 rounded p-2"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-rose-700 mb-1">حرج منخفض (Panic Low)</label>
                  <input
                    type="number"
                    step="any"
                    value={panicLow}
                    onChange={(e) => setPanicLow(e.target.value)}
                    placeholder="اختياري"
                    className="w-full text-xs font-mono-numbers bg-white border border-rose-200 rounded p-2"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-rose-700 mb-1">حرج مرتفع (Panic High)</label>
                  <input
                    type="number"
                    step="any"
                    value={panicHigh}
                    onChange={(e) => setPanicHigh(e.target.value)}
                    placeholder="اختياري"
                    className="w-full text-xs font-mono-numbers bg-white border border-rose-200 rounded p-2"
                  />
                </div>
              </div>
            ) : (
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">المعدل الطبيعي الوصفي</label>
                <input
                  type="text"
                  value={textReference}
                  onChange={(e) => setTextReference(e.target.value)}
                  placeholder="مثال: Negative (< 0.90 S/CO) أو Non-reactive أو Clear"
                  className="w-full text-xs bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-slate-900"
                />
              </div>
            )}
          </div>

          {/* Method & Notes */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">طريقة الفحص (Method)</label>
              <input
                type="text"
                value={method}
                onChange={(e) => setMethod(e.target.value)}
                placeholder="مثال: CLIA, ECLIA, Turbidimetry"
                className="w-full text-xs bg-white border border-slate-300 rounded-lg p-2 text-slate-800"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">ملاحظات إضافية للفحص</label>
              <input
                type="text"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="توجيهات سريرية أو تعليق"
                className="w-full text-xs bg-white border border-slate-300 rounded-lg p-2 text-slate-800"
              />
            </div>
          </div>

          <div className="pt-4 flex items-center justify-end gap-2 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
            >
              إلغاء
            </button>
            <button
              type="submit"
              className="flex items-center gap-1.5 px-5 py-2 bg-rose-900 hover:bg-rose-800 text-white font-bold text-xs rounded-lg shadow-sm transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>إضافة الفحص إلى التقرير</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
