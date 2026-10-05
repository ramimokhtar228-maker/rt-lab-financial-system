export { INITIAL_PACKAGES } from "./packagesData";
export { INITIAL_INDIVIDUAL_TESTS } from "./individualTestsData";
export { INITIAL_LAB_INFO, INITIAL_FACILITIES, INITIAL_STAFF_MEMBERS } from "./staffAndFacilitiesData";
export { INITIAL_LOYALTY_PROFILES, TIER_BENEFITS } from "./loyaltyData";

import { CatalogProfileTemplate, LabStaffSignatures } from '../types/lab';

export const DEFAULT_STAFF: LabStaffSignatures = {
  labChemist: "",
  verifiedBy: "",
  pathologist: "أ.د. رامي مختار - استشاري الباثولوجيا الإكلينيكية والكيميائية - كلية طب قصر العيني"
};

export const STAFF_OPTIONS = {
  chemists: [],
  verifiers: [],
  pathologists: [
    "أ.د. رامي مختار - استشاري الباثولوجيا الإكلينيكية والكيميائية - كلية طب قصر العيني"
  ]
};

export const COMMON_INTERPRETATIONS: { [key: string]: string[] } = {
  CBC: [
    'Blood indices are within acceptable physiological limits.',
    'Mild microcytic hypochromic anemia, iron deficiency picture is suggested. Serum Ferritin is recommended.',
    'Normocytic normochromic anemia. Chronic disease or blood loss evaluation suggested.',
    'Relative leucocytosis with neutrophilia, suggestive of acute bacterial infection or inflammatory process.',
    'Thrombocytopenia, platelet count should be confirmed on fresh peripheral blood smear in citrate.'
  ],
  URINE: [
    'Normal routine urine analysis findings. No active urinary sediment or significant proteinuria.',
    'Active urinary sediment with marked pyuria and bacteriuria, suggestive of Urinary Tract Infection (UTI). Urine culture & sensitivity recommended.',
    'Microscopic hematuria with dysmorphic red cells, nephrological assessment is advised.',
    'Crystalluria noted (Calcium oxalate crystals). Adequate oral fluid intake is advised.'
  ],
  STOOL: [
    'Normal stool examination. No intestinal protozoa, ova, or occult blood detected.',
    'Entamoeba histolytica cysts / trophozoites detected. Specific anti-protozoal therapy recommended.',
    'Giardia lamblia vegetative forms / cysts seen. Clinical correlation with malabsorption or diarrheal symptoms.',
    'Presence of inflammatory pus cells and microscopic red cells, suggestive of bacillary dysentery or colitis.'
  ],
  SEMEN: [
    'Normozoospermia: Sperm count, progressive motility, and normal forms meet WHO criteria.',
    'Oligoasthenoteratozoospermia (OAT): Subnormal concentration, progressive motility, and normal morphology.',
    'Asthenozoospermia: Reduced progressive motility (< 32% PR). Repeat analysis after 3 weeks advised.',
    'Azoospermia: No spermatozoa identified in neat and centrifuged pellet. Centrifugation protocol confirmed.'
  ],
  CULTURE: [
    'Significant bacterial growth (> 100,000 CFU/mL). Sensitive antimicrobial options indicated in susceptibility chart.',
    'No significant bacterial growth obtained after 48 hours of aerobic incubation at 37°C.',
    'Low colony count (< 10,000 CFU/mL), likely urethral/skin colonization or early infection.'
  ],
  HOMA: [
    'HOMA-IR within normal insulin sensitivity range (< 1.9).',
    'Elevated HOMA-IR (> 2.9) consistent with marked Insulin Resistance and metabolic syndrome predisposition.'
  ],
  ACR: [
    'Normal Albumin-to-Creatinine Ratio (< 30 mg/g).',
    'Microalbuminuria confirmed (30 - 300 mg/g creatinine), early diabetic nephropathy or endothelial dysfunction.',
    'Macroalbuminuria / Clinical proteinuria (> 300 mg/g creatinine).'
  ],
  LIPID: [
    'Desirable lipid profile with normal atherogenic index.',
    'Hypercholesterolemia with elevated LDL-C. Cardiovascular risk evaluation and dietary modification recommended.',
    'Mixed dyslipidemia (Elevated Total Cholesterol and Triglycerides with low HDL-C).'
  ],
  LFT: [
    'Liver enzymes and synthetic hepatic markers are within normal reference ranges.',
    'Mild transaminitis (ALT & AST elevation), correlation with viral hepatitis serology and abdominal ultrasound is advised.',
    'Isolated elevation of Direct Bilirubin with normal liver enzymes. Biliary evaluation suggested.'
  ],
  KFT: [
    'Renal biomarkers indicate adequate glomerular filtration and nitrogenous clearance.',
    'Mild elevation of Serum Creatinine and Blood Urea. Follow-up after adequate hydration and eGFR calculation.',
    'Hyperuricemia, dietary modification and hydration recommended.'
  ],
  GLYCEMIC: [
    'Glycemic indices demonstrate adequate glycemic control.',
    'Impaired fasting glucose (IFG), pre-diabetes pattern. Lifestyle modification and 3-month HbA1c follow-up advised.',
    'Glycemic results consistent with diabetes mellitus criteria.'
  ],
  THYROID: [
    'Euthyroid state: TSH, Free T3, and Free T4 are within euthyroid reference ranges.',
    'Elevated TSH with normal Free T4, findings compatible with Subclinical Hypothyroidism.',
    'Suppressed TSH with elevated Free T4/Free T3, suggestive of Primary Hyperthyroidism.'
  ]
};

