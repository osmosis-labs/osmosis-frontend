import { FunctionComponent } from "react";
import { TokenSelect } from "./control";
import { useBooleanWithWindowEvent } from "../hooks";
import { InfoTooltip } from "./tooltip";

export const TradeClipboard: FunctionComponent<{
  className?: string;
}> = ({ className }) => {
  const [isSettingOpen, setIsSettingOpen] = useBooleanWithWindowEvent(false);

  return (
    <div
      className={`rounded-2xl bg-card max-w-clipboard border-2 border-cardInner p-2.5 ${className}`}
    >
      <div className="rounded-xl bg-cardInner px-5 pt-5 pb-8">
        <div className="absolute -top-2 inset-x-1/2 -translate-x-1/2 w-[10rem] h-[3.75rem] z-10 bg-gradients-clip rounded-md">
          <div className="absolute bottom-0 rounded-b-md w-full h-5 bg-gradients-clipInner" />
          <div className="absolute inset-x-1/2 -translate-x-1/2 bottom-2 w-12 h-[1.875rem] bg-[rgba(91,83,147,0.12)] rounded-md shadow-[rgba(0,0,0,0.25)_1px_1px_1px_inset]" />
        </div>

        <div className="relative flex justify-end w-full h-11 mb-[1.125rem]">
          <button
            className="relative"
            onClick={(e) => {
              e.stopPropagation();
              setIsSettingOpen(!isSettingOpen);
            }}
          >
            <img
              className="w-11 h-11"
              src={`/icons/hexagon-border${
                isSettingOpen ? "-selected" : ""
              }.svg`}
              alt="hexagon border icon"
            />
            <img
              className="w-5 h-5 absolute inset-1/2 -translate-x-1/2 -translate-y-1/2"
              src={`/icons/setting${isSettingOpen ? "-selected" : ""}.svg`}
              alt="setting icon"
            />
          </button>
          {isSettingOpen && (
            <div
              className="absolute bottom-0 right-0 translate-y-full bg-card border border-white-faint rounded-2xl p-[1.875rem] z-20 w-full max-w-[23.875rem]"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="subtitle1 text-white-emphasis">
                Transaction Settings
              </div>
              <div className="flex items-center mt-2.5">
                <div className="body2 text-white-disabled mr-2">
                  Slippage tolerance
                </div>
                <InfoTooltip content="Your transaction will revert if the price changes unfavorably by more than this percentage." />
              </div>

              <ul className="flex gap-x-3 w-full mt-3">
                <li className="flex items-center justify-center w-full h-8 cursor-pointer rounded-full bg-background text-white-high">
                  1%
                </li>
                <li className="flex items-center justify-center w-full h-8 cursor-pointer rounded-full bg-background text-white-high">
                  3%
                </li>
                <li className="flex items-center justify-center w-full h-8 cursor-pointer rounded-full bg-background text-white-high">
                  5%
                </li>
                <li className="flex items-center justify-center w-full h-8 cursor-pointer rounded-full bg-background text-white-high">
                  <input
                    type="number"
                    className="text-white-full bg-transparent text-right focus:outline-none w-[1.625rem]"
                    placeholder="2.5"
                  />
                  <span className="shrink-0">%</span>
                </li>
              </ul>
            </div>
          )}
        </div>

        <div className="relative">
          <div className="bg-surface rounded-2xl px-4 pt-3 pb-4">
            <div className="flex justify-between items-center">
              <span className="subtitle1 text-white-full">From</span>
              <div className="flex items-center">
                <span className="caption text-sm text-white-full">
                  Available
                </span>
                <span className="caption text-sm text-primary-50 ml-1.5">
                  0.01 ATOM
                </span>
                <button className="text-white-full text-xs py-1 px-1.5 rounded-md bg-white-faint ml-2">
                  MAX
                </button>
                <button className="text-white-full text-xs py-1 px-1.5 rounded-md bg-white-faint ml-1">
                  HALF
                </button>
              </div>
            </div>
            <div className="flex items-center justify-between mt-3">
              <TokenSelect />
              <div className="flex flex-col items-end -ml-3">
                <input
                  type="number"
                  className="font-h5 text-h5 text-white-full bg-transparent text-right focus:outline-none w-full"
                  placeholder="0"
                />
                <div className="subtitle2 text-white-full">≈ $146.35</div>
              </div>
            </div>
          </div>

          <button className="absolute inset-1/2 -translate-x-1/2 -translate-y-1/2 w-12 h-12">
            <img
              className="w-12 h-12"
              src="/icons/hexagon-border.svg"
              alt="hexagon border icon"
            />
            <img
              className="absolute inset-1/2 -translate-x-1/2 -translate-y-1/2 w-6 h-6"
              src="/icons/switch.svg"
              alt="switch icon"
            />
          </button>

          <div className="bg-surface rounded-2xl px-4 pt-3 pb-4 mt-[1.125rem]">
            <div className="flex justify-between items-center">
              <span className="subtitle1 text-white-full">To</span>
            </div>
            <div className="flex items-center justify-between mt-3">
              <TokenSelect />
              <div className="flex flex-col items-end -ml-3">
                <h5 className="text-white-full text-right">≈ 100 OSMO</h5>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-[1.125rem] border border-white-faint rounded-lg bg-card py-3 px-4">
          <div className="flex justify-between">
            <div className="subtitle2 text-wireframes-lightGrey">Rate</div>
            <div className="flex flex-col gap-y-1.5 text-right">
              <div className="subtitle2 text-wireframes-lightGrey">
                1 ATOM = 4.32 OSMO
              </div>
              <div className="caption text-wireframes-grey">
                1 OSMO = 0.231 ATOM
              </div>
            </div>
          </div>
          <div className="flex justify-between mt-2.5">
            <div className="subtitle2 text-wireframes-lightGrey">Swap Fee</div>
            <div className="subtitle2 text-wireframes-lightGrey">0.3%</div>
          </div>
          <div className="flex justify-between pt-4 mt-4 border-t border-white-faint">
            <div className="subtitle2 text-white-high">Estimated Slippage</div>
            <div className="subtitle2 text-white-high">0%</div>
          </div>
        </div>

        <button className="mt-[1.125rem] flex justify-center items-center w-full h-[3.75rem] rounded-lg bg-primary-200 text-white-full text-base font-medium shadow-md">
          Swap
        </button>
      </div>
    </div>
  );
};
