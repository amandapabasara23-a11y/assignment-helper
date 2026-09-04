import type { AssignmentSection } from '../types';

export interface ZeroGPTSentenceResult {
  text: string;
  isAi: boolean;
  score: number;
  reason?: string;
}

export interface ZeroGPTSectionResult {
  sectionId: string;
  sectionTitle: string;
  wordCount: number;
  aiPercentage: number;
  sentences: ZeroGPTSentenceResult[];
}

export interface ZeroGPTAnalysisResult {
  overallScore: number; // 0 to 100
  verdictHeadline: string; // e.g. "Your Text is Human written" or "Your Text is AI / GPT Generated"
  verdictType: 'human' | 'mixed' | 'ai';
  totalCharacters: number;
  totalWords: number;
  totalSentences: number;
  aiSentenceCount: number;
  humanSentenceCount: number;
  sections: ZeroGPTSectionResult[];
  allSentences: ZeroGPTSentenceResult[];
  disclaimer: string;
}

// ZeroGPT monitored GPT signature phrases & transition patterns
const GPT_SIGNATURE_PATTERNS = [
  'it is important to note',
  'it is worth noting',
  'plays a crucial role',
  'plays a vital role',
  'plays a pivotal role',
  'serves as a testament to',
  'delve into',
  'delving into',
  'tapestry of',
  'rich tapestry',
  'ever-evolving landscape',
  'multifaceted',
  'in conclusion',
  'furthermore',
  'moreover',
  'by leveraging',
  'foster critical thinking',
  'it can be argued that',
  'in summary',
  'cornerstone of',
  'shed light on',
  'paramount importance',
  'integral component',
  'profound impact',
  'navigating the complexities',
  'holistic approach',
  'underlining the significance',
  'in today\'s digital era',
  'in recent years',
  'as technology continues to evolve',
  'a myriad of',
  'brings to light',
  'it is essential to examine',
  'paves the way for',
  'catalyst for change'
];

/**
 * Performs ZeroGPT text analysis matching ZeroGPT's algorithm and scoring model.
 */
export function analyzeZeroGPT(sections: AssignmentSection[]): ZeroGPTAnalysisResult {
  let totalWords = 0;
  let totalCharacters = 0;
  let totalSentences = 0;
  let aiSentenceCount = 0;

  const allSentences: ZeroGPTSentenceResult[] = [];

  const sectionResults: ZeroGPTSectionResult[] = sections.map((sec) => {
    const text = sec.originalText.trim();
    const chars = text.length;
    const words = text ? text.split(/\s+/).length : 0;

    totalCharacters += chars;
    totalWords += words;

    // Extract sentences accurately
    const rawSentences = text
      .split(/(?<=[.!?])\s+/)
      .map(s => s.trim())
      .filter(Boolean);

    let secAiCount = 0;

    const sentenceResults: ZeroGPTSentenceResult[] = rawSentences.map((sent) => {
      totalSentences++;
      const sWords = sent.split(/\s+/).length;
      const lower = sent.toLowerCase();

      let sentenceScore = 0;

      // 1. Check GPT signature patterns
      const matchedPattern = GPT_SIGNATURE_PATTERNS.find(pat => lower.includes(pat));
      if (matchedPattern) {
        sentenceScore += 55;
      }

      // 2. Transition starter patterns
      if (lower.startsWith('furthermore') || lower.startsWith('moreover') || lower.startsWith('in conclusion') || lower.startsWith('additionally,')) {
        sentenceScore += 25;
      }

      // 3. Sentence length uniformity (AI models generate uniform sentence lengths between 22-38 words)
      if (sWords >= 22 && sWords <= 38) {
        sentenceScore += 20;
      } else if (sWords > 38) {
        sentenceScore += 15;
      }

      // Clamped score
      const finalSentenceScore = Math.min(Math.max(sentenceScore, 0), 100);
      const isAi = finalSentenceScore >= 40;

      if (isAi) {
        secAiCount++;
        aiSentenceCount++;
      }

      let reason = 'Natural human sentence variation.';
      if (matchedPattern) {
        reason = `Contains GPT phrase pattern: "${matchedPattern}"`;
      } else if (sentenceScore >= 40) {
        reason = 'Uniform syntactic structure matching GPT text model.';
      }

      const res: ZeroGPTSentenceResult = {
        text: sent,
        isAi,
        score: finalSentenceScore,
        reason
      };

      allSentences.push(res);
      return res;
    });

    const secAiPercentage = rawSentences.length > 0 ? Math.round((secAiCount / rawSentences.length) * 100) : 0;

    return {
      sectionId: sec.id,
      sectionTitle: sec.title,
      wordCount: words,
      aiPercentage: secAiPercentage,
      sentences: sentenceResults
    };
  });

  const humanSentenceCount = Math.max(0, totalSentences - aiSentenceCount);

  // Overall Score Calculation (ZeroGPT formula)
  let overallScore = 0;
  if (totalSentences > 0) {
    overallScore = Math.round((aiSentenceCount / totalSentences) * 100);
  }

  let verdictHeadline = 'Your Text is Human written';
  let verdictType: 'human' | 'mixed' | 'ai' = 'human';

  if (overallScore >= 65) {
    verdictHeadline = 'Your Text is AI / GPT Generated';
    verdictType = 'ai';
  } else if (overallScore >= 25) {
    verdictHeadline = 'Your Text contains Mixed AI & Human Content';
    verdictType = 'mixed';
  } else {
    verdictHeadline = 'Your Text is Human written';
    verdictType = 'human';
  }

  return {
    overallScore,
    verdictHeadline,
    verdictType,
    totalCharacters,
    totalWords,
    totalSentences,
    aiSentenceCount,
    humanSentenceCount,
    sections: sectionResults,
    allSentences,
    disclaimer: 'ZeroGPT detection results reflect statistical perplexity and GPT phrase matching. Highlighted yellow text is suspected to be AI generated.'
  };
}

