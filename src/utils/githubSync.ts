import { IncomeRecord } from '../types';

export interface DiagnosticPatientCase {
  id: string;
  labNumber: string;
  barcode: string;
  fullName: string;
  age: number;
  gender: 'male' | 'female';
  phone: string;
  referringDoctorTitle?: string;
  referringDoctorName?: string;
  sampleDate: string;
  reportingDate?: string;
  status?: string;
  totalCost?: number;
  testNames?: string[];
  alreadyInAccounts?: boolean;
}

export interface GitHubSyncResult {
  success: boolean;
  message: string;
  data?: unknown;
  casesFound?: DiagnosticPatientCase[];
}

export async function testGitHubConnection(
  token: string,
  owner: string,
  repo: string
): Promise<{ success: boolean; message: string; repoInfo?: { name: string; stars: number; defaultBranch: string; updatedAt: string } }> {
  try {
    const res = await fetch(`https://api.github.com/repos/${owner}/${repo}`, {
      headers: {
        Authorization: `token ${token.trim()}`,
        Accept: 'application/vnd.github.v3+json'
      }
    });

    if (!res.ok) {
      if (res.status === 401) {
        return { success: false, message: 'رمز الدخول (Token) غير صالح أو منتهي الصلاحية.' };
      }
      if (res.status === 404) {
        return { success: false, message: `المستودع ${owner}/${repo} غير موجود أو الحساب لا يملك صلاحيات الوصول إليه.` };
      }
      return { success: false, message: `خطأ من GitHub API (رمز ${res.status}): ${res.statusText}` };
    }

    const data = await res.json();
    return {
      success: true,
      message: `تم الاتصال بنجاح بمستودع نظام التشخيص: ${data.full_name}`,
      repoInfo: {
        name: data.name,
        stars: data.stargazers_count,
        defaultBranch: data.default_branch,
        updatedAt: data.updated_at
      }
    };
  } catch (err) {
    return {
      success: false,
      message: `تعذر الاتصال بخوادم GitHub: ${(err as Error).message || 'خطأ في الشبكة'}`
    };
  }
}

