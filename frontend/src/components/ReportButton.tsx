'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Icon } from './icons/Icon';
import { API } from '@/lib/api';
import { ApiError } from '@/lib/api/client';
import { toast } from '@/lib/toast';
import type { ReportReason, ReportTargetType } from '@/lib/api/endpoints/reports';

const REASONS: Array<{ value: ReportReason; label: string }> = [
  { value: 'spam', label: 'Spam or misleading' },
  { value: 'harassment', label: 'Harassment or hate speech' },
  { value: 'misinformation', label: 'False or misleading information' },
  { value: 'illegal', label: 'Illegal or dangerous content' },
  { value: 'other', label: 'Something else' },
];

interface ReportButtonProps {
  targetType: ReportTargetType;
  targetId: string;
  className?: string;
}

export function ReportButton({ targetType, targetId, className = '' }: ReportButtonProps) {
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState<ReportReason | ''>('');
  const [details, setDetails] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const reset = () => {
    setReason('');
    setDetails('');
  };

  const close = () => {
    if (submitting) return;
    setOpen(false);
    reset();
  };

  const submit = async () => {
    if (!reason || submitting) return;
    setSubmitting(true);
    try {
      const res = await API.createReport({
        target_type: targetType,
        target_id: targetId,
        reason,
        details: details.trim() ? details.trim() : undefined,
      });
      if (res.duplicate) {
        toast.info('You have already reported this content.');
      } else {
        toast.success('Report submitted. Thanks for helping keep YoTop10 safe.');
      }
      setOpen(false);
      reset();
    } catch (err) {
      const status = err instanceof ApiError ? err.status : undefined;
      if (status === 401) {
        toast.error('Sign in to report this content.');
      } else if (status === 429) {
        toast.error('Too many reports. Try again later.');
      } else if (status === 400) {
        toast.error('You cannot report your own content.');
      } else {
        toast.error('Something went wrong. Please try again.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={`inline-flex items-center gap-1 rounded-lg text-xs font-medium text-zinc-500 transition hover:text-zinc-300 ${className}`}
        aria-label={`Report ${targetType}`}
      >
        <Icon name="Flag" size={13} />
        Report
      </button>

      {open && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4" onClick={close}>
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" />
          <div
            role="dialog"
            aria-modal="true"
            aria-label={`Report ${targetType}`}
            className="relative z-10 w-full max-w-sm rounded-2xl border border-white/10 bg-[var(--color-bg)] p-6 shadow-2xl"
            onClick={e => e.stopPropagation()}
          >
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-sm font-bold text-white">Report this {targetType}</h2>
              <button
                type="button"
                onClick={close}
                aria-label="Close"
                className="rounded-lg p-1.5 text-zinc-500 transition hover:bg-white/5 hover:text-zinc-300"
              >
                <Icon name="X" size={16} />
              </button>
            </div>

            <fieldset className="space-y-2" disabled={submitting}>
              <legend className="mb-2 text-xs text-zinc-500">Why are you reporting it?</legend>
              {REASONS.map(r => (
                <label
                  key={r.value}
                  className={`flex cursor-pointer items-center gap-2.5 rounded-xl border px-3.5 py-2.5 text-sm transition ${
                    reason === r.value
                      ? 'border-orange-500/50 bg-orange-500/10 text-white'
                      : 'border-white/10 bg-white/5 text-zinc-300 hover:border-white/20'
                  }`}
                >
                  <input
                    type="radio"
                    name="report-reason"
                    value={r.value}
                    checked={reason === r.value}
                    onChange={() => setReason(r.value)}
                    className="h-3.5 w-3.5 accent-orange-500"
                  />
                  {r.label}
                </label>
              ))}
            </fieldset>

            <textarea
              value={details}
              onChange={e => setDetails(e.target.value)}
              placeholder="Add details (optional)"
              maxLength={1000}
              rows={3}
              className="mt-3 w-full resize-y rounded-xl border border-white/10 bg-white/5 px-3.5 py-2.5 text-sm text-white placeholder:text-zinc-600 focus:border-orange-500/50 focus:outline-none"
            />

            <p className="mt-3 text-2xs leading-relaxed text-zinc-500">
              Reports are confidential. Read the{' '}
              <Link href="/docs/guidelines" className="text-orange-400 hover:text-orange-300 transition">
                Community Guidelines
              </Link>{' '}
              to see what belongs in a report.
            </p>

            <div className="mt-4 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={close}
                disabled={submitting}
                className="rounded-xl border border-white/10 px-4 py-2 text-xs font-medium text-zinc-300 transition hover:bg-white/5"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={submit}
                disabled={!reason || submitting}
                className="rounded-xl bg-gradient-to-r from-orange-500 to-pink-500 px-4 py-2 text-xs font-semibold text-white transition disabled:cursor-not-allowed disabled:opacity-60"
              >
                {submitting ? 'Submitting...' : 'Submit report'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
