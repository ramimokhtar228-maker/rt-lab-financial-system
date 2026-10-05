import React, { useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Header } from './components/Header';
import { Navigation } from './components/Navigation';
import { DashboardModule } from './components/DashboardModule';
import { AdmissionModule } from './components/AdmissionModule';
import { WorklistModule } from './components/WorklistModule';
import { InstrumentsModule } from './components/InstrumentsModule';
import { ReportEditor } from './components/ReportEditor';
import { ReportViewerPrint } from './components/ReportViewerPrint';
import { ArchiveTable } from './components/ArchiveTable';
import { IncomeModule } from './components/IncomeModule';
import { ExpenseAndProfitModule } from './components/ExpenseAndProfitModule';
import { LoyaltyModule } from './components/LoyaltyModule';
import { LabToLabModule } from './components/LabToLabModule';
import { InventoryModule } from './components/InventoryModule';
import { HRModule } from './components/HRModule';
import { CatalogBrowser } from './components/CatalogBrowser';
import { SettingsBackupModule } from './components/SettingsBackupModule';
import { BarcodeScannerModal } from './components/BarcodeScannerModal';
import { RoleLoginModal } from './components/RoleLoginModal';
import { SmartReportModal } from './components/SmartReportModal';
import { DiseaseIllustrationsModal } from './components/DiseaseIllustrationsModal';
import { LabInfoEditModal } from './components/LabInfoEditModal';
import { PatientInvoiceModal } from './components/PatientInvoiceModal';
import { TestCatalogModal } from './components/TestCatalogModal';
import { ManualTestModal } from './components/ManualTestModal';
import {
  LabReport,
  ReportStatus,
  TestProfile,
  CatalogProfileTemplate,
  IndividualTest,
  LabStaffSignatures,
  TestParameter
} from './types';
import { LAB_CATALOG, INITIAL_INDIVIDUAL_TESTS, DEFAULT_STAFF } from './data/labCatalog';
import { exportReportToPPTX } from './utils/pptxExport';
import { formatWhatsAppMessage, openWhatsApp } from './utils/whatsapp';
import { X, FlaskConical, PlusCircle } from 'lucide-react';

