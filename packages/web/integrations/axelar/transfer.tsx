import { FunctionComponent, useState, useEffect } from "react";
import { CoinPretty, Dec } from "@keplr-wallet/unit";
import { basicIbcTransfer } from "@osmosis-labs/stores";
import { observer } from "mobx-react-lite";
import { useFakeFeeConfig, useAmountConfig } from "../../hooks";
import { IBCBalance } from "../../stores/assets";
import { useStore } from "../../stores";
import { Transfer } from "../../components/complex/transfer";
import { Button } from "../../components/buttons";
import { displayToast, ToastType } from "../../components/alert";
import { ObservableErc20Queries } from "../ethereum/queries";
import { EthClient, transfer as erc20Transfer } from "../ethereum";
import { useDepositAddress } from "./hooks";
import {
  AxelarBridgeConfig,
  SourceChain,
  SourceChainCosmosChainIdMap,
  waitBySourceChain,
} from ".";

/** Axelar-specific bridge transfer integration UI. */
const AxelarTransfer: FunctionComponent<
  {
    isWithdraw: boolean;
    client: EthClient;
    balanceOnOsmosis: IBCBalance;
    selectedSourceChainKey: SourceChain;
    onRequestClose: () => void;
    onRequestSwitchWallet: () => void;
  } & AxelarBridgeConfig
