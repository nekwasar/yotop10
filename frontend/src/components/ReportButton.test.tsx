import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import React from 'react';

const mockCreateReport = vi.fn();
const mockToastSuccess = vi.fn();
const mockToastError = vi.fn();
const mockToastInfo = vi.fn();

vi.mock('@/lib/api', () => ({
  API: {
    createReport: (...args: unknown[]) => mockCreateReport(...args),
  },
}));

vi.mock('@/lib/toast', () => ({
  toast: {
    success: (...args: unknown[]) => mockToastSuccess(...args),
    error: (...args: unknown[]) => mockToastError(...args),
    info: (...args: unknown[]) => mockToastInfo(...args),
  },
}));

vi.mock('./icons/Icon', () => ({
  Icon: (props: { name: string; size?: number }) =>
    React.createElement('span', { 'data-testid': 'icon', 'data-name': props.name }),
}));

import { ReportButton } from '@/components/ReportButton';
import { ApiError } from '@/lib/api/client';

describe('ReportButton', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders a trigger button labelled with the target type', () => {
    render(<ReportButton targetType="post" targetId="p1" />);
    expect(screen.getByRole('button', { name: 'Report post' })).toBeInTheDocument();
  });

  it('opens the report dialog with all five reasons', () => {
    render(<ReportButton targetType="comment" targetId="c1" />);

    fireEvent.click(screen.getByRole('button', { name: 'Report comment' }));

    expect(screen.getByRole('dialog', { name: 'Report comment' })).toBeInTheDocument();
    expect(screen.getByLabelText('Spam or misleading')).toBeInTheDocument();
    expect(screen.getByLabelText('Harassment or hate speech')).toBeInTheDocument();
    expect(screen.getByLabelText('False or misleading information')).toBeInTheDocument();
    expect(screen.getByLabelText('Illegal or dangerous content')).toBeInTheDocument();
    expect(screen.getByLabelText('Something else')).toBeInTheDocument();
  });

  it('keeps submit disabled until a reason is chosen', () => {
    render(<ReportButton targetType="post" targetId="p1" />);
    fireEvent.click(screen.getByRole('button', { name: 'Report post' }));

    const submit = screen.getByRole('button', { name: 'Submit report' });
    expect(submit).toBeDisabled();

    fireEvent.click(screen.getByLabelText('Spam or misleading'));
    expect(submit).toBeEnabled();
  });

  it('submits the chosen reason with optional details', async () => {
    mockCreateReport.mockResolvedValue({ ok: true, report_id: 'r1' });

    render(<ReportButton targetType="post" targetId="p1" />);
    fireEvent.click(screen.getByRole('button', { name: 'Report post' }));
    fireEvent.click(screen.getByLabelText('Harassment or hate speech'));
    fireEvent.change(screen.getByPlaceholderText('Add details (optional)'), {
      target: { value: 'Repeated insults in every reply' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Submit report' }));

    await waitFor(() => {
      expect(mockCreateReport).toHaveBeenCalledWith({
        target_type: 'post',
        target_id: 'p1',
        reason: 'harassment',
        details: 'Repeated insults in every reply',
      });
    });
    await waitFor(() => {
      expect(mockToastSuccess).toHaveBeenCalledWith(
        'Report submitted. Thanks for helping keep YoTop10 safe.'
      );
    });
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('reports an idempotent duplicate with an info toast', async () => {
    mockCreateReport.mockResolvedValue({ ok: true, duplicate: true });

    render(<ReportButton targetType="post" targetId="p1" />);
    fireEvent.click(screen.getByRole('button', { name: 'Report post' }));
    fireEvent.click(screen.getByLabelText('Spam or misleading'));
    fireEvent.click(screen.getByRole('button', { name: 'Submit report' }));

    await waitFor(() => {
      expect(mockToastInfo).toHaveBeenCalledWith('You have already reported this content.');
    });
    expect(mockToastSuccess).not.toHaveBeenCalled();
  });

  it('prompts sign-in when the request is unauthenticated', async () => {
    mockCreateReport.mockRejectedValue(
      new ApiError('API Error: 401 Unauthorized - {}', '/reports', 401)
    );

    render(<ReportButton targetType="post" targetId="p1" />);
    fireEvent.click(screen.getByRole('button', { name: 'Report post' }));
    fireEvent.click(screen.getByLabelText('Spam or misleading'));
    fireEvent.click(screen.getByRole('button', { name: 'Submit report' }));

    await waitFor(() => {
      expect(mockToastError).toHaveBeenCalledWith('Sign in to report this content.');
    });
    expect(screen.getByRole('dialog')).toBeInTheDocument();
  });

  it('surfaces the rate limit message on 429', async () => {
    mockCreateReport.mockRejectedValue(
      new ApiError('API Error: 429 Too Many Requests - {}', '/reports', 429)
    );

    render(<ReportButton targetType="comment" targetId="c1" />);
    fireEvent.click(screen.getByRole('button', { name: 'Report comment' }));
    fireEvent.click(screen.getByLabelText('Something else'));
    fireEvent.click(screen.getByRole('button', { name: 'Submit report' }));

    await waitFor(() => {
      expect(mockToastError).toHaveBeenCalledWith('Too many reports. Try again later.');
    });
  });

  it('explains a self-report rejection on 400', async () => {
    mockCreateReport.mockRejectedValue(
      new ApiError('API Error: 400 Bad Request - {}', '/reports', 400)
    );

    render(<ReportButton targetType="article" targetId="a1" />);
    fireEvent.click(screen.getByRole('button', { name: 'Report article' }));
    fireEvent.click(screen.getByLabelText('False or misleading information'));
    fireEvent.click(screen.getByRole('button', { name: 'Submit report' }));

    await waitFor(() => {
      expect(mockToastError).toHaveBeenCalledWith('You cannot report your own content.');
    });
  });

  it('falls back to a generic error message on failure', async () => {
    mockCreateReport.mockRejectedValue(new Error('Network error'));

    render(<ReportButton targetType="post" targetId="p1" />);
    fireEvent.click(screen.getByRole('button', { name: 'Report post' }));
    fireEvent.click(screen.getByLabelText('Illegal or dangerous content'));
    fireEvent.click(screen.getByRole('button', { name: 'Submit report' }));

    await waitFor(() => {
      expect(mockToastError).toHaveBeenCalledWith('Something went wrong. Please try again.');
    });
  });
});
