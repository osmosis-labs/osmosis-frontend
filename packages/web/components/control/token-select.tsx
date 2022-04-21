import { IBCCurrency } from "@keplr-wallet/types";
import { CoinPretty } from "@keplr-wallet/unit";
import Image from "next/image";
import { FunctionComponent } from "react";
import { useBooleanWithWindowEvent, useFilteredData } from "../../hooks";

export const TokenSelect: FunctionComponent<{
  selectedTokenDenom: string;
  tokens: CoinPretty[];
  onSelect: (token: CoinPretty) => void;
  sortByBalances?: boolean;
}> = ({ selectedTokenDenom, tokens, onSelect, sortByBalances = false }) => {
  const [isSelectOpen, setIsSelectOpen] = useBooleanWithWindowEvent(false);
  const selectedToken = tokens.find(
    (token) => token.denom === selectedTokenDenom
  );
  const dropdownTokens = tokens
    .filter((token) => token.denom !== selectedTokenDenom)
    .sort((a, b) => {
      if (a.toDec().gt(b.toDec()) && sortByBalances) return -1;
      if (a.toDec().lt(b.toDec()) && sortByBalances) return 1;
      return 0;
    });

  const [searchValue, setTokenSearch, searchedTokens] = useFilteredData(
    dropdownTokens,
    ["denom"]
  );

  return (
    <div className="flex md:justify-center items-center relative">
      <div
        className="flex items-center group cursor-pointer"
        onClick={(e) => {
          e.stopPropagation();
          setIsSelectOpen(!isSelectOpen);
        }}
      >
        <div className="w-14 h-14 rounded-full border border-enabledGold flex items-center justify-center shrink-0 mr-3">
          {selectedToken?.currency.coinImageUrl && (
            <div className="w-11 h-11 rounded-full">
              <Image
                src={selectedToken.currency.coinImageUrl}
                alt="token icon"
                className="rounded-full"
                width={44}
                height={44}
              />
            </div>
          )}
        </div>
        <div>
          <h5 className="text-white-full">
            {selectedToken?.currency.coinDenom}
          </h5>
          {selectedToken && "paths" in selectedToken && (
            <div className="text-iconDefault text-sm font-semibold">
              {(selectedToken as IBCCurrency).paths
                .map((path) => path.channelId)
                .join(", ")}
            </div>
          )}
        </div>
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
        <div
          className="absolute bottom-0 -left-3 translate-y-full p-1 md:p-3.5 bg-surface rounded-b-2xl z-50 w-[18.75rem] md:w-[28.5rem]"
          onClick={(e) => e.stopPropagation()}
        >
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
              placeholder="Search tokens"
              onClick={(e) => e.stopPropagation()}
              value={searchValue}
              onInput={(e: any) => setTokenSearch(e.target.value)}
            />
          </div>

          <div className="token-item-list overflow-y-scroll max-h-80">
            {searchedTokens.map((token, index) => (
              <div
                key={index}
                className="flex justify-between items-center rounded-2xl py-2.5 px-3 my-1 hover:bg-card cursor-pointer mr-3"
                onClick={(e) => {
                  e.stopPropagation();
                  onSelect(token);
                  setIsSelectOpen(false);
                }}
              >
                <div className="flex items-center">
                  {token.currency.coinImageUrl && (
                    <div className="w-9 h-9 rounded-full mr-3">
                      <Image
                        src={token.currency.coinImageUrl}
                        alt="token icon"
                        className="rounded-full"
                        width={36}
                        height={36}
                      />
                    </div>
                  )}
                  <div>
                    <h6 className="text-white-full">{token.denom}</h6>
                    <div className="text-iconDefault text-sm font-semibold">
                      {token.trim(true).hideDenom(true).toString()}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
