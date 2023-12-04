import { useState } from "react";

import { RadioWithOptions } from "~/components/radio-with-options";

const tokenFilterOptions = [
  {
    value: "my",
    label: "My Tokens",
  },
  {
    value: "all",
    label: "All Tokens",
  },
];

export const MyAllRadio = () => {
  const [selected, setSelected] = useState(tokenFilterOptions[0].value);

  return (
    <RadioWithOptions
      mode="primary"
      variant="large"
      value={selected}
      onChange={setSelected}
      options={tokenFilterOptions}
    />
  );
};
