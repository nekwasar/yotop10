import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import CategoryFeedClient from './client';

vi.mock('@/lib/api', () => ({
  API: { getPosts: vi.fn().mockResolvedValue({ posts: [] }) },
}));

const category = {
  id: 'cat-1',
  name: 'Sports',
  slug: 'sports',
  description: 'Everything competitive',
  post_count: 3,
  children: [],
};

const baseProps = {
  slug: 'sports',
  initialCategory: category,
  initialHasMore: false,
};

describe('CategoryFeedClient', () => {
  it('shows a retry state instead of the empty state when the feed failed to load', () => {
    const { container } = render(
      <CategoryFeedClient {...baseProps} initialPosts={[]} initialPostsFailed />
    );

    expect(screen.getByRole('alert')).toBeInTheDocument();
    expect(screen.getByText("Couldn't load posts for this category")).toBeInTheDocument();
    expect(container.textContent).not.toContain('No posts yet in this category.');
  });

  it('keeps the real empty state when the feed loaded and is genuinely empty', () => {
    const { container } = render(
      <CategoryFeedClient {...baseProps} initialPosts={[]} />
    );

    expect(screen.getByText('No posts yet in this category.')).toBeInTheDocument();
    expect(container.querySelector('[role="alert"]')).toBeNull();
  });
});
