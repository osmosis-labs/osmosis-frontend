import { Listbox, Transition } from "@headlessui/react";
import { Fragment } from "react";

import { Icon } from "~/components/assets";

interface Option {
  id: number;
  name: string;
}

interface DropdownWithLabelProps {
  label: string;
  values: Option[];
  value: Option;
  setValue: (v: Option) => void;
}

export const DropdownWithLabel = ({
  label,
  setValue,
  value,
  values,
}: DropdownWithLabelProps) => {
  return (
    <div className="flex items-center gap-7">
      <span className="text-base font-subtitle1 font-bold">{label}</span>
      <Listbox value={value} onChange={setValue}>
        <div className="relative">
          <Listbox.Button className="inline-flex min-w-[200px] items-center justify-between rounded-lg border-2 border-wosmongton-100 border-opacity-20 bg-osmoverse-900 py-3 px-5">
            <span className="text-base font-subtitle1 leading-6">
              {value.name}
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
                "absolute inset-x-0 mt-1 flex flex-col gap-2 rounded-lg bg-osmoverse-800 py-4"
              }
            >
              {values.map((value) => (
                <Listbox.Option
                  className={({ active }) =>
                    `relative cursor-default select-none py-2 pl-10 pr-4 ${
                      active ? "bg-osmoverse-825" : ""
                    }`
                  }
                  key={value.id}
                  value={value}
                >
                  {({ selected }) => (
                    <>
                      <span className={`block truncate`}>{value.name}</span>
                      {selected ? (
                        <span className="absolute inset-y-0 left-0 flex items-center pl-3">
                          <Icon id="check-mark" className="h-4 w-4" />
                        </span>
                      ) : null}
                    </>
                  )}
                </Listbox.Option>
              ))}
            </Listbox.Options>
          </Transition>
        </div>
      </Listbox>
    </div>
  );
};
