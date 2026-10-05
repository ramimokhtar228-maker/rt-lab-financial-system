import React, { useState } from 'react';
import { Patient, Gender, AgeUnit, DoctorTitle, PatientLoyaltyProfile } from '../types/lab';
import { 
  User, 
  Phone, 
  Calendar, 
  Clock, 
  Stethoscope, 
  Hash, 
  FileText,
  Building2,
  Home,
  MapPin,
  Tag,
  CreditCard,
  Award,
  Download,
  MessageCircle,
  Mail,
  Star,
  RefreshCw,
  CheckCircle2,
  Coins,
  Smartphone,
  Percent,
  Edit2
} from 'lucide-react';
import { 
  BRANCH_MAIN_ADDRESS, 
  INSTAPAY_IPA, 
  formatBookingConfirmationWhatsAppMessage, 
  formatPostSampleWhatsAppMessage, 
  openWhatsApp 
} from '../utils/whatsapp';
import { generateAndDownloadLoyaltyCard } from '../utils/loyaltyCardCanvas';
import { send24HourEmailReminder } from '../utils/emailReminder';

interface PatientFormProps {
  patient: Patient;
  onChange: (updated: Patient) => void;
  onRegisterLoyaltyProfile?: (profile: PatientLoyaltyProfile) => void;
}

