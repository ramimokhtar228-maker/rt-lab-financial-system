import { TestParameter, ResultFlag } from '../types';

export function calculateFlag(
  resultVal: string,
  minNormal?: number,
  maxNormal?: number,
  panicLow?: number,
  panicHigh?: number
): ResultFlag {
  const numeric = parseFloat(resultVal);
  if (isNaN(numeric)) {
    const lower = (resultVal || '').trim().toLowerCase();
    if (lower === 'positive' || lower === 'reactive' || lower === 'detected' || lower === 'إيجابي') {
      return 'ABNORMAL';
    }
    if (lower === 'negative' || lower === 'non-reactive' || lower === 'not detected' || lower === 'سلبي') {
      return 'NORMAL';
    }
    return '';
  }

  // Panic / Critical Values Check
  if (panicHigh !== undefined && numeric >= panicHigh) return 'PANIC_HIGH';
  if (panicLow !== undefined && numeric <= panicLow) return 'PANIC_LOW';

  // Normal Range Check
  if (maxNormal !== undefined && numeric > maxNormal) return 'HIGH';
  if (minNormal !== undefined && numeric < minNormal) return 'LOW';

  if (minNormal !== undefined || maxNormal !== undefined) return 'NORMAL';
  return '';
}

export function formatReferenceDisplay(param: TestParameter): string {
  if (param.textReference) return param.textReference;
  if (param.minNormal !== undefined && param.maxNormal !== undefined) {
    return `${param.minNormal} - ${param.maxNormal} ${param.unit}`;
  }
  if (param.maxNormal !== undefined) {
    return `< ${param.maxNormal} ${param.unit}`;
  }
  if (param.minNormal !== undefined) {
    return `> ${param.minNormal} ${param.unit}`;
  }
  return 'Negative';
}

export function getChartPointerPosition(
  valStr: string,
  minNorm?: number,
  maxNorm?: number
): { positionPercent: number; zone: 'low' | 'normal' | 'high' } {
  const val = parseFloat(valStr);
  if (isNaN(val) || minNorm === undefined || maxNorm === undefined) {
    return { positionPercent: 50, zone: 'normal' };
  }

  const range = maxNorm - minNorm;
  if (range <= 0) return { positionPercent: 50, zone: 'normal' };

  if (val < minNorm) {
    // Left zone (0% to 25%)
    const lowSpan = minNorm * 0.5 || 10;
    const offset = Math.max(0, val - (minNorm - lowSpan));
    const pct = Math.min(24, Math.max(2, (offset / lowSpan) * 25));
    return { positionPercent: pct, zone: 'low' };
  } else if (val > maxNorm) {
    // Right zone (75% to 100%)
    const highSpan = maxNorm * 0.5 || 10;
    const offset = Math.min(highSpan, val - maxNorm);
    const pct = Math.min(98, 75 + (offset / highSpan) * 23);
    return { positionPercent: pct, zone: 'high' };
  } else {
    // Normal middle zone (25% to 75%)
    const ratio = (val - minNorm) / range;
    const pct = 25 + ratio * 50;
    return { positionPercent: Math.min(74, Math.max(26, pct)), zone: 'normal' };
  }
}

