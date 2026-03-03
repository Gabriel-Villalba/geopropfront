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

  //const pages = Array.from({ length: totalPages }, (_, i) => i + 1);

  return (
   <div className="mt-10 flex items-center justify-center gap-3">

  {/* PREV */}
  {currentPage > 1 && (
    <button
      onClick={() => onPageChange(currentPage - 1)}
      className="flex h-12 w-12 text-xl items-center justify-center rounded-full border border-black hover:bg-gray-300"
    >
      ‹
    </button>
  )}

  {/* NÚMEROS */}
  {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
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
  ))}

  {/* NEXT */}
  {currentPage < totalPages && (
    <button
      onClick={() => onPageChange(currentPage + 1)}
      className="flex h-12 w-12 text-xl items-center justify-center rounded-full border border-black hover:bg-gray-300"
    >
      ›
    </button>
  )}
</div>

  );
}
