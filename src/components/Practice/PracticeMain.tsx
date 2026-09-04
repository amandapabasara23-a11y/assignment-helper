import React, { useState } from 'react';
import { Award, BookOpen, Zap, Loader2, ArrowLeft, AlertCircle, FileText, CheckCircle2 } from 'lucide-react';
import type {
  ParsedResource,
  PracticeArea,
  PracticeQuestion,
  MockExamConfig,
  QuizConfig,
  SubjectiveEvaluationResult
} from '../../types/practice';
import { ResourceUploader } from './ResourceUploader';
import { MockExamConfigView } from './MockExamConfigView';
import { QuizConfigView } from './QuizConfigView';
import { OnlineExamPlayer } from './OnlineExamPlayer';
import { ExamResultsView } from './ExamResultsView';
import { PdfPageModal } from './PdfPageModal';
import { generateMockExam, generateQuiz, evaluateSubjectiveAnswer } from '../../utils/geminiPracticeService';
import { generateExamPaperPdf } from '../../utils/practicePdfExport';

interface PracticeMainProps {
  onBackToHome?: () => void;
}

export const PracticeMain: React.FC<PracticeMainProps> = ({ onBackToHome }) => {
  // Global Practice state
  const [resources, setResources] = useState<ParsedResource[]>([]);
  const [selectedArea, setSelectedArea] = useState<PracticeArea | null>(null);

  type PracticeStage =
    | 'area-select'
    | 'upload'
    | 'config'
    | 'mode-choice' // Choice after generation: Write Online vs Download Paper
    | 'generating'
    | 'evaluating'
    | 'player'
    | 'results';

  const [stage, setStage] = useState<PracticeStage>('area-select');

  // Exam Data States
  const [generatedQuestions, setGeneratedQuestions] = useState<PracticeQuestion[]>([]);
  const [userAnswers, setUserAnswers] = useState<Record<string, string>>({});
  const [evaluations, setEvaluations] = useState<Record<string, SubjectiveEvaluationResult>>({});

  // Active configurations saved for "Try New Questions"
  const [activeMockConfig, setActiveMockConfig] = useState<MockExamConfig | null>(null);
  const [activeQuizConfig, setActiveQuizConfig] = useState<QuizConfig | null>(null);

  // Status & Error Messages
  const [statusMessage, setStatusMessage] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Resource Page Viewer Modal State
  const [pdfModalOpen, setPdfModalOpen] = useState<boolean>(false);
  const [modalInitialPage, setModalInitialPage] = useState<number>(1);
  const [modalHighlight, setModalHighlight] = useState<string>('');

  const primaryResource = resources[0] || null;

  // Handle Main Area Selection (Section 1)
  const handleSelectArea = (area: PracticeArea) => {
    setSelectedArea(area);
    if (resources.length === 0) {
      setStage('upload');
    } else {
      setStage('config');
    }
  };

  // Handle Mock Exam Generation
  const handleGenerateMockExam = async (config: MockExamConfig, isRetryNew = false) => {
    if (resources.length === 0) return;
    setActiveMockConfig(config);
    setErrorMessage(null);
    setStage('generating');
    setStatusMessage(
      isRetryNew
        ? 'Synthesizing genuinely new exam questions avoiding previous concepts...'
        : 'Generating source-grounded mock examination questions...'
    );

    try {
      const excluded = isRetryNew ? generatedQuestions.map(q => q.question) : [];
      const questions = await generateMockExam(resources[0], config, excluded);
      
      if (!questions || questions.length === 0) {
        throw new Error('No questions could be generated from the selected resource material.');
      }

      setGeneratedQuestions(questions);
      setUserAnswers({});
      setEvaluations({});

      if (isRetryNew) {
        setStage('player');
      } else {
        setStage('mode-choice');
      }
    } catch (err: any) {
      console.error(err);
      setErrorMessage(err.message || 'Failed to generate mock exam. Please try again.');
      setStage('config');
    }
  };

  // Handle Quiz Generation
  const handleGenerateQuiz = async (config: QuizConfig, isRetryNew = false) => {
    if (resources.length === 0) return;
    setActiveQuizConfig(config);
    setErrorMessage(null);
    setStage('generating');
    setStatusMessage(
      isRetryNew
        ? 'Synthesizing new quiz questions from lecture material...'
        : 'Generating practice quiz questions...'
    );

    try {
      const excluded = isRetryNew ? generatedQuestions.map(q => q.question) : [];
      const questions = await generateQuiz(resources[0], config, excluded);

      if (!questions || questions.length === 0) {
        throw new Error('No quiz questions could be generated from the selected material.');
      }

      setGeneratedQuestions(questions);
      setUserAnswers({});
      setEvaluations({});

      if (isRetryNew) {
        setStage('player');
      } else {
        setStage('mode-choice');
      }
    } catch (err: any) {
      console.error(err);
      setErrorMessage(err.message || 'Failed to generate quiz. Please try again.');
      setStage('config');
    }
  };

  // Handle Submission & Evaluation (Section 26 & 46)
  const handleSubmitExam = async () => {
    setStage('evaluating');
    setStatusMessage('Evaluating answers strictly against resource references...');

    const newEvaluations: Record<string, SubjectiveEvaluationResult> = {};

    for (const q of generatedQuestions) {
      if (q.questionType === 'short-answer' || q.questionType === 'critical-analysis') {
        const uAns = userAnswers[q.id] || '';
        try {
          const evalRes = await evaluateSubjectiveAnswer(q, uAns);
          newEvaluations[q.id] = evalRes;
        } catch (err) {
          console.warn(`Evaluation failed for question ${q.id}:`, err);
        }
      }
    }

    setEvaluations(newEvaluations);
    setStage('results');
  };

  // Handle Redo Exam (Section 29 & 32): SAME QUESTIONS, NO API CALL
  const handleRedoExam = () => {
    setUserAnswers({});
    setEvaluations({});
    setStage('player');
  };

  // Handle Try New Questions (Section 30 & 31): NEW QUESTIONS, SAME SCOPE, 1 API CALL
  const handleTryNewQuestions = () => {
    if (selectedArea === 'mock-exam' && activeMockConfig) {
      handleGenerateMockExam(activeMockConfig, true);
    } else if (selectedArea === 'quizzes' && activeQuizConfig) {
      handleGenerateQuiz(activeQuizConfig, true);
    }
  };

  // Handle PDF Export
  const handleDownloadPaper = () => {
    const title = selectedArea === 'mock-exam' ? 'Mock Examination Paper' : 'Practice Quiz Paper';
    generateExamPaperPdf(title, primaryResource?.name || 'Course Resource', generatedQuestions);
  };

  // Handle Open Resource Viewer Modal (Section 28)
  const handleOpenResourcePage = (page: number, highlight?: string) => {
    setModalInitialPage(page);
    setModalHighlight(highlight || '');
    setPdfModalOpen(true);
  };

  return (
    <div style={{ padding: '2rem 1.5rem', minHeight: '85vh' }}>
      {/* SECTION 1: CORE PRACTICE AREA SELECTOR */}
      {stage === 'area-select' && (
        <div style={{ maxWidth: '860px', margin: '0 auto' }} className="animate-fade-in">
          {onBackToHome && (
            <div style={{ marginBottom: '1.5rem' }}>
              <button onClick={onBackToHome} className="btn btn-sm btn-ghost">
                <ArrowLeft size={16} /> Back to Home
              </button>
            </div>
          )}
          <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
            <span
              className="badge badge-indigo"
              style={{
                marginBottom: '1rem',
                padding: '0.5rem 1.25rem',
                fontSize: '0.78rem',
                fontWeight: 700,
                letterSpacing: '0.05em'
              }}
            >
              RESOURCE-BASED MOCK EXAMS & QUIZZES
            </span>
            <h1
              className="display-1"
              style={{
                fontSize: 'clamp(2.4rem, 4vw, 3.2rem)',
                fontWeight: 800,
                marginBottom: '0.75rem',
                letterSpacing: '-0.02em',
                color: 'var(--text-1)'
              }}
            >
              Assignly Practice Space
            </h1>
            <p className="body-lg" style={{ color: 'var(--text-3)', maxWidth: '640px', margin: '0 auto', fontSize: '1.05rem', lineHeight: 1.6 }}>
              Study directly from your university lecture material. Practice complete exams or test your retention with rapid quizzes.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '1.75rem' }}>
            {/* AREA 1: MOCK EXAM */}
            <div
              className="card card-hover-effect"
              style={{
                padding: '2.5rem 2rem',
                border: '2px solid var(--border)',
                borderRadius: '24px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                background: 'var(--surface)',
                boxShadow: 'var(--shadow-sm)',
                transition: 'all 0.25s cubic-bezier(0.16, 1, 0.3, 1)'
              }}
            >
              <div>
                <div
                  style={{
                    width: 58,
                    height: 58,
                    borderRadius: '16px',
                    background: 'var(--accent-indigo-soft)',
                    color: 'var(--accent-indigo)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: '1.5rem',
                    boxShadow: 'inset 0 0 0 1px rgba(79, 70, 229, 0.15)'
                  }}
                >
                  <Award size={32} />
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.5rem' }}>
                  <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-1)', margin: 0 }}>MOCK EXAM</h2>
                  <span className="badge badge-indigo" style={{ fontSize: '0.7rem' }}>Full & Model</span>
                </div>

                <p className="body-md" style={{ color: 'var(--text-3)', lineHeight: 1.65, fontSize: '0.92rem' }}>
                  Practice complete university-level exams synthesized directly from your lecture resources. Supports Full Exam, Selected Part, and Model Exam modes.
                </p>
              </div>

              <div style={{ marginTop: '2.25rem' }}>
                <button
                  onClick={() => handleSelectArea('mock-exam')}
                  className="btn btn-primary btn-xl"
                  style={{ width: '100%', borderRadius: '12px', justifyContent: 'center' }}
                >
                  <BookOpen size={18} />
                  <span>Open Mock Exam Workspace</span>
                </button>
              </div>
            </div>

            {/* AREA 2: QUIZZES */}
            <div
              className="card card-hover-effect"
              style={{
                padding: '2.5rem 2rem',
                border: '2px solid var(--border)',
                borderRadius: '24px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                background: 'var(--surface)',
                boxShadow: 'var(--shadow-sm)',
                transition: 'all 0.25s cubic-bezier(0.16, 1, 0.3, 1)'
              }}
            >
              <div>
                <div
                  style={{
                    width: 58,
                    height: 58,
                    borderRadius: '16px',
                    background: 'var(--accent-emerald-soft)',
                    color: 'var(--accent-emerald)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: '1.5rem',
                    boxShadow: 'inset 0 0 0 1px rgba(16, 185, 129, 0.15)'
                  }}
                >
                  <Zap size={32} />
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.5rem' }}>
                  <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-1)', margin: 0 }}>QUIZZES</h2>
                  <span className="badge badge-emerald" style={{ fontSize: '0.7rem' }}>Rapid Retention</span>
                </div>

                <p className="body-md" style={{ color: 'var(--text-3)', lineHeight: 1.65, fontSize: '0.92rem' }}>
                  Test your knowledge quickly with instant multiple-choice and true/false quizzes generated strictly from your uploaded materials.
                </p>
              </div>

              <div style={{ marginTop: '2.25rem' }}>
                <button
                  onClick={() => handleSelectArea('quizzes')}
                  className="btn btn-primary btn-xl"
                  style={{
                    width: '100%',
                    borderRadius: '12px',
                    justifyContent: 'center',
                    background: 'var(--accent-emerald)',
                    borderColor: 'var(--accent-emerald)'
                  }}
                >
                  <Zap size={18} />
                  <span>Open Quizzes Workspace</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* STAGE: RESOURCE UPLOAD */}
      {stage === 'upload' && (
        <div>
          <div style={{ maxWidth: '840px', margin: '0 auto 1.25rem auto' }}>
            <button onClick={() => setStage('area-select')} className="btn btn-sm btn-ghost">
              <ArrowLeft size={16} /> Back to Practice Selection
            </button>
          </div>
          <ResourceUploader
            resources={resources}
            setResources={setResources}
            onContinue={() => setStage('config')}
          />
        </div>
      )}

      {/* STAGE: CONFIGURATION (MOCK EXAM vs QUIZ) */}
      {stage === 'config' && (
        <div>
          {errorMessage && (
            <div
              className="card animate-fade-in"
              style={{
                maxWidth: '840px',
                margin: '0 auto 1.5rem auto',
                padding: '1.15rem 1.35rem',
                background: 'var(--accent-rose-soft)',
                border: '1.5px solid var(--accent-rose)',
                borderRadius: '14px',
                color: 'var(--accent-rose)',
                display: 'flex',
                alignItems: 'center',
                gap: '0.85rem'
              }}
            >
              <AlertCircle size={22} style={{ flexShrink: 0 }} />
              <span className="body-sm" style={{ fontWeight: 600, fontSize: '0.92rem' }}>{errorMessage}</span>
            </div>
          )}

          {selectedArea === 'mock-exam' ? (
            <MockExamConfigView
              resources={resources}
              onBack={() => setStage('upload')}
              onGenerateExam={handleGenerateMockExam}
            />
          ) : (
            <QuizConfigView
              resources={resources}
              onBack={() => setStage('upload')}
              onGenerateQuiz={handleGenerateQuiz}
            />
          )}
        </div>
      )}

      {/* STAGE: GENERATING / EVALUATING LOADING SCREEN */}
      {(stage === 'generating' || stage === 'evaluating') && (
        <div style={{ maxWidth: '520px', margin: '5rem auto' }} className="animate-fade-in">
          <div className="card" style={{ padding: '3rem 2rem', textAlign: 'center', borderRadius: '24px', background: 'var(--surface)', boxShadow: 'var(--shadow-md)' }}>
            <div
              style={{
                width: 72,
                height: 72,
                borderRadius: '50%',
                background: 'var(--accent-indigo-soft)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 1.5rem auto'
              }}
            >
              <Loader2 className="animate-spin" size={38} color="var(--accent-indigo)" />
            </div>
            <h3 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-1)', marginBottom: '0.5rem' }}>
              {stage === 'generating' ? 'Synthesizing Examination Paper' : 'Evaluating Answers'}
            </h3>
            <p className="body-md" style={{ color: 'var(--text-3)', fontSize: '0.95rem', maxWidth: '380px', margin: '0 auto', lineHeight: 1.5 }}>
              {statusMessage}
            </p>
          </div>
        </div>
      )}

      {/* STAGE: MODE CHOICE AFTER GENERATION (Fixes screenshot styling issue!) */}
      {stage === 'mode-choice' && (
        <div style={{ maxWidth: '640px', margin: '3rem auto' }} className="animate-fade-in">
          <div
            className="card"
            style={{
              padding: '2.5rem 2.25rem',
              background: 'var(--surface)',
              borderRadius: '24px',
              border: '1px solid var(--border)',
              boxShadow: 'var(--shadow-md)',
              textAlign: 'center'
            }}
          >
            <div style={{ marginBottom: '2rem' }}>
              <span
                className="badge badge-emerald"
                style={{
                  marginBottom: '1rem',
                  padding: '0.45rem 1.15rem',
                  fontSize: '0.78rem',
                  fontWeight: 700,
                  letterSpacing: '0.05em'
                }}
              >
                EXAM CREATION SUCCESSFUL
              </span>
              <h2 style={{ fontSize: '2.1rem', fontWeight: 800, color: 'var(--text-1)', marginBottom: '0.5rem', lineHeight: 1.2 }}>
                How would you like to take your exam?
              </h2>
              <p className="body-md" style={{ color: 'var(--text-3)', maxWidth: '460px', margin: '0 auto', fontSize: '0.95rem', lineHeight: 1.5 }}>
                Your source-grounded practice paper is ready. Choose your preferred practice method below.
              </p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.25rem', marginTop: '1.75rem' }}>
              {/* Option 1: WRITE ONLINE */}
              <div
                onClick={() => setStage('player')}
                className="card-hover-effect"
                style={{
                  padding: '1.85rem 1.25rem',
                  borderRadius: '18px',
                  background: 'var(--accent-indigo)',
                  color: 'white',
                  cursor: 'pointer',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.85rem',
                  boxShadow: '0 8px 24px rgba(79, 70, 229, 0.28)',
                  transition: 'all 0.22s ease'
                }}
              >
                <div
                  style={{
                    width: 50,
                    height: 50,
                    borderRadius: '50%',
                    background: 'rgba(255, 255, 255, 0.22)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  <CheckCircle2 size={26} color="white" />
                </div>
                <div>
                  <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'white', margin: 0, letterSpacing: '0.02em' }}>WRITE ONLINE</h3>
                  <p style={{ fontSize: '0.8rem', color: 'rgba(255, 255, 255, 0.88)', margin: '0.4rem 0 0 0', lineHeight: 1.4, fontWeight: 500 }}>
                    Interactive in-app exam player
                  </p>
                </div>
              </div>

              {/* Option 2: DOWNLOAD FULL PAPER */}
              <div
                onClick={() => {
                  handleDownloadPaper();
                  setStage('player');
                }}
                className="card-hover-effect"
                style={{
                  padding: '1.85rem 1.25rem',
                  borderRadius: '18px',
                  background: 'var(--surface-inset)',
                  border: '2px solid var(--border)',
                  color: 'var(--text-1)',
                  cursor: 'pointer',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.85rem',
                  boxShadow: 'var(--shadow-sm)',
                  transition: 'all 0.22s ease'
                }}
              >
                <div
                  style={{
                    width: 50,
                    height: 50,
                    borderRadius: '50%',
                    background: 'var(--accent-indigo-soft)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  <FileText size={26} color="var(--accent-indigo)" />
                </div>
                <div>
                  <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-1)', margin: 0, letterSpacing: '0.02em' }}>DOWNLOAD FULL PAPER</h3>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-3)', margin: '0.4rem 0 0 0', lineHeight: 1.4, fontWeight: 500 }}>
                    Printable university PDF paper
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* STAGE: ONLINE EXAM PLAYER */}
      {stage === 'player' && (
        <OnlineExamPlayer
          examTitle={selectedArea === 'mock-exam' ? 'Mock Examination' : 'Practice Quiz'}
          resourceName={primaryResource?.name || 'Resource Material'}
          questions={generatedQuestions}
          userAnswers={userAnswers}
          setUserAnswers={setUserAnswers}
          onSubmitExam={handleSubmitExam}
          onDownloadPaper={handleDownloadPaper}
        />
      )}

      {/* STAGE: EXAM RESULTS & ANALYSIS */}
      {stage === 'results' && (
        <ExamResultsView
          examTitle={selectedArea === 'mock-exam' ? 'Mock Examination Results' : 'Quiz Results'}
          resourceName={primaryResource?.name || 'Resource Material'}
          questions={generatedQuestions}
          userAnswers={userAnswers}
          evaluations={evaluations}
          resource={primaryResource}
          onRedoExam={handleRedoExam}
          onTryNewQuestions={handleTryNewQuestions}
          onDownloadPaper={handleDownloadPaper}
          onOpenResourcePage={handleOpenResourcePage}
        />
      )}

      {/* Resource Page Modal Viewer */}
      <PdfPageModal
        isOpen={pdfModalOpen}
        onClose={() => setPdfModalOpen(false)}
        resource={primaryResource}
        initialPage={modalInitialPage}
        highlightText={modalHighlight}
      />
    </div>
  );
};
