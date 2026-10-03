export const BRANCH_MAIN_ADDRESS = 'ميدان بهتيم برج صيدليه العزبى الدور الثالث امام الأسانسير شبرا الخيمه';
export const LAB_NAME_AR = 'معامل RT للتحاليل الطبية والتشخيصية';
export const LAB_PHONE = '01012345678';
export const INSTAPAY_IPA = 'ramirtlab@instapay';
export const WALLET_VODAFONE = '01098765432';

export function formatEgyptianPhoneForWhatsApp(phone: string): string {
  let cleaned = phone.replace(/[^0-9]/g, '');
  if (cleaned.startsWith('002')) cleaned = cleaned.substring(2);
  if (cleaned.startsWith('01')) cleaned = '2' + cleaned;
  if (!cleaned.startsWith('20') && cleaned.startsWith('1')) cleaned = '20' + cleaned;
  return cleaned;
}

export function openWhatsAppChat(phone: string, text: string): void {
  const intlPhone = formatEgyptianPhoneForWhatsApp(phone);
  const url = `https://wa.me/${intlPhone}?text=${encodeURIComponent(text)}`;
  window.open(url, '_blank');
}

export function generateBookingWhatsAppMessage(params: {
  patientName: string;
  bookingNumber: string;
  date: string;
  time: string;
  isHomeVisit: boolean;
  address?: string;
  deliveryNotes?: string;
  branchName?: string;
  branchAddress?: string;
  branchPhone?: string;
  labNameAr?: string;
  visitFee?: number;
  visitSpecialist?: string;
  tests: { nameAr: string; price: number }[];
  subtotal: number;
  testsSubtotal?: number;
  discountAmount: number;
  discountLabel: string;
  netAmount: number;
  paymentMethod: string;
}): string {
  const testsList = params.tests.map((t, idx) => `  ${idx + 1}. ${t.nameAr} (${t.price} ج.م)`).join('\n');
  
  const loc = params.isHomeVisit
    ? `🏠 *نوع الحجز: زيارة منزلية خاصة*\n📍 *العنوان:* ${params.address || 'العنوان بالتفصيل مسجل لدى المعمل'}${params.visitSpecialist ? `\n🩺 *المسؤول عن الزيارة:* ${params.visitSpecialist}` : ''}\n📝 *ملاحظات التوصيل:* ${params.deliveryNotes || 'لا توجد ملاحظات خاصة'}`
    : `📍 *المقر:* ${params.branchName || 'الفرع الرئيسي لمعامل RT'}\n🏢 *العنوان:* ${params.branchAddress || BRANCH_MAIN_ADDRESS}\n📞 *هاتف الفرع:* ${params.branchPhone || LAB_PHONE}`;

  const visitFeeText = (params.visitFee && params.visitFee > 0)
    ? `• *رسوم الزيارة المنزلية المستقلة:* +${params.visitFee} ج.م (ثابتة وغير خاضعة للخصم)\n`
    : '';

  const labTitle = params.labNameAr || LAB_NAME_AR;

  return `*مرحباً بك في ${labTitle}* 🔬✨
تم تأكيد حجز موعد التحاليل الطبية الخاص بكم بنجاح!

📋 *بيانات الحجز:*
• *رقم الحجز:* #${params.bookingNumber}
• *اسم المريض:* ${params.patientName}
• *اليوم والتاريخ:* ${params.date}
• *الساعة المحددة:* ${params.time}
${loc}

🧪 *الفحوصات المطلوبة:*
${testsList}

💰 *تفاصيل التسعير والفوترة:*
• *إجمالي التحاليل قبل الخصم:* ${params.testsSubtotal || params.subtotal} ج.م
• *قيمة الخصم المطبق على التحاليل:* ${params.discountLabel} (-${params.discountAmount} ج.م)
${visitFeeText}• *المبلغ الصافي المطلوب سداده:* *${params.netAmount} ج.م*
• *طريقة الدفع:* ${params.paymentMethod}

⚠️ *تعليمات هامة:* يرجى الصيام في حال طلبت التحاليل ذلك (يسمح بشرب الماء فقط).
🎁 *ملاحظة:* بعد سحب العينة سيتم تفعيل كارت الولاء RT بنسبة خصم دائمة ونقاط تراكمية على الفحوصات الطبية!
📞 *لأي استفسار أو تعديل الموعد:* ${params.branchPhone || LAB_PHONE}

نسعد دائماً بخدمتكم وتمنياتنا لكم بالصحة والعافية! ❤️`;
}

export function generatePostSampleWhatsAppMessage(params: {
  patientName: string;
  bookingNumber: string;
  notes?: string;
  expectedTime?: string;
  loyaltyCardCode?: string;
  discountPercentage?: number;
  labNameAr?: string;
  branchPhone?: string;
}): string {
  const loyaltyPart = params.loyaltyCardCode ? `\n💳 *تم تفعيل كارت الولاء RT الخاص بكم بنجاح:*
• *رقم الكارت:* ${params.loyaltyCardCode}
• *نسبة الخصم الدائمة:* ${params.discountPercentage || 15}%
يمكنكم إبراز كارت الولاء في الزيارات القادمة للحصول على الخصم الفوري.` : '';

  const labTitle = params.labNameAr || LAB_NAME_AR;

  return `*${labTitle}* 🔬🩺
عزيزنا المريض: *${params.patientName}*
✅ *تم سحب واستلام عيناتكم الطبية بنجاح.*

• *رقم الإيصال:* #${params.bookingNumber}
• *تاريخ ووقت السحب:* ${new Date().toLocaleString('ar-EG')}
${params.notes ? `• *ملاحظات العينة:* ${params.notes}\n` : ''}• *الموعد المتوقع لصدور النتيجة المعتمدة:* ${params.expectedTime || 'خلال ساعات قليلة اليوم بإذن الله'}

سيصلكم إشعار ورابط النتيجة فور اعتمادها من استشاري التحاليل الطبية.${loyaltyPart}

⭐ *تقييمكم يهمنا:* يسعدنا تقييم تجربتكم اليوم لمساعدتنا على تقديم أفضل رعاية طبية دائماً.
مع أطيب تمنيات معامل RT لكم بالشفاء العاجل! 🌹`;
}
