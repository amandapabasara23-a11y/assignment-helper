import type { Assignment, UniversityTemplate } from '../types';
import { syncAssignmentToSupabase } from './supabase';

const STORAGE_KEY_ASSIGNMENTS = 'assignment_builder_assignments_v1';
const STORAGE_KEY_TEMPLATES = 'assignment_builder_templates_v1';

export const DEFAULT_TEMPLATES: UniversityTemplate[] = [
  {
    id: 'tmpl-1',
    name: 'University Standard Essay',
    institution: 'Standard University',
    description: 'Times New Roman 12pt, 1.5 Line Spacing, APA 7th Edition, 2.54 cm margins.',
    formatting: {
      fontFamily: 'Times New Roman',
      fontSize: '12pt',
      lineSpacing: '1.5',
      alignment: 'Left',
      margin: 'Normal (2.54 cm)',
      pageSize: 'A4',
      pageNumbering: 'Bottom right',
      includeCoverPage: true,
      includeTableOfContents: true
    },
    defaultReferencingStyle: 'APA 7th Edition'
  },
  {
    id: 'tmpl-2',
    name: 'Academic Research Report',
    institution: 'Faculty of Science & Tech',
    description: 'Calibri 11pt, 1.15 Line Spacing, Harvard style, Justified text layout.',
    formatting: {
      fontFamily: 'Calibri',
      fontSize: '11pt',
      lineSpacing: '1.15',
      alignment: 'Justified',
      margin: 'Normal (2.54 cm)',
      pageSize: 'A4',
      pageNumbering: 'Bottom center',
      includeCoverPage: true,
      includeTableOfContents: true
    },
    defaultReferencingStyle: 'Harvard'
  },
  {
    id: 'tmpl-3',
    name: 'IEEE Engineering Paper',
    institution: 'School of Computing & Engineering',
    description: 'Arial 10pt, 1.0 Line Spacing, Numbered IEEE citations, Compact layout.',
    formatting: {
      fontFamily: 'Arial',
      fontSize: '10pt',
      lineSpacing: '1.0',
      alignment: 'Justified',
      margin: 'Narrow (1.27 cm)',
      pageSize: 'A4',
      pageNumbering: 'Bottom center',
      includeCoverPage: false,
      includeTableOfContents: false
    },
    defaultReferencingStyle: 'IEEE'
  }
];

