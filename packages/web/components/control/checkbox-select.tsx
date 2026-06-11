import { Menu, MenuButton, MenuItem, MenuItems } from "@headlessui/react";
import { noop } from "@osmosis-labs/utils";
import classNames from "classnames";
import { FunctionComponent } from "react";

import { Checkbox } from "~/components/ui/checkbox";
import { useWindowSize } from "~/hooks";

import { Icon } from "../assets";
import { MenuSelectProps } from "./types";

export const CheckboxSelect: FunctionComponent<
  {
    label: string;
    selectedOptionIds?: string[];
    showDeselectAll?: boolean;
    menuItemsClassName?: string;
    buttonClassName?: string;
    atLeastOneSelected?: boolean;
  } & Omit<MenuSelectProps, "selectedOptionId" | "defaultSelectedOptionId">
> = ({
  label,
  selectedOptionIds,
  options,
  onSelect,
  menuItemsClassName,
  buttonClassName,
  atLeastOneSelected = false,
}) => {
  const { isMobile } = useWindowSize();

  return (
    <Menu>
      {({ open }) => (
        <>
          <MenuButton
            // px-[11px] on hover/open is border-2 compensation: the border
            // grows from 1px to 2px, so padding drops 1px each side to keep
            // the button width (and label position) from shifting.
            className={classNames(
              "relative flex h-10 shrink-0 cursor-pointer items-center justify-center gap-2 rounded-xl px-3 text-sm transition-colors md:w-full",
              "border border-osmoverse-500 hover:border-2 hover:border-osmoverse-200 hover:px-[11px]",
              open &&
                "border-2 border-osmoverse-200 px-[11px] text-osmoverse-200",
              buttonClassName
            )}
          >
            {label}
            <Icon
              className="flex shrink-0 items-center text-osmoverse-200"
              id={open ? "chevron-up" : "chevron-down"}
              height={isMobile ? 12 : 16}
              width={isMobile ? 12 : 16}
            />
          </MenuButton>

          <MenuItems
            className={classNames(
              "[--anchor-gap:8px] z-[1000] flex w-max select-none flex-col overflow-hidden rounded-xl border border-osmoverse-700 bg-osmoverse-800 text-left",
              menuItemsClassName
            )}
            anchor="bottom end"
          >
            {options.map(({ id, display }, index) => {
              return (
                <MenuItem key={id}>
                  <button
                    className={classNames(
                      "flex cursor-pointer items-center gap-3 px-4 py-2 text-left text-osmoverse-200 transition-colors data-[active]:bg-osmoverse-700",
                      {
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
                </MenuItem>
              );
            })}
          </MenuItems>
        </>
      )}
    </Menu>
  );
};
