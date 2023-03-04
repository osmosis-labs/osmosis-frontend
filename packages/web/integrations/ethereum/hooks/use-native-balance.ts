import { Currency } from "@keplr-wallet/types";
import { CoinPretty } from "@keplr-wallet/unit";
import { useEffect, useState } from "react";

import { queryAccountBalance } from "../queries";
import { EthWallet } from "../types";

/** Use native EVM balance. */
export function useNativeBalance(
  ethWallet: EthWallet,
  memoedNativeCurrency?: Currency
) {
  const [nativeBalance, setNativeBalance] = useState<CoinPretty | null>(null);

  const address = ethWallet.accountAddress;
  const sendFn = ethWallet.send;

  useEffect(() => {
    if (address && memoedNativeCurrency) {
      queryAccountBalance(sendFn, address).then((amount) =>
        setNativeBalance(new CoinPretty(memoedNativeCurrency, amount))
      );
    }
  }, [address, memoedNativeCurrency]);

  return nativeBalance;
}
