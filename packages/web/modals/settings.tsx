import { observer } from "mobx-react-lite";
import { FunctionComponent } from "react";
import { useTranslation } from "react-multi-lang";
import { Icon } from "../components/assets";
import { Button } from "../components/buttons";
import { Switch } from "../components/control";

import { ModalBase, ModalBaseProps } from "./base";

export const SettingsModal: FunctionComponent<ModalBaseProps> = observer(
  (props) => {
    const t = useTranslation();
    return (
      <ModalBase
        {...props}
        title={
          <h1 className="w-full text-center text-h6 font-h6">
            Global Settings
          </h1>
        }
      >
        <div className="mt-8 flex flex-col gap-[46px] rounded-2xl border-2 border-osmoverse-700 bg-osmoverse-800 p-6">
          <Icon id="globe" className="text-osmoverse-200" />

          <Button
            mode="text"
            className="group flex justify-between text-white-full"
            onClick={() => {}}
          >
            <div className="flex flex-col gap-1">
              <span className="subtitle1 text-left tracking-wide">English</span>
              <span className="caption tracking-wider text-osmoverse-200">
                Select language
              </span>
            </div>

            <Icon
              id="chevron-right"
              width={8}
              height={13.33}
              className="self-end group-hover:text-rust-200"
            />
          </Button>
        </div>

        <div className="mt-4 flex flex-col gap-[46px] rounded-2xl border-2 border-osmoverse-700 bg-osmoverse-800 p-6">
          <div className="flex items-center justify-between">
            <Icon id="dust-broom" className="text-osmoverse-200" />
            <Switch isOn={false} onToggle={() => {}} />
          </div>

          <div className="group flex justify-between text-white-full">
            <div className="flex flex-col gap-1">
              <span className="subtitle1 text-left tracking-wide">
                Filter Dust
              </span>
              <span className="caption tracking-wider text-osmoverse-200">
                {"Hide pools/assets < $0.01"}
              </span>
            </div>
          </div>
        </div>
      </ModalBase>
    );
  }
);
