import { apiFetch } from '../client';

export type ReportTargetType = 'post' | 'comment' | 'article';

export type ReportReason = 'spam' | 'harassment' | 'misinformation' | 'illegal' | 'other';

export interface CreateReportInput {
  target_type: ReportTargetType;
  target_id: string;
  reason: ReportReason;
  details?: string;
}

export interface CreateReportResponse {
  ok: boolean;
  report_id?: string;
  duplicate?: boolean;
}

export const reportsApi = {
  create: (input: CreateReportInput) =>
    apiFetch<CreateReportResponse>('/reports', {
      method: 'POST',
      body: JSON.stringify(input),
    }),
};
