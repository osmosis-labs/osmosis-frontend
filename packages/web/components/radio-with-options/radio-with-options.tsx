import { RadioGroup } from "@headlessui/react";
import classNames from "classnames";

type RadioVariant = "small" | "large";
type RadioMode = "primary" | "secondary";

interface RadioOptions {
  value: string;
  label: string;
}

interface RadioWithOptionsProps {
  value: string;
  onChange: (e: string) => void;
  variant: RadioVariant;
  mode: RadioMode;
  options: RadioOptions[];
}

export const RadioWithOptions = ({
  onChange,
  value,
  variant,
  mode,
  options,
}: RadioWithOptionsProps) => {
  return (
    <RadioGroup
      value={value}
      onChange={onChange}
      className={classNames(
        "inline-flex min-w-multi-radio items-center rounded-xl bg-osmoverse-900",
        {
          "max-h-10": variant === "small",
          "max-h-13": variant === "large",
        }
      )}
    >
      {options.map(({ label, value }) => (
        <RadioGroup.Option
          key={`${value} radio button`}
          className={({ checked }) =>
            classNames(
              "inline-flex h-10 w-full items-center justify-center rounded-lg py-2.5 font-subtitle1 leading-5 opacity-30 hover:cursor-pointer",
              {
                "opacity-100": checked,
                "hover:bg-osmoverse-900/25": !checked,
              },
              {
                "bg-wosmongton-700": mode === "primary" && checked,
                "bg-osmoverse-700": mode === "secondary" && checked,
              },
              {
                "h-13": variant === "large",
                "h-10": variant === "small",
              }
            )
          }
          value={value}
        >
          {label}
        </RadioGroup.Option>
      ))}
    </RadioGroup>
  );
};
