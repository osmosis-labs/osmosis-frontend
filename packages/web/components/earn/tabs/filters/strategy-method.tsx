import { useState } from "react";

import { DropdownWithLabel } from "~/components/earn/abstracts/dropdown-with-label";

const strategies = [
  { id: 1, name: "All" },
  { id: 2, name: "LP" },
  { id: 3, name: "Perp LP" },
  { id: 4, name: "Vaults" },
  { id: 5, name: "Lending" },
  { id: 6, name: "Staking" },
];

export const StrategyMethod = () => {
  const [selectedStrategy, setSelectedStrategy] = useState(strategies[0]);

  return (
    <DropdownWithLabel
      label="Strategy Method"
      values={strategies}
      value={selectedStrategy}
      setValue={setSelectedStrategy}
    />
  );
};
