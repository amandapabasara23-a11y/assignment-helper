import jsPDF from 'jspdf';
import type { Assignment } from '../types';
import { formatReferenceItem } from './references';
import { computeHierarchicalNumbers } from './aiOrganizer';

export async function exportPaperToPdf(
  target: string | Assignment,
  filename: string,
  assignmentFallback?: Assignment
): Promise<void> {
  const assignment: Assignment | undefined =
    typeof target === 'object' ? target : assignmentFallback;

  if (assignment) {
    generateVectorPdf(assignment, filename);
    return;
  }

  // Fallback DOM canvas rendering if no assignment object is supplied
  const elementId = typeof target === 'string' ? target : 'assignment-paper-preview';
  const container = document.getElementById(elementId);
  if (!container) {
    throw new Error('Paper preview element not found');
  }

  const html2canvas = (await import('html2canvas')).default;
  const pdf = new jsPDF('p', 'mm', 'a4');
  const pdfWidth = 210;
  const pdfHeight = 297;

  const canvas = await html2canvas(container, {
    scale: 2,
    useCORS: true,
    logging: false,
    backgroundColor: '#ffffff'
  });

  const imgData = canvas.toDataURL('image/png');
  const imgHeight = (canvas.height * pdfWidth) / canvas.width;
  let heightLeft = imgHeight;
  let yPosition = 0;

  pdf.addImage(imgData, 'PNG', 0, yPosition, pdfWidth, imgHeight);
  heightLeft -= pdfHeight;

  while (heightLeft > 3) {
    yPosition -= pdfHeight;
    pdf.addPage();
    pdf.addImage(imgData, 'PNG', 0, yPosition, pdfWidth, imgHeight);
    heightLeft -= pdfHeight;
  }

  pdf.save(filename);
}

