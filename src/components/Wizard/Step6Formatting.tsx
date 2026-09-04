import React, { useState } from 'react';
import type { Assignment, FormattingSettings, FontFamily, FontSize, LineSpacing, TextAlignment, PageMargin, PageSize, PageNumbering, UniversityTemplate } from '../../types';
import { Save, Check, ArrowRight, ArrowLeft, Bookmark } from 'lucide-react';
import { saveTemplateToStorage } from '../../utils/storage';

interface Step6FormattingProps {
  assignment: Assignment;
  updateAssignment: (updates: Partial<Assignment>) => void;
  onNext: () => void;
  onPrev: () => void;
}

const FONTS: FontFamily[] = ['Times New Roman','Arial','Calibri','Aptos','Georgia'];
const SIZES: FontSize[] = ['10pt','11pt','12pt','14pt'];
const SPACINGS: LineSpacing[] = ['1.0','1.15','1.5','2.0'];
const ALIGNMENTS: TextAlignment[] = ['Left','Justified'];
const MARGINS: PageMargin[] = ['Normal (2.54 cm)','Narrow (1.27 cm)','Moderate','Wide'];
const PAGE_SIZES: PageSize[] = ['A4','Letter'];
const PAGE_NUMBERS: PageNumbering[] = ['Bottom center','Bottom right','Top right','None'];


export const Step6Formatting: React.FC<Step6FormattingProps> = ({ assignment, updateAssignment, onNext, onPrev }) => {
  const [templateName, setTemplateName] = useState('');
  const [saved, setSaved] = useState(false);

  const set = (field: keyof FormattingSettings, value: any) => {
    updateAssignment({ formatting: { ...assignment.formatting, [field]: value } });
  };

  const handleSave = () => {
    if (!templateName.trim()) return;
    const tmpl: UniversityTemplate = {
      id: `tmpl-${Date.now()}`,
      name: templateName.trim(),
      institution: assignment.institution || 'Custom Institution',
      description: `${assignment.formatting.fontFamily} ${assignment.formatting.fontSize}, ${assignment.formatting.lineSpacing} spacing, ${assignment.referencingStyle}`,
      formatting: { ...assignment.formatting },
      defaultReferencingStyle: assignment.referencingStyle,
    };
    saveTemplateToStorage(tmpl);
    setSaved(true);
    setTemplateName('');
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="animate-fade-up" style={{ maxWidth: 800, margin: '0 auto', padding: '2rem 0' }}>
      <div style={{ marginBottom: '1.5rem' }}>
        <span className="overline" style={{ color: 'var(--indigo)', display: 'block', marginBottom: '0.4rem' }}>Step 6 of 10</span>
        <h2 style={{ fontFamily: 'Newsreader, serif', fontSize: '1.875rem', fontWeight: 500, color: 'var(--text-1)', letterSpacing: '-0.015em', marginBottom: '0.25rem' }}>
          Document formatting & layout
        </h2>
        <p className="body-sm">Set typography, line spacing, margins, and page numbering for your output document.</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
        {/* Typography */}
        <div className="card" style={{ padding: '1.5rem' }}>
          <h3 style={{ fontWeight: 700, fontSize: '0.9375rem', color: 'var(--text-1)', marginBottom: '1rem', paddingBottom: '0.5rem', borderBottom: '1px solid var(--border)' }}>
            Typography
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
              <label className="label">Font family</label>
              <select className="select" value={assignment.formatting.fontFamily} onChange={e => set('fontFamily', e.target.value as FontFamily)}>
                {FONTS.map(f => <option key={f} value={f}>{f}</option>)}
              </select>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
                <label className="label">Font size</label>
                <select className="select" value={assignment.formatting.fontSize} onChange={e => set('fontSize', e.target.value as FontSize)}>
                  {SIZES.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
                <label className="label">Line spacing</label>
                <select className="select" value={assignment.formatting.lineSpacing} onChange={e => set('lineSpacing', e.target.value as LineSpacing)}>
                  {SPACINGS.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
              <label className="label">Text alignment</label>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                {ALIGNMENTS.map(a => (
                  <button
                    key={a}
                    onClick={() => set('alignment', a)}
                    className={assignment.formatting.alignment === a ? 'btn btn-primary btn-sm' : 'btn btn-secondary btn-sm'}
                    style={{ flex: 1 }}
                  >
                    {a}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Page Layout */}
        <div className="card" style={{ padding: '1.5rem' }}>
          <h3 style={{ fontWeight: 700, fontSize: '0.9375rem', color: 'var(--text-1)', marginBottom: '1rem', paddingBottom: '0.5rem', borderBottom: '1px solid var(--border)' }}>
            Page layout
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
                <label className="label">Page size</label>
                <select className="select" value={assignment.formatting.pageSize} onChange={e => set('pageSize', e.target.value as PageSize)}>
                  {PAGE_SIZES.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
                <label className="label">Margins</label>
                <select className="select" value={assignment.formatting.margin} onChange={e => set('margin', e.target.value as PageMargin)}>
                  {MARGINS.map(m => <option key={m} value={m}>{m}</option>)}
                </select>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
              <label className="label">Page numbering position</label>
              <select className="select" value={assignment.formatting.pageNumbering} onChange={e => set('pageNumbering', e.target.value as PageNumbering)}>
                {PAGE_NUMBERS.map(n => <option key={n} value={n}>{n}</option>)}
              </select>
            </div>

            <div style={{ borderTop: '1px solid var(--border)', paddingTop: '0.875rem', display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontSize: '0.875rem', fontWeight: 500, color: 'var(--text-1)' }}>
                <input type="checkbox" className="checkbox" checked={assignment.formatting.includeCoverPage} onChange={e => set('includeCoverPage', e.target.checked)} />
                Include university cover page
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontSize: '0.875rem', fontWeight: 500, color: 'var(--text-1)' }}>
                <input type="checkbox" className="checkbox" checked={assignment.formatting.includeTableOfContents} onChange={e => set('includeTableOfContents', e.target.checked)} />
                Include table of contents
              </label>
            </div>
          </div>
        </div>
      </div>

      {/* Save Template */}
      <div className="card" style={{ padding: '1.25rem', marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
          <Bookmark size={14} color="var(--indigo)" />
          <span style={{ fontWeight: 600, fontSize: '0.875rem', color: 'var(--text-1)' }}>Save as university template</span>
        </div>
        <p className="body-sm" style={{ marginBottom: '0.875rem' }}>
          Save these formatting rules so you can reuse them for all future assignments from the same institution.
        </p>
        <div style={{ display: 'flex', gap: '0.625rem' }}>
          <input
            type="text"
            className="input input-sm"
            style={{ flex: 1 }}
            placeholder="e.g. University of Colombo — Engineering Report"
            value={templateName}
            onChange={e => setTemplateName(e.target.value)}
          />
          <button className="btn btn-secondary btn-sm" onClick={handleSave} disabled={!templateName.trim()}>
            {saved ? <><Check size={13} /> Saved!</> : <><Save size={13} /> Save</>}
          </button>
        </div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '1.5rem', borderTop: '1px solid var(--border)' }}>
        <button className="btn btn-secondary" onClick={onPrev}><ArrowLeft size={15} /> Back</button>
        <button className="btn btn-primary btn-lg" onClick={onNext}>Continue to live preview <ArrowRight size={15} /></button>
      </div>
    </div>
  );
};
