import classNames from "classnames";
import { Dispatch, FunctionComponent, ReactNode, SetStateAction } from "react";

import { Icon } from "~/components/assets";
import { Spinner } from "~/components/loaders";
import { BridgeChainWithDisplayInfo } from "~/server/api/routers/bridge-transfer";

import { ChainLogo } from "../assets/chain-logo";
import { BridgeNetworkSelectModal } from "./bridge-network-select-modal";
import { SupportedChain } from "./use-bridges-supported-assets";

interface ChainSelectorButtonProps {
  direction: "deposit" | "withdraw";
  readonly: boolean;
  children: ReactNode;
  chainLogo: string | undefined;
  chainColor: string | undefined;
  chains: SupportedChain[];
  toChain: BridgeChainWithDisplayInfo | undefined;
  onSelectChain: (chain: BridgeChainWithDisplayInfo) => void;
  isNetworkSelectVisible: boolean;
  setIsNetworkSelectVisible: Dispatch<SetStateAction<boolean>>;
  initialManualAddress?: string;
  onConfirmManualAddress: (address: string) => void;
  isLoading: boolean;
}

export const ChainSelectorButton: FunctionComponent<
  ChainSelectorButtonProps
> = ({
  direction,
  readonly,
  children,
  chainLogo,
  chainColor,
  chains,
  onSelectChain,
  toChain,
  isNetworkSelectVisible,
  setIsNetworkSelectVisible,
  onConfirmManualAddress,
  initialManualAddress,
  isLoading,
}) => {
  if (readonly) {
    return (
      <div className="subtitle1 md:body2 flex w-[45%] flex-1 items-center gap-2 rounded-[48px] border border-osmoverse-700 py-2 px-4 text-osmoverse-200 md:py-1 md:px-2">
        <ChainLogo prettyName="" logoUri={chainLogo} color={chainColor} />
        <span className="truncate">{children}</span>
      </div>
    );
  }

  return (
    <>
      <button
        onClick={() => {
          setIsNetworkSelectVisible(true);
        }}
        className={classNames(
          "subtitle1 md:body2 group flex w-[45%] flex-1 items-center justify-between rounded-[48px] bg-osmoverse-825 py-2 px-4 text-start transition-colors duration-200 md:py-1 md:px-2",
          {
            "opacity-60": isLoading,
            "hover:bg-osmoverse-850": !isLoading,
          }
        )}
        disabled={isLoading}
      >
        <div className="flex w-[90%] items-center gap-2">
          {isLoading ? (
            <Spinner className="flex-shrink-0 text-wosmongton-500" />
          ) : (
            <ChainLogo
              className="flex-shrink-0"
              prettyName=""
              logoUri={chainLogo}
              color={chainColor}
            />
          )}
          {isLoading ? (
            <span className="subtitle1 whitespace-nowrap text-wosmongton-200">
              Loading networks
            </span>
          ) : (
            <span className="truncate">{children}</span>
          )}
        </div>
        {isLoading ? null : (
          <Icon
            id="chevron-down"
            className="flex-shrink-0 text-wosmongton-200 transition-colors duration-200 group-hover:text-white-full"
            width={12}
            height={12}
          />
        )}
      </button>
      {toChain && (
        <BridgeNetworkSelectModal
          isOpen={isNetworkSelectVisible}
          chains={chains}
          onSelectChain={async (chain) => {
            onSelectChain(chain);
            setIsNetworkSelectVisible(false);
          }}
          onRequestClose={() => setIsNetworkSelectVisible(false)}
          direction={direction}
          toChain={toChain}
          initialManualAddress={initialManualAddress}
          onConfirmManualAddress={onConfirmManualAddress}
        />
      )}
    </>
  );
};
