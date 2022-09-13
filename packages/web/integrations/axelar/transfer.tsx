import { FunctionComponent, useState, useEffect, useCallback } from "react";
import { observer } from "mobx-react-lite";
import classNames from "classnames";
import { Environment } from "@axelar-network/axelarjs-sdk";
import { CoinPretty, Dec } from "@keplr-wallet/unit";
import { WalletStatus } from "@keplr-wallet/stores";
import { basicIbcTransfer } from "@osmosis-labs/stores";
import {
  useFakeFeeConfig,
  useAmountConfig,
  useLocalStorageState,
} from "../../hooks";
import { IBCBalance } from "../../stores/assets";
import { useStore } from "../../stores";
import { Transfer } from "../../components/complex/transfer";
import { Button } from "../../components/buttons";
import { getKeyByValue } from "../../components/utils";
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
import { useDepositAddress } from "./hooks";
import {
  AxelarBridgeConfig,
  SourceChain,
  EthClientChainIds_AxelarChainIdsMap,
  waitBySourceChain,
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
    tokenMinDenom,
    transferFeeMinAmount,
    sourceChains,
    isTestNet = process.env.NEXT_PUBLIC_IS_TESTNET === "true",
    connectCosmosWalletButtonOverride,
  }) => {
    const { chainStore, accountStore, queriesStore, nonIbcBridgeHistoryStore } =
      useStore();
    const { chainId } = chainStore.osmosis;
    const osmosisAccount = accountStore.getAccount(chainId);
    const { bech32Address } = osmosisAccount;
    const originCurrency = balanceOnOsmosis.balance.currency.originCurrency!;

    useTxEventToasts(ethWalletClient);

    // notify eth wallet of prev selected preferred chain
    useEffect(() => {
      let hexChainId: string | undefined = getKeyByValue(
        ChainNames,
        selectedSourceChainKey
      )
        ? selectedSourceChainKey
        : undefined;

      if (!hexChainId) {
        hexChainId = getKeyByValue(
          EthClientChainIds_AxelarChainIdsMap,
          selectedSourceChainKey
        );
      }
      if (!hexChainId) return;

      ethWalletClient.setPreferredSourceChain(hexChainId);
    }, [selectedSourceChainKey, ethWalletClient]);

    /** Chain key that Axelar accepts in APIs. */
    const selectedSourceChainAxelarKey =
      EthClientChainIds_AxelarChainIdsMap[selectedSourceChainKey] ??
      selectedSourceChainKey;

    const erc20ContractAddress = sourceChains.find(
      ({ id }) => id === selectedSourceChainKey
    )?.erc20ContractAddress;
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

    const sourceChain = isWithdraw ? "osmosis" : selectedSourceChainAxelarKey;
    const destChain = isWithdraw ? selectedSourceChainAxelarKey : "osmosis";
    const address = isWithdraw ? ethWalletClient.accountAddress : bech32Address;

    /** Amount, with decimals. e.g. 1.2 USDC */
    const amount = isWithdraw ? withdrawAmountConfig.amount : depositAmount;

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
            new CoinPretty(originCurrency, amount)
              .moveDecimalPointRight(originCurrency.coinDecimals)
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
      (EthClientChainIds_AxelarChainIdsMap[ethWalletClient.chainId as string] ??
        ethWalletClient.chainId) === selectedSourceChainAxelarKey;

    const { depositAddress, isLoading: isDepositAddressLoading } =
      useDepositAddress(
        sourceChain,
        destChain,
        isWithdraw || correctChainSelected ? address : undefined,
        tokenMinDenom,
        undefined,
        isTestNet ? Environment.TESTNET : Environment.MAINNET
      );

    // notify user they are withdrawing into a different account then they last deposited to
    const [lastDepositAccountAddress, setLastDepositAccountAddress] =
      useLocalStorageState<string | null>(
        `axelar-last-deposit-addr-${tokenMinDenom}`,
        null
      );
    const warnOfDifferentDepositAddress =
      isWithdraw &&
      ethWalletClient.isConnected &&
      ethWalletClient.accountAddress
        ? ethWalletClient.accountAddress !== lastDepositAccountAddress
        : false;

    // start transfer
    const [transferInitiated, setTransferInitiated] = useState(false);
    const doAxelarTransfer = useCallback(async () => {
      if (depositAddress) {
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
              (event) => trackTransferStatus(event.txHash)
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
                new CoinPretty(originCurrency, depositAmount)
                  .moveDecimalPointRight(originCurrency.coinDecimals)
                  .toCoin().amount,
                erc20ContractAddress,
                ethWalletClient.accountAddress!,
                depositAddress
              ).then((txHash) => {
                trackTransferStatus(txHash as string);
                setLastDepositAccountAddress(ethWalletClient.accountAddress!);
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
      new CoinPretty(originCurrency, amount)
        .moveDecimalPointRight(originCurrency.coinDecimals)
        .toDec()
        .lt(
          new CoinPretty(originCurrency, new Dec(transferFeeMinAmount)).toDec()
        );
    const isInsufficientBal =
      amount !== "" &&
      availableBalance &&
      new CoinPretty(originCurrency, amount)
        .moveDecimalPointRight(originCurrency.coinDecimals)
        .toDec()
        .gt(availableBalance.toDec());
    const buttonErrorMessage = userDisconnectedEthWallet
      ? `Reconnect ${ethWalletClient.displayInfo.displayName}`
      : !isWithdraw && !correctChainSelected
      ? `Wrong network in ${ethWalletClient.displayInfo.displayName}`
      : isInsufficientFee
      ? "Insufficient fee"
      : isInsufficientBal
      ? "Insufficient balance"
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
              ? `Warning: the selected account in ${ethWalletClient.displayInfo.displayName} differs from the account you last deposited with.`
              : undefined
          }
          toggleIsMax={() => {
            if (isWithdraw) {
              withdrawAmountConfig.toggleIsMax();
            } else {
              toggleIsDepositAmtMax();
            }
          }}
          transferFee={
            new CoinPretty(originCurrency, new Dec(transferFeeMinAmount))
          }
          waitTime={waitBySourceChain(selectedSourceChainKey)}
          disabled={!userCanInteract}
          disablePanel={
            (!isWithdraw && !!isEthTxPending) || userDisconnectedEthWallet
          }
        />
        <div className="w-full md:mt-4 mt-6 flex items-center justify-center">
          {connectCosmosWalletButtonOverride ?? (
            <Button
              className={classNames(
                "md:w-full w-2/3 md:p-4 p-6 hover:opacity-75 rounded-2xl transition-opacity duration-300",
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
              loading={isSendTxPending}
              onClick={() => {
                if (!isWithdraw && userDisconnectedEthWallet)
                  ethWalletClient.enable();
                else doAxelarTransfer();
              }}
            >
              <h6 className="md:text-base text-lg">
                {buttonErrorMessage
                  ? buttonErrorMessage
                  : isWithdraw
                  ? "Withdraw"
                  : "Deposit"}
              </h6>
            </Button>
          )}
        </div>
      </>
    );
  }
);

// accommodate next/dynamic
export default AxelarTransfer;
