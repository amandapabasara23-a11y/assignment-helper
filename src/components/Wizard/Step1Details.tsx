import React from 'react';
import type { Assignment, AssignmentType } from '../../types';
import { ArrowRight } from 'lucide-react';

interface Step1DetailsProps {
  assignment: Assignment;
  updateAssignment: (updates: Partial<Assignment>) => void;
  onNext: () => void;
}

const ASSIGNMENT_TYPES: AssignmentType[] = [
  'Essay', 'Report', 'Research Assignment', 'Literature Review',
  'Case Study', 'Lab Report', 'Reflective Assignment',
  'Presentation Document', 'Coursework', 'Other',
];

const Field: React.FC<{
  label: string;
  required?: boolean;
  children: React.ReactNode;
  span?: boolean;
}> = ({ label, required, children, span }) => (
  <div style={{ gridColumn: span ? '1/-1' : undefined, display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
    <label className="label">
      {label}{required && <span style={{ color: 'var(--red)', marginLeft: 2 }}>*</span>}
    </label>
    {children}
  </div>
);

export const Step1Details: React.FC<Step1DetailsProps> = ({ assignment, updateAssignment, onNext }) => {
  const set = (field: keyof Assignment, value: any) => updateAssignment({ [field]: value });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onNext();
  };

  return (
    <form onSubmit={handleSubmit} className="animate-fade-up" style={{ maxWidth: 860, margin: '0 auto', padding: '2rem 0' }}>
      {/* Header */}
      <div style={{ marginBottom: '1.5rem' }}>
        <span className="overline" style={{ color: 'var(--indigo)', display: 'block', marginBottom: '0.5rem' }}>
          Step 1 of 10
        </span>
        <h2 style={{ fontFamily: 'Newsreader, serif', fontSize: '1.875rem', fontWeight: 500, color: 'var(--text-1)', letterSpacing: '-0.015em', marginBottom: '0.375rem' }}>
          Tell us about your assignment
        </h2>
        <p className="body-sm">
          These details appear on your cover page and help structure the document correctly.
        </p>
      </div>

      <div className="card" style={{ padding: '1.75rem 2rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>

          <Field label="Assignment title" required span>
            <input
              type="text"
              required
              className="input"
              placeholder="e.g. Impact of Renewable Energy Technologies on Rural Agriculture"
              value={assignment.title}
              onChange={(e) => set('title', e.target.value)}
            />
          </Field>

          <Field label="Assignment question or research topic" span>
            <textarea
              className="textarea"
              rows={3}
              placeholder="Paste or type the exact assignment question or research topic here…"
              value={assignment.topic}
              onChange={(e) => set('topic', e.target.value)}
              style={{ minHeight: 80 }}
            />
          </Field>

          <Field label="Assignment type">
            <select
              className="select"
              value={assignment.assignmentType}
              onChange={(e) => set('assignmentType', e.target.value as AssignmentType)}
            >
              {ASSIGNMENT_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
          </Field>

          <Field label="Target word count">
            <input
              type="number"
              className="input"
              placeholder="e.g. 2000"
              value={assignment.targetWordCount || ''}
              onChange={(e) => set('targetWordCount', parseInt(e.target.value, 10) || 0)}
            />
          </Field>

          {/* Divider label */}
          <div style={{ gridColumn: '1/-1', borderTop: '1px solid var(--border)', paddingTop: '1rem', marginTop: '0.25rem' }}>
            <span className="overline">Institution details</span>
          </div>

          <Field label="University / Institution">
            <input type="text" className="input" placeholder="e.g. University of Colombo"
              value={assignment.institution} onChange={(e) => set('institution', e.target.value)} />
          </Field>

          <Field label="Faculty / Department">
            <input type="text" className="input" placeholder="e.g. Faculty of Science"
              value={assignment.faculty} onChange={(e) => set('faculty', e.target.value)} />
          </Field>

          <Field label="Course / Module name">
            <input type="text" className="input" placeholder="e.g. Environmental Resource Management"
              value={assignment.courseName} onChange={(e) => set('courseName', e.target.value)} />
          </Field>

          <Field label="Course code">
            <input type="text" className="input" placeholder="e.g. ENVR-3042"
              value={assignment.courseCode} onChange={(e) => set('courseCode', e.target.value)} />
          </Field>

          {/* Divider label */}
          <div style={{ gridColumn: '1/-1', borderTop: '1px solid var(--border)', paddingTop: '1rem', marginTop: '0.25rem' }}>
            <span className="overline">Student details</span>
          </div>

          <Field label="Student name">
            <input type="text" className="input" placeholder="e.g. Kasun Wickramasinghe"
              value={assignment.studentName} onChange={(e) => set('studentName', e.target.value)} />
          </Field>

          <Field label="Student ID / Index No.">
            <input type="text" className="input" placeholder="e.g. SC/2023/8892"
              value={assignment.studentId} onChange={(e) => set('studentId', e.target.value)} />
          </Field>

          <Field label="Lecturer / Instructor">
            <input type="text" className="input" placeholder="e.g. Dr. Anura Perera"
              value={assignment.instructorName} onChange={(e) => set('instructorName', e.target.value)} />
          </Field>

          <Field label="Submission date">
            <input type="date" className="input"
              value={assignment.submissionDate} onChange={(e) => set('submissionDate', e.target.value)} />
          </Field>

        </div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'flex-end', paddingTop: '1.5rem' }}>
        <button type="submit" className="btn btn-primary btn-lg">
          Continue to add content
          <ArrowRight size={16} />
        </button>
      </div>
    </form>
  );
};
