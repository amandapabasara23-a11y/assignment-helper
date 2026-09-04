import React from 'react';
import type { Assignment, ReferencingStyle, CitationStylePreference } from '../../types';
import { ArrowRight, ArrowLeft, BookmarkCheck } from 'lucide-react';
import { performReferenceAudit, formatReferenceItem } from '../../utils/references';

interface Step5CitationStyleProps {
  assignment: Assignment;
  updateAssignment: (updates: Partial<Assignment>) => void;
  onNext: () => void;
  onPrev: () => void;
}

const STYLES: ReferencingStyle[] = ['APA 7th Edition','Harvard','MLA 9th Edition','Chicago','IEEE','Vancouver','AMA','OSCOLA','Custom'];
const PREFS: CitationStylePreference[] = ['Author-date','Numbered','Footnotes','Custom'];

const STYLE_INFO: Record<string, string> = {
  'APA 7th Edition': 'Used in social sciences, psychology, nursing',
  'Harvard': 'Common in UK universities across many disciplines',
  'MLA 9th Edition': 'Preferred in humanities and language arts',
  'Chicago': 'Used in history, arts, and social sciences',
  'IEEE': 'Standard in engineering and computer science',
  'Vancouver': 'Used in biomedical and health sciences',
  'AMA': 'Medical and healthcare publications',
  'OSCOLA': 'Oxford standard for legal citations',
  'Custom': 'Define your own custom formatting rules',
};

export const Step5CitationStyle: React.FC<Step5CitationStyleProps> = ({ assignment, updateAssignment, onNext, onPrev }) => {
  const audit = performReferenceAudit(assignment.sections, assignment.references);

  const handleStyleChange = (style: ReferencingStyle) => {
    let pref: CitationStylePreference = 'Author-date';
    if (style === 'IEEE' || style === 'Vancouver') pref = 'Numbered';
    if (style === 'OSCOLA') pref = 'Footnotes';
    updateAssignment({ referencingStyle: style, citationStylePreference: pref });
  };

  return (
    <div className="animate-fade-up" style={{ maxWidth: 860, margin: '0 auto', padding: '2rem 0' }}>
      <div style={{ marginBottom: '1.5rem' }}>
        <span className="overline" style={{ color: 'var(--indigo)', display: 'block', marginBottom: '0.4rem' }}>Step 5 of 10</span>
        <h2 style={{ fontFamily: 'Newsreader, serif', fontSize: '1.875rem', fontWeight: 500, color: 'var(--text-1)', letterSpacing: '-0.015em', marginBottom: '0.25rem' }}>
          Referencing style & citation audit
        </h2>
        <p className="body-sm">Select your university's required citation standard and verify citation completeness.</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: '1rem', marginBottom: '1.5rem' }}>
        {/* Style selector */}
        <div className="card" style={{ padding: '1.5rem' }}>
          <label className="label" style={{ marginBottom: '0.75rem' }}>Select referencing standard</label>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', marginBottom: '1.25rem' }}>
            {STYLES.map((style) => {
              const selected = assignment.referencingStyle === style;
              return (
                <button
                  key={style}
                  onClick={() => handleStyleChange(style)}
                  style={{
                    padding: '0.75rem',
                    borderRadius: 'var(--r-sm)',
                    border: `1.5px solid ${selected ? 'var(--indigo)' : 'var(--border)'}`,
                    background: selected ? 'var(--indigo-soft)' : 'var(--surface)',
                    cursor: 'pointer',
                    textAlign: 'left',
                    transition: 'all 0.12s',
                  }}
                >
                  <div style={{ fontSize: '0.8125rem', fontWeight: 700, color: selected ? 'var(--indigo)' : 'var(--text-1)', marginBottom: 2 }}>
                    {style}
                  </div>
                  <div style={{ fontSize: '0.6875rem', color: selected ? 'var(--indigo-mid)' : 'var(--text-4)', lineHeight: 1.35 }}>
                    {STYLE_INFO[style]}
                  </div>
                </button>
              );
            })}
          </div>

          <div style={{ borderTop: '1px solid var(--border)', paddingTop: '1rem' }}>
            <label className="label">In-text citation format</label>
            <select
              className="select"
              value={assignment.citationStylePreference}
              onChange={(e) => updateAssignment({ citationStylePreference: e.target.value as CitationStylePreference })}
            >
              {PREFS.map(p => <option key={p} value={p}>{p}</option>)}
            </select>
          </div>
        </div>

        {/* Audit panel */}
        <div className="card" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', paddingBottom: '0.75rem', borderBottom: '1px solid var(--border)' }}>
            <BookmarkCheck size={15} color="var(--indigo)" />
            <span style={{ fontWeight: 600, fontSize: '0.9375rem', color: 'var(--text-1)' }}>Citation audit</span>
          </div>

          {[
            { label: 'Sources uploaded',    value: audit.sourcesUploaded,         color: 'var(--text-1)' },
            { label: 'Complete metadata',   value: audit.successfullyIdentified,  color: 'var(--emerald)' },
            { label: 'Missing information', value: audit.missingInfoCount,         color: 'var(--amber)' },
            { label: 'In-text matches',     value: audit.inTextCitationsDetected, color: 'var(--indigo)' },
          ].map(({ label, value, color }) => (
            <div key={label} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.5rem 0', borderBottom: '1px solid var(--border)' }}>
              <span className="body-sm">{label}</span>
              <strong style={{ color, fontSize: '1rem', fontFamily: 'Newsreader, serif' }}>{value}</strong>
            </div>
          ))}

          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.375rem 0' }}>
            <span className="body-sm">Not cited in body</span>
            <strong style={{ color: 'var(--text-2)', fontSize: '0.9375rem' }}>{audit.referencesNotCited}</strong>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.375rem 0' }}>
            <span className="body-sm">Unmatched citations</span>
            <strong style={{ color: 'var(--text-2)', fontSize: '0.9375rem' }}>{audit.citationsWithoutMatchingRef}</strong>
          </div>
        </div>
      </div>

      {/* Reference list preview */}
      {assignment.references.length > 0 && (
        <div className="card" style={{ padding: '1.5rem', marginBottom: '1.5rem' }}>
          <p style={{ fontWeight: 600, fontSize: '0.875rem', color: 'var(--text-1)', marginBottom: '0.875rem' }}>
            Formatted reference list preview — {assignment.referencingStyle}
          </p>
          <div style={{ background: 'var(--surface-2)', borderRadius: 'var(--r-sm)', border: '1px solid var(--border)', padding: '1rem 1.25rem' }}>
            {assignment.references.map((ref) => (
              <p key={ref.id} style={{ fontFamily: 'Newsreader, serif', fontSize: '0.9375rem', lineHeight: 1.7, marginBottom: '0.5rem', color: 'var(--text-1)' }}>
                {formatReferenceItem(ref, assignment.referencingStyle)}
              </p>
            ))}
          </div>
        </div>
      )}

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '1.5rem', borderTop: '1px solid var(--border)' }}>
        <button className="btn btn-secondary" onClick={onPrev}><ArrowLeft size={15} /> Back</button>
        <button className="btn btn-primary btn-lg" onClick={onNext}>Continue to formatting <ArrowRight size={15} /></button>
      </div>
    </div>
  );
};
