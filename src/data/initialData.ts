import { LabReport, IncomeRecord, PatientLoyaltyProfile } from "../types";
import { LAB_CATALOG } from "./labCatalog";
import { DISEASE_ILLUSTRATIONS } from "./diseaseIllustrations";

const todayStr = new Date().toISOString().split('T')[0];

export const INITIAL_REPORTS: LabReport[] = [
  {
    id: "rep-001",
    reportNumber: "RT-2026-001",
    patient: {
      id: "pat-001",
      labNumber: "RT-2026-001",
      barcode: "RT-10029",
      fullName: "أحمد محمود إبراهيم",
      age: 34,
      ageUnit: "years",
      gender: "male",
      phone: "01012345678",
      referringDoctorTitle: "Dr.",
      referringDoctorName: "د. طارق المنشاوي",
      sampleDate: todayStr,
      reportingDate: todayStr,
      clinicalHistory: "إرهاق عام وشحوب مستمر وصداع عند المجهود",
      fastingHours: 0,
      nationalId: "29005120101993",
      bloodGroup: "A+",
      loyaltyPoints: 120,
      loyaltyCardIssued: true,
      loyaltyCardNumber: "RT-SILVER-10029",
      testsSubtotal: 280,
      totalCost: 280,
      discountApplied: 28,
      paymentMethod: "cash"
    },
    profiles: [
      {
        id: "prof-cbc-1",
        profileCode: "CBC",
        titleEn: "Complete Blood Count (CBC) with Full Automated Differential & Indices",
        titleAr: "صورة الدم الكاملة مع الفيلم التفريقي والمؤشرات الحسابية",
        category: "Hematology",
        sampleType: "EDTA Whole Blood",
        interpretation: "Microcytic hypochromic anemia picture. Morphological findings and low MCV/MCH strongly suggest Iron Deficiency Anemia (IDA). Serum Ferritin and Iron studies are recommended.",
        comment: "تم فحص الشريحة ميكروسكوبياً بواسطة استشاري الباثولوجيا الإكلينيكية.",
        attachedIllustration: DISEASE_ILLUSTRATIONS.find(i => i.id === "hem-ida") || DISEASE_ILLUSTRATIONS[0],
        bloodFilmFindings: {
          rbcMorphology: "Moderate anisopoikilocytosis, microcytes, hypochromic cells with prominent central pallor, occasional pencil / cigar-shaped cells.",
          wbcMorphology: "Normal leucocyte count with normal differential distribution. No immature myeloid precursors or toxic granulations.",
          plateletMorphology: "Mild reactive thrombocytosis. Adequate granular morphology, no platelet clumps seen.",
          differentialSummary: "Neutrophils: 62% | Lymphocytes: 29% | Monocytes: 6% | Eosinophils: 2% | Basophils: 1%"
        },
        parameters: [
          { id: "p-1", name: "Hemoglobin (Hb)", result: "8.6", unit: "g/dL", minNormal: 13.0, maxNormal: 17.0, panicLow: 7.0, panicHigh: 20.0, flag: "LOW", method: "SLS Hemoglobin Method" },
          { id: "p-2", name: "RBC Count", result: "3.80", unit: "x10^6/µL", minNormal: 4.5, maxNormal: 5.9, flag: "LOW", method: "Electrical Impedance" },
          { id: "p-3", name: "Hematocrit (Hct / PCV)", result: "27.2", unit: "%", minNormal: 40.0, maxNormal: 52.0, flag: "LOW", method: "Calculated" },
          { id: "p-4", name: "MCV", result: "71.5", unit: "fL", minNormal: 80.0, maxNormal: 98.0, flag: "LOW", method: "Direct Measurement" },
          { id: "p-5", name: "MCH", result: "22.6", unit: "pg", minNormal: 27.0, maxNormal: 33.0, flag: "LOW", method: "Calculated" },
          { id: "p-6", name: "MCHC", result: "31.6", unit: "g/dL", minNormal: 32.0, maxNormal: 36.0, flag: "LOW", method: "Calculated" },
          { id: "p-7", name: "RDW-CV", result: "17.8", unit: "%", minNormal: 11.5, maxNormal: 14.5, flag: "HIGH", method: "Calculated" },
          { id: "p-8", name: "Total Leucocytic Count (TLC / WBC)", result: "6.8", unit: "x10^3/µL", minNormal: 4.0, maxNormal: 11.0, flag: "NORMAL", method: "Electrical Impedance / Flow Cytometry" },
          { id: "p-9", name: "Platelet Count", result: "410", unit: "x10^3/µL", minNormal: 150, maxNormal: 450, flag: "NORMAL", method: "Electrical Impedance" },
          { id: "p-10", name: "Neutrophils %", result: "62", unit: "%", minNormal: 40, maxNormal: 75, flag: "NORMAL" },
          { id: "p-11", name: "Lymphocytes %", result: "29", unit: "%", minNormal: 20, maxNormal: 45, flag: "NORMAL" },
          { id: "p-12", name: "Monocytes %", result: "6", unit: "%", minNormal: 2, maxNormal: 10, flag: "NORMAL" },
          { id: "p-13", name: "Eosinophils %", result: "2", unit: "%", minNormal: 1, maxNormal: 6, flag: "NORMAL" },
          { id: "p-14", name: "Basophils %", result: "1", unit: "%", minNormal: 0, maxNormal: 2, flag: "NORMAL" }
        ]
      }
    ],
    staff: {
      labChemist: "د. هبة الشناوي - كيميائية تحاليل",
      verifiedBy: "د. مصطفى العوضي - استشاري التحاليل",
      pathologist: "أ.د. رامي مختار - استشاري الباثولوجيا الإكلينيكية والكيميائية - كلية طب قصر العيني",
      chemistTitle: "كيميائية طبية أولى",
      verifierTitle: "أخصائي باثولوجيا إكلينيكية",
      pathologistTitle: "استشاري الباثولوجيا الإكلينيكية - قصر العيني"
    },
    generalComment: "الحالة تتماشى مع فقر الدم بعوز الحديد. يرجى المتابعة بطلب مخزون الحديد (Serum Ferritin).",
    status: "verified",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    invoiceId: "inv-001"
  },
  {
    id: "rep-002",
    reportNumber: "RT-2026-002",
    patient: {
      id: "pat-002",
      labNumber: "RT-2026-002",
      barcode: "RT-10030",
      fullName: "منى عادل عبد الرحمن",
      age: 48,
      ageUnit: "years",
      gender: "female",
      phone: "01198765432",
      referringDoctorTitle: "Prof. Dr.",
      referringDoctorName: "أ.د. خالد الببلاوي - استشاري السكر والغدد",
      sampleDate: todayStr,
      reportingDate: todayStr,
      clinicalHistory: "متابعة دورية لمرض السكري من النوع الثاني وارتفاع ضغط الدم",
      fastingHours: 12,
      nationalId: "27608140102844",
      bloodGroup: "O+",
      loyaltyPoints: 340,
      loyaltyCardIssued: true,
      loyaltyCardNumber: "RT-GOLD-10030",
      testsSubtotal: 380,
      totalCost: 380,
      discountApplied: 38,
      paymentMethod: "visa"
    },
    profiles: [
      {
        id: "prof-gly-2",
        profileCode: "GLYCEMIC",
        titleEn: "Comprehensive Diabetes & Glycemic Profile",
        titleAr: "الملف الشامل للسكر والمؤشرات الأيضية",
        category: "Biochemistry",
        sampleType: "Fluoride Plasma & EDTA",
        interpretation: "Suboptimal glycemic control. Fasting glucose and HbA1c are elevated above standard ADA targets for non-pregnant adults.",
        parameters: [
          { id: "p-g1", name: "Fasting Blood Glucose", result: "148", unit: "mg/dL", minNormal: 70, maxNormal: 105, panicLow: 50, panicHigh: 400, flag: "HIGH", method: "Hexokinase" },
          { id: "p-g2", name: "Glycated Hemoglobin (HbA1c)", result: "7.9", unit: "%", minNormal: 4.0, maxNormal: 5.6, panicLow: 3.5, panicHigh: 14.0, flag: "HIGH", method: "HPLC NGSP Certified" },
          { id: "p-g3", name: "Estimated Average Glucose (eAG)", result: "180", unit: "mg/dL", minNormal: 70, maxNormal: 126, flag: "HIGH", method: "Calculated from HbA1c" }
        ]
      },
      {
        id: "prof-kft-2",
        profileCode: "KFT",
        titleEn: "Kidney Function Tests (Renal Profile)",
        titleAr: "وظائف الكلى والأملاح ومؤشرات الفلترة",
        category: "Biochemistry",
        sampleType: "Serum",
        interpretation: "Kidney function biomarkers are within normal acceptable physiological limits. No evidence of azotemia.",
        parameters: [
          { id: "p-k1", name: "Serum Creatinine", result: "0.82", unit: "mg/dL", minNormal: 0.5, maxNormal: 1.1, flag: "NORMAL", method: "Enzymatic Spectrophotometry" },
          { id: "p-k2", name: "Blood Urea", result: "28", unit: "mg/dL", minNormal: 15, maxNormal: 45, flag: "NORMAL", method: "GLDH Coupled" },
          { id: "p-k3", name: "Serum Uric Acid", result: "4.9", unit: "mg/dL", minNormal: 2.6, maxNormal: 6.0, flag: "NORMAL", method: "Uricase Colorimetric" }
        ]
      }
    ],
    staff: {
      labChemist: "د. هبة الشناوي - كيميائية تحاليل",
      verifiedBy: "د. مصطفى العوضي - استشاري التحاليل",
      pathologist: "أ.د. رامي مختار - استشاري الباثولوجيا الإكلينيكية والكيميائية - كلية طب قصر العيني"
    },
    generalComment: "يرجى مراجعة الطبيب المعالج لتعديل جرعات العلاج الغذائي والدوائي.",
    status: "verified",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    invoiceId: "inv-002"
  }
];

