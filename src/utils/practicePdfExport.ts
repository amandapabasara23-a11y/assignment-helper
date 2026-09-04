import { jsPDF } from 'jspdf';
import type { PracticeQuestion } from '../types/practice';

/**
 * Generates a clean, university-style printable examination paper PDF locally.
 */
export function generateExamPaperPdf(
  examTitle: string,
  resourceName: string,
  questions: PracticeQuestion[]
): void {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  const pageWidth = doc.internal.pageSize.getWidth(); // 210mm
  const pageHeight = doc.internal.pageSize.getHeight(); // 297mm
  const margin = 20;
  const contentWidth = pageWidth - margin * 2; // 170mm

  let currentY = margin;

  const checkAddPage = (neededHeight: number) => {
    if (currentY + neededHeight > pageHeight - margin - 15) {
      doc.addPage();
      currentY = margin + 10;
      addPageHeaderFooter();
    }
  };

  const addPageHeaderFooter = () => {
    const totalPages = doc.getNumberOfPages();
    doc.setFont('Helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(120, 120, 120);

    // Header
    doc.text('UNIVERSITY PRACTICE EXAMINATION', margin, 12);
    doc.text(examTitle.toUpperCase(), pageWidth - margin, 12, { align: 'right' });
    doc.setDrawColor(200, 200, 200);
    doc.setLineWidth(0.3);
    doc.line(margin, 14, pageWidth - margin, 14);

    // Footer
    doc.line(margin, pageHeight - 12, pageWidth - margin, pageHeight - 12);
    doc.text(`Page ${totalPages}`, pageWidth - margin, pageHeight - 7, { align: 'right' });
    doc.text('CONFIDENTIAL — DO NOT DISTRIBUTE', margin, pageHeight - 7);
  };

  // Header Box
  doc.setFont('Helvetica', 'bold');
  doc.setFontSize(18);
  doc.setTextColor(20, 20, 20);
  doc.text('ACADEMIC MOCK EXAMINATION', pageWidth / 2, currentY, { align: 'center' });

  currentY += 7;
  doc.setFont('Helvetica', 'normal');
  doc.setFontSize(11);
  doc.setTextColor(80, 80, 80);
  doc.text(`Resource Material: ${resourceName}`, pageWidth / 2, currentY, { align: 'center' });

  currentY += 10;

  // Student Info Header Table
  doc.setDrawColor(180, 180, 180);
  doc.setFillColor(248, 249, 250);
  doc.rect(margin, currentY, contentWidth, 22, 'FD');

  doc.setFontSize(9);
  doc.setFont('Helvetica', 'bold');
  doc.setTextColor(50, 50, 50);

  doc.text('STUDENT NAME:', margin + 4, currentY + 7);
  doc.line(margin + 33, currentY + 7, margin + 95, currentY + 7);

  doc.text('STUDENT ID:', margin + 102, currentY + 7);
  doc.line(margin + 125, currentY + 7, margin + 164, currentY + 7);

  doc.text('DATE:', margin + 4, currentY + 16);
  doc.line(margin + 18, currentY + 16, margin + 95, currentY + 16);

  doc.text('TIME ALLOWED:', margin + 102, currentY + 16);
  doc.text('2 HOURS', margin + 130, currentY + 16);

  currentY += 28;

  // Instructions Box
  doc.setFont('Helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(30, 30, 30);
  doc.text('INSTRUCTIONS TO CANDIDATES:', margin, currentY);
  currentY += 5;

  doc.setFont('Helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(70, 70, 70);
  const instructions = [
    '1. Answer all questions directly on this paper in clear handwriting.',
    '2. Answers must be derived exclusively from the designated course resource material.',
    '3. Clearly label section numbers and sub-question letters.',
    '4. Write legibly and organize your answers logically.'
  ];
  instructions.forEach(inst => {
    doc.text(inst, margin + 2, currentY);
    currentY += 4.5;
  });

  currentY += 6;
  doc.setLineWidth(0.5);
  doc.setDrawColor(40, 40, 40);
  doc.line(margin, currentY, pageWidth - margin, currentY);
  currentY += 8;

  // Group Questions by Section
  const sections = ['Definition', 'Short Answers (Brief Explain)', 'Critical Analysis', 'Quiz'] as const;

  let globalQuestionNumber = 1;

  sections.forEach(secName => {
    const secQuestions = questions.filter(q => q.section === secName);
    if (secQuestions.length === 0) return;

    checkAddPage(25);

    // Section Banner
    doc.setFillColor(235, 238, 245);
    doc.rect(margin, currentY, contentWidth, 8, 'F');
    doc.setFont('Helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(30, 41, 59);
    doc.text(`SECTION: ${secName.toUpperCase()}`, margin + 4, currentY + 5.5);
    currentY += 12;

    secQuestions.forEach(q => {
      doc.setFont('Helvetica', 'bold');
      doc.setFontSize(10);
      doc.setTextColor(15, 23, 42);

      const qLabel = `${globalQuestionNumber}. `;
      const splitQuestion = doc.splitTextToSize(q.question, contentWidth - 12);
      const questionLines = splitQuestion.length;

      const answerSpaceHeight = q.questionType === 'critical-analysis' ? 35 : (q.questionType === 'short-answer' ? 22 : 12);
      const totalBlockHeight = questionLines * 5 + answerSpaceHeight + 8;

      checkAddPage(totalBlockHeight);

      doc.text(qLabel, margin, currentY);
      doc.setFont('Helvetica', 'normal');
      doc.text(splitQuestion, margin + 8, currentY);

      currentY += questionLines * 5 + 3;

      if (q.questionType === 'multiple-choice' || q.questionType === 'true-false') {
        if (q.options) {
          q.options.forEach((opt, optIdx) => {
            const letter = String.fromCharCode(65 + optIdx);
            doc.setFontSize(9);
            doc.text(`[   ]  ${letter}.  ${opt}`, margin + 12, currentY);
            currentY += 5;
          });
        }
      } else {
        // Ruling lines for student written answer
        const lineCount = q.questionType === 'critical-analysis' ? 6 : 4;
        doc.setDrawColor(220, 224, 230);
        doc.setLineWidth(0.2);

        for (let l = 0; l < lineCount; l++) {
          doc.line(margin + 8, currentY + (l * 5.5), pageWidth - margin, currentY + (l * 5.5));
        }
        currentY += lineCount * 5.5 + 4;
      }

      globalQuestionNumber++;
      currentY += 4;
    });

    currentY += 6;
  });

  // Apply page header/footer to page 1 as well
  const totalPages = doc.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setFont('Helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(120, 120, 120);
    doc.text('UNIVERSITY PRACTICE EXAMINATION', margin, 12);
    doc.text(examTitle.toUpperCase(), pageWidth - margin, 12, { align: 'right' });
    doc.setDrawColor(200, 200, 200);
    doc.setLineWidth(0.3);
    doc.line(margin, 14, pageWidth - margin, 14);

    doc.line(margin, pageHeight - 12, pageWidth - margin, pageHeight - 12);
    doc.text(`Page ${i} of ${totalPages}`, pageWidth - margin, pageHeight - 7, { align: 'right' });
    doc.text('CONFIDENTIAL — DO NOT DISTRIBUTE', margin, pageHeight - 7);
  }

  // Save PDF file
  const safeFilename = `${examTitle.replace(/[^a-z0-9]/gi, '_')}_Paper.pdf`;
  doc.save(safeFilename);
}
