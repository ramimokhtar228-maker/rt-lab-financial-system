import { INITIAL_INDIVIDUAL_TESTS } from '../data/labCatalog';
import React, { useState } from 'react';
import { CatalogProfileTemplate, TestParameter, IndividualTest } from '../types/lab';
import { ParameterEditModal } from './ParameterEditModal';
import { AddParameterModal } from './AddParameterModal';
import { 
  BookOpen, 
  Search, 
  Filter, 
  Plus, 
  Edit2, 
  Trash2, 
  RotateCcw, 
  CheckCircle, 
  X, 
  Save, 
  Sparkles,
  Zap,
  Layers,
  ChevronDown,
  ChevronUp,
  FlaskConical,
  Clock,
  DollarSign,
  Tag,
  Stethoscope,
  Info
} from 'lucide-react';

interface CatalogBrowserProps {
  catalog: CatalogProfileTemplate[];
  onUpdateCatalog: (newCatalog: CatalogProfileTemplate[]) => void;
  onResetCatalog: () => void;
  onSelectProfileForNewCase: (template: CatalogProfileTemplate) => void;
  individualTests: IndividualTest[];
  onUpdateIndividualTests: (tests: IndividualTest[]) => void;
  onSelectIndividualTestForNewCase?: (test: IndividualTest) => void;
}

