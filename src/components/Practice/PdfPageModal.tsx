import React, { useState } from 'react';
import { X, FileText, ChevronLeft, ChevronRight, BookOpen } from 'lucide-react';
import type { ParsedResource } from '../../types/practice';

interface PdfPageModalProps {
  isOpen: boolean;
  onClose: () => void;
  resource: ParsedResource | null;
  initialPage?: number;
  highlightText?: string;
}

export const PdfPageModal: React.FC<PdfPageModalProps> = ({
  isOpen,
  onClose,
  resource,
  initialPage = 1,
  highlightText
}) => {
  if (!isOpen || !resource) return null;

  const [currentPageNum, setCurrentPageNum] = useState<number>(
    Math.min(Math.max(1, initialPage), resource.totalPages)
  );

  const currentPageObj = resource.pages.find(p => p.pageNumber === currentPageNum) || resource.pages[0];

  const handlePrevPage = () => setCurrentPageNum(prev => Math.max(1, prev - 1));
  const handleNextPage = () => setCurrentPageNum(prev => Math.min(resource.totalPages, prev + 1));

  // Render text with highlight if specified
  const renderPageText = () => {
    if (!currentPageObj || !currentPageObj.text) {
      return <p className="body-sm text-center py-8">No text available for this page.</p>;
    }

    const text = currentPageObj.text;
    if (!highlightText || !highlightText.trim()) {
      return <pre style={{ whiteSpace: 'pre-wrap', fontFamily: 'inherit', fontSize: '0.9rem', lineHeight: '1.75' }}>{text}</pre>;
    }

    const searchStr = highlightText.trim().toLowerCase();
    const index = text.toLowerCase().indexOf(searchStr);

    if (index === -1) {
      return <pre style={{ whiteSpace: 'pre-wrap', fontFamily: 'inherit', fontSize: '0.9rem', lineHeight: '1.75' }}>{text}</pre>;
    }

    const before = text.substring(0, index);
    const match = text.substring(index, index + searchStr.length);
    const after = text.substring(index + searchStr.length);

    return (
      <pre style={{ whiteSpace: 'pre-wrap', fontFamily: 'inherit', fontSize: '0.9rem', lineHeight: '1.75' }}>
        {before}
        <mark style={{ backgroundColor: '#fef08a', color: '#854d0e', padding: '0.15rem 0.35rem', borderRadius: '4px', fontWeight: 600 }}>
          {match}
        </mark>
        {after}
      </pre>
    );
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(15, 23, 42, 0.65)',
        backdropFilter: 'blur(4px)',
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1.5rem'
      }}
    >
      <div
        className="card"
        style={{
          width: '100%',
          maxWidth: '840px',
          maxHeight: '90vh',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: 'var(--shadow-lg)',
          overflow: 'hidden',
          borderRadius: 'var(--r-lg)'
        }}
      >
        {/* Modal Header */}
        <div
          style={{
            padding: '1rem 1.25rem',
            borderBottom: '1px solid var(--border)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: 'var(--surface-hover)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <div className="btn-icon" style={{ cursor: 'default' }}>
              <FileText size={18} color="var(--accent-indigo)" />
            </div>
            <div>
              <h3 style={{ fontSize: '1rem', fontWeight: 700, margin: 0 }}>{resource.name}</h3>
              <p className="body-sm" style={{ fontSize: '0.78rem', margin: 0 }}>
                Resource Viewer • Page {currentPageNum} of {resource.totalPages}
              </p>
            </div>
          </div>

          <button onClick={onClose} className="btn-icon" title="Close Viewer">
            <X size={18} />
          </button>
        </div>

        {/* Modal Toolbar */}
        <div
          style={{
            padding: '0.6rem 1.25rem',
            borderBottom: '1px solid var(--border)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: 'var(--surface)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <button onClick={handlePrevPage} disabled={currentPageNum <= 1} className="btn btn-xs btn-secondary">
              <ChevronLeft size={14} />
              <span>Previous</span>
            </button>
            <span className="body-sm" style={{ fontWeight: 600, padding: '0 0.5rem' }}>
              Page {currentPageNum} / {resource.totalPages}
            </span>
            <button onClick={handleNextPage} disabled={currentPageNum >= resource.totalPages} className="btn btn-xs btn-secondary">
              <span>Next</span>
              <ChevronRight size={14} />
            </button>
          </div>

          {currentPageObj?.sectionHeading && (
            <span className="badge badge-indigo" style={{ fontSize: '0.75rem' }}>
              <BookOpen size={12} />
              <span>{currentPageObj.sectionHeading}</span>
            </span>
          )}
        </div>

        {/* Modal Content / Page Viewer */}
        <div
          style={{
            flex: 1,
            overflowY: 'auto',
            padding: '1.75rem 2rem',
            background: 'var(--surface-inset)'
          }}
        >
          <div
            className="card"
            style={{
              padding: '2rem',
              background: 'var(--surface)',
              minHeight: '400px',
              border: '1px solid var(--border)'
            }}
          >
            {renderPageText()}
          </div>
        </div>

        {/* Modal Footer */}
        <div
          style={{
            padding: '0.75rem 1.25rem',
            borderTop: '1px solid var(--border)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: 'var(--surface)'
          }}
        >
          <p className="body-sm" style={{ fontSize: '0.78rem' }}>
            Source grounded resource text viewer
          </p>
          <button onClick={onClose} className="btn btn-sm btn-secondary">
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
