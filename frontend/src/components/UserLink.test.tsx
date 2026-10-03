import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { UserLink, UGC_LINK_REL } from './UserLink';

describe('UserLink', () => {
  it('marks the link as user-generated and un-endorsed', () => {
    render(<UserLink href="https://example.com/a">Source</UserLink>);

    const anchor = screen.getByRole('link', { name: 'Source' });
    expect(anchor).toHaveAttribute('rel', UGC_LINK_REL);
    expect(anchor).toHaveAttribute('rel', 'ugc nofollow noopener noreferrer');
    expect(anchor).toHaveAttribute('target', '_blank');
    expect(anchor).toHaveAttribute('href', 'https://example.com/a');
  });

  it('keeps identity rel values such as me alongside the UGC ones', () => {
    render(
      <UserLink href="https://github.com/someone" extraRel="me">
        profile
      </UserLink>,
    );

    const rel = screen.getByRole('link', { name: 'profile' }).getAttribute('rel') ?? '';
    expect(rel.split(' ').sort()).toEqual(['me', 'nofollow', 'noopener', 'noreferrer', 'ugc'].sort());
  });

  it('never drops nofollow when a caller also passes rel', () => {
    render(
      <UserLink href="https://example.com" rel="sponsored">
        ad
      </UserLink>,
    );

    const rel = screen.getByRole('link', { name: 'ad' }).getAttribute('rel') ?? '';
    expect(rel).toContain('nofollow');
    expect(rel).toContain('ugc');
    expect(rel).toContain('sponsored');
  });

  it('passes through className and children untouched', () => {
    render(
      <UserLink href="https://example.com" className="text-sm" target="_self">
        <span>View Source</span>
      </UserLink>,
    );

    const anchor = screen.getByRole('link', { name: 'View Source' });
    expect(anchor).toHaveClass('text-sm');
    expect(anchor).toHaveAttribute('target', '_self');
  });
});
