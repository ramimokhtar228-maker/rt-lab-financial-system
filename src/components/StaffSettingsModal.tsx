import React, { useState } from 'react';
import { STAFF_OPTIONS, DEFAULT_STAFF } from '../data/labCatalog';
import { LabStaffSignatures } from '../types/lab';
import { UserCheck, Plus, Trash2, CheckCircle2, ShieldCheck } from 'lucide-react';

interface StaffSettingsModalProps {
  currentStaff: LabStaffSignatures;
  onUpdateDefaultStaff: (staff: LabStaffSignatures) => void;
}

export const StaffSettingsModal: React.FC<StaffSettingsModalProps> = ({
  currentStaff,
  onUpdateDefaultStaff
}) => {
  const [chemists, setChemists] = useState<string[]>(STAFF_OPTIONS.chemists);
  const [verifiers, setVerifiers] = useState<string[]>(STAFF_OPTIONS.verifiers);
  const [pathologists, setPathologists] = useState<string[]>(STAFF_OPTIONS.pathologists);

  const [activeChemist, setActiveChemist] = useState<string>(currentStaff.labChemist);
  const [activeVerifier, setActiveVerifier] = useState<string>(currentStaff.verifiedBy);
  const [activePathologist, setActivePathologist] = useState<string>(currentStaff.pathologist);

  const [newChemist, setNewChemist] = useState('');
  const [newVerifier, setNewVerifier] = useState('');
  const [newPathologist, setNewPathologist] = useState('');

  const [savedNotification, setSavedNotification] = useState(false);

  const handleAddChemist = () => {
    if (!newChemist.trim()) return;
    setChemists([...chemists, newChemist.trim()]);
    setActiveChemist(newChemist.trim());
    setNewChemist('');
  };

  const handleAddVerifier = () => {
    if (!newVerifier.trim()) return;
    setVerifiers([...verifiers, newVerifier.trim()]);
    setActiveVerifier(newVerifier.trim());
    setNewVerifier('');
  };

  const handleAddPathologist = () => {
    if (!newPathologist.trim()) return;
    setPathologists([...pathologists, newPathologist.trim()]);
    setActivePathologist(newPathologist.trim());
    setNewPathologist('');
  };

  const handleSaveDefaults = () => {
    onUpdateDefaultStaff({
      labChemist: activeChemist,
      verifiedBy: activeVerifier,
      pathologist: activePathologist
    });
    setSavedNotification(true);
    setTimeout(() => setSavedNotification(false), 3000);
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-red-900 to-rose-700 text-white flex items-center justify-center shadow-md">
            <UserCheck className="w-5 h-5 text-rose-300" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900">
              إدارة قوائم الإمضاءات والاعتماد المعملي
            </h2>
            <p className="text-xs text-slate-500">
              إضافة وتعديل أسماء كيميائيي المعمل، ومراجعي الجودة، واستشاريي الباثولوجيا الإكلينيكية
            </p>
          </div>
        </div>

        <button
          onClick={handleSaveDefaults}
          className="flex items-center gap-2 px-5 py-2 bg-rose-900 hover:bg-rose-800 text-white text-xs font-bold rounded-lg shadow-sm transition-all"
        >
          <CheckCircle2 className="w-4 h-4" />
          <span>حفظ التوقيعات الافتراضية</span>
        </button>
      </div>

      {savedNotification && (
        <div className="p-3 bg-emerald-50 text-emerald-900 rounded-lg text-xs font-bold border border-emerald-300 flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>تم حفظ الإمضاءات الافتراضية بنجاح واعتمادها لكافة التقارير الجديدة!</span>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* 1. Lab CHEMIST */}
        <div className="space-y-4 p-4 rounded-xl bg-slate-50 border border-slate-200">
          <div className="border-b border-slate-200 pb-2">
            <h3 className="text-sm font-bold text-slate-900">1. Lab CHEMIST</h3>
            <p className="text-[11px] text-slate-500">كيميائي المعمل وأخصائي الفحص</p>
          </div>

          <div className="space-y-2">
            <label className="block text-xs font-bold text-slate-700">الاسم المعتمد حالياً:</label>
            <select
              value={activeChemist}
              onChange={(e) => setActiveChemist(e.target.value)}
              className="w-full text-xs font-semibold bg-white border border-slate-300 rounded-lg p-2.5 text-slate-900"
            >
              {chemists.map((name, i) => (
                <option key={i} value={name}>{name}</option>
              ))}
            </select>
          </div>

          <div className="space-y-2 pt-2 border-t border-slate-200">
            <span className="text-[11px] font-bold text-slate-700">إضافة اسم جديد للقائمة:</span>
            <div className="flex gap-2">
              <input
                type="text"
                value={newChemist}
                onChange={(e) => setNewChemist(e.target.value)}
                placeholder="كيميائي / ..."
                className="flex-1 text-xs bg-white border border-slate-300 rounded-lg px-2.5 py-1.5"
              />
              <button
                type="button"
                onClick={handleAddChemist}
                className="px-3 py-1.5 bg-slate-800 text-white text-xs font-bold rounded-lg hover:bg-slate-900"
              >
                إضافة
              </button>
            </div>
          </div>
        </div>

        {/* 2. Verify by */}
        <div className="space-y-4 p-4 rounded-xl bg-slate-50 border border-slate-200">
          <div className="border-b border-slate-200 pb-2">
            <h3 className="text-sm font-bold text-slate-900">2. Verify by</h3>
            <p className="text-[11px] text-slate-500">المراجعة والتدقيق الإكلينيكي</p>
          </div>

          <div className="space-y-2">
            <label className="block text-xs font-bold text-slate-700">الاسم المعتمد حالياً:</label>
            <select
              value={activeVerifier}
              onChange={(e) => setActiveVerifier(e.target.value)}
              className="w-full text-xs font-semibold bg-white border border-slate-300 rounded-lg p-2.5 text-slate-900"
            >
              {verifiers.map((name, i) => (
                <option key={i} value={name}>{name}</option>
              ))}
            </select>
          </div>

          <div className="space-y-2 pt-2 border-t border-slate-200">
            <span className="text-[11px] font-bold text-slate-700">إضافة اسم جديد للقائمة:</span>
            <div className="flex gap-2">
              <input
                type="text"
                value={newVerifier}
                onChange={(e) => setNewVerifier(e.target.value)}
                placeholder="د. ..."
                className="flex-1 text-xs bg-white border border-slate-300 rounded-lg px-2.5 py-1.5"
              />
              <button
                type="button"
                onClick={handleAddVerifier}
                className="px-3 py-1.5 bg-slate-800 text-white text-xs font-bold rounded-lg hover:bg-slate-900"
              >
                إضافة
              </button>
            </div>
          </div>
        </div>

        {/* 3. Pathologist */}
        <div className="space-y-4 p-4 rounded-xl bg-rose-50/50 border border-rose-200">
          <div className="border-b border-rose-200 pb-2">
            <h3 className="text-sm font-bold text-rose-950">3. Pathologist</h3>
            <p className="text-[11px] text-rose-800">أطباء الباثولوجيا الإكلينيكية والكيميائية - كلية طب قصر العيني</p>
          </div>

          <div className="space-y-2">
            <label className="block text-xs font-bold text-rose-950">الاستشاري المعتمد حالياً:</label>
            <select
              value={activePathologist}
              onChange={(e) => setActivePathologist(e.target.value)}
              className="w-full text-xs font-bold bg-white border border-rose-300 rounded-lg p-2.5 text-rose-950"
            >
              {pathologists.map((name, i) => (
                <option key={i} value={name}>{name}</option>
              ))}
            </select>
          </div>

          <div className="space-y-2 pt-2 border-t border-rose-200">
            <span className="text-[11px] font-bold text-rose-950">إضافة اسم استشاري جديد:</span>
            <div className="flex gap-2">
              <input
                type="text"
                value={newPathologist}
                onChange={(e) => setNewPathologist(e.target.value)}
                placeholder="أ.د / ..."
                className="flex-1 text-xs bg-white border border-rose-300 rounded-lg px-2.5 py-1.5"
              />
              <button
                type="button"
                onClick={handleAddPathologist}
                className="px-3 py-1.5 bg-rose-900 text-white text-xs font-bold rounded-lg hover:bg-rose-800"
              >
                إضافة
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
