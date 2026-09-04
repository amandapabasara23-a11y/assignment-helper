import React from 'react';
import type { Assignment, AssignmentVersion } from '../types';
import { History, RotateCcw, X } from 'lucide-react';

interface VersionHistoryModalProps {
  assignment: Assignment;
  isOpen: boolean;
  onClose: () => void;
  onRestoreVersion: (version: AssignmentVersion) => void;
}

export const VersionHistoryModal: React.FC<VersionHistoryModalProps> = ({
  assignment,
  isOpen,
  onClose,
  onRestoreVersion
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 sm:p-8 max-w-3xl w-full border border-slate-200 dark:border-slate-800 shadow-2xl space-y-6 max-h-[85vh] flex flex-col">
        <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-100 dark:bg-purple-950 text-purple-600 flex items-center justify-center font-bold">
              <History className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-lg text-slate-900 dark:text-white">Version History & Audit Log</h3>
              <p className="text-xs text-slate-500">Track and restore past assignment document snapshots.</p>
            </div>
          </div>

          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto space-y-6 pr-2">
          {/* Audit Log Timeline */}
          <div className="space-y-3">
            <h4 className="font-bold text-xs uppercase tracking-wider text-slate-400">Activity Audit Trail</h4>
            <div className="space-y-2">
              {assignment.auditLogs.map((log) => (
                <div
                  key={log.id}
                  className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 text-xs flex items-center justify-between"
                >
                  <div className="space-y-0.5">
                    <span className="font-bold text-slate-800 dark:text-slate-200 block">{log.action}</span>
                    <span className="text-slate-500">{log.details}</span>
                  </div>
                  <span className="text-[10px] text-slate-400 whitespace-nowrap pl-2">
                    {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Snapshots List */}
          <div className="space-y-3">
            <h4 className="font-bold text-xs uppercase tracking-wider text-slate-400">Restore Past Versions</h4>
            {assignment.versions.length === 0 ? (
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/20 text-xs text-slate-500 text-center">
                Current version is active. Major edits automatically create snapshot checkpoints.
              </div>
            ) : (
              <div className="space-y-3">
                {assignment.versions.map((ver) => (
                  <div
                    key={ver.id}
                    className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-center justify-between gap-4"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-slate-900 dark:text-white">Version {ver.versionNumber}</span>
                        <span className="text-[11px] text-slate-400">
                          {new Date(ver.timestamp).toLocaleString()}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500">{ver.note}</p>
                    </div>

                    <button
                      onClick={() => onRestoreVersion(ver)}
                      className="btn btn-sm btn-outline flex items-center gap-1 text-xs"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>Restore</span>
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