export async function fetchDiagnosticCases(
  token: string,
  owner: string,
  repo: string
): Promise<GitHubSyncResult> {
  try {
    // 1. First check if a shared sync file exists in public/rt-cases-sync.json or src/data/initialData.ts
    const initialDataRes = await fetch(
      `https://api.github.com/repos/${owner}/${repo}/contents/src/data/initialData.ts`,
      {
        headers: {
          Authorization: `token ${token.trim()}`,
          Accept: 'application/vnd.github.v3+json'
        }
      }
    );

    const cases: DiagnosticPatientCase[] = [];

    if (initialDataRes.ok) {
      const fileData = await initialDataRes.json();
      const content = decodeBase64Utf8(fileData.content);

      // Parse patient reports from INITIAL_REPORTS in initialData.ts
      const reportBlocks = content.split(/\{\s*id:\s*['"]rep-/g);
      
      for (let i = 1; i < reportBlocks.length; i++) {
        const block = reportBlocks[i];
        
        const reportNumberMatch = block.match(/reportNumber:\s*['"]([^'"]+)['"]/);
        const fullNameMatch = block.match(/fullName:\s*['"]([^'"]+)['"]/);
        const barcodeMatch = block.match(/barcode:\s*['"]([^'"]+)['"]/);
        const ageMatch = block.match(/age:\s*([0-9]+)/);
        const genderMatch = block.match(/gender:\s*['"](male|female)['"]/);
        const phoneMatch = block.match(/phone:\s*['"]([^'"]+)['"]/);
        const doctorMatch = block.match(/referringDoctorName:\s*['"]([^'"]+)['"]/);
        const statusMatch = block.match(/status:\s*['"]([^'"]+)['"]/);
        const sampleDateMatch = block.match(/sampleDate:\s*['"]([^'"]+)['"]/);

        // Find test profiles
        const profileTitles: string[] = [];
        const titleArMatches = block.matchAll(/titleAr:\s*['"]([^'"]+)['"]/g);
        for (const m of titleArMatches) {
          profileTitles.push(m[1]);
        }

        if (fullNameMatch && barcodeMatch) {
          cases.push({
            id: `diag-${i}`,
            labNumber: reportNumberMatch ? reportNumberMatch[1] : `RT-${i}`,
            barcode: barcodeMatch[1],
            fullName: fullNameMatch[1],
            age: ageMatch ? parseInt(ageMatch[1], 10) : 35,
            gender: genderMatch ? (genderMatch[1] as 'male' | 'female') : 'male',
            phone: phoneMatch ? phoneMatch[1] : '01000000000',
            referringDoctorName: doctorMatch ? doctorMatch[1] : 'طبيب باطنة',
            status: statusMatch ? statusMatch[1] : 'verified',
            sampleDate: sampleDateMatch ? sampleDateMatch[1] : new Date().toISOString(),
            testNames: profileTitles.length > 0 ? profileTitles : ['تحاليل روتينية ومناعة']
          });
        }
      }
    }

    // 2. Also check if public/rt-cases-sync.json exists (which stores dynamically synced cases)
    try {
      const syncRes = await fetch(
        `https://api.github.com/repos/${owner}/${repo}/contents/public/rt-cases-sync.json`,
        {
          headers: {
            Authorization: `token ${token.trim()}`,
            Accept: 'application/vnd.github.v3+json'
          }
        }
      );
      if (syncRes.ok) {
        const syncData = await syncRes.json();
        const contentStr = decodeBase64Utf8(syncData.content);
        const parsed = JSON.parse(contentStr);
        if (Array.isArray(parsed)) {
          for (const item of parsed) {
            if (!cases.some(c => c.barcode === item.barcode || c.labNumber === item.labNumber)) {
              cases.unshift(item);
            }
          }
        }
      }
    } catch {
      // Optional file not yet created
    }

    return {
      success: true,
      message: `تم جلب ${cases.length} حالة مسجلة من منظومة تحاليل RT التشخيصية.`,
      casesFound: cases
    };
  } catch (err) {
    return {
      success: false,
      message: `فشل استرجاع الحالات من GitHub: ${(err as Error).message}`
    };
  }
}

export async function pushFinancialDataToRepo(
  token: string,
  owner: string,
  repo: string,
  incomeRecords: IncomeRecord[],
  labSummary: {
    totalRevenue: number;
    totalExpenses: number;
    netProfit: number;
    ceoShare: number;
    labShare: number;
    casesCount: number;
  }
): Promise<GitHubSyncResult> {
  try {
    const filePath = 'public/rt-financial-sync.json';
    const apiUrl = `https://api.github.com/repos/${owner}/${repo}/contents/${filePath}`;

    // 1. Get existing file sha if it exists
    let existingSha: string | undefined;
    try {
      const getRes = await fetch(apiUrl, {
        headers: {
          Authorization: `token ${token.trim()}`,
          Accept: 'application/vnd.github.v3+json'
        }
      });
      if (getRes.ok) {
        const fileInfo = await getRes.json();
        existingSha = fileInfo.sha;
      }
    } catch {
      // file might not exist yet
    }

    // 2. Prepare payload
    const syncPayload = {
      system: 'RT Lab Financial & Accounting ERP',
      syncedAt: new Date().toISOString(),
      summary: labSummary,
      clearedInvoices: incomeRecords.map(rec => ({
        invoiceNumber: rec.invoiceNumber,
        labNumber: rec.labNumber,
        barcode: rec.barcode,
        patientName: rec.patientName,
        phone: rec.patientPhone,
        testsCount: rec.tests.length,
        testsList: rec.tests.map(t => t.nameAr),
        netAmount: rec.netAmount,
        paidAmount: rec.paidAmount,
        paymentStatus: rec.paymentStatus,
        financialClearance: rec.paymentStatus === 'paid' ? 'CLEARED_FOR_RELEASE' : 'PAYMENT_PENDING'
      }))
    };

    const contentJson = JSON.stringify(syncPayload, null, 2);
    const contentBase64 = encodeBase64Utf8(contentJson);

    const bodyPayload: Record<string, unknown> = {
      message: `تسميع مالي ومزامنة الحالات: ${incomeRecords.length} حالة مسددة [RT Lab Accounting]`,
      content: contentBase64,
      branch: 'main'
    };

    if (existingSha) {
      bodyPayload.sha = existingSha;
    }

    const putRes = await fetch(apiUrl, {
      method: 'PUT',
      headers: {
        Authorization: `token ${token.trim()}`,
        Accept: 'application/vnd.github.v3+json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(bodyPayload)
    });

    if (!putRes.ok) {
      const errData = await putRes.json().catch(() => ({}));
      return {
        success: false,
        message: `فشل حفظ التسميع على المستودع: ${errData.message || putRes.statusText}`
      };
    }

    return {
      success: true,
      message: `تم التسميع بنجاح ونقل إشعارات الدفع للحالات على مستودع GitHub!`
    };
  } catch (err) {
    return {
      success: false,
      message: `حدث خطأ أثناء رفع بيانات التسميع: ${(err as Error).message}`
    };
  }
}

// Helpers for UTF-8 Base64 handling
function encodeBase64Utf8(str: string): string {
  return btoa(
    encodeURIComponent(str).replace(/%([0-9A-F]{2})/g, (_, p1) =>
      String.fromCharCode(parseInt(p1, 16))
    )
  );
}

function decodeBase64Utf8(base64: string): string {
  const binaryString = atob(base64.replace(/\s/g, ''));
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return new TextDecoder('utf-8').decode(bytes);
}
