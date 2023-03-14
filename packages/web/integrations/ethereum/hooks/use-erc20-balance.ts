import { Currency } from "@keplr-wallet/types";
import { CoinPretty } from "@keplr-wallet/unit";
import { useEffect, useState } from "react";

import { queryErc20Balance } from "../queries";
import { EthWallet } from "../types";

/** Use balance of arbitrary ERC20 EVM contract. */
export function useErc20Balance(
  ethWallet: EthWallet,
  memoedOriginCurrency?: Currency,
  erc20ContractAddress?: string
) {
  const [erc20Balance, setErc20Balance] = useState<CoinPretty | null>(null);

  const address = ethWallet.accountAddress;
  const sendFn = ethWallet.send;

  useEffect(() => {
    if (address && erc20ContractAddress && memoedOriginCurrency) {
      queryErc20Balance(sendFn, erc20ContractAddress, address).then((amount) =>
        setErc20Balance(new CoinPretty(memoedOriginCurrency, amount))
      );
    }
  }, [
    ethWallet.chainId,
    address,
    erc20ContractAddress,
    memoedOriginCurrency,
    sendFn,
  ]);

  return erc20Balance;
}
