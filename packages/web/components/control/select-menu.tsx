import classNames from "classnames";
import { useRef } from "react";
import { useState } from "react";
import { FunctionComponent } from "react";
import { useClickAway } from "react-use";

import { Icon } from "~/components/assets";
import { MenuDropdown } from "~/components/control";
import { MenuSelectProps } from "~/components/control/types";
import { Disableable } from "~/components/types";
import { useWindowSize } from "~/hooks";
import { useControllableState } from "~/hooks/use-controllable-state";
import { MenuOptionsModal } from "~/modals";

interface Props extends MenuSelectProps, Disableable {
  placeholder?: string;
  classes?: Record<"container", string>;
}

export const SelectMenu: FunctionComponent<Props> = ({
  options,
  selectedOptionId: selectedOptionIdProp,
  defaultSelectedOptionId,
  onSelect: onSelectProp,
  disabled,
  classes,
  placeholder,
}) => {
  const [selectedOptionId, setSelectedOptionId] = useControllableState({
    defaultValue:
      options.find((option) => option.id === defaultSelectedOptionId)?.id ?? "",
    value: selectedOptionIdProp,
    onChange: onSelectProp,
  });
  const containerRef = useRef(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const { isMobile } = useWindowSize();

  useClickAway(containerRef, () => setIsDropdownOpen(false));

  const selectedItem = options.find((option) => option.id === selectedOptionId);

  const onSelect = (optionId: string) => {
    setSelectedOptionId(optionId);
    setIsDropdownOpen(false);
  };

  return (
    <div
      className={classNames(
        "relative flex shrink-0 cursor-pointer items-center justify-center px-6 text-sm transition-colors",
        isDropdownOpen
          ? "rounded-t-xl border-x border-t border-osmoverse-600"
          : "rounded-xl border border-osmoverse-500 hover:border-2 hover:border-osmoverse-200 hover:px-[23px]",
        selectedOptionIdProp ? "text-rust-200" : "text-osmoverse-200",
        classes?.container
      )}
      onClick={(e) => {
        e.stopPropagation();
        if (!disabled) {
          setIsDropdownOpen(!isDropdownOpen);
        }
      }}
      ref={containerRef}
    >
      <div
        className={classNames("flex w-fit", {
          "cursor-default opacity-50": disabled,
        })}
      >
        <button
          className="flex items-center"
          onClick={(e) => {
            e.stopPropagation();
            if (!disabled) {
              setIsDropdownOpen(!isDropdownOpen);
            }
          }}
        >
          <span className="body2 m-auto mr-2 block select-none overflow-hidden text-ellipsis whitespace-nowrap text-center capitalize leading-loose">
            {selectedItem?.display ?? placeholder}
          </span>
          <Icon
            className="flex shrink-0 items-center text-osmoverse-200"
            id={isDropdownOpen ? "chevron-up" : "chevron-down"}
            height={isMobile ? 12 : 16}
            width={isMobile ? 12 : 16}
          />
        </button>
      </div>
      {isMobile ? (
        <MenuOptionsModal
          title={selectedItem?.display ?? placeholder}
          selectedOptionId={selectedOptionId}
          options={options}
          isOpen={isDropdownOpen}
          onRequestClose={() => setIsDropdownOpen(false)}
          onSelectMenuOption={onSelect}
        />
      ) : (
        <MenuDropdown
          className="top-full -left-px w-[calc(100%_+_2px)]"
          options={options}
          selectedOptionId={selectedOptionId}
          onSelect={onSelect}
          isOpen={isDropdownOpen}
        />
      )}
    </div>
  );
};