// Complete Blood Count (CBC) with Full Automated Differential & Calculations
export function runAutomatedCBCCalculations(parameters: TestParameter[]): {
  updatedParameters: TestParameter[];
  calculatedMessages: string[];
  mentzerInterpretation?: string;
} {
  const calculatedMessages: string[] = [];
  const map = new Map<string, TestParameter>();

  parameters.forEach(p => {
    map.set(p.name.trim().toLowerCase(), { ...p });
  });

  const getNum = (aliases: string[]): number | null => {
    for (const alias of aliases) {
      for (const [key, p] of map.entries()) {
        if (key.includes(alias.toLowerCase())) {
          const val = parseFloat(p.result);
          if (!isNaN(val)) return val;
        }
      }
    }
    return null;
  };

  const updateParam = (aliases: string[], newValue: number, decimals: number = 1, notes?: string) => {
    for (const alias of aliases) {
      for (const [key, p] of map.entries()) {
        if (key.includes(alias.toLowerCase())) {
          const formatted = newValue.toFixed(decimals);
          if (p.result !== formatted) {
            p.result = formatted;
            p.flag = calculateFlag(formatted, p.minNormal, p.maxNormal, p.panicLow, p.panicHigh);
            if (notes) p.notes = notes;
            calculatedMessages.push(`${p.name} = ${formatted} ${p.unit}`);
          }
          return;
        }
      }
    }
  };

  const hb = getNum(['hemoglobin', 'hb', 'hgb']);
  const rbc = getNum(['r.b.cs', 'rbc', 'erythrocyte']);
  let pcv = getNum(['hematocrit', 'pcv']);
  const mcvVal = getNum(['m.c.v', 'mcv']);
  const rdwVal = getNum(['r.d.w-cv', 'rdw-cv', 'rdw']);
  const wbc = getNum(['total leucocytic', 'wbc', 'leukocyte', 'tlc']);
  const segNeut = getNum(['segmented', 'seg neut']);
  const bandForms = getNum(['band forms', 'stab']);
  let totalNeut = getNum(['total neutrophils', 'neutrophils %', 'neutrophil']);
  const lymph = getNum(['lymphocytes %', 'lymphocyte']);
  const mono = getNum(['monocytes %', 'monocyte']);
  const eos = getNum(['eosinophils %', 'eosinophil']);
  const baso = getNum(['basophils %', 'basophil']);
  const platelets = getNum(['platelets count', 'platelet', 'plt']);
  const mpv = getNum(['mpv', 'mean platelet volume']);

  // 1. Calculate PCV if Hb exists
  if (hb !== null && (pcv === null || pcv === 0)) {
    pcv = hb * 3.0;
    updateParam(['hematocrit', 'pcv'], pcv, 1, 'Auto-calculated: Hb × 3');
  }

  // 2. Calculate MCV: (PCV × 10) / RBC
  let calculatedMCV: number | null = mcvVal;
  if (pcv !== null && rbc !== null && rbc > 0) {
    calculatedMCV = (pcv * 10) / rbc;
    updateParam(['m.c.v', 'mcv'], calculatedMCV, 1, 'Auto-calculated: (PCV × 10) / RBC');
  }

  // 3. Calculate MCH: (Hb × 10) / RBC
  if (hb !== null && rbc !== null && rbc > 0) {
    const mch = (hb * 10) / rbc;
    updateParam(['m.c.h', 'mch'], mch, 1, 'Auto-calculated: (Hb × 10) / RBC');
  }

  // 4. Calculate MCHC: (Hb × 100) / PCV
  if (hb !== null && pcv !== null && pcv > 0) {
    const mchc = (hb * 100) / pcv;
    updateParam(['m.c.h.c', 'mchc'], mchc, 1, 'Auto-calculated: (Hb × 100) / PCV');
  }

  // 5. Total Neutrophils = Segmented + Band
  if (segNeut !== null && bandForms !== null) {
    totalNeut = segNeut + bandForms;
    updateParam(['total neutrophils', 'neutrophils %'], totalNeut, 1, 'Auto-calculated: Segmented% + Band%');
  }

  // 6. White Blood Cell Differential Absolute Counts (ANC, ALC, AMC, AEC, ABC)
  if (wbc !== null && wbc > 0) {
    if (totalNeut !== null) {
      const anc = (wbc * totalNeut) / 100.0;
      updateParam(['absolute neutrophils', 'anc'], anc, 2, 'Auto-calculated: (WBC × Neut%) / 100');
    }
    if (lymph !== null) {
      const alc = (wbc * lymph) / 100.0;
      updateParam(['absolute lymphocytes', 'alc'], alc, 2, 'Auto-calculated: (WBC × Lymph%) / 100');
    }
    if (mono !== null) {
      const amc = (wbc * mono) / 100.0;
      updateParam(['absolute monocytes', 'amc'], amc, 2, 'Auto-calculated: (WBC × Mono%) / 100');
    }
    if (eos !== null) {
      const aec = (wbc * eos) / 100.0;
      updateParam(['absolute eosinophils', 'aec'], aec, 2, 'Auto-calculated: (WBC × Eos%) / 100');
    }
    if (baso !== null) {
      const abc = (wbc * baso) / 100.0;
      updateParam(['absolute basophils', 'abc'], abc, 2, 'Auto-calculated: (WBC × Baso%) / 100');
    }
  }

  // 7. NLR (Neutrophil-to-Lymphocyte Ratio)
  if (totalNeut !== null && lymph !== null && lymph > 0) {
    const nlr = totalNeut / lymph;
    updateParam(['nlr', 'neutrophil/lymphocyte'], nlr, 2, 'Auto-calculated: Neut% / Lymph%');
  }

  // 8. Platelet Indices: PCT (Plateletcrit) & PLR
  if (platelets !== null && mpv !== null && mpv > 0) {
    const pct = (platelets * mpv) / 10000.0;
    updateParam(['pct', 'plateletcrit'], pct, 3, 'Auto-calculated: (Platelets × MPV) / 10,000');
  }

  // 9. Mentzer Index & Differential Anemia Suggestion
  let mentzerInterpretation: string | undefined;
  const effMCV = calculatedMCV || mcvVal;
  if (effMCV !== null && rbc !== null && rbc > 0) {
    const mentzer = effMCV / rbc;
    updateParam(['mentzer index', 'mentzer'], mentzer, 1);
    if (effMCV < 80) {
      if (mentzer < 13) {
        mentzerInterpretation = `مؤشر منتزر = ${mentzer.toFixed(1)} (< 13): يرجح وجود سمة أنيميا البحر الأبيض المتوسط (Beta Thalassemia Trait). يُنصح بعمل تحليل الفصل الكهربائي للهيموجلوبين (Hb Electrophoresis).`;
      } else {
        mentzerInterpretation = `مؤشر منتزر = ${mentzer.toFixed(1)} (> 13): يرجح وجود أنيميا نقص الحديد (Iron Deficiency Anemia). يُنصح بفحص الفيريتين ومخزون الحديد.`;
      }
    }
  }

  // 10. Green & King Index: (MCV^2 * RDW) / (Hb * 100)
  if (effMCV !== null && rdwVal !== null && hb !== null && hb > 0) {
    const gkIndex = (Math.pow(effMCV, 2) * rdwVal) / (hb * 100.0);
    updateParam(['green & king', 'green and king', 'gk index'], gkIndex, 1);
  }

  const updatedParameters = Array.from(map.values());
  return { updatedParameters, calculatedMessages, mentzerInterpretation };
}
