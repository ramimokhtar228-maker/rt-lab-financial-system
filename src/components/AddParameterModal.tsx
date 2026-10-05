import React, { useState } from 'react';
import { TestParameter } from '../types/lab';
import { X, Plus } from 'lucide-react';

interface AddParameterModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (param: Omit<TestParameter, 'id' | 'result' | 'flag'>) => void;
}

export const AddParameterModal: React.FC<AddParameterModalProps> = ({
  isOpen,
  onClose,
  onAdd
}) => {
  if (!isOpen) return null;

  const [name, setName] = useState('');
  const [unit, setUnit] = useState('');
  const [minNormal, setMinNormal] = useState('');
  const [maxNormal, setMaxNormal] = useState('');
  const [textReference, setTextReference] = useState('');
  const [method, setMethod] = useState('');
  const [notes, setNotes] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      alert('برجاء كتابة اسم التحليل');
      return;
    }

    onAdd({
      name: name.trim(),
      unit: unit.trim(),
      minNormal: minNormal ? parseFloat(minNormal) : undefined,
      maxNormal: maxNormal ? parseFloat(maxNormal) : undefined,
      textReference: textReference.trim() || undefined,
      method: method.trim() || undefined,
      notes: notes.trim() || undefined
    });

    setName('');
    setUnit('');
    setMinNormal('');
    setMaxNormal('');
    setTextReference('');
    setMethod('');
    setNotes('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl w-full max-w-md overflow-hidden text-right">
        <div className="bg-slate-900 text-white p-4 flex items-center justify-between">
          <h3 className="font-bold text-sm flex items-center gap-2">
            <Plus className="w-4 h-4 text-rose-400" />
            <span>إضافة تحليل جديد للبروفايل الحالي</span>
          </h3>
          <button onClick={onClose} className="text-slate-400 hover:text-white p-1">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-3.5">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">اسم الفحص / التحليل (Test Name):</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full text-xs font-bold p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:outline-none"
              dir="ltr"
              placeholder="e.g. Free T4, Serum Ferritin, Troponin I"
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
                className="w-full text-xs p-2 border border-slate-300 rounded-lg"
                dir="ltr"
                placeholder="mg/dL, g/dL, %"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">طريقة الفحص (Method):</label>
              <input
                type="text"
                value={method}
                onChange={(e) => setMethod(e.target.value)}
                className="w-full text-xs p-2 border border-slate-300 rounded-lg"
                dir="ltr"
                placeholder="CLIA, Enzymatic"
              />
            </div>
          </div>

          <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
            <div className="font-bold text-xs text-rose-900 mb-2">المعدل الطبيعي العددي (Normal Range):</div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] text-slate-600 mb-1">أدنى (Min):</label>
                <input
                  type="number"
                  step="any"
                  value={minNormal}
                  onChange={(e) => setMinNormal(e.target.value)}
                  className="w-full text-xs p-1.5 border border-slate-300 rounded-lg bg-white"
                  placeholder="e.g. 70"
                />
              </div>
              <div>
                <label className="block text-[11px] text-slate-600 mb-1">أقصى (Max):</label>
                <input
                  type="number"
                  step="any"
                  value={maxNormal}
                  onChange={(e) => setMaxNormal(e.target.value)}
                  className="w-full text-xs p-1.5 border border-slate-300 rounded-lg bg-white"
                  placeholder="e.g. 110"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">المعدل الطبيعي الوصفي / النصي (Text Reference):</label>
            <input
              type="text"
              value={textReference}
              onChange={(e) => setTextReference(e.target.value)}
              className="w-full text-xs p-2 border border-slate-300 rounded-lg"
              dir="ltr"
              placeholder="e.g. Negative, Non-reactive, < 1.0"
            />
          </div>

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
              className="flex items-center gap-1 px-5 py-2 text-xs font-bold text-white bg-rose-900 hover:bg-rose-800 rounded-lg shadow-sm"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>إضافة التحليل فوراً</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
