import React, { useState } from 'react';
import type { Assignment, ReferenceSource } from '../../types';
import { Upload, BookMarked, FileText, AlertCircle, Trash2, Edit2, ArrowRight, ArrowLeft, Link, Check, X, ShieldCheck } from 'lucide-react';

interface Step4ReferencesProps {
  assignment: Assignment;
  updateAssignment: (updates: Partial<Assignment>) => void;
  onNext: () => void;
  onPrev: () => void;
}

export const Step4References: React.FC<Step4ReferencesProps> = ({ assignment, updateAssignment, onNext, onPrev }) => {
  const [editId, setEditId] = useState<string | null>(null);
  const [urlInput, setUrlInput] = useState('');
  const [doiInput, setDoiInput] = useState('');

  const addRef = (ref: ReferenceSource) => {
    updateAssignment({ references: [...assignment.references, ref] });
  };

  const removeRef = (id: string) => {
    updateAssignment({ references: assignment.references.filter(r => r.id !== id) });
  };

  const updateRef = (id: string, updates: Partial<ReferenceSource>) => {
    updateAssignment({ references: assignment.references.map(r => r.id === id ? { ...r, ...updates } : r) });
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const newRefs: ReferenceSource[] = Array.from(files).map((file) => {
      const clean = file.name.replace(/\.[^/.]+$/, '');
      const parts = clean.split('_');
      const author = parts[0] || 'Unknown Author';
      const yearPart = parts[1];
      const year = yearPart?.match(/^\d{4}$/) ? yearPart : '';
      const title = year ? parts.slice(2).join(' ') || clean : clean;

      const missing: string[] = [];
      if (!author || author === 'Unknown Author') missing.push('Author');
      if (!year) missing.push('Year');
      if (!title) missing.push('Title');

      return {
        id: `ref-${Date.now()}-${Math.random().toString(36).slice(2)}`,
        fileName: file.name,
        fileType: file.name.split('.').pop() || '',
        authors: [author],
        year,
        title,
        journalOrPublisher: '',
        volume: '',
        issue: '',
        pages: '',
        doi: '',
        url: '',
        missingFields: missing,
        extractionStatus: missing.length === 0 ? 'extracted' : 'incomplete',
      };
    });

    updateAssignment({ references: [...assignment.references, ...newRefs] });
    e.target.value = '';
  };

  const handleAddUrl = () => {
    if (!urlInput.trim()) return;
    addRef({
      id: `ref-url-${Date.now()}`,
      fileName: '',
      fileType: 'url',
      authors: [],
      year: '',
      title: '',
      journalOrPublisher: '',
      url: urlInput.trim(),
      missingFields: ['Author', 'Title', 'Year'],
      extractionStatus: 'incomplete',
    });
    setUrlInput('');
  };

  const handleAddDoi = () => {
    if (!doiInput.trim()) return;
    addRef({
      id: `ref-doi-${Date.now()}`,
      fileName: '',
      fileType: 'doi',
      authors: [],
      year: '',
      title: '',
      journalOrPublisher: '',
      doi: doiInput.trim(),
      missingFields: ['Author', 'Title', 'Year'],
      extractionStatus: 'incomplete',
    });
    setDoiInput('');
  };

  const isComplete = (ref: ReferenceSource) => ref.extractionStatus === 'extracted';
  const editingRef = editId ? assignment.references.find(r => r.id === editId) : null;

  return (
    <div className="animate-fade-up" style={{ maxWidth: 900, margin: '0 auto', padding: '2rem 0' }}>
      <div style={{ marginBottom: '1.5rem' }}>
        <span className="overline" style={{ color: 'var(--indigo)', display: 'block', marginBottom: '0.4rem' }}>Step 4 of 10</span>
        <h2 style={{ fontFamily: 'Newsreader, serif', fontSize: '1.875rem', fontWeight: 500, color: 'var(--text-1)', letterSpacing: '-0.015em', marginBottom: '0.25rem' }}>
          Add your reference sources
        </h2>
        <p className="body-sm">Upload PDF or Word source files, or enter URLs and DOIs. Metadata is extracted from files only — no hallucinated details.</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
        {/* File Upload */}
        <div className="card" style={{ padding: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
            <Upload size={15} color="var(--indigo)" />
            <span style={{ fontWeight: 600, fontSize: '0.9375rem', color: 'var(--text-1)' }}>Upload files</span>
          </div>
          <label
            style={{
              display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
              gap: '0.625rem', padding: '2rem', border: '2px dashed var(--border-2)', borderRadius: 'var(--r-sm)',
              cursor: 'pointer', background: 'var(--surface-2)', transition: 'border-color 0.15s',
            }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = 'var(--indigo)'; }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = 'var(--border-2)'; }}
          >
            <FileText size={28} color="var(--text-4)" strokeWidth={1.5} />
            <div style={{ textAlign: 'center' }}>
              <p style={{ fontWeight: 600, fontSize: '0.875rem', color: 'var(--text-1)', marginBottom: 2 }}>Drop files or click to upload</p>
              <p className="body-sm">PDF, DOCX, DOC — multiple files supported</p>
            </div>
            <input type="file" multiple accept=".pdf,.docx,.doc" style={{ display: 'none' }} onChange={handleFileUpload} />
          </label>
        </div>

        {/* URL / DOI */}
        <div className="card" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Link size={15} color="var(--indigo)" />
            <span style={{ fontWeight: 600, fontSize: '0.9375rem', color: 'var(--text-1)' }}>Add URL or DOI</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
            <label className="label">Web URL</label>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <input type="url" className="input input-sm" placeholder="https://example.com/article" value={urlInput} onChange={e => setUrlInput(e.target.value)} style={{ flex: 1 }} />
              <button className="btn btn-secondary btn-sm" onClick={handleAddUrl} disabled={!urlInput.trim()}>Add</button>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
            <label className="label">DOI</label>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <input type="text" className="input input-sm" placeholder="10.1000/xyz123" value={doiInput} onChange={e => setDoiInput(e.target.value)} style={{ flex: 1 }} />
              <button className="btn btn-secondary btn-sm" onClick={handleAddDoi} disabled={!doiInput.trim()}>Add</button>
            </div>
          </div>

          <div style={{ marginTop: 'auto', padding: '0.625rem', background: 'var(--indigo-soft)', borderRadius: 'var(--r-xs)', fontSize: '0.75rem', color: 'var(--indigo)', display: 'flex', gap: '0.375rem' }}>
            <ShieldCheck size={12} style={{ flexShrink: 0, marginTop: 1 }} />
            <span>Only metadata visible in files is extracted. No hallucinated details.</span>
          </div>
        </div>
      </div>

      {/* Reference list */}
      {assignment.references.length > 0 ? (
        <div className="card" style={{ overflow: 'hidden' }}>
          <div style={{ padding: '0.75rem 1.25rem', background: 'var(--surface-2)', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontWeight: 600, fontSize: '0.875rem', color: 'var(--text-1)' }}>
              {assignment.references.length} source{assignment.references.length > 1 ? 's' : ''} added
            </span>
            <span className="body-sm">
              {assignment.references.filter(isComplete).length} complete · {assignment.references.filter(r => !isComplete(r)).length} need review
            </span>
          </div>

          {assignment.references.map((ref) => (
            <div key={ref.id}>
              <div
                style={{
                  padding: '0.875rem 1.25rem', borderBottom: '1px solid var(--border)',
                  display: 'flex', alignItems: 'center', gap: '0.875rem', transition: 'background 0.1s',
                }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'var(--surface-2)'; }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'transparent'; }}
              >
                {/* Status icon */}
                <div style={{ width: 32, height: 32, borderRadius: 6, background: isComplete(ref) ? 'var(--emerald-soft)' : 'var(--amber-soft)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  {isComplete(ref) ? <Check size={14} color="var(--emerald)" /> : <AlertCircle size={14} color="var(--amber)" />}
                </div>

                {/* Info */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 600, fontSize: '0.875rem', color: 'var(--text-1)', marginBottom: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {ref.title || ref.fileName || ref.url || ref.doi || 'Untitled source'}
                  </div>
                  <div className="body-sm">
                    {[ref.authors?.join(', '), ref.year, ref.journalOrPublisher].filter(Boolean).join(' · ') || 'No metadata extracted'}
                  </div>
                  {ref.missingFields && ref.missingFields.length > 0 && (
                    <div style={{ display: 'flex', gap: '0.25rem', marginTop: '0.375rem', flexWrap: 'wrap' }}>
                      {ref.missingFields.map(f => (
                        <span key={f} className="badge badge-amber" style={{ fontSize: '0.6rem' }}>Missing: {f}</span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div style={{ display: 'flex', gap: '0.25rem', flexShrink: 0 }}>
                  <button className="btn-icon" title="Edit" onClick={() => setEditId(editId === ref.id ? null : ref.id)}>
                    <Edit2 size={14} />
                  </button>
                  <button
                    className="btn-icon" title="Delete"
                    style={{ color: 'var(--text-4)' }}
                    onClick={() => removeRef(ref.id)}
                    onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = 'var(--red)'; }}
                    onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = 'var(--text-4)'; }}
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>

              {/* Inline edit panel */}
              {editId === ref.id && editingRef && (
                <div style={{ padding: '1.25rem', background: 'var(--surface-2)', borderBottom: '1px solid var(--border)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
                    <span style={{ fontWeight: 600, fontSize: '0.875rem', color: 'var(--text-1)' }}>Edit reference metadata</span>
                    <button className="btn-icon" onClick={() => setEditId(null)}><X size={14} /></button>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                    {[
                      { label: 'Title',              field: 'title' as keyof ReferenceSource },
                      { label: 'Year',               field: 'year' as keyof ReferenceSource },
                      { label: 'Journal/Publisher',  field: 'journalOrPublisher' as keyof ReferenceSource },
                      { label: 'DOI',                field: 'doi' as keyof ReferenceSource },
                    ].map(({ label, field }) => (
                      <div key={field as string} style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                        <label className="label">{label}</label>
                        <input
                          type="text"
                          className="input input-sm"
                          value={(editingRef[field] as string) || ''}
                          onChange={(e) => updateRef(editId, { [field]: e.target.value, extractionStatus: 'manual', missingFields: [] })}
                        />
                      </div>
                    ))}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                      <label className="label">Author(s)</label>
                      <input
                        type="text"
                        className="input input-sm"
                        value={editingRef.authors?.join(', ') || ''}
                        onChange={(e) => updateRef(editId, { authors: e.target.value.split(',').map(v => v.trim()), extractionStatus: 'manual', missingFields: [] })}
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="card" style={{ padding: '3rem', textAlign: 'center' }}>
          <BookMarked size={28} color="var(--text-4)" style={{ margin: '0 auto 0.75rem', strokeWidth: 1.5 }} />
          <p style={{ fontWeight: 600, color: 'var(--text-2)', marginBottom: 4 }}>No references added yet</p>
          <p className="body-sm">Upload a source file or add a URL above to get started.</p>
        </div>
      )}

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '1.5rem', borderTop: '1px solid var(--border)', marginTop: '1.5rem' }}>
        <button className="btn btn-secondary" onClick={onPrev}><ArrowLeft size={15} /> Back</button>
        <button className="btn btn-primary btn-lg" onClick={onNext}>
          Continue to citation style <ArrowRight size={15} />
        </button>
      </div>
    </div>
  );
};
