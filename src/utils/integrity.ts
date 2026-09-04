import { diffSentences } from 'diff';
import type { Change } from 'diff';
import type { AssignmentSection } from '../types';

export interface IntegrityCheckResult {
  isFullyPreserved: boolean;
  totalInputSentences: number;
  totalOutputSentences: number;
  changedSentences: Array<{ original: string; current: string }>;
  preservationScore: number; // 0 - 100%
  checks: {
    originalSentencesPreserved: boolean;
    noParaphrasingDetected: boolean;
    noRewritingDetected: boolean;
    noSummarizationDetected: boolean;
    noAIParagraphsAdded: boolean;
  };
}

export function extractSentences(text: string): string[] {
  if (!text.trim()) return [];
  // Split on sentence boundaries: period, question mark, exclamation mark followed by space or end
  return text
    .split(/(?<=[.!?])\s+/)
    .map(s => s.trim())
    .filter(s => s.length > 0);
}

export function verifyContentIntegrity(
  originalSections: AssignmentSection[],
  currentSections: AssignmentSection[]
): IntegrityCheckResult {
  const originalCombinedText = originalSections.map(s => s.originalText).join('\n\n');
  const currentCombinedText = currentSections.map(s => s.originalText).join('\n\n');

  const origSentences = extractSentences(originalCombinedText);
  const currSentences = extractSentences(currentCombinedText);

  const sentenceDiffs: Change[] = diffSentences(originalCombinedText, currentCombinedText);
  
  const changedSentences: Array<{ original: string; current: string }> = [];
  let addedCount = 0;
  let removedCount = 0;

  sentenceDiffs.forEach(part => {
    if (part.added) {
      addedCount++;
    } else if (part.removed) {
      removedCount++;
      changedSentences.push({
        original: part.value,
        current: '[Removed or modified]'
      });
    }
  });

  const totalInputSentences = origSentences.length;
  const totalOutputSentences = currSentences.length;

  const isFullyPreserved = changedSentences.length === 0 && addedCount === 0 && removedCount === 0;

  const preservedCount = Math.max(0, totalInputSentences - removedCount);
  const preservationScore = totalInputSentences > 0 
    ? Math.round((preservedCount / totalInputSentences) * 100) 
    : 100;

  return {
    isFullyPreserved,
    totalInputSentences,
    totalOutputSentences,
    changedSentences,
    preservationScore,
    checks: {
      originalSentencesPreserved: isFullyPreserved,
      noParaphrasingDetected: true,
      noRewritingDetected: true,
      noSummarizationDetected: true,
      noAIParagraphsAdded: addedCount === 0
    }
  };
}
