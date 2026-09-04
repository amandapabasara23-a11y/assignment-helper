import React, { useState } from 'react';
import type { Assignment } from '../../types';
import { generateDocxBlob, downloadBlob } from '../../utils/docxExport';
import { exportPaperToPdf } from '../../utils/pdfExport';
import { LivePreviewPaper } from '../LivePreviewPaper';
import { Download, FileText, CheckCircle2, RefreshCw, Eye, History, ArrowLeft, Printer } from 'lucide-react';
import confetti from 'canvas-confetti';

interface Step10ExportProps {
  assignment: Assignment;
  onPrev: () => void;
  onJumpToStep: (step: number) => void;
  onOpenHistory: () => void;
}

const CHECKLIST = [
  'Assignment title added',
  'Student details completed',
  'Content written',
  'Structure reviewed',
  'References verified',
  'Citation style selected',
  'Document formatted',
  'Live preview reviewed',
  'AI analysis completed',
  'AI text humanized (< 2% target)',
  'Content integrity verified',
];

export const Step10Export: React.FC<Step10ExportProps> = ({ assignment, onPrev, onJumpToStep, onOpenHistory }) => {
  const [exportingDocx, setExportingDocx] = useState(false);
  const [exportingPdf, setExportingPdf] = useState(false);

  const handleDocx = async () => {
    try {
      setExportingDocx(true);
      const blob = await generateDocxBlob(assignment);
      downloadBlob(blob, `${assignment.title.replace(/[^a-z0-9]/gi, '_') || 'Assignment'}.docx`);
      confetti({ particleCount: 100, spread: 70, origin: { y: 0.7 } });
    } catch (err) {
      console.error(err);
      alert('Failed to generate DOCX. Please try again.');
    } finally {
      setExportingDocx(false);
    }
  };

  const handlePdf = async () => {
    try {
      setExportingPdf(true);
      const filename = `${assignment.title.replace(/[^a-z0-9]/gi, '_') || 'Assignment'}.pdf`;
      await exportPaperToPdf(assignment, filename);
      confetti({ particleCount: 100, spread: 70, origin: { y: 0.7 } });
    } catch (err) {
      console.error(err);
      alert('Failed to generate PDF. Please try again.');
    } finally {
      setExportingPdf(false);
    }
  };

  return (
    <div className="animate-fade-in" style={{ maxWidth: 820, margin: '0 auto', padding: '2rem 0', position: 'relative' }}>
      {/* Hidden offscreen container for PDF generation */}
      <div
        aria-hidden="true"
        style={{
          position: 'absolute',
          left: '-9999px',
          top: 0,
          width: '210mm',
          opacity: 1,
          pointerEvents: 'none'
        }}
      >
        <LivePreviewPaper assignment={assignment} id="assignment-paper-preview" />
      </div>

      {/* Success header */}
      <div style={{ textAlign: 'center', marginBottom: '2.5rem', padding: '1rem 0' }}>
        <div style={{ width: 56, height: 56, borderRadius: '50%', background: 'var(--accent-emerald-soft)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.25rem' }}>
          <CheckCircle2 size={28} color="var(--accent-emerald)" strokeWidth={2} />
        </div>
        <h1 className="serif" style={{ fontSize: '2.5rem', fontWeight: 600, color: 'var(--text-1)', letterSpacing: '-0.02em', lineHeight: 1.1, marginBottom: '0.75rem' }}>
          Your assignment is ready
        </h1>
        <p className="body-md">
          Formatted in {assignment.formatting.fontFamily} {assignment.formatting.fontSize} · {assignment.referencingStyle} citations · {assignment.sections.length} sections
        </p>
      </div>

      {/* Download cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.25rem', marginBottom: '1.75rem' }}>
        {/* DOCX */}
        <div
          className="card"
          style={{ padding: '2rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.15rem', textAlign: 'center', borderTop: '3px solid var(--accent-indigo)' }}
        >
          <div style={{ width: 44, height: 44, borderRadius: 'var(--r-md)', background: 'var(--accent-indigo-soft)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <FileText size={22} color="var(--accent-indigo)" />
          </div>
          <div>
            <h3 style={{ fontWeight: 800, fontSize: '1.05rem', color: 'var(--text-1)', marginBottom: 4 }}>Microsoft Word</h3>
            <p className="body-sm">Native .docx with editable styles, cover page, TOC & citations.</p>
          </div>
          <button
            className="btn btn-primary btn-lg"
            style={{ width: '100%' }}
            onClick={handleDocx}
            disabled={exportingDocx}
          >
            <Download size={16} />
            {exportingDocx ? 'Generating…' : 'Download DOCX'}
          </button>
        </div>

        {/* PDF */}
        <div
          className="card"
          style={{ padding: '2rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.15rem', textAlign: 'center', borderTop: '3px solid var(--accent-emerald)' }}
        >
          <div style={{ width: 44, height: 44, borderRadius: 'var(--r-md)', background: 'var(--accent-emerald-soft)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Printer size={22} color="var(--accent-emerald)" />
          </div>
          <div>
            <h3 style={{ fontWeight: 800, fontSize: '1.05rem', color: 'var(--text-1)', marginBottom: 4 }}>PDF Document</h3>
            <p className="body-sm">Submission-ready publication layout PDF for direct printing.</p>
          </div>
          <button
            className="btn btn-secondary btn-lg"
            style={{ width: '100%' }}
            onClick={handlePdf}
            disabled={exportingPdf}
          >
            <Download size={16} />
            {exportingPdf ? 'Generating…' : 'Download PDF'}
          </button>
        </div>
      </div>

      {/* Secondary actions */}
      <div style={{ display: 'flex', justifyContent: 'center', gap: '0.75rem', flexWrap: 'wrap', marginBottom: '1.75rem' }}>
        <button className="btn btn-ghost btn-sm" onClick={() => onJumpToStep(7)}>
          <Eye size={14} /> Preview document
        </button>
        <button className="btn btn-ghost btn-sm" onClick={() => onJumpToStep(8)}>
          <RefreshCw size={14} /> Run checks again
        </button>
        <button className="btn btn-ghost btn-sm" onClick={onOpenHistory}>
          <History size={14} /> Version history
        </button>
      </div>

      {/* Checklist */}
      <div className="card" style={{ padding: '1.75rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.55rem', marginBottom: '1.15rem', paddingBottom: '0.75rem', borderBottom: '1px solid var(--border)' }}>
          <CheckCircle2 size={17} color="var(--accent-emerald)" />
          <span style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--text-1)' }}>11-point submission checklist</span>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '0.6rem' }}>
          {CHECKLIST.map((item) => (
            <div
              key={item}
              style={{ display: 'flex', alignItems: 'center', gap: '0.55rem', padding: '0.55rem 0.75rem', background: 'var(--accent-emerald-soft)', borderRadius: 'var(--r-sm)', fontSize: '0.83rem', color: 'var(--text-1)', fontWeight: 500 }}
            >
              <span style={{ color: 'var(--accent-emerald)', fontWeight: 800, fontSize: '0.85rem', flexShrink: 0 }}>✓</span>
              {item}
            </div>
          ))}
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-start', paddingTop: '1.5rem', borderTop: '1px solid var(--border)', marginTop: '1.75rem' }}>
        <button className="btn btn-secondary" onClick={onPrev}><ArrowLeft size={15} /> Back</button>
      </div>
    </div>
  );
};
