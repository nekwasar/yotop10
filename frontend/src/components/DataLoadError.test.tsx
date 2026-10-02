import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { DataLoadError } from '@/components/DataLoadError';

describe('DataLoadError', () => {
  it('does not claim the list is empty', () => {
    render(<DataLoadError onRetry={() => {}} />);

    expect(screen.queryByText(/No .* yet/i)).toBeNull();
    expect(screen.getByRole('alert')).toBeInTheDocument();
  });

  it('invokes the retry handler', async () => {
    const onRetry = vi.fn();
    render(<DataLoadError onRetry={onRetry} />);

    fireEvent.click(screen.getByRole('button', { name: /retry/i }));

    await waitFor(() => expect(onRetry).toHaveBeenCalledTimes(1));
  });

  it('disables the button while retrying', () => {
    render(<DataLoadError onRetry={() => {}} retrying />);

    expect(screen.getByRole('button')).toBeDisabled();
    expect(screen.getByText('Retrying...')).toBeInTheDocument();
  });
});
