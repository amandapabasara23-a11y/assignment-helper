import React, { useState } from 'react';
import type { Assignment, AssignmentSection } from '../../types';
import { MoveUp, MoveDown, Plus, Trash2, ArrowRight, ArrowLeft, Sparkles, Check, GripVertical } from 'lucide-react';
import { autoOrganizeStructure, computeHierarchicalNumbers } from '../../utils/aiOrganizer';

interface Step3StructureProps {
  assignment: Assignment;
  updateAssignment: (updates: Partial<Assignment>) => void;
  onNext: () => void;
  onPrev: () => void;
}

const SUGGESTED_STRUCTURES: Record<string, string[]> = {
  'Essay':              ['Introduction', 'Background', 'Argument', 'Counter-argument', 'Discussion', 'Conclusion'],
  'Report':             ['Executive Summary', 'Introduction', 'Methodology', 'Findings', 'Analysis', 'Recommendations', 'Conclusion'],
  'Research Assignment':['Abstract', 'Introduction', 'Literature Review', 'Methodology', 'Results', 'Discussion', 'Conclusion'],
  'Literature Review':  ['Introduction', 'Theoretical Framework', 'Review of Literature', 'Analysis & Synthesis', 'Gaps & Future Research', 'Conclusion'],
  'Case Study':         ['Introduction', 'Case Background', 'Analysis', 'Discussion', 'Recommendations', 'Conclusion'],
  'Lab Report':         ['Abstract', 'Introduction', 'Methods', 'Results', 'Discussion', 'Conclusion'],
};

