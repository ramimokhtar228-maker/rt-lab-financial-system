import React, { useState, useEffect, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import {
  UserPlus,
  Search,
  Plus,
  Trash2,
  Check,
  CreditCard,
  Gift,
  Printer,
  Barcode,
  Sparkles,
  Phone,
  User,
  Calendar,
  Clock,
  DollarSign,
  AlertCircle,
  CheckCircle2,
  Package,
  Layers,
  FlaskConical,
  MessageCircle
} from 'lucide-react';
import { Patient, InvoiceTestItem, PaymentMethod } from '../types';
import { TEST_CATALOG } from '../data/catalog';
import { INITIAL_PACKAGES } from '../data/packagesData';
import { formatBookingConfirmationWhatsAppMessage, openWhatsApp } from '../utils/whatsapp';

interface AdmissionModuleProps {
  onSuccess?: () => void;
  isModal?: boolean;
}

export const AdmissionModule: React.FC<AdmissionModuleProps> = ({ onSuccess, isModal = false }) => {
  const {
    createReportFromAdmission,
    earnLoyaltyPoints,
    redeemLoyaltyPoints,
    getLoyaltyByPhone,
    loyaltyConfig,
    calculateLoyaltyTier,
    currentUser,
    reports,
    setActiveTab,
    setSelectedReportId,
    setIsPatientFormOpen
  } = useApp();

  const today = new Date().toISOString().split('T')[0];
  const nextLabNumber = `RT-2026-${String(reports.length + 1).padStart(3, '0')}`;
  const nextBarcode = `RT-${10030 + reports.length + 1}`;

  // Form State
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [age, setAge] = useState<number>(30);
  const [ageUnit, setAgeUnit] = useState<Patient['ageUnit']>('years');
  const [gender, setGender] = useState<Patient['gender']>('male');
  const [nationalId, setNationalId] = useState('');
  const [referringDoctor, setReferringDoctor] = useState('أطباء كلية طب قصر العيني');
  const [clinicalHistory, setClinicalHistory] = useState('');
  const [fastingHours, setFastingHours] = useState<number>(0);
  const [bookingType, setBookingType] = useState<'branch' | 'home_visit'>('branch');
  const [homeAddress, setHomeAddress] = useState('');
  const [homeVisitFee, setHomeVisitFee] = useState<number>(80);

  // Selected Tests & Packages
  const [selectedTests, setSelectedTests] = useState<InvoiceTestItem[]>([
    TEST_CATALOG.find(t => t.code === 'CBC') || {
      id: 't-cbc',
      code: 'CBC',
      nameAr: 'صورة الدم الكاملة (CBC 5-Diff)',
      nameEn: 'Complete Blood Count',
      price: 280,
      category: 'Hematology',
      cost: 45
    }
  ]);
  const [selectedPackageId, setSelectedPackageId] = useState<string>('');

  // Payment State
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('cash');
  const [paidAmount, setPaidAmount] = useState<number>(0);
  const [discountPercent, setDiscountPercent] = useState<number>(0);
  const [redeemPoints, setRedeemPoints] = useState<boolean>(false);
  const [testSearch, setTestSearch] = useState('');
  const [showCatalogPicker, setShowCatalogPicker] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [createdLabNum, setCreatedLabNum] = useState<string>('');

  // Loyalty check by phone
  const loyaltyProfile = useMemo(() => {
    return getLoyaltyByPhone(phone);
  }, [phone, getLoyaltyByPhone]);

  // Auto apply loyalty discount if profile found
  useEffect(() => {
    if (loyaltyProfile && discountPercent === 0) {
      const tierDiscount = loyaltyConfig.tiers[loyaltyProfile.tier].discountRate;
      setDiscountPercent(tierDiscount);
    }
  }, [loyaltyProfile, loyaltyConfig, discountPercent]);

  // Calculations
  const testsSubtotal = selectedTests.reduce((sum, t) => sum + t.price, 0);
  const effectiveVisitFee = bookingType === 'home_visit' ? homeVisitFee : 0;
  const grossSubtotal = testsSubtotal + effectiveVisitFee;
  const percentageDiscountAmount = Math.round((testsSubtotal * discountPercent) / 100);

  // Points redemption value
  const pointsRedeemValue = useMemo(() => {
    if (!redeemPoints || !loyaltyProfile || loyaltyProfile.totalPoints < 100) return 0;
    const maxRedeemable100s = Math.floor(loyaltyProfile.totalPoints / 100);
    return maxRedeemable100s * loyaltyConfig.egpPer100Points;
  }, [redeemPoints, loyaltyProfile, loyaltyConfig]);

  const totalDiscount = percentageDiscountAmount + pointsRedeemValue;
  const netTotal = Math.max(0, grossSubtotal - totalDiscount);

  // Auto set paid amount to netTotal
  useEffect(() => {
    setPaidAmount(netTotal);
  }, [netTotal]);

  const remainingAmount = Math.max(0, netTotal - paidAmount);

  // Add/Remove Tests
  const handleAddTest = (test: InvoiceTestItem) => {
    if (!selectedTests.some(t => t.code === test.code)) {
      setSelectedTests(prev => [...prev, test]);
    }
  };

  const handleRemoveTest = (code: string) => {
    setSelectedTests(prev => prev.filter(t => t.code !== code));
  };

  // Add Package
  const handleSelectPackage = (pkgId: string) => {
    setSelectedPackageId(pkgId);
    const pkg = INITIAL_PACKAGES.find(p => p.id === pkgId);
    if (!pkg) return;

    // Map package tests
    const pkgTests: InvoiceTestItem[] = [];
    pkg.includedProfiles.forEach(code => {
      const found = TEST_CATALOG.find(t => t.code.toLowerCase() === code.toLowerCase());
      if (found && !pkgTests.some(t => t.code === found.code)) {
        pkgTests.push(found);
      }
    });

    if (pkgTests.length > 0) {
      setSelectedTests(pkgTests);
      setDiscountPercent(pkg.discountPercentage);
    }
  };

  // Submit Admission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim()) {
      alert("يرجى إدخال اسم المريض بالكامل.");
      return;
    }
    if (selectedTests.length === 0) {
      alert("يرجى اختيار تحليل واحد على الأقل للمريض.");
      return;
    }

    const patientRecord: Patient = {
      id: `pat-${Date.now()}`,
      labNumber: nextLabNumber,
      barcode: nextBarcode,
      fullName: fullName.trim(),
      phone: phone.trim(),
      age: Number(age) || 30,
      ageUnit,
      gender,
      nationalId: nationalId.trim() || undefined,
      referringDoctorTitle: "Dr.",
      referringDoctorName: referringDoctor.trim(),
      sampleDate: today,
      reportingDate: today,
      clinicalHistory: clinicalHistory.trim() || undefined,
      fastingHours: Number(fastingHours) || 0,
      bookingType,
      homeAddress: bookingType === 'home_visit' ? homeAddress : undefined,
      visitFee: effectiveVisitFee,
      testsSubtotal,
      totalCost: netTotal,
      discountApplied: totalDiscount,
      paymentMethod: (paymentMethod as any) || 'cash'
    };

    // Create Report & Invoice via AppContext
    const createdReport = createReportFromAdmission(
      patientRecord,
      selectedTests,
      selectedPackageId ? INITIAL_PACKAGES.find(p => p.id === selectedPackageId) : undefined
    );

    // Apply loyalty points redemption or earning
    if (phone.trim()) {
      if (redeemPoints && pointsRedeemValue > 0) {
        redeemLoyaltyPoints(phone.trim(), Math.floor(loyaltyProfile!.totalPoints / 100) * 100, createdReport.reportNumber, pointsRedeemValue);
      }
      earnLoyaltyPoints(phone.trim(), paidAmount, createdReport.reportNumber, fullName.trim(), nextBarcode);
    }

    setCreatedLabNum(createdReport.reportNumber);
    setIsSubmitted(true);

    if (onSuccess) {
      onSuccess();
    }
  };

  const handleSendWhatsApp = () => {
    const text = formatBookingConfirmationWhatsAppMessage({
      patientName: fullName,
      labNumber: nextLabNumber,
      date: today,
      time: 'صباحاً',
      isHomeVisit: bookingType === 'home_visit',
      address: homeAddress,
      testsList: selectedTests.map(t => t.nameAr).join('، '),
      subtotal: testsSubtotal,
      discountAmount: totalDiscount,
      discountLabel: `${discountPercent}%`,
      netAmount: netTotal,
      paymentMethod
    });
    openWhatsApp(phone, text);
  };

  const filteredCatalog = TEST_CATALOG.filter(t =>
    t.nameAr.toLowerCase().includes(testSearch.toLowerCase()) ||
    t.nameEn.toLowerCase().includes(testSearch.toLowerCase()) ||
    t.code.toLowerCase().includes(testSearch.toLowerCase()) ||
    t.category.toLowerCase().includes(testSearch.toLowerCase())
  );

  if (isSubmitted) {
    return (
      <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-xl text-center space-y-6 max-w-2xl mx-auto my-6 animate-in zoom-in-95">
        <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-inner">
          <CheckCircle2 className="w-10 h-10" />
        </div>

        <div className="space-y-2">
          <h2 className="text-2xl font-black text-slate-900">تم تسجيل المريض وحجز التحاليل بنجاح!</h2>
          <p className="text-slate-500 text-sm">
            تم إصدار الفاتورة وإدراج العينة في قائمة عمل المعمل برقم: <strong className="text-rose-900 font-mono text-base">{createdLabNum}</strong>
          </p>
        </div>

        <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 text-xs text-right space-y-2 font-medium">
          <div className="flex justify-between">
            <span className="text-slate-500">اسم المريض:</span>
            <strong className="text-slate-800">{fullName}</strong>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">باركود العينة:</span>
            <strong className="font-mono text-rose-900">{nextBarcode}</strong>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">الصافي المطلوب:</span>
            <strong className="font-mono text-emerald-700">{netTotal} ج.م (المدفوع: {paidAmount} ج.م)</strong>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">نقاط الولاء المكتسبة:</span>
            <strong className="font-mono text-amber-700">+{Math.floor(paidAmount * loyaltyConfig.pointsPerEGP)} نقطة</strong>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-3">
          {phone && (
            <button
              onClick={handleSendWhatsApp}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md transition-colors cursor-pointer"
            >
              <MessageCircle className="w-4 h-4" />
              <span>إرسال تأكيد الحجز بالواتساب</span>
            </button>
          )}

          <button
            onClick={() => {
              setActiveTab('diagnostic_editor');
              if (isModal) setIsPatientFormOpen(false);
            }}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-rose-900 hover:bg-rose-800 text-white font-bold text-xs shadow-md transition-colors cursor-pointer"
          >
            <FlaskConical className="w-4 h-4" />
            <span>الانتقال لإدخال النتائج الطبية</span>
          </button>

          <button
            onClick={() => {
              setIsSubmitted(false);
              setFullName('');
              setPhone('');
              setNationalId('');
              setClinicalHistory('');
              setSelectedTests([]);
              if (isModal) setIsPatientFormOpen(false);
            }}
            className="px-4 py-2.5 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold text-xs transition-colors cursor-pointer"
          >
            تسجيل مريض آخر
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${isModal ? 'p-1' : ''}`}>
      {/* Header */}
      {!isModal && (
        <div className="bg-gradient-to-r from-slate-900 via-rose-950 to-slate-900 text-white rounded-2xl p-6 shadow-xl border border-rose-900/40">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-rose-600/30 rounded-xl border border-rose-500/40 text-rose-300">
                  <UserPlus className="w-7 h-7" />
                </div>
                <div>
                  <h1 className="text-2xl font-black tracking-tight">تسجيل مريض جديد وحجز التحاليل والفوترة</h1>
                  <p className="text-slate-300 text-xs sm:text-sm font-medium">
                    تسجيل شامل يربط ملف المريض مباشرة بالخزينة المالية، وقائمة عمل المعمل، ونظام كروت ونقاط الولاء
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-slate-800/80 px-4 py-2.5 rounded-xl border border-slate-700 text-left font-mono">
              <span className="text-[10px] text-slate-400 block">رقم المعمل المقترح:</span>
              <span className="font-bold text-rose-300 text-sm">{nextLabNumber}</span>
            </div>
          </div>
        </div>
      )}

      {/* Main Form */}
      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Demographics & Test Selector (Col 7) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Card 1: Patient Demographics */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
              <User className="w-5 h-5 text-rose-700" />
              <h2 className="font-black text-slate-800 text-base">البيانات الشخصية والطبية للمريض</h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  الاسم الرباعي للمريض: <span className="text-rose-600">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="مثال: محمد السيد إبراهيم الشناوي"
                  className="w-full text-xs font-semibold bg-slate-50 border border-slate-200 rounded-xl p-2.5 focus:ring-2 focus:ring-rose-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  رقم الهاتف / الواتساب:
                </label>
                <div className="relative">
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="010XXXXXXXX"
                    className="w-full text-xs font-mono font-bold bg-slate-50 border border-slate-200 rounded-xl p-2.5 focus:ring-2 focus:ring-rose-500 focus:outline-none text-left"
                    dir="ltr"
                  />
                  <Phone className="w-4 h-4 text-slate-400 absolute right-3 top-2.5" />
                </div>
                {loyaltyProfile && (
                  <div className="mt-1 flex items-center gap-1.5 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-lg border border-emerald-200">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>مشترك في نادي الولاء: كارت {loyaltyProfile.tier} ({loyaltyProfile.totalPoints} نقطة)</span>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  الرقم القومي (اختياري):
                </label>
                <input
                  type="text"
                  value={nationalId}
                  onChange={(e) => setNationalId(e.target.value)}
                  placeholder="14 رقماً"
                  maxLength={14}
                  className="w-full text-xs font-mono bg-slate-50 border border-slate-200 rounded-xl p-2.5 focus:ring-2 focus:ring-rose-500 focus:outline-none text-left"
                  dir="ltr"
                />
              </div>

              <div className="flex gap-2">
                <div className="flex-1">
                  <label className="block text-xs font-bold text-slate-700 mb-1">السن:</label>
                  <input
                    type="number"
                    min={0}
                    max={120}
                    value={age}
                    onChange={(e) => setAge(Number(e.target.value))}
                    className="w-full text-xs font-mono font-bold bg-slate-50 border border-slate-200 rounded-xl p-2.5 focus:ring-2 focus:ring-rose-500 focus:outline-none"
                  />
                </div>
                <div className="w-24">
                  <label className="block text-xs font-bold text-slate-700 mb-1">الوحدة:</label>
                  <select
                    value={ageUnit}
                    onChange={(e) => setAgeUnit(e.target.value as any)}
                    className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl p-2.5 focus:ring-2 focus:ring-rose-500 focus:outline-none"
                  >
                    <option value="years">سنة</option>
                    <option value="months">شهر</option>
                    <option value="days">يوم</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">الجنس:</label>
                <select
                  value={gender}
                  onChange={(e) => setGender(e.target.value as any)}
                  className="w-full text-xs font-bold bg-slate-50 border border-slate-200 rounded-xl p-2.5 focus:ring-2 focus:ring-rose-500 focus:outline-none"
                >
                  <option value="male">ذكر (Male)</option>
                  <option value="female">أنثى (Female)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">الطبيب المعالج / المحول:</label>
                <input
                  type="text"
                  value={referringDoctor}
                  onChange={(e) => setReferringDoctor(e.target.value)}
                  placeholder="مثال: أ.د. رامي مختار أو عيادات خارجية"
                  className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl p-2.5 focus:ring-2 focus:ring-rose-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">ساعات الصيام:</label>
                <input
                  type="number"
                  min={0}
                  max={24}
                  value={fastingHours}
                  onChange={(e) => setFastingHours(Number(e.target.value))}
                  placeholder="0 إذا غير صائم"
                  className="w-full text-xs font-mono bg-slate-50 border border-slate-200 rounded-xl p-2.5 focus:ring-2 focus:ring-rose-500 focus:outline-none"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-slate-700 mb-1">التاريخ المرضي / ملاحظات الطبيب:</label>
                <input
                  type="text"
                  value={clinicalHistory}
                  onChange={(e) => setClinicalHistory(e.target.value)}
                  placeholder="مثال: مريض سكر وضغط، يعاني من إجهاد وشحوب..."
                  className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl p-2.5 focus:ring-2 focus:ring-rose-500 focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Card 2: Tests & Packages Selection */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <FlaskConical className="w-5 h-5 text-rose-700" />
                <h2 className="font-black text-slate-800 text-base">التحاليل والباقات المطلوبة</h2>
              </div>

              <button
                type="button"
                onClick={() => setShowCatalogPicker(prev => !prev)}
                className="text-xs font-bold text-rose-900 bg-rose-50 hover:bg-rose-100 px-3 py-1.5 rounded-xl border border-rose-200 transition-colors cursor-pointer"
              >
                {showCatalogPicker ? 'إخفاء دليل التحاليل' : '+ إضافة تحليل من الكتالوج'}
              </button>
            </div>

            {/* Quick Packages Shortcuts */}
            <div className="space-y-1.5">
              <span className="text-[11px] font-bold text-slate-500 block">اختيار باقة فحص شاملة سريعة:</span>
              <div className="flex flex-wrap gap-2">
                {INITIAL_PACKAGES.slice(0, 5).map(pkg => (
                  <button
                    key={pkg.id}
                    type="button"
                    onClick={() => handleSelectPackage(pkg.id)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      selectedPackageId === pkg.id
                        ? 'bg-rose-900 text-white shadow-sm'
                        : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                    }`}
                  >
                    <span>{pkg.titleAr}</span>
                    <span className="font-mono text-[10px] mr-1 opacity-80">({pkg.packagePrice} ج.م)</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Test Catalog Search & Picker Dropdown */}
            {showCatalogPicker && (
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
                <div className="relative">
                  <Search className="w-4 h-4 text-slate-400 absolute right-3 top-3" />
                  <input
                    type="text"
                    value={testSearch}
                    onChange={(e) => setTestSearch(e.target.value)}
                    placeholder="ابحث بالاسم العربي، الإنجليزي أو كود التحليل (مثال: CBC, سكر, ALT)..."
                    className="w-full text-xs pr-9 pl-3 py-2 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-500"
                  />
                </div>

                <div className="max-h-48 overflow-y-auto divide-y divide-slate-100 bg-white rounded-xl border border-slate-200">
                  {filteredCatalog.slice(0, 15).map(test => {
                    const isSelected = selectedTests.some(t => t.code === test.code);
                    return (
                      <div
                        key={test.id}
                        onClick={() => handleAddTest(test)}
                        className={`p-2.5 flex items-center justify-between text-xs cursor-pointer hover:bg-rose-50 transition-colors ${
                          isSelected ? 'bg-rose-50/60 font-bold text-rose-900' : 'text-slate-800'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-slate-500">{test.code}</span>
                          <span>{test.nameAr}</span>
                          <span className="text-[10px] text-slate-400">({test.nameEn})</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="font-mono font-bold text-emerald-700">{test.price} ج.م</span>
                          {isSelected ? (
                            <Check className="w-4 h-4 text-rose-700" />
                          ) : (
                            <Plus className="w-4 h-4 text-slate-400" />
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Selected Tests List */}
            <div className="space-y-2">
              <span className="text-[11px] font-bold text-slate-500 block">
                التحاليل المختارة حالياً ({selectedTests.length}):
              </span>

              {selectedTests.length === 0 ? (
                <div className="text-center py-6 text-xs text-slate-400 border border-dashed border-slate-200 rounded-xl">
                  لم يتم اختيار أي تحاليل بعد. اضغط على الباقات أو زر الكتالوج لإضافة تحاليل.
                </div>
              ) : (
                <div className="space-y-1.5 max-h-56 overflow-y-auto pr-1">
                  {selectedTests.map(test => (
                    <div
                      key={test.code}
                      className="p-2.5 rounded-xl border border-slate-200 bg-slate-50/80 flex items-center justify-between text-xs"
                    >
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold px-1.5 py-0.5 rounded bg-slate-200 text-slate-800 text-[10px]">
                          {test.code}
                        </span>
                        <span className="font-bold text-slate-800">{test.nameAr}</span>
                        <span className="text-[10px] text-slate-500">({test.nameEn})</span>
                      </div>

                      <div className="flex items-center gap-3">
                        <span className="font-mono font-bold text-slate-900">{test.price} ج.م</span>
                        <button
                          type="button"
                          onClick={() => handleRemoveTest(test.code)}
                          className="text-slate-400 hover:text-red-600 transition-colors p-1"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Financial Billing & Loyalty Cards (Col 5) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-5 sticky top-28">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
              <CreditCard className="w-5 h-5 text-emerald-700" />
              <h2 className="font-black text-slate-800 text-base">الفوترة والخزينة ونقاط الولاء</h2>
            </div>

            {/* Booking Type: Branch or Home Visit */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-700">نوع الحجز والمقر:</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setBookingType('branch')}
                  className={`py-2 px-3 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                    bookingType === 'branch'
                      ? 'bg-rose-900 text-white border-rose-900 shadow-sm'
                      : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  فحص بالمعمل
                </button>
                <button
                  type="button"
                  onClick={() => setBookingType('home_visit')}
                  className={`py-2 px-3 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                    bookingType === 'home_visit'
                      ? 'bg-rose-900 text-white border-rose-900 shadow-sm'
                      : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  زيارة منزلية (+ رسوم)
                </button>
              </div>

              {bookingType === 'home_visit' && (
                <div className="p-3 bg-rose-50/70 border border-rose-200 rounded-xl space-y-2 text-xs">
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">عنوان الزيارة المنزلية:</label>
                    <input
                      type="text"
                      value={homeAddress}
                      onChange={(e) => setHomeAddress(e.target.value)}
                      placeholder="رقم العقار، الشارع، المنطقة، الدور، الشقة"
                      className="w-full bg-white border border-rose-200 rounded-lg p-2 text-xs"
                    />
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-600">رسوم الانتقال والتمريض:</span>
                    <input
                      type="number"
                      value={homeVisitFee}
                      onChange={(e) => setHomeVisitFee(Number(e.target.value))}
                      className="w-20 font-mono font-bold bg-white border border-rose-200 rounded-lg p-1 text-center"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Loyalty Card Discount Section */}
            <div className="p-4 bg-gradient-to-br from-amber-500/10 via-amber-500/5 to-transparent border border-amber-300 rounded-2xl space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-bold text-xs text-amber-950 flex items-center gap-1.5">
                  <Gift className="w-4 h-4 text-amber-700" />
                  <span>كارت ونقاط الولاء (RT Club)</span>
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-200 text-amber-900 font-mono">
                  {loyaltyProfile ? `كارت ${loyaltyProfile.tier}` : 'عضو جديد'}
                </span>
              </div>

              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-600">نسبة الخصم المطبقة:</span>
                <div className="flex items-center gap-1">
                  <input
                    type="number"
                    min={0}
                    max={100}
                    value={discountPercent}
                    onChange={(e) => setDiscountPercent(Number(e.target.value))}
                    className="w-16 font-mono font-bold bg-white border border-slate-200 rounded-lg p-1 text-center text-xs"
                  />
                  <span className="font-bold text-slate-700">%</span>
                </div>
              </div>

              {loyaltyProfile && loyaltyProfile.totalPoints >= 100 && (
                <div className="flex items-center justify-between text-xs pt-1 border-t border-amber-200">
                  <div className="space-y-0.5">
                    <span className="text-slate-700 font-bold block">استبدال رصيد النقاط:</span>
                    <span className="text-[10px] text-slate-500 block">
                      لديه {loyaltyProfile.totalPoints} نقطة = خصم نقدي {Math.floor(loyaltyProfile.totalPoints / 100) * loyaltyConfig.egpPer100Points} ج.م
                    </span>
                  </div>
                  <input
                    type="checkbox"
                    checked={redeemPoints}
                    onChange={(e) => setRedeemPoints(e.target.checked)}
                    className="w-4 h-4 text-rose-600 rounded cursor-pointer"
                  />
                </div>
              )}
            </div>

            {/* Financial Summary */}
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-500">إجمالي التحاليل:</span>
                <span className="font-mono font-bold text-slate-800">{testsSubtotal} ج.م</span>
              </div>

              {effectiveVisitFee > 0 && (
                <div className="flex justify-between">
                  <span className="text-slate-500">رسوم الزيارة المنزلية:</span>
                  <span className="font-mono font-bold text-slate-800">+{effectiveVisitFee} ج.م</span>
                </div>
              )}

              {totalDiscount > 0 && (
                <div className="flex justify-between text-rose-700">
                  <span>إجمالي الخصم الممنوح:</span>
                  <span className="font-mono font-bold">-{totalDiscount} ج.م</span>
                </div>
              )}

              <div className="pt-2 border-t border-slate-200 flex justify-between items-baseline text-sm">
                <span className="font-black text-slate-900">الصافي المطلوب سداده:</span>
                <span className="font-mono font-black text-emerald-800 text-lg">{netTotal} ج.م</span>
              </div>
            </div>

            {/* Payment Method & Paid Amount */}
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">طريقة السداد:</label>
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value as any)}
                  className="w-full text-xs font-bold bg-slate-50 border border-slate-200 rounded-xl p-2.5 focus:ring-2 focus:ring-rose-500 focus:outline-none"
                >
                  <option value="cash">نقداً (Cash بالخزينة)</option>
                  <option value="visa">بطاقة ائتمان / فيزا (Visa POS)</option>
                  <option value="instapay">إنستاباي (InstaPay)</option>
                  <option value="vodafone_cash">فودافون كاش / محافظ إلكترونية</option>
                  <option value="bank_transfer">تحويل بنكي</option>
                  <option value="deferred">آجل / مؤجل (Unpaid)</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">المبلغ المدفوع:</label>
                  <input
                    type="number"
                    min={0}
                    max={netTotal}
                    value={paidAmount}
                    onChange={(e) => setPaidAmount(Number(e.target.value))}
                    className="w-full text-xs font-mono font-bold bg-slate-50 border border-slate-200 rounded-xl p-2.5 focus:ring-2 focus:ring-rose-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">المتبقي كمديونية:</label>
                  <input
                    type="text"
                    disabled
                    value={`${remainingAmount} ج.م`}
                    className="w-full text-xs font-mono font-bold bg-slate-100 border border-slate-200 rounded-xl p-2.5 text-slate-600"
                  />
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="w-full py-4 rounded-xl bg-gradient-to-r from-rose-900 to-rose-950 hover:from-rose-800 hover:to-rose-900 text-white font-black text-sm shadow-xl shadow-rose-950/20 active:scale-[0.99] transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <CheckCircle2 className="w-5 h-5 text-rose-300" />
              <span>إتمام التسجيل وإصدار الفاتورة وإرسال العينة للمعمل</span>
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};
