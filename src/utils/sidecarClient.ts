/**
 * Real-browser scraping client for ZeroGPT and HumanizeAI.pro
 * Talks to the local Playwright automation sidecar on port 3001.
 */

const SIDECAR_BASE = import.meta.env.VITE_AUTOMATION_SERVER_URL || 'http://localhost:3001';

export interface RealZeroGPTResult {
  source: string;
  overallScore: number;         // 0–100 AI percentage
  verdictType: 'human' | 'mixed' | 'ai';
  verdictHeadline: string;
  highlightedSentences: string[];
  rawStats: string[];
  sentences: Array<{ text: string; isAi: boolean }>;
  percentageRaw: string;
  scrapedAt: string;
}

export interface SidecarStatus {
  available: boolean;
  error?: string;
}

/** Check if the local sidecar server is running */
export async function checkSidecarHealth(): Promise<SidecarStatus> {
  try {
    const res = await fetch(`${SIDECAR_BASE}/api/health`, { signal: AbortSignal.timeout(3000) });
    if (res.ok) return { available: true };
    return { available: false, error: `HTTP ${res.status}` };
  } catch (e: unknown) {
    return { available: false, error: (e as Error).message };
  }
}

/**
 * Run the real ZeroGPT check via the Playwright sidecar.
 * Sends the text to the local server which opens zerogpt.com in headless Chromium,
 * pastes the text, clicks Detect, and scrapes the real result.
 */
export async function runRealZeroGPTCheck(text: string): Promise<RealZeroGPTResult> {
  const res = await fetch(`${SIDECAR_BASE}/api/zerogpt-check`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text }),
    signal: AbortSignal.timeout(60000), // ZeroGPT can take up to 60s
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: `HTTP ${res.status}` }));
    throw new Error(err.error || `Server error ${res.status}`);
  }

  const data = await res.json();
  if (!data.success) throw new Error(data.error || 'ZeroGPT scraping failed');
  return data.result as RealZeroGPTResult;
}

/**
 * Humanize text via the Playwright sidecar.
 * Sends the text to the local server which opens humanizeai.pro in headless Chromium,
 * pastes the text, clicks Humanize, and returns the real humanized output.
 */
export async function runRealHumanize(text: string): Promise<string> {
  const res = await fetch(`${SIDECAR_BASE}/api/humanize`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text }),
    signal: AbortSignal.timeout(90000), // Humanization can take time
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: `HTTP ${res.status}` }));
    throw new Error(err.error || `Server error ${res.status}`);
  }

  const data = await res.json();
  if (!data.success) throw new Error(data.error || 'Humanization failed');
  
  let raw = (data.humanizedText as string) || '';
  // Strip any trailing website UI noise (e.g., "73 Words", "517 Characters", "9 words", "Export to PDF")
  const cleaned = raw
    .replace(/(\d+[\d,]*\s*(?:words|characters|chars|export to pdf|humanize ai|copy|input textarea|output textarea).*)$/gi, '')
    .replace(/\s*(?:\d+\s*words|\d+\s*characters|\d+\/\d+\s*characters)\s*$/gi, '')
    .replace(/(?:word count|character count):\s*\d+/gi, '')
    .trim();

  return cleaned || raw;
}
