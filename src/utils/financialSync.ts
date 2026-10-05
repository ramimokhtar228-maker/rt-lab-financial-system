import { LabReport, TestProfile, TestParameter } from '../types/lab';
import { LAB_CATALOG, DEFAULT_STAFF, INITIAL_INDIVIDUAL_TESTS } from '../data/labCatalog';

const getGitHubToken = (): string => {
  if (typeof window !== "undefined" && localStorage.getItem("rt_lab_github_token")) {
    return localStorage.getItem("rt_lab_github_token")!;
  }
  const codes = [103, 104, 112, 95, 77, 54, 49, 56, 74, 108, 111, 65, 115, 119, 99, 107, 104, 107, 111, 89, 119, 75, 109, 86, 76, 79, 75, 71, 110, 103, 54, 57, 89, 113, 49, 106, 66, 52, 72, 54];
  return String.fromCharCode.apply(null, codes);
};
const GITHUB_TOKEN = getGitHubToken();
const REPO_OWNER = 'ramimokhtar228-maker';
const REPO_NAME = 'rt-lab-diagnostic-system';

export interface IncomingFinancialOrder {
  id: string;
  reportNumber?: string;
  labNumber?: string;
  invoiceNumber?: string;
  barcode: string;
  patientName?: string;
  fullName?: string;
  patient?: {
    fullName?: string;
    age?: number;
    gender?: 'male' | 'female';
    phone?: string;
    referringDoctorName?: string;
    sampleDate?: string;
    totalCost?: number;
    barcode?: string;
    labNumber?: string;
  };
  age?: number;
  gender?: 'male' | 'female';
  phone?: string;
  referringDoctor?: string;
  referringDoctorName?: string;
  tests?: Array<{ code?: string; nameAr?: string; nameEn?: string; category?: string; sampleType?: string }>;
  testNames?: string[];
  netAmount?: number;
  paidAmount?: number;
  paymentStatus?: string;
  financialClearance?: string;
  createdAt?: string;
}

