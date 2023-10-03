import { WalletStatus } from "@cosmos-kit/core";
import { observer } from "mobx-react-lite";
import { FunctionComponent, useEffect } from "react";
import { useTranslation } from "react-multi-lang";

import { Transfer } from "~/components/complex/transfer";
import {
  useAmountConfig,
  useConnectWalletModalRedirect,
  useFakeFeeConfig,
  useLocalStorageState,
} from "~/hooks";
import { AxelarChainIds_SourceChainMap } from "~/integrations/axelar";
import {
  EthClientChainIds_SourceChainMap,
  type SourceChainKey,
} from "~/integrations/bridge-info";
import {
  ChainNames,
  EthWallet,
  useErc20Balance,
  useNativeBalance,
} from "~/integrations/ethereum";
import { useAmountConfig as useEvmAmountConfig } from "~/integrations/ethereum/hooks/use-amount-config";
import type { ObservableWallet } from "~/integrations/wallets";
import { ModalBase, ModalBaseProps } from "~/modals/base";
import { useStore } from "~/stores";
import { IBCBalance } from "~/stores/assets";
import { getKeyByValue } from "~/utils/object";

/** Modal that lets user transfer via non-IBC bridges. */
export const BridgeTransferV2Modal: FunctionComponent<
  ModalBaseProps & {
    isWithdraw: boolean;
    balance: IBCBalance;
    /** Selected network key. */
    sourceChainKey: SourceChainKey;
    walletClient: ObservableWallet;
    onRequestSwitchWallet: () => void;
  }
