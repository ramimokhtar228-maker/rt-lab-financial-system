import React, { useState, useEffect } from 'react';
import { PatientLoyaltyProfile, LoyaltyTier, LoyaltyTransaction, LabReport } from '../types/lab';
import { TIER_BENEFITS } from '../data/loyaltyData';
import { RTLogo } from './RTLogo';
import { generateAndDownloadLoyaltyCard, CardCustomFields } from '../utils/loyaltyCardCanvas';
import { openWhatsApp } from '../utils/whatsapp';
import { 
  CreditCard, 
  Award, 
  QrCode, 
  Printer, 
  Download, 
  Plus, 
  Search, 
  Gift, 
  TrendingUp, 
  Droplet, 
  Phone, 
  Calendar, 
  ShieldCheck, 
  Sparkles, 
  CheckCircle2, 
  Clock, 
  ArrowUpRight, 
  ArrowDownLeft,
  User, 
  HeartPulse, 
  RefreshCw, 
  Settings, 
  Sliders, 
  Calculator, 
  DollarSign, 
  Percent, 
  Edit3,
  Trash2,
  Share2,
  Copy,
  Zap,
  AlertTriangle,
  X,
  Check
} from 'lucide-react';

export interface LoyaltyConfig {
  pointsPerEGP: number; // 1 point per 1 EGP spent
  egpPer100Points: number; // 10 EGP cash discount for each 100 points
  tiers: {
    Silver: { discountRate: number; minPoints: number };
    Gold: { discountRate: number; minPoints: number };
    Platinum: { discountRate: number; minPoints: number };
    VIP: { discountRate: number; minPoints: number };
  };
}

const DEFAULT_LOYALTY_CONFIG: LoyaltyConfig = {
  pointsPerEGP: 1,
  egpPer100Points: 10,
  tiers: {
    Silver: { discountRate: 5, minPoints: 0 },
    Gold: { discountRate: 10, minPoints: 500 },
    Platinum: { discountRate: 15, minPoints: 1500 },
    VIP: { discountRate: 20, minPoints: 3000 }
  }
};

interface PatientCardsAndPointsProps {
  loyaltyProfiles: PatientLoyaltyProfile[];
  onUpdateProfiles: (profiles: PatientLoyaltyProfile[]) => void;
  reports: LabReport[];
  onUpdateReports?: (reports: LabReport[]) => void;
  onSelectPatientForReport?: (patientName: string) => void;
}

