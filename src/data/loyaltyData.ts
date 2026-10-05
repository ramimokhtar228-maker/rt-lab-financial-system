import { PatientLoyaltyProfile } from '../types/lab';

export const INITIAL_LOYALTY_PROFILES: PatientLoyaltyProfile[] = [];

export const TIER_BENEFITS = {
  Silver: {
    minPoints: 0,
    maxPoints: 499,
    discountRate: 5,
    badgeBg: 'bg-slate-200 text-slate-800 border-slate-300',
    titleAr: 'المستوى الفضي (Silver)',
    description: 'خصم 5% على جميع التحاليل + أولوية استلام النتائج عبر الواتساب'
  },
  Gold: {
    minPoints: 500,
    maxPoints: 1499,
    discountRate: 10,
    badgeBg: 'bg-amber-100 text-amber-900 border-amber-300',
    titleAr: 'المستوى الذهبي (Gold)',
    description: 'خصم 10% دائم + سحب منزلي مجاني مرتين سنوياً + تقرير التطور البياني'
  },
  Platinum: {
    minPoints: 1500,
    maxPoints: 2999,
    discountRate: 15,
    badgeBg: 'bg-indigo-100 text-indigo-900 border-indigo-300',
    titleAr: 'المستوى البلاتيني (Platinum VIP)',
    description: 'خصم 15% دائم + سحب منزلي مجاني غير محدود + استشارة مع استشاري المعمل مجاناً'
  },
  VIP: {
    minPoints: 3000,
    maxPoints: Infinity,
    discountRate: 20,
    badgeBg: 'bg-gradient-to-r from-red-800 to-rose-700 text-white border-red-500',
    titleAr: 'نخبة الماس VIP (Diamond Elite)',
    description: 'خصم 20% دائم لك ولأفراد عائلتك من الدرجة الأولى + باقة فحص سنوي مجانية كبرى'
  }
};
