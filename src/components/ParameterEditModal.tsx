import React, { useState } from 'react';
import { TestParameter } from '../types/lab';
import { X, Save, Check } from 'lucide-react';

interface ParameterEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  parameter: TestParameter | null;
  onSave: (updated: Partial<TestParameter>) => void;
}

export const ParameterEditModal: React.FC<ParameterEditModalProps> = ({
  isOpen,
  onClose,
  parameter,
  onSave
}) => {
  if (!isOpen || !parameter) return null;

  const [name, setName] = useState(parameter.name);
  const [unit, setUnit] = useState(parameter.unit || '');
  const [minNormal, setMinNormal] = useState<string>(parameter.minNormal !== undefined ? String(parameter.minNormal) : '');
  const [maxNormal, setMaxNormal] = useState<string>(parameter.maxNormal !== undefined ? String(parameter.maxNormal) : '');
  const [panicLow, setPanicLow] = useState<string>(parameter.panicLow !== undefined ? String(parameter.panicLow) : '');
  const [panicHigh, setPanicHigh] = useState<string>(parameter.panicHigh !== undefined ? String(parameter.panicHigh) : '');
  const [textReference, setTextReference] = useState(parameter.textReference || '');
  const [method, setMethod] = useState(parameter.method || '');
  const [notes, setNotes] = useState(parameter.notes || '');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      alert('برجاء إدخال اسم التحليل');
      return;
    }

    onSave({
      name: name.trim(),
      unit: unit.trim(),
      minNormal: minNormal !== '' ? parseFloat(minNormal) : undefined,
      maxNormal: maxNormal !== '' ? parseFloat(maxNormal) : undefined,
      panicLow: panicLow !== '' ? parseFloat(panicLow) : undefined,
      panicHigh: panicHigh !== '' ? parseFloat(panicHigh) : undefined,
      textReference: textReference.trim() || undefined,
      method: method.trim() || undefined,
      notes: notes.trim() || undefined
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl w-full max-w-lg overflow-hidden text-right">
        {/* Header */}
        <div className="bg-gradient-to-r from-red-900 to-rose-800 text-white p-4 flex items-center justify-between">
          <h3 className="font-bold text-sm flex items-center gap-2">
            <span>تعديل بيانات التحليل والمعدل الطبيعي</span>
          </h3>
          <button onClick={onClose} className="text-rose-200 hover:text-white p-1 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4 max-h-[80vh] overflow-y-auto">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">اسم التحليل (Investigation Name):</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full text-xs font-bold p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:outline-none"
              dir="ltr"
              placeholder="e.g. Serum Creatinine, Fasting Glucose"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">وحدة القياس (Unit):</label>
              <input
                type="text"
                value={unit}
                onChange={(e) => setUnit(e.target.value)}
                className="w-full text-xs p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:outline-none"
                dir="ltr"
                placeholder="mg/dL, g/dL, U/L, %"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">طريقة الفحص (Method):</label>
              <input
                type="text"
                value={method}
                onChange={(e) => setMethod(e.target.value)}
                className="w-full text-xs p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:outline-none"
                dir="ltr"
                placeholder="CLIA, Enzymatic, HPLC"
              />
            </div>
          </div>

          {/* Normal Range */}
          <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-3">
            <div className="font-bold text-xs text-rose-900">المعدل الطبيعي العددي (Normal Reference Range):</div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] text-slate-600 mb-1">الحد الأدنى (Min Normal):</label>
                <input
                  type="number"
                  step="any"
                  value={minNormal}
                  onChange={(e) => setMinNormal(e.target.value)}
                  className="w-full text-xs p-2 border border-slate-300 rounded-lg bg-white"
                  placeholder="e.g. 70"
                />
              </div>

              <div>
                <label className="block text-[11px] text-slate-600 mb-1">الحد الأقصى (Max Normal):</label>
                <input
                  type="number"
                  step="any"
                  value={maxNormal}
                  onChange={(e) => setMaxNormal(e.target.value)}
                  className="w-full text-xs p-2 border border-slate-300 rounded-lg bg-white"
                  placeholder="e.g. 110"
                />
              </div>
            </div>

            {/* Panic Thresholds */}
            <div className="pt-2 border-t border-slate-200">
              <div className="text-[11px] font-bold text-red-700 mb-2">مستويات الخطر والإنذار الحرج (Panic / Critical Alert):</div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] text-slate-500 mb-1">انخفاض حرج (Panic Low ≤):</label>
                  <input
                    type="number"
                    step="any"
                    value={panicLow}
                    onChange={(e) => setPanicLow(e.target.value)}
                    className="w-full text-xs p-1.5 border border-red-200 rounded-lg bg-white text-red-700"
                    placeholder="e.g. 50"
                  />
                </div>
                <div>
                  <label className="block text-[10px] text-slate-500 mb-1">ارتفاع حرج (Panic High ≥):</label>
                  <input
                    type="number"
                    step="any"
                    value={panicHigh}
                    onChange={(e) => setPanicHigh(e.target.value)}
                    className="w-full text-xs p-1.5 border border-red-200 rounded-lg bg-white text-red-700"
                    placeholder="e.g. 400"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Qualitative Text Reference */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              المعدل الطبيعي النصي أو الوصفي (Text Reference):
            </label>
            <input
              type="text"
              value={textReference}
              onChange={(e) => setTextReference(e.target.value)}
              className="w-full text-xs p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:outline-none"
              dir="ltr"
              placeholder="e.g. Negative, Non-Reactive, Nil, < 14.0 ng/L"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">ملاحظات التحليل (Notes):</label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full text-xs p-2.5 border border-slate-300 rounded-lg"
              placeholder="أي ملاحظة تظهر أسفل التحليل في التقرير"
            />
          </div>

          {/* Buttons */}
          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-lg"
            >
              إلغاء
            </button>
            <button
              type="submit"
              className="flex items-center gap-1.5 px-5 py-2 text-xs font-bold text-white bg-rose-900 hover:bg-rose-800 rounded-lg shadow-sm"
            >
              <Save className="w-3.5 h-3.5" />
              <span>حفظ التعديلات</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