> = observer(
  ({
    isWithdraw,
    client,
    balanceOnOsmosis,
    selectedSourceChainKey,
    onRequestClose,
    onRequestSwitchWallet,
    tokenMinDenom,
    transferFeeMinAmount,
    sourceChains,
  }) => {
    const { chainStore, accountStore, queriesStore } = useStore();
    const { chainId } = chainStore.osmosis;
    const osmosisAccount = accountStore.getAccount(chainId);
    const { bech32Address } = osmosisAccount;
    const originCurrency = balanceOnOsmosis.balance.currency.originCurrency!;
    const [erc20Queries] = useState(
      () => new ObservableErc20Queries(client.send, originCurrency)
    );
    const userErc20Queries = client.accountAddress
      ? erc20Queries.getQueryEthHexAddress(client.accountAddress)
      : undefined;
    const erc20ContractAddress = sourceChains.find(
      ({ id }) => id === selectedSourceChainKey
    )?.erc20ContractAddress;

    // if counterparty is a cosmos chain
    const counterpartyCosmosChainId: string | undefined =
      SourceChainCosmosChainIdMap[selectedSourceChainKey];
    const counterpartyCosmosAccount = counterpartyCosmosChainId
      ? accountStore.getAccount(counterpartyCosmosChainId)
      : undefined;
    const ibcConfig = sourceChains.find(
      ({ id }) => id === selectedSourceChainKey
    )?.ibcConfig;
    //    init & user approve counterparty cosmos account in Keplr
    useEffect(() => {
      counterpartyCosmosAccount?.init();
    }, [counterpartyCosmosAccount]);

    // get balance from eth contract or axelar-supported cosmos chain
    const counterpartyBal = erc20ContractAddress
      ? userErc20Queries?.getBalance(erc20ContractAddress)
      : (() => {
          if (!counterpartyCosmosChainId) {
            return;
          }

          return queriesStore
            .get(counterpartyCosmosChainId)
            .queryBalances.getQueryBech32Address(
              accountStore.getAccount(counterpartyCosmosChainId).bech32Address
            )
            .getBalanceFromCurrency(originCurrency);
        })();

    // DEPOSITING: custom amount validation, since `useAmountConfig` needs to query counterparty Cosmos SDK chain balances (not evm balances)
    const [depositAmount, setDepositAmount] = useState("");
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
      feeConfig
    );

    // chain path info whether withdrawing or depositing
    const osmosisPath = {
      address: bech32Address,
      networkName: chainStore.osmosis.chainName,
      iconUrl: "/tokens/osmo.svg",
    };
    const counterpartyPath = {
      address: client.accountAddress || "",
      networkName: selectedSourceChainKey,
      iconUrl: originCurrency.coinImageUrl,
    };

    const sourceChain = isWithdraw ? "osmosis" : selectedSourceChainKey;
    const destChain = isWithdraw ? selectedSourceChainKey : "osmosis";
    const address = isWithdraw ? client.accountAddress : bech32Address;

    /** Amount, with decimals. e.g. 1.2 USDC */
    const amount = isWithdraw ? withdrawAmountConfig.amount : depositAmount;

    const availableBalance = isWithdraw
      ? balanceOnOsmosis.balance
      : erc20ContractAddress
      ? counterpartyBal
      : undefined;

    const { depositAddress } = useDepositAddress(
      sourceChain,
      destChain,
      address,
      tokenMinDenom
    );

    const isFormLoading = depositAddress === undefined;
    const correctChainSelected = client.chainId === selectedSourceChainKey;
    const userCanInteract = !isFormLoading && correctChainSelected;
    const buttonErrorMessage = !correctChainSelected
      ? `Wrong network in ${client.displayInfo.displayName}`
      : undefined;

    return (
      <>
        <Transfer
          isWithdraw={isWithdraw}
          transferPath={[
            isWithdraw ? osmosisPath : counterpartyPath,
            { bridgeName: "Axelar", bridgeIconUrl: "/icons/axelar.svg" },
            isWithdraw ? counterpartyPath : osmosisPath,
          ]}
          selectedWalletDisplay={client.displayInfo}
          onRequestSwitchWallet={onRequestSwitchWallet}
          currentValue={amount}
          onInput={(value) =>
            isWithdraw
              ? withdrawAmountConfig.setAmount(value)
              : setDepositAmount(value)
          }
          availableBalance={availableBalance}
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
        />

        <div className="w-full md:mt-4 mt-6 flex items-center justify-center">
          <Button
            className="md:w-full w-2/3 md:p-4 p-6 hover:opacity-75 rounded-2xl"
            disabled={!userCanInteract || depositAmount === ""}
            loading={!depositAddress}
            onClick={async () => {
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
                        chainId: "axelar-dojo-1",
                        channelId: balanceOnOsmosis.destChannelId,
                      },
                      withdrawAmountConfig
                    );
                  } catch (e) {
                    // TODO: problem or rejected
                    console.error(e);
                  }
                } else {
                  // isDeposit

                  // IBC transfer to axelar from Cosmos counterparty
                  if (
                    counterpartyCosmosChainId &&
                    counterpartyCosmosAccount &&
                    ibcConfig
                  ) {
                    try {
                      await basicIbcTransfer(
                        {
                          account: counterpartyCosmosAccount,
                          chainId: counterpartyCosmosChainId,
                          channelId: ibcConfig.sourceChannelId,
                        },
                        {
                          account: depositAddress,
                          chainId: "axelar-dojo-1",
                          channelId: balanceOnOsmosis.destChannelId,
                        },
                        withdrawAmountConfig
                      );
                    } catch (e) {
                      // TODO: problem or rejected
                      console.error(e);
                    }
                  } else if (erc20ContractAddress) {
                    // erc20 transfer to deposit address on EVM
                    try {
                      await erc20Transfer(
                        client.send,
                        new CoinPretty(originCurrency, depositAmount)
                          .moveDecimalPointRight(originCurrency.coinDecimals)
                          .toCoin().amount,
                        erc20ContractAddress,
                        client.accountAddress!,
                        depositAddress
                      );
                    } catch (e: any) {
                      if (e.code === 4001) {
                        // User denied
                        displayToast(
                          {
                            message: "Transaction Failed",
                            caption: "Request rejected",
                          },
                          ToastType.ERROR
                        );
                      } else if (e.code === 4100) {
                        // assuming EVM wallet error codes are standard

                        // wallet is not logged in (but is connected)
                        displayToast(
                          {
                            message: "Action Unavailable",
                            caption: `Please log into ${client.displayInfo.displayName}`,
                          },
                          ToastType.ERROR
                        );
                        return; // don't close modal
                      } else {
                        console.error(e);
                      }
                    }
                  } else {
                    console.error(
                      "Axelar asset and/or network not configured properly."
                    );
                  }
                }
              }
              onRequestClose();
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
