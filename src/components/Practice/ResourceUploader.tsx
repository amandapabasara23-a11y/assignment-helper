import React, { useState, useRef } from 'react';
import { UploadCloud, FileText, CheckCircle2, AlertCircle, Loader2, Trash2, Layers, BookOpen } from 'lucide-react';
import type { ParsedResource } from '../../types/practice';
import { extractResourceFile } from '../../utils/pdfExtractor';

interface ResourceUploaderProps {
  resources: ParsedResource[];
  setResources: React.Dispatch<React.SetStateAction<ParsedResource[]>>;
  onContinue: () => void;
}

export const ResourceUploader: React.FC<ResourceUploaderProps> = ({
  resources,
  setResources,
  onContinue
}) => {
  const [isExtracting, setIsExtracting] = useState<boolean>(false);
  const [extractProgress, setExtractProgress] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    await processFiles(Array.from(files));
  };

  const handleDrop = async (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      await processFiles(Array.from(e.dataTransfer.files));
    }
  };

  const processFiles = async (fileList: File[]) => {
    setIsExtracting(true);
    setErrorMessage(null);

    const validFiles = fileList.filter(
      f => f.name.endsWith('.pdf') || f.name.endsWith('.txt') || f.name.endsWith('.md')
    );

    if (validFiles.length === 0) {
      setErrorMessage('Please select text-based PDF or TXT documents.');
      setIsExtracting(false);
      return;
    }

    const newlyParsed: ParsedResource[] = [];

    for (let i = 0; i < validFiles.length; i++) {
      const file = validFiles[i];
      setExtractProgress(`Extracting text from browser: ${file.name} (${i + 1}/${validFiles.length})`);
      try {
        const parsed = await extractResourceFile(file);
        newlyParsed.push(parsed);
      } catch (err: any) {
        console.error(err);
        setErrorMessage(err.message || `Could not read ${file.name}`);
      }
    }

    if (newlyParsed.length > 0) {
      setResources(prev => {
        // Prevent duplicate uploads of same filename
        const existingNames = prev.map(r => r.name);
        const filtered = newlyParsed.filter(r => !existingNames.includes(r.name));
        return [...prev, ...filtered];
      });
    }

    setIsExtracting(false);
    setExtractProgress('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleRemoveResource = (id: string) => {
    setResources(prev => prev.filter(r => r.id !== id));
  };

  const totalPagesSum = resources.reduce((sum, r) => sum + r.totalPages, 0);

  return (
    <div style={{ maxWidth: '820px', margin: '0 auto' }} className="animate-fade-in">
      {/* Header Banner */}
      <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
        <span className="badge badge-indigo" style={{ marginBottom: '0.75rem', padding: '0.4rem 1rem' }}>
          RESOURCE-FIRST PRACTICE WORKFLOW
        </span>
        <h2 className="display-2" style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>
          Upload Lecture & Course Material
        </h2>
        <p className="body-md" style={{ color: 'var(--text-3)', maxWidth: '600px', margin: '0 auto' }}>
          Upload your lecture PDFs, handout slides, or textbook chapters. All text extraction happens directly inside your browser using <code style={{ color: 'var(--accent-indigo)', fontWeight: 600 }}>pdfjs-dist</code>.
        </p>
      </div>

      {/* Upload Box */}
      <div
        onDragOver={e => { e.preventDefault(); e.stopPropagation(); }}
        onDrop={handleDrop}
        className="card-inset"
        style={{
          border: '2px dashed var(--border-strong)',
          borderRadius: 'var(--r-lg)',
          padding: '2.5rem 1.5rem',
          textAlign: 'center',
          background: 'var(--surface)',
          cursor: isExtracting ? 'wait' : 'pointer',
          transition: 'all 0.2s ease',
          marginBottom: '2rem'
        }}
        onClick={() => !isExtracting && fileInputRef.current?.click()}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf,.txt,.md"
          multiple
          onChange={handleFileChange}
          style={{ display: 'none' }}
        />

        {isExtracting ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem', padding: '1rem 0' }}>
            <Loader2 className="animate-spin" size={42} color="var(--accent-indigo)" />
            <div>
              <p className="body-md" style={{ fontWeight: 700, color: 'var(--text-1)' }}>
                Processing PDF text in browser...
              </p>
              <p className="body-sm" style={{ color: 'var(--accent-indigo)' }}>
                {extractProgress}
              </p>
            </div>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.85rem' }}>
            <div
              style={{
                width: 60,
                height: 60,
                borderRadius: '50%',
                background: 'var(--accent-indigo-soft)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--accent-indigo)'
              }}
            >
              <UploadCloud size={30} />
            </div>

            <div>
              <p className="body-lg" style={{ fontWeight: 700, margin: 0 }}>
                Click to browse or drop lecture PDFs here
              </p>
              <p className="body-sm" style={{ color: 'var(--text-3)', marginTop: 4 }}>
                Supports multiple PDF files, course handouts, lecture slides & notes
              </p>
            </div>

            <button type="button" className="btn btn-secondary btn-sm" style={{ marginTop: '0.25rem' }}>
              Select Resource PDF Files
            </button>
          </div>
        )}
      </div>

      {errorMessage && (
        <div
          className="card"
          style={{
            padding: '1rem 1.25rem',
            background: 'var(--accent-rose-soft)',
            borderColor: 'var(--accent-rose)',
            color: 'var(--accent-rose)',
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            marginBottom: '1.5rem'
          }}
        >
          <AlertCircle size={20} />
          <span className="body-sm" style={{ fontWeight: 600 }}>{errorMessage}</span>
        </div>
      )}

      {/* Uploaded Resources List */}
      {resources.length > 0 && (
        <div style={{ marginBottom: '2rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Layers size={18} color="var(--accent-indigo)" />
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>
                Uploaded Resource Files ({resources.length})
              </h3>
            </div>
            <span className="badge badge-indigo">
              {totalPagesSum} Total Pages Extracted
            </span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {resources.map(res => (
              <div
                key={res.id}
                className="card"
                style={{
                  padding: '1rem 1.25rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  background: 'var(--surface)'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                  <div className="btn-icon" style={{ cursor: 'default' }}>
                    <FileText size={20} color="var(--accent-indigo)" />
                  </div>
                  <div>
                    <h4 style={{ fontSize: '0.95rem', fontWeight: 700, margin: 0 }}>{res.name}</h4>
                    <p className="body-sm" style={{ color: 'var(--text-3)', margin: 0, fontSize: '0.8rem' }}>
                      {res.totalPages} Pages • {res.sections.length} Identifiable Sections • Browser Extracted ✓
                    </p>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span className="badge badge-emerald" style={{ fontSize: '0.72rem' }}>
                    <CheckCircle2 size={12} />
                    Ready
                  </span>
                  <button
                    onClick={() => handleRemoveResource(res.id)}
                    className="btn-icon"
                    title="Remove resource"
                    style={{ color: 'var(--accent-rose)' }}
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Action Footer */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '2rem' }}>
            <button
              onClick={onContinue}
              className="btn btn-primary btn-lg"
              style={{ padding: '0.85rem 2rem' }}
            >
              <BookOpen size={18} />
              <span>Proceed to Practice Selection</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
