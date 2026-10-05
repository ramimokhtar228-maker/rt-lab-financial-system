import React from 'react';
import { getChartPointerPosition } from '../utils/calculator';
import { ResultFlag } from '../types/lab';

interface ColouredRangeChartProps {
  resultStr: string;
  minNormal?: number;
  maxNormal?: number;
  flag: ResultFlag;
  textReference?: string;
}

export const ColouredRangeChart: React.FC<ColouredRangeChartProps> = ({
  resultStr,
  minNormal,
  maxNormal,
  flag,
  textReference
}) => {
  // If qualitative or without quantitative min/max
  if (minNormal === undefined || maxNormal === undefined) {
    if (flag === 'NORMAL') {
      return (
        <div className="flex items-center justify-center">
          <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
            Within Target Range
          </span>
        </div>
      );
    }
    if (flag === 'ABNORMAL' || flag === 'HIGH') {
      return (
        <div className="flex items-center justify-center">
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-rose-800 bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-600 animate-pulse"></span>
            Abnormal Reactivity
          </span>
        </div>
      );
    }
    return <span className="text-slate-300 text-center block text-xs">—</span>;
  }

  const { positionPercent, zone } = getChartPointerPosition(resultStr, minNormal, maxNormal);

  // Determine pointer color
  let pointerColor = '#10b981'; // emerald
  let pointerBorder = '#065f46';
  if (zone === 'low') {
    pointerColor = '#f59e0b'; // amber
    pointerBorder = '#92400e';
  } else if (zone === 'high') {
    pointerColor = '#e11d48'; // rose
    pointerBorder = '#881337';
  }

  return (
    <div className="w-full max-w-[140px] mx-auto py-1 px-1" dir="ltr">
      {/* Visual Tri-band range bar */}
      <div className="relative h-2 w-full rounded-full bg-slate-200 flex overflow-hidden border border-slate-300/80 shadow-inner">
        {/* Low segment (25%) */}
        <div className="w-1/4 h-full bg-amber-200" title={`Low (< ${minNormal})`}></div>
        {/* Normal segment (50%) */}
        <div className="w-2/4 h-full bg-emerald-300" title={`Normal (${minNormal} - ${maxNormal})`}></div>
        {/* High segment (25%) */}
        <div className="w-1/4 h-full bg-rose-300" title={`High (> ${maxNormal})`}></div>
      </div>

      {/* Pointer & Ticks indicator */}
      <div className="relative h-3 w-full -mt-2.5">
        <div
          className="absolute -translate-x-1/2 flex flex-col items-center transition-all duration-300 pointer-events-none"
          style={{ left: `${positionPercent}%` }}
        >
          {/* Indicator pin */}
          <div
            className="w-3 h-3 rounded-full border-2 shadow-sm"
            style={{
              backgroundColor: pointerColor,
              borderColor: pointerBorder
            }}
          />
        </div>
      </div>

      {/* Ticks subtext */}
      <div className="flex justify-between text-[8px] font-mono-numbers text-slate-600 px-0.5 -mt-0.5 leading-none">
        <span>L</span>
        <span className="text-emerald-700 font-bold">NORMAL</span>
        <span>H</span>
      </div>
    </div>
  );
};
