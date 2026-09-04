export type AssignmentType =
  | 'Essay'
  | 'Report'
  | 'Research Assignment'
  | 'Literature Review'
  | 'Case Study'
  | 'Lab Report'
  | 'Reflective Assignment'
  | 'Presentation Document'
  | 'Coursework'
  | 'Other';

export type ReferencingStyle =
  | 'APA 7th Edition'
  | 'Harvard'
  | 'MLA 9th Edition'
  | 'Chicago'
  | 'IEEE'
  | 'Vancouver'
  | 'AMA'
  | 'OSCOLA'
  | 'Custom';

export type CitationStylePreference =
  | 'Author-date'
  | 'Numbered'
  | 'Footnotes'
  | 'Custom';

export type FontFamily = 'Times New Roman' | 'Arial' | 'Calibri' | 'Aptos' | 'Georgia';
export type FontSize = '10pt' | '11pt' | '12pt' | '14pt';
export type LineSpacing = '1.0' | '1.15' | '1.5' | '2.0';
export type TextAlignment = 'Left' | 'Justified';
export type PageMargin = 'Normal (2.54 cm)' | 'Narrow (1.27 cm)' | 'Moderate' | 'Wide';
export type PageSize = 'A4' | 'Letter';
export type PageNumbering = 'Bottom center' | 'Bottom right' | 'Top right' | 'None';

export interface FormattingSettings {
  fontFamily: FontFamily;
  fontSize: FontSize;
  lineSpacing: LineSpacing;
  alignment: TextAlignment;
  margin: PageMargin;
  pageSize: PageSize;
  pageNumbering: PageNumbering;
  includeCoverPage: boolean;
  includeTableOfContents: boolean;
}

export interface AssignmentSection {
  id: string;
  title: string;
  headingLevel: 1 | 2 | 3;
  originalText: string;
  isCustomHeading?: boolean;
}

export interface ReferenceSource {
  id: string;
  fileName?: string;
  fileType?: string;
  authors: string[];
  year: string;
  title: string;
  journalOrPublisher: string;
  volume?: string;
  issue?: string;
  pages?: string;
  doi?: string;
  url?: string;
  missingFields: string[];
  extractionStatus: 'extracted' | 'incomplete' | 'manual';
}

export interface AssignmentVersion {
  id: string;
  versionNumber: number;
  timestamp: string;
  note: string;
  sections: AssignmentSection[];
  references: ReferenceSource[];
  formatting: FormattingSettings;
}

export interface AuditLogItem {
  id: string;
  timestamp: string;
  action: string;
  from?: string;
  to?: string;
  details: string;
}

export interface RealZeroGPTResult {
  source: string;
  overallScore: number;
  verdictType: 'human' | 'mixed' | 'ai';
  verdictHeadline: string;
  highlightedSentences: string[];
  rawStats: string[];
  sentences: Array<{ text: string; isAi: boolean }>;
  percentageRaw: string;
  scrapedAt: string;
}

export interface Assignment {
  id: string;
  title: string;
  topic: string;
  institution: string;
  faculty: string;
  courseName: string;
  courseCode: string;
  studentName: string;
  studentId: string;
  instructorName: string;
  submissionDate: string;
  targetWordCount: number;
  assignmentType: AssignmentType;
  referencingStyle: ReferencingStyle;
  citationStylePreference: CitationStylePreference;
  formatting: FormattingSettings;
  sections: AssignmentSection[];
  references: ReferenceSource[];
  createdAt: string;
  updatedAt: string;
  contentPreservation: boolean;
  versions: AssignmentVersion[];
  auditLogs: AuditLogItem[];
  latestZeroGPTResult?: RealZeroGPTResult;
}

export interface UniversityTemplate {
  id: string;
  name: string;
  institution: string;
  description: string;
  formatting: FormattingSettings;
  defaultReferencingStyle: ReferencingStyle;
}
