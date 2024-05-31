import { Listbox, Transition } from "@headlessui/react";
import * as Checkbox from "@radix-ui/react-checkbox";
import { CheckIcon } from "@radix-ui/react-icons";
import classNames from "classnames";
import { Fragment, ReactNode } from "react";

import { Icon } from "~/components/assets";
import { ListOption } from "~/components/earn/table/types/filters";

interface DropdownWithLabelProps<T> {
  label: ReactNode;
  options: ListOption<T>[];
  value: ListOption<T>[];
  onChange: (v: ListOption<T>) => void;
  allLabel?: string;
  buttonClassName?: string;
}

export const DropdownWithLabel = <T,>({
  label,
  onChange,
  value,
  options,
  buttonClassName,
  allLabel,
}: DropdownWithLabelProps<T>) => {
  return (
    <div className="flex items-center gap-7">
      <span className="whitespace-nowrap font-subtitle1 font-bold 2xl:hidden">
        {label}
      </span>
      <Listbox value={options} onChange={() => {}} multiple>
        <div className="relative flex w-full">
          <Listbox.Button
            className={classNames(
              "inline-flex min-w-dropdown-with-label items-center justify-between rounded-lg border-2 border-wosmongton-100 border-opacity-20 bg-osmoverse-900 px-5 py-3 xl:min-w-0",
              buttonClassName
            )}
          >
            <span className="max-w-[100px] truncate font-subtitle1 leading-6 sm:max-w-none">
              {value && value.length === options.length && allLabel}
              {value &&
                value.length < options.length &&
                value.map(({ label }) => label).join(", ")}
            </span>
            <Icon id="caret-down" />
          </Listbox.Button>
          <Transition
            as={Fragment}
            enter="transition ease-in duration-150"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="transition ease-in duration-150"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <Listbox.Options
              className={
                "absolute inset-x-0 z-[51] mt-13 flex flex-col gap-2 rounded-lg bg-osmoverse-800 py-4"
              }
            >
              {options.map((option, i) => (
                <Listbox.Option
                  className={({ active }) =>
                    classNames(
                      "relative inline-flex cursor-default select-none items-center gap-3 px-4 py-2",
                      {
                        "bg-osmoverse-825": active,
                      }
                    )
                  }
                  onClick={() => onChange(option)}
                  key={option.value as unknown as string}
                  value={option.value}
                >
                  <Checkbox.Root
                    id={`c${i}`}
                    className="relative flex h-5 w-5 items-center justify-center rounded-md border-2 border-osmoverse-400"
                    checked={
                      value.findIndex(
                        (value) => value.value === option.value
                      ) !== -1
                    }
                  >
                    <Checkbox.Indicator className="inset-0 rounded-md bg-osmoverse-400">
                      <CheckIcon className="h-5 w-5 text-osmoverse-850" />
                    </Checkbox.Indicator>
                  </Checkbox.Root>
                  <label
                    htmlFor={`c${i}`}
                    className="pointer-events-none block truncate capitalize"
                  >
                    {option.label}
                  </label>
                </Listbox.Option>
              ))}
            </Listbox.Options>
          </Transition>
        </div>
      </Listbox>
    </div>
  );
};
