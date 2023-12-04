import { useState } from "react";

import { RadioWithOptions } from "~/components/radio-with-options";

const rewardTypes = [
  {
    value: "all",
    label: "All",
  },
  {
    value: "single",
    label: "Single",
  },
  {
    value: "multi",
    label: "Multi",
  },
];

export const RewardTypesRadio = () => {
  const [selected, setSelected] = useState(rewardTypes[0].value);

  return (
    <RadioWithOptions
      mode="secondary"
      variant="small"
      value={selected}
      onChange={setSelected}
      options={rewardTypes}
    />
  );
};
