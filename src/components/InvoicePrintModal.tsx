import { tafqeetEGP } from '../utils/tafqeet';
import { RTLogo } from './RTLogo';
import React, { useState } from 'react';
import { IncomeRecord } from '../types';
import { generateBarcodeSVG } from '../utils/barcode';
import { X, Printer, Tag, FileText, CheckCircle2 } from 'lucide-react';
import { useApp } from '../context/AppContext';

interface InvoicePrintModalProps {
  invoice: IncomeRecord | null;
  onClose: () => void;
}

export const InvoicePrintModal: React.FC<InvoicePrintModalProps> = ({ invoice, onClose }) => {
  const { language, labInfo, facilities } = useApp();
  const branchObj = facilities.find(f => f.nameAr === invoice?.branch || f.id === invoice?.branchId) || facilities[0];
  const [printLayout, setPrintLayout] = useState<'standard' | 'thermal' | 'tube_sticker'>('standard');

  if (!invoice) return null;

  
  const handlePrintClean = () => {
    window.print();
  };

  const handlePrint = () => {
    handlePrintClean();
  };


  const barcodeSvgHtml = generateBarcodeSVG(invoice.barcode, 260, 55, true);
  const stickerSvgHtml = generateBarcodeSVG(invoice.barcode, 180, 40, true);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-2 sm:p-4 overflow-y-auto print:static print:bg-white print:p-0 print:m-0 print:overflow-visible print:block print:w-full print:h-auto">
      <div className="bg-white rounded-xl shadow-2xl border border-slate-200 max-w-2xl w-full my-auto overflow-hidden print:border-none print:shadow-none print:rounded-none print:m-0 print:p-0 print:w-full print:max-w-none print:bg-white">
        
        {/* Modal Controls Bar (Hidden during print) */}
        <div className="px-6 py-3.5 bg-slate-900 text-white flex items-center justify-between print:hidden">
          <div className="flex items-center gap-2">
            <Printer className="w-5 h-5 text-amber-400" />
            <h3 className="font-bold text-sm">
              {language === 'ar' ? 'طباعة فاتورة / إيصال مريض' : 'Print Patient Invoice & Receipt'}
            </h3>
          </div>

          <div className="flex items-center gap-2">
            {/* Layout switch */}
            <div className="flex bg-slate-800 p-0.5 rounded-lg text-xs">
              <button
                type="button"
                onClick={() => setPrintLayout('standard')}
                className={`px-2.5 py-1 rounded-md transition-colors ${
                  printLayout === 'standard' ? 'bg-rose-900 text-white font-bold' : 'text-slate-300 hover:text-white'
                }`}
              >
                {language === 'ar' ? 'فاتورة A4/A5' : 'Standard'}
              </button>
              <button
                type="button"
                onClick={() => setPrintLayout('thermal')}
                className={`px-2.5 py-1 rounded-md transition-colors ${
                  printLayout === 'thermal' ? 'bg-rose-900 text-white font-bold' : 'text-slate-300 hover:text-white'
                }`}
              >
                {language === 'ar' ? 'إيصال حراري 80mm' : 'Thermal'}
              </button>
              <button
                type="button"
                onClick={() => setPrintLayout('tube_sticker')}
                className={`px-2.5 py-1 rounded-md transition-colors ${
                  printLayout === 'tube_sticker' ? 'bg-rose-900 text-white font-bold' : 'text-slate-300 hover:text-white'
                }`}
              >
                {language === 'ar' ? 'استيكر الأنابيب' : 'Tube Label'}
              </button>
            </div>

            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-rose-700 hover:bg-rose-900 text-white text-xs font-bold rounded-lg transition-colors shadow-sm"
            >
              <Printer className="w-4 h-4" />
              <span>{language === 'ar' ? 'طباعة الآن' : 'Print'}</span>
            </button>

            <button
              onClick={onClose}
              className="text-slate-400 hover:text-white transition-colors p-1"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Area */}
        <div className="p-6 sm:p-8 max-h-[80vh] overflow-y-auto print:max-h-none print:overflow-visible print:p-0">
          
          {/* LAYOUT 1: STANDARD INVOICE */}
          {printLayout === 'standard' && (
            <div className="printable-content bg-white text-slate-900 border border-slate-200 p-6 rounded-lg print:border-none print:p-0">
              {/* Header Letterhead */}
              <div className="border-b-2 border-rose-900 pb-4 mb-4 flex items-center justify-between">
                <div className="space-y-1">
                  <h1 className="text-xl font-black text-rose-950 tracking-tight">
                    {labInfo?.labNameAr || 'معامل RT للتحاليل التشخيصية'}
                  </h1>
                  <div className="text-sm font-black text-slate-900">
                    معامل رامي مختار · {labInfo?.labNameEn || 'RT Laboratories'}
                  </div>
                  <div className="text-xs font-bold text-blue-900">
                    {labInfo?.supervisionAr || 'أطباء واستشاريو كلية طب قصر العيني'}
                  </div>
                  <p className="text-[10px] text-slate-500 font-medium">
                    {labInfo?.sloganAr || 'التشخيص الصحيح يبدأ معنا · Accurate Diagnosis Starts With Us'}
                  </p>
                  <div className="text-[11px] text-slate-600 font-semibold pt-0.5">
                    📍 {branchObj?.nameAr || invoice.branch} - {branchObj?.address || 'ميدان بهتيم برج صيدلية العزبي الدور الثالث شبرا الخيمة'}
                  </div>
                </div>
                <div className="flex flex-col items-end">
                  <RTLogo size="sm" showSlogan={false} theme="light" />
                  <div className="text-[10px] text-slate-500 font-mono mt-1 font-bold">{labInfo?.accreditation || 'ISO 15189 Certified'}</div>
                  <div className="text-[10px] text-rose-900 font-bold mt-0.5" dir="ltr">Hotline: {branchObj?.phones?.[0] || labInfo?.hotline || '01012345678'}</div>
                </div>
              </div>

              {/* Invoice Meta Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50 p-3 rounded-lg text-xs mb-4 border border-slate-100">
                <div>
                  <span className="text-slate-500 block">رقم الفاتورة:</span>
                  <span className="font-bold font-mono text-slate-900">{invoice.invoiceNumber}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">كود المعمل (Lab No):</span>
                  <span className="font-bold font-mono text-rose-900">{invoice.labNumber}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">التاريخ والوقت:</span>
                  <span className="font-semibold text-slate-800">
                    {new Date(invoice.createdAt).toLocaleDateString('ar-EG')} - {new Date(invoice.createdAt).toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 block">الفرع / الخزينة:</span>
                  <span className="font-semibold text-slate-800">{invoice.branch}</span>
                </div>
              </div>

              {/* Patient Details */}
              <div className="bg-slate-50 p-3.5 rounded-lg text-xs mb-4 border border-slate-100 flex flex-wrap justify-between items-center gap-3">
                <div className="space-y-1">
                  <div>
                    <span className="text-slate-500">اسم المريض: </span>
                    <span className="font-bold text-slate-900 text-sm">{invoice.patientName}</span>
                  </div>
                  <div className="text-slate-600">
                    <span>السن: {invoice.patientAge} سنة</span>
                    <span className="mx-2">·</span>
                    <span>النوع: {invoice.patientGender === 'male' ? 'ذكر' : 'أنثى'}</span>
                    <span className="mx-2">·</span>
                    <span>الهاتف: {invoice.patientPhone}</span>
                  </div>
                  <div className="text-slate-600">
                    <span>الطبيب المعالج: {invoice.referringDoctor || 'فحص ذاتي / معملي'}</span>
                  </div>
                </div>

                {/* Barcode representation */}
                <div className="text-center">
                  <div dangerouslySetInnerHTML={{ __html: barcodeSvgHtml }} />
                  <div className="text-[10px] text-slate-400 font-mono mt-0.5">Sample ID: {invoice.barcode}</div>
                </div>
              </div>

              {/* Tests Table */}
              <table className="w-full text-xs mb-4 border-collapse">
                <thead>
                  <tr className="bg-slate-100 text-slate-700 font-bold border-y border-slate-200">
                    <th className="py-2 px-3 text-right">#</th>
                    <th className="py-2 px-3 text-right">كود التحليل</th>
                    <th className="py-2 px-3 text-right">اسم الفحص الطبي المطلوب</th>
                    <th className="py-2 px-3 text-right">القسم التشخيصي</th>
                    <th className="py-2 px-3 text-left">السعر (ج.م)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {invoice.tests.map((test, index) => (
                    <tr key={test.id || index}>
                      <td className="py-2.5 px-3 text-slate-500">{index + 1}</td>
                      <td className="py-2.5 px-3 font-mono font-semibold text-rose-900">{test.code}</td>
                      <td className="py-2.5 px-3 font-bold text-slate-900">{test.nameAr}</td>
                      <td className="py-2.5 px-3 text-slate-500">{test.category}</td>
                      <td className="py-2.5 px-3 text-left font-mono font-bold">{test.price.toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Financial Calculation Summary */}
              <div className="flex justify-end mb-6">
                <div className="w-72 bg-slate-50 p-3.5 rounded-lg border border-slate-200 text-xs space-y-1.5">
                  <div className="flex justify-between text-slate-600">
                    <span>إجمالي التحاليل:</span>
                    <span className="font-mono font-semibold">{(invoice.testsSubtotal || invoice.subtotal).toFixed(2)} ج.م</span>
                  </div>
                  {invoice.discount > 0 && (
                    <div className="flex justify-between text-rose-600 font-semibold">
                      <span>الخصم (على التحاليل فقط):</span>
                      <span className="font-mono">-{invoice.discount.toFixed(2)} ج.م</span>
                    </div>
                  )}
                  {invoice.visitFee && invoice.visitFee > 0 ? (
                    <div className="pt-1 border-t border-dashed border-slate-200 space-y-0.5">
                      <div className="flex justify-between text-indigo-800 font-bold">
                        <span>رسوم الزيارة المنزلية:</span>
                        <span className="font-mono">+{invoice.visitFee.toFixed(2)} ج.م</span>
                      </div>
                      <div className="text-[10px] text-slate-500 flex justify-between">
                        <span>(ثابتة غير خاضعة للخصم)</span>
                        {invoice.visitSpecialist && <span className="truncate max-w-[150px] font-semibold">{invoice.visitSpecialist}</span>}
                      </div>
                    </div>
                  ) : null}
                  <div className="flex justify-between text-sm font-bold text-slate-900 pt-1.5 border-t border-slate-300">
                    <span>الصافي الإجمالي المطلوب:</span>
                    <span className="font-mono text-rose-950 font-black">{invoice.netAmount.toFixed(2)} ج.م</span>
                  </div>
                  <div className="flex justify-between text-emerald-700 font-bold">
                    <span>المدفوع نقداً/فيزا:</span>
                    <span className="font-mono">{invoice.paidAmount.toFixed(2)} ج.م</span>
                  </div>
                  <div className="flex justify-between text-slate-900 font-bold pt-1 border-t border-slate-200">
                    <span>المتبقي:</span>
                    <span className={`font-mono ${invoice.remainingAmount > 0 ? 'text-rose-600 font-bold' : 'text-slate-500'}`}>
                      {invoice.remainingAmount.toFixed(2)} ج.م
                    </span>
                  </div>
                </div>
              </div>

              {/* Tafqeet in Arabic Words */}
              <div className="bg-amber-50/70 border border-amber-200 rounded-lg p-2.5 mb-5 text-xs flex items-center justify-between">
                <div>
                  <span className="text-slate-500 font-medium">المبلغ المطلوب كتابةً: </span>
                  <span className="font-black text-rose-950 text-xs sm:text-sm">{tafqeetEGP(invoice.netAmount)}</span>
                </div>
                <div className="text-[10px] text-emerald-800 font-bold bg-emerald-100/80 px-2 py-0.5 rounded border border-emerald-300">
                  سداد رسمي معتمد ✓
                </div>
              </div>

              {/* Signatures & Official Stamp Grid */}
              <div className="grid grid-cols-3 gap-4 items-center my-5 pt-3 border-t border-slate-200 text-xs">
                {/* Cashier Signature Box */}
                <div className="text-center p-2.5 border border-slate-200 rounded-lg bg-slate-50/60">
                  <div className="text-slate-500 font-bold text-[11px] mb-1">المحاسب / مسؤول الخزينة</div>
                  <div className="font-bold text-slate-800 text-xs">{invoice.cashierName || 'قسم الاستقبال والخزينة'}</div>
                  <div className="text-[10px] font-mono text-slate-400 mt-3 border-t border-dashed border-slate-300 pt-1">توقيع الموظف المعتمد</div>
                </div>

                {/* Official Seal Graphic */}
                <div className="flex justify-center">
                  <div className="w-28 h-28 rounded-full border-2 border-dashed border-rose-900/60 p-1 flex items-center justify-center relative rotate-[-5deg] select-none opacity-90">
                    <div className="w-full h-full rounded-full border border-rose-900 flex flex-col items-center justify-center text-center p-1 text-rose-900 bg-rose-50/40">
                      <div className="text-[8px] font-black uppercase tracking-wider">RT Laboratories</div>
                      <div className="text-[9.5px] font-extrabold my-0.5">معتمد رسمياً</div>
                      <div className="text-[7.5px] font-bold">ISO 15189 QUALITY</div>
                      <div className="text-[7px] text-slate-600 mt-0.5">شبرا الخيمة • بهتيم</div>
                    </div>
                  </div>
                </div>

                {/* Patient Signature Box */}
                <div className="text-center p-2.5 border border-slate-200 rounded-lg bg-slate-50/60">
                  <div className="text-slate-500 font-bold text-[11px] mb-1">المستلم / المريض</div>
                  <div className="font-bold text-slate-800 text-xs truncate">{invoice.patientName}</div>
                  <div className="text-[10px] font-mono text-slate-400 mt-3 border-t border-dashed border-slate-300 pt-1">توقيع المستلم</div>
                </div>
              </div>

              {/* Footer info & QR Note */}
              <div className="border-t border-slate-200 pt-3 text-[11px] text-slate-500 flex justify-between items-end">
                <div>
                  <p>• يُرجى الاحتفاظ بهذا الإيصال لاستلام النتيجة أو الاطلاع عليها عبر الباركود.</p>
                  <p>• شكراً لثقتكم بمعامل RT للتشخيص والتحاليل الطبية.</p>
                  <p className="mt-1">المحاسب المسؤول: {invoice.cashierName}</p>
                </div>
                <div className="text-left font-mono text-[10px]">
                  <span>RT-LAB-FIN-VERIFIED</span>
                </div>
              </div>
            </div>
          )}

          {/* LAYOUT 2: THERMAL RECEIPT (80mm) */}
          {printLayout === 'thermal' && (
            <div className="printable-content max-w-[320px] mx-auto bg-white p-4 font-mono text-xs border border-dashed border-slate-300 rounded print:border-none print:p-0">
              <div className="text-center pb-2 border-b border-dashed border-slate-400">
                <div className="font-black text-base">{labInfo?.labNameAr || 'معامل RT للتحاليل الطبية'}</div>
                <div className="text-[10px]">{labInfo?.supervisionAr || 'أطباء كلية طب قصر العيني'}</div>
                <div className="text-[10px] font-semibold">{branchObj?.nameAr || invoice.branch} - {branchObj?.address || 'ميدان بهتيم'}</div>
                <div className="text-[10px] font-mono">هاتف: {(branchObj?.phones || []).join(' / ')}</div>
              </div>

              <div className="py-2 text-[11px] border-b border-dashed border-slate-400 space-y-1">
                <div>فاتورة: <span className="font-bold">{invoice.invoiceNumber}</span></div>
                <div>كود العينة: <span className="font-bold">{invoice.labNumber}</span></div>
                <div>التاريخ: {new Date(invoice.createdAt).toLocaleDateString('ar-EG')}</div>
                <div>المريض: <span className="font-bold">{invoice.patientName}</span></div>
                <div>السن: {invoice.patientAge} | {invoice.patientGender === 'male' ? 'ذكر' : 'أنثى'}</div>
              </div>

              <div className="py-2 border-b border-dashed border-slate-400">
                <div className="font-bold mb-1">التحاليل المطلوبة:</div>
                {invoice.tests.map((t, idx) => (
                  <div key={idx} className="flex justify-between py-0.5 text-[11px]">
                    <span className="truncate max-w-[190px]">{t.nameAr}</span>
                    <span>{t.price} ج</span>
                  </div>
                ))}
              </div>

              <div className="py-2 text-[11px] space-y-1 border-b border-dashed border-slate-400">
                <div className="flex justify-between">
                  <span>الإجمالي:</span>
                  <span>{invoice.subtotal} ج.م</span>
                </div>
                {invoice.discount > 0 && (
                  <div className="flex justify-between text-rose-600">
                    <span>الخصم (تحاليل):</span>
                    <span>-{invoice.discount} ج.م</span>
                  </div>
                )}
                {invoice.visitFee && invoice.visitFee > 0 ? (
                  <div className="flex justify-between text-indigo-900 font-bold">
                    <span>رسوم الزيارة (ثابتة):</span>
                    <span>+{invoice.visitFee} ج.م</span>
                  </div>
                ) : null}
                <div className="flex justify-between font-bold text-xs">
                  <span>الصافي:</span>
                  <span>{invoice.netAmount} ج.م</span>
                </div>
                <div className="flex justify-between font-bold">
                  <span>المدفوع:</span>
                  <span>{invoice.paidAmount} ج.م</span>
                </div>
                <div className="flex justify-between">
                  <span>المتبقي:</span>
                  <span>{invoice.remainingAmount} ج.م</span>
                </div>
                <div className="pt-1 border-t border-dashed border-slate-300 text-[10px] font-bold">
                  فقط {tafqeetEGP(invoice.netAmount)}
                </div>
              </div>

              <div className="pt-3 text-center">
                <div dangerouslySetInnerHTML={{ __html: barcodeSvgHtml }} />
                <div className="text-[10px] mt-2">شكراً لزيارتكم معمل RT</div>
              </div>
            </div>
          )}

          {/* LAYOUT 3: TUBE BARCODE STICKER (38x25mm / 50x25mm standard sample stickers) */}
          {printLayout === 'tube_sticker' && (
            <div className="printable-content max-w-[340px] mx-auto bg-white p-3 border border-slate-300 rounded print:border-none print:p-0">
              <div className="border border-slate-900 p-2 rounded text-slate-900 space-y-1">
                <div className="flex justify-between items-center text-[11px] font-bold">
                  <span>RT LAB</span>
                  <span>{invoice.labNumber}</span>
                </div>
                <div className="text-xs font-bold truncate">
                  {invoice.patientName}
                </div>
                <div className="text-[10px] text-slate-600 flex justify-between">
                  <span>{invoice.patientAge}Y / {invoice.patientGender.toUpperCase()}</span>
                  <span>{new Date(invoice.createdAt).toLocaleDateString('en-GB')}</span>
                </div>
                <div className="text-center py-1">
                  <div dangerouslySetInnerHTML={{ __html: stickerSvgHtml }} />
                </div>
                <div className="text-[9px] text-slate-700 truncate font-semibold">
                  {invoice.tests.map(t => t.code).join(', ')}
                </div>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};
