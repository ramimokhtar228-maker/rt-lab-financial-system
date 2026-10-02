import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Header } from './components/Header';
import { Navigation } from './components/Navigation';
import { DashboardModule } from './components/DashboardModule';
import { IncomeModule } from './components/IncomeModule';
import { ExpenseAndProfitModule } from './components/ExpenseAndProfitModule';
import { InventoryModule } from './components/InventoryModule';
import { HRModule } from './components/HRModule';
import { LabToLabModule } from './components/LabToLabModule';
import { ReportsModule } from './components/ReportsModule';
import { DiagnosticSyncHub } from './components/DiagnosticSyncHub';
import { AuditLogModule } from './components/AuditLogModule';
import { SettingsBackupModule } from './components/SettingsBackupModule';
import { BarcodeScannerModal } from './components/BarcodeScannerModal';
import { RoleLoginModal } from './components/RoleLoginModal';

const AppContent: React.FC = () => {
  const { activeTab, language } = useApp();

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col text-slate-900 font-sans selection:bg-teal-700 selection:text-white">
      {/* Top Header */}
      <Header />

      {/* Navigation Tabs */}
      <Navigation />

      {/* Main Module Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {activeTab === 'dashboard' && <DashboardModule />}
        {activeTab === 'income' && <IncomeModule />}
        {activeTab === 'expenses' && <ExpenseAndProfitModule />}
        {activeTab === 'inventory' && <InventoryModule />}
        {activeTab === 'hr' && <HRModule />}
        {activeTab === 'lab_to_lab' && <LabToLabModule />}
        {activeTab === 'reports' && <ReportsModule />}
        {activeTab === 'sync' && <DiagnosticSyncHub />}
        {activeTab === 'audit' && <AuditLogModule />}
        {activeTab === 'settings' && <SettingsBackupModule />}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-4 text-xs text-slate-500 print:hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-800">معامل RT للتشخيص والتحاليل الطبية</span>
            <span aria-hidden="true">·</span>
            <span>نظام الإدارة المالية الشامل والحسابات ERP</span>
          </div>
          <div className="flex items-center gap-4 text-slate-400 font-mono text-[11px]">
            <span>ISO 15189 Compliant</span>
            <span>·</span>
            <span>RT Diagnostic Hub Sync v2.4</span>
            <span>·</span>
            <span>كلية طب قصر العيني</span>
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