> = observer((props) => {
  const {
    isWithdraw,
    balance,
    sourceChainKey,
    walletClient,
    // onRequestClose,
    onRequestSwitchWallet,
  } = props;
  const t = useTranslation();
  const ethWalletClient = walletClient as EthWallet;
  const { queriesExternalStore, chainStore, accountStore, queriesStore } =
    useStore();
  const {
    showModalBase,
    // accountActionButton: connectWalletButton,
    // walletConnected,
  } = useConnectWalletModalRedirect(
    {
      className: "md:w-full w-2/3 md:p-4 p-6 hover:opacity-75 rounded-2xl",
      onClick: () => {},
    },
    props.onRequestClose
  );
  const { chainId, chainName } = chainStore.osmosis;
  const osmosisAccount = accountStore.getWallet(chainId);
  const osmosisAddress = osmosisAccount?.address ?? "";
  const osmoIcnsName =
    queriesExternalStore.queryICNSNames.getQueryContract(
      osmosisAddress
    ).primaryName;

  const ethAccountAddress = ethWalletClient.accountAddress;

  // notify eth wallet of prev selected preferred chain
  useEffect(() => {
    let ethClientChainName: string | undefined =
      getKeyByValue(EthClientChainIds_SourceChainMap, sourceChainKey) ??
      sourceChainKey;

    let hexChainId: string | undefined = getKeyByValue(
      ChainNames,
      ethClientChainName
    )
      ? ethClientChainName
      : undefined;

    if (!hexChainId) return;

    ethWalletClient.setPreferredSourceChain(hexChainId);
  }, [ethWalletClient, sourceChainKey, walletClient]);

  if (!balance.originBridgeInfo) {
    console.error("BridgeTransferModal given unconfigured IBC balance/asset");
    return null;
  }
  const { bridge } = balance.originBridgeInfo;

  const sourceChainConfig = balance.originBridgeInfo.sourceChainTokens.find(
    ({ id }) => id === sourceChainKey
  );

  let title = "";

  if (isWithdraw) {
    /** Since the modal will display a toggle, hide the coin denom from the title  */
    if (
      bridge === "axelar" &&
      Boolean(sourceChainConfig?.nativeWrapEquivalent)
    ) {
      title = t("assets.transferAssetSelect.withdraw");
    } else {
      title = t("assets.transfer.titleWithdraw", {
        coinDenom: balance.balance.currency.coinDenom,
      });
    }
  } else {
    /** Since the modal will display a toggle, hide the coin denom from the title  */
    if (
      bridge === "axelar" &&
      Boolean(sourceChainConfig?.nativeWrapEquivalent)
    ) {
      title = t("assets.transferAssetSelect.deposit");
    } else {
      title = t("assets.transfer.titleDeposit", {
        coinDenom: balance.balance.currency.coinDenom,
      });
    }
  }

  const bestQuote = queriesExternalStore.queryBridgeBestQuote.getBestQuote({
    fromAddress: ethAccountAddress!, // ethereum account
    fromAmount: "12", // input amount
    fromAsset: {
      denom: balance.balance.denom, //  we already have it
      address: sourceChainConfig?.erc20ContractAddress!, // we already have it
    },
    fromChain: {
      chainId: sourceChainConfig?.chainId!, // TODO: add the chain id
      chainName: sourceChainConfig?.id!, // we already have it
    },
    toAddress: osmosisAddress, // osmo address
    toAsset: {
      denom: balance.balance.currency.coinDenom, // ibc counterpart denom
      address: balance.balance.currency.coinMinimalDenom, // ibc counterpart address
    },
    toChain: {
      chainId, // Will always be osmosis-1 on deposit; TODO: add the chain id of the opposite chain
      chainName, // Will always be Osmosis on deposit; TODO: add the chain name of the opposite chain
    },
  });

  const feeConfig = useFakeFeeConfig(
    chainStore,
    chainId,
    osmosisAccount?.cosmos.msgOpts.ibcTransfer.gas ?? 0
  );

  // WITHDRAW
  const withdrawAmountConfig = useAmountConfig(
    chainStore,
    queriesStore,
    chainId,
    osmosisAddress,
    feeConfig,
    balance.balance.currency
  );
  const osmosisPath = {
    address: osmoIcnsName === "" ? osmosisAddress : osmoIcnsName,
    networkName: chainStore.osmosis.chainName,
    iconUrl: "/tokens/osmo.svg",
    source: "account" as const,
  };
  const counterpartyPath = {
    address: ethWalletClient.accountAddress || "",
    networkName: sourceChainKey,
    iconUrl: balance.balance.currency.coinImageUrl,
    source: "counterpartyAccount" as const,
  };

  // DEPOSIT
  const [useWrappedToken, setUseWrappedToken] = useLocalStorageState(
    sourceChainConfig?.erc20ContractAddress &&
      sourceChainConfig?.nativeWrapEquivalent
      ? `bridge-${sourceChainConfig.erc20ContractAddress}-use-wrapped-token`
      : "",
    false // assume we're transferring native token, since it's the gas token as well and generally takes precedence
  );
  const useNativeToken =
    (sourceChainConfig?.nativeWrapEquivalent && !useWrappedToken) || false;
  const erc20Balance = useErc20Balance(
    ethWalletClient,
    !isWithdraw ? balance.balance.currency : undefined,
    sourceChainConfig?.erc20ContractAddress
  );
  const nativeBalance = useNativeBalance(
    ethWalletClient,
    !isWithdraw ? balance.balance.currency : undefined
  );
  const {
    amount: depositAmount,
    gasCost: _gasCost,
    setAmount: setDepositAmount,
    toggleIsMax: toggleIsDepositAmtMax,
  } = useEvmAmountConfig({
    sendFn: ethWalletClient.send,
    balance: useNativeToken
      ? nativeBalance ?? undefined
      : erc20Balance ?? undefined,
    address: ethWalletClient.accountAddress,
    gasCurrency: useNativeToken
      ? balance.balance.currency.originCurrency
      : undefined, // user will inspect gas costs in their wallet
  });

  const inputAmountRaw = isWithdraw
    ? withdrawAmountConfig.amount
    : depositAmount;

  const correctChainSelected =
    (EthClientChainIds_SourceChainMap[ethWalletClient.chainId as string] ??
      ethWalletClient.chainId) ===
    (AxelarChainIds_SourceChainMap[sourceChainKey] ?? sourceChainKey);
  const availableBalance = isWithdraw
    ? balance.balance
    : useNativeToken
    ? nativeBalance ?? undefined
    : sourceChainConfig?.erc20ContractAddress
    ? erc20Balance ?? undefined
    : undefined;
  const [lastDepositAccountEvmAddress, _setLastDepositAccountEvmAddress] =
    useLocalStorageState<string | null>(
      isWithdraw
        ? ""
        : `axelar-last-deposit-addr-${balance.balance.currency.coinMinimalDenom}`,
      null
    );
  const warnOfDifferentDepositAddress =
    isWithdraw &&
    ethWalletClient.isConnected &&
    lastDepositAccountEvmAddress &&
    ethWalletClient.accountAddress
      ? ethWalletClient.accountAddress !== lastDepositAccountEvmAddress
      : false;

  return (
    <ModalBase {...props} title={title} isOpen={props.isOpen && showModalBase}>
      <Transfer
        isWithdraw={isWithdraw}
        transferPath={[
          isWithdraw ? osmosisPath : counterpartyPath,
          isWithdraw ? counterpartyPath : osmosisPath,
        ]}
        selectedWalletDisplay={
          isWithdraw ? undefined : ethWalletClient.displayInfo
        }
        isOsmosisAccountLoaded={
          osmosisAccount?.walletStatus === WalletStatus.Connected
        }
        onRequestSwitchWallet={onRequestSwitchWallet}
        currentValue={inputAmountRaw}
        onInput={(value) =>
          isWithdraw
            ? withdrawAmountConfig.setAmount(value)
            : setDepositAmount(value)
        }
        availableBalance={
          isWithdraw || correctChainSelected ? availableBalance : undefined
        }
        warningMessage={
          warnOfDifferentDepositAddress
            ? t("assets.transfer.warnDepositAddressDifferent", {
                address: ethWalletClient.displayInfo.displayName,
              })
            : undefined
        }
        toggleIsMax={() => {
          if (isWithdraw) {
            withdrawAmountConfig.toggleIsMax();
          } else {
            toggleIsDepositAmtMax();
          }
        }}
        toggleUseWrappedConfig={
          sourceChainConfig?.nativeWrapEquivalent &&
          balance.balance.currency.originCurrency
            ? {
                isUsingWrapped: useWrappedToken,
                setIsUsingWrapped: (isUsingWrapped) => {
                  if (isWithdraw) {
                    withdrawAmountConfig.setAmount("");
                  } else {
                    setDepositAmount("");
                  }
                  setUseWrappedToken(isUsingWrapped);
                },
                nativeDenom: balance.balance.currency.originCurrency.coinDenom,
                wrapDenom: sourceChainConfig.nativeWrapEquivalent.wrapDenom,
              }
            : undefined
        }
        transferFee={bestQuote.fee}
        gasCost={bestQuote?.gasCost}
        waitTime={bestQuote.estimatedTime?.humanize() ?? ""}
        // disabled={
        //   (!isWithdraw && !!isEthTxPending) || userDisconnectedEthWallet
        // }
      />
      {/* <div className="mt-6 flex w-full items-center justify-center md:mt-4">
        {connectCosmosWalletButtonOverride ?? (
          <Button
            className={classNames(
              "transition-opacity duration-300 hover:opacity-75",
              { "opacity-30": isDepositAddressLoading }
            )}
            disabled={
              (!userCanInteract && !userDisconnectedEthWallet) ||
              (!isWithdraw &&
                !userDisconnectedEthWallet &&
                inputAmountRaw === "") ||
              (isWithdraw && inputAmountRaw === "") ||
              isInsufficientFee ||
              isInsufficientBal ||
              isSendTxPending ||
              isLoadingTransferFee
            }
            onClick={() => {
              if (!isWithdraw && userDisconnectedEthWallet)
                ethWalletClient.enable();
              else doAxelarTransfer();
            }}
          >
            {buttonErrorMessage
              ? buttonErrorMessage
              : isDepositAddressLoading
              ? `${t("assets.transfer.loading")}...`
              : isWithdraw
              ? t("assets.transfer.titleWithdraw", {
                  coinDenom: originCurrency.coinDenom,
                })
              : t("assets.transfer.titleDeposit", {
                  coinDenom: originCurrency.coinDenom,
                })}
          </Button>
        )}
      </div> */}
    </ModalBase>
  );
});
