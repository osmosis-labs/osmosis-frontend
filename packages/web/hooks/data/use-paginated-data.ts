import { useEffect, useMemo, useState } from "react";

/**
 * Generic hook to allow a user to paginate through an array of data.
 * Tested in conjunction with the `<PageList />` component.
 * Guarantees `currentPage` will always be within `minPage` and `maxPage` inclusive.
 * Note: `minPage === maxPage === 0` iff `data.length === 0`.
 *
 * @param data Data to paginate through.
 * @param pageSize Number of data per page.
 * @param initialPage Page to start on.
 * @returns [currentPage (1,2,3,...), setPage (1,2,3...) => void, minPage, maxPag, dataPage]
 */
export function usePaginatedData<TData>(
  data: TData[],
  pageSize: number,
  initialPage: number = 0
): [number, (page: number) => void, number, number, TData[]] {
  const [page, setPage] = useState(initialPage);
  const curPageStart = page * pageSize;
  const maxPages = Math.ceil(data.length / pageSize);

  useEffect(() => {
    if (maxPages > 0 && page + 1 > maxPages) {
      setPage(maxPages - 1);
    }
  }, [maxPages, page]);

  const slicedData = useMemo(
    () => data.slice(curPageStart, curPageStart + pageSize),
    [data, curPageStart, pageSize]
  );

  return [
    Math.min(page + 1, maxPages),
    (page: number) => setPage(page - 1),
    Math.min(1, maxPages),
    maxPages,
    slicedData,
  ];
}
