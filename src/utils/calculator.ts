import { ResultFlag, TestParameter, TestProfile } from '../types/lab';

/**
 * Calculates flag based on numerical or qualitative results
 */
export function calculateFlag(
  resultStr: string,
  minNormal?: number,
  maxNormal?: number,
  panicLow?: number,
  panicHigh?: number
): ResultFlag {
  if (!resultStr || resultStr.trim() === '') return '';

  const num = parseFloat(resultStr);
  if (isNaN(num)) {
    const lower = resultStr.toLowerCase().trim();
    if (
      lower.includes('positive') ||
      lower.includes('reactive') ||
      lower.includes('detected') ||
      lower.includes('abnormal') ||
      lower.includes('high') ||
      lower === '++' ||
      lower === '+++' ||
      lower === '++++' ||
      lower.includes('heavy') ||
      lower.includes('sheets')
    ) {
      return 'ABNORMAL';
    }
    return 'NORMAL';
  }

  // Panic / Critical checks
  if (panicLow !== undefined && num <= panicLow) {
    return 'PANIC_LOW';
  }
  if (panicHigh !== undefined && num >= panicHigh) {
    return 'PANIC_HIGH';
  }

  // Normal checks
  if (minNormal !== undefined && num < minNormal) {
    return 'LOW';
  }
  if (maxNormal !== undefined && num > maxNormal) {
    return 'HIGH';
  }

  return 'NORMAL';
}

/**
 * Calculates pointer position (0% - 100%) on a visual chart where:
 * 0% - 25% is Low Zone
 * 25% - 75% is Normal Zone
 * 75% - 100% is High Zone
 */
export function getChartPointerPosition(
  resultStr: string,
  minNormal?: number,
  maxNormal?: number
): { positionPercent: number; zone: 'low' | 'normal' | 'high' | 'unknown' } {
  const num = parseFloat(resultStr);
  if (isNaN(num) || minNormal === undefined || maxNormal === undefined || maxNormal <= minNormal) {
    return { positionPercent: 50, zone: 'unknown' };
  }

  const normalSpan = maxNormal - minNormal;

  if (num < minNormal) {
    // Falls in low region (0 to 25%)
    const diff = minNormal - num;
    const maxLowRange = normalSpan * 0.8 || 1;
    const ratio = Math.min(1, Math.max(0, diff / maxLowRange));
    const pos = 25 - ratio * 20; // between 5% and 25%
    return { positionPercent: Math.max(4, Math.round(pos)), zone: 'low' };
  }

  if (num > maxNormal) {
    // Falls in high region (75 to 100%)
    const diff = num - maxNormal;
    const maxHighRange = normalSpan * 0.8 || 1;
    const ratio = Math.min(1, Math.max(0, diff / maxHighRange));
    const pos = 75 + ratio * 20; // between 75% and 95%
    return { positionPercent: Math.min(96, Math.round(pos)), zone: 'high' };
  }

  // Falls in normal region (25 to 75%)
  const ratio = (num - minNormal) / normalSpan;
  const pos = 25 + ratio * 50;
  return { positionPercent: Math.round(pos), zone: 'normal' };
}

/**
 * Formats reference interval for display in column 5
 */
export function formatReferenceDisplay(param: TestParameter): string {
  if (param.textReference && param.textReference.trim().length > 0) {
    return param.textReference;
  }

  if (param.minNormal !== undefined && param.maxNormal !== undefined) {
    return `${param.minNormal} - ${param.maxNormal} ${param.unit}`.trim();
  }

  if (param.maxNormal !== undefined) {
    return `< ${param.maxNormal} ${param.unit}`.trim();
  }

  if (param.minNormal !== undefined) {
    return `> ${param.minNormal} ${param.unit}`.trim();
  }

  return 'Normal';
}

/**
 * Helper to extract numeric value from parameter by search patterns
 */
export function cleanParamName(str: string): string {
  return str.toLowerCase().replace(/[^a-z0-9؀-ۿ]/gi, '');
}

