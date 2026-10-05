import React from 'react';
import { ResultFlag } from '../types/lab';
import { AlertCircle, AlertTriangle, Check } from 'lucide-react';

interface FlagBadgeProps {
  flag: ResultFlag;
}

export const FlagBadge: React.FC<FlagBadgeProps> = ({ flag }) => {
  if (!flag || flag === 'NORMAL') {
    return (
      <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
        <Check className="w-3 h-3 text-emerald-600 stroke-[3]" />
        <span>Normal</span>
      </span>
    );
  }

  if (flag === 'HIGH') {
    return (
      <span className="inline-flex items-center gap-1 text-xs font-black text-rose-800 bg-rose-50 px-2 py-0.5 rounded border border-rose-300 shadow-xs">
        <span className="w-1.5 h-1.5 rounded-full bg-rose-600"></span>
        <span>High [ H ]</span>
      </span>
    );
  }

  if (flag === 'LOW') {
    return (
      <span className="inline-flex items-center gap-1 text-xs font-black text-amber-800 bg-amber-50 px-2 py-0.5 rounded border border-amber-300 shadow-xs">
        <span className="w-1.5 h-1.5 rounded-full bg-amber-600"></span>
        <span>Low [ L ]</span>
      </span>
    );
  }

  if (flag === 'PANIC_HIGH' || flag === 'PANIC_LOW') {
    return (
      <span className="inline-flex items-center gap-1 text-xs font-black text-white bg-red-700 px-2 py-0.5 rounded shadow-sm animate-pulse border border-red-900">
        <AlertTriangle className="w-3.5 h-3.5 text-yellow-300" />
        <span>CRITICAL [ ! ]</span>
      </span>
    );
  }

  if (flag === 'ABNORMAL') {
    return (
      <span className="inline-flex items-center gap-1 text-xs font-bold text-rose-900 bg-rose-100 px-2 py-0.5 rounded border border-rose-300">
        <AlertCircle className="w-3.5 h-3.5 text-rose-700" />
        <span>Abnormal</span>
      </span>
    );
  }

  return <span className="text-slate-300 text-xs">—</span>;
};
