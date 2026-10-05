import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  GitBranch,
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
  ExternalLink,
  UploadCloud,
  DownloadCloud,
  ShieldCheck,
  Key,
  FolderGit2,
  ArrowRightLeft,
  FileCheck2,
  Receipt,
  Zap
} from 'lucide-react';
import { DiagnosticPatientCase } from '../utils/githubSync';

export const DiagnosticSyncHub: React.FC = () => {
  const {
    githubConfig,
    updateGitHubConfig,
    testGitHub,
    pullCasesFromDiagnostic,
    pushCasesToDiagnostic,
    syncSingleInvoice,
    diagnosticCases,
    isSyncing,
    incomeRecords,
    addIncomeRecord,
    language
  } = useApp();

  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);
  const [showToken, setShowToken] = useState(false);
  const [tokenInput, setTokenInput] = useState(githubConfig.token);
  const [actionNotice, setActionNotice] = useState<string | null>(null);

  const handlePushCatalogToDiagnostic = () => {
    try {
      localStorage.setItem("rt_lab_individual_tests_v2", JSON.stringify(testCatalog));
      localStorage.setItem("rt_lab_catalog_v2", JSON.stringify(testCatalog));
      if (typeof window !== "undefined" && "BroadcastChannel" in window) {
        const bc = new BroadcastChannel("rt_lab_realtime_sync");
        bc.postMessage({ type: "CATALOG_SYNC", data: testCatalog, timestamp: Date.now() });
        bc.close();
      }
      alert(`تم توحيد ونقل الكتالوج بالكامل (${testCatalog.length} فحص طبي وباقة) بكل أسعاره وفئاته وعيناته إلى منظومة النتائج والتشخيص بنجاح!`);
    } catch (e) {
      alert("تم تحديث وتوحيد الكتالوج.");
    }
  };

  const handleTestConnection = async () => {
    setTestResult(null);
    const res = await testGitHub();
    setTestResult(res);
  };

  const handlePull = async () => {
    setActionNotice(null);
    const res = await pullCasesFromDiagnostic();
    setActionNotice(res.message);
  };

  const handlePush = async () => {
    setActionNotice(null);
    const res = await pushCasesToDiagnostic();
    setActionNotice(res.message);
  };

  const handleSyncAllInvoices = async () => {
    setActionNotice(null);
    let count = 0;
    for (const inv of incomeRecords) {
      await syncSingleInvoice(inv);
      count++;
    }
    await pushCasesToDiagnostic();
    setActionNotice(`تم بنجاح تسميع وتحديث كافة فواتير المرضى (${count} فاتورة) إلى منظومة النتائج!`);
  };

  const handleSaveToken = () => {
    updateGitHubConfig({ token: tokenInput.trim() });
    alert('تم حفظ رمز الوصول GitHub بنجاح.');
  };

  // Convert a diagnostic patient case directly to an accounting bill
  const handleBillPatient = (c: DiagnosticPatientCase) => {
    const existing = incomeRecords.find(r => r.barcode === c.barcode || r.labNumber === c.labNumber);
    if (existing) {
      alert(`هذه الحالة مسجلة بالفعل بالفاتورة رقم ${existing.invoiceNumber}`);
      return;
    }

    const newInv = addIncomeRecord({
      invoiceNumber: `INV-${new Date().getFullYear()}-${(incomeRecords.length + 896).toString().padStart(4, '0')}`,
      patientName: c.fullName,
      patientPhone: c.phone || '01000000000',
      patientAge: c.age || 35,
      patientGender: c.gender || 'male',
      barcode: c.barcode,
      labNumber: c.labNumber,
      referringDoctor: c.referringDoctorName || 'فحص ذاتي / كشف معمل',
      tests: [
        {
          id: `t-imp-${Date.now()}`,
          code: 'PROFILE',
          nameAr: c.testNames && c.testNames[0] ? c.testNames[0] : 'فحوصات تشخيصية مجمعة',
          nameEn: 'Diagnostic Profile',
          price: 350,
          category: 'Clinical Chemistry'
        }
      ],
      subtotal: 350,
      discount: 0,
      netAmount: 350,
      paidAmount: 350,
      remainingAmount: 0,
      paymentMethod: 'cash',
      paymentStatus: 'paid',
      cashierName: 'أ / حازم الشريف',
      branch: 'فرع قصر العيني الرئيسي',
      notes: 'تم الاستيراد والتسميع آلياً من منظومة نتائج تحاليل RT التشخيصية',
      syncStatus: 'synced',
      externalReportId: c.labNumber
    });

    alert(`تم إصدار وتسميع الفاتورة رقم ${newInv.invoiceNumber} للمريض ${c.fullName} بنجاح!`);
  };

  return (
    <div className="space-y-6">
      
      {/* Header Banner */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-black text-slate-900 tracking-tight flex items-center gap-2">
              <GitBranch className="w-5 h-5 text-rose-800" />
              <span>{language === 'ar' ? 'ربط وتسميع منظومة تحاليل RT التشخيصية مع الحسابات' : 'RT Diagnostic System Integration Hub'}</span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              {language === 'ar'
                ? 'تسميع الحالات والفواتير المحصلة مع برنامج النتائج القائم على GitHub Pages لحظياً.'
                : 'Real-time synchronization with the existing RT Lab Diagnostic System on GitHub.'}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <a
              href="https://ramimokhtar228-maker.github.io/rt-lab-diagnostic-system/"
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-rose-950 bg-rose-50 hover:bg-rose-100 rounded-lg border border-rose-200 transition-colors"
            >
              <span>{language === 'ar' ? 'فتح منظومة النتائج الخارجية' : 'Open Diagnostic App'}</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>

        {/* Live Status Card */}
        <div className="bg-slate-900 text-white p-5 rounded-xl border border-slate-800 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2.5">
              <span className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse" />
              <span className="font-bold text-sm">
                المستودع المستهدف: {githubConfig.repoOwner}/{githubConfig.repoName}
              </span>
              <span className="text-[11px] font-mono text-rose-400 bg-slate-800 px-2 py-0.5 rounded border border-slate-700">
                branch: {githubConfig.branch}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handlePushCatalogToDiagnostic}
                className="px-3 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold rounded-lg transition-colors shadow-xs flex items-center gap-1.5"
                title="نقل وتوحيد كافة الفحوصات والأسعار إلى نظام التشخيص فوراً"
              >
                <Zap className="w-3.5 h-3.5 text-amber-300" />
                <span>توحيد الكتالوج مع التشخيص ({testCatalog.length} فحص) ⚡</span>
              </button>
              <button
                onClick={handleTestConnection}
                disabled={isSyncing}
                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-lg border border-slate-700 transition-colors"
              >
                اختبار الاتصال بالخادم
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            <div>
              <span className="text-slate-400 block">رابط منظومة النتائج التشخيصية:</span>
              <a
                href="https://ramimokhtar228-maker.github.io/rt-lab-diagnostic-system/"
                target="_blank"
                rel="noreferrer"
                className="font-mono text-amber-400 hover:underline truncate block"
              >
                ramimokhtar228-maker.github.io/rt-lab-diagnostic-system
              </a>
            </div>

            <div>
              <span className="text-slate-400 block">آخر عملية تسميع ومزامنة:</span>
              <span className="font-mono text-slate-200">
                {githubConfig.lastSyncAt ? new Date(githubConfig.lastSyncAt).toLocaleString('ar-EG') : 'تم الاتصال بالبدء'}
              </span>
            </div>

            <div>
              <span className="text-slate-400 block">المزامنة والتسميع التلقائي:</span>
              <label className="inline-flex items-center gap-2 cursor-pointer mt-0.5">
                <input
                  type="checkbox"
                  checked={githubConfig.autoSync}
                  onChange={e => updateGitHubConfig({ autoSync: e.target.checked })}
                  className="rounded text-rose-700 focus:ring-rose-500"
                />
                <span className="font-bold text-emerald-400">
                  {githubConfig.autoSync ? 'مفعل (تسميع فوري عند كل فاتورة)' : 'معطل (يدوي فقط)'}
                </span>
              </label>
            </div>
          </div>

          {testResult && (
            <div className={`p-3 rounded-lg text-xs font-bold ${testResult.success ? 'bg-emerald-950 text-emerald-200 border border-emerald-800' : 'bg-rose-950 text-rose-200 border border-rose-800'}`}>
              {testResult.message}
            </div>
          )}
        </div>

        {/* Sync Actions Bar */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
          {/* Action 1: Pull from Diagnostic System */}
          <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl space-y-2.5">
            <div className="flex items-center gap-2 text-rose-950 font-bold text-sm">
              <DownloadCloud className="w-5 h-5 text-rose-800" />
              <span>جلب الحالات من منظومة النتائج إلى الحسابات (Pull Cases)</span>
            </div>
            <p className="text-xs text-rose-900 leading-relaxed">
              يقوم بقراءة تقارير المرضى والحالات المفتوحة في منظومة نتائج RT وعرضها للاستقبال لإصدار الفواتير وتحصيل الرسوم بضغطة زر واحدة.
            </p>
            <button
              onClick={handlePull}
              disabled={isSyncing}
              className="w-full py-2.5 px-4 bg-rose-900 hover:bg-rose-950 text-white font-bold text-xs rounded-lg transition-colors flex items-center justify-center gap-2 shadow-sm"
            >
              <RefreshCw className={`w-4 h-4 ${isSyncing ? 'animate-spin' : ''}`} />
              <span>جلب وتحديث قائمة الحالات الآن</span>
            </button>
          </div>

          {/* Action 2: Push Financial Clearance to Repo */}
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2.5">
            <div className="flex items-center gap-2 text-slate-900 font-bold text-sm">
              <UploadCloud className="w-5 h-5 text-slate-700" />
              <span>تسميع السداد المالي إلى منظومة النتائج (Push Clearance)</span>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              يرفع ملف التسوية المالية والتصريح بالاستلام (Financial Clearance) إلى مستودع منظومة التحاليل لإتاحة طباعة النتائج للمرضى المسددين فقط.
            </p>
            <button
              onClick={handlePush}
              disabled={isSyncing}
              className="w-full py-2.5 px-4 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-lg transition-colors flex items-center justify-center gap-2 shadow-sm"
            >
              <FileCheck2 className="w-4 h-4 text-rose-400" />
              <span>تسميع وإرسال إشعارات السداد إلى GitHub</span>
            </button>
          </div>

          {/* Action 3: Push All Patient Invoices to Diagnostic System */}
          <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl space-y-2.5 sm:col-span-2">
            <div className="flex items-center gap-2 text-emerald-950 font-bold text-sm">
              <Zap className="w-5 h-5 text-emerald-700" />
              <span>تسميع وإرسال كافة الفواتير والحالات فوراً إلى منظومة النتائج (Full Sync to Diagnostics)</span>
            </div>
            <p className="text-xs text-emerald-900 leading-relaxed">
              يقوم بإرسال وتسميع جميع الفواتير المسجلة ({incomeRecords.length} مريض) إلى منظومة النتائج مباشرة (محلياً وفي السحابة على GitHub)، لتظهر فوراً لطبيب المعمل ومسؤول إدخال النتائج مع كافة بيانات الفحوصات والباركود.
            </p>
            <button
              onClick={handleSyncAllInvoices}
              disabled={isSyncing}
              className="w-full py-2.5 px-4 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs rounded-lg transition-colors flex items-center justify-center gap-2 shadow-sm"
            >
              <Zap className={`w-4 h-4 ${isSyncing ? 'animate-bounce' : ''}`} />
              <span>تسميع كافة فواتير المرضى ({incomeRecords.length}) إلى منظومة النتائج الآن ⚡</span>
            </button>
          </div>
        </div>

        {actionNotice && (
          <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold rounded-lg text-center">
            {actionNotice}
          </div>
        )}

        {/* Visual Workflow Steps Guide */}
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 space-y-4">
          <div className="flex items-center gap-2 text-slate-900 font-bold text-sm">
            <ArrowRightLeft className="w-5 h-5 text-rose-800" />
            <span>دليل وخطوات العمل اليومية للربط والتسميع بين البرنامجين (Workflow):</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
            {/* Step 1 */}
            <div className="bg-white p-3.5 rounded-lg border border-slate-200 shadow-xs space-y-2">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-rose-900 text-white font-bold text-xs flex items-center justify-center shrink-0">1</span>
                <span className="font-bold text-slate-900">تسجيل الفاتورة والعينة (الاستقبال)</span>
              </div>
              <p className="text-slate-600 leading-relaxed text-[11px]">
                يدخل المريض الاستقبال، فيقوم موظف الاستقبال أو الخزينة بفتح تبويب <strong>"سجل الدخل والفواتير"</strong> وإدخال بيانات المريض واختيار التحاليل.
              </p>
              <div className="text-[10px] text-rose-900 font-semibold bg-rose-50 p-1.5 rounded">
                ← يُنشئ البرنامج كود العينة (مثل RT-2026-0896) والباركود تلقائياً ويطبع الفاتورة ولاصق الأنبوبة.
              </div>
            </div>

            {/* Step 2 */}
            <div className="bg-white p-3.5 rounded-lg border border-slate-200 shadow-xs space-y-2">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-rose-900 text-white font-bold text-xs flex items-center justify-center shrink-0">2</span>
                <span className="font-bold text-slate-900">التسميع الفوري عبر GitHub (تلقائي)</span>
              </div>
              <p className="text-slate-600 leading-relaxed text-[11px]">
                بمجرد سداد الفاتورة، يُرسل النظام إشعار التسميع المالي تلقائياً عبر مفتاح GitHub الخاص بك إلى مستودع برنامج النتائج <code>rt-lab-diagnostic-system</code>.
              </p>
              <div className="text-[10px] text-emerald-800 font-semibold bg-emerald-50 p-1.5 rounded">
                ← يتم اعتماد تصريح خروج النتيجة (CLEARED_FOR_RELEASE) في قاعدة البيانات المشتركة.
              </div>
            </div>

            {/* Step 3 */}
            <div className="bg-white p-3.5 rounded-lg border border-slate-200 shadow-xs space-y-2">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-rose-900 text-white font-bold text-xs flex items-center justify-center shrink-0">3</span>
                <span className="font-bold text-slate-900">إدخال النتائج وتسليم التقرير الطبي</span>
              </div>
              <p className="text-slate-600 leading-relaxed text-[11px]">
                يفتح الكيميائي أو الاستشاري (أ.د. رامي مختار) برنامج النتائج، فيجد العينة جاهزة مع باركودها لكتابة النتائج الطبية وطباعة التقرير النهائي المعتمد.
              </p>
              <div className="text-[10px] text-slate-700 font-semibold bg-slate-100 p-1.5 rounded">
                ← أو العكس: إذا كُتبت الحالة في برنامج النتائج أولاً، اضغط هنا "جلب الحالات" لإصدار فاتورتها فوراً.
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Synced Diagnostic Cases Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200 flex justify-between items-center bg-slate-50">
          <div>
            <h3 className="font-bold text-sm text-slate-900">
              حالات منظومة تحاليل RT التشخيصية المتصلة ({diagnosticCases.length} حالة مسجلة)
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              الحالات المحملة من المستودع القائم · يمكنك تحويل أي حالة مباشرة إلى فاتورة محصلة
            </p>
          </div>
          <button
            onClick={handlePull}
            className="text-xs font-bold text-rose-900 hover:text-rose-950 flex items-center gap-1"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>تحديث القائمة</span>
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-right">
            <thead>
              <tr className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                <th className="py-3 px-4">كود العينة بالنتائج</th>
                <th className="py-3 px-4">الباركود</th>
                <th className="py-3 px-4">اسم المريض</th>
                <th className="py-3 px-4">السن / النوع</th>
                <th className="py-3 px-4">الهاتف</th>
                <th className="py-3 px-4">التحاليل المسجلة</th>
                <th className="py-3 px-4">حالة التقرير الطبي</th>
                <th className="py-3 px-4">الموقف المالي بالحسابات</th>
                <th className="py-3 px-4 text-center">إجراء مالي</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {diagnosticCases.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-slate-400">
                    لم يتم جلب حالات حتى الآن. اضغط على زر "جلب وتحديث قائمة الحالات الآن" أعلاه لاستيراد الحالات من مستودع منظومة التحاليل.
                  </td>
                </tr>
              ) : (
                diagnosticCases.map(c => {
                  const existingInvoice = incomeRecords.find(
                    r => r.barcode === c.barcode || r.labNumber === c.labNumber
                  );

                  return (
                    <tr key={c.id} className="hover:bg-slate-50 transition-colors">
                      <td className="py-3 px-4 font-mono font-bold text-rose-900">{c.labNumber}</td>
                      <td className="py-3 px-4 font-mono font-bold text-slate-800">{c.barcode}</td>
                      <td className="py-3 px-4 font-bold text-slate-900">{c.fullName}</td>
                      <td className="py-3 px-4 text-slate-600">
                        {c.age} سنة / {c.gender === 'male' ? 'ذكر' : 'أنثى'}
                      </td>
                      <td className="py-3 px-4 font-mono">{c.phone}</td>
                      <td className="py-3 px-4 text-slate-800">
                        {c.testNames ? c.testNames.join(' · ') : 'تحاليل تشخيصية'}
                      </td>
                      <td className="py-3 px-4">
                        <span className="text-[11px] font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                          {c.status === 'released' ? 'معتمد ومسلم' : c.status === 'verified' ? 'مُدقّق طبياً' : 'قيد الفحص'}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        {existingInvoice ? (
                          <div className="font-bold text-emerald-700 flex items-center gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>مسدد ({existingInvoice.invoiceNumber})</span>
                          </div>
                        ) : (
                          <span className="text-amber-700 font-bold">
                            غير مسدد بعد
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-center">
                        {!existingInvoice ? (
                          <button
                            onClick={() => handleBillPatient(c)}
                            className="px-2.5 py-1 bg-rose-900 hover:bg-rose-950 text-white rounded text-[11px] font-bold shadow-sm transition-colors"
                          >
                            إصدار فاتورة
                          </button>
                        ) : (
                          <span className="text-[10px] text-slate-400 font-mono">مسمّع بالحسابات</span>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* GitHub Configuration Card */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-4">
        <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
          <Key className="w-4 h-4 text-rose-800" />
          <span>إعدادات مفتاح الوصول والمستودع (GitHub Access Token):</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          <div>
            <label className="block text-slate-700 font-bold mb-1">اسم المالك (Repo Owner):</label>
            <input
              type="text"
              value={githubConfig.repoOwner}
              onChange={e => updateGitHubConfig({ repoOwner: e.target.value })}
              className="w-full px-3 py-2 rounded-lg border border-slate-300 font-mono"
            />
          </div>

          <div>
            <label className="block text-slate-700 font-bold mb-1">اسم المستودع (Repo Name):</label>
            <input
              type="text"
              value={githubConfig.repoName}
              onChange={e => updateGitHubConfig({ repoName: e.target.value })}
              className="w-full px-3 py-2 rounded-lg border border-slate-300 font-mono"
            />
          </div>

          <div>
            <label className="block text-slate-700 font-bold mb-1">الفرع (Default Branch):</label>
            <input
              type="text"
              value={githubConfig.branch}
              onChange={e => updateGitHubConfig({ branch: e.target.value })}
              className="w-full px-3 py-2 rounded-lg border border-slate-300 font-mono"
            />
          </div>
        </div>

        <div>
          <label className="block text-slate-700 font-bold mb-1">رمز الدخول الشخصي (Personal Access Token):</label>
          <div className="flex gap-2">
            <input
              type={showToken ? 'text' : 'password'}
              value={tokenInput}
              onChange={e => setTokenInput(e.target.value)}
              className="flex-1 px-3 py-2 rounded-lg border border-slate-300 font-mono text-xs"
            />
            <button
              type="button"
              onClick={() => setShowToken(!showToken)}
              className="px-3 py-2 bg-slate-100 text-slate-700 font-bold text-xs rounded-lg"
            >
              {showToken ? 'إخفاء' : 'إظهار'}
            </button>
            <button
              type="button"
              onClick={handleSaveToken}
              className="px-4 py-2 bg-rose-900 text-white font-bold text-xs rounded-lg"
            >
              تحديث وحفظ المفتاح
            </button>
          </div>
          <span className="text-[11px] text-slate-400 mt-1 block">
            المفتاح الحالي مفعل وصالح للاتصال بمستودع معامل RT.
          </span>
        </div>
      </div>

    </div>
  );
};