function generateVectorPdf(assignment: Assignment, filename: string): void {
  const { formatting, sections, references, referencingStyle } = assignment;

  const fontMap: Record<string, string> = {
    'Times New Roman': 'times',
    'Arial': 'helvetica',
    'Calibri': 'helvetica',
    'Aptos': 'helvetica',
    'Georgia': 'times'
  };
  const fontName = fontMap[formatting.fontFamily] || 'times';

  const isLetter = formatting.pageSize === 'Letter';
  const pdfWidth = isLetter ? 215.9 : 210;
  const pdfHeight = isLetter ? 279.4 : 297;
  const paperFormat = isLetter ? 'letter' : 'a4';

  const marginMap: Record<string, { top: number; bottom: number; left: number; right: number }> = {
    'Normal (2.54 cm)': { top: 25.4, bottom: 25.4, left: 25.4, right: 25.4 },
    'Narrow (1.27 cm)': { top: 12.7, bottom: 12.7, left: 12.7, right: 12.7 },
    'Moderate': { top: 19.0, bottom: 19.0, left: 25.4, right: 25.4 },
    'Wide': { top: 25.4, bottom: 25.4, left: 31.7, right: 31.7 }
  };
  const margins = marginMap[formatting.margin] || { top: 25.4, bottom: 25.4, left: 25.4, right: 25.4 };
  const contentWidth = pdfWidth - margins.left - margins.right;

  const sizeMap: Record<string, number> = {
    '10pt': 10,
    '11pt': 11,
    '12pt': 12,
    '14pt': 14
  };
  const bodyFontSize = sizeMap[formatting.fontSize] || 12;
  const lineSpacingMult = parseFloat(formatting.lineSpacing || '1.5');
  // Line gap in mm (1pt = 0.352778mm)
  const lineGapMm = bodyFontSize * 0.352778 * lineSpacingMult;

  const numberMap = computeHierarchicalNumbers(sections);
  const pdf = new jsPDF({ unit: 'mm', format: paperFormat, orientation: 'portrait' });

  let currentY = margins.top;

  function ensureSpace(neededHeight: number) {
    if (currentY + neededHeight > pdfHeight - margins.bottom) {
      pdf.addPage();
      currentY = margins.top;
    }
  }

  const coverEnabled = formatting.includeCoverPage;
  const tocEnabled = formatting.includeTableOfContents;

  let bodyStartPage = 1;
  if (coverEnabled) bodyStartPage++;
  if (tocEnabled) bodyStartPage++;

  // ─────────────────────────────────────────────────────────────
  // 1. COVER PAGE
  // ─────────────────────────────────────────────────────────────
  if (coverEnabled) {
    // Institution Header
    pdf.setFont(fontName, 'bold');
    pdf.setFontSize(bodyFontSize + 4);
    pdf.setTextColor(0, 0, 0);
    const instText = (assignment.institution || 'UNIVERSITY ASSIGNMENT').toUpperCase();
    pdf.text(instText, pdfWidth / 2, margins.top + 15, { align: 'center' });

    if (assignment.faculty) {
      pdf.setFont(fontName, 'italic');
      pdf.setFontSize(bodyFontSize);
      pdf.setTextColor(60, 60, 60);
      pdf.text(assignment.faculty, pdfWidth / 2, margins.top + 23, { align: 'center' });
    }

    // Title & Topic (Centered)
    pdf.setFont(fontName, 'bold');
    pdf.setFontSize(bodyFontSize + 8);
    pdf.setTextColor(0, 0, 0);
    const titleLines = pdf.splitTextToSize(assignment.title || 'Untitled Assignment', contentWidth - 10);
    let titleY = pdfHeight / 2 - 25;
    for (const tLine of titleLines) {
      pdf.text(tLine, pdfWidth / 2, titleY, { align: 'center' });
      titleY += (bodyFontSize + 8) * 0.45;
    }

    if (assignment.topic) {
      pdf.setFont(fontName, 'italic');
      pdf.setFontSize(bodyFontSize + 1);
      pdf.setTextColor(70, 70, 70);
      pdf.text(`Topic: ${assignment.topic}`, pdfWidth / 2, titleY + 6, { align: 'center' });
    }

    // Student & Submission Metadata
    let metaY = pdfHeight - margins.bottom - 45;
    pdf.setFont(fontName, 'bold');
    pdf.setFontSize(bodyFontSize + 1);
    pdf.setTextColor(0, 0, 0);
    if (assignment.studentName) {
      pdf.text(`Submitted by: ${assignment.studentName}`, pdfWidth / 2, metaY, { align: 'center' });
      metaY += (bodyFontSize + 1) * 0.5;
    }

    pdf.setFont(fontName, 'normal');
    pdf.setFontSize(bodyFontSize);
    if (assignment.studentId) {
      pdf.text(`Student ID: ${assignment.studentId}`, pdfWidth / 2, metaY, { align: 'center' });
      metaY += bodyFontSize * 0.45;
    }
    if (assignment.courseName || assignment.courseCode) {
      const courseText = [assignment.courseCode, assignment.courseName].filter(Boolean).join(' - ');
      pdf.text(`Course: ${courseText}`, pdfWidth / 2, metaY, { align: 'center' });
      metaY += bodyFontSize * 0.45;
    }
    if (assignment.instructorName) {
      pdf.text(`Lecturer: ${assignment.instructorName}`, pdfWidth / 2, metaY, { align: 'center' });
      metaY += bodyFontSize * 0.45;
    }
    if (assignment.submissionDate) {
      pdf.text(`Date: ${assignment.submissionDate}`, pdfWidth / 2, metaY, { align: 'center' });
    }

    pdf.addPage();
    currentY = margins.top;
  }

  // ─────────────────────────────────────────────────────────────
  // 2. TABLE OF CONTENTS
  // ─────────────────────────────────────────────────────────────
  if (tocEnabled) {
    pdf.setFont(fontName, 'bold');
    pdf.setFontSize(bodyFontSize + 4);
    pdf.setTextColor(0, 0, 0);
    pdf.text('Table of Contents', margins.left, currentY);
    currentY += lineGapMm + 2;

    pdf.setDrawColor(30, 30, 30);
    pdf.setLineWidth(0.3);
    pdf.line(margins.left, currentY, pdfWidth - margins.right, currentY);
    currentY += 6;

    pdf.setFontSize(bodyFontSize);

    sections.forEach((sec) => {
      const numLabel = numberMap.get(sec.id) || '';
      const indentMm = sec.headingLevel === 1 ? 0 : sec.headingLevel === 2 ? 5 : 10;
      const isH1 = sec.headingLevel === 1;
      const isH3 = sec.headingLevel === 3;

      pdf.setFont(fontName, isH1 ? 'bold' : isH3 ? 'italic' : 'normal');
      const entryText = `${numLabel} ${sec.title}`;
      const textX = margins.left + indentMm;
      const pageStr = `Page ${bodyStartPage}`;
      const pageStrWidth = pdf.getTextWidth(pageStr);
      const rightX = pdfWidth - margins.right;
      const pageX = rightX - pageStrWidth;

      pdf.text(entryText, textX, currentY);
      pdf.text(pageStr, pageX, currentY);

      // Draw dotted leader line
      const entryWidth = pdf.getTextWidth(entryText);
      const dotStartX = textX + entryWidth + 3;
      const dotEndX = pageX - 3;
      if (dotEndX > dotStartX) {
        pdf.setFont(fontName, 'normal');
        pdf.setTextColor(120, 120, 120);
        let dotX = dotStartX;
        while (dotX < dotEndX) {
          pdf.text('.', dotX, currentY);
          dotX += 2.5;
        }
        pdf.setTextColor(0, 0, 0);
      }

      currentY += lineGapMm + 1;
      ensureSpace(lineGapMm);
    });

    if (references.length > 0) {
      pdf.setFont(fontName, 'bold');
      const entryText = `${sections.length + 1}. References`;
      const textX = margins.left;
      const pageStr = `Page ${bodyStartPage}`;
      const pageStrWidth = pdf.getTextWidth(pageStr);
      const rightX = pdfWidth - margins.right;
      const pageX = rightX - pageStrWidth;

      pdf.text(entryText, textX, currentY);
      pdf.text(pageStr, pageX, currentY);

      const entryWidth = pdf.getTextWidth(entryText);
      const dotStartX = textX + entryWidth + 3;
      const dotEndX = pageX - 3;
      if (dotEndX > dotStartX) {
        pdf.setFont(fontName, 'normal');
        pdf.setTextColor(120, 120, 120);
        let dotX = dotStartX;
        while (dotX < dotEndX) {
          pdf.text('.', dotX, currentY);
          dotX += 2.5;
        }
        pdf.setTextColor(0, 0, 0);
      }

      currentY += lineGapMm + 1;
    }

    pdf.addPage();
    currentY = margins.top;
  }

  // ─────────────────────────────────────────────────────────────
  // 3. BODY SECTIONS
  // ─────────────────────────────────────────────────────────────
  sections.forEach((sec) => {
    const numLabel = numberMap.get(sec.id) || '';
    let headingFontSize = bodyFontSize + 4;
    let headingStyle: 'bold' | 'bolditalic' | 'normal' = 'bold';
    let indentMm = 0;

    if (sec.headingLevel === 2) {
      headingFontSize = bodyFontSize + 2;
      indentMm = 4;
    } else if (sec.headingLevel === 3) {
      headingFontSize = bodyFontSize;
      headingStyle = 'bolditalic';
      indentMm = 8;
    }

    ensureSpace(lineGapMm + 4);

    pdf.setFont(fontName, headingStyle);
    pdf.setFontSize(headingFontSize);
    pdf.setTextColor(0, 0, 0);
    const headingText = `${numLabel} ${sec.title}`;
    pdf.text(headingText, margins.left + indentMm, currentY);
    currentY += headingFontSize * 0.352778 + 3;

    // Heading bottom border for H1
    if (sec.headingLevel === 1) {
      pdf.setDrawColor(220, 220, 220);
      pdf.setLineWidth(0.2);
      pdf.line(margins.left, currentY - 1, pdfWidth - margins.right, currentY - 1);
      currentY += 2;
    }

    // Paragraphs
    pdf.setFont(fontName, 'normal');
    pdf.setFontSize(bodyFontSize);
    pdf.setTextColor(0, 0, 0);

    const sectionContentWidth = contentWidth - indentMm;
    const paragraphs = sec.originalText ? sec.originalText.split('\n\n').filter(Boolean) : [];

    paragraphs.forEach((pText) => {
      const lines: string[] = pdf.splitTextToSize(pText.trim(), sectionContentWidth);
      lines.forEach((line) => {
        ensureSpace(lineGapMm);
        pdf.text(line, margins.left + indentMm, currentY, {
          align: formatting.alignment === 'Justified' ? 'justify' : 'left',
          maxWidth: sectionContentWidth
        });
        currentY += lineGapMm;
      });
      currentY += lineGapMm * 0.4;
    });

    currentY += 3;
  });

  // ─────────────────────────────────────────────────────────────
  // 4. REFERENCES
  // ─────────────────────────────────────────────────────────────
  if (references.length > 0) {
    ensureSpace(15);
    pdf.setFont(fontName, 'bold');
    pdf.setFontSize(bodyFontSize + 4);
    pdf.setTextColor(0, 0, 0);
    pdf.text('References', margins.left, currentY);
    currentY += (bodyFontSize + 4) * 0.352778 + 4;

    pdf.setFont(fontName, 'normal');
    pdf.setFontSize(bodyFontSize);

    references.forEach((ref) => {
      const refStr = formatReferenceItem(ref, referencingStyle);
      const hangingIndent = 8; // mm
      const firstLineWidth = contentWidth;
      const subsLineWidth = contentWidth - hangingIndent;

      const allLines: string[] = pdf.splitTextToSize(refStr, firstLineWidth);

      if (allLines.length > 0) {
        ensureSpace(lineGapMm);
        pdf.text(allLines[0], margins.left, currentY);
        currentY += lineGapMm;

        if (allLines.length > 1) {
          const remainingText = allLines.slice(1).join(' ');
          const subsLines: string[] = pdf.splitTextToSize(remainingText, subsLineWidth);
          subsLines.forEach((line) => {
            ensureSpace(lineGapMm);
            pdf.text(line, margins.left + hangingIndent, currentY);
            currentY += lineGapMm;
          });
        }
      }

      currentY += lineGapMm * 0.4;
    });
  }

  // ─────────────────────────────────────────────────────────────
  // 5. HEADERS & FOOTERS (PAGE NUMBERING)
  // ─────────────────────────────────────────────────────────────
  const totalPages = pdf.getNumberOfPages();
  const pageNumStyle = formatting.pageNumbering;

  for (let p = 1; p <= totalPages; p++) {
    pdf.setPage(p);

    if (p === 1 && coverEnabled) continue;

    pdf.setFont(fontName, 'normal');
    pdf.setFontSize(9);
    pdf.setTextColor(100, 100, 100);

    const pageStr = `Page ${p} of ${totalPages}`;

    if (pageNumStyle === 'Bottom center') {
      pdf.text(pageStr, pdfWidth / 2, pdfHeight - 10, { align: 'center' });
    } else if (pageNumStyle === 'Bottom right') {
      pdf.text(pageStr, pdfWidth - margins.right, pdfHeight - 10, { align: 'right' });
    } else if (pageNumStyle === 'Top right') {
      pdf.text(pageStr, pdfWidth - margins.right, 12, { align: 'right' });
    }
  }

  pdf.save(filename);
}

export function printElementDirectly(elementId: string) {
  const element = document.getElementById(elementId);
  if (!element) return;

  const printWindow = window.open('', '_blank');
  if (!printWindow) return;

  printWindow.document.write(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>Assignment Document</title>
        <style>
          body { font-family: 'Times New Roman', serif; margin: 0; padding: 20mm; color: #000; }
          .paper-sheet { page-break-after: always; min-height: 297mm; }
          h1, h2, h3 { color: #000; }
          @page { size: A4; margin: 0; }
        </style>
      </head>
      <body>
        ${element.innerHTML}
      </body>
    </html>
  `);
  printWindow.document.close();
  printWindow.focus();
  setTimeout(() => {
    printWindow.print();
  }, 500);
}

