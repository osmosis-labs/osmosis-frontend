import Image from "next/image";
import {
  FunctionComponent,
  useEffect,
  useState,
  useRef,
  useMemo,
  useCallback,
} from "react";
import { AppCurrency } from "@keplr-wallet/types";
import { CoinPretty } from "@keplr-wallet/unit";
import { TokenSelect } from "../components/control";
import { NonKeplrWalletCard } from "../components/cards";
import { Button } from "../components/buttons";
import { displayToast, ToastType } from "../components/alert";
import type {
  OriginBridgeInfo,
  SourceChainKey,
} from "../integrations/bridge-info";
import type {
  SourceChain as AxelarSourceChain,
  SourceChain,
} from "../integrations/axelar";
import { WalletKey, Client } from "../integrations/wallets";
import { DataSorter } from "../hooks/data/data-sorter";
import { useLocalStorageState } from "../hooks";
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
    /** Leave undefined to auto-select most relevant asset. */
    initialToken?: { token: AppCurrency; originBridgeInfo?: OriginBridgeInfo };
    onSelectAsset: (
      denom: string,
      /** `undefined` if IBC asset. */
      walletKey?: WalletKey,
      /** `undefined` if IBC asset. */
      sourceChainKey?: SourceChainKey
    ) => void;
    /** Will connect desired wallet whilst disconnecting all others. */
    walletClients: Client[];
  }
> = (props) => {
  const {
    isWithdraw,
    tokens,
    initialToken: initiallySelectedToken,
    onSelectAsset,
    walletClients,
  } = props;
  // for user convenience, remember last transferred token
  const [lastSelectedDenom, setLastSelectedDenom] = useLocalStorageState<
    string | null
  >("transfer_asset_select_last", null);

  const [selectedSourceChainKey, setSelectedSourceChainKey] = useState(() => {
    // set from initiallySelectedToken
    if (
      initiallySelectedToken &&
      initiallySelectedToken.originBridgeInfo &&
      typeof initiallySelectedToken.originBridgeInfo.sourceChains !==
        "undefined" &&
      initiallySelectedToken.originBridgeInfo.sourceChains.length > 0
    ) {
      // axelar
      return initiallySelectedToken.originBridgeInfo.sourceChains[0];
    }
    return null;
  });
  const [selectedTokenDenom, setSelectedTokenDenom] = useState(() => {
    if (initiallySelectedToken) {
      return initiallySelectedToken.token.coinDenom;
    } else {
      // highest balance or first in list
      const denom =
        new DataSorter([...tokens.map((t) => t.token)])
          .process()
          .find((t) => t.currency.coinDenom === lastSelectedDenom)?.denom ||
        tokens[0].token.denom;

      // set chain-select to recommended selected token
      const { sourceChains } = tokens.find(
        ({ token }) => token.currency.coinDenom === denom
      )?.originBridgeInfo || { sourceChains: [] };
      setSelectedSourceChainKey(
        sourceChains.length > 0 ? sourceChains[0] : null
      );

      return denom;
    }
  });
  const selectedToken = useMemo(
    () => tokens.find((t) => t.token.denom === selectedTokenDenom),
    [tokens, selectedTokenDenom]
  );
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
  const setValidSourceChain = useCallback(
    (selectedSourceChainKey: string) => {
      if (selectedToken && selectedToken.originBridgeInfo) {
        if (
          typeof selectedToken.originBridgeInfo.sourceChains !== "undefined" &&
          selectedToken.originBridgeInfo.sourceChains.includes(
            selectedSourceChainKey as SourceChain
          )
        ) {
          // axelar
          setSelectedSourceChainKey(
            selectedSourceChainKey as AxelarSourceChain
          );
        }
      }
    },
    [selectedToken, setSelectedSourceChainKey]
  );
  setValidSourceChain; // TODO add dropdown mechanism

  // sync initially selected token to last transferred token
  const setToLocalStorageValue = useRef<boolean | null>(null);
  useEffect(() => {
    if (
      !initiallySelectedToken &&
      lastSelectedDenom &&
      setToLocalStorageValue.current !== null &&
      !setToLocalStorageValue.current
    ) {
      setSelectedTokenDenom(lastSelectedDenom);
      setToLocalStorageValue.current = true;
    }
  }, [lastSelectedDenom, setSelectedTokenDenom, initiallySelectedToken]);

  return (
    <ModalBase
      {...props}
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
        {selectedToken?.originBridgeInfo && (
          <div className="w-full flex items-center place-content-between border border-white-faint rounded-2xl p-4">
            <span className="text-white-mid">Network</span>
            <span className="text-white-disabled">
              {selectedSourceChainKey
                ? selectedSourceChainKey
                : "todo: add dropdown"}
            </span>
            {/* // TODO: support network select */}
          </div>
        )}
      </div>
      {selectedToken?.originBridgeInfo && applicableWallets.length > 0 && (
        <div>
          <h6>Connect Wallet</h6>
          <div className="grid grid-cols-2 gap-4 my-5">
            {applicableWallets.map((wallet, index) => (
              <NonKeplrWalletCard
                key={index}
                className="py-12"
                {...wallet.displayInfo}
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
      <Button
        className="h-14 w-96 mx-auto mt-4"
        size="lg"
        disabled={selectedToken?.originBridgeInfo && !selectedWallet}
        onClick={async () => {
          if (
            selectedToken?.originBridgeInfo && // is bridge asset
            selectedWallet &&
            selectedSourceChainKey &&
            !selectedWallet.isConnected
          ) {
            // connect wallet
            try {
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
          setLastSelectedDenom(selectedTokenDenom);
        }}
      >
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
      </Button>
    </ModalBase>
  );
};
