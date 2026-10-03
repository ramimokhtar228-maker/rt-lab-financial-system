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
  cost?: number; // Approximate reagent & material cost
  sampleType?: string;
  turnaroundTime?: string;
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
  loyaltyDiscountEGP?: number;
  loyaltyPointsRedeemed?: number;
  loyaltyPointsEarned?: number;
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
  ceoPercentage: number;
  labPercentage: number;
  emergencyFundPercentage: number;
  calculationBase: 'net_profit' | 'gross_income';
  ceoNameAr: string;
  ceoNameEn: string;
}

export interface InventoryItem {
  id: string;
  code: string;
  nameAr: string;
  nameEn: string;
  category: 'reagent' | 'consumable' | 'control_calibrator' | 'tube' | 'ppe';
  supplier: string;
  currentQuantity: number;
  unit: string;
  minThreshold: number;
  costPerUnit: number;
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
  action: 'CREATE' | 'UPDATE' | 'DELETE' | 'SYNC' | 'CLOSEOUT' | 'BACKUP' | 'LOGIN' | 'CATALOG_UPDATE' | 'LOYALTY';
  module: 'INCOME' | 'EXPENSES' | 'INVENTORY' | 'HR' | 'LAB_TO_LAB' | 'SETTINGS' | 'SECURITY' | 'CATALOG' | 'LOYALTY';
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

// Loyalty System Types
export type LoyaltyTier = 'Silver' | 'Gold' | 'Platinum' | 'VIP';

export interface LoyaltyTransaction {
  id: string;
  date: string;
  type: 'earn' | 'redeem' | 'bonus' | 'adjust';
  points: number;
  description: string;
  reportNumber?: string;
  invoiceNumber?: string;
  amountEGP?: number;
}

export interface PatientLoyaltyProfile {
  patientId: string;
  patientName: string;
  phone: string;
  barcode: string;
  bloodGroup: string;
  totalPoints: number;
  tier: LoyaltyTier;
  lifetimeSpent: number;
  emergencyContact?: string;
  chronicConditions?: string[];
  issueDate: string;
  transactions: LoyaltyTransaction[];
}

export interface LoyaltyConfig {
  pointsPerEGP: number; // default: 1 pt per 1 EGP
  egpPer100Points: number; // default: 10 EGP per 100 points
  tiers: {
    Silver: { discountRate: number; minPoints: number };
    Gold: { discountRate: number; minPoints: number };
    Platinum: { discountRate: number; minPoints: number };
    VIP: { discountRate: number; minPoints: number };
  };
}
