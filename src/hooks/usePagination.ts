import { useEffect, useMemo, useState } from 'react';

export function usePagination<T>(items: T[], pageSize = 6) {
  const [currentPage, setCurrentPage] = useState(1);

  // 🔥 Resetear a página 1 cuando cambian los resultados
  useEffect(() => {
    setCurrentPage(1);
  }, [items]);

  const totalCount = items.length;
  const totalPages = Math.ceil(totalCount / pageSize);

  const visibleItems = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    const end = start + pageSize;
    return items.slice(start, end);
  }, [items, currentPage, pageSize]);

  const goToPage = (page: number) => {
    if (page < 1 || page > totalPages) return;
    setCurrentPage(page);
  };

  return {
    visibleItems,
    currentPage,
    totalPages,
    totalCount,
    goToPage,
  };
}
