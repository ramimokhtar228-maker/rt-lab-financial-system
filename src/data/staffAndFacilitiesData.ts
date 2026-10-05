import { StaffMember, LabFacility, LabInfo } from "../types/lab";

export const INITIAL_LAB_INFO: LabInfo = {
  labNameAr: "معامل RT للتحاليل الطبية والتشخيصية",
  labNameEn: "RT Diagnostic Laboratories",
  sloganAr: "التشخيص الصحيح يبدأ معنا · دقة، سرعة، وأمان تشخيصي",
  sloganEn: "Accurate Diagnosis Starts With Us",
  supervisionAr: "أطباء واستشاريو كلية طب قصر العيني",
  supervisionEn: "Kasr Al Ainy Faculty of Medicine Consultants",
  accreditation: "ISO 15189 Certified Quality Management",
  hotline: "01012345678",
  phone: "0244667788",
  whatsapp: "01012345678",
  mainAddress: "ميدان بهتيم برج صيدليه العزبى الدور الثالث امام الأسانسير شبرا الخيمه",
  instapay: "ramirtlab@instapay",
  vodafoneCash: "01098765432"
};

export const INITIAL_FACILITIES: LabFacility[] = [
  {
    id: "branch-behteem",
    nameAr: "الفرع الرئيسي - بهتيم",
    nameEn: "Main Branch - Behteem",
    branchCode: "MAIN-01",
    address: "ميدان بهتيم برج صيدليه العزبى الدور الثالث امام الأسانسير شبرا الخيمه",
    city: "شبرا الخيمة - القليوبية",
    phones: ["01012345678", "0244667788"],
    whatsapp: "01012345678",
    managerName: "أ.د. رامي مختار",
    operatingHours: "يومياً على مدار 24 ساعة (خدمة الطوارئ متوفرة)",
    availableServices: [
      "سحب عينات ومعمل متكامل 24/7",
      "كيمياء إكلينيكية وهرمونات متطورة",
      "أمراض دم وتخثر ومناعة",
      "خدمة الزيارات المنزلية وسحب العينات"
    ],
    isMainBranch: true,
    isActive: true
  },
  {
    id: "branch-kasr",
    nameAr: "فرع قصر العيني الطبي",
    nameEn: "Kasr Al Ainy Branch",
    branchCode: "KASR-02",
    address: "شارع القصر العيني أمام مستشفى قصر العيني الفرنساوي - القاهرة",
    city: "القاهرة",
    phones: ["01023456789", "0223654321"],
    whatsapp: "01023456789",
    managerName: "د. سامح عبد الرازق",
    operatingHours: "من 8:00 صباحاً حتى 11:00 مساءً",
    availableServices: [
      "استشارات باثولوجيا إكلينيكية",
      "تحاليل وظائف أعضاء وأورام",
      "ميكروبيولوجي ومزارع حساسية"
    ],
    isMainBranch: false,
    isActive: true
  },
  {
    id: "branch-shoubra",
    nameAr: "فرع شبرا الخيمة - الشارع الجديد",
    nameEn: "Shoubra Al-Khaima New St Branch",
    branchCode: "SHB-03",
    address: "تقاطع الشارع الجديد مع شارع 15 مايو - بجوار محطة المترو",
    city: "شبرا الخيمة",
    phones: ["01034567890", "0244778899"],
    whatsapp: "01034567890",
    managerName: "د. دعاء الشافعي",
    operatingHours: "من 8:30 صباحاً حتى 11:30 مساءً",
    availableServices: [
      "سحب عينات دم وفحوصات فورية",
      "فحوصات سكر وتجلط دم وسرعة ترسيب",
      "خدمة استلام النتائج المعتمدة"
    ],
    isMainBranch: false,
    isActive: true
  }
];