export function matchesParameter(paramName: string, matcher: string): boolean {
  const cleanName = cleanParamName(paramName);
  const cleanMatcher = cleanParamName(matcher);
  
  if (cleanMatcher === 'mch') {
    if (cleanName.includes('mchc')) return false;
    return cleanName === 'mch' || cleanName.includes('meancorpuscularhemoglobin') && !cleanName.includes('conc');
  }
  if (cleanMatcher === 'mchc') {
    return cleanName.includes('mchc') || (cleanName.includes('meancorpuscularhemoglobin') && cleanName.includes('conc'));
  }
  if (cleanMatcher === 'mcv') {
    return cleanName.includes('mcv') || cleanName.includes('meancorpuscularvol');
  }
  if (cleanMatcher === 'rbc') {
    return cleanName.includes('rbc') || cleanName.includes('redblood') || cleanName.includes('حمراء');
  }
  if (cleanMatcher === 'hb' || cleanMatcher === 'hgb' || cleanMatcher === 'hemoglobin') {
    if (cleanName.includes('hba1c') || cleanName.includes('a1c') || cleanName.includes('تراكمي')) return false;
    return cleanName.includes('hemoglobin') || cleanName.includes('haemoglobin') || cleanName.includes('hgb') || cleanName.includes('hb') || cleanName.includes('هيموجلوبين');
  }
  if (cleanMatcher === 'pcv' || cleanMatcher === 'hct' || cleanMatcher === 'hematocrit') {
    return cleanName.includes('hematocrit') || cleanName.includes('haematocrit') || cleanName.includes('hct') || cleanName.includes('pcv') || cleanName.includes('هيماتوكريت');
  }
  if (cleanMatcher === 'wbc' || cleanMatcher === 'tlc') {
    return cleanName.includes('wbc') || cleanName.includes('tlc') || cleanName.includes('leucocytic') || cleanName.includes('leukocyte') || cleanName.includes('whiteblood');
  }
  if (cleanMatcher === 'neutrophil' || cleanMatcher === 'neut') {
    if (cleanName.includes('absolute') || cleanName.includes('anc')) return false;
    return cleanName.includes('neutrophil') || cleanName.includes('segmented') || cleanName.includes('neut');
  }
  if (cleanMatcher === 'lymphocyte' || cleanMatcher === 'lymph') {
    if (cleanName.includes('absolute') || cleanName.includes('alc')) return false;
    return cleanName.includes('lymphocyte') || cleanName.includes('lymph');
  }
  
  if (cleanName.includes(cleanMatcher)) return true;
  return paramName.toLowerCase().includes(matcher.toLowerCase());
}

export function calculateBloodIndices(rbc: number, hgb: number, hct?: number) {
  const calculatedHct = hct !== undefined && hct > 0 ? hct : Number((hgb * 3).toFixed(1));
  const mcv = rbc > 0 ? Number(((calculatedHct * 10) / rbc).toFixed(1)) : 0;
  const mch = rbc > 0 ? Number(((hgb * 10) / rbc).toFixed(1)) : 0;
  const mchc = calculatedHct > 0 ? Number(((hgb * 100) / calculatedHct).toFixed(1)) : 0;
  return { hct: calculatedHct, mcv, mch, mchc };
}

function getVal(params: TestParameter[], matchers: string[]): number | null {
  for (const p of params) {
    for (const m of matchers) {
      if (matchesParameter(p.name, m) || ((p as any).code && matchesParameter((p as any).code, m))) {
        const val = parseFloat(p.result);
        if (!isNaN(val)) return val;
      }
    }
  }
  return null;
}

/**
 * Helper to update parameter value if found in array
 */
function setVal(
  params: TestParameter[],
  matchers: string[],
  calculatedVal: number | string,
  calcNote?: string
): boolean {
  for (let i = 0; i < params.length; i++) {
    const p = params[i];
    for (const m of matchers) {
      if (matchesParameter(p.name, m) || ((p as any).code && matchesParameter((p as any).code, m))) {
        const resStr = typeof calculatedVal === 'number' ? calculatedVal.toFixed(1).replace(/\.0$/, '') : String(calculatedVal);
        params[i] = {
          ...p,
          result: resStr,
          flag: calculateFlag(resStr, p.minNormal, p.maxNormal, p.panicLow, p.panicHigh),
          notes: calcNote || p.notes || 'Auto-calculated'
        };
        return true;
      }
    }
  }
  return false;
}

/**
 * Runs Clinical Laboratory Automatic Calculations:
 * - CBC (MCV, MCH, MCHC, Absolute counts ANC/ALC/AMC/AEC/ABC, NLR)
 * - HbA1c to eAG (Estimated Average Glucose)
 * - HOMA-IR, HOMA-B, QUICKI
 * - Lipid Profile (VLDL, LDL-C Friedewald, Non-HDL, Risk Ratios)
 * - Albumin/Creatinine Ratio (ACR) & UPCR
 * - Corrected Calcium (CA-I)
 * - Liver (Globulin, A/G Ratio, Indirect Bilirubin, AST/ALT De Ritis)
 * - Renal (BUN/Creatinine Ratio, eGFR CKD-EPI)
 * - Thyroid (Free T4 Index)
 * - Iron (Transferrin Saturation %, UIBC)
 */
