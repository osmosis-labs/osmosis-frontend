import { Listbox, Transition } from "@headlessui/react";
import classNames from "classnames";
import { Fragment, type ReactNode } from "react";

import { Icon } from "~/components/assets";
import { ListOption } from "~/components/earn/table/types/filters";
import { InfoTooltip } from "~/components/tooltip";
import { Checkbox } from "~/components/ui/checkbox";

interface DropdownWithMultiSelectProps<T> {
  options: (ListOption<T> & { icon: ReactNode; tooltip?: string })[];
  stateValues: ListOption<T>[];
  label: string;
  toggleFn: (options: ListOption<T>) => void;
  containerClassName?: string;
}

export const DropdownWithMultiSelect = <T,>({
  options,
  toggleFn,
  containerClassName,
  stateValues,
  label,
}: DropdownWithMultiSelectProps<T>) => {
  return (
    <div className={classNames(containerClassName)}>
      <Listbox value={options} onChange={() => {}} multiple>
        <div className="relative w-full">
          <Listbox.Button className="relative z-50 inline-flex w-full min-w-dropdown-with-label items-center justify-between rounded-lg border-2 border-wosmongton-100 border-opacity-20 bg-osmoverse-900 py-3 px-5">
            {stateValues.length === 0 ? (
              <span
                className={classNames(
                  "text-base font-subtitle1 font-normal leading-6",
                  "text-osmoverse-400"
                )}
              >
                {label}
              </span>
            ) : (
              <div className="inline-flex items-center gap-1.5 overflow-hidden">
                {stateValues.map(({ label, value }) => (
                  <div
                    key={`${label} dropdown indicator`}
                    className={classNames(
                      "inline-flex items-center gap-0.5 overflow-hidden rounded-md bg-wosmongton-700 px-2"
                    )}
                  >
                    <span className="overflow-hidden whitespace-nowrap text-overline leading-6 tracking-normal text-white-high">
                      {label}
                    </span>
                    <Icon
                      id="close"
                      width={12}
                      height={12}
                      className="!h-3 !w-3"
                      onClick={() => toggleFn({ label, value })}
                    />
                  </div>
                ))}
              </div>
            )}

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
                "absolute inset-x-0 z-40 -mt-1 flex flex-col gap-2 rounded-b-lg border-2 border-wosmongton-100 border-opacity-20 bg-osmoverse-900 py-4"
              }
            >
              {options.map(({ icon, label, tooltip, value }) => (
                <Listbox.Option
                  className="relative cursor-default select-none py-3 px-4"
                  key={value as unknown as string}
                  value={value}
                >
                  <div className="flex w-full items-center justify-between gap-4">
                    <div className="inline-flex max-h-11 w-11 items-center justify-center rounded-lg bg-osmoverse-800 px-2 py-3">
                      {icon}
                    </div>
                    <small className="flex items-center gap-4 text-base text-osmoverse-200">
                      {label}

                      {tooltip && (
                        <InfoTooltip
                          trigger="mouseenter focus"
                          content={tooltip}
                        />
                      )}
                    </small>
                    <Checkbox
                      className="ml-auto"
                      checked={
                        stateValues.filter((f) => f.value === value).length !==
                        0
                      }
                      onClick={() => toggleFn({ label, value })}
                    />
                  </div>
                </Listbox.Option>
              ))}
            </Listbox.Options>
          </Transition>
        </div>
      </Listbox>
    </div>
  );
};
