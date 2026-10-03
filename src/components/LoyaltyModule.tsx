import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { PatientLoyaltyProfile, LoyaltyTier, LoyaltyTransaction, LoyaltyConfig } from '../types';
import { RTLogo } from './RTLogo';
import {
  CreditCard,
  Award,
  Plus,
  Search,
  Gift,
  TrendingUp,
  Printer,
  Sparkles,
  Clock,
  ArrowUpRight,
  ArrowDownLeft,
  Sliders,
  Calculator,
  DollarSign,
  Percent,
  RefreshCw,
  HeartPulse,
  Phone
} from 'lucide-react';

const TIER_BENEFITS: Record<LoyaltyTier, { titleAr: string; badgeBg: string; description: string }> = {
  Silver: {
    titleAr: 'المستوى الفضي (Silver)',
    badgeBg: 'bg-slate-200 text-slate-800 border-slate-300',
    description: 'أولوية استلام النتائج عبر الواتساب'
  },
  Gold: {
    titleAr: 'المستوى الذهبي (Gold)',
    badgeBg: 'bg-amber-100 text-amber-900 border-amber-300',
    description: 'سحب منزلي مجاني مرتين سنوياً + تقرير التطور البياني'
  },
  Platinum: {
    titleAr: 'المستوى البلاتيني (Platinum)',
    badgeBg: 'bg-indigo-100 text-indigo-900 border-indigo-300',
    description: 'سحب منزلي مجاني غير محدود + استشارة طبية مع استشاري المعمل'
  },
  VIP: {
    titleAr: 'نخبة الماس VIP (Diamond Elite)',
    badgeBg: 'bg-gradient-to-r from-red-800 to-rose-700 text-white border-red-500',
    description: 'خصم لك ولأفراد عائلتك من الدرجة الأولى + باقة فحص سنوي مجانية'
  }
};

