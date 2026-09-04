export interface ExtractedPage {
  pageNumber: number;
  text: string;
  sectionHeading?: string;
}

export interface ResourceSection {
  title: string;
  startPage: number;
  endPage: number;
}

export interface ParsedResource {
  id: string;
  name: string;
  pages: ExtractedPage[];
  totalPages: number;
  sections: ResourceSection[];
  fullText: string;
}

export type PracticeArea = 'mock-exam' | 'quizzes';
export type MockExamMode = 'full' | 'selected' | 'model';

export type QuestionSection =
  | 'Definition'
  | 'Short Answers (Brief Explain)'
  | 'Critical Analysis'
  | 'Quiz';

export type QuestionType = 'multiple-choice' | 'true-false' | 'short-answer' | 'critical-analysis';
export type QuestionDifficulty = 'Easy' | 'Medium' | 'Hard' | 'Mixed';

export interface PracticeQuestion {
  id: string;
  section: QuestionSection;
  question: string;
  questionType: QuestionType;
  difficulty?: QuestionDifficulty;
  options?: string[];
  correctAnswer: string;
  explanation: string;
  source: {
    file: string;
    page: number;
    section?: string;
  };
}

export interface MockExamConfig {
  mode: MockExamMode;
  selectedPages?: { fromPage: number; toPage: number };
  selectedSections?: string[];
  selectedQuestionCount?: number; // For Selected Part preset count (5, 10, 15, 20, etc)
  questionCounts: {
    definition: number;
    shortAnswers: number;
    criticalAnalysis: number;
  };
  totalQuestions?: number;
}

export interface QuizConfig {
  questionCount: number;
  difficulty: QuestionDifficulty;
  questionType: 'Multiple Choice' | 'True / False' | 'Mixed';
  coverEntireResource: boolean;
  selectedSections?: string[];
}

export interface StudentAnswer {
  questionId: string;
  userAnswer: string;
  answeredAt?: string;
}

export interface SubjectiveEvaluationResult {
  score: number; // 0 to 100 or scale
  isCorrect: boolean;
  feedback: string;
  missingConcepts: string[];
  sourceSupportedReasoning: string;
}

export interface ExamSessionResult {
  examTitle: string;
  resourceName: string;
  area: PracticeArea;
  mode?: MockExamMode;
  questions: PracticeQuestion[];
  userAnswers: Record<string, string>;
  evaluations: Record<string, SubjectiveEvaluationResult>;
  totalScore: number;
  maxScore: number;
  percentage: number;
  sectionBreakdown: Record<string, { correct: number; total: number }>;
  submittedAt: string;
}
