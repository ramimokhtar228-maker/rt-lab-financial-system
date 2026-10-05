import { LabReport } from '../types/lab';

export function formatWhatsAppMessage(report: LabReport): string {
  const p = report.patient;
  const profilesList = report.profiles.map(pr => `• ${pr.titleEn} (${pr.titleAr})`).join('\n');
  const dateFormatted = new Date(p.sampleDate).toLocaleDateString('ar-EG', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  const referringDr = p.referringDoctorTitle === 'Herself' || p.referringDoctorTitle === 'Himself'
    ? 'طلب فحص ذاتي (Self-Request)'
    : `${p.referringDoctorTitle} ${p.referringDoctorName}`.trim();

  return `🔬 *معامل RT للتحاليل التشخيصية*
*معامل رامي مختار*
*أطباء الباثولوجيا الإكلينيكية والكيميائية - كلية طب قصر العيني*
────────────────────
سعادة المريض/ة: *${p.fullName}*
رقم الملف / الباركود: *${p.labNumber}*
تاريخ سحب العينة: ${dateFormatted}
الطبيب المعالج: ${referringDr}

📋 *الفحوصات الطبية المنجزة:*
${profilesList}

حالة التقرير: *معتمد ومدقق رسمياً* ✅
إشراف: *${report.staff.pathologist}*
مراجعة: ${report.staff.verifiedBy}

📎 يسعدنا إبلاغكم بجاهزية نتائج تحاليلكم الطبية.
يمكنكم استلام النسخة الورقية المعتمدة من فرع المعمل، أو طلب إرسال النسخة الرقمية (PDF) مباشرة عبر هذه المحادثة.

مع تمنيات أسرة *معامل RT* لكم بموفور الصحة والعافية. 🌸
📞 هاتف المعمل: 01000000000
📍 العنوان: كلية طب قصر العيني - القاهرة`;
}

export function openWhatsApp(phone: string, message: string): void {
  // Clean phone number: remove spaces, dashes, parentheses
  let cleaned = phone.replace(/[^0-9]/g, '');

  // If local Egyptian number starting with 01, prepend 20
  if (cleaned.startsWith('01') && cleaned.length === 11) {
    cleaned = '20' + cleaned.substring(1);
  } else if (!cleaned.startsWith('20') && cleaned.length === 10 && cleaned.startsWith('1')) {
    cleaned = '20' + cleaned;
  }

  const encoded = encodeURIComponent(message);
  const url = `https://wa.me/${cleaned}?text=${encoded}`;
  window.open(url, '_blank');
}

export const BRANCH_MAIN_ADDRESS = 'ميدان بهتيم برج صيدليه العزبى الدور الثالث امام الأسانسير شبرا الخيمه';
export const LAB_NAME_AR = 'معامل RT للتحاليل الطبية والتشخيصية';
export const LAB_PHONE = '01012345678';
export const INSTAPAY_IPA = 'ramirtlab@instapay';

export function formatBookingConfirmationWhatsAppMessage(params: {
  patientName: string;
  labNumber: string;
  date: string;
  time: string;
  isHomeVisit: boolean;
  address?: string;
  deliveryNotes?: string;
  testsList: string;
  subtotal: number;
  discountAmount: number;
  discountLabel: string;
  netAmount: number;
  paymentMethod: string;
}): string {
  const loc = params.isHomeVisit
    ? `🏠 *نوع الحجز: زيارة منزلية خاصة*\n📍 *العنوان:* ${params.address || 'العنوان المسجل'}\n📝 *ملاحظات التوصيل:* ${params.deliveryNotes || 'لا توجد ملاحظات خاصة'}`
    : `📍 *المقر: الفرع الرئيسي لمعامل RT*\n🏢 *العنوان:* ${BRANCH_MAIN_ADDRESS}`;

  return `*مرحباً بك في ${LAB_NAME_AR}* 🔬✨
تم تأكيد حجز موعد التحاليل الطبية الخاص بكم بنجاح!

📋 *بيانات الحجز:*
• *رقم الملف / الحجز:* #${params.labNumber}
• *اسم المريض:* ${params.patientName}
• *اليوم والتاريخ:* ${params.date}
• *الساعة المحددة:* ${params.time}

${loc}

🧪 *الفحوصات المطلوبة:*
${params.testsList}

💰 *تفاصيل التسعير والحساب:*
• *الإجمالي قبل الخصم:* ${params.subtotal} ج.م
• *قيمة الخصم المطبق:* ${params.discountLabel} (-${params.discountAmount} ج.م)
• *المبلغ الصافي المطلوب:* *${params.netAmount} ج.م*
• *طريقة الدفع:* ${params.paymentMethod}

⚠️ *تنبيه الصيام:* يرجى الصيام في حال طلبت الفحوصات ذلك (شرب الماء مسموح).
🎁 *ملاحظة:* بعد سحب العينة سيتم تفعيل كارت الولاء RT بنسبة خصم دائمة ونقاط تراكمية!

📞 *لأي استفسار أو تعديل الموعد:* ${LAB_PHONE}
مع تمنياتنا لكم بدوام الصحة والعافية! ❤️`;
}

export function formatPostSampleWhatsAppMessage(params: {
  patientName: string;
  labNumber: string;
  notes?: string;
  expectedTime?: string;
  loyaltyCardCode?: string;
  discountPercentage?: number;
}): string {
  const loyaltyPart = params.loyaltyCardCode ? `
💳 *تم تفعيل كارت الولاء RT الخاص بكم بنجاح:*
• *رقم الكارت:* ${params.loyaltyCardCode}
• *نسبة الخصم الدائمة:* ${params.discountPercentage || 15}%
يمكنكم إبراز الكارت في زياراتكم القادمة للحصول على الخصم الفوري.` : '';

  return `*معامل RT للتحاليل الطبية والتشخيصية* 🔬🩺
عزيزنا المريض: *${params.patientName}*

✅ *تم سحب واستلام عيناتكم الطبية بنجاح.*
• *رقم الملف:* #${params.labNumber}
• *تاريخ ووقت السحب:* ${new Date().toLocaleString('ar-EG')}
${params.notes ? `• *ملاحظات العينة:* ${params.notes}\n` : ''}• *الموعد المتوقع لصدور النتيجة المعتمدة:* ${params.expectedTime || 'خلال ساعات قليلة اليوم بإذن الله'}

نعمل بأعلى معايير الدقة المعملية الدولية لضمان أصح النتائج. سيصلكم إشعار بالنتيجة فور اعتمادها.
${loyaltyPart}

⭐ *تقييمكم يهمنا:* يسعدنا تقييم تجربتكم اليوم لمساعدتنا على تقديم أفضل رعاية طبية دائماً.
مع أطيب تمنيات معامل RT لكم بالشفاء التام! 🌹`;
}
