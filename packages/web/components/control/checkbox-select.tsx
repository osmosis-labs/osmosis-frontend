import { Menu } from "@headlessui/react";
import classNames from "classnames";
import { FunctionComponent } from "react";

import { Checkbox } from "~/components/ui/checkbox";
import { useWindowSize } from "~/hooks";
import { noop } from "~/utils/function";

import { Icon } from "../assets";
import { MenuSelectProps } from "./types";

export const CheckboxSelect: FunctionComponent<
  {
    label: string;
    selectedOptionIds?: string[];
    showDeselectAll?: boolean;
    menuItemsClassName?: string;
    atLeastOneSelected?: boolean;
  } & Omit<MenuSelectProps, "selectedOptionId" | "defaultSelectedOptionId">
> = ({
  label,
  selectedOptionIds,
  options,
  onSelect,
  menuItemsClassName,
  atLeastOneSelected = false,
}) => {
  const { isMobile } = useWindowSize();

  return (
    <Menu>
      {({ open }) => (
        <div className="relative">
          <Menu.Button
            className={classNames(
              "relative flex h-10 shrink-0 cursor-pointer items-center justify-center gap-2 rounded-xl px-6 text-sm transition-colors md:w-full",
              "border border-osmoverse-500 hover:border-2 hover:border-osmoverse-200 hover:px-[23px]",
              open &&
                "border-2 border-osmoverse-200 px-[23px] text-osmoverse-200"
            )}
          >
            {label}
            <Icon
              className="flex shrink-0 items-center text-osmoverse-200"
              id={open ? "chevron-up" : "chevron-down"}
              height={isMobile ? 12 : 16}
              width={isMobile ? 12 : 16}
            />
          </Menu.Button>

          <Menu.Items
            className={classNames(
              "absolute -left-px top-full z-[1000] mt-2 flex w-max select-none flex-col overflow-hidden rounded-xl border border-osmoverse-700 bg-osmoverse-800 text-left",
              menuItemsClassName
            )}
          >
            {options.map(({ id, display }, index) => {
              return (
                <Menu.Item key={id}>
                  {({ active }) => (
                    <button
                      className={classNames(
                        "flex cursor-pointer items-center gap-3 px-4 py-2 text-left text-osmoverse-200 transition-colors",
                        {
                          "hover:bg-osmoverse-700": active,
                          "rounded-b-xlinset": index === options.length - 1,
                        }
                      )}
                      disabled={
                        atLeastOneSelected &&
                        selectedOptionIds?.length === 1 &&
                        selectedOptionIds?.includes(id)
                      }
                      onClick={(e) => {
                        e.preventDefault();
                        onSelect(id);
                      }}
                    >
                      <Checkbox
                        checked={Boolean(selectedOptionIds?.includes(id))}
                        onClick={noop}
                        disabled={
                          atLeastOneSelected &&
                          selectedOptionIds?.length === 1 &&
                          selectedOptionIds?.includes(id)
                        }
                      />
                      <span>{display}</span>
                    </button>
                  )}
                </Menu.Item>
              );
            })}
          </Menu.Items>
        </div>
      )}
    </Menu>
  );
};
