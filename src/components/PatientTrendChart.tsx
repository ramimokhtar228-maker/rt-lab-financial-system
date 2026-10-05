import React, { useState, useMemo } from 'react';
import { LabReport } from '../types/lab';
import { TrendingUp, Calendar, User, ArrowUpRight, ArrowDownRight, Minus, Activity, CheckCircle2 } from 'lucide-react';

interface PatientTrendChartProps {
  reports: LabReport[];
  initialPatientId?: string;
}

export const PatientTrendChart: React.FC<PatientTrendChartProps> = ({
  reports,
  initialPatientId
}) => {
  // Extract unique patients list
  const uniquePatients = useMemo(() => {
    const map = new Map<string, { id: string; name: string; labNumber: string; phone: string }>();
    reports.forEach(r => {
      if (!r || !r.patient || !r.patient.id) return;
      if (!map.has(r.patient.id)) {
        map.set(r.patient.id, {
          id: r.patient.id,
          name: r.patient.fullName || 'مريض غير مسمى',
          labNumber: r.patient.labNumber || '',
          phone: r.patient.phone || ''
        });
      }
    });
    return Array.from(map.values());
  }, [reports]);

  const [selectedPatientId, setSelectedPatientId] = useState<string>(
    initialPatientId || uniquePatients[0]?.id || ''
  );

  // All visits for selected patient, sorted chronologically ascending
  const patientVisits = useMemo(() => {
    return reports
      .filter(r => r && r.patient && r.patient.id === selectedPatientId)
      .sort((a, b) => new Date(a.patient?.sampleDate || 0).getTime() - new Date(b.patient?.sampleDate || 0).getTime());
  }, [reports, selectedPatientId]);

  // Extract all unique test parameter names for this patient
  const availableParameters = useMemo(() => {
    const paramSet = new Set<string>();
    patientVisits.forEach(v => {
      v.profiles.forEach(prof => {
        prof.parameters.forEach(p => {
          // Only include quantitative parameters with numerical results
          const val = parseFloat(p.result);
          if (!isNaN(val)) {
            paramSet.add(p.name);
          }
        });
      });
    });
    return Array.from(paramSet);
  }, [patientVisits]);

  const [selectedParameterName, setSelectedParameterName] = useState<string>('');

  // Default select first parameter when list changes
  React.useEffect(() => {
    if (availableParameters.length > 0 && (!selectedParameterName || !availableParameters.includes(selectedParameterName))) {
      // Prefer HbA1c, Hemoglobin or first parameter
      const preferred = availableParameters.find(p => p.includes('HbA1c') || p.includes('Hemoglobin') || p.includes('Creatinine')) || availableParameters[0];
      setSelectedParameterName(preferred);
    }
  }, [availableParameters, selectedParameterName]);

  // Extract chronological data series for the selected parameter
  const dataSeries = useMemo(() => {
    if (!selectedParameterName) return [];

    const points: {
      date: string;
      formattedDate: string;
      value: number;
      unit: string;
      minNormal?: number;
      maxNormal?: number;
      reportNumber: string;
      flag: string;
      doctor: string;
    }[] = [];

    patientVisits.forEach(v => {
      v.profiles.forEach(prof => {
        const found = prof.parameters.find(p => p.name === selectedParameterName);
        if (found) {
          const val = parseFloat(found.result);
          if (!isNaN(val)) {
            points.push({
              date: v.patient.sampleDate,
              formattedDate: new Date(v.patient.sampleDate).toLocaleDateString('ar-EG', {
                year: 'numeric',
                month: 'short',
                day: 'numeric'
              }),
              value: val,
              unit: found.unit,
              minNormal: found.minNormal,
              maxNormal: found.maxNormal,
              reportNumber: v.reportNumber,
              flag: found.flag,
              doctor: `${v.patient.referringDoctorTitle} ${v.patient.referringDoctorName}`.trim()
            });
          }
        }
      });
    });

    return points;
  }, [patientVisits, selectedParameterName]);

  const selectedPatient = uniquePatients.find(p => p.id === selectedPatientId);

  // SVG Chart Geometry Calculations
  const chartGeometry = useMemo(() => {
    if (dataSeries.length === 0) return null;

    const values = dataSeries.map(d => d.value);
    const minNormal = dataSeries[0]?.minNormal ?? Math.min(...values);
    const maxNormal = dataSeries[0]?.maxNormal ?? Math.max(...values);

    const minBound = Math.min(...values, minNormal !== undefined ? minNormal * 0.85 : Infinity);
    const maxBound = Math.max(...values, maxNormal !== undefined ? maxNormal * 1.15 : -Infinity);
    const range = maxBound - minBound || 1;

    const width = 700;
    const height = 280;
    const padding = { top: 30, right: 40, bottom: 40, left: 60 };

    const innerWidth = width - padding.left - padding.right;
    const innerHeight = height - padding.top - padding.bottom;

    const getY = (val: number) => {
      return padding.top + innerHeight - ((val - minBound) / range) * innerHeight;
    };

    const getX = (index: number) => {
      if (dataSeries.length === 1) return padding.left + innerWidth / 2;
      return padding.left + (index / (dataSeries.length - 1)) * innerWidth;
    };

    const points = dataSeries.map((d, i) => ({
      x: getX(i),
      y: getY(d.value),
      ...d
    }));

    // SVG path string
    const pathD = points.reduce((acc, pt, i) => {
      return i === 0 ? `M ${pt.x} ${pt.y}` : `${acc} L ${pt.x} ${pt.y}`;
    }, '');

    // Normal zone coordinates
    let normalZoneYTop = padding.top;
    let normalZoneYBottom = padding.top + innerHeight;
    if (maxNormal !== undefined) normalZoneYTop = Math.max(padding.top, getY(maxNormal));
    if (minNormal !== undefined) normalZoneYBottom = Math.min(padding.top + innerHeight, getY(minNormal));

    return {
      width,
      height,
      padding,
      points,
      pathD,
      minNormal,
      maxNormal,
      normalZoneYTop,
      normalZoneHeight: Math.max(0, normalZoneYBottom - normalZoneYTop),
      minBound,
      maxBound
    };
  }, [dataSeries]);

  // Delta calculation between latest and earliest point
  const deltaSummary = useMemo(() => {
    if (dataSeries.length < 2) return null;
    const first = dataSeries[0].value;
    const last = dataSeries[dataSeries.length - 1].value;
    const diff = last - first;
    const pct = ((diff / first) * 100).toFixed(1);
    return { diff: diff.toFixed(2), pct, isIncreased: diff > 0 };
  }, [dataSeries]);

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-6">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-red-900 to-rose-700 text-white flex items-center justify-center shadow-md shadow-red-950/20">
            <TrendingUp className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900">
              التطورات البيانية للتحاليل (Patient Longitudinal Trend Charts)
            </h2>
            <p className="text-xs text-slate-500">
              متابعة المنحنى الزمني وتطور قيم الفحوصات الطبية للمريض عبر مختلف الزيارات
            </p>
          </div>
        </div>

        {/* Patient Selection Dropdown */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-slate-600 whitespace-nowrap">المريض:</span>
          <select
            value={selectedPatientId}
            onChange={(e) => setSelectedPatientId(e.target.value)}
            className="text-xs font-bold bg-slate-50 border border-slate-300 rounded-lg p-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-600"
          >
            {uniquePatients.map(pt => (
              <option key={pt.id} value={pt.id}>
                {pt.name} ({pt.labNumber})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Parameter selector pills */}
      <div className="space-y-2">
        <span className="text-xs font-bold text-slate-700">اختر الفحص الطبي لعرض مساره الزمني:</span>
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          {availableParameters.length === 0 ? (
            <span className="text-xs text-slate-400">لا توجد نتائج رقمية مسجلة لهذا المريض بعد.</span>
          ) : (
            availableParameters.map(paramName => (
              <button
                key={paramName}
                onClick={() => setSelectedParameterName(paramName)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all ${
                  selectedParameterName === paramName
                    ? 'bg-rose-900 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                {paramName}
              </button>
            ))
          )}
        </div>
      </div>

      {/* Main Chart Graphic & Highlights */}
      {chartGeometry && dataSeries.length > 0 ? (
        <div className="space-y-4">
          {/* Key Metrics Header */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs">
            <div>
              <span className="text-slate-500 block">الفحص المحدد:</span>
              <strong className="text-sm font-bold text-slate-900">{selectedParameterName}</strong>
            </div>

            <div>
              <span className="text-slate-500 block">آخر نتيجة مسجلة:</span>
              <span className="text-sm font-black font-mono-numbers text-rose-950">
                {dataSeries[dataSeries.length - 1].value} {dataSeries[dataSeries.length - 1].unit}
              </span>
            </div>

            <div>
              <span className="text-slate-500 block">المعدل الطبيعي:</span>
              <span className="text-xs font-semibold font-mono-numbers text-emerald-800">
                {chartGeometry.minNormal !== undefined && chartGeometry.maxNormal !== undefined
                  ? `${chartGeometry.minNormal} - ${chartGeometry.maxNormal} ${dataSeries[0].unit}`
                  : '—'}
              </span>
            </div>

            <div>
              <span className="text-slate-500 block">التغير الإجمالي (Delta):</span>
              {deltaSummary ? (
                <div className="flex items-center gap-1 font-bold font-mono-numbers">
                  {deltaSummary.isIncreased ? (
                    <span className="text-rose-700 flex items-center">
                      <ArrowUpRight className="w-3.5 h-3.5" />
                      +{deltaSummary.diff} ({deltaSummary.pct}%)
                    </span>
                  ) : (
                    <span className="text-emerald-700 flex items-center">
                      <ArrowDownRight className="w-3.5 h-3.5" />
                      {deltaSummary.diff} ({deltaSummary.pct}%)
                    </span>
                  )}
                  <span className="text-[10px] text-slate-400">عبر {dataSeries.length} زيارات</span>
                </div>
              ) : (
                <span className="text-slate-400">زيارة واحدة مسجلة</span>
              )}
            </div>
          </div>

          {/* SVG Trend Graph */}
          <div className="w-full overflow-x-auto bg-white border border-slate-200 rounded-xl p-3 shadow-inner" dir="ltr">
            <svg
              viewBox={`0 0 ${chartGeometry.width} ${chartGeometry.height}`}
              className="w-full h-auto min-w-[600px] max-h-[320px]"
            >
              {/* Grid Lines */}
              <line
                x1={chartGeometry.padding.left}
                y1={chartGeometry.padding.top}
                x2={chartGeometry.width - chartGeometry.padding.right}
                y2={chartGeometry.padding.top}
                stroke="#e2e8f0"
                strokeDasharray="4 4"
              />
              <line
                x1={chartGeometry.padding.left}
                y1={chartGeometry.height - chartGeometry.padding.bottom}
                x2={chartGeometry.width - chartGeometry.padding.right}
                y2={chartGeometry.height - chartGeometry.padding.bottom}
                stroke="#cbd5e1"
              />

              {/* Shaded Green Normal Zone */}
              {chartGeometry.normalZoneHeight > 0 && (
                <g>
                  <rect
                    x={chartGeometry.padding.left}
                    y={chartGeometry.normalZoneYTop}
                    width={chartGeometry.width - chartGeometry.padding.left - chartGeometry.padding.right}
                    height={chartGeometry.normalZoneHeight}
                    fill="#ecfdf5"
                    opacity="0.8"
                  />
                  <text
                    x={chartGeometry.width - chartGeometry.padding.right - 8}
                    y={chartGeometry.normalZoneYTop + 14}
                    textAnchor="end"
                    fill="#059669"
                    fontSize="10"
                    fontWeight="bold"
                  >
                    Target Normal Range ({chartGeometry.minNormal} - {chartGeometry.maxNormal})
                  </text>
                </g>
              )}

              {/* Trend Path */}
              {dataSeries.length > 1 && (
                <path
                  d={chartGeometry.pathD}
                  fill="none"
                  stroke="#8B0000"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              )}

              {/* Data Points */}
              {chartGeometry.points.map((pt, idx) => (
                <g key={idx}>
                  {/* Point Outer Ring */}
                  <circle
                    cx={pt.x}
                    cy={pt.y}
                    r="6"
                    fill="#ffffff"
                    stroke="#8B0000"
                    strokeWidth="3"
                  />

                  {/* Value Callout on top of point */}
                  <rect
                    x={pt.x - 22}
                    y={pt.y - 25}
                    width="44"
                    height="18"
                    rx="4"
                    fill="#0f172a"
                    opacity="0.9"
                  />
                  <text
                    x={pt.x}
                    y={pt.y - 12}
                    textAnchor="middle"
                    fill="#ffffff"
                    fontSize="10"
                    fontWeight="bold"
                    fontFamily="monospace"
                  >
                    {pt.value}
                  </text>

                  {/* Date label at bottom */}
                  <text
                    x={pt.x}
                    y={chartGeometry.height - chartGeometry.padding.bottom + 18}
                    textAnchor="middle"
                    fill="#64748b"
                    fontSize="9.5"
                    fontWeight="600"
                  >
                    {new Date(pt.date).toLocaleDateString('en-GB')}
                  </text>
                </g>
              ))}
            </svg>
          </div>

          {/* Historical Data Table */}
          <div className="overflow-x-auto border border-slate-200 rounded-xl">
            <table className="w-full text-right text-xs" dir="rtl">
              <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                <tr>
                  <th className="py-2.5 px-4 text-right">تاريخ الزيارة</th>
                  <th className="py-2.5 px-4 text-center">رقم التقرير</th>
                  <th className="py-2.5 px-4 text-center">النتيجة</th>
                  <th className="py-2.5 px-4 text-center">الحالة</th>
                  <th className="py-2.5 px-4 text-right">الطبيب المعالج</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {dataSeries.map((d, idx) => (
                  <tr key={idx} className="hover:bg-slate-50 transition-colors">
                    <td className="py-2.5 px-4 font-semibold text-slate-800">
                      {d.formattedDate}
                    </td>
                    <td className="py-2.5 px-4 text-center font-mono-numbers text-slate-600">
                      {d.reportNumber}
                    </td>
                    <td className="py-2.5 px-4 text-center font-mono-numbers font-black text-rose-950 text-sm">
                      {d.value} <span className="text-xs text-slate-500 font-normal">{d.unit}</span>
                    </td>
                    <td className="py-2.5 px-4 text-center">
                      <span className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                        d.flag === 'HIGH' ? 'bg-rose-100 text-rose-800' :
                        d.flag === 'LOW' ? 'bg-amber-100 text-amber-800' :
                        'bg-emerald-100 text-emerald-800'
                      }`}>
                        {d.flag || 'NORMAL'}
                      </span>
                    </td>
                    <td className="py-2.5 px-4 text-slate-600">
                      {d.doctor || '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="py-12 text-center text-slate-400">
          <Activity className="w-12 h-12 mx-auto text-slate-300 mb-2" />
          <p className="text-sm font-semibold">لا توجد بيانات كافية لعرض التطور البياني لهذا الفحص</p>
          <p className="text-xs text-slate-400">سجل أكثر من زيارة لنفس المريض لعرض المنحنى الزمني والمقارنات السريرية</p>
        </div>
      )}
    </div>
  );
};
