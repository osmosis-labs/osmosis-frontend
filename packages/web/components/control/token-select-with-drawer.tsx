import classNames from "classnames";
import { observer } from "mobx-react-lite";
import Image from "next/image";
import { useRouter } from "next/router";
import { FunctionComponent, useState } from "react";

import { Icon } from "~/components/assets";
import { TokenSelectDrawer } from "~/components/drawers/token-select-drawer";
import { Disableable } from "~/components/types";
import { EventName, SwapPage } from "~/config";
import { useAmplitudeAnalytics, useWindowSize } from "~/hooks";
import { SwapState } from "~/hooks/use-swap";

/** Will display balances if provided `CoinPretty` objects. Assumes denoms are unique. */
export const TokenSelectWithDrawer: FunctionComponent<
  {
    isFromSelect: boolean;
    swapState: SwapState;
    dropdownOpen?: boolean;
    canSelectTokens?: boolean;
    page?: SwapPage;
    onSelect: (tokenDenom: string) => void;
    setDropdownState?: (isOpen: boolean) => void;
  } & Disableable
> = observer(
  ({
    isFromSelect,
    swapState,
    dropdownOpen,
    disabled,
    canSelectTokens = true,
    page = "Swap Page",
    onSelect: onSelectProp,
    setDropdownState,
  }) => {
    const { isMobile } = useWindowSize();
    const router = useRouter();
    const { logEvent } = useAmplitudeAnalytics();

    // parent overrideable state
    const [isSelectOpenLocal, setIsSelectOpenLocal] = useState(false);
    const isSelectOpen =
      dropdownOpen === undefined ? isSelectOpenLocal : dropdownOpen;
    const setIsSelectOpen =
      setDropdownState === undefined ? setIsSelectOpenLocal : setDropdownState;

    const preSortedTokens = swapState.selectableAssets;

    const selectedToken = isFromSelect
      ? swapState.fromAsset
      : swapState.toAsset;

    const tokenSelectionAvailable =
      canSelectTokens && preSortedTokens.length > 1;

    const onSelect = (tokenDenom: string) => {
      logEvent([
        EventName.Swap.dropdownAssetSelected,
        { tokenName: tokenDenom, isOnHome: router.pathname === "/", page },
      ]);
      onSelectProp(tokenDenom);
    };

    return (
      <div className="flex items-center justify-center md:justify-start">
        {selectedToken && (
          <button
            disabled={disabled}
            className={classNames(
              "flex items-center gap-2 text-left transition-opacity",
              tokenSelectionAvailable ? "cursor-pointer" : "cursor-default",
              {
                "opacity-40": disabled,
              }
            )}
            onClick={(e) => {
              e.stopPropagation();
              if (tokenSelectionAvailable) {
                setIsSelectOpen(!isSelectOpen);
              }
            }}
          >
            {selectedToken.coinImageUrl && (
              <div className="mr-1 h-[50px] w-[50px] shrink-0 rounded-full md:h-7 md:w-7">
                <Image
                  src={`${process.env.NEXT_PUBLIC_BASEPATH}${selectedToken.coinImageUrl}`}
                  alt="token icon"
                  width={isMobile ? 30 : 50}
                  height={isMobile ? 30 : 50}
                  priority
                />
              </div>
            )}
            <div className="flex flex-col">
              <div className="flex items-center">
                {isMobile || selectedToken.coinDenom.length > 6 ? (
                  <span className="subtitle1">{selectedToken.coinDenom}</span>
                ) : (
                  <h5>{selectedToken.coinDenom}</h5>
                )}
                {tokenSelectionAvailable && (
                  <div className="ml-3 w-5 md:ml-2 md:pb-1.5">
                    <Icon
                      id="chevron-down"
                      width={20}
                      height={8}
                      className={`text-osmoverse-400 opacity-40 transition-transform duration-100 group-hover:opacity-100 ${
                        isSelectOpen ? "rotate-180" : "rotate-0"
                      }`}
                    />
                  </div>
                )}
              </div>
              <div
                className="subtitle2 md:caption w-32 truncate text-osmoverse-400"
                title={selectedToken.coinName}
              >
                {selectedToken.coinName}
              </div>
            </div>
          </button>
        )}

        <div className="pt-16">
          <TokenSelectDrawer
            isOpen={isSelectOpen}
            swapState={swapState}
            onClose={() => setIsSelectOpen(false)}
            onSelect={onSelect}
          />
        </div>
      </div>
    );
  }
);
