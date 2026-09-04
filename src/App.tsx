import { useState, useEffect } from 'react';
import type { Assignment, AssignmentVersion, UniversityTemplate } from './types';
import {
  loadAssignmentsFromStorage,
  saveAssignmentsToStorage,
  SAMPLE_ASSIGNMENT
} from './utils/storage';
import { Header, type ViewType } from './components/Header';
import { LandingPage } from './components/LandingPage';
import { Dashboard } from './components/Dashboard';
import { ReferencesView } from './components/ReferencesView';
import { AICheckerView } from './components/AICheckerView';
import { PracticeMain } from './components/Practice/PracticeMain';
import { StepIndicator } from './components/Wizard/StepIndicator';
import { Step1Details } from './components/Wizard/Step1Details';
import { Step2Content } from './components/Wizard/Step2Content';
import { Step3Structure } from './components/Wizard/Step3Structure';
import { Step4References } from './components/Wizard/Step4References';
import { Step5CitationStyle } from './components/Wizard/Step5CitationStyle';
import { Step6Formatting } from './components/Wizard/Step6Formatting';
import { Step7Preview } from './components/Wizard/Step7Preview';
import { Step8AIChecker } from './components/Wizard/Step8AIChecker';
import { Step9HumanizeAI } from './components/Wizard/Step9HumanizeAI';
import { Step9IntegrityCheck } from './components/Wizard/Step9IntegrityCheck';
import { Step10Export } from './components/Wizard/Step10Export';
import { VersionHistoryModal } from './components/VersionHistoryModal';