export const INITIAL_STAFF_MEMBERS: StaffMember[] = [
  // 1. الإدارة (Administration)
  {
    id: "staff-admin-1",
    name: "أ.د. رامي مختار",
    role: "admin",
    department: "administration",
    title: "رئيس مجلس الإدارة والمدير الطبي التنفيذي (CEO)",
    specialty: "استشاري الباثولوجيا الإكلينيكية والكيميائية",
    licenseNumber: "EGY-MED-48201",
    phone: "01001234567",
    branchId: "branch-behteem",
    branchName: "الفرع الرئيسي - بهتيم",
    signatureLabel: "أ.د. رامي مختار - استشاري الباثولوجيا الإكلينيكية والكيميائية - كلية طب قصر العيني",
    isActive: true,
    nationalId: "28001010101234"
  },
  {
    id: "staff-admin-2",
    name: "أ/ سارة إبراهيم الشربيني",
    role: "admin",
    department: "administration",
    title: "مدير العمليات والجودة الإدارية",
    specialty: "إدارة المعامل الطبية وضبط الجودة الشاملة",
    licenseNumber: "EGY-MGT-11024",
    phone: "01099887766",
    branchId: "branch-behteem",
    branchName: "الفرع الرئيسي - بهتيم",
    signatureLabel: "أ/ سارة الشربيني - إدارة الجودة والتشغيل",
    isActive: true,
    nationalId: "29005051203456"
  },
  // 2. الحسابات (Finance & Accounts)
  {
    id: "staff-acc-1",
    name: "أ/ أحمد محمود الشناوي",
    role: "accountant",
    department: "accounts",
    title: "رئيس قسم الحسابات والماليات",
    specialty: "محاسبة تكاليف المنشآت الطبية والفوترة",
    licenseNumber: "EGY-ACC-98421",
    phone: "01122334455",
    branchId: "branch-behteem",
    branchName: "الفرع الرئيسي - بهتيم",
    signatureLabel: "أ/ أحمد الشناوي - رئيس الحسابات والمالية",
    isActive: true,
    nationalId: "28812041401234"
  },
  {
    id: "staff-acc-2",
    name: "أ/ مروان عادل الجزار",
    role: "accountant",
    department: "accounts",
    title: "محاسب الخزينة والإيرادات اليومية",
    specialty: "حسابات المرضى والتحصيل والتأمين",
    licenseNumber: "EGY-ACC-77519",
    phone: "01233445566",
    branchId: "branch-behteem",
    branchName: "الفرع الرئيسي - بهتيم",
    signatureLabel: "أ/ مروان عادل - محاسب الخزينة",
    isActive: true,
    nationalId: "29408101602345"
  },
  // 3. الاستقبال (Reception)
  {
    id: "staff-rec-1",
    name: "أ/ هدى السيد رضوان",
    role: "receptionist",
    department: "reception",
    title: "مسؤولة الاستقبال وخدمة المرضى",
    specialty: "تسجيل المرضى، الفوترة، وحجوزات الزيارات المنزلية",
    licenseNumber: "EGY-REC-33201",
    phone: "01055443322",
    branchId: "branch-behteem",
    branchName: "الفرع الرئيسي - بهتيم",
    signatureLabel: "أ/ هدى رضوان - خدمة العملاء والاستقبال",
    isActive: true,
    nationalId: "29603021804567"
  },
  {
    id: "staff-rec-2",
    name: "أ/ مريم عبد الله توفيق",
    role: "receptionist",
    department: "reception",
    title: "أخصائية استقبال ودعم العملاء والواتساب",
    specialty: "متابعة مواعيد الزيارات والنتائج وإشعارات الحجز",
    licenseNumber: "EGY-REC-44102",
    phone: "01144556677",
    branchId: "branch-kasr",
    branchName: "فرع قصر العيني الطبي",
    signatureLabel: "أ/ مريم توفيق - استقبال فرع قصر العيني",
    isActive: true,
    nationalId: "29811051506789"
  },
  // 4. الكيميائيين وأخصائيي التحاليل (Chemists)
  {
    id: "staff-chem-1",
    name: "د/ عمر فؤاد القاضي",
    role: "chemist",
    department: "chemists",
    title: "أخصائي أول كيمياء إكلينيكية وهرمونات",
    specialty: "كيمياء الدم الحيوية والغدد والهرمونات (Clinical Chemistry & Hormones)",
    licenseNumber: "EGY-SCI-88402",
    phone: "01066778899",
    branchId: "branch-behteem",
    branchName: "الفرع الرئيسي - بهتيم",
    signatureLabel: "د/ عمر فؤاد - أخصائي الكيمياء الإكلينيكية",
    isActive: true,
    nationalId: "29202021203456"
  },
  {
    id: "staff-chem-2",
    name: "د/ آية محمود الباز",
    role: "chemist",
    department: "chemists",
    title: "أخصائية أمراض الدم والمناعة والمزارع",
    specialty: "أمراض الدم والميكروبيولوجي والمناعة (Hematology & Immunology)",
    licenseNumber: "EGY-SCI-91204",
    phone: "01288990011",
    branchId: "branch-behteem",
    branchName: "الفرع الرئيسي - بهتيم",
    signatureLabel: "د/ آية الباز - أخصائية أمراض الدم والمناعة",
    isActive: true,
    nationalId: "29509091901234"
  },
  {
    id: "staff-chem-3",
    name: "د/ كريم حسن الديب",
    role: "chemist",
    department: "chemists",
    title: "كيميائي تحاليل طبية وتشخيصية",
    specialty: "تحاليل السوائل والمزارع والفحوصات الروتينية",
    licenseNumber: "EGY-SCI-65432",
    phone: "01199884433",
    branchId: "branch-shoubra",
    branchName: "فرع شبرا الخيمة - الشارع الجديد",
    signatureLabel: "د/ كريم الديب - كيميائي طبي",
    isActive: true,
    nationalId: "29704041405678"
  },
  // 5. التمريض وسحب الزيارات المنزلية (Phlebotomists)
  {
    id: "staff-phleb-1",
    name: "أ/ يوسف طارق المنشاوي",
    role: "phlebotomist",
    department: "phlebotomists",
    title: "أخصائي سحب العينات والزيارات المنزلية",
    specialty: "سحب العينات الوريدية المعقدة والأطفال والزيارات الخارجية",
    licenseNumber: "EGY-NUR-77651",
    phone: "01011223344",
    branchId: "branch-behteem",
    branchName: "الفرع الرئيسي - بهتيم",
    signatureLabel: "أ/ يوسف المنشاوي - تمريض سحب العينات",
    isActive: true,
    nationalId: "29906061607890"
  }
];
