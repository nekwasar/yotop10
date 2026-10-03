import type { Metadata } from 'next';
import UsernameHistoryClient from './client';

export const metadata: Metadata = {
  robots: { index: false, follow: true },
};

export default function UsernameHistoryPage() {
  return <UsernameHistoryClient />;
}
