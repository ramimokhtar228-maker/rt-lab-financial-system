import pptxgen from 'pptxgenjs';
import { LabReport } from '../types/lab';
import { formatReferenceDisplay } from './calculator';

export async function exportReportToPPTX(report: LabReport): Promise<void> {
  const pptx = new pptxgen();

  pptx.layout = 'LAYOUT_16x9';
  pptx.author = 'RT LAB - Rami Mokhtar Laboratories';
  pptx.company = 'RT LAB - Kasr Al Ainy Faculty of Medicine';
  pptx.title = `RT LAB Report - ${report.patient.fullName}`;

  // Slide 1: Cover / Patient Dossier
  const coverSlide = pptx.addSlide();

  // Dark Red & Navy top accent bar
  coverSlide.addShape(pptx.ShapeType.rect, {
    x: 0,
    y: 0,
    w: '100%',
    h: 1.2,
    fill: { color: '8B0000' } // Crimson / Dark Red
  });

  coverSlide.addText('RT LAB - DIAGNOSTIC LABORATORIES', {
    x: 0.8,
    y: 0.25,
    w: 8.0,
    h: 0.4,
    fontSize: 22,
    bold: true,
    color: 'FFFFFF',
    fontFace: 'Arial'
  });

  coverSlide.addText('معامل رامي مختار للتحاليل التشخيصية - كلية طب قصر العيني', {
    x: 0.8,
    y: 0.65,
    w: 8.0,
    h: 0.4,
    fontSize: 14,
    color: 'FEE2E2',
    fontFace: 'Arial'
  });

  // Patient Card Box
  coverSlide.addShape(pptx.ShapeType.roundRect, {
    x: 0.8,
    y: 1.6,
    w: 8.4,
    h: 4.8,
    fill: { color: 'F8FAFC' },
    line: { color: 'E2E8F0', width: 1.5 }
  });

  coverSlide.addText('Clinical Diagnostic Laboratory Report', {
    x: 1.2,
    y: 1.9,
    w: 7.6,
    h: 0.4,
    fontSize: 20,
    bold: true,
    color: '0F172A'
  });

  const p = report.patient;
  const patientDetails = [
    [
      { text: 'Patient Name:', options: { bold: true, color: '475569' } },
      { text: p.fullName, options: { bold: true, color: '0F172A' } },
      { text: 'Lab Number:', options: { bold: true, color: '475569' } },
      { text: p.labNumber, options: { bold: true, color: '8B0000' } }
    ],
    [
      { text: 'Age / Gender:', options: { bold: true, color: '475569' } },
      { text: `${p.age} ${p.ageUnit} / ${p.gender === 'male' ? 'Male (ذكر)' : 'Female (أنثى)'}`, options: { color: '1E293B' } },
      { text: 'Date of Sample:', options: { bold: true, color: '475569' } },
      { text: new Date(p.sampleDate).toLocaleDateString(), options: { color: '1E293B' } }
    ],
    [
      { text: 'Referring Doctor:', options: { bold: true, color: '475569' } },
      { text: `${p.referringDoctorTitle} ${p.referringDoctorName}`, options: { color: '1E293B' } },
      { text: 'Reporting Date:', options: { bold: true, color: '475569' } },
      { text: new Date(p.reportingDate).toLocaleDateString(), options: { color: '1E293B' } }
    ],
    [
      { text: 'Profiles Requested:', options: { bold: true, color: '475569' } },
      { text: report.profiles.map(pr => pr.titleEn).join(', '), options: { color: '1E293B' } },
      { text: 'Status:', options: { bold: true, color: '475569' } },
      { text: report.status.toUpperCase(), options: { bold: true, color: '166534' } }
    ]
  ];

  coverSlide.addTable(patientDetails, {
    x: 1.2,
    y: 2.5,
    w: 7.6,
    h: 2.4,
    fontSize: 12,
    colW: [1.8, 2.2, 1.6, 2.0],
    border: { color: 'CBD5E1', pt: 0.5 }
  });

  // Footer on cover slide
  coverSlide.addText('Clinical & Chemical Pathology Consultants - Kasr Al Ainy Hospital', {
    x: 1.2,
    y: 5.3,
    w: 7.6,
    h: 0.3,
    fontSize: 11,
    italic: true,
    color: '64748B'
  });

  // Profile Slides: Every Profile on its own slide! (كل بروفايل فى صفحه)
  for (let idx = 0; idx < report.profiles.length; idx++) {
    const profile = report.profiles[idx];
    const slide = pptx.addSlide();

    // Header bar
    slide.addShape(pptx.ShapeType.rect, {
      x: 0,
      y: 0,
      w: '100%',
      h: 0.9,
      fill: { color: '0F172A' } // Navy
    });

    slide.addText(`RT LAB | ${profile.titleEn}`, {
      x: 0.6,
      y: 0.15,
      w: 8.0,
      h: 0.35,
      fontSize: 18,
      bold: true,
      color: 'FFFFFF'
    });

    slide.addText(`Patient: ${p.fullName}  |  Lab No: ${p.labNumber}  |  Slide ${idx + 2} of ${report.profiles.length + 1}`, {
      x: 0.6,
      y: 0.5,
      w: 8.8,
      h: 0.25,
      fontSize: 10,
      color: '94A3B8'
    });

    // Test Results Table
    // Headers matching the requested order: Investigations / Results / Flags / References
    const tableHeaders = [
      { text: 'Investigations', options: { bold: true, fill: { color: '8B0000' }, color: 'FFFFFF' } },
      { text: 'Result', options: { bold: true, fill: { color: '8B0000' }, color: 'FFFFFF' } },
      { text: 'Units', options: { bold: true, fill: { color: '8B0000' }, color: 'FFFFFF' } },
      { text: 'Flag', options: { bold: true, fill: { color: '8B0000' }, color: 'FFFFFF' } },
      { text: 'Reference Interval', options: { bold: true, fill: { color: '8B0000' }, color: 'FFFFFF' } }
    ];

    const tableRows: Array<Array<{ text: string; options?: Record<string, unknown> }>> = [tableHeaders];

    profile.parameters.forEach(param => {
      let flagColor = '334155';
      let flagBg = 'FFFFFF';
      if (param.flag === 'HIGH' || param.flag === 'PANIC_HIGH') {
        flagColor = '991B1B';
        flagBg = 'FEE2E2';
      } else if (param.flag === 'LOW' || param.flag === 'PANIC_LOW') {
        flagColor = 'B45309';
        flagBg = 'FEF3C7';
      }

      tableRows.push([
        { text: param.name, options: { bold: true, color: '1E293B' } },
        { text: param.result || '—', options: { bold: true, color: flagColor !== '334155' ? flagColor : '0F172A' } },
        { text: param.unit || '', options: { color: '64748B' } },
        { text: param.flag || 'NORMAL', options: { bold: true, color: flagColor, fill: { color: flagBg } } },
        { text: formatReferenceDisplay(param), options: { color: '475569' } }
      ]);
    });

    slide.addTable(tableRows, {
      x: 0.6,
      y: 1.1,
      w: 8.8,
      fontSize: 10,
      colW: [2.8, 1.4, 1.2, 1.2, 2.2],
      border: { color: 'E2E8F0', pt: 0.5 }
    });

    // Clinical Interpretation Box
    if (profile.interpretation || profile.comment) {
      slide.addShape(pptx.ShapeType.roundRect, {
        x: 0.6,
        y: 5.4,
        w: 8.8,
        h: 0.85,
        fill: { color: 'F1F5F9' },
        line: { color: 'CBD5E1', width: 1 }
      });

      slide.addText('Clinical Pathology Interpretation:', {
        x: 0.8,
        y: 5.45,
        w: 8.4,
        h: 0.25,
        fontSize: 10,
        bold: true,
        color: '8B0000'
      });

      slide.addText(profile.interpretation || profile.comment || '', {
        x: 0.8,
        y: 5.7,
        w: 8.4,
        h: 0.45,
        fontSize: 9.5,
        color: '334155'
      });
    }

    // Signatures footer
    slide.addText(`Lab Chemist: ${report.staff.labChemist}`, {
      x: 0.6,
      y: 6.4,
      w: 2.8,
      h: 0.35,
      fontSize: 8.5,
      color: '64748B'
    });

    slide.addText(`Verified By: ${report.staff.verifiedBy}`, {
      x: 3.6,
      y: 6.4,
      w: 2.6,
      h: 0.35,
      fontSize: 8.5,
      color: '64748B'
    });

    slide.addText(`Consultant Pathologist: ${report.staff.pathologist}`, {
      x: 6.4,
      y: 6.4,
      w: 3.0,
      h: 0.35,
      fontSize: 8.5,
      bold: true,
      color: '8B0000'
    });
  }

  const safeName = report.patient.fullName.replace(/\s+/g, '_').replace(/[^a-zA-Z0-9_\u0600-\u06FF]/g, '');
  await pptx.writeFile({ fileName: `RT_LAB_${safeName}_${report.patient.labNumber}.pptx` });
}
