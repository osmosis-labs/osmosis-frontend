import { FunctionComponent, useState, useEffect, useCallback } from "react";
import { observer } from "mobx-react-lite";
import classNames from "classnames";
import { Environment } from "@axelar-network/axelarjs-sdk";
import { CoinPretty, Dec, DecUtils } from "@keplr-wallet/unit";
import { WalletStatus } from "@keplr-wallet/stores";
import { basicIbcTransfer } from "@osmosis-labs/stores";
import { IS_TESTNET } from "../../config";
import {
  useFakeFeeConfig,
  useAmountConfig,
  useLocalStorageState,
} from "../../hooks";
import { IBCBalance } from "../../stores/assets";
import { useStore } from "../../stores";
import { Transfer } from "../../components/complex/transfer";
import { Button } from "../../components/buttons";
import { displayToast, ToastType } from "../../components/alert";
import { BridgeIntegrationProps } from "../../modals";
import { queryErc20Balance } from "../ethereum/queries";
import { useTxEventToasts } from "../use-client-tx-event-toasts";
import {
  ChainNames,
  EthWallet,
  transfer as erc20Transfer,
  useTxReceiptState,
} from "../ethereum";
import { useGeneralAmountConfig } from "../use-general-amount-config";
import { useDepositAddress, useTransferFeeQuery } from "./hooks";
import {
  AxelarBridgeConfig,
  AxelarChainIds_SourceChainMap,
  waitBySourceChain,
} from ".";
import { SourceChain, EthClientChainIds_SourceChainMap } from "../bridge-info";
import { useAmplitudeAnalytics } from "../../hooks/use-amplitude-analytics";
import { EventName } from "../../config/user-analytics-v2";
import { useTranslation } from "react-multi-lang";
import { getKeyByValue } from "../../utils/object";

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
    sourceChains,
    isTestNet = process.env.NEXT_PUBLIC_IS_TESTNET === "true",
    wrapAssetConfig,
    connectCosmosWalletButtonOverride,
  }) => {
    const { chainStore, accountStore, queriesStore, nonIbcBridgeHistoryStore } =
      useStore();
    const t = useTranslation();

    const { chainId } = chainStore.osmosis;
    const osmosisAccount = accountStore.getAccount(chainId);
    const { bech32Address } = osmosisAccount;
    const originCurrency = balanceOnOsmosis.balance.currency.originCurrency!;

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

    const sourceChainConfig = sourceChains.find(
      ({ id }) => id === selectedSourceChainKey
    );

    const erc20ContractAddress = sourceChainConfig?.erc20ContractAddress;

    const axelarChainId =
      chainStore.getChainFromCurrency(originCurrency.coinDenom)?.chainId ||
      "axelar-dojo-1";

    // get balance from EVM contract
    const [erc20Balance, setErc20Balance] = useState<CoinPretty | null>(null);
    useEffect(() => {
      if (
        erc20ContractAddress &&
        ethWalletClient.accountAddress &&
        !isWithdraw
      ) {
        queryErc20Balance(
          ethWalletClient.send,
          erc20ContractAddress,
          ethWalletClient.accountAddress
        ).then((amount) =>
          setErc20Balance(new CoinPretty(originCurrency, amount))
        );
      }
    }, [
      erc20ContractAddress,
      ethWalletClient.send,
      ethWalletClient.accountAddress,
      originCurrency,
    ]);

    // DEPOSITING: custom amount validation, since `useAmountConfig` needs to query counterparty Cosmos SDK chain balances (not evm balances)
    const {
      amount: depositAmount,
      setAmount: setDepositAmount,
      toggleIsMax: toggleIsDepositAmtMax,
    } = useGeneralAmountConfig({ balance: erc20Balance ?? undefined });

    // WITHDRAWING: is an IBC transfer Osmosis->Axelar
    const feeConfig = useFakeFeeConfig(
      chainStore,
      chainId,
      osmosisAccount.cosmos.msgOpts.ibcTransfer.gas
    );
    const withdrawAmountConfig = useAmountConfig(
      chainStore,
      queriesStore,
      chainId,
      bech32Address,
      feeConfig,
      balanceOnOsmosis.balance.currency
    );

    // chain path info whether withdrawing or depositing
    const osmosisPath = {
      address: bech32Address,
      networkName: chainStore.osmosis.chainName,
      iconUrl: "/tokens/osmo.svg",
    };
    const counterpartyPath = {
      address: ethWalletClient.accountAddress || "",
      networkName: selectedSourceChainKey,
      iconUrl: originCurrency.coinImageUrl,
    };

    /** Osmosis chain ID accepted by Axelar APIs. */
    const osmosisAxelarChainId = IS_TESTNET ? "osmosis-4" : "osmosis";
    const sourceChain = isWithdraw
      ? osmosisAxelarChainId
      : selectedSourceChainAxelarKey;
    const destChain = isWithdraw
      ? selectedSourceChainAxelarKey
      : osmosisAxelarChainId;
    const address = isWithdraw ? ethWalletClient.accountAddress : bech32Address;

    /** Amount, with decimals. e.g. 1.2 USDC */
    const amount = isWithdraw ? withdrawAmountConfig.amount : depositAmount;

    const { transferFee } = useTransferFeeQuery(
      sourceChain,
      destChain,
      originCurrency.coinMinimalDenom,
      amount,
      originCurrency,
      isTestNet ? Environment.TESTNET : Environment.MAINNET
    );

    const availableBalance = isWithdraw
      ? balanceOnOsmosis.balance
      : erc20ContractAddress
      ? erc20Balance ?? undefined
      : undefined;

    // track status of Axelar transfer
    const { isEthTxPending } = useTxReceiptState(ethWalletClient);
    const trackTransferStatus = useCallback(
      (txHash: string) => {
        if (amount !== "") {
          nonIbcBridgeHistoryStore.pushTxNow(
            `axelar${txHash}`,
            new CoinPretty(
              originCurrency,
              new Dec(amount).mul(
                // CoinPretty only accepts whole amounts
                DecUtils.getTenExponentNInPrecisionRange(
                  originCurrency.coinDecimals
                )
              )
            )
              .trim(true)
              .toString(),
            isWithdraw,
            osmosisAccount.bech32Address // use osmosis account for account keys (vs any EVM account)
          );
        }
      },
      [nonIbcBridgeHistoryStore, originCurrency, amount, isWithdraw]
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

    const { depositAddress, isLoading: isDepositAddressLoading } =
      useDepositAddress(
        sourceChain,
        destChain,
        isWithdraw || correctChainSelected ? address : undefined,
        originCurrency.coinMinimalDenom,
        undefined,
        isTestNet ? Environment.TESTNET : Environment.MAINNET
      );

    // notify user they are withdrawing into a different account then they last deposited to
    const [lastDepositAccountAddress, setLastDepositAccountAddress] =
      useLocalStorageState<string | null>(
        `axelar-last-deposit-addr-${originCurrency.coinMinimalDenom}`,
        null
      );
    const warnOfDifferentDepositAddress =
      isWithdraw &&
      ethWalletClient.isConnected &&
      lastDepositAccountAddress &&
      ethWalletClient.accountAddress
        ? ethWalletClient.accountAddress !== lastDepositAccountAddress
        : false;

    // start transfer
    const [transferInitiated, setTransferInitiated] = useState(false);
    const doAxelarTransfer = useCallback(async () => {
      if (depositAddress) {
        logEvent([
          isWithdraw
            ? EventName.Assets.withdrawAssetStarted
            : EventName.Assets.depositAssetStarted,
          {
            tokenName: originCurrency.coinDenom,
            tokenAmount: Number(amount),
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
                    tokenAmount: Number(amount),
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

          if (erc20ContractAddress) {
            // erc20 transfer to deposit address on EVM
            try {
              await erc20Transfer(
                ethWalletClient.send,
                new CoinPretty(
                  originCurrency,
                  new Dec(amount).mul(
                    // CoinPretty only accepts whole amounts
                    DecUtils.getTenExponentNInPrecisionRange(
                      originCurrency.coinDecimals
                    )
                  )
                ).toCoin().amount,
                erc20ContractAddress,
                ethWalletClient.accountAddress!,
                depositAddress
              ).then((txHash) => {
                trackTransferStatus(txHash as string);
                setLastDepositAccountAddress(ethWalletClient.accountAddress!);
                logEvent([
                  EventName.Assets.depositAssetCompleted,
                  {
                    tokenName: originCurrency.coinDenom,
                    tokenAmount: Number(amount),
                    bridge: "axelar",
                  },
                ]);
              });
            } catch (e: any) {
              const msg = ethWalletClient.displayError?.(e);
              if (typeof msg === "string") {
                displayToast(
                  {
                    message: "Transaction Failed",
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
      }
      setTransferInitiated(true);
    }, [
      axelarChainId,
      chainId,
      balanceOnOsmosis.sourceChannelId,
      balanceOnOsmosis.destChannelId,
      depositAddress,
      depositAmount,
      erc20ContractAddress,
      ethWalletClient,
      isWithdraw,
      originCurrency,
      osmosisAccount,
      trackTransferStatus,
      withdrawAmountConfig,
    ]);
    // close modal when initial eth transaction is committed
    const isSendTxPending = isWithdraw
      ? osmosisAccount.txTypeInProgress !== ""
      : isEthTxPending || ethWalletClient.isSending === "eth_sendTransaction";
    useEffect(() => {
      if (transferInitiated && !isSendTxPending) {
        onRequestClose();
      }
    }, [
      transferInitiated,
      osmosisAccount.txTypeInProgress,
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
      (isWithdraw && osmosisAccount.txTypeInProgress === "");
    const isInsufficientFee =
      amount !== "" &&
      transferFee !== undefined &&
      new CoinPretty(
        originCurrency,
        new Dec(amount).mul(
          // CoinPretty only accepts whole amounts
          DecUtils.getTenExponentNInPrecisionRange(originCurrency.coinDecimals)
        )
      )
        .moveDecimalPointRight(originCurrency.coinDecimals)
        .toDec()
        .lt(transferFee.toDec());
    const isInsufficientBal =
      amount !== "" &&
      availableBalance &&
      new CoinPretty(
        originCurrency,
        new Dec(amount).mul(
          // CoinPretty only accepts whole amounts
          DecUtils.getTenExponentNInPrecisionRange(originCurrency.coinDecimals)
        )
      )
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
            {
              bridgeName: "Axelar",
              bridgeIconUrl: "/icons/axelar.svg",
              isLoading: isDepositAddressLoading,
            },
            isWithdraw ? counterpartyPath : osmosisPath,
          ]}
          selectedWalletDisplay={
            isWithdraw ? undefined : ethWalletClient.displayInfo
          }
          isOsmosisAccountLoaded={
            osmosisAccount.walletStatus === WalletStatus.Loaded
          }
          onRequestSwitchWallet={onRequestSwitchWallet}
          currentValue={amount}
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
          transferFee={transferFee}
          waitTime={waitBySourceChain(selectedSourceChainKey)}
          disabled={!userCanInteract}
          disablePanel={
            (!isWithdraw && !!isEthTxPending) || userDisconnectedEthWallet
          }
        />
        {wrapAssetConfig && (
          <div className="mx-auto text-wosmongton-300">
            <a rel="noreferrer" target="_blank" href={wrapAssetConfig.url}>
              {t("assets.transfer.wrapNativeLink", wrapAssetConfig)}
            </a>
          </div>
        )}
        <div className="mt-6 flex w-full items-center justify-center md:mt-4">
          {connectCosmosWalletButtonOverride ?? (
            <Button
              className={classNames(
                "transition-opacity duration-300 hover:opacity-75",
                { "opacity-30": isDepositAddressLoading }
              )}
              disabled={
                !userCanInteract ||
                (!isWithdraw && !userDisconnectedEthWallet && amount === "") ||
                (isWithdraw && amount === "") ||
                isInsufficientFee ||
                isInsufficientBal ||
                isSendTxPending
              }
              onClick={() => {
                if (!isWithdraw && userDisconnectedEthWallet)
                  ethWalletClient.enable();
                else doAxelarTransfer();
              }}
            >
              {buttonErrorMessage
                ? buttonErrorMessage
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
