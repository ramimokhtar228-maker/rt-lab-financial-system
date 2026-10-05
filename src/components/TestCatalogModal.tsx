import React, { useState } from 'react';
import { LAB_CATALOG, INITIAL_INDIVIDUAL_TESTS, INITIAL_PACKAGES } from '../data/labCatalog';
import { CatalogProfileTemplate, TestProfile, TestParameter, IndividualTest, ComprehensivePackage } from '../types/lab';
import { Search, Plus, Check, X, BookOpen, Layers, FlaskConical, Package, Clock, Sparkles } from 'lucide-react';

interface TestCatalogModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddProfile: (profile: TestProfile) => void;
  existingProfileCodes: string[];
  catalog?: CatalogProfileTemplate[];
  individualTests?: IndividualTest[];
  packages?: ComprehensivePackage[];
  onAddIndividualTest?: (test: IndividualTest) => void;
  onApplyPackage?: (pkg: ComprehensivePackage) => void;
}

export const TestCatalogModal: React.FC<TestCatalogModalProps> = ({
  isOpen,
  onClose,
  onAddProfile,
  existingProfileCodes,
  catalog = LAB_CATALOG,
  individualTests = INITIAL_INDIVIDUAL_TESTS,
  packages = INITIAL_PACKAGES,
  onAddIndividualTest,
  onApplyPackage
}) => {
  const [activeTab, setActiveTab] = useState<'individual' | 'profiles' | 'packages'>('individual');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [addedItems, setAddedItems] = useState<string[]>([]);

  if (!isOpen) return null;

  const activeCatalog = catalog.length > 0 ? catalog : LAB_CATALOG;

  // Categories
  const profileCats = ['All', ...Array.from(new Set(activeCatalog.map(c => c.category)))];
  const testCats = ['All', ...Array.from(new Set(individualTests.map(t => t.category)))];
  const currentCategories = activeTab === 'individual' ? testCats : profileCats;

  // Filter individual tests
  const filteredIndividualTests = individualTests.filter(t => {
    const matchesSearch = 
      t.nameAr.includes(searchTerm) ||
      t.nameEn.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.category.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCat = selectedCategory === 'All' || t.category === selectedCategory;
    return matchesSearch && matchesCat;
  });

  // Filter profiles
  const filteredProfiles = activeCatalog.filter(item => {
    const matchesSearch =
      item.titleEn.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.titleAr.includes(searchTerm) ||
      item.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.parameters.some(p => p.name.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCategory = selectedCategory === 'All' || item.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  // Filter packages
  const filteredPackages = packages.filter(p => 
    p.titleAr.includes(searchTerm) ||
    p.titleEn.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAddProfile = (template: CatalogProfileTemplate) => {
    const newProfile: TestProfile = {
      id: `prof-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      profileCode: template.code,
      titleEn: template.titleEn,
      titleAr: template.titleAr,
      category: template.category,
      sampleType: template.sampleType,
      interpretation: template.defaultInterpretation || '',
      parameters: template.parameters.map((p, idx) => ({
        ...p,
        id: `param-${Date.now()}-${idx}`,
        result: '',
        flag: ''
      }))
    };

    onAddProfile(newProfile);
    setAddedItems(prev => [...prev, template.code]);
  };

  const handleAddSingleTest = (test: IndividualTest) => {
    if (onAddIndividualTest) {
      onAddIndividualTest(test);
    } else {
      // Fallback: create a standalone test profile
      const newProfile: TestProfile = {
        id: `prof-indiv-${Date.now()}`,
        profileCode: 'INDIVIDUAL',
        titleEn: 'Individual Diagnostic Investigations',
        titleAr: 'تحاليل منفردة ومحددة',
        category: test.category,
        sampleType: test.sampleType,
        parameters: [
          {
            id: `param-${Date.now()}`,
            name: `${test.nameAr} (${test.nameEn})`,
            result: '',
            unit: test.unit,
            minNormal: test.minNormal,
            maxNormal: test.maxNormal,
            panicLow: test.panicLow,
            panicHigh: test.panicHigh,
            textReference: test.textReference,
            method: test.method,
            flag: ''
          }
        ]
      };
      onAddProfile(newProfile);
    }
    setAddedItems(prev => [...prev, test.code]);
  };

  const handleApplyPackageDirectly = (pkg: ComprehensivePackage) => {
    if (onApplyPackage) {
      onApplyPackage(pkg);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-4xl w-full h-[85vh] shadow-2xl flex flex-col overflow-hidden border border-slate-200">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-200 flex items-center justify-between bg-slate-900 text-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-red-800 to-rose-700 flex items-center justify-center shadow-md">
              <BookOpen className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-base font-bold">
                إضافة فحوصات وتحاليل لتقرير المريض
              </h3>
              <p className="text-xs text-rose-200/80">
                اختر تحاليل منفردة، بروفايلات متكاملة، أو باقات فحص شامل جاهزة
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="bg-slate-100 p-2 border-b border-slate-200 flex items-center gap-2">
          <button
            onClick={() => {
              setActiveTab('individual');
              setSelectedCategory('All');
            }}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'individual'
                ? 'bg-rose-900 text-white shadow-sm'
                : 'text-slate-700 hover:bg-white'
            }`}
          >
            <FlaskConical className="w-4 h-4" />
            <span>التحاليل المنفرِدة ({individualTests.length})</span>
          </button>

          <button
            onClick={() => {
              setActiveTab('profiles');
              setSelectedCategory('All');
            }}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'profiles'
                ? 'bg-rose-900 text-white shadow-sm'
                : 'text-slate-700 hover:bg-white'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>بروفايلات التحاليل ({activeCatalog.length})</span>
          </button>

          <button
            onClick={() => {
              setActiveTab('packages');
              setSelectedCategory('All');
            }}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'packages'
                ? 'bg-rose-900 text-white shadow-sm'
                : 'text-slate-700 hover:bg-white'
            }`}
          >
            <Package className="w-4 h-4" />
            <span>باقات الفحص الشامل ({packages.length})</span>
          </button>
        </div>

        {/* Filter and Search Bar */}
        <div className="p-4 bg-slate-50 border-b border-slate-200 flex flex-col sm:flex-row items-center gap-3">
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="بحث بالاسم العربي أو الإنجليزي أو الكود..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full text-xs bg-white border border-slate-300 rounded-lg pl-9 pr-3 py-2 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-rose-500"
            />
          </div>

          {activeTab !== 'packages' && (
            <div className="flex items-center gap-1 overflow-x-auto w-full sm:w-auto scrollbar-none py-1">
              {currentCategories.slice(0, 5).map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-2.5 py-1 text-[11px] font-bold rounded-lg transition-colors whitespace-nowrap ${
                    selectedCategory === cat
                      ? 'bg-slate-900 text-white'
                      : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  {cat === 'All' ? 'الكل' : cat}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6">
          {/* TAB 1: INDIVIDUAL TESTS */}
          {activeTab === 'individual' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {filteredIndividualTests.map((t) => {
                const wasAdded = addedItems.includes(t.code);

                return (
                  <div
                    key={t.id}
                    className="p-3 bg-white rounded-xl border border-slate-200 hover:border-red-400 shadow-xs flex flex-col justify-between space-y-2"
                  >
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-mono font-bold text-rose-900 bg-rose-50 px-2 py-0.5 rounded">
                          {t.code}
                        </span>
                        <span className="text-xs font-mono font-bold text-emerald-800">
                          {t.price} ج.م
                        </span>
                      </div>
                      <h4 className="text-xs font-bold text-slate-900 mt-1 line-clamp-1">
                        {t.nameAr}
                      </h4>
                      <p className="text-[11px] text-slate-500 truncate" dir="ltr">
                        {t.nameEn}
                      </p>
                      <div className="text-[10px] text-slate-500 mt-1 font-mono">
                        المعدل: {t.textReference || (t.minNormal !== undefined ? `${t.minNormal} - ${t.maxNormal} ${t.unit}` : '-')}
                      </div>
                    </div>

                    <button
                      onClick={() => handleAddSingleTest(t)}
                      className={`w-full py-1.5 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                        wasAdded
                          ? 'bg-emerald-50 text-emerald-800 border border-emerald-300'
                          : 'bg-rose-900 hover:bg-rose-800 text-white shadow-xs'
                      }`}
                    >
                      {wasAdded ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-600" />
                          <span>تمت الإضافة للتقرير</span>
                        </>
                      ) : (
                        <>
                          <Plus className="w-3.5 h-3.5" />
                          <span>إضافة هذا التحليل</span>
                        </>
                      )}
                    </button>
                  </div>
                );
              })}
            </div>
          )}

          {/* TAB 2: PROFILES */}
          {activeTab === 'profiles' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {filteredProfiles.map((template) => {
                const isAlreadyInReport = existingProfileCodes.includes(template.code);
                const wasAdded = addedItems.includes(template.code);

                return (
                  <div
                    key={template.code}
                    className="p-4 bg-white rounded-xl border border-slate-200 hover:border-red-400 shadow-xs flex flex-col justify-between space-y-3"
                  >
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-mono font-bold text-rose-900 bg-rose-50 px-2 py-0.5 rounded">
                          {template.code}
                        </span>
                        <span className="text-[11px] text-slate-500 font-semibold">
                          {template.parameters.length} معيار
                        </span>
                      </div>
                      <h4 className="text-sm font-bold text-slate-900 mt-1">
                        {template.titleAr}
                      </h4>
                      <p className="text-xs text-slate-500" dir="ltr">
                        {template.titleEn}
                      </p>
                      <p className="text-[11px] text-slate-600 mt-1">
                        العينة: <strong>{template.sampleType}</strong>
                      </p>
                    </div>

                    <button
                      onClick={() => handleAddProfile(template)}
                      disabled={isAlreadyInReport || wasAdded}
                      className={`w-full py-2 px-4 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                        isAlreadyInReport || wasAdded
                          ? 'bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200'
                          : 'bg-rose-900 hover:bg-rose-800 text-white shadow-xs'
                      }`}
                    >
                      {isAlreadyInReport || wasAdded ? (
                        <>
                          <Check className="w-4 h-4 text-emerald-600" />
                          <span>مضاف مسبقاً للتقرير</span>
                        </>
                      ) : (
                        <>
                          <Plus className="w-4 h-4" />
                          <span>إضافة البروفايل بالكامل</span>
                        </>
                      )}
                    </button>
                  </div>
                );
              })}
            </div>
          )}

          {/* TAB 3: COMPREHENSIVE PACKAGES */}
          {activeTab === 'packages' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {filteredPackages.map((pkg) => (
                <div
                  key={pkg.id}
                  className="p-4 bg-white rounded-xl border border-slate-200 hover:border-red-400 shadow-xs flex flex-col justify-between space-y-3"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-mono font-bold text-rose-900 bg-rose-50 px-2 py-0.5 rounded">
                        {pkg.code}
                      </span>
                      <span className="text-xs font-black text-rose-950 font-mono">
                        {pkg.packagePrice} ج.م (وفر {pkg.discountPercentage}%)
                      </span>
                    </div>

                    <h4 className="text-sm font-black text-slate-900">
                      {pkg.titleAr}
                    </h4>
                    <p className="text-xs text-slate-500" dir="ltr">
                      {pkg.titleEn}
                    </p>
                    <p className="text-xs text-slate-600 line-clamp-2 bg-slate-50 p-2 rounded">
                      {pkg.descriptionAr}
                    </p>
                  </div>

                  <button
                    onClick={() => handleApplyPackageDirectly(pkg)}
                    className="w-full py-2 px-4 bg-gradient-to-r from-red-800 to-rose-700 hover:from-red-700 hover:to-rose-600 text-white text-xs font-bold rounded-lg shadow-sm transition-all flex items-center justify-center gap-1.5"
                  >
                    <Package className="w-4 h-4" />
                    <span>تطبيق هذه الباقة بالكامل على المريض</span>
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
          <span>معامل RT - التشخيص الصحيح يبدأ معنا</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold rounded-lg"
          >
            إغلاق
          </button>
        </div>
      </div>
    </div>
  );
};
