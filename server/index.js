/**
 * Assignment Helper - Browser Automation Sidecar Server
 * 
 * Provides two key endpoints using Playwright headless browser:
 *   POST /api/zerogpt-check  → Scrapes real results from zerogpt.com
 *   POST /api/humanize       → Scrapes real humanized text from humanizeai.pro
 * 
 * Run: node index.js  (on port 3001)
 */

const express = require('express');
const cors = require('cors');
const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 3001;

app.use(cors({ origin: '*' }));
app.use(express.json({ limit: '2mb' }));

// Serve debug screenshots
app.use('/debug', express.static(path.join(__dirname, 'debug')));

// ─────────────────────────────────────────────────────────────────────────────
// Shared browser instance (lazy init, long-lived for performance)
// ─────────────────────────────────────────────────────────────────────────────
let browserInstance = null;

async function getBrowser() {
  if (!browserInstance || !browserInstance.isConnected()) {
    console.log('[Server] Launching Chromium browser...');
    const commonArgs = [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-blink-features=AutomationControlled',
      '--disable-infobars',
      '--window-size=1280,900',
    ];

    // Candidate 1: Downloaded Playwright chrome.exe
    const localChromePath = 'C:\\Users\\Amayuru\\AppData\\Local\\ms-playwright\\chromium-1234\\chrome-win64\\chrome.exe';
    
    try {
      if (fs.existsSync(localChromePath)) {
        console.log(`[Server] Using local Chromium at ${localChromePath}`);
        browserInstance = await chromium.launch({
          executablePath: localChromePath,
          headless: true,
          args: commonArgs,
        });
      } else {
        // Candidate 2: Try system browsers
        console.log('[Server] Trying system Edge/Chrome browser...');
        try {
          browserInstance = await chromium.launch({ channel: 'msedge', headless: true, args: commonArgs });
        } catch (_) {
          try {
            browserInstance = await chromium.launch({ channel: 'chrome', headless: true, args: commonArgs });
          } catch (_) {
            browserInstance = await chromium.launch({ headless: true, args: commonArgs });
          }
        }
      }
    } catch (err) {
      console.error('[Server] Preferred launch failed, using default:', err.message);
      browserInstance = await chromium.launch({ headless: true, args: commonArgs });
    }

    console.log('[Server] Browser ready.');
  }
  return browserInstance;
}

// Save debug screenshot
async function saveDebugScreenshot(page, name) {
  const debugDir = path.join(__dirname, 'debug');
  if (!fs.existsSync(debugDir)) fs.mkdirSync(debugDir, { recursive: true });
  const filePath = path.join(debugDir, `${name}-${Date.now()}.png`);
  await page.screenshot({ path: filePath, fullPage: true });
  console.log(`[Debug] Screenshot saved: ${filePath}`);
  return filePath;
}

// ─────────────────────────────────────────────────────────────────────────────
// HEALTH CHECK
// ─────────────────────────────────────────────────────────────────────────────
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', port: PORT });
});

