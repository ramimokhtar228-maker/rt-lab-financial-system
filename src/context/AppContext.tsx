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
  LoyaltyTransaction,
  LoyaltyTier
} from '../types';
import {
  INITIAL_USERS,
  INITIAL_INCOME,
  INITIAL_EXPENSES,
  INITIAL_INVENTORY,
  INITIAL_EMPLOYEES,
  INITIAL_ATTENDANCE,
  INITIAL_PAYROLL,
  INITIAL_LAB_TO_LAB,
  INITIAL_PROFIT_CONFIG,
  INITIAL_GITHUB_CONFIG,
  TEST_CATALOG,
  DEFAULT_LOYALTY_CONFIG,
  INITIAL_LOYALTY_PROFILES
} from '../data/catalog';
import {
  fetchDiagnosticCases,
  pushFinancialDataToRepo,
  testGitHubConnection,
  syncInvoiceToDiagnostic,
  DiagnosticPatientCase
} from '../utils/githubSync';
import { createEncryptedBackup, restoreEncryptedBackup } from '../utils/cryptoBackup';

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

  // Financial / Income
  incomeRecords: IncomeRecord[];
  addIncomeRecord: (record: Omit<IncomeRecord, 'id' | 'createdAt' | 'updatedAt'>) => IncomeRecord;
  updateIncomeRecord: (id: string, updates: Partial<IncomeRecord>) => void;
  deleteIncomeRecord: (id: string) => void;

  // Test Catalog Management
  testCatalog: InvoiceTestItem[];
  addCatalogTest: (test: InvoiceTestItem) => void;
  updateCatalogTest: (code: string, updates: Partial<InvoiceTestItem>) => void;
  deleteCatalogTest: (code: string) => void;
  resetCatalog: () => void;

  // Loyalty Club & Patient Cards
  loyaltyProfiles: PatientLoyaltyProfile[];
  loyaltyConfig: LoyaltyConfig;
  updateLoyaltyConfig: (config: LoyaltyConfig) => void;
  addLoyaltyProfile: (profile: PatientLoyaltyProfile) => void;
  updateLoyaltyProfile: (patientId: string, updates: Partial<PatientLoyaltyProfile>) => void;
  addLoyaltyPoints: (patientId: string, points: number, description: string, invoiceNumber?: string, amountEGP?: number) => void;
  redeemLoyaltyPoints: (patientId: string, points: number, invoiceNumber?: string) => { success: boolean; cashValue: number };
  calculatePointsForAmount: (amountEGP: number) => number;
  calculateCashForPoints: (points: number) => number;

  // Expenses & Profit
  expenses: ExpenseRecord[];
  addExpense: (expense: Omit<ExpenseRecord, 'id' | 'createdAt'>) => ExpenseRecord;
  updateExpense: (id: string, updates: Partial<ExpenseRecord>) => void;
  deleteExpense: (id: string) => void;
  profitConfig: ProfitShareConfig;
  updateProfitConfig: (config: ProfitShareConfig) => void;

  // Inventory & Chemicals
  inventory: InventoryItem[];
  addInventoryItem: (item: Omit<InventoryItem, 'id' | 'lastRestockedDate'>) => void;
  updateInventoryItem: (id: string, item: Partial<InventoryItem>) => void;
  restockItem: (id: string, addedQty: number, newCost?: number) => void;
  consumeReagent: (id: string, qty: number) => void;
  deleteInventoryItem: (id: string) => void;

  // HR & Payroll
  employees: Employee[];
  attendance: AttendanceRecord[];
  payroll: PayrollRecord[];
  addEmployee: (emp: Omit<Employee, 'id'>) => void;
  updateEmployee: (id: string, emp: Partial<Employee>) => void;
  deleteEmployee: (id: string) => void;
  recordAttendance: (employeeId: string, status: AttendanceRecord['status'], checkIn?: string, checkOut?: string, notes?: string) => void;
  generatePayrollForMonth: (monthYear: string) => void;
  updatePayrollRecord: (id: string, updates: Partial<PayrollRecord>) => void;

  // Lab to Lab
  labToLabOrders: LabToLabOrder[];
  addLabToLabOrder: (order: Omit<LabToLabOrder, 'id'>) => void;
  updateLabToLabOrder: (id: string, updates: Partial<LabToLabOrder>) => void;
  deleteLabToLabOrder: (id: string) => void;

  // Closeouts & Cash Drawer
  closeouts: DailyCloseout[];
  saveCloseout: (closeout: Omit<DailyCloseout, 'id' | 'timestamp'>) => void;

  // Audit Logs & Notifications
  auditLogs: AuditLog[];
  logAudit: (action: AuditLog['action'], module: AuditLog['module'], description: string) => void;
  notifications: AppNotification[];
  markNotificationRead: (id: string) => void;
  clearAllNotifications: () => void;

  // GitHub & Diagnostic System Integration
  githubConfig: GitHubSyncConfig;
  updateGitHubConfig: (config: Partial<GitHubSyncConfig>) => void;
  diagnosticCases: DiagnosticPatientCase[];
  isSyncing: boolean;
  pullCasesFromDiagnostic: () => Promise<{ success: boolean; message: string }>;
  pushCasesToDiagnostic: () => Promise<{ success: boolean; message: string }>;
  syncSingleInvoice: (record: IncomeRecord) => Promise<{ success: boolean; message: string }>;
  testGitHub: () => Promise<{ success: boolean; message: string }>;

  // Barcode Scanner Modal State
  scannerOpen: boolean;
  setScannerOpen: (open: boolean) => void;
  scannedBarcode: string | null;
  setScannedBarcode: (code: string | null) => void;
  handleBarcodeScanned: (code: string) => void;

  // Backup & Restore
  exportBackup: (password?: string) => Promise<string>;
  importBackup: (jsonStr: string, password?: string) => Promise<{ success: boolean; message: string }>;
  resetToDefaultData: () => void;

  // Financial Computations
  financialMetrics: {
    totalGrossIncome: number;
    totalPaidIncome: number;
    totalDeferredIncome: number;
    totalExpenses: number;
    netProfit: number;
    ceoShare: number;
    labShare: number;
    emergencyShare: number;
    todayIncome: number;
    todayExpenses: number;
  };
}

