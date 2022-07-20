import { FunctionComponent, useEffect, useState } from "react";
import { observer } from "mobx-react-lite";
import { AxelarAssetTransfer, Environment } from "@axelar-network/axelarjs-sdk";
import { isAddress } from "web3-utils";
import { IBCBalance } from "../../stores/assets";
import { useStore } from "../../stores";
import { Transfer } from "../../components/complex/transfer";
import { Button } from "../../components/buttons";
import { ObservableErc20Queries } from "../ethereum/queries";
import { EthClient } from "../ethereum";
import {
  AxelarBridgeConfig,
  SourceChain,
  SourceChainCosmosChainIdMap,
} from ".";

/** Axelar-specific bridge transfer integration UI. */
const AxelarTransfer: FunctionComponent<
  {
    isWithdraw: boolean;
    client: EthClient;
    osmosisBalance: IBCBalance;
    selectedSourceChainKey: SourceChain;
  } & AxelarBridgeConfig
> = observer(
  ({
    isWithdraw,
    client,
    osmosisBalance,
    selectedSourceChainKey,
    sourceChains,
    tokenMinDenom,
  }) => {
    const { chainStore, accountStore, queriesStore } = useStore();
    const { chainId } = chainStore.osmosis;
    const { bech32Address } = accountStore.getAccount(chainId);
    const originCurrency = osmosisBalance.balance.currency.originCurrency!;
    const [erc20Queries] = useState(
      () => new ObservableErc20Queries(client.send, originCurrency)
    );
    const userErc20Queries = erc20Queries.getQueryEthHexAddress(
      client.accountAddress || ""
    );
    const erc20ContractAddress = sourceChains.find(
      (sc) => sc.id === selectedSourceChainKey
    )?.erc20ContractAddress; // TODO: if erc20Address is null, it's supposed to be a counterparty cosmos chain i.e. kujira
    const erc20Balance = erc20ContractAddress
      ? userErc20Queries.getBalance(erc20ContractAddress)
      : queriesStore
          .get(SourceChainCosmosChainIdMap[selectedSourceChainKey])
          .queryBalances.getQueryBech32Address(
            accountStore.getAccount(
              SourceChainCosmosChainIdMap[selectedSourceChainKey]
            ).bech32Address
          )
          .getBalanceFromCurrency(originCurrency);

    // custom amount validation, since `useAmountConfig` needs to query Cosmos SDK chain balances (not evm balances)
    const [amount, setAmount] = useState("");
    const [isMax, setIsMax] = useState(false);

    // chain path info whether withdrawing or depositing
    const osmosisPath = {
      address: bech32Address,
      networkName: chainStore.osmosis.chainName,
      iconUrl: "/tokens/osmo.svg",
    };
    const counterpartyPath = {
      address: client.accountAddress || "",
      networkName: selectedSourceChainKey,
      iconUrl: osmosisBalance.balance.currency.originCurrency?.coinImageUrl,
    };

    // axelar deposit address state & generation
    const [depositAddress, setDepositAddress] = useState<string | null>(null);
    useEffect(() => {
      const genAddress = async () => {
        const sdk = new AxelarAssetTransfer({
          environment: Environment.TESTNET,
        });
        try {
          if (client.accountAddress && !depositAddress) {
            console.log(
              isWithdraw ? "withdraw" : "deposit",
              `fromChain ${isWithdraw ? "osmosis" : selectedSourceChainKey}`,
              `toChain ${isWithdraw ? selectedSourceChainKey : "osmosis"}`,
              `Address ${isWithdraw ? client.accountAddress : bech32Address}`,
              tokenMinDenom
            );

            return await sdk.getDepositAddress(
              isWithdraw ? "osmosis" : selectedSourceChainKey,
              isWithdraw ? selectedSourceChainKey : "osmosis",
              isWithdraw ? client.accountAddress : bech32Address,
              "uausdc" //tokenMinDenom
            );
          }
        } catch (e) {
          console.error(e);
          //TODO add error handling generally
        }
        return null;
      };
      genAddress().then((address) => {
        if (!depositAddress) {
          setDepositAddress(address);
        }
      });
    }, []);

    const canDoDeposit = depositAddress !== null;

    console.log(depositAddress);

    return (
      <>
        <Transfer
          isWithdraw={isWithdraw}
          transferPath={[
            isWithdraw ? osmosisPath : counterpartyPath,
            undefined,
            isWithdraw ? counterpartyPath : osmosisPath,
          ]}
          currentValue={amount}
          onInput={(value) => setAmount(value)}
          availableBalance={
            isWithdraw
              ? osmosisBalance.balance
              : erc20ContractAddress
              ? erc20Balance
              : undefined
          }
          toggleIsMax={() => {
            if (isMax) {
              setAmount("0");
              setIsMax(false);
            } else {
            }
          }}
        />
        <div className="w-full md:mt-6 mt-9 flex items-center justify-center">
          <Button
            className="md:w-full w-2/3 md:p-4 p-6 hover:opacity-75 rounded-2xl"
            disabled={!canDoDeposit}
            loading={!depositAddress}
            onClick={async () => {
              try {
                if (depositAddress) {
                  console.log(
                    "addresses",
                    depositAddress,
                    isAddress(depositAddress),
                    amount
                  );
                  await client.send({
                    method: "eth_sendTransaction",
                    params: { to: depositAddress, value: amount },
                  });
                }
              } catch (e) {
                // TODO: code 4001 = User denied

                console.error(e);
              }
            }}
          >
            <h6 className="md:text-base text-lg">
              {isWithdraw ? "Withdraw" : "Deposit"}
            </h6>
          </Button>
        </div>
      </>
    );
  }
);

// accommodate next/dynamic
export default AxelarTransfer;
