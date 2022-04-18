import { FunctionComponent } from "react";
import classNames from "classnames";
import { MenuOption } from "../components/control";
import { ModalBase, ModalBaseProps } from "./base";

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
  >
    <span className="w-full subtitle1 text-center p-2 text-white-high">
      {props.title}
    </span>
    <div className="mx-3 shadow-separator h-px" />
    <div className="flex flex-col">
      {props.options.map(({ id, display }, index) => (
        <span
          className={classNames(
            "p-2 cursor-pointer w-full hover:bg-white-faint",
            {
              "bg-white-faint text-white-full": id === props.selectedOptionId,
              "text-iconDefault": id !== props.selectedOptionId,
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