export const LoyaltyModule: React.FC = () => {
  const {
    loyaltyProfiles,
    loyaltyConfig,
    updateLoyaltyConfig,
    addLoyaltyProfile,
    addLoyaltyPoints,
    redeemLoyaltyPoints,
    calculatePointsForAmount,
    calculateCashForPoints,
    language
  } = useApp();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProfileId, setSelectedProfileId] = useState<string>(loyaltyProfiles[0]?.patientId || '');
  const [cardSide, setCardSide] = useState<'front' | 'back'>('front');

  // Config modal
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [tempConfig, setTempConfig] = useState<LoyaltyConfig>(loyaltyConfig);

  // Add points modal
  const [isAddPointsOpen, setIsAddPointsOpen] = useState(false);
  const [addMode, setAddMode] = useState<'by_cash' | 'direct'>('by_cash');
  const [cashAmountForPoints, setCashAmountForPoints] = useState<number>(500);
  const [directPoints, setDirectPoints] = useState<number>(100);
  const [pointsDescription, setPointsDescription] = useState('نقاط سداد فاتورة تحاليل');

  // Redeem points modal
  const [isRedeemOpen, setIsRedeemOpen] = useState(false);
  const [pointsToRedeem, setPointsToRedeem] = useState<number>(100);

  // New card modal
  const [isNewCardModalOpen, setIsNewCardModalOpen] = useState(false);
  const [newCardName, setNewCardName] = useState('');
  const [newCardPhone, setNewCardPhone] = useState('');
  const [newCardBlood, setNewCardBlood] = useState('O+');
  const [newCardEmergency, setNewCardEmergency] = useState('');
  const [newCardCondition, setNewCardCondition] = useState('');

  const filteredProfiles = loyaltyProfiles.filter(p =>
    p.patientName.includes(searchTerm) ||
    p.phone.includes(searchTerm) ||
    p.barcode.includes(searchTerm)
  );

  const activeProfile = loyaltyProfiles.find(p => p.patientId === selectedProfileId) || loyaltyProfiles[0];
  const tierInfo = activeProfile ? TIER_BENEFITS[activeProfile.tier] : TIER_BENEFITS.Silver;
  const currentDiscount = activeProfile ? loyaltyConfig.tiers[activeProfile.tier]?.discountRate : 5;

  const handleSaveConfig = () => {
    updateLoyaltyConfig(tempConfig);
    setIsSettingsOpen(false);
  };

  const handleAddPointsSubmit = () => {
    if (!activeProfile) return;
    const pts = addMode === 'by_cash' ? calculatePointsForAmount(cashAmountForPoints) : directPoints;
    if (pts <= 0) return;
    const desc = addMode === 'by_cash'
      ? `اكتساب نقاط عن سداد فاتورة بقيمة ${cashAmountForPoints} ج.م`
      : pointsDescription.trim();
    addLoyaltyPoints(activeProfile.patientId, pts, desc, undefined, addMode === 'by_cash' ? cashAmountForPoints : undefined);
    setIsAddPointsOpen(false);
  };

  const handleRedeemSubmit = () => {
    if (!activeProfile || pointsToRedeem <= 0 || pointsToRedeem > activeProfile.totalPoints) return;
    redeemLoyaltyPoints(activeProfile.patientId, pointsToRedeem);
    setIsRedeemOpen(false);
  };

  const handleCreateNewCard = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCardName.trim()) return;

    const generatedBarcode = Math.floor(1000000000 + Math.random() * 9000000000).toString();
    const newProfile: PatientLoyaltyProfile = {
      patientId: `pat-${Date.now()}`,
      patientName: newCardName.trim(),
      phone: newCardPhone.trim() || '—',
      barcode: generatedBarcode,
      bloodGroup: newCardBlood,
      totalPoints: 100, // Welcome bonus
      tier: 'Silver',
      lifetimeSpent: 0,
      emergencyContact: newCardEmergency.trim() || undefined,
      chronicConditions: newCardCondition.trim() ? [newCardCondition.trim()] : [],
      issueDate: new Date().toISOString().substring(0, 10),
      transactions: [
        {
          id: `tx-welcome-${Date.now()}`,
          date: new Date().toISOString().substring(0, 10),
          type: 'bonus',
          points: 100,
          description: 'هدية ترحيبية فورية بمناسبة إصدار كرت المريض الذكي'
        }
      ]
    };

    addLoyaltyProfile(newProfile);
    setSelectedProfileId(newProfile.patientId);
    setIsNewCardModalOpen(false);
    setNewCardName('');
    setNewCardPhone('');
    setNewCardEmergency('');
    setNewCardCondition('');
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Top Banner & Context */}
      <div className="bg-gradient-to-r from-slate-950 via-[#4c0519] to-[#0f172a] text-white rounded-2xl p-6 shadow-xl border border-rose-900/40 relative overflow-hidden">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 relative z-10">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-rose-950/80 rounded-2xl border border-rose-500/40 shadow-inner">
              <CreditCard className="w-8 h-8 text-rose-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-extrabold bg-rose-500/20 text-rose-300 border border-rose-500/40 flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                  RT Loyalty Club & Patient Cards
                </span>
                <span className="text-xs text-rose-300/60 hidden sm:inline">|</span>
                <span className="text-xs text-rose-200 hidden sm:inline">معامل رامي مختار · أطباء كلية طب قصر العيني</span>
              </div>
              <h1 className="text-xl sm:text-2xl font-black text-white mt-1">
                كروت المرضى الذكية ونظام نقاط الولاء والخصومات
              </h1>
              <p className="text-xs text-rose-100/70 mt-1 max-w-2xl">
                إدارة بطاقات المرضى الطبية، حساب واكتساب النقاط عند استلام الأموال، استبدال النقاط بخصومات نقدية، وتعديل نسب خصم الفئات
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={() => {
                setTempConfig(loyaltyConfig);
                setIsSettingsOpen(true);
              }}
              className="flex items-center gap-2 px-3.5 py-2.5 bg-slate-800/90 hover:bg-slate-700 text-amber-300 border border-amber-500/40 text-xs font-bold rounded-xl transition-all shadow-sm active:scale-95"
            >
              <Sliders className="w-4 h-4 text-amber-400" />
              <span>إعدادات النقاط ونسب الخصم</span>
            </button>

            <button
              onClick={() => setIsNewCardModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-rose-700 to-red-600 hover:from-rose-600 hover:to-red-500 text-white text-xs font-extrabold rounded-xl transition-all shadow-lg shadow-rose-950/50 active:scale-95"
            >
              <Plus className="w-4 h-4" />
              <span>إصدار كرت جديد</span>
            </button>
          </div>
        </div>

        {/* Dynamic Conversion Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mt-5 pt-4 border-t border-rose-900/60 text-xs text-rose-100">
          <div className="bg-slate-900/60 p-2.5 rounded-xl border border-rose-900/40">
            <div className="text-[10px] text-rose-300">معدل كسب النقاط:</div>
            <div className="font-bold text-white mt-0.5">
              كل 1 ج.م = <span className="text-amber-400 font-mono">{loyaltyConfig.pointsPerEGP}</span> نقطة
            </div>
          </div>
          <div className="bg-slate-900/60 p-2.5 rounded-xl border border-rose-900/40">
            <div className="text-[10px] text-rose-300">قيمة استبدال النقود:</div>
            <div className="font-bold text-white mt-0.5">
              كل 100 نقطة = <span className="text-emerald-400 font-mono">{loyaltyConfig.egpPer100Points}</span> ج.م خصم
            </div>
          </div>
          <div className="bg-slate-900/60 p-2.5 rounded-xl border border-rose-900/40">
            <div className="text-[10px] text-rose-300">خصم الفضي والذهبي:</div>
            <div className="font-bold text-white mt-0.5">
              فضي <span className="text-slate-300 font-mono">{loyaltyConfig.tiers.Silver.discountRate}%</span> | ذهبي <span className="text-amber-400 font-mono">{loyaltyConfig.tiers.Gold.discountRate}%</span>
            </div>
          </div>
          <div className="bg-slate-900/60 p-2.5 rounded-xl border border-rose-900/40">
            <div className="text-[10px] text-rose-300">خصم البلاتيني والـ VIP:</div>
            <div className="font-bold text-white mt-0.5">
              بلاتيني <span className="text-indigo-300 font-mono">{loyaltyConfig.tiers.Platinum.discountRate}%</span> | VIP <span className="text-rose-400 font-mono">{loyaltyConfig.tiers.VIP.discountRate}%</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Grid: Patients List & Card View */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left / Patients List Column */}
        <div className="lg:col-span-4 space-y-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 space-y-3">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute right-3 top-3 pointer-events-none" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="بحث بالاسم أو الهاتف أو الباركود..."
                className="w-full pr-9 pl-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-rose-500 focus:outline-none"
              />
            </div>

            <div className="text-[11px] font-bold text-slate-400 px-1">
              المرضى المسجلين بالولاء ({filteredProfiles.length})
            </div>

            <div className="max-h-[500px] overflow-y-auto space-y-2 pr-1 divide-y divide-slate-100">
              {filteredProfiles.length === 0 ? (
                <div className="py-8 text-center text-xs text-slate-400">
                  لا توجد كروت مطابقة
                </div>
              ) : (
                filteredProfiles.map((p) => {
                  const isSelected = p.patientId === activeProfile?.patientId;
                  const discountRate = loyaltyConfig.tiers[p.tier]?.discountRate || 5;
                  return (
                    <div
                      key={p.patientId}
                      onClick={() => setSelectedProfileId(p.patientId)}
                      className={`pt-2 p-2.5 rounded-xl cursor-pointer transition-all ${
                        isSelected
                          ? 'bg-rose-50 border-2 border-rose-700 shadow-xs'
                          : 'hover:bg-slate-50 border border-transparent'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="font-extrabold text-xs text-slate-900">
                          {p.patientName}
                        </div>
                        <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold border ${TIER_BENEFITS[p.tier]?.badgeBg || 'bg-slate-100'}`}>
                          {p.tier} ({discountRate}%)
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-[11px] text-slate-500 mt-1">
                        <span>هاتف: {p.phone}</span>
                        <span className="font-bold text-rose-900 font-mono">
                          {p.totalPoints} نقطة
                        </span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>

        {/* Right / Selected Card & Points Account */}
        {activeProfile ? (
          <div className="lg:col-span-8 space-y-6">
            {/* 3D Smart Card Physical Simulation */}
            <div className="bg-slate-900 text-white rounded-3xl p-6 shadow-2xl border border-slate-800">
              <div className="flex items-center justify-between mb-4 border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2 text-xs">
                  <CreditCard className="w-4 h-4 text-rose-400" />
                  <span className="font-bold">معاينة كرت المريض الطبي الذكي (Smart Health Card)</span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setCardSide(cardSide === 'front' ? 'back' : 'front')}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-xs font-bold rounded-lg transition-colors border border-slate-700"
                  >
                    <RefreshCw className="w-3.5 h-3.5 text-rose-400" />
                    <span>قلب الكرت ({cardSide === 'front' ? 'الوجه الخلفي' : 'الوجه الأمامي'})</span>
                  </button>
                  <button
                    onClick={() => window.print()}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-rose-900 hover:bg-rose-800 text-white text-xs font-bold rounded-lg transition-colors shadow-sm"
                  >
                    <Printer className="w-3.5 h-3.5" />
                    <span>طباعة الكرت</span>
                  </button>
                </div>
              </div>

              {/* Physical Card Simulation (CR80 Standard Ratio) */}
              <div className="flex justify-center py-2">
                {cardSide === 'front' ? (
                  <div className="w-full max-w-[440px] aspect-[1.586/1] rounded-2xl bg-gradient-to-br from-[#4c0519] via-[#881337] to-[#0f172a] p-5 shadow-2xl border border-rose-500/50 flex flex-col justify-between relative overflow-hidden text-white select-none">
                    <div className="absolute -top-12 -left-12 w-48 h-48 bg-rose-500/20 rounded-full blur-2xl"></div>
                    <div className="absolute -bottom-12 -right-12 w-48 h-48 bg-blue-600/20 rounded-full blur-2xl"></div>

                    {/* Card Top */}
                    <div className="relative z-10 flex items-start justify-between">
                      <RTLogo size="sm" showSlogan={false} theme="dark" />
                      <div className="text-right">
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black tracking-wider uppercase border shadow-sm ${tierInfo.badgeBg}`}>
                          {tierInfo.titleAr}
                        </span>
                        <div className="text-[10px] font-bold text-amber-300 mt-1">
                          خصم {currentDiscount}% دائم
                        </div>
                      </div>
                    </div>

                    {/* Card Middle */}
                    <div className="relative z-10 my-auto flex items-center justify-between">
                      <div>
                        <div className="text-[10px] text-rose-200/80 font-medium">اسم حامل البطاقة / Patient Name</div>
                        <div className="text-base sm:text-lg font-black tracking-wide text-white drop-shadow-sm">
                          {activeProfile.patientName}
                        </div>
                        <div className="flex items-center gap-3 text-xs text-rose-100 font-mono mt-0.5">
                          <span>{activeProfile.phone}</span>
                          <span>·</span>
                          <span className="bg-rose-950/80 px-2 py-0.5 rounded font-bold border border-rose-700/60 text-rose-300">
                            فصيلة: {activeProfile.bloodGroup}
                          </span>
                        </div>
                      </div>

                      {/* EMV Chip */}
                      <div className="w-10 h-8 rounded-md bg-gradient-to-br from-amber-200 via-amber-400 to-amber-600 border border-amber-200/70 p-1 flex flex-col justify-between shadow-sm">
                        <div className="h-px bg-amber-800/40 w-full"></div>
                        <div className="h-px bg-amber-800/40 w-full"></div>
                      </div>
                    </div>

                    {/* Card Bottom */}
                    <div className="relative z-10 flex items-end justify-between border-t border-rose-500/30 pt-2 text-[10px] text-rose-200/80">
                      <div>
                        <div className="font-mono tracking-widest text-xs font-bold text-white">
                          {activeProfile.barcode}
                        </div>
                        <div className="text-[8px] text-rose-300">أطباء كلية طب قصر العيني</div>
                      </div>
                      <div className="text-right text-[8px] text-amber-300 font-bold">
                        RT LAB LOYALTY CLUB
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="w-full max-w-[440px] aspect-[1.586/1] rounded-2xl bg-gradient-to-br from-slate-900 to-slate-950 p-5 shadow-2xl border border-slate-700 flex flex-col justify-between relative overflow-hidden text-white select-none">
                    <div className="absolute top-4 inset-x-0 h-9 bg-slate-950 border-y border-slate-800"></div>

                    <div className="relative z-10 pt-10 text-[10px] space-y-1.5 text-slate-300">
                      <div className="flex items-center justify-between">
                        <span className="text-slate-400">طوارئ:</span>
                        <span className="font-bold text-white">{activeProfile.emergencyContact || 'غير مسجل'}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-slate-400">حالات صحية:</span>
                        <span className="text-rose-300 font-bold">{activeProfile.chronicConditions?.join('، ') || 'لا توجد'}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-slate-400">الخط الساخن لمعامل RT:</span>
                        <span className="font-mono text-white font-bold">01001234567 / 02-23658900</span>
                      </div>
                      <div className="text-[9px] text-slate-400 text-center pt-1 border-t border-slate-700/60 font-medium">
                        التشخيص الصحيح يبدأ معنا · كلية طب قصر العيني · بطاقة شخصية طبية
                      </div>
                    </div>

                    <div className="relative z-10 text-center font-mono text-[9px] tracking-widest text-slate-400">
                      ||||| ||| |||| ||||| ||| {activeProfile.barcode} |||| |||
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Loyalty Account Management */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
                <div>
                  <div className="flex items-center gap-2">
                    <Award className="w-5 h-5 text-amber-500" />
                    <h3 className="text-base font-black text-slate-900">
                      حساب نقاط المريض: {activeProfile.patientName}
                    </h3>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">
                    المستوى: <strong className="text-slate-900 font-bold">{tierInfo.titleAr}</strong> (خصم دائم {currentDiscount}%)
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      setAddMode('by_cash');
                      setIsAddPointsOpen(true);
                    }}
                    className="flex items-center gap-1.5 px-3 py-2 bg-emerald-700 hover:bg-emerald-600 text-white text-xs font-bold rounded-lg transition-all shadow-sm active:scale-95"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>حساب وإضافة نقاط</span>
                  </button>

                  <button
                    onClick={() => setIsRedeemOpen(true)}
                    className="flex items-center gap-1.5 px-3 py-2 bg-rose-900 hover:bg-rose-800 text-white text-xs font-bold rounded-lg transition-all shadow-sm active:scale-95"
                  >
                    <Gift className="w-3.5 h-3.5" />
                    <span>استبدال نقاط بخصم</span>
                  </button>
                </div>
              </div>

              {/* Stats Highlights */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                  <span className="text-[11px] text-slate-500 font-semibold block">رصيد النقاط الحالي</span>
                  <div className="flex items-baseline gap-1 mt-1">
                    <span className="text-2xl font-black text-rose-900 font-mono">
                      {activeProfile.totalPoints}
                    </span>
                    <span className="text-xs font-bold text-slate-700">نقطة</span>
                  </div>
                  <span className="text-[10px] text-emerald-700 font-medium block mt-1">
                    تعادل خصم نقدي بقيمة <strong>{calculateCashForPoints(activeProfile.totalPoints)} جنيه مصري</strong>
                  </span>
                </div>

                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                  <span className="text-[11px] text-slate-500 font-semibold block">نسبة الخصم التلقائي</span>
                  <div className="flex items-baseline gap-1 mt-1">
                    <span className="text-2xl font-black text-blue-900 font-mono">
                      {currentDiscount}%
                    </span>
                    <span className="text-xs font-bold text-slate-700">خصم دائم</span>
                  </div>
                  <span className="text-[10px] text-slate-500 font-medium block mt-1">
                    مستوى العضوية: {tierInfo.titleAr}
                  </span>
                </div>

                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                  <span className="text-[11px] text-slate-500 font-semibold block">إجمالي الإنفاق التراكمي</span>
                  <div className="flex items-baseline gap-1 mt-1">
                    <span className="text-2xl font-black text-slate-900 font-mono">
                      {activeProfile.lifetimeSpent.toLocaleString()}
                    </span>
                    <span className="text-xs font-bold text-slate-700">ج.م</span>
                  </div>
                  <span className="text-[10px] text-slate-500 font-medium block mt-1">
                    تاريخ الانضمام: {activeProfile.issueDate}
                  </span>
                </div>
              </div>

              {/* Transactions History */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                    <Clock className="w-4 h-4 text-slate-400" />
                    سجل حركات واكتساب واستبدال النقاط
                  </h4>
                  <span className="text-[11px] text-slate-400">
                    {activeProfile.transactions.length} حركة مسجلة
                  </span>
                </div>

                <div className="border border-slate-200 rounded-xl divide-y divide-slate-100 max-h-60 overflow-y-auto">
                  {activeProfile.transactions.map((tx) => (
                    <div key={tx.id} className="p-3 text-xs flex items-center justify-between hover:bg-slate-50">
                      <div className="flex items-center gap-2.5">
                        <div className={`p-1.5 rounded-lg ${
                          tx.type === 'earn' ? 'bg-emerald-50 text-emerald-700' :
                          tx.type === 'bonus' ? 'bg-amber-50 text-amber-700' :
                          'bg-rose-50 text-rose-700'
                        }`}>
                          {tx.type === 'earn' ? <ArrowUpRight className="w-4 h-4" /> :
                           tx.type === 'bonus' ? <Sparkles className="w-4 h-4" /> :
                           <ArrowDownLeft className="w-4 h-4" />}
                        </div>
                        <div>
                          <div className="font-bold text-slate-900">{tx.description}</div>
                          <div className="text-[10px] text-slate-400 mt-0.5">{tx.date}</div>
                        </div>
                      </div>

                      <div className={`font-mono font-black text-sm ${
                        tx.points > 0 ? 'text-emerald-700' : 'text-rose-700'
                      }`}>
                        {tx.points > 0 ? `+${tx.points}` : tx.points}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ) : null}
      </div>

      {/* Modal: Settings */}
      {isSettingsOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-2xl border border-slate-200 text-xs">
            <div className="flex items-center justify-between border-b pb-3">
              <div className="flex items-center gap-2">
                <Sliders className="w-5 h-5 text-amber-500" />
                <h3 className="text-base font-bold text-slate-900">
                  إعدادات كروت الولاء وقيمة استبدال النقود ونسب الخصم
                </h3>
              </div>
              <button onClick={() => setIsSettingsOpen(false)} className="text-slate-400 hover:text-slate-600">✕</button>
            </div>

            <div className="space-y-4 max-h-[75vh] overflow-y-auto pr-1">
              <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                <div className="font-bold text-slate-900 flex items-center gap-1.5">
                  <Calculator className="w-4 h-4 text-emerald-600" />
                  <span>1. معدل اكتساب النقاط عند استلام الأموال (Earning Rate)</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-700">كل 1 جنيه مصري مدفوع =</span>
                  <input
                    type="number"
                    min="0.1"
                    step="0.1"
                    value={tempConfig.pointsPerEGP}
                    onChange={(e) => setTempConfig({ ...tempConfig, pointsPerEGP: parseFloat(e.target.value) || 1 })}
                    className="w-24 p-2 bg-white border border-slate-300 rounded-lg font-mono font-bold text-center"
                  />
                  <span className="text-xs font-bold text-slate-700">نقطة</span>
                </div>
              </div>

              <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                <div className="font-bold text-slate-900 flex items-center gap-1.5">
                  <DollarSign className="w-4 h-4 text-rose-600" />
                  <span>2. قيمة استبدال النقاط بالنقد والخصم (Redemption Rate)</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-700">كل 100 نقطة ولاء =</span>
                  <input
                    type="number"
                    min="1"
                    step="1"
                    value={tempConfig.egpPer100Points}
                    onChange={(e) => setTempConfig({ ...tempConfig, egpPer100Points: parseFloat(e.target.value) || 10 })}
                    className="w-24 p-2 bg-white border border-slate-300 rounded-lg font-mono font-bold text-center"
                  />
                  <span className="text-xs font-bold text-slate-700">جنيه مصري خصم</span>
                </div>
              </div>

              <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
                <div className="font-bold text-slate-900 flex items-center gap-1.5">
                  <Percent className="w-4 h-4 text-blue-600" />
                  <span>3. تعديل نسب الخصم للفئات الأربعة</span>
                </div>

                <div className="space-y-2">
                  {(['Silver', 'Gold', 'Platinum', 'VIP'] as LoyaltyTier[]).map(t => (
                    <div key={t} className="flex items-center justify-between p-2 bg-white rounded-lg border border-slate-200">
                      <span className="font-bold text-slate-700">{TIER_BENEFITS[t].titleAr}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-[11px] text-slate-500">خصم:</span>
                        <input
                          type="number"
                          min="0"
                          max="100"
                          value={tempConfig.tiers[t].discountRate}
                          onChange={(e) => setTempConfig({
                            ...tempConfig,
                            tiers: {
                              ...tempConfig.tiers,
                              [t]: { ...tempConfig.tiers[t], discountRate: parseFloat(e.target.value) || 0 }
                            }
                          })}
                          className="w-16 p-1.5 border rounded font-mono font-bold text-center"
                        />
                        <span className="text-[11px] font-bold">%</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t">
              <button
                type="button"
                onClick={() => setIsSettingsOpen(false)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-lg"
              >
                إلغاء
              </button>
              <button
                type="button"
                onClick={handleSaveConfig}
                className="px-5 py-2 bg-rose-900 hover:bg-rose-800 text-white font-bold rounded-lg shadow-sm"
              >
                حفظ التعديلات
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Add Points */}
      {isAddPointsOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl border border-slate-200 text-xs">
            <h3 className="text-sm font-bold text-slate-900 border-b pb-2 flex items-center gap-2">
              <Calculator className="w-4 h-4 text-emerald-600" />
              حساب وإضافة نقاط للمريض: {activeProfile?.patientName}
            </h3>

            <div className="flex items-center bg-slate-100 p-1 rounded-xl">
              <button
                type="button"
                onClick={() => setAddMode('by_cash')}
                className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all ${
                  addMode === 'by_cash' ? 'bg-white shadow-xs text-rose-900' : 'text-slate-600'
                }`}
              >
                حساب من الفاتورة النقدية
              </button>
              <button
                type="button"
                onClick={() => setAddMode('direct')}
                className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all ${
                  addMode === 'direct' ? 'bg-white shadow-xs text-rose-900' : 'text-slate-600'
                }`}
              >
                إدخال يدوي
              </button>
            </div>

            {addMode === 'by_cash' ? (
              <div className="space-y-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    المبلغ النقدي المحصل من المريض (بالجنيه المصري):
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={cashAmountForPoints}
                    onChange={(e) => setCashAmountForPoints(parseFloat(e.target.value) || 0)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg font-mono font-bold text-base text-slate-900"
                  />
                </div>

                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl space-y-1">
                  <div className="text-slate-600 text-[11px]">النقاط المكتسبة المحسوبة:</div>
                  <div className="text-xl font-black text-emerald-700 font-mono">
                    +{calculatePointsForAmount(cashAmountForPoints)} نقطة
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">عدد النقاط المضافة:</label>
                  <input
                    type="number"
                    min="1"
                    value={directPoints}
                    onChange={(e) => setDirectPoints(parseInt(e.target.value) || 0)}
                    className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg font-mono font-bold"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">سبب أو وصف الحركة:</label>
                  <input
                    type="text"
                    value={pointsDescription}
                    onChange={(e) => setPointsDescription(e.target.value)}
                    className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg"
                  />
                </div>
              </div>
            )}

            <div className="flex items-center justify-end gap-2 pt-2 border-t">
              <button
                type="button"
                onClick={() => setIsAddPointsOpen(false)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-lg"
              >
                إلغاء
              </button>
              <button
                type="button"
                onClick={handleAddPointsSubmit}
                className="px-4 py-2 bg-emerald-700 hover:bg-emerald-600 text-white font-bold rounded-lg shadow-sm"
              >
                تأكيد الإضافة
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Redeem Points */}
      {isRedeemOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl border border-slate-200 text-xs">
            <h3 className="text-sm font-bold text-slate-900 border-b pb-2 flex items-center gap-2">
              <Gift className="w-4 h-4 text-rose-600" />
              استبدال نقاط بخصم نقدي مباشر
            </h3>

            <div>
              <label className="block font-bold text-slate-700 mb-1">
                رصيد المريض المتاح: <span className="font-mono text-rose-900 font-bold">{activeProfile?.totalPoints}</span> نقطة
              </label>
              <input
                type="number"
                min="1"
                max={activeProfile?.totalPoints || 0}
                value={pointsToRedeem}
                onChange={(e) => setPointsToRedeem(parseInt(e.target.value) || 0)}
                className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg font-mono font-bold text-base text-slate-900"
              />
            </div>

            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl space-y-1">
              <div className="text-slate-600 text-[11px]">القيمة النقدية للخصم:</div>
              <div className="text-xl font-black text-rose-900 font-mono">
                {calculateCashForPoints(pointsToRedeem)} ج.م خصم نقدي
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t">
              <button
                type="button"
                onClick={() => setIsRedeemOpen(false)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-lg"
              >
                إلغاء
              </button>
              <button
                type="button"
                onClick={handleRedeemSubmit}
                className="px-4 py-2 bg-rose-900 hover:bg-rose-800 text-white font-bold rounded-lg shadow-sm"
              >
                تأكيد الخصم
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: New Card */}
      {isNewCardModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl border border-slate-200 text-xs">
            <h3 className="text-sm font-bold text-slate-900 border-b pb-2">
              إصدار كرت مريض ذكي جديد
            </h3>

            <form onSubmit={handleCreateNewCard} className="space-y-3">
              <div>
                <label className="block font-bold text-slate-700 mb-1">اسم المريض الكامل *</label>
                <input
                  type="text"
                  required
                  value={newCardName}
                  onChange={(e) => setNewCardName(e.target.value)}
                  placeholder="الاسم ثلاثي أو رباعي..."
                  className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg font-bold"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">رقم الهاتف (الواتساب)</label>
                <input
                  type="text"
                  value={newCardPhone}
                  onChange={(e) => setNewCardPhone(e.target.value)}
                  placeholder="01012345678"
                  className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg font-mono"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">فصيلة الدم</label>
                  <select
                    value={newCardBlood}
                    onChange={(e) => setNewCardBlood(e.target.value)}
                    className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg font-mono font-bold"
                  >
                    <option value="A+">A+</option>
                    <option value="A-">A-</option>
                    <option value="B+">B+</option>
                    <option value="B-">B-</option>
                    <option value="AB+">AB+</option>
                    <option value="AB-">AB-</option>
                    <option value="O+">O+</option>
                    <option value="O-">O-</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">هاتف الطوارئ</label>
                  <input
                    type="text"
                    value={newCardEmergency}
                    onChange={(e) => setNewCardEmergency(e.target.value)}
                    placeholder="رقم أحد الأقارب..."
                    className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">حالة صحية أو حساسية (اختياري)</label>
                <input
                  type="text"
                  value={newCardCondition}
                  onChange={(e) => setNewCardCondition(e.target.value)}
                  placeholder="مثال: ضغط، سكر، حساسية بنسلين..."
                  className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg"
                />
              </div>

              <div className="p-2.5 bg-rose-50 rounded-lg border border-rose-200 text-[11px] text-rose-950 font-bold">
                ⭐ سيتم منح المريض <strong>100 نقطة ترحيبية مجانية</strong> فور إصدار الكرت!
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t">
                <button
                  type="button"
                  onClick={() => setIsNewCardModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-lg"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-rose-900 hover:bg-rose-800 text-white font-bold rounded-lg shadow-sm"
                >
                  إصدار الكرت
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
