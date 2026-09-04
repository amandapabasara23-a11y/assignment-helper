import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Save, FileText, CheckSquare, ListCheck } from 'lucide-react';
import type { PracticeQuestion } from '../../types/practice';

interface OnlineExamPlayerProps {
  examTitle: string;
  resourceName: string;
  questions: PracticeQuestion[];
  userAnswers: Record<string, string>;
  setUserAnswers: React.Dispatch<React.SetStateAction<Record<string, string>>>;
  onSubmitExam: () => void;
  onDownloadPaper: () => void;
}

export const OnlineExamPlayer: React.FC<OnlineExamPlayerProps> = ({
  examTitle,
  resourceName,
  questions,
  userAnswers,
  setUserAnswers,
  onSubmitExam,
  onDownloadPaper
}) => {
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [isSubmitModalOpen, setIsSubmitModalOpen] = useState<boolean>(false);
  const [lastSavedTime, setLastSavedTime] = useState<string>('Saved');

  const currentQuestion = questions[currentIndex] || questions[0];
  const totalQuestions = questions.length;

  const currentAnswer = userAnswers[currentQuestion?.id] || '';

  const handleAnswerChange = (val: string) => {
    setUserAnswers(prev => ({
      ...prev,
      [currentQuestion.id]: val
    }));
    setLastSavedTime('Saved');
  };

  const answeredCount = Object.keys(userAnswers).filter(id => userAnswers[id]?.trim()).length;
  const unansweredCount = totalQuestions - answeredCount;

  const handlePrev = () => setCurrentIndex(prev => Math.max(0, prev - 1));
  const handleNext = () => setCurrentIndex(prev => Math.min(totalQuestions - 1, prev + 1));

  return (
    <div style={{ maxWidth: '1080px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '1.5rem' }} className="animate-fade-in">
      {/* Top Banner Header */}
      <div
        className="card"
        style={{
          padding: '1.25rem 1.75rem',
          background: 'var(--surface)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '1rem'
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <span className="badge badge-indigo" style={{ fontSize: '0.75rem' }}>
              EXAM IN PROGRESS
            </span>
            <span className="body-sm" style={{ color: 'var(--text-4)' }}>•</span>
            <span className="body-sm" style={{ fontWeight: 600 }}>{resourceName}</span>
          </div>
          <h2 style={{ fontSize: '1.35rem', fontWeight: 700, margin: '0.2rem 0 0 0' }}>{examTitle}</h2>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--accent-emerald)', fontSize: '0.85rem', fontWeight: 600 }}>
            <Save size={16} />
            <span>✓ {lastSavedTime}</span>
          </div>

          <button onClick={onDownloadPaper} className="btn btn-sm btn-secondary" title="Download Printable Paper">
            <FileText size={14} />
            <span>Download Paper</span>
          </button>

          <button onClick={() => setIsSubmitModalOpen(true)} className="btn btn-sm btn-primary">
            <CheckSquare size={14} />
            <span>Submit Exam</span>
          </button>
        </div>
      </div>

      {/* Main Examination Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 280px', gap: '1.5rem', alignItems: 'start' }}>
        {/* Left Column: Question Card */}
        <div className="card" style={{ padding: '2rem', background: 'var(--surface)', minHeight: '480px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            {/* Question Section Header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem', borderBottom: '1px solid var(--border)', paddingBottom: '0.75rem' }}>
              <span className="badge badge-neutral" style={{ fontWeight: 700 }}>
                {currentQuestion?.section}
              </span>
              <span className="body-sm" style={{ fontWeight: 700, color: 'var(--accent-indigo)' }}>
                Question {currentIndex + 1} of {totalQuestions}
              </span>
            </div>

            {/* Question Text */}
            <h3 style={{ fontSize: '1.15rem', fontWeight: 700, lineHeight: 1.5, marginBottom: '1.5rem', color: 'var(--text-1)' }}>
              {currentQuestion?.question}
            </h3>

            {/* Answer Input Field */}
            {currentQuestion?.questionType === 'multiple-choice' || currentQuestion?.questionType === 'true-false' ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {currentQuestion.options?.map((opt, idx) => {
                  const isSelected = currentAnswer === opt;
                  const letter = String.fromCharCode(65 + idx);
                  return (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleAnswerChange(opt)}
                      style={{
                        padding: '1rem 1.25rem',
                        borderRadius: 'var(--r-md)',
                        border: `2px solid ${isSelected ? 'var(--accent-indigo)' : 'var(--border)'}`,
                        background: isSelected ? 'var(--accent-indigo-soft)' : 'var(--surface)',
                        color: 'var(--text-1)',
                        textAlign: 'left',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.85rem',
                        fontSize: '0.95rem',
                        fontWeight: isSelected ? 600 : 400,
                        transition: 'all 0.15s ease'
                      }}
                    >
                      <span
                        style={{
                          width: 28,
                          height: 28,
                          borderRadius: '50%',
                          background: isSelected ? 'var(--accent-indigo)' : 'var(--surface-hover)',
                          color: isSelected ? 'white' : 'var(--text-2)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '0.85rem',
                          fontWeight: 700,
                          flexShrink: 0
                        }}
                      >
                        {letter}
                      </span>
                      <span>{opt}</span>
                    </button>
                  );
                })}
              </div>
            ) : (
              <div>
                <label className="label" style={{ marginBottom: '0.5rem' }}>Your Answer:</label>
                <textarea
                  value={currentAnswer}
                  onChange={e => handleAnswerChange(e.target.value)}
                  placeholder="Write your academic response here based on your resource material..."
                  className="textarea"
                  style={{ minHeight: '180px', fontSize: '0.95rem' }}
                />
              </div>
            )}
          </div>

          {/* Navigation Controls */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '2rem', borderTop: '1px solid var(--border)', paddingTop: '1.25rem' }}>
            <button
              onClick={handlePrev}
              disabled={currentIndex === 0}
              className="btn btn-secondary btn-md"
            >
              <ChevronLeft size={16} /> Previous
            </button>

            {currentIndex === totalQuestions - 1 ? (
              <button onClick={() => setIsSubmitModalOpen(true)} className="btn btn-primary btn-md">
                Review & Submit <CheckSquare size={16} />
              </button>
            ) : (
              <button onClick={handleNext} className="btn btn-primary btn-md">
                Next <ChevronRight size={16} />
              </button>
            )}
          </div>
        </div>

        {/* Right Column: Question Navigator Sidebar (Section 24) */}
        <div className="card" style={{ padding: '1.25rem', background: 'var(--surface)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
            <h4 style={{ fontSize: '0.95rem', fontWeight: 700 }}>Question Navigator</h4>
            <span className="body-sm" style={{ fontSize: '0.78rem' }}>{answeredCount}/{totalQuestions} Answered</span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.5rem', maxHeight: '380px', overflowY: 'auto' }}>
            {questions.map((q, idx) => {
              const isAnswered = Boolean(userAnswers[q.id]?.trim());
              const isCurrent = idx === currentIndex;
              return (
                <button
                  key={q.id}
                  onClick={() => setCurrentIndex(idx)}
                  style={{
                    padding: '0.55rem 0.25rem',
                    borderRadius: 'var(--r-sm)',
                    border: `1.5px solid ${isCurrent ? 'var(--accent-indigo)' : 'var(--border)'}`,
                    background: isCurrent
                      ? 'var(--accent-indigo-soft)'
                      : (isAnswered ? 'var(--accent-emerald-soft)' : 'var(--surface-hover)'),
                    color: isCurrent
                      ? 'var(--accent-indigo)'
                      : (isAnswered ? 'var(--accent-emerald)' : 'var(--text-3)'),
                    fontWeight: isCurrent || isAnswered ? 700 : 500,
                    fontSize: '0.82rem',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.2rem'
                  }}
                >
                  <span>{String(idx + 1).padStart(2, '0')}</span>
                  <span>{isAnswered ? '✓' : '—'}</span>
                </button>
              );
            })}
          </div>

          <div style={{ marginTop: '1.25rem', borderTop: '1px solid var(--border)', paddingTop: '0.85rem', display: 'flex', flexDirection: 'column', gap: '0.4rem', fontSize: '0.75rem', color: 'var(--text-3)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{ width: 12, height: 12, borderRadius: 2, background: 'var(--accent-emerald-soft)', border: '1px solid var(--accent-emerald)' }} />
              <span>Answered</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{ width: 12, height: 12, borderRadius: 2, background: 'var(--surface-hover)', border: '1px solid var(--border)' }} />
              <span>Unanswered</span>
            </div>
          </div>
        </div>
      </div>

      {/* Pre-Submission Modal (Section 25) */}
      {isSubmitModalOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(15, 23, 42, 0.65)',
            backdropFilter: 'blur(4px)',
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1.5rem'
          }}
        >
          <div className="card" style={{ width: '100%', maxWidth: '480px', padding: '2rem', background: 'var(--surface)' }}>
            <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
              <div
                style={{
                  width: 54,
                  height: 54,
                  borderRadius: '50%',
                  background: 'var(--accent-indigo-soft)',
                  color: 'var(--accent-indigo)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 1rem auto'
                }}
              >
                <ListCheck size={28} />
              </div>
              <h3 style={{ fontSize: '1.35rem', fontWeight: 700 }}>Ready to Submit Exam?</h3>
              <p className="body-md" style={{ color: 'var(--text-3)', marginTop: 4 }}>
                Review your completion status before finalizing your examination session.
              </p>
            </div>

            <div className="card-inset" style={{ padding: '1rem 1.25rem', marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-around', textAlign: 'center' }}>
              <div>
                <p className="body-sm" style={{ margin: 0 }}>Total</p>
                <p style={{ fontSize: '1.25rem', fontWeight: 800, margin: 0 }}>{totalQuestions}</p>
              </div>
              <div>
                <p className="body-sm" style={{ margin: 0, color: 'var(--accent-emerald)' }}>Answered</p>
                <p style={{ fontSize: '1.25rem', fontWeight: 800, margin: 0, color: 'var(--accent-emerald)' }}>{answeredCount}</p>
              </div>
              <div>
                <p className="body-sm" style={{ margin: 0, color: unansweredCount > 0 ? 'var(--accent-rose)' : 'var(--text-3)' }}>Unanswered</p>
                <p style={{ fontSize: '1.25rem', fontWeight: 800, margin: 0, color: unansweredCount > 0 ? 'var(--accent-rose)' : 'var(--text-3)' }}>{unansweredCount}</p>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <button
                onClick={() => setIsSubmitModalOpen(false)}
                className="btn btn-secondary btn-md"
                style={{ flex: 1 }}
              >
                Review Answers
              </button>
              <button
                onClick={() => {
                  setIsSubmitModalOpen(false);
                  onSubmitExam();
                }}
                className="btn btn-primary btn-md"
                style={{ flex: 1 }}
              >
                Submit Exam Now
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
