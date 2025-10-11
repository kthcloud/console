import { useState, useMemo, Dispatch, SetStateAction, useEffect } from "react";

export const DEFAULT_PAGESIZE = 10;

export default function useFilterableResourceState<T>(
  defaultState: T[] | undefined
): {
  items: T[] | undefined;
  setItems: Dispatch<SetStateAction<T[] | undefined>>;
  filter: string | undefined;
  setFilter: Dispatch<SetStateAction<string | undefined>>;
  filteredItems: T[] | undefined;
  page: number;
  setPage: Dispatch<SetStateAction<number>>;
  pageSize: number;
  setPageSize: Dispatch<SetStateAction<number>>;
} {
  const [items, setItems] = useState<T[] | undefined>(defaultState);
  const [filter, setFilter] = useState<string | undefined>(undefined);
  const [page, setPage] = useState<number>(0);
  const [pageSize, setPageSize] = useState<number>(DEFAULT_PAGESIZE);

  const filteredItems = useMemo(() => {
    if (filter === undefined) return undefined;
    return items?.filter((item) =>
      JSON.stringify(item).toLowerCase().includes(filter.toLowerCase())
    );
  }, [items, filter]);

  useEffect(() => {
    if (page !== 0) {
      setPage(0);
    }
  }, [filter]);

  return {
    items,
    setItems,
    filter,
    setFilter,
    filteredItems,
    page,
    setPage,
    pageSize,
    setPageSize,
  };
}
