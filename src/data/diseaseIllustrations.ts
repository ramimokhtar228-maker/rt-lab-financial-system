import { DiseaseIllustration } from '../types';

export const DISEASE_ILLUSTRATIONS: DiseaseIllustration[] = [
  // ==========================================
  // HEMATOLOGY / CBC MICROSCOPIC DISEASE CARDS
  // ==========================================
  {
    id: "hem-normal",
    code: "HEM_NORMAL",
    category: "hematology",
    imageUrl: "data:image/svg+xml;utf8,%3Csvg%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%20viewBox%3D%220%200%20280%20160%22%20width%3D%22100%25%22%20height%3D%22100%25%22%3E%20%3Crect%20width%3D%22280%22%20height%3D%22160%22%20rx%3D%2212%22%20fill%3D%22%23090d16%22/%3E%20%3Ccircle%20cx%3D%22140%22%20cy%3D%2280%22%20r%3D%2270%22%20fill%3D%22%230f172a%22%20stroke%3D%22%23881337%22%20stroke-width%3D%222%22/%3E%20%3Ctext%20x%3D%22140%22%20y%3D%2224%22%20text-anchor%3D%22middle%22%20fill%3D%22%23f43f5e%22%20font-size%3D%2210%22%20font-weight%3D%22bold%22%20font-family%3D%22sans-serif%22%3ENORMAL%20BLOOD%20SMEAR%20%281000X%29%3C/text%3E%20%3C%21--%20Normal%20RBCs%20with%201/3%20central%20pallor%20--%3E%20%3Cg%20fill%3D%22%23e11d48%22%3E%20%3Ccircle%20cx%3D%22105%22%20cy%3D%2265%22%20r%3D%2216%22/%3E%3Ccircle%20cx%3D%22105%22%20cy%3D%2265%22%20r%3D%225.5%22%20fill%3D%22%23fecdd3%22/%3E%20%3Ccircle%20cx%3D%22145%22%20cy%3D%2255%22%20r%3D%2215%22/%3E%3Ccircle%20cx%3D%22145%22%20cy%3D%2255%22%20r%3D%225%22%20fill%3D%22%23fecdd3%22/%3E%20%3Ccircle%20cx%3D%22170%22%20cy%3D%2280%22%20r%3D%2216%22/%3E%3Ccircle%20cx%3D%22170%22%20cy%3D%2280%22%20r%3D%225.5%22%20fill%3D%22%23fecdd3%22/%3E%20%3Ccircle%20cx%3D%22130%22%20cy%3D%22105%22%20r%3D%2216%22/%3E%3Ccircle%20cx%3D%22130%22%20cy%3D%22105%22%20r%3D%225.5%22%20fill%3D%22%23fecdd3%22/%3E%20%3Ccircle%20cx%3D%2295%22%20cy%3D%2298%22%20r%3D%2215%22/%3E%3Ccircle%20cx%3D%2295%22%20cy%3D%2298%22%20r%3D%225%22%20fill%3D%22%23fecdd3%22/%3E%20%3C/g%3E%20%3C%21--%20Neutrophil%20--%3E%20%3Ccircle%20cx%3D%22140%22%20cy%3D%2280%22%20r%3D%2217%22%20fill%3D%22%23fbcfe8%22%20opacity%3D%220.4%22/%3E%20%3Cellipse%20cx%3D%22135%22%20cy%3D%2276%22%20rx%3D%224%22%20ry%3D%225%22%20fill%3D%22%236b21a8%22/%3E%20%3Cellipse%20cx%3D%22145%22%20cy%3D%2277%22%20rx%3D%224%22%20ry%3D%224%22%20fill%3D%22%236b21a8%22/%3E%20%3Cellipse%20cx%3D%22139%22%20cy%3D%2286%22%20rx%3D%224.5%22%20ry%3D%223.5%22%20fill%3D%22%236b21a8%22/%3E%20%3C%21--%20Platelets%20--%3E%20%3Ccircle%20cx%3D%22120%22%20cy%3D%2260%22%20r%3D%222.5%22%20fill%3D%22%2338bdf8%22/%3E%20%3Ccircle%20cx%3D%22160%22%20cy%3D%22100%22%20r%3D%222.5%22%20fill%3D%22%2338bdf8%22/%3E%20%3Ccircle%20cx%3D%22163%22%20cy%3D%2297%22%20r%3D%222%22%20fill%3D%22%2338bdf8%22/%3E%20%3Ctext%20x%3D%22140%22%20y%3D%22148%22%20text-anchor%3D%22middle%22%20fill%3D%22%2394a3b8%22%20font-size%3D%229%22%20font-family%3D%22sans-serif%22%3ENormocytic%20Normochromic%20Erythrocytes%3C/text%3E%20%3C/svg%3E",
    titleAr: "شريحة دم محيطي طبيعية (Normal Peripheral Blood Smear)",
    titleEn: "Normal Peripheral Blood Smear",
    pathologySummaryAr: "كرات دم حمراء طبيعية الحجم ومتساوية الصبغ (Normocytic Normochromic) مع مساحة شحوب مركزي طبيعية تعادل ثلث قطر الخلية، مع توزيع طبيعي لكرات الدم البيضاء والصفائح الدموية.",
    pathologySummaryEn: "Normocytic, normochromic erythrocytes with normal central pallor (~1/3 diameter). Adequate platelets and normal differential leucocytic morphology.",
    keyDiagnosticPoints: [
      "MCV: 80 - 98 fL | MCH: 27 - 33 pg | MCHC: 32 - 36 g/dL",
      "RBCs: uniform size and biconcave disc shape",
      "WBC differential within normal reference intervals",
      "Platelets: 150 - 450 x10^3/µL with normal granular appearance"
    ],
    associatedConditions: ["Physiological Baseline", "Healthy Reference", "Routine Wellness"],
    differentialDiagnosis: "No cytopenias or dysplastic features identified."
  },
  {
    id: "hem-iron-deficiency",
    code: "HEM_IDA",
    category: "hematology",
    imageUrl: "data:image/svg+xml;utf8,%3Csvg%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%20viewBox%3D%220%200%20280%20160%22%20width%3D%22100%25%22%20height%3D%22100%25%22%3E%20%3Crect%20width%3D%22280%22%20height%3D%22160%22%20rx%3D%2212%22%20fill%3D%22%23090d16%22/%3E%20%3Ccircle%20cx%3D%22140%22%20cy%3D%2280%22%20r%3D%2270%22%20fill%3D%22%230f172a%22%20stroke%3D%22%23e11d48%22%20stroke-width%3D%222%22/%3E%20%3Ctext%20x%3D%22140%22%20y%3D%2224%22%20text-anchor%3D%22middle%22%20fill%3D%22%23fb7185%22%20font-size%3D%2210%22%20font-weight%3D%22bold%22%20font-family%3D%22sans-serif%22%3EIRON%20DEFICIENCY%20ANEMIA%20%28IDA%29%3C/text%3E%20%3C%21--%20Hypochromic%20microcytic%20RBCs%20with%20thin%20rim%20--%3E%20%3Cg%20fill%3D%22%23e11d48%22%3E%20%3Ccircle%20cx%3D%22100%22%20cy%3D%2265%22%20r%3D%2213%22/%3E%3Ccircle%20cx%3D%22100%22%20cy%3D%2265%22%20r%3D%228.5%22%20fill%3D%22%230f172a%22/%3E%20%3Ccircle%20cx%3D%22150%22%20cy%3D%2260%22%20r%3D%2212%22/%3E%3Ccircle%20cx%3D%22150%22%20cy%3D%2260%22%20r%3D%228%22%20fill%3D%22%230f172a%22/%3E%20%3Ccircle%20cx%3D%22120%22%20cy%3D%22105%22%20r%3D%2213%22/%3E%3Ccircle%20cx%3D%22120%22%20cy%3D%22105%22%20r%3D%228.5%22%20fill%3D%22%230f172a%22/%3E%20%3Ccircle%20cx%3D%22170%22%20cy%3D%2285%22%20r%3D%2211%22/%3E%3Ccircle%20cx%3D%22170%22%20cy%3D%2285%22%20r%3D%227%22%20fill%3D%22%230f172a%22/%3E%20%3C/g%3E%20%3C%21--%20Pencil%20/%20Cigar%20cell%20--%3E%20%3Cellipse%20cx%3D%22135%22%20cy%3D%2278%22%20rx%3D%2220%22%20ry%3D%226%22%20transform%3D%22rotate%2835%20135%2078%29%22%20fill%3D%22%23e11d48%22/%3E%20%3Cellipse%20cx%3D%22135%22%20cy%3D%2278%22%20rx%3D%2215%22%20ry%3D%223.5%22%20transform%3D%22rotate%2835%20135%2078%29%22%20fill%3D%22%230f172a%22/%3E%20%3C%21--%20Label%20--%3E%20%3Ctext%20x%3D%22140%22%20y%3D%22148%22%20text-anchor%3D%22middle%22%20fill%3D%22%23fca5a5%22%20font-size%3D%229%22%20font-family%3D%22sans-serif%22%3EMicrocytic%20Hypochromic%20%26amp%3B%20Pencil%20Cells%3C/text%3E%20%3C/svg%3E",
    titleAr: "أنيميا نقص الحديد (Iron Deficiency Anemia)",
    titleEn: "Microcytic Hypochromic Anemia (Iron Deficiency)",
    pathologySummaryAr: "صورة كرات دم حمراء صغيرة الحجم وشديدة الشحوب (Microcytic Hypochromic) مع اتساع واضح للشحوب المركزي وخلايا قلمية مميزة (Pencil / Cigar cells) وتباين في الأحجام (Anisocytosis) وارتفاع مؤشر RDW ومؤشر منتزر > 13.",
    pathologySummaryEn: "Marked microcytosis and hypochromia with exaggerated central pallor, pencil/cigar-shaped elliptocytes, elevated RDW (>15%), and Mentzer Index > 13.",
    keyDiagnosticPoints: [
      "Low Hemoglobin, Low MCV (< 80 fL), Low MCH (< 27 pg)",
      "High RDW-CV (> 15%) reflecting marked anisocytosis",
      "Mentzer Index (MCV / RBC) > 13",
      "Pencil cells (cigar cells) and teardrop cells seen on blood film",
      "Low Serum Ferritin & Low Iron with elevated TIBC"
    ],
    associatedConditions: ["Chronic blood loss (GI / Menorrhagia)", "Poor dietary iron intake", "Malabsorption / Celiac disease"],
    differentialDiagnosis: "Beta Thalassemia Minor (distinguished by Mentzer < 13, normal RDW, and HbA2 > 3.5%)."
  },
  {
    id: "hem-thalassemia",
    code: "HEM_THAL",
    category: "hematology",
    imageUrl: "data:image/svg+xml;utf8,%3Csvg%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%20viewBox%3D%220%200%20280%20160%22%20width%3D%22100%25%22%20height%3D%22100%25%22%3E%20%3Crect%20width%3D%22280%22%20height%3D%22160%22%20rx%3D%2212%22%20fill%3D%22%23090d16%22/%3E%20%3Ccircle%20cx%3D%22140%22%20cy%3D%2280%22%20r%3D%2270%22%20fill%3D%22%230f172a%22%20stroke%3D%22%23d97706%22%20stroke-width%3D%222%22/%3E%20%3Ctext%20x%3D%22140%22%20y%3D%2224%22%20text-anchor%3D%22middle%22%20fill%3D%22%23f59e0b%22%20font-size%3D%2210%22%20font-weight%3D%22bold%22%20font-family%3D%22sans-serif%22%3EBETA%20THALASSEMIA%20TRAIT%3C/text%3E%20%3C%21--%20Target%20Cells%20%28Bullseye%29%20--%3E%20%3Cg%3E%20%3Ccircle%20cx%3D%22115%22%20cy%3D%2270%22%20r%3D%2215%22%20fill%3D%22%23e11d48%22/%3E%20%3Ccircle%20cx%3D%22115%22%20cy%3D%2270%22%20r%3D%2210%22%20fill%3D%22%230f172a%22/%3E%20%3Ccircle%20cx%3D%22115%22%20cy%3D%2270%22%20r%3D%224.5%22%20fill%3D%22%23e11d48%22/%3E%20%3Ccircle%20cx%3D%22160%22%20cy%3D%2275%22%20r%3D%2214%22%20fill%3D%22%23e11d48%22/%3E%20%3Ccircle%20cx%3D%22160%22%20cy%3D%2275%22%20r%3D%229%22%20fill%3D%22%230f172a%22/%3E%20%3Ccircle%20cx%3D%22160%22%20cy%3D%2275%22%20r%3D%224%22%20fill%3D%22%23e11d48%22/%3E%20%3C/g%3E%20%3C%21--%20Basophilic%20Stippling%20RBC%20--%3E%20%3Ccircle%20cx%3D%22135%22%20cy%3D%22105%22%20r%3D%2213%22%20fill%3D%22%23e11d48%22/%3E%20%3Ccircle%20cx%3D%22135%22%20cy%3D%22105%22%20r%3D%226%22%20fill%3D%22%23fecdd3%22/%3E%20%3Ccircle%20cx%3D%22133%22%20cy%3D%22103%22%20r%3D%221%22%20fill%3D%22%231e3a8a%22/%3E%20%3Ccircle%20cx%3D%22137%22%20cy%3D%22104%22%20r%3D%221%22%20fill%3D%22%231e3a8a%22/%3E%20%3Ccircle%20cx%3D%22134%22%20cy%3D%22107%22%20r%3D%221%22%20fill%3D%22%231e3a8a%22/%3E%20%3Ccircle%20cx%3D%22136%22%20cy%3D%22106%22%20r%3D%221%22%20fill%3D%22%231e3a8a%22/%3E%20%3Ctext%20x%3D%22140%22%20y%3D%22148%22%20text-anchor%3D%22middle%22%20fill%3D%22%23fde68a%22%20font-size%3D%229%22%20font-family%3D%22sans-serif%22%3ETarget%20Cells%20%28Codocytes%29%20%26amp%3B%20Stippling%3C/text%3E%20%3C/svg%3E",
    titleAr: "أنيميا البحر المتوسط (ثلاسيميا بيتا - Beta Thalassemia)",
    titleEn: "Beta Thalassemia Minor / Trait",
    pathologySummaryAr: "صغر واضح في حجم كرات الدم الحمراء (Microcytosis) مع وفرة عددية في كرات الدم الحمراء بالنسبة لنسبة الهيموجلوبين، وخلايا هدفية كلاسيكية (Target cells / Codocytes) مع تنقيط قاعدي مميز (Basophilic Stippling) ومؤشر منتزر أقل من 13.",
    pathologySummaryEn: "Profound microcytosis out of proportion to mild anemia, frequent Target cells (codocytes), basophilic stippling, normal to slightly elevated RDW, and Mentzer Index < 13.",
    keyDiagnosticPoints: [
      "Mentzer Index (MCV / RBC) < 13 (Highly suggestive of Thalassemia Trait)",
      "Target cells (bullseye appearance) prominent on peripheral smear",
      "Coarse basophilic stippling of erythrocytes",
      "Normal or mildly elevated serum ferritin level",
      "Confirmed via Hemoglobin Electrophoresis (Elevated HbA2 > 3.5%)"
    ],
    associatedConditions: ["Beta Thalassemia Minor (Trait)", "Hemoglobin E disease", "Alpha Thalassemia trait"],
    differentialDiagnosis: "Iron Deficiency Anemia (Ferritin low, Mentzer > 13, RDW markedly elevated)."
  },
  {
    id: "hem-megaloblastic",
    code: "HEM_MEGALO",
    category: "hematology",
    imageUrl: "data:image/svg+xml;utf8,%3Csvg%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%20viewBox%3D%220%200%20280%20160%22%20width%3D%22100%25%22%20height%3D%22100%25%22%3E%20%3Crect%20width%3D%22280%22%20height%3D%22160%22%20rx%3D%2212%22%20fill%3D%22%23090d16%22/%3E%20%3Ccircle%20cx%3D%22140%22%20cy%3D%2280%22%20r%3D%2270%22%20fill%3D%22%230f172a%22%20stroke%3D%22%238b5cf6%22%20stroke-width%3D%222%22/%3E%20%3Ctext%20x%3D%22140%22%20y%3D%2224%22%20text-anchor%3D%22middle%22%20fill%3D%22%23a78bfa%22%20font-size%3D%2210%22%20font-weight%3D%22bold%22%20font-family%3D%22sans-serif%22%3EMEGALOBLASTIC%20ANEMIA%20%28B12/FOLATE%29%3C/text%3E%20%3C%21--%20Large%20Oval%20Macrocytes%20--%3E%20%3Cellipse%20cx%3D%22105%22%20cy%3D%2270%22%20rx%3D%2220%22%20ry%3D%2215%22%20transform%3D%22rotate%28-15%20105%2070%29%22%20fill%3D%22%23e11d48%22/%3E%20%3Cellipse%20cx%3D%22105%22%20cy%3D%2270%22%20rx%3D%228%22%20ry%3D%226%22%20transform%3D%22rotate%28-15%20105%2070%29%22%20fill%3D%22%23fecdd3%22/%3E%20%3C%21--%20Hypersegmented%20Neutrophil%20%286%20lobes%29%20--%3E%20%3Ccircle%20cx%3D%22155%22%20cy%3D%2285%22%20r%3D%2220%22%20fill%3D%22%23fbcfe8%22%20opacity%3D%220.35%22/%3E%20%3Cg%20fill%3D%22%23581c87%22%3E%20%3Ccircle%20cx%3D%22148%22%20cy%3D%2275%22%20r%3D%224.5%22/%3E%20%3Ccircle%20cx%3D%22157%22%20cy%3D%2274%22%20r%3D%224.5%22/%3E%20%3Ccircle%20cx%3D%22164%22%20cy%3D%2280%22%20r%3D%224.5%22/%3E%20%3Ccircle%20cx%3D%22162%22%20cy%3D%2289%22%20r%3D%224.5%22/%3E%20%3Ccircle%20cx%3D%22153%22%20cy%3D%2294%22%20r%3D%224.5%22/%3E%20%3Ccircle%20cx%3D%22146%22%20cy%3D%2285%22%20r%3D%224.5%22/%3E%20%3C/g%3E%20%3Ctext%20x%3D%22140%22%20y%3D%22148%22%20text-anchor%3D%22middle%22%20fill%3D%22%23ddd6fe%22%20font-size%3D%229%22%20font-family%3D%22sans-serif%22%3EOval%20Macrocytes%20%26amp%3B%20Hypersegmented%20PMN%20%28%26gt%3B5%20lobes%29%3C/text%3E%20%3C/svg%3E",
    titleAr: "الأنيميا الخبيثة ونقص فيتامين ب12 والفوليك (Megaloblastic Anemia)",
    titleEn: "Megaloblastic Anemia (Vitamin B12 / Folate Deficiency)",
    pathologySummaryAr: "صورة كرات دم حمراء كروية بيضاوية ضخمة (Macro-ovalocytes) مع ارتفاع ملحوظ في الحجم الكروي الوسطي (MCV > 100 fL) مع خلايا متعادلة مفرطة التفصص (Hypersegmented Neutrophils تحوي 6 فصوص أو أكثر).",
    pathologySummaryEn: "Macro-ovalocytic erythrocytes with elevated MCV (> 100-115 fL), accompanied by pathognomonic hypersegmented neutrophils (>= 6 nuclear lobes) and pancytopenia.",
    keyDiagnosticPoints: [
      "High MCV (> 100 to 125 fL) with macro-ovalocytes",
      "Hypersegmented polymorphonuclear leukocytes (>= 5 lobes in > 5% of neutrophils or single 6-lobed)",
      "Howell-Jolly bodies (nuclear remnants) and Cabot rings",
      "Low Vitamin B12 (< 200 pg/mL) or low Serum / RBC Folate",
      "Markedly elevated serum LDH and indirect bilirubin (ineffective erythropoiesis)"
    ],
    associatedConditions: ["Pernicious anemia (Anti-Intrinsic Factor)", "Vegan dietary restriction", "Metformin or PPI long-term use"],
    differentialDiagnosis: "Non-megaloblastic macrocytosis (Liver disease, alcoholism, hypothyroidism, reticulocytosis)."
  },
  {
    id: "hem-sickle",
    code: "HEM_SICKLE",
    category: "hematology",
    imageUrl: "data:image/svg+xml;utf8,%3Csvg%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%20viewBox%3D%220%200%20280%20160%22%20width%3D%22100%25%22%20height%3D%22100%25%22%3E%20%3Crect%20width%3D%22280%22%20height%3D%22160%22%20rx%3D%2212%22%20fill%3D%22%23090d16%22/%3E%20%3Ccircle%20cx%3D%22140%22%20cy%3D%2280%22%20r%3D%2270%22%20fill%3D%22%230f172a%22%20stroke%3D%22%23ef4444%22%20stroke-width%3D%222%22/%3E%20%3Ctext%20x%3D%22140%22%20y%3D%2224%22%20text-anchor%3D%22middle%22%20fill%3D%22%23f87171%22%20font-size%3D%2210%22%20font-weight%3D%22bold%22%20font-family%3D%22sans-serif%22%3ESICKLE%20CELL%20ANEMIA%20%28HbSS%29%3C/text%3E%20%3C%21--%20Crescent%20Drepanocytes%20--%3E%20%3Cpath%20d%3D%22M%20105%2C45%20Q%20145%2C65%20110%2C105%20Q%20128%2C72%20105%2C45%20Z%22%20fill%3D%22%23b91c1c%22/%3E%20%3Cpath%20d%3D%22M%20140%2C55%20Q%20185%2C85%20145%2C120%20Q%20165%2C85%20140%2C55%20Z%22%20fill%3D%22%23b91c1c%22/%3E%20%3C%21--%20Target%20cell%20%26%20Howell-Jolly%20body%20--%3E%20%3Ccircle%20cx%3D%22165%22%20cy%3D%2265%22%20r%3D%2212%22%20fill%3D%22%23e11d48%22/%3E%20%3Ccircle%20cx%3D%22165%22%20cy%3D%2265%22%20r%3D%227%22%20fill%3D%22%230f172a%22/%3E%20%3Ccircle%20cx%3D%22165%22%20cy%3D%2265%22%20r%3D%223%22%20fill%3D%22%23e11d48%22/%3E%20%3Ccircle%20cx%3D%22100%22%20cy%3D%2295%22%20r%3D%2211%22%20fill%3D%22%23e11d48%22/%3E%20%3Ccircle%20cx%3D%2298%22%20cy%3D%2292%22%20r%3D%222%22%20fill%3D%22%231e1b4b%22/%3E%20%3Ctext%20x%3D%22140%22%20y%3D%22148%22%20text-anchor%3D%22middle%22%20fill%3D%22%23fca5a5%22%20font-size%3D%229%22%20font-family%3D%22sans-serif%22%3EDrepanocytes%20%28Sickle%20Cells%29%20%26amp%3B%20Howell-Jolly%3C/text%3E%20%3C/svg%3E",
    titleAr: "أنيميا الخلايا المنجلية (Sickle Cell Anemia - HbSS)",
    titleEn: "Sickle Cell Disease (Drepanocytosis)",
    pathologySummaryAr: "خلايا منجلية مقوسة مميزة حادة الأطراف (Sickle cells / Drepanocytes) ناتجة عن بلمرة هيموجلوبين S عند نقص الأكسجين، مع خلايا هدفية وأجسام هاول-جولي المصاحبة لقصور الطحال.",
    pathologySummaryEn: "Crescent-shaped elongated sickle cells (drepanocytes) with pointed ends due to HbS polymerization, target cells, and Howell-Jolly bodies reflecting autosplenectomy.",
    keyDiagnosticPoints: [
      "Classic sickle / crescentic RBCs on film with pointed tips",
      "Target cells, polychromasia, and nucleated RBCs in peripheral blood",
      "Howell-Jolly bodies reflecting functional autosplenectomy",
      "Positive Sickling Test & Hemoglobin Electrophoresis (HbS > 80% in HbSS)",
      "High Reticulocyte count and elevated unconjugated bilirubin"
    ],
    associatedConditions: ["Vaso-occlusive pain crisis", "Acute chest syndrome", "Hemolytic jaundice"],
    differentialDiagnosis: "Sickle-Thalassemia, Hemoglobin SC disease."
  },
  {
    id: "hem-spherocytosis",
    code: "HEM_SPHERO",
    category: "hematology",
    imageUrl: "data:image/svg+xml;utf8,%3Csvg%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%20viewBox%3D%220%200%20280%20160%22%20width%3D%22100%25%22%20height%3D%22100%25%22%3E%20%3Crect%20width%3D%22280%22%20height%3D%22160%22%20rx%3D%2212%22%20fill%3D%22%23090d16%22/%3E%20%3Ccircle%20cx%3D%22140%22%20cy%3D%2280%22%20r%3D%2270%22%20fill%3D%22%230f172a%22%20stroke%3D%22%23f43f5e%22%20stroke-width%3D%222%22/%3E%20%3Ctext%20x%3D%22140%22%20y%3D%2224%22%20text-anchor%3D%22middle%22%20fill%3D%22%23fb7185%22%20font-size%3D%2210%22%20font-weight%3D%22bold%22%20font-family%3D%22sans-serif%22%3EHEREDITARY%20SPHEROCYTOSIS%3C/text%3E%20%3C%21--%20Small%20dense%20spheres%20without%20central%20pallor%20--%3E%20%3Cg%20fill%3D%22%239f1239%22%3E%20%3Ccircle%20cx%3D%22110%22%20cy%3D%2270%22%20r%3D%2211%22/%3E%20%3Ccircle%20cx%3D%22135%22%20cy%3D%2260%22%20r%3D%2210.5%22/%3E%20%3Ccircle%20cx%3D%22160%22%20cy%3D%2275%22%20r%3D%2211%22/%3E%20%3Ccircle%20cx%3D%22140%22%20cy%3D%2295%22%20r%3D%2211.5%22/%3E%20%3Ccircle%20cx%3D%22115%22%20cy%3D%22100%22%20r%3D%2210.5%22/%3E%20%3C/g%3E%20%3C%21--%20One%20normal%20RBC%20for%20comparison%20--%3E%20%3Ccircle%20cx%3D%22168%22%20cy%3D%22105%22%20r%3D%2214%22%20fill%3D%22%23e11d48%22/%3E%20%3Ccircle%20cx%3D%22168%22%20cy%3D%22105%22%20r%3D%225%22%20fill%3D%22%23fecdd3%22/%3E%20%3Ctext%20x%3D%22140%22%20y%3D%22148%22%20text-anchor%3D%22middle%22%20fill%3D%22%23fecdd3%22%20font-size%3D%229%22%20font-family%3D%22sans-serif%22%3EMicrospherocytes%20%28Dense%20%26amp%3B%20No%20Central%20Pallor%29%3C/text%3E%20%3C/svg%3E",
    titleAr: "الخلايا الكروية الوراثية (Hereditary Spherocytosis)",
    titleEn: "Hereditary Spherocytosis & Immune Hemolysis",
    pathologySummaryAr: "كرات دم حمراء دائرية كثيفة الصبغة صغيرة القطر وتفتقر تماماً لمساحة الشحوب المركزي (Spherocytes) مع ارتفاع ملحوظ في مؤشر تركيز الهيموجلوبين MCHC (> 36 g/dL).",
    pathologySummaryEn: "Dense, spherical erythrocytes without central pallor (spherocytes) caused by RBC membrane defects, with elevated MCHC (> 36 g/dL) and reticulocytosis.",
    keyDiagnosticPoints: [
      "Microspherocytes on peripheral film (dense round cells lacking central pallor)",
      "Elevated MCHC (> 36 g/dL - pathognomonic parameter)",
      "Increased Osmotic Fragility and positive eosin-5-maleimide (EMA) binding test",
      "Elevated Reticulocyte count (> 5-10%)",
      "Negative Direct Antiglobulin Test (DAT/Coombs) differentiates from autoimmune hemolysis"
    ],
    associatedConditions: ["Hereditary spherocytosis (Spectrin / Ankyrin defect)", "Autoimmune Hemolytic Anemia (AIHA - Coombs positive)"],
    differentialDiagnosis: "Autoimmune hemolytic anemia (Warm AIHA with positive direct Coombs test)."
  },
  {
    id: "hem-sepsis",
    code: "HEM_SEPSIS",
    category: "hematology",
    imageUrl: "data:image/svg+xml;utf8,%3Csvg%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%20viewBox%3D%220%200%20280%20160%22%20width%3D%22100%25%22%20height%3D%22100%25%22%3E%20%3Crect%20width%3D%22280%22%20height%3D%22160%22%20rx%3D%2212%22%20fill%3D%22%23090d16%22/%3E%20%3Ccircle%20cx%3D%22140%22%20cy%3D%2280%22%20r%3D%2265%22%20fill%3D%22%230f172a%22%20stroke%3D%22%23881337%22%20stroke-width%3D%222%22/%3E%20%3Ctext%20x%3D%22140%22%20y%3D%2224%22%20text-anchor%3D%22middle%22%20fill%3D%22%23f43f5e%22%20font-size%3D%2210%22%20font-weight%3D%22bold%22%20font-family%3D%22sans-serif%22%3ERT%20LAB%20PATHOLOGICAL%20ATLAS%3C/text%3E%20%3Ccircle%20cx%3D%22110%22%20cy%3D%2280%22%20r%3D%2216%22%20fill%3D%22%23e11d48%22/%3E%3Ccircle%20cx%3D%22110%22%20cy%3D%2280%22%20r%3D%225%22%20fill%3D%22%23fecdd3%22/%3E%20%3Ccircle%20cx%3D%22155%22%20cy%3D%2275%22%20r%3D%2215%22%20fill%3D%22%23e11d48%22/%3E%3Ccircle%20cx%3D%22155%22%20cy%3D%2275%22%20r%3D%225%22%20fill%3D%22%23fecdd3%22/%3E%20%3Ccircle%20cx%3D%22135%22%20cy%3D%2295%22%20r%3D%2214%22%20fill%3D%22%23e11d48%22/%3E%3Ccircle%20cx%3D%22135%22%20cy%3D%2295%22%20r%3D%224.5%22%20fill%3D%22%23fecdd3%22/%3E%20%3Ccircle%20cx%3D%22140%22%20cy%3D%2265%22%20r%3D%2217%22%20fill%3D%22%236b21a8%22%20opacity%3D%220.6%22/%3E%20%3Ctext%20x%3D%22140%22%20y%3D%22148%22%20text-anchor%3D%22middle%22%20fill%3D%22%2394a3b8%22%20font-size%3D%229%22%20font-family%3D%22sans-serif%22%3EMicroscopic%20Clinical%20Diagnostic%20Field%3C/text%3E%20%3C/svg%3E",
    titleAr: "العدوى البكتيرية الشديدة ورد الفعل الابيضاضي (Bacterial Sepsis / Leukemoid Reaction)",
    titleEn: "Bacterial Sepsis & Leukemoid Reaction (Left Shift)",
    pathologySummaryAr: "زيادة كبيرة في عدد كرات الدم البيضاء المتعادلة مع انحراف لليسار (Shift to the Left: ظهور أشكال العصيات Band cells وخلايا Metamyelocytes) مع حبيبات سامة داكنة (Toxic Granulations) وفجوات سيتوبلازمية (Vacuoles) وأجسام دولي (Döhle bodies).",
    pathologySummaryEn: "Neutrophilic leukocytosis with significant left shift (elevated Band forms > 10%), coarse dark toxic granulations, cytoplasmic vacuolation, and Döhle bodies.",
    keyDiagnosticPoints: [
      "Total Leucocytic Count (TLC) marked elevation (> 15,000 - 30,000 /µL)",
      "High Absolute Neutrophil Count (ANC) and elevated NLR (> 5 - 15)",
      "Toxic granulation: coarse basophilic granules in neutrophil cytoplasm",
      "Döhle bodies: light blue cytoplasmic inclusions (ribosomal RNA remnants)",
      "High Leukocyte Alkaline Phosphatase (LAP) score (differs from CML)"
    ],
    associatedConditions: ["Severe bacterial pneumonia", "Bacteremia & septic shock", "Acute abdominal peritonitis"],
    differentialDiagnosis: "Chronic Myeloid Leukemia (distinguished by low LAP score and BCR-ABL translocation)."
  },
  {
    id: "hem-mono",
    code: "HEM_MONO",
    category: "hematology",
    imageUrl: "data:image/svg+xml;utf8,%3Csvg%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%20viewBox%3D%220%200%20280%20160%22%20width%3D%22100%25%22%20height%3D%22100%25%22%3E%20%3Crect%20width%3D%22280%22%20height%3D%22160%22%20rx%3D%2212%22%20fill%3D%22%23090d16%22/%3E%20%3Ccircle%20cx%3D%22140%22%20cy%3D%2280%22%20r%3D%2265%22%20fill%3D%22%230f172a%22%20stroke%3D%22%23881337%22%20stroke-width%3D%222%22/%3E%20%3Ctext%20x%3D%22140%22%20y%3D%2224%22%20text-anchor%3D%22middle%22%20fill%3D%22%23f43f5e%22%20font-size%3D%2210%22%20font-weight%3D%22bold%22%20font-family%3D%22sans-serif%22%3ERT%20LAB%20PATHOLOGICAL%20ATLAS%3C/text%3E%20%3Ccircle%20cx%3D%22110%22%20cy%3D%2280%22%20r%3D%2216%22%20fill%3D%22%23e11d48%22/%3E%3Ccircle%20cx%3D%22110%22%20cy%3D%2280%22%20r%3D%225%22%20fill%3D%22%23fecdd3%22/%3E%20%3Ccircle%20cx%3D%22155%22%20cy%3D%2275%22%20r%3D%2215%22%20fill%3D%22%23e11d48%22/%3E%3Ccircle%20cx%3D%22155%22%20cy%3D%2275%22%20r%3D%225%22%20fill%3D%22%23fecdd3%22/%3E%20%3Ccircle%20cx%3D%22135%22%20cy%3D%2295%22%20r%3D%2214%22%20fill%3D%22%23e11d48%22/%3E%3Ccircle%20cx%3D%22135%22%20cy%3D%2295%22%20r%3D%224.5%22%20fill%3D%22%23fecdd3%22/%3E%20%3Ccircle%20cx%3D%22140%22%20cy%3D%2265%22%20r%3D%2217%22%20fill%3D%22%236b21a8%22%20opacity%3D%220.6%22/%3E%20%3Ctext%20x%3D%22140%22%20y%3D%22148%22%20text-anchor%3D%22middle%22%20fill%3D%22%2394a3b8%22%20font-size%3D%229%22%20font-family%3D%22sans-serif%22%3EMicroscopic%20Clinical%20Diagnostic%20Field%3C/text%3E%20%3C/svg%3E",
    titleAr: "داء وحيدات النواة الخمجي (Infectious Mononucleosis - EBV)",
    titleEn: "Infectious Mononucleosis (Atypical Reactive Lymphocytes)",
    pathologySummaryAr: "ارتفاع عدد كرات الدم البيضاء الليمفاوية مع ظهور خلايا ليمفاوية تحفيزية مميزة (Atypical / Downey Lymphocytes) ذات حجم كبير وسيتوبلازم واسع متعرج يحيط بكرات الدم الحمراء المجاورة (Scalloped borders).",
    pathologySummaryEn: "Absolute lymphocytosis with prominent atypical / reactive Downey lymphocytes characterized by copious basophilic cytoplasm conforming to surrounding RBCs.",
    keyDiagnosticPoints: [
      "Absolute Lymphocyte Count (ALC) > 4,000 /µL with atypical lymphocytes > 10-20%",
      "Reactive lymphocytes with scalloped borders indented by erythrocytes",
      "Positive Paul-Bunnell / Monospot heterophile antibody test",
      "Elevated EBV IgM / VCA titers",
      "Mild concomitant elevation of hepatic transaminases (ALT/AST)"
    ],
    associatedConditions: ["Epstein-Barr Virus (EBV) infection", "Cytomegalovirus (CMV)", "Acute Viral Hepatitis"],
    differentialDiagnosis: "Acute lymphoblastic leukemia (distinguished by uniform immature blast morphology)."
  },
  {
    id: "hem-aml",
    code: "HEM_AML",
    category: "hematology",
    imageUrl: "data:image/svg+xml;utf8,%3Csvg%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%20viewBox%3D%220%200%20280%20160%22%20width%3D%22100%25%22%20height%3D%22100%25%22%3E%20%3Crect%20width%3D%22280%22%20height%3D%22160%22%20rx%3D%2212%22%20fill%3D%22%23090d16%22/%3E%20%3Ccircle%20cx%3D%22140%22%20cy%3D%2280%22%20r%3D%2265%22%20fill%3D%22%230f172a%22%20stroke%3D%22%23881337%22%20stroke-width%3D%222%22/%3E%20%3Ctext%20x%3D%22140%22%20y%3D%2224%22%20text-anchor%3D%22middle%22%20fill%3D%22%23f43f5e%22%20font-size%3D%2210%22%20font-weight%3D%22bold%22%20font-family%3D%22sans-serif%22%3ERT%20LAB%20PATHOLOGICAL%20ATLAS%3C/text%3E%20%3Ccircle%20cx%3D%22110%22%20cy%3D%2280%22%20r%3D%2216%22%20fill%3D%22%23e11d48%22/%3E%3Ccircle%20cx%3D%22110%22%20cy%3D%2280%22%20r%3D%225%22%20fill%3D%22%23fecdd3%22/%3E%20%3Ccircle%20cx%3D%22155%22%20cy%3D%2275%22%20r%3D%2215%22%20fill%3D%22%23e11d48%22/%3E%3Ccircle%20cx%3D%22155%22%20cy%3D%2275%22%20r%3D%225%22%20fill%3D%22%23fecdd3%22/%3E%20%3Ccircle%20cx%3D%22135%22%20cy%3D%2295%22%20r%3D%2214%22%20fill%3D%22%23e11d48%22/%3E%3Ccircle%20cx%3D%22135%22%20cy%3D%2295%22%20r%3D%224.5%22%20fill%3D%22%23fecdd3%22/%3E%20%3Ccircle%20cx%3D%22140%22%20cy%3D%2265%22%20r%3D%2217%22%20fill%3D%22%236b21a8%22%20opacity%3D%220.6%22/%3E%20%3Ctext%20x%3D%22140%22%20y%3D%22148%22%20text-anchor%3D%22middle%22%20fill%3D%22%2394a3b8%22%20font-size%3D%229%22%20font-family%3D%22sans-serif%22%3EMicroscopic%20Clinical%20Diagnostic%20Field%3C/text%3E%20%3C/svg%3E",
    titleAr: "سرطان الدم النخاعي الحاد (Acute Myeloid Leukemia - AML)",
    titleEn: "Acute Myeloid Leukemia (AML)",
    pathologySummaryAr: "وجود أرومات نخاعية غير ناضجة (Myeloblasts) تشغل مساحة واسعة مع نسبة نواة لسيتوبلازم مرتفعة (High N:C ratio) وأنوية متعددة واضحة، مع ظهور عصي آور المميزة (Auer rods) في السيتوبلازم مع نقص شديد في الصفائح الدموية وفقر دم حاد.",
    pathologySummaryEn: "Presence of large myeloblasts with delicate chromatin, prominent nucleoli, high N:C ratio, and pathognomonic red-pink Auer rods in the cytoplasm, accompanied by severe thrombocytopenia.",
    keyDiagnosticPoints: [
      "Blasts in peripheral blood >= 20% of nucleated cells",
      "Auer rods: crystallized peroxidase granules (pathognomonic of AML)",
      "Severe anemia and severe thrombocytopenia (< 50,000 /µL) with hemorrhagic tendency",
      "Myeloperoxidase (MPO) cytochemical staining positive",
      "Flow cytometry: CD13, CD33, CD34, CD117 positive"
    ],
    associatedConditions: ["Acute primary myeloid leukemia", "Secondary leukemic transformation from MDS", "Therapy-related AML"],
    differentialDiagnosis: "ALL, Acute promyelocytic leukemia (APML with faggot cells and t(15;17))."
  },
  {
    id: "hem-cll",
    code: "HEM_CLL",
    category: "hematology",
    imageUrl: "data:image/svg+xml;utf8,%3Csvg%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%20viewBox%3D%220%200%20280%20160%22%20width%3D%22100%25%22%20height%3D%22100%25%22%3E%20%3Crect%20width%3D%22280%22%20height%3D%22160%22%20rx%3D%2212%22%20fill%3D%22%23090d16%22/%3E%20%3Ccircle%20cx%3D%22140%22%20cy%3D%2280%22%20r%3D%2265%22%20fill%3D%22%230f172a%22%20stroke%3D%22%23881337%22%20stroke-width%3D%222%22/%3E%20%3Ctext%20x%3D%22140%22%20y%3D%2224%22%20text-anchor%3D%22middle%22%20fill%3D%22%23f43f5e%22%20font-size%3D%2210%22%20font-weight%3D%22bold%22%20font-family%3D%22sans-serif%22%3ERT%20LAB%20PATHOLOGICAL%20ATLAS%3C/text%3E%20%3Ccircle%20cx%3D%22110%22%20cy%3D%2280%22%20r%3D%2216%22%20fill%3D%22%23e11d48%22/%3E%3Ccircle%20cx%3D%22110%22%20cy%3D%2280%22%20r%3D%225%22%20fill%3D%22%23fecdd3%22/%3E%20%3Ccircle%20cx%3D%22155%22%20cy%3D%2275%22%20r%3D%2215%22%20fill%3D%22%23e11d48%22/%3E%3Ccircle%20cx%3D%22155%22%20cy%3D%2275%22%20r%3D%225%22%20fill%3D%22%23fecdd3%22/%3E%20%3Ccircle%20cx%3D%22135%22%20cy%3D%2295%22%20r%3D%2214%22%20fill%3D%22%23e11d48%22/%3E%3Ccircle%20cx%3D%22135%22%20cy%3D%2295%22%20r%3D%224.5%22%20fill%3D%22%23fecdd3%22/%3E%20%3Ccircle%20cx%3D%22140%22%20cy%3D%2265%22%20r%3D%2217%22%20fill%3D%22%236b21a8%22%20opacity%3D%220.6%22/%3E%20%3Ctext%20x%3D%22140%22%20y%3D%22148%22%20text-anchor%3D%22middle%22%20fill%3D%22%2394a3b8%22%20font-size%3D%229%22%20font-family%3D%22sans-serif%22%3EMicroscopic%20Clinical%20Diagnostic%20Field%3C/text%3E%20%3C/svg%3E",
    titleAr: "سرطان الدم الليمفاوي المزمن (Chronic Lymphocytic Leukemia - CLL)",
    titleEn: "Chronic Lymphocytic Leukemia (CLL)",
    pathologySummaryAr: "زيادة ليمفاوية شديدة ورتيبة من خلايا ليمفاوية صغيرة ناضجة المظهر مع تكتل كروماتيني نمطي (Soccer ball chromatin) ووفرة خلايا ملطخة مميزة (Smudge / Basket / Gumprecht cells) ناتجة عن هشاشة الخلايا السرطانية.",
    pathologySummaryEn: "Monotonous proliferation of mature-appearing small lymphocytes with clumped chromatin, along with abundant fragile smudge (basket) cells.",
    keyDiagnosticPoints: [
      "Persistent absolute monoclonal lymphocytosis > 5,000 /µL (often > 20,000 - 100,000)",
      "Smudge / Basket cells (Gumprecht shadows) readily visible on blood smear",
      "Small mature lymphocytes with dense cracked/checkerboard chromatin",
      "Flow cytometry co-expression: CD5+, CD19+, CD20 (dim), CD23+, and weak surface Ig",
      "Gradual painless lymphadenopathy and splenomegaly"
    ],
    associatedConditions: ["B-cell chronic lymphocytic leukemia", "Small lymphocytic lymphoma (SLL)", "Autoimmune hemolytic anemia complication"],
    differentialDiagnosis: "Mantle cell lymphoma, Prolymphocytic leukemia, Reactive viral lymphocytosis."
  },
  {
    id: "hem-cml",
    code: "HEM_CML",
    category: "hematology",
    imageUrl: "data:image/svg+xml;utf8,%3Csvg%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%20viewBox%3D%220%200%20280%20160%22%20width%3D%22100%25%22%20height%3D%22100%25%22%3E%20%3Crect%20width%3D%22280%22%20height%3D%22160%22%20rx%3D%2212%22%20fill%3D%22%23090d16%22/%3E%20%3Ccircle%20cx%3D%22140%22%20cy%3D%2280%22%20r%3D%2265%22%20fill%3D%22%230f172a%22%20stroke%3D%22%23881337%22%20stroke-width%3D%222%22/%3E%20%3Ctext%20x%3D%22140%22%20y%3D%2224%22%20text-anchor%3D%22middle%22%20fill%3D%22%23f43f5e%22%20font-size%3D%2210%22%20font-weight%3D%22bold%22%20font-family%3D%22sans-serif%22%3ERT%20LAB%20PATHOLOGICAL%20ATLAS%3C/text%3E%20%3Ccircle%20cx%3D%22110%22%20cy%3D%2280%22%20r%3D%2216%22%20fill%3D%22%23e11d48%22/%3E%3Ccircle%20cx%3D%22110%22%20cy%3D%2280%22%20r%3D%225%22%20fill%3D%22%23fecdd3%22/%3E%20%3Ccircle%20cx%3D%22155%22%20cy%3D%2275%22%20r%3D%2215%22%20fill%3D%22%23e11d48%22/%3E%3Ccircle%20cx%3D%22155%22%20cy%3D%2275%22%20r%3D%225%22%20fill%3D%22%23fecdd3%22/%3E%20%3Ccircle%20cx%3D%22135%22%20cy%3D%2295%22%20r%3D%2214%22%20fill%3D%22%23e11d48%22/%3E%3Ccircle%20cx%3D%22135%22%20cy%3D%2295%22%20r%3D%224.5%22%20fill%3D%22%23fecdd3%22/%3E%20%3Ccircle%20cx%3D%22140%22%20cy%3D%2265%22%20r%3D%2217%22%20fill%3D%22%236b21a8%22%20opacity%3D%220.6%22/%3E%20%3Ctext%20x%3D%22140%22%20y%3D%22148%22%20text-anchor%3D%22middle%22%20fill%3D%22%2394a3b8%22%20font-size%3D%229%22%20font-family%3D%22sans-serif%22%3EMicroscopic%20Clinical%20Diagnostic%20Field%3C/text%3E%20%3C/svg%3E",
    titleAr: "سرطان الدم النخاعي المزمن (Chronic Myeloid Leukemia - CML)",
    titleEn: "Chronic Myeloid Leukemia (CML)",
    pathologySummaryAr: "زيادة هائلة في عدد كرات الدم البيضاء (غالباً > 50,000 - 200,000) مع ظهور السلسلة النخاعية المحببة بأكملها في الدم المحيطي (أرومات، طلائع نقوية، خلايا نقوية، شبه نقوية، وعصيات) مع زيادة مميزة في الخلايا القاعدية (Basophilia).",
    pathologySummaryEn: "Dramatic leukocytosis (> 50,000 to > 200,000 /µL) displaying the full spectrum of myeloid differentiation: myeloblasts, promyelocytes, myelocytes, metamyelocytes, bands, and prominent basophilia.",
    keyDiagnosticPoints: [
      "Myelocyte bulge (myelocytes exceed metamyelocytes)",
      "Marked basophilia (> 2-5%) and eosinophilia",
      "Extremely low or absent Leukocyte Alkaline Phosphatase (LAP / NAP) score",
      "Presence of Philadelphia Chromosome t(9;22) and BCR-ABL1 fusion transcript",
      "Massive splenomegaly"
    ],
    associatedConditions: ["Chronic phase CML", "Accelerated phase / Blast crisis risk", "Myeloproliferative neoplasm (MPN)"],
    differentialDiagnosis: "Leukemoid reaction (distinguished by high LAP score, toxic granulation, and absent BCR-ABL)."
  },
  {
    id: "hem-itp",
    code: "HEM_ITP",
    category: "hematology",
    imageUrl: "data:image/svg+xml;utf8,%3Csvg%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%20viewBox%3D%220%200%20280%20160%22%20width%3D%22100%25%22%20height%3D%22100%25%22%3E%20%3Crect%20width%3D%22280%22%20height%3D%22160%22%20rx%3D%2212%22%20fill%3D%22%23090d16%22/%3E%20%3Ccircle%20cx%3D%22140%22%20cy%3D%2280%22%20r%3D%2265%22%20fill%3D%22%230f172a%22%20stroke%3D%22%23881337%22%20stroke-width%3D%222%22/%3E%20%3Ctext%20x%3D%22140%22%20y%3D%2224%22%20text-anchor%3D%22middle%22%20fill%3D%22%23f43f5e%22%20font-size%3D%2210%22%20font-weight%3D%22bold%22%20font-family%3D%22sans-serif%22%3ERT%20LAB%20PATHOLOGICAL%20ATLAS%3C/text%3E%20%3Ccircle%20cx%3D%22110%22%20cy%3D%2280%22%20r%3D%2216%22%20fill%3D%22%23e11d48%22/%3E%3Ccircle%20cx%3D%22110%22%20cy%3D%2280%22%20r%3D%225%22%20fill%3D%22%23fecdd3%22/%3E%20%3Ccircle%20cx%3D%22155%22%20cy%3D%2275%22%20r%3D%2215%22%20fill%3D%22%23e11d48%22/%3E%3Ccircle%20cx%3D%22155%22%20cy%3D%2275%22%20r%3D%225%22%20fill%3D%22%23fecdd3%22/%3E%20%3Ccircle%20cx%3D%22135%22%20cy%3D%2295%22%20r%3D%2214%22%20fill%3D%22%23e11d48%22/%3E%3Ccircle%20cx%3D%22135%22%20cy%3D%2295%22%20r%3D%224.5%22%20fill%3D%22%23fecdd3%22/%3E%20%3Ccircle%20cx%3D%22140%22%20cy%3D%2265%22%20r%3D%2217%22%20fill%3D%22%236b21a8%22%20opacity%3D%220.6%22/%3E%20%3Ctext%20x%3D%22140%22%20y%3D%22148%22%20text-anchor%3D%22middle%22%20fill%3D%22%2394a3b8%22%20font-size%3D%229%22%20font-family%3D%22sans-serif%22%3EMicroscopic%20Clinical%20Diagnostic%20Field%3C/text%3E%20%3C/svg%3E",
    titleAr: "نقص الصفائح المناعي والصفائح العملاقة (Immune Thrombocytopenic Purpura - ITP)",
    titleEn: "Immune Thrombocytopenia (ITP) & Giant Platelets",
    pathologySummaryAr: "نقص حاد في عدد الصفائح الدموية المحيطية (< 20,000 - 50,000) مع وجود صفائح دموية عملاقة نشطة (Giant / Megathrombocytes) تدل على تعويض نخاعي نشط لتعويض التكسير المناعي.",
    pathologySummaryEn: "Marked isolated peripheral thrombocytopenia with occasional giant macrothrombocytes reflecting accelerated megakaryocytic turnover in response to immune destruction.",
    keyDiagnosticPoints: [
      "Isolated thrombocytopenia (< 100,000 down to < 20,000 /µL)",
      "Normal WBC count and normal RBC morphology (unless secondary to hemorrhage)",
      "Giant platelets (diameter exceeding that of normal erythrocytes)",
      "Elevated MPV (Mean Platelet Volume) and elevated Immature Platelet Fraction (IPF)",
      "Absence of schistocytes (rules out TTP/HUS/DIC)"
    ],
    associatedConditions: ["Primary Autoimmune ITP", "Secondary ITP (SLE, Hepatitis C, Helicobacter pylori, HIV)"],
    differentialDiagnosis: "Thrombotic Thrombocytopenic Purpura (TTP - schistocytes present), Pseudothrombocytopenia (EDTA platelet clumping)."
  },

  // ==========================================
  // PATHOLOGICAL INFOGRAMS FOR OTHER LAB TESTS
  // ==========================================
  {
    id: "inf-lft",
    code: "INF_LFT",
    category: "biochemistry",
    imageUrl: "data:image/svg+xml;utf8,%3Csvg%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%20viewBox%3D%220%200%20280%20160%22%20width%3D%22100%25%22%20height%3D%22100%25%22%3E%20%3Crect%20width%3D%22280%22%20height%3D%22160%22%20rx%3D%2212%22%20fill%3D%22%23090d16%22/%3E%20%3Ctext%20x%3D%22140%22%20y%3D%2224%22%20text-anchor%3D%22middle%22%20fill%3D%22%23fb923c%22%20font-size%3D%2210%22%20font-weight%3D%22bold%22%20font-family%3D%22sans-serif%22%3EHEPATIC%20PANEL%20%26amp%3B%20ENZYMATIC%20RADAR%3C/text%3E%20%3Cg%20transform%3D%22translate%2850%2C45%29%22%3E%20%3C%21--%20ALT/AST%20bar%20--%3E%20%3Crect%20x%3D%220%22%20y%3D%220%22%20width%3D%2280%22%20height%3D%2214%22%20rx%3D%223%22%20fill%3D%22%231e293b%22/%3E%20%3Crect%20x%3D%220%22%20y%3D%220%22%20width%3D%2245%22%20height%3D%2214%22%20rx%3D%223%22%20fill%3D%22%23f59e0b%22/%3E%20%3Ctext%20x%3D%2288%22%20y%3D%2211%22%20fill%3D%22%23cbd5e1%22%20font-size%3D%229%22%20font-family%3D%22sans-serif%22%3EALT%20/%20GPT%20%28Cytolysis%29%3C/text%3E%20%3C%21--%20AST/GOT%20bar%20--%3E%20%3Crect%20x%3D%220%22%20y%3D%2222%22%20width%3D%2280%22%20height%3D%2214%22%20rx%3D%223%22%20fill%3D%22%231e293b%22/%3E%20%3Crect%20x%3D%220%22%20y%3D%2222%22%20width%3D%2238%22%20height%3D%2214%22%20rx%3D%223%22%20fill%3D%22%23f97316%22/%3E%20%3Ctext%20x%3D%2288%22%20y%3D%2233%22%20fill%3D%22%23cbd5e1%22%20font-size%3D%229%22%20font-family%3D%22sans-serif%22%3EAST%20/%20GOT%20%28Mitochondrial%29%3C/text%3E%20%3C%21--%20Alk%20Phos%20bar%20--%3E%20%3Crect%20x%3D%220%22%20y%3D%2244%22%20width%3D%2280%22%20height%3D%2214%22%20rx%3D%223%22%20fill%3D%22%231e293b%22/%3E%20%3Crect%20x%3D%220%22%20y%3D%2244%22%20width%3D%2255%22%20height%3D%2214%22%20rx%3D%223%22%20fill%3D%22%2306b6d4%22/%3E%20%3Ctext%20x%3D%2288%22%20y%3D%2255%22%20fill%3D%22%23cbd5e1%22%20font-size%3D%229%22%20font-family%3D%22sans-serif%22%3EAlk%20Phos%20%26amp%3B%20GGT%20%28Cholestasis%29%3C/text%3E%20%3C%21--%20Bilirubin%20bar%20--%3E%20%3Crect%20x%3D%220%22%20y%3D%2266%22%20width%3D%2280%22%20height%3D%2214%22%20rx%3D%223%22%20fill%3D%22%231e293b%22/%3E%20%3Crect%20x%3D%220%22%20y%3D%2266%22%20width%3D%2225%22%20height%3D%2214%22%20rx%3D%223%22%20fill%3D%22%23eab308%22/%3E%20%3Ctext%20x%3D%2288%22%20y%3D%2277%22%20fill%3D%22%23cbd5e1%22%20font-size%3D%229%22%20font-family%3D%22sans-serif%22%3ETotal%20%26amp%3B%20Direct%20Bilirubin%20%28Jaundice%29%3C/text%3E%20%3C/g%3E%20%3Ctext%20x%3D%22140%22%20y%3D%22148%22%20text-anchor%3D%22middle%22%20fill%3D%22%23fdba74%22%20font-size%3D%229%22%20font-family%3D%22sans-serif%22%3EDe%20Ritis%20Ratio%3A%20AST%20/%20ALT%20%28%26lt%3B1%20Steatosis/Viral%20%7C%20%26gt%3B2%20Alcoholic/Cirrhosis%29%3C/text%3E%20%3C/svg%3E",
    titleAr: "إنفوجرام تشخيص أمراض الكبد واليرقان (Liver Pathology Infogram)",
    titleEn: "Hepatocellular Damage vs. Cholestasis Infogram",
    pathologySummaryAr: "مخطط تفريقي سريري بين أذية الخلايا الكبدية (ارتفاع سائد في ALT و AST مثل التهابات الكبد الفيروسية والسمية) وبين ركود الصفراء والانسداد المراري (ارتفاع سائد في ALP و GGT والبيليروبين المباشر).",
    pathologySummaryEn: "Clinical diagnostic flowchart distinguishing Hepatocellular pattern (ALT/AST predominance) from Cholestatic / Biliary Obstructive pattern (ALP/GGT and Direct Bilirubin predominance).",
    keyDiagnosticPoints: [
      "Hepatocellular Pattern: ALT > AST markedly elevated (> 5-10x) in viral/acute hepatitis",
      "Alcoholic Liver Disease: AST/ALT ratio > 2.0 with elevated GGT",
      "Cholestatic Pattern: Marked elevation of ALP (> 3x) and GGT with high Direct Bilirubin",
      "Synthetic Liver Function: Serum Albumin and PT/INR reflect hepatic synthetic capacity",
      "Isolated indirect hyperbilirubinemia: Gilbert syndrome or hemolytic state"
    ],
    associatedConditions: ["Viral Hepatitis A/B/C", "NAFLD / NASH", "Gallbladder obstruction / Cholelithiasis", "Cirrhosis"],
    differentialDiagnosis: "Hepatic vs Post-hepatic Jaundice, Toxic drug injury vs viral hepatitis."
  },
  {
    id: "inf-kft",
    code: "INF_KFT",
    category: "biochemistry",
    imageUrl: "data:image/svg+xml;utf8,%3Csvg%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%20viewBox%3D%220%200%20280%20160%22%20width%3D%22100%25%22%20height%3D%22100%25%22%3E%20%3Crect%20width%3D%22280%22%20height%3D%22160%22%20rx%3D%2212%22%20fill%3D%22%23090d16%22/%3E%20%3Ctext%20x%3D%22140%22%20y%3D%2224%22%20text-anchor%3D%22middle%22%20fill%3D%22%23a78bfa%22%20font-size%3D%2210%22%20font-weight%3D%22bold%22%20font-family%3D%22sans-serif%22%3ERENAL%20IMPAIRMENT%20%26amp%3B%20eGFR%20STAGES%3C/text%3E%20%3C%21--%20eGFR%20Color%20Spectrum%20Bar%20--%3E%20%3Cg%20transform%3D%22translate%2840%2C50%29%22%3E%20%3Crect%20x%3D%220%22%20y%3D%220%22%20width%3D%2240%22%20height%3D%2224%22%20fill%3D%22%2310b981%22%20rx%3D%224%22/%3E%20%3Ctext%20x%3D%2220%22%20y%3D%2216%22%20fill%3D%22%23fff%22%20font-size%3D%228%22%20font-weight%3D%22bold%22%20text-anchor%3D%22middle%22%3EG1%20%26gt%3B90%3C/text%3E%20%3Crect%20x%3D%2242%22%20y%3D%220%22%20width%3D%2240%22%20height%3D%2224%22%20fill%3D%22%2384cc16%22%20rx%3D%224%22/%3E%20%3Ctext%20x%3D%2262%22%20y%3D%2216%22%20fill%3D%22%23fff%22%20font-size%3D%228%22%20font-weight%3D%22bold%22%20text-anchor%3D%22middle%22%3EG2%2060-89%3C/text%3E%20%3Crect%20x%3D%2284%22%20y%3D%220%22%20width%3D%2240%22%20height%3D%2224%22%20fill%3D%22%23eab308%22%20rx%3D%224%22/%3E%20%3Ctext%20x%3D%22104%22%20y%3D%2216%22%20fill%3D%22%23fff%22%20font-size%3D%228%22%20font-weight%3D%22bold%22%20text-anchor%3D%22middle%22%3EG3%2030-59%3C/text%3E%20%3Crect%20x%3D%22126%22%20y%3D%220%22%20width%3D%2240%22%20height%3D%2224%22%20fill%3D%22%23f97316%22%20rx%3D%224%22/%3E%20%3Ctext%20x%3D%22146%22%20y%3D%2216%22%20fill%3D%22%23fff%22%20font-size%3D%228%22%20font-weight%3D%22bold%22%20text-anchor%3D%22middle%22%3EG4%2015-29%3C/text%3E%20%3Crect%20x%3D%22168%22%20y%3D%220%22%20width%3D%2232%22%20height%3D%2224%22%20fill%3D%22%23ef4444%22%20rx%3D%224%22/%3E%20%3Ctext%20x%3D%22184%22%20y%3D%2216%22%20fill%3D%22%23fff%22%20font-size%3D%228%22%20font-weight%3D%22bold%22%20text-anchor%3D%22middle%22%3EG5%20%26lt%3B15%3C/text%3E%20%3C/g%3E%20%3C%21--%20Creatinine%20/%20Urea%20/%20eGFR%20labels%20--%3E%20%3Cg%20transform%3D%22translate%2840%2C90%29%22%20fill%3D%22%23cbd5e1%22%20font-size%3D%229%22%20font-family%3D%22sans-serif%22%3E%20%3Ctext%20x%3D%220%22%20y%3D%2212%22%3E%E2%80%A2%20Normal%20G1-G2%3A%20Creatinine%20%26lt%3B%201.2%20mg/dL%3C/text%3E%20%3Ctext%20x%3D%220%22%20y%3D%2228%22%3E%E2%80%A2%20Moderate%20G3%3A%20Creatinine%201.3%20-%202.5%20mg/dL%20%28Dose%20adjustment%29%3C/text%3E%20%3Ctext%20x%3D%220%22%20y%3D%2244%22%3E%E2%80%A2%20Severe%20G4-G5%3A%20Uremia%20%26amp%3B%20Nephrology%20referral%20indicated%3C/text%3E%20%3C/g%3E%20%3C/svg%3E",
    titleAr: "إنفوجرام القصور الكلوي ومراحل الترشيح الكبيبي (Kidney Function & eGFR Infogram)",
    titleEn: "Kidney Disease Stages & Azotemia Differential Infogram",
    pathologySummaryAr: "مخطط درجات القصور الكلوي المزمن (CKD Stages 1-5) المبني على معدل الترشيح الكبيبي المحسوب (eGFR) والتفريق بين القصور قبل الكلوي والكلوي وبعد الكلوي عبر نسبة اليوريا للكرياتينين.",
    pathologySummaryEn: "Clinical infographic detailing Chronic Kidney Disease (CKD) staging (eGFR stages 1 to 5) and differential azotemia evaluation using BUN-to-Creatinine ratio and urine sediment.",
    keyDiagnosticPoints: [
      "Stage 1: eGFR >= 90 (normal with kidney damage) | Stage 2: eGFR 60 - 89 (mild)",
      "Stage 3: eGFR 30 - 59 (moderate CKD) | Stage 4: eGFR 15 - 29 (severe CKD)",
      "Stage 5: eGFR < 15 mL/min/1.73m² (End-Stage Renal Disease - ESRD)",
      "Prerenal Azotemia: BUN/Creatinine ratio > 20:1 with high urine osmolality",
      "Intrinsic Renal Failure: BUN/Creatinine ratio 10-15:1 with granular casts",
      "Serum Uric Acid: Hyperuricemia leading to gouty nephropathy or nephrolithiasis"
    ],
    associatedConditions: ["Diabetic Nephropathy", "Hypertensive Nephrosclerosis", "Glomerulonephritis", "Acute Tubular Necrosis"],
    differentialDiagnosis: "Prerenal dehydration vs intrinsic ATN vs postrenal obstruction."
  },
  {
    id: "inf-lipid",
    code: "INF_LIPID",
    category: "biochemistry",
    imageUrl: "data:image/svg+xml;utf8,%3Csvg%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%20viewBox%3D%220%200%20280%20160%22%20width%3D%22100%25%22%20height%3D%22100%25%22%3E%20%3Crect%20width%3D%22280%22%20height%3D%22160%22%20rx%3D%2212%22%20fill%3D%22%23090d16%22/%3E%20%3Ctext%20x%3D%22140%22%20y%3D%2224%22%20text-anchor%3D%22middle%22%20fill%3D%22%23ec4899%22%20font-size%3D%2210%22%20font-weight%3D%22bold%22%20font-family%3D%22sans-serif%22%3ELIPID%20TARGETS%20%26amp%3B%20ATHEROGENIC%20INDEX%3C/text%3E%20%3C%21--%20Artery%20cross%20section%20--%3E%20%3Cg%20transform%3D%22translate%2860%2C40%29%22%3E%20%3Ccircle%20cx%3D%2245%22%20cy%3D%2245%22%20r%3D%2240%22%20fill%3D%22%23881337%22%20stroke%3D%22%23e11d48%22%20stroke-width%3D%224%22/%3E%20%3Ccircle%20cx%3D%2245%22%20cy%3D%2245%22%20r%3D%2232%22%20fill%3D%22%23be123c%22/%3E%20%3Cpath%20d%3D%22M%2045%2C13%20A%2032%2C32%200%200%2C1%2077%2C45%20L%2060%2C45%20A%2015%2C15%200%200%2C0%2045%2C30%20Z%22%20fill%3D%22%23fbbf24%22/%3E%20%3Ccircle%20cx%3D%2245%22%20cy%3D%2245%22%20r%3D%2222%22%20fill%3D%22%23090d16%22/%3E%20%3Ctext%20x%3D%2245%22%20y%3D%2248%22%20fill%3D%22%23f43f5e%22%20font-size%3D%228%22%20font-weight%3D%22bold%22%20text-anchor%3D%22middle%22%3ELUMEN%3C/text%3E%20%3C/g%3E%20%3Cg%20transform%3D%22translate%28145%2C50%29%22%20fill%3D%22%23cbd5e1%22%20font-size%3D%229%22%20font-family%3D%22sans-serif%22%3E%20%3Ctext%20x%3D%220%22%20y%3D%2212%22%3E%E2%80%A2%20Total%20Chol%3A%20%26lt%3B%20200%20mg/dL%3C/text%3E%20%3Ctext%20x%3D%220%22%20y%3D%2228%22%3E%E2%80%A2%20LDL%20%28Bad%29%3A%20%26lt%3B%20100%20mg/dL%3C/text%3E%20%3Ctext%20x%3D%220%22%20y%3D%2244%22%3E%E2%80%A2%20HDL%20%28Good%29%3A%20%26gt%3B%2040-50%20mg/dL%3C/text%3E%20%3Ctext%20x%3D%220%22%20y%3D%2260%22%3E%E2%80%A2%20Triglycerides%3A%20%26lt%3B%20150%20mg/dL%3C/text%3E%20%3C/g%3E%20%3Ctext%20x%3D%22140%22%20y%3D%22148%22%20text-anchor%3D%22middle%22%20fill%3D%22%23fbcfe8%22%20font-size%3D%229%22%20font-family%3D%22sans-serif%22%3EAtherogenic%20Plaque%20Risk%3A%20Total%20Chol%20/%20HDL%20Ratio%3C/text%3E%20%3C/svg%3E",
    titleAr: "إنفوجرام تصلب الشرايين ومخاطر الدهون (Atherosclerosis & Lipid Target Infogram)",
    titleEn: "Lipid Profile & Cardiovascular Risk Infogram",
    pathologySummaryAr: "مخطط مرئي لمراحل تكون اللويحة التصلبية الشريانية الناتجة عن أكسدة كوليسترول LDL وترسب الخلايا الرغوية (Foam cells)، مع حدود الأهداف العلاجية للدهون طبقاً للتوصيات العالمية.",
    pathologySummaryEn: "Visual pathophysiological timeline of atherosclerosis: endothelial injury -> oxidized LDL accumulation -> macrophage foam cell formation -> fibrous cap plaque rupture.",
    keyDiagnosticPoints: [
      "Total Cholesterol: Desirable < 200 mg/dL | Borderline: 200-239 | High >= 240",
      "LDL-C (Bad): Optimal < 100 mg/dL (< 70 or < 55 in very high risk CAD patients)",
      "HDL-C (Protective): > 40 mg/dL in males, > 50 mg/dL in females",
      "Triglycerides: Normal < 150 mg/dL | High 200-499 | Very high >= 500 (Pancreatitis risk)",
      "Non-HDL-C: Total Cholesterol minus HDL (Comprehensive atherogenic particle estimate)"
    ],
    associatedConditions: ["Coronary Artery Disease (CAD)", "Metabolic Syndrome", "Familial Hypercholesterolemia"],
    differentialDiagnosis: "Primary vs Secondary dyslipidemia (Hypothyroidism, Nephrotic syndrome, Diabetes)."
  },
  {
    id: "inf-glycemic",
    code: "INF_GLYCEMIC",
    category: "endocrinology",
    imageUrl: "data:image/svg+xml;utf8,%3Csvg%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%20viewBox%3D%220%200%20280%20160%22%20width%3D%22100%25%22%20height%3D%22100%25%22%3E%20%3Crect%20width%3D%22280%22%20height%3D%22160%22%20rx%3D%2212%22%20fill%3D%22%23090d16%22/%3E%20%3Ctext%20x%3D%22140%22%20y%3D%2224%22%20text-anchor%3D%22middle%22%20fill%3D%22%2338bdf8%22%20font-size%3D%2210%22%20font-weight%3D%22bold%22%20font-family%3D%22sans-serif%22%3EGLYCEMIC%20%26amp%3B%20HBA1C%20SPECTRUM%20METER%3C/text%3E%20%3C%21--%20Gauge%20Arc%20--%3E%20%3Cpath%20d%3D%22M%2060%2C110%20A%2080%2C80%200%200%2C1%20110%2C45%22%20fill%3D%22none%22%20stroke%3D%22%2310b981%22%20stroke-width%3D%2214%22/%3E%20%3Cpath%20d%3D%22M%20112%2C44%20A%2080%2C80%200%200%2C1%20168%2C44%22%20fill%3D%22none%22%20stroke%3D%22%23f59e0b%22%20stroke-width%3D%2214%22/%3E%20%3Cpath%20d%3D%22M%20170%2C45%20A%2080%2C80%200%200%2C1%20220%2C110%22%20fill%3D%22none%22%20stroke%3D%22%23ef4444%22%20stroke-width%3D%2214%22/%3E%20%3C%21--%20Gauge%20Needle%20--%3E%20%3Ccircle%20cx%3D%22140%22%20cy%3D%22110%22%20r%3D%228%22%20fill%3D%22%23e2e8f0%22/%3E%20%3Cline%20x1%3D%22140%22%20y1%3D%22110%22%20x2%3D%22155%22%20y2%3D%2255%22%20stroke%3D%22%23f8fafc%22%20stroke-width%3D%223%22%20stroke-linecap%3D%22round%22/%3E%20%3Ctext%20x%3D%2275%22%20y%3D%22125%22%20fill%3D%22%2334d399%22%20font-size%3D%228%22%20font-family%3D%22sans-serif%22%20font-weight%3D%22bold%22%3E%26lt%3B%205.7%25%20Normal%3C/text%3E%20%3Ctext%20x%3D%22140%22%20y%3D%2238%22%20text-anchor%3D%22middle%22%20fill%3D%22%23fbbf24%22%20font-size%3D%228%22%20font-family%3D%22sans-serif%22%20font-weight%3D%22bold%22%3E5.7%20-%206.4%25%20Pre-DM%3C/text%3E%20%3Ctext%20x%3D%22205%22%20y%3D%22125%22%20fill%3D%22%23f87171%22%20font-size%3D%228%22%20font-family%3D%22sans-serif%22%20font-weight%3D%22bold%22%3E%26gt%3B%3D%206.5%25%20Diabetic%3C/text%3E%20%3Ctext%20x%3D%22140%22%20y%3D%22148%22%20text-anchor%3D%22middle%22%20fill%3D%22%2394a3b8%22%20font-size%3D%229%22%20font-family%3D%22sans-serif%22%3EHOMA-IR%20/%20Insulin%20Resistance%20Target%20Gauge%3C/text%3E%20%3C/svg%3E",
    titleAr: "إنفوجرام سكر الدم والتراكمي ومقاومة الإنسولين (Glycemic Control & HbA1c Infogram)",
    titleEn: "Diabetes Diagnosis & 90-Day HbA1c Glycation Infogram",
    pathologySummaryAr: "مخطط بيولوجي يوضح ارتباط الجلوكوز بهيموجلوبين كرات الدم الحمراء طوال دورة حياتها البالغة 90-120 يوماً، مع معايير الجمعية الأمريكية للسكري (ADA) لتشخيص السكري وما قبل السكري ومؤشر HOMA-IR.",
    pathologySummaryEn: "Biological illustration of hemoglobin non-enzymatic glycation over RBC lifespan (90-120 days), with ADA diagnostic cutoffs for diabetes, prediabetes, and insulin resistance index.",
    keyDiagnosticPoints: [
      "Normal: Fasting < 100 mg/dL | 2h PPBS < 140 mg/dL | HbA1c < 5.7%",
      "Prediabetes: Fasting 100 - 125 | 2h PPBS 140 - 199 | HbA1c 5.7% - 6.4%",
      "Diabetes Mellitus: Fasting >= 126 | 2h PPBS >= 200 | HbA1c >= 6.5%",
      "HOMA-IR (Insulin Resistance): (Fasting Glucose mg/dL × Fasting Insulin µIU/mL) / 405",
      "HOMA-IR > 2.5 indicates significant insulin resistance"
    ],
    associatedConditions: ["Type 1 Diabetes Mellitus", "Type 2 Diabetes Mellitus", "Gestational Diabetes", "Metabolic Syndrome"],
    differentialDiagnosis: "Impaired Fasting Glucose vs Impaired Glucose Tolerance vs Stress Hyperglycemia."
  },
  {
    id: "inf-thyroid",
    code: "INF_THYROID",
    category: "endocrinology",
    imageUrl: "data:image/svg+xml;utf8,%3Csvg%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%20viewBox%3D%220%200%20280%20160%22%20width%3D%22100%25%22%20height%3D%22100%25%22%3E%20%3Crect%20width%3D%22280%22%20height%3D%22160%22%20rx%3D%2212%22%20fill%3D%22%23090d16%22/%3E%20%3Ccircle%20cx%3D%22140%22%20cy%3D%2280%22%20r%3D%2265%22%20fill%3D%22%230f172a%22%20stroke%3D%22%23881337%22%20stroke-width%3D%222%22/%3E%20%3Ctext%20x%3D%22140%22%20y%3D%2224%22%20text-anchor%3D%22middle%22%20fill%3D%22%23f43f5e%22%20font-size%3D%2210%22%20font-weight%3D%22bold%22%20font-family%3D%22sans-serif%22%3ERT%20LAB%20PATHOLOGICAL%20ATLAS%3C/text%3E%20%3Ccircle%20cx%3D%22110%22%20cy%3D%2280%22%20r%3D%2216%22%20fill%3D%22%23e11d48%22/%3E%3Ccircle%20cx%3D%22110%22%20cy%3D%2280%22%20r%3D%225%22%20fill%3D%22%23fecdd3%22/%3E%20%3Ccircle%20cx%3D%22155%22%20cy%3D%2275%22%20r%3D%2215%22%20fill%3D%22%23e11d48%22/%3E%3Ccircle%20cx%3D%22155%22%20cy%3D%2275%22%20r%3D%225%22%20fill%3D%22%23fecdd3%22/%3E%20%3Ccircle%20cx%3D%22135%22%20cy%3D%2295%22%20r%3D%2214%22%20fill%3D%22%23e11d48%22/%3E%3Ccircle%20cx%3D%22135%22%20cy%3D%2295%22%20r%3D%224.5%22%20fill%3D%22%23fecdd3%22/%3E%20%3Ccircle%20cx%3D%22140%22%20cy%3D%2265%22%20r%3D%2217%22%20fill%3D%22%236b21a8%22%20opacity%3D%220.6%22/%3E%20%3Ctext%20x%3D%22140%22%20y%3D%22148%22%20text-anchor%3D%22middle%22%20fill%3D%22%2394a3b8%22%20font-size%3D%229%22%20font-family%3D%22sans-serif%22%3EMicroscopic%20Clinical%20Diagnostic%20Field%3C/text%3E%20%3C/svg%3E",
    titleAr: "إنفوجرام محور الغدة الدرقية والتغذية الراجعة (Thyroid HPT Axis Infogram)",
    titleEn: "Hypothalamic-Pituitary-Thyroid (HPT) Feedback Axis",
    pathologySummaryAr: "مخطط فسيولوجي للتغذية الراجعة السلبية لهرمونات الغدة الدرقية (FT3 و FT4) على الغدة النخامية (TSH) ومصفوفة تشخيص خمول ونشاط الغدة الأولي وتحت الإكلينيكي.",
    pathologySummaryEn: "Physiological feedback diagram illustrating HPT axis and diagnostic matrix for Primary Hypothyroidism, Subclinical Hypothyroidism, Hyperthyroidism, and Pituitary adenoma.",
    keyDiagnosticPoints: [
      "Primary Hypothyroidism: Elevated TSH with decreased Free T4 and Free T3",
      "Subclinical Hypothyroidism: Elevated TSH with normal Free T4 (monitor Anti-TPO)",
      "Primary Hyperthyroidism / Thyrotoxicosis: Suppressed TSH (< 0.05) with elevated FT4 / FT3",
      "Subclinical Hyperthyroidism: Suppressed TSH with normal Free T4",
      "Secondary (Central) Thyroid Failure: Low / Normal TSH with Low Free T4",
      "Anti-TPO & Anti-TG antibodies: Elevated in Hashimoto thyroiditis and Graves disease"
    ],
    associatedConditions: ["Hashimoto Thyroiditis", "Graves Disease", "Toxic Multinodular Goiter", "Subacute Thyroiditis"],
    differentialDiagnosis: "Primary vs Secondary thyroid dysfunction, Euthyroid Sick Syndrome."
  },
  {
    id: "inf-urine",
    code: "INF_URINE",
    category: "microscopy",
    imageUrl: "data:image/svg+xml;utf8,%3Csvg%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%20viewBox%3D%220%200%20280%20160%22%20width%3D%22100%25%22%20height%3D%22100%25%22%3E%20%3Crect%20width%3D%22280%22%20height%3D%22160%22%20rx%3D%2212%22%20fill%3D%22%23090d16%22/%3E%20%3Ccircle%20cx%3D%22140%22%20cy%3D%2280%22%20r%3D%2270%22%20fill%3D%22%230f172a%22%20stroke%3D%22%230ea5e9%22%20stroke-width%3D%222%22/%3E%20%3Ctext%20x%3D%22140%22%20y%3D%2224%22%20text-anchor%3D%22middle%22%20fill%3D%22%2338bdf8%22%20font-size%3D%2210%22%20font-weight%3D%22bold%22%20font-family%3D%22sans-serif%22%3EURINARY%20SEDIMENT%20%26amp%3B%20CRYSTALS%20%28400X%29%3C/text%3E%20%3C%21--%20Calcium%20Oxalate%20Envelope%20Crystal%20--%3E%20%3Cg%20transform%3D%22translate%28100%2C55%29%22%3E%20%3Crect%20x%3D%220%22%20y%3D%220%22%20width%3D%2228%22%20height%3D%2228%22%20fill%3D%22%231e293b%22%20stroke%3D%22%2338bdf8%22%20stroke-width%3D%221.5%22/%3E%20%3Cline%20x1%3D%220%22%20y1%3D%220%22%20x2%3D%2228%22%20y2%3D%2228%22%20stroke%3D%22%2338bdf8%22%20stroke-width%3D%221.5%22/%3E%20%3Cline%20x1%3D%2228%22%20y1%3D%220%22%20x2%3D%220%22%20y2%3D%2228%22%20stroke%3D%22%2338bdf8%22%20stroke-width%3D%221.5%22/%3E%20%3C/g%3E%20%3C%21--%20Triple%20Phosphate%20Coffin%20Lid%20Prism%20--%3E%20%3Cg%20transform%3D%22translate%28150%2C70%29%22%3E%20%3Cpolygon%20points%3D%220%2C6%2018%2C0%2036%2C6%2036%2C24%2018%2C30%200%2C24%22%20fill%3D%22%230f2b38%22%20stroke%3D%22%237dd3fc%22%20stroke-width%3D%221.5%22/%3E%20%3Cline%20x1%3D%2218%22%20y1%3D%220%22%20x2%3D%2218%22%20y2%3D%2230%22%20stroke%3D%22%237dd3fc%22%20stroke-width%3D%221%22/%3E%20%3C/g%3E%20%3C%21--%20Pus%20cells%20/%20RBCs%20--%3E%20%3Ccircle%20cx%3D%22110%22%20cy%3D%22105%22%20r%3D%227%22%20fill%3D%22%23fef08a%22%20stroke%3D%22%23eab308%22%20stroke-width%3D%221%22/%3E%20%3Ccircle%20cx%3D%22125%22%20cy%3D%22110%22%20r%3D%226%22%20fill%3D%22%23fecdd3%22%20stroke%3D%22%23f43f5e%22%20stroke-width%3D%221%22/%3E%20%3Ctext%20x%3D%22140%22%20y%3D%22148%22%20text-anchor%3D%22middle%22%20fill%3D%22%23bae6fd%22%20font-size%3D%229%22%20font-family%3D%22sans-serif%22%3EEnvelope%20Ca-Oxalate%20%26amp%3B%20Triple%20Phosphate%20Prisms%3C/text%3E%20%3C/svg%3E",
    titleAr: "إنفوجرام الفحص المجهري لرواسب البول (Urinary Sediment Microscopy Infogram)",
    titleEn: "Urine Microscopic Sediment Atlas Infogram",
    pathologySummaryAr: "دليل مرئي مجهري للبلورات (أوكزالات كالسيوم، يوريك أسيد، فوسفات ثلاثي) والأسطوانات (شفافة، حبيبية، كلوية، صديدية) وخلايا الصديد والدم والظهارية.",
    pathologySummaryEn: "Illustrated microscopic atlas of urinary sediment elements including crystals (calcium oxalate, uric acid, triple phosphate), casts (hyaline, granular, RBC, WBC casts), and cells.",
    keyDiagnosticPoints: [
      "Calcium Oxalate Crystals: Envelope-shaped (dihydrate) or dumbbell-shaped (monohydrate)",
      "Uric Acid Crystals: Diamond, rosette, or rhomboid under acidic urine pH",
      "Triple Phosphate Crystals: Coffin-lid appearance in alkaline urine (Proteus UTI)",
      "RBC Casts: Pathognomonic of acute glomerulonephritis",
      "WBC Casts: Differentiates acute pyelonephritis from lower cystitis",
      "Pus Cells (Pyuria): > 5 / HPF indicates urinary tract inflammation / infection"
    ],
    associatedConditions: ["Urinary Tract Infection (UTI)", "Urolithiasis / Kidney Stones", "Glomerulonephritis", "Interstitial Nephritis"],
    differentialDiagnosis: "Glomerular vs Non-glomerular hematuria (Dysmorphic RBCs and RBC casts)."
  },
  {
    id: "inf-stool",
    code: "INF_STOOL",
    category: "parasitology",
    imageUrl: "data:image/svg+xml;utf8,%3Csvg%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%20viewBox%3D%220%200%20280%20160%22%20width%3D%22100%25%22%20height%3D%22100%25%22%3E%20%3Crect%20width%3D%22280%22%20height%3D%22160%22%20rx%3D%2212%22%20fill%3D%22%23090d16%22/%3E%20%3Ccircle%20cx%3D%22140%22%20cy%3D%2280%22%20r%3D%2270%22%20fill%3D%22%230f172a%22%20stroke%3D%22%2310b981%22%20stroke-width%3D%222%22/%3E%20%3Ctext%20x%3D%22140%22%20y%3D%2224%22%20text-anchor%3D%22middle%22%20fill%3D%22%2334d399%22%20font-size%3D%2210%22%20font-weight%3D%22bold%22%20font-family%3D%22sans-serif%22%3ESTOOL%20PARASITOLOGY%20%28400X%29%3C/text%3E%20%3C%21--%20Entamoeba%20Histolytica%20Cyst%20--%3E%20%3Cg%20transform%3D%22translate%28100%2C55%29%22%3E%20%3Ccircle%20cx%3D%2218%22%20cy%3D%2218%22%20r%3D%2217%22%20fill%3D%22%23064e3b%22%20stroke%3D%22%2334d399%22%20stroke-width%3D%221.5%22/%3E%20%3C%21--%204%20nuclei%20--%3E%20%3Ccircle%20cx%3D%2212%22%20cy%3D%2212%22%20r%3D%223%22%20fill%3D%22%23ecfdf5%22%20stroke%3D%22%23059669%22%20stroke-width%3D%221%22/%3E%3Ccircle%20cx%3D%2212%22%20cy%3D%2212%22%20r%3D%221%22%20fill%3D%22%23047857%22/%3E%20%3Ccircle%20cx%3D%2224%22%20cy%3D%2212%22%20r%3D%223%22%20fill%3D%22%23ecfdf5%22%20stroke%3D%22%23059669%22%20stroke-width%3D%221%22/%3E%3Ccircle%20cx%3D%2224%22%20cy%3D%2212%22%20r%3D%221%22%20fill%3D%22%23047857%22/%3E%20%3Ccircle%20cx%3D%2212%22%20cy%3D%2224%22%20r%3D%223%22%20fill%3D%22%23ecfdf5%22%20stroke%3D%22%23059669%22%20stroke-width%3D%221%22/%3E%3Ccircle%20cx%3D%2212%22%20cy%3D%2224%22%20r%3D%221%22%20fill%3D%22%23047857%22/%3E%20%3Ccircle%20cx%3D%2224%22%20cy%3D%2224%22%20r%3D%223%22%20fill%3D%22%23ecfdf5%22%20stroke%3D%22%23059669%22%20stroke-width%3D%221%22/%3E%3Ccircle%20cx%3D%2224%22%20cy%3D%2224%22%20r%3D%221%22%20fill%3D%22%23047857%22/%3E%20%3C%21--%20Chromatoid%20bar%20--%3E%20%3Crect%20x%3D%2210%22%20y%3D%2216%22%20width%3D%2216%22%20height%3D%223%22%20rx%3D%221.5%22%20fill%3D%22%23a7f3d0%22/%3E%20%3C/g%3E%20%3C%21--%20Giardia%20Lamblia%20Trophozoite%20--%3E%20%3Cg%20transform%3D%22translate%28155%2C60%29%22%3E%20%3Cpath%20d%3D%22M%2012%2C0%20C%2022%2C0%2024%2C14%2012%2C28%20C%200%2C14%202%2C0%2012%2C0%20Z%22%20fill%3D%22%23047857%22%20stroke%3D%22%236ee7b7%22%20stroke-width%3D%221.5%22/%3E%20%3C%21--%202%20eyes%20/%20nuclei%20--%3E%20%3Ccircle%20cx%3D%228%22%20cy%3D%2210%22%20r%3D%222.5%22%20fill%3D%22%23ecfdf5%22/%3E%3Ccircle%20cx%3D%228%22%20cy%3D%2210%22%20r%3D%221%22%20fill%3D%22%23064e3b%22/%3E%20%3Ccircle%20cx%3D%2216%22%20cy%3D%2210%22%20r%3D%222.5%22%20fill%3D%22%23ecfdf5%22/%3E%3Ccircle%20cx%3D%2216%22%20cy%3D%2210%22%20r%3D%221%22%20fill%3D%22%23064e3b%22/%3E%20%3Cpath%20d%3D%22M%2012%2C28%20L%2012%2C34%20M%208%2C24%20L%202%2C30%20M%2016%2C24%20L%2022%2C30%22%20stroke%3D%22%236ee7b7%22%20stroke-width%3D%221.2%22/%3E%20%3C/g%3E%20%3Ctext%20x%3D%22140%22%20y%3D%22148%22%20text-anchor%3D%22middle%22%20fill%3D%22%23a7f3d0%22%20font-size%3D%229%22%20font-family%3D%22sans-serif%22%3EE.%20Histolytica%20%284-Nuclei%20Cyst%29%20%26amp%3B%20Giardia%20Trophozoite%3C/text%3E%20%3C/svg%3E",
    titleAr: "إنفوجرام طفيليات وبويضات البراز (Stool Parasitology & Microscopy Infogram)",
    titleEn: "Stool Parasites, Cysts, and Occult Blood Infogram",
    pathologySummaryAr: "مخطط مجهري لطفيليات الجهاز الهضمي: أكياس وأطوار الأميبا النشطة (Entamoeba histolytica)، طفيل الجيارديا (Giardia lamblia)، بويضات الإسكارس والدبوسية مع دلالات الدم الخفي في البراز (FOBT).",
    pathologySummaryEn: "Microscopic diagnostic reference for intestinal protozoa: Entamoeba histolytica cysts/trophozoites, Giardia lamblia trophozoites/cysts, helminth ova, and Fecal Occult Blood significance.",
    keyDiagnosticPoints: [
      "Entamoeba histolytica: Cyst with 1-4 nuclei and central endosome; trophozoite with ingested RBCs",
      "Giardia lamblia: Symmetrical tear-drop shaped trophozoite with two nuclei (face-like) and flagella",
      "Ascaris lumbricoides: Corticated thick-shelled mamillated ova",
      "Enterobius vermicularis (Pinworm): D-shaped asymmetric ova",
      "Fecal Occult Blood Test (FOBT): Positive indicates mucosal ulceration, polyps, or colorectal neoplasia",
      "Helicobacter pylori Stool Antigen: Sensitive non-invasive marker of active gastric infection"
    ],
    associatedConditions: ["Amebic Dysentery & colitis", "Giardiasis / Malabsorption syndrome", "Helminthic intestinal infestation", "GI Bleeding"],
    differentialDiagnosis: "Infectious diarrhea (bacterial vs parasitic) vs Inflammatory Bowel Disease (IBD)."
  },
  {
    id: "inf-cardiac",
    code: "INF_CARDIAC",
    category: "cardiac",
    imageUrl: "data:image/svg+xml;utf8,%3Csvg%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%20viewBox%3D%220%200%20280%20160%22%20width%3D%22100%25%22%20height%3D%22100%25%22%3E%20%3Crect%20width%3D%22280%22%20height%3D%22160%22%20rx%3D%2212%22%20fill%3D%22%23090d16%22/%3E%20%3Ctext%20x%3D%22140%22%20y%3D%2224%22%20text-anchor%3D%22middle%22%20fill%3D%22%23ef4444%22%20font-size%3D%2210%22%20font-weight%3D%22bold%22%20font-family%3D%22sans-serif%22%3ECARDIAC%20BIOMARKERS%20KINETIC%20CURVE%3C/text%3E%20%3C%21--%20Timeline%20Graph%20--%3E%20%3Cg%20transform%3D%22translate%2845%2C35%29%22%3E%20%3Cline%20x1%3D%220%22%20y1%3D%2280%22%20x2%3D%22200%22%20y2%3D%2280%22%20stroke%3D%22%23475569%22%20stroke-width%3D%221.5%22/%3E%20%3Cline%20x1%3D%220%22%20y1%3D%220%22%20x2%3D%220%22%20y2%3D%2280%22%20stroke%3D%22%23475569%22%20stroke-width%3D%221.5%22/%3E%20%3C%21--%20Troponin%20I%20curve%20%28red%29%20--%3E%20%3Cpath%20d%3D%22M%200%2C80%20Q%2025%2C10%2060%2C35%20Q%20120%2C60%20190%2C78%22%20fill%3D%22none%22%20stroke%3D%22%23ef4444%22%20stroke-width%3D%223%22/%3E%20%3Ctext%20x%3D%2270%22%20y%3D%2230%22%20fill%3D%22%23f87171%22%20font-size%3D%228%22%20font-weight%3D%22bold%22%3ETroponin%20I%20%28Days%201-7%29%3C/text%3E%20%3C%21--%20CK-MB%20curve%20%28amber%29%20--%3E%20%3Cpath%20d%3D%22M%200%2C80%20Q%2020%2C20%2040%2C40%20Q%2080%2C75%20120%2C80%22%20fill%3D%22none%22%20stroke%3D%22%23f59e0b%22%20stroke-width%3D%222%22%20stroke-dasharray%3D%223%2C2%22/%3E%20%3Ctext%20x%3D%2245%22%20y%3D%2255%22%20fill%3D%22%23fbbf24%22%20font-size%3D%228%22%20font-weight%3D%22bold%22%3ECK-MB%20%28Hours%204-48%29%3C/text%3E%20%3C/g%3E%20%3Ctext%20x%3D%22140%22%20y%3D%22148%22%20text-anchor%3D%22middle%22%20fill%3D%22%23fca5a5%22%20font-size%3D%229%22%20font-family%3D%22sans-serif%22%3EAcute%20Myocardial%20Infarction%20%28AMI%29%20Biomarker%20Rise%3C/text%3E%20%3C/svg%3E",
    titleAr: "إنفوجرام دلالات جلطة القلب ونخر عضلة القلب (Cardiac Biomarkers Infogram)",
    titleEn: "Myocardial Infarction Biomarker Kinetic Curves Infogram",
    pathologySummaryAr: "مخطط زمني حركي دقيق لتصاعد وهبوط دلالات النخر القلبي بعد الاحتشاء القلبي: تروبونين عالي الحساسية (hs-Troponin I)، كرياتين كيناز النطاق القلبي (CK-MB)، والميوجلوبين.",
    pathologySummaryEn: "Kinetic timeline curves illustrating cardiac biomarker release following acute myocardial infarction: onset, peak, and normalization timeline of Troponin I vs CK-MB vs Myoglobin.",
    keyDiagnosticPoints: [
      "Troponin I / T: Gold standard marker. Rises at 3-4 hours, peaks at 12-24 hours, remains elevated 7-14 days",
      "High-Sensitivity Troponin (hs-cTnI): Detects myocardial injury within 1-2 hours of symptom onset",
      "CK-MB: Rises at 4-6 hours, peaks at 18-24 hours, normalizes within 48-72 hours (useful for re-infarction)",
      "BNP / NT-proBNP: Ventricular stretch biomarker for diagnosing and staging Congestive Heart Failure",
      "LDH: Late cardiac marker, peaks at 48-72 hours, persists up to 10 days"
    ],
    associatedConditions: ["Acute Myocardial Infarction (STEMI & NSTEMI)", "Acute Coronary Syndrome (ACS)", "Congestive Heart Failure (CHF)", "Myocarditis"],
    differentialDiagnosis: "ACS vs Non-ischemic troponin elevation (PE, sepsis, renal failure, severe myocarditis)."
  },
  {
    id: "inf-coag",
    code: "INF_COAG",
    category: "coagulation",
    imageUrl: "data:image/svg+xml;utf8,%3Csvg%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%20viewBox%3D%220%200%20280%20160%22%20width%3D%22100%25%22%20height%3D%22100%25%22%3E%20%3Crect%20width%3D%22280%22%20height%3D%22160%22%20rx%3D%2212%22%20fill%3D%22%23090d16%22/%3E%20%3Ctext%20x%3D%22140%22%20y%3D%2224%22%20text-anchor%3D%22middle%22%20fill%3D%22%2338bdf8%22%20font-size%3D%2210%22%20font-weight%3D%22bold%22%20font-family%3D%22sans-serif%22%3ECOAGULATION%20CASCADE%20CASCADE%20PATHWAY%3C/text%3E%20%3Cg%20transform%3D%22translate%2835%2C40%29%22%20font-size%3D%228%22%20font-family%3D%22sans-serif%22%20font-weight%3D%22bold%22%20text-anchor%3D%22middle%22%3E%20%3C%21--%20Extrinsic%20--%3E%20%3Crect%20x%3D%220%22%20y%3D%220%22%20width%3D%2265%22%20height%3D%2222%22%20rx%3D%224%22%20fill%3D%22%231e3a8a%22/%3E%20%3Ctext%20x%3D%2232%22%20y%3D%2214%22%20fill%3D%22%2393c5fd%22%3EPT%20/%20INR%20%28Extrinsic%29%3C/text%3E%20%3C%21--%20Intrinsic%20--%3E%20%3Crect%20x%3D%22145%22%20y%3D%220%22%20width%3D%2265%22%20height%3D%2222%22%20rx%3D%224%22%20fill%3D%22%23581c87%22/%3E%20%3Ctext%20x%3D%22177%22%20y%3D%2214%22%20fill%3D%22%23d8b4fe%22%3EPTT%20%28Intrinsic%29%3C/text%3E%20%3C%21--%20Common%20--%3E%20%3Cpath%20d%3D%22M%2032%2C25%20L%20105%2C45%20M%20177%2C25%20L%20105%2C45%22%20stroke%3D%22%2364748b%22%20stroke-width%3D%221.5%22/%3E%20%3Crect%20x%3D%2265%22%20y%3D%2245%22%20width%3D%2280%22%20height%3D%2224%22%20rx%3D%224%22%20fill%3D%22%23881337%22/%3E%20%3Ctext%20x%3D%22105%22%20y%3D%2260%22%20fill%3D%22%23fecdd3%22%3EFactor%20Xa%20%26amp%3B%20Thrombin%3C/text%3E%20%3Cpath%20d%3D%22M%20105%2C70%20L%20105%2C82%22%20stroke%3D%22%23e11d48%22%20stroke-width%3D%222%22/%3E%20%3Crect%20x%3D%2260%22%20y%3D%2282%22%20width%3D%2290%22%20height%3D%2220%22%20rx%3D%224%22%20fill%3D%22%23dc2626%22/%3E%20%3Ctext%20x%3D%22105%22%20y%3D%2296%22%20fill%3D%22%23ffffff%22%3EFIBRIN%20CLOT%20FORMATION%3C/text%3E%20%3C/g%3E%20%3C/svg%3E",
    titleAr: "إنفوجرام شلال التجلط والمسار الداخلي والخارجي (Coagulation Cascade Infogram)",
    titleEn: "Coagulation Cascade: Extrinsic (PT) vs Intrinsic (PTT) Infogram",
    pathologySummaryAr: "مخطط تفصيلي لشلال التجلط يوضح المسار الخارجي المقاس بواسطة PT/INR (العامل السابع 7)، والمسار الداخلي المقاس بواسطة PTT (العوامل 12, 11, 9, 8) والمسار المشترك (العوامل 10, 5, 2, 1).",
    pathologySummaryEn: "Comprehensive coagulation cascade diagram mapping the Extrinsic Pathway monitored by PT/INR, Intrinsic Pathway monitored by PTT/aPTT, and Common Pathway convergence to Fibrin clot.",
    keyDiagnosticPoints: [
      "Prothrombin Time (PT / INR): Evaluates Extrinsic & Common pathways (Factors VII, X, V, II, I)",
      "Warfarin / Marivan Therapy: Monitored via INR (Target 2.0 - 3.0 for DVT/PE/AFib; 2.5 - 3.5 for Mech Valve)",
      "Partial Thromboplastin Time (PTT / aPTT): Evaluates Intrinsic & Common pathways (Factors XII, XI, IX, VIII)",
      "Unfractionated Heparin: Monitored via PTT (Target therapeutic ratio 1.5 - 2.5x control)",
      "Isolated prolonged PTT: Hemophilia A (Factor VIII deficiency), Hemophilia B (Factor IX), Lupus Anticoagulant",
      "Prolonged PT and PTT: Vitamin K deficiency, Severe liver failure, DIC, Massive transfusion"
    ],
    associatedConditions: ["Deep Vein Thrombosis (DVT) & PE", "Hemophilia A & B", "Disseminated Intravascular Coagulation (DIC)", "Liver Disease Coagulopathy"],
    differentialDiagnosis: "Extrinsic defect vs Intrinsic defect vs Factor inhibitor vs Vitamin K antagonism."
  }
];

