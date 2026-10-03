import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import CategoriesClient from './client';

const { apiFetchMock } = vi.hoisted(() => ({ apiFetchMock: vi.fn() }));

vi.mock('@/lib/api/client', () => ({ apiFetch: apiFetchMock }));

const category = {
  id: 'cat-1',
  name: 'Movies',
  slug: 'movies',
  post_count: 3,
  is_featured: false,
  children: [],
};

describe('CategoriesClient', () => {
  beforeEach(() => {
    apiFetchMock.mockReset();
  });

  it('renders the category list on success', async () => {
    apiFetchMock.mockResolvedValue({ categories: [category] });

    render(<CategoriesClient />);

    expect(await screen.findByText('Movies')).toBeInTheDocument();
    expect(screen.getByText('3 posts')).toBeInTheDocument();
  });

  it('shows an error state — not the empty state — when the request fails', async () => {
    apiFetchMock.mockRejectedValue(new Error('425 Too Early'));

    render(<CategoriesClient />);

    expect(await screen.findByText('Error Loading Categories')).toBeInTheDocument();
    expect(screen.queryByText('No categories available.')).toBeNull();
  });

  it('treats a 200 with an unexpected shape as a failure', async () => {
    apiFetchMock.mockResolvedValue({ error: 'boom' });

    render(<CategoriesClient />);

    expect(await screen.findByText('Error Loading Categories')).toBeInTheDocument();
    expect(screen.queryByText('No categories available.')).toBeNull();
  });

  it('only claims there are no categories when the server really returned none', async () => {
    apiFetchMock.mockResolvedValue({ categories: [] });

    render(<CategoriesClient />);

    expect(await screen.findByText('No categories available.')).toBeInTheDocument();
    expect(screen.queryByText('Error Loading Categories')).toBeNull();
  });

  it('offers a retry that refetches', async () => {
    apiFetchMock.mockRejectedValueOnce(new Error('down')).mockResolvedValueOnce({ categories: [category] });

    render(<CategoriesClient />);

    const retry = await screen.findByRole('button', { name: /try again/i });
    fireEvent.click(retry);

    expect(await screen.findByText('Movies')).toBeInTheDocument();
    expect(apiFetchMock).toHaveBeenCalledTimes(2);
  });
});
