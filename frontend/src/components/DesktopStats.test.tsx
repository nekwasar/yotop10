import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, act } from '@testing-library/react';
import { DesktopStats } from './DesktopStats';

const { apiFetchMock } = vi.hoisted(() => ({ apiFetchMock: vi.fn() }));

vi.mock('@/lib/api/client', () => ({ apiFetch: apiFetchMock }));

const flush = async () => {
  await act(async () => {
    // The rail starts with a dynamic import, so a single microtask is not
    // enough to reach the fetch — let the event loop turn over.
    await new Promise((resolve) => setTimeout(resolve, 10));
  });
};

describe('DesktopStats', () => {
  beforeEach(() => {
    apiFetchMock.mockReset();
  });

  it('renders the four counters from /stats/platform', async () => {
    apiFetchMock.mockResolvedValue({
      total_posts: 1234,
      total_debates: 56,
      total_users: 789,
      total_facts: 10,
    });

    render(<DesktopStats />);

    expect(await screen.findByText('1,234')).toBeInTheDocument();
    expect(screen.getByText('56')).toBeInTheDocument();
    expect(screen.getByText('789')).toBeInTheDocument();
    expect(screen.getByText('10')).toBeInTheDocument();
    expect(apiFetchMock).toHaveBeenCalledWith('/stats/platform');
  });

  it('hides the rail when a counter is missing', async () => {
    apiFetchMock.mockResolvedValue({ total_posts: 5, total_users: 6 });

    const { container } = render(<DesktopStats />);
    await flush();

    expect(container.innerHTML).toBe('');
  });

  it('hides the rail when the payload is not an object', async () => {
    apiFetchMock.mockResolvedValue(null);

    const { container } = render(<DesktopStats />);
    await flush();

    expect(container.innerHTML).toBe('');
  });

  it('hides the rail when the request rejects', async () => {
    apiFetchMock.mockRejectedValue(new Error('425 Too Early'));

    const { container } = render(<DesktopStats />);
    await flush();

    expect(container.innerHTML).toBe('');
  });
});
