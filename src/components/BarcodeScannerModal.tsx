import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { X, Camera, ScanLine, AlertCircle, Check, Keyboard, Search, FlaskConical, Receipt } from 'lucide-react';
import { playScanSuccessSound, playScanErrorSound } from '../utils/barcode';

export const BarcodeScannerModal: React.FC = () => {
  const {
    isBarcodeScannerOpen,
    setIsBarcodeScannerOpen,
    inventory,
    incomeRecords,
    reports,
    setSelectedReportId,
    setActiveTab,
    addNotification
  } = useApp();

  const [manualCode, setManualCode] = useState('');
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [lastScannedResult, setLastScannedResult] = useState<{ code: string; title: string; type: string; id?: string } | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    if (!isBarcodeScannerOpen) {
      stopCamera();
      setManualCode('');
      setLastScannedResult(null);
    }
  }, [isBarcodeScannerOpen]);

  const startCamera = async () => {
    setCameraError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' }
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
      setCameraActive(true);

      // Check if BarcodeDetector is supported
      if ('BarcodeDetector' in window) {
        // @ts-ignore
        const detector = new window.BarcodeDetector({
          formats: ['code_128', 'code_39', 'ean_13', 'qr_code']
        });

        const scanInterval = setInterval(async () => {
          if (!videoRef.current || videoRef.current.readyState < 2) return;
          try {
            const barcodes = await detector.detect(videoRef.current);
            if (barcodes.length > 0) {
              const rawValue = barcodes[0].rawValue;
              processCode(rawValue);
              clearInterval(scanInterval);
            }
          } catch {
            // ignore continuous detect errors
          }
        }, 300);
      }
    } catch {
      setCameraError('تعذر الوصول للكاميرا. يرجى التأكد من منح الإذن أو إدخال الباركود يدوياً.');
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setCameraActive(false);
  };

  const processCode = (rawCode: string) => {
    const code = rawCode.trim();
    if (!code) return;

    // 1. Search in Diagnostic Reports
    const matchingReport = reports.find(
      r => r.patient.barcode?.toLowerCase() === code.toLowerCase() ||
           r.reportNumber.toLowerCase() === code.toLowerCase()
    );

    if (matchingReport) {
      playScanSuccessSound();
      setLastScannedResult({
        code,
        title: `تقرير طبي: ${matchingReport.patient.fullName} (${matchingReport.reportNumber})`,
        type: 'report',
        id: matchingReport.id
      });
      return;
    }

    // 2. Search in Financial Invoices
    const matchingInvoice = incomeRecords.find(
      i => i.barcode?.toLowerCase() === code.toLowerCase() ||
           i.invoiceNumber.toLowerCase() === code.toLowerCase() ||
           i.labNumber.toLowerCase() === code.toLowerCase()
    );

    if (matchingInvoice) {
      playScanSuccessSound();
      setLastScannedResult({
        code,
        title: `فاتورة مالية: ${matchingInvoice.patientName} (${matchingInvoice.invoiceNumber})`,
        type: 'invoice',
        id: matchingInvoice.id
      });
      return;
    }

    // 3. Search in Inventory Reagents
    const matchingItem = inventory.find(
      item => item.barcode?.toLowerCase() === code.toLowerCase() ||
              item.lotNumber?.toLowerCase() === code.toLowerCase() ||
              item.code?.toLowerCase() === code.toLowerCase()
    );

    if (matchingItem) {
      playScanSuccessSound();
      setLastScannedResult({
        code,
        title: `محلول/مادة مخبرية: ${matchingItem.nameAr} (رصيد: ${matchingItem.currentQuantity} ${matchingItem.unit})`,
        type: 'inventory',
        id: matchingItem.id
      });
      return;
    }

    playScanErrorSound();
    setLastScannedResult({
      code,
      title: 'لم يتم العثور على سجل مطابق للباركود في قاعدة البيانات.',
      type: 'unknown'
    });
  };

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    processCode(manualCode);
  };

  const handleNavigateToResult = () => {
    if (!lastScannedResult || !lastScannedResult.id) return;
    if (lastScannedResult.type === 'report') {
      setSelectedReportId(lastScannedResult.id);
      setActiveTab('diagnostic_editor');
      setIsBarcodeScannerOpen(false);
    } else if (lastScannedResult.type === 'invoice') {
      setActiveTab('financial_income');
      setIsBarcodeScannerOpen(false);
    } else if (lastScannedResult.type === 'inventory') {
      setActiveTab('inventory');
      setIsBarcodeScannerOpen(false);
    }
  };

  if (!isBarcodeScannerOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-lg w-full overflow-hidden text-right">
        {/* Header */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ScanLine className="w-5 h-5 text-rose-400" />
            <h3 className="font-bold text-base">قارئ الباركود المخبري الذكي (Barcode Scanner)</h3>
          </div>
          <button
            onClick={() => setIsBarcodeScannerOpen(false)}
            className="text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5">
          {/* Camera View */}
          <div className="relative bg-slate-900 rounded-xl overflow-hidden min-h-[180px] flex items-center justify-center border border-slate-700">
            {cameraActive ? (
              <video ref={videoRef} className="w-full h-48 object-cover" />
            ) : (
              <div className="text-center p-6 space-y-2">
                <Camera className="w-8 h-8 text-slate-500 mx-auto" />
                <p className="text-xs text-slate-400">
                  يمكنك تفعيل الكاميرا لقراءة الباركود فورياً من أنابيب العينات أو بطاقات المرضى
                </p>
                <button
                  type="button"
                  onClick={startCamera}
                  className="px-4 py-2 bg-rose-900 hover:bg-rose-800 text-white text-xs font-bold rounded-lg transition-colors cursor-pointer"
                >
                  تشغيل كاميرا القارئ
                </button>
              </div>
            )}

            {cameraError && (
              <div className="absolute inset-0 bg-slate-900/90 flex items-center justify-center p-4 text-center">
                <p className="text-xs text-rose-400 font-semibold">{cameraError}</p>
              </div>
            )}
          </div>

          {/* Manual Input */}
          <form onSubmit={handleManualSubmit} className="space-y-3">
            <label className="block text-xs font-bold text-slate-700">
              أو أدخل رقم الباركود / كود العينة يدوياً:
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={manualCode}
                onChange={e => setManualCode(e.target.value)}
                placeholder="مثال: RT-10029 أو INV-2026-001..."
                className="flex-1 text-xs font-mono font-bold bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-rose-500 text-left"
                dir="ltr"
              />
              <button
                type="submit"
                className="px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl transition-colors cursor-pointer"
              >
                بحث
              </button>
            </div>
          </form>

          {/* Scanned Result */}
          {lastScannedResult && (
            <div className={`p-4 rounded-xl border text-xs space-y-2 animate-in fade-in ${
              lastScannedResult.type !== 'unknown'
                ? 'bg-emerald-50 border-emerald-200 text-emerald-950'
                : 'bg-red-50 border-red-200 text-red-950'
            }`}>
              <div className="flex items-center justify-between font-bold">
                <span className="font-mono">{lastScannedResult.code}</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-white font-bold">
                  {lastScannedResult.type === 'report' ? 'عينة مخبرية' : lastScannedResult.type === 'invoice' ? 'فاتورة' : lastScannedResult.type === 'inventory' ? 'محلول' : 'غير معروف'}
                </span>
              </div>
              <p className="font-semibold">{lastScannedResult.title}</p>

              {lastScannedResult.id && (
                <button
                  type="button"
                  onClick={handleNavigateToResult}
                  className="w-full mt-2 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-lg transition-colors cursor-pointer shadow-sm"
                >
                  فتح السجل المطابق فوراً
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
