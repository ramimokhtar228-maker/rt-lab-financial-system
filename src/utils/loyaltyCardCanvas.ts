import { BRANCH_MAIN_ADDRESS, LAB_NAME_AR } from './whatsapp';

export interface CardCustomFields {
  showHeader?: boolean;
  showTierBadge?: boolean;
  showChip?: boolean;
  showPoints?: boolean;
  showCashValue?: boolean;
  showCardCode?: boolean;
  showPatientName?: boolean;
  showPatientPhone?: boolean;
  showBloodGroup?: boolean;
  showDates?: boolean;
  showUsageNote?: boolean;
  showFooter?: boolean;
  showHotline?: boolean;
  showAddress?: boolean;
}

export interface LoyaltyCardParams {
  cardNumber: string;
  patientName: string;
  patientPhone: string;
  tier: string;
  discountPercentage: number;
  points: number;
  bloodGroup?: string;
  issueDate?: string;
  emergencyContact?: string;
  address?: string;
  hotline?: string;
  fields?: CardCustomFields;
  theme?: 'royal-black' | 'sapphire' | 'emerald' | 'ruby';
}

export function generateAndDownloadLoyaltyCard(params: LoyaltyCardParams): Promise<string> {
  return new Promise((resolve) => {
    const canvas = document.createElement('canvas');
    canvas.width = 1050;
    canvas.height = 650;
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      resolve('');
      return;
    }

    const fields: Required<CardCustomFields> = {
      showHeader: params.fields?.showHeader ?? true,
      showTierBadge: params.fields?.showTierBadge ?? true,
      showChip: params.fields?.showChip ?? true,
      showPoints: params.fields?.showPoints ?? true,
      showCashValue: params.fields?.showCashValue ?? true,
      showCardCode: params.fields?.showCardCode ?? true,
      showPatientName: params.fields?.showPatientName ?? true,
      showPatientPhone: params.fields?.showPatientPhone ?? true,
      showBloodGroup: params.fields?.showBloodGroup ?? true,
      showDates: params.fields?.showDates ?? true,
      showUsageNote: params.fields?.showUsageNote ?? true,
      showFooter: params.fields?.showFooter ?? true,
      showHotline: params.fields?.showHotline ?? true,
      showAddress: params.fields?.showAddress ?? true,
    };

    const blood = params.bloodGroup || 'O+';
    const issueDate = params.issueDate || new Date().toISOString().substring(0, 10);
    const hotline = params.hotline || '01012345678 / 02-44667788';
    const address = params.address || BRANCH_MAIN_ADDRESS || 'ميدان بهتيم برج صيدلية العزبي الدور الثالث شبرا الخيمة';
    const theme = params.theme || 'royal-black';

    // 1. Luxury Background Gradient
    const bgGradient = ctx.createLinearGradient(0, 0, 1050, 650);
    if (theme === 'sapphire') {
      bgGradient.addColorStop(0, '#030712');
      bgGradient.addColorStop(0.35, '#0c1a30');
      bgGradient.addColorStop(0.7, '#172554');
      bgGradient.addColorStop(1, '#020617');
    } else if (theme === 'emerald') {
      bgGradient.addColorStop(0, '#021a12');
      bgGradient.addColorStop(0.35, '#064e3b');
      bgGradient.addColorStop(0.7, '#022c22');
      bgGradient.addColorStop(1, '#01150e');
    } else if (theme === 'ruby') {
      bgGradient.addColorStop(0, '#1c0a00');
      bgGradient.addColorStop(0.35, '#311010');
      bgGradient.addColorStop(0.7, '#4c0519');
      bgGradient.addColorStop(1, '#0f0505');
    } else {
      // royal-black (Default)
      bgGradient.addColorStop(0, '#090d16');
      bgGradient.addColorStop(0.35, '#0f172a');
      bgGradient.addColorStop(0.7, '#1e1b4b');
      bgGradient.addColorStop(1, '#020617');
    }

    const radius = 36;
    ctx.beginPath();
    ctx.roundRect(0, 0, 1050, 650, radius);
    ctx.fillStyle = bgGradient;
    ctx.fill();

    // 2. Metallic Outer Border
    ctx.lineWidth = 6;
    const borderGrad = ctx.createLinearGradient(0, 0, 1050, 650);
    borderGrad.addColorStop(0, '#fbbf24');
    borderGrad.addColorStop(0.3, '#d97706');
    borderGrad.addColorStop(0.6, '#fef08a');
    borderGrad.addColorStop(1, '#b45309');
    ctx.strokeStyle = borderGrad;
    ctx.stroke();

    // 3. Subtle grid watermark
    ctx.save();
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.03)';
    ctx.lineWidth = 1;
    for (let x = 40; x < 1050; x += 50) {
      ctx.beginPath();
      ctx.moveTo(x, 20);
      ctx.lineTo(x, 630);
      ctx.stroke();
    }
    for (let y = 40; y < 650; y += 50) {
      ctx.beginPath();
      ctx.moveTo(20, y);
      ctx.lineTo(1030, y);
      ctx.stroke();
    }
    ctx.restore();

    // 4. Header: RT Brand Logo & Title (Top Right)
    if (fields.showHeader) {
      ctx.fillStyle = '#b45309';
      ctx.beginPath();
      ctx.roundRect(930, 42, 70, 70, 16);
      ctx.fill();

      ctx.strokeStyle = '#fef08a';
      ctx.lineWidth = 2;
      ctx.stroke();

      ctx.fillStyle = '#ffffff';
      ctx.font = '900 38px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('RT', 965, 77);

      ctx.fillStyle = '#ffffff';
      ctx.textAlign = 'right';
      ctx.font = 'bold 27px sans-serif';
      ctx.fillText(LAB_NAME_AR || 'معامل RT للتحاليل الطبية والتشخيصية', 910, 62);

      ctx.font = 'bold 15px sans-serif';
      ctx.fillStyle = '#fde68a';
      ctx.fillText('معامل رامي مختار • أطباء واستشاريو كلية طب قصر العيني', 910, 92);

      ctx.font = '500 13px sans-serif';
      ctx.fillStyle = 'rgba(255, 255, 255, 0.65)';
      ctx.fillText('RT Medical Diagnostic Laboratories • VIP Health Pass', 910, 114);
    }

    // 5. Tier Badge (Top Left)
    if (fields.showTierBadge) {
      const tierBgGrad = ctx.createLinearGradient(45, 45, 260, 100);
      tierBgGrad.addColorStop(0, 'rgba(245, 158, 11, 0.25)');
      tierBgGrad.addColorStop(1, 'rgba(217, 119, 6, 0.45)');
      ctx.fillStyle = tierBgGrad;
      ctx.beginPath();
      ctx.roundRect(45, 45, 230, 52, 26);
      ctx.fill();

      ctx.strokeStyle = '#fbbf24';
      ctx.lineWidth = 2;
      ctx.stroke();

      ctx.fillStyle = '#fef08a';
      ctx.font = 'bold 19px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(`★ ${params.tier} ★`, 160, 77);

      ctx.fillStyle = 'rgba(244, 63, 94, 0.2)';
      ctx.beginPath();
      ctx.roundRect(45, 106, 230, 36, 12);
      ctx.fill();

      ctx.strokeStyle = 'rgba(251, 113, 133, 0.4)';
      ctx.lineWidth = 1;
      ctx.stroke();

      ctx.fillStyle = '#fda4af';
      ctx.font = 'bold 14px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(`خصم دائم معتمد: %${params.discountPercentage || 15} على كافة التحاليل`, 160, 129);
    }

    // 6. EMV Smart Chip & Contactless
    if (fields.showChip) {
      const chipX = 55;
      const chipY = 165;
      const chipW = 85;
      const chipH = 65;
      const chipGrad = ctx.createLinearGradient(chipX, chipY, chipX + chipW, chipY + chipH);
      chipGrad.addColorStop(0, '#fde68a');
      chipGrad.addColorStop(0.5, '#d97706');
      chipGrad.addColorStop(1, '#92400e');
      ctx.fillStyle = chipGrad;
      ctx.beginPath();
      ctx.roundRect(chipX, chipY, chipW, chipH, 12);
      ctx.fill();

      ctx.strokeStyle = '#fef3c7';
      ctx.lineWidth = 1.5;
      ctx.stroke();

      ctx.strokeStyle = 'rgba(69, 26, 3, 0.6)';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(chipX + 28, chipY);
      ctx.lineTo(chipX + 28, chipY + chipH);
      ctx.moveTo(chipX + 57, chipY);
      ctx.lineTo(chipX + 57, chipY + chipH);
      ctx.moveTo(chipX, chipY + 32);
      ctx.lineTo(chipX + chipW, chipY + 32);
      ctx.stroke();

      ctx.strokeStyle = 'rgba(254, 240, 138, 0.8)';
      ctx.lineWidth = 3;
      for (let r = 1; r <= 3; r++) {
        ctx.beginPath();
        ctx.arc(175, 197, r * 11, -Math.PI / 3, Math.PI / 3, false);
        ctx.stroke();
      }
    }

    // 7. Points Balance Box
    if (fields.showPoints) {
      const ptsGrad = ctx.createLinearGradient(680, 155, 990, 225);
      ptsGrad.addColorStop(0, 'rgba(15, 23, 42, 0.8)');
      ptsGrad.addColorStop(1, 'rgba(30, 41, 59, 0.9)');
      ctx.fillStyle = ptsGrad;
      ctx.beginPath();
      ctx.roundRect(680, 155, 320, 72, 16);
      ctx.fill();

      ctx.strokeStyle = 'rgba(245, 158, 11, 0.5)';
      ctx.lineWidth = 1.5;
      ctx.stroke();

      ctx.textAlign = 'right';
      ctx.fillStyle = 'rgba(255, 255, 255, 0.65)';
      ctx.font = 'bold 13px sans-serif';
      ctx.fillText('رصيد نقاط الولاء التراكمي:', 980, 182);

      ctx.fillStyle = '#fbbf24';
      ctx.font = '900 28px sans-serif';
      ctx.fillText(`${Number(params.points || 0).toLocaleString()} نقطة`, 980, 214);
    }

    // 8. Card Number Display
    if (fields.showCardCode) {
      ctx.textAlign = 'center';
      ctx.font = 'bold 36px monospace';
      ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
      ctx.fillText(params.cardNumber, 527, 287);
      ctx.fillStyle = '#ffffff';
      ctx.fillText(params.cardNumber, 525, 285);
    }

    // Horizontal gold divider
    const divGrad = ctx.createLinearGradient(45, 315, 1005, 315);
    divGrad.addColorStop(0, 'rgba(251, 191, 36, 0.05)');
    divGrad.addColorStop(0.5, 'rgba(251, 191, 36, 0.8)');
    divGrad.addColorStop(1, 'rgba(251, 191, 36, 0.05)');
    ctx.strokeStyle = divGrad;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(45, 315);
    ctx.lineTo(1005, 315);
    ctx.stroke();

    // 9. Patient Information
    if (fields.showPatientName) {
      ctx.textAlign = 'right';
      ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
      ctx.font = 'bold 15px sans-serif';
      ctx.fillText('اسم المريض / العضو المعتمد:', 990, 350);
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 28px sans-serif';
      ctx.fillText(params.patientName, 990, 385);
    }

    if (fields.showPatientPhone) {
      ctx.textAlign = 'right';
      ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
      ctx.font = 'bold 14px sans-serif';
      ctx.fillText('رقم الهاتف المسجل:', 990, 428);
      ctx.fillStyle = '#fde68a';
      ctx.font = 'bold 22px monospace';
      ctx.fillText(params.patientPhone, 990, 458);
    }

    // Blood Group
    if (fields.showBloodGroup) {
      ctx.textAlign = 'left';
      ctx.fillStyle = 'rgba(225, 29, 72, 0.25)';
      ctx.beginPath();
      ctx.roundRect(50, 345, 190, 60, 14);
      ctx.fill();

      ctx.strokeStyle = 'rgba(244, 63, 94, 0.5)';
      ctx.lineWidth = 1.5;
      ctx.stroke();

      ctx.fillStyle = '#fda4af';
      ctx.font = 'bold 13px sans-serif';
      ctx.fillText('فصيلة الدم (Blood Group):', 65, 370);

      ctx.fillStyle = '#ffffff';
      ctx.font = '900 24px monospace';
      ctx.fillText(blood, 65, 396);
    }

    // Dates
    if (fields.showDates) {
      ctx.textAlign = 'left';
      ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
      ctx.font = 'bold 13px sans-serif';
      ctx.fillText('تاريخ الإصدار:', 50, 435);
      ctx.fillStyle = '#e2e8f0';
      ctx.font = 'bold 16px monospace';
      ctx.fillText(issueDate, 50, 458);

      ctx.fillStyle = '#34d399';
      ctx.font = 'bold 13px sans-serif';
      ctx.fillText('صلاحية الكارت: دائم مدى الحياة ✓', 50, 484);
    }

    // Usage Note
    if (fields.showUsageNote) {
      ctx.textAlign = 'center';
      ctx.fillStyle = 'rgba(255, 255, 255, 0.55)';
      ctx.font = '13px sans-serif';
      ctx.fillText('• يمنح هذا الكارت حامله وأسرته الخصم الدائم وتجميع النقاط التلقائي فور إبرازه بالمعمل أو بالزيارات المنزلية •', 525, 520);
    }

    // 10. Bottom Footer Bar
    if (fields.showFooter && (fields.showHotline || fields.showAddress)) {
      ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
      ctx.beginPath();
      ctx.roundRect(25, 545, 1000, 80, 18);
      ctx.fill();

      ctx.strokeStyle = 'rgba(251, 191, 36, 0.3)';
      ctx.lineWidth = 1;
      ctx.stroke();

      ctx.textAlign = 'center';
      if (fields.showHotline) {
        ctx.fillStyle = '#fef08a';
        ctx.font = 'bold 16px sans-serif';
        ctx.fillText(`📞 الخط الساخن والواتساب: ${hotline}  |  🏥 إشراف أ.د رامي مختار`, 525, 575);
      }
      if (fields.showAddress) {
        ctx.fillStyle = '#cbd5e1';
        ctx.font = '13px sans-serif';
        ctx.fillText(`📍 ${address}`, 525, 603);
      }
    }

    const dataUrl = canvas.toDataURL('image/png');
    try {
      const link = document.createElement('a');
      link.download = `RT-Loyalty-Card-${params.cardNumber}.png`;
      link.href = dataUrl;
      document.body.appendChild(link);
      link.click();
      setTimeout(() => {
        if (link.parentNode) link.parentNode.removeChild(link);
      }, 500);
    } catch (e) {
      console.warn('Card download notice:', e);
    }

    resolve(dataUrl);
  });
}