// Helper to find illustration by code or category
// Ensure backward compatibility fields for descriptions and criteria
DISEASE_ILLUSTRATIONS.forEach(item => {
  if (!item.descriptionAr) (item as any).descriptionAr = item.pathologySummaryAr;
  if (!item.descriptionEn) (item as any).descriptionEn = item.pathologySummaryEn;
  if (!item.diagnosticCriteria) (item as any).diagnosticCriteria = item.keyDiagnosticPoints;
});

export function getIllustrationByCode(code: string): DiseaseIllustration | undefined {
  return DISEASE_ILLUSTRATIONS.find(item => item.code.toUpperCase() === code.toUpperCase());
}

// Auto-suggest hematological illustration based on CBC parameters
export function suggestHematologicalIllustration(paramsInput: any): DiseaseIllustration {
  let params: {
    hb?: number;
    mcv?: number;
    mch?: number;
    mchc?: number;
    rdw?: number;
    wbc?: number;
    neutrophils?: number;
    bands?: number;
    lymphocytes?: number;
    platelets?: number;
    mentzerIndex?: number;
  } = {};

  if (Array.isArray(paramsInput)) {
    paramsInput.forEach((p: any) => {
      const name = (p.name || '').toLowerCase();
      const val = parseFloat(p.result);
      if (!isNaN(val)) {
        if (name.includes('hemo') || name.includes('hb') || name.includes('hgb')) params.hb = val;
        else if (name.includes('mcv')) params.mcv = val;
        else if (name.includes('mchc')) params.mchc = val;
        else if (name.includes('mch')) params.mch = val;
        else if (name.includes('rdw')) params.rdw = val;
        else if (name.includes('wbc') || name.includes('leucocyte')) params.wbc = val;
        else if (name.includes('neut')) params.neutrophils = val;
        else if (name.includes('band') || name.includes('stab')) params.bands = val;
        else if (name.includes('lymph')) params.lymphocytes = val;
        else if (name.includes('platelet') || name.includes('plt')) params.platelets = val;
        else if (name.includes('mentzer')) params.mentzerIndex = val;
      }
    });
  } else if (typeof paramsInput === 'object' && paramsInput !== null) {
    params = paramsInput;
  }

  const { hb, mcv, rdw, wbc, bands, lymphocytes, platelets, mentzerIndex } = params;

  // 1. Severe bacterial sepsis / leukemoid
  if ((wbc && wbc > 15) || (bands && bands > 6)) {
    return getIllustrationByCode("HEM_SEPSIS")!;
  }

  // 2. Severe isolated thrombocytopenia with giant platelets
  if (platelets && platelets < 50 && (!wbc || (wbc >= 4 && wbc <= 11))) {
    return getIllustrationByCode("HEM_ITP")!;
  }

  // 3. Absolute lymphocytosis / Mononucleosis or CLL
  if (wbc && wbc > 25 && lymphocytes && lymphocytes > 70) {
    return getIllustrationByCode("HEM_CLL")!;
  }
  if (lymphocytes && lymphocytes > 50 && wbc && wbc >= 11 && wbc <= 20) {
    return getIllustrationByCode("HEM_MONO")!;
  }

  // 4. Microcytic anemia
  if ((mcv && mcv < 80) || (hb && hb < 11)) {
    if (mentzerIndex && mentzerIndex < 13) {
      return getIllustrationByCode("HEM_THAL")!;
    }
    if ((rdw && rdw > 15) || (mentzerIndex && mentzerIndex >= 13)) {
      return getIllustrationByCode("HEM_IDA")!;
    }
    return getIllustrationByCode("HEM_IDA")!;
  }

  // 5. Macrocytic anemia
  if (mcv && mcv > 100) {
    return getIllustrationByCode("HEM_MEGALO")!;
  }

  // Default normal
  return getIllustrationByCode("HEM_NORMAL")!;
}
