import { Currency } from "@keplr-wallet/types";
import { CoinPretty, Int } from "@keplr-wallet/unit";
import { useEffect, useState } from "react";

import { queryAccountBalance } from "~/integrations/ethereum/queries";
import { EthWallet } from "~/integrations/ethereum/types";

/** Use native EVM balance. */
export function useNativeBalance(
  ethWallet: EthWallet,
  originCurrency?: Currency
) {
  const [nativeBalance, setNativeBalance] = useState<Int | null>(null);

  const address = ethWallet.accountAddress;
  const sendFn = ethWallet.send;

  useEffect(() => {
    if (address) {
      queryAccountBalance(sendFn, address).then(setNativeBalance);
    }
  }, [ethWallet.chainId, address, sendFn]);

  if (!originCurrency || !nativeBalance) return;
  return new CoinPretty(originCurrency, nativeBalance);
}