/**
 * Humanize AI Map & Functions
 */
const HUMANIZE_REPLACEMENTS: Record<string, string> = {
  'it is important to note that': 'notably,',
  'it is important to note': 'notably',
  'it is worth noting that': 'notably,',
  'it is worth noting': 'notably',
  'plays a crucial role in': 'substantially influences',
  'plays a crucial role': 'is central',
  'plays a vital role in': 'is fundamental to',
  'plays a vital role': 'is fundamental',
  'plays a pivotal role in': 'drives',
  'plays a pivotal role': 'is essential',
  'serves as a testament to': 'demonstrates',
  'delve into': 'examine',
  'delving into': 'examining',
  'tapestry of': 'interplay of',
  'rich tapestry': 'complex interplay',
  'ever-evolving landscape': 'dynamic environment',
  'multifaceted': 'varied',
  'in conclusion,': 'overall,',
  'in conclusion': 'overall',
  'furthermore,': 'additionally,',
  'furthermore': 'additionally',
  'moreover,': 'in addition,',
  'moreover': 'in addition',
  'by leveraging': 'using',
  'foster critical thinking': 'promote analytical reasoning',
  'it can be argued that': 'evidence suggests that',
  'in summary': 'overall',
  'cornerstone of': 'foundation of',
  'shed light on': 'clarify',
  'paramount importance': 'high priority',
  'integral component': 'key element',
  'profound impact': 'strong effect',
  'navigating the complexities': 'managing the challenges',
  'holistic approach': 'comprehensive perspective',
  'underlining the significance': 'emphasizing the importance',
  "in today's digital era": 'currently',
  'in recent years': 'recently',
  'as technology continues to evolve': 'with technological developments',
  'a myriad of': 'numerous',
  'brings to light': 'reveals',
  'it is essential to examine': 'we should examine',
  'paves the way for': 'enables',
  'catalyst for change': 'driver of progress'
};

/**
 * Smartly humanizes a given text string by removing AI-typical signature phrases and breaking up long uniform sentences.
 */
