import classNames from "classnames";
import { FunctionComponent } from "react";

import { MenuOption } from "~/components/control";
import { ModalBase, ModalBaseProps } from "~/modals/base";

/** Intended for mobile use only - full screen alternative to menu options dropdown. */
export const MenuOptionsModal: FunctionComponent<
  ModalBaseProps & {
    selectedOptionId?: string;
    options: MenuOption[];
    onSelectMenuOption: (menuOptionId: string) => void;
  }
> = (props) => (
  <ModalBase
    className="!rounded-xl border border-white-faint !p-0"
    {...props}
    hideCloseButton
    title=""
    overlayClassName="-bottom-1/2"
  >
    <span className="subtitle1 w-full p-2 text-center text-white-high">
      {props.title}
    </span>
    <hr className="mx-3 h-px text-white-faint shadow-separator" />
    <div className="flex flex-col">
      {props.options.map(({ id, display }, index) => (
        <span
          className={classNames(
            "w-full cursor-pointer p-2 hover:bg-white-faint",
            {
              "bg-white-faint text-white-full": id === props.selectedOptionId,
              "text-osmoverse-400": id !== props.selectedOptionId,
              "rounded-b-xlinset": index === props.options.length - 1,
            }
          )}
          key={id}
          onClick={() => props.onSelectMenuOption(id)}
        >
          {display}
        </span>
      ))}
    </div>
  </ModalBase>
);
