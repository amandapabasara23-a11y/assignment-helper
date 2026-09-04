import React, { useState } from 'react';
import { Search, Trash2, CheckCircle2 } from 'lucide-react';
import type { ReferenceSource, ReferencingStyle } from '../types';

interface ReferencesViewProps {
  onBackToDashboard: () => void;
}

const SAMPLE_REFERENCES: ReferenceSource[] = [
  {
    id: 'ref-v-1',
    fileName: 'Silva_2024_Solar_Irrigation.pdf',
    authors: ['Silva, K. M.', 'Fernando, R. N.'],
    year: '2024',
    title: 'Solar Photovoltaic Micro-Irrigation for Smallholder Farmers in Tropical Asia',
    journalOrPublisher: 'Journal of Cleaner Agricultural Production',
    volume: '18',
    issue: '3',
    pages: '145-159',
    doi: '10.1016/j.jclepro.2024.03.112',
    missingFields: [],
    extractionStatus: 'extracted'
  },
  {
    id: 'ref-v-2',
    fileName: 'Perera_2023_Mini_Hydro.pdf',
    authors: ['Perera, A. D.'],
    year: '2023',
    title: 'Decentralized Energy Grids in Sri Lankan Agrarian Communities',
    journalOrPublisher: 'Renewable Energy Progress',
    volume: '42',
    pages: '88-102',
    missingFields: [],
    extractionStatus: 'extracted'
  }
];

export const ReferencesView: React.FC<ReferencesViewProps> = ({ onBackToDashboard }) => {
  const [references, setReferences] = useState<ReferenceSource[]>(SAMPLE_REFERENCES);
  const [style, setStyle] = useState<ReferencingStyle>('APA 7th Edition');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const filtered = references.filter(r =>
    r.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    r.authors.some(a => a.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div style={{ maxWidth: 1080, margin: '0 auto', padding: '2rem 1.5rem', animation: 'fadeIn 0.25s ease-out' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <span className="badge badge-indigo" style={{ marginBottom: '0.4rem' }}>
            ACADEMIC REFERENCE SUITE
          </span>
          <h1 className="display-2" style={{ margin: 0 }}>
            Reference Manager
          </h1>
          <p className="body-lg" style={{ color: 'var(--text-3)', marginTop: '0.25rem' }}>
            Manage, format, and organize academic citations across APA, Harvard, IEEE, and Chicago styles.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <select
            className="select"
            value={style}
            onChange={(e) => setStyle(e.target.value as ReferencingStyle)}
            style={{ width: 190 }}
          >
            <option value="APA 7th Edition">APA 7th Edition</option>
            <option value="Harvard">Harvard</option>
            <option value="IEEE">IEEE</option>
            <option value="Chicago">Chicago</option>
            <option value="MLA 9th Edition">MLA 9th Edition</option>
          </select>

          <button onClick={onBackToDashboard} className="btn btn-secondary">
            <span>Back to Assignments</span>
          </button>
        </div>
      </div>

      {/* SEARCH BAR */}
      <div className="card" style={{ padding: '1.25rem 1.5rem', marginBottom: '1.75rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <Search size={18} color="var(--text-4)" />
        <input
          type="text"
          className="input"
          placeholder="Search references by title, author, or journal..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          style={{ border: 'none', background: 'transparent', boxShadow: 'none', padding: 0 }}
        />
      </div>

      {/* REFERENCES LIST */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {filtered.map((ref) => (
          <div key={ref.id} className="card" style={{ padding: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1rem' }}>
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.35rem' }}>
                <span className="badge badge-emerald">
                  <CheckCircle2 size={12} /> Verified Source
                </span>
                <span className="body-sm" style={{ color: 'var(--text-4)' }}>
                  {ref.fileName}
                </span>
              </div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, margin: '0 0 0.4rem 0', color: 'var(--text-1)' }}>
                {ref.title}
              </h3>
              <p className="body-md" style={{ color: 'var(--text-2)', fontStyle: 'italic', margin: '0 0 0.5rem 0' }}>
                {ref.authors.join(', ')} ({ref.year}). <em>{ref.journalOrPublisher}</em>, {ref.volume}({ref.issue}), {ref.pages}.
              </p>
              {ref.doi && (
                <span className="body-sm" style={{ color: 'var(--accent-indigo)', fontSize: '0.8rem' }}>
                  DOI: {ref.doi}
                </span>
              )}
            </div>

            <button
              onClick={() => setReferences(prev => prev.filter(r => r.id !== ref.id))}
              className="btn-icon"
              title="Delete reference"
              style={{ color: 'var(--accent-rose)' }}
            >
              <Trash2 size={16} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};
