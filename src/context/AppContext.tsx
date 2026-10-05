import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import {
  Language,
  UserProfile,
  IncomeRecord,
  ExpenseRecord,
  InventoryItem,
  Employee,
  AttendanceRecord,
  PayrollRecord,
  LabToLabOrder,
  ProfitShareConfig,
  GitHubSyncConfig,
  AuditLog,
  AppNotification,
  DailyCloseout,
  InvoiceTestItem,
  LoyaltyConfig,
  PatientLoyaltyProfile,
  LoyaltyTier,
  LabInfo,
  LabFacility,
  StaffMember,
  LabReport,
  Patient,
  TestProfile,
  TestParameter,
  LabInstrument,
  InstrumentTransmission,
  UserRole
} from '../types';
import {
  INITIAL_USERS,
  INITIAL_PROFIT_CONFIG,
  INITIAL_GITHUB_CONFIG,
  DEFAULT_LOYALTY_CONFIG,
  INITIAL_INVENTORY,
  INITIAL_EMPLOYEES,
  INITIAL_ATTENDANCE,
  INITIAL_PAYROLL,
  INITIAL_LAB_TO_LAB,
  INITIAL_LAB_INFO,
  INITIAL_FACILITIES,
  INITIAL_STAFF_MEMBERS,
  TEST_CATALOG as DEFAULT_TEST_CATALOG
} from '../data/catalog';
import {
  INITIAL_REPORTS,
  INITIAL_INCOME_RECORDS,
  INITIAL_LOYALTY_DATA
} from '../data/initialData';
import { LAB_CATALOG } from '../data/labCatalog';
import { INITIAL_INSTRUMENTS, SAMPLE_INSTRUMENT_TRANSMISSIONS } from '../data/instrumentsData';

// Storage Keys
const STORAGE_PREFIX = 'rt_lab_unified_';
const REPORTS_KEY = `${STORAGE_PREFIX}reports_v3`;
const INCOME_KEY = `${STORAGE_PREFIX}income_v3`;
const EXPENSES_KEY = `${STORAGE_PREFIX}expenses_v3`;
const LOYALTY_KEY = `${STORAGE_PREFIX}loyalty_v3`;
const INVENTORY_KEY = `${STORAGE_PREFIX}inventory_v3`;
const EMPLOYEES_KEY = `${STORAGE_PREFIX}employees_v3`;
const LAB_TO_LAB_KEY = `${STORAGE_PREFIX}lab_to_lab_v3`;
const CLOSEOUTS_KEY = `${STORAGE_PREFIX}closeouts_v3`;
const AUDIT_KEY = `${STORAGE_PREFIX}audit_v3`;
const INSTRUMENTS_KEY = `${STORAGE_PREFIX}instruments_v3`;
const TRANSMISSIONS_KEY = `${STORAGE_PREFIX}transmissions_v3`;
const LAB_INFO_KEY = `${STORAGE_PREFIX}lab_info_v3`;
const CATALOG_KEY = `${STORAGE_PREFIX}test_catalog_v3`;

interface AppContextType {
  // Localization & Auth
  language: Language;
  setLanguage: (lang: Language) => void;
  currentUser: UserProfile;
  users: UserProfile[];
  loginModalOpen: boolean;
  setLoginModalOpen: (open: boolean) => void;
  loginUser: (username: string, pin: string) => boolean;
  logout: () => void;
  hasPermission: (module: string) => boolean;

  // Active Navigation Tab
  activeTab: string;
  setActiveTab: (tab: string) => void;

  // Reports & Laboratory Diagnostic Worklist
  reports: LabReport[];
  selectedReportId: string | null;
  setSelectedReportId: (id: string | null) => void;
  selectedReport: LabReport | null;
  addReport: (report: LabReport) => void;
  updateReport: (id: string, updates: Partial<LabReport>) => void;
  deleteReport: (id: string) => void;
  verifyReport: (id: string) => void;
  createReportFromAdmission: (patient: Patient, selectedTests: InvoiceTestItem[], packageApplied?: any) => LabReport;

  // Financial & Treasury (Income & Invoicing)
  incomeRecords: IncomeRecord[];
  addIncomeRecord: (record: Omit<IncomeRecord, 'id' | 'createdAt' | 'updatedAt'>) => IncomeRecord;
  updateIncomeRecord: (id: string, updates: Partial<IncomeRecord>) => void;
  deleteIncomeRecord: (id: string) => void;
  selectedInvoice: IncomeRecord | null;
  setSelectedInvoice: (invoice: IncomeRecord | null) => void;
  financialMetrics: {
    totalGrossIncome: number;
    totalPaidIncome: number;
    totalDeferredIncome: number;
    totalExpenses: number;
    netProfit: number;
    ceoShare: number;
    labShare: number;
    emergencyFund: number;
    emergencyShare: number;
  };
  scannedBarcode: string | null;
  setScannedBarcode: (b: string | null) => void;
  setScannerOpen: (open: boolean) => void;

  // Test Catalog
  testCatalog: InvoiceTestItem[];
  addCatalogTest: (test: InvoiceTestItem) => void;
  updateCatalogTest: (code: string, updates: Partial<InvoiceTestItem>) => void;
  deleteCatalogTest: (code: string) => void;
  resetCatalog: () => void;

  // Laboratory Instruments & Hardware Interfacing
  instruments: LabInstrument[];
  transmissions: InstrumentTransmission[];
  toggleInstrumentStatus: (id: string) => void;
  simulateInstrumentRun: (instrumentId: string, barcode: string, patientName?: string, labNumber?: string) => InstrumentTransmission;
  applyTransmissionToReport: (transmissionId: string, reportId: string) => boolean;

  // Loyalty Program & Cards
  loyaltyProfiles: PatientLoyaltyProfile[];
  loyaltyConfig: LoyaltyConfig;
  updateLoyaltyConfig: (config: LoyaltyConfig) => void;
  addLoyaltyProfile: (profile: PatientLoyaltyProfile) => void;
  getLoyaltyByPhone: (phone: string) => PatientLoyaltyProfile | undefined;
  calculateLoyaltyTier: (points: number) => LoyaltyTier;
  earnLoyaltyPoints: (patientPhone: string, amount: number, invoiceNumber: string, patientName: string, barcode: string) => void;
  redeemLoyaltyPoints: (patientPhone: string, points: number, invoiceNumber?: string, discountEGP?: number) => { success: boolean; cashValue: number };
  updateLoyaltyProfile: (id: string, updates: Partial<PatientLoyaltyProfile>) => void;
  deleteLoyaltyProfile: (id: string) => void;
  deleteLoyaltyTransaction: (profileId: string, txId: string) => void;
  retroactiveSyncAllInvoicesToLoyalty: () => { syncedCount: number; newProfilesCount: number };
  addLoyaltyPoints: (patientPhone: string, points: number, reason: string, invoiceNumber?: string, amountEGP?: number) => void;
  calculateCashForPoints: (points: number) => number;
  calculatePointsForAmount: (amount: number) => number;

  // Expenses & Profit Sharing & Daily Closeout
  expenses: ExpenseRecord[];
  addExpense: (expense: Omit<ExpenseRecord, 'id' | 'createdAt'>) => void;
  updateExpense: (id: string, updates: Partial<ExpenseRecord>) => void;
  deleteExpense: (id: string) => void;
  profitConfig: ProfitShareConfig;
  updateProfitConfig: (config: ProfitShareConfig) => void;
  dailyCloseouts: DailyCloseout[];
  closeoutDay: (actualCash: number, discrepancyNotes?: string) => DailyCloseout;

  // Inventory & Reagents
  inventory: InventoryItem[];
  addInventoryItem: (item: Omit<InventoryItem, 'id' | 'lastRestockedDate'>) => void;
  updateInventoryItem: (id: string, updates: Partial<InventoryItem>) => void;
  restockItem: (id: string, addedQty: number, newCost?: number) => void;
  consumeReagent: (id: string, qty: number) => void;
  deleteInventoryItem: (id: string) => void;

  // Lab to Lab (Outsourced)
  labToLabOrders: LabToLabOrder[];
  addLabToLabOrder: (order: Omit<LabToLabOrder, 'id'>) => void;
  updateLabToLabOrder: (id: string, updates: Partial<LabToLabOrder>) => void;
  deleteLabToLabOrder: (id: string) => void;

