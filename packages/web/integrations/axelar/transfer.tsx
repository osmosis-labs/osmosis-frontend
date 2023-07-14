import { Environment } from "@axelar-network/axelarjs-sdk";
import { WalletStatus } from "@cosmos-kit/core";
import { CoinPretty, Dec, DecUtils } from "@keplr-wallet/unit";
import { basicIbcTransfer } from "@osmosis-labs/stores";
import classNames from "classnames";
import { observer } from "mobx-react-lite";
import {
  FunctionComponent,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useTranslation } from "react-multi-lang";

import { displayToast, ToastType } from "~/components/alert";
import { Button } from "~/components/buttons";
import { Transfer } from "~/components/complex/transfer";
import { EventName } from "~/config/user-analytics-v2";
import {
  useAmountConfig,
  useFakeFeeConfig,
  useLocalStorageState,
} from "~/hooks";
import { useAmplitudeAnalytics } from "~/hooks/use-amplitude-analytics";
import {
  useDepositAddress,
  useTransferFeeQuery,
} from "~/integrations/axelar/hooks";
import {
  EthClientChainIds_SourceChainMap,
  SourceChain,
} from "~/integrations/bridge-info";
import {
  ChainNames,
  EthWallet,
  send,
  transfer as erc20Transfer,
  useErc20Balance,
  useNativeBalance,
  useTxReceiptState,
} from "~/integrations/ethereum";
import { useAmountConfig as useEvmAmountConfig } from "~/integrations/ethereum/hooks/use-amount-config";
import { useTxEventToasts } from "~/integrations/use-client-tx-event-toasts";
import { BridgeIntegrationProps } from "~/modals";
import { useStore } from "~/stores";
import { IBCBalance } from "~/stores/assets";
import { getKeyByValue } from "~/utils/object";

import {
  AxelarBridgeConfig,
  AxelarChainIds_SourceChainMap,
  waitByTransferFromSourceChain,
} from ".";

/** Axelar-specific bridge transfer integration UI. */
const AxelarTransfer: FunctionComponent<
  {
    isWithdraw: boolean;
    ethWalletClient: EthWallet;
    balanceOnOsmosis: IBCBalance;
    selectedSourceChainKey: SourceChain;
    onRequestClose: () => void;
    onRequestSwitchWallet: () => void;
    isTestNet?: boolean;
    useWrappedToken?: boolean;
  } & BridgeIntegrationProps &
    AxelarBridgeConfig
