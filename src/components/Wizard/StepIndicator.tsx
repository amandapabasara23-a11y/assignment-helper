import React, { useEffect, useRef } from 'react';
import { Check } from 'lucide-react';

interface StepIndicatorProps {
  currentStep: number;
  setCurrentStep: (step: number) => void;
  maxStepUnlocked: number;
}

const STEPS = [
  { id: 1,  label: 'Details' },
  { id: 2,  label: 'Content' },
  { id: 3,  label: 'Structure' },
  { id: 4,  label: 'References' },
  { id: 5,  label: 'Citation' },
  { id: 6,  label: 'Formatting' },
  { id: 7,  label: 'Preview' },
  { id: 8,  label: 'AI Check' },
  { id: 9,  label: 'Humanize AI' },
  { id: 10, label: 'Integrity' },
  { id: 11, label: 'Export' },
];

export const StepIndicator: React.FC<StepIndicatorProps> = ({
  currentStep,
  setCurrentStep,
  maxStepUnlocked,
}) => {
  const activeStepRef = useRef<HTMLButtonElement | null>(null);

  useEffect(() => {
    if (activeStepRef.current) {
      activeStepRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest',
        inline: 'center'
      });
    }
  }, [currentStep]);

  return (
    <div
      style={{
        maxWidth: 1240,
        margin: '0.75rem auto 0.25rem',
        padding: '0 1rem',
        width: '100%',
      }}
    >
      <div
        className="card"
        style={{
          borderRadius: '16px',
          padding: '0.35rem 0.5rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.2rem',
          width: '100%',
          minHeight: '48px',
          overflowX: 'auto',
          scrollbarWidth: 'none',
          msOverflowStyle: 'none',
          WebkitOverflowScrolling: 'touch',
        }}
      >
        {STEPS.map((step, idx) => {
          const isCompleted  = step.id < currentStep;
          const isCurrent    = step.id === currentStep;
          const isAccessible = step.id <= maxStepUnlocked;

          return (
            <React.Fragment key={step.id}>
              {/* Step Button */}
              <button
                ref={isCurrent ? activeStepRef : null}
                onClick={() => isAccessible && setCurrentStep(step.id)}
                disabled={!isAccessible}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.3rem',
                  padding: '0.3rem 0.55rem',
                  background: isCurrent
                    ? 'var(--accent-indigo-soft)'
                    : 'transparent',
                  border: `1px solid ${isCurrent ? 'rgba(79, 70, 229, 0.35)' : 'transparent'}`,
                  borderRadius: '10px',
                  cursor: isAccessible ? 'pointer' : 'not-allowed',
                  opacity: isAccessible ? 1 : 0.35,
                  transition: 'all 0.18s ease',
                  flexShrink: 0,
                  outline: 'none',
                }}
              >
                {/* Circle Icon */}
                <span
                  style={{
                    width: 18,
                    height: 18,
                    borderRadius: '50%',
                    fontSize: '0.68rem',
                    fontWeight: 700,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: isCompleted
                      ? 'var(--accent-emerald)'
                      : isCurrent
                      ? 'var(--accent-indigo)'
                      : 'var(--surface-inset)',
                    color: isCompleted || isCurrent ? '#fff' : 'var(--text-3)',
                    border: isCompleted || isCurrent ? 'none' : '1px solid var(--border)',
                    flexShrink: 0,
                  }}
                >
                  {isCompleted ? <Check size={11} strokeWidth={3} /> : step.id}
                </span>

                {/* Label */}
                <span
                  style={{
                    fontSize: '0.74rem',
                    fontWeight: isCurrent ? 700 : 500,
                    color: isCurrent
                      ? 'var(--accent-indigo)'
                      : isCompleted
                      ? 'var(--text-1)'
                      : 'var(--text-3)',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {step.label}
                </span>
              </button>

              {/* Connector line */}
              {idx < STEPS.length - 1 && (
                <div
                  style={{
                    width: 8,
                    height: 2,
                    borderRadius: 99,
                    background: step.id < currentStep
                      ? 'var(--accent-emerald)'
                      : 'var(--border)',
                    flexShrink: 0,
                    margin: '0 0.05rem',
                    transition: 'background 0.2s ease',
                  }}
                />
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
};
