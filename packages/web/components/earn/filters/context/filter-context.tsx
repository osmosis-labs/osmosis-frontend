import { createContext, PropsWithChildren, useState } from "react";

interface Filters {
  globalFilter: {
    value: string;
    set: (q: string) => void;
  };
}

export const FilterContext = createContext<Filters>({
  globalFilter: {
    value: "",
    set: () => {},
  },
});

export const FilterProvider = ({ children }: PropsWithChildren<unknown>) => {
  const [filters, setFilters] = useState({
    globalFilter: "",
  });

  return (
    <FilterContext.Provider
      value={{
        globalFilter: {
          value: filters.globalFilter,
          set: (q: string) => setFilters({ globalFilter: q }),
        },
      }}
    >
      {children}
    </FilterContext.Provider>
  );
};