export const PatientCardsAndPoints: React.FC<PatientCardsAndPointsProps> = ({
  loyaltyProfiles,
  onUpdateProfiles,
  reports,
  onUpdateReports,
  onSelectPatientForReport
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProfileId, setSelectedProfileId] = useState<string>(loyaltyProfiles[0]?.patientId || '');
  const [copiedCode, setCopiedCode] = useState(false);
  // Card Fields Customization State (Face 1 single-sided luxury customization)
  const [cardFields, setCardFields] = useState<CardCustomFields & { theme: 'royal-black' | 'sapphire' | 'emerald' | 'ruby' }>(() => {
    try {
      const saved = localStorage.getItem('rt_lab_card_fields_config');
      if (saved) return JSON.parse(saved);
    } catch {}
    return {
      showHeader: true,
      showTierBadge: true,
      showChip: true,
      showPoints: true,
      showCardCode: true,
      showPatientName: true,
      showPatientPhone: true,
      showBloodGroup: true,
      showDates: true,
      showUsageNote: true,
      showFooter: true,
      showHotline: true,
      showAddress: true,
      theme: 'royal-black'
    };
  });
  const [isFieldCustomizerOpen, setIsFieldCustomizerOpen] = useState(false);

  const updateCardField = (key: keyof CardCustomFields, val: boolean) => {
    setCardFields(prev => {
      const updated = { ...prev, [key]: val };
      try { localStorage.setItem('rt_lab_card_fields_config', JSON.stringify(updated)); } catch {}
      return updated;
    });
  };

  const setCardTheme = (theme: 'royal-black' | 'sapphire' | 'emerald' | 'ruby') => {
    setCardFields(prev => {
      const updated = { ...prev, theme };
      try { localStorage.setItem('rt_lab_card_fields_config', JSON.stringify(updated)); } catch {}
      return updated;
    });
  };

  const resetAllCardFields = () => {
    const defaults = {
      showHeader: true,
      showTierBadge: true,
      showChip: true,
      showPoints: true,
      showCardCode: true,
      showPatientName: true,
      showPatientPhone: true,
      showBloodGroup: true,
      showDates: true,
      showUsageNote: true,
      showFooter: true,
      showHotline: true,
      showAddress: true,
      theme: 'royal-black' as const
    };
    setCardFields(defaults);
    try { localStorage.setItem('rt_lab_card_fields_config', JSON.stringify(defaults)); } catch {}
  };

  // RETROACTIVE SYNC ALL REGISTERED REPORTS & CASES
  const handleRetroactiveSyncAllReports = () => {
    let syncedReportsCount = 0;
    let newProfilesCreated = 0;
    let updatedProfilesCount = 0;

    // 1. Process reports: ensure card code & loyalty issued flag
    const updatedReports = reports.map((rep, idx) => {
      syncedReportsCount++;
      const p = rep.patient;
      const code = p.loyaltyCardNumber || `RT-2026-${String(idx + 1).padStart(4, '0')}`;
      return {
        ...rep,
        patient: {
          ...p,
          loyaltyCardIssued: true,
          loyaltyCardNumber: code
        }
      };
    });

    // 2. Process loyalty profiles
    let currentProfiles = [...loyaltyProfiles];

    updatedReports.forEach(rep => {
      const p = rep.patient;
      const phone = (p.phone || '').trim();
      const name = (p.fullName || '').trim();
      if (!name && !phone) return;

      const existingIdx = currentProfiles.findIndex(prof => 
        (phone && prof.phone === phone) || (name && prof.patientName === name)
      );

      // Estimate points
      let repPoints = 150;
      if (rep.packageApplied?.packagePrice) {
        repPoints = Math.round(rep.packageApplied.packagePrice);
      } else if (rep.profiles.length > 0) {
        repPoints = Math.min(600, rep.profiles.reduce((acc, pr) => acc + pr.parameters.length * 25, 100));
      }

      if (existingIdx >= 0) {
        const exist = currentProfiles[existingIdx];
        const hasTx = exist.transactions.some(t => t.id === `rep-${rep.id}` || t.description.includes(p.labNumber));
        if (!hasTx) {
          const newTx: LoyaltyTransaction = {
            id: `rep-${rep.id}`,
            date: (rep.createdAt || rep.updatedAt || new Date().toISOString()).substring(0, 10),
            type: 'earn',
            points: repPoints,
            description: `مزامنة نقاط فحص معملي #${p.labNumber || '2026'}`
          };
          const newTotal = exist.totalPoints + repPoints;
          currentProfiles[existingIdx] = {
            ...exist,
            cardNumber: exist.cardNumber || p.loyaltyCardNumber,
            totalPoints: newTotal,
            tier: getDynamicTier(newTotal),
            transactions: [newTx, ...exist.transactions]
          };
          updatedProfilesCount++;
        }
      } else {
        const newProf: PatientLoyaltyProfile = {
          patientId: p.id || `pt-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
          patientName: name,
          phone: phone || '01000000000',
          cardNumber: p.loyaltyCardNumber,
          barcode: p.loyaltyCardNumber,
          tier: getDynamicTier(repPoints),
          totalPoints: repPoints,
          lifetimeSpent: repPoints,
          issueDate: (rep.createdAt || rep.updatedAt || new Date().toISOString()).substring(0, 10),
          bloodGroup: 'O+',
          transactions: [
            {
              id: `rep-${rep.id}`,
              date: (rep.createdAt || rep.updatedAt || new Date().toISOString()).substring(0, 10),
              type: 'earn',
              points: repPoints,
              description: `إصدار وتفعيل نقاط كارت فحص #${p.labNumber || '2026'}`
            }
          ]
        };
        currentProfiles.push(newProf);
        newProfilesCreated++;
      }
    });

    if (onUpdateReports) {
      onUpdateReports(updatedReports);
    }
    onUpdateProfiles(currentProfiles);
    try { localStorage.setItem('rt_lab_loyalty_profiles_v2', JSON.stringify(currentProfiles)); } catch {}

    alert(`✅ تم بنجاح تفعيل وتحديث كروت ونقاط جميع الحالات المسجلة!\n• تم فحص ${syncedReportsCount} حالة مسجلة بالنظام.\n• تم إنشاء ${newProfilesCreated} كارت ولاء جديد.\n• تم تحديث ${updatedProfilesCount} حساب ولاء سابق بالنقاط.`);
  };


  // Config State
  const [config, setConfig] = useState<LoyaltyConfig>(() => {
    try {
      const saved = localStorage.getItem('rt_lab_loyalty_settings');
      return saved ? JSON.parse(saved) : DEFAULT_LOYALTY_CONFIG;
    } catch {
      return DEFAULT_LOYALTY_CONFIG;
    }
  });

  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [tempConfig, setTempConfig] = useState<LoyaltyConfig>(config);

  // Modals state
  const [isAddPointsOpen, setIsAddPointsOpen] = useState(false);
  const [pointsAddMode, setPointsAddMode] = useState<'direct' | 'by_cash'>('by_cash');
  const [cashAmountForPoints, setCashAmountForPoints] = useState<number>(500);
  const [pointsToAdd, setPointsToAdd] = useState<number>(100);
  const [pointsDescription, setPointsDescription] = useState('نقاط زيارة فحص معملي جديد');

  const [isRedeemOpen, setIsRedeemOpen] = useState(false);
  const [pointsToRedeem, setPointsToRedeem] = useState<number>(100);

  // New Card Modal
  const [isNewCardModalOpen, setIsNewCardModalOpen] = useState(false);
  const [newCardName, setNewCardName] = useState('');
  const [newCardPhone, setNewCardPhone] = useState('');
  const [newCardBlood, setNewCardBlood] = useState('O+');
  const [newCardEmergency, setNewCardEmergency] = useState('');
  const [newCardCondition, setNewCardCondition] = useState('');

  // Edit Card Modal (Full Field Editing & Replacing)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editForm, setEditForm] = useState({
    patientName: '',
    phone: '',
    cardNumber: '',
    tier: 'Gold' as LoyaltyTier,
    totalPoints: 0,
    lifetimeSpent: 0,
    bloodGroup: 'O+',
    emergencyContact: '',
    chronicConditions: '',
    issueDate: ''
  });

  const activeProfile = loyaltyProfiles.find(p => p.patientId === selectedProfileId) || loyaltyProfiles[0];

  // Dynamic Tier
  const getDynamicTier = (points: number): LoyaltyTier => {
    if (points >= config.tiers.VIP.minPoints) return 'VIP';
    if (points >= config.tiers.Platinum.minPoints) return 'Platinum';
    if (points >= config.tiers.Gold.minPoints) return 'Gold';
    return 'Silver';
  };

  const currentTierKey = activeProfile ? (activeProfile.tier || getDynamicTier(activeProfile.totalPoints)) : 'Silver';
  const tierInfo = TIER_BENEFITS[currentTierKey] || TIER_BENEFITS.Silver;
  const currentDiscountRate = config.tiers[currentTierKey]?.discountRate || 10;

  // Conversions
  const pointsToCashValue = (pts: number) => {
    return Math.round((pts * (config.egpPer100Points / 100)) * 100) / 100;
  };

  const cashToPointsValue = (cash: number) => {
    return Math.round(cash * config.pointsPerEGP);
  };

  const filteredProfiles = loyaltyProfiles.filter(p => 
    p.patientName.includes(searchTerm) ||
    p.phone.includes(searchTerm) ||
    (p.cardNumber && p.cardNumber.includes(searchTerm)) ||
    p.barcode.includes(searchTerm)
  );

  // Open Edit Modal
  const handleOpenEditModal = () => {
    if (!activeProfile) return;
    setEditForm({
      patientName: activeProfile.patientName,
      phone: activeProfile.phone,
      cardNumber: activeProfile.cardNumber || activeProfile.barcode,
      tier: activeProfile.tier,
      totalPoints: activeProfile.totalPoints,
      lifetimeSpent: activeProfile.lifetimeSpent,
      bloodGroup: activeProfile.bloodGroup || 'O+',
      emergencyContact: activeProfile.emergencyContact || '',
      chronicConditions: activeProfile.chronicConditions?.join(', ') || '',
      issueDate: activeProfile.issueDate || new Date().toISOString().substring(0, 10)
    });
    setIsEditModalOpen(true);
  };

  // Save Edited Profile
  const handleSaveEditProfile = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeProfile) return;

    const updated: PatientLoyaltyProfile = {
      ...activeProfile,
      patientName: editForm.patientName.trim() || activeProfile.patientName,
      phone: editForm.phone.trim() || activeProfile.phone,
      cardNumber: editForm.cardNumber.trim(),
      barcode: editForm.cardNumber.trim(),
      tier: editForm.tier,
      totalPoints: Number(editForm.totalPoints) || 0,
      lifetimeSpent: Number(editForm.lifetimeSpent) || 0,
      bloodGroup: editForm.bloodGroup,
      emergencyContact: editForm.emergencyContact.trim() || undefined,
      chronicConditions: editForm.chronicConditions.trim() 
        ? editForm.chronicConditions.split(',').map(s => s.trim()).filter(Boolean) 
        : [],
      issueDate: editForm.issueDate || activeProfile.issueDate
    };

    const newProfiles = loyaltyProfiles.map(p => p.patientId === activeProfile.patientId ? updated : p);
    onUpdateProfiles(newProfiles);
    setIsEditModalOpen(false);
  };

  // Generate Fresh Card Number
  const handleRegenerateCardCode = () => {
    const freshCode = `RT-GOLD-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
    setEditForm(prev => ({ ...prev, cardNumber: freshCode }));
  };

  // Delete Card Profile
  const handleDeleteCard = () => {
    if (!activeProfile) return;
    if (confirm(`هل أنت متأكد من حذف كارت الولاء وملف المريض (${activeProfile.patientName}) نهائياً؟ لا يمكن التراجع عن هذا الإجراء.`)) {
      const remaining = loyaltyProfiles.filter(p => p.patientId !== activeProfile.patientId);
      onUpdateProfiles(remaining);
      setSelectedProfileId(remaining[0]?.patientId || '');
    }
  };

  // Delete Specific Transaction
  const handleDeleteTransaction = (txId: string) => {
    if (!activeProfile) return;
    const tx = activeProfile.transactions.find(t => t.id === txId);
    if (!tx) return;

    if (confirm(`هل تريد حذف حركة النقاط "${tx.description}" (${tx.points > 0 ? '+' : ''}${tx.points} نقطة)؟ سيتم تحديث الرصيد تلقائياً.`)) {
      const filtered = activeProfile.transactions.filter(t => t.id !== txId);
      const newTotal = Math.max(0, activeProfile.totalPoints - tx.points);
      const newTier = getDynamicTier(newTotal);

      const updated = {
        ...activeProfile,
        totalPoints: newTotal,
        tier: newTier,
        transactions: filtered
      };

      onUpdateProfiles(loyaltyProfiles.map(p => p.patientId === activeProfile.patientId ? updated : p));
    }
  };

  // RETROACTIVE LOYALTY SYNC FOR ALL REGISTERED CASES IN ARCHIVE
  const handleRetroactiveSyncAllCases = () => {
    if (!reports || reports.length === 0) {
      alert('لا توجد تقارير أو حالات مسجلة حالياً بالأرشيف للمزامنة.');
      return;
    }

    let updatedReportsCount = 0;
    let newProfilesCount = 0;
    let updatedProfiles = [...loyaltyProfiles];

    const updatedReports = reports.map(rep => {
      const p = rep.patient;
      const phone = (p.phone || '').trim();
      const name = (p.fullName || '').trim();
      if (!name) return rep;

      let cardCode = p.loyaltyCardNumber;
      let cardIssued = p.loyaltyCardIssued;

      let existingProfile = updatedProfiles.find(prof => 
        (phone && prof.phone === phone) || 
        (name && prof.patientName === name) ||
        (cardCode && prof.cardNumber === cardCode)
      );

      const pts = Math.max(50, Math.floor((p.totalCost || 250) / 2));
      const nowIso = new Date().toISOString();

      if (!cardCode || !cardIssued) {
        cardCode = existingProfile?.cardNumber || `RT-GOLD-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
        cardIssued = true;
        updatedReportsCount++;
      }

      if (existingProfile) {
        const hasTx = existingProfile.transactions?.some(t => t.reportNumber === rep.reportNumber || t.invoiceNumber === rep.reportNumber);
        if (!hasTx) {
          const newTx: LoyaltyTransaction = {
            id: `tx-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
            date: nowIso.substring(0, 10),
            type: 'earn',
            points: pts,
            description: `نقاط فحص معملي سابق #${rep.reportNumber}`,
            reportNumber: rep.reportNumber,
            invoiceNumber: rep.reportNumber,
            amountEGP: p.totalCost || 250
          };
          const newTotal = existingProfile.totalPoints + pts;
          existingProfile = {
            ...existingProfile,
            cardNumber: cardCode,
            totalPoints: newTotal,
            lifetimeSpent: existingProfile.lifetimeSpent + (p.totalCost || 250),
            transactions: [newTx, ...(existingProfile.transactions || [])]
          };
          updatedProfiles = updatedProfiles.map(prof => prof.patientId === existingProfile!.patientId ? existingProfile! : prof);
        }
      } else {
        newProfilesCount++;
        const newProf: PatientLoyaltyProfile = {
          patientId: p.labNumber || p.nationalId || `pat-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
          patientName: name,
          phone: phone || '01000000000',
          cardNumber: cardCode,
          barcode: cardCode,
          bloodGroup: p.bloodGroup || 'O+',
          tier: 'Gold',
          totalPoints: pts,
          lifetimeSpent: p.totalCost || 250,
          issueDate: nowIso.substring(0, 10),
          transactions: [
            {
              id: `tx-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
              date: nowIso.substring(0, 10),
              type: 'earn',
              points: pts,
              description: `تفعيل كارت الولاء بأثر رجعي مع تقرير #${rep.reportNumber}`,
              reportNumber: rep.reportNumber,
              invoiceNumber: rep.reportNumber,
              amountEGP: p.totalCost || 250
            }
          ]
        };
        updatedProfiles = [newProf, ...updatedProfiles];
      }

      return {
        ...rep,
        patient: {
          ...p,
          loyaltyCardIssued: true,
          loyaltyCardNumber: cardCode
        }
      };
    });

    onUpdateProfiles(updatedProfiles);
    if (onUpdateReports) {
      onUpdateReports(updatedReports);
    }

    alert(`✅ تمت مزامنة وتفعيل كروت ونقاط الولاء بنجاح!
• فحص ${reports.length} حالة مسجلة بالأرشيف.
• تفعيل/تحديث كروت ${updatedReportsCount} حالة.
• إنشاء وإدراج ${newProfilesCount} كارت ولاء جديد بقاعدة البيانات.`);
  };

  // Add Points
  const handleAddPoints = () => {
    if (!activeProfile) return;
    const finalPoints = pointsAddMode === 'by_cash' ? cashToPointsValue(cashAmountForPoints) : pointsToAdd;
    if (finalPoints <= 0) return;

    const newTx: LoyaltyTransaction = {
      id: `tx-${Date.now()}`,
      date: new Date().toISOString().substring(0, 10),
      type: 'earn',
      points: finalPoints,
      description: pointsAddMode === 'by_cash'
        ? `اكتساب نقاط عن سداد نقدي بقيمة ${cashAmountForPoints} ج.م`
        : (pointsDescription.trim() || 'اكتساب نقاط فحص')
    };

    const newTotalPoints = activeProfile.totalPoints + finalPoints;
    const newTier = getDynamicTier(newTotalPoints);
    const newSpent = pointsAddMode === 'by_cash' ? activeProfile.lifetimeSpent + cashAmountForPoints : activeProfile.lifetimeSpent;

    const updatedProfiles = loyaltyProfiles.map(p => {
      if (p.patientId === activeProfile.patientId) {
        return {
          ...p,
          totalPoints: newTotalPoints,
          tier: newTier,
          lifetimeSpent: newSpent,
          transactions: [newTx, ...p.transactions]
        };
      }
      return p;
    });

    onUpdateProfiles(updatedProfiles);
    setIsAddPointsOpen(false);
  };

  // Redeem Points
  const handleRedeemPoints = () => {
    if (!activeProfile || pointsToRedeem <= 0 || pointsToRedeem > activeProfile.totalPoints) return;
    const cashDeduction = pointsToCashValue(pointsToRedeem);

    const newTx: LoyaltyTransaction = {
      id: `tx-${Date.now()}`,
      date: new Date().toISOString().substring(0, 10),
      type: 'redeem',
      points: -pointsToRedeem,
      description: `استبدال ${pointsToRedeem} نقطة بخصم نقدي مباشر بقيمة ${cashDeduction} ج.م`
    };

    const newTotalPoints = activeProfile.totalPoints - pointsToRedeem;
    const newTier = getDynamicTier(newTotalPoints);

    const updatedProfiles = loyaltyProfiles.map(p => {
      if (p.patientId === activeProfile.patientId) {
        return {
          ...p,
          totalPoints: newTotalPoints,
          tier: newTier,
          transactions: [newTx, ...p.transactions]
        };
      }
      return p;
    });

    onUpdateProfiles(updatedProfiles);
    setIsRedeemOpen(false);
  };

  // Issue New Card
  const handleCreateNewCard = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCardName.trim()) return;

    const cardCode = `RT-GOLD-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
    const newProfile: PatientLoyaltyProfile = {
      patientId: `pat-${Date.now()}`,
      patientName: newCardName.trim(),
      phone: newCardPhone.trim() || '01000000000',
      cardNumber: cardCode,
      barcode: cardCode,
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
          description: 'هدية ترحيبية فورية بمناسبة إصدار كارت المريض الذكي'
        }
      ]
    };

    onUpdateProfiles([newProfile, ...loyaltyProfiles]);
    setSelectedProfileId(newProfile.patientId);
    setIsNewCardModalOpen(false);
    setNewCardName('');
    setNewCardPhone('');
    setNewCardEmergency('');
    setNewCardCondition('');
  };

  // Pure White Background Isolated Single-Sided Card Print
  const handlePrintCard = () => {
    if (!activeProfile) return;
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      alert('يرجى السماح بالنوافذ المنبثقة لطباعة الكرت.');
      return;
    }

    const cardCode = activeProfile.cardNumber || activeProfile.barcode;

    const html = `<!DOCTYPE html><html lang="ar" dir="rtl"><head>
  <meta charset="UTF-8">
  <title>كارت المريض الطبي الذكي - ${activeProfile.patientName}</title>
  <link href="https://fonts.googleapis.com/css2?family=Cairo:wght@600;700;800;900&family=JetBrains+Mono:wght@600;700&display=swap" rel="stylesheet">
  <style>
    * { box-sizing: border-box; }
    html, body {
      margin: 0;
      padding: 0;
      background: #ffffff !important;
      font-family: 'Cairo', sans-serif;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      min-height: 100vh;
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
    }
    .no-print {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      background: #0f172a;
      color: white;
      padding: 12px 24px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      z-index: 100;
    }
    .card-wrap {
      width: 96mm;
      height: 60mm;
      border-radius: 4mm;
      overflow: hidden;
      margin: 16px auto;
      page-break-inside: avoid;
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
      border: 1.5px solid #d97706;
      position: relative;
    }
    @media print {
      body { min-height: auto !important; background: #ffffff !important; }
      .no-print { display: none !important; }
      .card-wrap { box-shadow: none !important; margin: 20mm auto !important; }
      @page { size: A4 portrait; margin: 0; }
    }
  </style></head><body>
  <div class="no-print">
    <div style="font-weight:bold; font-size:13px;">طباعة كارت الولاء الطبي الذكي (وجه واحد قياسي)</div>
    <div style="display:flex; gap:10px;">
      <button onclick="window.print()" style="background:#b45309; color:white; border:none; padding:8px 18px; border-radius:6px; font-weight:bold; cursor:pointer;">🖨️ طباعة الآن</button>
      <button onclick="window.close()" style="background:#334155; color:white; border:none; padding:8px 14px; border-radius:6px; cursor:pointer;">إغلاق ✕</button>
    </div>
  </div>

  <div style="padding-top: 60px; text-align: center;">
    <div class="card-wrap" style="background: linear-gradient(135deg, #090d16 0%, #1e1b4b 60%, #311010 100%); color: white; padding: 4.5mm 6mm; display: flex; flex-direction: column; justify-content: space-between; text-align: right;">
      <div style="display: flex; justify-content: space-between; align-items: flex-start;">
        <div>
          <div style="font-weight: 900; font-size: 13.5px; color: #ffffff;">معامل RT للتحاليل الطبية والتشخيصية</div>
          <div style="font-size: 8.5px; color: #fde68a; font-weight: bold;">معامل رامي مختار • أطباء كلية طب قصر العيني</div>
        </div>
        <div style="background: rgba(245, 158, 11, 0.25); border: 1px solid #fbbf24; border-radius: 20px; padding: 2px 8px; font-size: 8.5px; font-weight: bold; color: #fef08a;">
          ★ ${tierInfo.titleAr} ★
        </div>
      </div>

      <!-- Center info -->
      <div style="margin: 2mm 0; display: flex; justify-content: space-between; align-items: center;">
        <div style="background: linear-gradient(135deg, #fde68a, #d97706); width: 34px; height: 26px; border-radius: 4px; border: 1px solid #fef3c7;"></div>
        <div style="text-align: center; flex: 1;">
          <div style="font-family: monospace; font-size: 14px; font-weight: bold; letter-spacing: 2px; color: #ffffff;">${cardCode}</div>
          <div style="font-size: 8px; color: #fda4af; font-weight: bold; margin-top: 1px;">خصم دائم معتمد: %${currentDiscountRate} على كافة التحاليل</div>
        </div>
        <div style="text-align: left; background: rgba(0,0,0,0.4); padding: 3px 6px; border-radius: 6px; border: 1px solid rgba(245, 158, 11, 0.3);">
          <div style="font-size: 7px; color: #cbd5e1;">رصيد النقاط:</div>
          <div style="font-size: 11px; font-weight: 900; color: #fbbf24;">${activeProfile.totalPoints} نقطة</div>
        </div>
      </div>

      <!-- Patient Demographics -->
      <div style="display: flex; justify-content: space-between; align-items: flex-end; border-top: 1px solid rgba(255,255,255,0.2); padding-top: 2.5mm;">
        <div>
          <div style="font-size: 8px; color: #94a3b8;">اسم المريض:</div>
          <div style="font-weight: 800; font-size: 11px; color: #ffffff;">${activeProfile.patientName}</div>
          <div style="font-family: monospace; font-size: 9px; color: #fde68a; margin-top: 1px;">${activeProfile.phone}</div>
        </div>
        <div style="text-align: center;">
          <div style="font-size: 7.5px; color: #94a3b8;">فصيلة الدم:</div>
          <div style="font-weight: 900; font-size: 11px; color: #f43f5e; font-family: monospace;">${activeProfile.bloodGroup || 'O+'}</div>
        </div>
        <div style="text-align: left;">
          <div style="font-size: 7.5px; color: #94a3b8;">الخط الساخن:</div>
          <div style="font-size: 8.5px; font-weight: bold; color: #ffffff; font-family: monospace;">01012345678</div>
          <div style="font-size: 6.5px; color: #cbd5e1;">بهتيم - شبرا الخيمة</div>
        </div>
      </div>
    </div>
  </div>
</body></html>`;

    printWindow.document.write(html);
    printWindow.document.close();
  };

  // Download Single-Sided Card PNG
  const handleDownloadSingleSidedPNG = () => {
    if (!activeProfile) return;
    const cardCode = activeProfile.cardNumber || activeProfile.barcode;
    generateAndDownloadLoyaltyCard({
      cardNumber: cardCode,
      patientName: activeProfile.patientName,
      patientPhone: activeProfile.phone,
      tier: tierInfo.titleAr || 'Gold VIP',
      discountPercentage: currentDiscountRate,
      points: activeProfile.totalPoints,
      bloodGroup: activeProfile.bloodGroup || 'O+',
      issueDate: activeProfile.issueDate,
      emergencyContact: activeProfile.emergencyContact,
      hotline: '01012345678 / 02-44667788',
      address: 'ميدان بهتيم برج صيدلية العزبي الدور الثالث شبرا الخيمة',
      fields: cardFields,
      theme: cardFields.theme
    });
  };

  // Copy card code
  const handleCopyCardCode = () => {
    if (!activeProfile) return;
    const code = activeProfile.cardNumber || activeProfile.barcode;
    navigator.clipboard.writeText(code);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Top Header & Actions Bar */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-700 flex items-center justify-center font-bold">
              <Award className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <h1 className="text-xl font-black text-slate-900 flex items-center gap-2">
                <span>نظام كروت ولاء المرضى والنقاط الذكية (وجه واحد فاخر)</span>
                <span className="text-[11px] font-bold bg-amber-100 text-amber-900 border border-amber-300 px-2 py-0.5 rounded-full">
                  Single-Sided Luxury VIP
                </span>
              </h1>
              <p className="text-xs text-slate-500 mt-0.5">
                إصدار وتعديل كروت الخصم الدائم، احتساب النقاط التراكمية، ومزامنة الحالات المسجلة بالأرشيف بأثر رجعي
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Retroactive Sync Button */}
          <button
            onClick={handleRetroactiveSyncAllCases}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-indigo-700 hover:bg-indigo-800 text-white rounded-xl text-xs font-bold transition-all shadow-sm active:scale-95 cursor-pointer"
            title="تفعيل وتحديث كروت الولاء لجميع حالات وتقارير الأرشيف بأثر رجعي"
          >
            <Zap className="w-4 h-4 text-amber-300" />
            <span>تفعيل الكروت لجميع حالات الأرشيف ⚡</span>
          </button>

          {/* New Card Modal */}
          <button
            onClick={() => setIsNewCardModalOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold transition-all shadow-sm active:scale-95 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>إصدار كارت ولاء جديد</span>
          </button>

          {/* Settings */}
          <button
            onClick={() => {
              setTempConfig(config);
              setIsSettingsOpen(true);
            }}
            className="flex items-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-colors cursor-pointer border border-slate-200"
          >
            <Sliders className="w-4 h-4 text-slate-500" />
            <span>سياسة النقاط والاستبدال</span>
          </button>
        </div>
      </div>

      {/* Main Grid: Profiles List + Single-Sided Card Display */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Patient Profiles Directory */}
        <div className="lg:col-span-4 bg-white rounded-2xl border border-slate-200 shadow-sm p-4 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h3 className="font-bold text-xs text-slate-800 flex items-center gap-2">
              <User className="w-4 h-4 text-slate-500" />
              <span>أعضاء برنامج الولاء ({filteredProfiles.length}):</span>
            </h3>
            <span className="text-[11px] font-mono text-slate-500">RT Lab VIP Club</span>
          </div>

          {/* Search box */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute right-3 top-2.5" />
            <input
              type="text"
              placeholder="بحث بالاسم، الهاتف، أو كود الكارت..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full pr-9 pl-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 focus:bg-white"
            />
          </div>

          {/* Profiles list */}
          <div className="space-y-2 max-h-[580px] overflow-y-auto pr-1">
            {filteredProfiles.length === 0 ? (
              <div className="text-center py-8 text-slate-400 text-xs">
                لا يوجد كروت مطابقة لبيانات البحث
              </div>
            ) : (
              filteredProfiles.map(p => {
                const tier = p.tier || getDynamicTier(p.totalPoints);
                const isSelected = p.patientId === activeProfile?.patientId;
                const cardNum = p.cardNumber || p.barcode;
                return (
                  <div
                    key={p.patientId}
                    onClick={() => setSelectedProfileId(p.patientId)}
                    className={`p-3 rounded-xl border text-right transition-all cursor-pointer ${
                      isSelected 
                        ? 'bg-amber-50/80 border-amber-400 shadow-xs' 
                        : 'bg-white hover:bg-slate-50 border-slate-200'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                        tier === 'VIP' ? 'bg-purple-100 text-purple-900 border-purple-300' :
                        tier === 'Platinum' ? 'bg-slate-200 text-slate-900 border-slate-400' :
                        tier === 'Gold' ? 'bg-amber-100 text-amber-900 border-amber-300' :
                        'bg-slate-100 text-slate-700 border-slate-300'
                      }`}>
                        ★ {tier}
                      </span>
                      <div className="font-bold text-xs text-slate-900">{p.patientName}</div>
                    </div>

                    <div className="flex items-center justify-between mt-2 text-[11px] text-slate-500 font-mono">
                      <span className="text-amber-800 font-bold font-sans">
                        {p.totalPoints.toLocaleString()} نقطة
                      </span>
                      <span>{p.phone}</span>
                    </div>

                    <div className="text-[10px] text-slate-400 font-mono mt-1 text-left">
                      {cardNum}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right Column: Single-Sided Card Preview & Complete Management */}
        <div className="lg:col-span-8 space-y-6">
          {activeProfile ? (
            <>
              {/* THE LUXURY SINGLE-SIDED CARD PREVIEW */}
              <div className="bg-slate-950 p-6 sm:p-8 rounded-3xl shadow-xl border border-slate-800 relative overflow-hidden flex flex-col items-center">
                {/* Visual Title */}
                <div className="w-full flex items-center justify-between text-xs text-amber-200/80 pb-3 mb-2 border-b border-slate-800/80 font-bold">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-amber-400" />
                    <span>معاينة كارت الولاء الطبي الذكي (وجه واحد قياسي معتمد):</span>
                  </div>
                  <span className="text-[11px] font-mono text-slate-400">CR80 • Single Side</span>
                </div>

                              {/* Field Customizer & Switcher Toolbar */}
              <div className="w-full bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-lg text-xs space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2 pb-2.5 border-b border-slate-800">
                  <div className="flex items-center gap-2">
                    <Sliders className="w-4 h-4 text-amber-400" />
                    <span className="font-black text-white text-xs sm:text-sm">تخصيص وتبديل حقول الكارت (وجه واحد فاخر):</span>
                    <span className="text-[10px] text-slate-400 bg-slate-800 px-2 py-0.5 rounded">تحكم كامل بإظهار/حذف كل حقل</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={resetAllCardFields}
                      className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-[11px] font-bold transition-colors cursor-pointer"
                      title="استعادة جميع الحقول الافتراضية"
                    >
                      استعادة الكل ✓
                    </button>
                    <button
                      onClick={() => setIsFieldCustomizerOpen(!isFieldCustomizerOpen)}
                      className="px-2.5 py-1 bg-amber-600/30 hover:bg-amber-600/50 text-amber-300 border border-amber-500/40 rounded-lg text-[11px] font-bold transition-colors cursor-pointer"
                    >
                      {isFieldCustomizerOpen ? 'إخفاء لوحة التحكم ▲' : 'إظهار خيارات التبديل ▼'}
                    </button>
                  </div>
                </div>

                {/* Color Theme Selector */}
                <div className="flex flex-wrap items-center gap-2 pt-1">
                  <span className="text-slate-400 font-bold text-[11px]">مظهر ولون الكارت:</span>
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => setCardTheme('royal-black')}
                      className={`px-2.5 py-1 rounded-lg text-[10px] font-bold border transition-all cursor-pointer ${cardFields.theme === 'royal-black' ? 'bg-amber-500/20 text-amber-300 border-amber-400' : 'bg-slate-800 text-slate-400 border-slate-700'}`}
                    >
                      👑 أسود ملكي وذهبي
                    </button>
                    <button
                      onClick={() => setCardTheme('sapphire')}
                      className={`px-2.5 py-1 rounded-lg text-[10px] font-bold border transition-all cursor-pointer ${cardFields.theme === 'sapphire' ? 'bg-blue-500/20 text-cyan-300 border-cyan-400' : 'bg-slate-800 text-slate-400 border-slate-700'}`}
                    >
                      💎 أزرق ياقوتي
                    </button>
                    <button
                      onClick={() => setCardTheme('emerald')}
                      className={`px-2.5 py-1 rounded-lg text-[10px] font-bold border transition-all cursor-pointer ${cardFields.theme === 'emerald' ? 'bg-emerald-500/20 text-emerald-300 border-emerald-400' : 'bg-slate-800 text-slate-400 border-slate-700'}`}
                    >
                      🌿 زمردي VIP
                    </button>
                    <button
                      onClick={() => setCardTheme('ruby')}
                      className={`px-2.5 py-1 rounded-lg text-[10px] font-bold border transition-all cursor-pointer ${cardFields.theme === 'ruby' ? 'bg-rose-500/20 text-rose-300 border-rose-400' : 'bg-slate-800 text-slate-400 border-slate-700'}`}
                    >
                      🍷 عنابي راقي
                    </button>
                  </div>
                </div>

                {/* Field Toggle Badges */}
                {isFieldCustomizerOpen && (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 pt-2 border-t border-slate-800">
                    {[
                      { key: 'showHeader', label: 'اسم وشعار المعمل' },
                      { key: 'showTierBadge', label: 'شارة الفئة والخصم' },
                      { key: 'showChip', label: 'الشريحة الذكية والـNFC' },
                      { key: 'showPoints', label: 'رصيد النقاط التراكمي' },
                      { key: 'showCardCode', label: 'كود الكارت والنسخ' },
                      { key: 'showPatientName', label: 'اسم المريض / العضو' },
                      { key: 'showPatientPhone', label: 'رقم هاتف المريض' },
                      { key: 'showBloodGroup', label: 'فصيلة الدم' },
                      { key: 'showDates', label: 'تاريخ الإصدار والصلاحية' },
                      { key: 'showUsageNote', label: 'تعليمات استخدام الكارت' },
                      { key: 'showHotline', label: 'الخط الساخن' },
                      { key: 'showAddress', label: 'عنوان المقر الرئيسي' },
                    ].map(f => {
                      const isVisible = cardFields[f.key as keyof CardCustomFields] ?? true;
                      return (
                        <div
                          key={f.key}
                          className={`p-2 rounded-xl border flex items-center justify-between gap-1 transition-all ${isVisible ? 'bg-slate-800/80 border-slate-700 text-white' : 'bg-rose-950/20 border-rose-900/40 text-slate-400 opacity-60'}`}
                        >
                          <span className="truncate text-[11px] font-bold">{f.label}</span>
                          <button
                            onClick={() => updateCardField(f.key as keyof CardCustomFields, !isVisible)}
                            className={`px-1.5 py-0.5 rounded text-[10px] font-black cursor-pointer transition-colors ${isVisible ? 'bg-rose-600/30 text-rose-300 hover:bg-rose-600/60' : 'bg-emerald-600/30 text-emerald-300 hover:bg-emerald-600/60'}`}
                            title={isVisible ? 'حذف / إخفاء هذا الحقل من الكارت' : 'استرجاع وإظهار هذا الحقل'}
                          >
                            {isVisible ? 'حذف ✕' : '+ إظهار'}
                          </button>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* THE SINGLE-SIDED CARD ITSELF */}
                <div className={`w-full max-w-[560px] aspect-[1.618/1] rounded-3xl p-6 sm:p-7 shadow-2xl border-2 relative overflow-hidden text-white flex flex-col justify-between select-none transition-all ${
                  cardFields.theme === 'sapphire' ? 'bg-gradient-to-br from-slate-950 via-blue-950 to-indigo-950 border-cyan-400/80' :
                  cardFields.theme === 'emerald' ? 'bg-gradient-to-br from-slate-950 via-emerald-950 to-teal-950 border-emerald-400/80' :
                  cardFields.theme === 'ruby' ? 'bg-gradient-to-br from-slate-950 via-rose-950 to-red-950 border-rose-400/80' :
                  'bg-gradient-to-br from-slate-950 via-slate-900 to-amber-950 border-amber-400/80'
                }`}>
                  {/* Subtle decorative mesh watermark */}
                  <div className="absolute -top-12 -right-12 w-48 h-48 bg-amber-500/10 rounded-full blur-2xl pointer-events-none"></div>
                  <div className="absolute -bottom-12 -left-12 w-48 h-48 bg-rose-600/10 rounded-full blur-2xl pointer-events-none"></div>

                  {/* Row 1: Header (Brand + Tier Badge) */}
                  {(cardFields.showHeader || cardFields.showTierBadge) && (
                  <div className="relative z-10 flex items-start justify-between">
                    {cardFields.showHeader ? (
                    <div>
                      <div className="flex items-center gap-2.5">
                        <div className="w-9 h-9 rounded-xl bg-amber-600/90 text-white font-black flex items-center justify-center text-sm shadow-sm border border-amber-300">
                          RT
                        </div>
                        <div>
                          <div className="font-black text-sm sm:text-base tracking-tight text-white leading-tight">
                            معامل RT للتحاليل الطبية والتشخيصية
                          </div>
                          <div className="text-[10px] text-amber-300 font-bold mt-0.5">
                            معامل رامي مختار • أطباء كلية طب قصر العيني
                          </div>
                        </div>
                      </div>
                    </div>
                    ) : <div></div>}

                    {cardFields.showTierBadge ? (
                    <div className="flex flex-col items-end gap-1">
                      <div className="px-3 py-1 bg-amber-500/20 text-amber-300 border border-amber-400/80 rounded-full text-xs font-bold flex items-center gap-1 shadow-xs">
                        <Sparkles className="w-3 h-3 text-amber-300" />
                        <span>★ {tierInfo.titleAr} ★</span>
                      </div>
                      <div className="text-[10px] font-bold text-rose-300 bg-rose-950/60 px-2 py-0.5 rounded-md border border-rose-800/40">
                        خصم دائم معتمد: %{currentDiscountRate}
                      </div>
                    </div>
                    ) : <div></div>}
                  </div>
                  )}

                  {/* Row 2: Chip + Points Box + NFC */}
                  {(cardFields.showChip || cardFields.showPoints) && (
                  <div className="relative z-10 flex items-center justify-between my-2">
                    {cardFields.showChip ? (
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-9 rounded-lg bg-gradient-to-br from-amber-200 via-amber-400 to-amber-600 border border-amber-200/90 p-1 flex flex-col justify-between shadow-sm">
                        <div className="h-px bg-amber-900/40 w-full"></div>
                        <div className="h-px bg-amber-900/40 w-full"></div>
                      </div>
                      <div className="text-amber-300/80 text-xs font-bold flex items-center gap-0.5" title="Contactless NFC">
                        <span>)))</span>
                      </div>
                    </div>
                    ) : <div></div>}

                    {cardFields.showPoints && (
                    <div className="bg-slate-900/80 border border-amber-400/40 px-3.5 py-1.5 rounded-xl text-left shadow-inner">
                      <div className="text-[10px] text-slate-300 font-semibold">رصيد النقاط التراكمي:</div>
                      <div className="text-base font-black text-amber-400 font-mono">
                        {activeProfile.totalPoints.toLocaleString()} <span className="text-xs font-sans">نقطة</span>
                      </div>
                      {cardFields.showCashValue && (
                      <div className="text-[9px] text-emerald-400 font-semibold">
                        قيمة الاستبدال: {pointsToCashValue(activeProfile.totalPoints)} ج.م
                      </div>
                      )}
                    </div>
                    )}
                  </div>
                  )}

                  {/* Row 3: Embossed Card Number */}
                  {cardFields.showCardCode && (
                  <div className="relative z-10 text-center my-1">
                    <div className="font-mono text-lg sm:text-2xl font-bold tracking-widest text-amber-100 drop-shadow-md flex items-center justify-center gap-3">
                      <span>{activeProfile.cardNumber || activeProfile.barcode}</span>
                      <button
                        onClick={handleCopyCardCode}
                        className="text-slate-400 hover:text-amber-300 transition-colors p-1 cursor-pointer"
                        title="نسخ رقم الكارت"
                      >
                        {copiedCode ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                  )}

                  {/* Row 4: Patient Info Grid (Single face, everything clear) */}
                  {(cardFields.showPatientName || cardFields.showPatientPhone || cardFields.showBloodGroup || cardFields.showHotline) && (
                  <div className="relative z-10 border-t border-slate-700/80 pt-2.5 grid grid-cols-3 gap-2 text-xs">
                    <div>
                      {cardFields.showPatientName && (
                      <>
                        <div className="text-[10px] text-slate-400 font-medium">اسم العضو / المريض:</div>
                        <div className="font-black text-white text-xs sm:text-sm truncate">
                          {activeProfile.patientName}
                        </div>
                      </>
                      )}
                      {cardFields.showPatientPhone && (
                      <div className="text-[11px] font-mono text-amber-200 mt-0.5">
                        {activeProfile.phone}
                      </div>
                      )}
                    </div>
                    <div className="text-center">
                      {cardFields.showBloodGroup && (
                      <>
                        <div className="text-[10px] text-slate-400 font-medium">فصيلة الدم:</div>
                        <div className="font-black text-rose-400 font-mono text-sm">
                          {activeProfile.bloodGroup || 'O+'}
                        </div>
                      </>
                      )}
                      {cardFields.showDates && (
                      <div className="text-[9px] text-emerald-400 font-medium">
                        صلاحية دائمة ✓
                      </div>
                      )}
                    </div>
                    <div className="text-left">
                      {cardFields.showHotline && (
                      <>
                        <div className="text-[10px] text-slate-400 font-medium">الخط الساخن:</div>
                        <div className="font-bold font-mono text-white text-xs">
                          01012345678
                        </div>
                      </>
                      )}
                      {cardFields.showAddress && (
                      <div className="text-[9px] text-slate-300 truncate">
                        بهتيم - شبرا الخيمة
                      </div>
                      )}
                    </div>
                  </div>
                  )}

                  {/* Row 5: Footer Bar */}
                  {cardFields.showFooter && (
                  <div className="relative z-10 border-t border-slate-800/80 pt-1.5 flex items-center justify-between text-[9px] text-slate-400 font-medium">
                    {cardFields.showAddress && (
                    <div className="truncate max-w-[320px]">الفرع الرئيسي: ميدان بهتيم برج صيدلية العزبي الدور الثالث</div>
                    )}
                    {cardFields.showUsageNote && (
                    <div className="text-amber-300 font-bold">RT LAB HEALTH PASS</div>
                    )}
                  </div>
                  )}
                </div>

                {/* Single-Sided Card Actions Toolbar */}
                <div className="w-full max-w-[560px] flex flex-wrap items-center justify-between gap-2 mt-5">
                  <div className="flex items-center gap-2">
                    {/* PNG Download */}
                    <button
                      onClick={handleDownloadSingleSidedPNG}
                      className="flex items-center gap-1.5 px-3.5 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold transition-all shadow-sm cursor-pointer"
                      title="تحميل صورة الكارت وجه واحد عالي الدقة PNG"
                    >
                      <Download className="w-4 h-4" />
                      <span>تحميل صورة الكارت (PNG)</span>
                    </button>

                    {/* Print */}
                    <button
                      onClick={handlePrintCard}
                      className="flex items-center gap-1.5 px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-bold transition-all border border-slate-700 cursor-pointer"
                      title="طباعة الكارت وجه واحد معزول على بياض"
                    >
                      <Printer className="w-4 h-4" />
                      <span>طباعة الكارت (CR80)</span>
                    </button>
                  </div>

                  <div className="flex items-center gap-2">
                    {/* Edit All Fields */}
                    <button
                      onClick={handleOpenEditModal}
                      className="flex items-center gap-1.5 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all shadow-sm cursor-pointer"
                      title="تعديل وتبديل كافة حقول الكارت"
                    >
                      <Edit3 className="w-4 h-4" />
                      <span>تعديل بيانات الكارت</span>
                    </button>

                    {/* Delete Card */}
                    <button
                      onClick={handleDeleteCard}
                      className="flex items-center gap-1.5 px-3 py-2 bg-rose-900/80 hover:bg-rose-900 text-rose-200 hover:text-white rounded-xl text-xs font-bold transition-all border border-rose-800 cursor-pointer"
                      title="حذف الكارت نهائياً"
                    >
                      <Trash2 className="w-4 h-4" />
                      <span>حذف</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* POINTS POLICY & TRANSACTIONS MANAGEMENT */}
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
                  <div>
                    <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                      <Award className="w-5 h-5 text-amber-500" />
                      <span>إدارة نقاط المريض: {activeProfile.patientName}</span>
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      المستوى الحالي: <strong className="text-amber-800 font-bold">{tierInfo.titleAr}</strong> (خصم دائم معتمد {currentDiscountRate}%)
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        setPointsAddMode('by_cash');
                        setIsAddPointsOpen(true);
                      }}
                      className="flex items-center gap-1.5 px-3.5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold rounded-xl transition-all shadow-sm cursor-pointer"
                    >
                      <Plus className="w-4 h-4" />
                      <span>إضافة نقاط</span>
                    </button>

                    <button
                      onClick={() => setIsRedeemOpen(true)}
                      className="flex items-center gap-1.5 px-3.5 py-2 bg-rose-800 hover:bg-rose-900 text-white text-xs font-bold rounded-xl transition-all shadow-sm cursor-pointer"
                    >
                      <Gift className="w-4 h-4" />
                      <span>استبدال نقاط بخصم نقدي</span>
                    </button>
                  </div>
                </div>

                {/* Stats Summary */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                    <div className="text-xs text-slate-500 font-medium">الرصيد النشط للنقاط:</div>
                    <div className="text-2xl font-black text-amber-800 font-mono mt-1">
                      {activeProfile.totalPoints.toLocaleString()}
                    </div>
                    <div className="text-[11px] text-slate-500 mt-1">
                      تساوي خصماً نقدياً: <strong className="text-emerald-700 font-bold">{pointsToCashValue(activeProfile.totalPoints)} ج.م</strong>
                    </div>
                  </div>

                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                    <div className="text-xs text-slate-500 font-medium">إجمالي الإنفاق المعملي:</div>
                    <div className="text-2xl font-black text-slate-900 font-mono mt-1">
                      {activeProfile.lifetimeSpent.toLocaleString()} <span className="text-sm font-sans">ج.م</span>
                    </div>
                    <div className="text-[11px] text-slate-500 mt-1">
                      عدد الفحوصات والزيارات المسجلة
                    </div>
                  </div>

                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                    <div className="text-xs text-slate-500 font-medium">فئة الخصم المعتمدة:</div>
                    <div className="text-2xl font-black text-rose-800 font-mono mt-1">
                      %{currentDiscountRate}
                    </div>
                    <div className="text-[11px] text-slate-500 mt-1">
                      خصم فوري دائم على كافة الفحوصات
                    </div>
                  </div>
                </div>

                {/* Transaction History with Delete per Transaction */}
                <div className="space-y-3 pt-2">
                  <div className="flex items-center justify-between">
                    <h4 className="font-bold text-xs text-slate-800 flex items-center gap-2">
                      <Clock className="w-4 h-4 text-slate-500" />
                      <span>سجل حركات واكتساب واستبدال النقاط ({activeProfile.transactions.length}):</span>
                    </h4>
                    <span className="text-[11px] text-slate-400">يمكن حذف أي حركة وإعادة ضبط الرصيد</span>
                  </div>

                  <div className="divide-y divide-slate-100 border border-slate-200 rounded-xl overflow-hidden max-h-[300px] overflow-y-auto">
                    {activeProfile.transactions.length === 0 ? (
                      <div className="p-6 text-center text-slate-400 text-xs">
                        لا توجد حركات نقاط مسجلة لهذا المريض حتى الآن
                      </div>
                    ) : (
                      activeProfile.transactions.map((tx) => (
                        <div key={tx.id} className="p-3.5 flex items-center justify-between text-xs hover:bg-slate-50 transition-colors">
                          <div className="flex items-center gap-3">
                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold ${
                              tx.points > 0 ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                            }`}>
                              {tx.points > 0 ? <ArrowDownLeft className="w-4 h-4" /> : <ArrowUpRight className="w-4 h-4" />}
                            </div>
                            <div>
                              <div className="font-bold text-slate-900">{tx.description}</div>
                              <div className="text-[11px] text-slate-400 font-mono mt-0.5">
                                {tx.date} {tx.invoiceNumber ? `• فاتورة #${tx.invoiceNumber}` : ''}
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-4">
                            <div className={`font-black font-mono text-sm ${
                              tx.points > 0 ? 'text-emerald-700' : 'text-rose-700'
                            }`}>
                              {tx.points > 0 ? `+${tx.points}` : tx.points} نقطة
                            </div>

                            {/* Delete Transaction button */}
                            <button
                              onClick={() => handleDeleteTransaction(tx.id)}
                              className="text-slate-400 hover:text-rose-600 transition-colors p-1 cursor-pointer"
                              title="حذف هذه الحركة وتحديث الرصيد"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center text-slate-400">
              <Award className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <div className="font-bold text-slate-700">لم يتم اختيار أي كارت مريض</div>
              <div className="text-xs text-slate-400 mt-1">اختر مريضاً من القائمة الجانبية أو اضغط على "تفعيل الكروت لجميع حالات الأرشيف"</div>
            </div>
          )}
        </div>
      </div>

      {/* MODAL 1: EDIT ALL CARD FIELDS (التبديل والتعديل والحذف لكل الحقول) */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-2xl w-full my-auto overflow-hidden">
            <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Edit3 className="w-5 h-5 text-blue-400" />
                <h3 className="font-black text-sm">تعديل وتبديل كافة حقول كارت الولاء</h3>
              </div>
              <button onClick={() => setIsEditModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEditProfile} className="p-6 space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">اسم المريض / العضو:</label>
                  <input
                    type="text"
                    value={editForm.patientName}
                    onChange={e => setEditForm(prev => ({ ...prev, patientName: e.target.value }))}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 font-bold"
                    required
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">رقم الهاتف:</label>
                  <input
                    type="text"
                    value={editForm.phone}
                    onChange={e => setEditForm(prev => ({ ...prev, phone: e.target.value }))}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 font-mono"
                    required
                  />
                </div>

                <div className="sm:col-span-2">
                  <div className="flex items-center justify-between mb-1">
                    <label className="font-bold text-slate-700">رقم / كود الكارت (Card Number):</label>
                    <button
                      type="button"
                      onClick={handleRegenerateCardCode}
                      className="text-[11px] text-blue-600 hover:text-blue-800 font-bold flex items-center gap-1 cursor-pointer"
                    >
                      <RefreshCw className="w-3 h-3" />
                      <span>توليد كود كارت جديد تلقائياً</span>
                    </button>
                  </div>
                  <input
                    type="text"
                    value={editForm.cardNumber}
                    onChange={e => setEditForm(prev => ({ ...prev, cardNumber: e.target.value }))}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 font-mono font-bold text-slate-900 bg-slate-50"
                    required
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">فئة العضوية (Tier):</label>
                  <select
                    value={editForm.tier}
                    onChange={e => setEditForm(prev => ({ ...prev, tier: e.target.value as LoyaltyTier }))}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white font-bold"
                  >
                    <option value="Silver">Silver VIP (خصم %5)</option>
                    <option value="Gold">Gold VIP (خصم %10)</option>
                    <option value="Platinum">Platinum VIP (خصم %15)</option>
                    <option value="VIP">Diamond Elite (خصم %20)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">فصيلة الدم (Blood Group):</label>
                  <select
                    value={editForm.bloodGroup}
                    onChange={e => setEditForm(prev => ({ ...prev, bloodGroup: e.target.value }))}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white font-bold"
                  >
                    <option value="O+">O+</option>
                    <option value="O-">O-</option>
                    <option value="A+">A+</option>
                    <option value="A-">A-</option>
                    <option value="B+">B+</option>
                    <option value="B-">B-</option>
                    <option value="AB+">AB+</option>
                    <option value="AB-">AB-</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">رصيد النقاط الإجمالي:</label>
                  <input
                    type="number"
                    value={editForm.totalPoints}
                    onChange={e => setEditForm(prev => ({ ...prev, totalPoints: Number(e.target.value) }))}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 font-mono font-bold text-amber-800"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">إجمالي الإنفاق (ج.م):</label>
                  <input
                    type="number"
                    value={editForm.lifetimeSpent}
                    onChange={e => setEditForm(prev => ({ ...prev, lifetimeSpent: Number(e.target.value) }))}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 font-mono"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">رقم هاتف الطوارئ (اختياري):</label>
                  <input
                    type="text"
                    value={editForm.emergencyContact}
                    onChange={e => setEditForm(prev => ({ ...prev, emergencyContact: e.target.value }))}
                    placeholder="يمكن تركه فارغاً للحذف"
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 font-mono"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">تاريخ الإصدار:</label>
                  <input
                    type="date"
                    value={editForm.issueDate}
                    onChange={e => setEditForm(prev => ({ ...prev, issueDate: e.target.value }))}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 font-mono"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block font-bold text-slate-700 mb-1">حالات صحية خاصة أو ملاحظات:</label>
                  <input
                    type="text"
                    value={editForm.chronicConditions}
                    onChange={e => setEditForm(prev => ({ ...prev, chronicConditions: e.target.value }))}
                    placeholder="مثال: حساسية بنسلين، سكري نمط 2 (افصل بفاصلة)"
                    className="w-full px-3 py-2 rounded-lg border border-slate-300"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setEditForm(prev => ({ ...prev, emergencyContact: '', chronicConditions: '' }))}
                  className="text-rose-700 hover:text-rose-900 font-bold"
                >
                  تفريغ الحقول الاختيارية
                </button>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setIsEditModalOpen(false)}
                    className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold"
                  >
                    إلغاء
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold shadow-sm"
                  >
                    حفظ وتحديث بيانات الكارت
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: ADD POINTS */}
      {isAddPointsOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6 space-y-4 text-xs">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="font-bold text-sm text-slate-900">إضافة نقاط لحساب المريض</h3>
              <button onClick={() => setIsAddPointsOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex rounded-lg bg-slate-100 p-1">
              <button
                type="button"
                onClick={() => setPointsAddMode('by_cash')}
                className={`flex-1 py-1.5 rounded-md font-bold transition-all ${
                  pointsAddMode === 'by_cash' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500'
                }`}
              >
                احتساب بمبلغ الفاتورة (ج.م)
              </button>
              <button
                type="button"
                onClick={() => setPointsAddMode('direct')}
                className={`flex-1 py-1.5 rounded-md font-bold transition-all ${
                  pointsAddMode === 'direct' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500'
                }`}
              >
                إدخال عدد النقاط مباشرة
              </button>
            </div>

            {pointsAddMode === 'by_cash' ? (
              <div>
                <label className="block text-slate-600 font-semibold mb-1">المبلغ المسدد (ج.م):</label>
                <input
                  type="number"
                  value={cashAmountForPoints}
                  onChange={e => setCashAmountForPoints(Number(e.target.value))}
                  className="w-full px-3 py-2 border rounded-lg font-mono text-sm"
                />
                <div className="text-[11px] text-emerald-600 font-semibold mt-1">
                  النقاط المحتسبة: {cashToPointsValue(cashAmountForPoints)} نقطة
                </div>
              </div>
            ) : (
              <div>
                <label className="block text-slate-600 font-semibold mb-1">عدد النقاط المضافة:</label>
                <input
                  type="number"
                  value={pointsToAdd}
                  onChange={e => setPointsToAdd(Number(e.target.value))}
                  className="w-full px-3 py-2 border rounded-lg font-mono text-sm"
                />
              </div>
            )}

            <div>
              <label className="block text-slate-600 font-semibold mb-1">بيان / سبب الإضافة:</label>
              <input
                type="text"
                value={pointsDescription}
                onChange={e => setPointsDescription(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg text-xs"
              />
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t">
              <button
                onClick={() => setIsAddPointsOpen(false)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-bold"
              >
                إلغاء
              </button>
              <button
                onClick={handleAddPoints}
                className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg font-bold"
              >
                تأكيد إضافة النقاط
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 3: REDEEM POINTS */}
      {isRedeemOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6 space-y-4 text-xs">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="font-bold text-sm text-slate-900">استبدال النقاط بخصم نقدي</h3>
              <button onClick={() => setIsRedeemOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="bg-amber-50 p-3 rounded-xl border border-amber-200">
              <div className="text-slate-600 font-medium">رصيد المريض المتاح:</div>
              <div className="text-xl font-black text-amber-800 font-mono mt-0.5">
                {activeProfile?.totalPoints || 0} نقطة
              </div>
              <div className="text-[11px] text-slate-500 mt-1">
                الحد الأقصى للخصم المتاح: <strong>{pointsToCashValue(activeProfile?.totalPoints || 0)} ج.م</strong>
              </div>
            </div>

            <div>
              <label className="block text-slate-600 font-semibold mb-1">النقاط المراد استبدالها:</label>
              <input
                type="number"
                max={activeProfile?.totalPoints || 0}
                value={pointsToRedeem}
                onChange={e => setPointsToRedeem(Number(e.target.value))}
                className="w-full px-3 py-2 border rounded-lg font-mono text-sm"
              />
              <div className="text-[11px] text-emerald-700 font-bold mt-1">
                قيمة الخصم النقدي الممنوح: {pointsToCashValue(pointsToRedeem)} ج.م
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t">
              <button
                onClick={() => setIsRedeemOpen(false)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-bold"
              >
                إلغاء
              </button>
              <button
                onClick={handleRedeemPoints}
                disabled={pointsToRedeem <= 0 || pointsToRedeem > (activeProfile?.totalPoints || 0)}
                className="px-4 py-2 bg-rose-800 hover:bg-rose-900 disabled:opacity-50 text-white rounded-lg font-bold"
              >
                تأكيد الاستبدال وتطبيق الخصم
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 4: NEW CARD MODAL */}
      {isNewCardModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6 space-y-4 text-xs">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="font-bold text-sm text-slate-900">إصدار كارت ولاء طبي جديد</h3>
              <button onClick={() => setIsNewCardModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateNewCard} className="space-y-3">
              <div>
                <label className="block text-slate-700 font-bold mb-1">اسم المريض:</label>
                <input
                  type="text"
                  value={newCardName}
                  onChange={e => setNewCardName(e.target.value)}
                  placeholder="الاسم ثلاثي أو رباعي"
                  className="w-full px-3 py-2 border rounded-lg text-xs"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">رقم الهاتف:</label>
                <input
                  type="text"
                  value={newCardPhone}
                  onChange={e => setNewCardPhone(e.target.value)}
                  placeholder="01012345678"
                  className="w-full px-3 py-2 border rounded-lg font-mono text-xs"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">فصيلة الدم:</label>
                <select
                  value={newCardBlood}
                  onChange={e => setNewCardBlood(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg text-xs bg-white"
                >
                  <option value="O+">O+</option>
                  <option value="O-">O-</option>
                  <option value="A+">A+</option>
                  <option value="A-">A-</option>
                  <option value="B+">B+</option>
                  <option value="B-">B-</option>
                  <option value="AB+">AB+</option>
                  <option value="AB-">AB-</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">رقم هاتف الطوارئ (اختياري):</label>
                <input
                  type="text"
                  value={newCardEmergency}
                  onChange={e => setNewCardEmergency(e.target.value)}
                  placeholder="هاتف قريب أو مرافق"
                  className="w-full px-3 py-2 border rounded-lg font-mono text-xs"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t">
                <button
                  type="button"
                  onClick={() => setIsNewCardModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-bold"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg font-bold"
                >
                  إصدار الكارت الذكي (هدية 100 نقطة)
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 5: SETTINGS & REDEMPTION POLICY */}
      {isSettingsOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-lg w-full p-6 space-y-4 text-xs">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="font-bold text-sm text-slate-900">سياسة احتساب النقاط واستبدال الخصومات</h3>
              <button onClick={() => setIsSettingsOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3 bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">النقاط المكتسبة لكل 1 ج.م:</label>
                  <input
                    type="number"
                    value={tempConfig.pointsPerEGP}
                    onChange={e => setTempConfig(prev => ({ ...prev, pointsPerEGP: Number(e.target.value) }))}
                    className="w-full px-3 py-1.5 border rounded-lg font-mono"
                  />
                  <span className="text-[10px] text-slate-500">الافتراضي: 1 نقطة / 1 ج.م</span>
                </div>
                <div>
                  <label className="block text-slate-700 font-bold mb-1">قيمة الخصم لكل 100 نقطة (ج.م):</label>
                  <input
                    type="number"
                    value={tempConfig.egpPer100Points}
                    onChange={e => setTempConfig(prev => ({ ...prev, egpPer100Points: Number(e.target.value) }))}
                    className="w-full px-3 py-1.5 border rounded-lg font-mono"
                  />
                  <span className="text-[10px] text-slate-500">الافتراضي: 10 ج.م / 100 نقطة</span>
                </div>
              </div>

              <div>
                <h4 className="font-bold text-slate-800 mb-2">نسب الخصم الدائم ومستويات العضوية:</h4>
                <div className="space-y-2">
                  <div className="flex items-center justify-between bg-slate-50 p-2.5 rounded-lg border">
                    <span className="font-bold text-slate-700">Silver VIP (0 نقطة فأكثر):</span>
                    <div className="flex items-center gap-1">
                      <input
                        type="number"
                        value={tempConfig.tiers.Silver.discountRate}
                        onChange={e => setTempConfig(prev => ({
                          ...prev,
                          tiers: { ...prev.tiers, Silver: { ...prev.tiers.Silver, discountRate: Number(e.target.value) } }
                        }))}
                        className="w-16 px-2 py-1 border rounded text-center font-mono font-bold"
                      />
                      <span>%</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between bg-amber-50 p-2.5 rounded-lg border border-amber-200">
                    <span className="font-bold text-amber-900">Gold VIP (500 نقطة فأكثر):</span>
                    <div className="flex items-center gap-1">
                      <input
                        type="number"
                        value={tempConfig.tiers.Gold.discountRate}
                        onChange={e => setTempConfig(prev => ({
                          ...prev,
                          tiers: { ...prev.tiers, Gold: { ...prev.tiers.Gold, discountRate: Number(e.target.value) } }
                        }))}
                        className="w-16 px-2 py-1 border rounded text-center font-mono font-bold text-amber-900"
                      />
                      <span>%</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between bg-slate-100 p-2.5 rounded-lg border">
                    <span className="font-bold text-slate-900">Platinum VIP (1500 نقطة فأكثر):</span>
                    <div className="flex items-center gap-1">
                      <input
                        type="number"
                        value={tempConfig.tiers.Platinum.discountRate}
                        onChange={e => setTempConfig(prev => ({
                          ...prev,
                          tiers: { ...prev.tiers, Platinum: { ...prev.tiers.Platinum, discountRate: Number(e.target.value) } }
                        }))}
                        className="w-16 px-2 py-1 border rounded text-center font-mono font-bold"
                      />
                      <span>%</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between bg-purple-50 p-2.5 rounded-lg border border-purple-200">
                    <span className="font-bold text-purple-900">Diamond Elite (3000 نقطة فأكثر):</span>
                    <div className="flex items-center gap-1">
                      <input
                        type="number"
                        value={tempConfig.tiers.VIP.discountRate}
                        onChange={e => setTempConfig(prev => ({
                          ...prev,
                          tiers: { ...prev.tiers, VIP: { ...prev.tiers.VIP, discountRate: Number(e.target.value) } }
                        }))}
                        className="w-16 px-2 py-1 border rounded text-center font-mono font-bold text-purple-900"
                      />
                      <span>%</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-between items-center pt-3 border-t">
              <button
                type="button"
                onClick={() => setTempConfig(DEFAULT_LOYALTY_CONFIG)}
                className="text-slate-500 hover:text-slate-700 text-xs font-semibold"
              >
                استعادة القيم الافتراضية
              </button>

              <div className="flex gap-2">
                <button
                  onClick={() => setIsSettingsOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-bold"
                >
                  إلغاء
                </button>
                <button
                  onClick={() => {
                    setConfig(tempConfig);
                    localStorage.setItem('rt_lab_loyalty_settings', JSON.stringify(tempConfig));
                    setIsSettingsOpen(false);
                  }}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold"
                >
                  حفظ وتطبيق السياسة
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
