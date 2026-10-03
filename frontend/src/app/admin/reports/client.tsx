'use client';

import { useCallback, useEffect, useState } from 'react';
import { apiFetch } from '@/lib/api';
import { Icon } from '@/components/icons/Icon';
import { CustomDropdown } from '@/components/CustomDropdown';
import { formatDate } from '@/lib/dates';

type ReportStatus = 'open' | 'actioned' | 'dismissed';
type ReportTargetType = 'post' | 'comment' | 'article';

interface ReportItem {
  id: string;
  target_type: ReportTargetType;
  target_id: string;
  reason: string;
  details: string | null;
  status: ReportStatus;
  created_at: string;
  reporter_username: string;
  target: {
    exists: boolean;
    title: string | null;
    excerpt: string | null;
    href: string | null;
  };
}

const REASON_LABELS: Record<string, string> = {
  spam: 'Spam',
  harassment: 'Harassment',
  misinformation: 'Misinformation',
  illegal: 'Illegal',
  other: 'Other',
};

const STATUS_STYLES: Record<ReportStatus, string> = {
  open: 'bg-amber-600/20 text-amber-400 border-amber-500/30',
  actioned: 'bg-green-500/20 text-green-400 border-green-500/30',
  dismissed: 'bg-white/5 text-zinc-400 border-white/10',
};

export default function AdminReportsClient() {
  const [reports, setReports] = useState<ReportItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ total: 0, totalPages: 0 });
  const [status, setStatus] = useState('open');
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const fetchReports = useCallback(async (p: number, s: string) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: String(p), limit: '20', status: s });
      const data = await apiFetch<{
        reports: ReportItem[];
        pagination: { page: number; limit: number; total: number; totalPages: number };
      }>(`/admin/reports?${params}`);
      setReports(data.reports);
      setPagination({ total: data.pagination.total, totalPages: data.pagination.totalPages });
    } catch {
      setReports([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchReports(page, status);
  }, [page, status, fetchReports]);

  const resolve = async (id: string, next: ReportStatus) => {
    setActionLoading(id);
    try {
      await apiFetch(`/admin/reports/${id}`, {
        method: 'PATCH',
        body: JSON.stringify({ status: next }),
      });
      await fetchReports(page, status);
    } catch {
      // auth guard redirects
    } finally {
      setActionLoading(null);
    }
  };

  const targetLabel = (report: ReportItem) => {
    if (report.target.exists) {
      return report.target.title || report.target.excerpt || report.target_id;
    }
    return 'Removed content';
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-white text-lg font-bold">Reports</h2>
        <span className="text-xs text-zinc-500">{pagination.total} total</span>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <CustomDropdown
          value={status}
          onChange={v => {
            setStatus(v);
            setPage(1);
          }}
          options={[
            { value: 'open', label: 'Open' },
            { value: 'actioned', label: 'Actioned' },
            { value: 'dismissed', label: 'Dismissed' },
            { value: 'all', label: 'All' },
          ]}
          placeholder="Status"
          className="px-3 py-1.5 bg-white/5 border border-white/10 rounded-lg text-white text-xs outline-none focus:border-orange-500/50 min-h-9"
        />
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-white/20 border-t-orange-500" />
        </div>
      ) : reports.length === 0 ? (
        <div className="rounded-xl border border-white/5 bg-white/[0.03] px-5 py-10 text-center">
          <p className="text-sm text-zinc-400">No {status === 'all' ? '' : status} reports.</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-xs">
            <thead>
              <tr className="border-b-2 border-white/10 text-left text-white/40">
                <th className="p-2">Target</th>
                <th className="p-2">Reason</th>
                <th className="p-2">Reporter</th>
                <th className="p-2">Created</th>
                <th className="p-2">Status</th>
                <th className="p-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {reports.map(report => (
                <tr key={report.id} className="border-b border-white/5">
                  <td className="max-w-[260px] p-2">
                    <span className="text-white/60">{report.target_type}</span>
                    {report.target.exists && report.target.href ? (
                      <a
                        href={report.target.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="ml-2 text-orange-400 no-underline hover:text-orange-300"
                      >
                        {targetLabel(report)}
                      </a>
                    ) : (
                      <span className="ml-2 text-zinc-500">{targetLabel(report)}</span>
                    )}
                    {report.details && (
                      <p className="mt-1 truncate text-3xs text-zinc-500" title={report.details}>
                        {report.details}
                      </p>
                    )}
                  </td>
                  <td className="p-2 text-white/70">{REASON_LABELS[report.reason] || report.reason}</td>
                  <td className="p-2 text-white/70">{report.reporter_username}</td>
                  <td className="p-2 text-white/60">{formatDate(report.created_at)}</td>
                  <td className="p-2">
                    <span
                      className={`rounded-full border px-2.5 py-0.5 text-3xs font-semibold uppercase tracking-wider ${STATUS_STYLES[report.status]}`}
                    >
                      {report.status}
                    </span>
                  </td>
                  <td className="p-2">
                    {report.status === 'open' ? (
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          disabled={actionLoading === report.id}
                          onClick={() => resolve(report.id, 'actioned')}
                          className="flex items-center gap-1 rounded-lg bg-green-700 px-2.5 py-1 text-3xs font-semibold text-white transition hover:bg-green-600 disabled:opacity-60"
                        >
                          <Icon name="Check" size={11} color="#fff" /> Action
                        </button>
                        <button
                          type="button"
                          disabled={actionLoading === report.id}
                          onClick={() => resolve(report.id, 'dismissed')}
                          className="flex items-center gap-1 rounded-lg border border-white/10 px-2.5 py-1 text-3xs font-semibold text-zinc-300 transition hover:bg-white/5 disabled:opacity-60"
                        >
                          <Icon name="X" size={11} /> Dismiss
                        </button>
                      </div>
                    ) : (
                      <span className="text-3xs text-zinc-600">Resolved</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {pagination.totalPages > 1 && (
        <div className="flex items-center justify-between text-xs text-zinc-500">
          <button
            type="button"
            disabled={page <= 1}
            onClick={() => setPage(p => p - 1)}
            className="rounded-lg border border-white/10 px-3 py-1.5 transition hover:bg-white/5 disabled:opacity-40"
          >
            Previous
          </button>
          <span>
            Page {page} of {pagination.totalPages}
          </span>
          <button
            type="button"
            disabled={page >= pagination.totalPages}
            onClick={() => setPage(p => p + 1)}
            className="rounded-lg border border-white/10 px-3 py-1.5 transition hover:bg-white/5 disabled:opacity-40"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}