const AppContext = createContext<AppContextType | null>(null);

const STORAGE_KEYS = {
  LANGUAGE: 'rt_lab_lang',
  CURRENT_USER: 'rt_lab_user',
  INCOME: 'rt_lab_income',
  EXPENSES: 'rt_lab_expenses',
  PROFIT_CONFIG: 'rt_lab_profit_config',
  INVENTORY: 'rt_lab_inventory',
  EMPLOYEES: 'rt_lab_employees',
  ATTENDANCE: 'rt_lab_attendance',
  PAYROLL: 'rt_lab_payroll',
  LAB_TO_LAB: 'rt_lab_l2l',
  CLOSEOUTS: 'rt_lab_closeouts',
  AUDIT_LOGS: 'rt_lab_audit',
  GITHUB_CONFIG: 'rt_lab_github',
  DIAG_CASES: 'rt_lab_diag_cases',
  CATALOG: 'rt_lab_test_catalog',
  LOYALTY_PROFILES: 'rt_lab_loyalty_profiles',
  LOYALTY_CONFIG: 'rt_lab_loyalty_settings'
};

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Language
  const [language, setLanguageState] = useState<Language>(() => {
    return (localStorage.getItem(STORAGE_KEYS.LANGUAGE) as Language) || 'ar';
  });

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem(STORAGE_KEYS.LANGUAGE, lang);
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = lang;
  };

  useEffect(() => {
    document.documentElement.dir = language === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = language;
  }, [language]);

  // Auth & Roles
  const [currentUser, setCurrentUser] = useState<UserProfile>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.CURRENT_USER);
    if (saved) {
      try { return JSON.parse(saved); } catch { /* ignore */ }
    }
    return INITIAL_USERS[0]; // Default: Prof. Dr. Rami Mokhtar (CEO)
  });

  const [users] = useState<UserProfile[]>(INITIAL_USERS);
  const [loginModalOpen, setLoginModalOpen] = useState(false);

  // Active Tab
  const [activeTab, setActiveTab] = useState<string>('dashboard');

  // Scanner modal state
  const [scannerOpen, setScannerOpen] = useState(false);
  const [scannedBarcode, setScannedBarcode] = useState<string | null>(null);

  // Core Data States
  const [incomeRecords, setIncomeRecords] = useState<IncomeRecord[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.INCOME);
    if (saved) {
      try { return JSON.parse(saved); } catch { /* ignore */ }
    }
    return INITIAL_INCOME;
  });

  const [expenses, setExpenses] = useState<ExpenseRecord[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.EXPENSES);
    if (saved) {
      try { return JSON.parse(saved); } catch { /* ignore */ }
    }
    return INITIAL_EXPENSES;
  });

  const [profitConfig, setProfitConfigState] = useState<ProfitShareConfig>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.PROFIT_CONFIG);
    if (saved) {
      try { return JSON.parse(saved); } catch { /* ignore */ }
    }
    return INITIAL_PROFIT_CONFIG;
  });

  const [inventory, setInventory] = useState<InventoryItem[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.INVENTORY);
    if (saved) {
      try { return JSON.parse(saved); } catch { /* ignore */ }
    }
    return INITIAL_INVENTORY;
  });

  const [employees, setEmployees] = useState<Employee[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.EMPLOYEES);
    if (saved) {
      try { return JSON.parse(saved); } catch { /* ignore */ }
    }
    return INITIAL_EMPLOYEES;
  });

  const [attendance, setAttendance] = useState<AttendanceRecord[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.ATTENDANCE);
    if (saved) {
      try { return JSON.parse(saved); } catch { /* ignore */ }
    }
    return INITIAL_ATTENDANCE;
  });

  const [payroll, setPayroll] = useState<PayrollRecord[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.PAYROLL);
    if (saved) {
      try { return JSON.parse(saved); } catch { /* ignore */ }
    }
    return INITIAL_PAYROLL;
  });

  const [labToLabOrders, setLabToLabOrders] = useState<LabToLabOrder[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.LAB_TO_LAB);
    if (saved) {
      try { return JSON.parse(saved); } catch { /* ignore */ }
    }
    return INITIAL_LAB_TO_LAB;
  });

  const [closeouts, setCloseouts] = useState<DailyCloseout[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.CLOSEOUTS);
    if (saved) {
      try { return JSON.parse(saved); } catch { /* ignore */ }
    }
    return [];
  });

  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.AUDIT_LOGS);
    if (saved) {
      try { return JSON.parse(saved); } catch { /* ignore */ }
    }
    return [
      {
        id: 'aud-init-1',
        timestamp: new Date().toISOString(),
        userId: 'user-ceo',
        userName: 'أ.د. رامي مختار',
        userRole: 'admin_ceo',
        action: 'LOGIN',
        module: 'SECURITY',
        description: 'تسجيل دخول ناجح إلى منظومة الإدارة المالية والفوترة لمعامل RT'
      }
    ];
  });

  const [githubConfig, setGithubConfigState] = useState<GitHubSyncConfig>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.GITHUB_CONFIG);
    if (saved) {
      try { return JSON.parse(saved); } catch { /* ignore */ }
    }
    return INITIAL_GITHUB_CONFIG;
  });

  const [diagnosticCases, setDiagnosticCases] = useState<DiagnosticPatientCase[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.DIAG_CASES);
    if (saved) {
      try { return JSON.parse(saved); } catch { /* ignore */ }
    }
    return [];
  });

  const [isSyncing, setIsSyncing] = useState(false);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);

  // Catalog State
  const [testCatalog, setTestCatalog] = useState<InvoiceTestItem[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.CATALOG);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      } catch { /* ignore */ }
    }
    return TEST_CATALOG;
  });

  // Loyalty Club States
  const [loyaltyProfiles, setLoyaltyProfiles] = useState<PatientLoyaltyProfile[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.LOYALTY_PROFILES);
    if (saved) {
      try { return JSON.parse(saved); } catch { /* ignore */ }
    }
    return INITIAL_LOYALTY_PROFILES;
  });

  const [loyaltyConfig, setLoyaltyConfigState] = useState<LoyaltyConfig>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.LOYALTY_CONFIG);
    if (saved) {
      try { return JSON.parse(saved); } catch { /* ignore */ }
    }
    return DEFAULT_LOYALTY_CONFIG;
  });

  // LocalStorage Persisters
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.INCOME, JSON.stringify(incomeRecords));
  }, [incomeRecords]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.EXPENSES, JSON.stringify(expenses));
  }, [expenses]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.PROFIT_CONFIG, JSON.stringify(profitConfig));
  }, [profitConfig]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.INVENTORY, JSON.stringify(inventory));
  }, [inventory]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.EMPLOYEES, JSON.stringify(employees));
  }, [employees]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.ATTENDANCE, JSON.stringify(attendance));
  }, [attendance]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.PAYROLL, JSON.stringify(payroll));
  }, [payroll]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.LAB_TO_LAB, JSON.stringify(labToLabOrders));
  }, [labToLabOrders]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.CLOSEOUTS, JSON.stringify(closeouts));
  }, [closeouts]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.AUDIT_LOGS, JSON.stringify(auditLogs));
  }, [auditLogs]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.GITHUB_CONFIG, JSON.stringify(githubConfig));
  }, [githubConfig]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.DIAG_CASES, JSON.stringify(diagnosticCases));
  }, [diagnosticCases]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.CATALOG, JSON.stringify(testCatalog));
  }, [testCatalog]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.LOYALTY_PROFILES, JSON.stringify(loyaltyProfiles));
  }, [loyaltyProfiles]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.LOYALTY_CONFIG, JSON.stringify(loyaltyConfig));
  }, [loyaltyConfig]);

  // Audit Logging
  const logAudit = useCallback((action: AuditLog['action'], module: AuditLog['module'], description: string) => {
    const newLog: AuditLog = {
      id: `aud-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      timestamp: new Date().toISOString(),
      userId: currentUser.id,
      userName: currentUser.nameAr,
      userRole: currentUser.role,
      action,
      module,
      description
    };
    setAuditLogs(prev => [newLog, ...prev.slice(0, 199)]);
  }, [currentUser]);

  // Auth handlers
  const loginUser = (username: string, pin: string): boolean => {
    const found = users.find(u => u.username === username.trim().toLowerCase() && u.pin === pin.trim());
    if (found) {
      setCurrentUser(found);
      localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(found));
      logAudit('LOGIN', 'SECURITY', `تم تسجيل الدخول بنجاح للمستخدم: ${found.nameAr} (${found.titleAr})`);
      setLoginModalOpen(false);
      return true;
    }
    return false;
  };

  const logout = () => {
    logAudit('LOGIN', 'SECURITY', `تسجيل خروج للمستخدم: ${currentUser.nameAr}`);
    const defaultUser = INITIAL_USERS[1]; // Switch to cashier/accountant on logout
    setCurrentUser(defaultUser);
    localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(defaultUser));
  };

  // Role permissions check
  const hasPermission = (module: string): boolean => {
    if (currentUser.role === 'admin_ceo') return true; // CEO has all permissions
    switch (module) {
      case 'dashboard':
      case 'loyalty':
      case 'catalog':
        return true;
      case 'income':
      case 'billing':
        return currentUser.role === 'accountant';
      case 'expenses':
        return currentUser.role === 'accountant';
      case 'profit_share':
        return false;
      case 'inventory':
      case 'reagents':
        return currentUser.role === 'lab_tech' || currentUser.role === 'accountant';
      case 'hr':
      case 'attendance':
      case 'payroll':
        return currentUser.role === 'hr_officer';
      case 'lab_to_lab':
        return currentUser.role === 'lab_tech' || currentUser.role === 'accountant';
      case 'reports':
        return currentUser.role === 'accountant';
      case 'settings':
        return currentUser.role === 'accountant';
      default:
        return false;
    }
  };

  // Catalog methods
  const addCatalogTest = useCallback((test: InvoiceTestItem) => {
    setTestCatalog(prev => {
      const exists = prev.some(t => t.code.toLowerCase() === test.code.toLowerCase());
      if (exists) {
        return prev.map(t => t.code.toLowerCase() === test.code.toLowerCase() ? test : t);
      }
      return [test, ...prev];
    });
    logAudit('CATALOG_UPDATE', 'CATALOG', `إضافة/تحديث فحص بالكتالوج: ${test.nameAr} (${test.code}) بسعر ${test.price} ج.م`);
  }, [logAudit]);

  const updateCatalogTest = useCallback((code: string, updates: Partial<InvoiceTestItem>) => {
    setTestCatalog(prev => prev.map(t => t.code === code ? { ...t, ...updates } : t));
    logAudit('CATALOG_UPDATE', 'CATALOG', `تعديل بيانات فحص: كود (${code})`);
  }, [logAudit]);

  const deleteCatalogTest = useCallback((code: string) => {
    setTestCatalog(prev => prev.filter(t => t.code !== code));
    logAudit('DELETE', 'CATALOG', `حذف فحص من الكتالوج: كود (${code})`);
  }, [logAudit]);

  const resetCatalog = useCallback(() => {
    setTestCatalog(TEST_CATALOG);
    localStorage.setItem(STORAGE_KEYS.CATALOG, JSON.stringify(TEST_CATALOG));
    logAudit('CATALOG_UPDATE', 'CATALOG', `إعادة ضبط الكتالوج إلى القائمة الشاملة (165 فحص طبي)`);
  }, [logAudit]);

  // Loyalty calculations & methods
  const calculatePointsForAmount = useCallback((amountEGP: number) => {
    return Math.round(amountEGP * loyaltyConfig.pointsPerEGP);
  }, [loyaltyConfig]);

  const calculateCashForPoints = useCallback((points: number) => {
    return Math.round((points * (loyaltyConfig.egpPer100Points / 100)) * 100) / 100;
  }, [loyaltyConfig]);

  const getDynamicTier = useCallback((points: number): LoyaltyTier => {
    if (points >= loyaltyConfig.tiers.VIP.minPoints) return 'VIP';
    if (points >= loyaltyConfig.tiers.Platinum.minPoints) return 'Platinum';
    if (points >= loyaltyConfig.tiers.Gold.minPoints) return 'Gold';
    return 'Silver';
  }, [loyaltyConfig]);

  const updateLoyaltyConfig = useCallback((newConfig: LoyaltyConfig) => {
    setLoyaltyConfigState(newConfig);
    logAudit('UPDATE', 'LOYALTY', `تحديث إعدادات كروت الولاء وقيمة استبدال النقود ونسب الخصم`);
  }, [logAudit]);

  const addLoyaltyProfile = useCallback((profile: PatientLoyaltyProfile) => {
    setLoyaltyProfiles(prev => [profile, ...prev]);
    logAudit('CREATE', 'LOYALTY', `إصدار كرت مريض ذكي جديد للمريض: ${profile.patientName}`);
  }, [logAudit]);

  const updateLoyaltyProfile = useCallback((patientId: string, updates: Partial<PatientLoyaltyProfile>) => {
    setLoyaltyProfiles(prev => prev.map(p => {
      if (p.patientId === patientId) {
        const updated = { ...p, ...updates };
        updated.tier = getDynamicTier(updated.totalPoints);
        return updated;
      }
      return p;
    }));
  }, [getDynamicTier]);

  const addLoyaltyPoints = useCallback((patientId: string, points: number, description: string, invoiceNumber?: string, amountEGP?: number) => {
    if (points <= 0) return;
    setLoyaltyProfiles(prev => prev.map(p => {
      if (p.patientId === patientId) {
        const newTotal = p.totalPoints + points;
        const newSpent = amountEGP ? p.lifetimeSpent + amountEGP : p.lifetimeSpent;
        const newTx: LoyaltyTransaction = {
          id: `tx-${Date.now()}`,
          date: new Date().toISOString().substring(0, 10),
          type: 'earn',
          points,
          description,
          invoiceNumber,
          amountEGP
        };
        return {
          ...p,
          totalPoints: newTotal,
          tier: getDynamicTier(newTotal),
          lifetimeSpent: newSpent,
          transactions: [newTx, ...p.transactions]
        };
      }
      return p;
    }));
    logAudit('UPDATE', 'LOYALTY', `إضافة ${points} نقطة للمريض ${patientId}`);
  }, [getDynamicTier, logAudit]);

  const redeemLoyaltyPoints = useCallback((patientId: string, points: number, invoiceNumber?: string) => {
    const profile = loyaltyProfiles.find(p => p.patientId === patientId);
    if (!profile || points <= 0 || points > profile.totalPoints) {
      return { success: false, cashValue: 0 };
    }
    const cashValue = calculateCashForPoints(points);
    setLoyaltyProfiles(prev => prev.map(p => {
      if (p.patientId === patientId) {
        const newTotal = p.totalPoints - points;
        const newTx: LoyaltyTransaction = {
          id: `tx-${Date.now()}`,
          date: new Date().toISOString().substring(0, 10),
          type: 'redeem',
          points: -points,
          description: `استبدال ${points} نقطة بخصم نقدي بقيمة ${cashValue} ج.م للفاتورة ${invoiceNumber || ''}`,
          invoiceNumber
        };
        return {
          ...p,
          totalPoints: newTotal,
          tier: getDynamicTier(newTotal),
          transactions: [newTx, ...p.transactions]
        };
      }
      return p;
    }));
    logAudit('UPDATE', 'LOYALTY', `استبدال ${points} نقطة بخصم نقدي بقيمة ${cashValue} ج.م`);
    return { success: true, cashValue };
  }, [calculateCashForPoints, getDynamicTier, logAudit, loyaltyProfiles]);

  // Notifications
  useEffect(() => {
    const list: AppNotification[] = [];
    const now = new Date();

    inventory.forEach(item => {
      if (item.currentQuantity <= item.minThreshold) {
        list.push({
          id: `notif-stock-${item.id}`,
          title: language === 'ar' ? 'تنبيه نقص كواشف ومستلزمات' : 'Low Reagent Stock Alert',
          message: language === 'ar'
            ? `المادة "${item.nameAr}" متبقي منها ${item.currentQuantity} ${item.unit} فقط (الحد الأدنى ${item.minThreshold}).`
            : `Reagent "${item.nameEn}" is at ${item.currentQuantity} ${item.unit} (Threshold: ${item.minThreshold}).`,
          type: item.currentQuantity === 0 ? 'danger' : 'warning',
          timestamp: new Date().toISOString(),
          read: false,
          targetTab: 'inventory'
        });
      }

      const expiry = new Date(item.expiryDate);
      const diffDays = Math.ceil((expiry.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
      if (diffDays <= 30 && diffDays > 0) {
        list.push({
          id: `notif-exp-${item.id}`,
          title: language === 'ar' ? 'اقتراب انتهاء صلاحية كاشف' : 'Reagent Expiring Soon',
          message: language === 'ar'
            ? `كاشف "${item.nameAr}" ينتهي خلال ${diffDays} يوماً (${item.expiryDate}). Lot: ${item.lotNumber}`
            : `Reagent "${item.nameEn}" expires in ${diffDays} days (${item.expiryDate}). Lot: ${item.lotNumber}`,
          type: 'warning',
          timestamp: new Date().toISOString(),
          read: false,
          targetTab: 'inventory'
        });
      } else if (diffDays <= 0) {
        list.push({
          id: `notif-exp-past-${item.id}`,
          title: language === 'ar' ? 'كاشف منتهي الصلاحية!' : 'Expired Reagent Alert!',
          message: language === 'ar'
            ? `تنبيه حرج: المادة "${item.nameAr}" منتهية الصلاحية (${item.expiryDate}). يرجى استبعادها فوراً.`
            : `Critical: "${item.nameEn}" is expired (${item.expiryDate}). Remove from testing.`,
          type: 'danger',
          timestamp: new Date().toISOString(),
          read: false,
          targetTab: 'inventory'
        });
      }
    });

    const unpaidSum = incomeRecords
      .filter(r => r.paymentStatus !== 'paid' && r.remainingAmount > 0)
      .reduce((sum, r) => sum + r.remainingAmount, 0);

    if (unpaidSum > 0) {
      list.push({
        id: 'notif-unpaid-debts',
        title: language === 'ar' ? 'مستحقات وفواتير آجلة' : 'Pending Patient Balances',
        message: language === 'ar'
          ? `يوجد إجمالي متبقيات آجلة على المرضى بقيمة ${unpaidSum.toLocaleString()} ج.م.`
          : `Total pending receivable balance from patients is ${unpaidSum.toLocaleString()} EGP.`,
        type: 'info',
        timestamp: new Date().toISOString(),
        read: false,
        targetTab: 'income'
      });
    }

    setNotifications(list);
  }, [inventory, incomeRecords, language]);

  const markNotificationRead = (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };

  const clearAllNotifications = () => {
    setNotifications([]);
  };

  // Financial Metrics
  const financialMetrics = useMemo(() => {
    const totalGrossIncome = incomeRecords.reduce((acc, r) => acc + r.subtotal, 0);
    const totalPaidIncome = incomeRecords.reduce((acc, r) => acc + r.paidAmount, 0);
    const totalDeferredIncome = incomeRecords.reduce((acc, r) => acc + r.remainingAmount, 0);
    const totalExpenses = expenses.reduce((acc, e) => acc + e.amount, 0);

    const calculationBase = profitConfig.calculationBase === 'gross_income'
      ? totalPaidIncome
      : Math.max(0, totalPaidIncome - totalExpenses);

    const ceoShare = (calculationBase * profitConfig.ceoPercentage) / 100;
    const labShare = (calculationBase * profitConfig.labPercentage) / 100;
    const emergencyShare = (calculationBase * profitConfig.emergencyFundPercentage) / 100;

    const todayStr = new Date().toISOString().split('T')[0];
    const todayIncome = incomeRecords
      .filter(r => r.createdAt.startsWith(todayStr))
      .reduce((acc, r) => acc + r.paidAmount, 0);

    const todayExpenses = expenses
      .filter(e => e.date === todayStr)
      .reduce((acc, e) => acc + e.amount, 0);

    return {
      totalGrossIncome,
      totalPaidIncome,
      totalDeferredIncome,
      totalExpenses,
      netProfit: totalPaidIncome - totalExpenses,
      ceoShare,
      labShare,
      emergencyShare,
      todayIncome,
      todayExpenses
    };
  }, [incomeRecords, expenses, profitConfig]);

  // Income Operations
  const addIncomeRecord = (recordData: Omit<IncomeRecord, 'id' | 'createdAt' | 'updatedAt'>): IncomeRecord => {
    const id = `inc-${Date.now()}`;
    const now = new Date().toISOString();
    const newRecord: IncomeRecord = {
      ...recordData,
      id,
      createdAt: now,
      updatedAt: now
    };

    setIncomeRecords(prev => [newRecord, ...prev]);
    logAudit('CREATE', 'INCOME', `تسجيل إيراد وفاتورة مريض جديدة: ${newRecord.patientName} (${newRecord.invoiceNumber}) بمبلغ ${newRecord.netAmount} ج.م`);

    // Auto-award points if patient phone matches loyalty profile
    if (newRecord.paidAmount > 0 && newRecord.patientPhone) {
      const match = loyaltyProfiles.find(p => p.phone === newRecord.patientPhone || (p.patientName && p.patientName === newRecord.patientName));
      if (match) {
        const pts = calculatePointsForAmount(newRecord.paidAmount);
        addLoyaltyPoints(match.patientId, pts, `نقاط فاتورة التحاليل ${newRecord.invoiceNumber}`, newRecord.invoiceNumber, newRecord.paidAmount);
      }
    }

    // Instant Multi-layer Sync to Diagnostic System (localStorage, BroadcastChannel, and GitHub)
    syncInvoiceToDiagnostic(newRecord, githubConfig).catch(err => {
      console.warn('Sync to diagnostic error:', err);
    });

    if (githubConfig.autoSync) {
      setTimeout(() => {
        pushCasesToDiagnostic().catch(() => {});
      }, 300);
    }

    return newRecord;
  };

  const updateIncomeRecord = (id: string, updates: Partial<IncomeRecord>) => {
    setIncomeRecords(prev => prev.map(rec => {
      if (rec.id === id) {
        const updated = { ...rec, ...updates, updatedAt: new Date().toISOString() };
        logAudit('UPDATE', 'INCOME', `تعديل بيانات الفاتورة: ${updated.invoiceNumber} للمريض ${updated.patientName}`);
        syncInvoiceToDiagnostic(updated, githubConfig).catch(() => {});
        return updated;
      }
      return rec;
    }));
  };

  const deleteIncomeRecord = (id: string) => {
    const target = incomeRecords.find(r => r.id === id);
    if (!target) return;
    setIncomeRecords(prev => prev.filter(r => r.id !== id));
    logAudit('DELETE', 'INCOME', `حذف فاتورة المريض: ${target.patientName} (${target.invoiceNumber}) بمبلغ ${target.netAmount} ج.م`);
  };

  // Expenses Operations
  const addExpense = (expenseData: Omit<ExpenseRecord, 'id' | 'createdAt'>): ExpenseRecord => {
    const id = `exp-${Date.now()}`;
    const newExpense: ExpenseRecord = {
      ...expenseData,
      id,
      createdAt: new Date().toISOString()
    };
    setExpenses(prev => [newExpense, ...prev]);
    logAudit('CREATE', 'EXPENSES', `تسجيل بند مصروف جديد: ${newExpense.title} بمبلغ ${newExpense.amount} ج.م (${newExpense.category})`);
    return newExpense;
  };

  const updateExpense = (id: string, updates: Partial<ExpenseRecord>) => {
    setExpenses(prev => prev.map(exp => {
      if (exp.id === id) {
        const updated = { ...exp, ...updates };
        logAudit('UPDATE', 'EXPENSES', `تعديل سند الصرف: ${updated.expenseNumber} - ${updated.title}`);
        return updated;
      }
      return exp;
    }));
  };

  const deleteExpense = (id: string) => {
    const target = expenses.find(e => e.id === id);
    if (!target) return;
    setExpenses(prev => prev.filter(e => e.id !== id));
    logAudit('DELETE', 'EXPENSES', `حذف سند الصرف: ${target.expenseNumber} - ${target.title} بقيمة ${target.amount} ج.م`);
  };

  const updateProfitConfig = (config: ProfitShareConfig) => {
    setProfitConfigState(config);
    logAudit('UPDATE', 'SETTINGS', `تعديل نسب توزيع الأرباح: المعمل ${config.labPercentage}% - الإدارة ${config.ceoPercentage}%`);
  };

  // Inventory Operations
  const addInventoryItem = (itemData: Omit<InventoryItem, 'id' | 'lastRestockedDate'>) => {
    const newItem: InventoryItem = {
      ...itemData,
      id: `inv-${Date.now()}`,
      lastRestockedDate: new Date().toISOString().split('T')[0]
    };
    setInventory(prev => [newItem, ...prev]);
    logAudit('CREATE', 'INVENTORY', `إضافة صنف جديد للمخزن: ${newItem.nameAr} (${newItem.code})`);
  };

  const updateInventoryItem = (id: string, updates: Partial<InventoryItem>) => {
    setInventory(prev => prev.map(i => {
      if (i.id === id) {
        const updated = { ...i, ...updates };
        logAudit('UPDATE', 'INVENTORY', `تعديل بيانات الصنف المخزني: ${updated.nameAr}`);
        return updated;
      }
      return i;
    }));
  };

  const restockItem = (id: string, addedQty: number, newCost?: number) => {
    setInventory(prev => prev.map(item => {
      if (item.id === id) {
        const updatedQty = item.currentQuantity + addedQty;
        const updatedCost = newCost !== undefined ? newCost : item.costPerUnit;
        logAudit('UPDATE', 'INVENTORY', `توريد واستلام كمية ${addedQty} ${item.unit} من صنف "${item.nameAr}"`);
        return {
          ...item,
          currentQuantity: updatedQty,
          costPerUnit: updatedCost,
          lastRestockedDate: new Date().toISOString().split('T')[0]
        };
      }
      return item;
    }));
  };

  const consumeReagent = (id: string, qty: number) => {
    setInventory(prev => prev.map(item => {
      if (item.id === id) {
        const updatedQty = Math.max(0, item.currentQuantity - qty);
        logAudit('UPDATE', 'INVENTORY', `صرف واستهلاك ${qty} ${item.unit} من كاشف "${item.nameAr}" للتشغيل المعملي`);
        return {
          ...item,
          currentQuantity: updatedQty
        };
      }
      return item;
    }));
  };

  const deleteInventoryItem = (id: string) => {
    const target = inventory.find(i => i.id === id);
    if (!target) return;
    setInventory(prev => prev.filter(i => i.id !== id));
    logAudit('DELETE', 'INVENTORY', `حذف صنف من المخزن: ${target.nameAr} (${target.code})`);
  };

  // HR Operations
  const addEmployee = (empData: Omit<Employee, 'id'>) => {
    const newEmp: Employee = {
      ...empData,
      id: `emp-${Date.now()}`
    };
    setEmployees(prev => [...prev, newEmp]);
    logAudit('CREATE', 'HR', `إضافة موظف جديد: ${newEmp.fullName} (${newEmp.jobTitleAr})`);
  };

  const updateEmployee = (id: string, updates: Partial<Employee>) => {
    setEmployees(prev => prev.map(e => e.id === id ? { ...e, ...updates } : e));
    logAudit('UPDATE', 'HR', `تعديل بيانات الموظف: ${updates.fullName || id}`);
  };

  const deleteEmployee = (id: string) => {
    setEmployees(prev => prev.filter(e => e.id !== id));
    logAudit('DELETE', 'HR', `حذف ملف الموظف كود: ${id}`);
  };

  const recordAttendance = (
    employeeId: string,
    status: AttendanceRecord['status'],
    checkIn?: string,
    checkOut?: string,
    notes?: string
  ) => {
    const emp = employees.find(e => e.id === employeeId);
    if (!emp) return;

    const today = new Date().toISOString().split('T')[0];
    const newRecord: AttendanceRecord = {
      id: `att-${Date.now()}`,
      employeeId,
      employeeName: emp.fullName,
      date: today,
      checkInTime: checkIn || '09:00',
      checkOutTime: checkOut || '17:00',
      status,
      hoursWorked: status === 'present' ? emp.shiftHours : 0,
      overtimeHours: 0,
      notes
    };

    setAttendance(prev => {
      const filtered = prev.filter(a => !(a.employeeId === employeeId && a.date === today));
      return [newRecord, ...filtered];
    });

    logAudit('CREATE', 'HR', `تسجيل حضور/انصراف للموظف: ${emp.fullName} بتاريخ ${today} - الحالة: ${status}`);
  };

  const generatePayrollForMonth = (monthYear: string) => {
    const newPayrollList: PayrollRecord[] = employees.filter(e => e.isActive).map(emp => {
      return {
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
      };
    });

    setPayroll(prev => {
      const existingOtherMonths = prev.filter(p => p.monthYear !== monthYear);
      return [...newPayrollList, ...existingOtherMonths];
    });

    logAudit('CREATE', 'HR', `إعداد مسودة كشف المرتبات لشهر ${monthYear}`);
  };

  const updatePayrollRecord = (id: string, updates: Partial<PayrollRecord>) => {
    setPayroll(prev => prev.map(p => {
      if (p.id === id) {
        const merged = { ...p, ...updates };
        merged.netSalary = merged.basicSalary + merged.bonusAmount + merged.overtimePay - merged.deductionAmount - merged.advancePayment;
        return merged;
      }
      return p;
    }));
  };

  // Lab to Lab Operations
  const addLabToLabOrder = (orderData: Omit<LabToLabOrder, 'id'>) => {
    const newOrder: LabToLabOrder = {
      ...orderData,
      id: `l2l-${Date.now()}`
    };
    setLabToLabOrders(prev => [newOrder, ...prev]);
    logAudit('CREATE', 'LAB_TO_LAB', `إرسال عينات لمعمل خارجي: ${newOrder.externalLabName} للمريض ${newOrder.patientName} (${newOrder.orderNumber})`);
  };

  const updateLabToLabOrder = (id: string, updates: Partial<LabToLabOrder>) => {
    setLabToLabOrders(prev => prev.map(o => o.id === id ? { ...o, ...updates } : o));
    logAudit('UPDATE', 'LAB_TO_LAB', `تحديث حالة طلب المعامل الخارجية: ${id}`);
  };

  const deleteLabToLabOrder = (id: string) => {
    setLabToLabOrders(prev => prev.filter(o => o.id !== id));
    logAudit('DELETE', 'LAB_TO_LAB', `حذف طلب معمل خارجي: ${id}`);
  };

  // Closeouts
  const saveCloseout = (data: Omit<DailyCloseout, 'id' | 'timestamp'>) => {
    const newCloseout: DailyCloseout = {
      ...data,
      id: `cls-${Date.now()}`,
      timestamp: new Date().toISOString()
    };
    setCloseouts(prev => [newCloseout, ...prev]);
    logAudit('CLOSEOUT', 'INCOME', `تقفيل الخزينة اليومية بتاريخ ${newCloseout.date} بواسطة ${newCloseout.closedBy} - الفارق: ${newCloseout.discrepancy} ج.م`);
  };

  // Barcode Handler
  const handleBarcodeScanned = (code: string) => {
    setScannedBarcode(code);
    setScannerOpen(false);

    // Look for matching invoice
    const foundIncome = incomeRecords.find(r => r.barcode === code || r.labNumber === code);
    if (foundIncome) {
      setActiveTab('income');
      return;
    }

    // Look for matching inventory reagent
    const foundItem = inventory.find(i => i.code === code || i.lotNumber === code);
    if (foundItem) {
      setActiveTab('inventory');
      return;
    }

    // Look for loyalty card
    const foundLoyalty = loyaltyProfiles.find(p => p.barcode === code);
    if (foundLoyalty) {
      setActiveTab('loyalty');
      return;
    }

    alert(language === 'ar' ? `الباركود المقروء: ${code} - لم يتم العثور على سجل مطابق` : `Scanned Barcode: ${code} - No matching record`);
  };

  // GitHub & Diagnostic Sync Handlers
  const updateGitHubConfig = (cfg: Partial<GitHubSyncConfig>) => {
    setGithubConfigState(prev => ({ ...prev, ...cfg }));
    logAudit('UPDATE', 'SETTINGS', `تحديث إعدادات ربط GitHub والمزامنة`);
  };

  const pullCasesFromDiagnostic = async () => {
    setIsSyncing(true);
    try {
      const result = await fetchDiagnosticCases(githubConfig.token, githubConfig.repoOwner, githubConfig.repoName);
      if (result.success && result.casesFound) {
        setDiagnosticCases(result.casesFound);
        setGithubConfigState(prev => ({
          ...prev,
          lastSyncAt: new Date().toISOString(),
          status: 'connected',
          errorMessage: undefined
        }));
        logAudit('SYNC', 'INCOME', `تمت المزامنة بنجاح مع منظومة النتائج: استلام ${result.casesFound.length} حالة فحص`);
        return { success: true, message: `تم جلب ${result.casesFound.length} حالة بنجاح من منظومة النتائج` };
      } else {
        setGithubConfigState(prev => ({ ...prev, status: 'error', errorMessage: result.message }));
        return { success: false, message: result.message || 'فشل الاتصال بمنظومة النتائج' };
      }
    } finally {
      setIsSyncing(false);
    }
  };

  const pushCasesToDiagnostic = async () => {
    setIsSyncing(true);
    try {
      const result = await pushFinancialDataToRepo(
        githubConfig.token,
        githubConfig.repoOwner,
        githubConfig.repoName,
        incomeRecords,
        {
          totalRevenue: financialMetrics.totalPaidIncome,
          totalExpenses: financialMetrics.totalExpenses,
          netProfit: financialMetrics.netProfit,
          ceoShare: financialMetrics.ceoShare,
          labShare: financialMetrics.labShare,
          casesCount: incomeRecords.length
        }
      );
      if (result.success) {
        setGithubConfigState(prev => ({
          ...prev,
          lastSyncAt: new Date().toISOString(),
          status: 'connected',
          errorMessage: undefined
        }));
        logAudit('SYNC', 'INCOME', `تم إرسال وتسميع بيانات السداد المالي بنجاح إلى منظومة النتائج`);
        return { success: true, message: 'تم إرسال الفواتير والمقبوضات بنجاح إلى منظومة النتائج' };
      } else {
        setGithubConfigState(prev => ({ ...prev, status: 'error', errorMessage: result.message }));
        return { success: false, message: result.message || 'تعذر الإرسال إلى مستودع GitHub' };
      }
    } finally {
      setIsSyncing(false);
    }
  };

  const syncSingleInvoice = async (record: IncomeRecord) => {
    setIsSyncing(true);
    try {
      const res = await syncInvoiceToDiagnostic(record, githubConfig);
      if (res.success) {
        logAudit('SYNC', 'INCOME', `تم تسميع طلب الفاتورة ${record.invoiceNumber} للمريض ${record.patientName} في منظومة النتائج بنجاح`);
      }
      return res;
    } finally {
      setIsSyncing(false);
    }
  };

  const testGitHub = async () => {
    setIsSyncing(true);
    try {
      const res = await testGitHubConnection(githubConfig.token, githubConfig.repoOwner, githubConfig.repoName);
      if (res.success) {
        setGithubConfigState(prev => ({ ...prev, status: 'connected', errorMessage: undefined }));
        return { success: true, message: 'تم التحقق بنجاح من صحة الاتصال بـ GitHub' };
      } else {
        setGithubConfigState(prev => ({ ...prev, status: 'error', errorMessage: res.message }));
        return { success: false, message: res.message || 'فشل الاتصال بـ GitHub' };
      }
    } finally {
      setIsSyncing(false);
    }
  };

  // Backups
  const exportBackup = async (password?: string): Promise<string> => {
    const backupData = {
      app: 'RT_LAB_FINANCIAL_ERP',
      version: '2.5.0',
      exportedAt: new Date().toISOString(),
      exportedBy: currentUser.nameAr,
      incomeRecords,
      expenses,
      profitConfig,
      inventory,
      employees,
      attendance,
      payroll,
      labToLabOrders,
      closeouts,
      auditLogs,
      testCatalog,
      loyaltyProfiles,
      loyaltyConfig
    };
    const result = await createEncryptedBackup(backupData, password);
    logAudit('BACKUP', 'SETTINGS', `تصدير نسخة احتياطية مشفرة من قاعدة البيانات`);
    return result;
  };

  const importBackup = async (encryptedStr: string, password?: string): Promise<{ success: boolean; message: string }> => {
    try {
      const res = await restoreEncryptedBackup(encryptedStr, password);
      if (!res.success || !res.data) {
        return { success: false, message: res.message || 'فشل استرجاع النسخة الاحتياطية' };
      }
      const parsed = res.data as Record<string, any>;

      if (parsed.incomeRecords) setIncomeRecords(parsed.incomeRecords);
      if (parsed.expenses) setExpenses(parsed.expenses);
      if (parsed.profitConfig) setProfitConfigState(parsed.profitConfig);
      if (parsed.inventory) setInventory(parsed.inventory);
      if (parsed.employees) setEmployees(parsed.employees);
      if (parsed.attendance) setAttendance(parsed.attendance);
      if (parsed.payroll) setPayroll(parsed.payroll);
      if (parsed.labToLabOrders) setLabToLabOrders(parsed.labToLabOrders);
      if (parsed.closeouts) setCloseouts(parsed.closeouts);
      if (parsed.testCatalog) setTestCatalog(parsed.testCatalog);
      if (parsed.loyaltyProfiles) setLoyaltyProfiles(parsed.loyaltyProfiles);
      if (parsed.loyaltyConfig) setLoyaltyConfigState(parsed.loyaltyConfig);

      logAudit('BACKUP', 'SETTINGS', `استرجاع ناجح لقاعدة البيانات من نسخة احتياطية`);
      return { success: true, message: 'تم استرجاع كافة البيانات بنجاح' };
    } catch {
      return { success: false, message: 'فشل استرجاع النسخة الاحتياطية (تأكد من كلمة المرور وصحة الملف)' };
    }
  };

  const resetToDefaultData = () => {
    setIncomeRecords(INITIAL_INCOME);
    setExpenses(INITIAL_EXPENSES);
    setProfitConfigState(INITIAL_PROFIT_CONFIG);
    setInventory(INITIAL_INVENTORY);
    setEmployees(INITIAL_EMPLOYEES);
    setAttendance(INITIAL_ATTENDANCE);
    setPayroll(INITIAL_PAYROLL);
    setLabToLabOrders(INITIAL_LAB_TO_LAB);
    setCloseouts([]);
    setTestCatalog(TEST_CATALOG);
    setLoyaltyProfiles(INITIAL_LOYALTY_PROFILES);
    setLoyaltyConfigState(DEFAULT_LOYALTY_CONFIG);
    logAudit('BACKUP', 'SETTINGS', `إعادة ضبط النظام كاملاً للبيانات الافتراضية`);
  };

  return (
    <AppContext.Provider
      value={{
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
        incomeRecords,
        addIncomeRecord,
        updateIncomeRecord,
        deleteIncomeRecord,
        testCatalog,
        addCatalogTest,
        updateCatalogTest,
        deleteCatalogTest,
        resetCatalog,
        loyaltyProfiles,
        loyaltyConfig,
        updateLoyaltyConfig,
        addLoyaltyProfile,
        updateLoyaltyProfile,
        addLoyaltyPoints,
        redeemLoyaltyPoints,
        calculatePointsForAmount,
        calculateCashForPoints,
        expenses,
        addExpense,
        updateExpense,
        deleteExpense,
        profitConfig,
        updateProfitConfig,
        inventory,
        addInventoryItem,
        updateInventoryItem,
        restockItem,
        consumeReagent,
        deleteInventoryItem,
        employees,
        attendance,
        payroll,
        addEmployee,
        updateEmployee,
        deleteEmployee,
        recordAttendance,
        generatePayrollForMonth,
        updatePayrollRecord,
        labToLabOrders,
        addLabToLabOrder,
        updateLabToLabOrder,
        deleteLabToLabOrder,
        closeouts,
        saveCloseout,
        auditLogs,
        logAudit,
        notifications,
        markNotificationRead,
        clearAllNotifications,
        githubConfig,
        updateGitHubConfig,
        diagnosticCases,
        isSyncing,
        pullCasesFromDiagnostic,
        pushCasesToDiagnostic,
        syncSingleInvoice,
        testGitHub,
        scannerOpen,
        setScannerOpen,
        scannedBarcode,
        setScannedBarcode,
        handleBarcodeScanned,
        exportBackup,
        importBackup,
        resetToDefaultData,
        financialMetrics
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
