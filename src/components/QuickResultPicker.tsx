import React, { useState } from 'react';
import { CLINICAL_PREFILL_OPTIONS } from '../utils/calculator';
import { ChevronDown, Sparkles } from 'lucide-react';

interface QuickResultPickerProps {
  paramName: string;
  currentValue: string;
  onSelect: (val: string) => void;
}

export const QuickResultPicker: React.FC<QuickResultPickerProps> = ({
  paramName,
  currentValue,
  onSelect
}) => {
  const [isOpen, setIsOpen] = useState(false);

  // Determine relevant options based on parameter name
  const nameLower = paramName.toLowerCase();

  let options: string[] = [];

  if (nameLower.includes('color') || nameLower.includes('لون')) {
    options = nameLower.includes('stool') ? CLINICAL_PREFILL_OPTIONS.stoolColor : CLINICAL_PREFILL_OPTIONS.urineColor;
  } else if (nameLower.includes('aspect') || nameLower.includes('transparency') || nameLower.includes('appearance') || nameLower.includes('مظهر')) {
    options = CLINICAL_PREFILL_OPTIONS.urineAppearance;
  } else if (nameLower.includes('sp. gr') || nameLower.includes('specific gravity')) {
    options = CLINICAL_PREFILL_OPTIONS.urineSpGr;
  } else if (nameLower.includes('reaction') || nameLower.includes('ph')) {
    options = CLINICAL_PREFILL_OPTIONS.urinePH;
  } else if (nameLower.includes('consistency') || nameLower.includes('قوام')) {
    options = CLINICAL_PREFILL_OPTIONS.stoolConsistency;
  } else if (
    nameLower.includes('protein') ||
    nameLower.includes('glucose') ||
    nameLower.includes('ketone') ||
    nameLower.includes('bilirubin') ||
    nameLower.includes('blood') ||
    nameLower.includes('mucus')
  ) {
    options = CLINICAL_PREFILL_OPTIONS.qualitativeGrade;
  } else if (nameLower.includes('pus') || nameLower.includes('wbc') || nameLower.includes('صديد')) {
    options = CLINICAL_PREFILL_OPTIONS.pusCellsRanges;
  } else if (nameLower.includes('rbc') || nameLower.includes('red blood cell') || nameLower.includes('دم')) {
    options = CLINICAL_PREFILL_OPTIONS.rbcRanges;
  } else if (nameLower.includes('crystal') || nameLower.includes('بلورات')) {
    options = CLINICAL_PREFILL_OPTIONS.urineCrystals;
  } else if (nameLower.includes('cast') || nameLower.includes('اسطوانات')) {
    options = CLINICAL_PREFILL_OPTIONS.urineCasts;
  } else if (nameLower.includes('parasite') || nameLower.includes('protozoa') || nameLower.includes('طفيليات')) {
    options = CLINICAL_PREFILL_OPTIONS.stoolParasites;
  } else if (nameLower.includes('organism') || nameLower.includes('pathogen') || nameLower.includes('ميكروب')) {
    options = CLINICAL_PREFILL_OPTIONS.cultureOrganisms;
  } else if (nameLower.includes('colony count')) {
    options = CLINICAL_PREFILL_OPTIONS.cultureGrowthCounts;
  } else if (
    nameLower.includes('amoxicillin') ||
    nameLower.includes('ceftriaxone') ||
    nameLower.includes('meropenem') ||
    nameLower.includes('cipro') ||
    nameLower.includes('amikacin') ||
    nameLower.includes('vancomycin') ||
    nameLower.includes('sensitivity') ||
    nameLower.includes('antibiotic')
  ) {
    options = CLINICAL_PREFILL_OPTIONS.antibioticSensitivity;
  } else if (
    nameLower.includes('epithelial') ||
    nameLower.includes('bacteria') ||
    nameLower.includes('yeast') ||
    nameLower.includes('trichomonas') ||
    nameLower.includes('fibre') ||
    nameLower.includes('starch')
  ) {
    options = CLINICAL_PREFILL_OPTIONS.microscopicQuantities;
  } else {
    // General quick options
    options = [
      'Negative',
      'Positive',
      'Non-Reactive',
      'Reactive',
      'Nil',
      'Trace',
      '+',
      '++',
      '+++',
      'Normal'
    ];
  }

  return (
    <div className="relative inline-block text-left">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="p-1.5 text-slate-400 hover:text-rose-900 hover:bg-rose-50 rounded-md border border-slate-200 transition-colors"
        title="اختيار قيمة سريعة معتمدة (Colors, Grades, Values)"
      >
        <Sparkles className="w-3.5 h-3.5 text-rose-700" />
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
          <div className="absolute right-0 mt-1 w-52 bg-white rounded-xl shadow-xl border border-slate-200 py-1 z-50 max-h-56 overflow-y-auto text-xs font-medium text-slate-800">
            <div className="px-3 py-1 text-[10px] font-bold text-slate-400 bg-slate-50 border-b border-slate-100">
              خيارات سريرية سريعة:
            </div>
            {options.map((opt) => (
              <button
                key={opt}
                type="button"
                onClick={() => {
                  onSelect(opt);
                  setIsOpen(false);
                }}
                className={`w-full text-right px-3 py-1.5 text-xs hover:bg-rose-50 hover:text-rose-950 transition-colors flex items-center justify-between ${
                  currentValue === opt ? 'bg-rose-50/80 font-bold text-rose-900' : ''
                }`}
              >
                <span>{opt}</span>
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
};