export const INITIAL_INCOME_RECORDS: IncomeRecord[] = [
  {
    id: "inv-001",
    invoiceNumber: "INV-2026-001",
    patientName: "أحمد محمود إبراهيم",
    patientPhone: "01012345678",
    patientAge: 34,
    patientGender: "male",
    barcode: "RT-10029",
    labNumber: "RT-2026-001",
    referringDoctor: "د. طارق المنشاوي",
    tests: [
      {
        id: "t-cbc",
        code: "CBC",
        nameAr: "صورة الدم الكاملة (CBC 5-Diff)",
        nameEn: "Complete Blood Count",
        price: 280,
        category: "Hematology",
        cost: 45,
        sampleType: "EDTA Whole Blood"
      }
    ],
    subtotal: 280,
    testsSubtotal: 280,
    discount: 28,
    loyaltyDiscountEGP: 28,
    loyaltyPointsRedeemed: 0,
    loyaltyPointsEarned: 252,
    netAmount: 252,
    paidAmount: 252,
    remainingAmount: 0,
    paymentMethod: "cash",
    paymentStatus: "paid",
    cashierName: "المحاسب المالي",
    branch: "فرع القصر العيني - الرئيسي",
    notes: "خصم كارت الولاء الفضي 10%",
    syncStatus: "synced",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: "inv-002",
    invoiceNumber: "INV-2026-002",
    patientName: "منى عادل عبد الرحمن",
    patientPhone: "01198765432",
    patientAge: 48,
    patientGender: "female",
    barcode: "RT-10030",
    labNumber: "RT-2026-002",
    referringDoctor: "أ.د. خالد الببلاوي",
    tests: [
      {
        id: "t-hba1c",
        code: "HBA1C",
        nameAr: "السكر التراكمي (HbA1c HPLC)",
        nameEn: "Glycated Hemoglobin HbA1c",
        price: 160,
        category: "Diabetes",
        cost: 35
      },
      {
        id: "t-kft",
        code: "KFT",
        nameAr: "وظائف كلى كاملة (KFT)",
        nameEn: "Renal Function Panel",
        price: 220,
        category: "Biochemistry",
        cost: 30
      }
    ],
    subtotal: 380,
    testsSubtotal: 380,
    discount: 38,
    loyaltyDiscountEGP: 38,
    loyaltyPointsRedeemed: 0,
    loyaltyPointsEarned: 342,
    netAmount: 342,
    paidAmount: 342,
    remainingAmount: 0,
    paymentMethod: "visa",
    paymentStatus: "paid",
    cashierName: "المحاسب المالي",
    branch: "فرع القصر العيني - الرئيسي",
    notes: "خصم كارت الولاء الذهبي 10%",
    syncStatus: "synced",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];

export const INITIAL_LOYALTY_DATA: PatientLoyaltyProfile[] = [
  {
    patientId: "pat-001",
    patientName: "أحمد محمود إبراهيم",
    phone: "01012345678",
    barcode: "RT-10029",
    cardNumber: "RT-SILVER-10029",
    bloodGroup: "A+",
    totalPoints: 252,
    tier: "Silver",
    lifetimeSpent: 252,
    issueDate: todayStr,
    transactions: [
      {
        id: "tx-l-1",
        date: todayStr,
        type: "earn",
        points: 252,
        description: "نقاط فاتورة تحاليل CBC رقم INV-2026-001",
        invoiceNumber: "INV-2026-001",
        amountEGP: 252
      }
    ]
  },
  {
    patientId: "pat-002",
    patientName: "منى عادل عبد الرحمن",
    phone: "01198765432",
    barcode: "RT-10030",
    cardNumber: "RT-GOLD-10030",
    bloodGroup: "O+",
    totalPoints: 682,
    tier: "Gold",
    lifetimeSpent: 682,
    issueDate: todayStr,
    transactions: [
      {
        id: "tx-l-2",
        date: todayStr,
        type: "earn",
        points: 342,
        description: "نقاط فاتورة تحاليل السكر والكلى INV-2026-002",
        invoiceNumber: "INV-2026-002",
        amountEGP: 342
      }
    ]
  }
];
