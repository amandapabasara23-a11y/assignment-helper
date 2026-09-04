import React, { useState } from 'react';
import { ArrowLeft, BookOpen, Layers, CheckSquare, Settings2, Sparkles, ChevronRight } from 'lucide-react';
import type { ParsedResource, MockExamMode, MockExamConfig } from '../../types/practice';

interface MockExamConfigViewProps {
  resources: ParsedResource[];
  onBack: () => void;
  onGenerateExam: (config: MockExamConfig) => void;
}

export const MockExamConfigView: React.FC<MockExamConfigViewProps> = ({
  resources,
  onBack,
  onGenerateExam
}) => {
  const [selectedMode, setSelectedMode] = useState<MockExamMode | null>(null);
  const [step, setStep] = useState<'mode-select' | 'configure' | 'summary'>('mode-select');

  // Selected Part states
  const [selectedSections, setSelectedSections] = useState<string[]>([]);
  const [fromPage, setFromPage] = useState<number>(1);
  const totalPagesSum = resources.reduce((sum, r) => sum + r.totalPages, 0);
  const [toPage, setToPage] = useState<number>(Math.max(1, totalPagesSum));
  const [selectedPartCount, setSelectedPartCount] = useState<number>(10);
  const [usePageRange, setUsePageRange] = useState<boolean>(false);

  // Model Exam states
  const [defCount, setDefCount] = useState<number>(5);
  const [shortCount, setShortCount] = useState<number>(5);
  const [critCount, setCritCount] = useState<number>(3);

  const primaryResource = resources[0];
  const allSections = resources.flatMap(r => r.sections);

  const handleSelectMode = (mode: MockExamMode) => {
    setSelectedMode(mode);
    setStep('configure');
  };

  const handleToggleSection = (title: string) => {
    setSelectedSections(prev =>
      prev.includes(title) ? prev.filter(t => t !== title) : [...prev, title]
    );
  };

  const modelExamTotal = Math.max(0, defCount) + Math.max(0, shortCount) + Math.max(0, critCount);

  const getFinalConfig = (): MockExamConfig => {
    if (selectedMode === 'full') {
      return {
        mode: 'full',
        questionCounts: { definition: 0, shortAnswers: 0, criticalAnalysis: 0 }
      };
    } else if (selectedMode === 'selected') {
      return {
        mode: 'selected',
        selectedSections: usePageRange ? undefined : selectedSections,
        selectedPages: usePageRange ? { fromPage, toPage } : undefined,
        selectedQuestionCount: selectedPartCount,
        questionCounts: {
          definition: Math.ceil(selectedPartCount * 0.35),
          shortAnswers: Math.floor(selectedPartCount * 0.45),
          criticalAnalysis: Math.max(1, selectedPartCount - Math.ceil(selectedPartCount * 0.35) - Math.floor(selectedPartCount * 0.45))
        }
      };
    } else {
      return {
        mode: 'model',
        questionCounts: {
          definition: Math.max(0, defCount),
          shortAnswers: Math.max(0, shortCount),
          criticalAnalysis: Math.max(0, critCount)
        },
        totalQuestions: modelExamTotal
      };
    }
  };

  const handleGoToSummary = () => {
    setStep('summary');
  };

  const handleStartExamGeneration = () => {
    const config = getFinalConfig();
    onGenerateExam(config);
  };

  return (
    <div style={{ maxWidth: '840px', margin: '0 auto' }} className="animate-fade-in">
      {/* Top Back Navigation */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem' }}>
        <button
          onClick={() => {
            if (step === 'summary') setStep('configure');
            else if (step === 'configure') setStep('mode-select');
            else onBack();
          }}
          className="btn btn-sm btn-ghost"
        >
          <ArrowLeft size={16} />
          <span>Back</span>
        </button>
      </div>

      {/* STEP 1: MODE SELECT LANDING SCREEN */}
      {step === 'mode-select' && (
        <div>
          <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
            <span
              className="badge badge-indigo"
              style={{
                marginBottom: '0.85rem',
                padding: '0.45rem 1.15rem',
                fontSize: '0.78rem',
                fontWeight: 700,
                letterSpacing: '0.05em'
              }}
            >
              MOCK EXAMINATION WORKSPACE
            </span>
            <h2
              className="display-2"
              style={{
                fontSize: 'clamp(2rem, 3.5vw, 2.5rem)',
                fontWeight: 800,
                marginBottom: '0.5rem',
                color: 'var(--text-1)',
                letterSpacing: '-0.02em'
              }}
            >
              How do you want to practice?
            </h2>
            <p className="body-md" style={{ color: 'var(--text-3)', maxWidth: '580px', margin: '0 auto', fontSize: '0.95rem', lineHeight: 1.6 }}>
              Select an exam mode based on your study goals. The AI will strictly evaluate material from your uploaded resource <strong style={{ color: 'var(--text-1)' }}>{primaryResource?.name}</strong>.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem' }}>
            {/* Card 1: FULL EXAM */}
            <div
              className="card card-hover-effect"
              style={{
                padding: '2.25rem 1.65rem',
                cursor: 'pointer',
                border: '2px solid var(--border)',
                borderRadius: '20px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                background: 'var(--surface)',
                boxShadow: 'var(--shadow-sm)',
                transition: 'all 0.22s ease'
              }}
              onClick={() => handleSelectMode('full')}
            >
              <div>
                <div
                  style={{
                    width: 52,
                    height: 52,
                    borderRadius: '14px',
                    background: 'var(--accent-indigo-soft)',
                    color: 'var(--accent-indigo)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: '1.25rem',
                    boxShadow: 'inset 0 0 0 1px rgba(79, 70, 229, 0.15)'
                  }}
                >
                  <BookOpen size={26} />
                </div>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-1)', marginBottom: '0.4rem' }}>FULL EXAM</h3>
                <p className="body-sm" style={{ color: 'var(--text-3)', lineHeight: '1.6', fontSize: '0.88rem' }}>
                  Cover the entire resource. Generates a comprehensive exam scaled proportionally across all chapters and topics.
                </p>
              </div>

              <div style={{ marginTop: '1.75rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span className="badge badge-indigo" style={{ fontSize: '0.72rem' }}>Comprehensive</span>
                <span className="btn btn-xs btn-primary" style={{ borderRadius: '8px' }}>
                  Select <ChevronRight size={14} />
                </span>
              </div>
            </div>

            {/* Card 2: SELECTED PART */}
            <div
              className="card card-hover-effect"
              style={{
                padding: '2.25rem 1.65rem',
                cursor: 'pointer',
                border: '2px solid var(--border)',
                borderRadius: '20px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                background: 'var(--surface)',
                boxShadow: 'var(--shadow-sm)',
                transition: 'all 0.22s ease'
              }}
              onClick={() => handleSelectMode('selected')}
            >
              <div>
                <div
                  style={{
                    width: 52,
                    height: 52,
                    borderRadius: '14px',
                    background: 'var(--accent-emerald-soft)',
                    color: 'var(--accent-emerald)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: '1.25rem',
                    boxShadow: 'inset 0 0 0 1px rgba(16, 185, 129, 0.15)'
                  }}
                >
                  <CheckSquare size={26} />
                </div>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-1)', marginBottom: '0.4rem' }}>SELECTED PART</h3>
                <p className="body-sm" style={{ color: 'var(--text-3)', lineHeight: '1.6', fontSize: '0.88rem' }}>
                  Choose exactly what you want to study. Focus on specific chapters, topics, or custom page ranges.
                </p>
              </div>

              <div style={{ marginTop: '1.75rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span className="badge badge-emerald" style={{ fontSize: '0.72rem' }}>Targeted Scope</span>
                <span className="btn btn-xs btn-primary" style={{ borderRadius: '8px', background: 'var(--accent-emerald)', borderColor: 'var(--accent-emerald)' }}>
                  Select <ChevronRight size={14} />
                </span>
              </div>
            </div>

            {/* Card 3: MODEL EXAM */}
            <div
              className="card card-hover-effect"
              style={{
                padding: '2.25rem 1.65rem',
                cursor: 'pointer',
                border: '2px solid var(--border)',
                borderRadius: '20px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                background: 'var(--surface)',
                boxShadow: 'var(--shadow-sm)',
                transition: 'all 0.22s ease'
              }}
              onClick={() => handleSelectMode('model')}
            >
              <div>
                <div
                  style={{
                    width: 52,
                    height: 52,
                    borderRadius: '14px',
                    background: 'var(--accent-amber-soft)',
                    color: 'var(--accent-amber)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: '1.25rem',
                    boxShadow: 'inset 0 0 0 1px rgba(245, 158, 11, 0.15)'
                  }}
                >
                  <Settings2 size={26} />
                </div>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-1)', marginBottom: '0.4rem' }}>MODEL EXAM</h3>
                <p className="body-sm" style={{ color: 'var(--text-3)', lineHeight: '1.6', fontSize: '0.88rem' }}>
                  Build your own exam structure. Customize exact question counts for Definitions, Short Answers, and Critical Analysis.
                </p>
              </div>

              <div style={{ marginTop: '1.75rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span className="badge badge-amber" style={{ fontSize: '0.72rem' }}>Custom Specs</span>
                <span className="btn btn-xs btn-primary" style={{ borderRadius: '8px', background: 'var(--accent-amber)', borderColor: 'var(--accent-amber)' }}>
                  Select <ChevronRight size={14} />
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* STEP 2: MODE CONFIGURATION */}
      {step === 'configure' && (
        <div className="card" style={{ padding: '2rem', background: 'var(--surface)' }}>
          {selectedMode === 'full' && (
            <div>
              <div style={{ marginBottom: '1.5rem' }}>
                <span className="badge badge-indigo" style={{ marginBottom: '0.5rem' }}>MODE 1: FULL EXAM</span>
                <h3 style={{ fontSize: '1.5rem', fontWeight: 700 }}>Comprehensive Resource Examination</h3>
                <p className="body-md" style={{ color: 'var(--text-3)', marginTop: 4 }}>
                  The system will analyze the complete uploaded material and automatically generate enough questions to thoroughly cover all concepts.
                </p>
              </div>

              <div className="card-inset" style={{ padding: '1.25rem', marginBottom: '1.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
                  <Layers size={18} color="var(--accent-indigo)" />
                  <span style={{ fontWeight: 700, fontSize: '0.95rem' }}>Scope & Coverage Overview</span>
                </div>
                <ul style={{ paddingLeft: '1.25rem', fontSize: '0.88rem', color: 'var(--text-2)', display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                  <li>Resource Files: <strong>{resources.map(r => r.name).join(', ')}</strong> ({totalPagesSum} total pages)</li>
                  <li>Coverage: <strong>100% of entire resource material</strong></li>
                  <li>Question Structure: <strong>Section 1: Definition, Section 2: Short Answers, Section 3: Critical Analysis</strong></li>
                  <li>Question Count: <strong>Determined intelligently based on material depth</strong></li>
                </ul>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
                <button onClick={() => setStep('mode-select')} className="btn btn-secondary btn-md">Change Mode</button>
                <button onClick={handleGoToSummary} className="btn btn-primary btn-md">
                  Continue to Summary <ChevronRight size={16} />
                </button>
              </div>
            </div>
          )}

          {selectedMode === 'selected' && (
            <div>
              <div style={{ marginBottom: '1.5rem' }}>
                <span className="badge badge-emerald" style={{ marginBottom: '0.5rem' }}>MODE 2: SELECTED PART</span>
                <h3 style={{ fontSize: '1.5rem', fontWeight: 700 }}>Choose What You Want to Study</h3>
                <p className="body-md" style={{ color: 'var(--text-3)', marginTop: 4 }}>
                  Questions will be generated strictly from your selected material. Content outside this scope is excluded.
                </p>
              </div>

              {/* Selection Tabs: Sections vs Page Range */}
              <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.25rem' }}>
                <button
                  type="button"
                  className={`btn btn-sm ${!usePageRange ? 'btn-primary' : 'btn-secondary'}`}
                  onClick={() => setUsePageRange(false)}
                >
                  Document Sections ({allSections.length})
                </button>
                <button
                  type="button"
                  className={`btn btn-sm ${usePageRange ? 'btn-primary' : 'btn-secondary'}`}
                  onClick={() => setUsePageRange(true)}
                >
                  Page Range Selection
                </button>
              </div>

              {!usePageRange ? (
                <div style={{ marginBottom: '1.5rem' }}>
                  <label className="label" style={{ marginBottom: '0.75rem' }}>Select Sections/Topics to Include:</label>
                  {allSections.length > 0 ? (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '0.6rem', maxHeight: '240px', overflowY: 'auto', paddingRight: '0.5rem' }}>
                      {allSections.map((sec, idx) => {
                        const isChecked = selectedSections.includes(sec.title);
                        return (
                          <div
                            key={idx}
                            onClick={() => handleToggleSection(sec.title)}
                            style={{
                              padding: '0.65rem 0.85rem',
                              borderRadius: 'var(--r-sm)',
                              border: `1px solid ${isChecked ? 'var(--accent-indigo)' : 'var(--border)'}`,
                              background: isChecked ? 'var(--accent-indigo-soft)' : 'var(--surface)',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'space-between',
                              fontSize: '0.85rem'
                            }}
                          >
                            <span style={{ fontWeight: isChecked ? 600 : 400, color: 'var(--text-1)' }}>{sec.title}</span>
                            <span className="body-sm" style={{ fontSize: '0.75rem', color: 'var(--text-3)' }}>
                              pp. {sec.startPage}-{sec.endPage}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <p className="body-sm" style={{ color: 'var(--text-3)' }}>
                      No individual headings detected. Please use the Page Range Selection tab below.
                    </p>
                  )}
                </div>
              ) : (
                <div style={{ marginBottom: '1.5rem' }}>
                  <label className="label">Specify Page Range Scope:</label>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginTop: '0.5rem' }}>
                    <div style={{ flex: 1 }}>
                      <label className="body-sm">From Page:</label>
                      <input
                        type="number"
                        min={1}
                        max={totalPagesSum}
                        value={fromPage}
                        onChange={e => setFromPage(Math.max(1, parseInt(e.target.value) || 1))}
                        className="input input-sm"
                      />
                    </div>
                    <div style={{ flex: 1 }}>
                      <label className="body-sm">To Page:</label>
                      <input
                        type="number"
                        min={fromPage}
                        max={totalPagesSum}
                        value={toPage}
                        onChange={e => setToPage(Math.min(totalPagesSum, parseInt(e.target.value) || fromPage))}
                        className="input input-sm"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Question Count Selector */}
              <div style={{ marginBottom: '1.5rem' }}>
                <label className="label">How many questions?</label>
                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginTop: '0.35rem' }}>
                  {[5, 10, 15, 20, 25].map(cnt => (
                    <button
                      key={cnt}
                      type="button"
                      className={`btn btn-sm ${selectedPartCount === cnt ? 'btn-primary' : 'btn-secondary'}`}
                      onClick={() => setSelectedPartCount(cnt)}
                    >
                      {cnt} Questions
                    </button>
                  ))}
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
                <button onClick={() => setStep('mode-select')} className="btn btn-secondary btn-md">Change Mode</button>
                <button onClick={handleGoToSummary} className="btn btn-primary btn-md">
                  Continue to Summary <ChevronRight size={16} />
                </button>
              </div>
            </div>
          )}

          {selectedMode === 'model' && (
            <div>
              <div style={{ marginBottom: '1.5rem' }}>
                <span className="badge badge-amber" style={{ marginBottom: '0.5rem' }}>MODE 3: MODEL EXAM</span>
                <h3 style={{ fontSize: '1.5rem', fontWeight: 700 }}>Build Your Own Exam Structure</h3>
                <p className="body-md" style={{ color: 'var(--text-3)', marginTop: 4 }}>
                  Specify the exact number of questions you want for each section.
                </p>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', marginBottom: '2rem' }}>
                <div className="card-inset" style={{ padding: '1rem 1.25rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                    <div>
                      <h4 style={{ fontSize: '0.95rem', fontWeight: 700 }}>Section 1: Definition</h4>
                      <p className="body-sm" style={{ color: 'var(--text-3)', margin: 0 }}>Direct term definitions, concepts, and key terminology</p>
                    </div>
                    <div style={{ width: 100 }}>
                      <input
                        type="number"
                        min={0}
                        max={100}
                        value={defCount}
                        onChange={e => setDefCount(Math.max(0, parseInt(e.target.value) || 0))}
                        className="input input-sm"
                        style={{ textAlign: 'center', fontWeight: 700 }}
                      />
                    </div>
                  </div>
                </div>

                <div className="card-inset" style={{ padding: '1rem 1.25rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                    <div>
                      <h4 style={{ fontSize: '0.95rem', fontWeight: 700 }}>Section 2: Short Answers (Brief Explain)</h4>
                      <p className="body-sm" style={{ color: 'var(--text-3)', margin: 0 }}>Explanations of processes, relationships, and cause-effects</p>
                    </div>
                    <div style={{ width: 100 }}>
                      <input
                        type="number"
                        min={0}
                        max={100}
                        value={shortCount}
                        onChange={e => setShortCount(Math.max(0, parseInt(e.target.value) || 0))}
                        className="input input-sm"
                        style={{ textAlign: 'center', fontWeight: 700 }}
                      />
                    </div>
                  </div>
                </div>

                <div className="card-inset" style={{ padding: '1rem 1.25rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                    <div>
                      <h4 style={{ fontSize: '0.95rem', fontWeight: 700 }}>Section 3: Critical Analysis</h4>
                      <p className="body-sm" style={{ color: 'var(--text-3)', margin: 0 }}>In-depth analytical reasoning, evaluations, and synthesized concepts</p>
                    </div>
                    <div style={{ width: 100 }}>
                      <input
                        type="number"
                        min={0}
                        max={100}
                        value={critCount}
                        onChange={e => setCritCount(Math.max(0, parseInt(e.target.value) || 0))}
                        className="input input-sm"
                        style={{ textAlign: 'center', fontWeight: 700 }}
                      />
                    </div>
                  </div>
                </div>

                {/* Total Counter Badge */}
                <div
                  className="card"
                  style={{
                    padding: '1rem 1.25rem',
                    background: 'var(--accent-indigo-soft)',
                    border: '1px solid var(--accent-indigo)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between'
                  }}
                >
                  <span style={{ fontWeight: 700, color: 'var(--accent-indigo)' }}>TOTAL QUESTIONS CONFIGURED:</span>
                  <span style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--accent-indigo)' }}>
                    {modelExamTotal} QUESTIONS
                  </span>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
                <button onClick={() => setStep('mode-select')} className="btn btn-secondary btn-md">Change Mode</button>
                <button
                  onClick={handleGoToSummary}
                  disabled={modelExamTotal <= 0}
                  className="btn btn-primary btn-md"
                >
                  Continue to Summary <ChevronRight size={16} />
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* STEP 3: PRE-GENERATION SUMMARY SCREEN (Section 14) */}
      {step === 'summary' && (
        <div className="card" style={{ padding: '2.25rem', background: 'var(--surface)' }}>
          <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
            <span className="badge badge-emerald" style={{ marginBottom: '0.5rem', padding: '0.4rem 1rem' }}>
              FINAL CONFIGURATION SUMMARY
            </span>
            <h2 className="display-2" style={{ fontSize: '2rem', marginBottom: '0.35rem' }}>
              Ready to Create Exam
            </h2>
            <p className="body-md" style={{ color: 'var(--text-3)' }}>
              Review your parameters below. Clicking <strong>Create Exam</strong> will trigger AI question synthesis strictly from your resource.
            </p>
          </div>

          <div className="card-inset" style={{ padding: '1.5rem', marginBottom: '2rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border)', paddingBottom: '0.75rem' }}>
              <span className="body-sm" style={{ fontWeight: 600 }}>Target Resource:</span>
              <span style={{ fontWeight: 700, color: 'var(--accent-indigo)' }}>
                {resources.map(r => r.name).join(', ')} ({totalPagesSum} pages)
              </span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border)', paddingBottom: '0.75rem' }}>
              <span className="body-sm" style={{ fontWeight: 600 }}>Selected Mode:</span>
              <span style={{ fontWeight: 700, textTransform: 'uppercase' }}>
                {selectedMode === 'full' ? 'Full Exam (Comprehensive Coverage)' : (selectedMode === 'selected' ? 'Selected Part' : 'Model Exam')}
              </span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border)', paddingBottom: '0.75rem' }}>
              <span className="body-sm" style={{ fontWeight: 600 }}>Material Coverage Scope:</span>
              <span style={{ fontWeight: 600 }}>
                {selectedMode === 'full'
                  ? 'Entire Resource Material (100%)'
                  : (selectedMode === 'selected'
                    ? (usePageRange ? `Pages ${fromPage} to ${toPage}` : `${selectedSections.length || 'Selected'} Sections`)
                    : 'Configured Distribution')}
              </span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span className="body-sm" style={{ fontWeight: 600 }}>Question Count & Structure:</span>
              <span className="badge badge-indigo" style={{ fontSize: '0.85rem', padding: '0.4rem 0.85rem' }}>
                {selectedMode === 'full' ? 'Dynamically Scaled Coverage' : `${selectedMode === 'selected' ? selectedPartCount : modelExamTotal} Questions Total`}
              </span>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <button onClick={() => setStep('configure')} className="btn btn-secondary btn-md">
              <ArrowLeft size={16} /> Edit Parameters
            </button>
            <button onClick={handleStartExamGeneration} className="btn btn-primary btn-xl" style={{ padding: '0.85rem 2.5rem' }}>
              <Sparkles size={20} />
              <span>Create Exam</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
