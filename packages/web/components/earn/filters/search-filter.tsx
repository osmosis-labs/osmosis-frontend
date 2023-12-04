import { useContext } from "react";

import { FilterContext } from "~/components/earn/filters/context/filter-context";
import { SearchBox } from "~/components/input";

export const SearchFilter = () => {
  const {
    setFilter,
    filters: { search },
  } = useContext(FilterContext);

  return (
    <SearchBox
      onInput={(value) => setFilter("search", String(value))}
      currentValue={search ?? ""}
      placeholder="Search"
      size={"full"}
    />
  );
};
