import { LabReport, TestParameter } from '../types/lab';

export interface SmartClinicalAnalysis {
  reportId: string;
  patientName: string;
  age: number;
  gender: 'male' | 'female';
  executiveSummaryAr: string;
  executiveSummaryEn: string;
  criticalAlerts: Array<{ titleAr: string; titleEn: string; severity: 'critical' | 'high' | 'moderate'; detail: string }>;
  organScores: {
    renal: { score: number; labelAr: string; status: 'optimal' | 'mild' | 'moderate' | 'critical' };
    hepatic: { score: number; labelAr: string; status: 'optimal' | 'mild' | 'moderate' | 'critical' };
    metabolic: { score: number; labelAr: string; status: 'optimal' | 'mild' | 'moderate' | 'critical' };
    hematologic: { score: number; labelAr: string; status: 'optimal' | 'mild' | 'moderate' | 'critical' };
    cardiac: { score: number; labelAr: string; status: 'optimal' | 'mild' | 'moderate' | 'critical' };
  };
  calculatedIndices: Array<{ nameAr: string; nameEn: string; value: string | number; reference: string; interpretationAr: string }>;
  differentialDiagnoses: Array<{ diseaseAr: string; diseaseEn: string; likelihood: 'high' | 'moderate' | 'possible'; rationaleAr: string }>;
  consultantRecommendations: string[];
}

// Find parameter value by matching common names or abbreviations
function getParamVal(params: TestParameter[], names: string[]): number | null {
  for (const p of params) {
    const pName = (p.name || '').toLowerCase();
    for (const n of names) {
      if (pName.includes(n.toLowerCase())) {
        const num = parseFloat(String(p.result).replace(/[^0-9.-]/g, ''));
        if (!isNaN(num)) return num;
      }
    }
  }
  return null;
}

