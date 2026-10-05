import { LabReport } from '../types/lab';
import { openPrintReportWindow } from './printReportWindow';

/**
 * Generates and downloads or displays the report as PDF.
 * Uses robust multi-engine approach:
 * 1. Opens standalone high-resolution print/PDF view with native browser Save-as-PDF.
 * 2. Attempts client-side canvas capture if supported.
 */
export async function downloadReportPDF(
  report: LabReport,
  pageElementsSelector = '.report-page-container'
): Promise<void> {
  try {
    // Dynamically attempt html2canvas & jspdf
    const { default: html2canvas } = await import('html2canvas');
    const { default: jsPDF } = await import('jspdf');

    const pageNodes = document.querySelectorAll(pageElementsSelector);

    if (!pageNodes || pageNodes.length === 0) {
      openPrintReportWindow(report);
      return;
    }

    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
      compress: true
    });

    const pdfWidth = 210;
    const pdfHeight = 297;

    for (let i = 0; i < pageNodes.length; i++) {
      const node = pageNodes[i] as HTMLElement;

      // Temporarily strip rounded corners, border, and shadows so NO background leaks
      const origRadius = node.style.borderRadius;
      const origShadow = node.style.boxShadow;
      const origBorder = node.style.border;
      const origBg = node.style.backgroundColor;

      node.style.borderRadius = '0px';
      node.style.boxShadow = 'none';
      node.style.border = 'none';
      node.style.backgroundColor = '#ffffff';

      let canvas;
      try {
        canvas = await html2canvas(node, {
          scale: 2,
          useCORS: true,
          logging: false,
          backgroundColor: '#ffffff',
          windowWidth: 1200,
          ignoreElements: (el: any) => {
            return el.classList && el.classList.contains('no-print');
          }
        });
      } finally {
        node.style.borderRadius = origRadius;
        node.style.boxShadow = origShadow;
        node.style.border = origBorder;
        node.style.backgroundColor = origBg;
      }

      const imgData = canvas.toDataURL('image/jpeg', 0.95);

      if (i > 0) {
        pdf.addPage('a4', 'portrait');
      }

      const margin = 6;
      const contentWidth = pdfWidth - margin * 2;
      const contentHeight = (canvas.height * contentWidth) / canvas.width;

      pdf.addImage(imgData, 'JPEG', margin, margin, contentWidth, Math.min(contentHeight, pdfHeight - margin * 2));
    }

    const safeName = report.patient.fullName.trim().replace(/\s+/g, '_').replace(/[^a-zA-Z0-9_\u0600-\u06FF]/g, '') || 'Patient';
    const fileName = `RT_LAB_${safeName}_${report.patient.labNumber}.pdf`;

    pdf.save(fileName);
  } catch (err) {
    console.warn('Canvas PDF generator encountered browser CSS constraints, falling back to dedicated print window:', err);
    // Reliable fallback: Opens the isolated print document with automatic Print to PDF dialog!
    openPrintReportWindow(report);
  }
}

export function triggerPrintDialog(report?: LabReport): void {
  if (report) {
    openPrintReportWindow(report);
    return;
  }
  try {
    window.print();
  } catch {
    alert('يرجى الضغط على زر تحميل ملف PDF لحفظ التقرير.');
  }
}