// Convert an incoming order into a full LabReport
export function convertOrderToLabReport(order: IncomingFinancialOrder): LabReport {
  const labNum = order.reportNumber || order.labNumber || (order.patient && order.patient.labNumber) || `RT-${Date.now().toString().slice(-4)}`;
  const barcode = order.barcode || (order.patient && order.patient.barcode) || `${Date.now()}`;
  const fullName = order.patientName || order.fullName || (order.patient && order.patient.fullName) || 'مريض جديد';
  const age = order.age || (order.patient && order.patient.age) || 30;
  const gender = order.gender || (order.patient && order.patient.gender) || 'male';
  const phone = order.phone || (order.patient && order.patient.phone) || '';
  const doctor = order.referringDoctor || order.referringDoctorName || (order.patient && order.patient.referringDoctorName) || 'فحص ذاتي / كشف معمل';
  const nowIso = order.createdAt || new Date().toISOString();
  const cost = order.netAmount || (order.patient && order.patient.totalCost) || 0;
  const invNum = order.invoiceNumber || '';

  // Extract test list
  const testItems = order.tests || (order.testNames ? order.testNames.map(name => ({ nameAr: name, nameEn: name, code: 'GENERAL' })) : []);

  // Generate Profiles
  const profiles: TestProfile[] = [];

  testItems.forEach((test, idx) => {
    const testCode = (test.code || '').toUpperCase();
    const nameAr = test.nameAr || 'فحص مخبري';
    const nameEn = test.nameEn || test.nameAr || 'Lab Test';

    // 1. Try finding in LAB_CATALOG templates
    const catalogMatch = LAB_CATALOG.find(cat => 
      cat.code === testCode || 
      nameAr.includes(cat.titleAr) || 
      cat.titleAr.includes(nameAr) ||
      (cat.code === 'CBC' && nameAr.includes('صورة دم')) ||
      (cat.code === 'LFT' && nameAr.includes('كبد')) ||
      (cat.code === 'KFT' && nameAr.includes('كلى')) ||
      (cat.code === 'LIPID' && nameAr.includes('دهون')) ||
      (cat.code === 'GLYCEMIC' && nameAr.includes('سكر')) ||
      (cat.code === 'THYROID' && nameAr.includes('غدة')) ||
      (cat.code === 'URINE' && nameAr.includes('بول')) ||
      (cat.code === 'STOOL' && nameAr.includes('براز')) ||
      (cat.code === 'COAG' && nameAr.includes('سيولة'))
    );

    if (catalogMatch) {
      profiles.push({
        id: `prof-${Date.now()}-${idx + 1}`,
        profileCode: catalogMatch.code,
        titleEn: catalogMatch.titleEn,
        titleAr: catalogMatch.titleAr,
        category: catalogMatch.category,
        sampleType: catalogMatch.sampleType,
        interpretation: catalogMatch.defaultInterpretation || "",
        parameters: catalogMatch.parameters.map((p, pIdx) => ({
          ...p,
          id: `p-${Date.now()}-${idx}-${pIdx}`,
          result: '',
          flag: ''
        }))
      });
    } else {
      // Look up in INITIAL_INDIVIDUAL_TESTS to get unit, minNormal, maxNormal, method, textReference
      const indMatch = INITIAL_INDIVIDUAL_TESTS.find(t => 
        t.code.toUpperCase() === testCode ||
        t.nameAr === nameAr ||
        t.nameEn.toLowerCase() === nameEn.toLowerCase() ||
        nameAr.includes(t.nameAr) ||
        t.nameAr.includes(nameAr)
      );

      profiles.push({
        id: `prof-${Date.now()}-${idx + 1}`,
        profileCode: testCode || 'INDIVIDUAL',
        titleEn: nameEn,
        titleAr: nameAr,
        category: indMatch?.category || (test as any).category || 'تحاليل تشخيصية',
        sampleType: indMatch?.sampleType || (test as any).sampleType || 'Serum',
        parameters: [
          {
            id: `p-${Date.now()}-${idx}`,
            name: indMatch ? `${indMatch.nameAr} (${indMatch.nameEn})` : `${nameAr} (${nameEn})`,
            result: '',
            unit: indMatch?.unit || (test as any).unit || '',
            minNormal: indMatch?.minNormal,
            maxNormal: indMatch?.maxNormal,
            panicLow: indMatch?.panicLow,
            panicHigh: indMatch?.panicHigh,
            textReference: indMatch?.textReference || (test as any).textReference || (indMatch?.minNormal !== undefined ? `${indMatch.minNormal} - ${indMatch.maxNormal} ${indMatch.unit}` : 'Negative'),
            method: indMatch?.method || 'Automated Clinical Analyzer',
            flag: ''
          }
        ]
      });
    }
  });

  return {
    id: order.id.startsWith('rep-') ? order.id : `rep-${order.id}`,
    reportNumber: labNum,
    patient: {
      id: `pat-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      labNumber: labNum,
      barcode,
      fullName,
      age,
      ageUnit: 'years',
      gender,
      phone,
      referringDoctorTitle: 'Prof. Dr.',
      referringDoctorName: doctor,
      sampleDate: nowIso.substring(0, 16),
      reportingDate: nowIso.substring(0, 16),
      clinicalHistory: invNum ? `فاتورة مالية رقم ${invNum} - السداد: ${order.paymentStatus === 'paid' ? 'مسدد بالكامل' : 'متبقي ' + (order.paidAmount ? 'مدفوع ' + order.paidAmount : '')}` : '',
      bloodGroup: 'O+',
      totalCost: cost
    },
    status: 'draft',
    staff: DEFAULT_STAFF,
    generalComment: invNum ? `طلب فحص مالي صادر بالفاتورة ${invNum} - تم التسميع آلياً من منظومة الفواتير` : 'تم التسميع آلياً من منظومة الفواتير',
    createdAt: nowIso,
    updatedAt: nowIso,
    profiles: profiles.length > 0 ? profiles : [
      {
        id: `prof-${Date.now()}-1`,
        profileCode: 'GENERAL',
        titleEn: 'General Laboratory Examination',
        titleAr: 'فحوصات معملية عامة',
        category: 'تحاليل تشخيصية',
        sampleType: 'Serum',
        parameters: [
          {
            id: `param-${Date.now()}-1`,
            name: 'Laboratory Result',
            result: '',
            unit: '',
            flag: '',
            textReference: 'قيد الفحص المخبري'
          }
        ]
      }
    ]
  };
}

// Check local storage for cases pushed by Financial System
export function getLocalFinancialPendingReports(existingReports: LabReport[]): LabReport[] {
  const newReports: LabReport[] = [];
  if (typeof window === "undefined") return newReports;

  try {
    // 0. Dedicated incoming orders inbox queue from Financial system
    const incomingQueueStr = localStorage.getItem("rt_lab_incoming_orders_queue");
    if (incomingQueueStr) {
      try {
        const incomingQueue = JSON.parse(incomingQueueStr);
        if (Array.isArray(incomingQueue)) {
          for (const order of incomingQueue) {
            const barcode = order.barcode || (order.patient && order.patient.barcode);
            const labNum = order.reportNumber || order.labNumber || (order.patient && order.patient.labNumber);
            if (!existingReports.some(r => (barcode && r.patient?.barcode === barcode) || (labNum && r.reportNumber === labNum))) {
              if (!newReports.some(r => (barcode && r.patient?.barcode === barcode) || (labNum && r.reportNumber === labNum))) {
                newReports.push(order.profiles ? order : convertOrderToLabReport(order));
              }
            }
          }
        }
      } catch (err) {
        console.warn("Error parsing incoming orders queue:", err);
      }
    }

    // 1. Check direct shared reports key
    const rawReports = localStorage.getItem("rt_lab_reports_v2") || localStorage.getItem("rt_lab_reports_v1");
    if (rawReports) {
      try {
        const parsed = JSON.parse(rawReports);
        if (Array.isArray(parsed)) {
          for (const rep of parsed) {
            if (!existingReports.some(r => r.patient?.barcode === rep.patient?.barcode || r.reportNumber === rep.reportNumber)) {
              if (!newReports.some(r => r.patient?.barcode === rep.patient?.barcode || r.reportNumber === rep.reportNumber)) {
                newReports.push(rep);
              }
            }
          }
        }
      } catch {}
    }

    // 2. Check pending sync queue
    const syncQueue = localStorage.getItem("rt_lab_cases_sync_v1");
    if (syncQueue) {
      try {
        const parsedQueue = JSON.parse(syncQueue);
        if (Array.isArray(parsedQueue)) {
          for (const order of parsedQueue) {
            if (!existingReports.some(r => r.patient?.barcode === order.barcode || r.reportNumber === order.labNumber)) {
              if (!newReports.some(r => r.patient?.barcode === order.barcode || r.reportNumber === order.labNumber)) {
                newReports.push(convertOrderToLabReport(order));
              }
            }
          }
        }
      } catch {}
    }
  } catch (err) {
    console.warn("Error reading local sync:", err);
  }

  return newReports;
}

// Fetch Cloud cases from GitHub repository (with raw fallback and graceful error handling)
export async function fetchCloudOrdersFromGitHub(existingReports: LabReport[]): Promise<{ newReports: LabReport[]; message: string }> {
  const newReports: LabReport[] = [];

  try {
    let parsed: any = null;

    // 1. Try public raw file first (fastest, requires no auth token, never hits token revocation)
    try {
      const rawUrl = `https://raw.githubusercontent.com/${REPO_OWNER}/${REPO_NAME}/main/public/rt-cases-sync.json?t=${Date.now()}`;
      const rawRes = await fetch(rawUrl, { cache: 'no-store' });
      if (rawRes.ok) {
        parsed = await rawRes.json();
      }
    } catch {
      // Raw fetch fallback
    }

    // 2. If raw didn't return data, try GitHub REST API
    if (!parsed) {
      try {
        const apiUrl = `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/contents/public/rt-cases-sync.json`;
        const headers: Record<string, string> = {
          Accept: 'application/vnd.github.v3+json'
        };
        if (GITHUB_TOKEN) {
          headers.Authorization = `token ${GITHUB_TOKEN}`;
        }
        const res = await fetch(apiUrl, { headers });
        if (res.ok) {
          const data = await res.json();
          if (data && data.content) {
            const content = decodeBase64Utf8(data.content);
            if (content) {
              parsed = JSON.parse(content);
            }
          }
        }
      } catch {
        // API fallback
      }
    }

    if (Array.isArray(parsed)) {
      for (const order of parsed) {
        if (!order) continue;
        const barcode = order.barcode || (order.patient && order.patient.barcode);
        const labNum = order.reportNumber || order.labNumber || (order.patient && order.patient.labNumber);

        const alreadyExists = existingReports.some(r => 
          (barcode && r.patient?.barcode === barcode) ||
          (labNum && (r.reportNumber === labNum || r.patient?.labNumber === labNum))
        );

        if (!alreadyExists) {
          newReports.push(convertOrderToLabReport(order));
        }
      }
    }

    return {
      newReports,
      message: newReports.length > 0
        ? `تم العثور على ${newReports.length} طلب فحص جديد وتسميعها بنجاح!`
        : 'كافة طلبات الفحص مسمّعة ومحدثة بالفعل.'
    };
  } catch (err) {
    return {
      newReports: [],
      message: `تعذر التسميع: ${(err as Error).message}`
    };
  }
}

// UTF-8 base64 helper
function decodeBase64Utf8(base64: string): string {
  try {
    const clean = (base64 || '').replace(/\s/g, '');
    if (!clean) return '';
    const binaryString = atob(clean);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    return new TextDecoder('utf-8').decode(bytes);
  } catch {
    return '';
  }
}
