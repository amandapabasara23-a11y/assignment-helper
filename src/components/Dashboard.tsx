import React, { useState } from 'react';
import type { Assignment, UniversityTemplate } from '../types';
import {
  PlusCircle, Search, FileText, Edit3, Copy, Trash2,
  Bookmark, Mic, BookMarked, SearchCode, Clock, Sparkles
} from 'lucide-react';
import { loadTemplatesFromStorage } from '../utils/storage';

interface DashboardProps {
  assignments: Assignment[];
  onOpenAssignment: (id: string) => void;
  onNewAssignment: () => void;
  onDuplicateAssignment: (id: string) => void;
  onDeleteAssignment: (id: string) => void;
  onApplyTemplate: (template: UniversityTemplate) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({
  assignments,
  onOpenAssignment,
  onNewAssignment,
  onDuplicateAssignment,
  onDeleteAssignment,
  onApplyTemplate,
}) => {
  const [search, setSearch] = useState('');
  const [tab, setTab] = useState<'assignments' | 'templates'>('assignments');
  const templates = loadTemplatesFromStorage();

  const filtered = assignments.filter(
    (a) =>
      a.title.toLowerCase().includes(search.toLowerCase()) ||
      a.courseName.toLowerCase().includes(search.toLowerCase())
  );

  const recent = assignments[0];

  const wordCount = (a: Assignment) =>
    a.sections.reduce((acc, sec) => {
      const t = sec.originalText.trim();
      return acc + (t ? t.split(/\s+/).length : 0);
    }, 0);

  const relDate = (iso: string) => {
    const d = new Date(iso);
    const now = new Date();
    const diff = Math.floor((now.getTime() - d.getTime()) / 60000);
    if (diff < 1)   return 'just now';
    if (diff < 60)  return `${diff}m ago`;
    if (diff < 1440) return `${Math.floor(diff/60)}h ago`;
    return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
  };

  return (
    <div
      style={{
        maxWidth: 1240,
        margin: '0 auto',
        padding: '2.5rem 1.25rem',
        display: 'flex',
        flexDirection: 'column',
        gap: '2rem',
      }}
      className="animate-fade-in"
    >
      {/* PAGE HEADER */}
      <div
        className="card"
        style={{
          padding: '2rem 2.25rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1.25rem',
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
          <div className="badge badge-indigo" style={{ width: 'fit-content' }}>
            <Sparkles size={13} color="var(--accent-indigo)" />
            <span>Student Workspace</span>
          </div>
          <h1 className="display-2" style={{ fontSize: '2.1rem' }}>
            Good day. Let's finish your assignment.
          </h1>
        </div>

        <button className="btn btn-primary btn-lg" onClick={onNewAssignment}>
          <PlusCircle size={18} />
          <span>New Assignment</span>
        </button>
      </div>

      {/* QUICK ACTIONS */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem' }}>
        <button
          onClick={onNewAssignment}
          className="btn-primary"
          style={{
            padding: '1.25rem 1.5rem',
            borderRadius: 'var(--r-lg)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            textAlign: 'left',
            cursor: 'pointer',
            border: 'none',
          }}
        >
          <div>
            <div style={{ fontSize: '0.72rem', opacity: 0.85, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 2 }}>
              Start Fresh
            </div>
            <div style={{ fontSize: '1.05rem', fontWeight: 800 }}>+ New Assignment</div>
          </div>
          <PlusCircle size={24} style={{ opacity: 0.95, flexShrink: 0 }} />
        </button>

        {[
          { icon: Mic,        label: 'Voice to text',   sub: 'Speech input',  color: 'var(--accent-indigo)' },
          { icon: BookMarked, label: 'Upload references', sub: 'Source files',  color: '#3b82f6' },
          { icon: SearchCode, label: 'AI writing check', sub: 'Analysis',      color: 'var(--accent-amber)' },
        ].map(({ icon: Icon, label, sub, color }) => (
          <button
            key={label}
            onClick={onNewAssignment}
            className="card"
            style={{
              padding: '1.25rem 1.5rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              textAlign: 'left',
            }}
          >
            <div>
              <div className="body-sm" style={{ fontSize: '0.72rem', color: 'var(--text-3)', marginBottom: 2 }}>{sub}</div>
              <div style={{ fontSize: '0.98rem', fontWeight: 800, color: 'var(--text-1)' }}>{label}</div>
            </div>
            <div
              style={{
                width: 38, height: 38, borderRadius: 'var(--r-md)',
                background: 'var(--surface-inset)',
                border: '1px solid var(--border)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}
            >
              <Icon size={19} color={color} />
            </div>
          </button>
        ))}
      </div>

      {/* RESUME RECENT */}
      {recent && (
        <div
          className="card"
          style={{
            padding: '1.65rem 2rem',
            borderLeft: '4px solid var(--accent-indigo)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '1.25rem',
            flexWrap: 'wrap',
          }}
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
            <span className="body-sm" style={{ color: 'var(--accent-indigo)', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Continue Where You Left Off
            </span>
            <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-1)' }}>
              {recent.title || 'Untitled Assignment'}
            </div>
            <div className="body-sm">
              {recent.courseName || 'General'} · {recent.sections.length} sections · {recent.references.length} refs · Updated {relDate(recent.updatedAt)}
            </div>
          </div>
          <button className="btn btn-primary btn-lg" onClick={() => onOpenAssignment(recent.id)}>
            <Edit3 size={16} />
            Resume Editing
          </button>
        </div>
      )}

      {/* TABS + SEARCH */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        <div
          className="card"
          style={{
            padding: '0.75rem 1.5rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '1rem',
          }}
        >
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            {(['assignments', 'templates'] as const).map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`btn btn-sm ${tab === t ? 'btn-primary' : 'btn-ghost'}`}
              >
                {t === 'assignments' ? `All Assignments (${assignments.length})` : `Templates (${templates.length})`}
              </button>
            ))}
          </div>

          {tab === 'assignments' && (
            <div style={{ position: 'relative', width: 260 }}>
              <Search size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-4)' }} />
              <input
                type="text"
                className="input input-sm"
                style={{ paddingLeft: 36, borderRadius: 'var(--r-md)' }}
                placeholder="Search assignments…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          )}
        </div>

        {/* ASSIGNMENTS LIST */}
        {tab === 'assignments' && (
          <div>
            {filtered.length === 0 ? (
              <div
                className="card"
                style={{
                  textAlign: 'center',
                  padding: '4rem 2rem',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '1rem',
                }}
              >
                <div
                  style={{
                    width: 54, height: 54,
                    borderRadius: '50%',
                    background: 'var(--surface-inset)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}
                >
                  <FileText size={24} color="var(--text-4)" />
                </div>
                <div>
                  <p style={{ fontWeight: 800, fontSize: '1.1rem', color: 'var(--text-1)', marginBottom: 4 }}>
                    {search ? 'No matching assignments' : 'No assignments yet'}
                  </p>
                  <p className="body-sm">
                    {search ? 'Try a different search term.' : 'Your next assignment starts here.'}
                  </p>
                </div>
                {!search && (
                  <button className="btn btn-primary btn-lg" onClick={onNewAssignment}>
                    + Create assignment
                  </button>
                )}
              </div>
            ) : (
              <div className="card" style={{ padding: '0.5rem', overflow: 'hidden' }}>
                {filtered.map((a, i) => (
                  <div
                    key={a.id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '1.1rem 1.25rem',
                      borderBottom: i < filtered.length - 1 ? '1px solid var(--border)' : 'none',
                      gap: '1.25rem',
                      borderRadius: 'var(--r-md)',
                      transition: 'background 0.18s ease',
                    }}
                    onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'var(--surface-hover)'; }}
                    onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'transparent'; }}
                  >
                    {/* Icon */}
                    <div
                      style={{
                        width: 40, height: 40,
                        borderRadius: 'var(--r-md)',
                        background: 'var(--accent-indigo-soft)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        flexShrink: 0,
                      }}
                    >
                      <FileText size={19} color="var(--accent-indigo)" />
                    </div>

                    {/* Main info */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flexWrap: 'wrap' }}>
                        <button
                          onClick={() => onOpenAssignment(a.id)}
                          style={{
                            fontWeight: 800,
                            fontSize: '1rem',
                            color: 'var(--text-1)',
                            background: 'none',
                            border: 'none',
                            cursor: 'pointer',
                            padding: 0,
                            textAlign: 'left',
                          }}
                          onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = 'var(--accent-indigo)'; }}
                          onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = 'var(--text-1)'; }}
                        >
                          {a.title || 'Untitled Assignment'}
                        </button>
                        <span className="badge badge-indigo">
                          {a.assignmentType}
                        </span>
                      </div>
                      <div className="body-sm" style={{ marginTop: '0.25rem' }}>
                        {[
                          a.courseName || 'General',
                          `${wordCount(a).toLocaleString()} words`,
                          `${a.references.length} refs`,
                          a.referencingStyle,
                        ].join(' · ')}
                      </div>
                    </div>

                    {/* Date */}
                    <div
                      className="body-sm"
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.35rem',
                        flexShrink: 0,
                        color: 'var(--text-4)',
                        fontSize: '0.82rem',
                      }}
                    >
                      <Clock size={14} />
                      {relDate(a.updatedAt)}
                    </div>

                    {/* Actions */}
                    <div style={{ display: 'flex', gap: '0.5rem', flexShrink: 0, alignItems: 'center' }}>
                      <button
                        className="btn btn-secondary btn-sm"
                        onClick={() => onOpenAssignment(a.id)}
                      >
                        <Edit3 size={14} />
                        Open
                      </button>
                      <button
                        className="btn-icon"
                        onClick={() => onDuplicateAssignment(a.id)}
                        title="Duplicate"
                      >
                        <Copy size={15} />
                      </button>
                      <button
                        className="btn-icon"
                        onClick={() => onDeleteAssignment(a.id)}
                        title="Delete"
                        style={{ color: 'var(--text-4)' }}
                        onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = 'var(--accent-rose)'; }}
                        onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = 'var(--text-4)'; }}
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TEMPLATES GRID */}
        {tab === 'templates' && (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
              gap: '1.25rem',
            }}
          >
            {templates.length === 0 ? (
              <div className="card" style={{ gridColumn: '1/-1', textAlign: 'center', padding: '3.5rem', color: 'var(--text-3)' }}>
                <Bookmark size={30} style={{ margin: '0 auto 0.85rem', opacity: 0.6 }} />
                <p style={{ fontWeight: 800, fontSize: '1.05rem', color: 'var(--text-1)', marginBottom: 4 }}>No saved templates</p>
                <p className="body-sm">Save formatting settings in Step 6 to create reusable templates.</p>
              </div>
            ) : (
              templates.map((t) => (
                <div key={t.id} className="card" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.55rem' }}>
                    <Bookmark size={17} color="var(--accent-indigo)" />
                    <span style={{ fontWeight: 800, fontSize: '1rem', color: 'var(--text-1)' }}>{t.name}</span>
                  </div>
                  <p className="body-sm" style={{ lineHeight: 1.55 }}>{t.description}</p>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-3)', display: 'flex', flexDirection: 'column', gap: '0.3rem', borderTop: '1px solid var(--border)', paddingTop: '0.85rem' }}>
                    <span>Font: <strong>{t.formatting.fontFamily} {t.formatting.fontSize}</strong></span>
                    <span>Spacing: <strong>{t.formatting.lineSpacing}</strong></span>
                    <span>Style: <strong>{t.defaultReferencingStyle}</strong></span>
                  </div>
                  <button className="btn btn-secondary btn-sm" onClick={() => onApplyTemplate(t)}>
                    Apply template
                  </button>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
};
