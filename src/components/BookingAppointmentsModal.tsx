import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { 
  Building2, 
  Home, 
  Calendar, 
  Clock, 
  Tag, 
  CreditCard, 
  Smartphone, 
  Coins, 
  Search, 
  Check, 
  X, 
  MessageCircle, 
  Mail, 
  UserCheck, 
  Award, 
  Download, 
  RefreshCw, 
  Star,
  MapPin,
  CheckCircle2,
  AlertCircle,
  Percent,
  Edit2,
  Phone
} from 'lucide-react';
import { InvoiceTestItem, PaymentMethod } from '../types';
import { 
  BRANCH_MAIN_ADDRESS, 
  LAB_NAME_AR, 
  INSTAPAY_IPA, 
  WALLET_VODAFONE,
  generateBookingWhatsAppMessage, 
  generatePostSampleWhatsAppMessage, 
  openWhatsAppChat 
} from '../utils/whatsappBooking';
import { generateAndDownloadLoyaltyCard } from '../utils/loyaltyCardCanvas';
import { send24HourEmailReminder } from '../utils/emailReminder';

interface BookingAppointmentsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const BookingAppointmentsModal: React.FC<BookingAppointmentsModalProps> = ({ isOpen, onClose }) => {
  const { testCatalog, addIncomeRecord, currentUser, facilities, staffMembers, labInfo } = useApp();
  const [selectedBranchId, setSelectedBranchId] = useState<string>(facilities[0]?.id || "branch-behteem");
  const [selectedSpecialist, setSelectedSpecialist] = useState<string>("أ/ يوسف طارق المنشاوي (أخصائي سحب العينات والزيارات)");

  // Booking Type
  const [bookingType, setBookingType] = useState<'branch' | 'home_visit'>('branch');
  const [patientName, setPatientName] = useState('');
  const [patientPhone, setPatientPhone] = useState('');
  const [patientAge, setPatientAge] = useState<number | ''>(32);
  const [patientGender, setPatientGender] = useState<'male' | 'female'>('male');
  const [patientEmail, setPatientEmail] = useState('');

  // Home Visit fields (Fully editable)
  const [homeCity, setHomeCity] = useState('شبرا الخيمة');
  const [homeAddress, setHomeAddress] = useState('');
  const [deliveryNotes, setDeliveryNotes] = useState('');
  const [customHomeFee, setCustomHomeFee] = useState<number>(70);
  const effectiveHomeFee = bookingType === 'home_visit' ? customHomeFee : 0;

  // Date & Time (Fully editable)
  const todayStr = new Date().toISOString().split('T')[0];
  const [bookingDate, setBookingDate] = useState(todayStr);
  const [bookingTime, setBookingTime] = useState('10:00 ص');

  // Selected Tests & Custom test prices
  const [selectedTests, setSelectedTests] = useState<InvoiceTestItem[]>([]);
  const [customTestPrices, setCustomTestPrices] = useState<Record<string, number>>({});
  const [searchQuery, setSearchQuery] = useState('');

  // Discount Modes & Percentage Selection
  const [discountMode, setDiscountMode] = useState<'none' | 'percent' | 'daily_fixed' | 'package' | 'dynamic' | 'coupon'>('none');
  const [customPercent, setCustomPercent] = useState<number>(15);
  const [customFlatDiscount, setCustomFlatDiscount] = useState<number>(0);
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<string | null>(null);

  // Payment
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('cash');
  const [paidNow, setPaidNow] = useState<number | ''>('');

  // Sample collection & post-draw state
  const [sampleNotes, setSampleNotes] = useState('تم سحب العينات بنجاح وأمان كامل');
  const [loyaltyCardIssued, setLoyaltyCardIssued] = useState(false);

  const filteredCatalog = useMemo(() => {
    if (!searchQuery) return testCatalog.slice(0, 20);
    const q = searchQuery.toLowerCase();
    return testCatalog.filter(t => t.nameAr.toLowerCase().includes(q) || t.nameEn.toLowerCase().includes(q) || t.code.toLowerCase().includes(q));
  }, [testCatalog, searchQuery]);

  const testsSubtotal = useMemo(() => {
    return selectedTests.reduce((sum, t) => {
      const p = customTestPrices[t.id] !== undefined ? customTestPrices[t.id] : t.price;
      return sum + p;
    }, 0);
  }, [selectedTests, customTestPrices]);

  const subtotal = useMemo(() => {
    return testsSubtotal + effectiveHomeFee;
  }, [testsSubtotal, effectiveHomeFee]);

