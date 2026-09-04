import React from 'react';
import {
  ArrowRight, Mic, ShieldCheck, BookOpen,
  FileText, Sparkles, GraduationCap, Lock,
  Award, Zap, CheckCircle2
} from 'lucide-react';

interface LandingPageProps {
  onStartNew: () => void;
  onOpenSample: () => void;
  onSelectStep?: (step: number) => void;
  onOpenPractice?: () => void;
}

const STATS = [
  { value: '0%', label: 'Rewriting or paraphrasing' },
  { value: '100%', label: 'Original content preserved' },
  { value: '9 Styles', label: 'APA 7, Harvard, IEEE & more' },
  { value: 'DOCX + PDF', label: 'Native academic export' },
];

const WORKFLOW_FEATURES = [
  {
    icon: Mic,
    iconBg: '#F3E8FF',
    iconColor: '#9333EA',
    title: 'Voice-to-text recording',
    desc: 'Speak your assignment ideas instead of typing. Review, edit, or re-record transcripts before inserting into your outline.',
  },
  {
    icon: ShieldCheck,
    iconBg: '#ECFDF5',
    iconColor: '#10B981',
    title: 'Content preservation lock',
    desc: 'Sentence-level diff verification ensures zero unauthorised paraphrasing or alterations to your original text.',
  },
  {
    icon: BookOpen,
    iconBg: '#EFF6FF',
    iconColor: '#2563EB',
    title: 'Reference file extraction',
    desc: 'Upload source PDFs or DOCX files. Metadata is extracted automatically — no hallucinated authors or fabricated dates.',
  },
  {
    icon: Award,
    iconBg: '#EEF2FF',
    iconColor: '#4F46E5',
    title: 'Resource-based Practice Suite',
    desc: 'Upload lecture PDFs to generate source-grounded mock exams (Full, Selected Part, Model) and rapid quizzes with auto-grading.',
  },
  {
    icon: FileText,
    iconBg: '#EEF2FF',
    iconColor: '#4F46E5',
    title: 'Native Word & PDF export',
    desc: 'Generate fully formatted .docx and .pdf documents with cover page, running headers, table of contents, and references.',
  },
  {
    icon: Sparkles,
    iconBg: '#FFFBEB',
    iconColor: '#D97706',
    title: 'AI writing indicator',
    desc: 'Statistical perplexity-based analysis of your content. Purely analytical — your text is never modified or rewritten.',
  },
  {
    icon: GraduationCap,
    iconBg: '#F0FDFA',
    iconColor: '#0D9488',
    title: 'University templates',
    desc: "Save your institution's font, margin, spacing and citation requirements for instant reuse across assignments.",
  },
];

const TEN_STEPS = [
  { num: '01', title: 'Details & Metadata', stepId: 1 },
  { num: '02', title: 'Type & Voice Input', stepId: 2 },
  { num: '03', title: 'Outline Builder', stepId: 3 },
  { num: '04', title: 'Reference Files', stepId: 4 },
  { num: '05', title: 'Citation Style', stepId: 5 },
  { num: '06', title: 'Formatting & TOC', stepId: 6 },
  { num: '07', title: 'Live Paper Preview', stepId: 7 },
  { num: '08', title: 'AI Writing Check', stepId: 8 },
  { num: '09', title: 'Integrity Lock', stepId: 10 },
  { num: '10', title: 'DOCX / PDF Export', stepId: 11 },
];

