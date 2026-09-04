import React, { useState } from 'react';
import { RefreshCw, Sparkles, FileText, CheckCircle2, XCircle, BookOpen, ExternalLink, ChevronDown, ChevronUp } from 'lucide-react';
import type { PracticeQuestion, SubjectiveEvaluationResult, ParsedResource } from '../../types/practice';

interface ExamResultsViewProps {
  examTitle: string;
  resourceName: string;
  questions: PracticeQuestion[];
  userAnswers: Record<string, string>;
  evaluations: Record<string, SubjectiveEvaluationResult>;
  resource: ParsedResource | null;
  onRedoExam: () => void;
  onTryNewQuestions: () => void;
  onDownloadPaper: () => void;
  onOpenResourcePage: (page: number, highlight?: string) => void;
}

export const ExamResultsView: React.FC<ExamResultsViewProps> = ({
  examTitle,
  resourceName,
  questions,
  userAnswers,
  evaluations,
  resource: _resource,
  onRedoExam,
  onTryNewQuestions,
  onDownloadPaper,
  onOpenResourcePage
}) => {
  const [expandedQuestionId, setExpandedQuestionId] = useState<string | null>(null);

  // Compute Overall Score
  let totalScore = 0;
  let maxScore = questions.length * 100;

  const sectionStats: Record<string, { correct: number; total: number }> = {};

  questions.forEach(q => {
    const sec = q.section || 'General';
    if (!sectionStats[sec]) sectionStats[sec] = { correct: 0, total: 0 };
    sectionStats[sec].total += 1;

    const uAns = (userAnswers[q.id] || '').trim();

    if (q.questionType === 'multiple-choice' || q.questionType === 'true-false') {
      const isCorrect = uAns.toLowerCase() === q.correctAnswer.trim().toLowerCase();
      if (isCorrect) {
        totalScore += 100;
        sectionStats[sec].correct += 1;
      }
    } else {
      const evalRes = evaluations[q.id];
      if (evalRes) {
        totalScore += evalRes.score;
        if (evalRes.isCorrect) sectionStats[sec].correct += 1;
      } else {
        // Default estimate if answer given
        if (uAns) {
          totalScore += 80;
          sectionStats[sec].correct += 1;
        }
      }
    }
  });

  const percentage = Math.round((totalScore / maxScore) * 100) || 0;

  const getScoreColor = (pct: number) => {
    if (pct >= 80) return 'var(--accent-emerald)';
    if (pct >= 60) return 'var(--accent-indigo)';
    if (pct >= 40) return 'var(--accent-amber)';
    return 'var(--accent-rose)';
  };

  return (
    <div style={{ maxWidth: '960px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '1.5rem' }} className="animate-fade-in">
      {/* Top Results Banner */}
      <div className="card" style={{ padding: '2rem', background: 'var(--surface)', textAlign: 'center' }}>
        <span className="badge badge-emerald" style={{ marginBottom: '0.75rem', padding: '0.4rem 1rem' }}>
          EXAMINATION COMPLETE
        </span>
        <h2 className="display-2" style={{ fontSize: '2.2rem', marginBottom: '0.25rem' }}>
          {examTitle}
        </h2>
        <p className="body-md" style={{ color: 'var(--text-3)', marginBottom: '1.5rem' }}>
          Resource: <strong>{resourceName}</strong>
        </p>

        {/* Score Ring / Metric */}
        <div
          style={{
            display: 'inline-flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            width: 140,
            height: 140,
            borderRadius: '50%',
            border: `6px solid ${getScoreColor(percentage)}`,
            margin: '0 auto 1.5rem auto',
            background: 'var(--surface-hover)'
          }}
        >
          <span style={{ fontSize: '2.2rem', fontWeight: 800, color: getScoreColor(percentage), lineHeight: 1 }}>
            {percentage}%
          </span>
          <span className="body-sm" style={{ fontSize: '0.78rem', marginTop: 4 }}>
            {Math.round(totalScore / 100)} / {questions.length} Correct
          </span>
        </div>

        {/* Section Breakdown Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginTop: '1rem' }}>
          {Object.entries(sectionStats).map(([secName, stat]) => {
            const secPct = Math.round((stat.correct / stat.total) * 100) || 0;
            return (
              <div key={secName} className="card-inset" style={{ padding: '1rem', textAlign: 'left' }}>
                <p className="body-sm" style={{ fontWeight: 700, margin: 0 }}>{secName}</p>
                <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginTop: '0.4rem' }}>
                  <span style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--accent-indigo)' }}>
                    {stat.correct} / {stat.total}
                  </span>
                  <span className="body-sm" style={{ fontWeight: 600, color: 'var(--text-3)' }}>{secPct}%</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Action Controls (Mandatory Section 29, 30, 31, 32) */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.85rem', marginTop: '2rem', flexWrap: 'wrap' }}>
          <button
            onClick={onRedoExam}
            className="btn btn-secondary btn-md"
            title="Repeat identical question set locally (0 API calls)"
          >
            <RefreshCw size={16} />
            <span>Redo Exam (Same Questions)</span>
          </button>

          <button
            onClick={onTryNewQuestions}
            className="btn btn-primary btn-md"
            title="Generate genuinely new questions from same resource (1 AI call)"
          >
            <Sparkles size={16} />
            <span>Try New Questions</span>
          </button>

          <button onClick={onDownloadPaper} className="btn btn-secondary btn-md">
            <FileText size={16} />
            <span>Download Paper PDF</span>
          </button>
        </div>
      </div>

      {/* Answer Analysis Section */}
      <div className="card" style={{ padding: '1.75rem', background: 'var(--surface)' }}>
        <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '1.25rem' }}>
          Question & Source Answer Analysis ({questions.length})
        </h3>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {questions.map((q, idx) => {
            const uAns = userAnswers[q.id] || '[Unanswered]';
            const evalRes = evaluations[q.id];
            const isObj = q.questionType === 'multiple-choice' || q.questionType === 'true-false';
            const isCorrect = isObj
              ? uAns.trim().toLowerCase() === q.correctAnswer.trim().toLowerCase()
              : Boolean(evalRes?.isCorrect);

            const isExpanded = expandedQuestionId === q.id;

            return (
              <div
                key={q.id}
                className="card-inset"
                style={{
                  padding: '1.25rem',
                  borderLeft: `4px solid ${isCorrect ? 'var(--accent-emerald)' : 'var(--accent-rose)'}`,
                  background: 'var(--surface)'
                }}
              >
                {/* Question Header */}
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '1rem' }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
                    {isCorrect ? (
                      <CheckCircle2 size={22} color="var(--accent-emerald)" style={{ flexShrink: 0, marginTop: 2 }} />
                    ) : (
                      <XCircle size={22} color="var(--accent-rose)" style={{ flexShrink: 0, marginTop: 2 }} />
                    )}
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                        <span className="body-sm" style={{ fontWeight: 700, color: 'var(--text-3)' }}>
                          Q{idx + 1}.
                        </span>
                        <span className="badge badge-neutral" style={{ fontSize: '0.72rem' }}>
                          {q.section}
                        </span>
                      </div>
                      <h4 style={{ fontSize: '1.05rem', fontWeight: 700, lineHeight: 1.4, margin: 0 }}>
                        {q.question}
                      </h4>
                    </div>
                  </div>

                  <button
                    onClick={() => setExpandedQuestionId(isExpanded ? null : q.id)}
                    className="btn-icon"
                  >
                    {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                  </button>
                </div>

                {/* Answers Breakdown */}
                <div style={{ marginTop: '1rem', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem', background: 'var(--surface-hover)', padding: '0.85rem', borderRadius: 'var(--r-sm)' }}>
                  <div>
                    <span className="body-sm" style={{ fontWeight: 700, color: 'var(--text-3)', fontSize: '0.75rem' }}>YOUR ANSWER:</span>
                    <p style={{ fontSize: '0.88rem', color: isCorrect ? 'var(--text-1)' : 'var(--accent-rose)', margin: '0.2rem 0 0 0', fontWeight: 500 }}>
                      {uAns}
                    </p>
                  </div>

                  <div>
                    <span className="body-sm" style={{ fontWeight: 700, color: 'var(--accent-emerald)', fontSize: '0.75rem' }}>REFERENCE ANSWER:</span>
                    <p style={{ fontSize: '0.88rem', color: 'var(--text-1)', margin: '0.2rem 0 0 0', fontWeight: 600 }}>
                      {q.correctAnswer}
                    </p>
                  </div>
                </div>

                {/* Analysis & Source Citation (Section 27 & 28) */}
                <div style={{ marginTop: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <BookOpen size={15} color="var(--accent-indigo)" />
                    <span className="body-sm" style={{ fontWeight: 600 }}>
                      Found in: <strong style={{ color: 'var(--accent-indigo)' }}>{q.source.file}</strong> • Page {q.source.page} {q.source.section ? `• ${q.source.section}` : ''}
                    </span>
                  </div>

                  <button
                    onClick={() => onOpenResourcePage(q.source.page, q.question)}
                    className="btn btn-xs btn-secondary"
                  >
                    <ExternalLink size={12} />
                    <span>Open Resource Page {q.source.page}</span>
                  </button>
                </div>

                {/* Detailed AI Explanation / Subjective Feedback */}
                {isExpanded && (
                  <div style={{ marginTop: '1rem', borderTop: '1px solid var(--border)', paddingTop: '0.85rem' }}>
                    <p className="body-sm" style={{ fontWeight: 700, color: 'var(--text-2)', marginBottom: '0.35rem' }}>
                      Resource Explanation & Evaluation:
                    </p>
                    <p className="body-sm" style={{ color: 'var(--text-2)', lineHeight: 1.6 }}>
                      {q.explanation}
                    </p>
                    {evalRes && evalRes.feedback && (
                      <div className="card-inset" style={{ padding: '0.75rem', marginTop: '0.5rem', background: 'var(--accent-indigo-soft)' }}>
                        <p className="body-sm" style={{ fontWeight: 700, color: 'var(--accent-indigo)', margin: 0 }}>
                          Feedback: {evalRes.feedback}
                        </p>
                        {evalRes.missingConcepts && evalRes.missingConcepts.length > 0 && (
                          <p className="body-sm" style={{ color: 'var(--accent-amber)', margin: '0.25rem 0 0 0', fontSize: '0.8rem' }}>
                            Missing Concepts: {evalRes.missingConcepts.join(', ')}
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
