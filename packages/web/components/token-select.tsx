import Image from "next/image";
import { FunctionComponent, useState } from "react";

export const TokenSelect: FunctionComponent<{}> = () => {
  const [isSelectOpen, setIsSelectOpen] = useState(false);

  return (
    <div className="flex justify-center items-center relative">
      <div
        className="flex items-center group cursor-pointer"
        onClick={() => setIsSelectOpen(!isSelectOpen)}
      >
        <div className="w-14 h-14 rounded-full border border-enabledGold flex items-center justify-center shrink-0 mr-3">
          <div className="w-11 h-11 rounded-full">
            <Image
              src="https://app.osmosis.zone/public/assets/tokens/cosmos.svg"
              alt="ATOM icon"
              className="rounded-full"
              width={44}
              height={44}
            />
          </div>
        </div>
        <h5 className="text-white-full">ATOM</h5>
        <div className="w-5 ml-3 pb-1">
          <Image
            className={`opacity-40 group-hover:opacity-100 transition-transform duration-100 ${
              isSelectOpen ? "rotate-180" : "rotate-0"
            }`}
            src="/icons/chevron-down.svg"
            alt="select icon"
            width={20}
            height={8}
          />
        </div>
      </div>

      {isSelectOpen && (
        <div className="absolute bottom-0 -left-3 translate-y-full p-3.5 bg-surface rounded-b-2xl z-10 w-[28.5rem]">
          <div className="flex items-center h-9 pl-4 mb-3 rounded-2xl bg-card">
            <div className="w-[1.125rem] h-[1.125rem]">
              <Image
                src="/icons/search.svg"
                alt="search"
                width={18}
                height={18}
              />
            </div>
            <input
              type="text"
              className="px-4 subtitle2 text-white-full bg-transparent font-normal"
              placeholder="Search your token"
            />
          </div>

          <div className="token-item-list overflow-y-scroll">
            <div className="flex justify-between items-center rounded-2xl py-2.5 px-3 my-1 hover:bg-card cursor-pointer mr-3">
              <div className="flex items-center">
                <div className="w-9 h-9 rounded-full mr-3">
                  <Image
                    src="https://app.osmosis.zone/public/assets/tokens/cosmos.svg"
                    alt="ATOM icon"
                    className="rounded-full"
                    width={36}
                    height={36}
                  />
                </div>
                <div>
                  <h6 className="text-white-full">ATOM</h6>
                  <div className="text-iconDefault text-sm font-semibold">
                    channel-1
                  </div>
                </div>
              </div>
              <h6 className="text-white-full">0.1</h6>
            </div>
          </div>

          <div className="token-item-list overflow-y-scroll">
            <div className="flex justify-between items-center rounded-2xl py-2.5 px-3 my-1 hover:bg-card cursor-pointer mr-3">
              <div className="flex items-center">
                <div className="w-9 h-9 rounded-full mr-3">
                  <Image
                    src="https://app.osmosis.zone/public/assets/tokens/cosmos.svg"
                    alt="ATOM icon"
                    className="rounded-full"
                    width={36}
                    height={36}
                  />
                </div>
                <div>
                  <h6 className="text-white-full">ATOM</h6>
                  <div className="text-iconDefault text-sm font-semibold">
                    channel-1
                  </div>
                </div>
              </div>
              <h6 className="text-white-full">0.1</h6>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
