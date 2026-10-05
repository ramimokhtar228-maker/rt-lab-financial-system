import { BRANCH_MAIN_ADDRESS, LAB_NAME_AR, LAB_PHONE } from './whatsapp';

export function send24HourEmailReminder(params: {
  patientEmail: string;
  patientName: string;
  bookingNumber: string;
  date: string;
  time: string;
  isHomeVisit: boolean;
  address?: string;
  tests: { nameAr: string }[];
  netAmount: number;
}): void {
  const loc = params.isHomeVisit
    ? `زيارة منزلية خاصة: ${params.address || 'العنوان المسجل'}`
    : `الفرع الرئيسي لمعامل RT: ${BRANCH_MAIN_ADDRESS}`;

  const testsList = params.tests.map(t => t.nameAr).join('، ');

  const subject = `[تذكير قبل 24 ساعة] موعد تحاليلك الطبية غداً في ${LAB_NAME_AR}`;
  const body = `أهلاً بك أ/ ${params.patientName}،

نذكركم بموعد الفحص والتحاليل الطبية المحجوز غداً لضمان حضوركم وتيسير تقديم الخدمة:
• رقم الحجز: #${params.bookingNumber}
• الموعد: ${params.date} (${params.time})
• المقر: ${loc}
• الفحوصات: ${testsList}
• المبلغ المطلوب: ${params.netAmount} ج.م

لأي تعديل أو استفسار يرجى التواصل معنا على: ${LAB_PHONE}
مع أطيب تمنيات ${LAB_NAME_AR} لكم بموفور الصحة!`;

  const mailto = `mailto:${encodeURIComponent(params.patientEmail || 'ramirtlab1@gmail.com')}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  window.location.href = mailto;
}
