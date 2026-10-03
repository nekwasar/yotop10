import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';

vi.mock('next/link', () => ({
  default: ({ href, children, ...rest }: { href: string; children: React.ReactNode }) => (
    <a href={href} {...rest}>
      {children}
    </a>
  ),
}));

import CommunityGuidelinesPage, { metadata } from './page';

describe('Community Guidelines page', () => {
  it('is indexable and follows links', () => {
    expect(metadata.robots).toEqual({ index: true, follow: true });
  });

  it('describes itself for search results', () => {
    expect(metadata.title).toBe('Community Guidelines');
    expect(metadata.description).toContain('how to report content');
  });

  it('links back to the docs index', () => {
    render(<CommunityGuidelinesPage />);
    expect(screen.getByRole('link', { name: /Back to Docs/ })).toHaveAttribute('href', '/docs');
  });

  it('covers spam, moderation, anonymity, AI disclosure and reporting', () => {
    render(<CommunityGuidelinesPage />);

    expect(screen.getByRole('heading', { name: /Anti-Spam Rules/ })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /Moderation Rules/ })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /Anonymity and Accountability/ })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /AI-Assisted Content/ })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /How to Report Content/ })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /Consequences of Abuse/ })).toBeInTheDocument();
  });

  it('tells readers reporters stay confidential and self-reports are blocked', () => {
    render(<CommunityGuidelinesPage />);

    expect(screen.getByText(/Reporters stay confidential/)).toBeInTheDocument();
    expect(screen.getByText(/you cannot report your own content/)).toBeInTheDocument();
    expect(screen.getByText(/must mark AI-assisted content/)).toBeInTheDocument();
  });

  it('cross-links the Terms of Use and Privacy Policy', () => {
    render(<CommunityGuidelinesPage />);

    expect(screen.getByRole('link', { name: 'Terms of Use' })).toHaveAttribute('href', '/docs/terms');
    expect(screen.getByRole('link', { name: 'Privacy Policy' })).toHaveAttribute('href', '/docs/privacy');
  });
});
