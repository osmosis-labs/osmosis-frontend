import { CoinPretty } from "@keplr-wallet/unit";
import { useQuery } from "@tanstack/react-query";

import { queryErc20Balance } from "~/integrations/ethereum/queries";
import { EthWallet } from "~/integrations/ethereum/types";

/** Use balance of arbitrary ERC20 EVM contract. */
export function useErc20Balance(
  ethWallet: EthWallet | undefined,
  erc20ContractAddress?: string
) {
  const { data: erc20Balance } = useQuery({
    queryKey: ["erc20-balance", ethWallet?.chainId, erc20ContractAddress],
    queryFn: () => {
      if (!ethWallet || !ethWallet.send) return;
      if (!ethWallet.accountAddress || !erc20ContractAddress) return;

      return queryErc20Balance(
        ethWallet.send,
        erc20ContractAddress,
        ethWallet.accountAddress
      );
    },
  });

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
