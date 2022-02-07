import Image from "next/image";
import { FunctionComponent } from "react";

export const PoolCard: FunctionComponent<{}> = ({}) => {
  return (
    <div className="px-[1.875rem] pt-8 pb-6 bg-card opacity-50 rounded-2xl cursor-pointer hover:ring-1 hover:ring-enabledGold">
      <div className="relative flex items-center">
        <div
          className={
            "absolute z-10 w-[4.125rem] h-[4.125rem] rounded-full border-[1px] bg-card border-enabledGold flex items-center justify-center"
          }
        >
          <Image
            src="https://app.osmosis.zone/public/assets/tokens/cosmos.svg"
            alt="ATOM"
            width={54}
            height={54}
          />
        </div>
        <div
          className={
            "ml-10 mr-6 w-[4.125rem] h-[4.125rem] rounded-full border-[1px] border-enabledGold shrink-0 flex items-center justify-center"
          }
        >
          <Image
            src="https://app.osmosis.zone/public/assets/tokens/iris.svg"
            alt="IRIS"
            width={54}
            height={54}
          />
        </div>
        <div className="flex flex-col">
          <h5>ATOM / IRIS</h5>
          <div className="subtitle2 text-white-mid">Pool #201</div>
        </div>
      </div>
      <div className="mt-5 mb-3 w-full bg-secondary-200 h-[1px]" />
      <div className="flex">
        <div className="flex flex-col">
          <div className="subtitle2 text-white-disabled">APR</div>
          <div className="relative overflow-hidden rounded-sm w-[3.75rem] h-4 bg-white-faint mt-[0.4375rem]">
            <div className="absolute left-0 -translate-x-[calc(-150%)] h-full w-1/2 bg-loading-bar animate-loading" />
          </div>
        </div>
        <div className="ml-8 flex flex-col">
          <div className="subtitle2 text-white-disabled">Pool Liquidity</div>
          <div className="mt-0.5 subtitle1 text-white-high">$52,350,835</div>
        </div>
        <div className="ml-8 flex flex-col">
          <div className="subtitle2 text-white-disabled">Bonded</div>
          <div className="mt-0.5 subtitle1 text-white-high">$2,350</div>
        </div>
      </div>
    </div>
  );
};