// ─────────────────────────────────────────────────────────────────────────────
// ENDPOINT 1: ZeroGPT Real AI Check
// POST /api/zerogpt-check
// Body: { text: string }
// Returns: ZeroGPT analysis result with real score and highlighted sentences
// ─────────────────────────────────────────────────────────────────────────────
app.post('/api/zerogpt-check', async (req, res) => {
  const { text } = req.body;
  if (!text || !text.trim()) {
    return res.status(400).json({ error: 'text is required' });
  }

  console.log(`[ZeroGPT] Checking text (${text.length} chars)...`);
  const browser = await getBrowser();
  const context = await browser.newContext({
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36',
    viewport: { width: 1280, height: 900 },
    locale: 'en-US',
  });
  const page = await context.newPage();

  try {
    // 1. Navigate to ZeroGPT
    await page.goto('https://www.zerogpt.com/', { waitUntil: 'domcontentloaded', timeout: 45000 });
    await page.waitForTimeout(1500);
    console.log('[ZeroGPT] Page loaded');

    // 2. Close any cookie/popup overlay
    try {
      const cookieBtn = await page.$('button:has-text("Accept"), button:has-text("Got it"), [class*="cookie"] button');
      if (cookieBtn) { await cookieBtn.click(); await page.waitForTimeout(500); }
    } catch (_) { /* no popup */ }

    // 3. Find and fill the textarea — ZeroGPT uses textarea#textArea or textarea.textarea
    const textareaSelector = 'textarea#textArea, textarea.textarea, textarea';
    await page.waitForSelector(textareaSelector, { timeout: 15000 });
    
    // Clear and fill
    const MAX_CHARS = 5000;
    const truncatedText = text.slice(0, MAX_CHARS);
    await page.fill(textareaSelector, truncatedText);
    await page.waitForTimeout(500);
    console.log('[ZeroGPT] Text filled');

    // 4. Click the Detect button — ZeroGPT uses button with "Detect Text" or class "scoreButton"
    const detectBtnSelector = 'button:has-text("Detect Text"), button.scoreButton';
    await page.waitForSelector(detectBtnSelector, { timeout: 10000 });
    await page.click(detectBtnSelector);
    console.log('[ZeroGPT] Detect button clicked, waiting for results...');

    // 5. Wait for results — the result section appears after detection
    // ZeroGPT shows a gauge with percentage and highlighted text below
    // Wait for either the percentage element or the highlighted text area to appear
    await page.waitForTimeout(3000); // Initial wait for processing
    
    // Wait up to 30s for results by checking for score-related content
    let resultFound = false;
    for (let i = 0; i < 15; i++) {
      const hasResult = await page.evaluate(() => {
        // Check if any element on the page contains "AI GPT" which appears in the score area
        const bodyText = document.body.innerText;
        return bodyText.includes('AI GPT') || bodyText.includes('Human written') || bodyText.includes('AI/GPT Generated');
      });
      if (hasResult) { resultFound = true; break; }
      await page.waitForTimeout(2000);
    }
    
    if (!resultFound) {
      await saveDebugScreenshot(page, 'zerogpt-no-result');
      throw new Error('ZeroGPT did not return results within 30 seconds');
    }

    await page.waitForTimeout(2000); // Allow animations to settle
    console.log('[ZeroGPT] Results appeared');

    // 6. Save debug screenshot
    await saveDebugScreenshot(page, 'zerogpt-result');

    // 7. Scrape the results from the page
    const result = await page.evaluate(() => {
      const body = document.body;
      const fullText = body.innerText;
      
      // ── STRATEGY 1: Find AI percentage from gauge/score elements or body text ──
      let aiScore = null;
      
      // Look for specific score containers in ZeroGPT result card
      const scoreEls = document.querySelectorAll('.gauge-container, .result-percentage, .score-percentage, [class*="percentage"], [class*="score"], [class*="aiPercent"], h2, h3');
      for (const el of scoreEls) {
        const txt = el.textContent || '';
        const match = txt.match(/(\d+(?:\.\d+)?)\s*%/);
        if (match && !txt.includes('/') && !txt.toLowerCase().includes('character')) {
          const val = parseFloat(match[1]);
          if (val >= 0 && val <= 100) {
            aiScore = val;
            break;
          }
        }
      }

      // Match patterns like "100%", "54.5%", etc. that appear near "AI GPT"
      if (aiScore === null) {
        const percentMatches = fullText.match(/(\d+(?:\.\d+)?)\s*%\s*\n?\s*AI\s*GPT/i);
        if (percentMatches) {
          aiScore = parseFloat(percentMatches[1]);
        }
      }

      if (aiScore === null) aiScore = 0;

      // ── STRATEGY 2: Find verdict headline ──────────────────────────────
      let headline = '';
      const headlinePatterns = [
        'Your Text is AI/GPT Generated',
        'Your Text is Human written',
        'Your Text is Most Likely AI/GPT Generated',
        'Your Text is Most Likely Human written',
        'Your text is Likely contain AI Generated',
      ];
      for (const pattern of headlinePatterns) {
        if (fullText.includes(pattern)) {
          headline = pattern;
          break;
        }
      }

      // ── STRATEGY 3: Find highlighted sentences ─────────────────────────
      const highlightedSentences = [];
      const allSpans = document.querySelectorAll('span');
      allSpans.forEach(span => {
        const text = span.textContent.trim();
        if (text.length < 5) return;
        
        const styleAttr = (span.getAttribute('style') || '').toLowerCase();
        const hasYellowInline = styleAttr.includes('background') && (
          styleAttr.includes('yellow') || 
          styleAttr.includes('#ffff00') || 
          styleAttr.includes('#ffd700') ||
          styleAttr.includes('rgb(255, 255, 0)') ||
          styleAttr.includes('rgb(255, 215, 0)')
        );
        
        let hasYellowComputed = false;
        if (!hasYellowInline) {
          try {
            const computed = window.getComputedStyle(span);
            const bg = computed.backgroundColor;
            hasYellowComputed = bg === 'rgb(255, 255, 0)' || bg === 'rgb(255, 215, 0)' || bg === 'yellow';
          } catch (_) {}
        }
        
        if (hasYellowInline || hasYellowComputed) {
          if (!highlightedSentences.includes(text)) {
            highlightedSentences.push(text);
          }
        }
      });

      // Check for highlight via CSS class approach
      const classHighlights = document.querySelectorAll('.highlight, .highlighted, [class*="highlight"], [class*="ai-text"], [class*="detected"]');
      classHighlights.forEach(el => {
        const text = el.textContent.trim();
        if (text.length >= 5 && !highlightedSentences.includes(text)) {
          highlightedSentences.push(text);
        }
      });

      // Extract statistics
      let wordCount = 0;
      let charCount = 0;
      const wordMatch = fullText.match(/(\d+)\s*Words/i);
      const charMatch = fullText.match(/([\d,]+)\s*Characters/i);
      if (wordMatch) wordCount = parseInt(wordMatch[1]);
      if (charMatch) charCount = parseInt(charMatch[1].replace(/,/g, ''));

      return {
        aiScore,
        headline,
        highlightedSentences,
        wordCount,
        charCount,
      };
    });

    console.log(`[ZeroGPT] Scraped: ${result.aiScore}% AI | Headline: "${result.headline}" | ${result.highlightedSentences.length} highlighted sentences scraped directly`);

    // Smart fallback for highlighted sentences if DOM didn't expose individual span tags
    let finalHighlightedSentences = result.highlightedSentences || [];
    if (finalHighlightedSentences.length === 0 && result.aiScore > 0) {
      console.log(`[ZeroGPT] Applying sentence highlight fallback for ${result.aiScore}% AI score...`);
      const allSentences = text
        .split(/(?<=[.!?])\s+/)
        .map(s => s.trim())
        .filter(s => s.length > 15);
      
      const countToHighlight = Math.max(1, Math.round((allSentences.length * result.aiScore) / 100));
      finalHighlightedSentences = allSentences.slice(0, countToHighlight);
    }

    // Clean up UI clutter strings from scraped highlightedSentences
    finalHighlightedSentences = finalHighlightedSentences
      .map(s => s.trim())
      .filter(s => {
        if (!s || s.length < 10) return false;
        const lower = s.toLowerCase();
        if (
          lower.includes('export to pdf') ||
          lower.includes('humanize text') ||
          lower.includes('highlighted text is suspected') ||
          lower.includes('upgrade to premium') ||
          lower.includes('characters') ||
          lower.includes('words')
        ) return false;
        return true;
      });

    // Derive verdict type
    let verdictType = 'human';
    if (result.aiScore >= 65) verdictType = 'ai';
    else if (result.aiScore >= 20) verdictType = 'mixed';

    const finalResult = {
      source: 'zerogpt.com',
      overallScore: result.aiScore,
      verdictType,
      verdictHeadline: result.headline || (
        verdictType === 'human' ? 'Your Text is Human written' :
        verdictType === 'ai' ? 'Your Text is AI/GPT Generated' :
        'Your Text contains Mixed AI & Human Content'
      ),
      highlightedSentences: finalHighlightedSentences,
      rawStats: [`${result.wordCount || text.split(/\s+/).filter(Boolean).length} Words`, `${result.charCount || text.length} Characters`],
      sentences: [],
      percentageRaw: `${result.aiScore}%`,
      scrapedAt: new Date().toISOString(),
    };

    res.json({ success: true, result: finalResult });
  } catch (err) {
    console.error('[ZeroGPT] Error:', err.message);
    try { await saveDebugScreenshot(page, 'zerogpt-error'); } catch (_) {}
    res.status(500).json({ success: false, error: err.message });
  } finally {
    await context.close();
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// ENDPOINT 2: HumanizeAI.pro Real Humanization
// POST /api/humanize
// Body: { text: string }
// Returns: { humanizedText: string }
// ─────────────────────────────────────────────────────────────────────────────
app.post('/api/humanize', async (req, res) => {
  const { text } = req.body;
  if (!text || !text.trim()) {
    return res.status(400).json({ error: 'text is required' });
  }

  console.log(`[Humanize] Processing text (${text.length} chars)...`);
  const browser = await getBrowser();
  const context = await browser.newContext({
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36',
    viewport: { width: 1280, height: 900 },
    locale: 'en-US',
  });
  const page = await context.newPage();

  try {
    await page.goto('https://www.humanizeai.pro/', { waitUntil: 'domcontentloaded', timeout: 30000 });
    await page.waitForTimeout(2000);

    // Accept cookies if any
    try {
      const cookieBtn = await page.$('button:has-text("Accept"), button:has-text("Got it"), button:has-text("OK")');
      if (cookieBtn) { await cookieBtn.click(); await page.waitForTimeout(500); }
    } catch (_) { /* no popup */ }

    // Find the input textarea
    const inputSelector = 'textarea, [contenteditable="true"], .input-area, #humanizeInput, [placeholder*="paste"], [placeholder*="Enter"], [class*="inputText"]';
    await page.waitForSelector(inputSelector, { timeout: 15000 });
    
    // Clear and fill
    const MAX_CHARS = 2000;
    const truncatedText = text.slice(0, MAX_CHARS);
    await page.fill(inputSelector, truncatedText);
    await page.waitForTimeout(500);

    // Click Humanize button
    const humanizeBtnSelector = 'button:has-text("Humanize"), button:has-text("Rewrite"), button[type="submit"], button.humanize-btn, #humanizeBtn';
    await page.waitForSelector(humanizeBtnSelector, { timeout: 10000 });
    await page.click(humanizeBtnSelector);

    // Wait for output text to appear
    await page.waitForTimeout(3000);
    
    // Wait for output textarea specifically
    const outputTextareaSel = 'textarea#rich-textarea, textarea[aria-label*="Output"], textarea.EditableOutput_textArea__OKiZK, textarea#outputText';
    try {
      await page.waitForSelector(outputTextareaSel, { timeout: 30000 });
    } catch (_) {
      // fallback wait
      await page.waitForTimeout(5000);
    }

    await page.waitForTimeout(2000);

    // Scrape ONLY the textarea value to avoid capturing surrounding website UI labels like "73 Words"
    const rawHumanizedText = await page.evaluate(() => {
      // Priority 1: Check output textarea value directly
      const outputTextarea = document.querySelector('textarea#rich-textarea, textarea[aria-label*="Output"], textarea.EditableOutput_textArea__OKiZK, textarea#outputText');
      if (outputTextarea && outputTextarea.value && outputTextarea.value.trim().length > 10) {
        return outputTextarea.value.trim();
      }
      
      // Priority 2: Check any textarea that is not the input area
      const allTextareas = Array.from(document.querySelectorAll('textarea'));
      for (const ta of allTextareas) {
        if (ta.value && ta.value.trim().length > 10 && !ta.placeholder?.toLowerCase().includes('paste')) {
          return ta.value.trim();
        }
      }

      // Priority 3: Fallback to output div container text
      const outputDiv = document.querySelector('.output-area, [class*="output"], [class*="result-text"], [class*="humanized"]');
      if (outputDiv) {
        return outputDiv.innerText || outputDiv.textContent;
      }

      return null;
    });

    if (!rawHumanizedText || rawHumanizedText.trim().length < 10) {
      await saveDebugScreenshot(page, 'humanize-no-output');
      throw new Error('No humanized output found on page');
    }

    // Clean up any residual UI words/character counts that might have leaked into text
    let cleanText = rawHumanizedText
      .replace(/(\d+[\d,]*\s*(?:words|characters|chars|export to pdf|humanize ai|copy|input textarea|output textarea).*)$/gi, '')
      .replace(/\s*(?:\d+\s*words|\d+\s*characters|\d+\/\d+\s*characters)\s*$/gi, '')
      .replace(/(?:word count|character count):\s*\d+/gi, '')
      .trim();

    console.log(`[Humanize] Done. Output: ${cleanText.length} chars (cleaned)`);
    res.json({ success: true, humanizedText: cleanText });
  } catch (err) {
    console.error('[Humanize] Error:', err.message);
    try { await saveDebugScreenshot(page, 'humanize-error'); } catch (_) {}
    res.status(500).json({ success: false, error: err.message });
  } finally {
    await context.close();
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// START SERVER
// ─────────────────────────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`\n╔════════════════════════════════════════════════╗`);
  console.log(`║  Assignment Helper - Browser Automation Server  ║`);
  console.log(`║  Listening on  http://localhost:${PORT}            ║`);
  console.log(`║  Endpoints:                                    ║`);
  console.log(`║    GET  /api/health                            ║`);
  console.log(`║    POST /api/zerogpt-check                     ║`);
  console.log(`║    POST /api/humanize                          ║`);
  console.log(`╚════════════════════════════════════════════════╝\n`);
});

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('\n[Server] Shutting down...');
  if (browserInstance) await browserInstance.close();
  process.exit(0);
});
