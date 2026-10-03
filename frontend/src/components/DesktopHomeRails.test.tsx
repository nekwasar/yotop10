import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, act } from '@testing-library/react';
import { DesktopTrending } from './DesktopTrending';
import { DesktopHallOfFame } from './DesktopHallOfFame';

const { apiFetchMock } = vi.hoisted(() => ({ apiFetchMock: vi.fn() }));

vi.mock('@/lib/api/client', () => ({ apiFetch: apiFetchMock }));

const flush = async () => {
  await act(async () => {
    // The rails start with a dynamic import, so a single microtask is not
    // enough to reach the fetch — let the event loop turn over.
    await new Promise((resolve) => setTimeout(resolve, 10));
  });
};

describe('DesktopTrending', () => {
  beforeEach(() => apiFetchMock.mockReset());

  it('renders the query strings from the trending payload', async () => {
    apiFetchMock.mockResolvedValue({
      trending: [
        { query: 'best pizza' },
        { query: 'worst car' },
        { query: 'top films' },
      ],
    });

    render(<DesktopTrending />);

    expect(await screen.findByText('best pizza')).toBeInTheDocument();
    expect(screen.getByText('worst car')).toBeInTheDocument();
    expect(screen.getByText('top films')).toBeInTheDocument();
    expect(apiFetchMock).toHaveBeenCalledWith('/search/trending');
  });

  it('hides the section when there is genuinely nothing trending', async () => {
    apiFetchMock.mockResolvedValue({ trending: [] });

    const { container } = render(<DesktopTrending />);
    await flush();

    expect(container.innerHTML).toBe('');
  });

  it('does not crash when the payload has no trending key', async () => {
    apiFetchMock.mockResolvedValue({});

    const { container } = render(<DesktopTrending />);
    await flush();

    expect(container.innerHTML).toBe('');
  });
});

describe('DesktopHallOfFame', () => {
  beforeEach(() => apiFetchMock.mockReset());

  it('renders entries from the featured payload', async () => {
    apiFetchMock.mockResolvedValue({
      featured: [
        {
          id: 'hof-1',
          post_id: 'p1',
          post: {
            slug: 'top-10-movies',
            title: 'Top 10 Movies',
            post_type: 'top_list',
            author_username: 'cinephile',
            author_display_name: 'Cinephile',
            view_count: 1500,
            comment_count: 42,
          },
          editorial_note: 'A definitive ranking',
        },
      ],
    });

    render(<DesktopHallOfFame />);

    expect(await screen.findByText('Top 10 Movies')).toBeInTheDocument();
    expect(screen.getByText('A definitive ranking')).toBeInTheDocument();
    expect(apiFetchMock).toHaveBeenCalledWith('/hall-of-fame');
  });

  it('hides the section when nothing is featured', async () => {
    apiFetchMock.mockResolvedValue({ featured: [] });

    const { container } = render(<DesktopHallOfFame />);
    await flush();

    expect(container.innerHTML).toBe('');
  });

  it('does not crash when the payload has no featured key', async () => {
    apiFetchMock.mockResolvedValue({});

    const { container } = render(<DesktopHallOfFame />);
    await flush();

    expect(container.innerHTML).toBe('');
  });

  it('reads `featured`, not the legacy `entries` key', async () => {
    // Regression: the component used to read `entries`, which the API has
    // never returned, so the rail stayed hidden no matter what the table held.
    apiFetchMock.mockResolvedValue({
      entries: [],
      featured: [
        {
          id: 'hof-2',
          post_id: 'p2',
          post: {
            slug: 'top-10-albums',
            title: 'Top 10 Albums',
            post_type: 'top_list',
            author_username: 'crate_digger',
            author_display_name: 'Crate Digger',
            view_count: 20,
            comment_count: 3,
          },
        },
      ],
    });

    render(<DesktopHallOfFame />);

    expect(await screen.findByText('Top 10 Albums')).toBeInTheDocument();
  });
});
