import { CoinPretty } from "@keplr-wallet/unit";
import classNames from "classnames";
import { observer } from "mobx-react-lite";
import Image from "next/image";
import { FunctionComponent, useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-multi-lang";

import { Icon } from "~/components/assets";
import { TokenSelect } from "~/components/control";
import { CustomClasses } from "~/components/types";
import { useConnectWalletModalRedirect } from "~/hooks";
import type { SourceChain } from "~/integrations";
import type {
  OriginBridgeInfo,
  SourceChainKey,
} from "~/integrations/bridge-info";
import { ModalBase, ModalBaseProps } from "~/modals/base";

const IS_TESTNET = process.env.NEXT_PUBLIC_IS_TESTNET === "true";

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
  const t = useTranslation();

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
            }) => coinDenom === (IS_TESTNET ? "aUSDC" : "USDC")
          )?.token.denom) || tokens[0].token.denom
  );
  const [selectedSourceChainKey, setSelectedSourceChainKey] =
    useState<SourceChain | null>(null);

  // set network-select to selected token's defualt
  useEffect(() => {
    const { sourceChainTokens, defaultSourceChainId } = tokens.find(
      ({ token }) => token.currency.coinDenom === selectedTokenDenom
    )?.originBridgeInfo || { sourceChainTokens: [] };
    setSelectedSourceChainKey(
      sourceChainTokens.length > 0
        ? defaultSourceChainId ?? sourceChainTokens[0].id
        : null
    );
  }, [tokens, selectedTokenDenom, setSelectedSourceChainKey]);

  const selectedToken = useMemo(
    () => tokens.find((t) => t.token.denom === selectedTokenDenom),
    [tokens, selectedTokenDenom]
  );
  const selectedNetwork = useMemo(() => {
    if (selectedToken?.originBridgeInfo) {
      return selectedToken.originBridgeInfo.sourceChainTokens.find(
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
      className: "mt-3",
      onClick: () => onSelectAsset(selectedTokenDenom, selectedNetwork?.id),
      disabled: selectedToken?.originBridgeInfo && !selectedNetwork, // error in bridge integration config
      children: t("assets.transferAssetSelect.buttonNext"),
    },
    props.onRequestClose,
    t("connectWallet")
  );

  return (
    <ModalBase
      {...props}
      isOpen={props.isOpen && showModalBase}
      title={
        isWithdraw
          ? t("assets.transferAssetSelect.withdraw")
          : t("assets.transferAssetSelect.deposit")
      }
    >
      <div className="my-5 flex flex-col gap-5">
        <div className="flex items-center rounded-2xl border border-osmoverse-700 p-4 md:py-6">
          <TokenSelect
            tokens={tokens.map(({ token }) => token)}
            onSelect={(denom) => {
              setSelectedTokenDenom(denom);
            }}
            selectedTokenDenom={selectedTokenDenom}
          />
        </div>
        {selectedToken?.originBridgeInfo &&
          selectedNetwork &&
          keplrConnected && (
            <div
              className={classNames(
                "relative flex w-full place-content-between items-center border border-osmoverse-700 p-4 transition-borderRadius",
                {
                  "rounded-2xl": !isSourceChainDropdownOpen,
                  "rounded-l-2xl rounded-tr-2xl": isSourceChainDropdownOpen,
                }
              )}
            >
              <span className="subtitle2 text-white-mid">
                {t("assets.transferAssetSelect.network")}
              </span>
              <div
                className={classNames("flex items-center gap-2", {
                  "cursor-pointer":
                    selectedToken?.originBridgeInfo &&
                    selectedToken.originBridgeInfo.sourceChainTokens.length > 1,
                })}
                onClick={() => {
                  if (
                    selectedToken?.originBridgeInfo &&
                    selectedToken.originBridgeInfo.sourceChainTokens.length > 1
                  )
                    setSourceChainDropdownOpen(!isSourceChainDropdownOpen);
                }}
              >
                <Network {...selectedNetwork} />
                {selectedToken?.originBridgeInfo &&
                  selectedToken.originBridgeInfo.sourceChainTokens.length >
                    1 && (
                    <div
                      className={classNames("flex items-center transition", {
                        "rotate-180": isSourceChainDropdownOpen,
                      })}
                    >
                      <Icon
                        id="chevron-down"
                        height={22}
                        width={12}
                        className="text-osmoverse-400"
                      />
                    </div>
                  )}
              </div>
              {isSourceChainDropdownOpen && (
                <div
                  style={{ borderTopStyle: "dashed" }}
                  className="absolute -right-[1px] top-[100%] z-50 select-none rounded-b-2xl border border-osmoverse-700 bg-osmoverse-800"
                >
                  {selectedToken.originBridgeInfo.sourceChainTokens
                    .filter(({ id }) => id !== selectedNetwork.id)
                    .map((sourceChain, index, scArr) => (
                      <div
                        key={index}
                        className={classNames(
                          "cursor-pointer px-6 py-1.5 transition-colors hover:bg-osmoverse-700",
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
  <div className={classNames("flex select-none items-center gap-2", className)}>
    <Image alt="network logo" src={logoUrl} height={28} width={28} />
    <span className="subtitle2">{displayName}</span>
  </div>
);
