import React, { useState, useEffect, useCallback } from 'react';
import type { Assignment } from '../../types';
import { checkSidecarHealth, runRealZeroGPTCheck } from '../../utils/sidecarClient';
import type { RealZeroGPTResult } from '../../utils/sidecarClient';
import { analyzeZeroGPT } from '../../utils/aiChecker';
import {
  ExternalLink, Copy, Check, ArrowRight, ArrowLeft, RefreshCw,
  Sparkles, ShieldCheck, Server, AlertCircle, Loader2, Wifi, WifiOff
} from 'lucide-react';

interface Step8AICheckerProps {
  assignment: Assignment;
  updateAssignment?: (updates: Partial<Assignment>) => void;
  onNext: () => void;
  onPrev: () => void;
}

type ScanState = 'idle' | 'checking_server' | 'scanning' | 'done' | 'error';

export const Step8AIChecker: React.FC<Step8AICheckerProps> = ({ assignment, updateAssignment, onNext, onPrev }) => {
  const [copied, setCopied] = useState(false);
  const [scanState, setScanState] = useState<ScanState>('idle');
  const [serverOnline, setServerOnline] = useState<boolean | null>(null);
  const [result, setResult] = useState<RealZeroGPTResult | null>(assignment.latestZeroGPTResult || null);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [highlightFilter, setHighlightFilter] = useState<'all' | 'ai_only'>('all');

  // If assignment already has a result loaded, mark state as done
  useEffect(() => {
    if (assignment.latestZeroGPTResult) {
      setResult(assignment.latestZeroGPTResult);
      setScanState('done');
    }
  }, [assignment.latestZeroGPTResult]);

  // Full text for all sections
  const fullText = assignment.sections
    .map(s => `[${s.title}]\n${s.originalText}`)
    .join('\n\n')
    .trim();

  // Check server health on mount
  useEffect(() => {
    checkSidecarHealth().then(s => setServerOnline(s.available));
  }, []);

  const handleCopyText = () => {
    navigator.clipboard.writeText(fullText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const runScan = useCallback(async () => {
    setErrorMessage('');
    setResult(null);

    // 1. Verify sidecar is running
    setScanState('checking_server');
    const health = await checkSidecarHealth();
    setServerOnline(health.available);

    if (!health.available) {
      setScanState('error');
      setErrorMessage(
        'Automation server is not running.\n\n' +
        'Start it by opening a new terminal and running:\n  cd server\n  node index.js'
      );
      return;
    }

    // 2. Run real ZeroGPT scan
    setScanState('scanning');
    try {
      const zgResult = await runRealZeroGPTCheck(fullText);
      setResult(zgResult);
      updateAssignment?.({ latestZeroGPTResult: zgResult });
      setScanState('done');
    } catch (err) {
      setScanState('error');
      setErrorMessage((err as Error).message || 'Unknown error during ZeroGPT scan');
    }
  }, [fullText, updateAssignment]);

  const runOfflineScan = useCallback(() => {
    const zgLocal = analyzeZeroGPT(assignment.sections);
    const fallbackResult: RealZeroGPTResult = {
      source: 'Offline Perplexity Engine',
      overallScore: zgLocal.overallScore,
      verdictType: zgLocal.verdictType,
      verdictHeadline: zgLocal.verdictHeadline,
      highlightedSentences: zgLocal.allSentences.filter(s => s.isAi).map(s => s.text),
      rawStats: [`Words: ${zgLocal.totalWords}`, `Sentences: ${zgLocal.totalSentences}`],
      sentences: zgLocal.allSentences.map(s => ({ text: s.text, isAi: s.isAi })),
      percentageRaw: `${zgLocal.overallScore}%`,
      scrapedAt: new Date().toISOString()
    };
    setResult(fallbackResult);
    updateAssignment?.({ latestZeroGPTResult: fallbackResult });
    setScanState('done');
  }, [assignment.sections, updateAssignment]);

  // SVG Gauge Calculations
  const score = result?.overallScore ?? 0;
  const radius = 64;
  const strokeWidth = 14;
  const circumference = Math.PI * radius;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  const isHuman = result?.verdictType === 'human';
  const isAi = result?.verdictType === 'ai';
  const verdictColor = isHuman ? '#15803d' : isAi ? '#b91c1c' : '#d97706';

  return (
    <div className="animate-fade-up" style={{ maxWidth: 940, margin: '0 auto', padding: '1.5rem 0 3rem' }}>

      {/* ── HEADER ─────────────────────────────────────────────────────────── */}
      <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', background: 'var(--indigo-soft)', padding: '0.375rem 0.875rem', borderRadius: 99, marginBottom: '0.625rem' }}>
          <Sparkles size={14} color="var(--indigo)" />
          <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--indigo)' }}>
            ZeroGPT Real Browser Analysis — Step 8 of 11
          </span>
        </div>
        <h1 style={{ fontFamily: 'Newsreader, serif', fontSize: '2.125rem', fontWeight: 600, color: 'var(--text-1)', letterSpacing: '-0.02em', marginBottom: '0.375rem' }}>
          Live AI Content Detection via ZeroGPT
        </h1>
        <p className="body-sm" style={{ maxWidth: 620, margin: '0 auto' }}>
          Our automation server opens <strong>zerogpt.com</strong> in a headless browser, pastes your assignment text,
          and returns the <strong>real detection result</strong> — no simulated scoring.
        </p>
      </div>

      {/* ── SERVER STATUS BANNER ───────────────────────────────────────────── */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '1rem',
          padding: '0.875rem 1.25rem',
          background: serverOnline === true
            ? 'linear-gradient(135deg, rgba(22,163,74,0.08) 0%, rgba(22,163,74,0.02) 100%)'
            : serverOnline === false
            ? 'linear-gradient(135deg, rgba(239,68,68,0.08) 0%, rgba(239,68,68,0.02) 100%)'
            : 'var(--surface)',
          borderRadius: 12,
          border: `1.5px solid ${serverOnline === true ? '#16a34a' : serverOnline === false ? '#ef4444' : 'var(--border)'}`,
          marginBottom: '1.5rem',
          flexWrap: 'wrap',
        }}
      >
        {serverOnline === true
          ? <Wifi size={18} color="#16a34a" />
          : serverOnline === false
          ? <WifiOff size={18} color="#ef4444" />
          : <Server size={18} color="var(--text-3)" />
        }
        <div style={{ flex: 1, minWidth: 200 }}>
          <div style={{ fontWeight: 700, fontSize: '0.9375rem', color: 'var(--text-1)' }}>
            {serverOnline === true
              ? 'Automation Server: Online ✓'
              : serverOnline === false
              ? 'Automation Server: Offline ✗'
              : 'Checking server status…'}
          </div>
          {serverOnline === false && (
            <p style={{ fontSize: '0.8125rem', color: '#dc2626', marginTop: '0.25rem' }}>
              Start the server: open a new terminal → <code style={{ background: '#fee2e2', padding: '1px 6px', borderRadius: 4 }}>cd server</code> → <code style={{ background: '#fee2e2', padding: '1px 6px', borderRadius: 4 }}>node index.js</code>
            </p>
          )}
        </div>
        <button
          className="btn btn-ghost btn-sm"
          onClick={() => checkSidecarHealth().then(s => setServerOnline(s.available))}
        >
          <RefreshCw size={13} /> Recheck
        </button>
      </div>

      {/* ── SCAN TRIGGER CARD ─────────────────────────────────────────────── */}
      {scanState === 'idle' && (
        <div
          className="card-elevated"
          style={{
            background: '#ffffff',
            borderRadius: 16,
            padding: '2.5rem',
            border: '1px solid #e5e7eb',
            boxShadow: '0 10px 30px -5px rgba(0,0,0,0.06)',
            textAlign: 'center',
            marginBottom: '1.5rem',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '1.25rem',
          }}
        >
          <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'var(--indigo-soft)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <ShieldCheck size={30} color="var(--indigo)" />
          </div>
          <div>
            <h3 style={{ fontSize: '1.375rem', fontWeight: 700, color: '#111827', marginBottom: '0.5rem' }}>
              Ready to Scan with ZeroGPT
            </h3>
            <p style={{ fontSize: '0.9375rem', color: '#6b7280', maxWidth: 500, margin: '0 auto' }}>
              Click the button below to open <strong>zerogpt.com</strong> in a headless browser and get
              the <em>real, accurate AI detection score</em> for your entire assignment.
            </p>
          </div>

          <div style={{ fontSize: '0.875rem', color: '#6b7280', background: '#f9fafb', padding: '0.75rem 1.25rem', borderRadius: 8, border: '1px solid #e5e7eb' }}>
            📝 <strong>{assignment.sections.length} sections</strong> &nbsp;|&nbsp;
            <strong>{fullText.split(/\s+/).filter(Boolean).length} words</strong> &nbsp;|&nbsp;
            <strong>{fullText.length.toLocaleString()} chars</strong>
          </div>

          <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', flexWrap: 'wrap', justifyContent: 'center' }}>
            <button
              className="btn btn-primary btn-lg"
              onClick={runScan}
              disabled={!serverOnline}
            >
              <ShieldCheck size={16} />
              Run Real ZeroGPT Scan
            </button>
            <button className="btn btn-secondary btn-sm" onClick={handleCopyText}>
              {copied ? <Check size={14} color="var(--emerald)" /> : <Copy size={14} />}
              {copied ? 'Copied!' : 'Copy Text'}
            </button>
            <a
              href="https://www.zerogpt.com"
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-ghost btn-sm"
              style={{ textDecoration: 'none' }}
            >
              <ExternalLink size={14} /> Open ZeroGPT.com
            </a>
          </div>
        </div>
      )}

      {/* ── LOADING STATES ────────────────────────────────────────────────── */}
      {(scanState === 'checking_server' || scanState === 'scanning') && (
        <div
          className="card-elevated"
          style={{
            background: '#ffffff',
            borderRadius: 16,
            padding: '3rem 2rem',
            border: '1px solid #e5e7eb',
            textAlign: 'center',
            marginBottom: '1.5rem',
          }}
        >
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.5rem' }}>
            <Loader2 size={48} color="var(--indigo)" className="animate-spin" style={{ animation: 'spin 1s linear infinite' }} />
            <div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#111827', marginBottom: '0.5rem' }}>
                {scanState === 'checking_server'
                  ? 'Connecting to automation server…'
                  : 'Scanning via ZeroGPT…'}
              </h3>
              <p style={{ fontSize: '0.9375rem', color: '#6b7280' }}>
                {scanState === 'checking_server'
                  ? 'Verifying the local Playwright sidecar is running.'
                  : 'Headless Chromium is opening zerogpt.com, pasting your text, and awaiting the real result. This may take 20–40 seconds.'}
              </p>
            </div>

            {/* Animated steps */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', textAlign: 'left', background: '#f9fafb', padding: '1rem 1.5rem', borderRadius: 10, border: '1px solid #e5e7eb', minWidth: 320 }}>
              {[
                { label: 'Launching headless Chromium', done: scanState === 'scanning' },
                { label: 'Navigating to zerogpt.com', done: scanState === 'scanning' },
                { label: 'Pasting assignment text', done: false },
                { label: 'Clicking Detect & waiting for results', done: false },
                { label: 'Scraping AI score & highlighted sentences', done: false },
              ].map((step, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', fontSize: '0.875rem', color: step.done ? '#16a34a' : '#9ca3af' }}>
                  <span style={{ width: 18, height: 18, borderRadius: '50%', background: step.done ? '#16a34a' : '#e5e7eb', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    {step.done ? <Check size={11} color="#fff" strokeWidth={3} /> : <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#9ca3af', display: 'block' }} />}
                  </span>
                  {step.label}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── ERROR STATE ───────────────────────────────────────────────────── */}
      {scanState === 'error' && (
        <div
          className="card-elevated"
          style={{
            background: '#fef2f2',
            borderRadius: 16,
            padding: '2rem',
            border: '1.5px solid #ef4444',
            marginBottom: '1.5rem',
          }}
        >
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
            <AlertCircle size={24} color="#dc2626" style={{ flexShrink: 0, marginTop: 2 }} />
            <div style={{ flex: 1 }}>
              <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#991b1b', marginBottom: '0.5rem' }}>
                ZeroGPT Scan Failed
              </h3>
              <pre style={{ fontSize: '0.875rem', color: '#7f1d1d', whiteSpace: 'pre-wrap', fontFamily: 'monospace', background: '#fee2e2', padding: '0.75rem', borderRadius: 8 }}>
                {errorMessage}
              </pre>
              <div style={{ display: 'flex', gap: '0.625rem', marginTop: '1rem', flexWrap: 'wrap' }}>
                <button className="btn btn-primary btn-sm" onClick={runScan}>
                  <RefreshCw size={13} /> Retry Scan
                </button>
                <button className="btn btn-secondary btn-sm" onClick={runOfflineScan}>
                  <Sparkles size={13} /> Run Offline Perplexity Scan
                </button>
                <button className="btn btn-secondary btn-sm" onClick={() => setScanState('idle')}>
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── RESULT CARD ───────────────────────────────────────────────────── */}
      {scanState === 'done' && result && (
        <>
          <div
            className="card-elevated"
            style={{
              background: '#ffffff',
              borderRadius: 16,
              padding: '2rem',
              border: '1px solid #e5e7eb',
              boxShadow: '0 10px 30px -5px rgba(0,0,0,0.06)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '1.5rem',
              marginBottom: '1.5rem',
            }}
          >
            {/* Source badge */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: '#f0fdf4', padding: '0.375rem 0.875rem', borderRadius: 99, border: '1px solid #bbf7d0' }}>
              <Check size={14} color="#16a34a" strokeWidth={2.5} />
              <span style={{ fontSize: '0.8125rem', fontWeight: 700, color: '#15803d' }}>
                Real result from {result.source}  •  Scanned {new Date(result.scrapedAt).toLocaleTimeString()}
              </span>
            </div>

            {/* Verdict headline */}
            <div style={{ textAlign: 'center' }}>
              <span style={{ fontSize: '0.8125rem', fontWeight: 700, color: '#ef4444', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', marginBottom: '0.375rem' }}>
                ZeroGPT Detection Result
              </span>
              <h2 style={{ fontSize: '1.75rem', fontWeight: 800, color: verdictColor, fontFamily: 'system-ui, sans-serif' }}>
                {result.verdictHeadline}
              </h2>
            </div>

            {/* Arc Gauge */}
            <div style={{ position: 'relative', width: 200, height: 110, display: 'flex', justifyContent: 'center' }}>
              <svg width="200" height="110" viewBox="0 0 160 90">
                <path d="M 16 80 A 64 64 0 0 1 144 80" fill="none" stroke="#e5e7eb" strokeWidth={strokeWidth} strokeLinecap="round" />
                <path
                  d="M 16 80 A 64 64 0 0 1 144 80"
                  fill="none"
                  stroke={verdictColor}
                  strokeWidth={strokeWidth}
                  strokeLinecap="round"
                  strokeDasharray={circumference}
                  strokeDashoffset={strokeDashoffset}
                  style={{ transition: 'stroke-dashoffset 0.8s ease-in-out' }}
                />
              </svg>
              <div style={{ position: 'absolute', bottom: 6, textAlign: 'center' }}>
                <div style={{ fontSize: '2rem', fontWeight: 900, color: '#111827', lineHeight: 1 }}>
                  {score}%
                </div>
                <div style={{ fontSize: '0.8125rem', fontWeight: 700, color: '#4b5563', textTransform: 'uppercase', marginTop: 2 }}>
                  AI GPT*
                </div>
              </div>
            </div>

            {/* Stats */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', width: '100%', maxWidth: 600, background: '#f9fafb', padding: '0.875rem 1.25rem', borderRadius: 10, border: '1px solid #f3f4f6', textAlign: 'center' }}>
              <div>
                <div style={{ fontSize: '0.75rem', color: '#6b7280', fontWeight: 500 }}>Words</div>
                <div style={{ fontSize: '1rem', fontWeight: 700, color: '#111827' }}>{fullText.split(/\s+/).filter(Boolean).length.toLocaleString()}</div>
              </div>
              <div>
                <div style={{ fontSize: '0.75rem', color: '#6b7280', fontWeight: 500 }}>AI Sentences</div>
                <div style={{ fontSize: '1rem', fontWeight: 700, color: result.highlightedSentences.length > 0 ? '#dc2626' : '#16a34a' }}>
                  {result.highlightedSentences.length}
                </div>
              </div>
              <div>
                <div style={{ fontSize: '0.75rem', color: '#6b7280', fontWeight: 500 }}>AI Score</div>
                <div style={{ fontSize: '1rem', fontWeight: 700, color: verdictColor }}>{score}%</div>
              </div>
            </div>

            {/* Actions */}
            <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', flexWrap: 'wrap', justifyContent: 'center' }}>
              <button className="btn btn-secondary btn-sm" onClick={handleCopyText}>
                {copied ? <Check size={14} color="var(--emerald)" /> : <Copy size={14} />}
                {copied ? 'Copied!' : 'Copy Text for ZeroGPT'}
              </button>
              <a href="https://www.zerogpt.com" target="_blank" rel="noopener noreferrer" className="btn btn-primary btn-sm" style={{ textDecoration: 'none' }}>
                <ExternalLink size={14} /> Open Live ZeroGPT
              </a>
              <button className="btn btn-ghost btn-sm" onClick={runScan}>
                <RefreshCw size={13} /> Re-Scan
              </button>
            </div>
          </div>

          {/* ── HIGHLIGHTED SENTENCES ─────────────────────────────────────── */}
          <div className="card" style={{ padding: '1.75rem', background: '#ffffff', borderRadius: 12, border: '1px solid #e5e7eb' }}>
            {/* Header & Legend */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem', paddingBottom: '0.875rem', borderBottom: '1px solid #e5e7eb', flexWrap: 'wrap', gap: '0.75rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <ShieldCheck size={18} color="var(--indigo)" />
                <span style={{ fontWeight: 700, fontSize: '0.9375rem', color: '#111827' }}>
                  ZeroGPT Highlighted Text Breakdown
                </span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
                <div style={{ display: 'flex', gap: 4 }}>
                  <button className={`btn btn-xs ${highlightFilter === 'all' ? 'btn-primary' : 'btn-ghost'}`} onClick={() => setHighlightFilter('all')}>All Text</button>
                  <button className={`btn btn-xs ${highlightFilter === 'ai_only' ? 'btn-primary' : 'btn-ghost'}`} onClick={() => setHighlightFilter('ai_only')}>
                    AI Flagged ({result.highlightedSentences.length})
                  </button>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', fontSize: '0.8125rem' }}>
                  <span style={{ width: 14, height: 14, background: '#ffff00', border: '1px solid #d97706', borderRadius: 2, display: 'inline-block' }} />
                  <span style={{ fontWeight: 600, color: '#374151' }}>AI-flagged by ZeroGPT</span>
                </div>
              </div>
            </div>

            {/* Render actual content with AI phrases highlighted */}
            {highlightFilter === 'all' ? (
              <div style={{ maxHeight: 460, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                {assignment.sections.map((sec) => (
                  <div key={sec.id}>
                    <h3 style={{ fontSize: '0.9375rem', fontWeight: 700, color: '#111827', marginBottom: '0.5rem' }}>{sec.title}</h3>
                    <div style={{ fontSize: '0.9375rem', lineHeight: 1.8, color: '#111827', fontFamily: 'serif' }}>
                      {highlightTextWithAIMatches(sec.originalText, result.highlightedSentences)}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {result.highlightedSentences.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '2rem', color: '#16a34a', fontWeight: 600 }}>
                    ✅ No AI-flagged sentences detected by ZeroGPT
                  </div>
                ) : (
                  result.highlightedSentences.map((sent, i) => (
                    <div key={i} style={{ background: '#fffbe8', border: '1px solid #fde68a', borderLeft: '4px solid #d97706', borderRadius: 8, padding: '0.75rem 1rem' }}>
                      <mark style={{ background: '#ffff00', color: '#000', fontWeight: 500, padding: '2px 4px', borderRadius: 2, fontFamily: 'serif', fontSize: '0.9375rem' }}>
                        {sent}
                      </mark>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        </>
      )}

      {/* ── NAVIGATION ────────────────────────────────────────────────────── */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '1.5rem', borderTop: '1px solid var(--border)', marginTop: '1.5rem' }}>
        <button className="btn btn-secondary" onClick={onPrev}><ArrowLeft size={15} /> Back</button>
        <button className="btn btn-primary btn-lg" onClick={onNext}>
          {scanState === 'done'
            ? (result && result.overallScore <= 0 ? 'Proceed (0% AI - 100% Human)' : 'Humanize AI Text')
            : 'Skip & Continue'} <ArrowRight size={15} />
        </button>
      </div>
    </div>
  );
};

/**
 * Renders text with ZeroGPT-flagged sentences highlighted in bright yellow,
 * matching the AI-highlighted phrases from the real scrape.
 */
function highlightTextWithAIMatches(text: string, aiSentences: string[]): React.ReactNode[] {
  if (!text) return [];
  if (aiSentences.length === 0) return [<span key="0">{text}</span>];

  const parts: React.ReactNode[] = [];
  let remaining = text;
  let key = 0;

  for (const aiSent of aiSentences) {
    const idx = remaining.indexOf(aiSent);
    if (idx === -1) continue;
    if (idx > 0) parts.push(<span key={key++}>{remaining.slice(0, idx)}</span>);
    parts.push(
      <mark
        key={key++}
        title="Flagged by ZeroGPT as AI-generated"
        style={{ background: '#ffff00', color: '#000', fontWeight: 500, padding: '2px 4px', borderRadius: 2, cursor: 'help' }}
      >
        {aiSent}
      </mark>
    );
    remaining = remaining.slice(idx + aiSent.length);
  }
  if (remaining) parts.push(<span key={key++}>{remaining}</span>);
  return parts;
}
