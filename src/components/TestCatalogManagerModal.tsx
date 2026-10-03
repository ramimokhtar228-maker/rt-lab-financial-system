import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { InvoiceTestItem } from '../types';
import {
  FlaskConical,
  Search,
  Plus,
  Edit2,
  Trash2,
  RotateCcw,
  Download,
  Upload,
  Check,
  X,
  Clock,
  Tag,
  DollarSign
} from 'lucide-react';

interface TestCatalogManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const TestCatalogManagerModal: React.FC<TestCatalogManagerModalProps> = ({ isOpen, onClose }) => {
  const { testCatalog, addCatalogTest, updateCatalogTest, deleteCatalogTest, resetCatalog, language } = useApp();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [editingCode, setEditingCode] = useState<string | null>(null);

  // Edit form state
  const [editPrice, setEditPrice] = useState<number>(0);
  const [editCost, setEditCost] = useState<number>(0);
  const [editNameAr, setEditNameAr] = useState<string>('');
  const [editNameEn, setEditNameEn] = useState<string>('');

  // Add new test modal state
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [newCode, setNewCode] = useState('');
  const [newNameAr, setNewNameAr] = useState('');
  const [newNameEn, setNewNameEn] = useState('');
  const [newCategory, setNewCategory] = useState('Clinical Chemistry');
  const [newPrice, setNewPrice] = useState<number>(100);
  const [newCost, setNewCost] = useState<number>(25);
  const [newSampleType, setNewSampleType] = useState('Serum');
  const [newTurnaround, setNewTurnaround] = useState('ساعتين');

  const categories = useMemo(() => {
    const set = new Set(testCatalog.map(t => t.category));
    return Array.from(set).sort();
  }, [testCatalog]);

  const filteredTests = useMemo(() => {
    return testCatalog.filter(test => {
      if (selectedCategory !== 'all' && test.category !== selectedCategory) return false;
      if (searchTerm) {
        const term = searchTerm.toLowerCase();
        return (
          test.code.toLowerCase().includes(term) ||
          test.nameAr.toLowerCase().includes(term) ||
          test.nameEn.toLowerCase().includes(term) ||
          test.category.toLowerCase().includes(term)
        );
      }
      return true;
    });
  }, [testCatalog, selectedCategory, searchTerm]);

  const startEditing = (test: InvoiceTestItem) => {
    setEditingCode(test.code);
    setEditPrice(test.price);
    setEditCost(test.cost || Math.round(test.price * 0.25));
    setEditNameAr(test.nameAr);
    setEditNameEn(test.nameEn);
  };

  const saveEdit = (code: string) => {
    updateCatalogTest(code, {
      nameAr: editNameAr.trim(),
      nameEn: editNameEn.trim(),
      price: Number(editPrice),
      cost: Number(editCost)
    });
    setEditingCode(null);
  };