  const discountAmount = useMemo(() => {
    // Discount applies strictly to tests only, never to home visit fee!
    if (appliedCoupon === 'RTLAB10') return Math.round(testsSubtotal * 0.1);
    if (appliedCoupon === 'BEHTEEM25') return Math.min(testsSubtotal, 50);
    if (appliedCoupon === 'HEALTH20') return Math.round(testsSubtotal * 0.2);
    if (appliedCoupon === 'VIP2026') return Math.round(testsSubtotal * 0.25);
    if (discountMode === 'percent') return Math.round((testsSubtotal * customPercent) / 100);
    if (discountMode === 'daily_fixed') return Math.min(testsSubtotal, customFlatDiscount > 0 ? customFlatDiscount : 60);
    if (discountMode === 'package') return Math.min(testsSubtotal, customFlatDiscount > 0 ? customFlatDiscount : 100);
    if (discountMode === 'dynamic') return Math.round((testsSubtotal * (customPercent || 18)) / 100);
    return 0;
  }, [testsSubtotal, discountMode, customPercent, customFlatDiscount, appliedCoupon]);
  const discountLabel = useMemo(() => {
    if (appliedCoupon) return `كوبون (${appliedCoupon})`;
    if (discountMode === 'percent') return `خصم مئوي ${customPercent}%`;
    if (discountMode === 'daily_fixed') return `خصم نقدي (${discountAmount} ج)`;
    if (discountMode === 'package') return `خصم باقة ثابتة (${discountAmount} ج)`;
    if (discountMode === 'dynamic') return `عرض معمل متغير (${customPercent || 18}%)`;
    return 'بدون خصم';
  }, [discountMode, customPercent, discountAmount, appliedCoupon]);

  const netAmount = Math.max(0, subtotal - discountAmount);

  const toggleTest = (test: InvoiceTestItem) => {
    if (selectedTests.some(t => t.id === test.id)) {
      setSelectedTests(prev => prev.filter(t => t.id !== test.id));
    } else {
      setSelectedTests(prev => [...prev, test]);
    }
  };

  const handleTestPriceChange = (id: string, newPrice: number) => {
    setCustomTestPrices(prev => ({ ...prev, [id]: newPrice }));
  };

  const handleApplyCoupon = () => {
    const c = couponCode.trim().toUpperCase();
    if (['RTLAB10', 'BEHTEEM25', 'HEALTH20', 'VIP2026'].includes(c)) {
      setAppliedCoupon(c);
      setDiscountMode('coupon');
    } else {
      alert('كود الكوبون غير صحيح. الكوبونات النشطة: RTLAB10, BEHTEEM25, HEALTH20, VIP2026');
    }
  };