const AppContent: React.FC = () => {
  const {
    activeTab,
    setActiveTab,
    reports,
    selectedReport,
    selectedReportId,
    setSelectedReportId,
    updateReport,
    deleteReport,
    addReport,
    exportBackup,
    importBackup,
    isPatientFormOpen,
    setIsPatientFormOpen,
    labInfo,
    updateLabInfo
  } = useApp();

  const [archiveSearch, setArchiveSearch] = useState('');
  const [smartReportModalOpen, setSmartReportModalOpen] = useState(false);
  const [activeSmartReport, setActiveSmartReport] = useState<LabReport | null>(null);
  const [illustrationsModalOpen, setIllustrationsModalOpen] = useState(false);
  const [activeProfileIdForIllustration, setActiveProfileIdForIllustration] = useState<string | null>(null);
  const [labInfoModalOpen, setLabInfoModalOpen] = useState(false);
  const [patientInvoiceModalReport, setPatientInvoiceModalReport] = useState<LabReport | null>(null);
  const [catalogModalOpen, setCatalogModalOpen] = useState(false);
  const [manualTestModalOpen, setManualTestModalOpen] = useState(false);
  const [isPrintPreviewActive, setIsPrintPreviewActive] = useState(false);

  // Catalog & Staff Signatures state
  const [catalog, setCatalog] = useState<CatalogProfileTemplate[]>(LAB_CATALOG);
  const [individualTests, setIndividualTests] = useState<IndividualTest[]>(INITIAL_INDIVIDUAL_TESTS);
  const [staffSignatures, setStaffSignatures] = useState<LabStaffSignatures>(DEFAULT_STAFF);

  // Handlers for ReportEditor & Archive
  const handleSelectReport = (report: LabReport) => {
    setSelectedReportId(report.id);
    setIsPrintPreviewActive(false);
    setActiveTab('diagnostic_editor');
  };

  const handlePrintReport = (report: LabReport) => {
    setSelectedReportId(report.id);
    setIsPrintPreviewActive(true);
  };

  const handleDuplicateReport = (report: LabReport) => {
    const nextLabNum = `RT-2026-${String(reports.length + 1).padStart(3, '0')}`;
    const duplicated: LabReport = {
      ...report,
      id: `rep-${Date.now()}`,
      reportNumber: nextLabNum,
      patient: {
        ...report.patient,
        id: `pat-${Date.now()}`,
        labNumber: nextLabNum,
        barcode: `RT-${10030 + reports.length + 1}`
      },
      status: 'draft',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    addReport(duplicated);
  };

  const handleBackupDatabase = async () => {
    await exportBackup();
  };

  const handleRestoreDatabase = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async (event) => {
      const content = event.target?.result as string;
      if (content) {
        await importBackup(content);
      }
    };
    reader.readAsText(file);
  };

  const handleBulkDelete = (reportIds: string[]) => {
    reportIds.forEach(id => deleteReport(id));
  };

  const handleBulkUpdateStatus = (reportIds: string[], status: ReportStatus) => {
    reportIds.forEach(id => updateReport(id, { status }));
  };

  // Open illustrations modal for profile
  const handleOpenIllustrations = (profileId: string) => {
    setActiveProfileIdForIllustration(profileId);
    setIllustrationsModalOpen(true);
  };

  const handleAttachIllustration = (illustration: any) => {
    if (!selectedReport || !activeProfileIdForIllustration) return;
    const updatedProfiles = selectedReport.profiles.map(prof => {
      if (prof.id === activeProfileIdForIllustration) {
        return { ...prof, attachedIllustration: illustration };
      }
      return prof;
    });
    updateReport(selectedReport.id, { profiles: updatedProfiles });
    setIllustrationsModalOpen(false);
  };

  // Current active report fallback
  const currentReport = selectedReport || reports[0];

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col text-slate-900 font-sans selection:bg-rose-900 selection:text-white">
      {/* Top Header */}
      <Header />

      {/* Main Navigation Tabs */}
      <Navigation />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Full-page Print Preview if active */}
        {isPrintPreviewActive && currentReport ? (
          <div className="space-y-4">
            <ReportViewerPrint
              report={currentReport}
              onBackToEdit={() => setIsPrintPreviewActive(false)}
              onOpenInvoice={() => setPatientInvoiceModalReport(currentReport)}
              onOpenLabInfoModal={() => setLabInfoModalOpen(true)}
              onOpenIllustrationsModal={(pId) => handleOpenIllustrations(pId)}
              onOpenSmartReport={() => {
                setActiveSmartReport(currentReport);
                setSmartReportModalOpen(true);
              }}
            />
          </div>
        ) : (
          <>
            {activeTab === 'dashboard' && <DashboardModule />}
            {activeTab === 'admission' && <AdmissionModule />}
            {activeTab === 'worklist' && <WorklistModule />}
            {activeTab === 'instruments' && <InstrumentsModule />}

            {/* Diagnostic Report Editor */}
            {activeTab === 'diagnostic_editor' && (
              currentReport ? (
                <div className="space-y-4">
                  <ReportEditor
                    report={currentReport}
                    onUpdateReport={(updated) => updateReport(updated.id, updated)}
                    onSaveToArchive={() => setActiveTab('reports_archive')}
                    onPrintPreview={() => setIsPrintPreviewActive(true)}
                    onSendWhatsApp={() => {
                      const msg = formatWhatsAppMessage(currentReport);
                      openWhatsApp(currentReport.patient.phone, msg);
                    }}
                    onExportPPTX={() => exportReportToPPTX(currentReport)}
                    onOpenCatalog={() => setCatalogModalOpen(true)}
                    onOpenManualTest={() => setManualTestModalOpen(true)}
                    onOpenInvoice={() => setPatientInvoiceModalReport(currentReport)}
                    onOpenIllustrationsModal={(pId) => handleOpenIllustrations(pId)}
                    onOpenSmartReport={() => {
                      setActiveSmartReport(currentReport);
                      setSmartReportModalOpen(true);
                    }}
                  />
                </div>
              ) : (
                <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 space-y-4 max-w-md mx-auto my-12">
                  <FlaskConical className="w-12 h-12 text-slate-400 mx-auto" />
                  <h3 className="font-bold text-slate-800 text-lg">لم يتم تحديد تقرير حالي</h3>
                  <p className="text-xs text-slate-500">اختر عينة من قائمة عمل المعمل أو سجل مريضاً جديداً للبدء في إدخال النتائج.</p>
                  <button
                    onClick={() => setIsPatientFormOpen(true)}
                    className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-rose-900 text-white font-bold text-xs"
                  >
                    <PlusCircle className="w-4 h-4" />
                    <span>تسجيل مريض وحجز تحاليل</span>
                  </button>
                </div>
              )
            )}

            {/* Archive & Reports Table */}
            {activeTab === 'reports_archive' && (
              <ArchiveTable
                reports={reports}
                searchTerm={archiveSearch}
                setSearchTerm={setArchiveSearch}
                onSelectReport={handleSelectReport}
                onPrintReport={handlePrintReport}
                onDeleteReport={(id) => deleteReport(id)}
                onDuplicateReport={handleDuplicateReport}
                onBackupDatabase={handleBackupDatabase}
                onRestoreDatabase={handleRestoreDatabase}
                onNewPatientClick={() => setIsPatientFormOpen(true)}
                onOpenInvoice={(rep) => setPatientInvoiceModalReport(rep)}
                onOpenSmartReport={(rep) => {
                  setActiveSmartReport(rep);
                  setSmartReportModalOpen(true);
                }}
                onBulkDeleteReports={handleBulkDelete}
                onBulkUpdateStatus={handleBulkUpdateStatus}
              />
            )}

            {/* Financial Modules */}
            {activeTab === 'financial_income' && <IncomeModule />}
            {activeTab === 'expenses_profit' && <ExpenseAndProfitModule />}
            {activeTab === 'loyalty' && <LoyaltyModule />}
            {activeTab === 'lab_to_lab' && <LabToLabModule />}

            {/* Admin Modules */}
            {activeTab === 'inventory' && <InventoryModule />}
            {activeTab === 'hr' && <HRModule />}
            {activeTab === 'catalog' && (
              <CatalogBrowser
                catalog={catalog}
                onUpdateCatalog={setCatalog}
                onResetCatalog={() => setCatalog(LAB_CATALOG)}
                onSelectProfileForNewCase={(template: CatalogProfileTemplate) => {
                  if (currentReport) {
                    const newProfile: TestProfile = {
                      id: `prof-${Date.now()}`,
                      profileCode: template.code,
                      titleEn: template.titleEn,
                      titleAr: template.titleAr,
                      category: template.category,
                      sampleType: template.sampleType,
                      interpretation: template.defaultInterpretation || '',
                      parameters: template.parameters.map((p, idx) => ({
                        ...p,
                        id: `p-${Date.now()}-${idx}`,
                        result: '',
                        flag: 'NORMAL'
                      }))
                    };
                    updateReport(currentReport.id, {
                      profiles: [...currentReport.profiles, newProfile]
                    });
                    setActiveTab('diagnostic_editor');
                  }
                }}
                individualTests={individualTests}
                onUpdateIndividualTests={setIndividualTests}
              />
            )}
            {activeTab === 'audit_settings' && <SettingsBackupModule />}
          </>
        )}
      </main>

      {/* Global Modals */}

      {/* 1. New Patient Admission Modal */}
      {isPatientFormOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 max-w-4xl w-full max-h-[92vh] overflow-y-auto p-6 relative">
            <button
              onClick={() => setIsPatientFormOpen(false)}
              className="absolute left-6 top-6 p-2 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
            <AdmissionModule isModal onSuccess={() => setIsPatientFormOpen(false)} />
          </div>
        </div>
      )}

      {/* 2. Barcode Scanner Modal */}
      <BarcodeScannerModal />

      {/* 3. Role-Based Login Modal */}
      <RoleLoginModal />

      {/* 4. Smart Report Modal */}
      {smartReportModalOpen && activeSmartReport && (
        <SmartReportModal
          isOpen={smartReportModalOpen}
          onClose={() => setSmartReportModalOpen(false)}
          report={activeSmartReport}
          onAttachToReport={(insights: string) => {
            if (activeSmartReport) {
              updateReport(activeSmartReport.id, {
                generalComment: `${activeSmartReport.generalComment || ''}\n${insights}`.trim()
              });
            }
            setSmartReportModalOpen(false);
          }}
        />
      )}

      {/* 5. Disease Illustrations Modal */}
      {illustrationsModalOpen && (
        <DiseaseIllustrationsModal
          isOpen={illustrationsModalOpen}
          onClose={() => setIllustrationsModalOpen(false)}
          onSelectIllustration={handleAttachIllustration}
        />
      )}

      {/* 6. Lab Info & Branches Edit Modal */}
      {labInfoModalOpen && (
        <LabInfoEditModal
          isOpen={labInfoModalOpen}
          onClose={() => setLabInfoModalOpen(false)}
          labInfo={labInfo}
          onUpdateLabInfo={updateLabInfo}
          staffSignatures={staffSignatures}
          onUpdateStaffSignatures={setStaffSignatures}
        />
      )}

      {/* 7. Patient Invoice Modal */}
      {patientInvoiceModalReport && (
        <PatientInvoiceModal
          isOpen={!!patientInvoiceModalReport}
          onClose={() => setPatientInvoiceModalReport(null)}
          report={patientInvoiceModalReport}
          onUpdateReport={(updatedReport: LabReport) => {
            updateReport(updatedReport.id, updatedReport);
          }}
        />
      )}

      {/* 8. Test Catalog Modal */}
      {catalogModalOpen && (
        <TestCatalogModal
          isOpen={catalogModalOpen}
          onClose={() => setCatalogModalOpen(false)}
          existingProfileCodes={currentReport ? currentReport.profiles.map(p => p.profileCode) : []}
          onAddProfile={(newProf: TestProfile) => {
            if (currentReport) {
              updateReport(currentReport.id, {
                profiles: [...currentReport.profiles, newProf]
              });
            }
            setCatalogModalOpen(false);
          }}
        />
      )}

      {/* 9. Manual Test / Custom Profile Modal */}
      {manualTestModalOpen && currentReport && (
        <ManualTestModal
          isOpen={manualTestModalOpen}
          onClose={() => setManualTestModalOpen(false)}
          profiles={currentReport ? currentReport.profiles : []}
          onAddManualTest={(
            targetProfileId: string | 'new',
            testParam: TestParameter,
            newProfileInfo?: { titleEn: string; titleAr: string; category: string }
          ) => {
            if (!currentReport) return;
            if (targetProfileId === 'new' && newProfileInfo) {
              const newProf: TestProfile = {
                id: `prof-${Date.now()}`,
                profileCode: newProfileInfo.titleEn.substring(0, 5).toUpperCase(),
                titleEn: newProfileInfo.titleEn,
                titleAr: newProfileInfo.titleAr,
                category: newProfileInfo.category,
                sampleType: 'Serum',
                parameters: [testParam]
              };
              updateReport(currentReport.id, { profiles: [...currentReport.profiles, newProf] });
            } else {
              const updatedProfiles = currentReport.profiles.map(prof => {
                if (prof.id === targetProfileId) {
                  return { ...prof, parameters: [...prof.parameters, testParam] };
                }
                return prof;
              });
              updateReport(currentReport.id, { profiles: updatedProfiles });
            }
            setManualTestModalOpen(false);
          }}
        />
      )}

      {/* Footer with RT Lab Identity */}
      <footer className="bg-white border-t border-slate-200 py-4 text-xs text-slate-500 print:hidden mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-black text-rose-900">منظومة معامل RT الطبية والمالية الموحدة</span>
            <span aria-hidden="true">·</span>
            <span className="font-bold text-slate-800">معامل رامي مختار</span>
            <span aria-hidden="true">·</span>
            <span className="font-semibold text-blue-900">أطباء كلية طب قصر العيني</span>
          </div>
          <div className="flex items-center gap-4 text-slate-400 font-mono text-[11px]">
            <span>ISO 15189 Certified</span>
            <span>·</span>
            <span>LIS Hardware Connected</span>
            <span>·</span>
            <span>التشخيص الصحيح يبدأ معنا</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}