  // HR & Staff
  employees: Employee[];
  attendance: AttendanceRecord[];
  payroll: PayrollRecord[];
  addEmployee: (emp: Omit<Employee, 'id'>) => void;
  updateEmployee: (id: string, updates: Partial<Employee>) => void;
  deleteEmployee: (id: string) => void;
  recordAttendance: (employeeId: string, status: AttendanceRecord['status'], checkIn?: string, checkOut?: string, notes?: string) => void;
  generatePayrollForMonth: (monthYear: string) => void;
  updatePayrollRecord: (id: string, updates: Partial<PayrollRecord>) => void;
  clockInEmployee: (empId: string) => void;
  clockOutEmployee: (empId: string) => void;

  // Lab Facilities & Staff Signatures
  labInfo: LabInfo;
  updateLabInfo: (info: LabInfo) => void;
  facilities: LabFacility[];
  staffMembers: StaffMember[];

  // Security & Audit
  auditLogs: AuditLog[];
  logAction: (action: AuditLog['action'], module: AuditLog['module'], description: string) => void;

  // Notifications
  notifications: AppNotification[];
  markNotificationRead: (id: string) => void;
  clearNotifications: () => void;
  addNotification: (notif: Omit<AppNotification, 'id' | 'timestamp' | 'read'>) => void;

  // GitHub Cloud Sync
  githubConfig: GitHubSyncConfig;
  updateGithubConfig: (config: Partial<GitHubSyncConfig>) => void;
  syncUnifiedDataToGitHub: () => Promise<{ success: boolean; message: string }>;

  // Backups
  exportBackup: (password?: string) => Promise<string>;
  importBackup: (backupJson: string, password?: string) => Promise<{ success: boolean; message: string }>;
  resetToDefaultData: () => void;
  clearPatientRecordsOnly: () => void;

  // Quick Action Modal Controls
  isPatientFormOpen: boolean;
  setIsPatientFormOpen: (open: boolean) => void;
  isBarcodeScannerOpen: boolean;
  setIsBarcodeScannerOpen: (open: boolean) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // 1. Language & Current User
  const [language, setLanguage] = useState<Language>('ar');
  const [users] = useState<UserProfile[]>(INITIAL_USERS);
  const [currentUser, setCurrentUser] = useState<UserProfile>(INITIAL_USERS[0]);
  const [loginModalOpen, setLoginModalOpen] = useState(false);

  // 2. Active Tab
  const [activeTab, setActiveTab] = useState<string>('dashboard');

  // 3. Quick Action Modals
  const [isPatientFormOpen, setIsPatientFormOpen] = useState(false);
  const [isBarcodeScannerOpen, setIsBarcodeScannerOpen] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<IncomeRecord | null>(null);

  // 4. Reports (Unified Diagnostic Worklist)
  const [reports, setReports] = useState<LabReport[]>(() => {
    try {
      const saved = localStorage.getItem(REPORTS_KEY) || localStorage.getItem('rt_lab_reports_v2');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
      return INITIAL_REPORTS;
    } catch {
      return INITIAL_REPORTS;
    }
  });

  const [selectedReportId, setSelectedReportId] = useState<string | null>(() => {
    return reports[0]?.id || null;
  });

  // 5. Income & Invoices (Financial Records)
  const [incomeRecords, setIncomeRecords] = useState<IncomeRecord[]>(() => {
    try {
      const saved = localStorage.getItem(INCOME_KEY) || localStorage.getItem('rt_lab_income_records_v1');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
      return INITIAL_INCOME_RECORDS;
    } catch {
      return INITIAL_INCOME_RECORDS;
    }
  });

  // 6. Test Catalog
  const [testCatalog, setTestCatalog] = useState<InvoiceTestItem[]>(() => {
    try {
      const saved = localStorage.getItem(CATALOG_KEY);
      return saved ? JSON.parse(saved) : DEFAULT_TEST_CATALOG;
    } catch {
      return DEFAULT_TEST_CATALOG;
    }
  });

  // 7. Loyalty Profiles
  const [loyaltyProfiles, setLoyaltyProfiles] = useState<PatientLoyaltyProfile[]>(() => {
    try {
      const saved = localStorage.getItem(LOYALTY_KEY) || localStorage.getItem('rt_lab_loyalty_profiles_v2');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
      return INITIAL_LOYALTY_DATA;
    } catch {
      return INITIAL_LOYALTY_DATA;
    }
  });

  const [loyaltyConfig] = useState<LoyaltyConfig>(DEFAULT_LOYALTY_CONFIG);

