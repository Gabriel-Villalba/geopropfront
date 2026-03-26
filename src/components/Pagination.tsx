interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export function Pagination({ currentPage, totalPages, onPageChange }: PaginationProps) {
  if (totalPages <= 1) return null;

  const maxVisibleNumbers = 10;
  const getPageItems = () => {
    if (totalPages <= maxVisibleNumbers) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }
    const items: Array<number | 'ellipsis'> = [];
    const middleCount = Math.max(1, maxVisibleNumbers - 2);
    let start = Math.max(2, currentPage - Math.floor(middleCount / 2));
    let end = start + middleCount - 1;
    if (end >= totalPages) { end = totalPages - 1; start = Math.max(2, end - middleCount + 1); }
    items.push(1);
    if (start > 2) items.push('ellipsis');
    for (let page = start; page <= end; page++) items.push(page);
    if (end < totalPages - 1) items.push('ellipsis');
    items.push(totalPages);
    return items;
  };

  return (
    <div className="mt-10 flex items-center justify-center gap-1.5">
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage <= 1}
        className="w-9 h-9 flex items-center justify-center rounded-xl border border-gray-200 text-ink-muted hover:border-brand-300 hover:text-brand-600 hover:bg-brand-50 disabled:opacity-30 disabled:cursor-not-allowed transition-all text-base"
      >
        ‹
      </button>

      {getPageItems().map((item, index) =>
        item === 'ellipsis' ? (
          <span key={`e-${index}`} className="w-9 h-9 flex items-center justify-center text-ink-faint text-sm">
            …
          </span>
        ) : (
          <button
            key={item}
            onClick={() => onPageChange(item)}
            className={`w-9 h-9 flex items-center justify-center rounded-xl text-sm font-medium transition-all ${
              item === currentPage
                ? 'bg-brand-500 text-white shadow-sm'
                : 'text-ink-muted hover:bg-surface-muted hover:text-ink'
            }`}
          >
            {item}
          </button>
        )
      )}

      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage >= totalPages}
        className="w-9 h-9 flex items-center justify-center rounded-xl border border-gray-200 text-ink-muted hover:border-brand-300 hover:text-brand-600 hover:bg-brand-50 disabled:opacity-30 disabled:cursor-not-allowed transition-all text-base"
      >
        ›
      </button>
    </div>
  );
}
