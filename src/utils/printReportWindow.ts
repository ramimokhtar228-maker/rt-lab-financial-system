import { LabReport, LabInfo } from '../types';
import { formatReferenceDisplay, getChartPointerPosition } from './cbcCalculator';

export function openPrintReportWindow(report: LabReport, labInfo?: LabInfo): void {
  const p = report.patient;
  const totalPages = report.profiles.length;
  const doctorDisplay = p.referringDoctorTitle === 'Herself' || p.referringDoctorTitle === 'Himself'
    ? 'طلب فحص ذاتي (Self-Request)'
    : `${p.referringDoctorTitle} ${p.referringDoctorName}`.trim() || 'General Medical Request';

  const sampleDateFormatted = new Date(p.sampleDate).toLocaleDateString('en-GB') + ' ' + new Date(p.sampleDate).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  const reportingDateFormatted = new Date(p.reportingDate).toLocaleDateString('en-GB') + ' ' + new Date(p.reportingDate).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

  const labNameAr = labInfo?.labNameAr || "معامل RT للتحاليل الطبية والتشخيصية";
  const labNameEn = labInfo?.labNameEn || "RT Diagnostic Laboratories";
  const address = labInfo?.mainAddress || "ميدان بهتيم برج صيدلية العزبي الدور الثالث امام الأسانسير شبرا الخيمة";
  const phone = labInfo?.phone || "0244667788";
  const hotline = labInfo?.hotline || "01012345678";
  const supervisionAr = labInfo?.supervisionAr || "أطباء واستشاريو كلية طب قصر العيني - جامعة القاهرة";
  const accreditation = labInfo?.accreditation || "ISO 15189 Certified Quality Management";

  let profilesHtml = '';

  report.profiles.forEach((profile, index) => {
    const pageNum = index + 1;
    let rowsHtml = '';

    profile.parameters.forEach((param, rIdx) => {
      const isHigh = param.flag === 'HIGH' || param.flag === 'PANIC_HIGH';
      const isLow = param.flag === 'LOW' || param.flag === 'PANIC_LOW';
      const isAbnormal = isHigh || isLow || param.flag === 'ABNORMAL';

      let rowBg = rIdx % 2 === 0 ? '#ffffff' : '#f8fafc';
      if (isAbnormal) rowBg = '#fff1f2';

      let flagBadgeHtml = '<span style="color:#059669; font-weight:bold; font-size:10px;">Normal</span>';
      if (param.flag === 'HIGH') {
        flagBadgeHtml = '<span style="background:#ffe4e6; color:#9f1239; padding:2px 6px; border-radius:4px; font-weight:800; font-size:10px; border:1px solid #fecdd3;">High [ H ]</span>';
      } else if (param.flag === 'LOW') {
        flagBadgeHtml = '<span style="background:#fef3c7; color:#92400e; padding:2px 6px; border-radius:4px; font-weight:800; font-size:10px; border:1px solid #fde68a;">Low [ L ]</span>';
      } else if (param.flag === 'PANIC_HIGH' || param.flag === 'PANIC_LOW') {
        flagBadgeHtml = '<span style="background:#b91c1c; color:#ffffff; padding:2px 6px; border-radius:4px; font-weight:bold; font-size:10px;">CRITICAL [!]</span>';
      } else if (param.flag === 'ABNORMAL') {
        flagBadgeHtml = '<span style="background:#fee2e2; color:#991b1b; padding:2px 6px; border-radius:4px; font-weight:bold; font-size:10px;">Abnormal</span>';
      }

      // Coloured Range Visual Indicator
      let chartHtml = '<span style="color:#cbd5e1;">—</span>';
      if (param.minNormal !== undefined && param.maxNormal !== undefined) {
        const { positionPercent, zone } = getChartPointerPosition(param.result, param.minNormal, param.maxNormal);
        let pointerColor = '#10b981';
        let pointerBorder = '#065f46';
        if (zone === 'low') {
          pointerColor = '#f59e0b';
          pointerBorder = '#92400e';
        } else if (zone === 'high') {
          pointerColor = '#e11d48';
          pointerBorder = '#881337';
        }

        chartHtml = `
          <div style="width:110px; margin:0 auto; text-align:center;">
            <div style="position:relative; height:6px; background:#e2e8f0; border-radius:4px; display:flex; overflow:hidden; border:1px solid #cbd5e1;">
              <div style="width:25%; background:#fde68a;"></div>
              <div style="width:50%; background:#86efac;"></div>
              <div style="width:25%; background:#fca5a5;"></div>
            </div>
            <div style="position:relative; height:8px; margin-top:-7px;">
              <div style="position:absolute; left:${positionPercent}%; transform:translateX(-50%); width:8px; height:8px; border-radius:50%; background:${pointerColor}; border:1.5px solid ${pointerBorder};"></div>
            </div>
            <div style="display:flex; justify-content:space-between; font-size:7px; color:#64748b; font-family:monospace; margin-top:-2px;">
              <span>L</span>
              <span style="color:#059669; font-weight:bold;">NOR</span>
              <span>H</span>
            </div>
          </div>
        `;
      } else if (param.flag === 'NORMAL') {
        chartHtml = '<span style="color:#059669; font-size:10px; font-weight:600;">Within Target</span>';
      }

      const resultColor = isHigh ? '#9f1239' : isLow ? '#92400e' : '#0f172a';
      const resultWeight = isAbnormal ? '800' : '700';

      rowsHtml += `
        <tr style="background:${rowBg}; border-bottom:1px solid #e2e8f0;">
          <td style="padding:5px 8px; font-weight:700; color:#0f172a; text-align:left;">
            ${param.name}
            ${param.method ? `<span style="display:block; font-size:8.5px; color:#64748b; font-family:monospace;">Method: ${param.method}</span>` : ''}
          </td>
          <td style="padding:5px 8px; text-align:center; font-family:'JetBrains Mono', monospace; font-size:12px; font-weight:${resultWeight}; color:${resultColor};">
            ${param.result || '—'} <span style="font-size:9.5px; color:#64748b; font-weight:normal;">${param.unit || ''}</span>
          </td>
          <td style="padding:4px 6px; text-align:center; vertical-align:middle;">
            ${chartHtml}
          </td>
          <td style="padding:5px 6px; text-align:center; vertical-align:middle;">
            ${flagBadgeHtml}
          </td>
          <td style="padding:5px 8px; text-align:left; font-family:'JetBrains Mono', monospace; font-size:10.5px; color:#334155;">
            ${formatReferenceDisplay(param)}
            ${param.notes ? `<span style="display:block; font-size:8.5px; color:#94a3b8; font-style:italic;">${param.notes}</span>` : ''}
          </td>
        </tr>
      `;
    });

    // Blood Film morphology section if present
    let bloodFilmHtml = '';
    if (profile.bloodFilmFindings) {
      const b = profile.bloodFilmFindings;
      bloodFilmHtml = `
        <div style="background:#f8fafc; border:1.5px solid #cbd5e1; border-radius:6px; padding:8px 12px; margin-bottom:10px; font-size:10.5px; line-height:1.4;">
          <div style="font-weight:800; color:#800000; margin-bottom:4px; font-size:11px; border-bottom:1px solid #e2e8f0; padding-bottom:3px;">
            🔬 PERIPHERAL BLOOD FILM MORPHOLOGICAL EXAMINATION (فحص شريحة الدم المجهري):
          </div>
          <div style="display:grid; grid-template-columns: 1fr 1fr; gap:6px 12px;">
            ${b.rbcMorphology ? `<div><strong style="color:#0f172a;">RBC Morphology:</strong> <span style="color:#334155;">${b.rbcMorphology}</span></div>` : ''}
            ${b.wbcMorphology ? `<div><strong style="color:#0f172a;">WBC Morphology:</strong> <span style="color:#334155;">${b.wbcMorphology}</span></div>` : ''}
            ${b.plateletMorphology ? `<div><strong style="color:#0f172a;">Platelet Smear:</strong> <span style="color:#334155;">${b.plateletMorphology}</span></div>` : ''}
            ${b.reticulocytesPercent ? `<div><strong style="color:#0f172a;">Reticulocytes:</strong> <span style="color:#334155;">${b.reticulocytesPercent}</span></div>` : ''}
          </div>
          ${b.differentialSummary ? `<div style="margin-top:4px; color:#64748b; font-size:9.5px; font-family:monospace;">${b.differentialSummary}</div>` : ''}
        </div>
      `;
    }

    // Pathological Illustration / Microscopic Infogram
    let illustrationHtml = '';
    const ill = profile.attachedIllustration;
    if (ill) {
      const imgHtml = ill.imageUrl 
        ? `<img src="${ill.imageUrl}" alt="${ill.titleEn}" style="width:130px; height:80px; object-fit:cover; border-radius:6px; border:1.5px solid #800000; box-shadow:0 1px 3px rgba(0,0,0,0.15); flex-shrink:0;" />`
        : `<div style="width:64px; height:64px; border-radius:8px; background:linear-gradient(135deg, #800000, #991b1b); color:#fff; display:flex; flex-direction:column; align-items:center; justify-content:center; text-align:center; flex-shrink:0; font-size:9px; font-weight:bold; box-shadow:0 2px 4px rgba(0,0,0,0.1);"><span style="font-size:20px;">🔬</span><span>ATLAS</span></div>`;

      illustrationHtml = `
        <div style="background:#fff1f2; border:1.5px solid #fecdd3; border-radius:6px; padding:8px 12px; margin-bottom:10px; display:flex; align-items:center; gap:12px;">
          ${imgHtml}
          <div style="flex:1; font-size:10px; line-height:1.4;">
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:2px;">
              <strong style="color:#800000; font-size:11px;">${ill.titleAr} (${ill.titleEn})</strong>
              <span style="background:#ffe4e6; color:#9f1239; font-size:9px; font-weight:bold; padding:1px 6px; border-radius:4px; border:1px solid #fecdd3;">Diagnostic Atlas</span>
            </div>
            <p style="margin:0 0 4px 0; color:#334155;">${ill.pathologySummaryAr}</p>
            <div style="display:flex; flex-wrap:wrap; gap:6px; font-size:9px; color:#475569;">
              ${ill.keyDiagnosticPoints.slice(0, 3).map(pt => `<span style="background:#ffffff; border:1px solid #e2e8f0; padding:1px 6px; border-radius:3px;">• ${pt}</span>`).join('')}
            </div>
          </div>
        </div>
      `;
    }

    profilesHtml += `
      <div class="report-page" style="page-break-after: always; padding: 20px; max-width: 800px; margin: 0 auto; background: #ffffff; min-height: 1050px; display: flex; flex-direction: column; justify-content: space-between;">
        <div>
          <!-- Top Official Header -->
          <div style="display:flex; justify-content:space-between; align-items:center; border-bottom:2.5px solid #800000; padding-bottom:10px; margin-bottom:10px;">
            <!-- Arabic Side -->
            <div style="text-align:right; flex:1;">
              <h1 style="margin:0; font-size:17px; font-weight:900; color:#800000;">${labNameAr}</h1>
              <h2 style="margin:1px 0 0 0; font-size:12px; font-weight:700; color:#0f172a;">معامل أ.د. رامي مختار</h2>
              <p style="margin:1px 0 0 0; font-size:10.5px; font-weight:600; color:#800000;">${supervisionAr}</p>
              <p style="margin:2px 0 0 0; font-size:9px; color:#475569; font-weight:bold;">📍 ${address} | هاتف: ${phone} / ${hotline}</p>
            </div>

            <!-- Central 3D Brand Logo -->
            <div style="text-align:center; padding:0 14px;">
              <div style="width:52px; height:52px; background:linear-gradient(135deg, #800000, #991b1b, #0f172a); border-radius:12px; padding:2px; display:inline-flex; align-items:center; justify-content:center; box-shadow:0 4px 6px rgba(0,0,0,0.15);">
                <div style="width:100%; height:100%; background:#020617; border-radius:10px; display:flex; flex-direction:column; align-items:center; justify-content:center; color:#ffffff;">
                  <div style="font-weight:900; font-size:18px; line-height:1; letter-spacing:-1px;">
                    <span style="color:#f43f5e;">R</span><span style="color:#ffffff;">T</span>
                  </div>
                  <div style="font-size:6px; font-weight:900; letter-spacing:1px; color:#cbd5e1; text-transform:uppercase;">LAB</div>
                </div>
              </div>
              <div style="font-size:8px; font-weight:800; color:#800000; margin-top:2px;">${accreditation}</div>
            </div>

            <!-- English Side -->
            <div style="text-align:left; flex:1;" dir="ltr">
              <h1 style="margin:0; font-size:16px; font-weight:900; color:#800000;">${labNameEn}</h1>
              <h2 style="margin:1px 0 0 0; font-size:11px; font-weight:700; color:#0f172a;">Prof. Dr. Rami Mokhtar Laboratories</h2>
              <p style="margin:1px 0 0 0; font-size:10px; font-weight:600; color:#800000;">Kasr Al Ainy Faculty of Medicine Consultants</p>
              <p style="margin:2px 0 0 0; font-size:9px; color:#475569; font-weight:bold;">Main Center: Behteem Square, El-Ezaby Tower, 3rd Fl.</p>
            </div>
          </div>

          <!-- Patient Demographics Info Box -->
          <div style="background:#f8fafc; border:1px solid #cbd5e1; border-radius:6px; padding:8px 12px; margin-bottom:10px; font-size:11px;">
            <div style="display:grid; grid-template-columns: 2fr 1fr 1fr; gap:6px 12px; align-items:center;">
              <div>
                <span style="color:#64748b;">اسم المريض:</span>
                <strong style="color:#0f172a; font-size:12.5px; margin-right:4px;">${p.fullName}</strong>
              </div>
              <div dir="ltr" style="text-align:right;">
                <span style="color:#64748b;">Lab No:</span>
                <strong style="color:#800000; font-family:monospace; font-size:12.5px; margin-left:4px;">${p.labNumber}</strong>
              </div>
              <div dir="ltr" style="text-align:right;">
                <span style="background:#ffffff; border:1px solid #cbd5e1; padding:2px 6px; border-radius:4px; font-family:monospace; font-size:9px;">||| | ||| ${p.barcode}</span>
              </div>
              <div>
                <span style="color:#64748b;">السن / النوع:</span>
                <strong style="margin-right:4px;">${p.age} ${p.ageUnit === 'years' ? 'سنة' : p.ageUnit === 'months' ? 'شهر' : 'يوم'} / ${p.gender === 'male' ? 'ذكر' : 'أنثى'}</strong>
              </div>
              <div>
                <span style="color:#64748b;">تاريخ السحب:</span>
                <span style="font-family:monospace; margin-right:4px; font-size:9.5px;">${sampleDateFormatted}</span>
              </div>
              <div>
                <span style="color:#64748b;">تاريخ النتيجة:</span>
                <span style="font-family:monospace; margin-right:4px; font-size:9.5px;">${reportingDateFormatted}</span>
              </div>
              <div>
                <span style="color:#64748b;">الطبيب المعالج:</span>
                <strong style="margin-right:4px;">${doctorDisplay}</strong>
              </div>
              <div dir="ltr" style="text-align:right;">
                <span style="color:#64748b;">WhatsApp:</span>
                <span style="font-family:monospace; margin-left:4px;">${p.phone}</span>
              </div>
              <div dir="ltr" style="text-align:right;">
                <span style="color:#64748b;">Blood Group:</span>
                <strong style="color:#800000; margin-left:4px;">${p.bloodGroup || 'O+'}</strong>
              </div>
            </div>
          </div>

          <!-- Profile Title Banner -->
          <div style="background:linear-gradient(90deg, #700b0b, #0f172a); color:#ffffff; padding:6px 12px; border-radius:5px; display:flex; justify-content:space-between; align-items:center; margin-bottom:8px;">
            <div style="display:flex; align-items:center; gap:8px;">
              <span style="width:8px; height:8px; border-radius:50%; background:#f43f5e; display:inline-block;"></span>
              <strong style="font-size:12px; text-transform:uppercase; letter-spacing:0.5px;">${profile.titleEn}</strong>
              <span style="color:#fecdd3; font-size:11px;">— ${profile.titleAr}</span>
            </div>
            <div style="font-size:9.5px; color:#fed7aa; font-family:monospace;">
              Sample: ${profile.sampleType} | Page ${pageNum} of ${totalPages}
            </div>
          </div>

          <!-- 5-Column Investigations Table -->
          <div style="border:1px solid #cbd5e1; border-radius:6px; overflow:hidden; margin-bottom:8px;">
            <table style="width:100%; border-collapse:collapse; font-size:10.5px; text-align:left;" dir="ltr">
              <thead>
                <tr style="background:#f1f5f9; color:#1e293b; font-weight:800; font-size:10px; border-bottom:1.5px solid #cbd5e1; text-transform:uppercase; letter-spacing:0.5px;">
                  <th style="padding:6px 8px; width:34%;">Investigations</th>
                  <th style="padding:6px 8px; width:18%; text-align:center;">Results</th>
                  <th style="padding:6px 6px; width:16%; text-align:center;">Coloured Chart</th>
                  <th style="padding:6px 6px; width:14%; text-align:center;">Flags</th>
                  <th style="padding:6px 8px; width:18%;">References</th>
                </tr>
              </thead>
              <tbody>
                ${rowsHtml}
              </tbody>
            </table>
          </div>

          <!-- Peripheral Smear findings if CBC -->
          ${bloodFilmHtml}

          <!-- Pathological Illustration / Infogram -->
          ${illustrationHtml}

          <!-- Clinical Interpretation and Comment -->
          ${(profile.interpretation || profile.comment) ? `
            <div style="background:#f8fafc; border:1px solid #e2e8f0; border-radius:5px; padding:6px 10px; margin-bottom:8px; font-size:10.5px; line-height:1.4;">
              ${profile.interpretation ? `
                <div><strong style="color:#800000;">Interpretation:</strong> <span style="color:#1e293b;">${profile.interpretation}</span></div>
              ` : ''}
              ${profile.comment ? `
                <div style="margin-top:2px; font-size:10px; color:#64748b;"><strong style="color:#475569;">Comments:</strong> ${profile.comment}</div>
              ` : ''}
            </div>
          ` : ''}
        </div>

        <!-- Official Signatures Footer (Bottom of every profile page) -->
        <div style="margin-top:auto; padding-top:8px; border-top:1.5px solid #cbd5e1;">
          <div style="display:grid; grid-template-columns: 1fr 1fr 1fr; gap:10px; text-align:center; margin-bottom:6px;">
            <!-- Lab CHEMIST -->
            <div>
              <div style="font-size:9.5px; font-weight:800; color:#64748b; text-transform:uppercase;">Lab CHEMIST</div>
              <div style="font-family:serif; font-style:italic; font-size:11px; color:#475569; padding:2px 0; font-weight:bold;">Approved / Chemist</div>
              <div style="font-size:9.5px; font-weight:700; color:#0f172a;">${report.staff.labChemist}</div>
              <div style="font-size:8px; color:#64748b;">${report.staff.chemistTitle || 'أخصائي الكيمياء الإكلينيكية'}</div>
              <div style="font-size:7.5px; color:#94a3b8; font-family:monospace;">${report.staff.chemistLicense || 'EGY-SCI-88402'}</div>
            </div>

            <!-- Verify by -->
            <div>
              <div style="font-size:9.5px; font-weight:800; color:#64748b; text-transform:uppercase;">Verify by</div>
              <div style="font-family:serif; font-style:italic; font-size:11px; color:#475569; padding:2px 0; font-weight:bold;">Quality Audit Verified</div>
              <div style="font-size:9.5px; font-weight:700; color:#0f172a;">${report.staff.verifiedBy}</div>
              <div style="font-size:8px; color:#64748b;">${report.staff.verifierTitle || 'إدارة ضبط الجودة والتشغيل'}</div>
              <div style="font-size:7.5px; color:#94a3b8; font-family:monospace;">${report.staff.verifierLicense || 'EGY-MGT-11024'}</div>
            </div>

            <!-- Consultant Pathologist -->
            <div style="border-right:1px solid #e2e8f0; padding-right:8px;">
              <div style="font-size:9.5px; font-weight:800; color:#800000; text-transform:uppercase;">Consultant Pathologist</div>
              <div style="padding:2px 0;">
                <span style="display:inline-block; border:1px dashed #800000; padding:1px 8px; border-radius:4px; background:#fff1f2; font-family:serif; font-style:italic; font-size:11px; color:#800000; font-weight:900;">
                  Prof. Dr. Rami Mokhtar
                </span>
              </div>
              <div style="font-size:10px; font-weight:800; color:#800000;">${report.staff.pathologist}</div>
              <div style="font-size:8px; color:#475569;">${report.staff.pathologistTitle || 'استشاري الباثولوجيا الإكلينيكية - قصر العيني'}</div>
              <div style="font-size:7.5px; color:#94a3b8; font-family:monospace;">${report.staff.pathologistLicense || 'EGY-MED-48201'}</div>
            </div>
          </div>

          <!-- Bottom Notice -->
          <div style="font-size:8px; color:#94a3b8; text-align:center; border-top:1px dashed #e2e8f0; padding-top:4px;">
            تم اعتماد هذا التقرير إلكترونياً بمعامل RT للتحاليل الطبية والتشخيصية • النتيجة مطابقة للمعايير الدولية ISO 15189 • كود التحقق: ${p.barcode}
          </div>
        </div>
      </div>
    `;
  });

  const printWindow = window.open('', '_blank', 'width=950,height=1000');
  if (!printWindow) {
    alert('يرجى السماح بالنوافذ المنبثقة لمعاينة وطباعة التقرير.');
    return;
  }

  printWindow.document.write(`
    <!DOCTYPE html>
    <html lang="ar" dir="rtl">
    <head>
      <meta charset="UTF-8">
      <title>تقرير تحليل طبي - ${p.fullName} - ${report.reportNumber}</title>
      <link rel="preconnect" href="https://fonts.googleapis.com">
      <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
      <link href="https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700;800;900&family=JetBrains+Mono:wght@400;700&display=swap" rel="stylesheet">
      <style>
        * { box-sizing: border-box; }
        body {
          margin: 0;
          padding: 0;
          background: #525659;
          font-family: 'Cairo', sans-serif;
          color: #0f172a;
        }
        @media print {
          body {
            background: #ffffff;
          }
          .report-page {
            box-shadow: none !important;
            margin: 0 !important;
            padding: 15mm 12mm !important;
            page-break-after: always;
            break-after: page;
          }
          .no-print {
            display: none !important;
          }
          @page {
            size: A4 portrait;
            margin: 0;
          }
        }
        .report-page {
          box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.3);
          margin: 20px auto;
        }
        .print-btn {
          position: fixed;
          top: 15px;
          left: 15px;
          z-index: 9999;
          background: #800000;
          color: white;
          padding: 10px 20px;
          border-radius: 8px;
          border: none;
          font-family: 'Cairo', sans-serif;
          font-weight: bold;
          font-size: 14px;
          cursor: pointer;
          box-shadow: 0 4px 10px rgba(0,0,0,0.3);
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .print-btn:hover {
          background: #991b1b;
        }
      </style>
    </head>
    <body>
      <button class="print-btn no-print" onclick="window.print()">
        🖨️ طباعة التقرير (Print A4)
      </button>
      ${profilesHtml}
      <script>
        window.onload = function() {
          // Auto prompt print after render
          setTimeout(function() {
            window.print();
          }, 600);
        };
      </script>
    </body>
    </html>
  `);

  printWindow.document.close();
}
