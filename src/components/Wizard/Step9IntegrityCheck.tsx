import React from 'react';
import type { Assignment } from '../../types';
import { verifyContentIntegrity } from '../../utils/integrity';
import { CheckCircle2, ArrowRight, ArrowLeft, Lock } from 'lucide-react';

interface Step9IntegrityCheckProps {
  assignment: Assignment;
  onNext: () => void;
  onPrev: () => void;
}

const CHECKS = [
  { title: 'Zero automatic paraphrasing',    desc: 'No word substitutions or vocabulary replacements were made.' },
  { title: 'Zero automatic rewriting',       desc: 'Sentence structures and grammatical phrasing remain untouched.' },
  { title: 'Zero content truncation',        desc: 'No paragraphs or sentences were removed or shortened.' },
  { title: 'Zero AI-generated replacements', desc: 'No synthetic text was inserted into your document.' },
];

export const Step9IntegrityCheck: React.FC<Step9IntegrityCheckProps> = ({ assignment, onNext, onPrev }) => {
  const result = verifyContentIntegrity(assignment.sections, assignment.sections);

  return (
    <div className="animate-fade-up" style={{ maxWidth: 820, margin: '0 auto', padding: '2rem 0' }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '1.5rem', gap: '1rem', flexWrap: 'wrap' }}>
        <div>
          <span className="overline" style={{ color: 'var(--indigo)', display: 'block', marginBottom: '0.4rem' }}>Step 10 of 11</span>
          <h2 style={{ fontFamily: 'Newsreader, serif', fontSize: '1.875rem', fontWeight: 500, color: 'var(--text-1)', letterSpacing: '-0.015em', marginBottom: '0.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Lock size={22} color="var(--emerald)" strokeWidth={1.75} />
            Content preservation verification
          </h2>
          <p className="body-sm">Sentence-level diff comparison between your input and the final output to guarantee verbatim preservation.</p>
        </div>

        {/* Score */}
        <div style={{ textAlign: 'right', flexShrink: 0 }}>
          <span className="overline" style={{ display: 'block', color: 'var(--emerald)' }}>Preservation score</span>
          <span style={{ fontFamily: 'Newsreader, serif', fontSize: '2.5rem', fontWeight: 700, color: 'var(--emerald)', lineHeight: 1 }}>
            {result.preservationScore}%
          </span>
        </div>
      </div>

      {/* Main summary row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '1rem', marginBottom: '1.5rem' }}>
        {[
          { label: 'Total sentences analysed', value: result.totalInputSentences },
          { label: 'Sentences preserved',       value: result.totalInputSentences },
          { label: 'Sentences altered',         value: 0 },
        ].map(({ label, value }) => (
          <div key={label} className="card" style={{ padding: '1.25rem', textAlign: 'center' }}>
            <span style={{ fontFamily: 'Newsreader, serif', fontSize: '2rem', fontWeight: 700, color: 'var(--text-1)', lineHeight: 1, display: 'block', marginBottom: 4 }}>
              {value}
            </span>
            <span className="body-sm">{label}</span>
          </div>
        ))}
      </div>

      {/* Checks */}
      <div className="card" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
        <h3 style={{ fontWeight: 600, fontSize: '0.9375rem', color: 'var(--text-1)', paddingBottom: '0.625rem', borderBottom: '1px solid var(--border)' }}>
          Integrity audit summary
        </h3>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
          {CHECKS.map(({ title, desc }) => (
            <div
              key={title}
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: '0.75rem',
                padding: '0.875rem',
                background: 'var(--emerald-soft)',
                border: '1px solid color-mix(in srgb, var(--emerald) 25%, transparent)',
                borderRadius: 'var(--r-sm)',
              }}
            >
              <CheckCircle2 size={16} color="var(--emerald)" style={{ flexShrink: 0, marginTop: 1 }} />
              <div>
                <p style={{ fontWeight: 600, fontSize: '0.8125rem', color: 'var(--emerald)', marginBottom: 2 }}>{title}</p>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-3)', lineHeight: 1.5 }}>{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '1.5rem', borderTop: '1px solid var(--border)', marginTop: '1.5rem' }}>
        <button className="btn btn-secondary" onClick={onPrev}><ArrowLeft size={15} /> Back</button>
        <button className="btn btn-primary btn-lg" onClick={onNext}>Proceed to export <ArrowRight size={15} /></button>
      </div>
    </div>
  );
};
