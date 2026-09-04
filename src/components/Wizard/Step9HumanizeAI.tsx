import React, { useState, useEffect, useCallback } from 'react';
import type { Assignment } from '../../types';
import { checkSidecarHealth, runRealZeroGPTCheck, runRealHumanize } from '../../utils/sidecarClient';
import type { RealZeroGPTResult } from '../../utils/sidecarClient';
import { humanizeAllAssignmentSections } from '../../utils/aiChecker';
import {
  ArrowRight, ArrowLeft, Wand2, ExternalLink, Copy, Check,
  RefreshCw, AlertCircle, Loader2, Wifi, WifiOff, CheckCircle2,
  AlertTriangle, Edit3, ShieldCheck
} from 'lucide-react';

interface Step9HumanizeAIProps {
  assignment: Assignment;
  updateAssignment: (updates: Partial<Assignment>) => void;
  onNext: () => void;
  onPrev: () => void;
}

type HumanizeState = 'idle' | 'humanizing_section' | 'humanizing_all' | 'rescanning' | 'done' | 'error';

interface SectionHumanizeStatus {
  [sectionId: string]: 'idle' | 'loading' | 'done' | 'error';
}

export const Step9HumanizeAI: React.FC<Step9HumanizeAIProps> = ({
  assignment,
  updateAssignment,
  onNext,
  onPrev,
}) => {
  const [serverOnline, setServerOnline] = useState<boolean | null>(null);
  const [humanizeState, setHumanizeState] = useState<HumanizeState>('idle');
  const [sectionStatus, setSectionStatus] = useState<SectionHumanizeStatus>({});
  const [errorMessage, setErrorMessage] = useState('');
  const [activeTab, setActiveTab] = useState<'highlights' | 'editor'>('highlights');
  const [reCheckResult, setReCheckResult] = useState<RealZeroGPTResult | null>(null);
  const [reChecking, setReChecking] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);

  const [showHumanizerOverride, setShowHumanizerOverride] = useState(false);

  // Check server health on mount
  useEffect(() => {
    checkSidecarHealth().then(s => setServerOnline(s.available));
  }, []);

  const latestResult = reCheckResult || assignment.latestZeroGPTResult || null;
  const isZeroPercent = latestResult !== null && latestResult.overallScore <= 0;
  const targetAchieved = latestResult !== null && latestResult.overallScore < 2;
  const currentScore = latestResult?.overallScore ?? null;

  // ── Copy section text to clipboard ────────────────────────────────────────
  const copySection = (sectionId: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(sectionId);
    setTimeout(() => setCopied(null), 2000);
  };

  // ── Humanize a single section via HumanizeAI.pro ──────────────────────────
  const humanizeSection = useCallback(async (sectionId: string) => {
    const section = assignment.sections.find(s => s.id === sectionId);
    if (!section || !section.originalText.trim()) return;

    setSectionStatus(prev => ({ ...prev, [sectionId]: 'loading' }));
    setErrorMessage('');

    try {
      const health = await checkSidecarHealth();
      setServerOnline(health.available);
      if (!health.available) throw new Error('Automation server offline. Start it with: cd server && node index.js');

      const humanized = await runRealHumanize(section.originalText);
      const updatedSections = assignment.sections.map(s =>
        s.id === sectionId ? { ...s, originalText: humanized } : s
      );
      updateAssignment({ sections: updatedSections });
      setSectionStatus(prev => ({ ...prev, [sectionId]: 'done' }));
    } catch (err) {
      setSectionStatus(prev => ({ ...prev, [sectionId]: 'error' }));
      setErrorMessage((err as Error).message);
    }
  }, [assignment.sections, updateAssignment]);

  // ── Humanize ALL sections sequentially ────────────────────────────────────
  const humanizeAll = useCallback(async () => {
    const health = await checkSidecarHealth();
    setServerOnline(health.available);
    if (!health.available) {
      setErrorMessage('Automation server offline. Start it with: cd server && node index.js');
      return;
    }

    setHumanizeState('humanizing_all');
    setErrorMessage('');

    let updatedSections = [...assignment.sections];

    for (const section of assignment.sections) {
      if (!section.originalText.trim()) continue;
      setSectionStatus(prev => ({ ...prev, [section.id]: 'loading' }));
      try {
        const humanized = await runRealHumanize(section.originalText);
        updatedSections = updatedSections.map(s =>
          s.id === section.id ? { ...s, originalText: humanized } : s
        );
        updateAssignment({ sections: updatedSections });
        setSectionStatus(prev => ({ ...prev, [section.id]: 'done' }));
      } catch (_err) {
        setSectionStatus(prev => ({ ...prev, [section.id]: 'error' }));
      }
    }

    setHumanizeState('idle');
  }, [assignment.sections, updateAssignment]);

  const runOfflineHumanize = useCallback(() => {
    const updated = humanizeAllAssignmentSections(assignment.sections);
    updateAssignment({ sections: updated });
    const newStatus: SectionHumanizeStatus = {};
    updated.forEach(s => { newStatus[s.id] = 'done'; });
    setSectionStatus(newStatus);
  }, [assignment.sections, updateAssignment]);

  // ── Manual text edit ──────────────────────────────────────────────────────
  const handleSectionTextChange = (sectionId: string, newText: string) => {
    const updated = assignment.sections.map(s =>
      s.id === sectionId ? { ...s, originalText: newText } : s
    );
    updateAssignment({ sections: updated });
  };

  // ── Re-check with real ZeroGPT after humanization ─────────────────────────
  const runReCheck = useCallback(async () => {
    const health = await checkSidecarHealth();
    setServerOnline(health.available);
    if (!health.available) {
      setErrorMessage('Automation server offline. Start it with: cd server && node index.js');
      return;
    }

    setReChecking(true);
    setErrorMessage('');
    const fullText = assignment.sections.map(s => `[${s.title}]\n${s.originalText}`).join('\n\n');

    try {
      const result = await runRealZeroGPTCheck(fullText);
      setReCheckResult(result);
      updateAssignment({ latestZeroGPTResult: result });
    } catch (err) {
      setErrorMessage((err as Error).message);
    } finally {
      setReChecking(false);
    }
  }, [assignment.sections, updateAssignment]);

  const isAnyLoading = humanizeState === 'humanizing_all' || Object.values(sectionStatus).some(s => s === 'loading');

  return (
    <div className="animate-fade-up" style={{ maxWidth: 960, margin: '0 auto', padding: '1.5rem 0 3rem' }}>

      {/* ── HEADER ─────────────────────────────────────────────────────────── */}
      <div style={{ textAlign: 'center', marginBottom: '1.75rem' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', background: 'var(--indigo-soft)', padding: '0.375rem 0.875rem', borderRadius: 99, marginBottom: '0.625rem' }}>
          <Wand2 size={14} color="var(--indigo)" />
          <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--indigo)' }}>
            Step 9 of 11 — AI Content Humanizer
          </span>
        </div>
        <h1 style={{ fontFamily: 'Newsreader, serif', fontSize: '2.125rem', fontWeight: 600, color: 'var(--text-1)', letterSpacing: '-0.02em', marginBottom: '0.375rem' }}>
          Humanize AI Text via HumanizeAI.pro &amp; Re-Check
        </h1>
        <p className="body-sm" style={{ maxWidth: 640, margin: '0 auto' }}>
          {isZeroPercent ? (
            <span style={{ color: '#15803d', fontWeight: 600 }}>
              Your document scored 0% AI on ZeroGPT. It is 100% human-written and requires no humanization!
            </span>
          ) : (
            <>
              Our automation server opens <strong>humanizeai.pro</strong> in a headless browser, pastes your text, and
              returns the <strong>real humanized output</strong>. Then re-verify with ZeroGPT until you reach&nbsp;
              <strong style={{ color: '#16a34a' }}>&lt; 2% AI detected</strong>.
            </>
          )}
        </p>
      </div>

      {/* ── SERVER STATUS ─────────────────────────────────────────────────── */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '1rem',
          padding: '0.75rem 1.25rem',
          background: serverOnline === true ? 'rgba(22,163,74,0.06)' : serverOnline === false ? 'rgba(239,68,68,0.06)' : 'var(--surface)',
          borderRadius: 10,
          border: `1.5px solid ${serverOnline === true ? '#16a34a' : serverOnline === false ? '#ef4444' : 'var(--border)'}`,
          marginBottom: '1.25rem',
          flexWrap: 'wrap',
        }}
      >
        {serverOnline === true ? <Wifi size={16} color="#16a34a" /> : serverOnline === false ? <WifiOff size={16} color="#ef4444" /> : <Loader2 size={16} className="animate-spin" />}
        <span style={{ fontSize: '0.875rem', fontWeight: 600, color: serverOnline === true ? '#15803d' : serverOnline === false ? '#dc2626' : 'var(--text-2)', flex: 1 }}>
          {serverOnline === true ? 'Automation Server Online ✓ — Ready for real browser humanization'
            : serverOnline === false ? 'Server Offline — Run: cd server && node index.js'
            : 'Checking server…'}
        </span>
        <button className="btn btn-ghost btn-sm" onClick={() => checkSidecarHealth().then(s => setServerOnline(s.available))}>
          <RefreshCw size={12} /> Recheck
        </button>
      </div>

      {/* ── 0% AI DETECTED SUCCESS BANNER ─────────────────────────────────── */}
      {isZeroPercent && !showHumanizerOverride && (
        <div
          style={{
            background: 'linear-gradient(135deg, rgba(22,163,74,0.12) 0%, rgba(22,163,74,0.03) 100%)',
            border: '2px solid #16a34a',
            borderRadius: 16,
            padding: '2rem',
            textAlign: 'center',
            marginBottom: '1.5rem',
            boxShadow: '0 4px 20px rgba(22,163,74,0.08)'
          }}
        >
          <div style={{ width: 64, height: 64, borderRadius: '50%', background: '#dcfce7', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem' }}>
            <CheckCircle2 size={38} color="#15803d" />
          </div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#14532d', marginBottom: '0.5rem' }}>
            🎉 0% AI Detected — 100% Humanized!
          </h2>
          <p style={{ fontSize: '0.9375rem', color: '#166534', maxWidth: 600, margin: '0 auto 1.5rem', lineHeight: 1.6 }}>
            ZeroGPT scanned your assignment text and found <strong>0% AI generated content</strong>.
            Your text is already 100% humanized, so no AI rewriting is needed!
          </p>
          <div style={{ display: 'flex', gap: '0.875rem', justifyContent: 'center', flexWrap: 'wrap', alignItems: 'center' }}>
            <button className="btn btn-primary btn-lg" onClick={onNext} style={{ background: '#16a34a', borderColor: '#15803d', padding: '0.75rem 1.75rem' }}>
              Proceed to Integrity Check <ArrowRight size={16} />
            </button>
            <button className="btn btn-secondary" onClick={() => setShowHumanizerOverride(true)}>
              Show Humanizer Tools Anyway
            </button>
          </div>
        </div>
      )}

      {/* ── RE-CHECK RESULT BANNER (When > 0% AI) ───────────────────────── */}
      {latestResult !== null && !isZeroPercent && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '1.25rem',
            padding: '1.25rem 1.5rem',
            background: targetAchieved
              ? 'linear-gradient(135deg, rgba(22,163,74,0.1) 0%, rgba(22,163,74,0.03) 100%)'
              : 'linear-gradient(135deg, rgba(217,119,6,0.1) 0%, rgba(239,68,68,0.03) 100%)',
            borderRadius: 14,
            border: `1.5px solid ${targetAchieved ? '#16a34a' : '#d97706'}`,
            marginBottom: '1.25rem',
            flexWrap: 'wrap',
          }}
        >
          <div style={{ width: 48, height: 48, borderRadius: '50%', background: targetAchieved ? '#16a34a' : '#d97706', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            {targetAchieved ? <CheckCircle2 size={26} color="#fff" /> : <AlertTriangle size={26} color="#fff" />}
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 800, fontSize: '1.125rem', color: 'var(--text-1)' }}>
              {targetAchieved
                ? `✅ ${latestResult.overallScore}% AI Detected — Under 2% Target! Ready to Finalize.`
                : `⚠️ ${latestResult.overallScore}% AI Detected — Humanize Text to Reach < 2%`}
            </div>
            <div style={{ fontSize: '0.875rem', color: 'var(--text-2)', marginTop: '0.25rem' }}>
              Source: <strong>zerogpt.com</strong> real scan •{' '}
              {latestResult.highlightedSentences.length} sentence(s) flagged •{' '}
              Scanned at {new Date(latestResult.scrapedAt).toLocaleTimeString()}
            </div>
          </div>
          <div style={{ textAlign: 'center', background: 'var(--surface)', borderRadius: 10, padding: '0.625rem 1rem', border: '1px solid var(--border)', flexShrink: 0 }}>
            <div style={{ fontSize: '1.75rem', fontWeight: 900, color: targetAchieved ? '#16a34a' : '#dc2626', lineHeight: 1 }}>
              {latestResult.overallScore}%
            </div>
            <div style={{ fontSize: '0.6875rem', fontWeight: 700, color: 'var(--text-3)', textTransform: 'uppercase', marginTop: 2 }}>AI Score</div>
          </div>
        </div>
      )}

      {/* ── ERROR BANNER ──────────────────────────────────────────────────── */}
      {errorMessage && (
        <div style={{ background: '#fef2f2', border: '1.5px solid #ef4444', borderRadius: 10, padding: '0.875rem 1.25rem', marginBottom: '1.25rem', display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
          <AlertCircle size={18} color="#dc2626" style={{ flexShrink: 0, marginTop: 1 }} />
          <pre style={{ fontSize: '0.875rem', color: '#7f1d1d', whiteSpace: 'pre-wrap', fontFamily: 'monospace', margin: 0 }}>{errorMessage}</pre>
        </div>
      )}

      {/* RENDER HUMANIZER TOOLS ONLY IF > 0% AI OR USER EXPANDED OVERRIDE */}
      {(!isZeroPercent || showHumanizerOverride) && (
        <>
          {/* ── QUICK ACTIONS BAR ─────────────────────────────────────────────── */}
          <div className="card" style={{ padding: '1.125rem 1.5rem', background: '#ffffff', borderRadius: 14, marginBottom: '1.5rem', border: '1px solid #e5e7eb' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.875rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Wand2 size={16} color="var(--indigo)" />
                <span style={{ fontWeight: 700, fontSize: '0.9375rem', color: '#111827' }}>Humanization Tools</span>
              </div>

              <div style={{ display: 'flex', gap: '0.625rem', flexWrap: 'wrap' }}>
                {/* Auto-humanize all using real HumanizeAI.pro */}
                <button
                  className="btn btn-primary"
                  onClick={humanizeAll}
                  disabled={isAnyLoading || !serverOnline}
                  style={{ background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)', border: 'none' }}
                >
                  {humanizeState === 'humanizing_all'
                    ? <><Loader2 size={15} style={{ animation: 'spin 1s linear infinite' }} /> Humanizing All Sections…</>
                    : <><Wand2 size={15} /> Humanize All via HumanizeAI.pro</>
                  }
                </button>

                {/* Local rule-based humanizer fallback */}
                <button className="btn btn-secondary" onClick={runOfflineHumanize}>
                  <Wand2 size={14} color="#059669" /> Offline Rule Humanizer
                </button>

                {/* Open HumanizeAI.pro externally */}
                <a
                  href="https://www.humanizeai.pro/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-secondary"
                  style={{ textDecoration: 'none' }}
                >
                  <ExternalLink size={14} color="#4f46e5" /> Open HumanizeAI.pro
                </a>

                {/* Re-check with real ZeroGPT */}
                <button className="btn btn-secondary" onClick={runReCheck} disabled={reChecking || !serverOnline}>
                  {reChecking
                    ? <><Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} /> Re-checking ZeroGPT…</>
                    : <><RefreshCw size={14} /> Re-Check ZeroGPT Score</>
                  }
                </button>
              </div>
            </div>
          </div>

      {/* ── TAB SWITCHER ──────────────────────────────────────────────────── */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.25rem', borderBottom: '1px solid var(--border)', paddingBottom: '0.5rem' }}>
        {[
          { key: 'highlights', icon: <ShieldCheck size={14} />, label: `Section-by-Section Humanizer (${assignment.sections.length})` },
          { key: 'editor',     icon: <Edit3 size={14} />,       label: 'Manual Text Editor' },
        ].map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key as 'highlights' | 'editor')}
            style={{
              display: 'flex', alignItems: 'center', gap: '0.375rem',
              padding: '0.5rem 1rem', borderRadius: 8, fontSize: '0.875rem', fontWeight: 600, border: 'none', cursor: 'pointer',
              background: activeTab === tab.key ? 'var(--indigo-soft)' : 'transparent',
              color: activeTab === tab.key ? 'var(--indigo)' : 'var(--text-2)',
            }}
          >
            {tab.icon} {tab.label}
          </button>
        ))}
      </div>

      {/* ── TAB: SECTION-BY-SECTION HUMANIZER ────────────────────────────── */}
      {activeTab === 'highlights' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {assignment.sections.map((section) => {
            const status = sectionStatus[section.id] || 'idle';
            const isLoading = status === 'loading';
            const isDone = status === 'done';
            const isError = status === 'error';
            const wordCount = section.originalText.split(/\s+/).filter(Boolean).length;

            // Check if sentence is still flagged from re-check
            const flaggedSentences = reCheckResult?.highlightedSentences || [];
            const sectionHasAI = flaggedSentences.some(s => section.originalText.includes(s));

            return (
              <div
                key={section.id}
                className="card"
                style={{
                  background: '#ffffff',
                  borderRadius: 14,
                  padding: '1.5rem',
                  border: isDone ? '1.5px solid #16a34a' : isError ? '1.5px solid #ef4444' : sectionHasAI ? '1px solid #fde68a' : '1px solid #e5e7eb',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.03)',
                }}
              >
                {/* Section header */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.75rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#111827', margin: 0 }}>{section.title}</h3>
                    <span style={{ fontSize: '0.75rem', color: '#6b7280', fontWeight: 500 }}>{wordCount} words</span>
                    {isDone && (
                      <span style={{ background: '#dcfce7', color: '#15803d', fontSize: '0.75rem', fontWeight: 700, padding: '2px 8px', borderRadius: 99 }}>
                        ✓ Humanized
                      </span>
                    )}
                    {sectionHasAI && !isDone && (
                      <span style={{ background: '#fef3c7', color: '#b45309', fontSize: '0.75rem', fontWeight: 700, padding: '2px 8px', borderRadius: 99 }}>
                        ⚠ AI Flagged
                      </span>
                    )}
                  </div>

                  {/* Per-section actions */}
                  <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                    <button
                      className="btn btn-xs btn-primary"
                      onClick={() => humanizeSection(section.id)}
                      disabled={isLoading || !serverOnline}
                    >
                      {isLoading
                        ? <><Loader2 size={12} style={{ animation: 'spin 1s linear infinite' }} /> Humanizing…</>
                        : <><Wand2 size={12} /> Humanize via HumanizeAI.pro</>
                      }
                    </button>

                    <button
                      className="btn btn-xs btn-ghost"
                      onClick={() => copySection(section.id, section.originalText)}
                    >
                      {copied === section.id ? <Check size={12} color="var(--emerald)" /> : <Copy size={12} />}
                      {copied === section.id ? 'Copied' : 'Copy'}
                    </button>

                    <a
                      href="https://www.humanizeai.pro/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn btn-xs btn-ghost"
                      style={{ textDecoration: 'none', color: '#4f46e5' }}
                    >
                      <ExternalLink size={12} /> Humanize.pro
                    </a>
                  </div>
                </div>

                {/* Loading overlay */}
                {isLoading && (
                  <div style={{ padding: '1.5rem', textAlign: 'center', background: '#f9fafb', borderRadius: 8, border: '1px dashed #e5e7eb' }}>
                    <Loader2 size={24} color="var(--indigo)" style={{ animation: 'spin 1s linear infinite' }} />
                    <p style={{ fontSize: '0.875rem', color: '#6b7280', marginTop: '0.5rem' }}>
                      Opening humanizeai.pro in headless browser…
                    </p>
                  </div>
                )}

                {/* Section text preview */}
                {!isLoading && (
                  <div style={{ fontSize: '0.9375rem', lineHeight: 1.8, color: '#1f2937', fontFamily: 'serif', padding: '1rem', background: '#f9fafb', borderRadius: 8, border: '1px solid #f3f4f6', maxHeight: 200, overflowY: 'auto' }}>
                    {section.originalText || <em style={{ color: '#9ca3af' }}>No text in this section.</em>}
                  </div>
                )}

                {isError && (
                  <div style={{ marginTop: '0.75rem', fontSize: '0.8125rem', color: '#dc2626', background: '#fef2f2', padding: '0.5rem 0.75rem', borderRadius: 6 }}>
                    Humanization failed. Try again or paste manually from HumanizeAI.pro.
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* ── TAB: MANUAL TEXT EDITOR ───────────────────────────────────────── */}
      {activeTab === 'editor' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div style={{ fontSize: '0.875rem', color: 'var(--text-2)', padding: '0.75rem 1rem', background: 'var(--indigo-soft)', borderRadius: 8, border: '1px solid color-mix(in srgb, var(--indigo) 20%, transparent)' }}>
            💡 Copy section text → paste into{' '}
            <a href="https://www.humanizeai.pro/" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--indigo)', fontWeight: 600 }}>humanizeai.pro</a>
            {' '}→ copy humanized result → paste back below.
          </div>
          {assignment.sections.map((section) => (
            <div key={section.id} className="card" style={{ padding: '1.5rem', background: '#ffffff', borderRadius: 14, border: '1px solid #e5e7eb' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#111827', margin: 0 }}>{section.title}</h3>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button className="btn btn-xs btn-ghost" onClick={() => copySection(section.id, section.originalText)}>
                    {copied === section.id ? <Check size={12} color="var(--emerald)" /> : <Copy size={12} />}
                    {copied === section.id ? 'Copied' : 'Copy'}
                  </button>
                  <button
                    className="btn btn-xs btn-secondary"
                    onClick={() => humanizeSection(section.id)}
                    disabled={!serverOnline || sectionStatus[section.id] === 'loading'}
                  >
                    <Wand2 size={12} /> Auto-Humanize
                  </button>
                </div>
              </div>
              <textarea
                style={{
                  width: '100%',
                  minHeight: 140,
                  fontFamily: 'serif',
                  fontSize: '0.9375rem',
                  lineHeight: 1.7,
                  padding: '0.875rem',
                  borderRadius: 8,
                  border: '1px solid var(--border)',
                  resize: 'vertical',
                  boxSizing: 'border-box',
                }}
                value={section.originalText}
                onChange={(e) => handleSectionTextChange(section.id, e.target.value)}
                placeholder={`Paste humanized content for ${section.title}…`}
              />
            </div>
          ))}
        </div>
      )}
        </>
      )}

      {/* ── NAVIGATION ────────────────────────────────────────────────────── */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '1.75rem', borderTop: '1px solid var(--border)', marginTop: '2rem' }}>
        <button className="btn btn-secondary" onClick={onPrev}><ArrowLeft size={15} /> Back to AI Check</button>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.875rem' }}>
          {currentScore !== null && !targetAchieved && (
            <span style={{ fontSize: '0.8125rem', color: '#b45309', fontWeight: 600 }}>
              Score: {currentScore}% — Target &lt; 2%
            </span>
          )}
          {targetAchieved && (
            <span style={{ fontSize: '0.8125rem', color: '#15803d', fontWeight: 700 }}>
              ✅ Target achieved! Under 2% AI
            </span>
          )}
          <button className="btn btn-primary btn-lg" onClick={onNext}>
            Proceed to Integrity Check <ArrowRight size={15} />
          </button>
        </div>
      </div>
    </div>
  );
};