export function runAutomaticCalculations(
  parameters: TestParameter[],
  patientContext?: { age?: number; gender?: 'male' | 'female' }
): { updatedParams: TestParameter[]; calculationsApplied: string[] } {
  const paramsCopy: TestParameter[] = JSON.parse(JSON.stringify(parameters));
  const applied: string[] = [];

  // ==========================================
  // 1. CBC CALCULATIONS
  // ==========================================
  const rbc = getVal(paramsCopy, ['rbc', 'r.b.c', 'red blood cell', 'كرات الدم الحمراء']);
  const hgb = getVal(paramsCopy, ['hemoglobin', 'haemoglobin', 'hgb', 'hb', 'الهيموجلوبين']);
  let hct = getVal(paramsCopy, ['hematocrit', 'haematocrit', 'hct', 'p.c.v', 'pcv', 'الهيماتوكريت']);
  const wbc = getVal(paramsCopy, ['wbc', 'white blood cell', 'total leucocytic', 'tlc', 'كرات الدم البيضاء']);

  // If HCT is missing but RBC and MCV exist, or if HCT is missing and HGB exists (Rule of three: HCT ~= HGB * 3)
  if (hct === null && hgb !== null) {
    const approxHct = Number((hgb * 3).toFixed(1));
    if (setVal(paramsCopy, ['hematocrit', 'hct', 'pcv'], approxHct, 'Calculated (HGB × 3)')) {
      hct = approxHct;
      applied.push(`HCT (~${approxHct}%)`);
    }
  }

  // MCV = (HCT * 10) / RBC
  if (hct !== null && rbc !== null && rbc > 0) {
    const mcvCalc = Number(((hct * 10) / rbc).toFixed(1));
    if (setVal(paramsCopy, ['mcv', 'mean corpuscular volume'], mcvCalc, 'Calculated: (HCT × 10) / RBC')) {
      applied.push(`MCV (${mcvCalc} fL)`);
    }
  }

  // MCH = (HGB * 10) / RBC
  if (hgb !== null && rbc !== null && rbc > 0) {
    const mchCalc = Number(((hgb * 10) / rbc).toFixed(1));
    if (setVal(paramsCopy, ['mch', 'mean corpuscular hemoglobin'], mchCalc, 'Calculated: (HGB × 10) / RBC')) {
      applied.push(`MCH (${mchCalc} pg)`);
    }
  }

  // MCHC = (HGB * 100) / HCT
  if (hgb !== null && hct !== null && hct > 0) {
    const mchcCalc = Number(((hgb * 100) / hct).toFixed(1));
    if (setVal(paramsCopy, ['mchc', 'mean corpuscular hemoglobin concentration'], mchcCalc, 'Calculated: (HGB × 100) / HCT')) {
      applied.push(`MCHC (${mchcCalc} g/dL)`);
    }
  }

  // WBC Differentials (Absolute Counts & NLR)
  const neutroPct = getVal(paramsCopy, ['neutrophil', 'segmented', 'neut %']);
  const lymphPct = getVal(paramsCopy, ['lymphocyte', 'lymph %']);
  const monoPct = getVal(paramsCopy, ['monocyte', 'mono %']);
  const eosPct = getVal(paramsCopy, ['eosinophil', 'eos %']);
  const basoPct = getVal(paramsCopy, ['basophil', 'baso %']);

  if (wbc !== null && wbc > 0) {
    if (neutroPct !== null) {
      const anc = Number(((wbc * neutroPct) / 100).toFixed(2));
      if (setVal(paramsCopy, ['anc', 'absolute neutrophil', 'neutrophils absolute'], anc, 'Calculated: (WBC × Neut%) / 100')) {
        applied.push(`ANC (${anc})`);
      }
    }
    if (lymphPct !== null) {
      const alc = Number(((wbc * lymphPct) / 100).toFixed(2));
      if (setVal(paramsCopy, ['alc', 'absolute lymphocyte', 'lymphocytes absolute'], alc, 'Calculated: (WBC × Lymph%) / 100')) {
        applied.push(`ALC (${alc})`);
      }
    }
    if (monoPct !== null) {
      const amc = Number(((wbc * monoPct) / 100).toFixed(2));
      if (setVal(paramsCopy, ['amc', 'absolute monocyte', 'monocytes absolute'], amc)) {
        applied.push(`AMC (${amc})`);
      }
    }
    if (eosPct !== null) {
      const aec = Number(((wbc * eosPct) / 100).toFixed(2));
      if (setVal(paramsCopy, ['aec', 'absolute eosinophil', 'eosinophils absolute'], aec)) {
        applied.push(`AEC (${aec})`);
      }
    }
    if (basoPct !== null) {
      const abc = Number(((wbc * basoPct) / 100).toFixed(2));
      setVal(paramsCopy, ['abc', 'absolute basophil', 'basophils absolute'], abc);
    }
  }

  // NLR (Neutrophil / Lymphocyte Ratio)
  if (neutroPct !== null && lymphPct !== null && lymphPct > 0) {
    const nlr = Number((neutroPct / lymphPct).toFixed(2));
    if (setVal(paramsCopy, ['nlr', 'neutrophil to lymphocyte ratio', 'neutrophil/lymphocyte'], nlr, 'Normal target < 2.5')) {
      applied.push(`NLR (${nlr})`);
    }
  }

  // Mentzer Index: MCV / RBC
  const effMcv = getVal(paramsCopy, ['mcv', 'm.c.v', 'mean corpuscular volume']);
  if (effMcv !== null && rbc !== null && rbc > 0) {
    const mentzer = Number((effMcv / rbc).toFixed(1));
    const mentzerNote = mentzer < 13 ? 'Mentzer < 13: Suggestive of Beta Thalassemia Trait' : 'Mentzer > 13: Suggestive of Iron Deficiency Anemia';
    if (setVal(paramsCopy, ['mentzer index', 'mentzer'], mentzer, mentzerNote)) {
      applied.push(`Mentzer (${mentzer})`);
    }
  }

  // Plateletcrit (PCT)
  const plt = getVal(paramsCopy, ['platelet', 'plt', 'platelets count']);
  const mpv = getVal(paramsCopy, ['mpv', 'mean platelet volume']);
  if (plt !== null && mpv !== null && mpv > 0) {
    const pct = Number(((plt * mpv) / 10000).toFixed(3));
    if (setVal(paramsCopy, ['pct', 'plateletcrit'], pct, 'Calculated: (PLT × MPV) / 10,000')) {
      applied.push(`PCT (${pct}%)`);
    }
  }

  // ==========================================
  // 2. DIABETES, HbA1c, HOMA-IR & GLUCOSE
  // ==========================================
  const hba1c = getVal(paramsCopy, ['hba1c', 'glycated hemoglobin', 'a1c']);
  if (hba1c !== null && hba1c > 0) {
    // eAG (Estimated Average Glucose) in mg/dL = (28.7 * A1c) - 46.7
    const eagMgDl = Math.round((28.7 * hba1c) - 46.7);
    if (eagMgDl > 30) {
      if (setVal(paramsCopy, ['eag', 'estimated average glucose', 'average blood glucose'], eagMgDl, 'Calculated: (28.7 × HbA1c) - 46.7')) {
        applied.push(`eAG (${eagMgDl} mg/dL)`);
      }
    }
  }

  // HOMA-IR = (Fasting Glucose (mg/dL) * Fasting Insulin (µIU/mL)) / 405
  const fastingGlucose = getVal(paramsCopy, ['fasting blood glucose', 'fbg', 'fasting glucose', 'glucose fasting', 'blood sugar fasting']);
  const fastingInsulin = getVal(paramsCopy, ['fasting insulin', 'insulin fasting', 'serum insulin']);

  if (fastingGlucose !== null && fastingInsulin !== null && fastingGlucose > 0 && fastingInsulin > 0) {
    const homaIr = Number(((fastingGlucose * fastingInsulin) / 405).toFixed(2));
    if (setVal(paramsCopy, ['homa-ir', 'homa ir', 'insulin resistance index'], homaIr, 'Normal: < 1.9, Borderline: 1.9-2.9, Insulin Resistant: > 2.9')) {
      applied.push(`HOMA-IR (${homaIr})`);
    }

    // HOMA-B = (20 * Insulin) / (Glucose - 63)
    if (fastingGlucose > 63) {
      const homaB = Math.round((20 * fastingInsulin) / (fastingGlucose - 63) * 100) / 100;
      if (setVal(paramsCopy, ['homa-b', 'homa b', 'beta cell function'], homaB, 'Normal: ~100%')) {
        applied.push(`HOMA-B (${homaB}%)`);
      }
    }

    // QUICKI = 1 / (log10(Glucose) + log10(Insulin))
    const quicki = Number((1 / (Math.log10(fastingGlucose) + Math.log10(fastingInsulin))).toFixed(3));
    if (setVal(paramsCopy, ['quicki', 'quantitative insulin sensitivity'], quicki, 'Normal: > 0.382')) {
      applied.push(`QUICKI (${quicki})`);
    }
  }

  // ==========================================
  // 3. LIPID PROFILE CALCULATIONS (Friedewald)
  // ==========================================
  const totalChol = getVal(paramsCopy, ['total cholesterol', 'cholesterol total', 'cholesterol']);
  const trig = getVal(paramsCopy, ['triglycerides', 'triglyceride', 'tg ']);
  const hdl = getVal(paramsCopy, ['hdl', 'high-density', 'hdl-c']);

  if (trig !== null) {
    // VLDL = TG / 5 (mg/dL)
    const vldl = Math.round(trig / 5);
    if (setVal(paramsCopy, ['vldl', 'very low-density', 'vldl-c'], vldl, 'Calculated: Triglycerides / 5')) {
      applied.push(`VLDL (${vldl} mg/dL)`);
    }

    // LDL-C (Friedewald) = Total Chol - HDL - (TG / 5) (when TG < 400 mg/dL)
    if (totalChol !== null && hdl !== null && trig < 400) {
      const ldl = Math.round(totalChol - hdl - (trig / 5));
      if (ldl >= 0) {
        if (setVal(paramsCopy, ['ldl', 'low-density', 'ldl-c'], ldl, 'Friedewald Formula: TC - HDL - (TG/5)')) {
          applied.push(`LDL-C (${ldl} mg/dL)`);
        }
      }
    }
  }

  // Non-HDL = Total Chol - HDL
  if (totalChol !== null && hdl !== null) {
    const nonHdl = Math.round(totalChol - hdl);
    if (setVal(paramsCopy, ['non-hdl', 'non hdl'], nonHdl, 'Calculated: Total Cholesterol - HDL')) {
      applied.push(`Non-HDL (${nonHdl} mg/dL)`);
    }

    // Chol / HDL Risk Ratio
    if (hdl > 0) {
      const cholHdlRatio = Number((totalChol / hdl).toFixed(2));
      if (setVal(paramsCopy, ['chol/hdl', 'cholesterol/hdl ratio', 'cardiac risk ratio'], cholHdlRatio, 'Desirable < 4.5')) {
        applied.push(`Chol/HDL (${cholHdlRatio})`);
      }
    }
  }

  // ==========================================
  // 4. CORRECTED CALCIUM (CA-I / Corrected Ca)
  // ==========================================
  // Corrected Ca = Total Ca + 0.8 * (4.0 - Serum Albumin)
  const totalCa = getVal(paramsCopy, ['calcium total', 'total calcium', 'calcium (total)', 'serum calcium', 'ca++']);
  const albumin = getVal(paramsCopy, ['serum albumin', 'albumin (serum)', 'albumin']);

  if (totalCa !== null && albumin !== null && albumin > 0) {
    const correctedCa = Number((totalCa + 0.8 * (4.0 - albumin)).toFixed(2));
    if (setVal(paramsCopy, ['corrected calcium', 'ca-i', 'calcium (corrected)', 'corrected ca'], correctedCa, 'Calculated: Total Ca + 0.8 × (4.0 - Albumin)')) {
      applied.push(`Corrected Ca (${correctedCa} mg/dL)`);
    }
  }

  // ==========================================
  // 5. ALBUMIN / CREATININE RATIO (ACR)
  // ==========================================
  // Microalbumin in urine (mg/L) and Urine Creatinine (mg/dL)
  // ACR (mg/g) = (Microalbumin mg/L / Urine Creatinine mg/dL) * 100
  const microalb = getVal(paramsCopy, ['microalbumin', 'urine albumin', 'albumin in urine']);
  const urineCreat = getVal(paramsCopy, ['urine creatinine', 'creatinine (urine)', 'creatinine urine']);

  if (microalb !== null && urineCreat !== null && urineCreat > 0) {
    const acr = Number(((microalb / urineCreat) * 100).toFixed(1));
    const acrNote = acr < 30 ? 'Normal (< 30 mg/g)' : acr <= 300 ? 'Microalbuminuria (30 - 300 mg/g)' : 'Macroalbuminuria / Clinical Proteinuria (> 300 mg/g)';
    if (setVal(paramsCopy, ['acr', 'albumin/creatinine ratio', 'albumin to creatinine ratio', 'microalbumin/creatinine'], acr, acrNote)) {
      applied.push(`ACR (${acr} mg/g)`);
    }
  }

  // ==========================================
  // 6. LIVER INDICES (Globulin, A/G Ratio, Indirect Bilirubin)
  // ==========================================
  const totalProtein = getVal(paramsCopy, ['total protein', 'protein total', 'total serum protein']);
  if (totalProtein !== null && albumin !== null) {
    const globulin = Number((totalProtein - albumin).toFixed(2));
    if (globulin >= 0) {
      if (setVal(paramsCopy, ['globulin', 'serum globulin'], globulin, 'Calculated: Total Protein - Albumin')) {
        applied.push(`Globulin (${globulin} g/dL)`);
      }

      if (globulin > 0) {
        const agRatio = Number((albumin / globulin).toFixed(2));
        if (setVal(paramsCopy, ['a/g ratio', 'albumin/globulin ratio', 'ag ratio'], agRatio, 'Normal: 1.2 - 2.2')) {
          applied.push(`A/G Ratio (${agRatio})`);
        }
      }
    }
  }

  // Bilirubin (Total - Direct = Indirect)
  const totalBilirubin = getVal(paramsCopy, ['total bilirubin', 'bilirubin total', 't. bili']);
  const directBilirubin = getVal(paramsCopy, ['direct bilirubin', 'bilirubin direct', 'd. bili']);
  if (totalBilirubin !== null && directBilirubin !== null) {
    const indirect = Number(Math.max(0, totalBilirubin - directBilirubin).toFixed(2));
    if (setVal(paramsCopy, ['indirect bilirubin', 'bilirubin indirect', 'ind. bili'], indirect, 'Calculated: Total Bilirubin - Direct Bilirubin')) {
      applied.push(`Indirect Bilirubin (${indirect} mg/dL)`);
    }
  }

  // AST / ALT (De Ritis Ratio)
  const alt = getVal(paramsCopy, ['alt', 'sgpt']);
  const ast = getVal(paramsCopy, ['ast', 'sgot']);
  if (alt !== null && ast !== null && alt > 0) {
    const deRitis = Number((ast / alt).toFixed(2));
    if (setVal(paramsCopy, ['ast/alt', 'sgot/sgpt', 'de ritis ratio'], deRitis, 'Normal < 1.0 (Elevated > 2.0 in alcoholic liver disease/cirrhosis)')) {
      applied.push(`AST/ALT Ratio (${deRitis})`);
    }
  }

  // ==========================================
  // 7. RENAL INDICES (BUN/Creatinine & eGFR)
  // ==========================================
  const serumCreat = getVal(paramsCopy, ['serum creatinine', 'creatinine serum', 's. creatinine', 'creatinine']);
  const serumBun = getVal(paramsCopy, ['bun', 'blood urea nitrogen']);
  const bloodUrea = getVal(paramsCopy, ['blood urea', 'urea (blood)', 'urea']);

  if (serumCreat !== null && serumCreat > 0) {
    const bunVal = serumBun !== null ? serumBun : (bloodUrea !== null ? bloodUrea / 2.14 : null);
    if (bunVal !== null) {
      const bunCrRatio = Number((bunVal / serumCreat).toFixed(1));
      if (setVal(paramsCopy, ['bun/creatinine ratio', 'bun/cr ratio'], bunCrRatio, 'Normal: 10 - 20')) {
        applied.push(`BUN/Cr Ratio (${bunCrRatio})`);
      }
    }

    // eGFR (CKD-EPI 2021)
    if (patientContext?.age && patientContext.age >= 18) {
      const age = patientContext.age;
      const isFemale = patientContext.gender === 'female';
      const k = isFemale ? 0.7 : 0.9;
      const a = isFemale ? -0.241 : -0.302;
      const fFactor = isFemale ? 1.012 : 1.0;
      const scrK = serumCreat / k;
      const egfr = Math.round(
        142 *
        Math.pow(Math.min(scrK, 1), a) *
        Math.pow(Math.max(scrK, 1), -1.2) *
        Math.pow(0.9938, age) *
        fFactor
      );

      let egfrStage = 'Stage 1 (Normal > 90)';
      if (egfr < 15) egfrStage = 'Stage 5 (Kidney Failure < 15)';
      else if (egfr < 30) egfrStage = 'Stage 4 (Severe 15-29)';
      else if (egfr < 60) egfrStage = 'Stage 3 (Moderate 30-59)';
      else if (egfr < 90) egfrStage = 'Stage 2 (Mild 60-89)';

      if (setVal(paramsCopy, ['egfr', 'ckd-epi', 'estimated gfr'], egfr, `CKD-EPI: ${egfrStage}`)) {
        applied.push(`eGFR (${egfr} mL/min/1.73m²)`);
      }
    }
  }

  // ==========================================
  // 8. IRON STUDIES (Transferrin Saturation & UIBC)
  // ==========================================
  const serumIron = getVal(paramsCopy, ['serum iron', 'iron (serum)', 'iron']);
  const tibc = getVal(paramsCopy, ['tibc', 'total iron binding capacity']);
  if (serumIron !== null && tibc !== null && tibc > 0) {
    const tsat = Math.round((serumIron / tibc) * 100);
    if (setVal(paramsCopy, ['transferrin saturation', 'tsat'], tsat, 'Calculated: (Iron / TIBC) × 100%')) {
      applied.push(`TSAT (${tsat}%)`);
    }

    const uibc = Math.round(tibc - serumIron);
    if (setVal(paramsCopy, ['uibc', 'unsaturated iron binding'], uibc, 'Calculated: TIBC - Serum Iron')) {
      applied.push(`UIBC (${uibc} µg/dL)`);
    }
  }

  return { updatedParams: paramsCopy, calculationsApplied: applied };
}