export const PatientForm: React.FC<PatientFormProps> = ({ patient, onChange, onRegisterLoyaltyProfile }) => {
  const [couponInput, setCouponInput] = useState('');
  const [whatsAppSent, setWhatsAppSent] = useState(false);
  const [appliedCoupon, setAppliedCoupon] = useState<string | null>(patient.couponCode || null);
  const [customPercent, setCustomPercent] = useState<number>(15);
  const [customFlatDiscount, setCustomFlatDiscount] = useState<number>(0);
  const [customHomeFee, setCustomHomeFee] = useState<number>(70);
  const [rescheduleModalOpen, setRescheduleModalOpen] = useState(false);
  const [newDate, setNewDate] = useState(patient.appointmentDate || new Date().toISOString().split('T')[0]);
  const [newTime, setNewTime] = useState(patient.appointmentTime || '10:00 ص');

    const bookingType = patient.bookingType || 'branch';
  const effectiveHomeFee = bookingType === 'home_visit' ? customHomeFee : 0;
  const baseSubtotal = (patient.totalCost || 250) + effectiveHomeFee;

  const syncDiscount = (
    newType: Patient['discountType'],
    pct: number,
    flat: number,
    coupon: string | null = null,
    costOverride?: number,
    feeOverride?: number
  ) => {
    const cost = costOverride !== undefined ? costOverride : (patient.totalCost || 250);
    const fee = bookingType === 'home_visit' ? (feeOverride !== undefined ? feeOverride : customHomeFee) : 0;
    const currentBase = cost + fee;

    let disc = 0;
    if (coupon === 'RTLAB10') disc = Math.round(currentBase * 0.1);
    else if (coupon === 'BEHTEEM25') disc = Math.min(currentBase, 50);
    else if (coupon === 'HEALTH20') disc = Math.round(currentBase * 0.2);
    else if (coupon === 'VIP2026') disc = Math.round(currentBase * 0.25);
    else if (newType === 'percentage') disc = Math.round((currentBase * pct) / 100);
    else if (newType === 'daily_fixed') disc = Math.min(currentBase, flat > 0 ? flat : 60);
    else if (newType === 'package_bundle') disc = Math.min(currentBase, flat > 0 ? flat : 100);
    else if (newType === 'dynamic_lab') disc = Math.round((currentBase * (pct || 18)) / 100);
    else if (newType === 'none') disc = 0;

    onChange({
      ...patient,
      discountType: newType,
      discountApplied: disc,
      couponCode: coupon || undefined,
      ...(costOverride !== undefined ? { totalCost: costOverride } : {})
    });
  };

  const updateField = <K extends keyof Patient>(key: K, value: Patient[K]) => {
    onChange({
      ...patient,
      [key]: value
    });
  };

  // Calculate discount amount for display
  let discountAmount = patient.discountApplied !== undefined ? patient.discountApplied : 0;
  let discountLabel = 'بدون خصم';
  if (appliedCoupon === 'RTLAB10') {
    discountAmount = Math.round(baseSubtotal * 0.1);
    discountLabel = 'كوبون خصم 10% (RTLAB10)';
  } else if (appliedCoupon === 'BEHTEEM25') {
    discountAmount = Math.min(baseSubtotal, 50);
    discountLabel = 'كوبون بهتيم خصم 50 ج.م';
  } else if (appliedCoupon === 'HEALTH20') {
    discountAmount = Math.round(baseSubtotal * 0.2);
    discountLabel = 'كوبون صحتك 20% (HEALTH20)';
  } else if (appliedCoupon === 'VIP2026') {
    discountAmount = Math.round(baseSubtotal * 0.25);
    discountLabel = 'كوبون VIP خصم 25%';
  } else if (patient.discountType === 'percentage') {
    discountAmount = Math.round((baseSubtotal * customPercent) / 100);
    discountLabel = `خصم مئوي ${customPercent}%`;
  } else if (patient.discountType === 'daily_fixed') {
    discountAmount = Math.min(baseSubtotal, customFlatDiscount > 0 ? customFlatDiscount : 60);
    discountLabel = `خصم نقدي (${discountAmount} ج)`;
  } else if (patient.discountType === 'package_bundle') {
    discountAmount = Math.min(baseSubtotal, customFlatDiscount > 0 ? customFlatDiscount : 100);
    discountLabel = `خصم باقة ثابتة (${discountAmount} ج)`;
  } else if (patient.discountType === 'dynamic_lab') {
    discountAmount = Math.round((baseSubtotal * (customPercent || 18)) / 100);
    discountLabel = `عرض معمل متغير (${customPercent || 18}%)`;
  } else if (patient.discountType === 'none') {
    discountAmount = 0;
    discountLabel = 'بدون خصم';
  }

  const netAmount = Math.max(0, baseSubtotal - discountAmount);

  const handleApplyCoupon = () => {
    const code = couponInput.trim().toUpperCase();
    if (['RTLAB10', 'BEHTEEM25', 'HEALTH20', 'VIP2026'].includes(code)) {
      setAppliedCoupon(code);
      updateField('couponCode', code);
      updateField('discountApplied', discountAmount);
      alert(`تم تطبيق الكوبون (${code}) بنجاح!`);
    } else {
      alert('كود الكوبون غير صحيح. الكوبونات النشطة: RTLAB10, BEHTEEM25, HEALTH20, VIP2026');
    }
  };

  // WhatsApp booking confirmation
  const handleSendWhatsAppConfirmation = () => {
    const msg = formatBookingConfirmationWhatsAppMessage({
      patientName: patient.fullName || 'العميل الكريم',
      labNumber: patient.labNumber,
      date: patient.appointmentDate || patient.sampleDate.split('T')[0],
      time: patient.appointmentTime || '10:00 ص',
      isHomeVisit: bookingType === 'home_visit',
      address: patient.homeAddress,
      deliveryNotes: patient.deliveryNotes,
      testsList: patient.clinicalHistory || 'الفحوصات التشخيصية المسجلة',
      subtotal: baseSubtotal,
      discountAmount,
      discountLabel,
      netAmount,
      paymentMethod: patient.paymentMethod === 'card' ? 'بطاقة ائتمانية' : patient.paymentMethod === 'instapay' ? 'إنستا باي' : patient.paymentMethod === 'wallet' ? 'محفظة إلكترونية' : 'نقداً (كاش)'
    });
    openWhatsApp(patient.phone || '01000000000', msg);
    setWhatsAppSent(true);
  };

  // Post Sample Draw & Loyalty Activation
  const handleConfirmSampleDrawAndLoyalty = () => {
    const cardCode = patient.loyaltyCardNumber || `RT-GOLD-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
    const pts = Math.max(50, Math.floor(netAmount / 2));
    const nowIso = new Date().toISOString();

    // 1. ATOMIC single update so all fields are stored immediately in report state
    const updatedPatient: Patient = {
      ...patient,
      sampleCollected: true,
      sampleCollectedAt: nowIso,
      loyaltyCardIssued: true,
      loyaltyCardNumber: cardCode
    };
    onChange(updatedPatient);

    // 2. Register or update loyalty profile in system state & storage
    if (onRegisterLoyaltyProfile) {
      onRegisterLoyaltyProfile({
        patientId: patient.labNumber || patient.nationalId || `pat-${Date.now()}`,
        patientName: patient.fullName || 'مريض معمل RT',
        phone: patient.phone || '01000000000',
        cardNumber: cardCode,
        barcode: cardCode,
        bloodGroup: patient.bloodGroup || 'O+',
        tier: 'Gold',
        totalPoints: pts,
        lifetimeSpent: netAmount,
        issueDate: nowIso.substring(0, 10),
        transactions: [
          {
            id: `tx-${Date.now()}`,
            date: nowIso.substring(0, 10),
            type: 'earn',
            points: pts,
            description: `تفعيل كارت الولاء الذهبي - ملف #${patient.labNumber}`,
            invoiceNumber: patient.labNumber,
            amountEGP: netAmount
          }
        ]
      });
    }

    // 3. Generate & download card PNG
    generateAndDownloadLoyaltyCard({
      cardNumber: cardCode,
      patientName: patient.fullName || 'مريض معمل RT',
      patientPhone: patient.phone || '01000000000',
      tier: 'Gold VIP',
      discountPercentage: customPercent || 15,
      points: pts
    }).catch(err => console.warn('Card generation notice:', err));

    // 4. Send post sample WhatsApp
    const msg = formatPostSampleWhatsAppMessage({
      patientName: patient.fullName || 'العميل الكريم',
      labNumber: patient.labNumber,
      notes: patient.sampleNotes || 'تم سحب العينات بنجاح وأمان كامل',
      expectedTime: 'اليوم خلال 4 إلى 6 ساعات بإذن الله',
      loyaltyCardCode: cardCode,
      discountPercentage: customPercent || 15
    });
    openWhatsApp(patient.phone || '01000000000', msg);

    alert(`✅ تم تفعيل كارت الولاء (${cardCode}) بنجاح للمريض (${patient.fullName || 'المريض'})!
• تم إدراج العميل في سجل كروت الولاء
• تم تحميل صورة الكارت الفاخرة وإرسال رسالة الواتساب للعميل.`);
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 space-y-6">
      {/* Top Header */}
      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-rose-50 text-rose-800 flex items-center justify-center font-bold">
            <User className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900">بيانات المريض وحجز الموعد</h2>
            <p className="text-xs text-slate-500">حجز الفرع الرئيسي أو الزيارة المنزلية، التسعير، الخصومات المتعددة والدفع</p>
          </div>
        </div>

        {/* Lab number & Barcode badge */}
        <div className="flex items-center gap-2 text-xs">
          <div className="px-2.5 py-1 bg-slate-100 rounded-md text-slate-700 font-mono-numbers font-medium flex items-center gap-1 border border-slate-200">
            <Hash className="w-3.5 h-3.5 text-slate-400" />
            <span>رقم التحليل: <strong className="text-rose-900">{patient.labNumber}</strong></span>
          </div>
          <div className="px-2 py-1 bg-rose-50 text-rose-900 rounded-md font-mono-numbers font-semibold border border-rose-200">
            باركود: {patient.barcode}
          </div>
        </div>
      </div>

      {/* Row 1: Basic Demographics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Full Name */}
        <div className="lg:col-span-2">
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            اسم المريض ثلاثي / رباعي <span className="text-rose-600">*</span>
          </label>
          <input
            type="text"
            required
            placeholder="مثال: أحمد محمود علي إبراهيم"
            value={patient.fullName}
            onChange={(e) => updateField('fullName', e.target.value)}
            className="w-full text-sm font-semibold bg-slate-50 hover:bg-white focus:bg-white border border-slate-300 focus:border-rose-600 rounded-lg px-3 py-2 text-slate-900"
          />
        </div>

        {/* Age & Unit */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            العمر (Age) <span className="text-rose-600">*</span>
          </label>
          <div className="flex gap-2">
            <input
              type="number"
              min="0"
              max="130"
              value={patient.age || ''}
              onChange={(e) => updateField('age', parseInt(e.target.value) || 0)}
              className="w-20 text-sm font-bold font-mono-numbers bg-slate-50 hover:bg-white focus:bg-white border border-slate-300 focus:border-rose-600 rounded-lg px-3 py-2 text-slate-900"
            />
            <select
              value={patient.ageUnit}
              onChange={(e) => updateField('ageUnit', e.target.value as AgeUnit)}
              className="flex-1 text-xs font-semibold bg-slate-50 hover:bg-white focus:bg-white border border-slate-300 focus:border-rose-600 rounded-lg px-2 py-2 text-slate-800"
            >
              <option value="years">سنة (Years)</option>
              <option value="months">شهر (Months)</option>
              <option value="days">يوم (Days)</option>
            </select>
          </div>
        </div>

        {/* Gender Toggle */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            النوع (Gender) <span className="text-rose-600">*</span>
          </label>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => updateField('gender', 'male')}
              className={`py-2 px-3 text-xs font-bold rounded-lg border transition-all cursor-pointer ${
                patient.gender === 'male' ? 'bg-slate-900 text-white border-slate-900 shadow-sm' : 'bg-slate-50 text-slate-700 border-slate-200'
              }`}
            >
              ذكر (Male)
            </button>
            <button
              type="button"
              onClick={() => updateField('gender', 'female')}
              className={`py-2 px-3 text-xs font-bold rounded-lg border transition-all cursor-pointer ${
                patient.gender === 'female' ? 'bg-rose-800 text-white border-rose-800 shadow-sm' : 'bg-slate-50 text-slate-700 border-slate-200'
              }`}
            >
              أنثى (Female)
            </button>
          </div>
        </div>

        {/* WhatsApp Phone */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center justify-between">
            <span className="flex items-center gap-1">
              <Phone className="w-3.5 h-3.5 text-emerald-600" />
              رقم الهاتف (واتساب) <span className="text-rose-600">*</span>
            </span>
            <span className="text-[10px] text-slate-400">للتأكيد والنتائج</span>
          </label>
          <input
            type="tel"
            placeholder="010XXXXXXXX"
            value={patient.phone}
            onChange={(e) => updateField('phone', e.target.value)}
            className="w-full text-sm font-semibold font-mono-numbers bg-slate-50 hover:bg-white focus:bg-white border border-slate-300 focus:border-rose-600 rounded-lg px-3 py-2 text-slate-900 text-left"
            dir="ltr"
          />
        </div>

        {/* Fasting Hours */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1">
            <Clock className="w-3.5 h-3.5 text-slate-500" />
            ساعات الصيام (Fasting)
          </label>
          <input
            type="number"
            min="0"
            max="24"
            placeholder="مثال: 10 ساعات"
            value={patient.fastingHours !== undefined ? patient.fastingHours : ''}
            onChange={(e) => updateField('fastingHours', e.target.value ? parseInt(e.target.value) : undefined)}
            className="w-full text-sm font-mono-numbers bg-slate-50 hover:bg-white focus:bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-900"
          />
        </div>

        {/* Clinical History */}
        <div className="lg:col-span-2">
          <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1">
            <FileText className="w-3.5 h-3.5 text-slate-500" />
            ملاحظات إكلينيكية / الفحوصات المطلوبة
          </label>
          <input
            type="text"
            placeholder="مثال: متابعة علاج السكر، صورة دم كاملة، فحص شامل..."
            value={patient.clinicalHistory || ''}
            onChange={(e) => updateField('clinicalHistory', e.target.value)}
            className="w-full text-sm bg-slate-50 hover:bg-white focus:bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-900"
          />
        </div>
      </div>

      {/* Row 2: Branch vs Home Visit Selection */}
      <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
        <div className="flex items-center justify-between border-b border-slate-200 pb-2">
          <h3 className="font-bold text-xs text-slate-900 flex items-center gap-1.5">
            <Building2 className="w-4 h-4 text-rose-800" />
            <span>نوع الحجز ومقر سحب العينات (قابل للتعديل):</span>
          </h3>
          <span className="text-[11px] font-semibold text-slate-500">
            {bookingType === 'branch' ? 'حضور بالفرع الرئيسي' : 'زيارة منزلية خاصة'}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => { updateField('bookingType', 'branch'); syncDiscount(patient.discountType || 'percentage', customPercent, customFlatDiscount, appliedCoupon, undefined, 0); }}
            className={`p-3 rounded-xl border text-right transition-all flex items-start gap-2.5 cursor-pointer ${
              bookingType === 'branch' ? 'bg-rose-50 border-rose-700 ring-1 ring-rose-700' : 'bg-white border-slate-200'
            }`}
          >
            <Building2 className={`w-5 h-5 mt-0.5 ${bookingType === 'branch' ? 'text-rose-700' : 'text-slate-400'}`} />
            <div>
              <strong className="text-slate-900 block text-xs">حضور للفرع الرئيسي</strong>
              <span className="text-[11px] text-slate-500">ميدان بهتيم - شبرا الخيمة</span>
            </div>
          </button>

          <button
            type="button"
            onClick={() => { updateField('bookingType', 'home_visit'); syncDiscount(patient.discountType || 'percentage', customPercent, customFlatDiscount, appliedCoupon, undefined, customHomeFee); }}
            className={`p-3 rounded-xl border text-right transition-all flex items-start gap-2.5 cursor-pointer ${
              bookingType === 'home_visit' ? 'bg-rose-50 border-rose-700 ring-1 ring-rose-700' : 'bg-white border-slate-200'
            }`}
          >
            <Home className={`w-5 h-5 mt-0.5 ${bookingType === 'home_visit' ? 'text-rose-700' : 'text-slate-400'}`} />
            <div>
              <strong className="text-slate-900 block text-xs">زيارة منزلية خاصة (+{customHomeFee} ج.م)</strong>
              <span className="text-[11px] text-slate-500">أخصائي سحب معقم يصل لمنزلك</span>
            </div>
          </button>
        </div>

        {bookingType === 'branch' ? (
          <div className="bg-white p-3 rounded-lg border border-slate-200 flex items-center gap-2 text-slate-800 text-xs">
            <MapPin className="w-4 h-4 text-rose-700 shrink-0" />
            <span className="font-semibold leading-relaxed">
              عنوان الفرع الرئيسي لمعامل RT: {BRANCH_MAIN_ADDRESS}
            </span>
          </div>
        ) : (
          <div className="bg-white p-3 rounded-lg border border-slate-200 space-y-2 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <div className="sm:col-span-2">
                <label className="block font-bold text-slate-700 mb-1">العنوان بالتفصيل (الشارع، رقم العقار، الدور، الشقة)</label>
                <input
                  type="text"
                  value={patient.homeAddress || ''}
                  onChange={(e) => updateField('homeAddress', e.target.value)}
                  placeholder="مثال: شارع 15 مايو المتفرع من بهتيم، عمارة 12، الدور الرابع، شقة 8"
                  className="w-full px-2.5 py-1.5 border border-slate-300 rounded-md"
                />
              </div>
              <div>
                <label className="block font-bold text-slate-700 mb-1">رسوم الانتقال (ج.م) [قابل للتعديل]</label>
                <input
                  type="number"
                  min="0"
                  value={customHomeFee}
                  onChange={(e) => { const fee = Number(e.target.value) || 0; setCustomHomeFee(fee); syncDiscount(patient.discountType || 'percentage', customPercent, customFlatDiscount, appliedCoupon, undefined, fee); }}
                  className="w-full px-2.5 py-1.5 border border-slate-300 rounded-md font-bold font-mono text-rose-800"
                />
              </div>
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">ملاحظات إضافية حول التوصيل والمنطقة وحالة المريض</label>
              <input
                type="text"
                value={patient.deliveryNotes || ''}
                onChange={(e) => updateField('deliveryNotes', e.target.value)}
                placeholder="بجوار مسجد النور، الأسانسير معطل، أو المريض طفل..."
                className="w-full px-2.5 py-1.5 border border-slate-300 rounded-md"
              />
            </div>
          </div>
        )}
      </div>

      {/* Row 3: Appointment Schedule (Date & Time) */}
      <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
        <h3 className="font-bold text-xs text-slate-900 flex items-center gap-1.5 border-b border-slate-200 pb-2">
          <Calendar className="w-4 h-4 text-rose-800" />
          <span>تحديد اليوم والساعة (مواعيد الإدارة والأطباء):</span>
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          <div>
            <label className="block font-bold text-slate-700 mb-1">اليوم والتاريخ</label>
            <input
              type="date"
              value={patient.appointmentDate || patient.sampleDate.split('T')[0]}
              onChange={(e) => updateField('appointmentDate', e.target.value)}
              className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg font-mono"
            />
          </div>
          <div>
            <label className="block font-bold text-slate-700 mb-1">الساعة المحددة</label>
            <select
              value={patient.appointmentTime || '10:00 ص'}
              onChange={(e) => updateField('appointmentTime', e.target.value)}
              className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg font-bold"
            >
              {['08:30 ص', '09:00 ص', '09:30 ص', '10:00 ص', '10:30 ص', '11:00 ص', '12:00 م', '05:00 م', '06:00 م', '07:30 م', '09:00 م'].map(s => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Row 4: Pricing, Discounts & Payment Gateways */}
      <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-4">
        <h3 className="font-bold text-xs text-slate-900 flex items-center gap-1.5 border-b border-slate-200 pb-2">
          <CreditCard className="w-4 h-4 text-rose-800" />
          <span>اختيار نسب الخصم وإمكانية الإضافة والتعديل:</span>
        </h3>

        {/* Percentage Selection Buttons (User requested) */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-[11px] font-bold text-slate-800 flex items-center gap-1">
              <Percent className="w-3.5 h-3.5 text-rose-700" />
              <span>اختر نسبة الخصم المئوية (%):</span>
            </label>
            <span className="text-[10px] text-slate-500 font-mono">
              النسبة الفعالة: {patient.discountType === 'percentage' ? `${customPercent}%` : 'مخصصة'}
            </span>
          </div>
          <div className="flex items-center gap-1.5 flex-wrap">
            {[5, 10, 15, 20, 25, 30, 35, 40, 50].map((pct) => (
              <button
                key={pct}
                type="button"
                onClick={() => {
                  setCustomPercent(pct);
                  setAppliedCoupon(null);
                  syncDiscount('percentage', pct, customFlatDiscount, null);
                }}
                className={`px-2.5 py-1.5 rounded-lg font-bold font-mono text-xs cursor-pointer transition-all ${
                  patient.discountType === 'percentage' && customPercent === pct && !appliedCoupon
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
                onChange={(e) => {
                  const val = Number(e.target.value) || 0;
                  setCustomPercent(val);
                  setAppliedCoupon(null);
                  syncDiscount('percentage', val, customFlatDiscount, null);
                }}
                placeholder="مثال: 18%"
                className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg font-mono font-bold text-rose-900 text-xs"
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
                max={baseSubtotal}
                value={customFlatDiscount || ''}
                onChange={(e) => {
                  const val = Number(e.target.value) || 0;
                  setCustomFlatDiscount(val);
                  setAppliedCoupon(null);
                  syncDiscount('daily_fixed', customPercent, val, null);
                }}
                placeholder="مثال: 60 ج.م"
                className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg font-mono font-bold text-emerald-800 text-xs"
              />
              <span className="absolute left-3 top-1.5 text-slate-400 text-xs">ج.م</span>
            </div>
          </div>
        </div>

        {/* Preset modes */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
          <button
            type="button"
            onClick={() => {
              setAppliedCoupon(null);
              setCustomFlatDiscount(0);
              syncDiscount('none', customPercent, 0, null);
            }}
            className={`p-2 rounded-lg border text-center font-bold cursor-pointer ${
              patient.discountType === 'none' && !appliedCoupon ? 'bg-rose-900 text-white' : 'bg-white border-slate-200'
            }`}
          >
            بدون خصم
          </button>
          <button
            type="button"
            onClick={() => {
              setCustomFlatDiscount(60);
              setAppliedCoupon(null);
              syncDiscount('daily_fixed', customPercent, 60, null);
            }}
            className={`p-2 rounded-lg border text-center font-bold cursor-pointer ${
              patient.discountType === 'daily_fixed' ? 'bg-rose-900 text-white' : 'bg-white border-slate-200'
            }`}
          >
            عرض اليوم (60 ج)
          </button>
          <button
            type="button"
            onClick={() => {
              setCustomFlatDiscount(100);
              setAppliedCoupon(null);
              syncDiscount('package_bundle', customPercent, 100, null);
            }}
            className={`p-2 rounded-lg border text-center font-bold cursor-pointer ${
              patient.discountType === 'package_bundle' ? 'bg-rose-900 text-white' : 'bg-white border-slate-200'
            }`}
          >
            باقة ثابتة (100 ج)
          </button>
          <button
            type="button"
            onClick={() => {
              setCustomPercent(18);
              setAppliedCoupon(null);
              syncDiscount('dynamic_lab', 18, customFlatDiscount, null);
            }}
            className={`p-2 rounded-lg border text-center font-bold cursor-pointer ${
              patient.discountType === 'dynamic_lab' ? 'bg-rose-900 text-white' : 'bg-white border-slate-200'
            }`}
          >
            عرض معمل (18%)
          </button>
        </div>

        {/* Coupon Code Input */}
        <div className="flex gap-2">
          <input
            type="text"
            value={couponInput}
            onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
            placeholder="كود الكوبون مثل RTLAB10 أو BEHTEEM25 أو VIP2026"
            className="flex-1 px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-mono uppercase"
          />
          <button
            type="button"
            onClick={handleApplyCoupon}
            className="px-4 py-1.5 bg-slate-900 text-white text-xs font-bold rounded-lg cursor-pointer hover:bg-slate-800"
          >
            تفعيل الكوبون
          </button>
        </div>

        {/* Payment Methods */}
        <div>
          <label className="block text-[11px] font-bold text-slate-700 mb-1.5">طريقة السداد:</label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
            <button
              type="button"
              onClick={() => updateField('paymentMethod', 'cash')}
              className={`p-2 rounded-lg border font-bold cursor-pointer ${
                patient.paymentMethod === 'cash' ? 'bg-rose-900 text-white border-rose-950' : 'bg-white border-slate-200'
              }`}
            >
              نقداً (كاش)
            </button>
            <button
              type="button"
              onClick={() => updateField('paymentMethod', 'card')}
              className={`p-2 rounded-lg border font-bold cursor-pointer ${
                patient.paymentMethod === 'card' ? 'bg-rose-900 text-white border-rose-950' : 'bg-white border-slate-200'
              }`}
            >
              بطاقة ائتمانية
            </button>
            <button
              type="button"
              onClick={() => updateField('paymentMethod', 'instapay')}
              className={`p-2 rounded-lg border font-bold cursor-pointer ${
                patient.paymentMethod === 'instapay' ? 'bg-rose-900 text-white border-rose-950' : 'bg-white border-slate-200'
              }`}
            >
              إنستا باي ({INSTAPAY_IPA})
            </button>
            <button
              type="button"
              onClick={() => updateField('paymentMethod', 'wallet')}
              className={`p-2 rounded-lg border font-bold cursor-pointer ${
                patient.paymentMethod === 'wallet' ? 'bg-rose-900 text-white border-rose-950' : 'bg-white border-slate-200'
              }`}
            >
              محفظة إلكترونية
            </button>
          </div>
        </div>

        {/* Pricing Summary Card (Fully editable base) */}
        <div className="bg-white p-3.5 rounded-xl border border-slate-200 grid grid-cols-3 gap-3 text-center text-xs">
          <div>
            <label className="text-slate-500 block">تكلفة الفحوصات (ج.م) [تعديل]:</label>
            <input
              type="number"
              min="0"
              value={patient.totalCost || 250}
              onChange={(e) => { const val = Number(e.target.value) || 0; syncDiscount(patient.discountType || 'percentage', customPercent, customFlatDiscount, appliedCoupon, val); }}
              className="w-24 text-center mx-auto px-1 py-0.5 border border-slate-300 rounded font-bold font-mono text-sm"
            />
          </div>
          <div>
            <span className="text-slate-500 block">الخصم المطبق:</span>
            <strong className="text-sm font-black font-mono text-rose-700">-{discountAmount} ج.م</strong>
          </div>
          <div>
            <span className="text-slate-500 block">الصافي المطلوب:</span>
            <strong className="text-base font-black font-mono text-emerald-700">{netAmount} ج.م</strong>
          </div>
        </div>
      </div>

      {/* Row 5: Action Toolbar (WhatsApp Confirmation, Reschedule, Email, Confirm Draw & Loyalty Card) */}
      <div className="bg-emerald-50/70 p-4 rounded-xl border border-emerald-200 space-y-3">
        <div className="flex items-center justify-between border-b border-emerald-200 pb-2">
          <h3 className="font-bold text-xs text-emerald-950 flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-700" />
            <span>إجراءات التواصل، تأكيد الحجز، وتفعيل كارت الولاء:</span>
          </h3>
          {patient.loyaltyCardIssued && (
            <span className="text-[10px] font-bold bg-amber-100 text-amber-900 border border-amber-300 px-2 py-0.5 rounded-md font-mono">
              كارت الولاء مفعل: {patient.loyaltyCardNumber}
            </span>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* WhatsApp Booking Confirmation */}
          <button
            type="button"
            onClick={handleSendWhatsAppConfirmation}
            className="px-3.5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
          >
            <MessageCircle className="w-4 h-4" />
            <span>{whatsAppSent ? 'تم إرسال واتساب تأكيد الحجز للمريض ✓' : 'إرسال واتساب تأكيد الحجز للمريض'}</span>
          </button>

          {/* 24-Hour Email Reminder */}
          <button
            type="button"
            onClick={() => {
              send24HourEmailReminder({
                patientEmail: patient.emergencyContact || 'ramirtlab1@gmail.com',
                patientName: patient.fullName,
                bookingNumber: patient.labNumber,
                date: patient.appointmentDate || patient.sampleDate.split('T')[0],
                time: patient.appointmentTime || '10:00 ص',
                isHomeVisit: bookingType === 'home_visit',
                address: patient.homeAddress,
                tests: [{ nameAr: patient.clinicalHistory || 'الفحوصات التشخيصية' }],
                netAmount
              });
            }}
            className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <Mail className="w-4 h-4" />
            <span>إرسال بريد تذكيري (24 ساعة)</span>
          </button>

          {/* Reschedule Button */}
          <button
            type="button"
            onClick={() => setRescheduleModalOpen(true)}
            className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <RefreshCw className="w-4 h-4 text-slate-600" />
            <span>إعادة جدولة الموعد</span>
          </button>

          {/* Post Sample Draw & Loyalty Card Button */}
          <button
            type="button"
            onClick={handleConfirmSampleDrawAndLoyalty}
            className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs mr-auto"
          >
            <Award className="w-4 h-4" />
            <span>تأكيد سحب العينة وتفعيل كارت الولاء (PNG)</span>
          </button>
        </div>
      </div>

      {/* Reschedule Modal */}
      {rescheduleModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-5 space-y-3 border border-slate-200 shadow-xl">
            <h4 className="font-bold text-slate-900 text-sm">إعادة جدولة الموعد للمريض: {patient.fullName}</h4>
            <div className="space-y-2 text-xs">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">اليوم الجديد</label>
                <input
                  type="date"
                  value={newDate}
                  onChange={(e) => setNewDate(e.target.value)}
                  className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg font-mono"
                />
              </div>
              <div>
                <label className="block text-slate-700 font-semibold mb-1">الساعة الجديدة</label>
                <select
                  value={newTime}
                  onChange={(e) => setNewTime(e.target.value)}
                  className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg font-bold"
                >
                  {['08:30 ص', '09:00 ص', '10:00 ص', '11:30 ص', '05:00 م', '07:00 م', '08:30 م'].map(s => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => {
                  updateField('appointmentDate', newDate);
                  updateField('appointmentTime', newTime);
                  setRescheduleModalOpen(false);
                  alert(`تم تحديث الموعد إلى ${newDate} (${newTime}) بنجاح!`);
                }}
                className="flex-1 py-2 bg-emerald-700 text-white rounded-lg text-xs font-bold cursor-pointer"
              >
                تأكيد الجدولة
              </button>
              <button
                type="button"
                onClick={() => setRescheduleModalOpen(false)}
                className="py-2 px-3 bg-slate-100 text-slate-700 rounded-lg text-xs font-semibold cursor-pointer"
              >
                إلغاء
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
