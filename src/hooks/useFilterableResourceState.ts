import { useState, useMemo, Dispatch, SetStateAction } from "react";

export default function useFilterableResourceState<T>(
  defaultState: T[] | undefined
): {
  items: T[] | undefined;
  setItems: Dispatch<SetStateAction<T[] | undefined>>;
  filter: string | undefined;
  setFilter: Dispatch<SetStateAction<string | undefined>>;
  filteredItems: T[] | undefined;
} {
  const [items, setItems] = useState<T[] | undefined>(defaultState);
  const [filter, setFilter] = useState<string | undefined>(undefined);

  const filteredItems = useMemo(() => {
    if (filter === undefined) return undefined;
    return items?.filter((item) =>
      JSON.stringify(item).toLowerCase().includes(filter.toLowerCase())
    );
  }, [items, filter]);

  return {
    items,
    setItems,
    filter,
    setFilter,
    filteredItems,
  };
}
