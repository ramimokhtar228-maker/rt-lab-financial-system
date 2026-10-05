import React, { useState } from 'react';
import { ComprehensivePackage, CatalogProfileTemplate, IndividualTest } from '../types/lab';
import { 
  Package, 
  Plus, 
  Search, 
  Edit3, 
  Trash2, 
  CheckCircle, 
  Clock, 
  Sparkles, 
  Tag, 
  DollarSign, 
  Users, 
  FileText, 
  Check, 
  ArrowLeft,
  X,
  AlertCircle
} from 'lucide-react';

interface PackagesManagerProps {
  packages: ComprehensivePackage[];
  onUpdatePackages: (updated: ComprehensivePackage[]) => void;
  onApplyPackageToReport?: (pkg: ComprehensivePackage) => void;
  catalogProfiles: CatalogProfileTemplate[];
  individualTests: IndividualTest[];
}

export const PackagesManager: React.FC<PackagesManagerProps> = ({
  packages,
  onUpdatePackages,
  onApplyPackageToReport,
  catalogProfiles,
  individualTests
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterPopular, setFilterPopular] = useState<boolean | null>(null);
  
  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPackage, setEditingPackage] = useState<ComprehensivePackage | null>(null);

  // Form states
  const [formData, setFormData] = useState<Partial<ComprehensivePackage>>({
    code: '',
    titleAr: '',
    titleEn: '',
    descriptionAr: '',
    targetAudience: '',
    includedProfiles: [],
    includedIndividualTestCodes: [],
    originalPrice: 1000,
    packagePrice: 650,
    discountPercentage: 35,
    fastingRequired: 'صيام من 10 إلى 12 ساعة (يُسمح بشرب الماء فقط)',
    sampleTypes: ['Serum', 'EDTA Whole Blood'],
    isPopular: false
  });

  const filteredPackages = packages.filter(pkg => {
    const matchesSearch = 
      pkg.titleAr.includes(searchTerm) ||
      pkg.titleEn.toLowerCase().includes(searchTerm.toLowerCase()) ||
      pkg.descriptionAr.includes(searchTerm) ||
      pkg.code.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesPopular = filterPopular === null || pkg.isPopular === filterPopular;

    return matchesSearch && matchesPopular;
  });

  const handleOpenAddModal = () => {
    setEditingPackage(null);
    const codeNum = Math.floor(100 + Math.random() * 900);
    setFormData({
      code: `PKG-CUSTOM-${codeNum}`,
      titleAr: '',
      titleEn: '',
      descriptionAr: '',
      targetAudience: 'لجميع الفئات العمرية',
      includedProfiles: ['CBC', 'GLYCEMIC'],
      includedIndividualTestCodes: ['VIT_D', 'CREAT'],
      originalPrice: 900,
      packagePrice: 550,
      discountPercentage: 39,
      fastingRequired: 'صيام 8-10 ساعات',
      sampleTypes: ['Serum', 'EDTA Whole Blood'],
      isPopular: false
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (pkg: ComprehensivePackage) => {
    setEditingPackage(pkg);
    setFormData({ ...pkg });
    setIsModalOpen(true);
  };

  const handleDeletePackage = (id: string, title: string) => {
    if (confirm(`هل أنت متأكد من حذف باقة "${title}"؟`)) {
      const updated = packages.filter(p => p.id !== id);
      onUpdatePackages(updated);
    }
  };

  const handleSavePackage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.titleAr?.trim() || !formData.code?.trim()) {
      alert('يرجى ملء اسم الباقة بالعربية وكود الباقة.');
      return;
    }

    const orig = Number(formData.originalPrice) || 0;
    const pkgP = Number(formData.packagePrice) || 0;
    const discount = orig > 0 ? Math.round(((orig - pkgP) / orig) * 100) : 0;

    if (editingPackage) {
      // Update
      const updated = packages.map(p => 
        p.id === editingPackage.id 
          ? {
              ...p,
              ...formData,
              id: editingPackage.id,
              originalPrice: orig,
              packagePrice: pkgP,
              discountPercentage: discount
            } as ComprehensivePackage
          : p
      );
      onUpdatePackages(updated);
    } else {
      // Create new
      const newPkg: ComprehensivePackage = {
        id: `pkg-${Date.now()}`,
        code: formData.code?.trim().toUpperCase() || `PKG-${Date.now()}`,
        titleAr: formData.titleAr.trim(),
        titleEn: formData.titleEn?.trim() || formData.titleAr.trim(),
        descriptionAr: formData.descriptionAr?.trim() || '',
        targetAudience: formData.targetAudience?.trim() || 'عام',
        includedProfiles: formData.includedProfiles || [],
        includedIndividualTestCodes: formData.includedIndividualTestCodes || [],
        originalPrice: orig,
        packagePrice: pkgP,
        discountPercentage: discount,
        fastingRequired: formData.fastingRequired?.trim() || 'صيام 8-10 ساعات',
        sampleTypes: formData.sampleTypes || ['Serum'],
        isPopular: !!formData.isPopular
      };
      onUpdatePackages([newPkg, ...packages]);
    }

    setIsModalOpen(false);
  };

  const toggleProfileInForm = (code: string) => {
    const current = formData.includedProfiles || [];
    if (current.includes(code)) {
      setFormData({ ...formData, includedProfiles: current.filter(c => c !== code) });
    } else {
      setFormData({ ...formData, includedProfiles: [...current, code] });
    }
  };

  const toggleTestInForm = (code: string) => {
    const current = formData.includedIndividualTestCodes || [];
    if (current.includes(code)) {
      setFormData({ ...formData, includedIndividualTestCodes: current.filter(c => c !== code) });
    } else {
      setFormData({ ...formData, includedIndividualTestCodes: [...current, code] });
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-rose-950 to-slate-900 rounded-2xl p-6 text-white shadow-xl border border-red-900/50 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-red-600/30 text-rose-300 border border-red-500/40">
              <Package className="w-5 h-5 text-rose-400" />
            </span>
            <h2 className="text-xl font-black tracking-wide">باقات الفحص الشامل الجاهزة والتنفيذية</h2>
          </div>
          <p className="text-xs text-rose-200/80">
            باقات فحص طبي جاهزة وقابلة للتعديل والإضافة والحذف مع حساب التخفيض، شروط التحضير، وتطبيقها المباشر على الحالات
          </p>
        </div>

        <button
          onClick={handleOpenAddModal}
          className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-red-700 to-rose-600 hover:from-red-600 hover:to-rose-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-red-950/40 hover:shadow-xl transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>إضافة باقة فحص جديدة</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-96">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="بحث في أسماء الباقات، الوصف، أو الرمز..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg pl-9 pr-3 py-2 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-rose-500"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <button
            onClick={() => setFilterPopular(null)}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors ${
              filterPopular === null ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            جميع الباقات ({packages.length})
          </button>
          <button
            onClick={() => setFilterPopular(true)}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors flex items-center gap-1 ${
              filterPopular === true ? 'bg-rose-700 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>الأكثر طلباً</span>
          </button>
        </div>
      </div>

      {/* Packages Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredPackages.map((pkg) => {
          const savings = pkg.originalPrice - pkg.packagePrice;

          return (
            <div
              key={pkg.id}
              className="bg-white rounded-2xl border border-slate-200 hover:border-red-400/60 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between overflow-hidden relative group"
            >
              {/* Popular ribbon */}
              {pkg.isPopular && (
                <div className="absolute top-3 left-3 bg-gradient-to-r from-amber-500 to-rose-600 text-white text-[10px] font-black px-2.5 py-0.5 rounded-full shadow-sm flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-amber-200" />
                  <span>الأكثر طلباً</span>
                </div>
              )}

              <div className="p-5 space-y-4">
                {/* Header */}
                <div>
                  <div className="flex items-center gap-2 text-rose-800 text-[11px] font-bold">
                    <span className="font-mono">{pkg.code}</span>
                    <span>·</span>
                    <span>{pkg.sampleTypes.join(' + ')}</span>
                  </div>
                  <h3 className="text-base font-black text-slate-900 mt-1 line-clamp-1">
                    {pkg.titleAr}
                  </h3>
                  <p className="text-xs text-slate-500 font-medium line-clamp-1" dir="ltr">
                    {pkg.titleEn}
                  </p>
                </div>

                {/* Description */}
                <p className="text-xs text-slate-600 leading-relaxed bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                  {pkg.descriptionAr}
                </p>

                {/* Target Audience */}
                <div className="flex items-center gap-1.5 text-xs text-slate-700">
                  <Users className="w-3.5 h-3.5 text-rose-700 shrink-0" />
                  <span className="font-semibold text-[11px]">الفئة المستهدفة:</span>
                  <span className="text-[11px] text-slate-600 truncate">{pkg.targetAudience}</span>
                </div>

                {/* Fasting Instructions */}
                <div className="flex items-start gap-1.5 text-xs text-amber-800 bg-amber-50/70 p-2 rounded-lg border border-amber-200/50">
                  <Clock className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
                  <span className="text-[11px] font-medium leading-snug">{pkg.fastingRequired}</span>
                </div>

                {/* Included Tests Summary */}
                <div className="space-y-1.5">
                  <span className="text-[11px] font-bold text-slate-800 block">
                    التحاليل والبروفايلات المشمولة بالباقة:
                  </span>
                  <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto scrollbar-thin">
                    {pkg.includedProfiles.map(code => (
                      <span key={code} className="text-[10px] font-bold bg-rose-50 text-rose-900 border border-rose-200 px-2 py-0.5 rounded-md">
                        بروفايل {code}
                      </span>
                    ))}
                    {pkg.includedIndividualTestCodes.map(code => (
                      <span key={code} className="text-[10px] font-semibold bg-slate-100 text-slate-700 border border-slate-200 px-2 py-0.5 rounded-md">
                        {code}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Pricing Box */}
                <div className="pt-3 border-t border-slate-100 flex items-baseline justify-between">
                  <div>
                    <span className="text-[10px] text-slate-400 line-through font-mono ml-2">
                      {pkg.originalPrice} ج.م
                    </span>
                    <span className="text-xl font-black text-rose-900 font-mono">
                      {pkg.packagePrice}
                    </span>
                    <span className="text-xs font-bold text-slate-700 mr-1">جنيه مصري</span>
                  </div>

                  <span className="text-[11px] font-black text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                    وفر {savings} ج.م ({pkg.discountPercentage}%)
                  </span>
                </div>
              </div>

              {/* Actions Footer */}
              <div className="bg-slate-50 border-t border-slate-100 p-3 flex items-center justify-between gap-2">
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleOpenEditModal(pkg)}
                    className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-200 rounded-lg transition-colors"
                    title="تعديل الباقة"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDeletePackage(pkg.id, pkg.titleAr)}
                    className="p-1.5 text-rose-600 hover:text-rose-800 hover:bg-rose-50 rounded-lg transition-colors"
                    title="حذف الباقة"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                {onApplyPackageToReport && (
                  <button
                    onClick={() => onApplyPackageToReport(pkg)}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-rose-900 hover:bg-rose-800 text-white text-xs font-bold rounded-lg shadow-sm transition-all"
                  >
                    <CheckCircle className="w-3.5 h-3.5" />
                    <span>تطبيق الباقة على المريض</span>
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal: Add / Edit Package */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl border border-slate-200 space-y-5 my-8">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Package className="w-5 h-5 text-rose-700" />
                <h3 className="text-base font-bold text-slate-900">
                  {editingPackage ? 'تعديل باقة فحص شامل' : 'إضافة باقة فحص شامل جديدة'}
                </h3>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSavePackage} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">اسم الباقة (عربي) *</label>
                  <input
                    type="text"
                    required
                    value={formData.titleAr || ''}
                    onChange={(e) => setFormData({ ...formData, titleAr: e.target.value })}
                    placeholder="مثال: باقة الفحص الدوري السنوي"
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg font-semibold"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">اسم الباقة (English)</label>
                  <input
                    type="text"
                    dir="ltr"
                    value={formData.titleEn || ''}
                    onChange={(e) => setFormData({ ...formData, titleEn: e.target.value })}
                    placeholder="e.g. Comprehensive Annual Wellness"
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg font-semibold"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">كود الباقة (Code) *</label>
                  <input
                    type="text"
                    required
                    dir="ltr"
                    value={formData.code || ''}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                    placeholder="PKG-WELLNESS"
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg font-mono font-bold"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">الفئة المستهدفة</label>
                  <input
                    type="text"
                    value={formData.targetAudience || ''}
                    onChange={(e) => setFormData({ ...formData, targetAudience: e.target.value })}
                    placeholder="للرجال فوق سن 35، السيدات، كبار السن..."
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">السعر الأصلي المنفرد (ج.م)</label>
                  <input
                    type="number"
                    value={formData.originalPrice || 0}
                    onChange={(e) => setFormData({ ...formData, originalPrice: Number(e.target.value) })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg font-mono font-bold"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">سعر العرض للباقة (ج.م) *</label>
                  <input
                    type="number"
                    required
                    value={formData.packagePrice || 0}
                    onChange={(e) => setFormData({ ...formData, packagePrice: Number(e.target.value) })}
                    className="w-full p-2.5 bg-rose-50 border border-rose-300 rounded-lg font-mono font-bold text-rose-950 text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">وصف الباقة ومزاياها</label>
                <textarea
                  rows={2}
                  value={formData.descriptionAr || ''}
                  onChange={(e) => setFormData({ ...formData, descriptionAr: e.target.value })}
                  placeholder="وصف مختصر لأهمية الباقة والاطمئنان الصحي..."
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">شروط الصيام والتحضير</label>
                <input
                  type="text"
                  value={formData.fastingRequired || ''}
                  onChange={(e) => setFormData({ ...formData, fastingRequired: e.target.value })}
                  placeholder="صيام 10 إلى 12 ساعة مع شرب الماء فقط"
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg"
                />
              </div>

              {/* Profiles Checklist */}
              <div className="space-y-1.5 pt-2 border-t border-slate-100">
                <span className="block font-bold text-slate-800">
                  اختيار بروفايلات التحاليل المشمولة بالباقة:
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-36 overflow-y-auto p-2 bg-slate-50 rounded-lg border border-slate-200">
                  {catalogProfiles.map((p) => {
                    const isChecked = (formData.includedProfiles || []).includes(p.code);
                    return (
                      <label key={p.code} className="flex items-center gap-2 cursor-pointer p-1 rounded hover:bg-white text-[11px]">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => toggleProfileInForm(p.code)}
                          className="rounded text-rose-700 focus:ring-rose-500"
                        />
                        <span className="font-bold text-slate-800">{p.code}</span>
                        <span className="text-slate-500 truncate">({p.titleAr})</span>
                      </label>
                    );
                  })}
                </div>
              </div>

              {/* Standalone Tests Checklist */}
              <div className="space-y-1.5 pt-2 border-t border-slate-100">
                <span className="block font-bold text-slate-800">
                  اختيار تحاليل منفردة إضافية مشمولة بالباقة:
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-36 overflow-y-auto p-2 bg-slate-50 rounded-lg border border-slate-200">
                  {individualTests.map((t) => {
                    const isChecked = (formData.includedIndividualTestCodes || []).includes(t.code);
                    return (
                      <label key={t.code} className="flex items-center gap-2 cursor-pointer p-1 rounded hover:bg-white text-[11px]">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => toggleTestInForm(t.code)}
                          className="rounded text-rose-700 focus:ring-rose-500"
                        />
                        <span className="font-bold text-slate-800">{t.code}</span>
                        <span className="text-slate-500 truncate">({t.nameAr})</span>
                      </label>
                    );
                  })}
                </div>
              </div>

              {/* Popular Toggle */}
              <div className="pt-2 flex items-center gap-2">
                <input
                  type="checkbox"
                  id="popularCheck"
                  checked={!!formData.isPopular}
                  onChange={(e) => setFormData({ ...formData, isPopular: e.target.checked })}
                  className="rounded text-rose-700"
                />
                <label htmlFor="popularCheck" className="font-bold text-slate-700 cursor-pointer">
                  تمييز هذه الباقة بـ "الأكثر طلباً" في شاشة الباقات
                </label>
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-lg"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-rose-900 hover:bg-rose-800 text-white font-bold rounded-lg shadow-sm"
                >
                  {editingPackage ? 'حفظ التعديلات' : 'إضافة الباقة'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
