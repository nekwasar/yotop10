import { Icon } from '@/components/icons/Icon';

interface AssistedBadgeProps {
  aiAssisted?: boolean;
}

export function AssistedBadge({ aiAssisted }: AssistedBadgeProps) {
  if (!aiAssisted) return null;

  return (
    <span
      className="inline-flex items-center gap-1 rounded-full border border-blue-400/30 bg-blue-400/5 px-2.5 py-0.5 text-2xs font-mono text-blue-400"
      title="The author disclosed that AI tools helped draft this content"
      data-testid="assisted-badge"
    >
      <Icon name="Sparkles" size={11} />
      AI-assisted
    </span>
  );
}
