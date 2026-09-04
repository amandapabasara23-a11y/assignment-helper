import React from 'react';
import type { Assignment } from '../../types';
import { LivePreviewPaper } from '../LivePreviewPaper';
import { Eye, ArrowRight, ArrowLeft, Layers } from 'lucide-react';

interface Step7PreviewProps {
  assignment: Assignment;
  onNext: () => void;
  onPrev: () => void;
}

export const Step7Preview: React.FC<Step7PreviewProps> = ({ assignment, onNext, onPrev }) => {
  const totalWords = assignment.sections.reduce((acc, sec) => {
    const t = sec.originalText.trim();
    return acc + (t ? t.split(/\s+/).length : 0);
  }, 0);

  return (
    <div className="animate-fade-up" style={{ maxWidth: 1200, margin: '0 auto', padding: '2rem 0' }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '1.5rem', gap: '1rem', flexWrap: 'wrap' }}>
        <div>
          <span className="overline" style={{ color: 'var(--indigo)', display: 'block', marginBottom: '0.4rem' }}>Step 7 of 10</span>
          <h2 style={{ fontFamily: 'Newsreader, serif', fontSize: '1.875rem', fontWeight: 500, color: 'var(--text-1)', letterSpacing: '-0.015em', marginBottom: '0.25rem' }}>
            Live document preview
          </h2>
          <p className="body-sm">Real-time A4 paper rendering of your document as it will be exported.</p>
        </div>
        <span style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', padding: '0.25rem 0.625rem', background: 'var(--indigo-soft)', borderRadius: 4, fontSize: '0.6875rem', fontWeight: 700, color: 'var(--indigo)', border: '1px solid color-mix(in srgb, var(--indigo) 25%, transparent)' }}>
          <Eye size={11} /> LIVE RENDER
        </span>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '260px 1fr', gap: '1rem' }}>
        {/* Left outline */}
        <div className="card" style={{ padding: '1rem', alignSelf: 'start', position: 'sticky', top: 70 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.875rem', paddingBottom: '0.625rem', borderBottom: '1px solid var(--border)' }}>
            <Layers size={14} color="var(--indigo)" />
            <span style={{ fontWeight: 600, fontSize: '0.875rem', color: 'var(--text-1)' }}>Document outline</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem', fontSize: '0.8125rem', marginBottom: '1rem' }}>
            {assignment.formatting.includeCoverPage && (
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.375rem 0.5rem', background: 'var(--surface-2)', borderRadius: 4 }}>
                <span style={{ color: 'var(--text-1)', fontWeight: 500 }}>Cover Page</span>
                <span style={{ color: 'var(--text-4)' }}>p.1</span>
              </div>
            )}
            {assignment.formatting.includeTableOfContents && (
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.375rem 0.5rem', background: 'var(--surface-2)', borderRadius: 4 }}>
                <span style={{ color: 'var(--text-1)', fontWeight: 500 }}>Table of Contents</span>
                <span style={{ color: 'var(--text-4)' }}>p.{assignment.formatting.includeCoverPage ? 2 : 1}</span>
              </div>
            )}
            {assignment.sections.map((sec, i) => (
              <div key={sec.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.375rem 0.5rem', background: 'var(--surface-2)', borderRadius: 4 }}>
                <span style={{ color: 'var(--text-1)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 150 }}>
                  {i + 1}. {sec.title}
                </span>
                <span style={{ color: 'var(--text-4)', flexShrink: 0 }}>
                  {sec.originalText.trim() ? sec.originalText.trim().split(/\s+/).length : 0}w
                </span>
              </div>
            ))}
            {assignment.references.length > 0 && (
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.375rem 0.5rem', background: 'var(--surface-2)', borderRadius: 4 }}>
                <span style={{ color: 'var(--text-1)', fontWeight: 500 }}>References</span>
                <span style={{ color: 'var(--indigo)', fontWeight: 600 }}>{assignment.references.length}×</span>
              </div>
            )}
          </div>

          <div style={{ borderTop: '1px solid var(--border)', paddingTop: '0.75rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {[
              { label: 'Typography', value: `${assignment.formatting.fontFamily} ${assignment.formatting.fontSize}` },
              { label: 'Spacing',    value: assignment.formatting.lineSpacing },
              { label: 'Citing',     value: assignment.referencingStyle },
              { label: 'Words',      value: totalWords.toLocaleString() },
            ].map(({ label, value }) => (
              <div key={label} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem' }}>
                <span style={{ color: 'var(--text-3)' }}>{label}</span>
                <strong style={{ color: 'var(--text-1)', fontWeight: 600 }}>{value}</strong>
              </div>
            ))}
          </div>
        </div>

        {/* Paper preview */}
        <div className="card" style={{ overflow: 'hidden', minHeight: 600 }}>
          <LivePreviewPaper assignment={assignment} />
        </div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '1.5rem', borderTop: '1px solid var(--border)', marginTop: '1.5rem' }}>
        <button className="btn btn-secondary" onClick={onPrev}><ArrowLeft size={15} /> Back</button>
        <button className="btn btn-primary btn-lg" onClick={onNext}>Continue to AI writing check <ArrowRight size={15} /></button>
      </div>
    </div>
  );
};
