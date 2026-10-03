import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Header } from './components/Header';
import { Navigation } from './components/Navigation';
import { DashboardModule } from './components/DashboardModule';
import { IncomeModule } from './components/IncomeModule';
import { LoyaltyModule } from './components/LoyaltyModule';
import { ExpenseAndProfitModule } from './components/ExpenseAndProfitModule';
import { InventoryModule } from './components/InventoryModule';
import { HRModule } from './components/HRModule';
import { LabToLabModule } from './components/LabToLabModule';
import { ReportsModule } from './components/ReportsModule';
import { DiagnosticSyncHub } from './components/DiagnosticSyncHub';
import { AuditLogModule } from './components/AuditLogModule';
import { SettingsBackupModule } from './components/SettingsBackupModule';
import { LabManagementModule } from './components/LabManagementModule';
import { BarcodeScannerModal } from './components/BarcodeScannerModal';
import { RoleLoginModal } from './components/RoleLoginModal';

const AppContent: React.FC = () => {
  const { activeTab, language } = useApp();

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col text-slate-900 font-sans selection:bg-rose-900 selection:text-white">
      {/* Top Header */}
      <Header />

      {/* Navigation Tabs */}
      <Navigation />

      {/* Main Module Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {activeTab === 'dashboard' && <DashboardModule />}
        {activeTab === 'lab_management' && <LabManagementModule />}
        {activeTab === 'income' && <IncomeModule />}
        {activeTab === 'loyalty' && <LoyaltyModule />}
        {activeTab === 'expenses' && <ExpenseAndProfitModule />}
        {activeTab === 'inventory' && <InventoryModule />}
        {activeTab === 'hr' && <HRModule />}
        {activeTab === 'lab_to_lab' && <LabToLabModule />}
        {activeTab === 'reports' && <ReportsModule />}
        {activeTab === 'sync' && <DiagnosticSyncHub />}
        {activeTab === 'audit' && <AuditLogModule />}
        {activeTab === 'settings' && <SettingsBackupModule />}
      </main>

      {/* Footer with RT Lab Identity */}
      <footer className="bg-white border-t border-slate-200 py-4 text-xs text-slate-500 print:hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-black text-rose-900">معامل RT للتحاليل التشخيصية</span>
            <span aria-hidden="true">·</span>
            <span className="font-bold text-slate-800">معامل رامي مختار</span>
            <span aria-hidden="true">·</span>
            <span className="font-semibold text-blue-900">أطباء كلية طب قصر العيني</span>
          </div>
          <div className="flex items-center gap-4 text-slate-400 font-mono text-[11px]">
            <span>ISO 15189 Certified</span>
            <span>·</span>
            <span>التشخيص الصحيح يبدأ معنا</span>
            <span>·</span>
            <span>RT ERP v2.5.0</span>
          </div>
        </div>
      </footer>

      {/* Global Interactive Modals */}
      <BarcodeScannerModal />
      <RoleLoginModal />
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