export const LAB_CATALOG: CatalogProfileTemplate[] = [
  // 1. COMPLETE BLOOD PICTURE (CBC) with Auto Indices
  {
    code: "CBC",
    titleEn: "Complete Blood Count (CBC) with Full Automated Differential & Indices",
    titleAr: "صورة الدم الكاملة مع الفيلم التفريقي والمؤشرات الحسابية",
    category: "Hematology",
    sampleType: "EDTA Whole Blood",
    defaultInterpretation: "Microscopic evaluation and complete differential indices assessed according to international hematology criteria.",
    parameters: [
      {
            "name": "Hemoglobin (Hb)",
            "unit": "g/dL",
            "minNormal": 12,
            "maxNormal": 16.5,
            "panicLow": 7,
            "panicHigh": 20,
            "method": "Automated SLS-Hb",
            "textReference": "M: 13.0 - 17.5 | F: 12.0 - 15.5 g/dL"
      },
      {
            "name": "R.B.Cs Count",
            "unit": "x10^6/µL",
            "minNormal": 4,
            "maxNormal": 5.8,
            "method": "Electrical Impedance",
            "textReference": "M: 4.5 - 5.9 | F: 4.0 - 5.2"
      },
      {
            "name": "Hematocrit (PCV)",
            "unit": "%",
            "minNormal": 36,
            "maxNormal": 48,
            "notes": "Auto-calculated: Hb × 3",
            "textReference": "M: 40 - 52% | F: 36 - 48%"
      },
      {
            "name": "M.C.V",
            "unit": "fL",
            "minNormal": 80,
            "maxNormal": 98,
            "notes": "Auto-calculated: (PCV × 10) / RBC",
            "textReference": "80.0 - 98.0 fL"
      },
      {
            "name": "M.C.H",
            "unit": "pg",
            "minNormal": 27,
            "maxNormal": 33,
            "notes": "Auto-calculated: (Hb × 10) / RBC",
            "textReference": "27.0 - 33.0 pg"
      },
      {
            "name": "M.C.H.C",
            "unit": "g/dL",
            "minNormal": 32,
            "maxNormal": 36,
            "notes": "Auto-calculated: (Hb × 100) / PCV",
            "textReference": "32.0 - 36.0 g/dL"
      },
      {
            "name": "R.D.W-CV",
            "unit": "%",
            "minNormal": 11.5,
            "maxNormal": 14.5,
            "textReference": "11.5 - 14.5 %"
      },
      {
            "name": "R.D.W-SD",
            "unit": "fL",
            "minNormal": 39,
            "maxNormal": 46,
            "textReference": "39.0 - 46.0 fL"
      },
      {
            "name": "Mentzer Index (MCV/RBC)",
            "unit": "Ratio",
            "notes": "<13 Thalassemia Trait | >13 Iron Deficiency",
            "textReference": "> 13 Iron Def. | < 13 Thalassemia"
      },
      {
            "name": "Green & King Index",
            "unit": "Index",
            "notes": "(MCV² × RDW) / (Hb × 100)",
            "textReference": "< 72 Thalassemia | > 72 Iron Def."
      },
      {
            "name": "Platelets Count",
            "unit": "x10^3/µL",
            "minNormal": 150,
            "maxNormal": 450,
            "panicLow": 50,
            "panicHigh": 1000,
            "textReference": "150 - 450 x10^3/µL"
      },
      {
            "name": "MPV (Mean Platelet Volume)",
            "unit": "fL",
            "minNormal": 7.5,
            "maxNormal": 11.5,
            "textReference": "7.5 - 11.5 fL"
      },
      {
            "name": "PDW (Platelet Dist. Width)",
            "unit": "%",
            "minNormal": 9,
            "maxNormal": 17,
            "textReference": "9.0 - 17.0 %"
      },
      {
            "name": "PCT (Plateletcrit)",
            "unit": "%",
            "minNormal": 0.17,
            "maxNormal": 0.35,
            "notes": "Auto-calculated: (PLT × MPV) / 10,000",
            "textReference": "0.17 - 0.35 %"
      },
      {
            "name": "Total Leucocytic Count (TLC)",
            "unit": "x10^3/µL",
            "minNormal": 4,
            "maxNormal": 11,
            "panicLow": 2,
            "panicHigh": 30,
            "textReference": "4.0 - 11.0 x10^3/µL"
      },
      {
            "name": "Segmented Neutrophils %",
            "unit": "%",
            "minNormal": 40,
            "maxNormal": 65,
            "textReference": "40 - 65 %"
      },
      {
            "name": "Band Forms (Stab) %",
            "unit": "%",
            "minNormal": 0,
            "maxNormal": 5,
            "textReference": "0 - 5 % (Left Shift if > 6%)"
      },
      {
            "name": "Total Neutrophils %",
            "unit": "%",
            "minNormal": 40,
            "maxNormal": 70,
            "notes": "Auto-calculated: Segmented% + Band%",
            "textReference": "40 - 70 %"
      },
      {
            "name": "Lymphocytes %",
            "unit": "%",
            "minNormal": 20,
            "maxNormal": 45,
            "textReference": "20 - 45 %"
      },
      {
            "name": "Monocytes %",
            "unit": "%",
            "minNormal": 2,
            "maxNormal": 8,
            "textReference": "2 - 8 %"
      },
      {
            "name": "Eosinophils %",
            "unit": "%",
            "minNormal": 1,
            "maxNormal": 6,
            "textReference": "1 - 6 %"
      },
      {
            "name": "Basophils %",
            "unit": "%",
            "minNormal": 0,
            "maxNormal": 1,
            "textReference": "0 - 1 %"
      },
      {
            "name": "Metamyelocytes %",
            "unit": "%",
            "minNormal": 0,
            "maxNormal": 0,
            "textReference": "0 % (Absent in normal blood)"
      },
      {
            "name": "Myelocytes %",
            "unit": "%",
            "minNormal": 0,
            "maxNormal": 0,
            "textReference": "0 % (Absent in normal blood)"
      },
      {
            "name": "Blast Cells %",
            "unit": "%",
            "minNormal": 0,
            "maxNormal": 0,
            "textReference": "0 % (Absent in normal blood)"
      },
      {
            "name": "Absolute Neutrophils (ANC)",
            "unit": "x10^3/µL",
            "minNormal": 1.5,
            "maxNormal": 7.5,
            "notes": "Auto-calculated: (WBC × Neut%) / 100",
            "textReference": "1.5 - 7.5 x10^3/µL"
      },
      {
            "name": "Absolute Lymphocytes (ALC)",
            "unit": "x10^3/µL",
            "minNormal": 1,
            "maxNormal": 4,
            "notes": "Auto-calculated: (WBC × Lymph%) / 100",
            "textReference": "1.0 - 4.0 x10^3/µL"
      },
      {
            "name": "Absolute Monocytes (AMC)",
            "unit": "x10^3/µL",
            "minNormal": 0.2,
            "maxNormal": 0.8,
            "notes": "Auto-calculated: (WBC × Mono%) / 100",
            "textReference": "0.2 - 0.8 x10^3/µL"
      },
      {
            "name": "Absolute Eosinophils (AEC)",
            "unit": "x10^3/µL",
            "minNormal": 0.04,
            "maxNormal": 0.44,
            "notes": "Auto-calculated: (WBC × Eos%) / 100",
            "textReference": "0.04 - 0.44 x10^3/µL"
      },
      {
            "name": "Absolute Basophils (ABC)",
            "unit": "x10^3/µL",
            "minNormal": 0.01,
            "maxNormal": 0.1,
            "notes": "Auto-calculated: (WBC × Baso%) / 100",
            "textReference": "0.01 - 0.1 x10^3/µL"
      },
      {
            "name": "NLR (Neutrophil/Lymphocyte)",
            "unit": "Ratio",
            "minNormal": 0.8,
            "maxNormal": 2.5,
            "notes": "Auto-calculated: Neut% / Lymph%",
            "textReference": "0.8 - 2.5 (Inflammatory Index)"
      },
      {
            "name": "PLR (Platelet/Lymphocyte)",
            "unit": "Ratio",
            "minNormal": 100,
            "maxNormal": 150,
            "notes": "Auto-calculated: PLT / ALC",
            "textReference": "100 - 150"
      },
      {
            "name": "Reticulocyte Count %",
            "unit": "%",
            "minNormal": 0.5,
            "maxNormal": 2.5,
            "textReference": "0.5 - 2.5 %"
      },
      {
            "name": "RPI (Reticulocyte Production Index)",
            "unit": "Index",
            "minNormal": 1,
            "maxNormal": 3,
            "textReference": "> 2.0 indicates adequate marrow response"
      },
      {
            "name": "RBC Morphology",
            "unit": "",
            "textReference": "Normocytic normochromic, no anisopoikilocytosis",
            "method": "Leishman Stain Microscopy"
      },
      {
            "name": "WBC Morphology",
            "unit": "",
            "textReference": "Mature differential, no toxic granules, vacuoles, or blasts",
            "method": "Leishman Stain Microscopy"
      },
      {
            "name": "Platelet Morphology",
            "unit": "",
            "textReference": "Adequate on smear, normal aggregation, no giant forms",
            "method": "Leishman Stain Microscopy"
      }
]
  },

  // 2. COMPLETE URINE ANALYSIS
  {
    code: 'URINE',
    titleEn: 'Complete Urine Analysis',
    titleAr: 'تحليل البول الكامل (فحص فيزيائي، كيميائي، ومجهري)',
    category: 'Clinical Microscopy',
    sampleType: 'Clean Catch Midstream Urine',
    defaultInterpretation: 'Routine urinalysis shows clear appearance with no significant cellular or crystalline elements.',
    parameters: [
      // Physical Examination
      { name: 'Color', unit: '', textReference: 'Amber Yellow', method: 'Visual Inspection' },
      { name: 'Aspect / Transparency', unit: '', textReference: 'Clear', method: 'Visual Inspection' },
      { name: 'Specific Gravity (Sp. Gr.)', unit: '', minNormal: 1.010, maxNormal: 1.025, textReference: '1.010 - 1.025', method: 'Refractometry' },
      { name: 'Reaction (pH)', unit: '', minNormal: 5.0, maxNormal: 7.5, textReference: '5.0 - 7.5', method: 'Dipstick' },
      { name: 'Odour', unit: '', textReference: 'Normal Aromatic' },

      // Chemical Examination
      { name: 'Protein (Albumin)', unit: '', textReference: 'Nil (Negative)', method: 'Protein Error of Indicator' },
      { name: 'Glucose (Sugar)', unit: '', textReference: 'Nil (Negative)', method: 'Glucose Oxidase' },
      { name: 'Ketone Bodies (Acetone)', unit: '', textReference: 'Nil (Negative)', method: 'Sodium Nitroprusside' },
      { name: 'Bilirubin', unit: '', textReference: 'Nil (Negative)' },
      { name: 'Urobilinogen', unit: '', textReference: 'Normal (0.2 - 1.0 mg/dL)' },
      { name: 'Nitrite', unit: '', textReference: 'Negative' },
      { name: 'Leukocyte Esterase', unit: '', textReference: 'Negative' },
      { name: 'Blood / Hemoglobin', unit: '', textReference: 'Nil (Negative)' },

      // Microscopic Examination
      { name: 'Pus Cells (WBCs)', unit: '/ HPF', minNormal: 0, maxNormal: 5, textReference: '0 - 5 / HPF', notes: 'Significant pyuria if > 10 / HPF' },
      { name: 'Red Blood Cells (RBCs)', unit: '/ HPF', minNormal: 0, maxNormal: 3, textReference: '0 - 3 / HPF' },
      { name: 'Epithelial Cells', unit: '', textReference: 'Few / Nil' },
      { name: 'Crystals', unit: '', textReference: 'Nil seen' },
      { name: 'Casts', unit: '', textReference: 'Nil seen' },
      { name: 'Amorphous Deposits', unit: '', textReference: 'Nil seen' },
      { name: 'Bacteria', unit: '', textReference: 'Nil seen' },
      { name: 'Yeast Cells (Candida)', unit: '', textReference: 'Nil seen' },
      { name: 'Trichomonas vaginalis', unit: '', textReference: 'Nil seen' },
      { name: 'Mucus Threads', unit: '', textReference: 'Nil seen' }
    ]
  },

  // 3. COMPLETE STOOL ANALYSIS
  {
    code: 'STOOL',
    titleEn: 'Complete Stool Examination',
    titleAr: 'تحليل البراز الكامل (طفيليات، ديدان، وفحص مجهري)',
    category: 'Clinical Parasitology',
    sampleType: 'Fresh Stool Specimen',
    defaultInterpretation: 'No pathogenic protozoa, helminthic ova, or inflammatory elements identified.',
    parameters: [
      // Physical
      { name: 'Color', unit: '', textReference: 'Brown', method: 'Macroscopic Inspection' },
      { name: 'Consistency', unit: '', textReference: 'Formed / Semi-formed' },
      { name: 'Odour', unit: '', textReference: 'Faecal / Normal' },
      { name: 'Mucus', unit: '', textReference: 'Nil' },
      { name: 'Blood', unit: '', textReference: 'Nil' },

      // Chemical
      { name: 'Occult Blood (FOBT)', unit: '', textReference: 'Negative', method: 'Immunochromatographic / Guaiac' },
      { name: 'pH', unit: '', minNormal: 6.5, maxNormal: 7.5, textReference: '6.5 - 7.5' },
      { name: 'Reducing Substances', unit: '', textReference: 'Nil' },

      // Microscopic
      { name: 'Pus Cells (WBCs)', unit: '/ HPF', minNormal: 0, maxNormal: 4, textReference: '0 - 4 / HPF' },
      { name: 'R.B.Cs', unit: '/ HPF', minNormal: 0, maxNormal: 2, textReference: '0 - 2 / HPF' },
      { name: 'Protozoa & Cysts', unit: '', textReference: 'No protozoa or cysts seen' },
      { name: 'Helminthes & Ova', unit: '', textReference: 'No parasitic ova detected' },
      { name: 'Undigested Food / Muscle Fibres', unit: '', textReference: 'Nil to Few' },
      { name: 'Fat Globules', unit: '', textReference: 'Nil to Few' },
      { name: 'Starch Granules', unit: '', textReference: 'Nil to Few' },
      { name: 'Vegetable Cells', unit: '', textReference: 'Few' },
      { name: 'Yeast Cells', unit: '', textReference: 'Nil seen' }
    ]
  },

  // 4. SEMEN ANALYSIS (WHO 5th/6th Edition)
  {
    code: 'SEMEN',
    titleEn: 'Semen Analysis (WHO Criteria)',
    titleAr: 'تحليل السائل المنوي الشامل (معايير منظمة الصحة العالمية)',
    category: 'Andrology',
    sampleType: 'Complete Semen Ejaculate',
    defaultInterpretation: 'Sperm parameters conform to WHO 5th/6th Reference Limits (Normozoospermia).',
    parameters: [
      // Physical
      { name: 'Abstinence Period', unit: 'Days', minNormal: 2, maxNormal: 7, textReference: '2 - 7 Days' },
      { name: 'Collection Method', unit: '', textReference: 'Masturbation (In-Lab)' },
      { name: 'Volume', unit: 'mL', minNormal: 1.5, maxNormal: 5.0, textReference: '≥ 1.5 mL' },
      { name: 'Liquefaction Time', unit: 'Minutes', minNormal: 15, maxNormal: 60, textReference: '< 60 Minutes (Normal ~ 20 min)' },
      { name: 'Viscosity', unit: '', textReference: 'Normal' },
      { name: 'Appearance / Color', unit: '', textReference: 'Greyish-white / Opalescent' },
      { name: 'pH', unit: '', minNormal: 7.2, maxNormal: 8.0, textReference: '≥ 7.2' },

      // Microscopic Count & Motility
      { name: 'Sperm Concentration', unit: 'x10^6/mL', minNormal: 15.0, maxNormal: 200.0, textReference: '≥ 15.0 x 10^6 / mL' },
      { name: 'Total Sperm Count', unit: 'x10^6/ejaculate', minNormal: 39.0, maxNormal: 600.0, textReference: '≥ 39.0 x 10^6 / ejaculate', notes: 'Auto-calculated: Conc × Volume' },
      { name: 'Total Motility (PR + NP)', unit: '%', minNormal: 40, maxNormal: 100, textReference: '≥ 40%' },
      { name: 'Progressive Motility (PR)', unit: '%', minNormal: 32, maxNormal: 100, textReference: '≥ 32% (Grade A + B)' },
      { name: 'Non-Progressive Motility (NP)', unit: '%', textReference: 'Grade C' },
      { name: 'Immotile Sperm (IM)', unit: '%', textReference: 'Grade D' },

      // Morphology & Cytology
      { name: 'Normal Forms (Morphology)', unit: '%', minNormal: 4.0, maxNormal: 100.0, textReference: '≥ 4.0% (WHO Strict Criteria)' },
      { name: 'Abnormal Forms', unit: '%', textReference: '< 96%' },
      { name: 'Head Defects', unit: '%', textReference: 'Reported %' },
      { name: 'Midpiece & Tail Defects', unit: '%', textReference: 'Reported %' },
      { name: 'Viability / Vitality', unit: '%', minNormal: 58, maxNormal: 100, textReference: '≥ 58% live' },
      { name: 'Round Cells / Leucocytes', unit: 'x10^6/mL', minNormal: 0, maxNormal: 1.0, textReference: '< 1.0 x 10^6 / mL' },
      { name: 'Sperm Agglutination', unit: '', textReference: 'Nil' }
    ]
  },

  // 5. CULTURE & ANTIMICROBIAL SENSITIVITY (C&S)
  {
    code: 'CULTURE',
    titleEn: 'Culture & Antimicrobial Susceptibility (C&S)',
    titleAr: 'مزرعة ميكروبية واختبار حساسية المضادات الحيوية',
    category: 'Microbiology',
    sampleType: 'Clinical Specimen (Urine/Blood/Wound/Swab)',
    defaultInterpretation: 'Significant bacterial pathogen isolated. Antimicrobial susceptibility profile detailed below.',
    parameters: [
      { name: 'Specimen Type', unit: '', textReference: 'Urine / Swab / Blood' },
      { name: 'Gram Stain Examination', unit: '', textReference: 'Direct Smear' },
      { name: 'Colony Count', unit: 'CFU/mL', textReference: '> 100,000 CFU/mL (Significant)' },
      { name: 'Isolated Pathogen', unit: '', textReference: 'Escherichia coli (E. coli)' },
      { name: 'Amoxicillin / Clavulanate (Augmentin)', unit: '', textReference: 'Sensitive / Resistant' },
      { name: 'Piperacillin / Tazobactam (Tazocin)', unit: '', textReference: 'Sensitive / Resistant' },
      { name: 'Cefuroxime (Zinnat)', unit: '', textReference: 'Sensitive / Resistant' },
      { name: 'Ceftriaxone (Rocephin)', unit: '', textReference: 'Sensitive / Resistant' },
      { name: 'Ceftazidime (Fortum)', unit: '', textReference: 'Sensitive / Resistant' },
      { name: 'Cefepime (Maxipime)', unit: '', textReference: 'Sensitive / Resistant' },
      { name: 'Meropenem (Meronem)', unit: '', textReference: 'Sensitive / Resistant' },
      { name: 'Imipenem (Tienam)', unit: '', textReference: 'Sensitive / Resistant' },
      { name: 'Amikacin (Amikin)', unit: '', textReference: 'Sensitive / Resistant' },
      { name: 'Gentamicin (Garamycin)', unit: '', textReference: 'Sensitive / Resistant' },
      { name: 'Ciprofloxacin (Cipro)', unit: '', textReference: 'Sensitive / Resistant' },
      { name: 'Levofloxacin (Tavanic)', unit: '', textReference: 'Sensitive / Resistant' },
      { name: 'Nitrofurantoin (Macrodantin)', unit: '', textReference: 'Sensitive / Resistant' },
      { name: 'Fosfomycin (Monuril)', unit: '', textReference: 'Sensitive / Resistant' },
      { name: 'Trimethoprim / Sulfamethoxazole', unit: '', textReference: 'Sensitive / Resistant' },
      { name: 'Vancomycin (for Gram +ve)', unit: '', textReference: 'Sensitive / Resistant' },
      { name: 'Colistin (Colimycin)', unit: '', textReference: 'Sensitive / Resistant' }
    ]
  },

  // 6. INSULIN RESISTANCE PROFILE (HOMA-IR & QUICKI)
  {
    code: 'HOMA',
    titleEn: 'Insulin Resistance & Beta-Cell Function (HOMA)',
    titleAr: 'مقاومة الإنسولين ووظائف خلايا بيتا (HOMA-IR & QUICKI)',
    category: 'Endocrinology',
    sampleType: 'Serum & Fluoride Plasma (10-12h Fasting)',
    defaultInterpretation: 'HOMA-IR calculated based on fasting glucose and insulin levels.',
    parameters: [
      { name: 'Fasting Blood Glucose', unit: 'mg/dL', minNormal: 70, maxNormal: 99, panicLow: 50, panicHigh: 400, method: 'Hexokinase / GOD-PAP' },
      { name: 'Fasting Serum Insulin', unit: 'µIU/mL', minNormal: 2.6, maxNormal: 24.9, method: 'Chemiluminescence (CLIA)' },
      { name: 'HOMA-IR Index', unit: 'Index', minNormal: 0.5, maxNormal: 1.9, textReference: '< 1.9 Normal, 1.9 - 2.9 Borderline, > 2.9 High Resistance', notes: 'Auto-calculated: (Glucose × Insulin) / 405' },
      { name: 'HOMA-B (Beta Cell Function)', unit: '%', minNormal: 70, maxNormal: 150, textReference: '70 - 150 % (~100%)', notes: 'Auto-calculated: (20 × Insulin) / (Glucose - 63)' },
      { name: 'QUICKI Index', unit: 'Index', minNormal: 0.382, maxNormal: 0.500, textReference: '> 0.382 Normal Sensitivity', notes: 'Auto-calculated: 1 / [log(G) + log(I)]' },
      { name: 'C-Peptide Fasting', unit: 'ng/mL', minNormal: 1.1, maxNormal: 4.4 }
    ]
  },

  // 7. DIABETES & HbA1c
  {
    code: 'GLYCEMIC',
    titleEn: 'Diabetes & Glycemic Assessment (HbA1c & eAG)',
    titleAr: 'تقييم السكر التراكمي والجلوكوز ومتوسط السكر التقديري',
    category: 'Clinical Chemistry',
    sampleType: 'Fluoride Plasma & EDTA Blood',
    defaultInterpretation: 'Glycemic parameters evaluated according to ADA guidelines.',
    parameters: [
      { name: 'Fasting Blood Glucose', unit: 'mg/dL', minNormal: 70, maxNormal: 99, panicLow: 50, panicHigh: 400, method: 'Hexokinase' },
      { name: '2 Hours Post-Prandial Glucose', unit: 'mg/dL', minNormal: 70, maxNormal: 140, panicHigh: 450, method: 'Hexokinase' },
      { name: 'Random Blood Glucose', unit: 'mg/dL', minNormal: 70, maxNormal: 140 },
      { name: 'HbA1c (Glycated Hemoglobin)', unit: '%', minNormal: 4.0, maxNormal: 5.6, textReference: '< 5.7% Normal, 5.7 - 6.4% Pre-Diabetes, ≥ 6.5% Diabetes', method: 'HPLC / Turbidimetric' },
      { name: 'Estimated Average Glucose (eAG)', unit: 'mg/dL', minNormal: 68, maxNormal: 114, textReference: '80 - 120 mg/dL', notes: 'Auto-calculated: (28.7 × HbA1c) - 46.7' }
    ]
  },

  // 8. ALBUMIN / CREATININE RATIO (ACR)
  {
    code: 'ACR',
    titleEn: 'Urine Albumin / Creatinine Ratio (ACR)',
    titleAr: 'معدل الزلال إلى الكرياتينين في البول (الكشف المبكر لاعتلال الكلى)',
    category: 'Clinical Chemistry',
    sampleType: 'First Morning Urine Spot Specimen',
    defaultInterpretation: 'ACR provides sensitive early detection of diabetic and hypertensive microalbuminuria.',
    parameters: [
      { name: 'Urine Microalbumin', unit: 'mg/L', minNormal: 0, maxNormal: 20, method: 'Immunoturbidimetry' },
      { name: 'Urine Creatinine', unit: 'mg/dL', minNormal: 20, maxNormal: 300, method: 'Enzymatic / Jaffe' },
      { name: 'Albumin/Creatinine Ratio (ACR)', unit: 'mg/g', minNormal: 0, maxNormal: 30, textReference: '< 30 Normal, 30 - 300 Microalbuminuria, > 300 Macroalbuminuria', notes: 'Auto-calculated: (Microalbumin / Urine Creatinine) × 100' },
      { name: 'Total Urine Protein', unit: 'mg/dL', minNormal: 0, maxNormal: 15 },
      { name: 'Protein/Creatinine Ratio (UPCR)', unit: 'mg/mg', minNormal: 0, maxNormal: 0.2, textReference: '< 0.2 mg/mg' }
    ]
  },

  // 9. CORRECTED CALCIUM & ELECTROLYTES
  {
    code: 'CALCIUM_ELEC',
    titleEn: 'Electrolytes & Corrected Calcium (CA-I)',
    titleAr: 'أملاح الدم والكالسيوم المصحح بالألبومين',
    category: 'Clinical Chemistry',
    sampleType: 'Serum',
    defaultInterpretation: 'Electrolyte balance and serum calcium status evaluated.',
    parameters: [
      { name: 'Total Serum Calcium', unit: 'mg/dL', minNormal: 8.5, maxNormal: 10.5, panicLow: 6.5, panicHigh: 13.0, method: 'Arsenazo III' },
      { name: 'Serum Albumin', unit: 'g/dL', minNormal: 3.5, maxNormal: 5.2 },
      { name: 'Corrected Calcium (CA-I)', unit: 'mg/dL', minNormal: 8.5, maxNormal: 10.5, textReference: '8.5 - 10.5 mg/dL', notes: 'Auto-calculated: Total Ca + 0.8 × (4.0 - Albumin)' },
      { name: 'Ionized Calcium', unit: 'mmol/L', minNormal: 1.15, maxNormal: 1.33 },
      { name: 'Serum Inorganic Phosphorus', unit: 'mg/dL', minNormal: 2.5, maxNormal: 4.5 },
      { name: 'Serum Magnesium', unit: 'mg/dL', minNormal: 1.7, maxNormal: 2.6 },
      { name: 'Serum Sodium (Na+)', unit: 'mmol/L', minNormal: 135, maxNormal: 145, panicLow: 120, panicHigh: 160, method: 'ISE Direct' },
      { name: 'Serum Potassium (K+)', unit: 'mmol/L', minNormal: 3.5, maxNormal: 5.1, panicLow: 2.8, panicHigh: 6.5, method: 'ISE Direct' },
      { name: 'Serum Chloride (Cl-)', unit: 'mmol/L', minNormal: 98, maxNormal: 107 }
    ]
  },

  // 10. COMPLETE LIPID PROFILE
  {
    code: 'LIPID',
    titleEn: 'Lipid Profile',
    titleAr: 'دهون الدم الشاملة مع المؤشرات الحسابية',
    category: 'Clinical Chemistry',
    sampleType: 'Serum (12h Fasting)',
    defaultInterpretation: 'Lipid ratios demonstrate favorable cardiovascular risk stratification.',
    parameters: [
      { name: 'Total Serum Cholesterol', unit: 'mg/dL', minNormal: 120, maxNormal: 200, method: 'CHOD-PAP' },
      { name: 'Serum Triglycerides', unit: 'mg/dL', minNormal: 40, maxNormal: 150, panicHigh: 500, method: 'GPO-PAP' },
      { name: 'HDL - Cholesterol (Good)', unit: 'mg/dL', minNormal: 40, maxNormal: 65, method: 'Direct Accelerator' },
      { name: 'LDL - Cholesterol (Calculated)', unit: 'mg/dL', minNormal: 0, maxNormal: 100, notes: 'Friedewald Formula: Total Chol - HDL - (TG / 5)' },
      { name: 'VLDL - Cholesterol', unit: 'mg/dL', minNormal: 5, maxNormal: 30, notes: 'Auto-calculated: Triglycerides / 5' },
      { name: 'Non-HDL Cholesterol', unit: 'mg/dL', minNormal: 0, maxNormal: 130, notes: 'Auto-calculated: Total Chol - HDL' },
      { name: 'Total Chol / HDL Ratio', unit: 'Ratio', minNormal: 0, maxNormal: 4.5, textReference: '< 4.5 Desirable', notes: 'Auto-calculated: Total Chol / HDL' },
      { name: 'LDL / HDL Ratio', unit: 'Ratio', minNormal: 0, maxNormal: 3.0, textReference: '< 3.0 Desirable' }
    ]
  },

  // 11. LIVER FUNCTION FULL PROFILE
  {
    code: 'LFT',
    titleEn: 'Liver Function Tests (LFT)',
    titleAr: 'وظائف كبد متكاملة ومؤشرات الصفراء والبروتين',
    category: 'Clinical Chemistry',
    sampleType: 'Serum',
    defaultInterpretation: 'Enzyme activities and synthetic hepatic markers are within normal limits.',
    parameters: [
      { name: 'ALT (SGPT)', unit: 'U/L', minNormal: 0, maxNormal: 45, method: 'IFCC UV with P5P' },
      { name: 'AST (SGOT)', unit: 'U/L', minNormal: 0, maxNormal: 40, method: 'IFCC UV with P5P' },
      { name: 'Alkaline Phosphatase (ALP)', unit: 'U/L', minNormal: 40, maxNormal: 130 },
      { name: 'Total Bilirubin', unit: 'mg/dL', minNormal: 0.2, maxNormal: 1.2, panicHigh: 5.0, method: 'Jendrassik-Grof' },
      { name: 'Direct Bilirubin', unit: 'mg/dL', minNormal: 0.0, maxNormal: 0.3 },
      { name: 'Indirect Bilirubin', unit: 'mg/dL', minNormal: 0.1, maxNormal: 0.9, notes: 'Auto-calculated: Total - Direct' },
      { name: 'Total Serum Proteins', unit: 'g/dL', minNormal: 6.4, maxNormal: 8.3, method: 'Biuret' },
      { name: 'Serum Albumin', unit: 'g/dL', minNormal: 3.5, maxNormal: 5.2, method: 'Bromocresol Green (BCG)' },
      { name: 'Serum Globulin', unit: 'g/dL', minNormal: 2.3, maxNormal: 3.5, notes: 'Auto-calculated: Total Protein - Albumin' },
      { name: 'A/G Ratio', unit: 'Ratio', minNormal: 1.2, maxNormal: 2.2, notes: 'Auto-calculated: Albumin / Globulin' },
      { name: 'G.G.T', unit: 'U/L', minNormal: 9, maxNormal: 48 },
      { name: 'AST/ALT Ratio (De Ritis)', unit: 'Ratio', minNormal: 0.6, maxNormal: 1.1, notes: 'Auto-calculated: AST / ALT' }
    ]
  },

  // 12. KIDNEY FUNCTION FULL PROFILE
  {
    code: 'KFT',
    titleEn: 'Kidney Function Profile',
    titleAr: 'وظائف الكلى واليوريا ومعدل الفلترة eGFR',
    category: 'Clinical Chemistry',
    sampleType: 'Serum',
    defaultInterpretation: 'Renal biomarkers indicate adequate glomerular filtration and nitrogenous clearance.',
    parameters: [
      { name: 'Serum Creatinine', unit: 'mg/dL', minNormal: 0.6, maxNormal: 1.2, panicHigh: 4.0, method: 'Enzymatic / Jaffe Kinetic' },
      { name: 'Blood Urea', unit: 'mg/dL', minNormal: 15, maxNormal: 45, panicHigh: 120, method: 'Urease-GLDH' },
      { name: 'Blood Urea Nitrogen (BUN)', unit: 'mg/dL', minNormal: 7, maxNormal: 20 },
      { name: 'BUN / Creatinine Ratio', unit: 'Ratio', minNormal: 10, maxNormal: 20, notes: 'Auto-calculated: BUN / Creatinine' },
      { name: 'Serum Uric Acid', unit: 'mg/dL', minNormal: 3.5, maxNormal: 7.2, method: 'Uricase-PAP' },
      { name: 'eGFR (CKD-EPI)', unit: 'mL/min/1.73m²', minNormal: 90, maxNormal: 120, notes: 'Auto-calculated: CKD-EPI Formula' }
    ]
  },

  // 13. CARDIAC BIOMARKERS PANEL
  {
    code: 'CARDIAC',
    titleEn: 'Cardiac Biomarkers Panel',
    titleAr: 'دلالات وإنزيمات القلب الحادة (تروبونين، CK-MB، والجلطات)',
    category: 'Cardiac & Emergency',
    sampleType: 'Serum or Heparin Plasma',
    defaultInterpretation: 'High-sensitivity myocardial necrosis markers within baseline reference thresholds.',
    parameters: [
      { name: 'Troponin I High Sensitivity (hs-cTnI)', unit: 'ng/L', minNormal: 0, maxNormal: 14.0, panicHigh: 50.0, textReference: '< 14.0 ng/L', method: 'CLIA High Sensitivity' },
      { name: 'Troponin T (hs-cTnT)', unit: 'ng/L', minNormal: 0, maxNormal: 14.0, panicHigh: 50.0, textReference: '< 14.0 ng/L' },
      { name: 'CK-MB (Mass)', unit: 'ng/mL', minNormal: 0, maxNormal: 5.0, panicHigh: 25.0 },
      { name: 'Total CPK (Creatine Kinase)', unit: 'U/L', minNormal: 24, maxNormal: 195 },
      { name: 'Myoglobin', unit: 'ng/mL', minNormal: 0, maxNormal: 70 },
      { name: 'NT-proBNP', unit: 'pg/mL', minNormal: 0, maxNormal: 125, textReference: '< 125 pg/mL (< 75 yrs)' },
      { name: 'Lactate Dehydrogenase (LDH)', unit: 'U/L', minNormal: 125, maxNormal: 220 },
      { name: 'hs-CRP (Cardiac Risk)', unit: 'mg/L', minNormal: 0, maxNormal: 1.0, textReference: '< 1.0 Low Risk, 1-3 Average, > 3 High' }
    ]
  },

  // 14. THYROID FUNCTION FULL PANEL
  {
    code: 'THYROID',
    titleEn: 'Thyroid Function Full Panel',
    titleAr: 'وظائف الغدة الدرقية الكاملة والأجسام المضادة',
    category: 'Endocrinology',
    sampleType: 'Serum',
    defaultInterpretation: 'Euthyroid state: TSH, Free T3, and Free T4 are within euthyroid reference ranges.',
    parameters: [
      { name: 'TSH (Thyroid Stimulating Hormone)', unit: 'µIU/mL', minNormal: 0.27, maxNormal: 4.20, panicLow: 0.05, panicHigh: 20.0, method: 'Chemiluminescence (CLIA 3rd Gen)' },
      { name: 'Free T3 (FT3)', unit: 'pg/mL', minNormal: 2.0, maxNormal: 4.4, method: 'CLIA' },
      { name: 'Free T4 (FT4)', unit: 'ng/dL', minNormal: 0.93, maxNormal: 1.70, method: 'CLIA' },
      { name: 'Total Triiodothyronine (TT3)', unit: 'ng/mL', minNormal: 0.8, maxNormal: 2.0 },
      { name: 'Total Thyroxine (TT4)', unit: 'µg/dL', minNormal: 5.1, maxNormal: 14.1 },
      { name: 'Anti-TPO (Thyroid Peroxidase Ab)', unit: 'IU/mL', minNormal: 0, maxNormal: 34.0, textReference: '< 34.0 IU/mL' },
      { name: 'Anti-Thyroglobulin (Anti-TG)', unit: 'IU/mL', minNormal: 0, maxNormal: 115.0, textReference: '< 115.0 IU/mL' }
    ]
  },

  // 15. COAGULATION & THROMBOSIS PROFILE
  {
    code: 'COAG',
    titleEn: 'Coagulation & Hemostasis Profile',
    titleAr: 'سيولة وتجلط الدم (زمن البروثرومبين و INR و D-Dimer)',
    category: 'Hematology & Hemostasis',
    sampleType: 'Sodium Citrate Plasma (9:1 ratio)',
    defaultInterpretation: 'Hemostatic integrity confirmed; extrinsic and intrinsic pathways within normal reference limits.',
    parameters: [
      { name: 'Prothrombin Time (PT)', unit: 'Seconds', minNormal: 11.0, maxNormal: 13.5, method: 'Optical Coagulometer' },
      { name: 'Prothrombin Activity / Conc.', unit: '%', minNormal: 70, maxNormal: 120 },
      { name: 'INR (International Normalized Ratio)', unit: 'Ratio', minNormal: 0.85, maxNormal: 1.15, textReference: '0.85 - 1.15 (Warfarin Target: 2.0 - 3.0)', panicHigh: 4.5 },
      { name: 'PTT / APTT', unit: 'Seconds', minNormal: 26.0, maxNormal: 36.0, panicHigh: 70.0 },
      { name: 'Fibrinogen', unit: 'mg/dL', minNormal: 200, maxNormal: 400 },
      { name: 'D-Dimer (Quantitative)', unit: 'ng/mL FEU', minNormal: 0, maxNormal: 500, textReference: '< 500 ng/mL FEU', method: 'Immunoturbidimetry' }
    ]
  },

  // 16. IRON KINETICS & ANEMIA PANEL
  {
    code: 'IRON',
    titleEn: 'Iron Kinetics & Storage Profile',
    titleAr: 'مخزون الحديد وحديد المصل والأنيميا',
    category: 'Clinical Chemistry',
    sampleType: 'Serum (Morning Fasting)',
    defaultInterpretation: 'Iron indices and ferritin stores indicate adequate physiological iron reserves.',
    parameters: [
      { name: 'Serum Iron', unit: 'µg/dL', minNormal: 60, maxNormal: 170, method: 'Ferene / Colorimetric' },
      { name: 'Total Iron Binding Capacity (TIBC)', unit: 'µg/dL', minNormal: 250, maxNormal: 450 },
      { name: 'Unsaturated Iron Binding (UIBC)', unit: 'µg/dL', minNormal: 150, maxNormal: 300, notes: 'Auto-calculated: TIBC - Serum Iron' },
      { name: 'Transferrin Saturation (TSAT)', unit: '%', minNormal: 20, maxNormal: 50, textReference: '20 - 50 %', notes: 'Auto-calculated: (Iron / TIBC) × 100%' },
      { name: 'Serum Ferritin', unit: 'ng/mL', minNormal: 30, maxNormal: 400, panicLow: 10, method: 'CLIA / Immunoturbidimetry' }
    ]
  },

  // 17. FERTILITY & SEX HORMONES PANEL
  {
    code: 'FERTILITY',
    titleEn: 'Fertility & Reproductive Hormones',
    titleAr: 'هرمونات الخصوبة والتكاثر والحمل',
    category: 'Endocrinology',
    sampleType: 'Serum',
    defaultInterpretation: 'Pituitary-gonadal endocrine markers documented for clinical correlation.',
    parameters: [
      { name: 'FSH (Follicle Stimulating Hormone)', unit: 'mIU/mL', minNormal: 1.5, maxNormal: 12.4, method: 'CLIA' },
      { name: 'LH (Luteinizing Hormone)', unit: 'mIU/mL', minNormal: 1.7, maxNormal: 12.6, method: 'CLIA' },
      { name: 'Prolactin', unit: 'ng/mL', minNormal: 4.8, maxNormal: 23.3, method: 'CLIA' },
      { name: 'Estradiol (E2)', unit: 'pg/mL', minNormal: 20, maxNormal: 350 },
      { name: 'Progesterone', unit: 'ng/mL', minNormal: 0.2, maxNormal: 25.0 },
      { name: 'Total Testosterone', unit: 'ng/dL', minNormal: 280, maxNormal: 800, method: 'CLIA' },
      { name: 'Free Testosterone', unit: 'pg/mL', minNormal: 4.5, maxNormal: 32.0 },
      { name: 'Anti-Mullerian Hormone (AMH)', unit: 'ng/mL', minNormal: 1.0, maxNormal: 3.5, textReference: '1.0 - 3.5 ng/mL (Normal Ovarian Reserve)' },
      { name: 'Beta-hCG (Total Quantitative)', unit: 'mIU/mL', minNormal: 0, maxNormal: 5.0, textReference: '< 5.0 Non-Pregnant' }
    ]
  },

  // 18. TUMOR MARKERS PANEL
  {
    code: 'TUMOR',
    titleEn: 'Tumor Markers Panel',
    titleAr: 'دلالات الأورام الشاملة',
    category: 'Oncology & Immunodiagnostics',
    sampleType: 'Serum',
    defaultInterpretation: 'Tumor biomarker concentrations within baseline non-malignant limits.',
    parameters: [
      { name: 'PSA Total (Prostate)', unit: 'ng/mL', minNormal: 0, maxNormal: 4.0, panicHigh: 10.0, textReference: '< 4.0 ng/mL', method: 'CLIA' },
      { name: 'PSA Free', unit: 'ng/mL', minNormal: 0, maxNormal: 0.93 },
      { name: 'Free / Total PSA Ratio', unit: '%', minNormal: 25, maxNormal: 100, textReference: '> 25% Low Malignancy Probability' },
      { name: 'C.E.A (Carcinoembryonic Antigen)', unit: 'ng/mL', minNormal: 0, maxNormal: 3.0, textReference: '< 3.0 Non-smoker (< 5.0 Smoker)' },
      { name: 'Alpha-Fetoprotein (AFP)', unit: 'IU/mL', minNormal: 0, maxNormal: 5.8, textReference: '< 5.8 IU/mL' },
      { name: 'CA 19-9 (GI / Pancreas)', unit: 'U/mL', minNormal: 0, maxNormal: 37.0, textReference: '< 37.0 U/mL' },
      { name: 'CA 125 (Ovarian)', unit: 'U/mL', minNormal: 0, maxNormal: 35.0, textReference: '< 35.0 U/mL' },
      { name: 'CA 15-3 (Breast)', unit: 'U/mL', minNormal: 0, maxNormal: 30.0, textReference: '< 30.0 U/mL' }
    ]
  },

  // 19. RHEUMATOLOGY & AUTOIMMUNE
  {
    code: 'AUTOIMMUNE',
    titleEn: 'Rheumatology & Autoimmune Markers',
    titleAr: 'تحاليل الروماتيزم والمناعة الذاتية والالتهاب',
    category: 'Immunology',
    sampleType: 'Serum & Citrate Blood',
    defaultInterpretation: 'Inflammatory and rheumatological serological markers assessed.',
    parameters: [
      { name: 'ESR (1st Hour)', unit: 'mm/1st hr', minNormal: 0, maxNormal: 15, method: 'Westergren Method' },
      { name: 'ESR (2nd Hour)', unit: 'mm/2nd hr', minNormal: 0, maxNormal: 30 },
      { name: 'CRP (C-Reactive Protein Quantitative)', unit: 'mg/L', minNormal: 0, maxNormal: 6.0, textReference: '< 6.0 mg/L', method: 'Immunoturbidimetry' },
      { name: 'Rheumatoid Factor (RF Quantitative)', unit: 'IU/mL', minNormal: 0, maxNormal: 14.0, textReference: '< 14.0 IU/mL' },
      { name: 'Anti-CCP (Anti-Cyclic Citrullinated)', unit: 'U/mL', minNormal: 0, maxNormal: 17.0, textReference: '< 17.0 U/mL' },
      { name: 'ANA (Antinuclear Antibodies Titer)', unit: '', textReference: 'Negative (< 1:80)', method: 'Indirect Immunofluorescence (IIF)' },
      { name: 'Anti-dsDNA (Quantitative)', unit: 'IU/mL', minNormal: 0, maxNormal: 25.0, textReference: '< 25.0 IU/mL' },
      { name: 'ASOT (Anti-Streptolysin O Titer)', unit: 'IU/mL', minNormal: 0, maxNormal: 200, textReference: '< 200 IU/mL' }
    ]
  },

  // 20. VIRAL HEPATITIS & INFECTIOUS SEROLOGY
  {
    code: 'VIRAL',
    titleEn: 'Viral Hepatitis & Infectious Serology',
    titleAr: 'فيروسات الكبد والمناعة الفيروسية',
    category: 'Virology & Serology',
    sampleType: 'Serum',
    defaultInterpretation: 'Specific antibody / antigen screening test results.',
    parameters: [
      { name: 'HBsAg (Hepatitis B Surface Antigen)', unit: '', textReference: 'Non-Reactive (Negative)', method: 'CLIA / ECLIA' },
      { name: 'HCV Ab (Hepatitis C Virus Antibody)', unit: '', textReference: 'Non-Reactive (Negative)', method: 'CLIA / ECLIA' },
      { name: 'HIV 1/2 Ab & p24 Ag (4th Gen Duo)', unit: '', textReference: 'Non-Reactive (Negative)', method: 'CLIA 4th Generation' },
      { name: 'HAV IgM (Hepatitis A)', unit: '', textReference: 'Negative' }
    ]
  }
];

export * from './packagesData';
export * from './individualTestsData';
export * from './staffAndFacilitiesData';
export * from './loyaltyData';

