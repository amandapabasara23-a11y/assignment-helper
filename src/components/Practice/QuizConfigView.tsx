import React, { useState } from 'react';
import { ArrowLeft, Zap } from 'lucide-react';
import type { ParsedResource, QuizConfig, QuestionDifficulty } from '../../types/practice';

interface QuizConfigViewProps {
  resources: ParsedResource[];
  onBack: () => void;
  onGenerateQuiz: (config: QuizConfig) => void;
}

export const QuizConfigView: React.FC<QuizConfigViewProps> = ({
  resources,
  onBack,
  onGenerateQuiz
}) => {
  const [questionCount, setQuestionCount] = useState<number>(10);
  const [customCount, setCustomCount] = useState<string>('');
  const [isCustomCount, setIsCustomCount] = useState<boolean>(false);

  const [difficulty, setDifficulty] = useState<QuestionDifficulty>('Mixed');
  const [questionType, setQuestionType] = useState<'Multiple Choice' | 'True / False' | 'Mixed'>('Multiple Choice');
  const [coverEntireResource, setCoverEntireResource] = useState<boolean>(true);
  const [selectedSections, setSelectedSections] = useState<string[]>([]);

  const allSections = resources.flatMap(r => r.sections);

  const handleToggleSection = (title: string) => {
    setSelectedSections(prev =>
      prev.includes(title) ? prev.filter(t => t !== title) : [...prev, title]
    );
  };

  const finalCount = isCustomCount ? Math.max(1, Math.min(100, parseInt(customCount) || 10)) : questionCount;

  const handleStartQuiz = () => {
    const config: QuizConfig = {
      questionCount: finalCount,
      difficulty,
      questionType,
      coverEntireResource,
      selectedSections: coverEntireResource ? undefined : selectedSections
    };
    onGenerateQuiz(config);
  };

  return (
    <div style={{ maxWidth: '720px', margin: '0 auto' }} className="animate-fade-in">
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem' }}>
        <button onClick={onBack} className="btn btn-sm btn-ghost">
          <ArrowLeft size={16} />
          <span>Back</span>
        </button>
      </div>

      <div className="card" style={{ padding: '2.25rem', background: 'var(--surface)' }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <span className="badge badge-emerald" style={{ marginBottom: '0.75rem', padding: '0.4rem 1rem' }}>
            RAPID KNOWLEDGE ASSESSMENT
          </span>
          <h2 className="display-2" style={{ fontSize: '2.2rem', marginBottom: '0.35rem' }}>
            Create a Practice Quiz
          </h2>
          <p className="body-md" style={{ color: 'var(--text-3)' }}>
            Quickly test your retention with automated multiple-choice and true/false questions generated strictly from your uploaded lectures.
          </p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem', marginBottom: '2rem' }}>
          {/* Question Count Selection */}
          <div>
            <label className="label" style={{ fontSize: '0.9rem', marginBottom: '0.5rem' }}>Question Count:</label>
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
              {[5, 10, 15, 20, 25, 50].map(cnt => (
                <button
                  key={cnt}
                  type="button"
                  className={`btn btn-sm ${!isCustomCount && questionCount === cnt ? 'btn-primary' : 'btn-secondary'}`}
                  onClick={() => {
                    setIsCustomCount(false);
                    setQuestionCount(cnt);
                  }}
                >
                  {cnt} Qs
                </button>
              ))}
              <button
                type="button"
                className={`btn btn-sm ${isCustomCount ? 'btn-primary' : 'btn-secondary'}`}
                onClick={() => setIsCustomCount(true)}
              >
                Custom
              </button>
            </div>
            {isCustomCount && (
              <div style={{ marginTop: '0.75rem', maxWidth: 200 }}>
                <input
                  type="number"
                  min={1}
                  max={100}
                  placeholder="Enter count (1-100)"
                  value={customCount}
                  onChange={e => setCustomCount(e.target.value)}
                  className="input input-sm"
                />
              </div>
            )}
          </div>

          {/* Difficulty Level */}
          <div>
            <label className="label" style={{ fontSize: '0.9rem', marginBottom: '0.5rem' }}>Difficulty Level:</label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.5rem' }}>
              {(['Easy', 'Medium', 'Hard', 'Mixed'] as QuestionDifficulty[]).map(diff => (
                <button
                  key={diff}
                  type="button"
                  className={`btn btn-sm ${difficulty === diff ? 'btn-primary' : 'btn-secondary'}`}
                  onClick={() => setDifficulty(diff)}
                >
                  {diff}
                </button>
              ))}
            </div>
          </div>

          {/* Question Type */}
          <div>
            <label className="label" style={{ fontSize: '0.9rem', marginBottom: '0.5rem' }}>Question Type:</label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.5rem' }}>
              {(['Multiple Choice', 'True / False', 'Mixed'] as const).map(type => (
                <button
                  key={type}
                  type="button"
                  className={`btn btn-sm ${questionType === type ? 'btn-primary' : 'btn-secondary'}`}
                  onClick={() => setQuestionType(type)}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>

          {/* Coverage Scope Toggle */}
          <div className="card-inset" style={{ padding: '1.25rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
              <div>
                <h4 style={{ fontSize: '0.95rem', fontWeight: 700 }}>Cover Entire Resource</h4>
                <p className="body-sm" style={{ color: 'var(--text-3)', margin: 0 }}>Distribute questions evenly across all pages</p>
              </div>
              <label style={{ position: 'relative', display: 'inline-block', width: 44, height: 24, cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={coverEntireResource}
                  onChange={e => setCoverEntireResource(e.target.checked)}
                  style={{ opacity: 0, width: 0, height: 0 }}
                />
                <span
                  style={{
                    position: 'absolute',
                    inset: 0,
                    backgroundColor: coverEntireResource ? 'var(--accent-indigo)' : 'var(--border-strong)',
                    borderRadius: 24,
                    transition: '0.2s'
                  }}
                >
                  <span
                    style={{
                      position: 'absolute',
                      height: 18,
                      width: 18,
                      left: coverEntireResource ? 22 : 3,
                      bottom: 3,
                      backgroundColor: 'white',
                      borderRadius: '50%',
                      transition: '0.2s'
                    }}
                  />
                </span>
              </label>
            </div>

            {!coverEntireResource && allSections.length > 0 && (
              <div style={{ marginTop: '1rem', borderTop: '1px solid var(--border)', paddingTop: '0.75rem' }}>
                <label className="body-sm" style={{ fontWeight: 600, display: 'block', marginBottom: '0.5rem' }}>
                  Select Specific Sections:
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '0.5rem', maxHeight: '160px', overflowY: 'auto' }}>
                  {allSections.map((sec, idx) => {
                    const isChecked = selectedSections.includes(sec.title);
                    return (
                      <div
                        key={idx}
                        onClick={() => handleToggleSection(sec.title)}
                        style={{
                          padding: '0.5rem 0.75rem',
                          borderRadius: 'var(--r-sm)',
                          border: `1px solid ${isChecked ? 'var(--accent-indigo)' : 'var(--border)'}`,
                          background: isChecked ? 'var(--accent-indigo-soft)' : 'var(--surface)',
                          cursor: 'pointer',
                          fontSize: '0.8rem'
                        }}
                      >
                        {sec.title}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Action Button */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
          <button onClick={onBack} className="btn btn-secondary btn-md">Cancel</button>
          <button onClick={handleStartQuiz} className="btn btn-primary btn-xl" style={{ padding: '0.85rem 2.5rem' }}>
            <Zap size={18} />
            <span>Create Quiz</span>
          </button>
        </div>
      </div>
    </div>
  );
};
