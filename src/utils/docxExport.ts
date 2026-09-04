import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  HeadingLevel,
  AlignmentType,
  PageBreak,
  Footer,
  Header,
  PageNumber,
  TabStopType,
  TabStopPosition,
  LeaderType
} from 'docx';
import type { Assignment } from '../types';
import { formatReferenceItem } from './references';
import { computeHierarchicalNumbers } from './aiOrganizer';

export async function generateDocxBlob(assignment: Assignment): Promise<Blob> {
  const { formatting, sections, references, referencingStyle } = assignment;

  const fontName = formatting.fontFamily || 'Times New Roman';

  // 1 pt = 2 half-points in docx
  const sizeMap: Record<string, number> = {
    '10pt': 20,
    '11pt': 22,
    '12pt': 24,
    '14pt': 28
  };
  const bodyFontSize = sizeMap[formatting.fontSize] || 24; // 12pt default

  // Calculate line spacing in dxa (240 dxa = 1.0 line spacing)
  const lineSpacingNum = parseFloat(formatting.lineSpacing || '1.5');
  const lineSpacingDxa = Math.round(lineSpacingNum * 240);

  // Margins in dxa (1 inch = 1440 dxa)
  const marginMap: Record<string, { top: number; bottom: number; left: number; right: number }> = {
    'Normal (2.54 cm)': { top: 1440, bottom: 1440, left: 1440, right: 1440 },
    'Narrow (1.27 cm)': { top: 720, bottom: 720, left: 720, right: 720 },
    'Moderate': { top: 1080, bottom: 1080, left: 1440, right: 1440 },
    'Wide': { top: 1440, bottom: 1440, left: 2160, right: 2160 }
  };
  const margins = marginMap[formatting.margin] || { top: 1440, bottom: 1440, left: 1440, right: 1440 };

  // Page width / height (A4 vs Letter)
  const isLetter = formatting.pageSize === 'Letter';
  const pageWidth = isLetter ? 12240 : 11906;
  const pageHeight = isLetter ? 15840 : 16838;

  // Hierarchical numbering map (1., 1.1, 1.1.1)
  const numberMap = computeHierarchicalNumbers(sections);

  const docParagraphs: Paragraph[] = [];

  // Calculate page numbers for TOC
  let currentPage = 1;
  const coverPageEnabled = formatting.includeCoverPage;
  const tocEnabled = formatting.includeTableOfContents;

  if (coverPageEnabled) currentPage++;
  if (tocEnabled) currentPage++;

  const startBodyPage = currentPage;

  // ─────────────────────────────────────────────────────────────
  // 1. COVER PAGE
  // ─────────────────────────────────────────────────────────────
  if (coverPageEnabled) {
    // Institution Header
    docParagraphs.push(
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { before: 360, after: 120 },
        children: [
          new TextRun({
            text: assignment.institution ? assignment.institution.toUpperCase() : 'UNIVERSITY ASSIGNMENT',
            bold: true,
            size: bodyFontSize + 8,
            font: fontName,
            color: '000000'
          })
        ]
      })
    );

    // Faculty Subtitle
    if (assignment.faculty) {
      docParagraphs.push(
        new Paragraph({
          alignment: AlignmentType.CENTER,
          spacing: { after: 1200 },
          children: [
            new TextRun({
              text: assignment.faculty,
              italics: true,
              size: bodyFontSize,
              font: fontName,
              color: '333333'
            })
          ]
        })
      );
    } else {
      docParagraphs.push(
        new Paragraph({
          alignment: AlignmentType.CENTER,
          spacing: { after: 1200 },
          children: [new TextRun({ text: '', font: fontName })]
        })
      );
    }

    // Title & Topic (Centered in page)
    docParagraphs.push(
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { before: 1200, after: 280 },
        children: [
          new TextRun({
            text: assignment.title || 'Untitled Assignment',
            bold: true,
            size: bodyFontSize + 14,
            font: fontName,
            color: '000000'
          })
        ]
      })
    );

    if (assignment.topic) {
      docParagraphs.push(
        new Paragraph({
          alignment: AlignmentType.CENTER,
          spacing: { after: 1800 },
          children: [
            new TextRun({
              text: `Topic: ${assignment.topic}`,
              italics: true,
              size: bodyFontSize + 2,
              font: fontName,
              color: '444444'
            })
          ]
        })
      );
    } else {
      docParagraphs.push(
        new Paragraph({
          alignment: AlignmentType.CENTER,
          spacing: { after: 1800 },
          children: [new TextRun({ text: '', font: fontName })]
        })
      );
    }

    // Student & Submission Metadata
    if (assignment.studentName) {
      docParagraphs.push(
        new Paragraph({
          alignment: AlignmentType.CENTER,
          spacing: { before: 1800, after: 120 },
          children: [
            new TextRun({
              text: `Submitted by: ${assignment.studentName}`,
              bold: true,
              size: bodyFontSize + 2,
              font: fontName,
              color: '000000'
            })
          ]
        })
      );
    }

    if (assignment.studentId) {
      docParagraphs.push(
        new Paragraph({
          alignment: AlignmentType.CENTER,
          spacing: { after: 120 },
          children: [
            new TextRun({
              text: `Student ID: ${assignment.studentId}`,
              size: bodyFontSize,
              font: fontName,
              color: '000000'
            })
          ]
        })
      );
    }

    if (assignment.courseName || assignment.courseCode) {
      const courseText = [assignment.courseCode, assignment.courseName].filter(Boolean).join(' - ');
      docParagraphs.push(
        new Paragraph({
          alignment: AlignmentType.CENTER,
          spacing: { after: 120 },
          children: [
            new TextRun({
              text: `Course: ${courseText}`,
              size: bodyFontSize,
              font: fontName,
              color: '000000'
            })
          ]
        })
      );
    }

    if (assignment.instructorName) {
      docParagraphs.push(
        new Paragraph({
          alignment: AlignmentType.CENTER,
          spacing: { after: 120 },
          children: [
            new TextRun({
              text: `Lecturer: ${assignment.instructorName}`,
              size: bodyFontSize,
              font: fontName,
              color: '000000'
            })
          ]
        })
      );
    }

    if (assignment.submissionDate) {
      docParagraphs.push(
        new Paragraph({
          alignment: AlignmentType.CENTER,
          spacing: { after: 360 },
          children: [
            new TextRun({
              text: `Date: ${assignment.submissionDate}`,
              size: bodyFontSize,
              font: fontName,
              color: '000000'
            })
          ]
        })
      );
    }

    // Page Break after Cover Page
    docParagraphs.push(new Paragraph({ children: [new PageBreak()] }));
  }

  // ─────────────────────────────────────────────────────────────
  // 2. TABLE OF CONTENTS
  // ─────────────────────────────────────────────────────────────
  if (tocEnabled) {
    docParagraphs.push(
      new Paragraph({
        heading: HeadingLevel.HEADING_1,
        spacing: { before: 360, after: 280 },
        children: [
          new TextRun({
            text: 'Table of Contents',
            bold: true,
            size: bodyFontSize + 6,
            font: fontName,
            color: '000000'
          })
        ]
      })
    );

    sections.forEach((sec) => {
      const numLabel = numberMap.get(sec.id) || '';
      const indentDxa = sec.headingLevel === 1 ? 0 : sec.headingLevel === 2 ? 360 : 720;
      const isH1 = sec.headingLevel === 1;
      const isH3 = sec.headingLevel === 3;

      docParagraphs.push(
        new Paragraph({
          indent: { left: indentDxa },
          tabStops: [
            {
              type: TabStopType.RIGHT,
              position: TabStopPosition.MAX,
              leader: LeaderType.DOT
            }
          ],
          spacing: { after: 120, line: 360 },
          children: [
            new TextRun({
              text: `${numLabel} ${sec.title}`,
              bold: isH1,
              italics: isH3,
              font: fontName,
              size: bodyFontSize,
              color: '000000'
            }),
            new TextRun({
              text: `\tPage ${startBodyPage}`,
              font: fontName,
              size: bodyFontSize,
              color: '000000'
            })
          ]
        })
      );
    });

    if (references.length > 0) {
      docParagraphs.push(
        new Paragraph({
          tabStops: [
            {
              type: TabStopType.RIGHT,
              position: TabStopPosition.MAX,
              leader: LeaderType.DOT
            }
          ],
          spacing: { before: 180, after: 120, line: 360 },
          children: [
            new TextRun({
              text: `${sections.length + 1}. References`,
              bold: true,
              font: fontName,
              size: bodyFontSize,
              color: '000000'
            }),
            new TextRun({
              text: `\tPage ${startBodyPage}`,
              font: fontName,
              size: bodyFontSize,
              color: '000000'
            })
          ]
        })
      );
    }

    // Page Break after TOC
    docParagraphs.push(new Paragraph({ children: [new PageBreak()] }));
  }

  // ─────────────────────────────────────────────────────────────
  // 3. BODY SECTIONS (H1 MAIN TOPIC, H2 SUBTOPIC, H3 MINOR TOPIC)
  // ─────────────────────────────────────────────────────────────
  sections.forEach((sec) => {
    const numLabel = numberMap.get(sec.id) || '';
    let headingLevel: (typeof HeadingLevel)[keyof typeof HeadingLevel] = HeadingLevel.HEADING_1;
    let headingSize = bodyFontSize + 6;
    let isItalic = false;
    let sectionIndentDxa = 0;

    if (sec.headingLevel === 2) {
      headingLevel = HeadingLevel.HEADING_2;
      headingSize = bodyFontSize + 2;
      sectionIndentDxa = 360; // 0.25 inch indent for subtopics
    } else if (sec.headingLevel === 3) {
      headingLevel = HeadingLevel.HEADING_3;
      headingSize = bodyFontSize;
      isItalic = true;
      sectionIndentDxa = 720; // 0.5 inch indent for minor topics
    }

    // Section Heading Paragraph
    docParagraphs.push(
      new Paragraph({
        heading: headingLevel,
        indent: { left: sectionIndentDxa },
        spacing: { before: 360, after: 180 },
        children: [
          new TextRun({
            text: `${numLabel} ${sec.title}`,
            bold: true,
            italics: isItalic,
            size: headingSize,
            font: fontName,
            color: '000000'
          })
        ]
      })
    );

    // Section Text Paragraphs
    const paragraphs = sec.originalText ? sec.originalText.split('\n\n').filter(Boolean) : [];
    if (paragraphs.length > 0) {
      paragraphs.forEach((pText) => {
        docParagraphs.push(
          new Paragraph({
            alignment: formatting.alignment === 'Justified' ? AlignmentType.BOTH : AlignmentType.LEFT,
            indent: { left: sectionIndentDxa },
            spacing: { after: 200, line: lineSpacingDxa },
            children: [
              new TextRun({
                text: pText.trim(),
                font: fontName,
                size: bodyFontSize,
                color: '000000'
              })
            ]
          })
        );
      });
    }
  });

  // ─────────────────────────────────────────────────────────────
  // 4. REFERENCES SECTION
  // ─────────────────────────────────────────────────────────────
  if (references.length > 0) {
    docParagraphs.push(
      new Paragraph({
        heading: HeadingLevel.HEADING_1,
        spacing: { before: 480, after: 240 },
        children: [
          new TextRun({
            text: 'References',
            bold: true,
            size: bodyFontSize + 6,
            font: fontName,
            color: '000000'
          })
        ]
      })
    );

    references.forEach((ref) => {
      const formattedRefStr = formatReferenceItem(ref, referencingStyle);
      docParagraphs.push(
        new Paragraph({
          alignment: AlignmentType.LEFT,
          // Academic hanging indent: left indent 720 dxa (0.5 in), hanging 720 dxa
          indent: { left: 720, hanging: 720 },
          spacing: { after: 200, line: 360 },
          children: [
            new TextRun({
              text: formattedRefStr,
              font: fontName,
              size: bodyFontSize,
              color: '000000'
            })
          ]
        })
      );
    });
  }

  // ─────────────────────────────────────────────────────────────
  // 5. FOOTER & HEADER CONFIGURATION
  // ─────────────────────────────────────────────────────────────
  let sectionFooter: Footer | undefined = undefined;
  let sectionHeader: Header | undefined = undefined;

  const pageNumStyle = formatting.pageNumbering;

  if (pageNumStyle === 'Bottom center' || pageNumStyle === 'Bottom right') {
    const alignment = pageNumStyle === 'Bottom center' ? AlignmentType.CENTER : AlignmentType.RIGHT;
    sectionFooter = new Footer({
      children: [
        new Paragraph({
          alignment,
          children: [
            new TextRun({ text: 'Page ', font: fontName, size: 18, color: '666666' }),
            new TextRun({ children: [PageNumber.CURRENT], font: fontName, size: 18, color: '666666' }),
            new TextRun({ text: ' of ', font: fontName, size: 18, color: '666666' }),
            new TextRun({ children: [PageNumber.TOTAL_PAGES], font: fontName, size: 18, color: '666666' })
          ]
        })
      ]
    });
  } else if (pageNumStyle === 'Top right') {
    sectionHeader = new Header({
      children: [
        new Paragraph({
          alignment: AlignmentType.RIGHT,
          children: [
            new TextRun({ text: 'Page ', font: fontName, size: 18, color: '666666' }),
            new TextRun({ children: [PageNumber.CURRENT], font: fontName, size: 18, color: '666666' }),
            new TextRun({ text: ' of ', font: fontName, size: 18, color: '666666' }),
            new TextRun({ children: [PageNumber.TOTAL_PAGES], font: fontName, size: 18, color: '666666' })
          ]
        })
      ]
    });
  }

  // ─────────────────────────────────────────────────────────────
  // 6. BUILD DOCUMENT WITH CUSTOM STYLES & OVERRIDES
  // ─────────────────────────────────────────────────────────────
  const h1Style: any = {
    id: HeadingLevel.HEADING_1,
    name: 'Heading 1',
    basedOn: 'Normal',
    next: 'Normal',
    quickFormat: true,
    run: {
      font: fontName,
      size: bodyFontSize + 6,
      bold: true,
      color: '000000'
    },
    paragraph: {
      spacing: { before: 360, after: 180 },
      keepNext: true
    }
  };

  const h2Style: any = {
    id: HeadingLevel.HEADING_2,
    name: 'Heading 2',
    basedOn: 'Normal',
    next: 'Normal',
    quickFormat: true,
    run: {
      font: fontName,
      size: bodyFontSize + 2,
      bold: true,
      color: '000000'
    },
    paragraph: {
      spacing: { before: 240, after: 120 },
      keepNext: true
    }
  };

  const h3Style: any = {
    id: HeadingLevel.HEADING_3,
    name: 'Heading 3',
    basedOn: 'Normal',
    next: 'Normal',
    quickFormat: true,
    run: {
      font: fontName,
      size: bodyFontSize,
      bold: true,
      italics: true,
      color: '333333'
    },
    paragraph: {
      spacing: { before: 180, after: 90 },
      keepNext: true
    }
  };

  const normalStyle: any = {
    id: 'Normal',
    name: 'Normal',
    quickFormat: true,
    run: {
      font: fontName,
      size: bodyFontSize,
      color: '000000'
    }
  };

  const doc = new Document({
    styles: {
      paragraphStyles: [h1Style, h2Style, h3Style, normalStyle]
    },
    sections: [
      {
        properties: {
          page: {
            size: {
              width: pageWidth,
              height: pageHeight
            },
            margin: margins
          }
        },
        headers: sectionHeader ? { default: sectionHeader } : undefined,
        footers: sectionFooter ? { default: sectionFooter } : undefined,
        children: docParagraphs
      }
    ]
  });

  return await Packer.toBlob(doc);
}

export function downloadBlob(blob: Blob, filename: string) {
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  window.URL.revokeObjectURL(url);
  document.body.removeChild(a);
}