  // 8. Expenses & Profit Config & Closeouts
  const [expenses, setExpenses] = useState<ExpenseRecord[]>(() => {
    try {
      const saved = localStorage.getItem(EXPENSES_KEY) || localStorage.getItem('rt_lab_expense_records_v1');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [profitConfig, setProfitConfig] = useState<ProfitShareConfig>(INITIAL_PROFIT_CONFIG);
  const [dailyCloseouts, setDailyCloseouts] = useState<DailyCloseout[]>(() => {
    try {
      const saved = localStorage.getItem(CLOSEOUTS_KEY) || localStorage.getItem('rt_lab_daily_closeouts_v1');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // 9. Inventory & Reagents
  const [inventory, setInventory] = useState<InventoryItem[]>(() => {
    try {
      const saved = localStorage.getItem(INVENTORY_KEY) || localStorage.getItem('rt_lab_inventory_items_v1');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
      return INITIAL_INVENTORY;
    } catch {
      return INITIAL_INVENTORY;
    }
  });

  // 10. Lab Instruments & Interfacing
  const [instruments, setInstruments] = useState<LabInstrument[]>(() => {
    try {
      const saved = localStorage.getItem(INSTRUMENTS_KEY);
      return saved ? JSON.parse(saved) : INITIAL_INSTRUMENTS;
    } catch {
      return INITIAL_INSTRUMENTS;
    }
  });

  const [transmissions, setTransmissions] = useState<InstrumentTransmission[]>(() => {
    try {
      const saved = localStorage.getItem(TRANSMISSIONS_KEY);
      return saved ? JSON.parse(saved) : SAMPLE_INSTRUMENT_TRANSMISSIONS;
    } catch {
      return SAMPLE_INSTRUMENT_TRANSMISSIONS;
    }
  });

  // 11. Lab to Lab
  const [labToLabOrders, setLabToLabOrders] = useState<LabToLabOrder[]>(() => {
    try {
      const saved = localStorage.getItem(LAB_TO_LAB_KEY) || localStorage.getItem('rt_lab_lab_to_lab_orders_v1');
      return saved ? JSON.parse(saved) : INITIAL_LAB_TO_LAB;
    } catch {
      return INITIAL_LAB_TO_LAB;
    }
  });

  // 12. HR Employees, Attendance, Payroll
  const [employees, setEmployees] = useState<Employee[]>(() => {
    try {
      const saved = localStorage.getItem(EMPLOYEES_KEY) || localStorage.getItem('rt_lab_employees_v1');
      return saved ? JSON.parse(saved) : INITIAL_EMPLOYEES;
    } catch {
      return INITIAL_EMPLOYEES;
    }
  });
  const [attendance, setAttendance] = useState<AttendanceRecord[]>(INITIAL_ATTENDANCE);
  const [payroll, setPayroll] = useState<PayrollRecord[]>(INITIAL_PAYROLL);

  // 13. Lab Info & Branches
  const [labInfo, setLabInfo] = useState<LabInfo>(() => {
    try {
      const saved = localStorage.getItem(LAB_INFO_KEY) || localStorage.getItem('rt_lab_custom_lab_info_v2');
      return saved ? JSON.parse(saved) : INITIAL_LAB_INFO;
    } catch {
      return INITIAL_LAB_INFO;
    }
  });
  const [facilities] = useState<LabFacility[]>(INITIAL_FACILITIES);
  const [staffMembers] = useState<StaffMember[]>(INITIAL_STAFF_MEMBERS);

  // 14. Audit Log
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(() => {
    try {
      const saved = localStorage.getItem(AUDIT_KEY) || localStorage.getItem('rt_lab_audit_logs_v1');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // 15. Notifications
  const [notifications, setNotifications] = useState<AppNotification[]>([
    {
      id: "notif-welcome",
      title: "تم توحيد منظومة RT الطبية والمالية بنجاح",
      message: "تم دمج النظام المالي، تقارير التشخيص الطبي، والربط مع الأجهزة في منصة واحدة موحدة ومتزامنة كلياً.",
      type: "success",
      timestamp: "الآن",
      read: false
    }
  ]);

  // 16. GitHub Sync Config
  const [githubConfig, setGithubConfig] = useState<GitHubSyncConfig>(INITIAL_GITHUB_CONFIG);

  // Persistence Effects
  useEffect(() => { try { localStorage.setItem(REPORTS_KEY, JSON.stringify(reports)); } catch (e) { console.error(e); } }, [reports]);
  useEffect(() => { try { localStorage.setItem(INCOME_KEY, JSON.stringify(incomeRecords)); } catch (e) { console.error(e); } }, [incomeRecords]);
  useEffect(() => { try { localStorage.setItem(LOYALTY_KEY, JSON.stringify(loyaltyProfiles)); } catch (e) { console.error(e); } }, [loyaltyProfiles]);
  useEffect(() => { try { localStorage.setItem(EXPENSES_KEY, JSON.stringify(expenses)); } catch (e) { console.error(e); } }, [expenses]);
  useEffect(() => { try { localStorage.setItem(INVENTORY_KEY, JSON.stringify(inventory)); } catch (e) { console.error(e); } }, [inventory]);
  useEffect(() => { try { localStorage.setItem(INSTRUMENTS_KEY, JSON.stringify(instruments)); } catch (e) { console.error(e); } }, [instruments]);
  useEffect(() => { try { localStorage.setItem(TRANSMISSIONS_KEY, JSON.stringify(transmissions)); } catch (e) { console.error(e); } }, [transmissions]);
  useEffect(() => { try { localStorage.setItem(AUDIT_KEY, JSON.stringify(auditLogs)); } catch (e) { console.error(e); } }, [auditLogs]);
  useEffect(() => { try { localStorage.setItem(LAB_INFO_KEY, JSON.stringify(labInfo)); } catch (e) { console.error(e); } }, [labInfo]);
  useEffect(() => { try { localStorage.setItem(CATALOG_KEY, JSON.stringify(testCatalog)); } catch (e) { console.error(e); } }, [testCatalog]);

  // Audit Logging helper
  const logAction = useCallback((action: AuditLog['action'], module: AuditLog['module'], description: string) => {
    const newLog: AuditLog = {
      id: `log-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      timestamp: new Date().toLocaleString('ar-EG'),
      userId: currentUser.id,
      userName: currentUser.nameAr,
      userRole: currentUser.role,
      action,
      module,
      description
    };
    setAuditLogs(prev => [newLog, ...prev.slice(0, 499)]);
  }, [currentUser]);

  // Notifications helper
  const addNotification = useCallback((notif: Omit<AppNotification, 'id' | 'timestamp' | 'read'>) => {
    const newNotif: AppNotification = {
      ...notif,
      id: `notif-${Date.now()}`,
      timestamp: new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' }),
      read: false
    };
    setNotifications(prev => [newNotif, ...prev]);
  }, []);

  const markNotificationRead = useCallback((id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  }, []);

  const clearNotifications = useCallback(() => {
    setNotifications([]);
  }, []);

  // Auth & Permissions
  const loginUser = useCallback((username: string, pin: string): boolean => {
    const user = users.find(u => u.username.toLowerCase() === username.toLowerCase() && u.pin === pin);
    if (user) {
      setCurrentUser(user);
      logAction('LOGIN', 'SECURITY', `تسجيل دخول ناجح للمستخدم ${user.nameAr} (${user.role})`);
      addNotification({
        title: `مرحباً ${user.nameAr}`,
        message: `تم تسجيل الدخول بنجاح بصلاحية: ${user.titleAr}`,
        type: 'info'
      });
      return true;
    }
    return false;
  }, [users, logAction, addNotification]);

  const logout = useCallback(() => {
    logAction('LOGIN', 'SECURITY', `تسجيل خروج للمستخدم ${currentUser.nameAr}`);
    setCurrentUser(INITIAL_USERS[0]);
  }, [currentUser, logAction]);

  const hasPermission = useCallback((module: string): boolean => {
    if (currentUser.role === 'admin_ceo') return true;
    if (currentUser.role === 'accountant') {
      return ['dashboard', 'admission', 'financial_income', 'expenses_profit', 'loyalty', 'reports_archive', 'audit_settings'].includes(module);
    }
    if (currentUser.role === 'chemist') {
      return ['dashboard', 'worklist', 'diagnostic_editor', 'reports_archive', 'instruments', 'catalog', 'loyalty'].includes(module);
    }
    if (currentUser.role === 'receptionist') {
      return ['dashboard', 'admission', 'financial_income', 'loyalty', 'reports_archive'].includes(module);
    }
    if (currentUser.role === 'lab_tech') {
      return ['dashboard', 'worklist', 'instruments', 'inventory'].includes(module);
    }
    if (currentUser.role === 'hr_officer') {
      return ['dashboard', 'hr', 'audit_settings'].includes(module);
    }
    return true;
  }, [currentUser]);

  // Selected Report
  const selectedReport = useMemo(() => {
    return reports.find(r => r.id === selectedReportId) || reports[0] || null;
  }, [reports, selectedReportId]);

  // Report CRUD
  const addReport = useCallback((report: LabReport) => {
    setReports(prev => [report, ...prev]);
    setSelectedReportId(report.id);
    logAction('CREATE', 'DIAGNOSTIC', `إنشاء تقرير طبي جديد للمريض ${report.patient.fullName} برقم ${report.reportNumber}`);
  }, [logAction]);

  const updateReport = useCallback((id: string, updates: Partial<LabReport>) => {
    setReports(prev => prev.map(r => r.id === id ? { ...r, ...updates, updatedAt: new Date().toISOString() } : r));
    logAction('UPDATE', 'DIAGNOSTIC', `تحديث التقرير الطبي رقم ${id}`);
  }, [logAction]);

  const deleteReport = useCallback((id: string) => {
    const reportToDelete = reports.find(r => r.id === id);
    setReports(prev => prev.filter(r => r.id !== id));
    if (selectedReportId === id) {
      setSelectedReportId(null);
    }
    logAction('DELETE', 'DIAGNOSTIC', `حذف التقرير الطبي للمريض ${reportToDelete?.patient.fullName || id}`);
  }, [reports, selectedReportId, logAction]);

  const verifyReport = useCallback((id: string) => {
    setReports(prev => prev.map(r => {
      if (r.id === id) {
        return {
          ...r,
          status: 'verified',
          staff: {
            ...r.staff,
            verifiedBy: currentUser.nameAr,
            pathologist: r.staff.pathologist || "أ.د. رامي مختار - استشاري الباثولوجيا الإكلينيكية والكيميائية - كلية طب قصر العيني"
          },
          updatedAt: new Date().toISOString()
        };
      }
      return r;
    }));
    logAction('UPDATE', 'DIAGNOSTIC', `اعتماد التقرير الطبي رسمياً بواسطة ${currentUser.nameAr}`);
    addNotification({
      title: "تم اعتماد التقرير الطبي",
      message: `تم اعتماد تقرير المريض برقم ${id} وأصبح جاهزاً للطباعة والإرسال.`,
      type: "success"
    });
  }, [currentUser, logAction, addNotification]);

  // Financial CRUD
  const addIncomeRecord = useCallback((record: Omit<IncomeRecord, 'id' | 'createdAt' | 'updatedAt'>): IncomeRecord => {
    const newRecord: IncomeRecord = {
      ...record,
      id: `inv-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      syncStatus: 'synced'
    };
    setIncomeRecords(prev => [newRecord, ...prev]);
    logAction('CREATE', 'INCOME', `إصدار فاتورة جديدة رقم ${newRecord.invoiceNumber} للمريض ${newRecord.patientName} بقيمة صافية ${newRecord.netAmount} ج.م`);
    return newRecord;
  }, [logAction]);

  const updateIncomeRecord = useCallback((id: string, updates: Partial<IncomeRecord>) => {
    setIncomeRecords(prev => prev.map(inv => inv.id === id ? { ...inv, ...updates, updatedAt: new Date().toISOString() } : inv));
    logAction('UPDATE', 'INCOME', `تعديل الفاتورة رقم ${id}`);
  }, [logAction]);

  const deleteIncomeRecord = useCallback((id: string) => {
    const inv = incomeRecords.find(i => i.id === id);
    setIncomeRecords(prev => prev.filter(i => i.id !== id));
    logAction('DELETE', 'INCOME', `حذف الفاتورة رقم ${inv?.invoiceNumber || id} للمريض ${inv?.patientName}`);
  }, [incomeRecords, logAction]);

  // Test Catalog CRUD
  const addCatalogTest = useCallback((test: InvoiceTestItem) => {
    setTestCatalog(prev => [test, ...prev]);
    logAction('CATALOG_UPDATE', 'CATALOG', `إضافة تحليل جديد للكتالوج: ${test.nameAr} (${test.code})`);
  }, [logAction]);

  const updateCatalogTest = useCallback((code: string, updates: Partial<InvoiceTestItem>) => {
    setTestCatalog(prev => prev.map(t => t.code === code ? { ...t, ...updates } : t));
    logAction('CATALOG_UPDATE', 'CATALOG', `تعديل سعر/بيانات التحليل: ${code}`);
  }, [logAction]);

  const deleteCatalogTest = useCallback((code: string) => {
    setTestCatalog(prev => prev.filter(t => t.code !== code));
    logAction('CATALOG_UPDATE', 'CATALOG', `حذف التحليل ${code} من الكتالوج`);
  }, [logAction]);

  // Unified Admission: Register patient -> Create Lab Report -> Create Income Invoice -> Update Loyalty
  const createReportFromAdmission = useCallback((patient: Patient, selectedTests: InvoiceTestItem[], packageApplied?: any): LabReport => {
    const today = new Date().toISOString().split('T')[0];
    const generatedProfiles: TestProfile[] = [];

    selectedTests.forEach(test => {
      const catalogTemplate = LAB_CATALOG.find(c => c.code.toLowerCase() === test.code.toLowerCase() || c.titleEn.toLowerCase().includes(test.code.toLowerCase()));
      if (catalogTemplate) {
        generatedProfiles.push({
          id: `prof-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
          profileCode: catalogTemplate.code,
          titleEn: catalogTemplate.titleEn,
          titleAr: catalogTemplate.titleAr,
          category: catalogTemplate.category,
          sampleType: catalogTemplate.sampleType,
          interpretation: catalogTemplate.defaultInterpretation || '',
          parameters: catalogTemplate.parameters.map((p, idx) => ({
            ...p,
            id: `param-${idx}-${Date.now()}`,
            result: '',
            flag: 'NORMAL'
          }))
        });
      } else {
        generatedProfiles.push({
          id: `prof-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
          profileCode: test.code,
          titleEn: test.nameEn,
          titleAr: test.nameAr,
          category: test.category || 'General',
          sampleType: test.sampleType || 'Serum',
          parameters: [
            {
              id: `p-${Date.now()}`,
              name: test.nameEn,
              result: '',
              unit: test.unit || '',
              minNormal: test.minNormal,
              maxNormal: test.maxNormal,
              textReference: test.textReference || '',
              flag: 'NORMAL',
              method: test.method || 'Automated Clinical Assay'
            }
          ]
        });
      }
    });

    const newReport: LabReport = {
      id: `rep-${Date.now()}`,
      reportNumber: patient.labNumber,
      patient: {
        ...patient,
        sampleDate: patient.sampleDate || today,
        reportingDate: patient.reportingDate || today
      },
      profiles: generatedProfiles.length > 0 ? generatedProfiles : [
        {
          id: `prof-def-${Date.now()}`,
          profileCode: 'CBC',
          titleEn: 'Complete Blood Count (CBC)',
          titleAr: 'صورة الدم الكاملة',
          category: 'Hematology',
          sampleType: 'EDTA Whole Blood',
          parameters: LAB_CATALOG[0].parameters.map((p, idx) => ({
            ...p,
            id: `p-${idx}-${Date.now()}`,
            result: '',
            flag: 'NORMAL'
          }))
        }
      ],
      staff: {
        labChemist: "د. هبة الشناوي - كيميائية تحاليل",
        verifiedBy: "د. مصطفى العوضي - استشاري التحاليل",
        pathologist: "أ.د. رامي مختار - استشاري الباثولوجيا الإكلينيكية والكيميائية - كلية طب قصر العيني"
      },
      status: 'draft',
      packageApplied: packageApplied ? {
        code: packageApplied.code,
        titleAr: packageApplied.titleAr,
        packagePrice: packageApplied.packagePrice
      } : undefined,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    setReports(prev => [newReport, ...prev]);
    setSelectedReportId(newReport.id);

    // Matching financial invoice
    const newInvoice: IncomeRecord = {
      id: `inv-${Date.now()}`,
      invoiceNumber: `INV-${patient.labNumber.replace('RT-', '')}`,
      patientName: patient.fullName,
      patientPhone: patient.phone,
      patientAge: patient.age,
      patientGender: patient.gender,
      barcode: patient.barcode,
      labNumber: patient.labNumber,
      referringDoctor: patient.referringDoctorName || 'أطباء كلية طب قصر العيني',
      tests: selectedTests,
      subtotal: patient.totalCost || 0,
      testsSubtotal: patient.testsSubtotal || patient.totalCost || 0,
      discount: patient.discountApplied || 0,
      visitFee: patient.visitFee || 0,
      isHomeVisit: patient.bookingType === 'home_visit',
      visitAddress: patient.homeAddress,
      netAmount: Math.max(0, (patient.totalCost || 0) - (patient.discountApplied || 0) + (patient.visitFee || 0)),
      paidAmount: Math.max(0, (patient.totalCost || 0) - (patient.discountApplied || 0) + (patient.visitFee || 0)),
      remainingAmount: 0,
      paymentMethod: (patient.paymentMethod as any) || 'cash',
      paymentStatus: 'paid',
      cashierName: currentUser.nameAr,
      branch: patient.branchAddress || 'فرع القصر العيني - الرئيسي',
      syncStatus: 'synced',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    setIncomeRecords(prev => [newInvoice, ...prev]);
    newReport.invoiceId = newInvoice.id;

    logAction('CREATE', 'DIAGNOSTIC', `تسجيل مريض جديد ${patient.fullName} وحجز تحاليل وربط التقرير بالفاتورة المالية`);
    addNotification({
      title: "تم تسجيل المريض بنجاح",
      message: `تم حجز التحاليل للمريض ${patient.fullName} وإصدار فاتورة وإدراج العينة في قائمة عمل المعمل.`,
      type: "success"
    });

    return newReport;
  }, [currentUser, logAction, addNotification]);

  // Loyalty Program Helpers
  const calculateLoyaltyTier = useCallback((points: number): LoyaltyTier => {
    if (points >= loyaltyConfig.tiers.VIP.minPoints) return 'VIP';
    if (points >= loyaltyConfig.tiers.Platinum.minPoints) return 'Platinum';
    if (points >= loyaltyConfig.tiers.Gold.minPoints) return 'Gold';
    return 'Silver';
  }, [loyaltyConfig]);

  const calculateCashForPoints = useCallback((points: number) => {
    return Math.floor(points / 100) * loyaltyConfig.egpPer100Points;
  }, [loyaltyConfig]);

  const calculatePointsForAmount = useCallback((amount: number) => {
    return Math.floor(amount * loyaltyConfig.pointsPerEGP);
  }, [loyaltyConfig]);

  const getLoyaltyByPhone = useCallback((phone: string): PatientLoyaltyProfile | undefined => {
    if (!phone) return undefined;
    const cleanPhone = phone.replace(/\s+/g, '');
    return loyaltyProfiles.find(p => p.phone.replace(/\s+/g, '') === cleanPhone);
  }, [loyaltyProfiles]);

  const earnLoyaltyPoints = useCallback((
    patientPhone: string,
    amount: number,
    invoiceNumber: string,
    patientName: string,
    barcode: string
  ) => {
    const pointsToEarn = Math.floor(amount * loyaltyConfig.pointsPerEGP);
    if (pointsToEarn <= 0) return;

    setLoyaltyProfiles(prev => {
      const cleanPhone = patientPhone.replace(/\s+/g, '');
      const existing = prev.find(p => p.phone.replace(/\s+/g, '') === cleanPhone);

      if (existing) {
        const newTotal = existing.totalPoints + pointsToEarn;
        const newSpent = existing.lifetimeSpent + amount;
        const newTier = calculateLoyaltyTier(newTotal);

        return prev.map(p => p.patientId === existing.patientId ? {
          ...p,
          totalPoints: newTotal,
          tier: newTier,
          lifetimeSpent: newSpent,
          transactions: [
            {
              id: `tx-${Date.now()}`,
              date: new Date().toISOString().split('T')[0],
              type: 'earn',
              points: pointsToEarn,
              description: `اكتساب نقاط عن فاتورة رقم ${invoiceNumber}`,
              invoiceNumber,
              amountEGP: amount
            },
            ...p.transactions
          ]
        } : p);
      } else {
        const newProfile: PatientLoyaltyProfile = {
          patientId: `pat-loyalty-${Date.now()}`,
          patientName,
          phone: patientPhone,
          barcode,
          cardNumber: `RT-${calculateLoyaltyTier(pointsToEarn).toUpperCase()}-${barcode.replace('RT-', '') || Math.floor(10000 + Math.random() * 90000)}`,
          bloodGroup: '',
          totalPoints: pointsToEarn,
          tier: calculateLoyaltyTier(pointsToEarn),
          lifetimeSpent: amount,
          issueDate: new Date().toISOString().split('T')[0],
          transactions: [
            {
              id: `tx-${Date.now()}`,
              date: new Date().toISOString().split('T')[0],
              type: 'earn',
              points: pointsToEarn,
              description: `اكتساب نقاط ترحيبية وفاتورة رقم ${invoiceNumber}`,
              invoiceNumber,
              amountEGP: amount
            }
          ]
        };
        return [newProfile, ...prev];
      }
    });

    logAction('LOYALTY', 'LOYALTY', `إضافة ${pointsToEarn} نقطة ولاء للمريض ${patientName} برقم هاتف ${patientPhone}`);
  }, [loyaltyConfig, calculateLoyaltyTier, logAction]);

  // Financial Metrics
  const financialMetrics = useMemo(() => {
    const totalGrossIncome = incomeRecords.reduce((acc, r) => acc + r.subtotal, 0);
    const totalPaidIncome = incomeRecords.reduce((acc, r) => acc + r.paidAmount, 0);
    const totalDeferredIncome = incomeRecords.reduce((acc, r) => acc + r.remainingAmount, 0);
    const totalExpenses = expenses.reduce((acc, e) => acc + e.amount, 0);
    const netProfit = totalPaidIncome - totalExpenses;
    const base = profitConfig.calculationBase === 'net_profit' ? Math.max(0, netProfit) : totalPaidIncome;
    const ceoShare = (base * profitConfig.ceoPercentage) / 100;
    const labShare = (base * profitConfig.labPercentage) / 100;
    const emergencyFund = (base * profitConfig.emergencyFundPercentage) / 100;

    return {
      totalGrossIncome,
      totalPaidIncome,
      totalDeferredIncome,
      totalExpenses,
      netProfit,
      ceoShare,
      labShare,
      emergencyFund,
      emergencyShare: emergencyFund
    };
  }, [incomeRecords, expenses, profitConfig]);

  const resetCatalog = useCallback(() => {
    setTestCatalog(DEFAULT_TEST_CATALOG);
    logAction('CATALOG_UPDATE', 'CATALOG', 'إعادة ضبط كتالوج التحاليل للقيم الافتراضية');
  }, [logAction]);

  const updateLoyaltyConfig = useCallback((newConfig: LoyaltyConfig) => {
    logAction('LOYALTY', 'LOYALTY', 'تحديث إعدادات كروت الولاء وقيمة استبدال النقاط');
  }, [logAction]);

  const addLoyaltyProfile = useCallback((profile: PatientLoyaltyProfile) => {
    setLoyaltyProfiles(prev => [profile, ...prev]);
    logAction('CREATE', 'LOYALTY', `إصدار كارت ولاء جديد للمريض ${profile.patientName}`);
  }, [logAction]);

  const restockItem = useCallback((id: string, addedQty: number, newCost?: number) => {
    setInventory(prev => prev.map(item => {
      if (item.id === id) {
        return {
          ...item,
          currentQuantity: item.currentQuantity + addedQty,
          costPerUnit: newCost !== undefined ? newCost : item.costPerUnit,
          lastRestockedDate: new Date().toISOString().split('T')[0]
        };
      }
      return item;
    }));
    logAction('UPDATE', 'INVENTORY', `توريد واستلام كمية ${addedQty} لمادة رقم ${id}`);
  }, [logAction]);

  const consumeReagent = useCallback((id: string, qty: number) => {
    setInventory(prev => prev.map(item => {
      if (item.id === id) {
        return {
          ...item,
          currentQuantity: Math.max(0, item.currentQuantity - qty)
        };
      }
      return item;
    }));
    logAction('UPDATE', 'INVENTORY', `صرف واستهلاك ${qty} من مادة رقم ${id}`);
  }, [logAction]);

  const addLoyaltyPoints = useCallback((
    patientPhone: string,
    points: number,
    reason: string,
    invoiceNumber?: string,
    amountEGP?: number
  ) => {
    setLoyaltyProfiles(prev => {
      const cleanPhone = patientPhone.replace(/\s+/g, '');
      const existing = prev.find(p => p.phone.replace(/\s+/g, '') === cleanPhone || p.patientId === patientPhone);
      if (existing) {
        const newTotal = existing.totalPoints + points;
        return prev.map(p => {
          if (p.patientId === existing.patientId) {
            return {
              ...p,
              totalPoints: newTotal,
              tier: calculateLoyaltyTier(newTotal),
              transactions: [
                {
                  id: `tx-${Date.now()}`,
                  date: new Date().toISOString().split('T')[0],
                  type: 'bonus',
                  points,
                  description: reason,
                  invoiceNumber,
                  amountEGP
                },
                ...p.transactions
              ]
            };
          }
          return p;
        });
      }
      return prev;
    });
  }, [calculateLoyaltyTier]);

  const redeemLoyaltyPoints = useCallback((
    patientPhone: string,
    points: number,
    invoiceNumber?: string,
    discountEGP?: number
  ): { success: boolean; cashValue: number } => {
    const profile = getLoyaltyByPhone(patientPhone) || loyaltyProfiles.find(p => p.patientId === patientPhone);
    const cashValue = discountEGP || calculateCashForPoints(points);
    if (!profile || profile.totalPoints < points) {
      return { success: false, cashValue: 0 };
    }

    setLoyaltyProfiles(prev => prev.map(p => {
      if (p.patientId === profile.patientId) {
        const remaining = p.totalPoints - points;
        return {
          ...p,
          totalPoints: remaining,
          transactions: [
            {
              id: `tx-red-${Date.now()}`,
              date: new Date().toISOString().split('T')[0],
              type: 'redeem',
              points: -points,
              description: `استبدال ${points} نقطة بخصم ${cashValue} ج.م ${invoiceNumber ? `على فاتورة ${invoiceNumber}` : ''}`,
              invoiceNumber,
              amountEGP: cashValue
            },
            ...p.transactions
          ]
        };
      }
      return p;
    }));

    logAction('LOYALTY', 'LOYALTY', `استبدال ${points} نقطة للمريض ${profile.patientName} بخصم ${cashValue} ج.م`);
    return { success: true, cashValue };
  }, [getLoyaltyByPhone, loyaltyProfiles, calculateCashForPoints, logAction]);

  const updateLoyaltyProfile = useCallback((id: string, updates: Partial<PatientLoyaltyProfile>) => {
    setLoyaltyProfiles(prev => prev.map(p => p.patientId === id ? { ...p, ...updates } : p));
  }, []);

  const deleteLoyaltyProfile = useCallback((id: string) => {
    setLoyaltyProfiles(prev => prev.filter(p => p.patientId !== id));
  }, []);

  const deleteLoyaltyTransaction = useCallback((profileId: string, txId: string) => {
    setLoyaltyProfiles(prev => prev.map(p => {
      if (p.patientId === profileId) {
        const filteredTx = p.transactions.filter(t => t.id !== txId);
        const recomputedPoints = filteredTx.reduce((sum, t) => sum + t.points, 0);
        return { ...p, transactions: filteredTx, totalPoints: Math.max(0, recomputedPoints) };
      }
      return p;
    }));
  }, []);

  const retroactiveSyncAllInvoicesToLoyalty = useCallback(() => {
    let syncedCount = 0;
    let newProfilesCount = 0;

    incomeRecords.forEach(inv => {
      if (inv.patientPhone && inv.paidAmount > 0) {
        earnLoyaltyPoints(inv.patientPhone, inv.paidAmount, inv.invoiceNumber, inv.patientName, inv.barcode);
        syncedCount++;
      }
    });

    logAction('LOYALTY', 'LOYALTY', `مزامنة رجعية لنقاط الولاء لـ ${syncedCount} فاتورة سابقة`);
    return { syncedCount, newProfilesCount };
  }, [incomeRecords, earnLoyaltyPoints, logAction]);

  // Expenses CRUD
  const addExpense = useCallback((expense: Omit<ExpenseRecord, 'id' | 'createdAt'>) => {
    const newExp: ExpenseRecord = {
      ...expense,
      id: `exp-${Date.now()}`,
      createdAt: new Date().toISOString()
    };
    setExpenses(prev => [newExp, ...prev]);
    logAction('CREATE', 'EXPENSES', `تسجيل مصروف جديد: ${expense.title} بقيمة ${expense.amount} ج.م`);
  }, [logAction]);

  const updateExpense = useCallback((id: string, updates: Partial<ExpenseRecord>) => {
    setExpenses(prev => prev.map(e => e.id === id ? { ...e, ...updates } : e));
    logAction('UPDATE', 'EXPENSES', `تعديل المصروف رقم ${id}`);
  }, [logAction]);

  const deleteExpense = useCallback((id: string) => {
    setExpenses(prev => prev.filter(e => e.id !== id));
    logAction('DELETE', 'EXPENSES', `حذف بند المصروف رقم ${id}`);
  }, [logAction]);

  const updateProfitConfig = useCallback((config: ProfitShareConfig) => {
    setProfitConfig(config);
    logAction('UPDATE', 'SETTINGS', 'تحديث إعدادات توزيع الأرباح ونسب الشركاء');
  }, [logAction]);

  // Daily Closeout
  const closeoutDay = useCallback((actualCash: number, discrepancyNotes?: string): DailyCloseout => {
    const today = new Date().toISOString().split('T')[0];
    const todayIncome = incomeRecords.filter(r => r.createdAt.startsWith(today));
    const todayExpenses = expenses.filter(e => e.date === today);

    const cashIncome = todayIncome.filter(r => r.paymentMethod === 'cash').reduce((sum, r) => sum + r.paidAmount, 0);
    const visaIncome = todayIncome.filter(r => r.paymentMethod === 'visa').reduce((sum, r) => sum + r.paidAmount, 0);
    const transferIncome = todayIncome.filter(r => ['bank_transfer', 'instapay', 'vodafone_cash'].includes(r.paymentMethod)).reduce((sum, r) => sum + r.paidAmount, 0);
    const deferredIncome = todayIncome.filter(r => r.paymentStatus === 'unpaid').reduce((sum, r) => sum + r.remainingAmount, 0);
    const cashExpenses = todayExpenses.filter(e => e.paymentMethod === 'cash').reduce((sum, e) => sum + e.amount, 0);

    const expectedCash = cashIncome - cashExpenses;
    const diff = actualCash - expectedCash;

    const closeout: DailyCloseout = {
      id: `close-${today}`,
      date: today,
      totalIncomeCash: cashIncome,
      totalIncomeVisa: visaIncome,
      totalIncomeTransfer: transferIncome,
      totalIncomeDeferred: deferredIncome,
      totalExpenses: cashExpenses,
      expectedCashInDrawer: expectedCash,
      actualCashInDrawer: actualCash,
      discrepancy: diff,
      closedBy: currentUser.nameAr,
      notes: discrepancyNotes,
      timestamp: new Date().toISOString()
    };

    setDailyCloseouts(prev => [closeout, ...prev.filter(c => c.date !== today)]);
    logAction('CLOSEOUT', 'INCOME', `تقفيل الوردية اليومية: المتوقع ${expectedCash} ج.م، الفعلي ${actualCash} ج.م، الفرق ${diff} ج.م`);
    return closeout;
  }, [incomeRecords, expenses, currentUser, logAction]);

  // Inventory CRUD
  const addInventoryItem = useCallback((item: Omit<InventoryItem, 'id' | 'lastRestockedDate'>) => {
    const newItem: InventoryItem = {
      ...item,
      id: `inv-item-${Date.now()}`,
      lastRestockedDate: new Date().toISOString().split('T')[0]
    };
    setInventory(prev => [newItem, ...prev]);
    logAction('CREATE', 'INVENTORY', `إضافة مادة/محلول مخبري جديد: ${item.nameAr}`);
  }, [logAction]);

  const updateInventoryItem = useCallback((id: string, updates: Partial<InventoryItem>) => {
    setInventory(prev => prev.map(item => item.id === id ? { ...item, ...updates } : item));
    logAction('UPDATE', 'INVENTORY', `تحديث مخزون المادة رقم ${id}`);
  }, [logAction]);

  const deleteInventoryItem = useCallback((id: string) => {
    setInventory(prev => prev.filter(i => i.id !== id));
    logAction('DELETE', 'INVENTORY', `حذف مادة من المخزون رقم ${id}`);
  }, [logAction]);

  // Instruments & Interfacing
  const toggleInstrumentStatus = useCallback((id: string) => {
    setInstruments(prev => prev.map(inst => {
      if (inst.id === id) {
        const newStatus = inst.status === 'online' ? 'offline' : 'online';
        return { ...inst, status: newStatus };
      }
      return inst;
    }));
  }, []);

  const simulateInstrumentRun = useCallback((instrumentId: string, barcode: string, patientName?: string, labNumber?: string): InstrumentTransmission => {
    const inst = instruments.find(i => i.id === instrumentId) || instruments[0];
    const isHematology = inst.category === 'hematology';

    let generatedResults: Record<string, string | number> = {};
    if (isHematology) {
      generatedResults = {
        "Hemoglobin (Hb)": +(11.5 + Math.random() * 4).toFixed(1),
        "RBC Count": +(4.2 + Math.random() * 1.2).toFixed(2),
        "Hematocrit (Hct / PCV)": +(36 + Math.random() * 10).toFixed(1),
        "MCV": +(78 + Math.random() * 18).toFixed(1),
        "MCH": +(26 + Math.random() * 6).toFixed(1),
        "MCHC": +(32 + Math.random() * 3).toFixed(1),
        "RDW-CV": +(12.5 + Math.random() * 3).toFixed(1),
        "Total Leucocytic Count (TLC / WBC)": +(5.5 + Math.random() * 4.5).toFixed(1),
        "Platelet Count": Math.floor(180 + Math.random() * 220),
        "Neutrophils %": Math.floor(55 + Math.random() * 15),
        "Lymphocytes %": Math.floor(25 + Math.random() * 12),
        "Monocytes %": Math.floor(4 + Math.random() * 4),
        "Eosinophils %": Math.floor(1 + Math.random() * 3),
        "Basophils %": 1
      };
    } else {
      generatedResults = {
        "Fasting Blood Glucose": Math.floor(80 + Math.random() * 50),
        "Serum Creatinine": +(0.7 + Math.random() * 0.4).toFixed(2),
        "Blood Urea": Math.floor(20 + Math.random() * 20),
        "Serum Uric Acid": +(4.0 + Math.random() * 2.0).toFixed(1),
        "ALT (SGPT)": Math.floor(18 + Math.random() * 25),
        "AST (SGOT)": Math.floor(16 + Math.random() * 20),
        "Total Bilirubin": +(0.6 + Math.random() * 0.4).toFixed(2),
        "Direct Bilirubin": +(0.12 + Math.random() * 0.1).toFixed(2)
      };
    }

    const newTx: InstrumentTransmission = {
      id: `tx-${Date.now()}`,
      instrumentId: inst.id,
      instrumentName: inst.name,
      timestamp: new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' }),
      sampleBarcode: barcode,
      patientLabNumber: labNumber || `RT-2026-${Math.floor(100 + Math.random() * 900)}`,
      patientName: patientName || 'عينة واردة من الجهاز',
      testCode: isHematology ? 'CBC' : 'CHEMISTRY',
      results: generatedResults,
      rawMessage: `MSH|^~\\&|${inst.name}|${inst.manufacturer}|RT_LIS|MAIN|${new Date().toISOString()}||ORU^R01\rPID|||${barcode}\rOBR|1||${barcode}|${isHematology ? 'CBC' : 'CHEM'}`,
      status: 'received'
    };

    setTransmissions(prev => [newTx, ...prev]);
    setInstruments(prev => prev.map(i => i.id === inst.id ? { ...i, totalTestsRun: i.totalTestsRun + 1, lastSyncTime: 'الآن' } : i));

    logAction('DEVICE_COMM', 'DEVICE', `استلام نتائج فحص تلقائية من جهاز ${inst.name} للباركود ${barcode}`);
    addNotification({
      title: `نتائج جديدة من ${inst.name}`,
      message: `تم استقبال قراءات الباركود ${barcode} بنجاح ويمكن الآن إدراجها بالتقرير الطبي بضغطة زر.`,
      type: "info"
    });

    return newTx;
  }, [instruments, logAction, addNotification]);

  const applyTransmissionToReport = useCallback((transmissionId: string, reportId: string): boolean => {
    const tx = transmissions.find(t => t.id === transmissionId);
    const targetReport = reports.find(r => r.id === reportId);
    if (!tx || !targetReport) return false;

    setReports(prev => prev.map(rep => {
      if (rep.id === reportId) {
        const updatedProfiles = rep.profiles.map(prof => {
          const updatedParams = prof.parameters.map(param => {
            const matchingKey = Object.keys(tx.results).find(k =>
              k.toLowerCase() === param.name.toLowerCase() ||
              param.name.toLowerCase().includes(k.toLowerCase()) ||
              k.toLowerCase().includes(param.name.toLowerCase())
            );

            if (matchingKey && tx.results[matchingKey] !== undefined) {
              const val = tx.results[matchingKey];
              const numVal = typeof val === 'number' ? val : parseFloat(String(val));
              let flag: TestParameter['flag'] = 'NORMAL';

              if (!isNaN(numVal)) {
                if (param.panicLow !== undefined && numVal <= param.panicLow) flag = 'PANIC_LOW';
                else if (param.panicHigh !== undefined && numVal >= param.panicHigh) flag = 'PANIC_HIGH';
                else if (param.minNormal !== undefined && numVal < param.minNormal) flag = 'LOW';
                else if (param.maxNormal !== undefined && numVal > param.maxNormal) flag = 'HIGH';
              }

              return { ...param, result: String(val), flag };
            }
            return param;
          });

          return { ...prof, parameters: updatedParams };
        });

        return { ...rep, profiles: updatedProfiles, updatedAt: new Date().toISOString() };
      }
      return rep;
    }));

    setTransmissions(prev => prev.map(t => t.id === transmissionId ? { ...t, status: 'mapped' } : t));

    logAction('UPDATE', 'DIAGNOSTIC', `إدراج نتائج جهاز ${tx.instrumentName} في تقرير المريض ${targetReport.patient.fullName}`);
    addNotification({
      title: "تم ربط وإدراج نتائج الجهاز",
      message: `تم تحديث بارامترات التقرير الطبي للعينّة ${targetReport.reportNumber} تلقائياً.`,
      type: "success"
    });

    return true;
  }, [transmissions, reports, logAction, addNotification]);

  // Lab to Lab CRUD
  const addLabToLabOrder = useCallback((order: Omit<LabToLabOrder, 'id'>) => {
    const newOrder: LabToLabOrder = {
      ...order,
      id: `l2l-${Date.now()}`
    };
    setLabToLabOrders(prev => [newOrder, ...prev]);
    logAction('CREATE', 'LAB_TO_LAB', `إرسال عينة إلى معمل إحالة خارجي: ${order.externalLabName} للمريض ${order.patientName}`);
  }, [logAction]);

  const updateLabToLabOrder = useCallback((id: string, updates: Partial<LabToLabOrder>) => {
    setLabToLabOrders(prev => prev.map(o => o.id === id ? { ...o, ...updates } : o));
    logAction('UPDATE', 'LAB_TO_LAB', `تحديث طلب معمل الإحالة رقم ${id}`);
  }, [logAction]);

  const deleteLabToLabOrder = useCallback((id: string) => {
    setLabToLabOrders(prev => prev.filter(o => o.id !== id));
    logAction('DELETE', 'LAB_TO_LAB', `حذف طلب معمل الإحالة رقم ${id}`);
  }, [logAction]);

  // HR Employees CRUD
  const addEmployee = useCallback((emp: Omit<Employee, 'id'>) => {
    const newEmp: Employee = {
      ...emp,
      id: `emp-${Date.now()}`
    };
    setEmployees(prev => [newEmp, ...prev]);
    logAction('CREATE', 'HR', `إضافة موظف جديد: ${emp.fullName}`);
  }, [logAction]);

  const updateEmployee = useCallback((id: string, updates: Partial<Employee>) => {
    setEmployees(prev => prev.map(e => e.id === id ? { ...e, ...updates } : e));
    logAction('UPDATE', 'HR', `تعديل بيانات الموظف رقم ${id}`);
  }, [logAction]);

  const deleteEmployee = useCallback((id: string) => {
    setEmployees(prev => prev.filter(e => e.id !== id));
    logAction('DELETE', 'HR', `حذف موظف رقم ${id}`);
  }, [logAction]);

  const recordAttendance = useCallback((employeeId: string, status: AttendanceRecord['status'], checkIn?: string, checkOut?: string, notes?: string) => {
    const emp = employees.find(e => e.id === employeeId);
    if (!emp) return;
    const today = new Date().toISOString().split('T')[0];
    const newAtt: AttendanceRecord = {
      id: `att-${Date.now()}`,
      employeeId,
      employeeName: emp.fullName,
      date: today,
      checkInTime: checkIn || new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' }),
      checkOutTime: checkOut,
      status,
      hoursWorked: checkOut ? 8 : 0,
      overtimeHours: 0,
      notes
    };
    setAttendance(prev => [newAtt, ...prev.filter(a => !(a.employeeId === employeeId && a.date === today))]);
  }, [employees]);

  const generatePayrollForMonth = useCallback((monthYear: string) => {
    const newPayroll: PayrollRecord[] = employees.filter(e => e.isActive).map(emp => ({
      id: `pay-${emp.id}-${monthYear}`,
      monthYear,
      employeeId: emp.id,
      employeeName: emp.fullName,
      basicSalary: emp.basicSalary,
      bonusAmount: 0,
      deductionAmount: 0,
      advancePayment: 0,
      overtimePay: 0,
      netSalary: emp.basicSalary,
      paymentStatus: 'draft'
    }));
    setPayroll(newPayroll);
  }, [employees]);

  const updatePayrollRecord = useCallback((id: string, updates: Partial<PayrollRecord>) => {
    setPayroll(prev => prev.map(p => p.id === id ? { ...p, ...updates } : p));
  }, []);

  const clockInEmployee = useCallback((empId: string) => {
    recordAttendance(empId, 'present');
  }, [recordAttendance]);

  const clockOutEmployee = useCallback((empId: string) => {
    const today = new Date().toISOString().split('T')[0];
    setAttendance(prev => prev.map(a => {
      if (a.employeeId === empId && a.date === today && !a.checkOutTime) {
        return {
          ...a,
          checkOutTime: new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' }),
          hoursWorked: 8
        };
      }
      return a;
    }));
  }, []);

  // Lab Info Update
  const updateLabInfo = useCallback((info: LabInfo) => {
    setLabInfo(info);
    logAction('UPDATE', 'SETTINGS', 'تحديث بيانات المعمل والاعتماد الطبي ووسائل التواصل');
  }, [logAction]);

  // Backups
  const exportBackup = useCallback(async (): Promise<string> => {
    const payload = {
      exportDate: new Date().toISOString(),
      reports,
      incomeRecords,
      loyaltyProfiles,
      inventory,
      expenses,
      dailyCloseouts,
      employees,
      labToLabOrders,
      testCatalog,
      auditLogs: auditLogs.slice(0, 100)
    };
    const jsonStr = JSON.stringify(payload, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `RT_Lab_Unified_Backup_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    logAction('BACKUP', 'SETTINGS', 'تصدير نسخة احتياطية موحدة شاملة لبيانات المعمل');
    return jsonStr;
  }, [reports, incomeRecords, loyaltyProfiles, inventory, expenses, dailyCloseouts, employees, labToLabOrders, testCatalog, auditLogs, logAction]);

  const importBackup = useCallback(async (backupJson: string): Promise<{ success: boolean; message: string }> => {
    try {
      const data = JSON.parse(backupJson);
      if (data.reports) setReports(data.reports);
      if (data.incomeRecords) setIncomeRecords(data.incomeRecords);
      if (data.loyaltyProfiles) setLoyaltyProfiles(data.loyaltyProfiles);
      if (data.inventory) setInventory(data.inventory);
      if (data.expenses) setExpenses(data.expenses);
      if (data.employees) setEmployees(data.employees);
      if (data.labToLabOrders) setLabToLabOrders(data.labToLabOrders);
      if (data.testCatalog) setTestCatalog(data.testCatalog);
      logAction('BACKUP', 'SETTINGS', 'استعادة قاعدة البيانات الموحدة من نسخة احتياطية');
      return { success: true, message: 'تم استعادة البيانات بنجاح!' };
    } catch {
      return { success: false, message: 'فشل استعادة البيانات من الملف.' };
    }
  }, [logAction]);

  const resetToDefaultData = useCallback(() => {
    setReports(INITIAL_REPORTS);
    setIncomeRecords(INITIAL_INCOME_RECORDS);
    setLoyaltyProfiles(INITIAL_LOYALTY_DATA);
    setInventory(INITIAL_INVENTORY);
    setExpenses([]);
    setDailyCloseouts([]);
    setLabToLabOrders(INITIAL_LAB_TO_LAB);
    setEmployees(INITIAL_EMPLOYEES);
    logAction('BACKUP', 'SETTINGS', 'إعادة ضبط المنظومة للبيانات الأولية الافتراضية');
  }, [logAction]);

  const clearPatientRecordsOnly = useCallback(() => {
    setReports([]);
    setIncomeRecords([]);
    setLoyaltyProfiles([]);
    setSelectedReportId(null);
    logAction('DELETE', 'SETTINGS', 'مسح سجلات المرضى والفواتير فقط مع الاحتفاظ بالكتالوج والمخزون');
  }, [logAction]);

  // GitHub Cloud Sync
  const updateGithubConfig = useCallback((config: Partial<GitHubSyncConfig>) => {
    setGithubConfig(prev => ({ ...prev, ...config }));
  }, []);

  const syncUnifiedDataToGitHub = useCallback(async (): Promise<{ success: boolean; message: string }> => {
    if (!githubConfig.token || !githubConfig.repoOwner || !githubConfig.repoName) {
      return { success: false, message: "بيانات مستودع GitHub غير مكتملة" };
    }

    try {
      const payload = {
        timestamp: new Date().toISOString(),
        reportsCount: reports.length,
        incomeCount: incomeRecords.length,
        loyaltyProfilesCount: loyaltyProfiles.length,
        reports,
        incomeRecords,
        loyaltyProfiles,
        inventory,
        dailyCloseouts,
        auditLogs: auditLogs.slice(0, 50)
      };

      const path = 'rt_lab_unified_backup.json';
      const url = `https://api.github.com/repos/${githubConfig.repoOwner}/${githubConfig.repoName}/contents/${path}`;

      let sha: string | undefined;
      const getRes = await fetch(url, {
        headers: {
          'Authorization': `token ${githubConfig.token}`,
          'Accept': 'application/vnd.github.v3+json'
        }
      });
      if (getRes.ok) {
        const getData = await getRes.json();
        sha = getData.sha;
      }

      const contentBase64 = btoa(unescape(encodeURIComponent(JSON.stringify(payload, null, 2))));

      const putRes = await fetch(url, {
        method: 'PUT',
        headers: {
          'Authorization': `token ${githubConfig.token}`,
          'Accept': 'application/vnd.github.v3+json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          message: `Auto-sync unified data: ${reports.length} reports, ${incomeRecords.length} invoices [${new Date().toLocaleString('ar-EG')}]`,
          content: contentBase64,
          branch: githubConfig.branch || 'main',
          sha
        })
      });

      if (putRes.ok) {
        setGithubConfig(prev => ({ ...prev, lastSyncAt: new Date().toLocaleString('ar-EG'), status: 'connected' }));
        logAction('SYNC', 'SECURITY', 'مزامنة النسخة الاحتياطية الموحدة مع مستودع GitHub بنجاح');
        return { success: true, message: "تمت المزامنة وحفظ البيانات سحابياً بنجاح!" };
      } else {
        const errData = await putRes.json().catch(() => ({}));
        throw new Error(errData.message || 'فشلت المزامنة مع GitHub');
      }
    } catch (err: any) {
      setGithubConfig(prev => ({ ...prev, status: 'error', errorMessage: err.message }));
      return { success: false, message: err.message || 'خطأ أثناء المزامنة' };
    }
  }, [githubConfig, reports, incomeRecords, loyaltyProfiles, inventory, dailyCloseouts, auditLogs, logAction]);

  const value: AppContextType = {
    language,
    setLanguage,
    currentUser,
    users,
    loginModalOpen,
    setLoginModalOpen,
    loginUser,
    logout,
    hasPermission,

    activeTab,
    setActiveTab,

    reports,
    selectedReportId,
    setSelectedReportId,
    selectedReport,
    addReport,
    updateReport,
    deleteReport,
    verifyReport,
    createReportFromAdmission,

    incomeRecords,
    addIncomeRecord,
    updateIncomeRecord,
    deleteIncomeRecord,
    selectedInvoice,
    setSelectedInvoice,
    financialMetrics,
    scannedBarcode: null,
    setScannedBarcode: () => {},
    setScannerOpen: setIsBarcodeScannerOpen,

    testCatalog,
    addCatalogTest,
    updateCatalogTest,
    deleteCatalogTest,
    resetCatalog,

    instruments,
    transmissions,
    toggleInstrumentStatus,
    simulateInstrumentRun,
    applyTransmissionToReport,

    loyaltyProfiles,
    loyaltyConfig,
    updateLoyaltyConfig,
    addLoyaltyProfile,
    getLoyaltyByPhone,
    calculateLoyaltyTier,
    earnLoyaltyPoints,
    redeemLoyaltyPoints,
    updateLoyaltyProfile,
    deleteLoyaltyProfile,
    deleteLoyaltyTransaction,
    retroactiveSyncAllInvoicesToLoyalty,
    addLoyaltyPoints,
    calculateCashForPoints,
    calculatePointsForAmount,

    expenses,
    addExpense,
    updateExpense,
    deleteExpense,
    profitConfig,
    updateProfitConfig,
    dailyCloseouts,
    closeoutDay,

    inventory,
    addInventoryItem,
    updateInventoryItem,
    restockItem,
    consumeReagent,
    deleteInventoryItem,

    labToLabOrders,
    addLabToLabOrder,
    updateLabToLabOrder,
    deleteLabToLabOrder,

    employees,
    attendance,
    payroll,
    addEmployee,
    updateEmployee,
    deleteEmployee,
    recordAttendance,
    generatePayrollForMonth,
    updatePayrollRecord,
    clockInEmployee,
    clockOutEmployee,

    labInfo,
    updateLabInfo,
    facilities,
    staffMembers,

    auditLogs,
    logAction,

    notifications,
    markNotificationRead,
    clearNotifications,
    addNotification,

    githubConfig,
    updateGithubConfig,
    syncUnifiedDataToGitHub,

    exportBackup,
    importBackup,
    resetToDefaultData,
    clearPatientRecordsOnly,

    isPatientFormOpen,
    setIsPatientFormOpen,
    isBarcodeScannerOpen,
    setIsBarcodeScannerOpen
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
