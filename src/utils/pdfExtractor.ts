import * as pdfjsLib from 'pdfjs-dist';
import type { ParsedResource, ExtractedPage, ResourceSection } from '../types/practice';

// Configure pdfjs worker using cdnjs fallback to prevent bundler worker resolution errors
if (typeof window !== 'undefined' && !pdfjsLib.GlobalWorkerOptions.workerSrc) {
  pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version || '3.11.174'}/pdf.worker.min.js`;
}

/**
 * Extracts page-level text and section structure from a PDF or Text file directly in the browser.
 */
export async function extractResourceFile(file: File): Promise<ParsedResource> {
  const resourceId = `res-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
  const fileName = file.name;

  if (file.type === 'text/plain' || file.name.endsWith('.txt') || file.name.endsWith('.md')) {
    const rawText = await file.text();
    return parseRawTextFile(resourceId, fileName, rawText);
  }

  try {
    const arrayBuffer = await file.arrayBuffer();
    const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
    const pdfDoc = await loadingTask.promise;
    const numPages = pdfDoc.numPages;

    const pages: ExtractedPage[] = [];
    const sections: ResourceSection[] = [];
    let currentSection: ResourceSection | null = null;
    let fullTextAccumulator = '';

    for (let pageNum = 1; pageNum <= numPages; pageNum++) {
      const page = await pdfDoc.getPage(pageNum);
      const textContent = await page.getTextContent();

      const pageLines: string[] = [];
      let lastY: number | null = null;
      let currentLine = '';

      for (const item of textContent.items) {
        if ('str' in item) {
          const strItem = item as { str: string; transform?: number[] };
          const itemY = strItem.transform ? strItem.transform[5] : null;

          if (lastY !== null && itemY !== null && Math.abs(itemY - lastY) > 5) {
            if (currentLine.trim()) {
              pageLines.push(currentLine.trim());
            }
            currentLine = strItem.str;
          } else {
            currentLine += (currentLine ? ' ' : '') + strItem.str;
          }
          lastY = itemY;
        }
      }
      if (currentLine.trim()) {
        pageLines.push(currentLine.trim());
      }

      const pageText = pageLines.join('\n').trim();
      fullTextAccumulator += `--- PAGE ${pageNum} ---\n` + pageText + '\n\n';

      // Detect potential section heading in first few lines of page
      let detectedHeading = '';
      for (const line of pageLines.slice(0, 4)) {
        const cleanLine = line.trim();
        if (
          cleanLine.length > 3 &&
          cleanLine.length < 80 &&
          (cleanLine === cleanLine.toUpperCase() ||
            /^([0-9]+(\.[0-9]+)*|Chapter|Section|Unit|Part|Module)\b/i.test(cleanLine))
        ) {
          detectedHeading = cleanLine;
          break;
        }
      }

      if (detectedHeading) {
        if (currentSection) {
          currentSection.endPage = pageNum - 1;
          if (currentSection.endPage >= currentSection.startPage) {
            sections.push(currentSection);
          }
        }
        currentSection = {
          title: detectedHeading,
          startPage: pageNum,
          endPage: pageNum
        };
      }

      pages.push({
        pageNumber: pageNum,
        text: pageText || `[No readable text on page ${pageNum}]`,
        sectionHeading: detectedHeading || currentSection?.title
      });
    }

    if (currentSection) {
      currentSection.endPage = numPages;
      sections.push(currentSection);
    }

    // Default fallback sections if none were explicitly detected
    if (sections.length === 0 && numPages > 0) {
      const chunkSize = Math.max(1, Math.ceil(numPages / 4));
      for (let i = 0; i < numPages; i += chunkSize) {
        const start = i + 1;
        const end = Math.min(numPages, i + chunkSize);
        sections.push({
          title: `Pages ${start} - ${end}`,
          startPage: start,
          endPage: end
        });
      }
    }

    // Verify extracted text exists
    const hasReadableContent = pages.some(p => p.text.replace(/\[No readable text.*?\]/g, '').trim().length > 20);
    if (!hasReadableContent) {
      throw new Error('This PDF does not contain readable text. Please upload a text-based PDF or document.');
    }

    return {
      id: resourceId,
      name: fileName,
      pages,
      totalPages: numPages,
      sections,
      fullText: fullTextAccumulator
    };
  } catch (err: any) {
    if (err.message && err.message.includes('readable text')) {
      throw err;
    }
    console.error('PDF parsing error:', err);
    throw new Error(`Failed to extract text from PDF (${fileName}). Please make sure it is not password-protected or corrupted.`);
  }
}

function parseRawTextFile(id: string, name: string, content: string): ParsedResource {
  const paragraphs = content.split(/\n\s*\n/).filter(p => p.trim());
  const pageSize = 1500; // ~1500 chars per virtual page
  const pages: ExtractedPage[] = [];

  let currentPageText = '';
  let pageNum = 1;

  for (const para of paragraphs) {
    if ((currentPageText + para).length > pageSize && currentPageText) {
      pages.push({
        pageNumber: pageNum,
        text: currentPageText.trim()
      });
      pageNum++;
      currentPageText = para + '\n\n';
    } else {
      currentPageText += para + '\n\n';
    }
  }
  if (currentPageText.trim()) {
    pages.push({
      pageNumber: pageNum,
      text: currentPageText.trim()
    });
  }

  const sections: ResourceSection[] = [
    {
      title: 'Full Document Content',
      startPage: 1,
      endPage: Math.max(1, pages.length)
    }
  ];

  return {
    id,
    name,
    pages,
    totalPages: pages.length,
    sections,
    fullText: content
  };
}
