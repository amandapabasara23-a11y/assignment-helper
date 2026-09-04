import React, { useState } from 'react';
import type { Assignment, AssignmentSection } from '../../types';
import { Mic, MicOff, Trash2, ArrowRight, ArrowLeft, Check, X, ShieldCheck, Sparkles } from 'lucide-react';
import { createSpeechRecognizer } from '../../utils/speech';
import { autoOrganizeStructure, computeHierarchicalNumbers } from '../../utils/aiOrganizer';

interface Step2ContentProps {
  assignment: Assignment;
  updateAssignment: (updates: Partial<Assignment>) => void;
  onNext: () => void;
  onPrev: () => void;
}

export const Step2Content: React.FC<Step2ContentProps> = ({ assignment, updateAssignment, onNext, onPrev }) => {
  const [activeId, setActiveId] = useState<string>(assignment.sections[0]?.id ?? '');
  const [voiceOpen, setVoiceOpen] = useState(false);
  const [recording, setRecording] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [voiceErr, setVoiceErr] = useState<string | null>(null);
  const [recRef, setRecRef] = useState<any>(null);
  const [aiOrganizing, setAiOrganizing] = useState(false);

  const totalWords = assignment.sections.reduce((acc, sec) => {
    const t = sec.originalText.trim();
    return acc + (t ? t.split(/\s+/).length : 0);
  }, 0);

  const numberMap = computeHierarchicalNumbers(assignment.sections);

  const setSectionText = (id: string, text: string) => {
    updateAssignment({ sections: assignment.sections.map(s => s.id === id ? { ...s, originalText: text } : s) });
  };

  const setSectionTitle = (id: string, title: string) => {
    updateAssignment({ sections: assignment.sections.map(s => s.id === id ? { ...s, title } : s) });
  };

  const setHeadingLevel = (id: string, headingLevel: 1 | 2 | 3) => {
    updateAssignment({ sections: assignment.sections.map(s => s.id === id ? { ...s, headingLevel } : s) });
  };

  const addSection = (headingLevel: 1 | 2 | 3 = 1) => {
    const levelLabel = headingLevel === 1 ? 'Main Topic' : headingLevel === 2 ? 'Subtopic' : 'Minor Topic';
    const sec: AssignmentSection = {
      id: `sec-${Date.now()}`,
      title: `New ${levelLabel}`,
      headingLevel,
      originalText: ''
    };
    updateAssignment({ sections: [...assignment.sections, sec] });
    setActiveId(sec.id);
  };

  const deleteSection = (id: string) => {
    if (assignment.sections.length <= 1) return;
    const updated = assignment.sections.filter(s => s.id !== id);
    updateAssignment({ sections: updated });
    if (activeId === id) setActiveId(updated[0].id);
  };

  const handleAutoOrganize = () => {
    setAiOrganizing(true);
    setTimeout(() => {
      const organized = autoOrganizeStructure(assignment);
      updateAssignment({ sections: organized });
      setActiveId(organized[0]?.id || '');
      setAiOrganizing(false);
    }, 600);
  };

  const startRecording = () => {
    setVoiceErr(null); setTranscript(''); setRecording(true);
    const rec = createSpeechRecognizer(
      (t) => setTranscript(t),
      (e) => { setVoiceErr(e); setRecording(false); },
      () => setRecording(false)
    );
    if (rec) { try { rec.start(); setRecRef(rec); } catch { setVoiceErr('Failed to start microphone.'); setRecording(false); } }
    else setRecording(false);
  };

  const stopRecording = () => { recRef?.stop(); setRecording(false); };

  const acceptTranscript = () => {
    if (!transcript.trim() || !activeId) return;
    const sec = assignment.sections.find(s => s.id === activeId);
    if (sec) setSectionText(activeId, (sec.originalText ? sec.originalText + '\n\n' : '') + transcript.trim());
    setVoiceOpen(false); setTranscript('');
  };

  const activeSec = assignment.sections.find(s => s.id === activeId);

  const WC = totalWords;
  const target = assignment.targetWordCount || 0;
  const pct = target > 0 ? Math.min(100, Math.round((WC / target) * 100)) : 0;

  return (
    <div className="animate-fade-up" style={{ maxWidth: 1080, margin: '0 auto', padding: '2rem 0' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '1.5rem', gap: '1rem', flexWrap: 'wrap' }}>
        <div>
          <span className="overline" style={{ color: 'var(--indigo)', display: 'block', marginBottom: '0.4rem' }}>Step 2 of 10</span>
          <h2 style={{ fontFamily: 'Newsreader, serif', fontSize: '1.875rem', fontWeight: 500, color: 'var(--text-1)', letterSpacing: '-0.015em', marginBottom: '0.25rem' }}>
            Write or transcribe your content
          </h2>
          <p className="body-sm">Organize content into H1 (Main Topic), H2 (Subtopic), and H3 (Minor Topic). Your text is never rewritten.</p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexShrink: 0, flexWrap: 'wrap' }}>
          {/* Word count */}
          <div style={{ textAlign: 'right', marginRight: '0.5rem' }}>
            <div className="overline">Word count</div>
            <div style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--indigo)', fontFamily: 'Newsreader, serif', lineHeight: 1.1 }}>
              {WC.toLocaleString()}{target > 0 ? ` / ${target}` : ''}
            </div>
            {target > 0 && (
              <div style={{ width: 80, height: 3, background: 'var(--border)', borderRadius: 99, marginTop: 4, overflow: 'hidden' }}>
                <div style={{ width: `${pct}%`, height: '100%', background: pct < 90 ? 'var(--indigo)' : 'var(--emerald)', borderRadius: 99, transition: 'width 0.3s' }} />
              </div>
            )}
          </div>
          <button className="btn btn-secondary btn-sm" onClick={handleAutoOrganize} disabled={aiOrganizing}>
            <Sparkles size={13} color="var(--indigo)" />
            {aiOrganizing ? 'Organizing…' : 'Auto Organize (AI)'}
          </button>
          <button className="btn btn-primary btn-sm" onClick={() => setVoiceOpen(true)}>
            <Mic size={13} />
            Voice to text
          </button>
        </div>
      </div>

      {/* Main editor */}
      <div style={{ display: 'grid', gridTemplateColumns: '270px 1fr', gap: '1rem' }}>
        {/* Section list */}
        <div className="card" style={{ padding: '0.75rem', display: 'flex', flexDirection: 'column', gap: '0.5rem', alignSelf: 'start', position: 'sticky', top: 70 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingBottom: '0.5rem', borderBottom: '1px solid var(--border)' }}>
            <span className="heading-3" style={{ fontSize: '0.8125rem' }}>Topic Hierarchy</span>
            <div style={{ display: 'flex', gap: '4px' }}>
              <button className="btn-icon" onClick={() => addSection(1)} title="Add Main Topic (H1)" style={{ width: 26, height: 26, fontSize: '0.65rem', fontWeight: 700 }}>
                H1
              </button>
              <button className="btn-icon" onClick={() => addSection(2)} title="Add Subtopic (H2)" style={{ width: 26, height: 26, fontSize: '0.65rem', fontWeight: 700 }}>
                H2
              </button>
              <button className="btn-icon" onClick={() => addSection(3)} title="Add Minor Topic (H3)" style={{ width: 26, height: 26, fontSize: '0.65rem', fontWeight: 700 }}>
                H3
              </button>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem', maxHeight: 480, overflowY: 'auto' }}>
            {assignment.sections.map((sec) => {
              const wc = sec.originalText.trim() ? sec.originalText.trim().split(/\s+/).length : 0;
              const active = sec.id === activeId;
              const indent = sec.headingLevel === 1 ? 0 : sec.headingLevel === 2 ? 14 : 28;
              const numLabel = numberMap.get(sec.id) || '';

              return (
                <div
                  key={sec.id}
                  onClick={() => setActiveId(sec.id)}
                  style={{
                    marginLeft: `${indent}px`,
                    padding: '0.5rem 0.625rem',
                    borderRadius: 6,
                    border: `1px solid ${active ? 'color-mix(in srgb, var(--indigo) 35%, transparent)' : 'transparent'}`,
                    background: active ? 'var(--indigo-soft)' : 'transparent',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '0.375rem',
                    transition: 'all 0.12s',
                  }}
                >
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', marginBottom: 2 }}>
                      <span className="mono" style={{ fontSize: '0.65rem', fontWeight: 700, color: active ? 'var(--indigo)' : 'var(--text-3)' }}>
                        {numLabel}
                      </span>
                      <span style={{
                        fontSize: '0.55rem',
                        fontWeight: 700,
                        padding: '1px 4px',
                        borderRadius: 3,
                        background: sec.headingLevel === 1 ? 'var(--indigo)' : sec.headingLevel === 2 ? 'var(--border)' : 'transparent',
                        color: sec.headingLevel === 1 ? '#fff' : 'var(--text-2)',
                        border: sec.headingLevel === 3 ? '1px solid var(--border)' : 'none'
                      }}>
                        H{sec.headingLevel}
                      </span>
                    </div>
                    <div style={{
                      fontSize: sec.headingLevel === 1 ? '0.8125rem' : '0.78125rem',
                      fontWeight: sec.headingLevel === 1 ? 600 : sec.headingLevel === 2 ? 500 : 400,
                      fontStyle: sec.headingLevel === 3 ? 'italic' : 'normal',
                      color: active ? 'var(--indigo)' : 'var(--text-1)',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap'
                    }}>
                      {sec.title}
                    </div>
                    <div style={{ fontSize: '0.6875rem', color: 'var(--text-4)' }}>{wc}w</div>
                  </div>
                  {assignment.sections.length > 1 && (
                    <button
                      className="btn-icon"
                      style={{ width: 22, height: 22, flexShrink: 0, opacity: 0, transition: 'opacity 0.1s' }}
                      onClick={(e) => { e.stopPropagation(); deleteSection(sec.id); }}
                      title="Delete section"
                      onMouseEnter={e => { (e.currentTarget as HTMLElement).style.opacity = '1'; (e.currentTarget as HTMLElement).style.color = 'var(--red)'; }}
                      onMouseLeave={e => { (e.currentTarget as HTMLElement).style.opacity = '0'; }}
                    >
                      <Trash2 size={12} />
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Editor pane */}
        <div className="card" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {activeSec ? (
            <>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', paddingBottom: '0.875rem', borderBottom: '1px solid var(--border)', flexWrap: 'wrap' }}>
                <span className="overline" style={{ flexShrink: 0 }}>Heading Level:</span>
                <select
                  className="select"
                  style={{ width: 140, padding: '0.25rem 0.5rem', fontSize: '0.8125rem', fontWeight: 600 }}
                  value={activeSec.headingLevel}
                  onChange={(e) => setHeadingLevel(activeSec.id, parseInt(e.target.value) as 1 | 2 | 3)}
                >
                  <option value={1}>H1 — Main Topic</option>
                  <option value={2}>H2 — Subtopic</option>
                  <option value={3}>H3 — Minor Topic</option>
                </select>

                <input
                  type="text"
                  className="input"
                  style={{ flex: 1, minWidth: 200, fontWeight: activeSec.headingLevel === 1 ? 700 : 500, fontSize: '1rem', border: 'none', padding: '0.25rem 0', borderBottom: '1.5px solid var(--border)', borderRadius: 0, boxShadow: 'none' }}
                  value={activeSec.title}
                  onChange={(e) => setSectionTitle(activeSec.id, e.target.value)}
                  onFocus={e => { e.currentTarget.style.borderColor = 'var(--border-focus)'; }}
                  onBlur={e => { e.currentTarget.style.borderColor = 'var(--border)'; }}
                />

                <span className="body-sm" style={{ marginLeft: 'auto', flexShrink: 0 }}>
                  {activeSec.originalText.trim() ? activeSec.originalText.trim().split(/\s+/).length : 0} words
                </span>
              </div>

              <textarea
                className="textarea"
                style={{ minHeight: 380, resize: 'vertical', fontSize: '0.9375rem', lineHeight: 1.75, border: 'none', boxShadow: 'none', padding: 0, background: 'transparent' }}
                placeholder={`Type your content for "${activeSec.title}" here…\n\nPaste lecture notes, research findings, or speech transcriptions directly.`}
                value={activeSec.originalText}
                onChange={(e) => setSectionText(activeSec.id, e.target.value)}
              />
            </>
          ) : (
            <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-4)' }}>
              Select or add a topic section to begin.
            </div>
          )}
        </div>
      </div>

      {/* Nav */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '1.5rem', borderTop: '1px solid var(--border)', marginTop: '1.5rem' }}>
        <button className="btn btn-secondary" onClick={onPrev}>
          <ArrowLeft size={15} />
          Back
        </button>
        <button className="btn btn-primary btn-lg" onClick={onNext}>
          Continue to structure
          <ArrowRight size={15} />
        </button>
      </div>

      {/* Voice Modal */}
      {voiceOpen && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 100, background: 'rgba(15,15,15,0.55)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
          <div className="card-elevated animate-fade-up" style={{ width: '100%', maxWidth: 480, padding: '1.75rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Mic size={16} color="var(--indigo)" />
                <span style={{ fontWeight: 600, fontSize: '1rem', color: 'var(--text-1)' }}>Voice recording</span>
              </div>
              <button className="btn-icon" onClick={() => { stopRecording(); setVoiceOpen(false); }}>
                <X size={16} />
              </button>
            </div>

            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem', padding: '0.75rem', background: 'var(--indigo-soft)', borderRadius: 'var(--r-sm)', border: '1px solid color-mix(in srgb, var(--indigo) 20%, transparent)' }}>
              <ShieldCheck size={14} color="var(--indigo)" style={{ flexShrink: 0, marginTop: 1 }} />
              <span style={{ fontSize: '0.8125rem', color: 'var(--indigo)', lineHeight: 1.5 }}>
                <strong>Strict transcription:</strong> Speech is converted as-spoken. Zero automatic rewriting or paraphrasing.
              </span>
            </div>

            <div style={{ textAlign: 'center', padding: '1rem 0' }}>
              {!recording ? (
                <button className="btn btn-primary btn-xl" onClick={startRecording}>
                  <Mic size={18} /> Start speaking
                </button>
              ) : (
                <button
                  className="btn btn-lg"
                  style={{ background: 'var(--red)', color: '#fff', border: 'none' }}
                  onClick={stopRecording}
                >
                  <MicOff size={17} /> Stop recording
                </button>
              )}
              {recording && (
                <div className="animate-pulse-sm" style={{ fontSize: '0.8rem', color: 'var(--indigo)', marginTop: '0.75rem', fontWeight: 500 }}>
                  ● Recording…
                </div>
              )}
            </div>

            {voiceErr && (
              <div style={{ padding: '0.625rem', background: 'var(--red-soft)', borderRadius: 6, fontSize: '0.8125rem', color: 'var(--red)' }}>
                {voiceErr}
              </div>
            )}

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
              <label className="label">Review transcript before inserting</label>
              <textarea
                className="textarea"
                style={{ minHeight: 100, fontSize: '0.875rem' }}
                placeholder="Transcribed text will appear here…"
                value={transcript}
                onChange={(e) => setTranscript(e.target.value)}
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', gap: '0.5rem' }}>
              <button className="btn btn-ghost btn-sm" style={{ color: 'var(--red)' }} onClick={() => setTranscript('')}>
                <Trash2 size={13} /> Clear
              </button>
              <button
                className="btn btn-primary btn-sm"
                disabled={!transcript.trim()}
                onClick={acceptTranscript}
              >
                <Check size={13} /> Insert into section
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
