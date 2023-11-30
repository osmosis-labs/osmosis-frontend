import { useState } from "react";

import { SearchBox } from "~/components/input";

export const SearchFilter = () => {
  const [query, setQuery] = useState("");
  return (
    <SearchBox
      onInput={setQuery}
      currentValue={query}
      defaultValue=""
      placeholder="Search"
      size={"full"}
    />
  );
};
