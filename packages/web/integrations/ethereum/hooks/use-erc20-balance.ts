import { CoinPretty } from "@keplr-wallet/unit";
import { useEffect, useState } from "react";

import { queryErc20Balance } from "~/integrations/ethereum/queries";
import { EthWallet } from "~/integrations/ethereum/types";

/** Use balance of arbitrary ERC20 EVM contract. */
export function useErc20Balance(
  ethWallet: EthWallet | undefined,
  erc20ContractAddress?: string
) {
  const [erc20Balance, setErc20Balance] = useState<Awaited<
    ReturnType<typeof queryErc20Balance>
  > | null>(null);

  const address = ethWallet?.accountAddress;
  const sendFn = ethWallet?.send;

  useEffect(() => {
    if (!ethWallet || !sendFn) return;

    if (address && erc20ContractAddress) {
      queryErc20Balance(sendFn, erc20ContractAddress, address).then(
        (balance) => {
          setErc20Balance(balance);
        }
      );
    }
  }, [ethWallet?.chainId, address, erc20ContractAddress, sendFn, ethWallet]);

  if (!erc20Balance) return;
  return new CoinPretty(
    {
      coinDecimals: erc20Balance.decimals,
      coinMinimalDenom: erc20Balance.symbol,
      coinDenom: erc20Balance.symbol,
    },
    erc20Balance.amount
  );
}
