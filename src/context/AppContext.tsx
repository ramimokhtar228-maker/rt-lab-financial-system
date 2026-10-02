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
  DailyCloseout
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
  INITIAL_GITHUB_CONFIG
} from '../data/catalog';
import {
  fetchDiagnosticCases,
  pushFinancialDataToRepo,
  testGitHubConnection,
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
  DIAG_CASES: 'rt_lab_diag_cases'
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
        id: 'aud-1',
        timestamp: new Date().toISOString(),
        userId: INITIAL_USERS[0].id,
        userName: INITIAL_USERS[0].nameAr,
        userRole: 'admin_ceo',
        action: 'LOGIN',
        module: 'SECURITY',
        description: 'تسجيل دخول ناجح إلى منظومة الإدارة المالية لمعامل RT'
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
      case 'income':
      case 'billing':
        return currentUser.role === 'accountant';
      case 'expenses':
        return currentUser.role === 'accountant';
      case 'profit_share':
        return false; // Profit share and CEO % is CEO only
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
      case 'security':
        return false;
      case 'sync':
        return true;
      default:
        return true;
    }
  };

  // Dynamic Alerts & Notifications generation
  useEffect(() => {
    const list: AppNotification[] = [];
    const now = new Date();

    // 1. Inventory low stock and expiry check
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

    // 2. Unpaid patient balances check
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

    // 3. Lab-to-Lab pending samples
    const pendingL2L = labToLabOrders.filter(o => o.resultStatus === 'sent' || o.resultStatus === 'processing');
    if (pendingL2L.length > 0) {
      list.push({
        id: 'notif-l2l-pending',
        title: language === 'ar' ? 'عينات محولة لمعامل خارجية' : 'External Lab Pending Samples',
        message: language === 'ar'
          ? `يوجد ${pendingL2L.length} عينة بانتظار استلام النتائج من المعامل المحال إليها.`
          : `${pendingL2L.length} samples awaiting results from referral labs.`,
        type: 'info',
        timestamp: new Date().toISOString(),
        read: false,
        targetTab: 'lab_to_lab'
      });
    }

    setNotifications(list);
  }, [inventory, incomeRecords, labToLabOrders, language]);

  const markNotificationRead = (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };

  const clearAllNotifications = () => {
    setNotifications([]);
  };

  // Financial Computations
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

    // Auto-sync to GitHub Diagnostic system if enabled
    if (githubConfig.autoSync && githubConfig.token) {
      setTimeout(() => {
        pushCasesToDiagnostic().catch(() => {/* background attempt */});
      }, 500);
    }

    return newRecord;
  };

  const updateIncomeRecord = (id: string, updates: Partial<IncomeRecord>) => {
    setIncomeRecords(prev => prev.map(rec => {
      if (rec.id === id) {
        const updated = { ...rec, ...updates, updatedAt: new Date().toISOString() };
        logAudit('UPDATE', 'INCOME', `تعديل بيانات الفاتورة: ${updated.invoiceNumber} للمريض ${updated.patientName}`);
        return updated;
      }
      return rec;
    }));
  };

  const deleteIncomeRecord = (id: string) => {
    const target = incomeRecords.find(r => r.id === id);
    if (target) {
      setIncomeRecords(prev => prev.filter(r => r.id !== id));
      logAudit('DELETE', 'INCOME', `حذف الفاتورة رقم ${target.invoiceNumber} للمريض ${target.patientName}`);
    }
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
    logAudit('CREATE', 'EXPENSES', `تسجيل مصروف جديد: ${newExpense.title} بقيمة ${newExpense.amount} ج.م (${newExpense.paidTo})`);
    return newExpense;
  };

  const deleteExpense = (id: string) => {
    const target = expenses.find(e => e.id === id);
    if (target) {
      setExpenses(prev => prev.filter(e => e.id !== id));
      logAudit('DELETE', 'EXPENSES', `حذف مصروف: ${target.title} بقيمة ${target.amount} ج.م`);
    }
  };

  const updateProfitConfig = (config: ProfitShareConfig) => {
    setProfitConfigState(config);
    logAudit('UPDATE', 'SETTINGS', `تعديل نسب توزيع الأرباح: نسبة CEO ${config.ceoPercentage}% - نسبة المعمل ${config.labPercentage}%`);
  };

  // Inventory Operations
  const addInventoryItem = (itemData: Omit<InventoryItem, 'id' | 'lastRestockedDate'>) => {
    const id = `inv-${Date.now()}`;
    const newItem: InventoryItem = {
      ...itemData,
      id,
      lastRestockedDate: new Date().toISOString().split('T')[0]
    };
    setInventory(prev => [newItem, ...prev]);
    logAudit('CREATE', 'INVENTORY', `إضافة كاشف/مستلزم جديد: ${newItem.nameAr} كود ${newItem.itemCode}`);
  };

  const updateInventoryItem = (id: string, updates: Partial<InventoryItem>) => {
    setInventory(prev => prev.map(item => {
      if (item.id === id) {
        return { ...item, ...updates };
      }
      return item;
    }));
    logAudit('UPDATE', 'INVENTORY', `تحديث بيانات المادة المخزنية: ${id}`);
  };

  const restockItem = (id: string, addedQty: number, newCost?: number) => {
    setInventory(prev => prev.map(item => {
      if (item.id === id) {
        const newQty = item.currentQuantity + addedQty;
        logAudit('UPDATE', 'INVENTORY', `توريد مخزني للمادة "${item.nameAr}": إضافة ${addedQty} ${item.unit} (الرصيد الجديد: ${newQty})`);
        return {
          ...item,
          currentQuantity: newQty,
          unitCost: newCost !== undefined ? newCost : item.unitCost,
          lastRestockedDate: new Date().toISOString().split('T')[0]
        };
      }
      return item;
    }));
  };

  const consumeReagent = (id: string, qty: number) => {
    setInventory(prev => prev.map(item => {
      if (item.id === id) {
        const newQty = Math.max(0, item.currentQuantity - qty);
        logAudit('UPDATE', 'INVENTORY', `صرف واستهلاك مخبري للمادة "${item.nameAr}": ${qty} ${item.unit}`);
        return { ...item, currentQuantity: newQty };
      }
      return item;
    }));
  };

  const deleteInventoryItem = (id: string) => {
    const target = inventory.find(i => i.id === id);
    if (target) {
      setInventory(prev => prev.filter(i => i.id !== id));
      logAudit('DELETE', 'INVENTORY', `حذف مادة من المخزن: ${target.nameAr}`);
    }
  };

  // HR & Payroll Operations
  const addEmployee = (empData: Omit<Employee, 'id'>) => {
    const id = `emp-${Date.now()}`;
    const newEmp: Employee = { ...empData, id };
    setEmployees(prev => [...prev, newEmp]);
    logAudit('CREATE', 'HR', `إضافة موظف جديد: ${newEmp.fullName} (${newEmp.jobTitleAr})`);
  };

  const updateEmployee = (id: string, updates: Partial<Employee>) => {
    setEmployees(prev => prev.map(emp => {
      if (emp.id === id) {
        return { ...emp, ...updates };
      }
      return emp;
    }));
    logAudit('UPDATE', 'HR', `تعديل بيانات الموظف: ${id}`);
  };

  const recordAttendance = (
    employeeId: string,
    status: AttendanceRecord['status'],
    checkIn = '08:00',
    checkOut?: string,
    notes?: string
  ) => {
    const emp = employees.find(e => e.id === employeeId);
    if (!emp) return;

    const today = new Date().toISOString().split('T')[0];
    const existingIndex = attendance.findIndex(a => a.employeeId === employeeId && a.date === today);

    let hoursWorked = 8;
    let overtimeHours = 0;
    if (checkOut) {
      const [inH, inM] = checkIn.split(':').map(Number);
      const [outH, outM] = checkOut.split(':').map(Number);
      const diffM = (outH * 60 + outM) - (inH * 60 + inM);
      hoursWorked = Math.max(0, Math.round((diffM / 60) * 10) / 10);
      overtimeHours = Math.max(0, hoursWorked - emp.shiftHours);
    }

    if (existingIndex >= 0) {
      setAttendance(prev => {
        const copy = [...prev];
        copy[existingIndex] = {
          ...copy[existingIndex],
          status,
          checkInTime: checkIn,
          checkOutTime: checkOut,
          hoursWorked,
          overtimeHours,
          notes
        };
        return copy;
      });
      logAudit('UPDATE', 'HR', `تحديث حضور الموظف: ${emp.fullName} - الحالة: ${status}`);
    } else {
      const newRec: AttendanceRecord = {
        id: `att-${Date.now()}`,
        employeeId,
        employeeName: emp.fullName,
        date: today,
        checkInTime: checkIn,
        checkOutTime: checkOut,
        status,
        hoursWorked,
        overtimeHours,
        notes
      };
      setAttendance(prev => [newRec, ...prev]);
      logAudit('CREATE', 'HR', `تسجيل حضور الموظف: ${emp.fullName} - ${checkIn} (${status})`);
    }
  };

  const generatePayrollForMonth = (monthYear: string) => {
    const newRecords: PayrollRecord[] = employees.filter(e => e.isActive).map(emp => {
      // Find any existing record for this month
      const existing = payroll.find(p => p.employeeId === emp.id && p.monthYear === monthYear);
      if (existing) return existing;

      // Calculate overtime bonus from attendance
      const monthAttendance = attendance.filter(a => a.employeeId === emp.id && a.date.startsWith(monthYear));
      const totalOvertimeHours = monthAttendance.reduce((sum, a) => sum + (a.overtimeHours || 0), 0);
      const hourlyRate = (emp.basicSalary / 30) / emp.shiftHours;
      const overtimePay = Math.round(totalOvertimeHours * hourlyRate * 1.5);

      const bonusAmount = 0;
      const deductionAmount = 0;
      const advancePayment = 0;
      const netSalary = emp.basicSalary + overtimePay + bonusAmount - deductionAmount - advancePayment;

      return {
        id: `pay-${monthYear}-${emp.id}`,
        monthYear,
        employeeId: emp.id,
        employeeName: emp.fullName,
        basicSalary: emp.basicSalary,
        bonusAmount,
        deductionAmount,
        advancePayment,
        overtimePay,
        netSalary,
        paymentStatus: 'draft'
      };
    });

    setPayroll(prev => {
      const filtered = prev.filter(p => p.monthYear !== monthYear);
      return [...newRecords, ...filtered];
    });

    logAudit('CREATE', 'HR', `إنشاء مسير رواتب موظفي المعمل لشهر ${monthYear}`);
  };

  const updatePayrollRecord = (id: string, updates: Partial<PayrollRecord>) => {
    setPayroll(prev => prev.map(rec => {
      if (rec.id === id) {
        const merged = { ...rec, ...updates };
        merged.netSalary = merged.basicSalary + (merged.bonusAmount || 0) + (merged.overtimePay || 0) - (merged.deductionAmount || 0) - (merged.advancePayment || 0);
        return merged;
      }
      return rec;
    }));
    logAudit('UPDATE', 'HR', `تعديل مفردات راتب: ${id}`);
  };

  // Lab to Lab Operations
  const addLabToLabOrder = (orderData: Omit<LabToLabOrder, 'id'>) => {
    const id = `l2l-${Date.now()}`;
    const newOrder: LabToLabOrder = { ...orderData, id };
    setLabToLabOrders(prev => [newOrder, ...prev]);
    logAudit('CREATE', 'LAB_TO_LAB', `إرسال عينة إلى معمل خارجي (${newOrder.externalLabName}): مريض ${newOrder.patientName}`);
  };

  const updateLabToLabOrder = (id: string, updates: Partial<LabToLabOrder>) => {
    setLabToLabOrders(prev => prev.map(order => {
      if (order.id === id) {
        const updated = { ...order, ...updates };
        updated.profitMargin = updated.patientChargedPrice - updated.outsourcedCost;
        return updated;
      }
      return order;
    }));
    logAudit('UPDATE', 'LAB_TO_LAB', `تحديث حالة عينة Lab-to-Lab: ${id}`);
  };

  // Daily Closeout
  const saveCloseout = (data: Omit<DailyCloseout, 'id' | 'timestamp'>) => {
    const id = `close-${Date.now()}`;
    const newCloseout: DailyCloseout = {
      ...data,
      id,
      timestamp: new Date().toISOString()
    };
    setCloseouts(prev => [newCloseout, ...prev]);
    logAudit('CLOSEOUT', 'EXPENSES', `تقفيل الوردية والخزينة اليومية لتاريخ ${newCloseout.date} بواسطة ${newCloseout.closedBy} - العجز/الزيادة: ${newCloseout.discrepancy} ج.م`);
  };

  // GitHub Diagnostic System Sync
  const updateGitHubConfig = (cfg: Partial<GitHubSyncConfig>) => {
    setGithubConfigState(prev => ({ ...prev, ...cfg }));
  };

  const testGitHub = async (): Promise<{ success: boolean; message: string }> => {
    const result = await testGitHubConnection(
      githubConfig.token,
      githubConfig.repoOwner,
      githubConfig.repoName
    );
    setGithubConfigState(prev => ({
      ...prev,
      status: result.success ? 'connected' : 'error',
      errorMessage: result.success ? undefined : result.message
    }));
    return result;
  };

  const pullCasesFromDiagnostic = async (): Promise<{ success: boolean; message: string }> => {
    setIsSyncing(true);
    try {
      const res = await fetchDiagnosticCases(
        githubConfig.token,
        githubConfig.repoOwner,
        githubConfig.repoName
      );
      if (res.success && res.casesFound) {
        // Mark which cases are already in our income records
        const enriched = res.casesFound.map(c => ({
          ...c,
          alreadyInAccounts: incomeRecords.some(r => r.barcode === c.barcode || r.labNumber === c.labNumber)
        }));
        setDiagnosticCases(enriched);
        setGithubConfigState(prev => ({
          ...prev,
          lastSyncAt: new Date().toISOString(),
          status: 'connected'
        }));
        logAudit('SYNC', 'SETTINGS', `جلب ومزامنة ${res.casesFound.length} حالة من نظام التحاليل التشخيصي عبر GitHub`);
        return { success: true, message: res.message };
      } else {
        setGithubConfigState(prev => ({ ...prev, status: 'error', errorMessage: res.message }));
        return { success: false, message: res.message };
      }
    } finally {
      setIsSyncing(false);
    }
  };

  const pushCasesToDiagnostic = async (): Promise<{ success: boolean; message: string }> => {
    setIsSyncing(true);
    try {
      const summary = {
        totalRevenue: financialMetrics.totalPaidIncome,
        totalExpenses: financialMetrics.totalExpenses,
        netProfit: financialMetrics.netProfit,
        ceoShare: financialMetrics.ceoShare,
        labShare: financialMetrics.labShare,
        casesCount: incomeRecords.length
      };
      const res = await pushFinancialDataToRepo(
        githubConfig.token,
        githubConfig.repoOwner,
        githubConfig.repoName,
        incomeRecords,
        summary
      );
      if (res.success) {
        setGithubConfigState(prev => ({
          ...prev,
          lastSyncAt: new Date().toISOString(),
          status: 'connected'
        }));
        logAudit('SYNC', 'SETTINGS', `تسميع وتصدير الحالات المسددة على مستودع نظام النتائج بنجاح`);
        return { success: true, message: res.message };
      } else {
        setGithubConfigState(prev => ({ ...prev, status: 'error', errorMessage: res.message }));
        return { success: false, message: res.message };
      }
    } finally {
      setIsSyncing(false);
    }
  };

  // Barcode Handler (Global)
  const handleBarcodeScanned = useCallback((code: string) => {
    const trimmed = code.trim();
    setScannedBarcode(trimmed);

    // 1. Check if it matches an inventory item barcode or code
    const foundInv = inventory.find(i => i.barcode === trimmed || i.itemCode === trimmed);
    if (foundInv) {
      setActiveTab('inventory');
      return;
    }

    // 2. Check if it matches an existing patient invoice or labNumber
    const foundIncome = incomeRecords.find(r => r.barcode === trimmed || r.labNumber === trimmed);
    if (foundIncome) {
      setActiveTab('income');
      return;
    }

    // 3. Otherwise, set activeTab to income so reception can bill it
    setActiveTab('income');
  }, [inventory, incomeRecords]);

  // Hardware barcode scanner listener (rapid keystrokes followed by Enter)
  useEffect(() => {
    let buffer = '';
    let lastKeyTime = Date.now();

    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't intercept if user is typing in an input or textarea
      const target = e.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable) {
        return;
      }

      const currentTime = Date.now();
      if (currentTime - lastKeyTime > 100) {
        buffer = ''; // reset buffer if typing was slow (manual typing)
      }
      lastKeyTime = currentTime;

      if (e.key === 'Enter') {
        if (buffer.length >= 3) {
          handleBarcodeScanned(buffer);
          buffer = '';
        }
      } else if (e.key.length === 1) {
        buffer += e.key;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleBarcodeScanned]);

  // Backup & Restore
  const exportBackup = async (password?: string): Promise<string> => {
    const fullState = {
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
      githubConfig
    };
    const backupStr = await createEncryptedBackup(fullState, password);
    logAudit('BACKUP', 'SECURITY', password ? 'تصدير نسخة احتياطية مشفرة بكلمة مرور' : 'تصدير نسخة احتياطية عامة');
    return backupStr;
  };

  const importBackup = async (jsonStr: string, password?: string): Promise<{ success: boolean; message: string }> => {
    const res = await restoreEncryptedBackup(jsonStr, password);
    if (!res.success || !res.data) {
      return { success: false, message: res.message };
    }

    const d = res.data as Record<string, unknown>;
    if (d.incomeRecords) setIncomeRecords(d.incomeRecords as IncomeRecord[]);
    if (d.expenses) setExpenses(d.expenses as ExpenseRecord[]);
    if (d.profitConfig) setProfitConfigState(d.profitConfig as ProfitShareConfig);
    if (d.inventory) setInventory(d.inventory as InventoryItem[]);
    if (d.employees) setEmployees(d.employees as Employee[]);
    if (d.attendance) setAttendance(d.attendance as AttendanceRecord[]);
    if (d.payroll) setPayroll(d.payroll as PayrollRecord[]);
    if (d.labToLabOrders) setLabToLabOrders(d.labToLabOrders as LabToLabOrder[]);
    if (d.closeouts) setCloseouts(d.closeouts as DailyCloseout[]);
    if (d.githubConfig) setGithubConfigState(d.githubConfig as GitHubSyncConfig);

    logAudit('BACKUP', 'SECURITY', 'استعادة قاعدة البيانات بالكامل من ملف النسخة الاحتياطية');
    return { success: true, message: res.message };
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
    setGithubConfigState(INITIAL_GITHUB_CONFIG);
    logAudit('UPDATE', 'SETTINGS', 'إعادة ضبط المنظومة للبيانات الافتراضية الأولية');
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
  if (!context) throw new Error('useApp must be used within AppProvider');
  return context;
};