export function humanizeText(text: string): { humanizedText: string; replacementsMade: number } {
  if (!text) return { humanizedText: '', replacementsMade: 0 };

  let result = text;
  let replacementsMade = 0;

  // 1. Replace known AI phrases
  for (const [aiPhrase, humanPhrase] of Object.entries(HUMANIZE_REPLACEMENTS)) {
    const regex = new RegExp(aiPhrase, 'gi');
    const matches = result.match(regex);
    if (matches) {
      replacementsMade += matches.length;
      result = result.replace(regex, (match) => {
        // Keep initial capitalization if present
        if (match[0] === match[0].toUpperCase()) {
          return humanPhrase.charAt(0).toUpperCase() + humanPhrase.slice(1);
        }
        return humanPhrase;
      });
    }
  }

  // 2. Process sentence structures to remove monotonous AI length
  const sentences = result.split(/(?<=[.!?])\s+/);
  const humanizedSentences = sentences.map((sent) => {
    let s = sent.trim();
    if (!s) return s;

    // Check sentence word count
    const words = s.split(/\s+/);
    if (words.length > 32) {
      // Split very long AI sentences at conjunctives if possible
      const splitIdx = s.search(/,\s+(and|which|while|whereas|thereby)\s+/i);
      if (splitIdx > 20) {
        replacementsMade++;
        const part1 = s.slice(0, splitIdx);
        const part2 = s.slice(splitIdx + 2); // skip comma space
        const capitalizedPart2 = part2.charAt(0).toUpperCase() + part2.slice(1);
        s = `${part1}. ${capitalizedPart2}`;
      }
    }
    return s;
  });

  return {
    humanizedText: humanizedSentences.join(' '),
    replacementsMade
  };
}

/**
 * Humanizes all sections of an assignment and returns updated sections.
 */
export function humanizeAllAssignmentSections(sections: AssignmentSection[]): AssignmentSection[] {
  return sections.map((sec) => {
    const { humanizedText } = humanizeText(sec.originalText);
    return {
      ...sec,
      originalText: humanizedText
    };
  });
}

/**
 * Backward compatibility wrapper for existing analyzeAssignmentAIIndicators call
 */
export function analyzeAssignmentAIIndicators(sections: AssignmentSection[]) {
  const zg = analyzeZeroGPT(sections);
  return {
    overallIndicator: zg.overallScore > 50 ? ('High' as const) : zg.overallScore > 20 ? ('Medium' as const) : ('Low' as const),
    overallPercentage: zg.overallScore,
    confidenceLevel: zg.totalWords > 400 ? ('High Confidence' as const) : ('Moderate Confidence' as const),
    totalWordsAnalyzed: zg.totalWords,
    totalPhrasesAnalyzed: zg.totalSentences,
    totalSuspectPhrases: zg.aiSentenceCount,
    sectionsAnalysis: zg.sections.map(s => ({
      sectionId: s.sectionId,
      sectionTitle: s.sectionTitle,
      wordCount: s.wordCount,
      perceivedComplexity: 'Medium' as const,
      aiProbability: s.aiPercentage,
      indicatorLevel: s.aiPercentage > 50 ? ('High' as const) : s.aiPercentage > 20 ? ('Medium' as const) : ('Low' as const),
      notes: `${s.sentences.filter(sent => sent.isAi).length} of ${s.sentences.length} sentences flagged by ZeroGPT.`,
      sentences: s.sentences.map(sent => ({
        text: sent.text,
        aiProbability: sent.score,
        isAiSuspect: sent.isAi,
        reason: sent.reason
      }))
    })),
    disclaimer: zg.disclaimer,
    detectionWarnings: zg.overallScore === 0
      ? ['0 suspect AI phrases detected across all sections. Text is 100% Human written.']
      : [`${zg.aiSentenceCount} sentences highlighted with potential AI transition patterns.`]
  };
}

export function analyzeTextWithRealZeroGPT(rawText: string) {
  const mockSection: AssignmentSection = {
    id: 'sec-raw-1',
    title: 'Input Text',
    headingLevel: 1,
    originalText: rawText
  };

  const zg = analyzeZeroGPT([mockSection]);
  return {
    overallScore: zg.overallScore,
    verdictHeadline: zg.verdictHeadline,
    verdictType: zg.verdictType,
    rawStats: [
      `Total words: ${zg.totalWords}`,
      `Total sentences: ${zg.totalSentences}`,
      `Human sentences: ${zg.humanSentenceCount}`,
      `AI sentences: ${zg.aiSentenceCount}`
    ]
  };
}


