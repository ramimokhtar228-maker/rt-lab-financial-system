import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { X, Camera, ScanLine, AlertCircle, Check, Keyboard } from 'lucide-react';
import { playScanSuccessSound, playScanErrorSound } from '../utils/barcode';

export const BarcodeScannerModal: React.FC = () => {
  const {
    scannerOpen,
    setScannerOpen,
    handleBarcodeScanned,
    inventory,
    incomeRecords,
    language
  } = useApp();

  const [manualCode, setManualCode] = useState('');
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [lastScannedResult, setLastScannedResult] = useState<{ code: string; title: string; type: string } | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    if (!scannerOpen) {
      stopCamera();
      setManualCode('');
      setLastScannedResult(null);
    }
  }, [scannerOpen]);

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
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const detector = new (window as any).BarcodeDetector({
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
            // frame detect error
          }
        }, 500);

        return () => clearInterval(scanInterval);
      }
    } catch {
      setCameraError(
        language === 'ar'
          ? 'تعذر الوصول إلى كاميرا الجهاز. تأكد من منح الإذن للمتصفح، أو استخدم الماسح الليزري/الإدخال اليدوي.'
          : 'Unable to access camera. Check browser permissions or use laser scanner / manual input.'
      );
      setCameraActive(false);
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop());
      streamRef.current = null;
    }
    setCameraActive(false);
  };

  const processCode = (raw: string) => {
    const code = raw.trim();
    if (!code) return;

    // Check inventory
    const item = inventory.find(i => i.barcode === code || i.itemCode === code);
    if (item) {
      playScanSuccessSound();
      setLastScannedResult({
        code,
        title: item.nameAr,
        type: language === 'ar' ? 'مستلزم/كاشف مخبري' : 'Inventory Item'
      });
      setTimeout(() => {
        handleBarcodeScanned(code);
        setScannerOpen(false);
      }, 700);
      return;
    }

    // Check income records
    const inc = incomeRecords.find(r => r.barcode === code || r.labNumber === code);
    if (inc) {
      playScanSuccessSound();
      setLastScannedResult({
        code,
        title: `${inc.patientName} (${inc.invoiceNumber})`,
        type: language === 'ar' ? 'فاتورة وتحليل مريض' : 'Patient Invoice'
      });
      setTimeout(() => {
        handleBarcodeScanned(code);
        setScannerOpen(false);
      }, 700);
      return;
    }

    // Unregistered barcode
    playScanSuccessSound();
    setLastScannedResult({
      code,
      title: language === 'ar' ? 'باركود جديد - سيتم تحويله للفاتورة' : 'New Barcode',
      type: language === 'ar' ? 'عينة جديدة' : 'New Sample'
    });
    setTimeout(() => {
      handleBarcodeScanned(code);
      setScannerOpen(false);
    }, 700);
  };

  if (!scannerOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
      <div className="bg-white rounded-xl shadow-2xl border border-slate-200 max-w-lg w-full overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ScanLine className="w-5 h-5 text-rose-400" />
            <h3 className="font-bold text-sm">
              {language === 'ar' ? 'قارئ الباركود للعينة والمستلزمات' : 'Barcode & Sample Reader'}
            </h3>
          </div>
          <button
            onClick={() => {
              stopCamera();
              setScannerOpen(false);
            }}
            className="text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5">
          {/* Laser Hardware Scanner Notice */}
          <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-xs text-rose-950 flex items-start gap-2">
            <ScanLine className="w-4 h-4 text-rose-800 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold">
                {language === 'ar' ? 'دعم القارئ الليزري (USB / Bluetooth): ' : 'Laser Barcode Gun Ready: '}
              </span>
              <span>
                {language === 'ar'
                  ? 'يمكنك توجيه قارئ الباركود اليدوي إلى أي أنبوبة عينة أو علبة كواشف في أي وقت دون فتح هذه النافذة.'
                  : 'You can directly scan any sample tube or reagent barcode at any time.'}
              </span>
            </div>
          </div>

          {/* Camera View Area */}
          <div>
            {!cameraActive ? (
              <button
                type="button"
                onClick={startCamera}
                className="w-full h-44 rounded-lg border-2 border-dashed border-slate-300 hover:border-rose-800 bg-slate-50 flex flex-col items-center justify-center gap-2 text-slate-600 hover:text-rose-900 transition-colors"
              >
                <Camera className="w-8 h-8 text-rose-700" />
                <span className="text-xs font-bold">
                  {language === 'ar' ? 'تشغيل كاميرا الجهاز لقراءة الباركود' : 'Activate Device Camera'}
                </span>
                <span className="text-[11px] text-slate-400">
                  {language === 'ar' ? 'يدعم قراءة باركود الأنابيب وكود الاستجابة السريعة QR' : 'Reads tubes barcode & QR codes'}
                </span>
              </button>
            ) : (
              <div className="relative rounded-lg overflow-hidden bg-black h-48 flex items-center justify-center">
                <video ref={videoRef} className="w-full h-full object-cover" playsInline />
                <div className="absolute inset-x-8 top-1/2 -translate-y-1/2 h-20 border-2 border-rose-400 rounded bg-rose-400/10 pointer-events-none flex items-center justify-center">
                  <div className="w-full h-0.5 bg-rose-500 animate-pulse shadow-sm" />
                </div>
                <button
                  type="button"
                  onClick={stopCamera}
                  className="absolute top-2 right-2 bg-slate-900/80 text-white text-[11px] px-2 py-1 rounded"
                >
                  {language === 'ar' ? 'إيقاف الكاميرا' : 'Stop'}
                </button>
              </div>
            )}
            {cameraError && (
              <div className="mt-2 text-xs text-rose-600 flex items-center gap-1.5 bg-rose-50 p-2 rounded">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{cameraError}</span>
              </div>
            )}
          </div>

          {/* Manual Input Form */}
          <form
            onSubmit={e => {
              e.preventDefault();
              processCode(manualCode);
            }}
            className="space-y-3"
          >
            <label className="block text-xs font-bold text-slate-700">
              {language === 'ar' ? 'أو أدخل رقم الباركود يدوياً:' : 'Or enter barcode number:'}
            </label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <input
                  type="text"
                  value={manualCode}
                  onChange={e => setManualCode(e.target.value)}
                  placeholder="e.g. 9827361829 or 622300188201"
                  className="w-full px-3 py-2 text-xs font-mono rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-rose-800"
                />
                <Keyboard className="w-4 h-4 text-slate-400 absolute left-2.5 top-2.5 pointer-events-none" />
              </div>
              <button
                type="submit"
                className="px-4 py-2 bg-rose-900 hover:bg-rose-950 text-white text-xs font-bold rounded-lg transition-colors"
              >
                {language === 'ar' ? 'بحث وقراءة' : 'Scan'}
              </button>
            </div>
          </form>

          {/* Quick preset tests for immediate demo */}
          <div>
            <div className="text-[11px] font-semibold text-slate-500 mb-1.5">
              {language === 'ar' ? 'باركودات جاهزة للتجربة السريعة:' : 'Quick demo barcodes:'}
            </div>
            <div className="flex flex-wrap gap-1.5">
              <button
                type="button"
                onClick={() => processCode('9827361829')}
                className="text-[11px] px-2 py-1 bg-slate-100 hover:bg-rose-100 text-slate-700 hover:text-rose-950 rounded font-mono border border-slate-200"
              >
                9827361829 (عينة محمود)
              </button>
              <button
                type="button"
                onClick={() => processCode('9827361830')}
                className="text-[11px] px-2 py-1 bg-slate-100 hover:bg-rose-100 text-slate-700 hover:text-rose-950 rounded font-mono border border-slate-200"
              >
                9827361830 (عينة سارة)
              </button>
              <button
                type="button"
                onClick={() => processCode('622300188201')}
                className="text-[11px] px-2 py-1 bg-slate-100 hover:bg-amber-100 text-slate-700 hover:text-amber-900 rounded font-mono border border-slate-200"
              >
                622300188201 (كاشف سكر)
              </button>
              <button
                type="button"
                onClick={() => processCode('622300188205')}
                className="text-[11px] px-2 py-1 bg-slate-100 hover:bg-amber-100 text-slate-700 hover:text-amber-900 rounded font-mono border border-slate-200"
              >
                622300188205 (أنابيب EDTA)
              </button>
            </div>
          </div>

          {/* Result preview */}
          {lastScannedResult && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-xs text-emerald-900 flex items-center justify-between">
              <div>
                <span className="font-bold flex items-center gap-1">
                  <Check className="w-4 h-4 text-emerald-700" />
                  {lastScannedResult.title}
                </span>
                <span className="text-[11px] text-emerald-700 font-mono mt-0.5 block">
                  [{lastScannedResult.type}] - {lastScannedResult.code}
                </span>
              </div>
              <span className="text-[11px] text-emerald-800 font-semibold">
                {language === 'ar' ? 'جارِ التحويل...' : 'Routing...'}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