> = observer(
  ({
    isWithdraw,
    ethWalletClient,
    balanceOnOsmosis,
    selectedSourceChainKey,
    onRequestClose,
    onRequestSwitchWallet,
    sourceChainTokens,
    isTestNet = false,
    connectCosmosWalletButtonOverride,
  }) => {
    const {
      chainStore,
      accountStore,
      queriesStore,
      queriesExternalStore,
      nonIbcBridgeHistoryStore,
    } = useStore();
    const t = useTranslation();

    const { chainId } = chainStore.osmosis;
    const osmosisAccount = accountStore.getWallet(chainId);
    const address = osmosisAccount?.address ?? "";
    const osmoIcnsName =
      queriesExternalStore.queryICNSNames.getQueryContract(address).primaryName;

    useTxEventToasts(ethWalletClient);

    const { logEvent } = useAmplitudeAnalytics();

    // notify eth wallet of prev selected preferred chain
    useEffect(() => {
      let ethClientChainName: string | undefined =
        getKeyByValue(
          EthClientChainIds_SourceChainMap,
          selectedSourceChainKey
        ) ?? selectedSourceChainKey;

      let hexChainId: string | undefined = getKeyByValue(
        ChainNames,
        ethClientChainName
      )
        ? ethClientChainName
        : undefined;

      if (!hexChainId) return;

      ethWalletClient.setPreferredSourceChain(hexChainId);
    }, [selectedSourceChainKey, ethWalletClient]);

    /** Chain key that Axelar accepts in APIs. */
    const selectedSourceChainAxelarKey =
      getKeyByValue(AxelarChainIds_SourceChainMap, selectedSourceChainKey) ??
      selectedSourceChainKey;

    // source chain info
    const sourceChainConfig = sourceChainTokens.find(
      ({ id }) => id === selectedSourceChainKey
    );
    const erc20ContractAddress = sourceChainConfig?.erc20ContractAddress;
    const [useWrappedToken, setUseWrappedToken] = useLocalStorageState(
      sourceChainConfig?.erc20ContractAddress &&
        sourceChainConfig?.nativeWrapEquivalent
        ? `bridge-${sourceChainConfig.erc20ContractAddress}-use-wrapped-token`
        : "",
      false // assume we're transferring native token, since it's the gas token as well and generally takes precedence
    );
    /** Can be native or wrapped version of token. */
    const useNativeToken =
      (sourceChainConfig?.nativeWrapEquivalent && !useWrappedToken) || false;

    const wrapCurrency = useMemo(
      () =>
        sourceChainConfig?.nativeWrapEquivalent
          ? {
              ...balanceOnOsmosis.balance.currency.originCurrency!,
              coinDenom: sourceChainConfig.nativeWrapEquivalent.wrapDenom,
            }
          : undefined,
      [sourceChainConfig, balanceOnOsmosis]
    );
    const originCurrency = useMemo(
      () =>
        !useNativeToken && wrapCurrency
          ? wrapCurrency
          : balanceOnOsmosis.balance.currency.originCurrency!,
      [
        useNativeToken,
        balanceOnOsmosis.balance.currency.originCurrency,
        wrapCurrency,
      ]
    );

    const axelarChainId =
      chainStore.getChainFromCurrency(originCurrency.coinDenom)?.chainId ||
      "axelar-dojo-1";

    const erc20Balance = useErc20Balance(
      ethWalletClient,
      !isWithdraw ? originCurrency : undefined,
      erc20ContractAddress
    );
    const nativeBalance = useNativeBalance(
      ethWalletClient,
      !isWithdraw ? originCurrency : undefined
    );

    // DEPOSITING: custom amount validation, since `useAmountConfig` needs to query counterparty Cosmos SDK chain balances (not evm balances)
    const {
      amount: depositAmount,
      gasCost,
      setAmount: setDepositAmount,
      toggleIsMax: toggleIsDepositAmtMax,
    } = useEvmAmountConfig({
      sendFn: ethWalletClient.send,
      balance: useNativeToken
        ? nativeBalance ?? undefined
        : erc20Balance ?? undefined,
      address: ethWalletClient.accountAddress,
      gasCurrency: useNativeToken
        ? balanceOnOsmosis.balance.currency.originCurrency
        : undefined, // user will inspect gas costs in their wallet
    });

    // WITHDRAWING: is an IBC transfer Osmosis->Axelar
    const feeConfig = useFakeFeeConfig(
      chainStore,
      chainId,
      osmosisAccount?.cosmos.msgOpts.ibcTransfer.gas ?? 0
    );
    const withdrawAmountConfig = useAmountConfig(
      chainStore,
      queriesStore,
      chainId,
      address,
      feeConfig,
      balanceOnOsmosis.balance.currency
    );

    /** Amount, with decimals. e.g. 1.2 USDC */
    const inputAmountRaw = isWithdraw
      ? withdrawAmountConfig.amount
      : depositAmount;
    const inputAmount = new Dec(
      inputAmountRaw === "" ? "0" : inputAmountRaw
    ).mul(
      // CoinPretty only accepts whole amounts
      DecUtils.getTenExponentNInPrecisionRange(originCurrency.coinDecimals)
    );

    // chain path info whether withdrawing or depositing
    const osmosisPath = {
      address: osmoIcnsName === "" ? address : osmoIcnsName,
      networkName: chainStore.osmosis.chainName,
      iconUrl: "/tokens/osmo.svg",
      source: "account" as const,
    };
    const counterpartyPath = {
      address: ethWalletClient.accountAddress || "",
      networkName: selectedSourceChainKey,
      iconUrl: originCurrency.coinImageUrl,
      source: "counterpartyAccount" as const,
    };

    /** Osmosis chain ID accepted by Axelar APIs. */
    const osmosisAxelarChainId = isTestNet ? "osmosis-6" : "osmosis";
    const sourceChain = isWithdraw
      ? osmosisAxelarChainId
      : selectedSourceChainAxelarKey;
    const destChain = isWithdraw
      ? selectedSourceChainAxelarKey
      : osmosisAxelarChainId;
    const accountAddress = isWithdraw
      ? ethWalletClient.accountAddress
      : address;

    const { transferFee, isLoading: isLoadingTransferFee } =
      useTransferFeeQuery(
        sourceChain,
        destChain,
        originCurrency.coinMinimalDenom, // Canh Trinh: native autowrap: currently transfer query only works with wrapped denoms, even though it's a native transfer. fee should be the equivalent
        inputAmountRaw === "" ? "1" : inputAmountRaw,
        originCurrency,
        isTestNet ? Environment.TESTNET : Environment.MAINNET
      );

    const availableBalance = isWithdraw
      ? balanceOnOsmosis.balance
      : useNativeToken
      ? nativeBalance ?? undefined
      : erc20ContractAddress
      ? erc20Balance ?? undefined
      : undefined;

    // track status of Axelar transfer
    const { isEthTxPending } = useTxReceiptState(ethWalletClient);
    const trackTransferStatus = useCallback(
      (txHash: string) => {
        if (inputAmountRaw !== "") {
          nonIbcBridgeHistoryStore.pushTxNow(
            `axelar${txHash}`,
            new CoinPretty(originCurrency, inputAmount).trim(true).toString(),
            isWithdraw,
            osmosisAccount?.address ?? "" // use osmosis account for account keys (vs any EVM account)
          );
        }
      },
      [
        nonIbcBridgeHistoryStore,
        originCurrency,
        inputAmountRaw,
        inputAmount,
        isWithdraw,
        osmosisAccount?.address,
      ]
    );

    // detect user disconnecting wallet
    const [userDisconnectedEthWallet, setUserDisconnectedWallet] =
      useState(false);
    useEffect(() => {
      if (!ethWalletClient.isConnected) {
        setUserDisconnectedWallet(true);
      }
      if (ethWalletClient.isConnected && userDisconnectedEthWallet) {
        setUserDisconnectedWallet(false);
      }
    }, [ethWalletClient.isConnected, userDisconnectedEthWallet]);

    const correctChainSelected =
      (EthClientChainIds_SourceChainMap[ethWalletClient.chainId as string] ??
        ethWalletClient.chainId) ===
      (AxelarChainIds_SourceChainMap[selectedSourceChainAxelarKey] ??
        selectedSourceChainAxelarKey);

    // get deposit address
    const destinationAddress =
      isWithdraw || correctChainSelected ? accountAddress : undefined;
    const axelarApiEnv = isTestNet ? Environment.TESTNET : Environment.MAINNET;
    const shouldGenAddress = isWithdraw
      ? balanceOnOsmosis.balance.toDec().gt(new Dec(0)) // if there's nothing to withdraw from, don't generate an address
      : true;
    // normal case, address with wrapped source token (WETH)
    const {
      depositAddress: wrapDepositAddress,
      isLoading: isWrapDepositAddressLoading,
    } = useDepositAddress(
      sourceChain,
      destChain,
      destinationAddress,
      originCurrency.coinMinimalDenom,
      false,
      axelarApiEnv,
      !useNativeToken && shouldGenAddress
    );
    const baseDenom = isWithdraw
      ? originCurrency.coinMinimalDenom // withdraw uses wrapped denom
      : sourceChainConfig?.nativeWrapEquivalent?.tokenMinDenom ?? // deposit uses native/gas token denom
        originCurrency.coinMinimalDenom;
    // address that auto un/wraps our wrapped representation (ETH)
    const {
      depositAddress: autowrapDepositAddress,
      isLoading: isAutowrapAddressLoading,
    } = useDepositAddress(
      sourceChain,
      destChain,
      destinationAddress,
      baseDenom,
      isWithdraw,
      axelarApiEnv,
      useNativeToken && shouldGenAddress // should generate
    );
    const isDepositAddressLoading = useNativeToken
      ? isAutowrapAddressLoading
      : isWrapDepositAddressLoading;
    const depositAddress = useNativeToken
      ? autowrapDepositAddress
      : wrapDepositAddress;

    // notify user they are withdrawing into a different account then they last deposited to
    const [lastDepositAccountEvmAddress, setLastDepositAccountEvmAddress] =
      useLocalStorageState<string | null>(
        isWithdraw
          ? ""
          : `axelar-last-deposit-addr-${originCurrency.coinMinimalDenom}`,
        null
      );
    const warnOfDifferentDepositAddress =
      isWithdraw &&
      ethWalletClient.isConnected &&
      lastDepositAccountEvmAddress &&
      ethWalletClient.accountAddress
        ? ethWalletClient.accountAddress !== lastDepositAccountEvmAddress
        : false;

    // start transfer
    const [transferInitiated, setTransferInitiated] = useState(false);
    const doAxelarTransfer = async () => {
      if (depositAddress) {
        logEvent([
          isWithdraw
            ? EventName.Assets.withdrawAssetStarted
            : EventName.Assets.depositAssetStarted,
          {
            tokenName: originCurrency.coinDenom,
            tokenAmount: Number(inputAmountRaw),
            bridge: "axelar",
          },
        ]);
        if (isWithdraw) {
          // IBC transfer to generated axelar address
          try {
            await basicIbcTransfer(
              {
                account: osmosisAccount,
                chainId,
                channelId: balanceOnOsmosis.sourceChannelId,
              },
              {
                account: depositAddress,
                chainId: axelarChainId,
                channelId: balanceOnOsmosis.destChannelId,
              },
              withdrawAmountConfig,
              undefined,
              (event) => {
                trackTransferStatus(event.txHash);
                logEvent([
                  EventName.Assets.withdrawAssetCompleted,
                  {
                    tokenName: originCurrency.coinDenom,
                    tokenAmount: Number(inputAmountRaw),
                    bridge: "axelar",
                  },
                ]);
              }
            );
          } catch (e) {
            // errors are displayed as toasts from a handler in root store
            console.error(e);
          }
        } else {
          // isDeposit

          if (useNativeToken) {
            try {
              const txHash = await send(
                ethWalletClient.send,
                new CoinPretty(originCurrency, inputAmount).toCoin().amount,
                ethWalletClient.accountAddress!,
                depositAddress
              );
              trackTransferStatus(txHash as string);
              setLastDepositAccountEvmAddress(ethWalletClient.accountAddress!);
              logEvent([
                EventName.Assets.depositAssetCompleted,
                {
                  tokenName: originCurrency.coinDenom,
                  tokenAmount: Number(inputAmountRaw),
                  bridge: "axelar",
                },
              ]);
            } catch (e) {
              const msg = ethWalletClient.displayError?.(e);
              if (typeof msg === "string") {
                displayToast(
                  {
                    message: "transactionFailed",
                    caption: msg,
                  },
                  ToastType.ERROR
                );
              } else if (msg) {
                displayToast(msg, ToastType.ERROR);
              } else {
                console.error(e);
              }
            }
          } else if (erc20ContractAddress) {
            // erc20 transfer to deposit address on EVM
            try {
              const txHash = await erc20Transfer(
                ethWalletClient.send,
                new CoinPretty(originCurrency, inputAmount).toCoin().amount,
                erc20ContractAddress,
                ethWalletClient.accountAddress!,
                depositAddress
              );
              trackTransferStatus(txHash as string);
              setLastDepositAccountEvmAddress(ethWalletClient.accountAddress!);
              logEvent([
                EventName.Assets.depositAssetCompleted,
                {
                  tokenName: originCurrency.coinDenom,
                  tokenAmount: Number(inputAmountRaw),
                  bridge: "axelar",
                },
              ]);
            } catch (e: any) {
              const msg = ethWalletClient.displayError?.(e);
              if (typeof msg === "string") {
                displayToast(
                  {
                    message: "transactionFailed",
                    caption: msg,
                  },
                  ToastType.ERROR
                );
              } else if (msg) {
                displayToast(msg, ToastType.ERROR);
              } else {
                console.error(e);
              }
            }
          } else {
            console.error(
              "Axelar asset and/or network not configured properly. IBC transfers from counterparty Cosmos chains to Axelar deposit address are irrelevant."
            );
          }
        }
        if (isWithdraw) {
          withdrawAmountConfig.setAmount("");
        } else {
          setDepositAmount("");
        }
        setTransferInitiated(true);
      }
    };

    // close modal when initial eth transaction is committed
    const isSendTxPending = isWithdraw
      ? osmosisAccount?.txTypeInProgress !== ""
      : isEthTxPending || ethWalletClient.isSending === "eth_sendTransaction";
    useEffect(() => {
      if (transferInitiated && !isSendTxPending) {
        onRequestClose();
      }
    }, [
      transferInitiated,
      isSendTxPending,
      osmosisAccount?.txTypeInProgress,
      ethWalletClient.isSending,
      isEthTxPending,
      onRequestClose,
    ]);

    /** User can interact with any of the controls on the modal. */
    const userCanInteract =
      (!isWithdraw &&
        !userDisconnectedEthWallet &&
        correctChainSelected &&
        !isDepositAddressLoading &&
        !isEthTxPending) ||
      (isWithdraw && osmosisAccount?.txTypeInProgress === "");
    const isInsufficientFee =
      inputAmountRaw !== "" &&
      transferFee !== undefined &&
      new CoinPretty(originCurrency, inputAmount)
        .toDec()
        .lt(transferFee.toDec());
    const isInsufficientBal =
      inputAmountRaw !== "" &&
      availableBalance &&
      new CoinPretty(originCurrency, inputAmount)
        .toDec()
        .gt(availableBalance.toDec());
    const buttonErrorMessage = userDisconnectedEthWallet
      ? t("assets.transfer.errors.reconnectWallet", {
          walletName: ethWalletClient.displayInfo.displayName,
        })
      : !isWithdraw && !correctChainSelected
      ? t("assets.transfer.errors.wrongNetworkInWallet", {
          walletName: ethWalletClient.displayInfo.displayName,
        })
      : isInsufficientFee
      ? t("assets.transfer.errors.insufficientFee")
      : isInsufficientBal
      ? t("assets.transfer.errors.insufficientBal")
      : undefined;

    return (
      <>
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
            balanceOnOsmosis.balance.currency.originCurrency
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
                  nativeDenom:
                    balanceOnOsmosis.balance.currency.originCurrency.coinDenom,
                  wrapDenom: sourceChainConfig.nativeWrapEquivalent.wrapDenom,
                }
              : undefined
          }
          transferFee={transferFee}
          gasCost={gasCost?.maxDecimals(8)}
          waitTime={waitByTransferFromSourceChain(
            isWithdraw ? "Osmosis" : selectedSourceChainKey
          )}
          disabled={
            (!isWithdraw && !!isEthTxPending) || userDisconnectedEthWallet
          }
        />
        <div className="mt-6 flex w-full items-center justify-center md:mt-4">
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
        </div>
      </>
    );
  }
);

// accommodate next/dynamic
export default AxelarTransfer;