export const Step3Structure: React.FC<Step3StructureProps> = ({ assignment, updateAssignment, onNext, onPrev }) => {
  const [showSuggestion, setShowSuggestion] = useState(false);
  const [isOrganizing, setIsOrganizing] = useState(false);

  const numberMap = computeHierarchicalNumbers(assignment.sections);

  const move = (i: number, dir: 'up' | 'down') => {
    const ni = dir === 'up' ? i - 1 : i + 1;
    if (ni < 0 || ni >= assignment.sections.length) return;
    const arr = [...assignment.sections];
    [arr[i], arr[ni]] = [arr[ni], arr[i]];
    updateAssignment({ sections: arr });
  };

  const setTitle = (id: string, title: string) =>
    updateAssignment({ sections: assignment.sections.map(s => s.id === id ? { ...s, title } : s) });

  const setLevel = (id: string, level: 1 | 2 | 3) =>
    updateAssignment({ sections: assignment.sections.map(s => s.id === id ? { ...s, headingLevel: level } : s) });

  const del = (id: string) => {
    if (assignment.sections.length <= 1) return;
    updateAssignment({ sections: assignment.sections.filter(s => s.id !== id) });
  };

  const addSection = (headingLevel: 1 | 2 | 3 = 1) => {
    const sec: AssignmentSection = { id: `sec-${Date.now()}`, title: 'New Topic', headingLevel, originalText: '' };
    updateAssignment({ sections: [...assignment.sections, sec] });
  };

  const handleAutoOrganizeAI = () => {
    setIsOrganizing(true);
    setTimeout(() => {
      const organized = autoOrganizeStructure(assignment);
      updateAssignment({ sections: organized });
      setIsOrganizing(false);
      setShowSuggestion(false);
    }, 600);
  };

  const applySuggestion = () => {
    const type = assignment.assignmentType;
    const titles = SUGGESTED_STRUCTURES[type] ?? SUGGESTED_STRUCTURES['Essay'];
    const sections: AssignmentSection[] = titles.map((t, i) => ({
      id: `sec-sugg-${i}`,
      title: t,
      headingLevel: 1,
      originalText: assignment.sections.find(s => s.title === t)?.originalText ?? '',
    }));
    updateAssignment({ sections });
    setShowSuggestion(false);
  };

  return (
    <div className="animate-fade-up" style={{ maxWidth: 880, margin: '0 auto', padding: '2rem 0' }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '1.5rem', gap: '1rem', flexWrap: 'wrap' }}>
        <div>
          <span className="overline" style={{ color: 'var(--indigo)', display: 'block', marginBottom: '0.4rem' }}>Step 3 of 10</span>
          <h2 style={{ fontFamily: 'Newsreader, serif', fontSize: '1.875rem', fontWeight: 500, color: 'var(--text-1)', letterSpacing: '-0.015em', marginBottom: '0.25rem' }}>
            Organise document topic hierarchy
          </h2>
          <p className="body-sm">Set heading levels: H1 for Main Topics, H2 for Subtopics, and H3 for Minor Topics.</p>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem', flexShrink: 0, flexWrap: 'wrap' }}>
          <button className="btn btn-primary btn-sm" onClick={handleAutoOrganizeAI} disabled={isOrganizing}>
            <Sparkles size={13} />
            {isOrganizing ? 'Organizing…' : 'Auto Organize Structure (AI)'}
          </button>
          <button className="btn btn-secondary btn-sm" onClick={() => setShowSuggestion(!showSuggestion)}>
            {showSuggestion ? 'Hide template' : 'Template structure'}
          </button>
          <button className="btn btn-secondary btn-sm" onClick={() => addSection(1)}>
            <Plus size={13} /> Add Topic
          </button>
        </div>
      </div>

      {/* AI Suggestion panel */}
      {showSuggestion && (
        <div className="card animate-fade-in" style={{ padding: '1.25rem', marginBottom: '1rem', borderLeft: '3px solid var(--indigo)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.875rem' }}>
            <span style={{ fontWeight: 600, fontSize: '0.875rem', color: 'var(--text-1)' }}>
              Standard Academic Outline for <em>{assignment.assignmentType}</em>
            </span>
          </div>
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
            {(SUGGESTED_STRUCTURES[assignment.assignmentType] ?? SUGGESTED_STRUCTURES['Essay']).map((t, i) => (
              <span key={i} style={{ padding: '0.25rem 0.625rem', background: 'var(--indigo-soft)', borderRadius: 4, fontSize: '0.8125rem', color: 'var(--indigo)', fontWeight: 500 }}>
                {t}
              </span>
            ))}
          </div>
          <p className="body-sm" style={{ marginBottom: '0.875rem' }}>
            Your existing content will be preserved and mapped to matching topic names.
          </p>
          <button className="btn btn-secondary btn-sm" onClick={applySuggestion}>
            <Check size={13} /> Apply template
          </button>
        </div>
      )}

      {/* Section list */}
      <div className="card" style={{ overflow: 'hidden' }}>
        {/* Table header */}
        <div style={{ display: 'grid', gridTemplateColumns: '32px 70px 1fr 140px 70px 84px', gap: '0.5rem', padding: '0.625rem 1rem', background: 'var(--surface-2)', borderBottom: '1px solid var(--border)', alignItems: 'center' }}>
          <div />
          <span className="overline">No.</span>
          <span className="overline">Topic Title</span>
          <span className="overline">Heading Level</span>
          <span className="overline">Words</span>
          <span className="overline">Actions</span>
        </div>

        {assignment.sections.map((sec, idx) => {
          const wc = sec.originalText.trim() ? sec.originalText.trim().split(/\s+/).length : 0;
          const numLabel = numberMap.get(sec.id) || '';
          const indentLeft = sec.headingLevel === 1 ? 0 : sec.headingLevel === 2 ? 16 : 32;

          return (
            <div
              key={sec.id}
              style={{
                display: 'grid',
                gridTemplateColumns: '32px 70px 1fr 140px 70px 84px',
                gap: '0.5rem',
                padding: '0.75rem 1rem',
                borderBottom: idx < assignment.sections.length - 1 ? '1px solid var(--border)' : 'none',
                alignItems: 'center',
                background: sec.headingLevel === 1 ? 'transparent' : 'var(--surface-1)',
                transition: 'background 0.1s',
              }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'var(--surface-2)'; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = sec.headingLevel === 1 ? 'transparent' : 'var(--surface-1)'; }}
            >
              {/* Grip */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-4)' }}>
                <GripVertical size={14} />
              </div>

              {/* Number Label */}
              <span className="mono" style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--indigo)' }}>
                {numLabel}
              </span>

              {/* Title with visual indent */}
              <div style={{ paddingLeft: `${indentLeft}px`, display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
                <input
                  type="text"
                  className="input"
                  style={{
                    padding: '0.375rem 0.625rem',
                    fontSize: sec.headingLevel === 1 ? '0.875rem' : '0.8125rem',
                    fontWeight: sec.headingLevel === 1 ? 600 : sec.headingLevel === 2 ? 500 : 400,
                    fontStyle: sec.headingLevel === 3 ? 'italic' : 'normal'
                  }}
                  value={sec.title}
                  onChange={(e) => setTitle(sec.id, e.target.value)}
                />
              </div>

              {/* Level */}
              <select
                className="select"
                style={{ padding: '0.375rem 0.625rem', fontSize: '0.8125rem', fontWeight: 600 }}
                value={sec.headingLevel}
                onChange={(e) => setLevel(sec.id, parseInt(e.target.value) as 1 | 2 | 3)}
              >
                <option value={1}>H1 — Main Topic</option>
                <option value={2}>H2 — Subtopic</option>
                <option value={3}>H3 — Minor Topic</option>
              </select>

              {/* Word count */}
              <span className="body-sm" style={{ textAlign: 'right' }}>{wc > 0 ? `${wc}w` : '—'}</span>

              {/* Actions */}
              <div style={{ display: 'flex', gap: '2px' }}>
                <button className="btn-icon" style={{ width: 24, height: 24 }} onClick={() => move(idx, 'up')} disabled={idx === 0} title="Move up">
                  <MoveUp size={13} />
                </button>
                <button className="btn-icon" style={{ width: 24, height: 24 }} onClick={() => move(idx, 'down')} disabled={idx === assignment.sections.length - 1} title="Move down">
                  <MoveDown size={13} />
                </button>
                <button
                  className="btn-icon"
                  style={{ width: 24, height: 24, color: 'var(--text-4)' }}
                  onClick={() => del(sec.id)}
                  disabled={assignment.sections.length <= 1}
                  title="Delete"
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = 'var(--red)'; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = 'var(--text-4)'; }}
                >
                  <Trash2 size={13} />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '1.5rem', borderTop: '1px solid var(--border)', marginTop: '1.5rem' }}>
        <button className="btn btn-secondary" onClick={onPrev}>
          <ArrowLeft size={15} /> Back
        </button>
        <button className="btn btn-primary btn-lg" onClick={onNext}>
          Continue to references <ArrowRight size={15} />
        </button>
      </div>
    </div>
  );
};
