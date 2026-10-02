export type Language = 'ar' | 'en';

export type UserRole = 'admin_ceo' | 'accountant' | 'lab_tech' | 'hr_officer';

export interface UserProfile {
  id: string;
  nameAr: string;
  nameEn: string;
  username: string;
  role: UserRole;
  pin: string;
  avatarColor: string;
  titleAr: string;
  titleEn: string;
}

export type PaymentMethod = 'cash' | 'visa' | 'bank_transfer' | 'deferred';
export type PaymentStatus = 'paid' | 'partial' | 'unpaid';

export interface InvoiceTestItem {
  id: string;
  code: string;
  nameAr: string;
  nameEn: string;
  price: number;
  category: string;
}

export interface IncomeRecord {
  id: string;
  invoiceNumber: string;
  patientName: string;
  patientPhone: string;
  patientAge: number;
  patientGender: 'male' | 'female';
  barcode: string;
  labNumber: string;
  referringDoctor: string;
  tests: InvoiceTestItem[];
  subtotal: number;
  discount: number;
  netAmount: number;
  paidAmount: number;
  remainingAmount: number;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  cashierName: string;
  branch: string;
  notes?: string;
  syncStatus: 'synced' | 'pending' | 'local_only';
  syncDate?: string;
  externalReportId?: string;
  createdAt: string;
  updatedAt: string;
}

export type ExpenseCategory =
  | 'reagents_chemicals'
  | 'rent_utilities'
  | 'salaries_wages'
  | 'equipment_maintenance'
  | 'lab_to_lab'
  | 'waste_disposal'
  | 'marketing_stationery'
  | 'other';

export interface ExpenseRecord {
  id: string;
  expenseNumber: string;
  title: string;
  category: ExpenseCategory;
  amount: number;
  paidTo: string;
  paymentMethod: PaymentMethod;
  date: string;
  approvedBy: string;
  notes?: string;
  department: string;
  createdAt: string;
}

export interface ProfitShareConfig {
  ceoPercentage: number; // default e.g. 45%
  labPercentage: number; // default e.g. 45%
  emergencyFundPercentage: number; // default e.g. 10%
  calculationBase: 'net_profit' | 'gross_income'; // net_profit = (income - expenses)
  ceoNameAr: string;
  ceoNameEn: string;
}

export type InventoryCategory =
  | 'chemistry_reagents'
  | 'elisa_clia_kits'
  | 'hematology_diluents'
  | 'tubes_vacutainers'
  | 'tips_consumables'
  | 'rapid_tests'
  | 'controls_calibrators';

export interface InventoryItem {
  id: string;
  itemCode: string;
  barcode: string;
  nameAr: string;
  nameEn: string;
  category: InventoryCategory;
  currentQuantity: number;
  unit: string; // 'Kit' | 'Vial' | 'Box' | 'Test' | 'Pack'
  minThreshold: number;
  unitCost: number;
  supplierName: string;
  supplierPhone: string;
  lotNumber: string;
  expiryDate: string;
  storageTemp: '2-8°C' | '15-25°C' | '-20°C';
  testsPerKit?: number;
  lastRestockedDate: string;
  notes?: string;
}

export interface Employee {
  id: string;
  code: string;
  fullName: string;
  role: 'pathologist' | 'chemist' | 'verifier' | 'phlebotomist' | 'accountant' | 'receptionist' | 'cleaner' | 'technician';
  jobTitleAr: string;
  jobTitleEn: string;
  department: string;
  basicSalary: number;
  phone: string;
  nationalId: string;
  hireDate: string;
  shiftHours: number;
  isActive: boolean;
  branch: string;
}

export type AttendanceStatus = 'present' | 'absent' | 'late' | 'excused' | 'leave';

export interface AttendanceRecord {
  id: string;
  employeeId: string;
  employeeName: string;
  date: string; // YYYY-MM-DD
  checkInTime: string; // HH:mm
  checkOutTime?: string; // HH:mm
  status: AttendanceStatus;
  hoursWorked: number;
  overtimeHours: number;
  notes?: string;
}

export interface PayrollRecord {
  id: string;
  monthYear: string; // YYYY-MM
  employeeId: string;
  employeeName: string;
  basicSalary: number;
  bonusAmount: number;
  deductionAmount: number;
  advancePayment: number;
  overtimePay: number;
  netSalary: number;
  paymentStatus: 'draft' | 'approved' | 'paid';
  paymentDate?: string;
  notes?: string;
}

export interface LabToLabOrder {
  id: string;
  orderNumber: string;
  patientName: string;
  patientLabNumber: string;
  externalLabName: string;
  testNames: string[];
  sampleType: string;
  dateSent: string;
  expectedDate: string;
  outsourcedCost: number; // what external lab charges RT Lab
  patientChargedPrice: number; // what RT Lab charged the patient
  profitMargin: number; // calculated: patientChargedPrice - outsourcedCost
  paymentToExternalStatus: 'unpaid' | 'paid';
  resultStatus: 'sent' | 'processing' | 'received' | 'delivered';
  externalReportNumber?: string;
  notes?: string;
}

export interface AuditLog {
  id: string;
  timestamp: string;
  userId: string;
  userName: string;
  userRole: UserRole;
  action: 'CREATE' | 'UPDATE' | 'DELETE' | 'SYNC' | 'CLOSEOUT' | 'BACKUP' | 'LOGIN';
  module: 'INCOME' | 'EXPENSES' | 'INVENTORY' | 'HR' | 'LAB_TO_LAB' | 'SETTINGS' | 'SECURITY';
  description: string;
}

export interface AppNotification {
  id: string;
  title: string;
  message: string;
  type: 'warning' | 'info' | 'danger' | 'success';
  timestamp: string;
  read: boolean;
  targetTab?: string;
}

export interface GitHubSyncConfig {
  repoOwner: string;
  repoName: string;
  branch: string;
  token: string;
  autoSync: boolean;
  lastSyncAt: string | null;
  status: 'idle' | 'syncing' | 'connected' | 'error';
  errorMessage?: string;
}

export interface DailyCloseout {
  id: string;
  date: string;
  totalIncomeCash: number;
  totalIncomeVisa: number;
  totalIncomeTransfer: number;
  totalIncomeDeferred: number;
  totalExpenses: number;
  expectedCashInDrawer: number;
  actualCashInDrawer: number;
  discrepancy: number; // actual - expected
  closedBy: string;
  notes?: string;
  timestamp: string;
}
