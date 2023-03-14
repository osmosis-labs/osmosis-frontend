import { Currency } from "@keplr-wallet/types";
import { CoinPretty, Int } from "@keplr-wallet/unit";
import { useEffect, useState } from "react";

import { queryErc20Balance } from "../queries";
import { EthWallet } from "../types";

/** Use balance of arbitrary ERC20 EVM contract. */
export function useErc20Balance(
  ethWallet: EthWallet,
  originCurrency?: Currency,
  erc20ContractAddress?: string
) {
  const [erc20Balance, setErc20Balance] = useState<Int | null>(null);

  const address = ethWallet.accountAddress;
  const sendFn = ethWallet.send;

  useEffect(() => {
    if (address && erc20ContractAddress) {
      queryErc20Balance(sendFn, erc20ContractAddress, address).then(
        setErc20Balance
      );
    }
  }, [ethWallet.chainId, address, erc20ContractAddress, sendFn]);

  if (!originCurrency || !erc20Balance) return;
  return new CoinPretty(originCurrency, erc20Balance);
}
