import type { ReferenceSource, ReferencingStyle } from '../types';

export function formatReferenceItem(source: ReferenceSource, style: ReferencingStyle): string {
  const authorStr = source.authors.length > 0 ? source.authors.join(', ') : 'Unknown Author';
  const yearStr = source.year ? `(${source.year})` : '(n.d.)';
  const titleStr = source.title ? source.title : 'Untitled source';
  const journalStr = source.journalOrPublisher ? source.journalOrPublisher : '';

  switch (style) {
    case 'APA 7th Edition': {
      let result = `${authorStr} ${yearStr}. *${titleStr}*.`;
      if (journalStr) result += ` ${journalStr}.`;
      if (source.volume) result += ` ${source.volume}`;
      if (source.issue) result += `(${source.issue})`;
      if (source.pages) result += `, ${source.pages}.`;
      if (source.doi) result += ` https://doi.org/${source.doi}`;
      else if (source.url) result += ` Available at: ${source.url}`;
      return result;
    }

    case 'Harvard': {
      let result = `${authorStr}, ${source.year || 'n.d.'}. *${titleStr}*.`;
      if (journalStr) result += ` ${journalStr}`;
      if (source.volume) result += `, ${source.volume}`;
      if (source.issue) result += `(${source.issue})`;
      if (source.pages) result += `, pp.${source.pages}.`;
      if (source.url) result += ` Available at: <${source.url}>`;
      return result;
    }

    case 'MLA 9th Edition': {
      let result = `${authorStr}. "${titleStr}."`;
      if (journalStr) result += ` *${journalStr}*`;
      if (source.volume) result += `, vol. ${source.volume}`;
      if (source.issue) result += `, no. ${source.issue}`;
      if (source.year) result += `, ${source.year}`;
      if (source.pages) result += `, pp. ${source.pages}`;
      result += '.';
      return result;
    }

    case 'IEEE': {
      let result = `${authorStr}, "${titleStr},"`;
      if (journalStr) result += ` *${journalStr}*`;
      if (source.volume) result += `, vol. ${source.volume}`;
      if (source.issue) result += `, no. ${source.issue}`;
      if (source.pages) result += `, pp. ${source.pages}`;
      if (source.year) result += `, ${source.year}.`;
      return result;
    }

    case 'Chicago': {
      let result = `${authorStr}. "${titleStr}."`;
      if (journalStr) result += ` *${journalStr}*`;
      if (source.volume) result += ` ${source.volume}`;
      if (source.issue) result += `, no. ${source.issue}`;
      if (source.year) result += ` (${source.year})`;
      if (source.pages) result += `: ${source.pages}`;
      result += '.';
      return result;
    }

    case 'Vancouver': {
      let result = `${authorStr}. ${titleStr}. ${journalStr || 'Pub'}. ${source.year || ''}`;
      if (source.volume) result += `;${source.volume}`;
      if (source.issue) result += `(${source.issue})`;
      if (source.pages) result += `:${source.pages}.`;
      return result;
    }

    default: {
      return `${authorStr} (${source.year || 'n.d.'}). ${titleStr}. ${journalStr}.`;
    }
  }
}

export function generateInTextCitation(source: ReferenceSource, index: number, style: ReferencingStyle): string {
  const primaryAuthor = source.authors.length > 0 ? source.authors[0].split(',')[0].trim() : 'Source';
  const year = source.year || 'n.d.';

  if (style === 'IEEE' || style === 'Vancouver') {
    return `[${index + 1}]`;
  }

  if (source.authors.length > 2) {
    return `(${primaryAuthor} et al., ${year})`;
  } else if (source.authors.length === 2) {
    const secondAuthor = source.authors[1].split(',')[0].trim();
    return `(${primaryAuthor} & ${secondAuthor}, ${year})`;
  } else {
    return `(${primaryAuthor}, ${year})`;
  }
}

export function performReferenceAudit(sections: { originalText: string }[], references: ReferenceSource[]) {
  const combinedText = sections.map(s => s.originalText).join(' ');
  const sourcesUploaded = references.length;
  const successfullyIdentified = references.filter(r => r.extractionStatus !== 'incomplete').length;
  const missingInfoCount = references.filter(r => r.missingFields.length > 0).length;

  let inTextCitationsDetected = 0;
  const citedSources = new Set<string>();

  references.forEach((ref, idx) => {
    const mainAuthor = ref.authors.length > 0 ? ref.authors[0].split(',')[0].trim() : '';
    const numCitation = `[${idx + 1}]`;
    const yearMatch = ref.year && combinedText.includes(ref.year);
    const authorMatch = mainAuthor && combinedText.toLowerCase().includes(mainAuthor.toLowerCase());

    if (combinedText.includes(numCitation) || (authorMatch && yearMatch)) {
      citedSources.add(ref.id);
      inTextCitationsDetected++;
    }
  });

  const referencesNotCited = references.filter(r => !citedSources.has(r.id)).length;
  
  // Detect orphan citations (e.g. [99] or (Smith, 1999) without ref)
  const numericCitationMatches = combinedText.match(/\[\d+\]/g) || [];
  const validNumCitations = numericCitationMatches.filter(match => {
    const num = parseInt(match.replace(/\[|\]/g, ''), 10);
    return num >= 1 && num <= references.length;
  });
  const citationsWithoutMatchingRef = Math.max(0, numericCitationMatches.length - validNumCitations.length);

  return {
    sourcesUploaded,
    successfullyIdentified,
    missingInfoCount,
    inTextCitationsDetected,
    referencesNotCited,
    citationsWithoutMatchingRef
  };
}
