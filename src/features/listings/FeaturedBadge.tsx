import { Star } from 'lucide-react';

interface FeaturedBadgeProps {
  isFeatured: boolean;
  className?: string;
}

export function FeaturedBadge({ isFeatured, className }: FeaturedBadgeProps) {
  if (!isFeatured) return null;

  return (
    <span
      className={`inline-flex items-center rounded-full border border-amber-300 bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-700 ${className ?? ''}`}
    >
      <Star className="mr-1 h-3.5 w-3.5" />
      Destacado
    </span>
  );
}
