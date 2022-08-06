import Image from "next/image";
import { FunctionComponent, useState, useMemo } from "react";
import { observer } from "mobx-react-lite";
import { CoinPretty } from "@keplr-wallet/unit";
import { TokenSelect } from "../components/control";
import { NonKeplrWalletCard } from "../components/cards";
import { displayToast, ToastType } from "../components/alert";
import { CustomClasses } from "../components/types";
import type {
  OriginBridgeInfo,
  SourceChainKey,
} from "../integrations/bridge-info";
import type { SourceChain } from "../integrations/axelar";
import { WalletKey, Client } from "../integrations/wallets";
import { useConnectWalletModalRedirect } from "../hooks";
import { ModalBase, ModalBaseProps } from "./base";
import classNames from "classnames";

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
      walletKey?: WalletKey,
      /** `undefined` if IBC asset. */
      sourceChainKey?: SourceChainKey
    ) => void;
    walletClients: Client[];
  }
> = observer((props) => {
  const { isWithdraw, tokens, onSelectAsset, walletClients } = props;

  const [selectedSourceChainKey, setSelectedSourceChainKey] =
    useState<SourceChain | null>(null);
  const [selectedTokenDenom, setSelectedTokenDenom] = useState(() => {
    // highest balance or first in list
    const denom = isWithdraw
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
        )?.token.denom;

    // set chain-select to recommended selected token
    const { sourceChains } = tokens.find(
      ({ token }) => token.currency.coinDenom === denom
    )?.originBridgeInfo || { sourceChains: [] };
    setSelectedSourceChainKey(
      sourceChains.length > 0 ? sourceChains[0].id : null
    );

    return denom || tokens[0].token.denom;
  });
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
  const applicableWallets = useMemo(() => {
    if (!selectedToken?.originBridgeInfo) {
      return [];
    }

    return walletClients.filter(({ key }) =>
      selectedToken.originBridgeInfo!.wallets.includes(key)
    );
  }, [selectedToken, walletClients]);
  const [selectedWalletKey, setSelectedWalletKey] = useState<string | null>(
    () => applicableWallets.find((w) => w.isConnected)?.key || null
  );
  const selectedWallet = useMemo(
    () => applicableWallets.find((w) => w.key === selectedWalletKey),
    [applicableWallets, selectedWalletKey]
  );

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
      disabled: selectedToken?.originBridgeInfo && !selectedWallet,
      onClick: async () => {
        if (
          selectedToken?.originBridgeInfo && // is bridge asset
          selectedWallet &&
          selectedSourceChainKey &&
          !selectedWallet.isConnected
        ) {
          // connect wallet
          try {
            walletClients.forEach((client) => client.disable());

            await selectedWallet.enable();

            onSelectAsset(
              selectedTokenDenom,
              selectedWallet!.key,
              selectedSourceChainKey
            );
          } catch (e) {
            displayToast({ message: "Request rejected" }, ToastType.ERROR);
            props.onRequestClose();
          }
        } else if (selectedWallet) {
          // next for bridge asset
          if (!selectedSourceChainKey) {
            console.error("No chain selected");
            return;
          }

          onSelectAsset(
            selectedTokenDenom,
            selectedWallet.key,
            selectedSourceChainKey
          );
        } else {
          onSelectAsset(selectedTokenDenom);
        }
      },
      children: (
        <>
          {selectedWallet && !selectedWallet.isConnected ? (
            <h6 className="flex items-center gap-3">
              <Image
                alt="wallet"
                src="/icons/wallet.svg"
                height={24}
                width={24}
              />
              Connect Wallet
            </h6>
          ) : (
            "Next"
          )}
        </>
      ),
    },
    props.onRequestClose,
    "Connect Native Wallet"
  );

  // TODO: push wallet connect errors as toasts. i.e. request reject

  return (
    <ModalBase
      {...props}
      isOpen={props.isOpen && showModalBase}
      title={`${isWithdraw ? "Withdraw" : "Deposit"} Asset`}
    >
      <div className="flex flex-col gap-5 my-5">
        <div className="flex items-centerw-full border border-white-faint rounded-2xl p-4">
          <TokenSelect
            tokens={tokens.map(({ token }) => token)}
            onSelect={(denom) => {
              setSelectedTokenDenom(denom);
            }}
            selectedTokenDenom={selectedTokenDenom}
          />
        </div>
        {selectedToken?.originBridgeInfo && selectedNetwork && (
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
              className="flex items-center gap-2 cursor-pointer"
              onClick={() =>
                setSourceChainDropdownOpen(!isSourceChainDropdownOpen)
              }
            >
              <Network {...selectedNetwork} />
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
      {selectedToken?.originBridgeInfo && applicableWallets.length > 0 && (
        <div>
          <h6 className={keplrConnected ? undefined : "opacity-30"}>
            Connect Wallet
          </h6>
          <div className="grid grid-cols-2 gap-4 my-5">
            {applicableWallets.map((wallet, index) => (
              <NonKeplrWalletCard
                key={index}
                className="py-12"
                {...wallet.displayInfo}
                disabled={!keplrConnected}
                isSelected={wallet.key === selectedWalletKey}
                onClick={() => {
                  applicableWallets
                    .filter((w) => w.isConnected)
                    .forEach((w) => w.disable);

                  setSelectedWalletKey(wallet.key);
                }}
              />
            ))}
          </div>
        </div>
      )}
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