  const handleSaveBooking = (e: React.FormEvent) => {
    e.preventDefault();
    if (!patientName.trim()) {
      alert('يرجى كتابة اسم المريض');
      return;
    }
    if (selectedTests.length === 0) {
      alert('يرجى اختيار تحليل واحد على الأقل');
      return;
    }

    const bookingNum = `RT-BK-${Math.floor(1000 + Math.random() * 9000)}`;
    const barcode = `${new Date().getFullYear().toString().slice(-2)}${Math.floor(100000 + Math.random() * 900000)}`;

    const activeBranch = facilities.find(f => f.id === selectedBranchId) || facilities[0];
    const branchName = bookingType === 'branch' ? (activeBranch?.nameAr || 'الفرع الرئيسي - بهتيم') : 'زيارة منزلية';

    addIncomeRecord({
      invoiceNumber: bookingNum,
      patientName: patientName.trim(),
      patientPhone: patientPhone.trim() || '01000000000',
      patientAge: Number(patientAge) || 30,
      patientGender,
      barcode,
      labNumber: bookingNum,
      referringDoctor: bookingType === 'branch' ? `فحص بفرع (${activeBranch?.nameAr || 'الرئيسي'})` : `زيارة منزلية - ${selectedSpecialist}`,
      tests: selectedTests.map(t => ({
        ...t,
        price: customTestPrices[t.id] !== undefined ? customTestPrices[t.id] : t.price
      })),
      subtotal,
      testsSubtotal,
      discount: discountAmount,
      visitFee: effectiveHomeFee,
      isHomeVisit: bookingType === 'home_visit',
      visitAddress: bookingType === 'home_visit' ? `${homeCity} - ${homeAddress}` : undefined,
      visitSpecialist: bookingType === 'home_visit' ? selectedSpecialist : undefined,
      branchId: activeBranch?.id,
      branch: branchName,
      netAmount,
      paidAmount: paidNow === '' ? netAmount : Number(paidNow),
      remainingAmount: Math.max(0, netAmount - (paidNow === '' ? netAmount : Number(paidNow))),
      paymentMethod,
      paymentStatus: (paidNow === '' || Number(paidNow) >= netAmount) ? 'paid' : (Number(paidNow) > 0 ? 'partial' : 'unpaid'),
      cashierName: currentUser?.nameAr || 'استقبال معامل RT',
      notes: `${bookingType === 'branch' ? 'حضور بالفرع: ' + (activeBranch?.nameAr || 'الرئيسي') : 'زيارة منزلية: ' + homeCity + ' - ' + homeAddress + (effectiveHomeFee > 0 ? ' (رسوم زيارة: ' + effectiveHomeFee + ' ج)' : '')} • موعد: ${bookingDate} ${bookingTime} • ${discountLabel}${bookingType === 'home_visit' ? ' • المسؤول: ' + selectedSpecialist : ''}`,
      syncStatus: 'local_only'
    });

    // Send WhatsApp confirmation with dynamic branch & visit fee
    const waText = generateBookingWhatsAppMessage({
      patientName: patientName.trim(),
      bookingNumber: bookingNum,
      date: bookingDate,
      time: bookingTime,
      isHomeVisit: bookingType === 'home_visit',
      address: `${homeCity} - ${homeAddress}`,
      deliveryNotes,
      branchName: activeBranch?.nameAr,
      branchAddress: activeBranch?.address,
      branchPhone: (activeBranch?.phones && activeBranch.phones[0]) || labInfo?.hotline,
      labNameAr: labInfo?.labNameAr,
      visitFee: effectiveHomeFee,
      visitSpecialist: bookingType === 'home_visit' ? selectedSpecialist : undefined,
      tests: selectedTests.map(t => ({
        nameAr: t.nameAr,
        price: customTestPrices[t.id] !== undefined ? customTestPrices[t.id] : t.price
      })),
      subtotal,
      testsSubtotal,
      discountAmount,
      discountLabel,
      netAmount,
      paymentMethod: paymentMethod === 'cash' ? 'نقداً (كاش)' : paymentMethod === 'visa' ? 'بطاقة ائتمانية' : 'إنستا باي / محفظة'
    });
    openWhatsAppChat(patientPhone, waText);

    alert(`تم تأكيد الحجز برقم (#${bookingNum}) وتسجيله بالمنظومة وإرسال رسالة الواتساب بنجاح!`);
    onClose();
  };

