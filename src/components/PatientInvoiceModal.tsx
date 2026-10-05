import { tafqeetEGP } from '../utils/tafqeet';
import React, { useRef, useState } from 'react';
import { LabReport } from '../types/lab';
import { RTLogo } from './RTLogo';
import { 
  Printer, 
  Download, 
  Share2, 
  X, 
  Receipt, 
  CheckCircle2, 
  Clock, 
  User, 
  Phone, 
  Calendar, 
  CreditCard,
  Building2,
  PhoneCall,
  Loader2,
  Percent
} from 'lucide-react';
import { formatWhatsAppMessage, openWhatsApp } from '../utils/whatsapp';

interface PatientInvoiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  report: LabReport;
  onUpdateReport?: (updatedReport: LabReport) => void;
}

export const PatientInvoiceModal: React.FC<PatientInvoiceModalProps> = ({
  isOpen,
  onClose,
  report,
  onUpdateReport
}) => {
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const invoiceContainerRef = useRef<HTMLDivElement>(null);

  if (!isOpen || !report) return null;

  // Load dynamic lab info and contact details
  const labInfo = (() => {
    try {
      const saved = localStorage.getItem('rt_lab_info_v2');
      if (saved) return JSON.parse(saved);
    } catch {}
    return {
      labNameAr: "معامل RT للتحاليل الطبية والتشخيصية",
      hotline: "01012345678",
      phone: "0244667788",
      whatsapp: "01012345678",
      mainAddress: "ميدان بهتيم برج صيدليه العزبى الدور الثالث امام الأسانسير شبرا الخيمه"
    };
  })();

  const p = report.patient;
  const invoiceNumber = p.clinicalHistory?.match(/فاتورة\s*(?:مالية)?\s*رقم\s*([\w\d-]+)/i)?.[1] 
    || `INV-${p.labNumber || '2026'}`;
  
  // Calculate prices based on profiles and parameters
  const items = report.profiles.map((prof, idx) => {
    // Estimations or package prices
    let price = 150;
    if (prof.profileCode === 'CBC') price = 180;
    else if (prof.profileCode === 'LFT') price = 250;
    else if (prof.profileCode === 'KFT') price = 200;
    else if (prof.profileCode === 'LIPID') price = 220;
    else if (prof.profileCode === 'GLYCEMIC') price = 120;
    else if (prof.profileCode === 'THYROID') price = 300;
    else if (prof.profileCode === 'COAG') price = 150;
    else if (prof.parameters.length > 5) price = 200;
    else price = Math.max(80, prof.parameters.length * 40);

    return {
      id: prof.id || `item-${idx}`,
      titleAr: prof.titleAr || prof.titleEn,
      titleEn: prof.titleEn,
      category: prof.category || 'تحاليل تشخيصية',
      sampleType: prof.sampleType || 'Serum',
      parametersCount: prof.parameters.length,
      price: price
    };
  });

  const visitFee = (p as any).visitFee || 0;
  const testsSubtotal = report.packageApplied?.packagePrice 
    || (p as any).testsSubtotal 
    || (p.totalCost ? Math.max(0, p.totalCost - visitFee) : items.reduce((sum, item) => sum + item.price, 0));
  const subtotal = testsSubtotal + visitFee;

  const [activePercent, setActivePercent] = useState<number | null>(
    p.discountType === 'percentage' && p.discountApplied
      ? Math.round((p.discountApplied / subtotal) * 100)
      : null
  );
  const [customPercent, setCustomPercent] = useState<number>(activePercent || 15);
  const [customFlatDiscount, setCustomFlatDiscount] = useState<number>(0);
  const [discountAmount, setDiscountAmount] = useState<number>(p.discountApplied || 0);

  // Sync if report changes
  React.useEffect(() => {
    setDiscountAmount(p.discountApplied || 0);
  }, [p.discountApplied]);

  const discount = discountAmount;
  const netTotal = Math.max(0, subtotal - discount);

  const handleApplyPercentage = (pct: number) => {
    setActivePercent(pct);
    setCustomPercent(pct);
    const disc = Math.round((testsSubtotal * pct) / 100);
    setDiscountAmount(disc);
    if (onUpdateReport) {
      onUpdateReport({
        ...report,
        patient: {
          ...p,
          discountType: 'percentage',
          discountApplied: disc
        }
      });
    }
  };

  const handleCustomPercentChange = (pct: number) => {
    setActivePercent(pct);
    setCustomPercent(pct);
    const disc = Math.round((testsSubtotal * pct) / 100);
    setDiscountAmount(disc);
    if (onUpdateReport) {
      onUpdateReport({
        ...report,
        patient: {
          ...p,
          discountType: 'percentage',
          discountApplied: disc
        }
      });
    }
  };

  const handleFlatDiscountChange = (flat: number) => {
    setActivePercent(null);
    setCustomFlatDiscount(flat);
    const disc = Math.min(subtotal, flat);
    setDiscountAmount(disc);
    if (onUpdateReport) {
      onUpdateReport({
        ...report,
        patient: {
          ...p,
          discountType: 'daily_fixed',
          discountApplied: disc
        }
      });
    }
  };

  const handleResetDiscount = () => {
    setActivePercent(null);
    setDiscountAmount(0);
    if (onUpdateReport) {
      onUpdateReport({
        ...report,
        patient: {
          ...p,
          discountType: 'none',
          discountApplied: 0
        }
      });
    }
  };
  const isPaid = !p.clinicalHistory?.includes('متبقي');
  const paidAmount = isPaid ? netTotal : Math.round(netTotal * 0.5);
  const remainingAmount = netTotal - paidAmount;

  const sampleDateFormatted = p.sampleDate ? new Date(p.sampleDate).toLocaleDateString('ar-EG', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  }) : 'اليوم';

  const reportingDateFormatted = p.reportingDate ? new Date(p.reportingDate).toLocaleDateString('ar-EG', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }) : 'خلال 24 ساعة';

  // 1. Direct Isolated Print Window (100% white background, zero app background)
  const handlePrintInvoice = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      alert('يرجى السماح بالنوافذ المنبثقة لطباعة الفاتورة.');
      return;
    }

    const itemsHtml = items.map((it, i) => `
      <tr style="border-bottom: 1px solid #e2e8f0; font-size: 11.5px;">
        <td style="padding: 8px 12px; text-align: center; color: #64748b; font-family: monospace;">${i + 1}</td>
        <td style="padding: 8px 12px; text-align: right; font-weight: bold; color: #0f172a;">
          ${it.titleAr}
          <span style="display:block; font-size: 10px; color: #64748b; font-weight: normal;" dir="ltr">${it.titleEn}</span>
        </td>
        <td style="padding: 8px 12px; text-align: center; color: #475569;">${it.sampleType}</td>
        <td style="padding: 8px 12px; text-align: center; font-family: monospace;">${it.parametersCount} عنصر</td>
        <td style="padding: 8px 12px; text-align: left; font-family: monospace; font-weight: bold; color: #800000;" dir="ltr">${it.price.toFixed(2)} EGP</td>
      </tr>
    `).join('');

    const htmlContent = `<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
  <meta charset="UTF-8">
  <title>فاتورة فحص طبي - ${p.fullName} - ${invoiceNumber}</title>
  <link href="https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700;800;900&family=JetBrains+Mono:wght@500;700&display=swap" rel="stylesheet">
  <style>
    * { box-sizing: border-box; }
    html, body {
      margin: 0;
      padding: 0;
      background: #ffffff !important;
      background-color: #ffffff !important;
      font-family: 'Cairo', sans-serif;
      color: #0f172a;
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
    }
    .no-print-toolbar {
      position: sticky;
      top: 0;
      background: #0f172a;
      color: #ffffff;
      padding: 12px 24px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      z-index: 100;
    }
    .btn-print {
      background: #800000;
      color: white;
      border: none;
      padding: 8px 20px;
      border-radius: 8px;
      font-weight: bold;
      cursor: pointer;
      font-family: 'Cairo', sans-serif;
    }
    .btn-close {
      background: #334155;
      color: white;
      border: none;
      padding: 8px 16px;
      border-radius: 8px;
      cursor: pointer;
      font-family: 'Cairo', sans-serif;
    }
    .invoice-card {
      width: 210mm;
      min-height: 297mm;
      margin: 0 auto;
      padding: 15mm 18mm;
      background: #ffffff;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
    }
    @media print {
      .no-print-toolbar { display: none !important; }
      body { margin: 0 !important; padding: 0 !important; background: #ffffff !important; }
      .invoice-card { width: 100% !important; margin: 0 !important; padding: 10mm 14mm !important; }
      @page { size: A4 portrait; margin: 0; }
    }
  </style>
</head>
<body>
  <div class="no-print-toolbar">
    <div style="font-weight: bold; font-size: 13px;">معامل RT - طباعة فاتورة المريض الرسمية (A4)</div>
    <div style="display:flex; gap:10px;">
      <button class="btn-print" onclick="window.print()">🖨️ طباعة الفاتورة أو حفظ كـ PDF</button>
      <button class="btn-close" onclick="window.close()">إغلاق النافذة ✕</button>
    </div>
  </div>

  <div class="invoice-card">
    <div>
      <!-- Official Header -->
      <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #800000; padding-bottom: 12px;">
        <div style="text-align: right; flex: 1;">
          <h1 style="margin: 0; font-size: 19px; font-weight: 900; color: #800000;">معامل RT للتحاليل التشخيصية</h1>
          <h2 style="margin: 2px 0 0 0; font-size: 13px; font-weight: 700; color: #0f172a;">معامل د. رامي مختار</h2>
          <p style="margin: 2px 0 0 0; font-size: 11px; font-weight: 600; color: #800000;">أطباء الباثولوجيا الإكلينيكية والكيميائية - طب قصر العيني</p>
          <p style="margin: 2px 0 0 0; font-size: 10px; color: #64748b;">المقر الرئيسي: ${labInfo.mainAddress} | الخط الساخن: ${labInfo.hotline}</p>
        </div>

        <div style="text-align: center; padding: 0 16px;">
          <div style="display: inline-block; background: #800000; color: white; padding: 4px 14px; border-radius: 6px; font-weight: 900; font-size: 13px; letter-spacing: 0.5px;">
            فاتورة فحص وإيصال سداد
          </div>
          <div style="font-size: 10px; color: #64748b; margin-top: 4px; font-family: monospace;">RECEIPT & INVOICE</div>
        </div>

        <div style="text-align: left; flex: 1;" dir="ltr">
          <h1 style="margin: 0; font-size: 18px; font-weight: 900; color: #800000;">RT LAB LABORATORIES</h1>
          <h2 style="margin: 2px 0 0 0; font-size: 12px; font-weight: 700; color: #0f172a;">Dr. Rami Mokhtar Labs</h2>
          <p style="margin: 2px 0 0 0; font-size: 10px; color: #64748b;">Kasr Al Ainy Faculty of Medicine</p>
          <p style="margin: 2px 0 0 0; font-size: 10px; color: #800000; font-family: monospace;">${invoiceNumber}</p>
        </div>
      </div>

      <!-- Stripe -->
      <div style="display: flex; height: 3px; width: 100%; margin-top: 3px; margin-bottom: 14px;">
        <div style="width: 75%; background: #800000;"></div>
        <div style="width: 25%; background: #0f172a;"></div>
      </div>

      <!-- Patient & Invoice Meta Box -->
      <div style="background: #f8fafc; border: 1px solid #cbd5e1; border-radius: 8px; padding: 12px 14px; margin-bottom: 16px; font-size: 12px;">
        <div style="display: grid; grid-template-columns: 2fr 1fr 1fr; gap: 8px 14px;">
          <div>
            <span style="color: #64748b;">اسم المريض:</span>
            <strong style="color: #0f172a; font-size: 13px; margin-right: 4px;">${p.fullName}</strong>
          </div>
          <div dir="ltr" style="text-align: right;">
            <span style="color: #64748b;">رقم المعمل:</span>
            <strong style="color: #800000; font-family: monospace; font-size: 13px; margin-left: 4px;">${p.labNumber}</strong>
          </div>
          <div dir="ltr" style="text-align: right;">
            <span style="background: white; border: 1px solid #cbd5e1; padding: 2px 6px; border-radius: 4px; font-family: monospace; font-size: 10px;">||| ${p.barcode}</span>
          </div>

          <div>
            <span style="color: #64748b;">السن / النوع:</span>
            <strong style="margin-right: 4px;">${p.age} ${p.ageUnit === 'years' ? 'سنة' : 'شهر'} / ${p.gender === 'male' ? 'ذكر' : 'أنثى'}</strong>
          </div>
          <div>
            <span style="color: #64748b;">تاريخ السحب:</span>
            <span style="font-family: monospace; margin-right: 4px;">${sampleDateFormatted}</span>
          </div>
          <div>
            <span style="color: #64748b;">موعد الاستلام:</span>
            <span style="font-family: monospace; margin-right: 4px; color: #800000; font-weight: bold;">${reportingDateFormatted}</span>
          </div>

          <div style="grid-column: span 2;">
            <span style="color: #64748b;">الطبيب المعالج:</span>
            <strong style="margin-right: 4px;">${p.referringDoctorName || 'طلب فحص ذاتي (Self-Request)'}</strong>
          </div>
          <div dir="ltr" style="text-align: right;">
            <span style="color: #64748b;">الهاتف:</span>
            <span style="font-family: monospace; margin-left: 4px;">${p.phone || '—'}</span>
          </div>
        </div>
      </div>

      <!-- Financial Table -->
      <div style="border: 1px solid #cbd5e1; border-radius: 8px; overflow: hidden; margin-bottom: 16px;">
        <table style="width: 100%; border-collapse: collapse;">
          <thead>
            <tr style="background: #f1f5f9; color: #1e293b; font-size: 11px; font-weight: 800; border-bottom: 1.5px solid #cbd5e1;">
              <th style="padding: 9px 12px; width: 6%; text-align: center;">#</th>
              <th style="padding: 9px 12px; width: 44%; text-align: right;">اسم التحليل / باقة الفحص</th>
              <th style="padding: 9px 12px; width: 18%; text-align: center;">العينة المطلوبة</th>
              <th style="padding: 9px 12px; width: 16%; text-align: center;">العناصر</th>
              <th style="padding: 9px 12px; width: 16%; text-align: left;">القيمة</th>
            </tr>
          </thead>
          <tbody>
            ${itemsHtml}
          </tbody>
        </table>
      </div>

      <!-- Financial Totals Summary -->
      <div style="display: flex; justify-content: space-between; align-items: flex-start; gap: 20px; margin-bottom: 20px;">
        <!-- Notes & Policy -->
        <div style="flex: 1; background: #fff1f2; border: 1px dashed #f43f5e; border-radius: 8px; padding: 10px 14px; font-size: 11px; line-height: 1.6; color: #881337;">
          <strong>تنبيهات هامة للمريض:</strong>
          <ul style="margin: 4px 0 0 0; padding-right: 18px;">
            <li>يرجى إبراز هذا الإيصال أو الباركود عند استلام النتائج الورقية من فرع المعمل.</li>
            <li>يمكن إرسال التقرير الطبي المعتمد بصيغة PDF فور اعتماده على رقم الواتساب المسجل.</li>
            <li>الأسعار تشمل سحب العينات والمستلزمات الطبية والتقارير الاستشارية المعتمدة.</li>
          </ul>
        </div>

        <!-- Totals Table -->
        <div style="width: 290px; background: #f8fafc; border: 1.5px solid #cbd5e1; border-radius: 8px; padding: 12px 14px; font-size: 12px;">
          <div style="display: flex; justify-content: space-between; margin-bottom: 6px;">
            <span style="color: #64748b;">إجمالي التحاليل:</span>
            <span style="font-family: monospace; font-weight: bold;">${testsSubtotal.toFixed(2)} ج.م</span>
          </div>
          ${discount > 0 ? `
            <div style="display: flex; justify-content: space-between; margin-bottom: 6px; color: #059669;">
              <span>خصم مطبق (تحاليل):</span>
              <span style="font-family: monospace; font-weight: bold;">- ${discount.toFixed(2)} ج.م</span>
            </div>
          ` : ''}
          ${visitFee > 0 ? `
            <div style="display: flex; justify-content: space-between; margin-bottom: 6px; color: #4338ca; font-weight: bold;">
              <span>رسوم الزيارة (ثابتة):</span>
              <span style="font-family: monospace;">+ ${visitFee.toFixed(2)} ج.م</span>
            </div>
          ` : ''}
          <div style="display: flex; justify-content: space-between; padding-top: 6px; border-top: 1.5px solid #cbd5e1; font-size: 13px; font-weight: 900; color: #800000; margin-bottom: 6px;">
            <span>الصافي المطلوب:</span>
            <span style="font-family: monospace;">${netTotal.toFixed(2)} ج.م</span>
          </div>
          <div style="display: flex; justify-content: space-between; margin-bottom: 6px; color: #0f172a;">
            <span style="color: #64748b;">المدفوع نقداً:</span>
            <span style="font-family: monospace; font-weight: bold; color: #059669;">${paidAmount.toFixed(2)} ج.م</span>
          </div>
          <div style="display: flex; justify-content: space-between; padding-top: 6px; border-top: 1px dashed #cbd5e1; font-weight: bold;">
            <span style="color: ${remainingAmount > 0 ? '#b91c1c' : '#059669'};">
              ${remainingAmount > 0 ? 'المتبقي للخزينة:' : 'حالة الحساب:'}
            </span>
            <span style="font-family: monospace; color: ${remainingAmount > 0 ? '#b91c1c' : '#059669'};">
              ${remainingAmount > 0 ? `${remainingAmount.toFixed(2)} ج.م` : 'مسدد بالكامل ✓'}
            </span>
          </div>
          <!-- Tafqeet -->
          <div style="margin-top: 8px; padding-top: 6px; border-top: 1px dashed #cbd5e1; font-size: 11px; font-weight: bold; color: #800000;">
            المبلغ كتابةً: ${tafqeetEGP(netTotal)}
          </div>
        </div>
      </div>
    </div>

    <!-- Signatures & Stamp Footer -->
    <div style="border-top: 1.5px solid #cbd5e1; padding-top: 12px; margin-top: auto;">
      <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 16px; text-align: center;">
        <div>
          <div style="font-size: 11px; font-weight: bold; color: #64748b;">مسؤول الاستقبال والخزينة</div>
          <div style="font-family: cursive; font-size: 13px; color: #0f172a; padding: 6px 0;">Approved / Cashier</div>
          <div style="font-size: 10px; color: #64748b;">خزينة معامل RT قصر العيني</div>
        </div>

        <div>
          <div style="font-size: 11px; font-weight: bold; color: #64748b;">ختم الاستلام المالي</div>
          <div style="display: inline-block; border: 2px dashed #800000; border-radius: 50%; width: 56px; height: 56px; line-height: 56px; color: #800000; font-size: 11px; font-weight: 900; margin: 2px auto;">
            PAID
          </div>
        </div>

        <div>
          <div style="font-size: 11px; font-weight: bold; color: #800000;">إدارة معامل RT للتحاليل</div>
          <div style="font-size: 11px; font-weight: bold; color: #800000; padding: 6px 0;">د. رامي مختار</div>
          <div style="font-size: 10px; color: #64748b;">مدرس واستشاري الباثولوجيا الإكلينيكية</div>
        </div>
      </div>

      <div style="text-align: center; font-size: 9px; color: #94a3b8; margin-top: 10px; padding-top: 4px; border-top: 1px solid #f1f5f9;">
        فاتورة إلكترونية معتمدة صادرة آلياً من منظومة RT LAB للتشخيص الطبي | تليفون الشكاوى والمقترحات: ${labInfo.hotline}
      </div>
    </div>
  </div>

  <script>
    window.addEventListener('load', () => {
      setTimeout(() => {
        window.print();
      }, 400);
    });
  </script>
</body>
</html>`;

    printWindow.document.open();
    printWindow.document.write(htmlContent);
    printWindow.document.close();
  };

  // 2. Direct PDF File Download using clean isolated html2canvas
  const handleDownloadPDF = async () => {
    try {
      setIsGeneratingPDF(true);
      const { default: html2canvas } = await import('html2canvas');
      const { default: jsPDF } = await import('jspdf');

      const targetEl = invoiceContainerRef.current;
      if (!targetEl) return;

      // Temporarily strip any shadows and set white bg
      const origShadow = targetEl.style.boxShadow;
      const origBorder = targetEl.style.border;
      targetEl.style.boxShadow = 'none';
      targetEl.style.border = 'none';
      targetEl.style.backgroundColor = '#ffffff';

      const canvas = await html2canvas(targetEl, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff',
        windowWidth: 1000
      });

      targetEl.style.boxShadow = origShadow;
      targetEl.style.border = origBorder;

      const imgData = canvas.toDataURL('image/jpeg', 0.95);
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
        compress: true
      });

      const pdfWidth = 210;
      const pdfHeight = 297;
      const margin = 8;
      const contentWidth = pdfWidth - margin * 2;
      const contentHeight = (canvas.height * contentWidth) / canvas.width;

      pdf.addImage(imgData, 'JPEG', margin, margin, contentWidth, Math.min(contentHeight, pdfHeight - margin * 2));
      const safeName = p.fullName.trim().replace(/\s+/g, '_') || 'Patient';
      pdf.save(`فاتورة_معامل_RT_${safeName}_${p.labNumber}.pdf`);
    } catch (err) {
      console.error('Error generating PDF:', err);
      handlePrintInvoice();
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  // 3. Send WhatsApp Invoice Summary
  const handleSendWhatsAppInvoice = () => {
    const text = `*معامل RT للتحاليل الطبية والتشخيصية*
*معامل د. رامي مختار - طب قصر العيني*
---------------------------------------
📋 *فاتورة فحص طبي وإيصال سداد*
رقم الفاتورة: ${invoiceNumber}
رقم المعمل: ${p.labNumber}
اسم المريض: ${p.fullName}
تاريخ السحب: ${sampleDateFormatted}
موعد الاستلام: ${reportingDateFormatted}

🔬 *الفحوصات المطلوبة:*
${items.map((it, idx) => `${idx + 1}. ${it.titleAr} (${it.titleEn}) - ${it.price} ج.م`).join('\n')}

💰 *البيان المالي:*
- الإجمالي: ${subtotal} ج.م
${discount > 0 ? `- الخصم: ${discount} ج.م\n` : ''}- الصافي المطلوب: ${netTotal} ج.م
- المسدد نقداً: ${paidAmount} ج.م
- المتبقي: ${remainingAmount > 0 ? `${remainingAmount} ج.م` : 'مسدد بالكامل ✓'}

📞 الخط الساخن: ${labInfo.hotline}
فروعنا: القاهرة (قصر العيني والمنيل) - الجيزة (الدقي) - الإسكندرية (سموحة)
نتمنى لكم دوام الصحة والعافية!`;

    openWhatsApp(p.phone, text);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 overflow-y-auto font-sans no-print" dir="rtl">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-4xl shadow-2xl flex flex-col max-h-[95vh] overflow-hidden">
        {/* Top Dialog Bar */}
        <div className="bg-slate-900 border-b border-slate-800 p-4 px-6 flex items-center justify-between text-white sticky top-0 z-20">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-rose-600/20 text-rose-400 flex items-center justify-center border border-rose-500/30">
              <Receipt className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <span>فاتورة فحص المريض وإيصال السداد المالي</span>
                <span className="text-[11px] font-mono bg-rose-950 text-rose-300 px-2 py-0.5 rounded border border-rose-800 font-normal">
                  {invoiceNumber}
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                المريض: <strong className="text-slate-200">{p.fullName}</strong> | رقم المعمل: <strong className="text-rose-300 font-mono">{p.labNumber}</strong>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleSendWhatsAppInvoice}
              className="flex items-center gap-1.5 px-3 py-2 bg-emerald-700 hover:bg-emerald-600 text-white rounded-lg text-xs font-bold transition-all shadow-sm"
              title="إرسال الفاتورة عبر واتساب"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">واتساب</span>
            </button>

            <button
              onClick={handleDownloadPDF}
              disabled={isGeneratingPDF}
              className="flex items-center gap-1.5 px-3 py-2 bg-rose-800 hover:bg-rose-700 text-white rounded-lg text-xs font-bold transition-all shadow-sm disabled:opacity-50"
              title="تحميل ملف PDF"
            >
              {isGeneratingPDF ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Download className="w-3.5 h-3.5" />}
              <span className="hidden sm:inline">تحميل PDF</span>
            </button>

            <button
              onClick={handlePrintInvoice}
              className="flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-red-800 to-rose-700 hover:from-red-900 hover:to-rose-800 text-white rounded-lg text-xs font-black shadow-md transition-all"
              title="طباعة الفاتورة"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>طباعة فورية</span>
            </button>

            <button
              onClick={onClose}
              className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white flex items-center justify-center transition-colors mr-2"
              title="إغلاق"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

                {/* Interactive Discount Bar in Invoice Dialog (User Requested) */}
        <div className="bg-slate-800/95 border-b border-slate-700/80 px-4 sm:px-6 py-2.5 flex flex-wrap items-center justify-between gap-3 text-xs text-white">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="font-bold flex items-center gap-1 text-rose-300 ml-1">
              <Percent className="w-3.5 h-3.5 text-rose-400" />
              <span>نسب الخصم:</span>
            </span>
            {[5, 10, 15, 20, 25, 30, 35, 40, 50].map((pct) => (
              <button
                key={pct}
                type="button"
                onClick={() => handleApplyPercentage(pct)}
                className={`px-2 py-1 rounded-md font-mono font-bold text-xs cursor-pointer transition-all ${
                  activePercent === pct
                    ? 'bg-rose-600 text-white shadow-xs scale-105'
                    : 'bg-slate-700 text-slate-200 hover:bg-slate-600'
                }`}
              >
                {pct}%
              </button>
            ))}
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            <div className="flex items-center gap-1.5">
              <span className="text-slate-300 text-[11px]">نسبة مخصصة (%):</span>
              <input
                type="number"
                min="0"
                max="100"
                value={customPercent}
                onChange={(e) => handleCustomPercentChange(Number(e.target.value) || 0)}
                className="w-16 px-2 py-1 bg-slate-900 border border-slate-600 rounded text-center font-bold font-mono text-rose-300 text-xs"
              />
            </div>

            <div className="flex items-center gap-1.5">
              <span className="text-slate-300 text-[11px]">خصم مباشر (ج.م):</span>
              <input
                type="number"
                min="0"
                max={subtotal}
                value={customFlatDiscount || ''}
                onChange={(e) => handleFlatDiscountChange(Number(e.target.value) || 0)}
                placeholder="0"
                className="w-20 px-2 py-1 bg-slate-900 border border-slate-600 rounded text-center font-bold font-mono text-emerald-400 text-xs"
              />
            </div>

            <button
              type="button"
              onClick={handleResetDiscount}
              className="px-2.5 py-1 bg-slate-700 hover:bg-slate-600 text-slate-300 hover:text-white rounded text-[11px] font-bold cursor-pointer transition-colors"
            >
              إلغاء الخصم
            </button>
          </div>
        </div>

        {/* Scrollable Document Preview Container */}
        <div className="p-4 sm:p-6 overflow-y-auto bg-slate-950 flex justify-center">
          {/* Paper Document - 100% White Background with Zero Leaks */}
          <div
            ref={invoiceContainerRef}
            className="invoice-page-container bg-white text-slate-900 rounded-xl p-8 sm:p-10 w-full max-w-3xl shadow-xl flex flex-col justify-between min-h-[700px] border border-slate-200"
            style={{ backgroundColor: '#ffffff' }}
          >
            <div>
              {/* Header */}
              <div className="flex items-center justify-between border-b-2 border-red-950 pb-4 mb-4 gap-4">
                <div className="text-right flex-1">
                  <h1 className="text-lg font-black text-rose-950">معامل RT للتحاليل التشخيصية</h1>
                  <h2 className="text-xs font-bold text-slate-900">معامل د. رامي مختار</h2>
                  <p className="text-[11px] font-semibold text-rose-900">أطباء الباثولوجيا الإكلينيكية والكيميائية - طب قصر العيني</p>
                  <p className="text-[10px] text-slate-500">الخط الساخن: ${labInfo.hotline} | القاهرة · الجيزة · الإسكندرية</p>
                </div>

                <div className="text-center px-4">
                  <div className="inline-block bg-red-950 text-white px-3.5 py-1.5 rounded-lg font-black text-xs shadow-sm">
                    فاتورة فحص وإيصال سداد
                  </div>
                  <div className="text-[9px] text-slate-400 font-mono mt-1">RECEIPT & INVOICE</div>
                </div>

                <div className="text-left flex-1" dir="ltr">
                  <h1 className="text-lg font-black text-rose-950">RT LAB LABORATORIES</h1>
                  <h2 className="text-xs font-bold text-slate-900">Dr. Rami Mokhtar Labs</h2>
                  <p className="text-[10px] text-slate-500">Kasr Al Ainy Faculty of Medicine</p>
                  <p className="text-[11px] font-mono font-bold text-rose-900">{invoiceNumber}</p>
                </div>
              </div>

              {/* Red line */}
              <div className="flex h-1 w-full -mt-2 mb-4">
                <div className="w-3/4 bg-red-950"></div>
                <div className="w-1/4 bg-slate-900"></div>
              </div>

              {/* Patient details card */}
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 mb-4 text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <span className="text-slate-500">اسم المريض: </span>
                    <strong className="text-slate-900 text-sm font-bold">{p.fullName}</strong>
                  </div>
                  <div dir="ltr" className="sm:text-right">
                    <span className="text-slate-500">رقم المعمل: </span>
                    <strong className="text-rose-950 font-mono text-sm">{p.labNumber}</strong>
                  </div>
                  <div dir="ltr" className="sm:text-right">
                    <span className="bg-white border border-slate-300 px-2 py-0.5 rounded font-mono text-[11px]">
                      ||| {p.barcode}
                    </span>
                  </div>

                  <div>
                    <span className="text-slate-500">السن / النوع: </span>
                    <strong>{p.age} {p.ageUnit === 'years' ? 'سنة' : 'شهر'} / {p.gender === 'male' ? 'ذكر' : 'أنثى'}</strong>
                  </div>
                  <div>
                    <span className="text-slate-500">تاريخ السحب: </span>
                    <span className="font-mono">{sampleDateFormatted}</span>
                  </div>
                  <div>
                    <span className="text-slate-500">موعد الاستلام: </span>
                    <span className="font-mono font-bold text-rose-900">{reportingDateFormatted}</span>
                  </div>

                  <div className="sm:col-span-2">
                    <span className="text-slate-500">الطبيب المعالج: </span>
                    <strong>{p.referringDoctorName || 'طلب فحص ذاتي (Self-Request)'}</strong>
                  </div>
                  <div dir="ltr" className="sm:text-right">
                    <span className="text-slate-500">الهاتف: </span>
                    <span className="font-mono">{p.phone || '—'}</span>
                  </div>
                </div>
              </div>

              {/* Tests table */}
              <div className="border border-slate-200 rounded-xl overflow-hidden mb-4">
                <table className="w-full text-xs text-right">
                  <thead>
                    <tr className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200 text-[11px]">
                      <th className="py-2.5 px-3 text-center w-12">#</th>
                      <th className="py-2.5 px-3 text-right">اسم التحليل / باقة الفحص</th>
                      <th className="py-2.5 px-3 text-center">نوع العينة</th>
                      <th className="py-2.5 px-3 text-center">العناصر</th>
                      <th className="py-2.5 px-3 text-left">القيمة (EGP)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {items.map((it, idx) => (
                      <tr key={it.id} className="hover:bg-slate-50/50">
                        <td className="py-2.5 px-3 text-center text-slate-400 font-mono">{idx + 1}</td>
                        <td className="py-2.5 px-3">
                          <div className="font-bold text-slate-900">{it.titleAr}</div>
                          <div className="text-[10px] text-slate-500 font-mono" dir="ltr">{it.titleEn}</div>
                        </td>
                        <td className="py-2.5 px-3 text-center text-slate-600">{it.sampleType}</td>
                        <td className="py-2.5 px-3 text-center text-slate-500 font-mono">{it.parametersCount} عنصر</td>
                        <td className="py-2.5 px-3 text-left font-mono font-bold text-rose-950" dir="ltr">
                          {it.price.toFixed(2)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Totals & Notes Section */}
              <div className="flex flex-col sm:flex-row items-start justify-between gap-4 mb-6">
                <div className="flex-1 bg-rose-50/70 border border-rose-200 rounded-xl p-3.5 text-xs text-rose-950 space-y-1">
                  <div className="font-bold flex items-center gap-1 text-rose-900">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>تنبيهات استلام النتائج:</span>
                  </div>
                  <ul className="text-[11px] list-disc list-inside space-y-0.5 text-rose-900/90 pr-1">
                    <li>يرجى إبراز هذا الإيصال أو كود الباركود عند استلام التقرير الورقي.</li>
                    <li>يتم إرسال النتائج المعتمدة بصيغة PDF فورياً عبر الواتساب المسجل.</li>
                    <li>للاستفسارات الطبية: الخط الساخن لمعامل RT متاح 24/7.</li>
                  </ul>
                </div>

                <div className="w-full sm:w-72 bg-slate-50 border border-slate-300 rounded-xl p-4 text-xs space-y-2">
                  <div className="flex justify-between text-slate-600">
                    <span>إجمالي الفحوصات:</span>
                    <span className="font-mono font-bold text-slate-800">{subtotal.toFixed(2)} ج.م</span>
                  </div>
                  {discount > 0 && (
                    <div className="flex justify-between text-emerald-700 font-semibold">
                      <span>خصم مطبق:</span>
                      <span className="font-mono font-bold">- {discount.toFixed(2)} ج.م</span>
                    </div>
                  )}
                  <div className="flex justify-between font-black text-rose-950 text-sm pt-2 border-t border-slate-200">
                    <span>الصافي المطلوب:</span>
                    <span className="font-mono">{netTotal.toFixed(2)} ج.م</span>
                  </div>
                  <div className="flex justify-between text-slate-700">
                    <span>المسدد نقداً:</span>
                    <span className="font-mono font-bold text-emerald-700">{paidAmount.toFixed(2)} ج.م</span>
                  </div>
                  <div className="flex justify-between font-bold pt-2 border-t border-dashed border-slate-300">
                    <span className={remainingAmount > 0 ? 'text-rose-700' : 'text-emerald-700'}>
                      {remainingAmount > 0 ? 'المتبقي للخزينة:' : 'حالة الحساب:'}
                    </span>
                    <span className={`font-mono ${remainingAmount > 0 ? 'text-rose-700' : 'text-emerald-700'}`}>
                      {remainingAmount > 0 ? `${remainingAmount.toFixed(2)} ج.م` : 'مسدد بالكامل ✓'}
                    </span>
                  </div>

                  {/* Tafqeet in Arabic Words */}
                  <div className="pt-2 border-t border-slate-200 text-[11px] font-bold text-rose-950 bg-amber-50/70 p-2 rounded-lg border border-amber-200">
                    <span className="text-slate-500 font-normal">المبلغ كتابةً: </span>
                    <span>{tafqeetEGP(netTotal)}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Official Signatures & Stamp */}
            <div className="border-t border-slate-200 pt-4 mt-6">
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <div className="text-[11px] font-bold text-slate-500">مسؤول الاستقبال والخزينة</div>
                  <div className="font-serif italic text-xs text-slate-800 py-1 font-bold">Approved Cashier</div>
                  <div className="text-[10px] text-slate-400">خزينة فرع قصر العيني</div>
                </div>

                <div>
                  <div className="text-[11px] font-bold text-slate-500">ختم السداد المالي</div>
                  <div className="inline-block border-2 border-dashed border-rose-900 rounded-full w-12 h-12 leading-[44px] text-rose-900 font-black text-xs mx-auto">
                    PAID
                  </div>
                </div>

                <div>
                  <div className="text-[11px] font-bold text-rose-950">إدارة معامل RT للتحاليل</div>
                  <div className="text-xs font-bold text-rose-950 py-1">د. رامي مختار</div>
                  <div className="text-[10px] text-slate-500">مدرس واستشاري الباثولوجيا الإكلينيكية</div>
                </div>
              </div>

              <div className="text-center text-[9px] text-slate-400 mt-4 pt-2 border-t border-slate-100">
                فاتورة فحص إلكترونية معتمدة - معامل RT للتحاليل التشخيصية · الخط الساخن: ${labInfo.hotline}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
