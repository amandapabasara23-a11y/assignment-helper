import React, { useState } from 'react';
import { ShieldCheck, RefreshCw } from 'lucide-react';
import { analyzeTextWithRealZeroGPT } from '../utils/aiChecker';

interface AICheckerViewProps {
  onBackToDashboard: () => void;
}

export const AICheckerView: React.FC<AICheckerViewProps> = ({ onBackToDashboard }) => {
  const [inputText, setInputText] = useState<string>(
    'The deployment of decentralized solar energy systems offers a sustainable mechanism to power micro-irrigation and post-harvest cold storage in rural agrarian communities. Agricultural activities rely heavily on predictable monsoonal rain patterns.'
  );
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [result, setResult] = useState<any>(null);

  const handleAnalyze = async () => {
    if (!inputText.trim()) return;
    setIsAnalyzing(true);
    try {
      const res = await analyzeTextWithRealZeroGPT(inputText);
      setResult(res);
    } catch (e) {
      console.error('Analysis failed', e);
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div style={{ maxWidth: 980, margin: '0 auto', padding: '2rem 1.5rem', animation: 'fadeIn 0.25s ease-out' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <span className="badge badge-emerald" style={{ marginBottom: '0.4rem' }}>
            ZERO-GPT ACADEMIC INTEGRITY ENGINE
          </span>
          <h1 className="display-2" style={{ margin: 0 }}>
            AI Integrity Checker
          </h1>
          <p className="body-lg" style={{ color: 'var(--text-3)', marginTop: '0.25rem' }}>
            Verify academic originality, sentence perplexity, and AI probability breakdown.
          </p>
        </div>

        <button onClick={onBackToDashboard} className="btn btn-secondary">
          <span>Back to Assignments</span>
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: result ? '1fr 340px' : '1fr', gap: '1.5rem' }}>
        <div className="card" style={{ padding: '1.75rem' }}>
          <label className="label" style={{ fontWeight: 700, marginBottom: '0.5rem' }}>
            Paste Document Text to Audit:
          </label>

          <textarea
            className="textarea"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Paste assignment draft or research text here..."
            style={{ minHeight: 220, fontSize: '0.95rem', lineHeight: 1.6, marginBottom: '1.25rem' }}
          />

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span className="body-sm" style={{ color: 'var(--text-3)' }}>
              {inputText.trim() ? inputText.trim().split(/\s+/).length : 0} words
            </span>

            <button
              onClick={handleAnalyze}
              disabled={isAnalyzing || !inputText.trim()}
              className="btn btn-primary btn-lg"
            >
              {isAnalyzing ? <RefreshCw size={16} className="animate-spin" /> : <ShieldCheck size={16} />}
              <span>{isAnalyzing ? 'Auditing Content...' : 'Run AI Integrity Audit'}</span>
            </button>
          </div>
        </div>

        {result && (
          <div className="card" style={{ padding: '1.75rem', background: 'var(--surface-inset)' }}>
            <span className="badge badge-indigo" style={{ marginBottom: '0.75rem' }}>
              AUDIT VERDICT
            </span>

            <div style={{ fontSize: '2.5rem', fontWeight: 800, color: result.verdictType === 'human' ? 'var(--accent-emerald)' : 'var(--accent-amber)', marginBottom: '0.2rem' }}>
              {result.overallScore}%
            </div>
            <div className="body-sm" style={{ fontWeight: 700, color: 'var(--text-2)', marginBottom: '1.25rem' }}>
              {result.verdictHeadline}
            </div>

            <div style={{ borderTop: '1px solid var(--border)', paddingTop: '1rem' }}>
              <div style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-3)', marginBottom: '0.5rem' }}>
                PARAGRAPH STATS
              </div>
              <ul style={{ paddingLeft: '1.2rem', fontSize: '0.85rem', color: 'var(--text-2)' }}>
                {result.rawStats?.map((s: string, idx: number) => (
                  <li key={idx} style={{ marginBottom: '0.25rem' }}>{s}</li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
