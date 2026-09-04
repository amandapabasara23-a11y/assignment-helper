import React from 'react';
import type { Assignment } from '../types';
import { formatReferenceItem } from '../utils/references';
import { computeHierarchicalNumbers } from '../utils/aiOrganizer';

interface LivePreviewPaperProps {
  assignment: Assignment;
  id?: string;
}

export const LivePreviewPaper: React.FC<LivePreviewPaperProps> = ({ assignment, id = 'assignment-paper-preview' }) => {
  const { formatting, sections, references, referencingStyle } = assignment;

  const fontMap: Record<string, string> = {
    'Times New Roman': '"Times New Roman", Times, serif',
    'Arial': 'Arial, Helvetica, sans-serif',
    'Calibri': 'Calibri, "Segoe UI", sans-serif',
    'Aptos': 'Aptos, system-ui, sans-serif',
    'Georgia': 'Georgia, serif'
  };

  const currentFontFamily = fontMap[formatting.fontFamily] || '"Times New Roman", serif';

  const marginMap: Record<string, string> = {
    'Normal (2.54 cm)': '25.4mm',
    'Narrow (1.27 cm)': '12.7mm',
    'Moderate': '19.0mm',
    'Wide': '31.7mm'
  };

  const currentMargin = marginMap[formatting.margin] || '25.4mm';

  // Compute section hierarchy numbers (1., 1.1, 1.1.1)
  const numberMap = computeHierarchicalNumbers(sections);

  // Calculate pages
  const coverEnabled = formatting.includeCoverPage;
  const tocEnabled = formatting.includeTableOfContents;
  let bodyStartPage = 1;
  if (coverEnabled) bodyStartPage++;
  if (tocEnabled) bodyStartPage++;

  return (
    <div id={id} style={{ display: 'flex', flexDirection: 'column', gap: '2rem', alignItems: 'center' }}>
      {/* ─────────────────────────────────────────────────────────────
          1. COVER PAGE SHEET
      ───────────────────────────────────────────────────────────── */}
      {coverEnabled && (
        <div
          className="paper-sheet animate-fade-in"
          style={{
            fontFamily: currentFontFamily,
            padding: currentMargin,
            fontSize: formatting.fontSize,
            lineHeight: formatting.lineSpacing,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            boxSizing: 'border-box'
          }}
        >
          {/* Top: Institution & Faculty */}
          <div style={{ textAlign: 'center', paddingTop: '1.5rem' }}>
            <h1 style={{ fontSize: '1.25rem', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '0.05em', color: '#000', margin: 0 }}>
              {assignment.institution || 'UNIVERSITY ASSIGNMENT'}
            </h1>
            {assignment.faculty && (
              <p style={{ fontSize: '0.9375rem', fontStyle: 'italic', color: '#333', marginTop: '0.375rem' }}>
                {assignment.faculty}
              </p>
            )}
          </div>

          {/* Center: Title & Topic */}
          <div style={{ textAlign: 'center', margin: 'auto 0', padding: '3rem 0' }}>
            <h2 style={{ fontSize: '1.875rem', fontWeight: 'bold', color: '#000', lineHeight: 1.3, margin: 0 }}>
              {assignment.title || 'Untitled Assignment'}
            </h2>
            {assignment.topic && (
              <p style={{ fontSize: '1rem', fontStyle: 'italic', color: '#444', marginTop: '1rem' }}>
                Topic: {assignment.topic}
              </p>
            )}
          </div>

          {/* Bottom: Student Metadata */}
          <div style={{ textAlign: 'center', paddingBottom: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.25rem', fontSize: '0.9375rem', color: '#000' }}>
            {assignment.studentName && (
              <p style={{ fontWeight: 'bold', fontSize: '1rem' }}>Submitted by: {assignment.studentName}</p>
            )}
            {assignment.studentId && <p>Student ID: {assignment.studentId}</p>}
            {(assignment.courseName || assignment.courseCode) && (
              <p>Course: {[assignment.courseCode, assignment.courseName].filter(Boolean).join(' - ')}</p>
            )}
            {assignment.instructorName && <p>Lecturer: {assignment.instructorName}</p>}
            {assignment.submissionDate && <p>Date: {assignment.submissionDate}</p>}
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          2. TABLE OF CONTENTS SHEET
      ───────────────────────────────────────────────────────────── */}
      {tocEnabled && (
        <div
          className="paper-sheet animate-fade-in"
          style={{
            fontFamily: currentFontFamily,
            padding: currentMargin,
            fontSize: formatting.fontSize,
            lineHeight: formatting.lineSpacing,
            boxSizing: 'border-box'
          }}
        >
          <h2 style={{ fontSize: '1.375rem', fontWeight: 'bold', color: '#000', borderBottom: '1px solid #111', paddingBottom: '0.5rem', marginBottom: '1.5rem' }}>
            Table of Contents
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem', fontSize: '0.9375rem' }}>
            {sections.map((sec) => {
              const numLabel = numberMap.get(sec.id) || '';
              const indentPx = sec.headingLevel === 1 ? 0 : sec.headingLevel === 2 ? 18 : 36;
              const isH1 = sec.headingLevel === 1;
              const isH3 = sec.headingLevel === 3;

              return (
                <div key={sec.id} style={{ display: 'flex', alignItems: 'baseline', width: '100%', paddingLeft: `${indentPx}px` }}>
                  <span style={{
                    fontWeight: isH1 ? 700 : 500,
                    fontStyle: isH3 ? 'italic' : 'normal',
                    color: '#000'
                  }}>
                    {numLabel} {sec.title}
                  </span>
                  <span style={{ flex: 1, borderBottom: '1px dotted #888', margin: '0 0.5rem', position: 'relative', top: '-4px' }} />
                  <span style={{ color: '#000', fontWeight: isH1 ? 700 : 400 }}>Page {bodyStartPage}</span>
                </div>
              );
            })}
            {references.length > 0 && (
              <div style={{ display: 'flex', alignItems: 'baseline', width: '100%', fontWeight: 'bold', marginTop: '0.25rem' }}>
                <span style={{ color: '#000' }}>{sections.length + 1}. References</span>
                <span style={{ flex: 1, borderBottom: '1px dotted #888', margin: '0 0.5rem', position: 'relative', top: '-4px' }} />
                <span style={{ color: '#000' }}>Page {bodyStartPage}</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          3. MAIN CONTENT SHEET (BODY SECTIONS + REFERENCES)
      ───────────────────────────────────────────────────────────── */}
      <div
        className="paper-sheet animate-fade-in"
        style={{
          fontFamily: currentFontFamily,
          padding: currentMargin,
          fontSize: formatting.fontSize,
          lineHeight: formatting.lineSpacing,
          textAlign: formatting.alignment === 'Justified' ? 'justify' : 'left',
          boxSizing: 'border-box',
          position: 'relative'
        }}
      >
        {/* Header Page Number (Top right) */}
        {formatting.pageNumbering === 'Top right' && (
          <div style={{ textAlign: 'right', fontSize: '0.8125rem', color: '#666', marginBottom: '1rem', borderBottom: '1px solid #eee', paddingBottom: '0.5rem' }}>
            Page {bodyStartPage}
          </div>
        )}

        {/* Sections */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {sections.map((sec) => {
            const numLabel = numberMap.get(sec.id) || '';

            return (
              <div key={sec.id} style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {/* H1 Main Topic */}
                {sec.headingLevel === 1 && (
                  <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#000', margin: '1.25rem 0 0.25rem', borderBottom: '1px solid #ddd', paddingBottom: '0.25rem' }}>
                    {numLabel} {sec.title}
                  </h2>
                )}

                {/* H2 Subtopic */}
                {sec.headingLevel === 2 && (
                  <h3 style={{ fontSize: '1.0625rem', fontWeight: 'bold', color: '#000', margin: '0.875rem 0 0.25rem', marginLeft: '0.875rem' }}>
                    {numLabel} {sec.title}
                  </h3>
                )}

                {/* H3 Minor Topic */}
                {sec.headingLevel === 3 && (
                  <h4 style={{ fontSize: '0.9375rem', fontWeight: 'bold', fontStyle: 'italic', color: '#222', margin: '0.625rem 0 0.25rem', marginLeft: '1.75rem' }}>
                    {numLabel} {sec.title}
                  </h4>
                )}

                {/* Section Content Paragraphs */}
                <div style={{ paddingLeft: sec.headingLevel === 1 ? 0 : sec.headingLevel === 2 ? '0.875rem' : '1.75rem' }}>
                  {sec.originalText ? (
                    sec.originalText.split('\n\n').map((paragraph, pIdx) => (
                      <p key={pIdx} style={{ margin: '0 0 0.5rem 0', color: '#000' }}>
                        {paragraph}
                      </p>
                    ))
                  ) : (
                    <p style={{ fontSize: '0.8125rem', fontStyle: 'italic', color: '#888', border: '1px dashed #ccc', padding: '0.5rem', borderRadius: '4px', margin: 0 }}>
                      [Topic content is empty]
                    </p>
                  )}
                </div>
              </div>
            );
          })}

          {/* References Section */}
          {references.length > 0 && (
            <div style={{ marginTop: '2rem', paddingTop: '1.5rem', borderTop: '1px solid #111' }}>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#000', marginBottom: '1rem' }}>
                References
              </h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {references.map((ref) => (
                  <p
                    key={ref.id}
                    style={{
                      margin: 0,
                      color: '#000',
                      paddingLeft: '2rem',
                      textIndent: '-2rem',
                      lineHeight: 1.5
                    }}
                  >
                    {formatReferenceItem(ref, referencingStyle)}
                  </p>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer Page Numbering (Bottom center / Bottom right) */}
        {(formatting.pageNumbering === 'Bottom center' || formatting.pageNumbering === 'Bottom right') && (
          <div
            style={{
              marginTop: '3rem',
              paddingTop: '0.75rem',
              borderTop: '1px solid #eee',
              fontSize: '0.8125rem',
              color: '#666',
              textAlign: formatting.pageNumbering === 'Bottom center' ? 'center' : 'right'
            }}
          >
            Page {bodyStartPage}
          </div>
        )}
      </div>
    </div>
  );
};
