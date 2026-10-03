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
  AlertCircle
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
  const { testCatalog, addIncomeRecord, incomeRecords, currentUser } = useApp();

  // Booking Type
  const [bookingType, setBookingType] = useState<'branch' | 'home_visit'>('branch');
  const [patientName, setPatientName] = useState('');
  const [patientPhone, setPatientPhone] = useState('');
  const [patientAge, setPatientAge] = useState<number | ''>(32);
  const [patientGender, setPatientGender] = useState<'male' | 'female'>('male');
  const [patientEmail, setPatientEmail] = useState('');

  // Home Visit fields
  const [homeCity, setHomeCity] = useState('شبرا الخيمة');
  const [homeAddress, setHomeAddress] = useState('');
  const [deliveryNotes, setDeliveryNotes] = useState('');
  const homeFee = bookingType === 'home_visit' ? 70 : 0;

  // Date & Time
  const todayStr = new Date().toISOString().split('T')[0];
  const [bookingDate, setBookingDate] = useState(todayStr);
  const [bookingTime, setBookingTime] = useState('10:00 ص');

  // Selected Tests
  const [selectedTests, setSelectedTests] = useState<InvoiceTestItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  // Discount Modes
  const [discountMode, setDiscountMode] = useState<'none' | 'percent' | 'daily_fixed' | 'package' | 'dynamic' | 'coupon'>('none');
  const [customPercent, setCustomPercent] = useState(15);
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<string | null>(null);

  // Payment
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('cash');
  const [paidNow, setPaidNow] = useState<number | ''>('');

  // Sample collection & post-draw state
  const [isSampleDrawn, setIsSampleDrawn] = useState(false);
  const [sampleNotes, setSampleNotes] = useState('تم سحب العينات بنجاح وأمان كامل');
  const [loyaltyCardIssued, setLoyaltyCardIssued] = useState(false);

  // Rating
  const [rating, setRating] = useState(5);
  const [ratingComment, setRatingComment] = useState('');

  const filteredCatalog = useMemo(() => {
    if (!searchQuery) return testCatalog.slice(0, 20);
    const q = searchQuery.toLowerCase();
    return testCatalog.filter(t => t.nameAr.toLowerCase().includes(q) || t.nameEn.toLowerCase().includes(q) || t.code.toLowerCase().includes(q));
  }, [testCatalog, searchQuery]);

  const subtotal = useMemo(() => {
    return selectedTests.reduce((sum, t) => sum + t.price, 0) + homeFee;
  }, [selectedTests, homeFee]);

  const discountAmount = useMemo(() => {
    if (appliedCoupon === 'RTLAB10') return Math.round(subtotal * 0.1);
    if (appliedCoupon === 'BEHTEEM25') return Math.min(subtotal, 50);
    if (appliedCoupon === 'HEALTH20') return Math.round(subtotal * 0.2);
    if (appliedCoupon === 'VIP2026') return Math.round(subtotal * 0.25);

    if (discountMode === 'percent') return Math.round((subtotal * customPercent) / 100);
    if (discountMode === 'daily_fixed') return Math.min(subtotal, 60);
    if (discountMode === 'package') return Math.min(subtotal, 100);
    if (discountMode === 'dynamic') return Math.round((subtotal * 18) / 100);
    return 0;
  }, [subtotal, discountMode, customPercent, appliedCoupon]);

  const discountLabel = useMemo(() => {
    if (appliedCoupon) return `كوبون (${appliedCoupon})`;
    if (discountMode === 'percent') return `خصم مئوي ${customPercent}%`;
    if (discountMode === 'daily_fixed') return 'عرض اليوم الثابت (خصم 60 ج)';
    if (discountMode === 'package') return 'خصم باقة ثابتة (100 ج)';
    if (discountMode === 'dynamic') return 'عرض معمل متغير (18%)';
    return 'بدون خصم';
  }, [discountMode, customPercent, appliedCoupon]);

  const netAmount = Math.max(0, subtotal - discountAmount);

  const toggleTest = (test: InvoiceTestItem) => {
    if (selectedTests.some(t => t.id === test.id)) {
      setSelectedTests(prev => prev.filter(t => t.id !== test.id));
    } else {
      setSelectedTests(prev => [...prev, test]);
    }
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

    addIncomeRecord({
      invoiceNumber: bookingNum,
      patientName: patientName.trim(),
      patientPhone: patientPhone.trim() || '01000000000',
      patientAge: Number(patientAge) || 30,
      patientGender,
      barcode,
      labNumber: bookingNum,
      referringDoctor: bookingType === 'branch' ? 'فحص بالفرع الرئيسي' : 'زيارة منزلية',
      tests: selectedTests,
      subtotal,
      discount: discountAmount,
      netAmount,
      paidAmount: paidNow === '' ? netAmount : Number(paidNow),
      remainingAmount: Math.max(0, netAmount - (paidNow === '' ? netAmount : Number(paidNow))),
      paymentMethod,
      paymentStatus: (paidNow === '' || Number(paidNow) >= netAmount) ? 'paid' : (Number(paidNow) > 0 ? 'partial' : 'unpaid'),
      cashierName: currentUser?.nameAr || 'استقبال معامل RT',
      branch: bookingType === 'branch' ? 'الفرع الرئيسي - بهتيم' : 'زيارة منزلية',
      notes: `${bookingType === 'branch' ? 'حضور بالفرع الرئيسي' : 'زيارة منزلية: ' + homeCity + ' - ' + homeAddress} • موعد: ${bookingDate} ${bookingTime} • ${discountLabel}`,
      syncStatus: 'local_only',
    });

    // Send WhatsApp confirmation
    const waText = generateBookingWhatsAppMessage({
      patientName: patientName.trim(),
      bookingNumber: bookingNum,
      date: bookingDate,
      time: bookingTime,
      isHomeVisit: bookingType === 'home_visit',
      address: `${homeCity} - ${homeAddress}`,
      deliveryNotes,
      tests: selectedTests,
      subtotal,
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
    setIsSampleDrawn(true);
    setLoyaltyCardIssued(true);

    const cardCode = `RT-GOLD-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;

    // Generate & Download card
    generateAndDownloadLoyaltyCard({
      cardNumber: cardCode,
      patientName: patientName.trim(),
      patientPhone: patientPhone.trim() || '01000000000',
      tier: 'Gold VIP',
      discountPercentage: 15,
      points: Math.floor(netAmount / 2)
    });

    // Send post sample WhatsApp
    const postSampleText = generatePostSampleWhatsAppMessage({
      patientName: patientName.trim(),
      bookingNumber: `RT-${new Date().getFullYear()}`,
      notes: sampleNotes,
      expectedTime: 'خلال 4 ساعات اليوم بإذن الله',
      loyaltyCardCode: cardCode,
      discountPercentage: 15
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
                <span>حجز مريض جديد وتحديد المواعيد</span>
                <span className="text-xs bg-rose-950 text-rose-300 border border-rose-800 px-2 py-0.5 rounded-md font-medium">
                  الفرع الرئيسي والزيارات المنزلية
                </span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                {LAB_NAME_AR} • تسعير تلقائي، خصومات متعددة، إنستا باي، وواتساب فوري
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
              <span>بيانات المريض الأساسية:</span>
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
              <span>مقر وتفاصيل الحجز:</span>
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
                  <div className="font-bold text-slate-900">زيارة منزلية خاصة (+70 ج.م)</div>
                  <div className="text-[11px] text-slate-500">سحب عينات معقم بالمنزل</div>
                </div>
              </button>
            </div>

            {bookingType === 'branch' ? (
              <div className="bg-white p-3 rounded-lg border border-slate-200 flex items-center gap-2 text-slate-800">
                <MapPin className="w-4 h-4 text-rose-600 shrink-0" />
                <span className="font-semibold text-xs leading-relaxed">
                  عنوان الفرع الرئيسي: {BRANCH_MAIN_ADDRESS}
                </span>
              </div>
            ) : (
              <div className="bg-white p-3 rounded-lg border border-slate-200 space-y-2">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <div>
                    <label className="block text-slate-700 font-bold mb-1">المنطقة / المدينة</label>
                    <input
                      type="text"
                      value={homeCity}
                      onChange={e => setHomeCity(e.target.value)}
                      className="w-full px-2.5 py-1.5 border border-slate-300 rounded-md"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-700 font-bold mb-1">العنوان بالتفصيل (الشارع ورقم العقار والدور)</label>
                    <input
                      type="text"
                      required={bookingType === 'home_visit'}
                      value={homeAddress}
                      onChange={e => setHomeAddress(e.target.value)}
                      placeholder="شارع الجمهورية، عمارة 10، الدور 3، شقة 5"
                      className="w-full px-2.5 py-1.5 border border-slate-300 rounded-md"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-slate-700 font-bold mb-1">ملاحظات إضافية حول التوصيل والمنطقة وحالة المريض</label>
                  <input
                    type="text"
                    value={deliveryNotes}
                    onChange={e => setDeliveryNotes(e.target.value)}
                    placeholder="بجوار صيدلية الأمل، أو المريض مسن يرجى الصعود..."
                    className="w-full px-2.5 py-1.5 border border-slate-300 rounded-md"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Section 3: Date & Time */}
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
            <h4 className="font-bold text-slate-900 text-xs flex items-center gap-2 border-b border-slate-200 pb-2">
              <span className="w-5 h-5 rounded-full bg-rose-600 text-white flex items-center justify-center text-[10px]">3</span>
              <span>تحديد اليوم والساعة (جدول الإدارة والأطباء):</span>
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
                  {['09:00 ص', '09:30 ص', '10:00 ص', '10:30 ص', '11:00 ص', '12:00 م', '05:00 م', '06:00 م', '07:30 م', '09:00 م'].map(s => (
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
                <span>اختيار التحاليل والتسعير التلقائي:</span>
              </h4>
              <span className="text-rose-900 font-bold">تم اختيار {selectedTests.length} تحليل</span>
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
                    <span className="font-mono shrink-0 mr-1">{t.price} ج</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Section 5: Multiple Discount Modes & Coupons */}
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
            <h4 className="font-bold text-slate-900 text-xs flex items-center gap-2 border-b border-slate-200 pb-2">
              <span className="w-5 h-5 rounded-full bg-rose-600 text-white flex items-center justify-center text-[10px]">5</span>
              <span>نسب الخصم المتعددة وكوبونات الخصم:</span>
            </h4>

            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
              <button
                type="button"
                onClick={() => { setDiscountMode('none'); setAppliedCoupon(null); }}
                className={`p-2 rounded-lg border text-center font-bold text-xs cursor-pointer ${
                  discountMode === 'none' && !appliedCoupon ? 'bg-rose-900 text-white border-rose-950' : 'bg-white border-slate-200'
                }`}
              >
                بدون خصم
              </button>
              <button
                type="button"
                onClick={() => { setDiscountMode('percent'); setCustomPercent(15); setAppliedCoupon(null); }}
                className={`p-2 rounded-lg border text-center font-bold text-xs cursor-pointer ${
                  discountMode === 'percent' ? 'bg-rose-900 text-white border-rose-950' : 'bg-white border-slate-200'
                }`}
              >
                خصم مئوي (%15)
              </button>
              <button
                type="button"
                onClick={() => { setDiscountMode('daily_fixed'); setAppliedCoupon(null); }}
                className={`p-2 rounded-lg border text-center font-bold text-xs cursor-pointer ${
                  discountMode === 'daily_fixed' ? 'bg-rose-900 text-white border-rose-950' : 'bg-white border-slate-200'
                }`}
              >
                خصم يومي ثابت (60 ج)
              </button>
              <button
                type="button"
                onClick={() => { setDiscountMode('package'); setAppliedCoupon(null); }}
                className={`p-2 rounded-lg border text-center font-bold text-xs cursor-pointer ${
                  discountMode === 'package' ? 'bg-rose-900 text-white border-rose-950' : 'bg-white border-slate-200'
                }`}
              >
                باقة ثابتة (وفر 100 ج)
              </button>
              <button
                type="button"
                onClick={() => { setDiscountMode('dynamic'); setAppliedCoupon(null); }}
                className={`p-2 rounded-lg border text-center font-bold text-xs cursor-pointer ${
                  discountMode === 'dynamic' ? 'bg-rose-900 text-white border-rose-950' : 'bg-white border-slate-200'
                }`}
              >
                عرض معمل متغير (18%)
              </button>
            </div>

            {/* Coupon input */}
            <div className="flex gap-2 pt-2">
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

            {/* Total calculation card */}
            <div className="bg-white p-4 rounded-xl border border-slate-200 grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
              <div>
                <span className="text-slate-500 block">الإجمالي قبل الخصم:</span>
                <strong className="text-base font-black font-mono text-slate-900">{subtotal} ج.م</strong>
              </div>
              <div>
                <span className="text-slate-500 block">الخصم المطبق:</span>
                <strong className="text-base font-black font-mono text-rose-700">-{discountAmount} ج.م</strong>
              </div>
              <div>
                <span className="text-slate-500 block">المبلغ الصافي:</span>
                <strong className="text-xl font-black font-mono text-emerald-700">{netAmount} ج.م</strong>
              </div>
              <div>
                <label className="text-slate-500 block">المدفوع الآن:</label>
                <input
                  type="number"
                  value={paidNow}
                  onChange={e => setPaidNow(e.target.value === '' ? '' : Number(e.target.value))}
                  placeholder={`${netAmount}`}
                  className="w-full text-center px-2 py-1 font-bold font-mono border border-slate-300 rounded"
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
              عند سحب العينة بنجاح، يتم تفعيل كارت الولاء الطبي الخاص بالعميل بنسبة خصم دائمة 15%، وتنزيل صورة الكارت الفاخرة تلقائياً بجهازك وإرسال رسالة ما بعد السحب عبر واتساب للمريض مع موعد ظهور النتيجة.
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
                    tests: selectedTests,
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