export function App() {
  const [isDarkMode, setIsDarkMode] = useState<boolean>(false);
  const [currentView, setCurrentView] = useState<ViewType>('landing');
  const [wizardStep, setWizardStep] = useState<number>(1);
  const [maxStepUnlocked, setMaxStepUnlocked] = useState<number>(1);

  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [activeAssignmentId, setActiveAssignmentId] = useState<string | null>(null);
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState<boolean>(false);

  // Initialize state from LocalStorage
  useEffect(() => {
    const loaded = loadAssignmentsFromStorage();
    setAssignments(loaded);
    if (loaded.length > 0) {
      setActiveAssignmentId(loaded[0].id);
    }
  }, []);

  // Sync state to LocalStorage
  useEffect(() => {
    if (assignments.length > 0) {
      saveAssignmentsToStorage(assignments);
    }
  }, [assignments]);

  // Dark mode effect
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  const activeAssignment = assignments.find(a => a.id === activeAssignmentId) || SAMPLE_ASSIGNMENT;

  const updateActiveAssignment = (updates: Partial<Assignment>) => {
    if (!activeAssignmentId) return;

    setAssignments(prev => prev.map(a => {
      if (a.id === activeAssignmentId) {
        const updated = { ...a, ...updates, updatedAt: new Date().toISOString() };
        return updated;
      }
      return a;
    }));
  };

  const handleCreateNewAssignment = (template?: UniversityTemplate) => {
    const newId = `asgn-${Date.now()}`;
    const newAsgn: Assignment = {
      id: newId,
      title: template ? `New ${template.name}` : 'Untitled Assignment',
      topic: '',
      institution: template ? template.institution : '',
      faculty: '',
      courseName: '',
      courseCode: '',
      studentName: '',
      studentId: '',
      instructorName: '',
      submissionDate: new Date(Date.now() + 14 * 86400000).toISOString().split('T')[0],
      targetWordCount: 2000,
      assignmentType: 'Research Assignment',
      referencingStyle: template ? template.defaultReferencingStyle : 'APA 7th Edition',
      citationStylePreference: 'Author-date',
      formatting: template ? { ...template.formatting } : {
        fontFamily: 'Times New Roman',
        fontSize: '12pt',
        lineSpacing: '1.5',
        alignment: 'Left',
        margin: 'Normal (2.54 cm)',
        pageSize: 'A4',
        pageNumbering: 'Bottom right',
        includeCoverPage: true,
        includeTableOfContents: true
      },
      contentPreservation: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      sections: [
        { id: `sec-1`, title: 'Introduction', headingLevel: 1, originalText: '' },
        { id: `sec-2`, title: 'Main Discussion', headingLevel: 1, originalText: '' },
        { id: `sec-3`, title: 'Conclusion', headingLevel: 1, originalText: '' }
      ],
      references: [],
      versions: [],
      auditLogs: [
        { id: `log-init`, timestamp: new Date().toISOString(), action: 'Created Assignment', details: 'Initialized new blank assignment.' }
      ]
    };

    setAssignments(prev => [newAsgn, ...prev]);
    setActiveAssignmentId(newId);
    setWizardStep(1);
    setMaxStepUnlocked(1);
    setCurrentView('wizard');
  };

  const handleOpenSample = () => {
    const sample = assignments.find(a => a.id === SAMPLE_ASSIGNMENT.id);
    if (sample) {
      setActiveAssignmentId(sample.id);
    } else {
      setAssignments(prev => [SAMPLE_ASSIGNMENT, ...prev]);
      setActiveAssignmentId(SAMPLE_ASSIGNMENT.id);
    }
    setWizardStep(1);
    setMaxStepUnlocked(11);
    setCurrentView('wizard');
  };

  const handleDuplicateAssignment = (id: string) => {
    const target = assignments.find(a => a.id === id);
    if (!target) return;
    const duplicated: Assignment = {
      ...target,
      id: `asgn-dup-${Date.now()}`,
      title: `${target.title} (Copy)`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    setAssignments(prev => [duplicated, ...prev]);
  };

  const handleDeleteAssignment = (id: string) => {
    if (assignments.length <= 1) {
      alert('You must keep at least one assignment.');
      return;
    }
    const updated = assignments.filter(a => a.id !== id);
    setAssignments(updated);
    if (activeAssignmentId === id) {
      setActiveAssignmentId(updated[0].id);
    }
  };

  const goToNextStep = () => {
    const nextStep = Math.min(11, wizardStep + 1);
    setWizardStep(nextStep);
    setMaxStepUnlocked(prev => Math.max(prev, nextStep));

    // Save snapshot on step transition
    const newVer: AssignmentVersion = {
      id: `ver-${Date.now()}`,
      versionNumber: (activeAssignment.versions.length || 0) + 1,
      timestamp: new Date().toISOString(),
      note: `Progress saved at Step ${wizardStep}`,
      sections: [...activeAssignment.sections],
      references: [...activeAssignment.references],
      formatting: { ...activeAssignment.formatting }
    };
    updateActiveAssignment({
      versions: [newVer, ...(activeAssignment.versions || [])]
    });
  };

  const goToPrevStep = () => {
    setWizardStep(prev => Math.max(1, prev - 1));
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: 'var(--bg)', color: 'var(--text-1)' }}>
      <Header
        currentView={currentView}
        setCurrentView={setCurrentView}
        activeAssignment={activeAssignment}
        onNewAssignment={() => handleCreateNewAssignment()}
        isDarkMode={isDarkMode}
        setIsDarkMode={setIsDarkMode}
      />

      <main style={{ flex: 1, paddingBottom: '4rem' }}>
        {currentView === 'landing' && (
          <LandingPage
            onStartNew={() => handleCreateNewAssignment()}
            onOpenSample={handleOpenSample}
            onOpenPractice={() => setCurrentView('practice')}
            onSelectStep={(stepId) => {
              handleOpenSample();
              setWizardStep(stepId);
            }}
          />
        )}

        {currentView === 'dashboard' && (
          <Dashboard
            assignments={assignments}
            onOpenAssignment={(id) => {
              setActiveAssignmentId(id);
              setWizardStep(1);
              setMaxStepUnlocked(11);
              setCurrentView('wizard');
            }}
            onNewAssignment={() => handleCreateNewAssignment()}
            onDuplicateAssignment={handleDuplicateAssignment}
            onDeleteAssignment={handleDeleteAssignment}
            onApplyTemplate={(tmpl) => handleCreateNewAssignment(tmpl)}
          />
        )}

        {currentView === 'references' && (
          <ReferencesView onBackToDashboard={() => setCurrentView('dashboard')} />
        )}

        {currentView === 'aicheck' && (
          <AICheckerView onBackToDashboard={() => setCurrentView('dashboard')} />
        )}

        {currentView === 'practice' && (
          <PracticeMain onBackToHome={() => setCurrentView('landing')} />
        )}

        {currentView === 'wizard' && (
          <div>
            <StepIndicator
              currentStep={wizardStep}
              setCurrentStep={(s) => setWizardStep(s)}
              maxStepUnlocked={maxStepUnlocked}
            />

            <div style={{ padding: '0 1.5rem' }}>
              {wizardStep === 1 && (
                <Step1Details
                  assignment={activeAssignment}
                  updateAssignment={updateActiveAssignment}
                  onNext={goToNextStep}
                />
              )}

              {wizardStep === 2 && (
                <Step2Content
                  assignment={activeAssignment}
                  updateAssignment={updateActiveAssignment}
                  onNext={goToNextStep}
                  onPrev={goToPrevStep}
                />
              )}

              {wizardStep === 3 && (
                <Step3Structure
                  assignment={activeAssignment}
                  updateAssignment={updateActiveAssignment}
                  onNext={goToNextStep}
                  onPrev={goToPrevStep}
                />
              )}

              {wizardStep === 4 && (
                <Step4References
                  assignment={activeAssignment}
                  updateAssignment={updateActiveAssignment}
                  onNext={goToNextStep}
                  onPrev={goToPrevStep}
                />
              )}

              {wizardStep === 5 && (
                <Step5CitationStyle
                  assignment={activeAssignment}
                  updateAssignment={updateActiveAssignment}
                  onNext={goToNextStep}
                  onPrev={goToPrevStep}
                />
              )}

              {wizardStep === 6 && (
                <Step6Formatting
                  assignment={activeAssignment}
                  updateAssignment={updateActiveAssignment}
                  onNext={goToNextStep}
                  onPrev={goToPrevStep}
                />
              )}

              {wizardStep === 7 && (
                <Step7Preview
                  assignment={activeAssignment}
                  onNext={goToNextStep}
                  onPrev={goToPrevStep}
                />
              )}

              {wizardStep === 8 && (
                <Step8AIChecker
                  assignment={activeAssignment}
                  updateAssignment={updateActiveAssignment}
                  onNext={goToNextStep}
                  onPrev={goToPrevStep}
                />
              )}

              {wizardStep === 9 && (
                <Step9HumanizeAI
                  assignment={activeAssignment}
                  updateAssignment={updateActiveAssignment}
                  onNext={goToNextStep}
                  onPrev={goToPrevStep}
                />
              )}

              {wizardStep === 10 && (
                <Step9IntegrityCheck
                  assignment={activeAssignment}
                  onNext={goToNextStep}
                  onPrev={goToPrevStep}
                />
              )}

              {wizardStep === 11 && (
                <Step10Export
                  assignment={activeAssignment}
                  onPrev={goToPrevStep}
                  onJumpToStep={(s) => setWizardStep(s)}
                  onOpenHistory={() => setIsHistoryModalOpen(true)}
                />
              )}
            </div>
          </div>
        )}
      </main>

      <VersionHistoryModal
        assignment={activeAssignment}
        isOpen={isHistoryModalOpen}
        onClose={() => setIsHistoryModalOpen(false)}
        onRestoreVersion={(ver) => {
          updateActiveAssignment({
            sections: ver.sections,
            references: ver.references,
            formatting: ver.formatting
          });
          setIsHistoryModalOpen(false);
          alert(`Restored Version ${ver.versionNumber}`);
        }}
      />
    </div>
  );
}

export default App;
