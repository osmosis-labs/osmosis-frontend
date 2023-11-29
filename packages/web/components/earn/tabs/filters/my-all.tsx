import { RadioGroup } from "@headlessui/react";
import { useState } from "react";

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

export const MyAllSwitch = () => {
  const [selected, setSelected] = useState(tokenFilterOptions[0].value);

  return (
    <RadioGroup
      className={
        "inline-flex max-h-[52px] min-w-[290px] items-center rounded-xl bg-[#140F34]"
      }
      value={selected}
      onChange={setSelected}
    >
      {tokenFilterOptions.map(({ label, value }) => (
        <RadioGroup.Option
          key={`${value} radio button`}
          className={({ checked }) =>
            `inline-flex h-13 w-full items-center justify-center rounded-lg py-2.5 font-subtitle1 leading-5 opacity-30 hover:cursor-pointer ${
              checked
                ? "bg-wosmongton-700 opacity-100"
                : "hover:bg-[#140F34]/25"
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
