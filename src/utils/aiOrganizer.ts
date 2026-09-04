import type { Assignment, AssignmentSection } from '../types';

interface TopicTemplateItem {
  title: string;
  headingLevel: 1 | 2 | 3;
}

const TEMPLATES: Record<string, TopicTemplateItem[]> = {
  'Essay': [
    { title: 'Introduction & Thesis Statement', headingLevel: 1 },
    { title: 'Background & Context', headingLevel: 2 },
    { title: 'Primary Argument & Theoretical Basis', headingLevel: 1 },
    { title: 'Supporting Evidence & Key Findings', headingLevel: 2 },
    { title: 'Case Example Analysis', headingLevel: 3 },
    { title: 'Counter-Arguments & Critical Evaluation', headingLevel: 2 },
    { title: 'Synthesis & Discussion', headingLevel: 1 },
    { title: 'Conclusion & Final Insights', headingLevel: 1 },
  ],
  'Report': [
    { title: 'Executive Summary', headingLevel: 1 },
    { title: 'Introduction & Scope', headingLevel: 1 },
    { title: 'Background Context', headingLevel: 2 },
    { title: 'Methodology & Data Sources', headingLevel: 1 },
    { title: 'Key Findings & Analytical Results', headingLevel: 1 },
    { title: 'Primary Observations', headingLevel: 2 },
    { title: 'Detailed Sub-Analysis', headingLevel: 3 },
    { title: 'Discussion & Implications', headingLevel: 1 },
    { title: 'Strategic Recommendations', headingLevel: 1 },
    { title: 'Conclusion', headingLevel: 1 },
  ],
  'Research Assignment': [
    { title: 'Abstract', headingLevel: 1 },
    { title: 'Introduction', headingLevel: 1 },
    { title: 'Research Questions & Objectives', headingLevel: 2 },
    { title: 'Literature Review', headingLevel: 1 },
    { title: 'Theoretical Framework', headingLevel: 2 },
    { title: 'Core Concepts', headingLevel: 3 },
    { title: 'Methodology', headingLevel: 1 },
    { title: 'Results & Data Analysis', headingLevel: 1 },
    { title: 'Discussion of Findings', headingLevel: 1 },
    { title: 'Conclusion & Future Scope', headingLevel: 1 },
  ],
  'Literature Review': [
    { title: 'Introduction & Scope of Review', headingLevel: 1 },
    { title: 'Search Strategy & Selection Criteria', headingLevel: 2 },
    { title: 'Theoretical Foundations', headingLevel: 1 },
    { title: 'Major Themes in Existing Literature', headingLevel: 1 },
    { title: 'Theme A: Conceptual Perspectives', headingLevel: 2 },
    { title: 'Specific Paradigm Examination', headingLevel: 3 },
    { title: 'Theme B: Empirical Evidence', headingLevel: 2 },
    { title: 'Critical Evaluation & Gaps in Literature', headingLevel: 1 },
    { title: 'Conclusion & Future Directions', headingLevel: 1 },
  ],
  'Case Study': [
    { title: 'Introduction & Problem Statement', headingLevel: 1 },
    { title: 'Case Background & Organizational Profile', headingLevel: 1 },
    { title: 'Contextual Factors', headingLevel: 2 },
    { title: 'Analysis & Evaluation', headingLevel: 1 },
    { title: 'Core Issues & Key Challenges', headingLevel: 2 },
    { title: 'Root Cause Breakdown', headingLevel: 3 },
    { title: 'Comparative Industry Benchmarks', headingLevel: 2 },
    { title: 'Discussion & Lessons Learned', headingLevel: 1 },
    { title: 'Recommendations & Action Plan', headingLevel: 1 },
    { title: 'Conclusion', headingLevel: 1 },
  ],
  'Lab Report': [
    { title: 'Abstract', headingLevel: 1 },
    { title: 'Introduction & Hypothesis', headingLevel: 1 },
    { title: 'Theoretical Principles', headingLevel: 2 },
    { title: 'Materials & Methods', headingLevel: 1 },
    { title: 'Experimental Procedure', headingLevel: 2 },
    { title: 'Safety Protocols & Controls', headingLevel: 3 },
    { title: 'Results & Observations', headingLevel: 1 },
    { title: 'Discussion & Data Interpretation', headingLevel: 1 },
    { title: 'Conclusion', headingLevel: 1 },
  ],
};

/**
 * AI Auto-Organizer Plugin Service
 * Smartly organizes assignment topic and existing content into structured H1 (Main Topic), H2 (Subtopic), H3 (Minor Topic) sections.
 */
export function autoOrganizeStructure(assignment: Assignment): AssignmentSection[] {
  const type = assignment.assignmentType || 'Essay';
  const template = TEMPLATES[type] || TEMPLATES['Essay'];

  // Collect all raw text from current sections
  const existingTexts = assignment.sections.map(s => s.originalText.trim()).filter(Boolean);
  const combinedText = existingTexts.join('\n\n');

  // Distribute combined text across generated sections
  const paragraphs = combinedText.split('\n\n').filter(Boolean);

  const organizedSections: AssignmentSection[] = template.map((item, idx) => {
    let assignedText = '';

    if (paragraphs.length > 0) {
      if (idx === 0) {
        // First paragraph to introduction
        assignedText = paragraphs[0];
      } else if (idx === template.length - 1 && paragraphs.length > 1) {
        // Last paragraph to conclusion
        assignedText = paragraphs[paragraphs.length - 1];
      } else {
        // Distribute remaining paragraphs round-robin
        const pIndex = 1 + ((idx - 1) % Math.max(1, paragraphs.length - 2));
        assignedText = paragraphs[pIndex] || '';
      }
    }

    return {
      id: `auto-sec-${Date.now()}-${idx}`,
      title: item.title,
      headingLevel: item.headingLevel,
      originalText: assignedText,
      isCustomHeading: false,
    };
  });

  return organizedSections;
}

/**
 * Helper to compute section hierarchical numbers (e.g. 1., 1.1, 1.1.1)
 */
export interface SectionNumberInfo {
  sectionId: string;
  numberLabel: string;
  headingLevel: 1 | 2 | 3;
}

export function computeHierarchicalNumbers(sections: AssignmentSection[]): Map<string, string> {
  const labelMap = new Map<string, string>();

  let mainCount = 0;
  let subCount = 0;
  let minorCount = 0;

  sections.forEach((sec) => {
    if (sec.headingLevel === 1) {
      mainCount++;
      subCount = 0;
      minorCount = 0;
      labelMap.set(sec.id, `${mainCount}.`);
    } else if (sec.headingLevel === 2) {
      if (mainCount === 0) mainCount = 1;
      subCount++;
      minorCount = 0;
      labelMap.set(sec.id, `${mainCount}.${subCount}`);
    } else {
      if (mainCount === 0) mainCount = 1;
      if (subCount === 0) subCount = 1;
      minorCount++;
      labelMap.set(sec.id, `${mainCount}.${subCount}.${minorCount}`);
    }
  });

  return labelMap;
}
