import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { AssistedBadge } from './AssistedBadge';

describe('AssistedBadge', () => {
  it('renders nothing when ai_assisted is false', () => {
    const { container } = render(<AssistedBadge aiAssisted={false} />);
    expect(container.firstChild).toBeNull();
  });

  it('renders nothing when ai_assisted is absent (legacy content)', () => {
    const { container } = render(<AssistedBadge />);
    expect(container.firstChild).toBeNull();
  });

  it('renders the disclosure when ai_assisted is true', () => {
    render(<AssistedBadge aiAssisted={true} />);
    expect(screen.getByTestId('assisted-badge')).toHaveTextContent('AI-assisted');
  });
});