  const handleCreateTest = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCode.trim() || !newNameAr.trim()) return;

    const testItem: InvoiceTestItem = {
      id: `test-custom-${Date.now()}`,
      code: newCode.trim().toUpperCase(),
      nameAr: newNameAr.trim(),
      nameEn: newNameEn.trim() || newNameAr.trim(),
      category: newCategory,
      price: Number(newPrice) || 0,
      cost: Number(newCost) || 0,
      sampleType: newSampleType,
      turnaroundTime: newTurnaround
    };

    addCatalogTest(testItem);
    setIsAddingNew(false);
    // Reset form
    setNewCode('');
    setNewNameAr('');
    setNewNameEn('');
    setNewPrice(100);
    setNewCost(25);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div className="bg-white rounded-2xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden text-xs">
        {/* Header */}
        <div className="p-4 sm:p-5 bg-gradient-to-r from-slate-950 via-[#4c0519] to-[#0f172a] text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-rose-950/80 rounded-xl border border-rose-500/40">
              <FlaskConical className="w-5 h-5 text-rose-400" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black text-white flex items-center gap-2">
                <span>إدارة وتحديث كتالوج الفحوصات والأسعار (165+ فحص طبي)</span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-900 border border-rose-600 text-rose-200">
                  معامل RT
                </span>
              </h2>
              <p className="text-[11px] text-rose-200/80 mt-0.5">
                إضافة تحاليل جديدة، تحديث وتعديل الأسعار والتكاليف، وحفظ التعديلات فورياً في قاعدة البيانات
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsAddingNew(true)}
              className="flex items-center gap-1.5 px-3 py-2 bg-gradient-to-r from-rose-700 to-red-600 hover:from-rose-600 hover:to-red-500 text-white font-extrabold rounded-lg shadow-sm transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>إضافة فحص جديد</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Toolbar & Filters */}
        <div className="p-4 border-b border-slate-100 bg-slate-50 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute right-3 top-2.5 pointer-events-none" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="بحث باسم التحليل، الكود، أو القسم..."
              className="w-full pr-9 pl-3 py-2 bg-white border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-rose-500 focus:outline-none"
            />
          </div>

          <div className="flex items-center gap-2">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold focus:ring-2 focus:ring-rose-500 focus:outline-none"
            >
              <option value="all">كافة الأقسام الطبية ({testCatalog.length})</option>
              {categories.map(c => (
                <option key={c} value={c}>
                  {c} ({testCatalog.filter(t => t.category === c).length})
                </option>
              ))}
            </select>

            <button
              onClick={() => {
                if (window.confirm('هل تريد بالتأكيد إعادة ضبط الكتالوج إلى القائمة الافتراضية الشاملة لمعامل RT (165 فحص)؟')) {
                  resetCatalog();
                }
              }}
              className="flex items-center gap-1 px-3 py-2 bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 font-bold rounded-xl transition-colors"
              title="إعادة ضبط القائمة الافتراضية"
            >
              <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
              <span className="hidden sm:inline">إعادة ضبط</span>
            </button>
          </div>
        </div>

        {/* Tests Table */}
        <div className="flex-1 overflow-y-auto p-4">
          <table className="w-full text-right border-collapse">
            <thead>
              <tr className="border-b border-slate-200 text-slate-400 text-[11px] font-bold">
                <th className="pb-2 pr-3">الكود</th>
                <th className="pb-2">اسم الفحص الطبي (عربي / إنجليزي)</th>
                <th className="pb-2">القسم الطبي</th>
                <th className="pb-2 text-center">سعر الفاتورة (ج.م)</th>
                <th className="pb-2 text-center">التكلفة (ج.م)</th>
                <th className="pb-2 text-center">نوع العينة</th>
                <th className="pb-2 pl-3 text-center">إجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredTests.map((test) => {
                const isEditing = editingCode === test.code;
                return (
                  <tr key={test.code} className="hover:bg-slate-50/80 transition-colors">
                    {/* Code */}
                    <td className="py-2.5 pr-3 font-mono font-bold text-slate-900">
                      <span className="px-2 py-0.5 rounded bg-slate-100 border border-slate-200 text-[10px]">
                        {test.code}
                      </span>
                    </td>

                    {/* Name */}
                    <td className="py-2.5">
                      {isEditing ? (
                        <div className="space-y-1">
                          <input
                            type="text"
                            value={editNameAr}
                            onChange={(e) => setEditNameAr(e.target.value)}
                            className="w-full p-1 bg-white border border-rose-400 rounded text-xs font-bold"
                          />
                          <input
                            type="text"
                            value={editNameEn}
                            onChange={(e) => setEditNameEn(e.target.value)}
                            className="w-full p-1 bg-white border border-slate-300 rounded text-[11px] font-mono"
                          />
                        </div>
                      ) : (
                        <div>
                          <div className="font-extrabold text-slate-900">{test.nameAr}</div>
                          <div className="text-[10px] text-slate-400 font-mono">{test.nameEn}</div>
                        </div>
                      )}
                    </td>

                    {/* Category */}
                    <td className="py-2.5">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-900 border border-blue-200">
                        {test.category}
                      </span>
                    </td>

                    {/* Price */}
                    <td className="py-2.5 text-center font-mono font-black text-rose-900">
                      {isEditing ? (
                        <input
                          type="number"
                          min="0"
                          value={editPrice}
                          onChange={(e) => setEditPrice(parseFloat(e.target.value) || 0)}
                          className="w-20 p-1 text-center bg-white border border-rose-400 rounded font-mono font-bold"
                        />
                      ) : (
                        <span>{test.price} ج.م</span>
                      )}
                    </td>

                    {/* Cost */}
                    <td className="py-2.5 text-center font-mono text-slate-500">
                      {isEditing ? (
                        <input
                          type="number"
                          min="0"
                          value={editCost}
                          onChange={(e) => setEditCost(parseFloat(e.target.value) || 0)}
                          className="w-16 p-1 text-center bg-white border border-slate-300 rounded font-mono"
                        />
                      ) : (
                        <span>{test.cost || '—'} ج.م</span>
                      )}
                    </td>

                    {/* Sample Type & TAT */}
                    <td className="py-2.5 text-center text-[10px] text-slate-500">
                      <div>{test.sampleType || 'مصل / دم'}</div>
                      <div className="text-[9px] text-slate-400">{test.turnaroundTime || 'ساعتين'}</div>
                    </td>

                    {/* Actions */}
                    <td className="py-2.5 pl-3 text-center">
                      {isEditing ? (
                        <div className="flex items-center justify-center gap-1">
                          <button
                            onClick={() => saveEdit(test.code)}
                            className="p-1 rounded bg-emerald-600 text-white hover:bg-emerald-700"
                            title="حفظ التعديل"
                          >
                            <Check className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => setEditingCode(null)}
                            className="p-1 rounded bg-slate-200 text-slate-700 hover:bg-slate-300"
                            title="إلغاء"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center justify-center gap-1">
                          <button
                            onClick={() => startEditing(test)}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-rose-900 hover:bg-rose-50 transition-colors"
                            title="تعديل السعر أو الاسم"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => {
                              if (window.confirm(`هل أنت متأكد من حذف فحص "${test.nameAr}" من الكتالوج؟`)) {
                                deleteCatalogTest(test.code);
                              }
                            }}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                            title="حذف من الكتالوج"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-slate-500 text-[11px]">
          <div>
            إجمالي الفحوصات الطبية المعروضة: <strong>{filteredTests.length}</strong> من أصل <strong>{testCatalog.length}</strong>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl transition-colors"
          >
            إغلاق
          </button>
        </div>
      </div>

      {/* Modal: Add New Test */}
      {isAddingNew && (
        <div className="fixed inset-0 z-60 bg-black/70 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl border border-slate-200 text-xs">
            <div className="flex items-center justify-between border-b pb-2">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Plus className="w-4 h-4 text-rose-700" />
                إضافة فحص طبي جديد لكتالوج معامل RT
              </h3>
              <button onClick={() => setIsAddingNew(false)} className="text-slate-400 hover:text-slate-600">✕</button>
            </div>

            <form onSubmit={handleCreateTest} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">كود الفحص المختصر *</label>
                  <input
                    type="text"
                    required
                    value={newCode}
                    onChange={(e) => setNewCode(e.target.value)}
                    placeholder="مثال: VIT_D_TOTAL"
                    className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg font-mono font-bold uppercase"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">القسم الطبي *</label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg font-semibold"
                  >
                    <option value="Hematology">Hematology (أمراض الدم)</option>
                    <option value="Clinical Chemistry">Clinical Chemistry (كيمياء حيوية)</option>
                    <option value="Kidney Function">Kidney Function (وظائف كلى)</option>
                    <option value="Liver Function">Liver Function (وظائف كبد)</option>
                    <option value="Diabetes">Diabetes (سكر وتمثيل غذائي)</option>
                    <option value="Lipids">Lipids (دهون الدم)</option>
                    <option value="Endocrinology">Endocrinology (غدد صماء)</option>
                    <option value="Hormones">Hormones (هرمونات وخصوبة)</option>
                    <option value="Tumor Markers">Tumor Markers (دلالات أورام)</option>
                    <option value="Immunology">Immunology (مناعة وروماتيزم)</option>
                    <option value="Infectious">Infectious (فيروسات وأمراض معدية)</option>
                    <option value="Clinical Microscopy">Clinical Microscopy (ميكروسكوب وبول وبراز)</option>
                    <option value="Microbiology">Microbiology (مزارع وميكروبيولوجي)</option>
                    <option value="Molecular">Molecular (بي سي آر وبيولوجيا جزيئية)</option>
                    <option value="Vitamins">Vitamins (فيتامينات ومعادن)</option>
                    <option value="Cardiac">Cardiac (إنزيمات القلب)</option>
                    <option value="Packages">Packages (باقات فحص شامل)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">اسم التحليل باللغة العربية *</label>
                <input
                  type="text"
                  required
                  value={newNameAr}
                  onChange={(e) => setNewNameAr(e.target.value)}
                  placeholder="مثال: فيتامين د الكلي النشط"
                  className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg font-bold"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">اسم التحليل باللغة الإنجليزية</label>
                <input
                  type="text"
                  value={newNameEn}
                  onChange={(e) => setNewNameEn(e.target.value)}
                  placeholder="Example: Total 25-OH Vitamin D"
                  className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg font-mono"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">سعر الفاتورة للمريض (ج.م) *</label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={newPrice}
                    onChange={(e) => setNewPrice(parseFloat(e.target.value) || 0)}
                    className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg font-mono font-bold text-rose-900"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">التكلفة التقريبية للكاشف (ج.م)</label>
                  <input
                    type="number"
                    min="0"
                    value={newCost}
                    onChange={(e) => setNewCost(parseFloat(e.target.value) || 0)}
                    className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">نوع العينة المطلوبة</label>
                  <input
                    type="text"
                    value={newSampleType}
                    onChange={(e) => setNewSampleType(e.target.value)}
                    placeholder="مصل / بلازما / دم كامل..."
                    className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">زمن خروج النتيجة</label>
                  <input
                    type="text"
                    value={newTurnaround}
                    onChange={(e) => setNewTurnaround(e.target.value)}
                    placeholder="ساعتين / نفس اليوم / 24 ساعة..."
                    className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t">
                <button
                  type="button"
                  onClick={() => setIsAddingNew(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-lg"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-gradient-to-r from-rose-800 to-red-700 hover:from-rose-700 hover:to-red-600 text-white font-extrabold rounded-lg shadow-sm"
                >
                  إضافة وحفظ في الكتالوج
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