export const SAMPLE_ASSIGNMENT: Assignment = {
  id: 'asgn-sample-1',
  title: 'Impact of Renewable Energy Technologies on Sri Lankan Rural Agriculture',
  topic: 'Analyzing solar and mini-hydro adoption in Sri Lankan agrarian communities',
  institution: 'University of Colombo',
  faculty: 'Faculty of Science',
  courseName: 'Environmental Resource Management',
  courseCode: 'ENVR-3042',
  studentName: 'Kasun Wickramasinghe',
  studentId: 'SC/2023/8892',
  instructorName: 'Dr. Anura Perera',
  submissionDate: '2026-10-15',
  targetWordCount: 2000,
  assignmentType: 'Research Assignment',
  referencingStyle: 'APA 7th Edition',
  citationStylePreference: 'Author-date',
  formatting: {
    fontFamily: 'Times New Roman',
    fontSize: '12pt',
    lineSpacing: '1.5',
    alignment: 'Left',
    margin: 'Normal (2.54 cm)',
    pageSize: 'A4',
    pageNumbering: 'Bottom right',
    includeCoverPage: true,
    includeTableOfContents: true
  },
  contentPreservation: true,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  sections: [
    {
      id: 'sec-1',
      title: 'Introduction',
      headingLevel: 1,
      originalText: 'Climate change has significantly affected agricultural production in Sri Lanka over the past decade. Agricultural activities in rural provinces rely heavily on predictable monsoonal rain patterns. The deployment of decentralized solar energy systems offers a sustainable mechanism to power micro-irrigation and post-harvest cold storage.'
    },
    {
      id: 'sec-2',
      title: 'Background and Literature Review',
      headingLevel: 1,
      originalText: 'Renewable energy infrastructure in developing agrarian economies has seen exponential growth. Previous studies demonstrate that off-grid solar photovoltaic systems reduce operational fuel expenses for smallholder farmers by up to 40%. Furthermore, community-managed mini-hydro projects in hilly terrains provide reliable energy during wet seasons.'
    },
    {
      id: 'sec-3',
      title: 'Methodology & Data Collection',
      headingLevel: 1,
      originalText: 'Data was collected across 12 farming cooperatives in the North Central Province using structured questionnaires and localized energy metering loggers. The field interviews evaluated farm yield outputs before and after the installation of solar-powered pump sets.'
    },
    {
      id: 'sec-4',
      title: 'Results and Discussion',
      headingLevel: 1,
      originalText: 'The empirical findings indicate a 28% increase in crop resilience during dry spells among farms with solar irrigation access. Additionally, post-harvest losses decreased significantly due to continuous solar-powered cold room storage units.'
    },
    {
      id: 'sec-5',
      title: 'Conclusion',
      headingLevel: 1,
      originalText: 'Integrating solar and mini-hydro solutions into Sri Lanka’s agrarian framework enhances food security and reduces dependence on imported fossil fuels. Strategic policy incentives and micro-finance credit schemes are required to accelerate rural adoption.'
    }
  ],
  references: [
    {
      id: 'ref-1',
      fileName: 'Silva_2024_Solar_Irrigation.pdf',
      authors: ['Silva, K. M.', 'Fernando, R. N.'],
      year: '2024',
      title: 'Solar Photovoltaic Micro-Irrigation for Smallholder Farmers in Tropical Asia',
      journalOrPublisher: 'Journal of Cleaner Agricultural Production',
      volume: '18',
      issue: '3',
      pages: '145-159',
      doi: '10.1016/j.jclepro.2024.03.112',
      missingFields: [],
      extractionStatus: 'extracted'
    },
    {
      id: 'ref-2',
      fileName: 'Perera_2023_Mini_Hydro.pdf',
      authors: ['Perera, A. D.'],
      year: '2023',
      title: 'Decentralized Energy Grids in Sri Lankan Agrarian Communities',
      journalOrPublisher: 'Renewable Energy Progress',
      volume: '42',
      pages: '88-102',
      missingFields: [],
      extractionStatus: 'extracted'
    }
  ],
  versions: [],
  auditLogs: [
    {
      id: 'log-1',
      timestamp: new Date().toISOString(),
      action: 'Assignment Created',
      details: 'Initialized sample research assignment.'
    }
  ]
};

export function loadAssignmentsFromStorage(): Assignment[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_ASSIGNMENTS);
    if (!raw) {
      const initial = [SAMPLE_ASSIGNMENT];
      localStorage.setItem(STORAGE_KEY_ASSIGNMENTS, JSON.stringify(initial));
      return initial;
    }
    return JSON.parse(raw);
  } catch (e) {
    console.error('Failed to load assignments', e);
    return [SAMPLE_ASSIGNMENT];
  }
}

export function saveAssignmentsToStorage(assignments: Assignment[]): void {
  try {
    localStorage.setItem(STORAGE_KEY_ASSIGNMENTS, JSON.stringify(assignments));
    // Asynchronously sync active assignments to Supabase DB if configured
    assignments.forEach(asgn => {
      syncAssignmentToSupabase(asgn).catch(() => {});
    });
  } catch (e) {
    console.error('Failed to save assignments', e);
  }
}

export function loadTemplatesFromStorage(): UniversityTemplate[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_TEMPLATES);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY_TEMPLATES, JSON.stringify(DEFAULT_TEMPLATES));
      return DEFAULT_TEMPLATES;
    }
    return JSON.parse(raw);
  } catch (e) {
    return DEFAULT_TEMPLATES;
  }
}

export function saveTemplateToStorage(template: UniversityTemplate): void {
  const current = loadTemplatesFromStorage();
  const updated = [template, ...current.filter(t => t.id !== template.id)];
  localStorage.setItem(STORAGE_KEY_TEMPLATES, JSON.stringify(updated));
}