export const CatalogBrowser: React.FC<CatalogBrowserProps> = ({
  catalog,
  onUpdateCatalog,
  onResetCatalog,
  onSelectProfileForNewCase,
  individualTests,
  onUpdateIndividualTests,
  onSelectIndividualTestForNewCase
}) => {
  const [catalogViewMode, setCatalogViewMode] = useState<'individual' | 'profiles'>('individual');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [expandedCode, setExpandedCode] = useState<string | null>(catalog[0]?.code || null);

  // Individual test modal state
  const [isTestModalOpen, setIsTestModalOpen] = useState(false);
  const [editingTest, setEditingTest] = useState<IndividualTest | null>(null);
  const [testFormData, setTestFormData] = useState<Partial<IndividualTest>>({
    code: '',
    nameEn: '',
    nameAr: '',
    category: 'Clinical Chemistry',
    sampleType: 'Serum',
    unit: 'mg/dL',
    minNormal: 0,
    maxNormal: 100,
    textReference: '',
    method: 'Spectrophotometry',
    fastingInstructions: 'صيام 8 ساعات',
    turnaroundHours: 2,
    price: 80
  });

  // Profile modal states
  const [isNewProfileModalOpen, setIsNewProfileModalOpen] = useState(false);
  const [editingProfileCode, setEditingProfileCode] = useState<string | null>(null);
  const [activeProfileForParam, setActiveProfileForParam] = useState<string | null>(null);
  const [paramToEdit, setParamToEdit] = useState<{ profileCode: string; paramIndex: number; param: TestParameter } | null>(null);
  const [isAddParamModalOpen, setIsAddParamModalOpen] = useState(false);

  // New profile form state
  const [newProfCode, setNewProfCode] = useState('');
  const [newProfTitleEn, setNewProfTitleEn] = useState('');
  const [newProfTitleAr, setNewProfTitleAr] = useState('');
  const [newProfCategory, setNewProfCategory] = useState('Clinical Chemistry');
  const [newProfSample, setNewProfSample] = useState('Serum');
  const [newProfInterp, setNewProfInterp] = useState('');

  // Categories
  const profileCategories = ['All', ...Array.from(new Set(catalog.map(c => c.category)))];
  const testCategories = ['All', ...Array.from(new Set(individualTests.map(t => t.category)))];
  const activeCategories = catalogViewMode === 'individual' ? testCategories : profileCategories;

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
  const filteredProfiles = catalog.filter(item => {
    const matchesSearch =
      item.titleEn.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.titleAr.includes(searchTerm) ||
      item.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.parameters.some(p => p.name.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesCategory = selectedCategory === 'All' || item.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  // HANDLERS FOR INDIVIDUAL TESTS
  const handleSyncFromFinancial = () => {
    try {
      const finStr = localStorage.getItem("rt_lab_catalog_v2");
      let finItems: any[] = [];
      if (finStr) {
        finItems = JSON.parse(finStr);
      }
      if (!Array.isArray(finItems) || finItems.length === 0) {
        finItems = INITIAL_INDIVIDUAL_TESTS;
      }
      const map = new Map<string, IndividualTest>();
      individualTests.forEach(t => map.set(t.code, t));
      finItems.forEach((t: any) => {
        const existing = map.get(t.code);
        map.set(t.code, {
          ...(existing || {}),
          ...t,
          id: t.id || existing?.id || `test-${t.code}`,
          code: t.code,
          nameAr: t.nameAr,
          nameEn: t.nameEn,
          price: t.price || existing?.price || 100,
          category: t.category || existing?.category || "Clinical Chemistry",
          sampleType: t.sampleType || existing?.sampleType || "Serum",
          turnaroundTime: t.turnaroundTime || existing?.turnaroundTime || "خلال ساعتين"
        });
      });
      const merged = Array.from(map.values());
      onUpdateIndividualTests(merged);
      localStorage.setItem("rt_lab_individual_tests_v2", JSON.stringify(merged));
      alert(`تم توحيد الكتالوج بالكامل! إجمالي الفحوصات المحدثة: ${merged.length} فحص وباقة.`);
    } catch (err) {
      console.error(err);
      onUpdateIndividualTests(INITIAL_INDIVIDUAL_TESTS);
      alert("تم استعادة وتوحيد الكتالوج الشامل (165 فحص).");
    }
  };

    const handleOpenAddTest = () => {
    setEditingTest(null);
    setTestFormData({
      code: `TEST_${Math.floor(100 + Math.random() * 900)}`,
      nameEn: '',
      nameAr: '',
      category: 'Clinical Chemistry',
      sampleType: 'Serum',
      unit: 'mg/dL',
      minNormal: 0,
      maxNormal: 100,
      textReference: '',
      method: 'Enzymatic',
      fastingInstructions: 'لا يشترط الصيام',
      turnaroundHours: 2,
      price: 80
    });
    setIsTestModalOpen(true);
  };

  const handleOpenEditTest = (test: IndividualTest) => {
    setEditingTest(test);
    setTestFormData({ ...test });
    setIsTestModalOpen(true);
  };

  const handleDeleteTest = (id: string, name: string) => {
    if (confirm(`هل أنت متأكد من حذف التحليل المنفرد "${name}" من الكتالوج؟`)) {
      onUpdateIndividualTests(individualTests.filter(t => t.id !== id));
    }
  };

  const handleSaveTest = (e: React.FormEvent) => {
    e.preventDefault();
    if (!testFormData.code?.trim() || !testFormData.nameEn?.trim() || !testFormData.nameAr?.trim()) {
      alert('يرجى كتابة رمز التحليل، واسمه بالإنجليزي والعربي.');
      return;
    }

    if (editingTest) {
      const updated = individualTests.map(t => 
        t.id === editingTest.id ? { ...t, ...testFormData } as IndividualTest : t
      );
      onUpdateIndividualTests(updated);
    } else {
      const newTest: IndividualTest = {
        id: `test-${Date.now()}`,
        code: testFormData.code.trim().toUpperCase(),
        nameEn: testFormData.nameEn.trim(),
        nameAr: testFormData.nameAr.trim(),
        category: testFormData.category || 'General',
        sampleType: testFormData.sampleType || 'Serum',
        unit: testFormData.unit || '',
        minNormal: testFormData.minNormal !== undefined ? Number(testFormData.minNormal) : undefined,
        maxNormal: testFormData.maxNormal !== undefined ? Number(testFormData.maxNormal) : undefined,
        panicLow: testFormData.panicLow !== undefined ? Number(testFormData.panicLow) : undefined,
        panicHigh: testFormData.panicHigh !== undefined ? Number(testFormData.panicHigh) : undefined,
        textReference: testFormData.textReference?.trim() || undefined,
        method: testFormData.method?.trim() || undefined,
        fastingInstructions: testFormData.fastingInstructions?.trim() || 'لا يشترط الصيام',
        turnaroundHours: Number(testFormData.turnaroundHours) || 2,
        price: Number(testFormData.price) || 80
      };
      onUpdateIndividualTests([newTest, ...individualTests]);
    }

    setIsTestModalOpen(false);
  };

  // PROFILE HANDLERS
  const handleCreateProfile = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProfCode.trim() || !newProfTitleEn.trim()) {
      alert('برجاء كتابة رمز الفحص واسمه باللغة الإنجليزية');
      return;
    }

    const cleanCode = newProfCode.trim().toUpperCase();
    if (catalog.some(c => c.code === cleanCode)) {
      alert(`الرمز (${cleanCode}) موجود بالفعل في الكتالوج، يرجى اختيار رمز آخر.`);
      return;
    }

    const newTemplate: CatalogProfileTemplate = {
      code: cleanCode,
      titleEn: newProfTitleEn.trim(),
      titleAr: newProfTitleAr.trim() || newProfTitleEn.trim(),
      category: newProfCategory.trim() || 'General',
      sampleType: newProfSample.trim() || 'Serum',
      defaultInterpretation: newProfInterp.trim() || undefined,
      parameters: []
    };

    onUpdateCatalog([newTemplate, ...catalog]);
    setExpandedCode(cleanCode);
    setNewProfCode('');
    setNewProfTitleEn('');
    setNewProfTitleAr('');
    setIsNewProfileModalOpen(false);
  };

  const handleDeleteProfile = (code: string) => {
    if (confirm(`هل أنت متأكد من حذف بروفايل (${code}) وجميع عناصره من الكتالوج؟`)) {
      onUpdateCatalog(catalog.filter(c => c.code !== code));
    }
  };

  const handleDeleteParameter = (profileCode: string, paramIndex: number) => {
    if (confirm('هل أنت متأكد من حذف هذا المعيار من البروفايل؟')) {
      const updated = catalog.map(p => {
        if (p.code === profileCode) {
          const newParams = [...p.parameters];
          newParams.splice(paramIndex, 1);
          return { ...p, parameters: newParams };
        }
        return p;
      });
      onUpdateCatalog(updated);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-rose-950 to-slate-900 rounded-2xl p-6 text-white shadow-xl border border-red-900/50 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-red-600/30 text-rose-300 border border-red-500/40">
              <BookOpen className="w-5 h-5 text-rose-400" />
            </span>
            <h2 className="text-xl font-black tracking-wide">
              كتالوج التحاليل والمعدلات المرجعية والأسعار
            </h2>
          </div>
          <p className="text-xs text-rose-200/80">
            كتالوج معتمد يتيح اختيار <strong className="text-white">التحاليل المنفردة (Individual Tests)</strong> أو <strong className="text-white">بروفايلات الفحص المتكاملة</strong> مع تعديل وإضافة وحذف أي تحليل
          </p>
        </div>

        {/* View Toggle Tabs: Individual Tests vs Profiles */}
        <div className="flex items-center gap-2 bg-slate-800/90 p-1.5 rounded-xl border border-slate-700">
          <button
            onClick={() => {
              setCatalogViewMode('individual');
              setSelectedCategory('All');
            }}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold transition-all ${
              catalogViewMode === 'individual'
                ? 'bg-rose-700 text-white shadow-md'
                : 'text-slate-300 hover:text-white'
            }`}
          >
            <FlaskConical className="w-4 h-4 text-rose-300" />
            <span>التحاليل المنفردة ({individualTests.length})</span>
          </button>

          <button
            onClick={() => {
              setCatalogViewMode('profiles');
              setSelectedCategory('All');
            }}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold transition-all ${
              catalogViewMode === 'profiles'
                ? 'bg-rose-700 text-white shadow-md'
                : 'text-slate-300 hover:text-white'
            }`}
          >
            <Layers className="w-4 h-4 text-rose-300" />
            <span>بروفايلات التحاليل ({catalog.length})</span>
          </button>
        </div>
      </div>

      {/* Control Bar: Search, Category Filter, and Add Actions */}
      <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto flex-1">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder={
                catalogViewMode === 'individual'
                  ? 'بحث في التحاليل المنفردة بالاسم، الرمز، أو التخصص...'
                  : 'بحث في البروفايلات والمعايير الطبية...'
              }
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg pl-9 pr-3 py-2 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-rose-500"
            />
          </div>

          <div className="flex items-center gap-1 overflow-x-auto w-full sm:w-auto scrollbar-none py-1">
            <Filter className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            {activeCategories.slice(0, 6).map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-2.5 py-1 text-[11px] font-bold rounded-lg transition-colors whitespace-nowrap ${
                  selectedCategory === cat
                    ? 'bg-slate-900 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {cat === 'All' ? 'جميع الأقسام' : cat}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto justify-end">
          {catalogViewMode === 'individual' ? (
            <button
              onClick={handleOpenAddTest}
              className="flex items-center gap-1.5 px-4 py-2 bg-rose-900 hover:bg-rose-800 text-white text-xs font-bold rounded-lg shadow-sm transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>إضافة تحليل منفرد جديد</span>
            </button>
          ) : (
            <button
              onClick={() => setIsNewProfileModalOpen(true)}
              className="flex items-center gap-1.5 px-4 py-2 bg-rose-900 hover:bg-rose-800 text-white text-xs font-bold rounded-lg shadow-sm transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>إضافة بروفايل جديد</span>
            </button>
          )}

          <button
            onClick={onResetCatalog}
            className="p-2 text-slate-500 hover:text-rose-700 hover:bg-slate-100 rounded-lg transition-colors"
            title="استعادة المعدلات الافتراضية للكتالوج"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* VIEW 1: INDIVIDUAL TESTS (تحاليل منفردة وليست فقط البروفايل) */}
      {catalogViewMode === 'individual' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between text-xs text-slate-500 px-1">
            <span>
              عرض <strong className="text-slate-900 font-bold">{filteredIndividualTests.length}</strong> تحليل منفرد
            </span>
            <span className="text-[11px] text-rose-800 font-semibold">
              * يمكن اختيار أي تحليل منفرد والبدء به مباشرة دون الحاجة لطلب البروفايل بالكامل
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredIndividualTests.map((test) => (
              <div
                key={test.id}
                className="bg-white rounded-xl border border-slate-200 hover:border-red-400 p-4 shadow-sm hover:shadow-md transition-all flex flex-col justify-between space-y-3"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-mono font-bold text-rose-900 bg-rose-50 border border-rose-200 px-2 py-0.5 rounded">
                      {test.code}
                    </span>
                    <span className="text-[11px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200 font-mono">
                      {test.price} ج.م
                    </span>
                  </div>

                  <div>
                    <h4 className="text-sm font-black text-slate-900">
                      {test.nameAr}
                    </h4>
                    <p className="text-xs text-slate-500 font-medium" dir="ltr">
                      {test.nameEn}
                    </p>
                  </div>

                  <div className="text-[11px] text-slate-600 space-y-1 bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500">القسم:</span>
                      <strong className="text-slate-800">{test.category}</strong>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500">نوع العينة:</span>
                      <span className="text-slate-800 font-medium">{test.sampleType}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500">المعدل الطبيعي:</span>
                      <span className="font-mono text-rose-900 font-bold" dir="ltr">
                        {test.textReference || (test.minNormal !== undefined ? `${test.minNormal} - ${test.maxNormal} ${test.unit}` : '-')}
                      </span>
                    </div>
                    <div className="flex items-center justify-between pt-1 border-t border-slate-200/60">
                      <span className="text-slate-500">زمن النتيجة (TAT):</span>
                      <span className="font-mono">{test.turnaroundHours} ساعة</span>
                    </div>
                  </div>

                  {test.fastingInstructions && (
                    <div className="text-[10px] text-amber-800 bg-amber-50 p-1.5 rounded flex items-center gap-1">
                      <Clock className="w-3 h-3 text-amber-600 shrink-0" />
                      <span>{test.fastingInstructions}</span>
                    </div>
                  )}
                </div>

                <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleOpenEditTest(test)}
                      className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg"
                      title="تعديل التحليل"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDeleteTest(test.id, test.nameAr)}
                      className="p-1.5 text-rose-600 hover:text-rose-800 hover:bg-rose-50 rounded-lg"
                      title="حذف التحليل"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {onSelectIndividualTestForNewCase && (
                    <button
                      onClick={() => onSelectIndividualTestForNewCase(test)}
                      className="flex items-center gap-1 px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white text-[11px] font-bold rounded-lg transition-colors"
                    >
                      <Plus className="w-3 h-3" />
                      <span>بدء حالة بهذا الفحص</span>
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* VIEW 2: PROFILES (بروفايلات التحاليل المتكاملة) */}
      {catalogViewMode === 'profiles' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 gap-4">
            {filteredProfiles.map((template) => {
              const isExpanded = expandedCode === template.code;

              return (
                <div
                  key={template.code}
                  className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm transition-all"
                >
                  {/* Profile Header */}
                  <div
                    onClick={() => setExpandedCode(isExpanded ? null : template.code)}
                    className="p-4 flex items-center justify-between cursor-pointer hover:bg-slate-50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-rose-50 border border-rose-200 text-rose-900 flex items-center justify-center font-mono font-black text-sm">
                        {template.code}
                      </div>

                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="text-sm font-black text-slate-900">
                            {template.titleAr}
                          </h4>
                          <span className="text-xs text-slate-400 font-medium" dir="ltr">
                            ({template.titleEn})
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-[11px] text-slate-500 mt-0.5">
                          <span>{template.category}</span>
                          <span>·</span>
                          <span>{template.sampleType}</span>
                          <span>·</span>
                          <span className="text-rose-900 font-bold">{template.parameters.length} معيار قياس</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectProfileForNewCase(template);
                        }}
                        className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-lg shadow-sm"
                      >
                        بدء حالة بهذا البروفايل
                      </button>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteProfile(template.code);
                        }}
                        className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg"
                        title="حذف البروفايل"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>

                      {isExpanded ? <ChevronUp className="w-5 h-5 text-slate-400" /> : <ChevronDown className="w-5 h-5 text-slate-400" />}
                    </div>
                  </div>

                  {/* Expanded Parameters Table */}
                  {isExpanded && (
                    <div className="p-4 border-t border-slate-100 bg-slate-50/40 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-800">
                          المعايير المرجعية لبروفايل {template.titleAr}:
                        </span>

                        <button
                          onClick={() => {
                            setActiveProfileForParam(template.code);
                            setIsAddParamModalOpen(true);
                          }}
                          className="flex items-center gap-1 px-3 py-1 bg-rose-50 text-rose-900 hover:bg-rose-100 border border-rose-200 rounded-lg text-xs font-bold"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span>إضافة معيار جديد للبروفايل</span>
                        </button>
                      </div>

                      <div className="border border-slate-200 rounded-xl overflow-hidden bg-white text-xs">
                        <table className="w-full text-right">
                          <thead className="bg-slate-100/70 border-b border-slate-200 text-slate-600 font-bold text-[11px]">
                            <tr>
                              <th className="p-2.5">المعيار (Investigation)</th>
                              <th className="p-2.5">الوحدة</th>
                              <th className="p-2.5">المعدل الطبيعي</th>
                              <th className="p-2.5">القيم الحرجة (Panic)</th>
                              <th className="p-2.5">طريقة الفحص (Method)</th>
                              <th className="p-2.5 text-center">إجراءات</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100">
                            {template.parameters.map((param, pIdx) => (
                              <tr key={pIdx} className="hover:bg-slate-50/80">
                                <td className="p-2.5 font-bold text-slate-900">{param.name}</td>
                                <td className="p-2.5 font-mono text-slate-600">{param.unit || '-'}</td>
                                <td className="p-2.5 font-mono text-rose-950 font-semibold" dir="ltr">
                                  {param.textReference || (param.minNormal !== undefined ? `${param.minNormal} - ${param.maxNormal}` : '-')}
                                </td>
                                <td className="p-2.5 font-mono text-amber-800" dir="ltr">
                                  {param.panicLow || param.panicHigh ? `< ${param.panicLow || 0} / > ${param.panicHigh || 0}` : '-'}
                                </td>
                                <td className="p-2.5 text-slate-500">{param.method || '-'}</td>
                                <td className="p-2.5 text-center">
                                  <div className="flex items-center justify-center gap-1">
                                    <button
                                      onClick={() => {
                                        setParamToEdit({
                                          profileCode: template.code,
                                          paramIndex: pIdx,
                                          param: { ...param, id: `p-${pIdx}`, result: '', flag: '' }
                                        });
                                      }}
                                      className="p-1 text-slate-500 hover:text-slate-900 rounded"
                                    >
                                      <Edit2 className="w-3.5 h-3.5" />
                                    </button>
                                    <button
                                      onClick={() => handleDeleteParameter(template.code, pIdx)}
                                      className="p-1 text-rose-500 hover:text-rose-700 rounded"
                                    >
                                      <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* MODAL: ADD / EDIT INDIVIDUAL TEST */}
      {isTestModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4 text-xs">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="text-sm font-bold text-slate-900">
                {editingTest ? 'تعديل بيانات التحليل المنفرد' : 'إضافة تحليل منفرد جديد للكتالوج'}
              </h3>
              <button onClick={() => setIsTestModalOpen(false)}>
                <X className="w-5 h-5 text-slate-400" />
              </button>
            </div>

            <form onSubmit={handleSaveTest} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">اسم التحليل (عربي) *</label>
                  <input
                    type="text"
                    required
                    value={testFormData.nameAr || ''}
                    onChange={(e) => setTestFormData({ ...testFormData, nameAr: e.target.value })}
                    placeholder="مثال: سكر صائم بالدم"
                    className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg font-bold"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">اسم التحليل (English) *</label>
                  <input
                    type="text"
                    required
                    dir="ltr"
                    value={testFormData.nameEn || ''}
                    onChange={(e) => setTestFormData({ ...testFormData, nameEn: e.target.value })}
                    placeholder="e.g. Fasting Blood Sugar"
                    className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg font-bold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">كود التحليل (Code) *</label>
                  <input
                    type="text"
                    required
                    dir="ltr"
                    value={testFormData.code || ''}
                    onChange={(e) => setTestFormData({ ...testFormData, code: e.target.value })}
                    placeholder="GLU_F"
                    className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg font-mono font-bold"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">القسم / التخصص</label>
                  <input
                    type="text"
                    value={testFormData.category || ''}
                    onChange={(e) => setTestFormData({ ...testFormData, category: e.target.value })}
                    placeholder="Clinical Chemistry"
                    className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">سعر التحليل (ج.م) *</label>
                  <input
                    type="number"
                    required
                    value={testFormData.price || 0}
                    onChange={(e) => setTestFormData({ ...testFormData, price: Number(e.target.value) })}
                    className="w-full p-2 bg-rose-50 border border-rose-300 rounded-lg font-mono font-bold text-rose-950"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">الوحدة (Unit)</label>
                  <input
                    type="text"
                    dir="ltr"
                    value={testFormData.unit || ''}
                    onChange={(e) => setTestFormData({ ...testFormData, unit: e.target.value })}
                    placeholder="mg/dL, g/dL, U/L..."
                    className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg font-mono"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">الحد الأدنى الطبيعي</label>
                  <input
                    type="number"
                    step="any"
                    value={testFormData.minNormal ?? ''}
                    onChange={(e) => setTestFormData({ ...testFormData, minNormal: e.target.value ? Number(e.target.value) : undefined })}
                    className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg font-mono"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">الحد الأقصى الطبيعي</label>
                  <input
                    type="number"
                    step="any"
                    value={testFormData.maxNormal ?? ''}
                    onChange={(e) => setTestFormData({ ...testFormData, maxNormal: e.target.value ? Number(e.target.value) : undefined })}
                    className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">المعدل المرجعي النصي (للفحوصات النوعية أو المركبة)</label>
                <input
                  type="text"
                  dir="ltr"
                  value={testFormData.textReference || ''}
                  onChange={(e) => setTestFormData({ ...testFormData, textReference: e.target.value })}
                  placeholder="e.g. Negative, Non-Reactive, or 70 - 100 mg/dL"
                  className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg font-mono"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">نوع العينة المطلوبة</label>
                  <input
                    type="text"
                    value={testFormData.sampleType || 'Serum'}
                    onChange={(e) => setTestFormData({ ...testFormData, sampleType: e.target.value })}
                    placeholder="Serum, EDTA Whole Blood, Urine..."
                    className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">تعليمات الصيام والتحضير</label>
                  <input
                    type="text"
                    value={testFormData.fastingInstructions || ''}
                    onChange={(e) => setTestFormData({ ...testFormData, fastingInstructions: e.target.value })}
                    placeholder="صيام 8-10 ساعات أو لا يشترط"
                    className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t">
                <button
                  type="button"
                  onClick={() => setIsTestModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-lg"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-rose-900 hover:bg-rose-800 text-white font-bold rounded-lg shadow-sm"
                >
                  {editingTest ? 'حفظ التعديلات' : 'إضافة التحليل'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: ADD PROFILE */}
      {isNewProfileModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4 text-xs">
            <h3 className="text-sm font-bold text-slate-900 border-b pb-2">
              إضافة بروفايل تحاليل جديد
            </h3>
            <form onSubmit={handleCreateProfile} className="space-y-3">
              <div>
                <label className="block font-bold text-slate-700 mb-1">رمز البروفايل (Code) *</label>
                <input
                  type="text"
                  required
                  dir="ltr"
                  value={newProfCode}
                  onChange={(e) => setNewProfCode(e.target.value)}
                  placeholder="LFT, KFT, THYROID..."
                  className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg font-mono font-bold"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">اسم البروفايل (عربي) *</label>
                <input
                  type="text"
                  required
                  value={newProfTitleAr}
                  onChange={(e) => setNewProfTitleAr(e.target.value)}
                  placeholder="مثال: وظائف كبد كاملة"
                  className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg font-bold"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">اسم البروفايل (English) *</label>
                <input
                  type="text"
                  required
                  dir="ltr"
                  value={newProfTitleEn}
                  onChange={(e) => setNewProfTitleEn(e.target.value)}
                  placeholder="e.g. Liver Function Tests (LFT)"
                  className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg font-bold"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">القسم</label>
                  <input
                    type="text"
                    value={newProfCategory}
                    onChange={(e) => setNewProfCategory(e.target.value)}
                    className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">نوع العينة</label>
                  <input
                    type="text"
                    value={newProfSample}
                    onChange={(e) => setNewProfSample(e.target.value)}
                    className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t">
                <button
                  type="button"
                  onClick={() => setIsNewProfileModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-lg"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-rose-900 hover:bg-rose-800 text-white font-bold rounded-lg shadow-sm"
                >
                  إنشاء البروفايل
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* PARAMETER EDIT MODAL */}
      {paramToEdit && (
        <ParameterEditModal
          isOpen={true}
          parameter={paramToEdit.param}
          onSave={(updated) => {
            const updatedCatalog = catalog.map(p => {
              if (p.code === paramToEdit.profileCode) {
                const newParams = [...p.parameters];
                newParams[paramToEdit.paramIndex] = {
                  ...newParams[paramToEdit.paramIndex],
                  ...updated,
                  name: updated.name || newParams[paramToEdit.paramIndex].name
                };
                return { ...p, parameters: newParams };
              }
              return p;
            });
            onUpdateCatalog(updatedCatalog);
            setParamToEdit(null);
          }}
          onClose={() => setParamToEdit(null)}
        />
      )}

      {/* ADD PARAMETER MODAL */}
      {isAddParamModalOpen && activeProfileForParam && (
        <AddParameterModal
          isOpen={true}
          onAdd={(newParam) => {
            const updatedCatalog = catalog.map(p => {
              if (p.code === activeProfileForParam) {
                return { ...p, parameters: [...p.parameters, newParam] };
              }
              return p;
            });
            onUpdateCatalog(updatedCatalog);
            setIsAddParamModalOpen(false);
            setActiveProfileForParam(null);
          }}
          onClose={() => {
            setIsAddParamModalOpen(false);
            setActiveProfileForParam(null);
          }}
        />
      )}
    </div>
  );
};
