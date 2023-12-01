import { useContext } from "react";

import { FilterContext } from "~/components/earn/filters/context/filter-context";
import { SearchBox } from "~/components/input";

export const SearchFilter = () => {
  const {
    globalFilter: { value: query, set: setQuery },
  } = useContext(FilterContext);

  return (
    <SearchBox
      onInput={(value) => setQuery(String(value))}
      currentValue={query ?? ""}
      placeholder="Search"
      size={"full"}
    />
  );
};