/**
 * Standard dropdown / pre-fill choices for physical and microscopic urinalysis,
 * stool examination, semen analysis, and microbiology.
 */
export const CLINICAL_PREFILL_OPTIONS: Record<string, string[]> = {
  // Urine Physical
  urineColor: [
    'Amber Yellow',
    'Pale Yellow',
    'Yellow',
    'Dark Yellow',
    'Red / Bloody',
    'Brown / Tea-colored',
    'Cloudy Yellow',
    'Milky',
    'Orange'
  ],
  urineAppearance: [
    'Clear',
    'Slightly Turbid (Hazy)',
    'Turbid',
    'Grossly Turbid'
  ],
  urineSpGr: ['1.005', '1.010', '1.015', '1.020', '1.025', '1.030'],
  urinePH: ['5.0', '5.5', '6.0', '6.5', '7.0', '7.5', '8.0'],

  // Chemical strip standard grades
  qualitativeGrade: [
    'Nil (Negative)',
    'Trace',
    '+ (+1)',
    '++ (+2)',
    '+++ (+3)',
    '++++ (+4)'
  ],

  // Microscopic quantities
  microscopicQuantities: [
    'Nil seen',
    'Rare',
    'Few',
    'Moderate',
    'Many',
    'Heavy / Overcrowded',
    'Sheets'
  ],

  // Pus Cells & RBCs typical ranges
  pusCellsRanges: [
    '0 - 2 / HPF',
    '2 - 4 / HPF',
    '4 - 6 / HPF',
    '6 - 8 / HPF',
    '8 - 10 / HPF',
    '10 - 15 / HPF',
    '15 - 20 / HPF',
    '20 - 30 / HPF',
    '30 - 50 / HPF',
    '50 - 75 / HPF',
    '75 - 100 / HPF',
    'Overcrowded / Sheets'
  ],

  rbcRanges: [
    '0 - 2 / HPF',
    '1 - 3 / HPF',
    '3 - 5 / HPF',
    '5 - 10 / HPF',
    '10 - 15 / HPF',
    '15 - 20 / HPF',
    '20 - 30 / HPF',
    '30 - 50 / HPF',
    '50 - 100 / HPF',
    'Dysmorphic RBCs Present',
    'Grossly Bloody'
  ],

  // Urine Crystals
  urineCrystals: [
    'Nil seen',
    'Calcium Oxalate (Few)',
    'Calcium Oxalate (+)',
    'Calcium Oxalate (++)',
    'Calcium Oxalate (+++)',
    'Uric Acid Crystals (Few)',
    'Uric Acid Crystals (+)',
    'Uric Acid Crystals (++)',
    'Triple Phosphate (+)',
    'Triple Phosphate (++)',
    'Amorphous Urates (Few)',
    'Amorphous Urates (+)',
    'Amorphous Urates (++)',
    'Amorphous Phosphates (+)',
    'Amorphous Phosphates (++)'
  ],

  // Urine Casts
  urineCasts: [
    'Nil seen',
    'Hyaline Casts (0-1 / LPF)',
    'Granular Casts (Few)',
    'WBC Casts Present',
    'RBC Casts Present',
    'Fatty Casts'
  ],

  // Stool Physical
  stoolColor: [
    'Brown',
    'Dark Brown',
    'Yellow',
    'Greenish',
    'Clay / Pale',
    'Black (Melena)',
    'Reddish / Bloody'
  ],
  stoolConsistency: [
    'Formed',
    'Semi-formed',
    'Soft',
    'Loose',
    'Watery / Diarrheal',
    'Hard'
  ],
  stoolMucus: ['Nil', 'Trace', '+ (+1)', '++ (+2)', '+++ (+3)'],
  stoolBlood: ['Nil', 'Trace', 'Gross Blood Present'],
  stoolOccultBlood: ['Negative', 'Positive'],

  // Stool Parasites & Protozoa
  stoolParasites: [
    'No parasites or ova seen',
    'Entamoeba histolytica (Trophozoite)',
    'Entamoeba histolytica (Cyst +)',
    'Entamoeba histolytica (Cyst ++)',
    'Entamoeba coli (Cyst +)',
    'Giardia lamblia (Trophozoite)',
    'Giardia lamblia (Cyst +)',
    'Giardia lamblia (Cyst ++)',
    'Blastocystis hominis (+)',
    'Blastocystis hominis (++)',
    'Enterobius vermicularis (Ova)',
    'Ascaris lumbricoides (Ova)',
    'Ancylostoma duodenale (Ova)',
    'Schistosoma mansoni (Ova)',
    'Hymenolepis nana (Ova)',
    'Fasciola hepatica (Ova)'
  ],

  // Semen WHO Parameters
  semenViscosity: ['Normal', 'Moderate', 'High'],
  semenLiquefaction: ['15 min', '20 min', '25 min', '30 min', 'Delayed (> 60 min)'],
  semenAgglutination: ['Nil', 'Isolated', 'Moderate', 'Significant'],

  // Culture Isolated Organisms
  cultureOrganisms: [
    'No bacterial growth after 48 hrs of incubation',
    'Escherichia coli (E. coli)',
    'Klebsiella pneumoniae',
    'Pseudomonas aeruginosa',
    'Staphylococcus aureus (MSSA)',
    'Staphylococcus aureus (MRSA)',
    'Staphylococcus epidermidis (CoNS)',
    'Staphylococcus saprophyticus',
    'Streptococcus pyogenes (Group A)',
    'Streptococcus agalactiae (Group B)',
    'Streptococcus pneumoniae',
    'Enterococcus faecalis',
    'Enterococcus faecium (VRE)',
    'Proteus mirabilis',
    'Proteus vulgaris',
    'Acinetobacter baumannii',
    'Enterobacter cloacae',
    'Serratia marcescens',
    'Salmonella typhi',
    'Candida albicans',
    'Mixed bacterial flora (Contamination)'
  ],

  // Culture Growth Count
  cultureGrowthCounts: [
    'No Growth',
    '< 10,000 CFU/mL (Not Significant)',
    '10,000 - 50,000 CFU/mL',
    '50,000 - 100,000 CFU/mL',
    '> 100,000 CFU/mL (Significant Bacteriuria)'
  ],

  // Antibiotics Sensitivity
  antibioticSensitivity: [
    'Sensitive ( S )',
    'Intermediate ( I )',
    'Resistant ( R )'
  ],

  // Common Antibiotics List
  antibioticsList: [
    'Amoxicillin / Clavulanate (Augmentin)',
    'Ampicillin / Sulbactam (Unasyn)',
    'Piperacillin / Tazobactam (Tazocin)',
    'Cefuroxime (Zinnat)',
    'Ceftriaxone (Rocephin)',
    'Cefotaxime (Claforan)',
    'Ceftazidime (Fortum)',
    'Cefepime (Maxipime)',
    'Cefoperazone / Sulbactam',
    'Imipenem (Tienam)',
    'Meropenem (Meronem)',
    'Ertapenem (Invanz)',
    'Amikacin (Amikin)',
    'Gentamicin (Garamycin)',
    'Ciprofloxacin (Cipro)',
    'Levofloxacin (Tavanic)',
    'Moxifloxacin (Avelox)',
    'Nitrofurantoin (Macrodantin)',
    'Fosfomycin (Monuril)',
    'Trimethoprim / Sulfamethoxazole (Bactrim)',
    'Vancomycin',
    'Linezolid (Zyvox)',
    'Teicoplanin (Targocid)',
    'Colistin (Colimycin)',
    'Tigecycline (Tygacil)',
    'Clindamycin (Dalacin C)',
    'Azithromycin (Zithromax)',
    'Doxycycline (Vibramycin)'
  ]
};
