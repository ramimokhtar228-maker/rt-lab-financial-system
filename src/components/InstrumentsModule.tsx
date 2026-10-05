import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  Cpu,
  Activity,
  CheckCircle,
  AlertTriangle,
  Play,
  RotateCw,
  FileText,
  Radio,
  Terminal,
  ArrowRight,
  Sparkles,
  Server,
  Usb,
  Wifi,
  Search,
  CheckCheck
} from 'lucide-react';
import { LabInstrument } from '../types';

export const InstrumentsModule: React.FC = () => {
  const {
    instruments,
    transmissions,
    toggleInstrumentStatus,
    simulateInstrumentRun,
    applyTransmissionToReport,
    reports,
    activeTab,
    setActiveTab,
    setSelectedReportId
  } = useApp();

  const [selectedInstId, setSelectedInstId] = useState<string>(instruments[0]?.id || '');
  const [sampleBarcode, setSampleBarcode] = useState<string>('');
  const [selectedPatientReportId, setSelectedPatientReportId] = useState<string>(reports[0]?.id || '');
  const [isSimulating, setIsSimulating] = useState(false);
  const [serialSupported, setSerialSupported] = useState(typeof navigator !== 'undefined' && 'serial' in navigator);
  const [serialConnecting, setSerialConnecting] = useState(false);
  const [selectedTxId, setSelectedTxId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const activeInstrument = instruments.find(i => i.id === selectedInstId) || instruments[0];
  const selectedReport = reports.find(r => r.id === selectedPatientReportId) || reports[0];

  // Auto-fill barcode if report changes
  React.useEffect(() => {
    if (selectedReport && !sampleBarcode) {
      setSampleBarcode(selectedReport.patient.barcode || selectedReport.reportNumber);
    }
  }, [selectedReport, sampleBarcode]);

  // Connect via Web Serial API
  const handleConnectWebSerial = async () => {
    if (!('serial' in navigator)) {
      alert("متصفحك لا يدعم Web Serial API مباشرة. يمكنك استخدام محاكي الربط المدمج أو فتح النظام في متصفح Chrome/Edge.");
      return;
    }

    try {
      setSerialConnecting(true);
      // @ts-ignore
      const port = await navigator.serial.requestPort();
      await port.open({ baudRate: 9600 });
      alert(`تم فتح منفذ الاتصال التسلسلي (Serial Port) بنجاح مع جهاز ${activeInstrument.name}!`);
    } catch (err: any) {
      console.warn("Serial connection canceled or failed:", err);
    } finally {
      setSerialConnecting(false);
    }
  };

  // Run Test / Simulation
  const handleRunTest = () => {
    if (!activeInstrument) return;
    setIsSimulating(true);

    const bcode = sampleBarcode || (selectedReport ? selectedReport.patient.barcode : `RT-${Math.floor(10000 + Math.random() * 90000)}`);
    const pName = selectedReport ? selectedReport.patient.fullName : 'عينة تجريبية واردة';
    const lNum = selectedReport ? selectedReport.reportNumber : undefined;

    setTimeout(() => {
      const newTx = simulateInstrumentRun(activeInstrument.id, bcode, pName, lNum);
      setSelectedTxId(newTx.id);
      setIsSimulating(false);
    }, 1200);
  };

  const handleApplyResults = (txId: string, repId: string) => {
    const success = applyTransmissionToReport(txId, repId);
    if (success) {
      setSelectedReportId(repId);
    }
  };

  const filteredTransmissions = transmissions.filter(t =>
    t.sampleBarcode.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.instrumentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (t.patientName && t.patientName.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-rose-950 to-slate-900 text-white rounded-2xl p-6 shadow-xl border border-rose-900/40">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-rose-600/30 rounded-xl border border-rose-500/40 text-rose-300">
                <Cpu className="w-7 h-7 animate-pulse" />
              </div>
              <div>
                <h1 className="text-2xl font-black tracking-tight">وحدة الربط المباشر مع أجهزة التحاليل (LIS Instrument Interfacing)</h1>
                <p className="text-slate-300 text-xs md:text-sm font-medium">
                  منظومة الربط الآلي ثنائية الاتجاه مع أجهزة الدم والكيمياء والسيولة (ASTM E1381 / HL7 / RS232 Serial / TCP-IP)
                </p>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={handleConnectWebSerial}
              disabled={serialConnecting}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-emerald-400 border border-slate-700 font-bold text-xs shadow-md transition-all cursor-pointer"
            >
              <Usb className="w-4 h-4" />
              <span>{serialConnecting ? 'جارِ فتح المنفذ...' : 'فتح اتصال COM / Serial'}</span>
            </button>
            <div className="inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-emerald-950/80 text-emerald-300 border border-emerald-800/60 text-xs font-semibold">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
              <span>خادم الربط LIS Hub نشط</span>
            </div>
          </div>
        </div>
      </div>

      {/* Instruments Grid Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {instruments.map(inst => {
          const isSelected = inst.id === activeInstrument.id;
          return (
            <div
              key={inst.id}
              onClick={() => setSelectedInstId(inst.id)}
              className={`p-4 rounded-xl border transition-all cursor-pointer text-right flex flex-col justify-between ${
                isSelected
                  ? 'bg-rose-950/20 border-rose-600 shadow-md ring-2 ring-rose-500/30'
                  : 'bg-white border-slate-200 hover:border-rose-300 shadow-sm'
              }`}
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    inst.status === 'online' ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-600'
                  }`}>
                    {inst.status === 'online' ? 'متصل وجاهز' : 'غير متصل'}
                  </span>
                  <Radio className={`w-4 h-4 ${inst.status === 'online' ? 'text-emerald-500 animate-pulse' : 'text-slate-400'}`} />
                </div>

                <div>
                  <h3 className="font-black text-slate-800 text-sm">{inst.name}</h3>
                  <p className="text-[11px] text-slate-500">{inst.manufacturer}</p>
                </div>

                <div className="text-[10px] space-y-1 font-mono text-slate-600 bg-slate-50 p-2 rounded-lg border border-slate-100">
                  <div className="flex justify-between">
                    <span className="text-slate-400">البروتوكول:</span>
                    <span className="font-bold text-rose-900">{inst.protocol}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">المنفذ:</span>
                    <span className="truncate max-w-[120px]">{inst.connectionPort}</span>
                  </div>
                </div>
              </div>

              <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px]">
                <span className="text-slate-500">الفحوصات: <strong className="text-slate-800 font-mono">{inst.totalTestsRun}</strong></span>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleInstrumentStatus(inst.id);
                  }}
                  className="text-[10px] text-blue-700 hover:underline font-bold"
                >
                  {inst.status === 'online' ? 'تعطيل' : 'تفعيل'}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Main Testing & Data Transmission Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Sample Testing Controller */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Play className="w-5 h-5 text-rose-700" />
                <h2 className="font-black text-slate-800 text-base">إرسال واستقبال نتائج عينة</h2>
              </div>
              <span className="text-xs font-bold text-rose-800 bg-rose-50 px-2.5 py-1 rounded-full">
                الجهاز المحدد: {activeInstrument.name}
              </span>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  اختر المريض من قائمة العمل الحالية:
                </label>
                <select
                  value={selectedPatientReportId}
                  onChange={(e) => {
                    setSelectedPatientReportId(e.target.value);
                    const rep = reports.find(r => r.id === e.target.value);
                    if (rep) {
                      setSampleBarcode(rep.patient.barcode || rep.reportNumber);
                    }
                  }}
                  className="w-full text-xs font-medium bg-slate-50 border border-slate-200 rounded-xl p-2.5 focus:ring-2 focus:ring-rose-500 focus:outline-none"
                >
                  {reports.map(r => (
                    <option key={r.id} value={r.id}>
                      {r.reportNumber} - {r.patient.fullName} ({r.profiles.map(p => p.profileCode).join(', ')})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  باركود أنبوبة التحليل (Tube Barcode):
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={sampleBarcode}
                    onChange={(e) => setSampleBarcode(e.target.value)}
                    placeholder="مثال: RT-10029"
                    className="w-full text-sm font-mono font-bold bg-slate-50 border border-slate-200 rounded-xl p-2.5 focus:ring-2 focus:ring-rose-500 focus:outline-none"
                  />
                  <span className="absolute left-3 top-2.5 text-xs text-slate-400 font-mono">
                    Scan Barcode
                  </span>
                </div>
              </div>

              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-2 text-slate-600">
                <div className="flex items-center justify-between">
                  <span className="font-bold">الموديل:</span>
                  <span className="font-mono text-slate-800">{activeInstrument.model}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-bold">البروفايلات المدعومة:</span>
                  <span className="text-rose-900 font-bold">{activeInstrument.supportedProfiles.join(' | ')}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-bold">حالة الاتصال:</span>
                  <span className="text-emerald-700 font-bold flex items-center gap-1">
                    <CheckCircle className="w-3.5 h-3.5" />
                    جاهز لاستقبال إشارة التحليل
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={handleRunTest}
                disabled={isSimulating}
                className={`w-full py-3.5 rounded-xl font-black text-sm text-white shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer ${
                  isSimulating
                    ? 'bg-slate-400 cursor-not-allowed'
                    : 'bg-rose-900 hover:bg-rose-800 shadow-rose-900/20 active:scale-[0.99]'
                }`}
              >
                {isSimulating ? (
                  <>
                    <RotateCw className="w-4 h-4 animate-spin" />
                    <span>جارِ تشغيل الفحص وقراءة المجسات المخبرية...</span>
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4 fill-white" />
                    <span>تشغيل الفحص وسحب النتائج من {activeInstrument.name}</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: Live Transmission Feed & Auto Mapping */}
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Terminal className="w-5 h-5 text-slate-800" />
                <h2 className="font-black text-slate-800 text-base">سجل الإشارات والنتائج الواردة (Data Transmissions)</h2>
              </div>

              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute right-2.5 top-2.5" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="بحث برقم الباركود أو المريض..."
                  className="text-xs bg-slate-50 border border-slate-200 rounded-xl pr-8 pl-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-rose-500"
                />
              </div>
            </div>

            {filteredTransmissions.length === 0 ? (
              <div className="text-center py-12 text-slate-400 text-xs">
                لا توجد إشارات واردة حالياً. اضغط "تشغيل الفحص وسحب النتائج" لإجراء فحص عبر الجهاز.
              </div>
            ) : (
              <div className="space-y-4 max-h-[500px] overflow-y-auto pr-1">
                {filteredTransmissions.map(tx => {
                  const isMapped = tx.status === 'mapped';
                  return (
                    <div
                      key={tx.id}
                      className="p-4 rounded-xl border border-slate-200 bg-slate-50/70 hover:bg-slate-50 transition-all space-y-3"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-xs bg-slate-800 text-white px-2 py-0.5 rounded-md">
                            {tx.sampleBarcode}
                          </span>
                          <span className="font-bold text-xs text-slate-800">
                            {tx.patientName || 'مريض غير محدد'}
                          </span>
                          <span className="text-[11px] text-slate-500 font-mono">
                            ({tx.patientLabNumber || 'RT-XXXX'})
                          </span>
                        </div>

                        <div className="flex items-center gap-2">
                          <span className="text-[10px] text-slate-400 font-mono">{tx.timestamp}</span>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            isMapped ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                          }`}>
                            {isMapped ? 'تم إدراجها بالتقرير' : 'جاهزة للربط'}
                          </span>
                        </div>
                      </div>

                      {/* Result Parameters preview */}
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs bg-white p-3 rounded-lg border border-slate-100">
                        {Object.entries(tx.results).slice(0, 8).map(([param, val]) => (
                          <div key={param} className="space-y-0.5">
                            <span className="text-[10px] text-slate-500 block truncate">{param}:</span>
                            <span className="font-mono font-bold text-slate-800">{String(val)}</span>
                          </div>
                        ))}
                      </div>

                      {/* Raw Protocol Preview snippet */}
                      <div className="font-mono text-[10px] text-slate-400 bg-slate-900 text-slate-300 p-2 rounded-lg truncate">
                        {tx.rawMessage}
                      </div>

                      {/* Action buttons */}
                      <div className="flex items-center justify-between pt-1">
                        <span className="text-[11px] text-slate-500">
                          مصدر القراءة: <strong className="text-rose-900">{tx.instrumentName}</strong>
                        </span>

                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => handleApplyResults(tx.id, selectedPatientReportId)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-sm transition-colors cursor-pointer"
                          >
                            <CheckCheck className="w-3.5 h-3.5" />
                            <span>إدراج في تقرير المريض الحالي</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => {
                              setSelectedReportId(selectedPatientReportId);
                              setActiveTab('diagnostic_editor');
                            }}
                            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold text-xs transition-colors cursor-pointer"
                          >
                            <span>فتح التقرير</span>
                            <ArrowRight className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
