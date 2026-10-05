export type Language = 'ar' | 'en';

export type UserRole =
  | 'admin_ceo'
  | 'accountant'
  | 'chemist'
  | 'receptionist'
  | 'lab_tech'
  | 'hr_officer'
  | 'guest';

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

export interface AppNotification {
  id: string;
  title: string;
  message: string;
  type: 'warning' | 'info' | 'danger' | 'success';
  timestamp: string;
  read: boolean;
  targetTab?: string;
}

export type PaymentMethod =
  | 'cash'
  | 'visa'
  | 'card'
  | 'bank_transfer'
  | 'deferred'
  | 'instapay'
  | 'vodafone_cash'
  | 'wallet';

export type PaymentStatus = 'paid' | 'partial' | 'unpaid';

export interface InvoiceTestItem {
  id: string;
  code: string;
  nameAr: string;
  nameEn: string;
  price: number;
  category: string;
  cost?: number;
  sampleType?: string;
  turnaroundTime?: string;
  unit?: string;
  minNormal?: number;
  maxNormal?: number;
  textReference?: string;
  method?: string;
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
  testsSubtotal?: number;
  discount: number;
  visitFee?: number;
  isHomeVisit?: boolean;
  visitAddress?: string;
  visitSpecialist?: string;
  branchId?: string;
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
  discrepancy: number;
  closedBy: string;
  notes?: string;
  timestamp: string;
}

export interface ProfitShareConfig {
  ceoPercentage: number;
  labPercentage: number;
  emergencyFundPercentage: number;
  calculationBase: 'net_profit' | 'gross_income';
  ceoNameAr: string;
  ceoNameEn: string;
}

export type InventoryCategory =
  | 'chemistry_reagents'
  | 'hematology_diluents'
  | 'tubes_vacutainers'
  | 'elisa_clia_kits'
  | 'rapid_tests'
  | 'tips_consumables'
  | 'reagent'
  | 'consumable'
  | 'control_calibrator'
  | 'tube'
  | 'ppe';

export interface InventoryItem {
  id: string;
  code?: string;
  itemCode?: string;
  barcode?: string;
  nameAr: string;
  nameEn: string;
  category: InventoryCategory;
  supplier?: string;
  supplierName?: string;
  supplierPhone?: string;
  currentQuantity: number;
  unit: string;
  minThreshold: number;
  costPerUnit?: number;
  unitCost?: number;
  lotNumber: string;
  expiryDate: string;
  storageTemp: string;
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
  date: string;
  checkInTime: string;
  checkOutTime?: string;
  status: AttendanceStatus;
  hoursWorked: number;
  overtimeHours: number;
  notes?: string;
}

export interface PayrollRecord {
  id: string;
  monthYear: string;
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
  outsourcedCost: number;
  patientChargedPrice: number;
  profitMargin: number;
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
  action: 'CREATE' | 'UPDATE' | 'DELETE' | 'SYNC' | 'CLOSEOUT' | 'BACKUP' | 'LOGIN' | 'CATALOG_UPDATE' | 'LOYALTY' | 'DEVICE_COMM';
  module: 'INCOME' | 'EXPENSES' | 'INVENTORY' | 'HR' | 'LAB_TO_LAB' | 'SETTINGS' | 'SECURITY' | 'CATALOG' | 'LOYALTY' | 'DIAGNOSTIC' | 'DEVICE';
  description: string;
}

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
  cardNumber?: string;
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
  pointsPerEGP: number;
  egpPer100Points: number;
  tiers: {
    Silver: { discountRate: number; minPoints: number };
    Gold: { discountRate: number; minPoints: number };
    Platinum: { discountRate: number; minPoints: number };
    VIP: { discountRate: number; minPoints: number };
  };
}

export interface LabInfo {
  labNameAr: string;
  labNameEn: string;
  sloganAr: string;
  sloganEn: string;
  supervisionAr: string;
  supervisionEn: string;
  accreditation: string;
  hotline: string;
  phone: string;
  whatsapp: string;
  mainAddress: string;
  instapay: string;
  vodafoneCash: string;
}

export interface LabFacility {
  id: string;
  nameAr: string;
  nameEn: string;
  branchCode: string;
  address: string;
  city: string;
  phones: string[];
  whatsapp: string;
  managerName: string;
  operatingHours: string;
  availableServices?: string[];
  isMainBranch: boolean;
  isActive: boolean;
}

export type StaffRole = 'admin' | 'accountant' | 'receptionist' | 'chemist' | 'pathologist' | 'phlebotomist' | 'verifier';
export type StaffDepartment = 'administration' | 'accounts' | 'reception' | 'chemists' | 'pathologists' | 'phlebotomists';

export interface StaffMember {
  id: string;
  name: string;
  role: StaffRole;
  department?: StaffDepartment;
  title: string;
  specialty: string;
  licenseNumber: string;
  phone: string;
  branchId: string;
  branchName?: string;
  signatureLabel?: string;
  isActive: boolean;
  nationalId?: string;
}

export type Gender = 'male' | 'female';
export type AgeUnit = 'years' | 'months' | 'days';
export type DoctorTitle = 'Prof. Dr.' | 'Dr.' | 'Herself' | 'Himself' | 'Custom';
export type ResultFlag = 'NORMAL' | 'HIGH' | 'LOW' | 'PANIC_HIGH' | 'PANIC_LOW' | 'ABNORMAL' | '';

