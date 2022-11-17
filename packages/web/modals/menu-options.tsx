import { FunctionComponent } from "react";
import classNames from "classnames";
import { MenuOption } from "../components/control";
import { ModalBase, ModalBaseProps } from "./base";

/** Intended for mobile use only - full screen alternative to menu options dropdown. */
export const MenuOptionsModal: FunctionComponent<
  ModalBaseProps & {
    selectedOptionId?: string;
    options: MenuOption[];
    onSelectMenuOption: (menuOptionId: string) => void;
  }
> = (props) => (
  <ModalBase
    className="border border-white-faint !p-0 !rounded-xl"
    {...props}
    hideCloseButton
    title=""
    overlayClassName="-bottom-1/2"
  >
    <span className="w-full subtitle1 text-center p-2 text-white-high">
      {props.title}
    </span>
    <hr className="mx-3 shadow-separator h-px text-white-faint" />
    <div className="flex flex-col">
      {props.options.map(({ id, display }, index) => (
        <span
          className={classNames(
            "p-2 cursor-pointer w-full hover:bg-white-faint",
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