export const LandingPage: React.FC<LandingPageProps> = ({ onStartNew, onOpenSample, onSelectStep, onOpenPractice }) => {
  return (
    <div style={{ padding: '2rem 0 6rem' }} className="animate-fade-in">
      {/* HERO SECTION */}
      <section
        style={{
          maxWidth: 1240,
          margin: '0 auto',
          padding: '2.5rem 1.5rem 2rem',
        }}
      >
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '2.5rem',
            alignItems: 'center',
          }}
        >
          {/* Left Hero Content */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.45rem',
                padding: '0.4rem 0.85rem',
                borderRadius: '99px',
                background: '#EEF2FF',
                color: '#4F46E5',
                fontSize: '0.75rem',
                fontWeight: 700,
                letterSpacing: '0.04em',
                textTransform: 'uppercase',
                border: '1px solid rgba(79, 70, 229, 0.15)',
                width: 'fit-content',
              }}
            >
              <Lock size={12} strokeWidth={2.5} />
              <span>Academic Integrity Guaranteed</span>
            </div>

            <h1
              className="display-1"
              style={{
                fontFamily: "'Playfair Display', 'Newsreader', Georgia, serif",
                fontSize: 'clamp(2.75rem, 5.5vw, 4.25rem)',
                fontWeight: 700,
                lineHeight: 1.08,
                letterSpacing: '-0.02em',
                color: 'var(--text-1)',
              }}
            >
              Bring your notes. We'll get your assignment formatted.
            </h1>

            <p className="body-lg" style={{ maxWidth: 540, fontSize: '1.05rem', lineHeight: 1.65 }}>
              Type your thoughts or speak your study notes. Assignly turns your raw research and references into a submission-ready Word or PDF document —{' '}
              <strong style={{ color: 'var(--text-1)', fontWeight: 700 }}>
                without rewriting a single sentence of your work.
              </strong>
            </p>

            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center', marginTop: '0.25rem' }}>
              <button className="btn btn-primary btn-xl" onClick={onStartNew}>
                <span>Create new assignment</span>
                <ArrowRight size={18} />
              </button>
              {onOpenPractice && (
                <button className="btn btn-secondary btn-xl" onClick={onOpenPractice} style={{ background: 'var(--accent-indigo-soft)', borderColor: 'var(--accent-indigo)', color: 'var(--accent-indigo)' }}>
                  <GraduationCap size={18} />
                  <span>Practice (Exams & Quizzes)</span>
                </button>
              )}
              <button className="btn btn-secondary btn-xl" onClick={onOpenSample}>
                <FileText size={18} color="var(--accent-indigo)" />
                <span>Explore sample document</span>
              </button>
            </div>

            {/* Stats Row */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
                gap: '1rem',
                paddingTop: '1.75rem',
                marginTop: '1.25rem',
                borderTop: '1px solid var(--border)',
              }}
            >
              {STATS.map((s) => (
                <div key={s.value}>
                  <div
                    style={{
                      fontSize: '1.45rem',
                      fontWeight: 800,
                      color: 'var(--accent-indigo)',
                      lineHeight: 1.1,
                    }}
                  >
                    {s.value}
                  </div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-3)', marginTop: 4, lineHeight: 1.35 }}>
                    {s.label}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right Hero Preview Card */}
          <div
            style={{
              background: 'var(--surface-inset)',
              border: '1px solid var(--border)',
              borderRadius: '24px',
              padding: '1.75rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '1.25rem',
              boxShadow: 'var(--shadow-sm)',
            }}
          >
            {/* Top Label */}
            <div
              style={{
                fontSize: '0.72rem',
                fontWeight: 800,
                letterSpacing: '0.08em',
                color: 'var(--text-3)',
                textTransform: 'uppercase',
                borderBottom: '1px dashed var(--border)',
                paddingBottom: '0.6rem',
              }}
            >
              Document Preview
            </div>

            {/* White Paper Box */}
            <div
              style={{
                background: '#ffffff',
                borderRadius: '14px',
                border: '1px solid var(--border)',
                padding: '1.35rem 1.5rem',
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.03)',
              }}
            >
              <div style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-1)', marginBottom: '1rem' }}>
                Research Assignment
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
                {[
                  { name: 'Introduction', count: '320w', active: true },
                  { name: 'Literature Review', count: '580w', active: true },
                  { name: 'Methodology', count: '440w', active: true },
                  { name: 'Discussion', count: '290w', active: true },
                  { name: 'Conclusion', count: '', active: false },
                  { name: 'References', count: '', active: false },
                ].map((item) => (
                  <div
                    key={item.name}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '0.55rem 0.85rem',
                      borderRadius: '8px',
                      background: item.active ? '#ECFDF5' : 'transparent',
                      border: item.active ? '1px solid rgba(16, 185, 129, 0.25)' : '1px transparent solid',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                      <div
                        style={{
                          width: 20,
                          height: 20,
                          borderRadius: '5px',
                          background: item.active ? '#10B981' : '#E2E8F0',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: '#ffffff',
                        }}
                      >
                        {item.active ? (
                          <ShieldCheck size={13} strokeWidth={2.5} />
                        ) : (
                          <div style={{ width: 10, height: 10, borderRadius: 2, background: '#CBD5E1' }} />
                        )}
                      </div>
                      <span
                        style={{
                          fontSize: '0.88rem',
                          fontWeight: item.active ? 600 : 400,
                          color: item.active ? '#0F172A' : '#94A3B8',
                        }}
                      >
                        {item.name}
                      </span>
                    </div>
                    {item.count && (
                      <span style={{ fontSize: '0.78rem', fontWeight: 600, color: '#10B981' }}>
                        {item.count}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Bottom Green Status Pill */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.75rem 1rem',
                borderRadius: '10px',
                background: '#ECFDF5',
                border: '1px solid rgba(16, 185, 129, 0.25)',
                color: '#047857',
                fontSize: '0.82rem',
                fontWeight: 700,
              }}
            >
              <ShieldCheck size={16} strokeWidth={2.5} />
              <span>All 1,630 words verified — no paraphrasing detected</span>
            </div>
          </div>
        </div>
      </section>

      {/* FEATURE GRID SECTION */}
      <section style={{ maxWidth: 1240, margin: '5rem auto 0', padding: '0 1.5rem' }}>
        <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
          <h2
            className="display-2"
            style={{
              fontFamily: "'Playfair Display', 'Newsreader', Georgia, serif",
              fontSize: 'clamp(2.1rem, 3.8vw, 2.75rem)',
              fontWeight: 700,
              marginBottom: '0.6rem',
            }}
          >
            Designed for real student workflows
          </h2>
          <p className="body-lg" style={{ maxWidth: 620, margin: '0 auto', fontSize: '1rem', color: 'var(--text-2)' }}>
            A practical workspace that handles formatting, references, and study practice so you can excel in your courses.
          </p>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
            gap: '1.5rem',
          }}
        >
          {WORKFLOW_FEATURES.map(({ icon: Icon, iconBg, iconColor, title, desc }) => (
            <div
              key={title}
              style={{
                background: '#ffffff',
                border: '1px solid var(--border)',
                borderRadius: '16px',
                padding: '1.75rem',
                display: 'flex',
                flexDirection: 'column',
                gap: '1rem',
                boxShadow: 'var(--shadow-sm)',
                transition: 'all 0.2s ease',
              }}
              className="card-hover-effect"
            >
              <div
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: '12px',
                  background: iconBg,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Icon size={22} color={iconColor} strokeWidth={2.2} />
              </div>
              <div>
                <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-1)', marginBottom: '0.45rem' }}>
                  {title}
                </h3>
                <p className="body-md" style={{ fontSize: '0.88rem', lineHeight: 1.55, color: 'var(--text-3)' }}>
                  {desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* DEDICATED PRACTICE FEATURE INTRO SECTION */}
      {onOpenPractice && (
        <section style={{ maxWidth: 1240, margin: '5rem auto 0', padding: '0 1.5rem' }}>
          <div
            className="card"
            style={{
              padding: '2.5rem 1.5rem',
              borderRadius: '24px',
              background: 'linear-gradient(135deg, rgba(79, 70, 229, 0.04) 0%, rgba(16, 185, 129, 0.04) 100%)',
              border: '1.5px solid rgba(79, 70, 229, 0.2)',
              boxShadow: 'var(--shadow-md)',
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
              gap: '2rem',
              alignItems: 'center'
            }}
          >
            <div>
              <span
                className="badge badge-indigo"
                style={{
                  marginBottom: '1rem',
                  padding: '0.45rem 1.15rem',
                  fontSize: '0.78rem',
                  fontWeight: 700,
                  letterSpacing: '0.05em'
                }}
              >
                NEW FEATURE • PRACTICE SYSTEM
              </span>
              <h2
                style={{
                  fontFamily: "'Playfair Display', 'Newsreader', Georgia, serif",
                  fontSize: 'clamp(2.1rem, 3.5vw, 2.8rem)',
                  fontWeight: 800,
                  color: 'var(--text-1)',
                  marginBottom: '1rem',
                  lineHeight: 1.15
                }}
              >
                Resource-Based Mock Exams & Quizzes
              </h2>
              <p className="body-md" style={{ fontSize: '1rem', color: 'var(--text-2)', lineHeight: 1.65, marginBottom: '1.75rem' }}>
                Study directly from your uploaded university PDFs. Assignly strictly grounds all questions, definitions, and model answers directly in your lecture material — zero hallucinated facts.
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '2rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <CheckCircle2 size={18} color="var(--accent-indigo)" />
                  <span style={{ fontSize: '0.92rem', fontWeight: 600, color: 'var(--text-1)' }}>
                    <strong>Mock Exams:</strong> Supports Full Exam, Selected Part, and Model Exam modes.
                  </span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <CheckCircle2 size={18} color="var(--accent-emerald)" />
                  <span style={{ fontSize: '0.92rem', fontWeight: 600, color: 'var(--text-1)' }}>
                    <strong>Rapid Quizzes:</strong> Instant MCQ and True/False retention checks.
                  </span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <CheckCircle2 size={18} color="var(--accent-amber)" />
                  <span style={{ fontSize: '0.92rem', fontWeight: 600, color: 'var(--text-1)' }}>
                    <strong>Direct Verification:</strong> Click any question to open exact PDF page source.
                  </span>
                </div>
              </div>

              <button
                onClick={onOpenPractice}
                className="btn btn-primary btn-xl"
                style={{ borderRadius: '14px', padding: '0.9rem 2rem' }}
              >
                <Zap size={20} />
                <span>Launch Practice Workspace</span>
                <ArrowRight size={18} />
              </button>
            </div>

            {/* Right Interactive Practice Feature Cards */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div
                onClick={onOpenPractice}
                className="card card-hover-effect"
                style={{
                  padding: '1.65rem 1.5rem',
                  borderRadius: '18px',
                  background: '#ffffff',
                  border: '1.5px solid var(--border)',
                  cursor: 'pointer',
                  boxShadow: 'var(--shadow-sm)'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.5rem' }}>
                  <div style={{ width: 44, height: 44, borderRadius: '12px', background: 'var(--accent-indigo-soft)', color: 'var(--accent-indigo)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Award size={24} />
                  </div>
                  <div>
                    <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-1)', margin: 0 }}>1. MOCK EXAM</h3>
                    <span className="body-sm" style={{ fontSize: '0.78rem', color: 'var(--accent-indigo)', fontWeight: 600 }}>Full • Selected Part • Model</span>
                  </div>
                </div>
                <p className="body-sm" style={{ color: 'var(--text-3)', margin: 0, lineHeight: 1.5 }}>
                  Practice complete university exam papers with definitions, short answers, and critical analysis.
                </p>
              </div>

              <div
                onClick={onOpenPractice}
                className="card card-hover-effect"
                style={{
                  padding: '1.65rem 1.5rem',
                  borderRadius: '18px',
                  background: '#ffffff',
                  border: '1.5px solid var(--border)',
                  cursor: 'pointer',
                  boxShadow: 'var(--shadow-sm)'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.5rem' }}>
                  <div style={{ width: 44, height: 44, borderRadius: '12px', background: 'var(--accent-emerald-soft)', color: 'var(--accent-emerald)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Zap size={24} />
                  </div>
                  <div>
                    <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-1)', margin: 0 }}>2. QUIZZES</h3>
                    <span className="body-sm" style={{ fontSize: '0.78rem', color: 'var(--accent-emerald)', fontWeight: 600 }}>Rapid Retention Testing</span>
                  </div>
                </div>
                <p className="body-sm" style={{ color: 'var(--text-3)', margin: 0, lineHeight: 1.5 }}>
                  Test your recall with instant multiple-choice questions & immediate scoring explanations.
                </p>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* 10-STEP WORKFLOW SECTION */}
      <section style={{ maxWidth: 1240, margin: '5rem auto 0', padding: '0 1.5rem' }}>
        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <div
            style={{
              fontSize: '0.75rem',
              fontWeight: 800,
              letterSpacing: '0.1em',
              color: 'var(--accent-indigo)',
              textTransform: 'uppercase',
              marginBottom: '0.5rem',
            }}
          >
            Step-by-Step Workflow
          </div>
          <h2
            className="display-2"
            style={{
              fontFamily: "'Playfair Display', 'Newsreader', Georgia, serif",
              fontSize: 'clamp(2.1rem, 3.8vw, 2.75rem)',
              fontWeight: 700,
            }}
          >
            From raw notes to submission in 10 steps
          </h2>
        </div>

        {/* 10 Step Grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
            gap: '0.85rem',
          }}
        >
          {TEN_STEPS.map((s) => (
            <button
              key={s.num}
              onClick={() => onSelectStep ? onSelectStep(s.stepId) : onStartNew()}
              style={{
                background: '#ffffff',
                border: '1px solid var(--border)',
                borderRadius: '12px',
                padding: '1.15rem 1.25rem',
                textAlign: 'left',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.5rem',
                cursor: 'pointer',
                transition: 'all 0.18s ease',
                boxShadow: 'var(--shadow-sm)',
                outline: 'none',
              }}
              className="step-card-btn"
            >
              <div
                style={{
                  fontSize: '0.78rem',
                  fontWeight: 800,
                  color: 'var(--accent-indigo)',
                }}
              >
                {s.num}
              </div>
              <div
                style={{
                  fontSize: '0.9rem',
                  fontWeight: 700,
                  color: 'var(--text-1)',
                  lineHeight: 1.3,
                }}
              >
                {s.title}
              </div>
            </button>
          ))}
        </div>

        {/* Centered CTA */}
        <div style={{ display: 'flex', justifyContent: 'center', marginTop: '2.75rem' }}>
          <button className="btn btn-primary btn-xl" onClick={onStartNew}>
            <span>Start your first assignment</span>
            <ArrowRight size={18} />
          </button>
        </div>
      </section>
    </div>
  );
};