  // Confirm Sample Draw & Activate Loyalty Card
  const handleConfirmDrawAndLoyalty = () => {
    if (!patientName.trim()) {
      alert('يرجى إدخال اسم المريض أولاً');
      return;
    }
    setLoyaltyCardIssued(true);

    const cardCode = `RT-GOLD-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;

    // Generate & Download card
    generateAndDownloadLoyaltyCard({
      cardNumber: cardCode,
      patientName: patientName.trim(),
      patientPhone: patientPhone.trim() || '01000000000',
      tier: 'Gold VIP',
      discountPercentage: customPercent || 15,
      points: Math.floor(netAmount / 2)
    });

    // Send post sample WhatsApp
    const postSampleText = generatePostSampleWhatsAppMessage({
      patientName: patientName.trim(),
      bookingNumber: `RT-${new Date().getFullYear()}`,
      notes: sampleNotes,
      expectedTime: 'خلال 4 ساعات اليوم بإذن الله',
      loyaltyCardCode: cardCode,
      discountPercentage: customPercent || 15
    });
    openWhatsAppChat(patientPhone, postSampleText);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-4xl w-full my-auto overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-rose-600 flex items-center justify-center font-black text-xl">
              RT
            </div>
            <div>
              <h3 className="font-bold text-base flex items-center gap-2">
                <span>حجز مريض جديد وتحديد المواعيد والخصومات</span>
                <span className="text-xs bg-rose-950 text-rose-300 border border-rose-800 px-2 py-0.5 rounded-md font-medium">
                  الفرع الرئيسي والزيارات المنزلية
                </span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                {LAB_NAME_AR} • نسب خصم متعددة، تسعير ديناميكي، إنستا باي، وواتساب
              </p>
            </div>
          </div>
          <button type="button" onClick={onClose} className="text-slate-400 hover:text-white cursor-pointer">
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSaveBooking} className="p-6 space-y-6 text-xs max-h-[80vh] overflow-y-auto">
          {/* Section 1: Patient info */}
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
            <h4 className="font-bold text-slate-900 text-xs flex items-center gap-2 border-b border-slate-200 pb-2">
              <span className="w-5 h-5 rounded-full bg-rose-600 text-white flex items-center justify-center text-[10px]">1</span>
              <span>بيانات المريض الأساسية (قابلة للتعديل بالكامل):</span>
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              <div>
                <label className="block font-bold text-slate-700 mb-1">اسم المريض ثلاثي / رباعي *</label>
                <input
                  type="text"
                  required
                  value={patientName}
                  onChange={e => setPatientName(e.target.value)}
                  placeholder="محمد أحمد علي"
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg font-semibold"
                />
              </div>
              <div>
                <label className="block font-bold text-slate-700 mb-1">رقم الهاتف (واتساب) *</label>
                <input
                  type="tel"
                  required
                  value={patientPhone}
                  onChange={e => setPatientPhone(e.target.value)}
                  placeholder="01012345678"
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg font-mono text-left"
                  dir="ltr"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">السن</label>
                  <input
                    type="number"
                    value={patientAge}
                    onChange={e => setPatientAge(e.target.value === '' ? '' : Number(e.target.value))}
                    className="w-full px-2 py-2 bg-white border border-slate-300 rounded-lg font-mono"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">النوع</label>
                  <select
                    value={patientGender}
                    onChange={e => setPatientGender(e.target.value as any)}
                    className="w-full px-2 py-2 bg-white border border-slate-300 rounded-lg"
                  >
                    <option value="male">ذكر</option>
                    <option value="female">أنثى</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block font-bold text-slate-700 mb-1">البريد الإلكتروني (لتذكير 24 ساعة)</label>
                <input
                  type="email"
                  value={patientEmail}
                  onChange={e => setPatientEmail(e.target.value)}
                  placeholder="patient@example.com"
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg font-mono text-left"
                  dir="ltr"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Branch vs Home Visit */}
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
            <h4 className="font-bold text-slate-900 text-xs flex items-center gap-2 border-b border-slate-200 pb-2">
              <span className="w-5 h-5 rounded-full bg-rose-600 text-white flex items-center justify-center text-[10px]">2</span>
              <span>مقر وتفاصيل الحجز ورسوم التوصيل:</span>
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setBookingType('branch')}
                className={`p-3 rounded-xl border text-right transition-all flex items-start gap-2.5 cursor-pointer ${
                  bookingType === 'branch' ? 'bg-rose-50 border-rose-600 ring-1 ring-rose-600' : 'bg-white border-slate-200'
                }`}
              >
                <Building2 className={`w-5 h-5 mt-0.5 ${bookingType === 'branch' ? 'text-rose-600' : 'text-slate-400'}`} />
                <div>
                  <div className="font-bold text-slate-900">حضور للفرع الرئيسي</div>
                  <div className="text-[11px] text-slate-500">ميدان بهتيم - شبرا الخيمة</div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setBookingType('home_visit')}
                className={`p-3 rounded-xl border text-right transition-all flex items-start gap-2.5 cursor-pointer ${
                  bookingType === 'home_visit' ? 'bg-rose-50 border-rose-600 ring-1 ring-rose-600' : 'bg-white border-slate-200'
                }`}
              >
                <Home className={`w-5 h-5 mt-0.5 ${bookingType === 'home_visit' ? 'text-rose-600' : 'text-slate-400'}`} />
                <div>
                  <div className="font-bold text-slate-900">زيارة منزلية خاصة (+{customHomeFee} ج.م)</div>
                  <div className="text-[11px] text-slate-500">سحب عينات معقم بالمنزل</div>
                </div>
              </button>
            </div>

            {bookingType === 'branch' ? (
              <div className="bg-white p-3 rounded-lg border border-slate-200 space-y-2">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                  <label className="block text-slate-700 font-bold text-xs">اختر فرع المعمل المطلوب:</label>
                  <select
                    value={selectedBranchId}
                    onChange={e => setSelectedBranchId(e.target.value)}
                    className="px-3 py-1.5 border border-slate-300 rounded-lg text-xs font-bold text-slate-800 bg-slate-50 focus:ring-2 focus:ring-rose-600"
                  >
                    {facilities.map(f => (
                      <option key={f.id} value={f.id}>
                        {f.nameAr} {f.isMainBranch ? '(الرئيسي)' : ''}
                      </option>
                    ))}
                  </select>
                </div>
                {(() => {
                  const b = facilities.find(f => f.id === selectedBranchId) || facilities[0];
                  return (
                    <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-100 text-xs space-y-1">
                      <div className="flex items-start gap-2 text-slate-800">
                        <MapPin className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                        <span className="font-semibold leading-relaxed">
                          {b?.address || BRANCH_MAIN_ADDRESS}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-slate-600 pr-6 text-[11px]">
                        <Phone className="w-3.5 h-3.5 text-slate-400" />
                        <span className="font-mono">هاتف الفرع: {(b?.phones || []).join(' / ')}</span>
                      </div>
                    </div>
                  );
                })()}
              </div>
            ) : (
              <div className="bg-white p-3 rounded-lg border border-slate-200 space-y-2.5">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <div>
                    <label className="block text-slate-700 font-bold mb-1">المنطقة / الحي</label>
                    <input
                      type="text"
                      value={homeCity}
                      onChange={e => setHomeCity(e.target.value)}
                      className="w-full px-2.5 py-1.5 border border-slate-300 rounded-md text-xs font-semibold"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-700 font-bold mb-1">العنوان بالتفصيل *</label>
                    <input
                      type="text"
                      required={bookingType === 'home_visit'}
                      value={homeAddress}
                      onChange={e => setHomeAddress(e.target.value)}
                      placeholder="شارع 15 مايو، عمارة 10، الدور 3، شقة 5"
                      className="w-full px-2.5 py-1.5 border border-slate-300 rounded-md text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-700 font-bold mb-1">
                      رسوم الزيارة (ج.م) [ثابتة لا تخصم]
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={customHomeFee}
                      onChange={e => setCustomHomeFee(Number(e.target.value) || 0)}
                      className="w-full px-2.5 py-1.5 border border-slate-300 rounded-md font-bold font-mono text-rose-900 text-xs"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1 border-t border-slate-100">
                  <div>
                    <label className="block text-slate-700 font-bold mb-1 text-[11px]">
                      الكيميائي / الفني المسؤول عن سحب الزيارة:
                    </label>
                    <select
                      value={selectedSpecialist}
                      onChange={e => setSelectedSpecialist(e.target.value)}
                      className="w-full px-2.5 py-1.5 border border-slate-300 rounded-md text-xs font-semibold bg-slate-50"
                    >
                      {staffMembers
                        .filter(s => s.department === 'chemists' || s.department === 'phlebotomists' || true)
                        .map(s => (
                          <option key={s.id} value={`${s.name} (${s.title})`}>
                            {s.name} - {s.title}
                          </option>
                        ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-slate-700 font-bold mb-1 text-[11px]">الفرع المنسق للزيارة:</label>
                    <select
                      value={selectedBranchId}
                      onChange={e => setSelectedBranchId(e.target.value)}
                      className="w-full px-2.5 py-1.5 border border-slate-300 rounded-md text-xs font-semibold bg-slate-50"
                    >
                      {facilities.map(f => (
                        <option key={f.id} value={f.id}>{f.nameAr}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1 text-[11px]">ملاحظات الوصول وحالة المريض:</label>
                  <input
                    type="text"
                    value={deliveryNotes}
                    onChange={e => setDeliveryNotes(e.target.value)}
                    placeholder="بجوار مسجد النور، الأسانسير معطل، أو المريض طفل..."
                    className="w-full px-2.5 py-1.5 border border-slate-300 rounded-md text-xs"
                  />
                </div>

                <div className="bg-amber-50 border border-amber-200 px-3 py-1.5 rounded-lg text-amber-900 text-[11px] font-bold flex items-center justify-between">
                  <span>💡 رسوم الزيارة المنزلية ({customHomeFee} ج.م):</span>
                  <span>تضاف بالكامل للفاتورة ولا تتأثر بنسبة الخصم، ولا تضاف لنقاط كارت الولاء</span>
                </div>
              </div>
            )}
          </div>

          {/* Section 3: Date & Time */}
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
            <h4 className="font-bold text-slate-900 text-xs flex items-center gap-2 border-b border-slate-200 pb-2">
              <span className="w-5 h-5 rounded-full bg-rose-600 text-white flex items-center justify-center text-[10px]">3</span>
              <span>تحديد اليوم والساعة (مواعيد الإدارة والأطباء):</span>
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-slate-700 mb-1">تاريخ الموعد</label>
                <input
                  type="date"
                  value={bookingDate}
                  onChange={e => setBookingDate(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg font-mono"
                />
              </div>
              <div>
                <label className="block font-bold text-slate-700 mb-1">الساعة المحددة</label>
                <select
                  value={bookingTime}
                  onChange={e => setBookingTime(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg font-bold"
                >
                  {['08:30 ص', '09:00 ص', '09:30 ص', '10:00 ص', '10:30 ص', '11:00 ص', '12:00 م', '05:00 م', '06:00 م', '07:30 م', '09:00 م'].map(s => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Section 4: Tests selection & dynamic pricing */}
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
            <div className="flex items-center justify-between border-b border-slate-200 pb-2">
              <h4 className="font-bold text-slate-900 text-xs flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-rose-600 text-white flex items-center justify-center text-[10px]">4</span>
                <span>اختيار التحاليل والتسعير التلقائي (مع إمكانية تعديل سعر كل فحص):</span>
              </h4>
              <span className="text-rose-900 font-bold">تم اختيار {selectedTests.length} فحص</span>
            </div>

            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="ابحث في التحاليل بالاسم أو الكود (CBC, سكر, كبد, كلى, فيتامين د)..."
                className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg pr-8"
              />
              <Search className="w-4 h-4 text-slate-400 absolute right-2.5 top-2 pointer-events-none" />
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-40 overflow-y-auto p-1 bg-white border border-slate-200 rounded-lg">
              {filteredCatalog.map(t => {
                const isSelected = selectedTests.some(x => x.id === t.id);
                const currentPrice = customTestPrices[t.id] !== undefined ? customTestPrices[t.id] : t.price;
                return (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => toggleTest(t)}
                    className={`p-2 rounded-lg border text-right transition-colors flex items-center justify-between cursor-pointer ${
                      isSelected ? 'bg-rose-900 text-white border-rose-950 font-bold' : 'bg-slate-50 hover:bg-slate-100 text-slate-800 border-slate-200'
                    }`}
                  >
                    <div className="truncate">
                      <div className="truncate text-xs">{t.nameAr}</div>
                      <div className={`text-[10px] font-mono ${isSelected ? 'text-rose-200' : 'text-slate-400'}`}>{t.code}</div>
                    </div>
                    <span className="font-mono shrink-0 mr-1">{currentPrice} ج</span>
                  </button>
                );
              })}
            </div>

            {/* Selected Tests with Editable Price */}
            {selectedTests.length > 0 && (
              <div className="space-y-1.5 pt-2">
                <span className="font-bold text-slate-700 block">تعديل أسعار الفحوصات المختارة يدوياً:</span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {selectedTests.map(t => {
                    const price = customTestPrices[t.id] !== undefined ? customTestPrices[t.id] : t.price;
                    return (
                      <div key={t.id} className="flex items-center justify-between bg-white p-2 rounded-lg border border-slate-200">
                        <span className="truncate font-semibold">{t.nameAr}</span>
                        <div className="flex items-center gap-1">
                          <input
                            type="number"
                            min="0"
                            value={price}
                            onChange={e => handleTestPriceChange(t.id, Number(e.target.value) || 0)}
                            className="w-16 px-1.5 py-0.5 text-center font-bold font-mono border border-slate-300 rounded text-xs"
                          />
                          <span className="text-slate-400 text-[10px]">ج</span>
                          <button
                            type="button"
                            onClick={() => toggleTest(t)}
                            className="text-rose-600 hover:text-rose-800 p-1 cursor-pointer font-bold"
                          >
                            ✕
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Section 5: Multiple Discount Modes & Percentages Selector */}
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
            <h4 className="font-bold text-slate-900 text-xs flex items-center gap-2 border-b border-slate-200 pb-2">
              <span className="w-5 h-5 rounded-full bg-rose-600 text-white flex items-center justify-center text-[10px]">5</span>
              <span>اختيار نسب الخصم وإمكانية الإضافة والتعديل:</span>
            </h4>

            {/* Quick Percentage Buttons */}
            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1.5 flex items-center gap-1">
                <Percent className="w-3.5 h-3.5 text-rose-700" />
                <span>اختر نسبة الخصم المئوية (%):</span>
              </label>
              <div className="flex items-center gap-1.5 flex-wrap">
                {[5, 10, 15, 20, 25, 30, 35, 40, 50].map(pct => (
                  <button
                    key={pct}
                    type="button"
                    onClick={() => {
                      setDiscountMode('percent');
                      setCustomPercent(pct);
                      setAppliedCoupon(null);
                    }}
                    className={`px-2.5 py-1.5 rounded-lg font-bold font-mono text-xs cursor-pointer transition-all ${
                      discountMode === 'percent' && customPercent === pct && !appliedCoupon
                        ? 'bg-rose-900 text-white shadow-xs scale-105'
                        : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    {pct}%
                  </button>
                ))}
              </div>
            </div>

            {/* Editable percentage & editable flat discount amount */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-slate-200">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  إدخال / تعديل نسبة الخصم يدوياً (%):
                </label>
                <div className="relative">
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={customPercent}
                    onChange={e => {
                      setCustomPercent(Number(e.target.value) || 0);
                      setDiscountMode('percent');
                      setAppliedCoupon(null);
                    }}
                    placeholder="مثال: 18%"
                    className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg font-mono font-bold text-rose-900"
                  />
                  <span className="absolute left-3 top-1.5 text-slate-400 font-bold">%</span>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  أو إدخال خصم نقدي مباشر بالجنيه (ج.م):
                </label>
                <div className="relative">
                  <input
                    type="number"
                    min="0"
                    max={subtotal}
                    value={customFlatDiscount || ''}
                    onChange={e => {
                      setCustomFlatDiscount(Number(e.target.value) || 0);
                      setDiscountMode('daily_fixed');
                      setAppliedCoupon(null);
                    }}
                    placeholder="مثال: 60 ج.م"
                    className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg font-mono font-bold text-emerald-800"
                  />
                  <span className="absolute left-3 top-1.5 text-slate-400">ج.م</span>
                </div>
              </div>
            </div>

            {/* Preset Modes */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2">
              <button
                type="button"
                onClick={() => { setDiscountMode('none'); setAppliedCoupon(null); setCustomFlatDiscount(0); }}
                className={`p-2 rounded-lg border text-center font-bold text-xs cursor-pointer ${
                  discountMode === 'none' && !appliedCoupon ? 'bg-rose-900 text-white' : 'bg-white border-slate-200'
                }`}
              >
                بدون خصم
              </button>
              <button
                type="button"
                onClick={() => { setDiscountMode('daily_fixed'); setCustomFlatDiscount(60); setAppliedCoupon(null); }}
                className={`p-2 rounded-lg border text-center font-bold text-xs cursor-pointer ${
                  discountMode === 'daily_fixed' ? 'bg-rose-900 text-white' : 'bg-white border-slate-200'
                }`}
              >
                عرض اليوم (60 ج)
              </button>
              <button
                type="button"
                onClick={() => { setDiscountMode('package'); setCustomFlatDiscount(100); setAppliedCoupon(null); }}
                className={`p-2 rounded-lg border text-center font-bold text-xs cursor-pointer ${
                  discountMode === 'package' ? 'bg-rose-900 text-white' : 'bg-white border-slate-200'
                }`}
              >
                باقة ثابتة (وفر 100 ج)
              </button>
              <button
                type="button"
                onClick={() => { setDiscountMode('dynamic'); setCustomPercent(18); setAppliedCoupon(null); }}
                className={`p-2 rounded-lg border text-center font-bold text-xs cursor-pointer ${
                  discountMode === 'dynamic' ? 'bg-rose-900 text-white' : 'bg-white border-slate-200'
                }`}
              >
                عرض معمل (18%)
              </button>
            </div>

            {/* Coupon input */}
            <div className="flex gap-2 pt-2 border-t border-slate-200">
              <input
                type="text"
                value={couponCode}
                onChange={e => setCouponCode(e.target.value.toUpperCase())}
                placeholder="أدخل كود كوبون مثل RTLAB10 أو BEHTEEM25 أو VIP2026"
                className="flex-1 px-3 py-1.5 bg-white border border-slate-300 rounded-lg font-mono uppercase"
              />
              <button
                type="button"
                onClick={handleApplyCoupon}
                className="px-4 py-1.5 bg-slate-900 text-white rounded-lg font-bold cursor-pointer hover:bg-slate-800"
              >
                تطبيق الكوبون
              </button>
            </div>
            {appliedCoupon && (
              <div className="text-emerald-700 font-bold text-xs">
                ✓ تم تفعيل الكوبون ({appliedCoupon}) بنجاح!
              </div>
            )}
          </div>

          {/* Section 6: Payment Methods & Totals */}
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
            <h4 className="font-bold text-slate-900 text-xs flex items-center gap-2 border-b border-slate-200 pb-2">
              <span className="w-5 h-5 rounded-full bg-rose-600 text-white flex items-center justify-center text-[10px]">6</span>
              <span>طرق الدفع المتنوعة والتكلفة الإجمالية:</span>
            </h4>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <button
                type="button"
                onClick={() => setPaymentMethod('cash')}
                className={`p-2.5 rounded-lg border text-center font-bold cursor-pointer ${
                  paymentMethod === 'cash' ? 'bg-rose-900 text-white border-rose-950' : 'bg-white border-slate-200'
                }`}
              >
                نقداً (كاش)
              </button>
              <button
                type="button"
                onClick={() => setPaymentMethod('visa')}
                className={`p-2.5 rounded-lg border text-center font-bold cursor-pointer ${
                  paymentMethod === 'visa' ? 'bg-rose-900 text-white border-rose-950' : 'bg-white border-slate-200'
                }`}
              >
                بطاقات ائتمانية (POS)
              </button>
              <button
                type="button"
                onClick={() => setPaymentMethod('bank_transfer')}
                className={`p-2.5 rounded-lg border text-center font-bold cursor-pointer ${
                  paymentMethod === 'bank_transfer' ? 'bg-rose-900 text-white border-rose-950' : 'bg-white border-slate-200'
                }`}
              >
                إنستا باي ({INSTAPAY_IPA})
              </button>
              <button
                type="button"
                onClick={() => setPaymentMethod('cash')}
                className="p-2.5 rounded-lg border text-center font-bold bg-white border-slate-200"
              >
                محفظة إلكترونية ({WALLET_VODAFONE})
              </button>
            </div>

            {/* Total calculation card (Fully editable) */}
            <div className="bg-white p-4 rounded-xl border border-slate-200 grid grid-cols-2 sm:grid-cols-5 gap-3 text-center">
              <div>
                <span className="text-slate-500 block text-[11px]">إجمالي التحاليل:</span>
                <strong className="text-sm font-black font-mono text-slate-900">{testsSubtotal} ج.م</strong>
              </div>
              <div>
                <span className="text-slate-500 block text-[11px]">الخصم (على التحاليل):</span>
                <strong className="text-sm font-black font-mono text-rose-700">-{discountAmount} ج.م</strong>
              </div>
              <div>
                <span className="text-slate-500 block text-[11px]">رسوم الزيارة (مستقلة):</span>
                <strong className="text-sm font-black font-mono text-indigo-700">+{effectiveHomeFee} ج.م</strong>
              </div>
              <div>
                <span className="text-slate-500 block text-[11px]">المبلغ الصافي المطلوب:</span>
                <strong className="text-lg font-black font-mono text-emerald-700">{netAmount} ج.م</strong>
              </div>
              <div>
                <label className="text-slate-500 block text-[11px]">المدفوع الآن (ج.م):</label>
                <input
                  type="number"
                  value={paidNow}
                  onChange={e => setPaidNow(e.target.value === '' ? '' : Number(e.target.value))}
                  placeholder={`${netAmount}`}
                  className="w-full text-center px-2 py-1 font-bold font-mono border border-slate-300 rounded text-sm text-slate-900"
                />
              </div>
            </div>
          </div>

          {/* Section 7: Post-draw sample & Loyalty Card Activation */}
          <div className="bg-amber-50 p-4 rounded-xl border border-amber-200 space-y-3">
            <div className="flex items-center justify-between border-b border-amber-200 pb-2">
              <h4 className="font-bold text-amber-950 text-xs flex items-center gap-2">
                <UserCheck className="w-4 h-4 text-amber-700" />
                <span>مرحلة ما بعد السحب وتفعيل كارت الولاء RT:</span>
              </h4>
              <button
                type="button"
                onClick={handleConfirmDrawAndLoyalty}
                className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-lg font-bold flex items-center gap-1.5 cursor-pointer shadow-xs"
              >
                <Award className="w-3.5 h-3.5" />
                <span>تأكيد السحب + تفعيل كارت الولاء وحفظ الصورة</span>
              </button>
            </div>

            <div className="text-xs text-amber-900 leading-relaxed">
              عند سحب العينة بنجاح، يتم تفعيل كارت الولاء الطبي الخاص بالعميل بنسبة خصم دائمة {customPercent || 15}%، وتنزيل صورة الكارت الفاخرة تلقائياً بجهازك وإرسال رسالة ما بعد السحب عبر واتساب للمريض مع موعد ظهور النتيجة.
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-slate-200">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  send24HourEmailReminder({
                    patientEmail,
                    patientName,
                    bookingNumber: 'RT-2026',
                    date: bookingDate,
                    time: bookingTime,
                    isHomeVisit: bookingType === 'home_visit',
                    address: `${homeCity} - ${homeAddress}`,
                    tests: selectedTests.map(t => ({ nameAr: t.nameAr })),
                    netAmount
                  });
                }}
                className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg font-bold flex items-center gap-1.5 cursor-pointer"
              >
                <Mail className="w-3.5 h-3.5" />
                <span>بريد تذكيري (24 ساعة)</span>
              </button>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-bold cursor-pointer"
              >
                إلغاء
              </button>
              <button
                type="submit"
                className="px-6 py-2.5 bg-rose-900 hover:bg-rose-800 text-white rounded-lg font-bold flex items-center gap-2 cursor-pointer shadow-md"
              >
                <MessageCircle className="w-4 h-4" />
                <span>تأكيد الحجز والتسجيل وإرسال واتساب</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
