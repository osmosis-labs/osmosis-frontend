import { RadioGroup } from "@headlessui/react";
import { useState } from "react";

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
    <RadioGroup
      className={
        "inline-flex max-h-10 min-w-[290px] items-center rounded-xl bg-[#140F34]"
      }
      value={selected}
      onChange={setSelected}
    >
      {rewardTypes.map(({ label, value }) => (
        <RadioGroup.Option
          key={`${value} radio button`}
          className={({ checked }) =>
            `inline-flex h-10 w-full items-center justify-center rounded-lg py-2.5 font-subtitle1 leading-5 opacity-30 hover:cursor-pointer ${
              checked ? "bg-osmoverse-700 opacity-100" : "hover:bg-[#140F34]/25"
            }`
          }
          value={value}
        >
          {label}
        </RadioGroup.Option>
      ))}
    </RadioGroup>
  );
};
