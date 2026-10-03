import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { AuthorCard } from './AuthorCard';

describe('AuthorCard', () => {
  it('links the byline to the canonical profile and shows member since + history', () => {
    render(<AuthorCard username="a_dbb4_aed5" displayName="a_dbb4_aed5" memberSince="2026-10-01T00:00:00.000Z" />);

    const byline = screen.getByRole('link', { name: 'dbb4_aed5' });
    expect(byline).toHaveAttribute('href', '/a/dbb4_aed5');
    expect(screen.getByText(/Member since Oct 1, 2026/)).toBeInTheDocument();

    const history = screen.getByRole('link', { name: 'History' });
    expect(history).toHaveAttribute('href', '/a/dbb4_aed5#post-history');
  });

  it('keeps a custom display name while still linking the identity URL', () => {
    render(<AuthorCard username="a_dbb4_aed5" displayName="Cyprian" />);

    const byline = screen.getByRole('link', { name: 'Cyprian' });
    expect(byline).toHaveAttribute('href', '/a/dbb4_aed5');
    expect(screen.queryByText(/Member since/)).not.toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'History' })).toHaveAttribute('href', '/a/dbb4_aed5#post-history');
  });

  it('honours an explicit history target', () => {
    render(<AuthorCard username="cyprianzube" displayName="Cyprian" historyHref="/a/cyprianzube#posts" />);

    expect(screen.getByRole('link', { name: 'History' })).toHaveAttribute('href', '/a/cyprianzube#posts');
  });

  it('renders the trailing meta slot after the history link', () => {
    render(
      <AuthorCard
        username="cyprianzube"
        displayName="Cyprian"
        meta={<span>3 min read</span>}
      />,
    );

    expect(screen.getByText('3 min read')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'History' })).toBeInTheDocument();
  });
});
