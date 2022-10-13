import Image from "next/image";
import { FunctionComponent, useState, useMemo, useEffect } from "react";
import classNames from "classnames";
import { observer } from "mobx-react-lite";
import { CoinPretty } from "@keplr-wallet/unit";
import { TokenSelect } from "../components/control";
import { CustomClasses } from "../components/types";
import type {
  OriginBridgeInfo,
  SourceChainKey,
} from "../integrations/bridge-info";
import type { SourceChain } from "../integrations/axelar";
import { useConnectWalletModalRedirect, useWindowSize } from "../hooks";
import { ModalBase, ModalBaseProps } from "./base";

/** Intermediate step to allow a user to select & config an asset before deposit/withdraw. */
export const TransferAssetSelectModal: FunctionComponent<
  ModalBaseProps & {
    isWithdraw: boolean;
    /** Inclusive token list. */
    tokens: {
      token: CoinPretty;
      originBridgeInfo?: OriginBridgeInfo;
    }[];
    onSelectAsset: (
      denom: string,
      /** `undefined` if IBC asset. */
      sourceChainKey?: SourceChainKey
    ) => void;
  }
> = observer((props) => {
  const { isWithdraw, tokens, onSelectAsset } = props;
  const { isMobile } = useWindowSize();

  const [selectedTokenDenom, setSelectedTokenDenom] = useState(
    () =>
      (isWithdraw
        ? tokens.find(
            ({
              token: {
                currency: { coinDenom },
              },
            }) => coinDenom === "ATOM"
          )?.token.denom
        : tokens.find(
            ({
              token: {
                currency: { coinDenom },
              },
            }) => coinDenom === "USDC"
          )?.token.denom) || tokens[0].token.denom
  );
  const [selectedSourceChainKey, setSelectedSourceChainKey] =
    useState<SourceChain | null>(null);

  // set network-select to selected token's defualt
  useEffect(() => {
    const { sourceChains, defaultSourceChainId } = tokens.find(
      ({ token }) => token.currency.coinDenom === selectedTokenDenom
    )?.originBridgeInfo || { sourceChains: [] };
    setSelectedSourceChainKey(
      sourceChains.length > 0
        ? defaultSourceChainId ?? sourceChains[0].id
        : null
    );
  }, [tokens, selectedTokenDenom, setSelectedSourceChainKey]);

  const selectedToken = useMemo(
    () => tokens.find((t) => t.token.denom === selectedTokenDenom),
    [tokens, selectedTokenDenom]
  );
  const selectedNetwork = useMemo(() => {
    if (selectedToken?.originBridgeInfo) {
      return selectedToken.originBridgeInfo.sourceChains.find(
        ({ id }) => id === selectedSourceChainKey
      );
    }
  }, [selectedToken, selectedSourceChainKey]);

  const [isSourceChainDropdownOpen, setSourceChainDropdownOpen] =
    useState(false);

  const {
    showModalBase,
    accountActionButton,
    walletConnected: keplrConnected,
  } = useConnectWalletModalRedirect(
    {
      className: "h-14 md:w-full w-96 mt-3 mx-auto !px-1",
      size: "lg",
      onClick: () => onSelectAsset(selectedTokenDenom, selectedNetwork?.id),
      children: <span>Next</span>,
    },
    props.onRequestClose,
    "Connect Wallet"
  );

  return (
    <ModalBase
      {...props}
      isOpen={props.isOpen && showModalBase}
      title={`${isWithdraw ? "Withdraw" : "Deposit"} Asset`}
    >
      <div className="flex flex-col gap-5 my-5">
        <div className="flex items-centerw-full border border-white-faint rounded-2xl p-4 md:py-6">
          <TokenSelect
            tokens={tokens.map(({ token }) => token)}
            onSelect={(denom) => {
              setSelectedTokenDenom(denom);
            }}
            selectedTokenDenom={selectedTokenDenom}
            isMobile={isMobile}
          />
        </div>
        {selectedToken?.originBridgeInfo && selectedNetwork && keplrConnected && (
          <div
            className={classNames(
              "relative w-full flex items-center place-content-between border border-white-faint p-4 transition-borderRadius",
              {
                "rounded-2xl": !isSourceChainDropdownOpen,
                "rounded-l-2xl rounded-tr-2xl": isSourceChainDropdownOpen,
              }
            )}
          >
            <span className="text-white-mid subtitle2">Network</span>
            <div
              className={classNames("flex items-center gap-2", {
                "cursor-pointer":
                  selectedToken?.originBridgeInfo &&
                  selectedToken.originBridgeInfo.sourceChains.length > 1,
              })}
              onClick={() => {
                if (
                  selectedToken?.originBridgeInfo &&
                  selectedToken.originBridgeInfo.sourceChains.length > 1
                )
                  setSourceChainDropdownOpen(!isSourceChainDropdownOpen);
              }}
            >
              <Network {...selectedNetwork} />
              {selectedToken?.originBridgeInfo &&
                selectedToken.originBridgeInfo.sourceChains.length > 1 && (
                  <div
                    className={classNames("flex items-center transition", {
                      "rotate-180": isSourceChainDropdownOpen,
                    })}
                  >
                    <Image
                      alt="dropdown icon"
                      src="/icons/chevron-down-disabled.svg"
                      height={22}
                      width={12}
                    />
                  </div>
                )}
            </div>
            {isSourceChainDropdownOpen && (
              <div
                style={{ borderTopStyle: "dashed" }}
                className="absolute top-[100%] -right-[1px] border border-white-faint rounded-b-2xl z-50 bg-surface"
              >
                {selectedToken.originBridgeInfo.sourceChains
                  .filter(({ id }) => id !== selectedNetwork.id)
                  .map((sourceChain, index, scArr) => (
                    <div
                      key={index}
                      className={classNames(
                        "cursor-pointer px-6 py-1.5 hover:bg-card",
                        {
                          "rounded-b-2xl": scArr.length - 1 === index,
                        }
                      )}
                      onClick={() => {
                        setSelectedSourceChainKey(sourceChain.id);
                        setSourceChainDropdownOpen(false);
                      }}
                    >
                      <Network {...sourceChain} />
                    </div>
                  ))}
              </div>
            )}
          </div>
        )}
      </div>
      {accountActionButton}
    </ModalBase>
  );
});

const Network: FunctionComponent<
  { id: string; logoUrl: string } & CustomClasses
> = ({ id: displayName, logoUrl, className }) => (
  <div className={classNames("flex items-center gap-2 select-none", className)}>
    <Image alt="network logo" src={logoUrl} height={28} width={28} />
    <span className="subtitle2">{displayName}</span>
  </div>
);
