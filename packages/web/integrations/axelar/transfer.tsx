import { FunctionComponent, useState, useEffect, useCallback } from "react";
import { observer } from "mobx-react-lite";
import classNames from "classnames";
import { Environment } from "@axelar-network/axelarjs-sdk";
import { CoinPretty, Dec } from "@keplr-wallet/unit";
import { basicIbcTransfer } from "@osmosis-labs/stores";
import { useFakeFeeConfig, useAmountConfig } from "../../hooks";
import { IBCBalance } from "../../stores/assets";
import { useStore } from "../../stores";
import { Transfer } from "../../components/complex/transfer";
import { Button } from "../../components/buttons";
import { displayToast, ToastType } from "../../components/alert";
import { queryErc20Balance } from "../ethereum/queries";
import {
  EthWallet,
  transfer as erc20Transfer,
  useTxReceiptState,
} from "../ethereum";
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
  } & AxelarBridgeConfig
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
  }) => {
    const { chainStore, accountStore, queriesStore, nonIbcBridgeHistoryStore } =
      useStore();
    const { chainId } = chainStore.osmosis;
    const osmosisAccount = accountStore.getAccount(chainId);
    const { bech32Address } = osmosisAccount;
    const originCurrency = balanceOnOsmosis.balance.currency.originCurrency!;

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
    const [counterpartyBal, setCounterpartyBal] = useState<CoinPretty | null>(
      null
    );
    useEffect(() => {
      if (erc20ContractAddress && ethWalletClient.accountAddress) {
        queryErc20Balance(
          ethWalletClient.send,
          erc20ContractAddress,
          ethWalletClient.accountAddress
        ).then((amount) =>
          setCounterpartyBal(new CoinPretty(originCurrency, amount))
        );
      }
    }, [
      erc20ContractAddress,
      ethWalletClient.send,
      ethWalletClient.accountAddress,
      originCurrency,
    ]);

    // DEPOSITING: custom amount validation, since `useAmountConfig` needs to query counterparty Cosmos SDK chain balances (not evm balances)
    const [depositAmount, do_setDepositAmount] = useState("");
    const setDepositAmount = useCallback(
      (amount: string) => {
        if (amount.startsWith(".")) {
          amount = "0" + amount;
        }
        do_setDepositAmount(amount);
      },
      [do_setDepositAmount]
    );
    const [isDepositAmtMax, setDepositAmountMax] = useState(false);

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
      ? counterpartyBal ?? undefined
      : undefined;

    const { depositAddress, isLoading: isDepositAddressLoading } =
      useDepositAddress(
        sourceChain,
        destChain,
        address,
        tokenMinDenom,
        undefined,
        isTestNet ? Environment.TESTNET : Environment.MAINNET
      );

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
            isWithdraw
          );
        }
      },
      [nonIbcBridgeHistoryStore, originCurrency, amount, isWithdraw]
    );
    useEffect(() => {
      if (isEthTxPending) onRequestClose();
    }, [isEthTxPending, onRequestClose]);

    // detect user disconnecting wallet
    const [userDisconnectedWallet, setUserDisconnectedWallet] = useState(false);
    useEffect(() => {
      if (!ethWalletClient.isConnected) {
        setUserDisconnectedWallet(true);
      }
      if (ethWalletClient.isConnected && userDisconnectedWallet) {
        setUserDisconnectedWallet(false);
      }
    }, [ethWalletClient.isConnected, userDisconnectedWallet]);

    const transfer = useCallback(async () => {
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
            // common Keplr errors are displayed as toasts from root store
            console.error(e);
            return;
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
              ).then((txHash) => trackTransferStatus(txHash as string));
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
        onRequestClose();
      }
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

    const correctChainSelected =
      (EthClientChainIds_AxelarChainIdsMap[ethWalletClient.chainId as string] ??
        ethWalletClient.chainId) === selectedSourceChainAxelarKey;
    const userCanInteract =
      userDisconnectedWallet ||
      (!isDepositAddressLoading && correctChainSelected && !isEthTxPending);
    const buttonErrorMessage = userDisconnectedWallet
      ? `Reconnect ${ethWalletClient.displayInfo.displayName}`
      : !correctChainSelected
      ? `Wrong network in ${ethWalletClient.displayInfo.displayName}`
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
          onRequestSwitchWallet={onRequestSwitchWallet}
          currentValue={amount}
          onInput={(value) =>
            isWithdraw // withdrawals are an IBC transfer Osmosis->Axelar
              ? withdrawAmountConfig.setAmount(value)
              : setDepositAmount(value)
          }
          availableBalance={correctChainSelected ? availableBalance : undefined}
          toggleIsMax={() => {
            if (isWithdraw) {
              withdrawAmountConfig.toggleIsMax();
            } else {
              if (isDepositAmtMax) {
                setDepositAmount("0");
                setDepositAmountMax(false);
              } else if (availableBalance) {
                setDepositAmount(
                  availableBalance.hideDenom(true).trim(true).toString()
                );
              }
            }
          }}
          transferFee={
            new CoinPretty(originCurrency, new Dec(transferFeeMinAmount))
          }
          waitTime={waitBySourceChain(selectedSourceChainKey)}
          disabled={!userCanInteract}
          disablePanel={!!isEthTxPending || userDisconnectedWallet}
        />
        <div className="w-full md:mt-4 mt-6 flex items-center justify-center">
          <Button
            className={classNames(
              "md:w-full w-2/3 md:p-4 p-6 hover:opacity-75 rounded-2xl transition-opacity duration-300",
              { "opacity-30": isDepositAddressLoading }
            )}
            disabled={
              !userCanInteract || (!userDisconnectedWallet && amount === "")
            }
            onClick={() => {
              if (userDisconnectedWallet) ethWalletClient.enable();
              else transfer();
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
        </div>
      </>
    );
  }
);

// accommodate next/dynamic
export default AxelarTransfer;
