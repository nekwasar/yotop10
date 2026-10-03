import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render } from '@testing-library/react';
import React from 'react';

const mockGetPost = vi.fn();
const mockGetComments = vi.fn();

vi.mock('@/lib/api', () => ({
  API: {
    getPost: (...args: unknown[]) => mockGetPost(...args),
    getComments: (...args: unknown[]) => mockGetComments(...args),
  },
}));

vi.mock('./client', () => ({
  default: () => null,
}));

import PostDetailPage, { generateMetadata } from './page';

const basePost = {
  id: '64b000000000000000000001',
  slug: 'top-10-coffee-shops',
  title: 'Top 10 Coffee Shops',
  post_type: 'top_list',
  intro: 'Ranked after 40 visits across three cities.',
  comment_count: 1,
  view_count: 120,
  author_username: 'a_cyprianzube',
  author_display_name: 'Cyprian',
  category_slug: 'food',
  category_name: 'Food & Drink',
  created_at: '2026-10-01T00:00:00.000Z',
  status: 'approved',
  deleted: false,
  hero_image_url: null,
};

const baseComment = {
  id: 'c1',
  content: 'Great list!',
  depth: 0,
  fire_count: 1,
  reply_count: 0,
  spark_score: 1.5,
  author_username: 'a_dbb4_aed5',
  author_display_name: 'a_dbb4_aed5',
  created_at: '2026-10-02T00:00:00.000Z',
};

function renderPage(comments: unknown[]) {
  mockGetPost.mockResolvedValue({ post: basePost, items: [] });
  mockGetComments.mockResolvedValue({ comments, total: comments.length });

  return PostDetailPage({ params: Promise.resolve({ slug: basePost.slug }) }).then(node => {
    render(node as React.ReactElement);
    return Array.from(document.querySelectorAll('script[type="application/ld+json"]')).map(
      script => script.textContent || '',
    );
  });
}

describe('post page discussion structured data', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    document.querySelectorAll('script[type="application/ld+json"]').forEach(node => node.remove());
  });

  it('emits DiscussionForumPosting with the visible comments', async () => {
    const blocks = await renderPage([baseComment]);

    const discussion = blocks.find(block => block.includes('DiscussionForumPosting'));
    expect(discussion).toBeDefined();

    const parsed = JSON.parse(discussion!);
    expect(parsed['@type']).toBe('DiscussionForumPosting');
    expect(parsed.comment).toHaveLength(1);
    expect(parsed.comment[0].text).toBe('Great list!');
    expect(parsed.author.name).toBe('Cyprian');
  });

  it('emits no discussion markup on a comment-less post', async () => {
    const blocks = await renderPage([]);

    expect(blocks.some(block => block.includes('DiscussionForumPosting'))).toBe(false);
  });

  it('emits no discussion markup when every comment body is blank', async () => {
    const blocks = await renderPage([{ ...baseComment, content: '   ' }]);

    expect(blocks.some(block => block.includes('DiscussionForumPosting'))).toBe(false);
  });

  it('marks up only depth-0 roots and their replies, matching the rendered thread', async () => {
    const blocks = await renderPage([
      { ...baseComment, replies: [{ ...baseComment, id: 'c2', depth: 1, content: 'Reply body' }] },
      { ...baseComment, id: 'c3', depth: 1, content: 'Orphan reply' },
    ]);

    const parsed = JSON.parse(blocks.find(block => block.includes('DiscussionForumPosting'))!);
    expect(parsed.comment.map((c: { text: string }) => c.text)).toEqual([
      'Great list!',
      'Reply body',
    ]);
    expect(parsed.commentCount).toBe(2);
  });
});

describe('ai_assisted disclosure (D3)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('post metadata is identical with and without ai_assisted', async () => {
    const params = () => Promise.resolve({ slug: basePost.slug });

    mockGetPost.mockResolvedValue({ post: { ...basePost, ai_assisted: true }, items: [] });
    const withFlag = await generateMetadata({ params: params() });

    mockGetPost.mockResolvedValue({ post: { ...basePost, ai_assisted: false }, items: [] });
    const withoutFlag = await generateMetadata({ params: params() });

    expect(withFlag).toEqual(withoutFlag);
  });

  it('metadata is identical for legacy posts that predate the field', async () => {
    const params = () => Promise.resolve({ slug: basePost.slug });

    mockGetPost.mockResolvedValue({ post: { ...basePost, ai_assisted: true }, items: [] });
    const withFlag = await generateMetadata({ params: params() });

    mockGetPost.mockResolvedValue({ post: basePost, items: [] });
    const legacy = await generateMetadata({ params: params() });

    expect(withFlag).toEqual(legacy);
  });
});