export function generateSmartClinicalAnalysis(report: LabReport): SmartClinicalAnalysis {
  const p = report.patient;
  const allParams: TestParameter[] = [];
  report.profiles.forEach(pr => {
    if (Array.isArray(pr.parameters)) {
      allParams.push(...pr.parameters);
    }
  });

  const age = p.age || 35;
  const isFemale = p.gender === 'female';

  // Extract key lab markers
  const hb = getParamVal(allParams, ['hemoglobin', 'hgb', 'هيموجلوبين', 'hb']);
  const rbc = getParamVal(allParams, ['rbc', 'red blood', 'كريات الدم الحمراء']);
  const mcv = getParamVal(allParams, ['mcv']);
  const mch = getParamVal(allParams, ['mch']);
  const rdw = getParamVal(allParams, ['rdw']);
  const wbc = getParamVal(allParams, ['wbc', 'white blood', 'كرات الدم البيضاء']);
  const platelets = getParamVal(allParams, ['platelet', 'plt', 'صفائح']);

  const fbs = getParamVal(allParams, ['fasting blood sugar', 'fbs', 'سكر صائم', 'fasting glucose']);
  const ppbs = getParamVal(allParams, ['post prandial', 'ppbs', 'سكر بعد الاكل', '2h pp']);
  const hba1c = getParamVal(allParams, ['hba1c', 'تراكمي', 'glycated hemoglobin']);

  const creat = getParamVal(allParams, ['creatinine', 'كرياتينين']);
  const urea = getParamVal(allParams, ['urea', 'بولينا', 'bun']);
  const uricAcid = getParamVal(allParams, ['uric acid', 'يوريك اسيد', 'حمض البوليك']);

  const alt = getParamVal(allParams, ['alt', 'sgpt', 'أنزيم الكبد']);
  const ast = getParamVal(allParams, ['ast', 'sgot']);
  const bili = getParamVal(allParams, ['bilirubin', 'صفراء', 'total bilirubin']);
  const alp = getParamVal(allParams, ['alkaline phosphatase', 'alp']);

  const chol = getParamVal(allParams, ['cholesterol', 'كولسترول', 'total cholesterol']);
  const tg = getParamVal(allParams, ['triglyceride', 'دهون ثلاثية']);
  const hdl = getParamVal(allParams, ['hdl']);
  const ldl = getParamVal(allParams, ['ldl']);

  const tsh = getParamVal(allParams, ['tsh', 'هرمون الغدة الدرقية']);

  const criticalAlerts: SmartClinicalAnalysis['criticalAlerts'] = [];
  const calculatedIndices: SmartClinicalAnalysis['calculatedIndices'] = [];
  const differentialDiagnoses: SmartClinicalAnalysis['differentialDiagnoses'] = [];
  const consultantRecommendations: string[] = [];

  // Organ health calculation
  let renalScore = 95;
  let hepaticScore = 95;
  let metabolicScore = 95;
  let hematologicScore = 95;
  let cardiacScore = 95;

  // 1. Hematology Evaluation
  if (hb !== null) {
    const isAnemic = isFemale ? hb < 12.0 : hb < 13.0;
    if (hb < 8.0) {
      criticalAlerts.push({
        titleAr: 'أنيميا حادة (Severe Anemia)',
        titleEn: 'Severe Anemia (Hb < 8.0 g/dL)',
        severity: 'critical',
        detail: `مستوى الهيموجلوبين منخفض جداً (${hb} g/dL)، يستدعي فحصاً سريرياً فورياً واستشارة طبية عاجلة.`
      });
      hematologicScore = 40;
    } else if (isAnemic) {
      hematologicScore = 70;
    }

    if (mcv !== null && rbc !== null && rbc > 0) {
      const mentzer = Number((mcv / rbc).toFixed(1));
      let mentzerInterp = '';
      if (mentzer < 13) {
        mentzerInterp = 'مؤشر منتزر أقل من 13: يُشير بقوة إلى سمة أنيميا البحر المتوسط (Beta Thalassemia Trait / Minor).';
        differentialDiagnoses.push({
          diseaseAr: 'سمة ثلاسيميا بيتا (Beta Thalassemia Minor)',
          diseaseEn: 'Beta Thalassemia Minor',
          likelihood: 'high',
          rationaleAr: `صغر في حجم الكريات (MCV=${mcv}) مع ارتفاع نسبي لكرات الدم (RBC=${rbc}) ومؤشر منتزر = ${mentzer} (< 13).`
        });
        consultantRecommendations.push('يوصى بعمل فصل كهربائي للهيموجلوبين (Hb Electrophoresis) لتأكيد سمة الثلاسيميا وقياس HbA2.');
      } else {
        mentzerInterp = 'مؤشر منتزر أكبر من 13: يُرجح وجود أنيميا نقص الحديد الكلاسيكية (Iron Deficiency Anemia).';
        differentialDiagnoses.push({
          diseaseAr: 'أنيميا نقص الحديد (Iron Deficiency Anemia)',
          diseaseEn: 'Iron Deficiency Anemia',
          likelihood: 'high',
          rationaleAr: `صغر حجم الكريات ونقص الصبغ مع مؤشر منتزر = ${mentzer} (> 13).`
        });
        consultantRecommendations.push('يوصى بفحص مخزون الحديد في الدم (Serum Ferritin & Iron / TIBC) وبدء كورس تعويضي مناسب.');
      }
      calculatedIndices.push({
        nameAr: 'مؤشر منتزر للأنيميا (Mentzer Index)',
        nameEn: 'Mentzer Index (MCV / RBC)',
        value: mentzer,
        reference: '< 13 Thalassemia | > 13 Iron Def',
        interpretationAr: mentzerInterp
      });
    }
  }

  if (platelets !== null) {
    if (platelets < 50) {
      criticalAlerts.push({
        titleAr: 'نقص حرج في الصفائح الدموية (Thrombocytopenia)',
        titleEn: 'Critical Thrombocytopenia',
        severity: 'critical',
        detail: `عدد الصفائح الدموية (${platelets} ألف) منخفض جداً؛ خطر حدوث نزيف أو كدمات عفوية.`
      });
      hematologicScore = Math.min(hematologicScore, 45);
      consultantRecommendations.push('إعادة فحص شريحة دم محيطية طازجة في أنبوبة سيترات الصوديوم لاستبعاد التراكم الكاذب (Pseudothrombocytopenia).');
    }
  }

  // 2. Renal Evaluation
  if (creat !== null) {
    if (creat > 1.4) {
      renalScore = Math.max(30, 90 - Math.round((creat - 1.2) * 35));
      if (creat >= 3.0) {
        criticalAlerts.push({
          titleAr: 'قصور كلوي حاد / متقدم (Severe Renal Impairment)',
          titleEn: 'Elevated Serum Creatinine',
          severity: 'critical',
          detail: `مستوى الكرياتينين (${creat} mg/dL) يشير إلى انخفاض حاد في معدل الفلترة الكبيبية.`
        });
      }
    }
    // Estimated eGFR via CKD-EPI approx
    let egfr = Math.round(141 * Math.pow(Math.min(creat / (isFemale ? 0.7 : 0.9), 1), isFemale ? -0.329 : -0.411) * Math.pow(Math.max(creat / (isFemale ? 0.7 : 0.9), 1), -1.209) * Math.pow(0.993, age) * (isFemale ? 1.018 : 1.0));
    egfr = Math.max(10, Math.min(130, egfr));
    let stage = 'G1 (كفاءة كلوية مثالية)';
    if (egfr < 15) stage = 'G5 (قصور كلوي متقدم - Kidney Failure)';
    else if (egfr < 30) stage = 'G4 (قصور كلوي شديد)';
    else if (egfr < 60) stage = 'G3 (قصور كلوي متوسط)';
    else if (egfr < 90) stage = 'G2 (انخفاض وظيفي كلوي طفيف)';

    calculatedIndices.push({
      nameAr: 'معدل الترشيح الكبيبي التقريبي (Estimated GFR)',
      nameEn: 'eGFR (CKD-EPI)',
      value: `${egfr} mL/min/1.73m²`,
      reference: '> 90 mL/min',
      interpretationAr: `المرحلة الكلوية: ${stage}`
    });

    if (egfr < 60) {
      differentialDiagnoses.push({
        diseaseAr: 'قصور وظائف الكلى المزمن (Chronic Renal Insufficiency)',
        diseaseEn: 'Chronic Kidney Disease Stage ' + (egfr < 30 ? '4' : '3'),
        likelihood: 'high',
        rationaleAr: `انخفاض معدل الترشيح الكبيبي إلى ${egfr} mL/min مع ارتفاع الكرياتينين إلى ${creat} mg/dL.`
      });
      consultantRecommendations.push('استشارة طبيب أمراض الكلى، مع مراجعة جرعات الأدوية المصروفة لتجنب السمية الكلوية وتجنب مضادات الالتهاب NSAIDs.');
    }
  }

  // 3. Hepatic Evaluation
  if (alt !== null || ast !== null) {
    const maxEnz = Math.max(alt || 0, ast || 0);
    if (maxEnz > 100) {
      hepaticScore = Math.max(35, 95 - Math.round(maxEnz / 3));
      if (maxEnz > 300) {
        criticalAlerts.push({
          titleAr: 'التهاب كبدي حاد / نخر خلايا الكبد (Acute Cytolysis)',
          titleEn: 'Marked Transaminase Elevation',
          severity: 'high',
          detail: `ارتفاع حاد في إنزيمات الكبد (ALT=${alt || '-'}, AST=${ast || '-'}), يستدعي فحص الفيروسات الكبدية والموجات الصوتية.`
        });
      }
    }

    if (alt !== null && ast !== null && alt > 0) {
      const deRitis = Number((ast / alt).toFixed(2));
      let deRitisInterp = '';
      if (deRitis < 1.0) {
        deRitisInterp = 'نسبة دي ريتيس < 1.0: شائعة في الكبد الدهني (NAFLD/NASH) أو التهاب الكبد الفيروسي الأولي.';
        differentialDiagnoses.push({
          diseaseAr: 'ارتشاح دهني كبدي (Hepatic Steatosis / NAFLD)',
          diseaseEn: 'Non-Alcoholic Fatty Liver Disease',
          likelihood: 'moderate',
          rationaleAr: `ارتفاع إنزيم ALT أكثر من AST مع نسبة دي ريتيس = ${deRitis}.`
        });
      } else if (deRitis > 2.0) {
        deRitisInterp = 'نسبة دي ريتيس > 2.0: تدل على أذية كبدية ميتوكوندرية عميقة أو تليف كبدي متقدم.';
      } else {
        deRitisInterp = 'نسبة دي ريتيس متوازنة.';
      }
      calculatedIndices.push({
        nameAr: 'نسبة دي ريتيس لأنزيمات الكبد (De Ritis Ratio)',
        nameEn: 'AST / ALT Ratio',
        value: deRitis,
        reference: '0.8 - 1.2',
        interpretationAr: deRitisInterp
      });
    }
  }

  // 4. Glycemic Evaluation
  if (fbs !== null || ppbs !== null || hba1c !== null) {
    if ((fbs && fbs >= 126) || (ppbs && ppbs >= 200) || (hba1c && hba1c >= 6.5)) {
      metabolicScore = 60;
      differentialDiagnoses.push({
        diseaseAr: 'داء السكري من النوع الثاني (Type 2 Diabetes Mellitus)',
        diseaseEn: 'Type 2 Diabetes Mellitus',
        likelihood: 'high',
        rationaleAr: `ارتفاع في قراءات السكر (الصائم=${fbs || '-'} | بعد الأكل=${ppbs || '-'} | التراكمي=${hba1c || '-'}%).`
      });
      consultantRecommendations.push('متابعة سكر الدم الصائم وبعد الأكل دورياً، والمتابعة مع استشاري الغدد الصماء وضبط النظام الغذائي.');
      if ((fbs && fbs > 350) || (ppbs && ppbs > 400)) {
        criticalAlerts.push({
          titleAr: 'ارتفاع حرج في سكر الدم (Severe Hyperglycemia)',
          titleEn: 'Critical Hyperglycemia',
          severity: 'critical',
          detail: `مستوى الجلوكوز مرتفع جداً؛ خطر حدوث الحماض الكيتوني السكري (DKA) أو فرط الأسمولية.`
        });
      }
    } else if ((fbs && fbs >= 100) || (hba1c && hba1c >= 5.7)) {
      metabolicScore = 80;
      differentialDiagnoses.push({
        diseaseAr: 'مرحلة ما قبل السكري ومقاومة الإنسولين (Prediabetes / Insulin Resistance)',
        diseaseEn: 'Impaired Fasting Glucose / Prediabetes',
        likelihood: 'moderate',
        rationaleAr: `سكر الدم الصائم بين 100 - 125 mg/dL أو السكر التراكمي بين 5.7 - 6.4%.`
      });
      consultantRecommendations.push('يوصى بعمل فحص مقاومة الإنسولين (HOMA-IR) وبدء ممارسة الرياضة والحمية منخفضة النشويات.');
    }
  }

  // 5. Lipid & Cardiac Evaluation
  if (chol !== null && hdl !== null && hdl > 0) {
    const athero = Number((chol / hdl).toFixed(2));
    let atheroInterp = athero < 4.5 ? 'مخاطر تصلب الشرايين منخفضة إلى مقبولة.' : 'مخاطر مرتفعة لتصلب الشرايين التاجية وأمراض القلب.';
    calculatedIndices.push({
      nameAr: 'مؤشر تصلب الشرايين (Atherogenic Risk Index)',
      nameEn: 'Total Cholesterol / HDL Ratio',
      value: athero,
      reference: '< 4.5 Optimal',
      interpretationAr: atheroInterp
    });
    if (athero >= 5.0) {
      cardiacScore = 65;
      consultantRecommendations.push('يوصى بحمية خافضة للدهون المشبعة واستشارة الطبيب لتقييم الحاجة لعلاجات الستاتين (Statins).');
    }
  }

  if (consultantRecommendations.length === 0) {
    consultantRecommendations.push('المؤشرات المخبرية تقع ضمن النطاقات الفسيولوجية المرجعية المقبولة.');
    consultantRecommendations.push('يوصى بالفحص الدوري الشامل كل 6 إلى 12 شهراً للحفاظ على صحة وسلامة المؤشرات الحيوية.');
  }

  const getStatus = (score: number): 'optimal' | 'mild' | 'moderate' | 'critical' => {
    if (score >= 90) return 'optimal';
    if (score >= 75) return 'mild';
    if (score >= 50) return 'moderate';
    return 'critical';
  };

  const getLabel = (score: number): string => {
    if (score >= 90) return 'ممتاز ومستقر';
    if (score >= 75) return 'تأثر طفيف';
    if (score >= 50) return 'انخفاض متوسط';
    return 'قصور حاد';
  };

  const execAr = criticalAlerts.length > 0
    ? `تم رصد ${criticalAlerts.length} مؤشر يستدعي الانتباه الطبي الفوري: ${criticalAlerts.map(c => c.titleAr).join('، ')}. ينصح بمراجعة الاستشاري المختص والتقيد بالتوصيات السريرية الواردة أدناه.`
    : `كافة الفحوصات المخبرية للمريض (${p.fullName}) تقع في النطاقات الآمنة بشكل عام مع انتظام مؤشرات الأعضاء الحيوية ونشاط فسيولوجي متوازن.`;

  const execEn = criticalAlerts.length > 0
    ? `${criticalAlerts.length} clinical alert(s) identified requiring immediate physician attention: ${criticalAlerts.map(c => c.titleEn).join(', ')}.`
    : `Overall lab findings are within acceptable physiological limits with stable organ biomarkers.`;

  return {
    reportId: report.id,
    patientName: p.fullName,
    age,
    gender: p.gender,
    executiveSummaryAr: execAr,
    executiveSummaryEn: execEn,
    criticalAlerts,
    organScores: {
      renal: { score: renalScore, labelAr: getLabel(renalScore), status: getStatus(renalScore) },
      hepatic: { score: hepaticScore, labelAr: getLabel(hepaticScore), status: getStatus(hepaticScore) },
      metabolic: { score: metabolicScore, labelAr: getLabel(metabolicScore), status: getStatus(metabolicScore) },
      hematologic: { score: hematologicScore, labelAr: getLabel(hematologicScore), status: getStatus(hematologicScore) },
      cardiac: { score: cardiacScore, labelAr: getLabel(cardiacScore), status: getStatus(cardiacScore) }
    },
    calculatedIndices,
    differentialDiagnoses,
    consultantRecommendations
  };
}
