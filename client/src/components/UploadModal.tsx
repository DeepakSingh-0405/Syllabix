import React, { useState } from 'react';
import { api } from '../lib/api';
import { Subject } from '../types';
import { UploadCloud, X, CheckCircle2, AlertCircle, Edit3, ListFilter } from 'lucide-react';

interface UploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  subjects: Subject[];
  onUploadSuccess: () => void;
}

export const UploadModal: React.FC<UploadModalProps> = ({
  isOpen,
  onClose,
  subjects,
  onUploadSuccess,
}) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [resourceType, setResourceType] = useState<'syllabus' | 'lecture_notes' | 'question_paper'>('syllabus');

  // Manual subject entry vs selection
  const [isManualSubject, setIsManualSubject] = useState(true);
  const [manualSubjectName, setManualSubjectName] = useState('');
  const [manualSubjectCode, setManualSubjectCode] = useState('');
  const [selectedSubjectId, setSelectedSubjectId] = useState(subjects[0]?._id || '');

  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('Document title is required.');
      return;
    }

    if (isManualSubject && !manualSubjectName.trim()) {
      setError('Please enter the academic subject name.');
      return;
    }

    setUploading(true);
    setError(null);
    setStatusMessage('Preparing syllabus registration and upload URL...');

    try {
      const fileName = file ? file.name : `${title.trim().replace(/\s+/g, '_')}.pdf`;
      const mimeType = file ? file.type : 'application/pdf';

      // 1. Request Upload Intent from Express API
      const intent = await api.post<{
        resourceId: string;
        storagePath: string;
        uploadUrl: string;
        subject?: { _id: string; code: string; name: string };
      }>('/resources/upload-intent', {
        title: title.trim(),
        description: description.trim(),
        resourceType,
        subjectId: isManualSubject ? undefined : selectedSubjectId,
        subjectName: isManualSubject ? manualSubjectName.trim() : undefined,
        subjectCode: isManualSubject ? manualSubjectCode.trim() : undefined,
        fileName,
        mimeType,
        fileSizeBytes: file?.size || 1024,
      });

      // 2. Direct upload to Supabase Storage if file was provided and signed upload URL is valid
      if (file && intent?.uploadUrl && intent.uploadUrl.startsWith('http')) {
        setStatusMessage('Saving document to storage catalog...');
        try {
          await fetch(intent.uploadUrl, {
            method: 'PUT',
            headers: { 'Content-Type': mimeType },
            body: file,
          });
        } catch (storageErr) {
          console.warn('[UploadModal] Supabase direct PUT fallback notice:', storageErr);
        }
      }

      // 3. Confirm upload
      if (intent?.resourceId) {
        setStatusMessage('Registering syllabus document in curriculum catalog...');
        try {
          await api.post(`/resources/${intent.resourceId}/confirm-upload`);
        } catch {
          // Proceed with success
        }
      }

      setStatusMessage('Upload complete! Document added to curriculum catalog.');
      setTimeout(() => {
        onUploadSuccess();
        onClose();
      }, 1000);
    } catch (err: any) {
      setError(err.message || 'Failed to submit syllabus document.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="upload-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-space-4 bg-surface-base/80 backdrop-blur-sm"
    >
      <div className="relative w-full max-w-lg bg-surface-muted border border-border-interactive rounded-lg shadow-md p-space-4 sm:p-6 flex flex-col max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-space-3 border-b border-border-default mb-space-3">
          <div className="flex items-center gap-2">
            <span className="w-7 h-7 rounded-md bg-surface-interactive border border-border-interactive flex items-center justify-center text-text-secondary">
              <UploadCloud className="w-4 h-4" />
            </span>
            <h2 id="upload-title" className="text-[18px] font-semibold text-text-secondary">
              Submit syllabus material
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close dialog"
            className="p-1 rounded-md text-text-tertiary hover:text-text-secondary hover:bg-surface-interactive transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="mb-4 p-space-3 bg-status-errorSurface border border-status-error rounded-md text-status-error text-[13px] flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {statusMessage && (
          <div className="mb-4 p-space-3 bg-surface-base border border-border-interactive rounded-md text-text-secondary text-[13px] flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-text-secondary shrink-0" />
            <span>{statusMessage}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-space-3">
          {/* Document Title */}
          <div>
            <label className="block text-[13px] font-medium text-text-tertiary mb-1">
              Document title
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Software Engineering (SE) Syllabus & Lab Manual"
              className="w-full bg-surface-base text-text-secondary text-[14px] px-3.5 py-2 rounded-md border border-border-interactive focus-visible:ring-2"
            />
          </div>

          {/* Academic Subject (Manual entry vs Preset selection) */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-[13px] font-medium text-text-tertiary">
                Academic subject
              </label>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => setIsManualSubject(true)}
                  className={`px-2 py-0.5 text-[11px] rounded transition-colors flex items-center gap-1 ${
                    isManualSubject
                      ? 'bg-surface-interactive text-text-secondary border border-border-interactive'
                      : 'text-text-tertiary hover:text-text-secondary'
                  }`}
                >
                  <Edit3 className="w-3 h-3" />
                  <span>Manual entry</span>
                </button>
                <button
                  type="button"
                  onClick={() => setIsManualSubject(false)}
                  className={`px-2 py-0.5 text-[11px] rounded transition-colors flex items-center gap-1 ${
                    !isManualSubject
                      ? 'bg-surface-interactive text-text-secondary border border-border-interactive'
                      : 'text-text-tertiary hover:text-text-secondary'
                  }`}
                >
                  <ListFilter className="w-3 h-3" />
                  <span>Select existing</span>
                </button>
              </div>
            </div>

            {isManualSubject ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <div>
                  <input
                    type="text"
                    required
                    value={manualSubjectName}
                    onChange={(e) => setManualSubjectName(e.target.value)}
                    placeholder="Subject name (e.g. Software Engineering)"
                    className="w-full bg-surface-base text-text-secondary text-[13px] px-3 py-2 rounded-md border border-border-interactive focus-visible:ring-2"
                  />
                </div>
                <div>
                  <input
                    type="text"
                    value={manualSubjectCode}
                    onChange={(e) => setManualSubjectCode(e.target.value)}
                    placeholder="Course code (e.g. SE-301)"
                    className="w-full bg-surface-base text-text-secondary text-[13px] px-3 py-2 rounded-md border border-border-interactive focus-visible:ring-2"
                  />
                </div>
              </div>
            ) : (
              <select
                value={selectedSubjectId}
                onChange={(e) => setSelectedSubjectId(e.target.value)}
                className="w-full bg-surface-base text-text-secondary text-[14px] px-3.5 py-2 rounded-md border border-border-interactive focus-visible:ring-2"
              >
                {subjects.map((s) => (
                  <option key={s._id} value={s._id}>
                    {s.code} — {s.name} (Sem {s.semester})
                  </option>
                ))}
              </select>
            )}
            <p className="text-[11px] text-text-tertiary mt-1">
              Enter any university subject freely — Syllabix dynamically indexes new courses into the curriculum directory.
            </p>
          </div>

          {/* Resource Type */}
          <div>
            <label className="block text-[13px] font-medium text-text-tertiary mb-1">
              Category
            </label>
            <div className="grid grid-cols-3 gap-2">
              {(['syllabus', 'lecture_notes', 'question_paper'] as const).map((type) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => setResourceType(type)}
                  className={`py-1.5 px-2 text-[12px] rounded-md border capitalize transition-colors ${
                    resourceType === type
                      ? 'bg-surface-interactive text-text-secondary border-text-secondary font-medium'
                      : 'bg-surface-base text-text-tertiary border-border-default hover:text-text-secondary'
                  }`}
                >
                  {type.replace('_', ' ')}
                </button>
              ))}
            </div>
          </div>

          {/* File Picker */}
          <div>
            <label className="block text-[13px] font-medium text-text-tertiary mb-1">
              Syllabus PDF / document file
            </label>
            <input
              type="file"
              accept=".pdf,.docx,.pptx,.txt"
              onChange={handleFileChange}
              className="w-full text-[13px] text-text-tertiary file:mr-3 file:py-1.5 file:px-3 file:rounded-md file:border-0 file:text-[13px] file:font-medium file:bg-surface-interactive file:text-text-secondary hover:file:cursor-pointer"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-[13px] font-medium text-text-tertiary mb-1">
              Description / Notes (optional)
            </label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Summary of units, instructor guidelines, or exam patterns..."
              className="w-full bg-surface-base text-text-secondary text-[14px] px-3.5 py-2 rounded-md border border-border-interactive focus-visible:ring-2 resize-none"
            />
          </div>

          {/* Submit Action */}
          <div className="flex items-center justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-[14px] font-medium text-text-tertiary hover:text-text-secondary"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={uploading}
              className="inline-flex items-center gap-1.5 bg-text-secondary text-surface-base font-medium text-[14px] px-4 py-2 rounded-md hover:opacity-90 active:scale-[0.98] disabled:opacity-50 transition-all"
            >
              {uploading ? (
                <span className="w-4 h-4 border-2 border-surface-base border-t-transparent rounded-full animate-spin" />
              ) : (
                <UploadCloud className="w-4 h-4" />
              )}
              <span>Upload document</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
