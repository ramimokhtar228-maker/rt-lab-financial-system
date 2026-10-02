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
  const { language } = useApp();
  const [printLayout, setPrintLayout] = useState<'standard' | 'thermal' | 'tube_sticker'>('standard');

  if (!invoice) return null;

  const handlePrint = () => {
    window.print();
  };

  const barcodeSvgHtml = generateBarcodeSVG(invoice.barcode, 260, 55, true);
  const stickerSvgHtml = generateBarcodeSVG(invoice.barcode, 180, 40, true);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-2 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-xl shadow-2xl border border-slate-200 max-w-2xl w-full my-auto overflow-hidden">
        
        {/* Modal Controls Bar (Hidden during print) */}
        <div className="px-6 py-3.5 bg-slate-900 text-white flex items-center justify-between print:hidden">
          <div className="flex items-center gap-2">
            <Printer className="w-5 h-5 text-teal-400" />
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
                  printLayout === 'standard' ? 'bg-teal-700 text-white font-bold' : 'text-slate-300 hover:text-white'
                }`}
              >
                {language === 'ar' ? 'فاتورة A4/A5' : 'Standard'}
              </button>
              <button
                type="button"
                onClick={() => setPrintLayout('thermal')}
                className={`px-2.5 py-1 rounded-md transition-colors ${
                  printLayout === 'thermal' ? 'bg-teal-700 text-white font-bold' : 'text-slate-300 hover:text-white'
                }`}
              >
                {language === 'ar' ? 'إيصال حراري 80mm' : 'Thermal'}
              </button>
              <button
                type="button"
                onClick={() => setPrintLayout('tube_sticker')}
                className={`px-2.5 py-1 rounded-md transition-colors ${
                  printLayout === 'tube_sticker' ? 'bg-teal-700 text-white font-bold' : 'text-slate-300 hover:text-white'
                }`}
              >
                {language === 'ar' ? 'استيكر الأنابيب' : 'Tube Label'}
              </button>
            </div>

            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold rounded-lg transition-colors shadow-sm"
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
              <div className="border-b-2 border-slate-800 pb-4 mb-4 flex items-center justify-between">
                <div>
                  <h1 className="text-xl font-black text-slate-900 tracking-tight">
                    معامل RT للتشخيص والتحاليل الطبية
                  </h1>
                  <p className="text-xs text-slate-600 font-semibold mt-0.5">
                    RT Diagnostic Clinical & Molecular Pathology Laboratories
                  </p>
                  <p className="text-[11px] text-slate-500">
                    تحت إشراف: أ.د. رامي مختار - استشاري الباثولوجيا الإكلينيكية والكيميائية
                  </p>
                </div>
                <div className="text-left font-mono">
                  <div className="w-12 h-12 bg-teal-800 text-white font-extrabold text-2xl flex items-center justify-center rounded-lg shadow-sm">
                    RT
                  </div>
                  <div className="text-[10px] text-slate-500 mt-1">EGY-MED-48201</div>
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
                  <span className="font-bold font-mono text-teal-800">{invoice.labNumber}</span>
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
                      <td className="py-2.5 px-3 font-mono font-semibold text-teal-800">{test.code}</td>
                      <td className="py-2.5 px-3 font-bold text-slate-900">{test.nameAr}</td>
                      <td className="py-2.5 px-3 text-slate-500">{test.category}</td>
                      <td className="py-2.5 px-3 text-left font-mono font-bold">{test.price.toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Financial Calculation Summary */}
              <div className="flex justify-end mb-6">
                <div className="w-64 bg-slate-50 p-3 rounded-lg border border-slate-200 text-xs space-y-1.5">
                  <div className="flex justify-between text-slate-600">
                    <span>المجموع الإجمالي:</span>
                    <span className="font-mono font-semibold">{invoice.subtotal.toFixed(2)} ج.م</span>
                  </div>
                  {invoice.discount > 0 && (
                    <div className="flex justify-between text-rose-600 font-semibold">
                      <span>الخصم المطبق:</span>
                      <span className="font-mono">-{invoice.discount.toFixed(2)} ج.م</span>
                    </div>
                  )}
                  <div className="flex justify-between text-sm font-bold text-slate-900 pt-1 border-t border-slate-200">
                    <span>الصافي المطلوب:</span>
                    <span className="font-mono text-teal-900">{invoice.netAmount.toFixed(2)} ج.م</span>
                  </div>
                  <div className="flex justify-between text-emerald-700 font-bold">
                    <span>المدفوع نقداً/فيزا:</span>
                    <span className="font-mono">{invoice.paidAmount.toFixed(2)} ج.م</span>
                  </div>
                  <div className="flex justify-between text-slate-900 font-bold pt-1 border-t border-slate-200">
                    <span>المتبقي:</span>
                    <span className={`font-mono ${invoice.remainingAmount > 0 ? 'text-rose-600' : 'text-slate-500'}`}>
                      {invoice.remainingAmount.toFixed(2)} ج.م
                    </span>
                  </div>
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
                <div className="font-black text-base">معامل RT للتحاليل الطبية</div>
                <div className="text-[10px]">RT Diagnostic Laboratories</div>
                <div className="text-[10px]">هاتف: 01001234567 / 0223654321</div>
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
                    <span>الخصم:</span>
                    <span>-{invoice.discount} ج.م</span>
                  </div>
                )}
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
