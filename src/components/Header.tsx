import React from 'react';
import { ShieldCheck, LayoutGrid, PlusCircle, Moon, Sun, Home, FileCheck, FileText, Target } from 'lucide-react';
import type { Assignment } from '../types';
import logoImg from '../assets/logoA_cropped.png';

export type ViewType = 'landing' | 'dashboard' | 'wizard' | 'references' | 'aicheck' | 'practice';

interface HeaderProps {
  currentView: ViewType;
  setCurrentView: (view: ViewType) => void;
  activeAssignment: Assignment | null;
  onNewAssignment: () => void;
  isDarkMode: boolean;
  setIsDarkMode: (val: boolean) => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentView,
  setCurrentView,
  activeAssignment,
  onNewAssignment,
  isDarkMode,
  setIsDarkMode,
}) => {
  return (
    <header className="dynamic-dock-container">
      <div
        className="dynamic-dock"
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '0.75rem',
          flexWrap: 'nowrap',
          padding: '0.5rem 1rem'
        }}
      >
        {/* Brand Logo & Active Assignment & Lock */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flexShrink: 0, minWidth: 0 }}>
          <button
            onClick={() => setCurrentView('landing')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.6rem',
              cursor: 'pointer',
              background: 'none',
              border: 'none',
              padding: '0.2rem 0.35rem',
              borderRadius: 'var(--r-md)',
              transition: 'all 0.2s ease',
              flexShrink: 0
            }}
            className="btn-ghost"
          >
            <img
              src={logoImg}
              alt="Assignly Logo"
              style={{
                height: 36,
                maxHeight: 38,
                width: 'auto',
                objectFit: 'contain',
                display: 'block',
              }}
            />
          </button>

          {currentView === 'wizard' && activeAssignment && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', flexShrink: 1, minWidth: 0 }}>
              <span style={{ color: 'var(--text-4)', fontSize: '0.85rem' }}>/</span>
              <span
                className="badge badge-neutral"
                style={{
                  fontSize: '0.73rem',
                  maxWidth: 130,
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                  fontWeight: 600
                }}
                title={activeAssignment.title || 'Untitled'}
              >
                {activeAssignment.title || 'Untitled'}
              </span>
            </div>
          )}

          {/* Content Lock Badge */}
          <div
            className="badge badge-emerald"
            style={{
              padding: '0.3rem 0.65rem',
              fontSize: '0.68rem',
              fontWeight: 700,
              letterSpacing: '0.02em',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.35rem',
              flexShrink: 0,
              whiteSpace: 'nowrap'
            }}
          >
            <ShieldCheck size={13} strokeWidth={2.5} />
            <span>CONTENT LOCK ACTIVE</span>
          </div>
        </div>

        {/* Navigation Actions */}
        <nav
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.25rem',
            overflowX: 'auto',
            scrollbarWidth: 'none',
            msOverflowStyle: 'none',
            flexShrink: 1
          }}
        >
          <button
            onClick={() => setCurrentView('landing')}
            className={`btn btn-sm ${currentView === 'landing' ? 'btn-primary' : 'btn-ghost'}`}
            style={{ padding: '0.4rem 0.7rem', fontSize: '0.81rem' }}
          >
            <Home size={14} />
            <span>Home</span>
          </button>

          <button
            onClick={() => setCurrentView('dashboard')}
            className={`btn btn-sm ${currentView === 'dashboard' ? 'btn-primary' : 'btn-ghost'}`}
            style={{ padding: '0.4rem 0.7rem', fontSize: '0.81rem' }}
          >
            <LayoutGrid size={14} />
            <span>Assignments</span>
          </button>

          <button
            onClick={() => setCurrentView('practice')}
            className={`btn btn-sm ${currentView === 'practice' ? 'btn-primary' : 'btn-ghost'}`}
            style={{ padding: '0.4rem 0.7rem', fontSize: '0.81rem' }}
          >
            <Target size={14} />
            <span>Practice</span>
          </button>

          <button
            onClick={() => setCurrentView('references')}
            className={`btn btn-sm ${currentView === 'references' ? 'btn-primary' : 'btn-ghost'}`}
            style={{ padding: '0.4rem 0.7rem', fontSize: '0.81rem' }}
          >
            <FileText size={14} />
            <span>References</span>
          </button>

          <button
            onClick={() => setCurrentView('aicheck')}
            className={`btn btn-sm ${currentView === 'aicheck' ? 'btn-primary' : 'btn-ghost'}`}
            style={{ padding: '0.4rem 0.7rem', fontSize: '0.81rem' }}
          >
            <FileCheck size={14} />
            <span>AI Check</span>
          </button>

          <button
            onClick={onNewAssignment}
            className="btn btn-sm btn-primary"
            style={{ marginLeft: '0.2rem', padding: '0.4rem 0.8rem', fontSize: '0.81rem' }}
          >
            <PlusCircle size={14} />
            <span>New</span>
          </button>

          <button
            onClick={() => setIsDarkMode(!isDarkMode)}
            className="btn-icon"
            title="Toggle theme"
            style={{ marginLeft: 2, width: 32, height: 32, padding: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}
          >
            {isDarkMode ? <Sun size={15} color="var(--accent-amber)" /> : <Moon size={15} />}
          </button>
        </nav>
      </div>
    </header>
  );
};