export interface Patient {
  id: string;
  labNumber: string;
  barcode: string;
  fullName: string;
  age: number;
  ageUnit: AgeUnit;
  gender: Gender;
  phone: string;
  referringDoctorTitle: DoctorTitle;
  referringDoctorName: string;
  sampleDate: string;
  reportingDate: string;
  clinicalHistory?: string;
  fastingHours?: number;
  nationalId?: string;
  bloodGroup?: string;
  emergencyContact?: string;
  loyaltyPoints?: number;
  assignedPackageId?: string;
  totalCost?: number;
  discountApplied?: number;
  bookingType?: 'branch' | 'home_visit';
  branchAddress?: string;
  homeAddress?: string;
  deliveryNotes?: string;
  appointmentDate?: string;
  appointmentTime?: string;
  paymentMethod?: PaymentMethod;
  discountType?: 'percentage' | 'daily_fixed' | 'package_bundle' | 'dynamic_lab' | 'coupon' | 'none';
  couponCode?: string;
  sampleCollected?: boolean;
  sampleCollectedAt?: string;
  sampleNotes?: string;
  loyaltyCardIssued?: boolean;
  loyaltyCardNumber?: string;
  rating?: number;
  reviewComment?: string;
  visitFee?: number;
  visitSpecialist?: string;
  testsSubtotal?: number;
}

export interface TestParameter {
  id: string;
  name: string;
  result: string;
  unit: string;
  minNormal?: number;
  maxNormal?: number;
  panicLow?: number;
  panicHigh?: number;
  textReference?: string;
  flag: ResultFlag;
  method?: string;
  notes?: string;
}

export interface DiseaseIllustration {
  id: string;
  code: string;
  titleAr: string;
  titleEn: string;
  category: 'hematology' | 'biochemistry' | 'microscopy' | 'endocrinology' | 'cardiac' | 'coagulation' | 'parasitology' | 'pathology';
  imageUrl?: string;
  svgBadge?: string;
  pathologySummaryAr: string;
  pathologySummaryEn: string;
  descriptionAr?: string;
  descriptionEn?: string;
  keyDiagnosticPoints: string[];
  diagnosticCriteria?: string[];
  associatedConditions: string[];
  differentialDiagnosis?: string;
}

export interface TestProfile {
  id: string;
  profileCode: string;
  titleEn: string;
  titleAr: string;
  category: string;
  sampleType: string;
  parameters: TestParameter[];
  interpretation?: string;
  comment?: string;
  attachedIllustration?: DiseaseIllustration;
  bloodFilmFindings?: {
    rbcMorphology?: string;
    wbcMorphology?: string;
    plateletMorphology?: string;
    reticulocytesPercent?: string;
    differentialSummary?: string;
  };
}

export interface LabStaffSignatures {
  labChemist: string;
  verifiedBy: string;
  pathologist: string;
  chemistTitle?: string;
  verifierTitle?: string;
  pathologistTitle?: string;
  chemistLicense?: string;
  verifierLicense?: string;
  pathologistLicense?: string;
}

export type ReportStatus = 'draft' | 'in_progress' | 'verified' | 'released';

export interface LabReport {
  id: string;
  reportNumber: string;
  patient: Patient;
  profiles: TestProfile[];
  staff: LabStaffSignatures;
  generalComment?: string;
  status: ReportStatus;
  createdAt: string;
  updatedAt: string;
  packageApplied?: {
    code: string;
    titleAr: string;
    packagePrice: number;
  };
  attachedIllustrations?: DiseaseIllustration[];
  invoiceId?: string;
}

export interface CatalogProfileTemplate {
  code: string;
  titleEn: string;
  titleAr: string;
  category: string;
  sampleType: string;
  defaultInterpretation?: string;
  parameters: Omit<TestParameter, 'id' | 'result' | 'flag'>[];
  profilePrice?: number;
  illustrationId?: string;
}

export interface IndividualTest {
  id: string;
  code: string;
  nameEn: string;
  nameAr: string;
  category: string;
  sampleType: string;
  unit: string;
  minNormal?: number;
  maxNormal?: number;
  panicLow?: number;
  panicHigh?: number;
  textReference?: string;
  method?: string;
  fastingInstructions?: string;
  turnaroundHours?: number;
  turnaroundTime?: string;
  price: number;
  cost?: number;
}

export interface ComprehensivePackage {
  id: string;
  code: string;
  titleAr: string;
  titleEn: string;
  descriptionAr: string;
  targetAudience: string;
  includedProfiles: string[];
  includedIndividualTestCodes: string[];
  originalPrice: number;
  packagePrice: number;
  discountPercentage: number;
  fastingRequired: string;
  sampleTypes: string[];
  isPopular?: boolean;
}

export type InstrumentProtocol = 'ASTM-E1381' | 'HL7-v2' | 'RS232_Serial' | 'TCP_IP_Socket' | 'USB_HID' | 'File_CSV';
export type InstrumentStatus = 'online' | 'busy' | 'offline' | 'simulated';

export interface LabInstrument {
  id: string;
  name: string;
  model: string;
  manufacturer: string;
  category: 'hematology' | 'biochemistry' | 'coagulation' | 'immunoassay' | 'urinalysis';
  protocol: InstrumentProtocol;
  connectionPort: string;
  status: InstrumentStatus;
  supportedProfiles: string[];
  lastSyncTime?: string;
  totalTestsRun: number;
  serialNumber: string;
  autoApproveNormal: boolean;
}

export interface InstrumentTransmission {
  id: string;
  instrumentId: string;
  instrumentName: string;
  timestamp: string;
  sampleBarcode: string;
  patientLabNumber?: string;
  patientName?: string;
  testCode: string;
  results: Record<string, string | number>;
  rawMessage: string;
  status: 'received' | 'mapped' | 'rejected';
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
