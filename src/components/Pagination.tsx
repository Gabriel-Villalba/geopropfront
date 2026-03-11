interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export function Pagination({
  currentPage,
  totalPages,
  onPageChange,
}: PaginationProps) {
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

    if (end >= totalPages) {
      end = totalPages - 1;
      start = Math.max(2, end - middleCount + 1);
    }

    items.push(1);
    if (start > 2) items.push('ellipsis');
    for (let page = start; page <= end; page += 1) {
      items.push(page);
    }
    if (end < totalPages - 1) items.push('ellipsis');
    items.push(totalPages);

    return items;
  };

  return (
    <div className="mt-10 flex items-center justify-center gap-3">
      {/* PREV */}
      {currentPage > 1 && (
        <button
          onClick={() => onPageChange(currentPage - 1)}
          className="flex h-12 w-12 text-xl items-center justify-center rounded-full border border-black hover:bg-gray-300"
        >
          &#x2039;
        </button>
      )}

      {/* NUMEROS */}
      {getPageItems().map((item, index) => {
        if (item === 'ellipsis') {
          return (
            <span key={`ellipsis-${index}`} className="px-2 text-gray-400">
              ...
            </span>
          );
        }
        const page = item;
        return (
          <button
            key={page}
            onClick={() => onPageChange(page)}
            className={`flex h-12 w-12 items-center justify-center rounded-full text-sm font-semibold transition
              ${
                page === currentPage
                  ? 'border-2 border-orange-500 text-gray-900'
                  : 'text-gray-500 hover:bg-gray-200 hover:text-gray-900'
              }
            `}
          >
            {page}
          </button>
        );
      })}

      {/* NEXT */}
      {currentPage < totalPages && (
        <button
          onClick={() => onPageChange(currentPage + 1)}
          className="flex h-12 w-12 text-xl items-center justify-center rounded-full border border-black hover:bg-gray-300"
        >
          &#x203A;
        </button>
      )}
    </div>
  );
}